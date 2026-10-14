/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../LICENSE-MIT). Text: CC-BY-4.0 (see ../LICENSE.md). */
/* ColorBook 책 정보 — shared/js/common.js 보다 먼저 불러온다.
   part: PARTS의 인덱스(도입·실험실·용어집처럼 부가 없는 장은 생략). ready: false인 장은 목록에 "준비 중"으로만 보인다.
   tools/head.py와 tools/check.py가 이 파일의 slug/num/part/title/ready를 정규식으로 읽으므로 한 장을 한 줄에 쓴다. */
document.documentElement.setAttribute("data-book", "color");
window.AB_BOOK = {
  id: "color",
  portalId: "artbook-color",
  title: "ColorBook",
  sub: "색채",
  tagline: "보고, 만지고, 섞어 보며 배우는 색채 교과서",
  footer: "화면에 보이는 색은 기기마다 다르다. 작품 이미지는 공공 도메인 자료이며 출처는 크레딧 페이지에 있다. 색채 심리 등 연구 결과가 엇갈리는 주제는 그 수준을 밝혀 두었다.",
  parts: [
    { key: "perception", name: "지각", en: "Perception" },
    { key: "system", name: "체계", en: "System" },
    { key: "relation", name: "관계", en: "Relation" },
    { key: "use", name: "쓰임", en: "Use" },
  ],
  chapters: [
    { slug: "overview", num: "01", title: "색의 지도", ready: true, desc: "색은 빛·물체·눈·뇌 중 어디에 있는가. 색을 배우는 세 갈래(빛·물감·지각), 화면 색의 한계, 책 전체의 지도와 서윤의 작업 노트.", tags: ["도입", "sim"] },
    { slug: "light", num: "02", part: 0, title: "빛과 눈", ready: true, desc: "스펙트럼, 원뿔세포 세 종류, 메타메리즘, 조명에 따라 같은 색이 다르게 보이는 이유.", tags: ["지각", "sim"] },
    { slug: "models", num: "03", part: 1, title: "색을 숫자로", ready: true, desc: "RGB·HSL의 함정, Lab·OKLCH 같은 지각 균일 공간, 화면이 낼 수 있는 색의 범위(색역).", tags: ["체계", "sim"] },
    { slug: "mixing", num: "04", part: 1, title: "섞기", ready: true, desc: "가산 혼합과 감산 혼합, 물감을 섞으면 탁해지는 이유, 제한 팔레트로 섞기.", tags: ["체계", "sim"] },
    { slug: "wheel", num: "05", part: 1, title: "색상환과 조화", ready: true, desc: "RYB 색상환과 지각 색상환의 차이, 보색·유사·삼각 배색, 조화 공식의 한계.", tags: ["체계", "sim"] },
    { slug: "value", num: "06", part: 2, title: "명도가 먼저다", ready: true, desc: "흑백으로 보기, 명도 구조와 노탄, 명도만으로 그림이 읽히는 이유.", tags: ["관계", "sim"] },
    { slug: "chroma", num: "07", part: 2, title: "채도와 톤", ready: true, desc: "채도 조절, 회색의 힘, 톤 스케일, 탁한 색으로 선명한 색 살리기.", tags: ["관계", "sim"] },
    { slug: "contrast", num: "08", part: 2, title: "대비", ready: true, desc: "이텐의 일곱 가지 대비, 강조와 초점 만들기.", tags: ["관계", "sim"] },
    { slug: "relativity", num: "09", part: 2, title: "색은 상대적이다", ready: true, desc: "알베르스의 실험, 동시대비와 동화, 색 항상성, 색의 착시.", tags: ["관계", "sim"] },
    { slug: "temperature", num: "10", part: 0, title: "빛의 색과 그림자의 색", ready: false, desc: "색온도, 화이트밸런스, 시간대별 빛, 그림자에 들어가는 색.", tags: ["지각", "sim"] },
    { slug: "painting", num: "11", part: 3, title: "그림 속 색", ready: false, desc: "공공 도메인 명작의 팔레트 분석, 인상주의의 색, 수묵의 농담과 오방색.", tags: ["쓰임", "sim"] },
    { slug: "meaning", num: "12", part: 3, title: "색의 의미와 문화", ready: true, desc: "문화권별 색의 의미, 색채 심리 주장의 근거 수준 검토.", tags: ["쓰임", "sim"] },
    { slug: "access", num: "13", part: 3, title: "모두를 위한 색", ready: true, desc: "색각이상 시뮬레이션, WCAG 대비, 색에만 의존하지 않는 정보 표현.", tags: ["쓰임", "sim"] },
    { slug: "palette", num: "14", part: 3, title: "팔레트 만들기", ready: true, desc: "UI 팔레트, 브랜드 색, 데이터 시각화 팔레트, 이미지에서 색 뽑기.", tags: ["쓰임", "sim"] },
    { slug: "print", num: "15", part: 3, title: "화면과 인쇄", ready: true, desc: "RGB와 CMYK, 색역 밖의 색, 색 관리의 기초, 인쇄물에서 색이 달라지는 이유.", tags: ["쓰임", "sim"] },
    { slug: "lab", num: "16", title: "색 실험실", ready: true, desc: "이미지 한 장을 넣어 명도·채도·색상·대비·접근성을 분석하고 팔레트를 뽑는 종합 도구.", tags: ["실험실", "sim"] },
    { slug: "glossary", num: "17", title: "용어집 & 종합 퀴즈", ready: true, desc: "핵심 용어 검색, 종합 퀴즈, 이미지 크레딧.", tags: ["정리"] },
  ],
};
