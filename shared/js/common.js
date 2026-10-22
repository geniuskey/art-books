/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Derived from InsureBook/MoneyBook (https://github.com/geniuskey/insurebook), MIT.
   Executable code: MIT (see ../../LICENSE-MIT).
   Educational content and illustrations: CC-BY-4.0 (see ../../LICENSE.md). */
/* ==========================================================================
   ArtBook 공통 스크립트 — 전역 객체 AB
   - 레이아웃(상단바, 장 목록, 부 띠, 오른쪽 목차, 이전/다음, 테마, 검색) 자동 생성
   - 시뮬레이터 헬퍼: canvas, chart, range, seg, drag, loop, 색·글꼴·난수·포맷
   - 미술 책의 기본 도구: 흑백으로 보기(AB.mono), 전/후 비교(AB.compare), 색 견본(AB.swatch)
   책 정보는 각 책 폴더의 book.js(window.AB_BOOK)에서, 서가 정보는 shared/js/shelf.js(window.AB_SHELF)에서 읽는다.
   이 파일은 <head>에서 defer 없이 로드된다(book.js 다음). 페이지 스크립트는 </body> 직전에 둔다.
   ========================================================================== */
(function () {
  "use strict";

  const BOOK = window.AB_BOOK || null;
  const SHELF = window.AB_SHELF || { books: [] };
  const CHAPTERS = BOOK ? BOOK.chapters : [];
  const PARTS = BOOK ? BOOK.parts : [];
  const AB = (window.AB = {});
  AB.BOOK = BOOK;
  AB.SHELF = SHELF;
  AB.CHAPTERS = CHAPTERS;
  AB.PARTS = PARTS;
  AB.SITE = "https://art.euiyun.com/";

  /* ------------------------------------------------------------ math utils */
  AB.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  AB.lerp = (a, b, t) => a + (b - a) * t;
  AB.map = (x, a, b, c, d) => c + ((x - a) * (d - c)) / (b - a);
  AB.randn = function () {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  /** 숫자 포맷: 유효 자리 */
  AB.fmt = function (x, digits = 3) {
    if (!isFinite(x)) return "—";
    if (x === 0) return "0";
    const a = Math.abs(x);
    if (a >= 1e5 || a < 1e-3) return x.toExponential(digits - 1).replace("e+", "e");
    return Number(x.toPrecision(digits)).toLocaleString("en-US", { maximumFractionDigits: 6 });
  };
  /** 고정 소수: AB.fix(0.12345, 2) → "0.12" */
  AB.fix = (x, d = 1) => (isFinite(x) ? Number(x).toFixed(d) : "—");
  /** 퍼센트: AB.pct(0.345) → "34.5%" */
  AB.pct = (x, digits = 1) => (isFinite(x) ? +(x * 100).toFixed(digits) + "%" : "—");
  /** 캔버스 글꼴 문자열: AB.font(12) / AB.font(11, true) / AB.font(13, false, 700) */
  AB.font = function (px, mono, weight) {
    const cs = getComputedStyle(document.body);
    return (weight ? weight + " " : "") + px + "px " + (mono ? cs.getPropertyValue("--mono") : cs.getPropertyValue("--font"));
  };
  /** 호출을 묶어 마지막 한 번만 실행 */
  AB.debounce = function (fn, ms = 120) { let t = 0; return function () { const a = arguments; clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; };
  /** 시드 고정 난수(mulberry32): const r = AB.rng(7); r() */
  AB.rng = function (seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  /* ------------------------------------------------------------ theme */
  const themeCbs = [];
  AB.onTheme = (cb) => themeCbs.push(cb);
  AB.isDark = function () {
    const t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  /** CSS 변수 값 읽기: AB.color('accent') */
  AB.color = function (name) { return getComputedStyle(document.documentElement).getPropertyValue("--" + name).trim(); };
  /**
   * UI 색 묶음(테마에 따라 바뀐다). 축·글자·눈금·강조선처럼 "도구"의 색에만 쓴다.
   * 본문 예시 그림의 색(물감, 작품, 견본)은 테마와 상관없이 그 색 그대로 그린다.
   */
  AB.palette = function () {
    const c = AB.color;
    return {
      bg: c("canvas-bg"), text: c("text"), dim: c("text-dim"), faint: c("text-faint"),
      grid: c("grid"), axis: c("axis"), border: c("border"), surface: c("surface"),
      accent: c("accent"), accent2: c("accent-2"), ok: c("ok"), warn: c("warn"), bad: c("bad"),
      series: [c("accent"), c("accent-2"), c("warn"), c("ok"), c("bad"), c("text-dim")],
    };
  };
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    themeCbs.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } });
  }
  AB.setTheme = applyTheme;
  try { const saved = localStorage.getItem("ab-theme"); if (saved) document.documentElement.setAttribute("data-theme", saved); } catch (e) {}
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
      if (!document.documentElement.getAttribute("data-theme")) applyTheme(null);
    });
  }

  /* ------------------------------------------------------------ canvas helper */
  /**
   * HiDPI 캔버스. 폭은 부모 폭을 따르고 높이는 aspect(높이/폭) 또는 height(px)로 정한다.
   * draw(ctx, w, h)는 리사이즈·테마 변경 시 자동 호출된다. 애니메이션이면 직접 redraw()를 부른다.
   *   const cv = AB.canvas("#id", (ctx, w, h) => {...}, { aspect: 0.5, maxHeight: 420, bg: "#ffffff" });
   * bg: 배경색을 고정한다(예시 그림용). 주지 않으면 테마의 캔버스 배경(UI 색)을 쓴다.
   *     예시 그림의 색이 다크 모드에서 바뀌면 안 되는 캔버스는 bg를 주고 canvas에 class="art"를 단다(tools/check.py가 검사).
   */
  AB.canvas = function (canvas, draw, opts = {}) {
    if (typeof canvas === "string") canvas = document.querySelector(canvas);
    const ctx = canvas.getContext("2d", { willReadFrequently: !!opts.readback });
    const st = { ctx, w: 0, h: 0, canvas, dpr: 1 };
    function resize() {
      const parent = canvas.parentElement;
      const w = Math.max(200, Math.floor(opts.width || parent.clientWidth || 600));
      let h = opts.height;
      // height getter가 부모 폭 0을 읽어 0·음수·NaN을 낼 수 있다(숨은 요소, 아직 배치 전). 그때는 aspect로 정한다.
      if (!(h > 0)) h = Math.round(w * (opts.aspect || 0.5));
      if (opts.minHeight) h = Math.max(h, opts.minHeight);
      if (opts.maxHeight) h = Math.min(h, opts.maxHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      st.w = w; st.h = h; st.dpr = dpr;
      st.redraw();
    }
    st.redraw = function () {
      if (!st.w) return;
      ctx.save();
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      if (!opts.noClear) {
        ctx.clearRect(0, 0, st.w, st.h);
        ctx.fillStyle = opts.bg || AB.color("canvas-bg");
        ctx.fillRect(0, 0, st.w, st.h);
      }
      try { draw && draw(ctx, st.w, st.h); } finally { ctx.restore(); }
    };
    st.resize = resize;
    if (window.ResizeObserver) {
      let lastW = -1;
      new ResizeObserver(() => { const w = canvas.parentElement.clientWidth; if (w !== lastW) { lastW = w; resize(); } }).observe(canvas.parentElement);
    } else window.addEventListener("resize", resize);
    AB.onTheme(() => st.redraw());
    CANVASES.push(st);
    resize();
    return st;
  };
  // 웹 글꼴이 늦게 도착하면 캔버스 글자를 다시 그린다(처음에는 대체 글꼴로 그려진다).
  const CANVASES = [];
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", () => CANVASES.forEach((c) => c.redraw()));

  /** 화면에 보일 때만 도는 애니메이션 루프. fn(dt초, t초) → { start(), stop(), toggle(), running } */
  AB.loop = function (el, fn) {
    let raf = 0, last = 0, t = 0, visible = true, running = true;
    function frame(ts) {
      raf = 0;
      if (!running || !visible) return;
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
      last = ts; t += dt;
      fn(dt, t);
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && running && visible) { last = 0; raf = requestAnimationFrame(frame); } }
    if (window.IntersectionObserver && el) new IntersectionObserver((es) => { visible = es[0].isIntersecting; kick(); }).observe(el);
    kick();
    return {
      start() { running = true; kick(); },
      stop() { running = false; },
      get running() { return running; },
      toggle() { running ? (running = false) : ((running = true), kick()); return running; },
    };
  };

  /* ------------------------------------------------------------ chart helper */
  /**
   * 간단한 선 그래프. box = {x,y,w,h}(생략 시 여백 자동)
   * opts: { x:[min,max], y:[min,max], xLabel, yLabel, xTicks, yTicks, xFmt, yFmt,
   *         series:[{data:[[x,y]], color, width, dash, fill}], vlines:[{x,color,label}], hlines:[{y,color,label}],
   *         points:[{x,y,color,r,label}], bands:[{x0,x1,color}] }
   * 반환: { X(v)->px, Y(v)->px, box }
   */
  AB.chart = function (ctx, box, opts) {
    const P = AB.palette();
    const dpr = (ctx.getTransform && ctx.getTransform().a) || 1;
    const W = ctx.canvas.width / dpr, H = ctx.canvas.height / dpr;
    if (!box) box = { x: 52, y: 16, w: W - 52 - 18, h: H - 16 - 46 };
    const [x0, x1] = opts.x, [y0, y1] = opts.y;
    const X = (v) => box.x + ((v - x0) / (x1 - x0)) * box.w;
    const Y = (v) => box.y + box.h - ((v - y0) / (y1 - y0)) * box.h;
    const ticks = (a, b, n) => {
      const span = b - a, raw = span / (n || 5), mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= (n || 5) + 0.5) || raw;
      const out = []; for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + step * 1e-6; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
      return out;
    };
    const defFmt = (v) => String(Number(v.toPrecision(4)));
    const xFmt = opts.xFmt || defFmt, yFmt = opts.yFmt || defFmt;
    ctx.save();
    ctx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--mono");
    ctx.lineWidth = 1;
    (opts.bands || []).forEach((b) => { ctx.fillStyle = b.color; ctx.fillRect(X(b.x0), box.y, X(b.x1) - X(b.x0), box.h); });
    const xt = opts.xTicks || ticks(x0, x1, 6), yt = opts.yTicks || ticks(y0, y1, 5);
    ctx.strokeStyle = P.grid; ctx.fillStyle = P.dim;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    xt.forEach((v) => { const px = X(v); if (px < box.x - 1 || px > box.x + box.w + 1) return; ctx.beginPath(); ctx.moveTo(px, box.y); ctx.lineTo(px, box.y + box.h); ctx.stroke(); ctx.fillText(xFmt(v), px, box.y + box.h + 6); });
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    let yTickW = 0;
    yt.forEach((v) => { const py = Y(v); if (py < box.y - 1 || py > box.y + box.h + 1) return; ctx.beginPath(); ctx.moveTo(box.x, py); ctx.lineTo(box.x + box.w, py); ctx.stroke(); const s = yFmt(v); yTickW = Math.max(yTickW, ctx.measureText(s).width); ctx.fillText(s, box.x - 6, py); });
    ctx.strokeStyle = P.axis;
    ctx.beginPath(); ctx.moveTo(box.x, box.y); ctx.lineTo(box.x, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.stroke();
    ctx.fillStyle = P.dim; ctx.font = "12px " + getComputedStyle(document.body).getPropertyValue("--font");
    if (opts.xLabel) { ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(opts.xLabel, box.x + box.w / 2, box.y + box.h + 40); }
    if (opts.yLabel) { ctx.save(); ctx.translate(Math.max(8, box.x - Math.max(40, yTickW + 16)), box.y + box.h / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(opts.yLabel, 0, 0); ctx.restore(); }
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y - 2, box.w + 2, box.h + 4); ctx.clip();
    (opts.series || []).forEach((s, i) => {
      if (!s.data || !s.data.length) return;
      ctx.strokeStyle = s.color || P.series[i % P.series.length];
      ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      let started = false;
      s.data.forEach(([x, y]) => { if (!isFinite(y)) { started = false; return; } const px = X(x), py = Y(y); started ? ctx.lineTo(px, py) : ctx.moveTo(px, py); started = true; });
      ctx.stroke();
      if (s.fill) {
        ctx.lineTo(X(s.data[s.data.length - 1][0]), Y(Math.max(y0, 0)));
        ctx.lineTo(X(s.data[0][0]), Y(Math.max(y0, 0)));
        ctx.closePath(); ctx.fillStyle = s.fill; ctx.fill();
      }
      ctx.setLineDash([]);
    });
    (opts.vlines || []).forEach((l) => { ctx.strokeStyle = l.color || P.faint; ctx.setLineDash(l.dash || [4, 4]); ctx.lineWidth = l.width || 1.2; ctx.beginPath(); ctx.moveTo(X(l.x), box.y); ctx.lineTo(X(l.x), box.y + box.h); ctx.stroke(); ctx.setLineDash([]); if (l.label) { ctx.fillStyle = l.color || P.dim; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(l.label, X(l.x) + 4, box.y + 4); } });
    (opts.hlines || []).forEach((l) => { ctx.strokeStyle = l.color || P.faint; ctx.setLineDash(l.dash || [4, 4]); ctx.lineWidth = l.width || 1.2; ctx.beginPath(); ctx.moveTo(box.x, Y(l.y)); ctx.lineTo(box.x + box.w, Y(l.y)); ctx.stroke(); ctx.setLineDash([]); if (l.label) { ctx.fillStyle = l.color || P.dim; ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(l.label, box.x + box.w - 4, Y(l.y) - 3); } });
    (opts.points || []).forEach((p) => { ctx.fillStyle = p.color || P.accent; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r || 4, 0, Math.PI * 2); ctx.fill(); if (p.label) { ctx.fillStyle = P.text; ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillText(p.label, X(p.x) + 6, Y(p.y) - 4); } });
    ctx.restore();
    ctx.restore();
    return { X, Y, box };
  };

  /* ------------------------------------------------------------ controls */
  /** range 입력 바인딩. 출력은 id+"-out" 요소. const get = AB.range('x', v => v + '%', v => redraw()); get(), get.set(v) */
  AB.range = function (id, fmt, onInput) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    const out = document.getElementById(el.id + "-out") || document.querySelector(`output[for="${el.id}"]`);
    const update = (fire) => {
      const v = Number(el.value);
      const pct = ((v - Number(el.min || 0)) / (Number(el.max || 100) - Number(el.min || 0))) * 100;
      el.style.setProperty("--fill", pct + "%");
      if (out) out.textContent = fmt ? fmt(v) : String(v);
      if (fire && onInput) onInput(v);
    };
    el.addEventListener("input", () => update(true));
    update(false);
    const get = () => Number(el.value);
    get.set = (v) => { el.value = v; update(true); };
    get.el = el;
    return get;
  };
  /** 세그먼트 버튼: <div class="seg" id="m"><button data-value="a" class="on">A</button>…</div> → const m = AB.seg('m', v => …); m(), m.set(v) */
  AB.seg = function (id, onChange) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    const btns = [...el.querySelectorAll("button")];
    let cur = (btns.find((b) => b.classList.contains("on")) || btns[0]).dataset.value;
    const set = (v, fire = true) => {
      cur = v;
      btns.forEach((b) => { const on = b.dataset.value === v; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
      if (fire && onChange) onChange(v);
    };
    btns.forEach((b) => b.addEventListener("click", () => set(b.dataset.value)));
    set(cur, false);
    const get = () => cur;
    get.set = set;
    return get;
  };
  /** 체크박스: const c = AB.check('id', on => …); c() → true/false */
  AB.check = function (id, onChange) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    el.addEventListener("change", () => onChange && onChange(el.checked));
    const get = () => el.checked;
    get.set = (v) => { el.checked = !!v; onChange && onChange(el.checked); };
    return get;
  };
  /**
   * 캔버스 위 끌기(마우스·터치). 좌표는 CSS px.
   *   AB.drag(cv.canvas, { start(x, y, e) {}, move(x, y, e) {}, end() {}, hover(x, y, e) {} });
   * 누르는 순간 start와 move가 한 번씩 불린다. 끄는 동안 페이지 스크롤은 막힌다.
   */
  AB.drag = function (canvas, on) {
    if (typeof canvas === "string") canvas = document.querySelector(canvas);
    canvas.classList.add("drag");
    let act = false;
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    canvas.addEventListener("pointerdown", (e) => { act = true; try { canvas.setPointerCapture(e.pointerId); } catch (err) {} const [x, y] = pos(e); if (on.start) on.start(x, y, e); if (on.move) on.move(x, y, e); e.preventDefault(); });
    canvas.addEventListener("pointermove", (e) => { const [x, y] = pos(e); if (act) { if (on.move) on.move(x, y, e); } else if (on.hover) on.hover(x, y, e); });
    const up = () => { if (act) { act = false; if (on.end) on.end(); } };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  };
  /** 통계 표시: AB.stat('id', html) */
  AB.stat = function (id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  /* ------------------------------------------------------------ 색 그리기 도구 */
  const toCss = (c) => (typeof c === "string" ? c : window.ART ? ART.hex(c) : `rgb(${c.map((v) => Math.round(AB.clamp(v, 0, 1) * 255)).join(",")})`);
  AB.css = toCss;
  /** 색 위에 올릴 글자색(검정/흰색 중 WCAG 대비가 큰 쪽). c: "#hex" 또는 [r,g,b] */
  AB.textOn = function (c) {
    const rgb = typeof c === "string" ? (window.ART ? ART.parse(c) : [0.5, 0.5, 0.5]) : c;
    if (!window.ART) return "#000";
    return ART.contrast(rgb, [0, 0, 0]) >= ART.contrast(rgb, [1, 1, 1]) ? "#000000" : "#ffffff";
  };
  /**
   * 색 견본 칸. ctx에 사각형을 칠하고 아래(또는 안)에 이름·값을 적는다.
   *   AB.swatch(ctx, x, y, w, h, rgb, { label: "레몬 옐로", sub: "#f2eb00", inside: true, radius: 6, stroke: true })
   */
  AB.swatch = function (ctx, x, y, w, h, c, o = {}) {
    const r = o.radius == null ? 6 : o.radius, col = toCss(c);
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
    ctx.fillStyle = col; ctx.fill();
    if (o.stroke) { ctx.strokeStyle = o.stroke === true ? "rgba(0,0,0,0.18)" : o.stroke; ctx.lineWidth = 1; ctx.stroke(); }
    if (o.label || o.sub) {
      if (o.inside) {
        ctx.fillStyle = AB.textOn(c); ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = AB.font(o.size || 12, false, 600);
        ctx.fillText(o.label || "", x + w / 2, y + h / 2 - (o.sub ? 8 : 0));
        if (o.sub) { ctx.font = AB.font((o.size || 12) - 1, true); ctx.fillText(o.sub, x + w / 2, y + h / 2 + 9); }
      } else {
        ctx.fillStyle = o.color || AB.color("text"); ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.font = AB.font(o.size || 12, false, 600);
        if (o.label) ctx.fillText(o.label, x + w / 2, y + h + 6);
        if (o.sub) { ctx.fillStyle = o.subColor || AB.color("text-dim"); ctx.font = AB.font((o.size || 12) - 1, true); ctx.fillText(o.sub, x + w / 2, y + h + (o.label ? 22 : 6)); }
      }
    }
    ctx.restore();
  };
  /** 끌 수 있는 손잡이(원) 그리기: AB.handle(ctx, x, y, { r, fill, ring }) */
  AB.handle = function (ctx, x, y, o = {}) {
    const r = o.r || 8;
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = o.fill ? toCss(o.fill) : "#ffffff"; ctx.fill();
    ctx.lineWidth = o.width || 2.5; ctx.strokeStyle = o.ring || "#111111"; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r + 2.5, 0, Math.PI * 2); ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.stroke();
    ctx.restore();
  };
  /** 이미지 불러오기: AB.loadImage(src).then(img => …) */
  AB.loadImage = (src) => new Promise((res, rej) => { const im = new Image(); im.decoding = "async"; im.onload = () => res(im); im.onerror = rej; im.src = src; });
  /** 이미지를 가로 w px로 줄여 ImageData를 얻는다(색 추출·분석용) */
  AB.imageData = function (img, w = 160) {
    const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
    return x.getImageData(0, 0, w, h);
  };

  /* ------------------------------------------------------------ 흑백으로 보기 */
  // 선형광에서 Rec.709 휘도(Y)만 남기는 SVG 필터. 결과 회색은 원래 색과 상대 휘도·CIELAB L*가 같다.
  // CSS의 grayscale()은 감마 인코딩 값에 계수를 곱해 명도가 조금 틀어지므로 쓰지 않는다.
  function ensureMonoFilter() {
    if (document.getElementById("ab-luma")) return;
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", "0"); s.setAttribute("height", "0"); s.setAttribute("aria-hidden", "true");
    s.style.position = "absolute";
    s.innerHTML = '<filter id="ab-luma" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"/></filter>';
    document.body.appendChild(s);
  }
  /** 요소(들)를 흑백(같은 명도의 회색)으로 보이게 한다. AB.mono(el, true|false|undefined=토글) → 현재 상태 */
  AB.mono = function (el, on) {
    ensureMonoFilter();
    const els = typeof el === "string" ? [...document.querySelectorAll(el)] : [].concat(el);
    let state = false;
    els.forEach((e) => { state = on == null ? !e.classList.contains("ab-mono") : !!on; e.classList.toggle("ab-mono", state); });
    return state;
  };
  // 시뮬레이터 머리와 작품 그림(.art-figure)에 "흑백" 토글을 자동으로 붙인다. data-mono="off"로 끈다.
  function addMonoToggles() {
    document.querySelectorAll(".sim, figure.art-figure").forEach((box) => {
      if (box.dataset.mono === "off" || box.querySelector(".mono-toggle")) return;
      const target = box.classList.contains("sim") ? box.querySelector(".sim-view") : box.querySelector(".art-frame") || box;
      if (!target) return;
      const b = document.createElement("button");
      b.type = "button"; b.className = "mono-toggle"; b.setAttribute("aria-pressed", "false");
      b.title = "흑백으로 보기: 같은 명도의 회색으로 바꿔 명도만 비교한다";
      b.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg><span>흑백</span>';
      b.addEventListener("click", () => { const s = AB.mono(target); b.setAttribute("aria-pressed", s); b.classList.toggle("on", s); });
      const head = box.querySelector(".sim-head");
      if (head) head.appendChild(b); else { b.classList.add("floating"); (box.querySelector(".art-frame") || box).appendChild(b); }
    });
  }

  /* ------------------------------------------------------------ 전/후 비교 */
  /**
   * 전/후 비교. 같은 크기의 두 층(.cmp-a 전, .cmp-b 후)을 겹쳐 놓고 세로 경계선을 끌어 비교한다.
   *   <div class="compare" id="c"><div class="cmp-a">…</div><div class="cmp-b">…</div></div>
   *   const c = AB.compare("#c", { labels: ["원본", "흑백"], pos: 0.5, onMove(p) {} }); c.set(0.3); c.pos
   * 층 안에는 canvas, img, svg 무엇이든 둘 수 있다. 키보드(←→)로도 움직인다.
   */
  AB.compare = function (el, o = {}) {
    if (typeof el === "string") el = document.querySelector(el);
    const b = el.querySelector(".cmp-b");
    let pos = o.pos == null ? 0.5 : o.pos;
    const bar = document.createElement("div");
    bar.className = "cmp-bar"; bar.tabIndex = 0; bar.setAttribute("role", "slider");
    bar.setAttribute("aria-label", "비교 경계선"); bar.setAttribute("aria-valuemin", "0"); bar.setAttribute("aria-valuemax", "100");
    bar.innerHTML = '<span class="cmp-knob" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M9 6l-5 6 5 6M15 6l5 6-5 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
    el.appendChild(bar);
    const labs = o.labels || ["전", "후"];
    const la = document.createElement("span"), lb = document.createElement("span");
    la.className = "cmp-label a"; lb.className = "cmp-label b"; la.textContent = labs[0]; lb.textContent = labs[1];
    el.append(la, lb);
    function set(p) {
      pos = AB.clamp(p, 0, 1);
      b.style.clipPath = `inset(0 0 0 ${pos * 100}%)`;
      bar.style.left = pos * 100 + "%";
      bar.setAttribute("aria-valuenow", Math.round(pos * 100));
      la.style.opacity = pos < 0.12 ? 0 : 1; lb.style.opacity = pos > 0.88 ? 0 : 1;
      if (o.onMove) o.onMove(pos);
    }
    let act = false;
    const fromEvent = (e) => { const r = el.getBoundingClientRect(); set((e.clientX - r.left) / r.width); };
    el.addEventListener("pointerdown", (e) => { if (e.target.closest("button, a, input")) return; act = true; try { el.setPointerCapture(e.pointerId); } catch (err) {} fromEvent(e); e.preventDefault(); });
    el.addEventListener("pointermove", (e) => { if (act) fromEvent(e); });
    const up = () => (act = false);
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    bar.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") { set(pos - 0.05); e.preventDefault(); } else if (e.key === "ArrowRight") { set(pos + 0.05); e.preventDefault(); } });
    set(pos);
    return { set, get pos() { return pos; }, labels(a, c) { la.textContent = a; lb.textContent = c; } };
  };

  /* ------------------------------------------------------------ layout build */
  const ICON_MENU = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
  const ICON_MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
  const ICON_SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
  // 서가 로고: 세 원이 겹친 팔레트(로고는 브랜드 그림이라 테마와 상관없이 같은 색이다)
  const LOGO = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="#1d1b26"/><g style="mix-blend-mode:screen"><circle cx="12.2" cy="13" r="6.4" fill="#e8384f"/><circle cx="19.8" cy="13" r="6.4" fill="#2bb673"/><circle cx="16" cy="19.4" r="6.4" fill="#3d6bf5"/></g></svg>`;

  function build() {
    const body = document.body;
    const inChapter = !!body.dataset.chapter;
    // root: 책 폴더(또는 서가 루트)까지의 상대 경로, shelfRoot: 서가 루트까지의 상대 경로
    const root = body.dataset.root != null ? body.dataset.root : inChapter ? "../" : "";
    const shelfRoot = body.dataset.shelf != null ? body.dataset.shelf : BOOK ? root + "../" : root;
    const curSlug = body.dataset.chapter || "";
    const href = (slug) => (slug ? `${root}chapters/${slug}.html` : `${root}index.html`);
    // 포털의 책 ID는 책 하나에 하나다. 서가 공통 페이지(첫 화면, 크레딧)는 특정 책이 아니므로 책 정보 없이 연결한다.
    const feedbackUrl = BOOK
      ? "https://books.euiyun.com/feedback.html?book=" + encodeURIComponent(BOOK.portalId) + "&page=" + encodeURIComponent(location.href)
      : "https://books.euiyun.com/feedback.html";
    const ready = (c) => c && c.ready !== false;

    ensureMonoFilter();
    if (!document.querySelector('link[rel="icon"]')) { const fi = document.createElement("link"); fi.rel = "icon"; fi.type = "image/svg+xml"; fi.href = shelfRoot + "favicon.svg"; document.head.appendChild(fi); }

    // top bar
    const bar = document.createElement("header");
    bar.className = "ab-topbar";
    const logoName = BOOK ? `${BOOK.title} <small>${BOOK.sub}</small>` : `ArtBook <small>미술·시각 디자인 교과서</small>`;
    bar.innerHTML = `
      <div class="book-nav-left">
        ${BOOK ? `<button class="ab-btn icon" id="ab-menu" aria-label="장 목록">${ICON_MENU}</button>` : ""}
        <a class="ab-logo" href="${BOOK ? href("") : shelfRoot + "index.html"}">${LOGO}<span>${logoName}</span></a>
      </div>
      ${BOOK ? `<div class="book-search"><svg class="book-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input type="search" aria-label="이 책의 장, 절, 시뮬레이터, 그림 검색" placeholder="이 책 검색" autocomplete="off"><div class="book-search-results" aria-live="polite"></div></div>` : ""}
      <div class="book-nav-right">
        ${BOOK ? `<a class="ab-btn shelf-link" href="${shelfRoot}index.html" title="ArtBook 서가"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18M5 20V9M9.5 20V6M14 20v-9M18.5 20V4"/></svg><span>서가</span></a>` : ""}
        <a class="ab-btn series-link" href="https://books.euiyun.com/" aria-label="전체 책 보기" title="전체 책 보기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5h6v14H4zM10 5.5h6v14h-6zM17 7l3-1 2 13-3 1z"/></svg><span>전체 책</span></a>
        <a class="ab-btn icon feedback-button" href="${feedbackUrl}" target="_blank" rel="noopener" aria-label="독자 의견 보내기" title="독자 의견 보내기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2z"/><path d="M8 9h8M8 13h5"/></svg></a>
        <button class="ab-btn icon" id="ab-theme" aria-label="테마 전환"></button>
      </div>
      <div class="ab-progress" id="ab-progress"></div>`;
    body.prepend(bar);

    // search (책 안에서만)
    const search = bar.querySelector(".book-search");
    if (search) {
      const searchInput = search.querySelector("input");
      const searchResults = search.querySelector(".book-search-results");
      const closeSearch = () => { search.classList.remove("open"); searchResults.replaceChildren(); };
      let detailEntries = [], detailsLoaded = false, detailPromise;
      const loadDetails = () => {
        if (detailPromise) return detailPromise;
        detailPromise = Promise.all(CHAPTERS.filter(ready).map(async (chapter) => {
          try {
            const response = await fetch(href(chapter.slug));
            if (!response.ok) return [];
            const doc = new DOMParser().parseFromString(await response.text(), "text/html");
            const main = doc.querySelector("main.chapter");
            if (!main) return [];
            // 배포물의 수식은 빌드가 렌더링해 두므로 TeX 원문으로 되돌려 검색어와 맞춘다.
            main.querySelectorAll(".katex").forEach((k) => k.replaceWith(k.querySelector("annotation")?.textContent || k.textContent));
            const entries = [];
            [...main.querySelectorAll("section > h2")].forEach((h, i) => entries.push({ type: "절", title: h.textContent.trim(), chapter, hash: h.parentElement.id || `s${i + 1}` }));
            [...main.querySelectorAll(".sim")].filter((s) => s.querySelector(".sim-head h3")).forEach((s, i) => entries.push({ type: "시뮬레이터", title: s.querySelector(".sim-head h3").textContent.trim(), chapter, hash: s.id || `search-sim-${i + 1}` }));
            [...main.querySelectorAll("figure")].filter((f) => f.querySelector("figcaption")).forEach((f, i) => entries.push({ type: "그림", title: f.querySelector("figcaption").textContent.replace(/\s+/g, " ").trim().slice(0, 140), chapter, hash: f.id || `search-fig-${i + 1}` }));
            return entries;
          } catch (error) { return []; }
        })).then((parts) => { detailEntries = parts.flat(); detailsLoaded = true; renderSearch(); });
        return detailPromise;
      };
      function renderSearch() {
        const words = searchInput.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
        searchResults.replaceChildren();
        if (!words.length) { closeSearch(); return; }
        const has = (v) => words.every((w) => v.toLocaleLowerCase().includes(w));
        const chapterMatches = CHAPTERS.filter(ready).filter((c) => has([c.num, c.title, c.desc, ...(c.tags || [])].join(" "))).map((c) => ({ type: "장", title: c.title, chapter: c, hash: "" }));
        const detail = detailEntries.filter((e) => has(e.title));
        const matches = [...chapterMatches.slice(0, 4), ...detail.filter((e) => e.type === "절").slice(0, 5), ...detail.filter((e) => e.type === "시뮬레이터").slice(0, 4), ...detail.filter((e) => e.type === "그림").slice(0, 4)];
        matches.forEach((e) => {
          const a = document.createElement("a");
          a.href = href(e.chapter.slug) + (e.hash ? `#${e.hash}` : "");
          const t = document.createElement("strong"); t.textContent = e.title;
          const c = document.createElement("small"); c.textContent = `${e.chapter.num} · ${e.chapter.title} · ${e.type}`;
          a.append(t, c); searchResults.appendChild(a);
        });
        const p = document.createElement("p");
        if (detailPromise && !detailsLoaded) { p.textContent = "절·시뮬레이터·그림 목록을 불러오는 중…"; searchResults.appendChild(p); }
        else if (!matches.length) { p.textContent = "검색 결과가 없습니다"; searchResults.appendChild(p); }
        search.classList.add("open");
      }
      searchInput.addEventListener("input", () => { if (searchInput.value.trim()) loadDetails(); renderSearch(); });
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { closeSearch(); searchInput.blur(); }
        else if (e.key === "ArrowDown") { const f = searchResults.querySelector("a"); if (f) { e.preventDefault(); f.focus(); } }
        else if (e.key === "Enter") { const f = searchResults.querySelector("a"); if (f) { e.preventDefault(); f.click(); } }
      });
      searchResults.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { closeSearch(); searchInput.focus(); }
        else if (e.key === "ArrowDown" || e.key === "ArrowUp") { const ls = [...searchResults.querySelectorAll("a")]; const n = ls.indexOf(document.activeElement) + (e.key === "ArrowDown" ? 1 : -1); e.preventDefault(); (ls[n] || searchInput).focus(); }
      });
      document.addEventListener("pointerdown", (e) => { if (!search.contains(e.target)) closeSearch(); });
    }

    // drawer (장 목록)
    if (BOOK) {
      const drawer = document.createElement("nav");
      drawer.className = "ab-drawer";
      drawer.setAttribute("aria-label", "장 목록");
      const item = (c) => ready(c)
        ? `<li><a href="${href(c.slug)}" class="${c.slug === curSlug ? "active" : ""}"><span class="num">${c.num}</span><span>${c.title}</span></a></li>`
        : `<li><span class="soon"><span class="num">${c.num}</span><span>${c.title}</span><em>준비 중</em></span></li>`;
      let html = `<h4>${BOOK.title} · ${BOOK.sub}</h4><ul class="ab-chlist"><li><a href="${href("")}" class="${curSlug ? "" : "active"}"><span class="num">00</span><span>책 홈</span></a></li>`;
      let lastPart = "none";
      CHAPTERS.forEach((c) => {
        const p = c.part == null ? null : c.part;
        if (p !== lastPart && p != null) html += `<li class="part">${PARTS[p].name} <small>${PARTS[p].en}</small></li>`;
        else if (p == null && lastPart != null && lastPart !== "none") html += `<li class="part">마무리</li>`;
        lastPart = p;
        html += item(c);
      });
      html += `</ul><a class="drawer-shelf" href="${shelfRoot}index.html">← ArtBook 서가로</a>`;
      drawer.innerHTML = html;
      const backdrop = document.createElement("div");
      backdrop.className = "ab-drawer-backdrop";
      body.append(backdrop, drawer);
      const toggleDrawer = (o) => body.classList.toggle("drawer-open", o);
      bar.querySelector("#ab-menu").addEventListener("click", () => toggleDrawer(true));
      backdrop.addEventListener("click", () => toggleDrawer(false));
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleDrawer(false); });
    }

    // theme toggle
    const tbtn = bar.querySelector("#ab-theme");
    const setIcon = () => (tbtn.innerHTML = AB.isDark() ? ICON_SUN : ICON_MOON);
    setIcon();
    tbtn.addEventListener("click", () => {
      const next = AB.isDark() ? "light" : "dark";
      try { localStorage.setItem("ab-theme", next); } catch (e) {}
      applyTheme(next); setIcon();
    });
    AB.onTheme(setIcon);

    // progress
    const prog = bar.querySelector("#ab-progress");
    const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%"; };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    // chapter page extras
    const main = document.querySelector("main.chapter");
    if (main) {
      [...main.querySelectorAll(".sim")].filter((s) => s.querySelector(".sim-head h3")).forEach((s, i) => { if (!s.id) s.id = `search-sim-${i + 1}`; });
      [...main.querySelectorAll("figure")].filter((f) => f.querySelector("figcaption")).forEach((f, i) => { if (!f.id) f.id = `search-fig-${i + 1}`; });
      if (/^#(?:s\d+|search-(?:sim|fig)-)/.test(location.hash)) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
      // 부 띠
      const curCh = CHAPTERS.find((c) => c.slug === curSlug);
      const hero = main.querySelector(".chapter-hero");
      if (hero && PARTS.length) {
        const first = (i) => CHAPTERS.find((c) => c.part === i);
        const strip = document.createElement("nav");
        strip.className = "ab-stages";
        strip.style.setProperty("--n", PARTS.length);
        strip.setAttribute("aria-label", "책의 부");
        strip.innerHTML = PARTS.map((st, i) => {
          const f = first(i), cur = curCh && curCh.part === i;
          const inner = `<b>${st.name}</b><small>${st.en}</small>`;
          return ready(f) ? `<a href="${href(f.slug)}" class="${cur ? "cur" : ""}"${cur ? ' aria-current="step"' : ""}>${inner}</a>` : `<span class="${cur ? "cur" : ""}">${inner}</span>`;
        }).join("");
        hero.after(strip);
      }
      // numbered h2 + TOC
      const layout = document.createElement("div");
      layout.className = "ab-layout";
      main.parentNode.insertBefore(layout, main);
      layout.appendChild(main);
      const toc = document.createElement("aside");
      toc.className = "ab-toc";
      const h2s = [...main.querySelectorAll("section > h2")];
      let n = 0;
      toc.innerHTML = "<h4>ON THIS PAGE</h4>" + h2s.map((h, i) => {
        const sec = h.parentElement;
        if (!sec.id) sec.id = "s" + (i + 1);
        const numbered = !sec.classList.contains("keypoints") && !sec.classList.contains("quiz-sec") && !sec.hasAttribute("data-nonum");
        if (numbered && !h.querySelector(".h-num")) { n++; h.insertAdjacentHTML("afterbegin", `<span class="h-num">${String(n).padStart(2, "0")}</span>`); }
        // 제목 텍스트를 쓰되, 빌드가 렌더링한 수식은 마크업 그대로 옮긴다.
        const label = [...h.childNodes].filter((node) => !node.classList?.contains("h-num"))
          .map((node) => (node.querySelector?.(".katex") ? node.outerHTML : node.textContent)).join("").trim();
        return `<a href="#${sec.id}">${label}</a>`;
      }).join("");
      layout.appendChild(toc);
      const links = [...toc.querySelectorAll("a")];
      if (window.IntersectionObserver && h2s.length) {
        const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)); }); }, { rootMargin: "-20% 0px -70% 0px" });
        h2s.forEach((h) => io.observe(h.parentElement));
      }
      // pager
      const idx = CHAPTERS.findIndex((c) => c.slug === curSlug);
      const prev = idx > 0 ? CHAPTERS[idx - 1] : null;
      const next = idx >= 0 && idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;
      const pager = document.createElement("nav");
      pager.className = "ab-pager";
      const link = (c, cls, label) => ready(c) ? `<a class="${cls}" href="${href(c.slug)}"><small>${label}</small>${c.title}</a>` : `<span class="${cls} soon"><small>${label} · 준비 중</small>${c.title}</span>`;
      pager.innerHTML =
        (prev ? link(prev, "prev", `← 이전 · ${prev.num}`) : `<a class="prev" href="${href("")}"><small>← 책 홈</small>${BOOK ? BOOK.title + " · " + BOOK.sub : "홈"}</a>`) +
        (next ? link(next, "next", `다음 · ${next.num} →`) : "");
      layout.after(pager);
    }

    // footer
    const foot = document.createElement("footer");
    foot.className = "ab-foot";
    const note = (BOOK && BOOK.footer) || SHELF.footer || "";
    foot.innerHTML = `${BOOK ? BOOK.title + " — " + BOOK.tagline : "ArtBook — 보고, 만지고, 그려 보며 배우는 미술·시각 디자인 교과서"}<br>${note}<br>
      © 2026 geniuskey 및 ArtBook 기여자 · 콘텐츠 <a rel="license" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · 코드 <a href="${shelfRoot}LICENSE-MIT">MIT</a> · <a href="${shelfRoot}LICENSE.md">라이선스 안내</a> · <a href="${shelfRoot}credits.html">이미지 크레딧</a> · <a href="${feedbackUrl}" target="_blank" rel="noopener">독자 의견</a>`;
    body.appendChild(foot);

    // quiz
    document.querySelectorAll(".quiz-q").forEach((q) => {
      const opts = [...q.querySelectorAll("button.opt")];
      opts.forEach((b) => b.addEventListener("click", () => {
        opts.forEach((o) => { o.disabled = true; if (o.hasAttribute("data-correct")) o.classList.add("right"); });
        if (!b.hasAttribute("data-correct")) b.classList.add("wrong");
        q.classList.add("done");
        q.dispatchEvent(new CustomEvent("answered", { bubbles: true, detail: { correct: b.hasAttribute("data-correct") } }));
      }));
    });

    addMonoToggles();

    // KaTeX
    const renderMath = () => {
      if (window.renderMathInElement) renderMathInElement(document.body, { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }], throwOnError: false, ignoredClasses: ["no-math"] });
    };
    if (window.renderMathInElement) renderMath();
    else window.addEventListener("load", renderMath);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();

// 시뮬레이터 바로가기 링크: 각 시뮬레이터 제목 옆에 # 링크를 단다.
(function () {
  function addSimulatorLinks() {
    document.querySelectorAll(".sim[id] > .sim-head").forEach((head) => {
      if (head.querySelector(".sim-link")) return;
      const link = document.createElement("a");
      link.className = "sim-link"; link.href = "#" + head.parentElement.id; link.textContent = "#";
      link.title = "이 시뮬레이터로 가는 링크"; link.setAttribute("aria-label", "이 시뮬레이터로 가는 링크");
      const mono = head.querySelector(".mono-toggle");
      mono ? head.insertBefore(link, mono) : head.appendChild(link);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addSimulatorLinks, { once: true });
  else addSimulatorLinks();
})();

// Series glossary tooltips (same runtime across independently deployed books).
(function () {
  const base = new URL(".", document.currentScript.src);
  const script = document.createElement("script");
  script.src = new URL("glossary-tooltips.js", base).href;
  document.head.append(script);
})();
