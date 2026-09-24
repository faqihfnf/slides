/* Perekat: menyatukan data, sidebar, panggung slide, dan alamat URL. */

(() => {
  const label = document.getElementById("nowPlaying");
  const rail = document.getElementById("rail");

  // Slide pembuka default: yang pertama tanpa kunci, supaya orang yang baru
  // buka situs tanpa alamat spesifik tidak langsung disambut prompt password.
  // Kalau semua slide ternyata terkunci, baru pakai yang paling pertama.
  const firstOpenDeck = DECKS.find(d => !d.locked) || DECKS[0];

  function unlockAndShow(deck) {
    Auth.prompt(() => Viewer.show(deck));
  }

  function openDeck(slug) {
    const deck = DECKS.find(d => d.slug === slug) || firstOpenDeck;
    if (!deck) return;

    label.textContent = deck.title;
    document.title = `${deck.title} — Faqih Nur Fahmi`;

    if (location.hash.slice(1) !== deck.slug) {
      history.replaceState(null, "", `#${deck.slug}`);
    }
    Sidebar.setActive(deck);

    if (deck.locked && !Auth.isUnlocked()) {
      Viewer.lock(() => unlockAndShow(deck));
      unlockAndShow(deck);
    } else {
      Viewer.show(deck);
    }
  }

  Theme.init();
  Viewer.init();
  Auth.init();
  Shortcuts.init();
  Sidebar.init({ decks: DECKS, onSelect: openDeck });

  document.getElementById("railToggle").addEventListener("click", () => {
    rail.toggleAttribute("hidden-rail");
  });

  addEventListener("hashchange", () => openDeck(location.hash.slice(1)));

  if (DECKS.length) openDeck(location.hash.slice(1));
  else Sidebar.render();
})();
