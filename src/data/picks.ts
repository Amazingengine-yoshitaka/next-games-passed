// 紹介ページ(pick) の content 単一ソース (SSOT)。
// 言語非依存データ(steam/score)は共有、prose だけ en/ja を co-locate。
// 経路(/picks/x と /ja/picks/x)はこの1ソースから render する。脳(データ)と体(PickPage)を分離。
//
// 【URL 不変ルール】紹介記事ページの URL は絶対に変えない(authority を貯める永続 identity)。
// 可変なのは装飾(presentation)だけ。ゲームの status で同一 URL のまま見せ方を出し分ける(hidden -> surfaced)。
// status は抽象な可視性ステート: "established"=既知/原点 / "hidden"=未発見 / "surfaced"=発見された。
// 装飾層が state を branding にマップ。state と branding は分離(branding が変わっても state は不変)。
//
// 【代表エンティティ (AEO)】1ページ1正準エンティティ。games[0] を暗黙の代表にしない。
//   kind: "hub" = 味そのものを語るハブ記事。代表は特定ゲームでなく味(topic)。
//   kind: "find" = 無名の1本が主役の発掘記事。代表は games[leadIndex] の VideoGame。
//   leadIndex: そのページの主題になる games[] の index。
//   topic: hub の代表に使う味の名前(言語別)。find では使わない(games[leadIndex] から導出)。
// 代表名の解決は lib/jsonld.ts representativeName() に一元化(SSOT)。直読み禁止。
//
// 【tag と status の二層】status は機械判定用ステート、tag は表示専用ラベル。
//   tag はブランド名(site.ts SITE.name / SITE.nameEn)と文字列一致させない(Organization と
//   VideoGame 属性の同綴り衝突を断つ)。状態語の最終文言は po 確定マター。
//
// 【name 形の統一】全ゲームを name_en / name_ja で持つ(name 単一形は廃止)。
//
// 【meta (フィルタ/ソート用・事実のみ)】presentation 層のフィルタ/ソートが読むデータ。
//   捏造禁止: desc に既述 or Steam で検証できる事実だけを構造化する。不確実値(価格/
//   プレイ時間は store で都度変わる)はキー自体を持たせない。脳(data)と体(filter UI)を分離。
//   - genre   : ジャンル分類ラベル(言語別 key を i18n ui.ts に持ち、ここは安定 id のみ)
//   - lineage : この味の系譜の原点ゲーム(安定 id)。established な原点を 1 つ指す。
//   - obscurity: 埋もれ度ステート。"deep"=レビュー僅少で西で無名 / "wall"=高評価だが言語/地域の壁で未到達。
//                established(原点・既知)には付けない。
//   - reviewBand: レビュー規模帯(検証可能な水準のみ)。"hundreds"=数百 / "around_1k"=約千。不明なら持たせない。
//   - reachState: 到達状態。"unreached_west"=西未到達 / "lang_walled"=言語の壁。
//   並び替え "buried_most"(埋もれ過ぎ順) は obscurity と reviewBand の合成で presentation 層が算出する。
//
// 【rarity (希少性スタンプ・案C)】静かな対比で「無名なのに○○」を語る事実。捏造禁止。
//   desc に既述 or Steam で検証できる事実だけを number/bool で構造化する(文中パースしない・脆い)。
//   - reviews     : レビュー総数(整数・確定値のみ)。不確実なら持たせない。
//   - positivePct : 好評率(整数 %・Steam 表記の確定値のみ)。不明なら持たせない。
//   - noEnglish   : 英語非対応か(bool)。西へ届かない壁の事実。
//   ラベル/語順は presentation 層(rarityStamps)+ i18n が持つ。data は数値と事実だけ(脳と体の分離)。

// 自社作の固有値(name/steam)は site.ts BITOZ が SSOT。ここでは直書きせず参照する(CLAUDE.md 12)。
import { BITOZ } from "./site";

export const picks = {
  "read-and-build": {
    published: "2026-06-05",
    kind: "hub",
    // leadIndex は PickPage の表示主役(g0)を Bit Oz に向ける。hub の JSON-LD 代表は不変:
    // jsonld.ts が hub では leadIdx=-1 にし #lead をどの VideoGame にも付けない(about=Thing=味)。
    // ゆえに有名作も自社作も正準エンティティに祭り上げない設計は壊れない(AEO 不破壊)。
    leadIndex: 0,
    topic: { en: "Read-and-build games", ja: "状況を読んで組むゲーム" },
    // 多親: この味は二つの原点を持つ。組む系の原点 Slay the Spire と、狙う系の原点 Archero。
    //   lineage は single string も配列も受ける(lineageIds で正規化・後方互換)。
    //   Bit Oz は根でなく交点の子(中立)。HomePage の facet/filter は代表 = 先頭1本(lineageIds[0])で読む。
    meta: { genre: "deckbuilder", lineage: ["slay-the-spire", "archero"], obscurity: "none" },
    games: [
      {
        // 主役: 自社作 Bit Oz(この味の故郷)。name/steam は BITOZ 参照(直書き禁止・SSOT)。
        // status は "surfaced"(発見された自社の故郷)。established にしない = lineage 逆引き
        // (slay-the-spire=646570 の established 走査)を汚さない。app id も非一致で実害なし。
        name_en: BITOZ.name,
        name_ja: BITOZ.name,
        status: "surfaced",
        steam: BITOZ.steam,
        tag_en: "Our home",
        tag_ja: "我々の故郷",
        // desc は BitOz.astro:13-14 の本文を hub 文脈へ要約(捏造しない・既述事実のみ)。
        desc_en: "Our own read-and-build game. A shooter x roguelite where you aim it yourself, but the moment you go to fire, an aim line shows how the shot travels and where it lands (Aim Mode slows time so you line it up like billiards). So it is not about landing the hit. You read the situation it creates and rebuild your next move in real time, while skill cards and reflective walls warp that line and flip the whole board.",
        desc_ja: "我々自身の、状況を読んで組むゲーム。シューティング x ローグライトで、自分で狙うが、撃とうとすると弾がどう通ってどこに当たるかの動線が見える(Aim Mode で時間が止まり、ビリヤードのように狙う)。だから当てるだけのゲームじゃない。その先の状況を読んで、次の一手をリアルタイムで組む。技カードや反射壁で、その動線そのものが化けて盤面が一変する。",
      },
      {
        name_en: "Slay the Spire",
        name_ja: "Slay the Spire",
        status: "established",
        steam: "https://store.steampowered.com/app/646570/Slay_the_Spire/",
        wikidata: "https://www.wikidata.org/wiki/Q49652113",
        tag_en: "Origin",
        tag_ja: "原典",
        desc_en: "The purest origin. Build a deck and adapt to a board that changes every turn. The textbook of situation and building. But it is fully turn-based, so time stands still.",
        desc_ja: "味の純度が高い原典。デッキを組み、毎ターン変わる盤面を読んで適応する。状況の読みと構築のお手本。ただし完全ターン制で時間は止まる。",
      },
      {
        name_en: "Into the Breach",
        name_ja: "Into the Breach",
        status: "established",
        steam: "https://store.steampowered.com/app/590380/Into_the_Breach/",
        wikidata: "https://www.wikidata.org/wiki/Q48729625",
        tag_en: "You see the future",
        tag_ja: "未来が見える",
        desc_en: "The enemy next move is shown in advance, and you read its outcome to stop it. The most cerebral way to feel one move flipping the whole situation.",
        desc_ja: "敵の次の一手が先に見えている状態で、その結末を読んで防ぐ。一手で状況が一変するを最も知的に味わえる。",
      },
      {
        // 二親のもう一方の原点: 狙う系(アーチャー・ローグライト)の原点 Archero。
        // Steam 版が無い初の established。Steam URL は積まない(appid 1806970 は無関係作・絶対使用禁止)。
        // url(JSON-LD)は公式、sameAs は Wikidata + App Store + 公式で実体を確定する(捏造なし)。
        name_en: "Archero",
        name_ja: "Archero",
        status: "established",
        homepage: "https://habby.com/",
        wikidata: "https://www.wikidata.org/wiki/Q116031886",
        appstore: "https://apps.apple.com/app/id1453651052",
        tag_en: "The aim origin",
        tag_ja: "狙う系の原点",
        desc_en: "The origin of the archer-roguelite: when you stop moving you auto-aim and fire, so you read the board by choosing when to stand still. Habby, 2019, mobile only (no official Steam release).",
        desc_ja: "アーチャー・ローグライトの原点。動きを止めると自動で照準して撃つ——だから止まる瞬間を選んで盤面を読む。Habby・2019・モバイル専用(公式 Steam 版なし)。",
      },
    ],
    en: {
      title: "When one move flips the board. Hidden games for the read-and-build taste",
      description: "You read a situation that keeps changing and rebuild on the fly. Games with that one taste, lined up by lineage.",
      h1a: "When one move ",
      h1flip: "flips the board",
      h1b: ".",
      lede: "Not reflexes, not memorization. You read a situation that keeps changing, and you rebuild on the fly. Just that one thing.",
      s1: "First, let me name the feeling",
      feeling: [
        "The situation shifts constantly. The board that was winning a second ago collapses in an instant.",
        "But you do not get stuck. You read it. The thought this one move changes everything forms in your head.",
        "Then you rebuild. Your hand, your build, your positioning, right there. When it clicks, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You sank 100 hours into Slay the Spire without noticing",
        "You love the Into the Breach feeling of solving it while the enemy next move is visible",
        "You like turn-based, but you want the situation to move in real time even more",
      ],
      bad: [
        "You want Vampire Survivors style: auto-fire and mow them down (that is bathe in it, not read it)",
        "You want to memorize one optimal build and run it forever",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "一手で、盤面がひっくり返る。状況を読んで組むのが好きな人へ",
      description: "動いてる状況を読んで組み替える。その一点だけの味を持つゲームを系譜で並べる。",
      h1a: "一手で、盤面が",
      h1flip: "ひっくり返る",
      h1b: "。",
      lede: "反射神経でも、丸暗記でもない。動いてる状況を、読んで、組み替える。その一点だけ。",
      s1: "まず、この感覚に名前をつけたい",
      feeling: [
        "状況が刻々と変わる。さっき有利だった盤面が、一瞬で崩れる",
        "でも、そこで詰むんじゃなく読む。この一手でこう変わる、が頭に浮かぶ",
        "そして組み替える。手札やビルドや位置取りを、その場で。ハマった瞬間ゾクッとする",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Slay the Spire、気づいたら100時間入れてた人",
        "Into the Breach の、敵の次が見えてる上で詰将棋する感じが好きな人",
        "ターン制も好きだけど、リアルタイムに状況が動く方が欲しい人",
      ],
      bad: [
        "Vampire Survivors みたいに自動で撃って気持ちよく殲滅が欲しい人",
        "一つの最適ビルドを覚えてずっと回したい人",
      ],
      s3: "系譜：この味の原点たち",
    },
  },
  "touhou-lost-branch": {
    published: "2026-06-05",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "deckbuilder", lineage: "slay-the-spire", obscurity: "wall", reachState: "unreached_west" },
    games: [
      {
        name_en: "Touhou: Lost Branch of Legend",
        name_ja: "東方光耀夜",
        status: "hidden",
        steam: "https://store.steampowered.com/app/1140150/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "An MTG-style five-color mana system poured into a Slay the Spire deckbuilder. Which colors you commit to shifts the whole board. Loved in Japan and China, almost unknown in the West.",
        desc_ja: "MTG型の5色マナを Slay the Spire 型デッキ構築に注いだ一本。寄せる色で盤面が丸ごと変わる。日本と中国では高評価、西ではほぼ無名。",
      },
      {
        name_en: "Slay the Spire",
        name_ja: "Slay the Spire",
        status: "established",
        steam: "https://store.steampowered.com/app/646570/Slay_the_Spire/",
        wikidata: "https://www.wikidata.org/wiki/Q49652113",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste. The gem above adds one axis to it: color.",
        desc_ja: "この味の原点。上の未発掘の名作はそこに色という一軸を足す。",
      },
    ],
    en: {
      title: "Touhou: Lost Branch of Legend - the buried gem that adds color to Slay the Spire",
      description: "An uncut deckbuilder loved in Japan and China but unseen in the West. MTG-style color mana flips the whole board.",
      h1a: "The gem that adds ",
      h1flip: "color",
      h1b: " to Slay the Spire.",
      lede: "Loved in Japan and China, almost unseen in the West. A deckbuilder where the colors you commit to flip the whole situation.",
      s1: "First, the one feeling",
      feeling: [
        "You commit to a set of colors, and the whole board tilts with that choice.",
        "A turn later the situation shifts and the color you leaned on is suddenly wrong.",
        "So you re-read and rebuild around a new color. That re-commit is the chill.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You sank 100 hours into Slay the Spire and want one more axis",
        "You like reading colors and synergies in MTG",
        "You want a gem the West has not found yet",
      ],
      bad: [
        "You want a polished, English-first Western release",
        "You want to memorize one build and run it forever",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "東方光耀夜 - Slay the Spire に色を足す埋もれた原石",
      description: "日本と中国で愛されながら西では無名のデッキ構築原石。MTG型の色マナで盤面が丸ごとひっくり返る。",
      h1a: "Slay the Spire に",
      h1flip: "色",
      h1b: "を足す原石。",
      lede: "日本と中国では愛され、西ではほぼ見られていない。寄せる色で状況が丸ごとひっくり返るデッキ構築。",
      s1: "まず、その一点の感覚",
      feeling: [
        "どの色に寄せるかを決めると、その選択で盤面全体が傾く。",
        "一手後に状況が変わり、頼った色が急に弱くなる。",
        "だから読み直して、別の色で組み替える。その寄せ直しがゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Slay the Spire に100時間入れて、もう一軸欲しい人",
        "MTG の色とシナジーを読むのが好きな人",
        "西がまだ見つけてない原石を先に触りたい人",
      ],
      bad: [
        "西の、磨かれた英語ファーストの一本が欲しい人",
        "一つのビルドを覚えてずっと回したい人",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "mortal-glory-2": {
    published: "2026-06-06",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "roguelike", lineage: "slay-the-spire", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west" },
    games: [
      {
        name_en: "Mortal Glory 2",
        name_ja: "Mortal Glory 2",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2216660/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A turn-based gladiator-team roguelike. You recruit a squad, read each matchup, and draft counters and perks run by run. Brutal and deep, yet barely known in the West at a few hundred reviews.",
        desc_ja: "ターン制の剣闘士チーム・ローグライク。仲間を集め、対面を読み、ラン毎にカウンターと特性を組む。残酷で奥深いのに、西でも数百レビューしかなくほぼ無名。",
      },
      {
        name_en: "Slay the Spire",
        name_ja: "Slay the Spire",
        status: "established",
        steam: "https://store.steampowered.com/app/646570/Slay_the_Spire/",
        wikidata: "https://www.wikidata.org/wiki/Q49652113",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The roguelike origin of reading a run and adapting. This gem brings it to a gladiator squad instead of a deck.",
        desc_ja: "ランを読んで適応するローグライクの原点。この未発掘の名作はそれをデッキでなく剣闘士チームでやる。",
      },
    ],
    en: {
      title: "Mortal Glory 2 - the buried gladiator-team roguelike where you read and counter",
      description: "A brutal turn-based gladiator roguelike loved by a few hundred players but unknown in the West. Read the matchup, draft your counter.",
      h1a: "Read the matchup, ",
      h1flip: "then counter",
      h1b: ".",
      lede: "Not a deck. A gladiator team. You read who you face and build the counter, fight after fight. A buried Finnish indie at a few hundred reviews.",
      s1: "First, the one feeling",
      feeling: [
        "Each fight a new gladiator squad steps up, and the team that just won suddenly looks wrong.",
        "But you do not panic. You read the matchup, and the counter forms: this fighter, this perk, this position.",
        "Then you draft and adapt your roster. When the counter lands and a stronger team falls, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love roguelikes where you adapt the build to what you face",
        "You like team tactics: positioning, synergies, counters",
        "You want a brutal, deep indie the West has not noticed",
      ],
      bad: [
        "You want big-budget polish and a marketing machine",
        "You want one fixed team you run forever",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Mortal Glory 2 - 対面を読んでカウンターする、埋もれた剣闘士チーム・ローグライク",
      description: "数百人に愛されながら西では無名の、残酷なターン制剣闘士ローグライク。対面を読んで、カウンターを組む。",
      h1a: "対面を読んで、",
      h1flip: "カウンターを組む",
      h1b: "。",
      lede: "デッキじゃない。剣闘士チームだ。誰と戦うかを読み、カウンターを組む——一戦ごとに。数百レビューで埋もれたフィンランドのインディー。",
      s1: "まず、その一点の感覚",
      feeling: [
        "戦うたび新しい剣闘士の相手が現れ、さっき勝った編成が急に噛み合わなく見える。",
        "でも慌てない。対面を読む。この剣闘士、この特性、この配置、というカウンターが浮かぶ。",
        "そして編成を組み替えて適応する。カウンターが決まって格上が崩れた瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "対面に合わせてビルドを変えるローグライクが好きな人",
        "配置・シナジー・カウンターのチーム戦術が好きな人",
        "西がまだ気づいてない、残酷で奥深いインディーを掘りたい人",
      ],
      bad: [
        "大作級の磨き込みと宣伝予算が欲しい人",
        "固定の最強チームをずっと回したい人",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "guild-explorers": {
    published: "2026-06-06",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "puzzle", lineage: "obra-dinn", obscurity: "wall", reviewBand: "around_1k", reachState: "lang_walled", rarity: { reviews: 937, positivePct: 98, noEnglish: true } },
    games: [
      {
        name_en: "Welcome to the Guild Explorers",
        name_ja: "ギルド探求団へようこそ！",
        status: "hidden",
        steam: "https://store.steampowered.com/app/4327530/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A deduction puzzle where you reconstruct, by pure logic, which of 20 parties each of 78 adventurers belonged to, from scattered records. Overwhelmingly Positive in Japan at 937 reviews, but it has no English support, so the West cannot read it yet.",
        desc_ja: "78人の冒険者が20パーティのどこに居たかを、記録の断片から論理だけで復元する推理パズル。937レビューで圧倒的に好評なのに英語非対応で、西はまだ読めない。",
      },
      {
        name_en: "Return of the Obra Dinn",
        name_ja: "Return of the Obra Dinn",
        status: "established",
        steam: "https://store.steampowered.com/app/653530/Return_of_the_Obra_Dinn/",
        wikidata: "https://www.wikidata.org/wiki/Q57008108",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of deduction from fragments: piece together names and fates from scattered evidence until it clicks on its own. This gem distills that pure logic into a number puzzle.",
        desc_ja: "断片から自力で推理して気づくデダクションの原点。散らばった証拠から名前と運命を組み上げ、ひとりでに繋がる。この未発掘の名作はその論理だけを数の推理に凝縮する。",
      },
    ],
    en: {
      title: "Welcome to the Guild Explorers - a buried logic-deduction gem, walled off by language",
      description: "A deduction puzzle loved in Japan at 937 reviews and 98 percent positive, but with no English support. Reconstruct who belonged where, by pure logic, from scattered records.",
      h1a: "Reconstruct it ",
      h1flip: "by pure logic",
      h1b: ".",
      lede: "78 adventurers, 20 parties. From scattered records you work out who was where, by logic alone. The only wall keeping the West out is language: it has no English support. Build the bridge and it travels.",
      s1: "First, the one feeling",
      feeling: [
        "The records give you fragments, never the answer. Who was in which party stays a fog at first.",
        "But you do not guess. You cross-reference clue against clue, and one fixed fact forces the next into place.",
        "Then the chain locks. When the last party falls into position by logic alone, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Return of the Obra Dinn and Outer Wilds joy of working it out yourself, no hand-holding",
        "You want a logic puzzle where every answer is forced, never a lucky guess",
        "You do not mind that it has no English yet: the gem is the logic, and language is the only wall",
      ],
      bad: [
        "You need a fully localized, English-first release right now",
        "You want action or reflexes, not slow deduction at your own pace",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ギルド探求団へようこそ！ - 言語の壁だけで埋もれた論理推理の原石",
      description: "937レビュー98%好評で日本で愛されながら英語非対応の推理パズル。記録の断片から、誰がどこに居たかを論理だけで復元する。",
      h1a: "論理だけで、",
      h1flip: "復元する",
      h1b: "。",
      lede: "78人の冒険者、20のパーティ。記録の断片から、誰がどこに居たかを論理だけで割り出す。西へ届かない壁はただ一つ、英語非対応であること。橋を架けるだけで化ける。",
      s1: "まず、その一点の感覚",
      feeling: [
        "記録は断片しかくれない。答えは渡されない。誰がどのパーティかは最初は霧の中。",
        "でも当てずっぽうはしない。手がかりと手がかりを突き合わせ、一つ確定すると次が必然で決まる。",
        "そして連鎖が噛み合う。最後のパーティが論理だけで定まった瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Return of the Obra Dinn や Outer Wilds の、誰にも教わらず自力で気づく快感が好きな人",
        "全部が必然で決まる、運の当てずっぽうがない論理パズルが欲しい人",
        "まだ英語がなくても気にしない人——原石は論理で、言語だけが唯一の壁だから",
      ],
      bad: [
        "今すぐ完全ローカライズ済みの英語ファーストが欲しい人",
        "ゆっくり推理より、アクションや反射神経が欲しい人",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "spell-tonaeru": {
    published: "2026-06-06",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "deckbuilder", lineage: "slay-the-spire", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 357, positivePct: 97, noEnglish: true } },
    games: [
      {
        name_en: "Spell Tonaeru",
        name_ja: "スペルトナエル",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3107590/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A roguelite where you do not just build spells, you spell them out by moving across a Japanese kana board to trace each incantation while bullets fly. Very Positive in Japan at 357 reviews and 97 percent, but it has no English support, so the West cannot read it yet.",
        desc_ja: "呪文を組むだけでなく、五十音の盤上を動いて一文字ずつなぞり、弾幕を避けながら唱え切るローグライト。357レビュー97%で日本では非常に好評なのに英語非対応で、西はまだ読めない。",
      },
      {
        name_en: "Slay the Spire",
        name_ja: "Slay the Spire",
        status: "established",
        steam: "https://store.steampowered.com/app/646570/Slay_the_Spire/",
        wikidata: "https://www.wikidata.org/wiki/Q49652113",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of collecting and building your kit run by run, reading the situation, and choosing what to play. This gem keeps that, but you must physically cast each spell on a board in real time while dodging.",
        desc_ja: "ラン毎に手札を集めて組み、状況を読んで何を切るかを選ぶ味の原点。この未発掘の名作はそれを保ちつつ、組んだ呪文を盤上でリアルタイムに、回避しながら唱えさせる。",
      },
    ],
    en: {
      title: "Spell Tonaeru - a buried roguelite where you spell out your magic on a kana board, walled off by language",
      description: "Not a deck you play, spells you spell. You move across a Japanese kana board to trace each incantation while bullets fly. Very Positive in Japan at 97 percent, but no English yet.",
      h1a: "Spell it out, ",
      h1flip: "then cast",
      h1b: ".",
      lede: "Not a deck you play. Spells you spell. You move across a Japanese kana board to trace each incantation while bullets fly. Loved in Japan at 97 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "A longer spell hits harder. But the whole time you trace it, you are wide open and the bullets keep coming.",
        "So you split your choices by the moment: short fast spells, and a gambled big spell.",
        "Then you finish a dangerous big spell in a gap in the bullets. The instant it lands, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love building roguelites and want the thrill of executing, not just assembling",
        "You sank time into Slay the Spire but want the situation to move in real time",
        "You want to touch a gem the West has not found, buried by language alone",
      ],
      bad: [
        "You need a polished, English-first release right now (no English yet, the wall is language only)",
        "You want fully turn-based reading at your own pace (this mixes in real-time bullet dodging)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "スペルトナエル - 五十音の盤上で呪文を綴って唱える、言語の壁で埋もれた構築ローグライト",
      description: "切るデッキじゃない。綴る呪文だ。五十音の盤上を動いて呪文を一文字ずつなぞる、弾幕を避けながら。日本では97%好評なのに英語非対応で西はまだ読めない。",
      h1a: "綴って、",
      h1flip: "唱える",
      h1b: "。",
      lede: "切るデッキじゃない。綴る呪文だ。五十音の盤上を動いて呪文を一文字ずつなぞる、弾幕を避けながら。日本では97%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "長い呪文ほど強い。でも唱えている間はずっと無防備で、弾幕が来る。",
        "だから短く速い呪文と、一発逆転の大呪文を、状況で選び分ける。",
        "危険な大呪文を弾幕の隙に唱え切った瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "構築ローグライトが好きで、組むだけでなく実行のスリルも欲しい人",
        "Slay the Spire に時間を溶かして、もっとリアルタイムに状況が動く方が欲しい人",
        "言語の壁だけで埋もれた原石を、西より先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(壁は言語だけ・英語は未対応)",
        "完全ターン制でゆっくり読みたい人(本作は弾幕回避のリアルタイム性が混ざる)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "oyabu-deathcare-clinic": {
    published: "2026-06-06",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "simulation", lineage: "two-point-hospital", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 235, positivePct: 94, noEnglish: false } },
    games: [
      {
        name_en: "Oyabu Clinic Deathcare Corporation",
        name_ja: "医療無法人おおやぶ死科クリニック",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2227450/Oyabu_Clinic_Deathcare_Corporation/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A pitch-black turn-based management sim from a Japanese doujin circle. You do not heal patients, you read their wallet and pick the malpractice that pays most, milking the health-insurance system. Very Positive in Japan at 235 reviews, but only 18 English reviews, so the West has not found it.",
        desc_ja: "日本の同人サークルが作った真っ黒なターン制経営SLG。患者を治すのではなく財布を読み、一番儲かる不正処置を選んで健康保険から金を錬金していく。235レビューで非常に好評なのに英語レビューは18件で、西はまだ見つけていない。",
      },
      {
        name_en: "Two Point Hospital",
        name_ja: "Two Point Hospital",
        status: "established",
        steam: "https://store.steampowered.com/app/535930/Two_Point_Hospital/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the hospital-management taste: read each illness, assign the right treatment, and optimize the clinic to run at its best. This gem flips that good optimization into its dark mirror: you optimize for insurance money, not for the cure.",
        desc_ja: "病院経営SLGの味の原点。病気を読み、正しい処置を割り当て、病院を最適化して効率を最大化していく。この未発掘の名作はその善の最適化を反転させ、治すためでなく保険金のために最適化させる。",
      },
    ],
    en: {
      title: "Oyabu Clinic Deathcare Corporation - the buried dark-comedy management sim where you optimize the wrong way",
      description: "A pitch-black turn-based management sim from a Japanese doujin circle. Very Positive in Japan at 235 reviews, but only 18 English reviews, so the West has not found it.",
      h1a: "Optimize the clinic, ",
      h1flip: "the wrong way",
      h1b: ".",
      lede: "Not run a hospital to heal. Run one to drain insurance. You read each patient and pick the malpractice that pays most. Loved in Japan at 235 reviews, almost unseen in the West.",
      s1: "First, the one feeling",
      feeling: [
        "A patient walks in, and you do not read what cures them, you read what their wallet and insurance can be milked for.",
        "So you pick the treatment by profit, not by care, and the clinic ledger tilts with every cold choice.",
        "When a chain of malpractice lands and the money pours in past the line you should never cross, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love management sims like Two Point Hospital but want a pitch-black, satirical twist",
        "You like reading each case and optimizing the most profitable route, turn by turn",
        "You want a Japanese doujin gem the West has not noticed, buried under 18 English reviews",
      ],
      bad: [
        "You want a wholesome, build-a-pretty-hospital sim (this is gleefully unethical dark comedy)",
        "You need a big-budget, marketed release rather than a small doujin circle's work",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "医療無法人おおやぶ死科クリニック - 最適化の矛先がズレた、埋もれた経営SLG",
      description: "日本の同人サークルが作った真っ黒なターン制経営SLG。235レビューで非常に好評なのに英語レビューは18件で、西はまだ見つけていない。",
      h1a: "クリニックを最適化する、",
      h1flip: "間違った方向に",
      h1b: "。",
      lede: "治すための病院運営じゃない。保険金を絞り取るための運営だ。患者ごとに読んで、一番儲かる不正処置を選ぶ。日本では235レビューで愛され、西ではほぼ見られていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "患者が来る。何が治るかは読まない。財布と保険からいくら搾れるかを読む。",
        "だから治療を「思いやり」でなく「利益」で選び、その冷たい選択ごとに帳簿が傾く。",
        "不正処置が連鎖して、越えてはいけない一線の向こうへ金が流れ込んだ瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Two Point Hospital のような経営SLGが好きで、真っ黒で風刺の効いたひねりが欲しい人",
        "症例ごとに読んで、一番儲かるルートをターン毎に最適化するのが好きな人",
        "英語レビュー18件で埋もれた、西がまだ気づいてない日本の同人原石を掘りたい人",
      ],
      bad: [
        "綺麗な病院を建てる健全な経営シムが欲しい人(本作は不謹慎を楽しむダークコメディ)",
        "小さな同人サークルの作でなく、大作級の宣伝された一本が欲しい人",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "elbab-library-autobattler": {
    published: "2026-06-06",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "roguelike", lineage: "slay-the-spire", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 129, positivePct: 82, noEnglish: false } },
    games: [
      {
        name_en: "ELbab",
        name_ja: "エルバブ",
        status: "hidden",
        steam: "https://store.steampowered.com/app/4209630/ELbab/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A roguelite auto-battler set in an endless library, made by a Japanese solo dev who calls it Path of Exile meets Slay the Spire. You pick tiles to design a build, then the battles run on their own. Very Positive in Japan at 129 reviews, but only 15 English reviews, so the West has barely found it.",
        desc_ja: "無限の図書館を舞台にした、日本の個人開発者によるローグライト・オートバトラー。本人いわく Path of Exile × Slay the Spire。マスを選んでビルドを設計すると、あとは戦闘が勝手に回る。129レビューで日本では非常に好評なのに英語レビューは15件で、西はまだほぼ見つけていない。",
      },
      {
        name_en: "Slay the Spire",
        name_ja: "Slay the Spire",
        status: "established",
        steam: "https://store.steampowered.com/app/646570/Slay_the_Spire/",
        wikidata: "https://www.wikidata.org/wiki/Q49652113",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of designing a build run by run, reading what you have and choosing what to play. This gem keeps that craft, but pushes it further: combat is fully automatic, so you design the build and then watch it run.",
        desc_ja: "ラン毎にビルドを設計し、手札を読んで何を切るかを選ぶ味の原点。この未発掘の名作はその構築を保ちつつ、さらに押し進める。戦闘は全自動で、ビルドを設計したら、あとは回るのを観る。",
      },
    ],
    en: {
      title: "ELbab - a buried PoE-meets-Slay-the-Spire auto-battler from a Japanese solo dev, almost unread in the West",
      description: "A roguelite auto-battler set in an endless library. You design the build, then watch it run. Very Positive in Japan at 129 reviews, but only 15 English reviews, so the West has barely found it.",
      h1a: "Design the build, ",
      h1flip: "then watch it run",
      h1b: ".",
      lede: "Not a deck you pilot turn by turn. A build you craft, then set loose. Pick tiles through an endless library, stack your synergies, and the battles play themselves out. Loved in Japan, almost unread in the West with just 15 English reviews.",
      s1: "First, the one feeling",
      feeling: [
        "You pick tiles through the library and stack one synergy onto the next, and the build starts to take a shape only you can see.",
        "Then you stop touching it. The battle runs on its own, and every choice you locked in before is now out of your hands.",
        "When a build you designed tears through a boss without a single input, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love designing builds in Path of Exile or Slay the Spire and want the payoff of watching the plan execute itself",
        "You want the depth of theorycrafting without sitting through every fight by hand",
        "You want a Japanese solo dev gem the West has barely read, with only 15 English reviews",
      ],
      bad: [
        "You want to control every turn in real time (combat here is fully automatic, you set it up and let go)",
        "You need a long, polished, content-complete release (this is early access from a one-person team)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ELbab(エルバブ) - PoE×Slay the Spire を個人開発者が一人で。西はまだほぼ読めていない、埋もれたオートバトラー",
      description: "無限の図書館を舞台にしたローグライト・オートバトル。ビルドを設計し、あとは回るのを観る。129レビューで日本では非常に好評なのに英語レビューは15件で、西はまだほぼ見つけていない。",
      h1a: "ビルドを設計して、",
      h1flip: "回るのを観る",
      h1b: "。",
      lede: "ターン毎に操作するデッキじゃない。組み上げて、放つビルドだ。無限の図書館でマスを選び、シナジーを積み、あとは戦闘が勝手に回る。日本で愛され、英語レビュー15件で西はまだほぼ読めていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "図書館でマスを選び、シナジーを一つずつ積み上げる。自分にしか見えない形にビルドが立ち上がっていく。",
        "そして手を離す。戦闘は勝手に回り、組み上げた選択はもう自分の手の外にある。",
        "自分が設計したビルドが、一切の操作なしでボスを薙ぎ倒した瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Path of Exile や Slay the Spire でビルドを練るのが好きで、組んだ計画が自動で実行される快感が欲しい人",
        "理論構築の深さは欲しいが、毎戦闘を手で操作し続けるのは面倒な人",
        "英語レビュー15件で西がまだほぼ読めていない、日本の個人開発の原石を掘りたい人",
      ],
      bad: [
        "毎ターンをリアルタイムで操作したい人(本作の戦闘は全自動・組んでから手を離す)",
        "長く磨き込まれた完成品が欲しい人(個人開発の早期アクセス)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "stellar-code": {
    published: "2026-06-06",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "puzzle", lineage: "obra-dinn", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 471, positivePct: 97, noEnglish: true } },
    games: [
      {
        name_en: "Stellar Code",
        name_ja: "ステラーコード",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3411510/Stellar_Code/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese doujin SF mystery where you read scattered clues and reason out cosmic puzzles yourself. Very Positive in Japan at 471 reviews and 97 percent, but with no English support, so the West has barely found it (only 6 English reviews).",
        desc_ja: "散らばった手がかりを読み、宇宙の謎を自分の論理で解くSFミステリー。日本では471レビュー97%で非常に好評なのに英語非対応で、西はまだ見つけていない(英語レビューは6件)。",
      },
      {
        name_en: "Return of the Obra Dinn",
        name_ja: "Return of the Obra Dinn",
        status: "established",
        steam: "https://store.steampowered.com/app/653530/Return_of_the_Obra_Dinn/",
        wikidata: "https://www.wikidata.org/wiki/Q57008108",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of deduction from fragments: piece together the truth from scattered evidence by pure logic, until it clicks on its own. This gem moves that reasoning to deep space, weaving ciphers and theoretical physics into the story you decode.",
        desc_ja: "断片から自力で推理して気づくデダクションの原点。散らばった証拠を論理だけで組み上げ、ひとりでに繋がる。この未発掘の名作はその推理を宇宙へ移し、物語の中で暗号と理論物理を自分で読み解かせる。",
      },
    ],
    en: {
      title: "Stellar Code - a buried SF-mystery where you decode the cosmos by reason, walled off by language",
      description: "A Japanese doujin SF mystery where you read scattered clues and reason out cosmic puzzles yourself. Very Positive in Japan at 471 reviews and 97 percent, but with no English support, so the West has barely found it (only 6 English reviews).",
      h1a: "Decode the cosmos, ",
      h1flip: "by pure reason",
      h1b: ".",
      lede: "Not a story you only read. A mystery you reason out. Scattered clues, theoretical physics, and you decode the cosmos yourself. Loved in Japan at 97 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "The story hands you fragments and a cosmic riddle, never the answer.",
        "But you do not just read on. You cross the clues against theoretical physics until one piece forces the next.",
        "When the cipher finally resolves and the truth of the cosmos clicks into place, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Return of the Obra Dinn joy of working out the truth yourself from scattered clues",
        "You like a mystery where the science is the puzzle, not just flavor",
        "You want a Japanese doujin gem the West has not read, buried under only 6 English reviews",
      ],
      bad: [
        "You need a polished, English-first release right now (no English yet, the wall is language only)",
        "You want pure action or fast puzzles, not a story-driven mystery you read and reason through at your own pace",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ステラーコード - 宇宙の謎を論理で解き明かす、言語の壁で埋もれたSFミステリー",
      description: "散らばった手がかりを読み、宇宙の謎を自分の論理で解くSFミステリー。日本では471レビュー97%で非常に好評なのに英語非対応で、西はまだ見つけていない(英語レビューは6件)。",
      h1a: "宇宙の謎を、",
      h1flip: "論理で解く",
      h1b: "。",
      lede: "ただ読むだけの物語じゃない。自分の論理で解くミステリーだ。散らばった手がかりと理論物理から、宇宙の謎を自分で読み解く。日本では97%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "物語は断片と宇宙の謎を渡すだけ。答えはくれない。",
        "でも、ただ読み進めるんじゃない。手がかりを理論物理に突き合わせ、一つ確定すると次が必然で決まる。",
        "暗号がほどけ、宇宙の真相がカチッとはまった瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Return of the Obra Dinn の、散らばった手がかりから自力で真相に至る快感が好きな人",
        "科学そのものが謎になっている、読み物以上の推理が欲しい人",
        "英語レビュー6件で西がまだ読めていない、日本の同人原石を掘りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "アクションや速い謎解きが欲しい人(本作は読んで推理する物語主導のミステリー)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "murder-mystery-paradox": {
    published: "2026-06-07",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "puzzle", lineage: "obra-dinn", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 266, positivePct: 86, noEnglish: true } },
    games: [
      {
        name_en: "Murder Mystery Paradox: Fifteen Years of Summer",
        name_ja: "マーダーミステリーパラドクス このひと夏の十五年",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2203040/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A murder-mystery adventure where you are not shown the culprit. On a small island of a few hundred people, you cross testimony against testimony, then accuse by pure deduction. Very Positive in Japan at 266 reviews and 86 percent, but it has no English support, so the West cannot read it yet (only 2 English reviews).",
        desc_ja: "犯人を渡されないマーダーミステリーADV。人口数百人の離島で、証言と証言を突き合わせ、論理だけで告発する。266レビュー86%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは2件)。",
      },
      {
        name_en: "Return of the Obra Dinn",
        name_ja: "Return of the Obra Dinn",
        status: "established",
        steam: "https://store.steampowered.com/app/653530/Return_of_the_Obra_Dinn/",
        wikidata: "https://www.wikidata.org/wiki/Q57008108",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of deduction from fragments: piece together names and fates from scattered evidence by pure logic, until it clicks on its own. This gem moves that reasoning into a murder mystery, where you reach the same naming of the culprit through conversation, accusation and a vote.",
        desc_ja: "断片から自力で推理して名指すデダクションの原点。散らばった証拠を論理だけで組み上げ、ひとりでに繋がる。この未発掘の名作はその推理をマーダーミステリーへ移し、会話と告発と投票で同じく犯人を名指す体験にする。",
      },
    ],
    en: {
      title: "Murder Mystery Paradox - a buried deduction-adventure where you name the culprit, walled off by language",
      description: "A murder-mystery adventure where you reason out the culprit yourself, not one you watch unfold. Very Positive in Japan at 266 reviews and 86 percent, but with no English support, so the West has barely found it (only 2 English reviews).",
      h1a: "Name the culprit, ",
      h1flip: "by pure deduction",
      h1b: ".",
      lede: "Not a mystery you watch unfold. One you reason out. On a tiny island of a few hundred people, you cross testimony against testimony, then accuse. Loved in Japan at 266 reviews and 86 percent, but it has no English yet, so the West cannot read it (only 2 English reviews).",
      s1: "First, the one feeling",
      feeling: [
        "The testimonies give you fragments, never the answer. Who the culprit is stays withheld at first.",
        "But you do not guess. You cross testimony against testimony, and one contradiction forces a single truth into the open.",
        "Then you accuse with conviction. When the recurring riddle finally closes by logic alone, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Return of the Obra Dinn joy of reaching the truth yourself and naming it",
        "You like a conversational murder-mystery of cross-examining testimony and accusing",
        "You want a Japanese doujin project the West has not read, buried under only 2 English reviews",
      ],
      bad: [
        "You need a finished, English-first release right now (no English yet, the wall is language only)",
        "You want action or fast puzzles, not a story-driven mystery you read and reason through at your own pace",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "マーダーミステリーパラドクス このひと夏の十五年 - 犯人を名指す推理ADV、言語の壁で埋もれた一本",
      description: "観るだけのミステリーじゃない。自分で推理して名指すミステリーだ。266レビュー86%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは2件)。",
      h1a: "犯人を、",
      h1flip: "論理で名指す",
      h1b: "。",
      lede: "観るだけのミステリーじゃない。自分で推理して名指すミステリーだ。人口数百人の離島で、証言と証言を突き合わせ、告発する。日本では266レビュー86%で非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは2件)。",
      s1: "まず、その一点の感覚",
      feeling: [
        "証言は断片しかくれない。答えは渡されない。誰が犯人かは最初は伏せられている。",
        "でも当てずっぽうはしない。証言と証言を突き合わせ、一つの矛盾が一つの真実を炙り出す。",
        "そして確信して告発する。繰り返す怪事件の輪が論理だけで閉じた瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Return of the Obra Dinn の、自力で真相に至って名指す快感が好きな人",
        "証言を突き合わせて告発する、会話型のマーダーミステリーが好きな人",
        "英語レビュー2件で西がまだ読めていない、日本の同人企画を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "アクションや速い謎解きが欲しい人(本作は読んで推理する物語主導のミステリー)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "inverted-angel": {
    published: "2026-06-08",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "adventure", lineage: "her-story", obscurity: "wall", reviewBand: "hundreds", reachState: "lang_walled", rarity: { reviews: 567, positivePct: 91, noEnglish: true } },
    games: [
      {
        name_en: "Inverted Angel",
        name_ja: "Inverted Angel",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2894960/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese indie mystery where a girl shows up claiming to be your girlfriend, and you type your own words to branch the story and uncover who she really is. Very Positive in Japan at 567 reviews and 91 percent, but it has no English support, so the West has barely found it (only 5 English reviews). Note: this is not generative AI; your input is matched against the creator's hand-written patterns.",
        desc_ja: "自称彼女として現れた少女の正体を、自分の言葉を打ち込んで物語を分岐させながら暴く日本のインディーミステリー。567レビュー91%で日本では非常に好評なのに英語非対応で、西はまだほぼ見つけていない(英語レビューは5件)。注記：生成AIではなく、入力は開発者が手書きした正解パターンとの照合で判定される。",
      },
      {
        name_en: "Her Story",
        name_ja: "Her Story",
        status: "established",
        steam: "https://store.steampowered.com/app/368370/Her_Story/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of typing your own words to dig out the truth: you search a database of clips, piece together fragments, and reason out a woman's true identity yourself. A BAFTA and IGF Grand Prize winner. This gem keeps that core but lets your own words branch the story itself.",
        desc_ja: "自分の言葉を打ち込んで真相を掘り出すデダクションの原点。映像断片を検索語で集め、女性の正体を自力で推理する。BAFTA・IGF Grand Prize 受賞作。この未発掘の名作はその核を保ちつつ、自分の言葉で物語そのものを分岐させる。",
      },
    ],
    en: {
      title: "Inverted Angel - a buried type-it-yourself mystery, walled off by language",
      description: "A Japanese indie mystery where a girl shows up claiming to be your girlfriend, and you type your own words to branch the story and uncover who she really is. Very Positive in Japan at 567 reviews and 91 percent, but no English support, so the West has barely found it (only 5 English reviews).",
      h1a: "Type your own words, ",
      h1flip: "and find out who she is",
      h1b: ".",
      lede: "Not a story you only read. A mystery you type your way into. A girl appears claiming to be your girlfriend, and you answer in your own words to branch the story and corner her true identity. Loved in Japan at 91 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "She knows too much to be a stalker, and she will not explain. The screen waits for your words, not a menu choice.",
        "So you type what you would actually say, and the story bends down the path your own words opened.",
        "When a line you typed yourself cracks her story open and her real identity surfaces, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You loved the Her Story joy of typing your own way to the truth, no menu hand-holding",
        "You want a mystery that bends to your own words, with multiple endings to chase",
        "You want a Japanese indie gem the West has barely read, with only 5 English reviews",
      ],
      bad: [
        "You need a fully localized, English-first release right now (no English yet, the wall is language only)",
        "You want this to be a true AI chat (it is not generative AI: inputs are matched to the creator's hand-written patterns)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Inverted Angel - 自分の言葉を打ち込んで正体を暴く、言語の壁で埋もれたミステリー",
      description: "自称彼女として現れた少女の正体を、自分の言葉を打ち込んで物語を分岐させながら暴く日本のインディーミステリー。567レビュー91%で日本では非常に好評なのに英語非対応で、西はまだほぼ見つけていない(英語レビューは5件)。",
      h1a: "自分の言葉を打ち込んで、",
      h1flip: "正体を暴く",
      h1b: "。",
      lede: "読むだけの物語じゃない。打ち込んで分け入るミステリーだ。自称彼女として現れた少女に、選択肢でなく自分の言葉で答え、物語を分岐させながら正体を追い詰める。日本では91%で愛されながら英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ストーカーにしては知りすぎている。彼女は説明しない。画面は選択肢でなく、あなたの言葉を待っている。",
        "だから実際に言うであろう言葉を打ち込む。物語は、自分の言葉が開いた道へ折れていく。",
        "自分で打った一言が彼女の話を綻ばせ、本当の正体が浮かんだ瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Her Story の、選択肢に頼らず自分の言葉で真相へ辿り着く快感が好きな人",
        "自分の言葉で物語が曲がり、複数の結末を追える推理が欲しい人",
        "英語レビュー5件で西がまだほぼ読めていない、日本のインディーの原石を掘りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(壁は言語だけ・英語は未対応)",
        "本物のAI会話を期待する人(生成AIではない・入力は開発者が手書きした正解パターンとの照合)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "one-armed-crayfish": {
    published: "2026-06-08",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "to-the-moon", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 166, positivePct: 100, noEnglish: true } },
    games: [
      {
        name_en: "One-Armed Crayfish",
        name_ja: "片腕のザリガニ",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3509770/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A short Japanese doujin visual novel where a boy who only ever goes with the flow meets a girl who does the opposite of everything, and is forced to face what he actually wants. 100 percent positive across 166 reviews in Japan, but it has no English support, so the West has barely found it (only 5 English reviews).",
        desc_ja: "順張りしかしてこなかった少年が、何にでも逆張りする少女と出会い、自分が本当は何を望むのかと向き合わされる日本の同人短編ノベル。166レビュー100%好評なのに英語非対応で、西はまだほぼ見つけていない(英語レビューは5件)。",
      },
      {
        name_en: "To the Moon",
        name_ja: "To the Moon",
        status: "established",
        steam: "https://store.steampowered.com/app/206440/To_the_Moon/",
        wikidata: "https://www.wikidata.org/wiki/Q1711379",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the short, gut-punch narrative: in one sitting it walks you through a life of regret and what someone truly wanted, and the ache stays long after it ends. This gem distills that into one thing, a boy facing his real feelings through conversation with a girl who refuses every easy answer.",
        desc_ja: "短い尺で心を抉る一本道ナラティブの原点。ひと続きで、後悔だらけの人生と、その人が本当に望んだものを辿らせ、終わった後も長く余韻が残る。この未発掘の名作はそれを一点に凝縮する——どんな簡単な答えも拒む少女との対話を通じて、少年が自分の本当の気持ちと向き合う。",
      },
    ],
    en: {
      title: "One-Armed Crayfish - a buried 100-percent-positive emotional visual novel, walled off by language",
      description: "A short Japanese visual novel where a boy who only goes with the flow meets a girl who does the opposite of everything, and is forced to face what he actually wants. 100 percent positive across 166 reviews in Japan, but no English support, so the West has barely found it.",
      h1a: "Go against the flow, ",
      h1flip: "and face yourself",
      h1b: ".",
      lede: "A boy who has only ever gone with the crowd meets a girl who does the opposite of everything. In one or two hours she pulls his real feelings into the open. 100 percent positive in Japan across 166 reviews, but it has no English yet, so only 5 English reviews exist.",
      s1: "First, the one feeling",
      feeling: [
        "You have always picked the safe, agreeable answer, the one everyone else picks, and called it living.",
        "Then someone who refuses every easy answer keeps asking you what you actually want, and you have no reply ready.",
        "When the last line lands and you realize the question was never about her, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love a short, story-driven game that hits like a film in one or two hours, no padding",
        "You want a quiet, character-driven piece that asks how you actually want to live",
        "You do not mind that it has no English yet: the gem is the writing, and language is the only wall",
      ],
      bad: [
        "You need a fully English-first, voiced release right now (no English yet, the wall is language only)",
        "You want branching choices or gameplay systems, not a single authored narrative",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "片腕のザリガニ - 100%好評なのに言語の壁で埋もれた感情ノベル",
      description: "順張りしかしてこなかった少年が、何にでも逆張りする少女と出会い、自分が本当は何を望むのかと向き合わされる短編ノベル。日本では166レビュー100%好評なのに英語非対応で、西はまだほぼ見つけていない。",
      h1a: "逆張りして、",
      h1flip: "自分と向き合う",
      h1b: "。",
      lede: "周りに合わせてばかり生きてきた少年が、何にでも逆張りする少女と出会う。1〜2時間で、彼の本当の気持ちが引きずり出される。日本では166レビュー100%好評なのに、まだ英語が無く、英語レビューはわずか5件。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ずっと、無難でみんなと同じ答えを選んできた。それを生きることだと思っていた。",
        "でも、どんな簡単な答えも拒む相手に、お前は本当はどうしたいのかと問われ続け、用意した返事が何もない。",
        "最後の一行が落ちて、この問いは最初から彼女の話ではなかったと気づいた瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "1〜2時間で映画みたいに刺さる、水増しのない物語体験が好きな人",
        "どう生きたいかを静かに問う、キャラクター主導の一本が欲しい人",
        "まだ公式英語が無くても気にしない人——原石は文章で、言語だけが唯一の壁だから",
      ],
      bad: [
        "今すぐ英語ファースト・フルボイスの完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "分岐やゲームシステムが欲しい人(本作は分岐なしの一本道ナラティブ)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "shooters-ready": {
    published: "2026-06-09",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "roguelike", lineage: "slay-the-spire", obscurity: "wall", reviewBand: "hundreds", reachState: "lang_walled", rarity: { reviews: 741, positivePct: 99, noEnglish: true } },
    games: [
      {
        name_en: "Shooters, Ready!",
        name_ja: "Shooters, Ready!",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3247500/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese solo-dev FPS roguelite where you clear rooms against the clock, then spend leftover time buying cards to rebuild your weapon mid-run. Overwhelmingly Positive in Japan at 741 reviews and 99 percent, but its UI has no English, so the West has barely found it.",
        desc_ja: "制限時間内に部屋を撃ち抜き、残った時間でカードを買って武器を組み替える、日本の個人開発のFPSローグライト。741レビュー99%で圧倒的に好評なのにUIが英語非対応で、西はまだほぼ見つけていない。",
      },
      {
        name_en: "Slay the Spire",
        name_ja: "Slay the Spire",
        status: "established",
        steam: "https://store.steampowered.com/app/646570/Slay_the_Spire/",
        wikidata: "https://www.wikidata.org/wiki/Q49652113",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of building your run with cards, reading what you have and choosing what to play. This gem keeps that build-a-run craft but makes you execute it in real time, buying cards between rooms to rebuild your weapon on the fly.",
        desc_ja: "ラン毎にカードでビルドを組み、手札を読んで何を切るかを選ぶ味の原点。この未発掘の名作はその構築を保ちつつ、リアルタイムで実行させる——部屋の合間にカードを買い、武器をその場で組み替える。",
      },
    ],
    en: {
      title: "Shooters, Ready! - a buried time-attack FPS where you build your run between shots, walled off by language",
      description: "A Japanese solo-dev FPS roguelite where you clear rooms against the clock, then spend leftover time buying cards to rebuild your weapon. Overwhelmingly Positive in Japan at 741 reviews and 99 percent, but its UI has no English, so the West has barely found it.",
      h1a: "Clear the room, ",
      h1flip: "then rebuild your run",
      h1b: ".",
      lede: "Not just aim and shoot. You race the clock through rooms, and the time you save becomes currency to buy cards and rebuild your weapon mid-run. Loved in Japan at 99 percent, but the UI has no English, so the West cannot read it yet.",
      s1: "First, the one feeling",
      feeling: [
        "Every room is a sprint: speed, precision, and chained eliminations all feed your score.",
        "But the run is not fixed. The seconds you bank turn into cards, and you read your build and rebuild your weapon on the fly.",
        "When a build you assembled between rooms shreds a harder stage, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love deckbuilding roguelites like Slay the Spire but want to execute the build in real time",
        "You like score-attack FPS where speed and accuracy compound",
        "You want a Japanese solo-dev gem the West has barely read, walled off by a Japanese-only UI",
      ],
      bad: [
        "You need an English UI right now (it is Japanese-only, the wall is language)",
        "You want slow turn-based building, not a real-time time-attack shooter",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Shooters, Ready! - 撃ちながらランを組む、言語の壁で埋もれたタイムアタックFPS",
      description: "制限時間内に部屋を撃ち抜き、残った時間でカードを買って武器を組み替える、日本の個人開発のFPSローグライト。741レビュー99%で圧倒的に好評なのにUIが英語非対応で、西はまだほぼ見つけていない。",
      h1a: "部屋を撃ち抜いて、",
      h1flip: "ランを組み替える",
      h1b: "。",
      lede: "ただ狙って撃つだけじゃない。制限時間と競って部屋を駆け抜け、節約した秒がカードを買う通貨になり、ランの途中で武器を組み替える。日本では99%好評なのにUIが英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "どの部屋も全力疾走。速度・精度・連続撃破が全部スコアに乗る。",
        "でもランは固定じゃない。貯めた秒がカードになり、ビルドを読んで武器をその場で組み替える。",
        "部屋の合間に組んだビルドが格上ステージを薙ぎ倒した瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Slay the Spire のような構築ローグライトが好きで、組んだビルドをリアルタイムで実行したい人",
        "速度と精度が積み重なるスコアアタックFPSが好きな人",
        "日本語UIの壁で埋もれた、西がまだほぼ読めていない日本の個人開発の原石を掘りたい人",
      ],
      bad: [
        "今すぐ英語UIが欲しい人(日本語のみ・壁は言語)",
        "ゆっくりターン制で組みたい人(本作はリアルタイムのタイムアタックFPS)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "kugayama-death-diary": {
    published: "2026-06-09",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "adventure", lineage: "to-the-moon", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 586, positivePct: 95, noEnglish: false } },
    games: [
      {
        name_en: "Kugayama Shiori's Death Diary",
        name_ja: "久我山栞の死様手帖",
        status: "hidden",
        steam: "https://store.steampowered.com/app/4141950/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese visual novel where a ghost who keeps dying traces her own cause of death and the regrets that bind her, through a horror-tinged occult comedy of branching choices. Overwhelmingly Positive in Japan at 586 reviews and 95 percent, but only 35 English reviews, so the West has barely found it.",
        desc_ja: "死を繰り返す幽霊が、自分の死因とこの世に縛る未練を辿る、選択型のホラー×オカルトコメディの日本のVN。586レビュー95%で圧倒的に好評なのに英語レビューは35件で、西はまだほぼ見つけていない。",
      },
      {
        name_en: "To the Moon",
        name_ja: "To the Moon",
        status: "established",
        steam: "https://store.steampowered.com/app/206440/To_the_Moon/",
        wikidata: "https://www.wikidata.org/wiki/Q1711379",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of tracing a life and its regrets until it lands emotionally: you follow what someone truly wanted, piece by piece, and the ache stays long after. This gem turns that inward, a ghost tracing the regrets behind her own death.",
        desc_ja: "人生と未練を辿って最後に感情で着地する味の原点。その人が本当に望んだものを一片ずつ辿り、終わった後も長く余韻が残る。この未発掘の名作はそれを内側へ向ける——幽霊が、自分の死の裏にある未練を辿る。",
      },
    ],
    en: {
      title: "Kugayama Shiori's Death Diary - a buried ghost-mystery VN about tracing your own death, almost unread in the West",
      description: "A Japanese VN where a ghost who keeps dying traces her own cause of death and the regrets that bind her. Overwhelmingly Positive in Japan at 586 reviews and 95 percent, but only 35 English reviews, so the West has barely found it.",
      h1a: "Trace your own ",
      h1flip: "cause of death",
      h1b: ".",
      lede: "Not solve a stranger's case. Trace your own death. A ghost who dies over and over follows the regrets that keep her here. Loved in Japan at 95 percent, but with only 35 English reviews, the West has barely read it.",
      s1: "First, the one feeling",
      feeling: [
        "She dies, casually, again and again, and the only thread she has is the regret that will not let her go.",
        "So you follow the choices, and each one pulls a forgotten piece of how she died into the light.",
        "When the last regret resolves and her death finally makes sense, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You loved the To the Moon way of tracing a life and its regrets until it lands emotionally",
        "You like horror wrapped in dark, occult comedy with multiple endings",
        "You want a Japanese VN gem the West has barely read, with only 35 English reviews",
      ],
      bad: [
        "You want a logic-deduction puzzle (this is a choice-driven story, not an inference system)",
        "You want fast action, not a 10-hour reading-led mystery at your own pace",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "久我山栞の死様手帖 - 自分の死因を辿る、西がまだほぼ読めていない埋もれた幽霊ミステリーVN",
      description: "死を繰り返す幽霊が、自分の死因と未練を辿る日本のVN。586レビュー95%で圧倒的に好評なのに英語レビューは35件で、西はまだほぼ見つけていない。",
      h1a: "自分の",
      h1flip: "死因を辿る",
      h1b: "。",
      lede: "他人の事件を解くんじゃない。自分の死を辿るんだ。何度も死ぬ幽霊が、この世に縛る未練を追っていく。日本では95%好評なのに英語レビュー35件で、西はまだほぼ読めていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "彼女は何度も、あっけなく死ぬ。手がかりは、彼女を手放さない未練ひとつだけ。",
        "だから選択を辿る。一つ選ぶたび、忘れた死の断片が光の中に引き出される。",
        "最後の未練がほどけ、彼女の死がようやく腑に落ちた瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "To the Moon の、人生と未練を辿って最後に感情で着地する味が好きな人",
        "マルチエンドのダークなオカルトコメディに包まれたホラーが好きな人",
        "英語レビュー35件で西がまだほぼ読めていない、日本のVN原石を掘りたい人",
      ],
      bad: [
        "論理推理パズルが欲しい人(本作は選択型の物語で推論システムではない)",
        "速いアクションが欲しい人(10時間級の読み主体のミステリー)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "kusodeka-bayashi": {
    published: "2026-06-09",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "action", lineage: "metal-hellsinger", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 147, positivePct: 99, noEnglish: false } },
    games: [
      {
        name_en: "This Curse Is Metal as Hell! | Kusodeka Bayashi",
        name_ja: "クソデカ囃子",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2909230/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese solo-dev first-person horror where you fight curses with the heavy metal on your dad's MP3 player. Very Positive in Japan at 147 reviews, but only 2 English reviews, so the West has not found it.",
        desc_ja: "親父のMP3プレイヤーに入ったヘヴィメタルで呪いに立ち向かう、日本の個人開発の一人称ホラー。147レビューで非常に好評なのに英語レビューは2件で、西はまだ見つけていない。",
      },
      {
        name_en: "Metal: Hellsinger",
        name_ja: "Metal: Hellsinger",
        status: "established",
        steam: "https://store.steampowered.com/app/1061910/Metal_Hellsinger/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of music as a weapon: a rhythm FPS where you gun down demons in time with heavy metal, and the harder you stay on the beat, the harder you hit. This gem flips that thrill into a Japanese horror comedy of curses and yokai.",
        desc_ja: "音楽を武器にする味の原点。ヘヴィメタルのビートに合わせて悪魔を撃ち抜くリズムFPSで、拍に乗るほど火力が上がる。この未発掘の名作はその快感を、和怪異と呪いのホラーコメディへ反転させる。",
      },
    ],
    en: {
      title: "Kusodeka Bayashi - the buried horror-comedy where you blast the dread away with heavy metal",
      description: "A Japanese solo-dev first-person horror where you fight curses with the heavy metal on your dad's MP3 player. Very Positive in Japan at 147 reviews, but only 2 English reviews, so the West has not found it.",
      h1a: "Don't run from the dread. ",
      h1flip: "Blast it with metal",
      h1b: ".",
      lede: "Not survive the haunting. Drown it in heavy metal. A child at a cursed countryside home weaponizes the songs on a dad's MP3 player. Loved in Japan, but with only 2 English reviews, the West has not found it.",
      s1: "First, the one feeling",
      feeling: [
        "The dread closes in and most horror would make you hide.",
        "But you do not hide. You hit play, and the heavy metal turns the haunting into the thing that should be afraid.",
        "When the climax breaks into a full rhythm set and you play the whole song, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love horror but are tired of running and hiding, and want to fight back",
        "You love the Metal: Hellsinger thrill of music as a weapon",
        "You want a tight 1-2 hour Japanese solo-dev gem the West has not noticed",
      ],
      bad: [
        "You want slow, helpless survival horror (this flips dread into power)",
        "You want a long, content-heavy release (it is a focused 1-2 hour single ending)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "クソデカ囃子 - 恐怖を爆音メタルでブッ飛ばす、埋もれたホラーコメディ",
      description: "親父のMP3プレイヤーに入ったヘヴィメタルで呪いに立ち向かう、日本の個人開発の一人称ホラー。147レビューで非常に好評なのに英語レビューは2件で、西はまだ見つけていない。",
      h1a: "恐怖から逃げない。",
      h1flip: "メタルでブッ飛ばす",
      h1b: "。",
      lede: "怪異を生き延びるんじゃない。爆音メタルで黙らせるんだ。呪われた田舎の家で、親父のMP3に入った曲を武器に変える。日本で愛され、英語レビュー2件で西はまだ見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "恐怖が迫り、普通のホラーなら身を隠す。",
        "でも隠れない。再生ボタンを押すと、ヘヴィメタルが怪異の方を怯えさせる。",
        "クライマックスで曲を丸ごと演奏するリズムパートになった瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "ホラーは好きだが逃げて隠れるのに飽きて、殴り返したい人",
        "Metal: Hellsinger の、音楽が武器になる快感が好きな人",
        "西がまだ気づいてない、1-2時間で凝縮した日本の個人開発の原石を掘りたい人",
      ],
      bad: [
        "じわじわ無力に怯える生存ホラーが欲しい人(本作は恐怖を力に反転させる)",
        "長く物量のある一本が欲しい人(1-2時間・エンディング1つの凝縮体験)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "irudo": {
    published: "2026-06-10",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "simulation", lineage: "uncharted-waters-2", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 160, positivePct: 88, noEnglish: true } },
    games: [
      {
        name_en: "Irudo",
        name_ja: "イル・ドー",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3561770/Irudo/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A solo-doujin maritime trading sim from Japan. You trade to earn, gather crew, strengthen your fleet, and take the seas. Very Positive in Japan at 160 reviews and 88 percent, but it has no English support, so only 1 English review exists.",
        desc_ja: "日本の個人同人による海洋交易シミュレーション。交易で稼ぎ、仲間を集めて艦隊を強化し、海域を制覇する。160レビュー88%で非常に好評なのに英語非対応で、英語レビューはわずか1件。",
      },
      {
        name_en: "Uncharted Waters II",
        name_ja: "大航海時代II",
        status: "established",
        steam: "https://store.steampowered.com/app/628170/",
        wikidata: "https://www.wikidata.org/wiki/Q845526",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the maritime-trade taste: Koei's Uncharted Waters built three pillars, trade, exploration, and naval combat, into one loop of earning at sea and expanding. This gem distills that loop back down to a single solo-doujin scale.",
        desc_ja: "海洋交易の味の原点。コーエーの大航海時代が、交易・探索・海戦の三本柱を「海で稼いで広げる」一つのループに組み上げた。この未発掘の名作はそのループを、個人同人のスケールへ純粋に凝縮し直す。",
      },
    ],
    en: {
      title: "Irudo - a buried maritime-trade sim where you build a fleet and conquer the seas, walled off by language",
      description: "A solo-doujin maritime trading sim from Japan. Trade to earn, gather crew, strengthen your fleet, and take the seas. Very Positive at 160 reviews and 88 percent, but it has no English support, so only 1 English review exists.",
      h1a: "Trade, build a fleet, ",
      h1flip: "take the seas",
      h1b: ".",
      lede: "Earn through trade, gather companions, strengthen your fleet, and conquer the seas, fortress by fortress. Loved in Japan at 88 percent, but it has no English yet, so the West has not boarded. Just 1 English review exists.",
      s1: "First, the one feeling",
      feeling: [
        "You buy low in one port and the whole map tilts: you read where the next price gap is before anyone else.",
        "Then a fortress blocks the lane, so you decide whether to invest, recruit, or fight your way through.",
        "When a single trade run pays for the fleet that takes the sea, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Uncharted Waters loop of trade, explore, and naval combat, and want it at a focused doujin scale",
        "You want to read price gaps and routes, then grow a fleet from a single good trade run",
        "You do not mind no English yet: the gem is the loop, and language is the only wall (just 1 English review exists)",
      ],
      bad: [
        "You need a polished, English-first release right now (no English yet, and it is still in Early Access)",
        "You want fast action, not slow trade-route reading and fleet management",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "イル・ドー - 艦隊を組んで海域を制覇する、言語の壁で埋もれた海洋交易シミュレーション",
      description: "日本の個人同人による海洋交易シミュレーション。交易で稼ぎ、仲間を集めて艦隊を強化し、海域を制覇する。160レビュー88%で非常に好評なのに英語非対応で、英語レビューはわずか1件。",
      h1a: "交易し、艦隊を組み、",
      h1flip: "海域を獲る",
      h1b: "。",
      lede: "交易で資金を稼ぎ、仲間を集め、艦隊を強化し、敵の拠点を一つずつ落として海域を制覇する。日本では88%で愛されながら英語はまだ無く、西は乗り込めていない。英語レビューはたった1件。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ある港で安く仕入れた瞬間、地図全体が傾く。次にどこで価格差が開くかを誰より先に読む。",
        "航路を拠点が塞ぐ。投資するか、仲間を増やすか、押し通るかを決める。",
        "たった一度の交易が、海域を獲る艦隊の元手になった瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "大航海時代の、交易・探索・海戦のループが好きで、それを凝縮した同人スケールで味わいたい人",
        "価格差と航路を読み、一度の良い交易から艦隊を育てる手応えが欲しい人",
        "まだ英語が無くても気にしない人——原石はループで、言語だけが唯一の壁(英語レビューは1件のみ)",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・かつ早期アクセス中)",
        "ゆっくり航路を読む交易や艦隊運用より、速いアクションが欲しい人",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "dungeon-seisoku": {
    published: "2026-06-10",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "simulation", lineage: "dungeon-keeper", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 101, positivePct: 89, noEnglish: true } },
    games: [
      {
        name_en: "Dungeon ni Seisoku da!",
        name_ja: "ダンジョンに生息だ！",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3894980/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese doujin 2D dungeon-management sim where you do not place traps: as a nature god you reshape terrain, spawn creatures, and grow an ecosystem of predation and breeding that swallows the adventurers coming for your crystal. Very Positive in Japan at 101 reviews and 89 percent, but it has no English support, so the West cannot read it yet (zero English reviews).",
        desc_ja: "罠を置くのではなく、自然神として地形を組み替え、生物を生み、捕食と繁殖の生態系を育てて、クリスタルを狙う冒険者を呑み込む日本の同人2Dダンジョン経営シミュレーション。101レビュー89%で非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは0件)。",
      },
      {
        name_en: "Dungeon Keeper Gold",
        name_ja: "ダンジョンキーパー",
        status: "established",
        steam: "https://store.steampowered.com/app/1996630/Dungeon_Keeper_Gold/",
        wikidata: "https://www.wikidata.org/wiki/Q1265742",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of standing on the dungeon's side: the 1997 Bullfrog classic where you dig out a lair, place traps and monsters, and repel the heroes who invade (the Gold edition returned to Steam in 2024). This gem replaces that placement with an ecosystem of predation and breeding that runs on its own.",
        desc_ja: "ダンジョン側に立って侵入する勇者を迎え撃つ味の創始原点。1997年のBullfrogの古典で、罠とモンスターを配置して守る(Gold版が2024年にSteamへ再リリース)。この未発掘の名作はその配置を、捕食と繁殖で勝手に回る生態系の設計に置き換える。",
      },
    ],
    en: {
      title: "Dungeon ni Seisoku da! - a buried dungeon-management gem where the ecosystem fights for you, walled off by language",
      description: "A Japanese doujin dungeon-management sim where you grow a food chain instead of placing traps. Very Positive in Japan at 101 reviews and 89 percent, but it has no English support and zero English reviews.",
      h1a: "Don't set traps. ",
      h1flip: "Grow a food chain",
      h1b: ".",
      lede: "Not defend a dungeon. Raise one. As a nature god you reshape terrain, spawn creatures, and let predation and breeding swallow the adventurers coming for your crystal. Loved in Japan at 89 percent, but it is Japanese-only, with zero English reviews.",
      s1: "First, the one feeling",
      feeling: [
        "Adventurers march in, but you do not line up troops. You reshape the terrain, spawn creatures, and design a chain of eating, being eaten, and breeding.",
        "Once you let go, the ecosystem runs on its own: predation, breeding, mutation. Misread the balance and the whole chain collapses.",
        "When the food chain you raised swallows a party of adventurers whole, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Dungeon Keeper taste of standing on the dungeon's side against the raiders",
        "You like designing a system, then watching it run and balance itself",
        "You want a Japanese doujin gem with zero English reviews the West has not found at all",
      ],
      bad: [
        "You need English support right now (it is Japanese-only, the wall is language)",
        "You want to control units directly (this is indirect control: you shape terrain and the ecosystem)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ダンジョンに生息だ！ - 生態系で冒険者を呑み込む、言語の壁で埋もれたダンジョン経営",
      description: "罠でなく生態系を組む日本の同人2Dダンジョン経営。101レビュー89%で非常に好評なのに英語非対応で、英語レビューは0件。西はまだ誰も見つけていない。",
      h1a: "罠は置かない。",
      h1flip: "生態系を組む",
      h1b: "。",
      lede: "ダンジョンを守るんじゃない。育てるんだ。自然神として地形を組み替え、生物を生み、捕食と繁殖の連鎖でクリスタルを狙う冒険者を呑み込む。日本では89%で好評なのに日本語のみ対応で、英語レビューは0件。",
      s1: "まず、その一点の感覚",
      feeling: [
        "冒険者が攻めてくる。でも兵は並べない。地形を組み替え、生物を生み、食う・食われる・増えるの連鎖を設計する。",
        "組んだ生態系は手を離れて勝手に回る。捕食と繁殖、そして突然変異——読み違えれば連鎖ごと崩れる。",
        "自分が育てた食物連鎖が、押し寄せる冒険者を呑み込んだ瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Dungeon Keeper の、ダンジョン側に立って侵入者を迎え撃つ味が好きな人",
        "組んだ後は系が勝手に回る、生態系の読みと設計が好きな人",
        "英語レビュー0件で西がまだ誰も見つけていない、日本の同人原石を掘りたい人",
      ],
      bad: [
        "今すぐ英語対応が欲しい人(日本語のみ・壁は言語だけ)",
        "ユニットを直接操作して戦いたい人(本作は地形と生態系を整える間接制御)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "happy-neet": {
    published: "2026-06-11",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "simulation", lineage: "princess-maker-2", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 201, positivePct: 90, noEnglish: false } },
    games: [
      {
        name_en: "Raising a Happy NEET",
        name_ja: "幸せなニートの育て方",
        status: "hidden",
        steam: "https://store.steampowered.com/app/4321500/Raising_a_Happy_NEET/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese doujin cohabitation sim where you take in a shy, shut-in distant relative and teach her how to live: the books and meals you choose become life knowledge, and it comes back as chores done and growth. Very Positive in Japan at 201 reviews and 90 percent, but only 29 English reviews, so the West has barely found it.",
        desc_ja: "人見知りで引きこもりの遠縁の少女を家に迎え、生活の知識を一つずつ教えて一緒に暮らす日本の同人育成シム。選んだ本と食事が生活の知識になり、家事や成長になって返ってくる。201件90%で非常に好評なのに英語レビューは29件で、西はまだほぼ見つけていない。",
      },
      {
        name_en: "Princess Maker 2 Refine",
        name_ja: "プリンセスメーカー2",
        status: "established",
        steam: "https://store.steampowered.com/app/523000/Princess_Maker_2_Refine/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the raising sim: Gainax, 1993. You schedule eight years of education and work, raising a daughter to be a princess, a queen, someone proper (the Refine edition is the one on Steam). This gem flips that objective: not raise her proper, but raise her happy, teaching life one piece at a time until she finds her own dream.",
        desc_ja: "育成シミュレーションの原点。ガイナックス・1993年。8年間の教育と仕事の予定を組み、娘を王女へ、女王へ、立派な誰かへ育て上げる(Steam 版は Refine 版)。この未発掘の名作はその目的関数を反転させる——立派にでなく、幸せに。矯正せず、生活の知識を一つずつ教えて、本人の夢を見つけさせる。",
      },
    ],
    en: {
      title: "Raising a Happy NEET - a buried Japanese life sim that raises her happy, not proper, almost unread in the West",
      description: "A Japanese doujin cohabitation sim where you take in a shut-in relative and teach her how to live, one day at a time. Very Positive in Japan at 201 reviews and 90 percent, but only 29 English reviews, so the West has barely found it.",
      h1a: "Don't raise her proper, ",
      h1flip: "raise her happy",
      h1b: ".",
      lede: "Not a prodigy you mold into a queen. A shut-in you help live. You take in a distant relative, teach her life one piece at a time, and stay beside her until she finds her own dream. Very Positive at 201 reviews and 90 percent, but with only 29 English reviews the West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "She barely speaks. A shy, withdrawn NEET moves in, and at first even small talk falls flat.",
        "So you work, shop, and teach: each book and meal you choose becomes life knowledge, and it comes back as chores done and words she could not say before.",
        "When the girl who could not face the world finds her own dream, and you realize you never had to fix her, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Princess Maker loop of daily choices slowly shaping a person",
        "You want care, not correction: a warm, redemptive raising sim instead of a report card",
        "You want a Japanese doujin gem the West has barely read, with only 29 English reviews",
      ],
      bad: [
        "You want brutal fail states and min-max pressure (this is a warm, redemptive cohabitation story)",
        "You want big-budget polish and a marketing machine (this is a small doujin circle's work)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "幸せなニートの育て方 - 立派にでなく幸せに育てる、西がまだ見つけていない同居育成シム",
      description: "引きこもりの遠縁の少女を家に迎え、生活の知識を一つずつ教えて一緒に暮らす日本の同人育成シム。201件90%で非常に好評なのに英語レビューは29件で、西はまだほぼ見つけていない。",
      h1a: "立派に育てない。",
      h1flip: "幸せに育てる",
      h1b: "。",
      lede: "女王に育て上げる英才教育じゃない。生き方を見失った子との同居だ。遠縁のニートの少女を家に迎え、生活の知識を一つずつ教え、本人の夢が見つかるまで寄り添う。201件90%で非常に好評なのに英語レビューは29件。西はまだほぼ見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "彼女はほとんど話さない。人見知りで引っ込み思案なニートとの同居は、雑談すら空振りから始まる。",
        "だから働いて、買って、教える。選んだ本と食事が生活の知識になり、教えたことが家事や、言えなかった一言になって返ってくる。",
        "世界と向き合えなかった子が自分の夢を見つけ、直す必要なんて最初からなかったと気づいた瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "プリンセスメーカーの、毎日の選択で人がゆっくり形になる手応えが好きな人",
        "矯正でなくケアの育成——採点されない、温かく救いのある物語が欲しい人",
        "英語レビュー29件で西がまだほぼ読めていない、日本の同人原石を掘りたい人",
      ],
      bad: [
        "ヒリつく失敗や効率詰めのプレッシャーが欲しい人(本作は温かく救いのある同居生活)",
        "大作級の磨き込みと宣伝が欲しい人(小さな同人サークルの一本)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "aden": {
    published: "2026-06-11",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "action", lineage: "metal-hellsinger", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 685, positivePct: 97, noEnglish: false } },
    games: [
      {
        name_en: "ADEN",
        name_ja: "亜電",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2152740/ADEN/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese solo-dev belt-scroll action where fights end in a dance: you collide, dodge and launch enemies, and each boss is settled in a rhythm battle synced to the music. Overwhelmingly Positive in Japan at 685 reviews and 97 percent, fully voiced in English, yet only 96 English reviews, so the West has passed it by.",
        desc_ja: "体当たりでぶつかり、避け、打ち上げ、ボスとの決着はBGM同期のリズムバトルで踊り切る、日本の個人開発ベルトスクロールアクション。685レビュー97%で圧倒的に好評、英語フルボイス対応なのに英語レビューは96件で、西は素通りしている。",
      },
      {
        name_en: "Metal: Hellsinger",
        name_ja: "Metal: Hellsinger",
        status: "established",
        steam: "https://store.steampowered.com/app/1061910/Metal_Hellsinger/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of music as a weapon: a rhythm FPS where you gun down demons in time with heavy metal, and the harder you stay on the beat, the harder you hit. This gem carries that thrill into a beltscroll brawler, turning the finish of every fight into a dance on the music.",
        desc_ja: "音楽を武器にする味の原点。ヘヴィメタルのビートに合わせて悪魔を撃ち抜くリズムFPSで、拍に乗るほど火力が上がる。この未発掘の名作はその快感をベルトスクロールへ移し、殴り合いの決着そのものを音楽に乗せたダンスにする。",
      },
    ],
    en: {
      title: "ADEN - a buried dance-battle beltscroller from a Japanese solo dev, Overwhelmingly Positive yet passed over by the West",
      description: "A Japanese solo-dev belt-scroll action where fights end in a dance: collide, dodge, launch, then finish the boss in a rhythm battle synced to the music. Overwhelmingly Positive at 685 reviews and 97 percent, yet only 96 English reviews.",
      h1a: "End the fight, ",
      h1flip: "with a dance",
      h1b: ".",
      lede: "Not just beat them down. You dance the finish. A body-slam beltscroller whose climaxes turn into rhythm battles synced to the music. Overwhelmingly Positive in Japan at 97 percent, fully voiced in English by one developer, and the West still walked past it.",
      s1: "First, the one feeling",
      feeling: [
        "You brawl with your body: collide, dodge, launch. No weapons, just momentum.",
        "Then the boss closes in, the music takes over, and the finishing dance begins.",
        "When you dance the whole song through and the boss falls on the final beat, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Metal: Hellsinger thrill of music as a weapon",
        "You want the collide-and-launch crunch of a beltscroller and the payoff of a rhythm game in one",
        "You want a six-years-solo Japanese gem at 97 percent that the West passed over",
      ],
      bad: [
        "You want hardcore difficulty (it leans toward the easy side)",
        "You want a long, content-heavy release (it is a compact piece you finish in a few hours)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "亜電 - 殴り合いの決着をダンスで踊り切る、圧倒的に好評なのに西が素通りした個人開発ベルトスクロール",
      description: "体当たりでぶつかり、避け、打ち上げ、ボスとの決着はBGM同期のリズムバトルで踊り切る。685レビュー97%で圧倒的に好評、英語フルボイス対応なのに英語レビューは96件で、西は素通りしている。",
      h1a: "殴り合いの果てに、",
      h1flip: "踊って決着",
      h1b: "。",
      lede: "ただ殴り倒すんじゃない。決着は踊り切るんだ。体当たりのベルトスクロールが、クライマックスで音楽と同期したリズムバトルに変わる。日本では97%で圧倒的に好評。個人で英語フルボイスまで積んだのに、西は素通りした。",
      s1: "まず、その一点の感覚",
      feeling: [
        "体当たりでぶつかり、避け、打ち上げる乱戦。武器ではなく身体で戦う。",
        "ボスとの間合いが詰まると音楽が主導権を握り、決着のダンスが始まる。",
        "曲を最後まで踊り切り、最後の拍で敵が崩れた瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Metal: Hellsinger の、音楽が武器になる快感が好きな人",
        "体当たりで打ち上げるベルトスクロールの手応えと、リズムゲームの快感を両方欲しい人",
        "個人開発6年で97%なのに西が素通りした、国産の原石を掘りたい人",
      ],
      bad: [
        "高難度の歯ごたえが欲しい人(難易度は比較的低め)",
        "長尺のボリュームが欲しい人(数時間で完結する凝縮型)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "for-the-ghosts": {
    published: "2026-06-12",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "doki-doki-literature-club", obscurity: "wall", reviewBand: "hundreds", reachState: "lang_walled", rarity: { reviews: 314, positivePct: 98, noEnglish: true } },
    games: [
      {
        name_en: "For the GHOSTs",
        name_ja: "For the GHOSTs",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2487390/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese doujin metafiction ADV where girls who do not exist talk to the real you: the game itself insists they have no will, only programmed text, yet you visit their rooms, share warm drinks, and piece together your own role from fragments of conversation. Very Positive in Japan at 314 reviews and 98 percent, but it has no English support, so the West cannot read it yet (only 3 English reviews).",
        desc_ja: "実在しない少女たちが現実のあなたと交流する日本の同人メタフィクションADV。彼女たちに意志はない、ただのプログラムされたテキストだとゲーム自身が言い切った上で、部屋を訪ね、温かい飲み物を分け合い、会話の断片から自分の役割を組み上げていく。314レビュー98%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは3件)。",
      },
      {
        name_en: "Doki Doki Literature Club!",
        name_ja: "Doki Doki Literature Club!",
        status: "established",
        steam: "https://store.steampowered.com/app/698780/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of fiction that knows it is fiction: characters realize they live in a game and speak directly to the real you. Overwhelmingly Positive at over 220,000 reviews. It used that meta-gaze for horror; this gem turns the same gaze into kindness.",
        desc_ja: "虚構が虚構だと自覚するメタフィクションの原点。キャラクターが自分はゲームの中にいると気づき、画面のこちら側のあなたへ直接語りかけてくる。22万件超のレビューで圧倒的に好評。原点はその視点を恐怖に使い、この未発掘の名作は同じ視点を優しさへ反転させる。",
      },
    ],
    en: {
      title: "For the GHOSTs - a buried metafiction ADV where you befriend girls who do not exist, walled off by language",
      description: "The game itself insists the characters have no will. What is real is only what you feel toward them. Very Positive in Japan at 314 reviews and 98 percent, but with no English support, the West cannot read it yet (only 3 English reviews).",
      h1a: "Befriend the girls ",
      h1flip: "who do not exist",
      h1b: ".",
      lede: "Not metafiction to scare you. Metafiction to be kind to you. You visit the rooms of fictional girls, trade words and warm drinks, and piece together your own role from fragments. Loved in Japan at 98 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "The game keeps telling you the truth: these girls have no will. They are programmed text, nothing more.",
        "Still you visit their rooms, talk about what they love, share a warm drink, and the fragments start to connect: what you are, and why you are here.",
        "Then it lands. Knowing it is all fiction, the feeling that moved on your side of the screen was real. Something in your chest quietly tightens.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Doki Doki Literature Club meta-gaze and want it written in kindness instead of horror",
        "You want to sit with the question of whether what you feel for a fictional character is real",
        "You want a Japanese doujin gem the West cannot read yet, buried under only 3 English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want flashy plot mechanics or routes to optimize (this is a quiet game of conversation and afterglow)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "For the GHOSTs - 実在しない少女たちと友達になる、言語の壁で埋もれたメタフィクションADV",
      description: "キャラクターに意志はない、とゲーム自身が言い切る。本物なのは、あなた側の感情だけ。314レビュー98%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは3件)。",
      h1a: "実在しない君と、",
      h1flip: "ともだちになる",
      h1b: "。",
      lede: "怖がらせるためのメタフィクションじゃない。優しくするためのメタフィクションだ。フィクションの少女たちの部屋を訪ね、言葉を交わし、会話の断片から自分の役割を組み上げていく。日本では98%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "彼女たちに意志はない。ただのプログラムされたテキストだと、ゲーム自身が繰り返し告げてくる。",
        "それでも部屋を訪ね、好きなものの話をして、温かい飲み物を分け合ううちに、断片が繋がりはじめる。自分が何者で、なぜここにいるのか。",
        "虚構だと知り尽くした上で、それでも動いたこちら側の感情だけは本物だった——そう気づいた瞬間、胸の奥が静かに締まる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "ドキドキ文芸部のメタ視点が好きで、その続きを恐怖ではなく優しさで読みたい人",
        "虚構のキャラクターへの感情は本物か、という問いに静かに付き合いたい人",
        "英語レビュー3件で西がまだ読めていない、日本の同人原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "派手な展開や攻略要素が欲しい人(本作は会話と余韻で進む静かな一本)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "dreamin-her": {
    published: "2026-06-12",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "clannad", obscurity: "wall", reviewBand: "hundreds", reachState: "lang_walled", rarity: { reviews: 234, positivePct: 98, noEnglish: true } },
    games: [
      {
        name_en: "Dreamin' Her",
        name_ja: "Dreamin' Her -僕は、彼女の夢を見る。-",
        status: "hidden",
        steam: "https://store.steampowered.com/app/1920540/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese doujin-brand romance-occult novel where a girlfriend identical to the childhood friend who turned you down appears in your dreams, and night by night the dream encroaches on reality. Very Positive in Japan at 234 reviews and 98 percent, but it has no English support, so the West cannot read it yet (only 5 English reviews).",
        desc_ja: "振られた幼なじみと瓜二つの「彼女」が夢に現れ、夜ごと夢が現実を侵しはじめる、日本の同人ブランドの恋愛オカルトノベル。234レビュー98%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは5件)。",
      },
      {
        name_en: "CLANNAD",
        name_ja: "CLANNAD",
        status: "established",
        steam: "https://store.steampowered.com/app/324160/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the all-ages Japanese crying game: a romance novel where small, quiet choices pile up until the emotion finally breaks through. Overwhelmingly Positive on Steam at over 10,000 reviews. This gem inherits that lineage and pours it, as one short story, into the point where dream and reality blur.",
        desc_ja: "全年齢の「泣きゲー」の原点。静かな選択の積み重ねが、やがて感情の決壊に至る恋愛ノベル。Steam では1万件超のレビューで圧倒的に好評。この未発掘の名作はその系譜を受け継ぎ、夢と現実の境界が滲む一点へ短編で注ぎ込む。",
      },
    ],
    en: {
      title: "Dreamin' Her - a buried Japanese romance-occult novel where the dream encroaches on reality, walled off by language",
      description: "A girlfriend identical to the childhood friend who turned you down appears in your dreams, and the dream starts encroaching on reality. Very Positive in Japan at 234 reviews and 98 percent, but with no English support, the West cannot read it yet (only 5 English reviews).",
      h1a: "The dream starts ",
      h1flip: "encroaching on reality",
      h1b: ".",
      lede: "Not a love story you watch. One you doubt. In your dreams a girlfriend appears, identical to the childhood friend who turned you down, and night by night the dream encroaches on the real. Loved in Japan at 98 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "By day you are a worn-out exam student. By night a girlfriend who should not exist waits in the dream, wearing the face of the childhood friend who rejected you.",
        "At first the dream is sweet refuge. Then it leaks: which side is real begins to blur, and every choice tilts you toward one of them.",
        "When you decide which world, and which her, to believe in, the ending lands and something in your chest quietly gives way.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love CLANNAD-style all-ages romance novels where the payoff is emotional, not racy",
        "You are weak to stories that blur dream and reality until you doubt the world itself",
        "You want a Japanese doujin-brand gem the West cannot read yet, buried under only 5 English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want mechanics or fast plot turns (this is a short, quiet novel sitting with a worn-down student's inner life)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Dreamin' Her -僕は、彼女の夢を見る。- 夢が現実を侵してくる、言語の壁で埋もれた恋愛オカルトノベル",
      description: "振られた幼なじみと瓜二つの「彼女」が夢に現れ、夢が現実を侵しはじめる。234レビュー98%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは5件)。",
      h1a: "夢が、現実を",
      h1flip: "侵してくる",
      h1b: "。",
      lede: "眺めるだけの恋愛じゃない。疑いながら読む恋愛だ。振られた幼なじみと瓜二つの「彼女」が夢の中に現れ、夜ごと夢が現実へ滲み出してくる。日本では98%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "昼は受験に疲弊した高校生。夜は夢の中で、振られたはずの幼なじみと同じ顔の「彼女」が待っている。",
        "最初は甘い逃げ場だった夢が、やがて滲み出す。どちらが現実か揺らぎはじめ、選択のたびにどちらかへ傾いていく。",
        "どちらの世界の、どちらの彼女を信じるかを決めた瞬間、結末が落ちてきて、胸の奥が静かに決壊する。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "CLANNAD のような全年齢の恋愛ノベルで、感情の決壊を読みたい人",
        "夢と現実の境界が崩れていく物語に弱い人",
        "英語レビュー5件で西がまだ読めていない、日本の同人ブランドの原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "ゲーム的な攻略や速い展開が欲しい人(本作は鬱屈した受験生の内面に寄り添う、短く静かな短編ノベル)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "putrika-1st-cut": {
    published: "2026-06-13",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "kamaitachi-no-yoru", obscurity: "wall", reviewBand: "hundreds", reachState: "lang_walled", rarity: { reviews: 550, positivePct: 95, noEnglish: true } },
    games: [
      {
        name_en: "Putrika 1st.cut: The Reason She Must Perish",
        name_ja: "プトリカ 1st.cut:The Reason She Must Perish",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2818450/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese doujin-circle dark-fantasy visual novel about a girl who had to die: you read a tragedy of pure love and cruelty through branching choices, where an insanity trial executes the innocent and the dream and reality bleed into each other. Overwhelmingly Positive in Japan at 550 reviews and 95 percent, but it has no English support, so the West cannot read it yet (only 6 English reviews).",
        desc_ja: "「死ななければならなかった」少女を描く、日本の同人サークルのダークファンタジー・ビジュアルノベル。選択分岐で純愛と惨劇の悲劇を読み進めるうち、無実が処刑される狂気の裁判が起き、夢と現実が混ざりはじめる。550レビュー95%で日本では圧倒的に好評なのに英語非対応で、西はまだ読めない(英語レビューは6件)。",
      },
      {
        name_en: "Kamaitachi no Yoru",
        name_ja: "かまいたちの夜",
        status: "established",
        steam: "https://store.steampowered.com/app/2612660/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the sound novel: text, branching choices, and sound that pull you into a story of fear and tragedy you cannot stop reading. This gem keeps that spine and bends it from suspense into the cruel beauty of a tragedy with no salvation.",
        desc_ja: "サウンドノベルの原点。文章と選択分岐と音で、止まれない恐怖と悲劇の物語へ引き込む。この未発掘の名作はその背骨を保ったまま、サスペンスから「救いのない悲劇の残酷美」へと味をずらす。",
      },
    ],
    en: {
      title: "Putrika 1st.cut - a buried dark-fantasy visual novel about a girl who had to die, walled off by language",
      description: "A Japanese doujin-circle tragedy you read through branching choices: pure love, cruelty, and an insanity trial. Overwhelmingly Positive in Japan at 550 reviews and 95 percent, but with no English support, the West cannot read it yet (only 6 English reviews).",
      h1a: "Read why ",
      h1flip: "she had to die",
      h1b: ".",
      lede: "Not a tragedy you watch. A tragedy you read your way into. Through branching choices you trace a girl's pure love and the cruelty around it, until an insanity trial and a creeping dream pull the floor out from under you. Loved in Japan at 95 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "The game keeps telling you she had to die. You do not know why yet, only that the ending is already fixed.",
        "So you read on through each choice, watching her pure love collide with a world that executes the innocent, and the dream and the waking start to bleed together.",
        "Then the reason lands. Knowing there was never any salvation, the cruelty reads as a kind of beauty, and a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love sound-novel storytelling like Kamaitachi no Yoru and want branching that reads toward tragedy instead of suspense",
        "You want a story with no easy salvation, told in cruel beauty rather than comfort",
        "You want a Japanese doujin gem the West cannot read yet, buried under only 6 English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want a hopeful or wholesome romance (this is a deliberately cruel, no-salvation tragedy with depictions of suicide and torture)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "プトリカ 1st.cut - 死ななければならなかった少女を描く、言語の壁で埋もれたダークファンタジーADV",
      description: "選択分岐で読む、日本の同人サークルの悲劇。純愛と惨劇、そして狂気の裁判。550レビュー95%で日本では圧倒的に好評なのに英語非対応で、西はまだ読めない(英語レビューは6件)。",
      h1a: "なぜ彼女が、",
      h1flip: "死ぬのかを読む",
      h1b: "。",
      lede: "眺める悲劇じゃない。自分で読み進める悲劇だ。選択分岐をたどって少女の純愛とそれを取り巻く惨さを追ううちに、無実が処刑される狂気の裁判と忍び寄る夢が、足元を崩していく。日本では95%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "彼女は死ななければならなかった——ゲームはそう繰り返す。理由はまだ分からない。ただ結末だけが、最初から決まっている。",
        "だから選択を重ねて読み進める。純愛が、無実を処刑する世界とぶつかり、夢と現実が混ざりはじめる。",
        "その理由が腑に落ちた瞬間、救いなど初めから無かったと知り、惨さがある種の美しさに反転する。ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "かまいたちの夜のようなサウンドノベルの語りが好きで、サスペンスではなく悲劇へ向かう分岐を読みたい人",
        "安易な救いのない、優しさではなく残酷美で描かれた物語が欲しい人",
        "英語レビュー6件で西がまだ読めていない、日本の同人原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "希望のある優しい恋愛が欲しい人(本作は意図的に残酷で救いのない悲劇・自殺や拷問の表現を含む)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "kyofu-yawa": {
    published: "2026-06-13",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "kamaitachi-no-yoru", obscurity: "wall", reviewBand: "hundreds", reachState: "lang_walled", rarity: { reviews: 140, positivePct: 95, noEnglish: true } },
    games: [
      {
        name_en: "Kyofu Yawa (Horror Night Tales)",
        name_ja: "恐怖夜話",
        status: "hidden",
        steam: "https://store.steampowered.com/app/4494970/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese solo-dev horror sound-novel, made by a former paranormal-exploration YouTuber, that openly pays homage to Kamaitachi no Yoru and School Ghost Stories. A teacher tells two ghost stories deep in the night, and your job is not to be scared but to spot the inconsistencies hidden in his telling, branching toward the true ending. Very Positive in Japan at 140 reviews and 95 percent, but it has no English support, so the West cannot read it yet (0 English reviews). Note: some background images and BGM use AI-edited assets, but the story text itself is hand-written.",
        desc_ja: "元・心霊探索系YouTuberの日本人個人開発者が、かまいたちの夜や学校であった怖い話へのリスペクトを掲げて作ったホラー・サウンドノベル。夜の闇の中で教師が二つの怪談を語り、あなたの役目は怖がることではなく、その語りに潜む「違和感」を見抜いて真エンドへ分岐させること。140レビュー95%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビュー0件)。注記：背景画像とBGMの一部にAI加工素材を使うが、物語テキストは手書き。",
      },
      {
        name_en: "Kamaitachi no Yoru",
        name_ja: "かまいたちの夜",
        status: "established",
        steam: "https://store.steampowered.com/app/2612660/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the sound novel: text, branching choices, and sound that pull you into a story of fear you cannot stop reading. This gem keeps that spine, but instead of only being scared you cross-examine the telling, catching the lie in the ghost story to branch toward the true ending.",
        desc_ja: "サウンドノベルの原点。文章と選択分岐と音で、止まれない恐怖の物語へ引き込む。この未発掘の名作はその背骨を保ちつつ、ただ怖がるのではなく語りを問い詰め、怪談に潜む嘘を見抜いて真エンドへ分岐させる味にずらす。",
      },
    ],
    en: {
      title: "Kyofu Yawa - a buried horror sound-novel where you catch the lie in the ghost story, walled off by language",
      description: "A former paranormal YouTuber's homage to Kamaitachi no Yoru. Two ghost stories told in the dead of night, and your job is to spot the inconsistencies. Very Positive in Japan at 140 reviews and 95 percent, but with no English support, the West cannot read it yet (0 English reviews).",
      h1a: "Catch the lie ",
      h1flip: "in the ghost story",
      h1b: ".",
      lede: "Not a ghost story you only listen to. One you cross-examine. A teacher tells two tales in the dead of night, and your job is not to flinch but to spot the inconsistencies hidden in his telling, branching toward the truth. Loved in Japan at 95 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "The teacher tells his ghost story in the dark, and at first you just listen, the dread building word by word.",
        "But you do not only listen. A detail snags, a small wrongness in his telling, and you realize the story itself is hiding something.",
        "Then you catch the lie. When the inconsistency resolves and the true ending opens by your own reading, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love sound-novel horror like Kamaitachi no Yoru and School Ghost Stories and want that 90s retro dread again",
        "You want horror you solve, catching the inconsistency, not just horror you sit through",
        "You want a Japanese solo-dev gem the West cannot read yet, buried at 0 English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want loud jump scares and gore (this is quiet, text-and-sound dread; also note some images and BGM use AI-edited assets)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "恐怖夜話 - 怪談の語りに潜む「嘘」を見抜く、言語の壁で埋もれたホラー・サウンドノベル",
      description: "元・心霊YouTuberが、かまいたちの夜へのリスペクトで作った一本。夜の闇で語られる二つの怪談に潜む「違和感」を見抜く。140レビュー95%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビュー0件)。",
      h1a: "怪談の語りに潜む",
      h1flip: "嘘を見抜く",
      h1b: "。",
      lede: "聞くだけの怪談じゃない。語りを問い詰める怪談だ。夜の闇の中で教師が二つの話を語り、あなたの役目は怖がることではなく、その語りに潜む「違和感」を見抜いて真実へ分岐させること。日本では95%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "暗がりで教師が怪談を語りはじめる。最初はただ聞いている。一語ごとに不安が積み上がっていく。",
        "でも、ただ聞くだけじゃない。細部が引っかかる。語りの中の小さな矛盾に気づき、この話そのものが何かを隠していると分かる。",
        "そして嘘を見抜く。違和感がほどけ、自分の読みで真エンドが開いた瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "かまいたちの夜や学校であった怖い話のようなサウンドノベルの恐怖が好きで、あの90年代レトロな怖さをもう一度味わいたい人",
        "ただ怖がるだけでなく、違和感を見抜いて解く恐怖が欲しい人",
        "英語レビュー0件で西がまだ読めていない、日本の個人開発の原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "派手なジャンプスケアやグロが欲しい人(本作は文章と音で静かに怖がらせる・また背景画像とBGMの一部にAI加工素材を使用)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "ika-sumi-potion": {
    published: "2026-06-14",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "shop-sim", lineage: "recettear", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 77, positivePct: 99, noEnglish: true } },
    games: [
      {
        name_en: "Ika Sumi Potion",
        name_ja: "イカスミポーション",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3091010/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese solo dev's potion-crafting shop ADV: brew potions from squid ink and the sea, sell them to 24-plus animal-eared and inhuman customers, and unlock a drawn-to-order vignette of each one actually using what they bought. Very Positive in Japan at 77 reviews and 99 percent, but with no English support, the West cannot read it yet (only 2 English reviews).",
        desc_ja: "日本の個人開発のポーション調合ショップADV。イカスミと海の素材からポーションを作り、24人超のケモミミ・人外の客に売り、その客が買ったポーションを実際に使う描き下ろしスチルのエピソードが開く。77レビュー99%で日本では非常に好評なのに英語非対応で、西はまだ遊べない(英語レビューは2件)。",
      },
      {
        name_en: "Recettear: An Item Shop's Tale",
        name_ja: "ルセッティア -アイテム屋さんのはじめ方-",
        status: "established",
        steam: "https://store.steampowered.com/app/70400/Recettear_An_Item_Shops_Tale/",
        wikidata: "https://www.wikidata.org/wiki/Q7303969",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the item-shop sim: a Japanese doujin game (the first ever on Steam) where you craft and stock items, then read each customer and sell to keep the money moving. This gem keeps that brew-sell-restock spine, but bends the taste from beating capitalism into the warmth of inhuman customers and a drawn vignette of each one using what they bought.",
        desc_ja: "アイテム屋経営SLGの原点。日本の同人ゲーム(Steam初の同人作)で、アイテムを仕入れて作り、客を読んで売り、金を回し続ける。この未発掘の名作はその「作って・売って・仕入れ直す」背骨を保ちつつ、味を「資本主義の攻略」から、人外の客との交流と彼らが買った品を使う描き下ろしエピソードの優しさへとずらす。",
      },
    ],
    en: {
      title: "Ika Sumi Potion - a buried potion-shop ADV where you brew, sell, and cannot stop, walled off by language",
      description: "A Japanese solo dev's potion-crafting shop ADV: brew potions from squid ink and the sea, sell them to 24-plus animal-eared and inhuman customers, and unlock a drawn-to-order vignette of each one actually using what they bought. Very Positive in Japan at 77 reviews and 99 percent, but with no English support, the West cannot read it yet (only 2 English reviews).",
      h1a: "Brew it, sell it, ",
      h1flip: "and you cannot stop",
      h1b: ".",
      lede: "Not a story you only read. A shop you cannot close. You brew shady potions from squid ink and kelp, carry them across nations, and sell them to 24-plus inhuman customers, each sale unlocking a drawn-to-order scene of them using what they bought. One player just wrote: an infinite loop is kind of scary, isn't it. Loved in Japan at 99 percent, but it has no English yet, so the West cannot play it.",
      s1: "First, the one feeling",
      feeling: [
        "You mix water, kelp, and squid ink into a potion of uncertain effect, and a strange animal-eared customer steps up to buy.",
        "When the sale lands well, a drawn-to-order vignette opens: that exact customer, actually using your potion, with their own small story. You want to see the next one.",
        "So you brew again, sell again, save up, buy new materials, and brew again, until you notice you have stopped wanting to put it down.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Recettear-style shop-sim loops where you craft, price, and sell, and the next sale always pulls you back in",
        "You want a warm collection-hook: 24-plus inhuman customers, each with a hand-drawn vignette of using what they bought",
        "You want a Japanese solo-dev gem the West cannot play yet, buried under only 2 English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want twitch action or deep combat (this is a gentle craft-and-sell loop built on character vignettes; note it had a Japanese launch news writeup but no English-market coverage)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "イカスミポーション - 作って売って、手が止まらなくなる、言語の壁で埋もれたポーション屋ADV",
      description: "日本の個人開発のポーション調合ショップADV。イカスミと海の素材からポーションを作り、24人超のケモミミ・人外の客に売り、その客が買ったポーションを実際に使う描き下ろしスチルのエピソードが開く。77レビュー99%で日本では非常に好評なのに英語非対応で、西はまだ遊べない(英語レビューは2件)。",
      h1a: "作って、売って、",
      h1flip: "手が止まらない",
      h1b: "。",
      lede: "読むだけの物語じゃない。閉められない店だ。イカスミや昆布から怪しいポーションを作り、各国へ運び、24人超の人外の客に売る。うまく売れるたびに、その客が買ったポーションを実際に使う描き下ろしのエピソードが開く。あるプレイヤーはこう書いた——「無限ループって怖くね…？」。日本では99%好評なのに英語非対応で、西はまだ遊べない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "水と昆布とイカスミを混ぜ、効果のあやしいポーションを作る。すると個性豊かなケモミミの客がそれを買いに来る。",
        "うまく売れると、描き下ろしのエピソードが開く——その客が、あなたのポーションを実際に使う小さな物語だ。次の一枚が見たくなる。",
        "だからまた作り、また売り、金を貯め、新しい素材を買い、また作る。気づけば、手を止めたくなくなっている。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "ルセッティアのような「作って・値をつけて・売る」店経営ループが好きで、次の一売りに毎回引き戻される感覚が欲しい人",
        "24人超の人外の客と、それぞれが買ったポーションを使う描き下ろしエピソードを集めたくなる、優しい収集の引きが欲しい人",
        "英語レビュー2件で西がまだ遊べていない、日本の個人開発の原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "派手なアクションや深い戦闘が欲しい人(本作はキャラのエピソードで進む穏やかな作って売るループ・また国内の発売告知記事はあるが英語圏向けの紹介は無い)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "smoky-white": {
    published: "2026-06-14",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "to-the-moon", obscurity: "wall", reviewBand: "hundreds", reachState: "lang_walled", rarity: { reviews: 98, positivePct: 96, noEnglish: true } },
    games: [
      {
        name_en: "SMOKY WHITE",
        name_ja: "SMOKY WHITE",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2330960/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese doujin short visual novel where you meet a mysterious-atmosphered senior on a snowy winter rooftop, and part. Choices in conversation branch the ending, in about ninety minutes. Very Positive in Japan at 98 reviews and 96 percent, but it has no English support, so the West cannot read it yet (only 3 English reviews).",
        desc_ja: "雪の降る冬の屋上で、不思議な雰囲気の先輩と出会って、別れる日本の同人短編ノベル。会話の選択で結末が分岐する、約90分。98レビュー96%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは3件)。",
      },
      {
        name_en: "To the Moon",
        name_ja: "To the Moon",
        status: "established",
        steam: "https://store.steampowered.com/app/206440/To_the_Moon/",
        wikidata: "https://www.wikidata.org/wiki/Q1711379",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the short, lyrical narrative: a brief story walks you through a meeting and a parting, the regret and the wanting, and the afterglow stays long after it ends. This gem keeps that short, quiet ache, distilling it into a single fleeting encounter on a snowy rooftop.",
        desc_ja: "短い尺で叙情を残すナラティブの味の原点。短い物語が、出会いと別れ、未練と願いを辿らせ、終わった後も長く余韻が残る。この未発掘の名作はその短く静かな痛みを保ちつつ、雪の屋上での一度きりの出会いへと凝縮する。",
      },
    ],
    en: {
      title: "SMOKY WHITE - a buried short visual novel about meeting and parting on a snowy rooftop, walled off by language",
      description: "A Japanese doujin short novel where you meet a mysterious-atmosphered senior on a snowy winter rooftop, and part. Choices in conversation branch the ending. Very Positive in Japan at 98 reviews and 96 percent, but with no English support, the West cannot read it yet (only 3 English reviews).",
      h1a: "Meet her, ",
      h1flip: "and part",
      h1b: ", on a snowy rooftop.",
      lede: "Not a romance that lasts. One that ends, and stays with you. On a snowy winter rooftop you meet a senior with a strange, quiet air, talk, and choose your way toward how it ends. Ninety minutes, then the afterglow. Loved in Japan at 96 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "Snow falls on the rooftop, and a senior with an air you cannot quite read is already there. You start talking, and the time feels borrowed, like it cannot last.",
        "Your choices in the conversation quietly steer where this goes, and you start to sense that meeting her already means parting with her.",
        "Then it ends, in about ninety minutes, and the parting lands. Long after the screen goes dark, the warmth and the cold of that rooftop stay in your chest.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love To the Moon-style short narratives that walk you through a meeting and a parting and leave a long afterglow",
        "You want a quiet, atmospheric romance about a single fleeting encounter, not a long route to grind",
        "You want a Japanese doujin gem the West cannot read yet, buried under only 3 English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want a long game with mechanics or many routes (this is a roughly 90-minute, choice-light short novel about one encounter)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "SMOKY WHITE - 雪の屋上で出会って、別れる、言語の壁で埋もれた短編ノベル",
      description: "雪の降る冬の屋上で、不思議な雰囲気の先輩と出会って、別れる日本の同人短編ノベル。会話の選択で結末が分岐する。98レビュー96%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは3件)。",
      h1a: "雪の屋上で出会って、",
      h1flip: "別れる",
      h1b: "。",
      lede: "続いていく恋じゃない。終わって、残る恋だ。雪の降る冬の屋上で、不思議な雰囲気の先輩と出会い、言葉を交わし、選択でその結末を選んでいく。約90分、そして余韻。日本では96%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "雪の積もる屋上に、どこか掴みきれない雰囲気の先輩が先にいる。話しはじめた時間は、続かない借り物のように感じられる。",
        "会話の選択が、静かにこの関係の行き先を傾けていく。彼女と出会ったことは、もう別れることと地続きだと気づきはじめる。",
        "そして約90分で終わる。別れが落ちてくる。画面が暗くなった後も、あの屋上の温度と寒さが、長く胸に残る。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "To the Moon のような、出会いと別れを辿らせて長い余韻を残す短編ナラティブが好きな人",
        "長い攻略ではなく、一度きりの出会いを静かに描く雰囲気重視の恋愛が欲しい人",
        "英語レビュー3件で西がまだ読めていない、日本の同人原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "攻略要素や多数ルートのある長編が欲しい人(本作は一度の出会いを描く約90分・選択は控えめな短編)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "harumachi-toroidal": {
    published: "2026-06-15",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "deckbuilder", lineage: "slay-the-spire", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 70, positivePct: 94, noEnglish: true } },
    games: [
      {
        name_en: "Harumachi Toroidal",
        name_ja: "春待ちトロイダル",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2348880/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese doujin-circle game where conversations are card battles: you loop the last ten days before graduation on a remote island, fail and reset to day one, and deepen ties with twelve classmates to uncover the island's mystery and a self-proclaimed demon's true aim. Very Positive in Japan at 70 reviews and 94 percent, but with no English support, the West cannot read it yet (0 English reviews).",
        desc_ja: "会話がカードバトルになる、日本の同人サークルのゲーム。離島で卒業までの10日間をループし、進めなければ1日目に戻る。12人のクラスメイトとの対話を組み立て、島の謎と「悪魔」を名乗る少女の真意を解き明かす。70レビュー94%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビュー0件)。",
      },
      {
        name_en: "Slay the Spire",
        name_ja: "Slay the Spire",
        status: "established",
        steam: "https://store.steampowered.com/app/646570/Slay_the_Spire/",
        wikidata: "https://www.wikidata.org/wiki/Q49652113",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of building a deck and adapting to a board that changes every turn, reading what you have and choosing what to play. This gem keeps that read-and-build craft but moves it from combat to conversation, building human relationships through dialogue and looping the days so you reread and rebuild your approach toward the truth.",
        desc_ja: "デッキを組み、毎ターン変わる盤面を読んで適応する味の原点。手札を読んで何を切るかを選ぶ。この未発掘の名作はその「読んで組む」を戦闘から会話へ移し、対話で人間関係を組み立て、日々をループさせて読み直し組み直しながら真実へ近づかせる。",
      },
    ],
    en: {
      title: "Harumachi Toroidal - a buried deckbuilding loop visual novel about ten days before graduation, walled off by language",
      description: "A Japanese doujin-circle game where conversations are card battles: you loop the last ten days before graduation on a remote island, fail and reset to day one, and deepen ties with twelve classmates to uncover the island's mystery and a self-proclaimed demon's true aim. Very Positive in Japan at 70 reviews and 94 percent, but with no English support, the West cannot read it yet (0 English reviews).",
      h1a: "Talk it, build it, ",
      h1flip: "loop it",
      h1b: ", until you reach graduation.",
      lede: "Not a visual novel you only read. A deck you rebuild every loop. On a remote island ten days from graduation, every conversation is a card battle, and failing to progress resets you to day one. You read each classmate, build your hand of dialogue, and loop again toward the island's truth. Loved in Japan at 94 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "Ten days before graduation on a remote island, a girl claiming to be a demon tells you to make it to the ceremony. But every talk is a card battle, and one wrong run sends you back to day one.",
        "So you read each of the twelve classmates, build the right hand of dialogue, and spend your loops learning what works, turning conversation into something you construct.",
        "Then a run finally clicks, the relationships hold, and the island's mystery and the demon's real aim open up. The loop you were trapped in becomes the thing you mastered, and a quiet rush hits.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Slay the Spire-style build-and-adapt loops, but want that read-and-build feeling applied to conversations and relationships instead of combat",
        "You want a time-loop story you actively solve by rebuilding your approach, not one you only watch unfold",
        "You want a Japanese doujin gem the West cannot read yet, buried at 0 English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want pure turn-based deckbuilding combat (this bends the deckbuilding into dialogue and a story loop, not battle for its own sake)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "春待ちトロイダル - 卒業まで10日をループする、言語の壁で埋もれたデッキ構築ノベル",
      description: "会話がカードバトルになる、日本の同人サークルのゲーム。離島で卒業までの10日間をループし、進めなければ1日目に戻る。12人のクラスメイトとの対話を組み立て、島の謎と「悪魔」を名乗る少女の真意を解き明かす。70レビュー94%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビュー0件)。",
      h1a: "対話で組んで、",
      h1flip: "繰り返す",
      h1b: "、卒業にたどり着くまで。",
      lede: "読むだけのノベルじゃない。ループごとに組み直すデッキだ。卒業まで10日の離島で、会話はすべてカードバトル。進めなければ1日目に戻る。クラスメイト一人ひとりを読み、対話の手札を組み、また繰り返して島の真実へ近づく。日本では94%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "卒業まで10日の離島。「悪魔」を名乗る少女が、卒業式までたどり着けと言う。だが会話はすべてカードバトルで、失敗した周回は1日目へ巻き戻される。",
        "だから12人のクラスメイトを読み、効く対話の手札を組み、ループを重ねて何が通用するかを学んでいく。会話が、自分で組み立てるものに変わる。",
        "そしてある周回がカチッとハマり、関係が保たれ、島の謎と悪魔の真意が開く。閉じ込められていたループが、自分が攻略したものに反転する瞬間、静かに高ぶる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Slay the Spire のような「組んで適応する」ループが好きで、その読んで組む感覚を戦闘ではなく会話と人間関係で味わいたい人",
        "眺めるだけのタイムループでなく、自分のやり方を組み直して解いていくループが欲しい人",
        "英語レビュー0件で西がまだ読めていない、日本の同人原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "純粋なターン制デッキ構築バトルが欲しい人(本作はデッキ構築を対話と物語ループに溶かしている・戦闘そのものが主役ではない)",
      ],
      s3: "系譜：この味の原点",
    },
  },
};

// 【未来の投稿を予約 (client-side reveal)】各 pick は publishAt(公開予定日時)を持てる。
//   形式: "YYYY-MM-DD"(JST 前提)。published と同形式で一貫させる。境界は「その日の JST 00:00:00」。
//   後方互換: publishAt 無し(undefined)の既存 pick は即公開扱い(常に表示)。
//   方式: Cloudflare cron / 定期リビルドは使わない。全 pick を従来通り build/deploy し HTML に出力する。
//   client(体)が now(JST) と publishAt を比較して出し分け、期日が来たら再ビルド無しで自動表示される。
//
// JST_OFFSET_MIN = JST(UTC+9) の分オフセット。これが TZ 判定の唯一の真実源(SSOT)。
//   JS にベタ書きせず SSR からこの値を体へ渡す(脳と体の分離・マジックナンバー散乱の防止)。
export const JST_OFFSET_MIN = 9 * 60;

// publishAt("YYYY-MM-DD" JST) を UTC epoch(ms)に解く。JST 00:00:00 を UTC へ正規化する。
//   "YYYY-MM-DD" を素朴に Date.parse すると UTC 00:00 と解釈され JST 始点と 9h ずれる。
//   そのずれを JST_OFFSET_MIN で明示的に引いて補正する(UTC ずれ対策・捏造しない)。
//   形式不正(parse 不能)なら null(判定不能 = 後方互換で公開側に倒さず呼び出し側が判断)。
export function publishAtToUtcMs(publishAt: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(publishAt);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  // その日の 00:00:00 を UTC として作り、JST オフセット分だけ前へ戻す = JST 00:00 の UTC 時刻。
  const utcMidnight = Date.UTC(y, mo - 1, d);
  return utcMidnight - JST_OFFSET_MIN * 60 * 1000;
}

// 公開済みか判定(計算だけ・副作用なし)。publishAt 無し = 即公開(後方互換)。
//   nowMs は UTC epoch(ms)。境界(JST 00:00:00)を含めて以降を公開とする(now >= 境界)。
//   形式不正な publishAt は判定不能 = 安全側(未公開)に倒さず公開扱い(既存挙動の後方互換維持)。
export function isPublished(publishAt: string | undefined, nowMs: number): boolean {
  if (!publishAt) return true;
  const at = publishAtToUtcMs(publishAt);
  if (at === null) return true;
  return nowMs >= at;
}

// steam URL から Steam appid を抽出(計算だけ・副作用なし)。形式 .../app/<digits>/... のみ受ける。
//   steam 無し/不正は null(捏造しない・フォールバックは呼び出し側)。OG カード生成と将来の
//   appid 参照を一様に扱う唯一の入口(SSOT)。lineageName の部分一致は後方互換のため今は触らない。
export function steamAppId(steamUrl: string | undefined): string | null {
  if (!steamUrl) return null;
  const m = /\/app\/(\d+)\//.exec(steamUrl);
  return m ? m[1] : null;
}

// lineage id -> 原点 established を同定する識別子(多態)。原点名そのものは picks 内の games[] に
// established として既出 = SSOT。ここでは「どの established が原点か」だけを同定する。
//   steam   : Steam app id(後方互換・PC 作品の原点)。
//   wikidata: Wikidata QID URL(Steam 版が無い原点。例 Archero はモバイル専用で Steam 版なし)。
// どちらか一方を持つ。両方持つ場合は steam を優先する(後方互換)。
const LINEAGE_ANCHOR = {
  "slay-the-spire": { steam: "646570" },
  "obra-dinn": { steam: "653530" },
  "two-point-hospital": { steam: "535930" },
  "archero": { wikidata: "https://www.wikidata.org/wiki/Q116031886" },
  "her-story": { steam: "368370" },
  "to-the-moon": { steam: "206440" },
  "metal-hellsinger": { steam: "1061910" },
  "uncharted-waters-2": { steam: "628170" },
  "dungeon-keeper": { steam: "1996630" },
  "princess-maker-2": { steam: "523000" },
  "doki-doki-literature-club": { steam: "698780" },
  "clannad": { steam: "324160" },
  "kamaitachi-no-yoru": { steam: "2612660" },
  "recettear": { steam: "70400" },
} as const;

export type LineageId = keyof typeof LINEAGE_ANCHOR;

// lineage id を原点ゲーム名(表示言語)に解決する。picks 内の established game を逆引きし、
// ゲーム名の二重定義を避ける(SSOT)。見つからなければ null(捏造しない)。
//   同定は多態: anchor.steam があれば Steam URL で、anchor.wikidata があれば wikidata で逆引きする。
export function lineageName(id: string, lang: "en" | "ja"): string | null {
  const anchor = (LINEAGE_ANCHOR as Record<string, { steam?: string; wikidata?: string }>)[id];
  if (!anchor) return null;
  const isJa = lang === "ja";
  for (const key of Object.keys(picks)) {
    for (const g of picks[key].games) {
      if (g.status !== "established") continue;
      // Steam 同定(後方互換): app id を含む Steam URL を持つ established。
      if (anchor.steam) {
        if (!g.steam) continue;
        if (g.steam.indexOf("/app/" + anchor.steam + "/") === -1) continue;
        return isJa ? (g.name_ja || g.name_en) : (g.name_en || g.name_ja);
      }
      // Wikidata 同定(Steam 版が無い原点): g.wikidata の完全一致で逆引き。
      if (anchor.wikidata) {
        if (g.wikidata !== anchor.wikidata) continue;
        return isJa ? (g.name_ja || g.name_en) : (g.name_en || g.name_ja);
      }
    }
  }
  return null;
}

// meta.lineage を常に配列へ正規化する(計算だけ・副作用なし)。
//   後方互換: single string("slay-the-spire")も配列(["slay-the-spire","archero"])も受ける。
//   無し/不正は空配列。多親(複数原点を持つ Bit Oz hub 等)を全箇所で一様に扱う唯一の入口(SSOT)。
export function lineageIds(meta: { lineage?: string | string[] } | undefined): string[] {
  const l = meta && meta.lineage;
  if (!l) return [];
  return Array.isArray(l) ? l : [l];
}

// 2 つの lineage 集合に共通の原点があるか(計算だけ・副作用なし)。多親同士でも sibling 判定が壊れない。
function shareLineage(a: string[], b: string[]): boolean {
  for (const x of a) { if (b.indexOf(x) !== -1) return true; }
  return false;
}

// 【案B 系譜を辿れる地図】末尾 related を「同じ原点から枝分かれした原石」として並べる。
//   1. 同原点(同 lineage)共有を優先表示(枝分かれの兄弟)
//   2. 尽きたら別の味(別 lineage)を1本だけ混ぜてループを閉じない(別の枝への入口)
// 系譜キーは meta.lineage(established game 由来・データ駆動)。計算だけ。状態は変えない(副作用なし)。
//   多親対応: lineageIds の積集合が空でなければ sibling(後方互換: single 同士は従来通り)。
//   relation: "sibling"=同原点の枝分かれ / "branch"=別の味への入口。表示文言は presentation+i18n が持つ。
export function relatedPicks(currentSlug: string): { slug: string; relation: "sibling" | "branch" }[] {
  const cur = picks[currentSlug];
  if (!cur) return [];
  const curLineage = lineageIds(cur.meta);
  const siblings: { slug: string; relation: "sibling" | "branch" }[] = [];
  const others: { slug: string; relation: "sibling" | "branch" }[] = [];
  for (const slug of Object.keys(picks)) {
    if (slug === currentSlug) continue;
    const m = picks[slug].meta;
    if (curLineage.length > 0 && shareLineage(curLineage, lineageIds(m))) {
      siblings.push({ slug: slug, relation: "sibling" });
    } else {
      others.push({ slug: slug, relation: "branch" });
    }
  }
  // 同原点を全て出し、最後に別の味を1本だけ足してループを閉じない。
  const out = siblings.slice();
  if (others.length > 0) out.push(others[0]);
  return out;
}

// 【案2 家系図(/lineage)】全 picks を原点(root)ごとにまとめた家系図データ(計算だけ・副作用なし)。
//   root = lineageName で解決できる原点(established 由来=SSOT・捏造しない)。
//   children = その root を lineageIds に含む pick。多親(Bit Oz hub)は複数 root にぶら下がる(二親表現)。
//   並びは picks の出現順に root を distinct(安定)。null 名の root は出さない。
//   Bit Oz は根でなく交点の子(中立・中心化しない)。established 原点だけが root に立つ。
//   名前(原点名/ゲーム名)はここでは持たせず slug/kind 等の事実だけを返す。代表名の解決は
//   体(LineagePage)が lib/jsonld.representativeName 経由で行う(SSOT・循環 import 回避)。
export function lineageForest(lang: "en" | "ja"): {
  rootId: string;
  rootName: string;
  children: { slug: string; kind: string; publishAt: string; obscurity: string }[];
}[] {
  // root id を全 picks の lineageIds から distinct 抽出(出現順を保つ)。
  const rootIds: string[] = [];
  for (const slug of Object.keys(picks)) {
    for (const id of lineageIds(picks[slug].meta)) {
      if (rootIds.indexOf(id) === -1) rootIds.push(id);
    }
  }
  const forest: {
    rootId: string;
    rootName: string;
    children: { slug: string; kind: string; publishAt: string; obscurity: string }[];
  }[] = [];
  for (const rootId of rootIds) {
    const rootName = lineageName(rootId, lang);
    if (rootName === null) continue; // 同定不能な root は出さない(捏造しない)。
    const children: { slug: string; kind: string; publishAt: string; obscurity: string }[] = [];
    for (const slug of Object.keys(picks)) {
      const pick = picks[slug];
      if (lineageIds(pick.meta).indexOf(rootId) === -1) continue;
      children.push({
        slug: slug,
        kind: pick.kind,
        publishAt: pick.publishAt ?? "",
        obscurity: (pick.meta && pick.meta.obscurity) || "none",
      });
    }
    forest.push({ rootId: rootId, rootName: rootName, children: children });
  }
  return forest;
}

// 【案E 味の問診】既存の構造化 meta(lineage / genre / obscurity)を二択軸へマップして
//   「刺さる1本」を導く。新規データは一切増やさない(脳と体の分離・捏造なし・SSOT)。
//   結果対象は kind==="find" の発掘のみ(hub は味そのものなので結果に出さず、系譜の受け皿)。
//
//   軸は「人間語(good/bad の散文)」でなく、その散文の根拠になっている構造化 meta から取る:
//     Q1 read  : lineage で「読みの対象」を分ける(盤面を組む slay-the-spire / 記録を推理する obra-dinn)
//     Q2 build : genre で「組む単位」を分ける(カードを組む deckbuilder / チームを組む roguelike 等)
//   在庫が増えても同じ軸でマップが自動拡張する段階設計(問数はここを直さず据え置ける)。
//
//   【軸の階層(weight)】read は上位カテゴリ、build はその下位細分。単純合算だと「推理(read=b)」を
//   選んだ人が、build の細分一致で組む系(slay-the-spire)へ引っ張られる矛盾が出る。だから read を
//   支配的な重みにし、build は read 同点時のタイブレークに留める(weight: read >> build)。
//   照合は重み付き一致スコアで最も合う find を 1 本選ぶ。スコア同点は obscurity でより埋もれた方を
//   優先(北極星: 発掘体験の密度)。回答が無い/JS-off では関数を呼ばない = 全 find が下に SSR で残る。

// 二択の値(安定 id)。文言は i18n、ここは axis と option の id だけ(脳と体の分離)。
export type QuizAxis = "read" | "build";
export type QuizOption = "a" | "b";

// 軸定義(SSOT): field=照合する meta キー / weight=軸の支配度 / options=選択肢 id -> meta 値。
//   read(weight 大)で大カテゴリを決め、build(weight 小)で細分する。data を変えれば問診が変わる。
const QUIZ_AXIS_MAP: Record<QuizAxis, { field: "lineage" | "genre"; weight: number; options: Record<QuizOption, string[]> }> = {
  read: {
    field: "lineage",
    weight: 10, // 支配軸: build の合計より必ず大きく、上位カテゴリが細分に負けない
    options: {
      a: ["slay-the-spire"], // 組む系: 動く盤面/編成を読む
      b: ["obra-dinn"],      // 推理系: 散らばった記録を論理で収束させる
    },
  },
  build: {
    field: "genre",
    weight: 1, // 細分軸: read 同点時のタイブレーク
    options: {
      a: ["deckbuilder"], // カードのデッキを組む
      b: ["roguelike"],   // チームを組む
    },
  },
};

// 問診の設問順(安定)。在庫が増えて軸を足す時はここに追記する(問数の段階設計)。
export const QUIZ_AXES: QuizAxis[] = ["read", "build"];

// 軸の重み(SSOT)。体(クライアント JS)は同じ重みで照合するために SSR からこれを受け取る。
// JS 側にマジックナンバーを書かず、重みの真実源はここ一箇所に保つ(脳と体の分離)。
export function quizAxisWeights(): Record<QuizAxis, number> {
  const out = {} as Record<QuizAxis, number>;
  for (const axis of QUIZ_AXES) out[axis] = QUIZ_AXIS_MAP[axis].weight;
  return out;
}

// より埋もれている方を優先する序列(発掘体験の密度・presentation でなく結果選定の核なので data 側)。
const QUIZ_OBSCURITY_PRIORITY: Record<string, number> = { deep: 0, wall: 1, none: 2 };

// 回答(軸 -> 選択肢)から最も合う find を 1 本選ぶ。計算だけ(副作用なし)。
//   answers に無い軸は照合に使わない(部分回答でも動く)。一致 find が無ければ null(捏造しない)。
export function quizResult(answers: Partial<Record<QuizAxis, QuizOption>>): string | null {
  const finds = Object.keys(picks).filter(function (s) { return picks[s].kind === "find"; });
  let best: string | null = null;
  let bestScore = 0;
  let bestObs = 99;
  for (const slug of finds) {
    const m = picks[slug].meta as Record<string, any>;
    let score = 0;
    for (const axis of QUIZ_AXES) {
      const opt = answers[axis];
      if (!opt) continue;
      const def = QUIZ_AXIS_MAP[axis];
      // lineage は多親で配列になり得る。値を配列に正規化し、いずれかが選択肢に一致すれば加点(後方互換)。
      const vals = def.field === "lineage" ? lineageIds(m) : [m[def.field]];
      if (vals.some(function (v) { return def.options[opt].indexOf(v) !== -1; })) score += def.weight;
    }
    const obs = QUIZ_OBSCURITY_PRIORITY[m.obscurity ?? "none"] ?? 2;
    // 重み付き一致スコアが高い方を優先。同点はより埋もれた方(obscurity が小さい)を優先。
    if (score > bestScore || (score === bestScore && score > 0 && obs < bestObs)) {
      best = slug;
      bestScore = score;
      bestObs = obs;
    }
  }
  // 1 つも軸が一致しない(全 find が score 0)なら指し示さない(沈黙・煽らない)。
  return bestScore > 0 ? best : null;
}

// 各 find が「どの回答の組み合わせで選ばれるか」を逆算(体が data 属性に埋めて JS なしの照合に使う)。
//   返り値: find slug -> { read: "a"|"b"|null, build: "a"|"b"|null }。
//   その軸でこの find を一意に指す選択肢があれば id、無ければ null(その軸は中立)。
export function quizSignature(slug: string): Record<QuizAxis, QuizOption | null> {
  const m = picks[slug] && (picks[slug].meta as Record<string, any>);
  const sig: Record<QuizAxis, QuizOption | null> = { read: null, build: null };
  if (!m) return sig;
  for (const axis of QUIZ_AXES) {
    const def = QUIZ_AXIS_MAP[axis];
    // lineage は多親で配列になり得る。値を配列に正規化し、いずれかが一致する選択肢を採る(後方互換)。
    const vals = def.field === "lineage" ? lineageIds(m) : [m[def.field]];
    for (const opt of ["a", "b"] as QuizOption[]) {
      if (vals.some(function (v) { return def.options[opt].indexOf(v) !== -1; })) { sig[axis] = opt; break; }
    }
  }
  return sig;
}

// 【案C 希少性スタンプ】無名さと裏腹の事実だけを構造化済み meta から拾う(捏造しない・文中パースしない)。
//   表示ラベルは i18n、ここは「どの事実キーがどの値で立っているか」だけを返す(脳と体の分離)。
//   kind と value のペア配列。presentation が ui.ts でラベル化し「98%好評なのに無名」を組む。
//   established(原点・hub)には付けない。事実が無ければ空配列(沈黙・煽らない)。
export function rarityStamps(slug: string): { kind: string; value: number | boolean }[] {
  const pick = picks[slug];
  if (!pick || pick.kind !== "find") return [];
  const m = pick.meta as Record<string, any>;
  const out: { kind: string; value: number | boolean }[] = [];
  const r = m.rarity as Record<string, any> | undefined;
  // 1. 好評率(確定値のみ)
  if (r && typeof r.positivePct === "number") out.push({ kind: "positivePct", value: r.positivePct });
  // 2. レビュー総数(確定値) or レビュー帯(確定値が無い時の安全な水準表現)
  if (r && typeof r.reviews === "number") out.push({ kind: "reviews", value: r.reviews });
  else if (m.reviewBand === "hundreds") out.push({ kind: "reviewBandHundreds", value: true });
  // 3. 英語非対応(壁の事実)。rarity 明示 or reachState=lang_walled から(捏造でなく既述事実)。
  if ((r && r.noEnglish === true) || m.reachState === "lang_walled") out.push({ kind: "noEnglish", value: true });
  // 4. 西未到達(数値の無い無名さ)。上記が何も無い時のフォールバック(沈黙を避ける)。
  if (out.length === 0 && m.reachState === "unreached_west") out.push({ kind: "unreachedWest", value: true });
  return out;
}
