const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const projectRoot = path.resolve(__dirname, "..");
const profileDir = path.join(os.tmpdir(), `wargasiaga-chrome-${process.pid}`);
const outputDir = path.resolve(__dirname, "../../wargasiaga-dev-report/screenshots");
const appPort = 4300 + (process.pid % 500);
const baseUrl = `http://127.0.0.1:${appPort}`;
fs.mkdirSync(outputDir, { recursive: true });

const server = spawn(process.execPath, [
  path.resolve(projectRoot, "server/index.mjs")
], {
  cwd: projectRoot,
  env: { ...process.env, PORT: String(appPort), HOST: "127.0.0.1", AI_DISABLE: "1" },
  stdio: "ignore"
});
const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-allow-origins=*",
  "--remote-debugging-port=0",
  `--user-data-dir=${profileDir}`,
  "about:blank"
], { stdio: "ignore" });

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function getDebuggerUrl() {
  const portFile = path.join(profileDir, "DevToolsActivePort");
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if (fs.existsSync(portFile)) {
        const debugPort = fs.readFileSync(portFile, "utf8").split(/\r?\n/)[0];
        const pages = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
        const page = pages.find((target) => target.type === "page");
        if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      }
    } catch (_) {}
    await wait(100);
  }
  throw new Error("Chrome DevTools endpoint did not become ready.");
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/index.html`);
      if (response.ok) return;
    } catch (_) {}
    await wait(100);
  }
  throw new Error("Local preview server did not become ready.");
}

async function run() {
  const ws = new WebSocket(await getDebuggerUrl());
  await new Promise((resolve, reject) => { ws.addEventListener("open", resolve); ws.addEventListener("error", reject); });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  });
  function call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const callId = ++id;
      pending.set(callId, { resolve, reject });
      ws.send(JSON.stringify({ id: callId, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
  async function navigate(url) {
    const navigation = await call("Page.navigate", { url });
    if (navigation.errorText) throw new Error(`Navigation failed: ${navigation.errorText}`);
    let loaded = false;
    for (let i = 0; i < 50; i++) {
      if (await evaluate(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete'`)) { loaded = true; break; }
      await wait(50);
    }
    if (!loaded) throw new Error(`Page did not load: ${url}; current URL: ${await evaluate("location.href")}`);
    await wait(100);
  }
  async function capture(name) {
    const screenshot = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    fs.writeFileSync(path.join(outputDir, name), Buffer.from(screenshot.data, "base64"));
  }

  await waitForServer();
  await call("Page.enable");
  await call("Runtime.enable");
  await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await navigate(`${baseUrl}/index.html`);
  const home = await evaluate("({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, title: document.title, navItems: document.querySelectorAll('.bottom-link').length, brand:getComputedStyle(document.documentElement).getPropertyValue('--brand').trim(), theme:document.querySelector('meta[name=theme-color]').content, illustrationLoaded:document.querySelector('.hero-illustration').complete&&document.querySelector('.hero-illustration').naturalWidth>0, localIconCount:document.querySelectorAll('svg.lucide-icon[data-icon]').length, aiIcon:!!document.querySelector('[data-icon=bot]'), decorativeIconsHidden:[...document.querySelectorAll('svg.lucide-icon:not([role=img])')].every(icon=>icon.getAttribute('aria-hidden')==='true'), primaryAi:document.querySelector('#home-ask-form button[type=submit]')?.textContent.includes('Tanya AI'), sectionCount:document.querySelectorAll('main>section').length, routeCount:document.querySelectorAll('.route-card').length, legacyEntryCards:document.querySelectorAll('.entry-card').length, mainTextLength:document.querySelector('main').textContent.trim().length })");
  if (home.width > 425 || home.scrollWidth > home.width || home.navItems !== 4 || home.brand !== "#7a5af8" || home.theme !== "#7a5af8" || !home.illustrationLoaded || home.localIconCount < 20 || !home.aiIcon || !home.decorativeIconsHidden || !home.primaryAi || home.sectionCount !== 3 || home.routeCount !== 4 || home.legacyEntryCards !== 0 || home.mainTextLength > 1550) throw new Error(`Mobile home hierarchy/layout/theme/icons failed: ${JSON.stringify(home)}`);
  const shellControls = await evaluate(`(() => {
    const contrast=document.querySelector('#contrast-toggle');
    contrast.click();
    const contrastOn=document.body.classList.contains('high-contrast')&&contrast.getAttribute('aria-pressed')==='true'&&contrast.getAttribute('aria-label').includes('Nonaktifkan');
    contrast.click();
    const contrastOff=!document.body.classList.contains('high-contrast')&&contrast.getAttribute('aria-pressed')==='false';
    const menu=document.querySelector('#mobile-menu'), toggle=document.querySelector('#menu-toggle');
    toggle.click(); const menuOpened=menu.classList.contains('open')&&toggle.getAttribute('aria-expanded')==='true'&&toggle.getAttribute('aria-label')==='Tutup menu';
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    const escapeClosed=!menu.classList.contains('open')&&document.activeElement===toggle;
    toggle.click(); document.querySelector('main').click();
    const outsideClosed=!menu.classList.contains('open');
    return {contrastOn,contrastOff,menuOpened,escapeClosed,outsideClosed};
  })()`);
  if (Object.values(shellControls).some((value) => !value)) throw new Error(`Shared shell controls failed: ${JSON.stringify(shellControls)}`);
  await evaluate("document.querySelector('#toast').classList.remove('show'); document.querySelector('#toast').textContent='';");
  await capture("home-mobile-cdp.png");
  const emptyHomeAsk = await evaluate("(() => { const form=document.querySelector('#home-ask-form'),input=document.querySelector('#home-ask'),error=document.querySelector('#home-ask-error'); form.requestSubmit(); const inline=document.querySelector('#home-ask-required-error');return {summary:!error.classList.contains('hidden')&&document.activeElement===error,invalid:input.getAttribute('aria-invalid')==='true',inline:inline?.textContent==='pertanyaan ini perlu dijawab',describedBy:(input.getAttribute('aria-describedby')||'').split(/\\s+/).includes('home-ask-required-error')}; })()");
  if (Object.values(emptyHomeAsk).some((value) => !value)) throw new Error(`Home AI question needs an accessible inline empty-state error: ${JSON.stringify(emptyHomeAsk)}`);
  await evaluate("(() => { const input=document.querySelector('#home-ask'); input.value='Saya ditawari kerja dan diminta deposit'; input.dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('#home-ask-form').requestSubmit(); })()");
  let handoffLoaded = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { if (await evaluate("location.pathname.endsWith('/konsultasi.html')&&document.readyState==='complete'")) { handoffLoaded = true; break; } } catch (_) {}
    await wait(50);
  }
  if (!handoffLoaded) throw new Error("Home AI question did not open consultation.");
  const handoff = await evaluate("({prefilled:document.querySelector('#consult-input').value==='Saya ditawari kerja dan diminta deposit',bubble:[...document.querySelectorAll('.message.user')].some(item=>item.textContent.includes('diminta deposit')),queryRemoved:location.search==='',sessionCleared:sessionStorage.getItem('ws-home-question')===null})");
  if (Object.values(handoff).some((value) => !value)) throw new Error(`Home-to-AI handoff failed: ${JSON.stringify(handoff)}`);

  await navigate(`${baseUrl}/modus.html`);
  const catalogueVisuals = await evaluate(`(async()=>{
    const images=[...document.querySelectorAll('.catalog-hero-visual img,.age-portrait:not(.age-all),.modus-card-media img')];
    images.forEach(image=>{image.loading='eager';});
    await Promise.race([Promise.all(images.map(image=>image.complete?Promise.resolve():new Promise(resolve=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true});}))),new Promise(resolve=>setTimeout(resolve,3000))]);
    const hero=document.querySelector('.catalog-hero-visual img');
    const portraits=[...document.querySelectorAll('.age-portrait:not(.age-all)')];
    const cardImages=[...document.querySelectorAll('.modus-card-media img')];
    return {heroLoaded:hero?.naturalWidth>0,heroRatio:Number((hero?.getBoundingClientRect().width/hero?.getBoundingClientRect().height).toFixed(2)),portraits:portraits.length,portraitsLoaded:portraits.every(image=>image.naturalWidth>0),cardImages:cardImages.length,cardImagesLoaded:cardImages.every(image=>image.naturalWidth>0),scrollWidth:document.documentElement.scrollWidth};
  })()`);
  if (!catalogueVisuals.heroLoaded || Math.abs(catalogueVisuals.heroRatio-1.5)>.04 || catalogueVisuals.portraits !== 4 || !catalogueVisuals.portraitsLoaded || catalogueVisuals.cardImages !== 13 || !catalogueVisuals.cardImagesLoaded || catalogueVisuals.scrollWidth > home.width) throw new Error(`Catalogue visual system failed: ${JSON.stringify(catalogueVisuals)}`);
  const catalogueControls = await evaluate(`(() => {
    const toggle=document.querySelector('#filter-toggle'), panel=document.querySelector('#filter-panel');
    toggle.click(); const filterOpened=panel.classList.contains('open')&&toggle.getAttribute('aria-expanded')==='true'&&toggle.textContent.includes('Tutup filter');
    toggle.click(); const filterClosed=!panel.classList.contains('open')&&toggle.getAttribute('aria-expanded')==='false';
    const first=document.querySelector('#filter-panel input[type=checkbox]'); first.checked=true; first.dispatchEvent(new Event('change',{bubbles:true}));
    const checkboxApplied=new URLSearchParams(location.search).getAll(first.name).includes(first.value);
    document.querySelector('#reset-filter').click();
    const resetWorked=!document.querySelector('#filter-panel input:checked')&&document.querySelector('#age-selector input[value="all"]').checked&&!location.search;
    const search=document.querySelector('#modus-search'); search.value='deposit'; search.dispatchEvent(new Event('input',{bubbles:true}));
    document.querySelector('#search-clear').click();
    const clearWorked=search.value===''&&!location.search&&document.querySelectorAll('.modus-card:not(.hidden)').length===WS_DATA.cards.length;
    return {filterOpened,filterClosed,checkboxApplied,resetWorked,clearWorked};
  })()`);
  if (Object.values(catalogueControls).some((value) => !value)) throw new Error(`Catalogue controls failed: ${JSON.stringify(catalogueControls)}`);
  const filtered = await evaluate(`(() => { const input=document.querySelector('#modus-search'); input.value='deposit'; input.dispatchEvent(new Event('input',{bubbles:true})); return { count:document.querySelectorAll('.modus-card:not(.hidden)').length, scrollWidth:document.documentElement.scrollWidth, chipCount:document.querySelectorAll('.filter-chip').length, query:new URLSearchParams(location.search).get('q') }; })()`);
  if (filtered.count < 1 || filtered.count >= await evaluate("WS_DATA.cards.length") || filtered.scrollWidth > home.width || filtered.chipCount !== 1 || filtered.query !== "deposit") throw new Error(`Catalogue interaction failed: ${JSON.stringify(filtered)}`);
  await evaluate("document.querySelector('#modus-search').scrollIntoView({block:'start'})");
  await wait(150);
  await capture("catalogue-filter-mobile-cdp.png");
  const chipRemoved = await evaluate(`(() => { document.querySelector('.filter-chip').click(); return !location.search&&document.querySelector('#modus-search').value===''&&document.querySelectorAll('.modus-card:not(.hidden)').length===WS_DATA.cards.length; })()`);
  if (!chipRemoved) throw new Error("Active filter chip did not clear its filter.");
  const ageFilter = await evaluate(`(() => { const choice=document.querySelector('#age-selector input[value="kids"]');choice.checked=true;choice.dispatchEvent(new Event('change',{bubbles:true}));const visible=[...document.querySelectorAll('.modus-card:not(.hidden)')].map(card=>card.dataset.cardId);const expected=WS_DATA.cards.filter(card=>card.ageGroups.includes('kids')).map(card=>card.id);const links=[...document.querySelectorAll('.modus-card:not(.hidden) [data-guide-link]')];return {query:new URLSearchParams(location.search).get('age'),visible,expected,chip:document.querySelector('[data-filter-key="age"]')?.textContent.includes('Anak'),linksPreserveAge:links.length>0&&links.every(link=>new URL(link.href).searchParams.get('age')==='kids')}; })()`);
  if (ageFilter.query !== "kids" || !ageFilter.chip || !ageFilter.linksPreserveAge || JSON.stringify(ageFilter.visible.sort()) !== JSON.stringify(ageFilter.expected.sort())) throw new Error(`Age catalogue filter failed: ${JSON.stringify(ageFilter)}`);
  const ageChipRemoved = await evaluate(`(() => { document.querySelector('[data-filter-key="age"]').click();return document.querySelector('#age-selector input[value="all"]').checked&&!new URLSearchParams(location.search).has('age')&&document.querySelectorAll('.modus-card:not(.hidden)').length===WS_DATA.cards.length; })()`);
  if (!ageChipRemoved) throw new Error("Age filter chip did not restore all guides.");

  await navigate(`${baseUrl}/modus-detail.html?id=game-reward-account&age=kids`);
  const ageDetail = await evaluate(`(() => { const back=document.querySelector('.breadcrumb a[href^="modus.html"]'),guide=document.querySelector('.context-visual img'),capture=document.querySelector('.capture-open img'),avatar=document.querySelector('.audience-avatar');return {heading:document.querySelector('.audience-note strong')?.textContent==='Panduan untuk Anak',guidance:document.querySelector('.audience-note')?.textContent.includes('orang dewasa tepercaya'),backAge:new URL(back.href).searchParams.get('age')==='kids',shareAge:new URL(document.querySelector('#share-url').value).searchParams.get('age')==='kids',avatarLoaded:avatar?.complete&&avatar?.naturalWidth>0,guideLoaded:guide?.complete&&guide?.naturalWidth>0,guideRatio:Number((guide?.getBoundingClientRect().width/guide?.getBoundingClientRect().height).toFixed(2)),captureLoaded:capture?.complete&&capture?.naturalWidth>0,captureRatio:Number((capture?.getBoundingClientRect().width/capture?.getBoundingClientRect().height).toFixed(2)),signals:document.querySelectorAll('.capture-signals li').length,flowSteps:document.querySelectorAll('.safe-flow-grid li').length,visualDisclaimer:document.querySelector('.capture-disclaimer')?.textContent.includes('Bukan chat asli'),source:document.querySelector('.capture-source')?.hostname.length>0,scrollWidth:document.documentElement.scrollWidth}; })()`);
  if (!ageDetail.heading || !ageDetail.guidance || !ageDetail.backAge || !ageDetail.shareAge || !ageDetail.avatarLoaded || !ageDetail.guideLoaded || Math.abs(ageDetail.guideRatio-1.5)>.04 || !ageDetail.captureLoaded || Math.abs(ageDetail.captureRatio-.8)>.03 || ageDetail.signals !== 3 || ageDetail.flowSteps !== 3 || !ageDetail.visualDisclaimer || !ageDetail.source || ageDetail.scrollWidth > home.width) throw new Error(`Age-aware guide detail failed: ${JSON.stringify(ageDetail)}`);
  const captureDialog = await evaluate(`(async() => { const open=document.querySelector('#capture-open'),dialog=document.querySelector('#capture-dialog'),close=document.querySelector('#capture-close');open.click();const opened=dialog.open&&document.activeElement===close;const transcript=dialog.querySelectorAll('.capture-transcript li').length===3;close.click();await new Promise(resolve=>setTimeout(resolve,0));return {opened,transcript,closed:!dialog.open,focusReturned:document.activeElement===open}; })()`);
  if (Object.values(captureDialog).some(value=>!value)) throw new Error(`Case reconstruction dialog failed: ${JSON.stringify(captureDialog)}`);
  await capture("modus-detail-age-mobile-cdp.png");
  await evaluate("document.querySelector('.case-learning').scrollIntoView({block:'start',behavior:'auto'})");
  await wait(120);
  await capture("modus-detail-case-mobile-cdp.png");

  await navigate(`${baseUrl}/bantu-orang-lain.html`);
  const supportJourney = await evaluate("({heading:document.querySelector('h1')?.textContent.includes('Bantu orang terdekat'),steps:document.querySelectorAll('.support-steps .step').length,balanced:document.querySelectorAll('.support-list').length,urgent:document.querySelector('.urgent-shortcut')?.getAttribute('href')==='bantuan-darurat.html',scrollWidth:document.documentElement.scrollWidth})");
  if (!supportJourney.heading || supportJourney.steps !== 3 || supportJourney.balanced !== 2 || !supportJourney.urgent || supportJourney.scrollWidth > home.width) throw new Error(`Help-a-loved-one journey failed: ${JSON.stringify(supportJourney)}`);
  await capture("support-mobile-cdp.png");

  await navigate(`${baseUrl}/konsultasi.html`);
  const consultStructure = await evaluate("({ primaryAction:document.querySelector('#consult-submit')?.textContent.includes('Periksa sekarang'), optionalInputs:document.querySelectorAll('.input-disclosure').length, closedByDefault:[...document.querySelectorAll('.input-disclosure')].every(item=>!item.open), urgentShortcut:document.querySelector('.urgent-shortcut')?.getAttribute('href')==='bantuan-darurat.html', heroVisual:document.querySelector('.page-hero-visual img')?.complete&&document.querySelector('.page-hero-visual img')?.naturalWidth>0, removedGuideSection:document.querySelectorAll('.principle-grid').length===0 })");
  if (Object.values(consultStructure).some((value) => !value)) throw new Error(`AI-first consultation structure failed: ${JSON.stringify(consultStructure)}`);
  const consult = await evaluate(`(async() => { const form=document.querySelector('#consult-form'), input=document.querySelector('#consult-input'), prompts=[...document.querySelectorAll('.quick-prompt')], error=document.querySelector('#consult-error'); form.requestSubmit(); await new Promise(resolve=>setTimeout(resolve,80)); const inline=[...document.querySelectorAll('.question-required-error')];const errorSummary=!error.classList.contains('hidden')&&document.activeElement===error&&input.getAttribute('aria-invalid')==='true'&&inline.length===1&&inline[0].id==='exposure-required-error'&&inline[0].textContent==='pertanyaan ini perlu dijawab'; const promptWorked=prompts.every(prompt=>{prompt.click();return input.value===prompt.dataset.prompt&&document.querySelector('#consult-count').textContent===String(input.value.length)&&document.activeElement===input;}); input.value='Uang sudah terkirim dan OTP tadi saya kasih'; input.dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('input[name="exposure"][value="money"]').checked=true; form.requestSubmit(); await new Promise(resolve=>setTimeout(resolve,80)); return { errorSummary, promptWorked, visible:!document.querySelector('#consult-result').classList.contains('hidden'), focused:document.activeElement===document.querySelector('#consult-result'), urgent:document.querySelector('#consult-result').textContent.includes('Ambil langkah pengamanan sekarang'), phraseCoverage:['uang sudah terkirim','sudah mentransfer','OTP tadi saya kasih'].every(text=>WS_UTILS.detectUrgentExposure(text,'none'))&&!WS_UTILS.detectUrgentExposure('Hasil baru cair setelah membayar deposit aktivasi','none'), localNotice:document.querySelector('#consult-result').textContent.includes('tidak dikirim ke model') }; })()`);
  if (Object.values(consult).some((value) => !value)) throw new Error(`Consultation controls failed: ${JSON.stringify(consult)}`);
  await wait(500);
  await capture("consult-urgent-mobile-cdp.png");

  await navigate(`${baseUrl}/konsultasi.html`);
  const aiConsult = await evaluate(`(async()=>{
    const nativeFetch=window.fetch;
    window.fetch=async(url,options)=>String(url).includes('api/consult')?new Response(JSON.stringify({mode:'ai',assessment:'warning_signs',headline:'Ada tanda yang patut dicurigai',summary:'Permintaan deposit sebelum bekerja perlu dicurigai.',observedClues:['Diminta membayar deposit sebelum mulai bekerja.'],uncertainties:['Identitas perekrut belum terverifikasi.'],nextActions:['Jangan membayar dan periksa perusahaan secara mandiri.'],immediateActions:[],relatedCards:[{id:'job-deposit',title:'Lowongan kerja yang meminta deposit'}],featureRecommendations:[{feature:'guide',cardId:'job-deposit',reason:'Panduan ini paling dekat dengan tanda yang ditemukan.'},{feature:'community-patterns',reason:'Lihat contoh pola anonim yang dilaporkan warga.'}],officialLinks:[{label:'CekRekening — Komdigi',url:'https://cekrekening.id/'}],urlAnalysis:{display:'http://secure-login.example/path?[parameter disembunyikan]',host:'secure-login.example',signals:[{code:'unencrypted_scheme',label:'URL memakai HTTP, bukan HTTPS.'}],fetched:false,note:'WargaSiaga tidak membuka URL ini.'},redaction:{applied:false,count:0,categories:[]},notice:'Analisis AI menggunakan konteks kartu WargaSiaga.',disclaimer:'Bukan sertifikasi aman.',retention:'Tidak disimpan WargaSiaga.'}),{status:200,headers:{'Content-Type':'application/json'}}):nativeFetch(url,options);
    const form=document.querySelector('#consult-form'),input=document.querySelector('#consult-input');
    document.querySelector('input[name="exposure"][value="none"]').checked=true;
    document.querySelector('#consult-consent').checked=true;
    input.value='Saya diminta deposit sebelum mulai bekerja.';
    document.querySelector('#consult-url').value='http://secure-login.example/path?token=secret';
    input.dispatchEvent(new Event('input',{bubbles:true}));
    form.requestSubmit();
    for(let i=0;i<30&&!document.querySelector('#consult-result').textContent.includes('Pemeriksaan awal dengan AI');i++)await new Promise(resolve=>setTimeout(resolve,20));
    const result=document.querySelector('#consult-result');
    return {mode:result.textContent.includes('Pemeriksaan awal dengan AI'),clue:result.textContent.includes('deposit sebelum mulai bekerja'),card:!!result.querySelector('a[href*="job-deposit"]'),community:!!result.querySelector('a[href="laporan.html"]'),featureHeading:result.textContent.includes('Lanjutkan di WargaSiaga'),featureReason:result.textContent.includes('Panduan ini paling dekat dengan tanda yang ditemukan.'),official:!!result.querySelector('a[href="https://cekrekening.id/"]'),urlPanel:result.textContent.includes('Link tidak dibuka')&&result.textContent.includes('parameter disembunyikan'),urlNotClickable:!result.querySelector('a[href*="secure-login.example"]'),resultIcons:['globeLock','badgeCheck','scanSearch','circleHelp','route','shieldCheck'].every(name=>result.querySelector('[data-icon="'+name+'"]')),focused:document.activeElement===result};
  })()`);
  if (Object.values(aiConsult).some((value) => !value)) throw new Error(`AI consultation UI failed: ${JSON.stringify(aiConsult)}`);
  await evaluate("window.scrollTo({top:document.querySelector('#consult-result').getBoundingClientRect().top+window.scrollY-90,behavior:'auto'})");
  await wait(150);
  await capture("consult-ai-url-mobile-cdp.png");
  await evaluate("window.scrollTo({top:document.querySelector('.next-destinations').getBoundingClientRect().top+window.scrollY-120,behavior:'auto'})");
  await wait(100);
  await capture("consult-ai-features-mobile-cdp.png");

  await navigate(`${baseUrl}/konsultasi.html`);
  const imageConsult = await evaluate(`(async()=>{
    const tokenF1=(expected,actual)=>{const tokens=value=>value.toLowerCase().match(/[a-z0-9]+/g)||[],left=tokens(expected),right=tokens(actual),counts=new Map();left.forEach(token=>counts.set(token,(counts.get(token)||0)+1));let matches=0;right.forEach(token=>{if((counts.get(token)||0)>0){matches++;counts.set(token,counts.get(token)-1);}});const precision=right.length?matches/right.length:0,recall=left.length?matches/left.length:0;return precision+recall?2*precision*recall/(precision+recall):0;};
    const response=await fetch('/tests/fixtures/ocr-deposit.png');
    const file=new File([await response.blob()],'ocr-deposit.png',{type:'image/png'});
    const transfer=new DataTransfer(); transfer.items.add(file);
    const input=document.querySelector('#consult-image'); input.files=transfer.files; input.dispatchEvent(new Event('change',{bubbles:true}));
    const previewReady=!document.querySelector('#image-preview-wrap').classList.contains('hidden')&&!document.querySelector('#analyze-image').classList.contains('hidden');
    document.querySelector('#analyze-image').click();
    for(let i=0;i<300&&!/^Selesai:|tidak berhasil/.test(document.querySelector('#image-status').textContent);i++)await new Promise(resolve=>setTimeout(resolve,100));
    const status=document.querySelector('#image-status').textContent, text=document.querySelector('#consult-input').value.toLowerCase();
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=240;const context=canvas.getContext('2d');context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.fillStyle='#111827';context.font='36px Arial';context.fillText('Pesan kurir meminta cek',35,85);context.fillText('https://paket.example/login sekarang',35,155);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));const analyzer=await import('/assets/js/image-analyzer.js');const captured=await analyzer.analyzeImageLocally(new File([blob],'capture-url.png',{type:'image/png'}));
    return {previewReady,completed:status.startsWith('Selesai:'),localCopy:document.querySelector('#consult-image-help').textContent.includes('tidak diunggah'),ocrText:text.includes('deposit')&&text.includes('bayar'),cleanTokenF1:Number(tokenF1('Tawaran kerja Bayar deposit sekarang',text).toFixed(3)),capturedTokenF1:Number(tokenF1('Pesan kurir meminta cek https paket example login sekarang',captured.text).toFixed(3)),capturedUrl:captured.detectedUrls.some(url=>url.toLowerCase().includes('paket.example/login')),capturedLocal:captured.localOnly===true};
  })()`);
  if (!imageConsult.previewReady || !imageConsult.completed || !imageConsult.localCopy || !imageConsult.ocrText || imageConsult.cleanTokenF1 < .9 || imageConsult.capturedTokenF1 < .85 || !imageConsult.capturedUrl || !imageConsult.capturedLocal) throw new Error(`Local screenshot OCR failed: ${JSON.stringify(imageConsult)}`);
  await evaluate("window.scrollTo({top:document.querySelector('#image-preview-wrap').getBoundingClientRect().top+window.scrollY-180,behavior:'auto'})");
  await wait(150);
  await capture("consult-image-ocr-mobile-cdp.png");

  await navigate(`${baseUrl}/bantuan-darurat.html`);
  const urgentControls = await evaluate(`(() => {
    const expected={money:3,otp:4,app:3,identity:3};
    const allChoices=[...document.querySelectorAll('#incident-choices input')];
    const eachChoice=allChoices.every(choice=>{choice.checked=true;choice.dispatchEvent(new Event('change',{bubbles:true}));const works=document.querySelectorAll('#emergency-steps .emergency-step:not(.hidden)').length===expected[choice.value]&&document.querySelector('#incident-summary').textContent.includes(expected[choice.value]+' langkah');choice.checked=false;choice.dispatchEvent(new Event('change',{bubbles:true}));return works;});
    const restored=document.querySelectorAll('#emergency-steps .emergency-step:not(.hidden)').length===6&&document.querySelector('#incident-summary').textContent.includes('Semua');
    window.__printCalled=0; window.print=()=>window.__printCalled++;
    document.querySelector('#print-page').click();
    return {eachChoice,restored,printCalled:window.__printCalled===1,printFeedback:document.querySelector('#toast').textContent.includes('dialog cetak')};
  })()`);
  if (Object.values(urgentControls).some((value) => !value)) throw new Error(`Urgent-page controls failed: ${JSON.stringify(urgentControls)}`);

  await navigate(`${baseUrl}/laporan.html`);
  const communityVisual = await evaluate("document.querySelector('.page-hero-visual img')?.complete&&document.querySelector('.page-hero-visual img')?.naturalWidth>0");
  if (!communityVisual) throw new Error("Community hero illustration did not load.");

  await navigate(`${baseUrl}/lapor.html`);
  const report = await evaluate(`(() => { const next=document.querySelector('[data-next="2"]'), error=document.querySelector('#report-error');next.click();const inline=[...document.querySelectorAll('.question-required-error')];const errorSummary=!error.classList.contains('hidden')&&document.activeElement===error&&document.querySelectorAll('[aria-invalid="true"]').length===4&&inline.length===4&&inline.every(item=>item.textContent==='pertanyaan ini perlu dijawab'); document.querySelector('#report-channel').value='WhatsApp'; document.querySelector('#report-period').value='7 hari terakhir'; const type=document.querySelector('#report-type');type.value='other';type.dispatchEvent(new Event('change',{bubbles:true})); const story=document.querySelector('#report-story'); story.value='Hubungi saya di 081234567890, OTP 1234, atau nama@email.com dan buka https://contoh.test'; next.click();const customRequired=document.querySelector('#report-type-other').required&&!document.querySelector('#report-type-other-wrap').classList.contains('hidden')&&document.querySelector('#report-type-other-required-error')?.textContent==='pertanyaan ini perlu dijawab';document.querySelector('#report-type-other').value='Tiket dari 081298765432';document.querySelector('#report-type-other').dispatchEvent(new Event('input',{bubbles:true}));next.click(); const preview=document.querySelector('#preview-story'),typePreview=document.querySelector('#preview-type'); return { errorSummary, customRequired, customPreview:typePreview.textContent,customHighlights:typePreview.querySelectorAll('.redacted').length, text:preview.textContent, highlights:preview.querySelectorAll('.redacted').length }; })()`);
  if (!report.errorSummary || !report.customRequired || report.customPreview !== "Tiket dari [NOMOR DISAMARKAN]" || report.customHighlights !== 1 || !report.text.includes("[NOMOR DISAMARKAN]") || !report.text.includes("[ANGKA DISAMARKAN]") || !report.text.includes("[EMAIL DISAMARKAN]") || !report.text.includes("[TAUTAN DISAMARKAN]") || report.highlights !== 4) throw new Error(`Report redaction failed: ${JSON.stringify(report)}`);
  await evaluate("document.querySelector('#preview-story').scrollIntoView({block:'center'})");
  await wait(150);
  await capture("report-redaction-mobile-cdp.png");
  const escaping = await evaluate("WS_UTILS.escapeHtml('<img src=x onerror=alert(1)>') === '&lt;img src=x onerror=alert(1)&gt;'");
  if (!escaping) throw new Error("HTML escaping failed.");
  const reportControls = await evaluate(`(() => {
    const section=(step)=>document.querySelector('[data-step="'+step+'"]');
    document.querySelector('[data-back="1"]').click();
    const backOne=!section(1).classList.contains('hidden')&&document.querySelector('[data-progress="1"]').getAttribute('aria-current')==='step';
    document.querySelector('[data-next="2"]').click(); document.querySelector('[data-next="3"]').click();
    const stepThree=!section(3).classList.contains('hidden')&&document.querySelector('[data-progress="3"]').getAttribute('aria-current')==='step';
    const submit=document.querySelector('#submit-demo'), consent=document.querySelector('#report-consent');
    const disabledInitially=submit.disabled; consent.click(); const enabledAfterConsent=!submit.disabled;
    document.querySelector('[data-back="2"]').click(); const backTwo=!section(2).classList.contains('hidden');
    document.querySelector('[data-next="3"]').click(); submit.click();
    const completed=!document.querySelector('#report-success').classList.contains('hidden')&&document.activeElement===document.querySelector('#report-success');
    return {backOne,stepThree,disabledInitially,enabledAfterConsent,backTwo,completed};
  })()`);
  if (Object.values(reportControls).some((value) => !value)) throw new Error(`Report journey controls failed: ${JSON.stringify(reportControls)}`);

  await navigate(`${baseUrl}/status-laporan.html`);
  const statusControls = await evaluate(`(() => {
    const input=document.querySelector('#status-code'), form=document.querySelector('#status-form'), result=document.querySelector('#status-result'), empty=document.querySelector('#status-empty');
    form.requestSubmit(); const emptyError=!document.querySelector('#status-error').classList.contains('hidden')&&document.activeElement===document.querySelector('#status-error')&&input.getAttribute('aria-invalid')==='true'&&document.querySelector('#status-code-required-error')?.textContent==='pertanyaan ini perlu dijawab';
    input.value='SALAH'; form.requestSubmit();
    const invalidShown=!empty.classList.contains('hidden')&&result.classList.contains('hidden')&&document.activeElement===empty&&new URLSearchParams(location.search).get('code')==='SALAH';
    input.value='ws-demo-2401'; form.requestSubmit();
    const validShown=!result.classList.contains('hidden')&&empty.classList.contains('hidden')&&document.activeElement===result&&new URLSearchParams(location.search).get('code')==='WS-DEMO-2401';
    return {emptyError,invalidShown,validShown};
  })()`);
  if (Object.values(statusControls).some((value) => !value)) throw new Error(`Status controls failed: ${JSON.stringify(statusControls)}`);

  await navigate(`${baseUrl}/modus-detail.html?id=bank-otp`);
  const detailStructure = await evaluate("({ primaryAi:document.querySelector('.article-head .btn-primary')?.getAttribute('href')==='konsultasi.html', urgentAction:document.querySelector('.article-head .btn-urgent')?.getAttribute('href')==='bantuan-darurat.html', disclosures:document.querySelectorAll('.article-content>.content-disclosure').length, allCollapsed:[...document.querySelectorAll('.article-content>.content-disclosure')].every(item=>!item.open), priorityVisible:!!document.querySelector('.priority-section'),literacy:!!document.querySelector('.literacy-reference'),literacyPage:document.querySelector('.literacy-reference')?.textContent.includes('halaman 20'),rightsNotice:document.querySelector('.literacy-reference')?.textContent.includes('hak publikasi perlu dikonfirmasi') })");
  if (!detailStructure.primaryAi || !detailStructure.urgentAction || detailStructure.disclosures < 3 || !detailStructure.allCollapsed || !detailStructure.priorityVisible || !detailStructure.literacy || !detailStructure.literacyPage || !detailStructure.rightsNotice) throw new Error(`Guide progressive disclosure failed: ${JSON.stringify(detailStructure)}`);
  const shareControl = await evaluate(`(async()=>{
    const button=document.querySelector('#share-guide'), field=document.querySelector('#share-url');
    button.click(); await new Promise(resolve=>setTimeout(resolve,80));
    const success=button.textContent.includes('Tautan disalin');
    const fallback=document.activeElement===field&&field.selectionStart===0&&field.selectionEnd===field.value.length;
    return {fieldMatches:field.value===location.href,handled:success||fallback};
  })()`);
  if (!shareControl.fieldMatches || !shareControl.handled) throw new Error(`Share control failed: ${JSON.stringify(shareControl)}`);

  await navigate(`${baseUrl}/modus-detail.html?id=marketplace-diversion`);
  const marketplaceLiteracy = await evaluate(`(async()=>{const panel=document.querySelector('.literacy-reference'),image=panel?.querySelector('img');panel.open=true;panel.scrollIntoView({block:'start'});if(image){image.loading='eager';if(!image.complete)await Promise.race([new Promise(resolve=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true});}),new Promise(resolve=>setTimeout(resolve,3000))]);}return {exists:!!panel,open:panel.open,loaded:image?.naturalWidth>0,page:panel?.textContent.includes('halaman 12'),plainGuidance:panel?.textContent.includes('Buka aplikasi marketplace sendiri'),source:panel?.querySelector('.source-link')?.hostname==='www.scamwatch.gov.au',noLeakedAccount:!panel?.textContent.includes('Aman Sembako'),scrollWidth:document.documentElement.scrollWidth};})()`);
  if (!marketplaceLiteracy.exists || !marketplaceLiteracy.open || !marketplaceLiteracy.loaded || !marketplaceLiteracy.page || !marketplaceLiteracy.plainGuidance || !marketplaceLiteracy.source || !marketplaceLiteracy.noLeakedAccount || marketplaceLiteracy.scrollWidth > home.width) throw new Error(`Marketplace PDF literacy mapping failed: ${JSON.stringify(marketplaceLiteracy)}`);
  await evaluate("document.documentElement.style.scrollBehavior='auto'; const target=document.querySelector('.literacy-reference'); window.scrollTo(0,target.getBoundingClientRect().top+window.scrollY-80)");
  await wait(250);
  await capture("literacy-marketplace-mobile-cdp.png");

  await navigate(`${baseUrl}/modus-detail.html?id=invoice-redirection`);
  const domainLiteracy = await evaluate(`(async()=>{const panel=document.querySelector('.literacy-reference'),image=panel?.querySelector('img');panel.open=true;panel.scrollIntoView({block:'start'});if(image){image.loading='eager';if(!image.complete)await Promise.race([new Promise(resolve=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true});}),new Promise(resolve=>setTimeout(resolve,3000))]);}return {loaded:image?.naturalWidth>0,page:panel?.textContent.includes('halaman 16'),nuance:panel?.textContent.includes('bukan bukti tunggal'),source:panel?.querySelector('.source-link')?.hostname==='pusiknas.polri.go.id',scrollWidth:document.documentElement.scrollWidth};})()`);
  if (!domainLiteracy.loaded || !domainLiteracy.page || !domainLiteracy.nuance || !domainLiteracy.source || domainLiteracy.scrollWidth > home.width) throw new Error(`Lookalike-domain PDF literacy mapping failed: ${JSON.stringify(domainLiteracy)}`);

  await navigate(`${baseUrl}/modus-detail.html?id=tidak-ada`);
  const missing = await evaluate("({ notFound:document.body.textContent.includes('Panduan tidak ditemukan'), leakedGuide:document.body.textContent.includes(WS_DATA.cards[0].title) })");
  if (!missing.notFound || missing.leakedGuide) throw new Error(`Invalid detail handling failed: ${JSON.stringify(missing)}`);

  await navigate(`${baseUrl}/tentang.html`);
  const aboutStructure = await evaluate("({ tabs:document.querySelectorAll('.section-tabs a').length, services:document.querySelectorAll('.service-card').length, disclosures:document.querySelectorAll('.disclosure-stack>.content-disclosure').length, collapsed:[...document.querySelectorAll('.disclosure-stack>.content-disclosure')].every(item=>!item.open) })");
  if (aboutStructure.tabs !== 4 || aboutStructure.services !== 4 || aboutStructure.disclosures !== 3 || !aboutStructure.collapsed) throw new Error(`About-page progressive disclosure failed: ${JSON.stringify(aboutStructure)}`);

  await call("Emulation.setEmulatedMedia", { features: [{ name:"prefers-reduced-motion", value:"reduce" }] });
  await navigate(`${baseUrl}/konsultasi.html`);
  const reducedMotion = await evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches&&getComputedStyle(document.documentElement).scrollBehavior==='auto'");
  if (!reducedMotion) throw new Error("Reduced-motion behavior was not applied.");
  await call("Emulation.setEmulatedMedia", { features: [] });

  const routes = ["index.html","modus.html","modus-detail.html?id=bank-otp","konsultasi.html","bantu-orang-lain.html","bantuan-darurat.html","laporan.html","lapor.html","status-laporan.html","tentang.html"];
  const viewports = [
    { name:"small-phone", width:375, height:812, mobile:true },
    { name:"phone-landscape", width:844, height:390, mobile:true },
    { name:"tablet", width:768, height:1024, mobile:false },
    { name:"laptop", width:1024, height:768, mobile:false },
    { name:"desktop", width:1440, height:1000, mobile:false }
  ];
  for (const viewport of viewports) {
    await call("Emulation.setDeviceMetricsOverride", { width:viewport.width, height:viewport.height, deviceScaleFactor:1, mobile:viewport.mobile });
    for (const route of routes) {
      await navigate(`${baseUrl}/${route}`);
      const layout = await evaluate("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,mainText:document.querySelector('main')?.textContent.trim().length||0})");
      if (layout.scrollWidth > layout.width || layout.mainText < 20) throw new Error(`Responsive matrix failed at ${viewport.name}/${route}: ${JSON.stringify(layout)}`);
    }
  }

  await call("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate(`${baseUrl}/index.html`);
  const desktop = await evaluate("({ width:innerWidth, scrollWidth:document.documentElement.scrollWidth, desktopNav:getComputedStyle(document.querySelector('.desktop-nav')).display, primary:getComputedStyle(document.querySelector('.btn-primary')).backgroundColor })");
  if (desktop.width !== 1440 || desktop.scrollWidth > desktop.width || desktop.desktopNav === "none" || desktop.primary !== "rgb(122, 90, 248)") throw new Error(`Desktop purple layout failed: ${JSON.stringify(desktop)}`);
  await capture("home-desktop-cdp.png");
  await navigate(`${baseUrl}/konsultasi.html`);
  await capture("consult-redesign-desktop-cdp.png");
  await evaluate(`(async()=>{
    document.querySelector('.quick-prompt')?.click();
    document.querySelector('input[name="exposure"][value="none"]').checked=true;
    document.querySelector('#consult-consent').checked=true;
    document.querySelector('#consult-form').requestSubmit();
    await new Promise(resolve=>setTimeout(resolve, 350));
  })()`);
  await capture("consult-desktop-submitted-cdp.png");
  await navigate(`${baseUrl}/modus-detail.html?id=job-deposit`);
  await capture("modus-detail-redesign-desktop-cdp.png");
  await navigate(`${baseUrl}/tentang.html`);
  await capture("about-redesign-desktop-cdp.png");
  await navigate(`${baseUrl}/modus.html`);
  await evaluate("window.scrollTo({top:document.querySelector('.literacy-strip').getBoundingClientRect().top+window.scrollY-140,behavior:'auto'})");
  await wait(100);
  await capture("literacy-reference-desktop-cdp.png");
  await navigate(`${baseUrl}/modus-detail.html?id=marketplace-diversion`);
  await evaluate("document.documentElement.style.scrollBehavior='auto'; const target=document.querySelector('.literacy-reference'); target.open=true; window.scrollTo(0,target.getBoundingClientRect().top+window.scrollY-100)");
  await wait(250);
  await capture("literacy-guide-desktop-cdp.png");
  await navigate(`${baseUrl}/bantu-orang-lain.html`);
  await capture("support-desktop-cdp.png");

  if (errors.length) throw new Error(`Browser exceptions: ${errors.join(", ")}`);
  console.log(`Integrated dev-server browser audit passed: AI UI, non-clickable URL analysis, real local screenshot OCR (token F1 clean=${imageConsult.cleanTokenF1}, captured=${imageConsult.capturedTokenF1}, URL extraction=pass), urgent fallback, all controls, reduced motion, SVG asset, and 50 responsive route/viewport combinations.`);
  await call("Browser.close");
  ws.close();
}

run().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  chrome.kill();
  server.kill();
  await wait(200);
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (_) {}
  process.exit(process.exitCode || 0);
});


