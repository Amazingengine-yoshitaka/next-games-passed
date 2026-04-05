// SSOT: サイト全体の固有値。ここを変えれば全ページに反映 (CLAUDE.md 12)。
// 時間相対の記述 (N年・埋もれてる 等) はハードコードしない。動的計算 or 日付明示。

export const SITE = {
  name: "原石",
  nameEn: "Uncut",
  domain: "next.games.passed.jp",
  url: "https://next.games.passed.jp",
  tagline: "埋もれた一本に、最初の合格を。",
  ga4Id: "G-YVLQEZPN7G",
  adsenseId: "ca-pub-7523814645434890",
} as const;

// 自社ゲーム Bit Oz の固有値 (名前・Steam・開発開始年を1箇所に集約)
export const BITOZ = {
  name: "Bit Oz -Wonder Crusher-",
  steam: "https://store.steampowered.com/app/2233830/",
  // memory 由来 (2020-)。違っていればここだけ直せば全箇所に反映される。
  devStartYear: 2020,
} as const;

// 開発年数を動的に計算 (ビルド時点の年で自動更新)。6年 をベタ書きしない。
export function bitozDevYears(now: Date = new Date()): number {
  return now.getFullYear() - BITOZ.devStartYear;
}
