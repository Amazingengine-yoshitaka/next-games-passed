import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { picks } from "../../data/picks";
import { SITE } from "../../data/site";

// JA の RSS。EN 版と同形で ja の prose と /ja/picks/ link を使う(picks.ts が SSOT)。
// link は相対で書き context.site が絶対 URL に解決する(SSOT・ドメイン直書きなし)。
export function GET(context: APIContext) {
  const items = Object.entries(picks)
    .map(([slug, p]) => ({
      title: p.ja.title,
      description: p.ja.description,
      link: `/ja/picks/${slug}/`, // directory format・URL 不変ルール準拠
      pubDate: new Date(p.published),
    }))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()); // 新着降順(鮮度シグナル)
  return rss({
    title: SITE.name,
    description: SITE.tagline,
    site: context.site!, // astro.config の site(= SITE.url)から解決・SSOT
    items,
  });
}
