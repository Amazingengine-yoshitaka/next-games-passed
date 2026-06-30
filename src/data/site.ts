// SSOT: サイト全体の固有値。ここを変えれば全ページに反映 (CLAUDE.md 12)。
// 時間相対の記述 (N年・埋もれてる 等) はハードコードしない。動的計算 or 日付明示。

export const SITE = {
  name: "原石",
  nameEn: "Uncut",
  domain: "next.games.passed.jp",
  url: "https://next.games.passed.jp",
  tagline: "埋もれた一本に、最初の合格を。",
  taglineEn: "A buried gem, its first pass.",
  ga4Id: "G-YVLQEZPN7G",
  adsenseId: "ca-pub-7523814645434890",
} as const;

// 運営者情報 (SSOT)。確定事実のみ (english.passed.jp 実測で揃える・捏造禁止)。
// 代表者個人名・本社住所・電話・連絡先メールは english.passed.jp 同様に非公開 (揃える)。
// 連絡導線は企業サイト (companyUrl) とする (向こうもメール非公開・/contact/ 相当)。
//   - name: 運営主体の通称 (フッター copy 等の短縮表記)。
//   - legalNameEn / legalNameJa: 法人の正式名称 (en/ja)。About・privacy の運営者表記で参照。
//   - companyUrl: 企業サイト URL。About/privacy/フッターの外部リンク導線で参照する。
//   - contactFormUrl: 問い合わせ Google フォーム URL。/contact/ ページの導線で参照する。
//       姉妹サイト english.passed.jp の問い合わせと同一フォーム (窓口一本化・本人指示)。
//   - parentName / parentUrl: passed.jp ネットワークの親ポータル。フッターの "Operated by" で参照。
//   - copyrightStartYear: 著作権表記の開始年 (現在年は new Date().getFullYear() で動的算出)。
//   - foundedYear: 会社設立年 (english.passed.jp で確証された会社の事実)。About で参照。
export const OPERATOR = {
  name: "Amazing engine",
  legalNameEn: "Amazing engine Co., Ltd.",
  legalNameJa: "Amazing engine株式会社",
  companyUrl: "https://amazingengine.co.jp/",
  contactFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeso-tMdC9_uzMlviFZcqx5TXms1eR5IETGbLrdRaH-RvXEYg/viewform?usp=sf_link",
  parentName: "passed.jp",
  parentUrl: "https://passed.jp/",
  copyrightStartYear: 2026,
  foundedYear: 2015,
} as const;

// 著作権表記の年レンジを動的に算出。開始年=現在年なら単年表記 ("2026")、
// 以降は "2026-<現在年>"。現在年はベタ書きしない。
export function copyrightRange(now: Date = new Date()): string {
  const start = OPERATOR.copyrightStartYear;
  const current = now.getFullYear();
  return start >= current ? String(start) : start + "-" + current;
}

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
