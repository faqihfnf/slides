/* Popup daftar pintasan keyboard, menempel di atas tombolnya. */

const Shortcuts = (() => {
  let sheet, button;

  function place() {
    const box = button.getBoundingClientRect();
    sheet.style.width = `${box.width}px`;
    sheet.style.left = `${box.left}px`;
    sheet.style.bottom = `${innerHeight - box.top + 6}px`;
    sheet.style.top = "auto";
  }

  function init() {
    sheet = document.getElementById("shortcutSheet");
    button = document.getElementById("shortcutBtn");

    button.addEventListener("click", () => {
      sheet.showModal();
      place();
    });
    document.getElementById("shortcutClose")
      .addEventListener("click", () => sheet.close());

    // Klik di luar kotak ikut menutup popup
    sheet.addEventListener("click", event => {
      const box = sheet.getBoundingClientRect();
      const diLuar = event.clientX < box.left || event.clientX > box.right
        || event.clientY < box.top || event.clientY > box.bottom;
      if (diLuar) sheet.close();
    });

    addEventListener("resize", () => {
      if (sheet.open) place();
    });
  }

  return { init };
})();
