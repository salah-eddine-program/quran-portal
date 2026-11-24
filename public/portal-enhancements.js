(() => {
  const toast = (message) => {
    let el = document.querySelector('.portal-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'portal-toast';
      Object.assign(el.style, { position: 'fixed', top: '112px', left: '50%', transform: 'translateX(-50%)', zIndex: '100', background: '#003627', color: '#fff', padding: '10px 18px', borderRadius: '999px', boxShadow: '0 8px 24px rgba(0,0,0,.16)', fontFamily: 'Source Sans 3, sans-serif', fontSize: '14px', transition: 'opacity .25s' });
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.opacity = '1';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.style.opacity = '0'; }, 2200);
  };

  document.querySelectorAll('nav a[data-path]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      document.querySelectorAll('nav a[data-path]').forEach((item) => {
        item.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-semibold');
        item.classList.add('text-on-surface-variant');
        item.removeAttribute('aria-current');
      });
      link.classList.add('bg-primary-container', 'text-on-primary-container', 'font-semibold');
      link.classList.remove('text-on-surface-variant');
      link.setAttribute('aria-current', 'page');
      toast(`تم اختيار قسم ${link.textContent.trim()}`);
    });
  });

  document.querySelectorAll('input[type="text"]').forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && input.value.trim()) {
        event.preventDefault();
        toast(`جارٍ البحث عن: ${input.value.trim()}`);
      }
    });
  });

  document.querySelectorAll('button').forEach((button) => {
    const label = `${button.textContent} ${button.getAttribute('title') || ''}`;
    if (/بحث|search/i.test(label)) {
      button.addEventListener('click', () => {
        const input = button.closest('div')?.querySelector('input') || document.querySelector('input[type="text"]');
        toast(input?.value?.trim() ? `جارٍ البحث عن: ${input.value.trim()}` : 'اكتب كلمة أو اسم سورة للبحث');
      });
    }
    if (/bookmark|المحفوظات|العلامات المرجعية/i.test(label)) {
      button.addEventListener('click', () => { button.classList.toggle('text-secondary'); toast(button.classList.contains('text-secondary') ? 'تمت إضافة الآية إلى المحفوظات' : 'تمت إزالة العلامة المرجعية'); });
    }
  });

  const verseMode = document.getElementById('viewVerseByVerse');
  const quranText = document.getElementById('quranTextWrapper');
  if (verseMode && quranText) {
    verseMode.addEventListener('click', () => {
      quranText.classList.toggle('verse-by-verse');
      verseMode.classList.toggle('bg-primary-container');
      verseMode.classList.toggle('text-on-primary-container');
      document.querySelectorAll('.ayah-block').forEach((ayah) => {
        ayah.style.display = quranText.classList.contains('verse-by-verse') ? 'block' : 'inline';
        ayah.style.marginBottom = quranText.classList.contains('verse-by-verse') ? '12px' : '';
      });
      toast(quranText.classList.contains('verse-by-verse') ? 'تم تفعيل العرض آية بآية' : 'تمت العودة إلى العرض المتصل');
    });
  }

  const playButton = [...document.querySelectorAll('button')].find((button) => button.querySelector('.material-symbols-outlined')?.textContent.trim() === 'pause');
  if (playButton) {
    const audio = new Audio('https://server8.mp3quran.net/afs/018.mp3');
    audio.preload = 'none';
    let playing = false;
    const icon = playButton.querySelector('.material-symbols-outlined');
    const setPlaybackState = (isPlaying) => {
      playing = isPlaying;
      if (icon) icon.textContent = playing ? 'pause' : 'play_arrow';
    };
    playButton.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().then(() => { setPlaybackState(true); toast('بدأت تلاوة سورة الكهف'); }).catch(() => { setPlaybackState(true); toast('تعذر تشغيل الصوت تلقائيًا؛ اضغط مرة أخرى للبدء'); });
      } else {
        audio.pause();
        setPlaybackState(false);
        toast('أوقفت التلاوة مؤقتًا');
      }
    });
    audio.addEventListener('ended', () => setPlaybackState(false));
  }

  const selectNotice = (id, label) => document.getElementById(id)?.addEventListener('change', (event) => toast(`${label}: ${event.target.options[event.target.selectedIndex].text}`));
  selectNotice('riwayahSelect', 'تم اختيار الرواية');
  selectNotice('reciterSelect', 'تم اختيار القارئ');
})();
