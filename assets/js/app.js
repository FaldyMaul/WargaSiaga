import safetyOrbitUrl from "../images/wargasiaga-safety-orbit.svg?url";
import homeCheckUrl from "../images/wargasiaga-home-check.webp?url";
import aiInputsUrl from "../images/wargasiaga-ai-inputs.webp?url";
import communityUrl from "../images/wargasiaga-community.webp?url";
import literacyKeysUrl from "../images/wargasiaga-literasi-data-pribadi.webp?url";
import { LUCIDE_ICONS } from "./lucide-icons.js";

(function () {
  "use strict";

  const DATA = window.WS_DATA || { cards: [], reports: [] };
  const AGE_GROUPS = [
    { value:"all", label:"Semua umur", short:"Semua" },
    { value:"kids", label:"Anak", description:"hingga 12 tahun" },
    { value:"teens", label:"Remaja", description:"13–17 tahun" },
    { value:"adults", label:"Dewasa", description:"18–59 tahun" },
    { value:"elderly", label:"Lansia", description:"60 tahun ke atas" }
  ];
  const AGE_GUIDANCE = {
    kids:"Minta orang tua, wali, guru, atau orang dewasa tepercaya membantu memeriksa. Anda tidak perlu menanganinya sendirian.",
    teens:"Jika ada tekanan, ancaman, atau permintaan data, libatkan orang dewasa tepercaya sebelum melanjutkan.",
    adults:"Periksa melalui kanal resmi yang Anda buka sendiri dan libatkan orang tepercaya bila keputusan terasa mendesak.",
    elderly:"Bila perlu, periksa bersama orang yang dipercaya tanpa memberikan kendali akun, PIN, OTP, atau perangkat."
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

  function sectionFor(active) {
    if (["detail"].includes(active)) return "modus";
    if (["report-form", "report-status"].includes(active)) return "reports";
    return active;
  }

  function header() {
    const current = sectionFor(page);
    return `
      <a class="skip-link" href="#main-content">Lewati ke konten utama</a>
      <div class="notice-bar"><div class="container"><span class="notice-dot"></span>Panduan independen · bukan layanan pemerintah</div></div>
      <header class="site-header">
        <div class="container header-row">
          <a class="brand" href="index.html" aria-label="WargaSiaga, beranda"><span class="brand-mark">${icon("shield")}</span><span>WargaSiaga</span></a>
          <nav class="desktop-nav" aria-label="Navigasi utama">
            ${nav.map(([key, href, label]) => `<a class="nav-link${current === key ? " active" : ""}" href="${href}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          </nav>
          <div class="header-actions">
            <button class="icon-button" id="contrast-toggle" type="button" aria-label="Aktifkan kontras tinggi" aria-pressed="false" title="Aktifkan kontras tinggi">${icon("eye")}</button>
            <a class="urgent-header" href="bantuan-darurat.html">${icon("alert")} Bantuan sekarang</a>
            <button class="icon-button menu-button" id="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Buka menu">${icon("menu")}</button>
          </div>
        </div>
        <nav class="mobile-menu" id="mobile-menu" aria-label="Navigasi seluler">
          ${nav.map(([key, href, label]) => `<a class="nav-link${current === key ? " active" : ""}" href="${href}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          <a class="nav-link" href="bantuan-darurat.html">Butuh bantuan sekarang</a>
        </nav>
      </header>`;
  }

  function footer() {
    const current = sectionFor(page);
    return `
      <footer class="site-footer">
        <div class="container footer-compact"><a class="brand" href="index.html"><span class="brand-mark">${icon("shield")}</span><span>WargaSiaga</span></a><nav aria-label="Tautan footer"><a href="konsultasi.html">Periksa dengan AI</a><a href="bantu-orang-lain.html">Bantu orang lain</a><a href="bantuan-darurat.html">Bantuan darurat</a><a href="tentang.html#layanan-resmi">Layanan resmi</a><a href="tentang.html#privasi">Privasi</a></nav></div>
        <div class="container footer-bottom"><span>© 2026 WargaSiaga · Prototipe independen</span><span>Jangan bagikan OTP, PIN, atau kata sandi.</span></div>
      </footer>
      <nav class="mobile-bottom-nav" aria-label="Navigasi cepat">
        <a class="bottom-link${page === "home" ? " active" : ""}" href="index.html"${page === "home" ? ' aria-current="page"' : ""}>${icon("home")}<span>Beranda</span></a>
        <a class="bottom-link${current === "consult" ? " active" : ""}" href="konsultasi.html"${current === "consult" ? ' aria-current="page"' : ""}>${icon("chat")}<span>Tanya</span></a>
        <a class="bottom-link${current === "modus" ? " active" : ""}" href="modus.html"${current === "modus" ? ' aria-current="page"' : ""}>${icon("search")}<span>Modus</span></a>
        <a class="bottom-link urgent${page === "urgent" ? " active" : ""}" href="bantuan-darurat.html"${page === "urgent" ? ' aria-current="page"' : ""}>${icon("alert")}<span>Darurat</span></a>
      </nav>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
  }

  function shell(content) { return `${header()}<main id="main-content">${content}</main>${footer()}`; }
  function arrowLink(label, href) { return `<a class="text-link" href="${href}">${label}${icon("arrow")}</a>`; }
  function crumb(items) { return `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Beranda</a><span>/</span>${items.map((x, i) => i === items.length - 1 ? `<span aria-current="page">${x[0]}</span>` : `<a href="${x[1]}">${x[0]}</a><span>/</span>`).join("")}</nav>`; }

  function modusCard(card) {
    return `<article class="modus-card" data-accent="${card.accent}" data-card-id="${card.id}" data-search="${[card.title,card.summary,...card.channels,...card.contexts,...card.tactics].join(" ").toLowerCase()}">
      <div class="card-accent"></div><div class="modus-card-body"><div class="card-top"><span class="card-icon">${icon(card.icon)}</span><span class="risk-badge">Perlu diwaspadai</span></div>
      <h3><a data-guide-link href="modus-detail.html?id=${card.id}">${card.title}</a></h3><p>${card.summary}</p><div class="card-audience">${icon("users")}<span>${card.ageGroups.map(value=>AGE_GROUPS.find(group=>group.value===value)?.label).filter(Boolean).join(" · ")}</span></div><div class="tag-row">${card.channels.slice(0,2).map(x=>`<span class="tag">${x}</span>`).join("")}</div>
      <div class="card-footer"><a class="text-link" data-guide-link href="modus-detail.html?id=${card.id}">Buka panduan${icon("arrow")}</a></div></div></article>`;
  }

  function formatDate(date) {
    try { return new Intl.DateTimeFormat("id-ID", { day:"numeric", month:"short", year:"numeric" }).format(new Date(`${date}T00:00:00`)); }
    catch (_) { return date; }
  }

  function homePage() {
    return shell(`
      <section class="hero"><div class="container hero-grid">
        <div><span class="eyebrow icon-label">${icon("sparkles")} Tanya WargaSiaga</span><h1>Ada pesan yang membuat Anda ragu?</h1><p>Tulis singkat apa yang terjadi. AI akan memetakan tanda dan mengarahkan Anda ke fitur yang tepat.</p>
          <form class="hero-ask" id="home-ask-form" novalidate><label for="home-ask"><strong>Apa yang ingin Anda periksa?</strong><span>Jangan sertakan OTP, PIN, atau kata sandi.</span></label><div class="hero-ask-control"><textarea id="home-ask" maxlength="600" required aria-describedby="home-ask-error" placeholder="Contoh: Saya diminta membayar deposit sebelum mulai bekerja."></textarea><button class="btn btn-primary btn-prominent" type="submit">${icon("bot")} Tanya AI</button></div><div class="form-error hidden" id="home-ask-error" role="alert" tabindex="-1"></div></form>
          <a class="hero-emergency-link" href="bantuan-darurat.html">${icon("alert")}<span>Sudah terlanjur kirim uang atau data?<strong>Buka bantuan sekarang</strong></span>${icon("arrow")}</a>
          <div class="trust-row"><span class="trust-item">${icon("lock")} Rahasia disamarkan</span><span class="trust-item">${icon("shieldCheck")} Bukan vonis otomatis</span></div>
        </div>
        <aside class="hero-panel" aria-labelledby="scenario-title"><div class="hero-media"><img class="hero-illustration" src="${homeCheckUrl}" width="1280" height="853" alt="" aria-hidden="true" fetchpriority="high"><img class="hero-safety-mark" src="${safetyOrbitUrl}" width="82" height="82" alt="" aria-hidden="true"></div><div class="hero-panel-intro"><div><span class="pulse-label">Pilih cepat</span><h2 id="scenario-title">Situasi saya</h2></div></div>
          <div class="scenario-list">
            <a class="scenario-link" href="modus.html?context=Pencari%20kerja"><span class="scenario-icon">${icon("briefcase")}</span><span class="scenario-text"><strong>Ditawari kerja atau tugas</strong><span>Diminta deposit atau isi saldo</span></span><span class="scenario-arrow">${icon("arrow")}</span></a>
            <a class="scenario-link" href="modus.html?context=Belanja%20online"><span class="scenario-icon">${icon("bag")}</span><span class="scenario-text"><strong>Sedang jual-beli online</strong><span>Diajak keluar dari marketplace</span></span><span class="scenario-arrow">${icon("arrow")}</span></a>
            <a class="scenario-link" href="modus.html?context=Keluarga"><span class="scenario-icon">${icon("users")}</span><span class="scenario-text"><strong>Mengatasnamakan orang dekat</strong><span>Ada permintaan uang mendadak</span></span><span class="scenario-arrow">${icon("arrow")}</span></a>
          </div>
        </aside>
      </div></section>
      <section class="section-sm"><div class="container"><div class="urgent-banner compact"><span class="urgent-banner-icon">${icon("alert")}</span><div><h2>Sudah terlanjur kirim uang atau data?</h2><p>Lewati pemeriksaan. Amankan akun dan transaksi sekarang.</p></div><a class="btn btn-urgent" href="bantuan-darurat.html">Buka langkah darurat</a></div></div></section>
      <section class="section"><div class="container"><div class="section-heading-row"><div><span class="eyebrow">Jalur lain</span><h2 class="section-title">Pilih tujuan</h2></div></div><div class="route-grid">
        <a class="route-card" href="modus.html"><span class="route-icon">${icon("book")}</span><span><strong>Kenali modus</strong><small>Cari pola berdasarkan situasi</small></span>${icon("arrow")}</a>
        <a class="route-card" href="laporan.html"><span class="route-icon">${icon("users")}</span><span><strong>Lapor warga</strong><small>Lihat contoh atau buat laporan</small></span>${icon("arrow")}</a>
        <a class="route-card" href="bantu-orang-lain.html"><span class="route-icon">${icon("users")}</span><span><strong>Bantu orang terdekat</strong><small>Mulai percakapan tanpa menyalahkan</small></span>${icon("arrow")}</a>
        <a class="route-card" href="tentang.html"><span class="route-icon">${icon("shieldCheck")}</span><span><strong>Tentang & sumber</strong><small>Batasan dan layanan resmi</small></span>${icon("arrow")}</a>
      </div></div></section>`);
  }

  function modusPage() {
    const channels = [...new Set(DATA.cards.flatMap(c=>c.channels))].sort();
    const contexts = [...new Set(DATA.cards.flatMap(c=>c.contexts))].sort();
    return shell(`
      <section class="page-hero compact-hero"><div class="container page-hero-row"><div>${crumb([["Kenali Modus"]])}<span class="eyebrow">Katalog panduan</span><h1 class="section-title">Cari modus yang mirip</h1><p class="section-copy">Pilih kelompok usia, lalu cari berdasarkan pesan atau situasi.</p></div><a class="urgent-shortcut" href="bantuan-darurat.html">${icon("alert")}<span><strong>Sudah terlanjur?</strong><small>Buka bantuan sekarang</small></span>${icon("arrow")}</a></div></section>
      <section class="section-sm"><div class="container"><fieldset class="age-selector" id="age-selector" aria-describedby="age-selector-help"><legend><span class="eyebrow">Langkah 1</span><strong>Panduan ini untuk siapa?</strong></legend><p id="age-selector-help">Pilih usia orang yang menghadapi situasi ini. Pilihan hanya memfilter panduan dan tidak disimpan.</p><div class="age-options">${AGE_GROUPS.map((group,index)=>`<label><input type="radio" name="age" value="${group.value}"${index===0?" checked":""}><span><strong>${group.label}</strong>${group.description?`<small>${group.description}</small>`:""}</span></label>`).join("")}</div></fieldset></div></section>
      <section class="section-sm catalog-section"><div class="container filter-shell">
        <aside class="filter-panel" id="filter-panel" aria-label="Filter modus"><div class="spread"><strong>Filter panduan</strong><button class="btn btn-ghost" id="reset-filter" type="button">Hapus filter</button></div>
          <div class="filter-group"><span class="filter-title">Cara dihubungi</span>${channels.map(v=>`<label class="check"><input type="checkbox" name="channel" value="${v}"><span>${v}</span></label>`).join("")}</div>
          <div class="filter-group"><span class="filter-title">Situasi saya</span>${contexts.map(v=>`<label class="check"><input type="checkbox" name="context" value="${v}"><span>${v}</span></label>`).join("")}</div>
        </aside>
        <div><div class="catalog-step-label"><span class="eyebrow">Langkah 2</span><strong>Cari atau gunakan filter tambahan</strong></div><div class="search-box">${icon("search")}<label class="sr-only" for="modus-search">Cari modus</label><input id="modus-search" type="search" placeholder="Cari: lowongan, OTP, marketplace…" autocomplete="off"><button class="search-clear hidden" id="search-clear" type="button" aria-label="Hapus pencarian">${icon("close")}</button></div>
          <h2 class="sr-only" id="catalog-heading">Daftar panduan modus</h2><div class="result-toolbar"><span class="result-count" id="result-count" role="status" aria-live="polite">${DATA.cards.length} panduan ditemukan</span><button class="btn btn-secondary mobile-filter" id="filter-toggle" type="button" aria-expanded="false" aria-controls="filter-panel">${icon("filter")} Filter</button></div><div class="active-filters hidden" id="active-filters" aria-label="Filter aktif"></div>
          <div class="cards-grid catalog-grid" id="modus-grid">${DATA.cards.map(modusCard).join("")}</div>
        </div>
      </div></section>
      <section class="section-sm surface-section"><div class="container literacy-strip"><div class="literacy-visual"><img src="${literacyKeysUrl}" width="516" height="580" loading="lazy" alt="Ilustrasi gantungan kunci sebagai pengingat untuk menjaga akses akun"></div><div class="literacy-copy"><span class="eyebrow">Ingat tiga hal</span><h2>Data akun adalah kunci digital Anda</h2><div class="habit-list"><span>${icon("lock")} Jangan berikan OTP, PIN, atau kata sandi.</span><span>${icon("link")} Buka situs atau aplikasi resmi dengan mengetik alamat sendiri.</span><span>${icon("shieldCheck")} Aktifkan verifikasi dua langkah bila tersedia.</span></div><p class="asset-credit">Cuplikan visual dari <cite>Pandu Literasi Digital: Bongkar Dunia Tipu-Tipu Digital</cite>, Azaria Zada Noordika (Desember 2025). Saran telah diselaraskan dengan panduan resmi.</p></div></div></section>`);
  }

  function detailPage() {
    const params = new URLSearchParams(location.search);
    const requestedId = params.get("id");
    const card = DATA.cards.find(c=>c.id === requestedId || c.slug === requestedId);
    if (!card) {
      document.title = "Panduan tidak ditemukan | WargaSiaga";
      return shell(`<section class="page-hero"><div class="container">${crumb([["Kenali Modus","modus.html"],["Tidak ditemukan"]])}<span class="eyebrow">Tautan tidak dikenali</span><h1 class="section-title">Panduan tidak ditemukan</h1><p class="section-copy">Alamat mungkin tidak lengkap atau panduan telah dipindahkan. Pilih panduan dari pustaka agar informasi yang tampil sesuai.</p><div class="hero-actions"><a class="btn btn-primary" href="modus.html">Buka pustaka modus</a><a class="btn btn-urgent" href="bantuan-darurat.html">Butuh bantuan sekarang</a></div></div></section>`);
    }
    const selectedAge=AGE_GROUPS.find(group=>group.value!=="all"&&group.value===params.get("age")&&card.ageGroups.includes(group.value));
    const catalogueHref=selectedAge?`modus.html?age=${encodeURIComponent(selectedAge.value)}`:"modus.html";
    document.title = `${card.title} | WargaSiaga`;
    const list = (items, cls="") => `<ul class="check-list ${cls}">${items.map(i=>`<li>${i}</li>`).join("")}</ul>`;
    return shell(`
      <section class="page-hero detail-hero"><div class="container">${crumb([["Kenali Modus",catalogueHref],[card.title]])}</div></section>
      <section class="section-sm"><div class="container detail-layout"><article class="article-card"><header class="article-head"><div class="inline"><span class="risk-badge">Perlu diwaspadai</span>${card.channels.slice(0,2).map(x=>`<span class="tag">${x}</span>`).join("")}</div><h1>${card.title}</h1><p class="section-copy">${card.summary}</p>${selectedAge?`<div class="audience-note">${icon("users")}<div><strong>Panduan untuk ${selectedAge.label}</strong><span>${AGE_GUIDANCE[selectedAge.value]}</span></div></div>`:""}<div class="hero-actions"><a class="btn btn-primary" href="konsultasi.html">${icon("bot")} Periksa kasus saya</a><a class="btn btn-urgent" href="bantuan-darurat.html">${icon("alert")} Saya sudah bertindak</a></div></header>
        <div class="article-content"><section class="article-section priority-section"><span class="eyebrow">Lihat dahulu</span><h2>Tanda yang patut diwaspadai</h2>${list(card.warningSigns,"warning-list")}</section>
        <details class="content-disclosure"><summary><span>${icon("chat")} Contoh pola dan permintaan</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content"><div class="example-box"><p>${card.fictionalExample}</p><div class="example-label">Contoh fiktif</div></div><h3>Apa yang diminta</h3><p>${card.requestedAction}</p></div></details>
        <details class="content-disclosure"><summary><span>${icon("shieldCheck")} Cara memeriksa dengan aman</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content">${list(card.independentChecks)}</div></details>
        <section class="article-section urgent-section"><h2>${icon("alert")} Jika sudah terlanjur</h2>${list(card.alreadyActedSteps,"urgent-list")}<a class="btn btn-urgent" href="bantuan-darurat.html">Buka langkah darurat ${icon("arrow")}</a></section>
        <details class="content-disclosure"><summary><span>${icon("info")} Catatan penting</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content"><p>Tidak ditemukannya laporan bukan bukti bahwa nomor, rekening, atau tautan aman. Tetap verifikasi melalui penyedia layanan resmi.</p></div></details></div></article>
        <aside class="side-stack"><div class="side-card related-action-card"><span class="side-card-icon">${icon("bot")}</span><h3>Masih ragu?</h3><p>Tanyakan situasi ini kepada WargaSiaga.</p><a class="btn btn-primary btn-block" href="konsultasi.html">Periksa dengan AI</a></div>
          <div class="side-card"><h3>Kanal resmi</h3>${card.officialLinks.map(s=>`<a class="source-link" href="${s.url}" target="_blank" rel="noopener noreferrer">${icon("external")}<span>${s.label}<br><span class="muted">${s.purpose}</span></span></a>`).join("")}</div>
          <details class="side-card side-disclosure"><summary>Sumber & peninjauan ${icon("arrow")}</summary><div class="side-disclosure-body"><p>Ditinjau ${formatDate(card.reviewedAt)} · berikutnya ${formatDate(card.nextReviewAt)}</p>${card.sources.map(s=>`<a class="source-link" href="${s.url}" target="_blank" rel="noopener noreferrer">${icon("external")}<span>${s.publisher}</span></a>`).join("")}<p class="small">${card.reviewer}</p></div></details>
          <details class="side-card side-disclosure"><summary>Bagikan panduan ${icon("copy")}</summary><div class="side-disclosure-body"><label class="sr-only" for="share-url">Tautan panduan</label><input class="share-field" id="share-url" type="url" readonly><button class="btn btn-secondary btn-block" id="share-guide" type="button">${icon("copy")} Salin tautan</button></div></details></aside>
      </div></section>`);
  }

  function consultPage() {
    return shell(`
      <section class="page-hero compact-hero"><div class="container page-hero-row"><div>${crumb([["Periksa dengan AI"]])}<span class="eyebrow icon-label">${icon("sparkles")} Tanya WargaSiaga</span><h1 class="section-title">Apa yang ingin Anda periksa?</h1><p class="section-copy">Ceritakan situasinya. Tambahkan link atau tangkapan layar bila perlu.</p></div><div class="page-hero-visual"><img src="${aiInputsUrl}" width="1280" height="720" alt="" aria-hidden="true"><a class="urgent-shortcut" href="bantuan-darurat.html">${icon("alert")}<span><strong>Sudah terlanjur?</strong><small>Buka bantuan sekarang</small></span>${icon("arrow")}</a></div></div></section>
      <section class="section-sm consult-workspace"><div class="narrow"><div class="chat-shell" id="consult-shell">
        <div class="chat-head"><div class="assistant-id"><span class="assistant-avatar">${icon("bot")}<span class="assistant-spark" aria-hidden="true">${icon("sparkles")}</span></span><div><strong>Panduan WargaSiaga</strong><span id="consult-service-state">Memeriksa kesiapan layanan…</span></div></div><span class="status-badge status-demo" id="consult-mode-badge">Menyiapkan</span></div>
        <div class="chat-body" id="chat-body"><div class="message assistant"><strong>Pilih contoh atau tulis dengan kata-kata Anda.</strong><span>Jangan sertakan OTP, PIN, atau kata sandi.</span></div><div class="quick-prompts"><button class="quick-prompt" type="button" data-prompt="Saya ditawari kerja, tetapi diminta transfer deposit sebelum mulai.">Kerja + deposit</button><button class="quick-prompt" type="button" data-prompt="Ada yang mengaku dari bank dan meminta kode OTP.">Bank + OTP</button><button class="quick-prompt" type="button" data-prompt="Pembeli meminta saya klik tautan kurir di luar marketplace.">Tautan pembeli</button></div></div>
        <form class="chat-compose" id="consult-form" novalidate>
          <div class="form-error hidden" id="consult-error" role="alert" tabindex="-1"></div>
          <fieldset class="exposure-check" aria-describedby="consult-error">
            <legend><span class="step-label-icon">${icon("shieldCheck")}</span>Apakah Anda sudah mengirim uang, data, atau akses akun?</legend>
            <div class="exposure-options"><label><input type="radio" name="exposure" value="none" required><span>Belum / tidak</span></label><label><input type="radio" name="exposure" value="money"><span>Ya, uang terkirim</span></label><label><input type="radio" name="exposure" value="access"><span>Ya, akses atau OTP dibagikan</span></label></div>
          </fieldset>
          <div class="consult-step primary-input"><label for="consult-input" class="field-label-row"><span class="step-label-icon">${icon("chat")}</span><span><strong>Ceritakan situasi</strong> <span class="muted">atau kosongkan bila hanya memeriksa link</span></span></label><textarea id="consult-input" maxlength="1500" aria-describedby="consult-error consult-privacy" placeholder="Contoh: Saya ditawari kerja lalu diminta membayar deposit."></textarea><span class="char-count"><span id="consult-count">0</span>/1500</span></div>
          <div class="input-options" aria-label="Tambahkan bukti opsional">
            <details class="input-disclosure"><summary><span class="disclosure-icon">${icon("globeLock")}</span><span><strong>Periksa link (URL)</strong><small>Link tidak akan dibuka</small></span><span class="summary-action">Tambah ${icon("arrow")}</span></summary><div class="disclosure-body consult-step"><label for="consult-url">Tempel link</label><input id="consult-url" type="text" inputmode="url" maxlength="2048" autocomplete="off" spellcheck="false" aria-describedby="consult-url-help consult-error" placeholder="contoh.id/login"><p class="field-help" id="consult-url-help">WargaSiaga hanya memeriksa bentuk alamatnya, bukan isi situs.</p></div></details>
            <details class="input-disclosure" id="image-disclosure"><summary><span class="disclosure-icon">${icon("scanText")}</span><span><strong>Baca tangkapan layar</strong><small>Teks dibaca di perangkat Anda</small></span><span class="summary-action">Tambah ${icon("arrow")}</span></summary><div class="disclosure-body consult-step image-evidence"><div class="image-actions"><label class="btn btn-secondary" for="consult-image">${icon("image")} Pilih gambar</label><input class="sr-only" id="consult-image" type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="consult-image-help"><button class="btn btn-secondary hidden" id="analyze-image" type="button">${icon("scanText")} Ambil teks</button><button class="btn btn-ghost hidden" id="remove-image" type="button">${icon("trash")} Hapus</button></div><p class="field-help" id="consult-image-help"><span class="micro-icon">${icon("qrCode")}</span>PNG, JPG, atau WebP · maks. 5 MB · gambar tidak diunggah.</p><div class="image-preview-wrap hidden" id="image-preview-wrap"><img id="image-preview" alt="Pratinjau tangkapan layar yang dipilih"><div><strong id="image-name"></strong><span id="image-status" role="status" aria-live="polite">Siap mengambil teks.</span></div></div></div></details>
          </div>
          <label class="ai-consent" for="consult-consent"><input id="consult-consent" type="checkbox"><span class="consent-icon" aria-hidden="true">${icon("shieldCheck")}</span><span><strong>Izinkan analisis AI</strong><small>Data sensitif disamarkan. Percakapan tidak disimpan WargaSiaga.</small></span></label>
          <details class="privacy-disclosure"><summary>Bagaimana data diproses?</summary><p class="field-help" id="consult-privacy">Teks diproses melalui server WargaSiaga. Data sensitif yang terdeteksi disamarkan sebelum bagian yang diperlukan dikirim ke layanan AI. Jangan masukkan rahasia. Periksa kembali teks dari gambar sebelum mengirim.</p></details>
          <div class="chat-tools"><span class="small muted">Hasil berupa panduan awal, bukan keputusan final.</span><button class="btn btn-primary btn-prominent" id="consult-submit" type="submit">${icon("scanSearch")} Periksa sekarang</button></div>
        </form>
      </div><div id="consult-result" class="assessment hidden" style="margin-top:22px" role="status" aria-live="polite" tabindex="-1"></div></div></section>`);
  }

  function urgentPage() {
    return shell(`
      <section class="emergency-hero compact-emergency"><div class="container">${crumb([["Bantuan sekarang"]])}<span class="eyebrow" style="color:#ffd2c7">Tindakan cepat</span><h1>Amankan uang dan akses sekarang.</h1><p class="section-copy">Pilih yang sudah terjadi untuk menampilkan langkah yang tepat.</p></div></section>
      <section class="section-sm"><div class="container"><div class="form-card incident-picker"><h2>Apa yang sudah terjadi?</h2><div class="choice-grid" id="incident-choices">
        <label class="choice"><input type="checkbox" value="money"><span><strong>Uang sudah terkirim</strong><span>Transfer bank, dompet digital, kartu, atau kripto</span></span></label>
        <label class="choice"><input type="checkbox" value="otp"><span><strong>OTP / kata sandi dibagikan</strong><span>Kode masuk, PIN, atau data kartu</span></span></label>
        <label class="choice"><input type="checkbox" value="app"><span><strong>Aplikasi / file dipasang</strong><span>APK, kendali jarak jauh, atau izin perangkat</span></span></label>
        <label class="choice"><input type="checkbox" value="identity"><span><strong>Data identitas dikirim</strong><span>Foto identitas atau data pribadi penting</span></span></label>
      </div><p class="selection-summary" id="incident-summary" role="status" aria-live="polite">Semua langkah penting ditampilkan.</p></div></div></section>
      <section class="section-sm" style="padding-top:0"><div class="container detail-layout"><div><span class="eyebrow">Urutan tindakan</span><h2 class="section-title">Lakukan sekarang</h2><div class="emergency-steps" id="emergency-steps">
        <article class="emergency-step" data-for="money otp"><div><h2>Hubungi penyedia pembayaran</h2><p>Gunakan aplikasi, nomor pada kartu, atau situs resmi yang Anda cari sendiri. Minta pengamanan akun dan transaksi.</p></div></article>
        <article class="emergency-step" data-for="otp"><div><h2>Amankan akun</h2><p>Dari perangkat tepercaya: ganti kata sandi, keluarkan sesi lain, dan periksa data pemulihan.</p></div></article>
        <article class="emergency-step" data-for="app"><div><h2>Batasi perangkat</h2><p>Putuskan koneksi bila ada kendali mencurigakan. Amankan akun dari perangkat lain.</p></div></article>
        <article class="emergency-step" data-for="identity"><div><h2>Catat data yang dibagikan</h2><p>Amankan akun terkait dan waspadai penyamaran lanjutan.</p></div></article>
        <article class="emergency-step" data-for="all"><div><h2>Simpan bukti</h2><p>Simpan waktu, transaksi, akun, percakapan, dan link (URL). Jangan unggah data sensitif ke publik.</p></div></article>
        <article class="emergency-step" data-for="all"><div><h2>Gunakan jalur resmi</h2><p>Pilih layanan sesuai kasus. Kerugian transaksi juga dapat memerlukan laporan polisi.</p></div></article>
      </div></div><aside class="side-stack"><div class="side-card"><h3>Tautan resmi</h3><a class="source-link" href="https://iasc.ojk.go.id/" target="_blank" rel="noopener noreferrer">${icon("external")}<span>IASC — OJK / Satgas PASTI<br><span class="muted">Kerugian transaksi finansial</span></span></a><a class="source-link" href="https://cekrekening.id/" target="_blank" rel="noopener noreferrer">${icon("external")}<span>CekRekening — Komdigi<br><span class="muted">Cek/laporkan rekening</span></span></a><a class="source-link" href="https://aduannomor.id/" target="_blank" rel="noopener noreferrer">${icon("external")}<span>AduanNomor — Komdigi<br><span class="muted">Cek/laporkan nomor</span></span></a><a class="source-link" href="https://aduankonten.id/" target="_blank" rel="noopener noreferrer">${icon("external")}<span>AduanKonten — Komdigi<br><span class="muted">Laporkan konten berbahaya</span></span></a></div><details class="side-card side-disclosure"><summary>Batas layanan ${icon("arrow")}</summary><div class="side-disclosure-body"><p>WargaSiaga tidak membekukan transaksi, memulihkan dana, atau membuat laporan resmi. Hasil penanganan tidak dapat dijamin.</p></div></details></aside></div></section>
      <section class="section-sm no-print"><div class="container"><div class="cta-band"><div class="cta-band-grid"><div><h2>Simpan urutan langkah ini</h2><p>Cetak atau simpan halaman tanpa perlu membuat akun.</p></div><button class="btn btn-secondary" type="button" id="print-page">${icon("file")} Cetak panduan</button></div></div></div></section>`);
  }

  function supportPage() {
    return shell(`
      <section class="page-hero compact-hero"><div class="container page-hero-row"><div>${crumb([["Bantu orang lain"]])}<span class="eyebrow icon-label">${icon("users")} Dukungan tanpa menghakimi</span><h1 class="section-title">Bantu orang terdekat tetap aman</h1><p class="section-copy">Mulai dari rasa khawatir, lalu periksa bersama. Jangan menyalahkan atau memaksa.</p></div><a class="urgent-shortcut" href="bantuan-darurat.html">${icon("alert")}<span><strong>Uang sudah terkirim?</strong><small>Buka bantuan sekarang</small></span>${icon("arrow")}</a></div></section>
      <section class="section-sm"><div class="narrow"><div class="support-callout"><span class="support-callout-icon">${icon("chat")}</span><div><span class="eyebrow">Kalimat pembuka</span><blockquote>“Saya khawatir karena ada permintaan uang mendadak. Boleh kita periksa bersama sebelum melanjutkan?”</blockquote></div></div></div></section>
      <section class="section-sm" style="padding-top:0"><div class="container"><span class="eyebrow">Tiga langkah</span><h2 class="section-title">Dampingi, periksa, lalu bertindak</h2><div class="steps support-steps"><article class="step"><span class="step-num">1</span><h3>Dengarkan dulu</h3><p>Tanyakan apa yang terjadi dan apa yang sudah dilakukan. Hindari kalimat “kok bisa percaya?”.</p></article><article class="step"><span class="step-num">2</span><h3>Periksa bersama</h3><p>Hentikan pembayaran. Hubungi orang atau lembaga melalui nomor resmi yang dicari sendiri.</p></article><article class="step"><span class="step-num">3</span><h3>Amankan bila perlu</h3><p>Jika uang, OTP, kata sandi, atau akses sudah diberikan, buka langkah bantuan tanpa menunggu analisis AI.</p></article></div></div></section>
      <section class="section-sm surface-section"><div class="container support-grid"><div class="support-list"><span class="support-list-icon positive">${icon("check")}</span><div><h2>Yang membantu</h2><ul><li>Tetap tenang dan jaga privasi orang tersebut.</li><li>Simpan bukti tanpa meneruskannya ke grup publik.</li><li>Tawarkan bantuan menghubungi bank atau layanan resmi.</li></ul></div></div><div class="support-list"><span class="support-list-icon caution">${icon("close")}</span><div><h2>Yang sebaiknya dihindari</h2><ul><li>Menyalahkan, mempermalukan, atau mengambil alih paksa.</li><li>Menghubungi balik pelaku untuk berdebat.</li><li>Membayar pihak yang menjanjikan dana pasti kembali.</li></ul></div></div></div></section>
      <section class="section-sm"><div class="container"><div class="cta-band"><div class="cta-band-grid"><div><h2>Periksa situasinya bersama</h2><p>Gunakan AI untuk mengenali tanda, atau buka katalog panduan tanpa membagikan identitas.</p></div><div class="inline"><a class="btn btn-secondary" href="konsultasi.html">Periksa dengan AI</a><a class="btn btn-secondary" href="modus.html?context=Keluarga">Buka panduan keluarga</a></div></div></div></div></section>`);
  }

  function reportsPage() {
    return shell(`
      <section class="page-hero compact-hero"><div class="container page-hero-row"><div>${crumb([["Lapor Warga"]])}<span class="eyebrow">Demo komunitas</span><h1 class="section-title">Lihat pola yang dilaporkan</h1><p class="section-copy">Contoh anonim dan belum terverifikasi.</p><div class="hero-actions"><a class="btn btn-primary" href="lapor.html">${icon("file")} Buat laporan demo</a><a class="btn btn-secondary" href="status-laporan.html">Cek status</a></div></div><div class="page-hero-visual"><img src="${communityUrl}" width="1280" height="853" alt="" aria-hidden="true" loading="lazy"><a class="urgent-shortcut" href="bantuan-darurat.html">${icon("alert")}<span><strong>Kehilangan uang?</strong><small>Hubungi penyedia lebih dahulu</small></span>${icon("arrow")}</a></div></div></section>
      <section class="section"><div class="container"><div class="section-heading-row"><div><span class="eyebrow">Contoh anonim</span><h2 class="section-title">Pola terbaru</h2></div><span class="status-badge status-public">Belum terverifikasi</span></div><div class="report-grid">${DATA.reports.map(r=>`<article class="report-card"><div class="report-meta"><span>${icon("chat")} ${r.channel}</span><span>${icon("clock")} ${r.period}</span></div><h3>${r.title}</h3><p>${r.summary}</p><div class="card-footer">${arrowLink("Buka modus",`modus-detail.html?id=${r.related}`)}</div></article>`).join("")}</div></div></section>
      <section class="section-sm surface-section"><div class="narrow"><details class="content-disclosure"><summary><span>${icon("info")} Cara membaca status laporan</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content status-explainer"><div><span class="status-badge status-review">Ditinjau</span><p>Masih privat.</p></div><div><span class="status-badge status-public">Dilaporkan warga</span><p>Sudah disamarkan, belum terbukti.</p></div><div><span class="status-badge status-official">Peringatan resmi</span><p>Memiliki sumber otoritas.</p></div></div></details><p class="demo-note">${icon("shieldCheck")} Mode demo · tidak ada data yang disimpan atau diteruskan.</p></div></section>`);
  }

  function reportFormPage() {
    return shell(`
      <section class="page-hero compact-hero"><div class="container">${crumb([["Lapor Warga","laporan.html"],["Buat laporan demo"]])}<span class="eyebrow">Tidak disimpan</span><h1 class="section-title">Buat laporan demo</h1><p class="section-copy">Tulis pola, samarkan data pribadi, lalu konfirmasi.</p></div></section>
      <section class="section-sm"><div class="container form-layout"><div class="form-card"><div class="progress" role="list" aria-label="Tahapan simulasi laporan"><div class="progress-step active" data-progress="1" role="listitem" aria-current="step"><span class="progress-num">1</span><span>Ceritakan</span></div><div class="progress-step" data-progress="2" role="listitem"><span class="progress-num">2</span><span>Periksa data</span></div><div class="progress-step" data-progress="3" role="listitem"><span class="progress-num">3</span><span>Konfirmasi</span></div></div>
        <form id="report-form" novalidate><section data-step="1"><h2 tabindex="-1">Apa yang terjadi?</h2><p>Jangan tulis nama lengkap, nomor telepon/rekening penuh, NIK, alamat, OTP, PIN, atau kata sandi.</p><div class="form-error hidden" id="report-error" role="alert" tabindex="-1"></div>
          <div class="field"><label for="report-channel">Cara dihubungi</label><select id="report-channel" required aria-describedby="report-error"><option value="">Pilih kanal</option><option>WhatsApp</option><option>Telepon</option><option>SMS</option><option>Email</option><option>Telegram</option><option>Media sosial</option><option>Marketplace</option><option>Lainnya</option></select></div>
          <div class="field"><label for="report-period">Kapan terjadi?</label><select id="report-period" required aria-describedby="report-error"><option value="">Pilih rentang</option><option>7 hari terakhir</option><option>30 hari terakhir</option><option>2–3 bulan lalu</option><option>Lebih lama</option></select></div>
          <div class="field"><label for="report-type">Pola yang paling dekat</label><select id="report-type" required aria-describedby="report-error"><option value="">Pilih pola</option>${DATA.cards.map(c=>`<option value="${c.id}">${c.title}</option>`).join("")}<option value="other">Lainnya — tulis sendiri</option></select></div>
          <div class="field conditional-field hidden" id="report-type-other-wrap"><label for="report-type-other">Tulis pola lainnya</label><input id="report-type-other" type="text" maxlength="120" aria-describedby="report-error report-type-other-help" placeholder="Contoh: penipuan tiket konser"><span class="field-help" id="report-type-other-help">Tulis jenis polanya saja. Jangan masukkan nama, nomor, link, atau data pribadi.</span></div>
          <div class="field"><label for="report-story">Cerita singkat</label><textarea id="report-story" maxlength="1200" required aria-describedby="report-error" placeholder="Contoh: Saya dihubungi akun yang mengaku perekrut dan diminta membayar deposit…"></textarea><div class="spread"><span class="field-help">Sebutkan pola dan tindakan yang diminta, bukan identitas.</span><span class="char-count"><span id="report-count">0</span>/1200</span></div></div>
          <div class="form-actions"><a class="btn btn-secondary" href="laporan.html">Batal</a><button class="btn btn-primary" type="button" data-next="2">Lanjutkan Laporan ${icon("arrow")}</button></div></section>
          <section class="hidden" data-step="2"><h2 tabindex="-1">Periksa data yang disamarkan</h2><p>Sistem demo menandai nomor telepon, pola angka, OTP, alamat email, dan link. Pastikan tidak ada identitas yang tersisa.</p><div class="preview-box"><div class="tag-row"><span class="tag" id="preview-channel"></span><span class="tag" id="preview-period"></span><span class="tag" id="preview-type"></span></div><p id="preview-story"></p></div><div class="privacy-box" style="margin-top:16px"><strong>Penyamaran otomatis bisa melewatkan sesuatu</strong>Dalam produk nyata, moderator manusia tetap perlu memeriksa sebelum ringkasan dapat dipublikasikan.</div><div class="form-actions"><button class="btn btn-secondary" type="button" data-back="1">Kembali</button><button class="btn btn-primary" type="button" data-next="3">Lanjut ke konfirmasi ${icon("arrow")}</button></div></section>
          <section class="hidden" data-step="3"><h2 tabindex="-1">Konfirmasi prototipe</h2><p>Belum ada pengiriman sungguhan. Persetujuan ini memperagakan bentuk persetujuan yang diperlukan sebelum penyimpanan.</p><label class="consent-line"><input type="checkbox" id="report-consent"><span>Saya memahami laporan ini bukan laporan resmi, tidak menjamin tindakan, dan pada produk nyata akan ditinjau serta disamarkan sebelum publikasi.</span></label><div class="form-actions"><button class="btn btn-secondary" type="button" data-back="2">Kembali</button><button class="btn btn-primary" id="submit-demo" type="submit" disabled>Selesaikan simulasi</button></div></section>
        </form><div class="hidden" id="report-success" role="status" tabindex="-1"><div class="empty-state"><span class="empty-icon">${icon("check")}</span><h2>Simulasi selesai</h2><p>Tidak ada data yang dikirim atau disimpan. Gunakan kode <strong>WS-DEMO-2401</strong> untuk mencoba halaman status.</p><div class="inline" style="justify-content:center;margin-top:18px"><a class="btn btn-primary" href="status-laporan.html?code=WS-DEMO-2401">Lihat status demo</a><a class="btn btn-secondary" href="laporan.html">Kembali ke laporan warga</a></div></div></div></div>
        <aside class="side-stack"><div class="side-card"><h3>Jangan masukkan</h3><p>OTP, PIN, kata sandi, NIK lengkap, nomor kartu/rekening penuh, alamat rumah, nama korban, atau foto identitas.</p></div><div class="side-card"><h3>Bukan kanal resmi</h3><p>Prototipe ini tidak mengirim laporan ke OJK, polisi, Komdigi, bank, atau platform.</p><a class="text-link" href="bantuan-darurat.html">Butuh bantuan sekarang ${icon("arrow")}</a></div></aside></div></section>`);
  }

  function statusPage() {
    return shell(`
      <section class="page-hero compact-hero"><div class="container">${crumb([["Lapor Warga","laporan.html"],["Status demo"]])}<span class="eyebrow">Status demo</span><h1 class="section-title">Cek laporan</h1><p class="section-copy">Gunakan kode <strong>WS-DEMO-2401</strong>.</p></div></section>
      <section class="section"><div class="narrow"><div class="form-card"><form id="status-form" novalidate><div class="form-error hidden" id="status-error" role="alert" tabindex="-1"></div><div class="field"><label for="status-code">Kode laporan demo</label><input id="status-code" type="text" placeholder="WS-DEMO-2401" autocomplete="off" required aria-describedby="status-error"></div><div class="form-actions"><button class="btn btn-primary" type="submit">Cek status</button></div></form><div class="hidden" id="status-result" role="status" tabindex="-1"><div class="spread"><div><span class="status-badge status-review">Sedang ditinjau</span><h2 style="margin:12px 0 4px">Laporan WS-DEMO-2401</h2><p class="muted" style="margin:0">Simulasi status · tidak tersimpan</p></div></div><div class="status-timeline"><div class="timeline-row"><span class="timeline-dot">${icon("check")}</span><div><h3>Dikirim</h3><p>Data privat diterima untuk pemeriksaan awal.</p></div></div><div class="timeline-row"><span class="timeline-dot">2</span><div><h3>Sedang ditinjau</h3><p>Moderator memeriksa data sensitif, klaim, dan kemiripan laporan.</p></div></div><div class="timeline-row"><span class="timeline-dot pending">3</span><div><h3>Keputusan</h3><p>Ringkasan dapat diterbitkan sebagai pola belum terverifikasi, dikoreksi, atau dihapus.</p></div></div></div><div class="privacy-box"><strong>Status tidak berarti kebenaran klaim sudah dipastikan</strong>Label “peringatan resmi” hanya boleh muncul dengan sumber otoritas yang terpisah.</div></div><div class="empty-state hidden" id="status-empty" role="status" tabindex="-1"><span class="empty-icon">${icon("search")}</span><h2>Kode demo tidak ditemukan</h2><p>Coba kode WS-DEMO-2401. Pada produk nyata, halaman ini memerlukan kontrol akses dan kebijakan retensi.</p></div></div></div></section>`);
  }

  function aboutPage() {
    return shell(`
      <section class="page-hero compact-hero"><div class="container">${crumb([["Tentang"]])}<span class="eyebrow">Transparansi</span><h1 class="section-title">Tentang WargaSiaga</h1><p class="section-copy">Panduan independen untuk mengenali pola dan menemukan langkah resmi.</p><nav class="section-tabs" aria-label="Isi halaman"><a href="#layanan-resmi">Layanan resmi</a><a href="#batasan">Batasan</a><a href="#sumber">Sumber</a><a href="#privasi">Privasi</a></nav></div></section>
      <section class="section-sm"><div class="container"><h2 class="sr-only">Prinsip WargaSiaga</h2><div class="principle-grid compact-principles"><div class="principle"><span class="principle-icon">${icon("shield")}</span><h3>Utamakan keselamatan</h3><p>Jalur darurat selalu tersedia.</p></div><div class="principle"><span class="principle-icon">${icon("book")}</span><h3>Gunakan sumber</h3><p>Rujukan dan tanggal tinjau dicatat.</p></div><div class="principle"><span class="principle-icon">${icon("users")}</span><h3>Tanpa menyalahkan</h3><p>Fokus pada langkah berikutnya.</p></div></div></div></section>
      <section class="section surface-section" id="layanan-resmi"><div class="container"><span class="eyebrow">Rujukan langsung</span><h2 class="section-title">Layanan resmi</h2><div class="service-grid"><a class="service-card" href="https://iasc.ojk.go.id/" target="_blank" rel="noopener noreferrer"><span class="service-icon">${icon("external")}</span><strong>IASC</strong><small>Kerugian transaksi</small></a><a class="service-card" href="https://cekrekening.id/" target="_blank" rel="noopener noreferrer"><span class="service-icon">${icon("external")}</span><strong>CekRekening</strong><small>Rekening dan dompet digital</small></a><a class="service-card" href="https://aduannomor.id/" target="_blank" rel="noopener noreferrer"><span class="service-icon">${icon("external")}</span><strong>AduanNomor</strong><small>Nomor mencurigakan</small></a><a class="service-card" href="https://aduankonten.id/" target="_blank" rel="noopener noreferrer"><span class="service-icon">${icon("external")}</span><strong>AduanKonten</strong><small>Konten berbahaya</small></a></div><p class="section-note">Tujuan eksternal · fungsi dan hasil ditentukan masing-masing lembaga.</p></div></section>
      <section class="section-sm"><div class="narrow disclosure-stack">
        <details class="content-disclosure" id="batasan"><summary><span>${icon("circleHelp")} Batasan WargaSiaga</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content"><ul><li>Tidak menyatakan sesuatu 100% aman atau pasti penipuan.</li><li>Tidak berafiliasi dengan pemerintah, bank, operator, atau platform.</li><li>Tidak membekukan transaksi, memulihkan dana, atau membuat laporan resmi.</li><li>Tidak mempublikasikan laporan mentah atau identitas korban.</li></ul></div></details>
        <details class="content-disclosure" id="sumber"><summary><span>${icon("book")} Sumber utama</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content source-list"><a href="https://www.undp.org/policy-centre/singapore/publications/anti-scam-handbook" target="_blank" rel="noopener noreferrer">UNDP Anti-Scam Handbook ${icon("external")}</a><a href="https://www.scamwatch.gov.au/" target="_blank" rel="noopener noreferrer">Scamwatch ${icon("external")}</a><a href="https://iasc.ojk.go.id/" target="_blank" rel="noopener noreferrer">IASC ${icon("external")}</a><a href="https://jdih.komdigi.go.id/" target="_blank" rel="noopener noreferrer">Komdigi ${icon("external")}</a><p>Terakhir diperiksa 3 Oktober 2026.</p></div></details>
        <details class="content-disclosure" id="privasi"><summary><span>${icon("lock")} Privasi & aksesibilitas</span><span class="summary-action">Buka ${icon("arrow")}</span></summary><div class="disclosure-content"><h3>Privasi</h3><p>Konsultasi AI memerlukan persetujuan. Data sensitif yang terdeteksi disamarkan dan percakapan tidak disimpan WargaSiaga. Laporan demo tetap di perangkat.</p><h3 id="aksesibilitas">Aksesibilitas</h3><p>Navigasi keyboard, fokus terlihat, target sentuh, struktur judul, kontras, dan pengurangan animasi tersedia. Pengujian pengguna tetap diperlukan.</p></div></details>
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
      location.assign("konsultasi.html");
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
    const count = document.getElementById("result-count");
    const clear = document.getElementById("search-clear");
    const activeFilters = document.getElementById("active-filters");
    const params = new URLSearchParams(location.search);
    search.value = params.get("q") || "";
    for (const check of checks) check.checked = params.getAll(check.name).includes(check.value);
    const requestedAge=params.get("age");
    const initialAge=ageChoices.find(choice=>choice.value===requestedAge) || ageChoices.find(choice=>choice.value==="all");
    if(initialAge)initialAge.checked=true;
    function apply() {
      const q = search.value.trim().toLowerCase();
      const selectedAge=ageChoices.find(choice=>choice.checked)?.value || "all";
      const selectedChannels = checks.filter(x=>x.name==="channel"&&x.checked).map(x=>x.value);
      const selectedContexts = checks.filter(x=>x.name==="context"&&x.checked).map(x=>x.value);
      let shown = 0;
      DATA.cards.forEach(card => { const el = grid.querySelector(`[data-card-id="${card.id}"]`); const detailParams=new URLSearchParams({id:card.id});if(selectedAge!=="all")detailParams.set("age",selectedAge);el.querySelectorAll("[data-guide-link]").forEach(link=>link.setAttribute("href",`modus-detail.html?${detailParams}`)); const matchQ = !q || el.dataset.search.includes(q); const matchAge=selectedAge==="all" || card.ageGroups?.includes(selectedAge); const matchChannel = !selectedChannels.length || selectedChannels.some(x=>card.channels.includes(x)); const matchContext = !selectedContexts.length || selectedContexts.some(x=>card.contexts.includes(x)); const visible = matchQ&&matchAge&&matchChannel&&matchContext; el.classList.toggle("hidden",!visible); if(visible) shown++; });
      grid.querySelector(".empty-state")?.remove();
      if (!shown) grid.insertAdjacentHTML("beforeend",`<div class="empty-state"><span class="empty-icon">${icon("search")}</span><h2>Tidak ada panduan yang cocok</h2><p>Coba istilah lebih umum atau hapus salah satu filter. Jika sudah ada kerugian, buka bantuan sekarang.</p><a class="btn btn-urgent" href="bantuan-darurat.html">Bantuan sekarang</a></div>`);
      count.textContent = `${shown} panduan ditemukan`; clear.classList.toggle("hidden",!q);
      const chips = [
        ...(selectedAge!=="all" ? [{ key:"age", value:selectedAge, label:`Usia: ${AGE_GROUPS.find(group=>group.value===selectedAge)?.label || selectedAge}` }] : []),
        ...(q ? [{ key:"q", value:q, label:`Pencarian: ${search.value.trim()}` }] : []),
        ...selectedChannels.map(value=>({ key:"channel", value, label:value })),
        ...selectedContexts.map(value=>({ key:"context", value, label:value }))
      ];
      activeFilters.innerHTML = chips.map(chip=>`<button class="filter-chip" type="button" data-filter-key="${escapeHtml(chip.key)}" data-filter-value="${escapeHtml(chip.value)}">${escapeHtml(chip.label)} ${icon("close")}</button>`).join("");
      activeFilters.classList.toggle("hidden", !chips.length);
      const next = new URLSearchParams();
      if(selectedAge!=="all")next.set("age",selectedAge);
      if (q) next.set("q", search.value.trim());
      selectedChannels.forEach(value=>next.append("channel",value));
      selectedContexts.forEach(value=>next.append("context",value));
      history.replaceState(null,"",`${location.pathname}${next.size ? `?${next}` : ""}`);
    }
    search.addEventListener("input",apply); checks.forEach(c=>c.addEventListener("change",apply)); ageChoices.forEach(choice=>choice.addEventListener("change",apply));
    clear.addEventListener("click",()=>{search.value="";search.focus();apply();});
    document.getElementById("reset-filter").addEventListener("click",()=>{checks.forEach(c=>c.checked=false);const allAge=ageChoices.find(choice=>choice.value==="all");if(allAge)allAge.checked=true;search.value="";search.focus();apply();});
    activeFilters.addEventListener("click",event=>{const button=event.target.closest("[data-filter-key]");if(!button)return;if(button.dataset.filterKey==="q")search.value="";else if(button.dataset.filterKey==="age"){const allAge=ageChoices.find(choice=>choice.value==="all");if(allAge)allAge.checked=true;}else{const target=checks.find(check=>check.name===button.dataset.filterKey&&check.value===button.dataset.filterValue);if(target)target.checked=false;}apply();});
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
    const actionFirst = /\b(?:sudah|telah|terlanjur|tadi)\b\s+(?:saya\s+)?(?:transfer|mentransfer|membayar|bayar|mengirim|kirim|memberi|membagikan|kasih|memasang|install)(?:.{0,28})(?:uang|dana|otp|pin|password|kata sandi|kode|apk|aplikasi)?/;
    const objectFirst = /(?:uang|dana)\s+\b(?:sudah|telah)\b\s+(?:terkirim|ditransfer)|(?:otp|pin|password|kata sandi|kode)\s+(?:tadi\s+)?(?:sudah\s+)?(?:saya\s+)?(?:beri|berikan|bagikan|kasih)|kehilangan akses/;
    return actionFirst.test(normalized) || objectFirst.test(normalized);
  }

  function initConsult() {
    const form = document.getElementById("consult-form"); if(!form) return;
    const input=document.getElementById("consult-input"), urlInput=document.getElementById("consult-url"), count=document.getElementById("consult-count"), result=document.getElementById("consult-result"), error=document.getElementById("consult-error"), consent=document.getElementById("consult-consent"), submit=document.getElementById("consult-submit"), serviceState=document.getElementById("consult-service-state"), modeBadge=document.getElementById("consult-mode-badge"), imageInput=document.getElementById("consult-image"), analyzeImageButton=document.getElementById("analyze-image"), removeImageButton=document.getElementById("remove-image"), imagePreviewWrap=document.getElementById("image-preview-wrap"), imagePreview=document.getElementById("image-preview"), imageName=document.getElementById("image-name"), imageStatus=document.getElementById("image-status"), exposureFields=[...form.querySelectorAll('input[name="exposure"]')];
    let aiAvailable=null;
    let previewUrl="";
    let imageAnalyzerModule=null;
    const officialAllowlist=new Set(["https://iasc.ojk.go.id/","https://sipasti.ojk.go.id/","https://cekrekening.id/","https://aduannomor.id/","https://aduankonten.id/"]);
    const healthCheck=fetch("api/health",{headers:{Accept:"application/json"},cache:"no-store"}).then(async response=>{
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
    exposureFields.forEach(field=>field.addEventListener("change",clearError));
    consent.addEventListener("change",clearError);
    document.querySelectorAll(".quick-prompt").forEach(btn=>btn.addEventListener("click",()=>{input.value=btn.dataset.prompt;input.dispatchEvent(new Event("input"));input.focus();}));
    let handoffQuestion="";
    try{handoffQuestion=String(sessionStorage.getItem("ws-home-question")||"").trim().slice(0,600);sessionStorage.removeItem("ws-home-question");}catch(_){}
    if(handoffQuestion){
      input.value=handoffQuestion;
      input.dispatchEvent(new Event("input"));
      const bubble=document.createElement("div");
      bubble.className="message user handoff-message";
      bubble.textContent=handoffQuestion;
      document.getElementById("chat-body")?.append(bubble);
    }

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
        const brandDomains={facebook:["facebook.com","fb.com","fbcdn.net","facebook.net"],instagram:["instagram.com","cdninstagram.com"],whatsapp:["whatsapp.com","whatsapp.net"],linkedin:["linkedin.com","licdn.com"],roblox:["roblox.com"],amazon:["amazon.com","amazonaws.com","amazonvideo.com","amazon.dev","amazon-adsystem.com","media-amazon.com"],netflix:["netflix.com","nflxvideo.net","nflximg.net"],microsoft:["microsoft.com","microsoftonline.com","live.com","cloud.microsoft","static.microsoft","office.com","windows.com"],apple:["apple.com","apple-dns.net","cdn-apple.com","icloud.com"],paypal:["paypal.com"],coinbase:["coinbase.com"],ledger:["ledger.com"],trezor:["trezor.io"],shopee:["shopee.co.id","shopee.com"],tokopedia:["tokopedia.com"],mandiri:["bankmandiri.co.id"],bca:["bca.co.id"],bri:["bri.co.id"],bni:["bni.co.id"],dana:["dana.id"]};
        const compactHost=host.replace(/[^a-z0-9]/g,"");
        for(const [brand,official] of Object.entries(brandDomains)){const appears=brand.length<=4?new RegExp(`(?:^|[.-])${brand}(?:[.-]|$)`,"i").test(host):host.includes(brand)||compactHost.includes(brand);if(appears&&!official.some(domain=>host===domain||host.endsWith(`.${domain}`))){signals.push({label:`Nama domain memuat “${brand}”, tetapi bukan bagian dari keluarga domain resmi yang dikenali.`});break;}}
        const hosting=["pages.dev","vercel.app","netlify.app","github.io","blogspot.com","wasmer.app","replit.app","workers.dev","webflow.io","framer.website","framer.app","gitbook.io","onrender.com","railway.app","azurewebsites.net","jimdofree.com"].find(domain=>host!==domain&&host.endsWith(`.${domain}`));
        if(hosting){const tenant=host.slice(0,-(hosting.length+1)),digits=(tenant.match(/\d/g)||[]).length,hyphens=(tenant.match(/-/g)||[]).length,generated=tenant.length>=12&&digits>=2&&(hyphens>=1||/^[a-z0-9]{14,}$/i.test(tenant)),sensitive=/(?:login|auth|account|verify|verification|appeal|wallet|secure|support|facebook|instagram|amazon|netflix|ledger|trezor|roblox|whatsapp|coinbase|paypal)/i.test(`${tenant}${parsed.pathname}`);if(generated||sensitive)signals.push({label:"Halaman berada pada layanan hosting yang dapat dibuat pengguna dan memakai nama acak atau tema akun/merek."});}
        if(new Set(["bit.ly","tinyurl.com","tiny.cc","t.co","goo.su","did.li","g5.lu","1url.at","py.md","qr2.it","urlz.li"]).has(host))signals.push({label:"Tautan memakai layanan pemendek sehingga tujuan akhirnya tidak terlihat."});
        return {host:parsed.hostname,display:`${parsed.protocol}//${parsed.hostname}${parsed.port?`:${parsed.port}`:""}${parsed.pathname.slice(0,120)}${parsed.search?"?[parameter disembunyikan]":""}`,riskLevel:signals.length?"review":"no_visible_structural_signals",signals,fetched:false,note:"WargaSiaga tidak membuka link ini. Tidak ditemukannya tanda dari bentuk link bukan bukti bahwa situs aman."};
      }catch(_){return {invalid:true,signals:[],note:"Format link (URL) tidak dapat dibaca."};}
    }

    function localResult(raw,exposure,urgent=false,submittedUrl=""){
      const low=raw.toLowerCase();
      const scored=DATA.cards.map(card=>({card,score:[card.title,card.summary,...card.channels,...card.contexts,...card.tactics,card.requestedAction].join(" ").toLowerCase().split(/\W+/).filter(word=>word.length>3&&low.includes(word)).length})).sort((left,right)=>right.score-left.score);
      const matches=scored.filter(item=>item.score>0).slice(0,2).map(item=>({id:item.card.id,title:item.card.title}));
      const clues=[];
      if(/otp|pin|password|kata sandi|kode/.test(low))clues.push("Uraian menyebut data akses atau kode rahasia.");
      if(/transfer|deposit|top up|bayar|rekening|dana/.test(low))clues.push("Uraian menyebut pembayaran atau pemindahan dana.");
      if(/segera|sekarang|hari ini|cepat|dibekukan|hangus/.test(low))clues.push("Uraian memuat tekanan waktu atau ancaman akibat jika menunda.");
      if(/link|tautan|apk|unduh|download|qr/.test(low))clues.push("Uraian menyebut tautan, file, aplikasi, atau QR yang perlu diverifikasi.");
      if(!clues.length)clues.push("Belum ada tanda spesifik yang dapat dikenali dari uraian singkat ini.");
      const urlAnalysis=inspectUrlLocally(submittedUrl);
      if(urlAnalysis?.signals?.length)clues.unshift(...urlAnalysis.signals.map(signal=>signal.label));
      const localAssessment=urgent||matches.length||urlAnalysis?.signals?.length?"warning_signs":submittedUrl?"verify_independently":"insufficient_information";
      return {
        mode:urgent?"urgent":"rules",
        assessment:localAssessment,
        headline:urgent?"Ambil langkah pengamanan sekarang":localAssessment==="warning_signs"?"Ada tanda yang patut dicurigai":localAssessment==="verify_independently"?"Tetap periksa melalui kanal terpisah":"Belum cukup informasi",
        summary:urgent?"Karena uang, data, atau akses sudah diberikan, jangan menunggu analisis AI.":"Pemeriksaan tanpa AI tidak dapat memastikan pesan aman atau penipuan.",
        observedClues:clues,
        uncertainties:["Identitas pihak yang menghubungi belum terverifikasi.","Keaslian nomor, akun, dokumen, atau tautan tidak dapat dipastikan dari teks."],
        nextActions:urgent?["Buka bantuan sekarang dan ikuti urutan pengamanan.","Gunakan aplikasi atau kontak resmi yang Anda temukan secara mandiri."]:["Jangan klik, membayar, atau memberikan data tambahan.","Periksa melalui aplikasi, situs, atau nomor resmi yang Anda temukan sendiri."],
        immediateActions:urgent?[exposure==="money"?"Hubungi bank atau penyedia dompet digital melalui kanal resmi sekarang.":"Amankan akun dari perangkat tepercaya dan hubungi penyedia layanan resmi.","Simpan bukti tanpa menyebarkan data sensitif."]:[],
        relatedCards:matches,
        officialLinks:[],
        urlAnalysis,
        redaction:{applied:redactSensitive(raw)!==raw,count:0,categories:[]},
        notice:urgent?"Cabang darurat berjalan lokal dan tidak dikirim ke model.":"Layanan AI tidak dapat dijangkau; hasil ini berasal dari aturan lokal WargaSiaga.",
        disclaimer:"Hasil ini adalah panduan awal, bukan sertifikasi aman, keputusan hukum, atau verifikasi identitas.",
        retention:"Teks tidak dikirim ke penyedia model pada hasil lokal ini."
      };
    }

    function renderList(items){return `<ul>${(Array.isArray(items)?items:[]).map(item=>`<li>${escapeHtml(item)}</li>`).join("")}</ul>`;}
    function renderAssessment(payload){
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
        if(item?.feature==="urgent-help")return {key:"urgent-help",label:"Buka bantuan darurat",description:reason||"Amankan uang, akun, dan perangkat.",href:"bantuan-darurat.html",iconName:"alert",urgent:true};
        if(item?.feature==="modus-library")return {key:"modus-library",label:"Cari modus serupa",description:reason||"Bandingkan dengan katalog panduan.",href:"modus.html",iconName:"book"};
        if(item?.feature==="community-patterns")return {key:"community-patterns",label:"Buka Lapor Warga",description:reason||"Baca contoh anonim atau buat laporan demo.",href:"laporan.html",iconName:"users"};
        if(item?.feature==="guide"){
          const card=DATA.cards.find(candidate=>candidate.id===item.cardId);
          if(card)return {key:`guide:${card.id}`,label:card.title,description:reason||"Buka panduan modus terkait.",href:`modus-detail.html?id=${encodeURIComponent(card.id)}`,iconName:card.icon||"book"};
        }
        return null;
      }).filter(item=>item&&!featureKeys.has(item.key)&&featureKeys.add(item.key));
      const featureCards=features.map(item=>`<a class="feature-route${item.urgent?" urgent":""}" href="${item.href}"><span class="feature-route-icon">${icon(item.iconName)}</span><span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.description)}</small></span>${icon("arrow")}</a>`).join("");
      const officialActions=official.map(link=>`<a class="btn btn-secondary" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)} ${icon("external")}</a>`).join("");
      const redaction=payload.redaction?.applied?`${Number(payload.redaction.count)||"Beberapa"} bagian sensitif disamarkan sebelum dikirim ke layanan AI${payload.redaction.categories?.length?`: ${payload.redaction.categories.map(escapeHtml).join(", ")}`:""}.`:"Tidak ada pola data sensitif yang terdeteksi otomatis. Tetap periksa kembali teks Anda.";
      const urlPanel=payload.urlAnalysis?`<div class="url-analysis"><div><span class="analysis-mode">${icon("globeLock")} Link tidak dibuka</span><h3 class="result-title">${icon("link")} Pemeriksaan bentuk link (URL)</h3><code>${escapeHtml(payload.urlAnalysis.display||payload.urlAnalysis.host||"Link tidak valid")}</code></div>${payload.urlAnalysis.signals?.length?renderList(payload.urlAnalysis.signals.map(signal=>signal.label)):"<p>Tidak ada tanda yang terlihat dari bentuk link.</p>"}<p class="small muted">${escapeHtml(payload.urlAnalysis.note||"")}</p></div>`:"";
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
        <details class="result-disclosure"><summary>${icon("shieldCheck")} Privasi dan batasan</summary><div class="privacy-box"><p>${escapeHtml(redaction)}</p><p>${escapeHtml(payload.notice||"")}</p><p>${escapeHtml(payload.disclaimer||"")}</p><p>${escapeHtml(payload.retention||"")}</p></div></details>`;
      result.classList.remove("hidden");
      result.focus({preventScroll:true});
      result.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
    }

    form.addEventListener("submit",async event=>{
      event.preventDefault();
      await healthCheck;
      const raw=input.value.trim(), submittedUrl=urlInput.value.trim(), exposure=new FormData(form).get("exposure"), urgent=detectUrgentExposure(raw,exposure);
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
      if(urgent){renderAssessment(localResult(raw,exposure,true,submittedUrl));return;}
      submit.disabled=true;
      form.setAttribute("aria-busy","true");
      result.innerHTML=`<div class="ai-loading"><span class="loading-spinner" aria-hidden="true"></span><div><strong>Memeriksa tanda dengan aman…</strong><span>Data sensitif yang terdeteksi akan disamarkan sebelum dikirim ke layanan AI.</span></div></div>`;
      result.classList.remove("hidden");
      const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),18000);
      try{
        const response=await fetch("api/consult",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({text:raw,url:submittedUrl,exposure,consent:consent.checked}),signal:controller.signal});
        const payload=await response.json().catch(()=>null);
        if(!response.ok)throw new Error(payload?.error?.message||"Layanan belum dapat memproses permintaan.");
        renderAssessment(payload);
      }catch(_){
        renderAssessment(localResult(raw,exposure,false,submittedUrl));
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
    function update(){const chosen=choices.filter(x=>x.checked).map(x=>x.value);let visible=0;steps.forEach(s=>{const tags=s.dataset.for.split(" ");const hidden=chosen.length>0&&!tags.includes("all")&&!tags.some(x=>chosen.includes(x));s.classList.toggle("hidden",hidden);if(!hidden)visible++;});summary.textContent=chosen.length?`${visible} langkah yang relevan ditampilkan.`:"Semua langkah penting ditampilkan.";}
    choices.forEach(c=>c.addEventListener("change",update)); document.getElementById("print-page")?.addEventListener("click",()=>{toast("Membuka dialog cetak…");window.print();});
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
    function go(step){if(step===2){const fields=requiredFields();const missing=fields.filter(field=>fieldIsMissing(field));if(missing.length){const labels=missing.map(field=>document.querySelector(`label[for="${field.id}"]`)?.textContent.trim()).filter(Boolean);showFormError(error,`Lengkapi bidang berikut: ${labels.join(", ")}.`,missing);return;}clearFormError(error,fields);} document.querySelectorAll("[data-step]").forEach(x=>x.classList.toggle("hidden",Number(x.dataset.step)!==step)); document.querySelectorAll("[data-progress]").forEach(x=>{const current=Number(x.dataset.progress);x.classList.toggle("active",current<=step);if(current===step)x.setAttribute("aria-current","step");else x.removeAttribute("aria-current");}); if(step===2){document.getElementById("preview-channel").textContent=document.getElementById("report-channel").value;document.getElementById("preview-period").textContent=document.getElementById("report-period").value;const typeLabel=type.value==="other"?customType.value:type.selectedOptions[0]?.textContent||"";document.getElementById("preview-type").innerHTML=renderRedactedText(typeLabel);document.getElementById("preview-story").innerHTML=renderRedactedText(story.value);} const heading=document.querySelector(`[data-step="${step}"] h2`);heading?.focus({preventScroll:true});heading?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});}
    document.querySelectorAll("[data-next]").forEach(b=>b.addEventListener("click",()=>go(Number(b.dataset.next)))); document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>go(Number(b.dataset.back))));
    const consent=document.getElementById("report-consent"), submit=document.getElementById("submit-demo"); consent.addEventListener("change",()=>submit.disabled=!consent.checked);
    form.addEventListener("submit",e=>{e.preventDefault(); if(!consent.checked)return; form.classList.add("hidden");document.querySelector(".progress").classList.add("hidden");const success=document.getElementById("report-success");success.classList.remove("hidden");success.focus();});
    updateCustomType();
  }

  function initStatus() {
    const form=document.getElementById("status-form"); if(!form)return;
    const input=document.getElementById("status-code"), result=document.getElementById("status-result"), empty=document.getElementById("status-empty"), error=document.getElementById("status-error"); const query=new URLSearchParams(location.search).get("code"); if(query)input.value=query;
    input.addEventListener("input",()=>clearFormError(error,[input]));
    form.addEventListener("submit",e=>{e.preventDefault();const code=input.value.trim().toUpperCase();if(!code){result.classList.add("hidden");empty.classList.add("hidden");showFormError(error,"Masukkan kode laporan demo sebelum memeriksa status.",[input]);return;}clearFormError(error,[input]);const ok=code==="WS-DEMO-2401";result.classList.toggle("hidden",!ok);empty.classList.toggle("hidden",ok);const next=new URLSearchParams();next.set("code",code);history.replaceState(null,"",`${location.pathname}?${next}`);(ok?result:empty).focus();}); if(query)form.requestSubmit();
  }

  function initDetail() { const field=document.getElementById("share-url"); const button=document.getElementById("share-guide"); if(field)field.value=location.href; button?.addEventListener("click",async()=>{const disclosure=button.closest("details");if(disclosure)disclosure.open=true;try{await navigator.clipboard.writeText(location.href);button.innerHTML=`${icon("check")} Tautan disalin`;toast("Tautan panduan disalin");setTimeout(()=>button.innerHTML=`${icon("copy")} Salin tautan`,1800);}catch(_){field?.focus();field?.select();toast("Tautan dipilih. Tekan Ctrl+C untuk menyalin.");}}); }

  window.WS_UTILS = Object.freeze({ redactSensitive, detectUrgentExposure, escapeHtml });

  initShell(); initHomeAsk(); initFilters(); initConsult(); initUrgent(); initReport(); initStatus(); initDetail();
})();
