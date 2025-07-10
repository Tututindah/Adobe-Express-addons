import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

addOnUISdk.ready.then(async () => {
    console.log("✅ addOnUISdk ready.");

    const { runtime } = addOnUISdk.instance;
    const sandboxProxy = await runtime.apiProxy("documentSandbox");

    const checkFontsButton = document.getElementById("checkFonts");
    const resultBox = document.getElementById("result");
    const fontSelect = document.getElementById("recommendedPairs");

    // Enable Check Font Harmony button
    checkFontsButton.addEventListener("click", async () => {
        const result = await sandboxProxy.checkFontHarmony();
        resultBox.innerHTML = `
            <p><strong>Fonts Detected:</strong> ${result.fonts.join(", ")}</p>
            <p><strong>Score:</strong> ${result.score ?? "N/A"}</p>
            <p><strong>Feedback:</strong> ${result.message}</p>
        `;
    });

    checkFontsButton.disabled = false;

    // Get font recommendations from sandbox
    const recoResult = await sandboxProxy.getFontRecommendations();
    const recommendedPairs = recoResult.recommendedPairs || [];

    recommendedPairs.forEach(pair => {
        const option = document.createElement("option");
        option.value = `${pair.from}|${pair.to}`;
        option.textContent = `${pair.from} + ${pair.to}`;
        fontSelect.appendChild(option);
    });

    // Handle font pair selection from dropdown
    fontSelect.addEventListener("change", () => {
        const value = fontSelect.value;
        if (!value) return;

        const [font1, font2] = value.split("|");
        const score = scoreFonts(font1, font2);
        const message = getScoreMessage(score);

        resultBox.innerHTML = `
            <p><strong>Recommended Fonts:</strong> ${font1}, ${font2}</p>
            <p><strong>Score:</strong> ${score}</p>
            <p><strong>Feedback:</strong> ${message}</p>
        `;
    });

    // Helper scoring logic (same as in sandbox)
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
});
