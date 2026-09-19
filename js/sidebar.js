/* Daftar slide di sidebar: pengelompokan, buka-tutup kelompok, dan pencarian. */

const Sidebar = (() => {
  let list, search, decks = [], onSelect = () => { };
  let activeSlug = null;

  // Kelompok yang sedang terbuka. Mulai kosong: semua tertutup saat halaman
  // dibuka, kecuali kelompok dari slide yang sedang ditampilkan.
  const expanded = new Set();

  const categoryOf = deck => deck.category || "Lainnya";

  function matches(deck, query) {
    if (!query) return true;
    return [deck.title, deck.note, deck.category]
      .filter(Boolean)
      .some(field => field.toLowerCase().includes(query));
  }

  /* Tandai potongan judul yang cocok dengan kata kunci */
  function highlight(text, query) {
    const at = query ? text.toLowerCase().indexOf(query) : -1;
    if (at < 0) return document.createTextNode(text);

    const wrap = document.createDocumentFragment();
    const mark = document.createElement("mark");
    mark.textContent = text.slice(at, at + query.length);
    wrap.append(text.slice(0, at), mark, text.slice(at + query.length));
    return wrap;
  }

  function groupHead(category, count, isOpen) {
    const head = document.createElement("button");
    head.className = "group-head";
    head.setAttribute("aria-expanded", String(isOpen));
    head.innerHTML =
      '<svg class="chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + "<span></span><span class=\"count\"></span>";
    head.querySelector("span").textContent = category;
    head.querySelector(".count").textContent = count;
    head.addEventListener("click", () => {
      if (expanded.has(category)) expanded.delete(category);
      else expanded.add(category);
      render();
    });
    return head;
  }

  function deckButton(deck, query) {
    const btn = document.createElement("button");
    btn.className = "deck";
    btn.dataset.slug = deck.slug;
    btn.setAttribute("aria-current", String(deck.slug === activeSlug));

    const title = document.createElement("strong");
    title.appendChild(highlight(deck.title, query));
    const note = document.createElement("span");
    note.textContent = deck.note || "";

    btn.append(title, note);
    btn.addEventListener("click", () => onSelect(deck.slug));
    return btn;
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    list.innerHTML = "";

    const groups = new Map();
    decks.filter(deck => matches(deck, query)).forEach(deck => {
      const key = categoryOf(deck);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(deck);
    });

    if (groups.size === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Tidak ada slide yang cocok dengan pencarian itu.";
      list.appendChild(li);
      return;
    }

    groups.forEach((items, category) => {
      // Saat mencari, semua kelompok dibuka supaya hasilnya langsung terlihat
      const isOpen = query ? true : expanded.has(category);

      const ul = document.createElement("ul");
      ul.className = "group-items";
      ul.hidden = !isOpen;
      items.forEach(deck => {
        const li = document.createElement("li");
        li.appendChild(deckButton(deck, query));
        ul.appendChild(li);
      });

      const li = document.createElement("li");
      li.append(groupHead(category, items.length, isOpen), ul);
      list.appendChild(li);
    });
  }

  function setActive(deck) {
    activeSlug = deck.slug;
    expanded.add(categoryOf(deck));
    render();
  }

  function init(options) {
    decks = options.decks;
    onSelect = options.onSelect;

    list = document.getElementById("decks");
    search = document.getElementById("search");

    search.addEventListener("input", render);
    search.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        search.value = "";
        render();
      }
    });
  }

  return { init, render, setActive };
})();
