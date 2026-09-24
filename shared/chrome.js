/* ==========================================================================
   Chrome bersama faqih.id — sidebar + bilah atas
   Dipakai slides.faqih.id dan course.faqih.id. Ubah di sini sekali, berlaku
   di semua situs yang memuatnya.

   Halaman pemakai perlu:
     <link rel="stylesheet" href="https://faqih.id/brand.css">
     <link rel="stylesheet" href="https://slides.faqih.id/shared/chrome.css">
     <script defer src="https://slides.faqih.id/shared/chrome.js"></script>
     (plus font Inter + Fraunces dari Google Fonts)

     <div class="shell">
       <nav id="fnf-sidebar"></nav>
       <div class="main">
         <div id="fnf-header"></div>
         ...isi halaman...
       </div>
     </div>

   Lalu panggil renderShell(config). Boleh dipanggil berulang, misalnya tiap
   kali hash berubah: panggilan berikutnya cukup berisi field yang berubah,
   sisanya diingat dari panggilan sebelumnya. Isi kotak pencarian dan
   kelompok yang sedang terbuka tetap terjaga.

   config:
     tagline           : teks kecil di bawah logo
     sidebarLabel      : nama sidebar untuk pembaca layar, contoh "Daftar slide"
     searchPlaceholder : placeholder kotak pencarian
     emptyText         : pesan kalau pencarian tidak menemukan apa-apa
     groups            : [{ label, items: [{ title, subtitle, href, active, locked }] }]
                         Kelompok yang berisi item aktif otomatis dibuka.
     headerTitle       : judul di bilah atas
     showSlideshow     : tampilkan tombol Slideshow (true di slides, false di course)
     onSlideshow       : dipanggil saat tombol Slideshow diklik
     headerActions     : [elemen] tambahan di bilah atas, sebelum tombol Slideshow
     sidebarFooter     : elemen di dasar sidebar, di bawah daftar
   ========================================================================== */

const renderShell = (() => {
  // Logo ikut folder skrip ini, bukan halaman pemakainya — supaya tetap
  // ketemu saat chrome.js dimuat dari domain lain. Harus dibaca sekarang:
  // document.currentScript cuma terisi selama skrip ini sedang dijalankan.
  const LOGO = new URL("../assets/logo.png", document.currentScript.src).href;

  const ICON_MENU = '<path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/>';
  const ICON_SLIDESHOW = '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke-linecap="round" stroke-linejoin="round"/>';
  const ICON_CHEV = '<path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>';
  const ICON_LOCK = '<path d="M6 10V7a6 6 0 0112 0v3M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" stroke-linecap="round" stroke-linejoin="round"/>';

  let config = {
    tagline: "",
    sidebarLabel: "Navigasi",
    searchPlaceholder: "Cari judul",
    emptyText: "Tidak ada yang cocok dengan pencarian itu.",
    groups: [],
    headerTitle: "",
    showSlideshow: false,
    onSlideshow: () => { },
    headerActions: [],
    sidebarFooter: null,
  };

  let sidebar, list, search, tagline, title, slideshowBtn, toggleBtn;
  let placedActions = [], placedFooter = null;

  // Layar sempit: sidebar menumpuk di atas isi (lihat chrome.css), jadi
  // mulai tertutup dan ditutup lagi begitu pengunjung memilih sesuatu.
  const narrow = matchMedia("(max-width: 720px)");

  // Kelompok yang sedang terbuka. Mulai kosong: semua tertutup saat halaman
  // dibuka, kecuali kelompok dari item yang sedang aktif.
  const expanded = new Set();

  /* --- Tema terang/gelap -------------------------------------------------- */

  /* Tanpa pilihan manual, tampilan ikut setelan sistem lewat brand.css;
     pilihan manual disimpan di localStorage. Nama kuncinya peninggalan
     slides, dipertahankan supaya pilihan pengunjung lama tidak hilang. */
  const Theme = (() => {
    const KEY = "slide-theme";
    const ICON_SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke-linecap="round"/>';
    const ICON_MOON = '<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" stroke-linejoin="round"/>';

    let icon;

    function isDark() {
      const forced = document.documentElement.getAttribute("data-theme");
      if (forced === "dark" || forced === "light") return forced === "dark";
      return matchMedia("(prefers-color-scheme: dark)").matches;
    }

    // Ikon menunjukkan tujuan perpindahan, bukan keadaan sekarang
    function paintIcon() {
      icon.innerHTML = isDark() ? ICON_SUN : ICON_MOON;
    }

    function read() {
      try {
        return localStorage.getItem(KEY);
      } catch {
        return null;
      }
    }

    function apply(value) {
      document.documentElement.setAttribute("data-theme", value);
      try {
        localStorage.setItem(KEY, value);
      } catch {
        /* penyimpanan diblokir, tema tetap berlaku sampai halaman ditutup */
      }
      paintIcon();
    }

    function init(button) {
      icon = button.querySelector("svg");

      const saved = read();
      if (saved === "dark" || saved === "light") {
        document.documentElement.setAttribute("data-theme", saved);
      }
      paintIcon();

      button.addEventListener("click", () => apply(isDark() ? "light" : "dark"));
      matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", paintIcon);
    }

    return { init };
  })();

  /* --- Daftar di sidebar -------------------------------------------------- */

  function matches(item, group, query) {
    if (!query) return true;
    return [item.title, item.subtitle, group.label]
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

  function groupHead(label, count, isOpen) {
    const head = document.createElement("button");
    head.className = "group-head";
    head.setAttribute("aria-expanded", String(isOpen));
    head.innerHTML = `<svg class="chev" viewBox="0 0 24 24">${ICON_CHEV}</svg>`
      + "<span></span><span class=\"count\"></span>";
    head.querySelector("span").textContent = label;
    head.querySelector(".count").textContent = count;
    head.addEventListener("click", () => {
      if (expanded.has(label)) expanded.delete(label);
      else expanded.add(label);
      renderList();
    });
    return head;
  }

  function itemLink(item, query) {
    const link = document.createElement("a");
    link.className = "rail-item";
    link.href = item.href;
    if (item.active) link.setAttribute("aria-current", "page");

    const title = document.createElement("strong");
    title.appendChild(highlight(item.title, query));
    if (item.locked) {
      title.insertAdjacentHTML(
        "beforeend",
        ` <svg class="lock-icon" viewBox="0 0 24 24" aria-label="Terkunci">${ICON_LOCK}</svg>`
      );
    }
    const subtitle = document.createElement("span");
    subtitle.textContent = item.subtitle || "";

    link.append(title, subtitle);
    return link;
  }

  function renderList() {
    const query = search.value.trim().toLowerCase();
    list.innerHTML = "";

    const visible = config.groups
      .map(group => ({
        label: group.label,
        items: group.items.filter(item => matches(item, group, query)),
      }))
      .filter(group => group.items.length);

    if (!visible.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = config.emptyText;
      list.appendChild(li);
      return;
    }

    visible.forEach(({ label, items }) => {
      // Saat mencari, semua kelompok dibuka supaya hasilnya langsung terlihat
      const isOpen = query ? true : expanded.has(label);

      const ul = document.createElement("ul");
      ul.className = "group-items";
      ul.hidden = !isOpen;
      items.forEach(item => {
        const li = document.createElement("li");
        li.appendChild(itemLink(item, query));
        ul.appendChild(li);
      });

      const li = document.createElement("li");
      li.append(groupHead(label, items.length, isOpen), ul);
      list.appendChild(li);
    });
  }

  /* --- Kerangka, dibangun sekali di panggilan pertama --------------------- */

  function build() {
    sidebar = document.getElementById("fnf-sidebar");
    sidebar.classList.add("rail");
    sidebar.innerHTML = `
      <div class="rail-head">
        <h1>
          <a class="brand" href="https://faqih.id/">
            <img src="${LOGO}" alt="" width="34" height="34">
            <span>FnF.</span>
          </a>
        </h1>
        <p></p>
      </div>
      <div class="search-wrap">
        <input class="search" type="search" autocomplete="off">
      </div>
      <ul class="rail-list"></ul>`;
    tagline = sidebar.querySelector(".rail-head p");
    search = sidebar.querySelector(".search");
    list = sidebar.querySelector(".rail-list");

    search.addEventListener("input", renderList);
    search.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        search.value = "";
        renderList();
      }
    });

    // Tirai di belakang sidebar saat terbuka di layar sempit; ketuk untuk
    // menutup (tombol menu tertimpa sidebar, jadi tidak bisa dipakai).
    const backdrop = document.createElement("div");
    backdrop.className = "rail-backdrop";
    sidebar.after(backdrop);

    const closeRail = () => sidebar.setAttribute("hidden-rail", "");
    backdrop.addEventListener("click", closeRail);
    list.addEventListener("click", event => {
      if (narrow.matches && event.target.closest(".rail-item")) closeRail();
    });
    if (narrow.matches) closeRail();

    const header = document.getElementById("fnf-header");
    header.classList.add("bar");
    header.innerHTML = `
      <button class="btn btn-icon"><svg viewBox="0 0 24 24">${ICON_MENU}</svg></button>
      <h2></h2>
      <button class="btn"><svg viewBox="0 0 24 24">${ICON_SLIDESHOW}</svg> Slideshow</button>
      <button class="btn btn-icon" aria-label="Ganti tema terang atau gelap"><svg viewBox="0 0 24 24"></svg></button>`;
    const [toggle, slideshow, theme] = header.querySelectorAll("button");
    toggleBtn = toggle;
    slideshowBtn = slideshow;
    title = header.querySelector("h2");

    toggleBtn.addEventListener("click", () => sidebar.toggleAttribute("hidden-rail"));
    slideshowBtn.addEventListener("click", () => config.onSlideshow());
    Theme.init(theme);
  }

  /* Pasang elemen milik situs pemakai. Elemen yang sama boleh dikirim ulang;
     yang tidak dikirim lagi dilepas. */
  function placeExtras() {
    placedActions.forEach(el => {
      if (!config.headerActions.includes(el)) el.remove();
    });
    slideshowBtn.before(...config.headerActions);
    placedActions = [...config.headerActions];

    if (placedFooter && placedFooter !== config.sidebarFooter) placedFooter.remove();
    if (config.sidebarFooter) sidebar.appendChild(config.sidebarFooter);
    placedFooter = config.sidebarFooter;
  }

  return function renderShell(next = {}) {
    if (!sidebar) build();
    config = { ...config, ...next };

    tagline.textContent = config.tagline;
    sidebar.setAttribute("aria-label", config.sidebarLabel);
    toggleBtn.setAttribute(
      "aria-label",
      `Tampilkan atau sembunyikan ${config.sidebarLabel.toLowerCase()}`
    );
    search.placeholder = config.searchPlaceholder;
    search.setAttribute("aria-label", config.searchPlaceholder);
    title.textContent = config.headerTitle;
    slideshowBtn.hidden = !config.showSlideshow;
    placeExtras();

    if ("groups" in next) {
      config.groups.forEach(group => {
        if (group.items.some(item => item.active)) expanded.add(group.label);
      });
    }
    renderList();
  };
})();
