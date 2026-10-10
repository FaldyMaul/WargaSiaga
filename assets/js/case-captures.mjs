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
  },
  "sms-blaster-fake-bts": {
    channel:"SMS OPERATOR", sender:"INFO-OPERATOR?", time:"11.13",
    messages:["Poin reward Anda 1.500 akan kedaluwarsa hari ini.","Tukarkan poin dengan hadiah smartphone di telko-poin.example/klaim.","Segera klaim sebelum pukul 24.00 atau poin otomatis hangus."],
    alt:"Rekonstruksi SMS palsu dari BTS palsu (SMS Blaster) yang menyamar sebagai operator resmi dengan batas waktu klaim hadiah.",
    signals:["SMS masuk tanpa nomor telepon pengirim berkat perangkat BTS palsu (SMS Blaster).","Tautan mengarah ke situs palsu untuk mencuri data pribadi dan kartu bank.","Tekanan batas waktu penukaran poin dipakai untuk memicu kepanikan penerima."],
    source:{label:"Komdigi & Bareskrim Polri — penindakan sindikat SMS Blaster",url:"https://aduannomor.id/"}
  },
  "ai-voice-clone-emergency": {
    channel:"PANGGILAN / PESAN SUARA", sender:"Nomor Tak Dikenal", time:"14.32",
    messages:["Halo Ma, tolong Ma! Aku kena musibah tabrakan di kantor polisi.","Petugas minta uang damai Rp5.000.000 sekarang juga agar tidak ditahan.","Tolong transfer ke rekening petugas ini, jangan telepon balik dulu Ma!"],
    alt:"Rekonstruksi panggilan suara tiruan AI yang meniru suara kerabat dekat dan meminta uang jaminan darurat.",
    signals:["Suara sangat mirip kerabat dekat dibuat memakai teknologi kloning suara AI.","Skenario darurat dramatis dipakai agar korban panik dan kehilangan nalar kritis.","Larangan menelepon balik bertujuan memutus jalur verifikasi ke nomor asli keluarga."],
    source:{label:"Bareskrim Polri & BSSN — waspada manipulasi suara AI",url:"https://iasc.ojk.go.id/"}
  },
  "quishing-qris-palsu": {
    channel:"PINDAI QRIS", sender:"Kasir / Meja Toko", time:"12.45",
    messages:["Silakan scan stiker QRIS di atas meja kasir untuk pembayaran.","Layar ponsel menampilkan nama penerima 'DONASI UMUM' bukan nama toko fisik.","Tautan QRIS membuka pay-qris-dana.example/transfer yang meminta nomor kartu."],
    alt:"Rekonstruksi stiker QRIS palsu yang menimpa barcode merchant resmi untuk mencuri pembayaran atau data kartu.",
    signals:["Stiker QR fisik ditempel menimpa kode QR resmi milik merchant toko.","Nama merchant yang muncul di layar ponsel tidak cocok dengan nama toko fisik.","QR mengarahkan ke website phishing alih-alih alur pembayaran aplikasi resmi."],
    source:{label:"Bank Indonesia — edukasi pelindungan konsumen bertransaksi QRIS",url:"https://iasc.ojk.go.id/"}
  },
  "webapk-update-palsu": {
    channel:"BROWSER HP", sender:"Pemberitahuan Web", time:"10.09",
    messages:["Pembaruan Keamanan M-Banking wajib dipasang untuk melanjutkan transaksi.","Unduh dan pasang aplikasi pembaruan: Bank_Update_v2.apk dari browser.","Harap izinkan instalasi aplikasi dari sumber browser ini."],
    alt:"Rekonstruksi notifikasi web browser yang menyamar sebagai pembaruan keamanan bank dan mendesak pemasangan WebAPK berbahaya.",
    signals:["Bank resmi tidak pernah meminta pembaruan aplikasi lewat browser internet.","Situs mendesak penginstalan paket aplikasi di luar Google Play Store atau App Store.","Izin instalasi dan akses SMS dipakai untuk membajak kode OTP dan saldo perbankan."],
    source:{label:"Bank Indonesia & BSSN — waspada file WebAPK berbahaya",url:"https://cekrekening.id/"}
  }
};

