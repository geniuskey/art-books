/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../LICENSE-MIT). Text: CC-BY-4.0 (see ../LICENSE.md). */
/* IndustrialBook 책 정보 — shared/js/common.js 보다 먼저 불러온다. 한 장을 한 줄에 쓴다(tools가 정규식으로 읽는다). */
document.documentElement.setAttribute("data-book", "industrial");
window.AB_BOOK = {
  id: "industrial",
  portalId: "artbook-industrial",
  title: "IndustrialBook",
  sub: "산업디자인",
  tagline: "형태를 돌리고 손에 쥐고 금형을 열어 보며 배우는 산업디자인",
  footer: "재료의 물성값과 공정 조건은 등급과 공장마다 다르다. 이 책의 수치는 범위를 보여 주는 교육용 대표값이며, 시뮬레이터는 원리를 보여 주는 단순 모형이라고 밝혔다. 제품 이미지는 공공 도메인 자료이며 출처는 크레딧 페이지에 있다.",
  parts: [
    { key: "form", name: "형태", en: "Form" },
    { key: "body", name: "몸", en: "Body" },
    { key: "making", name: "만들기", en: "Making" },
    { key: "use", name: "쓰임", en: "Use" },
  ],
  chapters: [
    { slug: "overview", num: "01", title: "산업디자인의 지도", ready: true, desc: "손에 쥐는 물건은 형태, 몸, 만들기, 쓰임이 만나는 자리다. 네 갈래와 서윤의 여름 제품 노트.", tags: ["도입", "sim"] },
    { slug: "sketch", num: "02", part: 0, title: "제품 스케치와 도면", ready: true, desc: "투시 스케치, 단면선, 정투상 3면도, 치수. 머릿속 형태를 남이 읽을 수 있게 옮기는 법.", tags: ["형태", "sim"] },
    { slug: "form", num: "03", part: 0, title: "형태와 곡면", ready: true, desc: "기본 입체의 조합, 모깎기 반경, 곡률 연속(G0·G1·G2), 반사 하이라이트로 곡면 읽기.", tags: ["형태", "sim"] },
    { slug: "proportion", num: "04", part: 0, title: "비례와 안정", ready: true, desc: "제품의 비례, 시각적 무게와 실제 무게중심, 넘어지지 않는 조건, 디테일의 위계.", tags: ["형태", "sim"] },
    { slug: "ergonomics", num: "05", part: 1, title: "인간공학과 인체 치수", ready: true, desc: "퍼센타일과 설계 범위, 손 크기와 잡기, 힘과 도달 거리. 평균의 사람은 없다.", tags: ["몸", "sim"] },
    { slug: "control", num: "06", part: 1, title: "조작과 피드백", ready: true, desc: "버튼·노브·스위치·손잡이, 매핑, 클릭감과 소리, 실수를 막는 형태.", tags: ["몸", "sim"] },
    { slug: "materials", num: "07", part: 2, title: "재료", ready: true, desc: "플라스틱·금속·나무·유리·세라믹의 성질, 밀도와 강성, 굽힘과 두께, 재료 고르기 지도.", tags: ["만들기", "sim"] },
    { slug: "process", num: "08", part: 2, title: "생산 공정", ready: true, desc: "사출 성형, 구배각, 고른 살두께, 언더컷, 판금과 절삭, 3D 프린팅. 수량이 공정을 정한다.", tags: ["만들기", "sim"] },
    { slug: "assembly", num: "09", part: 2, title: "구조와 조립", ready: true, desc: "리브와 보스, 스냅핏, 나사와 접착, 공차와 틈, 조립 순서.", tags: ["만들기", "sim"] },
    { slug: "cmf", num: "10", part: 3, title: "색·재료·마감", ready: true, desc: "CMF: 표면 질감과 광택, 반사, 도장·도금·아노다이징, 생산에서 색을 맞추는 일.", tags: ["쓰임", "sim"] },
    { slug: "sustain", num: "11", part: 3, title: "수명과 지속가능성", ready: true, desc: "수리와 분해, 재료 줄이기, 재활용의 실제, 전과정평가(LCA)의 기초.", tags: ["쓰임", "sim"] },
    { slug: "history", num: "12", part: 3, title: "산업디자인의 역사", ready: true, desc: "공예와 기계, 미술공예운동, 바우하우스, 유선형, 기능주의, 한국의 산업디자인. 공공 도메인 디자인 유물로 보는 흐름.", tags: ["쓰임", "sim"] },
    { slug: "lab", num: "13", title: "제품 실험실", ready: true, desc: "한 제품의 형태, 비례, 인체 치수, 재료, 공정, 비용을 한꺼번에 조정하며 거래를 보는 종합 도구.", tags: ["실험실", "sim"] },
    { slug: "glossary", num: "14", title: "용어집 & 종합 퀴즈", ready: true, desc: "산업디자인 용어 검색, 종합 퀴즈, 제품 노트 색인, 이미지 크레딧.", tags: ["정리"] },
  ],
};
