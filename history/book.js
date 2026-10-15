/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../LICENSE-MIT). Text: CC-BY-4.0 (see ../LICENSE.md). */
/* ArtHistoryBook 책 정보 — shared/js/common.js 보다 먼저 불러온다. 한 장을 한 줄에 쓴다(tools가 정규식으로 읽는다). */
document.documentElement.setAttribute("data-book", "history");
window.AB_BOOK = {
  id: "history",
  portalId: "artbook-history",
  title: "ArtHistoryBook",
  sub: "미술사",
  tagline: "명작 위에 선을 얹고 색을 뽑아 보며 읽는 미술사",
  footer: "사조의 이름과 경계는 뒤에 붙인 정리이며, 한 시대 안에도 다양한 그림이 있다. 연대와 해석은 소장처 기록과 널리 받아들여진 연구를 따랐고, 엇갈리는 견해는 그렇다고 밝혔다. 작품 이미지는 공공 도메인 자료이며 출처는 크레딧 페이지에 있다.",
  parts: [
    { key: "early", name: "고대에서 르네상스까지", en: "Ancient to Renaissance" },
    { key: "modern", name: "바로크에서 근대까지", en: "Baroque to Modern" },
    { key: "east", name: "동아시아", en: "East Asia" },
  ],
  chapters: [
    { slug: "overview", num: "01", title: "미술사를 읽는 세 렌즈", ready: false, desc: "색, 구도, 기법. 시대마다 무엇이 바뀌고 무엇이 남았는지를 세 렌즈로 읽는 법과 서윤의 그림 읽기 모임.", tags: ["도입", "sim"] },
    { slug: "ancient", num: "02", part: 0, title: "고대와 중세", ready: false, desc: "이집트의 정면성, 그리스의 비례, 비잔틴의 금빛 바탕, 중세 필사본. 보이는 대로가 아니라 아는 대로, 믿는 대로 그린 그림.", tags: ["고대·중세", "sim"] },
    { slug: "renaissance", num: "03", part: 0, title: "르네상스: 원근과 비례", ready: false, desc: "선 원근법의 발명, 템페라에서 유화로, 북유럽의 세밀함. 그림이 창문이 된 순간.", tags: ["르네상스", "sim"] },
    { slug: "baroque", num: "04", part: 1, title: "바로크: 빛과 어둠", ready: false, desc: "키아로스쿠로와 테네브리즘, 사선과 운동. 어둠 속에서 한 줄기 빛이 극을 만든다.", tags: ["바로크", "sim"] },
    { slug: "dutch", num: "05", part: 1, title: "네덜란드 황금기", ready: false, desc: "시장을 위한 그림. 정물, 풍경, 실내, 초상. 일상의 빛과 질감을 그린 화가들.", tags: ["17세기", "sim"] },
    { slug: "rococo", num: "06", part: 1, title: "로코코와 신고전주의", ready: false, desc: "파스텔 색과 곡선의 장식, 그리고 그에 맞선 엄격한 윤곽과 고대의 질서.", tags: ["18세기", "sim"] },
    { slug: "romantic", num: "07", part: 1, title: "낭만주의와 사실주의", ready: false, desc: "감정과 숭고, 붓질의 해방. 그리고 보이는 그대로의 노동과 시골.", tags: ["19세기", "sim"] },
    { slug: "impressionism", num: "08", part: 1, title: "인상주의", ready: false, desc: "야외의 빛, 짧은 붓질, 그림자 속의 색. 튜브 물감과 사진, 일본 판화가 바꾼 눈.", tags: ["19세기", "sim"] },
    { slug: "post", num: "09", part: 1, title: "후기 인상주의와 그 너머", ready: false, desc: "점묘의 과학, 세잔의 구조, 고흐의 색과 붓질, 고갱의 평면. 20세기 미술로 가는 문.", tags: ["19세기 말", "sim"] },
    { slug: "eastasia", num: "10", part: 2, title: "동아시아 회화", ready: false, desc: "산수화의 공간, 필묵과 준법, 두루마리의 시간. 중국 회화의 큰 흐름과 문인화.", tags: ["동아시아", "sim"] },
    { slug: "korea", num: "11", part: 2, title: "한국 미술", ready: false, desc: "고려 불화의 색, 조선 초상화의 정밀함, 진경산수와 풍속화, 민화와 책가도.", tags: ["한국", "sim"] },
    { slug: "print", num: "12", part: 2, title: "판화와 우키요에", ready: false, desc: "목판과 동판, 다색 목판의 공정, 우키요에의 구도와 자포니즘. 복제가 바꾼 미술.", tags: ["판화", "sim"] },
    { slug: "lab", num: "13", title: "미술사 실험실", ready: false, desc: "연대표 위의 작품들에서 팔레트, 명도 분포, 구도선을 뽑아 시대와 지역을 나란히 비교하는 종합 도구.", tags: ["실험실", "sim"] },
    { slug: "glossary", num: "14", title: "용어집 & 종합 퀴즈", ready: false, desc: "미술사 용어 검색, 연표, 종합 퀴즈, 모임 노트 색인, 이미지 크레딧.", tags: ["정리"] },
  ],
};
