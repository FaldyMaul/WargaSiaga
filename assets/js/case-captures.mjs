export const CASE_CAPTURES = {
  "bank-otp": {
    channel:"PANGGILAN + PESAN", sender:"Pusat keamanan?", time:"10.42",
    messages:["Saya dari pusat keamanan bank. Ada transaksi mencurigakan.","Sebutkan kode OTP yang baru masuk agar rekening tidak diblokir.","Harus sekarang. Jangan hubungi cabang karena proses sedang berjalan."],
    alt:"Rekonstruksi pesan yang mengaku dari bank, meminta OTP, dan menekan penerima agar segera bertindak.",
    signals:["Nama lembaga dipakai untuk membangun kepercayaan.","OTP, PIN, dan kata sandi tidak boleh diberikan kepada siapa pun.","Tekanan waktu sengaja menghalangi Anda melakukan verifikasi."],
    source:{label:"Satgas PASTI — imbauan menjaga OTP dan kata sandi",url:"https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Pages/Satgas-PASTI-Hentikan-953-Entitas-Pinjol-Ilegal-dan-Penawaran-Investasi-Ilegal.aspx"}
  },
  "job-deposit": {
    channel:"CHAT REKRUTMEN", sender:"Admin kerja paruh waktu", time:"09.15",
    messages:["Selamat, Anda lolos kerja paruh waktu. Tugasnya cukup memberi like.","Aktifkan akun dengan deposit Rp250.000. Saldo akan kembali.","Transfer dalam 10 menit agar slot tidak diberikan ke orang lain."],
    alt:"Rekonstruksi chat lowongan kerja yang menjanjikan tugas ringan lalu meminta deposit dengan batas waktu.",
    signals:["Lolos tanpa proses rekrutmen yang dapat diverifikasi.","Pekerja justru diminta menyetor uang terlebih dahulu.","Batas waktu singkat mendorong keputusan tanpa pemeriksaan."],
    source:{label:"Polda Jabar — lowongan palsu dan skema tugas berbayar",url:"https://tribratanews.jabar.polri.go.id/ungkap-sindikat-penipuan-online-polda-jabar-imbau-masyarakat-waspada-lowongan-kerja-palsu-di-media-sosial/"}
  },
  "marketplace-diversion": {
    channel:"CHAT PEMBELI", sender:"Pembeli baru", time:"13.08",
    messages:["Kurir di aplikasi sedang bermasalah. Kita proses lewat chat saja.","Buka kurir-cepat.example/lacak untuk mengganti pengiriman.","Masukkan kode verifikasi agar dana penjualan bisa dicairkan."],
    alt:"Rekonstruksi chat pembeli yang mengajak keluar marketplace, mengirim tautan, dan meminta kode verifikasi.",
    signals:["Percakapan dan transaksi diarahkan keluar dari aplikasi resmi.","Tautan dikirim oleh lawan transaksi, bukan dibuka dari aplikasi.","Kode verifikasi dipakai untuk mengambil alih akun, bukan mencairkan dana."],
    source:{label:"Bank Indonesia — modus kurir dan file atau tautan berbahaya",url:"https://www.bi.go.id/id/publikasi/ruang-media/cerita-bi/Pages/modus-penipuan-online-apk.aspx"}
  },
  "investment-return": {
    channel:"GRUP INVESTASI", sender:"Admin grup VIP", time:"19.32",
    messages:["Modal Rp500 ribu bisa menjadi Rp5 juta dalam 3 jam.","Keuntungan 100% dijamin. Tidak ada risiko rugi.","Transfer ke rekening admin sebelum grup VIP ditutup."],
    alt:"Rekonstruksi grup investasi yang menjanjikan keuntungan sangat tinggi, pasti, dan mendesak transfer ke admin.",
    signals:["Imbal hasil besar dijanjikan dalam waktu yang tidak masuk akal.","Investasi selalu memiliki risiko; jaminan untung adalah tanda bahaya.","Dana diminta masuk ke rekening admin, bukan mekanisme berizin."],
    source:{label:"Satgas PASTI — waspada keuntungan tinggi dan pasti",url:"https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Pages/Satgas-PASTI-Hentikan-953-Entitas-Pinjol-Ilegal-dan-Penawaran-Investasi-Ilegal.aspx"}
  },
  "apk-phishing": {
    channel:"PESAN MASUK", sender:"Kurir paket?", time:"11.24",
    messages:["Paket Anda tertahan di pusat sortir.","Buka file Foto_Paket.apk untuk melihat resi dan foto paket.","Izinkan akses SMS agar aplikasi dapat berjalan."],
    alt:"Rekonstruksi pesan kurir yang mengirim file APK dan meminta izin membaca SMS.",
    signals:["Status paket datang dari nomor yang tidak Anda kenal.","Foto atau resi tidak seharusnya berupa aplikasi berakhiran APK.","Izin SMS dapat membuka akses ke kode OTP dan data rahasia."],
    source:{label:"Bank Indonesia — penipuan file APK undangan dan kurir",url:"https://www.bi.go.id/id/publikasi/ruang-media/cerita-bi/Pages/modus-penipuan-online-apk.aspx"}
  },
  "family-emergency": {
    channel:"PESAN NOMOR BARU", sender:"Anak?", time:"20.17",
    messages:["Ma, ini nomor baru. HP lama rusak, simpan nomor ini ya.","Aku perlu bayar tagihan hari ini. Mobile banking belum aktif.","Tolong transfer sekarang. Nanti malam aku ganti."],
    alt:"Rekonstruksi pesan nomor baru yang mengaku sebagai anak dan meminta transfer mendesak.",
    signals:["Nomor baru meminta langsung dipercaya sebagai keluarga.","Alasan teknis dipakai untuk membuat orang lain melakukan pembayaran.","Permintaan transfer mendesak muncul sebelum identitas terverifikasi."],
    source:{label:"Pemkab Bondowoso — contoh peniruan identitas melalui chat",url:"https://bondowosoku.bondowosokab.go.id/post/2086"}
  },
  "prize-refund": {
    channel:"SMS HADIAH", sender:"Program hadiah?", time:"08.06",
    messages:["Selamat! Anda mendapat hadiah Rp100.000.000.","Bayar biaya administrasi Rp750.000 untuk pencairan.","Kirim bukti transfer sebelum pukul 16.00 agar hadiah tidak hangus."],
    alt:"Rekonstruksi SMS hadiah yang meminta biaya administrasi dan bukti transfer sebelum tenggat.",
    signals:["Hadiah muncul tanpa partisipasi yang dapat Anda ingat atau periksa.","Penerima diminta membayar sebelum hadiah dapat diterima.","Ancaman hadiah hangus menciptakan tekanan waktu palsu."],
    source:{label:"OJK — penipuan pemberian dan penyaluran hadiah",url:"https://ojk.go.id/id/Publikasi/Info-Hoax/Pages/Waspada-Modus-Penipuan-Pemberian-dan-Penyaluran-Hadiah-Mengatasnamakan-OJK-2.aspx"}
  },
  "invoice-redirection": {
    channel:"EMAIL MASUK", sender:"finance@supplier-intl.con", time:"14.51",
    messages:["Rekening pembayaran invoice bulan ini telah berubah.","Gunakan rekening baru •••• 7712 untuk seluruh pembayaran berikutnya.","Mohon diproses hari ini. Balas email ini setelah transfer."],
    alt:"Rekonstruksi email pemasok dengan domain yang menyerupai domain asli dan instruksi perubahan rekening mendadak.",
    signals:["Domain pengirim tampak mirip, tetapi ejaannya berbeda.","Perubahan rekening diberitahukan hanya melalui email.","Pembayaran diminta segera tanpa konfirmasi melalui kontak lama."],
    source:{label:"Pusiknas Bareskrim Polri — Business Email Compromise",url:"https://pusiknas.polri.go.id/detail_artikel/waspada_penipuan_email_bisnis%2C_jangan_lengah_hingga_salah_transfer_uang"}
  },
  "recovery-scam": {
    channel:"PESAN PEMULIHAN", sender:"Tim pengembalian dana?", time:"16.40",
    messages:["Kami tim pemulihan dana. Kerugian Anda sudah terdata.","Dana dijamin kembali 100% melalui program pemerintah.","Bayar biaya verifikasi Rp375.000 agar pencairan diproses."],
    alt:"Rekonstruksi pesan jasa pemulihan dana yang menjamin uang kembali dan meminta biaya verifikasi.",
    signals:["Pengirim mengaku mengetahui kerugian Anda tanpa proses resmi.","Tidak ada pihak yang dapat menjamin seluruh dana pasti kembali.","Biaya di muka dapat menjadi penipuan kedua terhadap korban."],
    source:{label:"Jabar Saber Hoaks — jasa pengembalian uang korban penipuan",url:"https://saberhoaks.jabarprov.go.id/v2/klarifikasi/detail/PTN003569/JASA-PENGEMBALIAN-UANG-KORBAN-PENIPUAN-ONLINE"}
  },
  "game-reward-account": {
    channel:"PESAN MEDIA SOSIAL", sender:"Hadiah game?", time:"17.22",
    messages:["Klaim 5.000 diamond gratis untuk pemain terpilih!","Login di hadiah-game.example menggunakan akun game kamu.","Kirim kode yang masuk agar hadiah dapat diaktifkan."],
    alt:"Rekonstruksi pesan hadiah game yang mengarahkan pemain ke situs lain dan meminta kode akun.",
    signals:["Hadiah sangat besar dipakai untuk memancing tindakan cepat.","Login diminta melalui domain yang tidak dibuka dari game resmi.","Kode masuk adalah rahasia akun, bukan syarat aktivasi hadiah."],
    source:{label:"Codashop — peringatan situs phishing hadiah game",url:"https://my.support.codashop.com/hc/ms/articles/4413247083151-Berhati-hati-dengan-laman-web-pancingan-data-Codashop"}
  },
  "deepfake-impersonation": {
    channel:"PANGGILAN VIDEO", sender:"Pimpinan?", time:"15.03",
    messages:["Koneksi tidak stabil, jadi saya tidak bisa bicara lama.","Ini saya. Tolong transfer Rp3 juta sekarang.","Lanjutkan lewat nomor chat baru ini. Jangan telepon balik."],
    alt:"Rekonstruksi panggilan video singkat yang memakai alasan koneksi buruk lalu meminta transfer dan melarang verifikasi balik.",
    signals:["Video sangat singkat atau tidak sinkron bukan bukti identitas.","Wajah atau suara yang dikenal tetap harus diverifikasi lewat kanal lama.","Larangan menelepon balik sengaja memutus jalur pemeriksaan."],
    source:{label:"Polri — penipuan menggunakan teknologi deepfake",url:"https://inp.polri.go.id/artikel/police-arrest-suspect-for-scamming-public-via-deepfake"}
  },
  "illegal-online-loan": {
    channel:"SMS / CHAT PINJAMAN", sender:"Dana cepat?", time:"07.48",
    messages:["Pinjaman Rp10 juta langsung cair tanpa pemeriksaan.","Pasang aplikasi DanaCepat.apk dari tautan yang kami kirim.","Bayar biaya aktivasi Rp300.000 sebelum dana dikirim."],
    alt:"Rekonstruksi tawaran pinjaman lewat chat yang mengirim APK dan meminta biaya aktivasi.",
    signals:["Penawaran pinjaman datang lewat SMS atau WhatsApp tanpa permintaan Anda.","Aplikasi diminta dipasang dari luar toko aplikasi resmi.","Biaya diminta sebelum pencairan dengan janji yang tidak dapat diverifikasi."],
    source:{label:"OJK — waspada pinjaman online ilegal lewat SMS atau WhatsApp",url:"https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Pages/Waspada%21-Pinjaman-Online-Ilegal.aspx"}
  },
  "romance-scam": {
    channel:"CHAT PRIBADI", sender:"Kenalan online", time:"22.11",
    messages:["Aku serius dengan hubungan kita meski kita belum pernah bertemu.","Aku terjebak di luar negeri dan butuh biaya darurat.","Kirim uang atau foto pribadi. Jangan cerita ke siapa pun."],
    alt:"Rekonstruksi chat hubungan online yang cepat menjadi intens lalu meminta uang atau foto secara rahasia.",
    signals:["Kedekatan dan komitmen dibangun sangat cepat tanpa pertemuan nyata.","Krisis mendadak dipakai untuk mengubah rasa sayang menjadi kewajiban membayar.","Permintaan merahasiakan hubungan memisahkan Anda dari pendapat orang tepercaya."],
    source:{label:"Pusiknas Bareskrim Polri — pola umum love scam",url:"https://pusiknas.polri.go.id/detail_artikel/dari_rayuan_ke_ancaman%3A_jejak_kekerasan_dalam_modus_love_scam"}
  }
};
