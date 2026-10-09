# Chee Hou — Personal Portfolio

純靜態個人作品集網站，沒有建置流程、沒有相依套件，可直接丟到 GitHub Pages 或任何靜態主機。

| 檔案 | 內容 |
|---|---|
| `index.html` | 全站單頁：Hero、能力四卡、產業戰績、經歷時間軸、技能、聯絡 |
| `assets/style.css` | 全站樣式（深色系 + 琥珀色重點色，含 RWD） |
| `assets/i18n.js` | 三語切換引擎（以英文原文為 key 走訪文字節點翻譯） |
| `assets/lang/zh.js` | 繁體中文字典 |
| `assets/lang/ms.js` | Bahasa Melayu 字典 |
| `assets/site.js` | 手機版導覽選單開關 |
| `assets/motion.js` | 捲動進場、數字跑動、導覽列狀態與區塊高亮 |
| `assets/img/portrait.*` | 大頭貼（由 `~/Desktop/1.png` 去背裁成圓形，webp + png 備援）|
| `tools/stamp.py` | 幫 assets 連結蓋內容雜湊版本戳，避免瀏覽器吃到舊快取 |

## 多語言

導覽列右側 `EN / 中文 / BM` 切換，選擇存在 localStorage（key：`ch_lang`）。
第一次進站沒選過時，依瀏覽器語言自動判斷：`zh-*` → 中文，`ms`/`id` → 馬來文，其餘英文。

**改文案的規則**：`index.html` 的英文是唯一原文，改完英文之後，要同步更新
`assets/lang/zh.js` 與 `ms.js` 裡對應的 key（key 就是那句英文原文）。
字典查不到的字串會原樣顯示英文 —— 專有名詞（Google Ads、Python、Inventec…）就是刻意不放進字典。

## 動效

`assets/motion.js` 負責：捲動進場（IntersectionObserver，只播一次）、指標數字從 0 跑到目標值、
導覽列捲動後加深、目前所在區塊的選單高亮。

兩個保護機制：

- 系統開啟「減少動態效果」（prefers-reduced-motion）時整套停用，直接顯示完整內容
- 隱藏起始狀態綁在 `html.js` 這個 class 上，由 JS 自己掛上。
  萬一 JS 掛掉或被擋，訪客看到的是完整內容，不會是一片空白

## 改完 CSS / JS 一定要跑這個

```bash
python3 /Users/ch/Portfolio/tools/stamp.py
```

它會把 `assets/style.css?v=xxxxxxxx` 的雜湊更新掉。不跑的話，回訪的訪客
（還有 GitHub Pages 的 CDN）會繼續拿舊檔案，改了也看不到。

## 本地預覽

```bash
python3 -m http.server 8123 --directory /Users/ch/Portfolio
```

## 待補 / 待確認

- **電話**：LinkedIn PDF 上的 010-8735002 目前**沒有**放到網站上（公開電話是你的決定，要放再告訴我）
- **個人 Facebook**：同樣沒放，這是專業站
- **中文姓名**：中文版目前顯示「Chee Hou Lee」，沒有臆測你的中文本名，要放請提供
- **學校中文名**：中文版寫「聖約翰科技大學」，若不是這間請告訴我
- **具體案例數字**：月投放金額量級（RM / NT$）、ROAS 或 CPA 改善幅度、管理帳戶數 ——
  目前全站唯一硬數字只有 45%
- **證照**（Google Ads / Meta Blueprint 之類）
- **LinkedIn 橫幅圖**：要放進網站的話，把檔案存到 `assets/img/` 再告訴我
- 補的內容記得三個語言都要寫

## LinkedIn 本身要修的兩件事

1. 個人簡介裡有一句 `reducing manual operational time by [Insert Percentage]%` ——
   範本佔位符沒改掉，這是公開可見的
2. 地點還寫「Taipei–Keelung Metropolitan area」，但你 2024/8 已經返馬；
   另外簡介寫 "a decade"，年資欄位是 8 年 5 個月，兩邊不一致

## 部署到 GitHub Pages

```bash
cd /Users/ch/Portfolio && git init && git add -A && git commit -m "Personal portfolio" && gh repo create cheehou-portfolio --public --source=. --push
```

推上去後到 repo 的 Settings → Pages，Source 選 `main` / `(root)`。
