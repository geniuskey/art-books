/* Copyright (c) 2026 geniuskey and ArtBook contributors.
   Executable code: MIT (see ../../LICENSE-MIT). Illustrations: CC-BY-4.0 (see ../../LICENSE.md). */
/* 서가 책 표지 모티프. AB_COVERS[motif]() → SVG 문자열(viewBox 320×200).
   표지는 예시 그림이므로 색을 직접 적는다(테마와 상관없이 같은 색). */
window.AB_COVERS = (function () {
  "use strict";
  const BG = "#1d1b26";
  const wrap = (inner, label) => `<svg class="art" viewBox="0 0 320 200" role="img" aria-label="${label}"><rect width="320" height="200" fill="${BG}"/>${inner}</svg>`;
  const hsl = (h, s, l) => `hsl(${h} ${s}% ${l}%)`;
  return {
    wheel() {
      let s = "";
      const cx = 160, cy = 100, R = 78, r = 40, n = 24;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
        const p = (rr, a) => `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
        s += `<path d="M${p(r, a0)} L${p(R, a0)} A${R} ${R} 0 0 1 ${p(R, a1)} L${p(r, a1)} A${r} ${r} 0 0 0 ${p(r, a0)}Z" fill="${hsl((i / n) * 360, 72, 56)}" stroke="${BG}" stroke-width="1"/>`;
      }
      s += `<circle cx="${cx}" cy="${cy}" r="${r - 6}" fill="#7f7f7f"/>`;
      [0.86, 0.66, 0.46, 0.26].forEach((l, i) => { s += `<rect x="18" y="${30 + i * 36}" width="26" height="26" rx="4" fill="hsl(0 0% ${l * 100}%)"/>`; });
      [["#c8232c", 0], ["#e8b21e", 1], ["#1f5aa6", 2], ["#f4f1e8", 3]].forEach(([c, i]) => { s += `<rect x="276" y="${30 + i * 36}" width="26" height="26" rx="4" fill="${c}"/>`; });
      return wrap(s, "색상환과 명도 단계");
    },
    spiral() {
      const phi = (1 + Math.sqrt(5)) / 2, H = 150, W = H * phi, x0 = (320 - W) / 2, y0 = 25;
      let s = `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="none" stroke="#e9e3d6" stroke-width="1.4"/>`;
      let x = x0, y = y0, w = W, h = H;
      for (let i = 0; i < 9; i++) {
        const d = i % 4;
        if (d === 0) { const q = h; s += `<rect x="${x}" y="${y}" width="${q}" height="${q}" fill="none" stroke="#e9e3d6" stroke-opacity=".45"/>`; x += q; w -= q; }
        else if (d === 1) { const q = w; s += `<rect x="${x}" y="${y}" width="${q}" height="${q}" fill="none" stroke="#e9e3d6" stroke-opacity=".45"/>`; y += q; h -= q; }
        else if (d === 2) { const q = h; s += `<rect x="${x + w - q}" y="${y}" width="${q}" height="${q}" fill="none" stroke="#e9e3d6" stroke-opacity=".45"/>`; w -= q; }
        else { const q = w; s += `<rect x="${x}" y="${y + h - q}" width="${q}" height="${q}" fill="none" stroke="#e9e3d6" stroke-opacity=".45"/>`; h -= q; }
      }
      // 나선(사분원 호 이어 붙이기)
      let sx = x0, sy = y0, sw = W, sh = H, d2 = "";
      for (let i = 0; i < 9; i++) {
        const k = i % 4;
        if (k === 0) { const q = sh; d2 += (i ? "" : `M${sx} ${sy + q}`) + ` A${q} ${q} 0 0 1 ${sx + q} ${sy}`; sx += q; sw -= q; }
        else if (k === 1) { const q = sw; d2 += ` A${q} ${q} 0 0 1 ${sx + q} ${sy + q}`; sy += q; sh -= q; }
        else if (k === 2) { const q = sh; d2 += ` A${q} ${q} 0 0 1 ${sx + sw - q} ${sy + q}`; sw -= q; }
        else { const q = sw; d2 += ` A${q} ${q} 0 0 1 ${sx} ${sy + sh - q}`; sh -= q; }
      }
      s += `<path d="${d2}" fill="none" stroke="#f2a33a" stroke-width="2.4"/>`;
      s += `<circle cx="${x0 + W * 0.618}" cy="${y0 + H * 0.382}" r="5" fill="#f2a33a"/>`;
      return wrap(s, "황금 직사각형과 나선");
    },
    perspective() {
      const hy = 88, vl = [18, hy], vr = [302, hy], top = [160, 40], bot = [160, 170];
      let s = `<line x1="0" y1="${hy}" x2="320" y2="${hy}" stroke="#7fb2ff" stroke-width="1.2" stroke-dasharray="4 4"/>`;
      const L = (a, b, st = "#e9e3d6", wdt = 1, op = 0.5) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${st}" stroke-width="${wdt}" stroke-opacity="${op}"/>`;
      const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      const lt = lerp(top, vl, 0.45), lb = lerp(bot, vl, 0.45), rt = lerp(top, vr, 0.4), rb = lerp(bot, vr, 0.4);
      s += L(top, vl) + L(bot, vl) + L(top, vr) + L(bot, vr) + L(lt, vr) + L(rt, vl);
      s += `<polygon points="${lt} ${top} ${bot} ${lb}" fill="#c8645a"/><polygon points="${top} ${rt} ${rb} ${bot}" fill="#8e3b33"/>`;
      s += `<circle cx="${vl[0]}" cy="${vl[1]}" r="4" fill="#7fb2ff"/><circle cx="${vr[0]}" cy="${vr[1]}" r="4" fill="#7fb2ff"/>`;
      s += `<polygon points="0,170 320,170 320,200 0,200" fill="#2a2734"/>`;
      return wrap(s, "두 소실점으로 그린 상자");
    },
    glyph() {
      let s = "";
      for (let i = 0; i <= 8; i++) s += `<line x1="${40 + i * 30}" y1="20" x2="${40 + i * 30}" y2="180" stroke="#e9e3d6" stroke-opacity=".12"/>`;
      for (let j = 0; j <= 5; j++) s += `<line x1="40" y1="${20 + j * 32}" x2="280" y2="${20 + j * 32}" stroke="#e9e3d6" stroke-opacity=".12"/>`;
      s += `<line x1="40" y1="148" x2="280" y2="148" stroke="#f26b5b" stroke-width="1.2"/><text x="66" y="148" font-size="128" font-weight="800" fill="#f4efe4" font-family="'Pretendard Variable', 'Noto Serif KR', serif">가</text>`;
      s += `<text x="196" y="148" font-size="128" font-weight="300" fill="#f26b5b" font-family="Georgia, serif">a</text>`;
      return wrap(s, "한글과 로마자 글자의 구조");
    },
    timeline() {
      const bands = ["#5b4a3a", "#8c6d3f", "#b8893a", "#3e6b8a", "#c9573a", "#e6c34a", "#5d8f6b", "#2f3e8c", "#d94b7a", "#e9e3d6"];
      let s = "";
      bands.forEach((c, i) => { s += `<rect x="${24 + i * 27.2}" y="${48 + (i % 3) * 8}" width="24" height="${104 - (i % 3) * 16}" rx="3" fill="${c}"/>`; });
      s += `<line x1="20" y1="170" x2="300" y2="170" stroke="#e9e3d6" stroke-opacity=".6"/>`;
      for (let i = 0; i < 10; i++) s += `<circle cx="${36 + i * 27.2}" cy="170" r="2.6" fill="#e9e3d6"/>`;
      return wrap(s, "시대별 색의 띠");
    },
    aperture() {
      const cx = 160, cy = 100, R = 76, r = 26, n = 7;
      let s = `<circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="#2a2734"/>`;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2;
        const p = (rr, t) => `${(cx + rr * Math.cos(t)).toFixed(1)},${(cy + rr * Math.sin(t)).toFixed(1)}`;
        s += `<polygon points="${p(r, a)} ${p(R, a + 0.5)} ${p(R, b + 0.5)} ${p(r, b)}" fill="hsl(230 12% ${30 + i * 4}%)" stroke="${BG}" stroke-width="1.2"/>`;
      }
      s += `<circle cx="${cx}" cy="${cy}" r="${r - 2}" fill="#f2c36b"/>`;
      return wrap(s, "조리개 날");
    },
    browser() {
      let s = `<rect x="40" y="26" width="240" height="150" rx="8" fill="#2a2734" stroke="#e9e3d6" stroke-opacity=".5"/>`;
      s += `<line x1="40" y1="46" x2="280" y2="46" stroke="#e9e3d6" stroke-opacity=".35"/>`;
      ["#f26b5b", "#f2c36b", "#6fcf97"].forEach((c, i) => { s += `<circle cx="${54 + i * 12}" cy="36" r="3.6" fill="${c}"/>`; });
      for (let i = 0; i < 12; i++) s += `<rect x="${52 + i * 18.5}" y="54" width="14" height="114" fill="#7fb2ff" fill-opacity=".1"/>`;
      s += `<rect x="52" y="58" width="216" height="30" rx="3" fill="#7fb2ff" fill-opacity=".85"/>`;
      [0, 1, 2].forEach((i) => { s += `<rect x="${52 + i * 74}" y="96" width="68" height="40" rx="3" fill="#e9e3d6" fill-opacity="${0.75 - i * 0.18}"/>`; });
      s += `<rect x="52" y="144" width="142" height="7" rx="2" fill="#e9e3d6" fill-opacity=".45"/><rect x="52" y="156" width="104" height="7" rx="2" fill="#e9e3d6" fill-opacity=".3"/>`;
      s += `<rect x="212" y="146" width="56" height="16" rx="8" fill="#f26b5b"/>`;
      s += `<rect x="290" y="56" width="18" height="100" rx="5" fill="none" stroke="#e9e3d6" stroke-opacity=".35"/><rect x="294" y="62" width="10" height="70" rx="2" fill="#7fb2ff" fill-opacity=".5"/>`;
      return wrap(s, "열 그리드 위에 놓인 웹 화면");
    },
    flow() {
      const nodes = [[44, 100, "#e9e3d6"], [112, 60, "#7fb2ff"], [112, 140, "#7fb2ff"], [190, 100, "#f2c36b"], [262, 100, "#6fcf97"]];
      let s = "";
      const E = (a, b, dash) => `<path d="M${a[0] + 16} ${a[1]} C ${(a[0] + b[0]) / 2} ${a[1]}, ${(a[0] + b[0]) / 2} ${b[1]}, ${b[0] - 16} ${b[1]}" fill="none" stroke="#e9e3d6" stroke-opacity=".55" stroke-width="1.6"${dash ? ' stroke-dasharray="4 4"' : ""}/>`;
      s += E(nodes[0], nodes[1]) + E(nodes[0], nodes[2], true) + E(nodes[1], nodes[3]) + E(nodes[2], nodes[3], true) + E(nodes[3], nodes[4]);
      nodes.forEach(([x, y, c], i) => { s += i === 3 ? `<rect x="${x - 15}" y="${y - 15}" width="30" height="30" rx="3" transform="rotate(45 ${x} ${y})" fill="${c}"/>` : `<rect x="${x - 16}" y="${y - 12}" width="32" height="24" rx="6" fill="${c}"/>`; });
      [100, 82, 61, 48].forEach((h, i) => { s += `<rect x="${40 + i * 62}" y="${188 - h * 0.18}" width="40" height="${h * 0.18}" fill="#f26b5b" fill-opacity="${0.9 - i * 0.15}"/>`; });
      return wrap(s, "사용자 흐름도와 퍼널");
    },
    form() {
      let s = "";
      for (let i = 0; i < 9; i++) s += `<line x1="${28 + i * 33}" y1="20" x2="${28 + i * 33}" y2="180" stroke="#e9e3d6" stroke-opacity=".08"/>`;
      s += `<line x1="20" y1="166" x2="300" y2="166" stroke="#e9e3d6" stroke-opacity=".4"/>`;
      s += `<path d="M96 166 L104 150 Q160 140 216 150 L224 166 Z" fill="#3b4a42"/>`;
      s += `<path d="M160 146 C 156 110, 150 84, 176 58" fill="none" stroke="#9aa8a0" stroke-width="7" stroke-linecap="round"/>`;
      s += `<path d="M162 58 Q 196 34 236 52 L 230 66 Q 198 54 170 70 Z" fill="#2f7d5b"/>`;
      s += `<path d="M172 70 Q 200 58 228 68" fill="none" stroke="#ffe2d7" stroke-width="2" stroke-opacity=".9"/>`;
      s += `<path d="M178 74 L 150 150 L 250 150 L 226 72 Z" fill="#f2c36b" fill-opacity=".12"/>`;
      s += `<circle cx="160" cy="146" r="3" fill="#f26b5b"/><line x1="96" y1="178" x2="224" y2="178" stroke="#f26b5b" stroke-width="1"/><line x1="96" y1="174" x2="96" y2="182" stroke="#f26b5b"/><line x1="224" y1="174" x2="224" y2="182" stroke="#f26b5b"/>`;
      return wrap(s, "독서등의 옆모습과 치수선");
    },
  };
})();
