// JSON-LD (schema.org) 生成。脳と体の分離: データ(picks/site)から構造を作るだけ。
// 値はベタ書きせず picks.ts / site.ts から参照 (SSOT)。AI(GEO/AEO) に意味を構造で渡す。
import { picks } from "../data/picks";
import { SITE } from "../data/site";

// ゲーム名を表示言語で解決 (name_en / name_ja 統一形)。
function gameName(g, isJa) {
  return isJa ? (g.name_ja || g.name_en) : (g.name_en || g.name_ja);
}

// ページの代表エンティティ名 (SSOT)。games[0] 直読みを全廃しここに一元化。
//   kind === "find" : 主題は無名の1本 (games[leadIndex] の VideoGame)
//   kind === "hub"  : 主題は特定ゲームでなく味 (topic[lang])。有名作の誤認を構造で遮断。
export function representativeName(pick, lang) {
  const isJa = lang === "ja";
  if (pick.kind === "hub") {
    return isJa ? pick.topic.ja : pick.topic.en;
  }
  return gameName(pick.games[pick.leadIndex], isJa);
}

// 各ゲームの外部実体アンカー (存在する identifier だけを積む) → AI の entity 確定。
//   Steam 版が無い established(例 Archero はモバイル専用)もあるので steam は任意。
//   steam / wikidata / appstore / homepage を、持っているものだけ push する(捏造しない)。
//   established は必ず 1 件以上の anchor を持つ(空配列は返らない)。
function gameSameAs(g) {
  const out = [];
  if (g.steam) out.push(g.steam);
  if (g.wikidata) out.push(g.wikidata);
  if (g.appstore) out.push(g.appstore);
  if (g.homepage) out.push(g.homepage);
  return out;
}

// VideoGame の正準 URL: Steam があればそれ、無ければ公式(homepage)へフォールバック(url 必須回避)。
function gameUrl(g) {
  return g.steam || g.homepage;
}

// プラットフォーム: Steam 版があれば "PC"、無ければモバイル専用(Archero)の事実を出す(捏造しない)。
function gamePlatform(g) {
  return g.steam ? "PC" : "iOS, Android";
}

// pick ページ用: CollectionPage(roundup の正準パターン) + ItemList(VideoGame) の @graph。
export function pickJsonLd(slug, lang, pageUrl, homeLabel) {
  const pick = picks[slug];
  const c = pick[lang];
  const isJa = lang === "ja";
  const orgName = isJa ? SITE.name : SITE.nameEn;
  const repName = representativeName(pick, lang);
  const leadIdx = pick.kind === "hub" ? -1 : pick.leadIndex;
  const items = pick.games.map(function (g, i) {
    const item = {
      "@type": "VideoGame",
      name: gameName(g, isJa),
      description: isJa ? g.desc_ja : g.desc_en,
      url: gameUrl(g),
      gamePlatform: gamePlatform(g),
      sameAs: gameSameAs(g),
    };
    if (i === leadIdx) item["@id"] = pageUrl + "#lead";
    return { "@type": "ListItem", position: i + 1, item: item };
  });

  // about: ページのトピック実体。find は VideoGame(#lead と束ねる)、hub は味そのもの(Thing)。
  const about =
    pick.kind === "find"
      ? {
          "@type": "VideoGame",
          "@id": pageUrl + "#lead",
          name: repName,
          sameAs: gameSameAs(pick.games[pick.leadIndex]),
        }
      : { "@type": "Thing", name: repName, description: c.description };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": pageUrl + "#page",
        name: c.title,
        headline: c.title,
        description: c.description,
        inLanguage: lang,
        datePublished: pick.published,
        isPartOf: { "@id": SITE.url + "/#website" },
        author: { "@type": "Organization", name: orgName, url: SITE.url },
        publisher: { "@type": "Organization", name: orgName, url: SITE.url },
        about: about,
        mainEntity: { "@id": pageUrl + "#list" },
      },
      {
        "@type": "ItemList",
        "@id": pageUrl + "#list",
        name: c.title,
        itemListElement: items,
      },
      {
        "@type": "BreadcrumbList",
        "@id": pageUrl + "#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: homeLabel, item: SITE.url + (isJa ? "/ja/" : "/") },
          { "@type": "ListItem", position: 2, name: repName, item: pageUrl },
        ],
      },
    ],
  };
}

// homepage 用: WebSite + Organization。二言語ブランドを alternateName で同一実体に束ねる。
export function siteJsonLd(lang) {
  const isJa = lang === "ja";
  const orgName = isJa ? SITE.name : SITE.nameEn;
  const altName = isJa ? SITE.nameEn : SITE.name;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": SITE.url + "/#website",
        name: orgName,
        alternateName: altName,
        url: SITE.url,
        inLanguage: lang,
        description: SITE.tagline,
        publisher: { "@id": SITE.url + "/#org" },
      },
      {
        "@type": "Organization",
        "@id": SITE.url + "/#org",
        name: orgName,
        alternateName: altName,
        url: SITE.url,
      },
    ],
  };
}
