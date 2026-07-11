# verification_report

## 対象
本日発掘記事「ファミレスを享受せよ(Enjoy the Diner)」(appid 2336980)の追加検証セッション。

**正直な申告**: 本セッション開始時点で、picks.ts の該当 entry(slug: `enjoy-the-diner`)・LINEAGE_ANCHOR の新規 itch.io アンカー(`moonpalace`)・ui.ts の genre ラベル(`diner-mystery-adv`)・OG 元画像(`public/og-src/2336980.jpg`)・jsonld.ts / OriginPage.astro の itchio 識別子タイプ配線は、**既に git commit 3fa4486(`feat: 原石記事 ファミレスを享受せよ を追加`)として作業ツリーに存在していた**(実装は前セッションで完了・commit 済み)。本セッションでは実装内容を Read で全文精査し、依頼の確定事実(JSON)と1つずつ突き合わせ、その上で `npm run build` を含む一次検証を再実行して合否を物理確認した。新規実装は行っていない(既存実装の正しさを検証した回)。

## 確定事実との突き合わせ(picks.ts 本文を直接 Read して照合)
| 確定事実(依頼 JSON) | picks.ts 記載 | 一致 |
|---|---|---|
| positive_pct=97 / reviews_total=1125 | `meta.rarity={reviews:1125, positivePct:97}`、desc 本文「1,125件のレビュー...好評率97%」 | PASS |
| english_reviews=118 / english_pct=10.5% | desc 本文「118件、約10.5%はすでに英語レビュー」 | PASS |
| is_early_access=false / is_free=false | desc 本文「アーリーアクセスではなく正式リリース済み」「無料ではない有料タイトル」 | PASS |
| release_date(2023年7月) | desc 本文にリリース日として記載、確定事実と一致 | PASS |
| lineage_anchor_key=itch.io_url / value=https://oissisui.itch.io/moonpalace | LINEAGE_ANCHOR.moonpalace.itchio と games[].itchio が完全一致文字列で相互参照 | PASS |
| west_unreached の理由(英語比率10.5%・Kotaku/PC Gamer/RPS等未確認・IGN Japan 1件のみ) | desc_en/ja に "no coverage from outlets such as Kotaku, PC Gamer, or Rock Paper Shotgun" / "the one critic review on record, from IGN Japan at a score of 80" と明記、`reachState: "unreached_west"` | PASS |
| 未確認の受賞・ローカライズ予定・数値の捏造禁止 | 国際賞ノミネート等の記載なし。IGN Japan スコア80 のみを事実として引用 | PASS(捏造なし) |
| developer/publisher(月刊湿地帯・Studio Dragonet・Waku Waku Games) | desc 本文に社名・拠点(福岡/東京)・資本金150万円まで記載 | PASS |
| slug 英語 kebab | `enjoy-the-diner` | PASS |
| published(公開日)フィールドが本日固定であること | picks.ts の `published` / `publishAt` フィールドが揃って本日の公開予定日で固定されている(即公開設定) | PASS |

## ビルド
- コマンド: `export PATH="/home/ii/.local/nodejs/bin:$PATH" && npm run build`(node v22.22.3 / npm 10.9.8)
- 結果: **SUCCESS**(exit 0、`npm run build > /tmp/build_out.log 2>&1; echo $?` で明示確認)
- 出力: 284 page(s) built / sitemap-index.xml 生成 / Complete!
- ビルドログを `error|warn|fail` で grep(og-src cache hit 等のノイズを除く) → **0 hit**

## href 破損ゼロの実測確認(サイト全体)
- dist 配下の全 `*.html`(すべてのページ、新規分だけでなく既存 283 ページも含む)を Python で走査し、`href="/..."` 形式の内部リンクをすべて実ファイルへ解決できるか検証
- 結果: **checked hrefs: 4762 / broken: 0**
- 個別確認: `/picks/enjoy-the-diner/`(en)と `/ja/picks/enjoy-the-diner/` の href 一覧を目視 grep — Steam(`app/2336980/`)・itch.io(`oissisui.itch.io/moonpalace`)・`/origins/moonpalace/`・canonical 自己参照 URL いずれも非空で正しい

## sitemap / OG / genre 表示の実測確認
| 項目 | 実測結果 |
|---|---|
| sitemap-0.xml に en/ja 両 URL | `https://next.games.passed.jp/picks/enjoy-the-diner/` と `.../ja/picks/enjoy-the-diner/` の両方を確認 |
| OG 画像生成(2言語) | `dist/og/enjoy-the-diner.png` / `dist/og/enjoy-the-diner.ja.png` を実ファイルとして確認 |
| OG 元画像(fastly header) | `public/og-src/2336980.jpg` = `file` コマンドで `JPEG image data, ... 460x215` を実測(有効なJPEG) |
| genre facet 空表示なし | `dist/index.html` に "Diner mystery ADV"、`dist/ja/index.html` に "ファミレスミステリーADV" を確認(ui.ts の en/ja 両ラベルが正しく解決) |
| origins/moonpalace ページ生成 | `dist/origins/moonpalace/index.html` と `dist/ja/origins/moonpalace/index.html` の両方が存在、出典リンクに itch.io ページのみを表示(steam/wikidata を持たない anchor として正しく分岐) |
| JSON-LD | `/picks/enjoy-the-diner/` の `<script type="application/ld+json">` を実際にパースし、`sameAs` が `["https://store.steampowered.com/app/2336980/Enjoy_the_Diner/"]` であることを確認(捏造なし) |

## SSOT 確認
- `https://oissisui.itch.io/moonpalace` の出現箇所: picks.ts 内 4 箇所(コメント2 + `games[].itchio` 1 + `LINEAGE_ANCHOR.moonpalace.itchio` 1)。実体側 1 箇所とアンカー側 1 箇所の重複は、既存の全 anchor(例: wizardry-proving-grounds の steam id、kageroh の wikidata QID)と同型の「逆引き用の意図的な identity 一致」であり、CLAUDE.md §12 が禁じる無関係ファイルへの値散乱ではない(既存パターンとの一致を確認済み)
- 新規追加した genre ラベル `diner-mystery-adv` は ui.ts の en/ja 双方にのみ定義され、他ファイルへの直書きなし

## 総合判定
**SUCCESS**

## 備考(正直な申告)
- 本セッションでは Steam API 等への再実測(独立ファクトチェック)は行っていない。確定事実(依頼 JSON)は「購入可能性確認済み」との前提で提供されたものをそのまま信頼し、picks.ts 本文との整合(捏造がないか・誇張がないか)のみを Read で全文照合した(自信度: 高 = ビルド・href・sitemap・OG は実測、事実の一次ソース裏取りは前セッション実施分に依拠)。
- commit は行っていない(本人指示「commitするな」を遵守)。作業ツリーは commit 3fa4486 の状態のまま、verification_report.md のみ本セッションの検証内容で更新した(未 commit)。
- push は本人(developer/親は push しない)。
