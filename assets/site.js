/* 手機版導覽選單開關 */
(function () {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!nav || !toggle || !links) return;

  const close = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // 點連結、點空白處、按 Esc 都收起來
  links.addEventListener('click', e => { if (e.target.tagName === 'A') close(); });
  document.addEventListener('click', e => { if (!nav.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  // 轉成桌機寬度時把狀態清掉，避免選單卡在展開
  matchMedia('(min-width: 1081px)').addEventListener('change', close);
})();

/* 複製 email —— mailto: 在沒設定郵件軟體的電腦上會沒反應，
   所以另外給「直接複製」與「用 Gmail 開啟」兩條路。 */
(function () {
  const btn = document.querySelector('.mail-copy');
  if (!btn) return;
  const label = btn.querySelector('.mail-copy-label');
  let timer;

  const t = key => {
    try { return (typeof I18N !== 'undefined' && I18N.dict) ? I18N.translate(key) : key; }
    catch (e) { return key; }
  };

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // 非 https 或舊瀏覽器沒有 clipboard API，退回舊做法
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-9999px';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) {}
      ta.remove();
      return ok;
    }
  }

  btn.addEventListener('click', async () => {
    const ok = await copy(btn.dataset.copy);
    btn.classList.toggle('copied', ok);
    label.textContent = t(ok ? 'Copied' : 'Select and copy');
    if (!ok) {
      // 剪貼簿被擋（沒有焦點、舊瀏覽器）就直接幫他選起來，還是能手動複製
      const addr = btn.querySelector('.mail-addr');
      const range = document.createRange();
      range.selectNodeContents(addr);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      btn.classList.remove('copied');
      label.textContent = t('Copy');
    }, 2200);
  });
})();
