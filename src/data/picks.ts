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
    meta: { genre: "deckbuilder", lineage: "slay-the-spire", obscurity: "none" },
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
        steam: "https://store.steampowered.com/app/1066700/",
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

// lineage id -> 原点ゲームの Steam app 識別子。原点名そのものは picks 内の games[] に
// established として既出 = SSOT。ここでは「どの established が原点か」だけを app id で同定する。
const LINEAGE_ANCHOR_STEAM = {
  "slay-the-spire": "646570",
  "obra-dinn": "1066700",
} as const;

export type LineageId = keyof typeof LINEAGE_ANCHOR_STEAM;

// lineage id を原点ゲーム名(表示言語)に解決する。picks 内の established game を逆引きし、
// ゲーム名の二重定義を避ける(SSOT)。見つからなければ null(捏造しない)。
export function lineageName(id: string, lang: "en" | "ja"): string | null {
  const appId = (LINEAGE_ANCHOR_STEAM as Record<string, string>)[id];
  if (!appId) return null;
  const isJa = lang === "ja";
  for (const key of Object.keys(picks)) {
    for (const g of picks[key].games) {
      if (g.status !== "established") continue;
      if (g.steam.indexOf("/app/" + appId + "/") === -1) continue;
      return isJa ? (g.name_ja || g.name_en) : (g.name_en || g.name_ja);
    }
  }
  return null;
}

// 【案B 系譜を辿れる地図】末尾 related を「同じ原点から枝分かれした原石」として並べる。
//   1. 同原点(同 lineage)共有を優先表示(枝分かれの兄弟)
//   2. 尽きたら別の味(別 lineage)を1本だけ混ぜてループを閉じない(別の枝への入口)
// 系譜キーは meta.lineage(established game 由来・データ駆動)。計算だけ。状態は変えない(副作用なし)。
//   relation: "sibling"=同原点の枝分かれ / "branch"=別の味への入口。表示文言は presentation+i18n が持つ。
export function relatedPicks(currentSlug: string): { slug: string; relation: "sibling" | "branch" }[] {
  const cur = picks[currentSlug];
  if (!cur) return [];
  const curLineage = cur.meta && cur.meta.lineage;
  const siblings: { slug: string; relation: "sibling" | "branch" }[] = [];
  const others: { slug: string; relation: "sibling" | "branch" }[] = [];
  for (const slug of Object.keys(picks)) {
    if (slug === currentSlug) continue;
    const m = picks[slug].meta;
    if (curLineage && m && m.lineage === curLineage) {
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
      if (def.options[opt].indexOf(m[def.field]) !== -1) score += def.weight;
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
    for (const opt of ["a", "b"] as QuizOption[]) {
      if (def.options[opt].indexOf(m[def.field]) !== -1) { sig[axis] = opt; break; }
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
