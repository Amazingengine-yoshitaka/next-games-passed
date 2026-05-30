// ビルド前: 各 pick の OG/Twitter カード PNG(1200x630)を public/og/ に生成する。
//   en: /og/<slug>.png  ja: /og/<slug>.ja.png  既定: /og/default(.ja).png
//   値は picks.ts / site.ts / representativeName から取る(SSOT・固有名詞をベタ書きしない)。
//   背景: public/og-src/<appid>.jpg を cover 合成。無ければブランドフォールバックカード。
//   picks に 1 エントリ足せば、その slug の en/ja カードが手書きゼロで自動生成される。
//
// 責務(SRP): 合成だけ(決定的・ローカル)。取得は fetch-steam-headers が担う。
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { picks, steamAppId } from "../src/data/picks.ts";
import { SITE } from "../src/data/site.ts";
import { representativeName } from "../src/lib/jsonld.ts";
import { renderTextLayer, renderFullCard } from "./og-render.mjs";
import { CARD, OG_SRC_DIR, OG_OUT_DIR, FONTS, ogFileName } from "./og-card.config.mjs";

const LANGS = ["en", "ja"] as const;
type Lang = (typeof LANGS)[number];

// lead の tag を「味ラベル」として取る(Buried gem / 埋もれた名作)。SSOT(picks 由来)。
function leadLabel(pick: any, lang: Lang): string {
  const lead = pick.games[pick.leadIndex];
  return lang === "ja" ? lead.tag_ja : lead.tag_en;
}

// ブランド名(Uncut / 原石)。site.ts SSOT。
function brandName(lang: Lang): string {
  return lang === "ja" ? SITE.name : SITE.nameEn;
}

// satori 用フォント(en/ja 両グリフを 1 ファミリでカバー)。
async function loadFonts() {
  const bold = await fs.readFile(FONTS.bold);
  const regular = await fs.readFile(FONTS.regular);
  return [
    { name: FONTS.family, data: bold, weight: 700 as const, style: "normal" as const },
    { name: FONTS.family, data: regular, weight: 400 as const, style: "normal" as const },
  ];
}

// 背景 JPG があれば cover 合成 + テキストレイヤ、無ければブランドフルカード。
async function buildCard(card: any, fonts: any, appid: string | null): Promise<Buffer> {
  const srcPath = appid ? path.join(OG_SRC_DIR, appid + ".jpg") : null;
  let hasBg = false;
  if (srcPath) {
    try {
      const st = await fs.stat(srcPath);
      hasBg = st.size > 0;
    } catch {
      hasBg = false;
    }
  }
  if (!hasBg) {
    // フォールバック: ブランド背景込みの完結カード(og:image が空にならない)。
    return renderFullCard(card, fonts);
  }
  // 背景 JPG を 1200x630 cover -> 透過テキストレイヤを上に composite。
  const bg = await sharp(srcPath as string)
    .resize(CARD.width, CARD.height, { fit: "cover", position: "centre" })
    .toColorspace("srgb")
    .toBuffer();
  const textLayer = await renderTextLayer(card, fonts);
  return sharp(bg)
    .composite([{ input: textLayer, top: 0, left: 0 }])
    .png()
    .toBuffer();
}

async function main() {
  await fs.mkdir(OG_OUT_DIR, { recursive: true });
  const fonts = await loadFonts();
  let count = 0;

  for (const slug of Object.keys(picks)) {
    const pick = (picks as any)[slug];
    const lead = pick.games[pick.leadIndex];
    const appid = steamAppId(lead && lead.steam);
    for (const lang of LANGS) {
      const card = {
        gameName: representativeName(pick, lang),
        label: leadLabel(pick, lang),
        brand: brandName(lang),
        isJa: lang === "ja",
      };
      const png = await buildCard(card, fonts, appid);
      const dest = path.join(OG_OUT_DIR, ogFileName(slug, lang === "ja"));
      await fs.writeFile(dest, png);
      console.log("[og]", dest, png.length, "bytes", appid ? "(bg " + appid + ")" : "(brand)");
      count++;
    }
  }

  // 既定 OG(ホーム/血統図用): ブランド + tagline。背景なしのブランドカード。
  for (const lang of LANGS) {
    const card = {
      gameName: brandName(lang),
      label: lang === "ja" ? SITE.tagline : SITE.taglineEn,
      brand: lang === "ja" ? SITE.nameEn : SITE.name,
      isJa: lang === "ja",
    };
    const png = await renderFullCard(card, fonts);
    const dest = path.join(OG_OUT_DIR, ogFileName("default", lang === "ja"));
    await fs.writeFile(dest, png);
    console.log("[og]", dest, png.length, "bytes (default)");
    count++;
  }

  console.log("[og] done", count, "cards");
}

main().catch((e) => {
  console.error("[og] fatal", e);
  process.exit(1);
});
