/* Perekat: menyatukan data, sidebar, panggung slide, dan alamat URL. */

(() => {
  // Tombol yang khusus slides, dititipkan ke chrome bersama (shared/chrome.js)
  const parts = document.getElementById("slideChrome").content;
  const downloadBtn = parts.getElementById("downloadBtn");
  const shortcutBtn = parts.getElementById("shortcutBtn");

  // Slide pembuka default: yang pertama tanpa kunci, supaya orang yang baru
  // buka situs tanpa alamat spesifik tidak langsung disambut prompt password.
  // Kalau semua slide ternyata terkunci, baru pakai yang paling pertama.
  const firstOpenDeck = DECKS.find(d => !d.locked) || DECKS[0];

  /* Kelompok sidebar dari category; urutan kelompok mengikuti kemunculan
     pertamanya di decks.js. */
  function groupsFor(activeSlug) {
    const groups = new Map();
    DECKS.forEach(deck => {
      const label = deck.category || "Lainnya";
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push({
        title: deck.title,
        subtitle: deck.note,
        href: `#${deck.slug}`,
        active: deck.slug === activeSlug,
        locked: deck.locked,
      });
    });
    return [...groups].map(([label, items]) => ({ label, items }));
  }

  function unlockAndShow(deck) {
    Auth.prompt(() => Viewer.show(deck));
  }

  function openDeck(slug) {
    const deck = DECKS.find(d => d.slug === slug) || firstOpenDeck;
    if (!deck) return;

    document.title = `${deck.title} — Faqih Nur Fahmi`;

    if (location.hash.slice(1) !== deck.slug) {
      history.replaceState(null, "", `#${deck.slug}`);
    }
    renderShell({ groups: groupsFor(deck.slug), headerTitle: deck.title });

    // Tombol download cuma muncul untuk slide yang tidak dikunci DAN punya
    // fileId (ID asli file, bukan publish-id — publish-id tidak bisa dipakai
    // untuk URL export PDF). Lihat catatan fileId di decks.js.
    const canDownload = !deck.locked && !!deck.fileId;
    downloadBtn.hidden = !canDownload;
    downloadBtn.href = canDownload
      ? `https://docs.google.com/presentation/d/${deck.fileId}/export/pdf`
      : "#";

    if (deck.locked && !Auth.isUnlocked()) {
      Viewer.lock(() => unlockAndShow(deck));
      unlockAndShow(deck);
    } else {
      Viewer.show(deck);
    }
  }

  renderShell({
    site: "slides",
    tagline: "Kumpulan Slide & Materi",
    sidebarLabel: "Daftar slide",
    searchPlaceholder: "Cari judul slide",
    emptyText: "Tidak ada slide yang cocok dengan pencarian itu.",
    groups: groupsFor(null),
    headerTitle: "Pilih slide",
    showSlideshow: true,
    onSlideshow: Viewer.toggleFullscreen,
    headerActions: [downloadBtn],
    sidebarFooter: shortcutBtn,
  });

  Viewer.init();
  Auth.init();
  Shortcuts.init();

  addEventListener("hashchange", () => openDeck(location.hash.slice(1)));

  if (DECKS.length) openDeck(location.hash.slice(1));
})();
