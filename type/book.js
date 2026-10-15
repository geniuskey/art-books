/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../LICENSE-MIT). Text: CC-BY-4.0 (see ../LICENSE.md). */
/* TypeBook 책 정보 — shared/js/common.js 보다 먼저 불러온다. 한 장을 한 줄에 쓴다(tools가 정규식으로 읽는다). */
document.documentElement.setAttribute("data-book", "type");
window.AB_BOOK = {
  id: "type",
  portalId: "artbook-type",
  title: "TypeBook",
  sub: "타이포그래피",
  tagline: "자간을 줄이고 행간을 늘리며 배우는 타이포그래피 교과서",
  footer: "가독성 연구는 조건(글자 크기, 매체, 독자)에 따라 결과가 크게 달라진다. 이 책은 근거의 수준을 밝히고, 규칙을 정답이 아닌 출발점으로 다룬다. 예시 글꼴은 SIL 오픈 폰트 라이선스(OFL) 글꼴이다.",
  parts: [
    { key: "letter", name: "글자", en: "Letters" },
    { key: "line", name: "글줄", en: "Lines" },
    { key: "page", name: "지면", en: "Pages" },
    { key: "use", name: "쓰임", en: "Use" },
  ],
  chapters: [
    { slug: "overview", num: "01", title: "타이포그래피의 지도", ready: true, desc: "같은 문장도 어떤 글자로, 어떤 간격으로 짜느냐에 따라 다르게 읽힌다. 글자, 글줄, 지면, 쓰임의 네 갈래와 서윤의 여름 조판 노트.", tags: ["도입", "sim"] },
    { slug: "anatomy", num: "02", part: 0, title: "글자의 해부", ready: true, desc: "기준선, x높이, 어센더와 디센더, 획의 대비, 세리프. 라틴 글자의 뼈대를 손으로 늘려 본다.", tags: ["글자", "sim"] },
    { slug: "hangul", num: "03", part: 0, title: "한글의 구조", ready: true, desc: "초성·중성·종성이 모여 한 자를 이룬다. 네모틀과 탈네모틀, 받침이 있고 없을 때 글자의 무게중심, 한글 글꼴이 수천 자인 이유.", tags: ["글자", "sim"] },
    { slug: "classification", num: "04", part: 0, title: "글꼴의 갈래", ready: true, desc: "명조와 고딕, 세리프와 산세리프, 손글씨와 디스플레이. 분류의 역사와 글꼴을 고르는 질문.", tags: ["글자", "sim"] },
    { slug: "spacing", num: "05", part: 1, title: "자간과 커닝", ready: true, desc: "글자 사이의 빈 공간을 고르게 보이게 하는 법. 트래킹과 커닝, 한글의 자간, 크기에 따라 달라지는 간격.", tags: ["글줄", "sim"] },
    { slug: "leading", num: "06", part: 1, title: "행간과 글줄 길이", ready: true, desc: "줄 사이와 한 줄의 길이. 글줄 길이·행간·글자 크기가 서로 맞물리는 방식과 근거의 수준.", tags: ["글줄", "sim"] },
    { slug: "readability", num: "07", part: 1, title: "읽히는 글자", ready: true, desc: "판독성과 가독성, 글자 크기와 대비, 시력과 거리. 세리프가 더 잘 읽힌다는 통설을 연구로 다시 본다.", tags: ["글줄", "sim"] },
    { slug: "hierarchy", num: "08", part: 2, title: "위계", ready: true, desc: "크기, 굵기, 색, 간격으로 정보의 순서를 만든다. 모듈 스케일과 두세 단계면 충분한 이유.", tags: ["지면", "sim"] },
    { slug: "grid", num: "09", part: 2, title: "그리드", ready: true, desc: "단, 여백, 거터, 기준선 격자. 그리드를 세우고 깨는 법, 한글 원고지와 정사각 격자.", tags: ["지면", "sim"] },
    { slug: "alignment", num: "10", part: 2, title: "정렬과 단락", ready: true, desc: "왼끝 맞추기, 양끝 맞추기, 가운데 맞추기. 강물 현상, 줄바꿈과 낱말 끊기, 한글의 어절 단위 줄바꿈.", tags: ["지면", "sim"] },
    { slug: "screen", num: "11", part: 3, title: "화면의 글자", ready: true, desc: "픽셀 위의 글자, 힌팅과 안티에일리어싱, 웹폰트와 용량, 가변 글꼴, 반응형 글자 크기.", tags: ["쓰임", "sim"] },
    { slug: "display", num: "12", part: 3, title: "제목과 레터링", ready: true, desc: "큰 글자는 다르게 짠다. 제목 자간, 로고타입, 손으로 그린 레터링, 간판의 글자.", tags: ["쓰임", "sim"] },
    { slug: "lab", num: "13", title: "조판 실험실", ready: true, desc: "글 한 편을 놓고 글꼴, 크기, 자간, 행간, 글줄 길이, 정렬, 위계를 한꺼번에 조정하며 비교하는 종합 도구.", tags: ["실험실", "sim"] },
    { slug: "glossary", num: "14", title: "용어집 & 종합 퀴즈", ready: true, desc: "타이포그래피 용어 검색, 종합 퀴즈, 조판 노트 색인, 글꼴과 이미지 크레딧.", tags: ["정리"] },
  ],
};
