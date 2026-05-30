import type { APIRoute } from "astro";
import { SITE } from "../data/site";

// AI クローラを block せず、Sitemap を明示する。
// 輸出が目的なので training クローラも含めて全 allow。
// UA は明示列挙して「block していない」ことを監査可能にする(AI_AGENTS が単一の真実源)。
// 注意: Claude-Web / anthropic-ai は deprecated なので入れない。
const AI_AGENTS = [
  // AI search / retrieval (引用に直結)
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  // AI training (輸出が目的なので学習にも食わせる)
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "CCBot",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "Bytespider",
];

export const GET: APIRoute = () => {
  const named = AI_AGENTS.map((ua) => `User-agent: ${ua}\nAllow: /`).join("\n\n");
  // ドメイン直書きを避け SITE.url から組む(SSOT)。Sitemap は @astrojs/sitemap の起点を指す。
  const body = `${named}\n\nUser-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap-index.xml\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
