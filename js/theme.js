/* Tema terang/gelap. Tanpa pilihan manual, tampilan ikut setelan sistem
   lewat brand.css; pilihan manual disimpan di localStorage. */

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

  function init() {
    icon = document.getElementById("themeIcon");

    const saved = read();
    if (saved === "dark" || saved === "light") {
      document.documentElement.setAttribute("data-theme", saved);
    }
    paintIcon();

    document.getElementById("themeBtn")
      .addEventListener("click", () => apply(isDark() ? "light" : "dark"));
    matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", paintIcon);
  }

  return { init };
})();
