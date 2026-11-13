import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { marked } from 'marked';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} from 'docx';

const rootDocDir = path.resolve('docs/project');
const docxDir = path.resolve('docs/project', 'docx');
const pdfDir = path.resolve('docs/project', 'pdf');

if (!fs.existsSync(docxDir)) fs.mkdirSync(docxDir, { recursive: true });
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

const mdSourcePath = path.join(rootDocDir, 'NASA_SPACE_APPS_PITCH_AND_WINNING_STRATEGY.md');
const docxOutputPath = path.join(docxDir, 'NASA_SPACE_APPS_PITCH_AND_WINNING_STRATEGY.docx');
const pdfOutputPath = path.join(pdfDir, 'NASA_SPACE_APPS_PITCH_AND_WINNING_STRATEGY.pdf');

console.log('🚀 Generating DOCX and PDF for NASA Space Apps Pitch and Winning Strategy...');

// ----------------------------------------------------
// 1. GENERATE DOCX
// ----------------------------------------------------
const createDivider = () =>
  new Paragraph({
    border: {
      bottom: { color: 'CBD5E0', space: 1, style: BorderStyle.SINGLE, size: 6 }
    },
    spacing: { before: 120, after: 180 },
    children: []
  });

const createHeading1 = (title, color = '0B3D91') =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 26,
        color: color
      })
    ]
  });

const createHeading2 = (title, color = '1E3A8A') =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 22,
        color: color
      })
    ]
  });

const createHeading3 = (title, color = '0369A1') =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 140, after: 60 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 20,
        color: color
      })
    ]
  });

const createP = (text, options = {}) =>
  new Paragraph({
    spacing: { before: 60, after: 80 },
    children: [
      new TextRun({
        text,
        size: 20,
        color: options.color || '2D3748',
        bold: !!options.bold,
        italics: !!options.italics
      })
    ]
  });

const createCallout = (title, text, borderColor = 'EA580C', bgColor = 'FFF7ED') =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              left: { style: BorderStyle.SINGLE, size: 24, color: borderColor }
            },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 40 },
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    size: 20,
                    color: '9A3412'
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: text,
                    italics: true,
                    size: 19,
                    color: '7C2D12'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

const createScriptBlock = (actTitle, visual, speech) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: '0F172A', type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: '38BDF8' },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: '38BDF8' },
              left: { style: BorderStyle.SINGLE, size: 16, color: '38BDF8' },
              right: { style: BorderStyle.SINGLE, size: 6, color: '38BDF8' }
            },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 40 },
                children: [
                  new TextRun({
                    text: actTitle,
                    bold: true,
                    size: 20,
                    color: '38BDF8'
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({ text: '🎬 VISUAL: ', bold: true, size: 18, color: 'F59E0B' }),
                  new TextRun({ text: visual, italics: true, size: 18, color: 'CBD5E1' })
                ]
              }),
              new Paragraph({
                spacing: { before: 40, after: 0 },
                children: [
                  new TextRun({ text: '🎙️ NARRATION: ', bold: true, size: 18, color: '10B981' }),
                  new TextRun({ text: `"${speech}"`, size: 18, color: 'F8FAFC' })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Calibri',
          size: 20,
          color: '2D3748'
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 }
        }
      },
      children: [
        // Title Block
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: '🔴 Relics of the Red Dust: The Last Transmission',
              bold: true,
              size: 32,
              color: '0B3D91'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 160 },
          children: [
            new TextRun({
              text: 'NASA International Space Apps Challenge 2026 — Master Pitch & Winning Strategy Blueprint',
              italics: true,
              size: 22,
              color: 'EA580C'
            })
          ]
        }),

        createCallout(
          '🌟 EXECUTIVE SUMMARY & MISSION STATEMENT',
          'Set in the year 2085, an astronaut planetary archaeologist rediscovers NASA’s Opportunity Rover (MER-B) in Perseverance Valley. Powered by real NASA PDS telemetry, Beer-Lambert solar physics, 3D WebGL, and bilingual storytelling, this project transforms raw space data into an emotional, educational heritage adventure.'
        ),

        createDivider(),

        createHeading1('📊 1. Comparative Analysis: 2023 Global Champion vs. Our Architecture'),
        createP('A direct comparison between Team Voyagers (2023 World Champions for "Aqua Explorer") and our project architecture demonstrates full alignment with NASA Space Apps championship criteria:'),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Pillar', bold: true, color: 'FFFFFF', size: 18 })] })]
                }),
                new TableCell({
                  width: { size: 35, type: WidthType.PERCENTAGE },
                  shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
                  children: [new Paragraph({ children: [new TextRun({ text: '2023 Champion (Voyagers)', bold: true, color: 'FFFFFF', size: 18 })] })]
                }),
                new TableCell({
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Our Architecture (MER-B)', bold: true, color: 'FFFFFF', size: 18 })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [createP('Emotional Hook', { bold: true })] }),
                new TableCell({ children: [createP('Maya’s village & 0.01% usable freshwater crisis.')] }),
                new TableCell({ children: [createP('Opportunity’s 15-year survival & Sol 5111 farewell ("My battery is low and it\'s getting dark").')] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [createP('NASA Data', { bold: true })] }),
                new TableCell({ children: [createP('Earth Satellites (SWOT, GPM, SMAP).')] }),
                new TableCell({ children: [createP('NASA PDS Archive, Beer-Lambert Law, Tau=10.8 storm, Mössbauer & APXS Spectrometers.')] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [createP('Interactive Experience', { bold: true })] }),
                new TableCell({ children: [createP('Educational minigames & AR water models.')] }),
                new TableCell({ children: [createP('Three.js 3D Martian terrain, real-time dust storm simulator, LiDAR scanning, and Web Audio synthesizer.')] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [createP('Youth STEM Impact', { bold: true })] }),
                new TableCell({ children: [createP('Conservation calculator & school outreach.')] }),
                new TableCell({ children: [createP('6-Tier S-Curve Roadmap, interactive Mars Quiz, certified Master Explorer certificates, full English/Bengali localization.')] })
              ]
            })
          ]
        }),

        createDivider(),

        createHeading1('⏱️ 2. Official 30-Second Elevator Pitch (Trailer Speech)'),
        createP('Specially crafted 30-second speech following the exact cadence and timing of Team Voyagers (2023 Global Champion):'),

        createScriptBlock(
          '30-SECOND ELEVATOR PITCH (0:00 - 0:30)',
          'High-octane Three.js Martian terrain scan -> Sol 5111 storm darkening -> LiDAR 2085 HUD scan -> Master Explorer certificate pop.',
          'Meet Team [Your Team Name], united to bring the wonders of deep space exploration to young minds. Introducing "Relics of the Red Dust"—empowering students with interplanetary discovery. An interactive 3D WebGL experience powered by NASA’s Planetary Data System and solar physics, that turns 15 years of rover telemetry into an exhilarating Martian adventure. Dive into the fateful Sol 5111 dust storm, analyze real rock spectra, and uncover ancient Martian water. Join us in inspiring the next generation of space pioneers. "Relics of the Red Dust"—where space history turns into action!'
        ),

        createDivider(),

        createHeading1('🎬 3. Master 4-Minute Presentation & Video Pitch Script'),
        createP('Use this structured, time-coded script for the full video submission and live pitch presentation:'),

        createScriptBlock(
          'ACT I: THE EMOTIONAL HOOK & INTERPLANETARY HERITAGE (0:00 - 0:45)',
          'Slow cinematic camera pan across a silent crimson Martian horizon in Three.js WebGL. Focuses on the sleeping Opportunity rover covered in dust.',
          'A world of red dust, where every forgotten machine whispers humanity’s greatest stories. Hello everyone, we are Team Voyagers/Space Pioneers. In 2004, NASA sent a robotic explorer to Mars for a 90-sol mission. That rover was Opportunity. Defying all odds, it endured for over 14 years—traveling more than 45 kilometers to prove that Mars was once a world of warm, liquid water. Growing up looking at the night sky, our deep fascination with space led us to the NASA Space Apps Challenge, where we asked: How do we preserve our greatest interplanetary achievements before time erases them?'
        ),

        new Paragraph({ spacing: { before: 80, after: 80 }, children: [] }),

        createScriptBlock(
          'ACT II: THE FATEFUL CRISIS — SOL 5111 (0:46 - 1:25)',
          'Martian sky darkens into an apocalyptic amber haze. Telemetry HUD shows Optical Depth (Tau) surging to 10.8 and power collapsing to 22 Wh.',
          'On June 10, 2018—Sol 5111—a catastrophic, planet-encircling dust storm swallowed Mars. Opportunity sent its final transmission: "My battery is low and it’s getting dark." Its solar arrays choked under an unprecedented optical depth of Tau 10.8, blocking 99.998% of all sunlight. When the storm cleared, Opportunity was silent. To inspire the next generation of scientists, we cannot leave these historic milestones buried as cold data in raw archives. We must bring this science back to life.'
        ),

        new Paragraph({ spacing: { before: 80, after: 80 }, children: [] }),

        createScriptBlock(
          'ACT III: THE INNOVATION — "RELICS OF THE RED DUST" & NASA DATA (1:26 - 2:40)',
          'Transition to 2085 Archaeologist HUD. Player activates LiDAR scans, Pancam stereo zoom, Mössbauer Spectrometer, and Rock Abrasion Tool (RAT).',
          'Step into the boots of a Planetary Archaeologist in the year 2085 with our innovation: Relics of the Red Dust! Directly powered by NASA’s Planetary Data System (PDS): 1. In Atmospheric Re-enactment, we compute solar extinction in real time using the Beer-Lambert Law. 2. In Instrument Diagnostics, players wield Mössbauer and APXS Spectrometers to analyze authentic rock targets, discovering Jarosite and Hematite Blueberries. 3. In Rover Drive Mode, explore the true 3D topography of Endeavour Crater with zero-latency 60 FPS WebGL rendering.'
        ),

        new Paragraph({ spacing: { before: 80, after: 80 }, children: [] }),

        createScriptBlock(
          'ACT IV: GAMIFIED STEM EDUCATION & GLOBAL LOCALIZATION (2:41 - 3:25)',
          'Rapid montage of S-Curve Roadmap progression, Mars Science Quiz, English/Bengali language switch, and printable Honor Certificate.',
          'Why does this matter? Because tomorrow’s astronauts are sitting in today’s classrooms. Our S-Curve Celestial Roadmap guides students step-by-step through 6 historical mission milestones. The interactive Mars Science Quiz reinforces core planetary geology and physics. And with full bilingual support in English and Bengali (বাংলা), we ensure STEM education breaks all language barriers across developing nations and global classrooms.'
        ),

        new Paragraph({ spacing: { before: 80, after: 80 }, children: [] }),

        createScriptBlock(
          'ACT V: THE INSPIRING CALL TO ACTION & CONCLUSION (3:26 - 4:00)',
          'Camera orbits into the Martian night sky, showing Earth as a pale blue dot in the distance. Team credentials appear.',
          'Opportunity did not fail—it built the foundation for humanity’s future on Mars. Join us in "Relics of the Red Dust", where raw space telemetry transforms into an unforgettable human journey. Together, let us revive the transmission and ignite the future of space exploration!'
        ),

        createDivider(),

        createHeading1('🔬 3. Scientific Ingestion & Technical Architecture'),
        createP('• NASA Planetary Data System (PDS): Ingests Sol 1–5111 telemetry for atmospheric optical depth and power generation.'),
        createP('• Beer-Lambert Physics Engine: I = I0 * exp(-Tau / cos(theta)), driving realistic solar array output and dynamic sky extinction.'),
        createP('• Authentic Mineralogy: Verification of Jarosite and Hematite Spherules ("Blueberries") confirming past standing water.'),
        createP('• Zero-Install WebGL 3D: High-performance client-side Three.js engine and procedural Web Audio synthesizer.'),

        createDivider(),

        createHeading1('🏅 4. NASA Space Apps Judging Rubric Alignment'),
        createP('• Impact & Storytelling (30%): Deep emotional narrative of Opportunity’s 15-year journey and 2085 rediscovery.'),
        createP('• Scientific Validity (25%): Exact mathematical physics and authentic PDS planetary data.'),
        createP('• Technological Excellence (20%): Real-time WebGL shaders, zero-asset audio synthesis, and 60 FPS performance.'),
        createP('• Creativity & Innovation (15%): Planetary Archaeology paradigm preserving space heritage.'),
        createP('• Presentation & Polish (10%): AAA dark glassmorphism, automated 120s pitch mode, and verified certificates.')
      ]
    }
  ]
});

// Pack DOCX
const docxBuffer = await Packer.toBuffer(doc);
fs.writeFileSync(docxOutputPath, docxBuffer);
console.log(`✅ DOCX generated successfully at: ${docxOutputPath}`);

// ----------------------------------------------------
// 2. GENERATE PDF (via Headless Chrome / Edge)
// ----------------------------------------------------
const mdContent = fs.readFileSync(mdSourcePath, 'utf8');
const htmlParsed = marked.parse(mdContent);

const pdfHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NASA Space Apps 2026 - Master Pitch & Strategy Blueprint</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: 'Hind Siliguri', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.6;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-family: 'Outfit', 'Hind Siliguri', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #0b3d91;
      margin-top: 0;
      margin-bottom: 4px;
      border-bottom: 2px solid #ea580c;
      padding-bottom: 6px;
    }
    h2 {
      font-family: 'Outfit', 'Hind Siliguri', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #1e3a8a;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    h3 {
      font-family: 'Hind Siliguri', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #0369a1;
      margin-top: 12px;
      margin-bottom: 6px;
    }
    p { margin-top: 0; margin-bottom: 8px; }
    hr { border: none; height: 1px; background: #e2e8f0; margin: 12px 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
    }
    tr:nth-child(even) td { background-color: #f8fafc; }
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 14px;
      border-radius: 6px;
      font-family: 'Consolas', monospace;
      font-size: 11px;
      line-height: 1.45;
      overflow-x: auto;
      margin: 12px 0;
      border-left: 4px solid #38bdf8;
    }
    blockquote {
      margin: 12px 0;
      padding: 10px 14px;
      background: #fff7ed;
      border-left: 4px solid #ea580c;
      border-radius: 0 6px 6px 0;
      font-style: italic;
      color: #9a3412;
    }
  </style>
</head>
<body>
  ${htmlParsed}
</body>
</html>`;

const tempHtml = path.join(rootDocDir, 'temp_pitch_render.html');
fs.writeFileSync(tempHtml, pdfHtml, 'utf8');

let browserPath = '';
if (fs.existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe')) {
  browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
} else if (fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')) {
  browserPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

if (browserPath) {
  try {
    const fileUrl = `file:///${tempHtml.replace(/\\/g, '/')}`;
    const cmd = `"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfOutputPath}" "${fileUrl}"`;
    execSync(cmd);
    console.log(`✅ PDF generated successfully at: ${pdfOutputPath}`);
  } catch (err) {
    console.error('Error generating PDF:', err);
  } finally {
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
} else {
  console.warn('⚠️ No browser found for PDF conversion.');
}
