/* Gerbang password untuk slide yang ditandai locked: true di decks.json
   (kolom "Terkunci" di Pages CMS).
   Situs ini statis (tanpa server), jadi ini cuma penghalang ringan — siapa
   pun yang membaca kode sumber tetap bisa menemukan hash-nya. Cukup untuk
   menyembunyikan slide dari orang iseng, bukan untuk data rahasia beneran. */

const Auth = (() => {
  const SESSION_KEY = "slide-unlocked";

  // Hash SHA-256 dari password. Password aslinya tidak pernah ditulis di
  // sini, cuma hash-nya, supaya tidak langsung kebaca di kode sumber.
  // Untuk ganti password: buka console browser (F12) di situs ini lalu
  // jalankan baris berikut dengan password barumu, kemudian tempel hasilnya
  // ke HASH di bawah:

  //   crypto.subtle.digest("SHA-256", new TextEncoder().encode("password-baru")).then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("")))

  // Password bawaan saat ini: "faqih1993"
  const HASH = "3035a5717b75803820341258236b03d8276f429d2a280967e60d8b6de062addf";

  let dialog, form, input, error;

  function isUnlocked() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      return false;
    }
  }

  function markUnlocked() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Privat/sessionStorage diblokir: tetap lanjut, cuma perlu password
      // lagi kalau ganti slide lain.
    }
  }

  async function hash(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /* Buka dialog password. Memanggil onSuccess() begitu password cocok.
     Kalau dialog ditutup tanpa berhasil (Escape / klik luar), tidak terjadi
     apa-apa — pemanggil bertanggung jawab menampilkan keadaan terkunci. */
  function prompt(onSuccess) {
    error.hidden = true;
    input.value = "";
    dialog.showModal();
    input.focus();

    const onSubmit = async (event) => {
      event.preventDefault();
      if ((await hash(input.value)) === HASH) {
        markUnlocked();
        dialog.close();
        onSuccess();
      } else {
        error.hidden = false;
        input.select();
      }
    };

    form.addEventListener("submit", onSubmit);
    dialog.addEventListener("close", () => form.removeEventListener("submit", onSubmit), { once: true });
  }

  function init() {
    dialog = document.getElementById("passwordSheet");
    form = document.getElementById("passwordForm");
    input = document.getElementById("passwordInput");
    error = document.getElementById("passwordError");
  }

  return { init, isUnlocked, prompt };
})();
