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
  "rolling-star": {
    published: "2026-06-28",
    publishAt: "2026-06-28",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "metroidvania", lineage: "metroid", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 205, positivePct: 98, noEnglish: false } },
    games: [
      {
        name_en: "ROLLING STAR",
        name_ja: "ローリングスター",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3288460/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese 2D side-scrolling Metroidvania set on a vast space colony overrun by aliens. You play as Rory, a reclusive, mech-arm-loving girl who sets out to retake the colony, exploring its sprawling, interconnected map and using skills and equipment to open gates that were once out of reach. Material dropped by defeated enemies feeds crafting, giant bosses block the way, and a vehicle lets you fight in zero gravity and out in open space, inside and outside the colony alike. It is a story-driven game heavy on conversation and comedy events, built on the bounty-hunter-style exploration of a lonely, mech-equipped heroine reclaiming a station from aliens. Made by NUL2 STUDIO, the Japanese solo developer Shiruko, whose earlier indie work TOMOMI shipped in 2022, and released March 2025. Very Positive at 205 reviews and 98 percent. It already supports Japanese, English, Korean, and Simplified and Traditional Chinese, yet with only about 30 English reviews (14.6 percent) the wider West has barely found it; the rest are mostly Japanese. At 1,400 yen it is a paid, fully released game, not free and not in Early Access.",
        desc_ja: "エイリアンに占拠された広大な宇宙コロニーを舞台にした、日本の2D横スクロール・メトロイドヴァニア。プレイヤーは、引きこもりでメカアーム好きの少女ローリーとなり、コロニー奪還を目指す。入り組んでひと続きにつながった広大なマップを探索し、スキルや装備で、かつて手の届かなかったゲートを開いていく。倒した敵が落とす素材はクラフトに回り、巨大なボスが行く手を塞ぎ、ビークルに乗れば無重力や宇宙空間でも——コロニーの内も外も——戦える。会話とコメディイベントを重視したストーリー型で、メカを身にまとった孤独な少女が、エイリアンからステーション(コロニー)を奪い返していく、バウンティハンター的な探索が核にある。日本の個人開発スタジオ NUL2 STUDIO(開発者・しるこ氏)による一本で、前作のインディー TOMOMI は2022年に発売されている。2025年3月発売。205レビュー98%で非常に好評。日本語・英語・韓国語・簡体字中国語・繁体字中国語に対応済みだが、英語レビューは約30件(14.6%)にとどまり、残りの大半は日本語——広い西側はまだほとんど見つけていない。価格1,400円の有料作で、無料でもアーリーアクセスでもない、正式リリース済みである。",
      },
      {
        name_en: "Metroid",
        name_ja: "メトロイド",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Metroid_(video_game)",
        wikidata: "https://www.wikidata.org/wiki/Q2530723",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: Metroid, developed by Nintendo R&D1 with Intelligent Systems and published by Nintendo, first released for the Family Computer Disk System in 1986. As the bounty hunter Samus Aran exploring the sprawling, interconnected underground of the planet Zebes, you find power-ups and equipment that open paths once out of reach, doubling back through one connected map as your growing kit unlocks it. By fusing open exploration with ability-gated progression, it founded the genre later named Metroidvania. Rolling Star is a clear heir to that idea: a lonely, mech-equipped heroine explores a single interconnected world, using newly gained skills and equipment to open gates that were sealed before, against giant bosses guarding the way. But it lifts that core onto a vast space colony to retake from aliens, adds enemy-drop crafting and zero-gravity vehicle combat out in open space, and wraps it in conversation-and-comedy storytelling, making it its own creature rather than a clone. There is no official Steam release of the original Metroid, so its origin is anchored to its Wikidata entry.",
        desc_ja: "この味の原点。メトロイドは、任天堂開発第一部(R&D1)がインテリジェントシステムズと共に開発し、任天堂が販売したアクションアドベンチャーで、1986年にファミリーコンピュータ ディスクシステム向けに発売された。プレイヤーはバウンティハンター・サムス・アランとなり、惑星ゼーベスの地下に広がる、入り組んでひと続きにつながった世界を探索する。パワーアップや装備を手に入れることで、かつて手の届かなかった道が開き、ひと続きの一枚マップを、増えていく装備で何度も引き返しながら攻略していく。開かれた探索と、能力で進行をゲートする設計を融合させ、のちに『メトロイドヴァニア』と名づけられるジャンルを生み出した。ローリングスターはその直系——メカを身にまとった孤独な少女が、ひと続きにつながった一つの世界を探索し、新たに得たスキルや装備で、それまで封じられていたゲートを開き、行く手を守る巨大ボスに挑む。だがその核を、エイリアンから奪還すべき広大な宇宙コロニーへ載せ替え、敵ドロップ素材のクラフトと、宇宙空間での無重力ビークル戦闘を加え、会話とコメディの語り口で包むことで、模倣ではない独自の一作に仕立てている。オリジナルのメトロイドに公式 Steam 版は存在しないため、その原点は Wikidata のエントリで同定する。",
      },
    ],
    en: {
      title: "ROLLING STAR - a buried Japanese side-scrolling Metroidvania where a reclusive, mech-armed girl explores a vast space colony, opening ability-gated gates to retake it from aliens, an heir to Metroid",
      description: "A Japanese 2D side-scrolling Metroidvania set on a vast space colony overrun by aliens. You play as Rory, a reclusive, mech-arm-loving girl, exploring a sprawling, interconnected map and using skills and equipment to open gates once out of reach. Enemy drops feed crafting, giant bosses block the way, and a vehicle lets you fight in zero gravity and open space, inside and outside the colony. A story-driven game heavy on conversation and comedy. By NUL2 STUDIO, the Japanese solo developer Shiruko. Very Positive at 205 reviews and 98 percent; it supports English, yet the wider West has barely found it.",
      h1a: "Don't just clear the room. ",
      h1flip: "Open the gate that was sealed until you found the skill to pass it",
      h1b: ".",
      lede: "A Japanese 2D side-scrolling Metroidvania set on a vast space colony overrun by aliens. You play as Rory, a reclusive, mech-arm-loving girl who sets out to retake the colony, exploring its sprawling, interconnected map and using skills and equipment to open gates that were once out of reach. Material dropped by defeated enemies feeds crafting, giant bosses block the way, and a vehicle lets you fight in zero gravity and out in open space, inside and outside the colony alike. It is a story-driven game heavy on conversation and comedy. Made by NUL2 STUDIO, the Japanese solo developer Shiruko, in the lineage of Metroid. It already supports English, yet the wider West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "The colony is built as one continuous, interconnected world, and at the start much of it is sealed: a gap too wide, a barrier you cannot break, a height you cannot reach. The design plants those locked doors in plain sight, so the map itself becomes a list of questions you cannot yet answer.",
        "Every skill and piece of equipment you gain is shaped as a key, not just a stat. The moment you earn a new ability, paths you walked past hours ago quietly become passable, so progress is less about pushing forward than about turning back through a place you thought you knew and watching it open up.",
        "Around that exploration the design stacks reasons not to stop: enemies drop materials you craft into gear, giant bosses wall off the next region, and a vehicle pulls the fight out into zero gravity and open space beyond the colony, while conversation-and-comedy story beats keep tugging you toward what happens next.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Metroid loop of exploring one interconnected world and opening ability-gated gates: find a new skill or piece of equipment, then double back to reach what was sealed before, across a sprawling space colony",
        "You want that core thickened with enemy-drop crafting, giant boss fights, and vehicle combat that moves out into zero gravity and open space, inside and outside the colony, all wrapped in conversation-and-comedy storytelling about a reclusive, mech-armed girl retaking the colony from aliens",
        "You want a Japanese solo-dev gem the wider West has barely noticed, Very Positive at 98 percent over 205 reviews, that already supports English",
      ],
      bad: [
        "You want a short, self-contained experience or a pure linear action game; this is an exploration-first Metroidvania built on backtracking and ability gates, so the pull is the slow opening-up of one big map, not a straight line to the end",
        "You expect a big, already-popular Western title; this is a Japanese solo-dev indie, paid at 1,400 yen, fully released and not in Early Access, and still largely undiscovered abroad (about 14.6 percent of reviews are English)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ローリングスター - 引きこもりでメカアーム好きの少女が、広大な宇宙コロニーを探索し、能力でゲートされた扉を開いてエイリアンから奪還する、メトロイドの系譜の埋もれた日本の横スクロール・メトロイドヴァニア",
      description: "エイリアンに占拠された広大な宇宙コロニーを舞台にした、日本の2D横スクロール・メトロイドヴァニア。引きこもりでメカアーム好きの少女ローリーとなり、入り組んでひと続きにつながったマップを探索し、スキルや装備で、かつて手の届かなかったゲートを開く。敵が落とす素材はクラフトに回り、巨大ボスが行く手を塞ぎ、ビークルに乗れば無重力や宇宙空間でも戦える。会話とコメディを重視したストーリー型。日本の個人開発 NUL2 STUDIO(しるこ氏)制作。205レビュー98%で非常に好評。英語に対応済みだが、広い西側はまだほとんど見つけていない。",
      h1a: "ただ敵を片づけるな。",
      h1flip: "通る術を見つけるまで封じられていた、その扉を開け",
      h1b: "。",
      lede: "エイリアンに占拠された広大な宇宙コロニーを舞台にした、日本の2D横スクロール・メトロイドヴァニア。プレイヤーは、引きこもりでメカアーム好きの少女ローリーとなり、コロニー奪還を目指す。入り組んでひと続きにつながった広大なマップを探索し、スキルや装備で、かつて手の届かなかったゲートを開いていく。倒した敵が落とす素材はクラフトに回り、巨大なボスが行く手を塞ぎ、ビークルに乗れば無重力や宇宙空間でも——コロニーの内も外も——戦える。会話とコメディイベントを重視したストーリー型だ。日本の個人開発スタジオ NUL2 STUDIO(しるこ氏)が手がける、メトロイドの系譜に連なる一本。英語に対応済みだが、広い西側はまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "コロニーは、ひと続きにつながった一つの世界として作られている。そして始まりの時点では、その多くが閉ざされている——広すぎる裂け目、壊せない障壁、届かない高さ。設計は、それらの「閉じた扉」をあえて目につく場所に置く。だからマップそのものが、まだ答えられない問いのリストになる。",
        "手に入れるスキルや装備は、ただの能力値ではなく、一つひとつが「鍵」として設計されている。新しい能力を得た瞬間、何時間も前に素通りした道が、静かに通れるようになる。だから進行とは、前へ押し進むこと以上に、知っているつもりだった場所へ引き返し、それが開いていくのを見ることだ。",
        "その探索の周りに、設計は「手を止めない理由」を積み上げる。敵は素材を落とし、それを装備にクラフトする。巨大なボスが次の領域を塞ぐ。ビークルは戦いを、コロニーの外の無重力と宇宙空間へ引っ張り出す。そして会話とコメディの物語が、次に何が起きるのかへと、絶えず引っ張り続ける。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "「ひと続きにつながった一つの世界を探索し、能力でゲートされた扉を開く」メトロイドのループが好きな人——新しいスキルや装備を見つけ、広大な宇宙コロニーを引き返して、それまで封じられていた場所へ手を伸ばす",
        "その核を、敵ドロップ素材のクラフト、巨大ボス戦、そしてコロニーの内外・無重力・宇宙空間へ広がるビークル戦闘で厚くした作品が欲しい人——引きこもりでメカアーム好きの少女が、エイリアンからコロニーを奪還する、会話とコメディの物語に包まれている",
        "広い西側がまだほとんど気づいていない、日本の個人開発原石が欲しい人——205レビュー98%で非常に好評、しかも英語に対応済み",
      ],
      bad: [
        "短く完結する体験や、純粋な一本道のアクションが欲しい人(本作は引き返しと能力ゲートで組まれた探索重視のメトロイドヴァニアで、快感は一本道のクリアではなく、一つの大きなマップが少しずつ開いていくことにある)",
        "すでに西で人気の大作を期待する人(本作は日本の個人開発インディーで、価格1,400円の有料作・アーリーアクセスではなく正式リリース済み、海外ではまだ広く未発見——英語レビューは約14.6%)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "ultra-zero": {
    published: "2026-06-29",
    publishAt: "2026-06-29",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "shooting-novel", lineage: "ultraman", obscurity: "deep", rarity: { reviews: 71, positivePct: 98, noEnglish: false } },
    games: [
      {
        name_en: "ULTRA0",
        name_ja: "ULTRA0",
        status: "hidden",
        steam: "https://store.steampowered.com/app/4019180/ULTRA0/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Japanese indie game built in two parts: a pseudo-3D, pixel-art shooter crossed with a sci-fi yuri visual novel. Set in the nation of N ten years after giant kaiju first appeared, it sends young girls to the front line to defend their country from city-sized monsters. The shooting is made to be gentle and easy to play: auto-targeting and auto-attack carry the aim while you layer on bombs and skills, and random drops from each run raise your characters' power, up to two or three times stronger. Each chapter hands the lead to a different heroine, the first to Shirogane of the unit Area81, and the story leans heavily on the bond between the girls. Made by the Japanese solo developer peng under the name PenGames, whose earlier work was MOMIBOSU, and released on 2 June 2026, fully launched and not in Early Access. Very Positive at 71 reviews and 98 percent. It supports English and Japanese, and with 24 English reviews (about 33.8 percent) the West is only starting to find it, while the remaining two-thirds are mostly Japanese, so it is not yet saturated abroad. At 1,200 yen it is a paid, fully released game, not free. The pixel art is hand-drawn, not AI-generated.",
        desc_ja: "二部構成の日本のインディーゲーム——疑似3Dのドット絵シューティングと、SF百合のノベルを掛け合わせた一本だ。巨大な怪獣が初めて現れてから10年後の「N国」を舞台に、都市ほどもある怪獣から国を守るため、少女たちを最前線へ送り出す。シューティングはやさしく遊びやすいよう作られている——自動ターゲティングと自動攻撃が照準を担い、そこにボムとスキルを重ねていく。一周ごとのランダムドロップがキャラクターを強化し、最大で2〜3倍まで強くなる。章ごとに主役は別の少女へ——第1章はエリア81(Area81)のシロガネ——交代し、物語は少女たちの絆を強く軸に据える。日本の個人開発者 peng が「PenGames」名義で手がけ(前作は MOMIBOSU)、2026年6月2日に発売——アーリーアクセスではなく正式リリース済みだ。71レビュー98%で非常に好評。英語・日本語に対応し、英語レビューは24件(約33.8%)——西側はようやく見つけ始めているが、残りの約3分の2は日本語が中心で、海外ではまだ飽和していない。価格1,200円の有料作で、無料ではない。ドット絵は手描きで、AI生成ではない。",
      },
      {
        name_en: "Ultraman",
        name_ja: "ウルトラマン",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Ultraman_(1966_TV_series)",
        wikidata: "https://www.wikidata.org/wiki/Q1058534",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: Ultraman, a tokusatsu (special-effects) television series created by Eiji Tsuburaya and produced by Tsuburaya Productions, first broadcast in Japan in 1966 as the show that followed Ultra Q. It set a giant silver-and-red hero against a procession of city-sized kaiju, with a human special-attack team fighting the monsters on the front line, and it crystallized the kaiju-defense story: giant monsters that threaten a nation, and those who rise to stand against them at the front. ULTRA0 is a clear heir to that taste, not an official Ultraman work but a doujin descendant of the lineage: ten years after kaiju appeared, named girls fight giant monsters on the front line to defend their nation. But it lifts that core onto a pseudo-3D pixel-art shooter with auto-targeting, bombs, and skills, wraps it in a sci-fi yuri visual novel told in two parts, and tells its own story of heroines who trade the lead chapter by chapter, making it its own creature rather than a copy. There is no official Steam release of the 1966 series, so its origin is anchored to its Wikidata entry.",
        desc_ja: "この味の原点。ウルトラマンは、円谷英二が生み出し円谷プロダクションが製作した特撮テレビシリーズで、『ウルトラQ』に続く作品として1966年に日本で放送が始まった。銀と赤の巨大なヒーローを、都市ほどもある怪獣の群れと対峙させ、最前線で怪獣に立ち向かう人間の特捜隊がそれを支える——「巨大な怪獣が国を脅かし、それに立ち向かう者が現れる」怪獣防衛の物語を結晶化させた。ULTRA0(ウルトラゼロ)はその味の直系だ——公式のウルトラマン作品ではなく、その系譜に連なる同人の末裔である。怪獣出現から10年後、最前線で名を持つ少女たちが巨大な怪獣と戦い、国を守る。だがその核を、自動ターゲティング・ボム・スキルを備えた擬似3Dのドット絵シューティングへ載せ替え、SF百合のノベルを二部構成で織り込み、章ごとに主役を交代させる少女たちの物語として語ることで、模倣ではない独自の一作に仕立てている。1966年のシリーズに公式 Steam 版は存在しないため、その原点は Wikidata のエントリで同定する。",
      },
    ],
    en: {
      title: "ULTRA0 - a buried two-part Japanese indie where girls defend their nation from city-sized kaiju in a gentle pseudo-3D pixel shooter wrapped in a sci-fi yuri novel, an heir to Ultraman",
      description: "A two-part Japanese indie: a pseudo-3D pixel-art shooter crossed with a sci-fi yuri visual novel. Ten years after giant kaiju appeared, girls defend the nation of N on the front line against city-sized monsters. The shooting is gentle, auto-targeting and auto-attack handle the aim while you add bombs and skills, and random drops raise your characters up to two or three times stronger. Each chapter swaps the lead heroine, the first to Shirogane of Area81. By the solo developer peng under PenGames. Very Positive at 71 reviews and 98 percent; it supports English, and the West is only starting to find it.",
      h1a: "Don't just clear the wave. ",
      h1flip: "Stand at the front line and face down a kaiju the size of a city",
      h1b: ".",
      lede: "A Japanese indie game built in two parts: a pseudo-3D, pixel-art shooter crossed with a sci-fi yuri visual novel. Set in the nation of N ten years after giant kaiju first appeared, it sends young girls to the front line to defend their country from city-sized monsters. The shooting is made to be gentle and easy to play, with auto-targeting and auto-attack carrying the aim while you layer on bombs and skills, and random drops from each run raise your characters up to two or three times stronger. Each chapter hands the lead to a different heroine, the first to Shirogane of the unit Area81, and the story leans heavily on the bond between the girls. Made by the Japanese solo developer peng under the name PenGames, in the lineage of Ultraman. It already supports English, and the West is only starting to find it.",
      s1: "First, the one feeling",
      feeling: [
        "Because auto-targeting and auto-attack carry the aim for you, the shooting never asks for twitch precision; what it asks is that you keep facing the thing in front of you, a kaiju the size of a city, while you choose when to spend a bomb and when to fire a skill, so the weight sits on nerve and timing rather than reflexes.",
        "Every run rains random drops onto your characters and the numbers climb fast, up to two or three times stronger, so the pull is the visible swell of power between attempts: the same monster that walled you off an hour ago folds, and you reach for one more run to see how much harder you can hit.",
        "The game is built in two halves, the pseudo-3D pixel shooter and a sci-fi yuri novel, and clearing the fight is what opens the next page; each chapter hands the lead to a different girl, the first to Shirogane of Area81, so the bond between the heroines keeps tugging you past the end of one battle into who speaks next.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Ultraman taste of standing against giant, city-sized kaiju on the front line to defend a nation, here carried by named girls ten years after the monsters first appeared",
        "You want a shooter built to be gentle and easy: auto-targeting and auto-attack handle the aim while you layer on bombs and skills, with random drops that raise your characters up to two or three times stronger run after run, all wrapped in a sci-fi yuri novel told in two parts",
        "You want a Japanese solo-dev gem the West is only starting to find, Very Positive at 98 percent over 71 reviews, that already supports English",
      ],
      bad: [
        "You want a hardcore, precision shoot 'em up or a bullet-hell challenge; this is built to be gentle and accessible, with auto-targeting and auto-attack and story at its center, so the appeal is the spectacle and the bond, not twitch difficulty",
        "You expect a story you can fully read in English everywhere, or a big already-popular title; this is a 1,200-yen paid doujin work by the solo developer peng, heavy on its sci-fi yuri novel, and still mostly Japanese-led abroad (about 33.8 percent of reviews are English)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ULTRA0(ウルトラゼロ) - 都市ほどもある怪獣から、最前線で少女たちが国を守る、やさしい擬似3Dドット絵シューティング×SF百合ノベルの二部構成、ウルトラマンの系譜の埋もれた日本のインディー",
      description: "疑似3Dのドット絵シューティングと、SF百合ノベルを掛け合わせた、二部構成の日本のインディー。巨大な怪獣が現れて10年後の「N国」を舞台に、都市ほどもある怪獣から国を守るため、少女たちが最前線で戦う。シューティングはやさしく——自動ターゲティングと自動攻撃が照準を担い、ボムとスキルを重ねる。ランダムドロップが一周ごとにキャラを最大2〜3倍強くする。章ごとに主役の少女が交代し、第1章はエリア81のシロガネ。個人開発者 peng(PenGames)制作。71レビュー98%で非常に好評。英語に対応し、西側はようやく見つけ始めた。",
      h1a: "ただ撃ち落とすな。",
      h1flip: "最前線に立ち、都市ほどもある怪獣に向き合え",
      h1b: "。",
      lede: "疑似3Dのドット絵シューティングと、SF百合のノベルを掛け合わせた、二部構成の日本のインディーゲーム。巨大な怪獣が初めて現れてから10年後の「N国」を舞台に、都市ほどもある怪獣から国を守るため、少女たちを最前線へ送り出す。シューティングはやさしく遊びやすいよう作られている——自動ターゲティングと自動攻撃が照準を担い、そこにボムとスキルを重ねていく。一周ごとのランダムドロップがキャラクターを最大2〜3倍まで強化する。章ごとに主役は別の少女へ——第1章はエリア81のシロガネ——交代し、物語は少女たちの絆を強く軸に据える。日本の個人開発者 peng が「PenGames」名義で手がける、ウルトラマンの系譜に連なる一本。英語に対応済みで、西側はようやく見つけ始めている。",
      s1: "まず、その一点の感覚",
      feeling: [
        "自動ターゲティングと自動攻撃が照準を肩代わりしてくれるから、シューティングは反射神経の精密さを求めてこない。求められるのは、目の前のもの——都市ほどもある怪獣——に向き合い続けること、そしてボムをいつ切るか、スキルをいつ撃つかを選ぶことだ。だから重心は反射ではなく、胆力とタイミングに乗る。",
        "一周ごとに、ランダムなドロップがキャラクターへ降り注ぎ、数字は速く跳ね上がる——最大で2〜3倍まで。だから手を止めさせるのは、挑戦と挑戦の間で「強くなった」と目に見えること。1時間前に行く手を塞いだ同じ怪獣が崩れ落ち、どこまで強く殴れるのか確かめたくて、もう一周へ手が伸びる。",
        "本作は二つの半身——疑似3Dのドット絵シューティングと、SF百合のノベル——で組まれていて、戦いを越えることが、次のページを開く。章ごとに主役は別の少女へ渡される——第1章はエリア81のシロガネ。だから少女たちの絆が、一つの戦いの終わりの先、次に誰が口を開くのかへと、絶えず引っ張り続ける。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "巨大な——都市ほどもある——怪獣に、最前線で立ち向かい国を守る、ウルトラマンの味が好きな人。本作ではそれを、怪獣が初めて現れて10年後の、名を持つ少女たちが担う",
        "やさしく遊びやすいシューティングが欲しい人——自動ターゲティングと自動攻撃が照準を担い、そこへボムとスキルを重ね、ランダムドロップが一周ごとにキャラクターを最大2〜3倍まで強くする。その全てが、二部構成のSF百合ノベルに包まれている",
        "西側がようやく見つけ始めた、日本の個人開発の原石が欲しい人——71レビュー98%で非常に好評、しかも英語に対応済み",
      ],
      bad: [
        "硬派で精密なシューティングや弾幕の歯ごたえが欲しい人(本作はやさしく遊びやすいよう作られ、自動ターゲティングと自動攻撃、そして物語を中心に据えている——快感は反射の難度ではなく、その光景と少女たちの絆にある)",
        "どこでも英語で物語を読み切れることや、すでに人気の大作を期待する人(本作は個人開発者 peng による価格1,200円の有料同人作で、SF百合ノベルの物語比重が高く、海外ではまだ日本語中心——英語レビューは約33.8%)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "hollow-cocoon": {
    published: "2026-06-29",
    publishAt: "2026-06-29",
    kind: "find",
    leadIndex: 0,
    meta: { genre: "exploration-horror", lineage: "fatal-frame", obscurity: "deep", reviewBand: "around_1k", reachState: "unreached_west", rarity: { reviews: 906, positivePct: 92, noEnglish: false } },
    games: [
      {
        name_en: "Hollow Cocoon",
        name_ja: "ウツロマユ - Hollow Cocoon -",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2414630/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A first-person Japanese horror adventure set in Ichinose, a village deep in the 1980s Japanese mountains. You explore on foot, solve puzzles, and scavenge scarce resources, all while a monster, a silkworm-woman, hunts the dark, and you cannot fight her: survival is hiding and slipping past. The story is a sisters' tale of love and hatred, drawn from a real folktale of Ibaraki Prefecture about the origin of silk farming, the legend of the Golden Princess (Konjiki-hime), wrapped in silkworm-and-cocoon imagery. It carries four branching endings and three difficulty levels. Made by NAYUTA STUDIO, a two-person Tokyo doujin circle, the programmer UTUTUYA and the 3D-modeler KOZUE, and released in December 2023, fully launched and not in Early Access. Very Positive at 906 reviews and 92 percent. It is broadly localized, with English, Japanese (fully voiced), Simplified Chinese, Korean, German, and more, yet with 197 English reviews out of 906 (about 21.7 percent) the West has only partly found it; most of its audience is Japanese and Chinese. At 1,480 yen it is a paid, fully released game, not free, and the art is not AI-generated. It carries depictions of violence, bloodshed, and suicide, though nothing sexual.",
        desc_ja: "1980年代の山深い日本の村「一ノ瀬」を舞台にした、一人称視点の和風ホラーアドベンチャー。足で探索し、謎を解き、乏しい資源をかき集める——その間ずっと、闇の中を一体の怪物「蚕女」が徘徊する。彼女と戦うことはできない。生き延びる術は、隠れ、やり過ごすことだけだ。物語は、茨城県に実在する養蚕の起源民話——「金色姫（こんじきひめ）伝説」——を下敷きにした、姉妹の愛憎劇で、蚕と繭のモチーフに包まれている。エンディングは4分岐、難易度は3段階。東京の2人組同人サークル NAYUTA STUDIO——プログラマの UTUTUYA と、3Dモデル・マップの KOZUE——が制作し、2023年12月に発売——アーリーアクセスではなく正式リリース済みだ。906レビュー92%で非常に好評。英語・日本語（フルボイス）・簡体字中国語・韓国語・ドイツ語ほか幅広くローカライズされているが、906件中、英語レビューは197件（約21.7%）にとどまり、西はまだ半分しか見つけていない——観客の大半は日本語と中国語だ。価格1,480円の有料作で、無料ではなく、アートはAI生成ではない。なお、性的なものはないが、暴力・流血・自殺の描写を含む。",
      },
      {
        name_en: "Fatal Frame",
        name_ja: "零 -ZERO-",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Fatal_Frame_(video_game)",
        wikidata: "https://www.wikidata.org/wiki/Q2323933",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of the cursed-rural-Japan, folklore exploration horror: in 2001, Tecmo released Fatal Frame (titled Zero in Japan), a survival horror set in a cursed Japanese place where you confront the dead through a defensive camera, the Camera Obscura, with a sequel that moved to a cursed, lost village. It is fundamentally a third-person game, going first-person only when you raise the camera. It crystallized the skeleton of Japanese horror built on a remote, cursed place and old folk belief. Hollow Cocoon is a clear heir to that skeleton, a haunted 1980s mountain village steeped in a real silk-origin folktale, but it sharpens the view into full first-person, and where Fatal Frame fights spirits with a camera, Hollow Cocoon strips the weapon away entirely: you cannot fight the silkworm-woman, only hide and evade. There is no official Steam release of the 2001 game, so its origin is anchored to its Wikidata entry.",
        desc_ja: "呪われた日本の田舎と、民話を核にした探索ホラーの原点。2001年、テクモが『零 -ZERO-（海外名 Fatal Frame）』を発売した——呪われた日本の場所を舞台に、防御用のカメラ「射影機（カメラ・オブスクラ）」で死者と対峙するサバイバルホラーで、続編の舞台は呪われ失われた村だった。本作は基本的に三人称視点で、一人称になるのはカメラを構えた時だけだ。人里離れた呪われた場所と、古い民間信仰を核にした和製ホラーの骨格を結晶化させた。ウツロマユはその骨格の直系——実在の養蚕起源民話を下敷きにした、呪われた1980年代の山村だ。だが視点を完全な一人称へと先鋭化させ、零がカメラで霊と戦うのに対し、ウツロマユは武器そのものを取り去る——蚕女と戦うことはできず、ただ隠れ、やり過ごすしかない。2001年の作品に公式 Steam 版は存在しないため、その原点は Wikidata のエントリで同定する。",
      },
    ],
    en: {
      title: "Hollow Cocoon - a buried first-person Japanese exploration horror where you scavenge a 1980s mountain village and hide from a silkworm-woman, steeped in a real silk-origin folktale, an heir to Fatal Frame",
      description: "A first-person Japanese horror adventure set in Ichinose, a 1980s mountain village. You explore, solve puzzles, and scavenge scarce resources while a monster, a silkworm-woman, hunts the dark and you cannot fight her, only hide. The story is a sisters' love-and-hatred drama drawn from a real Ibaraki folktale of silk's origin, the legend of the Golden Princess, with four endings and three difficulties. By NAYUTA STUDIO, a two-person Tokyo doujin circle. Very Positive at 906 reviews and 92 percent; it supports English, yet the West has only partly found it.",
      h1a: "You cannot fight it. ",
      h1flip: "Hold your breath and hide while the silkworm-woman hunts the dark",
      h1b: ".",
      lede: "A first-person Japanese horror adventure set in Ichinose, a village deep in the 1980s Japanese mountains. You explore on foot, solve puzzles, and scavenge scarce resources, all while a monster, a silkworm-woman, hunts the dark, and you cannot fight her: survival is hiding and slipping past. The story is a sisters' tale of love and hatred, drawn from a real folktale of Ibaraki Prefecture about the origin of silk farming, the legend of the Golden Princess, wrapped in silkworm-and-cocoon imagery, and it carries four branching endings and three difficulty levels. Made by NAYUTA STUDIO, a two-person Tokyo doujin circle, in the lineage of Fatal Frame. It already supports English, yet the West has only partly found it.",
      s1: "First, the one feeling",
      feeling: [
        "The monster cannot be killed, so the design takes your weapon away and leaves you only your breath: when the silkworm-woman is near, the whole game narrows to reading her path through the dark, choosing the one moment to move, and holding still while she passes, so the dread sits on patience and nerve rather than aim.",
        "Survival runs on what you can find, so every drawer you open and every room you step into in the first-person dark is a wager: the resources you need to go on are out there, but looking for them is exactly what exposes you, and the village is built so that curiosity and safety pull against each other.",
        "Underneath the fear is a myth, the real Ibaraki legend of silk's origin retold as a sisters' love-and-hatred drama in cocoon imagery, and with four branching endings across three difficulty levels, the pull is not just to survive the night but to learn which truth, and which ending, the village finally gives you.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Fatal Frame and the cursed-rural-Japan dread rooted in old folk belief, here a haunted 1980s mountain village steeped in a real Ibaraki folktale of silk's origin, the legend of the Golden Princess, told as a sisters' love-and-hatred drama",
        "You want exploration horror built on hiding, not fighting: scavenge scarce resources, solve puzzles, and slip past a silkworm-woman you cannot kill, in full first-person, across four branching endings and three difficulty levels",
        "You want a Japanese two-person doujin gem the West has only partly found, Very Positive at 92 percent over 906 reviews, that already supports English and many other languages",
      ],
      bad: [
        "You want to fight back, with weapons or a camera you battle ghosts with; here the monster cannot be killed, and the whole loop is hiding and evading, not combat",
        "You are sensitive to heavy content, it carries depictions of violence, bloodshed, and suicide (though nothing sexual), or you expect a big, already-popular Western title; this is a 1,480-yen paid doujin work, fully released and not in Early Access, still largely Japanese- and Chinese-led abroad (about 21.7 percent of reviews are English)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ウツロマユ - 1980年代の山村で資源を集め、殺せない蚕女から隠れる、養蚕起源の民話を下敷きにした、零 -ZERO- の系譜の埋もれた一人称和風ホラー",
      description: "1980年代の山深い村「一ノ瀬」を舞台にした、一人称視点の和風ホラーアドベンチャー。探索し、謎を解き、乏しい資源を集める間、闇を徘徊する怪物「蚕女」とは戦えず、隠れるしかない。物語は、実在する茨城の養蚕起源民話「金色姫伝説」を下敷きにした姉妹の愛憎劇で、4分岐エンディングと3段階の難易度を持つ。東京の2人組同人サークル NAYUTA STUDIO 制作。906レビュー92%で非常に好評。英語に対応済みだが、西はまだ半分しか見つけていない。",
      h1a: "戦えはしない。",
      h1flip: "息を殺して隠れ、闇を這う蚕女をやり過ごせ",
      h1b: "。",
      lede: "1980年代の山深い日本の村「一ノ瀬」を舞台にした、一人称視点の和風ホラーアドベンチャー。足で探索し、謎を解き、乏しい資源をかき集める——その間ずっと、闇の中を一体の怪物「蚕女」が徘徊する。彼女と戦うことはできない。生き延びる術は、隠れ、やり過ごすことだけだ。物語は、茨城県に実在する養蚕の起源民話——「金色姫伝説」——を下敷きにした姉妹の愛憎劇で、蚕と繭のモチーフに包まれている。エンディングは4分岐、難易度は3段階。東京の2人組同人サークル NAYUTA STUDIO が手がける、零 -ZERO- の系譜に連なる一本。英語に対応済みだが、西はまだ半分しか見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "怪物は殺せない。だから設計は、あなたから武器を取り上げ、残すのは息だけだ。蚕女が近いとき、ゲームの全てが、闇の中で彼女の進路を読み、動く一瞬を選び、通り過ぎるまで身を潜める——その一点に絞られる。だから恐怖は、狙いではなく、忍耐と胆力に乗る。",
        "生き延びる術は、見つけたものに懸かっている。だから一人称の闇の中で、引き出しを一つ開け、部屋へ一歩入るたびに、それは賭けになる。先へ進むのに要る資源は、その先にある——だが、それを探すことこそが、あなたを晒す。村は、好奇心と安全が引き合うように作られている。",
        "恐怖の下にあるのは、一つの神話だ。実在する茨城の養蚕起源の伝説が、繭のモチーフをまとった姉妹の愛憎劇として語り直される。4つの分岐エンディングと3段階の難易度——だから手を引くのは、夜を生き延びることだけではない。村が最後にどの真実を、どのエンディングを差し出すのかを、知りたくなる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "古い民間信仰に根ざした、呪われた日本の田舎の恐怖——零 -ZERO- の味が好きな人。本作ではそれを、実在する茨城の養蚕起源の伝説「金色姫伝説」を下敷きにした、姉妹の愛憎劇として、呪われた1980年代の山村が担う",
        "戦いではなく「隠れること」で組まれた探索ホラーが欲しい人——乏しい資源をかき集め、謎を解き、殺せない蚕女をやり過ごす。完全な一人称で、4つの分岐エンディングと3段階の難易度がある",
        "西側がまだ半分しか見つけていない、日本の2人組同人の原石が欲しい人——906レビュー92%で非常に好評、しかも英語（と多くの言語）に対応済み",
      ],
      bad: [
        "武器や、霊と戦うカメラで反撃したい人(本作の怪物は殺せず、ループの全ては戦闘ではなく、隠れ、やり過ごすことにある)",
        "重い描写が苦手な人(本作は、性的なものはないが、暴力・流血・自殺の描写を含む)、あるいはすでに西で人気の大作を期待する人(本作は価格1,480円の有料同人作で、アーリーアクセスではなく正式リリース済み、海外ではまだ日本語・中国語が中心——英語レビューは約21.7%)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "dungeon-antiqua-2": {
    published: "2026-06-30",
    publishAt: "2026-06-30",
    kind: "find",
    leadIndex: 0,
    // reachState は意図的に持たせない: 英語対応済み(English/Japanese/Simplified Chinese)なので
    //   "lang_walled" は rarityStamps の "英語にまだ非対応" を誤って立てる(正直さ)。英語レビュー比率
    //   約38%(98/257)=西へ部分到達のため "unreached_west"(西未到達)も実態とずれる。obscurity は
    //   "wall"(高評価だが言語/地域の壁)で正直に表す。stamp は 95%好評 + レビュー257件のみ立てる。
    meta: { genre: "dungeon-rpg", lineage: "final-fantasy-v", obscurity: "wall", reviewBand: "hundreds", rarity: { reviews: 257, positivePct: 95, noEnglish: false } },
    games: [
      {
        name_en: "Dungeon Antiqua 2",
        name_ja: "Dungeon Antiqua 2",
        status: "hidden",
        steam: "https://store.steampowered.com/app/4005090/Dungeon_Antiqua_2/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Super Famicom-styled 2D dungeon hack-and-slash RPG by Shiromofu Factory, the work of the Japanese solo creator frenchbread, with pixel art and sound cast in the SFC mold. You explore six dungeons through line of sight and visible symbol encounters, fight in side-view battles, and build your party across 10 jobs (including new ones, a priest and an archer) plus skill builds, in the freely-composed, reassignable job tradition that runs back through Final Fantasy and Wizardry. It runs roughly 10 to 12 hours and is built with Pyxel, the Japanese retro game engine by Takashi Kitao. The sequel to Dungeon Antiqua (2024), which sits at 90 percent over 363 reviews from the same creator, it is Very Positive at 95 percent over 257 reviews (245 positive, 12 negative). It supports English, Japanese, and Simplified Chinese, and with 98 of its 257 reviews in English (about 38 percent) the West has begun to find it, further along than most of our digs, though its audience is still mainly Japanese. Released in January 2026, it is a paid title around 1,000 yen, not free, fully launched and not in Early Access, with no AI-generated assets and nothing sexual. One note to clear up: this Shiromofu Factory / frenchbread is a completely unrelated namesake to the fighting-game studio French-Bread (Melty Blood, UNDER NIGHT IN-BIRTH).",
        desc_ja: "スーパーファミコン風のピクセルアートとサウンドで作られた、2Dダンジョン・ハック&スラッシュRPG。開発元は Shiromofu Factory（しろもふファクトリー）——日本の個人クリエイター frenchbread（ふれんち）の手による一本だ。視界とマップ上に見えるシンボルエンカウントで6つのダンジョンを探索し、サイドビューの戦闘を戦い、10のジョブ（新ジョブの僧侶と弓使いを含む）とスキルビルドでパーティを組み上げる——ファイナルファンタジーやウィザードリィへと遡る、自由に組み替えるジョブ編成の系譜にある。プレイ時間はおよそ10〜12時間、開発には日本製のレトロゲームエンジン Pyxel（北尾崇 作）が使われている。同じ作者による前作 Dungeon Antiqua（2024年・363レビュー90%）の続編で、本作は257レビュー95%（好評245・不評12）で非常に好評。英語・日本語・簡体字中国語に対応し、257件のうち98件（約38%）が英語レビュー——西はこの一本を見つけ始めており、これまでの発掘より一歩先まで進んでいる。それでも観客の中心は、まだ日本語圏だ。2026年1月リリース、価格はおよそ1,000円の有料作で、無料ではなく、アーリーアクセスでもない正式リリース済み。AI生成アセットはなく、性的な要素もない。一つだけ補足を——この Shiromofu Factory / frenchbread は、格闘ゲームのスタジオ French-Bread（Melty Blood、UNDER NIGHT IN-BIRTH）とは完全に無関係の同名別者だ。",
      },
      {
        name_en: "Final Fantasy V",
        name_ja: "ファイナルファンタジーV",
        status: "established",
        steam: "https://store.steampowered.com/app/1173810/FINAL_FANTASY_V/",
        wikidata: "https://www.wikidata.org/wiki/Q900305",
        tag_en: "The job-system origin",
        tag_ja: "ジョブシステムの原点",
        desc_en: "The origin of the build-your-party RPG: Final Fantasy V, the fifth entry in Square's role-playing series, released for the Super Famicom in 1992, is the game that crystallized the Job System. Your party freely switches among a wide roster of jobs, learns abilities from each, and carries those abilities across jobs to assemble custom characters, making the deliberate composition of a party the heart of play. That freely-reassignable job design is the root that Dungeon Antiqua 2 grows from, where 10 jobs and skill builds let you rebuild your party for each dungeon, but it strips the world down to a compact, sight-based dungeon crawl with visible symbol encounters and side-view battles rather than a sprawling world map. The 1992 original is anchored here to its Pixel Remaster Steam release.",
        desc_ja: "「パーティを組み上げる」RPGの原点。ファイナルファンタジーVは、スクウェアのロールプレイングシリーズ第5作として1992年にスーパーファミコン向けに発売され、「ジョブシステム」を結晶化させた作品である。パーティは数多くのジョブを自由に切り替え、それぞれからアビリティを習得し、ジョブをまたいでそのアビリティを持ち越して、自分だけのキャラクターを組み上げる——パーティを意図して編成すること、それ自体を遊びの核に据えた。この自由に組み替えられるジョブ設計こそ、Dungeon Antiqua 2 が育つ根だ。本作では10のジョブとスキルビルドが、ダンジョンごとにパーティを組み直させる。だが広大なワールドマップではなく、視界に基づくコンパクトなダンジョン探索と、目に見えるシンボルエンカウント、そしてサイドビューの戦闘へと世界を削ぎ落としている。1992年の原作は、そのピクセルリマスター版の Steam ページで同定する。",
      },
    ],
    en: {
      title: "Dungeon Antiqua 2 - a Super Famicom-style 2D dungeon hack-and-slash where you freely compose a party across 10 jobs and skill builds, an heir to Final Fantasy V's job system, only beginning to reach the West",
      description: "A Super Famicom-styled 2D dungeon hack-and-slash RPG by Shiromofu Factory, the solo creator frenchbread. Explore six dungeons by line of sight and visible symbol encounters, fight in side-view battles, and rebuild your party across 10 jobs (including a new priest and archer) plus skill builds, in the freely-reassignable job tradition of Final Fantasy V. Built with the Japanese Pyxel engine, roughly 10 to 12 hours. Very Positive at 95 percent over 257 reviews; it supports English, yet with about 38 percent English reviews the West has only begun to find it.",
      h1a: "You do not pick one class and lock in. ",
      h1flip: "Reassign your whole party across ten jobs, dungeon by dungeon",
      h1b: ".",
      lede: "A Super Famicom-styled 2D dungeon hack-and-slash RPG by Shiromofu Factory, the work of the Japanese solo creator frenchbread, with pixel art and sound cast in the SFC mold. You explore six dungeons through line of sight and visible symbol encounters, fight in side-view battles, and build your party across 10 jobs (including new ones, a priest and an archer) plus skill builds, in the freely-composed, reassignable job tradition that runs back to Final Fantasy V. Built with the Japanese Pyxel engine and running roughly 10 to 12 hours, it is Very Positive at 95 percent over 257 reviews. It already supports English, yet with about 38 percent of its reviews in English, the West has only begun to find it.",
      s1: "First, the one feeling",
      feeling: [
        "You are never locked into one class, so the core of the game is composition: across 10 jobs (including a new priest and an archer) plus skill builds, you read what a dungeon throws at you and reassign your party to answer it, the same Final Fantasy V job-system pull of what if I combine these, now turned over and rebuilt dungeon by dungeon.",
        "Encounters are not invisible random battles, they are symbols you can see, governed by line of sight, so exploring is a quiet act of choosing: you read the field, decide which fights to take and which to slip past, and that decision repeats across six hand-made dungeons rather than being rolled for you.",
        "It is built to be finished, not farmed: Super Famicom-style pixel art and sound, side-view battles with a fast hack-and-slash rhythm, six dungeons and roughly 10 to 12 hours, the whole arc of a 90s job RPG in a compact, fully-released shell a single creator could polish end to end.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Final Fantasy V job system and the joy of freely composing a party, here 10 jobs including a new priest and archer, plus skill builds, rebuilt to answer each of six dungeons",
        "You want a compact, fully-released SFC-style 2D dungeon hack-and-slash with side-view battles and visible symbol encounters you can read and choose, all in roughly 10 to 12 hours",
        "You want a Japanese solo-made gem the West has only begun to find, Very Positive at 95 percent over 257 reviews, already supporting English and Simplified Chinese, from Shiromofu Factory's frenchbread, built with the Japanese Pyxel engine",
      ],
      bad: [
        "You want a huge, modern, fully 3D RPG or a long open world; this is a deliberately retro, Super Famicom-style 2D dungeon RPG of about 10 to 12 hours, a paid title around 1,000 yen, made by one person",
        "You expect a big-studio blockbuster, or you are looking for the fighting-game studio French-Bread of Melty Blood and UNDER NIGHT IN-BIRTH; this is a completely unrelated namesake solo doujin developer, and the audience is still mostly Japanese (about 38 percent of reviews are English)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Dungeon Antiqua 2 - 10のジョブとスキルビルドでパーティを自由に組み上げる、スーパーファミコン風の2Dダンジョン・ハック&スラッシュ。ファイナルファンタジーVのジョブシステムの系譜、西がようやく見つけ始めた一本",
      description: "Shiromofu Factory（個人クリエイター frenchbread）による、スーパーファミコン風の2Dダンジョン・ハック&スラッシュRPG。視界と見えるシンボルエンカウントで6つのダンジョンを探索し、サイドビューの戦闘を戦い、10のジョブ（新ジョブの僧侶と弓使いを含む）とスキルビルドでパーティを組み直す——ファイナルファンタジーVの、自由に組み替えるジョブ編成の系譜。日本製の Pyxel エンジン製、約10〜12時間。257レビュー95%で非常に好評。英語に対応済みだが、英語レビューは約38%、西はようやく見つけ始めたばかりだ。",
      h1a: "ひとつの職に縛られない。",
      h1flip: "10のジョブでパーティを丸ごと組み替え、ダンジョンを攻略する",
      h1b: "。",
      lede: "スーパーファミコン風のピクセルアートとサウンドで作られた、2Dダンジョン・ハック&スラッシュRPG。開発元は Shiromofu Factory（しろもふファクトリー）——日本の個人クリエイター frenchbread（ふれんち）の手による一本だ。視界とマップ上に見えるシンボルエンカウントで6つのダンジョンを探索し、サイドビューの戦闘を戦い、10のジョブ（新ジョブの僧侶と弓使いを含む）とスキルビルドでパーティを組み上げる——ファイナルファンタジーVへと遡る、自由に組み替えるジョブ編成の系譜にある。日本製の Pyxel エンジンで作られ、プレイ時間はおよそ10〜12時間。257レビュー95%で非常に好評だ。すでに英語に対応しているが、レビューのうち英語は約38%——西はこの一本を、ようやく見つけ始めたばかりだ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ひとつの職に縛られることがない。だからゲームの核は「編成」だ。10のジョブ（新ジョブの僧侶と弓使いを含む）とスキルビルドの中で、ダンジョンが突きつけてくるものを読み、それに応えるようパーティを組み替える——「これとこれを組み合わせたら？」というファイナルファンタジーVのジョブシステムの引力が、ここではダンジョンごとに、何度もひっくり返され、組み直される。",
        "エンカウントは、見えない乱数の戦闘ではない。視界に支配された、目に見えるシンボルだ。だから探索は、静かな「選択」の行為になる——盤面を読み、どの戦いを受け、どれをすり抜けるかを決める。そしてその判断が、手作りの6つのダンジョンを通して繰り返される。あなたの代わりに、サイコロが振られることはない。",
        "これは「やり込んで搾る」ためではなく、「遊び終える」ために作られている。スーパーファミコン風のピクセルアートとサウンド、速いハック&スラッシュの手触りのサイドビュー戦闘、6つのダンジョンとおよそ10〜12時間——90年代のジョブRPGの一巡りが、ひとりの作者が端から端まで磨き上げられる、コンパクトで正式リリース済みの器に収まっている。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "ファイナルファンタジーVのジョブシステムと、パーティを自由に編成する楽しさが好きな人。本作ではそれを、新ジョブの僧侶と弓使いを含む10のジョブとスキルビルドが担い、6つのダンジョンそれぞれに応えるよう組み直す",
        "コンパクトで正式リリース済みの、スーパーファミコン風2Dダンジョン・ハック&スラッシュが欲しい人。サイドビューの戦闘と、読んで選べる見えるシンボルエンカウント、すべてがおよそ10〜12時間に収まる",
        "西側がようやく見つけ始めた、日本の個人制作の原石が欲しい人。257レビュー95%で非常に好評、英語（と簡体字中国語）に対応済み、Shiromofu Factory の frenchbread が日本製の Pyxel エンジンで作った一本",
      ],
      bad: [
        "大規模で現代的な、フル3DのRPGや長大なオープンワールドが欲しい人(本作はあえてレトロな、スーパーファミコン風の2DダンジョンRPGで、約10〜12時間、価格およそ1,000円の有料作、ひとりで作られている)",
        "大手スタジオの大作を期待する人、あるいは Melty Blood や UNDER NIGHT IN-BIRTH の格闘ゲームスタジオ French-Bread を探している人(本作はそれとは完全に無関係の同名の個人同人開発者で、観客の中心はまだ日本語圏だ——英語レビューは約38%)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "decollate-decoration": {
    published: "2026-06-30",
    publishAt: "2026-06-30",
    kind: "find",
    leadIndex: 0,
    // reachState は意図的に持たせない: 英語対応済み(Japanese/English/Simplified+Traditional Chinese/Korean)
    //   なので "lang_walled" は rarityStamps の "英語にまだ非対応" を誤って立てる(正直さ)。英語レビュー比率
    //   27.5%(98/356)=西へ部分到達のため "unreached_west"(西未到達)も実態とずれる。obscurity は
    //   "wall"(高評価だが言語/地域の壁)で正直に表す。stamp は 93%好評 + レビュー356件のみ立てる。
    meta: { genre: "haunting-adventure", lineage: "ghost-trick", obscurity: "wall", reviewBand: "hundreds", rarity: { reviews: 356, positivePct: 93, noEnglish: false } },
    games: [
      {
        name_en: "Decollate Decoration",
        name_ja: "でこれいと・でこれいしょん",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3155570/Decollate_Decoration/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A pixel-art point-and-click adventure by KANEKODO, the work of a Japanese solo doujin creator, published by KEMCO. You play a girl who has become a ghost, with forty-nine days before you pass on. The one you love, called only kimi (you), is still alive and cannot perceive you at all, so you reach for them by the only means a ghost has: speaking into air that does not carry, stirring a poltergeist, standing at the edge of their dream, or laying a curse. Because they cannot sense you, every attempt is guesswork, a dark comedy laced with horror about trying to change a fate from the far side of death. Choices come once a week over seven turns, a deliberately spare structure carried by dense, feeling-heavy writing, and the whole runs roughly one to two hours across six endings, plus a prequel and sequel of about an hour, a recollection gallery, and an ending list. It is Very Positive at 93 percent over 356 reviews (333 positive, 23 negative), and it already supports Japanese, English, Simplified and Traditional Chinese, and Korean. Yet with only 98 of its 356 reviews in English (about 27.5 percent), and the rest mostly Japanese and Chinese, the West has barely begun to find it. Released in January 2026, it is a paid title, not free, fully launched and not in Early Access, with no AI-generated assets. Its ratings flag heavy themes around death, but Steam itself sets no sexual content descriptor.",
        desc_ja: "ピクセルアートのポイント&クリック・アドベンチャー。開発元は KANEKODO（金庫堂）——日本の個人同人クリエイターの手による一本で、配信は KEMCO だ。あなたは幽霊になった少女。あの世へ旅立つまでの、残された四十九日。想い人——「きみ」とだけ呼ばれる相手——はまだ生きていて、あなたを少しも知覚できない。だからあなたは、幽霊にできる手立てだけで手を伸ばす——届かない空気へ話しかけ、ポルターガイストを起こし、夢枕に立ち、呪う。相手はあなたを感じ取れないから、どの試みも手探りだ。死の向こう側から運命を変えようとする、ダークコメディとホラーが入り混じる物語。選択は週に一度、全七ターン——あえて簡素にした構造を、心情描写の濃いテキストが支える。本編は六つのエンディングでおよそ一〜二時間、加えて約一時間の前日譚／後日譚、回想ギャラリー、エンディングリスト。356レビュー93%（好評333・不評23）で非常に好評。日本語・英語・簡体字／繁体字中国語・韓国語に対応している。それでも、356件のうち英語レビューは98件（約27.5%）にとどまり、残りの多くは日本語・中国語圏——西はこの一本を、まだ見つけ始めたばかりだ。2026年1月リリース、無料ではない有料作で、アーリーアクセスでもない正式リリース済み。AI生成アセットはない。レーティングは死をめぐる重いテーマに注記を付けているが、Steam 自身は性的な内容のディスクリプタを設定していない。",
      },
      {
        name_en: "Ghost Trick: Phantom Detective",
        name_ja: "ゴーストトリック",
        status: "established",
        steam: "https://store.steampowered.com/app/1967430/Ghost_Trick_Phantom_Detective/",
        tag_en: "The haunting origin",
        tag_ja: "干渉する幽霊の原点",
        desc_en: "The origin of this taste: Ghost Trick: Phantom Detective, a puzzle adventure directed by Shu Takumi (of the Ace Attorney series) and released by Capcom for the Nintendo DS in 2010, with a Steam remaster in 2023. You play a spirit who, robbed of his memories on the night of his death, can possess and manipulate objects in the world and rewind to the four minutes before a person dies, bending the physical world to change their fate before time runs out. That core, a ghost reaching into the living world under a clock to rewrite a fate, is the root Decollate Decoration grows from, turning the puzzle-box energy inward into a quiet, forty-nine-day story of haunting the one person you love but cannot reach. The 2010 original is anchored here to its 2023 Steam remaster.",
        desc_ja: "この味の原点——ゴーストトリック（Ghost Trick: Phantom Detective）。逆転裁判シリーズの巧舟がディレクションし、カプコンが2010年にニンテンドーDS向けに発売したパズルアドベンチャーで、2023年にSteamリマスター版が出た。プレイヤーは、死んだ夜に記憶を奪われた幽霊となり、世界の「物」に乗り移って操り、人が死ぬ直前の四分間へ巻き戻る——時間が尽きる前に、物理世界を曲げて人の運命を変えていく。この核——制限時間のなかで、幽霊が生者の世界に手を伸ばし、運命を書き換える——こそ、Decollate Decoration が育つ根だ。本作はそのパズル的なエネルギーを内へ向け、届かない想い人ひとりに「取り憑く」静かな四十九日の物語へと変えている。2010年の原作は、その2023年のSteamリマスター版で同定する。",
      },
    ],
    en: {
      title: "Decollate Decoration - a pixel-art haunting adventure where a dead girl has forty-nine days to reach the living person she loves through poltergeists, dreams, and curses, an intimate heir to Ghost Trick, only barely reaching the West",
      description: "A pixel-art point-and-click adventure by the Japanese solo doujin creator KANEKODO, published by KEMCO. You are a girl who has become a ghost with forty-nine days to reach the living person you love, who cannot perceive you at all, by speaking into the air, stirring poltergeists, entering dreams, or laying curses, a dark comedy laced with horror. Choices come once a week over seven turns, carried by dense writing, across six endings in one to two hours. Very Positive at 93 percent over 356 reviews; it supports English, yet with only 27.5 percent English reviews the West has barely begun to find it.",
      h1a: "You are dead, and the one you love cannot see, hear, or touch you. ",
      h1flip: "You have forty-nine days to haunt your way back into a living person's fate",
      h1b: ".",
      lede: "A pixel-art point-and-click adventure by KANEKODO, the work of a Japanese solo doujin creator, published by KEMCO. You play a girl who has become a ghost, with forty-nine days before you pass on. The one you love, called only kimi (you), is still alive and cannot perceive you at all, so you reach for them by the only means a ghost has: speaking into air that does not carry, stirring a poltergeist, standing at the edge of their dream, or laying a curse. Because they cannot sense you, every attempt is guesswork, a dark comedy laced with horror about changing a fate from the far side of death. Choices come once a week over seven turns, a deliberately spare structure carried by dense, feeling-heavy writing, running roughly one to two hours across six endings. It is Very Positive at 93 percent over 356 reviews and already supports English, yet with only about 27.5 percent of its reviews in English, the West has barely begun to find it.",
      s1: "First, the one feeling",
      feeling: [
        "The whole game rests on a cruel asymmetry: the person you most want to reach cannot see, hear, or touch you, so you can never simply tell them anything. You only have a ghost's blunt instruments, words that do not carry, rattled objects, a dream you slip into, a curse, and you have to guess how each one lands on someone who has no idea you are there. Reaching them at all, by inches, becomes the entire feeling.",
        "Time is not infinite. You get one move a week across seven turns inside a forty-nine-day countdown, so the structure is deliberately spare, and each choice carries weight precisely because you cannot take many. It is the Ghost Trick pull of a ghost bending the world to change a living person's fate, slowed down and turned inward, where the question is less how do I solve this and more what is the one thing I can still do for them before I have to go.",
        "It does not play its premise as pure tragedy. A ghost fumbling poltergeists at a person who cannot perceive her is as often funny as it is sad, and the tone swings between dark comedy and quiet horror within a single scene. Six endings of about fifteen minutes each, a prequel and a sequel, and a recollection gallery make it a thing you finish and then turn over again, reading the same forty-nine days toward a different end.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You loved Ghost Trick's idea of a ghost reaching into the living world to change someone's fate, and you want it slowed into something quieter and more intimate, a forty-nine-day countdown spent haunting the one person you cannot reach",
        "You want a short, dense, feeling-heavy adventure you can finish in one or two hours, six endings of about fifteen minutes each plus a prequel and sequel and a recollection gallery, carried by its writing rather than by long systems",
        "You want a Japanese solo-made gem the West has barely found, Very Positive at 93 percent over 356 reviews, already supporting English, Simplified and Traditional Chinese, and Korean, the handmade pixel-art work of KANEKODO published by KEMCO",
      ],
      bad: [
        "You want long, mechanically deep gameplay; this is a deliberately spare, story-first adventure of one to two hours, choices once a week over seven turns, a paid title carried by its writing far more than by its systems",
        "You are put off by death and grief as central themes, or you expect a big-studio production; this is a small doujin work by a solo creator (KEMCO publishes it, but it is not a big-studio title), its ratings call out heavy themes around death though Steam itself flags no sexual content, and its audience is still mostly Japanese and Chinese-speaking, with only about 27 percent of reviews in English",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "でこれいと・でこれいしょん - 幽霊になった少女が、残された四十九日で、想い人へ手を伸ばす。ポルターガイストや夢や呪いで生者の運命に干渉する、ピクセルアートの幽霊アドベンチャー。ゴーストトリックの系譜、西がようやく見つけ始めた一本",
      description: "日本の個人同人クリエイター KANEKODO（金庫堂）が作り、KEMCO が配信する、ピクセルアートのポイント&クリック・アドベンチャー。あなたは幽霊になった少女。死後四十九日のうちに、あなたを知覚できない想い人へ手を伸ばす——話しかけ、ポルターガイストを起こし、夢枕に立ち、呪う。ダークコメディとホラーが入り混じる。選択は週に一度、全七ターン。心情描写の濃いテキストが支え、本編は六つのエンディングで一〜二時間。356レビュー93%で非常に好評。英語に対応済みだが、英語レビューは27.5%——西はこの一本を、ようやく見つけ始めたばかりだ。",
      h1a: "あなたは死んでいて、想い人にはあなたが見えない、聞こえない、触れられない。",
      h1flip: "残された四十九日で、生者の運命に「取り憑いて」干渉する",
      h1b: "。",
      lede: "ピクセルアートのポイント&クリック・アドベンチャー。開発元は KANEKODO（金庫堂）——日本の個人同人クリエイターの手による一本で、配信は KEMCO だ。あなたは幽霊になった少女。あの世へ旅立つまでの、残された四十九日。想い人——「きみ」とだけ呼ばれる相手——はまだ生きていて、あなたを少しも知覚できない。だからあなたは、幽霊にできる手立てだけで手を伸ばす——届かない空気へ話しかけ、ポルターガイストを起こし、夢枕に立ち、呪う。相手はあなたを感じ取れないから、どの試みも手探りだ。死の向こう側から運命を変えようとする、ダークコメディとホラーが入り混じる物語。選択は週に一度、全七ターン——あえて簡素にした構造を、心情描写の濃いテキストが支える。本編は六つのエンディングでおよそ一〜二時間。356レビュー93%で非常に好評だ。すでに英語に対応しているが、レビューのうち英語は約27.5%——西はこの一本を、まだ見つけ始めたばかりだ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ゲームのすべては、ひとつの残酷な非対称の上に立っている。あなたが最も届きたい相手には、あなたが見えず、聞こえず、触れられない。だから「ただ伝える」ことが、決してできない。手元にあるのは幽霊の不器用な道具だけだ——届かない言葉、揺らした物、忍び込む夢、呪い。そしてそれが、あなたの存在に気づいてもいない相手にどう作用するかを、手探りで推し量るしかない。少しずつ「届くこと」そのものが、ここでの感覚のすべてになる。",
        "時間は、無限ではない。四十九日のカウントダウンのなかで、動けるのは週に一度、全七ターン——だから構造はあえて簡素で、多くを打てないからこそ、一つひとつの選択が重くなる。これは「幽霊が世界を曲げて生者の運命を変える」というゴーストトリックの引力を、減速させ、内へ向けたものだ。問いはもう「どう解くか」ではなく、「旅立つ前に、あの人のためにできる最後の一つは何か」になる。",
        "本作は、その前提を純粋な悲劇としては描かない。自分を知覚できない相手に向かってポルターガイストをしくじる幽霊は、悲しいのと同じくらい、おかしい。トーンはひとつの場面のなかで、ダークコメディと静かなホラーのあいだを揺れる。約十五分の六つのエンディング、前日譚と後日譚、回想ギャラリー——それらが、一度遊び終えてもまた裏返したくなる一本にする。同じ四十九日を、別の結末へと読み直すために。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "「幽霊が生者の世界に手を伸ばし、誰かの運命を変える」というゴーストトリックの発想が好きで、それをもっと静かで親密なものへ——届かないただ一人に取り憑く、四十九日のカウントダウンへと——減速させたものが欲しい人",
        "一〜二時間で遊び終えられる、短く濃い、心情描写中心のアドベンチャーが欲しい人。約十五分の六つのエンディングに加え、前日譚・後日譚と回想ギャラリー、長大なシステムではなくテキストが支える一本",
        "西側がまだほとんど見つけていない、日本の個人制作の原石が欲しい人。356レビュー93%で非常に好評、英語・簡体字／繁体字中国語・韓国語に対応済み、KANEKODO が手描きのピクセルアートで作り KEMCO が配信する一本",
      ],
      bad: [
        "長く、メカニクスの奥深いゲームプレイが欲しい人(本作はあえて簡素な、物語優先の一〜二時間のアドベンチャーで、選択は週に一度・全七ターン、システムよりもテキストが支える有料作だ)",
        "死や喪失を中心テーマに据えることが苦手な人、あるいは大手スタジオの大作を期待する人(本作は個人クリエイターによる小さな同人作で——配信は KEMCO だが大手スタジオの作品ではない——、レーティングは死をめぐる重いテーマに注記を付けるものの、Steam 自身は性的な内容を示していない。観客の中心はまだ日本語・中国語圏で、英語レビューは約27%にとどまる)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "momibosu": {
    published: "2026-07-01",
    publishAt: "2026-07-01",
    kind: "find",
    leadIndex: 0,
    // reviewBand は持たせない: 60 件は "hundreds"(数百)にも "around_1k"(約千)にも当たらない(捏造しない)。
    //   rarity.reviews=60 を確定値でそのまま出す。obscurity は "deep"(レビュー僅少・西で無名)。英語対応済みで
    //   noEnglish=false のため lang_walled は使わない(誤って「英語非対応」stamp を立てない・正直さ)。英語レビュー
    //   17/60=28% で西未浸透 = reachState="unreached_west"(ただし stamp は positivePct+reviews で埋まるため
    //   "西ではまだ無名" fallback は発火しない・状態の正直な記録として付す)。
    meta: { genre: "precision-platformer", lineage: "super-meat-boy", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 60, positivePct: 92, noEnglish: false } },
    games: [
      {
        name_en: "MOMIBOSU",
        name_ja: "MOMIBOSU（モミボス）",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2487340/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A high-difficulty, precision 2D platformer by PenGames, the work of the Japanese solo developer peng, hand-built over roughly six years. A boy and a girl set out from their small underground village with a mysterious weapon drone, on a road-movie journey to a vast new world. It is a die-and-retry game built on one feeling, no matter how many times you get hit, one more time: you fall, learn, and throw yourself at the same precise jump again. Its gimmicks turn on the enemies themselves, bump two enemies into each other and something happens, so fights and traversal both become puzzles of using foes against foes, and you collect power-up items and hone technique against boss characters that are not only human but monsters, all across a vast, Metroidvania-style map you explore from an underground village out into new lands. Released in January 2025, it is Very Positive at 92 percent over 60 reviews (55 positive), a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. PenGames is the solo label of the individual developer peng, developer and publisher one and the same. It already supports English and Japanese, yet with only 17 of its 60 reviews in English (about 28 percent, 16 of them positive) and the rest largely Japanese, the Steam English-speaking world has barely found it. It already has a Switch version and Japanese press coverage, but on Steam it is still a small, sixty-review gem the West has not reached.",
        desc_ja: "高難易度・精密の2Dプラットフォーマー。開発元は PenGames——日本の個人開発者 peng が、およそ6年をかけて手作りした一本だ。少年と少女が、地下の小さな村から、謎の兵器ドローンを手に、広大な新天地を目指すロードムービーのような旅に出る。核にあるのは、たった一つの感覚——「何度やられても、もう一回」。落ちて、学んで、同じ精密な跳躍へ、もう一度身を投げる、ダイ&リトライの設計だ。ギミックは敵そのものを軸に回る——敵同士をぶつけると、何かが起こる。だから戦いも道中も、「敵を敵にぶつけて使う」パズルになる。パワーアップアイテムを集め、技を磨いて、人型だけでなくモンスターのボスに挑む。その全ては、地下の村から新天地へと広がる、メトロイドヴァニア型の広大なマップの中にある。2025年1月リリース、60レビュー92%（好評55）で非常に好評。無料ではない有料作で、アーリーアクセスでもない正式リリース済み。AI生成アセットはなく、Steam 自身のコンテンツディスクリプタ上、性的な要素もない。PenGames は個人開発者 peng の自主レーベルで、開発元と販売元は同一だ。すでに英語と日本語に対応しているが、60件のうち英語レビューは17件（約28%、うち16件が好評）にとどまり、残りの多くは日本語圏——Steam の英語圏は、この一本をまだほとんど見つけていない。すでに Switch 版や日本メディアの露出はあるが、Steam では60レビューと小規模で、西はまだ届いていない。",
      },
      {
        name_en: "Super Meat Boy",
        name_ja: "Super Meat Boy",
        status: "established",
        steam: "https://store.steampowered.com/app/40800/Super_Meat_Boy/",
        wikidata: "https://www.wikidata.org/wiki/Q1784048",
        tag_en: "The die-and-retry origin",
        tag_ja: "ダイ&リトライの原点",
        desc_en: "The origin of the die-and-retry precision platformer: Super Meat Boy, made by Team Meat, the two-person studio of Edmund McMillen and Tommy Refenes, and released in 2010. You play a cube of living meat racing through hyper-precise gauntlets of saw blades and hazards to rescue Bandage Girl, dying instantly on the smallest mistake and respawning at once, fast enough that death becomes just another attempt. By pairing merciless, pixel-tight platforming with instant restarts, it crystallized the modern one-more-try precision platformer, the lineage where the whole loop is failing, learning, and hurling yourself at the same jump again. That core is the root MOMIBOSU grows from, keeping the die-and-retry precision but wrapping it in enemy-collision gimmicks, boss fights, power-up items, and a vast Metroidvania-style world to explore. The 2010 game is anchored here to its Steam release.",
        desc_ja: "ダイ&リトライ型の精密プラットフォーマーの原点——Super Meat Boy。Edmund McMillen と Tommy Refenes の2人組スタジオ Team Meat が制作し、2010年に発売された。プレイヤーは生きた肉の塊となり、ノコギリの刃と罠で埋め尽くされた超精密なコースを駆け抜け、包帯少女（Bandage Girl）を救い出す——ほんの小さなミスで即死し、すぐさま復活する。その復活があまりに速いから、死は次の一回の挑戦にすぎなくなる。容赦のないピクセル単位のプラットフォーミングと、瞬時のリスタートを結びつけたことで、現代の「もう一回」精密プラットフォーマーを結晶化させた——失敗し、学び、同じ跳躍へまた身を投げる、そのループの全てを核にした系譜の原点である。この核こそ、MOMIBOSU が育つ根だ。本作はダイ&リトライの精密さを受け継ぎながら、それを敵同士の衝突ギミック、ボス戦、パワーアップアイテム、そして探索すべきメトロイドヴァニア型の広大な世界で包んでいる。2010年の作品は、その Steam ページで同定する。",
      },
    ],
    en: {
      title: "MOMIBOSU - a high-difficulty precision 2D platformer where you die and retry, bump enemies into each other, and explore a vast Metroidvania world, a six-year solo-made heir to Super Meat Boy the Steam West has barely found",
      description: "A high-difficulty, precision 2D platformer by PenGames, the solo developer peng, hand-built over roughly six years. A boy and a girl leave their underground village with a mysterious weapon drone for a vast new world, in a die-and-retry game built on one feeling: no matter how many times you get hit, one more time. Gimmicks turn on the enemies themselves, bump two together and something happens, and you collect power-ups and fight human and monster bosses across a vast Metroidvania map. Very Positive at 92 percent over 60 reviews; it supports English, yet with only about 28 percent English reviews the Steam West has barely found it.",
      h1a: "You will die, again and again. ",
      h1flip: "And every time, the one feeling is the same: one more try",
      h1b: ".",
      lede: "A high-difficulty, precision 2D platformer by PenGames, the work of the Japanese solo developer peng, hand-built over roughly six years. A boy and a girl set out from their small underground village with a mysterious weapon drone, on a road-movie journey to a vast new world. It is a die-and-retry game built on one feeling, no matter how many times you get hit, one more time: you fall, learn, and throw yourself at the same precise jump again. Its gimmicks turn on the enemies themselves, bump two enemies into each other and something happens, and you collect power-up items and hone technique against bosses that are not only human but monsters, all across a vast, Metroidvania-style map. In the lineage of Super Meat Boy. It already supports English, yet the Steam English-speaking world has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "The whole game is built to be failed. Its precision platforming kills you on the smallest mistake, but dying costs almost nothing, and the pull is always the same, one more try: you fall, read exactly where you fell, and hurl yourself at the same jump again, so what stays is not frustration but the tightening loop of getting one inch further with every attempt.",
        "Its gimmicks turn on the enemies themselves. Bump two enemies into each other and something happens, so both traversal and combat become a small puzzle of using foes against foes rather than only dodging or out-jumping them, and the level design keeps asking what you can make the enemies do to open the way.",
        "Underneath the precision runs a vast, Metroidvania-style world, from a small underground village out into new lands, where the power-up items you collect change what you can reach and boss characters that are not only human but monsters gate the road, so the die-and-retry loop is threaded through exploration and a road-movie story of a boy and a girl, not just a string of standalone stages.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Super Meat Boy and the die-and-retry precision platformer, the merciless jump you fail and fail until one more try finally lands, here wrapped in a six-year solo-made adventure",
        "You want that precision threaded through exploration: enemy-collision gimmicks, power-up items, human and monster bosses, and a vast Metroidvania-style world to roam from an underground village into new lands",
        "You want a Japanese solo-made gem the Steam West has barely found, Very Positive at 92 percent over 60 reviews, already supporting English, the hand-built work of PenGames' peng",
      ],
      bad: [
        "You bounce off hard, punishing platformers; this is a high-difficulty, precision die-and-retry game where you are meant to die over and over, and the whole pull is in enduring that loop until it clicks",
        "You expect a big-studio, already-popular Western title or a fully proven hit; this is a paid solo doujin work by one developer (developer and publisher are the same, PenGames), not free and not in Early Access, that already has a Switch version and Japanese press coverage but on Steam is still a small, sixty-review gem the West has not reached (only about 28 percent of reviews are in English)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "MOMIBOSU（モミボス）- 何度も死んで、もう一回。敵同士をぶつけ、メトロイドヴァニア型の広大な世界を探索する、高難易度・精密2Dプラットフォーマー。Super Meat Boy の系譜、Steam の西がまだ見つけていない、6年かけた個人制作の一本",
      description: "PenGames（個人開発者 peng）が、およそ6年かけて手作りした、高難易度・精密の2Dプラットフォーマー。少年と少女が、地下の村から謎の兵器ドローンを手に、広大な新天地を目指す。核にあるのは、たった一つの感覚——「何度やられても、もう一回」。ギミックは敵そのものを軸に回り、敵同士をぶつけると何かが起こる。パワーアップアイテムを集め、人型とモンスターのボスに挑み、メトロイドヴァニア型の広大なマップを探索する。60レビュー92%で非常に好評。英語に対応済みだが、英語レビューは約28%——Steam の西は、この一本をまだほとんど見つけていない。",
      h1a: "何度も、何度も死ぬ。",
      h1flip: "そのたびに残る感覚は、ただ一つ——もう一回",
      h1b: "。",
      lede: "高難易度・精密の2Dプラットフォーマー。開発元は PenGames——日本の個人開発者 peng が、およそ6年をかけて手作りした一本だ。少年と少女が、地下の小さな村から、謎の兵器ドローンを手に、広大な新天地を目指すロードムービーのような旅に出る。核にあるのは、たった一つの感覚——「何度やられても、もう一回」。落ちて、学んで、同じ精密な跳躍へ、もう一度身を投げる。ギミックは敵そのものを軸に回り、敵同士をぶつけると何かが起こる。パワーアップアイテムを集め、人型だけでなくモンスターのボスに、技を磨いて挑む——その全ては、メトロイドヴァニア型の広大なマップの中にある。Super Meat Boy の系譜に連なる一本。英語に対応済みだが、Steam の英語圏は、この一本をまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ゲームのすべては、「失敗する」ために作られている。精密なプラットフォーミングは、ほんの小さなミスであなたを殺す。だが、死ぬコストはほとんどゼロになるよう設計されていて、引力はいつも同じ——「もう一回」。落ちて、どこで落ちたのかを正確に読み、同じ跳躍へまた身を投げる。だから残るのは苛立ちではなく、一回ごとにあと数センチ先へ進む、締まっていくループそのものだ。",
        "ギミックは、敵そのものを軸に回る。敵同士をぶつけると、何かが起こる。だから道中も戦闘も、ただ避け、跳び越えるだけでなく、「敵を敵にぶつけて使う」小さなパズルになる。レベルデザインは、敵に何をさせれば道が開くのかを、繰り返し問いかけてくる。",
        "精密さの下には、メトロイドヴァニア型の広大な世界が広がっている——地下の小さな村から、新天地へ。集めたパワーアップアイテムが、届く範囲を変えていく。人型だけでなくモンスターのボスが、道を塞ぐ。だからダイ&リトライのループは、独立したステージの連なりではなく、探索と、少年と少女のロードムービーのような物語の中に、織り込まれている。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Super Meat Boy と、ダイ&リトライの精密プラットフォーマーが好きな人——何度も失敗する容赦のない跳躍を、「もう一回」でついに決める、あの手触り。本作ではそれを、6年かけた個人制作の冒険が包んでいる",
        "その精密さを、探索に織り込んだものが欲しい人——敵同士の衝突ギミック、パワーアップアイテム、人型とモンスターのボス、そして地下の村から新天地へと巡る、メトロイドヴァニア型の広大な世界",
        "Steam の西がまだほとんど見つけていない、日本の個人制作の原石が欲しい人——60レビュー92%で非常に好評、英語に対応済み、PenGames の peng が手作りした一本",
      ],
      bad: [
        "難しく、厳しいプラットフォーマーが苦手な人(本作は高難易度・精密のダイ&リトライで、何度も死ぬことが前提で、そのループがハマるまで耐える——その点にこそ引力がある)",
        "大手スタジオの、すでに西で人気の大作や、完全に実績のあるヒット作を期待する人(本作はひとりの開発者による有料の同人作で——開発元と販売元は同一の PenGames——無料でもアーリーアクセスでもない。すでに Switch 版や日本メディアの露出はあるが、Steam ではまだ60レビューと小規模で、西には届いていない——英語レビューは約28%だ)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "witchroid-vania": {
    published: "2026-07-01",
    publishAt: "2026-07-01",
    kind: "find",
    leadIndex: 0,
    // reviewBand は持たせない: 83 件は "hundreds"(数百)にも "around_1k"(約千)にも当たらない(捏造しない)。
    //   rarity.reviews=83 を確定値でそのまま出す。obscurity は "deep"(レビュー僅少・西で無名)。英語対応済みで
    //   noEnglish=false のため lang_walled は使わない(誤って「英語非対応」stamp を立てない・正直さ)。英語レビュー
    //   25/83=30.1% で西未浸透 = reachState="unreached_west"(stamp は positivePct+reviews で埋まるため
    //   "西ではまだ無名" fallback は発火しない・状態の正直な記録として付す)。系譜は Castlevania(悪魔城ドラキュラ)。
    meta: { genre: "metroidvania", lineage: "castlevania", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 83, positivePct: 92, noEnglish: false } },
    games: [
      {
        name_en: "Witchroid Vania: A Magical Girl's Fantastical Adventures",
        name_ja: "ウィッチロイドヴァニア 〜魔法少女の不思議な冒険〜",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2615430/Witchroid_Vania_A_Magical_Girls_Fantastical_Adventures/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A 2D Metroidvania starring the magical girl Lily, made by Turkey Games, the work of the Japanese solo developer Turkey (who built everything but the soundtrack alone) and published by the one-person Tokyo doujin label Waku Waku Games. Lily learns elemental magic of fire, ice, wind, and thunder, each in three escalating tiers, and equips three spells at once across four loadout sets she can flip between in the middle of a fight, so combat is about composing a kit and switching it on the fly rather than mashing one attack. What sets it apart from most Metroidvanias is its gate structure: exploration opens up not through movement abilities like a double jump or a dash, but through the magic and tools you gain, so the spell or item that finally lets you cross a barrier is the key that widens the map. Equipment and levels give it RPG-style growth, and a companion mini-dragon fights alongside you and helps you move, threading through both battle and traversal, and the praised heart of it is exhilarating, satisfying combat. Released March 2025, it is Very Positive at 92 percent over 83 reviews (76 positive), a paid title at 1,800 yen, not free, and fully launched rather than in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. Turkey Games is the solo label of the individual developer Turkey, and Waku Waku Games is a one-person Tokyo doujin and indie publisher. It already supports English alongside Japanese and Simplified and Traditional Chinese, yet with only 25 of its 83 reviews in English (about 30 percent, though 24 of those 25 are positive) and no Korean or European languages at all, the Steam English-speaking world has barely found it in absolute numbers; the audience is still largely Japanese.",
        desc_ja: "魔法少女リリィが主役の2Dメトロイドヴァニア。開発元は Turkey Games——日本の個人開発者 Turkey が、サントラ以外はひとりで手作りした一本だ。販売元は、東京・西五反田の、ひとりで営む同人・インディー系レーベル、わくわくゲームズ。リリィは火・氷・風・雷の属性魔法を、それぞれ3段階で習得し、3つを同時に装備した状態を4つのセットとして持ち、戦いの最中に切り替える。だから戦闘は、一つの攻撃を叩き込むのではなく、装備を組み、その場で切り替える遊びになる。多くのメトロイドヴァニアと一線を画すのは、そのゲート構造だ——探索は、二段ジャンプやダッシュのような移動能力ではなく、手に入れた魔法や道具によって開かれていく。だから、ようやく壁を越えさせてくれる魔法やアイテムは、そのままマップを広げる鍵になる。装備とレベルによるRPG的な成長があり、相棒のミニドラゴンが戦いに寄り添い、移動も助けてくれる——戦闘と道中の双方に織り込まれている。そして核にあるのは、爽快なバトルだ。2025年3月リリース、83レビュー92%(好評76)で非常に好評。価格1,800円の有料作で、無料ではなく、アーリーアクセスでもない正式リリース済み。AI生成アセットはなく、Steam 自身のコンテンツディスクリプタ上、性的な要素もない。Turkey Games は個人開発者 Turkey の自主レーベルであり、わくわくゲームズは東京のひとりで営む同人・インディー系パブリッシャーだ。すでに英語に、日本語・簡体字中国語・繁体字中国語と並んで対応しているが、83件のうち英語レビューは25件(約30%、うち24件は好評)にとどまり、韓国語や欧州言語には一切対応していない——Steam の英語圏は、絶対数ではこの一本をまだほとんど見つけておらず、その受け手はいまも大半が日本語圏だ。",
      },
      {
        name_en: "Castlevania",
        name_ja: "悪魔城ドラキュラ",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Castlevania_(1986_video_game)",
        wikidata: "https://www.wikidata.org/wiki/Q1043375",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: Castlevania, developed and published by Konami, first released for the Family Computer Disk System in Japan in 1986. As the vampire hunter Simon Belmont advancing through Dracula's castle with a whip and an arsenal of sub-weapons, you climb a gothic gauntlet of stages and classic monster bosses, a template that defined a whole strain of gothic action; and as the series evolved and fused that gothic action with a single interconnected, ability-gated castle to explore, it gave the later genre name Metroidvania its vania half. Witchroid Vania wears that lineage in its very name (Witch + [Met]roid + [Castle]vania): a gothic-flavored Metroidvania whose castle-like world opens up as you gain new powers. But it hands the hunt to a magical girl, Lily, swaps movement-gated progress for magic-and-tool gates, and layers on a four-set elemental spell-loadout system, RPG growth, and a companion mini-dragon, making it its own creature rather than a copy. There is no official standalone Steam release of the original 1986 game, so its origin is anchored to its Wikidata entry.",
        desc_ja: "この味の原点。悪魔城ドラキュラ(英題 Castlevania)は、コナミが開発・販売したアクションゲームで、1986年に日本でファミリーコンピュータ ディスクシステム向けに発売された。プレイヤーはヴァンパイアハンター、シモン・ベルモンドとなり、鞭とさまざまなサブウェポンを手に、ドラキュラの城を突き進む——定番の怪物ボスに挑みながらステージを一つずつ登っていく、ゴシックアクションの一大潮流を築いた型だ。そしてシリーズが進化し、そのゴシックアクションを、能力でゲートされたひと続きの城の探索と融合させたことで、のちの『メトロイドヴァニア』というジャンル名の『ヴァニア』の側が生まれた。ウィッチロイドヴァニアは、その系譜をタイトルそのものに宿している(Witch + [Met]roid + [Castle]vania)——力を得るにつれて城のような世界が開かれていく、ゴシックな味わいのメトロイドヴァニアだ。だがその狩りを魔法少女リリィに手渡し、移動能力によるゲートを魔法と道具のゲートに置き換え、4セットの属性魔法ロードアウト、RPG的な成長、相棒のミニドラゴンを重ねることで、模倣ではない独自の一作に仕立てている。1986年の原作に単独の公式 Steam 版は存在しないため、その原点は Wikidata のエントリで同定する。",
      },
    ],
    en: {
      title: "Witchroid Vania - a gothic 2D Metroidvania where a magical girl learns fire, ice, wind, and thunder across four swappable loadout sets and opens the map with magic and tools instead of movement, a Japanese solo-made heir to Castlevania the Steam West has barely found",
      description: "A 2D Metroidvania starring the magical girl Lily, by Turkey Games, the Japanese solo developer Turkey, published by the one-person doujin label Waku Waku Games. Lily learns fire, ice, wind, and thunder in three tiers each and equips three spells at once across four loadout sets she flips between mid-fight, so combat is about composing a kit. Unlike most Metroidvanias, the map opens through the magic and tools you gain rather than movement abilities, with RPG growth and a companion mini-dragon. Very Positive at 92 percent over 83 reviews; it supports English, yet with only about 30 percent English reviews the Steam West has barely found it.",
      h1a: "The wall won't open for a dash or a double jump. ",
      h1flip: "It opens for the spell you just learned",
      h1b: ".",
      lede: "A 2D Metroidvania starring the magical girl Lily, made by Turkey Games, the work of the Japanese solo developer Turkey, and published by the one-person Tokyo doujin label Waku Waku Games. Lily learns elemental magic of fire, ice, wind, and thunder, each in three escalating tiers, and equips three spells at once across four loadout sets she can flip between mid-fight, so combat is about composing a kit rather than repeating one attack. What sets it apart from most Metroidvanias is its gate structure: the map opens not through movement abilities like a double jump or a dash, but through the magic and tools you gain. Equipment and levels give it RPG growth, and a companion mini-dragon fights alongside you and helps you move. The praised heart of it is exhilarating combat. In the lineage of Castlevania. It already supports English, yet the Steam English-speaking world has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "Combat is built around composing magic, not repeating one attack. Lily learns fire, ice, wind, and thunder, each in three escalating tiers, and carries three spells at once across four loadout sets she can flip between in the middle of a fight, so a single encounter becomes a running decision about which set answers what is in front of you, and the exhilaration reviewers single out comes from swapping the right magic in on the right beat.",
        "The map does not open the usual Metroidvania way. Instead of a double jump or a dash unlocking new ground, it is the magic and tools you gain that widen the world, so every new spell is also a key, and the moment a barrier that has blocked you for an hour finally answers to a power you just earned is the moment the castle grows.",
        "Underneath runs RPG-style growth through equipment and levels, and a companion mini-dragon that both fights beside you and helps you move, so progress is not only about opening gates but about a build that keeps getting stronger and a partner threaded through every battle and every traversal, tying the exploration and the combat into one climbing loop.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Castlevania and gothic Metroidvanias, the castle-like world that opens as your powers grow, here handed to a magical girl and rebuilt around elemental magic instead of a whip",
        "You want combat you compose: fire, ice, wind, and thunder in three tiers each, three spells equipped at once across four loadout sets you flip between mid-fight, with RPG growth and a companion mini-dragon, all pointed at the exhilarating battles reviewers single out",
        "You want a Japanese solo-made gem the Steam West has barely found, Very Positive at 92 percent over 83 reviews, already supporting English, the work of one developer under Turkey Games and the one-person doujin label Waku Waku Games",
      ],
      bad: [
        "You want progression gated by movement skills, the classic double jump or dash that opens the map; here the gates are magic and tools instead, so the exploration is keyed to your spell and item list rather than to new ways of moving",
        "You expect a big-studio, already-popular Western title or a fully proven hit; this is a paid solo doujin work (developer Turkey Games and publisher Waku Waku Games are each one-person operations), not free and not in Early Access, and with only about 30 percent of its 83 reviews in English and no Korean or European languages, it is still a small gem the West has barely reached in absolute numbers",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ウィッチロイドヴァニア 〜魔法少女の不思議な冒険〜 - 魔法少女が火・氷・風・雷を4つの切替セットで操り、移動能力ではなく魔法と道具でマップを開く、ゴシックな2Dメトロイドヴァニア。悪魔城ドラキュラの系譜、Steam の西がまだ見つけていない、日本の個人制作の一本",
      description: "魔法少女リリィが主役の2Dメトロイドヴァニア。開発元は日本の個人開発者 Turkey による Turkey Games、販売元はひとりで営む同人レーベルわくわくゲームズ。リリィは火・氷・風・雷の魔法を各3段階で習得し、3つ同時装備を4セット、戦いの最中に切り替える——戦闘は魔法を「組む」ゲームだ。多くのメトロイドヴァニアと違い、マップは移動能力ではなく、手に入れた魔法や道具で開いていく。装備とレベルのRPG成長、相棒のミニドラゴン。83レビュー92%で非常に好評。英語に対応済みだが、英語レビューは約30%——Steam の西は、この一本をまだほとんど見つけていない。",
      h1a: "壁は、ダッシュや二段ジャンプでは開かない。",
      h1flip: "開くのは、いま覚えたばかりの魔法だ",
      h1b: "。",
      lede: "魔法少女リリィが主役の2Dメトロイドヴァニア。開発元は Turkey Games——日本の個人開発者 Turkey が(サントラ以外はひとりで)手がけた一本で、販売元は東京の、ひとりで営む同人レーベルわくわくゲームズだ。リリィは火・氷・風・雷の属性魔法を、それぞれ3段階で習得し、3つを同時に装備した状態を4つのセットとして持ち、戦いの最中に切り替える——だから戦闘は、一つの攻撃を繰り返すのではなく、魔法を「組む」遊びになる。多くのメトロイドヴァニアと一線を画すのは、そのゲート構造だ。マップは、二段ジャンプやダッシュのような移動能力ではなく、手に入れた魔法や道具で開いていく。装備とレベルによるRPG的な成長があり、相棒のミニドラゴンが戦いに寄り添い、移動も助けてくれる。核にあるのは、爽快なバトルだ。悪魔城ドラキュラの系譜に連なる一本。英語に対応済みだが、Steam の英語圏は、この一本をまだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "戦闘は、一つの攻撃を繰り返すのではなく、魔法を「組む」ことを軸に作られている。リリィは火・氷・風・雷の魔法を、それぞれ3段階で習得し、3つを同時に装備した状態を4つのセットとして持ち、戦いの最中に切り替える。だから一度の戦闘が、目の前の敵にどのセットで応えるかを走りながら選び続ける行為になる——レビューが口をそろえて挙げる爽快感は、正しい魔法を正しい拍で差し込む、その手応えから生まれている。",
        "マップは、ふつうのメトロイドヴァニアのようには開かない。二段ジャンプやダッシュが新たな足場を解放するのではなく、手に入れた魔法や道具が世界を広げていく。だから新しい魔法は、そのまま鍵でもある。一時間も行く手を塞いでいた壁が、いま覚えたばかりの力にようやく応える——その瞬間こそ、城が広がる瞬間だ。",
        "その下には、装備とレベルによるRPG的な成長が流れ、戦いに寄り添い、移動も助けてくれる相棒のミニドラゴンがいる。だから進行は、ゲートを開くことだけではない——強くなり続けるビルドと、あらゆる戦闘と道中に織り込まれた相棒によって、探索と戦闘が一つの登っていくループに結ばれている。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "悪魔城ドラキュラや、ゴシックなメトロイドヴァニアが好きな人——力の成長とともに開かれていく、城のような世界。本作ではそれを魔法少女に手渡し、鞭ではなく属性魔法を軸に組み直している",
        "自分で組み立てる戦闘が欲しい人——火・氷・風・雷を各3段階、3つ同時装備を4セット、戦いの最中に切り替え、装備とレベルのRPG成長と、相棒のミニドラゴン。その全てが、レビューの挙げる爽快なバトルに向いている",
        "Steam の西がまだほとんど見つけていない、日本の個人制作の原石が欲しい人——83レビュー92%で非常に好評、英語に対応済み、開発元 Turkey Games と、ひとりで営む同人レーベルわくわくゲームズによる一本",
      ],
      bad: [
        "移動スキルで進行がゲートされるのを望む人(二段ジャンプやダッシュでマップが開く、あの古典的な設計)。本作ではその代わりに魔法と道具がゲートになる——だから探索は、新しい移動手段ではなく、手持ちの魔法とアイテムに紐づいている",
        "大手スタジオの、すでに西で人気の大作や、完全に実績のあるヒット作を期待する人(本作は有料の個人同人作で——開発元 Turkey Games も販売元わくわくゲームズも、それぞれひとりの営みだ——無料でもアーリーアクセスでもない。83レビューのうち英語は約30%にとどまり、韓国語や欧州言語には非対応で、西へは絶対数でまだほとんど届いていない)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "moonless-moon": {
    published: "2026-07-02",
    kind: "find",
    leadIndex: 0,
    // reviewBand "hundreds"(314=数百)を持たせる。rarity.reviews=314 が確定値で stamp を埋める。英語対応済みで
    //   noEnglish=false のため lang_walled は使わない(誤って「英語非対応」stamp を立てない・正直さ)。英語レビュー
    //   34/314=10.8% は西未浸透が強い = reachState="unreached_west"。obscurity は "wall"(高評価だが西へ未到達=
    //   壁の向こう)。stamp は positivePct+reviews で埋まるため "西ではまだ無名" fallback は発火しない(状態の正直な
    //   記録として reachState を付す)。系譜は銀河鉄道の夜(宮沢賢治 1934・Wikidata Q1524969)。
    meta: { genre: "riddle-adventure", lineage: "night-on-the-galactic-railroad", obscurity: "wall", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 314, positivePct: 92, noEnglish: false } },
    games: [
      {
        name_en: "Moonless Moon",
        name_ja: "ムーンレスムーン",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2951340/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A text adventure that runs like a playable music video, the first work of the ANMC (Anomachi) project, which makes music and indie games from the stories and worldview of the Japanese writer Kazuhide Oka. It is developed by Kazuhide Oka and published by KAMITSUBAKI STUDIO, a Tokyo music studio, together with yokaze. The main story is told through entirely original songs and animated music videos, so you do not just read the scenes, you ride through them, drifting across dreamlike, shifting worlds, a moon desert, a cafe inside a tunnel, an island floating in the sky. Between those sung passages comes a RIDDLE part, where you search each world for keywords and place them to solve the puzzle that opens the way forward, and the journey branches toward multiple endings, a poetic night pilgrimage you can walk again for a different close. Released in August 2024, it is Very Positive at 92 percent over 314 reviews, a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. It already supports Japanese, English, and Simplified and Traditional Chinese, yet only 34 of its 314 reviews are in English (about 10.8 percent); a Chinese localization exists, but the West's actual player base has barely arrived, with KAMITSUBAKI known within music and virtual-singer circles yet essentially unknown among gamers, so on Steam this is still a gem the West has hardly found.",
        desc_ja: "「プレイできるミュージックビデオ」のようなテキストアドベンチャー。日本の作家 Kazuhide Oka の物語と世界観をもとに、音楽とインディーゲームを制作するプロジェクト ANMC（アノマチ）の第1作だ。開発は Kazuhide Oka、販売は東京の音楽スタジオ・神椿スタジオ（KAMITSUBAKI STUDIO）と yokaze。本編は全編オリジナル楽曲とアニメーションMVで語られ、あなたは場面をただ読むのではなく、その中を「くぐって」進んでいく——月の砂漠、トンネルの中の喫茶店、空に浮かぶ島。夢のように移ろう世界を巡る。歌のパートの合間には「RIDDLEパート」がある。世界の中からキーワードを探し出し、当てはめて、行く手を開く謎を解く。旅は複数のエンディングへと分岐し、別の結末へ、もう一度歩き直せる、詩的な夜の巡礼だ。2024年8月リリース、314レビュー92%で非常に好評。無料ではない有料作で、アーリーアクセスでもない正式リリース済み。AI生成アセットはなく、Steam 自身のコンテンツディスクリプタ上、性的な要素もない。日本語・英語・簡体字／繁体字中国語に対応しているが、314件のうち英語レビューは34件（約10.8%）にとどまる。中国語ローカライズはあるものの、西側の実プレイ層はまだほとんど到達していない——神椿の知名度は音楽やバーチャルシンガーの圏内に限られ、ゲーム層ではほぼ無名だからだ。Steam では、これはまだ西がほとんど見つけていない原石である。",
      },
      {
        name_en: "Night on the Galactic Railroad",
        name_ja: "銀河鉄道の夜",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Night_on_the_Galactic_Railroad",
        wikidata: "https://www.wikidata.org/wiki/Q1524969",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: Night on the Galactic Railroad, a novel by the Japanese author and poet Kenji Miyazawa, left unfinished at his death and published posthumously in 1934. A lonely boy, Giovanni, boards a mysterious train that runs through the night sky along the Milky Way and travels with his friend Campanella past strange, dreamlike stations and landscapes, while the journey turns quietly toward death, sacrifice, and the search for true happiness. That core, a poetic night voyage through unreal, shifting worlds that becomes a meditation on life and death, is the root Moonless Moon grows from, carrying it into a playable music video whose original songs and animated MVs drift through a moon desert, a cafe inside a tunnel, and an island in the sky. There is no game version of the 1934 novel, so its origin is anchored to its Wikidata entry.",
        desc_ja: "この味の原点——銀河鉄道の夜。日本の作家・詩人、宮沢賢治の小説で、賢治の没後、未完のまま遺され、1934年に発表された。孤独な少年ジョバンニが、天の川に沿って夜空を走る不思議な列車に乗り込み、友人のカムパネルラとともに、夢のように移り変わる駅や風景を巡っていく——その旅は、やがて静かに、死や、自己犠牲や、「ほんとうの幸い」とは何かという問いへと向かっていく。星空の下、非現実的に移ろう世界を巡る旅が、そのまま生と死をめぐる瞑想になる——この詩的な「夜の旅」の核こそ、ムーンレスムーンが育つ根だ。本作はそれを、オリジナル楽曲とアニメーションMVが、月の砂漠、トンネルの中の喫茶店、空に浮かぶ島を巡る「プレイできるミュージックビデオ」へと運んでいる。1934年の小説にゲーム版は存在しないため、その原点は Wikidata のエントリで同定する。",
      },
    ],
    en: {
      title: "Moonless Moon - a text adventure that plays like a music video, riding original songs and animated MVs through a moon desert, a cafe inside a tunnel, and an island in the sky, solving riddles by finding and placing keywords, a poetic heir to Night on the Galactic Railroad the West has barely found",
      description: "A text adventure that runs like a playable music video, the first work of the ANMC project from the Japanese writer Kazuhide Oka, published by the Tokyo music studio KAMITSUBAKI STUDIO with yokaze. The story unfolds through entirely original songs and animated MVs across dreamlike, shifting worlds, a moon desert, a cafe inside a tunnel, an island floating in the sky, with a RIDDLE part where you find and place keywords to open the way, branching toward multiple endings. In the lineage of Night on the Galactic Railroad. Very Positive at 92 percent over 314 reviews; it supports English, yet with only about 10.8 percent of its reviews in English the West has barely found it.",
      h1a: "It is not a game with music playing over it. ",
      h1flip: "It is a music video you play through, riddle by riddle, world by dreamlike world",
      h1b: ".",
      lede: "A text adventure that runs like a playable music video, the first work of the ANMC (Anomachi) project, which makes music and indie games from the stories and worldview of the Japanese writer Kazuhide Oka, developed by Oka and published by the Tokyo music studio KAMITSUBAKI STUDIO with yokaze. The main story is told through entirely original songs and animated music videos, so you do not just read the scenes, you ride through them, drifting across dreamlike, shifting worlds, a moon desert, a cafe inside a tunnel, an island floating in the sky. Between those sung passages comes a RIDDLE part, where you search each world for keywords and place them to solve the puzzle that opens the way, and the journey branches toward multiple endings. In the lineage of Night on the Galactic Railroad. It already supports English, yet the West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "The whole thing is built as a playable music video. The story moves through entirely original songs and animated MVs, so a scene is something you ride rather than something you read, and the pull is the sensation of being inside the video, carried by the music through a night that keeps opening into stranger, dreamlike worlds, a moon desert, a cafe inside a tunnel, an island floating in the sky.",
        "It does not leave you a passive viewer. Between the sung passages comes a RIDDLE part, where you have to read the poem-world closely enough to find its hidden keywords and place them to unlock the way forward, so advancing the night becomes an act of attention: the song sets the mood, and the riddle asks whether you actually understood what you just drifted through.",
        "It is a journey you can walk more than once. The route branches across unreal, shifting worlds toward multiple endings, so the same poetic night reads differently depending on where it closes, and the feeling it reaches for is the one at the heart of Night on the Galactic Railroad, a dreamlike nocturnal voyage through otherworldly places that turns, quietly, toward the questions at the edge of living.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You want a poetic night journey rather than a system to master, a playable music video of entirely original songs and animated MVs drifting through dreamlike worlds, a moon desert, a cafe inside a tunnel, an island in the sky, in the lineage of Night on the Galactic Railroad",
        "You want that ride to ask something of you: a RIDDLE part where you find and place hidden keywords to open the way, branching across worlds toward multiple endings that reward a second and third pass",
        "You want a Japanese indie gem the West has barely found, Very Positive at 92 percent over 314 reviews and already supporting English, the first work of the ANMC project by the writer Kazuhide Oka, published by the Tokyo music studio KAMITSUBAKI STUDIO with yokaze",
      ],
      bad: [
        "You want long, mechanically deep gameplay or a large branching RPG; this is a short, story-and-music-first text adventure carried by its original songs and its keyword riddles rather than by systems, a paid title, not free and not in Early Access",
        "You expect a big-studio, already-popular Western hit; its maker is known mainly in music and virtual-singer circles rather than among gamers, and with only about 10.8 percent of its 314 reviews in English and a Chinese localization but little Western play, it is still largely a Japanese-speaking audience the West has barely reached (no AI-generated assets, and Steam flags no sexual content)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ムーンレスムーン - プレイできるミュージックビデオのようなテキストアドベンチャー。全編オリジナル楽曲とアニメーションMVで、月の砂漠、トンネルの中の喫茶店、空に浮かぶ島——夢のような世界を巡り、キーワードを探して当てはめる謎解きで夜を進める。銀河鉄道の夜の系譜、西がまだ見つけていない、日本のインディーの一本",
      description: "「プレイできるミュージックビデオ」のようなテキストアドベンチャー。日本の作家 Kazuhide Oka の物語と世界観をもとに音楽とインディーゲームを作るプロジェクト ANMC（アノマチ）の第1作で、販売は東京の音楽スタジオ・神椿スタジオ（KAMITSUBAKI STUDIO）と yokaze。本編は全編オリジナル楽曲とアニメーションMVで進み、月の砂漠、トンネルの中の喫茶店、空に浮かぶ島——夢のように移ろう世界を巡る。歌の合間には「RIDDLEパート」があり、キーワードを探して当てはめ、行く手を開く謎を解く。旅は複数のエンディングへ分岐する。銀河鉄道の夜の系譜。英語に対応済みだが、314件中の英語レビューは約10.8%——西はこの一本を、まだほとんど見つけていない。",
      h1a: "音楽が添えられた、ただのゲームではない。",
      h1flip: "謎を解きながら世界から世界へくぐり抜ける、プレイできるミュージックビデオだ",
      h1b: "。",
      lede: "「プレイできるミュージックビデオ」のようなテキストアドベンチャー。日本の作家 Kazuhide Oka の物語と世界観をもとに、音楽とインディーゲームを制作するプロジェクト ANMC（アノマチ）の第1作で、開発は Oka、販売は東京の音楽スタジオ・神椿スタジオ（KAMITSUBAKI STUDIO）と yokaze だ。本編は全編オリジナル楽曲とアニメーションMVで語られ、あなたは場面をただ読むのではなく、その中を「くぐって」進んでいく——月の砂漠、トンネルの中の喫茶店、空に浮かぶ島。夢のように移ろう世界を巡る。歌のパートの合間には「RIDDLEパート」があり、世界の中からキーワードを探し出して当てはめ、行く手を開く謎を解く。旅は複数のエンディングへと分岐する。銀河鉄道の夜の系譜に連なる一本。英語に対応済みだが、西はこの一本を、まだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "すべては「プレイできるミュージックビデオ」として作られている。物語は全編オリジナル楽曲とアニメーションMVで進むから、場面は読むものではなく、くぐり抜けるものになる。引力は、映像の「中」にいる感覚だ——音楽に運ばれ、夜がより奇妙で、夢のような世界へと次々に開いていく。月の砂漠、トンネルの中の喫茶店、空に浮かぶ島へと。",
        "本作は、あなたを受け身の観客のままにはしない。歌のパートの合間には「RIDDLEパート」があり、その詩のような世界を、隠されたキーワードを見つけられるほど深く読み解き、当てはめて、行く手を開かなければならない。だから夜を進めることは、注意を向ける行為そのものになる——歌が空気をつくり、謎が、いま漂い抜けてきたものを本当に理解できたかを問う。",
        "これは、一度きりでは終わらない旅だ。道は非現実的に移ろう世界を巡り、複数のエンディングへと分岐する。だから同じ詩的な夜も、どこで閉じるかによって別の顔を見せる。そして本作がたどり着こうとする感覚は、銀河鉄道の夜の核にあるものと同じだ——星空の下、異世界のような場所を巡る夢のような夜の旅が、静かに、生の際にある問いへと向かっていく。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "習熟すべきシステムよりも、詩的な夜の旅が欲しい人——全編オリジナル楽曲とアニメーションMVで、月の砂漠、トンネルの中の喫茶店、空に浮かぶ島と、夢のような世界を巡る「プレイできるミュージックビデオ」。銀河鉄道の夜の系譜に連なる一本",
        "その旅が、こちらに何かを求めてくることを望む人——隠されたキーワードを探して当てはめ、行く手を開く「RIDDLEパート」があり、世界をまたいで複数のエンディングへ分岐し、二度目・三度目の周回に応える",
        "西側がまだほとんど見つけていない、日本のインディーの原石が欲しい人——314レビュー92%で非常に好評、英語に対応済み、作家 Kazuhide Oka の物語をもとにしたプロジェクト ANMC の第1作で、販売は東京の音楽スタジオ・神椿スタジオ（KAMITSUBAKI STUDIO）と yokaze",
      ],
      bad: [
        "長く、メカニクスの奥深いゲームプレイや、大きな分岐のRPGが欲しい人（本作は短く、物語と音楽を優先したテキストアドベンチャーで、システムよりもオリジナル楽曲とキーワードの謎解きが支える有料作だ——無料でもアーリーアクセスでもない）",
        "大手スタジオの、すでに西で人気のヒット作を期待する人（作り手の知名度は音楽やバーチャルシンガーの圏内が中心で、ゲーム層ではほぼ無名だ。314レビューのうち英語は約10.8%にとどまり、中国語ローカライズはあっても西側での実プレイはわずか——受け手はいまも大半が日本語圏で、西はこの一本にほとんど届いていない。AI生成アセットはなく、Steam は性的な内容を示していない）",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "motionrec": {
    published: "2026-07-02",
    kind: "find",
    leadIndex: 0,
    // 【正直さ・西到達の誇張禁止】本作は英語レビュー 158/407=約39% と高く、PLAYISM(Active Gaming Media)
    //   経由で西側のストア/メディアに流通・報道あり = 西到達がやや進行している。ゆえに rarity(希少性スタンプ)は
    //   持たせない: rarity を持たせると PickPage が無条件で「— なのに、ほとんど誰も見つけていない」を後置し、
    //   これは偽りの未発見主張になる(west_unreached=部分的にのみ未到達)。好評率99%(406/407,否定1)・407件・
    //   英39% は本文(散文)で正直に述べる。obscurity も "deep"(西で無名)/"wall"(壁の向こう)は共に西未到達を
    //   含意し誇張になるため none(埋もれ過ぎ facet に載せない=正直)。reachState も unreached_west/lang_walled
    //   のいずれも当たらない(英語対応・西流通)ため持たせない。系譜は The Misadventures of P.B. Winterbottom
    //   (2010, The Odd Gentlemen/2K, Steam app 40930・自分を録画→再生して過去の自分と協調するパズルの原点)。
    meta: { genre: "puzzle-platformer", lineage: "pb-winterbottom", obscurity: "none" },
    games: [
      {
        name_en: "MotionRec",
        name_ja: "MotionRec",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2602230/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A recording-based puzzle-action platformer by the Japanese studio HANDSUM, published by PLAYISM (Active Gaming Media). You play Rec, a robot that records civilization across a devastated world, and its one ability is the whole game: Rec records the trajectory of its own motion, walking, jumping, riding stage gimmicks, and then replays that recording somewhere else as a ghost, a double of a few seconds of its own past. That replayed self becomes a solid, moving platform: it walks the path you recorded, lifts you, and carries you, so you cooperate with your own past motion to reach a ledge you could never touch alone or cross a gap with no floor at all. Solving a room means authoring the recording, planning and performing the movement so that its playback lands you where you need to be, and layering ghost upon ghost until your own past selves are the staircase forward. Released in October 2025, it is Very Positive with 99 percent of its reviews positive (406 of 407, a single negative), a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. And it is only honest to say the West is already arriving: it ships in sixteen languages including English, PLAYISM carries it to Western storefronts and press, and 158 of its 407 reviews (about 39 percent) are in English. This is not a gem no one has found; it is a Japan-born gem the West is only now reaching.",
        desc_ja: "録画を核にしたパズルアクション・プラットフォーマー。開発は日本のスタジオ HANDSUM、販売は PLAYISM（Active Gaming Media）。プレイヤーは、荒廃した世界で文明を記録するロボット Rec を操る。その唯一の能力が、ゲームのすべてだ——Rec は自分の動き（歩行、ジャンプ、ステージギミックとの連携）の軌跡を録画し、それを別の場所で「幽霊」＝数秒前の自分の分身として再生する。再生されたその自分は、動く固い足場になる。録画したとおりの道を歩き、あなたを持ち上げ、運んでいく。だからあなたは、自分の過去の動きと協力して、単独では決して届かない高台に上り、床のない裂け目を越えていく。部屋を解くとは、その録画を「作る」ことだ——再生した動きがちょうど目的地へ運んでくれるように、動きを計画し、演じる。そして幽霊の上に幽霊を重ね、過去の自分たちを、前へ進むための階段にしていく。2025年10月リリース、レビューの99%が好評（407件中406件、否定はわずか1件）で非常に好評。無料ではない有料作で、アーリーアクセスでもない正式リリース済み。AI生成アセットはなく、Steam 自身のコンテンツディスクリプタ上、性的な要素もない。そして正直に言えば、西側はすでに届きつつある——英語を含む16言語に対応し、PLAYISM が西側のストアとメディアへ運び、407件のレビューのうち158件（約39%）が英語だ。これは「誰も見つけていない原石」ではない。西側がいままさに手を伸ばしている、日本発の原石である。",
      },
      {
        name_en: "The Misadventures of P.B. Winterbottom",
        name_ja: "The Misadventures of P.B. Winterbottom",
        status: "established",
        steam: "https://store.steampowered.com/app/40930/The_Misadventures_of_PB_Winterbottom/",
        wikidata: "https://www.wikidata.org/wiki/Q2087449",
        tag_en: "The record-and-replay origin",
        tag_ja: "録画と再生の原点",
        desc_en: "The origin of this taste: The Misadventures of P.B. Winterbottom, developed by The Odd Gentlemen and published by 2K, released in April 2010. In a macabre, silent, hand-drawn world in pursuit of a mysterious pie, Winterbottom records himself and then plays those recordings back so that his past selves act alongside him, and you cooperate with, compete against, and get in the way of your own recorded clones to solve over eighty puzzles. That core, record your own motion and replay it so a copy of your past self becomes the partner you build the solution from, is the root MotionRec grows from, carrying the same record-and-playback cooperation into a platformer where the replayed self is a moving platform across a devastated world. Its origin is anchored to its Steam release.",
        desc_ja: "この味の原点——The Misadventures of P.B. Winterbottom。The Odd Gentlemen が開発し、2K が販売した作品で、2010年4月に発売された。不気味で無音の、手描きの世界。謎めいたパイを追い求めるなかで、ウィンターボトムは自分自身を録画し、その録画を再生して、過去の自分たちを自分のかたわらで動かす。プレイヤーは、録画された自分のクローンと協力し、競い合い、ときに邪魔をしながら、80を超えるパズルを解いていく。「自分の動きを録画し、再生して、過去の自分のコピーを、解答を組み立てるための相棒にする」——この核こそ、MotionRec が育つ根だ。本作は同じ録画と再生の協調を、再生した自分が動く足場になるプラットフォーマーへと、荒廃した世界を舞台に運んでいる。その原点は、Steam ページで同定する。",
      },
    ],
    en: {
      title: "MotionRec - a recording-based puzzle-action platformer where you record your own motion and replay it as a ghost that becomes a moving platform, cooperating with your past selves to reach places you never could alone, a Japan-born heir to The Misadventures of P.B. Winterbottom the West is only now reaching",
      description: "A recording-based puzzle-action platformer by the Japanese studio HANDSUM, published by PLAYISM. You play Rec, a civilization-recording robot whose one ability is the whole game: record the trajectory of your own motion, walking, jumping, riding gimmicks, then replay it elsewhere as a ghost that becomes a solid, moving platform. You cooperate with your own past self to reach ledges and cross floorless gaps you never could alone, layering ghost on ghost into a staircase of your past selves. In the lineage of The Misadventures of P.B. Winterbottom. Very Positive with 99 percent of 407 reviews positive; it supports English and, honestly, the West is already arriving, so this is a Japan-born gem the West is only now reaching, not one no one has found.",
      h1a: "It is not a game you solve alone. ",
      h1flip: "You record your own motion, replay it as a ghost, and stand on your past self to climb",
      h1b: ".",
      lede: "A recording-based puzzle-action platformer by the Japanese studio HANDSUM, published by PLAYISM (Active Gaming Media). You play Rec, a robot that records civilization across a devastated world, and its one ability is the whole game: Rec records the trajectory of its own motion, walking, jumping, riding stage gimmicks, and replays it somewhere else as a ghost, a double of a few seconds of its own past, that becomes a solid, moving platform. You cooperate with your own past motion to reach a ledge you could never touch alone or cross a gap with no floor at all, layering ghost upon ghost until your past selves are the staircase forward. In the lineage of The Misadventures of P.B. Winterbottom. It supports English and, honestly, the West is already arriving, so this is a Japan-born gem the West is only now reaching.",
      s1: "First, the one feeling",
      feeling: [
        "The whole game is one ability turned into a partner. Rec records the exact trajectory of its own motion, every step, jump, and gimmick it rides, and then replays that recording somewhere else as a ghost, so the pull is watching a few seconds of your own past come to life beside you and do precisely what you did, on cue, as a second body you now get to build on.",
        "That replayed self is not decoration, it is solid ground. The ghost becomes a moving platform that walks the path you recorded and lifts and carries you, so reaching a ledge with no way up, or crossing a gap with no floor at all, becomes a problem of authorship: you plan and perform the recording so that its playback arrives exactly where and when you will need to stand on it.",
        "Then it compounds. You layer ghost upon ghost, a past self standing on an earlier past self, until you have choreographed a whole staircase out of your own recorded motion, and the click of the puzzle is the moment you realize the only thing that could carry you across was a better-planned version of what you already did.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love a single mechanic taken all the way, record your own motion and replay it as a ghost, and want that ghost to become a moving platform you cooperate with, in the lineage of The Misadventures of P.B. Winterbottom",
        "You want puzzles that are about authorship and timing rather than reflexes, planning and performing a recording so its playback lands you where you need to be, then layering self on self into a staircase forward",
        "You want a Japan-born gem in beautiful shape, a HANDSUM game published by PLAYISM, Very Positive with 99 percent of 407 reviews positive, that the West is only now reaching rather than one already worn out",
      ],
      bad: [
        "You want a long, sprawling action game or twitch-heavy combat; this is a focused, record-and-playback puzzle-action platformer built around one idea, a paid title, not free and not in Early Access, with no AI-generated assets and no sexual content by Steam's descriptors",
        "You specifically want something the West has never heard of; be honest here, this one is already arriving, it ships in sixteen languages, PLAYISM carries it to Western stores and press, and about 39 percent of its 407 reviews are in English, so it is a Japan-born gem the West is reaching, not one still hidden from it",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "MotionRec - 自分の動きを録画し、幽霊として再生して「動く足場」にする、録画パズルアクション・プラットフォーマー。過去の自分と協力して、単独では決して届かない場所へ。The Misadventures of P.B. Winterbottom の系譜、西側がいままさに手を伸ばしている、日本発の一本",
      description: "録画を核にしたパズルアクション・プラットフォーマー。開発は日本のスタジオ HANDSUM、販売は PLAYISM。プレイヤーは文明を記録するロボット Rec を操り、その唯一の能力がゲームのすべてだ——自分の動き（歩行・ジャンプ・ギミック連携）の軌跡を録画し、別の場所で「幽霊」として再生する。再生された自分は動く固い足場になり、過去の自分と協力して、単独では届かない高台に上り、床のない裂け目を越える。幽霊の上に幽霊を重ね、過去の自分たちを前へ進む階段にしていく。The Misadventures of P.B. Winterbottom の系譜。407件のレビューの99%が好評で非常に好評。英語に対応し、正直に言えば西側はすでに届きつつある——これは誰も見つけていない一本ではなく、西側がいままさに手を伸ばしている、日本発の原石だ。",
      h1a: "ひとりで解くゲームではない。",
      h1flip: "自分の動きを録画し、幽霊として再生して、過去の自分の上に立って登っていく",
      h1b: "。",
      lede: "録画を核にしたパズルアクション・プラットフォーマー。開発は日本のスタジオ HANDSUM、販売は PLAYISM（Active Gaming Media）。プレイヤーは、荒廃した世界で文明を記録するロボット Rec を操る。その唯一の能力が、ゲームのすべてだ——Rec は自分の動き（歩行、ジャンプ、ステージギミックとの連携）の軌跡を録画し、それを別の場所で「幽霊」＝数秒前の自分の分身として再生する。再生されたその自分は、動く固い足場になる。あなたは自分の過去の動きと協力して、単独では決して届かない高台に上り、床のない裂け目を越えていく——幽霊の上に幽霊を重ね、過去の自分たちを、前へ進むための階段にしながら。The Misadventures of P.B. Winterbottom の系譜に連なる一本。英語に対応し、正直に言えば西側はすでに届きつつある——これは、西側がいままさに手を伸ばしている、日本発の原石だ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ゲームのすべては、たった一つの能力を「相棒」に変えることにある。Rec は自分の動き——一歩ごと、跳躍、乗り込んだギミックのすべて——の軌跡を正確に録画し、それを別の場所で「幽霊」として再生する。だから引力は、数秒前の自分の過去が、かたわらで命を持ち、合図どおりに、自分がやったとおりを再現するのを見つめる感覚だ。それは、いまから組み上げていける、もう一つの身体になる。",
        "再生されたその自分は、飾りではない——固い地面だ。幽霊は録画したとおりの道を歩き、あなたを持ち上げ、運ぶ「動く足場」になる。だから、上る術のない高台や、床のない裂け目を越えることは、「作る」ことの問題になる。再生した動きが、あなたが立つべき場所へ、立つべき瞬間にちょうど届くように、録画を計画し、演じるのだ。",
        "そして、それは積み重なっていく。幽霊の上に幽霊を——過去の自分を、さらに前の過去の自分の上に——重ね、自分の録画した動きだけで、一つの階段を振り付けていく。パズルがカチッとはまる瞬間は、こう気づく瞬間だ——ここを越えられる唯一の方法は、すでに自分がやったことの、もっとよく計画された一つの版だったのだ、と。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "たった一つのメカニクスを最後まで突き詰めたものが好きな人——自分の動きを録画し、幽霊として再生し、その幽霊が協力できる「動く足場」になる。The Misadventures of P.B. Winterbottom の系譜に連なる一本",
        "反射神経よりも、「作る」ことと「間（タイミング）」のパズルが欲しい人——再生した動きが立つべき場所へ届くように録画を計画し、演じ、そして自分の上に自分を重ねて、前へ進む階段にしていく",
        "きれいな状態の、日本発の原石が欲しい人——HANDSUM が開発し PLAYISM が販売、407件のレビューの99%が好評で非常に好評。すでに擦り切れた一本ではなく、西側がいままさに手を伸ばしている一本",
      ],
      bad: [
        "長く広大なアクションや、反射神経勝負の戦闘が欲しい人（本作は、たった一つのアイデアを軸にした、録画と再生のパズルアクション・プラットフォーマーだ。無料でもアーリーアクセスでもない有料作で、AI生成アセットはなく、Steam のディスクリプタ上、性的な要素もない）",
        "「西側が一度も聞いたことのないもの」を、あえて求める人（ここは正直に言おう——この一本はすでに届きつつある。英語を含む16言語に対応し、PLAYISM が西側のストアとメディアへ運び、407件のレビューのうち約39%が英語だ。これは、まだ西側から隠れている一本ではなく、西側がいままさに手を伸ばしている、日本発の原石である）",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "sunset-game-shop-shayou": {
    published: "2026-07-03",
    publishAt: "2026-07-03",
    kind: "find",
    leadIndex: 0,
    // reviewBand は持たせない: 56 件は "hundreds"(数百)にも "around_1k"(約千)にも当たらない(捏造しない)。
    //   rarity.reviews=56 を確定値でそのまま出す。obscurity は "deep"(レビュー僅少・西で無名)。英語対応済みで
    //   noEnglish=false のため lang_walled は使わない(誤って「英語非対応」stamp を立てない・正直さ)。英語レビュー
    //   1/56=約1.8% で西ほぼ未到達 = reachState="unreached_west"(stamp は positivePct+reviews で埋まるため
    //   "西ではまだ無名" fallback は発火しない・状態の正直な記録として付す)。系譜は Game Dev Story(ゲーム発展途上国)。
    //   ジャンルはターン制の経営/タイクーン型 = "simulation"(経営SLG)。実時間カウンター店の Recettear 系
    //   "shop-sim"(店経営SLG)ではなく、月単位ターン制で業界史を生き延びる経営シムのため simulation を採る。
    meta: { genre: "simulation", lineage: "game-dev-story", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 56, positivePct: 93, noEnglish: false } },
    games: [
      {
        name_en: "Sunset Game Shop Shayou",
        name_ja: "ゲームショップ斜陽",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3986100/Sunset_Game_Shop_Shayou/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A business management and shopkeeping simulation by Lobstudio, the work of a small Japanese studio based in Kyoto, with the Chinese-market publishers P-Stardio and NexraGames carrying its release into Chinese-speaking regions. You run a game shop in a small town across the twenty-five years from 1985 to 2010, one turn per month, reading a market you can only see in part and deciding, month after month, what to stock, how much to carry, and what to charge. From limited information you predict how popular each piece of software will be, then place your orders, set your prices, and live with the result, surviving the real tides of Japan's game-industry history as the game moves through the Famicom boom, the bubble economy, the used-game controversy, and the rise of digital distribution, until you reach the year 2010 and clear the run. It is a single-player, pixel-art retro-styled sim of roughly ten to fifteen hours a playthrough. Released in April 2026, it is Very Positive at 93 percent over 56 reviews, a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. Lobstudio, by its own dev blog, is a Kyoto company, and the theme is the history of the Japanese game shop, Famicom and all, so it is culturally Japanese to the core; its co-publishers P-Stardio and NexraGames are distributors who carry Japanese developers' work into China rather than its origin. It already supports English alongside Japanese and Simplified and Traditional Chinese, yet with only 1 of its 56 reviews in English (about 1.8 percent) and the rest Japanese and Chinese, the West has barely found it at all. In Japan it has been shown at BitSummit and covered by outlets such as Dengeki, 4Gamer, and gamebiz, but on Steam it is still a fifty-six-review gem the West has not reached.",
        desc_ja: "経営・店番のシミュレーション。開発元は Lobstudio(ロブスタジオ)——京都を拠点とする日本の小規模スタジオの手による一本で、中国語圏への展開は中国市場向けのパブリッシャー P-Stardio と NexraGames が担う。プレイヤーは、1985年から2010年までの25年間、町のゲームショップを経営する。1ターンは1ヶ月。部分的にしか見えない市場を読み、毎月、何を仕入れ、どれだけ在庫を抱え、いくらで売るかを決めていく。限られた情報からソフトの人気を予測し、発注し、値付けし、その結果とともに生きる——ファミコンブーム、バブル経済、中古ゲーム論争、そしてダウンロード販売の台頭と、実在の日本のゲーム業界史の荒波を生き延び、2010年に到達すればクリアだ。シングルプレイ、ドット絵レトロ調で、1周およそ10〜15時間。2026年4月リリース、56レビュー93%で非常に好評。無料ではない有料作で、アーリーアクセスでもない正式リリース済み。AI生成アセットはなく、Steam 自身のコンテンツディスクリプタ上、性的な要素もない。Lobstudio は、自身の開発ブログで「京都の会社」と明記する日本のスタジオであり、テーマはファミコンをはじめとする日本のゲームショップの歴史——文化的に芯まで日本産だ。共同パブリッシャーの P-Stardio と NexraGames は、日本のデベロッパーの作品を中国へ届ける販売パートナーであって、原産ではない。すでに英語に、日本語・簡体字／繁体字中国語と並んで対応しているが、56件のうち英語レビューは1件(約1.8%)にとどまり、残りは日本語・中国語圏——西はこの一本を、まだほとんど見つけていない。日本では BitSummit に出展され、電撃・4Gamer・gamebiz などのメディアに掲載されているが、Steam ではまだ56レビューと小規模で、西には届いていない。",
      },
      {
        name_en: "Game Dev Story",
        name_ja: "ゲーム発展途上国",
        status: "established",
        steam: "https://store.steampowered.com/app/1847240/Game_Dev_Story/",
        tag_en: "The management-sim origin",
        tag_ja: "経営シムの原点",
        desc_en: "The origin of this taste: Game Dev Story, a business management simulation developed and published by Kairosoft, originally released in 1997 and brought worldwide by its 2010 smartphone version. You run a game development company, hiring and growing staff, choosing a genre and type for each new title, releasing games and managing budget, hardware trends, and reputation across years of a fictional game industry, making decisions from limited information and watching the numbers accumulate. That core, steering a single small business through the game industry's own history on limited information, is the root Sunset Game Shop Shayou grows from, but where Kairosoft put you on the development side making the games, this puts you on the retail side selling them, a mirror image that trades the studio for the shop. The original is anchored here to its Steam release.",
        desc_ja: "この味の原点——ゲーム発展途上国(Game Dev Story)。カイロソフトが開発・販売した経営シミュレーションで、1997年に発売され、2010年のスマートフォン版で世界的に広まった。プレイヤーはゲーム開発会社を経営し、スタッフを雇って育て、新作ごとにジャンルとタイプを選び、ゲームを発売し、予算やハードの流行、評判を、架空のゲーム業界の何年もの歳月にわたって管理していく——限られた情報から判断を下し、積み上がっていく数字を見守りながら。この核——限られた情報のもとで、一つの小さな事業を、ゲーム業界そのものの歴史の中で舵取りする——こそ、ゲームショップ斜陽が育つ根だ。ただし、カイロソフトがあなたを「ゲームを作る」開発側に置いたのに対し、本作はあなたを「ゲームを売る」小売側に置く。スタジオを店に置き換えた、鏡像である。原作は、その Steam ページで同定する。",
      },
    ],
    en: {
      title: "Sunset Game Shop Shayou - a turn-based management sim where you run a small-town game shop across the twenty-five years from 1985 to 2010, predicting each game's popularity from limited information to survive the Famicom boom, the bubble, the used-game controversy, and the rise of digital, a Kyoto-made retail-side mirror of Game Dev Story the West has barely found",
      description: "A business management simulation by Lobstudio, a small Japanese studio in Kyoto, with the Chinese-market publishers P-Stardio and NexraGames handling its release into Chinese-speaking regions. You run a small-town game shop across the twenty-five years from 1985 to 2010, one turn per month, reading a market you can only partly see and deciding what to stock, how much, and at what price. From limited information you predict each game's popularity, then survive the real history of Japan's game industry, the Famicom boom, the bubble, the used-game controversy, and the rise of digital distribution, until you reach 2010. A single-player, pixel-art sim of ten to fifteen hours. Very Positive at 93 percent over 56 reviews; it supports English, yet with only about 1.8 percent English reviews the West has barely found it.",
      h1a: "You do not make the games. ",
      h1flip: "You run the shop that sells them, and survive twenty-five years of the game industry's own history",
      h1b: ".",
      lede: "A business management and shopkeeping simulation by Lobstudio, the work of a small Japanese studio based in Kyoto, with the Chinese-market publishers P-Stardio and NexraGames carrying its release into Chinese-speaking regions. You run a game shop in a small town across the twenty-five years from 1985 to 2010, one turn per month, reading a market you can only see in part and deciding, month after month, what to stock, how much to carry, and what to charge. From limited information you predict how popular each piece of software will be, place your orders, set your prices, and live with the result, surviving the real tides of Japan's game-industry history, the Famicom boom, the bubble economy, the used-game controversy, and the rise of digital distribution, until you reach the year 2010. A single-player, pixel-art retro sim of roughly ten to fifteen hours a playthrough. In the lineage of Game Dev Story, but on the retail side rather than the development side. It supports English, yet with only about 1.8 percent of its reviews in English, the West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "The whole game is a bet made on partial information. You never see the full market, only fragments of what people want, and every month you have to guess how well a given piece of software will sell, then commit real money to stocking it. The tension lives in the gap between what you can know and what you have to decide: order too many of a game that flops and it rots as dead stock, order too few of a hit and you watch the demand walk out the door, so each month becomes a small act of reading the room and betting on your read.",
        "It is turn-based, one turn to a month, and that rhythm turns the passage of time into pressure. The years do not stand still around your shop; they move through the actual history of the Japanese game industry, the Famicom boom, the bubble, the used-game controversy, the rise of digital distribution, and each era rewrites what sells and how you make money. A strategy that carried you through one decade can quietly stop working in the next, so surviving is less about a single optimal build and more about reading each new age and adapting the shop to it before it leaves you behind.",
        "Its whole shape is a mirror. Game Dev Story put you inside the studio, making the games and riding the industry from the maker's side; this stands you at the counter of the shop that sells them, riding the same twenty-five years from the retail side, watching tides you did not create wash your inventory in and out. Reaching 2010 alive, having steered one small shop through a quarter-century of an industry you can only partly see, is the run, and the pull is the long arc of keeping a fragile business afloat era after era.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Game Dev Story and Kairosoft-style management sims, steering a small business through the tides of the game industry on limited information, and you want that taste turned to the retail side, running the shop that sells the games rather than the studio that makes them",
        "You want a turn-based sim where time itself is the pressure, twenty-five years from 1985 to 2010 that move through the real history of the Famicom boom, the bubble, the used-game controversy, and the rise of digital, each era rewriting what sells, over a ten-to-fifteen-hour playthrough",
        "You want a Japanese-made gem the West has barely found, Very Positive at 93 percent over 56 reviews, the Kyoto-made work of Lobstudio, already supporting English yet with only about 1.8 percent of its reviews in English",
      ],
      bad: [
        "You want fast, real-time action or an over-the-counter haggling shop; this is a deliberate, turn-based business sim of predicting demand and setting monthly stock and prices, a paid title, not free and not in Early Access, carried by numbers and reading the market rather than by reflexes",
        "You expect a big-studio, already-popular Western release; this is a small doujin-scale sim by a Kyoto studio, and while its co-publishers P-Stardio and NexraGames carry it into Chinese-speaking regions, that is market distribution, not its origin, which is wholly Japanese, and its audience is still almost entirely Japanese and Chinese, with only one of its fifty-six reviews in English, though it has no AI-generated assets and Steam flags no sexual content",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ゲームショップ斜陽 - 1985年から2010年までの25年間、町のゲームショップを経営するターン制の経営シミュレーション。限られた情報からソフトの人気を予測し、ファミコンブーム、バブル、中古ゲーム論争、ダウンロード販売の台頭を生き延びる。Game Dev Story の「小売側」の鏡像、京都発の、西がまだほとんど見つけていない一本",
      description: "開発元は Lobstudio(ロブスタジオ)——京都の小規模な日本のスタジオ。中国語圏への展開は、中国市場向けのパブリッシャー P-Stardio と NexraGames が担う。プレイヤーは、1985年から2010年までの25年間、町のゲームショップを経営する。1ターンは1ヶ月。部分的にしか見えない市場を読み、何を、どれだけ、いくらで売るかを決めていく。限られた情報からソフトの人気を予測し、ファミコンブーム、バブル、中古ゲーム論争、ダウンロード販売の台頭と、実在の日本のゲーム業界史を生き延び、2010年に到達する。シングルプレイ、ドット絵の、1周10〜15時間のシム。56レビュー93%で非常に好評。英語に対応済みだが、英語レビューは約1.8%——西はこの一本を、まだほとんど見つけていない。",
      h1a: "あなたは、ゲームを作らない。",
      h1flip: "ゲームを売る店を経営し、ゲーム業界そのものの25年の歴史を生き延びる",
      h1b: "。",
      lede: "経営・店番のシミュレーション。開発元は Lobstudio(ロブスタジオ)——京都を拠点とする日本の小規模スタジオの手による一本で、中国語圏への展開は中国市場向けのパブリッシャー P-Stardio と NexraGames が担う。プレイヤーは、1985年から2010年までの25年間、町のゲームショップを経営する。1ターンは1ヶ月。部分的にしか見えない市場を読み、毎月、何を仕入れ、どれだけ在庫を抱え、いくらで売るかを決めていく。限られた情報からソフトの人気を予測し、発注し、値付けし、その結果とともに生きる——ファミコンブーム、バブル経済、中古ゲーム論争、そしてダウンロード販売の台頭と、実在の日本のゲーム業界史の荒波を生き延び、2010年に到達する。シングルプレイ、ドット絵レトロ調で、1周およそ10〜15時間。Game Dev Story の系譜に連なるが、開発側ではなく小売側の一本だ。英語に対応済みだが、レビューのうち英語は約1.8%——西はこの一本を、まだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ゲームのすべては、部分的な情報の上に賭ける行為だ。市場の全体は決して見えず、人々が何を欲しがっているかの断片だけが手元にある。そして毎月、あるソフトがどれだけ売れるかを推し量り、実際のお金を張って仕入れなければならない。緊張は、「知れること」と「決めねばならないこと」の間の隙間にある——売れないゲームを仕入れすぎれば不良在庫として腐り、ヒット作を仕入れそこねれば、需要が店の外へ歩き去っていくのを見送ることになる。だから一月一月が、場の空気を読み、自分の読みに賭ける、小さな一手になる。",
        "本作はターン制で、1ターンは1ヶ月——そのリズムが、時間の流れそのものを圧力に変える。あなたの店の周りで、歳月は止まっていない。それは、実在の日本のゲーム業界史の中を進んでいく——ファミコンブーム、バブル、中古ゲーム論争、ダウンロード販売の台頭。それぞれの時代が、「何が売れるか」「どう稼ぐか」を書き換えていく。ある十年を支えてくれた戦略が、次の十年では静かに通用しなくなる。だから生き延びるとは、一つの最適解を回すことではなく、新しい時代ごとにそれを読み、置いていかれる前に店を作り替えていくことだ。",
        "その形の全体が、一枚の鏡だ。Game Dev Story はあなたをスタジオの内側に置き、ゲームを作りながら、作り手の側から業界の波に乗せた。本作は、そのゲームを売る店のカウンターにあなたを立たせ、同じ25年を、小売の側から乗り越えさせる——自分が生み出したわけではない波が、在庫を運び入れ、運び出していくのを見つめながら。部分的にしか見えない四半世紀の業界を、一つの小さな店で舵取りして、2010年に生きて辿り着くこと——それがこの一周であり、引力は、時代また時代と、脆い事業を浮かべ続ける、その長い弧にある。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Game Dev Story と、カイロソフト型の経営シムが好きな人——限られた情報のもとで、ゲーム業界の波の中を、一つの小さな事業で舵取りする、あの味。本作はそれを小売側へ——ゲームを作るスタジオではなく、ゲームを売る店へと向けている",
        "時間そのものが圧力になる、ターン制のシムが欲しい人——1985年から2010年までの25年が、ファミコンブーム、バブル、中古ゲーム論争、ダウンロード販売の台頭という実在の歴史の中を進み、時代ごとに「何が売れるか」を書き換えていく、1周10〜15時間の一本",
        "西側がまだほとんど見つけていない、日本製の原石が欲しい人——56レビュー93%で非常に好評、京都の Lobstudio が手がけた一本。英語に対応済みだが、レビューのうち英語は約1.8%にとどまる",
      ],
      bad: [
        "速いリアルタイムのアクションや、カウンター越しの値切り交渉の店経営が欲しい人(本作は、需要を予測し、毎月の仕入れと値付けを決める、じっくりとしたターン制の経営シムだ。無料でもアーリーアクセスでもない有料作で、反射神経ではなく、数字と市場の読みが支える)",
        "大手スタジオの、すでに西で人気の作品を期待する人(本作は京都のスタジオによる同人規模のシムだ。共同パブリッシャーの P-Stardio と NexraGames が中国語圏へ届けてはいるが、それは市場への流通であって、原産ではない——原産は完全に日本だ。受け手はいまも大半が日本語・中国語圏で、56件のうち英語レビューは1件にとどまる。ただしAI生成アセットはなく、Steam は性的な内容を示していない)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "q2-humanity": {
    published: "2026-07-03",
    publishAt: "2026-07-03",
    kind: "find",
    leadIndex: 0,
    // reviewBand は持たせない: 62 件は "hundreds"(数百)にも "around_1k"(約千)にも当たらない(捏造しない)。
    //   rarity.reviews=62 を確定値でそのまま出す。英語対応済みで noEnglish=false(誤って「英語非対応」stamp を
    //   立てない・正直さ)。英語レビュー 12/62=約19.4%・残る約8割は日本語、dev/pub とも日本の liica、Switch/Steam
    //   とも日本先行 = 西ほぼ未到達。ゆえに rarity(reviews+positivePct)は正直(「なのに、ほとんど誰も見つけていない」は
    //   真 = 全62件・英12件の小規模)。obscurity は "deep"(レビュー僅少・西で無名)、reachState="unreached_west"。
    //   系譜は Crayon Physics Deluxe(2009, Petri Purho, IGF シューマス・マクナリー大賞・Steam app 26900)——描いた
    //   形を重力落下させ物理で解くドロー物理パズルの原点。ジャンルは physics-puzzle(物理パズル)。
    meta: { genre: "physics-puzzle", lineage: "crayon-physics-deluxe", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 62, positivePct: 90, noEnglish: false } },
    games: [
      {
        name_en: "Q2 HUMANITY",
        name_ja: "Q2 HUMANITY",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2357950/Q2_HUMANITY/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A physics-puzzle game by liica, Inc. (Kabushiki-gaisha Riica), a small commercial studio based in Chiyoda, Tokyo, founded in 2011, both the developer and the publisher of the work; the Q series is game-designed and produced by Yusuke Kurita, the creator of the KY (Kuuki Yomi) games. It is the sequel to Q, released in 2015. You solve each stage by drawing: the lines and shapes you draw are made of little human figures, and the instant you finish a stroke it drops under gravity and behaves as real physics, tumbling, rolling, wedging against a wall, and settling into a pile, so a puzzle is solved not by placing an answer but by drawing a shape and trusting the fall to carry it where the goal needs it. On top of that drawing core sit hands-on verbs, your humans can jump, grab, throw, and punch, and eighteen different human characters each bring a special ability, from an enhanced slow-motion and a double jump to detonating a bomb or bending gravity itself, across more than three hundred stages. It plays solo or with up to four players in co-op or competition, over online play and Remote Play Together. Released on Steam in December 2024, after the Switch version in August 2024, it is Very Positive at 90 percent over 62 reviews, a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. It supports English alongside Japanese, yet with only 12 of its 62 reviews in English (about 19.4 percent) and roughly four in five of them in Japanese, the West has barely found it. Both a Tokyo studio's work and a Japan-first release, on Switch in August 2024 and Steam that December, it is a sixty-two-review hidden gem the West has not reached. This is a registered commercial studio, not an anonymous doujin.",
        desc_ja: "物理演算パズル。開発・販売はいずれも liica, Inc.（株式会社リイカ）——2011年設立、東京・千代田を拠点とする小規模な商業スタジオだ。Qシリーズのゲームデザインとプロデュースは、『空気読み。』シリーズの作者・栗田祐介が手がける。本作は、2015年に発売された『Q』の続編である。ステージを解く手段は「描く」こと——描いた線や形は、小さな人間たちでできていて、一筆を描き終えた瞬間、それは重力で落下し、本物の物理として振る舞う。転がり、ころがり込み、壁に噛み合い、山になって落ち着く。だからパズルは、答えを「置く」のではなく、形を「描いて」、その落下がゴールの求める場所へ運んでくれることに賭けて解く。その「描く」核の上に、直接手を動かす動詞が乗る——人間たちはジャンプし、掴み、投げ、殴る。さらに18人の人間キャラクターが、強化されたスローモーション、二段ジャンプから、爆弾の起爆、重力そのものを曲げる力まで、それぞれ特殊能力を持つ。ステージは300問を超える。ソロでも、最大4人での協力・競争でも遊べ、オンラインプレイと Remote Play Together に対応する。2024年12月にSteamで発売（2024年8月のSwitch/Nintendo Switch版に続く）、62レビュー90%で非常に好評。無料ではない有料作で、アーリーアクセスでもない正式リリース済み。AI生成アセットはなく、Steam 自身のコンテンツディスクリプタ上、性的な要素もない。日本語と並んで英語にも対応しているが、62件のうち英語レビューは12件（約19.4%）にとどまり、およそ5件に4件は日本語——西はこの一本を、まだほとんど見つけていない。東京のスタジオの作品であり、かつ日本先行のリリース（2024年8月にSwitch、同12月にSteam）でもある、62レビューの隠れた名作。これは無名の同人ではなく、登記された商業スタジオの一本であり、西にはまだ届いていない。",
      },
      {
        name_en: "Crayon Physics Deluxe",
        name_ja: "Crayon Physics Deluxe",
        status: "established",
        steam: "https://store.steampowered.com/app/26900/Crayon_Physics_Deluxe/",
        tag_en: "The draw-and-drop physics origin",
        tag_ja: "描いて落とす物理パズルの原点",
        desc_en: "The origin of this taste: Crayon Physics Deluxe, created by the Finnish designer Petri Purho and released in 2009. You draw with a crayon on the screen, and everything you draw instantly becomes a solid physical object that obeys gravity, so to guide a ball to a star you sketch ramps, pendulums, levers, and weights and let physics do the rest, solving each puzzle by drawing shapes that fall and swing and push exactly as real matter would. It won the Seumas McNally Grand Prize at the Independent Games Festival and crystallized the draw-a-shape-and-let-physics-solve-it puzzle. That core, that you author the solution by drawing objects and trust gravity and physics to carry them, is the root Q2 HUMANITY grows from, carrying the same crayon-physics idea into stages drawn out of human figures that fall, and where it once was a lone ball and a star, this fills the screen with people who can also jump, grab, throw, and act. Its origin is anchored to its Steam release.",
        desc_ja: "この味の原点——Crayon Physics Deluxe。フィンランドのデザイナー Petri Purho が制作し、2009年に発売された。画面にクレヨンで絵を描くと、描いたものはすべて、その瞬間に重力に従う固い物理オブジェクトになる。だからボールを星まで導くには、坂や振り子、てこ、重りを描き、あとは物理に任せる——落ちて、揺れて、押す、本物の物質そのままの挙動で、形を描いてパズルを解いていく。インディペンデント・ゲームズ・フェスティバルでシューマス・マクナリー大賞を受賞し、「形を描いて、あとは物理に解かせる」パズルを結晶化させた。この核——オブジェクトを描いて解答を「作り」、重力と物理がそれを運ぶことに賭ける——こそ、Q2 HUMANITY が育つ根だ。本作は同じクレヨン物理のアイデアを、落下する人間たちで描かれるステージへと運び、かつては一つのボールと一つの星だったものを、ジャンプし、掴み、投げ、行動できる人間たちで画面いっぱいに満たしている。その原点は、Steam ページで同定する。",
      },
    ],
    en: {
      title: "Q2 HUMANITY - a physics-puzzle game where the lines and shapes you draw are made of little humans that drop under gravity and behave as real physics to solve each stage, with eighteen characters who can jump, grab, throw, and wield special abilities across three hundred stages, a Japan-made heir to Crayon Physics Deluxe the West has barely found",
      description: "A physics-puzzle game by liica, Inc. (Kabushiki-gaisha Riica), a small commercial studio in Chiyoda, Tokyo, both developer and publisher; the Q series is designed and produced by Yusuke Kurita, creator of the KY games. The sequel to Q (2015). You solve each stage by drawing: the lines and shapes you draw are made of little human figures, and the instant a stroke is finished it drops under gravity and behaves as real physics, so you solve not by placing an answer but by drawing a shape and trusting the fall. On top of that, your humans can jump, grab, throw, and punch, and eighteen characters each bring a special ability across more than three hundred stages, solo or up to four players in co-op or competition. In the lineage of Crayon Physics Deluxe. Very Positive at 90 percent over 62 reviews; it supports English, yet with only about 19.4 percent English reviews the West has barely found it.",
      h1a: "You do not place the answer. ",
      h1flip: "You draw a shape out of little humans, and trust gravity to drop it exactly where the goal needs it",
      h1b: ".",
      lede: "A physics-puzzle game by liica, Inc. (Kabushiki-gaisha Riica), a small commercial studio based in Chiyoda, Tokyo, both the developer and the publisher of the work, with the Q series designed and produced by Yusuke Kurita, the creator of the KY (Kuuki Yomi) games. It is the sequel to Q, released in 2015. You solve each stage by drawing: the lines and shapes you draw are made of little human figures, and the instant you finish a stroke it drops under gravity and behaves as real physics, tumbling, rolling, wedging, and stacking, so a puzzle is solved not by placing an answer but by drawing a shape and trusting the fall to carry it where the goal needs it. On top of that drawing core, your humans can jump, grab, throw, and punch, and eighteen characters each bring a special ability, from enhanced slow-motion and a double jump to detonating a bomb or bending gravity, across more than three hundred stages, solo or with up to four players in co-op or competition. In the lineage of Crayon Physics Deluxe. It supports English alongside Japanese, yet with only about 19.4 percent of its reviews in English, the West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "The whole game turns drawing into physics. You do not drop a pre-made block into a slot; you draw a line or a shape freehand, and the instant the stroke is done it comes alive under gravity and behaves as real matter, tumbling, rolling, wedging against a wall, and settling into a pile. So the pull is that a puzzle is never solved by placing the right answer, it is solved by drawing a shape and then watching whether the fall you set in motion carries it where the goal needs it, and the click of the solution is the moment your rough stroke lands as if it had been engineered.",
        "Those shapes are not abstract, they are made of little humans, and that turns the drawing into a cast of bodies you can act through. Your people can jump, grab, throw, and punch, and eighteen different characters each carry a special ability, an enhanced slow-motion, a double jump, a bomb they can detonate, a hand that bends gravity itself, so a stage is not only a shape you draw but a crew you choose, and reading which ability turns an impossible fall into a solvable one is half the puzzle.",
        "Then it opens up sideways. Across more than three hundred stages you can play alone and deliberately, or bring up to four people into co-op or competition over online play and Remote Play Together, and the same physics that made your solo drawings tumble now has four sets of humans falling, shoving, and stacking at once, so a quiet act of authorship becomes a shared, physical scramble where everyone's strokes and bodies pile into the same simulation.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Crayon Physics Deluxe and hand-drawn physics puzzles, authoring the solution by drawing shapes and trusting gravity and physics to carry them, and you want that idea filled with little humans who fall, stack, and can also jump, grab, throw, and act",
        "You want a puzzle that is about drawing and reading physics rather than memorizing answers, more than three hundred stages, eighteen characters with special abilities from slow-motion and double jumps to bombs and gravity-bending, solvable solo and turned into a scramble with up to four players in co-op or competition",
        "You want a Japan-made gem the West has barely found, Very Positive at 90 percent over 62 reviews, the work of the Tokyo studio liica whose Q series is designed by KY creator Yusuke Kurita, already supporting English yet with only about 19.4 percent of its reviews in English",
      ],
      bad: [
        "You want a story-driven adventure or a fast twitch-action game; this is a physics-puzzle built around drawing shapes and letting them fall, a paid title, not free and not in Early Access, carried by reading physics and choosing abilities rather than by reflexes or narrative, with no AI-generated assets and no sexual content by Steam's descriptors",
        "You specifically want something the West already knows, or a big-publisher release; this is the work of a small Tokyo commercial studio, liica, released Japan-first on Switch in August 2024 and Steam that December, and while it fully supports English, only 12 of its 62 reviews are in English and roughly four in five are Japanese, so it is a Japan-born gem the West has not reached, neither a doujin anonymity nor a Western hit",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Q2 HUMANITY - 描いた線や形（小さな人間たち）が重力で落下し、本物の物理として振る舞ってステージを解く物理演算パズル。ジャンプ・掴む・投げるができる18人のキャラクターと、300を超えるステージ。Crayon Physics Deluxe の系譜、東京の小さなスタジオが作った、西がまだほとんど見つけていない一本",
      description: "物理演算パズル。開発・販売はいずれも liica, Inc.（株式会社リイカ）——東京・千代田の小規模な商業スタジオで、Qシリーズのゲームデザインとプロデュースは『空気読み。』の作者・栗田祐介が手がける。2015年の『Q』の続編。ステージを解く手段は「描く」こと——描いた線や形は小さな人間たちでできていて、一筆を描き終えた瞬間、それは重力で落下し、本物の物理として振る舞う。だから答えを「置く」のではなく、形を「描いて」その落下に賭けて解く。さらに人間たちはジャンプし、掴み、投げ、殴り、18人のキャラクターがそれぞれ特殊能力を持つ。300を超えるステージを、ソロでも最大4人の協力・競争でも遊べる。Crayon Physics Deluxe の系譜。62レビュー90%で非常に好評。英語に対応しているが、英語レビューは約19.4%——西はこの一本を、まだほとんど見つけていない。",
      h1a: "答えを「置く」のではない。",
      h1flip: "小さな人間たちで形を描き、その落下がゴールの求める場所へ運んでくれることに賭ける",
      h1b: "。",
      lede: "物理演算パズル。開発・販売はいずれも liica, Inc.（株式会社リイカ）——2011年設立、東京・千代田を拠点とする小規模な商業スタジオだ。Qシリーズのゲームデザインとプロデュースは、『空気読み。』シリーズの作者・栗田祐介が手がける。本作は、2015年に発売された『Q』の続編である。ステージを解く手段は「描く」こと——描いた線や形は、小さな人間たちでできていて、一筆を描き終えた瞬間、それは重力で落下し、本物の物理として振る舞う。転がり、ころがり込み、噛み合い、積み上がっていく。だからパズルは、答えを「置く」のではなく、形を「描いて」、その落下がゴールの求める場所へ運んでくれることに賭けて解く。その「描く」核の上に、人間たちはジャンプし、掴み、投げ、殴る。さらに18人のキャラクターが、強化スローモーションや二段ジャンプから、爆弾の起爆、重力を曲げる力まで、それぞれ特殊能力を持つ——300を超えるステージを、ソロでも、最大4人の協力・競争でも。Crayon Physics Deluxe の系譜に連なる一本だ。日本語と並んで英語にも対応しているが、レビューのうち英語は約19.4%——西はこの一本を、まだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ゲームのすべては、「描く」ことを物理に変える。既製のブロックを枠にはめ込むのではない——線や形を、フリーハンドで描く。そして一筆を描き終えた瞬間、それは重力のもとで命を持ち、本物の物質として振る舞う。転がり、ころがり込み、壁に噛み合い、山になって落ち着く。だから引力は、パズルが決して「正しい答えを置く」ことでは解けない、という点にある。形を「描いて」、自分が動かし始めたその落下が、ゴールの求める場所へ運んでくれるかを見つめる——ラフな一筆が、まるで設計されていたかのようにはまる、その瞬間だ。",
        "その形は抽象ではない——小さな人間たちでできている。それが「描く」ことを、あなたが乗り移って動かせる「体」の一団に変える。人間たちはジャンプし、掴み、投げ、殴る。そして18人のキャラクターが、それぞれ特殊能力を持つ——強化されたスローモーション、二段ジャンプ、起爆できる爆弾、重力そのものを曲げる手。だからステージは、描く「形」であると同時に、選ぶ「一団」でもある。どの能力が、不可能な落下を、解ける落下に変えるかを読むこと——それがパズルの半分だ。",
        "そして、それは横へと開いていく。300を超えるステージを、ひとりでじっくり遊ぶこともできれば、最大4人を協力・競争へ——オンラインプレイと Remote Play Together で——連れ込むこともできる。ソロの絵を転がしていたのと同じ物理が、いまや4組の人間たちを、いっぺんに落とし、押し合わせ、積み上げる。静かな「作る」行為が、みんなの一筆と体が同じシミュレーションになだれ込む、共有の物理的な混戦になる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Crayon Physics Deluxe と、手描きの物理パズルが好きな人——形を描いて解答を「作り」、重力と物理がそれを運ぶことに賭ける、あの味。本作はそれを、落下し、積み上がり、しかもジャンプ・掴む・投げるができる小さな人間たちで満たしている",
        "答えを覚えることではなく、「描く」ことと物理を「読む」ことのパズルが欲しい人——300を超えるステージ、スローモーションや二段ジャンプから爆弾・重力操作まで特殊能力を持つ18人のキャラクター。ソロで解け、最大4人の協力・競争で混戦にもなる一本",
        "西側がまだほとんど見つけていない、日本製の原石が欲しい人——62レビュー90%で非常に好評、Qシリーズを『空気読み。』の作者・栗田祐介がデザインする、東京のスタジオ liica の一本。英語に対応済みだが、レビューのうち英語は約19.4%にとどまる",
      ],
      bad: [
        "物語主導のアドベンチャーや、速い反射神経勝負のアクションが欲しい人（本作は、形を描いて落とす物理演算パズルだ。無料でもアーリーアクセスでもない有料作で、反射神経や物語ではなく、物理を読み、能力を選ぶことが支える。AI生成アセットはなく、Steam のディスクリプタ上、性的な要素もない）",
        "すでに西で知られたものや、大手パブリッシャーの作品を求める人（本作は、東京の小さな商業スタジオ liica の作品で、2024年8月にSwitch、同12月にSteamと、日本先行で発売された。英語には完全対応しているが、62件のうち英語レビューは12件、およそ5件に4件は日本語だ。無名の同人でも、西のヒット作でもなく、西がまだ届いていない、日本発の原石である）",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "abyss-runner": {
    published: "2026-07-04",
    publishAt: "2026-07-04",
    kind: "find",
    leadIndex: 0,
    // reviewBand は持たせない: 134 件は "hundreds"(数百)と言い切るには境界的(誇張しない)。rarity.reviews=134 を
    //   確定値でそのまま出す。obscurity は "deep"(レビュー僅少・西で無名)——momibosu(60)/witchroid-vania(83)と
    //   同帯の小規模。英語対応済みで noEnglish=false のため lang_walled は使わない(誤って「英語非対応」stamp を
    //   立てない・正直さ)。英語レビュー 33/134=24.6% で西未浸透 = reachState="unreached_west"(ただし処女地では
    //   なく中程度・stamp は positivePct+reviews で埋まるため "西ではまだ無名" fallback は発火しない・状態の
    //   正直な記録として付す)。系譜は Only Up!(上がるのみ!)——ストア説明文の「上がるのみ!ゲームに影響を受けた」の直接引用。
    meta: { genre: "climbing-platformer", lineage: "only-up", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 134, positivePct: 93, noEnglish: false } },
    games: [
      {
        name_en: "Abyss Runner",
        name_ja: "アビスランナー",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3779380/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A brutally hard, precision 2D climbing platformer in the Only Up! mold, by Asuwawagami, a Japanese doujin and indie developer, published by the Japanese indie label Tensei Games. You play Lily, the Queen of the Underworld, whose magic is immense but who is, frankly, a bit of an airhead. Spotting a vertical pit full of monsters, she hatches a prank: fling a Cursed Arm Binder onto a passing adventurer and drop him in for the monsters to feast on. Instead she trips into her own trap, the binder clamps onto her own arms, and because it seals off all of her magic she can no longer fly, plummeting straight down into the abyss completely defenseless. From there the game has a single objective, climb up: it is, in the developer's own words on the store page, a 2D platformer influenced by Only Up!, a deliberately merciless ascension where you inch up out of the pit through four areas while countless monsters get in your way, and a single slip can strip away a long stretch of hard-won height in an instant. The difficulty is punishing on purpose, its beta testers were tearing their hair out and the developer took two full days to reach the top, with hidden techniques to master and, for those who do not want the full ordeal, optional cheats offered as a mercy. Released in May 2026, it is Very Positive at 93 percent over 134 reviews (125 positive, 9 negative), a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. Asuwawagami is a Japanese doujin and indie developer, and Tensei Games a Japanese indie games studio. It already supports English alongside Japanese and Simplified and Traditional Chinese, yet with only 33 of its 134 reviews in English (about 24.6 percent) and no Korean at all, the Steam English-speaking world has only begun to find it.",
        desc_ja: "「上がるのみ!」の系譜に連なる、高難度・精密の2Dクライミング・プラットフォーマー。開発元は Asuwawagami（明日は我が身）——日本の同人／インディー開発者で、販売元は日本のインディー系レーベル Tensei Games（転生）だ。あなたが操るのは、魔界の女王リリ——魔法の力は絶大だが、正直、少しおバカ。ある日、魔物が巣食う縦穴を見つけたリリは、いたずらを思いつく。「呪いのアームバインダー」を通りすがりの冒険者に投げつけ、縦穴へ突き落として魔物の餌にしてやろう、と。ところが——リリは自らの罠に嵌る。アームバインダーは自分の腕に装着され、その効果で魔法の力がすべて封じられてしまう。もう飛べない。無防備なまま、リリはアビス（奈落）の底へと真っ逆さまに落ちていく。ここからのゲームの目標はただ一つ、上へ登ること——ストアページで開発者自身が「『上がるのみ!』（Only Up!）ゲームに影響を受けた2Dプラットフォーマ」と明言する、意図的に容赦のない上昇（ascension）だ。全4エリアの縦穴を、数多のモンスターに邪魔されながら、少しずつ上へよじ登っていく。そして、わずかな踏み外しが、苦労して稼いだ高さを一気に奪っていく。難易度はわざと理不尽なほど高く、テストプレイヤーは阿鼻叫喚、開発者自身が初回クリアに2日を要したという。習得すべき隠しテクニックがあり、そして「そこまでの苦行は望まない」人のために、救済としてのオプションのチート（裏技）も用意されている。2026年5月リリース、134レビュー93%（好評125・不評9）で非常に好評。無料ではない有料作で、アーリーアクセスでもない正式リリース済み。AI生成アセットはなく、Steam 自身のコンテンツディスクリプタ上、性的な要素もない。Asuwawagami は日本の同人／インディー開発者、Tensei Games は日本のインディー・ゲームスタジオだ。すでに英語に、日本語・簡体字／繁体字中国語と並んで対応しているが、134件のうち英語レビューは33件（約24.6%）にとどまり、韓国語には一切対応していない——Steam の英語圏は、この一本をまだ見つけ始めたばかりだ。",
      },
      {
        name_en: "Only Up!",
        name_ja: "Only Up!（上がるのみ!）",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Only_Up!",
        wikidata: "https://www.wikidata.org/wiki/Q119626229",
        tag_en: "The ascension origin",
        tag_ja: "上昇の原点",
        desc_en: "The origin of this taste: Only Up!, a 3D climbing platformer developed by SCKR Games and released on Steam in 2023. You climb ever upward across a towering, surreal stack of floating platforms and debris, and with no checkpoints, a single misstep can send you plummeting far back down and undo long stretches of hard-won height in an instant, so the whole game becomes the fear of falling and the pull to try the same climb again. It exploded into a viral streaming phenomenon in 2023 and crystallized the ascension climbing platformer, the lineage where the entire game is the climb and one fall can cost you everything. That core is the root Abyss Runner grows from, keeping the up-only ascension and the terror of losing height, but flattening it into a precision 2D platformer, wrapping it in a comic story of a fallen demon queen, and threading monsters through the climb across four areas. Only Up! was later delisted from Steam, so the origin is anchored here to its Wikidata entry rather than a store page.",
        desc_ja: "この味の原点——Only Up!（上がるのみ!）。SCKR Games が開発し、2023年に Steam で配信された3Dのクライミング・プラットフォーマーだ。プレイヤーは、垂直にそびえ立つ、浮遊する足場と瓦礫の塔を、ひたすら上へと登っていく。チェックポイントは無く、たった一度の踏み外しで遥か下まで落ち、苦労して稼いだ高さが一瞬にして失われる——だからゲームのすべてが、「落ちる恐怖」と、「同じ登りにもう一度挑む」引力になる。2023年に配信を中心として爆発的に流行し、上昇（ascension）型のクライミング・プラットフォーマー——ゲームのすべてが「登ること」であり、一度の落下で何もかもを失いかねない、その系譜——を結晶化させた。この核こそ、Abyss Runner が育つ根だ。本作は「上へ登るのみ」の上昇と、高さを失う恐怖を受け継ぎながら、それを精密な2Dプラットフォーマーへと落とし込み、罠に落ちた魔王の喜劇的な物語で包み、全4エリアの登りにモンスターを織り込んでいる。Only Up! はのちに Steam から配信停止（delist）されたため、その原点は、ストアページではなく Wikidata のエントリで同定する。",
      },
    ],
    en: {
      title: "Abyss Runner - a brutally hard 2D climbing platformer where a demon queen, sealed by her own cursed trap, must climb up out of a monster-filled abyss with every slip dragging her back down, a Japanese indie heir to Only Up! the Steam West has only begun to find",
      description: "A brutally hard, precision 2D climbing platformer in the Only Up! mold, by Asuwawagami, a Japanese doujin and indie developer, published by the Japanese indie label Tensei Games. You play Lily, the airheaded Queen of the Underworld, who tries to prank an adventurer with a Cursed Arm Binder but falls into her own trap, has her magic sealed, and plummets defenseless into a monster-filled pit. The only objective is to climb up: a deliberately merciless ascension through four areas where a single slip can strip away a long stretch of hard-won height, with hidden techniques to master and optional cheats as a mercy. Very Positive at 93 percent over 134 reviews; it supports English, yet with only about 24.6 percent English reviews the Steam West has only begun to find it.",
      h1a: "You are the demon queen who set the trap, and you fell into it yourself. ",
      h1flip: "Your magic is sealed, the only way out of the abyss is up, and every slip sends you falling back down",
      h1b: ".",
      lede: "A brutally hard, precision 2D climbing platformer in the Only Up! mold, by Asuwawagami, a Japanese doujin and indie developer, published by the Japanese indie label Tensei Games. You play Lily, the Queen of the Underworld, whose magic is immense but who is, frankly, a bit of an airhead. She spots a monster-filled vertical pit and hatches a prank: fling a Cursed Arm Binder onto a passing adventurer and drop him in. Instead she trips into her own trap, the binder clamps onto her own arms, seals off all of her magic so she can no longer fly, and she plummets defenseless into the abyss. From there the game has a single objective, climb up: in the developer's own words on the store page, a 2D platformer influenced by Only Up!, a deliberately merciless ascension through four areas where monsters get in your way and a single slip can strip away a long stretch of hard-won height. There are hidden techniques to master and, for those who do not want the full ordeal, optional cheats offered as a mercy. In the lineage of Only Up! It already supports English, yet the Steam English-speaking world has only begun to find it.",
      s1: "First, the one feeling",
      feeling: [
        "The whole game is a climb, and what you can lose is height. In the Only Up! mold that inspired it, there are no gentle do-overs: a slip can send you falling back down and cost you a hard-won stretch of the ascent, so every precise jump carries the weight of everything below it. The pull is the same one that made Only Up! spread, the fear of falling and the itch to line up the exact jump one more time.",
        "It is punishing on purpose. The developer took two full days to reach the top and the beta testers were tearing their hair out, and across four areas of the vertical pit the monsters are not scenery but obstacles that get in your way and try to stop the climb, so ascending is a precision gauntlet where reading each hazard and nailing each jump is the entire game.",
        "But it is not pure cruelty. There are hidden techniques to discover and master that change how you move, and for players who do not want the full ordeal there are optional cheats offered as a mercy, so the same abyss can be a masochistic test or a gentler climb. Under the difficulty runs a dark comedy: a powerful, airheaded demon queen who set a trap and fell into it herself, stripped of her magic and forced to claw her way back up defenseless.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Only Up! and the ascension climbing platformer, the merciless up-only climb where one slip drops you back down and the whole game is the fear of losing your height, here reframed as a fallen demon queen clawing out of a monster-filled abyss",
        "You want that ascension threaded with 2D precision and enemies: four areas of a vertical pit where monsters get in your way, hidden techniques to master, and, if the full punishment is too much, optional cheats offered as a mercy",
        "You want a Japanese indie gem the Steam West has barely found, Very Positive at 93 percent over 134 reviews, already supporting English, the work of Asuwawagami published by the Japanese indie studio Tensei Games",
      ],
      bad: [
        "You bounce off brutally hard, punishing platformers; this is an intentionally merciless up-only ascension where one slip can cost you a long stretch of progress, its own beta testers were tearing their hair out, and the whole pull is enduring that until you reach the top (there are optional cheats, but they are a mercy, not the intended way to play)",
        "You expect a big-publisher, already-popular Western title, or you want something free; this is a paid indie and doujin work by Asuwawagami (published by the Japanese indie studio Tensei Games), not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's descriptors, and its audience is still mostly Japanese and Chinese-speaking, with only about 24.6 percent of reviews in English",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "アビスランナー - 罠を仕掛けた魔王が自らの罠に落ち、魔法を封じられて奈落の底から上へ登る。一度の踏み外しが稼いだ高さを奪う、高難度・精密の2Dクライミング・プラットフォーマー。「上がるのみ!」の系譜、Steam の西がまだ見つけ始めたばかりの、日本のインディーの一本",
      description: "「上がるのみ!」（Only Up!）の系譜に連なる、高難度・精密の2Dクライミング・プラットフォーマー。開発元は日本の同人／インディー開発者 Asuwawagami（明日は我が身）、販売元は日本のインディー系レーベル Tensei Games（転生）。魔界の女王リリは、冒険者を陥れようと「呪いのアームバインダー」を使うが、自らの罠に嵌り、魔法を封じられて無防備なままアビスへ落ちる。目標はただ一つ、上へ登ること。全4エリアの縦穴を、モンスターに邪魔されながらよじ登り、わずかな踏み外しが稼いだ高さを奪う。134レビュー93%で非常に好評。英語に対応済みだが、英語レビューは約24.6%——Steam の西は、この一本をまだ見つけ始めたばかりだ。",
      h1a: "罠を仕掛けた魔王が、自分の罠に落ちた。",
      h1flip: "魔法は封じられ、アビスから出る道はただ一つ、上へ——そして少しの踏み外しが、あなたを下へと突き落とす",
      h1b: "。",
      lede: "「上がるのみ!」の系譜に連なる、高難度・精密の2Dクライミング・プラットフォーマー。開発元は Asuwawagami（明日は我が身）——日本の同人／インディー開発者で、販売元は日本のインディー系レーベル Tensei Games（転生）だ。あなたが操るのは、魔界の女王リリ——魔法の力は絶大だが、正直、少しおバカ。魔物が巣食う縦穴を見つけたリリは、いたずらを思いつく。「呪いのアームバインダー」を通りすがりの冒険者に投げつけ、縦穴へ突き落としてやろう、と。ところが——リリは自らの罠に嵌る。アームバインダーは自分の腕に装着され、魔法の力がすべて封じられてしまう。もう飛べない。無防備なまま、リリはアビスの底へと落ちていく。ここからのゲームの目標はただ一つ、上へ登ること——ストアページで開発者自身が「『上がるのみ!』（Only Up!）ゲームに影響を受けた2Dプラットフォーマ」と明言する、意図的に容赦のない上昇（ascension）だ。全4エリアの縦穴を、モンスターに邪魔されながらよじ登り、わずかな踏み外しが、苦労して稼いだ高さを一気に奪っていく。習得すべき隠しテクニックがあり、そして「そこまでの苦行は望まない」人のために、救済としてのオプションのチート（裏技）も用意されている。Only Up! の系譜に連なる一本。すでに英語に対応しているが、Steam の英語圏は、この一本をまだ見つけ始めたばかりだ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ゲームのすべては登りであり、失いうるのは「高さ」だ。影響元である『上がるのみ!』の型がそうであるように、優しいやり直しは無い——わずかな踏み外しが、あなたを下へと落とし、苦労して稼いだ登りの一区間を奪っていく。だから一つひとつの精密な跳躍は、その下にあるすべての重みを背負う。引力は、『上がるのみ!』を広めたのと同じもの——落ちる恐怖と、同じ跳躍をもう一度きっちり合わせたくなる、あの疼きだ。",
        "難易度は、わざと理不尽なほど高い。開発者自身が頂上まで2日を要し、テストプレイヤーは阿鼻叫喚——全4エリアの縦穴では、モンスターは背景ではなく、あなたの邪魔をし、登りを止めにくる障害だ。だから上昇は、一つひとつの危険を読み、一つひとつの跳躍を決めることがすべての、精密な試練になる。",
        "だが、ただ残酷なだけではない。見つけて習得すれば動き方が変わる隠しテクニックがあり、そして「そこまでの苦行は望まない」人のために、救済としてのオプションのチート（裏技）が用意されている——同じアビスが、厳しい試練にも、もう少し優しい登りにもなる。その難易度の下には、ダークコメディが流れている。強大だが、少しおバカな魔王が、自ら仕掛けた罠に自分で落ち、魔法を奪われ、無防備なまま這い上がる羽目になる——その物語だ。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "『上がるのみ!』と、上昇（ascension）型のクライミング・プラットフォーマーが好きな人——一度の踏み外しで下へ落ち、ゲームのすべてが「高さを失う恐怖」になる、あの容赦のない上りだけの登り。本作はそれを、モンスターの巣食う奈落から這い上がる、罠に落ちた魔王の物語として組み直している",
        "その上昇を、2Dの精密さと敵に織り込んだものが欲しい人——モンスターが邪魔をしてくる全4エリアの縦穴、習得すべき隠しテクニック、そして苦行がきつすぎるなら、救済として用意されたオプションのチート",
        "Steam の西がまだほとんど見つけていない、日本のインディーの原石が欲しい人——134レビュー93%で非常に好評、英語に対応済み、Asuwawagami が手がけ、日本のインディースタジオ Tensei Games が販売する一本",
      ],
      bad: [
        "難しく、厳しいプラットフォーマーが苦手な人（本作は、わざと容赦なく作られた上りだけの上昇で、一度の踏み外しが長い進捗を奪いかねない。テストプレイヤーですら頭を掻きむしり、そのループを頂上まで耐えることにこそ引力がある。オプションのチートはあるが、それは救済であって、本来の遊び方ではない）",
        "大手パブリッシャーの、すでに西で人気の大作を期待する人、あるいは無料のものが欲しい人（本作は Asuwawagami による有料のインディー／同人作で——販売は日本のインディースタジオ Tensei Games——無料でもアーリーアクセスでもない。AI生成アセットはなく、Steam のディスクリプタ上、性的な要素もない。受け手の中心はいまも日本語・中国語圏で、英語レビューは約24.6%にとどまる）",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "strongest-tofu": {
    published: "2026-07-04",
    publishAt: "2026-07-04",
    kind: "find",
    leadIndex: 0,
    // genre は新設 "charge-jump-platformer"(溜めジャンプアクション): 本作の遊びの全ては単一ボタンの溜めジャンプ 1 つ
    //   —— 精密プラットフォーマー(precision-platformer)一般より、溜めて任意方向へ跳ぶこの 1 メカが核なので専用ラベルを
    //   立てる(site の細粒度ジャンル分類に整合)。obscurity は "deep"(レビュー僅少帯・西で無名)——scp-tale-of-crossing
    //   型(353 件/97%/unreached_west/deep)と同帯。英語対応済み(noEnglish=false)なので lang_walled は使わない
    //   (誤って「英語非対応」stamp を立てない・正直さ)。英語 43/355=12.1% で西未浸透 = reachState="unreached_west"。
    //   系譜は スーパーマリオブラザーズ(Super Mario Bros.)——制作者の任天堂(マリオ・カービィ)言明・作中の明示 SMB /
    //   ドンキーコングオマージュ面・「走り/踏み/ゴール到達」のジャンル原型から根と判定(wikidata Q11168 で同定)。
    meta: { genre: "charge-jump-platformer", lineage: "super-mario-bros", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 355, positivePct: 99, noEnglish: false } },
    games: [
      {
        name_en: "The Strongest TOFU",
        name_ja: "スゴイツヨイトウフ",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2408680/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A tightly crafted, single-button precision platformer in which you play a living block of tofu, developed by Zounoashi Games (the doujin and indie circle of TomozovP and Masaki Meguro) and published by the Japanese indie label Phoenixx. Everything runs on one move: crouch, charge, and release to hurl yourself in any direction, tuning the height, angle, and mid-air control of a single jump with precision, and body-slamming into enemies to defeat them and into obstacles to break them. The catch is that tofu is fragile, and the game turns that fragility into its difficulty dial with three kinds you can choose: koya (freeze-dried) tofu is sturdy and plays with no time limit for beginners, momen (firm) tofu takes fall damage for intermediate players, and kinu (silken) tofu slides on slippery physics for experts. Each stage ends when you reach a bowl of miso soup, there are boss stages along the way, and power-ups reshape the run: atsuage (thick fried tofu) makes you huge and lets you smash through everything, while aburaage (thin fried tofu) boosts your jump. It leans hard on haptics, the feel of each charged leap, carries music by Ryo Nagamatsu, and folds in affectionate homage stages to Super Mario Bros. and Donkey Kong, all as a deliberately compact one-to-two-hour experience with no padding. Released on October 2, 2024, Tofu Day in Japan, and the grand-prize winner of the first GYAAR Studio Indie Game Contest, with a Nintendo Switch version following in February 2025, it is Very Positive at 99 percent over 355 reviews (352 positive), a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. It already supports English alongside Japanese, Simplified and Traditional Chinese, and Korean, yet only 43 of its 355 reviews are in English (about 12.1 percent); every one of those English reviews is positive, but the Steam English-speaking world has only just begun to find it.",
        desc_ja: "あなたが操るのは、生きた豆腐の塊——たった一つのボタンで遊ぶ、緻密に作り込まれた精密プラットフォーマーだ。開発元は ゾウノアシゲームズ（トモぞヴP と目黒将希の同人／インディーサークル）、販売元は日本のインディー系レーベル Phoenixx。遊びのすべては、一つの動きに集約される——しゃがみ、力を溜め、離して任意の方向へ跳ぶ。その一回の跳躍の高さ・角度・空中制御を精密に調整し、敵には体当たりで撃破し、障害物には体当たりで破壊する。ただし豆腐は脆い。本作はその脆さを難度のダイヤルに変えていて、三種から選べる——高野豆腐は頑丈で時間無制限、初心者向け。木綿豆腐は落下ダメージを受ける中級者向け。絹ごし豆腐は滑る物理で滑走する上級者向けだ。各ステージは味噌汁の椀にたどり着けばクリア、道中にはボス面もあり、パワーアップが遊びを組み替える——厚揚げは巨大化してあらゆるものを破壊でき、油揚げは跳躍力を上げる。ハプティクス（触覚フィードバック）に強く寄せ、溜めた一跳びの手触りを核に据え、永井崚（Ryo Nagamatsu）の楽曲を擁し、スーパーマリオブラザーズやドンキーコングへの愛あるオマージュ面を織り込む——そのすべてを、水増しのない、意図的にコンパクトな1〜2時間の体験にまとめている。2024年10月2日（日本の「とうふの日」）にリリースされ、第1回 GYAAR Studio インディーゲームコンテストの大賞を受賞、2025年2月には Nintendo Switch 版も登場した。355レビュー99%（好評352）で非常に好評。無料ではない有料作で、アーリーアクセスでもない正式リリース済み。AI生成アセットはなく、Steam 自身のコンテンツディスクリプタ上、性的な要素もない。すでに英語に、日本語・簡体字／繁体字中国語・韓国語と並んで対応しているが、355件のうち英語レビューは43件（約12.1%）にとどまる——その43件はすべて好評だが、Steam の英語圏は、この一本をまだ見つけ始めたばかりだ。",
      },
      {
        name_en: "Super Mario Bros.",
        name_ja: "スーパーマリオブラザーズ",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Super_Mario_Bros.",
        wikidata: "https://www.wikidata.org/wiki/Q11168",
        tag_en: "The platformer origin",
        tag_ja: "プラットフォーマーの原点",
        desc_en: "The origin of this taste: Super Mario Bros., a side-scrolling platformer developed and published by Nintendo, released for the Family Computer in Japan in 1985 and worldwide on the NES. You run and jump through side-scrolling stages, stomping enemies, gathering power-ups that change what the hero can do, and racing to a goal at the end of each course, with fortress boss encounters along the way. As the game that crystallized and popularized the side-scrolling action platformer, it is one of the most influential video games ever made and the foundational origin of the run-jump-stomp-and-reach-the-goal platformer lineage. That skeleton is the root The Strongest TOFU grows from: it keeps the running, jumping, stomping, power-ups, boss stages, and the goal at the end of each course, but rebuilds the jump itself into a single charge-and-release move, casts you as a fragile block of tofu whose three varieties set the difficulty, swaps the goal for a bowl of miso soup, and even folds in explicit homage stages, so the homage runs both ways. The 1985 game has no Steam release, so the origin is anchored here to its Wikidata entry, with its Wikipedia page as the reference point.",
        desc_ja: "この味の原点——スーパーマリオブラザーズ。任天堂が開発・発売した横スクロールのプラットフォーマーで、1985年に日本でファミリーコンピュータ向けに、そして世界では NES 向けに発売された。プレイヤーは横スクロールのステージを走り、跳び、敵を踏みつけ、主人公にできることを変えるパワーアップを拾い、各コースの終端にあるゴールを目指す——道中には砦のボスも待ち受ける。横スクロール・アクションプラットフォーマーを結晶化させ広く知らしめた作品として、史上最も影響力の大きいビデオゲームの一つであり、「走り、跳び、敵を踏み、ゴールを目指す」プラットフォーマーの系譜の礎となる原点だ。この骨格こそ、スゴイツヨイトウフが育つ根である。本作は、走り・跳び・踏み・パワーアップ・ボス面・各コース終端のゴールを受け継ぎながら、跳躍そのものを単一の「溜めて離す」動きへと組み直し、あなたを脆い豆腐の塊——三種の豆腐が難度を決める——に据え、ゴールを味噌汁の椀へと差し替え、そのうえで明示的なオマージュ面まで織り込む。だからオマージュは双方向に流れる。1985年の原作に Steam 版は存在せず、その原点は Wikidata のエントリで——Wikipedia のページを参照点として——同定する。",
      },
    ],
    en: {
      title: "The Strongest TOFU - a single-button precision platformer where you are a fragile block of tofu that charges one jump to slam through enemies and reach a bowl of miso soup, a Japanese indie heir to Super Mario Bros. the Steam West has only begun to find",
      description: "A tightly crafted, single-button precision platformer in which you play a living block of tofu, by Zounoashi Games (the doujin circle of TomozovP and Masaki Meguro) and published by the Japanese indie label Phoenixx. Everything runs on one move: crouch, charge, and release to hurl yourself in any direction, precisely tuning a single jump, body-slamming enemies and breaking obstacles. Tofu is fragile, and that fragility is the difficulty dial: pick koya (sturdy, no time limit), momen (takes fall damage), or kinu (slides on slippery physics). Reach the bowl of miso soup at each stage's end, face bosses, and use power-ups (atsuage to grow huge and smash through everything, aburaage to jump higher). Haptics-focused, with music by Ryo Nagamatsu and homage stages to Super Mario Bros. and Donkey Kong, all in a deliberately tight one-to-two-hour run. Very Positive at 99 percent over 355 reviews; it supports English, yet with only about 12.1 percent English reviews the Steam West has only begun to find it.",
      h1a: "You are a block of tofu, and your one move is to crouch, charge, and hurl yourself. ",
      h1flip: "Aim that single jump precisely and you slam through enemies and walls, but tofu is fragile, and one careless landing can shatter the run",
      h1b: ".",
      lede: "A tightly crafted, single-button precision platformer in which you play a living block of tofu, developed by Zounoashi Games (the doujin and indie circle of TomozovP and Masaki Meguro) and published by the Japanese indie label Phoenixx. Everything runs on one move: crouch, charge, and release to hurl yourself in any direction, tuning the height, angle, and mid-air control of a single jump with precision, and body-slamming into enemies to defeat them and into obstacles to break them. The catch is that tofu is fragile, and the game turns that fragility into its difficulty dial with three kinds you choose: koya (freeze-dried) tofu is sturdy and plays with no time limit for beginners, momen (firm) tofu takes fall damage for intermediate players, and kinu (silken) tofu slides on slippery physics for experts. Each stage ends when you reach a bowl of miso soup, boss stages wait along the way, and power-ups reshape the run: atsuage makes you huge and smashes through everything, aburaage boosts your jump. It leans hard on haptics and folds in homage stages to Super Mario Bros. and Donkey Kong, all as a deliberately compact one-to-two-hour experience with no padding. In the lineage of Super Mario Bros. It already supports English, yet the Steam English-speaking world has only begun to find it.",
      s1: "First, the one feeling",
      feeling: [
        "The whole game is one button. You crouch, charge, and release, and everything the game asks is that you shape that single leap, its height, its angle, its little corrections in the air, precisely enough to land where you meant to and to body-slam through the enemy or the wall in your way. The design leans hard into haptics, the feel of the charge and the release in your hands, so mastering one jump is not a warm-up for the game, it is the game.",
        "Tofu is fragile, and the game makes that fragility the point rather than a flaw. You choose your difficulty by choosing your tofu: koya, the sturdy freeze-dried kind, plays with no time limit for beginners; momen, firm tofu, starts taking fall damage; kinu, silken tofu, slides on slippery physics for experts. The same stages become three different tests depending on which block you are, so a careless landing that a beginner shrugs off can shatter an expert's run.",
        "Under the precision runs a playful, tactile loop. Each stage ends not at a flagpole but at a bowl of miso soup, boss stages break the rhythm, and power-ups swing the feel wide open, atsuage turning you huge enough to smash through everything, aburaage sending your jump higher, with affectionate homage stages nodding back to Super Mario Bros. and Donkey Kong. It is built as a deliberately tight one-to-two-hour run with no padding, a game designed around the density of one perfectly judged jump rather than around length.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love precise, single-mechanic platformers where the whole game is mastering one move, here a charge-and-release jump you aim in any direction to slam through enemies and reach the goal, descended from the run-jump-stomp of Super Mario Bros. but rebuilt around a fragile block of tofu",
        "You want difficulty you set through the material itself, three kinds of tofu (koya with no time limit, momen that takes fall damage, kinu that slides on slippery physics) reshaping the same stages, plus miso-soup goals, boss stages, power-ups (atsuage to grow huge and smash everything, aburaage to jump higher), haptics tuned to each leap, and playful homages to Super Mario Bros. and Donkey Kong",
        "You want a Japanese indie gem the Steam West has barely found, Very Positive at 99 percent over 355 reviews, the grand-prize winner of the first GYAAR Studio Indie Game Contest, made by Zounoashi Games and published by Phoenixx, already supporting English",
      ],
      bad: [
        "You want a long game to sink dozens of hours into; this is a deliberately compact one-to-two-hour precision platformer with no padding, built around the feel and replay of a single charge jump rather than around length",
        "You expect a big-publisher, already-popular Western title, or you want something free; this is a paid Japanese indie and doujin work by Zounoashi Games (published by Phoenixx), not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's descriptors, and its audience is still overwhelmingly Japanese, with only about 12.1 percent of its reviews in English (though every one of those 43 English reviews is positive)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "スゴイツヨイトウフ - 脆い豆腐を操り、たった一つの溜めジャンプで敵を突き破り味噌汁の椀を目指す、単一ボタンの精密プラットフォーマー。スーパーマリオブラザーズの系譜、Steam の西がまだ見つけ始めたばかりの、日本のインディーの一本",
      description: "あなたが操るのは、生きた豆腐の塊——たった一つのボタンで遊ぶ、緻密に作り込まれた精密プラットフォーマー。開発元は ゾウノアシゲームズ（トモぞヴP と目黒将希の同人サークル）、販売元は日本のインディー系レーベル Phoenixx。遊びのすべては一つの動きに集約される——しゃがみ、力を溜め、離して任意の方向へ跳ぶ。その一跳びを精密に調整し、敵には体当たりで撃破し、障害物を破壊する。豆腐は脆く、その脆さが難度のダイヤルだ——高野（頑丈・時間無制限）、木綿（落下ダメージ）、絹ごし（滑る物理）から選ぶ。各ステージ終端の味噌汁の椀を目指し、ボス面に挑み、パワーアップを使う（厚揚げで巨大化しあらゆるものを破壊、油揚げで跳躍力アップ）。ハプティクス重視、永井崚の楽曲、スーパーマリオブラザーズやドンキーコングへのオマージュ面を、水増しのない1〜2時間にまとめている。355レビュー99%で非常に好評。英語に対応済みだが、英語レビューは約12.1%——Steam の西は、この一本をまだ見つけ始めたばかりだ。",
      h1a: "あなたは、豆腐の塊。できることはただ一つ——しゃがみ、力を溜め、身を投げること。",
      h1flip: "その一跳びを精密に狙えば、敵も壁も突き破る。だが豆腐は脆く、たった一度の雑な着地が、そのランを砕く",
      h1b: "。",
      lede: "あなたが操るのは、生きた豆腐の塊——たった一つのボタンで遊ぶ、緻密に作り込まれた精密プラットフォーマーだ。開発元は ゾウノアシゲームズ（トモぞヴP と目黒将希の同人／インディーサークル）、販売元は日本のインディー系レーベル Phoenixx。遊びのすべては、一つの動きに集約される——しゃがみ、力を溜め、離して任意の方向へ跳ぶ。その一回の跳躍の高さ・角度・空中制御を精密に調整し、敵には体当たりで撃破し、障害物には体当たりで破壊する。ただし豆腐は脆い。本作はその脆さを難度のダイヤルに変えていて、三種から選べる——高野豆腐は頑丈で時間無制限、初心者向け。木綿豆腐は落下ダメージを受ける中級者向け。絹ごし豆腐は滑る物理で滑走する上級者向けだ。各ステージは味噌汁の椀にたどり着けばクリア、道中にはボス面もあり、パワーアップが遊びを組み替える——厚揚げは巨大化してあらゆるものを破壊でき、油揚げは跳躍力を上げる。ハプティクスに強く寄せ、スーパーマリオブラザーズやドンキーコングへのオマージュ面を織り込み、そのすべてを水増しのない、意図的にコンパクトな1〜2時間の体験にまとめている。スーパーマリオブラザーズの系譜に連なる一本。すでに英語に対応しているが、Steam の英語圏は、この一本をまだ見つけ始めたばかりだ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ゲームのすべては、たった一つのボタンだ。しゃがみ、溜め、離す——ゲームが求めるのはただ、その一跳びを、高さも、角度も、空中でのわずかな補正も、狙った場所に着地し、行く手を阻む敵や壁を体当たりで突き破れるほど精密に、かたち作ることだけ。設計はハプティクス——溜めと解放の、手のなかの手触り——に強く寄せていて、だから一つの跳躍を極めることは、ゲームの準備運動ではなく、ゲームそのものになる。",
        "豆腐は脆い。そして本作は、その脆さを欠点ではなく主眼に据える。あなたは、自分の豆腐を選ぶことで難度を選ぶ——頑丈な高野豆腐は時間無制限で初心者向け、木綿豆腐は落下ダメージを受けはじめ、絹ごし豆腐は滑る物理で滑走する上級者向けだ。同じステージが、どの豆腐であるかによって三つの異なる試練になる。だから、初心者なら受け流せる雑な着地が、上級者のランを砕きうる。",
        "その精密さの下には、遊び心のある、触覚的なループが流れている。各ステージが終わるのは旗竿ではなく、味噌汁の椀。ボス面がリズムを断ち切り、パワーアップが手触りを大きく振る——厚揚げはあらゆるものを砕けるほど巨大化させ、油揚げは跳躍をより高くする。そしてスーパーマリオブラザーズやドンキーコングへ愛を込めて頷き返すオマージュ面がある。本作は、意図的に引き締まった、水増しのない1〜2時間のランとして作られている——長さではなく、完璧に見極めた一跳びの密度をめぐって設計されたゲームだ。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "たった一つの動きを極めることがすべての、精密な単一メカのプラットフォーマーが好きな人——ここではそれが、任意方向へ狙って敵を突き破り、ゴールを目指す「溜めて離す」跳躍だ。スーパーマリオブラザーズの走り・跳び・踏みから受け継がれながら、脆い豆腐の塊を核に組み直されている",
        "素材そのもので難度を決めたい人——三種の豆腐（時間無制限の高野、落下ダメージの木綿、滑る物理の絹ごし）が同じステージを組み替え、味噌汁のゴール、ボス面、パワーアップ（巨大化してすべてを砕く厚揚げ、跳躍を上げる油揚げ）、一跳びごとに調整されたハプティクス、そしてスーパーマリオブラザーズやドンキーコングへの遊び心あるオマージュがある",
        "Steam の西がまだほとんど見つけていない、日本のインディーの原石が欲しい人——355レビュー99%で非常に好評、第1回 GYAAR Studio インディーゲームコンテスト大賞受賞作、ゾウノアシゲームズが手がけ、Phoenixx が販売する、英語に対応済みの一本",
      ],
      bad: [
        "何十時間も費やせる長いゲームが欲しい人（本作は、意図的にコンパクトな1〜2時間の精密プラットフォーマーで、水増しは無く、長さではなく、一つの溜めジャンプの手触りと反復をめぐって作られている）",
        "大手パブリッシャーの、すでに西で人気の大作を期待する人、あるいは無料のものが欲しい人（本作は ゾウノアシゲームズ による有料のインディー／同人作で——販売は Phoenixx——無料でもアーリーアクセスでもない。AI生成アセットはなく、Steam のディスクリプタ上、性的な要素もない。受け手の中心はいまも圧倒的に日本語圏で、英語レビューは約12.1%にとどまる。ただし、その43件の英語レビューはすべて好評だ）",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "clock-rogue": {
    published: "2026-07-05",
    publishAt: "2026-07-05",
    kind: "find",
    leadIndex: 0,
    // reviewBand は持たせない: 112 件は demigoddess(同じ112件)と同帯で "hundreds"(数百)と言い切るには境界的
    //   (誇張しない)。rarity.reviews=112 を確定値でそのまま出す。英語対応済み(10言語中の1つ)で
    //   noEnglish=false(誤って「英語非対応」stampを立てない・正直さ)。英語レビュー 16/112=14.3%・西未浸透 =
    //   reachState="unreached_west"。obscurity は "deep"(レビュー僅少・西で無名)。系譜は Loop Hero——自分で
    //   周回構造(円環ボード)を組み、その進行が配置した効果を発火させる骨格が、時計盤上に技を配置し発動
    //   タイミングを組む Clock Rogue の骨格と一致(lineage_anchor_key=steam_url, appid 1282730 で同定)。
    meta: { genre: "roguelike", lineage: "loop-hero", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 112, positivePct: 99, noEnglish: false } },
    games: [
      {
        name_en: "Clock Rogue",
        name_ja: "Clock Rogue",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2812120/Clock_Rogue/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A body-clock roguelike action game developed solo by MONO ENTERTAINMENT, an individual Japanese indie developer based in Tokyo, and published by Phoenixx Inc., a mid-size Japanese indie publisher. No timer is ever shown on screen: you feel out the passage of time inside your own head, stop a stopwatch at the moment you judge to be right, and the instant you stop it a skill locks onto whatever position on a clock face your stop lands on, triggering if it lands inside that skill's window. The catch is that power costs precision: the stronger a skill, the narrower the window of the dial it must land inside to fire, while the weaker skills forgive a wide sweep of the clock face. Every enemy you defeat opens a three-choice draft of new skills, and across a run you place each pick onto the dial yourself, building a clock face that is entirely your own, positioned and timed rather than simply collected. The setting casts you inside the body of a hedgehog, where you play a Hari Cell (a spine-based immune cell), holding the line against a viral invasion from within. Released on November 7, 2024, it is Very Positive at 99 percent over 112 reviews, a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. It supports English alongside Japanese, French, Italian, German, Spanish (Spain), Brazilian Portuguese, Simplified and Traditional Chinese, and Korean, all as localizations of a game both developed and published in Japan, yet with only 16 of its 112 reviews in English (about 14.3 percent), the West has barely found it.",
        desc_ja: "体内時計ローグライクアクション。開発は MONO ENTERTAINMENT——東京を拠点とする個人インディー開発者が一人で手がけ、販売は日本の中堅インディーパブリッシャー Phoenixx Inc. が担う。画面にタイマーは一切表示されない——時間の経過を自分の頭の中だけで感じ取り、「ここだ」と判断した瞬間にストップウォッチを止める。止めた瞬間、技はその停止が着地した時計盤上の位置に固定され、その技の許容幅の内側に着地していれば発動する。ただし、力には精密さという代償が伴う——強い技ほど、発動に必要な盤面上の幅は狭く、弱い技ほど、盤面を広く撫でても許される。敵を一体倒すたびに、新しい技の3択ドラフトが開かれ、ランを通してその一枚一枚を自分の手で時計盤に配置していく——ただ集めるのではなく、位置とタイミングで組み上げる、完全に自分だけの時計盤だ。舞台はハリネズミの体内、プレイヤーは「ハリ細胞」（棘由来の免疫細胞）となり、内側からのウイルスの侵入を食い止める。2024年11月7日リリース、112レビュー99%で非常に好評。無料ではない有料作で、アーリーアクセスでもない正式リリース済み。AI生成アセットはなく、Steam 自身のコンテンツディスクリプタ上、性的な要素もない。英語のほか、日本語・フランス語・イタリア語・ドイツ語・スペイン語（スペイン）・ポルトガル語（ブラジル）・簡体字/繁体字中国語・韓国語に対応——いずれも日本で開発・販売される一本のローカライズであり、112件のうち英語レビューは16件（約14.3%）にとどまる——西はこの一本を、まだほとんど見つけていない。",
      },
      {
        name_en: "Loop Hero",
        name_ja: "Loop Hero",
        status: "established",
        steam: "https://store.steampowered.com/app/1282730/Loop_Hero/",
        tag_en: "The loop-building origin",
        tag_ja: "周回構築の原点",
        desc_en: "The origin of this taste: Loop Hero, a roguelike developed by Four Quarters and published by Devolver Digital, released in March 2021. There is no map to walk and no direct command over the fight itself: a hero advances automatically along a looping road, engaging whatever the player has placed there, while the entire game is the act of laying terrain, building, and enemy cards along and around that loop, cards that both construct the world the hero passes through and generate the resources and threats within it. Loot recovered along the way and camp upgrades built between runs carry a player's progress forward, but the loop itself, built card by card rather than fought move by move, is the whole design. It crystallized the idea of a roguelike where you build the very structure that then plays itself, and is the origin of the lineage of games in which arranging placed effects along an automatic progression, not directly controlling the action, is the entire game. That core, that you do not fight in real time so much as you construct the progression that fights for you, is the root Clock Rogue grows from, keeping the built-not-fought loop but rebuilding it around a hidden internal clock, where the loop becomes a dial, the cards become skills placed by precisely timed position, and automatic movement becomes a stopwatch you must stop yourself.",
        desc_ja: "この味の原点——Loop Hero。Four Quarters が開発し Devolver Digital が販売したローグライクで、2021年3月に発売された。歩き回る地図は無く、戦闘そのものを直接指揮することもない——主人公は周回する道を自動で進み、そこに置かれたものと自動的に交戦する。プレイヤーの仕事はすべて、その周回に沿って地形・建物・敵のカードを配置することにある。そのカードは、主人公が進む世界そのものを構築すると同時に、そこに現れるリソースと脅威を生み出す。道中で拾う戦利品や、ラン間で積み上げる野営地の強化がプレイヤーの進歩を次へ運ぶが、一手ずつ戦って進めるのではなく、一枚ずつ組んで作る周回そのものが、設計のすべてだ。「自ら組んだ構造が、勝手に進行していく」というローグライクの発想を結晶化させた作品であり、直接アクションを操作するのではなく、自動で進む周回に沿って配置した効果を組み立てることがゲームのすべてになる——その系譜の原点である。この核——リアルタイムで戦うのではなく、自分の代わりに戦ってくれる進行そのものを組み立てる——こそ、Clock Rogue が育つ根だ。本作は「戦うのではなく組む」周回を受け継ぎながら、それを隠された体内時計へと組み直す。周回は時計盤になり、カードは精密なタイミングの位置で置かれる技になり、自動の移動は、自分自身で止めなければならないストップウォッチになる。",
      },
    ],
    en: {
      title: "Clock Rogue - a body-clock roguelike action game where you count an unseen timer in your head, stop it at the instant you choose, and place a skill on a clock face whose timing window narrows the stronger it hits, drafting three choices after every kill to build your own dial as a Hari Cell defending a hedgehog's body from viral invasion, a Japanese indie heir to Loop Hero the West has barely found",
      description: "A body-clock roguelike action game by MONO ENTERTAINMENT, an individual Japanese indie developer based in Tokyo, published by the Japanese indie publisher Phoenixx Inc. No timer is shown on screen: you count the passage of time in your head, stop a hidden stopwatch, and place a skill at the position on a clock face where it needs to land to trigger. The stronger the skill, the narrower its timing window; the weaker the skill, the wider. After every enemy you defeat, a three-choice draft lets you add to your own clock face. Set inside the body of a hedgehog, you play a Hari Cell defending it from viral invasion. In the lineage of Loop Hero, where you build the loop that plays itself rather than directly controlling the fight. Very Positive at 99 percent over 112 reviews; it supports English among ten languages, yet with only about 14.3 percent of its reviews in English, the West has barely found it.",
      h1a: "You never see the clock. ",
      h1flip: "You count it in your head, and you have to stop it at the exact instant your skill needs to land",
      h1b: ".",
      lede: "A body-clock roguelike action game developed solo by MONO ENTERTAINMENT, an individual Japanese indie developer based in Tokyo, and published by Phoenixx Inc., a mid-size Japanese indie publisher. No timer is ever shown on screen: you feel out the passage of time inside your own head, stop a stopwatch at the moment you judge to be right, and the instant you stop it a skill locks onto whatever position on a clock face your stop lands on, triggering if it lands inside that skill's window. The stronger a skill, the narrower the window it must land inside to fire; the weaker skills forgive a wide sweep of the clock face. Every enemy you defeat opens a three-choice draft of new skills, and across a run you place each pick onto the dial yourself, building a clock face that is entirely your own. The setting casts you inside the body of a hedgehog, where you play a Hari Cell, holding the line against a viral invasion from within. In the lineage of Loop Hero. It already supports English among ten languages, yet the West has barely found it.",
      s1: "First, the one feeling",
      feeling: [
        "The core loop hides its own clock. No stopwatch, no timer bar is shown on screen: you feel out the beat in your head, and you have to stop that private count and lock a skill onto a spot on the dial at the exact instant it needs to land. The game trusts your internal rhythm more than your eyes, so the tension is not whether you can react to what you see, it is whether you actually know how much time has passed.",
        "Where you stop is also where you build. Placing a skill on the clock face is not choosing from a menu, it is choosing a position, and the strength of a skill is paid for in precision: the stronger it hits, the narrower the window you must land inside to trigger it, while the weaker ones forgive a wide sweep of the dial. Every skill you draft is also a bet on how tightly you can trust your own timing.",
        "After every kill, a three-choice draft hands you the next piece of your dial, and across a run you are not filling a deck, you are laying out a face, deciding which narrow-window powerhouses and wide-window safety nets sit where relative to each other. Wrapped around that build is the frame of a Hari Cell inside a hedgehog's body, holding the line against a viral invasion from within, so the abstraction of a clock face becomes, in fiction, an immune system you are personally assembling.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Loop Hero and the idea of building the loop that plays itself rather than controlling the fight directly, and you want that turned into a precision timing game where a position on a clock face, not a card in a deck, is the unit of your build",
        "You want a roguelike where risk is measured in timing windows, narrower margins for stronger skills and wider ones for weaker skills, drafted three at a time after every kill into a clock face that is different every run",
        "You want a Japanese indie gem the West has barely found, Very Positive at 99 percent over 112 reviews, made solo by MONO ENTERTAINMENT and published by Phoenixx Inc., already supporting English among ten languages",
      ],
      bad: [
        "You want visible timers, clear on-screen cues, and reflex-based action; this game deliberately hides the clock and asks you to trust an internal count instead of your eyes, so the whole pull is precision built on your own sense of time, not on what you can see",
        "You expect a big-publisher, already-popular Western title, or you want something free; this is a paid solo indie work by MONO ENTERTAINMENT, published by the Japanese indie publisher Phoenixx Inc., not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's descriptors, and its audience is still mostly Japanese, with only about 14.3 percent of its reviews in English",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Clock Rogue - 表示されない時間を頭の中で数え、狙った瞬間にストップウォッチを止めて時計盤に技を配置する体内時計ローグライクアクション。強い技ほど発動の許容幅は狭く、敵を倒すたびの3択ドラフトで自分だけの時計盤を組む。ハリネズミの体内で「ハリ細胞」としてウイルスの侵入から体を守る。Loop Hero の系譜、西がまだほとんど見つけていない日本のインディーの一本",
      description: "開発は MONO ENTERTAINMENT——東京を拠点とする個人インディー開発者。販売は日本のインディーパブリッシャー Phoenixx Inc.。画面にタイマーは表示されない——頭の中で時間の経過を数え、隠されたストップウォッチを止め、時計盤上のその技が発動に必要とする位置へ配置する。強い技ほど発動タイミングの許容幅は狭く、弱い技ほど広い。敵を倒すたびに3択のドラフトで、自分だけの時計盤に技を加えていく。舞台はハリネズミの体内、プレイヤーは「ハリ細胞」としてウイルスの侵入から体を守る。Loop Hero の系譜——戦闘を直接操作するのではなく、勝手に進行する周回そのものを組み立てる系譜——に連なる一本。10の言語のなかに英語も含め対応済みだが、レビューのうち英語は約14.3%——西はこの一本を、まだほとんど見つけていない。",
      h1a: "時計は、見えない。",
      h1flip: "頭の中で数え、技が着地すべき瞬間ぴったりで、自分の手で止めなければならない",
      h1b: "。",
      lede: "体内時計ローグライクアクション。開発は MONO ENTERTAINMENT——東京を拠点とする個人インディー開発者が一人で手がけ、販売は日本の中堅インディーパブリッシャー Phoenixx Inc. が担う。画面にタイマーは一切表示されない——時間の経過を自分の頭の中だけで感じ取り、「ここだ」と判断した瞬間にストップウォッチを止める。止めた瞬間、技はその停止が着地した時計盤上の位置に固定され、その技の許容幅の内側に着地していれば発動する。強い技ほど、発動に必要な盤面上の幅は狭く、弱い技ほど、盤面を広く撫でても許される。敵を一体倒すたびに、新しい技の3択ドラフトが開かれ、ランを通してその一枚一枚を自分の手で時計盤に配置していく——完全に自分だけの時計盤だ。舞台はハリネズミの体内、プレイヤーは「ハリ細胞」となり、内側からのウイルスの侵入を食い止める。Loop Hero の系譜に連なる一本。10の言語のなかに英語もすでに対応済みだが、西はこの一本を、まだほとんど見つけていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "核となるループは、時計そのものを隠している。画面にストップウォッチもタイマーバーも表示されない——頭の中でリズムを数え、その心の中だけの計測を、狙った瞬間に止めて、時計盤上の位置に技を固定しなければならない。ゲームは目に見えるものより、あなたの内的なリズムを信じている。だから緊張感は「見えたものに反応できるか」ではなく「本当に、どれだけ時間が経ったかを知っているか」にある。",
        "止めた場所こそが、組む場所になる。時計盤に技を置くことは、メニューから選ぶことではなく、位置を選ぶことだ。そして技の強さは精密さで支払われる——強い技ほど、発動させるために着地しなければならない幅は狭く、弱い技ほど、盤面を広く撫でても許される。だからドラフトで選ぶ技のひとつひとつが、自分の計測をどこまで信じられるかへの賭けになる。",
        "敵を倒すたびに、3択のドラフトが時計盤の次の一片を差し出す。ランを通して積み上げるのはデッキではなく、盤面そのもの——狭い許容幅を持つ火力と、広い許容幅を持つ安全網を、どこに置き、どう隣り合わせるかを決めていく。その構築を包むのは、ハリネズミの体内で、内側からのウイルスの侵入を食い止める「ハリ細胞」という枠組みだ。時計盤という抽象が、物語の上では、自分の手で組み上げる免疫システムになる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Loop Hero と、戦闘を直接操作するのではなく、勝手に進行する周回そのものを組み立てる発想が好きな人——本作はそれを、デッキの一枚ではなく時計盤上の「位置」が構築の単位になる、精密なタイミングゲームへと組み替えている",
        "リスクを「発動タイミングの許容幅」で測るローグライクが欲しい人——強い技ほど狭く、弱い技ほど広い許容幅を、敵を倒すたびの3択ドラフトで時計盤に足していく。盤面はランごとに違う顔を持つ",
        "西がまだほとんど見つけていない、日本のインディーの原石が欲しい人——112レビュー99%で非常に好評、MONO ENTERTAINMENT が一人で手がけ、Phoenixx Inc. が販売する一本。10の言語のなかに英語もすでに含まれている",
      ],
      bad: [
        "見えるタイマーや、はっきりした画面上の合図、反射神経で決まるアクションが欲しい人（本作はあえて時計を隠し、目に見えるものではなく、自分の内的な計測を信じることを求める。だから引力は、見えるものではなく、自分自身の時間感覚の上に築かれる精密さにある）",
        "大手パブリッシャーの、すでに西で人気の大作を期待する人、あるいは無料のものが欲しい人（本作は MONO ENTERTAINMENT による有料のソロ・インディー作で——販売は日本のインディーパブリッシャー Phoenixx Inc.——無料でもアーリーアクセスでもない。AI生成アセットはなく、Steam のディスクリプタ上、性的な要素もない。受け手の中心はいまも日本語圏で、英語レビューは約14.3%にとどまる）",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "drapline": {
    published: "2026-07-05",
    publishAt: "2026-07-05",
    kind: "find",
    leadIndex: 0,
    // reviewBand は "around_1k"(1,720件は千前後の水準・tokimeki-memorial の1,842件/after-burner の2,504件と
    //   同水準)。obscurity は "deep"(西で無名帯)——noEnglish=false(英語・日本語・簡体字中国語に対応済み)の
    //   ため lang_walled は使わない(誤って「英語非対応」stampを立てない・正直さ)。英語レビュー 265/1720=15.4%で
    //   西未浸透 = reachState="unreached_west"。genre は新設 "raising-roguelite"(育成ローグライト): 週単位の
    //   食事選択で育て、職場ドラフトで得た技を最大5つ組んで戦うローグライト構造は、既存の "raising-sim"
    //   (スケジューリングのみ)や "roguelike" 単体よりこの専用ラベルに正確に当てはまる(strongest-tofu 型の
    //   細粒度ラベル追加)。系譜は プリンセスメーカー(Princess Maker)——開発者インタビュー(Game*Spark誌、
    //   2025年7月)で本人が「育成の理想」として名指し、4Gamerレビューも独立に同作を比較対象に挙げ二重確証
    //   (lineage_anchor_key=steam_url, appid 583040 で同定・既存の "princess-maker-2" anchor とは別ゲーム)。
    meta: { genre: "raising-roguelite", lineage: "princess-maker", obscurity: "deep", reviewBand: "around_1k", reachState: "unreached_west", rarity: { reviews: 1720, positivePct: 96, noEnglish: false } },
    games: [
      {
        name_en: "DRAPLINE",
        name_ja: "DRAPLINE（ドラプリン）",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3103780/DRAPLINE/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A body-and-diet raising roguelite in which you spend one year, week by week, feeding a dragon girl who will eat absolutely anything and training her into the strongest creature alive to face down an impending catastrophe, developed by KANAWO, an individual Japanese doujin creator best known for Noel the Mortal Fate (Higyaku no Noel), together with the Tokyo (Nakano-based) indie publisher Vaka Game Magazine. Each week you pick one of three meals set in front of her, meat, a rock, molten lava, and whatever else the game finds to feed her, and each choice raises a different stat while nudging a WILD/RULE personality axis that quietly reshapes her appearance, unlocks branching events, alters battle buffs, and ultimately decides which of the game's endings you reach. Between meals she goes to work, and work is where her real arsenal comes from: a pool of roughly 100 to 150 skills you draft from and equip up to five at a time, building combat synergies to take into battle. A full run is designed to last about an hour, and clearing one unlocks New Game Plus bonuses that ease the difficulty for the next attempt, so the whole loop is built to be replayed rather than finished once. The developer has named Princess Maker, Uma Musume Pretty Derby, and Monster Rancher as the raising-sim ideals behind it, credited Rance X for its combat feel, and pointed to the Atelier series for its setting and music (Game*Spark interview, July 2025), and 4Gamer's independent review reached for the same touchstones, Princess Maker, Monster Rancher, and Summon Night. Released into Early Access on June 29, 2025, it is Overwhelmingly Positive at 96 percent over 1,720 reviews, a paid title, not free, still in Early Access rather than fully launched, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. It fully supports Japanese, English, and Simplified Chinese, interface, voice acting, and subtitles alike across all three, yet only 265 of its 1,720 reviews are in English (about 15.4 percent), so the Steam West has barely begun to find it.",
        desc_ja: "何でも食べるドラゴン娘に餌を与え、1年間・週単位で「最強」へと鍛え上げ、迫りくる大災厄に立ち向かわせる、身体と食事の育成ローグライト。開発は KANAWO——「被虐のノエル」で知られる日本の個人ドゥジン作家——と、東京都中野区の日本のインディーパブリッシャー Vaka Game Magazine。毎週、目の前に並ぶ3つの食事——肉、岩、溶岩、その他ゲームが見つけてくるあらゆるもの——から1つを選ぶと、それぞれ異なるステータスが上昇すると同時に、「WILD/RULE」という性格指標がわずかに動く。この指標は、外見、派生イベント、戦闘バフ、そして最終的にどのエンディングへたどり着くかまでを、静かに決めていく。食事の合間には職場に出向き、そこでこそ本当の武器が手に入る——約100~150種のスキルプールから選び、最大5つまで装備して、戦いへ持ち込む戦闘シナジーを組み立てる。1周は約1時間で終わるよう設計されており、クリアすると「周回ボーナス」が解禁され、次の周回の難易度が緩和される——つまりループ全体が、一度きりで終わらせるのではなく、繰り返し遊ばれることを前提に作られている。開発者は「プリンセスメーカー」「ウマ娘プリティーダービー」「モンスターファーム」を育成の理想として名指しし、「ランスX」からゲーム性、「アトリエ」シリーズから世界観と音楽の影響を受けたと述べており(Game*Spark インタビュー、2025年7月)、4Gamerのレビューも独立に、「プリンセスメーカー」「モンスターファーム」「サモンナイト」を比較対象として挙げている。2025年6月29日にアーリーアクセスとして配信開始、1,720件のレビュー中96%が好評という「非常に好評」の評価。無料ではない有料作で、正式リリースではなくアーリーアクセス中。AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上、性的な要素もない。日本語・英語・簡体字中国語の3言語に、インターフェース・音声・字幕のいずれでも対応しているが、1,720件のうち英語レビューは265件(約15.4%)にとどまる——Steamの西側は、この一本をまだほとんど見つけていない。",
      },
      {
        name_en: "Princess Maker",
        name_ja: "プリンセスメーカー",
        status: "established",
        steam: "https://store.steampowered.com/app/583040/Princess_Maker_Refine/",
        tag_en: "The raising-sim origin",
        tag_ja: "育成シムの原点",
        desc_en: "The origin of this taste: Princess Maker, a raising simulation series produced by Gainax, whose first entry released in 1991 (the Refine edition on Steam was developed by CFK Co., Ltd. and published by Bliss Brain). You become the foster father of a young girl and spend a fixed span of years scheduling her days between education, work, and rest, watching stats accumulate until those choices branch into one of many possible endings, from royalty to ordinary professions. As the game that introduced the idea of raising your own daughter to the life-simulation genre, it crystallized the raising-sim loop of scheduling a life over a fixed period and letting accumulated choices decide its future, and is the foundational origin of the raising simulation lineage the developer of DRAPLINE has named directly as an ideal. That core, scheduling a life turn by turn and letting the choices you make along the way branch into an ending, is the root DRAPLINE grows from: it keeps the scheduled, choice-driven raising loop and the branching endings, but recasts the daughter as a dragon girl who eats anything, compresses the fixed span into one year told in weekly turns, and grafts on a roguelite draft of combat skills and a WILD/RULE personality axis that a Princess Maker save file never had.",
        desc_ja: "この味の原点——プリンセスメーカー。ガイナックスが手掛けた育成シミュレーションシリーズで、その第1作は1991年に発売された(Steam版はCFK Co., Ltd.が開発しBliss Brainが販売するRefine版)。プレイヤーは幼い娘の養父となり、一定期間の年月にわたって教育・仕事・休養へ日々の予定を割り振っていく。パラメータが積み上がっていくのを見守り、その選択の蓄積は、王侯貴族から市井の職業まで、数多のエンディングのいずれかへと分岐する。「自分の娘を育てる」という発想を育成シミュレーションのジャンルに導入した作品として、「一定期間、時間をスケジューリングし、積み上がった選択がその未来を決める」育成シムのループを結晶化させた、育成シミュレーションの系譜の礎となる原点であり、DRAPLINE の開発者自身が理想として名指ししている。この核——一手ずつ生活をスケジューリングし、道中の選択の蓄積がエンディングへ分岐する——こそ、DRAPLINE が育つ根だ。本作はそのスケジューリング型・選択駆動の育成ループと、分岐するエンディングを受け継ぎながら、娘を何でも食べるドラゴン娘へと据え替え、一定期間を1年間・週単位の周回へ圧縮し、プリンセスメーカーのセーブデータには無かった、戦闘スキルのローグライト・ドラフトと「WILD/RULE」性格指標を接ぎ木している。",
      },
    ],
    en: {
      title: "DRAPLINE - a raising roguelite where you spend one year, week by week, feeding a dragon girl who eats absolutely anything, choosing one of three weekly meals that shift a WILD/RULE personality axis reshaping her looks, events, and ending, then drafting from 100 to 150 workplace skills and equipping five at a time to build combat synergy against an impending catastrophe, a Japanese indie heir to Princess Maker the Steam West has barely found",
      description: "A raising roguelite by KANAWO, a Japanese doujin creator known for Noel the Mortal Fate, and the Tokyo indie publisher Vaka Game Magazine. Over one year told in weekly turns, you feed a dragon girl who eats anything, meat, a rock, molten lava, each meal choice raising a stat and nudging a WILD/RULE personality axis that reshapes her looks, events, battle buffs, and ending. Workplace drafts hand you skills from a pool of 100 to 150, up to five equipped at once, to build combat synergy against an impending catastrophe. Runs take about an hour, and clears unlock New Game Plus bonuses that ease the next attempt. Overwhelmingly Positive at 96 percent over 1,720 reviews; it supports English, yet with only about 15.4 percent English reviews the Steam West has barely found it.",
      h1a: "You feed a dragon girl who will eat absolutely anything, one meal a week, for a single year. ",
      h1flip: "Every bite you choose reshapes who she becomes, and the skills she drafts at work decide whether she is strong enough to face what is coming",
      h1b: ".",
      lede: "A body-and-diet raising roguelite in which you spend one year, week by week, feeding a dragon girl who will eat absolutely anything and training her into the strongest creature alive, developed by KANAWO, an individual Japanese doujin creator best known for Noel the Mortal Fate, together with the Tokyo indie publisher Vaka Game Magazine. Each week you choose one of three meals set in front of her, meat, a rock, molten lava, and whatever else the game finds to feed her, and each choice raises a different stat while nudging a WILD/RULE personality axis that quietly reshapes her appearance, unlocks branching events, alters battle buffs, and ultimately decides which ending you reach. Between meals she goes to work, and work is where her real arsenal comes from: a pool of roughly 100 to 150 skills you draft from and equip up to five at a time, building combat synergies to take into battle against the catastrophe the story keeps warning about. A full run is designed to last about an hour, and clearing one unlocks New Game Plus bonuses that ease the difficulty for the next attempt. In the lineage of Princess Maker. It already supports English alongside Japanese and Simplified Chinese, yet the Steam West has barely begun to find it.",
      s1: "First, the one feeling",
      feeling: [
        "Every week collapses into a single choice: one of three meals in front of a dragon girl who will eat anything, meat, a rock, molten lava. There is no right answer sitting outside the moment, because whichever bite you choose both raises a stat and nudges her WILD/RULE personality a little further one way, and that axis quietly rewrites her appearance, which events fire, which battle buffs she gets, and which of the many endings you are steering toward. You are not filling a stat bar, you are deciding who she becomes, one meal at a time, for a year you cannot take back.",
        "Work is where the actual build lives. Every trip to the job hands you a shot at a pool of roughly 100 to 150 skills, and you can only ever carry five of them onto the field, so every draft is a small argument with yourself about what to cut. The strength you assemble is not accumulated so much as curated, five choices that have to work together against the catastrophe the story keeps promising is coming, and a run that goes wrong is usually a build that never quite came together.",
        "The whole year is designed to fit inside about an hour, so a single run reads less like an epic and more like one sitting you can actually finish. And because clearing it unlocks New Game Plus bonuses that soften the next attempt, the loop is not built to be solved once, it is built to be re-fed, re-drafted, and re-raised, run after run, chasing a slightly different daughter each time.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Princess Maker and the idea of scheduling a life over a fixed period, choices accumulating into one of many endings, here compressed into weekly meals over a single year and rebuilt around a dragon girl instead of a daughter",
        "You want that raising loop paired with roguelite combat building: a WILD/RULE personality axis that reshapes her look, events, and battle buffs, and a workplace skill draft of roughly 100 to 150 skills where you can only ever equip five at a time",
        "You want a Japanese indie gem the Steam West has barely found, Overwhelmingly Positive at 96 percent over 1,720 reviews, made by the doujin creator KANAWO (of Noel the Mortal Fate) with the Tokyo indie publisher Vaka Game Magazine, already supporting English alongside Japanese and Simplified Chinese",
      ],
      bad: [
        "You want a finished, fully launched game rather than a work in progress; DRAPLINE entered Early Access on June 29, 2025 and is still being built out, and each run is a deliberately compact one-hour loop, not a long single sitting",
        "You expect a big-publisher, already-popular Western title, or you want something free; this is a paid solo doujin work by KANAWO published by the small Tokyo studio Vaka Game Magazine, not free, with no AI-generated assets and nothing sexual by Steam's descriptors, and its audience is still overwhelmingly Japanese-speaking, with only about 15.4 percent of its 1,720 reviews in English",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "DRAPLINE（ドラプリン） - 何でも食べるドラゴン娘に、1年間・週単位で餌を与えて育てる育成ローグライト。毎週3択の食事が「WILD/RULE」性格指標を動かし、外見・イベント・エンディングを分岐させ、職場で得る100~150種のスキルから5つを装備して迫る大災厄に挑む戦闘シナジーを組む。プリンセスメーカーの系譜、Steamの西側がまだほとんど見つけていない、日本のインディーの一本",
      description: "開発は KANAWO(「被虐のノエル」で知られる日本の個人ドゥジン作家)と、東京都中野区のインディーパブリッシャー Vaka Game Magazine。1年間を週単位のターンで描き、何でも食べるドラゴン娘に餌を与える——肉、岩、溶岩。食事の選択ごとにステータスが上がり、「WILD/RULE」性格指標が動いて外見・イベント・戦闘バフ・エンディングを分岐させる。職場のドラフトで100~150種のスキルプールから選び、最大5つを装備し、迫る大災厄に挑む戦闘シナジーを組む。1周は約1時間、クリアで次周の難易度を緩和する周回ボーナスが解禁される。1,720件のレビュー中96%が好評の「非常に好評」。英語に対応済みだが、英語レビューは約15.4%——Steamの西側は、この一本をまだほとんど見つけていない。",
      h1a: "何でも食べるドラゴン娘に、週に1度、1年間だけ餌を与える。",
      h1flip: "選んだ一口が、彼女が何者になるかを組み替え、職場で手にする技が、迫る災厄に立ち向かえるかを決める",
      h1b: "。",
      lede: "何でも食べるドラゴン娘に餌を与え、1年間・週単位で「最強」の生き物へと鍛え上げる、身体と食事の育成ローグライト。開発は KANAWO——「被虐のノエル」で知られる日本の個人ドゥジン作家——と、東京のインディーパブリッシャー Vaka Game Magazine。毎週、目の前に並ぶ3つの食事——肉、岩、溶岩、その他ゲームが見つけてくるあらゆるもの——から1つを選ぶと、それぞれ異なるステータスが上昇すると同時に、「WILD/RULE」という性格指標がわずかに動く。この指標は、外見、派生イベント、戦闘バフ、そして最終的にどのエンディングへたどり着くかまでを、静かに決めていく。食事の合間には職場に出向き、そこでこそ本当の武器が手に入る——約100~150種のスキルプールから選び、最大5つまで装備して、物語が警告し続ける大災厄へ挑む戦闘シナジーを組み立てる。1周は約1時間で終わるよう設計されており、クリアすると次周の難易度を緩和する周回ボーナスが解禁される。プリンセスメーカーの系譜に連なる一本。すでに日本語・簡体字中国語と並んで英語にも対応しているが、Steamの西側は、この一本をまだほとんど見つけ始めたばかりだ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "毎週が、たった一つの選択に凝縮される——目の前に並ぶ3つの食事のうち一つ、肉か、岩か、溶岩か。その瞬間の外側に「正解」は存在しない。どの一口を選んでも、ステータスが一つ上がると同時に、彼女の「WILD/RULE」という性格指標がわずかに、どちらかへ傾く。その指標が、外見、発生するイベント、得られる戦闘バフ、そして目指すことになる数多のエンディングのどれかを、静かに書き換えていく。あなたはステータスバーを満たしているのではなく、やり直しの利かない1年をかけて、彼女が何者になるかを、一口ごとに決めているのだ。",
        "本当の構築が宿るのは、職場だ。仕事に出るたびに、約100~150種のスキルプールへのチャンスが差し出されるが、戦場へ持ち込めるのは常に最大5つだけ。だから一回一回のドラフトは、何を切り捨てるかという、自分自身との小さな議論になる。積み上がる強さは蓄積というより取捨選択であり、物語が予告し続ける大災厄に挑むために、5つの選択がかみ合うかどうかがすべてを決める。うまくいかないランは、たいてい、最後までかみ合わなかった構築のことだ。",
        "1年間まるごとが、約1時間に収まるよう設計されている——だから1周は、大作というより、ちゃんと最後まで座って遊びきれる一回の腰掛けとして読める。そしてクリアすれば「周回ボーナス」が解禁され、次の挑戦の難易度が緩和される。だからこのループは、一度解けば終わるものではなく、何度も餌を与え、何度もドラフトし、何度も育て直すために作られている——毎回、わずかに違う娘を追いかけて。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "プリンセスメーカーと、一定期間の生活をスケジューリングし、積み上がった選択が数多のエンディングのいずれかへ分岐する発想が好きな人——本作はそれを、1年間・週単位の食事へと圧縮し、娘の代わりにドラゴン娘を据えて組み直している",
        "その育成ループを、ローグライトの戦闘構築と組み合わせたい人——外見・イベント・戦闘バフを書き換える「WILD/RULE」性格指標と、約100~150種のスキルから常に5つしか装備できない職場のスキルドラフト",
        "Steamの西側がまだほとんど見つけていない、日本のインディーの原石が欲しい人——1,720件のレビューで96%の『非常に好評』、「被虐のノエル」のドゥジン作家 KANAWO が手がけ、東京のインディーパブリッシャー Vaka Game Magazine が販売する一本。日本語・簡体字中国語と並んで英語にも対応済み",
      ],
      bad: [
        "完成した正式リリース版が欲しい人、作りかけの作品は避けたい人(DRAPLINE は2025年6月29日にアーリーアクセスとして配信開始したばかりで、いまも作り込みが続いている。1周は長い一腰掛けというより、意図的にコンパクトな約1時間のループだ)",
        "大手パブリッシャーの、すでに西で人気の大作を期待する人、あるいは無料のものが欲しい人(本作は KANAWO による有料のソロ・ドゥジン作で——販売は東京の小規模インディーパブリッシャー Vaka Game Magazine——無料ではない。AI生成アセットはなく、Steamのディスクリプタ上、性的な要素もない。受け手の中心はいまも圧倒的に日本語圏で、1,720件のうち英語レビューは約15.4%にとどまる)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "sonokuni": {
    published: "2026-07-06",
    publishAt: "2026-07-06",
    kind: "find",
    leadIndex: 0,
    // reviewBand は持たせない: 120 件は clock-rogue(112件)と同帯で "hundreds"(数百)と言い切るには境界的
    //   (誇張しない)。rarity.reviews=120 を確定値でそのまま出す。英語対応済み(11言語中の1つ)で
    //   noEnglish=false(誤って「英語非対応」stampを立てない・正直さ)。英語レビュー 45/120=37.5%は他の
    //   unreached_west 事例(12〜15%台)より明確に高く、海外メディア(TheGamer・Gamescom 2024 プレビュー)の
    //   言及も既にあるため reachState="unreached_west" は立てない(devil-blade-reboot 型・誇張しない正直さ)。
    //   obscurity は "deep"(レビュー僅少帯・西でまだ無名)。系譜は Hotline Miami——見下ろし視点の一撃死・
    //   即時再挑戦ループの原点。Famitsu記事(「『ホットラインマイアミ』を彷彿とさせる鮮烈な一撃必死ゲーム」)と
    //   海外メディア TheGamer記事(「Sonokuni Is Much More Than A Hotline Miami Clone」)の両独立記事タイトルで
    //   裏付け(lineage_anchor_key=steam_url, appid 219150 で同定)。
    meta: { genre: "instant-death-action", lineage: "hotline-miami", obscurity: "deep", rarity: { reviews: 120, positivePct: 98, noEnglish: false } },
    games: [
      {
        name_en: "SONOKUNI",
        name_ja: "SONOKUNI",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2054380/SONOKUNI/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A top-down hardcore action game in which you play Takeru, a lone assassin infiltrating the vast nation of Wanokuni inside a bio-SF retelling of Japanese myth, developed by the Japanese hip-hop group DON YASA CREW and published by the Japanese localization house Kakehashi Games. Every fight runs on the same fast, punishing loop: a single hit kills you exactly as it kills anyone else, and divine power (shin'i) revives you again almost instantly, so you throw yourself back into the same room before the last mistake has finished landing, learning it through repetition rather than a health bar. The toolkit stays deliberately narrow but layered across three core actions: attack to end a fight outright, parry to deflect an incoming blow back at your attacker with your shield, and slow to stretch time just long enough to thread an opening that was not there a moment ago, and reading which one the next instant calls for is the whole game. Levels branch into multiple routes rather than a single correct path, a dedicated speedrun mode is built for players chasing clean times, and a story-focused Easy mode exists for anyone who wants to follow Takeru's assassination plot without fighting the game's full difficulty. The soundtrack is an original Japanese-language hip-hop score written and performed by DON YASA CREW themselves, the same group behind the game, who turned to making games in 2020 after the pandemic halted their live shows; SONOKUNI is effectively their debut title. Released on March 24, 2025, it is Very Positive at 98 percent over 120 reviews, a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, violence and gore only, nothing sexual. It supports eleven languages, English and Japanese among them, alongside French, Italian, German, Spanish (Spain), Brazilian Portuguese, Russian, Simplified and Traditional Chinese, and Korean, and about 45 of its 120 reviews, roughly 37.5 percent, are already in English. Some Western press has taken notice, but at 120 reviews total it remains a niche find rather than a widely surfaced one.",
        desc_ja: "バイオSFで描き直された日本神話の世界で、大国「ワノクニ」に単身潜入する暗殺者タケルを操る、見下ろし型ハードコア高速アクション。開発は日本のヒップホップグループ DON YASA CREW、販売は日本のローカライズ会社 架け橋ゲームズ(Kakehashi Games)。すべての戦いは、同じ速く容赦のないループの上に成り立つ——一撃で死ぬのは、行く手を阻む誰とも変わらない。だが神威によってほぼ即座に復活し、最後のミスがまだ着地し切らないうちに、同じ部屋へ身を投げ直す——体力ゲージではなく、反復によって覚えていく。手数はあえて絞り込まれながら、3つの核となる動きで層を成す——attackは戦いをその場で終わらせ、parryは盾を使って受けた一撃をそのまま撃った相手へ弾き返し、slowは、一瞬前には無かった隙を見出せるだけの引き伸ばされた時間を作る。次の瞬間がそのどれを求めているかを読むこと、それがゲームのすべてだ。ステージは一本道ではなく複数のルートへ分岐し、タイムを狙う人向けのスピードラン専用モードと、本作の難度と戦わずにタケルの暗殺劇を追いたい人向けの、物語重視のEasyモードを備える。BGMは、開発元自身である DON YASA CREW が手がけたオリジナル日本語ラップ——コロナ禍でライブ活動が止まったのを機に、2020年からゲーム制作を始めた彼らにとって、本作は実質的なデビュー作である。2025年3月24日にリリースされ、120件のレビュー中98%が好評の「非常に好評」。無料ではない有料作で、アーリーアクセスではなく正式リリース済み。AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上、暴力・グロ表現のみで性的な要素はない。英語・日本語のほか、フランス語・イタリア語・ドイツ語・スペイン語(スペイン)・ポルトガル語(ブラジル)・ロシア語・簡体字/繁体字中国語・韓国語の11言語に対応し、120件のうち英語レビューは約45件(約37.5%)を占める。海外メディアの言及も出てきてはいるが、レビュー総数120件という規模では、まだニッチな発掘にとどまっている。",
      },
      {
        name_en: "Hotline Miami",
        name_ja: "Hotline Miami",
        status: "established",
        steam: "https://store.steampowered.com/app/219150/Hotline_Miami/",
        tag_en: "The instant-death action origin",
        tag_ja: "即死アクションの原点",
        desc_en: "The origin of this taste: Hotline Miami, a top-down action game developed by the two-person Swedish studio Dennaton Games (Jonatan Söderström and Dennis Wedin) and published by Devolver Digital, released in October 2012. Set in a lurid, fictionalized 1989 Miami, a masked mercenary follows cryptic answering-machine messages into buildings full of armed criminals, and a single hit kills the player exactly as easily as it kills an enemy, dropping you back into the same room almost instantly to try again, all wrapped in a neon synthwave soundtrack and brutal pixel-art violence. By crystallizing that one-hit-death, instant-restart loop, it became the foundational origin of the lineage of top-down action games built around dying constantly and restarting without friction. That core, that death is not a punishment so much as the very rhythm of play, is the root SONOKUNI grows from: it keeps the one-hit death and near-instant revival, but recasts the neon crime thriller as a bio-SF retelling of Japanese myth, swaps the masked mercenary for the lone assassin Takeru infiltrating the nation of Wanokuni, replaces Hotline Miami's straightforward brutality with a three-part core of attack, parry, and slow, and adds branching routes and a dedicated speedrun mode that Hotline Miami's original release never had.",
        desc_ja: "この味の原点——Hotline Miami。スウェーデンの2人組スタジオ Dennaton Games(Jonatan Söderström と Dennis Wedin)が開発し、Devolver Digital が販売した見下ろし型アクションで、2012年10月に発売された。毒々しく脚色された1989年のマイアミを舞台に、覆面の殺し屋が留守番電話に残された暗号めいた指示に従い、武装した犯罪者で満ちた建物へと向かう。プレイヤーは敵とまったく同じように一撃で死に、死ぬとほぼ即座に同じ部屋へ戻されて再挑戦する——そのすべてを、ネオンのシンセウェイブ楽曲と暴力的なドット絵表現が包み込む。この「一撃死・即時再挑戦」のループを結晶化させたことで、死に続けては摩擦なく再挑戦する見下ろし型アクションの系譜の礎となる原点となった。この核——死は罰というより、プレイそのもののリズムである——こそ、SONOKUNI が育つ根だ。本作は一撃死とほぼ即時の復活を受け継ぎながら、ネオンの犯罪スリラーを、バイオSFで描き直した日本神話の世界へと据え替え、覆面の殺し屋を、大国「ワノクニ」へ単身潜入する暗殺者タケルへと入れ替え、Hotline Miami の直截的な暴力を、attack・parry・slow の3つからなる核へと組み直し、Hotline Miami の原作には無かった複数ルートと専用のスピードランモードを接ぎ木している。",
      },
    ],
    en: {
      title: "SONOKUNI - a top-down hardcore action game where a lone assassin named Takeru infiltrates the nation of Wanokuni in a bio-SF retelling of Japanese myth, dying in a single hit and reviving almost instantly by divine power, wielding attack, parry, and slow across branching routes and a dedicated speedrun mode, scored by its own developers' original Japanese hip-hop, a Japanese indie heir to Hotline Miami still finding its footing in the Steam West",
      description: "A top-down hardcore action game by the Japanese hip-hop group DON YASA CREW, published by Kakehashi Games. You play Takeru, a lone assassin infiltrating the vast nation of Wanokuni in a bio-SF retelling of Japanese myth. Die in a single hit, revive almost instantly by divine power, and fight with three core moves, attack, a shield parry, and a time-slowing slow, across branching routes, a dedicated speedrun mode, and a story-focused Easy mode, all scored by the developers' own original Japanese hip-hop. Very Positive at 98 percent over 120 reviews; it supports English, yet with about 37.5 percent English reviews it remains a niche find in the Steam West.",
      h1a: "You die in one hit, and divine power throws you back in almost instantly. ",
      h1flip: "Attack, parry with your shield, or slow time down, and read the gap between one killing blow and the next, alone, inside a nation built to crush you",
      h1b: ".",
      lede: "A top-down hardcore action game in which you play Takeru, a lone assassin infiltrating the vast nation of Wanokuni inside a bio-SF retelling of Japanese myth, developed by the Japanese hip-hop group DON YASA CREW and published by the Japanese localization house Kakehashi Games. A single hit kills you exactly as it kills anyone else, and divine power revives you again almost instantly, so you throw yourself back into the same fight before the last mistake has finished landing. Your toolkit stays narrow but layered: attack ends a fight outright, parry deflects an incoming blow back at your attacker with your shield, and slow stretches time just long enough to thread an opening that was not there a moment ago. Levels branch into multiple routes, a dedicated speedrun mode exists for players chasing clean times, and a story-focused Easy mode lets anyone follow Takeru's assassination plot without the game's full difficulty. In the lineage of Hotline Miami. It already supports English among eleven languages, yet with about 37.5 percent of its reviews in English, it remains a niche find in the Steam West.",
      s1: "First, the one feeling",
      feeling: [
        "Every encounter runs on the same brutal arithmetic: one hit ends you, exactly as it ends anyone else in your way. But death carries no weight of its own, because divine power throws you back into the same fight almost the instant you fall, so the loop never asks you to sit with failure, it asks you to try again before the last mistake has even finished landing.",
        "Three moves are all you ever have, and the game is entirely about knowing which one the next half-second calls for. Attack ends a fight, parry turns your shield into a mirror that sends the blow back where it came from, and slow buys you a sliver of stretched time to see a lethal gap that was not there a moment ago. None of the three is ever the whole answer; reading which one this exact instant demands is.",
        "That loop is wrapped around a single quiet mission: one assassin, alone, walking into a nation built to crush him. Levels branch into more than one way through, so the same infiltration can be replayed as a genuinely different route, a dedicated speedrun mode turns mastery into a stopwatch, and an Easy mode carved out for the story means the tension of dying and reviving is a choice, not a barrier, for anyone who came for Takeru's mission first.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Hotline Miami's one-hit-death, instant-restart rhythm and want it rebuilt around a three-move core, attack, a shield parry, and a time-slowing slow, instead of straightforward brutality",
        "You want a lone-assassin infiltration story wrapped in a bio-SF retelling of Japanese myth, with branching routes, a dedicated speedrun mode for players chasing clean times, a story-focused Easy mode, and a soundtrack of original Japanese hip-hop written and performed by the developers themselves",
        "You want an early look at a Japanese indie gem still finding its footing in the West, Very Positive at 98 percent over 120 reviews, made by the debut studio DON YASA CREW (a hip-hop group that turned to making games after the pandemic halted their live shows) and published by Kakehashi Games, already supporting English among eleven languages",
      ],
      bad: [
        "You want a long, sprawling campaign; this is a tightly focused hardcore action game built around mastering one repeating loop of death and revival rather than around scale",
        "You expect a big-publisher, already-popular Western title; this is a paid debut work by the indie group DON YASA CREW published by the mid-size Japanese localization house Kakehashi Games, not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's descriptors, and while about 37.5 percent of its reviews are already in English and some Western press has taken notice, its total review count of 120 is still small enough that its reputation could shift either way",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "SONOKUNI - バイオSF×日本神話の世界で、大国「ワノクニ」に単身潜入する暗殺者タケルを操る、見下ろし型ハードコア高速アクション。一撃死んでも神威でほぼ即座に復活し、attack・parry(盾で弾き返す)・slow(時間減速)を使い分け、複数ルートとスピードラン専用モードに挑む。開発元自身によるオリジナル日本語ラップが響く、Hotline Miamiの系譜——Steamの西はまだ足がかりをつかみ始めたばかりの日本のインディーの一本",
      description: "開発は日本のヒップホップグループ DON YASA CREW、販売は架け橋ゲームズ(Kakehashi Games)。プレイヤーは、バイオSFで描き直された日本神話の世界で、大国「ワノクニ」に単身潜入する暗殺者タケル。一撃で死に、神威によってほぼ即座に復活し、attack・盾で弾き返すparry・時間を緩めるslowという3つの核となる動きで戦う。複数ルート、スピードラン専用モード、物語重視のEasyモードを備え、BGMは開発元自身によるオリジナル日本語ラップ。120件のレビュー中98%が好評の「非常に好評」。英語に対応済みだが、英語レビューは約37.5%——Steamの西側では、まだニッチな一本にとどまっている。",
      h1a: "一撃で死に、神威が、ほぼ即座にあなたを送り返す。",
      h1flip: "攻撃するか、盾で弾き返すか、時間を緩めるか——一撃と次の一撃の隙間を、たった一人で、あなたを叩き潰そうとする国の只中で読み抜く",
      h1b: "。",
      lede: "バイオSFで描き直された日本神話の世界で、大国「ワノクニ」に単身潜入する暗殺者タケルを操る、見下ろし型ハードコア高速アクション。開発は日本のヒップホップグループ DON YASA CREW、販売は日本のローカライズ会社 架け橋ゲームズ(Kakehashi Games)。一撃で死ぬのは、行く手を阻む誰とも変わらない。だが神威によってほぼ即座に復活し、最後のミスがまだ着地し切らないうちに、同じ戦いへ身を投げ直す。手数は絞り込まれながら層を成す——attackは戦いをその場で終わらせ、parryは盾で受けた一撃をそのまま撃った相手へ弾き返し、slowは一瞬前には無かった隙を見出せるだけの引き伸ばされた時間を作る。ステージは複数のルートへ分岐し、タイムを狙う人向けのスピードラン専用モードと、物語重視のEasyモードを備える。Hotline Miamiの系譜に連なる一本。11の言語の中に英語もすでに対応済みだが、レビューのうち英語は約37.5%——Steamの西側では、まだニッチな一本にとどまっている。",
      s1: "まず、その一点の感覚",
      feeling: [
        "すべての戦いは、同じ残酷な算数の上に成り立っている——一撃で終わる。それは行く手を阻む誰にとっても同じだ。だが死には重みが無い。神威が、倒れたほぼ直後にあなたを同じ戦いへ送り返すからだ。だからこのループは、失敗と向き合うことを求めない。最後のミスがまだ着地し切らないうちに、もう一度挑むことを求める。",
        "使える動きは、常にたった三つ。ゲームのすべては、次の0.5秒が、そのどれを求めているかを知ることにある。attackは戦いを終わらせ、parryは盾を鏡に変えて、受けた一撃をそのまま撃った相手へ送り返し、slowは、一瞬前には無かった致命の隙を見出せるだけの、引き伸ばされた時間を買う。三つのどれも、それ単体で答えにはならない。答えは、この瞬間がどれを求めているかを読むことそのものだ。",
        "そのループは、静かな一つの使命を包んでいる——たった一人の暗殺者が、彼を叩き潰すために作られた大国へと踏み込んでいく。ステージは一本道ではなく複数のルートへ分岐し、同じ潜入を、まったく違う経路として遊び直せる。スピードラン専用モードが習熟をストップウォッチに変え、物語のために切り出されたEasyモードは、死んでは蘇るという緊張感を、タケルの使命をまず追いたい誰にとっても、障壁ではなく選択にする。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Hotline Miamiの「一撃死・即時再挑戦」のリズムが好きで、それが直截な暴力ではなく、attack・盾のparry・時間を緩めるslowという3つの核へ組み直された形が欲しい人",
        "バイオSFで描き直された日本神話の世界を舞台にした、単身潜入の暗殺劇が欲しい人——複数ルート、タイムを狙う人向けのスピードラン専用モード、物語重視のEasyモード、そして開発元自身が手がけるオリジナル日本語ラップのサウンドトラックを備えている",
        "Steamの西がまだ足がかりをつかみ始めたばかりの、日本のインディーの原石を早めに触りたい人——120件のレビューで98%の『非常に好評』、コロナ禍でのライブ活動停止をきっかけにゲーム制作を始めた実質デビュー作のインディー集団 DON YASA CREW が手がけ、架け橋ゲームズが販売する一本。11の言語の中に英語もすでに対応済み",
      ],
      bad: [
        "何十時間も遊べる長大なキャンペーンが欲しい人(本作は、規模ではなく「死んでは蘇る」一つのループを極めることをめぐって組まれた、引き締まったハードコアアクションだ)",
        "大手パブリッシャーの、すでに西で人気の大作を期待する人(本作は、DON YASA CREW による有料の実質デビュー作で——販売は日本の中堅パブリッシャー架け橋ゲームズ——無料でもアーリーアクセスでもない。AI生成アセットはなく、Steamのディスクリプタ上、性的な要素もない。英語レビューはすでに約37.5%を占め、海外メディアの言及も出てきてはいるが、レビュー総数120件はまだ小さく、評価が今後どちらに転ぶかは未知数だ)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "one-turn-kill": {
    published: "2026-07-06",
    publishAt: "2026-07-06",
    kind: "find",
    leadIndex: 0,
    // genre は新設 "single-turn-deckbuilder"(単ターン制デッキ構築): 既存の "deckbuilder"/"roguelike" では
    //   捉えきれない、この作品を定義する核——山札から引くこと自体が唯一のコストで、かつ1ターン以内に
    //   敵を倒せなければ即敗北する強制単ターン制——を専用ラベルとして立てる(raising-roguelite/
    //   instant-death-action と同型の細粒度ラベル追加・ui.ts en/ja 追加済み)。系譜は Slay the Spire——
    //   開発者 onkyi(DenDen)が Game*Spark インタビューでバトル/カードデザインの影響源として直接名指し
    //   (副次的に構造面で Hades、物語演出面で SANABI/A Space for the Unbound、lineage_anchor_key=steam_url、
    //   appid 646570 の既存 anchor で同定・新規 anchor 追加は不要)。reviewBand は "around_1k"(1,372件は
    //   drapline の1,720件/hollow-cocoonの906件と同水準)。obscurity は "deep"(英語対応済み・noEnglish=false
    //   のため誤って「英語非対応」stampを立てない・正直さ)。reachState は立てない: 英語レビュー比率34.4%
    //   (472/1372)は低くなく、既に英語圏YouTubeレビュー1本・英語インディーブログ「Gaming Parrot」レビュー・
    //   Metacriticページも存在する一方、大手西側メディア/パブリッシャー主導のプッシュは未確認で「完全未到達」
    //   と言い切るのは誇張(sonokuni/devil-blade-reboot 型・誇張しない正直さ)。
    meta: { genre: "single-turn-deckbuilder", lineage: "slay-the-spire", obscurity: "deep", reviewBand: "around_1k", rarity: { reviews: 1372, positivePct: 96, noEnglish: false } },
    games: [
      {
        name_en: "One Turn Kill",
        name_ja: "One Turn Kill",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3151270/One_Turn_Kill/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A roguelite deckbuilder in which drawing a card from your deck is itself the cost of playing it, and every battle is a forced single turn: fail to kill the enemy before that one turn ends and you lose outright, developed by DenDen, a Japanese doujin circle that grew out of a 2021 winter hackathon-winning project built by members of traP, the student game-development circle at Institute of Science Tokyo, and published by the Tokyo indie publisher Waku Waku Games, the solo-run label of Ryuji Oyanagi since it split from Chorus Worldwide in 2022. You build a 20-card deck and open every fight with a 5-card starting hand, and because drawing itself spends your one resource, every card you pull toward a kill is a card you can no longer hold in reserve, so a run is less about surviving many turns than about proving, in that single instant, that your whole deck was built to end the fight before it can even properly start. Deck construction carries no randomness: skills and cards are earned through a persistent unlock system rather than random run rewards, so once you have found a combo it stays yours to execute again, reliably, across a roughly seven-hour, time-loop story told through five escalating difficulty tiers. Every card played triggers its own character animation, so the deck you have built is not just read off a hand, it is watched. The developer has named Slay the Spire directly as the influence behind the game's battle and card design, alongside Hades for structure and SANABI and A Space for the Unbound for how the story is staged. Released on January 15, 2026, it is Very Positive at 96 percent over 1,372 reviews, a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. It fully supports English, Japanese, Simplified Chinese, and Traditional Chinese, interface, full voice acting, and subtitles alike across all four, and about 472 of its 1,372 reviews, roughly 34.4 percent, are already in English; an English-language YouTube review and a review from the English indie blog Gaming Parrot already exist, and it has a Metacritic page, but no major Western outlet or publisher-led push has picked it up yet, so real room remains for it to travel further west.",
        desc_ja: "山札から1枚引くこと自体がカードを使うコストになり、すべての戦闘が強制的な単ターン制——その1ターン以内に敵を倒せなければ、即座に敗北するローグライト・デッキ構築。開発は DenDen(サークル電電)——東京科学大学の学生ゲーム制作サークル「traP」のメンバーが手がけ、2021年冬のハッカソン優勝作を発展させた日本の同人サークル——販売は東京のインディーパブリッシャー Waku Waku Games(わくわくゲームズ合同会社)——2022年に Chorus Worldwide から独立した大柳竜児の一人運営レーベル。デッキは20枚、各戦闘は初期手札5枚から始まり、引くこと自体が唯一のリソースを消費するため、キルへ向けて引く一枚一枚が、温存できたはずの一枚を手放すことを意味する。だからランは、何ターンも生き延びることではなく、その一瞬で——デッキ全体がまさにこの一撃で戦いを終わらせるために組まれていたことを証明することに懸かっている。デッキ構築にランダム性は無く、スキルやカードはランごとのランダム報酬ではなく、恒久的なアンロック制で獲得される。だから一度見つけたコンボは、以後も確実に再現して実行できる——約7時間、5段階の高難度層をたどるタイムループ物語を通して。カードを使うたびに専用のキャラクターアニメーションが発動するので、組み上げたデッキは手札として読まれるだけでなく、見られるものになる。開発者は Game*Spark のインタビューで、戦闘・カードデザインの影響源として Slay the Spire を直接名指しし、副次的に構造面で Hades、物語演出の面で SANABI や A Space for the Unbound を挙げている。2026年1月15日リリース、1,372件のレビュー中96%が好評の「非常に好評」。無料ではない有料作で、アーリーアクセスではなく正式リリース済み。AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上、性的な要素もない。英語・日本語・簡体字中国語・繁体字中国語の4言語すべてに、インターフェース・フル音声・字幕のいずれでも対応済みで、1,372件のうち英語レビューは約472件(約34.4%)を占める。英語圏のYouTubeレビュー1本と、英語インディーブログ「Gaming Parrot」のレビューはすでに存在し、Metacriticのページもあるが、大手西側メディアやパブリッシャー主導のプッシュはまだ確認されておらず、西側へさらに広がる余地は大きい。",
      },
      {
        name_en: "Slay the Spire",
        name_ja: "Slay the Spire",
        status: "established",
        steam: "https://store.steampowered.com/app/646570/Slay_the_Spire/",
        tag_en: "The roguelike deckbuilder origin",
        tag_ja: "ローグライク・デッキ構築の原点",
        desc_en: "The origin of this taste: Slay the Spire, a roguelike deck-building game developed by the American indie studio Mega Crit, launched in early access in late 2017 and fully released in January 2019. By combining procedurally generated ascents of a multi-floor spire with deck-building combat, in which cards are gained as random run rewards and an energy pool limits how many can be played in a turn across a sequence of turns, it popularized and is widely credited with defining the roguelike deckbuilder genre. That core, that a run's deck decides whether combat can be won and combat itself unfolds across a sequence of turns, is the root One Turn Kill grows from: it keeps the roguelike deckbuilding structure, but strips out Slay the Spire's randomized card rewards for a persistent, unlockable deck built the same reliable way every time, replaces its energy-per-turn cost with the cost of drawing itself, and compresses its multi-turn attrition into a single enforced turn that a run either wins outright or loses.",
        desc_ja: "この味の原点——Slay the Spire。米国のインディースタジオ Mega Crit が開発したローグライク・デッキ構築ゲームで、2017年末にアーリーアクセス、2019年1月に正式リリースされた。手続き生成される多層の塔の登攀と、ランごとのランダム報酬でカードを得て、複数ターンにわたる戦闘の中で1ターンに使えるカード枚数をエナジープールで制限するデッキ構築戦闘を組み合わせ、「ローグライク・デッキビルダー」というジャンルを広く普及・定義したと評価されている。この核——ランで組んだデッキが戦闘に勝てるかを決め、戦闘そのものは複数ターンにわたって展開する——こそ、One Turn Kill が育つ根だ。本作はローグライク・デッキ構築という構造を受け継ぎながら、Slay the Spire のランダムなカード報酬を排し、毎回同じように確実に組める恒久的なアンロック制のデッキへ据え替え、ターンごとのエナジーコストを、引くこと自体のコストへ組み替え、複数ターンにわたる消耗戦を、勝つか負けるかがその場で決まる強制的な単ターンへと圧縮している。",
      },
    ],
    en: {
      title: "One Turn Kill - a roguelite deckbuilder where drawing a card from your deck is itself the cost of playing it and every battle is a forced single turn you must end by killing the enemy before it runs out or lose outright, built on a randomness-free, permanently unlockable 20-card deck across a five-tier, roughly seven-hour time-loop story with a card-triggered animation for every play, a Japanese doujin heir to Slay the Spire the Steam West has only begun to find",
      description: "A roguelite deckbuilder by the Japanese doujin circle DenDen, published by the Tokyo indie publisher Waku Waku Games. Drawing a card from your 20-card deck is itself the cost of playing it, and every battle is a forced single turn: fail to kill the enemy before it ends and you lose outright. Skills and cards come from a persistent, randomness-free unlock system, so a found combo stays reliably repeatable across a five-tier, roughly seven-hour time-loop story, and every card played triggers its own character animation. In the lineage of Slay the Spire. Very Positive at 96 percent over 1,372 reviews; it supports English, yet with about 34.4 percent English reviews the Steam West has only begun to find it.",
      h1a: "You draw a card, and the draw itself is what it cost you. ",
      h1flip: "One turn to kill, or the run ends there, and the deck you built has to prove it in that single breath",
      h1b: ".",
      lede: "A roguelite deckbuilder in which drawing a card from your deck is itself the cost of playing it, and every battle is a forced single turn: fail to kill the enemy before that one turn ends and you lose outright, developed by DenDen, a Japanese doujin circle that grew out of a 2021 winter hackathon-winning project built by members of traP, the student game-development circle at Institute of Science Tokyo, and published by the Tokyo indie publisher Waku Waku Games. You build a 20-card deck and open every fight with a 5-card starting hand, and because drawing itself spends your one resource, every card you pull toward a kill is a card you can no longer hold in reserve, so a run is less about surviving many turns than about proving, in that single instant, that your whole deck was built to end the fight before it can even properly start. Deck construction carries no randomness: skills and cards are earned through a persistent unlock system rather than random run rewards, so once you have found a combo it stays yours to execute again, reliably, across a roughly seven-hour, time-loop story told through five escalating difficulty tiers. Every card played triggers its own character animation. In the lineage of Slay the Spire. It already supports English among four languages, yet the Steam West has only begun to find it.",
      s1: "First, the one feeling",
      feeling: [
        "Every card you draw off the top of your deck is already spent the instant it lands in your hand: drawing is the cost, not a separate step before it, so the resource you are managing is never mana or energy sitting in a pool, it is the deck itself getting thinner with every card you commit to pulling toward the kill.",
        "There is no second turn to lean on. Every fight is a hard single turn, and if the enemy is not dead when it ends, you have already lost, so nothing you assemble is a plan for attrition, it is a bet that this exact hand, drawn this exact way, adds up to a kill before the turn is allowed to close.",
        "Because the deck holds no randomness, once you have found a combo that works you can call on it again, reliably, run after run, so mastery is not about getting lucky with the draw, it is about knowing exactly which cards your unlocked deck contains and playing each one, its own character animation flaring on cue, across a roughly seven-hour time-loop story that keeps raising the stakes over five escalating difficulty tiers.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Slay the Spire's roguelike deckbuilding and want its multi-turn attrition replaced with a single, all-or-nothing turn where drawing itself is the resource you spend",
        "You want a deckbuilder with zero randomness in its construction: skills and cards come from a persistent unlock system, so a combo you find stays reliably yours to repeat, across a five-tier, roughly seven-hour time-loop story with card-triggered character animation",
        "You want a Japanese doujin gem the Steam West has only begun to find, Very Positive at 96 percent over 1,372 reviews, made by the circle DenDen (grown out of a 2021 hackathon-winning project by members of the student circle traP) and published by Waku Waku Games, already supporting English among four languages with full voice acting",
      ],
      bad: [
        "You want a roguelike deckbuilder with room to breathe across several turns of attrition and randomized card rewards to build around; this game removes both, forcing every fight into a single turn and every deck into a fixed, unlockable set",
        "You expect a big-publisher, already-popular Western title, or you want something free; this is a paid solo-circle doujin work by DenDen, published by the one-person label Waku Waku Games, not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's descriptors, and while about 34.4 percent of its reviews are already in English with some individual Western coverage, no major outlet or publisher-led push has picked it up yet",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "One Turn Kill - 山札から引くこと自体がカードのコストになり、すべての戦闘が強制的な単ターン制。1ターン以内に敵を倒せなければ即敗北する、ランダム性ゼロのアンロック制20枚デッキで挑むローグライト。約7時間・5段階の高難度層をたどるタイムループ物語、カード使用に連動するキャラクターアニメーション。Slay the Spireの系譜、Steamの西側がまだ見つけ始めたばかりの日本の同人の一本",
      description: "開発は日本の同人サークル DenDen、販売は東京のインディーパブリッシャー Waku Waku Games。20枚デッキから1枚引くこと自体がカードを使うコストになり、すべての戦闘は強制的な単ターン制——そのターンが終わるまでに敵を倒せなければ即座に敗北する。スキルやカードは恒久的なアンロック制で手に入り、ランダム性はゼロ。見つけたコンボは、約7時間・5段階の高難度層をたどるタイムループ物語を通して確実に再現できる。カードを使うたびに専用のキャラクターアニメーションが発動する。Slay the Spireの系譜に連なる一本。96%の『非常に好評』、1,372件のレビュー。英語に対応済みだが、英語レビューは約34.4%——Steamの西側は、まだ見つけ始めたばかりだ。",
      h1a: "カードを1枚引く。その「引く」こと自体が、支払った代償だ。",
      h1flip: "1ターンで倒すか、そこでランが終わるか——組んだデッキがそれを証明できるのは、その一息だけ",
      h1b: "。",
      lede: "山札から1枚引くこと自体がカードを使うコストになり、すべての戦闘が強制的な単ターン制——その1ターン以内に敵を倒せなければ、即座に敗北するローグライト・デッキ構築。開発は DenDen(サークル電電)——東京科学大学の学生ゲーム制作サークル「traP」のメンバーが手がけ、2021年冬のハッカソン優勝作を発展させた日本の同人サークル——販売は東京のインディーパブリッシャー Waku Waku Games。デッキは20枚、各戦闘は初期手札5枚から始まり、引くこと自体が唯一のリソースを消費するため、キルへ向けて引く一枚一枚が、温存できたはずの一枚を手放すことを意味する。だからランは、何ターンも生き延びることではなく、その一瞬で——デッキ全体がまさにこの一撃で戦いを終わらせるために組まれていたことを証明することに懸かっている。デッキ構築にランダム性は無く、スキルやカードはランごとのランダム報酬ではなく、恒久的なアンロック制で獲得される。だから一度見つけたコンボは、以後も確実に再現して実行できる——約7時間、5段階の高難度層をたどるタイムループ物語を通して。カードを使うたびに専用のキャラクターアニメーションが発動する。Slay the Spireの系譜に連なる一本。4つの言語のなかに英語もすでに対応済みだが、Steamの西側は、まだ見つけ始めたばかりだ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "山札の一番上から引いたカードは、手札に収まった瞬間、もう使われている——引くこと自体がコストであり、その手前に別の消費段階は無い。だから管理すべきリソースは、どこかに溜まるマナやエナジーではなく、キルへ向けて引くたびに薄くなっていくデッキそのものだ。",
        "頼れる2ターン目は無い。すべての戦いは強制的な単ターン制で、そのターンが終わるまでに敵を倒せていなければ、その時点ですでに負けている。だから組み上げるものはどれも、消耗戦のための計画ではない——この手札を、この引き方で、ターンが閉じる前にキルへ届かせられるかという賭けだ。",
        "デッキにランダム性は無いから、一度効くコンボを見つければ、以後もランを重ねるたびに確実に呼び出せる。だから習熟とは、引きの運に恵まれることではなく、アンロックしたデッキに何が入っているかを正確に把握し、その一枚一枚を——専用のキャラクターアニメーションを合図に——撃っていくことだ。約7時間、5段階に高まる難度をたどるタイムループ物語が、その賭けの重みを積み上げていく。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "Slay the Spireのローグライク・デッキ構築が好きで、複数ターンの消耗戦を、引くこと自体がコストになる一発勝負の単ターンへ置き換えた形が欲しい人",
        "構築にランダム性がまったく無いデッキ構築ゲームが欲しい人——スキルやカードは恒久的なアンロック制で手に入るので、見つけたコンボは以後も確実に再現できる。約7時間、5段階の難度をたどるタイムループ物語と、カード使用に連動するキャラクターアニメーションを備える",
        "Steamの西側がまだ見つけ始めたばかりの、日本の同人の原石が欲しい人——1,372件のレビューで96%の『非常に好評』。東京科学大学の学生サークル「traP」出身の2021年ハッカソン優勝作を発展させた同人サークル DenDen が手がけ、Waku Waku Games が販売する一本。4言語のなかに英語もフル音声で対応済み",
      ],
      bad: [
        "複数ターンの消耗戦と、それを組み立てるためのランダムなカード報酬に息をつく余地が欲しい人(本作はその両方を排し、すべての戦いを単ターンに、すべてのデッキを固定のアンロック制に絞り込んでいる)",
        "大手パブリッシャーの、すでに西で人気の大作を期待する人、あるいは無料のものが欲しい人(本作は DenDen による有料の同人サークル作で——販売は一人運営のレーベル Waku Waku Games——無料でもアーリーアクセスでもない。AI生成アセットはなく、Steamのディスクリプタ上、性的な要素もない。英語レビューはすでに約34.4%を占め、個別の西側での言及も出てきてはいるが、大手メディアやパブリッシャー主導のプッシュはまだ確認されていない)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "cento": {
    published: "2026-07-07",
    publishAt: "2026-07-07",
    kind: "find",
    leadIndex: 0,
    // genre は新設 "rhythm-command-deckbuilder"(リズムコマンド・デッキ構築): 既存の "deckbuilder"/
    //   "roguelike" では捉えきれない、この作品を定義する核——戦闘曲のビートに合わせてスキルのコマンドを
    //   入力しコンボを発動する「サウンドバトル」型の仕組み——を専用ラベルとして立てる(raising-roguelite/
    //   single-turn-deckbuilder と同型の細粒度ラベル追加・ui.ts en/ja 追加済み)。系譜は MOTHER3(2006,
    //   HAL研究所/任天堂)の「サウンドバトル」システム——戦闘曲のビートに合わせてボタン入力しコンボ攻撃を
    //   発動する仕組み——の直系(lineage_anchor_key=wikidata_qid, Q2383167 の新規 anchor "mother-3" で同定)。
    //   reviewBand は持たせない: 109件は clock-rogue(112件)/sonokuni(120件)と同帯で "hundreds" と
    //   言い切るには境界的(誇張しない)。rarity.reviews=109 を確定値でそのまま出す。reachState も立てない:
    //   英語レビュー比率58.7%(64/109)は他の unreached_west 事例(15〜37%台)より明確に高く、Kotaku
    //   ギャラリーページ・Metacriticページ・BitSummit PUNCH 2026でのオーディオデザイン最優秀賞受賞という
    //   西側の実際の露出も確認済みのため、「西側未到達」と言い切るのは誇張(sonokuni/devil-blade-reboot 型・
    //   誇張しない正直さ)。obscurity は "deep"(レビュー僅少・109件という小さな母数で、批評的評価と受賞の
    //   わりに商業的な知名度は伸びきっていない)。noEnglish=false(日本語・英語の2言語対応済み・誤って
    //   「英語非対応」stampを立てない・正直さ)。
    meta: { genre: "rhythm-command-deckbuilder", lineage: "mother-3", obscurity: "deep", rarity: { reviews: 109, positivePct: 97, noEnglish: false } },
    games: [
      {
        name_en: "Cento",
        name_ja: "Cento",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2416050/Cento/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A rhythm-command roguelite deckbuilder in which every skill card in your hand carries a command that you press in time with the beat of that stage's own music to chain it into the next hit, developed and self-published by the small Japanese studio Hoshimadara Lab. Each run, you draft skill cards into your hand and combine them with gift artifacts, the run's equivalent of relics, to build a deck around combos your hands and your timing can actually land, then carry that deck across stages that range from city-like settings to ancient ones, each set to its own distinct music and pixel-art visuals. An endurance mode lets you chain consecutive battles back to back rather than resetting between fights, and per Steam's own tags it is a Roguelike Deckbuilder, Deckbuilding, Card Game, and Turn-Based Tactics title. Released on May 15, 2024, it is Very Positive at 97 percent over 109 reviews (Steam's own review API records 109 total and 106 positive), a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. In May 2026 it won the Excellence in Sound Design Award at BitSummit PUNCH, Japan's largest indie game festival, and it has since picked up a Kotaku gallery page, a Metacritic page, and coverage from Japanese outlets including IGN Japan, Famitsu, and Dengeki Online. It supports Japanese and English, and about 64 of its 109 reviews, roughly 58.7 percent, are already in English, so it is not fully undiscovered by the Steam West. But at 109 total reviews, a small sample where a single review can move the positive rate by close to a point, its total footprint has stayed modest in the roughly two years since release, so despite the critical praise and the award, it has not broken out commercially.",
        desc_ja: "リズムコマンド・デッキ構築ローグライト——手札のスキルカード一枚一枚がコマンドを背負っていて、そのステージ固有の曲のビートに合わせてそれを入力すると、次の一撃へと繋がっていく。開発・販売は日本の小規模スタジオ 星斑研究室(Hoshimadara Lab.)による自社セルフパブリッシュ。ランごとにスキルカードをドラフトし、このランの遺物にあたるギフト(アーティファクト)と組み合わせて、自分の手とタイミングが本当に決められるコンボを軸にデッキを組み、そのデッキを、都市風から古代風まで、それぞれ固有の音楽とドット絵ビジュアルを持つステージへ持ち込んでいく。エンデュランスモードは連戦をリセットせずに繋げられる。Steam自身のタグでは Roguelike Deckbuilder・Deckbuilding・Card Game・Turn-Based Tactics。2024年5月15日にリリースされ、109件のレビュー中97%が好評の「非常に好評」(Steam自身のレビューAPIでは109件中106件が好評と記録)。無料ではない有料作で、アーリーアクセスではなく正式リリース済み。AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上、性的な要素もない。2026年5月には、日本最大級のインディーゲーム祭典 BitSummit PUNCH で「オーディオデザイン最優秀賞」を受賞し、以降 Kotaku のギャラリーページ、Metacritic のページ、IGN Japan・ファミ通・電撃オンラインといった日本のメディアの記事も出てきている。日本語・英語に対応し、109件のうち約64件(約58.7%)がすでに英語レビュー——Steamの西側から完全に見つかっていないわけではない。しかし総レビュー数109件という小さな母数では、1件の増減が好評率を1ポイント近く動かしうる。発売から約2年強のあいだ、総合的な規模はまだ控えめなままで、批評的な評価と受賞にもかかわらず、商業的なブレイクにはまだ至っていない。",
      },
      {
        name_en: "MOTHER 3",
        name_ja: "MOTHER3",
        status: "established",
        homepage: "https://en.wikipedia.org/wiki/Mother_3",
        wikidata: "https://www.wikidata.org/wiki/Q2383167",
        tag_en: "The rhythm-command battle origin",
        tag_ja: "リズムコマンドバトルの原点",
        desc_en: "The origin of this taste: MOTHER 3, a role-playing game developed by HAL Laboratory and published by Nintendo for the Game Boy Advance, released in Japan in April 2006 as the third entry in the Mother series. Its Sound Battle system turns ordinary turn-based combat into a rhythm exercise: pressing a skill's command in time with the beat of that battle's own music chains consecutive hits together into a combo, so landing the bigger hit is a matter of feeling the beat, not only choosing the right command. It has never received an official English localization. That core, that a combo's success rides on pressing a command on the beat of the music playing in that fight, is the root Cento grows from: it keeps on-beat command input as the trigger for a combo, but recasts a single RPG's battle flourish as the engine of a full roguelite deckbuilder, where a hand of skill cards and gift artifacts you draft run to run replaces a fixed party's command list, and stages set to their own distinct music, from city streets to ancient ruins, replace one game's recurring battle theme.",
        desc_ja: "この味の原点——MOTHER3。HAL研究所が開発し任天堂が販売したロールプレイングゲームで、2006年にゲームボーイアドバンス向けに日本で発売された、「MOTHER」シリーズ第3作である。「サウンドバトル」システムは、通常のターン制戦闘をリズムの試練に変える——技のコマンドを、その戦闘曲自身のビートに合わせて入力すると、一撃一撃がコンボとして繋がっていく。大きな一撃を決めるのは、正しいコマンドを選ぶことだけでなく、そのビートを感じ取ることだ。公式の英語ローカライズは行われていない。この核——コンボの成否が、その戦いで流れている曲のビートに合わせてコマンドを撃つことに懸かっている——こそ、Cento が育つ根だ。本作はオンビートのコマンド入力をコンボの引き金にする仕組みを受け継ぎながら、1本のRPGのたまの戦闘演出だったものを、ランごとに手札のスキルカードとギフト(アーティファクト)をドラフトして組む、ローグライト・デッキビルダーの駆動源そのものへ据え替え、1本のゲームの決まった戦闘曲を、都市風から古代風まで、それぞれ固有の音楽を持つステージ群へ組み替えている。",
      },
    ],
    en: {
      title: "Cento - a roguelite deckbuilder where you press a skill's command in time with the beat of that stage's own music to chain it into a combo, drafting skill cards and gift artifacts into a hand-built deck across settings from city streets to ancient ruins, with an endurance mode for chaining consecutive battles, self-published by the Japanese studio Hoshimadara Lab., heir to MOTHER 3's Sound Battle system, already carrying a BitSummit PUNCH sound design award yet still a quiet, small-review find",
      description: "A roguelite deckbuilder by the self-published Japanese studio Hoshimadara Lab. Press a skill's command in time with the beat of that stage's own music and it chains into the next hit, while you draft skill cards and gift artifacts into a hand-built deck and carry it across stages set to their own music and visuals, from city streets to ancient ruins, with an endurance mode for chaining consecutive battles. In the lineage of MOTHER 3's Sound Battle system. Very Positive at 97 percent over 109 reviews, and winner of a BitSummit PUNCH 2026 sound design award; it supports English, and with about 58.7 percent of its reviews already in English it is not fully undiscovered, though its total review count has stayed small since its 2024 release.",
      h1a: "Every skill you play, you play on the beat. ",
      h1flip: "Miss the rhythm of that stage's own music and the combo breaks; land it, and the hand of skill cards and gift artifacts you drafted turns into a chain of hits",
      h1b: ".",
      lede: "A roguelite deckbuilder in which combat itself is a rhythm exercise: press a skill's command in time with the beat of that stage's own music and it chains into the next hit, developed and self-published by the Japanese studio Hoshimadara Lab. Each run, you draft skill cards into your hand and combine them with gift artifacts to build a deck, carrying that build across stages that range from city streets to ancient ruins, each set to its own distinct music and visuals. An endurance mode lets you chain consecutive battles back to back, stacking your build's strength rather than resetting between fights. In the lineage of MOTHER 3's Sound Battle system, the HAL Laboratory-developed, Nintendo-published Game Boy Advance RPG that first turned pressing a command on the beat of its battle music into a combo attack. Released in May 2024, it is Very Positive at 97 percent over 109 reviews, and in May 2026 it won the Excellence in Sound Design Award at BitSummit PUNCH, Japan's largest indie game festival. It supports English alongside Japanese, and with about 58.7 percent of its reviews already in English, a Kotaku gallery page, a Metacritic page, and coverage from Japanese outlets such as IGN Japan, Famitsu, and Dengeki Online around BitSummit, it is not a fully undiscovered title. What holds true is that its total review count has stayed small in the roughly two years since release, so despite the critical praise and the award, it has not broken out commercially.",
      s1: "First, the one feeling",
      feeling: [
        "Every skill card in your hand carries a command, and playing it is not a menu choice so much as a musical one: you press that command in time with the beat of the music playing in that exact stage, land it on beat and the hit chains into the next, land it off beat and the chain does not form. The card in your hand tells you what to play; the music tells you when.",
        "Between fights, you draft skill cards and combine them with gift artifacts, the run's version of relics, to assemble a deck built around whichever combos your hands and your timing can actually land. A deck that looks strong on paper still has to be played on the beat of whatever stage you carry it into, so building is only half the work; the other half is playing what you built in rhythm.",
        "Stages shift in setting and in music, from city streets to ancient ruins, and each carries its own beat for you to read. An endurance mode strings consecutive battles together without a reset in between, so the tension of staying on rhythm compounds fight after fight rather than resetting to zero each time you win one.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love MOTHER 3's Sound Battle idea, pressing a command in time with the battle music to chain a combo, and want that rhythm made the entire spine of a roguelite deckbuilder rather than one RPG's occasional flourish",
        "You want a deckbuilder where the resource you manage is a hand of skill cards plus gift artifacts, replayed across stages that each carry their own music and visuals, with an endurance mode for runs built around chaining consecutive battles",
        "You want an early look at a quietly acclaimed, self-published Japanese indie: Very Positive at 97 percent over 109 reviews, already carrying the Excellence in Sound Design Award from BitSummit PUNCH 2026, made and published solely by Hoshimadara Lab., supporting English alongside Japanese",
      ],
      bad: [
        "You want a completely undiscovered title with zero footprint; this one already carries real recognition, about 58.7 percent of its reviews are in English, it has a Kotaku gallery page and a Metacritic page, and Japanese outlets covered it around its BitSummit PUNCH award, so calling it fully unreached would not be honest. What is true is that its total review count has stayed small, only 109, in the roughly two years since its May 2024 release, so its reputation is still thin despite the praise",
        "You expect a big-publisher, already-popular Western title, or you want something free; this is a paid, self-published indie work by the small Japanese studio Hoshimadara Lab., not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's descriptors",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Cento - 各ステージ固有の曲のビートに合わせてスキルのコマンドを入力するとコンボとして繋がる、リズムコマンド・デッキ構築ローグライト。手札のスキルカードとギフト(アーティファクト)を組み合わせてデッキを編成し、都市風から古代風まで多様なステージを巡る。連戦しながら強化を積むエンデュランスモードあり。自社セルフパブリッシュの日本のスタジオ星斑研究室が手がける、MOTHER3の「サウンドバトル」の系譜——BitSummit PUNCHでサウンドデザイン賞を受賞しながらも、レビュー数はまだ静かな一本",
      description: "自社セルフパブリッシュの日本のスタジオ星斑研究室(Hoshimadara Lab.)が手がけるリズムコマンド・デッキ構築ローグライト。スキルのコマンドを、そのステージ固有の曲のビートに合わせて入力すると、次の一撃へと繋がっていく。手札のスキルカードとギフト(アーティファクト)を組み合わせてデッキを編成し、都市風から古代風まで、それぞれ固有の音楽とビジュアルを持つステージを渡り歩く。連戦を重ねながら強化を積み上げるエンデュランスモードあり。MOTHER3の「サウンドバトル」の系譜。97%が好評の『非常に好評』(109件)、BitSummit PUNCH 2026 でサウンドデザイン賞を受賞済み。英語に対応し、レビューのうち約58.7%がすでに英語——完全な未発見ではないが、2024年の発売から総レビュー数はまだ小さいままだ。",
      h1a: "プレイするスキルはすべて、ビートの上で撃つ。",
      h1flip: "そのステージ固有の曲のリズムを外せばコンボは途切れ、乗せられれば、組んだ手札のスキルカードとギフトが一連の連撃に変わる",
      h1b: "。",
      lede: "戦闘そのものがリズムの試練になる、リズムコマンド・デッキ構築ローグライト——スキルのコマンドを、そのステージ固有の曲のビートに合わせて入力すると、次の一撃へと繋がっていく。開発・販売は日本のスタジオ 星斑研究室(Hoshimadara Lab.)による自社セルフパブリッシュ。ランごとに手札のスキルカードをドラフトし、ギフト(アーティファクト)と組み合わせてデッキを編成し、その構築を、都市風から古代風まで、それぞれ固有の音楽とビジュアルを持つステージへ持ち込んでいく。エンデュランスモードは連戦を途切れさせず、リセットせずに強化を積み上げ続けられる。系譜はMOTHER3の「サウンドバトル」——HAL研究所が開発し任天堂が販売したゲームボーイアドバンスのRPGで、戦闘曲のビートに合わせてコマンドを入力することをコンボ攻撃の発動条件にした最初の作品だ。2024年5月に発売され、109件のレビューで97%が好評の『非常に好評』。2026年5月には、日本最大級のインディーゲーム祭典 BitSummit PUNCH で「オーディオデザイン最優秀賞」を受賞した。日本語に加え英語にも対応しており、レビューのうち約58.7%がすでに英語で、Kotakuのギャラリーページ、Metacriticのページ、そしてBitSummitを巡ってのIGN Japan・ファミ通・電撃オンラインなど日本のメディア露出もある——完全な未発見のタイトルとは言えない。それでも本当なのは、発売から約2年強のあいだ、総レビュー数がまだ小さいままだということだ。批評的な評価と受賞にもかかわらず、商業的なブレイクにはまだ至っていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "手札のスキルカード一枚一枚がコマンドを背負っていて、それを撃つことはメニューの選択というより、音楽的な選択に近い——そのステージでまさに流れている曲のビートに合わせてそのコマンドを入力し、ビートに乗せられれば一撃が次へと繋がり、外せばコンボは形にならない。手札のカードが「何を撃つか」を教え、音楽が「いつ撃つか」を教える。",
        "戦闘の合間には、スキルカードをドラフトし、ギフト(アーティファクト)——このランの遺物にあたるもの——と組み合わせて、自分の手とタイミングが本当に決められるコンボを軸にデッキを組み上げる。紙の上で強く見えるデッキも、持ち込んだステージのビートの上で撃てなければ意味がない。組むことは仕事の半分でしかなく、残り半分は、組んだものをリズムに乗せて撃つことだ。",
        "ステージは舞台も曲も移り変わる——都市風から古代風まで、それぞれ固有のビートを読ませてくる。エンデュランスモードは連戦をリセット無しで繋げていくので、リズムを保ち続ける緊張は、1戦勝つごとにゼロへ戻るのではなく、戦いを重ねるたびに積み上がっていく。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "MOTHER3の「サウンドバトル」——戦闘曲のビートに合わせてコマンドを入力しコンボを繋げる発想——が好きで、それを1本のRPGのたまの演出ではなく、ローグライト・デッキ構築の背骨そのものに据えた形が欲しい人",
        "管理するリソースが、手札のスキルカードとギフト(アーティファクト)であるデッキ構築が欲しい人——それぞれ固有の音楽とビジュアルを持つステージを渡り歩き、連戦を繋げるエンデュランスモードでランを組む",
        "静かに評価されている、自社セルフパブリッシュの日本のインディーの原石を早めに触りたい人——109件のレビューで97%の『非常に好評』、BitSummit PUNCH 2026の「オーディオデザイン最優秀賞」をすでに携え、星斑研究室が単独で開発・販売する一本。日本語に加え英語にも対応済み",
      ],
      bad: [
        "痕跡ゼロの、完全に未発見のタイトルが欲しい人(本作にはすでに実質的な認知がある——レビューの約58.7%が英語で、KotakuのギャラリーページとMetacriticのページがあり、BitSummit PUNCHの受賞を巡って日本のメディアも報じている。だから「完全に西で未到達」と言い切るのは正直ではない。本当なのは、2024年5月の発売から約2年強のあいだ、総レビュー数がまだ109件と小さいままで、評価の高さのわりに知名度が伸びきっていないということだ)",
        "大手パブリッシャーの、すでに西で人気の大作を期待する人、あるいは無料のものが欲しい人(本作は星斑研究室による有料の自社セルフパブリッシュ作で、無料でもアーリーアクセスでもない。AI生成アセットはなく、Steamのディスクリプタ上、性的な要素もない)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "aiai-kissaten": {
    published: "2026-07-07",
    publishAt: "2026-07-07",
    kind: "find",
    leadIndex: 0,
    // genre は新設 "loop-mystery-adv"(周回ミステリーADV): 既存の "visual-novel"/"adventure" では捉えきれない、
    //   この作品を定義する核——1周約5分、喫茶店で何を注文しても奥の部屋へ通される「合言葉」システムで分岐し、
    //   複数のバッドエンドを経て「トゥルーエンド」で全ての謎を明かす、周回前提の短時間マルチエンド構造——を
    //   専用ラベルとして立てる(rhythm-command-deckbuilder/single-turn-deckbuilder と同型の細粒度ラベル追加・
    //   ui.ts en/ja 追加済み)。系譜は開発元 麺屋すぱいす東京支店 自身: 4Gamerが報じた同サークルのデベロッパー
    //   ページで、次回作「ナカノ人格移植研究所」(2026年発表)が同じ短時間周回×マルチエンドのミステリーADV
    //   形式を継ぐことが確認できる一方、この形式自体に先行するフリーゲーム/ゲームジャム作は捜索の上でも
    //   見つからなかった(lineage_anchor_key=steam_url, appid 3847100 = 本作自身を新規 anchor
    //   "aiai-kissaten" として同定・自己起源のため self-anchor)。obscurity は "wall"(日本語のみで
    //   インターフェース/字幕/音声すべて英語非対応・完全な言語の壁)。reachState は "lang_walled"
    //   (199件中英語レビューは1件・約0.5%で、Kotaku・IGN・Niche Gamer・Metacritic・BitSummit・IGF・TGA
    //   いずれにも言及なし=西側メディア露出ゼロを確認済み)。
    meta: { genre: "loop-mystery-adv", lineage: "aiai-kissaten", obscurity: "wall", reachState: "lang_walled", rarity: { reviews: 199, positivePct: 96, noEnglish: true } },
    games: [
      {
        name_en: "アイアイ喫茶店 (no official English title)",
        name_ja: "アイアイ喫茶店",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3847100/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A five-minute-loop, multiple-ending mystery adventure told in visual-novel form, developed and self-published by the Japanese doujin circle Menya Spice Tokyo Branch. The setting is a small coffee shop where, per Steam's own description, ordering something as innocuous as an iced coffee turns out to double as the 'password' that leads you into the back room, and each order and each choice you make from there branches the story toward one of several endings. Every one of those bad endings still hands you a piece of the truth, so a run rarely takes more than about five minutes, and the game is built for you to keep failing it on purpose, order differently, and read the room again, until enough pieces line up to reach the single true ending that resolves the shop's mystery in full; 44 Steam achievements track that progress across replays. Released on August 28, 2025 per Steam's own listing (Japanese outlets including Famitsu and 4Gamer report August 29, a one-day discrepancy also noted here), it is Very Positive at 96 percent over 199 reviews (191 positive, per Steam's own review API), a paid title, not free, fully launched and not in Early Access, with no AI-generated assets disclosed and, by Steam's own content descriptors, nothing sexual (nothing is flagged at all; Indonesia's IGRS board separately rates it 18+, but for horror and violence, not sexual content). Built with accessibility options that include keyboard-only and mouse-only play, color alternatives, and no timed input required, it supports Japanese only, interface, subtitles, and voice alike, with no English option anywhere in the store or the game, and only 1 of its 199 reviews, about 0.5 percent, is in English. No coverage has turned up from Kotaku, IGN, Niche Gamer, Metacritic, BitSummit, IGF, or the Game Awards, so this is not a case of a game merely underperforming in the West, it is one the West has not yet been offered a way to read at all. The circle has also exhibited at Tokyo Game Dungeon, Japan's own doujin game showcase.",
        desc_ja: "1周約5分のマルチエンド・ミステリーアドベンチャーで、ビジュアルノベル形式によるテキスト進行と選択で物語が進む。開発・販売は日本の同人サークル 麺屋すぱいす東京支店 による自社セルフパブリッシュ。舞台は小さな喫茶店——Steam自身の説明によれば、何気なく頼んだ「アイスコーヒー」の注文が、そのまま奥の部屋へ通される「合言葉」になっている。そこからの注文や選択の一つ一つが物語を分岐させ、いくつものエンディングへ導く。どのバッドエンドも、真相の断片を必ず一つ手渡してくれるので、1周はおよそ5分で終わり、わざと失敗しては別の注文を選び、その場をもう一度読み直す——それを繰り返すように作られている。断片が十分に揃ったとき、店の謎をすべて明かす唯一の「トゥルーエンド」に辿り着く。44個のSteam実績が、周回を重ねる進捗を記録する。2025年8月28日にリリース(Steam自身の表記。ファミ通・4Gamerなど日本のメディアは8月29日と報じており、1日のズレがある——両論併記する)。199件のレビュー(Steam自身のレビューAPIでは191件が好評)中96%が好評の「非常に好評」。無料ではない有料作で、アーリーアクセスではなく正式リリース済み。AI生成アセットの開示はなく、Steam自身のコンテンツディスクリプタ上、性的な要素も一切フラグされていない(インドネシアのIGRSレーティング機関は別途18+を付与しているが、これはホラー・暴力表現に対するもので、性的な理由ではない)。キーボードのみ・マウスのみでのプレイ、色覚設定の代替、タイムアタック要素なしのプレイなど、アクセシビリティにも配慮した作りだ。対応言語は日本語のみ——インターフェース・字幕・音声のすべてが日本語で、ストアにもゲーム内にも英語の選択肢は一切なく、199件のレビューのうち英語は1件、約0.5%にとどまる。Kotaku・IGN・Niche Gamer・Metacritic・BitSummit・IGF・The Game Awardsのいずれにも言及は見つからず、これは西側で単に埋もれているというより、そもそも読む手立てをまだ渡されていない状態だ。同サークルは、国内の同人ゲーム展示イベント「東京ゲームダンジョン」への出展実績も持つ。",
      },
      {
        name_en: "アイアイ喫茶店 (no official English title)",
        name_ja: "アイアイ喫茶店",
        status: "established",
        steam: "https://store.steampowered.com/app/3847100/",
        tag_en: "The origin of its own lineage",
        tag_ja: "この系譜そのものの原点",
        desc_en: "There is no earlier work this grows from. Aiai Kissaten is developed and self-published as the debut release of Menya Spice Tokyo Branch, and an extensive search turned up no earlier freeware build or game-jam prototype behind its five-minute-loop, order-as-password, multiple-bad-ends-into-one-true-ending mystery ADV format. Per the circle's own developer page as reported by 4Gamer, their next announced project, Nakano Jinkaku Ishoku Kenkyuujo (announced for 2026), carries that same short-loop, multi-ending mystery ADV format forward, so this is the point, at least within this developer's own body of work, where the format begins rather than one it inherited.",
        desc_ja: "これより前に育った土台は無い。アイアイ喫茶店は、麺屋すぱいす東京支店によるデビュー作として開発・自社セルフパブリッシュされた一本で、1周5分・注文がそのまま合言葉になる・複数のバッドエンドを経てトゥルーエンドへ至るこのミステリーADVの形式には、捜索を尽くしても、それ以前のフリーゲーム版やゲームジャム版といった土台は見つからなかった。4Gamerが報じた同サークルのデベロッパーページによれば、次回作として発表済みの「ナカノ人格移植研究所」(2026年発表)は、この同じ短時間周回×マルチエンドのミステリーADV形式を引き継ぐ。だから本作は、少なくともこの開発者自身の仕事の中では、何かを受け継いだ側ではなく、その形式が始まる場所そのものだ。",
      },
    ],
    en: {
      title: "Aiai Kissaten - a five-minute-loop, multiple-ending mystery adventure where ordering something as simple as iced coffee doubles as the password into a coffee shop's back room, branching toward one of several bad endings before a single true ending resolves the whole mystery, tracked across 44 Steam achievements, a self-published Japanese doujin debut with no earlier format to inherit from and no English support at all, unreached by the West",
      description: "A five-minute-loop, multiple-ending mystery adventure by the self-published Japanese doujin circle Menya Spice Tokyo Branch. In its titular coffee shop, ordering something as simple as iced coffee doubles as the password into a back room, and every order and choice branches the story toward one of several bad endings, each handing you a piece of the truth, until enough of them add up to the one true ending that resolves the mystery in full, tracked across 44 Steam achievements. Very Positive at 96 percent over 199 reviews; it supports Japanese only, with just 1 English review and no Western media coverage found anywhere, so the West has not yet been offered a way to read it.",
      h1a: "Order an iced coffee, and that order itself is the password. ",
      h1flip: "Fail into one bad ending after another until the fragments they hand you finally add up to the one true ending that explains the whole shop",
      h1b: ".",
      lede: "A five-minute-loop, multiple-ending mystery adventure told in visual-novel form, developed and self-published by the Japanese doujin circle Menya Spice Tokyo Branch. Order something as simple as iced coffee at its titular coffee shop and, per the game's own description, that order itself doubles as the password into the back room, and every choice from there branches the story toward one of several endings. Every bad ending still hands you a fragment of the truth, so a run rarely runs past five minutes, and the whole point is to keep failing it on purpose until enough fragments line up to reach the one true ending that resolves the shop's mystery in full, with 44 Steam achievements tracking that progress across replays. There is no earlier work this format grows from; the circle's own next announced project is reported to carry the same short-loop, multi-ending mystery ADV format forward, making this the origin within their own lineage. It supports Japanese only, and with zero Western media coverage found anywhere, the West has not yet been offered a way to read it.",
      s1: "First, the one feeling",
      feeling: [
        "Every order you place is doing two things at once: it is what you say you want to drink, and it is also the password that decides which door opens next, so choosing 'iced coffee' is never just small talk, it is already a move in the mystery before you know there is one to solve.",
        "Losing does not feel like losing. Every bad ending closes the run in a few minutes, but it also hands you a fragment you did not have before, so failing on purpose, ordering something different next time, reading the same room from a new angle, is not a detour from progress, it is the entire shape progress takes.",
        "The true ending is not unlocked by playing better, it is unlocked by playing enough different wrong ways first, so the five-minute loop turns replay itself into the investigation: each short run is one more piece filed away until, all at once, the fragments you accumulated across every bad ending line up into the one story that explains the shop.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You want a mystery adventure where the core loop is deliberately failing forward: five-minute runs, a menu order that doubles as a password, and bad endings that each still hand you a piece of the truth on the way to one true ending",
        "You want a self-published Japanese doujin debut that is genuinely starting something rather than following a known format: no earlier freeware or game-jam version behind this exact short-loop, multi-ending mystery ADV structure was found, and the circle's own next announced project is already reported to carry it forward",
        "You want an early look at a quietly praised Japanese find, Very Positive at 96 percent over 199 reviews, tracked across 44 Steam achievements, made and published solely by Menya Spice Tokyo Branch, a circle that has also exhibited at Tokyo Game Dungeon",
      ],
      bad: [
        "You do not read Japanese: the game supports Japanese only, interface, subtitles, and voice alike, with no English option anywhere in the store or the game, and only 1 of its 199 reviews is in English",
        "You want a title with an existing Western footprint to point to; no coverage from Kotaku, IGN, Niche Gamer, Metacritic, BitSummit, IGF, or the Game Awards has turned up, so this is not a case of a game underperforming in the West, it is one the West has not yet been offered a way to read at all",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "アイアイ喫茶店 - 「アイスコーヒー」のような何気ない注文が、そのまま奥の部屋への合言葉になる、1周5分のマルチエンド・ミステリーアドベンチャー。いくつものバッドエンドを経て、唯一の「トゥルーエンド」で謎のすべてが明かされる。44個のSteam実績で周回を記録する、継ぐべき前例を持たない自社セルフパブリッシュの日本の同人デビュー作——英語には一切対応せず、西側はまだ届いていない",
      description: "自社セルフパブリッシュの日本の同人サークル 麺屋すぱいす東京支店 による、1周5分のマルチエンド・ミステリーアドベンチャー。舞台となる喫茶店では、「アイスコーヒー」のような何気ない注文が、そのまま奥の部屋への合言葉になっており、注文と選択の一つ一つが物語を分岐させ、いくつものバッドエンドへ導く。どのバッドエンドも真相の断片を一つ手渡してくれ、それが十分に揃ったとき、謎のすべてを明かす唯一のトゥルーエンドに辿り着く。44個のSteam実績が周回の進捗を記録する。199件のレビュー中96%が好評の『非常に好評』。対応言語は日本語のみで、英語レビューはわずか1件、西側メディアの言及もどこにも見つからず、西側はまだこの一本を読む手立てを渡されていない。",
      h1a: "「アイスコーヒー」を頼む。その注文そのものが、合言葉になっている。",
      h1flip: "バッドエンドを重ねて手渡された断片が、唯一のトゥルーエンドとして店の謎すべてを説き明かすまで",
      h1b: "。",
      lede: "ビジュアルノベル形式で物語が進む、1周5分のマルチエンド・ミステリーアドベンチャー。開発・販売は日本の同人サークル 麺屋すぱいす東京支店 による自社セルフパブリッシュ。舞台となる喫茶店で「アイスコーヒー」のような何気ない注文をすると、ゲーム自身の説明によれば、その注文そのものが奥の部屋への合言葉になっていて、そこからの選択の一つ一つが物語を分岐させ、いくつものエンディングへ導く。どのバッドエンドも真相の断片を必ず一つ手渡してくれるので、1周はめったに5分を超えず、わざと失敗を重ねては、断片が十分に揃い唯一のトゥルーエンドへ届くまで読み直し続けることが、このゲームの本題だ。44個のSteam実績が、その周回の進捗を記録する。この形式には、それ以前に育った土台が無い——同サークルの次回作は、この同じ短時間周回×マルチエンドのミステリーADV形式を引き継ぐと報じられており、本作はこの系譜における原点そのものだ。対応言語は日本語のみで、西側メディアの言及もどこにも見つからず、西側はまだこの一本を読む手立てを渡されていない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "注文の一つ一つは、同時に二つのことをしている——飲みたいものを告げる行為であると同時に、次にどの扉が開くかを決める合言葉でもある。だから「アイスコーヒー」を選ぶことは、ただの世間話ではない。謎があると気づく前から、もうその謎の中の一手になっている。",
        "負けることが、負けたようには感じられない。バッドエンドはどれも数分でランを閉じるが、同時にそれまで持っていなかった断片を一つ手渡してくれる。だからわざと失敗して、次は違う注文を選び、同じ部屋を新しい角度で読み直すことは、進捗の寄り道ではなく、進捗そのものの形をしている。",
        "トゥルーエンドは、うまくプレイすることでは解錠されない。先に十分な数の「違う失敗」を重ねることで解錠される。だから1周5分のループは、周回そのものを捜査へと変える——短い一周ごとに一つの手がかりが積み上がり、あるとき、すべてのバッドエンドを通して集めた断片が、店を説明する唯一の物語として、一斉に噛み合う。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "わざと失敗しながら前へ進む構造が核になったミステリーアドベンチャーが欲しい人——1周5分のラン、合言葉を兼ねる注文メニュー、そして真相の断片を必ず一つ手渡してくれるバッドエンドを重ねて、唯一のトゥルーエンドへ辿り着く",
        "既存の型をなぞるのではなく、本当に何かを始めている自社セルフパブリッシュの日本の同人デビュー作が欲しい人——この短時間周回×マルチエンドのミステリーADVという構造そのものに、それ以前のフリーゲーム版やゲームジャム版は見つからず、同サークルの次回作としてすでに発表済みの作品がこの形式を引き継ぐと報じられている",
        "静かに評価されている日本の発掘を早めに触りたい人——199件のレビューで96%の『非常に好評』、44個のSteam実績で周回を記録する、麺屋すぱいす東京支店が単独で開発・販売する一本。同サークルは東京ゲームダンジョンへの出展実績も持つ",
      ],
      bad: [
        "日本語が読めない人(対応言語は日本語のみで、インターフェース・字幕・音声のすべてが日本語。ストアにもゲーム内にも英語の選択肢は一切なく、199件のレビューのうち英語は1件にとどまる)",
        "西側での実績を手がかりにしたい人(Kotaku・IGN・Niche Gamer・Metacritic・BitSummit・IGF・The Game Awardsのいずれにも言及は見つからない。これは西側で単に埋もれているというより、そもそも読む手立てをまだ渡されていない状態だ)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "chippy-and-noppo": {
    published: "2026-07-08",
    publishAt: "2026-07-08",
    kind: "find",
    leadIndex: 0,
    // genre は新設 "shape-craft-co-op-puzzle"(変形クラフト協力パズル): 既存の "puzzle-platformer"
    //   (pb-winterbottom 系譜・自分を録画して過去の自分と協調する)や "puzzle" では捉えきれない、この作品を
    //   定義する核——工場内で集めたパーツを、色・形を加工する機械に通して設計図通りの形へ作り変え、せまい
    //   場所が得意な「ちっぴー」と高くジャンプできる「のっぽー」という移動特性の異なる2キャラクターを、
    //   ソロプレイでは同時操作、マルチプレイでは1人1キャラずつ操作して協力する——を専用ラベルとして立てる
    //   (rhythm-command-deckbuilder 等と同型の細粒度ラベル追加・ui.ts en/ja 追加済み)。系譜は Snipperclips:
    //   Cut It Out, Together!(SFB Games 開発・任天堂発売, 2017, Nintendo Switch)——「違う形の2キャラを
    //   1つの道具として使い、変形そのものでパズルを解く」協力パズルを結晶化させた原点(Wikipedia/Wikidata
    //   実測確認済み)。本作はその変形の対象をキャラクター自身の体からパーツへ据え替えた子孫(Steam版が
    //   無い原点のため lineage_anchor_key=wikidata_qid, Q28312055 の新規 anchor "snipperclips" で同定)。
    //   obscurity は "deep"(母数58件と小さく西で無名)。reachState は "unreached_west"(英語レビュー比率
    //   25.9%(15/58、Steam自身のレビューAPIで実測確認済み)で西未浸透)。noEnglish=false: 日本語・英語・
    //   簡体中文の3言語にすべてフルボイス対応済みで、誤って「英語非対応」stampを立てない(正直さ)。
    //   Metacriticにページは存在するがCritic Reviewsは"tbd"で、Kotaku/IGN等の言及も見つからず、西側の
    //   実到達はいまも薄い。母数58件は小さく、数件の増減で好評率が動きうる点も本文で正直に述べる(誇張
    //   しない)。開発元/発行元の株式会社オーツーは1991年設立・大阪拠点・従業員172名(2026年4月時点)の
    //   中堅スタジオで、Steamジャンルタグは"Indie"だが厳密な同人サークルではないため is_doujin_indie=false
    //   と判定(BitSummitに自社ブースを出展した実績はあるが、受賞・ノミネート記録は確認できず=出展と受賞
    //   を混同しない・正直さ)。
    meta: { genre: "shape-craft-co-op-puzzle", lineage: "snipperclips", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 58, positivePct: 91, noEnglish: false } },
    games: [
      {
        name_en: "Chippy & Noppo",
        name_ja: "ちっぴーとのっぽー なかよしコンビのわくわく工場",
        status: "hidden",
        steam: "https://store.steampowered.com/app/596500/Chippy__Noppo/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A cooperative action puzzler developed by peakvox, a joint original label formed by O-TWO inc. and Fun Unit inc., and self-published by O-TWO inc. Set inside a toy factory, it has you gather parts scattered around each stage and run them through machines that change their color and shape, so you can assemble what comes out into a toy that matches a given blueprint. Two characters carry that work, Chippy, built for tight, narrow spaces, and Noppo, who can jump high, and per Steam's own description you either control both of them at once in solo play or split them one per player in multiplayer, cooperating to reach parts neither one could reach alone; stages range from forest to ocean settings. Per Steam's own tags it is an Action, Casual, and Indie title with Co-op, Shared/Split-Screen Co-op, Remote Play Together, and Steam Achievements. Released on March 8, 2023, it is Very Positive at 91 percent over 58 reviews (Steam's own review API records 58 total and 53 positive), a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. It supports Japanese, English, and Simplified Chinese, with full voice acting in all three per Steam's own language listing, yet only about 15 of its 58 reviews, roughly 25.9 percent, are in English, and while it does have a Metacritic page, that page's Critic Reviews section still reads tbd, with no Kotaku, IGN, or comparable Western outlet coverage found. So this is a release that has already done the work of full localization, voice included, and the West has still barely reviewed or written about it. At just 58 total reviews, a small sample where a handful of reviews can move the positive rate by several points, its footprint has stayed modest in the roughly three years since release. O-TWO inc. is an established studio founded in 1991 and based in Osaka, with around 172 employees as of April 2026, not a small doujin circle, and while it has exhibited its own booth at BitSummit, Japan's largest indie game festival, no awards or nominations for this title were found. A Nintendo Switch 2 version of the game also exists.",
        desc_ja: "開発は peakvox——株式会社オーツーと Fun Unit inc. による共同オリジナルレーベル——で、販売は株式会社オーツーによる自社セルフパブリッシュ。舞台はおもちゃ工場で、各ステージに散らばったパーツを集め、色と形を変える機械に通す。そこから出てきたものを、設計図通りのおもちゃへと組み立てていく。その作業を支えるのは2人のキャラクター——せまい場所が得意な「ちっぴー」と、高くジャンプできる「のっぽー」。ストア自身の説明によれば、ソロプレイでは2キャラを同時に操作し、マルチプレイでは1人1キャラずつを操作して協力する。1人では届かないパーツにも、こうして手が届くようになる。ステージは森林から海洋まで用意されている。Steam自身のタグでは Action・Casual・Indie で、Co-op・Shared/Split-Screen Co-op・Remote Play Together・Steam実績に対応する。2023年3月8日にリリースされ、58件のレビュー中91%が好評の「非常に好評」(Steam自身のレビューAPIでは58件中53件が好評と記録)。無料ではない有料作で、アーリーアクセスではなく正式リリース済み。AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上、性的な要素もない。対応言語は日本語・英語・簡体中文で、Steam自身の言語表記によれば、すべてフルボイス対応。それでも58件のレビューのうち英語は約15件、約25.9%にとどまり、Metacriticのページはあるものの、そのCritic Reviews欄はいまも「tbd」のままで、Kotaku・IGNといった西側大手メディアの言及も見つからなかった。つまり、音声込みのフルローカライズという仕事はすでに終えているのに、西側はまだこの一本をほとんどレビューも報道もしていない、という状態だ。総レビュー数はわずか58件——数件の増減で好評率が数ポイント動きうる小さな母数のまま、発売から約3年、その足跡は控えめなままだ。株式会社オーツーは1991年設立・大阪拠点で、2026年4月時点で従業員約172名を抱える老舗スタジオであり、小規模な同人サークルではない。国内最大級のインディーゲーム祭典 BitSummit に自社ブースを出展した実績はあるが、本作についての受賞・ノミネート記録は見つからなかった。Nintendo Switch 2版も存在する。",
      },
      {
        name_en: "Snipperclips: Cut It Out, Together!",
        name_ja: "いっしょにチョキッと スニッパーズ",
        status: "established",
        wikidata: "https://www.wikidata.org/wiki/Q28312055",
        homepage: "https://en.wikipedia.org/wiki/Snipperclips",
        tag_en: "The shape-swap co-op origin",
        tag_ja: "変形協力パズルの原点",
        desc_en: "The origin of this taste: Snipperclips: Cut It Out, Together!, a puzzle game developed by the British studio SFB Games (with additional work by Nintendo Software Technology) and published by Nintendo, released worldwide as a Nintendo Switch launch title on March 3, 2017. Its two characters, Snip and Clip, are each shaped like a distinct cardboard-cutout silhouette, and its signature 'snipping' mechanic lets one character cut a piece out of the other's body, reshaping them into whatever tool-like form, a hook, a wedge, a key, the puzzle at hand needs, whether that means catching a falling object, cutting a rope, or fitting through a gap. It is played solo, switching between the two shapes, or cooperatively with a second player controlling the other. That core, that solving a puzzle means physically reshaping a character built for one purpose into whatever the moment calls for, and doing it together, is the root Chippy & Noppo grows from: it keeps two characters with different traversal traits working as one shared tool, but moves the reshaping off the characters' own bodies and onto the parts they gather, running each one through a machine that changes its color and form until it matches a factory blueprint.",
        desc_ja: "この味の原点——いっしょにチョキッと スニッパーズ(英題: Snipperclips - Cut It Out, Together!)。イギリスのゲーム開発会社 SFB Games が開発(追加開発に Nintendo Software Technology が参加)し、任天堂が発売したパズルゲームで、2017年3月3日、Nintendo Switchのローンチタイトルとして世界同時発売された。登場する2人のキャラクター、スニップとクリップは、それぞれ紙を切り抜いたような固有のシルエットを持ち、代表的な「チョキッと」システムでは、一方がもう一方の体を切り取り、フック・くさび・鍵など、その場のパズルが必要とする形へと作り変えられる——落ちてくる物を受け止めたり、ロープを切ったり、隙間をくぐり抜けたりするために。1人では2つの形を切り替えながら、2人では1人がもう一方を操作して協力プレイできる。この核——パズルを解くとは、ひとつの目的のために作られたキャラクターを、その瞬間に必要な形へ物理的に、しかも2人がかりで作り変えることであり——こそ、ちっぴーとのっぽーが育つ根だ。本作はこの「違う移動特性を持つ2キャラが1つの道具として働く」核を受け継ぎながら、変形の対象をキャラクター自身の体から、彼らが集めるパーツへと移し替え、それぞれを機械に通して色と形を変え、工場の設計図に合わせていく。",
      },
    ],
    en: {
      title: "Chippy & Noppo - a cooperative action puzzler where you gather parts around a toy factory and run them through machines that change their color and shape until they match a blueprint, carried there by two characters, Chippy for tight spaces and Noppo for high jumps, played together solo or split one-per-player in co-op, across stages from forest to ocean, fully voiced in Japanese, English, and Simplified Chinese, by the established Osaka studio O-TWO inc., yet still barely reviewed in the West",
      description: "A cooperative action puzzler by the Japanese label peakvox (O-TWO inc. and Fun Unit inc.), self-published by O-TWO inc. Gather parts around a toy factory and run them through machines that change their color and shape until they match a blueprint, using two characters, Chippy for tight spaces and Noppo for high jumps, controlled together solo or split one-per-player in co-op, across stages from forest to ocean. Very Positive at 91 percent over 58 reviews. It supports Japanese, English, and Simplified Chinese with full voice acting in all three, yet only about 25.9 percent of its reviews are in English and no major Western outlet has covered it yet.",
      h1a: "The part in your hand is the wrong shape. ",
      h1flip: "Feed it through a machine that changes its color and form until it matches the blueprint, while a teammate built for tight spaces and one built to jump high carry the pieces there together",
      h1b: ".",
      lede: "A cooperative action puzzler developed by peakvox, the joint original label from O-TWO inc. and Fun Unit inc., and self-published by O-TWO inc. You gather parts scattered around a toy factory and feed them into machines that reshape their color and form, then assemble the result into a toy that matches a given blueprint. Two characters carry that work: Chippy, built for tight, narrow spaces, and Noppo, who can jump high, and per Steam's own description you either control both at once in solo play or split them one per player in multiplayer, working stages that range from forest to ocean. Released in March 2023, it is Very Positive at 91 percent over 58 reviews. It already supports Japanese, English, and Simplified Chinese with full voice acting in all three, yet only about 25.9 percent of its reviews are in English, and it has not yet drawn coverage from major Western outlets.",
      s1: "First, the one feeling",
      feeling: [
        "Every part you pick up starts out the wrong shape and the wrong color for the blueprint in front of you, so the first move is never placing it, it is running it through a machine and watching it change until it finally fits what the plan asks for.",
        "In solo play you hold both bodies at once, the small one that slips through gaps built only for it and the tall one that clears jumps built only for it, so a single stage keeps asking you to think in two shapes at the same time rather than one.",
        "Move to multiplayer and the same stage does not get easier, it gets split: one player becomes the small shape, the other becomes the tall one, and reaching a part neither could reach alone now depends on reading the same puzzle through someone else's hands.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You loved Snipperclips' idea of using two differently-shaped characters together to physically reshape your way through a puzzle, and want that DNA rebuilt around collecting parts and running them through color-and-form machines to match a blueprint, rather than cutting a partner's silhouette",
        "You want a puzzle that scales cleanly between solo and co-op, the same stage working as one player juggling two asymmetric characters or two players each taking one, across factory stages from forest to ocean, with Remote Play Together and Steam Achievements",
        "You want an early look at a fully English- and Chinese-voiced release from an established, non-doujin Japanese studio, O-TWO inc. (founded 1991, based in Osaka), Very Positive at 91 percent over 58 reviews, before its Metacritic page picks up any critic scores",
      ],
      bad: [
        "You want a completely unlocalized, undiscovered title; this one already ships with full English and Simplified Chinese voice acting and text and already has a Metacritic page, so calling it entirely unreached would not be honest. What is true is that only about 25.9 percent of its 58 reviews are in English, its Metacritic Critic Reviews still read tbd, and no Kotaku, IGN, or comparable Western outlet coverage has turned up",
        "You want a big-publisher hit, a free game, or a hardcore-difficulty puzzle challenge; this is a paid, Casual-tagged release from the mid-size studio O-TWO inc., not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's own descriptors",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ちっぴーとのっぽー なかよしコンビのわくわく工場 - 工場内に散らばったパーツを集め、色・形を変える機械に通して設計図通りに作り変える協力アクションパズル。せまい場所が得意な「ちっぴー」と高く跳べる「のっぽー」を、ソロでは同時操作、マルチでは1人1キャラで協力する。森林〜海洋のステージを、日本語・英語・簡体中文フルボイスで届ける、大阪の老舗スタジオ株式会社オーツーの一本——それでも西側ではまだほとんどレビューされていない",
      description: "peakvox(株式会社オーツーと Fun Unit inc. による共同オリジナルレーベル)が開発し、株式会社オーツーが自社セルフパブリッシュする協力アクションパズル。工場内に散らばったパーツを集め、色・形を加工する機械に通して設計図通りの形に作り変える。せまい場所が得意な「ちっぴー」と高くジャンプできる「のっぽー」を、ソロプレイでは同時操作、マルチプレイでは1人1キャラずつ操作して協力する。森林〜海洋まで複数の工場ステージがある。58件のレビューで91%が好評の『非常に好評』。日本語・英語・簡体中文に対応し、すべてフルボイスだが、レビューのうち英語は約25.9%にとどまり、西側大手メディアの言及もまだない。",
      h1a: "手にしたパーツは、まだ求める形じゃない。",
      h1flip: "色と形を変える機械に通し、設計図に合うまで作り変える——せまい場所が得意な相棒と、高く跳べる相棒が、二人でそれを運んでいく",
      h1b: "。",
      lede: "peakvox(株式会社オーツーと Fun Unit inc. による共同オリジナルレーベル)が開発し、株式会社オーツーが自社セルフパブリッシュする協力アクションパズル。工場内に散らばったパーツを集め、色・形を加工する機械に通して設計図通りの形に作り変えていく。その作業を支えるのが、せまい場所が得意な「ちっぴー」と、高くジャンプできる「のっぽー」——ストア自身の説明によれば、ソロプレイでは2キャラを同時に操作し、マルチプレイでは1人1キャラずつを操作して協力する。ステージは森林から海洋まで複数用意されている。2023年3月に発売され、58件のレビューで91%が好評の『非常に好評』。日本語・英語・簡体中文に対応し、すべてフルボイス対応済みだが、レビューのうち英語は約25.9%にとどまり、西側の大手メディアの言及もまだ見つからない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "手にしたパーツは、最初は設計図とは違う色・違う形をしている。だから最初の一手は「置く」ことではなく、機械に通して、それが設計図の求める形に変わっていくのを見届けることだ。",
        "ソロプレイでは、2つの体を同時に操ることになる——せまい隙間をすり抜けられる小さな体と、その体だけのために作られた段差を越えられる高い体。だから1つのステージは、常に2つの形を同時に考えることを求めてくる。",
        "マルチプレイに移っても、同じステージが簡単になるわけではない。ただ役割が分かれるだけだ——1人が小さな形を、もう1人が高い形を担う。1人では届かなかったパーツに手が届くかどうかは、同じ謎を、相手の手を通して読めるかどうかにかかっている。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "2人のキャラの違う形を組み合わせてパズルを解く、Snipperclipsのような発想が好きで、それを相棒の輪郭を切り取るのではなく、パーツを集めて色・形を機械で加工し設計図に合わせるという形に据え替えたDNAが欲しい人",
        "ソロとマルチで綺麗にスケールするパズルが欲しい人——同じステージが、1人で2キャラを同時操作するパズルにも、2人がそれぞれ1キャラずつ担当する協力プレイにもなる。森林から海洋までのステージ、Remote Play TogetherとSteam実績付き",
        "英語・簡体中文フルボイスで届く、1991年設立・大阪拠点の老舗スタジオ株式会社オーツーによる一本を早めに触りたい人——58件のレビューで91%の『非常に好評』。Metacriticページに批評スコアが載る前に触れる",
      ],
      bad: [
        "ローカライズもされていない、完全に未発見のタイトルが欲しい人(本作はすでに英語・簡体中文の音声・テキストにフルボイスで対応し、Metacriticのページもある。だから「完全に西で未到達」と言い切るのは正直ではない。本当なのは、58件のレビューのうち英語は約25.9%にとどまり、MetacriticのCritic Reviews欄はいまも「tbd」のままで、Kotaku・IGN級の西側大手メディアの言及もまだ見つからないということだ)",
        "大手パブリッシャーのヒット作、無料タイトル、あるいは高難度のパズルを期待する人(本作は中堅スタジオ株式会社オーツーによる有料作で、Steam自身のタグでも「Casual」。無料でもアーリーアクセスでもなく、AI生成アセットはなく、Steamのディスクリプタ上、性的な要素もない)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "singou-breaka": {
    published: "2026-07-08",
    publishAt: "2026-07-08",
    kind: "find",
    leadIndex: 0,
    // genre は新設 "chain-slide-puzzle"(連鎖スライドパズル): 既存の "puzzle"(散らばった記録を論理で
    //   収束させる推理パズル系)や "puzzle-platformer"/"physics-puzzle" では捉えきれない、この作品を
    //   定義する核——縦向きブロックは縦方向のみ・横向きブロックは横方向のみへスライド移動できる
    //   「シグナルブロック」を操作し、同色のシグナルが2つ以上隣接すると爆発、その衝撃を受けた隣接
    //   ブロックは点灯色が反転し、そこから新たな同色隣接が生まれれば連鎖爆破へ発展する——を専用ラベルと
    //   して立てる(shape-craft-co-op-puzzle 等と同型の細粒度ラベル追加・ui.ts en/ja 追加済み)。系譜は
    //   Puzznic(パズニック、タイトー、1989)——軸固定スライド+同色隣接消去という核メカニクスの原点
    //   (lineage_anchor_key=wikidata_qid, Q2182742 の新規 anchor "puzznic" で同定。Steam版Puzznicは
    //   確認できずWikidata実測(label="Puzznic", developer=Taito, 公開1989年)をanchorとした)。「衝撃で
    //   隣接ブロックの色が反転し連鎖する」独自要素は開発者オリジナルで、開発者本人からPuzznicへの直接的な
    //   インスピレーション言明は確認できていないため、本文でもその旨を正直に明記する(捏造しない・
    //   自信度: 中)。obscurity は "deep"(レビュー総数22件と極めて小さく西で無名)。reachState は
    //   "unreached_west"(英語レビュー比率45.5%(10/22、Steam自身のレビューAPIで実測確認済み)は数値上は
    //   高く見えるが、母数自体が22件と小さく統計的信頼度は低い。海外の言及も米インディーブログ The
    //   Virtual Moose の2025年10月ラウンドアップ記事程度で、専用レビューや西側大手メディアの掲載は確認
    //   できず、実質的に西側未到達と判断)。noEnglish=false(英語・日本語・韓国語の3言語に対応済み・誤って
    //   「英語非対応」stampを立てない・正直さ)。reviewBand は持たせない: 22件は "hundreds"(数百)にも
    //   遠く届かない(捏造しない)。開発元/発行元のNEOタケトンボは個人サークル(主宰: やなぼ〜 / X:
    //   @yanaboh777)と推定される自己パブリッシュで、法人登記や複数人体制の記載は見つからず個人規模と
    //   判断(断定的な一次情報はないため自信度: 中)。国内メディア(でんふぁみこゲーマー、ニコニコニュース
    //   経由)は体験版公開時に記事化しているが西側メディアではないため has_awards_or_press=false とした。
    meta: { genre: "chain-slide-puzzle", lineage: "puzznic", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 22, positivePct: 100, noEnglish: false } },
    games: [
      {
        name_en: "SINGOU BREAKA",
        name_ja: "シンゴウブレイカ SINGOU BREAKA",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3506550/_SINGOU_BREAKA/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A puzzle action game about signal blocks modeled on traffic lights, developed and self-published by the Japanese circle NEOタケトンボ (NEO Taketonbo, led by a creator going by やなぼ〜 / X: @yanaboh777). The circle's own website states, in its own words, that it doesn't even have a business card, and no complex, multi-person credit list turns up anywhere; it has exhibited as an individual circle at the Tokyo doujin game event Game Dungeon (both Tokyo6 and Tokyo8), so everything points to a solo operation, though no single source states a headcount outright. You slide 'signal blocks' along one fixed axis each: blocks oriented vertically can only move up and down, blocks oriented horizontally can only move left and right, and pushing two or more same-colored signals into contact detonates them. That detonation's shockwave then flips the lit color of whatever blocks sit next to it, so a single explosion can hand a fresh block a new color, create a brand new same-color adjacency, and set off a further chain of detonations on its own. A denfaminicogamer feature covering its demo also describes Arrow Blocks and Laser Spheres as additional pieces layered onto that same chain. It ships five modes, Endless, Stage Clear, Time Limit, Score Race, and an offline local Battle mode, each playable at Easy, Normal, or Hard, and per Steam's own tags it is an Action, Casual, and Indie title with Single-player, Multi-player, PvP, Shared/Split Screen, Steam Achievements, and Remote Play Together. Released on October 27, 2025, it supports English, Japanese, and Korean, a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual. It sits at Positive, 100 percent, but that is over just 22 reviews (Steam's own review API records 22 total and 22 positive), a sample small enough that a single new review could move that number. About 10 of those 22, roughly 45.5 percent, are already in English, a share that looks high on paper but, resting on a base of only 22 total reviews, we do not read as proof the West has found this game. The clearest outside mention we could turn up is a brief listing in a late-October 2025 roundup post from the American indie-games blog The Virtual Moose, and we found no dedicated Western review or coverage from a major outlet. Japanese outlets did cover its demo before launch, denfaminicogamer's feature was syndicated through Nico Nico News, but that is domestic press, not Western reach. Its core, blocks locked to one axis of slide, cleared by matching same-colored blocks into contact, closely echoes Puzznic, Taito's 1989 arcade puzzle game; the shockwave-driven color flip and chain reaction is SINGOU BREAKA's own addition, and we found no statement from its developer naming Puzznic as an influence, so we list that lineage as our own read of the mechanic, not a confirmed one.",
        desc_ja: "信号機を模した「シグナルブロック」を操作するパズルアクションゲーム。開発・販売は日本の個人サークル NEOタケトンボ(主宰は「やなぼ〜」/ X: @yanaboh777)による自社セルフパブリッシュ。同サークルの公式サイトは自らを「名刺なんて持ってないし」と語っており、複数人体制をうかがわせる込み入ったクレジット表記もどこにも見当たらない。東京の同人ゲーム即売会「ゲームダンジョン」(Tokyo6・Tokyo8)に個人サークルとして出展した実績もあり、状況証拠はすべて個人規模の運営を示しているが、人数を断定する一次情報は無い。プレイヤーは軸が固定された「シグナルブロック」をスライドさせる——縦向きのブロックは縦方向のみ、横向きのブロックは横方向のみへ移動できる。同色のシグナルを2つ以上隣接させると爆発し、その衝撃を受けた隣のブロックは点灯色が反転する。これによって新たな同色隣接が生まれれば、連鎖爆破へと発展していく。体験版を取り上げたでんふぁみこゲーマーの記事によれば、この連鎖にはさらに「アローブロック」「レーザースフィア」という要素も加わるという。モードはEndless・Stage Clear・Time Limit・Score Race、そしてオフラインのローカル対戦であるBattleの5種類で、それぞれEasy・Normal・Hardの難易度がある。Steam自身のタグではAction・Casual・Indieで、シングルプレイヤー・マルチプレイヤー・PvP・画面分割・Steam実績・Remote Play Togetherに対応する。2025年10月27日にリリースされ、対応言語は英語・日本語・韓国語。無料ではない有料作で、アーリーアクセスではなく正式リリース済み。AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上、性的な要素もない。レビューは22件中22件が好評の「非常に好評」(好評率100%)——だがこれはわずか22件という母数の上での話で、1件増えるだけでもこの数字は動きうる。22件のうち英語レビューは約10件、約45.5%で、数字だけ見れば高く映るが、母数がわずか22件である以上、これを「西側がこの作品を見つけた証拠」とは読まない。見つけられた海外での最も明確な言及は、米国のインディーゲームブログ The Virtual Moose による発売直後のラウンドアップ記事内の短い一節程度で、専用のレビューや西側大手メディアの掲載は確認できなかった。国内メディア(でんふぁみこゲーマー、ニコニコニュース経由で配信)は発売前の体験版を記事化しているが、これは国内メディアであって西側への到達ではない。「軸に固定されたブロックをスライドさせ、同色のブロックを接触させて消す」という核メカニクスは、タイトーが1989年に発売したアーケードパズル『パズニック』と一致度が高い。衝撃で隣接ブロックの色が反転し連鎖するという要素は本作独自のものであり、開発者本人がパズニックを影響源として挙げた言明は見つからなかった。そのため、この系譜はこちらの読み解きであり、確定した事実ではないことを明記しておく。",
      },
      {
        name_en: "Puzznic",
        name_ja: "パズニック",
        status: "established",
        wikidata: "https://www.wikidata.org/wiki/Q2182742",
        homepage: "https://en.wikipedia.org/wiki/Puzznic",
        tag_en: "The likely origin",
        tag_ja: "系譜上の原点(推定)",
        desc_en: "A likely, but not developer-confirmed, root of this taste: Puzznic, an arcade puzzle game developed and published by Taito, released in 1989 and later ported to home systems including the NES, Game Boy, Sega Genesis, and Amiga. Each block sits fixed to a single axis, some sliding only left and right, others only up and down, and a stage clears when the player slides two or more blocks that share the same face into direct contact, making them vanish, all within a limited number of moves per stage. That core, blocks locked to one axis of slide, cleared by matching same faces into contact, is the mechanic SINGOU BREAKA's own signal blocks echo most closely: blocks oriented vertically sliding only vertically, blocks oriented horizontally sliding only horizontally, and same-colored signals detonating once two or more touch. Where SINGOU BREAKA departs is its own addition, a detonation's shockwave flips the color of the blocks beside it, letting one explosion spark another, a mechanic Puzznic never had. We have found no statement from SINGOU BREAKA's developer naming Puzznic as an influence, so we list it here as a lineage we read from the mechanic itself, not one either side has confirmed.",
        desc_ja: "この味の、開発者による確認は取れていないものの、もっとも近しい原点候補——『パズニック』(Puzznic)。タイトーが開発・販売したアーケードパズルゲームで、1989年に発売され、後にファミコン、ゲームボーイ、メガドライブ、Amigaなど複数の家庭用機種へ移植された。それぞれのブロックは一つの軸に固定されていて、左右にしか動かせないものと、上下にしか動かせないものがあり、同じ面を持つブロックを2つ以上隣接させて消す——それを限られた手数の中で行うことでステージをクリアする。この核——一つの軸に固定されたブロックを、同じ面同士を接触させて消すという仕組み——こそ、SINGOU BREAKAの「シグナルブロック」がもっとも色濃く受け継いでいるものだ。縦向きのブロックは縦方向のみ、横向きのブロックは横方向のみへスライドし、同色のシグナルが2つ以上触れると爆発する。SINGOU BREAKAが独自に踏み出しているのは、爆発の衝撃で隣のブロックの色が反転し、一つの爆発が次の爆発を呼び込むという仕組みで、これはパズニックには無かったものだ。SINGOU BREAKAの開発者がパズニックを影響源として名指しした言明は見つかっておらず、そのためここに記す系譜は、メカニクスそのものから私たちが読み取ったものであり、どちらの側からも確認された事実ではない。",
      },
    ],
    en: {
      title: "SINGOU BREAKA - a signal-block puzzle action game where matching same-colored blocks explodes them and the shockwave flips the color of neighboring blocks, chaining into further explosions, across five modes including an offline local Battle mode, self-published by the solo-read Japanese circle NEOタケトンボ, Positive at 100 percent over a still-tiny 22 reviews",
      description: "A puzzle action game self-published by the solo-read Japanese circle NEOタケトンボ. Vertical signal blocks slide only vertically, horizontal ones only horizontally, and sliding two or more same-colored signals into contact detonates them, with the shockwave flipping neighboring blocks' colors so one explosion can chain into the next. Five modes, Endless, Stage Clear, Time Limit, Score Race, and an offline local Battle mode, each across three difficulties. Positive at 100 percent, but over just 22 reviews, and while about 45.5 percent of those are already in English, the sample is too small, and outside mentions too thin, to call it discovered by the West.",
      h1a: "Two signals of the same color touch, and they explode. ",
      h1flip: "The shockwave flips the color of every block beside the blast, so the explosion you just triggered can spark the next one before you have moved again",
      h1b: ".",
      lede: "A puzzle action game about signal blocks modeled on traffic lights, developed and self-published by the Japanese circle NEOタケトンボ, everything about it, down to its own website's claim that it doesn't even have a business card, reading as a solo operation, though no single source confirms a headcount outright. Blocks oriented vertically can only slide vertically, blocks oriented horizontally can only slide horizontally, and sliding two or more same-colored signals into contact detonates them; that blast's shockwave then flips the lit color of whatever sits beside it, so one explosion can hand you the next one before you have made another move. A denfaminicogamer feature on its demo also describes Arrow Blocks and Laser Spheres layered onto that same chain. It ships five modes, Endless, Stage Clear, Time Limit, Score Race, and an offline local Battle mode, each across Easy, Normal, and Hard. Released on October 27, 2025, it supports English, Japanese, and Korean, and sits at Positive, 100 percent, over just 22 reviews. About 45.5 percent of those 22 are already in English, but the sample is so small we do not read that as the West having found it; the clearest outside mention we turned up is a brief line in a late-October 2025 roundup from the American indie blog The Virtual Moose, with no dedicated Western review or major outlet coverage yet.",
      s1: "First, the one feeling",
      feeling: [
        "A signal block only ever moves the one way its shape allows, so a vertical block sliding down a column can never solve the problem waiting one column over; that has to come from a horizontal block sliding in from the side, so every stage reads as two separate lanes of movement that have to meet in the same place.",
        "Two same-colored signals touching is not the end of a move, it is the start of the next one: the shockwave reaches into whatever block sits beside the blast and flips its lit color, so a block that was the wrong shade a second ago can suddenly match its neighbor, and the explosion you triggered on purpose keeps triggering ones you did not plan.",
        "Endless, Stage Clear, Time Limit, Score Race, and a local offline Battle mode all run the same chain reaction under a different constraint, a fixed board to clear, a clock to beat, a score to chase, or another player to out-detonate, so the one chain-reaction idea keeps getting re-asked under a new kind of pressure.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You liked Puzznic's idea of blocks locked to a single sliding axis, cleared by matching same faces together, and want to see that core carried by a mechanic Puzznic never had, an explosion whose shockwave repaints its neighbors and can set off the next explosion on its own",
        "You want a puzzle game built around a real chain reaction rather than pre-placed combos, tested across five modes, Endless, Stage Clear, Time Limit, Score Race, and a local offline Battle mode, each at three difficulty tiers",
        "You want an early look at a solo-read, self-published Japanese circle's release, Positive at 100 percent, before its review count, currently 22, grows into something a bigger audience has already weighed in on",
      ],
      bad: [
        "You want a game the West has clearly already found; about 45.5 percent of its reviews are already in English, but that is 10 reviews out of 22 total, too small a sample to call it discovered, and the only outside mention we could find was a brief line in an American indie blog's roundup post, with no dedicated Western review or major outlet coverage",
        "You want a big-publisher hit, a free game, or a confirmed multi-person studio behind it; NEOタケトンボ reads everywhere as a solo circle, though no source states a headcount outright, and this is a paid, not-free title that is fully launched and not in Early Access, with no AI-generated assets and nothing sexual by Steam's own descriptors",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "シンゴウブレイカ SINGOU BREAKA - 同色のシグナルブロックを接触させると爆発し、その衝撃で隣接ブロックの色が反転して次の爆発を呼ぶ連鎖パズルアクション。オフラインのローカル対戦モードを含む5モードを収録し、個人サークルと見られるNEOタケトンボが自社セルフパブリッシュ。好評率100%ながらレビューはまだ22件という一本",
      description: "個人サークルと見られるNEOタケトンボが自社セルフパブリッシュするパズルアクション。縦向きのシグナルブロックは縦方向のみ、横向きは横方向のみへスライドし、同色のシグナルを2つ以上接触させると爆発、その衝撃で隣のブロックの点灯色が反転し、一つの爆発が次の爆発へと連鎖していく。Endless・Stage Clear・Time Limit・Score Race、オフラインのローカル対戦Battleの5モード、それぞれ3段階の難易度を収録。好評率100%だが、レビューはわずか22件——うち約45.5%はすでに英語だが、母数が小さすぎ、海外での言及も薄いため、西側に発見されたとは言えない。",
      h1a: "同じ色のシグナルが2つ触れれば、爆発する。",
      h1flip: "その衝撃が隣のブロックの色を反転させ、次に自分が動くよりも先に、いま起こした爆発が次の爆発を呼び込む",
      h1b: "。",
      lede: "信号機を模した「シグナルブロック」を操作するパズルアクションゲーム。開発・販売は日本のサークルNEOタケトンボによる自社セルフパブリッシュで、公式サイト自身が「名刺なんて持ってないし」と語るように、隅々まで個人運営を思わせるが、人数を断定する一次情報は無い。縦向きのブロックは縦方向のみ、横向きのブロックは横方向のみへスライドでき、同色のシグナルを2つ以上接触させると爆発する。その衝撃は隣のブロックの点灯色を反転させ、次に自分が動くよりも先に、いま起きた爆発が次の爆発を呼び込んでいく。体験版を取り上げたでんふぁみこゲーマーの記事によれば、この連鎖には「アローブロック」「レーザースフィア」という要素も加わるという。モードはEndless・Stage Clear・Time Limit・Score Race、そしてオフラインのローカル対戦Battleの5種で、それぞれEasy・Normal・Hardの難易度がある。2025年10月27日にリリースされ、対応言語は英語・日本語・韓国語。22件のレビューで好評率100%の「非常に好評」——うち約45.5%はすでに英語だが、母数がわずか22件と小さすぎるため、これを「西側に見つかった」証拠とは読まない。見つけられた海外での最も明確な言及は、米国のインディーゲームブログThe Virtual Mooseによる発売直後のラウンドアップ記事内の短い一節程度で、専用レビューや西側大手メディアの掲載はまだ無い。",
      s1: "まず、その一点の感覚",
      feeling: [
        "シグナルブロックは、自分の形が許す一方向にしか動けない。だから縦に並んだ列を降りていく縦向きブロックだけでは、隣の列で待っている問題を解けない——それを解くのは、横から滑り込んでくる横向きブロックの仕事だ。だからどのステージも、交わるべき2つの移動レーンとして読むことになる。",
        "同色のシグナルが2つ触れることは、一手の終わりではなく、次の一手の始まりだ。爆発の衝撃は隣にあるブロックへ届き、その点灯色を反転させる。さっきまで違う色だったブロックが、次の瞬間には隣と同じ色になる——自分が狙って起こした爆発が、狙っていなかった爆発まで呼び込んでいく。",
        "Endless・Stage Clear・Time Limit・Score Race、そしてオフラインのローカル対戦Battle——5つのモードはどれも同じ連鎖の仕組みを、違う制約の下で走らせる。決まった盤面をクリアするのか、時計と競うのか、スコアを追うのか、それとも相手より先に爆破するのか。連鎖という一つの発想に、そのたびごとに違う種類のプレッシャーを重ねてくる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "軸に固定されたブロックをスライドさせ、同じ面同士を接触させて消す——『パズニック』のその核が好きで、パズニックには無かった仕組み——爆発の衝撃が隣を塗り替え、次の爆発を自分で呼び込む——に受け継がれた形を見たい人",
        "あらかじめ置かれたコンボではなく、本物の連鎖反応を軸にしたパズルゲームが欲しい人——Endless・Stage Clear・Time Limit・Score Race、オフラインのローカル対戦Battleの5モード、それぞれ3段階の難易度でテストされている",
        "個人規模と見られる自社セルフパブリッシュの日本のサークルによる一本を早めに触りたい人——好評率100%、レビュー数(現在22件)がもっと大きな注目を集める前に触れる",
      ],
      bad: [
        "西側にすでにはっきり見つかっている作品が欲しい人(レビューの約45.5%はすでに英語だが、それは22件中10件に過ぎず、『発見済み』と呼ぶには母数が小さすぎる。見つけられた海外での言及も、米国のインディーゲームブログの短いラウンドアップ記事程度で、専用レビューや西側大手メディアの掲載は無い)",
        "大手パブリッシャーのヒット作、無料タイトル、あるいは複数人体制が確認されたスタジオを期待する人(NEOタケトンボは隅々まで個人サークルと読めるが、人数を断定する情報は無い。本作は無料ではない有料作で、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steamのディスクリプタ上、性的な要素もない)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "chill-with-you-lofi-story": {
    published: "2026-07-09",
    publishAt: "2026-07-09",
    kind: "find",
    leadIndex: 0,
    // genre は新設 "focus-companion-adv"(作業支援ADV): 既存の "visual-novel"/"affection-adv" では
    //   捉えきれない、本作を定義する核——文学少女サトネと「作業通話」をしながら実際のデスクワークに集中する、
    //   Pomodoroタイマー内蔵の作業支援ツール兼サウンドノベル——を専用ラベルとして立てる(ui.ts en/ja
    //   追加済み)。系譜は Lofi Girl(旧ChilledCow・作業/勉強用と銘打った24時間Lo-FiライブDJ配信を確立した
    //   YouTubeチャンネル/音楽レーベル)——「Lo-Fiと共に机に向かう」体験そのものの原点(lineage_anchor_key=
    //   wikidata_qid, Q101833802 の新規 anchor "lofi-girl" で同定)。開発元 Nestopi Inc. 自身がLofi Girlを
    //   影響源と明言した一次情報は確認できていないため、本文でもその旨を正直に明記する(捏造しない・
    //   自信度: 中)。obscurity は "wall"(高評価だが言語/地域の壁で未到達): レビュー総数11,726件・
    //   好評率98%と母数は大きく評価も高いが、英語レビューは1,349件(11.5%、Steam自身のレビューAPIで
    //   実測確認済み)にとどまり大半が日本語・中国語・韓国語圏のプレイヤーによるもの。reachState は
    //   "unreached_west"(英語含む7言語に対応済みでnoEnglish=falseだが、Kotaku・Automaton West・Anime
    //   News Networkなど西側メディアの記事化は始まっているものの、Steamレビュー母数で見た西側ユーザーの
    //   本格流入はまだこれから)。reviewBand は持たせない: 11,726件は既存の"hundreds"(数百)にも
    //   "around_1k"(約千)にも遥かに収まらない桁で、既存の帯に無理に当てはめず、新しい帯も捏造しない。
    //   開発元/発行元は株式会社ネストピ(東京都台東区浅草橋)の自社セルフパブリッシュ。会社全体で従業員
    //   約20名(派遣含む)、資本金920万円、設立2017年。自社方針として「1タイトルにつきチーム10人以下、
    //   開発期間最大1.5年」を公言しているが、本作固有のチーム人数は非公開のため会社規模からの推定
    //   (自信度: 中)。release_date は Steam appdetails 実測(2025年11月16日、日本語版・英語版とも一致)を
    //   正として採用。でんふぁみこゲーマーの別記事は「2024年11月リリース以降、累計30万本」と記述しており
    //   1年のズレがあるが、これは二次情報源のため両論併記し、Steamの記載日を正として保留する(捏造しない)。
    //   content_descriptors は ids=[]・notes=null(API実測)。
    meta: { genre: "focus-companion-adv", lineage: "lofi-girl", obscurity: "wall", reachState: "unreached_west", rarity: { reviews: 11726, positivePct: 98, noEnglish: false } },
    games: [
      {
        name_en: "Chill with You : Lo-Fi Story",
        name_ja: "Chill with You : Lo-Fi Story",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3548580/Chill_with_You__LoFi_Story/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A work-focused sound novel developed and self-published by Nestopi Inc. (Nestopi, based in Asakusabashi, Tokyo), where you sit down to real deskwork alongside Satone, an imaginative girl who loves writing novels, over what the game itself calls a 'work call.' A Pomodoro timer runs the whole session: you set it before you start, and it schedules the short, regular breaks that Steam's own feature list says are there to keep your concentration at its peak, rather than just decorating the screen. While you work you can swap the Lo-Fi music, ambient nature sounds, and background scenery, each of which the store page describes as reflecting Satone's own mood that session, and the story is gated by that same effort: the more sessions you complete, the more chapters unlock and the closer the two of you grow, tracked across 23 Steam achievements with names like 'Task Complete!,' 'Partner,' and 'See you later.' It is single-player only, saves through Steam Cloud, and by Steam's own content descriptors carries nothing sexual (ids: none, notes: none, confirmed via the storefront API); a denfaminicogamer interview with the developers goes further, quoting the team saying they scrapped a proposed set of revealing outfits because 'you can't concentrate' wearing them, and that they deliberately avoided a romance-forward feel and cut moe-style cuteness to keep the whole game pointed at focus rather than courtship. Released November 16, 2025 per Steam's own listing (confirmed in both Japanese and English), it supports English, Simplified Chinese, Traditional Chinese, Japanese with full voice acting, Portuguese-Brazil, Russian, and Korean, on Windows and Mac (Mac support arrived by a patch the store page dates to May 2025); a denfaminicogamer piece elsewhere describes the game as having launched back in November 2024 with cumulative sales already past 300,000 copies by the time of that interview, a full year ahead of the date Steam itself lists, and we surface that conflict rather than silently pick a side, treating Steam's own recorded date as authoritative pending further verification. It sits at Overwhelmingly Positive, 98 percent, but that is over 11,726 reviews, with only 1,349 of them (about 11.5 percent) in English; the rest run overwhelmingly Japanese, Chinese, and Korean. Western outlets including Kotaku, Automaton West, and Anime News Network have already begun writing about it, so the West's discovery of it has started, just not yet in the Steam review numbers themselves. Nestopi is not a solo circle: the company runs to roughly 20 people including dispatched staff, on 9.2 million yen of capital, founded in 2017, and it has publicly stated a policy of holding each title's team to 10 people or fewer and each development cycle to at most a year and a half, though it has not disclosed exactly how many of those people worked on this specific game.",
        desc_ja: "日本の株式会社ネストピ(東京都台東区浅草橋)が開発・自社セルフパブリッシュする、作業支援型のサウンドノベル。プレイヤーは、小説を書くのが好きな妄想豊かな少女・サトネと「作業通話」をしながら、実際のデスクワークに向き合う。セッションの軸になるのはPomodoroタイマーだ——作業を始める前にセットしておくと、Steam自身の機能紹介にある通り、集中力を最大化するための短く定期的な休憩を管理してくれる、単なる飾りではない仕組みだ。作業中はLo-Fi楽曲・自然の環境音・背景の風景をカスタマイズでき、ストアページによればそのどれもがその時々のサトネの感情を映すという。物語も同じ努力でゲートされている——作業をこなすほどチャプターが解放され、2人の距離は縮まっていく。その進捗は23個のSteam実績——「Task Complete!」「Partner」「See you later.」など——で追跡される。シングルプレイヤー専用でSteam Cloudに対応し、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし、API実測で確認済み)、性的な要素はない。でんふぁみこゲーマーの開発者インタビューはさらに踏み込んで、開発チーム自身の言葉として「(露出的な衣装案は)集中できないから」ボツにしたこと、恋愛感のあるデザインを意図的に避けたこと、萌え要素を削ぎ落としてゲーム全体の軸を「集中」に置いたことを明かしている。Steam自身の表記(日本語版・英語版とも一致)によれば2025年11月16日リリースで、対応言語は英語・簡体字中国語・繁体字中国語・フルボイス対応の日本語・ポルトガル語(ブラジル)・ロシア語・韓国語、対応OSはWindowsとmacOS(macOS対応はストアページの記載によれば2025年5月のパッチで追加)。一方、でんふぁみこゲーマーの別記事は本作を「2024年11月リリース以降、累計30万本」と紹介しており、これはSteamの記載日から丸1年早い——この矛盾はどちらか一方を黙って採用せず両論併記し、さらなる裏取りが済むまではSteamの記載日を正として扱う。レビューは「非常に好評」で好評率98%——ただしこれは11,726件のレビューの上での話で、うち英語は1,349件(約11.5%)にとどまり、残りは圧倒的に日本語・中国語・韓国語圏だ。Kotaku・Automaton West・Anime News Networkといった西側メディアはすでに記事化を始めており、西側での発見はもう始まっているが、それはまだSteamのレビュー数そのものには反映されていない。株式会社ネストピは個人サークルではない——派遣スタッフを含め会社全体でおよそ20名、資本金920万円、設立は2017年で、「1タイトルにつきチームは10人以下、開発期間は最大1年半」という方針を公言している。ただし本作固有の担当人数までは公表されていない。",
      },
      {
        name_en: "Lofi Girl",
        name_ja: "Lofi Girl",
        status: "established",
        wikidata: "https://www.wikidata.org/wiki/Q101833802",
        homepage: "https://lofigirl.com",
        tag_en: "The likely origin",
        tag_ja: "系譜上の原点(推定)",
        desc_en: "A likely, but not developer-confirmed, root of this taste: Lofi Girl, the French YouTube channel and music label created by Dimitri Somoguy, which launched on 18 March 2015 as ChilledCow. On 25 February 2017 it began the 24/7 lo-fi hip hop livestream it is now known for, branded from the start as relaxation music for people working or studying, and the channel took the name Lofi Girl in 2021. Its mascot, a girl with headphones bent over a desk beside a window with a cat on the sill, animated by Juan Pablo Machado since March 2018, turned sitting down to real work with quiet lo-fi playing and the sense of someone working alongside you into a specific, recognizable ritual, one that never asked you to read or click anything, only to keep the stream running while you worked. Chill with You: Lo-Fi Story takes that same ritual, a companion, a lo-fi soundtrack, and time spent working, and turns it into something you can actually talk to: Satone sits with you through a Pomodoro-timed session, the music and ambience you choose are said to reflect her mood, and the story between you only advances because you worked. We found no statement from Nestopi Inc. naming Lofi Girl specifically as an influence, so we list this lineage as our own read of a shared ritual, not a confirmed one.",
        desc_ja: "この味の、開発者による確認は取れていないものの、もっとも近しい原点候補——Lofi Girl。Dimitri Somoguyが制作したフランスのYouTubeチャンネル/音楽レーベルで、2015年3月18日に「ChilledCow」として開設された。2017年2月25日、現在知られる24時間ノンストップのLo-Fi Hip Hopライブ配信を開始し、当初から「作業や勉強をする人のためのリラックスミュージック」と銘打っていた。チャンネルは2021年に「Lofi Girl」へ改称する。2018年3月から起用された、ヘッドホンをつけ、猫のいる窓辺のそばで机に向かう少女のマスコット(アニメーションはJuan Pablo Machadoが担当)は、「静かなLo-Fiと共に、誰かが隣で作業している気配を感じながら、実際に机に向かうこと」を、何かを読んだりクリックしたりする必要すらない、一つの儀式に変えてみせた——ただ配信を流したまま作業すればいい。『Chill with You : Lo-Fi Story』は、その同じ儀式——相棒・Lo-Fiのサウンドトラック・作業に費やす時間——を、実際に言葉を交わせる相手に変える。サトネはPomodoroタイマーで区切られたセッションの間ずっとそばにいて、選んだ音楽や環境音は彼女の気分を映すとされ、2人の物語はあなたが実際に作業したという事実によってのみ進んでいく。株式会社ネストピがLofi Girlを名指しで影響源として挙げた言明は見つかっておらず、そのためここに記す系譜は、共有された儀式そのものからこちらが読み取ったものであり、確定した事実ではないことを明記しておく。",
      },
    ],
    en: {
      title: "Chill with You : Lo-Fi Story - a work-focused sound novel where a built-in Pomodoro timer and the Lo-Fi music you choose gate real story chapters to how much you actually worked, self-published by Japan's Nestopi Inc., Overwhelmingly Positive at 98 percent over 11,726 reviews the West has only just begun to read",
      description: "A work-focused sound novel self-published by Nestopi Inc. in Tokyo. You sit down to real deskwork with Satone, an imaginative girl who loves writing novels, over a Pomodoro-timed 'work call,' customizing the Lo-Fi music, ambient sound, and background that are said to reflect her mood. The more you actually work, the more of her story unlocks and the closer you grow. Overwhelmingly Positive at 98 percent over 11,726 reviews, but only about 11.5 percent are in English; Western press has started covering it, though the Steam review base hasn't caught up yet.",
      h1a: "You set a timer, and then you actually have to work. ",
      h1flip: "The next chapter of her story only opens because you did",
      h1b: ".",
      lede: "A work-focused sound novel developed and self-published by Nestopi Inc., a Tokyo company in Asakusabashi. You sit at a desk with Satone, an imaginative girl who loves writing novels, over what the game itself calls a 'work call': a Pomodoro timer manages your real breaks, and the Lo-Fi music, ambient sound, and background you choose are said to reflect her mood that session. Chapters of her story and the depth of your bond are both gated by the same thing, the actual work you put in, tracked across 23 Steam achievements. By Steam's own descriptors it carries nothing sexual, and developer interviews describe cutting proposed revealing outfits and any romance-forward design to keep the focus on focus. It sits at Overwhelmingly Positive, 98 percent, over 11,726 reviews, but only 1,349 of them, about 11.5 percent, are in English; outlets like Kotaku, Automaton West, and Anime News Network have begun covering it, yet the Steam review numbers still skew overwhelmingly Japanese, Chinese, and Korean.",
      s1: "First, the one feeling",
      feeling: [
        "The Pomodoro timer is not a cosmetic clock in the corner of the screen. You set it before you start, and it is the thing standing between you and the next scene: it holds you to an actual, unskippable stretch of focused work at your own desk before it lets a break, and Satone, arrive.",
        "What that stretch of real focus buys is not an abstract meter. It is measured in exactly one thing: the next chapter of her story and how much closer the two of you grow, so how long you actually worked today and how far this story has moved end up being the same number.",
        "The Lo-Fi music, the ambient sound, and the background you pick are described as reflecting Satone's own mood in that session, so the same panel you use to tune your focus environment doubles as a quiet, wordless way of reading, and tending to, how she is feeling.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You've wanted an actual game built around real focused work, not a to-do list with a skin on it, one with a built-in Pomodoro timer and a story that only advances because you genuinely worked",
        "You want a quiet, ongoing companionship rather than a romance-flagged dating sim; the developers have said in interviews that they scrapped proposed revealing outfits and deliberately avoided a romance-forward design, and Steam's own descriptors list nothing sexual",
        "You want to catch a title that's already Overwhelmingly Positive at 98 percent over 11,726 reviews in Japan, China, and Korea, right as outlets like Kotaku, Automaton West, and Anime News Network start writing about it but before the Steam review base itself, still only about 11.5 percent English, has caught up",
      ],
      bad: [
        "You want an explicitly romantic or sexual visual novel; the developers designed against that on purpose, and Steam's own content descriptors carry nothing sexual",
        "You want a free or Early Access test, or a large-team, big-publisher production; this is a paid, fully launched title with no AI-generated assets, self-published by Nestopi Inc., a company of roughly 20 people including dispatched staff that publicly caps each title's team at 10 people and 1.5 years, though this specific title's own headcount is not disclosed",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Chill with You : Lo-Fi Story - 内蔵Pomodoroタイマーと自分で選ぶLo-Fi楽曲が、実際に働いた分だけ物語の先を開く作業支援サウンドノベル。日本の株式会社ネストピが自社セルフパブリッシュ、好評率98%・11,726件のレビューで「非常に好評」だが、西側はまだ読み始めたばかり",
      description: "東京の株式会社ネストピが自社セルフパブリッシュする作業支援型サウンドノベル。小説を書くのが好きな妄想豊かな少女・サトネとPomodoroタイマー付きの「作業通話」をしながら、実際のデスクワークに向き合う。Lo-Fi楽曲・環境音・背景は彼女の気分を映すとされ、カスタマイズできる。本当に作業をこなすほど彼女の物語が解放され、距離が縮まる。11,726件のレビューで好評率98%の「非常に好評」だが、英語レビューは約11.5%にとどまり、西側メディアの記事化は始まっているもののSteamのレビュー数はまだ追いついていない。",
      h1a: "タイマーをセットしたら、あとは本当に働くしかない。",
      h1flip: "彼女の物語の次の章が開くのは、あなたが実際に手を動かしたからだ",
      h1b: "。",
      lede: "東京都台東区浅草橋の株式会社ネストピが開発・自社セルフパブリッシュする作業支援型サウンドノベル。プレイヤーは、小説を書くのが好きな妄想豊かな少女・サトネと、本作が「作業通話」と呼ぶセッションの中で、実際のデスクワークに向き合う。Pomodoroタイマーが本物の休憩を管理し、選んだLo-Fi楽曲・環境音・背景は、その時々のサトネの気分を映すという。彼女の物語のチャプターと2人の距離、そのどちらも同じもの——実際にこなした作業量——でゲートされていて、進捗は23個のSteam実績で追跡される。Steam自身のディスクリプタ上、性的な要素はなく、開発者インタビューは露出的な衣装案をボツにしたこと、恋愛感のあるデザインを避けたことを明かしている。11,726件のレビューで好評率98%の「非常に好評」だが、うち英語は1,349件、約11.5%にとどまる。Kotaku・Automaton West・Anime News Networkといったメディアはすでに記事化を始めているが、Steamのレビュー数はいまも圧倒的に日本語・中国語・韓国語圏に偏っている。",
      s1: "まず、その一点の感覚",
      feeling: [
        "Pomodoroタイマーは、画面の隅を飾るだけの時計じゃない。作業を始める前に自分でセットする——それが、次のシーンとの間に立ちはだかるものになる。休憩とサトネがやってくる前に、実際に、省略のできない集中作業の時間を、自分の机の前でこなすことを求めてくる。",
        "その集中の時間が買うのは、抽象的なゲージじゃない。買えるものはただ一つ——彼女の物語の次の章と、2人の距離が縮まること。だから「今日どれだけ本当に作業したか」と「この物語がどれだけ進んだか」は、同じ一つの数字になる。",
        "選んだLo-Fi楽曲・環境音・背景は、そのセッションでのサトネの気分を映しているとされる。だから、自分の集中環境を調整するために触るその同じパネルが、彼女がいまどう感じているかを静かに——言葉なしに——読み取り、寄り添うための手段にもなる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "見た目だけ整えたToDoリストではなく、実際の集中作業そのものを軸にしたゲームが欲しい人——内蔵Pomodoroタイマーがあり、本当に作業をこなしたときだけ物語が進む",
        "恋愛フラグの立つ育成/恋愛ゲームではなく、静かに続く相棒関係が欲しい人——開発者はインタビューで、露出的な衣装案をボツにし、恋愛感のあるデザインを意図的に避けたと語っており、Steam自身のディスクリプタ上も性的な要素はない",
        "日本・中国・韓国ですでに11,726件・好評率98%の「非常に好評」を集めている一本を、Kotaku・Automaton West・Anime News Networkといったメディアが記事化を始めた今、Steamのレビュー母数(まだ英語は約11.5%)が追いつく前に触っておきたい人",
      ],
      bad: [
        "あからさまに恋愛的・性的なビジュアルノベルが欲しい人(開発者は意図的にそれを避けており、Steam自身のディスクリプタ上も性的な要素はない)",
        "無料版やアーリーアクセスのお試し、あるいは大所帯・大手パブリッシャーの大作を期待する人(本作は、派遣スタッフを含め約20名の株式会社ネストピが自社セルフパブリッシュする、無料ではない正式リリース済みの有料作で、AI生成アセットはない。同社は「1タイトルにつきチーム10人以下・開発期間最大1.5年」を公言しているが、本作固有の担当人数は非公開)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "the-last-salvage-squad": {
    published: "2026-07-09",
    publishAt: "2026-07-09",
    kind: "find",
    leadIndex: 0,
    // genre は新設 "hand-me-down-mecha-fps"(お下がりメカFPS): 既存の "shoot-em-up"/"shooting-novel"/
    //   "action" では捉えきれない、本作を定義する核——限られた装備の中、撃破された僚機が落とした武器を
    //   「お下がり」として回収しながら進み、死亡即・次のユニットが出撃するライフ制のループ——を専用ラベルと
    //   して立てる(shape-craft-co-op-puzzle 等と同型の細粒度ラベル追加・ui.ts en/ja 追加済み)。系譜は
    //   THE 地球防衛軍(サンドロット開発・ディースリー・パブリッシャー発売、2003年PS2)——「等身大の防衛者が
    //   圧倒的なエイリアンの侵略に一戦ずつ挑む」味の原点(lineage_anchor_key=wikidata_qid, Q5570229 の
    //   新規 anchor "chikyu-boueigun" で同定)。この帰属は開発者本人の言明ではなく独立レビュアー
    //   (banshu-doukoukai.com)の比較に基づく推定のため自信度: 中(捏造しない)。既出の "ultraman" アンカー
    //   (単体の巨大ヒーローvs単体の怪獣という一騎打ちの味)とは別物で重複なし。
    //   【wikidata QIDの内部矛盾に関する注記】Q5570229 は jawiki サイトリンクが「THE 地球防衛軍」(2003年、
    //   本作の原点として正しい対象)を指す一方、enwiki サイトリンクは「Global Defence Force」(2005年発売の
    //   続編『地球防衛軍2』)を指し、英語版記事本文には2003年版への言及が一切ない(curl実測で確認済み・
    //   Wikidata側のクロスリンク不整合と判断)。そのため本文は jawiki が指す2003年版の事実のみを記載し、
    //   確認の取れない「西タイトルGlobal Defence Force」という帰属は書かない(捏造しない・正直さ)。
    //   obscurity は "deep"(総レビュー405件は西側ヒット作と比べればまだ小規模)。reachState は意図的に
    //   持たせない: 英語レビュー比率53.6%(217/405、Steam自身のレビューAPIで実測確認済み)は過半数に達して
    //   おり、Kotaku・Noisy Pixel・Game Critixなど西側メディアがすでにレビュー済みのため
    //   reachState="unreached_west" は立てない(devil-blade-reboot/sonokuni型・誇張しない正直さ)。西到達が
    //   一定進んでいる一方、総レビュー数405件自体はまだ小規模である点は本文で両論併記する。開発元は日本の
    //   個人開発者 Sunfish Kumano、発売元は代表大柳竜児氏一人による"一人パブリッシャー"わくわくゲームズ
    //   合同会社(Waku Waku Games)——大手性なし、is_doujin_indie=true。release_date は Steam appdetails
    //   実測の発売日(2026年6月17日、日本語版・英語版とも一致)を正として採用。4Gamer/GAME Watch等一部国内
    //   メディアは発売日を6月18日と報じており1日のズレがあるが(Steamの太平洋時間基準表記の可能性)、
    //   二次情報として両論併記しSteamの記載日を正とする(捏造しない)。content_descriptors は
    //   ids=[]・notes=null(API実測)。
    meta: { genre: "hand-me-down-mecha-fps", lineage: "chikyu-boueigun", obscurity: "deep", reviewBand: "hundreds", rarity: { reviews: 405, positivePct: 98, noEnglish: false } },
    games: [
      {
        name_en: "The Last Salvage Squad",
        name_ja: "最終回収SQUAD",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3551190/The_Last_Salvage_Squad/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A single-player 2.5D FPS in which you pilot CogrinaUnits, 12-meter-tall autonomous humanoid units built to keep fighting after a gargantuan alien warship all but wiped out human civilization in a single stroke, developed by the Japanese solo creator Sunfish Kumano and published by Waku Waku Games, a one-person publishing company whose sole representative is Ryuji Oyanagi. Missions play out as short, hard-edged skirmishes against alien war machines styled after the multi-legged combatants of classic Japanese sci-fi and tokusatsu, and per Steam's own feature list, every one of them opens with the same choice: use the terrain to pick the enemy apart from range, or close the distance and finish it up close. Equipment stays scarce by design. When your unit is defeated, the next one is sent out immediately, and it inherits whatever weapon the fallen unit managed to drop, a 'hand-me-down' salvage loop that re-arms you out of your own losses rather than a shop or a levelling system. Between fights, the game settles into lighter conversation scenes with fellow units, plus, per Steam's own listing, 'a shiba inu'; one of its eight Steam achievements, 'A Bone to Pick,' appears to nod to that same dog. This is the full version of Sunfish Kumano's earlier prototype Hand-Me-Down, which established that same weapon-salvage core, and this release carries it forward with new pickups, among them a katana and a rocket launcher, and built-out presentation. Released June 17, 2026 per Steam's own listing in both its Japanese and English pages; some Japanese outlets, including 4Gamer and GAME Watch, reported June 18, a one-day gap we read as most likely a Pacific-time listing quirk rather than a correction, and note here rather than silently pick a side. It sits at Very Positive, 98 percent per Steam's own store page (399 of 405 reviews positive per Steam's review API), single-player only with full controller support, a paid title at ¥1,500, not free, fully launched and not in Early Access, with no AI-generated assets and, by Steam's own content descriptors, nothing sexual (ids: none, notes: none). It supports Japanese, English, Simplified Chinese, and Traditional Chinese, and about 217 of its 405 reviews, roughly 53.6 percent, are already in English, a clear majority; outlets including Kotaku, Noisy Pixel, and Game Critix have already reviewed it, so calling this a gem the West has not found yet would not be honest. What is true is that its total review count, 405, is still a small, early number next to any Western hit, so this reads less as a game the West has missed and more as one it has only just started properly meeting.",
        desc_ja: "人類文明をほぼ一撃で壊滅させた超巨大エイリアン宇宙船襲来の後、それでも戦い続けるために作られた全高12mの自律型人型ユニット「コグリナユニット」を操作する、シングルプレイの2.5D FPS。開発は日本の個人開発者 Sunfish Kumano、発売は代表大柳竜児氏ただ一人による「一人パブリッシャー」、わくわくゲームズ合同会社(Waku Waku Games)。各ミッションは、往年の日本のSF・特撮作品に登場するような多脚型のエイリアン兵器を相手にした、短く歯ごたえのある遭遇戦として展開し、Steam自身の機能紹介によれば、そのどれもが同じ選択から始まる——地形を活かして遠距離から敵を切り崩すか、距離を詰めて肉薄で仕留めるか。装備はあえて限られている。ユニットが撃破されると次のユニットが即座に出撃し、倒れたユニットが落とした武器をそのまま受け継ぐ——ショップやレベリングではなく、自分自身の損失から再武装していく「お下がり」回収のループだ。戦闘の合間には僚機との軽い会話シーンが挟まり、Steamのストア表記によれば「柴犬も登場」する。8つあるSteam実績のひとつ「A Bone to Pick(骨の落とし前)」は、その柴犬を指しているようだ。本作は、同じ武器お下がり回収の核をすでに確立していた Sunfish Kumano の前作プロトタイプ「Hand-Me-Down」の完全版にあたり、刀やロケットランチャーなど新たな回収武器と、作り込まれた演出を加えて引き継いでいる。Steam自身の表記(日本語版・英語版とも一致)によれば2026年6月17日にリリースされたが、4Gamer・GAME Watchなど一部の国内メディアは発売日を6月18日と報じており、この1日のズレは太平洋時間基準の表記によるものである可能性が高いと見て、どちらか一方を黙って採用せずここに両論併記しておく。レビューはSteam自身のストアページ表記で好評率98%の「非常に好評」(Steamのレビューデータでは405件中399件が好評)。シングルプレイ専用でフルコントローラー対応、無料ではない有料作(1,500円)で、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)、性的な要素もない。対応言語は日本語・英語・簡体字中国語・繁体字中国語で、405件のレビューのうち英語は約217件、約53.6%とすでに過半数を占める。Kotaku・Noisy Pixel・Game Critixといったメディアがすでにレビューを掲載しており、「西側がまだ見つけていない一本」と呼ぶのは正直ではない。本当なのは、405件という総レビュー数はまだ西側のヒット作と比べれば小さな早い段階の数字だということで、これは「西に見逃された作品」というより「西がようやくきちんと出会い始めた作品」と読むべきものだ。",
      },
      {
        name_en: "Chikyu Boueigun",
        name_ja: "THE 地球防衛軍",
        status: "established",
        homepage: "https://ja.wikipedia.org/wiki/THE_%E5%9C%B0%E7%90%83%E9%98%B2%E8%A1%9B%E8%BB%8D",
        wikidata: "https://www.wikidata.org/wiki/Q5570229",
        tag_en: "The likely origin",
        tag_ja: "系譜上の原点(推定)",
        desc_en: "A likely, but not developer-confirmed, root of this taste: THE 地球防衛軍 (Chikyu Boueigun), an action-shooting game developed by Sandlot and released as SIMPLE2000 Series Vol. 31, published in Japan by D3 Publisher for the PlayStation 2 on June 26, 2003 (and in Europe on February 27, 2004, published by Agetec under the title Monster Attack). Rather than one giant hero facing down a single kaiju, it drops the player into repeated short skirmishes as one soldier among many, ordinary-scale defenders holding a city against a relentless, overwhelming alien invasion, mission after mission. It became the first entry in what grew into the long-running Earth Defense Force series, whose later installments carried that name internationally, and it set a template that lineage has repeated ever since: a small, mortal defender thrown again and again at a threat too large for any one of them to end alone. The Last Salvage Squad's CogrinaUnits carry that same premise, city-scale swarms of alien war machines met one short encounter at a time, into their own distinct core: a unit that falls is simply replaced by the next one, armed with whatever weapon its predecessor managed to salvage. We found no statement from Sunfish Kumano naming Chikyu Boueigun or the Earth Defense Force series as an influence; this lineage is a comparison independent reviewers, including the Japanese blog banshu-doukoukai.com, have drawn, not one either side has confirmed.",
        desc_ja: "この味の、開発者による確認は取れていないものの、もっとも近しい原点候補——THE 地球防衛軍。サンドロットが開発し、SIMPLE2000シリーズ Vol.31としてディースリー・パブリッシャーが日本国内向けに発売したアクションシューティングで、PlayStation 2向けに2003年6月26日に発売された(欧州では2004年2月27日、Agetecの販売により「Monster Attack」のタイトルで発売)。一人の巨大なヒーローが単体の怪獣に立ち向かうのではなく、プレイヤーを、都市を蹂躙する圧倒的なエイリアンの侵略に立ち向かう、大勢の中の一兵士——等身大の防衛者として、短い遭遇戦へ繰り返し送り込む。本作は、後に長寿シリーズとなる「地球防衛軍」シリーズの第1作となり、後続作は海外でもその名で展開されていく。そしてこの作品が確立したのは、以後この系譜が繰り返すことになる型——一人では終わらせられないほど大きな脅威に、小さく命ある防衛者が何度も何度も投げ込まれる、という型だ。『最終回収SQUAD』のコグリナユニットは、この同じ前提——都市規模のエイリアン兵器の大群に、短い遭遇戦を一つずつ挑んでいく——を受け継ぎながら、そこに本作独自の核を据える——倒れたユニットは、ただちに次のユニットに置き換わり、前任者が回収できた武器を受け継いで出撃する。Sunfish Kumano がTHE地球防衛軍や地球防衛軍シリーズを影響源として名指しした言明は見つかっておらず、この系譜は、日本のブログ banshu-doukoukai.com を含む独立したレビュアーたちが読み取った比較であり、どちらの側からも確認された事実ではない。",
      },
    ],
    en: {
      title: "The Last Salvage Squad - a single-player 2.5D FPS where a fallen squadmate's dropped weapon is the only way the next CogrinaUnit re-arms, sent out immediately against alien war machines styled after classic tokusatsu sci-fi, the full version of solo developer Sunfish Kumano's prototype Hand-Me-Down, Very Positive at 98 percent over 405 reviews already more than half English",
      description: "A single-player 2.5D FPS by Japanese solo developer Sunfish Kumano, published by the one-person Waku Waku Games. Pilot a 12-meter autonomous CogrinaUnit against alien war machines styled after classic tokusatsu sci-fi; when your unit falls, the next one is sent out immediately, inheriting whatever weapon the fallen one managed to drop. Very Positive at 98 percent over 405 reviews, and already about 53.6 percent English.",
      h1a: "Your CogrinaUnit falls. ",
      h1flip: "The next one is already walking out, carrying whatever weapon it just salvaged off the wreck",
      h1b: ".",
      lede: "A single-player 2.5D FPS developed by the Japanese solo creator Sunfish Kumano and published by Waku Waku Games, a one-person publishing company. You pilot a CogrinaUnit, one of the 12-meter-tall autonomous humanoids still fighting after a gargantuan alien warship all but wiped out human civilization, through short, hard-edged skirmishes against alien war machines styled after classic tokusatsu sci-fi, choosing each time whether to use the terrain at range or close in and finish the fight by hand. Equipment stays scarce on purpose: when your unit falls, the next is sent out immediately, inheriting whatever weapon the last one managed to salvage. It is the full version of Sunfish Kumano's earlier prototype Hand-Me-Down. Released in June 2026, it is Very Positive at 98 percent over 405 reviews, and with outlets like Kotaku, Noisy Pixel, and Game Critix already reviewing it, the West has already started to meet it, even if the review count itself is still small.",
      s1: "First, the one feeling",
      feeling: [
        "Every mission starts you scarce: only the weapons that survived the last fight are on hand, so picking up what a fallen CogrinaUnit dropped is never a side objective, it is how you stay armed at all.",
        "Getting taken down is not a stopping point. The next unit is already walking out to relieve it, inheriting whatever gun or blade its predecessor managed to salvage, so a loss becomes the very upgrade that lets you keep fighting.",
        "Every multi-legged war machine offers the same fork before you fire a shot: use the terrain to take it apart from range, or close the distance and finish it up close, and which one you choose decides what you will have left to salvage when it is over.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love the Earth Defense Force taste of grunt-scale defenders throwing themselves at an overwhelming alien invasion one skirmish at a time, but want that swarm reframed around a single unit you pilot, one whose death simply sends the next one out, armed with whatever the last one dropped",
        "You want a tactical choice on every single encounter rather than a menu before it: use the terrain to pick a multi-legged war machine apart from range, or close the gap and finish it by hand, with equipment so scarce that a fallen ally's gun is the only upgrade you get",
        "You want an early look at a solo Japanese developer's full realization of an idea: this is the complete version of Sunfish Kumano's earlier prototype Hand-Me-Down, Very Positive at 98 percent over 405 reviews, before a bigger audience catches up to what Kotaku, Noisy Pixel, and Game Critix have already started writing about",
      ],
      bad: [
        "You want an undiscovered game the West has not touched yet; about 53.6 percent of its 405 reviews are already in English, and outlets like Kotaku, Noisy Pixel, and Game Critix have already reviewed it, so calling this hidden from the West would not be honest. What is true is that 405 total reviews is still a small, early number next to any Western hit",
        "You want a squad you command as a group, or an online co-op shooter; Steam lists this as single-player only, one CogrinaUnit at a time, and it is a paid, fully launched title, not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's own descriptors",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "最終回収SQUAD - 倒れた僚機が落とした武器だけが次のコグリナユニットの再武装手段になる、シングルプレイ2.5D FPS。往年の特撮・SF風エイリアン兵器を相手に即座に出撃していく。個人開発者 Sunfish Kumano のプロトタイプ「Hand-Me-Down」の完全版で、405件のレビューで好評率98%の「非常に好評」、すでに英語レビューが半数を超える",
      description: "日本の個人開発者 Sunfish Kumano が開発し、一人パブリッシャーのわくわくゲームズ合同会社(Waku Waku Games)が発売するシングルプレイ2.5D FPS。全高12mの自律型ユニット「コグリナユニット」を操作し、往年の特撮・SF風のエイリアン兵器と戦う。ユニットが倒れると次のユニットが即座に出撃し、倒れたユニットが落とした武器をそのまま受け継ぐ。405件のレビューで好評率98%の「非常に好評」、すでに英語レビューは約53.6%を占める。",
      h1a: "コグリナユニットが、倒れる。",
      h1flip: "次の一機はもう出撃していて、その手には、たったいま回収した武器が握られている",
      h1b: "。",
      lede: "日本の個人開発者 Sunfish Kumano が開発し、一人パブリッシャーのわくわくゲームズ合同会社(Waku Waku Games)が発売するシングルプレイ2.5D FPS。超巨大エイリアン宇宙船が人類文明をほぼ一撃で壊滅させたのち、それでも戦い続ける全高12mの自律型人型ユニット「コグリナユニット」を操作し、往年の特撮・SF作品を思わせるエイリアン兵器との、短く歯ごたえのある遭遇戦に挑む。地形を活かして遠距離から崩すか、距離を詰めて肉薄で仕留めるか——そのたびに選ぶことになる。装備はあえて限られていて、ユニットが倒れると次のユニットが即座に出撃し、前任者が回収できた武器をそのまま受け継ぐ。Sunfish Kumano の前作プロトタイプ「Hand-Me-Down」の完全版にあたる。2026年6月にリリースされ、405件のレビューで好評率98%の「非常に好評」。Kotaku・Noisy Pixel・Game Critixといったメディアがすでにレビューを掲載しており、レビュー数そのものはまだ小さいものの、西側はすでにこの作品と出会い始めている。",
      s1: "まず、その一点の感覚",
      feeling: [
        "どのミッションも、手持ちの武器が心もとない状態から始まる——前の戦いを生き延びた武器しか手元にないから、倒れたコグリナユニットが落としたものを拾うことは、寄り道ではなく、武装を保つための唯一の手段になる。",
        "撃破されることは、そこで終わりを意味しない。倒れたユニットを引き継ぐ次の一機がもう出撃していて、前任者が回収できた銃や刃をそのまま受け継ぐ。だから一つの喪失が、そのまま次を戦うための強化そのものになる。",
        "多脚型のエイリアン兵器はどれも、撃ち始める前に同じ分岐を突きつけてくる——地形を活かして遠距離から崩すか、距離を詰めて肉薄で仕留めるか。どちらを選ぶかが、その戦いの後に何を回収できるかまで決めていく。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "圧倒的なエイリアンの侵略に、等身大の防衛者たちが一戦一戦、身を投げ出していく「地球防衛軍」的な味が好きで、それを「自分が操るのは常に一機」「倒れれば、前任者の落とした武器を受け継いだ次の一機が出撃する」という形に据え替えたものが欲しい人",
        "戦う前の分岐そのものが毎回の勝負になるゲームが欲しい人——地形を活かして多脚型の兵器を遠距離から崩すか、距離を詰めて肉薄で仕留めるか。装備は極端に限られていて、倒れた僚機の武器だけが唯一のアップグレードになる",
        "個人開発者が一つのアイデアを完成させた形を早めに触りたい人——本作は Sunfish Kumano の前作プロトタイプ「Hand-Me-Down」の完全版で、405件のレビューで好評率98%の『非常に好評』。Kotaku・Noisy Pixel・Game Critixがすでに書いている一本に、より大きな注目が集まる前に触れる",
      ],
      bad: [
        "西側がまだ触れていない、完全に未発見の一本が欲しい人(405件のレビューのうち約53.6%はすでに英語で、Kotaku・Noisy Pixel・Game Critixといったメディアもすでにレビューを掲載している。だから「西側が見つけていない」と呼ぶのは正直ではない。本当なのは、405件という総レビュー数は、西側のヒット作と比べればまだ小さく早い段階の数字だということだ)",
        "複数人で操るチーム編成や、オンライン協力プレイが欲しい人(Steam上ではシングルプレイ専用で、常に1機のコグリナユニットを操作する形式。無料ではない有料の正式リリース済みタイトルで、アーリーアクセスではなく、AI生成アセットはなく、Steam自身のディスクリプタ上、性的な要素もない)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "dyping-escape": {
    published: "2026-07-10",
    publishAt: "2026-07-10",
    kind: "find",
    leadIndex: 0,
    // genre は新設 "meta-typing-horror"(メタタイピングホラー): 既存の "horror-novel"/"psychological-horror"/
    //   "exploration-horror" では捉えきれない、本作を定義する核——ゲームマスターの"目玉"が指示する言葉を
    //   タイピングするだけの単純な入力が、そのまま第四の壁を破ってプレイヤーの実PC(であるかのような画面)に
    //   反映されるという、タイピングを唯一の動詞にしたメタホラー——を専用ラベルとして立てる
    //   (hand-me-down-mecha-fps 等と同型の細粒度ラベル追加・ui.ts en/ja 追加済み)。
    // 系譜は Imscared(IMSCARED, Ivan Zanotti, 2012年に無料公開・2016年2月3日に有料完全版としてSteam発売)——
    //   「画面の出来事がプレイヤーの実際のPCに起きているように見せる」第四の壁破壊型メタホラーの原点
    //   (lineage_anchor_key=steam, appid 429720 の新規 anchor "imscared" で同定)。この帰属は開発者本人の
    //   言明ではなく、共通するメカニクスからの当サイト独自の比較のため自信度: 中(捏造しない・
    //   chikyu-boueigun/lofi-girl 型)。obscurity は "deep"(noEnglish=false、Steam自身が英語対応済みだが
    //   西への到達がまだ薄いタイプ・devil-blade-reboot/the-last-salvage-squad 型と異なり英語レビュー比率が
    //   過半数に遠く及ばないため reachState を立てる判断)。reachState="unreached_west" は、553件のレビュー
    //   のうち英語が73件・約13.2%と実測(Steam appreviews API実測)に基づく。AUTOMATON WEST(英語圏メディア)
    //   による記事化、BitSummit・INDIE Live Expo 2025でのOfficial Selectionは既に確認済みだが、母数の大半が
    //   日本語圏である実測を誇張せず、"西側が本格的に出会い始める前"の段階として reachState を立てる
    //   (誇張しない正直さ)。content_descriptors は ids=[]・notes=null(API実測)。
    meta: { genre: "meta-typing-horror", lineage: "imscared", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 553, positivePct: 92, noEnglish: false } },
    games: [
      {
        name_en: "Dyping Escape",
        name_ja: "Dyping Escape",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3406810/Dyping_Escape/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A first-person meta horror typing game whose 'game master' is an unsettling floating eyeball: it dictates the exact words you must type, and per Steam's own listing, whatever you type is reflected straight back onto what looks like your own real desktop. Developed by the solo Japanese creator behind Heaviside Creations, a Tokyo University graduate and former game-company planner who left to make games full time (his wife composes the music), and published by PLAYISM, the Japanese indie-focused label run by Active Gaming Media. There is no puzzle in what to type, only in what happens once you have: unwanted programs appear to run, a fake 'hack' plays out exactly as dictated, and at one point you are walked keystroke by keystroke into typing your own signature onto an unreasonable contract you never agreed to. Per Steam's own feature list it leans entirely on psychological and environmental dread rather than gore or jump scares, and layers a typing-rank scoring system on top, aiming players at a clean S rank even as the same sequence keeps unsettling them. It is a substantial upgrade of the creator's own earlier work, the free browser game DYPING, released in December 2024 and played more than 500,000 times on unityroom; per a developer interview, a roguelike mode was considered and dropped once PLAYISM judged it unnecessary, so nothing here regenerates procedurally. Released March 13, 2026, it is Very Positive at 92 percent per Steam's own store page (510 of 553 reviews positive per Steam's review API), a paid, fully launched title, not free and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). It supports English, Japanese, and Simplified Chinese, but only about 73 of its 553 reviews, roughly 13.2 percent, are in English so far. The English-language outlet AUTOMATON WEST has already written about it, and it carried Official Selection status at both BitSummit and INDIE Live Expo 2025, alongside coverage from Japanese outlets including 4Gamer and Game*Spark, so calling it a game the West has never heard of would not be honest. What is true is that the overwhelming majority of its audience and its praise so far is Japanese-speaking, and its reach beyond that is only just beginning.",
        desc_ja: "一人称視点のメタホラー・タイピングゲーム。「ゲームマスター」は不気味に浮遊する”目玉”で、プレイヤーに打つべき言葉を指示してくる——そしてSteam自身のストア表記によれば、入力した言葉はそのまま、あなた自身の実際のデスクトップであるかのような画面へ反映される。開発は日本のソロクリエイター、Heaviside Creations(高荒大明、東京大学卒・元ゲーム会社プランナーで専業インディーへ転向、音楽は妻が担当)、発売は日本のインディー専門レーベル PLAYISM(運営はActive Gaming Media Inc.)。何を打つかにパズルはなく、打った後に何が起きるかにこそ恐怖がある——望んでもいないプログラムが実行されたように見え、指示された通りの「ハッキング」が偽装されて進行し、あるところではキー入力一つひとつを通じて、同意していない理不尽な契約書へ自らの署名を打ち込まされる。Steam自身の機能紹介によれば、グロテスクやジャンプスケアに頼らず、心理的・環境的な恐怖だけで押し切る設計であり、その上にタイピングのスコア/ランク機能を重ね、Sランクを目指したくなる仕掛けが、恐怖そのものを何度も再演させる。本作は、開発者自身の前作、2024年12月に無料公開されunityroomで50万回以上プレイされたブラウザゲーム『DYPING』の大幅なアップグレード版であり、開発者インタビューによれば、ローグライクモードは検討されたものの、パブリッシャーのPLAYISMが「不要」と判断して見送られた——つまり本作には手続き生成で再生成される要素はない。2026年3月13日にリリースされ、Steam自身のストア表記で好評率92%の「非常に好評」(Steamのレビューデータでは553件中510件が好評)。無料ではない有料の正式リリース済みタイトルで、アーリーアクセスではなく、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。対応言語は英語・日本語・簡体字中国語だが、553件のレビューのうち英語は約73件、約13.2%に留まる。英語圏メディアのAUTOMATON WESTがすでに記事化しており、BitSummitおよびINDIE Live Expo 2025では「Official Selection」に選出、4Gamer・Game*Sparkなど国内メディアの掲載もある——だから「西側がまったく知らない一本」と呼ぶのは正直ではない。本当なのは、その支持のほとんどが今なお日本語圏に偏っているということで、それより先への広がりはまだ始まったばかりだ。",
      },
      {
        name_en: "Imscared",
        name_ja: "Imscared",
        status: "established",
        steam: "https://store.steampowered.com/app/429720/IMSCARED/",
        tag_en: "The likely origin",
        tag_ja: "系譜上の原点(推定)",
        desc_en: "A likely, though not developer-confirmed, root of this taste: Imscared (stylized IMSCARED), a first-person horror game created by the solo Italian developer Ivan Zanotti, first released for free in 2012 and expanded into a full paid release, IMSCARED: A Pixelated Nightmare, on Steam on February 3, 2016. To finish it, the player has to outwit two entities, White Face and HER, that reach past the game's own fiction to act on what looks like the player's real computer, creating files on the desktop and faking crashes, and folding its ending into a file the player has to find and delete on their own machine to beat the game. That premise, staging what happens on screen as something happening to your actual PC rather than to a character, is widely credited with helping define the fourth-wall-breaking strand of meta horror, and both its 2012 and 2016 releases went viral for exactly that reason, praised at the time by PC Gamer, Polygon, and Rock Paper Shotgun, and later named by IGN as one of the best horror games on PC. Dyping Escape's floating eyeball game master, which reflects your typed words back onto what looks like your own desktop and walks you into signing a contract you never agreed to, carries that same premise forward with typing as its sole verb. We found no statement from the developer behind Heaviside Creations naming Imscared as an influence; this lineage is our own reading of a shared taste, not a confirmed statement from either side.",
        desc_ja: "この味の、開発者による確認は取れていないものの、もっとも近しい原点候補——Imscared(表記はIMSCARED)。イタリアのソロ開発者 Ivan Zanotti が制作した一人称ホラーゲームで、2012年に無料で最初に公開され、2016年2月3日には有料の完全版『IMSCARED: A Pixelated Nightmare』としてSteamでリリースされた。クリアするにはプレイヤーは White Face と HER という2体の存在を出し抜く必要があり、彼らはゲームというフィクションの外側にまで手を伸ばし、プレイヤーの実際のパソコンであるかのような画面上でファイルを作成したり、偽のクラッシュを起こしたりする——そしてエンディングは、プレイヤーが自分のPC上で実際に見つけて削除しなければならない1つのファイルへと折り込まれている。「画面で起きていることは、キャラクターにではなく、あなたの実際のPCに起きているように見せる」というこの前提は、第四の壁を破るメタホラーというジャンルの一系統を定義したと広く評価されており、2012年版・2016年版とも、まさにその理由でバイラルヒットとなった。当時PC Gamer・Polygon・Rock Paper Shotgunが賞賛し、後にIGNは2016年版を「PC向けベストホラーゲーム」の1本に選んでいる。『Dyping Escape』の浮遊する目玉のゲームマスターは、打ち込んだ言葉をそのまま自分自身のデスクトップであるかのような画面へ反映し、同意していない契約書への署名へとプレイヤーを導く——同じ前提を、「タイピング」だけを唯一の動詞として引き継いでいる。Heaviside Creations の開発者本人がImscaredを影響源として名指しした言明は見つかっておらず、この系譜は、共通する味わいについての当サイト独自の読み解きであり、どちらの側からも確認された事実ではない。",
      },
    ],
    en: {
      title: "Dyping Escape - a meta horror typing game where every phrase the eyeball game master dictates is reflected straight onto what looks like your own real desktop, from solo Japanese developer Heaviside Creations via PLAYISM, an upgrade of the free browser hit DYPING (500,000+ plays), Very Positive at 92 percent over 553 reviews though still only about 13 percent English",
      description: "A meta horror typing game by the solo Japanese developer behind Heaviside Creations, published by PLAYISM. An unsettling floating eyeball dictates the words you type, and whatever you enter is reflected straight back onto what looks like your own real desktop, up to and including signing your name on a contract you never agreed to. An upgrade of the free browser hit DYPING (500,000+ plays). Very Positive at 92 percent over 553 reviews, still only about 13.2 percent English.",
      h1a: "You type exactly what the eyeball tells you to. ",
      h1flip: "What you just typed is already happening on your own real desktop",
      h1b: ".",
      lede: "A first-person meta horror typing game developed by the solo Japanese creator behind Heaviside Creations and published by PLAYISM. An unsettling floating eyeball serves as your game master, dictating the exact words you must type, and per Steam's own listing, whatever you enter is reflected straight back onto what looks like your own real desktop, an unwanted program run here, a faked hack there, building toward the moment you are walked keystroke by keystroke into signing your own name on a contract you never agreed to. It leans entirely on psychological and environmental dread rather than gore or jump scares, with a typing-rank scoring system layered on top chasing you toward a clean S rank. It is a substantial upgrade of the creator's own free browser game DYPING (500,000-plus plays on unityroom). Released March 13, 2026, it is Very Positive at 92 percent over 553 reviews, and while AUTOMATON WEST has already covered it and it carried Official Selection status at BitSummit and INDIE Live Expo 2025, only about 13.2 percent of those reviews are in English so far, so its reach beyond Japan and Chinese-reading players is only just beginning.",
      s1: "First, the one feeling",
      feeling: [
        "Every phrase the eyeball dictates asks nothing of your judgment, only your typing accuracy, so the moment you finish it and watch it play out on what looks like your own desktop, obedience itself becomes the thing that frightens you.",
        "Partway through, the words you are told to type stop being commands to a character and become your own signature going down on a contract you never agreed to, one keystroke at a time, so the horror is not what is chasing you but what you are actively making true.",
        "A typing-rank meter sits on top of all of it, chasing you toward a clean S rank, so even after a sequence has unsettled you, you find yourself re-running it anyway, this time typing faster, cleaner, for a score you should not still care about.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love IMSCARED's fourth-wall-breaking premise, that what happens on screen is staged to look like it is happening to your own real PC, and want that same dread rebuilt specifically around typing, where every phrase you enter is the thing that makes it happen",
        "You want horror that earns its scares through psychological and environmental dread rather than gore or jump scares, and still want a genuine skill layer, a typing-rank system chasing you toward S rank, sitting right on top of that dread",
        "You want an early look at a solo Japanese developer's full realization of an idea, an upgrade of the free browser hit DYPING (500,000-plus plays), Very Positive at 92 percent over 553 reviews, before AUTOMATON WEST's early coverage and Official Selection slots at BitSummit and INDIE Live Expo 2025 turn into wider Western attention",
      ],
      bad: [
        "You want a game the West has never touched; the English-language outlet AUTOMATON WEST has already covered it and it carried Official Selection status at BitSummit and INDIE Live Expo 2025, so calling it fully undiscovered would not be honest. What is true is that only about 13.2 percent of its 553 reviews are in English so far, so its audience remains overwhelmingly Japanese-speaking",
        "You want a roguelike run structure layered over the horror; per the developer's own interview a roguelike mode was considered and dropped once the publisher judged it unnecessary, and this is a paid, fully launched title, not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's own descriptors",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Dyping Escape - ゲームマスターである”目玉”が指示する言葉をすべて、そのまま自分自身の実際のデスクトップであるかのような画面へ反映するメタホラー・タイピングゲーム。日本のソロ開発者Heaviside CreationsがPLAYISMから発売、無料ブラウザ版『DYPING』(50万回以上プレイ)の大幅アップグレード版で、553件のレビューで好評率92%の『非常に好評』ながら英語レビューはまだ約13%",
      description: "日本のソロ開発者Heaviside Creationsが開発し、PLAYISMが発売するメタホラー・タイピングゲーム。不気味に浮遊する”目玉”が指示する言葉を打つと、その言葉はそのまま自分自身の実際のデスクトップであるかのような画面へ反映され、最後には同意していない契約書への署名まで打たされる。無料ブラウザ版『DYPING』(50万回以上プレイ)の大幅アップグレード版。553件のレビューで好評率92%の『非常に好評』、英語レビューはまだ約13.2%。",
      h1a: "目玉が指示する言葉を、そのまま打つ。",
      h1flip: "打ち終えた瞬間、それはもう自分自身の実際のデスクトップで起きている",
      h1b: "。",
      lede: "日本のソロ開発者Heaviside Creationsが開発し、PLAYISMが発売する、一人称視点のメタホラー・タイピングゲーム。ゲームマスターは不気味に浮遊する”目玉”で、打つべき言葉を正確に指示してくる。Steam自身のストア表記によれば、入力した言葉はそのまま、自分自身の実際のデスクトップであるかのような画面へ反映される——ここで望んでもいないプログラムが動き、あそこで偽のハッキングが進行し、やがてキー入力一つひとつを通じて、同意していない理不尽な契約書へ自らの署名を打ち込まされる瞬間へと向かっていく。グロテスクやジャンプスケアに頼らず、心理的・環境的な恐怖だけで押し切る設計で、その上にSランクを目指すタイピングのスコア機能が重ねられている。開発者自身の無料ブラウザゲーム『DYPING』(unityroomで50万回以上プレイ)の大幅なアップグレード版だ。2026年3月13日にリリースされ、553件のレビューで好評率92%の『非常に好評』。AUTOMATON WESTがすでに記事化し、BitSummitとINDIE Live Expo 2025でOfficial Selectionにも選ばれているが、そのレビューのうち英語はまだ約13.2%に留まり、日本と中国語圏の外への広がりはまだ始まったばかりだ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "目玉が指示してくる言葉は、判断力ではなく、ただ正確に打てるかどうかだけを問うてくる。だからそれを打ち終え、自分自身のデスクトップであるかのような画面でその結果が起きるのを見た瞬間、恐ろしいのは「従ってしまったこと」そのものになる。",
        "途中から、打たされる言葉はキャラクターへの命令ではなくなり、同意していない契約書への自分自身の署名へと、一打ずつ変わっていく。だから怖いのは追ってくる何かではなく、自分がまさに今、それを本当にしてしまっているということだ。",
        "その恐怖の上に、タイピングのランク計測が重ねられていて、Sランクという綺麗な結果へと追い立ててくる。だから一度その場面に怯えたはずなのに、気づけばもう一度、今度はもっと速く、もっと正確に打とうとして、同じ場面へ戻ってしまう。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "IMSCAREDの、「画面の出来事が自分の実際のPCに起きているように見せる」第四の壁破壊という前提が好きで、その同じ恐怖を、今度は「タイピング」という一点だけに組み替えたものが欲しい人——打ち込む一言一言こそが、それを本当に起こしてしまう行為になる",
        "グロテスクやジャンプスケアではなく、心理的・環境的な恐怖で押し切るホラーが欲しく、それでいてSランクを目指すタイピングのランク計測という本物のスキル要素も、その恐怖の上にちゃんと欲しい人",
        "個人開発者が一つのアイデアを完成させた形を早めに触りたい人——本作は無料ブラウザ版『DYPING』(50万回以上プレイ)の大幅アップグレード版で、553件のレビューで好評率92%の『非常に好評』。AUTOMATON WESTの早期記事化や、BitSummit・INDIE Live Expo 2025でのOfficial Selectionが、より広い西側の注目に変わっていく前に触れる",
      ],
      bad: [
        "西側がまったく触れていない、完全未発見の一本が欲しい人(英語圏メディアのAUTOMATON WESTがすでに記事化しており、BitSummitおよびINDIE Live Expo 2025でOfficial Selectionにも選ばれている。だから「完全に未発見」と呼ぶのは正直ではない。本当なのは、553件のレビューのうち英語はまだ約13.2%に留まり、支持のほとんどは今なお日本語圏に偏っているということだ)",
        "恐怖の上にローグライク的な周回構造が欲しい人(開発者本人のインタビューによれば、ローグライクモードは検討されたもののパブリッシャーが「不要」と判断し見送られている。また無料ではない有料の正式リリース済みタイトルで、アーリーアクセスではなく、AI生成アセットはなく、Steam自身のディスクリプタ上、性的な要素もない)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "mamon-king": {
    published: "2026-07-10",
    publishAt: "2026-07-10",
    kind: "find",
    leadIndex: 0,
    // genre は新設 "monster-raising-sim"(モンスター育成SLG): 既存の "raising-sim"(プリンセスメーカー型の
    //   スケジュール育成のみ・戦闘を持たない)では捉えきれない、本作を定義する核——「育成(牧場での日々の
    //   訓練とライバルのマモンとの合同特訓)」「遠征(サイコロで進むすごろく形式のボード移動、ランダム要素で
    //   ステータスが変動)」「戦闘(SPを奪い合う1対1コマンド制ターンバトル)」という3サイクル構造——を専用
    //   ラベルとして立てる(LiTMUSのCXO戸塚友氏本人の言明:「基本的な牧場型の育成ゲームは育成→対戦の2つの
    //   繰り返し」「マモンキングは育成/遠征/戦闘という3つのサイクル」AUTOMATON JPインタビュー記事、実測
    //   確認済み)。hand-me-down-mecha-fps等と同型の細粒度ラベル追加・ui.ts en/ja 追加済み。
    // 系譜は Monster Rancher(モンスターファーム、Tecmo(現・コーエーテクモ)開発、1997年11月30日PS初代発売、
    //   Steam版は2021年12月8日発売のリマスター2作収録版『Monster Rancher 1 & 2 DX』appid 1716120、
    //   Steam appdetails実測確認済み)。開発者よしなま氏はAUTOMATON JPインタビュー(2025-12-05公開、実測
    //   確認済み)で「『モンスターファーム』をリスペクトしていると度々お話されていますが」と記者から直接
    //   問われ「もちろんです」と明言している——chikyu-boueigun/imscared型の「開発者未確認の当サイト独自の
    //   推定」ではなく、本作は developer-confirmed(開発者自身の言明が一次情報として存在)。自信度: 高。
    // obscurity は "deep"(noEnglish=false、Steam自身が英語(日本語と2言語のみ)対応済みだが西への到達が
    //   まだ薄いタイプ)。英語レビュー69/605=約11.4%(Steam appreviews API実測)と過半数に遠く及ばないため
    //   reachState="unreached_west" を立てる。AUTOMATON WEST(英語圏メディア)による発売時の記事化(発売
    //   直後に日本のSteam売上ランキング1位となり、Apex LegendsやOverwatch 2を一時的に上回ったと報道・実測
    //   確認済み)や、Metacriticにゲームページ自体は存在する(スコアは未集計・実測確認済み)ことは確認済みだが、
    //   母数の大半が日本語圏である実測を誇張せず reachState を立てる判断(誇張しない正直さ・dyping-escape型)。
    //   content_descriptors は ids=[]・notes=null(API実測)。release_date はSteam appdetails実測(日本語版・
    //   英語版ストアとも一致)の2025年12月10日を正として採用する。AUTOMATON JPインタビュー記事(発売前公開)と
    //   AUTOMATON WESTの発売後記事はいずれも12月11日と記載しており1日のズレがあるが、二次情報として両論併記し
    //   Steamの記載日を正とする(捏造しない・the-last-salvage-squad型)。
    meta: { genre: "monster-raising-sim", lineage: "monster-rancher", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 605, positivePct: 90, noEnglish: false } },
    games: [
      {
        name_en: "Mamon King",
        name_ja: "マモンキング",
        status: "hidden",
        steam: "https://store.steampowered.com/app/4030290/Mamon_King/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A single-player monster-raising simulation in which you summon and raise creatures called Mamon, training them with equal parts kindness and strictness until you can dethrone the reigning champion and become the Mamon King yourself, developed and self-published by LiTMUS Co., Ltd., a Tokyo studio wholly owned by the talent-management company UUUM. The loop runs on three cycles rather than the usual two: raising, day-to-day ranch training plus joint drills with rival Mamon that teach new skills; expedition, a dice-rolled, board-game-style trek into unexplored land where ancient Mamon lurk, its route branching through random events that can just as easily hand you a stat boost as throw a carefully built plan off balance; and battle, a 1-on-1, turn-based command fight in which every skill costs SP, tougher moves demand more of it or an even greater sacrifice, and either side can drain the other's pool outright, so timing what you spend and when becomes the whole contest. Across 38 distinctly designed Mamon and more than 170 skills that evolve with repeated use, the game is the debut project of Yoshinama, a popular Japanese gaming YouTuber making his first game, who spent roughly two years and 25 million yen (about $160,000) of his own money building it after LiTMUS's own staff took notice of his commitment. Asked directly by AUTOMATON JP whether the game is an homage to Monster Rancher, which he has repeatedly cited in past interviews, Yoshinama confirmed it outright; per that same interview, he personally obsessed over the game's probability tuning, checking and re-checking training success rates and random-event odds against his own hundreds of hours of playtesting to keep the randomness thrilling rather than stressful. Released December 10, 2025 per Steam's own listing on both its Japanese and English storefronts (AUTOMATON's own pre-launch interview and its post-launch coverage both give December 11, a one-day gap we note rather than resolve), it is Very Positive at 90 percent per Steam's own store page (546 of 605 reviews positive per Steam's review API), a paid title at $12.99 (¥1,480 in Japan), not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). It supports English and Japanese only, and while AUTOMATON WEST covered its launch, describing it as briefly topping Japan's Steam best-seller chart ahead of games like Apex Legends and Overwatch 2, only about 69 of its 605 reviews, roughly 11.4 percent, are in English so far, and Metacritic already has a page for it with no score yet aggregated, so calling this discovered by the West would not be honest. What is true is that almost all of its praise so far is Japanese-language, and its reach beyond that is only just beginning.",
        desc_ja: "「マモン」と呼ばれるモンスターを召喚し、優しさと時には厳しさをもって育て上げ、現王者を倒して自らが「マモンキング」となることを目指す、シングルプレイのモンスター育成シミュレーション。開発・発売は東京のゲーム会社LiTMUS株式会社——タレントマネジメント企業UUUM株式会社の完全子会社。ループは通常の2サイクルではなく3サイクルで回る——「育成」(牧場での日々の訓練と、ライバルのマモンと合同で行い新技を習得できる特訓)、「遠征」(サイコロを振って進む、すごろく形式の未開の地への旅で、古代のマモンが潜み、ランダムなイベントがステータスを押し上げることもあれば、せっかくの育成計画を狂わせることもある)、そして「戦闘」(1対1のターン制コマンドバトルで、技を出すたびにSPを消費し、強力な技ほど多くのSP——あるいはさらに大きな代償——を要求し、互いにSPを奪い合える。だからいつ何を使うかというタイミングそのものが勝負になる)。38種の個性的なマモンと、繰り返し使うことで進化する170以上のスキルを備える本作は、人気ゲーム実況者よしなま氏の初開発プロジェクトで、LiTMUSのスタッフがその本気度に目を留めたことをきっかけに、約2年の歳月と自費2,500万円(約16万ドル)を投じて作り上げた。AUTOMATON JPのインタビューで、たびたび公言してきた『モンスターファーム』へのリスペクトについて直接尋ねられると、よしなま氏は「もちろんです」と明言している。同インタビューによれば、確率調整——特訓の成功率やイベントの発生率——には自身で何度もチェックを重ねてこだわり、数百時間に及ぶ自らのプレイテストをもとに、ランダム性が「ストレス」ではなく「快感」であり続けるよう細かく詰めていったという。Steam自身の表記(日本語版・英語版のストアページとも一致)によれば2025年12月10日にリリースされ(AUTOMATONの発売前インタビュー記事、および発売後の記事はいずれも12月11日と記載しており、この1日のズレはここに両論併記し、Steamの記載日を正とする)、Steam自身のストアページで好評率90%の「非常に好評」(Steamのレビューデータでは605件中546件が好評)。無料ではない有料作(12.99ドル、日本では1,480円)で、アーリーアクセスではなく正式リリース済み。AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。対応言語は英語と日本語のみ。AUTOMATON WESTは発売時、日本のSteam売上ランキングでApex LegendsやOverwatch 2などを一時的に上回り首位に立ったと報じたが、605件のレビューのうち英語は約69件、約11.4%に留まり、Metacriticにもすでにページが存在するがスコアはまだ集計されていない——だから「西側に発見された」と呼ぶのは正直ではない。本当なのは、その支持のほとんどが今なお日本語で語られているということで、それより先への広がりはまだ始まったばかりだ。",
      },
      {
        name_en: "Monster Rancher",
        name_ja: "モンスターファーム",
        status: "established",
        steam: "https://store.steampowered.com/app/1716120/Monster_Rancher_1__2_DX/",
        tag_en: "The monster-raising origin",
        tag_ja: "モンスター育成の原点",
        desc_en: "The origin of this taste, confirmed directly by the developer: Monster Rancher, known in Japan as Monster Farm (モンスターファーム), a life-simulation raising game created by Tecmo (now Koei Tecmo), first released for the PlayStation on November 30, 1997 (the Steam version, Monster Rancher 1 & 2 DX, remastering the series' first two entries, was developed and published by Koei Tecmo in December 2021). Its signature gimmick let players generate a brand-new monster by inserting almost any CD into the console, a disc-reading system Tecmo built that turned the disc's own stored data into a random seed for the creature's stats and breed, and from there the player raised it on a training schedule and entered it into official tournaments to fight, a raise-then-battle loop that helped define the genre of monster-raising sims. Asked directly by AUTOMATON JP whether Mamon King is an homage to Monster Rancher, which he has repeatedly cited in interviews, its developer Yoshinama confirmed it outright. Mamon King keeps that raise-then-battle spine, training a summoned creature called a Mamon and entering it into 1-on-1 command battles, but replaces the disc-reading monster generator with a dice-rolled, board-game-style expedition phase between training and battle, and layers an SP resource either fighter can drain onto the fights themselves, additions the original Monster Rancher never had.",
        desc_ja: "この味の原点——開発者本人が直接明言した一本。Monster Rancher(モンスターファーム)。Tecmo(現・コーエーテクモ)が手がけた育成シミュレーションで、初代は1997年11月30日にPlayStation向けに発売された(Steam版『Monster Rancher 1 & 2 DX』はシリーズ最初の2作をリマスターした版で、2021年12月にコーエーテクモが開発・発売)。象徴的な仕掛けは、手持ちのほぼどんなCDを本体に挿入しても新しいモンスターを生成できるという点にあった——Tecmoが構築したディスク読み取りシステムが、ディスクに記録されたデータをそのまま乱数のシードへ変換し、モンスターのステータスや種族を決定する。そこから先はスケジュールを組んで育成し、公式大会へエントリーして戦わせる——この「育てて、戦わせる」ループが、モンスター育成シムというジャンルを定義づけた。『マモンキング』が『モンスターファーム』へのオマージュかとAUTOMATON JPから直接尋ねられ、開発者よしなま氏はそれを明言している——彼はインタビューでたびたびそのリスペクトを公言してきた人物だ。『マモンキング』は、召喚した「マモン」を育て、1対1のコマンドバトルへ送り出すという同じ「育てて、戦わせる」骨格を受け継ぎながら、CD読み取りによるモンスター生成を、育成と戦闘の間に挟むサイコロ制・すごろく形式の遠征フェーズへと置き換え、さらに戦闘そのものに、互いに奪い合えるSPというリソースを接ぎ木している——いずれも初代『モンスターファーム』には無かった要素だ。",
      },
    ],
    en: {
      title: "Mamon King - a monster-raising sim whose developer, a Japanese YouTuber making his solo debut, confirmed he built it as an homage to Monster Rancher, training a summoned Mamon through daily ranch work, a dice-rolled board expedition, and SP-draining 1-on-1 command battles, Very Positive at 90 percent over 605 reviews though still only about 11 percent English",
      description: "A monster-raising sim by Yoshinama, a Japanese YouTuber making his solo debut, developed and self-published by LiTMUS Co., Ltd., a subsidiary of UUUM. Summon and raise a Mamon through three cycles: day-to-day training, a dice-rolled board expedition into unexplored land, and 1-on-1 command battles where every skill costs SP that either side can drain. The developer confirmed it as an homage to Monster Rancher. Very Positive at 90 percent over 605 reviews, still only about 11.4 percent English.",
      h1a: "You spend SP to unleash your Mamon's signature skill. ",
      h1flip: "Your opponent can just take that SP for themselves instead, and now it is their move",
      h1b: ".",
      lede: "A single-player monster-raising simulation developed and self-published by LiTMUS Co., Ltd., a Tokyo studio wholly owned by the talent-management company UUUM. You summon and raise a Mamon, training it with kindness and sometimes strictness, across three cycles instead of the usual two: day-to-day raising and joint drills with rival Mamon, a dice-rolled expedition into unexplored land where random events can boost a stat or upend your plans, and 1-on-1, turn-based command battles where every skill costs SP, and either fighter can drain the other's pool outright. It is the debut project of Yoshinama, a popular Japanese gaming YouTuber, who spent roughly two years and 25 million yen of his own money building it after LiTMUS took notice of his commitment; asked directly whether it is an homage to Monster Rancher, which he has repeatedly cited, he confirmed it outright, and per that same interview obsessed personally over tuning training success rates and random-event odds against his own hundreds of hours of playtesting. Released in December 2025, it is Very Positive at 90 percent over 605 reviews, and while AUTOMATON WEST has already covered its launch, only about 11.4 percent of those reviews are in English so far, so its reach beyond Japan is only just beginning.",
      s1: "First, the one feeling",
      feeling: [
        "The expedition is a dice roll into land no one has trained for: advance along its branching route and a random event can hand your Mamon a stat you never trained for, or just as easily strip away a stockpile of SP you had been saving for the fight at the end of it, so every roll carries real upside and the same risk of undoing exactly the training you spent the last cycle building.",
        "Every skill in a fight draws down a shared resource, SP, and it is not only yours to spend: your opponent's move can drain it straight out of your pool before you get to use it, so a battle is never just picking the strongest attack, it is deciding whether to spend now, hold, or gamble that the enemy will not reach for your reserves first.",
        "Training, expedition, and battle keep handing off to each other rather than looping in place, so a skill your Mamon only picked up by surviving a bad roll out in the field becomes the exact move that turns a losing command fight around, and the next raising session already has a new reason behind it.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You love Monster Rancher's raise-then-battle taste, and want a developer-confirmed homage that adds a third cycle on top, a dice-rolled expedition where random events reshape your Mamon before it ever reaches a fight",
        "You want the SP economy of the battles themselves: every skill draws from a pool either fighter can drain, across 38 distinctly designed Mamon and more than 170 evolving skills, tuned personally by a developer who obsessed over its probabilities",
        "You want to catch a genuine Japan-side debut early: a YouTuber's first game, self-funded for about $160,000, Very Positive at 90 percent over 605 reviews and already covered by AUTOMATON WEST, before its English-language audience catches up",
      ],
      bad: [
        "You want twitch reflexes or real-time action; this is a turn-based, SP-managed command battle system built to be accessible to anyone, not one that rewards fast reactions, and it is a paid, fully launched title, not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's own descriptors",
        "You want a game the West has never touched; AUTOMATON WEST has already covered its launch and Metacritic has opened a page for it, so calling it fully undiscovered would not be honest. What is true is that only about 11.4 percent of its 605 reviews are in English so far, and its praise remains almost entirely Japanese-language",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "マモンキング - 開発者本人が『モンスターファーム』へのオマージュだと明言した、モンスター育成シム。召喚したマモンを、日々の育成、サイコロで進む遠征、SPを奪い合う1対1コマンドバトルで鍛え上げる。605件のレビューで好評率90%の『非常に好評』ながら、英語レビューはまだ約11%",
      description: "人気ゲーム実況者よしなま氏がソロデビュー作として手がけ、UUUM子会社のLiTMUS株式会社が開発・発売するモンスター育成シム。召喚した「マモン」を、日々の育成、サイコロで進むボード形式の遠征、そして技のたびにSPを消費し互いに奪い合える1対1コマンドバトルの3サイクルで鍛え上げる。開発者本人が『モンスターファーム』へのオマージュだと明言。605件のレビューで好評率90%の『非常に好評』、英語レビューはまだ約11.4%。",
      h1a: "SPを使って、マモンの必殺技を放つ。",
      h1flip: "そのSPは、相手にそのまま奪われることもある——次の手番は、もう相手のものだ",
      h1b: "。",
      lede: "東京のゲーム会社LiTMUS株式会社——タレントマネジメント企業UUUM株式会社の完全子会社——が開発・発売する、シングルプレイのモンスター育成シミュレーション。「マモン」と呼ばれるモンスターを召喚し、優しさと時には厳しさをもって育て上げる。ループは通常の2サイクルではなく3サイクル——牧場での日々の育成とライバルのマモンとの合同特訓、サイコロを振って未開の地を進む遠征(ランダムなイベントがステータスを押し上げることもあれば、計画を狂わせることもある)、そして1対1のターン制コマンドバトル(技を出すたびにSPを消費し、互いにSPを奪い合える)。本作は人気ゲーム実況者よしなま氏の初開発プロジェクトで、LiTMUSのスタッフがその本気度に目を留めたことをきっかけに、約2年の歳月と自費2,500万円を投じて作り上げた。たびたび公言してきた『モンスターファーム』へのリスペクトについて直接尋ねられると、よしなま氏は明言し、同インタビューによれば、特訓の成功率やイベントの発生率という確率調整に、自らの数百時間に及ぶプレイテストをもとにこだわり抜いたという。2025年12月にリリースされ、605件のレビューで好評率90%の『非常に好評』。AUTOMATON WESTがすでにその発売を記事化しているが、英語レビューはまだ約11.4%に留まり、日本を超えた広がりはまだ始まったばかりだ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "遠征は、まだ鍛えていない土地へのサイコロ賭けだ——枝分かれするルートを進めば、ランダムなイベントが鍛えてもいないステータスをマモンに授けることもあれば、その先の戦いのために温存していたSPの蓄えをまるごと奪い去ることもある。だからどの一振りにも、確かな上振れと、直前のサイクルで積み上げた育成そのものを台無しにしかねない同じリスクが、同時に乗っている。",
        "戦闘のあらゆる技は、SPという共有リソースを削って発動する——しかもそれは自分だけのものではない。相手の一手が、使う前にそのSPをこちらのプールからそのまま奪っていくこともある。だから戦いは最強の攻撃を選ぶだけの作業ではなく、いま使うか、温存するか、それとも相手が先にこちらの備蓄へ手を伸ばさないことに賭けるか、という駆け引きになる。",
        "育成、遠征、戦闘は、その場でループするのではなく、互いに手渡し合っていく。だから、遠征中の悪い出目を生き延びたことで偶然覚えた一つの技が、劣勢のコマンドバトルをそのままひっくり返す決め手になり、次の育成セッションには、もう新しい理由が生まれている。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "「モンスターファーム」的な、育てて戦わせるという味が好きで、そこに開発者本人が明言するオマージュとして、サイコロで進む遠征というもう一つのサイクルが足され、ランダムなイベントが戦う前からマモンを作り替えていく作品が欲しい人",
        "戦闘そのもののSP経済——互いに奪い合える共有リソース——が欲しい人。38種の個性的なマモンと170以上の進化するスキルを備え、確率にこだわり抜いた開発者本人によって細かくチューニングされている",
        "本物の日本発デビュー作を早めに掴みたい人——ゲーム実況者の初開発作で、自費約2,500万円を投じ、605件のレビューで好評率90%の『非常に好評』。AUTOMATON WESTがすでに記事化しているが、英語圏の広い注目が追いつく前に触れられる",
      ],
      bad: [
        "速い反射神経やリアルタイムのアクションが欲しい人——本作は「誰でも遊べる」ことを目指したターン制・SP管理型のコマンドバトルで、反応速度を競うものではない。また、無料ではない有料の正式リリース済みタイトルで、アーリーアクセスではなく、AI生成アセットはなく、Steam自身のディスクリプタ上、性的な要素もない",
        "西側がまったく触れていない一本が欲しい人(AUTOMATON WESTがすでにその発売を記事化しており、Metacriticにもすでにページが存在する。だから「完全未発見」と呼ぶのは正直ではない。本当なのは、605件のレビューのうち英語はまだ約11.4%に留まり、支持のほとんどは今なお日本語で語られているということだ)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "revolgear-zero": {
    published: "2026-07-11",
    publishAt: "2026-07-11",
    kind: "find",
    leadIndex: 0,
    // genre は既存 "shoot-em-up"(Steam自身のジャンルタグは Action/Adventure/Casual だが、STG専用タグが
    //   Steamに無いための表面上の分類。実体は横スクロールシューティング——Steam公式ストア本文(日本語版)が
    //   「本格横スクロールシューティング」と明記・appdetails実測確認済み——であり devil-blade-reboot と
    //   同じ genre を採用)。
    // 系譜は RayStorm(タイトー、1996年アーケード稼働)——開発者ねこび白銀氏がTech-Gaming単独インタビューで
    //   「決定的な影響」と明言(developer-confirmed・monster-rancher型の一次情報)。RayStorm単体のSteam版は
    //   無いため、収録コンピレーション『Ray'z Arcade Chronology』(M2開発・タイトー発売、Steam配信開始2023年
    //   9月25日、appid 2478020、Steam appdetails実測確認済み)のURLを lineage_anchor_key=steam_url として
    //   採用(devil-blade-reboot型・原作単体の流通が無い場合の代替アンカー)。同インタビューで開発者は、
    //   バースト/ゲージ機構「メガビットシステム」の直接の元ネタとして『DoDonPachi II: Bee Storm』
    //   (シリーズ通常の開発元ケイブでなくIGSが開発・Wikipedia実測確認済み)の「エネルギーモード」も併せて
    //   名指ししているが、今回与えられた anchor は1つ(RayStorm/Ray'z Arcade Chronology)のみのため、
    //   DoDonPachi II は新規 anchor 化せず established 側の本文内言及に留める(捏造しない・一次情報の範囲を
    //   超えない)。
    // obscurity は "deep"(noEnglish=false、Steam自身が英語対応済み)。reviewBand は持たせない: 129件は
    //   elbab-library-autobattler(同じ129件)と同帯で "hundreds"(数百)と言い切るには境界的(誇張しない)。
    //   reachState は持たせない: 英語レビュー比率34.1%(44/129、Steam appreviews API実測)は過半数に満たない
    //   ものの、Tech-Gaming・DualShockers・Video Chums・WayTooManyGames・Game Critix・Gazettely・
    //   Co-Optimus・GameRant と西側メディア8媒体がすでにレビュー済み(the-last-salvage-squad型・複数媒体
    //   到達済みの場合はreachStateを立てない、誇張しない判断)。release_date は Steam appdetails実測(英語版
    //   ストア)のリリース表記2026年2月18日を正として採用。4Gamer/ファミ通は発売日を2月19日と表記しており
    //   1日のズレがあるが、二次情報として両論併記しSteamの記載日を正とする(捏造しない・the-last-salvage-squad型)。
    //   content_descriptors は ids=[]・notes=null(API実測)。
    meta: { genre: "shoot-em-up", lineage: "raystorm", obscurity: "deep", rarity: { reviews: 129, positivePct: 98, noEnglish: false } },
    games: [
      {
        name_en: "Revolgear Zero",
        name_ja: "Revolgear Zero（リボルギア・ゼロ）",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3941820/Revolgear_Zero/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A side-scrolling shoot 'em up in which two rival pilots, Shizuku and Akane, fly the Revolgear-class fighters Pheasant and Dove to defend their home world from an invading force called Xeno, developed by the four-person Osaka doujin circle Bikkuri Software and published by Henteko Doujin and Sanuk Inc. Its core is what the developer calls the Megabit System: a boomerang-style Bit Shoot throws an orb out to scoop up energy and dropped items at range instead of flying in for them, and once that shared gauge fills, Burst spends every point of it at once to erase the enemy bullets already on screen and slam a heavy hit into whatever is still standing, a system its creator, who goes by Nekobi Shirogane, built as an evolution of the grazing system from the studio's earlier Graze Counter GM. In a solo interview with Tech-Gaming, Shirogane named Taito's 1996 arcade shooter RayStorm a 'decisive influence' on the game, and separately credited the energy mode of DoDonPachi II as the direct model for the Megabit System's own gauge. Two playable pilots, seven stages across four difficulty levels, a 30-stage mission mode, more than 2,000 equipment combinations, six possible endings, and local co-op play round it out, alongside a mystery bonus game, God of Cats; the four-person team, all working other jobs, built it in sessions of roughly two to three hours a day. Per Steam's own listing it released February 18, 2026 (some Japanese outlets, including 4Gamer and Famitsu, list a release date of February 19, a one-day gap we note here rather than resolve outright), and it sits at Very Positive, 98 percent, per Steam's own store page (127 of 129 reviews positive per Steam's review API). It is voiced entirely in Japanese, with English, Simplified Chinese, and Traditional Chinese available as text; a paid title at ¥1,480 in Japan, not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). Outlets including Tech-Gaming (91/100), DualShockers (8/10), Video Chums (4/5), WayTooManyGames, Game Critix, Gazettely, Co-Optimus, and GameRant have already reviewed it, yet only about 44 of its 129 reviews, roughly 34.1 percent, are in English so far, so this reads less as a game the West has never touched and more as a small one a slice of its indie shmup audience has already quietly found.",
        desc_ja: "リボル星の宇宙戦闘機「リボルギア」を駆るライバル同士のパイロット、雫と緋音が、侵略者「ゼノ」から故郷を守るために戦う横スクロールシューティング。開発は大阪拠点の同人サークル びっくりソフトウェア(4名体制)、発売は Henteko Doujin と Sanuk Inc.。核となるのは開発者が「メガビットシステム」と呼ぶ攻防一体のゲージ機構——ブーメラン状に飛ばす「ビットシュート」で、自ら突っ込まずとも遠距離からエネルギーや落下アイテムを回収でき、共有のゲージが満タンになると「バースト」でその全てを一気に消費し、画面上の敵弾をまとめて消し去りながら、なお立っている敵に大ダメージを叩き込む。この仕組みは、代表のねこび白銀氏が前作『Graze Counter GM』のかすり(グレイズ)システムを発展させて構築したものだ。Tech-Gamingの単独インタビューで白銀氏は、タイトーのアーケードシューティング RayStorm(レイストーム)を本作への「決定的な影響」と名指しし、あわせて『DoDonPachi II: Bee Storm』の「エネルギーモード」を、メガビットシステムそのもののゲージ機構の直接の元ネタとして挙げている。操作キャラは2人、7ステージ×4段階の難易度、30面のミッションモード、2,000通り以上の装備の組み合わせ、6種のマルチエンディング、ローカル協力プレイに加え、おまけの謎ミニゲーム「ネコの神」も収録。本業を持つ4人のチームが、1日2〜3時間ペースで作り上げた。Steam自身の表記によればリリース日は2026年2月18日(4Gamer・ファミ通など一部の国内メディアは発売日を2月19日と表記しており、この1日のズレはここに記すに留め、どちらか一方を正として断定しない)。Steam自身のストアページで好評率98%の「非常に好評」(Steamのレビューデータでは129件中127件が好評)。音声は日本語のみのフルボイスで、英語・簡体字中国語・繁体字中国語はテキストで対応。無料ではない有料作(日本では1,480円)で、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。Tech-Gaming(91/100)・DualShockers(8/10)・Video Chums(4/5)・WayTooManyGames・Game Critix・Gazettely・Co-Optimus・GameRantといった媒体がすでにレビューを掲載しているが、129件のレビューのうち英語はまだ約44件、約34.1%に留まる。だからこれは「西側がまったく触れていない一本」というより、「西の弾幕シューター好きの一部が、すでにひっそりと見つけ始めている小粒な一本」と読む方が正確だ。",
      },
      {
        name_en: "RayStorm",
        name_ja: "レイストーム",
        status: "established",
        steam: "https://store.steampowered.com/app/2478020/Rayz_Arcade_Chronology/",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The influence Bikkuri Software's own developer names directly: RayStorm, a vertically scrolling shoot 'em up developed and published by Taito, which powered up Japanese arcades in 1996 as the sequel to RayForce. Rendered with 3D polygon enemies over scrolling backgrounds, it is best known for its lock-on laser, holding a button to paint a reticle across several enemies at once and releasing it to fire a spread of homing lasers that erases them in a single strike. The 1996 arcade original has no standalone Steam release; its only current PC form is Ray'z Arcade Chronology, a 2023 collection developed by M2 Co., Ltd. and published by Taito that gathers RayStorm with RayForce and RayCrisis in HD. In a solo interview with Tech-Gaming, Bikkuri Software's Nekobi Shirogane named RayStorm a 'decisive influence' on Revolgear Zero, and separately credited DoDonPachi II: Bee Storm, developed not by the series' usual studio Cave but by IGS, for its energy mode as the direct model for the Megabit System, the gauge-driven burst that Revolgear Zero builds its whole design around.",
        desc_ja: "びっくりソフトウェアの開発者本人が名指しした影響元——RayStorm(レイストーム)。タイトーが開発・発売した縦スクロールシューティングで、『レイフォース』の続編として1996年に日本のアーケードで稼働を開始した。スクロールする背景に3Dポリゴンの敵を描く作りで知られ、代名詞は「ロックオンレーザー」——ボタンを押し続けて複数の敵に同時に照準を合わせ、放つと追尾レーザーの束が一気に敵を消し去る。1996年のアーケード原作単体のSteam版は存在せず、今日PCで唯一遊べる形は、M2が開発しタイトーが発売した2023年のコレクション『Ray'z Arcade Chronology』で、レイフォース・レイクライシスとともにHD収録されている。Tech-Gamingの単独インタビューで、びっくりソフトウェアのねこび白銀氏は RayStorm を『リボルギア・ゼロ』への「決定的な影響」と名指しし、あわせて——シリーズの通常の開発元ケイブではなくアイジーエス(IGS)が手がけた『DoDonPachi II: Bee Storm』の「エネルギーモード」を、本作の設計全体を貫くゲージ制バースト「メガビットシステム」の直接の元ネタとして挙げている。",
      },
    ],
    en: {
      title: "Revolgear Zero - a buried side-scrolling shmup whose developer named Taito's RayStorm a decisive influence and DoDonPachi II's energy mode the direct model for its Megabit System, a shared gauge you spend all at once to erase every bullet on screen, Very Positive at 98 percent over 129 reviews though only about a third of them are English",
      description: "A side-scrolling shmup by the four-person Osaka doujin circle Bikkuri Software. Two rival pilots build a shared energy gauge through a boomerang-style Bit Shoot, then spend it all at once in a Burst that erases enemy bullets outright. The developer named Taito's RayStorm a decisive influence and DoDonPachi II's energy mode the model for that gauge. Very Positive at 98 percent over 129 reviews, still only about a third English.",
      h1a: "Every hit feeds the same gauge. ",
      h1flip: "Spend it all in one Burst, and the whole screen of bullets is simply gone",
      h1b: ".",
      lede: "A side-scrolling shoot 'em up developed by Bikkuri Software, a four-person doujin circle out of Osaka working on it around their day jobs, and published by Henteko Doujin and Sanuk Inc. Two rival pilots, Shizuku and Akane, fly the Revolgear fighters Pheasant and Dove against an invading force called Xeno, building a shared energy gauge, the Megabit System, through a boomerang-style Bit Shoot that grabs energy and items at range, then spending every point of it at once in a Burst that erases the bullets on screen and slams a finishing hit into whatever survives. Its creator, Nekobi Shirogane, named Taito's 1996 arcade shooter RayStorm a 'decisive influence' in a solo interview with Tech-Gaming, and separately credited DoDonPachi II's energy mode as the direct model for that gauge, an evolution of the grazing system the studio first built in Graze Counter GM. Seven stages across four difficulties, a 30-stage mission mode, more than 2,000 equipment combinations, six endings, and local co-op fill it out, alongside the bonus game God of Cats. It is Very Positive at 98 percent over 129 reviews, and while outlets from Tech-Gaming to GameRant have already reviewed it, only about a third of those reviews are in English so far.",
      s1: "First, the one feeling",
      feeling: [
        "The boomerang-style Bit Shoot throws out and calls back a single orb, letting you scoop up energy and dropped items from a distance instead of flying into the crossfire for them, so the same gauge that will later save you keeps climbing whether you play it cautious or aggressive.",
        "Once that gauge is full, Burst spends every point of it in one motion, erasing the enemy bullets already on screen and slamming a heavy hit into whatever is still standing, so the same button that gets you out of a wall of bullets is the one that decides how much damage you just gave up waiting to press it.",
        "Score earned from whatever a Burst destroys funds the shop between runs, so how eagerly you spend the gauge this stage decides which of the game's more than 2,000 equipment combinations you can actually afford for the next one, turning a single panic button into the whole build.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You want a developer-confirmed heir to Taito's RayStorm and to DoDonPachi II's energy-gauge design, built by a four-person doujin circle around a single gauge you can hoard for damage or dump for survival",
        "You want deep build variety with a story to match: two playable pilots, seven stages across four difficulties, a 30-stage mission mode, more than 2,000 equipment combinations, six endings, and local co-op, plus the bonus game God of Cats",
        "You want to catch a small Japanese doujin circle's release while the wider West is still only starting to notice it: Very Positive at 98 percent over 129 reviews, already praised by Tech-Gaming, DualShockers, and Video Chums among others",
      ],
      bad: [
        "You want a slow, careful shooter you dodge by hand; the Megabit System is built around the gamble of when to spend the whole gauge at once, and it is a paid, fully launched title, not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's own descriptors",
        "You want a game the West has never touched at all; Tech-Gaming, DualShockers, Video Chums, WayTooManyGames, Game Critix, Gazettely, Co-Optimus, and GameRant have all already covered it, so calling it fully undiscovered would not be honest. What is true is that only about 34.1 percent of its 129 reviews are in English so far, and most of its support still reads Japanese",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Revolgear Zero - 開発者本人がタイトーの RayStorm を「決定的な影響」、DoDonPachi II の「エネルギーモード」をゲージ機構「メガビットシステム」の直接の元ネタと明言した、埋もれた横スクロールシューティング。溜めたゲージを一気に使い切ると画面の敵弾がまとめて消える。129件のレビューで好評率98%の「非常に好評」ながら、英語レビューはまだ約3割",
      description: "大阪拠点の同人サークル びっくりソフトウェア(4名体制)による横スクロールシューティング。ライバル同士のパイロット2人が、ブーメラン状の「ビットシュート」で共有のエネルギーゲージを溜め、「バースト」で一気に使い切って敵弾をまとめて消し去る。開発者はタイトーの RayStorm を「決定的な影響」、DoDonPachi II の「エネルギーモード」をそのゲージの元ネタと明言。129件のレビューで好評率98%の「非常に好評」、英語レビューはまだ約3割。",
      h1a: "敵を撃つたび、同じゲージが溜まっていく。",
      h1flip: "「バースト」で一気に使い切れば、画面を埋めた弾がまるごと消える",
      h1b: "。",
      lede: "大阪拠点の同人サークル びっくりソフトウェア(4名体制、全員本業を持ちながらの兼業開発)が手がけ、Henteko Doujin と Sanuk Inc. が発売する横スクロールシューティング。ライバル同士のパイロット、雫と緋音が、リボルギア級戦闘機「Pheasant」と「Dove」を駆り、侵略者「ゼノ」に立ち向かう。ブーメラン状に飛ばす「ビットシュート」で遠距離からエネルギーやアイテムを回収し、共有ゲージ「メガビットシステム」を溜め、満タンになると「バースト」で一気に消費して画面上の敵弾をまとめて消し去り、なお残る敵にとどめを刺す。代表のねこび白銀氏は、Tech-Gamingの単独インタビューでタイトーのアーケードシューティング RayStorm を「決定的な影響」と名指しし、あわせて DoDonPachi II の「エネルギーモード」をそのゲージ機構の直接の元ネタとして挙げている。前作『Graze Counter GM』のかすり(グレイズ)システムを発展させた設計だ。操作キャラは2人、7ステージ×4段階の難易度、30面のミッションモード、2,000通り以上の装備の組み合わせ、6種のマルチエンディング、ローカル協力プレイに加え、おまけの謎ミニゲーム「ネコの神」も収録。129件のレビューで好評率98%の「非常に好評」。Tech-Gamingから GameRant まで複数の媒体がすでにレビューを掲載しているが、そのうち英語はまだ約3割に留まる。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ブーメラン状の「ビットシュート」は投げて呼び戻せる一つの弾——だから自ら弾幕へ突っ込まずとも、遠距離からエネルギーや落下アイテムをかき集められる。慎重に立ち回ろうと、攻めに攻めようと、後であなたを救うことになる同じゲージは、そのぶんだけ着実に溜まっていく。",
        "ゲージが満タンになると、「バースト」はその全てを一動作で使い切り、画面上の敵弾をまとめて消し去りながら、なお立っている敵に大ダメージを叩き込む。だから、弾の壁から自分を救い出すのと同じボタンが、押すのを我慢していた分だけどれだけの火力を手放したのかも、同時に決めてしまう。",
        "バーストで倒した敵から得たスコアは、次のステージまでの間にショップの購入資金になる。だから今のステージでどれだけ大胆にゲージを使うかが、2,000通り以上ある装備の組み合わせのうち、次に何を買えるかまで決めてしまう——たった一つのパニックボタンが、そのままビルドそのものになる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "タイトーの RayStorm と DoDonPachi II のゲージ設計、その両方への開発者確認済みの後継作が欲しい人——4人の同人サークルが、ダメージのために溜めるか生存のために吐き出すか、一つのゲージを軸に据えて作り上げた一本",
        "物語も伴った奥深いビルド要素が欲しい人——操作キャラ2人、7ステージ×4段階の難易度、30面のミッションモード、2,000通り以上の装備の組み合わせ、6種のマルチエンディング、ローカル協力プレイ、おまけの「ネコの神」まで揃っている",
        "日本の小さな同人サークルの新作を、広い西側がまだ気づき始めたばかりのうちに掴みたい人——129件のレビューで好評率98%の「非常に好評」、すでに Tech-Gaming・DualShockers・Video Chums などが高く評価している",
      ],
      bad: [
        "手を動かしてすべて避け切る、じっくりした弾幕シューティングが欲しい人(メガビットシステムは、いつゲージを一気に使い切るかという賭けを核に据えている)。また、無料ではない有料の正式リリース済みタイトルで、アーリーアクセスではなく、AI生成アセットはなく、Steam自身のディスクリプタ上、性的な要素もない",
        "西側がまったく触れていない一本が欲しい人(Tech-Gaming・DualShockers・Video Chums・WayTooManyGames・Game Critix・Gazettely・Co-Optimus・GameRantがすでにレビューを掲載しており、「完全未発見」と呼ぶのは正直ではない。本当なのは、129件のレビューのうち英語はまだ約34.1%に留まり、支持の大半は今なお日本語で語られているということだ)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "crimzon-clover-world-explosion": {
    published: "2026-07-11",
    publishAt: "2026-07-11",
    kind: "find",
    leadIndex: 0,
    // genre は既存 "shoot-em-up"(縦スクロール弾幕シューティング、Steam自身のジャンルタグは Action/Indie だが
    //   専用タグが無いための表面上の分類。実体は Wikipedia 実測確認済みの vertically scrolling bullet-hell
    //   shooter)。devil-blade-reboot / revolgear-zero と同じ genre を採用。
    // 系譜は Gradius(グラディウス、コナミ、1985年アーケード稼働)。原作単体の Steam 版は無いため、収録
    //   コンピレーション『GRADIUS ORIGINS』(コナミ発売、2025年8月、appid 2897590、Steam appdetails実測
    //   確認済み)を established 側の steam URL として採用(devil-blade-reboot/raystorm型・代替アンカー)。
    //   ただし lineage anchor 自体の同定は steam ではなく wikidata QID(Q1324646、Wikidata実測確認済み=
    //   "Gradius"/1985 arcade game)を採用: 本作 ARRANGE モードの新設ギミック(スコアアイテムでマルチゲージを
    //   充填し、任意のタイミングでサポートポッド/スピードアップ等へ変換する仕組み)を、Nintendo Life と
    //   コミュニティ参照wiki shmups.wiki がそれぞれ独立に Gradius 自身の「パワーメーター」(カプセルで
    //   画面下の強化メニューを進め、パワーアップボタンで任意のタイミングでロックインする選択制、Wikipedia
    //   実測確認済み)になぞらえており、これが唯一特定できた系譜アンカー。開発元 YOTSUBANE 本人がこの関連を
    //   直接述べた言明は見つかっていないため developer-confirmed ではなく press-drawn(imscared 型・
    //   確信度は中)。established 側は steam(GRADIUS ORIGINS)と homepage(Wikipedia "Gradius (video game)"
    //   記事)を併記し、wikidata QID を anchor 同定に使う場合でも href が壊れないようにする。
    // obscurity は "deep"(noEnglish=false、Steam自身が英語対応済み)。reviewBand は "hundreds"(376件は
    //   数百の範囲・誇張しない)。reachState は持たせない: 英語レビュー比率72.6%(273/376、Steam appreviews
    //   API実測)は過半数を超え、PC Gamer の特集記事「Revisiting Crimzon Clover, a shmup that rivals the
    //   genre's best」に加え Nintendo Life・shmups.wiki もすでに言及済みで、コア弾幕シューター層には一定の
    //   カルト的認知があるため(revolgear-zero/the-last-salvage-squad型・複数媒体到達済みは誇張しない判断で
    //   reachStateを立てない)。content_descriptors は ids=[]・notes=null(API実測)。
    meta: { genre: "shoot-em-up", lineage: "gradius", obscurity: "deep", reviewBand: "hundreds", rarity: { reviews: 376, positivePct: 96, noEnglish: false } },
    games: [
      {
        name_en: "Crimzon Clover World EXplosion",
        name_ja: "Crimzon Clover World EXplosion",
        status: "hidden",
        steam: "https://store.steampowered.com/app/1718160/Crimzon_Clover_World_EXplosion/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A vertically scrolling bullet-hell shooter built entirely around point-blank risk: fly close enough to an enemy and you gain energy faster, lock on faster, and deal more damage, the same proximity that could get you killed. Holding the lock-on button paints a target line across everything in range, up to 24 enemies at once (28 in Break Mode, 32 in Double Break), and releasing it fires a spread of homing lasers whose count feeds a score chain multiplier. Fill the Break Gauge and Break Mode kicks in, spiking damage, speed, lock-on speed, and the value of the gold stars enemies drop; keep it full and Double Break stacks on top, adding an extra Option pod and doubling the bonus again. The new ARRANGE mode reworks that same escalation into a build you choose yourself: picking up score items charges a shared multi-gauge you can spend at any moment on support pods, speed-ups, and other power-ups, rather than have them assigned to you automatically. Three difficulty tiers, NOVICE, ARCADE, and ARRANGE, each branch into several modes of their own. Developed by the Japanese doujin circle Yotsubane, also known by its circle name CLOVER-TAC, which first showed the game at Comiket 79 in December 2010 before releasing it for Windows in January 2011; Adventure Planning Service, a Tokyo studio founded in 1987, joined as co-developer from the Nintendo Switch version onward. Published by KOMODO, a small Tokyo-based label spun out of Degica Games' game division in 2021. The previous Steam version, World Ignition, was discontinued at the publisher's request in December 2021, the same window in which this successor, World EXplosion (first released on Switch in October 2020), arrived on Steam on December 6, 2021. It is Very Positive at 96 percent per Steam's own store page (364 of 376 reviews positive per Steam's review API). It supports English, French, Italian, German, Spanish, Portuguese, Polish, Japanese, Simplified Chinese, and Traditional Chinese, yet only about 273 of those 376 reviews, roughly 72.6 percent, are in English so far. PC Gamer has already run a feature on it, 'Revisiting Crimzon Clover, a shmup that rivals the genre's best,' and both Nintendo Life and the community reference wiki shmups.wiki have covered it, so calling it a game the West has never touched would not be honest; what is true is that its recognition still sits mostly with the core bullet-hell audience, and it has yet to reach a wider, non-shooter crowd. It is a paid title at ¥1,980 in Japan ($19.99), not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none).",
        desc_ja: "敵に至近距離まで飛び込むほど有利になる——エネルギー獲得が早まり、ロックオンも速まり、与ダメージも上がる。だがその同じ近さが、自分を殺しかねない危険地帯でもある。そんな「ポイントブランク」のリスクだけで組み立てられた、縦スクロールの弾幕シューティング。ロックオンボタンを押し続けると射程内の敵すべてに照準線が伸び(通常最大24体、BREAK中28体、DOUBLE BREAK中32体)、離すとその数だけ追尾レーザーが放たれ、まとめてロックした数がそのままスコアのチェイン倍率になる。ブレイクゲージが満タンになるとBREAKモードが発動し、与ダメ・速度・ロックオン速度・敵が落とす金の星の獲得量が跳ね上がる。満タンを維持したままさらに溜め続けるとDOUBLE BREAKへ移行し、追加のオプションが増え、ボーナスがさらに倍になる。新規モード「ARRANGE」は、この同じ高揚の階段を、自分で選べるビルドへと組み替えたもの——スコアアイテムを取ると共有のマルチゲージが溜まり、好きなタイミングでサポートポッドやスピードアップなどのパワーアップへ変換できる、押し付けではない拡張だ。難易度は「NOVICE」「ARCADE」「ARRANGE」の3段階、それぞれがさらに複数モードへ枝分かれする。開発は日本の同人サークル YOTSUBANE(サークル名義 CLOVER-TAC)——2010年12月のコミケ79で初出展し、2011年1月にWindows版を発売。Nintendo Switch版以降は、1987年設立の東京の開発会社 Adventure Planning Service が共同開発として加わっている。発売はKOMODO——2021年にDegica Gamesのゲーム部門が独立してできた、東京拠点の小規模レーベルだ。前作『World Ignition』のSteam版は2021年12月、パブリッシャーの要請でストアから取り下げとなり、同じタイミングで、この後継版『World EXplosion』(2020年10月にNintendo Switch版として先行発売)が2021年12月6日にSteamへ登場した。Steam自身のストア表記で好評率96%の「非常に好評」(Steamのレビューデータでは376件中364件が好評)。対応言語は英語・フランス語・イタリア語・ドイツ語・スペイン語・ポルトガル語・ポーランド語・日本語・簡体字/繁体字中国語だが、376件のレビューのうち英語はまだ約273件、約72.6%に留まる。PC Gamerはすでに特集記事「Revisiting Crimzon Clover, a shmup that rivals the genre's best」を組んでおり、Nintendo Lifeとコミュニティ参照wikiのshmups.wikiも取り上げている——だから「西側がまったく触れていない一本」と呼ぶのは正直ではない。本当なのは、その認知が今なお弾幕シューティングのコアなファン層に留まっており、シューター以外の幅広い層へはまだ届いていないということだ。日本では1,980円(海外は19.99ドル)の有料タイトルで無料ではなく、正式リリース済みでアーリーアクセスではなく、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。",
      },
      {
        name_en: "Gradius",
        name_ja: "グラディウス",
        status: "established",
        steam: "https://store.steampowered.com/app/2897590/GRADIUS_ORIGINS/",
        wikidata: "https://www.wikidata.org/wiki/Q1324646",
        homepage: "https://en.wikipedia.org/wiki/Gradius_(video_game)",
        tag_en: "The likely origin",
        tag_ja: "系譜上の原点(推定)",
        desc_en: "A likely, though not developer-confirmed, root of one piece of this taste: Gradius, a horizontally scrolling shoot 'em up developed and published by Konami, released in Japanese arcades in May 1985 (and internationally as Nemesis). Rather than have its ship, the Vic Viper, pick up isolated power-ups, it built the 'power meter': collecting capsules advances a highlighted option along a row of upgrades at the screen's bottom, and pressing the power-up button locks in whichever option is currently lit, a selection-bar idea its team modeled on a keyboard's function keys so players could choose their own build in real time rather than have it chosen for them. Widely credited alongside Namco's Xevious as one of the shooters that defined the genre, it has no standalone Steam release of its own; the only current PC form is GRADIUS ORIGINS, a 2025 collection published by Konami that gathers the arcade original alongside later entries. Crimzon Clover World EXplosion's new ARRANGE mode, in which picking up score items charges a shared gauge you can spend at will on support pods, speed-ups, and other power-ups, has been independently likened by Nintendo Life and the community reference wiki shmups.wiki to that same power-up selection design, though Yotsubane has not stated the connection directly.",
        desc_ja: "この味の一部について、開発者本人による確認は取れていないものの、もっとも近しい原点候補——グラディウス。コナミが開発・発売した横スクロールシューティングで、1985年5月に日本のアーケードで稼働を開始した(海外では『Nemesis』の名で展開)。自機「ビックバイパー」が個別のパワーアップを拾う方式ではなく、「パワーメーター」という仕組みを築いた——カプセルを取ると画面下に並ぶ強化項目のハイライトが進み、パワーアップボタンを押すと今光っている項目がその場でロックインされる。この選択バーの発想は、開発チームがキーボードのファンクションキーになぞらえて考案したもので、強化を一方的に押し付けられるのではなく、プレイヤー自身がその場で選び取れる自由を生んだ。ナムコの『ゼビウス』と並び、このジャンルを定義した作品の一つとして広く評価されている。1985年のアーケード原作単体のSteam版は無く、今日PCで入手できる唯一の形は、コナミが発売した2025年のコレクション『GRADIUS ORIGINS』で、アーケード原作が後続作とともに収録されている。『Crimzon Clover World EXplosion』の新規モード「ARRANGE」——スコアアイテムの取得で共有ゲージを充填し、サポートポッドやスピードアップなどのパワーアップへ好きなタイミングで変換できる仕組み——について、Nintendo Lifeと、コミュニティによる参照wiki「shmups.wiki」がそれぞれ独立に、この同じパワーアップ選択の設計になぞらえている。ただし開発元 YOTSUBANE がこの関連を直接述べたことは確認されていない。",
      },
    ],
    en: {
      title: "Crimzon Clover World EXplosion - a vertically scrolling bullet-hell shooter where flying close enough to lock onto everything in range chains into a multiplier, and stacking two full Break Gauges triggers Double Break for a short burst of overpowered destruction, Very Positive at 96 percent over 376 reviews though only about 73 percent of them are English",
      description: "A vertically scrolling bullet-hell shooter by the Japanese doujin circle Yotsubane (CLOVER-TAC). Flying close enough to graze an enemy feeds energy, lock-on speed, and damage, and chains into a score multiplier; a full Break Gauge triggers Break Mode, and stacking a second sends it into Double Break. The new ARRANGE mode lets you charge a shared gauge and spend it on power-ups of your choosing. Very Positive at 96 percent over 376 reviews, still only about 72.6 percent English.",
      h1a: "Get close enough to lock onto everything in reach, ",
      h1flip: "and the same risk that could kill you chains into a multiplier that keeps climbing",
      h1b: ".",
      lede: "A vertically scrolling bullet-hell shooter developed by the Japanese doujin circle Yotsubane, also known by its circle name CLOVER-TAC, first shown at Comiket 79 in December 2010, with Adventure Planning Service, a Tokyo studio founded in 1987, joining as co-developer from the Nintendo Switch version onward, and published by the small Tokyo label KOMODO. Flying close enough to graze an enemy feeds you energy faster, speeds up your lock-on, and raises your damage, the same proximity that could get you killed; holding the lock-on button paints a line across everything in range, up to 24 enemies at once (28 in Break Mode, 32 in Double Break), and releasing it fires a spread of homing lasers that chains into a score multiplier. Fill the Break Gauge and Break Mode spikes your damage, speed, lock-on speed, and the value of the gold stars enemies drop; keep it full and Double Break stacks on top with an extra Option pod and a doubled bonus again. The new ARRANGE mode reworks that same escalation into a build of your own choosing: score items charge a shared gauge you can spend at any moment on support pods, speed-ups, and other power-ups rather than have them assigned to you automatically. It is Very Positive at 96 percent over 376 reviews, and while PC Gamer has run a feature on it and both Nintendo Life and the community wiki shmups.wiki have covered it, only about 72.6 percent of those reviews are in English so far, so its recognition still sits mostly with the core bullet-hell crowd.",
      s1: "First, the one feeling",
      feeling: [
        "Standard shmup instinct says keep your distance, but here energy, lock-on speed, and damage all scale with how close you dare to fly, so the safe read of any encounter flips: the graze that could kill you is also the fuel you need most.",
        "Holding the lock-on button paints a line across everything in range, and every enemy you catch adds to the chain when you let go, up to 24 at once, 28 in Break Mode, 32 in Double Break, so the closer and greedier you play, the bigger the multiplier waiting on the other side of the same held breath.",
        "All of that aggression fills the same Break Gauge, and once it is full a second full gauge does not just extend Break Mode, it stacks into Double Break, an extra Option pod and a doubled bonus on top of a doubled bonus, so the run rewards you for finding a way to stay in the danger zone even after it should have already killed you.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You want a bullet-hell built entirely around point-blank risk, where energy, lock-on speed, and damage all rise the closer you fly, with a lock-on chain topping out at 24 to 32 targets and a two-stage Break and Double Break gauge that snowballs your own aggression into overkill",
        "You want a genre veteran's new ARRANGE mode that hands you a Gradius-style power-up selection bar of your own, charging a shared gauge from score items and spending it on support pods and speed-ups whenever you choose, a design Nintendo Life and shmups.wiki have both likened to Konami's 1985 power meter",
        "You want a cult favorite the core bullet-hell scene already knows, praised in a PC Gamer feature and Very Positive at 96 percent over 376 reviews, before the small slice of English-reading players, about 72.6 percent of its reviews, grows into something wider",
      ],
      bad: [
        "You want a slow, cautious shooter where staying at range is the correct play; the entire design pays you for closing distance and gambling on when to trigger Break and Double Break, and it is a paid, fully launched title at ¥1,980 ($19.99), not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's own descriptors",
        "You want a game the West has never heard of at all; PC Gamer, Nintendo Life, and shmups.wiki have all already covered it, so calling it fully undiscovered would not be honest. What is true is that only about 72.6 percent of its 376 reviews are in English so far, and its audience still leans heavily Japanese",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Crimzon Clover World EXplosion - 敵に近づくほどロックオンできる数が増え、そのままチェイン倍率になる弾幕シューティング。ブレイクゲージを二段積むと「DOUBLE BREAK」へ突入し束の間の暴走状態に。376件のレビューで好評率96%の「非常に好評」ながら、英語レビューはまだ約73%",
      description: "日本の同人サークル YOTSUBANE(CLOVER-TAC)による縦スクロールの弾幕シューティング。敵に近づくほどエネルギー・ロックオン速度・与ダメージが伸び、そのままスコアのチェイン倍率になる。ブレイクゲージが満タンになるとBREAKモード、さらに積むとDOUBLE BREAKへ突入。新規モード「ARRANGE」では共有ゲージを好きなパワーアップへ自由に変換できる。376件のレビューで好評率96%の「非常に好評」、英語レビューはまだ約72.6%。",
      h1a: "敵に近づくほど、ロックオンできる数が増えていく。",
      h1flip: "殺されかねないその近さが、そのままチェイン倍率になって伸びていく",
      h1b: "。",
      lede: "日本の同人サークル YOTSUBANE(サークル名義 CLOVER-TAC)が手がけ、2010年12月のコミケ79で初出展、1987年設立の東京の開発会社 Adventure Planning Service が Nintendo Switch版以降で共同開発として加わり、東京拠点の小規模レーベル KOMODO が発売する縦スクロールの弾幕シューティング。敵に至近距離まで近づくほどエネルギー獲得が早まり、ロックオンも速まり、与ダメージも上がる——だがその同じ近さが、自分を殺しかねない危険地帯でもある。ロックオンボタンを押し続けると射程内の敵すべてに照準線が伸び(通常最大24体、BREAK中28体、DOUBLE BREAK中32体)、離すとその数だけ追尾レーザーが放たれ、そのままスコアのチェイン倍率になる。ブレイクゲージが満タンになるとBREAKモードが発動し、与ダメ・速度・ロックオン速度・敵が落とす金の星の獲得量が跳ね上がる。満タンを維持したまま溜め続けるとDOUBLE BREAKへ移行し、追加のオプションが増え、ボーナスがさらに倍になる。新規モード「ARRANGE」は、この同じ高揚の階段を自分で選べるビルドへと組み替えたもの——スコアアイテムで共有ゲージを溜め、好きなタイミングでサポートポッドやスピードアップなどのパワーアップへ変換できる。376件のレビューで好評率96%の「非常に好評」。PC Gamerの特集記事があり、Nintendo Lifeとshmups.wikiも取り上げているが、そのうち英語はまだ約72.6%に留まり、認知は今なお弾幕シューティングのコアなファン層が中心だ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "普通のシューティングなら安全なのは敵から離れること。でもここではエネルギー・ロックオン速度・与ダメージのすべてが、どれだけ危険な距離まで飛び込めるかに比例する。だから「危ない」はずのかすりが、そのまま一番欲しい燃料になる——安全の読みそのものがひっくり返る。",
        "ロックオンボタンを押し続けると、射程内のすべてに照準線が伸びる。離した瞬間、捕まえた数がそのままチェインになる——通常最大24体、BREAK中28体、DOUBLE BREAK中32体。だから近づいて欲張るほど、息を止めたその先で待つ倍率も大きくなっていく。",
        "その攻めっ気のすべてが、同じブレイクゲージを満たしていく。満タンになった上でもう一段満たすと、BREAKモードが延びるだけでは終わらない——DOUBLE BREAKへ移行し、追加のオプションと、二重に膨らんだボーナスが手に入る。だから、とっくに死んでいてもおかしくない危険地帯に踏みとどまり続けたことそのものが、報われる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "至近距離のリスクだけで組み立てられた弾幕シューティングが欲しい人——近づくほどエネルギー・ロックオン速度・与ダメージが伸び、ロックオン数は最大24〜32体まで積み上がり、自分の攻めっ気そのものが二段構えのBREAK/DOUBLE BREAKへ雪だるま式に変わっていく",
        "老舗タイトルが新たに積んだ「ARRANGE」モードで、自分だけのグラディウス的パワーアップ選択バーが欲しい人——スコアアイテムで共有ゲージを溜め、好きなタイミングでサポートポッドやスピードアップへ変換できる。この設計をNintendo Lifeとshmups.wikiがそれぞれ、コナミの1985年「パワーメーター」になぞらえている",
        "コアな弾幕シューティング層にはすでに知られたカルト的人気作を、広い層に届く前に触りたい人——PC Gamerの特集記事もあり、376件のレビューで好評率96%の「非常に好評」。英語レビューはまだ約72.6%に留まる",
      ],
      bad: [
        "距離を取るのが正解の、ゆっくり慎重なシューティングが欲しい人(本作は距離を詰め、BREAK・DOUBLE BREAKをいつ発動させるかの賭けそのものに報酬を与えるよう作られている)。また、日本では1,980円(海外は19.99ドル)の無料ではない有料タイトルで、正式リリース済みでアーリーアクセスではなく、AI生成アセットはなく、Steam自身のディスクリプタ上、性的な要素もない",
        "西側がまったく知らない一本が欲しい人(PC Gamer・Nintendo Life・shmups.wikiがすでに取り上げており、「完全未発見」と呼ぶのは正直ではない。本当なのは、376件のレビューのうち英語はまだ約72.6%に留まり、支持は今なお日本語圏に大きく偏っているということだ)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "core-awaken-rurumus-will": {
    published: "2026-07-12",
    publishAt: "2026-07-12",
    kind: "find",
    leadIndex: 0,
    // genre は新設 "character-switch-action-rpg": Steam自身のジャンルタグは Action/Adventure/Casual/
    //   Indie/RPG(appdetails実測確認済み)、人気ユーザータグには Action RPG/Side Scroller/Third-Person
    //   Shooter等も並ぶが、本作を定義する核はストア本文が明記する「2人の playable character が異なる
    //   戦闘スタイルを状況に応じて切り替える」設計(Steam本文実測: "The characters can switch between
    //   different fighting styles that have respective features, Choose your style tactically to counter
    //   various situations!")。既存の "action"(rhythm型2件で使用中)や "dungeon-rpg" 等では捉えきれない
    //   ため hand-me-down-mecha-fps 型の細粒度ラベルを追加(ui.ts en/ja 追加済み)。
    // 系譜は「扫雷冒险谭2 ~露露姆的冒险~」(Minesweeper Adventure Tale 2、CelLab開発、2021年3月19日発売、
    //   OTAKU Plan発売、appid 1549240、Steam appdetails実測確認済み)。ジャンル上の原点ではなく、同一開発元
    //   CelLab(両appdetailsのdevelopers実測が完全一致)による、同一キャラクター「ルルム」主演の前作という
    //   系譜(自己参照型の直系続編・monster-rancher型の開発者言明より一段強い、Steam実測データそのものが
    //   示す一次情報)。さらに両作のストア本文がともに舞台を「Noruru Village(诺鲁鲁村)」と明記しており
    //   (前作の中文ストア本文、本作の英語ストア本文いずれもappdetails実測確認済み)、キャラクターだけでなく
    //   世界設定も引き継がれていることを確認済み。自信度: 高(発言ベースでなく公式メタデータの実測一致)。
    //   前作はSteam自身の表記で対応言語が簡体字中国語のみ(appdetails実測確認済み・英語/日本語なし)。
    // obscurity は "deep"(noEnglish=false、Steam自身が繁体字中国語/英語/日本語で対応済み)。reachState は
    //   "unreached_west" を立てる: 英語レビュー比率18.8%(18/96、Steam appreviews API実測、正確には18.75%)
    //   と過半数に遠く及ばず、IGDB/Metacritic/Kotaku/Backloggdには自動集計ページが存在するのみでレビュー
    //   本文や特集記事は確認できず、インディートラッカー PixelWave 以外に西側編集メディアの実質的な取材は
    //   見当たらないため(誇張しない・mamon-king型の判断基準)。reviewBand は持たせない: 96件は数百に満たず
    //   "hundreds" と言い切れない(誇張しない)。content_descriptors は ids=[]・notes=null(API実測)。
    meta: { genre: "character-switch-action-rpg", lineage: "minesweeper-adventure-tale-2", obscurity: "deep", reachState: "unreached_west", rarity: { reviews: 96, positivePct: 98, noEnglish: false } },
    games: [
      {
        name_en: "Core Awaken Rurumu's will",
        name_ja: "機核覚醒～ルルムの決意～",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2963320/Core_Awaken_Rurumus_will/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A side-scrolling action RPG about a maid robot named Rurumu whose own core awakened the moment she wished to 'live happily ever after with the Village Head,' only to find that awakening got in the way of the goal it was chasing in the first place: understanding what actually makes people happy, by becoming more human herself. After she fails to keep the Village Head safe in an incident and discovers just how incompetent she is in a fight, she sets out to protect Noruru Village and find her own 'Fighting Style,' developed and published by the small Japanese studio CelLab (セルレ部) together with the label 072 Project / 072 News. She shares the mission, and the controls, with Kitsunetsuki Koharu, a War Shrine Maiden of the Demon Slayer Institution trained since childhood, who has already had to end more of her own corrupted fellow shrine maidens than actual demons and privately wishes she could just become a heartless demon-slaying robot herself. Per Steam's own store page, the two of them switch between distinct fighting styles mid-mission, and the game is built around reading each situation and picking whichever style counters it, while missions run you through a variety of enemies and treasure toward mission challenges and a high score (one of the game's own Steam achievements is literally named 'Perfect Chain Destruction'), with RPG-style equipment and upgrades layered on top for each of them. Its achievement list also confirms a chapter structure that includes a dedicated 'Koharu Chapter,' three explorable areas (Village Outskirts, Snow Mountain, and an Underground Passage), and a bonus 'Infinite Tower' you can climb floor by floor once the story's demon-clan plot is foiled. Released April 30, 2026 per Steam's own listing on both its Japanese and English storefronts, it is Very Positive at 98 percent per Steam's own store page (94 of 96 reviews positive per Steam's review API), a paid title at $12.99 in the US (¥1,980 in Japan), not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). It supports Traditional Chinese, English, and Japanese text and interface only (no Simplified Chinese, no Korean), and while pages for it already exist on aggregators like IGDB, Metacritic, Kotaku, and Backloggd, and the indie tracker PixelWave has covered it, we found no substantial Western editorial review or feature to point to; only about 18 of its 96 reviews, roughly 18.8 percent, are in English so far, so calling this discovered by the West would not be honest. What is true is that its recognition outside Japan is only just getting started.",
        desc_ja: "「ご主人様を幸せにする」という自らの使命を果たすため、より人間らしくなることで「人類の幸せ」とは何かを理解しようとしているロボット、ルルム。「村長様といつまでも幸せに暮らしたい」と願ったことをきっかけに機核(コア)が覚醒し意識を持つに至ったが、その覚醒こそが本来の目的の妨げになってしまっていた。ある事件で村長を守り切れず、自分の戦闘能力のなさを思い知ったルルムは、「村を守る」ことを新たな目標に掲げ、自分自身の「戦い方」を探す旅に出る。開発・発売は日本の小規模スタジオ CelLab(セルレ部)と、レーベル 072 Project / 072 News。ルルムがこの任務と操作を分け合う相棒は、退魔機関に属する戦巫女コハル(狐憑コハル)——幼い頃から鍛えられ、実際の鬼よりも堕ちてしまった仲間の巫女を手にかけてきた経験の方が多く、いっそ心を持たない退魔ロボットになれたらと密かに思っている人物だ。Steam自身のストア表記によれば、この2人はミッション中に異なる戦闘スタイルを切り替えて使い分けられ、目の前の状況を読んでどちらが有利かを選ぶ設計になっている。ミッションでは多様な敵と宝物が待ち構え、ミッションチャレンジの達成とハイスコアを狙う作りで(実績の一つはそのまま「Perfect Chain Destruction」という名前が付いている)、そこに2人それぞれ独立したRPG的な装備・強化が重なる。実績一覧からは、「コハル編」という専用チャプターを含む章立て構成、3つの探索エリア(村外れ・雪山・地下通路)、そして本編の鬼一党の陰謀を阻止した後に階層ごとに挑めるおまけモード「無限の塔」の存在も確認できる。Steam自身の表記(日本語版・英語版ストアとも一致)によれば2026年4月30日にリリースされ、Steam自身のストアページで好評率98%の「非常に好評」(Steamのレビューデータでは96件中94件が好評)。無料ではない有料タイトル(米国12.99ドル、日本では1,980円)で、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。対応言語は繁体字中国語・英語・日本語のテキストとインターフェースのみ(簡体字中国語・韓国語は非対応)。IGDB・Metacritic・Kotaku・Backloggdといったサイトにはすでにページが存在し、インディートラッカーのPixelWaveも取り上げているが、実質的な西側編集メディアのレビューや特集記事は見当たらない——96件のレビューのうち英語はまだ約18件、約18.8%に留まり、「西側に発見された」と呼ぶのは正直ではない。本当なのは、日本国外での認知はまだ始まったばかりだということだ。",
      },
      {
        name_en: "Minesweeper Adventure Tale 2: Rurumu's Adventure",
        name_ja: "扫雷冒险谭2 ~露露姆的冒险~",
        status: "established",
        steam: "https://store.steampowered.com/app/1549240/2/",
        tag_en: "Same heroine's earlier game",
        tag_ja: "同じヒロインの前作",
        desc_en: "Not a defining-mechanic ancestor but the game this heroine headlined before this one: Minesweeper Adventure Tale 2: Rurumu's Adventure (扫雷冒险谭2 ~露露姆的冒险~), a minesweeper-based adventure game (Steam's own genre tags list it as Adventure, RPG, and Strategy) developed by the same studio, CelLab, and published in the China market by OTAKU Plan, released March 19, 2021 with Simplified Chinese as its only supported language per Steam's own listing (no English or Japanese version exists). It stars the same robot heroine, Rurumu, on the same mission she is still on in Core Awaken Rurumu's will: getting the people of Noruru Village home safely, in this case after a disaster leaves their route home buried in landmines. Per its own store page, the number revealed on a swept tile tells you how many mines surround it, so you mark them by deduction across more than a hundred stages, picking up items and dodging traps that help or hinder that read along the way, and leveling up equipped skills using stars earned as stage-clear rewards. Core Awaken Rurumu's will keeps Rurumu and her drive to protect that same village, but hands her a completely different kind of game: real-time, switchable combat alongside a second playable heroine, Kitsunetsuki Koharu, in place of a number-reading minesweeper puzzle.",
        desc_ja: "ジャンル上の原点ではなく、このヒロインが本作より前に主演していた一本——扫雷冒险谭2 ~露露姆的冒险~(Minesweeper Adventure Tale 2: Rurumu's Adventure)。Steam自身のジャンルタグでは Adventure・RPG・Strategy に分類される、数字を読んで地雷を見極めるアドベンチャーで、開発は本作と同じ CelLab、発売(中国市場向けローカライズ)は OTAKU Plan、2021年3月19日にリリースされた。Steam自身の表記によれば対応言語は簡体字中国語のみで、英語版・日本語版は存在しない。主人公は本作『機核覚醒～ルルムの決意～』と同じロボットのルルムで、目指すゴールも変わらない——ノルル村(诺鲁鲁村)の人々を無事に村へ帰すこと。前作では、ある事件で村への帰り道が地雷原と化してしまい、ルルムが地雷除去の旅に出る。ストアページによれば、開いたマスに表示される数字が周囲の地雷数を示し、その数字を手がかりに100を超えるステージで地雷を見極めてマークしていく——道中には手助けとなるアイテムや妨害となる罠もあり、ステージクリア報酬で得られる「星」を使って装備したスキルを強化していく。『機核覚醒～ルルムの決意～』は、同じルルムと同じ「村を守る」という動機を受け継ぎながら、数字を読んで地雷を見極めるパズルを、リアルタイムで切り替え可能な戦闘と、もう一人の操作キャラクター、コハルとの二人体制へとまるごと置き換えている。",
      },
    ],
    en: {
      title: "Core Awaken Rurumu's will - a side-scrolling action RPG where a maid robot finding her own fighting style and a demon-slaying shrine maiden switch combat styles mid-mission, made by the small Japanese studio CelLab as a direct sequel to its own 2021 minesweeper-adventure starring the same heroine, Very Positive at 98 percent over 96 reviews though only about 19 percent of them are English",
      description: "A side-scrolling action RPG by the small Japanese studio CelLab (セルレ部). Maid robot Rurumu and demon-slaying shrine maiden Kitsunetsuki Koharu switch fighting styles mid-mission to counter each fight, layering independent RPG equipment and upgrades on top. It is CelLab's direct sequel to its own 2021 minesweeper-adventure starring the same Rurumu. Very Positive at 98 percent over 96 reviews, still only about 18.8 percent English.",
      h1a: "Every fight in front of you is asking which of two styles you should become. ",
      h1flip: "switch mid-mission, and picking wrong is the only threat that actually matters",
      h1b: ".",
      lede: "A side-scrolling action RPG developed and published by the small Japanese studio CelLab (セルレ部) together with the label 072 Project / 072 News, released April 30, 2026. Maid robot Rurumu's core awakened after she wished to live happily ever after with her Village Head, but that same awakening got in the way of her real goal, understanding what makes humans happy in the first place; when she failed to keep the Village Head safe and discovered just how bad she was in a fight, she set out to protect Noruru Village and find her own 'Fighting Style.' She shares the mission, and the game, with Kitsunetsuki Koharu, a War Shrine Maiden of the Demon Slayer Institution who has ended more of her own corrupted fellow shrine maidens than actual demons and privately wishes she could just become a heartless demon-slaying robot herself. You switch between the two of them and their distinct fighting styles mid-mission, picking whichever counters the fight in front of you, while missions send you through a variety of enemies and treasure to chase mission challenges and a high score (one of its Steam achievements is literally named 'Perfect Chain Destruction'), and RPG-style equipment and upgrades carry independently for each of them. It is CelLab's own direct sequel, not a reboot: the studio's earlier game, a minesweeper-based adventure released in 2021, starred this same robot heroine on this same mission to protect this same Noruru Village, per both games' own Steam listings. It is Very Positive at 98 percent per Steam's own store page (94 of 96 reviews positive per Steam's review API), a paid title at $12.99 in the US (¥1,980 in Japan), not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). It supports Traditional Chinese, English, and Japanese text and interface only, and while aggregator pages for it already exist on sites like IGDB, Metacritic, Kotaku, and Backloggd, and the indie tracker PixelWave has covered it, we found no substantial Western editorial review or feature; only about 18 of its 96 reviews, roughly 18.8 percent, are in English so far, so its reach into the West has barely begun.",
      s1: "First, the one feeling",
      feeling: [
        "Rurumu and Koharu fight in genuinely different styles, and Steam's own listing is explicit that you are meant to read each situation and switch mid-mission to whichever one counters it, so the same enemy pattern can demand two different answers depending on which of the two you happen to be when you meet it.",
        "Missions run you past a variety of enemies and treasure while you chase mission challenges and a high score, and one of the game's own Steam achievements is literally named 'Perfect Chain Destruction,' so clearing a stage cleanly and clearing it for score turn out to be two different goals stacked on the same run.",
        "Equipment and upgrades carry independently for each of the two fighting styles, and the achievement list confirms three separate areas to explore (Village Outskirts, Snow Mountain, an Underground Passage) plus a bonus 'Infinite Tower' you can keep climbing floor by floor once the story's demon-clan plot is done, so the build you settle into during the campaign is the same one you carry into whatever comes after it.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You want a side-scrolling action RPG built around switching between two distinctly different playable heroines mid-mission, a maid robot finding her own 'Fighting Style' and a demon-slaying shrine maiden who has killed more of her own corrupted friends than actual demons, each carrying independent equipment and upgrades",
        "You want a small Japanese studio's direct sequel to its own earlier game, not a reboot: developed by CelLab, it keeps the same robot heroine Rurumu and her drive to protect the same Noruru Village from its 2021 minesweeper-adventure predecessor, but replaces that puzzle loop entirely with real-time, switchable combat and a second playable character",
        "You want to catch a very fresh Very Positive release before its English-language audience arrives: 98 percent over 96 reviews as of this writing, with only about 18.8 percent of them in English so far and no substantial Western editorial coverage found yet",
      ],
      bad: [
        "You want a slow, puzzle-first game like the developer's own earlier minesweeper-adventure title; this is real-time action built around switching fighting styles under pressure, and it is a paid, fully launched title at $12.99 (¥1,980 in Japan), not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's own descriptors",
        "You want full Simplified Chinese or Korean support; Steam's own listing offers Traditional Chinese, English, and Japanese only, and with just 96 reviews total and roughly 18.8 percent of them in English, this is about as unproven-in-the-West as a release gets right now",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "機核覚醒～ルルムの決意～ - 自分の戦い方を探すメイドロボと、退魔機関の戦巫女がミッション中に戦闘スタイルを切り替える横スクロールアクションRPG。開発は小規模スタジオCelLab、同じヒロイン主演の2021年発売の前作(数字を読む地雷アドベンチャー)の正統な続編。96件のレビューで好評率98%の「非常に好評」ながら、英語レビューはまだ約19%",
      description: "日本の小規模スタジオ CelLab(セルレ部)による横スクロールアクションRPG。自分の戦い方を探すメイドロボのルルムと、退魔機関の戦巫女コハルが、ミッション中に戦闘スタイルを切り替えて状況に対応し、それぞれ独立したRPG的な装備・強化を積んでいく。同じヒロイン・ルルムが主演した2021年発売の前作(数字を読んで地雷を見極めるアドベンチャー)の正統な続編にあたる。96件のレビューで好評率98%の「非常に好評」、英語レビューはまだ約18.8%。",
      h1a: "目の前の敵が、二つの戦闘スタイルのどちらになるべきかを突きつけてくる。",
      h1flip: "ミッション中に切り替える——選び間違えることだけが、本当の脅威になる",
      h1b: "。",
      lede: "日本の小規模スタジオ CelLab(セルレ部)と、レーベル 072 Project / 072 News が開発・発売する横スクロールアクションRPGで、2026年4月30日にリリースされた。ロボットのルルムは、「村長様といつまでも幸せに暮らしたい」と願ったことをきっかけに機核(コア)が覚醒し意識を持つに至ったが、その覚醒こそが本来の目的——より人間らしくなることで「人類の幸せ」とは何かを理解する——の妨げになってしまっていた。ある事件で村長を守り切れず、自分の戦闘能力のなさを思い知ったルルムは、「村を守る」ことを新たな目標に掲げ、自分自身の「戦い方」を探す旅に出る。この任務と操作を分け合う相棒は、退魔機関に属する戦巫女コハル(狐憑コハル)——実際の鬼よりも堕ちてしまった仲間の巫女を手にかけてきた経験の方が多く、いっそ心を持たない退魔ロボットになれたらと密かに思っている人物だ。この2人はミッション中に異なる戦闘スタイルを切り替えて使い分けられ、目の前の状況を読んでどちらが有利かを選ぶ設計になっており、ミッションでは多様な敵と宝物が待ち構え、ミッションチャレンジの達成とハイスコアを狙う作りで(実績の一つはそのまま「Perfect Chain Destruction」という名前が付いている)、そこに2人それぞれ独立したRPG的な装備・強化が重なる。焼き直しではなく CelLab 自身による正統な続編でもある——両作のSteam自身の表記によれば、同じロボットのヒロイン・ルルムが、同じノルル村を守るという同じ目標で主演した、2021年発売の数字読み型地雷アドベンチャーが前作にあたる。Steam自身のストアページで好評率98%の「非常に好評」(Steamのレビューデータでは96件中94件が好評)。無料ではない有料タイトル(米国12.99ドル、日本では1,980円)で、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。対応言語は繁体字中国語・英語・日本語のテキストとインターフェースのみ。IGDB・Metacritic・Kotaku・Backloggdといったサイトにはすでにページが存在し、インディートラッカーのPixelWaveも取り上げているが、実質的な西側編集メディアのレビューや特集記事は見当たらない——96件のレビューのうち英語はまだ約18件、約18.8%に留まり、西側への広がりはまだ始まったばかりだ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "ルルムとコハルは根本的に違う戦い方をする。Steam自身の表記は、目の前の状況を読んでミッション中にどちらへ切り替えるかを選ぶ設計だと明言している——だから同じ敵の並びでも、その瞬間どちらのスタイルでいるかによって、正解の動き方そのものが変わってくる。",
        "ミッションでは多様な敵と宝物の間を進みながら、ミッションチャレンジの達成とハイスコアの両方を狙わされる。実績の一つはそのまま「Perfect Chain Destruction」という名前を持つ——だから「綺麗にクリアする」ことと「高スコアで倒す」ことは、同じ一回のプレイの中で別々の目標として積み重なっていく。",
        "装備と強化は2つの戦闘スタイルそれぞれに独立して積み上がっていく。実績一覧からは、探索できる3つのエリア(村外れ・雪山・地下通路)に加え、本編の鬼一党の陰謀を阻止した後に階層ごとに挑めるおまけモード「無限の塔」の存在も確認できる——だから本編で仕上げたビルドが、そのままその先のやり込みにも持ち越される。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "2人のまったく違うプレイアブルヒロインをミッション中に切り替える横スクロールアクションRPGが欲しい人——自分の「戦い方」を探すメイドロボと、実際の鬼よりも仲間の巫女を手にかけてきた経験の方が多い退魔の戦巫女、それぞれ独立した装備・強化を積める",
        "焼き直しではなく、小規模な日本スタジオが自作を正統に継いだ続編が欲しい人——開発は CelLab、2021年発売の前作(数字読み型の地雷アドベンチャー)と同じロボットのヒロイン・ルルムと、同じ「ノルル村を守る」という動機を受け継ぎながら、そのパズルループを丸ごとリアルタイムの切り替え式戦闘と2人目の操作キャラクターへ置き換えている",
        "とても新しい「非常に好評」タイトルを、英語圏の注目が追いつく前に掴みたい人——執筆時点で96件のレビューのうち好評率98%、英語はまだ約18.8%に留まり、実質的な西側編集メディアの取材もまだ見当たらない",
      ],
      bad: [
        "開発元自身の前作のような、じっくりしたパズル主体のゲームが欲しい人(本作はプレッシャーの中で戦闘スタイルを切り替えるリアルタイムアクション)。また、無料ではない有料タイトル(米国12.99ドル、日本では1,980円)の正式リリース済みでアーリーアクセスではなく、AI生成アセットはなく、Steam自身のディスクリプタ上、性的な要素もない",
        "簡体字中国語や韓国語の完全対応が欲しい人(Steam自身の表記では繁体字中国語・英語・日本語のみ)。レビュー総数はまだ96件、そのうち英語は約18.8%に留まり、いま現在としては西側でまだほとんど検証されていない一本だ",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "shadow-corridor": {
    published: "2026-07-12",
    publishAt: "2026-07-12",
    kind: "find",
    leadIndex: 0,
    // genre は既存 "exploration-horror"(naribiki-mura で使用中の fatal-frame系ラベル)を採用:
    //   Steam自身のジャンルタグは Action/Indie のみ(appdetails実測確認済み・専用ホラー
    //   タグは無い)だが、実体は一人称視点・戦闘なし・手続き生成される和風建築の回廊を探索し「能面」の
    //   追跡者から逃げる探索ホラーで(Steam本文実測: "Traverse randomized dungeons" / "Beware the curse
    //   of the Noh Mask that stalks you around every corner")、既存の exploration-horror 群と同じ核を持つ。
    // 系譜は外部作品(零/Fatal Frame・青鬼等)への安易な断定を避け、開発者本人の無料版原典——リリース日
    //   2017年6月21日、ふりーむ！で無料公開された『影廊 -Shadow Corridor-』(制作者 城間一樹、当時の旧HN
    //   「花月」)を新規 anchor "kageroh" として採用する(lineage_anchor_key=wikidata_qid, Q97198038。
    //   Wikidata実測: jawiki sitelink "Shadow Corridor"、公式サイトP856=https://www.spaceonigirigames.com/
    //   games)。第13回ふりーむ！ゲームコンテスト ホラー部門金賞受賞は、ふりーむ配信ページ本体に加え、
    //   Steam自身の英語レビュー本文(recommendationid 49634997: 無料デモ時代を指して "it won site-wide
    //   awards for best Horror game" と証言)からも独立に裏付けが取れている。本Steam版(appid 1025250)は
    //   この無料版の直系の全面リメイクで、Steam自身の about_the_game(EN/JA両ロケール実測)が新規ストー
    //   リーと追加のゲームシステムに加え「そのボリュームは何と10倍以上」と明記。原版の配信は今も生きて
    //   いる(freem.ne.jp/win/game/15097、直接WebFetchで200応答・現行ページ実測確認済み)ため、established
    //   側は wikidata(anchorとの逆引きキー)+ homepage(開発元公式サイトの本作専用ページ)+ freem(配信
    //   ページ本体)を併記し、Steam URLを持たない established の href 破損を防ぐ(捏造しない・gradius/
    //   mother-3型)。
    // obscurity は "deep"(総レビュー2,176件は少数とは言えないが、西側での認知は薄い・revolgear-zero/
    //   mirage-feathers型)。reachState は持たせない: WayTooManyGames(waytoomany.games、Final Verdict
    //   4.5)・Real Otaku Gamer(realotakugamer.com、"Better Off Staying in the Dark - Shadow Corridor
    //   Review")の実記事、およびMetacriticの批評ページ(コンシューマ版に対するGameGrin/Video Chums/
    //   Pure Nintendoのスコア)を直接WebFetchで実測確認済みであり、「西側未到達」と言い切るのは誇張
    //   (revolgear-zero/mirage-feathers型・複数媒体到達済みは誇張しない判断)。reviewBand は持たせない:
    //   2,176件は「数百」にも「約千」にも当てはまらない(誇張しない・lofi-girl型)。noEnglish=false(英語
    //   テキスト対応済み・フルボイスは日本語のみ)。content_descriptors は ids=[]・notes=null(API実測、
    //   EN/JA両ロケール一致)。好評率はストアページのキャッシュ表示「91%(1,974件)」より新しい
    //   appreviews API実測(2,176件・positive 1,969・90.487%)を正とし、整数へ丸めた90を採用。
    meta: { genre: "exploration-horror", lineage: "kageroh", obscurity: "deep", rarity: { reviews: 2176, positivePct: 90, noEnglish: false } },
    games: [
      {
        name_en: "Shadow Corridor",
        name_ja: "影廊 -Shadow Corridor-",
        status: "hidden",
        steam: "https://store.steampowered.com/app/1025250/Shadow_Corridor/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A first-person, combat-free 3D horror escape game: at summer dusk you wander into an ancient, labyrinthine mansion of bamboo and tatami, and must scour its procedurally generated halls for glowing Magatama stones to unlock the door out, carrying only a lighter as your one light source (extinguishing it helps you go undetected, but leaves you blind) plus whatever active items, firecrackers, a teleport mirror, and passive ones, like a stamina leaf, you scavenge along the way, while several distinct kinds of Noh-mask apparition, each with its own detection patterns, hunt you by sight and by sound and must be read and slipped past rather than fought. Developed and self-published by the solo Japanese developer Space Onigiri Game LLC, led by Kazuki Shiroma, who began posting early development footage under the handle Kagetsu (花月) in 2016. Per player reviews, dying restarts you at a checkpoint on the same generated map with your held items intact, but any reusable markers you had already placed stay wherever you dropped them, and quitting the run outright regenerates the whole map and sends the next level back to zero items, a real risk some reviews flag directly. Beyond that first corridor, further stages carry the story onward across multiple difficulty levels, with a bonus area unlocked only through what one reviewer called an 'ironman-esque' challenge. This is a ground-up commercial expansion of what began as a free Japanese indie demo: Steam's own listing describes the finished release as carrying 'more than ten times' that original's content, on top of a new story and additional mechanics. Released March 8, 2019, it is Very Positive at 90 percent over 2,176 reviews (1,969 positive per Steam's own review API), a paid title at $7.99 in the US (¥820 in Japan), not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). It is voiced entirely in Japanese, with English, Korean, Russian, and Simplified Chinese available as text. Western outlets including WayTooManyGames (Final Verdict: 4.5) and Real Otaku Gamer have already reviewed it, and Metacritic hosts further critic reviews of its console ports from GameGrin, Video Chums, and Pure Nintendo, yet only about 73 of its 2,176 reviews, roughly 3.35 percent, are in English so far, so this overwhelmingly positive reception still reads almost entirely in Japanese.",
        desc_ja: "一人称視点・戦闘要素なしの3Dホラー脱出ゲーム。夏の夕暮れ、迷い込んだ先は竹と畳造りの古い迷宮のような屋敷——手続き生成されるその回廊を歩き、脱出の扉を開ける光る勾玉(まがたま)を探し出さなければならない。頼れる光源はライター一つ(火を消せば見つかりにくくなるが、その代わり周りは何も見えなくなる)。道中で拾う爆竹やテレポート鏡といった能動的なアイテム、体力の葉のような受動的なアイテムだけを頼りに、視覚と聴覚でこちらを追う複数種の能面の徘徊者——それぞれ固有の探知パターンを持つ——を、戦うのではなく読んで避けてやり過ごす。開発・自社セルフパブリッシュは、日本のソロ開発者 城間一樹 が率いる Space Onigiri Game LLC(スペースおにぎりゲーム合同会社)。城間は2016年、当時の旧HN「花月」名義で開発中の映像をニコニコ動画に投稿し始めた人物だ。プレイヤーレビューによれば、死亡した場合は同じ生成マップ上のチェックポイントから、手持ちアイテムを保持したまま再開できるが、すでに設置し終えた再利用可能なマーカー類は落とした場所に残ったまま手元には戻らず、ラン自体を中断してしまうとマップ全体が生成し直され、次のレベルはアイテムゼロから始まる——一部のレビューが直接指摘するリスクだ。最初の回廊の先にはさらなるステージが続いて物語を進め、複数の難易度が用意されており、あるレビュアーが「アイアンマン的」と評した挑戦を突破しないと解放されないおまけエリアもある。本作はもともと無料の日本産インディーデモとして始まった作品を、ゼロから作り直した商業拡張版だ——Steam自身の表記は、完成版のボリュームは原版の「何と10倍以上」になったとし、新規のストーリーと追加のゲームシステムも加えたとしている。リリース日は2019年3月8日、2,176件のレビュー(Steam自身のレビューAPIでは1,969件が好評)で好評率90%の「非常に好評」。無料ではない有料タイトル(米国7.99ドル、日本では820円)で、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。音声は日本語のみのフルボイスで、英語・韓国語・ロシア語・簡体字中国語はテキストで対応。WayTooManyGames(最終評価4.5)やReal Otaku Gamerといった西側メディアがすでにレビューを掲載し、Metacriticには家庭用機版に対するGameGrin・Video Chums・Pure Nintendoの批評ページも存在するが、2,176件のレビューのうち英語はまだ約73件、約3.35%に留まり、この圧倒的に好評な評価は今なお、ほとんどが日本語で語られている。",
      },
      {
        name_en: "Kageroh: Shadow Corridor",
        name_ja: "影廊 -Shadow Corridor-",
        status: "established",
        wikidata: "https://www.wikidata.org/wiki/Q97198038",
        homepage: "https://www.spaceonigirigames.com/%E5%BD%B1%E5%BB%8A-shadowcorridor",
        freem: "https://www.freem.ne.jp/win/game/15097",
        tag_en: "The free original",
        tag_ja: "無料版の原点",
        desc_en: "The free original this grew from: 影廊 -Shadow Corridor- (Kageroh: Shadow Corridor), released for free on the Japanese freeware platform Freem, with a release date of June 21, 2017. Its creator, Kazuki Shiroma, first posted footage of a Western-styled horror project on Niconico Douga in February 2016 under the handle Kagetsu (花月), then reworked it into a Japanese-styled one that April; the finished free game went on to win the Gold Award in the Horror category at Freem's 13th game contest. It already carried this taste's core DNA: creeping through a traditional Japanese building by whatever light you carry, evading rather than fighting the Noh-mask apparitions that stalk its halls. Shadow Corridor on Steam is Shiroma's own ground-up commercial remake of this same free game, not a new work borrowing its DNA from the outside; per Steam's own listing, it keeps that original loop while adding a new story, new mechanics, and, in Steam's own words, 'more than ten times' the content of what shipped for free in 2017.",
        desc_ja: "本作が育った、その無料版の原点——リリース日2017年6月21日、日本のフリーゲーム配信サイト「ふりーむ！」で無料公開された『影廊 -Shadow Corridor-』。制作者の城間一樹は、2016年2月、当時の旧HN「花月」名義で洋風テイストのホラーゲームの制作映像をニコニコ動画に投稿し始め、同年4月には和風ホラーへと方向転換、完成したフリー版は第13回ふりーむ！ゲームコンテストのホラー部門で金賞を受賞した。この時点ですでに、和風建築の回廊を手持ちの明かりだけで歩き、徘徊する能面を戦わずに避けてやり過ごすという、この味の核となるDNAを備えていた。Steam版『Shadow Corridor』は、外部の何かからDNAを借りた新作ではなく、城間本人によるこの同じ無料ゲームのゼロからの商業リメイクだ。Steam自身の表記によれば、その同じループを保ったまま、新規のストーリーと新しいゲームシステムを加え、2017年に無料で公開されたボリュームの「何と10倍以上」にまで拡張されている。",
      },
    ],
    en: {
      title: "Shadow Corridor - a first-person, combat-free horror escape through corridors that regenerate every session, evading Noh-mask apparitions with only a lighter and whatever you scavenge, a ground-up commercial remake of a free 2017 original that won a Freem contest horror gold award, Very Positive at 90 percent over 2,176 reviews though only about 3.35 percent are English",
      description: "A first-person, combat-free horror escape game where you creep through procedurally generated corridors of a Japanese building using only a lighter and scavenged items, evading Noh-mask apparitions rather than fighting them. A ground-up commercial remake of a free 2017 original that won a Freem contest horror gold award. Very Positive at 90 percent over 2,176 reviews, still only about 3.35 percent English.",
      h1a: "You are given no weapon, only a lighter that shows you the dark. ",
      h1flip: "The corridor rebuilds itself every session, and a Noh mask is already listening for you",
      h1b: ".",
      lede: "A first-person, combat-free 3D horror escape game developed and self-published by the solo Japanese developer Space Onigiri Game LLC, led by Kazuki Shiroma. At summer dusk you wander into the procedurally generated corridors of a traditional Japanese building, carrying only a Zippo lighter as your one light source, plus whatever firecrackers, hand mirrors, and other items you scavenge along the way, looking for your own way out. Per Steam's own store text, the corridors 'change with every playthrough' and there is 'no one set route to take,' so surviving means reading the room with whatever you are holding, learning the habits of the several distinct Noh-mask apparitions that hunt you by sight and by sound, and finding a different way to slip past each of them. It began as a free Japanese indie horror game Shiroma made under the handle Kagetsu (花月), a release that went out for free on the platform Freem in June 2017 and was awarded Gold in the Horror category at Freem's 13th game contest; this Steam release is his own ground-up commercial remake of that same free game, carrying, per its own listing, a new story and 'more than ten times' the original's content. It is Very Positive at 90 percent over 2,176 reviews, and while Western outlets including WayTooManyGames and Real Otaku Gamer have already reviewed it, only about 3.35 percent of those reviews are in English so far.",
      s1: "First, the one feeling",
      feeling: [
        "Your only light source is a single lighter, and Steam's own text is explicit that the corridor changes shape every session, so the same flick of the wheel that lets you see where you are going is also what a nearby Noh mask can see coming; player accounts describe deliberately snapping it shut and finishing the last few steps blind, because being unseen matters more than being able to see.",
        "There is no fighting anything. What you are given instead is a fistful of counter-play: firecrackers you can throw to lure a wandering mask away from your real path, a teleport mirror to warp yourself somewhere else, a stamina leaf to outlast a chase you should not have started, so the entire game becomes reading which single item you are willing to spend on the one Magatama stone you can still see glowing down the hall.",
        "A death only sends you back to a checkpoint on the same map with your held items intact, so the game itself is not that harsh, but quitting the run at all regenerates the whole layout from nothing, so every session becomes its own sealed bet: however many Magatama and secrets you have already found only count for anything if you see this particular maze through to the end.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You want a first-person Japanese horror built entirely around evasion, not combat: read a single lighter's light against the position of whatever Noh-mask apparition is hunting you, and slip past it with firecrackers, a teleport mirror, or nothing but nerve",
        "You want real stakes behind a randomly generated maze: the layout regenerates whenever you quit, so hunting down every glowing Magatama and secret in a run means committing to seeing that specific maze through, not saving it for later",
        "You want to catch a solo Japanese developer's own commercial remake of his free breakout hit before the West does: Very Positive at 90 percent over 2,176 reviews, already reviewed by WayTooManyGames and Real Otaku Gamer, yet still read almost entirely in Japanese",
      ],
      bad: [
        "You want a horror game with a map or mini-map to lean on; per player reviews there is neither, so a randomly generated layout with dead ends you cannot predict is part of the design, not an oversight, and it is a paid, fully launched title at $7.99 (¥820 in Japan), not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's own descriptors",
        "You want full voice acting in your own language; only Japanese is fully voiced, with English, Korean, Russian, and Simplified Chinese offered as text only, and with just 73 of 2,176 reviews in English so far, this is still overwhelmingly a Japanese-language conversation",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "影廊 -Shadow Corridor- - 手続き生成される和風建築の回廊を、ライター一つの明かりだけを頼りに、複数種の能面の徘徊者から戦わずに逃げ延びる一人称ホラー脱出ゲーム。第13回ふりーむ！ゲームコンテスト ホラー部門で金賞を受賞した2017年の無料版を、ゼロから作り直した商業拡張版。2,176件のレビューで好評率90%の「非常に好評」ながら、英語レビューはまだ約3.35%",
      description: "手続き生成される和風建築の回廊を、ライター一つの明かりと拾ったアイテムだけを頼りに歩き、戦うのではなく能面の徘徊者から逃げ延びる、一人称視点の3Dホラー脱出ゲーム。第13回ふりーむ！ゲームコンテストのホラー部門で金賞を受賞した2017年の無料版を、ゼロから作り直した商業拡張版。2,176件のレビューで好評率90%の「非常に好評」、英語レビューはまだ約3.35%に留まる。",
      h1a: "武器は無い。渡されるのは、暗闇を照らすライターだけだ。",
      h1flip: "回廊はプレイするたびに姿を変え、能面の何かがすでに息を潜めて耳を澄ましている",
      h1b: "。",
      lede: "日本のソロ開発者 城間一樹 が率いる Space Onigiri Game LLC(スペースおにぎりゲーム合同会社)が開発・自社セルフパブリッシュする、一人称視点・戦闘要素なしの3Dホラー脱出ゲーム。夏の夕暮れ、手続き生成される和風建築の回廊に迷い込み、光源であるジッポーのライター一つと、道中で拾う爆竹や手鏡などのアイテムだけを頼りに、出口を探す。Steam自身のストア表記によれば、回廊は「プレイするたびに形を変え」「決まった攻略ルートは存在しない」——だから生き延びる術は、そのとき手にしているものを頼りに状況を読み、視覚と聴覚でこちらを追う複数種の能面の徘徊者、それぞれの習性をつかんで、その都度別のやり方ですり抜けることにある。本作はもともと、城間が当時の旧HN「花月」名義で手がけ、ふりーむ！での無料公開リリースを経て第13回ふりーむ！ゲームコンテストのホラー部門で金賞を受賞した、日本産インディーホラーが原点だ。Steam版はその同じ無料ゲームをゼロから作り直した商業版で、Steam自身の表記によれば新規のストーリーを加えボリュームは「何と10倍以上」になっている。2,176件のレビューで好評率90%の「非常に好評」。WayTooManyGamesやReal Otaku Gamerといった西側メディアがすでにレビューを掲載しているが、そのうち英語はまだ約3.35%に留まる。",
      s1: "まず、その一点の感覚",
      feeling: [
        "頼れる光源はライター一つ。Steam自身の表記どおり回廊はプレイのたびに形を変えるから、自分の足元を照らすためのその小さな火は、同時に近くにいる能面へこちらの居場所を教える灯りでもある。だから多くのプレイヤーは、あえてその火を閉じ、最後の数歩を何も見えないまま歩き切る——見えることより、見られないことの方が、命を左右する。",
        "戦う手段は与えられない。代わりに渡されるのは、ひとつかみの対抗策だ——徘徊する能面を本当の進路から引き離す爆竹、自分の位置をずらすテレポート鏡、無茶な追いかけっこを生き延びるための体力の葉。だから毎回のゲームは、廊下の先にまだ光って見えているその一つの勾玉のために、どのアイテムを差し出す覚悟があるかを読む作業になる。",
        "死んでも戻されるのは同じマップ上のチェックポイントまでで、手持ちアイテムはそのまま残る——だからこのゲーム自体はそこまで理不尽ではない。だが、ラン自体を切り上げてしまえば、その回廊はまるごと生成し直される。だから一回のセッションはそれ自体で完結した賭けになる——それまでに見つけた勾玉や秘密のどれだけもが、この迷宮を最後まで見届けて初めて意味を持つ。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "戦闘ではなく回避だけで組み立てられた、一人称視点の和風ホラーが欲しい人——ライター一つの明かりと、追ってくる能面の位置関係を読み、爆竹やテレポート鏡、あるいは度胸だけですり抜ける",
        "ランダム生成の迷路に本当の緊張感が欲しい人——マップはラン(セッション)を中断すると生成し直されるから、光る勾玉や秘密を狩り尽くすには、その一回の迷宮を最後まで見届ける覚悟が要る",
        "ソロの日本人開発者が、自らの無料版ヒット作を作り直した商業リメイクを、西側より先に掴みたい人——2,176件のレビューで好評率90%の「非常に好評」、WayTooManyGamesやReal Otaku Gamerがすでにレビュー済みながら、いまだにほとんどが日本語で語られている",
      ],
      bad: [
        "地図やミニマップに頼れるホラーが欲しい人(プレイヤーレビューによれば、そのどちらも存在せず、先の読めない行き止まりのあるランダム生成の構造そのものが本作の設計であり不備ではない)。また、無料ではない有料タイトル(米国7.99ドル、日本では820円)の正式リリース済みでアーリーアクセスではなく、AI生成アセットはなく、Steam自身のディスクリプタ上、性的な要素もない",
        "自分の言語でのフルボイスが欲しい人(フルボイスは日本語のみで、英語・韓国語・ロシア語・簡体字中国語はテキスト対応に留まる)。2,176件のレビューのうち英語はまだ73件、この作品はいまなお圧倒的に日本語の会話の中にある",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "dungeon-antiqua": {
    published: "2026-07-13",
    publishAt: "2026-07-13",
    kind: "find",
    leadIndex: 0,
    // reachState は意図的に持たせない: 英語対応済み(English/Japanese/Simplified Chinese、appdetails
    //   実測確認済み)なので "lang_walled" は rarityStamps の「英語にまだ非対応」を誤って立てる(正直さ)。
    //   英語レビュー比率約38.6%(144/373、appreviews API実測)に加え、Niche Gamer("Japanese dungeon
    //   RPG Dungeon Antiqua coming to consoles")・Automaton West("Japanese indie dev on how their
    //   game was wrongly flagged as a virus, and blocked on Steam")の実記事を直接WebFetchで実測確認
    //   済み、かつコンソール移植予定日にAMATA GamesがNintendo Switch/PlayStation 5/Xbox Series X|S
    //   へ同時コンソール移植すると自社発表済み(Niche Gamer記事本文 "Publisher Amata Games and
    //   developer Shiromofu Factory have announced console ports...on July 30th"で直接確認済み)で
    //   あるため、"unreached_west"(西未到達)は実態を誇張する(誇張しない・dungeon-antiqua-2型の判断)。
    //   obscurity は "wall"(高評価だが言語/地域の壁)で正直に表す。stamp は 91%好評 + レビュー373件
    //   のみ立てる。
    // genre は既存 "dungeon-rpg"(dungeon-antiqua-2 で使用中)を再利用: Steam自身のジャンルタグは
    //   Indie/RPG(appdetails実測確認済み)で、続編と同じ核を持つダンジョンクロール型RPG。
    // lineage は既存 anchor "wizardry-proving-grounds"(potato-flowers pick で使用中、steam app
    //   2518960)を再利用する。新規 anchor は追加しない(同一実体の二重登録を避ける・SSOT)。ストア
    //   公式short_descriptionは「inspired by the Wizardry and Final Fantasy games of the 1980s and
    //   1990s」とWizardryとFinal Fantasyを同格で明記する(appdetails実測確認済み)が、続編 Dungeon
    //   Antiqua 2(dungeon-antiqua-2 pick)が既に "final-fantasy-v" を系譜アンカーに採用済みのため、
    //   重複を避け本作(初代)は "wizardry-proving-grounds" 側を採用する。中核メカニクス——キャラクター
    //   の視界に応じて拡張する2Dマップ探索、複数職業による自由なパーティ編成——は、パーティ制ダンジョン
    //   クロールRPGを定義した Wizardry(Sir-Tech、Andrew Greenberg / Robert Woodhead設計、wikidata
    //   Q1886140実測確認済み)へ直接遡る。正直な開示: ストア文言はFF系譜を排除しておらず、本作がFF系譜
    //   でないという主張ではない。あくまでDA2との重複回避と、事実整合性に基づく選択。
    // content_descriptors は ids=[]・notes=null(API実測)。
    meta: { genre: "dungeon-rpg", lineage: "wizardry-proving-grounds", obscurity: "wall", reviewBand: "hundreds", rarity: { reviews: 373, positivePct: 91, noEnglish: false } },
    games: [
      {
        name_en: "Dungeon Antiqua",
        name_ja: "Dungeon Antiqua",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3198540/Dungeon_Antiqua/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A Super Famicom-styled 2D dungeon crawl RPG by Shiromofu Factory, the work of the Japanese solo creator frenchbread, with pixel art and chiptune sound cast in an 80s-90s mold. Per Steam's own listing, its 2D map is described as expanding 'to match the character's field of view,' so the dungeon is never handed to you all at once; a wide variety of professions plus free party formation, paired with auto-generated maps, are built to be 'played over and over again,' while progression stays focused on 'hacking and exploration, with no redundant scenarios or direction,' carried by 'fast-paced, modern and comfortable controls' that reach down to full DualShock and DualSense support. It runs on Pyxel, the Japanese retro game engine by Takashi Kitao, and even ships a 'dungeon-antiqua.pyxapp' file for handheld consoles that support it. Released October 9, 2024, it is Very Positive at 91 percent over 373 reviews (338 positive, 35 negative), a paid title at $6.99 in the US (¥800 in Japan), not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). It supports English, Japanese, and Simplified Chinese, and with 144 of its 373 reviews in English (about 38.6 percent), the West has already begun to notice it: outlets including Niche Gamer and Automaton West have covered it, and publisher AMATA Games has announced it is bringing the game to Nintendo Switch, PlayStation 5, and Xbox Series X|S on July 30, 2026, alongside its existing PC release, so calling it purely undiscovered would not be honest, even though most of its audience still reads in Japanese. It is also the game that came first: Dungeon Antiqua 2 carries this same jobs-and-dungeons formula into a 10-job sequel. One note to clear up: this Shiromofu Factory / frenchbread is a completely unrelated namesake to the fighting-game studio French-Bread (Melty Blood, UNDER NIGHT IN-BIRTH).",
        desc_ja: "スーパーファミコン風のピクセルアートとチップチューンサウンドで作られた、2Dダンジョンクロール型RPG。開発元は Shiromofu Factory——日本の個人クリエイター frenchbread（ふれんち）の手による一本だ。Steam自身のストア表記によれば、マップは「キャラクターの視界にあわせて広がる2Dマップ」——だからダンジョンの全体像が最初から見えていることはない。豊富な職業と自由なパーティ編成、自動生成マップにより「何度でも遊べるゲーム設計」を掲げ、進行は「冗長なシナリオや演出のない、ハクスラと探索に特化した」ものに徹し、操作性は「テンポが良く、現代的で快適」——DualShock・DualSenseを含むフルコントローラ対応まで届く。開発には日本製のレトロゲームエンジン Pyxel（北尾崇 作）が使われ、対応するハンドヘルド機向けに「dungeon-antiqua.pyxapp」という実行ファイルまで同梱されている。2024年10月9日リリース、373件のレビュー(好評338・不評35)で好評率91%の「非常に好評」。無料ではない有料タイトル(米国6.99ドル、日本では800円)で、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。英語・日本語・簡体字中国語に対応し、373件のうち144件(約38.6%)が英語レビュー——西はすでにこの一本に気づき始めている。Niche GamerやAutomaton WESTといった媒体がすでに取り上げ、パブリッシャーのAMATA Gamesは2026年7月30日にNintendo Switch・PlayStation 5・Xbox Series X|Sへ本作を展開すると発表済みで、既存のPC版と並んで届けられる——だから「まったくの未発見」と呼ぶのは正直ではない。それでも観客の中心は、まだ日本語圏だ。本作はまた、続編 Dungeon Antiqua 2 が同じジョブとダンジョンの設計を10ジョブへと受け継ぐ、その前作でもある。一つだけ補足を——この Shiromofu Factory / frenchbread は、格闘ゲームのスタジオ French-Bread(Melty Blood、UNDER NIGHT IN-BIRTH)とは完全に無関係の同名別者だ。",
      },
      {
        name_en: "Wizardry: Proving Grounds of the Mad Overlord",
        name_ja: "ウィザードリィ 狂王の試練場",
        status: "established",
        steam: "https://store.steampowered.com/app/2518960/Wizardry_Proving_Grounds_of_the_Mad_Overlord/",
        wikidata: "https://www.wikidata.org/wiki/Q1886140",
        tag_en: "The dungeon-crawl origin",
        tag_ja: "ダンジョンクロールの原点",
        desc_en: "The origin of this taste: Wizardry: Proving Grounds of the Mad Overlord, the first entry in Sir-Tech's Wizardry series, designed by Andrew Greenberg and Robert Woodhead and originally released for the Apple II in 1981. Steam's own listing for its faithful modern remake calls it 'the first party-based RPG video game ever released' and says it was 'a direct inspiration to series like Final Fantasy and Dragon Quest' that followed in Japan: you assemble your own multi-class party of adventurers, then descend a maze in first person one careful step at a time, mapping every trap and monster encounter by hand since none of it is shown to you in advance. That core, a freely composed party working its way, blind, through a dungeon that must be read rather than shown, is the root Dungeon Antiqua grows from: it keeps the free party composition across a wide roster of professions, but replaces the original's blank, hand-mapped maze with a 2D map that automatically expands to match your own line of sight as you explore. The 1981 original is anchored here to Digital Eclipse's remake, built, in Steam's own words, 'directly on top of the original 1981 game's code.'",
        desc_ja: "この味の原点——Wizardry: Proving Grounds of the Mad Overlord(ウィザードリィ 狂王の試練場)。Sir-Tech の Wizardry シリーズ第1作で、Andrew Greenberg と Robert Woodhead が設計し、1981年にApple II向けに発売された。忠実な現代リメイク版のSteam自身の表記によれば、本作は「パーティー制を導入した世界初のRPG」であり、「後の国産RPGにも多大なる影響を与えました」——プレイヤーは複数クラスからなる自分だけの冒険者パーティを編成し、罠もモンスターの遭遇もあらかじめ何一つ示されない一人称視点の迷宮を、自分の手で地図を描きながら一歩ずつ慎重に降りていく。自由に編成したパーティが、何も見せてもらえないまま迷宮を手探りで進んでいく——この核こそ、Dungeon Antiqua が育つ根だ。本作は複数職業による自由なパーティ編成をそのまま受け継ぎながら、原作が求めた「白紙から自分で地図を描く」迷宮を、キャラクターの視界に応じて自動的に広がっていく2Dマップへと置き換えている。1981年の原作は、Steam自身の表記で「1981年のオリジナル版のプログラムを流用して作られています」とするDigital Eclipseによるリメイク版で同定する。",
      },
    ],
    en: {
      title: "Dungeon Antiqua - a Super Famicom-style 2D dungeon crawl RPG whose map only expands as far as your own line of sight, free party composition across a wide roster of professions in procedurally generated dungeons, an heir to Wizardry's original party-based dungeon crawl, Very Positive at 91 percent over 373 reviews as it heads to Switch, PS5, and Xbox this July",
      description: "A Super Famicom-styled 2D dungeon crawl RPG by Shiromofu Factory, the solo creator frenchbread. Its 2D map expands only as far as your character's own line of sight, and free party composition across a wide roster of professions plus auto-generated maps keep exploring and building your characters center stage, with no padded story. Very Positive at 91 percent over 373 reviews; only about 38.6 percent are English, though a console port lands on July 30, 2026.",
      h1a: "You are not given the dungeon's map. ",
      h1flip: "it only grows as far as your own line of sight has actually walked",
      h1b: ".",
      lede: "A Super Famicom-styled 2D dungeon crawl RPG by Shiromofu Factory, the work of the Japanese solo creator frenchbread, with pixel art and chiptune sound cast in an 80s-90s mold. Per Steam's own listing, the 2D map is described as expanding 'to match the character's field of view,' so the dungeon is never handed to you all at once, and a wide variety of professions plus free party formation, paired with auto-generated maps, are built to be 'played over and over again'; progression stays focused on 'hacking and exploration, with no redundant scenarios or direction,' carried by 'fast-paced, modern and comfortable controls' that reach down to full DualShock and DualSense support. It runs on Pyxel, the Japanese retro game engine by Takashi Kitao, and even ships a 'dungeon-antiqua.pyxapp' file for handheld consoles that support it. Released October 9, 2024, it is Very Positive at 91 percent over 373 reviews (338 positive, 35 negative), a paid title at $6.99 in the US (¥800 in Japan), not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). It supports English, Japanese, and Simplified Chinese, and with 144 of its 373 reviews in English (about 38.6 percent), the West has already begun to notice it: outlets including Niche Gamer and Automaton West have covered it, and publisher AMATA Games has announced it is bringing the game to Nintendo Switch, PlayStation 5, and Xbox Series X|S on July 30, 2026, alongside its existing PC release, so calling it purely undiscovered would not be honest, even though most of its audience still reads in Japanese. It is also the game that came before Dungeon Antiqua 2, which carries this same jobs-and-dungeons formula into a 10-job sequel.",
      s1: "First, the one feeling",
      feeling: [
        "Per Steam's own listing, the map is only described as expanding 'to match the character's field of view,' so you are never handed the dungeon's shape in advance; every corridor you have not physically walked into is still blank, and reading how far you can safely push forward becomes the entire rhythm of exploring.",
        "A wide roster of professions and free party formation sit on top of auto-generated dungeons, so the party you would bring into one crawl can look nothing like the one you would want for the next regenerated layout, turning composition into a puzzle you keep re-solving rather than settling once.",
        "Steam's own text is explicit that progression stays on 'hacking and exploration, with no redundant scenarios or direction,' and that same focus, carried by 'fast-paced, modern and comfortable controls' down to full DualShock and DualSense support plus a Pyxel handheld export, turns an 80s-90s dungeon crawl into something you can pick up, push through, and finish without a script standing between you and the maze.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You want a 2D dungeon crawl where the map itself withholds information, revealing only what your character can actually see, layered on top of procedurally generated dungeons that keep every run different",
        "You want free party composition across a wide roster of professions, replayed through auto-generated maps, in a game built to stay focused on exploring and growing your characters rather than carrying you through a long, scripted story",
        "You want to catch a Japanese solo-made Very Positive gem, 91 percent over 373 reviews, right as the West starts to notice it: already covered by outlets including Niche Gamer and Automaton West, with publisher AMATA Games bringing it to Switch, PS5, and Xbox Series X|S on July 30, 2026, and it is also the predecessor to the newer, further-along Dungeon Antiqua 2",
      ],
      bad: [
        "You want a huge, modern, fully 3D RPG or a long, heavily scripted story; this is a deliberately retro, Super Famicom-style 2D dungeon crawl built around hacking and exploration with, per Steam's own words, no redundant scenarios, a paid title at $6.99 (¥800 in Japan), not free and not in Early Access, with no AI-generated assets and nothing sexual by Steam's own descriptors",
        "You expect a big-studio blockbuster, or you are looking for the fighting-game studio French-Bread of Melty Blood and UNDER NIGHT IN-BIRTH; this is a completely unrelated namesake solo doujin developer, and even with a console launch approaching, only about 38.6 percent of its 373 reviews are in English so far",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "Dungeon Antiqua - キャラクターの視界にあわせてしか広がらない2Dマップを、豊富な職業による自由なパーティ編成と自動生成ダンジョンで踏破するスーパーファミコン風ダンジョンクロールRPG。パーティ制ダンジョンクロールの原点Wizardryの系譜。373件のレビューで好評率91%の「非常に好評」、この7月末にはSwitch・PS5・Xboxへも展開",
      description: "Shiromofu Factory(個人クリエイター frenchbread)による、スーパーファミコン風の2DダンジョンクロールRPG。マップはキャラクターの視界にあわせてしか広がらず、豊富な職業による自由なパーティ編成と自動生成マップが、冗長なシナリオを排した探索と育成を主役に据える。373件のレビューで好評率91%の「非常に好評」、英語レビューは約38.6%に留まるが、2026年7月30日にはコンソール版も展開される。",
      h1a: "ダンジョンの地図は、最初から渡されない。",
      h1flip: "自分の視界が実際に歩いた分だけ、そのマップは広がっていく",
      h1b: "。",
      lede: "日本の個人クリエイター frenchbread(ふれんち)が手がける Shiromofu Factory による、スーパーファミコン風のピクセルアートとチップチューンサウンドの2DダンジョンクロールRPG。Steam自身のストア表記によれば、マップは「キャラクターの視界にあわせて広がる2Dマップ」——だからダンジョンの全体像が最初から見えていることはない。豊富な職業と自由なパーティ編成、自動生成マップにより「何度でも遊べるゲーム設計」を掲げ、進行は「冗長なシナリオや演出のない、ハクスラと探索に特化した」ものに徹し、操作性は「テンポが良く、現代的で快適」——DualShock・DualSenseを含むフルコントローラ対応まで届く。開発には日本製のレトロゲームエンジン Pyxel(北尾崇 作)が使われ、対応するハンドヘルド機向けに「dungeon-antiqua.pyxapp」という実行ファイルまで同梱されている。2024年10月9日リリース、373件のレビュー(好評338・不評35)で好評率91%の「非常に好評」。無料ではない有料タイトル(米国6.99ドル、日本では800円)で、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。英語・日本語・簡体字中国語に対応し、373件のうち144件(約38.6%)が英語レビュー——西はすでにこの一本に気づき始めている。Niche GamerやAutomaton WESTといった媒体がすでに取り上げ、パブリッシャーのAMATA Gamesは2026年7月30日にNintendo Switch・PlayStation 5・Xbox Series X|Sへ本作を展開すると発表済みで、既存のPC版と並んで届けられる——だから「まったくの未発見」と呼ぶのは正直ではない。それでも観客の中心は、まだ日本語圏だ。本作はまた、続編 Dungeon Antiqua 2 が同じジョブとダンジョンの設計を10ジョブへと受け継ぐ、その前作でもある。",
      s1: "まず、その一点の感覚",
      feeling: [
        "Steam自身のストア表記どおり、マップは「キャラクターの視界にあわせて広がる」だけだ——だからダンジョンの形は前もって渡されない。まだ自分の足で踏み入れていない通路は、いつまでも白紙のまま。どこまでなら踏み込んで安全かを読むこと、それ自体が探索のリズムのすべてになる。",
        "豊富な職業と自由なパーティ編成が、自動生成されるダンジョンの上に乗っている。だから、ある一回の探索に連れていった編成は、次に生成されるレイアウトにはまるで合わないこともある——パーティ編成は一度決めて終わりではなく、何度でも解き直すパズルになる。",
        "Steam自身の表記は、進行を「冗長なシナリオや演出のない、ハクスラと探索に特化した」ものだと明言している。その同じ焦点が、DualShock・DualSenseを含むフルコントローラ対応まで届く「テンポが良く、現代的で快適な」操作性と、Pyxelによるハンドヘルド書き出しに支えられ、80〜90年代のダンジョンクロールを、台本に立ち止まらされることなく、手に取ってそのまま遊び切れる一本に変えている。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "自分が実際に見た分しか描かれない2Dマップで組み立てられたダンジョンクロールが欲しい人——それがプロシージャル生成のダンジョンの上に乗っていて、毎回の探索が違う顔を見せる",
        "豊富な職業から自由にパーティを編成し、自動生成マップで何度でも遊び直したい人——長い台本に付き合わされるのではなく、探索とキャラクター育成そのものを主役に据えたゲーム設計",
        "西側がようやく気づき始めた、日本の個人制作の「非常に好評」タイトル(373件のレビューで好評率91%)を掴みたい人——Niche GamerやAutomaton WESTがすでに取り上げ、パブリッシャーのAMATA Gamesが2026年7月30日にSwitch・PS5・Xbox Series X|Sへ展開予定。より西に近づいた続編 Dungeon Antiqua 2 の前作でもある",
      ],
      bad: [
        "大規模で現代的な、フル3DのRPGや長い台本を期待する人(本作はあえてレトロな、スーパーファミコン風の2Dダンジョンクロールで、Steam自身の表記どおり冗長なシナリオは無い。無料ではない有料タイトル(米国6.99ドル、日本では800円)の正式リリース済みでアーリーアクセスではなく、AI生成アセットはなく、Steam自身のディスクリプタ上、性的な要素もない)",
        "大手スタジオの大作を期待する人、あるいは Melty Blood や UNDER NIGHT IN-BIRTH の格闘ゲームスタジオ French-Bread を探している人(本作はそれとは完全に無関係の同名の個人同人開発者で、コンソール展開が近づいてもなお、373件のレビューのうち英語は約38.6%に留まる)",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "parasocial": {
    published: "2026-07-13",
    publishAt: "2026-07-13",
    kind: "find",
    leadIndex: 0,
    // 正直さ・西到達の誇張禁止(motionrec型の判断): 英語レビューは852/1,675=約50.9%とすでに過半数に
    //   達しており(Steam appreviews API実測、english/all両方確認済み)、GamesRadar+の単独レビュー
    //   (見出し"The scariest game I've played all year")・Dualshockers・Gayming Magazine・
    //   Tokyo Weekenderのスタジオ特集・TV Tropesページ・登録者数の大きい英語圏実況者による複数の
    //   Let's Playが確認できる。ゆえに rarity/reviewBand/reachState は一切持たせない:
    //   これらを立てると PickPage が「西側がまだほとんど見つけていない」を無条件で後置し、過半数が
    //   英語という実測と矛盾する誇張になる(motionrec pickの先例と同型判断)。obscurity も
    //   "deep"/"wall"はいずれも西未到達を含意するため none とする(正直さ)。好評率94%(1,574/1,675、
    //   101件が不評)・英語比率50.9%は本文(散文)で正直に述べる。
    // genre は新設 "livestream-horror"(配信ホラー): 既存の "exploration-horror"/"psychological-horror"
    //   では捉えきれない、本作を定義する核——Steam自身の公式スクリーンショット(ストア掲載の一次資産、
    //   直接確認済み)が示す、VTuber「千羅ニナ」のデュアルモニタ配信卓、実際に流れるライブチャット、
    //   HEALTH/DANGERゲージ・視聴者数・高評価/低評価ボタン付きの「配信中のゲーム画面」という三層構造
    //   ——を専用ラベルとして立てる(hand-me-down-mecha-fps等と同型の細粒度ラベル追加・ui.ts en/ja
    //   追加済み)。Steam自身のジャンルタグはIndieのみ(appdetails実測確認済み・専用ホラータグは無い)。
    // 系譜は Perfect Blue(パーフェクトブルー、今敏監督、マッドハウス制作、1997年)——アイドルが
    //   女優に転身し熱狂的なファンに付け纏われ、現実と虚構の境界が溶け崩れていく「メディア×ストーカー
    //   恐怖」の日本的原型を、新規anchor "perfect-blue" として採用する(lineage_anchor_key=wikidata_qid、
    //   Q1205051。Wikidata実測: 監督Q333643=Satoshi Kon、制作会社Q650867=Madhouse。Wikipedia要約
    //   実測で原作/主演も確認済み)。この帰属は開発者本人の言明ではなく批評記事による主題比較のため
    //   自信度: 中(捏造しない・imscared/chikyu-boueigun型の判断)。公式Steam版が無い1997年の映画の
    //   ため、established側の games[] で wikidata + homepage(Wikipedia)を併記しhref破損を防ぐ
    //   (picks側の責務・gradius/mother-3型)。
    // content_descriptors は ids=[]・notes=null(API実測、en/ja両ロケール一致)。is_early_access=false・
    //   is_free=false(appdetails実測確認済み)。
    meta: { genre: "livestream-horror", lineage: "perfect-blue", obscurity: "none" },
    games: [
      {
        name_en: "[Chilla's Art] Parasocial | パラソーシャル",
        name_ja: "[Chilla's Art] Parasocial | パラソーシャル",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2314720/Chillas_Art_Parasocial__/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A first-person Japanese horror game that Steam's own listing describes simply as being 'about a live streamer,' built around a VHS-and-CRT-emulated visual filter (phosphor screen-trail bleed, tape noise, interlacing, jitter) that can be switched off in the options menu, wrapped around what Steam's own bullet points literally label 'Psychological horror,' text that in the Japanese-language store page says the game is built to make you feel like someone is standing behind you. Steam's own screenshots show the shape of that hook: you play as a small-scale VTuber, 千羅ニナ (Sennra Niina, her name printed on a poster over her own desk), running a dual-monitor streaming setup with a ring-light webcam, while a live chat scrolls real viewer messages beside a stream window that carries its own HEALTH and DANGER meters, a view count, and like/dislike buttons, as she plays a horror game inside this horror game (one screenshot frames a segment built around the Japanese urban legend Aka Manto). Outside that stream window you also move through her ordinary life in first person: checking a phone's messaging app (contacts include her mother, a friend, and, as a wink at its own maker, an entry literally named 'Chilla's Café'), wandering an apartment stacked with unopened moving boxes at night, or stepping into a convenience store where a faceless clerk in a black suit browses a magazine rack. Beyond what Steam's own store text says, fan wikis and walkthroughs (not the official store description) describe the plot that frames all of this: a viewer account pushes Sennra Niina toward going face-cam, and what began as a parasocial relationship curdles into stalking, branching across multiple endings depending on your choices. Developed and self-published by Chilla's Art, a small Japan-based studio with no external publisher, released August 25, 2023, it is Very Positive at 94 percent over 1,675 reviews (1,574 positive, 101 negative per Steam's own review API), a paid title at $7.99 in the US (¥920 in Japan), not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). It supports thirteen languages including English, Japanese (with full voiced audio), Korean, Simplified and Traditional Chinese, Vietnamese, and more, and its reach into the West is already real, not merely beginning: 852 of its 1,675 reviews, about 50.9 percent, are already in English, GamesRadar+ gave it a standalone review under the headline 'The scariest game I've played all year,' and outlets including Dualshockers, Gayming Magazine, and Tokyo Weekender, plus a TV Tropes page and sizable English-language Let's Plays, have all covered it, so calling this an undiscovered gem the West hasn't found would not be honest. What is true is that it remains a small, self-published horror short next to the site's usual buried-and-silent finds.",
        desc_ja: "Steam自身のストア表記が「ライブ配信者を題材にしたジャパニーズホラーゲーム」とだけ説明する一人称ホラー。VHSエフェクト・CRT画面のエミュレーション(蛍光体スクリーントレイル、VHSテープノイズ、インターレース、ジッター)はオプションメニューでオフにでき、Steam自身が公式の特徴として掲げる「心理的ホラー」――日本語版ストア文言では「ゲームプレイ時に後ろに誰かがいるような気持ちを抱かせます」――を核に据える。Steam自身の公式スクリーンショットは、その仕掛けの姿をそのまま映し出す――プレイヤーが操るのは小規模VTuber「千羅ニナ」(本人の配信卓に掲げたポスターに名前がある)。リングライト付きウェブカメラを備えたデュアルモニタの配信環境で、実際に流れるライブチャットの隣には、HEALTH・DANGERゲージ、視聴者数、高評価/低評価ボタンを備えた「配信中のゲーム画面」があり、その中でさらに別のホラーゲームをプレイしている(あるスクリーンショットは日本の都市伝説「赤マント」を題材にした一場面を映す)。配信画面の外でも、彼女の日常を一人称で歩く――スマートフォンのメッセージアプリを確認したり(連絡先には母親、友人、そして開発元自身への軽い自己言及である「チラズカフェ」という一件が含まれる)、夜、開封していない引っ越し用の段ボール箱が積まれたアパートを歩き回ったり、黒いスーツ姿の顔のない店員が雑誌棚を眺めるコンビニに足を踏み入れたりする。Steam自身のストア文言を超える範囲――ファンによるWikiや攻略記事(公式のストア説明文そのものではない)は、これら全体を縁取る筋書きとして、ある視聴者アカウントが千羅ニナに顔出し配信を迫り、パラソーシャルな関係として始まったものがストーキングへと変質し、選択次第で複数のエンディングへ分岐していく、と記している。開発・自社セルフパブリッシュ(外部パブリッシャーなし)は日本拠点の小規模スタジオ Chilla's Art、2023年8月25日リリース。1,675件のレビュー(Steam自身のレビューAPIでは1,574件が好評・101件が不評)で好評率94%の「非常に好評」。無料ではない有料タイトル(米国7.99ドル、日本では920円)で、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。英語、日本語(フル音声吹替)、韓国語、簡体字・繁体字中国語、ベトナム語など13言語に対応し、西側への到達はすでに「始まったばかり」ではなく現実のものだ――1,675件のレビューのうち852件、約50.9%がすでに英語で、GamesRadar+は「The scariest game I've played all year」という見出しで単独レビューを掲載し、Dualshockers・Gayming Magazine・Tokyo Weekenderといったメディアに加えTV Tropesのページ、登録者数の大きい英語圏実況者による複数のプレイ動画もすでに存在する――だから「西側がまだ見つけていない一本」と呼ぶのは正直ではない。本当なのは、このサイトが普段扱う「埋もれて静かなままの発掘」と比べれば、これは今も小規模な自社パブリッシュのホラー短編だということだ。",
      },
      {
        name_en: "Perfect Blue",
        name_ja: "パーフェクトブルー",
        status: "established",
        wikidata: "https://www.wikidata.org/wiki/Q1205051",
        homepage: "https://en.wikipedia.org/wiki/Perfect_Blue",
        tag_en: "The origin",
        tag_ja: "原点",
        desc_en: "The origin of this taste: Perfect Blue, a 1997 Japanese animated psychological horror film directed by Satoshi Kon and produced by Madhouse, loosely based on the novel by Yoshikazu Takeuchi. A member of a Japanese idol group retires from singing to become an actress, and is stalked by an obsessive fan as gruesome murders begin and the line between her real life and the role she performs starts to dissolve; it crystallized a distinctly Japanese strand of horror in which an entertainer's own audience stops watching from a distance and reaches into her actual life. Parasocial is not an official Perfect Blue work, and this lineage is a comparison drawn in outside critical commentary, not a stated influence from developer Chilla's Art, but it carries the same theme forward into a new frame: a small-scale VTuber livestreaming to a real, scrolling chat, whose audience's attention curdles into stalking once, per fan wikis and walkthroughs, a viewer pushes her toward showing her actual face. There is no Steam release of this 1997 film, so its origin here is anchored to its Wikidata entry.",
        desc_ja: "この味の原点――パーフェクトブルー。今敏監督、マッドハウス制作による1997年の日本のアニメーション心理サスペンス映画で、竹内義和の同名小説を原案としている。あるアイドルグループのメンバーが歌手活動を引退して女優に転身するが、熱狂的なファンに付け纏われるようになり、凄惨な殺人事件が起こり始め、現実の彼女と演じる役柄との境界が溶け崩れていく――「エンターテイナーを見つめる観客が、遠くから眺めるだけでは止まらず、その実生活そのものへ手を伸ばし始める」という、日本的なホラーの一系統を結晶化させた作品だ。Parasocial は公式のパーフェクトブルー作品ではなく、この系譜は開発元Chilla's Artが明言した影響ではなく外部の批評による比較だが、同じテーマを新しい枠組みへと引き継いでいる――小規模なVTuberが実際に流れるライブチャットに向けて配信し、その観客の関心が、ファンWikiや攻略記事によれば、ある視聴者が顔出しを迫ることをきっかけにストーキングへと変わっていく。1997年のこの映画にSteam版は存在しないため、その原点はここではWikidataのエントリで同定する。",
      },
    ],
    en: {
      title: "Parasocial - a first-person Japanese horror game about a small-scale VTuber whose stream chat, HEALTH/DANGER-metered game-within-a-game, and a viewer's escalating attention all bleed into her own apartment, made and self-published by Chilla's Art, Very Positive at 94 percent over 1,675 reviews with English readers already at 50.9 percent",
      description: "A first-person Japanese horror game about a VTuber livestreamer, built around a VHS/CRT visual filter and a psychological horror hook Steam's own text says is meant to make you feel like someone is behind you. Made and self-published by the small Japan-based studio Chilla's Art. Very Positive at 94 percent over 1,675 reviews, with English readers already close to half at 50.9 percent and press coverage from outlets like GamesRadar+ already in place.",
      h1a: "You go live, the chat starts scrolling, and whatever is hunting you on screen ",
      h1flip: "turns out not to be the only one who has been watching you play",
      h1b: ".",
      lede: "A first-person Japanese horror game developed and self-published by Chilla's Art, a small Japan-based studio with no external publisher, released August 25, 2023. Steam's own listing describes it simply as being 'about a live streamer,' and Steam's own screenshots show what that means: you play a small-scale VTuber, 千羅ニナ (Sennra Niina, her name printed on a poster above her own desk), sitting at a dual-monitor rig with a ring-light webcam, a live chat scrolling real viewer messages beside a stream window that carries its own HEALTH and DANGER meters, view count, and like/dislike buttons, while she plays a horror game inside this horror game. Outside that stream window, you carry an ordinary phone into an ordinary apartment stacked with moving boxes and an ordinary convenience store with a faceless clerk in a suit, so the dread is not sealed inside the frame Steam's screenshots show; per fan wikis and walkthroughs, not the official store text, it is a single viewer's escalating attention, pushing Sennra Niina toward showing her face on camera, that walks out of the chat and into that same apartment, branching across multiple endings. The VHS-and-CRT visual filter can be switched off entirely in the options menu, and Steam's own words call the core hook 'Psychological horror,' text that in the Japanese store page says the game is built to make you feel like someone is standing behind you. It is Very Positive at 94 percent over 1,675 reviews (1,574 positive, 101 negative per Steam's own review API), a paid title at $7.99 in the US (¥920 in Japan), not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). And it is only honest to say the West has already arrived, not merely started to notice: 852 of its 1,675 reviews, about 50.9 percent, are already in English, GamesRadar+ reviewed it under the headline 'The scariest game I've played all year,' and Dualshockers, Gayming Magazine, Tokyo Weekender, and a TV Tropes page have all covered it. This is not a gem the West hasn't found; it is a small, self-published horror short that the West has already partly found.",
      s1: "First, the one feeling",
      feeling: [
        "Steam's own screenshots put a HEALTH and DANGER meter, a view count, and a scrolling live chat directly onto the horror game you are playing inside the game, so a single glance has to do triple duty: read the threat in front of you, read how many strangers are currently watching you fail at it, and read what they are typing about it, all before you decide your next move.",
        "The VHS-and-CRT filter, screen-trail bleed, tape noise, interlacing, jitter, is entirely optional per the options menu, so the unease Steam's own text promises, built 'to make you feel like someone is behind you,' is designed to survive with the filter switched off entirely; the dread sits in what the game shows you, not just in how grainy the picture looks while it shows it.",
        "Between livestream segments you carry an ordinary phone into an ordinary apartment stacked with unopened moving boxes and an ordinary convenience store with a faceless clerk in a suit, so the horror is not sealed inside the stream window Steam's own screenshots frame; per fan wikis and walkthroughs, it is a single viewer's escalating attention that walks out of the chat and into that same apartment.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You want first-person horror built specifically around the mechanics of livestreaming itself: a VTuber avatar, a scrolling live chat, and a HEALTH/DANGER-metered game-within-the-game, all rendered exactly as Steam's own screenshots show them, rather than a generic haunted-house walk",
        "You want VHS/CRT-styled psychological horror that Steam's own text frames as built to make you feel watched, from a small Japan-based studio, Chilla's Art, that develops and self-publishes without an external publisher",
        "You want to catch a Very Positive horror short (94 percent over 1,675 reviews) while its Western audience is still forming rather than already saturated: 852 of those reviews, about 50.9 percent, are already in English, and outlets like GamesRadar+ have already reviewed it, so you are not first, but you are still early",
      ],
      bad: [
        "You want the site's usual completely undiscovered pick; with English reviews already at 50.9 percent and press coverage from GamesRadar+, Dualshockers, Gayming Magazine, and Tokyo Weekender already in place, calling this unreached by the West would not be honest, even though it remains a small, self-published horror short rather than a big-studio production",
        "You want a long game, or you want a violent or sexual one; it is a paid, fully launched title at $7.99 (¥920 in Japan), not free and not in Early Access, structured into short, autosaved chapters, and by Steam's own content descriptors it carries nothing sexual (ids: none, notes: none), with the psychological unease being the entire point rather than a side effect",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "パラソーシャル - VTuberの配信卓、実際に流れるライブチャット、HEALTH/DANGERゲージ付きの配信中ゲーム画面、視聴者の付き纏いが彼女自身のアパートまで侵食してくる一人称ジャパニーズホラー。開発・自社パブリッシュはChilla's Art。1,675件のレビューで好評率94%の「非常に好評」、英語レビューはすでに50.9%",
      description: "VTuberのライブ配信者を題材にした一人称ジャパニーズホラー。VHS/CRTの映像フィルターと、Steam自身が「後ろに誰かがいるような気持ちを抱かせる」と説明する心理的ホラーを核に据える。開発・自社セルフパブリッシュは日本拠点の小規模スタジオChilla's Art。1,675件のレビューで好評率94%の「非常に好評」、英語レビューはすでに50.9%と半数近くに達し、GamesRadar+など西側メディアの取材もすでに存在する。",
      h1a: "配信が始まり、チャットが流れ出す——だが画面の中であなたを追ってくるその何かは、",
      h1flip: "あなたのプレイを見ている唯一の目ではないかもしれない",
      h1b: "。",
      lede: "開発・自社セルフパブリッシュ(外部パブリッシャーなし)は日本拠点の小規模スタジオ Chilla's Art による一人称ジャパニーズホラーで、2023年8月25日にリリースされた。Steam自身のストア表記は「ライブ配信者を題材にしたジャパニーズホラーゲーム」とだけ説明するが、Steam自身の公式スクリーンショットはその意味をそのまま見せる――プレイヤーが操るのは小規模VTuber「千羅ニナ」(本人の配信卓に掲げたポスターに名前がある)。リングライト付きウェブカメラを備えたデュアルモニタの配信環境に座り、隣では実際に流れるライブチャットが視聴者のメッセージを映し、HEALTH・DANGERゲージ、視聴者数、高評価/低評価ボタンを備えた「配信中のゲーム画面」の中で、彼女はさらに別のホラーゲームをプレイしている。配信画面の外では、ごく普通のスマートフォンを手に、開封していない段ボール箱が積まれたごく普通のアパートを、そして顔のない店員がいるごく普通のコンビニを歩く――だから恐怖は、Steamのスクリーンショットが縁取るその画面の中だけに閉じてはいない。公式のストア文言ではなく、ファンによるWikiや攻略記事によれば、それはある視聴者の付き纏いが顔出し配信を迫るところから始まり、チャットの中からその同じアパートの中まで歩み出て、選択次第で複数のエンディングへ分岐していく。VHS/CRTの映像フィルターはオプションメニューで完全にオフにでき、Steam自身の言葉が核として掲げる「心理的ホラー」――日本語版ストア文言では「ゲームプレイ時に後ろに誰かがいるような気持ちを抱かせます」――として設計されている。1,675件のレビュー(Steam自身のレビューAPIでは1,574件が好評・101件が不評)で好評率94%の「非常に好評」。無料ではない有料タイトル(米国7.99ドル、日本では920円)で、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。そして正直に言えば、西側はすでに「気づき始めた」段階を超えている――1,675件のレビューのうち852件、約50.9%がすでに英語で、GamesRadar+は「The scariest game I've played all year」という見出しでレビューを掲載し、Dualshockers・Gayming Magazine・Tokyo Weekenderといったメディア、そしてTV Tropesのページもすでに本作を取り上げている。これは「西側がまだ見つけていない原石」ではない。西側がすでに一部見つけている、小規模な自社パブリッシュのホラー短編だ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "Steam自身の公式スクリーンショットは、HEALTH・DANGERゲージ、視聴者数、そして実際に流れるライブチャットを、プレイ中のゲーム画面へじかに重ねて見せる――だから一目で三つのことを同時に読まなければならない。目の前の脅威、いま自分の失敗を見ている見知らぬ視聴者の数、そして彼らがそれについて何を打ち込んでいるか。次の一手を決める前に、そのすべてを読む必要がある。",
        "VHS/CRTの映像フィルター――蛍光体のスクリーントレイル、テープノイズ、インターレース、ジッター――はオプションメニューで完全にオフにできる。だからSteam自身の言葉が約束する不穏さ、「後ろに誰かがいるような気持ちを抱かせる」設計は、フィルターを切った状態でも成立するように作られている。恐怖はザラついた映像の見た目そのものではなく、その映像が何を見せているかの側にある。",
        "配信のあいだの合間には、ごく普通のスマートフォンを手に、開封していない段ボール箱が積まれたごく普通のアパートを、顔のない店員がいるごく普通のコンビニを歩く。だから恐怖は、Steamの公式スクリーンショットが縁取る配信画面の中だけに閉じてはいない。ファンによるWikiや攻略記事によれば、それはある視聴者の付き纏いがチャットの中から歩み出て、その同じアパートの中まで入り込んでくることそのものだ。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "配信という仕組みそのものを核に据えた一人称ホラーが欲しい人――VTuberのアバター、実際に流れるライブチャット、HEALTH/DANGERゲージ付きの配信中ゲーム画面を、Steam自身の公式スクリーンショットどおりそのまま体験する。ありふれた「幽霊屋敷探索」ではない",
        "「後ろに誰かがいる」ことを狙って作られたと本人が明言するVHS/CRT風の心理的ホラーが欲しい人――開発・自社セルフパブリッシュ(外部パブリッシャーなし)は日本拠点の小規模スタジオChilla's Art",
        "西側の観客がまだ形成されつつある段階の「非常に好評」タイトル(1,675件のレビューで好評率94%)を掴みたい人――そのうち852件、約50.9%はすでに英語で、GamesRadar+などがすでにレビュー済み。一番乗りではないが、まだ早い段階ではある",
      ],
      bad: [
        "このサイトがいつも扱うような「完全な未発見」を期待する人――英語レビューがすでに50.9%に達し、GamesRadar+・Dualshockers・Gayming Magazine・Tokyo Weekenderの取材もすでに存在する以上、「西側がまだ見つけていない」と呼ぶのは正直ではない。それでも本作は大手スタジオの作品ではなく、小規模な自社パブリッシュのホラー短編であることに変わりはない",
        "長時間のゲームや、暴力的・性的な内容が欲しい人――無料ではない有料タイトル(米国7.99ドル、日本では920円)の正式リリース済みでアーリーアクセスではなく、短いチャプターごとのオートセーブ構成。Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素はなく、心理的な不穏さそのものが狙いであって副産物ではない",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "enjoy-the-diner": {
    published: "2026-07-14",
    publishAt: "2026-07-14",
    kind: "find",
    leadIndex: 0,
    // genre は新設 "diner-mystery-adv"(ファミレスミステリーADV): 既存の "loop-mystery-adv"(周回前提の
    //   短時間マルチエンド構造・aiai-kissaten で使用中)や "riddle-adventure"(キーワード探索型の謎解き)
    //   では捉えきれない、本作を定義する核——一度も閉まらない永遠のファミレス「ムーンパレス」という単一の
    //   場に留まり続け、コマンド選択式+軽いポイント&クリックで常連客と会話しながら「なぜここから出られ
    //   ないのか」を解き明かしていく構造(Steam appdetails実測: ジャンルタグはAdventureのみ)——を専用
    //   ラベルとして立てる(livestream-horror/loop-mystery-adv と同型の細粒度ラベル追加・ui.ts en/ja
    //   追加済み)。
    // 系譜は開発者本人による自己参照: itch.ioで無料公開された同名の原型『ファミレスを享受せよ』(制作
    //   月刊湿地帯、ハンドル名 oissisui、Godotエンジン)を新規 anchor "moonpalace" として採用する
    //   (lineage_anchor_key=itch.io_url, https://oissisui.itch.io/moonpalace。直接WebFetchで200応答・
    //   タイトル/本文/schema.org AggregateRatingを実測確認済み)。Steam版は Studio Dragonet(せきやdn、
    //   福岡拠点)がUnityで一から再構築した全面リメイクで(appdetails about_the_game実測: "This game has
    //   been ported from Godot to Unity, meaning it's been completely remade")、kageroh(影廊)型の
    //   自己参照origin判断と同型。公式Steam版・Wikidata QIDを持たない itch.io限定の無料版のため、
    //   established側は itchio のみを積む(fish-in-the-bottle pick の freem-only established と同型・
    //   href破損なし)。
    // obscurity は "deep" + reachState "unreached_west": 英語レビュー比率は約10.5%(118/1,125、appreviews
    //   API実測)で、Steamコミュニティの英語レビューやBackloggd掲載は存在し完全未到達ではないが、Kotaku/
    //   PC Gamer/RPS等の西側主要メディアの掲載は確認できず、批評家レビューはIGN Japanの1件(スコア80)
    //   のみで日本語メディア中心(dungeon-antiqua型の閾値判断: 英語比率38.6%+西側メディア複数実績+
    //   コンソール移植発表があった同作は reachState を持たせなかったが、本作はそれより英語比率が低く
    //   西側メディア実績も確認できないため unreached_west を正直に立てる)。noEnglish は false(appdetails
    //   実測: 英語テキスト対応済み。ただし全言語ともテキストのみでフルボイス無し・player reviews実測)。
    // reviewBand は "around_1k"(1,125件は数百でも数千でもない約千のスケール、after-burner/single-turn-
    //   deckbuilder 等と同スケール)。
    // content_descriptors は ids=[]・notes=null(appdetails実測、EN/JA両ロケール一致)。is_early_access=
    //   false・is_free=false(appdetails実測確認済み)。好評率は appreviews API実測(1,125件・positive
    //   1,093・negative 32・97.16%)を正とし、review_score=9="Overwhelmingly Positive"(Steam自身の
    //   スコア区分)を採用する。
    meta: { genre: "diner-mystery-adv", lineage: "moonpalace", obscurity: "deep", reviewBand: "around_1k", reachState: "unreached_west", rarity: { reviews: 1125, positivePct: 97, noEnglish: false } },
    games: [
      {
        name_en: "Enjoy the Diner",
        name_ja: "ファミレスを享受せよ",
        status: "hidden",
        steam: "https://store.steampowered.com/app/2336980/Enjoy_the_Diner/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "Steam's own text frames it with a wink: \"Why not enjoy the diner? The moon is as full as it'll ever be, and there's even a drink fountain.\" Its own about_the_game text describes Enjoy the Diner as following \"a multiple-choice format with point-and-click elements,\" a relatively short adventure that \"typically takes 2-2.5 hours to complete,\" branching into one of two endings and telling players outright to save before what it calls your \"fateful decision.\" Per Steam player reviews, the setting itself carries the hook: one calls Moon Palace an \"extradimensional diner,\" another spends the runtime \"uncovering the mystery of who the people at the moon palace are and why they're here,\" and a third describes a tone that starts out \"grounded\" before it \"snowballs into showing you how absurd you were to think that.\" It began life as a free browser game: built in the Godot engine and released for free on itch.io by 月刊湿地帯 (Gekkan Shicchitai), a two-person Japanese doujin circle working under the handle oissisui, whose own itch.io page still links straight through to this Steam edition. For Steam, it was rebuilt from the ground up in Unity by Studio Dragonet, the one-person Fukuoka studio of せきやdn, adding, per Steam's own listing, new customer chit-chat, a Sound Gallery, an Illustration Gallery, full controller support, and Steam Achievements (nine of them, including one for trying every drink at the soda fountain) on top of the free original, and published by Waku Waku Games (わくわくゲームズ合同会社), a small Tokyo-based indie publisher with ¥1.5 million in capital. Released July 31, 2023, it is Overwhelmingly Positive at 97 percent over 1,125 reviews (1,093 positive, 32 negative per Steam's own review API), a paid title at $10.99 in the US (¥1,500 in Japan), not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). It supports Japanese, English, Simplified Chinese, Traditional Chinese, and Korean, all as text only with no voice acting in any of them, and while 118 of its 1,125 reviews, about 10.5 percent, are already in English, and both an active Steam community discussion and a Backloggd listing exist, so calling it entirely unreached would not be honest, that reach still falls short of the West's usual gatekeepers: no coverage from outlets such as Kotaku, PC Gamer, or Rock Paper Shotgun turns up, and the one critic review on record, from IGN Japan at a score of 80, was written in Japanese, so this overwhelmingly positive small diner remains, for now, a conversation held almost entirely in Japanese.",
        desc_ja: "Steam自身のストア文言は、こう茶目っ気たっぷりに掲げる——「なあ君、ファミレスを享受せよ。月は満ちに満ちているしドリンクバーだってあるんだ。」Steam自身のゲーム説明本文によれば、『ファミレスを享受せよ』は「コマンド選択式（一部ポイント＆クリック）を採用したアドベンチャーゲーム」で、通常プレイでエンディングを見るまでは「2時間〜2時間半程度」、用意されたエンディングは2種類、「ある選択をする前にあらかじめセーブしておくことをおすすめします」とSteam自身がプレイヤーに直接忠告している。プレイヤーレビューによれば、この舞台設定そのものが仕掛けだ——あるレビューはムーンパレスを「異次元のファミレス」と呼び、別のレビューはプレイ時間の大半を「ムーンパレスにいる人々が何者で、なぜそこにいるのかという謎を解き明かす」ことに費やしたと記し、三つ目のレビューは、最初は地に足のついた状況に見えるが「そう思っていたこと自体がいかに的外れだったかを、じわじわと見せつけてくる」と評している。本作はもともと無料のブラウザゲームとして生まれた——Godotエンジンで制作し、itch.ioで無料公開したのは、ハンドル名oissisuiで活動する日本の2名同人サークル月刊湿地帯で、その同じitch.ioページは今もこのSteam版へ直接リンクを貼っている。Steam版はStudio Dragonet——福岡拠点のひとり開発者せきやdnによるスタジオ——がUnityでゼロから作り直した一本で、Steam自身の表記によれば、無料版に新規の雑談・サウンドギャラリー・イラストギャラリー・フルコントローラー対応・Steam実績（9個、ドリンクバーの飲み物を全種制覇する実績を含む）が加えられている。発行は、わくわくゲームズ（わくわくゲームズ合同会社）——資本金150万円の東京の小規模インディーパブリッシャーだ。リリース日は2023年7月31日、1,125件のレビュー(Steam自身のレビューAPIでは1,093件が好評・32件が不評)で好評率97%の「圧倒的に好評」。無料ではない有料タイトル(米国10.99ドル、日本では1,500円)で、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。日本語・英語・簡体字中国語・繁体字中国語・韓国語に対応するが、いずれもテキストのみでボイスは一切なく、1,125件のうち118件、約10.5%はすでに英語レビューで、Steamコミュニティでの議論やBackloggdへの掲載も存在する——だから「西に一切届いていない」と言い切るのは正直ではない。それでも、その届き方は西側の主要な窓口にはまだ至っていない——Kotaku・PC Gamer・Rock Paper Shotgunといった媒体の記事は見当たらず、記録に残る唯一の批評家レビューはIGN Japanによるスコア80で、日本語で書かれている。この圧倒的に好評な小さなファミレスは、今のところほぼ日本語だけで交わされる会話のままだ。",
      },
      {
        name_en: "ファミレスを享受せよ (itch.io free original, no official English title)",
        name_ja: "ファミレスを享受せよ（itch.io無料版）",
        status: "established",
        itchio: "https://oissisui.itch.io/moonpalace",
        tag_en: "The free original",
        tag_ja: "無料版の原点",
        desc_en: "The free original this grew from: ファミレスを享受せよ (\"Enjoy the Family Restaurant\"), a free browser adventure the Japanese two-person doujin circle 月刊湿地帯, working under the handle oissisui, built in the Godot engine and released for free on itch.io. Per its own itch.io page, it already drops you into the eternal family restaurant Moon Palace, drink bar included, played with nothing but a left click, running about thirty minutes to one of two endings. Enjoy the Diner on Steam is not a new work borrowing that DNA from the outside; it is oissisui's and Studio Dragonet's own ground-up commercial remake of this same free game, keeping the same eternal diner and its two endings while adding, per Steam's own listing, new customer chit-chat, a Sound Gallery, an Illustration Gallery, and Steam Achievements. That same itch.io page still carries an update note pointing straight to the finished Steam edition.",
        desc_ja: "本作が育った、その無料版の原点——『ファミレスを享受せよ』。ハンドル名oissisuiで活動する日本の2名同人サークル月刊湿地帯が、Godotエンジンで制作し、itch.ioで無料公開したブラウザアドベンチャーだ。itch.io自身の配信ページ本文によれば、この時点ですでに「永遠のファミレス『ムーンパレス』」に迷い込み、ドリンクバーもあり、操作は左クリックのみ、エンディングは2種で、推定プレイ時間は30分〜という骨格を備えていた。Steam版『ファミレスを享受せよ(Enjoy the Diner)』は、外部からこのDNAを借りた新作ではない——oissisui本人とStudio Dragonetによる、この同じ無料ゲームのゼロからの商業リメイクだ。同じ「閉まらない永遠のファミレス」と2種のエンディングを保ったまま、Steam自身の表記によれば新規の雑談・サウンドギャラリー・イラストギャラリー・Steam実績を加えている。その同じitch.ioページには今も、完成した商業版のSteamページへ直接誘導する追記が残っている。",
      },
    ],
    en: {
      title: "Enjoy the Diner - a multiple-choice, point-and-click mystery adventure set entirely inside an eternal family restaurant where the moon never stops being full, rebuilt in Unity from a free itch.io original by the two-person Japanese doujin circle 月刊湿地帯, published by Waku Waku Games, Overwhelmingly Positive at 97 percent over 1,125 reviews though only about 10.5 percent of reviews are in English",
      description: "A multiple-choice, point-and-click adventure set entirely inside the eternal family restaurant Moon Palace, where talking with an odd cast of regulars slowly uncovers why none of you can leave. Rebuilt in Unity for Steam from a free itch.io original by the two-person Japanese doujin circle 月刊湿地帯, published by the small Tokyo indie publisher Waku Waku Games. Overwhelmingly Positive at 97 percent over 1,125 reviews, with English readers still only around 10.5 percent.",
      h1a: "A family restaurant that has never once closed its doors, ",
      h1flip: "and the more its regulars tell you, the less sure you are why neither of you can leave",
      h1b: ".",
      lede: "A multiple-choice, point-and-click adventure originally built as a free itch.io browser game by 月刊湿地帯 (Gekkan Shicchitai), a two-person Japanese doujin circle working under the handle oissisui, then rebuilt from the ground up in Unity for Steam by the one-person studio Studio Dragonet and published by Waku Waku Games, a small Tokyo-based indie publisher. Steam's own text frames it with a wink: \"Why not enjoy the diner? The moon is as full as it'll ever be, and there's even a drink fountain.\" Per Steam's own listing, it typically takes 2-2.5 hours to see one of two endings, and it tells you outright to save before your \"fateful decision.\" Per Steam player reviews, the setting itself is the hook: Moon Palace is described as an \"extradimensional diner\" where the moon never actually sets, and much of the runtime goes toward, as one reviewer put it, \"uncovering the mystery of who the people at the moon palace are and why they're here.\" Released July 31, 2023, it is Overwhelmingly Positive at 97 percent over 1,125 reviews (1,093 positive, 32 negative), a paid title at $10.99 in the US (¥1,500 in Japan), not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). It supports Japanese, English, Simplified and Traditional Chinese, and Korean, all as text only with no voice acting, and while 118 of its 1,125 reviews, about 10.5 percent, are already in English, and both Steam community discussion and a Backloggd listing exist, its reach still falls short of the West's usual gatekeepers: no coverage from outlets like Kotaku, PC Gamer, or Rock Paper Shotgun turns up, and the one critic review on record, from IGN Japan at a score of 80, was written in Japanese.",
      s1: "First, the one feeling",
      feeling: [
        "Steam's own listing frames Moon Palace as a diner where 'the moon is as full as it'll ever be,' and per player reviews that is structural, not scenery: it is described as an 'extradimensional diner' that cannot close, so every friendly, mundane exchange with its regulars quietly doubles as a clue toward why none of you, including you, can walk back out its door.",
        "The whole game runs on a multiple-choice format with light point-and-click, and per Steam's own text the two endings fork from a single moment it calls your 'fateful decision,' telling you outright to save beforehand, so one choice about who you keep talking to, and how, decides which of two very different nights you end up living.",
        "Clearing the game with a certain ending unlocks a Sound Gallery and an Illustration Gallery holding, per Steam's own listing, character notes 'not found in the main game,' so the mystery of who is actually sitting across from you at Moon Palace keeps resolving itself after the credits, rather than closing the moment you put the tray down.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You want a quiet, dialogue-only mystery ADV that never leaves a single room for its entire 2-2.5 hour runtime, an eternally open family restaurant whose regulars you talk to rather than fight, forking to one of two endings on a single choice",
        "You want a small, doujin-scale Japanese production carried to Steam: a free itch.io original by the two-person circle 月刊湿地帯, rebuilt from scratch in Unity by the one-person studio Studio Dragonet with new conversations, galleries, and Steam Achievements, published through the small Tokyo indie house Waku Waku Games",
        "You want to catch an Overwhelmingly Positive title (97 percent over 1,125 reviews) while the West is still mostly absent: only about 10.5 percent of its reviews are in English, and the one critic review on record is from IGN Japan rather than a Western outlet",
      ],
      bad: [
        "You want combat, exploration, or a long game; this is text and light point-and-click only, running about 2-2.5 hours across two endings, with nothing to fight",
        "You want voice acting in any language; all five supported languages (Japanese, English, Simplified and Traditional Chinese, Korean) are text-only, and it is a paid title at $10.99 (¥1,500 in Japan), not free and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "ファミレスを享受せよ - 月が満ち続けたまま閉まらない永遠のファミレスを舞台にした、コマンド選択式＋一部ポイント＆クリックのミステリーアドベンチャー。無料のitch.io版を2名同人サークル月刊湿地帯からUnityで作り直しSteamへ、発行はわくわくゲームズ。1,125件のレビューで好評率97%の「圧倒的に好評」ながら、英語レビューはまだ約10.5%",
      description: "月が満ち続けたまま閉まらない永遠のファミレス『ムーンパレス』を舞台に、奇妙な常連客たちと会話しながら、なぜ誰も出られないのかを少しずつ解き明かしていく、コマンド選択式＋一部ポイント＆クリックのアドベンチャー。無料のitch.io版を2名同人サークル月刊湿地帯からUnityで作り直しSteamへ。発行は東京の小規模インディーパブリッシャー、わくわくゲームズ。1,125件のレビューで好評率97%の「圧倒的に好評」、英語レビューはまだ約10.5%に留まる。",
      h1a: "一度も閉まったことのないファミレスがある。",
      h1flip: "常連客と話せば話すほど、なぜ自分もここから出られないのか分からなくなっていく",
      h1b: "。",
      lede: "もとは無料のitch.ioブラウザゲームとして、ハンドル名oissisuiで活動する日本の2名同人サークル月刊湿地帯が制作。Steam版はStudio Dragonet(福岡拠点のひとり開発者せきやdnのスタジオ)がUnityでゼロから作り直し、発行はわくわくゲームズ——東京の小規模インディーパブリッシャーだ。Steam自身のストア文言は、こう茶目っ気たっぷりに掲げる——「なあ君、ファミレスを享受せよ。月は満ちに満ちているしドリンクバーだってあるんだ。」Steam自身の表記によれば、通常プレイでエンディングを見るまでは2時間〜2時間半程度、用意されたエンディングは2種類で、「ある選択をする前にあらかじめセーブしておくこと」を直接勧めてくる。プレイヤーレビューによれば、その舞台設定そのものが仕掛けだ——ムーンパレスは「異次元のファミレス」で月は実質沈むことがなく、プレイ時間の多くは、あるレビューの言葉を借りれば「ムーンパレスにいる人々が何者で、なぜそこにいるのかという謎を解き明かす」ことに費やされる。リリース日は2023年7月31日、1,125件のレビュー(好評1,093件・不評32件)で好評率97%の「圧倒的に好評」。無料ではない有料タイトル(米国10.99ドル、日本では1,500円)で、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。日本語・英語・簡体字/繁体字中国語・韓国語に対応するが、いずれもテキストのみでボイスは無く、1,125件のうち118件、約10.5%はすでに英語レビューで、Steamコミュニティでの議論やBackloggdへの掲載も存在するが、その届き方は西側の主要な窓口にはまだ至っていない——Kotaku・PC Gamer・Rock Paper Shotgunの記事は見当たらず、記録に残る唯一の批評家レビューはIGN Japanによるスコア80で、日本語で書かれている。",
      s1: "まず、その一点の感覚",
      feeling: [
        "Steam自身のストア文言は、ムーンパレスを「月は満ちに満ちている」ファミレスとして描くが、プレイヤーレビューによればそれは背景の飾りではなく構造そのものだ——「異次元のファミレス」と呼ばれるほど、この店は閉まりようがない。だから常連客とのどんな他愛ない会話も、静かに「なぜ自分たちが誰も、この扉から出られないのか」という手がかりを兼ねてしまう。",
        "ゲーム全体はコマンド選択式＋軽いポイント＆クリックで進み、Steam自身の表記によれば2種のエンディングはたった一つの瞬間——本作が「あなたの運命の選択」と呼ぶ場面——で分岐し、あらかじめセーブしておくことを直接勧めてくる。だから、誰と、どう話し続けるかという一つの選択が、まったく違う二つの夜のどちらを生きることになるかを決めてしまう。",
        "あるエンディングでクリアすると、サウンドギャラリーとイラストギャラリーが解放され、Steam自身の表記によれば「本編内で説明することがなかったキャラクター解説」が手に入る。だから、ムーンパレスで実際に向き合っていた相手が何者だったのかという謎は、エンドロールの後も解け続ける——トレイを置いた瞬間に終わる話ではない。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "戦闘ではなく会話だけで進む、静かなミステリーADVが欲しい人——2〜2.5時間の全編がたった一つの部屋、閉まらない永遠のファミレスの中で完結し、常連客との会話とたった一つの選択で2種のエンディングへ分岐する",
        "Steamへ届いた小規模な日本の同人発プロダクションが欲しい人——2名同人サークル月刊湿地帯による無料のitch.io版を、福岡のひとり開発スタジオStudio Dragonetが新規の会話・ギャラリー・Steam実績を加えてUnityでゼロから作り直し、東京の小規模インディーパブリッシャー わくわくゲームズが発行した一本",
        "西側がまだほとんど到達していない「圧倒的に好評」タイトル(1,125件のレビューで97%)を掴みたい人——英語レビューはまだ約10.5%で、記録に残る唯一の批評家レビューも西側メディアではなくIGN Japanによるもの",
      ],
      bad: [
        "戦闘・探索や長時間のボリュームが欲しい人——本作はテキストと軽いポイント＆クリックのみで、2種のエンディングまで約2〜2.5時間、戦う相手は一切いない",
        "自分の言語での音声(ボイス)が欲しい人——対応する日本語・英語・簡体字/繁体字中国語・韓国語のすべてがテキストのみで音声は無く、無料ではない有料タイトル(米国10.99ドル、日本では1,500円)の正式リリース済みでアーリーアクセスではなく、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "aquarium-does-not-dance": {
    published: "2026-07-14",
    publishAt: "2026-07-14",
    kind: "find",
    leadIndex: 0,
    // genre は既存ラベルに水族館探索ホラーADVを的確に表す語がないため新設 "aquarium-escape-horror"。
    // 系譜は開発者本人による自己参照: 2024年2月にGotcha Gotcha Games名義で無料公開された原作
    //   『アクアリウムは踊らない』(steam appid 2814910)を established anchor として採用。
    //   本作(Special Edition, appid 3675470)は同じ原作者・橙々によるブランニュー・バージョンで、
    //   フルボイス化・アナザーストーリー追加・英語対応を加えた有料の完全版(Steam appdetails実測:
    //   about_the_game に "本作は2024年2月にGotcha Gotcha Gamesより発表された『アクアリウムは
    //   踊らない』に…追加されたブランニュー・バージョン" と明記)。enjoy-the-diner/shadow-corridor
    //   と同型の自己参照origin判断。
    // content_descriptors は ids=[5](General Mature Content のみ・性的表現IDなし)・notes に暴力等の
    //   一般的成人向け内容の言及のみ(Steam実測、外部注記不採用)。AI生成コンテンツ開示欄はストアページに
    //   存在せず非AI。発売元Frontier Works Inc.はアニメイトグループ傘下の中堅企業(資本金5,000万円)で、
    //   ゲーム大手(KOEI/Cygames/Key/ANIPLEX/CAPCOM/Idea Factory/上海アリス級)には非該当。
    // 英語レビュー比率は約14.2%(40/281、appreviews API実測)で西未発見が強い。Kotakuに専用ページが
    //   存在するがIGDB由来の自動生成メタデータページ(著者・レビュー本文なし)でありKotaku編集部による
    //   単独レビューではないことをWebFetchで確認済み。
    meta: { genre: "aquarium-escape-horror", lineage: "aquarium-does-not-dance-original", obscurity: "deep", reviewBand: "hundreds", reachState: "unreached_west", rarity: { reviews: 281, positivePct: 98, noEnglish: false } },
    games: [
      {
        name_en: "The Aquarium does not dance Special Edition",
        name_ja: "アクアリウムは踊らない Special Edition",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3675470/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "A horror adventure about a girl searching for her missing best friend inside an aquarium that has turned into a world of terror. Per Steam's own listing, you explore the aquarium's map, solving puzzles you cannot proceed without, while risking death at the hands of misshapen creatures called Creepies. It began life in February 2024 as a free release credited to Gotcha Gotcha Games (the RPG Maker publishing label); this Special Edition, entirely the original creator 橙々's own new work per Steam's own text, adds full voice acting for its five main heroines, a new \"Another Story\" scenario, revised UI, added event art and music, and English-language support on top of that free original. Published by Frontier Works Inc., a mid-sized company under the Animate Group, it released July 31, 2025 and sits at Overwhelmingly Positive, 98 percent over 281 reviews (274 positive, 7 negative per Steam's own review API). A paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: General Mature Content only, no sexual-content IDs). It supports Japanese, English, Simplified and Traditional Chinese, and Korean, and while only about 40 of its 281 reviews, some 14.2 percent, are in English, Kotaku does carry a page for it — though checking that page directly shows it is an auto-generated database listing with no byline or review text, not an edited feature, so this remains a conversation held almost entirely in Japanese.",
        desc_ja: "恐怖の世界と化した水族館で、行方不明になった親友を探す少女を描くホラーアドベンチャー。Steam自身の表記によれば、水族館のマップ内を探索してゲームを進め、解かなければ進めない謎がいくつも用意されており、「クリーピー」と呼ばれる異形の存在に襲われ命を落とす危険もある。本作はもともと2024年2月にGotcha Gotcha Games名義で無料公開されたのが始まりで、このSpecial Editionは、Steam自身の表記によれば全て原作者・橙々本人による追加として、メインヒロイン5人のフルボイス化・新規シナリオ「アナザーストーリー」・UIデザイン修正・イベントCG追加・BGM追加・英語対応を無料版に加えたブランニュー・バージョンだ。発行はアニメイトグループ傘下の中堅企業フロンティアワークス。リリース日は2025年7月31日、281件のレビュー(好評274件・不評7件)で好評率98%の「圧倒的に好評」。無料ではない有料タイトルで、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:一般成人向けのみ、性的表現IDなし)性的な要素もない。日本語・英語・簡体字/繁体字中国語・韓国語に対応するが、281件のうち英語レビューは約40件、14.2%程度に留まる。Kotakuに専用ページはあるが、直接確認するとIGDB由来の自動生成データベースページで著者名もレビュー本文も無く、編集部による特集記事ではない——だからこれは、今のところほぼ日本語だけで交わされる会話のままだ。",
      },
      {
        name_en: "The Aquarium does not dance (free original, Gotcha Gotcha Games, 2024)",
        name_ja: "アクアリウムは踊らない（無料版・原作）",
        status: "established",
        steam: "https://store.steampowered.com/app/2814910/",
        tag_en: "The free original",
        tag_ja: "無料版の原点",
        desc_en: "The free original this grew from: released free in February 2024 credited to Gotcha Gotcha Games, the RPG Maker publishing label, by creator 橙々. Per Steam's own listing it already carries the same premise — a girl searching for her missing best friend inside a horror-stricken aquarium, exploring and puzzle-solving while risking death from misshapen Creepies — and sits at Overwhelmingly Positive itself, 96 percent over more than a thousand reviews. The Aquarium does not dance Special Edition on Steam is not a new work borrowing that DNA from outside; it is 橙々's own from-scratch expansion of this same free game, per Steam's own text, keeping the same story and cast while adding full voice acting, a new Another Story scenario, and English support.",
        desc_ja: "本作が育った、その無料版の原点。2024年2月、RPGツクールの発売元Gotcha Gotcha Games名義で、制作者・橙々により無料公開された。Steam自身の表記によれば、この時点ですでに恐怖の水族館で行方不明の親友を探す少女という同じ筋立てを備え、探索と謎解き、異形の存在「クリーピー」による死の危険という骨格も同一で、1,000件超のレビューで自身も好評率96%の「圧倒的に好評」を得ている。Steam版『アクアリウムは踊らない Special Edition』は、外部からこのDNAを借りた新作ではない——橙々本人による、この同じ無料ゲームのゼロからの拡張版だ。Steam自身の表記によれば、同じ物語とキャストを保ったまま、フルボイス化・新規シナリオ「アナザーストーリー」・英語対応を加えている。",
      },
    ],
    en: {
      title: "The Aquarium does not dance Special Edition - a horror adventure about a girl searching for her best friend inside an ever-shifting aquarium of misshapen creatures, expanded by solo creator 橙々 from a free 2024 original into a fully voiced paid edition published by Frontier Works, Overwhelmingly Positive at 98 percent over 281 reviews though only about 14 percent of reviews are in English",
      description: "A horror adventure exploring an aquarium turned world of terror, solving puzzles and evading misshapen creatures called Creepies while searching for a missing best friend. Expanded by solo creator 橙々 from a free 2024 original into this fully-voiced Special Edition, published by Frontier Works Inc. under the Animate Group. Overwhelmingly Positive at 98 percent over 281 reviews, with English readers still only around 14 percent.",
      h1a: "An aquarium where the exhibits have started hunting back, ",
      h1flip: "and the friend you came in to find keeps slipping one room further away",
      h1b: ".",
      lede: "A horror adventure originally released free in February 2024 under the RPG Maker label Gotcha Gotcha Games, then expanded from scratch by its solo creator 橙々 into this fully-voiced Special Edition, published by Frontier Works Inc., a mid-sized company under the Animate Group. Per Steam's own listing, you explore the aquarium's map solving puzzles you cannot proceed without, while misshapen creatures called Creepies threaten to kill you outright. This edition adds full voice acting for its five main heroines, a new \"Another Story\" scenario, revised UI, added event art and music, and English-language support on top of the free original. Released July 31, 2025, it is Overwhelmingly Positive at 98 percent over 281 reviews (274 positive, 7 negative), a paid title, not free, fully launched and not in Early Access, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: General Mature Content only). It supports Japanese, English, Simplified and Traditional Chinese, and Korean, and while about 40 of its 281 reviews, some 14.2 percent, are already in English, and Kotaku does carry a page for it, that page turns out to be an auto-generated database listing with no byline or review text once checked directly, not an edited feature — so this remains, for now, a conversation held almost entirely in Japanese.",
      s1: "First, the one feeling",
      feeling: [
        "Steam's own listing frames the puzzles as mandatory gates you cannot proceed past without solving, and per that same listing misshapen Creepies can kill you outright mid-search, so every room doubles as both a lock you have to pick and a threat you have to read before it reads you.",
        "This Special Edition adds full voice acting for all five main heroines on top of the free original, so the cast a solo creator once conveyed through text alone now performs the same friendship-and-fear story with full vocal presence, changing how much the missing-friend search lands emotionally scene to scene.",
        "Clearing the base story unlocks a new \"Another Story\" scenario exclusive to this edition, so the mystery of who else was really in that aquarium keeps resolving itself after the first ending, rather than closing the moment you find your friend.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You want a puzzle-first horror ADV where every room is a mandatory gate to solve, with real death threats from its monster designs rather than jump-scare padding",
        "You want a small Japanese solo production carried to Steam: a free February 2024 original by creator 橙々, expanded from scratch into a fully-voiced paid edition and published through the mid-sized Frontier Works Inc.",
        "You want to catch an Overwhelmingly Positive title (98 percent over 281 reviews) while the West is still mostly absent: only about 14 percent of its reviews are in English, and its lone Kotaku page turns out to be an unedited auto-generated listing rather than a Western review",
      ],
      bad: [
        "You want a long game or heavy combat; this is a puzzle-and-exploration horror ADV of moderate length with monster encounters rather than a full combat system",
        "You want the free original instead; this Special Edition is a paid title, not free and not in Early Access, adding full voice acting, a new Another Story scenario, and English support that the free 2024 version does not have, with no AI-generated assets and, per Steam's own content descriptors, nothing sexual (ids: General Mature Content only)",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "アクアリウムは踊らない Special Edition - 異形の存在が徘徊する水族館で行方不明の親友を探す、謎解き主体のホラーアドベンチャー。個人制作者・橙々が2024年の無料版からフルボイス化して拡張した有料完全版、発行はフロンティアワークス。281件のレビューで好評率98%の「圧倒的に好評」ながら、英語レビューはまだ約14%",
      description: "異形の存在「クリーピー」が徘徊する、恐怖の世界と化した水族館を探索し、謎を解きながら行方不明の親友を探すホラーアドベンチャー。個人制作者・橙々が2024年の無料版からフルボイス化して拡張したSpecial Edition。発行はアニメイトグループ傘下のフロンティアワークス。281件のレビューで好評率98%の「圧倒的に好評」、英語レビューはまだ約14%に留まる。",
      h1a: "展示されていた者たちが、狩る側に回った水族館がある。",
      h1flip: "探しに来たはずの親友は、話すたびにもう一部屋、遠くへ行ってしまう",
      h1b: "。",
      lede: "もとは2024年2月、RPGツクールの発売元Gotcha Gotcha Games名義で無料公開されたホラーアドベンチャー。制作者・橙々本人がゼロから拡張し、このフルボイスのSpecial Editionへと仕上げた。発行はアニメイトグループ傘下の中堅企業、フロンティアワークス。Steam自身の表記によれば、水族館のマップ内を探索し、解かなければ進めない謎がいくつも待ち構え、異形の存在「クリーピー」に襲われれば命を落とす危険もある。本エディションでは、無料版にメインヒロイン5人のフルボイス化・新規シナリオ「アナザーストーリー」・UIデザイン修正・イベントCG追加・BGM追加・英語対応が加えられている。リリース日は2025年7月31日、281件のレビュー(好評274件・不評7件)で好評率98%の「圧倒的に好評」。無料ではない有料タイトルで、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:一般成人向けのみ)性的な要素もない。日本語・英語・簡体字/繁体字中国語・韓国語に対応するが、281件のうち約40件、14.2%程度がすでに英語レビューで、Kotakuに専用ページもあるが、直接確認するとIGDB由来の自動生成データベースページで著者名もレビュー本文も無く、編集部による特集記事ではない——だからこれは今のところ、ほぼ日本語だけで交わされる会話のままだ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "Steam自身の表記によれば、謎は解かなければ先に進めない必須の関門として設計されており、同じ表記によれば探索中は異形の存在「クリーピー」に襲われ命を落とす危険もある。だからどの部屋も、解くべき錠であると同時に、読み解く前に読まれてしまう脅威にもなる。",
        "このSpecial Editionは無料版にメインヒロイン5人分のフルボイスを新たに追加しており、個人制作者がかつてテキストだけで伝えていた友情と恐怖の物語が、今は声の存在感を伴って場面ごとに響くようになった。",
        "本編をクリアすると、このエディション限定の新規シナリオ「アナザーストーリー」が解放される。だから、あの水族館に本当は誰がいたのかという謎は、最初のエンディングの後も解け続ける——親友を見つけた瞬間に終わる話ではない。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "謎解き主体のホラーADVが欲しい人——どの部屋も解かなければ進めない関門で、ジャンプスケアの水増しではなく実際の死の脅威を伴うモンスターデザインがある",
        "Steamへ届いた小規模な日本の個人発プロダクションが欲しい人——制作者・橙々による2024年2月の無料版を、本人がゼロから拡張しフルボイス化した有料版に仕立て、中堅企業フロンティアワークスが発行した一本",
        "西側がまだほとんど到達していない「圧倒的に好評」タイトル(281件のレビューで98%)を掴みたい人——英語レビューはまだ約14%で、唯一のKotakuページも直接確認すると編集された西側レビューではなく無編集の自動生成リストに過ぎない",
      ],
      bad: [
        "長時間のボリュームや本格的な戦闘が欲しい人——本作は謎解きと探索が主体の中程度の長さのホラーADVで、本格的な戦闘システムはなくモンスターとの遭遇のみ",
        "無料版で十分だという人——このSpecial Editionは無料ではない有料タイトルで、アーリーアクセスではなく正式リリース済み。フルボイス化・新規シナリオ「アナザーストーリー」・英語対応は2024年の無料版には無く、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:一般成人向けのみ)性的な要素もない",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "5omeday": {
    published: "2026-07-15",
    publishAt: "2026-07-15",
    kind: "find",
    leadIndex: 0,
    // genre は既存ラベルに「1クリック分岐×処刑ボタンの5分ノベル」を捉える語がないため新設
    //   "instant-branch-novel"。系譜は開発者本人による自己参照: 2023年10月にunityroomで無料公開
    //   された原作『イツカノヨル』(Unity1Week「1ボタン」お題参加作)を established anchor として
    //   採用する(lineage_anchor_key=itchio と同型のURL直参照だが unityroom のため専用フィールド
    //   unityroom を新設。Steam版・Wikidata QIDを持たない無料ゲームのため、既存の freem/itchio
    //   パターンに倣いURLのみ積む)。Steam商業版はStudio名義"Indigo Ingots, Starlit Chronicles
    //   Studio"だが、Starlit Chronicles Studioの実体(Indigo Ingots本人の商業リリース名義か別チーム
    //   か)は独立情報源で確認できず不明のため、断定せずSteam自身のクレジット表記のみを事実として書く。
    // content_descriptors は ids=[5](General Mature Content)のみ・notes に "It does not contain
    //   bleeding, violence or sexual content"とSteam自身が明記(実測、外部注記不採用)。AI生成コンテンツ
    //   開示欄はストアページに存在せず非AI。発売元 Waku Waku Games は東京の小規模インディーパブリッシャー
    //   で既出多数(sonokuni/one-turn-kill等)・非大手確定済み。
    // west_unreached: 英語レビュー比率は約29.3%(90/307、appreviews API実測)。AUTOMATON WEST(売上1万本
    //   突破のニュース記事)とNiche Gamer(処刑ボタン設定への批判記事)の2件が西側メディアで見つかったが、
    //   いずれも作品レビューではなく話題性・炎上ニュースであることをWebFetchで確認。Kotakuの専用ページは
    //   IGDB由来の自動生成データベースページで編集記事ではない。批評家レビューはMetacriticで"not available
    //   yet"。よって「西側メディアの話題にはなったが、レビューでは語られていない」と正直に書く。
    meta: { genre: "instant-branch-novel", lineage: "5omeday-original", obscurity: "wall", reviewBand: "hundreds", rarity: { reviews: 307, positivePct: 89, noEnglish: false } },
    games: [
      {
        name_en: "5omeday",
        name_ja: "イツカノヨル",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3030980/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "Per Steam's own listing, if she moves strangely or seems about to hurt you, you press the button in front of you right away, and the execution happens immediately. A single playthrough runs about five minutes, played with nothing but clicks, and whether you press the button, when you press it, and which dialogue choices you make branch the story across 13 different endings shaped by your curiosity and guilt. It began life free on the Japanese game jam site unityroom in October 2023, made for the Unity1Week jam's \"one button\" theme by creator Indigo Ingots (script, planning, and programming) working with artist polaritia and composer Kazura's MUSIC. Steam's own developer credit lists Indigo Ingots and Starlit Chronicles Studio; whether the latter is a separate team or Indigo Ingots' own commercial-release name could not be independently confirmed, so this is stated as-is rather than guessed at. This commercial edition adds full voice acting for the dragon girl Mira (voiced by Nako Natsuki), additional endings with new music, stills, and character art, Steam Achievements, a gallery mode, and English and Chinese (Simplified and Traditional) language support on top of the free original. Published by Waku Waku Games, a small Tokyo-based indie publisher, it released January 28, 2026 and sits at Very Positive, 89 percent over 307 reviews (274 positive, 33 negative per Steam's own review API). A paid title, not free, fully launched and not in Early Access, with no AI-generated assets; per Steam's own content descriptors it carries only a General Mature Content tag, with Steam's own notes stating outright that it 'does not contain bleeding, violence or sexual content.' It supports Japanese (full audio), English, and Simplified and Traditional Chinese, and while about 90 of its 307 reviews, some 29.3 percent, are already in English, and it did draw two pieces of Western press — AUTOMATON WEST reporting it had sold over 10,000 copies, and Niche Gamer covering backlash over its execution-button premise — neither is a review: Kotaku's page for it turns out to be an auto-generated database listing with no byline, and Metacritic lists critic reviews as not yet available, so this stays a game the West has talked about without yet actually reviewing.",
        desc_ja: "Steam自身の表記によれば、目の前の少女が怪しい動きをしたり危害を加えてくると感じたら、すぐに目の前のボタンを押す——処刑はただちに実行される。1プレイは約5分、操作は基本的にクリックのみで、ボタンを押すか押さないか・押すタイミング・選択肢によって物語が枝分かれし、プレイヤーの好奇心と罪悪感の在り方で全13種類のエンディングへ分岐する。本作は2023年10月、日本のゲームジャムサイト「unityroom」でUnity1Week「1ボタン」お題の参加作として、制作者Indigo Ingots(企画・シナリオ・プログラム)がイラストpolaritia・サウンドかずら's MUSICと組んで無料公開したのが始まりだ。Steam自身の開発者クレジットは「Indigo Ingots, Starlit Chronicles Studio」と並記しているが、後者が別チームなのかIndigo Ingots本人の商業リリース名義なのかは独立した情報源で確認できず、推測せずそのまま事実として記す。この商業版では、ドラゴン娘ミラ(声:菜月なこ)のフルボイス化・エンディング追加とそれに伴うBGM/スチル/立ち絵差分の追加・Steam実績・ギャラリー機能・英語と中国語(繁体字/簡体字)対応が、無料版に加えられている。発行は東京の小規模インディーパブリッシャー、わくわくゲームズ。リリース日は2026年1月28日、307件のレビュー(好評274件・不評33件)で好評率89%の「非常に好評」。無料ではない有料タイトルで、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上は「一般成人向け」のみで、Steam自身の注記が「流血・暴力・性的表現は含まれません」と明記している。日本語(フルボイス)・英語・簡体字/繁体字中国語に対応するが、307件のうち約90件、29.3%程度がすでに英語レビューで、西側メディアでも2件話題になった——AUTOMATON WESTが売上1万本突破を報じ、Niche Gamerが「処刑ボタン」という設定への反発を報じている——が、どちらもレビューではない。Kotakuの専用ページはIGDB由来の自動生成データベースページで著者名が無く、Metacriticの批評家レビューは「まだ利用不可」のまま。つまりこれは、西側で話題にはなったが、まだレビューでは語られていないゲームということになる。",
      },
      {
        name_en: "イツカノヨル (unityroom free original, Unity1Week 2023, no official English title)",
        name_ja: "イツカノヨル（unityroom無料版）",
        status: "established",
        unityroom: "https://unityroom.com/games/fivedaysnight",
        tag_en: "The free original",
        tag_ja: "無料版の原点",
        desc_en: "The free original this grew from: released free on unityroom in October 2023 for the Unity1Week game jam's \"one button\" theme, by creator Indigo Ingots working with artist polaritia and composer Kazura's MUSIC. Per its own game page, it already carries the same premise and structure — a five-minute, click-only story branching across your choice of whether and when to press the execution button in front of you. 5omeday on Steam is not a new work borrowing that DNA from outside; it is a commercial edition of this same free jam game, per Steam's own listing, adding full voice acting, extra endings, and English and Chinese language support on top of it.",
        desc_ja: "本作が育った、その無料版の原点——2023年10月、Unity1Weekゲームジャムの「1ボタン」お題に応じて、制作者Indigo Ingotsがイラストpolaritia・サウンドかずら's MUSICと組み、unityroomで無料公開した。その配信ページ自体によれば、この時点ですでに同じ骨格——5分・クリックのみで進み、目の前の処刑ボタンを押すか押さないか、いつ押すかで分岐する物語——を備えていた。Steam版『イツカノヨル(5omeday)』は、外部からこのDNAを借りた新作ではない——Steam自身の表記によれば、この同じ無料ジャムゲームの商業版であり、フルボイス化・エンディング追加・英語/中国語対応を加えている。",
      },
    ],
    en: {
      title: "5omeday - a five-minute, one-click branching novel where you decide whether and when to press the execution button on a dragon girl accused of a crime, expanded by creator Indigo Ingots from a free 2023 Unity1Week jam original into a fully-voiced Steam edition published by Waku Waku Games, Very Positive at 89 percent over 307 reviews though the West has only talked about it, not reviewed it yet",
      description: "A five-minute, click-only branching novel: a dragon girl suspected of a crime sits across from you, and whether you press the execution button in front of you, and when, forks the story across 13 endings. Expanded by creator Indigo Ingots from a free 2023 Unity1Week jam original into this fully-voiced Steam edition, published by the small Tokyo indie publisher Waku Waku Games. Very Positive at 89 percent over 307 reviews, with English readers still only around 29 percent.",
      h1a: "A dragon girl sits across from you, and a red button waits between you, ",
      h1flip: "and the thirteen ways this ends all come down to whether, and when, you press it",
      h1b: ".",
      lede: "A five-minute, click-only branching novel originally released free in October 2023 for the Unity1Week game jam's \"one button\" theme, by creator Indigo Ingots working with artist polaritia and composer Kazura's MUSIC, then expanded into this fully-voiced Steam edition published by Waku Waku Games, a small Tokyo-based indie publisher. Per Steam's own listing, if the dragon girl across from you moves strangely or seems about to hurt you, you press the button in front of you right away, and the execution happens immediately; whether you press it, when, and which dialogue choices you make branch the story across 13 different endings shaped by your curiosity and guilt. This edition adds full voice acting for the dragon girl Mira, additional endings with new music, stills, and character art, Steam Achievements, and a gallery mode on top of the free original. Released January 28, 2026, it is Very Positive at 89 percent over 307 reviews (274 positive, 33 negative), a paid title, not free, fully launched and not in Early Access, with no AI-generated assets; per Steam's own content descriptors it carries only a General Mature Content tag, with Steam's own notes stating it 'does not contain bleeding, violence or sexual content.' It supports Japanese, English, and Simplified and Traditional Chinese, and while about 90 of its 307 reviews, some 29.3 percent, are already in English, and it drew two pieces of Western press (AUTOMATON WEST on its 10,000-copy sales milestone, Niche Gamer on backlash over its premise), neither is a review — Kotaku's page is an auto-generated database listing, and Metacritic lists critic reviews as not yet available.",
      s1: "First, the one feeling",
      feeling: [
        "Steam's own listing frames the premise bluntly: if she moves strangely or seems about to hurt you, press the button, and the execution happens immediately, so every line of small talk with the dragon girl across from you doubles as evidence you have to weigh in real time, with the button always sitting right there as an option you never stop being aware of.",
        "The entire game runs about five minutes on clicks alone, and per Steam's own listing whether you press the button, when, and which dialogue choices you make together fork the story across 13 different endings, so a single hesitation or a single moment of curiosity can be the difference between which of thirteen very different nights you end up living.",
        "This Steam edition adds full voice acting for the dragon girl Mira on top of the free jam original, so a story a solo creator once told through text and a single button now carries a voice performance across every line you're weighing evidence against, changing how much each small gesture of hers lands before you decide.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You want an extremely short, high-tension branching novel you can finish in about five minutes, built around a single button and the moral weight of if and when you press it, forking across 13 endings",
        "You want a small, jam-scale Japanese production carried to Steam: a free October 2023 Unity1Week original by creator Indigo Ingots, expanded into a fully-voiced paid edition published by the small Tokyo indie publisher Waku Waku Games",
        "You want a Very Positive title (89 percent over 307 reviews) that Western press has only talked about, not reviewed: AUTOMATON WEST and Niche Gamer both covered it as news, but no outlet has published an actual review, and only about 29 percent of its reviews are in English",
      ],
      bad: [
        "You want a long game or a big cast; this is a five-minute, single-scene branching novel with one other character and no combat or exploration",
        "You want a story that has already been reviewed by Western outlets; per Steam's own content descriptors it carries only a General Mature Content tag and explicitly no bleeding, violence, or sexual content, but the two English-language mentions it has received are news coverage, not reviews, and it is a paid title, not free and not in Early Access, with no AI-generated assets",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "イツカノヨル - 罪を疑われたドラゴン娘の処刑ボタンを、押すか・いつ押すかだけで進む5分の1クリック分岐ノベル。制作者Indigo Ingotsが2023年のUnity1Weekジャム無料版からフルボイス化しSteamへ、発行はわくわくゲームズ。307件のレビューで好評率89%の「非常に好評」ながら、西側ではまだ話題になっただけでレビューはされていない",
      description: "罪を疑われたドラゴン娘が目の前に座り、目の前の処刑ボタンを押すか、いつ押すかだけで物語が13種のエンディングへ分岐する、5分・クリックのみの分岐ノベル。制作者Indigo Ingotsが2023年のUnity1Weekジャム無料版からフルボイス化し、このSteam版へ拡張。発行は東京の小規模インディーパブリッシャー、わくわくゲームズ。307件のレビューで好評率89%の「非常に好評」、英語レビューはまだ約29%に留まる。",
      h1a: "目の前にドラゴン娘が座り、二人の間には赤いボタンがある。",
      h1flip: "この結末が13通りに分かれる理由は、それを押すか、いつ押すか、それだけだ",
      h1b: "。",
      lede: "もとは2023年10月、Unity1Weekゲームジャムの「1ボタン」お題に応じて、制作者Indigo Ingotsがイラストpolaritia・サウンドかずら's MUSICと組んで無料公開した、5分・クリックのみの分岐ノベル。Steam版は東京の小規模インディーパブリッシャー、わくわくゲームズが発行するフルボイス版へ拡張されている。Steam自身の表記によれば、目の前のドラゴン娘が怪しい動きをしたり危害を加えてくると感じたら、すぐに目の前のボタンを押す——処刑はただちに実行される。ボタンを押すか押さないか・押すタイミング・選択肢によって物語は全13種類のエンディングへ分岐し、プレイヤーの好奇心と罪悪感が試される。本エディションでは、ドラゴン娘ミラのフルボイス化・エンディング追加とそれに伴う新規BGM/スチル/立ち絵差分・Steam実績・ギャラリー機能が、無料版に加えられている。リリース日は2026年1月28日、307件のレビュー(好評274件・不評33件)で好評率89%の「非常に好評」。無料ではない有料タイトルで、アーリーアクセスではなく正式リリース済み、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上は「一般成人向け」のみで、Steam自身の注記は「流血・暴力・性的表現は含まれません」と明記する。日本語・英語・簡体字/繁体字中国語に対応するが、307件のうち約90件、29.3%程度がすでに英語レビューで、西側メディアでも2件話題になった(AUTOMATON WESTが売上1万本突破のニュース、Niche Gamerが設定への反発のニュース)が、どちらもレビューではない——Kotakuのページは自動生成データベースリストで、Metacriticの批評家レビューは「まだ利用不可」のままだ。",
      s1: "まず、その一点の感覚",
      feeling: [
        "Steam自身の表記は前提を率直に示す——目の前の少女が怪しい動きをしたり危害を加えてくると感じたら、ボタンを押せば処刑がただちに実行される。だから彼女との何気ない会話の一言一言が、リアルタイムで天秤にかける証拠にもなり、ボタンは常にそこにある選択肢として意識され続ける。",
        "ゲーム全体はクリックのみで約5分、Steam自身の表記によればボタンを押すか押さないか・タイミング・選択肢が組み合わさって全13種のエンディングへ分岐する。だから一瞬のためらいや一瞬の好奇心が、13通りの夜のうちどれを生きることになるかを分けてしまう。",
        "このSteam版は無料のジャム版にドラゴン娘ミラのフルボイスを新たに加えており、ソロ制作者がかつてテキストと一つのボタンだけで語っていた物語が、今は証拠を天秤にかける一言一言に声の存在感を伴うようになった。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "約5分で完結する、極めて短く緊張感の高い分岐ノベルが欲しい人——たった一つのボタンと、それを押すか・いつ押すかという道徳的な重みを軸に、13種のエンディングへ分岐する",
        "Steamへ届いた小規模な日本のジャム発プロダクションが欲しい人——制作者Indigo Ingotsによる2023年10月のUnity1Week無料版を、フルボイス化した有料版に拡張し、東京の小規模インディーパブリッシャー わくわくゲームズが発行した一本",
        "西側ではまだ話題になっただけでレビューされていない「非常に好評」タイトル(307件のレビューで89%)を掴みたい人——AUTOMATON WESTとNiche Gamerはニュースとして報じたが、実際のレビューを出した媒体はまだなく、英語レビューもまだ約29%に留まる",
      ],
      bad: [
        "長時間のボリュームや多数の登場人物が欲しい人——本作は5分・単一シーンの分岐ノベルで、登場人物はもう一人だけ、戦闘や探索は無い",
        "西側メディアにすでにレビューされた作品が欲しい人——Steam自身のコンテンツディスクリプタ上は「一般成人向け」のみで流血・暴力・性的表現は明示的に含まれないが、英語圏で受けた2件の言及はニュース報道でありレビューではなく、無料ではない有料タイトルで、アーリーアクセスではなく正式リリース済み、AI生成アセットはない",
      ],
      s3: "系譜：この味の原点",
    },
  },
  "batterynote": {
    published: "2026-07-15",
    publishAt: "2026-07-15",
    kind: "find",
    leadIndex: 0,
    // genre は既存ラベルに「充電で会話するか高電圧で罰するかを選ぶ、寿命の短いロボットとの
    //   SFノベル」を捉える語がないため新設 "robot-deathbed-novel"。開発者本人がharf-wayの取材で
    //   本作を「看取りのようなゲーム」と形容していること(実測・引用元明記)を踏まえた命名。
    // 系譜は Papers, Please(Lucas Pope, 2013, Steam appid 239030)——弱い立場の相手の運命を、
    //   タイマー付きの小さな反復行為(承認/却下)だけに委ねる、という着想を定義した一本——を新規
    //   anchor "papers-please" として採用する。この帰属は開発者本人の言明ではなく当サイト独自の
    //   批評的比較のため自信度: 中(捏造しない・parasocial/perfect-blue型の判断)。Papers, Please
    //   自体がSteamで現行販売中のため、games[]のestablished側はsteam URLで同定する(wikidata等の
    //   フォールバックは不要)。
    // developer 72studio(個人・愛称「ななにい」、本業の傍らで開発)/ publisher room6(京都拠点・
    //   資本金500万円・社員28名の独立系インディーパブリッシャー)は、いずれも公式サイト・
    //   gamebiz企業情報・京都府企業紹介・denfaminicogamerインタビューで裏取り済み。room6が
    //   2022年にマーベラス・ジー・モードと結んだのは資本提携ではなく業務提携(株式取得を伴わない)
    //   ことをマーベラスIR開示で確認済み・大手資本提携除外条件には抵触しない。
    // content_descriptors は ids=[]・notes=null(API実測、en/ja両ロケール一致・性的コンテンツなし)。
    //   AI Generated Content Disclosure欄はストアページに存在せず非AI。is_free=false・Steam実績あり。
    // west_unreached: 英語レビュー比率は約18.1%(40/221、appreviews API実測)。Metacriticにページは
    //   存在するが批評家レビューは0件("tbd")、OpenCriticにページ自体なし、Kotakuの専用ページは
    //   実記事を含まない自動生成ハブページ、西側での言及はTime ExtensionとNoisy Pixel(いずれも
    //   中小メディア)の2件のニュース記事のみでレビューではないことを独立WebFetchで確認済み。
    meta: { genre: "robot-deathbed-novel", lineage: "papers-please", obscurity: "wall", reviewBand: "hundreds", rarity: { reviews: 221, positivePct: 98, noEnglish: false } },
    games: [
      {
        name_en: "BatteryNote",
        name_ja: "BatteryNote",
        status: "hidden",
        steam: "https://store.steampowered.com/app/3005930/BatteryNote/",
        tag_en: "Buried gem",
        tag_ja: "埋もれた名作",
        desc_en: "Per Steam's own listing, you are a mechanic who has picked up three robots from a scrapyard, and in a dimly lit garage you charge and revive them one at a time within a time limit: talk with them to peek into their memories, or throw a high-voltage switch just to enjoy their reaction, and how you treat them shapes both their fate and the game's ending, since their batteries only have a short lifespan left. The three are J.S.C.A, a robot waitress at a diner; Surverry, a security robot built for monitoring offices; and Devind R7, a combat robot that seems to have been developed for military use. In an interview with the Japanese indie-game outlet HARF-WAY, solo developer 72studio (handle: Nananii) described the game's own core as wanting players to grow fond of these characters rather than simply destroy them, calling it, in the developer's own words translated here, 'a game like keeping watch at someone's deathbed.' Released October 9, 2025 and published by room6, a small, independent Kyoto-based indie publisher (about 28 staff, no capital ties to any major publisher confirmed), it is Very Positive at 98 percent over 221 reviews (218 positive, 3 negative per Steam's own review API), a paid title at ¥1,372, not free, fully launched and not in Early Access, with Steam Achievements, no AI-generated assets, and, per Steam's own content descriptors, nothing sexual (ids: none, notes: none). It supports Japanese, English, Simplified and Traditional Chinese, and Korean, and while about 40 of its 221 reviews, some 18.1 percent, are already in English, its reach into the West stays thin: Metacritic carries a page for it but lists critic reviews as not yet available, OpenCritic has no page for it at all, Kotaku's page turns out to be an auto-generated hub with no actual article, and the only Western coverage found is two news pieces, from Time Extension and Noisy Pixel, neither of which is a review.",
        desc_ja: "Steam自身の表記によれば、あなたはコールドスリープから目を覚ました「メカニックくずれ」で、薄暗いガレージのなか、壊れかけの3体のロボットを1体ずつ充電して呼び戻す。対話によって記憶をのぞいてもよいし、高電圧を流して反応を楽しんでもよい——彼らのバッテリーの寿命はあとわずかで、どう扱うかによって彼らの運命とゲームのエンディングが変わっていく。3体は、ダイナーのウェイターロボット「ジェシカ」、オフィスを監視するためのセキュリティロボット「サーベリー」、軍事用に開発されたと思しき戦闘ロボット「デバインドR7」。日本のインディーゲームメディアHARF-WAYの取材に対し、個人開発者72studio(愛称「ななにい」)は、本作の核は彼らを壊すことではなくキャラクターを好きになってもらうことにあると述べ、「相手の深淵を覗く」「看取りのようなゲーム」と形容している(実際の取材記事から引用・翻訳)。発売日は2025年10月9日、発行は京都拠点の独立系インディーパブリッシャー room6(社員約28名、大手企業との資本関係は確認されず)。221件のレビュー(好評218件・不評3件、Steam自身のレビューAPI実測)で好評率98%の「非常に好評」。¥1,372の有料タイトルで無料ではなく、アーリーアクセスではなく正式リリース済み、Steam実績あり、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上(ids:なし、notes:なし)性的な要素もない。日本語・英語・簡体字/繁体字中国語・韓国語に対応するが、221件のうち約40件、18.1%程度がすでに英語レビューである一方、西側への到達は薄いままだ——Metacriticにはページがあるものの批評家レビューは「まだ利用不可」のまま、OpenCriticにはページ自体が存在せず、Kotakuの専用ページは実記事を含まない自動生成ハブページで、見つかった西側の言及はTime ExtensionとNoisy Pixelの2件のニュース記事のみ、いずれもレビューではない。",
      },
      {
        name_en: "Papers, Please",
        name_ja: "Papers, Please",
        status: "established",
        steam: "https://store.steampowered.com/app/239030/Papers_Please/",
        tag_en: "The critical echo",
        tag_ja: "批評的な木霊",
        desc_en: "The origin of this taste: Papers, Please, Lucas Pope's 2013 procedural thriller in which the player, a border inspector in the fictional state of Arstotzka, reduces each stranger crossing the checkpoint to a stack of paperwork and, under a ticking clock, decides only to approve or reject them, a small repeated act of bureaucratic power that branches the story across more than twenty endings depending entirely on how it was exercised. BatteryNote is not an official Papers, Please work, and this lineage is a comparison drawn by this site in outside critical commentary, not a stated influence from developer 72studio, but it carries the same shape of tension into a new frame: a charging switch and a high-voltage switch standing in for a stamp of approval or rejection, held over three strangers whose fate, and whose ending, depends entirely on how that small, repeated power is used against a clock.",
        desc_ja: "この味の原点——Papers, Please。Lucas Pope制作による2013年の書類審査スリラーで、プレイヤーは架空の国家アルストツカの国境審査官として、検問所を通る一人ひとりを「書類の束」として扱い、時間制限のなかで承認するか却下するかだけを選び続ける。その官僚的な権力の小さな反復行為が、行使のされ方次第で20種を超えるエンディングへと枝分かれしていく。BatteryNoteは公式のPapers, Please作品ではなく、この系譜は開発元72studioが明言した影響ではなく当サイト独自の批評的比較だが、同じ形の緊張感を新しい枠組みへと引き継いでいる——承認/却下のスタンプの代わりに充電スイッチと高電圧スイッチがあり、その小さな反復する権力がタイマーに追われながらどう使われるかだけで、3人の見知らぬ相手の運命とエンディングが決まる。",
      },
    ],
    en: {
      title: "BatteryNote - a sci-fi visual novel where you recharge three dying, scrapped robots and decide, one high-voltage switch at a time, whether their last moments are kindness or punishment, made by solo Japanese developer 72studio and published by the small Kyoto indie room6, Very Positive at 98 percent over 221 reviews though almost untouched by Western press",
      description: "A sci-fi visual novel: you charge up three broken robots pulled from a scrapyard and, one at a time, either talk with them to learn their memories or throw the high-voltage switch just to see how they react, deciding how what little life they have left gets spent. Made by solo developer 72studio and published by the small Kyoto-based indie label room6. Very Positive at 98 percent over 221 reviews, with English readers still only around 18 percent.",
      h1a: "Three broken robots sit in front of you, and between you and each one there is only a charging cable and a high-voltage switch, ",
      h1flip: "so whether their last moments are spent talking or screaming comes down to which one you choose to throw",
      h1b: ".",
      lede: "A sci-fi visual novel originally released October 9, 2025, made by solo developer 72studio (handle: Nananii) and published by room6, a small, independent Kyoto-based indie publisher. Per Steam's own listing, you play a mechanic who has picked up three robots from a scrapyard, and in a dimly lit garage you charge and revive them one at a time within a time limit: talk with them to peek into their memories, or throw a high-voltage switch just to enjoy their reaction, and how you treat them shapes both their fate and the game's ending, since their batteries only have a short lifespan left. In an interview with the Japanese outlet HARF-WAY, 72studio described the game's real core as wanting players to grow fond of these characters rather than simply destroy them, calling it, translated here, 'a game like keeping watch at someone's deathbed.' It is Very Positive at 98 percent over 221 reviews (218 positive, 3 negative), a paid title at ¥1,372, not free, fully launched and not in Early Access, with Steam Achievements, no AI-generated assets, and per Steam's own content descriptors, nothing sexual. It supports Japanese, English, Simplified and Traditional Chinese, and Korean, and while about 40 of its 221 reviews, some 18.1 percent, are already in English, its reach into the West stays thin: Metacritic lists critic reviews as not yet available, OpenCritic has no page for it, Kotaku's page is an auto-generated hub with no actual article, and the only Western coverage found is two news pieces, from Time Extension and Noisy Pixel, neither of which is a review.",
      s1: "First, the one feeling",
      feeling: [
        "Per Steam's own listing, the entire loop comes down to one switch: charge a robot and talk with it to learn its memories, or throw the high-voltage switch just to watch it react, and every choice you make toward something that is dying regardless carries that same small, total power over how its last moments go.",
        "72studio himself frames the real hook not as destruction but as curiosity, telling HARF-WAY that his own hang-up is wanting to communicate with these non-human characters and grow to like them, so the high-voltage switch reads less like an execution button and more like teasing someone you are already fond of, right up until you decide otherwise.",
        "Each of the three robots, J.S.C.A the diner waitress, Surverry the office security unit, and Devind R7 the combat model, was already scrapped as broken or dangerous before you found them, so every conversation is also an exhumation of exactly why they were thrown away, and whether that verdict was ever fair.",
      ],
      s2: "Who this is for (and who it is not)",
      good: [
        "You want a short, morally charged sci-fi visual novel about holding total, mundane power over something fragile and already dying, told through nothing more than a charging cable and a high-voltage switch",
        "You want a small-scale solo Japanese production reaching Steam through a small publisher: 72studio's one-person hobby project, published by the 28-person Kyoto indie label room6 with no confirmed capital ties to any major publisher",
        "You want a Very Positive title (98 percent over 221 reviews) that Western press has barely touched: Metacritic lists no critic reviews yet, OpenCritic has no page, and the only English-language coverage is two news pieces, not reviews",
      ],
      bad: [
        "You want a long game or a large cast; this is a short-session visual novel built around three robots and one switch, with no combat or exploration",
        "You want a story already validated by Western critics; it carries no AI-generated assets and, per Steam's own content descriptors, nothing sexual, but it is a paid title, not free and not in Early Access, and remains functionally unreviewed by any major Western outlet",
      ],
      s3: "The roots of this taste",
    },
    ja: {
      title: "BatteryNote - 廃棄された寿命の短い3体のロボットを充電し、高電圧スイッチひとつで最期を優しさにするか罰にするかを選ぶSFノベル。制作は個人開発者72studio、発行は京都の小規模インディーroom6。221件のレビューで好評率98%の「非常に好評」ながら、西側メディアにはほぼ触れられていない",
      description: "廃品置き場から拾った壊れかけの3体のロボットを充電し、1体ずつ、対話で記憶をのぞくか、高電圧スイッチを押して反応を楽しむか——彼らに残されたわずかな余生をどう過ごさせるかを決めるSFビジュアルノベル。制作は個人開発者72studio、発行は京都拠点の小規模インディーレーベル room6。221件のレビューで好評率98%の「非常に好評」、英語レビューはまだ約18%に留まる。",
      h1a: "目の前に3体の壊れかけのロボットが座り、二人の間にあるのは充電ケーブルと高電圧スイッチだけ。",
      h1flip: "その最期が会話になるか悲鳴になるかは、あなたがどちらを選ぶかだけで決まる",
      h1b: "。",
      lede: "2025年10月9日にリリースされたSFビジュアルノベル。制作は個人開発者72studio(愛称「ななにい」)、発行は京都拠点の独立系インディーパブリッシャー room6。Steam自身の表記によれば、あなたはコールドスリープから目を覚ました「メカニックくずれ」で、薄暗いガレージのなか、壊れかけの3体のロボットを1体ずつ、制限時間内に充電して呼び戻す。対話によって記憶をのぞいてもよいし、高電圧を流して反応を楽しんでもよい——彼らのバッテリーの寿命はあとわずかで、どう扱うかによって彼らの運命とゲームのエンディングが変わっていく。日本のゲームメディアHARF-WAYの取材に対し、72studioは本作の核は彼らを壊すことではなくキャラクターを好きになってもらうことにあると述べ、「看取りのようなゲーム」と形容している。221件のレビュー(好評218件・不評3件)で好評率98%の「非常に好評」。¥1,372の有料タイトルで無料ではなく、アーリーアクセスではなく正式リリース済み、Steam実績あり、AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上は性的な要素もない。日本語・英語・簡体字/繁体字中国語・韓国語に対応するが、221件のうち約40件、18.1%程度がすでに英語レビューである一方、西側への到達は薄いままだ——Metacriticの批評家レビューは「まだ利用不可」、OpenCriticにはページ自体が存在せず、Kotakuの専用ページは実記事を含まない自動生成ハブページで、見つかった西側の言及はTime ExtensionとNoisy Pixelの2件のニュース記事のみ、いずれもレビューではない。",
      s1: "まず、その一点の感覚",
      feeling: [
        "Steam自身の表記によれば、このゲームの核はたった一つのスイッチに集約される——充電して対話し記憶をのぞくか、高電圧を流して反応を楽しむか。どちらにせよ死にゆく相手に向けて下すその選択のひとつひとつに、最期の過ごし方を握る小さくも絶対的な権力が宿る。",
        "72studio本人はこのフックの本質を「破壊」ではなく「好奇心」だとHARF-WAYの取材で語っている——人外キャラとコミュニケーションを重ねて好きになることこそ自分の「癖」なのだと。だから高電圧スイッチは処刑ボタンというより、すでに好きになった相手にちょっかいを掛けたくなる衝動に近く、それでも最後には自分でその境界線を決めることになる。",
        "ダイナーのウェイターロボット「ジェシカ」、オフィス監視ロボット「サーベリー」、戦闘ロボット「デバインドR7」——3体はいずれも、あなたが見つける前にすでに「壊れている」か「危険」だと判定され廃棄されていた。だから交わす一言一言が、なぜ彼らが捨てられたのか、その判定は本当に正しかったのかを掘り起こす作業にもなる。",
      ],
      s2: "こういう人に刺さる",
      good: [
        "壊れかけで死にゆく脆いものに対して、絶対的で日常的な権力を握るという、道徳的に重いSFビジュアルノベルが欲しい人——充電ケーブルと高電圧スイッチだけでそれを語る",
        "小規模パブリッシャー経由でSteamへ届いた、日本の個人発プロダクションが欲しい人——72studioの一人称の趣味プロジェクトを、大手企業との資本関係が確認されない社員28名の京都インディーレーベル room6 が発行した一本",
        "西側メディアにほとんど触れられていない「非常に好評」タイトル(221件のレビューで98%)を掴みたい人——Metacriticの批評家レビューはまだ無く、OpenCriticにはページすら無く、英語圏の言及は2件のニュース記事のみでレビューではない",
      ],
      bad: [
        "長時間のボリュームや多数の登場人物が欲しい人——本作は3体のロボットとひとつのスイッチを軸にした短時間のビジュアルノベルで、戦闘や探索は無い",
        "西側の批評家にすでに評価された作品が欲しい人——AI生成アセットはなく、Steam自身のコンテンツディスクリプタ上性的な要素もないが、無料ではない有料タイトルでアーリーアクセスではなく正式リリース済みであり、いまだ西側の大手メディアには実質的にレビューされていない",
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
  // 原点 Ghost Trick: Phantom Detective(ゴーストトリック), Capcom(巧舟 ディレクション), 2010(Nintendo DS)。
  // 記憶を失った幽霊が世界の「物」に乗り移って操り、人が死ぬ直前へ巻き戻って物理世界を曲げ、制限時間の
  // なかで人の運命を変える。「幽霊が生者の世界に干渉して運命を書き換える」味の原点。2023 Steam リマスター
  // 版あり(app 1967430)→ steam で同定(established 側と /app/1967430/ で完全一致・href 破損回避)。
  "ghost-trick": {
    steam: "1967430",
    blurb: {
      en: "Ghost Trick: Phantom Detective is a puzzle adventure game directed by Shu Takumi and developed and published by Capcom, originally released for the Nintendo DS in 2010 and remastered on Steam and other platforms in 2023. The player is a spirit who has lost his memories on the night of his death and can possess and manipulate objects in the world, rewinding to the four minutes before a person dies to alter the chain of events and change their fate. By binding a ghost's interference in the physical world to a countdown that rewrites how someone dies, it is a defining origin of the lineage of games where a spirit reaches into the living world to bend fate.",
      ja: "ゴーストトリック（Ghost Trick: Phantom Detective）は、巧舟がディレクションし、カプコンが開発・販売したパズルアドベンチャーで、2010年にニンテンドーDS向けに発売され、2023年にSteamほかでリマスター版が出た。プレイヤーは、死んだ夜に記憶を失った幽霊となり、世界の「物」に乗り移って操り、人が死ぬ直前の四分間へ巻き戻って出来事の連鎖を変え、その運命を変えていく。幽霊が物理世界に干渉することを、人の死に方を書き換える制限時間と結びつけたこの仕組みにより、「死者の魂が生者の世界に手を伸ばし、運命を曲げる」ゲーム群の系譜を定義した原点である。",
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
  // 原点 メトロイド(Metroid), 任天堂開発第一部(R&D1) / インテリジェントシステムズ, 1986(ファミコン ディスク
  // システム)。惑星ゼーベスの地下に広がる、ひと続きにつながった一枚マップを、パワーアップや装備で「ゲート」を
  // 開きながら非線形に探索し、能力の獲得で進行をゲートする——のちに「メトロイドヴァニア」と名づけられるジャンルの
  // 始祖。任天堂専有タイトルで公式 Steam 版なし → wikidata QID(Q2530723)で同定(Steam id を捏造しない・
  // twilight-syndrome 型 href 破損の回避)。established 側と wikidata URL の完全一致で逆引き成立。
  "metroid": {
    wikidata: "https://www.wikidata.org/wiki/Q2530723",
    blurb: {
      en: "Metroid is an action-adventure game developed by Nintendo R&D1 with Intelligent Systems and published by Nintendo, first released for the Family Computer Disk System in Japan in 1986. Casting the player as the bounty hunter Samus Aran exploring the sprawling, interconnected subterranean world of the planet Zebes, it is built on non-linear exploration gated by ability: you find power-ups and equipment that open paths once out of reach, doubling back through a single connected map as your growing kit unlocks it. By fusing open exploration with ability-gated progression, it is the founding origin of the genre later named Metroidvania, the lineage of games where a single interconnected world opens up as your abilities grow.",
      ja: "メトロイドは、任天堂開発第一部(R&D1)がインテリジェントシステムズと共に開発し、任天堂が販売したアクションアドベンチャーで、1986年にファミリーコンピュータ ディスクシステム向けに日本で初めて発売された。プレイヤーはバウンティハンター・サムス・アランとなり、惑星ゼーベスの地下に広がる、入り組んでひと続きにつながった世界を探索する。核にあるのは、能力でゲートされた非線形の探索だ——パワーアップや装備を手に入れることで、かつて手の届かなかった道が開き、ひと続きの一枚マップを、増えていく装備で何度も引き返しながら攻略していく。開かれた探索と、能力で進行をゲートする設計を融合させた本作は、のちに『メトロイドヴァニア』と名づけられるジャンル——一つのひと続きの世界が、能力の成長とともに開かれていくゲーム群の系譜——の始祖となった原点である。",
    },
  },
  // 原点 悪魔城ドラキュラ(Castlevania), コナミ, 1986(ファミコン ディスクシステム)。鞭とサブウェポンを手に、
  // ヴァンパイアハンター・シモンがドラキュラの城をステージごとに登攀する——ゴシックホラー・アクションの型を築き、
  // シリーズの進化の中でそのゴシックアクションを能力ゲートされたひと続きの城の探索と融合させ、「メトロイドヴァニア」の
  // 「ヴァニア」側を生んだ系譜の礎。1986 年の原作に単独の公式 Steam 版なし → wikidata QID(Q1043375)で同定
  // (Steam id を捏造しない・href 破損の回避)。established 側と wikidata URL(Q1043375)の完全一致で逆引き成立。
  "castlevania": {
    wikidata: "https://www.wikidata.org/wiki/Q1043375",
    blurb: {
      en: "Castlevania is an action game developed and published by Konami, first released for the Family Computer Disk System in Japan in 1986. Casting the player as the vampire hunter Simon Belmont fighting through Dracula's castle with a whip and an arsenal of sub-weapons, it set a gothic-horror action template of stage-by-stage ascent against classic monster bosses, and as the series evolved it fused that gothic action with a single interconnected, ability-gated castle to explore, giving the later genre name Metroidvania its vania half. It is a foundational origin of the gothic action and gothic-Metroidvania lineage, the taste of exploring a monster-haunted castle that opens up as your powers grow. There is no official standalone Steam release of the original 1986 game; the origin is anchored to its Wikidata entry.",
      ja: "悪魔城ドラキュラ(英題 Castlevania)は、コナミが開発・販売したアクションゲームで、1986年に日本でファミリーコンピュータ ディスクシステム向けに初めて発売された。プレイヤーはヴァンパイアハンター、シモン・ベルモンドとなり、鞭とさまざまなサブウェポンを手に、ドラキュラの城を突き進む。定番の怪物ボスに挑みながらステージを一つずつ登っていく、ゴシックホラー・アクションの型を築いた作品であり、シリーズが進化する中で、そのゴシックアクションを、能力でゲートされたひと続きの城の探索と融合させ、のちの『メトロイドヴァニア』というジャンル名の『ヴァニア』の側を生み出した。怪物の潜む城が、力の成長とともに開かれていく——そのゴシックアクション、そしてゴシック・メトロイドヴァニアの系譜の礎となった原点である。1986年の原作に単独の公式 Steam 版は存在せず、原点は Wikidata のエントリで同定する。",
    },
  },
  // 原点 ウルトラマン(Ultraman), 円谷英二 / 円谷プロダクション, 1966(特撮 TV シリーズ・『ウルトラQ』に続く第2作)。
  // 都市ほどもある巨大怪獣が国を脅かし、最前線で人間の特捜隊と巨大ヒーローがそれに立ち向かう——「巨大怪獣防衛」の
  // 物語を結晶化させた、和製巨大怪獣防衛フィクションの系譜の原点。これは ULTRA0 への権利主張ではなく、「最前線で
  // 巨大怪獣と向き合う」という味=ジャンルの原点という意味(同人作 ULTRA0 は公式ウルトラマン作品ではない)。1966 年の
  // TV シリーズに公式 Steam 版なし → wikidata QID(Q1058534)で同定(Steam id を捏造しない・href 破損の回避)。
  // established 側と wikidata URL の完全一致で逆引き成立(lineageName の Wikidata 同定)。
  "ultraman": {
    wikidata: "https://www.wikidata.org/wiki/Q1058534",
    blurb: {
      en: "Ultraman is a Japanese tokusatsu (special-effects) television series created by Eiji Tsuburaya and produced by Tsuburaya Productions, first broadcast in 1966 as the show that followed Ultra Q. It set a giant silver-and-red hero against a procession of city-sized kaiju, defended by a human special-attack team that fought the monsters on the front line, and it crystallized the kaiju-defense story: ordinary people standing against giant monsters that threaten a nation, and the figure who rises to fight them. It is the origin of the giant-kaiju-defense lineage in Japanese fiction, the taste of facing colossal monsters at the front line. It is the root of a taste, not a claim of license over any later or fan-made work.",
      ja: "ウルトラマンは、円谷英二が生み出し円谷プロダクションが製作した日本の特撮テレビシリーズで、『ウルトラQ』に続く作品として1966年に放送が始まった。銀と赤の巨大なヒーローを、都市ほどもある怪獣の群れと対峙させ、最前線で怪獣に立ち向かう人間の特捜隊がそれを支える——この構図によって、「巨大な怪獣が国を脅かし、それに立ち向かう者が現れる」怪獣防衛の物語を結晶化させた。日本のフィクションにおける巨大怪獣防衛の系譜——最前線で巨大な怪獣と向き合うという味——の原点である。これは味の原点という意味であり、後続作品や同人作への権利を主張するものではない。",
    },
  },
  // 原点 Super Meat Boy, Team Meat(Edmund McMillen / Tommy Refenes), 2010。ノコギリと罠で埋め尽くされた
  // 超精密なコースを、生きた肉の塊で駆け抜け、即死→瞬時リスタートを繰り返す——「何度死んでも、もう一回」の
  // ダイ&リトライ精密プラットフォーマーを結晶化させ広く知らしめた原点。PC 公式 Steam 版あり(app 40800)
  // → steam で同定(established 側と /app/40800/ で完全一致・href 破損回避・wikidata Q1784048 実体確認済み)。
  "super-meat-boy": {
    steam: "40800",
    blurb: {
      en: "Super Meat Boy is a platformer developed by Team Meat, the two-person studio of Edmund McMillen and Tommy Refenes, and released in 2010. You play a small cube of living meat racing through hyper-precise gauntlets of saw blades and hazards to rescue Bandage Girl, dying instantly at the smallest mistake and respawning at once, fast enough that death becomes just another attempt. By fusing merciless, pixel-tight platforming with instant restarts, it crystallized and popularized the modern die-and-retry precision platformer, and is the origin of the lineage where the whole loop is failing, learning, and hurling yourself at the same jump one more time.",
      ja: "Super Meat Boy は、Edmund McMillen と Tommy Refenes の2人組スタジオ Team Meat が開発し、2010年に発売したプラットフォーマーである。プレイヤーは小さな生きた肉の塊となり、ノコギリの刃と罠で埋め尽くされた超精密なコースを駆け抜け、包帯少女（Bandage Girl）を救い出す——ほんの小さなミスで即死し、すぐさま復活する。その復活があまりに速いため、死は次の一回の挑戦にすぎなくなる。容赦のないピクセル単位のプラットフォーミングと、瞬時のリスタートを融合させたことで、現代のダイ&リトライ型・精密プラットフォーマーを結晶化させ広く知らしめた。失敗し、学び、同じ跳躍へ「もう一回」身を投げる——そのループの全てを核にしたゲーム群の系譜の原点である。",
    },
  },
  // 原点 ファイナルファンタジーV(Final Fantasy V), スクウェア, 1992(スーパーファミコン)。パーティが
  // 数多のジョブを自由に切り替え、各ジョブからアビリティを習得し、ジョブをまたいで持ち越して自分だけの
  // キャラクターを組み上げる——「ジョブシステム」を結晶化させ、「パーティを自由に編成して組み上げる」RPGの
  // 系譜の原点となった作品。現行入手可能な参照点は FF ピクセルリマスター版 Steam(app 1173810)→ steam で
  // 同定(established 側と /app/1173810/ で完全一致・href 破損回避・wikidata Q900305 実体確認済み)。
  "final-fantasy-v": {
    steam: "1173810",
    blurb: {
      en: "Final Fantasy V is the fifth entry in Square's role-playing series, released for the Super Famicom in Japan in 1992. It is widely credited with crystallizing the Job System: the player's party freely switches among a large roster of jobs, learns abilities from each one, and carries those abilities across jobs to assemble custom characters, making the deliberate composition of a party the core of play. By turning free, reassignable class composition into the heart of an RPG, it became a defining origin of the build-your-party job-system lineage. The original 1992 game is anchored to its Pixel Remaster Steam release.",
      ja: "ファイナルファンタジーVは、スクウェアのロールプレイングシリーズ第5作で、1992年に日本でスーパーファミコン向けに発売された。「ジョブシステム」を結晶化させた作品として広く評価されている——プレイヤーのパーティは数多くのジョブを自由に切り替え、それぞれからアビリティを習得し、ジョブをまたいでそのアビリティを持ち越すことで、自分だけのキャラクターを組み上げる。パーティを意図して編成すること、それ自体を遊びの核に据えた。自由に組み替えられるクラス編成をRPGの中心に据えたことで、「パーティを組み上げる」ジョブシステムの系譜を定義づけた原点となった。1992年の原作は、そのピクセルリマスター版の Steam ページで同定する。",
    },
  },
  // 原点 銀河鉄道の夜(Night on the Galactic Railroad), 宮沢賢治, 1934(没後発表・未完)。孤独な少年ジョバンニが
  // 天の川を走る不思議な列車に乗り、夢のように移ろう駅や風景を巡りながら、死・自己犠牲・「ほんとうの幸い」への
  // 問いへ静かに向かう。星空の下、非現実的に移ろう世界を巡る「夜の旅」が生と死の瞑想になる——その詩的な系譜の原点。
  // 小説にゲーム版はなく公式 Steam 版なし → wikidata QID(Q1524969)で同定(Steam id を捏造しない・href 破損の回避)。
  // established 側と wikidata URL(Q1524969)の完全一致で逆引き成立(lineageName の Wikidata 同定)。
  "night-on-the-galactic-railroad": {
    wikidata: "https://www.wikidata.org/wiki/Q1524969",
    blurb: {
      en: "Night on the Galactic Railroad is a novel by the Japanese author and poet Kenji Miyazawa, left unfinished at his death and published posthumously in 1934. A lonely boy, Giovanni, boards a mysterious train that runs through the night sky along the Milky Way and travels with his friend Campanella past strange, dreamlike stations and landscapes, while the journey turns quietly toward death, sacrifice, and the search for true happiness. One of the most beloved works of modern Japanese literature, it crystallized a distinctly poetic kind of night voyage, a passage through unreal, shifting worlds under the stars that becomes a meditation on life and death. It is the origin of that lineage: dreamlike nocturnal journeys through otherworldly places that drift toward the questions at the edge of living. There is no game version of the 1934 novel; the origin is anchored to its Wikidata entry.",
      ja: "銀河鉄道の夜は、日本の作家・詩人、宮沢賢治の小説で、賢治の没後、未完のまま遺され、1934年に発表された。孤独な少年ジョバンニが、天の川に沿って夜空を走る不思議な列車に乗り込み、友人のカムパネルラとともに、夢のように移り変わる駅や風景を巡っていく——その旅は、やがて静かに、死や、自己犠牲や、「ほんとうの幸い」とは何かという問いへと向かっていく。近代日本文学のなかでも最も広く愛された作品の一つであり、星空の下、非現実的に移ろう世界を巡る旅が、そのまま生と死をめぐる瞑想になる——その詩的な「夜の旅」を結晶化させた。夢のように移ろう異世界を巡り、生の際にある問いへと漂い向かう、その系譜の原点である。1934年の小説にゲーム版は存在せず、原点は Wikidata のエントリで同定する。",
    },
  },
  // 原点 The Misadventures of P.B. Winterbottom, The Odd Gentlemen / 2K, 2010。無音・手描きの世界で、
  // 主人公が自分自身を録画し、その録画を再生して「過去の自分たち」を並走させ、協力・競争・妨害しながら
  // 80 以上のパズルを解く。「自分の動きを録画して再生し、過去の自分のコピーを解答の相棒にする」——録画と
  // 再生の協調パズルの系譜の原点。Steam 版あり(app 40930)→ steam で同定(established 側と /app/40930/ で
  // 完全一致・href 破損回避・wikidata Q2087449 実体確認済み)。
  "pb-winterbottom": {
    steam: "40930",
    blurb: {
      en: "The Misadventures of P.B. Winterbottom is a puzzle platformer developed by The Odd Gentlemen and published by 2K, released in April 2010. In a macabre, silent, hand-drawn world in pursuit of a mysterious pie, the player records Winterbottom's own motion and replays those recordings so that past selves act alongside him, and you cooperate with, compete against, and obstruct your own recorded clones across more than eighty puzzles. By turning a copy of your own past movement into the partner you build each solution from, it is a defining origin of the record-and-playback cooperative puzzle, the lineage of games where you solve space by playing back your own recorded self.",
      ja: "The Misadventures of P.B. Winterbottom は、The Odd Gentlemen が開発し 2K が販売したパズルプラットフォーマーで、2010年4月に発売された。不気味で無音の、手描きの世界。謎めいたパイを追い求めるなかで、プレイヤーはウィンターボトム自身の動きを録画し、その録画を再生して、過去の自分たちを本人のかたわらで動かす——録画された自分のクローンと協力し、競い合い、ときに邪魔をしながら、80を超えるパズルを解いていく。自分の過去の動きのコピーを、解答を組み立てるための相棒に変えるこの仕組みにより、「録画した自分自身を再生して空間を解く」——録画と再生の協調パズルの系譜を定義した原点である。",
    },
  },
  // 原点 Game Dev Story(ゲーム発展途上国), Kairosoft, 1997。ゲーム開発会社を経営する経営/タイクーン型
  //   シミュレーションの祖。限られた情報から判断を下し、架空のゲーム業界の歴史の中で一つの事業を舵取りする、
  //   カイロソフト型ドット絵経営シムの原点。2010 スマートフォン版で世界的に普及。Steam 版あり(app 1847240)
  //   → steam で同定(established 側と /app/1847240/ で完全一致・href 破損回避)。
  "game-dev-story": {
    steam: "1847240",
    blurb: {
      en: "Game Dev Story is a business management and tycoon simulation developed and published by Kairosoft, originally released in 1997 and brought worldwide by its 2010 smartphone version. The player runs a game development company: you hire and grow staff, choose a genre and type for each new title, develop and release games, and manage budget, hardware trends, and reputation across years of a fictional game industry, making decisions from limited information and watching the numbers accumulate. As the work that crystallized Kairosoft's signature pixel-art management sim, it is a defining origin of the lineage of games about steering a single business through the game industry's own history. The original is anchored here to its Steam release.",
      ja: "ゲーム発展途上国(Game Dev Story)は、カイロソフトが開発・販売した経営・タイクーン型のシミュレーションで、1997年に発売され、2010年のスマートフォン版で世界的に広まった。プレイヤーはゲーム開発会社を経営する——スタッフを雇って育て、新作ごとにジャンルとタイプを選び、ゲームを開発して発売し、予算やハードの流行、評判を、架空のゲーム業界の何年もの歳月にわたって管理していく。限られた情報から判断を下し、積み上がっていく数字を見守る。カイロソフトを代表するドット絵経営シムを結晶化させた作品として、「一つの事業を、ゲーム業界そのものの歴史の中で舵取りする」ゲーム群の系譜を定義した原点である。原作は、その Steam ページで同定する。",
    },
  },
  // 原点 Crayon Physics Deluxe(2009), Petri Purho(フィンランドの独立系デザイナー)。2Dキャンバスにクレヨンで
  //   形を描くと、描いたものすべてが重力・物理に従う固いオブジェクトになり、ボールを星まで導く——「形を描いて、
  //   あとは物理に解かせる」ドロー物理パズルを結晶化させ広く知らしめた原点。IGF シューマス・マクナリー大賞。
  //   Steam 版あり(app 26900)→ steam で同定(established 側と /app/26900/ で完全一致・href 破損回避)。
  "crayon-physics-deluxe": {
    steam: "26900",
    blurb: {
      en: "Crayon Physics Deluxe is a physics-based puzzle game created by the Finnish independent designer Petri Purho and released in 2009. The player draws shapes with a crayon on a 2D canvas, and everything drawn instantly becomes a solid object that obeys gravity and physics, so guiding a ball to a star means sketching ramps, levers, pendulums, and weights and letting the simulation carry them out. Winner of the Seumas McNally Grand Prize at the Independent Games Festival, it crystallized and popularized the draw-a-shape-and-let-physics-solve-it puzzle and is a defining origin of the hand-drawn physics puzzle lineage.",
      ja: "Crayon Physics Deluxe は、フィンランドの独立系デザイナー Petri Purho が制作し、2009年に発売した物理演算パズルゲームである。プレイヤーは2Dのキャンバスにクレヨンで形を描き、描いたものはすべて、その瞬間に重力と物理に従う固いオブジェクトになる。ボールを星まで導くには、坂やてこ、振り子、重りを描き、あとはシミュレーションに委ねればよい。インディペンデント・ゲームズ・フェスティバルでシューマス・マクナリー大賞を受賞し、「形を描いて、あとは物理に解かせる」パズルを結晶化させ広く知らしめた、手描き物理パズルの系譜を定義する原点である。",
    },
  },
  // 原点 Only Up!(2023), SCKR Games。垂直に積み上がった浮遊物の塔をひたすら上へ登る 3D プラットフォーマー。
  //   チェックポイントが無く、一度の踏み外しで遥か下まで落ち、積み上げた高さが一瞬で失われる——「落ちる恐怖と、
  //   稼いだ高さを失う緊張」を核に、上へ登ることだけを目標にした ascension/climbing プラットフォーマーを結晶化し
  //   広く知らしめた原点。2023 年に配信直後から配信者を中心に爆発的に流行したが、後に Steam から delist され現在
  //   購入不可 → Steam id を積まない(delist 済みリンクは href 破損)。wikidata QID(Q119626229・label「Only Up!」/
  //   「2023 video game」実測確認済み)で同定する(Steam id を捏造しない・twilight-syndrome 型 href 破損の回避)。
  //   established 側と wikidata URL(Q119626229)の完全一致で逆引き成立(lineageName の Wikidata 同定)。
  "only-up": {
    wikidata: "https://www.wikidata.org/wiki/Q119626229",
    blurb: {
      en: "Only Up! is a 3D climbing platformer developed by SCKR Games and released on Steam in 2023. The player climbs ever upward across a towering, surreal stack of floating platforms and debris, and because there are no checkpoints, a single misstep can send you plummeting far back down and undo long stretches of hard-won height in an instant. Built so that the whole tension is the fear of falling and losing progress, with the only goal being to keep going up, it became a viral streaming phenomenon in 2023 and crystallized and popularized the ascension climbing platformer, the lineage where the entire game is the climb and one fall can cost you everything. It was later delisted from Steam, so its origin is anchored to its Wikidata entry rather than a store page.",
      ja: "Only Up!(上がるのみ!)は、SCKR Games が開発し2023年に Steam で配信された3Dのクライミング・プラットフォーマーである。プレイヤーは、垂直にそびえ立つ、浮遊する足場と瓦礫の塔を、ひたすら上へと登っていく——そしてチェックポイントが存在しないため、たった一度の踏み外しで遥か下まで落ち、苦労して稼いだ高さが一瞬にして失われることがある。ゲームの緊張のすべてを「落ちる恐怖」と「積み上げた高さを失うこと」に置き、ただ上へ登り続けることだけを目標に据えた設計により、2023年に配信を中心として爆発的に流行し、上昇（ascension）型のクライミング・プラットフォーマーを結晶化させ広く知らしめた。ゲームのすべてが「登ること」であり、一度の落下で何もかもを失いかねない——その系譜の原点である。のちに Steam から配信停止（delist）されたため、その原点は Steam のストアページではなく Wikidata のエントリで同定する。",
    },
  },
  // 原点 スーパーマリオブラザーズ(Super Mario Bros.), 任天堂, 1985(ファミリーコンピュータ/NES)。横スクロールで
  //   走り・跳び・敵を踏み・パワーアップで能力を変え、各コース終端のゴールを目指す——「走り、跳び、踏み、ゴールへ
  //   到達する」横スクロール・アクションプラットフォーマーを結晶化させ広く知らしめた原点。1985年の原作に Steam 版は
  //   無い → wikidata QID(Q11168・label「Super Mario Bros.」/「1985 platform video game」実測確認済み)で同定する
  //   (Steam id を捏造しない・href 破損の回避)。established 側は wikidata URL(Q11168)完全一致で逆引き成立し、公式
  //   参照点として Wikipedia を homepage 併記(gameUrl フォールバックで href 破損回避)。
  "super-mario-bros": {
    wikidata: "https://www.wikidata.org/wiki/Q11168",
    blurb: {
      en: "Super Mario Bros. is a side-scrolling platformer developed and published by Nintendo, released for the Family Computer in Japan in 1985 and worldwide on the NES. The player runs and jumps through side-scrolling stages, stomping enemies, gathering power-ups that change the hero's abilities, and racing to a goal at the end of each course, with fortress boss encounters along the way. As the game that crystallized and popularized the side-scrolling action platformer, it is one of the most influential video games ever made and the foundational origin of the run-jump-stomp-and-reach-the-goal platformer lineage. The 1985 game has no Steam release, so its origin is anchored to its Wikidata entry.",
      ja: "スーパーマリオブラザーズは、任天堂が開発・発売した横スクロールのプラットフォーマーで、1985年に日本でファミリーコンピュータ向けに、そして世界では NES 向けに発売された。プレイヤーは横スクロールのステージを走り、跳び、敵を踏みつけ、主人公の能力を変えるパワーアップを拾い、各コースの終端にあるゴールを目指す——道中には砦のボスも待ち受ける。横スクロール・アクションプラットフォーマーを結晶化させ広く知らしめた作品として、史上最も影響力の大きいビデオゲームの一つであり、「走り、跳び、敵を踏み、ゴールを目指す」プラットフォーマーの系譜の礎となる原点である。1985年の原作に Steam 版は存在せず、その原点は Wikidata のエントリで同定する。",
    },
  },
  // 原点 Loop Hero(2021), Four Quarters 開発 / Devolver Digital 販売。地図を歩かず、戦闘も直接操作しない——
  //   主人公は周回する道を自動で進み、プレイヤーは地形・建物・敵のカードをその周回に沿って配置するだけ。
  //   自ら組んだ構造(周回)が勝手に進行していく、というローグライクの発想を結晶化させた原点。appdetails
  //   (developers/publishers/release_date)を実測確認済み(appid 1282730)。Clock Rogue はこの「戦うのではなく
  //   組む周回」を、時計盤上に技を配置し発動タイミングを計る体内時計へ組み直した子孫(lineage_anchor_key=
  //   steam_url で同定)。
  "loop-hero": {
    steam: "1282730",
    blurb: {
      en: "Loop Hero is a roguelike developed by Four Quarters and published by Devolver Digital, released in March 2021. There is no map to explore and no unit for the player to directly command in the fight itself: a hero walks a looping road on autopilot, engaging enemies automatically, while the player's whole task is to place cards, terrain, buildings, and camps, along and around that loop, which both constructs the world it runs through and spawns the enemies and resources within it. As runs progress, loot recovered along the way and camp upgrades built between expeditions carry a player's strength forward into the next attempt. It crystallized the idea of a roguelike where you build the very loop that then plays itself, and is the origin of the lineage of games in which arranging placed effects along an automatic progression, rather than directly controlling the action, is the entire game.",
      ja: "Loop Hero は、Four Quarters が開発し Devolver Digital が販売したローグライクで、2021年3月に発売された。探索するマップは無く、戦闘そのものをプレイヤーが直接操作するユニットも無い——主人公は周回する道を自動で歩き、敵と自動的に交戦する。プレイヤーの仕事はすべて、その周回に沿ってカード——地形・建物・野営地——を配置することにあり、それが同時に主人公の進む世界そのものを構築し、そこに現れる敵とリソースを生み出す。ランを重ねるほど、道中で拾う戦利品や、遠征の合間に積み上げる野営地の強化が、次の挑戦へ向けた強さとして持ち越される。「自ら組んだ周回そのものが、勝手に進行していく」というローグライクの発想を結晶化させた作品であり、直接アクションを操作するのではなく、自動で進む周回に沿って配置した効果を組み立てることがゲームのすべてになる——その系譜の原点である。",
    },
  },
  // 原点 プリンセスメーカー(Princess Maker) シリーズ第1作、ガイナックス制作、1991年発売(Wikipedia 実測確認済み)。
  //   「自分の娘を育てる」という発想を育成シミュレーションのジャンルに導入した作品で、育成シムの系譜の礎となる
  //   原点。Steam 版は Refine(appid 583040・開発 CFK Co., Ltd./販売 Bliss Brain・appdetails 実測確認済み、
  //   原作の監修は生みの親・鮎川たみお(Takami Akai))。既存の "princess-maker-2" anchor(appid 523000・シリーズ
  //   第2作)とは別ゲーム/別 appid のため新規 anchor として区別する。DRAPLINE はこの「一定期間、娘の時間を
  //   スケジューリングし、積み上がった選択が未来を分岐させる」育成シムの核を継ぎ、それをドラゴン娘を1年間・
  //   週単位で鍛えるローグライトへ組み替えた子孫(lineage_anchor_key=steam_url で同定)。
  "princess-maker": {
    steam: "583040",
    blurb: {
      en: "Princess Maker is a raising simulation series produced by Gainax, whose first entry was released in 1991 (the Refine edition, developed by CFK Co., Ltd. and published by Bliss Brain, is the one on Steam). The player becomes the foster father of a young girl, scheduling her days between education, work, and rest across a fixed span of years, while the stats and choices that accumulate branch into one of many possible endings, from royalty to ordinary professions. As the game that introduced the idea of raising your own daughter to the life-simulation genre, it is the foundational origin of the raising-sim lineage.",
      ja: "プリンセスメーカーは、ガイナックスが手掛けた育成シミュレーションシリーズで、その第1作は1991年に発売された(Steam 版は CFK Co., Ltd. が開発し Bliss Brain が販売する Refine 版)。プレイヤーは幼い娘の養父となり、一定期間の年月にわたって教育・仕事・休養へ日々の予定を割り振っていく。積み上がったパラメータと選択は、王侯貴族から市井の職業まで、数多のエンディングのいずれかへ分岐する。「自分の娘を育てる」という発想を育成シミュレーションのジャンルに導入した作品であり、育成シムの系譜の礎となる原点である。",
    },
  },
  // 原点 Hotline Miami(2012), Dennaton Games(Jonatan Söderström / Dennis Wedin)開発 / Devolver Digital 販売。
  //   見下ろし視点で、一撃死ぬプレイヤーがほぼ即座に同じ部屋へ戻され再挑戦する「一撃死・即時再挑戦」ループを
  //   結晶化させ広く知らしめた原点(appid 219150・良く知られた事実として記述)。SONOKUNI はこの一撃死+即時復活の
  //   ループを継ぎ、直截な暴力を attack/parry(盾で弾き返す)/slow(時間減速)の3コアへ組み替えた子孫と、Famitsu
  //   記事(「『ホットラインマイアミ』を彷彿とさせる鮮烈な一撃必死ゲーム」)および海外メディア TheGamer の記事
  //   (「Sonokuni Is Much More Than A Hotline Miami Clone」)の両独立記事タイトルで裏付け
  //   (lineage_anchor_key=steam_url で同定)。
  "hotline-miami": {
    steam: "219150",
    blurb: {
      en: "Hotline Miami is a top-down action game developed by the two-person Swedish studio Dennaton Games (Jonatan Söderström and Dennis Wedin) and published by Devolver Digital, released in October 2012. Set in a lurid, fictionalized 1989 Miami, a masked mercenary follows cryptic answering-machine messages into buildings full of armed criminals, and a single hit kills the player exactly as easily as it kills an enemy, dropping you back into the same room almost instantly to try again. That one-hit-death, instant-restart loop, wrapped in a neon synthwave soundtrack and brutal pixel-art violence, crystallized and popularized the lineage of top-down action games built around dying constantly and restarting without friction.",
      ja: "Hotline Miami は、スウェーデンの2人組スタジオ Dennaton Games(Jonatan Söderström と Dennis Wedin)が開発し、Devolver Digital が販売した見下ろし型アクションで、2012年10月に発売された。毒々しく脚色された1989年のマイアミを舞台に、覆面の殺し屋が留守番電話に残された暗号めいた指示に従い、武装した犯罪者で満ちた建物へ向かう。プレイヤーは敵とまったく同じように一撃で死に、死ぬとほぼ即座に同じ部屋へ戻されて再挑戦する。この「一撃死・即時再挑戦」のループを、ネオンのシンセウェイブ楽曲と暴力的なドット絵表現とともに結晶化させ広く知らしめた作品であり、死に続けては摩擦なく再挑戦する見下ろし型アクションの系譜の原点である。",
    },
  },
  // 原点 MOTHER3, HAL研究所開発 / 任天堂販売, 2006(ゲームボーイアドバンス, 日本のみ・公式英語版なし)。
  //   「サウンドバトル」システム——その戦闘曲のビートに合わせてコマンドを入力するとコンボ攻撃として
  //   繋がる——を核とした、RPGシリーズ「MOTHER」第3作。戦闘曲のビートに入力を同期させることを
  //   コンボ攻撃の発動条件にした、その仕組みの原点。Cento はこの「ビートに合わせて入力する」核を継ぎ、
  //   1本のRPGの戦闘演出だったものを、ランごとに手札のスキルカードとギフト(アーティファクト)を
  //   ドラフトして組むローグライト・デッキビルダーの駆動源そのものへ据え替えた子孫(lineage_anchor_key=
  //   wikidata_qid, Q2383167 で同定)。公式 Steam 版なし → wikidata で同定(Steam id を捏造しない・
  //   twilight-syndrome 型 href 破損の回避)。established 側と wikidata URL の完全一致で逆引き成立。
  "mother-3": {
    wikidata: "https://www.wikidata.org/wiki/Q2383167",
    blurb: {
      en: "MOTHER 3 is a role-playing game developed by HAL Laboratory and published by Nintendo for the Game Boy Advance, released in Japan in April 2006 as the third entry in the Mother series. Its signature Sound Battle system turns ordinary turn-based combat into a rhythm exercise: pressing a skill's command in time with the beat of that battle's own music chains consecutive hits together into a combo, so landing the bigger hit is a matter of feeling the beat, not only choosing the right command. It has never received an official English localization. By binding a combo's success to the beat of its own soundtrack, it is the origin of the lineage of games that turn rhythmic, on-beat input into the trigger for a combo attack.",
      ja: "MOTHER3 は、HAL研究所が開発し任天堂が販売したロールプレイングゲームで、2006年にゲームボーイアドバンス向けに日本で発売された、「MOTHER」シリーズ第3作である。象徴的な「サウンドバトル」システムは、通常のターン制戦闘をリズムの試練に変える——技のコマンドを、その戦闘曲自身のビートに合わせて入力すると、一撃一撃がコンボとして繋がっていく。大きな一撃を決めるのは、正しいコマンドを選ぶことだけでなく、そのビートを感じ取ることだ。公式の英語ローカライズは行われていない。コンボの成否を、自らのサウンドトラックのビートと結びつけたことで、リズムに乗せたオンビートの入力をコンボ攻撃の引き金にする、そのゲーム群の系譜の原点である。",
    },
  },
  // 原点 アイアイ喫茶店 自身(自己起源・appid 3847100)。開発・販売は麺屋すぱいす東京支店による自社セルフ
  //   パブリッシュ。1周5分・注文がそのまま合言葉になる・複数のバッドエンドを経てトゥルーエンドへ至る短時間
  //   周回×マルチエンドのミステリーADV形式に、先行するフリーゲーム/ゲームジャム版が無いか捜索したが
  //   見つからなかった。4Gamerが報じた同サークルのデベロッパーページによれば、次回作として発表済みの
  //   「ナカノ人格移植研究所」(2026年発表)がこの同じ形式を継ぐことが確認できるため、本作自身をこの
  //   開発者自身の系譜の原点として新規 anchor 化する(lineage_anchor_key=steam_url, appid 3847100 =
  //   本作自身・自己参照の self-anchor。既存 established を持つ他の anchor とは異なる新パターン)。
  "aiai-kissaten": {
    steam: "3847100",
    blurb: {
      en: "Aiai Kissaten is a five-minute-loop, multiple-ending mystery adventure released in August 2025 by the Japanese doujin circle Menya Spice Tokyo Branch, who developed, published, and exhibited it entirely on their own. Set in a small coffee shop, it turns something as ordinary as an order for iced coffee into the 'password' that leads the player into a back room, branching the story from there; reaching the one true ending that resolves the shop's mystery in full requires working through a series of bad endings first, each surrendering a piece of the truth, with Steam achievements tracking that progress across replays. An extensive search turned up no earlier freeware or game-jam version behind this exact format, and per the circle's own developer page as reported by 4Gamer, their next announced project, Nakano Jinkaku Ishoku Kenkyuujo, carries the same short-loop, multi-ending mystery ADV format forward, making Aiai Kissaten the origin of that lineage within this developer's own work.",
      ja: "アイアイ喫茶店は、日本の同人サークル 麺屋すぱいす東京支店 が、開発・販売・出展のすべてを自分たちだけで手がけ、2025年8月に発売した、1周約5分のマルチエンド・ミステリーアドベンチャーだ。舞台は小さな喫茶店——「アイスコーヒー」を頼むような何気ない注文が、そのまま奥の部屋へ通される「合言葉」に変わり、そこから物語が分岐していく。店の謎をすべて解き明かす唯一の「トゥルーエンド」へ辿り着くには、まず複数のバッドエンドを経る必要があり、そのどれもが真相の断片を一つずつ手渡してくれる。周回を重ねる進捗はSteam実績が記録する。この形式にそれ以前のフリーゲーム版やゲームジャム版があったかを捜索したが、見つからなかった。4Gamerが報じた同サークルのデベロッパーページによれば、次回作として発表済みの「ナカノ人格移植研究所」は、この同じ短時間周回×マルチエンドのミステリーADV形式を引き継いでおり、アイアイ喫茶店は、この開発者自身の系譜における、その原点である。",
    },
  },
  // 原点 Snipperclips: Cut It Out, Together!(2017), イギリスのスタジオ SFB Games 開発(追加開発に
  //   Nintendo Software Technology が参加)/ 任天堂発売。Nintendo Switch のローンチタイトルとして世界同時
  //   発売(Wikipedia/Wikidata 実測確認済み)。「違う形の2キャラを1つの道具として使い、変形そのもので
  //   パズルを解く」協力パズルを結晶化させた原点。1本のキャラの体を切り取って変形させる代わりに、
  //   Chippy & Noppo はその変形の対象を工場のパーツへ据え替えた子孫(lineage_anchor_key=wikidata_qid,
  //   Q28312055 で同定)。公式 Steam 版なし(Nintendo Switch 専用)→ wikidata で同定(Steam id を捏造しない・
  //   twilight-syndrome 型 href 破損の回避)。established 側と wikidata URL の完全一致で逆引き成立。
  "snipperclips": {
    wikidata: "https://www.wikidata.org/wiki/Q28312055",
    blurb: {
      en: "Snipperclips: Cut It Out, Together! is a puzzle game developed by the British studio SFB Games, with additional work by Nintendo Software Technology, and published by Nintendo, released worldwide as a Nintendo Switch launch title on March 3, 2017. Its two characters, Snip and Clip, are each shaped like a distinct cardboard-cutout silhouette, and its signature 'snipping' mechanic lets one character cut a piece out of the other's body, reshaping them into whatever tool-like form, a hook, a wedge, a key, the current puzzle calls for, whether that means catching a falling object, cutting a rope, or fitting through a gap; it can be played solo, switching between the two shapes, or cooperatively with a second player controlling the other. By making the act of physically reshaping a character, together, the core of how a puzzle is solved, it is the origin of the lineage of games in which two characters with different traits become one shared tool through deliberate transformation.",
      ja: "いっしょにチョキッと スニッパーズ(英題: Snipperclips - Cut It Out, Together!)は、イギリスのゲーム開発会社 SFB Games が開発(追加開発に Nintendo Software Technology が参加)し、任天堂が発売したパズルゲームで、2017年3月3日、Nintendo Switchのローンチタイトルとして世界同時発売された。登場する2人のキャラクター、スニップとクリップは、それぞれ紙を切り抜いたような固有のシルエットを持ち、代表的な「チョキッと」システムでは、一方がもう一方の体を切り取り、フック・くさび・鍵など、いまのパズルが必要とする形へと作り変えられる——落ちてくる物を受け止めたり、ロープを切ったり、隙間をくぐり抜けたりするために。1人では2つの形を切り替えながら、2人では1人がもう一方を操作して協力プレイできる。キャラクターを物理的に、しかも2人がかりで作り変えることそのものをパズルを解く核に据えたことで、違う特性を持つ2キャラが、意図的な変形を通して1つの道具になる——その系譜の原点である。",
    },
  },
  // 原点候補(開発者未確認) Puzznic(パズニック), タイトー開発・販売, 1989(アーケード)。ブロックが軸に
  //   固定されてスライドし、同じ面同士を接触させて消す仕組みの原点。SINGOU BREAKA の「シグナルブロック」
  //   (縦向きは縦方向のみ・横向きは横方向のみへスライド)が最も色濃く受け継ぐ核だが、「衝撃で隣接
  //   ブロックの色が反転し連鎖する」独自要素は開発者オリジナルで、開発者本人からの直接的な言明は
  //   確認できていない(lineage_anchor_key=wikidata_qid, Q2182742 で同定。Wikidata実測: label="Puzznic",
  //   developer=Taito, 公開1989年)。公式 Steam 版は確認できず → wikidata で同定(Steam id を捏造しない・
  //   twilight-syndrome 型 href 破損の回避)。established 側と wikidata URL の完全一致で逆引き成立。
  "puzznic": {
    wikidata: "https://www.wikidata.org/wiki/Q2182742",
    blurb: {
      en: "Puzznic is an arcade puzzle game developed and published by Taito, released in 1989 and later ported to home systems including the NES, Game Boy, Sega Genesis, and Amiga. Each block sits fixed to a single axis, some sliding only left and right, others only up and down, and a stage clears when the player slides two or more blocks that share the same face into direct contact, making them vanish, all within a limited number of moves per stage. That core, blocks locked to one axis of slide, cleared by matching same faces into contact, is a likely, though not developer-confirmed, root of games like SINGOU BREAKA, whose own signal blocks slide the same way along a fixed axis and detonate on same-color contact, while adding a shockwave-driven color flip and chain reaction of its own that Puzznic never had.",
      ja: "パズニック(Puzznic)は、タイトーが開発・販売したアーケードパズルゲームで、1989年に発売され、後にファミコン、ゲームボーイ、メガドライブ、Amigaなど複数の家庭用機種へ移植された。それぞれのブロックは一つの軸に固定されていて、左右にしか動かせないものと、上下にしか動かせないものがあり、同じ面を持つブロックを2つ以上隣接させて消す——それを限られた手数の中で行うことでステージをクリアする。この核——一つの軸に固定されたブロックを、同じ面同士を接触させて消すという仕組み——は、SINGOU BREAKAのようなゲーム群の、開発者による確認は取れていないものの、もっとも近しい原点候補だ。SINGOU BREAKAの「シグナルブロック」も同じように固定された軸に沿ってスライドし、同色の接触で爆発するが、そこに衝撃で色が反転して連鎖するという、パズニックには無かった独自の仕組みを加えている。",
    },
  },
  // 原点候補(開発者未確認) Lofi Girl(旧 ChilledCow), 制作者 Dimitri Somoguy(フランス)。YouTubeチャンネル
  //   「ChilledCow」として2015年に開設、2017年から「作業・勉強をする人のためのリラックスミュージック」と
  //   銘打った24時間ノンストップのLo-Fi Hip Hopライブ配信を開始し、2021年に「Lofi Girl」へ改称
  //   (Wikipedia/Wikidata実測確認済み)。ヘッドホンをつけ猫のいる窓辺で机に向かう少女のアニメーション
  //   (2018年起用開始、デザインは Juan Pablo Machado)とともに、「静かなLo-Fiと共に、誰かが隣で
  //   作業している気配を感じながら机に向かう」という体験を確立した存在。Chill with You: Lo-Fi Storyの
  //   「サトネとの作業通話」はこの体験を継ぐ子孫だが、Nestopi Inc.がLofi Girlを影響源と明言した一次情報は
  //   確認できておらず、こちらの読み解きとして系譜に位置づける(捏造しない・自信度: 中)。YouTubeチャンネル/
  //   音楽レーベルでゲームでない → 公式Steam版なし。wikidata QID(Q101833802・label="Lofi Girl"/
  //   alias="ChilledCow" 実測確認済み)で同定(Steam id を捏造しない・twilight-syndrome型href破損の回避)。
  //   established側とwikidata URLの完全一致で逆引き成立。
  "lofi-girl": {
    wikidata: "https://www.wikidata.org/wiki/Q101833802",
    blurb: {
      en: "Lofi Girl (formerly ChilledCow) is a French YouTube channel and music label created by Dimitri Somoguy, launched as ChilledCow on 18 March 2015. On 25 February 2017 it began the 24/7 lo-fi hip hop livestream it is now known for, branded from the start as relaxation music for people working or studying, and the channel took the name Lofi Girl in 2021. Its mascot, a girl wearing headphones bent over a desk beside a window with a cat on the sill, animated by Juan Pablo Machado since March 2018, turned sitting down to work with quiet lo-fi music and the sense of someone working alongside you into a specific, recognizable ritual. It is the origin of the lineage that turns working alongside lo-fi music and a quiet companion into the whole experience.",
      ja: "Lofi Girl(旧ChilledCow)は、Dimitri Somoguyが制作したフランスのYouTubeチャンネル/音楽レーベルで、2015年3月18日に「ChilledCow」として開設された。2017年2月25日、現在知られる24時間ノンストップのLo-Fi Hip Hopライブ配信を開始し、当初から「作業や勉強をする人のためのリラックスミュージック」と銘打っていた。チャンネルは2021年に「Lofi Girl」へ改称する。2018年3月から起用された、ヘッドホンをつけ猫のいる窓辺のそばで机に向かう少女のマスコット(アニメーションはJuan Pablo Machadoが担当)は、静かなLo-Fiと共に、誰かが隣で作業している気配を感じながら机に向かうことを、一つの認識できる儀式に変えてみせた。Lo-Fi音楽と静かな相棒とともに作業することそのものを体験に変えた、その系譜の原点である。",
    },
  },
  // 原点候補(開発者未確認) THE 地球防衛軍(Chikyu Boueigun), サンドロット開発・ディースリー・パブリッシャー
  //   発売, SIMPLE2000シリーズ Vol.31, PlayStation 2, 2003年6月26日(欧州は2004年2月27日, Agetec販売,
  //   タイトル"Monster Attack")。一人の巨大ヒーローが単体の怪獣と一騎打ちする"ultraman"とは別に、等身大の
  //   防衛者が圧倒的なエイリアン侵略に一戦ずつ挑む味の原点として新規 anchor 化。The Last Salvage Squad の
  //   コグリナユニット(僚機が倒れると次のユニットが即座に出撃し、回収した武器を受け継ぐ)は、この
  //   "等身大の防衛者を繰り返し投入する"前提を受け継ぐ子孫と読む(lineage_anchor_key=wikidata_qid,
  //   Q5570229 で同定)。この帰属は開発者本人の言明ではなく独立レビュアー(banshu-doukoukai.com)の比較に
  //   基づく推定のため自信度: 中(捏造しない)。
  //   【wikidata QIDの内部矛盾に関する注記】Q5570229 は jawiki サイトリンクが「THE 地球防衛軍」(2003年、
  //   本作の原点として正しい対象)を指す一方、enwiki サイトリンクは「Global Defence Force」(2005年発売の
  //   続編『地球防衛軍2』)を指しており、英語版記事本文には2003年版への言及が一切ない(curl実測で確認済み・
  //   Wikidata側のクロスリンク不整合と判断)。そのため本文には jawiki が指す2003年版の事実(サンドロット
  //   開発・ディースリー・パブリッシャー発売・欧州名"Monster Attack")のみを記載し、確認の取れない
  //   「西タイトルGlobal Defence Force」という帰属は書かない(捏造しない・正直さ)。homepage も2003年版を
  //   記す jawiki 記事を採用し、続編を記す enwiki 記事は使わない(href の参照先と本文事実の食い違いを
  //   避けるため)。公式 Steam 版は無い → wikidata で同定(twilight-syndrome 型 href 破損の回避)。
  "chikyu-boueigun": {
    wikidata: "https://www.wikidata.org/wiki/Q5570229",
    blurb: {
      en: "A likely, but not developer-confirmed, root of this taste: THE 地球防衛軍 (Chikyu Boueigun), an action-shooting game developed by Sandlot and released as SIMPLE2000 Series Vol. 31, published in Japan by D3 Publisher for the PlayStation 2 on June 26, 2003 (and in Europe on February 27, 2004, published by Agetec under the title Monster Attack). Rather than one giant hero facing down a single kaiju, it drops the player into repeated short skirmishes as one soldier among many, ordinary-scale defenders holding a city against a relentless, overwhelming alien invasion, mission after mission. It became the first entry in what grew into the long-running Earth Defense Force series, whose later installments carried that name internationally, and it set a template that lineage has repeated ever since: a small, mortal defender thrown again and again at a threat too large for any one of them to end alone. The Last Salvage Squad's CogrinaUnits carry that same premise, city-scale swarms of alien war machines met one short encounter at a time, into their own distinct core: a unit that falls is simply replaced by the next one, armed with whatever weapon its predecessor managed to salvage. We found no statement from Sunfish Kumano naming Chikyu Boueigun or the Earth Defense Force series as an influence; this lineage is a comparison independent reviewers, including the Japanese blog banshu-doukoukai.com, have drawn, not one either side has confirmed.",
      ja: "この味の、開発者による確認は取れていないものの、もっとも近しい原点候補——THE 地球防衛軍。サンドロットが開発し、SIMPLE2000シリーズ Vol.31としてディースリー・パブリッシャーが日本国内向けに発売したアクションシューティングで、PlayStation 2向けに2003年6月26日に発売された(欧州では2004年2月27日、Agetecの販売により「Monster Attack」のタイトルで発売)。一人の巨大なヒーローが単体の怪獣に立ち向かうのではなく、プレイヤーを、都市を蹂躙する圧倒的なエイリアンの侵略に立ち向かう、大勢の中の一兵士——等身大の防衛者として、短い遭遇戦へ繰り返し送り込む。本作は、後に長寿シリーズとなる「地球防衛軍」シリーズの第1作となり、後続作は海外でもその名で展開されていく。そしてこの作品が確立したのは、以後この系譜が繰り返すことになる型——一人では終わらせられないほど大きな脅威に、小さく命ある防衛者が何度も何度も投げ込まれる、という型だ。『最終回収SQUAD』のコグリナユニットは、この同じ前提——都市規模のエイリアン兵器の大群に、短い遭遇戦を一つずつ挑んでいく——を受け継ぎながら、そこに本作独自の核を据える——倒れたユニットは、ただちに次のユニットに置き換わり、前任者が回収できた武器を受け継いで出撃する。Sunfish Kumano がTHE地球防衛軍や地球防衛軍シリーズを影響源として名指しした言明は見つかっておらず、この系譜は、日本のブログ banshu-doukoukai.com を含む独立したレビュアーたちが読み取った比較であり、どちらの側からも確認された事実ではない。",
    },
  },
  // 原点候補(開発者未確認) Imscared(IMSCARED), Ivan Zanotti(イタリアのソロ開発者), 2012年に無料公開・
  //   2016年2月3日に有料完全版『A Pixelated Nightmare』としてSteam発売(appid 429720, Steam appdetails API
  //   実測)。White Face/HER という存在がゲームのフィクションの外へ手を伸ばし、プレイヤーの実際のPCである
  //   かのようにファイルを作成しクラッシュを偽装する——「画面の出来事が自分の実際のPCに起きているように
  //   見せる」第四の壁破壊型メタホラーの原点として新規 anchor 化。Dyping Escape の目玉のゲームマスター
  //   (打った言葉がそのまま実PCであるかのような画面に反映され、契約書への署名まで打たされる)は、この
  //   前提を「タイピング」という動詞一つに絞って引き継ぐ子孫と読む(lineage_anchor_key=steam, appid 429720
  //   で同定)。この帰属は開発者本人の言明ではなく、共通するメカニクスからの当サイト独自の比較に基づく
  //   推定のため自信度: 中(捏造しない・chikyu-boueigun/lofi-girl 型)。公式 Steam 版があるため steam で
  //   同定(established 側と /app/429720/ で完全一致・href 破損回避)。
  "imscared": {
    steam: "429720",
    blurb: {
      en: "A likely, though not developer-confirmed, root of this taste: Imscared (stylized IMSCARED), a first-person horror game created by the solo Italian developer Ivan Zanotti, first released for free in 2012 and expanded into a full paid release, IMSCARED: A Pixelated Nightmare, on Steam on February 3, 2016. To finish it, the player has to outwit two entities, White Face and HER, that reach past the game's own fiction to act on what looks like the player's real computer, creating files on the desktop and faking crashes, and folding its ending into a file the player has to find and delete on their own machine to beat the game. That premise, staging what happens on screen as something happening to your actual PC rather than to a character, is widely credited with helping define the fourth-wall-breaking strand of meta horror, and both its 2012 and 2016 releases went viral for exactly that reason, praised at the time by PC Gamer, Polygon, and Rock Paper Shotgun, and later named by IGN as one of the best horror games on PC. Dyping Escape's floating eyeball game master, which reflects your typed words back onto what looks like your own desktop and walks you into signing a contract you never agreed to, carries that same premise forward with typing as its sole verb. We found no statement from the developer behind Heaviside Creations naming Imscared as an influence; this lineage is our own reading of a shared taste, not a confirmed statement from either side.",
      ja: "この味の、開発者による確認は取れていないものの、もっとも近しい原点候補——Imscared(表記はIMSCARED)。イタリアのソロ開発者 Ivan Zanotti が制作した一人称ホラーゲームで、2012年に無料で最初に公開され、2016年2月3日には有料の完全版『IMSCARED: A Pixelated Nightmare』としてSteamでリリースされた。クリアするにはプレイヤーは White Face と HER という2体の存在を出し抜く必要があり、彼らはゲームというフィクションの外側にまで手を伸ばし、プレイヤーの実際のパソコンであるかのような画面上でファイルを作成したり、偽のクラッシュを起こしたりする——そしてエンディングは、プレイヤーが自分のPC上で実際に見つけて削除しなければならない1つのファイルへと折り込まれている。「画面で起きていることは、キャラクターにではなく、あなたの実際のPCに起きているように見せる」というこの前提は、第四の壁を破るメタホラーというジャンルの一系統を定義したと広く評価されており、2012年版・2016年版とも、まさにその理由でバイラルヒットとなった。当時PC Gamer・Polygon・Rock Paper Shotgunが賞賛し、後にIGNは2016年版を「PC向けベストホラーゲーム」の1本に選んでいる。『Dyping Escape』の浮遊する目玉のゲームマスターは、打ち込んだ言葉をそのまま自分自身のデスクトップであるかのような画面へ反映し、同意していない契約書への署名へとプレイヤーを導く——同じ前提を、「タイピング」だけを唯一の動詞として引き継いでいる。Heaviside Creations の開発者本人がImscaredを影響源として名指しした言明は見つかっておらず、この系譜は、共通する味わいについての当サイト独自の読み解きであり、どちらの側からも確認された事実ではない。",
    },
  },
  // 原点(開発者本人確認済み) Monster Rancher(モンスターファーム), Tecmo(現・コーエーテクモ)開発、
  //   1997年11月30日にPS向けに発売(Wikipedia実測確認済み)。手持ちのほぼどんなCDを本体に挿入しても
  //   モンスターを生成できる仕組みが象徴的で、育成→大会出場という「育てて、戦わせる」ループの原点。
  //   Steam版は原作そのものではなくリマスター2作収録版『Monster Rancher 1 & 2 DX』(開発・販売とも
  //   コーエーテクモ、2021年12月8日、appid 1716120、Steam appdetails実測確認済み)。MAMON KING の
  //   開発者よしなま氏は、AUTOMATON JPインタビュー(2025-12-05公開、実測確認済み)で「『モンスターファーム』
  //   をリスペクトしていると度々お話されていますが」と記者に直接問われ「もちろんです」と明言している——
  //   chikyu-boueigun/imscared/puzznic型の「開発者未確認の当サイト独自の推定」ではなく、本作は
  //   developer-confirmed(一次情報が存在)。lineage_anchor_key=steam, appid 1716120 で同定
  //   (established側と /app/1716120/ で完全一致・href破損回避)。
  "monster-rancher": {
    steam: "1716120",
    blurb: {
      en: "A root of this taste, confirmed directly by the developer: Monster Rancher, known in Japan as Monster Farm (モンスターファーム), a life-simulation raising game created by Tecmo (now Koei Tecmo), first released for the PlayStation on November 30, 1997 (the Steam version, Monster Rancher 1 & 2 DX, remastering the series' first two entries, was developed and published by Koei Tecmo in December 2021). Its signature gimmick let players generate a brand-new monster by inserting almost any CD into the console, a disc-reading system Tecmo built that turned the disc's own stored data into a random seed for the creature's stats and breed, and from there the player raised it on a training schedule and entered it into official tournaments to fight, a raise-then-battle loop that helped define the genre of monster-raising sims. Asked directly by AUTOMATON JP whether Mamon King is an homage to Monster Rancher, which he has repeatedly cited in interviews, its developer Yoshinama confirmed it outright. Mamon King keeps that raise-then-battle spine, training a summoned creature called a Mamon and entering it into 1-on-1 command battles, but replaces the disc-reading monster generator with a dice-rolled, board-game-style expedition phase between training and battle, and layers an SP resource either fighter can drain onto the fights themselves, additions the original Monster Rancher never had.",
      ja: "この味の原点で、開発者本人が直接明言している一本——Monster Rancher(モンスターファーム)。Tecmo(現・コーエーテクモ)が手がけた育成シミュレーションで、初代は1997年11月30日にPlayStation向けに発売された(Steam版『Monster Rancher 1 & 2 DX』はシリーズ最初の2作をリマスターした版で、2021年12月にコーエーテクモが開発・発売)。象徴的な仕掛けは、手持ちのほぼどんなCDを本体に挿入しても新しいモンスターを生成できるという点にあった——Tecmoが構築したディスク読み取りシステムが、ディスクに記録されたデータをそのまま乱数のシードへ変換し、モンスターのステータスや種族を決定する。そこから先はスケジュールを組んで育成し、公式大会へエントリーして戦わせる——この「育てて、戦わせる」ループが、モンスター育成シムというジャンルを定義づけた。『マモンキング』が『モンスターファーム』へのオマージュかとAUTOMATON JPから直接尋ねられ、開発者よしなま氏はそれを明言している——彼はインタビューでたびたびそのリスペクトを公言してきた人物だ。『マモンキング』は、召喚した「マモン」を育て、1対1のコマンドバトルへ送り出すという同じ「育てて、戦わせる」骨格を受け継ぎながら、CD読み取りによるモンスター生成を、育成と戦闘の間に挟むサイコロ制・すごろく形式の遠征フェーズへと置き換え、さらに戦闘そのものに、互いに奪い合えるSPというリソースを接ぎ木している——いずれも初代『モンスターファーム』には無かった要素だ。",
    },
  },
  // 原点 RayStorm(レイストーム), タイトー開発・発売, 1996年アーケード稼働。開発者ねこび白銀氏が
  //   Tech-Gaming単独インタビューで Revolgear Zero への「決定的な影響」と明言(developer-confirmed・
  //   monster-rancher型の一次情報)。1996年のアーケード原作単体のSteam版は無いため、収録コンピレーション
  //   『Ray'z Arcade Chronology』(M2開発・タイトー発売、appid 2478020、Steam appdetails実測確認済み)の
  //   URLで同定(devil-blade-reboot型・原作単体の流通が無い場合の代替アンカー・href破損回避)。
  "raystorm": {
    steam: "2478020",
    blurb: {
      en: "RayStorm is a vertically scrolling shoot 'em up developed and published by Taito, released in Japanese arcades in 1996 as the sequel to RayForce (also known abroad as Layer Section or Gunlock). Rendered with 3D polygon enemies over scrolling 2D backgrounds, it is best known for its lock-on laser: holding a button paints a reticle across multiple enemies at once, and releasing it fires a spread of homing lasers that clears them out in a single strike, letting the player neutralize threats before they can even return fire. The 1996 arcade original has no standalone Steam release; its only form available today is Ray'z Arcade Chronology, a collection developed by M2 Co., Ltd. and published by Taito that gathers RayStorm alongside RayForce and RayCrisis with HD-remastered visuals. It is the origin of a lineage built around locking onto and erasing threats in bulk rather than weaving between them one at a time.",
      ja: "RayStorm(レイストーム)は、タイトーが開発・発売した縦スクロールシューティングで、『レイフォース』(海外名Layer Section / Gunlock)の続編として1996年に日本のアーケードで稼働を開始した。スクロールする2Dの背景に3Dポリゴンの敵を描画する作りで知られ、代名詞は「ロックオンレーザー」——ボタンを押し続けて複数の敵に同時に照準を合わせ、放つと追尾レーザーの束が一気に敵を消し去り、反撃を受ける前に脅威を無力化できる。1996年のアーケード原作単体のSteam版は存在せず、今日唯一入手できる形は、M2が開発しタイトーが発売したコレクション『Ray'z Arcade Chronology』で、レイフォース・レイクライシスとともにHDリマスターされた本作が収録されている。一体ずつ避けるのではなく、まとめてロックオンして消し去るという系譜の原点である。",
    },
  },
  // 原点候補(開発者未確認・press-drawn) Gradius(グラディウス), コナミ開発・発売, 1985年5月アーケード稼働
  //   (海外名 Nemesis, Wikidata実測確認済み Q1324646="Gradius"/1985 arcade game)。Crimzon Clover World
  //   EXplosion の新規モード「ARRANGE」(スコアアイテムでマルチゲージを充填し任意のタイミングでパワーアップへ
  //   変換する仕組み)を、Nintendo Life とコミュニティ参照wiki shmups.wiki がそれぞれ独立に Gradius 自身の
  //   「パワーメーター」(カプセルで画面下の強化メニューを進め、パワーアップボタンで任意の項目をロックインする
  //   選択制、en.wikipedia.org/wiki/Gradius_(video_game) 実測確認済み)になぞらえており、これが唯一特定できた
  //   系譜アンカー。開発元 YOTSUBANE 本人がこの関連を直接述べた言明は無いため developer-confirmed ではなく
  //   press-drawn(imscared型・確信度は中)。1985年のアーケード原作単体のSteam版は無いため lineage_anchor_key
  //   には steam ではなく wikidata QID を採用(raystorm/devil-blade-reboot型と異なり steam を anchor 自体には
  //   持たせない・established側の games[] で steam(GRADIUS ORIGINS)と homepage(Wikipedia)を併記して href
  //   破損を防ぐのは picks 側の責務)。
  "gradius": {
    wikidata: "https://www.wikidata.org/wiki/Q1324646",
    blurb: {
      en: "Gradius is a horizontally scrolling shoot 'em up developed and published by Konami, released in Japanese arcades in May 1985 (and internationally as Nemesis). Rather than have the player's ship pick up isolated power-up items, it introduced the 'power meter': collecting capsules advances a highlighted option along a row of upgrades at the bottom of the screen, and pressing the power-up button locks in whichever option is currently lit, an idea the development team modeled on a keyboard's function keys so players could choose their own build on the fly instead of having it chosen for them. Widely credited alongside Namco's Xevious as one of the shooters that defined the genre, it is the origin of a lineage of shoot 'em ups that hand the player a menu of upgrades to spend deliberately rather than collect automatically.",
      ja: "グラディウスは、コナミが開発・発売した横スクロールシューティングで、1985年5月に日本のアーケードで稼働を開始した(海外では『Nemesis』の名で展開)。自機が個別のパワーアップアイテムを拾う方式ではなく、「パワーメーター」という仕組みを導入した——カプセルを取ると画面下に並ぶ強化項目のハイライトが進み、パワーアップボタンを押すと今光っている項目がその場でロックインされる。開発チームはこれをキーボードのファンクションキーになぞらえて発想したもので、強化を一方的に押し付けられるのではなく、プレイヤーが自分の好きなタイミングで自分のビルドを選べる自由を生んだ。ナムコの『ゼビウス』と並び、このジャンルを定義した作品の一つとして広く評価されており、強化を自動で拾うのではなく、メニューから狙って選び取らせるシューティングというジャンルの系譜の原点である。",
    },
  },
  // 原点 扫雷冒险谭2 ~露露姆的冒险~(Minesweeper Adventure Tale 2: Rurumu's Adventure)、CelLab開発、
  //   OTAKU Plan発売(中国市場向けローカライズ)、2021年3月19日リリース(appid 1549240、Steam appdetails
  //   実測確認済み)。ジャンル上の原点ではなく、同一開発元 CelLab・同一キャラクター(ルルム)・同一舞台
  //   (Noruru Village/诺鲁鲁村)による自己参照型の直系前作(両appdetailsの developers/ストア本文の実測が
  //   完全一致・自信度高)。対応言語は簡体字中国語のみ(appdetails実測確認済み・英語/日本語版は存在しない)。
  "minesweeper-adventure-tale-2": {
    steam: "1549240",
    blurb: {
      en: "Not a defining-mechanic ancestor, but the earlier game this heroine headlined: Minesweeper Adventure Tale 2: Rurumu's Adventure (扫雷冒险谭2 ~露露姆的冒险~), a minesweeper-based adventure game developed by CelLab, the same studio behind Core Awaken Rurumu's will, and published in the China market by OTAKU Plan, released March 19, 2021 with Simplified Chinese as its only supported language per Steam's own listing. It stars the same robot heroine, Rurumu, on the same mission she is still on in Core Awaken Rurumu's will: getting the people of Noruru Village home safely, in this case after a disaster leaves their route buried in landmines. Per its own store page, the number revealed on a swept tile tells you how many mines surround it, so you mark them by deduction across more than a hundred stages, picking up items and dodging traps along the way, and leveling up equipped skills using stars earned as stage-clear rewards. Core Awaken Rurumu's will keeps Rurumu and her drive to protect that same village, but replaces that number-reading minesweeper puzzle entirely with real-time, switchable combat and a second playable heroine of her own.",
      ja: "ジャンル上の原点ではなく、このヒロインが本作より前に主演していた一本——扫雷冒险谭2 ~露露姆的冒险~(Minesweeper Adventure Tale 2: Rurumu's Adventure)。『機核覚醒～ルルムの決意～』と同じ開発元 CelLab による、数字を読んで地雷を見極めるアドベンチャーで、発売(中国市場向けローカライズ)は OTAKU Plan、2021年3月19日にリリースされた。Steam自身の表記によれば対応言語は簡体字中国語のみ。主人公は本作と同じロボットのルルムで、目指すゴールも変わらない——ノルル村(诺鲁鲁村)の人々を無事に村へ帰すこと。この前作では、ある事件で村への帰り道が地雷原と化してしまい、ルルムが地雷除去の旅に出る。ストアページによれば、開いたマスに表示される数字が周囲の地雷数を示し、その数字を手がかりに100を超えるステージで地雷を見極めてマークしていく——道中には手助けとなるアイテムや妨害となる罠もあり、ステージクリア報酬で得られる「星」を使って装備したスキルを強化していく。『機核覚醒～ルルムの決意～』は、同じルルムと同じ「村を守る」という動機を受け継ぎながら、この数字読み型の地雷パズルを、リアルタイムで切り替え可能な戦闘と、もう一人の操作キャラクターへとまるごと置き換えている。",
    },
  },
  // 原点 影廊 -Shadow Corridor-(Kageroh: Shadow Corridor)、リリース日2017年6月21日、日本のフリーゲーム
  //   配信サイト「ふりーむ！」で無料公開。制作者は城間一樹(当時の旧HN「花月」)、2016年2月にニコニコ動画へ
  //   洋風テイストの制作映像を投稿し始め、同年4月に和風ホラーへ方向転換。第13回ふりーむ！ゲームコンテスト
  //   ホラー部門金賞受賞(ふりーむ配信ページ本体、およびSteam自身の英語レビュー本文recommendationid
  //   49634997の証言から独立に裏付け済み)。ジャンル上の外部原点ではなく、開発者本人による自己参照の
  //   フリー版原典(shadow-corridor pick の全面リメイクの前身)。公式Steam版は無い自己参照的origin
  //   のため lineage_anchor_key には steam ではなく wikidata QID(Q97198038)を採用する(established側の
  //   games[] で wikidata + homepage(開発元公式サイト) + freem(配信ページ本体)を併記してhref破損を
  //   防ぐのは picks 側の責務・gradius/mother-3型)。
  "kageroh": {
    wikidata: "https://www.wikidata.org/wiki/Q97198038",
    blurb: {
      en: "影廊 -Shadow Corridor- (Kageroh: Shadow Corridor) is a free Japanese indie horror game, released for free on the freeware platform Freem with a release date of June 21, 2017, made by the solo developer Kazuki Shiroma. Shiroma first posted footage of a Western-styled horror project on Niconico Douga in February 2016 under the handle Kagetsu (花月), reworked it into a Japanese-styled one that April, and the finished free game went on to win the Gold Award in the Horror category at Freem's 13th game contest. It set the template this lineage grows from: creep through the corridors of a traditional Japanese building using only whatever light and items you can find, and survive by evading, not fighting, the Noh-mask apparitions that hunt you by sight and sound. Shiroma later rebuilt it from the ground up as the commercial Shadow Corridor on Steam, which keeps that same loop while adding, per its own store listing, 'more than ten times' the free original's content, on top of a new story and additional mechanics.",
      ja: "影廊 -Shadow Corridor-は、日本のフリーゲーム配信サイト「ふりーむ！」でリリース日2017年6月21日に無料公開された、ソロ開発者 城間一樹 による日本産インディーホラーゲームだ。城間は2016年2月、当時の旧HN「花月」名義で洋風テイストのホラーゲームの制作映像をニコニコ動画に投稿し始め、同年4月には和風ホラーへと方向転換、完成したフリー版は第13回ふりーむ！ゲームコンテストのホラー部門で金賞を受賞した。和風建築の回廊を、手持ちの明かりと見つけたアイテムだけを頼りに歩き、視覚と聴覚で追う能面の徘徊者を、戦うのではなく避けてやり過ごして生き延びる——この系譜のひな型を作った一本だ。城間は後に、この同じ作品をゼロから作り直し、Steamで商業版『Shadow Corridor』としてリリースした。同じループを保ったまま、新規のストーリーと追加のゲームシステムを加え、Steam自身のストア表記によれば、そのボリュームは無料版の「何と10倍以上」になっている。",
    },
  },
  // 原点 アクアリウムは踊らない(無料版), Gotcha Gotcha Games名義, 2024年2月14日リリース(Steam appdetails
  //   実測)。制作者・橙々による1,000件超レビュー・好評率96%の水族館探索ホラーADV。Special Edition
  //   (appid 3675470)は同一制作者によるフルボイス化+新規シナリオ追加のブランニュー・バージョンで
  //   (Steam about_the_game実測: "本作は2024年2月にGotcha Gotcha Gamesより発表された『アクアリウムは
  //   踊らない』に…追加されたブランニュー・バージョン")、kageroh/moonpalace型の自己参照origin判断。
  "aquarium-does-not-dance-original": {
    steam: "2814910",
    blurb: {
      en: "The Aquarium does not dance is a free Japanese horror adventure released February 14, 2024 under the RPG Maker publishing label Gotcha Gotcha Games, made by solo creator 橙々 (Daidai). Per its own store listing, it already carries the template this grew from: a girl exploring an aquarium turned world of terror in search of her missing best friend, solving mandatory puzzles while misshapen creatures called Creepies threaten to kill her outright, told across a multi-ending story. The free game itself sits at Overwhelmingly Positive, 96 percent over more than a thousand reviews. The Aquarium does not dance Special Edition on Steam is not a new work borrowing that DNA from outside; it is 橙々's own from-scratch expansion of this same free game, per Steam's own text, keeping the same story and cast while adding full voice acting, a new Another Story scenario, and English-language support.",
      ja: "『アクアリウムは踊らない』は、RPGツクールの発売元Gotcha Gotcha Games名義で2024年2月14日に無料公開された、制作者・橙々による日本産ホラーアドベンチャーだ。Steam自身の表記によれば、この時点ですでにこの系譜のひな型——恐怖の世界と化した水族館で行方不明の親友を探す少女が、解かなければ進めない謎を解きながら、命を落としかねない異形の存在「クリーピー」の脅威をくぐり抜けていく、マルチエンディングの物語——を備えていた。この無料版自体も1,000件超のレビューで好評率96%の「圧倒的に好評」を得ている。Steam版『アクアリウムは踊らない Special Edition』は、外部からこのDNAを借りた新作ではない——橙々本人による、この同じ無料ゲームのゼロからの拡張版だ。Steam自身の表記によれば、同じ物語とキャストを保ったまま、フルボイス化・新規シナリオ「アナザーストーリー」・英語対応を加えている。",
    },
  },
  // 原点 パーフェクトブルー(Perfect Blue), 今敏監督, マッドハウス制作, 1997年公開。竹内義和の同名小説を
  //   原案とする(Wikipedia要約実測: 脚本 村井貞之、声の主演 岩男潤子)。アイドルグループのメンバーが
  //   歌手を引退し女優へ転身するが、熱狂的なファンに付け纏われ、凄惨な殺人事件が起こるなかで現実と
  //   演じる虚構の境界が溶け崩れていく——「エンターテイナーを見つめる観客が、遠くから眺めるだけでは
  //   止まらず実生活そのものへ手を伸ばす」というメディア×ストーカー恐怖の日本的原型(Wikidata実測:
  //   監督P57=Q333643=Satoshi Kon、制作会社P272=Q650867=Madhouse、公開日P577=1997年で確認済み)。
  //   Parasocial とのこの帰属は GamesRadar+ 等の批評記事が主題的近似を指摘する当サイト独自の比較で
  //   あり、開発元 Chilla's Art による直接の言明ではないため自信度: 中(捏造しない・imscared/
  //   chikyu-boueigun 型の判断)。公式Steam版は無い1997年の映画のため lineage_anchor_key には steam
  //   ではなく wikidata QID(Q1205051)を採用する。
  "perfect-blue": {
    wikidata: "https://www.wikidata.org/wiki/Q1205051",
    blurb: {
      en: "Perfect Blue is a 1997 Japanese animated psychological horror film directed by Satoshi Kon and produced by Madhouse, loosely based on the novel by Yoshikazu Takeuchi. A member of a Japanese idol group retires from singing to become an actress, and is stalked by an obsessive fan as gruesome murders begin and the line between her real life and the role she performs starts to dissolve. It crystallized a distinctly Japanese strand of horror in which an entertainer's own audience stops watching from a distance and reaches into her actual life, the origin of the lineage of games and stories where a performer's audience becomes the threat.",
      ja: "パーフェクトブルーは、今敏監督、マッドハウス制作による1997年の日本のアニメーション心理サスペンス映画で、竹内義和の同名小説を原案としている。あるアイドルグループのメンバーが歌手活動を引退して女優に転身するが、熱狂的なファンに付け纏われるようになり、凄惨な殺人事件が起こり始めるなかで、現実の彼女と演じる役柄との境界が溶け崩れていく。「エンターテイナーを見つめる観客が、遠くから眺めるだけでは止まらず、その実生活そのものへ手を伸ばし始める」という、日本的なホラーの一系統を結晶化させた作品であり、観客そのものが脅威に変わる作品・ゲーム群の系譜の原点である。",
    },
  },
  // 原点 ファミレスを享受せよ(itch.io無料版)、日本の同人サークル 月刊湿地帯(作者ハンドル oissisui)が
  //   Godotエンジンで制作し itch.io で無料公開した原型(2022年)。ジャンル上の外部原点ではなく、開発者
  //   本人による自己参照のフリー版原典(enjoy-the-diner pick の全面リメイクの前身・kageroh型の判断)。
  //   itch.ioページ本体(https://oissisui.itch.io/moonpalace)を直接WebFetchで実測確認済み: タイトル
  //   "ファミレスを享受せよ by oissisui"、本文「永遠のファミレス『ムーンパレス』に迷い込むアドベンチャー
  //   ゲームです」「なんとドリンクバーもあります」「操作方法 左クリック」「推定プレイ時間 30分〜」
  //   「エンディング 2種」「制作 月刊湿地帯/おいし水」「開発ツール Godot」の記載、および評価4.9(65件)の
  //   schema.org AggregateRating を確認済み。同ページにはSteam版リリース直後の追記で、追加要素(イラスト
  //   ギャラリー等)を備えたSteam版(本pickの主役 enjoy-the-diner、appid 2336980)へのリンクが直接
  //   貼られており、この無料版がSteam商業版の前身であることを開発者自身のページが裏付けている。公式
  //   Steam版・Wikidata QIDを持たない itch.io 限定の無料ブラウザ版のため、lineage_anchor_key には
  //   steam でも wikidata でもなく itchio(itch.io_url)を新規フィールドとして採用する(fish-in-the-bottle
  //   pick の freem-only established と同型判断: 単一の生きた配信ページ URL のみで同定し、href 破損なし)。
  "moonpalace": {
    itchio: "https://oissisui.itch.io/moonpalace",
    blurb: {
      en: "The free original this grew from: ファミレスを享受せよ (\"Enjoy the Family Restaurant\"), a free browser adventure game the Japanese two-person doujin circle 月刊湿地帯 (Gekkan Shicchitai), under the handle oissisui, built in the Godot engine and released for free on itch.io. Per its own itch.io page, it drops you into the eternal family restaurant Moon Palace, drink bar included, played with nothing but a left click, running about thirty minutes to one of two endings. That same itch.io page carries its own update note, posted right after the Steam release went live, pointing players to the finished commercial edition: Enjoy the Diner on Steam, rebuilt from the ground up in Unity by Studio Dragonet with new customer chit-chat, a Sound Gallery, an Illustration Gallery, and Steam Achievements. This is not an outside influence but the developer's own free demo, later remade as the paid Steam edition.",
      ja: "本作が育った、その無料版の原点——『ファミレスを享受せよ』。日本の2名同人サークル 月刊湿地帯(ハンドル名 oissisui)が Godot エンジンで制作し、itch.io で無料公開したブラウザアドベンチャーだ。itch.io の配信ページ本文によれば、「永遠のファミレス『ムーンパレス』に迷い込むアドベンチャーゲーム」で、ドリンクバーもあり、操作は左クリックのみ、推定プレイ時間は30分〜、エンディングは2種。その同じitch.ioページには、Steam版リリース直後に追記された一文があり、追加要素を備えた完成形の商業版——Steam版『ファミレスを享受せよ(Enjoy the Diner)』——へのリンクが直接貼られている。Steam版は Studio Dragonet がUnityでゼロから作り直した一本で、新規の雑談・サウンドギャラリー・イラストギャラリー・Steam実績が加わっている。これは外部からの影響ではなく、開発者本人によるこの無料デモが、後に有料のSteam版として作り直されたものだ。",
    },
  },
  // 原点 イツカノヨル(unityroom無料版)、2023年10月、日本のゲームジャムサイト「unityroom」で
  //   Unity1Week「1ボタン」お題の参加作として制作者Indigo Ingots(企画・シナリオ・プログラム)が
  //   イラストpolaritia・サウンドかずら's MUSICと組んで無料公開した原型(unityroom配信ページ本体
  //   https://unityroom.com/games/fivedaysnight をWebFetchでHTTP 200到達確認済み)。ジャンル上の
  //   外部原点ではなく、開発者本人による自己参照のフリー版原典(5omeday pick の商業リメイクの前身・
  //   kageroh/moonpalace型の判断)。公式Steam版・Wikidata QIDを持たない unityroom 限定の無料
  //   ブラウザ版のため、lineage_anchor_key には steam でも wikidata でもなく unityroom(配信ページ
  //   URL)を新規フィールドとして採用する(itchio-only の moonpalace と同型判断: 単一の生きた配信
  //   ページ URL のみで同定し、href 破損なし)。
  "5omeday-original": {
    unityroom: "https://unityroom.com/games/fivedaysnight",
    blurb: {
      en: "The free original this grew from: イツカノヨル, released free on the Japanese game jam site unityroom in October 2023 for the Unity1Week jam's \"one button\" theme, by creator Indigo Ingots (script, planning, and programming) working with artist polaritia and composer Kazura's MUSIC. Per its own game page, it already carries the same premise and structure this lineage grows from: a five-minute, click-only story branching across your choice of whether and when to press the execution button in front of you. 5omeday on Steam is not a new work borrowing that DNA from outside; it is a commercial edition of this same free jam game, adding full voice acting, extra endings, and English and Chinese language support on top of it.",
      ja: "本作が育った、その無料版の原点——『イツカノヨル』。2023年10月、日本のゲームジャムサイト「unityroom」で、Unity1Weekゲームジャムの「1ボタン」お題に応じて、制作者Indigo Ingots(企画・シナリオ・プログラム)がイラストpolaritia・サウンドかずら's MUSICと組んで無料公開した。その配信ページ自体によれば、この時点ですでにこの系譜のひな型——5分・クリックのみで進み、目の前の処刑ボタンを押すか押さないか、いつ押すかで分岐する物語——を備えていた。Steam版『イツカノヨル(5omeday)』は、外部からこのDNAを借りた新作ではない——この同じ無料ジャムゲームの商業版であり、フルボイス化・エンディング追加・英語/中国語対応を加えている。",
    },
  },
  // 原点 Papers, Please(Lucas Pope, 2013, Steam appid 239030)。BatteryNote pick の系譜として新規採用。
  //   この帰属は開発元72studioの言明ではなく当サイト独自の批評的比較(自信度: 中・parasocial/
  //   perfect-blue型の判断)。Papers, Please自体が現行Steamで販売中のためsteam URLで同定する。
  "papers-please": {
    steam: "239030",
    blurb: {
      en: "Papers, Please is a 2013 procedural thriller by Lucas Pope in which the player, a border inspector in the fictional state of Arstotzka, reduces each stranger crossing the checkpoint to a stack of paperwork and, under a ticking clock, decides only to approve or reject them, a small repeated act of bureaucratic power that branches the story across more than twenty endings depending entirely on how it was exercised. This lineage is a comparison drawn by this site in outside critical commentary, not a connection stated by any developer whose games trace back to it here; it is the origin of the idea that placing total, mundane power over a vulnerable stranger's fate into the player's hands, exercised through nothing more than small repeated interactions against a timer, can carry real weight.",
      ja: "Papers, Pleaseは、Lucas Pope制作による2013年の書類審査スリラーで、プレイヤーは架空の国家アルストツカの国境審査官として、検問所を通る一人ひとりを「書類の束」として扱い、時間制限のなかで承認するか却下するかだけを選び続ける。その官僚的な権力の小さな反復行為が、行使のされ方次第で20種を超えるエンディングへと枝分かれしていく。この系譜は、ここで結びつける開発元自身が明言した関連性ではなく、当サイト独自の批評的比較である——見知らぬ弱い立場の相手の運命を、プレイヤーの手のなかの小さな反復行為だけに委ねるという着想、その原点にあたる一本だ。",
    },
  },
} as const;

export type LineageId = keyof typeof LINEAGE_ANCHOR;

// lineage id を原点ゲーム名(表示言語)に解決する。picks 内の established game を逆引きし、
// ゲーム名の二重定義を避ける(SSOT)。見つからなければ null(捏造しない)。
//   同定は多態: anchor.steam があれば Steam URL で、anchor.wikidata があれば wikidata で逆引きする。
export function lineageName(id: string, lang: "en" | "ja"): string | null {
  const anchor = (LINEAGE_ANCHOR as Record<string, { steam?: string; wikidata?: string; freem?: string; itchio?: string; unityroom?: string }>)[id];
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
      // itch.io 同定(Steam 版/wikidata QID/freem のいずれも無い itch.io 発の原点): g.itchio の完全一致で逆引き。
      if (anchor.itchio) {
        if (g.itchio !== anchor.itchio) continue;
        return isJa ? (g.name_ja || g.name_en) : (g.name_en || g.name_ja);
      }
      // unityroom 同定(Steam 版/wikidata QID/freem/itchio のいずれも無い unityroom 発の原点): g.unityroom の完全一致で逆引き。
      if (anchor.unityroom) {
        if (g.unityroom !== anchor.unityroom) continue;
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

// 原点 id の外部実体識別子(steam app id / wikidata QID URL / itch.io URL / unityroom URL)を返す(計算だけ・副作用なし)。
//   原点ページの出典リンクと JSON-LD sameAs が LINEAGE_ANCHOR を直読みせず一様に参照する入口(SSOT)。
//   anchor 無しは null。steam / wikidata / freem / itchio / unityroom は持っているものだけを積む(捏造しない・壊れリンクを作らない)。
export function lineageAnchorIdentity(id: string): { steam?: string; wikidata?: string; freem?: string; itchio?: string; unityroom?: string } | null {
  const anchor = (LINEAGE_ANCHOR as Record<string, { steam?: string; wikidata?: string; freem?: string; itchio?: string; unityroom?: string }>)[id];
  if (!anchor) return null;
  const out: { steam?: string; wikidata?: string; freem?: string; itchio?: string; unityroom?: string } = {};
  if (anchor.steam) out.steam = anchor.steam;
  if (anchor.wikidata) out.wikidata = anchor.wikidata;
  if (anchor.freem) out.freem = anchor.freem;
  if (anchor.itchio) out.itchio = anchor.itchio;
  if (anchor.unityroom) out.unityroom = anchor.unityroom;
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
