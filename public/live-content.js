(() => {
  const API = {
    reciters: 'https://mp3quran.net/api/v3/reciters',
    radios: 'https://raw.githubusercontent.com/uthumany/radio-api/main/client/public/api/stations.json',
    tafsirBooks: 'https://api.quranpedia.net/v1/search/%D8%AA%D9%81%D8%B3%D9%8A%D8%B1/books',
    tafsirAyah: (book) => `https://api.quranpedia.net/v1/ayah/18/12/book/${book}`,
    sermons: 'https://sermons.islamic.network/api/uae-awqaf/2026.json',
    hijri: (date) => `https://api.aladhan.com/v1/gToH?date=${date}`
  };
  const state = { tab: 'reciters', reciters: [], radios: [], tafsirBooks: [], audio: null, selectedRadio: null };
  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const cacheFetch = async (url, key, maxAge = 1000 * 60 * 30) => {
    try {
      const saved = JSON.parse(localStorage.getItem(`quran-api:${key}`) || 'null');
      if (saved && Date.now() - saved.time < maxAge) return saved.value;
    } catch (_) {}
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const value = await response.json();
    try { localStorage.setItem(`quran-api:${key}`, JSON.stringify({ time: Date.now(), value })); } catch (_) {}
    return value;
  };
  const notify = (message) => {
    const toast = document.querySelector('.portal-toast');
    if (toast) { toast.textContent = message; toast.style.opacity = '1'; clearTimeout(toast._timer); toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500); }
  };

  const style = document.createElement('style');
  style.textContent = `
    #liveHub{max-width:1180px;margin:20px auto 0;padding:0 24px;position:relative;z-index:10}
    .live-hub-card{background:rgba(255,255,255,.96);border:1px solid rgba(197,160,89,.24);border-radius:18px;box-shadow:0 14px 32px rgba(19,78,60,.08);overflow:hidden}
    .live-hub-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 20px;background:linear-gradient(110deg,#003627,#134e3c);color:#fff}
    .live-hub-title{display:flex;align-items:center;gap:10px}.live-hub-title .material-symbols-outlined{color:#ffdea5;font-size:26px}
    .live-hub-title h2{font:600 20px 'Noto Serif',serif;margin:0}.live-hub-title p{font:13px 'Source Sans 3',sans-serif;color:#b5efd6;margin:3px 0 0}
    .live-hub-status{display:flex;align-items:center;gap:7px;font:600 12px 'Source Sans 3',sans-serif;color:#ffdea5}.live-hub-status i{width:8px;height:8px;background:#86bea7;border-radius:50%;box-shadow:0 0 0 4px rgba(134,190,167,.18)}
    .live-tabs{display:flex;gap:7px;padding:10px 14px;background:#f0f3ff;overflow:auto;border-bottom:1px solid #dee8ff}.live-tab{border:0;background:transparent;color:#404944;padding:8px 13px;border-radius:9px;font:600 13px 'Source Sans 3',sans-serif;white-space:nowrap;cursor:pointer;transition:.2s}.live-tab:hover{background:#e7eeff;color:#003627}.live-tab.active{background:#003627;color:#fff;box-shadow:0 4px 10px rgba(0,54,39,.16)}
    .live-panel{padding:18px 20px;min-height:132px}.live-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.live-toolbar h3{font:600 18px 'Noto Serif',serif;color:#003627;margin:0}.live-toolbar small{color:#707974;font:13px 'Source Sans 3',sans-serif}.live-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.live-item{border:1px solid #e7eeff;background:#fff;border-radius:13px;padding:12px;min-height:92px;display:flex;flex-direction:column;justify-content:space-between;gap:9px;transition:.2s}.live-item:hover{border-color:#c5a059;transform:translateY(-2px);box-shadow:0 8px 16px rgba(19,78,60,.08)}.live-item-top{display:flex;align-items:flex-start;gap:9px}.live-item-icon{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;background:#e6f0eb;color:#003627;flex:0 0 auto}.live-item h4{font:600 15px 'Noto Serif',serif;color:#003627;margin:0;line-height:1.35}.live-item p{font:12px 'Source Sans 3',sans-serif;color:#707974;margin:3px 0 0;line-height:1.45}.live-item-actions{display:flex;align-items:center;gap:7px}.live-action{border:0;border-radius:8px;padding:6px 9px;cursor:pointer;font:600 12px 'Source Sans 3',sans-serif;background:#003627;color:#fff}.live-action.secondary{background:#f0f3ff;color:#003627}.live-action:hover{filter:brightness(1.08)}.live-loading{padding:22px;text-align:center;color:#707974;font:14px 'Source Sans 3',sans-serif}.live-error{padding:14px;background:#fff5f4;color:#93000a;border-radius:10px;font:13px 'Source Sans 3',sans-serif}.live-select{border:1px solid #c0c9c3;border-radius:8px;padding:7px 10px;background:#fff;color:#003627;font:13px 'Source Sans 3',sans-serif;max-width:260px}.live-calendar{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.live-calendar-stat{padding:14px;background:#f0f3ff;border-radius:12px}.live-calendar-stat strong{display:block;color:#003627;font:600 20px 'Noto Serif',serif}.live-calendar-stat span{color:#707974;font:12px 'Source Sans 3',sans-serif}.live-player{display:flex;align-items:center;gap:10px;background:#003627;color:#fff;border-radius:12px;padding:10px 12px;margin-bottom:13px}.live-player strong{font:600 13px 'Source Sans 3',sans-serif;flex:1}.live-player audio{height:30px;max-width:240px}.live-credit{margin-top:12px;color:#707974;font:11px 'Source Sans 3',sans-serif}.live-credit a{color:#775a19}
    @media(max-width:900px){#liveHub{padding:0 16px}.live-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.live-calendar{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:560px){.live-hub-head{align-items:flex-start;flex-direction:column}.live-hub-title h2{font-size:17px}.live-panel{padding:14px}.live-toolbar{align-items:flex-start;flex-direction:column}.live-grid{grid-template-columns:1fr}.live-calendar{grid-template-columns:1fr 1fr}.live-player{align-items:flex-start;flex-direction:column}.live-player audio{width:100%;max-width:none}}
  `;
  document.head.appendChild(style);

  const hub = document.createElement('section');
  hub.id = 'liveHub';
  hub.innerHTML = `<div class="live-hub-card"><div class="live-hub-head"><div class="live-hub-title"><span class="material-symbols-outlined">hub</span><div><h2>المركز الحي للمحتوى الإسلامي</h2><p>قراء وتلاوات وإذاعات وتفسير ودروس وتقويم — من مصادر مفتوحة وموثوقة</p></div></div><div class="live-hub-status"><i></i><span>بيانات مباشرة</span></div></div><div class="live-tabs" role="tablist"><button class="live-tab active" data-live-tab="reciters"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px">record_voice_over</span> القراء والتلاوات</button><button class="live-tab" data-live-tab="radios"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px">radio</span> إذاعات عالمية</button><button class="live-tab" data-live-tab="tafsir"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px">menu_book</span> التفسير</button><button class="live-tab" data-live-tab="lessons"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px">school</span> الدروس والخطب</button><button class="live-tab" data-live-tab="calendar"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:-3px">calendar_month</span> التقويم الهجري</button></div><div class="live-panel" id="livePanel"></div></div>`;
  const main = document.querySelector('main');
  if (!main) return;
  main.prepend(hub);
  const panel = $('#livePanel', hub);

  const renderLoading = (message = 'جارٍ جلب البيانات من المصدر...') => { panel.innerHTML = `<div class="live-loading"><span class="material-symbols-outlined" style="vertical-align:-5px">progress_activity</span> ${message}</div><div class="live-grid">${Array.from({ length: 4 }, () => '<article class="live-item" style="opacity:.55"><div class="live-item-top"><span class="live-item-icon"><span class="material-symbols-outlined">auto_awesome</span></span><div><h4>محتوى إسلامي موثوق</h4><p>يتم تحديث البيانات الآن...</p></div></div><span style="height:8px;background:#e7eeff;border-radius:8px;width:72%"></span></article>').join('')}</div>`; };
  const renderError = (source) => { panel.innerHTML = `<div class="live-error"><span class="material-symbols-outlined" style="vertical-align:-5px">cloud_off</span> تعذر جلب البيانات من ${escapeHTML(source)} الآن. سيبقى التصميم يعمل ويمكن إعادة المحاولة من زر التحديث.</div><button class="live-action" style="margin-top:10px" data-retry>إعادة المحاولة</button>`; $('[data-retry]', panel)?.addEventListener('click', () => renderTab(state.tab)); };
  const normalizeReciters = (payload) => (payload.reciters || []).flatMap((r) => (r.moshaf || []).slice(0, 1).map((m) => ({ name: r.name, moshaf: m.name, server: m.server, id: r.id })));
  const playReciter = (item) => {
    const source = `${item.server}${String(18).padStart(3, '0')}.mp3`;
    if (state.audio) state.audio.pause();
    state.audio = new Audio(source); state.audio.controls = true; state.audio.autoplay = true;
    document.querySelector('.live-player')?.remove();
    const player = document.createElement('div'); player.className = 'live-player'; player.innerHTML = `<span class="material-symbols-outlined">graphic_eq</span><strong>${escapeHTML(item.name)}<br><small style="color:#b5efd6">سورة الكهف • ${escapeHTML(item.moshaf || 'تلاوة مرتلة')}</small></strong>`;
    player.appendChild(state.audio); panel.prepend(player); notify(`بدأت تلاوة سورة الكهف بصوت ${item.name}`);
  };
  const renderReciters = () => {
    const items = state.reciters.slice(0, 12);
    panel.innerHTML = `<div class="live-toolbar"><div><h3>أصوات الخشوع من مكتبة القراء</h3><small>${state.reciters.length || 'الكثير من'} قارئًا متاحًا عبر MP3Quran</small></div><button class="live-action secondary" data-refresh><span class="material-symbols-outlined" style="font-size:15px;vertical-align:-3px">refresh</span> تحديث</button></div><div class="live-grid">${items.map((item, index) => `<article class="live-item"><div class="live-item-top"><span class="live-item-icon"><span class="material-symbols-outlined">mic</span></span><div><h4>${escapeHTML(item.name)}</h4><p>${escapeHTML(item.moshaf || 'رواية حفص عن عاصم')}</p></div></div><div class="live-item-actions"><button class="live-action" data-reciter="${index}"><span class="material-symbols-outlined" style="font-size:15px;vertical-align:-3px">play_arrow</span> سورة الكهف</button></div></article>`).join('')}</div><div class="live-credit">المصدر: <a href="https://mp3quran.net" target="_blank" rel="noreferrer">MP3Quran API</a> — روابط الصوت تُجلب مباشرة ولا تُخزّن داخل الموقع.</div>`;
    $$('[data-reciter]', panel).forEach((button) => button.addEventListener('click', () => playReciter(items[Number(button.dataset.reciter)])));
    $('[data-refresh]', panel)?.addEventListener('click', () => { localStorage.removeItem('quran-api:reciters'); renderTab('reciters'); });
  };
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const playRadio = (station) => {
    if (state.audio) state.audio.pause();
    state.audio = new Audio(station.streamUrl); state.audio.controls = true; state.audio.autoplay = true;
    document.querySelector('.live-player')?.remove();
    const player = document.createElement('div'); player.className = 'live-player'; player.innerHTML = `<span class="material-symbols-outlined">radio</span><strong>${escapeHTML(station.nameAr || station.name)}<br><small style="color:#b5efd6">${escapeHTML(station.country || 'إذاعة إسلامية')} • بث مباشر</small></strong>`;
    player.appendChild(state.audio); panel.prepend(player); notify(`تشغيل ${station.nameAr || station.name}`);
  };
  const renderRadios = () => {
    const stations = state.radios.filter((s) => s.streamUrl && s.streamUrl.startsWith('https')).slice(0, 16);
    panel.innerHTML = `<div class="live-toolbar"><div><h3>إذاعات القرآن والإذاعات الإسلامية حول العالم</h3><small>${state.radios.length} محطة من المصدر المفتوح — نعرض المحطات ذات HTTPS فقط</small></div><button class="live-action secondary" data-refresh><span class="material-symbols-outlined" style="font-size:15px;vertical-align:-3px">refresh</span> تحديث</button></div><div class="live-grid">${stations.map((station, index) => `<article class="live-item"><div class="live-item-top"><span class="live-item-icon"><span class="material-symbols-outlined">radio</span></span><div><h4>${escapeHTML(station.nameAr || station.name)}</h4><p>${escapeHTML(station.country || 'عالمي')} · ${escapeHTML((station.genre || ['إسلامي']).slice(0, 2).join(' · '))}</p></div></div><div class="live-item-actions"><button class="live-action" data-radio="${index}"><span class="material-symbols-outlined" style="font-size:15px;vertical-align:-3px">play_arrow</span> استمع الآن</button></div></article>`).join('')}</div><div class="live-credit">المصدر: <a href="https://github.com/uthumany/islamic-radio-api" target="_blank" rel="noreferrer">Islamic Radio API</a>، ويضم 192 محطة بحسب آخر تحديث منشور.</div>`;
    $$('[data-radio]', panel).forEach((button) => button.addEventListener('click', () => playRadio(stations[Number(button.dataset.radio)])));
    $('[data-refresh]', panel)?.addEventListener('click', () => { localStorage.removeItem('quran-api:radios'); renderTab('radios'); });
  };
  const renderTafsir = async () => {
    if (!state.tafsirBooks.length) {
      const payload = await cacheFetch(API.tafsirBooks, 'tafsir-books');
      state.tafsirBooks = (Array.isArray(payload) ? payload : (payload.items || []).map((item) => item.book_info)).filter(Boolean);
    }
    const books = state.tafsirBooks;
    panel.innerHTML = `<div class="live-toolbar"><div><h3>تفسير الآية ١٢ من سورة الكهف</h3><small>محتوى مباشر من موسوعة Quranpedia — اختر مصدر التفسير</small></div><select class="live-select" id="tafsirBook">${books.map((book) => `<option value="${book.id}">${escapeHTML(book.name)} — ${escapeHTML(book.author || '')}</option>`).join('')}</select></div><div id="tafsirContent" class="live-loading">اختر مصدرًا لجلب التفسير...</div><div class="live-credit">المصدر: <a href="https://quranpedia.net" target="_blank" rel="noreferrer">Quranpedia API</a> — محتوى حي قابل للتحديث من المصدر.</div>`;
    const select = $('#tafsirBook', panel); const content = $('#tafsirContent', panel);
    const load = async () => { content.className = 'live-loading'; content.textContent = 'جارٍ تحميل التفسير...'; try { const data = await cacheFetch(API.tafsirAyah(select.value), `tafsir-18-12-${select.value}`, 1000 * 60 * 60 * 12); const text = (data.content || []).map((part) => part.text).join(' '); content.className = 'live-item'; content.style.fontSize = '16px'; content.style.lineHeight = '2'; content.innerHTML = `<strong style="color:#003627">${escapeHTML(data.book?.name || 'التفسير المختار')}</strong><p style="font-size:16px;line-height:2">${escapeHTML(text || 'لم يصل نص التفسير من المصدر.')}</p>`; } catch (_) { content.className = 'live-error'; content.textContent = 'تعذر تحميل هذا التفسير حاليًا.'; } };
    select.addEventListener('change', load); load();
  };
  const renderLessons = async () => {
    const payload = await cacheFetch(API.sermons, 'sermons-2026', 1000 * 60 * 60 * 6);
    const items = Array.isArray(payload) ? payload.slice(-8).reverse() : (payload.sermons || payload.items || []).slice(-8).reverse();
    panel.innerHTML = `<div class="live-toolbar"><div><h3>الدروس والخطب المختارة</h3><small>أرشيف خطب الجمعة من هيئة الأوقاف الإماراتية عبر Islamic Network</small></div><a class="live-action secondary" href="https://sermons.islamic.network/" target="_blank" rel="noreferrer">فتح الأرشيف</a></div><div class="live-grid">${items.map((item, index) => { const title = item.title || item.name || item.subject || `خطبة رقم ${index + 1}`; const date = item.date || item.published || item.year || '٢٠٢٦'; const audio = item.audio || item.mp3 || item.audio_url || item.url; return `<article class="live-item"><div class="live-item-top"><span class="live-item-icon"><span class="material-symbols-outlined">school</span></span><div><h4>${escapeHTML(title)}</h4><p>${escapeHTML(String(date))} · خطبة ودَرس موثق</p></div></div><div class="live-item-actions">${audio ? `<a class="live-action" href="${escapeHTML(audio)}" target="_blank" rel="noreferrer"><span class="material-symbols-outlined" style="font-size:15px;vertical-align:-3px">headphones</span> استماع</a>` : '<span class="live-action secondary">عرض التفاصيل</span>'}</div></article>`; }).join('')}</div><div class="live-credit">المصدر: <a href="https://sermons.islamic.network/api/" target="_blank" rel="noreferrer">Sermons API</a> — البيانات تُقرأ من JSON المفتوح للمصدر.</div>`;
  };
  const renderCalendar = async () => {
    const now = new Date(); const date = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    const payload = await cacheFetch(API.hijri(date), `hijri-${date}`, 1000 * 60 * 60 * 24); const data = payload.data || {}; const h = data.hijri || {}; const g = data.gregorian || {};
    panel.innerHTML = `<div class="live-toolbar"><div><h3>تقويم اليوم الهجري</h3><small>تحويل حي من التقويم الميلادي إلى الهجري مع المناسبات</small></div><span class="live-action secondary">${escapeHTML(g.date || date)}</span></div><div class="live-calendar"><div class="live-calendar-stat"><span>التاريخ الهجري</span><strong>${escapeHTML(h.date || '—')}</strong></div><div class="live-calendar-stat"><span>اليوم</span><strong>${escapeHTML(h.weekday?.ar || '—')}</strong></div><div class="live-calendar-stat"><span>الشهر</span><strong>${escapeHTML(h.month?.ar || '—')}</strong></div><div class="live-calendar-stat"><span>المناسبة</span><strong style="font-size:15px">${escapeHTML((h.holidays || []).join('، ') || 'لا توجد مناسبة مسجلة')}</strong></div></div><div class="live-credit">المصدر: <a href="https://aladhan.com/islamic-calendar-api" target="_blank" rel="noreferrer">AlAdhan Islamic Calendar API</a>.</div>`;
  };
  async function renderTab(tab) {
    state.tab = tab; renderLoading();
    try {
      if (tab === 'reciters') { if (!state.reciters.length) state.reciters = normalizeReciters(await cacheFetch(API.reciters, 'reciters')); renderReciters(); }
      if (tab === 'radios') { if (!state.radios.length) { const data = await cacheFetch(API.radios, 'radios'); state.radios = data.stations || []; } renderRadios(); }
      if (tab === 'tafsir') await renderTafsir();
      if (tab === 'lessons') await renderLessons();
      if (tab === 'calendar') await renderCalendar();
    } catch (_) { renderError(tab === 'radios' ? 'الإذاعات' : tab === 'tafsir' ? 'التفسير' : tab === 'lessons' ? 'الدروس' : tab === 'calendar' ? 'التقويم' : 'القراء'); }
  }
  $$('.live-tab', hub).forEach((button) => button.addEventListener('click', () => { $$('.live-tab', hub).forEach((item) => item.classList.toggle('active', item === button)); renderTab(button.dataset.liveTab); }));
  document.querySelectorAll('nav a[data-path]').forEach((link) => link.addEventListener('click', () => {
    const text = link.textContent || ''; const target = text.includes('المناسبات') ? 'calendar' : text.includes('إذاعة') ? 'radios' : text.includes('المكتبة') ? 'lessons' : text.includes('التفاسير') ? 'tafsir' : text.includes('المصحف') ? 'reciters' : null;
    if (target) { const button = $(`[data-live-tab="${target}"]`, hub); button?.click(); hub.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }));
  renderTab('reciters');
})();
