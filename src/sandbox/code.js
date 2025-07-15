import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

const { runtime } = addOnSandboxSdk.instance;

function extractFontsAndColors(root) {
  const fonts = new Set();
  const colors = new Set();

  function traverse(node) {
    if (node.fullContent?.characterStyleRanges) {
      for (const range of node.fullContent.characterStyleRanges) {
        const font = range.font?.postscriptName;
        if (font) fonts.add(font);
      }
    }

    const fill = node.fill || node.background || node.color;
    if (fill?.value) colors.add(fill.value);

    if (node.allChildren) {
      for (const child of node.allChildren) traverse(child);
    }
  }

  for (const page of root.pages) {
    for (const artboard of page.artboards) {
      for (const node of artboard.allChildren) traverse(node);
    }
  }

  return { fonts: Array.from(fonts), colors: Array.from(colors) };
}

function getColorHarmonyScore(colors) {
  if (colors.length < 2) {
    return {
      score: 100,
      explanation: "Single color detected — naturally harmonious.",
      recommendations: []
    };
  }

  const score = colors.length > 5 ? 60 : 85;
  const explanation = score > 80 ? "Colors show balance in contrast." : "Too many colors reduce harmony.";

  const fallbackRecs = ["#FF6B6B", "#4ECDC4", "#FFE66D"].map(c => ({
    color: c,
    explanation: "Balanced and commonly harmonious palette."
  }));

  return {
    score,
    explanation,
    recommendations: fallbackRecs
  };
}

function getFontHarmonyScore(fonts) {
  if (fonts.length < 2) return {
    score: 100,
    explanation: "Single font used — perfect harmony.",
    recommendations: []
  };

  const score = fonts.length === 2 ? 85 : 65;
  const explanation = score > 80 ? "Font contrast is stylish and balanced." : "Too many fonts can cause visual noise.";

  const dummyRecs = fonts.map(font => ({
    font,
    recommendations: [
      { font: "Open Sans", score: 80, explanation: "Neutral and readable complement." },
      { font: "Lato", score: 78, explanation: "Soft sans-serif for contrast." }
    ]
  }));

  return { score, explanation, recommendations: dummyRecs };
}

runtime.exposeApi({
  checkFontAndColorHarmony: async () => {
    const root = editor.documentRoot;
    const { fonts, colors } = extractFontsAndColors(root);

    const fontResult = getFontHarmonyScore(fonts);
    const colorResult = getColorHarmonyScore(colors);

    return {
      fonts,
      colors,
      fontScore: fontResult.score,
      fontExplanation: fontResult.explanation,
      colorScore: colorResult.score,
      colorExplanation: colorResult.explanation,
      fontRecs: fontResult.recommendations,
      colorRecs: colorResult.recommendations
    };
  }
});
