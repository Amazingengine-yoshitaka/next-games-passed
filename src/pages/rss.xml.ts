import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { picks } from "../data/picks";
import { SITE } from "../data/site";

// EN の RSS。picks.ts(SSOT)から手で items を組む(md が無いため pagesGlobToRssItems は使えない)。
// link は相対で書き context.site(= astro.config の site = SITE.url)が絶対 URL に解決する(SSOT)。
export function GET(context: APIContext) {
  const items = Object.entries(picks)
    .map(([slug, p]) => ({
      title: p.en.title,
      description: p.en.description,
      link: `/picks/${slug}/`, // directory format・URL 不変ルール準拠
      pubDate: new Date(p.published),
    }))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()); // 新着降順(鮮度シグナル)
  return rss({
    title: SITE.nameEn,
    description: SITE.tagline,
    site: context.site!, // astro.config の site(= SITE.url)から解決・SSOT
    items,
  });
}
