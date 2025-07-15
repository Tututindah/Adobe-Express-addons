import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

addOnUISdk.ready.then(async () => {
  const { runtime } = addOnUISdk.instance;
  const sandboxProxy = await runtime.apiProxy("documentSandbox");

  const checkBtn = document.getElementById("checkDesign");
  const resultBox = document.getElementById("result");

  if (sandboxProxy.checkFontAndColorHarmony) {
    checkBtn.disabled = false;
  } else {
    resultBox.textContent = "Font & color harmony API not supported.";
    return;
  }

  checkBtn.addEventListener("click", debounce(async () => {
    try {
      const result = await sandboxProxy.checkFontAndColorHarmony();
      displayResults(result);
    } catch (e) {
      console.error("Error in checkFontAndColorHarmony:", e);
      resultBox.textContent = `Error: ${e.message}`;
    }
  }, 500));

  function getBarColor(score) {
    if (score <= 60) {
      const g = Math.round((score / 60) * 255);
      return `rgb(255, ${g}, 0)`; // red → yellow
    } else {
      const r = Math.round(255 - ((score - 60) / 40) * 255);
      return `rgb(${r}, 255, 0)`; // yellow → green
    }
  }

  function displayResults(result) {
    const { fonts, colors, fontScore, fontExplanation, colorScore, colorExplanation, fontRecs, colorRecs } = result;

    const fontBar = `
      <div class="recommendation-card">
        <div class="font-title">Font Harmony</div>
        <div style="display: flex; align-items: flex-end; height: 120px;">
          <div class="score-bar-vertical-container">
            <div class="score-bar-vertical" style="height: ${fontScore}%; background: ${getBarColor(fontScore)};"></div>
          </div>
          <div class="score-label">${fontScore}/100</div>
        </div>
        <div style="font-size: 13px; margin-top: 8px;">${fontExplanation}</div>
      </div>
    `;

    const colorBar = `
      <div class="recommendation-card">
        <div class="font-title">Color Harmony</div>
        <div style="display: flex; align-items: flex-end; height: 120px;">
          <div class="score-bar-vertical-container">
            <div class="score-bar-vertical" style="height: ${colorScore}%; background: ${getBarColor(colorScore)};"></div>
          </div>
          <div class="score-label">${colorScore}/100</div>
        </div>
        <div style="font-size: 13px; margin-top: 8px;">${colorExplanation}</div>
      </div>
    `;

    const fontRecsHtml = fontRecs.map(r => `
      <div class="recommendation-card">
        <div class="font-title">Font Recommendation for ${r.font}</div>
        ${r.recommendations.map(rec => `
          <div class="recommendation-item">
            <div class="score-bar-vertical-container">
              <div class="score-bar-vertical" style="height: ${rec.score}%; background: ${getBarColor(rec.score)};"></div>
            </div>
            <div><strong>${rec.font}</strong> (${rec.score}/100) – ${rec.explanation}</div>
          </div>
        `).join("")}
      </div>
    `).join("");

    const colorRecsHtml = `
      <div class="recommendation-card">
        <div class="font-title">Color Recommendations</div>
        ${colorRecs.map(c => `
          <div style="margin-bottom: 8px;">
            <div style="width: 24px; height: 24px; background: ${c.color}; display: inline-block; border-radius: 4px;"></div>
            <span style="margin-left: 8px;">${c.color} - ${c.explanation}</span>
          </div>
        `).join("")}
      </div>
    `;

    resultBox.innerHTML = `
      <div class="recommendation-card">
        <p><strong>Detected Fonts:</strong> ${fonts.join(", ")}</p>
        <p><strong>Detected Colors:</strong> ${colors.join(", ")}</p>
      </div>
      ${fontBar}
      ${colorBar}
      ${fontRecsHtml}
      ${colorRecsHtml}
    `;
  }
});
