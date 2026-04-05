import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/data/site.ts";

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
    }),
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ja"],
    routing: { prefixDefaultLocale: false },
  },
});
