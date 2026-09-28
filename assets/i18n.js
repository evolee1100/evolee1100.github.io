/* ============================================================
   多語言切換 — 中文 / English / Bahasa Melayu
   ------------------------------------------------------------
   作法跟 TANJU 站一樣：HTML 維持單一原文（這裡是英文），
   執行時走訪文字節點，用「英文原文」當 key 去字典換語言。
   好處是不必在每個元素加 data-i18n，補譯文只要改字典；
   字典查不到就原樣顯示英文，不會出現空白或 key 名稱。
   ============================================================ */

const I18N_KEY = 'ch_lang';

const LANGS = {
  en: { label: 'EN',   htmlLang: 'en',      dict: null,
        title: 'Chee Hou — Performance Marketing Specialist' },
  zh: { label: '中文', htmlLang: 'zh-Hant', dict: () => window.LANG_ZH,
        title: 'Chee Hou — 成效行銷專員' },
  ms: { label: 'BM',   htmlLang: 'ms',      dict: () => window.LANG_MS,
        title: 'Chee Hou — Pakar Pemasaran Prestasi' },
};

const I18N = {
  lang: 'en',
  dict: null,

  norm(s) { return s.replace(/\s+/g, ' ').trim(); },

  translate(s) {
    if (!this.dict) return s;
    const t = this.dict[this.norm(s)];
    return t !== undefined ? t : s;
  },

  /** 走訪整棵樹，翻譯文字節點與常見屬性 */
  apply(root) {
    root = root || document.body;

    const SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1 };
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p || SKIP[p.tagName]) return NodeFilter.FILTER_REJECT;
        if (p.closest('[data-no-i18n]')) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
    nodes.forEach(n => {
      // 第一次碰到就把英文原文存起來，切回 EN 才有東西可還原
      if (n.__orig === undefined) n.__orig = n.nodeValue;
      n.nodeValue = this.translate(n.__orig);
    });

    /* 屬性：title / aria-label / alt / placeholder */
    const ATTRS = ['title', 'aria-label', 'alt', 'placeholder'];
    root.querySelectorAll('[title],[aria-label],[alt],[placeholder]').forEach(el => {
      if (el.closest('[data-no-i18n]')) return;
      ATTRS.forEach(a => {
        const v = el.getAttribute(a);
        if (v === null) return;
        const key = 'i18n' + a.replace(/-(\w)/g, (_, c) => c.toUpperCase());
        if (el.dataset[key] === undefined) el.dataset[key] = v;
        el.setAttribute(a, this.translate(el.dataset[key]));
      });
    });
  },

  set(lang) {
    if (!LANGS[lang]) lang = 'en';
    const conf = LANGS[lang];
    this.lang = lang;
    this.dict = conf.dict ? conf.dict() : null;

    document.documentElement.lang = conf.htmlLang;
    document.title = conf.title;
    this.apply(document.body);

    document.querySelectorAll('.lang-switch button').forEach(b => {
      b.classList.toggle('on', b.dataset.lang === lang);
      b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false');
    });

    try { localStorage.setItem(I18N_KEY, lang); } catch (e) {}
  },

  init() {
    let saved = null;
    try { saved = localStorage.getItem(I18N_KEY); } catch (e) {}

    // 沒選過就看瀏覽器語言：zh-* → 中文，ms/id → 馬來文，其餘英文
    if (!saved) {
      const nav = (navigator.language || 'en').toLowerCase();
      saved = nav.startsWith('zh') ? 'zh'
            : (nav.startsWith('ms') || nav.startsWith('id')) ? 'ms'
            : 'en';
    }

    document.querySelectorAll('.lang-switch button').forEach(b => {
      b.addEventListener('click', () => this.set(b.dataset.lang));
    });

    this.set(saved);
  },
};

document.addEventListener('DOMContentLoaded', () => I18N.init());
