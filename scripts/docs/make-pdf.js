import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { marked } from 'marked';

const mdPath = path.resolve('docs/project', 'PROJECT_SUBMISSION_STORYTELLING.md');
const pdfDir = path.resolve('docs/project', 'pdf');
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

const pdfOutputPath = path.join(pdfDir, 'RELICS_OF_THE_COSMIC_DUST_NASA_SPACE_APPS_SUBMISSION.pdf');
const mdContent = fs.readFileSync(mdPath, 'utf8');
const htmlBody = marked.parse(mdContent);
const imagesBaseDir = path.resolve('docs/project').replace(/\\/g, '/');

const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RELICS OF THE COSMIC DUST - NASA Space Apps 2026</title>
  <base href="file:///${imagesBaseDir}/">
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.55;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .banner {
      background: #0b3d91;
      color: #ffffff;
      padding: 18px 22px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      background: #d97706;
      color: #ffffff;
      font-size: 8pt;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 4px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .banner h1 {
      margin: 0 0 4px 0;
      font-size: 22pt;
      color: #ffffff;
    }
    .banner p {
      margin: 0;
      color: #93c5fd;
      font-size: 11pt;
    }
    h1 {
      font-size: 15pt;
      color: #0b3d91;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    h2 {
      font-size: 12.5pt;
      color: #d97706;
      margin-top: 16px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11pt;
      color: #0284c7;
      margin-top: 12px;
      margin-bottom: 4px;
      page-break-after: avoid;
    }
    p {
      margin: 0 0 8px 0;
      text-align: justify;
    }
    ul, ol {
      margin: 4px 0 10px 18px;
      padding: 0;
    }
    li {
      margin-bottom: 4px;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      margin: 10px 0 3px 0;
      display: block;
      page-break-inside: avoid;
    }
    em {
      display: block;
      font-size: 8pt;
      color: #64748b;
      text-align: center;
      margin-bottom: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background-color: #0b3d91;
      color: #ffffff;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    blockquote {
      background: #eff6ff;
      border-left: 3px solid #0284c7;
      margin: 10px 0;
      padding: 8px 12px;
      color: #1e3a8a;
      font-style: italic;
    }
    .footer {
      text-align: center;
      font-size: 8pt;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="banner">
    <div class="badge">NASA Space Apps Challenge 2026</div>
    <h1>RELICS OF THE COSMIC DUST</h1>
    <p>Abandoned but Not Forgotten: Storytelling About NASA’s Discarded Equipment on the Moon, Mars, and Deep Space</p>
  </div>
  ${htmlBody}
  <div class="footer">
    Team Relics • 2026 NASA International Space Apps Challenge • "When we leave something behind on the Moon or Mars, it is not Space Junk—it is an eternal monument to human curiosity."
  </div>
</body>
</html>`;

const tempHtml = path.resolve('docs/project', 'render_temp.html');
fs.writeFileSync(tempHtml, htmlDoc, 'utf8');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = `file:///${tempHtml.replace(/\\/g, '/')}`;
const cmd = `"${chromePath}" --headless=new --no-sandbox --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfOutputPath}" "${fileUrl}"`;

console.log('Executing Chrome PDF command...');
try {
  execSync(cmd);
  console.log('✅ PDF generated successfully at:', pdfOutputPath);
} catch (e) {
  console.error('Error generating PDF:', e);
}
