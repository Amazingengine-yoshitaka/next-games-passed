// ビルド前: 各 pick の lead が指す Steam appid の header.jpg を repo へ取得する。
//   直リンクしない(脆い)。public/og-src/<appid>.jpg に appid 単位でキャッシュ(複数 pick 共有)。
//   取得対象は picks.ts から導出 = picks に 1 エントリ足せば自動で対象に入る(手書き不要)。
//   1 枚の取得失敗で全体は止めない(fail-soft)。失敗 appid はブランドフォールバックに落ちる。
//
// 責務(SRP): ネットワーク取得とキャッシュだけ。合成は gen-og-cards が担う。
import { promises as fs } from "node:fs";
import path from "node:path";
import { picks, steamAppId } from "../src/data/picks.ts";
import { STEAM_HEADER_SOURCES, OG_SRC_DIR } from "./og-card.config.mjs";

const FORCE = process.argv.includes("--force");

// 各 pick の lead が指す appid を distinct 抽出(計算だけ・副作用なし)。
function leadAppIds(): string[] {
  const ids: string[] = [];
  for (const slug of Object.keys(picks)) {
    const pick = (picks as any)[slug];
    const lead = pick.games[pick.leadIndex];
    const id = steamAppId(lead && lead.steam);
    if (id && ids.indexOf(id) === -1) ids.push(id);
  }
  return ids;
}

// 1 appid を CDN 優先順で取得し repo へ保存する。取得できたら true。
async function fetchHeader(appid: string): Promise<boolean> {
  const dest = path.join(OG_SRC_DIR, appid + ".jpg");
  if (!FORCE) {
    try {
      const st = await fs.stat(dest);
      if (st.size > 0) {
        console.log("[fetch] cache hit", dest);
        return true;
      }
    } catch {
      // 未取得。続行。
    }
  }
  for (const tmpl of STEAM_HEADER_SOURCES) {
    const url = tmpl.replace("{appid}", appid);
    try {
      const r = await fetch(url);
      if (!r.ok) {
        console.warn("[fetch] miss", r.status, url);
        continue;
      }
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length === 0) {
        console.warn("[fetch] empty body", url);
        continue;
      }
      await fs.writeFile(dest, buf);
      console.log("[fetch] saved", dest, buf.length, "bytes");
      return true;
    } catch (e) {
      console.warn("[fetch] error", url, (e as Error).message);
    }
  }
  console.warn("[fetch] FAILED all sources for appid", appid, "-> brand fallback");
  return false;
}

async function main() {
  await fs.mkdir(OG_SRC_DIR, { recursive: true });
  const ids = leadAppIds();
  console.log("[fetch] lead appids:", ids.join(", "));
  let ok = 0;
  for (const id of ids) {
    if (await fetchHeader(id)) ok++;
  }
  console.log("[fetch] done", ok, "/", ids.length, "headers available");
}

main().catch((e) => {
  // スクリプト自体の致命的失敗は出す(fail-fast)。取得失敗(個別)は warn で継続済み。
  console.error("[fetch] fatal", e);
  process.exit(1);
});
