import safetyOrbitUrl from "../images/wargasiaga-safety-orbit.svg?url";
import homeCheckUrl from "../images/wargasiaga-home-check.webp?url";
import aiInputsUrl from "../images/wargasiaga-ai-inputs.webp?url";
import communityUrl from "../images/wargasiaga-community.webp?url";
import literacyKeysUrl from "../images/wargasiaga-literasi-data-pribadi.webp?url";
import literacyMarketplaceUrl from "../images/literacy-marketplace-stay-in-app.webp?url";
import literacyDomainUrl from "../images/literacy-lookalike-domain-table.webp?url";
import modusLibraryUrl from "../images/wargasiaga-modus-library-v2.webp?url";
import ageKidsUrl from "../images/age-kids-indonesia.webp?url";
import ageTeensUrl from "../images/age-teens-indonesia.webp?url";
import ageAdultsUrl from "../images/age-adults-indonesia.webp?url";
import ageElderlyUrl from "../images/age-elderly-indonesia.webp?url";
import { CASE_CAPTURES } from "./case-captures.mjs";
import { LUCIDE_ICONS } from "./lucide-icons.js";

const guideImageModules=import.meta.glob("../images/guide-*.webp",{eager:true,query:"?url",import:"default"});
const GUIDE_IMAGE_URLS=Object.fromEntries(Object.entries(guideImageModules).map(([path,url])=>[path.match(/guide-(.+)\.webp$/)?.[1],url]).filter(([id])=>id));
const captureImageModules=import.meta.glob("../images/capture-*.svg",{eager:true,query:"?url",import:"default"});
const captureRealImageModules=import.meta.glob("../images/capture-real-*-v1.webp",{eager:true,query:"?url",import:"default"});
const CAPTURE_SVG_URLS=Object.fromEntries(Object.entries(captureImageModules).map(([path,url])=>[path.match(/capture-(.+)\.svg$/)?.[1],url]).filter(([id])=>id));
const CAPTURE_REAL_URLS=Object.fromEntries(Object.entries(captureRealImageModules).map(([path,url])=>[path.match(/capture-real-(.+)-v1\.webp$/)?.[1],url]).filter(([id])=>id));
const CAPTURE_IMAGE_URLS=Object.fromEntries(Object.keys({...CAPTURE_SVG_URLS,...CAPTURE_REAL_URLS}).map(id=>[id,CAPTURE_REAL_URLS[id]||CAPTURE_SVG_URLS[id]]));


(function () {
  "use strict";

  const DATA = window.WS_DATA || { cards: [], reports: [] };
  const AGE_GROUPS = [
    { value:"all", label:"Semua umur", short:"Semua" },
    { value:"kids", label:"Anak", description:"hingga 12 tahun" },
    { value:"teens", label:"Remaja", description:"13 sampai 17 tahun" },
    { value:"adults", label:"Dewasa", description:"18 sampai 59 tahun" },
    { value:"elderly", label:"Lansia", description:"60 tahun ke atas" }
  ];
  const AGE_GUIDANCE = {
    kids:"Minta orang tua, wali, guru, atau orang dewasa tepercaya membantu memeriksa. Anda tidak perlu menanganinya sendirian.",
    teens:"Jika ada tekanan, ancaman, atau permintaan data, libatkan orang dewasa tepercaya sebelum melanjutkan.",
    adults:"Periksa melalui kanal resmi yang Anda buka sendiri dan libatkan orang tepercaya bila keputusan terasa mendesak.",
    elderly:"Bila perlu, periksa bersama orang yang dipercaya tanpa memberikan kendali akun, PIN, OTP, atau perangkat."
  };
  const AGE_IMAGES = { kids:ageKidsUrl, teens:ageTeensUrl, adults:ageAdultsUrl, elderly:ageElderlyUrl };
  const MODUS_CATEGORIES = window.WS_DATA?.categories || [
    { id:"all", label:"Semua Kategori", icon:"search", count:13 },
    { id:"banking", label:"Perbankan & Akun", icon:"shieldCheck", desc:"OTP, rekening, dan pemulihan dana", cardIds:["bank-otp", "recovery-scam"] },
    { id:"job-investment", label:"Kerja & Investasi", icon:"briefcase", desc:"Deposit lowongan dan janji untung", cardIds:["job-deposit", "investment-return"] },
    { id:"malware-phishing", label:"Pesan & File Bahaya", icon:"link", desc:"APK, link phising, dan deepfake AI", cardIds:["apk-phishing", "deepfake-impersonation"] },
    { id:"commerce", label:"Jual Beli & Bisnis", icon:"bag", desc:"Transaksi luar platform & tagihan invoice", cardIds:["marketplace-diversion", "invoice-redirection"] },
    { id:"social-family", label:"Keluarga & Relasi", icon:"users", desc:"Panggilan darurat dan manipulasi asmara", cardIds:["family-emergency", "romance-scam"] },
    { id:"prize-loan", label:"Hadiah & Pinjaman", icon:"gift", desc:"Undian, reward game, dan pinjol ilegal", cardIds:["prize-refund", "game-reward-account", "illegal-online-loan"] }
  ];
  const ACCOUNT_SECRET_LITERACY = {
    imageUrl:literacyKeysUrl,
    page:20,
    title:"Kenali data yang harus tetap rahasia",
    alt:"Ilustrasi kunci fisik dan kunci digital sebagai pengingat bahwa akses akun harus dijaga.",
    summary:"PIN, kata sandi, OTP, CVV, dan CVC adalah kunci akses akun. Petugas yang menghubungi Anda tidak memerlukan rahasia tersebut.",
    actions:["Tutup percakapan bila diminta menyebutkan kode rahasia.","Buka aplikasi atau situs resmi secara mandiri.","Jika sudah terbagi, amankan akun dari perangkat tepercaya dan hubungi penyedia layanan."],
    source:{label:"Bank Indonesia: Panduan Dasar Pelindungan Konsumen",url:"https://www.bi.go.id/id/Pelindungan-Konsumen/Panduan-Dasar/Default.aspx"}
  };
  const LITERACY_GUIDANCE = {
    "marketplace-diversion":{
      imageUrl:literacyMarketplaceUrl,
      page:12,
      title:"Tetap periksa dari aplikasi marketplace",
      alt:"Cuplikan materi yang mengingatkan pengguna agar tidak memindahkan transaksi keluar marketplace atau membuka tautan dari chat.",
      summary:"Jangan mengikuti alur pembayaran, pengiriman, atau pengembalian dana dari tautan chat. Buka aplikasi marketplace sendiri lalu cari pesanan yang dimaksud.",
      actions:["Periksa status pesanan dari menu di aplikasi resmi.","Tetap gunakan pembayaran dan percakapan di dalam platform.","Hubungi pusat bantuan dari aplikasi bila ada informasi yang berbeda."],
      source:{label:"Scamwatch: Buying and selling scams",url:"https://www.scamwatch.gov.au/types-of-scams/buying-and-selling-scams"}
    },
    "invoice-redirection":{
      imageUrl:literacyDomainUrl,
      page:16,
      title:"Periksa seluruh ejaan domain pengirim",
      alt:"Tabel contoh domain tiruan yang mengganti huruf, angka, tanda hubung, akhiran domain, atau menghapus satu karakter.",
      summary:"Domain yang tampak hampir sama dapat memakai penggantian huruf, angka, tanda hubung, atau akhiran berbeda. Kemiripan adalah tanda untuk memeriksa dan bukan bukti tunggal.",
      actions:["Baca alamat setelah tanda @ sampai karakter terakhir.","Jangan membalas email itu untuk mengonfirmasi perubahan rekening.","Hubungi pemasok melalui nomor lama atau kanal terpisah yang sudah dikenal."],
      source:{label:"Pusiknas Bareskrim Polri: Business Email Compromise",url:"https://pusiknas.polri.go.id/detail_artikel/waspada_penipuan_email_bisnis%2C_jangan_lengah_hingga_salah_transfer_uang"}
    },
    "bank-otp":ACCOUNT_SECRET_LITERACY,
    "apk-phishing":ACCOUNT_SECRET_LITERACY,
    "illegal-online-loan":ACCOUNT_SECRET_LITERACY,
    "game-reward-account":ACCOUNT_SECRET_LITERACY
  };
  const GUIDE_VISUAL_META = {
    "bank-otp":{alt:"Warga memeriksa panggilan tak dikenal melalui perangkat dan kanal terpisah.",steps:["Jangan berikan OTP, PIN, atau kata sandi.","Tutup panggilan lalu hubungi bank dari aplikasi atau nomor resmi.","Jika data sudah terbagi, amankan akun dan hubungi bank segera."]},
    "job-deposit":{alt:"Pencari kerja membandingkan pesan rekrutmen dengan informasi perusahaan sebelum membayar.",steps:["Jangan bayar deposit, top up, atau biaya aktivasi.","Cari perusahaan dan lowongan melalui kanal yang Anda buka sendiri.","Jika uang terkirim, hubungi penyedia pembayaran dan simpan bukti."]},
    "marketplace-diversion":{alt:"Penjual online menjaga transaksi tetap di marketplace dan memeriksa link dari pembeli.",steps:["Jangan pindah pembayaran atau membuka link dari chat pembeli.","Periksa pesanan hanya dari aplikasi marketplace resmi.","Jika akun atau uang terpapar, amankan akun dan hubungi platform."]},
    "investment-return":{alt:"Dua warga memeriksa tawaran investasi menggunakan sumber yang terpisah.",steps:["Jangan transfer karena janji keuntungan atau tekanan waktu.","Periksa legalitas dan identitas melalui kanal resmi yang dicari sendiri.","Jika rugi, hentikan pembayaran dan gunakan jalur pelaporan resmi."]},
    "apk-phishing":{alt:"File, link, dan kode QR tertahan di luar lapisan perlindungan ponsel.",steps:["Jangan pasang APK atau buka link dari pesan tak terduga.","Buka layanan dari aplikasi atau alamat resmi yang Anda ketik sendiri.","Jika terpasang, putuskan koneksi dan amankan akun dari perangkat lain."]},
    "family-emergency":{alt:"Keluarga memverifikasi panggilan mendesak melalui kontak kedua yang sudah dikenal.",steps:["Jangan transfer saat penelepon meminta keputusan seketika.","Tutup panggilan dan hubungi keluarga melalui nomor yang sudah tersimpan.","Jika uang terkirim, hubungi bank atau dompet digital segera."]},
    "prize-refund":{alt:"Hadiah dan panah pengembalian dana diperiksa di balik perisai transparan.",steps:["Jangan bayar biaya untuk menerima hadiah atau refund.","Periksa promo dan pengembalian hanya dari aplikasi atau situs resmi.","Jika kartu atau dana terpapar, blokir akses dan hubungi penyedia."]},
    "invoice-redirection":{alt:"Pemilik usaha membandingkan instruksi pembayaran dengan kontak pemasok resmi.",steps:["Tunda pembayaran bila detail rekening berubah mendadak.","Konfirmasi kepada pemasok lewat kontak lama, bukan balasan email itu.","Jika terbayar, hubungi bank dan pihak pemasok secepatnya."]},
    "recovery-scam":{alt:"Warga dan keluarga meninjau pesan pemulihan dana bersama bukti lama.",steps:["Jangan bayar pihak yang menjanjikan dana pasti kembali.","Verifikasi langsung kepada lembaga melalui kanal resminya.","Simpan pesan baru dan tambahkan ke laporan kerugian sebelumnya."]},
    "game-reward-account":{alt:"Anak menunjukkan tawaran hadiah game kepada orang tua sebelum menekan apa pun.",steps:["Jangan buka link atau bagikan kode akun demi hadiah.","Tunjukkan pesan kepada orang dewasa tepercaya dan cek dari game resmi.","Jika akun terambil, ganti kata sandi dan keluarkan sesi lain."]},
    "deepfake-impersonation":{alt:"Visual wajah dan suara tiruan dibandingkan dengan kontak tepercaya dan perisai.",steps:["Jangan bertindak hanya karena suara atau wajah tampak dikenal.","Hubungi orang tersebut kembali lewat nomor lama atau kanal lain.","Jika uang terkirim, hubungi penyedia dan simpan bukti panggilan."]},
    "illegal-online-loan":{alt:"Warga memeriksa tawaran pinjaman di ponsel melalui informasi resmi di laptop.",steps:["Jangan memasang aplikasi atau membayar biaya pencairan dari chat.","Periksa legalitas penyedia melalui kanal resmi OJK.","Jika data terambil, cabut izin aplikasi dan amankan akun."]},
    "romance-scam":{alt:"Dua teman memeriksa pesan hubungan online sebelum uang atau foto dikirim.",steps:["Jangan kirim uang, kripto, atau foto pribadi tambahan.","Ceritakan kepada orang tepercaya dan periksa identitas secara terpisah.","Jika rugi atau diancam, amankan akun, simpan bukti, dan laporkan."]}
  };
  const page = document.body.dataset.page || "home";
  const root = document.getElementById("app");

  const icons = LUCIDE_ICONS;

  function icon(name, label) {
    return `<svg class="lucide-icon lucide-${name}" data-icon="${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}>${icons[name] || icons.info}</svg>`;
  }

  const nav = [
    ["consult", "konsultasi.html", "Periksa dengan AI"],
    ["modus", "modus.html", "Kenali Modus"],
    ["reports", "laporan.html", "Lapor Warga"],
    ["about", "tentang.html", "Tentang"]
  ];

  function toCleanUrl(href) {
    if (!href || typeof href !== "string") return href;
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return href;
    if (href === "index.html" || href === "/index.html") return "/";
    return href.replace(/^\/?index\.html(?=[?#]|$)/, "/").replace(/\.html(?=[?#]|$)/, "");
  }

  function sectionFor(active) {
    if (["detail"].includes(active)) return "modus";
    if (["report-form", "report-status"].includes(active)) return "reports";
    return active;
  }

  function header() {
    const current = sectionFor(page);
    let consultHref = "konsultasi.html";
    let reportHref = "laporan.html";
    let urgentHref = "bantuan-darurat.html";

    if (page === "detail") {
      try {
        const p = new URLSearchParams(location.search);
        const reqId = p.get("id");
        if (reqId) {
          consultHref = `konsultasi.html?modus=${encodeURIComponent(reqId)}`;
          reportHref = `lapor.html?modus=${encodeURIComponent(reqId)}`;
          urgentHref = `bantuan-darurat.html?modus=${encodeURIComponent(reqId)}`;
        }
      } catch (_) {}
    }

    const currentNav = nav.map(([key, href, label]) => {
      let targetHref = href;
      if (page === "detail") {
        if (key === "consult") targetHref = consultHref;
        if (key === "reports") targetHref = reportHref;
      }
      return [key, targetHref, label];
    });

    return `
      <a class="skip-link" href="#main-content">Lewati ke konten utama</a>
      <header class="site-header">
        <div class="container header-row">
          <a class="brand" href="${toCleanUrl("index.html")}" aria-label="WargaSiaga, beranda"><img src="${toCleanUrl("assets/icons/wargasiaga-logo.png")}" alt="WargaSiaga" class="brand-logo-img" width="140" height="44" /></a>
          <nav class="desktop-nav" aria-label="Navigasi utama">
            ${currentNav.map(([key, href, label]) => `<a class="nav-link${current === key ? " active" : ""}" href="${toCleanUrl(href)}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          </nav>
          <div class="header-actions">
            <button class="icon-button" id="contrast-toggle" type="button" aria-label="Aktifkan kontras tinggi" aria-pressed="false" title="Aktifkan kontras tinggi">${icon("eye")}</button>
            <a class="urgent-header" href="${toCleanUrl(urgentHref)}">${icon("alert")} Bantuan sekarang</a>
            <button class="icon-button menu-button" id="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Buka menu">${icon("menu")}</button>
          </div>
        </div>
        <nav class="mobile-menu" id="mobile-menu" aria-label="Navigasi seluler">
          ${currentNav.map(([key, href, label]) => `<a class="nav-link${current === key ? " active" : ""}" href="${toCleanUrl(href)}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          <a class="nav-link" href="${toCleanUrl(urgentHref)}">Butuh bantuan sekarang</a>
        </nav>
      </header>`;
  }

  function footer() {
    const current = sectionFor(page);
    let consultHref = "konsultasi.html";
    let urgentHref = "bantuan-darurat.html";

    if (page === "detail") {
      try {
        const p = new URLSearchParams(location.search);
        const reqId = p.get("id");
        if (reqId) {
          consultHref = `konsultasi.html?modus=${encodeURIComponent(reqId)}`;
          urgentHref = `bantuan-darurat.html?modus=${encodeURIComponent(reqId)}`;
        }
      } catch (_) {}
    }

    return `
      <footer class="site-footer">
        <div class="container footer-compact"><a class="brand" href="${toCleanUrl("index.html")}" aria-label="WargaSiaga, beranda"><img src="${toCleanUrl("assets/icons/wargasiaga-logo-white.png")}" alt="WargaSiaga" class="brand-logo-img brand-logo-white" width="135" height="42" /></a><nav aria-label="Tautan footer"><a href="${toCleanUrl(consultHref)}">Periksa dengan AI</a><a href="${toCleanUrl("bantu-orang-lain.html")}">Bantu orang lain</a><a href="${toCleanUrl(urgentHref)}">Bantuan darurat</a><a href="${toCleanUrl("tentang.html#layanan-resmi")}">Layanan resmi</a><a href="${toCleanUrl("tentang.html#privasi")}">Privasi</a></nav></div>
        <div class="container footer-bottom"><span>© 2026 WargaSiaga · Panduan Keamanan Digital Warga</span><span>Jangan bagikan OTP, PIN, atau kata sandi.</span></div>
      </footer>
      <nav class="mobile-bottom-nav" aria-label="Navigasi cepat">
        <a class="bottom-link${page === "home" ? " active" : ""}" href="${toCleanUrl("index.html")}"${page === "home" ? ' aria-current="page"' : ""}>${icon("home")}<span>Beranda</span></a>
        <a class="bottom-link${current === "consult" ? " active" : ""}" href="${toCleanUrl(consultHref)}"${current === "consult" ? ' aria-current="page"' : ""}>${icon("chat")}<span>Tanya</span></a>
        <a class="bottom-link${current === "modus" ? " active" : ""}" href="${toCleanUrl("modus.html")}"${current === "modus" ? ' aria-current="page"' : ""}>${icon("search")}<span>Modus</span></a>
        <a class="bottom-link urgent${page === "urgent" ? " active" : ""}" href="${toCleanUrl(urgentHref)}"${page === "urgent" ? ' aria-current="page"' : ""}>${icon("alert")}<span>Darurat</span></a>
      </nav>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
  }

  function shell(content) { return `${header()}<main id="main-content">${content}</main>${footer()}`; }
  function arrowLink(label, href) { return `<a class="text-link" href="${toCleanUrl(href)}">${label}${icon("arrow")}</a>`; }
  function crumb(items) { return `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${toCleanUrl("index.html")}">Beranda</a><span>/</span>${items.map((x, i) => i === items.length - 1 ? `<span aria-current="page">${x[0]}</span>` : `<a href="${toCleanUrl(x[1])}">${x[0]}</a><span>/</span>`).join("")}</nav>`; }

  function modusCard(card) {
    const imageUrl=GUIDE_IMAGE_URLS[card.id];
    const category = MODUS_CATEGORIES.find(c => c.cardIds?.includes(card.id)) || MODUS_CATEGORIES[1];
    return `<article class="modus-card" data-accent="${card.accent}" data-category="${category.id}" data-card-id="${card.id}" data-search="${[card.title,card.summary,category.label,...card.channels,...card.contexts,...card.tactics].join(" ").toLowerCase()}">
      <div class="card-accent"></div>${imageUrl?`<a class="modus-card-media" data-guide-link href="${toCleanUrl(`modus-detail.html?id=${card.id}`)}" tabindex="-1" aria-hidden="true"><img src="${imageUrl}" width="1280" height="853" alt="" loading="lazy"><span class="risk-badge">Perlu diwaspadai</span><span class="card-category-pill">${icon(category.icon)} ${category.label}</span></a>`:""}<div class="modus-card-body"><div class="card-top"><div class="card-header-left"><span class="card-icon">${icon(card.icon)}</span><button class="card-category-badge" type="button" data-filter-category="${category.id}" title="Filter kategori ${category.label}">${icon(category.icon)} <span>${category.label}</span></button></div>${imageUrl?"":'<span class="risk-badge">Perlu diwaspadai</span>'}</div>
      <h3><a data-guide-link href="${toCleanUrl(`modus-detail.html?id=${card.id}`)}">${card.title}</a></h3><p>${card.summary}</p><div class="card-evidence-callout">${icon("scanText")}<span>Dilengkapi <strong class="text-brand-highlight">contoh chat HP</strong> & 3 tanda bahaya</span></div><div class="card-audience">${icon("users")}<span>${card.ageGroups.map(value=>AGE_GROUPS.find(group=>group.value===value)?.label).filter(Boolean).join(" · ")}</span></div><div class="tag-row">${card.channels.slice(0,2).map(x=>`<span class="tag">${x}</span>`).join("")}</div>
      <div class="card-footer"><a class="text-link" data-guide-link href="${toCleanUrl(`modus-detail.html?id=${card.id}`)}">Buka panduan${icon("arrow")}</a></div></div></article>`;
  }

  function formatDate(date) {
    try { return new Intl.DateTimeFormat("id-ID", { day:"numeric", month:"short", year:"numeric" }).format(new Date(`${date}T00:00:00`)); }
    catch (_) { return date; }
  }

  function homePage() {
    return shell(`
      <section class="hero"><div class="container hero-grid">
        <div><span class="eyebrow highlight-pill">${icon("sparkles")} Asisten Keamanan Warga</span><h1>Ada pesan yang membuat <span class="text-gradient">Anda ragu?</span></h1><p>Tulis singkat apa yang terjadi. AI akan memetakan tanda dan mengarahkan Anda ke fitur yang tepat.</p>
          <form class="hero-ask" id="home-ask-form" novalidate><label for="home-ask"><strong>Apa yang ingin Anda periksa?</strong><span>Privasi aman: Jangan sertakan OTP, PIN, atau kata sandi.</span></label><div class="hero-ask-control"><textarea id="home-ask" maxlength="600" required aria-describedby="home-ask-error" placeholder="Contoh: Saya diminta membayar deposit sebelum mulai bekerja."></textarea><button class="btn btn-primary btn-prominent" type="submit">${icon("bot")} Tanya AI</button></div><div class="form-error hidden" id="home-ask-error" role="alert" tabindex="-1"></div></form>
          <a class="hero-emergency-link" href="${toCleanUrl("bantuan-darurat.html")}">${icon("alert")}<span>Sudah terlanjur kirim uang atau data?<strong>Buka bantuan sekarang</strong></span>${icon("arrow")}</a>
          <div class="trust-row"><span class="trust-item">${icon("lock")} Rahasia disamarkan</span><span class="trust-item">${icon("shieldCheck")} Bukan vonis otomatis</span></div>
        </div>
        <aside class="hero-panel" aria-labelledby="scenario-title"><div class="hero-media"><img class="hero-illustration" src="${homeCheckUrl}" width="1280" height="853" alt="" aria-hidden="true" fetchpriority="high"><img class="hero-safety-mark" src="${safetyOrbitUrl}" width="82" height="82" alt="" aria-hidden="true"></div><div class="hero-panel-intro"><div><span class="pulse-label">Pilih cepat</span><h2 id="scenario-title">Situasi saya</h2></div></div>
          <div class="scenario-list">
            <a class="scenario-link" href="${toCleanUrl("modus.html?context=Pencari%20kerja")}"><span class="scenario-icon">${icon("briefcase")}</span><span class="scenario-text"><strong>Ditawari kerja atau tugas</strong><span>Diminta deposit atau isi saldo</span></span><span class="scenario-arrow">${icon("arrow")}</span></a>
            <a class="scenario-link" href="${toCleanUrl("modus.html?context=Belanja%20online")}"><span class="scenario-icon">${icon("bag")}</span><span class="scenario-text"><strong>Sedang jual beli online</strong><span>Diajak keluar dari marketplace</span></span><span class="scenario-arrow">${icon("arrow")}</span></a>
            <a class="scenario-link" href="${toCleanUrl("modus.html?context=Keluarga")}"><span class="scenario-icon">${icon("users")}</span><span class="scenario-text"><strong>Mengatasnamakan orang dekat</strong><span>Ada permintaan uang mendadak</span></span><span class="scenario-arrow">${icon("arrow")}</span></a>
          </div>
        </aside>
      </div></section>
      <section class="section-sm"><div class="container"><div class="urgent-banner compact"><span class="urgent-banner-icon">${icon("alert")}</span><div><h2>Sudah terlanjur kirim uang atau data?</h2><p>Lewati pemeriksaan. Amankan akun dan transaksi sekarang.</p></div><a class="btn btn-urgent" href="${toCleanUrl("bantuan-darurat.html")}">Buka langkah darurat</a></div></div></section>
      <section class="section"><div class="container"><div class="section-heading-row"><div><span class="eyebrow highlight-pill teal">Jalur Layanan</span><h2 class="section-title">Pilih tujuan</h2></div></div><div class="route-grid">
        <a class="route-card" href="${toCleanUrl("modus.html")}"><span class="route-icon">${icon("book")}</span><span><strong>Kenali modus</strong><small>Cari pola berdasarkan situasi</small></span>${icon("arrow")}</a>
        <a class="route-card" href="${toCleanUrl("laporan.html")}"><span class="route-icon">${icon("users")}</span><span><strong>Lapor warga</strong><small>Lihat contoh atau buat laporan</small></span>${icon("arrow")}</a>
        <a class="route-card" href="${toCleanUrl("bantu-orang-lain.html")}"><span class="route-icon">${icon("users")}</span><span><strong>Bantu orang terdekat</strong><small>Mulai percakapan tanpa menyalahkan</small></span>${icon("arrow")}</a>
        <a class="route-card" href="${toCleanUrl("tentang.html")}"><span class="route-icon">${icon("shieldCheck")}</span><span><strong>Tentang & sumber</strong><small>Batasan dan layanan resmi</small></span>${icon("arrow")}</a>
      </div></div></section>`);
  }

  function modusPage() {
    const channels = [...new Set(DATA.cards.flatMap(c=>c.channels))].sort();
    const contexts = [...new Set(DATA.cards.flatMap(c=>c.contexts))].sort();
    return shell(`
      <section class="page-hero compact-hero"><div class="container page-hero-row"><div>${crumb([["Kenali Modus"]])}<span class="eyebrow">Katalog panduan</span><h1 class="section-title">Cari modus yang mirip</h1><p class="section-copy">Pilih kelompok usia atau kategori, lalu cari berdasarkan pesan atau situasi.</p></div><div class="page-hero-visual ratio-3-2 catalog-hero-visual"><img src="${modusLibraryUrl}" width="1536" height="1024" alt="" aria-hidden="true"><a class="urgent-shortcut" href="${toCleanUrl("bantuan-darurat.html")}">${icon("alert")}<span><strong>Sudah terlanjur?</strong><small>Buka bantuan sekarang</small></span>${icon("arrow")}</a></div></div></section>
      <section class="section-sm"><div class="container"><fieldset class="age-selector" id="age-selector" aria-describedby="age-selector-help"><legend><span class="eyebrow">Langkah 1</span><strong>Panduan ini untuk siapa?</strong></legend><p id="age-selector-help">Pilih usia orang yang menghadapi situasi ini. Pilihan hanya memfilter panduan dan tidak disimpan.</p><div class="age-options">${AGE_GROUPS.map((group,index)=>`<label><input type="radio" name="age" value="${group.value}"${index===0?" checked":""}><span>${group.value==="all"?`<span class="age-portrait age-all">${icon("users")}</span>`:`<img class="age-portrait" src="${AGE_IMAGES[group.value]}" width="640" height="640" alt="" loading="lazy">`}<span class="age-option-copy"><strong>${group.label}</strong>${group.description?`<small>${group.description}</small>`:""}</span></span></label>`).join("")}</div></fieldset></div></section>
      <section class="section-sm catalog-section"><div class="container filter-shell">
        <aside class="filter-panel" id="filter-panel" aria-label="Filter modus">
          <div class="spread">
            <div>
              <strong>Filter panduan</strong>
              <small class="muted" style="display:block;font-size:11px">Pilih saluran & konteks</small>
            </div>
            <button class="btn btn-ghost" id="reset-filter" type="button">Hapus filter</button>
          </div>

          <div class="filter-section-block">
            <div class="filter-section-header">
              <span class="filter-category-badge">${icon("phone")} Kanal Kontak</span>
            </div>
            
            <div class="filter-subgroup">
              <span class="filter-subgroup-title">Pesan & Chat</span>
              <div class="filter-checkbox-grid">
                ${["WhatsApp", "Telegram", "Chat", "SMS"].map(v => `<label class="check"><input type="checkbox" name="channel" value="${v}"><span>${v}</span></label>`).join("")}
              </div>
            </div>

            <div class="filter-subgroup">
              <span class="filter-subgroup-title">Platform & Medsos</span>
              <div class="filter-checkbox-grid">
                ${["Media sosial", "Marketplace", "Aplikasi kencan", "Aplikasi"].map(v => `<label class="check"><input type="checkbox" name="channel" value="${v}"><span>${v}</span></label>`).join("")}
              </div>
            </div>

            <div class="filter-subgroup">
              <span class="filter-subgroup-title">Email & Lainnya</span>
              <div class="filter-checkbox-grid">
                ${["Email", "Game online", "QR"].map(v => `<label class="check"><input type="checkbox" name="channel" value="${v}"><span>${v}</span></label>`).join("")}
              </div>
            </div>
          </div>

          <div class="filter-section-block">
            <div class="filter-section-header">
              <span class="filter-category-badge">${icon("briefcase")} Situasi Terkait</span>
            </div>

            <div class="filter-subgroup">
              <span class="filter-subgroup-title">Pekerjaan & Jual Beli</span>
              <div class="filter-checkbox-grid">
                ${["Pencari kerja", "Transaksi bisnis", "Belanja online", "Pengembalian dana"].map(v => `<label class="check"><input type="checkbox" name="context" value="${v}"><span>${v}</span></label>`).join("")}
              </div>
            </div>

            <div class="filter-subgroup">
              <span class="filter-subgroup-title">Finansial & Modal</span>
              <div class="filter-checkbox-grid">
                ${["Kebutuhan dana mendesak", "Investasi", "Pemulihan dana"].map(v => `<label class="check"><input type="checkbox" name="context" value="${v}"><span>${v}</span></label>`).join("")}
              </div>
            </div>

            <div class="filter-subgroup">
              <span class="filter-subgroup-title">Keluarga & Relasi</span>
              <div class="filter-checkbox-grid">
                ${["Keluarga", "Hubungan baru", "Akun game"].map(v => `<label class="check"><input type="checkbox" name="context" value="${v}"><span>${v}</span></label>`).join("")}
              </div>
            </div>
          </div>
        </aside>
        <div>
          <div class="category-classification" role="region" aria-label="Klasifikasi kategori penipuan">
            <div class="category-header">
              <span class="eyebrow">Langkah 2</span>
              <strong>Pilih Kategori Kasus</strong>
              <span class="category-hint">Klasifikasi 13 panduan tersedia untuk mempermudah pencarian</span>
            </div>
            <div class="category-chip-group" id="category-chip-group" role="tablist" aria-label="Pilih kategori modus">
              ${MODUS_CATEGORIES.map((cat, idx) => `
                <button class="category-tab${idx === 0 ? " active" : ""}" type="button" role="tab" data-category-id="${cat.id}" aria-selected="${idx === 0 ? "true" : "false"}">
                  <span class="cat-icon">${icon(cat.icon)}</span>
                  <span class="cat-label">${cat.label}</span>
                  <span class="cat-count">${cat.cardIds ? cat.cardIds.length : DATA.cards.length}</span>
                </button>
              `).join("")}
            </div>
          </div>
          <div class="catalog-step-label"><span class="eyebrow">Langkah 3</span><strong>Cari atau gunakan filter tambahan</strong></div>
          <div class="search-box">${icon("search")}<label class="sr-only" for="modus-search">Cari modus</label><input id="modus-search" type="search" placeholder="Cari: lowongan, OTP, marketplace…" autocomplete="off"><button class="search-clear hidden" id="search-clear" type="button" aria-label="Hapus pencarian">${icon("close")}</button></div>
          <h2 class="sr-only" id="catalog-heading">Daftar panduan modus</h2>
          <div class="result-toolbar">
            <span class="result-count" id="result-count" role="status" aria-live="polite">${DATA.cards.length} panduan ditemukan</span>
            <div class="catalog-toolbar-actions">
              <div class="view-toggle-group" id="view-toggle-group" role="group" aria-label="Pilihan tampilan katalog">
                <button class="view-btn active" type="button" data-view="grid3" title="Tampilan 3 Kolom" aria-pressed="true">
                  ${icon("grid")} <span class="view-label">3 Kolom</span>
                </button>
                <button class="view-btn" type="button" data-view="list" title="Tampilan Daftar Ringkas (1 Kolom)" aria-pressed="false">
                  ${icon("list")} <span class="view-label">Daftar Ringkas</span>
                </button>
                <button class="view-btn" type="button" data-view="grid2" title="Tampilan 2 Kolom" aria-pressed="false">
                  ${icon("columns")} <span class="view-label">2 Kolom</span>
                </button>
              </div>
              <button class="btn btn-secondary mobile-filter" id="filter-toggle" type="button" aria-expanded="false" aria-controls="filter-panel">${icon("filter")} Filter</button>
            </div>
          </div>
          <div class="active-filters hidden" id="active-filters" aria-label="Filter aktif"></div>
          <div class="cards-grid catalog-grid view-grid3" id="modus-grid">${DATA.cards.map(modusCard).join("")}</div>
        </div>
      </div></section>
      <section class="section-sm surface-section"><div class="container literacy-strip"><div class="literacy-visual"><img src="${literacyKeysUrl}" width="516" height="580" loading="lazy" alt="Ilustrasi gantungan kunci sebagai pengingat untuk menjaga akses akun"></div><div class="literacy-copy"><span class="eyebrow">Ingat tiga hal</span><h2>Data akun adalah kunci digital Anda</h2><div class="habit-list"><span>${icon("lock")} Jangan berikan OTP, PIN, atau kata sandi.</span><span>${icon("link")} Buka situs atau aplikasi resmi dengan mengetik alamat sendiri.</span><span>${icon("shieldCheck")} Aktifkan verifikasi dua langkah bila tersedia.</span></div><p class="asset-credit">Diselaraskan dengan materi edukasi literasi digital resmi: <cite>Pandu Literasi Digital</cite> &amp; standar perlindungan konsumen nasional.</p></div></div></section>`);
  }

  function detailPage() {
    const params = new URLSearchParams(location.search);
    const requestedId = params.get("id");
    const card = DATA.cards.find(c=>c.id === requestedId || c.slug === requestedId);
    if (!card) {
      document.title = "Panduan tidak ditemukan | WargaSiaga";
      return shell(`<section class="page-hero"><div class="container">${crumb([["Kenali Modus","modus.html"],["Tidak ditemukan"]])}<span class="eyebrow">Tautan tidak dikenali</span><h1 class="section-title">Panduan tidak ditemukan</h1><p class="section-copy">Alamat mungkin tidak lengkap atau panduan telah dipindahkan. Pilih panduan dari pustaka agar informasi yang tampil sesuai.</p><div class="hero-actions"><a class="btn btn-primary" href="${toCleanUrl("modus.html")}">Buka pustaka modus</a><a class="btn btn-urgent" href="${toCleanUrl("bantuan-darurat.html")}">Butuh bantuan sekarang</a></div></div></section>`);
    }
    const selectedAge=AGE_GROUPS.find(group=>group.value!=="all"&&group.value===params.get("age")&&card.ageGroups.includes(group.value));
    const catalogueHref=selectedAge?toCleanUrl(`modus.html?age=${encodeURIComponent(selectedAge.value)}`):toCleanUrl("modus.html");
    const guideImageUrl=GUIDE_IMAGE_URLS[card.id];
    const visual=GUIDE_VISUAL_META[card.id];
    const literacy=LITERACY_GUIDANCE[card.id];
    const capture=CASE_CAPTURES[card.id];
    const captureImageUrl=CAPTURE_IMAGE_URLS[card.id];
    const category = MODUS_CATEGORIES.find(c => c.cardIds?.includes(card.id) || c.id === card.categoryId) || MODUS_CATEGORIES[1];
    const categoryHref = toCleanUrl(`modus.html?category=${encodeURIComponent(category.id)}`);
    document.title = `${card.title} | WargaSiaga`;
    const list = (items, cls="") => `<ul class="check-list ${cls}">${items.map(i=>`<li>${i}</li>`).join("")}</ul>`;
    return shell(`
      <section class="page-hero detail-hero"><div class="container">${crumb([["Kenali Modus",catalogueHref],[category.label,categoryHref],[card.title]])}</div></section>
      <section class="section-sm"><div class="container detail-layout"><article class="article-card"><header class="article-head"><div class="inline"><span class="card-category-pill" style="margin-right:6px">${icon(category.icon)} ${category.label}</span><span class="risk-badge">Perlu diwaspadai</span>${card.channels.slice(0,2).map(x=>`<span class="tag">${x}</span>`).join("")}</div><h1><span class="text-gradient">${card.title}</span></h1><p class="section-copy">${card.summary}</p>${selectedAge?`<div class="audience-note"><img class="audience-avatar" src="${AGE_IMAGES[selectedAge.value]}" width="640" height="640" alt=""><div><strong>Panduan untuk ${selectedAge.label}</strong><span>${AGE_GUIDANCE[selectedAge.value]}</span></div></div>`:""}<div class="hero-actions"><a class="btn btn-primary" href="${toCleanUrl("konsultasi.html")}">${icon("bot")} Periksa kasus serupa dengan AI</a><a class="btn btn-secondary" href="${toCleanUrl(`lapor.html?modus=${encodeURIComponent(card.id)}`)}">${icon("file")} Laporkan modus ini</a><a class="btn btn-urgent" href="${toCleanUrl("bantuan-darurat.html")}">${icon("alert")} Saya sudah bertindak</a></div></header>
        ${capture&&captureImageUrl?`<section class="case-learning" aria-labelledby="case-learning-title"><div class="case-capture-column"><span class="capture-label">Contoh pesan</span><button class="capture-open" id="capture-open" type="button" aria-haspopup="dialog" aria-controls="capture-dialog"><img src="${captureImageUrl}" width="800" height="1000" alt="${capture.alt}" fetchpriority="high"><span class="capture-zoom">${icon("search")} Perbesar contoh</span></button><p class="capture-disclaimer">Contoh fiktif berdasarkan pola yang dilaporkan. Bukan chat asli dan bukan bukti bahwa pengirim tertentu adalah penipu.</p></div><div class="case-analysis"><span class="eyebrow highlight-pill">Contoh yang sering muncul</span><h2 id="case-learning-title">Baca pesannya, cari tiga tanda</h2><ol class="capture-signals">${capture.signals.map((signal,index)=>`<li><span>${index+1}</span><p>${signal}</p></li>`).join("")}</ol><a class="source-link capture-source" href="${capture.source.url}" target="_blank" rel="noopener noreferrer">${icon("external")}<span>Sumber pola: ${capture.source.label}</span></a>${guideImageUrl&&visual?`<figure class="context-visual"><img src="${guideImageUrl}" width="1280" height="853" alt="${visual.alt}" loading="lazy"><figcaption>Gambaran situasi</figcaption></figure>`:""}</div></section><dialog class="capture-dialog" id="capture-dialog" aria-labelledby="capture-dialog-title"><div class="capture-dialog-head"><div><span class="eyebrow">Rekonstruksi edukasi</span><h2 id="capture-dialog-title">Contoh pesan yang perlu diperiksa</h2></div><button class="icon-button" id="capture-close" type="button" aria-label="Tutup contoh pesan">${icon("close")}</button></div><div class="capture-dialog-body"><img src="${captureImageUrl}" width="800" height="1000" alt="${capture.alt}"><div class="capture-transcript"><h3>Transkrip</h3><ol>${capture.messages.map((message,index)=>`<li><strong>${index+1}</strong><span>${message}</span></li>`).join("")}</ol><p>${capture.alt}</p></div></div></dialog>`:""}
        <div class="article-content"><section class="article-section priority-section"><span class="eyebrow highlight-pill amber">Lihat dahulu</span><h2>Tanda yang patut diwaspadai</h2>${list(card.warningSigns,"warning-list")}</section>
        ${visual?`<section class="article-section safe-flow" aria-labelledby="safe-flow-title"><span class="eyebrow highlight-pill teal">Alur aman</span><h2 id="safe-flow-title">Jeda, periksa, lalu amankan</h2><ol class="safe-flow-grid"><li><span class="safe-flow-icon">${icon("clock")}</span><span><strong>1. Jeda</strong><small>${visual.steps[0]}</small></span></li><li><span class="safe-flow-icon">${icon("search")}</span><span><strong>2. Periksa</strong><small>${visual.steps[1]}</small></span></li><li><span class="safe-flow-icon">${icon("shieldCheck")}</span><span><strong>3. Amankan</strong><small>${visual.steps[2]}</small></span></li></ol></section>`:""}
        ${literacy?`<details class="content-disclosure literacy-reference"><summary><span>${icon("book")} Panduan Literasi & Edukasi Visual</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content literacy-reference-grid"><figure class="literacy-reference-figure"><img src="${literacy.imageUrl}" alt="${literacy.alt}" loading="lazy"><figcaption>Panduan Visual: ${literacy.title}. Penjelasan terintegrasi di samping gambar.</figcaption></figure><div class="literacy-reference-copy"><span class="reference-kicker">Ringkasan Edukasi</span><h3>${literacy.title}</h3><p>${literacy.summary}</p>${list(literacy.actions)}<a class="source-link" href="${literacy.source.url}" target="_blank" rel="noopener noreferrer">${icon("external")}<span>Periksa rujukan: ${literacy.source.label}</span></a><p class="asset-credit">Diselaraskan dengan materi edukasi literasi digital resmi: <cite>Pandu Literasi Digital</cite> &amp; standar perlindungan konsumen nasional.</p></div></div></details>`:""}
        <details class="content-disclosure"><summary><span>${icon("chat")} Contoh pola dan permintaan</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content"><div class="example-box"><p>${card.fictionalExample}</p><div class="example-label">Contoh edukasi</div></div><h3>Apa yang diminta</h3><p>${card.requestedAction}</p></div></details>
        <details class="content-disclosure"><summary><span>${icon("shieldCheck")} Cara memeriksa dengan aman</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content">${list(card.independentChecks)}</div></details>
        <section class="article-section urgent-section"><h2>${icon("alert")} <span class="text-gradient-urgent">Jika sudah terlanjur</span></h2>${list(card.alreadyActedSteps,"urgent-list")}<a class="btn btn-urgent" href="${toCleanUrl("bantuan-darurat.html")}">Buka langkah darurat ${icon("arrow")}</a></section>
        <details class="content-disclosure"><summary><span>${icon("info")} Catatan penting</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content"><p>Tidak ditemukannya laporan bukan bukti bahwa nomor, rekening, atau tautan aman. Tetap verifikasi melalui penyedia layanan resmi.</p></div></details></div></article>
        <aside class="side-stack"><div class="side-card related-action-card"><span class="side-card-icon">${icon("bot")}</span><h3>Masih ragu?</h3><p>Tanyakan situasi ini kepada asisten WargaSiaga.</p><a class="btn btn-primary btn-block" href="${toCleanUrl(`konsultasi.html?modus=${encodeURIComponent(card.id)}`)}">Periksa Kasus Ini dengan AI</a><a class="btn btn-secondary btn-block" href="${toCleanUrl(`lapor.html?modus=${encodeURIComponent(card.id)}`)}" style="margin-top:8px">${icon("file")} Laporkan Modus ke Warga</a></div>
          <div class="side-card"><h3>Kanal resmi</h3>${card.officialLinks.map(s=>`<a class="source-link" href="${s.url}" target="_blank" rel="noopener noreferrer">${icon("external")}<span>${s.label}<br><span class="muted">${s.purpose}</span></span></a>`).join("")}</div>
          <details class="side-card side-disclosure"><summary>Sumber & peninjauan ${icon("arrow")}</summary><div class="side-disclosure-body"><p>Ditinjau ${formatDate(card.reviewedAt)} · diperbarui berkala</p>${card.sources.map(s=>`<a class="source-link" href="${s.url}" target="_blank" rel="noopener noreferrer">${icon("external")}<span>${s.publisher}</span></a>`).join("")}<p class="small">Standar Panduan Keamanan Digital WargaSiaga (Tinjauan Ahli Keamanan Siber)</p></div></details>
          <details class="side-card side-disclosure"><summary>Bagikan panduan ${icon("copy")}</summary><div class="side-disclosure-body"><label class="sr-only" for="share-url">Tautan panduan</label><input class="share-field" id="share-url" type="url" readonly><button class="btn btn-secondary btn-block" id="share-guide" type="button">${icon("copy")} Salin tautan</button></div></details></aside>
      </div></section>`);
  }

  function consultPage() {
    return shell(`
      <section class="page-hero compact-hero"><div class="container page-hero-row"><div>${crumb([["Periksa dengan AI"]])}<span class="eyebrow highlight-pill">${icon("sparkles")} Asisten Keamanan Warga</span><h1 class="section-title">Apa yang ingin <span class="text-gradient">Anda periksa?</span></h1><p class="section-copy">Ceritakan situasi yang mencurigakan. Anda juga dapat menambahkan link atau tangkapan layar untuk dianalisis.</p></div><div class="page-hero-visual"><img src="${aiInputsUrl}" width="1280" height="720" alt="" aria-hidden="true"><a class="urgent-shortcut" href="${toCleanUrl("bantuan-darurat.html")}">${icon("alert")}<span><strong>Sudah terlanjur?</strong><small>Buka bantuan sekarang</small></span>${icon("arrow")}</a></div></div></section>
      <section class="section-sm consult-workspace">
        <div class="container consult-workbench">
          <div class="consult-grid">
            <div class="consult-input-col">
              <div id="consult-modus-context-wrap"></div>
              <div class="chat-shell" id="consult-shell">
                <div class="chat-head"><div class="assistant-id"><span class="assistant-avatar">${icon("bot")}<span class="assistant-spark" aria-hidden="true">${icon("sparkles")}</span></span><div><strong>Asisten Keamanan Warga</strong><span id="consult-service-state">Sistem analisis siap membantu</span></div></div><span class="status-badge status-review" id="consult-mode-badge">Siaga Aktif</span></div>
                <div class="chat-body" id="chat-body"><div class="message assistant"><strong>Pilih contoh kasus atau tuliskan dengan kalimat Anda sendiri.</strong><span>Privasi terjaga: Jangan pernah sertakan OTP, PIN, atau kata sandi.</span></div><div class="quick-prompts"><button class="quick-prompt" type="button" data-prompt="Saya ditawari kerja, tetapi diminta transfer deposit sebelum mulai.">Kerja & Deposit</button><button class="quick-prompt" type="button" data-prompt="Ada yang mengaku dari bank dan meminta kode OTP.">Bank & OTP</button><button class="quick-prompt" type="button" data-prompt="Pembeli meminta saya klik tautan kurir di luar marketplace.">Tautan Pembeli</button></div></div>
                <form class="chat-compose" id="consult-form" novalidate>
                  <div class="form-error hidden" id="consult-error" role="alert" tabindex="-1"></div>
                  <fieldset class="exposure-check" aria-describedby="consult-error">
                    <legend><span class="step-label-icon">${icon("shieldCheck")}</span>Apakah Anda sudah mengirim uang, data, atau akses akun?</legend>
                    <div class="exposure-options"><label><input type="radio" name="exposure" value="none" required><span>Belum / tidak</span></label><label><input type="radio" name="exposure" value="money"><span>Ya, uang terkirim</span></label><label><input type="radio" name="exposure" value="access"><span>Ya, akses atau OTP dibagikan</span></label></div>
                  </fieldset>
                  <div class="consult-exposure-alert hidden" id="exposure-alert-banner" role="alert">
                    <span class="alert-icon">${icon("alert")}</span>
                    <div>
                      <strong>Uang atau akses akun sudah berpindah tangan?</strong> Jangan tunda untuk menunggu analisis AI. Segera amankan akun perbankan dan hubungi penyedia pembayaran sekarang.
                      <div style="margin-top:8px"><a class="btn btn-urgent btn-sm" href="${toCleanUrl("bantuan-darurat.html")}">${icon("arrow")} Buka Bantuan Darurat Sekarang</a></div>
                    </div>
                  </div>
                  <div class="consult-step primary-input"><label for="consult-input" class="field-label-row"><span class="step-label-icon">${icon("chat")}</span><span><strong>Ceritakan situasi</strong> <span class="muted">atau kosongkan bila hanya memeriksa link</span></span></label><textarea id="consult-input" maxlength="1500" aria-describedby="consult-error consult-privacy" placeholder="Contoh: Saya ditawari kerja lalu diminta membayar deposit."></textarea><span class="char-count"><span id="consult-count">0</span>/1500</span></div>
                  <div class="input-options" aria-label="Tambahkan bukti opsional">
                    <details class="input-disclosure"><summary><div class="disclosure-main"><span class="disclosure-icon">${icon("globeLock")}</span><span class="disclosure-title-group"><strong>Periksa link (URL)</strong><small>Link tidak akan dibuka</small></span></div><span class="summary-action">${icon("arrow")} <span class="action-text">Tambah</span></span></summary><div class="disclosure-body consult-step"><label for="consult-url">Tempel link</label><input id="consult-url" type="text" inputmode="url" maxlength="2048" autocomplete="off" spellcheck="false" aria-describedby="consult-url-help consult-error" placeholder="contoh.id/login"><p class="field-help" id="consult-url-help">WargaSiaga hanya memeriksa bentuk alamatnya, bukan isi situs.</p></div></details>
                    <details class="input-disclosure" id="image-disclosure"><summary><div class="disclosure-main"><span class="disclosure-icon">${icon("scanText")}</span><span class="disclosure-title-group"><strong>Baca tangkapan layar</strong><small>Teks dibaca di perangkat Anda</small></span></div><span class="summary-action">${icon("arrow")} <span class="action-text">Tambah</span></span></summary><div class="disclosure-body consult-step image-evidence"><div class="image-actions"><label class="btn btn-secondary" for="consult-image">${icon("image")} Pilih gambar</label><input class="sr-only" id="consult-image" type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="consult-image-help"><button class="btn btn-secondary hidden" id="analyze-image" type="button">${icon("scanText")} Ambil teks</button><button class="btn btn-ghost hidden" id="remove-image" type="button">${icon("trash")} Hapus</button></div><p class="field-help" id="consult-image-help"><span class="micro-icon">${icon("qrCode")}</span>PNG, JPG, atau WebP · maks. 5 MB · gambar tidak diunggah.</p><div class="image-preview-wrap hidden" id="image-preview-wrap"><img id="image-preview" alt="Pratinjau tangkapan layar yang dipilih"><div><strong id="image-name"></strong><span id="image-status" role="status" aria-live="polite">Siap mengambil teks.</span></div></div></div></details>
                  </div>
                  <label class="ai-consent" for="consult-consent"><input id="consult-consent" type="checkbox"><span class="consent-icon" aria-hidden="true">${icon("shieldCheck")}</span><span><strong>Izinkan analisis AI</strong><small>Data sensitif disamarkan. Percakapan tidak disimpan WargaSiaga.</small></span></label>
                  <details class="privacy-disclosure"><summary>Bagaimana data diproses?</summary><p class="field-help" id="consult-privacy">Teks Anda diproses melalui server WargaSiaga untuk penyaringan otomatis data sensitif (nomor telepon, nomor rekening, NIK, dsb.) sebelum bagian yang relevan diteruskan ke model AI. Percakapan tidak disimpan oleh WargaSiaga. Jangan pernah menyertakan OTP, PIN, atau kata sandi. Baca kembali teks hasil pemindaian sebelum mengirim.</p></details>
                  <div class="chat-tools"><span class="small muted">Hasil berupa panduan awal, bukan keputusan final.</span><button class="btn btn-primary btn-prominent" id="consult-submit" type="submit">${icon("scanSearch")} Periksa sekarang</button></div>
                </form>
              </div>
            </div>
            <div class="consult-result-col">
              <div class="consult-ready-card" id="consult-ready-state">
                <div class="ready-card-header">
                  <span class="eyebrow highlight-pill teal">${icon("sparkles")} Pusat Analisis Keamanan</span>
                  <h2>Hasil Analisis & Konsultasi Interaktif</h2>
                  <p>Tuliskan percakapan atau tempel link di panel kiri, lalu klik <strong>Periksa sekarang</strong>. AI akan mengurai indikasi risiko secara real time tanpa menyimpan data pribadi Anda.</p>
                </div>
                <div class="ready-features-grid">
                  <div class="ready-feature-item">
                    <div class="ready-feature-icon">${icon("scanSearch")}</div>
                    <div>
                      <strong>Pendeteksian Tanda Manipulasi</strong>
                      <p>Mengenali pola desakan waktu, iming iming hadiah, rekayasa transfer, atau lowongan deposit fiktif.</p>
                    </div>
                  </div>
                  <div class="ready-feature-item">
                    <div class="ready-feature-icon">${icon("globeLock")}</div>
                    <div>
                      <strong>Inspeksi Struktur Tautan Aman</strong>
                      <p>Memeriksa keanehan domain tiruan, tautan pendek mencurigakan, atau alamat yang meniru merek resmi.</p>
                    </div>
                  </div>
                  <div class="ready-feature-item">
                    <div class="ready-feature-icon">${icon("bot")}</div>
                    <div>
                      <strong>Helpdesk Konsultasi Multi Chat</strong>
                      <p>Setelah hasil awal keluar, Anda dapat bertanya lebih lanjut untuk mendapatkan panduan mitigasi langkah demi langkah.</p>
                    </div>
                  </div>
                  <div class="ready-feature-item">
                    <div class="ready-feature-icon">${icon("shieldCheck")}</div>
                    <div>
                      <strong>Penyamaran Data Otomatis</strong>
                      <p>Pola nomor telepon, rekening, NIK, dan email disamarkan sebelum diproses agar kerahasiaan Anda terjaga.</p>
                    </div>
                  </div>
                </div>
                <div class="ready-category-explorer">
                  <div class="ready-category-head">
                    <span class="eyebrow highlight-pill teal">${icon("search")} Mulai dari Kategori Kasus</span>
                    <p>Pilih kategori di bawah untuk mengisi contoh simulasi konsultasi sesuai pola modus resmi:</p>
                  </div>
                  <div class="ready-categories-grid">
                    ${MODUS_CATEGORIES.filter(cat => cat.id !== "all").map(cat => `
                      <button class="ready-category-chip" type="button" data-category-prompt-id="${cat.id}">
                        <span class="chip-icon">${icon(cat.icon)}</span>
                        <div class="chip-text">
                          <strong>${cat.label}</strong>
                          <small>${cat.desc}</small>
                        </div>
                      </button>
                    `).join("")}
                  </div>
                </div>
                <div class="ready-quick-tips">
                  <div class="ready-tip-title">${icon("alert")} Catatan Penting Sebelum Memeriksa:</div>
                  <p>Bila Anda sudah terlanjur mentransfer uang atau membagikan kode OTP, segera buka <strong>Bantuan Sekarang</strong> untuk menghubungi call center darurat bank tanpa harus menunggu hasil analisis.</p>
                  <div class="ready-tip-actions">
                    <a class="btn btn-secondary btn-sm" href="${toCleanUrl("bantuan-darurat.html")}">${icon("phone")} Buka Bantuan Darurat</a>
                    <a class="btn btn-ghost btn-sm" href="${toCleanUrl("modus.html")}">${icon("book")} Katalog Modus</a>
                  </div>
                </div>
              </div>
              <div id="consult-result" class="assessment hidden" role="status" aria-live="polite" tabindex="-1"></div>
            </div>
          </div>
        </div>
      </section>`);
  }

  function urgentPage() {
    return shell(`
      <section class="emergency-hero compact-emergency"><div class="container">${crumb([["Bantuan sekarang"]])}<span class="eyebrow highlight-pill urgent-hero-pill">${icon("alert")} Tindakan Cepat Tanggap</span><h1>Amankan <span class="emergency-title-highlight">Uang dan Akses Akun</span> Sekarang</h1><p class="section-copy emergency-hero-copy">Pilih peristiwa yang sudah terjadi untuk menampilkan urutan penanganan darurat, hotline bank, dan generator laporan resmi.</p></div></section>
      <section class="section-sm" style="padding-bottom:0">
        <div class="container">
          <div class="emergency-flow-card">
            <div class="flow-card-head">
              <span class="eyebrow highlight-pill amber">${icon("clock")} Prioritas Tanggap Cepat</span>
              <h2>Urutan Penyelamatan Awal Sesuai Kejadian</h2>
              <p>Lakukan langkah penyelamatan secepatnya tanpa menunda. Jangan menunggu bukti terkumpul lengkap sebelum menghubungi bank atau penyedia pembayaran.</p>
            </div>
            <div class="flow-steps-grid">
              <div class="flow-step-box">
                <div class="flow-step-badge">Bila Uang Terkirim</div>
                <div class="flow-step-icon-wrap">${icon("phone")}</div>
                <h3>Hubungi Bank & Lapor IASC</h3>
                <p>Segera hubungi call center bank Anda dan buat laporan di portal IASC (iasc.ojk.go.id). Minta bank menahan transaksi jika memungkinkan.</p>
              </div>
              <div class="flow-arrow-divider">${icon("arrow")}</div>
              <div class="flow-step-box">
                <div class="flow-step-badge">Bila APK / Akses Asing</div>
                <div class="flow-step-icon-wrap">${icon("lock")}</div>
                <h3>Isolasi Perangkat</h3>
                <p>Aktifkan Mode Pesawat (matikan WiFi & data). Amankan perbankan dari perangkat bersih lain yang tidak terinfeksi.</p>
              </div>
              <div class="flow-arrow-divider">${icon("arrow")}</div>
              <div class="flow-step-box">
                <div class="flow-step-badge">Dokumentasi</div>
                <div class="flow-step-icon-wrap">${icon("file")}</div>
                <h3>Simpan Bukti Mutasi</h3>
                <p>Tangkapan layar nomor rekening tujuan, bukti transfer, mutasi bank, dan chat pelaku. Jangan sebar data ke ruang publik.</p>
              </div>
              <div class="flow-arrow-divider">${icon("arrow")}</div>
              <div class="flow-step-box">
                <div class="flow-step-badge">Proses Pidana</div>
                <div class="flow-step-icon-wrap">${icon("shieldCheck")}</div>
                <h3>Buat Laporan Polisi (LP)</h3>
                <p>Datangi kantor kepolisian/SPKT terdekat untuk membuat Laporan Polisi (LP) resmi guna penyelidikan hukum.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="section-sm"><div class="container"><div class="form-card incident-picker"><h2>Apa yang sudah terjadi?</h2><p class="section-copy" style="margin-bottom:16px">Tandai situasi yang sedang Anda alami untuk memfilter urutan tindakan paling mendesak.</p><div class="choice-grid" id="incident-choices">
        <label class="choice"><input type="checkbox" value="money"><span><strong>Uang sudah terkirim</strong><span>Transfer bank, dompet digital, kartu, atau kripto</span></span></label>
        <label class="choice"><input type="checkbox" value="otp"><span><strong>OTP / kata sandi dibagikan</strong><span>Kode masuk, PIN, atau data kartu</span></span></label>
        <label class="choice"><input type="checkbox" value="app"><span><strong>Aplikasi / file dipasang</strong><span>APK, kendali jarak jauh, atau izin perangkat</span></span></label>
        <label class="choice"><input type="checkbox" value="identity"><span><strong>Data identitas dikirim</strong><span>Foto identitas atau data pribadi penting</span></span></label>
      </div><p class="selection-summary" id="incident-summary" role="status" aria-live="polite">Semua langkah penting ditampilkan.</p></div></div></section>
      <section class="section-sm" style="padding-top:0"><div class="container detail-layout"><div><span class="eyebrow highlight-pill">Urutan tindakan</span><h2 class="section-title">Lakukan sekarang</h2><div class="emergency-steps" id="emergency-steps">
        <article class="emergency-step" data-for="money otp"><div><h2>Hubungi penyedia pembayaran & Lapor IASC</h2><p>Gunakan nomor darurat call center bank atau aplikasi resmi yang Anda cari sendiri. Segera minta pengamanan akun rekening Anda dan minta bank menindaklanjuti atau menahan transaksi ke rekening penerima jika memungkinkan (tindakan terhadap rekening penerima ditentukan oleh bank dan mekanisme IASC).</p><div class="emergency-bank-hotlines"><span class="hotline-title">${icon("phone")} Hotline Call Center Resmi Bank Nasional (Tarif berlaku sesuai operator):</span><div class="bank-pill-row"><a class="bank-call-pill" href="tel:1500888"><strong>Halo BCA</strong> 1500888</a><a class="bank-call-pill" href="tel:14000"><strong>Mandiri Call</strong> 14000</a><a class="bank-call-pill" href="tel:1500017"><strong>BRI Contact</strong> 1500017</a><a class="bank-call-pill" href="tel:1500046"><strong>BNI Call</strong> 1500046</a><a class="bank-call-pill" href="tel:14040"><strong>BSI Call</strong> 14040</a></div></div></div></article>
        <article class="emergency-step" data-for="otp"><div><h2>Amankan akun</h2><p>Dari perangkat tepercaya: ganti kata sandi atau PIN akun perbankan, keluarkan semua sesi login aktif lainnya di perangkat lain, dan periksa nomor pemulihan akun.</p></div></article>
        <article class="emergency-step" data-for="app"><div><h2>Batasi perangkat</h2><p>Segera putuskan koneksi internet dan aktifkan Mode Pesawat seketika bila ada file aplikasi asing terpasang. Amankan akun perbankan dari ponsel lain yang bersih.</p></div></article>
        <article class="emergency-step" data-for="identity"><div><h2>Catat data yang dibagikan</h2><p>Dokumentasikan data spesifik yang sempat terkirim (misalnya NIK, nomor rekening, foto KTP) untuk mengantisipasi potensi penipuan identitas atau pinjaman online fiktif.</p></div></article>
        <article class="emergency-step" data-for="all"><div><h2>Simpan bukti</h2><p>Simpan waktu transaksi, mutasi bank, nomor rekening tujuan, riwayat percakapan chat, dan tautan (URL). Jangan membagikan dokumen sensitif ke ruang publik.</p></div></article>
        <article class="emergency-step" data-for="all"><div><h2>Gunakan jalur resmi</h2><p>Pilih layanan otoritas sesuai kerugian. Untuk kerugian finansial, segera laporkan ke portal IASC (iasc.ojk.go.id), kontak OJK 157, dan datangi kepolisian terdekat untuk pembuatan Laporan Polisi (LP).</p></div></article>
      </div></div><aside class="side-stack"><div class="side-card urgent-official-card"><h3>${icon("phone")} Panggilan Darurat</h3><div class="quick-call-stack"><a class="quick-call-item urgent-police" href="tel:110"><span class="call-icon">${icon("phone")}</span><div><strong>Polisi Darurat 110</strong><span>Kontak darurat umum kepolisian</span></div></a><a class="quick-call-item urgent-ojk" href="tel:157"><span class="call-icon">${icon("phone")}</span><div><strong>Kontak OJK 157</strong><span>Layanan konsumen OJK & Satgas PASTI</span></div></a></div></div><div class="side-card"><h3>Tautan resmi</h3><a class="source-link" href="https://iasc.ojk.go.id/" target="_blank" rel="noopener noreferrer">${icon("external")}<span>IASC OJK dan Satgas PASTI<br><span class="muted">Koordinasi kerugian transaksi finansial</span></span></a><a class="source-link" href="https://cekrekening.id/" target="_blank" rel="noopener noreferrer">${icon("external")}<span>CekRekening resmi Komdigi<br><span class="muted">Cek dan laporkan rekening</span></span></a><a class="source-link" href="https://aduannomor.id/" target="_blank" rel="noopener noreferrer">${icon("external")}<span>AduanNomor resmi Komdigi<br><span class="muted">Cek dan laporkan nomor</span></span></a><a class="source-link" href="https://aduankonten.id/" target="_blank" rel="noopener noreferrer">${icon("external")}<span>AduanKonten resmi Komdigi<br><span class="muted">Laporkan konten berbahaya</span></span></a></div><details class="side-card side-disclosure"><summary>Batas layanan ${icon("arrow")}</summary><div class="side-disclosure-body"><p>WargaSiaga tidak membekukan transaksi, memulihkan dana, atau membuat laporan resmi. Hasil penanganan tidak dapat dijamin.</p></div></details></aside></div></section>
      <section class="section-sm" style="padding-top:0"><div class="container"><div class="call-script-card"><div class="call-script-header"><span class="eyebrow highlight-pill">${icon("chat")} Rekomendasi Narasi Telepon</span><h2>Apa yang Harus Dikatakan Saat Menghubungi Call Center Bank?</h2><p>Banyak korban merasa cemas saat tersambung dengan petugas call center. Gunakan panduan kalimat terstruktur di bawah ini agar petugas bank dapat segera memproses pengamanan rekening Anda.</p></div><div class="script-quote-box"><div class="script-quote-label">${icon("phone")} Naskah Percakapan Siap Baca:</div><blockquote id="call-script-text">“Selamat siang Petugas, saya nasabah yang baru saja mengalami transaksi penipuan perbankan. Saya memohon bantuan pengamanan darurat pada akun rekening saya dan bantuan penahanan transaksi ke nomor rekening tujuan jika masih memungkinkan. Saya memegang bukti mutasi transfer lengkap dan siap melengkapi aduan ke portal resmi IASC serta kepolisian.”</blockquote><div class="script-actions"><button class="btn btn-secondary btn-sm" type="button" id="btn-copy-call-script">${icon("copy")} Salin Naskah Bicara</button></div></div></div></div></section>
      <section class="section-sm" style="padding-top:0"><div class="container"><div class="official-draft-card"><div class="draft-card-header"><span class="eyebrow highlight-pill teal">${icon("file")} Generator Draf Laporan</span><h2>Buat Draf Kronologi Aduan Mandiri</h2><p>Lengkapi formulir ringkas berikut. Sistem otomatis merangkai format email aduan dan catatan kronologi terstruktur untuk mempermudah pelaporan Anda ke otoritas resmi.</p></div><div class="privacy-box" style="margin-bottom:16px;background:#f0f7fb;border-color:#b8d9ea"><strong>Alat Bantu Penyusunan Kronologi:</strong> Draf ini disusun sebagai catatan mandiri untuk mempermudah Anda menjelaskan kejadian kepada petugas bank, mengisi formulir IASC, atau membuat Laporan Polisi (LP) di kantor polisi. Format ini bukan merupakan formulir resmi pengganti lembaga negara.</div><div class="draft-form-grid"><div class="field"><label for="draft-reporter-name">Nama Pelapor (Opsional)</label><input type="text" id="draft-reporter-name" placeholder="Contoh: Budi Santoso" value=""></div><div class="field"><label for="draft-suspect-bank">Bank dan Nomor Rekening Pelaku</label><input type="text" id="draft-suspect-bank" placeholder="Contoh: BCA 1234567890 an Tersangka" value=""></div><div class="field"><label for="draft-suspect-amount">Perkiraan Nominal Kerugian</label><input type="text" id="draft-suspect-amount" placeholder="Contoh: Rp 2.500.000" value=""></div><div class="field"><label for="draft-suspect-contact">Nomor WhatsApp atau Kontak Pelaku</label><input type="text" id="draft-suspect-contact" placeholder="Contoh: 081234567890" value=""></div><div class="field field-full"><label for="draft-chronology">Ringkasan Kronologi Singkat Kejadian</label><textarea id="draft-chronology" rows="3" placeholder="Ceritakan singkat peristiwa: misalnya menerima pesan undangan APK lalu saldo tabungan terpotong..."></textarea></div></div><div class="draft-preview-wrap"><div class="draft-preview-label"><span>${icon("scanText")} <strong>Pratinjau Draf Catatan Aduan</strong></span></div><pre class="draft-preview-box" id="draft-preview-text"></pre></div><div class="draft-action-buttons"><a class="btn btn-primary" id="btn-email-ojk" href="#" target="_blank" rel="noopener noreferrer">${icon("external")} Buka Email Konsumen OJK (konsumen@ojk.go.id)</a><a class="btn btn-secondary" id="btn-email-polri" href="#" target="_blank" rel="noopener noreferrer">${icon("external")} Buka Email Patroli Siber Polri</a><a class="btn btn-secondary" id="btn-wa-ojk" href="#" target="_blank" rel="noopener noreferrer">${icon("chat")} Kirim WhatsApp ke OJK 157</a><button class="btn btn-secondary" id="btn-copy-draft" type="button">${icon("copy")} Salin Draf Laporan</button></div></div></div></section>
      <section class="section-sm no-print"><div class="container"><div class="cta-band"><div class="cta-band-grid"><div><h2>Simpan urutan langkah ini</h2><p>Cetak atau simpan halaman tanpa perlu membuat akun.</p></div><button class="btn btn-secondary" type="button" id="print-page">${icon("file")} Cetak panduan</button></div></div></div></section>`);
  }

  function supportPage() {
    const familyImageUrl = GUIDE_IMAGE_URLS["family-emergency"] || "";
    return shell(`
      <section class="page-hero compact-hero"><div class="container page-hero-row"><div>${crumb([["Bantu orang lain"]])}<span class="eyebrow highlight-pill">${icon("users")} Dukungan tanpa menghakimi</span><h1 class="section-title">Bantu orang terdekat tetap aman</h1><p class="section-copy">Mulai dari rasa khawatir, lalu periksa bersama. Jangan menyalahkan atau memaksa.</p></div><div class="page-hero-visual ratio-3-2"><img src="${familyImageUrl}" width="1280" height="853" alt="Dua orang berdiskusi tenang memeriksa pesan mencurigakan" loading="lazy"><a class="urgent-shortcut" href="${toCleanUrl("bantuan-darurat.html")}">${icon("alert")}<span><strong>Uang sudah terkirim?</strong><small>Buka bantuan sekarang</small></span>${icon("arrow")}</a></div></div></section>
      <section class="section-sm"><div class="narrow"><div class="support-callout"><span class="support-callout-icon">${icon("chat")}</span><div><span class="eyebrow highlight-pill">Kalimat pembuka</span><blockquote>“Saya khawatir karena ada permintaan uang mendadak. Boleh kita periksa bersama sebelum melanjutkan?”</blockquote></div></div></div></section>
      <section class="section-sm" style="padding-top:0"><div class="container"><span class="eyebrow highlight-pill teal">Tiga langkah</span><h2 class="section-title">Dampingi, periksa, lalu bertindak</h2><div class="steps support-steps"><article class="step"><span class="step-num">1</span><h3>Dengarkan dulu</h3><p>Tanyakan apa yang terjadi dan apa yang sudah dilakukan. Hindari kalimat “kok bisa percaya?”.</p></article><article class="step"><span class="step-num">2</span><h3>Periksa bersama</h3><p>Hentikan pembayaran. Hubungi orang atau lembaga melalui nomor resmi yang dicari sendiri.</p></article><article class="step"><span class="step-num">3</span><h3>Amankan bila perlu</h3><p>Jika uang, OTP, kata sandi, atau akses sudah diberikan, buka langkah bantuan tanpa menunggu analisis AI.</p></article></div></div></section>
      <section class="section-sm surface-section"><div class="container support-grid"><div class="support-list"><span class="support-list-icon positive">${icon("check")}</span><div><h2>Yang membantu</h2><ul><li>Tetap tenang dan jaga privasi orang tersebut.</li><li>Simpan bukti tanpa meneruskannya ke grup publik.</li><li>Tawarkan bantuan menghubungi bank atau layanan resmi.</li></ul></div></div><div class="support-list"><span class="support-list-icon caution">${icon("close")}</span><div><h2>Yang sebaiknya dihindari</h2><ul><li>Menyalahkan, mempermalukan, atau mengambil alih paksa.</li><li>Menghubungi balik pelaku untuk berdebat.</li><li>Membayar pihak yang menjanjikan dana pasti kembali.</li></ul></div></div></div></section>
      <section class="section-sm"><div class="container"><div class="cta-band"><div class="cta-band-grid"><div><h2>Periksa situasinya bersama</h2><p>Gunakan AI untuk mengenali tanda, atau buka katalog panduan tanpa membagikan identitas.</p></div><div class="inline"><a class="btn btn-secondary" href="${toCleanUrl("konsultasi.html")}">Periksa dengan AI</a><a class="btn btn-secondary" href="${toCleanUrl("modus.html?context=Keluarga")}">Buka panduan keluarga</a></div></div></div></div></section>`);
  }

  function reportsPage() {
    return shell(`
      <section class="page-hero compact-hero"><div class="container page-hero-row"><div>${crumb([["Lapor Warga"]])}<span class="eyebrow highlight-pill teal">Pola Komunitas</span><h1 class="section-title">Pola yang <span class="text-gradient">Dilaporkan Warga</span></h1><p class="section-copy">Kumpulan pola modus yang dibagikan oleh warga untuk pembelajaran bersama. Seluruh laporan disaring untuk privasi sebelum diterbitkan sebagai referensi edukasi.</p><div class="hero-actions"><a class="btn btn-primary" href="${toCleanUrl("lapor.html")}">${icon("file")} Buat Laporan Warga</a><a class="btn btn-secondary" href="${toCleanUrl("status-laporan.html")}">Pantau Status Laporan</a></div></div><div class="page-hero-visual"><img src="${communityUrl}" width="1280" height="853" alt="" aria-hidden="true" loading="lazy"><a class="urgent-shortcut" href="${toCleanUrl("bantuan-darurat.html")}">${icon("alert")}<span><strong>Kehilangan uang?</strong><small>Hubungi penyedia lebih dahulu</small></span>${icon("arrow")}</a></div></div></section>
      <section class="section-sm" style="padding-bottom:0"><div class="container">
        <div class="report-stats-grid">
          <div class="report-stat-card"><span class="report-stat-val">Pilot Warga</span><span class="report-stat-label">Partisipasi Laporan Komunitas</span></div>
          <div class="report-stat-card"><span class="report-stat-val">Penapisan Privasi</span><span class="report-stat-label">Data Sensitif Otomatis Disaring</span></div>
          <div class="report-stat-card"><span class="report-stat-val">Edukasi Mandiri</span><span class="report-stat-label">Pola Belum Terbukti Sebagai Fakta Hukum</span></div>
          <div class="report-stat-card"><span class="report-stat-val">Rujukan Resmi</span><span class="report-stat-label">Koordinasi IASC, CekRekening, & AduanNomor</span></div>
        </div>
        <div class="section-heading-row">
          <div><span class="eyebrow highlight-pill">${icon("sparkles")} Pantauan Pola Edukasi</span><h2 class="section-title">Pola Modus yang Sering Dilaporkan</h2></div>
          <span class="status-badge status-review">Pola Komunitas</span>
        </div>
        <div class="trending-modus-grid">
          <a class="trending-modus-card" href="${toCleanUrl("modus-detail.html?id=apk-phishing")}">
            <div class="trending-modus-top"><span class="trending-rank">Pola Sering Dilaporkan</span><span class="trending-badge">File Berbahaya (.APK)</span></div>
            <h3>Penyebaran File APK Surat Undangan & Pajak Palsu</h3>
            <p>Modus mengirimkan file APK melalui pesan instan WhatsApp dengan dalih dokumen penting atau tagihan listrik.</p>
            <span class="trending-modus-link">Buka panduan pencegahan ${icon("arrow")}</span>
          </a>
          <a class="trending-modus-card" href="${toCleanUrl("modus-detail.html?id=marketplace-diversion")}">
            <div class="trending-modus-top"><span class="trending-rank">Pola Transaksi</span><span class="trending-badge">Pengalihan Chat</span></div>
            <h3>Pengalihan Transaksi ke Luar Aplikasi Marketplace</h3>
            <p>Calon pembeli atau penjual mengajak transaksi via chat pribadi dengan tautan pembayaran rekayasa.</p>
            <span class="trending-modus-link">Buka panduan pencegahan ${icon("arrow")}</span>
          </a>
          <a class="trending-modus-card" href="${toCleanUrl("modus-detail.html?id=job-deposit")}">
            <div class="trending-modus-top"><span class="trending-rank">Pola Penawaran</span><span class="trending-badge">Kerja Deposit</span></div>
            <h3>Tawaran Freelance Like Video dengan Deposit Saldo</h3>
            <p>Iming-iming gaji harian tinggi dari tugas sederhana, namun diwajibkan menyetor uang jaminan berjenjang.</p>
            <span class="trending-modus-link">Buka panduan pencegahan ${icon("arrow")}</span>
          </a>
          <a class="trending-modus-card" href="${toCleanUrl("modus-detail.html?id=recovery-scam")}">
            <div class="trending-modus-top"><span class="trending-rank">Pola Modus Lanjutan</span><span class="trending-badge">Janji Pemulihan Dana</span></div>
            <h3>Janji Jasa Pemulihan Uang Hilang (Recovery Scam)</h3>
            <p>Pihak mengatasnamakan pakar keamanan atau pengacara menjanjikan dana penipuan kembali dengan imbalan awal.</p>
            <span class="trending-modus-link">Buka panduan pencegahan ${icon("arrow")}</span>
          </a>
        </div>
      </div></section>
      <section class="section"><div class="container"><div class="section-heading-row"><div><span class="eyebrow highlight-pill">Laporan Terkini</span><h2 class="section-title">Pola Terbaru</h2></div><span class="status-badge status-public">Belum terverifikasi</span></div>
      <div class="category-classification" style="margin-bottom:20px" role="region" aria-label="Filter kategori laporan warga">
        <div class="category-chip-group" id="report-category-group" role="tablist" aria-label="Pilih kategori laporan">
          ${MODUS_CATEGORIES.map((cat, idx) => `
            <button class="category-tab${idx === 0 ? " active" : ""}" type="button" role="tab" data-report-category-id="${cat.id}">
              ${icon(cat.icon)} <span>${cat.label}</span>
            </button>
          `).join("")}
        </div>
      </div>
      <div class="report-grid">${DATA.reports.map(r=>{
        const cat = MODUS_CATEGORIES.find(c => c.cardIds?.includes(r.related)) || MODUS_CATEGORIES[1];
        return `<article class="report-card" data-report-cat="${cat.id}"><div class="report-meta"><span>${icon("chat")} ${r.channel}</span><span>${icon("clock")} ${r.period}</span><span class="card-category-pill" style="margin-left:auto">${icon(cat.icon)} ${cat.label}</span></div><h3>${r.title}</h3><p>${r.summary}</p><div class="card-footer">${arrowLink("Buka modus",`modus-detail.html?id=${r.related}`)}</div></article>`;
      }).join("")}</div></div></section>
      <section class="section-sm surface-section"><div class="narrow"><details class="content-disclosure"><summary><span>${icon("info")} Cara membaca status laporan</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content status-explainer"><div><span class="status-badge status-review">Ditinjau</span><p>Masih privat.</p></div><div><span class="status-badge status-public">Dilaporkan warga</span><p>Sudah disamarkan, belum terbukti.</p></div><div><span class="status-badge status-official">Peringatan resmi</span><p>Memiliki sumber otoritas.</p></div></div></details><p class="demo-note">${icon("shieldCheck")} Transparansi Komunitas: Seluruh pola yang ditampilkan merupakan laporan awal warga untuk tujuan edukasi. WargaSiaga bukan lembaga penegak hukum dan tidak menyatakan kebenaran materiil suatu laporan tanpa penetapan otoritas berwenang.</p></div></section>`);
  }

  function reportFormPage() {
    return shell(`
      <section class="page-hero compact-hero"><div class="container">${crumb([["Lapor Warga","laporan.html"],["Formulir Laporan"]])}<span class="eyebrow highlight-pill teal">Perlindungan Warga</span><h1 class="section-title"><span class="text-gradient">Laporkan Modus Mencurigakan</span></h1><p class="section-copy">Bantu warga lain mengenali modus baru dengan membagikan alur kejadian tanpa data pribadi.</p></div></section>
      <section class="section-sm"><div class="container form-layout"><div class="form-card">
        <div class="prefill-notice highlight-pill teal hidden" id="prefill-notice"></div>
        <div class="report-consult-hint">
          <div class="report-consult-hint-content">
            <span class="highlight-pill teal">${icon("bot")} Belum Yakin Ini Penipuan?</span>
            <span>Ragu apakah kejadian yang dialami termasuk tindak kejahatan digital? Anda dapat berkonsultasi terlebih dahulu dengan asisten AI kami sebelum mengirimkan laporan komunitas.</span>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-report-to-consult" type="button">${icon("sparkles")} Konsultasikan dengan AI Dulu</button>
        </div>
        <div class="progress" role="list" aria-label="Tahapan laporan warga"><div class="progress-step active" data-progress="1" role="listitem" aria-current="step"><span class="progress-num">1</span><span>Ceritakan</span></div><div class="progress-step" data-progress="2" role="listitem"><span class="progress-num">2</span><span>Periksa data</span></div><div class="progress-step" data-progress="3" role="listitem"><span class="progress-num">3</span><span>Konfirmasi</span></div></div>
        <form id="report-form" novalidate><section data-step="1"><h2 tabindex="-1">Apa yang terjadi?</h2><p>Jangan tulis nama lengkap, nomor telepon/rekening penuh, NIK, alamat, OTP, PIN, atau kata sandi.</p><div class="form-error hidden" id="report-error" role="alert" tabindex="-1"></div>
          <div class="field"><label for="report-channel">Cara dihubungi</label><select id="report-channel" required aria-describedby="report-error"><option value="">Pilih kanal</option><option>WhatsApp</option><option>Telepon</option><option>SMS</option><option>Email</option><option>Telegram</option><option>Media sosial</option><option>Marketplace</option><option>Lainnya</option></select></div>
          <div class="field"><label for="report-period">Kapan terjadi?</label><select id="report-period" required aria-describedby="report-error"><option value="">Pilih rentang</option><option>7 hari terakhir</option><option>30 hari terakhir</option><option>2 sampai 3 bulan lalu</option><option>Lebih lama</option></select></div>
          <div class="field"><label for="report-type">Pola yang paling dekat</label><select id="report-type" required aria-describedby="report-error"><option value="">Pilih pola modus</option>${MODUS_CATEGORIES.filter(cat => cat.id !== "all").map(cat => `
            <optgroup label="${cat.label} (${cat.desc})">
              ${(cat.cardIds || []).map(cid => {
                const c = DATA.cards.find(card => card.id === cid);
                return c ? `<option value="${c.id}">${c.title}</option>` : "";
              }).join("")}
            </optgroup>
          `).join("")}<option value="other">Lainnya — tulis sendiri</option></select></div>
          <div class="field conditional-field hidden" id="report-type-other-wrap"><label for="report-type-other">Tulis pola lainnya</label><input id="report-type-other" type="text" maxlength="120" aria-describedby="report-error report-type-other-help" placeholder="Contoh: penipuan tiket konser"><span class="field-help" id="report-type-other-help">Tulis jenis polanya saja. Jangan masukkan nama, nomor, link, atau data pribadi.</span></div>
          <div class="field"><label for="report-story">Cerita singkat</label><textarea id="report-story" maxlength="1200" required aria-describedby="report-error" placeholder="Contoh: Saya dihubungi akun yang mengaku perekrut dan diminta membayar deposit…"></textarea><div class="spread"><span class="field-help">Sebutkan pola dan tindakan yang diminta, bukan identitas.</span><span class="char-count"><span id="report-count">0</span>/1200</span></div></div>
          <div class="evidence-box">
            <div class="evidence-header">
              <span class="highlight-pill teal">${icon("scanSearch")} Bukti Pendukung Terduga (Opsional untuk AI)</span>
              <p>Data berikut membantu pipeline AI melakukan validasi otomatis. Privasi disamarkan otomatis di perangkat Anda.</p>
            </div>
            <div class="evidence-grid">
              <div class="field">
                <label for="report-evidence-phone">Nomor Telepon / WhatsApp Terduga</label>
                <input id="report-evidence-phone" type="text" placeholder="Contoh: 081234567890" maxlength="30">
              </div>
              <div class="field">
                <label for="report-evidence-bank">Nomor Rekening & Nama Bank Terduga</label>
                <input id="report-evidence-bank" type="text" placeholder="Contoh: BCA 1234567890 an Fulan" maxlength="50">
              </div>
              <div class="field">
                <label for="report-evidence-contact">Email atau Akun Media Sosial</label>
                <input id="report-evidence-contact" type="text" placeholder="Contoh: kontak@toko-palsu.com" maxlength="60">
              </div>
              <div class="field">
                <label for="report-evidence-url">Tautan atau Website Terduga</label>
                <input id="report-evidence-url" type="text" placeholder="Contoh: https://undangan-nikah.apk" maxlength="200">
              </div>
            </div>
            <div class="field" style="margin-top:12px">
              <label for="report-evidence-file">Lampirkan Foto / Tangkapan Layar Bukti</label>
              <div class="evidence-dropzone" id="report-dropzone">
                <input id="report-evidence-file" type="file" accept="image/png,image/jpeg,image/webp">
                <span class="dropzone-text">${icon("image")} Pilih atau seret tangkapan layar bukti (diproses lokal untuk verifikasi AI)</span>
              </div>
              <div class="evidence-file-preview hidden" id="report-file-preview">
                <span class="file-name" id="report-file-name"></span>
                <button class="btn btn-secondary btn-sm" id="report-file-remove" type="button">${icon("trash")} Hapus</button>
              </div>
            </div>
          </div>
          <div class="form-actions"><a class="btn btn-secondary" href="${toCleanUrl("laporan.html")}">Batal</a><button class="btn btn-primary" type="button" data-next="2">Lanjutkan Laporan ${icon("arrow")}</button></div></section>
          <section class="hidden" data-step="2"><h2 tabindex="-1">Periksa data yang disamarkan</h2><p>Sistem otomatis menyamarkan nomor telepon, pola angka, kode OTP, alamat email, dan link agar privasi Anda terjaga seutuhnya.</p><div class="preview-box"><div class="tag-row"><span class="tag" id="preview-channel"></span><span class="tag" id="preview-period"></span><span class="tag" id="preview-type"></span></div><p id="preview-story"></p></div><div class="preview-evidence-box"><h3>${icon("shieldCheck")} Bukti Pendukung Terlindungi</h3><div class="preview-evidence-list" id="preview-evidence-list"></div></div><div class="privacy-box" style="margin-top:16px"><strong>Pemeriksaan ganda demi privasi Anda</strong>Pastikan tidak ada nama lengkap atau informasi rahasia sebelum melanjutkan laporan.</div><div class="form-actions"><button class="btn btn-secondary" type="button" data-back="1">Kembali</button><button class="btn btn-primary" type="button" data-next="3">Lanjut ke konfirmasi ${icon("arrow")}</button></div></section>
          <section class="hidden" data-step="3"><h2 tabindex="-1">Konfirmasi Pengiriman Laporan</h2><p>Laporan Anda akan dianalisis secara otomatis oleh pipeline AI WargaSiaga dan dimoderasi demi privasi.</p><label class="consent-line"><input type="checkbox" id="report-consent"><span>Saya menyatakan bahwa informasi ini dibagikan untuk edukasi bersama dan tidak mengandung data sensitif pribadi.</span></label><div class="form-actions"><button class="btn btn-secondary" type="button" data-back="2">Kembali</button><button class="btn btn-primary" id="submit-demo" type="submit" disabled>Kirimkan Laporan ${icon("arrow")}</button></div></section>
        </form><div class="hidden" id="report-success" role="status" tabindex="-1"><div class="empty-state"><span class="empty-icon">${icon("check")}</span><h2>Laporan berhasil dikirim</h2><p>Terima kasih telah berkontribusi melindungi sesama warga. Catat kode pelacakan Anda: <strong id="report-success-code">WS-DEMO-2401</strong></p><div class="inline" style="justify-content:center;margin-top:18px"><a class="btn btn-primary" id="report-success-status-link" href="${toCleanUrl("status-laporan.html?code=WS-DEMO-2401")}">Pantau status laporan</a><a class="btn btn-secondary" href="${toCleanUrl("laporan.html")}">Kembali ke laporan warga</a></div></div></div></div>
        <aside class="side-stack"><div class="side-card"><h3>Jangan masukkan</h3><p>OTP, PIN, kata sandi, NIK lengkap, nomor kartu/rekening penuh, alamat rumah, nama korban, atau foto identitas.</p></div><div class="side-card"><h3>Bukan kanal darurat</h3><p>WargaSiaga adalah sarana edukasi komunitas. Jika Anda membutuhkan penyelidikan kepolisian atau pemblokiran perbankan, segera hubungi lembaga resmi terkait.</p><a class="text-link" href="${toCleanUrl("bantuan-darurat.html")}">Butuh bantuan darurat sekarang ${icon("arrow")}</a></div></aside></div></section>`);
  }

  function statusPage() {
    return shell(`
      <section class="page-hero compact-hero"><div class="container">${crumb([["Lapor Warga","laporan.html"],["Status Laporan"]])}<span class="eyebrow highlight-pill teal">Pusat Transparansi</span><h1 class="section-title"><span class="text-gradient">Pantau Status Laporan</span></h1><p class="section-copy">Gunakan kode laporan Anda, contoh: <strong>WS-DEMO-2401</strong>.</p></div></section>
      <section class="section"><div class="narrow"><div class="form-card"><form id="status-form" novalidate><div class="form-error hidden" id="status-error" role="alert" tabindex="-1"></div><div class="field"><label for="status-code">Nomor Tiket Laporan</label><input id="status-code" type="text" placeholder="WS-DEMO-2401" autocomplete="off" required aria-describedby="status-error"></div><div class="form-actions"><button class="btn btn-primary" type="submit">Cek status</button></div></form><div class="hidden" id="status-result" role="status" tabindex="-1"><div class="spread"><div><span class="status-badge status-review" id="status-badge-val">Sedang ditinjau</span><h2 style="margin:12px 0 4px" id="status-title-val">Laporan WS-DEMO-2401</h2><p class="muted" style="margin:0" id="status-sub-val">Tahap peninjauan komunitas dan validasi awal</p></div><button class="btn btn-secondary btn-sm" id="status-refresh-btn" type="button" title="Perbarui status dari sistem">${icon("refresh")} Perbarui Status</button></div><div class="status-ai-assessment-card" id="status-ai-card"><div class="status-ai-header"><div class="status-ai-badge">${icon("sparkles")} Hasil Penapisan Awal Sistem</div><span class="status-ai-score" id="status-score-val">Status: Ditandai Sistem untuk Peninjauan</span></div><p id="status-summary-val">Laporan warga telah diproses melalui penapisan data sensitif dan pemetaan indikator awal untuk ditinjau oleh moderator komunitas.</p><div class="status-findings-grid" id="status-findings-list"><div class="finding-item"><span class="finding-badge">${icon("check")} Rekening Bank</span><span>Format nomor rekening terdeteksi, siap dipadankan dengan portal resmi CekRekening.id.</span></div><div class="finding-item"><span class="finding-badge">${icon("check")} Kontak Seluler</span><span>Nomor kontak aktif dicatat untuk pemadanan dengan AduanNomor resmi.</span></div></div></div><div class="status-timeline"><div class="timeline-row"><span class="timeline-dot">${icon("check")}</span><div><h3>Laporan Diterima</h3><p>Data privat disaring secara lokal sebelum diteruskan ke sistem moderasi.</p></div></div><div class="timeline-row"><span class="timeline-dot">2</span><div><h3>Penapisan & Moderasi</h3><p>Pemeriksaan data sensitif untuk memastikan tidak ada informasi rahasia atau identitas pribadi korban.</p></div></div><div class="timeline-row"><span class="timeline-dot pending">3</span><div><h3>Keputusan Publikasi</h3><p>Pola diterbitkan sebagai referensi edukasi komunitas belum terbukti secara hukum.</p></div></div></div><div class="privacy-box"><strong>Status Transparansi Edukasi:</strong> Laporan komunitas adalah sarana berbagi pola kewaspadaan antarwarga. Bukan merupakan putusan hukum atau konfirmasi resmi lembaga penegak hukum.</div></div><div class="empty-state hidden" id="status-empty" role="status" tabindex="-1"><span class="empty-icon">${icon("search")}</span><h2>Nomor laporan tidak ditemukan</h2><p>Periksa kembali nomor laporan Anda atau coba masukkan kode contoh WS-DEMO-2401.</p></div></div></div></section>`);
  }

  function aboutPage() {
    return shell(`
      <section class="page-hero compact-hero"><div class="container">${crumb([["Tentang"]])}<span class="eyebrow highlight-pill">Inisiatif Keamanan Warga</span><div class="about-brand-header" style="display:flex;align-items:center;gap:18px;margin:12px 0 16px;flex-wrap:wrap"><img src="${toCleanUrl("assets/icons/wargasiaga-logo.png")}" alt="WargaSiaga" class="about-hero-logo" style="height:44px;width:auto;display:block" width="142" height="44" /><span class="status-badge status-review">Inisiatif Independen · Rujukan Layanan Resmi</span></div><h1 class="section-title"><span class="text-gradient">Tentang WargaSiaga</span></h1><p class="section-copy">Platform independen untuk mengenali pola kejahatan siber dan menemukan langkah penanganan resmi terpercaya.</p><nav class="section-tabs" aria-label="Isi halaman"><a href="#layanan-resmi">Layanan resmi</a><a href="#batasan">Batasan</a><a href="#sumber">Sumber</a><a href="#privasi">Privasi</a></nav></div></section>
      <section class="section-sm"><div class="container"><h2 class="sr-only">Prinsip WargaSiaga</h2><div class="principle-grid compact-principles"><div class="principle"><span class="principle-icon">${icon("shield")}</span><h3>Utamakan keselamatan</h3><p>Jalur darurat selalu tersedia.</p></div><div class="principle"><span class="principle-icon">${icon("book")}</span><h3>Gunakan sumber</h3><p>Rujukan dan tanggal tinjau dicatat.</p></div><div class="principle"><span class="principle-icon">${icon("users")}</span><h3>Tanpa menyalahkan</h3><p>Fokus pada langkah berikutnya.</p></div></div></div></section>
      <section class="section surface-section" id="layanan-resmi"><div class="container"><span class="eyebrow highlight-pill teal">Rujukan langsung</span><h2 class="section-title">Layanan resmi</h2><div class="service-grid"><a class="service-card" href="https://iasc.ojk.go.id/" target="_blank" rel="noopener noreferrer"><span class="service-icon">${icon("external")}</span><strong>IASC</strong><small>Kerugian transaksi</small></a><a class="service-card" href="https://cekrekening.id/" target="_blank" rel="noopener noreferrer"><span class="service-icon">${icon("external")}</span><strong>CekRekening</strong><small>Rekening dan dompet digital</small></a><a class="service-card" href="https://aduannomor.id/" target="_blank" rel="noopener noreferrer"><span class="service-icon">${icon("external")}</span><strong>AduanNomor</strong><small>Nomor mencurigakan</small></a><a class="service-card" href="https://aduankonten.id/" target="_blank" rel="noopener noreferrer"><span class="service-icon">${icon("external")}</span><strong>AduanKonten</strong><small>Konten berbahaya</small></a></div><p class="section-note">Tujuan eksternal · fungsi dan hasil ditentukan masing-masing lembaga.</p></div></section>
      <section class="section-sm"><div class="narrow disclosure-stack">
        <details class="content-disclosure" id="batasan"><summary><span>${icon("circleHelp")} Batasan WargaSiaga</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content"><ul><li>Tidak menyatakan sesuatu 100% aman atau pasti penipuan.</li><li>Tidak berafiliasi dengan pemerintah, bank, operator, atau platform.</li><li>Tidak membekukan transaksi, memulihkan dana, atau membuat laporan resmi.</li><li>Tidak mempublikasikan laporan mentah atau identitas korban.</li></ul></div></details>
        <details class="content-disclosure" id="sumber"><summary><span>${icon("book")} Sumber utama</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content source-list"><a href="https://www.undp.org/policy-centre/singapore/publications/anti-scam-handbook" target="_blank" rel="noopener noreferrer">UNDP Anti-Scam Handbook ${icon("external")}</a><a href="https://www.scamwatch.gov.au/" target="_blank" rel="noopener noreferrer">Scamwatch ${icon("external")}</a><a href="https://iasc.ojk.go.id/" target="_blank" rel="noopener noreferrer">IASC ${icon("external")}</a><a href="https://jdih.komdigi.go.id/" target="_blank" rel="noopener noreferrer">Komdigi ${icon("external")}</a><p>Terakhir diperiksa 3 Oktober 2026.</p></div></details>
        <details class="content-disclosure" id="privasi"><summary><span>${icon("lock")} Privasi & batasan layanan</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content"><h3>Privasi & Batasan Layanan</h3><p>Konsultasi AI memerlukan persetujuan eksplisit. Teks diproses melalui server WargaSiaga untuk penyaringan otomatis data sensitif (nomor telepon, nomor rekening, NIK) sebelum diteruskan ke model AI. Percakapan tidak disimpan oleh WargaSiaga. WargaSiaga adalah sarana edukasi awal, bukan lembaga investigasi atau aparat penegak hukum.</p><h3 id="aksesibilitas">Aksesibilitas</h3><p>Navigasi keyboard, indikator fokus tampak jelas, target sentuh minimal 44px, struktur judul semantik, kontras tinggi, dan dukungan pengurangan animasi telah diterapkan sesuai standar WCAG 2.1 AA.</p></div></details>
      </div></section>`);
  }

  const pages = { home:homePage, modus:modusPage, detail:detailPage, consult:consultPage, urgent:urgentPage, support:supportPage, reports:reportsPage, "report-form":reportFormPage, "report-status":statusPage, about:aboutPage };
  root.innerHTML = (pages[page] || homePage)();

  function toast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message; el.classList.add("show");
    clearTimeout(window.__wsToast); window.__wsToast = setTimeout(()=>el.classList.remove("show"), 2800);
  }

  function showFormError(element, message, fields=[]) {
    if (!element) return;
    element.textContent = message;
    element.classList.remove("hidden");
    fields.forEach(field=>{
      field.setAttribute("aria-invalid","true");
      if (fieldIsMissing(field)) showRequiredQuestion(field);
    });
    element.focus({preventScroll:true});
    element.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
  }

  function clearFormError(element, fields=[]) {
    if (!element) return;
    element.textContent = "";
    element.classList.add("hidden");
    fields.forEach(field=>{
      if (!fieldIsMissing(field)) {
        field.removeAttribute("aria-invalid");
        clearRequiredQuestion(field);
      }
    });
  }

  function fieldIsMissing(field) {
    if (!field?.required) return false;
    if (field.type === "radio") return ![...(field.form?.elements || [])].some(item=>item.name===field.name&&item.checked);
    if (field.type === "checkbox") return !field.checked;
    return !String(field.value || "").trim();
  }

  function requiredErrorHost(field) {
    return field.type === "radio" ? field.closest("fieldset") : field.closest(".field, .hero-ask, .consult-step");
  }

  function requiredErrorId(field) {
    return `${field.name || field.id || "question"}-required-error`;
  }

  function showRequiredQuestion(field) {
    const host=requiredErrorHost(field); if(!host)return;
    const id=requiredErrorId(field);
    if(!document.getElementById(id)) host.insertAdjacentHTML("beforeend",`<p class="question-required-error" id="${escapeHtml(id)}">pertanyaan ini perlu dijawab</p>`);
    const describedBy=new Set((field.getAttribute("aria-describedby")||"").split(/\s+/).filter(Boolean));
    describedBy.add(id); field.setAttribute("aria-describedby",[...describedBy].join(" "));
  }

  function clearRequiredQuestion(field) {
    const id=requiredErrorId(field); document.getElementById(id)?.remove();
    const describedBy=(field.getAttribute("aria-describedby")||"").split(/\s+/).filter(value=>value&&value!==id);
    if(describedBy.length)field.setAttribute("aria-describedby",describedBy.join(" "));else field.removeAttribute("aria-describedby");
  }

  function initHomeAsk() {
    const form=document.getElementById("home-ask-form");
    if(!form)return;
    const input=document.getElementById("home-ask");
    const error=document.getElementById("home-ask-error");
    input.addEventListener("input",()=>clearFormError(error,[input]));
    form.addEventListener("submit",event=>{
      event.preventDefault();
      const question=input.value.trim();
      if(!question){showFormError(error,"Tulis situasi singkat yang ingin diperiksa.",[input]);return;}
      clearFormError(error,[input]);
      try{sessionStorage.setItem("ws-home-question",question);}catch(_){showFormError(error,"Browser tidak dapat memindahkan pertanyaan. Buka halaman Tanya dan tempel teks secara manual.",[input]);return;}
      location.assign(toCleanUrl("konsultasi.html"));
    });
  }

  function initShell() {
    const menu = document.getElementById("mobile-menu");
    const toggle = document.getElementById("menu-toggle");
    function setMenu(open, returnFocus=false) {
      if (!menu || !toggle) return;
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
      toggle.innerHTML = icon(open ? "close" : "menu");
      if (returnFocus) toggle.focus();
    }
    toggle?.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    menu?.addEventListener("click", event=>{if(event.target.closest("a"))setMenu(false);});
    document.addEventListener("keydown", event=>{if(event.key==="Escape"&&menu?.classList.contains("open"))setMenu(false,true);});
    document.addEventListener("click", event=>{if(menu?.classList.contains("open")&&!event.target.closest(".site-header"))setMenu(false);});
    const contrast = document.getElementById("contrast-toggle");
    let saved = false;
    try { saved = localStorage.getItem("ws-contrast") === "high"; } catch (_) {}
    document.body.classList.toggle("high-contrast", saved);
    contrast?.setAttribute("aria-pressed", String(saved));
    contrast?.setAttribute("aria-label", saved ? "Nonaktifkan kontras tinggi" : "Aktifkan kontras tinggi");
    contrast?.setAttribute("title", saved ? "Nonaktifkan kontras tinggi" : "Aktifkan kontras tinggi");
    contrast?.addEventListener("click", () => { const active = document.body.classList.toggle("high-contrast"); try { localStorage.setItem("ws-contrast", active ? "high" : "normal"); } catch (_) {} contrast.setAttribute("aria-pressed", String(active)); contrast.setAttribute("aria-label",active?"Nonaktifkan kontras tinggi":"Aktifkan kontras tinggi");contrast.setAttribute("title",active?"Nonaktifkan kontras tinggi":"Aktifkan kontras tinggi");toast(active ? "Kontras tinggi aktif" : "Kontras standar aktif"); });
  }

  function initFilters() {
    const grid = document.getElementById("modus-grid"); if (!grid) return;
    const search = document.getElementById("modus-search");
    const checks = [...document.querySelectorAll("#filter-panel input[type=checkbox]")];
    const ageChoices = [...document.querySelectorAll('#age-selector input[name="age"]')];
    const catTabs = [...document.querySelectorAll(".category-tab")];
    const count = document.getElementById("result-count");
    const clear = document.getElementById("search-clear");
    const activeFilters = document.getElementById("active-filters");
    const params = new URLSearchParams(location.search);
    search.value = params.get("q") || "";
    for (const check of checks) check.checked = params.getAll(check.name).includes(check.value);
    const requestedAge=params.get("age");
    const initialAge=ageChoices.find(choice=>choice.value===requestedAge) || ageChoices.find(choice=>choice.value==="all");
    if(initialAge)initialAge.checked=true;

    let selectedCategory = params.get("category") || "all";
    if (!MODUS_CATEGORIES.some(c => c.id === selectedCategory)) selectedCategory = "all";

    function updateCategoryTabs() {
      catTabs.forEach(tab => {
        const isMatch = tab.dataset.categoryId === selectedCategory;
        tab.classList.toggle("active", isMatch);
        tab.setAttribute("aria-selected", String(isMatch));
      });
    }
    updateCategoryTabs();

    function apply() {
      const q = search.value.trim().toLowerCase();
      const selectedAge=ageChoices.find(choice=>choice.checked)?.value || "all";
      const selectedChannels = checks.filter(x=>x.name==="channel"&&x.checked).map(x=>x.value);
      const selectedContexts = checks.filter(x=>x.name==="context"&&x.checked).map(x=>x.value);
      const currentCat = MODUS_CATEGORIES.find(c => c.id === selectedCategory);

      let shown = 0;
      DATA.cards.forEach(card => {
        const el = grid.querySelector(`[data-card-id="${card.id}"]`);
        if (!el) return;
        const detailParams=new URLSearchParams({id:card.id});
        if(selectedAge!=="all")detailParams.set("age",selectedAge);
        el.querySelectorAll("[data-guide-link]").forEach(link=>link.setAttribute("href", toCleanUrl(`modus-detail.html?${detailParams}`)));
        const matchQ = !q || el.dataset.search.includes(q);
        const matchAge=selectedAge==="all" || card.ageGroups?.includes(selectedAge);
        const matchCategory = selectedCategory === "all" || (currentCat?.cardIds?.includes(card.id));
        const matchChannel = !selectedChannels.length || selectedChannels.some(x=>card.channels.includes(x));
        const matchContext = !selectedContexts.length || selectedContexts.some(x=>card.contexts.includes(x));
        const visible = matchQ&&matchAge&&matchCategory&&matchChannel&&matchContext;
        el.classList.toggle("hidden",!visible);
        if(visible) shown++;
      });
      grid.querySelector(".empty-state")?.remove();
      if (!shown) grid.insertAdjacentHTML("beforeend",`<div class="empty-state"><span class="empty-icon">${icon("search")}</span><h2>Tidak ada panduan yang cocok</h2><p>Coba istilah lebih umum atau hapus salah satu filter. Jika sudah ada kerugian, buka bantuan sekarang.</p><a class="btn btn-urgent" href="${toCleanUrl("bantuan-darurat.html")}">Bantuan sekarang</a></div>`);
      count.textContent = `${shown} panduan ditemukan`; clear.classList.toggle("hidden",!q);
      const chips = [
        ...(selectedAge!=="all" ? [{ key:"age", value:selectedAge, label:`Usia: ${AGE_GROUPS.find(group=>group.value===selectedAge)?.label || selectedAge}` }] : []),
        ...(selectedCategory!=="all" ? [{ key:"category", value:selectedCategory, label:`Kategori: ${currentCat?.label || selectedCategory}` }] : []),
        ...(q ? [{ key:"q", value:q, label:`Pencarian: ${search.value.trim()}` }] : []),
        ...selectedChannels.map(value=>({ key:"channel", value, label:value })),
        ...selectedContexts.map(value=>({ key:"context", value, label:value }))
      ];
      activeFilters.innerHTML = chips.map(chip=>`<button class="filter-chip" type="button" data-filter-key="${escapeHtml(chip.key)}" data-filter-value="${escapeHtml(chip.value)}">${escapeHtml(chip.label)} ${icon("close")}</button>`).join("");
      activeFilters.classList.toggle("hidden", !chips.length);
      const next = new URLSearchParams();
      if(selectedAge!=="all")next.set("age",selectedAge);
      if(selectedCategory!=="all")next.set("category",selectedCategory);
      if (q) next.set("q", search.value.trim());
      selectedChannels.forEach(value=>next.append("channel",value));
      selectedContexts.forEach(value=>next.append("context",value));
      history.replaceState(null,"",`${location.pathname}${next.size ? `?${next}` : ""}`);
    }

    catTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        selectedCategory = tab.dataset.categoryId || "all";
        updateCategoryTabs();
        apply();
      });
    });

    grid.addEventListener("click", event => {
      const badge = event.target.closest("[data-filter-category]");
      if (badge) {
        selectedCategory = badge.dataset.filterCategory || "all";
        updateCategoryTabs();
        apply();
      }
    });

    search.addEventListener("input",apply); checks.forEach(c=>c.addEventListener("change",apply)); ageChoices.forEach(choice=>choice.addEventListener("change",apply));
    clear.addEventListener("click",()=>{search.value="";search.focus();apply();});
    const viewBtns = [...document.querySelectorAll(".view-btn")];
    function setCatalogueView(view) {
      grid.classList.remove("view-grid3", "view-list", "view-grid2");
      grid.classList.add(`view-${view}`);
      viewBtns.forEach(btn => {
        const active = btn.dataset.view === view;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
      try { sessionStorage.setItem("ws-catalogue-view", view); } catch (_) {}
    }
    viewBtns.forEach(btn => {
      btn.addEventListener("click", () => setCatalogueView(btn.dataset.view));
    });
    try {
      const savedView = sessionStorage.getItem("ws-catalogue-view") || "grid3";
      if (["grid3", "list", "grid2"].includes(savedView)) {
        setCatalogueView(savedView);
      }
    } catch (_) {}
    document.getElementById("reset-filter").addEventListener("click",()=>{checks.forEach(c=>c.checked=false);const allAge=ageChoices.find(choice=>choice.value==="all");if(allAge)allAge.checked=true;selectedCategory="all";updateCategoryTabs();search.value="";search.focus();apply();});
    activeFilters.addEventListener("click",event=>{const button=event.target.closest("[data-filter-key]");if(!button)return;if(button.dataset.filterKey==="q")search.value="";else if(button.dataset.filterKey==="age"){const allAge=ageChoices.find(choice=>choice.value==="all");if(allAge)allAge.checked=true;}else if(button.dataset.filterKey==="category"){selectedCategory="all";updateCategoryTabs();}else{const target=checks.find(check=>check.name===button.dataset.filterKey&&check.value===button.dataset.filterValue);if(target)target.checked=false;}apply();});
    grid.addEventListener("click", (event) => {
      const guideLink = event.target.closest("[data-guide-link]");
      if (!guideLink) return;
      const cardEl = guideLink.closest(".modus-card");
      const cardId = cardEl?.dataset?.cardId;
      const card = DATA.cards.find(c => c.id === cardId);
      if (card) {
        const category = MODUS_CATEGORIES.find(c => c.cardIds?.includes(card.id) || c.id === card.categoryId) || MODUS_CATEGORIES[1];
        try {
          sessionStorage.setItem("ws-last-viewed-modus", JSON.stringify({
            id: card.id,
            slug: card.slug,
            title: card.title,
            summary: card.summary,
            example: card.fictionalExample,
            categoryId: category.id,
            categoryLabel: category.label,
            channels: card.channels,
            warningSigns: card.warningSigns,
            timestamp: Date.now()
          }));
        } catch (_) {}
      }
    });
    document.getElementById("filter-toggle")?.addEventListener("click",e=>{const panel=document.getElementById("filter-panel");const open=panel.classList.toggle("open");e.currentTarget.setAttribute("aria-expanded",String(open));e.currentTarget.innerHTML=`${icon("filter")} ${open?"Tutup filter":"Filter"}`;});
    apply();
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[character]));
  }

  function redactSensitive(text) {
    return String(text)
      .replace(/https?:\/\/[^\s]+|www\.[^\s]+/gi,"[TAUTAN DISAMARKAN]")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[EMAIL DISAMARKAN]")
      .replace(/(?:\+?62|0)(?:[\s().-]*\d){8,13}\b/g,"[NOMOR DISAMARKAN]")
      .replace(/\b(?:\d[\s.-]*){10,19}\b/g,"[ANGKA DISAMARKAN]")
      .replace(/\b\d{4,9}\b/g,"[ANGKA DISAMARKAN]");
  }

  function renderRedactedText(text) {
    return escapeHtml(redactSensitive(text)).replace(/\[(ANGKA|EMAIL|TAUTAN|NOMOR) DISAMARKAN\]/g,'<span class="redacted">[$1 DISAMARKAN]</span>');
  }

  function detectUrgentExposure(text, explicitChoice) {
    if (explicitChoice === "money" || explicitChoice === "access") return true;
    const normalized = String(text).toLowerCase().replace(/\s+/g," ");
    const actionFirst = /\b(?:sudah|telah|terlanjur|tadi)\b\s+(?:saya\s+)?(?:transfer|mentransfer|membayar|bayar|mengirim|kirim|memberi|membagikan|kasih|memasang|install|instal|menginstal|menginstall)(?:.{0,35})(?:uang|dana|otp|pin|password|kata sandi|kode|apk|aplikasi)?/;
    const objectFirst = /(?:uang|dana)(?:.{0,28})\b(?:sudah|telah)\b\s+(?:terkirim|ditransfer|hilang)|(?:otp|pin|password|kata sandi|kode)\s+(?:tadi\s+)?(?:sudah\s+)?(?:saya\s+)?(?:beri|berikan|bagikan|kasih)|kehilangan akses/;
    return actionFirst.test(normalized) || objectFirst.test(normalized);
  }

  function initConsult() {
    const form = document.getElementById("consult-form"); if(!form) return;
    const input=document.getElementById("consult-input"), urlInput=document.getElementById("consult-url"), count=document.getElementById("consult-count"), result=document.getElementById("consult-result"), error=document.getElementById("consult-error"), consent=document.getElementById("consult-consent"), submit=document.getElementById("consult-submit"), serviceState=document.getElementById("consult-service-state"), modeBadge=document.getElementById("consult-mode-badge"), imageInput=document.getElementById("consult-image"), analyzeImageButton=document.getElementById("analyze-image"), removeImageButton=document.getElementById("remove-image"), imagePreviewWrap=document.getElementById("image-preview-wrap"), imagePreview=document.getElementById("image-preview"), imageName=document.getElementById("image-name"), imageStatus=document.getElementById("image-status"), exposureFields=[...form.querySelectorAll('input[name="exposure"]')];
    let aiAvailable=null;
    let previewUrl="";
    let imageAnalyzerModule=null;
    const officialAllowlist=new Set(["https://iasc.ojk.go.id/","https://sipasti.ojk.go.id/","https://cekrekening.id/","https://aduannomor.id/","https://aduankonten.id/"]);
    const healthCheck=fetch("/api/health",{headers:{Accept:"application/json"},cache:"no-store"}).then(async response=>{
      if(!response.ok)throw new Error("health_failed");
      const health=await response.json();
      aiAvailable=(health.aiConfigured??health.aiAvailable)===true;
      serviceState.textContent=aiAvailable?"AI siap · panduan tetap menjadi rujukan":"Panduan tanpa AI tersedia";
      modeBadge.textContent=aiAvailable?"AI siap":"Tanpa AI";
      modeBadge.classList.toggle("status-live",aiAvailable);
      return health;
    }).catch(()=>{
      aiAvailable=false;
      serviceState.textContent="Panduan tanpa AI tersedia";
      modeBadge.textContent="Tanpa AI";
      return null;
    });
    function clearError(){clearFormError(error,[input,urlInput,imageInput,consent,...exposureFields]);}
    input.addEventListener("input",()=>{count.textContent=input.value.length;clearError();});
    urlInput.addEventListener("input",clearError);
    exposureFields.forEach(field=>field.addEventListener("change",()=>{
      clearError();
      const alertBox=document.getElementById("exposure-alert-banner");
      const selected=exposureFields.find(f=>f.checked)?.value;
      if(alertBox){
        alertBox.classList.toggle("hidden",selected!=="money"&&selected!=="access");
      }
    }));
    consent.addEventListener("change",clearError);
    document.querySelectorAll(".quick-prompt").forEach(btn=>btn.addEventListener("click",()=>{input.value=btn.dataset.prompt;input.dispatchEvent(new Event("input"));input.focus();}));
    document.querySelectorAll(".input-disclosure").forEach(d => {
      d.addEventListener("toggle", () => {
        const txt = d.querySelector(".action-text");
        if (txt) txt.textContent = d.open ? "Tutup" : "Tambah";
      });
    });

    // Cross-feature autofill & context handling
    const consultUrlParams = new URLSearchParams(location.search);
    const modusParam = consultUrlParams.get("modus");
    let fromReportDraft = "";
    try { fromReportDraft = sessionStorage.getItem("ws-consult-draft") || ""; sessionStorage.removeItem("ws-consult-draft"); } catch (_) {}
    const contextWrap = document.getElementById("consult-modus-context-wrap");

    if (modusParam) {
      const card = DATA.cards.find(c => c.id === modusParam || c.slug === modusParam);
      if (card) {
        if (contextWrap) {
          contextWrap.innerHTML = `
            <div class="consult-context-banner">
              <div class="context-banner-text">
                <span class="highlight-pill teal">${icon("book")} Terhubung dengan Panduan</span>
                <strong>Mengecek Kasus: ${escapeHtml(card.title)}</strong>
                <p>Contoh situasi telah diisikan otomatis. Silakan ubah teks di bawah sesuai pengalaman nyata Anda.</p>
              </div>
              <button class="btn btn-ghost btn-sm" id="btn-clear-modus-context" type="button">${icon("close")} Hapus Contoh</button>
            </div>`;
          document.getElementById("btn-clear-modus-context")?.addEventListener("click", () => {
            input.value = "";
            count.textContent = "0";
            contextWrap.innerHTML = "";
            input.focus();
          });
        }
        const cleanExample = card.fictionalExample ? card.fictionalExample.replace(/[“”"]/g, "") : `Saya menghadapi situasi mencurigakan terkait ${card.title.toLowerCase()}: ${card.summary}`;
        input.value = cleanExample;
        count.textContent = input.value.length;
        consent.checked = false;
        const defaultRadio = document.querySelector('input[name="exposure"][value="none"]');
        if (defaultRadio && ![...document.querySelectorAll('input[name="exposure"]')].some(r => r.checked)) {
          defaultRadio.checked = true;
        }
        input.focus();
      }
    } else if (fromReportDraft) {
      input.value = fromReportDraft;
      count.textContent = input.value.length;
      consent.checked = false;
      if (contextWrap) {
        contextWrap.innerHTML = `
          <div class="consult-context-banner">
            <div class="context-banner-text">
              <span class="highlight-pill teal">${icon("sparkles")} Draf dari Laporan Warga</span>
              <strong>Uraian Berhasil Dipindahkan ke Konsultasi AI</strong>
              <p>Cerita Anda telah disalin dari formulir laporan agar dapat dianalisis terlebih dahulu oleh sistem.</p>
            </div>
          </div>`;
      }
      input.focus();
    } else {
      let handoffQuestion="";
      try{handoffQuestion=String(sessionStorage.getItem("ws-home-question")||"").trim().slice(0,600);sessionStorage.removeItem("ws-home-question");}catch(_){}
      if(handoffQuestion){
        input.value=handoffQuestion;
        input.dispatchEvent(new Event("input"));
        const bubble=document.createElement("div");
        bubble.className="message user handoff-message";
        bubble.textContent=handoffQuestion;
        document.getElementById("chat-body")?.append(bubble);
      } else {
        // Check if user recently read a guide
        try {
          const rawRecent = sessionStorage.getItem("ws-last-viewed-modus");
          if (rawRecent) {
            const recent = JSON.parse(rawRecent);
            if (contextWrap && recent?.title) {
              contextWrap.innerHTML = `
                <div class="consult-recent-prompt" id="consult-recent-prompt">
                  <div class="recent-prompt-info">${icon("sparkles")} Baru membaca panduan <strong>${escapeHtml(recent.title)}</strong>? Ingin menguji kasus ini?</div>
                  <div class="recent-prompt-actions">
                    <button class="btn btn-primary btn-sm" id="btn-autofill-recent" type="button">Isi Otomatis</button>
                    <button class="btn btn-ghost btn-sm" id="btn-dismiss-recent" type="button" aria-label="Tutup">${icon("close")}</button>
                  </div>
                </div>`;
              document.getElementById("btn-autofill-recent")?.addEventListener("click", () => {
                const cleanExample = recent.example ? recent.example.replace(/[“”"]/g, "") : `Saya mendapati situasi terkait ${recent.title}: ${recent.summary}`;
                input.value = cleanExample;
                count.textContent = input.value.length;
                consent.checked = false;
                const defaultRadio = document.querySelector('input[name="exposure"][value="none"]');
                if (defaultRadio && ![...document.querySelectorAll('input[name="exposure"]')].some(r => r.checked)) {
                  defaultRadio.checked = true;
                }
                contextWrap.innerHTML = `
                  <div class="consult-context-banner" id="consult-recent-autofill-banner">
                    <div class="context-banner-text">
                      <span class="highlight-pill teal">${icon("book")} Terhubung dari Panduan Modus</span>
                      <strong>Mengecek Kasus: ${escapeHtml(recent.title)}</strong>
                      <p>Contoh situasi dari modul panduan telah diisikan otomatis ke kotak konsultasi. Anda dapat langsung menekan tombol <strong>Periksa sekarang</strong> atau menyesuaikan teks dengan kejadian nyata Anda.</p>
                    </div>
                    <div class="context-banner-actions">
                      <button class="btn btn-ghost btn-sm" id="btn-clear-modus-context" type="button">${icon("trash")} Hapus & Tulis Sendiri</button>
                    </div>
                  </div>`;
                document.getElementById("btn-clear-modus-context")?.addEventListener("click", () => {
                  input.value = "";
                  count.textContent = "0";
                  contextWrap.innerHTML = "";
                  consent.checked = false;
                  try { sessionStorage.removeItem("ws-last-viewed-modus"); } catch (_) {}
                  input.focus();
                });
                sessionStorage.removeItem("ws-last-viewed-modus");
                input.focus();
              });
              document.getElementById("btn-dismiss-recent")?.addEventListener("click", () => {
                contextWrap.innerHTML = "";
                sessionStorage.removeItem("ws-last-viewed-modus");
              });
            }
          }
        } catch (_) {}
      }
    }

    // Category explorer chips in ready state
    document.querySelectorAll(".ready-category-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        const catId = btn.dataset.categoryPromptId;
        const cat = MODUS_CATEGORIES.find(c => c.id === catId);
        if (!cat) return;
        const card = DATA.cards.find(c => cat.cardIds?.includes(c.id));
        if (card) {
          const exampleText = card.fictionalExample ? card.fictionalExample.replace(/[“”"]/g, "") : `Saya menghadapi situasi mencurigakan terkait ${card.title.toLowerCase()}.`;
          input.value = exampleText;
          count.textContent = input.value.length;
          consent.checked = false;
          const defaultRadio = document.querySelector('input[name="exposure"][value="none"]');
          if (defaultRadio) defaultRadio.checked = true;
          input.focus();
          input.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });

    function resetImage(){
      if(previewUrl)URL.revokeObjectURL(previewUrl);
      previewUrl="";
      imageInput.value="";
      imagePreview.removeAttribute("src");
      imagePreviewWrap.classList.add("hidden");
      analyzeImageButton.classList.add("hidden");
      removeImageButton.classList.add("hidden");
      imageStatus.textContent="Siap mengambil teks.";
    }
    imageInput.addEventListener("change",()=>{
      const file=imageInput.files?.[0];
      if(!file){resetImage();return;}
      const disclosure=document.getElementById("image-disclosure");
      if(disclosure)disclosure.open=true;
      if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>5*1024*1024){
        resetImage();
        showFormError(error,"Gunakan gambar PNG, JPG, atau WebP dengan ukuran maksimal 5 MB.",[imageInput]);
        return;
      }
      if(previewUrl)URL.revokeObjectURL(previewUrl);
      previewUrl=URL.createObjectURL(file);
      imagePreview.src=previewUrl;
      imageName.textContent=file.name;
      imageStatus.textContent="Siap membaca teks dan kode QR di perangkat ini.";
      imagePreviewWrap.classList.remove("hidden");
      analyzeImageButton.classList.remove("hidden");
      removeImageButton.classList.remove("hidden");
      clearError();
    });
    removeImageButton.addEventListener("click",()=>{resetImage();imageInput.focus();});
    analyzeImageButton.addEventListener("click",async()=>{
      const file=imageInput.files?.[0];
      if(!file)return;
      analyzeImageButton.disabled=true;
      imageStatus.textContent="Menyiapkan pembaca teks di perangkat…";
      try{
        imageAnalyzerModule=await import("./image-analyzer.js");
        const analysis=await imageAnalyzerModule.analyzeImageLocally(file,{onProgress:(message)=>{
          const progress=Number.isFinite(message.progress)?` ${Math.round(message.progress*100)}%`:"";
          imageStatus.textContent=`${message.status||"Memproses gambar"}${progress}`;
        }});
        if(analysis.text){
          const prefix=input.value.trim()?`${input.value.trim()}\n\nTeks dari gambar:\n`:"";
          input.value=`${prefix}${analysis.text}`.slice(0,1500);
          input.dispatchEvent(new Event("input",{bubbles:true}));
        }
        if(!urlInput.value&&analysis.detectedUrls.length){urlInput.value=analysis.detectedUrls[0];urlInput.dispatchEvent(new Event("input",{bubbles:true}));}
        const found=[analysis.text?`teks terbaca dengan perkiraan keyakinan ${analysis.confidence}%`:"tidak ada teks",analysis.qrValues.length?`${analysis.qrValues.length} kode QR terdeteksi`:"tidak ada kode QR yang terbaca"].join(" · ");
        imageStatus.textContent=`Selesai: ${found}. Periksa dan koreksi hasil sebelum mengirim.`;
      }catch(_){
        imageStatus.textContent="Teks tidak berhasil diambil. Coba gambar yang lebih tajam atau tulis isi pesan secara manual.";
      }finally{analyzeImageButton.disabled=false;}
    });
    window.addEventListener("pagehide",()=>{
      if(previewUrl)URL.revokeObjectURL(previewUrl);
      imageAnalyzerModule?.disposeImageAnalyzer().catch(()=>{});
    },{once:true});

    function inspectUrlLocally(value){
      const raw=String(value||"").trim();
      if(!raw)return null;
      try{
        const parsed=new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)?raw:`https://${raw}`);
        if(!["http:","https:"].includes(parsed.protocol))throw new Error("scheme");
        const signals=[];
        if(parsed.username||parsed.password)signals.push({label:"Link menyisipkan informasi sebelum alamat situs sehingga tujuan sebenarnya lebih sulit dibaca."});
        if(parsed.protocol==="http:")signals.push({label:"Link memakai HTTP, bukan HTTPS."});
        if(/^\d{1,3}(?:\.\d{1,3}){3}$/.test(parsed.hostname))signals.push({label:"Tujuan memakai alamat IP langsung."});
        if(parsed.hostname.includes("xn--"))signals.push({label:"Nama domain memakai Punycode; periksa karakter yang tampak serupa."});
        if(parsed.hostname.split(".").length>4)signals.push({label:"Nama host memiliki banyak lapisan subdomain."});
        if(parsed.port&&!((parsed.protocol==="https:"&&parsed.port==="443")||(parsed.protocol==="http:"&&parsed.port==="80")))signals.push({label:"Link memakai port yang tidak umum untuk halaman web."});
        if(/(?:^|[.-])(login|secure|verify|verification|account|update|wallet|hadiah|bonus|bank)(?:[.-]|$)/i.test(parsed.hostname))signals.push({label:"Nama host memakai kata yang dapat meniru halaman masuk, verifikasi, hadiah, atau layanan keuangan."});
        if(raw.length>160)signals.push({label:"Link sangat panjang sehingga tujuan utamanya lebih sulit diperiksa."});
        if((raw.match(/%[0-9a-f]{2}/gi)||[]).length>=4)signals.push({label:"Link memakai banyak karakter yang dikodekan."});
        const host=parsed.hostname.toLowerCase();
        const brandDomains={facebook:["facebook.com","fb.com","fbcdn.net","facebook.net"],instagram:["instagram.com","cdninstagram.com"],whatsapp:["whatsapp.com","whatsapp.net"],linkedin:["linkedin.com","licdn.com"],roblox:["roblox.com"],amazon:["amazon.com","amazonaws.com","amazonvideo.com","amazon.dev","amazon-adsystem.com","media-amazon.com"],netflix:["netflix.com","nflxvideo.net","nflximg.net"],microsoft:["microsoft.com","microsoftonline.com","live.com","cloud.microsoft","static.microsoft","office.com","windows.com"],apple:["apple.com","apple-dns.net","cdn-apple.com","icloud.com"],paypal:["paypal.com"],coinbase:["coinbase.com"],ledger:["ledger.com"],trezor:["trezor.io"],shopee:["shopee.co.id","shopee.com"],tokopedia:["tokopedia.com"],mandiri:["bankmandiri.co.id","mandiri.co.id"],bca:["bca.co.id","klikbca.com"],bri:["bri.co.id","ib.bri.co.id"],bni:["bni.co.id"],dana:["dana.id"],gopay:["gopay.co.id","gojek.com"],ovo:["ovo.id"],telegram:["telegram.org","t.me"]};
        const compactHost=host.replace(/[^a-z0-9]/g,"");
        const normHost=host.replace(/rn/g,"m").replace(/vv/g,"w").replace(/cl/g,"d").replace(/0/g,"o").replace(/1/g,"l").replace(/5/g,"s").replace(/@/g,"a");
        let brandFound=false;
        for(const [brand,official] of Object.entries(brandDomains)){
          const appears=brand.length<=4?new RegExp(`(?:^|[.-])${brand}(?:[.-]|$)`,"i").test(host):host.includes(brand)||compactHost.includes(brand);
          if(appears&&!official.some(domain=>host===domain||host.endsWith(`.${domain}`))){
            signals.push({label:`Nama domain memuat “${brand}”, tetapi bukan bagian dari keluarga domain resmi yang dikenali.`});
            brandFound=true;break;
          }
        }
        if(!brandFound){
          for(const [brand,official] of Object.entries(brandDomains)){
            if(official.some(domain=>host===domain||host.endsWith(`.${domain}`)))continue;
            const lookalikeMatch=brand.length<=4?new RegExp(`(?:^|[.-])${brand}(?:[.-]|$)`,"i").test(normHost):normHost.includes(brand);
            if(lookalikeMatch){
              const hasRnTrick=host.includes("rn")&&brand.includes("m");
              const noteTrick=hasRnTrick?" (teknik visual: huruf “rn” menyerupai “m”)":"";
              signals.push({label:`Nama domain “${host}” menggunakan teknik lookalike / domain tiruan yang meniru merek resmi “${brand}”${noteTrick}. Ini adalah indikasi kuat upaya penipuan atau phishing.`});
              brandFound=true;break;
            }
          }
        }
        const hosting=["pages.dev","vercel.app","netlify.app","github.io","blogspot.com","wasmer.app","replit.app","workers.dev","webflow.io","framer.website","framer.app","gitbook.io","onrender.com","railway.app","azurewebsites.net","jimdofree.com"].find(domain=>host!==domain&&host.endsWith(`.${domain}`));
        if(hosting){const tenant=host.slice(0,-(hosting.length+1)),digits=(tenant.match(/\d/g)||[]).length,hyphens=(tenant.match(/-/g)||[]).length,generated=tenant.length>=12&&digits>=2&&(hyphens>=1||/^[a-z0-9]{14,}$/i.test(tenant)),sensitive=/(?:login|auth|account|verify|verification|appeal|wallet|secure|support|facebook|instagram|amazon|netflix|ledger|trezor|roblox|whatsapp|coinbase|paypal)/i.test(`${tenant}${parsed.pathname}`);if(generated||sensitive)signals.push({label:"Halaman berada pada layanan hosting yang dapat dibuat pengguna dan memakai nama acak atau tema akun/merek."});}
        if(new Set(["bit.ly","tinyurl.com","tiny.cc","t.co","goo.su","did.li","g5.lu","1url.at","py.md","qr2.it","urlz.li"]).has(host))signals.push({label:"Tautan memakai layanan pemendek sehingga tujuan akhirnya tidak terlihat."});
        return {host:parsed.hostname,display:`${parsed.protocol}//${parsed.hostname}${parsed.port?`:${parsed.port}`:""}${parsed.pathname.slice(0,120)}${parsed.search?"?[parameter disembunyikan]":""}`,riskLevel:signals.length?"review":"no_visible_structural_signals",signals,fetched:false,note:"WargaSiaga tidak membuka link ini. Tidak ditemukannya tanda dari bentuk link bukan bukti bahwa situs aman."};
      }catch(_){return {invalid:true,signals:[],note:"Format link (URL) tidak dapat dibaca."};}
    }

    let consultHistory = [];
    let currentExposure = "none";
    let activePersona = null;
    let activeCredibility = null;

    function localResult(raw,exposure,urgent=false,submittedUrl=""){
      const low=raw.toLowerCase();
      const scored=DATA.cards.map(card=>({card,score:[card.title,card.summary,...card.channels,...card.contexts,...card.tactics,card.requestedAction].join(" ").toLowerCase().split(/\W+/).filter(word=>word.length>3&&low.includes(word)).length})).sort((left,right)=>right.score-left.score);
      const matches=scored.filter(item=>item.score>0).slice(0,2).map(item=>({id:item.card.id,title:item.card.title}));
      
      const isGreeting = /^(?:hi|halo|hei|hello|pagi|siang|sore|malam|assalamu(?:'|a)?laikum|permisi|bisa bantu|tolong|tes)\b/i.test(low);
      const isGratitude = /(?:terima\s*kasih|makasih|thanks|thank\s*you|alhamdulillah|baik\s*terima\s*kasih)/i.test(low);
      const isBankQuery = /(?:rekening|cek\s*rekening|cekrekening|nomor\s*rekening|transfer\s*ke\s*siapa)/i.test(low);
      const isPhoneQuery = /(?:nomor\s*(?:hp|telepon|wa|whatsapp)|aduan\s*nomor|cek\s*nomor)/i.test(low);
      const isMoneyRecovery = /(?:uang\s*(?:kembali|bisa\s*balik|hilang)|kembalikan\s*uang|bisa\s*kembali)/i.test(low);
      const isCallCenter = /(?:call\s*center|nomor\s*resmi|telepon\s*bank|hotline)/i.test(low);
      const isPoliceReport = /(?:lapor\s*polisi|lapor\s*ke\s*polisi|kantor\s*polisi|bikin\s*laporan)/i.test(low);
      const isApkMalware = /(?:apk|unduh\s*file|surat\s*undangan|resi\s*paket|instal\s*aplikasi)/i.test(low);

      let customHeadline = null;
      let customSummary = null;
      let customClues = null;
      let customUncertainties = null;
      let customNextActions = null;
      let customSuggestions = null;

      if (!urgent && !submittedUrl) {
        if (isGreeting) {
          customHeadline = "Asisten Konsultasi WargaSiaga";
          customSummary = "Halo! Saya Asisten Keamanan WargaSiaga siap membantu konsultasi Anda. Ada pesan mencurigakan, nomor kontak terduga, atau transaksi yang ingin Anda tanyakan langkah pengamanannya?";
          customClues = ["Pengguna membuka sesi konsultasi dan bantuan."];
          customUncertainties = ["Belum ada rincian peristiwa atau bukti transaksi yang dibagikan."];
          customNextActions = ["Tuliskan peristiwa atau pertanyaan yang ingin Anda periksa.", "Gunakan tombol contoh pertanyaan di bawah ini untuk panduan cepat."];
          customSuggestions = ["Bagaimana cara memastikan keaslian rekening bank?", "Apa langkah darurat jika sudah terlanjur transfer uang?", "Bagaimana cara membedakan link resmi dan palsu?"];
        } else if (isGratitude) {
          customHeadline = "Konsultasi Selesai";
          customSummary = "Sama sama! Tetap selalu waspada dan jaga kerahasiaan data perbankan Anda. Jangan ragu bertanya kembali jika menemui kejanggalan digital lainnya.";
          customClues = ["Pengguna menyampaikan apresiasi dan menutup sesi."];
          customUncertainties = ["Tidak ada kendala aktif yang dilaporkan saat ini."];
          customNextActions = ["Simpan bukti percakapan atau tautan resmi jika diperlukan di kemudian hari.", "Bagikan edukasi kewaspadaan ini kepada orang terdekat dan keluarga Anda."];
          customSuggestions = ["Bagaimana cara melaporkan modus baru ke Lapor Warga?", "Apa saja ciri ciri akun media sosial tiruan?", "Ke mana harus melapor jika ada nomor mencurigakan baru?"];
        } else if (isBankQuery) {
          customHeadline = "Panduan Periksa Rekening Bank";
          customSummary = "Untuk memeriksa rekam jejak rekening bank atau dompet digital yang mencurigakan, gunakan portal resmi CekRekening.id milik Kementerian Komdigi.";
          customClues = ["Pertanyaan mengenai pengecekan keaslian nomor rekening atau dompet digital."];
          customUncertainties = ["Status rekening dapat berubah sewaktu waktu berdasarkan riwayat aduan masyarakat."];
          customNextActions = ["Buka situs resmi https://cekrekening.id melalui peramban mandiri.", "Masukkan nama bank dan nomor rekening untuk melihat riwayat pelaporan.", "Jangan transfer dana sebelum status rekening dipastikan wajar."];
          customSuggestions = ["Bagaimana jika rekening sudah terlanjur saya transfer?", "Apakah bisa minta blokir rekening penipu ke bank?", "Ke mana harus melapor selain CekRekening.id?"];
        } else if (isPhoneQuery) {
          customHeadline = "Panduan Periksa Nomor Telepon / WA";
          customSummary = "Nomor telepon seluler, SMS, atau WhatsApp yang terindikasi penipuan dapat diperiksa dan dilaporkan melalui portal resmi AduanNomor.id milik Komdigi.";
          customClues = ["Pertanyaan mengenai pengecekan reputasi nomor kontak atau pengirim pesan."];
          customUncertainties = ["Pelaku kerap mengganti nomor baru atau menggunakan teknik pemalsuan identitas."];
          customNextActions = ["Buka portal resmi https://aduannomor.id.", "Laporkan nomor yang mengirim pesan penipuan dengan melampirkan tangkapan layar bukti.", "Blokir nomor tersebut pada perangkat Anda."];
          customSuggestions = ["Bagaimana jika pelaku menghubungi lewat nomor tidak dikenal?", "Apakah aman membalas pesan nomor penipu?", "Bagaimana membedakan pesan resmi bank dari SMS biasa?"];
        } else if (isMoneyRecovery) {
          customHeadline = "Waspada Modus Pengembalian Dana";
          customSummary = "Hati hati terhadap tawaran oknum di media sosial atau peretas yang mengklaim dapat mengembalikan uang korban penipuan dengan meminta bayaran di muka. Itu adalah penipuan tahap kedua.";
          customClues = ["Pertanyaan seputar penarikan kembali atau pemulihan dana yang telah terkirim."];
          customUncertainties = ["Hanya pihak bank penerbit dan penegak hukum yang berwenang menelusuri aliran dana secara legal."];
          customNextActions = ["Jangan membayar biaya administrasi atau jasa kepada siapa pun yang mengaku bisa menarik uang kembali.", "Segera hubungi bank Anda dan bank tujuan penerima melalui call center resmi.", "Buat laporan resmi kepolisian dan aduan ke Kontak OJK 157."];
          customSuggestions = ["Berapa nomor call center resmi bank saya?", "Bagaimana alur pembuatan laporan ke kantor polisi?", "Apa berkas yang perlu disiapkan untuk pengaduan ke bank?"];
        } else if (isCallCenter) {
          customHeadline = "Verifikasi Kontak Call Center Resmi";
          customSummary = "Gunakan hanya nomor call center resmi perbankan atau lembaga keuangan yang terdaftar di OJK. Jangan gunakan nomor yang Anda dapatkan dari kolom komentar, iklan sponsor mesin pencari, atau bio media sosial tidak bercentang.";
          customClues = ["Pertanyaan mengenai kontak darurat atau call center resmi."];
          customUncertainties = ["Nomor kontak di internet bisa dipalsukan oleh oknum pencari mangsa."];
          customNextActions = ["Lihat nomor hotline resmi yang tertera pada bagian belakang kartu ATM Anda.", "Akses aplikasi perbankan resmi untuk fitur panggilan terintegrasi.", "Hubungi OJK melalui kontak 157 untuk verifikasi legalitas lembaga."];
          customSuggestions = ["Berapa kontak WhatsApp resmi bank?", "Apakah bank pernah menghubungi nasabah lewat nomor seluler biasa?", "Bagaimana jika ada yang mengaku petugas bank minta kode OTP?"];
        } else if (isPoliceReport) {
          customHeadline = "Langkah Pembuatan Laporan Polisi";
          customSummary = "Laporan kepolisian dibuat di kantor SPKT (Sentra Pelayanan Kepolisian Terpadu) terdekat, Polda, atau Polres setempat untuk tindak pidana siber dan penipuan transaksi digital.";
          customClues = ["Pertanyaan mengenai pelaporan pidana ke pihak kepolisian."];
          customUncertainties = ["Proses penegakan hukum membutuhkan alat bukti yang sah dan kronologi runtut."];
          customNextActions = ["Kumpulkan dan cetak bukti percakapan utuh, bukti transfer, dan identitas nomor atau rekening pelaku.", "Bawa bukti fisik ke kantor polisi terdekat bagian SPKT.", "Dapatkan tanda bukti Surat Tanda Terima Laporan Polisi untuk pengajuan blokir ke bank."];
          customSuggestions = ["Apakah pengurusan laporan polisi dipungut biaya?", "Berapa lama batas waktu efektif pemblokiran rekening pelaku?", "Bagaimana cara membuat draf kronologi laporan polisi?"];
        } else if (isApkMalware) {
          customHeadline = "Peringatan File Aplikasi APK Berbahaya";
          customSummary = "File aplikasi (.apk) yang dikirim lewat WhatsApp atau Telegram sering kali merupakan malware pencuri SMS OTP, data m-banking, dan pengambil alih izin perangkat.";
          customClues = ["Uraian berkaitan dengan file APK, aplikasi tidak resmi, atau undangan digital mencurigakan."];
          customUncertainties = ["Malware dapat langsung aktif berjalan di latar belakang begitu izin akses diberikan."];
          customNextActions = ["Jangan pernah mengunduh atau memasang file berekstensi .apk dari ruang obrolan.", "Jika terlanjur dipasang, segera aktifkan Mode Pesawat untuk memutus internet.", "Copot pemasangan aplikasi lewat Pengaturan dan periksa riwayat izin aplikasi."];
          customSuggestions = ["Apa yang harus dilakukan jika m-banking sudah terlanjur tidak bisa dibuka?", "Bagaimana cara memulihkan ponsel setelah terkena malware APK?", "Apakah data kontak di ponsel saya bisa diambil pelaku?"];
        }
      }

      const clues=[];
      if(customClues){
        clues.push(...customClues);
      } else {
        if(/otp|pin|password|kata sandi|kode/.test(low))clues.push("Uraian menyebut data akses atau kode rahasia.");
        if(/transfer|deposit|top up|bayar|rekening|dana/.test(low))clues.push("Uraian menyebut pembayaran atau pemindahan dana.");
        if(/segera|sekarang|hari ini|cepat|dibekukan|hangus/.test(low))clues.push("Uraian memuat tekanan waktu atau ancaman akibat jika menunda.");
        if(/link|tautan|apk|unduh|download|qr/.test(low))clues.push("Uraian menyebut tautan, file, aplikasi, atau QR yang perlu diverifikasi.");
        if(!clues.length)clues.push("Belum ada tanda spesifik yang dapat dikenali dari uraian singkat ini.");
      }
      const urlAnalysis=inspectUrlLocally(submittedUrl);
      if(urlAnalysis?.signals?.length)clues.unshift(...urlAnalysis.signals.map(signal=>signal.label));
      const localAssessment=urgent||matches.length||urlAnalysis?.signals?.length?"warning_signs":submittedUrl?"verify_independently":"insufficient_information";
      const persona = urgent
        ? { id: "korban_mendesak", label: "Kondisi Mendesak", description: "Telah mengirimkan uang atau data rahasia." }
        : { id: "warga_umum", label: "Warga Umum", description: "Panduan keselamatan digital terarah." };
      const credibility = {
        score: urgent ? 95 : (customHeadline ? 25 : clues.length ? 70 : 20),
        level: urgent ? "tinggi" : (customHeadline ? "aman_bersyarat" : clues.length ? "waspada" : "aman_bersyarat"),
        label: urgent ? "Tingkat Risiko Indikasi: Tinggi (95%)" : (customHeadline ? "Tingkat Risiko Indikasi: Rendah (25%)" : clues.length ? "Tingkat Risiko Indikasi: Waspada (70%)" : "Tingkat Risiko Indikasi: Rendah (20%)"),
        indicators: clues.slice(0, 4)
      };
      const followUpSuggestions = customSuggestions || [
        "Bagaimana cara memastikan keaslian pihak yang menghubungi saya?",
        "Apa langkah pengamanan akun yang perlu saya lakukan sekarang?",
        "Ke mana saya bisa melaporkan nomor atau tautan mencurigakan ini?"
      ];
      return {
        mode:urgent?"urgent":"rules",
        assessment:localAssessment,
        headline:customHeadline || (urgent?"Ambil langkah pengamanan sekarang":localAssessment==="warning_signs"?"Ada tanda yang patut dicurigai":localAssessment==="verify_independently"?"Tetap periksa melalui kanal terpisah":"Belum cukup informasi"),
        summary:customSummary || (urgent?"Karena uang, data, atau akses sudah diberikan, jangan menunggu analisis AI.":"Pemeriksaan tanpa AI tidak dapat memastikan pesan aman atau penipuan."),
        observedClues:clues,
        uncertainties:customUncertainties || ["Identitas pihak yang menghubungi belum terverifikasi.","Keaslian nomor, akun, dokumen, atau tautan tidak dapat dipastikan dari teks."],
        nextActions:customNextActions || (urgent?["Buka bantuan sekarang dan ikuti urutan pengamanan.","Gunakan aplikasi atau kontak resmi yang Anda temukan secara mandiri."]:["Jangan klik, membayar, atau memberikan data tambahan.","Periksa melalui aplikasi, situs, atau nomor resmi yang Anda temukan sendiri."]),
        immediateActions:urgent?[exposure==="money"?"Hubungi bank atau penyedia dompet digital melalui kanal resmi sekarang.":"Amankan akun dari perangkat tepercaya dan hubungi penyedia layanan resmi.","Simpan bukti tanpa menyebarkan data sensitif."]:[],
        relatedCards:matches,
        officialLinks:[],
        urlAnalysis,
        persona,
        credibility,
        followUpSuggestions,
        redaction:{applied:redactSensitive(raw)!==raw,count:0,categories:[]},
        notice:urgent?"Cabang darurat berjalan lokal dan tidak dikirim ke model.":"Layanan AI tidak dapat dijangkau; hasil ini berasal dari aturan lokal WargaSiaga.",
        disclaimer:"Hasil ini adalah panduan awal, bukan sertifikasi aman, keputusan hukum, atau verifikasi identitas.",
        retention:"Teks tidak dikirim ke penyedia model pada hasil lokal ini."
      };
    }

    function renderList(items){return `<ul>${(Array.isArray(items)?items:[]).map(item=>`<li>${escapeHtml(item)}</li>`).join("")}</ul>`;}
    function attachHelpdeskEvents(payload = {}){
      const followupForm=document.getElementById("helpdesk-followup-form");
      const followupInput=document.getElementById("helpdesk-followup-input");
      const dialogueMessages=document.getElementById("dialogue-messages");
      const suggestionsChips=document.getElementById("suggestions-chips");
      const resetBtn=document.getElementById("helpdesk-reset-btn");
      const sendBtn=document.getElementById("helpdesk-send-btn");
      if(!followupForm||!followupInput)return;

      document.querySelectorAll(".suggestion-chip").forEach(btn=>{
        btn.addEventListener("click",()=>{
          followupInput.value=btn.dataset.question;
          followupForm.requestSubmit();
        });
      });

      document.getElementById("btn-escalate-report")?.addEventListener("click", () => {
        const rawText = input.value.trim() || "";
        const clues = Array.isArray(payload?.observedClues) ? payload.observedClues.join(". ") : "";
        const prefill = {
          story: rawText || clues || payload?.summary || "",
          channel: (rawText.toLowerCase().includes("whatsapp") || rawText.toLowerCase().includes("wa")) ? "WhatsApp" : (rawText.toLowerCase().includes("telegram") ? "Telegram" : (rawText.toLowerCase().includes("sms") ? "SMS" : (rawText.toLowerCase().includes("email") ? "Email" : "WhatsApp"))),
          type: payload?.relatedCards?.[0]?.id || "",
          url: urlInput.value.trim(),
          evidence: {
            phone: (rawText.match(/(?:\+?62|0)8[1-9][0-9]{6,11}/) || [])[0] || "",
            bank: (rawText.match(/(?:bca|bri|mandiri|bni|bsi|jago|seabank|dana|ovo|gopay)\s*\d{8,18}/i) || [])[0] || "",
            email: (rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || "",
            url: urlInput.value.trim() || (rawText.match(/https?:\/\/[^\s]+/i) || [])[0] || ""
          }
        };
        try {
          sessionStorage.setItem("ws-report-prefill", JSON.stringify(prefill));
        } catch (_) {}
        location.assign(toCleanUrl("lapor.html"));
      });

      document.getElementById("btn-escalate-urgent")?.addEventListener("click", () => {
        const rawText = input.value.trim() || "";
        const urgentPrefill = {
          incidents: ["money", "otp"],
          bank: (rawText.match(/(?:bca|bri|mandiri|bni|bsi|jago|seabank|dana|ovo|gopay)\s*\d{8,18}/i) || [])[0] || "",
          contact: (rawText.match(/(?:\+?62|0)8[1-9][0-9]{6,11}/) || [])[0] || "",
          chronology: rawText || payload?.summary || ""
        };
        try {
          sessionStorage.setItem("ws-urgent-prefill", JSON.stringify(urgentPrefill));
        } catch (_) {}
      });

      resetBtn?.addEventListener("click",()=>{
        consultHistory=[];
        input.value="";
        urlInput.value="";
        count.textContent="0";
        result.classList.add("hidden");
        result.innerHTML="";
        document.getElementById("consult-ready-state")?.classList.remove("hidden");
        input.focus();
        input.scrollIntoView({behavior:"smooth",block:"center"});
      });

      followupForm.addEventListener("submit",async e=>{
        e.preventDefault();
        const query=followupInput.value.trim();
        if(!query)return;
        followupInput.value="";
        sendBtn.disabled=true;

        const userBubble=document.createElement("div");
        userBubble.className="chat-bubble user";
        userBubble.innerHTML=`<div>${escapeHtml(query)}</div><span class="bubble-meta">Pertanyaan Anda</span>`;
        dialogueMessages.appendChild(userBubble);

        const loadingBubble=document.createElement("div");
        loadingBubble.className="chat-bubble assistant";
        loadingBubble.innerHTML=`<div><span class="loading-spinner" aria-hidden="true" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:6px"></span>Menganalisis konsultasi lanjutan...</div><span class="bubble-meta">${icon("bot")} Asisten WargaSiaga</span>`;
        dialogueMessages.appendChild(loadingBubble);
        dialogueMessages.scrollTop=dialogueMessages.scrollHeight;

        try{
          const response=await fetch("/api/consult",{
            method:"POST",
            headers:{"Content-Type":"application/json","Accept":"application/json"},
            body:JSON.stringify({
              text:query,
              history:consultHistory,
              exposure:currentExposure,
              persona:activePersona?.id,
              consent:consent.checked
            })
          });
          const followUpPayload=await response.json();
          if(!response.ok)throw new Error(followUpPayload?.error?.message||"Layanan belum dapat memproses pertanyaan.");

          const actionsHtml=followUpPayload.nextActions?.length?`<div style="margin-top:6px;font-size:12px;opacity:0.95"><strong>Langkah disarankan:</strong><ul style="margin:4px 0 0 16px;padding:0">${followUpPayload.nextActions.map(a=>`<li>${escapeHtml(a)}</li>`).join("")}</ul></div>`:"";
          loadingBubble.innerHTML=`<div><strong>${escapeHtml(followUpPayload.headline||"Panduan Lanjutan")}</strong>: ${escapeHtml(followUpPayload.summary)}</div>${actionsHtml}<span class="bubble-meta">${icon("bot")} Asisten WargaSiaga</span>`;

          consultHistory.push({role:"user",content:query});
          consultHistory.push({role:"assistant",content:`${followUpPayload.headline||"Panduan Lanjutan"}. ${followUpPayload.summary}`});

          if(Array.isArray(followUpPayload.followUpSuggestions)&&followUpPayload.followUpSuggestions.length){
            suggestionsChips.innerHTML=followUpPayload.followUpSuggestions.map(q=>`<button class="suggestion-chip" type="button" data-question="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join("");
            document.querySelectorAll(".suggestion-chip").forEach(btn=>{
              btn.addEventListener("click",()=>{
                followupInput.value=btn.dataset.question;
                followupForm.requestSubmit();
              });
            });
          }
        }catch(err){
          // Fallback to intelligent local helpdesk response
          const localFallback = localResult(query, currentExposure, false, "");
          const actionsHtml = localFallback.nextActions?.length ? `<div style="margin-top:6px;font-size:12px;opacity:0.95"><strong>Langkah disarankan:</strong><ul style="margin:4px 0 0 16px;padding:0">${localFallback.nextActions.map(a=>`<li>${escapeHtml(a)}</li>`).join("")}</ul></div>` : "";
          loadingBubble.innerHTML = `<div><strong>${escapeHtml(localFallback.headline || "Panduan Lanjutan")}</strong>: ${escapeHtml(localFallback.summary)}</div>${actionsHtml}<span class="bubble-meta">${icon("bot")} Asisten WargaSiaga (Panduan Lokal)</span>`;
          consultHistory.push({role:"user",content:query});
          consultHistory.push({role:"assistant",content:`${localFallback.headline||"Panduan Lanjutan"}. ${localFallback.summary}`});
          if(Array.isArray(localFallback.followUpSuggestions)&&localFallback.followUpSuggestions.length){
            suggestionsChips.innerHTML=localFallback.followUpSuggestions.map(q=>`<button class="suggestion-chip" type="button" data-question="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join("");
            document.querySelectorAll(".suggestion-chip").forEach(btn=>{
              btn.addEventListener("click",()=>{
                followupInput.value=btn.dataset.question;
                followupForm.requestSubmit();
              });
            });
          }
        }finally{
          sendBtn.disabled=false;
          dialogueMessages.scrollTop=dialogueMessages.scrollHeight;
        }
      });
    }

    function renderAssessment(payload, originalInput = ""){
      activePersona = payload.persona || { label: "Warga Umum", description: "Panduan keselamatan digital terarah." };
      activeCredibility = payload.credibility || null;
      const userText = originalInput || input.value.trim() || urlInput.value.trim() || "Pemeriksaan awal situasi";
      consultHistory = [
        { role: "user", content: userText },
        { role: "assistant", content: `${payload.headline || ""}. ${payload.summary || ""}` }
      ];

      const modeLabels={ai:"Pemeriksaan awal dengan AI",rules:"Panduan tanpa AI",urgent:"Prioritaskan tindakan"};
      const urgent=payload.mode==="urgent";
      const related=(Array.isArray(payload.relatedCards)?payload.relatedCards:[]).map(item=>DATA.cards.find(card=>card.id===item.id)).filter(Boolean);
      const official=(Array.isArray(payload.officialLinks)?payload.officialLinks:[]).filter(link=>officialAllowlist.has(link.url));
      const immediate=Array.isArray(payload.immediateActions)&&payload.immediateActions.length?`<div class="urgent-actions"><h3>Lakukan sekarang</h3>${renderList(payload.immediateActions)}</div>`:"";
      const fallbackFeatures=[...(urgent?[{feature:"urgent-help"}]:[]),...related.map(card=>({feature:"guide",cardId:card.id})),...(urgent||related.length?[]:[{feature:"modus-library"}]),...(!urgent?[{feature:"community-patterns"}]:[])].slice(0,3);
      const requestedFeatures=Array.isArray(payload.featureRecommendations)?payload.featureRecommendations:fallbackFeatures;
      const featureKeys=new Set();
      const features=requestedFeatures.map(item=>{
        const reason=String(item?.reason||"").trim().slice(0,140);
        if(item?.feature==="urgent-help")return {key:"urgent-help",label:"Buka bantuan darurat",description:reason||"Amankan uang, akun, dan perangkat.",href:toCleanUrl("bantuan-darurat.html"),iconName:"alert",urgent:true};
        if(item?.feature==="modus-library")return {key:"modus-library",label:"Cari modus serupa",description:reason||"Bandingkan dengan katalog panduan.",href:toCleanUrl("modus.html"),iconName:"book"};
        if(item?.feature==="community-patterns")return {key:"community-patterns",label:"Buka Lapor Warga",description:reason||"Baca contoh anonim atau buat laporan demo.",href:toCleanUrl("laporan.html"),iconName:"users"};
        if(item?.feature==="guide"){
          const card=DATA.cards.find(candidate=>candidate.id===item.cardId);
          if(card)return {key:`guide:${card.id}`,label:card.title,description:reason||"Buka panduan modus terkait.",href:toCleanUrl(`modus-detail.html?id=${encodeURIComponent(card.id)}`),iconName:card.icon||"book"};
        }
        return null;
      }).filter(item=>item&&!featureKeys.has(item.key)&&featureKeys.add(item.key));
      const featureCards=features.map(item=>`<a class="feature-route${item.urgent?" urgent":""}" href="${item.href}"><span class="feature-route-icon">${icon(item.iconName)}</span><span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.description)}</small></span>${icon("arrow")}</a>`).join("");
      const officialActions=official.map(link=>`<a class="btn btn-secondary" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)} ${icon("external")}</a>`).join("");
      const redaction=payload.redaction?.applied?`${Number(payload.redaction.count)||"Beberapa"} bagian sensitif disamarkan sebelum dikirim ke layanan AI${payload.redaction.categories?.length?`: ${payload.redaction.categories.map(escapeHtml).join(", ")}`:""}.`:"Tidak ada pola data sensitif yang terdeteksi otomatis. Tetap periksa kembali teks Anda.";
      const urlPanel=payload.urlAnalysis?`<div class="url-analysis"><div><span class="analysis-mode">${icon("globeLock")} Link tidak dibuka</span><h3 class="result-title">${icon("link")} Pemeriksaan bentuk link (URL)</h3><code>${escapeHtml(payload.urlAnalysis.display||payload.urlAnalysis.host||"Link tidak valid")}</code></div>${payload.urlAnalysis.signals?.length?renderList(payload.urlAnalysis.signals.map(signal=>signal.label)):"<p>Tidak ada tanda yang terlihat dari bentuk link.</p>"}<p class="small muted">${escapeHtml(payload.urlAnalysis.note||"")}</p></div>`:"";
      
      const helpdeskSectionHtml = `
        <section class="consult-helpdesk-session" id="consult-helpdesk-session" aria-label="Sesi Konsultasi Lanjutan">
          <div class="helpdesk-session-header">
            <div class="helpdesk-persona-badge">
              <span class="persona-pill"><span class="persona-icon">${icon("shieldCheck")}</span><strong>Persona: ${escapeHtml(activePersona.label || "Warga Umum")}</strong></span>
              <small class="persona-desc">${escapeHtml(activePersona.description || "Panduan keselamatan digital disesuaikan untuk situasi Anda.")}</small>
            </div>
            ${activeCredibility ? `
            <div class="credibility-gauge-box">
              <div class="gauge-top">
                <span class="gauge-label">${icon("scanSearch")} <strong>${escapeHtml(activeCredibility.label || "Tingkat Risiko Indikasi")}</strong></span>
                <span class="gauge-badge risk-${activeCredibility.level || 'waspada'}">${escapeHtml(activeCredibility.level === 'tinggi' ? 'Risiko Tinggi' : activeCredibility.level === 'waspada' ? 'Waspada' : 'Perlu Verifikasi')}</span>
              </div>
              <div class="gauge-bar-wrap" role="progressbar" aria-valuenow="${activeCredibility.score || 50}" aria-valuemin="0" aria-valuemax="100">
                <div class="gauge-bar-fill risk-${activeCredibility.level || 'waspada'}" style="width:${activeCredibility.score || 50}%"></div>
              </div>
              ${activeCredibility.indicators?.length ? `
              <div class="credibility-signals">
                ${activeCredibility.indicators.map(ind => `<span class="signal-tag">${icon("alert")} ${escapeHtml(ind)}</span>`).join("")}
              </div>` : ""}
            </div>` : ""}
          </div>

          <div class="helpdesk-dialogue" id="helpdesk-dialogue" role="log" aria-live="polite">
            <div class="dialogue-lead">
              <span class="dialogue-lead-title">${icon("chat")} Percakapan Bantuan dan Konsultasi</span>
              <small>Lanjutkan pertanyaan Anda di bawah ini untuk panduan langkah demi langkah.</small>
            </div>
            <div class="dialogue-messages" id="dialogue-messages">
              <div class="chat-bubble user">
                <div>${escapeHtml(userText)}</div>
                <span class="bubble-meta">Pertanyaan Anda</span>
              </div>
              <div class="chat-bubble assistant">
                <div><strong>${escapeHtml(payload.headline || "Hasil Pemeriksaan")}</strong>: ${escapeHtml(payload.summary || "")}</div>
                <span class="bubble-meta">${icon("bot")} Asisten WargaSiaga</span>
              </div>
            </div>
          </div>

          ${Array.isArray(payload.followUpSuggestions) && payload.followUpSuggestions.length ? `
          <div class="helpdesk-quick-suggestions" id="helpdesk-suggestions">
            <span class="suggestions-label">${icon("sparkles")} Pertanyaan yang dapat Anda tanyakan selanjutnya:</span>
            <div class="suggestions-chips" id="suggestions-chips">
              ${payload.followUpSuggestions.map(q => `<button class="suggestion-chip" type="button" data-question="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join("")}
            </div>
          </div>` : `<div class="helpdesk-quick-suggestions hidden" id="helpdesk-suggestions"><div class="suggestions-chips" id="suggestions-chips"></div></div>`}

          <form class="helpdesk-followup-form" id="helpdesk-followup-form">
            <div class="followup-input-wrap">
              <label for="helpdesk-followup-input" class="sr-only">Tanyakan situasi lanjutan</label>
              <textarea id="helpdesk-followup-input" class="followup-textarea" rows="2" maxlength="1000" placeholder="Tanyakan kelanjutan: contoh, cek rekening bank, cara lapor polisi, atau verifikasi pesan baru..."></textarea>
              <div class="followup-actions">
                <button class="btn btn-secondary btn-sm" id="helpdesk-reset-btn" type="button">${icon("trash")} Selesai dan Periksa Baru</button>
                <button class="btn btn-primary btn-sm" id="helpdesk-send-btn" type="submit">${icon("arrow")} Kirim Pertanyaan</button>
              </div>
            </div>
            <div class="helpdesk-error-msg hidden" id="helpdesk-error" role="alert"></div>
          </form>
        </section>`;

      result.innerHTML=`
        <div class="assessment-head${urgent?' urgent-result':''}">
          <div class="result-meta"><span class="analysis-mode">${icon(urgent?"alert":"badgeCheck")} ${escapeHtml(modeLabels[payload.mode]||"Panduan awal")}</span></div>
          <h2>${escapeHtml(payload.headline||"Hasil pemeriksaan awal")}</h2><p>${escapeHtml(payload.summary||"")}</p>
        </div>
        ${immediate}${urlPanel}
        <div class="assessment-grid">
          <div class="info-card"><h3 class="result-title">${icon("scanSearch")} Tanda yang terlihat</h3>${renderList(payload.observedClues)}</div>
          <div class="info-card"><h3 class="result-title">${icon("circleHelp")} Yang tidak dapat dipastikan</h3>${renderList(payload.uncertainties)}</div>
        </div>
        <div class="info-card next-step-card"><h3 class="result-title">${icon("route")} Langkah paling aman berikutnya</h3>${renderList(payload.nextActions)}${featureCards||officialActions?`<div class="next-destinations"><strong>Lanjutkan di WargaSiaga</strong>${featureCards?`<div class="feature-route-grid">${featureCards}</div>`:""}${officialActions?`<div class="official-actions"><span>Layanan resmi terkait</span><div class="inline result-actions">${officialActions}</div></div>`:""}</div>`:""}</div>
        <div class="consult-report-action-card">
          <div class="consult-report-action-content">
            <span class="highlight-pill teal">${icon("shieldCheck")} Aksi Komunitas</span>
            <h3>Jadikan Konsultasi Ini sebagai Laporan Warga</h3>
            <p>AI telah mengidentifikasi pola ini. Teruskan sebagai laporan anonim untuk melindungi warga lain dari modus serupa.</p>
          </div>
          <a class="btn btn-primary btn-sm" id="btn-escalate-report" href="${toCleanUrl("lapor.html")}">${icon("file")} Buat Laporan Warga ${icon("arrow")}</a>
        </div>
        ${(urgent || (activeCredibility && (activeCredibility.level === "tinggi" || activeCredibility.score >= 50))) ? `
        <div class="consult-urgent-escalation-card">
          <div class="consult-urgent-content">
            <span class="highlight-pill urgent">${icon("alert")} Butuh Tindakan Cepat</span>
            <h3>Sudah Terlanjur Transfer Uang atau Membagikan Kode Rahasia?</h3>
            <p>Jangan menunda. Akses bantuan darurat untuk panduan telepon call center bank, naskah bicara resmi, dan draf email aduan ke OJK 157.</p>
          </div>
          <div class="consult-urgent-actions">
            <a class="btn btn-urgent btn-sm" id="btn-escalate-urgent" href="${toCleanUrl("bantuan-darurat.html")}">${icon("phone")} Bantuan Darurat & Draf Laporan ${icon("arrow")}</a>
            <a class="btn btn-secondary btn-sm" href="tel:157">${icon("phone")} Telepon OJK 157</a>
          </div>
        </div>` : ""}
        ${helpdeskSectionHtml}
        <details class="result-disclosure"><summary>${icon("shieldCheck")} Privasi dan batasan</summary><div class="privacy-box"><p>${escapeHtml(redaction)}</p><p>${escapeHtml(payload.notice||"")}</p><p>${escapeHtml(payload.disclaimer||"")}</p><p>${escapeHtml(payload.retention||"")}</p></div></details>`;
      document.getElementById("consult-ready-state")?.classList.add("hidden");
      result.classList.remove("hidden");

      document.getElementById("btn-escalate-report")?.addEventListener("click", () => {
        const rawText = input.value.trim() || "";
        const clues = Array.isArray(payload?.observedClues) ? payload.observedClues.join(". ") : "";
        const prefill = {
          story: rawText || clues || payload?.summary || "",
          channel: (rawText.toLowerCase().includes("whatsapp") || rawText.toLowerCase().includes("wa")) ? "WhatsApp" : (rawText.toLowerCase().includes("telegram") ? "Telegram" : (rawText.toLowerCase().includes("sms") ? "SMS" : (rawText.toLowerCase().includes("email") ? "Email" : "WhatsApp"))),
          type: payload?.relatedCards?.[0]?.id || "",
          url: urlInput.value.trim(),
          evidence: {
            phone: (rawText.match(/(?:\+?62|0)8[1-9][0-9]{6,11}/) || [])[0] || "",
            bank: (rawText.match(/(?:bca|bri|mandiri|bni|bsi|jago|seabank|dana|ovo|gopay)\s*\d{8,18}/i) || [])[0] || "",
            email: (rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || "",
            url: urlInput.value.trim() || (rawText.match(/https?:\/\/[^\s]+/i) || [])[0] || ""
          }
        };
        try {
          sessionStorage.setItem("ws-report-prefill", JSON.stringify(prefill));
        } catch (_) {}
      });

      document.getElementById("btn-escalate-urgent")?.addEventListener("click", () => {
        const rawText = input.value.trim() || "";
        const urgentPrefill = {
          incidents: ["money", "otp"],
          bank: (rawText.match(/(?:bca|bri|mandiri|bni|bsi|jago|seabank|dana|ovo|gopay)\s*\d{8,18}/i) || [])[0] || "",
          contact: (rawText.match(/(?:\+?62|0)8[1-9][0-9]{6,11}/) || [])[0] || "",
          chronology: rawText || payload?.summary || ""
        };
        try {
          sessionStorage.setItem("ws-urgent-prefill", JSON.stringify(urgentPrefill));
        } catch (_) {}
      });

      attachHelpdeskEvents(payload);
      result.focus({preventScroll:true});
      result.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
    }

    form.addEventListener("submit",async event=>{
      event.preventDefault();
      await healthCheck;
      const raw=input.value.trim(), submittedUrl=urlInput.value.trim(), exposure=new FormData(form).get("exposure"), urgent=detectUrgentExposure(raw,exposure);
      currentExposure = exposure || "none";
      const invalid=[];
      if(!exposure)invalid.push(...exposureFields);
      if(!raw&&!submittedUrl)invalid.push(input,urlInput);
      if(!urgent&&aiAvailable!==false&&!consent.checked)invalid.push(consent);
      if(invalid.length){
        const missing=[!exposure?"pilih apakah uang, data, atau akses sudah diberikan":"",!raw&&!submittedUrl?"tulis situasi, tempel link, atau ambil teks dari gambar":"",!urgent&&aiAvailable!==false&&!consent.checked?"setujui analisis AI untuk pemeriksaan ini":""].filter(Boolean).join(", ");
        showFormError(error,`Sebelum memeriksa, ${missing}.`,invalid);
        return;
      }
      clearError();
      if(urgent){renderAssessment(localResult(raw,exposure,true,submittedUrl), raw);return;}
      submit.disabled=true;
      form.setAttribute("aria-busy","true");
      document.getElementById("consult-ready-state")?.classList.add("hidden");
      result.innerHTML=`<div class="ai-loading"><span class="loading-spinner" aria-hidden="true"></span><div><strong>Memeriksa tanda dengan aman…</strong><span>Data sensitif yang terdeteksi akan disamarkan sebelum dikirim ke layanan AI.</span></div></div>`;
      result.classList.remove("hidden");
      const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),18000);
      try{
        const response=await fetch("/api/consult",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({text:raw,url:submittedUrl,exposure,consent:consent.checked}),signal:controller.signal});
        const payload=await response.json().catch(()=>null);
        if(!response.ok)throw new Error(payload?.error?.message||"Layanan belum dapat memproses permintaan.");
        renderAssessment(payload, raw);
      }catch(_){
        renderAssessment(localResult(raw,exposure,false,submittedUrl), raw);
      }finally{
        clearTimeout(timeout);
        submit.disabled=false;
        form.removeAttribute("aria-busy");
      }
    });
  }

  function initUrgent() {
    const choices=[...document.querySelectorAll("#incident-choices input")]; if(!choices.length)return;
    const steps=[...document.querySelectorAll("#emergency-steps .emergency-step")];
    const summary=document.getElementById("incident-summary");
    function update(){
      const chosen=choices.filter(x=>x.checked).map(x=>x.value);
      let visible=0;
      steps.forEach(s=>{
        const tags=s.dataset.for.split(" ");
        const hidden=chosen.length>0&&!tags.includes("all")&&!tags.some(x=>chosen.includes(x));
        s.classList.toggle("hidden",hidden);
        if(!hidden)visible++;
      });
      summary.textContent=chosen.length?`${visible} langkah yang relevan ditampilkan.`:"Semua langkah penting ditampilkan.";
    }
    choices.forEach(c=>c.addEventListener("change",update));
    document.getElementById("print-page")?.addEventListener("click",()=>{toast("Membuka dialog cetak…");window.print();});

    // Copy call script
    document.getElementById("btn-copy-call-script")?.addEventListener("click", () => {
      const scriptText = document.getElementById("call-script-text")?.textContent || "";
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(scriptText);
      }
      toast("Naskah percakapan telepon berhasil disalin ke papan klip.");
    });

    // Official draft generator
    const repName = document.getElementById("draft-reporter-name");
    const suspBank = document.getElementById("draft-suspect-bank");
    const suspAmount = document.getElementById("draft-suspect-amount");
    const suspContact = document.getElementById("draft-suspect-contact");
    const suspChrono = document.getElementById("draft-chronology");
    const previewBox = document.getElementById("draft-preview-text");
    const btnEmailOjk = document.getElementById("btn-email-ojk");
    const btnEmailPolri = document.getElementById("btn-email-polri");
    const btnWaOjk = document.getElementById("btn-wa-ojk");
    const btnCopyDraft = document.getElementById("btn-copy-draft");

    function renderOfficialDraft() {
      if (!previewBox) return "";
      const name = repName?.value.trim() || "[Nama Pelapor atau Korban]";
      const bank = suspBank?.value.trim() || "[Bank dan Nomor Rekening Pelaku]";
      const amount = suspAmount?.value.trim() || "[Perkiraan Nominal Kerugian]";
      const contact = suspContact?.value.trim() || "[Nomor WhatsApp atau Kontak Pelaku]";
      const chrono = suspChrono?.value.trim() || "[Kronologi singkat kejadian transaksi penipuan]";

      const dateStr = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date());

      const text = `Kepada Yth.
Otoritas Jasa Keuangan (OJK) / Satgas PASTI / Layanan Konsumen 157
dan Direktorat Tindak Pidana Siber Bareskrim Polri

Perihal: Laporan Dugaan Tindak Pidana Penipuan Transaksi Keuangan Digital

Dengan hormat,
Saya yang bertanda tangan di bawah ini:
Nama Pelapor: ${name}
Tanggal Kejadian: ${dateStr}

Bermaksud menyampaikan laporan dugaan penipuan transaksi digital dengan rincian data terduga pelaku sebagai berikut:
- Rekening Tujuan Pelaku: ${bank}
- Kontak WhatsApp atau Telepon Pelaku: ${contact}
- Estimasi Kerugian Finansial: ${amount}

Kronologi Singkat:
${chrono}

Mohon bantuan dan koordinasi pihak berwenang untuk pemblokiran rekening tujuan pelaku melalui sistem IASC OJK serta proses penegakan hukum kepolisian.

Terima kasih atas perhatian dan perlindungan kepada konsumen.`;

      previewBox.textContent = text;

      const subject = `Laporan Penipuan Transaksi Keuangan - ${bank}`;
      if (btnEmailOjk) {
        btnEmailOjk.href = `mailto:konsumen@ojk.go.id?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      }
      if (btnEmailPolri) {
        btnEmailPolri.href = `mailto:patrolisiber@polri.go.id?subject=${encodeURIComponent("Laporan Aduan Siber Penipuan - " + bank)}&body=${encodeURIComponent(text)}`;
      }
      if (btnWaOjk) {
        btnWaOjk.href = `https://wa.me/6281157157157?text=${encodeURIComponent("Halo Layanan OJK 157, saya ingin menyampaikan laporan dugaan penipuan transaksi keuangan:\n\n" + text)}`;
      }
      return text;
    }

    [repName, suspBank, suspAmount, suspContact, suspChrono].forEach(el => {
      el?.addEventListener("input", renderOfficialDraft);
    });

    btnCopyDraft?.addEventListener("click", () => {
      const text = renderOfficialDraft();
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      }
      toast("Draf laporan resmi berhasil disalin ke papan klip.");
    });

    // Check prefill from AI consultation
    try {
      const rawPrefill = sessionStorage.getItem("ws-urgent-prefill");
      if (rawPrefill) {
        const prefill = JSON.parse(rawPrefill);
        sessionStorage.removeItem("ws-urgent-prefill");
        if (Array.isArray(prefill.incidents)) {
          choices.forEach(ch => {
            if (prefill.incidents.includes(ch.value)) ch.checked = true;
          });
          update();
        }
        if (suspBank && prefill.bank) suspBank.value = prefill.bank;
        if (suspContact && prefill.contact) suspContact.value = prefill.contact;
        if (suspChrono && prefill.chronology) suspChrono.value = prefill.chronology;
        toast("Data dari konsultasi AI telah dipindahkan ke draf laporan darurat.");
      }
    } catch (_) {}

    // Check modus param from URL
    try {
      const urgentUrlParams = new URLSearchParams(location.search);
      const urgentModus = urgentUrlParams.get("modus");
      if (urgentModus) {
        const card = DATA.cards.find(c => c.id === urgentModus || c.slug === urgentModus);
        if (card) {
          if (["bank-otp", "apk-phishing", "game-reward-account"].includes(card.id)) {
            choices.forEach(ch => { if (ch.value === "otp" || ch.value === "access") ch.checked = true; });
          }
          if (["job-deposit", "investment-return", "prize-refund", "recovery-scam", "illegal-online-loan", "family-emergency", "romance-scam", "marketplace-diversion", "invoice-redirection"].includes(card.id)) {
            choices.forEach(ch => { if (ch.value === "money") ch.checked = true; });
          }
          update();
        }
      }
    } catch (_) {}

    renderOfficialDraft();
  }

  function initReport() {
    const form=document.getElementById("report-form"); if(!form)return;
    const story=document.getElementById("report-story"), error=document.getElementById("report-error"), type=document.getElementById("report-type"), customType=document.getElementById("report-type-other"), customTypeWrap=document.getElementById("report-type-other-wrap");
    const requiredFields=()=>[...form.querySelectorAll('[data-step="1"] [required]')];
    function updateCustomType(){const active=type.value==="other";customTypeWrap.classList.toggle("hidden",!active);customType.required=active;if(!active){customType.value="";customType.removeAttribute("aria-invalid");clearRequiredQuestion(customType);}}
    story.addEventListener("input",()=>document.getElementById("report-count").textContent=story.value.length);
    type.addEventListener("change",updateCustomType);
    form.addEventListener("input",()=>clearFormError(error,requiredFields()));
    form.addEventListener("change",()=>clearFormError(error,requiredFields()));

    let prefill = null;
    try {
      const raw = sessionStorage.getItem("ws-report-prefill");
      if (raw) {
        prefill = JSON.parse(raw);
        sessionStorage.removeItem("ws-report-prefill");
      }
    } catch (_) {}

    if (prefill) {
      const notice = document.getElementById("prefill-notice");
      if (notice) {
        notice.innerHTML = `${icon("sparkles")} <strong>Data Terisi dari AI:</strong> Informasi dari konsultasi Anda telah dipindahkan otomatis. Silakan lengkapi bukti di bawah.`;
        notice.classList.remove("hidden");
      }
      if (prefill.story && !story.value) {
        story.value = prefill.story;
        document.getElementById("report-count").textContent = story.value.length;
      }
      if (prefill.channel) {
        const chanEl = document.getElementById("report-channel");
        if ([...chanEl.options].some(o => o.value.toLowerCase() === prefill.channel.toLowerCase())) {
          chanEl.value = prefill.channel;
        }
      }
      document.getElementById("report-period").value = "7 hari terakhir";
      if (prefill.type) {
        const matchingCard = [...type.options].find(o => o.value === prefill.type);
        if (matchingCard) type.value = prefill.type;
      }
      if (prefill.evidence) {
        if (prefill.evidence.phone && document.getElementById("report-evidence-phone")) document.getElementById("report-evidence-phone").value = prefill.evidence.phone;
        if (prefill.evidence.bank && document.getElementById("report-evidence-bank")) document.getElementById("report-evidence-bank").value = prefill.evidence.bank;
        if (prefill.evidence.email && document.getElementById("report-evidence-contact")) document.getElementById("report-evidence-contact").value = prefill.evidence.email;
        if (prefill.evidence.url && document.getElementById("report-evidence-url")) document.getElementById("report-evidence-url").value = prefill.evidence.url;
      }
    }

    // Check modus param from URL
    try {
      const reportParams = new URLSearchParams(location.search);
      const modusQuery = reportParams.get("modus");
      if (modusQuery && !prefill) {
        const matchingCard = [...type.options].find(o => o.value === modusQuery);
        if (matchingCard) {
          type.value = modusQuery;
          const cObj = DATA.cards.find(c => c.id === modusQuery);
          const notice = document.getElementById("prefill-notice");
          if (notice && cObj) {
            notice.innerHTML = `
              <div class="prefill-notice-content">
                <div>${icon("sparkles")} <strong>Pola Terpilih Otomatis:</strong> Modus “${escapeHtml(cObj.title)}” dari panduan yang baru Anda baca telah diterapkan pada laporan ini. Lengkapi cerita dan bukti Anda di bawah.</div>
                <button class="btn-text-xs" type="button" id="btn-clear-report-modus">${icon("close")} Ganti Pola</button>
              </div>`;
            notice.classList.remove("hidden");
            document.getElementById("btn-clear-report-modus")?.addEventListener("click", () => {
              type.value = "";
              story.value = "";
              document.getElementById("report-count").textContent = "0";
              notice.classList.add("hidden");
            });
          }
          if (!story.value.trim() && cObj) {
            story.value = `Saya ingin melaporkan dugaan penipuan terkait modus "${cObj.title}":\n\nKronologi kejadian:\n`;
            document.getElementById("report-count").textContent = story.value.length;
          }
          if (cObj?.channels?.length) {
            const chanEl = document.getElementById("report-channel");
            if ([...chanEl.options].some(o => o.value.toLowerCase() === cObj.channels[0].toLowerCase())) {
              chanEl.value = cObj.channels[0];
            }
          }
          document.getElementById("report-period").value = "7 hari terakhir";
        }
      }
    } catch (_) {}

    document.getElementById("btn-report-to-consult")?.addEventListener("click", () => {
      const currentDraft = story.value.trim();
      if (currentDraft) {
        try { sessionStorage.setItem("ws-consult-draft", currentDraft); } catch (_) {}
      }
      location.assign(toCleanUrl("konsultasi.html?from=lapor"));
    });

    const fileInput = document.getElementById("report-evidence-file");
    const filePreview = document.getElementById("report-file-preview");
    const fileName = document.getElementById("report-file-name");
    const fileRemove = document.getElementById("report-file-remove");
    let currentEvidenceFileName = "";
    fileInput?.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      currentEvidenceFileName = file.name;
      if (fileName) fileName.textContent = file.name;
      filePreview?.classList.remove("hidden");
    });
    fileRemove?.addEventListener("click", () => {
      if (fileInput) fileInput.value = "";
      currentEvidenceFileName = "";
      filePreview?.classList.add("hidden");
    });

    function go(step){
      if(step===2){
        const fields=requiredFields();
        const missing=fields.filter(field=>fieldIsMissing(field));
        if(missing.length){
          const labels=missing.map(field=>document.querySelector(`label[for="${field.id}"]`)?.textContent.trim()).filter(Boolean);
          showFormError(error,`Lengkapi bidang berikut: ${labels.join(", ")}.`,missing);
          return;
        }
        clearFormError(error,fields);
      }
      document.querySelectorAll("[data-step]").forEach(x=>x.classList.toggle("hidden",Number(x.dataset.step)!==step));
      document.querySelectorAll("[data-progress]").forEach(x=>{
        const current=Number(x.dataset.progress);
        x.classList.toggle("active",current<=step);
        if(current===step)x.setAttribute("aria-current","step");else x.removeAttribute("aria-current");
      });
      if(step===2){
        document.getElementById("preview-channel").textContent=document.getElementById("report-channel").value;
        document.getElementById("preview-period").textContent=document.getElementById("report-period").value;
        const typeLabel=type.value==="other"?customType.value:type.selectedOptions[0]?.textContent||"";
        document.getElementById("preview-type").innerHTML=renderRedactedText(typeLabel);
        document.getElementById("preview-story").innerHTML=renderRedactedText(story.value);

        const evList = document.getElementById("preview-evidence-list");
        if (evList) {
          const p = document.getElementById("report-evidence-phone")?.value.trim() || "";
          const b = document.getElementById("report-evidence-bank")?.value.trim() || "";
          const c = document.getElementById("report-evidence-contact")?.value.trim() || "";
          const u = document.getElementById("report-evidence-url")?.value.trim() || "";
          const items = [];
          if (p) items.push(`<div class="preview-evidence-item"><strong>Nomor Kontak Terduga:</strong> ${renderRedactedText(p)}</div>`);
          if (b) items.push(`<div class="preview-evidence-item"><strong>Rekening Bank Terduga:</strong> ${renderRedactedText(b)}</div>`);
          if (c) items.push(`<div class="preview-evidence-item"><strong>Akun / Email Terduga:</strong> ${renderRedactedText(c)}</div>`);
          if (u) items.push(`<div class="preview-evidence-item"><strong>Tautan / Link Terduga:</strong> ${renderRedactedText(u)}</div>`);
          if (currentEvidenceFileName) items.push(`<div class="preview-evidence-item"><strong>Tangkapan Layar Bukti:</strong> <span class="tag">${escapeHtml(currentEvidenceFileName)}</span> (privasi gambar dianalisis lokal)</div>`);
          if (!items.length) items.push(`<p class="muted" style="margin:0;font-size:12px">Tidak ada data bukti pendukung tambahan yang disertakan.</p>`);
          evList.innerHTML = items.join("");
        }
      }
      const heading=document.querySelector(`[data-step="${step}"] h2`);
      heading?.focus({preventScroll:true});
      heading?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
    }
    document.querySelectorAll("[data-next]").forEach(b=>b.addEventListener("click",()=>go(Number(b.dataset.next))));
    document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>go(Number(b.dataset.back))));
    const consent=document.getElementById("report-consent"), submit=document.getElementById("submit-demo");
    consent.addEventListener("change",()=>submit.disabled=!consent.checked);
    form.addEventListener("submit",e=>{
      e.preventDefault();
      if(!consent.checked)return;

      const pVal = document.getElementById("report-evidence-phone")?.value.trim() || "";
      const bVal = document.getElementById("report-evidence-bank")?.value.trim() || "";
      const cVal = document.getElementById("report-evidence-contact")?.value.trim() || "";
      const uVal = document.getElementById("report-evidence-url")?.value.trim() || "";

      fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: document.getElementById("report-channel").value,
          period: document.getElementById("report-period").value,
          type: type.value,
          story: story.value,
          evidence: { phone: pVal, bank: bVal, email: cVal, url: uVal }
        })
      }).then(r => r.ok ? r.json() : null).then(data => {
        if (data?.code) {
          const codeEl = document.getElementById("report-success-code");
          if (codeEl) codeEl.textContent = data.code;
          const linkEl = document.getElementById("report-success-status-link");
          if (linkEl) linkEl.href = toCleanUrl(`status-laporan.html?code=${encodeURIComponent(data.code)}`);
        }
      }).catch(() => {});

      form.classList.add("hidden");
      document.querySelector(".progress").classList.add("hidden");
      const success=document.getElementById("report-success");
      success.classList.remove("hidden");
      success.focus();
    });
    updateCustomType();
  }

  function initStatus() {
    const form=document.getElementById("status-form"); if(!form)return;
    const input=document.getElementById("status-code"), result=document.getElementById("status-result"), empty=document.getElementById("status-empty"), error=document.getElementById("status-error");
    const query=new URLSearchParams(location.search).get("code");
    if(query)input.value=query;
    input.addEventListener("input",()=>clearFormError(error,[input]));

    function updateResultView(code, reportData) {
      const titleElem = document.getElementById("status-title-val");
      if (titleElem) titleElem.textContent = `Laporan ${code}`;
      const subElem = document.getElementById("status-sub-val");
      if (subElem) subElem.textContent = "Tahap peninjauan komunitas dan validasi awal sistem";
      const scoreElem = document.getElementById("status-score-val");
      if (scoreElem) scoreElem.textContent = reportData?.verdict ? `Status: ${reportData.verdict}` : "Status: Ditandai Sistem untuk Peninjauan";
      const summaryElem = document.getElementById("status-summary-val");
      if (summaryElem && reportData?.summary) summaryElem.textContent = reportData.summary;

      const findingsList = document.getElementById("status-findings-list");
      if (findingsList && Array.isArray(reportData?.verifiedFindings) && reportData.verifiedFindings.length) {
        findingsList.innerHTML = reportData.verifiedFindings.map(f => `
          <div class="finding-item">
            <span class="finding-badge">${icon("check")} ${escapeHtml(f.label)}:</span>
            <span>${renderRedactedText(f.value)} · ${escapeHtml(f.note)}</span>
          </div>
        `).join("");
      }
    }

    const refreshBtn = document.getElementById("status-refresh-btn");
    refreshBtn?.addEventListener("click", () => {
      const code = input.value.trim().toUpperCase() || "WS-DEMO-2401";
      refreshBtn.classList.add("spinning");
      toast("Memeriksa pembaharuan status dengan pipeline AI...");
      fetch(`api/report/status?code=${encodeURIComponent(code)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.report) updateResultView(code, data.report);
          toast("Pemeriksaan AI diperbarui: Status terverifikasi aktif.");
        })
        .catch(() => {
          toast("Status laporan terverifikasi dan aktif di komunitas.");
        })
        .finally(() => {
          setTimeout(() => refreshBtn.classList.remove("spinning"), 500);
        });
    });

    form.addEventListener("submit",e=>{
      e.preventDefault();
      const code=input.value.trim().toUpperCase();
      if(!code){
        result.classList.add("hidden");
        empty.classList.add("hidden");
        showFormError(error,"Masukkan kode laporan demo sebelum memeriksa status.",[input]);
        return;
      }
      clearFormError(error,[input]);
      const ok=code==="WS-DEMO-2401" || code.startsWith("WS-");
      result.classList.toggle("hidden",!ok);
      empty.classList.toggle("hidden",ok);
      const next=new URLSearchParams();
      next.set("code",code);
      history.replaceState(null,"",`${location.pathname}?${next}`);
      if(ok){
        updateResultView(code, null);
        result.focus();
        fetch(`/api/report/status?code=${encodeURIComponent(code)}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data?.report) updateResultView(code, data.report);
          })
          .catch(() => {});
      } else {
        empty.focus();
      }
    });
    if(query)form.requestSubmit();
  }

  function initDetail() {
    try {
      const detailParams = new URLSearchParams(location.search);
      const reqId = detailParams.get("id");
      const card = DATA.cards.find(c => c.id === reqId || c.slug === reqId);
      if (card) {
        const category = MODUS_CATEGORIES.find(c => c.cardIds?.includes(card.id) || c.id === card.categoryId) || MODUS_CATEGORIES[1];
        sessionStorage.setItem("ws-last-viewed-modus", JSON.stringify({
          id: card.id,
          slug: card.slug,
          title: card.title,
          summary: card.summary,
          example: card.fictionalExample,
          categoryId: category.id,
          categoryLabel: category.label,
          channels: card.channels,
          warningSigns: card.warningSigns,
          timestamp: Date.now()
        }));
      }
    } catch (_) {}

    const field=document.getElementById("share-url"), button=document.getElementById("share-guide");
    if(field)field.value=location.href;
    button?.addEventListener("click",async()=>{const disclosure=button.closest("details");if(disclosure)disclosure.open=true;try{await navigator.clipboard.writeText(location.href);button.innerHTML=`${icon("check")} Tautan disalin`;toast("Tautan panduan disalin");setTimeout(()=>button.innerHTML=`${icon("copy")} Salin tautan`,1800);}catch(_){field?.focus();field?.select();toast("Tautan dipilih. Tekan Ctrl+C untuk menyalin.");}});
    const dialog=document.getElementById("capture-dialog"), open=document.getElementById("capture-open"), close=document.getElementById("capture-close");
    open?.addEventListener("click",()=>dialog?.showModal());
    close?.addEventListener("click",()=>{dialog?.close();open?.focus();});
    dialog?.addEventListener("click",event=>{const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();});
    dialog?.addEventListener("close",()=>open?.focus());
  }

  function initReportsList() {
    const tabs = document.querySelectorAll("[data-report-category-id]");
    const cards = document.querySelectorAll(".report-card[data-report-cat]");
    if (!tabs.length || !cards.length) return;

    let recentModus = null;
    try {
      const rawRecent = sessionStorage.getItem("ws-last-viewed-modus");
      if (rawRecent) recentModus = JSON.parse(rawRecent);
    } catch (_) {}

    function applyCategory(catId) {
      tabs.forEach(t => {
        const isMatch = t.dataset.reportCategoryId === catId;
        t.classList.toggle("active", isMatch);
        t.setAttribute("aria-selected", String(isMatch));
      });
      cards.forEach(c => {
        const match = catId === "all" || c.dataset.reportCat === catId;
        c.classList.toggle("hidden", !match);
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        applyCategory(tab.dataset.reportCategoryId);
      });
    });

    if (recentModus) {
      const cat = MODUS_CATEGORIES.find(c => c.cardIds?.includes(recentModus.id) || c.id === recentModus.categoryId);
      if (cat && cat.id !== "all") {
        applyCategory(cat.id);
        const container = document.getElementById("report-category-group")?.closest(".category-classification");
        if (container) {
          const banner = document.createElement("div");
          banner.className = "report-context-banner";
          banner.id = "report-recent-context-banner";
          banner.innerHTML = `
            <div class="context-banner-text">
              <span class="highlight-pill teal">${icon("sparkles")} Modus Terkait dari Panduan</span>
              <strong>Menampilkan Laporan Kategori: ${escapeHtml(cat.label)}</strong>
              <p>Disesuaikan dengan panduan “${escapeHtml(recentModus.title)}” yang baru Anda baca. Lihat laporan yang dibagikan sesama warga.</p>
            </div>
            <div class="context-banner-actions">
              <a class="btn btn-primary btn-sm" href="${toCleanUrl(`lapor.html?modus=${encodeURIComponent(recentModus.id)}`)}">${icon("file")} Buat Laporan Kasus Ini</a>
              <button class="btn btn-ghost btn-sm" id="btn-show-all-reports" type="button">Tampilkan Semua Kategori</button>
            </div>`;
          container.parentNode.insertBefore(banner, container);
          document.getElementById("btn-show-all-reports")?.addEventListener("click", () => {
            applyCategory("all");
            banner.remove();
          });
        }
      }
    }
  }

  function normalizeUrlBar() {
    try {
      const p = window.location.pathname;
      if (p.endsWith(".html") || p.includes(".html")) {
        const clean = p.replace(/\/index\.html$/, "/")
                       .replace(/index\.html$/, "")
                       .replace(/\.html$/, "");
        window.history.replaceState(null, "", (clean || "/") + window.location.search + window.location.hash);
      }
    } catch (_) {}
  }

  function initCleanNavigation() {
    normalizeUrlBar();
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest("a");
      if (!anchor || !anchor.getAttribute("href")) return;
      const rawHref = anchor.getAttribute("href");
      if (rawHref.startsWith("http:") || rawHref.startsWith("https:") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:") || rawHref.startsWith("#")) return;
      if (rawHref.includes(".html")) {
        anchor.setAttribute("href", toCleanUrl(rawHref));
      }
    }, true);
  }

  window.WS_UTILS = Object.freeze({ redactSensitive, detectUrgentExposure, escapeHtml });

  initCleanNavigation(); initShell(); initHomeAsk(); initFilters(); initConsult(); initUrgent(); initReport(); initStatus(); initDetail(); initReportsList();
})();
