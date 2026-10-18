/* Copyright (c) 2026 geniuskey and ArtBook contributors. MIT (see ../../LICENSE-MIT).
   Adapted from SemiBooks shelf home (https://semi.euiyun.com/), MIT. */
/* 서가 홈: 분야·검색으로 고르는 책장, 대표 실험 덱, 읽는 순서 칩, 테마 전환.
   책 목록은 shared/js/shelf.js(window.AB_SHELF)에서 읽는다. 새 책은 거기에 한 항목만 더하면 된다. */
(function () {
  "use strict";
  const SHELF = window.AB_SHELF || { books: [], groups: [] };
  const books = SHELF.books.slice().sort((a, b) => a.order - b.order);
  const byPath = new Map(books.map((b) => [b.path, b]));
  const groups = [{ id: "all", label: "전체" }].concat(SHELF.groups || []);
  const STATUS = { writing: "집필 중", planned: "계획" };
  const esc = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const inGroup = (book, id) => id === "all" || book.group === id;
  const groupLabel = (book) => (groups.find((g) => g.id === book.group) || groups[0]).label;
  const grid = document.getElementById("book-grid"), search = document.getElementById("book-search");
  let selected = "all";

  const chapters = books.reduce((n, b) => n + (b.chapters || 0), 0);
  const published = books.filter((b) => b.status === "published").length;
  document.getElementById("stats").innerHTML = `<span><b>${books.length}</b>권의 교과서</span><span><b>${chapters}</b>개 장</span>`
    + (published < books.length ? `<span><b>${published}</b>권 출간</span>` : "") + "<span>공공 도메인 작품 이미지</span>";
  document.getElementById("filters").innerHTML = groups.map((g, i) => (i === 1 ? '<span class="sep" aria-hidden="true"></span>' : "")
    + `<button type="button" data-filter="${esc(g.id)}" aria-pressed="${g.id === selected}">${esc(g.label)}<span>${books.filter((b) => inGroup(b, g.id)).length}</span></button>`).join("");

  function card(book) {
    const open = book.status !== "planned", status = STATUS[book.status];
    const label = `${book.sub} · ${book.title}${status ? ` (${status})` : ""}`;
    const inner = `<span class="book-top"><small>${esc(groupLabel(book))}</small>${status ? `<b>${status}</b>` : ""}</span>
        <strong>${esc(book.sub)}</strong>
        <span class="book-art" aria-hidden="true">${window.AB_COVERS && AB_COVERS[book.motif] ? AB_COVERS[book.motif]() : ""}</span>
        <span class="book-foot"><span>${esc(book.title)}</span><span>${esc(book.code || "")}</span></span>`;
    const cover = open
      ? `<a class="book-cover" href="${esc(book.path)}/" aria-label="${esc(label)} 읽기">${inner}</a>`
      : `<div class="book-cover" role="img" aria-label="${esc(label)}">${inner}</div>`;
    const meta = (book.chapters ? `<span>${book.chapters}장</span>` : "") + (status ? `<span class="writing">${status}</span>` : "");
    return `<article class="book ${esc(book.status)}" data-book="${esc(book.path)}" style="--c:${esc(book.color || "#b5179e")}">
      <div class="book-stand">${cover}</div>
      <div class="book-label"><p>${esc(book.headline || book.desc)}</p><div class="book-meta">${meta}</div></div>
    </article>`;
  }
  // 마지막 줄의 빈 칸에도 선반이 이어지도록 열 수에 맞춰 빈 자리를 채운다.
  let shelfColumns = 0;
  const columns = () => getComputedStyle(grid).gridTemplateColumns.split(" ").length;
  function fillShelf() {
    grid.querySelectorAll(".book-slot").forEach((slot) => slot.remove());
    const n = grid.children.length;
    shelfColumns = columns();
    if (n) grid.insertAdjacentHTML("beforeend", '<div class="book book-slot" aria-hidden="true"><div class="book-stand"></div></div>'.repeat((shelfColumns - (n % shelfColumns)) % shelfColumns));
  }
  new ResizeObserver(() => { if (columns() !== shelfColumns) fillShelf(); }).observe(grid);

  function render() {
    const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const hits = books.filter((b) => inGroup(b, selected) && words.every((word) =>
      [b.title, b.sub, b.headline, b.desc, groupLabel(b), ...(b.topics || [])].join(" ").toLocaleLowerCase().includes(word)));
    grid.innerHTML = hits.map(card).join("");
    fillShelf();
    document.getElementById("book-count").textContent = `${hits.length} / ${books.length}권`;
    document.getElementById("empty").hidden = hits.length !== 0;
    document.querySelectorAll("#filters button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === selected)));
  }
  document.getElementById("filters").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    selected = button.dataset.filter;
    render();
  });
  search.addEventListener("input", render);
  search.addEventListener("keydown", (event) => { if (event.key === "Escape") { search.value = ""; render(); } });

  // 실험 카드와 읽는 순서 칩에 책 색과 코드를 입힌다.
  document.querySelectorAll(".experiment[data-book], .path a[data-book]").forEach((el) => {
    const book = byPath.get(el.dataset.book);
    if (!book) return;
    el.style.setProperty("--c-light", book.color);
    el.style.setProperty("--c-dark", book.colorDark || book.color);
    if (el.closest(".path")) el.insertAdjacentHTML("afterbegin", `<span class="sq" aria-hidden="true">${esc(book.code)}</span>`);
  });

  // 실험 덱: 가리킨 카드는 앞으로 나오고 이웃 카드는 조금씩 비켜난다.
  const deck = document.getElementById("experiments");
  const dockMedia = matchMedia("(min-width: 1001px) and (hover: hover) and (prefers-reduced-motion: no-preference)");
  const cards = [...deck.children];
  deck.style.setProperty("--gaps", Math.max(cards.length - 1, 1));
  let active = null;
  function resetDock() {
    active = null;
    deck.classList.remove("dock-active");
    cards.forEach((item) => { item.classList.remove("dock-current"); item.style.removeProperty("--dock-x"); item.style.removeProperty("--dock-z"); });
  }
  function activate(item) {
    if (!dockMedia.matches || !cards.includes(item) || active === item) return;
    active = item;
    const index = cards.indexOf(item);
    deck.classList.add("dock-active");
    cards.forEach((other, i) => {
      const distance = Math.abs(i - index);
      other.style.setProperty("--dock-x", `${distance ? Math.sign(i - index) * 24 / distance : 0}px`);
      other.style.setProperty("--dock-z", cards.length - distance);
      other.classList.toggle("dock-current", other === item);
    });
  }
  deck.addEventListener("pointermove", (event) => { if (event.pointerType !== "touch") activate(event.target.closest(".experiment")); });
  deck.addEventListener("pointerleave", () => { resetDock(); if (deck.contains(document.activeElement)) activate(document.activeElement); });
  deck.addEventListener("focusin", (event) => activate(event.target.closest(".experiment")));
  deck.addEventListener("focusout", (event) => { if (!deck.contains(event.relatedTarget)) resetDock(); });
  dockMedia.addEventListener("change", resetDock);

  // 테마: 책 페이지(common.js)와 같은 저장 키를 쓴다.
  const moon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const sun = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/></svg>';
  const theme = document.getElementById("theme");
  const dark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  function paintTheme() { theme.innerHTML = dark() ? sun : moon; theme.setAttribute("aria-label", dark() ? "라이트 모드로 전환" : "다크 모드로 전환"); }
  function setTheme(value) { document.documentElement.dataset.theme = value; try { localStorage.setItem("ab-theme", value); } catch (e) {} paintTheme(); }
  theme.addEventListener("click", () => setTheme(dark() ? "light" : "dark"));
  // 책 페이지의 AB.setTheme과 같은 이름으로 연다(tools/check.py가 테마를 바꿔 표지 색 불변을 검사한다).
  window.AB = Object.assign(window.AB || {}, { setTheme });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paintTheme);
  paintTheme(); render();

  const SITE = "https://art.euiyun.com/";
  const structured = document.createElement("script"); structured.type = "application/ld+json";
  structured.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "BookSeries", "@id": SITE + "#series", name: "ArtBook", url: SITE, inLanguage: "ko", isAccessibleForFree: true,
    hasPart: books.filter((b) => b.status !== "planned").map((b) => ({ "@type": "Book", name: b.title + " · " + b.sub, url: SITE + b.path + "/" })) });
  document.head.append(structured);
})();
