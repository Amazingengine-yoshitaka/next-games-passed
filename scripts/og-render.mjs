// OG カードの「体(描画)」。satori で SVG を作り resvg で PNG 化する純レイアウト。
//   値(ゲーム名/ラベル/ブランド)は呼び出し側が渡す。ここに固有名詞をベタ書きしない(脳と体の分離)。
//   2 モード: textLayer(背景 JPG の上に重ねる透過テキスト) / fullCard(ブランド背景込み完結カード)。
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { CARD, FONTS } from "./og-card.config.mjs";

// satori は要素を {type,props} のプレーンオブジェクトで受ける(JSX 不要)。
function el(type, style, children) {
  return { type, props: { style, children } };
}

// ラベルのピル(Buried gem / 埋もれた名作)。
function pill(text) {
  return el(
    "div",
    {
      display: "flex",
      alignSelf: "flex-start",
      fontSize: CARD.labelSize,
      color: CARD.accent,
      backgroundColor: CARD.pillBg,
      border: "2px solid " + CARD.pillBorder,
      borderRadius: CARD.pillRadius,
      padding: CARD.pillPadY + "px " + CARD.pillPadX + "px",
    },
    text
  );
}

// カード本文(下: ピル -> ゲーム名 -> ブランド)。共通レイアウト。
function cardInner({ gameName, label, brand, isJa, transparent }) {
  const nameSize = isJa ? CARD.gameNameSizeJa : CARD.gameNameSize;
  return el(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      width: CARD.width,
      height: CARD.height,
      padding: CARD.padY + "px " + CARD.padX + "px",
      fontFamily: FONTS.family,
      // 背景: テキストレイヤは透過、フルカードはブランドのグラデ。
      backgroundColor: transparent ? "transparent" : CARD.fallbackBgBottom,
      backgroundImage: transparent
        ? "linear-gradient(180deg, rgba(0,0,0," +
          CARD.overlayTop +
          ") 0%, rgba(0,0,0," +
          CARD.overlayMid +
          ") 46%, rgba(0,0,0," +
          CARD.overlayBottom +
          ") 100%)"
        : "linear-gradient(160deg, " + CARD.fallbackBgTop + " 0%, " + CARD.fallbackBgBottom + " 100%)",
    },
    [
      pill(label),
      el(
        "div",
        {
          display: "flex",
          marginTop: 18,
          fontSize: nameSize,
          lineHeight: CARD.gameNameLineHeight,
          fontWeight: 700,
          color: CARD.fg,
        },
        gameName
      ),
      el(
        "div",
        {
          display: "flex",
          marginTop: 22,
          fontSize: CARD.brandSize,
          color: CARD.fgMuted,
        },
        brand
      ),
    ]
  );
}

// satori -> SVG -> resvg -> PNG。fonts = [{name,data,weight,style}]。
async function renderPng(node, fonts, { transparent }) {
  const svg = await satori(node, { width: CARD.width, height: CARD.height, fonts });
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: CARD.width },
    background: transparent ? "rgba(0,0,0,0)" : undefined,
  });
  return resvg.render().asPng();
}

// 背景 JPG の上に重ねる透過テキスト PNG(sharp で合成する用)。
export async function renderTextLayer(card, fonts) {
  const node = cardInner({ ...card, transparent: true });
  return renderPng(node, fonts, { transparent: true });
}

// 背景 JPG が無い時の完結カード(ブランド背景込み)。
export async function renderFullCard(card, fonts) {
  const node = cardInner({ ...card, transparent: false });
  return renderPng(node, fonts, { transparent: false });
}
