/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../LICENSE-MIT). Text: CC-BY-4.0 (see ../LICENSE.md). */
/* WebBook 책 정보 — shared/js/common.js 보다 먼저 불러온다. 한 장을 한 줄에 쓴다(tools가 정규식으로 읽는다). */
document.documentElement.setAttribute("data-book", "web");
window.AB_BOOK = {
  id: "web",
  portalId: "artbook-web",
  title: "WebBook",
  sub: "웹 디자인",
  tagline: "창 폭을 끌고 상태를 바꿔 보며 배우는 웹 디자인",
  footer: "브라우저와 기기, 화면 크기는 사람마다 다르다. 이 책의 시뮬레이터는 원리를 보여 주는 단순 모형이며 그렇다고 밝혔다. 표준 수치(WCAG 등)는 출처와 함께 적었고, 연구 결과가 엇갈리는 통설은 그 수준을 밝혔다.",
  parts: [
    { key: "screen", name: "화면", en: "Screen" },
    { key: "layout", name: "배치", en: "Layout" },
    { key: "interaction", name: "상호작용", en: "Interaction" },
    { key: "use", name: "쓰임", en: "Use" },
  ],
  chapters: [
    { slug: "overview", num: "01", title: "웹 디자인의 지도", ready: true, desc: "웹은 크기를 정할 수 없는 캔버스다. 화면, 배치, 상호작용, 쓰임의 네 갈래와 서윤의 웹 개편 노트.", tags: ["도입", "sim"] },
    { slug: "viewport", num: "02", part: 0, title: "브라우저라는 캔버스", ready: true, desc: "뷰포트와 CSS 픽셀, 기기 픽셀 비율, 화면 크기의 다양성, 확대와 글자 크기 설정, 접힘선 통설.", tags: ["화면", "sim"] },
    { slug: "box", num: "03", part: 0, title: "박스와 간격", ready: true, desc: "모든 요소는 상자다. 박스 모델, 여백과 패딩, 마진 상쇄, 4·8 간격 체계, 간격으로 묶고 떼기.", tags: ["화면", "sim"] },
    { slug: "grid", num: "04", part: 1, title: "레이아웃 그리드", ready: true, desc: "단·거터·바깥 여백, 12단 그리드, fr 단위, 플렉스박스와 그리드의 차이, 그리드를 깨는 요소.", tags: ["배치", "sim"] },
    { slug: "responsive", num: "05", part: 1, title: "반응형", ready: true, desc: "유동 레이아웃, 중단점은 콘텐츠가 정한다, clamp()와 유동 크기, 컨테이너 쿼리, 반응형 이미지.", tags: ["배치", "sim"] },
    { slug: "tokens", num: "06", part: 1, title: "색과 글자의 체계", ready: true, desc: "디자인 토큰, 웹 팔레트와 의미 색, 다크 모드, rem과 글자 크기 단계, 한 곳을 바꾸면 전체가 바뀌는 구조.", tags: ["배치", "sim"] },
    { slug: "components", num: "07", part: 2, title: "컴포넌트와 상태", ready: true, desc: "버튼·링크·입력·카드. 기본·호버·포커스·눌림·비활성 상태, 터치 타깃 크기와 피츠의 법칙.", tags: ["상호작용", "sim"] },
    { slug: "navigation", num: "08", part: 2, title: "내비게이션", ready: true, desc: "메뉴 패턴, 숨긴 메뉴의 대가, 현재 위치 표시, 빵부스러기와 검색. 길을 잃지 않게 하는 화면.", tags: ["상호작용", "sim"] },
    { slug: "forms", num: "09", part: 2, title: "폼", ready: true, desc: "라벨과 자리표시자, 입력 칸의 길이와 형식, 오류 메시지의 위치와 시점, 단계 나누기.", tags: ["상호작용", "sim"] },
    { slug: "motion", num: "10", part: 2, title: "모션", ready: true, desc: "이징 곡선과 지속 시간, 전환이 알려 주는 것, 과한 움직임과 줄인 움직임 선호.", tags: ["상호작용", "sim"] },
    { slug: "access", num: "11", part: 3, title: "웹 접근성", ready: true, desc: "의미 있는 HTML, 키보드와 포커스, 대체 텍스트, 대비와 확대. WCAG 2.2와 한국형 웹 콘텐츠 접근성 지침.", tags: ["쓰임", "sim"] },
    { slug: "performance", num: "12", part: 3, title: "속도도 디자인이다", ready: true, desc: "이미지와 웹폰트 용량, 레이아웃 이동, 가장 큰 콘텐츠가 그려지는 시간, 스켈레톤과 체감 속도.", tags: ["쓰임", "sim"] },
    { slug: "lab", num: "13", title: "웹 실험실", ready: true, desc: "페이지 하나를 창 폭, 그리드, 토큰, 대비, 터치 타깃, 용량으로 한꺼번에 점검하고 조정하는 종합 도구.", tags: ["실험실", "sim"] },
    { slug: "glossary", num: "14", title: "용어집 & 종합 퀴즈", ready: true, desc: "웹 디자인 용어 검색, 종합 퀴즈, 웹 개편 노트 색인.", tags: ["정리"] },
  ],
};

// Per-book source for the shared glossary runtime.
window.BOOK_GLOSSARY_CONFIG = { dataUrl: new URL("glossary-data.js", document.currentScript.src).href };
