/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../LICENSE-MIT). Text: CC-BY-4.0 (see ../LICENSE.md). */
/* ImageBook 책 정보 — shared/js/common.js 보다 먼저 불러온다. 한 장을 한 줄에 쓴다(tools가 정규식으로 읽는다). */
document.documentElement.setAttribute("data-book", "image");
window.AB_BOOK = {
  id: "image",
  portalId: "artbook-image",
  title: "ImageBook",
  sub: "사진과 이미지",
  tagline: "셔터를 누르고 화소를 들여다보며 배우는 사진과 디지털 이미지",
  footer: "카메라와 화면, 파일 형식의 동작은 기종과 소프트웨어마다 다르다. 이 책의 시뮬레이터는 원리를 보여 주는 단순 모형이며 그렇다고 밝혔다. 사진 이미지는 공공 도메인 자료이며 출처는 크레딧 페이지에 있다.",
  parts: [
    { key: "light", name: "빛", en: "Light" },
    { key: "lens", name: "렌즈", en: "Lens" },
    { key: "pixel", name: "화소", en: "Pixels" },
    { key: "use", name: "쓰임", en: "Use" },
  ],
  chapters: [
    { slug: "overview", num: "01", title: "이미지의 지도", ready: true, desc: "빛이 렌즈를 지나 화소가 되고 화면과 종이에 다시 나타나기까지. 빛, 렌즈, 화소, 쓰임의 네 갈래와 서윤의 겨울 촬영 노트.", tags: ["도입", "sim"] },
    { slug: "exposure", num: "02", part: 0, title: "노출", ready: true, desc: "조리개, 셔터 속도, 감도. 빛의 양을 정하는 세 손잡이와 스톱, 그리고 각각이 남기는 흔적(심도, 흔들림, 노이즈).", tags: ["빛", "sim"] },
    { slug: "histogram", num: "03", part: 0, title: "히스토그램과 다이내믹 레인지", ready: true, desc: "밝기의 분포를 읽는 법. 날아간 하이라이트와 뭉개진 그림자, 센서와 눈의 다이내믹 레인지, 노출 보정.", tags: ["빛", "sim"] },
    { slug: "light", num: "04", part: 0, title: "사진의 빛", ready: true, desc: "빛의 방향, 크기, 색. 창가의 부드러운 빛과 한낮의 단단한 빛, 반사판과 역광.", tags: ["빛", "sim"] },
    { slug: "lens", num: "05", part: 1, title: "초점거리와 화각", ready: true, desc: "초점거리가 화각을 정한다. 센서 크기와 환산 초점거리, 광각과 망원의 실제 차이.", tags: ["렌즈", "sim"] },
    { slug: "perspective", num: "06", part: 1, title: "거리와 원근", ready: true, desc: "망원이 배경을 당긴다는 말의 진실. 원근은 렌즈가 아니라 거리가 정한다. 얼굴 왜곡과 건물의 기울어짐.", tags: ["렌즈", "sim"] },
    { slug: "focus", num: "07", part: 1, title: "초점과 심도", ready: true, desc: "착란원, 피사계 심도, 과초점 거리, 보케. 무엇이 선명하고 무엇이 흐려지는가.", tags: ["렌즈", "sim"] },
    { slug: "pixel", num: "08", part: 2, title: "화소와 센서", ready: true, desc: "광자가 전하가 되고 숫자가 되기까지. 베이어 필터와 디모자이크, 비트 깊이, 노이즈의 정체.", tags: ["화소", "sim"] },
    { slug: "color", num: "09", part: 2, title: "색 보정", ready: true, desc: "화이트 밸런스, 톤 커브, 레벨, 채도와 HSL. 보정이 하는 일과 되돌릴 수 없는 일.", tags: ["화소", "sim"] },
    { slug: "compression", num: "10", part: 2, title: "해상도와 압축", ready: true, desc: "해상도와 ppi, 리샘플링, JPEG의 블록과 양자화, PNG와 WebP. 용량과 화질의 거래.", tags: ["화소", "sim"] },
    { slug: "composition", num: "11", part: 3, title: "사진의 구도와 자르기", ready: true, desc: "파인더 안에서 정하는 구도. 배경 정리, 시선, 크롭과 비율, 연속 사진에서 고르기.", tags: ["쓰임", "sim"] },
    { slug: "history", num: "12", part: 3, title: "사진의 역사", ready: true, desc: "카메라 옵스큐라에서 다게레오타입, 습판, 필름, 디지털까지. 공공 도메인 사진으로 보는 매체의 변화.", tags: ["쓰임", "sim"] },
    { slug: "lab", num: "13", title: "이미지 실험실", ready: true, desc: "사진 한 장의 히스토그램, 노출, 화이트 밸런스, 커브, 크롭, 압축을 한꺼번에 조정하고 비교하는 종합 도구.", tags: ["실험실", "sim"] },
    { slug: "glossary", num: "14", title: "용어집 & 종합 퀴즈", ready: true, desc: "사진·이미지 용어 검색, 종합 퀴즈, 촬영 노트 색인, 이미지 크레딧.", tags: ["정리"] },
  ],
};
