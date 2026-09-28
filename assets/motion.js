/* ============================================================
   動效：捲動進場、數字跑動、導覽列狀態
   ------------------------------------------------------------
   全部只操作 class 與 style，不改文字內容的原文，
   所以跟 i18n.js 的字典翻譯互不干擾（本檔在 i18n.js 之後載入）。
   使用者若在系統開啟「減少動態效果」，整套動畫自動停用。
   ============================================================ */
(function () {
  // 先掛上 .js —— CSS 的隱藏起始狀態只在這個 class 存在時生效。
  // 萬一這支檔案掛掉或被擋，訪客看到的是完整內容，而不是一片空白。
  document.documentElement.classList.add('js');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 捲動進場 ---------- */
  const GROUPS = [
    '.hero-grid > div',
    '.hero-side',
    '.metrics li',
    '.section > .wrap > .eyebrow, .section > .wrap > h2, .section > .wrap > .section-lede',
    '.ind-chips li',
    '.card',
    '.result',
    '.brand-card',
    '.ind',
    '.brands',
    '.timeline li',
    '.edu',
    '.skill-col',
    '.contact-inner > *',
    '.status-strip li',
  ];

  const targets = [];
  GROUPS.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
      targets.push(el);
    });
  });

  if (reduced) {
    targets.forEach(el => { el.classList.add('in'); el.style.transitionDelay = ''; });
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        obs.unobserve(e.target);          // 只播一次，不要來回閃
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });

    targets.forEach(el => io.observe(el));

    // 首屏不等捲動，載入就播
    requestAnimationFrame(() => {
      document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('in'));
    });
  }

  /* ---------- 2. 數字跑動 ---------- */
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function countUp(el) {
    const raw = el.textContent;                       // 例如 "NT$100"、"8"、"45"
    const m = raw.match(/^(\D*)(\d[\d,]*)(\D*)$/);
    if (!m) return;
    const [, pre, digits, post] = m;
    const target = parseInt(digits.replace(/,/g, ''), 10);
    const grouped = digits.includes(',');
    const DURATION = 1100;
    let start = null;

    function frame(ts) {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / DURATION, 1);
      const v = Math.round(target * easeOut(p));
      el.textContent = pre + (grouped ? v.toLocaleString('en-US') : v) + post;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = raw;                      // 收在原字串，避免格式跑掉
    }
    el.textContent = pre + '0' + post;
    requestAnimationFrame(frame);
  }

  const numbers = document.querySelectorAll('.metrics b, .result-num b');
  if (numbers.length && !reduced) {
    const numIO = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        // <b> 裡的單位 <span>（+、%、M）留著不動，只跑第一個文字節點
        const node = [...e.target.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim());
        if (node) countUp({
          get textContent() { return node.nodeValue; },
          set textContent(v) { node.nodeValue = v; },
        });
        obs.unobserve(e.target);
      });
    }, { threshold: .6 });
    numbers.forEach(b => numIO.observe(b));
  }


  /* ---------- 4. 產業跑馬燈 ---------- */
  // 內容直接從下方的產業卡片生成，之後新增產業只要加卡片，跑馬燈自己會跟上。
  (function buildMarquee() {
    const box = document.querySelector('[data-marquee]');
    if (!box) return;

    const source = [
      ...document.querySelectorAll('.grid-6 .ind h4'),
      ...document.querySelectorAll('.ind-chips li'),
    ];
    const names = source.map(el => {
      const node = [...el.childNodes].find(n => n.nodeType === 3);
      // i18n 會把原文存在 __orig，取原文才不會把當下語言寫死進跑馬燈
      return (node && node.__orig !== undefined ? node.__orig : el.textContent).trim();
    });
    if (!names.length) return;

    const track = document.createElement('div');
    track.className = 'marquee-track';
    // 跑兩份，第一份跑完接上第二份，看起來就是無縫循環
    for (let copy = 0; copy < 2; copy++) {
      names.forEach(n => {
        const item = document.createElement('span');
        item.className = 'marquee-item';
        item.textContent = n;
        track.appendChild(item);
      });
    }
    box.appendChild(track);

    // 依內容長度決定週期，項目變多時速度感一致
    track.style.setProperty('--marquee-duration', Math.max(24, names.length * 3.4) + 's');

    // 生成的節點要補翻譯（i18n.js 的 I18N 是同層 script 的常數，抓不到就跳過）
    try { if (typeof I18N !== 'undefined' && I18N.dict) I18N.apply(box); } catch (e) {}
  })();

  /* ---------- 3. 導覽列：捲動後加深、目前區塊高亮 ---------- */
  const nav = document.querySelector('.nav');
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);


  /* ---------- 5. 卡片的游標光暈 ---------- */
  if (!reduced && matchMedia('(hover:hover)').matches) {
    const glowCards = document.querySelectorAll('.card, .brand-card');
    let raf = null, pending = null;
    glowCards.forEach(card => {
      card.addEventListener('pointermove', e => {
        pending = [card, e];
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const [el, ev] = pending;
          const b = el.getBoundingClientRect();
          el.style.setProperty('--mx', (ev.clientX - b.left) + 'px');
          el.style.setProperty('--my', (ev.clientY - b.top) + 'px');
          raf = null;
        });
      });
    });
  }

  /* ---------- 6. 捲動進度條 + 回到頂端 ---------- */
  const bar = document.querySelector('.scroll-progress span');
  const toTop = document.querySelector('.to-top');
  if (toTop) {
    toTop.addEventListener('click', () => {
      scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }
  function onProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? Math.min(scrollY / max, 1) : 0;
    if (bar) bar.style.width = (pct * 100).toFixed(2) + '%';
    if (toTop) toTop.classList.toggle('show', scrollY > innerHeight * 0.8);
  }
  addEventListener('scroll', onProgress, { passive: true });
  addEventListener('resize', onProgress);
  onProgress();

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', scrollY > 24);

      let current = null;
      const line = scrollY + 140;                     // 導覽列下緣當判定線
      sections.forEach(sec => {
        if (sec.offsetTop <= line) current = sec.id;
      });
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
