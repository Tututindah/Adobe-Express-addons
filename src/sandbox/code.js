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

runtime.exposeApi({
  getDesignData: async () => {
    const root = editor.documentRoot;
    return extractFontsAndColors(root);
  },
  replaceFont: async (newFont) => {
    const root = editor.documentRoot;
    let changed = false;
    function traverse(node) {
      if (node.fullContent?.characterStyleRanges) {
        for (const range of node.fullContent.characterStyleRanges) {
          if (range.font) {
            range.font.postscriptName = newFont;
            changed = true;
          }
        }
      }
      if (node.allChildren) node.allChildren.forEach(traverse);
    }
    root.pages.forEach(p => p.artboards.forEach(ab => ab.allChildren.forEach(traverse)));
    return { changed };
  }
});
