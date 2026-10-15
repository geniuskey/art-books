/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../../LICENSE-MIT). Text: CC-BY-4.0 (see ../../LICENSE.md). */
/* ArtBook 서가 목록 — 서가 첫 화면과 각 책 홈의 "같은 서가의 책"이 읽는다.
   status: "published"(출간) | "writing"(집필 중) | "planned"(계획). motif는 서가 첫 화면 표지 그림의 종류다. */
window.AB_SHELF = {
  footer: "화면에 보이는 색은 기기마다 다르다. 작품 이미지는 공공 도메인 자료이며 출처는 크레딧 페이지에 있다. 색채 심리 등 연구 결과가 엇갈리는 주제는 그 수준을 밝혀 두었다.",
  books: [
    { order: 1, path: "color", title: "ColorBook", sub: "색채", status: "published", motif: "wheel",
      desc: "빛과 지각, 색을 숫자로 적는 법, 혼색, 조화, 대비, 접근성, 팔레트. 색은 이름이 아니라 관계라는 것을 만져 보며 배운다.",
      topics: ["빛과 지각", "색 모델", "혼색", "조화", "대비", "접근성", "팔레트"] },
    { order: 2, path: "composition", title: "CompositionBook", sub: "형태와 구도", status: "published", motif: "spiral",
      desc: "점·선·면, 게슈탈트, 균형과 리듬, 3분할과 황금비의 실제, 시선의 흐름, 여백.",
      topics: ["점·선·면", "게슈탈트", "균형", "리듬", "3분할·황금비", "시선 흐름", "여백"] },
    { order: 3, path: "drawing", title: "DrawingBook", sub: "드로잉", status: "published", motif: "perspective",
      desc: "1·2·3점 투시, 빛과 그림자, 비례, 인체의 구조, 제스처.",
      topics: ["투시", "빛과 그림자", "비례", "인체 구조", "제스처"] },
    { order: 4, path: "type", title: "TypeBook", sub: "타이포그래피", status: "published", motif: "glyph",
      desc: "글자의 구조, 한글 타이포그래피, 자간과 행간, 위계, 그리드.",
      topics: ["글자의 구조", "한글 타이포", "자간·행간", "위계", "그리드"] },
    { order: 5, path: "history", title: "ArtHistoryBook", sub: "미술사", status: "published", motif: "timeline",
      desc: "사조의 흐름을 색·구도·기법의 변화로 읽는다.",
      topics: ["사조의 흐름", "색의 변화", "구도의 변화", "기법의 변화"] },
    { order: 6, path: "image", title: "ImageBook", sub: "사진과 이미지", status: "published", motif: "aperture",
      desc: "노출, 렌즈와 원근, 색 보정, 디지털 이미지의 구조.",
      topics: ["노출", "렌즈와 원근", "색 보정", "디지털 이미지"] },
  ],
};
