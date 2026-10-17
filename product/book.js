/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../LICENSE-MIT). Text: CC-BY-4.0 (see ../LICENSE.md). */
/* ProductBook 책 정보 — shared/js/common.js 보다 먼저 불러온다. 한 장을 한 줄에 쓴다(tools가 정규식으로 읽는다). */
document.documentElement.setAttribute("data-book", "product");
window.AB_BOOK = {
  id: "product",
  portalId: "artbook-product",
  title: "ProductBook",
  sub: "제품 디자인",
  tagline: "묻고 그리고 시험해 보며 배우는 디지털 제품 디자인",
  footer: "사용자 조사와 실험의 결과는 사람, 과업, 맥락에 따라 달라진다. 이 책의 시뮬레이터는 원리를 보여 주는 단순 모형이며 그렇다고 밝혔다. 인물과 가게, 서비스는 모두 가상이며, 연구 결과가 엇갈리는 통설은 그 수준을 밝혔다.",
  parts: [
    { key: "understand", name: "이해", en: "Understand" },
    { key: "structure", name: "구조", en: "Structure" },
    { key: "validate", name: "검증", en: "Validate" },
    { key: "operate", name: "운영", en: "Operate" },
  ],
  chapters: [
    { slug: "overview", num: "01", title: "제품 디자인의 지도", ready: true, desc: "화면을 그리기 전에 문제를 고른다. 이해, 구조, 검증, 운영의 네 갈래와 더블 다이아몬드, 서윤의 봄 서비스 노트.", tags: ["도입", "sim"] },
    { slug: "research", num: "02", part: 0, title: "사용자 조사", ready: true, desc: "인터뷰와 관찰, 말과 행동의 차이, 유도 질문, 누구를 몇 명 만날 것인가.", tags: ["이해", "sim"] },
    { slug: "problem", num: "03", part: 0, title: "문제 정의", ready: true, desc: "친화도 묶기, 페르소나의 쓰임과 함정, 사용자 여정 지도, 해야 할 일(JTBD), \"어떻게 하면\" 질문.", tags: ["이해", "sim"] },
    { slug: "ia", num: "04", part: 1, title: "정보 구조", ready: true, desc: "카드 소팅과 트리 테스트, 넓고 얕게 대 좁고 깊게, 분류와 이름 붙이기.", tags: ["구조", "sim"] },
    { slug: "flow", num: "05", part: 1, title: "사용자 흐름", ready: true, desc: "과업 흐름도, 단계 수와 이탈(퍼널), 행복한 경로와 예외 경로, 되돌리기.", tags: ["구조", "sim"] },
    { slug: "interaction", num: "06", part: 1, title: "상호작용의 원리", ready: true, desc: "멘탈 모델, 기표와 피드백, 매핑, 제약. 힉의 법칙과 피츠의 법칙이 실제로 말하는 것.", tags: ["구조", "sim"] },
    { slug: "prototype", num: "07", part: 2, title: "스케치와 프로토타입", ready: true, desc: "충실도의 선택, 종이 프로토타입, 와이어프레임, 무엇을 확인하려는 프로토타입인가.", tags: ["검증", "sim"] },
    { slug: "usability", num: "08", part: 2, title: "사용성 테스트", ready: true, desc: "과업 설계, 생각 말하기, 성공률과 시간, SUS, 문제 발견 모형과 \"다섯 명\"의 근거.", tags: ["검증", "sim"] },
    { slug: "metrics", num: "09", part: 2, title: "숫자로 확인하기", ready: true, desc: "지표 고르기, A/B 테스트, 표본 크기와 우연, 중간에 들여다보기의 함정.", tags: ["검증", "sim"] },
    { slug: "writing", num: "10", part: 3, title: "UX 라이팅", ready: true, desc: "버튼과 안내 문구, 오류 메시지, 빈 상태, 한국어의 높임과 어조.", tags: ["운영", "sim"] },
    { slug: "system", num: "11", part: 3, title: "디자인 시스템", ready: true, desc: "토큰과 컴포넌트, 변형과 상태, 문서와 운영 규칙, 일관성과 예외.", tags: ["운영", "sim"] },
    { slug: "ethics", num: "12", part: 3, title: "다크 패턴과 윤리", ready: true, desc: "속이는 설계의 유형, 동의와 개인정보, 포용적 설계, 지표가 사람을 해칠 때.", tags: ["운영", "sim"] },
    { slug: "lab", num: "13", title: "제품 실험실", ready: true, desc: "흐름, 퍼널, 사용성 테스트, A/B 결과를 한 서비스 위에서 함께 조정하고 읽는 종합 도구.", tags: ["실험실", "sim"] },
    { slug: "glossary", num: "14", title: "용어집 & 종합 퀴즈", ready: true, desc: "제품 디자인 용어 검색, 종합 퀴즈, 서비스 노트 색인.", tags: ["정리"] },
  ],
};

// Per-book source for the shared glossary runtime.
window.BOOK_GLOSSARY_CONFIG = { dataUrl: new URL("glossary-data.js", document.currentScript.src).href };
