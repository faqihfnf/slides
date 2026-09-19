/* Perekat: menyatukan data, sidebar, panggung slide, dan alamat URL. */

(() => {
  const label = document.getElementById("nowPlaying");
  const rail = document.getElementById("rail");

  function openDeck(slug) {
    const deck = DECKS.find(d => d.slug === slug) || DECKS[0];
    if (!deck) return;

    Viewer.show(deck);
    label.textContent = deck.title;
    document.title = `${deck.title} — Faqih Nur Fahmi`;

    if (location.hash.slice(1) !== deck.slug) {
      history.replaceState(null, "", `#${deck.slug}`);
    }
    Sidebar.setActive(deck);
  }

  Theme.init();
  Viewer.init();
  Shortcuts.init();
  Sidebar.init({ decks: DECKS, onSelect: openDeck });

  document.getElementById("railToggle").addEventListener("click", () => {
    rail.toggleAttribute("hidden-rail");
  });

  addEventListener("hashchange", () => openDeck(location.hash.slice(1)));

  if (DECKS.length) openDeck(location.hash.slice(1));
  else Sidebar.render();
})();
