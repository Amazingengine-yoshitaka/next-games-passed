import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/data/site.ts";
import { picks } from "./src/data/picks.ts";
import { JST_MIDNIGHT_SUFFIX } from "./src/lib/jsonld.ts";

// pick URL の slug から picks.ts の published を引き lastmod に注入する(SSOT・直書きしない)。
//   対象は /picks/<slug>/ と /ja/picks/<slug>/ の両方。pick 以外は lastmod 省略(best effort)。
//   日付は published("YYYY-MM-DD")を JST 00:00:00 として ISO 化する(時刻の捏造を避け日付境界で固定)。
function pickLastmod(url) {
  const m = /\/picks\/([a-z0-9-]+)\/?$/.exec(new URL(url).pathname);
  if (!m) return undefined;
  const pick = picks[m[1]];
  if (!pick || !pick.published) return undefined;
  return new Date(pick.published + JST_MIDNIGHT_SUFFIX).toISOString();
}

// 静的出力 (Cloudflare Pages がそのまま配信)。
// SSR が必要になったら @astrojs/cloudflare adapter を追加する。
export default defineConfig({
  // site URL は SITE.url を唯一の真実源にする (SSOT)。直書き重複を避ける。
  site: SITE.url,
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", ja: "ja" },
      },
      serialize(item) {
        const lastmod = pickLastmod(item.url);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ja"],
    routing: { prefixDefaultLocale: false },
  },
});
