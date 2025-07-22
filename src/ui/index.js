import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

const GEMINI_API_KEY = "keyGemini";

addOnUISdk.ready.then(async () => {
    const style = document.createElement("style");
    style.textContent = `
    body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        color: #212121;
        background: #ffffff;
        margin: 16px;
    }
    .card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 1px 4px rgb(0 0 0 / 0.1);
        padding: 20px 24px;
        margin: 14px 0;
        transition: box-shadow 0.3s ease;
    }
    .card:hover {
        box-shadow: 0 4px 14px rgb(0 0 0 / 0.15);
    }
    .header-card {
        display: flex;
        align-items: center;
        gap: 14px;
        font-weight: 600;
        font-size: 1.1rem;
        color: #222;
    }
    .score-card p {
        margin: 8px 0;
        font-size: 1rem;
        line-height: 1.5;
        color: #444;
    }
    .score-card strong {
        color: #0078d4; /* Adobe Express brand blue */
    }
    .score-card > div {
        border-radius: 10px;
        overflow: hidden;
        margin-top: 10px;
        height: 20px;
        background: #e5e5e5;
    }
    .score-card > div > div {
        height: 100%;
        transition: width 0.5s ease;
        border-radius: 10px 0 0 10px;
    }
    .bottom-card p {
        margin: 12px 0 8px;
        font-weight: 600;
        font-size: 1.05rem;
        color: #222;
    }
    .bottom-card > div {
        background: #f7f9fc; /* lighter subtle blue */
        border: 1.5px solid #c6dafc; /* soft blue border */
        border-radius: 14px;
        padding: 18px 22px;
        max-height: 180px;
        overflow-y: auto;
        font-size: 1rem;
        color: #333;
        white-space: pre-wrap;
        box-sizing: border-box;
        line-height: 1.5;
        box-shadow: inset 0 0 6px rgb(0 120 212 / 0.1);
    }
    .bottom-card p strong {
        color: #004a9f; /* darker blue accent */
    }
    button {
        background-color: #0078d4;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 20px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
        user-select: none;
        box-shadow: 0 3px 8px rgb(0 120 212 / 0.5);
    }
    button:disabled,
    button[disabled] {
        background-color: #a8b9d6;
        cursor: not-allowed;
        box-shadow: none;
    }
    button:hover:not(:disabled) {
        background-color: #005a9e;
    }
    .header-card span {
        font-style: italic;
        color: #6b6b6b;
        font-size: 1rem;
    }
    `;

  document.head.appendChild(style);

  const { runtime } = addOnUISdk.instance;
  const sandboxProxy = await runtime.apiProxy("documentSandbox");

  const checkBtn = document.getElementById("checkDesign");
  const resultBox = document.getElementById("result");
  const autofixBtn = document.getElementById("autofixFont");

  if (!sandboxProxy.getDesignData || !sandboxProxy.replaceFont) {
    resultBox.textContent = "API not supported.";
    return;
  }

  checkBtn.disabled = false;

  checkBtn.addEventListener("click", async () => {
    resultBox.innerHTML = `
      <div class="card header-card">
        <button id="checkDesign" disabled>Analyzing design...</button>
      </div>`;
    autofixBtn.disabled = true;

    try {
      const design = await sandboxProxy.getDesignData();
      const suggestion = await getGeminiRecommendations(design.fonts, design.textObjects || []);
      displayResults(design, suggestion);
      if (suggestion.font) autofixBtn.disabled = false;
    } catch (e) {
      resultBox.innerHTML = `<div class="card header-card error">Error: ${e.message}</div>`;
    }
  });

  autofixBtn.addEventListener("click", async () => {
    try {
      const font = resultBox.dataset.suggestedFont;
      const res = await sandboxProxy.replaceFont(font);
      alert(res.changed ? `Replaced fonts to: ${font}` : "No fonts replaced");
    } catch (e) {
      alert("Auto-fix failed: " + e.message);
    }
  });

  async function getGeminiRecommendations(fonts, textObjects) {
    const prompt = `
Analyze this design's font harmony.

Fonts used: ${fonts.join(", ")}

Text elements:
${textObjects.map(obj => `- "${obj.content}" (${obj.role}, using ${obj.font})`).join("\n")}

Please answer using JSON, with keys:
score, comment, font
Example:
{"score": 35, "comment": "...", "font": "Source Sans Pro"}
    `;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await resp.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        console.warn("Failed to parse JSON:", e);
      }
    }

    return {
      score: 0,
      comment: rawText,
      font: null
    };
  }

  function displayResults(design, suggestion) {
    const { fonts } = design;
    const { score, comment, font } = suggestion;

    const bar = `
      <div>
        <div style="width:${score}%;background:${score > 60 ? '#4caf50' : '#f44336'};"></div>
      </div>
    `;

    resultBox.innerHTML = `
      <div class="card header-card">
        <button id="checkDesign" disabled>Check Design</button>
        <span>Analyzed</span>
      </div>

      <div class="card score-card">
        <p><strong>Fonts:</strong> ${fonts.join(", ")}</p>
        <p><strong>Harmony Score:</strong> ${score}/100</p>
        ${bar}
      </div>

      <div class="card bottom-card">
        <p><strong>Comment:</strong></p>
        <div>${comment}</div>
        ${font ? `<p style="margin-top: 12px;"><strong>Suggested Font:</strong> ${font}</p>` : ""}
        ${font ? `<button id="autofixFont" style="margin-top: 8px;">Auto Fix Font</button>` : ""}
      </div>
    `;

    resultBox.dataset.suggestedFont = font || "";

    const newAutofixBtn = document.getElementById("autofixFont");
    if (newAutofixBtn) {
      newAutofixBtn.addEventListener("click", async () => {
        try {
          const fontName = resultBox.dataset.suggestedFont;
          const res = await sandboxProxy.replaceFont(fontName);
          alert(res.changed ? `Replaced fonts to: ${fontName}` : "No fonts replaced");
        } catch (e) {
          alert("Auto-fix failed: " + e.message);
        }
      });
    }

    autofixBtn.style.display = "none";
  }
});
