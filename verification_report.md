# verification_report

## 対象
血統図(案1 PickPage 縦血統ライン + 案2 /lineage 専用ページ) + Archero 上位原点・Bit Oz 多親化

## ビルド
- コマンド: `npm run build`
- 結果: **SUCCESS** (exit 0)
- 出力: 16 page(s) built / sitemap-index.xml 生成 / Complete!
- 新規ページ: `/lineage/index.html`, `/ja/lineage/index.html` を含む

## 静的 grep 監査
| ゲート | 結果 |
|---|---|
| dist に禁止 appid `1806970` (別会社 Monduz の無関係作) | 0 hits (PASS) |
| dist の `data-lineage` に配列リーク (`String(array)` のカンマ混入) | 0 hits (PASS) |
| src に `<svg` / `role="tree"` | 0 files (PASS) |
| 変更 src に `TODO` / `仮実装` / `FIXME` | 0 hits (PASS) |
| Archero sameAs = Wikidata `Q116031886` (dist read-and-build) | 1 (PASS) |
| Archero sameAs = AppStore `id1453651052` (dist read-and-build) | 1 (PASS) |
| Archero sameAs = 公式 `habby.com` (dist read-and-build) | 1 (PASS) |

## 機能検証 (auditor 物理確認済み)
1. 案1 縦血統ライン: read-and-build に `ul.lineage-tree` で root(Slay the Spire)+root(Archero) → 現在地(Bit Oz) → 兄弟 → 別の味。nested ul/li + CSS 罫線(擬似要素)。SVG / role=tree なし、aria-label のみ。SUCCESS
2. 案2 /lineage と /ja/lineage 生成。4 root の家系図 + 伏せ枝(branch-placeholder)常設・達成画面なし(未完維持=北極星)。SUCCESS
3. Archero = established 原点・Bit Oz twin-parent (`meta.lineage:["slay-the-spire","archero"]`)・sameAs は Wikidata/AppStore/公式のみ・Steam URL なし・gamePlatform "iOS, Android"・捏造なし。SUCCESS
4. JS-off で nested リスト全文 SSR・AEO 不破壊 (hub leadIdx=-1 不変)。SUCCESS
5. 多親/非Steam 原点で lineageName/relatedPicks/フィルタ非破壊・既存 6 pick URL 不変。SUCCESS
6. 脳体分離・マジックナンバー(`--lineage-*` 集約)・SSOT・両 locale i18n。SUCCESS

## 総合判定
**SUCCESS**

## 備考
- npm 実行は `/home/ii/.local/nodejs/bin` の node v22.22.3 / npm 10.9.8 を使用。
- push は本人 (developer/親は push しない)。
