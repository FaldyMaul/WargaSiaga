import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { projectRoot } from "./config.mjs";

const dataSource = fs.readFileSync(path.join(projectRoot, "assets/js/data.js"), "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSource, sandbox, { timeout: 1000, filename: "assets/js/data.js" });

export const cards = Object.freeze(sandbox.window.WS_DATA.cards.map((card) => Object.freeze(card)));
export const categories = Object.freeze((sandbox.window.WS_DATA.categories || []).map((cat) => Object.freeze(cat)));

export const officialLinks = Object.freeze({
  iasc: Object.freeze({ id: "iasc", label: "IASC — OJK / Satgas PASTI", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi finansial" }),
  sipasti: Object.freeze({ id: "sipasti", label: "SIPASTI — OJK", url: "https://sipasti.ojk.go.id/", purpose: "Laporan indikasi aktivitas keuangan ilegal" }),
  cekrekening: Object.freeze({ id: "cekrekening", label: "CekRekening — Komdigi", url: "https://cekrekening.id/", purpose: "Cek atau laporkan rekening; hasil bukan jaminan aman" }),
  aduannomor: Object.freeze({ id: "aduannomor", label: "AduanNomor — Komdigi", url: "https://aduannomor.id/", purpose: "Cek atau laporkan nomor mencurigakan" }),
  aduankonten: Object.freeze({ id: "aduankonten", label: "AduanKonten — Komdigi", url: "https://aduankonten.id/", purpose: "Laporkan konten daring berbahaya" })
});

const stopWords = new Set(["yang", "dan", "atau", "saya", "anda", "dari", "untuk", "dengan", "tidak", "sudah", "agar", "pada", "akan", "oleh", "itu", "ini", "ada", "dalam", "lalu"]);

function words(value) {
  return String(value).replace(/\[[^\]]+DISAMARKAN\]/gi, " ").toLowerCase().match(/[a-z0-9]+/g)?.filter((word) => word.length > 3 && !stopWords.has(word)) || [];
}

export function retrieveCards(text, limit = 3) {
  const inputWords = new Set(words(text));
  return cards
    .map((card) => {
      const titleWords = new Set(words(card.title));
      const summaryWords = new Set(words(card.summary));
      const allWords = new Set(words([card.title, card.summary, card.requestedAction, ...card.channels, ...card.contexts, ...card.tactics, ...card.warningSigns].join(" ")));
      let score = 0;
      for (const word of inputWords) {
        if (titleWords.has(word)) score += 3;
        else if (summaryWords.has(word)) score += 2;
        else if (allWords.has(word)) score += 1;
      }
      return { card, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ card }) => card);
}

export function toPublicCard(card) {
  return { id: card.id, title: card.title, categoryId: card.categoryId || null, categoryLabel: card.categoryLabel || null, href: `modus-detail?id=${encodeURIComponent(card.id)}` };
}

export function officialIdFromUrl(url) {
  return Object.values(officialLinks).find((link) => link.url === url)?.id || null;
}

export const personas = Object.freeze({
  pencari_kerja: Object.freeze({
    id: "pencari_kerja",
    label: "Pencari Kerja",
    description: "Mencari peluang kerja atau tugas lepas, rentan terhadap deposit awal dan tugas komisi fiktif."
  }),
  pelaku_usaha: Object.freeze({
    id: "pelaku_usaha",
    label: "Pelaku Usaha",
    description: "Menjalankan toko atau usaha online, rentan terhadap bukti transfer fiktif, QRIS palsu, dan faktur tagihan palsu."
  }),
  lansia_keluarga: Object.freeze({
    id: "lansia_keluarga",
    label: "Keluarga & Lansia",
    description: "Menerima kabar mendadak kerabat darurat, pencairan pensiun/BPJS, atau undian berhadiah yang memicu kepanikan."
  }),
  pelajar_remaja: Object.freeze({
    id: "pelajar_remaja",
    label: "Pelajar & Remaja",
    description: "Pengguna media sosial dan game online, rentan terhadap iming-iming hadiah akun, diamond gratis, dan tugas berbayar."
  }),
  korban_mendesak: Object.freeze({
    id: "korban_mendesak",
    label: "Kondisi Mendesak",
    description: "Telah mengirimkan uang atau data rahasia dan membutuhkan panduan langkah penanganan darurat tanpa tunda."
  }),
  warga_umum: Object.freeze({
    id: "warga_umum",
    label: "Warga Umum",
    description: "Menerima pesan mencurigakan, file tidak dikenal, atau tautan acak dalam aktivitas komunikasi harian."
  })
});

export const modusFollowUpPrompts = Object.freeze({
  "job-deposit": [
    "Bagaimana cara memverifikasi keabsahan perusahaan perekrut?",
    "Apa risiko jika saya sudah mengirimkan foto identitas diri?",
    "Apakah ada perusahaan resmi yang meminta uang jaminan kerja?"
  ],
  "bank-otp": [
    "Bagaimana cara menghubungi nomor pengaduan resmi bank saya?",
    "Apakah nomor telepon pengirim ini bisa dilaporkan ke Komdigi?",
    "Apa tanda jika rekening atau mobile banking saya sudah diakses orang lain?"
  ],
  "marketplace-diversion": [
    "Mengapa penjual atau pembeli meminta transaksi pindah ke WhatsApp?",
    "Apakah dana saya dijamin aman jika transaksi tetap di aplikasi?",
    "Bagaimana cara melaporkan akun pengguna mencurigakan di marketplace?"
  ],
  "investment-return": [
    "Bagaimana cara memeriksa izin legalitas entitas investasi di OJK?",
    "Apa ciri penawaran investasi bodong yang menjanjikan keuntungan pasti?",
    "Apakah uang yang disetor ke platform investasi tidak resmi bisa ditarik?"
  ],
  "apk-phishing": [
    "Bagaimana cara mengecek apakah ponsel saya disusupi aplikasi berbahaya?",
    "Langkah apa yang harus segera dilakukan jika file APK sudah terpasang?",
    "Bagaimana cara mencabut izin SMS dan aksesibilitas di setelan HP?"
  ],
  "family-emergency": [
    "Bagaimana cara memastikan kondisi keluarga yang sebenarnya tanpa panik?",
    "Mengapa penelepon menolak saat diajak verifikasi melalui panggilan video?",
    "Ke mana saya harus melapor jika nomor penipu terus meneror keluarga?"
  ],
  "prize-refund": [
    "Apakah undian resmi dari perusahaan pernah memungut biaya pajak pemenang di awal?",
    "Bagaimana cara memverifikasi pengumuman undian langsung ke penyelenggara?",
    "Apa bahaya memberikan nomor rekening atau data kartu untuk klaim hadiah?"
  ],
  "invoice-redirection": [
    "Bagaimana prosedur verifikasi jika rekanan bisnis mengganti nomor rekening tagihan?",
    "Apakah alamat email pengirim faktur bisa dipalsukan oleh penipu?",
    "Langkah darurat apa yang harus diambil jika transfer invoice sudah dilakukan?"
  ],
  "recovery-scam": [
    "Apakah aparat penegak hukum memungut biaya untuk membantu korban penipuan?",
    "Mengapa pihak yang mengaku hacker pemulih dana meminta bayaran di muka?",
    "Ke mana saluran resmi pemerintah untuk pelaporan penipuan finansial?"
  ],
  "illegal-online-loan": [
    "Bagaimana cara mengecek daftar pinjaman online yang berizin resmi di OJK?",
    "Apa bahaya jika mengizinkan aplikasi pinjaman online mengakses kontak ponsel?",
    "Bagaimana langkah menghadapi ancaman dan teror penagihan pinjol ilegal?"
  ],
  "game-reward-account": [
    "Apakah pihak pengembang game resmi pernah meminta kata sandi akun pemain?",
    "Bagaimana cara mengamankan akun game dengan autentikasi dua faktor?",
    "Apa risiko jika membeli akun atau diamond dari situs pihak ketiga?"
  ],
  "romance-scam": [
    "Mengapa kenalan online selalu menghindar saat diajak bertemu langsung?",
    "Apa kaitan antara hubungan pertemanan daring dengan ajakan investasi atau pinjam uang?",
    "Bagaimana cara menolak permintaan bantuan finansial dari kenalan baru secara tegas?"
  ],
  "romance-investment": [
    "Mengapa kenalan online selalu menghindar saat diajak bertemu langsung?",
    "Apa kaitan antara hubungan pertemanan daring dengan ajakan investasi kripto?",
    "Bagaimana cara menolak permintaan bantuan finansial dari kenalan baru secara tegas?"
  ],
  "deepfake-impersonation": [
    "Bagaimana cara membedakan rekaman suara tiruan AI dengan suara asli keluarga?",
    "Pertanyaan rahasia apa yang bisa diajukan untuk memverifikasi identitas penelepon?",
    "Apa yang harus diperhatikan jika tampilan wajah lawan bicara saat panggilan video tampak janggal?"
  ]
});

const defaultFollowUpPrompts = Object.freeze([
  "Bagaimana cara memastikan keaslian pihak yang menghubungi saya?",
  "Apa langkah pengamanan akun yang perlu saya lakukan sekarang?",
  "Ke mana saya bisa melaporkan nomor atau tautan mencurigakan ini?"
]);

export function getFollowUpSuggestions(retrievedCards, personaId) {
  const cardId = retrievedCards?.[0]?.id;
  const specific = cardId && modusFollowUpPrompts[cardId];
  if (specific && specific.length) return [...specific];
  if (personaId === "pencari_kerja") {
    return [
      "Bagaimana cara memverifikasi keabsahan lowongan kerja?",
      "Apa tindakan jika data diri sudah terlanjur dikirim?",
      "Apakah ada biaya yang wajar dalam proses rekrutmen kerja?"
    ];
  }
  if (personaId === "pelaku_usaha") {
    return [
      "Bagaimana cara memverifikasi bukti transfer pembayaran dari pembeli?",
      "Apa tanda jika pembeli berniat mengalihkan transaksi ke luar sistem?",
      "Bagaimana mengamankan akun toko daring dari pengambilalihan?"
    ];
  }
  return [...defaultFollowUpPrompts];
}

export function buildRetrievalContext(retrievedCards) {
  return retrievedCards.map((card) => ({
    id: card.id,
    title: card.title,
    summary: card.summary,
    requestedAction: card.requestedAction,
    warningSigns: card.warningSigns,
    independentChecks: card.independentChecks,
    alreadyActedSteps: card.alreadyActedSteps,
    allowedOfficialLinkIds: card.officialLinks.map((link) => officialIdFromUrl(link.url)).filter(Boolean)
  }));
}

