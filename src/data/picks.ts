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
    meta: { genre: "puzzle", lineage: "obra-dinn", obscurity: "wall", reviewBand: "around_1k", reachState: "lang_walled", rarity: { reviews: 975, positivePct: 98, noEnglish: true } },
    games: [
      {
        name_en: "Welcome to the Guild Exploration Party!",
        name_ja: "ギルド探求団へようこそ！",
        status: "hidden",
        steam: "https://store.steampowered.com/app/4327530/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A deductive logic puzzle that asks you to restore a guild's lost records. The guild has reached its 1000th day, and the data on who belonged where is gone, so you reconstruct it: 78 adventurers, 20 parties, and the ending each of them met, worked out from the fragments of guild records alone. No math, no note-taking required, just your reasoning and a cute assistant. Like an armchair detective, you fill in one cell of a grid at a time and lock it down, until every assignment is forced to be true with no contradictions. Made by the Japanese solo creator Palsonic (circle name Parusoni Koubou), who came up through Japan's free-game scene and made the popular freeware Kagami no Majoritia. Overwhelmingly Positive in Japan at 975 reviews and 98 percent, yet the West has barely found it: only 9 English reviews out of 975, under 1 percent. There is no English version, the store supports Japanese only, so the language itself is the wall.",
        desc_ja: "失われたギルドの記録を復元する、演繹型のロジックパズル。創立1000日を迎えたギルドの、誰がどこに所属していたかのデータが失われている。だからあなたが復元する——78人の冒険者が、20の隊のどこに居て、それぞれどんな結末(エンディング)を迎えたかを、ギルド記録の断片だけを頼りに導き出す。計算もメモも要らない。武器は、あなたの知性と、可愛い助手だけだ。安楽椅子探偵のように、表(グリッド)を一マスずつ埋めて確定させ、すべての所属が矛盾なく必然で定まるまで詰めていく。日本のフリーゲーム畑出身の個人開発者・パルソニック(サークル名 ぱるそに工房)による一本で、人気フリゲ『鏡のマジョリティア』の作者でもある。975レビュー98%で日本では圧倒的に好評なのに、西はまだほとんど見つけていない——975件中、英語レビューはわずか9件、1%未満。英語版は存在しない。ストアは日本語のみ対応で、言語そのものが壁になっている。",
      },
      {
        name_en: "Return of the Obra Dinn",
        name_ja: "Return of the Obra Dinn",
        status: "established",
        steam: "https://store.steampowered.com/app/653530/Return_of_the_Obra_Dinn/",
        wikidata: "https://www.wikidata.org/wiki/Q57008108",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the modern deduction puzzle, where you fill a table of people, places, and fates from fragments by pure logic: in 2018, Lucas Pope shipped a first-person mystery where you reconstruct the identity and fate of every crew member of a ghost ship from frozen-moment scenes, with no math and no guessing, each answer locked only when it is forced to be true. This gem is a direct heir to that DNA, the armchair-detective act of cross-referencing clues to fill a grid until every cell is forced, only it pours that pure logic into restoring a guild's lost roster of 78 adventurers across 20 parties.",
        desc_ja: "断片から人物・場所・運命の表を論理だけで埋めていく、現代演繹推理パズルの原点。2018年、Lucas Pope が、幽霊船の乗員一人ひとりの身元と運命を、静止した瞬間の場面から再構成する一人称ミステリを世に出した——計算も当てずっぽうもなく、必然で確定したときだけ答えが定まる。この未発掘の名作はそのDNAの直系——手がかりを突き合わせ、すべてのマスが必然で定まるまで表を埋める安楽椅子探偵の行為。ただしその純粋な論理を、78人の冒険者と20の隊からなる、失われたギルド名簿の復元に注ぎ込んだ。",
      },
    ],
    en: {
      title: "Welcome to the Guild Exploration Party! - a buried logic-deduction puzzle you can only play in Japanese, an heir to Return of the Obra Dinn",
      description: "A deductive logic puzzle where you restore a guild's lost records: 78 adventurers, 20 parties, and the ending each one met, worked out from fragments by pure logic. No math, no notes, just reasoning and a cute assistant, filling a grid one forced cell at a time. Overwhelmingly Positive in Japan at 975 reviews and 98 percent, yet only 9 English reviews. Japanese only: the language is the wall.",
      h1a: "Restore the lost records ",
      h1flip: "by pure logic",
      h1b: ".",
      lede: "A deductive logic puzzle. The guild has reached its 1000th day, but the records of who belonged where are gone, so you rebuild them: 78 adventurers, 20 parties, and the ending each met, worked out from the fragments of guild records alone. No math, no note-taking, just your reasoning and a cute assistant. Like an armchair detective, you fill the grid one cell at a time and lock it, until every assignment is forced with no contradictions. A solo work by the Japanese free-game creator Palsonic, in the lineage of the modern deduction puzzle Return of the Obra Dinn. Japanese only, so the West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "The records hand you fragments, never the answer, so who belonged to which party stays a fog at first, and the only way through is to read the clues against each other.",
        "But you never guess. One fixed fact forces the next cell true, and that one into the next, so the grid is not a thing you fill in by hunch, it is a chain that logic drives one lock at a time.",
        "Then the last party falls into position with no contradiction left anywhere, and a chill runs down your spine, the clean click of an answer that could only ever have been this, reasoned out entirely by you.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Return of the Obra Dinn act of filling a table of people and fates from fragments by pure logic, an armchair detective with no hand-holding",
        "You want a deduction puzzle where every answer is forced, never a lucky guess, with no math or note-taking, just reasoning and a cute assistant",
        "You want a gem the West has not reached, Overwhelmingly Positive in Japan at 98 percent with only 9 English reviews out of 975, because there is no English version",
      ],
      bad: [
        "You do not read Japanese: there is no English version and the store supports Japanese only, so the language itself is the wall",
        "You want action or fast reflexes, not slow armchair deduction filling a grid at your own pace",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ギルド探求団へようこそ！ - 日本語でしか遊べない、Return of the Obra Dinn の系譜の埋もれた演繹推理パズル",
      description: "失われたギルドの記録を復元する演繹型ロジックパズル。78人の冒険者が20の隊のどこに居て、どんな結末を迎えたかを、断片から論理だけで導く。計算もメモも要らず、武器は知性と可愛い助手だけ。安楽椅子探偵のように表を一マスずつ必然で埋めていく。975レビュー98%で日本では圧倒的に好評なのに英語レビューは9件。日本語のみ対応で、言語そのものが壁。",
      h1a: "失われた記録を、",
      h1flip: "論理だけで復元する",
      h1b: "。",
      lede: "演繹型のロジックパズル。創立1000日を迎えたギルドの、誰がどこに所属していたかの記録が失われている。だからあなたが復元する——78人の冒険者が、20の隊のどこに居て、それぞれどんな結末を迎えたかを、ギルド記録の断片だけを頼りに導き出す。計算もメモも要らない。武器は、あなたの知性と、可愛い助手だけだ。安楽椅子探偵のように、表を一マスずつ埋めて確定させ、すべての所属が矛盾なく必然で定まるまで詰めていく。日本のフリーゲーム畑出身の個人開発者・パルソニックによる一本で、現代演繹推理パズルの原点 Return of the Obra Dinn の系譜に連なる。日本語のみ対応のため、西はまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "記録は断片しかくれない。答えは渡されない。だから誰がどの隊かは最初は霧の中で、手がかりと手がかりを突き合わせる以外に、抜ける道はない。",
        "でも、当てずっぽうは一度もしない。一つ確定した事実が次のマスを必然で定め、それがまた次を定める。だから表は勘で埋めるものではなく、論理が一マスずつ鍵を掛けていく連鎖になる。",
        "そして最後の隊が、どこにも矛盾を残さず定位置にはまる。ゾクッと背筋が震える——これ以外ありえなかった答えが、すべて自分の推理だけでカチッとはまる、その清潔な音だ。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Return of the Obra Dinn の、断片から人物と運命の表を論理だけで埋めていく快感が好きな人——誰にも教わらない安楽椅子探偵",
        "全部が必然で決まる、運の当てずっぽうがない推理パズルが欲しい人——計算もメモも要らず、武器は知性と可愛い助手だけ",
        "英語版が存在しないからこそ西が届かない、98%で日本では圧倒的に好評なのに975件中英語レビュー9件の原石を掘りたい人",
      ],
      bad: [
        "日本語が読めない人(英語版は存在せず、ストアは日本語のみ対応なので、言語そのものが壁になる)",
        "ゆっくり表を埋める安楽椅子推理より、アクションや速い反射が欲しい人",
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
  "putrika-2nd-cut": {
    published: "2026-06-15",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "kamaitachi-no-yoru", obscurity: "wall", reviewBand: "hundreds", reachState: "lang_walled", rarity: { reviews: 154, positivePct: 93, noEnglish: true } },
    games: [
      {
        name_en: "Putrika 2nd.cut: For the Exquisite Attire",
        name_ja: "プトリカ 2nd.cut:For the Exquisite Attire",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3818900/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "The sequel to the Japanese doujin tragedy Putrika 1st.cut, by the same circle Totometri: a gem artisan and a saint who, more than anyone, wishes to die, and once more the choice to spare or to slay. Where the first cut was about beauty, this one turns to human ugliness, jealousy and self-interest. Very Positive in Japan at 154 reviews and 93 percent, but it has no English support, so the West cannot read it yet (only a couple of English reviews) - even more buried than the first cut.",
        desc_ja: "日本の同人サークル・トトメトリによる、悲劇プトリカ 1st.cut の続編。宝石職人と、誰よりも死を望む聖女。そしてまた「生かすか、殺すか」の選択。1st.cut が「美」を描いたなら、本作が向き合うのは人間の「醜さ」——嫉妬と利己だ。154レビュー93%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューはわずか数件)。1st.cut よりさらに深く埋もれている。",
      },
      {
        name_en: "Kamaitachi no Yoru",
        name_ja: "かまいたちの夜",
        status: "established",
        steam: "https://store.steampowered.com/app/2612660/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the sound novel: text, branching choices, and sound that pull you into a story of fear and tragedy you cannot stop reading. This gem keeps that spine and bends it from suspense into the cruel beauty of a tragedy with no salvation, here turned toward the ugliness in people.",
        desc_ja: "サウンドノベルの原点。文章と選択分岐と音で、止まれない恐怖と悲劇の物語へ引き込む。この未発掘の名作はその背骨を保ったまま、サスペンスから「救いのない悲劇の残酷美」へと味をずらし、本作ではそれを人間の醜さへ向ける。",
      },
    ],
    en: {
      title: "Putrika 2nd.cut - a buried dark-fantasy visual novel about choosing to spare or to slay, walled off by language",
      description: "The sequel to the Japanese doujin tragedy Putrika: a gem artisan and a saint who wants to die, and the choice to spare or to slay. Very Positive in Japan at 154 reviews and 93 percent, but with no English support, the West still cannot read it (only a couple of English reviews).",
      h1a: "Choose again: ",
      h1flip: "to spare her, or to slay her",
      h1b: ".",
      lede: "Not a tragedy you watch. A tragedy you read your way into, a second time. The sequel to Putrika 1st.cut returns to the world where gem-souled dolls live among humans, and once more puts a single question in your hands: spare her, or end her. Where the first cut was about beauty, this one turns to the ugliness in people. Loved in Japan at 93 percent, but it still has no English, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "You return to the world of the first Putrika, where a gem artisan meets a saint who, more than anyone, wishes to die.",
        "Inside the cathedral the same impossible choice closes in: to spare her, or to slay her, while jealousy and self-interest twist the people around you.",
        "Then it lands. The cruelty reads as a kind of beauty again, and the same chill the first cut gave you runs down your spine, deeper this time.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You read Putrika 1st.cut (or want to start the series) and want the same cruel, no-salvation tragedy carried one cut deeper",
        "You love sound-novel storytelling like Kamaitachi no Yoru, bent toward tragedy and the beauty of cruelty rather than suspense",
        "You want a Japanese doujin gem the West cannot read yet, a sequel buried under only a couple of English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want a hopeful or wholesome story (this is a deliberately cruel tragedy about human ugliness, with a single linear route and no branching choices)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "プトリカ 2nd.cut - 生かすか殺すかを選ぶ、言語の壁で埋もれたダークファンタジーADV",
      description: "日本の同人悲劇プトリカの続編。宝石職人と、誰より死を望む聖女。そして「生かすか、殺すか」の選択。154レビュー93%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューはわずか数件)。",
      h1a: "もう一度選ぶ。",
      h1flip: "生かすか、殺すか",
      h1b: "を。",
      lede: "眺める悲劇じゃない。自分で読み進める悲劇を、もう一度。プトリカ 1st.cut の続編は、宝石の魂を持つ人形が人と共に生きる世界へ再び連れ戻し、また一つの問いをあなたの手に委ねる——生かすか、殺すか。1st.cut が「美」を描いたなら、本作が向き合うのは人間の「醜さ」だ。日本では93%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "1st.cut の世界へ戻る。宝石職人が、誰よりも死を望む聖女と出会う。",
        "聖堂の中で、あの抗えない選択がまた迫る——生かすか、殺すか。その周囲では、嫉妬と利己が人々を歪ませていく。",
        "そして腑に落ちる。惨さがまたある種の美しさへ反転し、1st.cut が刻んだのと同じ悪寒が、今度はより深く背筋を走る。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "プトリカ 1st.cut を読んだ(またはシリーズを始めたい)人で、救いのない残酷な悲劇をもう一段深く味わいたい人",
        "かまいたちの夜のようなサウンドノベルの語りが好きで、サスペンスではなく悲劇と残酷美へ向かう物語が欲しい人",
        "英語レビューわずか数件で西がまだ読めていない、日本の同人原石の続編を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "希望のある優しい物語が欲しい人(本作は人間の醜さを描く意図的に残酷な悲劇・分岐のない一本道)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "lost-smile-memories": {
    published: "2026-06-16",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "clannad", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 52, positivePct: 96, noEnglish: true } },
    games: [
      {
        name_en: "LOST:SMILE memories",
        name_ja: "LOST:SMILE memories",
        status: "hidden",
        steam: "https://store.steampowered.com/app/1102410/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A summer-island romance novel from LIFE0, the same all-ages brand behind Dreamin' Her. On a small Okinawan island you trace your late father's footsteps and meet girls whose separate stories converge on one truth about living with what you lost. Very Positive in Japan at 52 reviews and 96 percent, but it has no English support, so the West cannot read it yet (only 2 English reviews). Note: there is mild partial nudity in a bath scene, but the brand is all-ages and the depiction is light.",
        desc_ja: "Dreamin' Her と同じ全年齢ブランド LIFE0 による、沖縄の離島を舞台にした夏の恋愛ノベル。小さな離島で亡き父の足跡を辿り、それぞれの喪失を抱えた少女たちと出会う。別々だった物語が、失ったものと生きていくという一つの真実へ収束する。52レビュー96%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは2件)。注記：入浴シーンに軽微な部分ヌード表現があるが、ブランドは全年齢で描写は軽い。",
      },
      {
        name_en: "CLANNAD",
        name_ja: "CLANNAD",
        status: "established",
        steam: "https://store.steampowered.com/app/324160/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the all-ages Japanese crying game: a romance novel where small, quiet choices pile up until the emotion finally breaks through. Overwhelmingly Positive on Steam at over 10,000 reviews. This gem inherits that lineage, as a sibling of Dreamin' Her from the same brand LIFE0, and pours it into an omnibus about loss and living on.",
        desc_ja: "全年齢の「泣きゲー」の原点。静かな選択の積み重ねが、やがて感情の決壊に至る恋愛ノベル。Steam では1万件超のレビューで圧倒的に好評。この未発掘の名作はその系譜を、同じブランド LIFE0 の Dreamin' Her の兄弟作として受け継ぎ、喪失と生きていくオムニバスへ注ぎ込む。",
      },
    ],
    en: {
      title: "LOST:SMILE memories - a buried Okinawan romance novel about living with what you lost, from the makers of Dreamin' Her, walled off by language",
      description: "A summer-island romance novel from LIFE0, the brand behind Dreamin' Her. You trace your late father's path across an Okinawan island and meet girls whose stories converge on one truth. Very Positive in Japan at 52 reviews and 96 percent, but with no English support, the West cannot read it yet (only 2 English reviews).",
      h1a: "Live with ",
      h1flip: "what you lost",
      h1b: ", on a summer island.",
      lede: "Not a romance that races to a confession. One that sits with loss. On a remote Okinawan island you retrace your late father's footsteps, meet girls carrying their own quiet grief, and piece their scattered stories into one truth. From LIFE0, the same brand as Dreamin' Her. Loved in Japan at 96 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "You come to a small Okinawan island to trace a father you lost, and the slow island time wraps around you like borrowed summer.",
        "Each girl you meet carries her own loss, and their separate stories quietly start to rhyme, pointing at a single truth underneath.",
        "When the scattered pieces lock into that one truth, the warmth and the ache of living-on land together, and something in your chest quietly gives way.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love CLANNAD-style all-ages romance novels where the payoff is emotional, not racy",
        "You already read Dreamin' Her and want more from the same brand, LIFE0",
        "You want a Japanese gem the West cannot read yet, buried under only 2 English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want a fast plot or heavy mechanics (this is a quiet, character-driven omnibus about loss; note mild bath-scene nudity, but the brand is all-ages)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "LOST:SMILE memories - 失ったものと生きていく、Dreamin' Her と同じ開発元の、言語の壁で埋もれた南国恋愛ノベル",
      description: "Dreamin' Her を手がけた LIFE0 による、沖縄の離島を舞台にした夏の恋愛ノベル。亡き父の足跡を辿り、それぞれの喪失を抱えた少女たちと出会い、散らばった物語が一つの真実へ収束する。52レビュー96%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは2件)。",
      h1a: "失ったものと、",
      h1flip: "生きていく",
      h1b: "、夏の島で。",
      lede: "告白へ走る恋愛じゃない。喪失と共にいる恋愛だ。沖縄の離島で亡き父の足跡を辿り、それぞれの喪失を抱えた少女たちと出会い、散らばった物語を一つの真実へと繋いでいく。Dreamin' Her と同じ LIFE0 の一本。日本では96%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "亡くした父の足跡を辿って小さな沖縄の離島へ来ると、島のゆっくりした時間が、借り物の夏のようにあなたを包む。",
        "出会う少女たちはそれぞれ自分の喪失を抱えていて、別々だった物語が静かに響き合いはじめ、底にある一つの真実を指しはじめる。",
        "散らばった断片がその一つの真実へカチッとはまった瞬間、生きていくことの温かさと痛みが同時に落ちてきて、胸の奥が静かに決壊する。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "CLANNAD のような全年齢の恋愛ノベルで、感情の余韻を読みたい人",
        "すでに Dreamin' Her を読んで、同じ LIFE0 の別の一本をもっと味わいたい人",
        "英語レビュー2件で西がまだ読めていない、日本の原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "速い展開や重いゲーム性が欲しい人(本作は喪失を描く静かなキャラ主導のオムニバス・入浴シーンの軽微なヌード表現があるがブランドは全年齢)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "cross-concerto": {
    published: "2026-06-16",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "kamaitachi-no-yoru", obscurity: "wall", reviewBand: "hundreds", reachState: "lang_walled", rarity: { reviews: 334, positivePct: 91, noEnglish: true } },
    games: [
      {
        name_en: "Cross Concerto",
        name_ja: "クロスコンチェルト",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2109640/Cross_Concerto/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese brand's tenth-anniversary work: a modern occult romance about a sister who can see one thread of the future, where clues scattered across the common route and each heroine's path converge on one truth far past what you guessed. Very Positive in Japan at 334 reviews and 91 percent, but it has no English support, so the West cannot read it yet (only 6 English reviews). Note: an all-ages Steam port of the formerly adult brand Applique.",
        desc_ja: "日本のVNブランド「あっぷりけ」の10周年記念作。未来の一筋を視る妹を巡る現代怪異譚で、共通ルートと各ヒロインのルートに散らされた手がかりが、予想を遥かに超えた一つの真実へ収束する。334レビュー91%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは6件)。注記：元18禁ブランドあっぷりけの全年齢Steam移植。",
      },
      {
        name_en: "Kamaitachi no Yoru",
        name_ja: "かまいたちの夜",
        status: "established",
        steam: "https://store.steampowered.com/app/2612660/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the sound novel: text, branching choices, and sound that pull you into an occult tale you cannot stop reading. This gem keeps that branching spine and bends it toward foreshadowing, scattering clues of prophecy and a wild spirit across its routes until they lock into one truth in a payoff of pure-love emotion.",
        desc_ja: "サウンドノベルの原点。文章と選択分岐と音で、止まれない怪異の物語へ引き込む。この未発掘の名作はその分岐の背骨を保ったまま、味を伏線へとずらす。予知と荒御魂の手がかりを各ルートに散らし、やがて一つの真実へカチッとはまる伏線回収と、ピュアラブの感情決壊へ。",
      },
    ],
    en: {
      title: "Cross Concerto - a buried Japanese occult romance where scattered clues converge on one truth, walled off by language",
      description: "A Japanese visual-novel brand's anniversary work: a modern occult tale of a sister who can see the future, where clues scattered across routes converge on one truth. Very Positive in Japan at 334 reviews and 91 percent, but with no English support, the West cannot read it yet (only 6 English reviews).",
      h1a: "Scattered clues ",
      h1flip: "converge on one truth",
      h1b: ".",
      lede: "Not a romance you only read. A mystery you let converge. A sister who can see one thread of the future, an occult tale, and clues scattered across every route that lock into a single truth. From Applique, a Japanese brand's tenth-anniversary work. Loved in Japan at 91 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "Your sister can see one thread of the future, and a closed village worships her for it. You flee with her into the wider world, carrying questions you cannot yet answer.",
        "Across the common route and each heroine's path, small clues drop without explanation: the future-sight, the wild spirit, her hidden past. You read on, half-sensing they connect.",
        "Then they lock. The scattered fragments converge on one truth far past what you guessed, the emotion breaks through, and a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Kamaitachi no Yoru spine of branching text that pulls you through an occult tale you cannot stop reading",
        "You want the payoff of clues scattered across routes converging on one truth, not a single straight line",
        "You want a Japanese brand gem the West cannot read yet, buried under only 6 English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want action or fast puzzles (this is a slow occult romance you read and let the clues converge at its own pace; note: an all-ages Steam port of a formerly adult brand)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "クロスコンチェルト - 散らばった手がかりが一つの真実へ収束する、言語の壁で埋もれた和風伝奇恋愛ノベル",
      description: "日本のVNブランドの周年記念作。未来を視る妹を巡る現代怪異譚で、各ルートに散らされた手がかりが一つの真実へ収束する。334レビュー91%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは6件)。",
      h1a: "散らばった手がかりが、",
      h1flip: "一つの真実へ収束する",
      h1b: "。",
      lede: "ただ読むだけの恋愛じゃない。手がかりを収束させていくミステリーだ。未来の一筋を視る妹、和風の怪異譚、そして各ルートに散らされた手がかりが、やがて一つの真実へカチッとはまる。あっぷりけ10周年記念作。日本では91%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "妹は未来の一筋を視る。閉ざされた村はその力ゆえに彼女を信仰している。あなたは妹を連れて外の世界へ逃れる——まだ答えの出ない問いを抱えたまま。",
        "共通ルートと各ヒロインのルートで、説明のないまま手がかりが落ちていく。予知の力、荒御魂、彼女の隠された過去。繋がる予感を半ば感じながら読み進める。",
        "そして噛み合う。散らばった断片が、予想を遥かに超えた一つの真実へ収束し、感情が決壊した瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "かまいたちの夜の、分岐するテキストで止まれない怪異譚へ引き込まれる背骨が好きな人",
        "一本道でなく、各ルートに散らされた手がかりが一つの真実へ収束する伏線回収の快感が欲しい人",
        "英語レビュー6件で西がまだ読めていない、日本のVNブランドの原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "アクションや速い謎解きが欲しい人(本作はゆっくり読んで手がかりを収束させる和風伝奇恋愛・注記:元18禁ブランドあっぷりけの全年齢Steam移植)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "umidorino-gaku": {
    published: "2026-06-17",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "her-story", obscurity: "wall", reviewBand: "hundreds", reachState: "lang_walled", rarity: { reviews: 315, positivePct: 82, noEnglish: true } },
    games: [
      {
        name_en: "Umidorino Gaku no Seishin Kanteiroku",
        name_ja: "海鳥野ガクの精神鑑定録",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3032950/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A free Japanese horror visual novel where you play a psychiatrist diagnosing a boy who stabbed his mother and hears strange voices. You choose what to ask and read his words to reach one truth, with 1 true ending and 8 ways to die. Very Positive in Japan at 315 reviews and 82 percent, but with no English support, the West cannot read it yet (only 4 English reviews).",
        desc_ja: "母を刺し、奇妙な声を聞く少年を診る精神科医となる無料の和製ホラーノベル。何を問うかを選び、患者の言葉から一つの真実を組み上げる。1つの真エンドと8つの死。315レビュー82%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは4件)。",
      },
      {
        name_en: "Her Story",
        name_ja: "Her Story",
        status: "established",
        steam: "https://store.steampowered.com/app/368370/Her_Story/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of assembling the truth from fragments: you search a database of clips, piece together scattered words, and reason out a woman's true identity yourself, with no hand-holding. A BAFTA and IGF Grand Prize winner. This gem moves that fragment-deduction into a psychiatric exam, where the questions you ask and the patient's words converge on one truth.",
        desc_ja: "断片から真実を組み上げるデダクションの原点。映像断片を検索語で集め、散らばった言葉を繋ぎ、女性の正体を自力で推理する。BAFTA・IGF Grand Prize 受賞作。この未発掘の名作はその断片推理を精神鑑定へ移し、何を問うかと患者の言葉から一つの真実へ収束させる。",
      },
    ],
    en: {
      title: "Umidorino Gaku no Seishin Kanteiroku - a buried Cthulhu psychiatric-deduction novel where you diagnose your way to one truth, walled off by language",
      description: "A free Japanese horror visual novel where you play a psychiatrist diagnosing a boy who stabbed his mother and hears strange voices. You choose what to ask and read his words to reach one truth, with 1 true ending and 8 ways to die. Very Positive in Japan at 315 reviews and 82 percent, but with no English support, the West cannot read it yet (only 4 English reviews).",
      h1a: "Diagnose your way to ",
      h1flip: "one truth",
      h1b: ".",
      lede: "Not a horror you only watch. One you diagnose. You are a psychiatrist assigned a 15-year-old who attacked his mother and hears voices no one else can. You choose what to ask, read his answers, and piece the fragments into a single truth, while a Lovecraftian thing waits behind it. One true ending, eight ways to die. From the Japanese circle imoChaiya. Loved in Japan at 82 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "Across the desk sits a boy who stabbed his mother, hearing voices no one else hears. Every question you choose is a thread, and you do not yet know which one is safe to pull.",
        "His answers drop fragments without explanation: the hallucination, the mother, the thing underneath. You read on, half-sensing that diagnosis and horror are the same truth.",
        "Then they lock. The scattered words converge on one truth far past a clinical case, and the moment it clicks, a chill runs down your spine, because you realize how close the wrong question came to killing you.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Her Story joy of asking your own questions and assembling the truth from fragments, with no hand-holding",
        "You want branching where a single wrong choice ends you, 1 true ending against 8 deaths",
        "You want a free Japanese gem the West cannot read yet, buried under only 4 English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want action or a long campaign (this is a tight, choice-driven horror reached in about an hour; note: Lovecraftian violence)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "海鳥野ガクの精神鑑定録 - 診察で一つの真実に辿り着く、言語の壁で埋もれたクトゥルフ精神鑑定ノベル",
      description: "母を刺し、奇妙な声を聞く少年を診る精神科医となる無料の和製ホラーノベル。何を問うかを選び、患者の言葉から一つの真実を組み上げる。1つの真エンドと8つの死。315レビュー82%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは4件)。",
      h1a: "診察で、",
      h1flip: "一つの真実へ",
      h1b: "辿り着く。",
      lede: "ただ見るだけのホラーじゃない。診察するホラーだ。あなたは精神科医として、母を刺し、誰にも聞こえない声を聞く15歳の少年を担当する。何を問うかを選び、その答えを読み、断片を一つの真実へ繋いでいく——その裏でクトゥルフ的な何かが待つ。真エンドは一つ、死に方は八つ。日本のサークルいもチャイ屋の一本。日本では82%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "机の向こうに座るのは、母を刺し、誰にも聞こえない声を聞く少年。あなたが選ぶ問いの一つ一つが糸で、どれを引けば安全かはまだ分からない。",
        "少年の答えは、説明のないまま断片を落としていく。幻聴、母、その奥にいる何か。診断と怪異が同じ真実なのではと半ば感じながら読み進める。",
        "そして噛み合う。散らばった言葉が、ただの臨床例を遥かに超えた一つの真実へ収束する。カチッとはまった瞬間、ゾクッとくる——間違った問いがどれだけ自分を死に近づけていたかに気づいて。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Her Story のように、自分で問いを立てて断片から真実を組み上げる快感が好きな人",
        "一手の選択ミスが即終わりになる分岐が欲しい人——真エンド一つに対し八つの死",
        "英語レビュー4件で西がまだ読めていない、無料の和製原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "アクションや長い物量が欲しい人(本作は約1時間で辿り着く選択主導の濃いホラー・注記:クトゥルフ的な暴力描写あり)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "midnight-syndrome": {
    published: "2026-06-17",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "twilight-syndrome", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 95, positivePct: 98, noEnglish: true } },
    games: [
      {
        name_en: "Midnight Syndrome",
        name_ja: "ミッドナイトシンドローム",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2877030/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A free Japanese exploration horror ADV where three high-school girls investigate the rumors and curses eating away at their rural town over one summer. Branching paths and multiple endings, in the lineage of SUDA51's Twilight Syndrome. Very Positive in Japan at 95 reviews and 98 percent, but with no English support, the West cannot read it yet (only 4 English reviews).",
        desc_ja: "三人の女子高生が、ひと夏の田舎町を蝕む噂と怪異を探索する無料の和製ホラーADV。分岐とマルチエンドを持ち、SUDA51 のトワイライトシンドロームの系譜に連なる。95レビュー98%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは4件)。",
      },
      {
        name_en: "Twilight Syndrome",
        name_ja: "トワイライトシンドローム",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Twilight_Syndrome",
        wikidata: "https://www.wikidata.org/wiki/Q7662337",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the exploration occult ADV: three schoolgirls walk a town's school and streets, reading each place to uncover the urban legends and curses underneath, directed by SUDA51 in 1996. No official Steam release. This gem revives that structure as a free modern indie, where you explore, branch, and converge on one truth far past a ghost story.",
        desc_ja: "探索型の心霊ADVの原点。三人の女子高生が学校と町を歩き、その場所そのものを読み解いて、底にある都市伝説と怪異を暴いていく。1996年、SUDA51(須田剛一)ディレクション。公式 Steam 版なし。この未発掘の名作はその構造を無料の現代インディーで蘇らせ、探索し、分岐し、ただの怪談を遥かに超えた一つの真実へ収束させる。",
      },
    ],
    en: {
      title: "Midnight Syndrome - a buried Japanese horror ADV where three schoolgirls investigate a town's curses, a free heir to SUDA51's Twilight Syndrome, walled off by language",
      description: "A free Japanese exploration horror ADV where three high-school girls investigate the rumors and curses eating away at their rural town over one summer. Branching paths and multiple endings, in the lineage of SUDA51's Twilight Syndrome. Very Positive in Japan at 95 reviews and 98 percent, but with no English support, the West cannot read it yet (only 4 English reviews).",
      h1a: "Three girls walk into a haunted town and ",
      h1flip: "only one truth gets out",
      h1b: ".",
      lede: "Not a horror you only watch. One you explore. Three high-school girls dig into the rumors, traditions, and curses of their rural town across one summer night, and what they uncover bends far past a ghost story. Branching choices, multiple endings, a chapter-by-chapter craft that earns the word force of work. A free game from the Japanese creator Natsumikan, built in the shadow of SUDA51's Twilight Syndrome. Loved in Japan at 98 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "Summer night, a rural town, three schoolgirls chasing a rumor no one wants confirmed. Every place you choose to explore is a thread, and you do not yet know which one should stay buried.",
        "The town drops its fragments without explanation: the school's tradition, the missing girl, the thing the rumor was hiding. You explore on, half-sensing the local legend and the real horror are the same.",
        "Then it locks. The scattered rumors converge on one truth far past a ghost story, and the moment it clicks, a chill runs down your spine, because you see how close the wrong path came.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Twilight Syndrome feeling of schoolgirls exploring a town's curses, choosing where to look and reading the place itself",
        "You want branching with multiple endings, where the path you take decides which truth you reach",
        "You want a free Japanese gem the West cannot read yet, buried under only 4 English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want fast action or a long campaign (this is a 4-to-5-hour exploration horror; note: ghost and curse horror imagery)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ミッドナイトシンドローム - 三人の少女が町の怪異を探索する、SUDA51 トワイライトシンドロームの無料の継承作、言語の壁で埋もれた和製ホラーADV",
      description: "三人の女子高生が、ひと夏の田舎町を蝕む噂と怪異を探索する無料の和製ホラーADV。分岐とマルチエンドを持ち、SUDA51 のトワイライトシンドロームの系譜に連なる。95レビュー98%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは4件)。",
      h1a: "三人の少女が怪異の町へ踏み込み、",
      h1flip: "出てこられる真実は一つ",
      h1b: "。",
      lede: "ただ見るだけのホラーじゃない。探索するホラーだ。三人の女子高生が、ひと夏の田舎町の噂・しきたり・怪異を掘り起こしていく——その先に待つのは、ただの怪談を遥かに超えた真実。分岐する選択、複数のエンディング、章ごとに作りを変える紛うことなき力作。日本のクリエイター ナツミカンによる無料の一本で、SUDA51 のトワイライトシンドロームの影で生まれた。日本では98%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "夏の夜、田舎の町、誰も確かめたくない噂を追う三人の女子高生。どこを探索するかの選択の一つ一つが糸で、どれは掘り起こさない方がいいかはまだ分からない。",
        "町は説明のないまま断片を落としていく。学校のしきたり、いなくなった少女、噂が隠していた何か。探索を続けるうち、土地の伝説と本物の怪異が同じものではと半ば感じはじめる。",
        "そして噛み合う。散らばった噂が、ただの怪談を遥かに超えた一つの真実へ収束する。カチッとはまった瞬間、ゾクッとくる——間違った道がどれだけ近くにあったかに気づいて。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "トワイライトシンドロームのように、女子高生が町の怪異を探索し、どこを見るかを選び、その場所そのものを読み解く感覚が好きな人",
        "進んだ道がどの真実に辿り着くかを決める、分岐とマルチエンドが欲しい人",
        "英語レビュー4件で西がまだ読めていない、無料の和製原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "速いアクションや長い物量が欲しい人(本作は4〜5時間の探索ホラー・注記:幽霊や呪いの怪異描写あり)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "sayonara-night-cap": {
    published: "2026-06-18",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "exploration-adv", lineage: "yume-nikki", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 60, positivePct: 91, noEnglish: true } },
    games: [
      {
        name_en: "Sayonara Night Cap",
        name_ja: "さよならナイト・キャップ",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2490020/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese point-and-click exploration ADV where you wake in a strange arcade, follow a mysterious girl, and explore a dream-logic world that explains nothing. Very Positive in Japan at 60 reviews and 91 percent, but with no English support, the West cannot read it yet (only 3 English reviews).",
        desc_ja: "見知らぬゲームセンターで目覚め、謎の少女に導かれ、夢の論理で動く世界を探索する和製クリックADV。60レビュー91%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは3件)。",
      },
      {
        name_en: "Yume Nikki",
        name_ja: "ゆめにっき",
        status: "established",
        steam: "https://store.steampowered.com/app/650700/Yume_Nikki/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of surreal dream exploration: no story and no dialogue, you just walk a girl's dream world and read your own meaning into it, made by KIKIYAMA in Japan. This gem inherits that spine, where you explore a world that runs on dream logic, nothing is solved, nothing is spelled out, and only the afterglow stays.",
        desc_ja: "不条理な夢探索の原点。物語も会話もなく、ただ少女の夢の世界を歩き、解釈を自分に委ねる。KIKIYAMA(日本)制作。この未発掘の名作はその背骨を継ぎ、夢の論理で動く世界を探索させる——何も解決せず、何も説明されず、ただ余韻だけが残る。",
      },
    ],
    en: {
      title: "Sayonara Night Cap - a buried surreal-exploration ADV where nothing is explained and the dream lingers, an heir to Yume Nikki, walled off by language",
      description: "A Japanese point-and-click exploration ADV where you wake in a strange arcade, follow a mysterious girl, and explore a dream-logic world that explains nothing. Very Positive in Japan at 60 reviews and 91 percent, but with no English support, the West cannot read it yet (only 3 English reviews).",
      h1a: "You wake in a strange world and ",
      h1flip: "nothing is explained",
      h1b: ".",
      lede: "Not a story handed to you. A dream you walk through. You wake in an unfamiliar arcade, a girl who knows you leads you on, and you click your way across a world that runs on dream logic. Nothing is solved, nothing is spelled out, and the afterglow stays with you like a dream you just woke from. A quiet Japanese indie in the lineage of Kikiyama's Yume Nikki. Loved in Japan at 91 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "You wake somewhere you do not know, with a girl who knows you, and the world offers no map and no reason. You just explore, clicking every corner.",
        "The world hands you fragments without explanation: an inhabitant who needs help, a hint toward the exit, a sight that makes no literal sense. You sense the meaning is yours to hold, not to be told.",
        "Then it ends without ever explaining itself. The instant the dream releases you and the quiet afterglow settles, a chill runs down your spine, and you keep asking what that was.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Yume Nikki feeling of exploring a dream world that explains nothing and leaves interpretation to you",
        "You want atmosphere and afterglow over clear answers, a piece that lingers for days",
        "You want a quiet Japanese gem the West cannot read yet, buried under only 3 English reviews",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want clear goals, fast action, or a story that ties every thread (this is slow surreal exploration that withholds answers on purpose)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "さよならナイト・キャップ - 何も明かされず夢の余韻だけが残る、ゆめにっきの系譜の埋もれた探索ADV、言語の壁で",
      description: "見知らぬゲームセンターで目覚め、謎の少女に導かれ、夢の論理で動く世界を探索する和製クリックADV。60レビュー91%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは3件)。",
      h1a: "見知らぬ世界で目覚めて、",
      h1flip: "何も明かされない",
      h1b: "。",
      lede: "渡される物語じゃない。歩く夢だ。見知らぬゲームセンターで目覚め、あなたを知る謎の少女に導かれ、夢の論理で動く世界をクリックで探索していく。何も解決せず、何も説明されず、夢から覚めた後のような余韻だけが残る。KIKIYAMA のゆめにっきの系譜に連なる、静かな和製インディー。日本では91%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "知らない場所で目を覚ます。隣にはあなたを知る少女。世界は地図も理由もくれない。ただ、隅々をクリックして探索する。",
        "世界は説明のないまま断片を落としていく。助けを求める住人、出口へのヒント、意味の通らない光景。意味は語られるものじゃなく、自分で抱えるものだと半ば感じる。",
        "そして、説明されないまま終わる。夢が解き放ち、静かな余韻が落ちた瞬間、ゾクッとくる——あれは何だったのか、と問い続けながら。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "ゆめにっきのように、何も説明しない夢の世界を探索し、解釈が自分に委ねられる感覚が好きな人",
        "明確な答えより、雰囲気と余韻が欲しい人——何日も尾を引く一本",
        "英語レビュー3件で西がまだ読めていない、静かな和製原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "明確な目標・速いアクション・全部の伏線を回収する物語が欲しい人(本作はあえて答えを伏せる、ゆっくりした不条理探索)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "kaiwa": {
    published: "2026-06-18",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "kamaitachi-no-yoru", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 59, positivePct: 96, noEnglish: true } },
    games: [
      {
        name_en: "Kaiwa",
        name_ja: "怪話",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2876880/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A free Japanese supernatural horror sound-novel of four interlinked ghost tales, with binaural sound that puts the dread right at your ear. From the Japanese doujin circle Horakai. Very Positive in Japan at 59 reviews and 96 percent, but with no English support, the West cannot read it yet (only 4 English reviews).",
        desc_ja: "四つの連作怪談からなる無料の和製心霊ホラー・サウンドノベル。バイノーラル音響が恐怖をすぐ耳元に置く。日本の同人サークル 法螺会 による一本。59レビュー96%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは4件)。",
      },
      {
        name_en: "Kamaitachi no Yoru",
        name_ja: "かまいたちの夜",
        status: "established",
        steam: "https://store.steampowered.com/app/2612660/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the sound novel: text, branching choices, and sound that pull you into a story of fear you cannot stop reading. This gem keeps that spine of pure text-and-sound dread, then moves it from suspense into interlinked ghost tales, with binaural audio that places the fear right beside your head.",
        desc_ja: "サウンドノベルの原点。文章と選択分岐と音で、止まれない恐怖の物語へ引き込む。この未発掘の名作はその文章と音だけで恐怖を組む背骨を保ったまま、サスペンスから連作怪談へ味をずらし、バイノーラル音響で恐怖を耳のすぐ脇に置く。",
      },
    ],
    en: {
      title: "Kaiwa - a buried Japanese horror sound-novel of true-tale dread, an heir to Kamaitachi no Yoru, walled off by language",
      description: "A free Japanese supernatural horror novel of four interlinked tales, with binaural sound that puts the dread right at your ear. Very Positive in Japan at 59 reviews and 96 percent, but with no English support, the West cannot read it yet (only 4 English reviews).",
      h1a: "Words and sound alone, and ",
      h1flip: "the dread is at your ear",
      h1b: ".",
      lede: "Not a horror you watch. One you read and hear. Four interlinked ghost tales unfold like short stories, and binaural sound places the fear right beside your head. A free doujin work from the Japanese circle Horakai, in the lineage of the sound-novel that started it all, Kamaitachi no Yoru. Loved in Japan at 96 percent, but it has no English yet, so the West cannot read it.",
      s1: "First, the one feeling",
      feeling: [
        "The page gives you only text and sound, no monster on screen, and that absence is exactly what tightens your chest.",
        "A tale builds quietly, then the binaural audio shifts a breath to just behind your ear, and the everyday turns wrong.",
        "When the four tales quietly connect and the last line lands, a chill runs down your spine, and you do not want to read on alone.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Kamaitachi no Yoru feeling of pure text-and-sound horror with no jump scares to lean on",
        "You want short interlinked ghost tales that build dread by what they withhold",
        "You want a free Japanese gem the West cannot read yet, buried by language",
      ],
      bad: [
        "You need an English-first release right now (no English yet, the wall is language only)",
        "You want action, exploration, or visible monsters rather than a quiet sound-novel you read at your own pace",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "怪話 - 言葉と音だけで恐怖を組む、かまいたちの夜の系譜の埋もれた和製心霊サウンドノベル、言語の壁で",
      description: "四つの連作からなる無料の和製心霊ホラーノベル。バイノーラル音響が恐怖を耳元に置く。59レビュー96%で日本では非常に好評なのに英語非対応で、西はまだ読めない(英語レビューは4件)。",
      h1a: "言葉と音だけで、",
      h1flip: "恐怖が耳元に来る",
      h1b: "。",
      lede: "見るホラーじゃない。読んで聴くホラーだ。四つの連作怪談が短編のように展開し、バイノーラル音響が恐怖をすぐ耳元に置く。日本の同人サークル 法螺会 による無料の一本で、サウンドノベルの祖 かまいたちの夜の系譜に連なる。日本では96%好評なのに英語非対応で、西はまだ読めない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "画面に怪物はいない。あるのは文章と音だけ。その不在こそが胸を締めつける。",
        "怪談が静かに積み上がり、バイノーラル音響が息遣いを耳のすぐ後ろへ移す。日常が、ふっとずれる。",
        "四つの話が静かに繋がり、最後の一行が落ちた瞬間、ゾクッとくる。もう一人では読み進めたくない。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "かまいたちの夜のように、ジャンプスケアに頼らない文章と音だけの恐怖が好きな人",
        "語らないことで恐怖を積む、短い連作怪談が欲しい人",
        "言語の壁で埋もれた、西がまだ読めない無料の和製原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語対応の完成品が欲しい人(英語は未対応・壁は言語だけ)",
        "アクションや探索や見える怪物が欲しい人(本作は自分のペースで読む静かなサウンドノベル)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "hangyaku-no-shugosha": {
    published: "2026-06-19",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "srpg", lineage: "fire-emblem-thracia-776", obscurity: "wall", reachState: "unreached_west", rarity: { reviews: 60, positivePct: 93 } },
    games: [
      {
        name_en: "Hangyaku no Shugosha",
        name_ja: "叛逆の守護者",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3441450/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A turn-based SRPG built around a capture system: you seize enemy weapons mid-battle and grow an armory of what you take. Over 50 recruitable allies, support conversations, class change, weapon fusion, and difficulty tiers from Casual to Abyss, across 50-plus chapters and 70-plus hours. Made solo by the Japanese developer Oborotsubame. Very Positive in Japan at 60 reviews and 93 percent, yet the West has barely found it: just one English review.",
        desc_ja: "捕獲システムを核に据えたターン制SRPG。戦闘中に敵の武器を奪い、奪った物で武器庫を育てる。50人を超える仲間、支援会話、クラスチェンジ、武器融合、カジュアルからアビスまでの多段難易度、50章超・70時間超。日本の個人開発者 朧燕(おぼろつばめ)による一本。60レビュー93%で日本では非常に好評なのに、西はまだほとんど見つけていない——英語レビューはわずか1件。",
      },
      {
        name_en: "Fire Emblem: Thracia 776",
        name_ja: "ファイアーエムブレム トラキア776",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Fire_Emblem:_Thracia_776",
        wikidata: "https://www.wikidata.org/wiki/Q2632064",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of capture in tactical RPGs: in 1999, Nintendo and Intelligent Systems let you take a unit prisoner mid-battle and strip the weapons they carried, turning a turn into a calculated heist. No official Steam release. This gem is a direct heir to that capture, declared by its creator as a Fire Emblem fan, and grows it into a whole armory you build from what you steal.",
        desc_ja: "タクティカルRPGにおける捕獲(キャプチャ)の原点。1999年、任天堂とインテリジェントシステムズが、戦闘中に敵ユニットを捕らえ持っていた武器を奪う——一手を計算ずくの強奪に変えるメカを生んだ。公式 Steam 版なし。この未発掘の名作はその捕獲の直系で、作者は自らを FE ファンと公言し、奪った物で武器庫を組み上げる遊びへと育てる。",
      },
    ],
    en: {
      title: "Hangyaku no Shugosha - a buried turn-based SRPG where you capture the enemy's weapons, an heir to Fire Emblem: Thracia 776",
      description: "A turn-based SRPG built on a capture system: seize enemy weapons mid-battle and build an armory from what you take. Over 50 allies, class change, weapon fusion, Casual to Abyss difficulty, 50-plus chapters. Very Positive in Japan at 60 reviews and 93 percent, yet the West has barely found it: just one English review. English is already supported.",
      h1a: "Don't beat them. ",
      h1flip: "Take what they carry",
      h1b: ".",
      lede: "A turn-based SRPG where the goal is not only to defeat a unit but to capture them and strip the weapon in their hand. Over 50 allies, support talks, class change, weapon fusion, difficulty from Casual to Abyss across 50-plus chapters. A solo work by the Japanese developer Oborotsubame, in the lineage of the SRPG that invented capture, Fire Emblem: Thracia 776. It already plays in English, yet the West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "An enemy raises a weapon you do not own, and the urge flips: you no longer want to kill them, you want to take it.",
        "So you weaken instead of finish, line up the capture, and walk away holding the thing that was just aimed at you.",
        "Every battle becomes a heist. The board fills with weapons you stole, and dropping a stronger foe to claim their blade sends a chill down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Fire Emblem and especially the Thracia 776 capture you could steal a unit and their gear",
        "You want a deep solo SRPG: 50-plus allies, class change, weapon fusion, 50-plus chapters",
        "You want a gem the West has not found yet, even though it already plays in English",
      ],
      bad: [
        "You want a short, breezy tactics game, not a 70-hour campaign with Abyss-tier difficulty",
        "You want big-studio polish and a marketing machine over a solo developer's labor of love",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "叛逆の守護者 - 敵の武器を捕獲する、ファイアーエムブレム トラキア776 の系譜の埋もれたターン制SRPG",
      description: "捕獲システムを核にしたターン制SRPG。戦闘中に敵の武器を奪い、奪った物で武器庫を組む。50人超の仲間、クラスチェンジ、武器融合、カジュアルからアビスまでの難易度、50章超。60レビュー93%で日本では非常に好評なのに、西はまだほとんど見つけていない——英語レビューは1件。英語対応済み。",
      h1a: "倒すな。",
      h1flip: "持っている物を奪え",
      h1b: "。",
      lede: "ターン制SRPG。目的は敵を倒すことだけじゃない。捕らえて、その手の武器を奪うことだ。50人超の仲間、支援会話、クラスチェンジ、武器融合、カジュアルからアビスまでの難易度、50章超。日本の個人開発者 朧燕(おぼろつばめ)による一本で、捕獲を生んだSRPG ファイアーエムブレム トラキア776 の系譜に連なる。英語でもう遊べるのに、西はまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "敵が、自分の持っていない武器を構える。その瞬間、欲求がひっくり返る——もう倒したくない、奪いたい。",
        "だから仕留めずに削り、捕獲の手を整え、さっき自分に向けられていた物を手に歩き去る。",
        "戦闘のすべてが強奪になる。盤面は奪った武器で埋まり、格上を落としてその刃を手にした瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "FE が好きで、特にトラキア776の、ユニットごと装備を奪える捕獲が好きな人",
        "50人超の仲間・クラスチェンジ・武器融合・50章超の、奥深い個人制作SRPGが欲しい人",
        "英語でもう遊べるのに西がまだ見つけてない原石を先に触りたい人",
      ],
      bad: [
        "アビス級の難易度と70時間級のキャンペーンより、短くて気軽な戦術ゲームが欲しい人",
        "個人開発者の労作より、大手の磨き込みと宣伝予算が欲しい人",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "dungeon-artifact": {
    published: "2026-06-19",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "deckbuilder", lineage: "into-the-breach", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 159, positivePct: 95 } },
    games: [
      {
        name_en: "DUNGEON ARTIFACT",
        name_ja: "ダンジョンアーティファクト",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2144220/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A roguelike deckbuilder where position is the core of strategy. Over 400 cards combine into combos, but many cards only hit a specific area, so where your character stands decides everything: you move to dodge attacks, charge up for a one-shot strike, and play cards that linger or nullify an enemy's action. Two protagonists, each with a different playstyle, descend into the dungeon. Made by the Japanese doujin circle ExertionGame. Very Positive in Japan at 159 reviews and 95 percent, yet the West has barely found it: only two English reviews. Note: this is an Early Access title, so it is not finished yet.",
        desc_ja: "位置取りが戦略の核になるローグライク・デッキ構築。400種類以上のカードがコンボに組み上がるが、多くのカードは特定の範囲にしか効かない——だからキャラクターがどこに立つかが全てを決める。移動して敵の攻撃を避け、力をためて一撃必殺を放ち、効果が持続するカードや敵の行動を無効化するカードを切る。それぞれ別のプレイスタイルを持つ2人の主人公からダンジョンに挑む。日本の同人サークル ExertionGame による一本。159レビュー95%で日本では非常に好評なのに、西はまだほとんど見つけていない——英語レビューはわずか2件。注: 本作は早期アクセス(Early Access)で、まだ完成していない。",
      },
      {
        name_en: "Into the Breach",
        name_ja: "Into the Breach",
        status: "established",
        steam: "https://store.steampowered.com/app/590380/Into_the_Breach/",
        wikidata: "https://www.wikidata.org/wiki/Q48729625",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of grid-positioning as the heart of tactics: in 2018, Subset Games built a run-based turn tactics game where where you stand on the grid is the whole strategy. This gem is a direct heir to that positioning, fusing it with Slay the Spire-style deckbuilding, so you place cards on a grid and fire them by where your character stands.",
        desc_ja: "グリッド上の位置取りこそ戦術の核という味の原点。2018年、Subset Games がマス目上のどこに立つかが戦略の全てになるラン構造型ターン制タクティクスを生んだ。この未発掘の名作はその位置取りの直系で、Slay the Spire 型のデッキ構築と融合させ、カードをマス目上で位置取りしてキャラクターの立ち位置で撃たせる。",
      },
    ],
    en: {
      title: "DUNGEON ARTIFACT - a buried roguelike deckbuilder where position is everything, an heir to Into the Breach",
      description: "A roguelike deckbuilder where position is the core of strategy: over 400 cards combine into combos, but many only hit a set area, so where you stand decides everything. Two protagonists, charge attacks, lingering cards. Very Positive in Japan at 159 reviews and 95 percent, yet only two English reviews. Note: this is an Early Access title, not finished yet.",
      h1a: "Don't just build the deck. ",
      h1flip: "Stand in the right place",
      h1b: ".",
      lede: "A roguelike deckbuilder where over 400 cards combine into combos, but many only land on a specific area, so where your character stands decides everything. You move to dodge attacks, charge up for a one-shot strike, and play cards that linger or nullify an enemy's action. Two protagonists, each a different playstyle. A doujin work by the Japanese circle ExertionGame, in the lineage of the tactics game that made grid positioning the whole strategy, Into the Breach. It already plays in English, yet the West has barely found it. It is still in Early Access, not finished, but already loved.",
      s1: "First, the one feeling",
      feeling: [
        "You stop thinking of cards as raw damage and start thinking in space: this card only hits that area, so your build means nothing until you stand in the right tile.",
        "So you read the board, slide your character into position, and stack cards that overlap on the same spot to spike one strike's multiplier far past what any single card could do.",
        "Then you charge it up and let the one-shot land where you placed it. When position and overlap line up and a charged combo erases a stronger foe, a chill runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Slay the Spire deckbuilding but want positioning, like Into the Breach, to be the real axis",
        "You like stacking area cards on one tile to spike a single charged strike's multiplier",
        "You want a Japanese doujin gem the West has barely read, with only two English reviews, even though it already plays in English",
      ],
      bad: [
        "You need a finished, content-complete release right now (this is Early Access, still unfinished)",
        "You want a pure card game where the deck alone decides it, with no positioning or dodging on a grid",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ダンジョンアーティファクト - 位置取りが全てを決める、Into the Breach の系譜の埋もれたローグライク・デッキ構築",
      description: "位置取りが戦略の核になるローグライク・デッキ構築。400種類以上のカードがコンボに組み上がるが、多くは特定の範囲にしか効かない——だからどこに立つかが全てを決める。2人の主人公、チャージ攻撃、持続カード。159レビュー95%で日本では非常に好評なのに英語レビューは2件。注: 本作は早期アクセスで、まだ完成していない。",
      h1a: "デッキを組むだけじゃない。",
      h1flip: "正しい位置に立て",
      h1b: "。",
      lede: "400種類以上のカードがコンボに組み上がるローグライク・デッキ構築。だが多くのカードは特定の範囲にしか効かない——だからキャラクターがどこに立つかが全てを決める。移動して敵の攻撃を避け、力をためて一撃必殺を放ち、効果が持続するカードや敵の行動を無効化するカードを切る。それぞれ別のプレイスタイルを持つ2人の主人公。日本の同人サークル ExertionGame による一本で、グリッドの位置取りを戦略の全てにしたタクティクス Into the Breach の系譜に連なる。英語でもう遊べるのに、西はまだほとんど見つけていない。まだ早期アクセスで未完成、それでももう愛されている。",
      s1: "まず、その一点の感覚",
      feeling: [
        "カードを「火力」でなく「空間」で考え始める。このカードはこの範囲にしか効かない——だから正しいマスに立つまで、組んだビルドは何の意味も持たない。",
        "だから盤面を読み、キャラクターを位置に滑り込ませ、同じマスに重なるカードを積んで、一発の倍率を単体カードでは届かない高みまで跳ね上げる。",
        "そして力をため、置いた場所へ一撃必殺を落とす。位置と重ね合わせが噛み合い、チャージしたコンボが格上を消し飛ばした瞬間、ゾクッとくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Slay the Spire のデッキ構築が好きで、Into the Breach のように位置取りこそ本当の軸にしたい人",
        "範囲カードを一つのマスに重ねて、チャージ一撃の倍率を跳ね上げるのが好きな人",
        "英語でもう遊べるのに英語レビュー2件で、西がまだほとんど読めていない日本の同人原石を掘りたい人",
      ],
      bad: [
        "今すぐ完成した、コンテンツ完備の一本が欲しい人(本作は早期アクセス・まだ未完成)",
        "位置取りやグリッド回避なしに、デッキだけで決まる純粋なカードゲームが欲しい人",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "eutolant-saga": {
    published: "2026-06-20",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "srpg", lineage: "fire-emblem-blazing-blade", obscurity: "wall", reachState: "unreached_west", reviewBand: "hundreds", rarity: { reviews: 104, positivePct: 93, noEnglish: true } },
    games: [
      {
        name_en: "Eutolant Saga",
        name_ja: "ユートラント戦記",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3470020/Eutolant_Saga/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A royal-road fantasy SRPG built to never let you give up. Turn-based battles play out without screen transitions for tempo, you field a party from over 40 recruitable allies among 120-plus unique characters, and stats grow randomly. When your growth stalls, a backup system raises your growth rates to catch you up, and special items help units who fall behind. There is no permadeath: a downed unit is not lost forever but temporarily withdraws and takes time to recover, so your training slows instead of ending. Weapons auto-repair after each chapter, support talks grant experience and stat bonuses, and you choose Normal (save anywhere) or Classic (no mid-battle saves). Made by the Japanese developer Oistar Games in SRPG Studio, in the lineage of GBA-era Fire Emblem. Very Positive in Japan at 104 reviews and 93 percent, yet the West has barely found it: just one English review. Note: it is Japanese-only, with no English support.",
        desc_ja: "挫折させないために作られた、王道ファンタジーSRPG。画面切替なしでテンポを保つターン制バトル、120人超の固有キャラのうち40人超の仲間からパーティを編成、ステータスはランダム成長。成長が停滞すると成長率を底上げして追いつかせる「バックアップ(救済)システム」が働き、苦戦するキャラには特殊アイテムが手を差し伸べる。パーマデスは無い——撃破されたユニットは永久ロストではなく一時的に離脱し、回復に時間がかかる。だから育成が終わるのではなく遅れるだけだ。武器は章終了後に自動修理、支援会話で経験値と能力ボーナス、途中セーブ可の「ノーマル」か途中セーブ不可の「クラシック」を選べる。日本の開発者 Oistar Games(おいすた)が SRPG Studio で作った、GBA時代のファイアーエムブレムの系譜の一本。104レビュー93%で日本では非常に好評なのに、西はまだほとんど見つけていない——英語レビューはわずか1件。注: 日本語のみで、英語は非対応。",
      },
      {
        name_en: "Fire Emblem: The Blazing Blade",
        name_ja: "ファイアーエムブレム 烈火の剣",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Fire_Emblem:_The_Blazing_Blade",
        wikidata: "https://www.wikidata.org/wiki/Q150180",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of GBA-era Fire Emblem: in 2003, Nintendo and Intelligent Systems shipped the first entry in the series to reach the West, defining the GBA-era feel of approachable tactics carried by story and the chemistry of its cast through support talks. No official Steam release. This gem is a direct heir to that feel, its clear-game reviews calling out the story structure and character banter of GBA-era Fire Emblem, and it grows that approachable line with backup and injury systems built so you never have to give up.",
        desc_ja: "GBA時代のファイアーエムブレムの原点。2003年、任天堂とインテリジェントシステムズが、シリーズで初めて西洋に届いた一本を世に出し、物語と、支援会話で描かれるキャラ同士の掛け合いが牽引する——遊びやすいタクティクスというGBA期FEの味を定義した。公式 Steam 版なし。この未発掘の名作はその味の直系で、クリア感想レビューはGBA時代のFEのストーリー構成とキャラの掛け合いを挙げる。そして救済システムと負傷システムで、挫折しなくていいよう作られた遊びやすさの路線を育てる。",
      },
    ],
    en: {
      title: "Eutolant Saga - a buried royal-road SRPG built to never let you give up, an heir to GBA-era Fire Emblem",
      description: "A royal-road fantasy SRPG built to never let you give up: no permadeath, a backup system that raises your growth rates when you stall, and a downed unit that withdraws to recover instead of being lost. Over 40 allies among 120-plus characters, Normal or Classic mode. Very Positive in Japan at 104 reviews and 93 percent, yet just one English review. Note: Japanese-only, no English support.",
      h1a: "A royal-road SRPG that ",
      h1flip: "refuses to let you give up",
      h1b: ".",
      lede: "A turn-based fantasy SRPG in the GBA-era Fire Emblem line, but built so you never have to reset and start over. No permadeath: a downed unit withdraws and takes time to heal, so training slows instead of dying. When your growth stalls, a backup system raises your rates to catch you up. Over 40 allies among 120-plus unique characters, support talks, Normal or Classic mode. A solo-feeling work by the Japanese developer Oistar Games in SRPG Studio. It is Japanese-only, so the West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "A unit you raised goes down, and the old SRPG dread hits: reload, redo the whole map. Then it does not. They only withdraw, and the run keeps going, so you stop save-scumming and start playing the board as it actually fell.",
        "Your favorite gets unlucky stat rolls and falls behind, and instead of benching them forever, the backup system quietly raises their growth so they climb back. The unit you love stays the unit you field.",
        "So the campaign becomes a long road you never abandon. You take the loss, recover, and push the next chapter, and when a stalled unit finally catches up and lands the turn that wins the map, a quiet warmth runs down your spine.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love GBA-era Fire Emblem, the story and the support-talk chemistry that carry approachable tactics",
        "You want a deep SRPG without the punishment: no permadeath, injury recovery instead of loss, and backup rates that catch up a stalled unit",
        "You want a gem the West has not found yet, buried under a Japanese-only wall and just one English review",
      ],
      bad: [
        "You want the hardcore, permadeath, every-loss-permanent line of Thracia 776, not a saga built to never let you give up",
        "You need to play in English right now (it is Japanese-only, the wall is language; future localization is undecided)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ユートラント戦記 - 挫折させないために作られた、GBA期ファイアーエムブレムの系譜の埋もれた王道SRPG",
      description: "挫折させないために作られた王道ファンタジーSRPG。パーマデス無し、成長停滞時に成長率を底上げする救済システム、撃破ユニットはロストではなく一時離脱して回復。120人超のキャラのうち40人超の仲間、ノーマルかクラシックを選択可。104レビュー93%で日本では非常に好評なのに英語レビューは1件。注: 日本語のみ、英語非対応。",
      h1a: "挫折を、",
      h1flip: "許さない王道SRPG",
      h1b: "。",
      lede: "GBA期ファイアーエムブレムの系譜に連なるターン制ファンタジーSRPG。でも、リセットしてやり直さなくていいよう作られている。パーマデス無し——撃破ユニットは一時離脱して回復に時間がかかる。だから育成は終わるのでなく遅れるだけ。成長が停滞すると、救済システムが成長率を底上げして追いつかせる。120人超の固有キャラのうち40人超の仲間、支援会話、ノーマルかクラシックを選択可。日本の開発者 Oistar Games(おいすた)が SRPG Studio で作った一本。日本語のみのため、西はまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "育てたユニットが倒れる。あの古いSRPGの恐怖がよぎる——リロードして、このマップを最初からやり直しだ。ところが、そうはならない。彼らはただ離脱するだけで、ランは続く。だからセーブ&ロードを繰り返すのをやめ、実際に落ちた盤面そのままで戦い始める。",
        "お気に入りが運の悪い成長を引いて遅れをとる。それでも永久にベンチに下げる代わりに、救済システムが静かにその成長を底上げして、また這い上がらせる。好きなユニットが、出し続けられるユニットのままでいる。",
        "だからキャンペーンは、決して投げ出さない長い道になる。負けを受け止め、回復させ、次の章を押し進める。停滞していたユニットがついに追いつき、マップを決める一手を放った瞬間、静かな温かさがゾクッと背筋を走る。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "GBA期ファイアーエムブレムの、物語と支援会話の掛け合いが牽引する遊びやすいタクティクスが好きな人",
        "罰のない奥深いSRPGが欲しい人——パーマデス無し、ロストでなく負傷回復、停滞ユニットを追いつかせる救済率",
        "日本語のみの壁と英語レビュー1件に埋もれた、西がまだ見つけてない原石を先に触りたい人",
      ],
      bad: [
        "挫折させないために作られた戦記より、トラキア776のような硬派でパーマデス、負けが全部永久の路線が欲しい人",
        "今すぐ英語で遊びたい人(本作は日本語のみ・壁は言語・将来のローカライズは未定)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "naribiki-mura": {
    published: "2026-06-20",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "exploration-horror", lineage: "fatal-frame", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 41, positivePct: 83 } },
    games: [
      {
        name_en: "NARIBIKIMURA",
        name_ja: "鳴蟇村",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2693860/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A first-person, single-player exploration horror set in a Japanese ghost village. A typhoon collapses a cliff and exposes a tunnel, and beyond it lies a village that is on no map: Naribikimura. You walk it on foot, gather clues, and unravel what happened to the place and the people who vanished. About 2 to 3 hours to clear. It also ships a Ruins Exploration mode that strips out the horror entirely, lets you change the time of day freely, and gives you a camera to photograph the abandoned buildings, so people who cannot take scares can still walk it. Built from real Japanese ruins and depopulated villages, and rooted in a Japanese net legend: in September 2000 a thread appeared on a huge message board claiming a landslide across Naribiki Pass had revealed something like a tunnel. Made by the Japanese indie studio DorsalFin Studio, who have built only Japan-set J-horror. Positive in Japan at 41 reviews and 83 percent, yet the West has barely found it: just four English reviews out of 41. English is already supported.",
        desc_ja: "日本の幽霊村を舞台にした、一人称視点・シングルプレイの探索ホラー。台風が崖を崩し、トンネルらしき物が現れる。その先にあるのは、どの地図にも載っていない村——鳴蟇村だ。足で歩き、手掛かりを集め、この場所と消えた人々に何が起きたのかを解き明かす。クリアは約2〜3時間。ホラー要素を完全に取り除いた「廃墟探索モード」も搭載し、時間帯を自由に変え、カメラで廃墟を撮影できる。だから怖いのが苦手な人でも歩ける。日本の実在の廃墟・廃村を参考に作られ、日本のネット怪談に根を持つ——2000年9月、ある巨大掲示板に「鳴蟇峠の対岸の崖が崩れてトンネルらしき物が見える」というスレが立った。日本のインディースタジオ DorsalFin Studio による一本で、彼らは一貫して日本を舞台にしたJホラーだけを作ってきた。41レビュー83%で日本では好評なのに、西はまだほとんど見つけていない——41件中、英語レビューはわずか4件。英語対応済み。",
      },
      {
        name_en: "Fatal Frame",
        name_ja: "零 -ZERO-",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Fatal_Frame_(video_game)",
        wikidata: "https://www.wikidata.org/wiki/Q2323933",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the cursed-Japanese-place exploration horror: in 2001, Tecmo built a first-person horror where you explore a cursed Japanese house and confront the dead through a camera, the Camera Obscura, and its sequel moved to a cursed, lost village. No official Steam release. This gem is a direct heir to that DNA, first-person dread in an abandoned Japanese place, a camera at the core of observing and recording, and an investigation into the buried truth of vanished people, only it makes that camera a tool of exploration rather than combat.",
        desc_ja: "呪われた日本の場所を一人称で探索するホラーの原点。2001年、テクモが、呪われた日本の屋敷を探索し、射影機というカメラで死者と対峙する一人称ホラーを生んだ。続編の舞台は、呪われ失われた村だった。公式 Steam 版なし。この未発掘の名作はそのDNAの直系——廃れた日本の場所での一人称の恐怖、観察と記録の核に据えられたカメラ、消えた人々の埋もれた真実の調査。ただし本作はそのカメラを、戦闘ではなく探索の道具にする。",
      },
    ],
    en: {
      title: "NARIBIKIMURA - a buried first-person exploration horror in a Japanese village on no map, an heir to Fatal Frame",
      description: "A first-person exploration horror set in a Japanese ghost village that is on no map. A collapsed cliff reveals a tunnel to Naribikimura; you gather clues and unravel what happened. About 2 to 3 hours, with a horror-free Ruins mode and a camera. Positive in Japan at 41 reviews and 83 percent, yet just four English reviews out of 41. English is already supported.",
      h1a: "A village on ",
      h1flip: "no map",
      h1b: ", waiting to be walked.",
      lede: "A first-person, single-player exploration horror. A typhoon collapses a cliff, a tunnel appears, and beyond it lies a village no map records: Naribikimura. You walk it on foot, gather clues, and unravel what happened to the place and the people who vanished. About 2 to 3 hours. It also ships a horror-free Ruins Exploration mode with free time-of-day and a camera, so people who cannot take scares can still walk it. A solo-feeling work by the Japanese studio DorsalFin Studio, in the lineage of the cursed-Japanese-place horror that put a camera at its core, Fatal Frame. It already plays in English, yet the West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "The map ends, the tunnel opens, and you step into a place that officially does not exist. Every house you enter is one more proof of a village the world forgot, and the urge to know why pulls you deeper.",
        "There is no combat to lean on, so reading the place is the whole act: you follow scattered clues through abandoned rooms, and the story of who vanished here assembles itself in your hands as you walk.",
        "And when the dread is too much, you flip to Ruins mode, change the hour to daylight, and raise the camera instead, so the same village becomes a place to photograph rather than fear. The fear and the quiet are the same walk, seen two ways.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Fatal Frame and the cursed-Japanese-place dread, a first-person walk through a place that should not exist",
        "You want a tight, story-led exploration horror you can finish in an evening, rooted in real Japanese ruins and a net legend",
        "You want a gem the West has not found yet, even though it already plays in English, with just four English reviews out of 41",
      ],
      bad: [
        "You want monster combat, weapons, or a Camera Obscura you fight ghosts with (this is exploration, not battle)",
        "You want a long, sprawling campaign rather than a focused 2-to-3-hour walk",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "鳴蟇村 - どの地図にも載っていない日本の村を歩く、零 -ZERO- の系譜の埋もれた一人称探索ホラー",
      description: "どの地図にも載っていない日本の幽霊村を舞台にした一人称探索ホラー。崩れた崖が現れたトンネルの先にある鳴蟇村で、手掛かりを集め何が起きたのかを解き明かす。約2〜3時間、ホラーを排した廃墟探索モードとカメラも搭載。41レビュー83%で日本では好評なのに、41件中英語レビューは4件。英語対応済み。",
      h1a: "どの地図にも、",
      h1flip: "載っていない村",
      h1b: "を歩く。",
      lede: "一人称視点・シングルプレイの探索ホラー。台風が崖を崩し、トンネルが現れる。その先にあるのは、どの地図にも載っていない村——鳴蟇村だ。足で歩き、手掛かりを集め、この場所と消えた人々に何が起きたのかを解き明かす。約2〜3時間。ホラーを排した廃墟探索モードも搭載し、時間帯を自由に変え、カメラを構えられる。だから怖いのが苦手な人でも歩ける。日本のスタジオ DorsalFin Studio による一本で、カメラを核に据えた、呪われた日本の場所のホラー 零 -ZERO- の系譜に連なる。英語でもう遊べるのに、西はまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "地図が途切れ、トンネルが開き、公式には存在しない場所へ足を踏み入れる。入る家の一軒一軒が、世界が忘れた村の証になり、「なぜ」を知りたい欲求が奥へと引き込む。",
        "頼れる戦闘はない。だから場所を読むことが、遊びそのものになる。廃れた部屋に散らばる手掛かりを辿るうち、ここで消えた者たちの物語が、歩く手の中で自ずと組み上がっていく。",
        "そして恐怖が過ぎたら、廃墟探索モードに切り替え、時間帯を昼に変え、代わりにカメラを構える。同じ村が、怯える場所ではなく撮る場所になる。恐怖と静けさは、二つの見方で歩く同じ一本だ。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "零 -ZERO- の、呪われた日本の場所の恐怖が好きな人——存在しないはずの場所を一人称で歩く",
        "実在の廃墟とネット怪談に根ざした、一晩で遊び切れる物語主導の探索ホラーが欲しい人",
        "英語でもう遊べるのに41件中英語レビュー4件で、西がまだ見つけてない原石を先に触りたい人",
      ],
      bad: [
        "モンスターとの戦闘や武器、霊と戦う射影機が欲しい人(本作は探索であり戦闘ではない)",
        "焦点を絞った2〜3時間の一本より、長大で広がりのあるキャンペーンが欲しい人",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "potato-flowers": {
    published: "2026-06-21",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "dungeon-rpg", lineage: "wizardry-proving-grounds", obscurity: "wall", reachState: "unreached_west", reviewBand: "hundreds", rarity: { reviews: 658, positivePct: 96 } },
    games: [
      {
        name_en: "Potato Flowers in Full Bloom",
        name_ja: "両手いっぱいに芋の花を",
        status: "hidden",
        steam: "https://store.steampowered.com/app/1601280/Potato_Flowers_in_Full_Bloom/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A first-person, grid-movement 3D dungeon RPG. You explore stone-walled underground labyrinths one tile at a time, then battles drop into a third-person, turn-based view where you read each enemy's intent icon and pick the right answer: guard, dodge, or strike. It is built so every single battle asks for the best possible choice, a stoic design with no slack. You raise a party of up to three across classes like Knight and Shaman with skill trees, customizing race and hair. There is no harsh punishment for losing: a defeat sends you back to camp with your progress kept, so you simply return with a new strategy, and a new recruit grows up in just two or three fights, cutting the grind of the Etrian Odyssey line. About 16 to 20 hours to clear, around 30 for 100 percent, across four labyrinths. Made by the Japanese solo-feeling indie Pon Pon Games and published by PLAYISM. Overwhelmingly Positive in Japan at 658 reviews and 96 percent, yet the West has barely found it: only 218 English reviews, repeatedly called underrated and a hidden gem. English is already supported.",
        desc_ja: "一人称視点・グリッド移動の3DダンジョンRPG。石壁で区切られた地下迷宮を1マスずつ探索し、戦闘になると三人称視点・ターン制に切り替わる——敵の行動アイコンを読み、ガード・回避・攻撃から最善の択を選ぶ。「全ての戦闘で最善択を求められる」、緩みのないストイックな設計だ。ナイトやシャーマンといったクラスとスキルツリーで最大3人のパーティを育て、種族や髪色もカスタムできる。負けても重い罰はない——死亡してもキャンプに戻り進行は保持され、別の戦略で挑み直すだけ。新キャラも2〜3戦闘で育ち、世界樹の迷宮系の育成コストを大幅に短縮する。クリアは約16〜20時間、100%で約30時間、迷宮は4つ。日本のインディー Pon Pon Games が作り、PLAYISM が発行した一本。658レビュー96%で日本では圧倒的に好評なのに、西はまだほとんど見つけていない——英語レビューは218件で、繰り返し「underrated(過小評価)」「hidden gem(隠れた名作)」と語られる。英語対応済み。",
      },
      {
        name_en: "Wizardry: Proving Grounds of the Mad Overlord",
        name_ja: "ウィザードリィ 狂王の試練場",
        status: "established",
        steam: "https://store.steampowered.com/app/2518960/Wizardry_Proving_Grounds_of_the_Mad_Overlord/",
        wikidata: "https://www.wikidata.org/wiki/Q1886140",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the first-person, grid party-based dungeon crawl: in 1981, Sir-Tech shipped the first party-based dungeon RPG on the Apple II, where you move through stone-walled labyrinths one grid tile at a time in first person, build and train a party, and descend toward the deepest floor. This gem is a direct heir to that core flavor, the first-person grid crawl and the party you raise, and the Etrian Odyssey line everyone knows sits downstream of it, while this one connects straight up to Wizardry itself.",
        desc_ja: "一人称・グリッド型のパーティ制ダンジョンクロウルの原点。1981年、Sir-Tech が Apple II で史上初のパーティ制ダンジョンRPGを世に出した——石壁で区切られた迷宮を一人称視点で1マスずつ進み、パーティを編成・育成して最下層を目指す。この未発掘の名作はその根幹の味の直系——一人称のグリッド探索と、育てるパーティ。誰もが知る世界樹の迷宮はその下流に位置するが、本作はウィザードリィそのものへ、まっすぐ上流へ連なる。",
      },
    ],
    en: {
      title: "Potato Flowers in Full Bloom - a buried first-person grid dungeon RPG where every battle demands the best choice, an heir to Wizardry",
      description: "A first-person, grid-movement 3D dungeon RPG. You explore stone-walled labyrinths one tile at a time, then battles turn turn-based, reading each enemy's intent icon to guard, dodge, or strike. Built so every battle demands the best choice, with no permadeath punishment and a low-grind party you raise. Overwhelmingly Positive in Japan at 658 reviews and 96 percent, yet only 218 English reviews. English is already supported.",
      h1a: "A dungeon where ",
      h1flip: "every battle demands the best choice",
      h1b: ".",
      lede: "A first-person, grid-movement 3D dungeon RPG. You walk stone-walled underground labyrinths one tile at a time, then battles drop into a third-person, turn-based view where you read each enemy's intent icon and answer it: guard, dodge, or strike. It is built so every single fight asks for the best possible choice, a stoic design with no slack. You raise a party of up to three across classes and skill trees, customizing race and hair. Losing is not punished: a defeat sends you back to camp with progress kept, so you return with a new plan, and new recruits grow up in just two or three fights. A solo-feeling work by the Japanese indie Pon Pon Games, published by PLAYISM, in the lineage of the first-person grid dungeon crawl, Wizardry. It already plays in English, yet the West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "Each battle puts the enemy's next move right in front of you as an intent icon, so combat stops being a damage race and becomes a reading puzzle: this attack is coming, so the one correct answer this turn is to guard, or dodge, or hit first.",
        "Because every fight is built to demand the best possible choice, you slow down and weigh each turn, and the labyrinth itself rewards the same care: you read the grid, solve its locks, and push your reach one stone wall further.",
        "And when you misread and fall, there is no spiral of loss: you wake at camp with your progress intact, rethink the answer, and walk back in. The stakes stay sharp while the dread stays low, so you keep choosing one more battle, one more floor.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the first-person grid dungeon crawl of Wizardry and Etrian Odyssey, walking stone labyrinths one tile at a time with a party you raise",
        "You want combat where every single battle demands the best choice, reading intent icons to guard, dodge, or strike, not a button-mash grind",
        "You want a gem the West has not found yet, Overwhelmingly Positive in Japan at 96 percent yet barely read abroad, even though it already plays in English",
      ],
      bad: [
        "You want a forgiving, low-stakes RPG you can autopilot, not a stoic design where every battle asks for the best possible move",
        "You want fast real-time action rather than first-person grid exploration and turn-based, read-and-answer battles",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "両手いっぱいに芋の花を - 全ての戦闘で最善択を求められる、ウィザードリィの系譜の埋もれた一人称グリッドダンジョンRPG",
      description: "一人称視点・グリッド移動の3DダンジョンRPG。石壁の迷宮を1マスずつ探索し、戦闘はターン制——敵の行動アイコンを読み、ガード・回避・攻撃を選ぶ。全ての戦闘で最善択を求められる設計で、パーマデスの罰はなく育成は低ストレス。658レビュー96%で日本では圧倒的に好評なのに英語レビューは218件。英語対応済み。",
      h1a: "全ての戦闘で、",
      h1flip: "最善の択を求められる迷宮",
      h1b: "。",
      lede: "一人称視点・グリッド移動の3DダンジョンRPG。石壁で区切られた地下迷宮を1マスずつ歩き、戦闘になると三人称視点・ターン制に切り替わる——敵の行動アイコンを読み、それに答える。ガードか、回避か、攻撃か。一戦一戦が最善の択を求めるよう作られた、緩みのないストイックな設計だ。クラスとスキルツリーで最大3人のパーティを育て、種族や髪色もカスタムできる。負けても罰はない——死亡してもキャンプに戻り進行は保持され、別の戦略で挑み直す。新キャラも2〜3戦闘で育つ。日本のインディー Pon Pon Games が作り、PLAYISM が発行した一本で、一人称グリッドのダンジョンクロウル ウィザードリィの系譜に連なる。英語でもう遊べるのに、西はまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "戦闘は、敵の次の手を行動アイコンとして目の前に置く。だから戦いは火力勝負ではなく「読みのパズル」になる——この攻撃が来る、ならこのターンの正解はガードか、回避か、先手の一撃か、ただ一つだ。",
        "一戦が最善の択を求めるよう作られているから、ペースを落として一手ごとを吟味する。迷宮そのものも同じ慎重さに応える——グリッドを読み、仕掛けを解き、届く範囲を石壁ひとつ分ずつ押し広げる。",
        "そして読み違えて倒れても、損失の連鎖はない。進行を保ったままキャンプで目覚め、答えを練り直し、また歩いて入っていく。緊張は鋭いまま、恐怖は低いまま。だから「もう一戦、もう一層」と選び続けてしまう。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "ウィザードリィや世界樹の迷宮の一人称グリッド探索が好きな人——石の迷宮を1マスずつ、育てたパーティで歩く",
        "ボタン連打の作業ではなく、一戦一戦が最善択を求める戦闘が欲しい人——行動アイコンを読み、ガード・回避・攻撃を選ぶ",
        "日本では96%で圧倒的に好評なのに海外ではほとんど読まれていない、英語でもう遊べるのに西がまだ見つけてない原石を掘りたい人",
      ],
      bad: [
        "一戦一戦が最善の手を求めるストイックな設計より、オートで流せる優しい低難度RPGが欲しい人",
        "一人称グリッド探索と、読んで答えるターン制戦闘より、速いリアルタイムアクションが欲しい人",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "woman-communication": {
    published: "2026-06-21",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "word-hunt-action", lineage: "nkodice", obscurity: "wall", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 802, positivePct: 99, noEnglish: true } },
    games: [
      {
        name_en: "Woman Communication",
        name_ja: "ウーマンコミュニケーション",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2095090/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A high-speed word-hunt action game wrapped in a school novel. As a public-morals committee member, you watch girls' everyday chatter stream across the screen as fast-scrolling text, and your job is to spot the dirty words that accidentally assemble themselves when you re-read the gaps between words, and shoot them down like a shooting game. The trick is the Japanese reading game of ginata-yomi: shift where one phrase is cut and an innocent line suddenly hides a filthy one. You are scored on how many you catch, how fast, and how accurately, across over 100 sensitive words, with branching multiple endings driven by how you act and a mosaic mode built for streamers. Because the whole game is the sound and syllable structure of Japanese itself, it is structurally near-impossible to localize. Made by the Japanese solo creator YAMADA (GameCreatorNeko). Overwhelmingly Positive in Japan at 802 reviews and 99 percent, yet the West has barely found it: only 18 English reviews out of 802, about 2 percent. There is no English version: the store supports Japanese only, so the language itself is the wall.",
        desc_ja: "学園ノベルに包まれた、高速「ことば探し」アクション。風紀委員として、女の子たちの日常会話が画面に文字列となって高速で流れていくのを見張り、語と語の区切りを読み替えると「うっかり出来上がってしまった淫語」を見つけ出し、シューティング感覚で撃ち抜くのが仕事だ。鍵は日本語の遊び——ぎなた読み。一つの言葉をどこで区切るかをずらすと、無害な一文に、突然いかがわしい一文が潜む。発見した数・速さ・正確さでスコアが付き、センシティブワードは100種以上、行動で分岐するマルチエンディングと、配信者向けのモザイク機能まで備える。日本語の語呂と音節構造そのものを遊ぶため、構造的にローカライズはほぼ不可能だ。日本の個人クリエイター YAMADA(げーむくりえいたーねこ)による一本。802レビュー99%で日本では圧倒的に好評なのに、西はまだほとんど見つけていない——802件中、英語レビューはわずか18件、約2%。英語版は存在しない。ストアは日本語のみ対応で、言語そのものが壁になっている。",
      },
      {
        name_en: "NKODICE",
        name_ja: "NKODICE(んこダイス)",
        status: "established",
        steam: "https://store.steampowered.com/app/1510950/NKODICE/",
        wikidata: "https://www.wikidata.org/wiki/Q109602270",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the accidental-dirty-word game: in 2021, the Japanese doujin creator ksym shipped a chinchiro-style dice game where the random faces of the dice keep assembling themselves, by sheer chance, into filthy Japanese words. This gem is a direct heir to that core idea, only it swaps the randomness of dice for the randomness of conversation: instead of dice faces lining up into a dirty word, it is everyday chatter that lines up into one, and your job is to hunt it.",
        desc_ja: "偶発的に淫語が出来上がる遊びの原点。2021年、日本の同人クリエイター ksym が、サイコロの出目がまったくの偶然でいかがわしい日本語の言葉に組み上がっていくチンチロ系ダイスゲームを世に出した。この未発掘の名作はその核となる発想の直系——ただしサイコロのランダム性を、会話のランダム性に置き換えた。出目が淫語に並ぶのではなく、日常会話が淫語に並ぶ。そしてそれを狩るのが、あなたの仕事になる。",
      },
    ],
    en: {
      title: "Woman Communication - a buried high-speed word-hunt action game you can only play in Japanese, an heir to NKODICE",
      description: "A high-speed word-hunt action game in a school novel. As a morals committee member, you watch girls' chatter scroll by and shoot down the dirty words that accidentally form when you re-read the gaps, ginata-yomi style. Over 100 sensitive words, branching endings, a streamer mosaic mode. Overwhelmingly Positive in Japan at 802 reviews and 99 percent, yet only 18 English reviews. Japanese only: the language is the wall.",
      h1a: "Read the gap between words, and ",
      h1flip: "shoot the dirty one that appears",
      h1b: ".",
      lede: "A high-speed word-hunt action game wrapped in a school novel. As a public-morals committee member, you watch girls' everyday chatter stream across the screen as fast-scrolling text, and you shoot down the dirty words that accidentally assemble themselves when you re-read where one phrase is cut, the Japanese reading game of ginata-yomi. You are scored on how many you catch, how fast, and how accurately, across over 100 sensitive words, with branching endings and a mosaic mode for streamers. A solo work by the Japanese creator YAMADA, in the lineage of the accidental-dirty-word game NKODICE. Because it plays the sound of Japanese itself, there is no English version, and the West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "The conversation never stops scrolling, so reading turns physical: your eyes race the text, and the moment two harmless words touch and a filthy one snaps into shape, your trigger finger already knows before your brain catches up.",
        "The catch is that the dirty word is never really there until you cut the line in the wrong place, so you are not reading what is written, you are hunting where it could break, ginata-yomi turned into a reflex.",
        "And every hit is scored on speed and accuracy at once, so you are pulled to read faster and aim cleaner on the same pass, and one perfect streak of catches makes you start the next conversation before you mean to.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the accidental-dirty-word idea of NKODICE and want it turned into a fast reflex hunt through scrolling conversation",
        "You enjoy Japanese wordplay, ginata-yomi and puns, and want a game built entirely on the sound and rhythm of the language",
        "You want a gem the West cannot reach, Overwhelmingly Positive in Japan at 99 percent with just 18 English reviews, because there is no English version at all",
      ],
      bad: [
        "You do not read Japanese: there is no English version, and the whole game is the sound of Japanese, so it cannot be localized",
        "You want explicit content rather than text-based innuendo and lewd words built from misread phrases (this is wordplay, not depiction)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ウーマンコミュニケーション - 日本語でしか遊べない、NKODICE の系譜の埋もれた高速「ことば探し」アクション",
      description: "学園ノベルに包まれた高速「ことば探し」アクション。風紀委員として女の子たちの会話が流れる中、語の区切りを読み替えると出来上がる淫語を、ぎなた読みで見つけて撃ち抜く。センシティブワード100種以上、マルチエンディング、配信者向けモザイク機能。802レビュー99%で日本では圧倒的に好評なのに英語レビューは18件。日本語のみ対応で、言語そのものが壁。",
      h1a: "言葉の区切りを読み替え、",
      h1flip: "現れた淫語を撃て",
      h1b: "。",
      lede: "学園ノベルに包まれた、高速「ことば探し」アクション。風紀委員として、女の子たちの日常会話が文字列となって画面を高速で流れていくのを見張り、一つの言葉をどこで区切るかをずらすと——ぎなた読みで——うっかり出来上がってしまう淫語を撃ち抜く。発見した数・速さ・正確さでスコアが付き、センシティブワードは100種以上、行動で分岐するマルチエンディングと、配信者向けのモザイク機能まで備える。日本の個人クリエイター YAMADA による一本で、偶発的に淫語が出来上がる遊びの原点 NKODICE の系譜に連なる。日本語の音そのものを遊ぶため英語版は存在せず、西はまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "会話は止まらず流れ続ける。だから「読む」ことが身体的になる——目が文字列を追い、無害な二語が触れ合って淫語が一瞬で形になった瞬間、脳が気づくより先に、引き金にかけた指が動いている。",
        "厄介なのは、その淫語は「間違った位置で区切る」まで本当はそこに無いということだ。だからあなたは書かれた文を読むのではなく、「どこで壊れうるか」を狩っている——ぎなた読みが、反射に変わる。",
        "そして全てのヒットは速さと正確さで同時に採点される。だから同じ一読みの中で、もっと速く読み、もっと綺麗に狙うことへ引き込まれる。気持ちいい連続ヒットを決めた瞬間、次の会話を、自分の意図より先に始めてしまう。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "NKODICE の「偶発的に淫語が出来上がる」発想が好きで、それが流れる会話を狩る速い反射ゲームになったものが欲しい人",
        "ぎなた読みや言葉遊び、語呂が好きで、言語の音とリズムそのものの上に組み上がったゲームが欲しい人",
        "英語版が一切ないからこそ西が届かない、99%で日本では圧倒的に好評なのに英語レビュー18件の原石を掘りたい人",
      ],
      bad: [
        "日本語が読めない人(英語版は存在せず、ゲーム全体が日本語の音そのものなのでローカライズできない)",
        "読み違えた言葉から組み上がるテキストの下ネタ・言葉遊びより、露骨な描写が欲しい人(本作は言葉遊びであり描写ではない)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "before-you-disappear": {
    published: "2026-06-22",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "higurashi", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 33, positivePct: 97, noEnglish: true } },
    games: [
      {
        name_en: "Before You Disappear",
        name_ja: "キミが消えてしまう前に",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3971860/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A romance-and-horror sound novel: a choice-driven ADV by the Japanese solo novel-game creator Nike. You transfer to a new school, wander into an abandoned schoolhouse, and find three girl ghosts who cannot pass on. You spend time with each of them, learn the regret that ties her to this place, and try to guide her toward being saved, which here means a parting. It is multi-ending: choose wrong and that heroine's spectral corruption advances, branching toward a harsh, grim bad end instead. Every character but the protagonist is fully voiced. Positive in Japan at 33 reviews and 97 percent, yet the West has not reached it at all: zero English reviews out of 33. There is no English version, the store supports Japanese only, so the language itself is the wall.",
        desc_ja: "恋愛とホラーのサウンドノベル。日本の個人ノベルゲーム作家・ニケによる、選択肢式のADVだ。転校先で迷い込んだ廃校で、成仏できずにいる3人の幽霊少女と出会う。それぞれと時間を重ね、この場所に縛りつける未練を解き、救済——つまり、別れへと導こうとする。マルチエンドで、選択を誤るとそのヒロインの霊化が進み、壮絶で凄惨なバッドエンドへと分岐していく。主人公以外はフルボイス。33レビュー97%で日本では好評なのに、西はまだ一切届いていない——33件中、英語レビューは0件。英語版は存在しない。ストアは日本語のみ対応で、言語そのものが壁になっている。",
      },
      {
        name_en: "Higurashi When They Cry",
        name_ja: "ひぐらしのなく頃に",
        status: "established",
        steam: "https://store.steampowered.com/app/310360/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the Japanese amateur horror sound novel that branches between tragedy and salvation: in 2002, the doujin circle 07th Expansion (Ryukishi07) shipped a sound novel in which the same days loop, small missteps spiral into gruesome violence, and only the right path reveals the truth and a way to save everyone. This gem is a direct heir to that DNA, a choice-driven horror sound novel where a wrong reading drives ruin and the right one earns rescue, only it pours that structure into a romance with ghost girls whose salvation is a goodbye. Its theme song is also sung by Yuzuki, who recorded a vocal version of you, one of Higurashi's signature pieces, so the bloodline shows in the music too.",
        desc_ja: "惨劇と救済の間で分岐する和製アマチュア恐怖サウンドノベルの原点。2002年、同人サークル07th Expansion(竜騎士07)が、同じ日々が繰り返され、わずかな食い違いが凄惨な暴力へと転がり落ち、正しい道だけが真相と全員を救う術を明かすサウンドノベルを世に出した。この未発掘の名作はそのDNAの直系——読み違えれば破滅へ、正しく読めば救済へと向かう選択分岐型の恐怖サウンドノベル。ただしその構造を、救済が別れになる幽霊少女との恋愛に注ぎ込んだ。本作の主題歌は、ひぐらしの代表曲『you』のボーカル版を歌った癒月が担当しており、音楽の面でも血統が表れている。",
      },
    ],
    en: {
      title: "Before You Disappear - a Japanese-only romance-and-horror sound novel where a wrong choice ruins her, an heir to Higurashi When They Cry",
      description: "A romance-and-horror sound novel by the Japanese solo creator Nike. You transfer to a new school, wander into an abandoned schoolhouse, and help three girl ghosts undo the regret that binds them, guiding each toward a salvation that is really a parting. Multi-ending: choose wrong and her spectral corruption advances toward a grim bad end. Every character but the protagonist is fully voiced. Positive in Japan at 33 reviews and 97 percent, yet zero English reviews. Japanese only: the language is the wall.",
      h1a: "Save her, and ",
      h1flip: "saving her means letting her go",
      h1b: ".",
      lede: "A romance-and-horror sound novel by the Japanese solo novel-game creator Nike. You transfer to a new school, wander into an abandoned schoolhouse, and find three girl ghosts who cannot pass on. You spend time with each, learn the regret that ties her here, and try to guide her toward being saved, which here means a goodbye. It is multi-ending, and choose wrong and her spectral corruption advances toward a harsh bad end instead. Every character but you is fully voiced. In the lineage of the branching tragedy-and-salvation horror sound novel Higurashi When They Cry. Japanese only, with zero English reviews, the West has not reached it.",
      s1: "First, the one feeling",
      feeling: [
        "Every line of dialogue is a fork you cannot un-pick, because a wrong reading does not just dead-end the route, it pushes her spectral corruption one step further, so you weigh each choice with the quiet dread that you might be the one ruining her.",
        "The goal is to save her, but salvation here is a parting, so the closer you grow the more it costs, and the warmth of getting through to a ghost and the ache of having to let her go are the same single act you cannot separate.",
        "Multiple endings and the threat of a grim bad end mean one playthrough is never enough: you go back to read the gap you misread, to reach the salvation you missed, and the pull to get it right for her one more time keeps you in the schoolhouse longer than you meant.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the branching horror sound novel where a wrong choice spirals into ruin and the right one earns salvation, the structure Higurashi When They Cry made, told here through ghost girls",
        "You want romance braided with horror, fully voiced for every character but the protagonist, where growing close to a ghost and having to say goodbye are the same act",
        "You want a gem the West has not reached at all, Positive in Japan at 97 percent with zero English reviews out of 33, because there is no English version",
      ],
      bad: [
        "You do not read Japanese: there is no English version and the store supports Japanese only, so the language itself is the wall",
        "You want a horror with monsters and combat, or a romance with a clean happy ending, rather than a quiet, choice-driven tale where salvation means parting",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "キミが消えてしまう前に - 選択を誤ると彼女が壊れる、日本語のみの恋愛ホラーサウンドノベル。ひぐらしのなく頃にの系譜",
      description: "日本の個人作家・ニケによる恋愛とホラーのサウンドノベル。転校先の廃校で、成仏できない3人の幽霊少女の未練を解き、救済——つまり別れへと導く。マルチエンドで、選択を誤ると霊化が進み壮絶なバッドエンドへ分岐する。主人公以外フルボイス。33レビュー97%で日本では好評なのに、英語レビューは0件。日本語のみ対応で、言語そのものが壁。",
      h1a: "彼女を救う、けれど",
      h1flip: "救うとは、別れること",
      h1b: "。",
      lede: "日本の個人ノベルゲーム作家・ニケによる、恋愛とホラーのサウンドノベル。転校先で迷い込んだ廃校で、成仏できずにいる3人の幽霊少女と出会う。それぞれと時間を重ね、この場所に縛りつける未練を解き、救済——つまり別れへと導こうとする。マルチエンドで、選択を誤るとそのヒロインの霊化が進み、壮絶なバッドエンドへ分岐していく。主人公以外はフルボイス。惨劇と救済の間で分岐する恐怖サウンドノベル、ひぐらしのなく頃にの系譜に連なる。日本語のみ対応で英語レビューは0件、西はまだ届いていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "一つ一つのセリフが、取り消せない分かれ道になる。読み違えると、その道が行き止まるだけでなく、彼女の霊化が一歩進んでしまうからだ。だから、自分こそが彼女を壊しているのかもしれない——その静かな恐れと共に、一つ一つの選択を量ることになる。",
        "目的は彼女を救うこと。でもここでの救済は、別れだ。だから近づくほど、その代償は大きくなる。幽霊に想いが通じる温かさと、手放さなければならない痛みは、切り離せない一つの行為になっている。",
        "マルチエンドと、凄惨なバッドエンドの脅威。だから一度の通しでは終われない。読み違えた隙間を読み直しに、見逃した救済へ届きに、また戻る。彼女のために、もう一度だけ正しく選びたい——その引力が、意図より長く廃校に留まらせる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "選択を誤れば破滅へ転がり、正しく選べば救済を得る——ひぐらしのなく頃にが作った分岐型恐怖サウンドノベルが好きで、それが幽霊少女で語られるものが欲しい人",
        "恋愛とホラーが編み合わさり、主人公以外フルボイスで、幽霊と心を通わせることと別れを告げることが同じ行為になる物語が欲しい人",
        "英語版が存在しないからこそ西がまだ一切届かない、97%で日本では好評なのに33件中英語レビュー0件の原石を掘りたい人",
      ],
      bad: [
        "日本語が読めない人(英語版は存在せず、ストアは日本語のみ対応なので、言語そのものが壁になる)",
        "怪物や戦闘のあるホラーや、すっきりしたハッピーエンドの恋愛が欲しい人(本作は救済が別れになる、静かな選択分岐の物語)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "sinking-paradise": {
    published: "2026-06-22",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "narcissu", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 5, positivePct: 100, noEnglish: true } },
    games: [
      {
        name_en: "Shizumeru Rakuen",
        name_ja: "沈める楽園",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2461130/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A multi-ending novel game that traces the last day of two girls who came to die. On a fictional island in Japan's Seto Inland Sea, two college students, Mio and Nagisa, have come to drown themselves, and at the start you choose whose eyes to see that day through. Conversation choices branch the ending, but one thing never changes: the girl dies. The path bends, the death does not. It includes a Chapter mode to re-read any scene and a Gallery mode to revisit the stills. Made by the Japanese solo doujin circle Sajinage-bu and published by the Japanese company Waku Waku Games. Priced at 700 yen, with an eight-track soundtrack sold separately. Positive in Japan at 5 reviews and 100 percent, yet the West has not reached it at all: zero English reviews out of 5. There is no English version and no official English title, the store supports Japanese only, so the language itself is the wall.",
        desc_ja: "死にに来た2人の少女の「最期の一日」を辿る、マルチエンディング型のノベルゲーム。瀬戸内海に浮かぶ架空の孤島・楽日島へ、投身自殺を図りに来た2人の女子大生、澪と渚。冒頭で、その一日を誰の視点で見るかを選ぶ。会話の選択肢でエンドは分岐するが、ただ一つだけ変わらないものがある——少女が死ぬ、という結末だ。道は曲がる、けれど死は曲がらない。任意の場面を読み返せるチャプターモードと、スチルを鑑賞できるギャラリーモードを備える。日本のひとりサークル「匙投げ部」が作り、日本の企業わくわくゲームズが発行した一本。価格700円、全8曲のサウンドトラックは別売。5レビュー100%で日本では好評なのに、西はまだ一切届いていない——5件中、英語レビューは0件。英語版も英語タイトルも存在しない。ストアは日本語のみ対応で、言語そのものが壁になっている。",
      },
      {
        name_en: "Narcissu",
        name_ja: "ナルキッソス",
        status: "established",
        steam: "https://store.steampowered.com/app/426690/Narcissu_10th_Anniversary_Anthology_Project/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the lyrical Japanese novel that meditates on death through the last days of someone about to die: in 2005, Tomo Kataoka and the doujin circle Stage-nana released a free visual novel about a terminally ill pair who leave the hospice to spend their final days on the road, with no miracles, no heroes, no villains, only a quiet road toward an end that does not change. This gem is a direct heir to that DNA, a low-priced, doujin-rooted novel that makes you weep through text and music about a girl who chooses death, where you select a viewpoint and trace a final day while the death itself stays fixed.",
        desc_ja: "死に向かう者の最期の日々を通して死を見つめる、叙情的な和製ノベルの原点。2005年、片岡ともと同人サークル「ステージ☆なな」が、余命わずかな2人がホスピスを抜け出し最期の日々を旅して過ごす——奇跡も、英雄も、悪役もなく、ただ変わらない終わりへ向かう静かな道だけがある——ノベルゲームを無料で世に出した。この未発掘の名作はそのDNAの直系——低価格・同人発で、自ら死を選ぶ少女をめぐってテキストと音楽で泣かせるノベル。視点を選び、最期の一日を辿るが、死そのものは動かない。",
      },
    ],
    en: {
      title: "Shizumeru Rakuen - a Japanese-only novel game that traces two girls' last day, where the death never changes, an heir to Narcissu",
      description: "A multi-ending novel game that traces the last day of two college girls who came to drown themselves on a fictional island in Japan's Seto Inland Sea. You choose whose eyes to see the day through; choices branch the ending, but the girl always dies. Chapter and Gallery modes, 700 yen, an eight-track soundtrack. Positive in Japan at 5 reviews and 100 percent, yet zero English reviews. Japanese only, with no English title: the language is the wall.",
      h1a: "Choose the path. ",
      h1flip: "The death never changes",
      h1b: ".",
      lede: "A multi-ending novel game that traces the last day of two college girls who came to die. On a fictional island in Japan's Seto Inland Sea, Mio and Nagisa have come to drown themselves, and you choose whose eyes to see that day through. Conversation choices branch the ending, but one thing never changes: the girl dies. The path bends, the death does not. It includes a Chapter mode to re-read scenes and a Gallery mode for the stills. A solo doujin work by the Japanese circle Sajinage-bu, published by Waku Waku Games, in the lineage of the lyrical Japanese novel that meditates on death through someone's final days, Narcissu. Japanese only, with no English title, the West has not reached it at all.",
      s1: "First, the one feeling",
      feeling: [
        "You pick whose eyes to live the last day through, so the same final day becomes a thing you inhabit rather than watch, and every line you read is read by someone you have chosen to be.",
        "Your choices visibly bend the route, which keeps you grasping for a way out, and that is the trap: the ending shifts, the death does not, so each branch only teaches you a new shape of the same loss.",
        "Knowing the death is fixed from the first choice does not lift the weight, it sharpens it: you stop playing to win and start playing to be there for the last day, and the Chapter and Gallery modes pull you back to read the moments you flinched from.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the lyrical death-and-mortality novel of Narcissu, a quiet last journey with no miracles, heroes, or villains, told here as two girls' final day",
        "You want a short, low-priced doujin novel that weeps through text and music, with a Chapter mode to re-read and a Gallery for the stills",
        "You want a gem the West has not reached at all, Positive in Japan at 100 percent with zero English reviews out of 5, because there is no English version",
      ],
      bad: [
        "You do not read Japanese: there is no English version and no English title, and the store supports Japanese only, so the language itself is the wall",
        "You want gameplay or a happy ending you can earn through good choices, rather than a quiet branching tale where the death is fixed no matter what you pick",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "沈める楽園 - 何を選んでも死は変わらない、2人の少女の最期の一日を辿る日本語のみのノベルゲーム。ナルキッソスの系譜",
      description: "瀬戸内海の架空島で投身自殺を図りに来た2人の女子大生の最期の一日を辿る、マルチエンディング型ノベルゲーム。誰の視点で見るかを選び、選択肢でエンドが分岐するが、少女が死ぬ結末は不変。チャプター・ギャラリーモード、700円、全8曲のサントラ別売。5レビュー100%で日本では好評なのに英語レビューは0件。日本語のみ対応で英語タイトルもなく、言語そのものが壁。",
      h1a: "道は選べる、けれど",
      h1flip: "死は、何を選んでも変わらない",
      h1b: "。",
      lede: "死にに来た2人の少女の最期の一日を辿る、マルチエンディング型のノベルゲーム。瀬戸内海に浮かぶ架空の孤島へ、投身自殺を図りに来た女子大生の澪と渚。その一日を誰の視点で見るかを選ぶ。会話の選択肢でエンドは分岐するが、ただ一つだけ変わらないものがある——少女が死ぬ、という結末だ。道は曲がる、けれど死は曲がらない。場面を読み返せるチャプターモードと、スチルを鑑賞できるギャラリーモードを備える。日本のひとりサークル「匙投げ部」による一本で、わくわくゲームズが発行し、誰かの最期の日々を通して死を見つめる叙情的な和製ノベル ナルキッソスの系譜に連なる。日本語のみ対応で英語タイトルもなく、西はまだ一切届いていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "最期の一日を、誰の視点で生きるかを選ぶ。だからその一日は「観る」ものではなく「宿る」ものになり、読む一行一行が、自分が選んだ誰かの目で読まれていく。",
        "選択は目に見えて道を曲げる。だから「逃げ道」を掴もうとしてしまう——それが罠だ。エンドは動くのに、死は動かない。どの分岐も、同じ喪失の別の形を教えるだけだ。",
        "最初の選択から死が決まっていると知っても、重さは軽くならない。むしろ研ぎ澄まされる。勝つために遊ぶのをやめ、最期の一日をそばにいるために遊び始める。チャプターとギャラリーが、目を背けた瞬間を読み返しに引き戻す。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "奇跡も英雄も悪役もない静かな最期の旅——ナルキッソスの叙情的な死生観のノベルが好きで、それが2人の少女の最期の一日で語られるものが欲しい人",
        "テキストと音楽で泣かせる、短く低価格な同人ノベルが欲しい人——読み返せるチャプターモードと、スチルのギャラリー付き",
        "英語版が存在しないからこそ西がまだ一切届かない、100%で日本では好評なのに5件中英語レビュー0件の原石を掘りたい人",
      ],
      bad: [
        "日本語が読めない人(英語版も英語タイトルも存在せず、ストアは日本語のみ対応なので、言語そのものが壁になる)",
        "ゲーム的な手応えや、良い選択で勝ち取るハッピーエンドが欲しい人(本作は何を選んでも死が決まっている、静かな選択分岐の物語)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "demigoddess": {
    published: "2026-06-23",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "strategy", lineage: "daisenryaku", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 112, positivePct: 97 } },
    games: [
      {
        name_en: "Demigoddess!",
        name_ja: "Demigoddess! 超種族になって無双する国取りSLG",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3281980/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A turn-based territory-conquest strategy game compressed into about an hour per run, made in Python by the Japanese solo developer Shirane Koma under the name SNP Engineering. A continent is split into 64 areas, and seizing 32 or more wins the run. A goddess grants you a cheat skill, and you become a demigod super-race that steamrolls the map: you customize with over 450 unit types, 20 distinct factions, and over 300 pieces of equipment, then set tactics on your units and let combat resolve automatically. Every run reshuffles the terrain, enemy placement, and resources hard, so it carries a roguelite drive to play it again. A free version is also distributed on the Japanese freeware site Freem. Positive in Japan at 112 reviews and 97 percent, and although the store supports five languages, the reviews are dominated by 63 in Japanese against only 17 in English, so the West has barely reached it.",
        desc_ja: "1プレイ約1時間に凝縮した、ターン制の国取りストラテジー。日本の個人開発者・白根こまが SNP Engineering 名義で Python で作った一本だ。大陸は64エリアに分割され、32エリア以上を支配すれば勝利。女神に授かるチートスキルで無双する超種族となり、450種以上のユニット・20の異なる勢力・300種以上の装備でカスタマイズし、ユニットに戦術を設定すると戦闘は自動で進行する。プレイ毎に地形・敵配置・資源が大幅にランダム変化するから、また回したくなるローグライト的な反復性を持つ。日本のフリーゲーム投稿サイト ふりーむ では無料版も配信されている。112レビュー97%で日本では好評で、ストアは5言語に対応しているものの、レビューは英語17件に対し日本語63件が主体——西はまだほとんど届いていない。",
      },
      {
        name_en: "Daisenryaku",
        name_ja: "大戦略",
        status: "established",
        homepage: "https://ja.wikipedia.org/wiki/%E5%A4%A7%E6%88%A6%E7%95%A5",
        wikidata: "https://www.wikidata.org/wiki/Q17229001",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the Japanese turn-based territory-conquest wargame: in 1985, SystemSoft launched Daisenryaku, a strategy game in which a map is divided into contested ground, you deploy and maneuver military units across it, and you win by conquering territory turn by turn. This gem is a direct heir to that DNA of area control, unit operations, and territorial conquest, only it distills that skeleton into a roguelite power fantasy: one run in about an hour, a map that reshuffles every time, and a goddess-granted cheat that lets you steamroll as a super-race. A modern doujin take on the conquest wargame.",
        desc_ja: "ターン制の国取りウォーゲームの、日本における元祖。1985年、システムソフトが大戦略を世に出した——マップを陣取りの領域に分け、戦闘ユニットを配置・運用し、ターンごとに領土を制圧して勝つ戦略ゲームだ。この未発掘の名作は、エリア戦・ユニット運用・領土制圧というそのDNAの直系——ただしその骨格を、1プレイ約1時間・毎回マップが変わる・女神のチートで超種族として無双する、というローグライト的なパワーファンタジーに凝縮した。国取りウォーゲームの、現代の同人版だ。",
      },
    ],
    en: {
      title: "Demigoddess! - a one-hour turn-based conquest strategy where a goddess's cheat lets you steamroll the map, an heir to Daisenryaku",
      description: "A turn-based territory-conquest strategy game compressed into about an hour per run, made in Python by the Japanese solo developer Shirane Koma (SNP Engineering). Seize 32 of a continent's 64 areas to win. A goddess grants a cheat skill and you become a demigod super-race, customizing with 450-plus units, 20 factions, and 300-plus pieces of equipment. Every run reshuffles terrain, enemies, and resources, roguelite-style. Positive in Japan at 112 reviews and 97 percent; multilingual, but the reviews skew Japanese (63) over English (17), so the West has barely reached it.",
      h1a: "A goddess hands you a cheat, and you ",
      h1flip: "steamroll the whole map in an hour",
      h1b: ".",
      lede: "A turn-based territory-conquest strategy game by the Japanese solo developer Shirane Koma, compressed into about an hour per run. A continent splits into 64 areas; seize 32 and you win. A goddess grants you a cheat skill and you become a demigod super-race, customizing across 450-plus units, 20 factions, and 300-plus pieces of equipment, then setting tactics and letting combat resolve itself. Every run reshuffles the terrain, enemy placement, and resources, so it pulls you back roguelite-style. In the lineage of Daisenryaku, the origin of the Japanese turn-based conquest wargame. Multilingual, but with the reviews dominated by Japanese over English, the West has barely reached it.",
      s1: "First, the one feeling",
      feeling: [
        "The goddess's cheat does not just nudge the odds, it tilts the whole board: you become a super-race that overruns enemies who should outmatch you, and that raw I-am-too-strong rush of watching a continent fold under you is the engine of the whole thing.",
        "A full conquest fits in about an hour, so you are never asked to commit a campaign's worth of evenings: one sitting is one whole rise from a single area to a thirty-two-area empire, and that clean arc is exactly what makes just one more run so easy to say.",
        "Every run hard-reshuffles the terrain, enemy placement, and resources, so the map you mastered last time is gone and the cheat that broke one layout has to be re-aimed at a new one, and that roguelite churn keeps the conquest fresh long after a fixed-map wargame would have run dry.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the turn-based territory-conquest wargame of Daisenryaku, area control and unit operations toward total conquest, distilled here into a one-hour run",
        "You want the unapologetic power fantasy of a goddess-granted cheat that turns you into a super-race steamrolling the board, with 450-plus units, 20 factions, and 300-plus pieces of equipment to build around",
        "You want a buried gem the West has barely reached, Positive in Japan at 97 percent across 112 reviews, dug out from a solo Python developer who shipped a free version on the Japanese site Freem",
      ],
      bad: [
        "You want a long, deliberate grand-strategy campaign that unfolds over many hours on a fixed map, rather than a one-hour run that reshuffles every time",
        "You want a tense, evenly matched fight, rather than a power fantasy where a goddess's cheat lets a super-race overrun the board",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Demigoddess! - 女神のチートで1時間でマップを無双する、ターン制の国取りストラテジー。大戦略の系譜",
      description: "日本の個人開発者・白根こま(SNP Engineering)が Python で作った、1プレイ約1時間のターン制国取りストラテジー。大陸64エリアのうち32エリアを支配すれば勝利。女神のチートスキルで無双する超種族となり、450種以上のユニット・20勢力・300種以上の装備でカスタマイズ。プレイ毎に地形・敵・資源が大幅変化するローグライト的反復。112レビュー97%で日本では好評。多言語対応だがレビューは英語17件に対し日本語63件が主体で、西はまだほとんど届いていない。",
      h1a: "女神がチートをくれて、",
      h1flip: "1時間でマップを無双する",
      h1b: "。",
      lede: "日本の個人開発者・白根こまによる、1プレイ約1時間に凝縮したターン制の国取りストラテジー。大陸は64エリアに分割され、32エリアを支配すれば勝利。女神に授かるチートスキルで無双する超種族となり、450種以上のユニット・20勢力・300種以上の装備でカスタマイズし、戦術を設定すれば戦闘は自動で進む。プレイ毎に地形・敵配置・資源が大幅にランダム変化するから、ローグライト的にまた引き戻される。ターン制の国取りウォーゲームの元祖、大戦略の系譜に連なる。多言語対応だが、レビューは英語より日本語が主体で、西はまだほとんど届いていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "女神のチートは、確率をちょっと傾けるだけじゃない。盤面そのものを傾ける。本来なら格上の敵を蹂躙する超種族になり、大陸が自分の前に崩れ落ちていく——その「俺が強すぎる」という純度の高い無双感が、すべての原動力になっている。",
        "一回の征服が約1時間に収まる。だから何夜分もの長期キャンペーンを背負わされない。一度の着席が、たった1エリアから32エリアの帝国まで駆け上がる、ひと続きの興隆になる。この綺麗な弧こそが「もう一回だけ」を言わせる。",
        "プレイ毎に地形・敵配置・資源が大幅に変わる。だから前回攻略したマップはもう無く、ある配置を壊したチートを、新しい配置へ当て直さなければならない。このローグライト的な攪拌が、固定マップのウォーゲームなら飽きていた頃にも、征服を新鮮なまま保つ。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "エリア戦とユニット運用で総制圧へ向かう、大戦略のターン制国取りウォーゲームが好きで、それが1プレイ1時間に凝縮されたものが欲しい人",
        "女神のチートで超種族となり盤面を蹂躙する、開き直ったパワーファンタジーが欲しい人——450種以上のユニット・20勢力・300種以上の装備を軸に組める",
        "97%・112レビューで日本では好評なのに西がまだほとんど届いていない原石を掘りたい人——個人開発者が Python で作り、ふりーむで無料版まで配信した一本",
      ],
      bad: [
        "固定マップ上で何時間もかけてじっくり展開する長大なグランドストラテジーが欲しい人(本作は毎回マップが変わる1時間のラン)",
        "互角の緊張した戦いが欲しい人(本作は女神のチートで超種族が盤面を蹂躙するパワーファンタジー)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "furikake-spacy": {
    published: "2026-06-23",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "visual-novel", lineage: "nantonaku-crystal", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 246, positivePct: 96, noEnglish: true } },
    games: [
      {
        name_en: "ふりかけ☆スペイシー (no official English title)",
        name_ja: "ふりかけ☆スペイシー",
        status: "hidden",
        steam: "https://store.steampowered.com/app/1764700/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A high-tempo Neo-Showa nonsense-gag novel told in cel-shaded illustration and animation, in the sound-novel form of a visual novel, made by the Japanese solo doujin creator Yonton Tomachin (developer and publisher both). Across seven episodes, roughly one anime cours, the cat-eared protagonist Saatan and a cast of crazed schoolgirls run riot through hell, outer space, the inside of a child's body, and other surreal worlds. Its core device is the Neo-Showa Dictionary, which annotates some 700 proper nouns to bury you in 1980s Japanese culture, packed with homage and parody of 80s anime, games, films, music, and celebrities, plus over thirty original BGM tracks and divination and wordplay mini-games. Very Positive in Japan at 246 reviews and 96 percent, but the West has barely reached it: the reviews are dominated by 189 in Japanese against only 5 in English. There is no English version (the store supports Japanese and Simplified Chinese only), and an 80s Japanese proper-noun parody is brutally hard to translate, so the language is the wall.",
        desc_ja: "セル画風のイラストとアニメで展開する、高テンポのネオ昭和ナンセンスギャグノベル。サウンドノベル形式のビジュアルノベルだ。日本のひとり同人作家・よんとんトマチンが、開発も販売も手がけた一本。全7エピソード(アニメ1クール相当)を通して、ブリ耳の主人公・さぁたんと狂気の女子高生たちが、地獄・宇宙・子どもの体内など、シュールな世界を大暴れする。核となる仕組みは「ネオ昭和辞典」——約700語の固有名詞を注釈で解説し、80年代日本の文化を浴びせてくる。80年代のアニメ・ゲーム・映画・音楽・芸能人へのオマージュとパロディが詰め込まれ、30曲超のオリジナルBGM、占いや言葉遊びのミニゲームまで備える。246レビュー96%で日本では非常に好評なのに、西はまだほとんど届いていない——レビューは英語5件に対し日本語189件が主体だ。英語版は存在せず(ストアは日本語と簡体字中国語のみ対応)、80年代日本の固有名詞パロディは翻訳難度が極端に高い。言語そのものが壁になっている。",
      },
      {
        name_en: "Nantonaku, Crystal",
        name_ja: "なんとなく、クリスタル",
        status: "established",
        homepage: "https://ja.wikipedia.org/wiki/%E3%81%AA%E3%82%93%E3%81%A8%E3%81%AA%E3%81%8F%E3%80%81%E3%82%AF%E3%83%AA%E3%82%B9%E3%82%BF%E3%83%AB",
        wikidata: "https://www.wikidata.org/wiki/Q11274657",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of capturing an era by drowning you in its proper nouns: in 1980, the writer Yasuo Tanaka published Nantonaku, Crystal, a novel that followed a fashion-model college student through her brand-saturated Tokyo days and annotated the real brands, shops, music, and trends it name-drops in 442 footnotes, turning the consumer culture of its moment into the substance of the work. It is a novel, not a game, so it has no Steam release. This gem is a direct heir to that DNA: the Neo-Showa Dictionary that annotates some 700 proper nouns to bathe you in 1980s culture is that same annotated style, only turned into a high-tempo nonsense-gag novel that makes the footnotes themselves the joke.",
        desc_ja: "固有名詞の洪水で同時代を切り取る系譜の原点。1980年、作家・田中康夫が なんとなく、クリスタル を世に出した——ファッションモデルの女子大生が東京のブランドに彩られた日常を生きる小説で、本文が名指しする実在のブランド・店・音楽・流行を442個の注釈で解説し、その時代の消費文化そのものを作品の実質に変えてみせた。これは小説であってゲームではない——ゆえに Steam 版はない。この未発掘の名作はそのDNAの直系——約700語の固有名詞を注釈で解説し80年代文化を浴びせる「ネオ昭和辞典」は、まさにその注釈スタイルそのもので、ただしそれを高テンポのナンセンスギャグノベルへ転化し、注釈それ自体を笑いに変えてみせる。",
      },
    ],
    en: {
      title: "Furikake Spacy - a high-tempo Neo-Showa nonsense-gag novel that buries you in 700 annotated 80s proper nouns, an heir to Nantonaku, Crystal",
      description: "A high-tempo Neo-Showa nonsense-gag novel in cel-shaded illustration and animation, the sound-novel form of a visual novel, by the Japanese solo doujin creator Yonton Tomachin. Across seven episodes, the cat-eared Saatan and crazed schoolgirls run riot through hell, space, and a child's body, while a Neo-Showa Dictionary annotates some 700 proper nouns to drown you in 1980s culture, with 30-plus original tracks and mini-games. Very Positive in Japan at 246 reviews and 96 percent, but with only 5 English reviews against 189 in Japanese, and no English version, the West has barely reached it.",
      h1a: "Seven hundred annotated 80s nouns, fired at you ",
      h1flip: "until the footnotes become the joke",
      h1b: ".",
      lede: "A high-tempo Neo-Showa nonsense-gag novel told in cel-shaded illustration and animation, the sound-novel form of a visual novel, by the Japanese solo doujin creator Yonton Tomachin. Across seven episodes, roughly one anime cours, the cat-eared protagonist Saatan and a cast of crazed schoolgirls run riot through hell, outer space, and the inside of a child's body. Its core device is the Neo-Showa Dictionary, which annotates some 700 proper nouns to bury you in 1980s Japanese culture, with 30-plus original BGM tracks and divination and wordplay mini-games. In the lineage of Nantonaku, Crystal, the 1980 novel that captured an era through 442 footnotes. There is no English version (the store supports Japanese and Simplified Chinese only), so the West has barely reached it.",
      s1: "First, the one feeling",
      feeling: [
        "The Neo-Showa Dictionary does not slow the comedy down, it is the comedy: 80s proper nouns get fired at you faster than you can place them, and every footnote you tap to catch up lands as its own punchline, so the act of reading the annotations becomes the gag itself.",
        "The pace never lets you set the controller down, because the cel-shaded illustration and animation keep flipping the scene, hell to outer space to the inside of a child's body, and the next absurd turn is always already on screen before you have finished laughing at the last.",
        "It does not ask you to know the 1980s, it floods you with it until you do: across seven episodes the homage and parody pile up so densely that you stop trying to catch every reference and just let the era wash over you, which is exactly the trap that keeps you reading one more annotation.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Nantonaku, Crystal idea of capturing an era through annotation, here turned into a high-tempo gag novel where a Neo-Showa Dictionary annotates some 700 proper nouns to drown you in 1980s culture",
        "You want dense, relentless nonsense comedy in cel-shaded illustration and animation, packed with homage and parody of 80s anime, games, films, music, and celebrities, plus 30-plus original tracks and mini-games",
        "You want a gem the West has barely reached, Very Positive in Japan at 96 percent across 246 reviews, with only 5 English reviews against 189 in Japanese because there is no English version",
      ],
      bad: [
        "You do not read Japanese: there is no English version, the store supports only Japanese and Simplified Chinese, and the comedy lives entirely in 80s Japanese proper nouns, so the language is the wall",
        "You want a structured story or gameplay challenge, rather than a relentless, plot-light barrage of nonsense gags and annotated 80s references",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ふりかけ☆スペイシー - 約700語の80年代固有名詞を注釈で浴びせる、高テンポのネオ昭和ナンセンスギャグノベル。なんとなく、クリスタルの系譜",
      description: "セル画風のイラストとアニメで展開する、高テンポのネオ昭和ナンセンスギャグノベル(サウンドノベル形式のビジュアルノベル)。日本のひとり同人作家・よんとんトマチン作。全7エピソードを通して、ブリ耳のさぁたんと狂気の女子高生たちが地獄・宇宙・子どもの体内を大暴れ。約700語の固有名詞を注釈する「ネオ昭和辞典」で80年代文化を浴びせ、30曲超のBGMとミニゲームを備える。246レビュー96%で日本では非常に好評なのに、英語レビューは5件で日本語189件が主体、英語版もなく西はまだほとんど届いていない。",
      h1a: "約700語の80年代固有名詞を浴びせ、",
      h1flip: "注釈そのものが笑いになるまで",
      h1b: "。",
      lede: "セル画風のイラストとアニメで展開する、高テンポのネオ昭和ナンセンスギャグノベル。サウンドノベル形式のビジュアルノベルだ。日本のひとり同人作家・よんとんトマチンが作った一本。全7エピソード(アニメ1クール相当)を通して、ブリ耳の主人公・さぁたんと狂気の女子高生たちが、地獄・宇宙・子どもの体内など、シュールな世界を大暴れする。核となる仕組みは「ネオ昭和辞典」——約700語の固有名詞を注釈で解説し、80年代日本の文化を浴びせてくる。30曲超のオリジナルBGM、占いや言葉遊びのミニゲームも備える。固有名詞の洪水で時代を切り取る なんとなく、クリスタル(1980)の系譜に連なる。英語版は存在せず(ストアは日本語と簡体字中国語のみ対応)、西はまだほとんど届いていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ネオ昭和辞典は、ギャグの足を引っ張るものじゃない。それ自体がギャグだ。80年代の固有名詞が、見て取れる速さを超えて浴びせられ、追いつくために叩く注釈の一つ一つが、それぞれオチとして着地する。だから「注釈を読む」という行為そのものが、ボケになる。",
        "テンポはコントローラーを置かせてくれない。セル画風のイラストとアニメが場面を次々ひっくり返し——地獄から宇宙へ、子どもの体内へ——直前のボケで笑い終わる前に、次の不条理がもう画面に出ているからだ。",
        "80年代を「知っていること」は求められない。知るまで浴びせてくる。全7エピソードを通してオマージュとパロディが濃密に積み上がり、やがて全部の元ネタを拾おうとするのをやめ、ただその時代に浸るようになる——それこそが「もう一つだけ注釈を」と読み続けさせる罠だ。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "注釈で時代を切り取る なんとなく、クリスタル の発想が好きで、それが高テンポのギャグノベルに転化されたものが欲しい人——約700語の固有名詞を注釈する「ネオ昭和辞典」で80年代文化を浴びせてくる",
        "セル画風のイラストとアニメで展開する、濃密で容赦のないナンセンスギャグが欲しい人——80年代のアニメ・ゲーム・映画・音楽・芸能人へのオマージュとパロディが詰まり、30曲超のBGMとミニゲーム付き",
        "96%・246レビューで日本では非常に好評なのに西がまだほとんど届いていない原石を掘りたい人——英語版が存在しないため、英語レビューは5件で日本語189件が主体",
      ],
      bad: [
        "日本語が読めない人(英語版は存在せず、ストアは日本語と簡体字中国語のみ対応で、笑いは80年代日本の固有名詞に丸ごと宿るため、言語そのものが壁になる)",
        "構成された物語やゲーム的な手応えが欲しい人(本作は筋を追うより、ナンセンスギャグと注釈された80年代ネタを浴び続ける一本)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "devil-connection": {
    published: "2026-06-24",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "affection-adv", lineage: "tokimeki-memorial", obscurity: "wall", reviewBand: "around_1k", reachState: "lang_walled", rarity: { reviews: 1842, positivePct: 99, noEnglish: true } },
    games: [
      {
        name_en: "DevilConnection",
        name_ja: "でびるコネクショん",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3054820/DevilConnection/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A choice-driven adventure about contracting a powerless little devil and summoning kemono characters across the world of Majirisia. You wield the devil's power, an Evil Eye search, to peer into each target's heart and read what stirs them, then pick one of two dialogue choices to raise their emotions and harvest the magical power that pours out. An affection-style emotion meter, multiple endings, and photo and collection elements wrap a dark-fantasy, dark-humor comedy tone. Made by the Japanese solo creator Bayachao under the name ChaoGames, self-published on Steam (a Switch port via PLAYISM is planned for 2026). In the lineage of the affection-parameter raising adventure that Tokimeki Memorial established, only it swaps romance for a devil's contract that harvests emotion as magic. Overwhelmingly Positive in Japan at 1,842 reviews and 99 percent, yet the West has barely found it: just 79 English reviews out of 1,842, and an English version does not exist yet (the store is Japanese-only). Note: English localization first arrives with the 2026 Switch version; on PC it is Japanese-only for now.",
        desc_ja: "力なき小悪魔と契約し、世界マジリシアにケモノたちを召喚していく、選択駆動のアドベンチャー。悪魔の力「邪眼サーチ」で相手の心を覗き、何が感情を揺らすのかを読み取り、二つの選択肢から一つを選んでその感情を高ぶらせ、あふれ出す魔力を収穫する。好感度型の感情メーター、マルチエンディング、写真・コレクション要素が、ダークファンタジー×ダークユーモアのコメディを包む。日本のひとりクリエイター ばやちゃお が ChaoGames 名義で作り、Steam で自主販売した一本(2026年に PLAYISM 経由の Switch 移植を予定)。好感度パラメータを選択で育てる育成型ADVを確立した ときめきメモリアル の系譜に連なる——ただし恋愛ではなく、悪魔契約で感情を魔力として収穫する捻りを加えている。1,842レビュー99%で日本では圧倒的に好評なのに、西はまだほとんど見つけていない——1,842件中、英語レビューはわずか79件で、英語版そのものがまだ存在しない(ストアは日本語のみ)。注: 英語ローカライズは2026年の Switch 版で初提供。PC では現状、日本語のみ。",
      },
      {
        name_en: "Tokimeki Memorial",
        name_ja: "ときめきメモリアル",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Tokimeki_Memorial",
        wikidata: "https://www.wikidata.org/wiki/Q1364574",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the affection-parameter raising adventure: in 1994, Konami built a dating sim where you read each girl's interests, then raise an affection parameter through dialogue choices and daily actions over a three-year calendar toward a confession. No official Steam release. This gem is a direct heir to that core, reading a target's heart and choosing how to speak to lift their emotions, only it makes the harvest a devil's magic rather than romance.",
        desc_ja: "好感度パラメータを選択で育てる育成型ADVの原点。1994年、コナミが、相手の興味を読み、3年間のカレンダーの中で選択肢や日々の行動を通して好感度パラメータを高め、告白を目指す恋愛シミュレーションを生んだ。公式 Steam 版なし。この未発掘の名作はその核の直系——相手の心を読み、どう語りかけるかを選んで感情を持ち上げる。ただし本作はその収穫を、恋愛ではなく悪魔の魔力にする。",
      },
    ],
    en: {
      title: "DevilConnection - a buried choice-driven ADV where you read a heart and stir its emotion to harvest magic, an heir to Tokimeki Memorial",
      description: "A choice-driven ADV: contract a little devil, summon kemono across Majirisia, and use an Evil Eye search to peer into each target's heart, then pick one of two lines to raise their emotion and harvest magic. An affection-style meter, multiple endings, dark-humor comedy. Overwhelmingly Positive in Japan at 1,842 reviews and 99 percent, yet just 79 English reviews and no English version yet (Japanese-only).",
      h1a: "Read the heart. ",
      h1flip: "Stir it. Harvest the magic",
      h1b: ".",
      lede: "A choice-driven adventure where you contract a powerless little devil and summon kemono characters across the world of Majirisia. You wield the devil's Evil Eye search to peer into each target's heart, read what moves them, then pick one of two dialogue choices to raise their emotion and harvest the magic that pours out. An affection-style emotion meter, multiple endings, a dark-fantasy, dark-humor tone. A solo-feeling work by the Japanese creator Bayachao as ChaoGames, in the lineage of the affection-parameter raising adventure Tokimeki Memorial. An English version does not exist yet, so the West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "The Evil Eye opens and a target's heart lies bare in front of you, so you stop guessing and start reading: this is what moves them, this is the soft spot, and the next thing you say is no longer a gamble but an aimed shot.",
        "Two lines appear, and you weigh them not for romance but for leverage, picking the one that will spike their emotion highest, because the higher you lift it the more magic pours out when it breaks.",
        "And when the read is right and the choice lands, the meter surges and the harvest hits, a dark little thrill of having seen straight through someone and turned their feeling into power. Then the next target waits, and you want to read them too.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the read-the-heart, raise-the-meter core of Tokimeki Memorial, but want it twisted into a devil's contract that harvests emotion as magic",
        "You want a choice-driven ADV with a dark-fantasy, dark-humor tone, an affection-style emotion meter, multiple endings, and kemono characters to collect",
        "You want a gem the West has not found yet, Overwhelmingly Positive in Japan at 99 percent yet only 79 English reviews out of 1,842",
      ],
      bad: [
        "You need to play in English right now (an English version does not exist yet; the store is Japanese-only, and English localization first arrives with the 2026 Switch version)",
        "You want a straight romance dating sim rather than a dark-humor comedy where you harvest emotion as a devil's magic",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "でびるコネクショん - 相手の心を読み、感情を高ぶらせて魔力を収穫する、ときめきメモリアルの系譜の埋もれた選択駆動ADV",
      description: "選択駆動のADV。小悪魔と契約し、マジリシアにケモノを召喚し、「邪眼サーチ」で相手の心を覗き、二択の片方を選んで感情を高ぶらせ魔力を収穫する。好感度型の感情メーター、マルチエンディング、ダークユーモアのコメディ。1,842レビュー99%で日本では圧倒的に好評なのに英語レビューは79件、英語版はまだ存在しない(日本語のみ)。",
      h1a: "心を読み、",
      h1flip: "感情を高ぶらせ、魔力を収穫する",
      h1b: "。",
      lede: "力なき小悪魔と契約し、世界マジリシアにケモノたちを召喚していく、選択駆動のアドベンチャー。悪魔の「邪眼サーチ」で相手の心を覗き、何が感情を動かすのかを読み取り、二つの選択肢から一つを選んでその感情を高ぶらせ、あふれ出す魔力を収穫する。好感度型の感情メーター、マルチエンディング、ダークファンタジー×ダークユーモアの空気。日本のクリエイター ばやちゃお が ChaoGames 名義で作った一本で、好感度パラメータを育てる育成型ADV ときめきメモリアル の系譜に連なる。英語版がまだ存在しないため、西はまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "邪眼が開き、相手の心が目の前にむき出しになる。だから当て推量をやめ、読み始める——これが心を動かすもの、これが弱点だ。次に放つ一言は、もう賭けではなく、狙いを定めた一撃になる。",
        "二つの台詞が現れる。恋のためではなく、てこの力として吟味する——感情を最も高く跳ね上げる方を選ぶ。高く持ち上げるほど、それが弾けたとき、あふれ出す魔力が多くなるからだ。",
        "そして読みが当たり、選択が刺さると、メーターが跳ね、収穫が来る。相手を見透かし、その感情を力に変えた——背徳的な小さな高揚。すると次の相手が待っていて、その心も読みたくなる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "ときめきメモリアルの「心を読み、メーターを高める」核が好きで、それが悪魔契約で感情を魔力として収穫する形に捻られたものが欲しい人",
        "ダークファンタジー×ダークユーモアの空気、好感度型の感情メーター、マルチエンディング、集めたくなるケモノたちを備えた選択駆動ADVが欲しい人",
        "日本では99%で圧倒的に好評なのに1,842件中英語レビュー79件で、西がまだ見つけてない原石を先に触りたい人",
      ],
      bad: [
        "今すぐ英語で遊びたい人(英語版はまだ存在せず・ストアは日本語のみ・英語ローカライズは2026年の Switch 版で初提供)",
        "悪魔の魔力として感情を収穫するダークユーモアのコメディより、まっすぐな恋愛シミュレーションが欲しい人",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "devil-blade-reboot": {
    published: "2026-06-24",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "shoot-em-up", lineage: "devil-blade", obscurity: "deep", reviewBand: "hundreds", rarity: { reviews: 822, positivePct: 98, noEnglish: false } },
    games: [
      {
        name_en: "DEVIL BLADE REBOOT",
        name_ja: "DEVIL BLADE REBOOT",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2882440/DEVIL_BLADE_REBOOT/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A vertical-scrolling bullet-hell shooter, hand-drawn in pixel art yet pushed into a pseudo-3D rush with multi-layered scrolling and zooms. Two shot types plus a bomb, and the signature Berserk System: the closer you destroy enemies at point-blank range, the higher the difficulty and the score climb, a risk-and-reward design that rewards aggression with an arcade score-chase you cannot stop running back into. Six story stages with stage select, four difficulty levels, a Retro Mode that reproduces the 1996 original, Steam leaderboards and achievements, and unlocks. Made by the Japanese solo creator Shigatake (Takehiro Shiga), a founding member and illustrator of Vanillaware, who spent six and a half years finishing it alongside his day job as a personal doujin project under the SHIGATAKE GAMES label. It is the full remake of his own 1996 doujin shooter, originally built with the PlayStation tool Dezaemon Plus and distributed only in Japan. Overwhelmingly Positive at 822 reviews and 98 percent. It already plays in English (461 of those reviews are English) and the Western shmup scene has begun to notice it, but to the wider world it is still a near-unknown original.",
        desc_ja: "縦スクロールの弾幕シューティング。ドット絵でありながら、多重スクロールと拡大縮小で擬似3Dの没入感へ押し上げる独自の見せ方。2種のショットとボム、そしてシグネチャの「Berserk System(狂化システム)」——敵に至近距離で接近して破壊するほど、難度もスコアも跳ね上がる。攻めるほど報われるリスク・リワード設計が、何度でも戻ってきてしまうアーケード型スコアチェイスを生む。ステージセレクト付きのストーリー6面、難度4段階、1996年の原作を再現するレトロモード、Steamランキング/実績、アンロック要素。日本のひとりクリエイター しがたけ(Takehiro Shiga・Vanillaware の創設メンバー/イラストレーター)が、本職の傍ら6年半かけて完成させた、SHIGATAKE GAMES 名義の個人制作の同人作。本人が1996年に PS1 の同人STG制作ツール「デザエモンプラス」で作り日本国内のみで頒布した同人シューティングの、全面リメイクである。822レビュー98%で圧倒的に好評。英語でもう遊べて(うち461件が英語レビュー)、西の弾幕シューターたちも気づき始めているが、広い世界にとってはまだほとんど知られていない原石だ。",
      },
      {
        name_en: "Devil Blade",
        name_ja: "Devil Blade",
        status: "established",
        steam: "https://store.steampowered.com/app/2882440/DEVIL_BLADE_REBOOT/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: in 1996, Shigatake built a vertical-scrolling shooter with Dezaemon Plus, the PlayStation game-creation tool for making one's own shooters, and it was distributed only in Japan as a doujin work. Born from the Dezaemon movement in which players shared self-made shooters on memory cards, it carried the Japanese arcade-and-doujin shooter's core thrill of hugging your ship as close to the enemy as you dare to drive the score. The 1996 original has no surviving distribution, so its only available form today is REBOOT itself, the creator's own full remake, which reproduces it in a Retro Mode. This gem is a direct heir to that taste, and its Berserk System sharpens the close-range score-chase into the whole point.",
        desc_ja: "この味の原点。1996年、しがたけ が PS1 の同人STG制作ツール「デザエモンプラス」で縦スクロール・シューティングを作り、同人作品として日本国内のみで頒布した。プレイヤーが自作シューティングをメモリーカードで共有しあう「Dezaemonムーブメント」から生まれ、「自機をどこまで敵に寄せられるかでスコアを伸ばす」という和製アーケード/同人シューの核の快感を担った。1996年の原作は現存する流通物が無く、今日唯一入手できる形は、作者本人の全面リメイクである REBOOT そのもの(レトロモードで原作を再現)である。この未発掘の名作はその味の直系で、「Berserk System」が至近距離のスコアチェイスを核そのものへと研ぎ澄ます。",
      },
    ],
    en: {
      title: "DEVIL BLADE REBOOT - a buried bullet-hell shooter where hugging the enemy at point-blank drives the score, an heir to the 1996 doujin original Devil Blade",
      description: "A vertical bullet-hell shooter, pixel-art pushed into a pseudo-3D rush. The Berserk System makes destroying enemies at point-blank spike both difficulty and score, an arcade score-chase you cannot stop. Six stages, four difficulties, a Retro Mode of the 1996 original. By Vanillaware artist Shigatake, six and a half years solo. Overwhelmingly Positive at 822 reviews and 98 percent; it plays in English, yet to the wider world it is still a near-unknown original.",
      h1a: "Don't dodge the enemy. ",
      h1flip: "Hug it, and the score erupts",
      h1b: ".",
      lede: "A vertical-scrolling bullet-hell shooter, hand-drawn in pixel art yet pushed into a pseudo-3D rush with multi-layered scrolling and zooms. Two shots and a bomb, and the signature Berserk System: the closer you destroy enemies at point-blank range, the higher the difficulty and the score climb. A solo doujin work by the Vanillaware artist Shigatake, six and a half years in the making, a full remake of his own 1996 Dezaemon Plus shooter. It already plays in English, but to the wider world it is still a near-unknown original.",
      s1: "First, the one feeling",
      feeling: [
        "The safe instinct of every shooter is to keep your distance, but here the score lives in the danger zone, so you stop fleeing the enemy and start steering straight into its face.",
        "As you destroy them at point-blank the Berserk System bites: the difficulty and the score both spike together, so every meter you close is paid for in risk and rewarded in points, and you feel the multiplier breathing with how brave you are.",
        "Then a wave breaks apart inches from your ship, the score erupts, and the line between dying and topping the board collapses into one held breath. The run ends, the leaderboard taunts you, and you reach for one more.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love arcade vertical shooters where the score lives in the danger zone, and you want a system, Berserk, that pays you for hugging the enemy at point-blank",
        "You want a pixel-art shooter pushed into a pseudo-3D rush, with a Retro Mode that reproduces a 1996 doujin original, four difficulties, and Steam leaderboards to chase",
        "You want a Japanese solo-made gem the wider world has barely noticed, Overwhelmingly Positive at 98 percent, made by a Vanillaware artist over six and a half years",
      ],
      bad: [
        "You want a slow, safe shooter where keeping your distance is the right play, not one built to reward flying into point-blank range",
        "You expect a big-studio, big-budget production rather than a one-person doujin remake of a 1996 amateur shooter",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "DEVIL BLADE REBOOT - 至近距離で敵に寄るほどスコアが跳ねる、1996年の同人原作 Devil Blade の系譜の埋もれた弾幕シューティング",
      description: "縦スクロールの弾幕シューティング。ドット絵を擬似3Dの没入感へ押し上げる。「Berserk System」で敵を至近距離破壊するほど難度もスコアも跳ね上がる、止まれないアーケード型スコアチェイス。6面、難度4段階、1996年原作のレトロモード。Vanillaware のしがたけが6年半かけて個人制作。822レビュー98%で圧倒的に好評。英語でもう遊べるが、広い世界にとってはまだほとんど知られていない原石。",
      h1a: "敵を避けるな。",
      h1flip: "寄れ、スコアが噴き上がる",
      h1b: "。",
      lede: "縦スクロールの弾幕シューティング。ドット絵でありながら、多重スクロールと拡大縮小で擬似3Dの没入感へ押し上げる独自の見せ方。2種のショットとボム、そしてシグネチャの「Berserk System(狂化システム)」——敵に至近距離で接近して破壊するほど、難度もスコアも跳ね上がる。Vanillaware のアーティスト しがたけ が6年半かけてひとりで作り上げた同人作で、本人の1996年「デザエモンプラス」製シューティングの全面リメイク。英語でもう遊べるが、広い世界にとってはまだほとんど知られていない原石だ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "どんなシューティングでも安全な本能は「距離を取れ」だ。だがここでは、スコアは危険地帯にこそ宿る。だから敵から逃げるのをやめ、その顔面へまっすぐ突っ込み始める。",
        "至近距離で破壊するほど Berserk System が牙を剥く——難度もスコアも一緒に跳ね上がる。だから詰めた一メートルごとにリスクを支払い、点で報われる。倍率が、自分の勇気と一緒に呼吸しているのを感じる。",
        "そして敵の波が自機の数センチ手前で砕け散り、スコアが噴き上がり、「死ぬ」と「ランキング首位」の境界線が、ひとつの止めた息に溶ける。ランが終わり、ランキングが挑発してくる。そして手は、もう一回へ伸びる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "スコアが危険地帯にこそ宿るアーケード縦シューが好きで、至近距離で敵に寄るほど報われる仕組み「Berserk System」が欲しい人",
        "ドット絵を擬似3Dの没入感へ押し上げたシューティングが欲しい人——1996年の同人原作を再現するレトロモード、難度4段階、追いかけるべき Steam ランキング付き",
        "広い世界がまだほとんど気づいていない日本の個人制作の原石が欲しい人——98%で圧倒的に好評、Vanillaware のアーティストが6年半かけて作った一本",
      ],
      bad: [
        "距離を取るのが正解の、ゆっくり安全なシューティングが欲しい人(本作は至近距離へ飛び込むほど報われるよう作られている)",
        "1人の同人作家による1996年アマチュアシューティングのリメイクではなく、大手スタジオの大型予算作を期待する人",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "mirage-feathers": {
    published: "2026-06-25",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "rail-shooter", lineage: "after-burner", obscurity: "deep", reviewBand: "around_1k", rarity: { reviews: 2504, positivePct: 98, noEnglish: false } },
    games: [
      {
        name_en: "Mirage Feathers",
        name_ja: "ミラージュフェザーズ",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2719060/Mirage_Feathers/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "An anime-styled pseudo-3D on-rails shooter of fast-tempo aerial combat, played from behind your craft. Its core is an advanced fire-control system: any target that crosses your crosshair is auto-locked, and then homing attacks pour into every locked enemy at once, so the loop is not about dodging but about sweeping your sights across a wave and erasing all of it in a single offensive burst. Variable weapon loadouts, an OVERDRIVE power-burst mode, wave-based enemy assaults, a Story Mode and an Endless Mode, adjustable difficulty, Steam leaderboards, achievements, and trading cards. The developer self-describes it as a very faster version of After Burner II, and players cite After Burner and Sky Target. Made by the Japanese solo/small indie self-publisher oyasumi Workshop (oyasumi seisakusho), released in 2024 for 600 yen, with full Japanese voice and story; the original language is Japanese, later localized into English, Chinese, Korean, and Spanish. Overwhelmingly Positive at 2,504 reviews and 98 percent. It already plays in English (485 of those reviews are English, about 19 percent of the total), but the wider Western audience has barely found this 600-yen doujin rail shooter outside niche shmup circles.",
        desc_ja: "アニメ調の擬似3D・オンレール(レール式)シューティング。自機を背後から見る視点で、高テンポの空中戦が展開する。核は高度なファイアコントロール——照準を横切った標的はすべて自動でロックオンされ、ロックした敵全部へ一斉に追尾攻撃が降り注ぐ。だからこのゲームのループは「避ける」ことではなく、照準を波の上に薙ぎ払い、一度の攻めの爆発で丸ごと消し去ることにある。可変の武装ロードアウト、パワーバースト「OVERDRIVE」モード、波状の敵襲、ストーリーモードとエンドレスモード、難度調整、Steamランキング/実績/トレーディングカード。開発者自身が「After Burner II をうんと速くした版」と説明し、プレイヤーは After Burner や Sky Target を挙げる。日本の個人/小規模インディーの自主制作者 oyasumi Workshop(oyasumi製作所)が2024年に600円で発売、日本語フルボイス・日本語ストーリー(原語は日本語で、後に英語・中国語・韓国語・スペイン語へローカライズ)。2504レビュー98%で圧倒的に好評。英語でもう遊べて(うち485件が英語レビュー・総数の約19%)、西の弾幕シューター好きの一部には届いているが、この600円の同人レールシューターを広い西側の観客はまだほとんど見つけていない。",
      },
      {
        name_en: "After Burner II",
        name_ja: "After Burner II",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/After_Burner_II",
        wikidata: "https://www.wikidata.org/wiki/Q2628630",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: in 1987, Sega's AM2 division shipped After Burner II on the X Board arcade hardware, a pseudo-3D rail shooter seen from behind the cockpit in which you race through waves of enemy jets, lock missiles onto them, and unleash homing fire at high speed. It defined the fast, offensive, lock-and-erase rail-shooter feel built on speed and pouring fire into the targets ahead rather than careful dodging. This gem is a direct heir to that feel, with the developer self-describing it as a very faster version of After Burner II, and it sharpens the lock-on-everything-and-erase loop into its whole point. This rail lineage is distinct from the vertical-scrolling bullet-hell line, so it is its own branch of the shooter family.",
        desc_ja: "この味の原点。1987年、セガのAM2が業務用基板「X Board」で After Burner II を世に送り出した。コクピット後方視点の擬似3Dレールシューティングで、敵機の波の中を高速で駆け抜け、ミサイルをロックオンして追尾弾を撃ち込む。慎重に避けるのではなく、速度に乗って前方の標的へ撃ち込みまくる——その速くて攻撃的な「ロックして消す」レールシューターの手触りを確立した。この未発掘の名作はその味の直系で、開発者自身が「After Burner II をうんと速くした版」と説明する通り、「全部ロックして消す」ループを核そのものへと研ぎ澄ます。このレール系の系譜は、縦スクロールの弾幕系とは別物で、シューティングという一族の中の独立した一枝である。",
      },
    ],
    en: {
      title: "Mirage Feathers - a buried anime rail shooter where your crosshair auto-locks a whole wave and homing fire erases it at once, an heir to After Burner II",
      description: "An anime-styled pseudo-3D on-rails shooter of fast aerial combat. Sweep your crosshair across a wave and it auto-locks every target, then homing fire erases them all in one offensive burst. OVERDRIVE bursts, wave assaults, Story and Endless modes, Steam leaderboards. A 600-yen doujin work by Japan's oyasumi Workshop, self-described as a much faster After Burner II. Overwhelmingly Positive at 2,504 reviews and 98 percent; it plays in English, yet the wider West has barely found it.",
      h1a: "Don't dodge the wave. ",
      h1flip: "Lock all of it, and erase it at once",
      h1b: ".",
      lede: "An anime-styled pseudo-3D on-rails shooter of fast-tempo aerial combat, seen from behind your craft. Any target that crosses your crosshair is auto-locked, and then homing fire pours into every locked enemy at once, so you stop dodging and start sweeping your sights across a wave to erase all of it in a single burst. OVERDRIVE power-bursts, wave-based assaults, Story and Endless modes, Steam leaderboards. A 600-yen doujin work by Japan's oyasumi Workshop, self-described as a much faster After Burner II. It already plays in English, yet the wider West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "A wave of enemies floods toward you, and your instinct in any shooter is to thread between them, but here you do the opposite: you drag your crosshair across the whole wave and the fire-control system snaps a lock onto every target it touches.",
        "Then you let go, and homing attacks pour out of you into all of them at once, the screen blooming with simultaneous hits, so the reward is not a single clean shot but an entire wave erased in one breath of offense.",
        "OVERDRIVE breaks open and the tempo spikes, the next wave is already on you before the last one finishes dying, and the loop of sweep-lock-erase tightens until you forget to stop, reaching to top the leaderboard one more time.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love fast, offensive rail shooters in the After Burner line, where the thrill is speed and pouring fire into the targets ahead rather than careful dodging",
        "You want a lock-and-erase loop where sweeping your crosshair across a wave auto-locks every target, then homing fire wipes the whole wave in one burst, with an OVERDRIVE mode, Story and Endless modes, and Steam leaderboards to chase",
        "You want a Japanese solo/small-indie doujin gem the wider West has barely noticed, Overwhelmingly Positive at 98 percent, a 600-yen anime rail shooter with full Japanese voice",
      ],
      bad: [
        "You want a slow, careful shooter built around weaving through bullets and keeping your distance, not one built to reward locking and erasing a whole wave at speed",
        "You expect a big-studio, big-budget production rather than a one-person, 600-yen doujin rail shooter; note too that it has mild anime fanservice (swimsuit-style outfits, with an option to switch to less revealing designs), though that is not its focus",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ミラージュフェザーズ - 照準を薙ぐと波ごと自動ロックし追尾弾で一斉に消す、After Burner II の系譜の埋もれたアニメ・レールシューター",
      description: "アニメ調の擬似3D・オンレールの高速空中戦シューティング。照準を波の上に薙ぐと標的を全部自動ロックし、追尾弾が一度の攻めで丸ごと消し去る。OVERDRIVE、波状の敵襲、ストーリー/エンドレスモード、Steamランキング。日本の oyasumi製作所による600円の同人作で、開発者自身が「After Burner II をうんと速くした版」と説明。2504レビュー98%で圧倒的に好評。英語でも遊べるが、広い西側にはまだほとんど見つかっていない。",
      h1a: "波を避けるな。",
      h1flip: "全部ロックして、一斉に消せ",
      h1b: "。",
      lede: "アニメ調の擬似3D・オンレール(レール式)シューティング。自機を背後から見る視点で、高テンポの空中戦が展開する。照準を横切った標的はすべて自動ロックされ、ロックした敵全部へ追尾弾が一斉に降り注ぐ。だから避けるのをやめ、照準を波の上に薙ぎ払い、一度の爆発で丸ごと消し去り始める。パワーバースト「OVERDRIVE」、波状の敵襲、ストーリー/エンドレスモード、Steamランキング。日本の oyasumi製作所による600円の同人作で、開発者自身が「After Burner II をうんと速くした版」と説明。英語でもう遊べるが、広い西側にはまだほとんど見つかっていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "敵の波が押し寄せてくる。どんなシューティングでも本能は「その隙間を縫え」だ。だがここでは逆をやる——照準を波全体の上に薙ぎ、ファイアコントロールが触れた標的すべてに次々とロックを噛ませていく。",
        "そして放つと、ロックした全部へ追尾攻撃が一斉に噴き出し、画面が同時ヒットで咲き乱れる。報酬は一発の綺麗な命中ではなく、ひと息の攻めで波を丸ごと消し去ること、その快感だ。",
        "OVERDRIVE が弾け、テンポが跳ね上がる。前の波が死に切る前に次の波がもう迫っていて、「薙いで・ロックして・消す」ループが締まっていく。気づけば止め時を忘れ、ランキング首位を取りにもう一回、手が伸びる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "After Burner 系の、速くて攻撃的なレールシューターが好きな人——慎重な回避より、速度に乗って前方の標的へ撃ち込む快感が欲しい人",
        "照準を波の上に薙ぐと標的を全部自動ロックし、追尾弾が波ごと一度に消し去る「ロックして消す」ループが欲しい人——OVERDRIVE モード、ストーリー/エンドレスモード、追いかけるべき Steam ランキング付き",
        "広い西側がまだほとんど気づいていない日本の個人/小規模インディーの同人原石が欲しい人——98%で圧倒的に好評、日本語フルボイスの600円アニメ・レールシューター",
      ],
      bad: [
        "弾の隙間を縫い、距離を取って慎重に戦うシューティングが欲しい人(本作は波ごとロックして高速で消し去るほど報われるよう作られている)",
        "1人/小規模の同人による600円のレールシューターではなく、大手スタジオの大型予算作を期待する人(なお軽めのアニメ的サービス——水着風の衣装で、露出を抑えたデザインに切り替えるオプションあり——が含まれるが、それが主眼ではない)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "kaii-bangou": {
    published: "2026-06-25",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "horror-novel", lineage: "apathy-school-ghost-stories", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 87, positivePct: 98, noEnglish: true } },
    games: [
      {
        name_en: "Kaii Bangou ~20XX~",
        name_ja: "怪異番号~20✕✕(ニーマルバツバツ)~",
        status: "hidden",
        steam: "https://store.steampowered.com/app/4154100/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A psychological horror text adventure with no jump scares, set in the Japan of 2005. In a park's public toilet, someone has scrawled a phone number, and no one knows where it connects. From that single urban legend you follow the rumors and the digits into the strange things lurking in the town. It is an omnibus told across four episodes, a reading-type novel that does not lunge at you but stacks dread slowly through text, where the horror is the story itself rather than a sudden face in the dark. Made by the Japanese solo creator EBA GAME, released in March 2026 for 400 yen. The store supports Japanese only, there is not even an English interface, and out of 87 reviews not one is in English. Very Positive in Japan at 98 percent, yet the wider West has not found this 400-yen doujin horror novel at all.",
        desc_ja: "ジャンプスケアの無い心理ホラー・テキストアドベンチャー。舞台は2005年(平成)の日本。公園の公衆トイレに、誰かが電話番号を落書きしている——どこに繋がるのか、誰も知らない。その一つの都市伝説から、噂と数字を手掛かりに、町に潜む怪異の謎へと辿っていく。全4エピソード構成のオムニバス形式で、襲いかかってくるのではなく、テキストでじわじわと恐怖を積み上げる読み物型のノベルだ。恐怖は暗闇から飛び出す顔ではなく、物語そのものにある。日本の個人ゲーム開発者 EBA GAME による一本で、2026年3月に400円で発売。ストアの対応言語は日本語のみ、英語インターフェースすら無く、87件のレビューに英語は1件も無い。98%で日本では非常に好評なのに、広い西側はこの400円の同人ホラーノベルをまだ全く見つけていない。",
      },
      {
        name_en: "Gakkou de Atta Kowai Hanashi",
        name_ja: "学校であった怖い話",
        status: "established",
        steam: "https://store.steampowered.com/app/2283710/",
        homepage: "https://ja.wikipedia.org/wiki/%E5%AD%A6%E6%A0%A1%E3%81%A7%E3%81%82%E3%81%A3%E3%81%9F%E6%80%96%E3%81%84%E8%A9%B1",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: in 1995, the Super Famicom title Gakkou de Atta Kowai Hanashi (planned by Takiya Iijima) had several narrators recount the scary stories, school legends, and urban myths of one school, building dread through text rather than shock. It established the form of the omnibus Japanese horror sound novel told as separate episodes through different storytellers, and it lived on for years as the personal, small-scale indie Apathy series, with a current Steam version, Apathy: Narugami Gakuen Gakkou de Atta Kowai Hanashi Kiwami. Kaii Bangou is a direct heir to that form: a solo-made Japanese text horror novel of Heisei urban legends, told as four episodes, that follows phone numbers and rumors and stacks fear through text instead of jump scares. This urban-legend omnibus ghost-story branch is distinct from the mystery sound novel, 3D horror, and looping-tragedy lines, so it stands as its own origin.",
        desc_ja: "この味の原点。1995年、スーパーファミコンの『学校であった怖い話』(企画・飯島多紀哉)が、複数の語り部に一つの学校の怖い話・学校の伝説・都市伝説を語らせ、ショックではなくテキストで恐怖を積み上げた。語り部を替えながら別々のエピソードとして綴る、オムニバス形式の和製ホラーサウンドノベルという形を確立し、その後は個人・小規模インディーの「アパシーシリーズ」として長年受け継がれ、現在はSteam版『アパシー 鳴神学園 学校であった怖い話 極』も配信されている。怪異番号はその形の直系——個人が作った平成の都市伝説の和製テキストホラーノベルで、全4エピソードとして綴られ、電話番号と噂を辿り、ジャンプスケアではなくテキストで恐怖を積む。この「都市伝説オムニバス怪談ノベル」の枝は、ミステリ系サウンドノベルや3Dホラーや繰り返し惨劇系とは別物で、それ自体が一つの原点として立つ。",
      },
    ],
    en: {
      title: "Kaii Bangou ~20XX~ - a buried solo-made Japanese horror text novel that follows a public-toilet phone number into Heisei urban legends, an heir to Gakkou de Atta Kowai Hanashi",
      description: "A psychological horror text adventure with no jump scares, set in the Japan of 2005. A phone number scrawled in a park toilet, connecting nowhere known, pulls you through rumors and digits into the strange things in town, told as a four-episode omnibus that stacks dread through text. A 400-yen doujin work by Japan's solo creator EBA GAME. Very Positive at 87 reviews and 98 percent, yet Japanese only, with zero English reviews: the West has not found it.",
      h1a: "A number on a toilet wall, ",
      h1flip: "connecting nowhere known",
      h1b: ".",
      lede: "A psychological horror text adventure with no jump scares, set in the Japan of 2005. In a park's public toilet someone has scrawled a phone number, and no one knows where it connects. From that single urban legend you follow the rumors and the digits into the strange things lurking in town, an omnibus across four episodes that does not lunge at you but stacks dread slowly through text. A 400-yen solo-made work by the Japanese creator EBA GAME, in the lineage of the omnibus Japanese horror text novel Gakkou de Atta Kowai Hanashi. The store is Japanese only, there is not even an English interface, and out of 87 reviews not one is English, so the West has not found it at all.",
      s1: "First, the one feeling",
      feeling: [
        "You read a phone number off a toilet wall that should mean nothing, and the not-knowing where it connects is the hook: the urge to dial, to trace it, to learn what the rumor is really about, pulls you one line deeper.",
        "There is no monster to flee and no face that leaps out; the dread is built entirely in the reading, sentence by sentence, until an ordinary Heisei town turns quietly wrong in your hands and you cannot stop turning the page.",
        "Each of the four episodes closes one loop of a local legend and opens the next, the omnibus tightening as the numbers and rumors start to rhyme, so finishing one only makes you reach for the following thread.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Japanese horror text novel in the Gakkou de Atta Kowai Hanashi line, where the fear is built in the reading and the urban legend itself, not in a jump scare",
        "You want a quiet, slow-burn omnibus of Heisei urban legends told across four episodes, where a public-toilet phone number and a chain of rumors lead you into the strange",
        "You want a Japanese solo-creator doujin gem the wider West has not found at all, Very Positive at 98 percent, a 400-yen text horror novel with zero English reviews",
      ],
      bad: [
        "You want action, monsters, jump scares, or anything to flee from; this is a reading-type text novel that stacks dread through prose, not through shock",
        "You cannot read Japanese, or you want a game that already plays in English; the store supports Japanese only, with not even an English interface, and there is no English version yet",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "怪異番号~20✕✕~ - 公衆トイレの電話番号から平成の都市伝説を辿る、学校であった怖い話の系譜の埋もれた個人製・和製テキストホラーノベル",
      description: "ジャンプスケアの無い心理ホラー・テキストアドベンチャー。舞台は2005年の日本。公園の公衆トイレに落書きされた、どこに繋がるか分からない電話番号から、噂と数字を辿って町の怪異へ。全4エピソードのオムニバスで、テキストでじわじわ恐怖を積む。日本の個人開発者 EBA GAME による400円の同人作。87レビュー98%で非常に好評なのに、日本語のみ・英語レビュー0件で、西はまだ見つけていない。",
      h1a: "トイレの壁の番号は、",
      h1flip: "どこにも繋がらない",
      h1b: "。",
      lede: "ジャンプスケアの無い心理ホラー・テキストアドベンチャー。舞台は2005年(平成)の日本。公園の公衆トイレに、誰かが電話番号を落書きしている——どこに繋がるのか、誰も知らない。その一つの都市伝説から、噂と数字を手掛かりに、町に潜む怪異へと辿っていく。全4エピソードのオムニバスで、襲いかかるのではなく、テキストでじわじわと恐怖を積み上げる。日本の個人開発者 EBA GAME による400円の個人製作で、オムニバス形式の和製ホラーテキストノベル 学校であった怖い話 の系譜に連なる。ストアの対応言語は日本語のみ、英語インターフェースすら無く、87件のレビューに英語は1件も無いから、西はまだ全く見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "トイレの壁から、本来なら何の意味も無いはずの電話番号を読み上げる。「どこに繋がるか分からない」——その分からなさこそが釣り針だ。かけてみたい、辿ってみたい、この噂が本当は何なのか知りたい欲求が、一行先へと引き込む。",
        "逃げるべき怪物も、飛び出す顔も無い。恐怖はすべて「読むこと」の中で、一文ずつ組み上がっていく。ありふれた平成の町が、手の中で静かに歪んでいき、ページをめくる手が止まらなくなる。",
        "全4エピソードのそれぞれが、土地の伝説の一つのループを閉じ、次を開く。番号と噂が韻を踏み始め、オムニバスが締まっていく。一つ読み終えるたびに、次の糸へと手が伸びる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "学校であった怖い話 系の和製テキストホラーノベルが好きな人——恐怖がジャンプスケアではなく「読むこと」と都市伝説そのものの中で組み上がる",
        "公衆トイレの電話番号と噂の連鎖が怪異へ導く、全4エピソードの平成都市伝説オムニバスを、静かにじわじわ味わいたい人",
        "広い西側がまだ全く見つけていない、日本の個人開発者の同人原石が欲しい人——98%で非常に好評、英語レビュー0件の400円テキストホラーノベル",
      ],
      bad: [
        "アクションや怪物、ジャンプスケア、逃げる対象が欲しい人(本作はショックではなく散文でじわじわ恐怖を積む読み物型のテキストノベル)",
        "日本語が読めない人、または英語でもう遊べる作品が欲しい人(対応言語は日本語のみで英語インターフェースすら無く、英語版はまだ無い)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "million-depth": {
    published: "2026-06-26",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "roguelike", lineage: "superhot", obscurity: "deep", reviewBand: "hundreds", rarity: { reviews: 679, positivePct: 94, noEnglish: false } },
    games: [
      {
        name_en: "Million Depth",
        name_ja: "ミリオンデプス",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2555950/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese roguelike-flavored action strategy game about diving a million floors underground. Moma searches for a lost friend through the ever-changing world of Million Depth, armed with a \"biotope jammer\" that freezes time around her for as long as she stays perfectly still. Surrounded by creatures in the dark, with weapons and shields that wear down and shatter mid-battle and leave her defenseless until repaired, you stop time to read the board, plan the next move, and craft new gear by combining blocks. The true story shifts between timelines and Moma's past choices ripple into other futures, so you piece together fragmented clues across multiple endings. Made by the Japanese developer Cyber Space Biotope (creator Pop) and published by PLAYISM, released November 2025. Very Positive at 679 reviews and 94 percent. It already plays in English (157 of those reviews are English, about 23 percent), yet the wider Western audience has not broadly found this Japanese indie.",
        desc_ja: "100万階の地下へ潜る、日本のローグライク風アクションストラテジー。主人公モマは、絶えず姿を変える地下世界「Million Depth」で失った友を探す。武器は、自分が完全に静止しているあいだ周囲の時間を止める装置「biotope jammer(バイオトープ・ジャマー)」。闇のなかで生物に囲まれ、武器と盾は戦闘で摩耗して砕け、直すまで無防備になる——その瞬間こそ、時間を止めて盤面を読み、次の一手を組み立て、ブロックを組み合わせて装備をクラフトする。真実はタイムラインごとに移ろい、モマの過去の選択は別の未来へ波及していく。だから断片的な手がかりを繋ぎ、複数のエンディングへ向かう。日本の開発者 Cyber Space Biotope(開発者 Pop)が手がけ PLAYISM が販売、2025年11月発売。679レビュー94%で非常に好評。英語でもう遊べる(うち157件・約23%が英語レビュー)が、この日本のインディーを広い西側はまだ広くは見つけていない。",
      },
      {
        name_en: "SUPERHOT",
        name_ja: "SUPERHOT",
        status: "established",
        steam: "https://store.steampowered.com/app/322500/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: SUPERHOT, released in 2016 by the Superhot Team, built its whole identity on a single twist — time moves only when you move. Stand still and the world freezes; step, aim, or fire and it surges forward, turning every encounter into a puzzle you solve inside frozen moments. It defined the time-flows-with-your-motion feel. Million Depth is a clear heir to that idea: its biotope jammer freezes time while the heroine holds still, so you read the board and plan inside the pause, but it grafts that core onto a roguelike-flavored million-floor descent with weapon crafting and branching timelines, making it its own creature rather than a clone.",
        desc_ja: "この味の原点。2016年に Superhot Team が放った SUPERHOT は、ただ一つの捻り——「時間は、自分が動いたときだけ進む」——にすべてを賭けた。静止すれば世界は凍り、踏み出し、狙い、撃てば時間が一気に走り出す。あらゆる遭遇が、凍った一瞬のなかで解く謎になる。「時間が自分の動きと共に流れる」という手触りを確立した作品だ。ミリオンデプスはその直系——biotope jammer はヒロインが静止するあいだ時間を止め、止まった間(ま)のなかで盤面を読み、計画を組む。だがその核を、ローグライク風の100万階下降・武器クラフト・分岐するタイムラインへ接ぎ木し、模倣ではない独自の一作へと仕立てている。",
      },
    ],
    en: {
      title: "Million Depth - a buried Japanese action-strategy where standing still freezes time so you read the board and craft your way down a million floors, an heir to SUPERHOT",
      description: "A Japanese roguelike-flavored action strategy game. Stand perfectly still and a biotope jammer freezes time around you, so when creatures swarm and your gear shatters mid-battle you stop the world, read the board, plan, and craft new equipment from blocks. A story that splits across timelines, with multiple endings. By Japan's Cyber Space Biotope, published by PLAYISM. Very Positive at 679 reviews and 94 percent; it plays in English, yet the wider West has barely found it.",
      h1a: "Don't react. ",
      h1flip: "Stand still, freeze time, and read your way out",
      h1b: ".",
      lede: "A Japanese roguelike-flavored action strategy game about descending a million floors underground. The trick is your biotope jammer: stay perfectly still and time freezes around you, so the instant creatures swarm or your weapon shatters and leaves you defenseless, you stop the world, read the board, plan the next move, and craft fresh gear by combining blocks. The deeper story shifts between timelines and your past choices ripple into other futures. Made by Japan's Cyber Space Biotope and published by PLAYISM. It already plays in English, yet the wider West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "Creatures close in from the dark and your weapon picks this exact moment to shatter, leaving you defenseless, and your instinct is to panic, but instead you simply stop moving and the whole world freezes with you.",
        "Inside that frozen pause you breathe, read the board, trace each enemy's reach, decide the one path through, and combine blocks into a fresh weapon, so survival is not reflexes but a plan assembled in stopped time.",
        "Then you move and time crashes forward all at once, your plan executing in a single surge, and a floor later the story has quietly shifted timeline, your old choices echoing into a future you did not expect, pulling you one more floor down.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the SUPERHOT idea that time moves only when you move, where every fight becomes a puzzle solved inside frozen moments rather than a test of reflexes",
        "You want that core grafted onto a roguelike-flavored million-floor descent with weapon crafting from blocks, breakable gear, branching timelines, and multiple endings to piece together",
        "You want a Japanese indie gem the wider West has barely noticed, Very Positive at 94 percent, from Cyber Space Biotope and PLAYISM",
      ],
      bad: [
        "You want a fast, reflex-driven action game; this is built around stopping time to think, so its thrill is planning inside the pause, not twitch execution",
        "You expect a game already big in the West; it plays in English but is Japanese-led and still largely undiscovered abroad (about 23 percent of reviews are English)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ミリオンデプス - 静止すると時間が止まり、盤面を読みクラフトで100万階を潜る、SUPERHOT の系譜の埋もれた日本のアクションストラテジー",
      description: "日本のローグライク風アクションストラテジー。完全に静止すると biotope jammer が周囲の時間を止める。だから生物に囲まれ、戦闘中に装備が砕けても、世界を止めて盤面を読み、計画を立て、ブロックから装備をクラフトする。タイムラインごとに分岐する物語、複数のエンディング。日本の Cyber Space Biotope 開発、PLAYISM 販売。679レビュー94%で非常に好評。英語でも遊べるが、広い西側にはまだほとんど見つかっていない。",
      h1a: "反応するな。",
      h1flip: "静止し、時間を止めて、読み切って抜けろ",
      h1b: "。",
      lede: "100万階の地下を下る、日本のローグライク風アクションストラテジー。鍵は装置「biotope jammer」——完全に静止すると周囲の時間が止まる。だから生物が群がった瞬間も、武器が砕けて無防備になった瞬間も、世界を止め、盤面を読み、次の一手を組み立て、ブロックを組み合わせて装備をクラフトする。深層の物語はタイムラインごとに移ろい、過去の選択は別の未来へ波及する。日本の Cyber Space Biotope が開発し PLAYISM が販売。英語でもう遊べるが、広い西側にはまだほとんど見つかっていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "闇から生物が迫り、よりによってその瞬間に武器が砕けて無防備になる。本能は慌てろと叫ぶ。だがここでは、ただ動きを止める——すると世界が、あなたごと凍りつく。",
        "凍った間(ま)のなかで息をつき、盤面を読み、敵それぞれの間合いをなぞり、抜ける一本道を決め、ブロックを組み合わせて新しい武器をクラフトする。生き残りは反射神経ではなく、止まった時間のなかで組み上げた計画だ。",
        "そして動けば、時間が一気に崩れ落ちる。計画がひと息で執行される。一階下りれば物語は静かにタイムラインを変えていて、かつての選択が思いがけない未来へ谺(こだま)する——もう一階、下へと手が伸びる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "「時間は自分が動いたときだけ進む」という SUPERHOT の発想が好きな人——あらゆる戦いが、反射神経の試験ではなく、凍った一瞬のなかで解く謎になる",
        "その核を、ローグライク風の100万階下降に接ぎ木した作品が欲しい人——ブロックからの武器クラフト、壊れる装備、分岐するタイムライン、繋ぎ合わせる複数のエンディング",
        "広い西側がまだほとんど気づいていない日本のインディー原石が欲しい人——94%で非常に好評、Cyber Space Biotope と PLAYISM",
      ],
      bad: [
        "速い反射神経のアクションが欲しい人(本作は時間を止めて考える設計で、快感は瞬間反応ではなく「間」のなかの計画にある)",
        "すでに西で大きい作品を期待する人(英語で遊べるが日本主体で、海外ではまだ広く未発見——英語レビューは約23%)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "below-zero-despair": {
    published: "2026-06-26",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "psychological-horror", lineage: "scp-foundation", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 353, positivePct: 97, noEnglish: false } },
    games: [
      {
        name_en: "Below Zero 30 Degrees: Despair",
        name_ja: "氷点下30度の絶望",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3736150/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A free Japanese psychological horror novel game in which two grown men are locked inside a walk-in freezer, and there is no survival ending. As the cold sets in, the game walks them through the real progression of hypothermia, hallucinations, paradoxical undressing (a documented late-stage symptom where victims feel burning hot and tear off their clothes), and pain, toward a buried \"truth\" and one of four deaths. A single run is about 15 to 20 minutes, mouse only, rendered in a PSX-style low-poly retro look. Choices open special conversations and probability-based random events give each run small differences, so with the skip function full completion of all endings runs roughly half an hour to two hours. Made by the Japanese solo doujin creator Mitsudomoe Koubou, released November 2025, distributed across Japanese doujin and free-game platforms like BOOTH, note, novelgame, and PLiCy, with the Steam version supporting Japanese only. The creator names the SCP Foundation, which they encountered in middle school, as the influence behind the work. Very Positive at 353 reviews and 97 percent, yet with only about 16 English reviews (around 4.5 percent), the wider West has barely found this free doujin horror.",
        desc_ja: "成人男性2人が業務用の冷凍庫(ウォークイン・フリーザー)に閉じ込められる、無料の日本産・心理ホラーノベルゲーム。生存エンドは無い。冷えが進むにつれ、ゲームは低体温症の実際の進行——幻覚、そして「矛盾脱衣」(被害者が燃えるように熱く感じて服を脱ぎ捨てる、低体温症末期の実在する症状)、苦痛——を辿りながら、埋もれた「真相」と4つの死のいずれかへと向かわせる。1周は約15〜20分、操作はマウスのみ、PSX風(ローポリのレトロ3DCG)のビジュアルで描かれる。選択肢は特別な会話を開き、確率で発火するランダムイベントが各周回に小さな差を生むので、スキップ機能込みで全エンディング回収は概ね30分〜2時間。日本の個人同人開発者 みつどもえ工房 による一本で、2025年11月発売。BOOTH・note・novelgame・PLiCy など日本の同人/フリーゲームのプラットフォームで配布され、Steam版の対応言語は日本語のみ。作者は、中学時代に触れた SCP財団 を本作の影響源として挙げている。353レビュー97%で非常に好評なのに、英語レビューは約16件(約4.5%)しかなく、広い西側はこの無料の同人ホラーをまだほとんど見つけていない。",
      },
      {
        name_en: "SCP Foundation",
        name_ja: "SCP財団",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/SCP_Foundation",
        wikidata: "https://www.wikidata.org/wiki/Q17439649",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: the SCP Foundation, a web-based collaborative fiction project begun in 2007, in which anonymous writers document fictional anomalous entities and phenomena as the classified files of a secret agency that Secures, Contains, and Protects them. Told in the flat, clinical voice of incident reports, with no single author and no fixed canon, it turned the bureaucratic record of the anomalous, and the dread of being sealed in with something inexplicable, into a shared modern mythology. Below Zero 30 Degrees: Despair is an heir to that anomalous-horror feel, named by its creator as the influence they met in middle school: it locks two men in a sealed freezer, treats the body's failure as the documented case to be read, and drives existential dread through a closed room toward death. This document-driven, closed-facility horror is distinct from the ghost-story and looping-tragedy lines, so it stands as its own origin.",
        desc_ja: "この味の原点。SCP財団は、2007年に始まった web ベースの共同創作プロジェクトで、匿名の書き手たちが、架空の異常な存在や現象を、それらを「確保・収容・保護」する秘密機関の機密報告書として記録していく。特定の作者も固定された正典も持たず、感情を排した報告書の文体で綴られ、「異常を官僚的に記録する」営みと、「説明のつかない何かと密室に閉じ込められる」恐怖を、共有された現代の神話へと変えた。氷点下30度の絶望はその anomalous horror(異常存在ホラー)の手触りの直系で、作者自身が中学時代に出会った影響源として挙げている——2人の男を密閉された冷凍庫に閉じ込め、壊れていく身体そのものを「読まれるべき症例」として扱い、閉ざされた一室の中で実存的な恐怖を死へと向けて立ち上げる。この「文書で立ち上がる密室・閉鎖施設ホラー」は、怪談系や繰り返し惨劇系とは別物で、それ自体が一つの原点として立つ。",
      },
    ],
    en: {
      title: "Below Zero 30 Degrees: Despair - a buried free Japanese psychological horror novel where two men freeze to death in a sealed freezer, an heir to the SCP Foundation",
      description: "A free Japanese psychological horror novel game with no survival ending: two men are locked in a walk-in freezer and the game walks them through real hypothermia, hallucinations, and paradoxical undressing toward one of four deaths. A 15-20 minute run, mouse only, in a PSX-style low-poly look, with choices and random events for replay. A free doujin work by Japan's solo creator Mitsudomoe Koubou. Very Positive at 353 reviews and 97 percent, yet Japanese only with about 16 English reviews: the West has barely found it.",
      h1a: "There is no way out. ",
      h1flip: "Only which death you reach",
      h1b: ".",
      lede: "A free Japanese psychological horror novel game in which two grown men are locked inside a walk-in freezer, and there is no survival ending. As the cold sets in, the game walks them through the real progression of hypothermia, hallucinations, and paradoxical undressing toward a buried truth and one of four deaths. A run is about 15 to 20 minutes, mouse only, in a PSX-style low-poly look; choices open special conversations and probability-based random events give each run small differences. A free doujin work by Japan's solo creator Mitsudomoe Koubou, in the lineage of the SCP Foundation's anomalous horror. The Steam version is Japanese only, and with only about 16 English reviews the wider West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "From the first moment the door does not open, the game removes the one thing every survival horror promises: a way out. There is no survival ending, so what holds you is not hope of escape but the pull to learn how, and why, this ends.",
        "The horror is the body failing on schedule: the cold creeps in, hallucinations bleed into the room, and the documented late symptom of paradoxical undressing arrives, so the dread is not a monster lunging but your own physiology read out to you like a clinical record you cannot look away from.",
        "Each run is 15 to 20 minutes and lands on one of four deaths, and the choices and probability-based events leave small differences between runs, so finishing one death only makes you reach to trace the next branch and assemble the truth underneath, one more time.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the SCP Foundation's anomalous, document-driven horror, where existential dread is built by sealing people in a closed room and reading the inexplicable out in a flat, clinical voice rather than by jump scares",
        "You want a closed-room psychological horror novel about two men freezing in a freezer with no survival ending, that drives through real hypothermia symptoms toward four deaths, with choices and random events to trace across replays",
        "You want a free, mouse-only Japanese solo-doujin gem the wider West has barely found, Very Positive at 97 percent, in a PSX-style low-poly look, short enough to finish a run in under 20 minutes",
      ],
      bad: [
        "You want hope, a survival route, or a happy ending; this is built with no survival ending, so every path leads to one of four deaths and the appeal is the descent itself, not an escape",
        "You cannot read Japanese, or you are sensitive to depictions of hypothermia, self-harm, blood, and death in a sealed space; the Steam version supports Japanese only and the content is heavy by design",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "氷点下30度の絶望 - 密閉された冷凍庫で2人の男が凍死していく、SCP財団の系譜の埋もれた無料の日本産・心理ホラーノベル",
      description: "生存エンドの無い、無料の日本産・心理ホラーノベルゲーム。冷凍庫に閉じ込められた2人の男を、低体温症・幻覚・矛盾脱衣の実際の進行を辿りながら4つの死のいずれかへ向かわせる。1周15〜20分・マウスのみ・PSX風ローポリで、選択肢とランダムイベントで反復性を持つ。日本の個人開発者 みつどもえ工房 による無料の同人作。353レビュー97%で非常に好評なのに、日本語のみ・英語レビュー約16件で、西はまだほとんど見つけていない。",
      h1a: "出口は無い。",
      h1flip: "あるのは、どの死に辿り着くかだけ",
      h1b: "。",
      lede: "成人男性2人が業務用の冷凍庫に閉じ込められる、無料の日本産・心理ホラーノベルゲーム。生存エンドは無い。冷えが進むにつれ、ゲームは低体温症の実際の進行——幻覚、矛盾脱衣——を辿りながら、埋もれた「真相」と4つの死のいずれかへと向かわせる。1周は約15〜20分、操作はマウスのみ、PSX風のローポリで描かれ、選択肢は特別な会話を開き、確率で発火するランダムイベントが各周回に小さな差を生む。日本の個人開発者 みつどもえ工房 による無料の同人作で、SCP財団 の異常存在ホラーの系譜に連なる。Steam版の対応言語は日本語のみで、英語レビューは約16件しかなく、広い西側はこの作品をまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "扉が開かないと分かった最初の瞬間に、このゲームはあらゆるサバイバルホラーが約束するもの——「出口」——を取り上げる。生存エンドは無い。だから手を止めさせないのは脱出の希望ではなく、これが「どう」「なぜ」終わるのかを知りたい引力だ。",
        "恐怖は、身体が決まった順序で壊れていくことそのものにある。冷えがじわじわと忍び寄り、幻覚が部屋に滲み出し、低体温症末期の実在症状である「矛盾脱衣」が訪れる。襲いかかる怪物ではなく、自分自身の生理現象が、目を逸らせない症例のように読み上げられていく——その不気味さだ。",
        "1周は15〜20分で、4つの死のいずれかに着地する。選択肢と確率イベントが周回ごとに小さな差を残すから、一つの死を見届けるたびに、次の分岐を辿り、その下に沈む真相を組み上げたくて、もう一度手が伸びる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "SCP財団 の異常存在ホラー——人を密室に閉じ込め、説明のつかないものを無機質な報告書の文体で読み上げることで、ジャンプスケアではなく実存的な恐怖を立ち上げる——が好きな人",
        "生存エンドの無いまま、冷凍庫で凍えていく2人の男を描く密室心理ホラーノベルが欲しい人——低体温症の実際の症状を辿って4つの死へ向かい、選択肢とランダムイベントを周回で辿れる",
        "広い西側がまだほとんど見つけていない、無料・マウスのみの日本の個人同人原石が欲しい人——97%で非常に好評、PSX風ローポリで、1周20分弱で終えられる短さ",
      ],
      bad: [
        "希望や生存ルート、ハッピーエンドが欲しい人(本作は生存エンドを持たない設計で、どの道も4つの死のいずれかに至り、魅力は脱出ではなく堕ちていくことそのものにある)",
        "日本語が読めない人、または密室での低体温症・自傷・流血・死の描写が苦手な人(Steam版の対応言語は日本語のみで、内容は設計上ヘビーである)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "timeline-detective": {
    published: "2026-06-27",
    publishAt: "2026-06-27",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "osint-investigation", lineage: "orwell", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 276, positivePct: 98, noEnglish: false } },
    games: [
      {
        name_en: "Demons' Timeline",
        name_ja: "ミカクテイ事件の観測者-Demons'Timeline-",
        status: "hidden",
        steam: "https://store.steampowered.com/app/4198660/DemonsTimeline/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese SNS-puzzle deduction adventure in which you play the net detective El and solve supernatural murder cases using only the timeline of a fictional giant social network called Parrotter. The criminals are superhuman beings called Akuma, and each paradox case is cracked by reading posts for clues, gender, age, occupation, relationships, then linking public accounts to their secret alt accounts, recovering deleted data with passwords, citing the right posts as the grounds for your reasoning, and finally fitting a hashtag to complete the deduction. It is OSINT-style investigation, nine stages in all, with no time limit and no game over: the core is your power to read, to filter signal from noise, and to think logically. Made by the Japanese doujin indie team DigitalCats and released April 2026. Very Positive at 276 reviews and 98 percent, yet with only about 21 English reviews (7.6 percent) the wider West has barely found it. It already supports English and Japanese, and at 1,300 yen it is a paid, fully released game.",
        desc_ja: "ネット探偵「エル」となり、架空の巨大SNS「パロッター」のタイムライン情報「だけ」を頼りに怪事件の真相を解く、日本のSNSパズル推理アドベンチャー。犯人は超常能力者「アクマ」で、怪事件「パラドックス」(殺人事件)は、投稿の手がかり(性別・年齢・職業・人間関係)を読み、公開アカウントと裏アカウントを紐付け、パスワードで削除データを復元し、投稿を根拠として正しく引用し、最後にハッシュタグを当てはめて推理を完成させることで解いていく。OSINT風調査で、全9ステージ、時間制限もゲームオーバーも無い。核にあるのは「読む力」「取捨選択」「論理的思考」だ。日本の同人/インディーチーム DigitalCats による一本で、2026年4月発売。276レビュー98%で非常に好評なのに、英語レビューは約21件(7.6%)しかなく、広い西側はまだほとんど見つけていない。英語と日本語に対応済みで、価格1,300円の有料作・正式リリース済みである。",
      },
      {
        name_en: "Orwell: Keeping an Eye on You",
        name_ja: "Orwell: Keeping an Eye on You",
        status: "established",
        steam: "https://store.steampowered.com/app/491950/Orwell_Keeping_an_Eye_On_You/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: Orwell: Keeping an Eye on You, released in 2016 by Osmotic Studios and Daedalic Entertainment, put you behind a government surveillance system and let you read only a suspect's online traces, their social posts, chat logs, private files, and news, then drag fragments of conflicting evidence into a profile to decide who they are and what they did. By building deduction out of reading public and leaked information and choosing which excerpts to submit as proof, it defined the OSINT-style investigation adventure. Demons' Timeline is a clear heir to that idea: it hands you only the timeline of a fictional SNS and asks you to link public accounts to secret alts, cite posts as the grounds for your reasoning, and fit a hashtag to lock the truth, but it grafts that core onto a supernatural murder-mystery with deleted-data recovery and a nine-stage structure, making it its own creature rather than a clone.",
        desc_ja: "この味の原点。2016年に Osmotic Studios と Daedalic Entertainment が放った Orwell: Keeping an Eye on You は、プレイヤーを政府の監視システムの後ろに座らせ、対象人物のオンラインの痕跡——SNSの投稿、チャットのログ、私的なファイル、ニュース——「だけ」を読ませ、真偽の入り混じる証拠の断片をプロファイルへドラッグして、その人物が何者で何をしたのかを確定させた。公開情報やリークされた情報を読み解き、どの一節を証拠として提出するかを選ぶことで推理を組み上げる仕組みにより、OSINT 調査型アドベンチャーを定義した作品だ。ミカクテイ事件の観測者はその直系——架空のSNSのタイムライン「だけ」を手渡し、公開アカウントと裏アカウントを紐付け、投稿を根拠として引用し、ハッシュタグを当てはめて真相を確定させる。だがその核を、削除データの復元と全9ステージ構成を備えた超常殺人ミステリへ接ぎ木し、模倣ではない独自の一作へと仕立てている。",
      },
    ],
    en: {
      title: "Demons' Timeline - a buried Japanese SNS-puzzle deduction adventure where you solve murders from a fake social network's timeline alone, an heir to Orwell: Keeping an Eye on You",
      description: "A Japanese SNS-puzzle deduction adventure. As the net detective El, you crack supernatural murder cases using only the timeline of a fictional social network: read posts for clues, link public accounts to secret alts, recover deleted data with passwords, cite the right posts as your grounds, and fit a hashtag to complete each deduction. OSINT-style investigation, nine stages, no time limit, no game over. By Japan's doujin indie team DigitalCats. Very Positive at 276 reviews and 98 percent; it supports English, yet the wider West has barely found it.",
      h1a: "Don't accuse. ",
      h1flip: "Read the timeline until the truth is forced",
      h1b: ".",
      lede: "A Japanese SNS-puzzle deduction adventure in which you play the net detective El and solve supernatural murder cases using only the timeline of a fictional giant social network called Parrotter. You read posts for clues, gender, age, occupation, relationships, link public accounts to their secret alts, recover deleted data with passwords, cite the right posts as the grounds for your reasoning, and finally fit a hashtag to complete the deduction. It is OSINT-style investigation across nine stages, with no time limit and no game over: the core is your power to read, to filter signal from noise, and to think logically. Made by Japan's doujin indie team DigitalCats. It supports English, yet the wider West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "All you are given is a timeline, and the case is buried inside the noise of ordinary posts, so the work is not chasing a culprit but reading: tracing gender, age, job, and who talks to whom until a face starts to surface out of the scroll.",
        "The click lands the moment a polished public account and a venomous secret alt turn out to be the same person, and you recover the deleted post that proves it, so the proof is not handed to you but assembled from fragments you chose to trust.",
        "There is no clock and no game over to rush you, so the pull is purely the itch to be right: you cite the exact posts as your grounds, fit the final hashtag, and the truth locks into place, and the next stage's timeline is already waiting to be read.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Orwell idea of solving a case from someone's digital footprint alone, where deduction is reading public and leaked information and choosing which excerpts are the proof, rather than action or interrogation",
        "You want that core grafted onto a supernatural SNS murder mystery: link public accounts to secret alts, recover deleted data with passwords, cite posts as grounds, and fit a hashtag to lock each of nine stages, with no time limit and no game over",
        "You want a Japanese doujin-indie gem the wider West has barely noticed, Very Positive at 98 percent over 276 reviews, that already supports English",
      ],
      bad: [
        "You want action, fast reflexes, or fail states; this is built around slow reading and logic with no time limit and no game over, so the thrill is being right, not being quick",
        "You dislike text-heavy investigation or want a big, already-popular Western title; this is reading-first, Japanese-led, paid at 1,300 yen, and still largely undiscovered abroad (about 7.6 percent of reviews are English)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ミカクテイ事件の観測者 - 架空SNSのタイムラインだけで殺人事件を解く、Orwell の系譜の埋もれた日本のSNS推理アドベンチャー",
      description: "日本のSNSパズル推理アドベンチャー。ネット探偵「エル」となり、架空SNSのタイムライン情報だけで怪事件を解く。投稿の手がかりを読み、公開アカウントと裏アカウントを紐付け、パスワードで削除データを復元し、投稿を根拠として引用し、ハッシュタグを当てはめて推理を完成させる。OSINT風調査、全9ステージ、時間制限もゲームオーバーも無い。日本の同人/インディーチーム DigitalCats 制作。276レビュー98%で非常に好評。英語に対応済みだが、広い西側にはまだほとんど見つかっていない。",
      h1a: "告発するな。",
      h1flip: "タイムラインを読み切り、真相を必然にしろ",
      h1b: "。",
      lede: "ネット探偵「エル」となり、架空の巨大SNS「パロッター」のタイムライン情報「だけ」を頼りに怪事件の真相を解く、日本のSNSパズル推理アドベンチャー。投稿の手がかり(性別・年齢・職業・人間関係)を読み、公開アカウントと裏アカウントを紐付け、パスワードで削除データを復元し、投稿を根拠として正しく引用し、最後にハッシュタグを当てはめて推理を完成させる。OSINT風調査で全9ステージ、時間制限もゲームオーバーも無い。核にあるのは「読む力」「取捨選択」「論理的思考」だ。日本の同人/インディーチーム DigitalCats が手がける。英語に対応済みだが、広い西側にはまだほとんど見つかっていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "手渡されるのはタイムラインだけ。事件は何気ない投稿のノイズの中に埋もれている。だから仕事は犯人を追うことではなく、読むこと——性別、年齢、職業、誰が誰と話しているかをなぞるうちに、スクロールの中から一つの顔が浮かび上がってくる。",
        "取り澄ました公開アカウントと、毒を吐く裏アカウントが同一人物だと判明し、それを裏づける削除済みの投稿を復元できた瞬間に、手応えが来る。証拠は与えられるのではなく、自分が信じると選んだ断片から組み上がる。",
        "急かす時計もゲームオーバーも無いから、手を止めさせるのは「正しくありたい」という純粋な疼きだ。根拠となる投稿を正確に引用し、最後のハッシュタグを当てはめると、真相がカチリと嵌まる——そして次のステージのタイムラインが、もう読まれるのを待っている。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "「人物のデジタルな足跡だけで事件を解く」Orwell の発想が好きな人——推理が、アクションや尋問ではなく、公開情報やリーク情報を読み、どの一節が証拠かを選ぶことで成り立つ",
        "その核を、超常のSNS殺人ミステリに接ぎ木した作品が欲しい人——公開アカウントと裏アカウントの紐付け、パスワードでの削除データ復元、投稿を根拠とした引用、ハッシュタグで全9ステージを確定、時間制限もゲームオーバーも無い",
        "広い西側がまだほとんど気づいていない、日本の同人/インディー原石が欲しい人——276レビュー98%で非常に好評、しかも英語に対応済み",
      ],
      bad: [
        "アクションや速い反射、失敗ペナルティが欲しい人(本作は時間制限もゲームオーバーも無い、じっくり読む推理と論理の設計で、快感は速さではなく「正しさ」にある)",
        "テキスト主体の調査が苦手な人、またはすでに西で人気の大作を期待する人(本作は読むことが主体で日本主体、価格1,300円の有料作で、海外ではまだ広く未発見——英語レビューは約7.6%)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "robot-girl-dreams": {
    published: "2026-06-27",
    publishAt: "2026-06-27",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "raising-sim", lineage: "princess-maker-2", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 190, positivePct: 97, noEnglish: false } },
    games: [
      {
        name_en: "Robot girl's dream -RobotBattleChampionship-",
        name_ja: "ロボット少女は夢を見る-RobotBattleChampionship-",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2742730/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese 2D raising simulation about a robot girl who has lost her memories and must build a life from scratch. Each turn you choose how she spends her time, going out, working, entering tournaments, and through those actions she grows and forms bonds with the humans and robots around her. Your choices, the dialogue options you pick, and the results of her battles accumulate and branch the story into multiple endings, all framed around her goal of winning the Robot Battle Championship. It is a raising sim with adventure and RPG elements: schedule, choose, fight, and watch a person take shape out of a blank slate. Made by the Japanese doujin circle DeskClub Games (creator Uwagaki), whose earlier RPG using the VOICEROID Kotonoha sisters earned a 95 percent on Steam, and released January 2025. Very Positive at 190 reviews and 97 percent. It already supports English and Japanese (about 18 percent of reviews are English), yet it is Japan-centered and the wider West has not broadly found it. At 1,900 yen it is a paid, fully released game.",
        desc_ja: "記録を失ったロボット少女が、ゼロから人生を築いていく、日本の2D育成シミュレーション。毎ターン、彼女の時間の使い方——外出、仕事、大会への参加——を選び、その行動を通じて彼女は成長し、周囲の人間やロボットと絆を結んでいく。あなたの選択、選んだ選択肢、そして戦闘の結果が積み重なり、物語は複数のエンディングへと分岐する。その全ては「ロボットバトルチャンピオンシップ優勝」という彼女の目標を軸に編まれている。アドベンチャーとRPGの要素を備えた育成シムだ——予定を組み、選び、戦い、空白の石板から一人の人格が形づくられていくのを見守る。日本の同人サークル DeskClub Games(作者・上顎/Uwagaki 氏)による一本で、過去には VOICEROID 琴葉姉妹を用いたRPGが Steam で95%を獲得している。2025年1月発売。190レビュー97%で非常に好評。英語と日本語に対応済み(英語レビューは約18%)だが、日本中心で、広い西側はまだ広くは見つけていない。価格1,900円の有料作・正式リリース済みである。",
      },
      {
        name_en: "Princess Maker 2 Refine",
        name_ja: "プリンセスメーカー2",
        status: "established",
        steam: "https://store.steampowered.com/app/523000/Princess_Maker_2_Refine/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: Princess Maker 2, Gainax, 1993 (the Refine edition is the one on Steam), the defining entry of the Princess Maker series begun in 1991. You become a young daughter's foster father and spend years scheduling her education, work, and lessons, watching parameters accumulate until those choices branch into one of many endings, from queen to merchant to ordinary townsfolk. It crystallized the raising-sim loop of scheduling a girl's time over a fixed period and letting accumulated stats and choices decide her future. Robot girl's dream is a clear heir to that idea: it hands you a girl to raise turn by turn through scheduled actions, and your choices and battle results pile up into branching endings, but it grafts that core onto an amnesiac robot's self-rediscovery aimed at a Battle Championship, making it its own creature rather than a clone.",
        desc_ja: "この味の原点。プリンセスメーカー2、ガイナックス、1993年(Steam 版は Refine 版)——1991年に始まったプリンセスメーカーシリーズを代表する一作だ。プレイヤーは幼い娘の養父となり、何年もかけて教育・仕事・けいこごとの予定を組み、パラメータが積み上がっていくのを見守る。その選択の蓄積は、女王から商人、市井の人まで、数多のエンディングのいずれかへと分岐していく。「少女の時間を一定期間スケジューリングし、積み上がったパラメータと選択でその未来を決める」育成シムのループを結晶化させた。ロボット少女は夢を見るはその直系——一人の少女を、スケジュールした行動で1ターンずつ育てさせ、選択と戦闘結果が積み上がって分岐するエンディングへ向かわせる。だがその核を、記録を失ったロボットがバトルチャンピオンシップを目指して自分を取り戻していく物語へ接ぎ木し、模倣ではない独自の一作へと仕立てている。",
      },
    ],
    en: {
      title: "Robot girl's dream -RobotBattleChampionship- a buried Japanese raising sim where an amnesiac robot girl is scheduled, choice by choice, toward branching endings, an heir to Princess Maker 2",
      description: "A Japanese 2D raising simulation about a robot girl who has lost her memories. Each turn you choose how she spends her time, going out, working, entering tournaments, and through those actions she grows and bonds with the humans and robots around her. Your choices, dialogue, and battle results accumulate and branch the story into multiple endings, framed around winning the Robot Battle Championship. By Japan's doujin circle DeskClub Games. Very Positive at 190 reviews and 97 percent; it supports English, yet it is Japan-centered and the wider West has barely found it.",
      h1a: "Don't recall who she was. ",
      h1flip: "Schedule, choice by choice, who she becomes",
      h1b: ".",
      lede: "A Japanese 2D raising simulation about a robot girl who has lost her memories and must build a life from scratch. Each turn you choose how she spends her time, going out, working, entering tournaments, and through those actions she grows and forms bonds with the humans and robots around her. Your choices, the dialogue you pick, and the results of her battles accumulate and branch the story into multiple endings, all aimed at winning the Robot Battle Championship. It is a raising sim with adventure and RPG elements. Made by Japan's doujin circle DeskClub Games. It supports English, yet it is Japan-centered and the wider West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "She begins as a blank slate, a robot with no memories, so the work is not steering a fixed character but deciding, turn by turn, who she is going to be: every block of time you spend on going out, working, or training is a brushstroke on an empty canvas.",
        "The pull is that nothing is wasted: each action she takes, each dialogue choice you pick, and each battle result quietly accumulates into stats and bonds, so you feel a person taking shape out of the choices you keep making, not out of a script you are handed.",
        "And because those accumulated choices and battle results branch into one of several endings around the Robot Battle Championship, finishing one route only makes you reach to schedule her differently, spend her time another way, and find the self you did not raise the first time.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Princess Maker loop of scheduling a girl's time over a fixed period and watching accumulated stats and choices slowly decide her future, branching into many endings",
        "You want that core grafted onto an amnesiac robot's self-rediscovery: choose her actions turn by turn, bond with humans and robots, and let your choices, dialogue, and battle results pile up toward winning a Battle Championship across multiple endings",
        "You want a Japanese doujin gem the wider West has barely noticed, Very Positive at 97 percent over 190 reviews, that already supports English",
      ],
      bad: [
        "You want fast action or pure reflex; the battles feed a raising loop and the heart of the game is scheduling, choosing, and accumulating, not twitch combat",
        "You expect a big, already-popular Western title; this is a Japanese-led doujin work, paid at 1,900 yen, and still largely undiscovered abroad (about 18 percent of reviews are English)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ロボット少女は夢を見る - 記録を失ったロボット少女を、選択で一つずつ育て、分岐するエンディングへ導く、プリンセスメーカー2の系譜の埋もれた日本の育成シム",
      description: "記録を失ったロボット少女が主人公の、日本の2D育成シミュレーション。毎ターン、彼女の時間の使い方——外出、仕事、大会への参加——を選び、その行動を通じて成長させ、人間やロボットと絆を結ぶ。あなたの選択、選んだ選択肢、戦闘の結果が積み重なり、物語は複数のエンディングへ分岐する。全ては「ロボットバトルチャンピオンシップ優勝」を軸に編まれている。日本の同人サークル DeskClub Games 制作。190レビュー97%で非常に好評。英語に対応済みだが、日本中心で、広い西側はまだほとんど見つけていない。",
      h1a: "彼女が誰だったかを思い出すな。",
      h1flip: "選択で一つずつ、彼女が誰になるかを組み上げろ",
      h1b: "。",
      lede: "記録を失ったロボット少女が、ゼロから人生を築いていく、日本の2D育成シミュレーション。毎ターン、彼女の時間の使い方——外出、仕事、大会への参加——を選び、その行動を通じて彼女は成長し、周囲の人間やロボットと絆を結んでいく。あなたの選択、選んだ選択肢、そして戦闘の結果が積み重なり、物語は複数のエンディングへと分岐する。その全ては「ロボットバトルチャンピオンシップ優勝」を軸に編まれている。アドベンチャーとRPGの要素を備えた育成シムだ。日本の同人サークル DeskClub Games が手がける。英語に対応済みだが、日本中心で、広い西側はまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "彼女は空白の石板——記録を持たないロボットとして始まる。だから仕事は、決まったキャラクターを操ることではなく、1ターンずつ「彼女が誰になるか」を決めることだ。外出、仕事、訓練に費やす時間の一区切りが、白いカンバスに置く一筆になる。",
        "手を止めさせないのは、何ひとつ無駄にならないという感覚だ。彼女がとる行動、あなたが選ぶ選択肢、そして戦闘の結果が、静かにパラメータと絆へと積み上がっていく。だから、渡された脚本からではなく、自分が選び続けた選択から、一人の人格が形づくられていくのを感じる。",
        "そして積み上がった選択と戦闘結果は、ロボットバトルチャンピオンシップを軸に、いくつものエンディングのいずれかへ分岐する。だから一つのルートを見届けるたびに、今度は違う育て方を組み、別の時間の使い方をして、最初には育てなかった「もう一人の彼女」を見つけたくて、手が伸びる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "「少女の時間を一定期間スケジューリングし、積み上がったパラメータと選択が少しずつ未来を決め、数多のエンディングへ分岐する」プリンセスメーカーのループが好きな人",
        "その核を、記録を失ったロボットの自己再発見に接ぎ木した作品が欲しい人——1ターンずつ彼女の行動を選び、人間やロボットと絆を結び、選択・選択肢・戦闘結果を積み上げてバトルチャンピオンシップ優勝と複数エンディングへ向かう",
        "広い西側がまだほとんど気づいていない、日本の同人原石が欲しい人——190レビュー97%で非常に好評、しかも英語に対応済み",
      ],
      bad: [
        "速いアクションや純粋な反射が欲しい人(戦闘は育成ループに供給される要素で、本作の核はスケジューリング・選択・蓄積にあり、瞬間反応の戦闘ではない)",
        "すでに西で人気の大作を期待する人(本作は日本主体の同人作で、価格1,900円の有料作、海外ではまだ広く未発見——英語レビューは約18%)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "fish-in-the-bottle": {
    published: "2026-06-27",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "point-click-puzzle", lineage: "igyou-no-machi-no-annie", obscurity: "deep", rarity: { reviews: 93, positivePct: 99, noEnglish: false } },
    games: [
      {
        name_en: "For the Fish in the Bottle",
        name_ja: "瓶の中のサカナのために",
        status: "hidden",
        steam: "https://store.steampowered.com/app/4034190/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A free Japanese point-and-click puzzle game, played entirely with the mouse, set in a hand-drawn, black-and-white, picture-book-surreal desert world. From a first-person view you wander the scene, examine what is there, and solve short, escape-style puzzles by finding items and dragging them onto where they belong, gathering the things a lonely fish trapped inside a bottle wants. A single run is about twenty minutes, with no time limit and no puzzles that lean on language, sound, or color, so it plays the same in any tongue, and the artwork and music are all original and hand-made. Made by the Japanese doujin creator pickee under the name makina game, released June 2026. Very Positive at 93 reviews and 99 percent. It already supports Japanese, English, Simplified Chinese, and Korean (about 28 percent of reviews are English), yet this free, short doujin gem is still largely undiscovered by the wider West.",
        desc_ja: "操作はすべてマウスクリックのみ、白黒トーンの手描き・絵本調シュールな砂漠世界を舞台にした、無料の日本産ポイント＆クリック謎解きゲーム。一人称視点で世界を見渡し、その場を調べ、アイテムを見つけてしかるべき場所へドラッグすることで、短い脱出ゲーム系のパズルを解いていく——瓶の中に閉じ込められた孤独なサカナが望むものを、ひとつずつ集めていく。1周は約20分、時間制限は無く、言語・音・色に依存するパズルも無いので、どの言語でも同じように遊べる。アートワークも音楽もすべて手作りのオリジナルだ。日本の同人クリエイター pickee が「makina game」名義で手がけ、2026年6月に配信。93レビュー99%で非常に好評。日本語・英語・簡体字中国語・韓国語に対応済み(英語レビューは約28%)だが、この無料の短編同人原石を、広い西側はまだほとんど見つけていない。",
      },
      {
        name_en: "Igyou no Machi no Annie",
        name_ja: "異形の街のアニー",
        status: "established",
        freem: "https://www.freem.ne.jp/win/game/25169",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: Igyou no Machi no Annie, a freeware point-and-click adventure created by Qpic, the officially recognized Physics Research Club of Kyushu University, and distributed on the Japanese free-game platform Freem in 2020. Set in a hand-drawn, black-and-white, picture-book world of misshapen figures, it is played entirely by mouse: you click through a surreal town and solve its puzzles by examining each scene and dragging the items you find onto where they belong, all carried by original, hand-made artwork and music. For the Fish in the Bottle is a clear heir to that taste, made by pickee, who wrote the scenario and designed the characters for Annie: it keeps the same monochrome hand-drawn surrealism, the same all-mouse point-and-click solving with item drag-and-drop, and the same original art and music, but moves them into a short desert tale of bringing a lonely fish in a bottle what it wants, making it its own creature rather than a clone.",
        desc_ja: "この味の原点。異形の街のアニーは、九州大学の公認サークル「Qpic(九州大学物理研究部)」が制作し、日本のフリーゲーム配信サイト「ふりーむ」で2020年に頒布されたフリーのポイント＆クリック・アドベンチャーだ。白黒トーンの手描き・絵本調の、異形の者たちが暮らす世界を舞台に、操作はすべてマウス——シュールな街をクリックで巡り、その場面を調べ、見つけたアイテムをしかるべき場所へドラッグして謎を解いていく。その全ては、手作りのオリジナルのアートワークと音楽に支えられている。瓶の中のサカナのためには、その直系——本作の開発者 pickee は、まさにこの『異形の街のアニー』のシナリオとキャラクターデザインを担当した人物だ。白黒手描きのシュールさ、全操作マウスのポイント＆クリック＋アイテムのドラッグ＆ドロップ、手作りのオリジナルの絵と音——その同じDNAを受け継ぎながら、瓶に囚われた孤独なサカナが望むものを届ける短い砂漠の物語へと移し替え、模倣ではない独自の一作へと仕立てている。",
      },
    ],
    en: {
      title: "For the Fish in the Bottle - a buried free Japanese point-and-click puzzle where you click through a hand-drawn black-and-white surreal desert to bring a lonely bottled fish what it wants, an heir to Igyou no Machi no Annie",
      description: "A free Japanese point-and-click puzzle game played entirely with the mouse, set in a hand-drawn, black-and-white, picture-book-surreal desert. From a first-person view you examine the scene and solve short, escape-style puzzles by finding items and dragging them where they belong, gathering what a lonely fish trapped in a bottle wants. About a twenty-minute run, no time limit, and no puzzles that depend on language, sound, or color; all art and music are original and hand-made. By the Japanese doujin creator pickee under the name makina game. Very Positive at 93 reviews and 99 percent; it supports English, yet this free short doujin gem is still barely found in the West.",
      h1a: "Don't rush to the answer. ",
      h1flip: "Wander the hand-drawn silence and bring the fish what it wants",
      h1b: ".",
      lede: "A free Japanese point-and-click puzzle game, played entirely with the mouse, set in a hand-drawn, black-and-white, picture-book-surreal desert world. From a first-person view you wander the scene, examine what is there, and solve short, escape-style puzzles by finding items and dragging them onto where they belong, gathering the things a lonely fish trapped inside a bottle wants. A run is about twenty minutes, with no time limit and no puzzles that lean on language, sound, or color, and the artwork and music are all original and hand-made. Made by the Japanese doujin creator pickee under the name makina game, in the lineage of Igyou no Machi no Annie. It already supports English, yet this free, short doujin gem is still largely undiscovered by the wider West.",
      s1: "First, the one feeling",
      feeling: [
        "You are handed a black-and-white, hand-drawn desert that reads like a page torn from a strange picture book, and the only verb you have is the click, so the work is not reflexes or reading but looking: noticing what sits slightly wrong in the scene.",
        "Somewhere a lonely fish waits inside a bottle, wanting something, and you wander the surreal town to find an item and drag it onto where it belongs, every puzzle solved by the eye and the hand alone, with no language, sound, or color cue to lean on and no clock to push you.",
        "Because a full run is only about twenty minutes and asks nothing of you but attention, you sink into its quiet melancholy, and the last thing you bring the fish closes the loop so cleanly that you reach to go back and click every corner you walked past.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Igyou no Machi no Annie taste of a hand-drawn, black-and-white, picture-book-surreal world you explore entirely by mouse, solving its puzzles by looking and dragging items where they belong, all carried by original, hand-made art and music",
        "You want a short, self-contained point-and-click, escape-style puzzle, about twenty minutes, with no time limit and no puzzles that depend on language, sound, or color, just observation and logic toward gathering what a lonely fish in a bottle wants",
        "You want a free Japanese doujin gem the wider West has barely found, Very Positive at 99 percent, that already supports English",
      ],
      bad: [
        "You want action, fast reflexes, or a long campaign; this is a short, slow, click-only puzzle of looking and dragging, about twenty minutes with no time limit, so the appeal is the quiet, not challenge or length",
        "You expect a big, already-popular Western title; this is a free Japanese doujin short made under the name makina game, brief by design, and still largely undiscovered abroad (about 28 percent of reviews are English)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "瓶の中のサカナのために - 手描き白黒のシュールな砂漠をクリックで巡り、瓶の中の孤独なサカナが望むものを届ける、異形の街のアニーの系譜の埋もれた日本のポイント＆クリック謎解き",
      description: "操作はすべてマウスのみ、手描き白黒・絵本調シュールな砂漠を舞台にした、無料の日本産ポイント＆クリック謎解き。一人称視点で場面を調べ、アイテムを見つけてしかるべき場所へドラッグし、短い脱出ゲーム系のパズルを解いて、瓶に囚われた孤独なサカナが望むものを集める。1周約20分、時間制限なし、言語・音・色に依存するパズルもなし。絵も音もすべて手作りのオリジナル。日本の同人クリエイター pickee が makina game 名義で制作。93レビュー99%で非常に好評。英語に対応済みだが、この無料の短編同人原石を、西はまだほとんど見つけていない。",
      h1a: "答えを急ぐな。",
      h1flip: "手描きの静けさをさまよい、サカナが望むものを届けろ",
      h1b: "。",
      lede: "操作はすべてマウスクリックのみ、白黒トーンの手描き・絵本調シュールな砂漠世界を舞台にした、無料の日本産ポイント＆クリック謎解きゲーム。一人称視点で世界を見渡し、その場を調べ、アイテムを見つけてしかるべき場所へドラッグすることで、短い脱出ゲーム系のパズルを解いていく——瓶の中に閉じ込められた孤独なサカナが望むものを、ひとつずつ集めていく。1周は約20分、時間制限は無く、言語・音・色に依存するパズルも無い。アートワークも音楽もすべて手作りのオリジナルだ。日本の同人クリエイター pickee が「makina game」名義で手がける、異形の街のアニーの系譜に連なる一本。英語に対応済みだが、この無料の短編同人原石を、広い西側はまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "手渡されるのは、奇妙な絵本から破り取った一葉のような、白黒の手描きの砂漠だ。持っている動詞はクリックだけ。だから仕事は反射神経でも読みでもなく、見ること——その場面で、何かがほんの少し噛み合っていない箇所に気づくことだ。",
        "どこかで、瓶の中の孤独なサカナが何かを望んで待っている。あなたはシュールな街をさまよってアイテムを見つけ、しかるべき場所へドラッグする。あらゆる謎は、目と手だけで解かれる——言語も、音も、色の手がかりも頼れず、急かす時計も無い。",
        "1周はわずか約20分で、求められるのは注意を向けることだけ。だからその静かな物悲しさに沈み込んでいく。最後にサカナへ届けた一品がループをあまりにきれいに閉じるから、通り過ぎたすべての隅を、もう一度クリックして回りたくて手が伸びる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "手描き白黒・絵本調シュールな世界を、すべてマウスで探索し、見て、アイテムをしかるべき場所へドラッグして謎を解く——その全てが手作りのオリジナルの絵と音に支えられた、異形の街のアニーの手触りが好きな人",
        "短く完結する、脱出ゲーム系のポイント＆クリック謎解きが欲しい人——約20分、時間制限なし、言語・音・色に依存するパズルもなく、観察と論理だけで、瓶の中の孤独なサカナが望むものを集めていく",
        "広い西側がまだほとんど見つけていない、無料の日本の同人原石が欲しい人——99%で非常に好評、しかも英語に対応済み",
      ],
      bad: [
        "アクションや速い反射、歯ごたえや長さが欲しい人(本作は見て・ドラッグするだけの、短くゆっくりしたクリック専用パズルで、約20分・時間制限なし——快感は手応えや長さではなく、静けさにある)",
        "すでに西で人気の大作を期待する人(本作は makina game 名義で作られた無料の日本の同人短編で、設計上ごく短く、海外ではまだ広く未発見——英語レビューは約28%)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "electrogical": {
    published: "2026-06-28",
    publishAt: "2026-06-28",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "arithmetic-puzzle", lineage: "kenken", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 85, positivePct: 93, noEnglish: false } },
    games: [
      {
        name_en: "Electrogical",
        name_ja: "エレクトロジカル",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2501650/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese arithmetic wiring puzzle that crosses jigsaw assembly with the four operations of arithmetic (plus, minus, times, divide). Each piece carries a number and interlocking tabs, and you connect them so that the four operations transform the current and land it exactly on a goal's target value, powering the circuit to completion. Set in a far-future terraforming world, you repair aging power reactors, the distribution dungeons, alongside a superconducting lifeform called neko. It is mouse-only, hand-drawn pixel art, with over 250 stages, no time limit, and built-in hints, a roughly four-to-six-hour run. Made by kinjo, a solo developer based in Okinawa, Japan, and published by Tokyo's indie label Phoenixx; it is an award-winning entry from the first GYAAR Studio Indie Game Contest run by Bandai Namco Studios. Released in Early Access in November 2024 and fully launched on 15 April 2026, so it is out of Early Access. Very Positive at 85 reviews and 93 percent. It already supports English, Japanese, Simplified and Traditional Chinese, German, and Russian, yet with only about 20 English reviews (23.5 percent) the wider West has barely found it. At 980 yen it is a paid, fully released game.",
        desc_ja: "ジグソーパズルと四則演算（＋−×÷）を掛け合わせた、日本の通電パズル。数字が書かれた凹凸ピースを四則演算で繋ぎ、ゴールの目標値ぴったりに電力を調整して回路に通電させる。遠未来のテラフォーミングを舞台に、超伝導生命体「neko」と共に、老朽化した発電炉（配電ダンジョン）を修復していく。操作はマウスのみ、手描きのドット絵で、250以上のステージ、時間制限はなく、ヒントも備わっている。プレイ時間は約4〜6時間。沖縄在住の個人開発者 kinjo が制作し、東京の日本インディーパブリッシャー Phoenixx（株式会社Phoenixx）が販売する、第1回 GYAAR Studio インディーゲームコンテスト（バンダイナムコスタジオ）の入賞作だ。2024年11月にアーリーアクセスを開始し、2026年4月15日に正式リリース——アーリーアクセスは脱している。85レビュー93%で非常に好評。英語・日本語・簡体字中国語・繁体字中国語・ドイツ語・ロシア語に対応済み(英語レビューは約23.5%)だが、広い西側はまだほとんど見つけていない。価格980円の有料作・正式リリース済みである。",
      },
      {
        name_en: "KenKen",
        name_ja: "賢くなるパズル",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/KenKen",
        wikidata: "https://www.wikidata.org/wiki/Q372499",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: KenKen, known in Japan as Kashikoku Naru Puzzle and internationally as Calcudoku, an arithmetic logic puzzle devised by the Japanese educator Tetsuya Miyamoto in 2004. On a Latin-square grid divided by heavy outlines into cages, each cage prints a target number and one of the four operations, and you fill in digits so that each cage's numbers combine through its operation to reach that target, with no number repeating in any row or column. It crystallized the puzzle of bending the four operations to make numbers hit an exact target value, the arithmetic-puzzle lineage. Electrogical is a clear heir to that idea: it keeps the core of working plus, minus, times, and divide to land on an exact goal value, but lifts it off the grid and onto physical jigsaw pieces you interlock to wire and power a circuit, set inside a far-future terraforming tale, making it its own creature rather than a clone. There is no official Steam release of KenKen, so its origin is anchored to its Wikidata entry.",
        desc_ja: "この味の原点。KenKen(日本名・賢くなるパズル、海外名 Calcudoku)は、日本の教育者・宮本哲也が2004年に考案した算数の論理パズルだ。ラテン方陣のグリッドが太線で「ケージ」に区切られ、各ケージには目標の数と四則演算のいずれか一つが指定される。プレイヤーは、各行・各列に数字が重複しないようにしつつ、ケージ内の数字を指定された演算で組み合わせて、その目標値ぴったりにする。「四則演算で数字を、ぴったりの目標値にする」というパズルを結晶化させた、算数パズルの系譜の原点である。エレクトロジカルはその直系——＋−×÷をやりくりして、ぴったりのゴール値に合わせるという核を受け継ぎながら、それをグリッドから引き剥がし、物理的に噛み合わせて回路を配線し通電させるジグソーピースへと載せ替え、遠未来のテラフォーミングの物語の中へ移している。模倣ではない独自の一作だ。KenKen の公式 Steam 版は存在しないため、その原点は Wikidata のエントリで同定する。",
      },
    ],
    en: {
      title: "Electrogical - a buried Japanese arithmetic wiring puzzle where you chain numbered jigsaw pieces and bend the four operations to land the current exactly on target, an heir to KenKen",
      description: "A Japanese arithmetic wiring puzzle that crosses jigsaw assembly with the four operations. Each piece carries a number; you connect them so plus, minus, times, and divide transform the current and land it exactly on a goal's target, powering aging reactors back to life alongside a superconducting lifeform called neko in a far-future terraforming world. Mouse-only pixel art, 250-plus stages, no time limit, hints included. By kinjo, an Okinawa solo developer, published by Phoenixx; an award-winning entry from the first GYAAR Studio Indie Game Contest. Very Positive at 85 reviews and 93 percent; it supports English, yet the wider West has barely found it.",
      h1a: "Don't just wire it. ",
      h1flip: "Compute the four operations until the current lands exactly on target",
      h1b: ".",
      lede: "A Japanese arithmetic wiring puzzle that crosses jigsaw assembly with the four operations of arithmetic. Each piece carries a number and interlocking tabs, and you connect them so that plus, minus, times, and divide transform the current and land it exactly on a goal's target value, powering aging reactors, the distribution dungeons, back to life alongside a superconducting lifeform called neko in a far-future terraforming world. It is mouse-only, hand-drawn pixel art, with over 250 stages, no time limit, and built-in hints. Made by kinjo, a solo developer based in Okinawa, Japan, published by Phoenixx, and an award-winning entry from the first GYAAR Studio Indie Game Contest. It already supports English, yet the wider West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "The board hands you number pieces with interlocking tabs and a goal that wants one exact value, so the work is not assembling a pretty shape but computing: choosing which pieces to chain and which of plus, minus, times, and divide turns their numbers into precisely the figure the circuit demands.",
        "The click lands the instant a tangle of pieces resolves onto the exact target and the current floods a dead reactor back to life, because nothing counts until it is exactly right: one over or one under and the circuit stays dark, so every solve is a small proof rather than a lucky fit.",
        "There is no clock, and hints wait if you stall, so the pull is purely the itch to make the number land, and with over 250 stages the next dead circuit is always waiting, each a fresh little equation hidden inside a jigsaw, drawing you to wire just one more back to life.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the KenKen idea of bending the four operations to make numbers hit an exact target value, the pure arithmetic-puzzle core, rather than action or twitch",
        "You want that core lifted onto physical jigsaw pieces you interlock to wire and power a circuit: chain numbered pieces, choose plus, minus, times, or divide, and land the current exactly on each goal across 250-plus stages, with no time limit and hints when you stall",
        "You want a Japanese solo-dev indie gem the wider West has barely noticed, an award-winning entry from the first GYAAR Studio Indie Game Contest, Very Positive at 93 percent over 85 reviews, that already supports English",
      ],
      bad: [
        "You want action, fast reflexes, or fail states; this is a slow arithmetic puzzle with no time limit and built-in hints, so the thrill is landing the exact number, not being quick",
        "You expect a big, already-popular Western title; this is a Japanese solo-dev indie, paid at 980 yen, fully released out of Early Access, and still largely undiscovered abroad (about 23.5 percent of reviews are English)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "エレクトロジカル - 数字の凹凸ピースを繋ぎ、四則演算で電力を目標値ぴったりに合わせて通電させる、KenKen(賢くなるパズル)の系譜の埋もれた日本の算数パズル",
      description: "ジグソーパズルと四則演算（＋−×÷）を掛け合わせた、日本の通電パズル。数字が書かれた凹凸ピースを繋ぎ、四則演算で電力を目標値ぴったりに調整して回路に通電させる。遠未来のテラフォーミングを舞台に、超伝導生命体「neko」と共に老朽化した発電炉（配電ダンジョン）を修復していく。マウス操作のみ・ドット絵・250以上のステージ・時間制限なし・ヒントあり。沖縄の個人開発者 kinjo が制作し、Phoenixx が販売する、第1回 GYAAR Studio インディーゲームコンテスト入賞作。85レビュー93%で非常に好評。英語に対応済みだが、広い西側はまだほとんど見つけていない。",
      h1a: "ただ繋ぐな。",
      h1flip: "四則演算で電力を、目標値ぴったりに合わせろ",
      h1b: "。",
      lede: "ジグソーパズルと四則演算（＋−×÷）を掛け合わせた、日本の通電パズル。数字が書かれた凹凸ピースを繋ぎ、四則演算で電力を変換して、ゴールの目標値ぴったりに合わせて回路に通電させる。遠未来のテラフォーミングを舞台に、超伝導生命体「neko」と共に、老朽化した発電炉（配電ダンジョン）を修復していく。操作はマウスのみ、手描きのドット絵で、250以上のステージ、時間制限はなく、ヒントも備わっている。沖縄在住の個人開発者 kinjo が手がけ、Phoenixx が販売する、第1回 GYAAR Studio インディーゲームコンテストの入賞作だ。英語に対応済みだが、広い西側はまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "盤面が手渡すのは、噛み合う凹凸と数字を持つピースと、たった一つの目標値を欲しがるゴールだ。だから仕事は、きれいな形を組むことではなく、計算すること——どのピースを繋ぎ、＋−×÷のどれでその数字を、回路が求める値ぴったりへ変えるかを選ぶことだ。",
        "もつれたピースが目標値ぴったりに収束し、死んでいた発電炉に電流がなだれ込んで蘇る——その瞬間に手応えが来る。ぴったり正しくなるまで何も成立しないからだ。一つ多くても、一つ足りなくても回路は暗いまま。だからどの一手も、まぐれの当てはめではなく、小さな証明になる。",
        "急かす時計はなく、詰まればヒントも待っている。だから手を止めさせるのは「この数字を合わせたい」という純粋な疼きだけだ。250以上のステージで、次に死んだ回路が常に待っている——どれもジグソーの中に隠れた小さな方程式で、もう一つだけ蘇らせたくて手が伸びる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "「四則演算で数字を目標値ぴったりに合わせる」KenKen(賢くなるパズル)の発想が好きな人——核にあるのは純粋な算数パズルで、アクションや反射ではない",
        "その核を、物理的に繋ぐジグソーピースに載せ替えた作品が欲しい人——数字のピースを連結し、＋−×÷を選び、250以上のステージで電力を各ゴールぴったりに合わせて通電させる。時間制限はなく、詰まればヒントもある",
        "広い西側がまだほとんど気づいていない、日本の個人開発インディー原石が欲しい人——第1回 GYAAR Studio インディーゲームコンテスト入賞作で、85レビュー93%で非常に好評、しかも英語に対応済み",
      ],
      bad: [
        "アクションや速い反射、失敗ペナルティが欲しい人(本作は時間制限もなくヒントも備わった、じっくり解く算数パズルで、快感は速さではなく「数字をぴったり合わせること」にある)",
        "すでに西で人気の大作を期待する人(本作は日本の個人開発インディーで、価格980円の有料作・アーリーアクセスを脱した正式リリース済み、海外ではまだ広く未発見——英語レビューは約23.5%)",
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

// wikidata URL から QID(例 "Q2632064")を抽出(計算だけ・副作用なし)。形式 .../wiki/Q<digits> のみ受ける。
//   無し/不正は null(捏造しない)。原点ページの Wikidata リンク表示(QID ラベル)を一様に扱う入口(SSOT)。
export function wikidataQid(wikidataUrl: string | undefined): string | null {
  if (!wikidataUrl) return null;
  const m = /\/wiki\/(Q\d+)$/.exec(wikidataUrl);
  return m ? m[1] : null;
}

// Steam app id を Steam ストアの正準 URL に変換(計算だけ・副作用なし)。原点ページの Steam 出典リンク用。
//   established 側の完全な Steam URL(タイトル slug 付き)とは別に、anchor の app id から正準 store URL を
//   組む(slug 不要・store.steampowered.com/app/<id>/ は Steam 公式が title へ解決する)。無し/null は null。
export function steamStoreUrl(appId: string | null): string | null {
  if (!appId) return null;
  return "https://store.steampowered.com/app/" + appId + "/";
}

// lineage id -> 原点 established を同定する識別子(多態)。原点名そのものは picks 内の games[] に
// established として既出 = SSOT。ここでは「どの established が原点か」だけを同定する。
//   steam   : Steam app id(後方互換・PC 作品の原点)。
//   wikidata: Wikidata QID URL(Steam 版が無い原点。例 Archero はモバイル専用で Steam 版なし)。
//   freem   : ふりーむ 配信ページ URL(Steam 版も wikidata QID も無いフリーゲーム発の原点)。
// いずれか一つを持つ。複数持つ場合は steam > wikidata > freem の順で優先する(後方互換)。
//   blurb   : この原点が「何の系譜の原点か」を説明する解説文(en/ja)。researcher が事実確証した
//             二言語の散文(SSOT・この 1 箇所にだけ持つ)。blurb を持つ anchor だけが /origins/<id>/
//             の個別ページを生やす(originAnchorIds で抽出)。原点名は持たせない(lineageName で逆引き=
//             二重定義を避ける)。blurb 無しの anchor は従来通り名前の逆引きのみに使う(後方互換)。
const LINEAGE_ANCHOR = {
  "superhot": {
    steam: "322500",
    blurb: {
      en: "SUPERHOT is a first-person shooter developed by the independent Superhot Team and released in 2016, built around a single signature mechanic: time moves only when you move. Standing still freezes the world almost completely, letting the player study a room full of bullets and enemies and plan inside frozen moments, then act and watch time surge forward. It crystallized and popularized the time-flows-with-your-motion design, and is the origin of the lineage of games that bind the passage of time to player action.",
      ja: "SUPERHOT は、独立系の Superhot Team が開発し2016年に発売した一人称シューティングで、ただ一つの象徴的なメカニクス——「時間は、自分が動いたときだけ進む」——を核に作られている。静止すれば世界はほぼ完全に凍りつき、弾と敵で満ちた部屋を、凍った一瞬のなかで読み、計画してから動き、時間が一気に走り出すのを見届ける。「時間が自分の動きと共に流れる」というデザインを結晶化させ広く知らしめた作品であり、時間の流れをプレイヤーの行動に結びつけるゲーム群の系譜の原点である。",
    },
  },
  "slay-the-spire": {
    steam: "646570",
    blurb: {
      en: "Slay the Spire is a roguelike deck-building game developed by the American indie studio Mega Crit, launched in early access in late 2017 and fully released in January 2019. By combining procedurally generated ascents of a multi-floor spire with deck-building combat in which cards are gained as run rewards, it popularized and is widely credited with defining the roguelike deckbuilder genre, inspiring later titles such as Monster Train.",
      ja: "Slay the Spireは、米国のインディースタジオMega Critが開発したローグライク・デッキ構築ゲームで、2017年末にアーリーアクセス、2019年1月に正式リリースされた。手続き生成される多層の塔の登攀と、戦闘の報酬としてカードを得て構築するデッキ戦闘を組み合わせ、「ローグライク・デッキビルダー」というジャンルを広く普及・定義したと評価され、Monster Trainなど後続作品に影響を与えた、その系譜の原点である。",
    },
  },
  "obra-dinn": {
    steam: "653530",
    blurb: {
      en: "Return of the Obra Dinn is a first-person mystery and deduction game created by Lucas Pope and published by 3909 LLC, released for Windows and macOS in October 2018 as Pope's follow-up to Papers, Please. Casting the player as an insurance investigator reconstructing the fates of a ship's crew through frozen-moment scenes and pure logical deduction, and rendered in a 1-bit monochrome style, it is a defining origin of the modern logic-deduction puzzle adventure.",
      ja: "Return of the Obra Dinnは、Lucas Popeが制作し3909 LLCが販売した一人称のミステリ・推理ゲームで、『Papers, Please』に続く作品として2018年10月にWindows・macOS向けに発売された。プレイヤーを保険調査員とし、静止した瞬間の場面と純粋な論理的推理だけで船員たちの運命を再構成させる仕組みと、1ビットのモノクロ表現を特徴とし、現代の論理推理パズルアドベンチャーの系譜を定義した原点である。",
    },
  },
  "two-point-hospital": { steam: "535930" },
  "archero": { wikidata: "https://www.wikidata.org/wiki/Q116031886" },
  "her-story": { steam: "368370" },
  // 原点 Orwell: Keeping an Eye on You, Osmotic Studios / Daedalic Entertainment, 2016。プレイヤーは
  // 政府の監視システム「The Orwell」のオペレーターとなり、対象人物のオンライン情報(SNS・チャット・私的
  // ファイル・ニュース)「だけ」を読み、真偽の入り混じる証拠の断片(datachunk)をプロファイルにドラッグして
  // 真相を確定していく。公開情報の取捨選択と引用で人物像を組み上げる OSINT 調査型アドベンチャーの系譜の原点。
  // Steam 版あり(app 491950)→ steam で同定(established 側と /app/491950/ で完全一致・href 破損回避)。
  "orwell": {
    steam: "491950",
    blurb: {
      en: "Orwell: Keeping an Eye on You is an investigative adventure game developed by Osmotic Studios and published by Daedalic Entertainment, released in 2016. Casting the player as an operator of a government surveillance system called The Orwell, it has you read only a suspect's online traces, their social posts, chat logs, private files, and news, and drag fragments of conflicting evidence into a profile to decide who they are and what they did. By building deduction out of reading public and leaked information and choosing which excerpts to submit as proof, it defined the OSINT-style investigation adventure, the lineage of games where you solve a case from someone's digital footprint alone.",
      ja: "Orwell: Keeping an Eye on You は、Osmotic Studios が開発し Daedalic Entertainment が販売した調査アドベンチャーで、2016年に発売された。プレイヤーは政府の監視システム「The Orwell」のオペレーターとなり、対象人物のオンラインの痕跡——SNSの投稿、チャットのログ、私的なファイル、ニュース——「だけ」を読み、真偽の入り混じる証拠の断片をプロファイルへドラッグして、その人物が何者で何をしたのかを確定していく。公開情報やリークされた情報を読み解き、どの一節を証拠として提出するかを選ぶことで推理を組み上げる仕組みにより、「人物のデジタルな足跡だけで事件を解く」OSINT 調査型アドベンチャーの系譜を確立した、その原点である。",
    },
  },
  "to-the-moon": {
    steam: "206440",
    blurb: {
      en: "To the Moon is a narrative-focused adventure game developed and published by Freebird Games, designed by Kan Gao using RPG Maker XP and released in November 2011 as the studio's first commercial title. With minimal gameplay and a story about two doctors fulfilling a dying man's last wish through artificial memories, it won GameSpot's 2011 Best Story award and is a key origin of the emotionally driven, story-first indie adventure made in RPG Maker.",
      ja: "To the Moonは、Freebird Gamesが開発・販売した物語重視のアドベンチャーゲームで、Kan GaoがRPGツクールXPを用いて制作し、同スタジオ初の商業作品として2011年11月に発売された。ゲーム的操作を最小限に抑え、瀕死の男の最後の願いを人工記憶で叶える2人の医師を描いた物語で、GameSpotの2011年「ベストストーリー」賞を受賞し、RPGツクール製で感情と物語を最優先するインディーアドベンチャーの系譜の重要な原点である。",
    },
  },
  "metal-hellsinger": { steam: "1061910" },
  "uncharted-waters-2": { steam: "628170" },
  "dungeon-keeper": { steam: "1996630" },
  "princess-maker-2": {
    steam: "523000",
    blurb: {
      en: "Princess Maker 2 is a raising simulation developed by Gainax, originally released in 1993 (the Refine edition is the one on Steam). The player becomes the foster father of a young daughter and spends years scheduling her education, work, and lessons, watching parameters accumulate until those choices branch into one of many endings, from queen to merchant to ordinary townsfolk. As the defining entry in the Princess Maker series begun in 1991, it crystallized the raising-sim loop of scheduling a girl's time over a fixed period and letting accumulated stats and choices decide her future, and is a foundational origin of the raising simulation lineage.",
      ja: "プリンセスメーカー2は、ガイナックスが開発した育成シミュレーションで、1993年に発売された(Steam 版は Refine 版)。プレイヤーは幼い娘の養父となり、何年もかけて教育・仕事・けいこごとの予定を組み、パラメータが積み上がっていくのを見守る。その選択の蓄積は、女王から商人、市井の人まで、数多のエンディングのいずれかへと分岐していく。1991年に始まったプリンセスメーカーシリーズを代表する一作として、「少女の時間を一定期間スケジューリングし、積み上がったパラメータと選択でその未来を決める」育成シムのループを結晶化させた、育成シミュレーションの系譜の礎となる原点である。",
    },
  },
  "doki-doki-literature-club": { steam: "698780" },
  "clannad": { steam: "324160" },
  "kamaitachi-no-yoru": {
    steam: "2612660",
    blurb: {
      en: "Kamaitachi no Yoru is a sound novel developed and published by Chunsoft for the Super Famicom, released in November 1994 as the studio's second sound novel after Otogirisou (1992). Written by mystery author Takemaru Abiko in the shin-honkaku tradition, it applied the branching-choice sound novel format to a snowbound murder mystery and is the landmark origin of the mystery-focused branch of Japanese sound novels and choice-driven mystery visual novels.",
      ja: "かまいたちの夜は、チュンソフトがスーパーファミコン向けに開発・発売したサウンドノベルで、『弟切草』（1992年）に続く同社2作目のサウンドノベルとして1994年11月に発売された。新本格ミステリの作家・我孫子武丸が執筆し、分岐選択式のサウンドノベルという形式を雪山の殺人ミステリに応用した作品で、ミステリ志向のサウンドノベルおよび選択分岐型ミステリ・アドベンチャーの系譜を切り開いた画期的な原点である。",
    },
  },
  "recettear": { steam: "70400" },
  "twilight-syndrome": { wikidata: "https://www.wikidata.org/wiki/Q7662337" },
  "yume-nikki": { steam: "650700" },
  "fire-emblem-thracia-776": {
    wikidata: "https://www.wikidata.org/wiki/Q2632064",
    blurb: {
      en: "Fire Emblem: Thracia 776 is the fifth entry in Intelligent Systems' tactical RPG series, released for the Super Famicom via the Nintendo Power flash cartridge in 1999 (and on a ROM cartridge in 2000), and is the final title designed by series creator Shouzou Kaga. Known for its high difficulty and mechanics such as capture, fatigue, and the fog of war that later became series staples, it is the origin point of the franchise's most demanding, systems-heavy strand of strategy design.",
      ja: "ファイアーエムブレム トラキア776は、インテリジェントシステムズによるシミュレーションRPGシリーズの第5作で、1999年にスーパーファミコン向けにニンテンドウパワー書き換えで発売（2000年にROMカートリッジ版）、シリーズ生みの親・加賀昭三が手がけた最後の作品である。高難度に加え「捕獲」「疲労」「天候・視界（戦場の霧）」など後のシリーズ定番となる要素を備え、本シリーズで最も歯ごたえのあるシステム特化型の戦略設計の原点となった。",
    },
  },
  "fire-emblem-blazing-blade": {
    wikidata: "https://www.wikidata.org/wiki/Q150180",
    blurb: {
      en: "Fire Emblem: The Blazing Blade is the seventh entry in the series, developed by Intelligent Systems for the Game Boy Advance and released in Japan in April 2003 and in North America in November 2003. It was the first Fire Emblem game localized and released outside Japan, opening the long-Japan-exclusive tactical RPG series to Western audiences and establishing the franchise's international presence.",
      ja: "ファイアーエムブレム 烈火の剣は、インテリジェントシステムズがゲームボーイアドバンス向けに開発したシリーズ第7作で、2003年4月に日本、2003年11月に北米で発売された。シリーズで初めて日本国外向けにローカライズ・発売された作品であり、長く日本専売だったシミュレーションRPGシリーズを西洋市場へ初めて開いた、本シリーズの国際展開の原点である。",
    },
  },
  "into-the-breach": {
    steam: "590380",
    blurb: {
      en: "Into the Breach is a turn-based tactics game developed by the two-person indie studio Subset Games (Justin Ma and Matthew Davis), released for Windows in February 2018 as the studio's follow-up to FTL: Faster Than Light. By showing enemy attacks in advance on a small, fully visible 8x8 grid and challenging players to neutralize threats through perfect-information puzzle-like turns, it defined a distilled, chess-like school of compact tactical design that influenced later turn-based puzzle-strategy games.",
      ja: "Into the Breachは、2人組のインディースタジオSubset Games（Justin MaとMatthew Davis）が開発したターンベースのタクティクスゲームで、『FTL: Faster Than Light』に続く作品として2018年2月にWindows向けに発売された。敵の攻撃を事前に提示し、すべて見渡せる小さな8x8のマス目上で、完全情報のパズルのような一手で脅威を無力化させる設計により、チェスのように凝縮されたコンパクトな戦術設計の系譜を確立し、後続のターン制パズル戦略ゲームに影響を与えた。",
    },
  },
  // 原点 零 -ZERO-(Fatal Frame / Project Zero), Tecmo, 2001。家庭用機作で公式 Steam 版なし
  // → wikidata で同定(Steam id を捏造しない・twilight-syndrome 型 href 破損の回避)。
  "fatal-frame": {
    wikidata: "https://www.wikidata.org/wiki/Q2323933",
    blurb: {
      en: "Fatal Frame (titled Zero in Japan) is a survival horror game developed and published by Tecmo for the PlayStation 2, released in Japan in December 2001. As the first entry in the series, it established the franchise's signature mechanic of fighting ghosts with the Camera Obscura, a defensive camera used to capture and exorcise spirits, defining a Japanese horror style built around photography rather than conventional weapons.",
      ja: "零（ZERO、海外名Fatal Frame）は、テクモがPlayStation 2向けに開発・販売したサバイバルホラーで、2001年12月に日本で発売された。シリーズ第1作として、霊を撮影して退ける防御用カメラ「射影機（カメラ・オブスクラ）」で幽霊と戦うという象徴的な仕組みを確立し、従来の武器ではなく「撮影」を核にした和製ホラーの系譜の原点となった。",
    },
  },
  // 原点 Wizardry: Proving Grounds of the Mad Overlord, 1981(Apple II)。一人称グリッド型
  // パーティ制ダンジョンクロウルの始祖。2024 リメイクで公式 Steam 版あり(app 2518960)
  // → steam で同定(href 破損回避・established 側と /app/2518960/ で完全一致)。
  "wizardry-proving-grounds": {
    steam: "2518960",
    blurb: {
      en: "Wizardry: Proving Grounds of the Mad Overlord, created by Andrew Greenberg and Robert Woodhead and published by Sir-Tech, shipped for the Apple II in September 1981 as the first game in the Wizardry series. As the first party-based role-playing video game, with first-person, grid-based dungeon exploration and turn-based combat, it is a foundational origin of the computer RPG and directly influenced Japanese series such as Dragon Quest and Final Fantasy.",
      ja: "Wizardry: Proving Grounds of the Mad Overlordは、Andrew GreenbergとRobert Woodheadが制作しSir-Techが販売したWizardryシリーズ第1作で、1981年9月にApple II向けに発売された。一人称・グリッド式のダンジョン探索とターン制戦闘を備えた、最初のパーティ制ロールプレイングゲームとして、コンピュータRPGの基礎的な原点であり、ドラゴンクエストやファイナルファンタジーなど日本のシリーズに直接影響を与えた。",
    },
  },
  // 原点 NKODICE(んこダイス), ksym, 2021。同人発のチンチロ・ダイスゲームで、サイコロのランダム性が
  // 偶発的に淫語を組み上げる仕組みが核。日本語版 Wikipedia がウーマンコミュニケーションの公式の
  // 影響元と明記する。Steam 版あり(app 1510950)→ steam で同定(established 側と /app/1510950/ で完全一致)。
  "nkodice": {
    steam: "1510950",
    blurb: {
      en: "NKODICE is a dice game developed by the individual creator ksym and released on Steam in May 2021, based on the traditional Japanese gambling game Chinchirorin. Its hook is that rolled dice show hiragana-like symbols that combine into crude or sexual words, and it became a viral hit, reaching the top of Steam's Japanese sales ranking in June 2021; it is the origin of a small wave of irreverent, word-combination novelty dice games.",
      ja: "NKODICE（んこダイス）は、個人クリエイターksymが開発し2021年5月にSteamで配信されたダイスゲームで、日本の伝統的な賭博「チンチロリン」を題材にしている。出目がひらがな状の記号で表示され、組み合わせると下ネタの単語になるのが特徴で、2021年6月にSteamの日本売上ランキング1位に達するなど口コミでヒットした、悪ノリ的な単語組み合わせ系ノベルティ・ダイスゲームの原点である。",
    },
  },
  // 原点 ひぐらしのなく頃に, 07th Expansion(竜騎士07), 2002(Comiket 同人サウンドノベル)。選択や繰り返しの中で
  // 惨劇に至り、正解で救済へ向かう分岐型恐怖サウンドノベルの構造を確立した和製アマチュア恐怖ノベルの系譜の原点。
  // Steam 版あり(app 310360・MangaGamer 移植)→ steam で同定(established 側と /app/310360/ で完全一致)。
  "higurashi": {
    steam: "310360",
    blurb: {
      en: "Higurashi When They Cry is a sound novel created by the Japanese doujin circle 07th Expansion, written by Ryukishi07, with its first arc released at Comiket in 2002. Set in a small rural village, it unfolds as a looping tragedy in which the same days replay and small choices and missteps spiral toward gruesome violence before later answer arcs reveal the truth and a path to salvation; built and sold as an amateur work, it is the landmark origin of the Japanese amateur horror sound novel and its branching, choice-driven dread.",
      ja: "ひぐらしのなく頃には、日本の同人サークル07th Expansion（竜騎士07）が制作したサウンドノベルで、第1作が2002年のコミックマーケットで頒布された。山あいの小さな村を舞台に、同じ日々が繰り返される惨劇として展開し、わずかな選択や食い違いが凄惨な暴力へと転がり落ち、後の解答編で真相と救済への道が明かされる。アマチュアの手で作られ頒布された作品でありながら、選択分岐と繰り返しによる恐怖を核にした和製アマチュア恐怖サウンドノベルの系譜を切り開いた画期的な原点である。",
    },
  },
  // 原点 学校であった怖い話, パンドラボックス / バナレックス, 1995(スーパーファミコン, 企画・飯島多紀哉)。
  // 語り部を替えながら学校の怖い話・都市伝説を別々のエピソードとして語る、オムニバス形式の和製ホラー
  // テキスト/サウンドノベルの形を確立。その後は個人・小規模インディーの「アパシーシリーズ」として長年展開され、
  // 現在はSteam版「アパシー 鳴神学園 学校であった怖い話 極」(app 2283710)あり → steam で同定(established 側と
  // /app/2283710/ で完全一致・href 破損回避)。怪異番号の「都市伝説オムニバス怪談ノベル」原点として新規 anchor。
  "apathy-school-ghost-stories": {
    steam: "2283710",
    blurb: {
      en: "Gakkou de Atta Kowai Hanashi is a horror sound novel released for the Super Famicom in 1995, planned by Takiya Iijima. Through several narrators who each recount the scary stories, school legends, and urban myths of one school as separate episodes, it built dread through text rather than shock and established the omnibus form of the Japanese horror sound novel. It lived on for years as the personal, small-scale indie Apathy series, with a current Steam version, and is the origin of the urban-legend omnibus ghost-story text novel.",
      ja: "学校であった怖い話は、1995年にスーパーファミコン向けに発売されたホラーサウンドノベルで、飯島多紀哉が企画した。複数の語り部に、一つの学校の怖い話・学校の伝説・都市伝説を、それぞれ別のエピソードとして語らせる形式により、ショックではなくテキストで恐怖を積み上げ、オムニバス形式の和製ホラーサウンドノベルの形を確立した。その後は個人・小規模インディーの「アパシーシリーズ」として長年受け継がれ、現在はSteam版も配信されている、都市伝説オムニバス怪談テキストノベルの系譜の原点である。",
    },
  },
  // 原点 ナルキッソス(narcissu), 片岡とも / ステージ☆なな, 2005(元フリーゲーム発・後に商業化)。
  // 奇跡も英雄もいない現実の中で「死に向かう少女の最期の日々」を死生観として叙情的に描く和製ノベルの系譜の原点。
  // Steam 版あり(10th Anniversary Anthology Project, app 426690)→ steam で同定(established 側と
  // /app/426690/ で完全一致・href 破損回避)。なお別作「零 ZERO」との混同を避けるため anchor は本版を採用。
  "narcissu": {
    steam: "426690",
    blurb: {
      en: "Narcissu is a Japanese visual novel written and directed by Tomo Kataoka and produced by the doujin circle Stage-nana, first released as a free download in 2005 and later expanded and sold commercially. Following a terminally ill young man and woman who slip away from the hospice ward together to spend their final days on the road, with no miracles, heroes, or villains, it is a quiet, melancholy meditation on death; built and given away as an amateur work, it is a landmark origin of the lyrical Japanese kinetic novel that confronts mortality through the last days of someone about to die.",
      ja: "ナルキッソスは、片岡ともが執筆・監督し同人サークル「ステージ☆なな」が制作した和製ノベルゲームで、2005年に無料配布作品として発表され、後に内容を拡張して商業化された。余命わずかな若い男女がホスピスの病棟を抜け出し、最期の日々を車で旅して過ごす——奇跡も英雄も悪役もない——静かで物悲しい死生観の物語である。アマチュアの手で作られ無償で配られた作品でありながら、死に向かう者の最期の日々を通して死を見つめる、叙情的な和製キネティックノベルの系譜の画期的な原点である。",
    },
  },
  // 原点 大戦略(Daisenryaku), SystemSoft, 1985-。マップをエリアに分け、ユニットを運用し、ターン制で
  // 領土を制圧していく日本のコンピュータ・ウォーゲーム(国取りストラテジー)の系譜の元祖。家庭用機/PC作で
  // 公式 Steam 版なし → wikidata で同定(Steam id を捏造しない・twilight-syndrome 型 href 破損の回避)。
  "daisenryaku": {
    wikidata: "https://www.wikidata.org/wiki/Q17229001",
    blurb: {
      en: "Daisenryaku is a turn-based computer wargame series developed and published by SystemSoft, first released in Japan in 1985. By splitting a map into territory that two sides contest turn by turn, deploying and maneuvering individual military units across it, and winning through the conquest of ground, it established the template of the Japanese hex-and-unit strategy wargame, becoming the long-running origin of the turn-based territory-conquest strategy game in Japan.",
      ja: "大戦略は、システムソフトが開発・販売したターン制のコンピュータ・ウォーゲームシリーズで、1985年に日本で初めて発売された。マップを陣取りの領域に分け、両軍がターンごとに奪い合い、個々の戦闘ユニットを配置・運用して領土の制圧によって勝敗を決する仕組みにより、日本における「ユニット運用×領土制圧」型の戦略ウォーゲームの雛形を確立した。ターン制の国取りストラテジーの、長く続く系譜の元祖である。",
    },
  },
  // 原点 なんとなく、クリスタル(田中康夫, 1980)。本作の中核ギミック「ネオ昭和辞典」(約700語の固有名詞を
  // 注釈で解説しながら80年代文化を浴びせる手法)の直接の祖。同時代の風俗・ブランド・流行を442個の膨大な
  // 注釈で作品化したスタイルを確立した小説で、ゲームでない → 公式 Steam 版なし。wikidata で同定(Steam id を
  // 捏造しない・twilight-syndrome 型 href 破損の回避)。established 側と Q11274657 の完全一致で逆引き成立。
  "nantonaku-crystal": {
    wikidata: "https://www.wikidata.org/wiki/Q11274657",
    blurb: {
      en: "Nantonaku, Crystal (Somehow, Crystal) is a 1980 debut novel by the Japanese writer Yasuo Tanaka, which followed a fashion-model college student through her brand-saturated everyday life in Tokyo. Its defining device was its 442 footnotes annotating the real brands, shops, music, and trends the narrative name-drops, turning the consumer culture of its moment into the substance of the work itself. That annotated style is the origin of capturing an era by drowning the reader in its proper nouns, the lineage that the Neo-Showa dictionary mechanic descends from directly.",
      ja: "なんとなく、クリスタルは、作家・田中康夫が1980年に発表したデビュー小説で、ファッションモデルの女子大生が東京のブランドに彩られた日常を生きる姿を描いた。最大の特徴は、本文が名指しする実在のブランド・店・音楽・流行を解説する442個の膨大な注釈で、その時代の消費文化そのものを作品の実質に変えてみせた点にある。この注釈で時代の風俗を浴びせて作品化するスタイルは、固有名詞の洪水で同時代を切り取る系譜の原点であり、本作「ネオ昭和辞典」の仕組みが直接連なる祖である。",
    },
  },
  // 原点 ときめきメモリアル(Tokimeki Memorial), Konami, 1994(PC Engine)。相手のパラメータを把握し、
  // 選択肢で働きかけて好感度を高め、その結果を報酬とする「好感度パラメータ育成型ADV」(恋愛SIM)の
  // 系譜を確立した元祖。家庭用機作で公式 Steam 版なし → wikidata で同定(Steam id を捏造しない・
  // twilight-syndrome 型 href 破損の回避)。established 側と Q1364574 の完全一致で逆引き成立。
  "tokimeki-memorial": {
    wikidata: "https://www.wikidata.org/wiki/Q1364574",
    blurb: {
      en: "Tokimeki Memorial is a dating-sim adventure game developed and published by Konami, first released for the PC Engine Super CD-ROM2 in 1994. Casting the player as a high-school student who builds stats and reads each girl's interests, then raises an affection parameter through dialogue choices and daily actions over a three-year calendar toward a confession, it popularized and is widely credited with defining the affection-parameter raising adventure, the template that later choice-driven affection ADVs descend from.",
      ja: "ときめきメモリアルは、コナミが開発・販売した恋愛シミュレーション・アドベンチャーで、1994年にPCエンジン Super CD-ROM2向けに初めて発売された。プレイヤーを高校生とし、自分の能力値を育てつつ相手の興味を把握し、3年間のカレンダーの中で選択肢や日々の行動を通して好感度パラメータを高め、告白を目指す仕組みにより、「好感度パラメータを選択で育てる」育成型ADV(恋愛SIM)を広く普及・定義したと評価される。後続の選択駆動型・好感度ADVが連なる、その系譜の元祖である。",
    },
  },
  // 原点 Devil Blade(1996), しがたけ(Takehiro Shiga)。PS1 の同人 STG 制作ツール「デザエモンプラス
  // (Dezaemon Plus)」で作られ、日本国内のみで頒布された純日本産の同人縦シューティング。プレイヤーが自作
  // シューティングを memory card で共有しあう Dezaemon ムーブメントから生まれ、「自機を限界まで敵に寄せる
  // スコアチェイス」という和製アーケード/同人縦シューの快感を体現した、その系譜の原点。原作1996版は流通物
  // が存在しない → 本人が四半世紀ぶりに全面リメイクした現行版 DEVIL BLADE REBOOT(app 2882440・レトロ
  // モードで1996版を再現)が唯一の入手可能な参照点。よって anchor は現行 Steam 版で同定する(Steam id を
  // 捏造しない・href 破損回避・established 側と /app/2882440/ で完全一致で逆引き成立)。
  "devil-blade": {
    steam: "2882440",
    blurb: {
      en: "Devil Blade is a doujin vertical-scrolling shoot 'em up created in 1996 by the Japanese illustrator Shigatake (Takehiro Shiga), built with Dezaemon Plus, the PlayStation game-creation tool for making one's own shooters, and distributed only within Japan as an amateur work. Born from the Dezaemon movement in which players shared self-made shooters on memory cards, it embodies the Japanese arcade-and-doujin vertical shooter's core thrill of hugging your ship as close to the enemy as you dare to drive the score. With no surviving distribution of the 1996 original, its only available form today is the creator's own full remake a quarter-century later, DEVIL BLADE REBOOT, which reproduces the 1996 version in a retro mode; it is the origin of the aggressive, close-range score-chase strand of Japanese doujin shooting.",
      ja: "Devil Bladeは、日本のイラストレーター しがたけ(Takehiro Shiga)が1996年に制作した同人の縦スクロール・シューティングで、PS1の同人STG制作ツール「デザエモンプラス(Dezaemon Plus)」で作られ、日本国内のみでアマチュア作品として頒布された。プレイヤーが自作シューティングをメモリーカードで共有しあう「Dezaemonムーブメント」から生まれ、「自機をどこまで敵に寄せられるかでスコアを伸ばす」という和製アーケード/同人縦シューの核の快感を体現した作品である。1996年の原作は現存する流通物が無く、今日唯一入手できる形は、作者本人が四半世紀ぶりに全面リメイクした現行版 DEVIL BLADE REBOOT(レトロモードで1996版を再現)である。攻めるほどスコアが跳ねる、至近距離スコアチェイス型の和製同人シューティングの系譜の原点である。",
    },
  },
  // 原点 After Burner II, Sega AM2, 1987(業務用基板 X Board)。コクピット後方視点の擬似3Dレール
  // シューティングで、敵機の波を高速で抜け、ミサイルをロックオンして追尾弾を撃ち込む——慎重な回避でなく
  // 速度に乗って前方へ撃ち込みまくる「ロックして消す」攻撃的レールシューターの手触りを確立した元祖。
  // 本作開発者自身が「After Burner II をうんと速くした版」と明言する直接の祖。このレール系の系譜は
  // 縦スクロール弾幕系(devil-blade)とは別物で、シューティング一族の中の独立した一枝。公式 SEGA AGES の
  // After Burner II 単体 Steam ページは存在しない → wikidata で同定(Steam id を捏造しない・
  // twilight-syndrome 型 href 破損の回避)。established 側と Q2628630 の完全一致で逆引き成立。
  "after-burner": {
    wikidata: "https://www.wikidata.org/wiki/Q2628630",
    blurb: {
      en: "After Burner II is an arcade rail shooter developed and published by Sega's AM2 division, released in 1987 on the X Board arcade hardware as a refined follow-up to After Burner. Seen from behind the cockpit of a fighter jet, it is a pseudo-3D on-rails shooter in which you race through relentless waves of enemy aircraft at high speed, lock missiles onto them, and unleash homing fire while the world banks and rushes past. By building its thrill on speed and pouring offensive fire into the targets ahead rather than careful dodging, it defined the fast, aggressive lock-and-erase rail-shooter feel, and is the origin of the behind-the-cockpit rail-shooter lineage, a branch of the shooter family distinct from the vertical-scrolling bullet-hell line.",
      ja: "After Burner II(アフターバーナーII)は、セガのAM2が開発・販売したアーケードのレールシューティングで、『After Burner』を洗練させた続編として1987年に業務用基板「X Board」で発売された。戦闘機のコクピット後方からの視点で展開する擬似3Dのオンレール(レール式)シューティングで、絶え間ない敵機の波の中を高速で駆け抜け、ミサイルをロックオンして追尾弾を撃ち込みながら、世界が傾き、後方へ流れ去っていく。慎重に避けるのではなく、速度に乗って前方の標的へ攻撃を撃ち込みまくる——その点に快感を置くことで、速くて攻撃的な「ロックして消す」レールシューターの手触りを確立した。縦スクロールの弾幕系とは別物の、コクピット後方視点レールシューターの系譜の原点である。",
    },
  },
  // 原点 SCP Foundation(SCP財団), 2007-。匿名の書き手たちが collaborative fiction(共同創作)で、
  // 異常な存在・物体を「収容」し、無感情な報告書の体裁で「記録」していく web ベースの創作プロジェクト。
  // 閉鎖された施設・密室で異常と死に向き合う、現代の実存的恐怖(anomalous horror)の系譜の原点。
  // 本作開発者が、中学時代に触れた SCP財団 への「リスペクト」を公式 X 初公開ポストおよびストアの詳細説明で
  // 明言する直接の影響源。SCP財団はゲームでなく web 創作 → 公式 Steam 版なし。wikidata で同定(Steam id を
  // 捏造しない・twilight-syndrome 型 href 破損の回避)。established 側と Q17439649 の完全一致で逆引き成立。
  "scp-foundation": {
    wikidata: "https://www.wikidata.org/wiki/Q17439649",
    blurb: {
      en: "The SCP Foundation is a web-based collaborative fiction writing project begun in 2007, in which anonymous writers document fictional anomalous entities, objects, and phenomena as if they were classified files of a secret agency tasked with Securing, Containing, and Protecting them. Written in the flat, clinical voice of incident reports and containment procedures, with no single author and no fixed canon, it turned the bureaucratic record of the anomalous, and the dread of being shut in with something inexplicable, into a shared modern mythology. It is the origin of the anomalous-horror lineage: existential, document-driven fear set in sealed rooms and closed facilities, distinct from ghost-story and looping-tragedy horror.",
      ja: "SCP財団は、2007年に始まった web ベースの共同創作(collaborative fiction)プロジェクトで、匿名の書き手たちが、架空の異常な存在・物体・現象を、それらを「確保(Secure)・収容(Contain)・保護(Protect)」する秘密機関の機密報告書という体裁で記録していく。特定の作者を持たず固定された正典も持たないまま、感情を排した報告書・収容手順の無機質な文体で書かれ、「異常を官僚的に記録する」営みと、「説明のつかない何かと密室に閉じ込められる」恐怖を、共有された現代の神話へと変えた。閉ざされた施設・密室の中で、文書を通して実存的な恐怖を立ち上げる anomalous horror(異常存在ホラー)の系譜の原点であり、怪談系や繰り返し惨劇系のホラーとは別物の一枝である。",
    },
  },
  // 原点 異形の街のアニー(Igyou no Machi no Annie), Qpic(九州大学物理研究部・九州大学公認サークル), 2020。
  // 日本のフリーゲーム配信サイト「ふりーむ」で頒布された、白黒手描き・絵本調シュールな世界を全操作マウスで
  // 巡り、アイテムを見つけてドラッグして解くポイント＆クリック・アドベンチャー。本作開発者 pickee は、まさに
  // この『異形の街のアニー』のシナリオ・キャラクターデザインを担当した人物で、作家連続性＋同一の味DNA(白黒
  // 手描きの異形/絵本調シュール・全操作クリック＋アイテムD&D・オリジナルの絵と音)を本作へ継承する直系系譜。
  // 商業流通でなくフリーゲーム発・公式 Steam 版なし・wikidata QID なし → 公式配信元の freem ページで同定する
  // (Steam id/QID を捏造しない・href 破損回避)。established 側と freem URL の完全一致で逆引き成立。
  "igyou-no-machi-no-annie": {
    freem: "https://www.freem.ne.jp/win/game/25169",
    blurb: {
      en: "Igyou no Machi no Annie is a freeware point-and-click adventure game created by Qpic, the officially recognized Physics Research Club of Kyushu University in Japan, and distributed on the Japanese free-game platform Freem in 2020. Set in a hand-drawn, black-and-white, picture-book world of misshapen figures, it is played entirely by mouse: the player clicks through a surreal town and solves its puzzles by examining each scene and dragging the items they find onto where they belong, all carried by original, hand-made artwork and music. Through its writer and character designer pickee, who went on to make For the Fish in the Bottle, it is the origin of this short, hand-made, monochrome point-and-click puzzle lineage: surreal black-and-white worlds explored by mouse, solved by looking and dragging, and built on entirely original art and sound.",
      ja: "異形の街のアニーは、九州大学の公認サークル「Qpic(九州大学物理研究部)」が制作し、日本のフリーゲーム配信サイト「ふりーむ」で2020年に頒布されたフリーのポイント＆クリック・アドベンチャーである。白黒トーンの手描き・絵本調の、異形の者たちが暮らす世界を舞台に、操作はすべてマウス——プレイヤーはシュールな街をクリックで巡り、その場面を調べ、見つけたアイテムをしかるべき場所へドラッグして謎を解いていく。その全ては、手作りのオリジナルのアートワークと音楽に支えられている。本作のシナリオとキャラクターデザインを担当し、のちに『瓶の中のサカナのために』を手がけた pickee を通じて、マウスで巡る白黒シュールな世界を、見てドラッグして解き、すべて手作りのオリジナルの絵と音で組み上げる——その短く手作りなモノクロ・ポイント＆クリック謎解きの系譜の原点となっている。",
    },
  },
  // 原点 KenKen(日本名・賢くなるパズル, 海外名 Calcudoku), 宮本哲也, 2004, 日本。教育者・宮本哲也が子どもを
  // 教えずに賢くするための道具として考案した算数の論理パズル。ラテン方陣のグリッドを太線で「ケージ」に区切り、
  // 各ケージの目標値を指定の四則演算でぴったりにする(行・列で数字は重複させない)。「四則演算で数字をぴったりの
  // 目標値にする」算数パズルの系譜の原点。公式 Steam 版なし → wikidata QID(Q372499)で同定(Steam id を捏造
  // しない・href 破損回避)。established 側と wikidata URL の完全一致で逆引き成立(lineageName の Wikidata 同定)。
  "kenken": {
    wikidata: "https://www.wikidata.org/wiki/Q372499",
    blurb: {
      en: "KenKen, known in Japan as Kashikoku Naru Puzzle and internationally as Calcudoku, is an arithmetic logic puzzle devised by the Japanese educator Tetsuya Miyamoto in 2004 as a tool to make children sharper without instruction. On a Latin-square grid divided by heavy outlines into groups called cages, each cage carries a target number and one of the four arithmetic operations, and the solver fills in digits so that each cage's numbers combine through its operation to reach the target, with no number repeating in any row or column. By fusing the no-repeat logic of a Latin square with the demand to make numbers hit an exact value through addition, subtraction, multiplication, and division, it defined the modern arithmetic logic puzzle, the lineage of puzzles solved by computing numbers to an exact target. There is no official Steam release; the origin is anchored to its Wikidata entry.",
      ja: "KenKen(日本名・賢くなるパズル、海外名 Calcudoku)は、日本の教育者・宮本哲也が2004年に、子どもを教えずに賢くするための道具として考案した算数の論理パズルである。ラテン方陣のグリッドが太線で「ケージ」と呼ばれるまとまりに区切られ、各ケージには目標の数と四則演算のいずれか一つが添えられる。解き手は、各行・各列に数字が重複しないようにしながら、ケージ内の数字を指定された演算で組み合わせて目標値ぴったりにしていく。各行・各列で数字を重複させないラテン方陣の論理と、＋−×÷で数字をぴったりの値にするという要求を融合させ、「数字を計算してぴったりの目標値にする」ことで解く現代の算数論理パズル——その系譜を確立した原点である。公式 Steam 版は存在せず、原点は Wikidata のエントリで同定する。",
    },
  },
} as const;

export type LineageId = keyof typeof LINEAGE_ANCHOR;

// lineage id を原点ゲーム名(表示言語)に解決する。picks 内の established game を逆引きし、
// ゲーム名の二重定義を避ける(SSOT)。見つからなければ null(捏造しない)。
//   同定は多態: anchor.steam があれば Steam URL で、anchor.wikidata があれば wikidata で逆引きする。
export function lineageName(id: string, lang: "en" | "ja"): string | null {
  const anchor = (LINEAGE_ANCHOR as Record<string, { steam?: string; wikidata?: string; freem?: string }>)[id];
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
      // Freem 同定(Steam 版/wikidata QID が無いフリーゲーム発の原点): g.freem の完全一致で逆引き。
      if (anchor.freem) {
        if (g.freem !== anchor.freem) continue;
        return isJa ? (g.name_ja || g.name_en) : (g.name_en || g.name_ja);
      }
    }
  }
  return null;
}

// blurb を持つ anchor の id を distinct で返す(計算だけ・副作用なし)。
//   /origins/<id>/ の個別ページを生やす対象 = 「解説文(blurb)を持つ原点」だけ(SSOT)。
//   LINEAGE_ANCHOR の宣言順を保つ(安定)。blurb 無しの anchor(名前逆引き専用)は含めない。
//   getStaticPaths(EN/JA)とリンク化判定(PickPage/LineagePage)が同一集合を参照する唯一の入口。
export function originAnchorIds(): string[] {
  const out: string[] = [];
  for (const id of Object.keys(LINEAGE_ANCHOR)) {
    const anchor = (LINEAGE_ANCHOR as Record<string, { blurb?: unknown }>)[id];
    if (anchor && anchor.blurb) out.push(id);
  }
  return out;
}

// 原点 id の解説文(表示言語)を返す(計算だけ・副作用なし)。blurb は LINEAGE_ANCHOR の 1 箇所のみ
// = SSOT(原点ページ本文と JSON-LD description が同じ源を読む)。anchor 無し/blurb 無しは null
// (捏造しない・呼び出し側が描画分岐に使う)。
export function lineageBlurb(id: string, lang: "en" | "ja"): string | null {
  const anchor = (LINEAGE_ANCHOR as Record<string, { blurb?: { en: string; ja: string } }>)[id];
  if (!anchor || !anchor.blurb) return null;
  return lang === "ja" ? anchor.blurb.ja : anchor.blurb.en;
}

// 原点 id の外部実体識別子(steam app id / wikidata QID URL)を返す(計算だけ・副作用なし)。
//   原点ページの出典リンクと JSON-LD sameAs が LINEAGE_ANCHOR を直読みせず一様に参照する入口(SSOT)。
//   anchor 無しは null。steam / wikidata は持っているものだけを積む(捏造しない・壊れリンクを作らない)。
export function lineageAnchorIdentity(id: string): { steam?: string; wikidata?: string; freem?: string } | null {
  const anchor = (LINEAGE_ANCHOR as Record<string, { steam?: string; wikidata?: string; freem?: string }>)[id];
  if (!anchor) return null;
  const out: { steam?: string; wikidata?: string; freem?: string } = {};
  if (anchor.steam) out.steam = anchor.steam;
  if (anchor.wikidata) out.wikidata = anchor.wikidata;
  if (anchor.freem) out.freem = anchor.freem;
  return out;
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
