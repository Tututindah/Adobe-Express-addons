import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

const { runtime } = addOnSandboxSdk.instance;

function start() {
    const sandboxApi = {
        checkFontHarmony: async () => {
        const selectedItems = editor?.selection?.items;
        const fontNames = new Set();

        if (!selectedItems || selectedItems.length === 0) {
            return {
                score: null,
                message: "No text selected. Please select at least one text element.",
                fonts: []
            };
        }

        for (const item of selectedItems) {
            if (item.text) {
                const fontName = item.textStyle?.font?.name;
                if (fontName) fontNames.add(fontName);
            }
        }

        const fonts = Array.from(fontNames);

        if (fonts.length < 2) {
            return {
                score: null,
                message: "Select at least two different fonts.",
                fonts
            };
        }

        const score = scoreFonts(fonts[0], fonts[1]);

        return {
            score,
            message: getScoreMessage(score),
            fonts
        };
        },


        getFontRecommendations: async () => {
            const selectedItems = editor?.selection?.items;
            const fontNames = new Set();

            if (!selectedItems || selectedItems.length === 0) {
                return { recommendedPairs: [] };
            }

            for (const item of selectedItems) {
                if (item.text) {
                    const fontName = item.textStyle?.font?.name;
                    if (fontName) fontNames.add(fontName);
                }
            }

            const fonts = Array.from(fontNames);
            const recommendedPairs = [];

            const fontPairMap = {
                "Roboto": ["Open Sans", "Lato"],
                "Lobster": ["Roboto Slab"],
                "Playfair Display": ["Lato", "Montserrat"],
                "Montserrat": ["Merriweather", "Open Sans"],
                "Comic Sans": ["Arial", "Lato"]
            };

            for (const font of fonts) {
                if (fontPairMap[font]) {
                    fontPairMap[font].forEach(reco => {
                        recommendedPairs.push({ from: font, to: reco });
                    });
                }
            }

            return { recommendedPairs };
        }

    };

    function scoreFonts(font1, font2) {
        if (font1 === font2) return 95;
        const incompatible = [["Comic Sans", "Roboto"], ["Lobster", "Helvetica"]];
        if (incompatible.some(pair => pair.includes(font1) && pair.includes(font2))) return 40;
        return 75;
    }

    function getScoreMessage(score) {
        if (score >= 90) return "Excellent font pairing!";
        if (score >= 70) return "Good pairing, visually consistent.";
        if (score >= 50) return "Acceptable but could be better.";
        return "Fonts may clash. Consider alternatives.";
    }

    runtime.exposeApi(sandboxApi);
}

start();
