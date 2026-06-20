# verification_report

## 対象
ホーム index のたたみ処理（20件規模対応）。hub + 新着(fresh 3件)は展開のまま、残り find を genre 鉱脈ごとに畳む。全 pick リンクは DOM 物理残存（AEO / no-JS 維持）。

## ビルド
- コマンド: `npm run build`
- 結果: **SUCCESS** (exit 0)
- 出力: 42 page(s) built / sitemap-index.xml 生成 / Complete! (1.66s)
- 新規ページ: なし（たたみは presentation 専用・URL 集合不変）

## 静的 grep 監査 (auditor 物理確認済み)
| ゲート | 結果 |
|---|---|
| dist の pick リンク全件残存 (en 19 種 / ja 19 種・各 1 回) | PASS |
| `data-fold="hidden"` = 15 個 × 両 locale（find 18 − FRESH_COUNT 3 と一致・hub / fresh に付与なし） | PASS |
| sitemap = 42 URL（home×2 + lineage×2 + picks 19×2）・たたみ由来の新 URL ゼロ | PASS |
| 既存 pick ページ / lineage に `data-fold` / `data-group-head` / `g-toggle` リーク | 0 hits (PASS) |
| picks.ts（脳）に DOM / localStorage / fold ロジック | 0 hits (PASS) |
| SSR 焼き込み: en "Fresh digs" + ja "新着の発掘"・genre 7 群 15 member (3/3/3/2/2/1/1) | 両 locale 確認 (PASS) |

## 機能検証 (auditor 物理確認済み)
1. view FSM (`data-view` folded/flat・`setViewState` 経由・同値 early return・folded 復帰時 originalOrder 復元) / group FSM (`data-state` collapsed/expanded・`setGroupState` で member の data-fold と aria-expanded を同期)。fresh 見出しは data-state を持たず click handler が `hasAttribute("data-state")` で弾く = FSM 外の抜け穴なし。SUCCESS
2. no-JS フォールバック: 隠すセレクタは全て `html.js` スコープ・no-js は操作示唆のみ非表示 → JS 無効時 19 件全文表示（AEO 不破壊）。SUCCESS
3. 伏せ札 FSM (unflipped→flipping→discovered)・storeKey `uncut.discovered.<lang>`・facet フィルタ無傷。quiz への変更は spec 許可の 2 点のみ（`uncut:quizhit` dispatchEvent + findNodes の data-order 昇順ソート）。SUCCESS
4. マジックナンバー排除: `FRESH_COUNT = 3` / `FRESH_GROUP_ID = "__fresh"` 名前付き定数・CSS 新規寸法は `--fold-*` 8 変数に集約。SUCCESS
5. i18n: ui.ts に `group.fresh` / `group.count` を en/ja 両 locale 追加・伏せ残数は既存 `flip.remaining` 流用（二重定義なし・SSOT）。SUCCESS
6. 脳体分離: たたみは presentation 専用（HomePage.astro / ui.ts / global.css のみ）・picks.ts は純粋データのまま。SUCCESS

## 総合判定
**SUCCESS**

## 備考
- npm 実行は `/home/ii/.local/nodejs/bin` の node v22.22.3 / npm 10.9.8 を使用。
- ブラウザ実機回帰（FOUC・flip アニメ・quiz 4 通り・localStorage DevTools）は静的監査では未実施（DOM/CSS/script の静的整合まで検証済み・正直申告）。
- push は本人 (developer/親は push しない)。
