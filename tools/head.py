#!/usr/bin/env python3
# Copyright (c) 2026 geniuskey and ArtBook contributors. MIT (see ../LICENSE-MIT).
# Derived from InsureBook/MoneyBook (https://github.com/geniuskey/insurebook).
"""장 <head> 블록·사이트맵·크레딧 생성기 (서가 전체).

각 책 폴더 <book>/chapters/<slug>.html 에는 다음 표식이 있다.
  <!--head:start {"desc": "한 문장 설명"}-->
  ... (이 사이는 스크립트가 덮어쓴다)
  <!--head:end-->
제목·장 번호·준비 여부는 <book>/book.js 의 chapters 에서 읽는다.
함께 하는 일: 서가 sitemap.xml, 책 홈(index.html) JSON-LD hasPart, shared/img/credits.js(credits.json → 전역 AB_CREDITS).
실행: python3 tools/head.py                 (전체)
      python3 tools/head.py color/overview  (그 장의 head만)
"""
import json, re, pathlib, datetime, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://art.euiyun.com/"
TODAY = datetime.date.today().isoformat()


def books():
    out = []
    for bj in sorted(ROOT.glob("*/book.js")):
        src = bj.read_text(encoding="utf-8")
        g = lambda k: (re.search(r'\b%s: "([^"]*)"' % k, src) or [None, ""])[1]
        chs = []
        for line in src.splitlines():
            m = re.search(r'\{ slug: "([\w-]+)", num: "(\d+)",(?: part: (\d+),)? title: "([^"]+)", ready: (true|false)', line)
            if m:
                chs.append(dict(slug=m[1], num=m[2], part=m[3], title=m[4], ready=m[5] == "true"))
        out.append(dict(dir=bj.parent.name, id=g("id"), title=g("title"), sub=g("sub"), tagline=g("tagline"), chapters=chs))
    return out


def head(b, c, meta):
    base = f"{SITE}{b['dir']}/"
    url = f"{base}chapters/{c['slug']}.html"
    name = f"{b['title']} · {b['sub']}"
    title = f"{c['title']} · {b['title']}"
    desc = meta["desc"]
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": ["Chapter", "LearningResource"], "@id": url + "#chapter", "name": c["title"], "headline": title,
         "description": desc, "url": url, "position": int(c["num"]), "inLanguage": "ko", "isAccessibleForFree": True,
         "learningResourceType": "인터랙티브 교재", "educationalLevel": "일반 성인", "image": base + "og.png", "dateModified": TODAY,
         "isPartOf": {"@type": "Book", "@id": base + "#book", "name": name, "url": base}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "ArtBook", "item": SITE},
            {"@type": "ListItem", "position": 2, "name": name, "item": base},
            {"@type": "ListItem", "position": 3, "name": f"{int(c['num'])}. {c['title']}", "item": url}]}]}
    e = lambda s: s.replace("&", "&amp;").replace('"', "&quot;")
    return f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<link rel="icon" type="image/svg+xml" href="../../favicon.svg">
<meta name="theme-color" content="#b5179e">
<meta property="og:type" content="article">
<meta property="og:site_name" content="ArtBook">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{base}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False, separators=(",", ":"))}</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
<link rel="stylesheet" href="../../shared/css/style.css">
<script src="../book.js"></script>
<script src="../../shared/js/art.js"></script>
<script src="../../shared/js/common.js"></script>
'''


ONLY = sys.argv[1:]
BOOKS = books()
pat = re.compile(r"(<!--head:start (\{.*?\})-->\n)(.*?)(<!--head:end-->)", re.S)
for b in BOOKS:
    for c in b["chapters"]:
        key = f"{b['dir']}/{c['slug']}"
        if ONLY and key not in ONLY:
            continue
        p = ROOT / b["dir"] / "chapters" / f"{c['slug']}.html"
        if not p.exists():
            if c["ready"]:
                print("missing", key)
            continue
        if not c["ready"]:
            print("note: file exists but ready=false", key)
        s = p.read_text(encoding="utf-8")
        m = pat.search(s)
        if not m:
            print("no marker", key); continue
        meta = json.loads(m.group(2))
        s2 = s[:m.start()] + m.group(1) + head(b, c, meta) + m.group(4) + s[m.end():]
        if s2 != s:
            p.write_text(s2, encoding="utf-8")
        print("ok", key)

if ONLY:
    sys.exit(0)

# sitemap: 서가 홈, 크레딧, 책 홈, 준비된 장
urls = [SITE, SITE + "credits.html"]
for b in BOOKS:
    # 책 홈은 @euiyun/book 빌드 규칙(하위 폴더 index.html의 canonical은 index.html까지 적는다)에 맞춘다
    urls.append(f"{SITE}{b['dir']}/index.html")
    urls += [f"{SITE}{b['dir']}/chapters/{c['slug']}.html" for c in b["chapters"] if c["ready"]]
(ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    "".join(f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod></url>\n" for u in urls) + "</urlset>\n", encoding="utf-8")
print("sitemap", len(urls), "urls")

# 책 홈 JSON-LD hasPart
for b in BOOKS:
    ip = ROOT / b["dir"] / "index.html"
    if not ip.exists():
        continue
    s = ip.read_text(encoding="utf-8")
    parts = json.dumps([{"@type": "Chapter", "name": c["title"], "position": int(c["num"]), "url": f"{SITE}{b['dir']}/chapters/{c['slug']}.html"} for c in b["chapters"] if c["ready"]], ensure_ascii=False, separators=(",", ":"))
    s2 = re.sub(r'"hasPart":\[.*?\]\}\]\}</script>', '"hasPart":' + parts + '}]}</script>', s, flags=re.S)
    s2 = re.sub(r'"dateModified":"[\d-]+"', f'"dateModified":"{TODAY}"', s2)
    if s2 != s:
        ip.write_text(s2, encoding="utf-8")
    print("index", b["dir"], "updated" if s2 != s else "unchanged")

# 크레딧: credits.json → credits.js (file:// 로 열어도 크레딧 페이지가 동작하도록)
cj = ROOT / "shared/img/credits.json"
if cj.exists():
    data = json.loads(cj.read_text(encoding="utf-8"))
    for im in data["images"]:
        f = ROOT / "shared/img" / im["file"]
        if not f.exists():
            print("credit file missing:", im["file"])
    out = ("/* 자동 생성 파일: shared/img/credits.json 을 고치고 python3 tools/head.py 를 실행한다. */\n"
           "window.AB_CREDITS = " + json.dumps(data["images"], ensure_ascii=False, indent=1) + ";\n")
    (ROOT / "shared/img/credits.js").write_text(out, encoding="utf-8")
    print("credits", len(data["images"]), "images")
