#!/usr/bin/env python3
# Copyright (c) 2026 geniuskey and ArtBook contributors. MIT (see ../LICENSE-MIT).
# Derived from InsureBook/MoneyBook (https://github.com/geniuskey/insurebook).
"""페이지 점검기 (playwright 필요: pip install playwright, 크로미움은 CHROMIUM_PATH 또는 기본 경로).

각 페이지를 넓은 화면·라이트와 좁은 화면(360px)·다크로 열어 다음을 보고한다.
  - 콘솔 오류, 가로 넘침, 조작(슬라이더·세그먼트·체크·버튼·퀴즈) 중 예외
  - 그려지지 않은 캔버스, 불러오지 못한 이미지
  - 페이지는 저장소 루트를 띄운 로컬 HTTP 서버로 연다(file://에서는 이미지 픽셀 읽기와 fetch가 막힌다)
  - 예시 그림의 색 불변: class="art"인 canvas·svg의 색이 라이트 ↔ 다크 전환에서 바뀌면 문제(UI 색만 바뀌어야 한다)
실행: python3 tools/check.py                         (서가 전체: index, credits, 각 책 홈과 준비된 장)
      python3 tools/check.py color/overview color/index index
      python3 tools/check.py color/overview --shots 폴더   (전체 페이지 스크린샷 저장)
"""
import sys, re, os, pathlib, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
args = [a for a in sys.argv[1:] if not a.startswith("--")]
shots = None
if "--shots" in sys.argv:
    raw = sys.argv[sys.argv.index("--shots") + 1]
    args.remove(raw); shots = pathlib.Path(raw); shots.mkdir(parents=True, exist_ok=True)
if not args:
    args = ["index", "credits"]
    for bj in sorted(ROOT.glob("*/book.js")):
        d = bj.parent.name
        args.append(f"{d}/index")
        args += [f"{d}/{m[0]}" for m in re.findall(r'slug: "([\w-]+)"[^\n]*ready: (true)', bj.read_text(encoding="utf-8"))]


def path_of(name):
    if name in ("index", "credits"):
        return ROOT / f"{name}.html"
    d, slug = name.split("/", 1)
    return ROOT / d / ("index.html" if slug == "index" else f"chapters/{slug}.html")


# 예시 그림 색 지문: canvas.art는 픽셀 해시, svg.art는 칠·선 색 목록
ART_PRINT = """() => {
  const h = (s) => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0).toString(16); };
  const out = {};
  document.querySelectorAll('canvas.art').forEach((c, i) => {
    try { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let s = 0, t = 0; for (let k = 0; k < d.length; k += 37) { s = (s + d[k] * (k % 251)) % 1000000007; t += d[k]; } out['canvas#' + (c.id || i)] = s + ':' + t; } catch (e) { out['canvas#' + (c.id || i)] = 'err'; }
  });
  document.querySelectorAll('svg.art').forEach((g, i) => {
    const cols = [...g.querySelectorAll('*')].map((e) => { const cs = getComputedStyle(e); return cs.fill + '|' + cs.stroke + '|' + cs.stopColor; }).join(',');
    out['svg#' + (g.id || i)] = h(cols);
  });
  return out;
}"""

POKE = """async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const el of document.querySelectorAll('input[type=range]')) {
    for (const v of [el.min, el.max, (Number(el.min) + Number(el.max)) / 2]) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }
    el.value = el.defaultValue; el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  for (const el of document.querySelectorAll('.seg button, .sim .btn, .sim input[type=checkbox], .mono-toggle')) {
    if (!el.disabled) el.click();
    await sleep(15);
  }
  // 끌 수 있는 캔버스: 가운데와 네 귀퉁이 쪽을 눌러 끈다
  for (const c of document.querySelectorAll('canvas.drag')) {
    const r = c.getBoundingClientRect();
    const fire = (type, x, y) => c.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: r.left + x, clientY: r.top + y, pointerId: 1 }));
    for (const [fx, fy] of [[0.5, 0.5], [0.1, 0.1], [0.9, 0.9], [0.2, 0.8]]) { fire('pointerdown', r.width * fx, r.height * fy); fire('pointermove', r.width * (1 - fx), r.height * (1 - fy)); fire('pointerup', r.width * (1 - fx), r.height * (1 - fy)); }
  }
  for (const q of document.querySelectorAll('.quiz-q')) { const b = q.querySelector('button.opt'); if (b && !b.disabled) b.click(); }
  await sleep(400);
  const de = document.documentElement;
  const wide = [...document.querySelectorAll('main *, section *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('.table-wrap, .formula, .katex, .ab-drawer, [data-scroll]')).slice(0, 5).map((e) => e.tagName + (e.id ? '#' + e.id : '') + '.' + String(e.className.baseVal ?? e.className).split(' ')[0]);
  return { overflow: de.scrollWidth - innerWidth, wide, sims: document.querySelectorAll('.sim').length, figs: document.querySelectorAll('figure').length,
           quiz: document.querySelectorAll('.quiz-q').length, case_: document.querySelectorAll('.casefile').length,
           tries: document.querySelectorAll('.callout.try').length, studio: document.querySelectorAll('.callout.studio').length,
           blank: [...document.querySelectorAll('canvas')].filter((c) => c.width < 10 || c.height < 10).map((c) => c.id),
           badimg: [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')) };
}"""

# file:// 로 열면 작품 이미지의 픽셀을 읽을 수 없고(교차 출처) fetch도 막히므로, 저장소 루트를 로컬 HTTP로 띄워 연다.
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{srv.server_address[1]}/"

bad = 0
with sync_playwright() as pw:
    exe = os.environ.get("CHROMIUM_PATH") or next((x for x in ("/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome") if os.path.exists(x)), None)
    br = pw.chromium.launch(executable_path=exe) if exe else pw.chromium.launch()
    for name in args:
        f = path_of(name)
        if not f.exists():
            print(f"[{name}] 파일 없음"); bad += 1; continue
        for tag, w, h, scheme in (("wide-light", 1280, 900, "light"), ("narrow-dark", 360, 740, "dark")):
            ctx = br.new_context(viewport={"width": w, "height": h}, color_scheme=scheme)
            page = ctx.new_page()
            errs = []
            page.on("console", lambda m: errs.append("console: " + m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: errs.append("exception: " + str(e)))
            page.goto(BASE + f.relative_to(ROOT).as_posix(), wait_until="load")
            # 지연 로딩 이미지도 불러와 검사·스크린샷에 포함한다
            page.evaluate("() => Promise.all([...document.querySelectorAll('img')].map((i) => { i.loading = 'eager'; return i.decode().catch(() => null); }))")
            page.wait_for_timeout(900)
            probs = []
            if tag == "wide-light":
                # 예시 그림 색 불변 검사: 라이트에서 두 번 찍어 움직이지 않는 그림만 비교한다
                a1 = page.evaluate(ART_PRINT); page.wait_for_timeout(250); a2 = page.evaluate(ART_PRINT)
                page.evaluate("() => AB.setTheme('dark')"); page.wait_for_timeout(250)
                d1 = page.evaluate(ART_PRINT)
                page.evaluate("() => AB.setTheme('light')"); page.wait_for_timeout(150)
                changed = [k for k in a1 if a1[k] == a2.get(k) and d1.get(k) != a1[k]]
                if changed: probs.append(f"다크 모드에서 예시 그림 색이 바뀜: {changed}")
                art_n = len(a1)
            if shots:  # 조작하기 전의 처음 모습을 찍는다. 아주 긴 페이지는 크로미움 한계(약 16k px)를 넘지 않게 조각으로 찍는다
                base = shots / f"{name.replace('/', '-')}-{tag}"
                total = page.evaluate("() => document.documentElement.scrollHeight")
                if total <= 14000:
                    page.screenshot(path=str(base) + ".png", full_page=True)
                else:
                    for k, y in enumerate(range(0, total, 8000)):
                        page.screenshot(path=f"{base}-part{k + 1}.png", full_page=True, clip={"x": 0, "y": y, "width": w, "height": min(8000, total - y)})
            r = page.evaluate(POKE)
            errs = [e for e in errs if "net::ERR" not in e and "Failed to load resource" not in e and "cloudflareinsights" not in e]
            probs += errs[:8]
            if r["overflow"] > 1: probs.append(f"가로 넘침 {r['overflow']}px: {r['wide']}")
            if r["blank"]: probs.append(f"그려지지 않은 캔버스: {r['blank']}")
            if r["badimg"]: probs.append(f"불러오지 못한 이미지: {r['badimg']}")
            status = "OK" if not probs else "문제"
            extra = f" art={art_n}" if tag == "wide-light" else ""
            print(f"[{name} · {tag}] {status}  sim={r['sims']} fig={r['figs']} quiz={r['quiz']} case={r['case_']} try={r['tries']} studio={r['studio']}{extra}  {f.stat().st_size // 1024} KB")
            for p_ in probs: print("    - " + p_)
            bad += len(probs)
            ctx.close()
    br.close()
srv.shutdown()
sys.exit(1 if bad else 0)
