import type { APIRoute } from "astro";
import { picks } from "../../data/picks";
import { SITE } from "../../data/site";

// JA の llms.txt(任意・優先度は EN > JA)。picks 全件のリンクを picks.ts(SSOT)から自動生成する。
// URL は slug で正準・不変。代表名は games[leadIndex].name_ja(代表エンティティ AEO ルール準拠・games[0] 直読みしない)。
// NOTE: 下の `> 要約` 1 段落は picks.ts / site.ts に無い新規 prose のため文言は po 確定マター(暫定値・EN 版と対)。
export const GET: APIRoute = () => {
  const lines = Object.entries(picks).map(
    ([slug, p]) => `- [${p.games[p.leadIndex].name_ja}](${SITE.url}/ja/picks/${slug}/): ${p.ja.description}`
  );
  const body = [
    `# ${SITE.name}`,
    ``,
    `> 日本で埋もれた一本を、西へ。日本で愛されながら海外では読まれていない原石(多くは言語の壁で阻まれている)を見つけ、その一点の味を系譜まで辿って言葉にする。`,
    ``,
    `## Picks`,
    ...lines,
    ``,
    `## About`,
    `- [Lineage](${SITE.url}/ja/lineage/): この味の系譜`,
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
