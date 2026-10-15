/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../LICENSE-MIT). Text: CC-BY-4.0 (see ../LICENSE.md). */
/* DrawingBook 책 정보 — shared/js/common.js 보다 먼저 불러온다. 한 장을 한 줄에 쓴다(tools가 정규식으로 읽는다). */
document.documentElement.setAttribute("data-book", "drawing");
window.AB_BOOK = {
  id: "drawing",
  portalId: "artbook-drawing",
  title: "DrawingBook",
  sub: "드로잉",
  tagline: "소실점을 끌고 빛을 옮기며 배우는 드로잉 교과서",
  footer: "투시와 그림자는 기하학으로 맞출 수 있지만, 좋은 드로잉이 기하학으로 끝나지는 않는다. 비례 규범(8등신 등)은 평균이 아니라 관습이다. 작품 이미지는 공공 도메인 자료이며 출처는 크레딧 페이지에 있다.",
  parts: [
    { key: "see", name: "보기", en: "Seeing" },
    { key: "space", name: "공간", en: "Space" },
    { key: "light", name: "빛", en: "Light" },
    { key: "body", name: "몸", en: "Body" },
  ],
  chapters: [
    { slug: "overview", num: "01", title: "드로잉의 지도", ready: true, desc: "그리기는 손보다 눈의 일이다. 보기, 공간, 빛, 몸의 네 갈래와 책 전체의 지도, 서윤의 봄 스케치북.", tags: ["도입", "sim"] },
    { slug: "seeing", num: "02", part: 0, title: "보이는 대로 보기", ready: true, desc: "아는 것을 그리지 않고 보이는 것을 그리기. 윤곽선, 음형, 연필로 재는 측정, 각도 맞추기.", tags: ["보기", "sim"] },
    { slug: "line", num: "03", part: 0, title: "선과 해칭", ready: true, desc: "선의 굵기·속도·압력이 만드는 표정. 해칭, 크로스해칭, 점묘로 명암 쌓기. 동아시아 필선의 준법.", tags: ["보기", "sim"] },
    { slug: "perspective1", num: "04", part: 1, title: "1점 투시", ready: true, desc: "눈높이, 수평선, 소실점. 바닥 타일과 복도를 끌어 보며 원근의 규칙을 몸으로 익힌다.", tags: ["공간", "sim"] },
    { slug: "perspective2", num: "05", part: 1, title: "2점·3점 투시", ready: true, desc: "모서리를 마주한 건물, 올려다본 탑. 소실점 사이 거리와 왜곡, 측정점으로 깊이 나누기.", tags: ["공간", "sim"] },
    { slug: "ellipse", num: "06", part: 1, title: "원과 타원", ready: true, desc: "원은 기울면 타원이 된다. 눈높이에 따른 타원의 폭, 원통과 컵, 바퀴, 흔한 실수.", tags: ["공간", "sim"] },
    { slug: "form", num: "07", part: 1, title: "상자로 생각하기", ready: true, desc: "복잡한 물체를 상자·원통·구로 단순화하기. 단면선과 구조선으로 입체를 세운다.", tags: ["공간", "sim"] },
    { slug: "light", num: "08", part: 2, title: "명암의 단계", ready: true, desc: "하이라이트, 중간톤, 명암 경계, 반사광, 투영 그림자. 구에 빛을 옮겨 보며 명암의 질서를 본다.", tags: ["빛", "sim"] },
    { slug: "shadow", num: "09", part: 2, title: "그림자 그리기", ready: true, desc: "햇빛과 전등의 그림자를 기하학으로 투영한다. 그림자의 길이, 방향, 가장자리의 선명도.", tags: ["빛", "sim"] },
    { slug: "landscape", num: "10", part: 2, title: "풍경과 대기", ready: true, desc: "대기 원근, 가까운 곳과 먼 곳의 명도·대비, 나무와 구름의 단순화, 동아시아의 삼원법.", tags: ["빛", "sim"] },
    { slug: "proportion", num: "11", part: 3, title: "인체의 비례", ready: true, desc: "머리 몇 개 키인가. 등신 규범의 역사와 실제 사람들의 다양성, 아이와 어른, 원근 속의 키.", tags: ["몸", "sim"] },
    { slug: "anatomy", num: "12", part: 3, title: "몸의 구조", ready: true, desc: "골격과 큰 근육 덩어리, 관절이 움직이는 범위. 손과 얼굴을 덩어리로 세운다.", tags: ["몸", "sim"] },
    { slug: "gesture", num: "13", part: 3, title: "제스처와 크로키", ready: true, desc: "동작선, 무게중심과 콘트라포스토, 30초·2분 크로키. 정확함보다 먼저 움직임을 잡는다.", tags: ["몸", "sim"] },
    { slug: "lab", num: "14", title: "드로잉 실험실", ready: true, desc: "장면을 놓고 눈높이·소실점·빛의 방향·인체 비례를 함께 조정하며 밑그림을 세우는 종합 도구.", tags: ["실험실", "sim"] },
    { slug: "glossary", num: "15", title: "용어집 & 종합 퀴즈", ready: true, desc: "드로잉 용어 검색, 종합 퀴즈, 스케치북 색인, 이미지 크레딧.", tags: ["정리"] },
  ],
};
