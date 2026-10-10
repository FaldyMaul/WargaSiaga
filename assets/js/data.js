(function () {
  "use strict";

  const MODUS_CATEGORIES = [
    { id: "all", label: "Semua Kategori", icon: "search", count: 17 },
    { id: "banking", label: "Perbankan & Akun", icon: "shieldCheck", desc: "OTP, rekening, dan pemulihan dana", cardIds: ["bank-otp", "recovery-scam", "webapk-update-palsu"] },
    { id: "job-investment", label: "Kerja & Investasi", icon: "briefcase", desc: "Deposit lowongan dan janji untung", cardIds: ["job-deposit", "investment-return"] },
    { id: "malware-phishing", label: "Pesan & File Bahaya", icon: "link", desc: "APK, link phising, dan deepfake AI", cardIds: ["apk-phishing", "deepfake-impersonation", "sms-blaster-fake-bts"] },
    { id: "commerce", label: "Jual Beli & Bisnis", icon: "bag", desc: "Transaksi luar platform & tagihan invoice", cardIds: ["marketplace-diversion", "invoice-redirection", "quishing-qris-palsu"] },
    { id: "social-family", label: "Keluarga & Relasi", icon: "users", desc: "Panggilan darurat dan manipulasi asmara", cardIds: ["family-emergency", "romance-scam", "ai-voice-clone-emergency"] },
    { id: "prize-loan", label: "Hadiah & Pinjaman", icon: "gift", desc: "Undian, reward game, dan pinjol ilegal", cardIds: ["prize-refund", "game-reward-account", "illegal-online-loan"] }
  ];

  window.WS_DATA = {
    categories: MODUS_CATEGORIES,
    cards: [
      {
        id: "bank-otp", categoryId: "banking", categoryLabel: "Perbankan & Akun",
        slug: "penyamaran-bank-dan-permintaan-otp",
        title: "Mengaku dari bank dan meminta OTP",
        summary: "Pelaku mengaku petugas bank, membuat situasi terasa darurat, lalu meminta kode OTP, PIN, atau data untuk masuk ke akun.",
        fictionalExample: "“Ada transaksi mencurigakan. Agar rekening tidak diblokir, sebutkan kode enam digit yang baru dikirim.”",
        channels: ["Telepon", "WhatsApp", "SMS"],
        contexts: ["Perbankan", "Keluarga"],
        ageGroups: ["teens", "adults", "elderly"],
        tactics: ["Mendesak", "Menyamar", "Menakut-nakuti"],
        requestedAction: "Memberikan OTP, PIN, kata sandi, atau membuka tautan yang dikirim.",
        warningSigns: ["Meminta OTP, PIN, atau kata sandi—data ini tidak perlu diberikan kepada penelepon.", "Mendesak Anda bertindak saat itu juga dan melarang menutup telepon.", "Nomor atau profil tampak resmi, tetapi Anda tidak memulai percakapan.", "Mengirim tautan untuk membatalkan transaksi atau mengamankan akun."],
        independentChecks: ["Tutup telepon atau percakapan terlebih dahulu.", "Buka aplikasi bank secara mandiri; jangan gunakan tautan dari pesan.", "Hubungi bank melalui menu bantuan di aplikasi, situs resmi yang Anda ketik sendiri, atau nomor di bagian belakang kartu."],
        alreadyActedSteps: ["Segera hubungi bank melalui kanal resmi dan minta pengamanan akun/transaksi.", "Ganti kata sandi dari perangkat yang dipercaya dan keluar dari semua sesi jika tersedia.", "Simpan bukti tanpa menyebarkan OTP atau data pribadi.", "Jika ada kerugian finansial, siapkan bukti untuk IASC dan laporan polisi."],
        officialLinks: [{ label: "IASC — laporan penipuan transaksi", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian finansial" }, { label: "AduanNomor", url: "https://aduannomor.id/", purpose: "Cek atau laporkan nomor mencurigakan" }],
        sources: [{ publisher: "Bank Indonesia — Panduan Dasar Pelindungan Konsumen", url: "https://www.bi.go.id/id/Pelindungan-Konsumen/Panduan-Dasar/Default.aspx", accessedAt: "2026-10-04" }, { publisher: "OJK / Satgas PASTI", url: "https://iasc.ojk.go.id/", accessedAt: "2026-10-04" }, { publisher: "Komdigi — AduanNomor", url: "https://aduannomor.id/", accessedAt: "2026-10-04" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "blue", icon: "shield"
      },
      {
        id: "job-deposit", categoryId: "job-investment", categoryLabel: "Kerja & Investasi",
        slug: "lowongan-kerja-dengan-deposit",
        title: "Lowongan kerja yang meminta deposit",
        summary: "Tawaran kerja atau tugas sederhana menjanjikan komisi, lalu meminta isi saldo (top up), biaya aktivasi, atau deposit agar hasil bisa dicairkan.",
        fictionalExample: "“Selamat, Anda lolos kerja paruh waktu. Selesaikan tiga tugas dan transfer deposit Rp250.000 untuk membuka komisi.”",
        channels: ["WhatsApp", "Telegram", "Media sosial"],
        contexts: ["Pencari kerja", "Penghasilan tambahan"],
        ageGroups: ["teens", "adults"],
        tactics: ["Iming-iming", "Mendesak", "Bukti palsu"],
        requestedAction: "Membayar deposit atau mengisi saldo sebelum dapat bekerja atau menarik komisi.",
        warningSigns: ["Pekerjaan datang tanpa lamaran atau wawancara yang wajar.", "Diminta membayar untuk mulai bekerja atau menerima upah.", "Komisi awal sengaja diberikan untuk membangun rasa percaya.", "Nama perusahaan digunakan tetapi komunikasi hanya melalui akun pribadi."],
        independentChecks: ["Jangan membayar untuk menerima pekerjaan.", "Cari halaman karier perusahaan dengan mengetik alamat situs sendiri.", "Hubungi perusahaan lewat kontak resmi yang ditemukan terpisah, bukan nomor perekrut."],
        alreadyActedSteps: ["Hentikan transfer berikutnya meski dijanjikan dana lama akan cair.", "Hubungi bank atau penyedia dompet digital segera melalui kanal resmi.", "Simpan percakapan dan bukti transaksi.", "Gunakan IASC dan laporan polisi jika ada kerugian finansial."],
        officialLinks: [{ label: "IASC — laporan penipuan transaksi", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian finansial" }, { label: "CekRekening", url: "https://cekrekening.id/", purpose: "Cek/laporkan rekening; hasil bukan jaminan aman" }],
        sources: [{ publisher: "Scamwatch — Jobs and employment scams", url: "https://www.scamwatch.gov.au/types-of-scams/jobs-and-employment-scams", accessedAt: "2026-10-03" }, { publisher: "Komdigi — CekRekening", url: "https://cekrekening.id/", accessedAt: "2026-10-03" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "orange", icon: "briefcase"
      },
      {
        id: "marketplace-diversion", categoryId: "commerce", categoryLabel: "Jual Beli & Bisnis",
        slug: "transaksi-di-luar-marketplace",
        title: "Diajak bertransaksi di luar platform jual-beli",
        summary: "Pembeli atau penjual diarahkan keluar dari platform jual-beli (marketplace) ke tautan pembayaran, kurir, atau rekening pribadi yang tidak dikenal.",
        fictionalExample: "“Pesanan sudah saya bayar. Klik tautan kurir ini untuk konfirmasi dan masukkan data kartu agar saldo masuk.”",
        channels: ["Marketplace", "WhatsApp", "SMS"],
        contexts: ["Belanja online", "Jualan online"],
        ageGroups: ["teens", "adults", "elderly"],
        tactics: ["Menyamar", "Mendesak", "Tautan palsu"],
        requestedAction: "Membuka tautan, memberikan data pembayaran, atau mentransfer di luar alur platform.",
        warningSigns: ["Meminta pindah percakapan dan pembayaran keluar platform.", "Tautan menyerupai merek marketplace atau jasa kirim.", "Penjual/pembeli mendesak karena alasan promo atau batas waktu.", "Meminta data kartu atau kode verifikasi untuk menerima uang."],
        independentChecks: ["Tetap di chat dan pembayaran resmi marketplace.", "Periksa status pesanan hanya dari aplikasi yang Anda buka sendiri.", "Hubungi dukungan platform dari pusat bantuan resminya."],
        alreadyActedSteps: ["Hubungi bank atau penyedia dompet digital dan platform secepatnya.", "Amankan akun marketplace dan email terkait.", "Simpan bukti pesanan, chat, link (sebagai teks atau tangkapan layar), dan transaksi.", "Laporkan konten atau rekening lewat layanan resmi yang sesuai."],
        officialLinks: [{ label: "CekRekening", url: "https://cekrekening.id/", purpose: "Cek/laporkan rekening; bukan sertifikasi aman" }, { label: "AduanKonten", url: "https://aduankonten.id/", purpose: "Laporkan konten daring berbahaya" }],
        sources: [{ publisher: "Scamwatch — Buying and selling scams", url: "https://www.scamwatch.gov.au/types-of-scams/buying-and-selling-scams", accessedAt: "2026-10-04" }, { publisher: "Komdigi — AduanKonten", url: "https://aduankonten.id/", accessedAt: "2026-10-04" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "blue", icon: "bag"
      },
      {
        id: "investment-return", categoryId: "job-investment", categoryLabel: "Kerja & Investasi",
        slug: "investasi-imbal-hasil-tidak-wajar",
        title: "Investasi dengan imbal hasil tidak wajar",
        summary: "Tawaran investasi, aset kripto, atau pinjaman menjanjikan untung pasti, cepat, dan tanpa risiko sambil menekan Anda segera setor.",
        fictionalExample: "“Profit dijamin 20% per minggu. Slot tinggal dua—transfer sekarang sebelum grup ditutup.”",
        channels: ["Media sosial", "Telegram", "WhatsApp"],
        contexts: ["Investasi", "Penghasilan tambahan"],
        ageGroups: ["teens", "adults", "elderly"],
        tactics: ["Iming-iming", "Mendesak", "Otoritas palsu"],
        requestedAction: "Mengirim dana, mengunduh aplikasi, atau menyerahkan akses akun untuk investasi.",
        warningSigns: ["Menjanjikan keuntungan tinggi atau pasti tanpa menjelaskan risiko.", "Tekanan untuk masuk sebelum kesempatan hilang.", "Testimoni, grafik laba, atau figur publik digunakan sebagai bukti utama.", "Penarikan dana mensyaratkan pajak/biaya tambahan ke rekening pribadi."],
        independentChecks: ["Tunda keputusan dan jangan menambah setoran.", "Periksa izin dan identitas melalui situs otoritas yang Anda cari sendiri.", "Diskusikan dengan pihak tepercaya yang tidak mendapat komisi dari tawaran."],
        alreadyActedSteps: ["Jangan bayar biaya tambahan untuk membuka penarikan.", "Hubungi bank atau penyedia dompet digital melalui kanal resmi.", "Amankan akun dan simpan bukti komunikasi/transaksi.", "Gunakan rute IASC dan polisi jika dana sudah terkirim."],
        officialLinks: [{ label: "SIPASTI — OJK", url: "https://sipasti.ojk.go.id/", purpose: "Laporkan indikasi aktivitas keuangan ilegal" }, { label: "IASC", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi" }, { label: "CekRekening", url: "https://cekrekening.id/", purpose: "Cek atau laporkan rekening; hasil bukan jaminan aman" }],
        sources: [{ publisher: "OJK / Satgas PASTI — aktivitas keuangan ilegal", url: "https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Pages/Satgas-Pasti-Hentikan-953-Entitas-Pinjol-Ilegal-Dan-Penawaran-Investasi-Ilegal-Mei-2026.aspx", accessedAt: "2026-10-04" }, { publisher: "Scamwatch — Investment scams", url: "https://www.scamwatch.gov.au/types-of-scams/investment-scams", accessedAt: "2026-10-04" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "violet", icon: "chart"
      },
      {
        id: "apk-phishing", categoryId: "malware-phishing", categoryLabel: "Pesan & File Bahaya",
        slug: "tautan-phishing-apk-dan-qr-palsu",
        title: "Tautan pencurian data, APK, atau QR palsu",
        summary: "Pesan menyamar sebagai undangan, tagihan, kurir, atau pemulihan akun agar Anda membuka tautan atau memasang aplikasi berbahaya.",
        fictionalExample: "“Paket Anda tertahan. Unduh aplikasi resi ini dan izinkan akses agar bisa dijadwalkan ulang.”",
        channels: ["WhatsApp", "SMS", "Email", "QR"],
        contexts: ["Keluarga", "Belanja online", "Perbankan"],
        ageGroups: ["kids", "teens", "adults", "elderly"],
        tactics: ["Tautan palsu", "Menyamar", "Mendesak"],
        requestedAction: "Membuka tautan, memindai QR, memasang APK, atau memberi izin akses perangkat.",
        warningSigns: ["File APK dikirim lewat chat dari sumber tak dikenal.", "Alamat situs berbeda tipis dari domain resmi.", "Meminta izin akses SMS, notifikasi, kontak, atau aksesibilitas.", "Ada ancaman paket hangus, akun diblokir, atau denda segera."],
        independentChecks: ["Jangan buka tautan atau file yang dikirim.", "Buka aplikasi resmi atau ketik situs yang sudah Anda kenal.", "Konfirmasi lewat nomor resmi yang ditemukan secara terpisah."],
        alreadyActedSteps: ["Putuskan koneksi perangkat bila perilaku mencurigakan muncul.", "Gunakan perangkat tepercaya untuk menghubungi bank atau penyedia layanan dan mengganti kata sandi.", "Periksa dan hapus aplikasi atau izin mencurigakan mengikuti panduan produsen perangkat.", "Simpan bukti dan pertimbangkan laporan resmi."],
        officialLinks: [{ label: "AduanKonten", url: "https://aduankonten.id/", purpose: "Laporkan konten daring berbahaya" }, { label: "AduanNomor", url: "https://aduannomor.id/", purpose: "Cek/laporkan nomor mencurigakan" }],
        sources: [{ publisher: "Bank Indonesia — Panduan Dasar Pelindungan Konsumen", url: "https://www.bi.go.id/id/Pelindungan-Konsumen/Panduan-Dasar/Default.aspx", accessedAt: "2026-10-04" }, { publisher: "Scamwatch — Phishing scams", url: "https://www.scamwatch.gov.au/types-of-scams/phishing-scams", accessedAt: "2026-10-04" }, { publisher: "Komdigi — AduanKonten", url: "https://aduankonten.id/", accessedAt: "2026-10-04" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "orange", icon: "link"
      },
      {
        id: "family-emergency", categoryId: "social-family", categoryLabel: "Keluarga & Relasi",
        slug: "keluarga-dalam-darurat-palsu",
        title: "Keluarga atau teman dalam “darurat”",
        summary: "Akun atau nomor baru mengaku sebagai orang dekat yang kehilangan ponsel, sakit, atau tertahan dan meminta transfer cepat.",
        fictionalExample: "“Ma, ini nomor baruku. Aku sedang di rumah sakit dan perlu transfer sekarang. Jangan telepon karena baterai habis.”",
        channels: ["WhatsApp", "Telepon", "Media sosial"],
        contexts: ["Keluarga", "Pendamping"],
        ageGroups: ["teens", "adults", "elderly"],
        tactics: ["Menakut-nakuti", "Mendesak", "Menyamar"],
        requestedAction: "Mengirim uang atau data pribadi tanpa sempat memverifikasi identitas.",
        warningSigns: ["Kontak menggunakan nomor atau akun baru.", "Cerita darurat disertai larangan menelepon atau bertanya pada orang lain.", "Cara bicara terasa berbeda atau jawaban menghindari pertanyaan pribadi.", "Rekening tujuan bukan milik orang yang dikenal."],
        independentChecks: ["Telepon orang tersebut melalui nomor lama yang sudah tersimpan.", "Hubungi anggota keluarga lain lewat kanal yang sudah dikenal.", "Ajukan pertanyaan yang hanya diketahui orang tersebut, tanpa membagikan jawabannya lebih dahulu."],
        alreadyActedSteps: ["Hubungi bank atau penyedia dompet digital segera melalui kanal resmi.", "Beri tahu orang yang identitasnya dipakai agar memperingatkan kontak lain.", "Simpan nomor, waktu, percakapan, dan bukti transaksi.", "Gunakan IASC dan buat laporan polisi bila ada kerugian."],
        officialLinks: [{ label: "AduanNomor", url: "https://aduannomor.id/", purpose: "Cek/laporkan nomor mencurigakan" }, { label: "IASC", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi" }],
        sources: [{ publisher: "Scamwatch — Phishing scams (friends and family impersonation)", url: "https://www.scamwatch.gov.au/types-of-scams/phishing-scams", accessedAt: "2026-10-04" }, { publisher: "Komdigi — AduanNomor", url: "https://aduannomor.id/", accessedAt: "2026-10-04" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "violet", icon: "users"
      },
      {
        id: "prize-refund", categoryId: "prize-loan", categoryLabel: "Hadiah & Pinjaman",
        slug: "hadiah-bantuan-atau-refund-palsu",
        title: "Hadiah, bantuan, atau pengembalian dana palsu",
        summary: "Pesan mengabarkan hadiah, bantuan, atau pengembalian dana (refund) yang tidak Anda minta, lalu meminta biaya atau data akun.",
        fictionalExample: "“Anda mendapat refund Rp1.500.000. Bayar biaya administrasi Rp50.000 agar dana langsung diproses.”",
        channels: ["SMS", "WhatsApp", "Email", "Media sosial"],
        contexts: ["Keluarga", "Belanja online", "Bantuan sosial"],
        ageGroups: ["kids", "teens", "adults", "elderly"],
        tactics: ["Iming-iming", "Menyamar", "Mendesak"],
        requestedAction: "Membayar biaya di muka, mengisi formulir data pribadi, atau membagikan kode verifikasi.",
        warningSigns: ["Hadiah atau refund datang padahal Anda tidak ikut program terkait.", "Harus membayar biaya untuk menerima uang.", "Tautan/form meminta data berlebihan.", "Menggunakan logo lembaga tanpa kanal komunikasi resmi."],
        independentChecks: ["Jangan bayar atau isi formulir dari pesan.", "Cari pengumuman pada aplikasi/situs resmi secara mandiri.", "Hubungi lembaga lewat kontak yang Anda temukan sendiri."],
        alreadyActedSteps: ["Hubungi penyedia pembayaran bila sudah transfer.", "Ubah kredensial yang sempat dimasukkan melalui situs/aplikasi resmi.", "Simpan bukti dan laporkan kanal/konten yang dipakai.", "Gunakan rute IASC bila ada kerugian finansial."],
        officialLinks: [{ label: "AduanKonten", url: "https://aduankonten.id/", purpose: "Laporan konten daring" }, { label: "IASC", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi" }],
        sources: [{ publisher: "Scamwatch — Unexpected money scams", url: "https://www.scamwatch.gov.au/types-of-scams/unexpected-money-scams", accessedAt: "2026-10-04" }, { publisher: "OJK / Satgas PASTI", url: "https://iasc.ojk.go.id/", accessedAt: "2026-10-04" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "orange", icon: "gift"
      },
      {
        id: "invoice-redirection", categoryId: "commerce", categoryLabel: "Jual Beli & Bisnis",
        slug: "perubahan-rekening-tagihan-bisnis",
        title: "Perubahan rekening pada tagihan bisnis",
        summary: "Pelaku menyusup atau meniru email pemasok, lalu mengirim perubahan rekening pembayaran untuk tagihan (invoice) yang tampak sah.",
        fictionalExample: "“Mulai invoice bulan ini, pembayaran dialihkan ke rekening baru. Mohon diproses hari ini agar pengiriman tidak tertunda.”",
        channels: ["Email", "WhatsApp"],
        contexts: ["Usaha kecil", "Perbankan"],
        ageGroups: ["adults"],
        tactics: ["Menyamar", "Mendesak", "Dokumen palsu"],
        requestedAction: "Mengalihkan pembayaran invoice ke rekening baru tanpa verifikasi terpisah.",
        warningSigns: ["Perubahan rekening datang mendadak menjelang jatuh tempo.", "Alamat email berbeda satu huruf atau memakai domain gratis.", "Bahasa dan tanda tangan mirip pemasok tetapi proses biasa berubah.", "Ada tekanan untuk melewati persetujuan kedua."],
        independentChecks: ["Jeda pembayaran dan hubungi pemasok lewat nomor yang tersimpan sebelumnya.", "Gunakan proses persetujuan kedua untuk perubahan rekening.", "Cocokkan perubahan melalui lebih dari satu kanal tepercaya."],
        alreadyActedSteps: ["Hubungi bank bisnis segera untuk penanganan transaksi.", "Hubungi pemasok asli melalui kanal lama.", "Amankan email dan akun bisnis; periksa aturan penerusan email.", "Simpan header email, invoice, dan bukti transaksi untuk pelaporan."],
        officialLinks: [{ label: "IASC", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi" }, { label: "CekRekening", url: "https://cekrekening.id/", purpose: "Cek/laporkan rekening; bukan jaminan aman" }],
        sources: [{ publisher: "Scamwatch — Business email compromise scams", url: "https://www.scamwatch.gov.au/types-of-scams/business-email-compromise-scams", accessedAt: "2026-10-04" }, { publisher: "OJK / Satgas PASTI", url: "https://iasc.ojk.go.id/", accessedAt: "2026-10-04" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "blue", icon: "invoice"
      },
      {
        id: "recovery-scam", categoryId: "banking", categoryLabel: "Perbankan & Akun",
        slug: "jasa-pemulihan-dana-palsu",
        title: "Jasa pemulihan dana palsu",
        summary: "Setelah seseorang mengalami kerugian, pihak lain mengaku bisa mengembalikan dana dengan meminta biaya, data, atau akses akun terlebih dahulu.",
        fictionalExample: "“Kami tim pemulihan resmi dan sudah menemukan dana Anda. Bayar biaya legalisasi 5% agar pengembalian bisa dilepas.”",
        channels: ["WhatsApp", "Telepon", "Email", "Media sosial"],
        contexts: ["Sudah menjadi korban", "Keluarga"],
        ageGroups: ["adults", "elderly"],
        tactics: ["Menyamar", "Harapan palsu", "Mendesak"],
        requestedAction: "Membayar biaya pemulihan, memberikan data identitas, atau mengizinkan akses jarak jauh.",
        warningSigns: ["Menghubungi tanpa diminta dan mengetahui sebagian detail kerugian.", "Menjanjikan dana pasti kembali.", "Meminta biaya di muka atau transfer ke rekening pribadi.", "Mengaku lembaga resmi tetapi menolak verifikasi independen."],
        independentChecks: ["Jangan mengirim uang lagi untuk ‘membuka’ dana lama.", "Hubungi lembaga yang disebut melalui situs resminya yang Anda cari sendiri.", "Minta bantuan orang tepercaya sebelum membuat keputusan baru."],
        alreadyActedSteps: ["Hentikan semua kontak dan pembayaran tambahan.", "Hubungi bank atau penyedia dompet digital melalui kanal resmi.", "Amankan akun jika data atau akses perangkat telah dibagikan.", "Percayai kabar pengembalian dana hanya dari lembaga keuangan Anda melalui kanal resminya.", "Tambahkan bukti upaya pemulihan palsu ke laporan sebelumnya atau buat laporan baru."],
        officialLinks: [{ label: "IASC", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi" }, { label: "AduanNomor", url: "https://aduannomor.id/", purpose: "Cek/laporkan nomor mencurigakan" }],
        sources: [{ publisher: "Scamwatch — Money recovery scams", url: "https://www.scamwatch.gov.au/types-of-scams/money-recovery-scams", accessedAt: "2026-10-04" }, { publisher: "IASC — informasi pengembalian dana", url: "https://iasc.ojk.go.id/", accessedAt: "2026-10-04" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "violet", icon: "refresh"
      },
      {
        id: "game-reward-account", categoryId: "prize-loan", categoryLabel: "Hadiah & Pinjaman",
        slug: "hadiah-game-gratis-dan-pencurian-akun",
        title: "Hadiah game atau item gratis yang mencuri akun",
        summary: "Pemain ditawari item, koin, akun, atau hadiah game gratis lalu diarahkan ke link lain untuk memasukkan kata sandi, kode, atau data orang tua.",
        fictionalExample: "“Kamu menang item langka gratis. Login lewat link ini dalam 10 menit atau hadiahnya diberikan ke pemain lain.”",
        channels: ["Game online", "Media sosial", "WhatsApp", "Chat"],
        contexts: ["Game online", "Sekolah", "Keluarga"],
        ageGroups: ["kids", "teens"],
        tactics: ["Hadiah palsu", "Mendesak", "Tautan palsu"],
        requestedAction: "Membuka link, memasukkan data akun game, membagikan kode login, atau memakai kartu milik orang tua.",
        warningSigns: ["Hadiah besar ditawarkan oleh pemain atau akun yang tidak dikenal.", "Percakapan diminta pindah dari game ke chat pribadi.", "Link meminta kata sandi, kode masuk, tanggal lahir, atau data pembayaran.", "Ada ancaman hadiah akan hilang bila tidak segera bertindak."],
        independentChecks: ["Jangan buka link dan jangan pindah ke chat pribadi.", "Tanyakan kepada orang tua, wali, guru, atau orang dewasa tepercaya.", "Periksa hadiah hanya dari aplikasi game atau situs resmi yang dibuka sendiri."],
        alreadyActedSteps: ["Beri tahu orang dewasa tepercaya tanpa takut dimarahi.", "Ganti kata sandi akun dari aplikasi atau situs resmi dan keluarkan sesi lain.", "Laporkan serta blokir akun melalui fitur di dalam game.", "Jika data pembayaran dipakai, minta orang tua segera menghubungi bank atau penyedia pembayaran."],
        officialLinks: [{ label: "AduanKonten", url: "https://aduankonten.id/", purpose: "Laporkan konten atau link berbahaya" }, { label: "AduanNomor", url: "https://aduannomor.id/", purpose: "Cek atau laporkan nomor mencurigakan" }],
        sources: [{ publisher: "Komdigi — perlindungan anak di ruang digital", url: "https://wasdig.komdigi.go.id/pernyataan-menteri-komunikasi-dan-digital-tentang-penerbitan-permen-turunan-pp-tunas", accessedAt: "2026-10-04" }, { publisher: "FTC Consumer Advice — Kids and Video Games", url: "https://consumer.ftc.gov/articles/kids-video-games", accessedAt: "2026-10-04" }, { publisher: "FTC — Find the Fakes activity", url: "https://consumer.ftc.gov/system/files/consumer_ftc_gov/pdf/FindtheFakes-ActivitySheet-508-v2.pdf", accessedAt: "2026-10-04" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "blue", icon: "gift"
      },
      {
        id: "deepfake-impersonation", categoryId: "malware-phishing", categoryLabel: "Pesan & File Bahaya",
        slug: "suara-video-palsu-mengatasnamakan-orang-dikenal",
        title: "Suara atau video palsu mengatasnamakan orang dikenal",
        summary: "Pelaku memakai suara, foto, atau video buatan AI agar terlihat seperti keluarga, atasan, atau figur publik yang meminta uang atau data.",
        fictionalExample: "“Ini saya. Saya sedang tidak bisa bicara lama. Tolong transfer sekarang dan jangan hubungi siapa pun dulu.”",
        channels: ["Telepon", "Video call", "WhatsApp", "Media sosial"],
        contexts: ["Keluarga", "Sekolah", "Usaha kecil"],
        ageGroups: ["teens", "adults", "elderly"],
        tactics: ["Menyamar", "Mendesak", "Teknologi AI"],
        requestedAction: "Mengirim uang, membagikan data, atau mengikuti perintah hanya karena suara atau wajah tampak dikenal.",
        warningSigns: ["Permintaan datang mendadak dan harus dirahasiakan.", "Penelepon menolak dihubungi kembali melalui nomor yang sudah dikenal.", "Gerak wajah, suara, atau jeda percakapan terasa tidak wajar.", "Ada tekanan untuk segera transfer atau memberikan kode."],
        independentChecks: ["Tutup panggilan dan hubungi orang tersebut melalui nomor lama yang sudah tersimpan.", "Konfirmasi kepada anggota keluarga atau rekan lain melalui kanal terpisah.", "Gunakan pertanyaan keluarga atau kata aman yang sudah disepakati tanpa membocorkan jawabannya lebih dulu."],
        alreadyActedSteps: ["Segera hubungi bank atau penyedia pembayaran bila uang terkirim.", "Beri tahu orang yang identitasnya dipakai agar dapat memperingatkan kontak lain.", "Simpan rekaman, nomor, waktu, dan bukti transaksi tanpa menyebarkannya ke publik.", "Gunakan IASC dan laporan polisi bila ada kerugian."],
        officialLinks: [{ label: "IASC", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi" }, { label: "AduanNomor", url: "https://aduannomor.id/", purpose: "Cek atau laporkan nomor mencurigakan" }],
        sources: [{ publisher: "Bank Indonesia — Modul Pelindungan terhadap Risiko", url: "https://www.bi.go.id/id/edukasi/Documents/Buku-Panduan-Modul-Edukasi-Keuangan-Digital-Tingkat-Dasar-Modul-5-Pelindungan-terhadap-Risiko.pdf", accessedAt: "2026-10-04" }, { publisher: "OJK / Indonesia Anti-Scam Centre", url: "https://iasc.ojk.go.id/", accessedAt: "2026-10-04" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "violet", icon: "image"
      },
      {
        id: "illegal-online-loan", categoryId: "prize-loan", categoryLabel: "Hadiah & Pinjaman",
        slug: "pinjaman-online-ilegal-dan-dana-cepat-palsu",
        title: "Pinjaman online ilegal atau dana cepat palsu",
        summary: "Aplikasi atau akun menawarkan pinjaman cepat, lalu meminta biaya di muka, akses kontak berlebihan, atau memakai data pribadi untuk tekanan dan penagihan.",
        fictionalExample: "“Pinjaman Rp10 juta sudah disetujui. Bayar biaya pencairan Rp300.000 hari ini agar dana langsung masuk.”",
        channels: ["SMS", "WhatsApp", "Media sosial", "Aplikasi"],
        contexts: ["Pinjaman", "Kebutuhan mendesak", "Penghasilan tambahan"],
        ageGroups: ["adults", "elderly"],
        tactics: ["Iming-iming", "Mendesak", "Aplikasi palsu"],
        requestedAction: "Membayar biaya sebelum pencairan, memasang aplikasi, atau menyerahkan identitas dan akses perangkat.",
        warningSigns: ["Penawaran pinjaman datang tanpa diminta melalui pesan pribadi.", "Harus membayar biaya sebelum dana dicairkan.", "Aplikasi meminta akses kontak, galeri, SMS, atau lokasi yang tidak relevan.", "Legalitas tidak dapat ditemukan melalui kanal resmi OJK."],
        independentChecks: ["Jangan memasang aplikasi dari link atau file chat.", "Periksa legalitas penyedia melalui daftar dan kanal resmi OJK yang dibuka sendiri.", "Jangan membayar biaya pencairan ke rekening pribadi."],
        alreadyActedSteps: ["Hentikan pembayaran tambahan dan simpan bukti.", "Cabut izin aplikasi yang tidak perlu dan amankan akun dari perangkat tepercaya.", "Hubungi bank atau penyedia pembayaran bila sudah mengirim uang.", "Laporkan aktivitas keuangan ilegal melalui SIPASTI dan gunakan IASC bila terjadi kerugian transaksi."],
        officialLinks: [{ label: "SIPASTI — OJK", url: "https://sipasti.ojk.go.id/", purpose: "Laporkan aktivitas keuangan ilegal" }, { label: "IASC", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi" }],
        sources: [{ publisher: "OJK / Satgas PASTI — penghentian pinjol ilegal April 2026", url: "https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Pages/Satgas-PASTI-Hentikan-953-Entitas-Pinjol-Ilegal-dan-Penawaran-Investasi-Ilegal.aspx", accessedAt: "2026-10-04" }, { publisher: "Bank Indonesia — Panduan Dasar Pelindungan Konsumen", url: "https://www.bi.go.id/id/Pelindungan-Konsumen/Panduan-Dasar/Default.aspx", accessedAt: "2026-10-04" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "orange", icon: "invoice"
      },
      {
        id: "romance-scam", categoryId: "social-family", categoryLabel: "Keluarga & Relasi",
        slug: "hubungan-romantis-online-dan-permintaan-uang",
        title: "Hubungan romantis online yang berujung permintaan uang",
        summary: "Seseorang membangun kedekatan secara online, menghindari pertemuan nyata, lalu meminta uang untuk keadaan darurat, hadiah tertahan, perjalanan, atau investasi.",
        fictionalExample: "“Hadiah untukmu tertahan di bea cukai. Tolong bayar biaya pelepasan sekarang, nanti saya ganti setelah kita bertemu.”",
        channels: ["Media sosial", "Aplikasi kencan", "WhatsApp", "Video call"],
        contexts: ["Pertemanan", "Hubungan romantis", "Keluarga"],
        ageGroups: ["teens", "adults", "elderly"],
        tactics: ["Membangun kepercayaan", "Harapan palsu", "Mendesak"],
        requestedAction: "Mengirim uang, menerima atau meneruskan dana, membagikan foto pribadi, atau berinvestasi bersama.",
        warningSigns: ["Hubungan berkembang sangat cepat tetapi selalu ada alasan untuk tidak bertemu.", "Cerita darurat atau hadiah tertahan berulang kali membutuhkan uang.", "Meminta percakapan dirahasiakan dari keluarga dan teman.", "Mengajak mengirim uang, kripto, atau menerima dana melalui rekening Anda."],
        independentChecks: ["Jangan mengirim uang atau foto pribadi tambahan.", "Ceritakan situasi kepada orang tepercaya yang tidak terlibat dalam hubungan.", "Periksa konsistensi identitas dan lakukan pencarian gambar, tetapi ingat hasil pencarian bukan bukti tunggal."],
        alreadyActedSteps: ["Hentikan pembayaran dan jangan membayar pihak yang menjanjikan pemulihan dana.", "Hubungi bank atau penyedia pembayaran segera.", "Amankan akun dan simpan percakapan serta bukti transaksi.", "Laporkan akun ke platform dan gunakan IASC serta polisi bila ada kerugian atau ancaman."],
        officialLinks: [{ label: "IASC", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi" }, { label: "AduanNomor", url: "https://aduannomor.id/", purpose: "Cek atau laporkan nomor mencurigakan" }],
        sources: [{ publisher: "Polda Jawa Timur — pengungkapan love scam 2026", url: "https://tribratanews.jatim.polri.go.id/ditressiber-polda-jatim-bongkar-sindikat-penipuan-online-modus-percintaan-love-scamming-internasional", accessedAt: "2026-10-04" }, { publisher: "Scamwatch — Relationship scams", url: "https://www.scamwatch.gov.au/types-of-scams/relationship-scams", accessedAt: "2026-10-04" }],
        reviewedAt: "2026-10-04", nextReviewAt: "2027-01-04", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "violet", icon: "users"
      },
      {
        id: "sms-blaster-fake-bts", categoryId: "malware-phishing", categoryLabel: "Pesan & File Bahaya",
        slug: "sms-dari-menara-bts-palsu-sms-blaster",
        title: "SMS dari menara BTS palsu (SMS Blaster)",
        summary: "Pelaku mengoperasikan pemancar sinyal seluler palsu (Fake BTS / IMSI-Catcher) untuk membajak sinyal ponsel terdekat dan mengirim SMS penipuan massal dengan nama resmi instansi tanpa nomor pengirim.",
        fictionalExample: "“Poin Telko Anda sebanyak 1.500 poin akan hangus hari ini. Segera tukarkan hadiah smartphone di telko-poin.example/klaim sebelum pukul 24.00.”",
        channels: ["SMS", "Jaringan Seluler"],
        contexts: ["Perbankan", "Belanja online", "Telekomunikasi"],
        ageGroups: ["teens", "adults", "elderly"],
        tactics: ["Menyamar", "Mendesak", "Manipulasi Jaringan"],
        requestedAction: "Membuka tautan dalam SMS, mengisi nomor kartu kredit/debit, atau memasukkan kode OTP pada situs tiruan.",
        warningSigns: [
          "SMS masuk dengan nama pengirim resmi (Alpha Sender ID) tetapi berada di thread pesan terpisah atau mencurigakan.",
          "Sinyal ponsel mendadak turun dari 4G/5G ke 2G saat menerima pesan di area publik atau kemacetan.",
          "Pesan berisi ancaman poin hangus atau pemblokiran akun yang mendesak Anda mengeklik tautan asing.",
          "Tautan yang disertakan bukan domain resmi penyedia layanan melainkan domain asing atau tautan pemendek."
        ],
        independentChecks: [
          "Jangan pernah mengeklik tautan yang ada di dalam SMS penukaran hadiah atau notifikasi mendesak.",
          "Buka aplikasi resmi operator atau perbankan secara mandiri yang Anda unduh dari toko aplikasi resmi.",
          "Hubungi call center resmi penyedia layanan melalui nomor resmi yang tercantum di kartu fisik atau situs resmi."
        ],
        alreadyActedSteps: [
          "Jika sudah memasukkan data perbankan di situs web, segera blokir kartu dan rekening melalui aplikasi mobile banking atau call center.",
          "Ganti kata sandi perbankan dan email yang terhubung melalui perangkat lain yang aman.",
          "Simpan tangkapan layar SMS mencurigakan dan laporkan ke AduanNomor (Komdigi) serta kanal resmi kepolisian.",
          "Gunakan layanan IASC jika terjadi kerugian finansial akibat transaksi tidak sah."
        ],
        officialLinks: [
          { label: "AduanNomor — Komdigi", url: "https://aduannomor.id/", purpose: "Laporkan nomor dan SMS penipuan" },
          { label: "IASC — OJK", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi keuangan" }
        ],
        sources: [
          { publisher: "Komdigi & Bareskrim Polri — Penindakan SMS Blaster Fake BTS 2026", url: "https://aduannomor.id/", accessedAt: "2026-10-10" },
          { publisher: "OJK / Indonesia Anti-Scam Centre", url: "https://iasc.ojk.go.id/", accessedAt: "2026-10-10" }
        ],
        reviewedAt: "2026-10-10", nextReviewAt: "2027-01-10", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "teal", icon: "link"
      },
      {
        id: "ai-voice-clone-emergency", categoryId: "social-family", categoryLabel: "Keluarga & Relasi",
        slug: "panggilan-darurat-dengan-kloning-suara-ai",
        title: "Panggilan darurat dengan kloning suara AI",
        summary: "Pelaku mencuplik rekaman suara kerabat Anda dari media sosial, lalu memakai teknologi AI voice clone untuk menirukan suara persis aslinya dan menelepon Anda mengaku tertimpa kecelakaan atau ditahan polisi.",
        fictionalExample: "“Halo Ma, tolong Ma! Aku kena musibah tabrakan di kantor polisi, butuh uang jaminan Rp5 juta sekarang cepat Ma...”",
        channels: ["Telepon", "WhatsApp", "Pesan Suara"],
        contexts: ["Keluarga", "Darurat", "Sekolah"],
        ageGroups: ["teens", "adults", "elderly"],
        tactics: ["Menyamar", "Mendesak", "Kloning Suara AI", "Menakut-nakuti"],
        requestedAction: "Mentransfer uang segera ke rekening perorangan yang ditunjuk pelaku dengan dalih uang tebusan atau jaminan darurat.",
        warningSigns: [
          "Penelepon bersuara sangat mirip kerabat dekat yang menangis atau panik dan meminta uang segera.",
          "Panggilan menggunakan nomor ponsel asing atau nomor baru dengan alasan ponsel lama rusak atau disita.",
          "Ada pihak lain yang mengaku polisi atau dokter yang mengambil alih telepon dan mengancam proses hukum.",
          "Penelepon melarang Anda mematikan telepon atau menghubungi anggota keluarga lain."
        ],
        independentChecks: [
          "Tarik napas dalam-dalam, tetap tenang, dan matikan panggilan telepon.",
          "Segera hubungi nomor telepon kerabat yang bersangkutan melalui kontak yang tersimpan di ponsel Anda.",
          "Tanyakan pertanyaan verifikasi rahasia keluarga (family safe word) yang hanya diketahui oleh keluarga inti.",
          "Hubungi kerabat lain atau pihak sekolah/kantor untuk memastikan keberadaan kerabat tersebut secara nyata."
        ],
        alreadyActedSteps: [
          "Jika uang sudah terlanjur ditransfer, segera hubungi call center bank Anda untuk memblokir rekening tujuan.",
          "Laporkan nomor telepon dan nomor rekening penipu ke platform AduanNomor dan CekRekening.",
          "Buat laporan pengaduan resmi ke IASC (OJK) dan Sentra Pelayanan Kepolisian Terpadu (SPKT) terdekat.",
          "Beri tahu seluruh keluarga besar agar tidak merespons panggilan serupa dari sindikat yang sama."
        ],
        officialLinks: [
          { label: "IASC — OJK", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi keuangan" },
          { label: "AduanNomor", url: "https://aduannomor.id/", purpose: "Laporkan nomor telepon mencurigakan" },
          { label: "CekRekening", url: "https://cekrekening.id/", purpose: "Periksa dan laporkan rekening penipu" }
        ],
        sources: [
          { publisher: "BSSN & Polri — Peringatan Ancaman Deepfake Audio dan Voice Clone", url: "https://aduannomor.id/", accessedAt: "2026-10-10" },
          { publisher: "OJK / Indonesia Anti-Scam Centre", url: "https://iasc.ojk.go.id/", accessedAt: "2026-10-10" }
        ],
        reviewedAt: "2026-10-10", nextReviewAt: "2027-01-10", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "violet", icon: "users"
      },
      {
        id: "quishing-qris-palsu", categoryId: "commerce", categoryLabel: "Jual Beli & Bisnis",
        slug: "stiker-qris-palsu-dan-qr-pencuri-data-quishing",
        title: "Stiker QRIS palsu dan QR pencuri data (Quishing)",
        summary: "Pelaku menempelkan stiker barcode QRIS palsu di atas QRIS merchant toko, tempat ibadah, atau fasilitas umum untuk mengalihkan pembayaran ke rekening pelaku atau mengarahkan korban ke situs pencuri data.",
        fictionalExample: "“Silakan pindai stiker QRIS di meja kasir. Namun saat discan, nama penerima yang muncul bukan nama toko melainkan 'Donasi Mandiri' atau membuka link browser.”",
        channels: ["QRIS", "Stiker Fisik", "Kamera HP"],
        contexts: ["Belanja online", "Keluarga", "Perbankan"],
        ageGroups: ["kids", "teens", "adults", "elderly"],
        tactics: ["Tautan palsu", "Menyamar", "Mendesak"],
        requestedAction: "Memindai kode QR, mentransfer uang ke rekening tak dikenal, atau memasukkan data login perbankan di situs web hasil scan QR.",
        warningSigns: [
          "Stiker QR terlihat bertumpuk, memiliki ketebalan ganda, atau miring menimpa label QRIS asli merchant.",
          "Nama penerima (merchant name) yang muncul di aplikasi pembayaran berbeda dengan nama toko tempat Anda bertransaksi.",
          "Setelah discan, kamera ponsel membuka browser internet yang meminta nomor kartu debit atau data login.",
          "Stiker QR berada di tempat terbuka tanpa pengawasan langsung dari kasir toko."
        ],
        independentChecks: [
          "Raba permukaan stiker QRIS untuk memastikan tidak ada lapisan stiker tempelan di atasnya.",
          "Konfirmasikan secara lisan kepada kasir nama penerima yang tertera di layar sebelum menekan tombol bayar.",
          "Jika kode QR membuka tautan web di browser, batalkan transaksi dan jangan memasukkan data apa pun."
        ],
        alreadyActedSteps: [
          "Beri tahu pemilik toko atau kasir seketika bahwa stiker QRIS mereka telah ditimpa pihak tak bertanggung jawab.",
          "Jika salah mentransfer uang, simpan bukti transaksi dan segera laporkan ke penyedia dompet digital atau bank Anda.",
          "Laporkan rekening penampung penipuan ke CekRekening dan IASC OJK.",
          "Laporkan temuan stiker palsu kepada pengelola tempat atau kepolisian setempat."
        ],
        officialLinks: [
          { label: "IASC — OJK", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian transaksi keuangan" },
          { label: "CekRekening", url: "https://cekrekening.id/", purpose: "Laporkan rekening penampung penipuan" }
        ],
        sources: [
          { publisher: "Bank Indonesia — Panduan Edukasi Pelindungan Transaksi QRIS", url: "https://iasc.ojk.go.id/", accessedAt: "2026-10-10" },
          { publisher: "Komdigi — CekRekening", url: "https://cekrekening.id/", accessedAt: "2026-10-10" }
        ],
        reviewedAt: "2026-10-10", nextReviewAt: "2027-01-10", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "amber", icon: "bag"
      },
      {
        id: "webapk-update-palsu", categoryId: "banking", categoryLabel: "Perbankan & Akun",
        slug: "pembaruan-aplikasi-bank-palsu-via-browser-webapk",
        title: "Pembaruan aplikasi bank palsu via browser (WebAPK)",
        summary: "Situs web phising memanfaatkan teknologi WebAPK untuk memasang aplikasi malware perbankan langsung dari browser Android tanpa peringatan keamanan standar toko aplikasi resmi.",
        fictionalExample: "“M-Banking Anda mengalami pembaruan sistem. Klik pasang pembaruan Bank_Update.apk dari browser ini untuk mencegah pemblokiran akun.”",
        channels: ["Browser Web", "WhatsApp", "SMS"],
        contexts: ["Perbankan", "Keluarga"],
        ageGroups: ["teens", "adults", "elderly"],
        tactics: ["Menyamar", "Mendesak", "Tautan palsu"],
        requestedAction: "Mengklik tombol 'Pasang Aplikasi' di browser, mengizinkan izin aksesibilitas dan SMS, serta memasukkan username/password perbankan.",
        warningSigns: [
          "Pemberitahuan pembaruan aplikasi bank muncul saat Anda membuka situs web internet, bukan di dalam aplikasi resmi.",
          "Browser meminta izin untuk mengunduh dan menginstal aplikasi berformat .apk dari luar Play Store.",
          "Aplikasi yang baru dipasang meminta izin Aksesibilitas (Accessibility Services) atau izin membaca SMS dan notifikasi.",
          "Alamat web di bilah browser menggunakan nama domain aneh dan bukan domain resmi bank Anda."
        ],
        independentChecks: [
          "Tolak dan tutup seluruh pop-up pembaruan aplikasi yang muncul dari dalam peramban web browser.",
          "Periksa status pembaruan aplikasi hanya melalui Google Play Store atau Apple App Store resmi.",
          "Ingat aturan baku: Perbankan nasional tidak pernah mendistribusikan pembaruan aplikasi lewat tautan browser."
        ],
        alreadyActedSteps: [
          "Segera aktifkan Mode Pesawat (Airplane Mode) pada ponsel untuk memutus koneksi internet dan penyadapan OTP.",
          "Buka Pengaturan HP > Aplikasi > temukan aplikasi mencurigakan yang baru diinstal dan lakukan 'Copot Pemasangan' (Uninstall).",
          "Gunakan perangkat lain yang bersih untuk login ke mobile banking dan segera ganti kata sandi serta amankan rekening.",
          "Hubungi call center resmi bank untuk pengamanan rekening dan laporkan ke IASC serta AduanKonten."
        ],
        officialLinks: [
          { label: "IASC — OJK", url: "https://iasc.ojk.go.id/", purpose: "Pelaporan kerugian finansial perbankan" },
          { label: "CekRekening", url: "https://cekrekening.id/", purpose: "Periksa dan laporkan rekening penipu" },
          { label: "AduanKonten", url: "https://aduankonten.id/", purpose: "Laporkan tautan phishing dan malware web" }
        ],
        sources: [
          { publisher: "Bank Indonesia — Panduan Pelindungan Nasabah terhadap Malware WebAPK", url: "https://iasc.ojk.go.id/", accessedAt: "2026-10-10" },
          { publisher: "Komdigi — AduanKonten", url: "https://aduankonten.id/", accessedAt: "2026-10-10" }
        ],
        reviewedAt: "2026-10-10", nextReviewAt: "2027-01-10", reviewer: "Tim Editorial & Pakar Keamanan Siber WargaSiaga", status: "published", accent: "blue", icon: "shield"
      }
    ],
    reports: [
      { id:"demo-0", title:"Penelepon mengaku call center bank meminta kode verifikasi SMS", summary:"Pelapor dihubungi nomor seluler yang mengaku dari call center bank mengabarkan adanya transaksi mencurigakan dan meminta 6 digit kode OTP.", channel:"Telepon", period:"Oktober 2026", related:"bank-otp", category:"banking", status:"published_unverified", moderatedAt:"2026-10-04" },
      { id:"demo-1", title:"Tawaran tugas harian berujung permintaan isi saldo", summary:"Pelapor menerima tawaran tugas melalui pesan. Setelah komisi kecil ditampilkan, akun diminta menambah saldo untuk membuka tugas berikutnya.", channel:"Telegram", period:"September 2026", related:"job-deposit", category:"job-investment", status:"published_unverified", moderatedAt:"2026-10-02" },
      { id:"demo-2", title:"Perubahan rekening pembayaran pemasok", summary:"Email yang menyerupai pemasok meminta pembayaran invoice ke rekening baru. Ringkasan ini disamarkan dan belum merupakan kesimpulan resmi.", channel:"Email", period:"September 2026", related:"invoice-redirection", category:"commerce", status:"published_unverified", moderatedAt:"2026-10-01" },
      { id:"demo-3", title:"Pesan nomor baru mengatasnamakan anggota keluarga", summary:"Nomor tak dikenal mengaku sebagai anggota keluarga dan meminta bantuan transfer karena keadaan darurat.", channel:"WhatsApp", period:"Agustus 2026", related:"family-emergency", category:"social-family", status:"published_unverified", moderatedAt:"2026-09-28" },
      { id:"demo-4", title:"Pengiriman file APK surat undangan pernikahan di WhatsApp", summary:"Pesan dari nomor asing mengirimkan file berekstensi APK dengan nama Surat Undangan Pernikahan digital dan mendesak penerima membuka file tersebut.", channel:"WhatsApp", period:"Oktober 2026", related:"apk-phishing", category:"malware-phishing", status:"published_unverified", moderatedAt:"2026-10-03" },
      { id:"demo-5", title:"Pembeli marketplace meminta transaksi lewat chat pribadi", summary:"Calon pembeli beralasan saldo akun bermasalah dan mengirimkan link verifikasi transaksi palsu di luar sistem resmi aplikasi jual beli.", channel:"Marketplace", period:"Oktober 2026", related:"marketplace-diversion", category:"commerce", status:"published_unverified", moderatedAt:"2026-10-03" },
      { id:"demo-6", title:"Tawaran pinjaman dana cepat via SMS tanpa agunan", summary:"Pesan SMS menjanjikan pinjaman instan langsung cair dengan syarat mentransfer biaya administrasi provisi ke rekening pribadi lebih dahulu.", channel:"SMS", period:"September 2026", related:"illegal-online-loan", category:"prize-loan", status:"published_unverified", moderatedAt:"2026-09-30" },
      { id:"demo-7", title:"SMS penukaran poin hadiah mencurigakan tanpa nomor pengirim", summary:"Pelapor menerima SMS mengatasnamakan operator seluler yang mengabarkan poin akan hangus dengan tautan klaim hadiah smartphone. Sinyal sempat turun ke 2G saat berada di keramaian.", channel:"SMS", period:"Oktober 2026", related:"sms-blaster-fake-bts", category:"malware-phishing", status:"published_unverified", moderatedAt:"2026-10-10" },
      { id:"demo-8", title:"Panggilan telepon suara anak menangis meminta uang jaminan tabrakan", summary:"Pelapor ditelepon nomor tak dikenal dengan suara persis anak kandungnya yang menangis mengaku ditahan di kantor polisi dan meminta transfer Rp5.000.000 ke rekening orang lain.", channel:"Telepon", period:"Oktober 2026", related:"ai-voice-clone-emergency", category:"social-family", status:"published_unverified", moderatedAt:"2026-10-10" },
      { id:"demo-9", title:"Stiker QRIS tempelan di meja kasir mengarah ke rekening perorangan", summary:"Pelapor memindai QRIS di kasir, namun di aplikasi pembayaran muncul nama penerima 'Donasi Umum' dan kasir mengonfirmasi stiker tersebut baru ditimpa orang asing.", channel:"QRIS", period:"Oktober 2026", related:"quishing-qris-palsu", category:"commerce", status:"published_unverified", moderatedAt:"2026-10-10" },
      { id:"demo-10", title:"Pop-up browser meminta unduh Bank_Update.apk untuk aktivasi akun", summary:"Saat browsing di ponsel, muncul notifikasi bahwa m-banking kedaluwarsa dan mendesak mengunduh file WebAPK langsung dari halaman peramban web tersebut.", channel:"Browser", period:"Oktober 2026", related:"webapk-update-palsu", category:"banking", status:"published_unverified", moderatedAt:"2026-10-10" }
    ]
  };
})();
