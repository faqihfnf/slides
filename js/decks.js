/* 
   DATA SLIDE:

   category : kelompok di sidebar. Tidak perlu didaftarkan di tempat lain;
              urutan kelompok mengikuti kemunculan pertamanya di daftar ini.
   slug     : dipakai di alamat, contoh slides.faqih.id/#uraian-jabatan
   title    : judul di sidebar dan bilah atas
   note     : keterangan kecil di bawah judul, boleh dikosongkan
   embedId  : dari Google Slides → Bagikan → Publikasikan di web → Sematkan.
              Ambil bagian panjang setelah /presentation/d/e/ dan sebelum
              /pubembed
   locked   : opsional. Kalau true, slide tetap tampil di sidebar (dengan
              ikon gembok) tapi butuh password untuk dibuka — lihat
              js/auth.js untuk mengatur/mengganti passwordnya.
   fileId   : opsional. ID ASLI file Google Slides (beda dari embedId di
              atas, yang cuma ID hasil "Publish to web"). Diambil dari alamat
              biasa saat file dibuka di Google Slides, contoh:
              docs.google.com/presentation/d/INI_FILE_ID_NYA/edit
              Kalau diisi (dan locked bukan true), tombol Download muncul di
              bilah atas dan mengarah ke .../export/pdf pakai id ini. Syarat
              di Google Drive: file harus di-share "Anyone with the link"
              (minimal Viewer) dan opsi "Disable download/print/copy" untuk
              viewer JANGAN dicentang, kalau tidak downloadnya ditolak.
*/

const DECKS = [
  {
    category: "BNSP",
    slug: "hr-manager-bnsp",
    title: "HR Manager BNSP",
    note: "Sertifikasi BNSP",
    embedId: "2PACX-1vQDxR2kD3Spd1QZfeT2-KV1_Ew8cJglFVrTES8gSYZ1G3AKLXJlq2K2iMUi_7W9K4U7jU7Ap8Sf66js",
    locked: true,
  },
  {
    category: "BNSP",
    slug: "hr-supervisor-bnsp",
    title: "HR Supervisor BNSP",
    note: "Sertifikasi BNSP",
    embedId: "2PACX-1vSaeyjc7ygldrj2yN5udMGJUKOpTd3DVvXu_YCZzdx31LG74ssDlTR0OYgcgq8Aj9OR-ls6NOFVLFQV",
    locked: true,
  },
  {
    category: "HR",
    slug: "basic-payroll-process",
    title: "Basic Payroll Process",
    note: "Siklus payroll dari awal sampai akhir",
    embedId: "2PACX-1vTo1pzhTXXCG63GjJKBf_LdOoGGmGf8T1_xEtFNJsMBh8sWDCxz7TC2C0p8nOLdcKe6TTV5FyQOqKqE",
    fileId: "1Nr12iPOY-XXmt8Nfu2k3LHGKLjUopC5dFME3jgRiKqY",
  },
];
