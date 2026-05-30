import type { APIRoute } from "astro";
import { picks } from "../data/picks";
import { SITE } from "../data/site";

// EN の llms.txt。picks 全件のリンクを picks.ts(SSOT)から自動生成する(保守ゼロ)。
// URL は slug で正準・不変。代表名は games[leadIndex].name_en(代表エンティティ AEO ルール準拠・games[0] 直読みしない)。
// NOTE: 下の `> 要約` 1 段落は picks.ts / site.ts に無い新規 prose のため文言は po 確定マター(暫定値)。
//   将来 site.ts に descriptionEn 等の SSOT フィールドを足してそこから読む方が純度が高い(最小変更を優先し暫定で endpoint に置く)。
export const GET: APIRoute = () => {
  const lines = Object.entries(picks).map(
    ([slug, p]) => `- [${p.games[p.leadIndex].name_en}](${SITE.url}/picks/${slug}/): ${p.en.description}`
  );
  const body = [
    `# ${SITE.nameEn}`,
    ``,
    `> Hidden Japanese games, surfaced for the West. We find buried gems loved in Japan but unread abroad (often walled off by language) and explain the one taste each delivers, traced to its lineage.`,
    ``,
    `## Picks`,
    ...lines,
    ``,
    `## About`,
    `- [Lineage](${SITE.url}/lineage/): the taste families behind the picks`,
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
