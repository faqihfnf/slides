/* ==========================================================================
   DATA SLIDE — hanya file ini yang perlu diubah untuk menambah slide baru.

   category : kelompok di sidebar. Tidak perlu didaftarkan di tempat lain;
              urutan kelompok mengikuti kemunculan pertamanya di daftar ini.
   slug     : dipakai di alamat, contoh slides.faqih.id/#uraian-jabatan
   title    : judul di sidebar dan bilah atas
   note     : keterangan kecil di bawah judul, boleh dikosongkan
   embedId  : dari Google Slides → Bagikan → Publikasikan di web → Sematkan.
              Ambil bagian panjang setelah /presentation/d/e/ dan sebelum
              /pubembed
   ========================================================================== */

const DECKS = [
  {
    category: "HR",
    slug: "uraian-jabatan",
    title: "Menyusun Uraian Jabatan",
    note: "Sertifikasi BNSP",
    embedId: "2PACX-1vQDxR2kD3Spd1QZfeT2-KV1_Ew8cJglFVrTES8gSYZ1G3AKLXJlq2K2iMUi_7W9K4U7jU7Ap8Sf66js"
  },
  {
    category: "HR",
    slug: "slide-kedua",
    title: "Judul slide kedua",
    note: "Ganti sesuai isi",
    embedId: "2PACX-1vSaeyjc7ygldrj2yN5udMGJUKOpTd3DVvXu_YCZzdx31LG74ssDlTR0OYgcgq8Aj9OR-ls6NOFVLFQV"
  },
  {
    category: "Tech",
    slug: "contoh-tech",
    title: "Contoh slide kategori Tech",
    note: "Ganti judul dan embedId dengan slide anda",
    embedId: "2PACX-1vSaeyjc7ygldrj2yN5udMGJUKOpTd3DVvXu_YCZzdx31LG74ssDlTR0OYgcgq8Aj9OR-ls6NOFVLFQV"
  }
];
