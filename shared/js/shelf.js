/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../../LICENSE-MIT). Text: CC-BY-4.0 (see ../../LICENSE.md). */
/* ArtBook 서가 목록 — 서가 첫 화면과 각 책 홈의 "같은 서가의 책"이 읽는다.
   status: "published"(출간) | "writing"(집필 중) | "planned"(계획). motif는 서가 첫 화면 표지 그림의 종류다.
   새 책은 books에 한 항목을 더하면 서가 첫 화면의 책장·분야 필터·검색·통계에 저절로 들어간다.
   code: 표지 아래 세 글자 코드, group: groups의 id, color/colorDark: 표지·칩 색(라이트/다크), chapters: 준비된 장 수,
   headline: 책장 표지 아래 한 줄 소개. */
window.AB_SHELF = {
  footer: "화면에 보이는 색은 기기마다 다르다. 작품 이미지는 공공 도메인 자료이며 출처는 크레딧 페이지에 있다. 색채 심리 등 연구 결과가 엇갈리는 주제는 그 수준을 밝혀 두었다.",
  // 서가 첫 화면의 분야 필터. 순서대로 버튼이 놓인다.
  groups: [
    { id: "basics", label: "조형 기초" },
    { id: "media", label: "글자와 이미지" },
    { id: "history", label: "미술사" },
    { id: "design", label: "디자인" },
  ],
  books: [
    { order: 1, path: "color", code: "COL", group: "basics", color: "#c2255c", colorDark: "#f783ac", chapters: 17,
      headline: "색은 이름이 아니라 관계다", title: "ColorBook", sub: "색채", status: "published", motif: "wheel",
      desc: "빛과 지각, 색을 숫자로 적는 법, 혼색, 조화, 대비, 접근성, 팔레트. 색은 이름이 아니라 관계라는 것을 만져 보며 배운다.",
      topics: ["빛과 지각", "색 모델", "혼색", "조화", "대비", "접근성", "팔레트"] },
    { order: 2, path: "composition", code: "CMP", group: "basics", color: "#d9480f", colorDark: "#ffa94d", chapters: 15,
      headline: "눈이 화면을 읽는 순서", title: "CompositionBook", sub: "형태와 구도", status: "published", motif: "spiral",
      desc: "점·선·면, 게슈탈트, 균형과 리듬, 3분할과 황금비의 실제, 시선의 흐름, 여백.",
      topics: ["점·선·면", "게슈탈트", "균형", "리듬", "3분할·황금비", "시선 흐름", "여백"] },
    { order: 3, path: "drawing", code: "DRW", group: "basics", color: "#8a5a2b", colorDark: "#e0a96d", chapters: 15,
      headline: "아는 대로가 아니라 보이는 대로 그리기", title: "DrawingBook", sub: "드로잉", status: "published", motif: "perspective",
      desc: "1·2·3점 투시, 빛과 그림자, 비례, 인체의 구조, 제스처.",
      topics: ["투시", "빛과 그림자", "비례", "인체 구조", "제스처"] },
    { order: 4, path: "type", code: "TYP", group: "media", color: "#364fc7", colorDark: "#91a7ff", chapters: 14,
      headline: "글자는 읽히기 전에 먼저 보인다", title: "TypeBook", sub: "타이포그래피", status: "published", motif: "glyph",
      desc: "글자의 구조, 한글 타이포그래피, 자간과 행간, 위계, 그리드.",
      topics: ["글자의 구조", "한글 타이포", "자간·행간", "위계", "그리드"] },
    { order: 5, path: "history", code: "HIS", group: "history", color: "#a0700a", colorDark: "#fcc419", chapters: 14,
      headline: "사조를 색·구도·기법의 변화로 읽기", title: "ArtHistoryBook", sub: "미술사", status: "published", motif: "timeline",
      desc: "사조의 흐름을 색·구도·기법의 변화로 읽는다.",
      topics: ["사조의 흐름", "색의 변화", "구도의 변화", "기법의 변화"] },
    { order: 6, path: "image", code: "IMG", group: "media", color: "#0b7285", colorDark: "#66d9e8", chapters: 14,
      headline: "빛을 숫자로 붙잡는 법", title: "ImageBook", sub: "사진과 이미지", status: "published", motif: "aperture",
      desc: "노출, 렌즈와 원근, 색 보정, 디지털 이미지의 구조.",
      topics: ["노출", "렌즈와 원근", "색 보정", "디지털 이미지"] },
    { order: 7, path: "web", code: "WEB", group: "design", color: "#1971c2", colorDark: "#74c0fc", chapters: 14,
      headline: "늘었다 줄었다 하는 화면 위의 디자인", title: "WebBook", sub: "웹 디자인", status: "published", motif: "browser",
      desc: "뷰포트와 박스, 레이아웃 그리드, 반응형, 토큰, 컴포넌트와 상태, 내비게이션, 폼, 모션, 접근성, 속도.",
      topics: ["뷰포트", "그리드", "반응형", "컴포넌트", "폼", "모션", "웹 접근성"] },
    { order: 8, path: "product", code: "PRD", group: "design", color: "#6741d9", colorDark: "#b197fc", chapters: 14,
      headline: "쓰는 사람의 문제에서 시작하는 디자인", title: "ProductBook", sub: "제품 디자인", status: "published", motif: "flow",
      desc: "사용자 조사와 문제 정의, 정보 구조, 사용자 흐름, 상호작용, 프로토타입과 사용성 테스트, 지표, UX 라이팅, 디자인 시스템.",
      topics: ["사용자 조사", "정보 구조", "사용자 흐름", "사용성 테스트", "A/B 테스트", "디자인 시스템"] },
    { order: 9, path: "industrial", code: "IND", group: "design", color: "#2b8a3e", colorDark: "#8ce99a", chapters: 14,
      headline: "손에 쥐고 공장에서 만드는 형태", title: "IndustrialBook", sub: "산업디자인", status: "published", motif: "form",
      desc: "제품 스케치, 형태와 곡면, 비례, 인간공학, 조작, 재료, 생산 공정, 조립, CMF, 지속가능성, 산업디자인사.",
      topics: ["제품 스케치", "곡면", "인간공학", "재료", "사출 성형", "CMF", "지속가능성"] },
  ],
};
