/* Copyright (c) 2026 geniuskey and ArtBook contributors. MIT. */
/* Post-build step: renders the math in .book-dist with KaTeX and drops the KaTeX scripts, keeping the stylesheet.
   Sources (and tools/head.py) keep the CDN tags so that a chapter opened from disk still renders in the browser. */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMath } from './katex.mjs';

const output = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), '.book-dist');
const KATEX = /<(?:link rel="stylesheet" href|script defer src)="https:\/\/cdn\.jsdelivr\.net\/npm\/katex@[^"]+\/dist\/([^"]+)">(?:<\/script>)?\n/g;
const errors = [];
let pages = 0, formulas = 0;

async function walk(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, item.name);
    if (item.isDirectory()) { await walk(file); continue; }
    if (!item.name.endsWith('.html')) continue;
    const html = await readFile(file, 'utf8');
    if (!html.includes('cdn.jsdelivr.net/npm/katex@')) continue;
    const rel = relative(output, file).split(sep).join('/');
    const math = renderMath(html, rel);
    if (math.errors.length) { errors.push(...math.errors); continue; }
    // With no formula on the page the stylesheet goes too; otherwise only katex.min.css stays.
    await writeFile(file, math.html.replace(KATEX, (tag, asset) => (math.count && asset === 'katex.min.css' ? tag : '')));
    pages++; formulas += math.count;
  }
}
await walk(output);
if (errors.length) throw new Error(`KaTeX could not parse ${errors.length} formula(s):\n${errors.join('\n')}`);
console.log(`Rendered ${formulas} formulas on ${pages} pages`);
