// OG カード生成のレイアウト定数 (SSOT・マジックナンバー禁止 CLAUDE.md 3)。
// 固有名詞 (ブランド名/ラベル/URL) はここに書かない。値は picks.ts / site.ts から取る。
// ここはレイアウト(寸法・色・余白・不透明度)と取得元ホストだけを持つ(脳と体の分離)。

export const CARD = {
  width: 1200,
  height: 630,
  // 背景 JPG に敷く暗幕の不透明度 (上->中->下で濃くしテキスト可読性を確保)。
  //   上部にも軽く敷き、背景の明るいロゴ/イラストにテキストが負けないようにする。
  overlayTop: 0.34,
  overlayMid: 0.5,
  overlayBottom: 0.82,
  // フォールバック (Steam 画像なし) カードのブランド背景。
  fallbackBgTop: "#0d1b2a",
  fallbackBgBottom: "#1b3a4b",
  // 文字色・アクセント。
  fg: "#ffffff",
  fgMuted: "#c7d2da",
  accent: "#7ee0c9",
  // レイアウト余白・サイズ。
  padX: 72,
  padY: 64,
  gameNameSize: 76,
  gameNameSizeJa: 68,
  gameNameLineHeight: 1.12,
  labelSize: 34,
  brandSize: 30,
  // ラベルのピル装飾。
  pillPadX: 22,
  pillPadY: 10,
  pillRadius: 8,
  pillBg: "rgba(126,224,201,0.16)",
  pillBorder: "rgba(126,224,201,0.55)",
};

// Steam ヘッダー画像の取得元 (優先順)。host/path だけ定数化し appid のみ可変 (SSOT)。
// 直リンクしない方針: ビルド前に repo へ取得して使う。
export const STEAM_HEADER_SOURCES = [
  "https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/header.jpg",
  "https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg",
];

// 取得物 (Steam JPG) の保存先 (appid 単位キャッシュ・複数 pick で共有)。
export const OG_SRC_DIR = "public/og-src";
// 生成物 (合成 PNG) の出力先。dist/og/... として配信される。
export const OG_OUT_DIR = "public/og";

// 埋め込みフォント (satori 必須)。NotoSansCJKjp は en/ja 両グリフを 1 ファミリでカバー。
export const FONTS = {
  bold: "scripts/assets/fonts/NotoSansJP-Bold.otf",
  regular: "scripts/assets/fonts/NotoSansJP-Regular.otf",
  family: "Noto Sans JP",
};

// OG カードのファイル名 (<base>(.ja).png)。命名規約を 1 箇所に集約 (SSOT)。
//   gen-og-cards の出力名・Base/PickPage の og:image URL が同じ規約を共有する(ズレ防止)。
export function ogFileName(base, isJa) {
  return base + (isJa ? ".ja" : "") + ".png";
}
// og:image の公開 URL パス (/og/<base>(.ja).png)。配信は public/og がルートに展開される。
export function ogUrlPath(base, isJa) {
  return "/og/" + ogFileName(base, isJa);
}

// OG meta のカード規格固定語 (SSOT §12 の精神・直書き散在を避ける)。
export const OG_META = {
  type: "website",
  twitterCard: "summary_large_image",
  imageWidth: "1200",
  imageHeight: "630",
  localeEn: "en_US",
  localeJa: "ja_JP",
};
