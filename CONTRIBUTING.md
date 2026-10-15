# ArtBook 집필 가이드

ArtBook은 **보고, 만지고, 그려 보며 배우는 미술·시각 디자인 교과서** 서가다. euiyun 책 시리즈(https://books.euiyun.com)의 다른 책처럼 빌드 과정이 없는 한국어 인터랙티브 정적 사이트이지만, 책마다 저장소를 따로 두지 않고 **한 저장소(모노레포)에 여러 권**을 둔다.

- 서가 주소: `https://artbook.euiyun.com/` · 책 한 권: `https://artbook.euiyun.com/{topic}/` (첫 권 `/color/`)
- 여기서 "디자인"은 공학 설계가 아니라 미술과 시각 디자인(색, 형태, 구도, 드로잉, 타이포그래피, 미술사)이다.
- 레이아웃·헬퍼 코드는 같은 시리즈의 [InsureBook](https://github.com/geniuskey/insurebook)(그 뿌리는 MoneyBook)에서 가져왔다. 전역 `IB`/`INS`는 여기서 `AB`(공통 UI)/`ART`(공통 계산 엔진)다.

이 문서의 앞부분(원칙, 이미지와 저작권, 계산 엔진, 구조, 컴포넌트)은 **서가 공통**이고, 뒷부분의 "책별 절"은 책마다 하나씩 둔다.

## 기여물의 라이선스
실행 코드는 MIT, 본문·그림·문제·해설 등 교육 콘텐츠는 CC BY 4.0. 작품 이미지는 각 소장처의 표시(공공 도메인, CC0)를 따른다. 구분은 [라이선스 안내](LICENSE.md)를 따른다.

---

## 1. 서가 구조

```
artbook/
  index.html              서가 첫 화면: 책 목록(공개/계획)과 책별 표지 모티프
  credits.html            서가 전체의 작품 이미지 크레딧(shared/img/credits.json에서 자동 생성)
  shared/css/style.css    모든 책 공통 스타일(라이트/다크 토큰, 컴포넌트)
  shared/js/common.js     공통 UI(전역 AB): 상단바·장 목록·검색·목차·이전/다음·테마·퀴즈·KaTeX,
                          canvas·chart·range·seg·check·drag·loop, 흑백 보기(AB.mono), 전/후 비교(AB.compare), 색 견본(AB.swatch)
  shared/js/art.js        공통 계산 엔진(전역 ART). node에서도 require 된다
  shared/js/shelf.js      서가 목록(전역 AB_SHELF): 책 순서·경로·상태·표지 모티프
  shared/js/covers.js     서가 표지 그림(전역 AB_COVERS)
  shared/img/             공공 도메인 작품 이미지(WebP) + credits.json(+ 자동 생성 credits.js)
  tools/head.py           장 <head>·사이트맵·책 홈 JSON-LD·credits.js 생성기
  tools/check.py          페이지 점검기(콘솔 오류, 가로 넘침, 조작 중 예외, 이미지, 다크 모드 예시 색 불변)
  tools/test-art.cjs      계산 엔진 검산(표준·논문 참값 대조)
  color/                  첫 권 ColorBook
    book.js               책 정보(전역 AB_BOOK): 제목, 부, 장 목록(ready 표시), 바닥글 문구
    book.json             포털 등록용 메타데이터
    index.html            책 홈
    chapters/<slug>.html  장 본문
    og.png                책 공유 이미지
  composition/ …          다음 권들(계획)
```

- **책 폴더 안에서는 상대 경로만 쓴다.** 공통 자원은 책 홈에서 `../shared/`, 장에서 `../../shared/`로 부른다. 같은 책의 다른 장은 `<a href="contrast.html">8장</a>`, 다른 책은 `../composition/chapters/balance.html`처럼 상대 경로로 링크한다. 나중에 한 권을 따로 떼어 내도 경로만 바꾸면 되게 한다.
- 로컬 실행: 저장소 루트에서 `python3 -m http.server 8000` → http://localhost:8000/ (책은 `/color/`). `file://`로 열어도 대부분 동작하도록 classic script만 쓴다(ES module 금지). 단, 작품 이미지의 픽셀을 읽는 시뮬레이터와 검색은 서버로 열어야 동작한다.
- 새 책을 시작할 때: `shared/js/shelf.js`의 상태를 `writing`으로 바꾸고, `color/`를 본보기로 `{topic}/book.js`, `book.json`, `index.html`, `chapters/`를 만든다. 책 고유의 강조색이 필요하면 `shared/css/style.css`에 `:root[data-book="{topic}"]` 블록(라이트·다크 모두)을 추가한다.

## 2. 원칙

- **한국어**, 평서문 "~다", 이모지 금지. 용어는 처음 나올 때 `<span class="term">보색</span><span class="en">(Complementary color)</span>`처럼 쓰고 한 문장으로 풀어 준다.
- **만져 보며 배우기**(Bartosz Ciechanowski의 글이 본보기). 개념 하나에 조작 가능한 그림 하나.
  - 한 시뮬레이터는 **한 가지**만 보여 준다. 슬라이더 1~3개, 장마다 5~8개, 장 끝에 큰 종합 시뮬레이터 하나.
  - 캔버스 위 직접 끌기(`AB.drag`)를 적극적으로 쓴다(색상환 위 점, 소실점, 광원, 그림 위 3분할 격자, 배경 위의 견본). 끌 수 있는 것에는 손잡이(`AB.handle`)를 그린다.
  - 글은 시뮬레이터 바로 앞에서 "무엇을 움직여 볼지"를, 바로 뒤에서 "무엇을 봤는지"를 말한다. `.sim-note`의 "해볼 것: ① … ② … ③ …"에 모델의 가정을 괄호로 덧붙인다.
- **눈으로 비교하게 만든다.** 미술은 설명보다 비교가 빠르다. 같은 그림을 두 조건으로 나란히 놓는 **전/후 비교**(`AB.compare`)와 **흑백으로 보기**를 모든 책의 기본 도구로 둔다. 흑백 토글은 모든 `.sim`의 머리와 `figure.art-figure`에 `common.js`가 자동으로 붙인다(필요 없으면 `data-mono="off"`). 흑백은 선형광의 휘도만 남기는 SVG 필터라서 원래 색과 L*가 같은 회색이 된다.
- **규칙이 깨지는 순간도 보여 준다.** 3분할·황금비·색 조화 공식은 출발점일 뿐이다. 값을 끝까지 밀었을 때 어색해지는 모습과, 규칙을 깨고도 좋은 작품을 함께 보여 준다.
- **손으로 해 보기.** 화면 실습만으로 끝내지 않고, 장마다 종이와 연필·물감으로 해 볼 과제를 `.callout.try`(직접 해 보기)로 하나 이상 둔다.
- 순서: 일상의 질문(또는 그림 한 장) → 조작 가능한 그림 → 원리(필요하면 수식, KaTeX, 장마다 0~2개) → 시뮬레이터 → 실제 작품·디자인 사례 → 작업실 노트 → 이어지는 케이스 → 핵심 정리 → 확인 퀴즈(4문항, 정답 위치 섞기).
- 콜아웃: `.callout.studio`(작업실 노트: 현장 작가·디자이너의 실무 요령), `.callout.try`(직접 해 보기), `.callout.deep`(심화: 지각 과학·광학), `.callout.warn`(주의). 첫 `<strong>`이 제목이고 라벨은 CSS가 붙인다.
- **근거 없는 통설을 사실로 쓰지 않는다.** "빨강은 식욕을 돋운다", "파랑은 신뢰를 준다" 같은 색채 심리 주장, 황금비가 모든 명작에 숨어 있다는 주장은 연구 근거의 수준을 밝히고 "통설", "연구 결과가 엇갈린다"로 쓴다. 지어낸 연구·통계·인용을 쓰지 않는다. 인용은 출처(저자, 책·논문, 연도)를 밝히고, 원문을 확인하지 못한 문장은 직접 인용하지 않고 요약한다.
- **취향을 정답으로 만들지 않는다.** "좋은 색", "나쁜 구도"라고 단정하지 않고 "무엇을 전하려는가에 맞는가"로 판단하게 한다. 서양 미술만이 아니라 한국·동아시아 미술(오방색, 여백, 수묵의 농담)도 같은 무게로 다룬다.
- 특정 브랜드 로고, 상업 디자인, 현존 작가의 작품을 복제하지 않는다. 사례가 필요하면 "가상의 카페 포스터"처럼 직접 만든 예시를 쓴다.
- 화면 색은 모니터마다 다르다는 점을 ColorBook 1장에서 한 번 밝혔다. 색 정확도가 중요한 실습에는 짧게 다시 알린다.
- 외부 라이브러리는 KaTeX만(글꼴은 Pretendard, JetBrains Mono CDN). 그림은 인라인 SVG/canvas로 직접 그린다.
- **색 규칙(다크 모드).** UI 색(글자·테두리·축·눈금·강조)은 CSS 변수와 `AB.palette()`로 칠해 테마를 따른다. **본문 예시 그림의 색(물감, 작품, 견본, 표지)은 테마와 상관없이 그 색 그대로** 칠한다. 예시 그림 캔버스는 `AB.canvas(…, { bg: "#fbfaf7" })`처럼 배경을 고정하고 `class="art"`를 단다. 고정 바탕 위의 글자도 고정색으로 쓴다. `tools/check.py`가 `canvas.art`, `svg.art`의 색이 라이트↔다크 전환에서 바뀌는지 검사한다. 고정 배경 무대가 필요하면 `.sim-view.paper`(종이색), `.sim-view.stage`(중립 회색)를 쓴다.
- 모바일 폭 360px에서 가로 스크롤 금지. SVG는 `viewBox`만(폭 420~480). 고정폭 글꼴(`AB.font(px, true)`, `.t-mono`)은 숫자·영문에만 쓴다.

## 3. 이미지와 저작권

- 실제 작품 이미지는 **공공 도메인 또는 CC0만** 쓴다: The Met Open Access, Art Institute of Chicago, Rijksmuseum, National Gallery of Art(미국), 국립중앙박물관 공공누리 제1유형 등.
- 원본 주소, 작품명, 작가, 연도, 소장처, 라이선스, 확인일, 가공 내용을 `shared/img/credits.json`에 기록한다. 그림 아래 캡션의 `.credit`와 서가의 [크레딧 페이지](credits.html)(각 책의 용어집 장에도)에 표시한다. `python3 tools/head.py`가 `credits.js`를 다시 만든다.
- 이미지는 웹용으로 줄여(긴 변 1600px 이하, WebP, 품질 70~85) 저장하고 `du -sh shared/img`로 저장소 용량을 확인한다. 픽셀 단위 분석용 부분 확대는 원본 해상도에서 잘라 낸다(크레딧의 `derived`에 좌표를 적는다).
- 작품 위에는 분석 레이어(명도만 보기, 주요 색 추출, 구도선, 시선 경로)를 SVG/canvas로 얹어 조작할 수 있게 한다. 분석 레이어는 이 서가의 그림(CC BY 4.0)이다.
- **출처를 확인하지 못한 이미지는 쓰지 않는다.** 대신 같은 원리를 보여 주는 그림을 직접 그린다.
- 참고(2026-10 확인): 시카고 미술관의 IIIF 이미지 서버는 자동 다운로드를 막는다. The Met은 `collectionapi.metmuseum.org/public/collection/v1/objects/<id>`의 `isPublicDomain`을 확인하고 `primaryImage`를 내려받는다. 검색은 `/v1/search`가 없어지고 `/public/collection/v1.1/search?…&limit=N`으로 바뀌었다. The Met의 모네 작품은 모두 `isPublicDomain: false`라 쓸 수 없다.

## 4. 계산 엔진 (`ART`, `shared/js/art.js`)

모든 책이 같은 계산을 쓰도록 모은 공통 엔진이다. 색 변환·혼색·대비·투시 같은 계산은 직접 만들지 말고 이것을 쓴다(장 고유의 작은 계산은 직접 해도 된다). 엔진에 필요한 함수가 없으면 장 안에서 만들고, 여러 장이 쓸 만하면 엔진에 추가한 뒤 `tools/test-art.cjs`에 검산을 넣는다(기존 함수의 동작은 바꾸지 않는다). 각 함수의 출처는 주석에 있다. 본문에서 엔진 값을 쓸 때는 "이 책의 모델로 계산하면"이라고 밝힌다.

색은 특별한 말이 없으면 감마 인코딩된 sRGB 배열 `[r, g, b]`(각 0~1). 색역 밖 값은 그대로 돌려주므로 화면에 칠할 때는 `ART.fit()`(OKLCH 채도 줄이기) 또는 `ART.clip()`을 쓴다.

- 표기: `ART.parse("#3a7" | "#33aa77" | "rgb(…)")`, `ART.hex(rgb)`, `ART.css(rgb)`, `ART.to255(rgb)`.
- 변환(IEC 61966-2-1, CIE 15:2004, CSS Color 4, Ottosson 2020): `srgbToLinear`/`linearToSrgb`, `toLinear`/`toGamma`, `linearToXyz`/`xyzToLinear`, `srgbToXyz`/`xyzToSrgb`, `xyzToXyY`/`xyYToXyz`, `xyzToLab`/`labToXyz`(백색점 인자), `labToLch`/`lchToLab`, `srgbToLab`/`labToSrgb`, `srgbToLch`/`lchToSrgb`, `linearToOklab`/`oklabToLinear`, `oklabToOklch`/`oklchToOklab`, `srgbToOklab`/`oklabToSrgb`, `srgbToOklch`/`oklchToSrgb`, `srgbToHsl`/`hslToSrgb`, `srgbToHsv`/`hsvToSrgb`, `ART.D65`.
- 명도: `ART.lightness(rgb)`(CIELAB L*), `ART.grayOf(rgb)`(같은 휘도의 회색).
- 색역: `inGamut(rgb)`, `clip(rgb)`, `fit(rgb)`, `gamutMap([L, C, h])`(CSS Color 4 §13.2 이진 탐색), `maxChroma(L, h)`.
- 색 거리·대비: `deltaE76`, `deltaE2000`(Sharma 2005로 검산), `deltaEOK`, `diff(rgb1, rgb2)`(ΔE2000), `luminance`, `contrast`(WCAG 2, 1~21), `wcagLevel(ratio, large)`, `apca(text, bg)`(APCA-W3 0.0.98G-4g, **참고용**: WCAG 3 초안의 후보이며 표준이 아니다).
- 분광(교육용): `ART.WL`(380~780 nm, 5 nm), `cmf(λ)`(CIE 1931 2° 해석적 근사, Wyman 외 2013), `planck(λ, T)`, `illuminant(spec)`("daylight", "A", `{type:"blackbody",T}`, `{type:"led",T}`, "fluorescent", "sodium"), `spectrumToXyz(illum, refl)`, `whitePoint(illum)`, `wavelengthToSrgb(λ)`.
- 색순응·조명: `adapt(xyz, srcWhite, dstWhite)`(브래드퍼드), `renderReflectance(refl, illum, balance)`(balance: "adapted" 눈의 순응, "daylight" 낮빛 고정 카메라, "none"), `cctToSrgb(T)`, `cctFromXy(x, y)`(McCamy 1992), `whiteBalance(rgb, fromT, toT)`.
- 반사 스펙트럼·혼색: `reflectanceFromSrgb(rgb)`(부드러운 세 띠로 역추정), `metamer(refl, illum, {amp, period, phase})`(그 광원 아래에서만 같은 색), `PAINTS`(교육용 물감 16종, 반사율 곡선과 상대 산란 S), `ks`/`ksToR`, `mixKM(parts)`(쿠벨카–뭉크 2상수, Duncan 혼합 규칙), `mixPaints(parts)`, `paintColor(key)`, `mixAdd(...cols)`(빛), `mixOptical(a, b, t)`(병치·점묘, 선형광 평균), `mixFilter(a, b, t)`(셀로판·필터), `mixNaive(a, b, t)`(감마 값 평균, 비교용), `mixOklab(a, b, t)`, `mixAsPaint(a, b, t)`.
- 지각: `simulateCVD(rgb, "protan"|"deutan"|"tritan"|"achroma", severity)`(Machado, Oliveira, Fernandes 2009의 심도 1.0 행렬, 중간 심도는 선형 보간 근사), `CVD_TYPES`.
- 조화: `rybToHue`/`hueToRyb`(이 책이 정한 RYB↔sRGB 색상각 대응표, 표준 아님), `SCHEMES`, `harmony(rgb, scheme, "oklch"|"ryb"|"hsl")`, `toneScale(rgb, n, {from, to, chromaScale})`.
- 팔레트: `kmeans(pixels, k, {seed, sample, iters})`(OKLab k-평균, k-means++ 시작, 시드 고정), `sequential(hue, n)`, `diverging(h1, h2, n)`, `categorical(n, {L, C, h0, golden})`, `distinguish(colors, cvd)`(가장 가까운 두 색의 ΔE2000).
- 기하(다음 권들을 위해): `PHI`, `thirds(w, h)`, `phiGrid(w, h)`, `goldenSquares(x, y, w, h, n)`, `project(p, cam)`(핀홀 투시: yaw=pitch=0 1점, yaw≠0 2점, 둘 다 3점), `vanishingPoint(dir, cam)`, `shadowPoint(p, light, ground)`(점광원·평행광).
- 예시 색: `ART.OBANG`(오방색 예시값. 전통 색에는 하나로 정해진 수치가 없다는 것을 본문에서 밝힌다).
- 기타: `rng(seed)`, `clamp`, `mod360`, `mat`.

엔진의 분광 모형(광원, 반사율 역추정, 물감 스펙트럼)은 실제 측정값이 아니라 **모양을 흉내 낸 교육용 근사**다. 쓸 때마다 `.sim-note`에 그렇게 적는다. 검산: `node tools/test-art.cjs`.

## 5. head 블록

모든 HTML 페이지에는 아래 Cloudflare Web Analytics 코드를 `<head>`에 한 번 포함한다. SEO 자동 생성 블록 밖에 두며, 시리즈 공통 Site Token을 유지한다.

각 장 `<head>`에는 아래 표식만 두고 `python3 tools/head.py color/<slug>`를 실행한다(인자 없이 실행하면 전체 장 + 사이트맵 + 책 홈 JSON-LD + credits.js를 갱신한다). 제목·번호·준비 여부는 `<book>/book.js`에서 읽는다. 장 하나는 `book.js`에 **한 줄**로 쓴다(`{ slug: "…", num: "…", part: N, title: "…", ready: true|false, desc: "…", tags: […] }`).

```html
<!doctype html>
<!-- Copyright (c) 2026 geniuskey and ArtBook contributors.
     Executable code: MIT (see ../../LICENSE-MIT).
     Text, illustrations, questions and explanations: CC-BY-4.0 (see ../../LICENSE.md).
     Artwork images: public domain, see ../../credits.html. -->
<html lang="ko">
<head>
<!--head:start {"desc": "한 문장 설명"}-->
<!--head:end-->
<!-- Cloudflare Web Analytics -->
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"3d6151a0abc94ede89285d462527fa80"}'></script>
<!-- End Cloudflare Web Analytics -->
</head>
```
생성된 head는 `../book.js` → `../../shared/js/art.js` → `../../shared/js/common.js` 순서로 불러온다. 장을 다 쓰면 `book.js`에서 그 장의 `ready`를 `true`로 바꾼다(목록·이전/다음·사이트맵에 나타난다).

## 6. 페이지 골격
```html
<body data-chapter="slug">
<main class="chapter">
  <header class="chapter-hero">
    <div class="eyebrow">Chapter NN</div><h1>제목</h1><p class="lead">…</p>
    <ul class="objectives"><li>…</li></ul>
  </header>
  <section id="영문-id"><h2>절 제목</h2> … </section>
  <section id="case" data-nonum><h2>서윤의 작업 노트</h2><div class="casefile">…</div></section>
  <section class="keypoints" id="summary"><h2>핵심 정리</h2><ol><li>…</li></ol></section>
  <section class="quiz-sec" id="quiz"><h2>확인 퀴즈</h2><div class="quiz"> … </div></section>
</main>
<script>(function () { "use strict"; /* 시뮬레이터 */ })();</script>
</body>
```
상단바·장 목록·부 띠·오른쪽 목차·h2 번호·이전/다음·바닥글·퀴즈·흑백 토글·KaTeX 렌더는 `common.js`가 자동으로 만든다. 직접 넣지 않는다.

## 7. 컴포넌트
- 그림: `<figure class="diagram"><svg viewBox="0 0 440 300" role="img" aria-label="…">…</svg><figcaption><b>그림 1. 제목.</b> 설명</figcaption></figure>`. SVG 안의 UI 요소는 `.lbl`, `.lbl-dim`, `.lbl-b`, `.lbl-acc`, `.lbl-acc2`, `.lbl-bad`, `.t-mono`, `.s-line`, `.s-axis`, `.s-acc`, `.s-acc2`, `.s-ok`, `.s-dash`, `.s-bad`, `.f-surface`, `.f-elev`, `.f-acc`, `.f-acc2`, `.f-ok`, `.f-warn`, `.f-bad`, `.f-acc-soft`, `.f-acc2-soft`, `.f-ok-soft`, `.f-warn-soft`, `.f-bad-soft` 클래스로 칠한다(다크 모드). 예시 색(물감 견본, 스펙트럼)은 `fill="#…"`로 직접 쓴다. 예시 색만으로 된 SVG에는 `class="art"`를 단다. 화살표 머리는 `<marker>`에 `fill="context-stroke"`, marker id는 장 안에서 겹치지 않게 짓는다.
- 작품 그림:
```html
<figure class="art-figure" id="fig-x">
  <div class="art-frame"><img src="../../shared/img/파일.webp" width="1600" height="1070" alt="무엇이 그려져 있는지 한두 문장" loading="lazy" decoding="async"></div>
  <figcaption><b>그림 N. 작가, 「제목」, 연도.</b> 무엇을 볼지.<span class="credit">소장처, 재료. 공공 도메인(…). <a href="…">소장처 작품 페이지</a> · <a href="../../credits.html#id">크레딧</a></span></figcaption>
</figure>
```
- 시뮬레이터:
```html
<div class="sim" id="sim-x">
  <div class="sim-head"><span class="sim-tag">SIMULATOR</span><h3>제목</h3></div>
  <div class="sim-body side">
    <div class="sim-view paper"><canvas id="x-cv" class="art"></canvas></div>
    <div class="sim-controls">
      <label class="ctrl"><span>이름 <output id="x-a-out"></output></span><input type="range" id="x-a" min="0" max="10" step="0.1" value="3"></label>
      <div class="seg" id="x-mode"><button data-value="a" class="on">A</button><button data-value="b">B</button></div>
      <label class="check"><input type="checkbox" id="x-c"> 옵션</label>
    </div>
  </div>
  <div class="sim-readout"><div class="stat"><span class="k">이름</span><span class="v" id="x-o-1">—</span></div></div>
  <div class="sim-note">해볼 것: ① … ② … ③ … (모델의 가정)</div>
</div>
```
  캔버스를 직접 끄는 시뮬레이터는 `.sim-view` 안에 `<span class="hint">끌어서 움직인다</span>`를 둔다. `<select>`는 쓰지 않는다(`.seg`를 쓴다).
- 전/후 비교: `<div class="compare" id="c"><div class="cmp-a"><canvas id="c-a" class="art"></canvas></div><div class="cmp-b"><canvas id="c-b" class="art"></canvas></div></div>` + `AB.compare("#c", { labels: ["전", "후"] })`. 층 안에는 canvas, img, svg 무엇이든 둔다.
- 색 견본(HTML): `<div class="chips"><span class="chip"><i style="background:#2f7d5b"></i><b>책방 초록</b><code>#2f7d5b</code></span></div>`.
- 수식: `<div class="formula">$$…$$<div class="where">기호 설명</div></div>`, 문장 속은 `\(…\)`. 장마다 0~2개.
- 표: `<div class="table-wrap"><table>…</table></div>`. 숫자 칸은 `class="num"`.
- 퀴즈: `<div class="quiz-q"><p>문제</p><div class="opts"><button class="opt">…</button><button class="opt" data-correct>정답</button></div><div class="quiz-exp">해설</div></div>`(장마다 4문항, 정답 위치를 섞고, 그럴듯하지만 분명히 틀린 오답을 쓴다).
- 이어지는 케이스:
```html
<div class="casefile">
  <div class="tag"><b>CASE 서윤</b><span>작업 노트 · N장</span></div>
  <h4>한 줄 제목</h4>
  <p>…</p>
  <div class="clue"><div><b>이 장에서 정한 것</b>…</div><div><b>아직 남은 문제</b>…</div><div><b>다음 단계</b>…</div></div>
</div>
```

## 8. JS 헬퍼 (`AB`, `shared/js/common.js`)
- `AB.canvas(el|"#id", draw(ctx, w, h), {aspect, minHeight, maxHeight, height, bg, readback})` · `get height()`는 부모 폭이 0일 수 있으므로 `Math.max(200, el.parentElement.clientWidth || 600)`처럼 AB와 같은 폭 규칙으로 계산한다(0·음수를 돌려주면 aspect로 대신 정한다) → `{redraw(), ctx, w, h, canvas}`. 리사이즈·테마 변경·웹 글꼴 도착 시 자동으로 다시 그린다. 만들자마자 draw를 한 번 부르므로 draw가 읽는 상태와 컨트롤을 먼저 만든다. draw 안에서 자기 반환값을 참조하지 않는다. 폭에 따라 높이가 달라져야 하면 `get height() {…}`를 넘긴다.
- `AB.drag(canvas, {start, move, end, hover})`, `AB.handle(ctx, x, y, {r, fill, ring})`.
- `AB.chart(ctx, box|null, {x, y, xLabel, yLabel, xTicks, yTicks, xFmt, yFmt, series, vlines, hlines, points, bands})` → `{X, Y, box}`.
- `AB.range(id, fmt, onInput)`, `AB.seg(id, onChange)`, `AB.check(id, onChange)`, `AB.stat(id, html)`, `AB.loop(el, (dt, t) => {})`.
- 미술 도구: `AB.mono(el, on)`(흑백), `AB.compare(el, {labels, pos, onMove})`(전/후 비교), `AB.swatch(ctx, x, y, w, h, rgb, {label, sub, inside, radius, stroke, color, subColor})`, `AB.textOn(rgb)`(색 위의 검정/흰 글자), `AB.loadImage(src)`, `AB.imageData(img, w)`.
- `AB.palette()`(UI 색), `AB.color(name)`, `AB.isDark()`, `AB.onTheme(cb)`, `AB.setTheme(t)`, `AB.font(px, mono, weight)`, `AB.fmt`, `AB.fix`, `AB.pct`, `AB.rng(seed)`, `AB.clamp/lerp/map`, `AB.BOOK`, `AB.CHAPTERS`, `AB.PARTS`, `AB.SHELF`.

## 9. 점검
- `node tools/test-art.cjs` — 엔진 검산(표준 문서·논문 참값).
- `python3 tools/check.py color/<slug>` (playwright 필요: `pip install playwright`). 저장소 루트를 로컬 HTTP로 띄워 넓은 화면·라이트와 360px·다크로 열고 콘솔 오류, 가로 넘침, 조작 중 예외, 이미지, **다크 모드에서 예시 그림 색이 바뀌는지**를 보고한다. `--shots 폴더`로 조작 전 모습의 스크린샷을 남겨 눈으로도 본다. 인자 없이 실행하면 서가 전체.
- `npm run build` — `@euiyun/book`으로 `.book-dist/`를 만들어 canonical·beacon·OG를 검사한다.
- 장을 끝낼 때마다 쓴 작품 이미지와 라이선스, 인용한 연구·표준 문서 목록을 짧게 보고하고, 확인하지 못한 것을 따로 표시한다.

---

# 책별 절

## ColorBook — 색채 (`/color/`)

### 이 책이 답하려는 질문
1. **색은 어디에 있는가.** 빛, 물체, 눈, 뇌 중 어디서 색이 생기는지. 같은 색이 다르게, 다른 색이 같게 보이는 이유.
2. **색을 어떻게 다루는가.** 색을 숫자로 적고, 섞고, 고르고, 어울리게 하는 방법. 화면과 물감과 인쇄가 왜 다르게 섞이는지.
3. **색으로 무엇을 전하는가.** 분위기, 위계, 강조, 정보. 그리고 모두가 같은 색을 보지는 않는다는 사실(접근성).
4. **독자 모두에게 쓸모 있게.** 그림을 시작한 취미 화가, UI·그래픽 디자이너 지망생, 발표 자료와 차트를 만드는 직장인, 미술 감상이 궁금한 사람. 본문은 사전 지식 없는 일반인 기준.

공학적인 측색학(등색 함수 적분, 색 관리 파이프라인, 측정 장비)은 시리즈의 [ColorBook(색채공학)](https://colorbook.euiyun.com/)이 다룬다. 이 책은 같은 원리를 화가와 디자이너의 눈으로 다루고, 더 깊이 가고 싶은 독자에게 그 책을 안내한다.

### 목차
부: 지각(Perception) · 체계(System) · 관계(Relation) · 쓰임(Use)

| 장 | slug | 부 | 제목 | 다루는 것 |
|---|---|---|---|---|
| 01 | overview | — | 색의 지도 | 색을 배우는 세 갈래(빛·물감·지각), 화면 색의 한계, 책 전체 지도와 케이스 소개 |
| 02 | light | 지각 | 빛과 눈 | 스펙트럼, 원뿔세포 세 종류, 메타메리즘, 같은 색이 다르게 보이는 조명 |
| 03 | models | 체계 | 색을 숫자로 | RGB·HSL의 함정, Lab·OKLCH 같은 지각 균일 공간, 색역 |
| 04 | mixing | 체계 | 섞기 | 가산·감산 혼합, 물감을 섞으면 탁해지는 이유, 제한 팔레트로 섞기 |
| 05 | wheel | 체계 | 색상환과 조화 | RYB와 지각 색상환의 차이, 보색·유사·삼각 배색, 조화 공식의 한계 |
| 06 | value | 관계 | 명도가 먼저다 | 흑백으로 보기, 명도 구조와 노탄, 명도만으로 그림이 읽히는 이유 |
| 07 | chroma | 관계 | 채도와 톤 | 채도 조절, 회색의 힘, 톤 스케일, 탁한 색으로 선명한 색 살리기 |
| 08 | contrast | 관계 | 대비 | 이텐의 일곱 가지 대비, 강조와 초점 만들기 |
| 09 | relativity | 관계 | 색은 상대적이다 | 알베르스 실험, 동시대비와 동화, 색 항상성, 착시 |
| 10 | temperature | 지각 | 빛의 색과 그림자의 색 | 색온도, 화이트밸런스, 시간대별 빛, 그림자에 들어가는 색 |
| 11 | painting | 쓰임 | 그림 속 색 | 공공 도메인 명작의 팔레트 분석, 인상주의의 색, 수묵의 농담과 오방색 |
| 12 | meaning | 쓰임 | 색의 의미와 문화 | 문화권별 색 의미, 색채 심리 주장의 근거 수준 검토 |
| 13 | access | 쓰임 | 모두를 위한 색 | 색각이상 시뮬레이션, WCAG 대비, 색에만 의존하지 않는 정보 표현 |
| 14 | palette | 쓰임 | 팔레트 만들기 | UI 팔레트, 브랜드 색, 데이터 시각화 팔레트, 이미지에서 색 뽑기 |
| 15 | print | 쓰임 | 화면과 인쇄 | RGB와 CMYK, 색역 밖의 색, 색 관리의 기초, 인쇄물에서 색이 달라지는 이유 |
| 16 | lab | — | 색 실험실 | 이미지 한 장을 넣어 명도·채도·색상·대비·접근성을 모두 분석하고 팔레트를 뽑는 종합 도구 |
| 17 | glossary | — | 용어집 & 종합 퀴즈 | 핵심 용어 검색, 종합 퀴즈, 이미지 크레딧 |

ColorBook의 콜아웃 구성: 장마다 `.callout.studio` 1~3개, `.callout.try` 1~2개(1장은 도입이라 3개), 필요하면 `.callout.deep`, `.callout.warn`.

### 이어지는 케이스: 서윤의 작업 노트
모든 장은 같은 가상의 인물 두 명의 이야기를 한 걸음씩 진전시킨다. 각 장 끝(핵심 정리 앞)에 `.casefile` 하나를 넣고, **아래 표에서 자기 장에 해당하는 내용만** 다룬다. 뒤 장의 결론을 미리 말하지 않는다. 색 값은 `ART`로 직접 계산해서 쓴다(`node -e "const ART = require('./shared/js/art.js'); …"`로 확인). 서윤(실무·디지털)의 시각과 도경(물감·눈·관계)의 시각이 둘 다 드러나게 쓰고, 두 사람이 서로 배우는 장면을 가끔 넣는다. 결론은 "정답"이 아니라 "서윤의 선택"으로 쓴다.

- **윤서윤**(가상, 27세): 낮에는 작은 회사의 UI 디자이너, 저녁에는 수채화를 그린다. 이번 가을의 과제는 동네 독립서점 **"책방 E"**(가상)의 리브랜딩(로고 색, 가을 행사 포스터, 웹사이트)과, 11월 가을 개인 소품전에 걸 수채화 세 점 「창가의 책」, 「비 오는 골목」, 「해 질 녘 서점 앞」.
- **한도경**(가상, 61세): 서양화가이자 전 미대 교수, 서윤의 멘토. 원칙은 "색은 이름이 아니라 관계다". 디지털 도구에 서툴러 서윤과 서로 배운다. 오래된 손 색 일지를 쓴다.
- **책방 E 주인**(가상, 이름 없이 "주인"으로만 쓴다): "오래된 동네 책방 느낌은 살리되, 젊은 손님도 들어오고 싶게". 나무 서가와 전구색 조명(약 2,700~3,000 K)의 작은 가게. 크라프트지 간판, 흰 바탕 웹사이트, 검은 에코백 굿즈가 있다.
- **출발값**: 서윤이 1장에서 노트북으로 고른 로고 초록 후보 `#2f7d5b`(OKLCH 0.53 / 0.094 / 162°, L* 47.0, 흰 바탕 WCAG 대비 4.99). 이 값은 1장의 "후보"이며 확정은 16장에서 한다.

| 장 | 이 장에서 다루는 것 |
|---|---|
| 01 색의 지도 | 두 사람과 두 과제 소개. 서윤이 노트북에서 고른 초록 `#2f7d5b`가 휴대폰(더 선명), 회사 프린터 시안(거무스름), 서점 전구 아래(올리브빛)에서 세 번 달라 보인다. 도경: "색은 이름이 아니라 관계야." 정한 것: 아직 어떤 색도 확정하지 않고, 후보는 값과 "놓일 자리·옆의 색·조명"을 함께 적는다. 두 사람이 이 책의 순서대로 작업을 기록하기로 한다. |
| 02 빛과 눈 | 서점의 전구색 조명과 창가 낮빛에서 종이 색견본(인쇄 잉크)과 페인트 칩이 창가에서는 같고 전구 아래서는 다르다(메타메리즘). 원뿔세포 이야기로 도경의 "늦은 오후에는 색을 고르지 않는다" 습관을 설명한다. 정한 것: 모든 색 결정은 서점의 실제 조명 아래에서 한 번 더 확인한다. |
| 03 색을 숫자로 | 서윤이 HSL로 만든 초록 단계(버튼·배경·테두리)가 고르게 밝아지지 않는다. OKLCH로 다시 적고, 로고 초록 후보를 OKLCH로 기록한다. 휴대폰 화면이 더 넓은 색역(P3)이라 같은 값이 더 선명했다는 것도 확인한다. 정한 것: 브랜드 색은 OKLCH로 기록하고 hex는 파생값으로 둔다. |
| 04 섞기 | 도경의 조언으로 수채화 제한 팔레트 3색을 고른다. 레몬 옐로·퀴나크리돈 마젠타·프탈로 블루 대 카드뮴 옐로·알리자린 크림슨·울트라마린, 두 조합이 섞어 낼 수 있는 색의 범위를 비교한다(`ART.mixKM`). 정한 것: 세 점의 기본 3색과 보조색 번트 시에나 하나(서윤의 선택). |
| 05 색상환과 조화 | 로고 초록을 기준으로 보색·분할 보색·유사색 공식을 RYB와 OKLCH 두 색상환에서 돌려 서점 브랜드 색 후보 셋(A, B, C)을 만든다. 공식 결과를 그대로 쓰면 어색한 지점을 확인한다. 정한 것: 후보 셋을 정하되 확정하지 않는다. |
| 06 명도가 먼저다 | 가을 행사 포스터 시안을 흑백으로 바꾸니 제목(붉은 계열)과 배경(초록)의 명도가 거의 같아 제목이 안 읽힌다. 노탄 스케치로 명도 구조를 다시 짠다. 수채화 「창가의 책」의 명도 스케치 3단계. 정한 것: 포스터의 명도 구조 세 단계. |
| 07 채도와 톤 | 포스터와 「비 오는 골목」의 모든 색이 선명해 시끄럽다. 회색과 탁한 색으로 바탕을 눌러 주인공 색을 살린다. 정한 것: 채도 예산(선명한 색은 화면의 약 10%), 「비 오는 골목」의 회색 혼합 계획. |
| 08 대비 | 이텐의 일곱 가지 대비로 포스터 시안 세 개를 평가한다. 강조점을 여러 대비로 동시에 만들면 초점이 흩어진다. 정한 것: 포스터 초점은 명도 대비와 보색 대비 하나씩만 쓴다. |
| 09 색은 상대적이다 | 같은 로고 초록이 크라프트지 간판, 흰 웹 배경, 검은 에코백 위에서 다르게 보여 로고가 흔들린다. 알베르스 실험으로 확인하고 배경별 변형을 만든다. 정한 것: 로고 초록의 배경별 변형 규칙(밝은 바탕용, 어두운 바탕용). |
| 10 빛의 색과 그림자의 색 | 「해 질 녘 서점 앞」의 시간대별 빛과 그림자 색 계획. 웹사이트용 서점 사진의 화이트밸런스 보정(전구 분위기를 얼마나 남길지). 정한 것: 그림자에 보라·파랑 계열을 넣는 계획, 사진은 분위기를 남기도록 일부만 보정. |
| 11 그림 속 색 | 도경과 함께 공공 도메인 작품의 팔레트를 분석한다(인상주의, 수묵의 농담, 오방색). 서윤의 수채화 세 점에 가져올 **원리**를 얻는다(모작이 아니다). 정한 것: 그림별 참고 원리 하나씩. |
| 12 색의 의미와 문화 | 주인이 "초록은 편안함, 빨강은 구매욕"이라는 통설을 말한다. 근거 수준을 검토하고 문화권별 의미를 본다. 정한 것: 색채 심리 통설은 근거로 쓰지 않고, 서점의 이야기(오래된 나무 서가, 동네 숲길)를 근거로 삼는다. |
| 13 모두를 위한 색 | 제2색각이상 손님의 말: 웹사이트의 "예약하기" 버튼과 "품절" 표시가 잘 안 보인다. 시뮬레이션, WCAG 대비 점검, 색에만 의존하지 않는 표현. 정한 것: 글자·버튼 대비 4.5:1 이상, 상태 표시에 글자·모양을 함께 쓴다. |
| 14 팔레트 만들기 | 웹 UI 팔레트 확장(브랜드 초록의 톤 스케일, 중립색, 상태색), 행사 달력·방문자 차트의 데이터 시각화 팔레트, 서점 사진에서 색 추출. 정한 것: 웹 팔레트 v1. |
| 15 화면과 인쇄 | 포스터 인쇄 색이 화면과 다르다(CMYK 색역 밖의 초록, 종이의 흡수). 교정 인쇄로 조정하고 별색을 검토한다. 정한 것: 인쇄용 초록 값을 따로 지정하고 교정쇄로 확인하는 절차. |
| 16 색 실험실 | 최종 브랜드 팔레트와 수채화 세 점의 색 계획을 실험실에서 종합 분석한다. 정답이 아니라 서윤의 선택으로 쓰고, 다른 선택지도 함께 남긴다. 도경의 마지막 메모. |
| 17 용어집 | 케이스 없음(작업 노트 색인만 둔다). |

위 표는 집필 전에 정한 계획이다. 각 장의 케이스가 실제로 정한 값(hex, 대비, 인쇄값)은 그 장의 `<section id="case">`와 17장 "서윤의 작업 노트 색인"에 있다. 케이스를 고칠 때는 앞뒤 장의 값과 어긋나지 않게 그 색인부터 확인한다.

### ColorBook 바닥글·README 문구
화면에 보이는 색은 기기마다 다르다. 작품 이미지는 공공 도메인 자료이며 출처는 크레딧 페이지에 있다. 색채 심리 등 연구 결과가 엇갈리는 주제는 그 수준을 밝혀 두었다.

## CompositionBook — 형태와 구도 (`/composition/`)

### 이 책이 답하려는 질문
1. **화면은 무엇으로 이루어지는가.** 점·선·면, 형과 바탕. 그린 것과 남긴 것이 함께 화면을 만든다.
2. **눈은 화면을 어떻게 읽는가.** 게슈탈트, 시선의 흐름, 평면 위의 깊이. 지각 연구는 근거 수준을 밝힌다(예: 시선 추적 연구는 과제·사람에 따라 결과가 크게 달라진다).
3. **좋은 질서에는 공식이 있는가.** 균형·리듬·비례·여백. 3분할과 황금비는 **쓸모 있는 출발점과 근거 없는 신화를 가른다**: "명작은 황금비로 그려졌다"는 주장 대부분은 사후에 선을 끼워 맞춘 것이라는 비판(예: 파르테논, 모나리자 사례에 대한 반론)을 함께 소개하되, 지어낸 측정값은 쓰지 않는다.
4. **구도로 무엇을 전하는가.** 자르기, 지면 구성, 명작 읽기. 동아시아 회화(여백, 두루마리의 시간적 화면, 삼원법은 DrawingBook과 나눔)를 같은 무게로.

### 목차
부: 요소(Elements) · 지각(Perception) · 질서(Order) · 쓰임(Use). 장 목록과 설명은 `composition/book.js`.

| 장 | slug | 부 | 제목 | 다루는 것 |
|---|---|---|---|---|
| 01 | overview | — | 구도의 지도 | 같은 요소를 다르게 놓으면 다른 그림, 네 갈래, 규칙과 그 한계, 케이스 소개 |
| 02 | elements | 요소 | 점·선·면 | 점의 위치와 긴장, 선의 방향(수평·수직·사선)과 속도, 면의 크기·명도·무게 |
| 03 | shape | 요소 | 형과 바탕 | 양형·음형, 형–바탕 반전(루빈의 꽃병 계열, 직접 그림), 실루엣, 노탄과의 연결(ColorBook 6장) |
| 04 | gestalt | 지각 | 묶여 보이는 법칙 | 근접·유사·연속·폐합·공통 운명·좋은 형태, 게슈탈트 심리학의 역사와 한계 |
| 05 | eye | 지각 | 시선의 흐름 | 초점, 방향선, 시선 유도, 읽기 방향, 시선 추적 연구의 실제(야르부스 1967 등은 요약) |
| 06 | depth | 지각 | 평면 위의 깊이 | 겹침·크기·높이·대기 원근·명도·질감 기울기, 동양화의 다른 공간 |
| 07 | balance | 질서 | 균형 | 대칭·비대칭, 시각적 무게(크기·명도·채도·위치·고립), 지렛대 모형, 일부러 깨진 균형 |
| 08 | rhythm | 질서 | 리듬과 반복 | 반복·변주·점진·교대, 패턴, 리듬을 깨는 한 점 |
| 09 | proportion | 질서 | 비례: 3분할과 황금비 | 3분할의 실제, 황금비의 수학과 신화, 격자를 끌어 명작에 대 보기, 규칙이 안 맞는 좋은 그림 |
| 10 | space | 질서 | 여백과 밀도 | 비운 자리의 역할, 밀도 대비, 동아시아 회화의 여백, 디자인의 여백 |
| 11 | frame | 쓰임 | 프레임과 자르기 | 화면 비율(1:1, 4:3, 16:9, 세로), 크롭, 프레임 속 프레임, 가장자리의 긴장 |
| 12 | layout | 쓰임 | 지면과 화면 구성 | 포스터·웹 첫 화면 구성, 위계·정렬·무리, Z/F 패턴의 근거 수준(그리드는 TypeBook에서 깊게) |
| 13 | reading | 쓰임 | 명작의 구도 읽기 | 공공 도메인 명작 위에 구도선·무게·시선 레이어, 동서양 비교 |
| 14 | lab | — | 구도 실험실 | 이미지나 직접 놓은 도형으로 무게중심·시선·격자·여백·자르기를 종합 분석 |
| 15 | glossary | — | 용어집 & 종합 퀴즈 | 용어 검색, 종합 퀴즈, 작업 노트 색인, 이미지 크레딧 |

엔진 활용: `ART.thirds`, `ART.phiGrid`, `ART.goldenSquares`, `ART.lightness`(시각적 무게의 명도 성분), `ART.kmeans`. 시각적 무게·현저성(saliency) 같은 모형은 장 안에서 단순 모형으로 구현하고 "교육용 근사"라고 밝힌다.

### 이어지는 케이스: 서윤의 겨울 작업 노트
ColorBook의 가을 작업에 이어지는 겨울 이야기다. 각 장 끝(핵심 정리 앞)에 `.casefile` 하나를 넣고, **아래 표의 자기 장 내용만** 다룬다. 뒤 장의 결론을 미리 말하지 않는다. 결론은 "서윤의 선택"으로 쓴다. ColorBook에서 정한 책방 E의 색(책방 초록 `#2f7d5b`, 크림 `#ffe2d7`, 차분한 초록 `#567666`, 강조 `#d24f39`, 짙은 색 `#22342a`)을 그대로 쓴다.

- **윤서윤**(가상, 27세, UI 디자이너·수채화가). 겨울 과제: 책방 E의 **겨울 쇼윈도 진열**(폭 약 2.4 m 창, 책 20여 권과 소품), **연말 낭독회 포스터**(A2 세로), **웹사이트 첫 화면 개편**(가로 화면과 휴대폰), 그리고 **겨울 수채화 연작** 두 점(「눈 오는 골목」, 「창가의 귤」).
- **한도경**(가상, 61세, 화가). 원칙: "그림은 놓는 자리에서 시작된다." 책방 E 안쪽 벽에 서윤의 가을 수채화 세 점을 거는 일을 함께 한다(간격·높이·순서).
- **책방 E 주인**(가상): "겨울에는 창 앞에서 사람들이 멈춰 섰으면 좋겠다."

| 장 | 이 장에서 다루는 것 |
|---|---|
| 01 구도의 지도 | 겨울 과제 소개. 서윤의 첫 쇼윈도 진열은 책을 고르게 줄 세워 "다 보이지만 아무것도 안 보인다". 도경: "그림은 놓는 자리에서 시작된다." 정한 것: 진열·포스터·웹 모두 먼저 흑백 썸네일 스케치로 배치부터 본다. |
| 02 점·선·면 | 쇼윈도를 점(소품)·선(선반·리본)·면(책 표지 덩어리)으로 다시 본다. 낭독회 포스터의 첫 썸네일 세 개(점 중심, 선 중심, 면 중심). 정한 것: 포스터는 큰 면 하나 + 작은 점 하나로 간다. |
| 03 형과 바탕 | 창 너머 거리에서 보면 진열의 실루엣이 덩어리로 뭉친다. 책 사이의 빈 자리(음형)를 설계한다. 「창가의 귤」의 형–바탕. 정한 것: 진열에 읽히는 빈 자리 두 곳. |
| 04 묶여 보이는 법칙 | 웹 첫 화면의 메뉴·행사·신간이 한 덩어리로 보여 구분이 안 된다. 근접·유사로 무리를 다시 묶는다. 정한 것: 첫 화면의 세 무리와 무리 사이 간격 규칙. |
| 05 시선의 흐름 | 포스터를 본 사람이 날짜를 마지막에 찾는다. 시선 경로를 그려 보고 제목→그림→날짜 순서를 만든다. 정한 것: 포스터 시선 경로(시선 추적 대신 동료 다섯 명의 간이 테스트로, 결과는 "참고"). |
| 06 평면 위의 깊이 | 쇼윈도가 얕아 납작해 보인다. 겹침·크기·명도로 앞·중간·뒤 세 켜를 만든다. 「눈 오는 골목」의 대기 원근. 정한 것: 진열 세 켜. |
| 07 균형 | 도경과 가을 수채화 세 점을 벽에 건다. 크기가 다른 세 점의 시각적 무게를 맞춘다(중심선 높이 약 145 cm 관례는 "흔히 쓰는 기준"으로). 포스터의 비대칭 균형. 정한 것: 세 점의 배치와 간격. |
| 08 리듬과 반복 | 쇼윈도 책을 반복과 변주로 배치하고, 리듬을 깨는 한 점(빨간 표지 한 권)을 둔다. 웹 신간 목록의 리듬. 정한 것: 진열의 박자. |
| 09 비례: 3분할과 황금비 | 주인이 "황금비로 하면 예쁘다던데"라고 묻는다. 포스터와 진열에 3분할·황금비 격자를 대 보고, 맞을 때와 안 맞을 때를 본다. 정한 것: 격자는 점검 도구로만 쓴다. |
| 10 여백과 밀도 | 낭독회 포스터에 정보를 다 넣으니 숨이 막힌다. 여백을 늘리고 밀도 대비를 만든다. 「눈 오는 골목」의 여백(동아시아 회화 참고). 정한 것: 포스터 여백 비율과 「눈 오는 골목」의 빈 하늘. |
| 11 프레임과 자르기 | 같은 진열 사진을 웹(16:9), SNS(1:1, 4:5), 포스터(세로)로 자른다. 프레임 속 프레임(창틀). 정한 것: 비율별 자르기 규칙. |
| 12 지면과 화면 구성 | 웹 첫 화면과 포스터를 위계·정렬·무리로 완성한다(그리드 세부는 TypeBook으로 넘긴다). 정한 것: 웹 첫 화면 구성안과 포스터 최종 배치. |
| 13 명작의 구도 읽기 | 도경과 공공 도메인 명작의 구도를 읽는다(서양 회화 두 점, 동아시아 두루마리·족자 한 점 이상). 겨울 연작에 가져올 원리 하나씩(모작 아님). |
| 14 구도 실험실 | 진열 사진·포스터·수채화 두 점을 실험실에서 종합 분석. 정답이 아니라 서윤의 선택, 다른 선택지도 남김, 도경의 메모. |
| 15 용어집 | 케이스 없음(작업 노트 색인만). |
