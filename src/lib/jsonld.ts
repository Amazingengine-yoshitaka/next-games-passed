// JSON-LD (schema.org) 生成。脳と体の分離: データ(picks/site)から構造を作るだけ。
// 値はベタ書きせず picks.ts / site.ts から参照 (SSOT)。AI(GEO/AEO) に意味を構造で渡す。
import { picks, lineageName, lineageBlurb, lineageAnchorIdentity, lineageIds, isPublished } from "../data/picks";
import { SITE } from "../data/site";

// published("YYYY-MM-DD")を JST 00:00:00 起点の ISO8601 完全形にする時の接尾辞 (SSOT)。
//   日付のみの値に時刻+タイムゾーンを補い、時刻の捏造を避け日付境界(JST 0時)で固定する。
//   sitemap (astro.config.mjs) の lastmod も同じ接尾辞を参照し、JST 起点の解釈を1箇所に集約する。
export const JST_MIDNIGHT_SUFFIX = "T00:00:00+09:00";

// published("YYYY-MM-DD")を ISO8601 完全形("YYYY-MM-DDT00:00:00+09:00")にする純粋関数。
//   AEO/SEO 向けに datePublished / dateModified を時刻+タイムゾーン付きで出すための変換。
export function isoFromPublished(published: string): string {
  return published + JST_MIDNIGHT_SUFFIX;
}

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
  if (g.freem) out.push(g.freem);
  return out;
}

// VideoGame の正準 URL: Steam があればそれ、無ければ公式(homepage)、それも無ければ ふりーむ 配信ページへ
// フォールバック(url 必須回避)。表示層(GameCard)も同じ思想を共有するため export(SSOT・フォールバック
// ロジックを 2 箇所に書かない)。steam も homepage も freem も無い場合は undefined(呼び出し側でリンクを
// 描画しない分岐に使う)。
export function gameUrl(g) {
  return g.steam || g.homepage || g.freem;
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
        // ISO8601 完全形(時刻+JST)で出す。記事は公開後に更新していないので dateModified は datePublished と同値。
        datePublished: isoFromPublished(pick.published),
        dateModified: isoFromPublished(pick.published),
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

// 原点 anchor を同定する established game を picks から逆引きする(SSOT・捏造しない)。
//   identity.steam があれば Steam URL の app id 一致で、wikidata があれば g.wikidata 完全一致で探す。
//   lineageName の逆引きと同一思想(名前ではなく実体 anchor で同定)。見つからなければ null。
//   原点ページの sameAs / gameUrl を established 側の事実(Steam URL/公式)から再利用するために使う。
function establishedForAnchor(anchorId) {
  const identity = lineageAnchorIdentity(anchorId);
  if (!identity) return null;
  for (const key of Object.keys(picks)) {
    for (const g of picks[key].games) {
      if (g.status !== "established") continue;
      if (identity.steam) {
        if (g.steam && g.steam.indexOf("/app/" + identity.steam + "/") !== -1) return g;
        continue;
      }
      if (identity.wikidata) {
        if (g.wikidata === identity.wikidata) return g;
        continue;
      }
      if (identity.freem) {
        if (g.freem === identity.freem) return g;
      }
    }
  }
  return null;
}

// 原点ページ(/origins/<anchor>/)用 JSON-LD。
//   CollectionPage(原点の系譜まとめ) + ItemList(その原点を継ぐ発掘記事=子孫) + about(原点 VideoGame)。
//   about の原点 VideoGame には自サイトの #lead を付けない(AEO 不破壊: 有名原点を自サイトの正準
//   エンティティに祭り上げない)。sameAs は established 側の事実(Steam/Wikidata/公式)を再利用する(捏造なし)。
//   子孫 ItemList の各要素は発掘記事(CollectionPage)へのリンク。未公開(now < publishAt)の子孫は出さない。
//   nowMs は呼び出し側(原点ページ)が渡す現在時刻(UTC epoch ms)。
export function originJsonLd(anchorId, lang, pageUrl, homeLabel, nowMs) {
  const isJa = lang === "ja";
  const orgName = isJa ? SITE.name : SITE.nameEn;
  const originName = lineageName(anchorId, lang);
  const blurb = lineageBlurb(anchorId, lang);
  // 原点 established の sameAs/url を再利用(established 由来=SSOT・原点ページが anchor を直読みしない)。
  const established = establishedForAnchor(anchorId);
  const aboutSameAs = established ? gameSameAs(established) : [];
  const aboutUrl = established ? gameUrl(established) : undefined;

  // この原点を継ぐ発掘記事(子孫)。lineageIds に anchorId を含む pick = 子孫。未公開は出さない。
  //   ListItem.item は子孫記事ページ(CollectionPage)への URL。記事名は representativeName(SSOT)。
  const childItems = [];
  const localePrefix = isJa ? "/ja/picks/" : "/picks/";
  for (const slug of Object.keys(picks)) {
    const pick = picks[slug];
    if (lineageIds(pick.meta).indexOf(anchorId) === -1) continue;
    if (!isPublished(pick.publishAt, nowMs)) continue;
    childItems.push({
      "@type": "ListItem",
      position: childItems.length + 1,
      name: representativeName(pick, lang),
      item: SITE.url + localePrefix + slug + "/",
    });
  }

  // about: 原点 VideoGame。description は blurb(SSOT)。#lead は付けない(AEO 不破壊)。
  const about = {
    "@type": "VideoGame",
    name: originName,
    description: blurb,
    sameAs: aboutSameAs,
  };
  if (aboutUrl) about.url = aboutUrl;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": pageUrl + "#page",
        name: originName,
        headline: originName,
        description: blurb,
        inLanguage: lang,
        isPartOf: { "@id": SITE.url + "/#website" },
        author: { "@type": "Organization", name: orgName, url: SITE.url },
        publisher: { "@type": "Organization", name: orgName, url: SITE.url },
        about: about,
        mainEntity: { "@id": pageUrl + "#list" },
      },
      {
        "@type": "ItemList",
        "@id": pageUrl + "#list",
        name: originName,
        itemListElement: childItems,
      },
      {
        "@type": "BreadcrumbList",
        "@id": pageUrl + "#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: homeLabel, item: SITE.url + (isJa ? "/ja/" : "/") },
          { "@type": "ListItem", position: 2, name: originName, item: pageUrl },
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
