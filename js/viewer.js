/* Panggung slide: memuat embed Google dan menjaga kotaknya tetap 16:9. */

const Viewer = (() => {
  // Lebihan iframe per sisi, dalam piksel. Player Google membulatkan ukuran
  // slide ke bawah lalu menyisakan bilah hitam di kanan dan bawah — kira-kira
  // 1px, lebih terlihat saat skala layar bukan 100%. Bleed ini yang
  // memotongnya. Diukur: 2 sudah cukup pada skala 100/125/150/200%, dipakai 3
  // sebagai cadangan. Harganya 3px isi slide per sisi (~0,3% dari lebar).
  const BLEED = 3;

  let stage, frame, iframe, lockedPanel, unlockBtn, errorPanel, errorText;
  let lastW = 0, lastH = 0;

  function embedUrl(deck) {
    const params = new URLSearchParams({
      start: "false", loop: "false", delayms: "3000", rm: "minimal"
    });
    return `https://docs.google.com/presentation/d/e/${deck.embedId}/pubembed?${params}`;
  }

  /* Kotak dibuat persis serasio slide, jadi player Google tidak punya sisa
     untuk ditutup bilah hitam. Iframe dilebihkan tipis lalu digeser ke tengah
     supaya tepi pembulatannya terpotong. */
  function fit() {
    const style = getComputedStyle(stage);
    // Border .frame ada di luar kotak 16:9 (content-box), jadi ruangnya harus
    // disisakan. Dibaca, tidak dipatok: di mode slideshow border-nya 0.
    const border = parseFloat(getComputedStyle(frame).borderLeftWidth) * 2;
    const availW = stage.clientWidth - parseFloat(style.paddingLeft) * 2 - border;
    const availH = stage.clientHeight - parseFloat(style.paddingTop) * 2 - border;

    // Kelipatan 16 dan 9 supaya rasionya persis, tanpa pecahan piksel
    let w = Math.floor(availW / 16) * 16;
    let h = w * 9 / 16;
    if (h > availH) {
      h = Math.floor(availH / 9) * 9;
      w = h * 16 / 9;
    }

    if (w <= 0 || (w === lastW && h === lastH)) return;
    lastW = w;
    lastH = h;

    const iw = w + BLEED * 2;
    const ih = iw * 9 / 16;

    frame.style.width = `${w}px`;
    frame.style.height = `${h}px`;

    iframe.style.width = `${iw}px`;
    iframe.style.height = `${ih}px`;
    iframe.style.marginLeft = `${-BLEED}px`;
    iframe.style.marginTop = `${-(ih - h) / 2}px`;
  }

  function show(deck) {
    lockedPanel.hidden = true;
    frame.hidden = false;
    const url = embedUrl(deck);
    if (iframe.src !== url) iframe.src = url;
  }

  /* Tampilkan panel "terkunci" alih-alih slide. onUnlock dipanggil kalau
     tombol di panel itu diklik — pemanggil yang membuka dialog password. */
  function lock(onUnlock) {
    frame.hidden = true;
    iframe.src = "about:blank";
    lockedPanel.hidden = false;
    unlockBtn.onclick = onUnlock;
  }

  /* Ganti panggung dengan pesan, misalnya saat decks.json gagal dimuat */
  function error(text) {
    frame.hidden = true;
    lockedPanel.hidden = true;
    errorText.textContent = text;
    errorPanel.hidden = false;
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else stage.requestFullscreen();
  }

  function init() {
    stage = document.getElementById("stage");
    frame = document.getElementById("frame");
    iframe = document.getElementById("viewer");
    lockedPanel = document.getElementById("lockedPanel");
    unlockBtn = document.getElementById("unlockBtn");
    errorPanel = document.getElementById("errorPanel");
    errorText = document.getElementById("errorText");

    // Fokus masuk ke iframe supaya tombol panah langsung bisa dipakai
    iframe.addEventListener("load", () => iframe.focus());

    document.addEventListener("fullscreenchange", () => setTimeout(() => iframe.focus(), 60));

    // Mengikuti panggung, bukan jendela: ikut benar saat sidebar dibuka-tutup,
    // saat masuk fullscreen, dan saat layout baru selesai setelah muat.
    new ResizeObserver(fit).observe(stage);
    fit();
  }

  return { init, show, lock, error, toggleFullscreen };
})();
