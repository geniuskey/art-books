#!/usr/bin/env node
// Copyright (c) 2026 geniuskey and ArtBook contributors. MIT (see ../LICENSE-MIT).
// 공통 계산 엔진(ART) 검산. 표준 문서·논문의 참값과 비교한다. 실행: node tools/test-art.cjs
"use strict";
const ART = require("../shared/js/art.js");
let fail = 0, pass = 0;
function near(name, got, want, tol) {
  const g = [].concat(got), w = [].concat(want);
  const ok = g.length === w.length && g.every((v, i) => Math.abs(v - w[i]) <= tol);
  if (ok) pass++; else { fail++; console.log("FAIL", name, "got", g.map((v) => +v.toFixed(5)), "want", w); }
}
function truthy(name, cond, info) { if (cond) pass++; else { fail++; console.log("FAIL", name, info || ""); } }

// sRGB ↔ Lab (참값: CIE 15:2004 식으로 계산한 널리 쓰이는 값, D65 2°)
near("red → Lab", ART.srgbToLab([1, 0, 0]), [53.2408, 80.0925, 67.2032], 0.01);
near("white → Lab", ART.srgbToLab([1, 1, 1]), [100, 0, 0], 1e-6);
near("mid gray L*", ART.srgbToLab([0.5, 0.5, 0.5])[0], 53.389, 0.01);
near("Lab round trip", ART.labToSrgb(ART.srgbToLab([0.2, 0.6, 0.35])), [0.2, 0.6, 0.35], 1e-9);
// OKLab (참값: Ottosson 2020 블로그의 sRGB 원색 값)
near("red → OKLab", ART.srgbToOklab([1, 0, 0]), [0.627955, 0.224863, 0.125846], 1e-5);
near("white → OKLab", ART.srgbToOklab([1, 1, 1]), [1, 0, 0], 1e-4);
near("OKLCH round trip", ART.oklchToSrgb(ART.srgbToOklch([0.9, 0.3, 0.1])), [0.9, 0.3, 0.1], 1e-6);
// HSL/HSV
near("HSL of #3a7", ART.srgbToHsl(ART.parse("#33aa77")), [154.2857, 0.53846, 0.43333], 1e-3);
near("HSL round trip", ART.hslToSrgb(ART.srgbToHsl([0.3, 0.8, 0.55])), [0.3, 0.8, 0.55], 1e-12);
near("HSV round trip", ART.hsvToSrgb(ART.srgbToHsv([0.9, 0.2, 0.55])), [0.9, 0.2, 0.55], 1e-12);
truthy("hex", ART.hex([1, 0.5, 0]) === "#ff8000", ART.hex([1, 0.5, 0]));

// CIEDE2000: Sharma, Wu, Dalal (2005) 시험 자료 일부(번호는 논문의 표 1)
const SHARMA = [
  [[50.0, 2.6772, -79.7751], [50.0, 0.0, -82.7485], 2.0425],          // 1
  [[50.0, 3.1571, -77.2803], [50.0, 0.0, -82.7485], 2.8615],          // 2
  [[50.0, 0.0, 0.0], [50.0, -1.0, 2.0], 2.3669],                      // 7
  [[50.0, 2.49, -0.001], [50.0, -2.49, 0.0011], 7.2195],              // 15
  [[50.0, 2.5, 0.0], [73.0, 25.0, -18.0], 27.1492],                   // 21
  [[50.0, 2.5, 0.0], [58.0, 24.0, 15.0], 19.4535],                    // 24
  [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644], // 25
  [[22.7233, 20.0904, -46.694], [23.0331, 14.973, -42.5619], 2.0373],  // 28
  [[90.8027, -2.0831, 1.441], [91.1528, -1.6435, 0.0447], 1.4441],     // 32
  [[2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514], 0.9082],      // 34
];
SHARMA.forEach(([a, b, d], i) => { near("ΔE2000 Sharma #" + i, ART.deltaE2000(a, b), d, 1e-4); near("ΔE2000 symmetric #" + i, ART.deltaE2000(b, a), d, 1e-4); });
near("ΔE76", ART.deltaE76([50, 0, 0], [53, 4, 0]), 5, 1e-12);

// WCAG 2 대비비
near("black/white 21:1", ART.contrast([0, 0, 0], [1, 1, 1]), 21, 1e-9);
near("#767676 on white ≈ 4.54", ART.contrast(ART.parse("#767676"), [1, 1, 1]), 4.54, 0.01);
// APCA 0.0.98G-4g 참값: 검정 글자/흰 배경 106.04, 흰 글자/검정 배경 −107.88, #888/#fff 63.06
near("APCA black on white", ART.apca([0, 0, 0], [1, 1, 1]), 106.04, 0.01);
near("APCA white on black", ART.apca([1, 1, 1], [0, 0, 0]), -107.88, 0.01);
near("APCA #888 on #fff", ART.apca(ART.parse("#888888"), [1, 1, 1]), 63.06, 0.05);

// 분광: 등색 함수 근사가 CIE 원표 값과 가까운가(555 nm ȳ≈1.0, 600 nm x̄≈1.0622, 450 nm z̄≈1.7471)
near("ȳ(555)", ART.cmf(555)[1], 1.0, 0.02);
near("x̄(600)", ART.cmf(600)[0], 1.0622, 0.03);
near("z̄(450)", ART.cmf(450)[2], 1.7471, 0.06);
// 흑체 색도: 2856 K(표준광 A) x=0.4476, y=0.4074. 6504 K 흑체 x≈0.3135, y≈0.3237
const xyA = ART.xyzToXyY(ART.whitePoint("A"));
near("illuminant A xy", [xyA[0], xyA[1]], [0.4476, 0.4074], 0.004);
const xyD = ART.xyzToXyY(ART.whitePoint("daylight"));
near("6504K blackbody xy", [xyD[0], xyD[1]], [0.3135, 0.3237], 0.004);
near("McCamy CCT of A", ART.cctFromXy(0.4476, 0.4074), 2856, 15);
near("McCamy CCT of D65", ART.cctFromXy(0.3127, 0.329), 6504, 30);
// 색순응: 흰색은 흰색으로
near("adapt white", ART.adapt(ART.whitePoint("A"), ART.whitePoint("A"), ART.D65), ART.D65, 1e-9);
near("flat reflector adapted under A is white", ART.renderReflectance(ART.WL.map(() => 1), "A", "adapted"), [1, 1, 1], 1e-6);
near("flat reflector under daylight is white", ART.renderReflectance(ART.WL.map(() => 1), "daylight"), [1, 1, 1], 1e-6);
const warm = ART.renderReflectance(ART.WL.map(() => 1), "A", "daylight");
truthy("white under A looks orange with daylight balance", warm[0] > 1 && warm[2] < 0.6, warm);
near("cctToSrgb(6504) ≈ white", ART.cctToSrgb(6504), [1, 1, 1], 0.01);
// 반사 스펙트럼 역추정: 중간 채도 색은 되돌아온다
[[0.6, 0.4, 0.3], [0.2, 0.5, 0.7], [0.5, 0.5, 0.5], [0.85, 0.75, 0.2]].forEach((c) =>
  near("reflectance round trip " + ART.hex(c), ART.renderReflectance(ART.reflectanceFromSrgb(c)), c, 0.01));

// 메타머: 낮빛에서는 같고 백열등(A)에서는 다르다
const baseR = ART.reflectanceFromSrgb(ART.parse("#8a8f6e")), metR = ART.metamer(baseR, "daylight");
near("metamer matches under daylight", ART.diff(ART.renderReflectance(baseR), ART.renderReflectance(metR)), 0, 0.05);
const dA = ART.diff(ART.renderReflectance(baseR, "A", "adapted"), ART.renderReflectance(metR, "A", "adapted"));
truthy("metamer differs under illuminant A", dA > 2, dA);

// 물감 혼합(쿠벨카–뭉크): 노랑 + 파랑 → 초록, 빛 혼합에서는 회색/흰색
const yellow = ART.paintColor("lemon"), blue = ART.paintColor("phthalo");
const green = ART.mixPaints([{ paint: "lemon", amount: 1 }, { paint: "phthalo", amount: 0.35 }]);
const gH = ART.srgbToOklch(ART.clip(green))[2];
truthy("lemon + phthalo → green hue (OKLCH 120~175)", gH > 120 && gH < 175, ART.hex(green) + " h=" + gH.toFixed(1));
const lightMix = ART.mixOptical(yellow, blue, 0.5);
truthy("optical mix of yellow & blue is lighter than the paint mix", ART.lightness(ART.clip(lightMix)) > ART.lightness(ART.clip(green)) + 15, ART.hex(lightMix));
const cadRed = ART.paintColor("red");
truthy("cadmium red reads red", ART.srgbToOklch(ART.clip(cadRed))[2] < 45 || ART.srgbToOklch(ART.clip(cadRed))[2] > 350, ART.hex(cadRed));
const tint = ART.mixPaints([{ paint: "red", amount: 1 }, { paint: "white", amount: 3 }]);
truthy("red + white → lighter, pinkish", ART.lightness(ART.clip(tint)) > ART.lightness(ART.clip(cadRed)) + 12, ART.hex(tint));
const blackMix = ART.mixPaints([{ paint: "yellow", amount: 1 }, { paint: "black", amount: 0.4 }]);
const bh = ART.srgbToOklch(ART.clip(blackMix))[2];
truthy("yellow + black → olive (hue moves toward green)", bh > ART.srgbToOklch(ART.clip(ART.paintColor("yellow")))[2] - 5, ART.hex(blackMix));

// 혼색
near("additive R+G = yellow", ART.mixAdd([1, 0, 0], [0, 1, 0]), [1, 1, 0], 1e-9);
near("optical average of black & white is ~0.735 (not 0.5)", ART.mixOptical([0, 0, 0], [1, 1, 1])[0], 0.7354, 1e-3);

// 색각이상: 회색은 그대로, 빨강·초록이 제2색각에서 가까워진다
near("CVD keeps gray", ART.simulateCVD([0.5, 0.5, 0.5], "deutan"), [0.5, 0.5, 0.5], 2e-3);
const r = ART.parse("#d62728"), g = ART.parse("#2ca02c");
truthy("deutan reduces red-green difference", ART.diff(ART.simulateCVD(r, "deutan"), ART.simulateCVD(g, "deutan")) < ART.diff(r, g) * 0.6);

// 색역 매핑
const outside = [0.7, 0.35, 145];
truthy("very saturated green is out of sRGB", !ART.inGamut(ART.oklchToSrgb(outside)));
const mapped = ART.gamutMap(outside);
truthy("gamutMap result in gamut", ART.inGamut(mapped, 1e-9), mapped);
near("gamutMap keeps lightness", ART.srgbToOklch(mapped)[0], 0.7, 0.02);
near("gamutMap keeps hue", ART.srgbToOklch(mapped)[2], 145, 3);
truthy("maxChroma sane", ART.maxChroma(0.7, 145) > 0.15 && ART.maxChroma(0.7, 145) < 0.25, ART.maxChroma(0.7, 145));

// 조화
const comp = ART.harmony([1, 0, 0], "complementary", "ryb")[1].rgb;
truthy("RYB complement of red is green", ART.srgbToHsl(comp)[0] > 100 && ART.srgbToHsl(comp)[0] < 140, ART.hex(comp));
const compOk = ART.harmony(ART.parse("#c8232c"), "complementary", "oklch")[1].rgb;
const hOk = ART.srgbToOklch(compOk)[2];
truthy("OKLCH complement of red is cyan-teal", hOk > 180 && hOk < 220, ART.hex(compOk) + " " + hOk.toFixed(1));
near("RYB mapping round trip", ART.hueToRyb(ART.rybToHue(200)), 200, 1e-9);
const tones = ART.toneScale(ART.parse("#1f5aa6"), 7);
truthy("tone scale monotonic", tones.every((c, i) => i === 0 || ART.lightness(c) > ART.lightness(tones[i - 1])));

// 팔레트
const px = [];
for (let i = 0; i < 300; i++) px.push([0.9, 0.1, 0.1]);
for (let i = 0; i < 200; i++) px.push([0.1, 0.2, 0.8]);
for (let i = 0; i < 100; i++) px.push([0.95, 0.95, 0.9]);
const km = ART.kmeans(px, 3);
near("kmeans weights", km.map((c) => c.weight), [0.5, 1 / 3, 1 / 6], 1e-9);
near("kmeans top color", km[0].rgb, [0.9, 0.1, 0.1], 1e-6);
const cat = ART.categorical(6);
truthy("categorical distinct", ART.distinguish(cat).min > 15, ART.distinguish(cat).min);
const seq = ART.sequential(250, 7);
truthy("sequential monotonic lightness", seq.every((c, i) => i === 0 || ART.lightness(c) < ART.lightness(seq[i - 1])));

// 기하
near("phi grid", ART.phiGrid(1000, 618).v, [381.966, 618.034], 1e-3);
near("thirds", ART.thirds(900, 600).h, [200, 400], 1e-9);
const cam = { pos: [0, 0, -10], yaw: 0, pitch: 0, f: 100, cx: 0, cy: 0 };
near("1-point VP at center", ART.vanishingPoint([0, 0, 1], cam), [0, 0], 1e-6);
truthy("parallel to picture plane has no VP", ART.vanishingPoint([1, 0, 0], cam) === null);
near("project", ART.project([1, 1, 0], cam).slice(0, 2), [10, -10], 1e-9);
near("point light shadow", ART.shadowPoint([1, 1, 0], { pos: [0, 2, 0] }), [2, 0, 0], 1e-9);
near("sun shadow", ART.shadowPoint([0, 2, 0], { dir: [1, -1, 0] }), [2, 0, 0], 1e-9);
truthy("golden squares", ART.goldenSquares(0, 0, 1618, 1000, 6).length === 6);
truthy("golden squares unit size", ART.goldenSquares(0, 0, 1.618, 1, 8).length === 8);

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
