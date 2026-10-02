import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { marked } from 'marked';

const mdPath = path.resolve('documentation', 'NASA_SPACE_APPS_PROJECT_SUMMARY_BN.md');
const pdfDir = path.resolve('documentation', 'pdf');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

const mdContent = fs.readFileSync(mdPath, 'utf8');
const htmlBody = marked.parse(mdContent);

const htmlTemplate = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>NASA Space Apps 2026 - Project Documentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: 'Hind Siliguri', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13.5px;
      line-height: 1.65;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-family: 'Outfit', 'Hind Siliguri', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 6px;
      border-bottom: 2px solid #ea580c;
      padding-bottom: 8px;
    }
    h2 {
      font-family: 'Outfit', 'Hind Siliguri', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #1e3a8a;
      margin-top: 18px;
      margin-bottom: 8px;
    }
    h3 {
      font-family: 'Hind Siliguri', sans-serif;
      font-size: 14.5px;
      font-weight: 700;
      color: #0369a1;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    p {
      margin-top: 0;
      margin-bottom: 10px;
    }
    hr {
      border: none;
      height: 1px;
      background: #e2e8f0;
      margin: 14px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 12.5px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 10px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
    }
    strong {
      color: #0f172a;
      font-weight: 600;
    }
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 6px;
      font-family: 'Consolas', monospace;
      font-size: 11px;
      line-height: 1.4;
      overflow-x: auto;
      margin: 12px 0;
    }
    blockquote {
      margin: 16px 0;
      padding: 12px 16px;
      background: #fff7ed;
      border-left: 4px solid #ea580c;
      border-radius: 0 6px 6px 0;
      font-style: italic;
      color: #9a3412;
    }
    .header-badge {
      display: inline-block;
      background: #ffedd5;
      color: #c2410c;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;

const tempHtmlPath = path.resolve('documentation', 'temp_render.html');
const outputPdfPath = path.join(pdfDir, 'NASA_SPACE_APPS_PROJECT_SUMMARY_BN.pdf');

fs.writeFileSync(tempHtmlPath, htmlTemplate, 'utf8');

// Find browser executable
let browserPath = '';
if (fs.existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe')) {
  browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
} else if (fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')) {
  browserPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

if (!browserPath) {
  console.error('No headless browser found to print PDF.');
  process.exit(1);
}

try {
  console.log(`Rendering PDF using ${browserPath}...`);
  const fileUrl = `file:///${tempHtmlPath.replace(/\\/g, '/')}`;
  const cmd = `"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${outputPdfPath}" "${fileUrl}"`;
  execSync(cmd);
  console.log(`✅ PDF created successfully at: ${outputPdfPath}`);
} catch (err) {
  console.error('Error generating PDF:', err);
} finally {
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
}
