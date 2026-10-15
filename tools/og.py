#!/usr/bin/env python3
# Copyright (c) 2026 geniuskey and ArtBook contributors. MIT (see ../LICENSE-MIT).
"""OG 이미지 생성: tools/og.html 을 1200×630으로 찍어 og.png(서가), color/og.png(ColorBook)에 저장한다."""
import os, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
exe = os.environ.get("CHROMIUM_PATH") or next((x for x in ("/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",) if os.path.exists(x)), None)
with sync_playwright() as pw:
    br = pw.chromium.launch(executable_path=exe) if exe else pw.chromium.launch()
    for page_id, out in (("shelf", ROOT / "og.png"), ("color", ROOT / "color/og.png")):
        pg = br.new_page(viewport={"width": 1200, "height": 630})
        pg.goto((ROOT / "tools/og.html").as_uri() + "#" + page_id, wait_until="networkidle")
        pg.wait_for_timeout(600)
        pg.screenshot(path=str(out))
        print("ok", out.relative_to(ROOT))
    br.close()
