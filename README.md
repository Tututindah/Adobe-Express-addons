
# Font Harmony Checker Add-on for Adobe Express

This add-on analyzes the font harmony of your Adobe Express design and provides a harmony score, comments, and font suggestions using Google Gemini AI. You can also automatically apply suggested font fixes to your design.


## Features

- Analyze fonts used in the current design for harmony and consistency.
- Receive a harmony score (0-100) and detailed comments.
- Get font replacement suggestions based on AI recommendations.
- One-click auto-fix to replace fonts across the design.
- Clean and modern UI styled to match Adobe Express design principles.

---

## SandBox Run

1. Clone the repository:
   ```bash
   git clone https://github.com/Tututindah/Adobe-Express-addons
   cd Adobe-Express-addons
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the development server:

   ```bash
   npm start
   ```
4. Make sure your enable addons and test addons on express
5. open adobe express [Adobe Express](https://express.adobe.com/)
6. open new project / canvas
7. add on default its run on port 5241
---

## Usage

1. Click **Check Design** to analyze the fonts used in your current design.
2. Wait for the AI-powered analysis to complete.
3. Review the harmony score, comments, and suggested font (if any).
4. If a font suggestion is available, click **Auto Fix Font** to replace fonts in your design automatically.

---

## Requirements

* Adobe Express add-on SDK
* Google Gemini API key (replace `GEMINI_API_KEY` in the code)
* ssl configuration
---

## Configuration

* Replace the placeholder `GEMINI_API_KEY` in the script with your valid Google Gemini API key.
* Ensure your environment supports Adobe Express add-on SDK APIs (`documentSandbox`).
* Activate Sandbox test on Adobe Express.

---

## Notes

* The add-on relies on Google Gemini AI to analyze font harmony and generate recommendations.
* The auto-fix feature will replace fonts with the suggested font.
* generates localhost cert ssl 
  ```bash
  npx @adobe/ccweb-add-on-ssl setup --hostname localhost
  ```
---

## License

This add-on is open source and free to use and modify.

---

## Contact

For questions or support, please contact:
[mee.dii2730@gmail.com](mailto:mee.dii2730@gmail.com)

---

## Links

* [GitHub Repository](https://github.com/Tututindah/Adobe-Express-addons)
* [Documentation](https://app.gitbook.com/o/bDKCknw96bQBBCGWcP3r/s/iA9lC8vgzEC0njLvzryR/)
* [video](https://www.youtube.com/watch?si=P8lhWIWuvENL2Zyz&v=JNjNFi1i-Zs&feature=youtu.be)
