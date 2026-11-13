// Builds the submission documents (DOCX + PDF) directly from the Markdown source,
// so the three formats always contain exactly the same text and screenshots.
//
//   node scripts/docs/build-submission-docs.mjs
//
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { marked } from 'marked';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType,
  BorderStyle, AlignmentType, ShadingType, ImageRun, Footer, PageNumber, ExternalHyperlink,
  TableLayoutType, LevelFormat
} from 'docx';

const docsDir = path.resolve('docs/project');
const mdPath = path.join(docsDir, 'PROJECT_SUBMISSION_STORYTELLING.md');
const baseName = 'RELICS_OF_THE_COSMIC_DUST_NASA_SPACE_APPS_SUBMISSION';
const docxPath = path.join(docsDir, 'docx', `${baseName}.docx`);
const pdfPath = path.join(docsDir, 'pdf', `${baseName}.pdf`);
fs.mkdirSync(path.dirname(docxPath), { recursive: true });
fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

const md = fs.readFileSync(mdPath, 'utf8');

// ---------------------------------------------------------------- palette
const C = { blue: '0B3D91', rust: 'C2410C', cyan: '0369A1', dark: '0F172A', gray: '475569', line: 'CBD5E1', zebra: 'F1F5F9', code: 'EEF2F7' };

// ================================================================= DOCX
const tokens = marked.lexer(md);

const jpegSize = (buf) => {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return { w: 1440, h: 810 };
};

const plain = (toks) => (toks || []).map((t) => t.tokens ? plain(t.tokens) : (t.text ?? t.raw ?? '')).join('');

function inlineRuns(toks, st = {}) {
  const out = [];
  for (const t of toks || []) {
    switch (t.type) {
      case 'strong': out.push(...inlineRuns(t.tokens, { ...st, bold: true })); break;
      case 'em': out.push(...inlineRuns(t.tokens, { ...st, italics: true })); break;
      case 'del': out.push(...inlineRuns(t.tokens, { ...st, strike: true })); break;
      case 'codespan':
        out.push(new TextRun({ text: t.text, font: 'Consolas', size: (st.size || 20) - 2, color: C.rust, bold: st.bold, shading: { type: ShadingType.CLEAR, fill: C.code } }));
        break;
      case 'link': {
        const inner = inlineRuns(t.tokens, { ...st, color: C.cyan, underline: {} });
        if (/^https?:/i.test(t.href)) out.push(new ExternalHyperlink({ link: t.href, children: inner }));
        else out.push(...inlineRuns(t.tokens, st));
        break;
      }
      case 'br': out.push(new TextRun({ break: 1 })); break;
      case 'image': break; // handled at block level
      case 'escape':
      case 'text':
        if (t.tokens && t.tokens.length) out.push(...inlineRuns(t.tokens, st));
        else out.push(new TextRun({ text: t.text, bold: st.bold, italics: st.italics, strike: st.strike, color: st.color, underline: st.underline, size: st.size || 20, font: st.font || 'Calibri' }));
        break;
      case 'html': break;
      default:
        if (t.text) out.push(new TextRun({ text: t.text, size: st.size || 20, font: 'Calibri' }));
    }
  }
  return out;
}

function imageBlocks(imgTok) {
  const rel = decodeURI(imgTok.href).replace(/^\.\//, '');
  const full = path.join(docsDir, rel);
  if (!fs.existsSync(full)) return [new Paragraph({ children: [new TextRun({ text: `[missing image: ${rel}]`, color: 'B91C1C' })] })];
  const data = fs.readFileSync(full);
  const { w, h } = jpegSize(data);
  const width = 600;
  const height = Math.round((width * h) / w);
  return [new Paragraph({
    alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 160, after: 40 },
    children: [new ImageRun({ type: 'jpg', data, transformation: { width, height }, altText: { title: imgTok.text || 'figure', description: imgTok.text || 'figure', name: path.basename(rel) } })]
  })];
}

const headingMap = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4];
const headingStyle = {
  1: { size: 30, color: C.blue, before: 360, after: 120, border: true },
  2: { size: 25, color: C.rust, before: 260, after: 90 },
  3: { size: 22, color: C.cyan, before: 200, after: 70 },
  4: { size: 21, color: C.gray, before: 160, after: 60 }
};

const PAGE_W = 11906 - 2 * 1000; // A4 minus margins (dxa)

function tableBlock(tok) {
  const cols = tok.header.length;
  const lens = tok.header.map((h, i) => {
    const cellLens = [plain(h.tokens).length, ...tok.rows.map((r) => plain(r[i].tokens).length)];
    return Math.min(60, Math.max(8, Math.max(...cellLens) * 0.55 + 6));
  });
  const sum = lens.reduce((a, b) => a + b, 0);
  const widths = lens.map((l) => Math.round((l / sum) * PAGE_W));
  const border = { style: BorderStyle.SINGLE, size: 4, color: C.line };
  const borders = { top: border, bottom: border, left: border, right: border };
  const mkCell = (cell, i, head, zebra) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    borders,
    shading: { type: ShadingType.CLEAR, fill: head ? C.blue : zebra ? C.zebra : 'FFFFFF' },
    margins: { top: 70, bottom: 70, left: 100, right: 100 },
    children: [new Paragraph({ spacing: { before: 0, after: 0, line: 245 }, children: inlineRuns(cell.tokens, { size: 17, color: head ? 'FFFFFF' : C.dark, bold: head }) })]
  });
  const rows = [new TableRow({ tableHeader: true, cantSplit: true, children: tok.header.map((h, i) => mkCell(h, i, true, false)) })];
  tok.rows.forEach((r, ri) => rows.push(new TableRow({ cantSplit: true, children: r.map((c, i) => mkCell(c, i, false, ri % 2 === 1)) })));
  return [new Table({ width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED, rows }), new Paragraph({ spacing: { before: 60, after: 60 }, children: [] })];
}

function listBlock(tok, level = 0) {
  const out = [];
  for (const item of tok.items) {
    const inline = [];
    const nested = [];
    for (const t of item.tokens) {
      if (t.type === 'text' || t.type === 'paragraph') inline.push(...inlineRuns(t.tokens || [t], {}));
      else if (t.type === 'list') nested.push(...listBlock(t, level + 1));
    }
    out.push(new Paragraph({
      spacing: { before: 20, after: 20, line: 255 },
      ...(tok.ordered ? { numbering: { reference: 'num', level } } : { bullet: { level } }),
      children: inline
    }));
    out.push(...nested);
  }
  return out;
}

function blocks(toks) {
  const out = [];
  for (const t of toks) {
    switch (t.type) {
      case 'space': break;
      case 'heading': {
        const s = headingStyle[Math.min(t.depth, 4)];
        out.push(new Paragraph({
          heading: headingMap[Math.min(t.depth, 4)], keepNext: true,
          spacing: { before: s.before, after: s.after },
          border: s.border ? { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.line, space: 4 } } : undefined,
          children: inlineRuns(t.tokens, { size: s.size, color: s.color, bold: true, font: 'Arial' })
        }));
        break;
      }
      case 'paragraph': {
        const imgs = (t.tokens || []).filter((x) => x.type === 'image');
        if (imgs.length && t.tokens.every((x) => x.type === 'image' || (x.type === 'text' && !x.text.trim()))) {
          imgs.forEach((im) => out.push(...imageBlocks(im)));
        } else {
          const isCaption = t.tokens.length === 1 && t.tokens[0].type === 'em';
          out.push(new Paragraph({
            alignment: isCaption ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { before: 50, after: isCaption ? 160 : 90, line: 262 },
            children: inlineRuns(t.tokens, isCaption ? { size: 17, color: C.gray } : { color: C.dark })
          }));
        }
        break;
      }
      case 'list': out.push(...listBlock(t)); break;
      case 'table': out.push(...tableBlock(t)); break;
      case 'code':
        t.text.split('\n').forEach((ln, i, a) => out.push(new Paragraph({
          spacing: { before: 0, after: 0, line: 220 },
          shading: { type: ShadingType.CLEAR, fill: C.code },
          indent: { left: 140, right: 140 },
          keepLines: true,
          children: [new TextRun({ text: ln || ' ', font: 'Consolas', size: 15, color: C.dark })],
          ...(i === a.length - 1 ? { spacing: { before: 0, after: 140, line: 220 } } : {})
        })));
        break;
      case 'blockquote':
        for (const q of t.tokens) {
          if (q.type !== 'paragraph') continue;
          out.push(new Paragraph({
            spacing: { before: 80, after: 120, line: 270 },
            indent: { left: 280 },
            shading: { type: ShadingType.CLEAR, fill: 'EFF6FF' },
            border: { left: { style: BorderStyle.SINGLE, size: 24, color: C.cyan, space: 8 } },
            children: inlineRuns(q.tokens, { italics: true, color: '1E3A8A', size: 21 })
          }));
        }
        break;
      case 'hr':
        out.push(new Paragraph({ spacing: { before: 120, after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.line, space: 1 } }, children: [] }));
        break;
      default: break;
    }
  }
  return out;
}

const doc = new Document({
  creator: 'Team Relics',
  title: 'Relics of the Cosmic Dust — NASA Space Apps 2026 Submission',
  description: 'Abandoned but Not Forgotten: storytelling about NASA discarded equipment',
  numbering: { config: [{ reference: 'num', levels: [0, 1, 2].map((l) => ({ level: l, format: LevelFormat.DECIMAL, text: `%${l + 1}.`, alignment: AlignmentType.START, style: { paragraph: { indent: { left: 540 + l * 360, hanging: 300 } } } })) }] },
  styles: { default: { document: { run: { font: 'Calibri', size: 20, color: C.dark } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'Relics of the Cosmic Dust · Team Relics · NASA Space Apps 2026 · Page ', size: 16, color: C.gray }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.gray })
          ]
        })]
      })
    },
    children: blocks(tokens)
  }]
});
fs.writeFileSync(docxPath, await Packer.toBuffer(doc));
console.log('DOCX  ->', docxPath, `${(fs.statSync(docxPath).size / 1024).toFixed(0)} KB`);

// ================================================================= PDF
const slug = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&amp;/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s/g, '-');
let html = marked.parse(md);
html = html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (m, d, inner) => `<h${d} id="${slug(inner)}">${inner}</h${d}>`);

const page = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Relics of the Cosmic Dust — NASA Space Apps 2026 Submission</title>
<base href="file:///${docsDir.replace(/\\/g, '/')}/">
<style>
  @page { size: A4; margin: 15mm 14mm 17mm 14mm; @bottom-center { content: "Relics of the Cosmic Dust · Team Relics · NASA Space Apps 2026 · Page " counter(page); font: 8pt 'Segoe UI', Arial, sans-serif; color: #64748b; } }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 10pt; line-height: 1.55; color: ${'#' + C.dark}; margin: 0; }
  h1 { font-size: 16pt; color: ${'#' + C.blue}; border-bottom: 2px solid ${'#' + C.line}; padding-bottom: 4px; margin: 22px 0 10px; page-break-after: avoid; }
  h1:first-of-type { font-size: 27pt; border: 0; margin: 4px 0 4px; color: #fff; }
  h2 { font-size: 13pt; color: ${'#' + C.rust}; margin: 18px 0 6px; page-break-after: avoid; }
  h3 { font-size: 11.5pt; color: ${'#' + C.cyan}; margin: 14px 0 5px; page-break-after: avoid; }
  h4 { font-size: 10.5pt; color: ${'#' + C.gray}; margin: 10px 0 4px; page-break-after: avoid; }
  p { margin: 0 0 8px; }
  ul, ol { margin: 4px 0 10px 20px; padding: 0; } li { margin-bottom: 3px; }
  a { color: ${'#' + C.cyan}; text-decoration: none; }
  img { display: block; max-width: 100%; margin: 12px auto 2px; border: 1px solid ${'#' + C.line}; border-radius: 6px; page-break-inside: avoid; break-inside: avoid; }
  p > em:only-child { display: block; text-align: center; color: #64748b; font-size: 8.5pt; margin: 0 0 14px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0 14px; font-size: 8.8pt; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid ${'#' + C.line}; padding: 5px 8px; text-align: left; vertical-align: top; }
  th { background: ${'#' + C.blue}; color: #fff; }
  tbody tr:nth-child(even) { background: ${'#' + C.zebra}; }
  code { font-family: Consolas, 'Courier New', monospace; font-size: 8.6pt; background: ${'#' + C.code}; color: ${'#' + C.rust}; padding: 1px 4px; border-radius: 3px; }
  pre { background: ${'#' + C.code}; border: 1px solid ${'#' + C.line}; border-radius: 6px; padding: 10px 12px; overflow: hidden; page-break-inside: avoid; }
  pre code { background: none; color: ${'#' + C.dark}; padding: 0; font-size: 7.6pt; line-height: 1.25; }
  blockquote { margin: 10px 0; padding: 8px 14px; background: #eff6ff; border-left: 4px solid ${'#' + C.cyan}; border-radius: 0 6px 6px 0; color: #1e3a8a; font-style: italic; }
  blockquote p { margin: 0; }
  hr { border: 0; border-top: 1px solid ${'#' + C.line}; margin: 18px 0; }
  .cover { background: linear-gradient(135deg, #0b3d91, #031b4e); border-radius: 12px; padding: 22px 26px 20px; margin-bottom: 14px; color: #fff; }
  .cover .tag { display: inline-block; background: #d97706; color: #fff; font-size: 8pt; font-weight: 700; letter-spacing: .6px; padding: 3px 9px; border-radius: 4px; text-transform: uppercase; }
  .cover h3 { color: #bfdbfe; font-size: 12pt; font-weight: 500; margin: 6px 0 8px; }
  .cover p { color: #93c5fd; margin: 0; font-weight: 600; }
</style></head>
<body>
  <div class="cover"><span class="tag">NASA International Space Apps Challenge 2026</span>__COVER__</div>
  __BODY__
</body></html>`;

// Move the first H1, its subtitle (H3) and the "Team Relics" line into a cover block.
let body = html;
const m = body.match(/^(\s*<h1[^>]*>[\s\S]*?<\/h1>\s*<h3[^>]*>[\s\S]*?<\/h3>\s*<p>[\s\S]*?<\/p>)/);
let cover = '';
if (m) { cover = m[1]; body = body.slice(m[1].length); }
fs.writeFileSync(path.join(docsDir, '_render_tmp.html'), page.replace('__COVER__', cover).replace('__BODY__', body), 'utf8');

const chrome = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p) => fs.existsSync(p));
const url = 'file:///' + path.join(docsDir, '_render_tmp.html').replace(/\\/g, '/');
try {
  execFileSync(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--virtual-time-budget=8000', `--print-to-pdf=${pdfPath}`, url], { stdio: 'ignore' });
} catch (e) {
  console.warn('browser exited non-zero (checking whether the PDF was still written)');
}
fs.rmSync(path.join(docsDir, '_render_tmp.html'), { force: true });
if (fs.existsSync(pdfPath)) console.log('PDF   ->', pdfPath, `${(fs.statSync(pdfPath).size / 1024).toFixed(0)} KB`);
else console.error('PDF was not created');

