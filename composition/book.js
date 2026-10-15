/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../LICENSE-MIT). Text: CC-BY-4.0 (see ../LICENSE.md). */
/* CompositionBook 책 정보 — shared/js/common.js 보다 먼저 불러온다. 한 장을 한 줄에 쓴다(tools가 정규식으로 읽는다). */
document.documentElement.setAttribute("data-book", "composition");
window.AB_BOOK = {
  id: "composition",
  portalId: "artbook-composition",
  title: "CompositionBook",
  sub: "형태와 구도",
  tagline: "끌고, 옮기고, 잘라 보며 배우는 구도 교과서",
  footer: "구도의 규칙(3분할, 황금비, 시선 유도)은 출발점이지 정답이 아니다. 작품 이미지는 공공 도메인 자료이며 출처는 크레딧 페이지에 있다. 시선·지각 연구는 근거의 수준을 밝혀 두었다.",
  parts: [
    { key: "element", name: "요소", en: "Elements" },
    { key: "perception", name: "지각", en: "Perception" },
    { key: "order", name: "질서", en: "Order" },
    { key: "use", name: "쓰임", en: "Use" },
  ],
  chapters: [
    { slug: "overview", num: "01", title: "구도의 지도", ready: false, desc: "같은 것을 다르게 놓으면 다른 그림이 된다. 화면 안의 요소, 지각, 질서, 쓰임의 네 갈래와 책 전체의 지도, 서윤의 겨울 작업 노트.", tags: ["도입", "sim"] },
    { slug: "elements", num: "02", part: 0, title: "점·선·면", ready: false, desc: "화면을 이루는 가장 작은 단위. 점의 위치, 선의 방향과 속도, 면의 크기와 무게가 만드는 긴장.", tags: ["요소", "sim"] },
    { slug: "shape", num: "03", part: 0, title: "형과 바탕", ready: false, desc: "그린 것과 남은 것. 양형과 음형, 형–바탕 반전, 실루엣이 읽히는 조건.", tags: ["요소", "sim"] },
    { slug: "gestalt", num: "04", part: 1, title: "묶여 보이는 법칙", ready: false, desc: "근접, 유사, 연속, 폐합, 공통 운명. 게슈탈트 원리로 흩어진 요소가 하나로 보이는 순간.", tags: ["지각", "sim"] },
    { slug: "eye", num: "05", part: 1, title: "시선의 흐름", ready: false, desc: "눈은 어디서 시작해 어디로 가는가. 초점, 방향선, 시선 유도와 시선 추적 연구의 실제.", tags: ["지각", "sim"] },
    { slug: "depth", num: "06", part: 1, title: "평면 위의 깊이", ready: false, desc: "겹침, 크기, 높이, 대기 원근, 명도로 평평한 화면에 공간을 만드는 법.", tags: ["지각", "sim"] },
    { slug: "balance", num: "07", part: 2, title: "균형", ready: false, desc: "대칭과 비대칭, 시각적 무게, 지렛대처럼 맞서는 요소들. 일부러 기울인 화면.", tags: ["질서", "sim"] },
    { slug: "rhythm", num: "08", part: 2, title: "리듬과 반복", ready: false, desc: "반복, 변주, 점진, 패턴. 같은 것을 여러 번 놓을 때 생기는 박자와 그것을 깨는 한 점.", tags: ["질서", "sim"] },
    { slug: "proportion", num: "09", part: 2, title: "비례: 3분할과 황금비", ready: false, desc: "3분할과 황금비의 실제와 신화. 격자를 끌어 명작에 대 보고, 규칙이 맞지 않는 좋은 그림도 본다.", tags: ["질서", "sim"] },
    { slug: "space", num: "10", part: 2, title: "여백과 밀도", ready: false, desc: "비운 자리가 일하는 방식. 밀도의 대비, 동아시아 회화의 여백, 디자인의 숨 쉴 공간.", tags: ["질서", "sim"] },
    { slug: "frame", num: "11", part: 3, title: "프레임과 자르기", ready: false, desc: "화면 비율, 크롭, 프레임 안의 프레임, 가장자리의 긴장. 같은 장면을 어디서 자를 것인가.", tags: ["쓰임", "sim"] },
    { slug: "layout", num: "12", part: 3, title: "지면과 화면 구성", ready: false, desc: "포스터와 웹 첫 화면의 구성. 위계, 정렬, 무리 짓기를 구도의 언어로 다시 본다.", tags: ["쓰임", "sim"] },
    { slug: "reading", num: "13", part: 3, title: "명작의 구도 읽기", ready: false, desc: "공공 도메인 명작 위에 선을 얹어 구도를 읽는다. 동서양 그림의 다른 화면 짜기.", tags: ["쓰임", "sim"] },
    { slug: "lab", num: "14", title: "구도 실험실", ready: false, desc: "이미지 한 장이나 내가 놓은 도형으로 무게중심, 시선 경로, 격자, 여백, 자르기를 한꺼번에 분석하는 종합 도구.", tags: ["실험실", "sim"] },
    { slug: "glossary", num: "15", title: "용어집 & 종합 퀴즈", ready: false, desc: "구도 용어 검색, 종합 퀴즈, 작업 노트 색인, 이미지 크레딧.", tags: ["정리"] },
  ],
};
