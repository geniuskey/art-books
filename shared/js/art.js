/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../../LICENSE-MIT).
   Educational content: CC-BY-4.0 (see ../../LICENSE.md). */
/* ==========================================================================
   ArtBook 공통 계산 엔진 — 전역 객체 ART
   모든 책(색채, 구도, 드로잉, 타이포, 미술사, 이미지)이 같은 계산을 쓰도록 모은다.
   - 색 변환: sRGB ↔ 선형 RGB ↔ XYZ ↔ CIELAB/LCh ↔ OKLab/OKLCH, HSL/HSV, 색역 검사·클리핑·색역 매핑
   - 색 거리·대비: ΔE76, ΔE2000, ΔEOK, WCAG 2 대비비, APCA(참고)
   - 분광: CIE 1931 등색 함수 근사, 플랑크 복사, 교육용 광원 모형, 반사 스펙트럼 → 색
   - 혼색: 가산(빛), 병치(점묘), 단순 감산(필터), 쿠벨카–뭉크 단일 상수 모형(물감, 교육용)
   - 지각: 색각이상 시뮬레이션(Machado 2009), 색온도, 브래드퍼드 색순응·화이트밸런스
   - 조화: OKLCH·RYB 색상환 배색, 톤 스케일
   - 팔레트: k-평균 주요 색 추출, 순차·발산·범주 팔레트, 구분도 검사
   - 기하: 3분할·황금비 격자, 1·2·3점 투시 투영, 광원–그림자 투영
   색은 특별한 말이 없으면 감마 인코딩된 sRGB 배열 [r, g, b](각 0~1)로 주고받는다.
   브라우저(classic script)와 node(require) 양쪽에서 동작한다. 검산: node tools/test-art.cjs
   ========================================================================== */
(function (root) {
  "use strict";
  const ART = {};

  /* ------------------------------------------------------------ 작은 도구 */
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const deg = Math.PI / 180;
  const mod360 = (h) => ((h % 360) + 360) % 360;
  const mul = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2], M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2], M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]];
  const matmul = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
  function inv3(m) {
    const [a, b, c] = m[0], [d, e, f] = m[1], [g, h, i] = m[2];
    const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
    const det = a * A + b * B + c * C;
    return [[A / det, -(b * i - c * h) / det, (b * f - c * e) / det], [B / det, (a * i - c * g) / det, -(a * f - c * d) / det], [C / det, -(a * h - b * g) / det, (a * e - b * d) / det]];
  }
  ART.clamp = clamp;
  ART.mod360 = mod360;
  ART.mat = { mul, matmul, inv3 };
  /** 시드 고정 난수(mulberry32). 같은 시드면 같은 결과 → 본문 숫자가 재현된다. */
  ART.rng = function (seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  /* ------------------------------------------------------------ 표기 변환 */
  /** "#3a7" "#33aa77" "rgb(51,170,119)" → [0.2, 0.667, 0.467] */
  ART.parse = function (s) {
    if (Array.isArray(s)) return s.slice(0, 3);
    s = String(s).trim();
    let m = s.match(/^#?([0-9a-f]{3})$/i);
    if (m) return m[1].split("").map((c) => parseInt(c + c, 16) / 255);
    m = s.match(/^#?([0-9a-f]{6})$/i);
    if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
    m = s.match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/i);
    if (m) return [m[1], m[2], m[3]].map((v) => Number(v) / 255);
    throw new Error("ART.parse: 알 수 없는 색 " + s);
  };
  /** [r,g,b] → "#rrggbb" (색역 밖 값은 잘라서 적는다) */
  ART.hex = function (rgb) {
    return "#" + rgb.map((v) => Math.round(clamp(v, 0, 1) * 255).toString(16).padStart(2, "0")).join("");
  };
  /** [r,g,b] → "rgb(51 170 119)" */
  ART.css = (rgb) => `rgb(${rgb.map((v) => Math.round(clamp(v, 0, 1) * 255)).join(" ")})`;
  ART.to255 = (rgb) => rgb.map((v) => Math.round(clamp(v, 0, 1) * 255));

  /* ------------------------------------------------------------ sRGB 전달 함수 */
  // IEC 61966-2-1:1999 (sRGB). 선형 구간 0.04045 / 0.0031308.
  ART.toLinear = (c) => { const a = Math.abs(c); return Math.sign(c) * (a <= 0.04045 ? a / 12.92 : Math.pow((a + 0.055) / 1.055, 2.4)); };
  ART.toGamma = (c) => { const a = Math.abs(c); return Math.sign(c) * (a <= 0.0031308 ? 12.92 * a : 1.055 * Math.pow(a, 1 / 2.4) - 0.055); };
  ART.srgbToLinear = (rgb) => rgb.map(ART.toLinear);
  ART.linearToSrgb = (lin) => lin.map(ART.toGamma);

  /* ------------------------------------------------------------ XYZ (D65) */
  // 선형 sRGB → XYZ 행렬. CSS Color Module Level 4의 sRGB 정의(원색 xy와 D65 백색점에서 유도)를 따른다.
  const M_RGB2XYZ = [
    [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
    [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
    [0.01933081871559182, 0.11919477979462598, 0.9505321522496607],
  ];
  const M_XYZ2RGB = inv3(M_RGB2XYZ);
  /** D65 백색점 XYZ(Y=1). x=0.3127, y=0.3290 (CIE 15:2004, CSS Color 4) */
  ART.D65 = [0.3127 / 0.329, 1, (1 - 0.3127 - 0.329) / 0.329];
  ART.linearToXyz = (lin) => mul(M_RGB2XYZ, lin);
  ART.xyzToLinear = (xyz) => mul(M_XYZ2RGB, xyz);
  ART.srgbToXyz = (rgb) => ART.linearToXyz(ART.srgbToLinear(rgb));
  ART.xyzToSrgb = (xyz) => ART.linearToSrgb(ART.xyzToLinear(xyz));
  /** XYZ → 색도 좌표 [x, y, Y] */
  ART.xyzToXyY = (xyz) => { const s = xyz[0] + xyz[1] + xyz[2]; return s ? [xyz[0] / s, xyz[1] / s, xyz[1]] : [0.3127, 0.329, 0]; };
  ART.xyYToXyz = ([x, y, Y]) => (y ? [(x * Y) / y, Y, ((1 - x - y) * Y) / y] : [0, 0, 0]);

  /* ------------------------------------------------------------ CIELAB / LCh */
  // CIE 15:2004. ε = 216/24389, κ = 24389/27 (CIE가 권고하는 정확한 유리수 값)
  const EPS = 216 / 24389, KAPPA = 24389 / 27;
  ART.xyzToLab = function (xyz, white = ART.D65) {
    const f = (t) => (t > EPS ? Math.cbrt(t) : (KAPPA * t + 16) / 116);
    const fx = f(xyz[0] / white[0]), fy = f(xyz[1] / white[1]), fz = f(xyz[2] / white[2]);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  };
  ART.labToXyz = function (lab, white = ART.D65) {
    const fy = (lab[0] + 16) / 116, fx = fy + lab[1] / 500, fz = fy - lab[2] / 200;
    const fi = (t) => (t * t * t > EPS ? t * t * t : (116 * t - 16) / KAPPA);
    const yr = lab[0] > KAPPA * EPS ? fy * fy * fy : lab[0] / KAPPA;
    return [fi(fx) * white[0], yr * white[1], fi(fz) * white[2]];
  };
  ART.labToLch = ([L, a, b]) => [L, Math.hypot(a, b), mod360(Math.atan2(b, a) / deg)];
  ART.lchToLab = ([L, C, h]) => [L, C * Math.cos(h * deg), C * Math.sin(h * deg)];
  ART.srgbToLab = (rgb) => ART.xyzToLab(ART.srgbToXyz(rgb));
  ART.labToSrgb = (lab) => ART.xyzToSrgb(ART.labToXyz(lab));
  ART.srgbToLch = (rgb) => ART.labToLch(ART.srgbToLab(rgb));
  ART.lchToSrgb = (lch) => ART.labToSrgb(ART.lchToLab(lch));
  /** CIELAB 명도 L*(0~100). "흑백으로 보기"의 기준값 */
  ART.lightness = (rgb) => ART.srgbToLab(rgb)[0];
  /** 같은 L*의 회색 sRGB */
  ART.grayOf = (rgb) => { const y = ART.srgbToXyz(rgb)[1], g = ART.toGamma(y); return [g, g, g]; };

  /* ------------------------------------------------------------ OKLab / OKLCH */
  // Björn Ottosson, "A perceptual color space for image processing" (2020). https://bottosson.github.io/posts/oklab/
  ART.linearToOklab = function ([r, g, b]) {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  };
  ART.oklabToLinear = function ([L, a, b]) {
    const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
    const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
    const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  };
  ART.oklabToOklch = ([L, a, b]) => [L, Math.hypot(a, b), mod360(Math.atan2(b, a) / deg)];
  ART.oklchToOklab = ([L, C, h]) => [L, C * Math.cos(h * deg), C * Math.sin(h * deg)];
  ART.srgbToOklab = (rgb) => ART.linearToOklab(ART.srgbToLinear(rgb));
  ART.oklabToSrgb = (lab) => ART.linearToSrgb(ART.oklabToLinear(lab));
  ART.srgbToOklch = (rgb) => ART.oklabToOklch(ART.srgbToOklab(rgb));
  /** OKLCH → sRGB. 색역 밖이면 0~1을 벗어난 값을 그대로 돌려준다(ART.inGamut으로 확인, ART.gamutMap으로 매핑). */
  ART.oklchToSrgb = (lch) => ART.oklabToSrgb(ART.oklchToOklab(lch));

  /* ------------------------------------------------------------ HSL / HSV */
  // Smith, A. R. (1978) "Color gamut transform pairs", SIGGRAPH. CSS Color 4의 hsl() 정의와 같다.
  ART.srgbToHsl = function ([r, g, b]) {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0, s = 0;
    if (d > 1e-12) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  };
  ART.hslToSrgb = function ([h, s, l]) {
    h = mod360(h);
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [f(0), f(8), f(4)];
  };
  ART.srgbToHsv = function ([r, g, b]) {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    const h = ART.srgbToHsl([r, g, b])[0];
    return [h, mx ? d / mx : 0, mx];
  };
  ART.hsvToSrgb = function ([h, s, v]) {
    h = mod360(h);
    const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
    return [f(5), f(3), f(1)];
  };

  /* ------------------------------------------------------------ 색역 */
  /** sRGB 색역 안인가(작은 계산 오차 허용) */
  ART.inGamut = (rgb, eps = 1e-4) => rgb.every((v) => v >= -eps && v <= 1 + eps);
  /** 채널별로 0~1에 자른다(가장 단순한 클리핑: 색상이 틀어질 수 있다) */
  ART.clip = (rgb) => rgb.map((v) => clamp(v, 0, 1));
  /** 색역 밖 sRGB 값을 명도·색상을 지키며 화면 안으로(OKLCH 채도 줄이기). 색역 안이면 그대로 */
  ART.fit = (rgb) => (ART.inGamut(rgb, 1e-6) ? ART.clip(rgb) : ART.gamutMap(ART.srgbToOklch(rgb)));
  ART.deltaEOK = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  /**
   * OKLCH 색을 sRGB 색역 안으로 매핑. 명도와 색상을 지키고 채도만 줄인다.
   * CSS Color Module Level 4 §13.2의 이진 탐색 알고리즘(JND 0.02, ε 0.0001)을 따른다.
   * 반환: sRGB 배열(항상 0~1)
   */
  ART.gamutMap = function (lch) {
    const [L, C, h] = lch;
    if (L >= 1) return [1, 1, 1];
    if (L <= 0) return [0, 0, 0];
    let rgb = ART.oklchToSrgb(lch);
    if (ART.inGamut(rgb, 1e-6)) return ART.clip(rgb);
    const JND = 0.02, E = 0.0001;
    let lo = 0, hi = C, minIn = true, clipped = ART.clip(rgb);
    if (ART.deltaEOK(ART.srgbToOklab(clipped), ART.oklchToOklab(lch)) < JND) return clipped;
    while (hi - lo > E) {
      const c = (lo + hi) / 2, cur = [L, c, h];
      rgb = ART.oklchToSrgb(cur);
      if (minIn && ART.inGamut(rgb, 1e-6)) { lo = c; continue; }
      clipped = ART.clip(rgb);
      const dE = ART.deltaEOK(ART.srgbToOklab(clipped), ART.oklchToOklab(cur));
      if (dE < JND) { if (JND - dE < E) return clipped; minIn = false; lo = c; }
      else hi = c;
    }
    return ART.clip(ART.oklchToSrgb([L, lo, h]));
  };
  /** 주어진 OKLCH 명도·색상에서 sRGB가 낼 수 있는 최대 채도(이진 탐색) */
  ART.maxChroma = function (L, h) {
    let lo = 0, hi = 0.5;
    for (let i = 0; i < 30; i++) { const c = (lo + hi) / 2; if (ART.inGamut(ART.oklchToSrgb([L, c, h]), 1e-6)) lo = c; else hi = c; }
    return lo;
  };

  /* ------------------------------------------------------------ 색 거리 */
  /** CIE76 색차: Lab 공간의 유클리드 거리 */
  ART.deltaE76 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  /**
   * CIEDE2000 색차. CIE 142-2001.
   * 구현은 Sharma, Wu, Dalal (2005) "The CIEDE2000 color-difference formula: Implementation notes,
   * supplementary test data, and mathematical observations", Color Res. Appl. 30(1)을 따른다(같은 논문의 시험 자료로 검산).
   */
  ART.deltaE2000 = function (lab1, lab2, kL = 1, kC = 1, kH = 1) {
    const [L1, a1, b1] = lab1, [L2, a2, b2] = lab2;
    const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
    const G = 0.5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));
    const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
    const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
    const hp = (a, b) => (a === 0 && b === 0 ? 0 : mod360(Math.atan2(b, a) / deg));
    const h1p = hp(a1p, b1), h2p = hp(a2p, b2);
    const dLp = L2 - L1, dCp = C2p - C1p;
    let dhp = 0;
    if (C1p * C2p !== 0) { dhp = h2p - h1p; if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360; }
    const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * deg);
    const Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
    let hbp = h1p + h2p;
    if (C1p * C2p !== 0) { if (Math.abs(h1p - h2p) > 180) hbp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2; else hbp = (h1p + h2p) / 2; }
    const T = 1 - 0.17 * Math.cos((hbp - 30) * deg) + 0.24 * Math.cos(2 * hbp * deg) + 0.32 * Math.cos((3 * hbp + 6) * deg) - 0.2 * Math.cos((4 * hbp - 63) * deg);
    const dTheta = 30 * Math.exp(-Math.pow((hbp - 275) / 25, 2));
    const RC = 2 * Math.sqrt(Math.pow(Cbp, 7) / (Math.pow(Cbp, 7) + Math.pow(25, 7)));
    const SL = 1 + (0.015 * Math.pow(Lbp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbp - 50, 2));
    const SC = 1 + 0.045 * Cbp, SH = 1 + 0.015 * Cbp * T;
    const RT = -Math.sin(2 * dTheta * deg) * RC;
    return Math.sqrt(Math.pow(dLp / (kL * SL), 2) + Math.pow(dCp / (kC * SC), 2) + Math.pow(dHp / (kH * SH), 2) + RT * (dCp / (kC * SC)) * (dHp / (kH * SH)));
  };
  /** 두 sRGB 색의 ΔE2000 */
  ART.diff = (rgb1, rgb2) => ART.deltaE2000(ART.srgbToLab(rgb1), ART.srgbToLab(rgb2));

  /* ------------------------------------------------------------ 대비 */
  /** WCAG 2 상대 휘도. W3C WCAG 2.2 "relative luminance" (sRGB 선형화 후 Rec.709 계수) */
  ART.luminance = (rgb) => ART.srgbToXyz(rgb)[1];
  /** WCAG 2 대비비(1~21). 본문 글자 AA 4.5, 큰 글자 AA 3, AAA 7 / 4.5 */
  ART.contrast = function (rgb1, rgb2) {
    const a = ART.luminance(rgb1), b = ART.luminance(rgb2);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  ART.wcagLevel = function (ratio, large) {
    if (large) return ratio >= 4.5 ? "AAA" : ratio >= 3 ? "AA" : "미달";
    return ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "미달";
  };
  /**
   * APCA 명도 대비 Lc(참고용). APCA-W3 0.0.98G-4g 상수(Myndex, Andrew Somers).
   * WCAG 3 초안에서 검토 중인 방식이며 아직 표준이 아니다. 글자색·배경색 순서가 결과에 영향을 준다.
   * 양수: 밝은 배경의 어두운 글자, 음수: 어두운 배경의 밝은 글자.
   */
  ART.apca = function (text, bg) {
    const Y = (rgb) => {
      let y = 0.2126729 * Math.pow(rgb[0], 2.4) + 0.7151522 * Math.pow(rgb[1], 2.4) + 0.072175 * Math.pow(rgb[2], 2.4);
      return y < 0.022 ? y + Math.pow(0.022 - y, 1.414) : y;
    };
    const yt = Y(text.map((v) => clamp(v, 0, 1))), yb = Y(bg.map((v) => clamp(v, 0, 1)));
    if (Math.abs(yb - yt) < 0.0005) return 0;
    if (yb > yt) { const s = (Math.pow(yb, 0.56) - Math.pow(yt, 0.57)) * 1.14; return s < 0.1 ? 0 : (s - 0.027) * 100; }
    const s = (Math.pow(yb, 0.65) - Math.pow(yt, 0.62)) * 1.14;
    return s > -0.1 ? 0 : (s + 0.027) * 100;
  };

  /* ------------------------------------------------------------ 분광 */
  /** 파장 표본 380~780 nm, 5 nm 간격(81개) */
  const WL = []; for (let l = 380; l <= 780; l += 5) WL.push(l);
  ART.WL = WL;
  /**
   * CIE 1931 2° 등색 함수의 해석적 근사(다중 로브 가우스).
   * Wyman, Sloan, Shirley (2013) "Simple Analytic Approximations to the CIE XYZ Color Matching Functions",
   * JCGT 2(2). 원표와의 차이는 교육용으로 충분히 작다(정밀 계산은 CIE 원표를 쓴다).
   */
  ART.cmf = function (l) {
    const g = (x, mu, s1, s2) => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
    return [
      1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
      0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
      1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8),
    ];
  };
  const CMF = WL.map(ART.cmf);
  /** 플랑크 흑체 복사의 상대 분광 분포(560 nm에서 1). 파장 nm, 온도 K */
  ART.planck = function (l, T) {
    const c2 = 1.4388e-2, lm = l * 1e-9, l0 = 560e-9;
    const f = (x) => 1 / (Math.pow(x, 5) * (Math.exp(c2 / (x * T)) - 1));
    return f(lm) / f(l0);
  };
  const gauss = (x, mu, s) => Math.exp(-0.5 * Math.pow((x - mu) / s, 2));
  /**
   * 교육용 광원 모형. 반환: WL과 같은 길이의 상대 분광 분포 배열.
   *  - { type: "blackbody", T }   흑체(백열등은 약 2700~3000 K, CIE 표준광 A는 2856 K 흑체로 정의된다)
   *  - "daylight"                 6504 K 흑체로 근사한 낮빛(CIE D65와 모양이 다르다. 렌더링에서 D65 백색으로 맞춘다)
   *  - "A"                        CIE 표준광 A(2856 K 흑체)
   *  - { type: "led", T }         청색 LED + 형광체 모형 백색 LED(교육용)
   *  - "fluorescent"              세 파장 형광등 모형: 좁은 봉우리 435·545·610 nm(교육용)
   *  - "sodium"                   저압 나트륨등 모형: 589 nm 단색에 가깝다(교육용)
   */
  ART.illuminant = function (spec) {
    if (Array.isArray(spec)) return spec;
    if (spec === "daylight") spec = { type: "blackbody", T: 6504 };
    if (spec === "A") spec = { type: "blackbody", T: 2856 };
    if (spec === "fluorescent") return WL.map((l) => 0.06 + 0.9 * gauss(l, 435, 4) + 1.4 * gauss(l, 545, 5) + 1.1 * gauss(l, 611, 6) + 0.12 * gauss(l, 580, 40));
    if (spec === "sodium") return WL.map((l) => 0.01 + gauss(l, 589, 3));
    if (spec.type === "blackbody") return WL.map((l) => ART.planck(l, spec.T));
    if (spec.type === "led") {
      const T = spec.T || 4000, blue = clamp((T - 2200) / 6000, 0.08, 0.9);
      return WL.map((l) => blue * 1.3 * gauss(l, 450, 10) + gauss(l, 565 + (4000 - T) / 120, 55));
    }
    throw new Error("ART.illuminant: 알 수 없는 광원");
  };
  /** 분광 분포(광원 × 반사율) → XYZ. 완전 반사면(반사율 1)의 Y가 1이 되도록 정규화한다. */
  ART.spectrumToXyz = function (illum, refl) {
    const S = ART.illuminant(illum);
    let X = 0, Y = 0, Z = 0, N = 0;
    for (let i = 0; i < WL.length; i++) {
      const r = refl ? (typeof refl === "function" ? refl(WL[i]) : refl[i]) : 1, e = S[i];
      X += e * r * CMF[i][0]; Y += e * r * CMF[i][1]; Z += e * r * CMF[i][2]; N += e * CMF[i][1];
    }
    return [X / N, Y / N, Z / N];
  };
  /** 광원의 백색점 XYZ(Y=1) */
  ART.whitePoint = (illum) => ART.spectrumToXyz(illum, null);
  /**
   * 단색광 한 파장의 sRGB 근사(스펙트럼 띠 그리기용). 색역 밖이라 음수 채널을 자르고 가장 밝은 채널을 1로 맞춘다.
   * 해석적 등색 함수 근사는 약 650 nm 위와 420 nm 아래에서 색도가 되돌아가므로(꼬리의 오차) 그 바깥은 끝 색도로 고정한다.
   */
  ART.wavelengthToSrgb = function (l) {
    const [x, y, z] = ART.cmf(clamp(l, 420, 650));
    // 스펙트럼 색은 모두 sRGB 색역 밖이다. 음수 채널은 잘라 색상을 지킨다(흰색을 섞으면 끝부분이 분홍으로 뜬다).
    const lin = ART.xyzToLinear([x, y, z]).map((v) => Math.max(0, v));
    const mx = Math.max(...lin, 1e-9);
    return ART.linearToSrgb(lin.map((v) => v / mx));
  };

  /* ------------------------------------------------------------ 색순응 · 화이트밸런스 */
  // 브래드퍼드 원추 응답 행렬. Lam (1985), CIECAM97s에서 쓰인 선형화 버전(Hunt, Measuring Colour 4판).
  const M_BFD = [[0.8951, 0.2664, -0.1614], [-0.7502, 1.7135, 0.0367], [0.0389, -0.0685, 1.0296]];
  const M_BFD_I = inv3(M_BFD);
  /** 폰 크리스 방식 브래드퍼드 색순응: srcWhite 아래에서 본 XYZ를 dstWhite 아래 대응색으로 */
  ART.adapt = function (xyz, srcWhite, dstWhite = ART.D65) {
    const s = mul(M_BFD, srcWhite), d = mul(M_BFD, dstWhite), c = mul(M_BFD, xyz);
    return mul(M_BFD_I, [c[0] * d[0] / s[0], c[1] * d[1] / s[1], c[2] * d[2] / s[2]]);
  };
  const DAY_WHITE = ART.whitePoint("daylight");
  /**
   * 반사 스펙트럼을 광원 아래에서 본 색(sRGB, 색역 밖 값은 그대로).
   * balance:
   *  - "adapted"  눈이 그 광원에 완전히 순응했다(흰 종이가 희게 보인다)
   *  - "daylight" 카메라 화이트밸런스를 낮빛에 고정했다(백열등 아래는 주황빛으로 찍힌다) — 기본값
   *  - "none"     순응 없이 XYZ를 그대로 sRGB로
   */
  ART.renderReflectance = function (refl, illum = "daylight", balance = "daylight") {
    let xyz = ART.spectrumToXyz(illum, refl);
    if (balance === "adapted") xyz = ART.adapt(xyz, ART.whitePoint(illum), ART.D65);
    else if (balance === "daylight") xyz = ART.adapt(xyz, DAY_WHITE, ART.D65);
    return ART.xyzToSrgb(xyz);
  };
  /** 색온도 K → 그 흑체 빛의 sRGB(가장 밝은 채널이 1). 화면에 "빛의 색"을 칠할 때 쓴다. */
  ART.cctToSrgb = function (T) {
    const xyz = ART.adapt(ART.whitePoint({ type: "blackbody", T }), DAY_WHITE, ART.D65);
    let lin = ART.xyzToLinear(xyz).map((v) => Math.max(0, v));
    const mx = Math.max(...lin);
    return ART.linearToSrgb(lin.map((v) => v / mx));
  };
  /** 색도 xy → 상관 색온도(McCamy 1992, Color Res. Appl. 17(2) 근사식, 약 2000~12500 K에서 유효) */
  ART.cctFromXy = function (x, y) { const n = (x - 0.332) / (0.1858 - y); return 449 * n * n * n + 3525 * n * n + 6823.3 * n + 5520.33; };
  /**
   * 화이트밸런스: 광원 fromT(K) 아래에서 찍힌 sRGB 색을 toT(K, 기본 낮빛) 아래의 대응색으로 옮긴다.
   * 카메라의 "색온도" 설정과 같은 일을 브래드퍼드 색순응으로 한다.
   */
  ART.whiteBalance = function (rgb, fromT, toT) {
    const src = ART.adapt(ART.whitePoint({ type: "blackbody", T: fromT }), DAY_WHITE, ART.D65);
    const dst = toT ? ART.adapt(ART.whitePoint({ type: "blackbody", T: toT }), DAY_WHITE, ART.D65) : ART.D65;
    return ART.xyzToSrgb(ART.adapt(ART.srgbToXyz(rgb), src, dst));
  };

  /* ------------------------------------------------------------ 반사 스펙트럼과 물감 */
  const logistic = (x, mu, w) => 1 / (1 + Math.exp(-(x - mu) / w));
  // 세 개의 부드러운 띠(단파장·중파장·장파장)로 반사 스펙트럼을 만든다. 세 띠의 합은 어디서나 1(흰색 = 평탄한 반사율).
  const BAND = WL.map((l) => { const b = 1 - logistic(l, 490, 14), r = logistic(l, 595, 14); return [b, 1 - b - r, r]; });
  const toBand = (w) => BAND.map((B) => clamp(w[0] * B[2] + w[1] * B[1] + w[2] * B[0], 0.001, 0.999));
  // 띠 가중치 (r, g, b) → 낮빛 순응 렌더링 선형 RGB 의 3×3 사상(선형이므로 표본 세 개로 결정)
  const F_BAND = (function () {
    const cols = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((w) => ART.xyzToLinear(ART.adapt(ART.spectrumToXyz("daylight", BAND.map((B) => w[0] * B[2] + w[1] * B[1] + w[2] * B[0])), DAY_WHITE, ART.D65)));
    return [[cols[0][0], cols[1][0], cols[2][0]], [cols[0][1], cols[1][1], cols[2][1]], [cols[0][2], cols[1][2], cols[2][2]]];
  })();
  const F_BAND_I = inv3(F_BAND);
  /**
   * sRGB 색 → 그 색으로 보이는 부드러운 반사 스펙트럼(교육용 역추정).
   * 낮빛 아래 렌더링하면 원래 색으로 돌아온다(아주 진한 색은 반사율 0~1 제한 때문에 조금 어긋난다).
   * 실제 물체의 스펙트럼은 하나로 정해지지 않는다(메타메리즘). 이것은 가능한 답 중 하나다.
   */
  ART.reflectanceFromSrgb = (rgb) => toBand(mul(F_BAND_I, ART.srgbToLinear(rgb)));
  /**
   * 교육용 물감 반사 스펙트럼. 실제 안료 측정값이 아니라, 안료의 반사 스펙트럼 모양(어디서 오르고 어디서 꺼지는지)을
   * 흉내 낸 매끈한 함수다. S는 단위 양당 산란 계수의 상대값이다. 흡수 K = (K/S)·S 이므로 S가 크면
   * 같은 양으로 섞을 때 색을 강하게 낸다(착색력). 프탈로 블루처럼 착색력이 센 안료는 크게, 레몬 옐로처럼 약한 안료는 작게
   * 잡았다. 값은 화가들이 경험으로 아는 대략의 성질을 흉내 낸 교육용 설정이며 측정값이 아니다.
   */
  const P = (name, en, S, f) => ({ name, en, S, refl: WL.map((l) => clamp(f(l), 0.002, 0.98)) });
  ART.PAINTS = {
    white:      P("티타늄 화이트", "Titanium white", 1.0, (l) => 0.9 - 0.25 * (1 - logistic(l, 410, 8))),
    black:      P("아이보리 블랙", "Ivory black", 0.8, () => 0.012),
    lemon:      P("레몬 옐로", "Lemon yellow", 0.3, (l) => 0.05 + 0.82 * logistic(l, 500, 10) - 0.1 * logistic(l, 640, 25)),
    yellow:     P("카드뮴 옐로 미디엄", "Cadmium yellow medium", 0.45, (l) => 0.04 + 0.84 * logistic(l, 522, 10)),
    ochre:      P("옐로 오커", "Yellow ochre", 0.35, (l) => 0.07 + 0.55 * logistic(l, 548, 22)),
    orange:     P("카드뮴 오렌지", "Cadmium orange", 0.45, (l) => 0.04 + 0.82 * logistic(l, 570, 10)),
    red:        P("카드뮴 레드", "Cadmium red", 0.5, (l) => 0.03 + 0.82 * logistic(l, 600, 9)),
    crimson:    P("알리자린 크림슨", "Alizarin crimson", 0.35, (l) => 0.04 + 0.1 * gauss(l, 420, 22) + 0.75 * logistic(l, 612, 16)),
    magenta:    P("퀴나크리돈 마젠타", "Quinacridone magenta", 0.4, (l) => 0.05 + 0.32 * gauss(l, 425, 30) + 0.8 * logistic(l, 610, 14)),
    sienna:     P("번트 시에나", "Burnt sienna", 0.3, (l) => 0.04 + 0.4 * logistic(l, 595, 26)),
    umber:      P("번트 엄버", "Burnt umber", 0.35, (l) => 0.03 + 0.17 * logistic(l, 590, 35)),
    ultramarine:P("울트라마린 블루", "Ultramarine blue", 0.3, (l) => 0.04 + 0.5 * gauss(l, 450, 26) + 0.12 * logistic(l, 690, 18)),
    phthalo:    P("프탈로 블루", "Phthalo blue", 0.7, (l) => 0.04 + 0.4 * gauss(l, 470, 30) + 0.03 * logistic(l, 680, 20)),
    cerulean:   P("세룰리안 블루", "Cerulean blue", 0.35, (l) => 0.08 + 0.46 * gauss(l, 480, 40)),
    viridian:   P("비리디언", "Viridian", 0.3, (l) => 0.05 + 0.4 * gauss(l, 512, 32) + 0.02 * logistic(l, 650, 20)),
    sap:        P("샙 그린", "Sap green", 0.3, (l) => 0.04 + 0.32 * gauss(l, 540, 34) + 0.06 * logistic(l, 640, 20)),
  };
  /** 쿠벨카–뭉크 흡수/산란비 K/S 와 그 역 (Kubelka & Munk 1931, 불투명하게 두껍게 칠한 층의 근사) */
  ART.ks = (R) => ((1 - R) * (1 - R)) / (2 * R);
  ART.ksToR = (ks) => 1 + ks - Math.sqrt(ks * ks + 2 * ks);
  /**
   * 물감 섞기(쿠벨카–뭉크 2상수 모형, Duncan 1940의 혼합 규칙).
   * parts: [{paint: "lemon", amount}] 또는 [{refl, amount, S?}]
   * 각 물감의 반사율에서 K/S를 구하고 K = (K/S)·S 로 나눈 뒤, 파장마다 K와 S를 양으로 가중 합해 다시 반사율로 바꾼다.
   * 교육용 단순 모형: 실제로는 안료마다 K와 S를 분광 측정해야 하고, 바인더·두께·바탕·표면 반사(Saunderson 보정)에 따라 달라진다.
   * 반환: 섞인 반사 스펙트럼 배열
   */
  ART.mixKM = function (parts) {
    const ps = parts.map((p) => { const pt = p.paint ? ART.PAINTS[p.paint] : p; return { refl: pt.refl, S: p.S || pt.S || 0.3, c: p.amount == null ? 1 : p.amount }; }).filter((p) => p.c > 0);
    if (!ps.length) return WL.map(() => 0.9);
    return WL.map((_, i) => {
      let K = 0, S = 0;
      ps.forEach((p) => { K += p.c * ART.ks(p.refl[i]) * p.S; S += p.c * p.S; });
      return ART.ksToR(K / S);
    });
  };
  /** 물감 섞기 결과를 바로 sRGB로(낮빛 아래) */
  ART.mixPaints = (parts, illum, balance) => ART.renderReflectance(ART.mixKM(parts), illum, balance);
  /** 물감 이름의 낮빛 아래 sRGB */
  ART.paintColor = (key, illum, balance) => ART.renderReflectance(ART.PAINTS[key].refl, illum, balance);

  /**
   * 메타머(조건등색 쌍) 만들기: refl과 광원 illum 아래에서 같은 XYZ를 내지만 스펙트럼이 다른 반사율.
   * 물결 모양 섭동 wiggle(λ)에서 광원×등색 함수 세 줄이 보는 성분을 빼(직교 사영) 더한다.
   * 그래서 그 광원 아래에서는 정확히 같은 색, 다른 광원 아래에서는 다른 색이 된다.
   * o: { amp(섭동 크기, 기본 0.16), period(nm, 기본 140), phase(nm, 기본 0) }
   */
  ART.metamer = function (refl, illum = "daylight", o = {}) {
    const S = ART.illuminant(illum), amp = o.amp == null ? 0.16 : o.amp, per = o.period || 140, ph = o.phase || 0;
    const W = [0, 1, 2].map((k) => WL.map((_, i) => S[i] * CMF[i][k]));
    let p = WL.map((l) => amp * Math.sin((2 * Math.PI * (l - 380 + ph)) / per));
    const G = [0, 1, 2].map((a) => [0, 1, 2].map((b) => W[a].reduce((s, v, i) => s + v * W[b][i], 0)));
    const Wp = [0, 1, 2].map((a) => W[a].reduce((s, v, i) => s + v * p[i], 0));
    const c = mul(inv3(G), Wp);
    p = p.map((v, i) => v - (c[0] * W[0][i] + c[1] * W[1][i] + c[2] * W[2][i]));
    return refl.map((r, i) => clamp(r + p[i], 0.001, 0.999));
  };

  /* ------------------------------------------------------------ 혼색 (sRGB 수준) */
  /** 가산 혼합: 빛을 겹쳐 비춘다. 선형광을 더한다(1을 넘으면 그만큼 밝아진다, 화면에는 잘려 보인다). */
  ART.mixAdd = (...cols) => ART.linearToSrgb(cols.reduce((s, c) => { const l = ART.srgbToLinear(c); return [s[0] + l[0], s[1] + l[1], s[2] + l[2]]; }, [0, 0, 0]));
  /**
   * 병치 혼합(점묘·직물·하프톤): 작은 점이 눈에서 섞인다. 선형광의 넓이 가중 평균.
   * 감마 인코딩 값을 평균내면 실제보다 어둡게 나온다(디지털 이미지 축소의 흔한 오류).
   */
  ART.mixOptical = (a, b, t = 0.5) => ART.linearToSrgb(ART.srgbToLinear(a).map((v, i) => v * (1 - t) + ART.srgbToLinear(b)[i] * t));
  /** 단순 감산 혼합(색 필터·셀로판을 겹친다): 선형 투과율의 곱. t는 b의 두께 비율 */
  ART.mixFilter = (a, b, t = 0.5) => { const la = ART.srgbToLinear(a), lb = ART.srgbToLinear(b); return ART.linearToSrgb(la.map((v, i) => Math.pow(Math.max(v, 1e-6), 2 * (1 - t)) * Math.pow(Math.max(lb[i], 1e-6), 2 * t))); };
  /** 감마 값을 그대로 평균하는 잘못된(하지만 흔한) 섞기. 비교용 */
  ART.mixNaive = (a, b, t = 0.5) => a.map((v, i) => v * (1 - t) + b[i] * t);
  /** OKLab에서 보간(지각적으로 고른 그라데이션) */
  ART.mixOklab = (a, b, t = 0.5) => { const A = ART.srgbToOklab(a), B = ART.srgbToOklab(b); return ART.clip(ART.oklabToSrgb(A.map((v, i) => v * (1 - t) + B[i] * t))); };
  /** sRGB 색을 반사 스펙트럼으로 바꿔 쿠벨카–뭉크로 섞는다(임의의 색을 "물감처럼" 섞어 보기, 교육용) */
  ART.mixAsPaint = (a, b, t = 0.5) => ART.clip(ART.renderReflectance(ART.mixKM([{ refl: ART.reflectanceFromSrgb(a), amount: 1 - t }, { refl: ART.reflectanceFromSrgb(b), amount: t }])));

  /* ------------------------------------------------------------ 색각이상 시뮬레이션 */
  // Machado, Oliveira, Fernandes (2009) "A Physiologically-based Model for Simulation of Color Vision Deficiency",
  // IEEE TVCG 15(6). 심도 1.0 행렬(선형 RGB에 곱한다). 중간 심도는 논문의 표 대신 단위행렬과 선형 보간한 근사다.
  const MACHADO = {
    protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
    tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
  };
  ART.CVD_TYPES = { protan: "제1색각이상(적색약·적색맹)", deutan: "제2색각이상(녹색약·녹색맹)", tritan: "제3색각이상(청색약·청색맹)", achroma: "전색각이상(색을 거의 못 느낌)" };
  /** type: "protan" | "deutan" | "tritan" | "achroma", severity 0~1 */
  ART.simulateCVD = function (rgb, type, severity = 1) {
    if (!type || type === "normal" || severity <= 0) return rgb.slice();
    const lin = ART.srgbToLinear(rgb);
    let out;
    if (type === "achroma") { const y = ART.linearToXyz(lin)[1]; out = lin.map((v) => v * (1 - severity) + y * severity); }
    else {
      const M = MACHADO[type], s = clamp(severity, 0, 1);
      const Ms = M.map((r, i) => r.map((v, j) => (i === j ? 1 : 0) * (1 - s) + v * s));
      out = mul(Ms, lin);
    }
    return ART.linearToSrgb(out.map((v) => clamp(v, 0, 1)));
  };

  /* ------------------------------------------------------------ 조화 · 색상환 */
  // 전통 RYB(빨강·노랑·파랑) 색상환과 RGB 색상각을 잇는 구간 선형 대응표.
  // 표준이 있는 것이 아니라, 이텐식 12색상환의 배치(빨강 0°, 주황 60°, 노랑 120°, 초록 180°, 파랑 240°, 보라 300°)를
  // sRGB 색상각(빨강 0°, 주황 약 30°, 노랑 60°, 초록 120°, 파랑 약 230°, 보라 약 280°)에 맞춘 이 책의 약속이다.
  const RYB_PTS = [[0, 0], [60, 30], [120, 60], [180, 120], [240, 230], [300, 280], [360, 360]];
  const interp = (pts, x, a, b) => { x = mod360(x); for (let i = 1; i < pts.length; i++) if (x <= pts[i][a]) { const p = pts[i - 1], q = pts[i], t = (x - p[a]) / (q[a] - p[a] || 1); return p[b] + t * (q[b] - p[b]); } return x; };
  /** RYB 색상환 각도 → sRGB(HSL) 색상각 */
  ART.rybToHue = (r) => mod360(interp(RYB_PTS, r, 0, 1));
  /** sRGB(HSL) 색상각 → RYB 색상환 각도 */
  ART.hueToRyb = (h) => mod360(interp(RYB_PTS, h, 1, 0));
  ART.SCHEMES = {
    complementary: { name: "보색", offsets: [0, 180] },
    analogous: { name: "유사색", offsets: [-30, 0, 30] },
    triadic: { name: "삼각 배색", offsets: [0, 120, 240] },
    split: { name: "분할 보색", offsets: [0, 150, 210] },
    square: { name: "사각 배색", offsets: [0, 90, 180, 270] },
  };
  /**
   * 배색 생성. wheel:
   *  - "oklch": 지각 색상환. 기준색의 OKLCH 명도·채도를 지키고 색상만 돌린 뒤 색역 매핑
   *  - "ryb":   전통 색상환. HSL 채도·명도를 지키고 RYB 각도로 돌린다
   *  - "hsl":   화면 색상환(HSL). 비교용
   * 반환: [{rgb, hue(그 색상환의 각도)}]
   */
  ART.harmony = function (rgb, scheme = "complementary", wheel = "oklch") {
    const offs = (ART.SCHEMES[scheme] || ART.SCHEMES.complementary).offsets;
    if (wheel === "oklch") {
      const [L, C, h] = ART.srgbToOklch(rgb);
      return offs.map((o) => ({ rgb: o === 0 ? rgb.slice() : ART.gamutMap([L, C, mod360(h + o)]), hue: mod360(h + o) }));
    }
    const [h, s, l] = ART.srgbToHsl(rgb);
    if (wheel === "hsl") return offs.map((o) => ({ rgb: o === 0 ? rgb.slice() : ART.hslToSrgb([h + o, s, l]), hue: mod360(h + o) }));
    const r = ART.hueToRyb(h);
    return offs.map((o) => ({ rgb: o === 0 ? rgb.slice() : ART.hslToSrgb([ART.rybToHue(r + o), s, l]), hue: mod360(r + o) }));
  };
  /**
   * 톤 스케일(명도 단계): 기준색의 색상을 지키며 OKLCH 명도를 n단계로 나눈다.
   * 채도는 기준색 채도와 그 명도에서 낼 수 있는 최대 채도 중 작은 값(× chromaScale).
   */
  ART.toneScale = function (rgb, n = 9, o = {}) {
    const [, C, h] = ART.srgbToOklch(rgb);
    const L0 = o.from == null ? 0.18 : o.from, L1 = o.to == null ? 0.96 : o.to, k = o.chromaScale == null ? 1 : o.chromaScale;
    return Array.from({ length: n }, (_, i) => { const L = L0 + ((L1 - L0) * i) / Math.max(1, n - 1); return ART.gamutMap([L, Math.min(C * k, ART.maxChroma(L, h)), h]); });
  };

  /* ------------------------------------------------------------ 팔레트 */
  /**
   * 주요 색 추출: OKLab에서 k-평균 군집(k-means++ 시작점, 시드 고정).
   * pixels: [[r,g,b], ...] 또는 RGBA 바이트 배열(Uint8ClampedArray, 캔버스 ImageData.data).
   * 반환: [{rgb, weight(비율)}] 비율이 큰 순
   */
  ART.kmeans = function (pixels, k = 5, o = {}) {
    const rnd = ART.rng(o.seed || 7), maxN = o.sample || 6000;
    let pts = [];
    if (pixels.length && typeof pixels[0] === "number") {
      const n = pixels.length / 4, step = Math.max(1, Math.floor(n / maxN));
      for (let i = 0; i < n; i += step) if (pixels[i * 4 + 3] > 127) pts.push(ART.srgbToOklab([pixels[i * 4] / 255, pixels[i * 4 + 1] / 255, pixels[i * 4 + 2] / 255]));
    } else {
      const step = Math.max(1, Math.floor(pixels.length / maxN));
      for (let i = 0; i < pixels.length; i += step) pts.push(ART.srgbToOklab(pixels[i]));
    }
    if (!pts.length) return [];
    k = Math.min(k, pts.length);
    const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    const cents = [pts[Math.floor(rnd() * pts.length)].slice()];
    while (cents.length < k) {
      const ds = pts.map((p) => Math.min(...cents.map((c) => d2(p, c))));
      let t = rnd() * ds.reduce((s, v) => s + v, 0), j = 0;
      while (t > ds[j] && j < ds.length - 1) { t -= ds[j]; j++; }
      cents.push(pts[j].slice());
    }
    const lab = new Int32Array(pts.length);
    for (let it = 0; it < (o.iters || 20); it++) {
      let moved = false;
      for (let i = 0; i < pts.length; i++) {
        let best = 0, bd = Infinity;
        for (let c = 0; c < k; c++) { const d = d2(pts[i], cents[c]); if (d < bd) { bd = d; best = c; } }
        if (lab[i] !== best) { lab[i] = best; moved = true; }
      }
      const sum = cents.map(() => [0, 0, 0, 0]);
      for (let i = 0; i < pts.length; i++) { const s = sum[lab[i]]; s[0] += pts[i][0]; s[1] += pts[i][1]; s[2] += pts[i][2]; s[3]++; }
      sum.forEach((s, c) => { if (s[3]) cents[c] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
      if (!moved && it > 0) break;
    }
    const cnt = cents.map(() => 0); for (let i = 0; i < pts.length; i++) cnt[lab[i]]++;
    return cents.map((c, i) => ({ rgb: ART.clip(ART.oklabToSrgb(c)), weight: cnt[i] / pts.length })).filter((c) => c.weight > 0).sort((a, b) => b.weight - a.weight);
  };
  /** 순차 팔레트: 한 색상에서 밝은 쪽 → 어두운 쪽(OKLCH). 데이터의 크기 순서를 명도로 보여 준다. */
  ART.sequential = function (hue, n = 7, o = {}) {
    const L0 = o.light == null ? 0.95 : o.light, L1 = o.dark == null ? 0.3 : o.dark, Cm = o.chroma == null ? 0.16 : o.chroma, dh = o.hueShift || 0;
    return Array.from({ length: n }, (_, i) => {
      const t = i / Math.max(1, n - 1), L = L0 + (L1 - L0) * t, C = Cm * Math.sin(Math.PI * (0.15 + 0.7 * t));
      return ART.gamutMap([L, C, mod360(hue + dh * t)]);
    });
  };
  /** 발산 팔레트: 두 색상 끝에서 가운데 밝은 회색으로 모인다. 기준값(0, 평균)의 위아래를 보여 준다. */
  ART.diverging = function (h1, h2, n = 9, o = {}) {
    const Lend = o.end == null ? 0.45 : o.end, Lmid = o.mid == null ? 0.96 : o.mid, Cm = o.chroma == null ? 0.15 : o.chroma;
    return Array.from({ length: n }, (_, i) => {
      const t = (i / Math.max(1, n - 1)) * 2 - 1, a = Math.abs(t), L = Lmid + (Lend - Lmid) * Math.pow(a, 0.9);
      return ART.gamutMap([L, Cm * Math.pow(a, 0.8), t < 0 ? h1 : h2]);
    });
  };
  /** 범주 팔레트: 같은 명도·채도에서 색상을 고르게 나눈다(황금각 간격 또는 균등 간격) */
  ART.categorical = function (n = 6, o = {}) {
    const L = o.L == null ? 0.66 : o.L, C = o.C == null ? 0.14 : o.C, h0 = o.h0 == null ? 25 : o.h0;
    const step = o.golden ? 137.508 : 360 / n;
    return Array.from({ length: n }, (_, i) => ART.gamutMap([L, C, mod360(h0 + step * i)]));
  };
  /**
   * 구분도 검사: 팔레트에서 가장 비슷한 두 색의 ΔE2000. cvd를 주면 그 색각으로 본 뒤 잰다.
   * 반환: { min, pair:[i,j], all:[[i,j,ΔE]] }
   */
  ART.distinguish = function (colors, cvd, severity = 1) {
    const cs = colors.map((c) => ART.srgbToLab(cvd ? ART.simulateCVD(c, cvd, severity) : c));
    let min = Infinity, pair = [0, 0];
    const all = [];
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
      const d = ART.deltaE2000(cs[i], cs[j]); all.push([i, j, d]);
      if (d < min) { min = d; pair = [i, j]; }
    }
    return { min, pair, all };
  };

  /* ------------------------------------------------------------ 기하 (구도·드로잉 책을 위해) */
  ART.PHI = (1 + Math.sqrt(5)) / 2;
  /** 3분할 격자선: {v:[x1,x2], h:[y1,y2]} */
  ART.thirds = (w, h) => ({ v: [w / 3, (2 * w) / 3], h: [h / 3, (2 * h) / 3] });
  /** 황금비 격자선(1 : 0.618 : 1 분할): {v:[...], h:[...]} */
  ART.phiGrid = function (w, h) { const r = 1 / (1 + ART.PHI); return { v: [w * r, w * (1 - r)], h: [h * r, h * (1 - r)] }; };
  /**
   * 황금 직사각형 분할(나선용). 가로가 긴 사각형 (x, y, w, h)에서 정사각형을 차례로 떼어 낸다.
   * 반환: [{x, y, s, corner}] 정사각형과 사분원 호의 중심 모서리
   */
  ART.goldenSquares = function (x, y, w, h, n = 8) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const dir = i % 4;
      if (dir === 0) { const s = h; out.push({ x, y, s, cx: x + s, cy: y + s, a0: Math.PI, a1: 1.5 * Math.PI }); x += s; w -= s; }
      else if (dir === 1) { const s = w; out.push({ x, y, s, cx: x, cy: y + s, a0: 1.5 * Math.PI, a1: 2 * Math.PI }); y += s; h -= s; }
      else if (dir === 2) { const s = h; out.push({ x: x + w - s, y, s, cx: x + w - s, cy: y, a0: 0, a1: 0.5 * Math.PI }); w -= s; }
      else { const s = w; out.push({ x, y: y + h - s, s, cx: x + s, cy: y + h - s, a0: 0.5 * Math.PI, a1: Math.PI }); h -= s; }
      if (w <= 0.5 || h <= 0.5) break;
    }
    return out;
  };
  /**
   * 핀홀 카메라 투시 투영. 세계 좌표(y 위쪽)의 점 p=[x,y,z]를 화면 좌표로.
   * cam: { pos:[x,y,z], yaw(도, 왼쪽 +), pitch(도, 위 +), f(초점거리, 화면 px), cx, cy(화면 중심) }
   * 반환: [sx, sy, depth] (depth ≤ 0이면 카메라 뒤)
   * 1점 투시: 상자 면이 화면과 나란할 때(yaw=pitch=0), 2점: yaw≠0, 3점: yaw·pitch≠0
   */
  ART.project = function (p, cam) {
    const yw = (cam.yaw || 0) * deg, pt = (cam.pitch || 0) * deg;
    let x = p[0] - cam.pos[0], y = p[1] - cam.pos[1], z = p[2] - cam.pos[2];
    // 카메라는 +z 방향을 본다. yaw: y축 회전, pitch: x축 회전
    let x1 = x * Math.cos(yw) - z * Math.sin(yw), z1 = x * Math.sin(yw) + z * Math.cos(yw);
    let y2 = y * Math.cos(pt) - z1 * Math.sin(pt), z2 = y * Math.sin(pt) + z1 * Math.cos(pt);
    const f = cam.f || 500;
    return [(cam.cx || 0) + (f * x1) / z2, (cam.cy || 0) - (f * y2) / z2, z2];
  };
  /** 방향 d=[dx,dy,dz]로 뻗는 평행선들의 소실점(화면 좌표). 화면과 나란하면 null */
  ART.vanishingPoint = function (d, cam) {
    const far = 1e7, o = cam.pos;
    const q = ART.project([o[0] + d[0] * far, o[1] + d[1] * far, o[2] + d[2] * far], cam);
    return q[2] > 1e-6 * far ? [q[0], q[1]] : null;
  };
  /**
   * 그림자 투영: 점 p를 광원에서 바닥면(y = ground)으로.
   * light: { pos:[x,y,z] } 점광원 또는 { dir:[dx,dy,dz] } 평행광(햇빛, dy<0)
   */
  ART.shadowPoint = function (p, light, ground = 0) {
    if (light.dir) { const d = light.dir, t = (ground - p[1]) / d[1]; return [p[0] + d[0] * t, ground, p[2] + d[2] * t]; }
    const L = light.pos, t = (L[1] - ground) / (L[1] - p[1]);
    return [L[0] + (p[0] - L[0]) * t, ground, L[2] + (p[2] - L[2]) * t];
  };

  /* ------------------------------------------------------------ 이름 붙은 예시 색 */
  /**
   * 오방색(五方色)의 대표 예시값. 전통 색에는 하나로 정해진 수치가 없다.
   * 여기 값은 화면에서 보여 주기 위한 이 책의 예시이며, 문헌·유물마다 색이 다르다는 점을 본문에서 밝힌다.
   */
  ART.OBANG = {
    blue: { name: "청(靑)", dir: "동", hex: "#1f5aa6" },
    red: { name: "적(赤)", dir: "남", hex: "#c8232c" },
    yellow: { name: "황(黃)", dir: "중앙", hex: "#e8b21e" },
    white: { name: "백(白)", dir: "서", hex: "#f4f1e8" },
    black: { name: "흑(黑)", dir: "북", hex: "#1d1d1f" },
  };

  if (typeof module !== "undefined" && module.exports) module.exports = ART;
  else root.ART = ART;
})(typeof window !== "undefined" ? window : this);
