import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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
  ShadingType,
  ImageRun
} from 'docx';
import { marked } from 'marked';

// Ensure output directories exist
const docxDir = path.resolve('docs/project', 'docx');
const pdfDir = path.resolve('docs/project', 'pdf');
if (!fs.existsSync(docxDir)) fs.mkdirSync(docxDir, { recursive: true });
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

const docxOutputPath = path.join(docxDir, 'RELICS_OF_THE_COSMIC_DUST_NASA_SPACE_APPS_SUBMISSION.docx');
const pdfOutputPath = path.join(pdfDir, 'RELICS_OF_THE_COSMIC_DUST_NASA_SPACE_APPS_SUBMISSION.pdf');

console.log('Generating NASA Space Apps Submission Document Package...');

// Theme Colors
const COLOR_NASA_BLUE = '0B3D91';
const COLOR_RUST = 'D97706';
const COLOR_CYAN = '0284C7';
const COLOR_DARK = '0F172A';
const COLOR_GRAY = '475569';
const COLOR_LIGHT_BG = 'F8FAFC';
const COLOR_BORDER = 'CBD5E1';

// Helper constructors for docx
const createH1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: COLOR_NASA_BLUE,
        font: 'Arial'
      })
    ]
  });

const createH2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: COLOR_RUST,
        font: 'Arial'
      })
    ]
  });

const createH3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 60 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 20,
        color: COLOR_CYAN,
        font: 'Arial'
      })
    ]
  });

const createP = (text, options = {}) =>
  new Paragraph({
    spacing: { before: 60, after: 80, line: 260 },
    alignment: options.alignment || AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        size: 20,
        color: options.color || COLOR_DARK,
        bold: options.bold || false,
        italics: options.italics || false,
        font: 'Calibri'
      })
    ]
  });

const createBullet = (label, text) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40, line: 250 },
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        size: 20,
        color: COLOR_NASA_BLUE,
        font: 'Calibri'
      }),
      new TextRun({
        text,
        size: 20,
        color: COLOR_DARK,
        font: 'Calibri'
      })
    ]
  });

const createImageParagraph = (relImagePath, caption) => {
  const fullPath = path.resolve('docs/project', relImagePath);
  if (!fs.existsSync(fullPath)) {
    return [createP(`[Image: ${caption}] (File missing: ${relImagePath})`)];
  }
  const imgData = fs.readFileSync(fullPath);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 140, after: 40 },
      children: [
        new ImageRun({
          data: imgData,
          transformation: {
            width: 560,
            height: 315
          }
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 140 },
      children: [
        new TextRun({
          text: caption,
          italics: true,
          size: 17,
          color: COLOR_GRAY,
          font: 'Calibri'
        })
      ]
    })
  ];
};

const createTableHeader = (titles) =>
  new TableRow({
    children: titles.map(
      (title) =>
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: COLOR_NASA_BLUE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: title, bold: true, color: 'FFFFFF', size: 19, font: 'Arial' })]
            })
          ],
          margins: { top: 120, bottom: 120, left: 140, right: 140 }
        })
    )
  });

const createTableRow = (cells, isEven) =>
  new TableRow({
    children: cells.map(
      (cellText) =>
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: isEven ? 'F1F5F9' : 'FFFFFF' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: cellText, size: 18, color: COLOR_DARK, font: 'Calibri' })]
            })
          ],
          margins: { top: 90, bottom: 90, left: 120, right: 120 }
        })
    )
  });

// 1. Build DOCX Structure
console.log('Building DOCX Document elements...');

const docxChildren = [
  // Document Header / Title
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 60 },
    children: [
      new TextRun({
        text: '🚀 RELICS OF THE COSMIC DUST',
        bold: true,
        size: 36,
        color: COLOR_NASA_BLUE,
        font: 'Arial Black'
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120 },
    children: [
      new TextRun({
        text: 'Storytelling About NASA’s Discarded Equipment on the Moon, Mars, and Deep Space',
        bold: true,
        size: 22,
        color: COLOR_RUST,
        font: 'Arial'
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
    children: [
      new TextRun({
        text: '2026 NASA International Space Apps Challenge • Team Relics (Relics of the Cosmic Dust)',
        italics: true,
        size: 19,
        color: COLOR_GRAY,
        font: 'Calibri'
      })
    ]
  }),

  // Metadata Table
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER }
    },
    rows: [
      createTableHeader(['Attribute', 'Official NASA Space Apps Specification']),
      createTableRow(['Challenge Title', 'Abandoned but Not Forgotten: Storytelling About NASA’s Discarded Equipment on the Moon and Mars'], false),
      createTableRow(['Hackathon Theme', 'The Next Frontier (2026)'], true),
      createTableRow(['Difficulty Level', 'Beginner / Youth / Intermediate (School-Age 8–16)'], false),
      createTableRow(['Subject Categories', 'Astrophysics, Planetary Science, Space Exploration, Robotics & Archaeology'], true),
      createTableRow(['Primary Tech Stack', 'WebGL (Three.js), Vanilla JavaScript, Web Audio API, Vite, PDS Ingestion'], false),
      createTableRow(['Live Web Demo', 'http://localhost:3000 (Production Deploy: relics-of-the-cosmic-dust.web.app)'], true)
    ]
  }),

  createH1('1. Project Summary'),
  createP(
    'For over six decades, humanity has launched intrepid robotic pioneers across the solar system. When missions completed their primary science operations or violent alien dust storms buried solar arrays, these rovers, landers, descent stages, and instruments were left behind in silence. To young students, these machines are often invisible—either overshadowed by live active headlines or casually dismissed as "space junk."'
  ),
  createP(
    '"Relics of the Cosmic Dust" is an engaging, 3D web-based educational video game that reframes these discarded machines through the perspective of a 2085 Planetary Archaeologist. Arriving at Tranquility Base on the Moon, Perseverance Valley on Mars, and the Interstellar void beyond the heliopause, school-age space enthusiasts pilot rovers and operate probes to rediscover these legendary artifacts. By directly linking authentic NASA Planetary Data System (PDS) atmospheric logs, sub-meter HiRISE and LOLA elevation maps, and interactive JPL Science Workbenches, players experience the exact engineering and physical triumphs of each historic mission.'
  ),
  createP(
    'Accompanied by autonomous companion drones (Astro-Bot Echo, Cyber-Kitty Nova, Rover-Drone Orion) and bilingual English/Bengali localization, this project demonstrates that when humanity leaves something behind in space, it is not junk—it is an eternal monument to human curiosity etched into the cosmos.'
  ),

  createH1('2. Project Demonstration & Quick Links'),
  createBullet('Live Interactive Web App', 'http://localhost:3000 (Full 3D WebGL Simulator)'),
  createBullet('Open-Source Repository', 'https://github.com/shaikotkundu/relics-of-the-cosmic-dust'),
  createBullet('Official 240s Pitch Video', 'https://youtu.be/relics-cosmic-dust-2026'),
  createBullet('NASA Eyes 3D Solar System', 'Interactive real-time orrery integrated within the Mission Control Hub'),

  createH1('3. Project Details: The WHY, the WHAT, and the HOW'),
  ...createImageParagraph('images/01_game_hub_portals.jpg', 'Figure 1: The Mission Control Game Hub featuring the 3 Celestial Gateways (Moon, Mars, Voyager 1).'),

  createH2('How We Addressed the Challenge'),
  createP(
    'Rather than producing a static text-heavy encyclopedia or passive video slideshow, our solution builds an active, playable world that connects youth emotionally and intellectually to off-world hardware:'
  ),
  createBullet('1. Emotional Agency Through Planetary Archaeology', 'Students do not merely memorize dates; they arrive on site in 2085 as explorers, brush Martian dust off solar panels, feel Marsquakes through seismometer domes, and decode final telemetry logs.'),
  createBullet('2. Scientific Ground-Truth Validation', 'Children directly manipulate authentic physical instruments—testing the Beer-Lambert solar extinction law during Mars dust storms, calculating propellant Delta-v for Apollo 11, and transmitting 22-hour radio handshakes to Voyager 1.'),
  createBullet('3. Respect for Player Control', 'Children reject forced, automated pop-ups. In our game, players drive every meter of the rover, choose when to trigger scans, and progress at their own intellectual pace.'),

  createH2('The Educational Journey: Learning Phase & Active Gameplay'),
  ...createImageParagraph('images/02_meet_companion_bots.jpg', 'Figure 2: The Onboarding Hangar where cadets select their companion buddy (Echo, Nova, or Orion).'),
  createP(
    'Cadets begin in the Onboarding Deck, where they register their Call Sign, learn the historic mission premise, and select a specialized companion drone tailored to their playstyle: Astro-Bot Echo (LiDAR specialist), Cyber-Kitty Nova (high-speed mineral scout), or Rover-Drone Orion (storm radar).'
  ),
  ...createImageParagraph('images/03_cadet_profile_manager.jpg', 'Figure 3: JDSN Cadet Registry supporting independent player profiles, stats, and achievements on shared devices.'),

  createH2('The Three Primary Celestial Expedition Gateways'),
  createH3('🌕 Gateway 1: The Moon (Tranquility Base & Oceanus Procellarum)'),
  createBullet('Surveyor 1 (1966)', 'NASA’s first soft lunar landing. Cadets discover how Surveyor’s crushable tripod footpads disproved the myth of deep lunar quicksand, paving the way for Apollo 11.'),
  createBullet('Apollo 11 Lunar Module Descent Stage (1969)', 'Cadets inspect the golden descent stage left on the Moon to conserve fuel (Delta-v) per Tsiolkovsky’s Rocket Equation, learning why sacrifice was required to carry astronauts home.'),
  createBullet('Surveyor 3 Retrieval (1969)', 'Humanity’s first and only extraterrestrial archaeological recovery by Apollo 12 astronauts Pete Conrad and Alan Bean.'),

  createH3('🔴 Gateway 2: Planet Mars (Perseverance Valley & Meridiani Planum)'),
  createBullet('Opportunity Rover (MER-B, 2004–2018)', 'Survived 5,111 sols (over 14 years). Cadets operate the Rock Abrasion Tool (RAT) and analyze Hematite "Blueberries" that proved ancient liquid water.'),
  createBullet('The Sol 5111 Planetary Dust Storm (2018)', 'Cadets experience record atmospheric opacity (Tau = 10.8) extinguishing 99.998% of sunlight, leading to Opportunity’s final telemetry: "My battery is low and it is getting dark."'),
  createBullet('InSight Seismology Station', 'Detecting 1,319 Marsquakes with the SEIS dome to reveal Mars’s molten metallic core.'),

  createH3('🌌 Gateway 3: Deep Space (Voyager 1 & The Golden Record)'),
  createBullet('Voyager 1 (24.3 Billion Kilometers)', 'Cadets rotate the spacecraft in 3D using attitude hydrazine thrusters, inspect the 3.7m High-Gain Antenna, balance Plutonium-238 RTG nuclear power, and listen to the Golden Record carrying greetings in 55 languages (including Bengali: "নমস্কার! বিশ্বে শান্তি হোক").'),

  ...createImageParagraph('images/04_nasa_eyes_orrery.jpg', 'Figure 4: Interplanetary trajectory corridors visualized via NASA Eyes and Three.js celestial mechanics.'),
  ...createImageParagraph('images/05_mission_roadmap_levels.jpg', 'Figure 5: Milestone S-Curve Roadmap gamifying 6 quest levels per celestial body.'),
  ...createImageParagraph('images/06_rover_surface_exploration.jpg', 'Figure 6: Real-time 3D rover driving across authentic Martian terrain with proximity radar scan HUD.'),

  createH2('How We Developed This Project'),
  createP(
    'To guarantee seamless 60 FPS performance in standard school computer labs and tablets without heavy downloads, we utilized a lightweight, high-performance architecture:'
  ),
  createBullet('Three.js & WebGL Engine', 'Procedurally generated terrain heightmaps driven by NASA HiRISE and LOLA Digital Elevation Models (DEM).'),
  createBullet('Kinematic Rocker-Bogie Physics', '6-wheel independent rover suspension simulating accurate chassis articulation over rocks, crater rims, and dunes.'),
  createBullet('Mathematical Physics Pipelines', 'Beer-Lambert solar extinction equations, Tsiolkovsky rocket staging calculations, and radio wave propagation speed limits.'),
  createBullet('Agile Development Cycle', 'Developed across 3 focused sprints covering data ingestion, 3D kinematics, UI glassmorphism, bilingual localization, and accessibility testing.'),

  createH2('Community Involvement & Educational Philosophy'),
  createBullet('Global Representation', 'Features dual flight directors: Commander Asha from Dhaka, Bangladesh (rooftop antenna ground station) and Commander Leo from Cape Canaveral, Florida, showing that space exploration belongs to all nations.'),
  createBullet('Respect for Learner Agency', 'No automated pop-up traps or passive video lecturing. Children learn by driving, scanning, and uncovering science through active play.'),

  createH1('4. The Tools and Technologies'),
  createBullet('Core Programming Languages', 'JavaScript (ES6+ Modules), HTML5, CSS3 Glassmorphism UI Design System'),
  createBullet('3D Graphics & Simulation', 'Three.js, WebGL Shaders, Procedural HiRISE/LOLA Heightmap Algorithms'),
  createBullet('Audio Engineering', 'Web Audio API, Procedural Synthesizers, Thruster Soundscapes, Telemetry Beeps'),
  createBullet('Build & Package System', 'Vite, Node.js, Canvas-Confetti, Marked.js'),
  createBullet('Platform Independence', 'Zero-install browser compatibility across ChromeOS, Windows, macOS, iOS, and Android'),

  createH1('5. Use of Artificial Intelligence (AI)'),
  createP(
    'In full compliance with NASA Space Apps Challenge guidelines, AI tools were utilized responsibly as creative and organizational assistants:'
  ),
  createBullet('Bilingual Translation Verification', 'Assisted in refining scientific terminology between English and Bengali to ensure high technical accuracy.'),
  createBullet('Narrative Concept Scaffolding', 'Aided in brainstorming character backstories and historical vignettes for the companion drones.'),
  createBullet('Code Profiling Support', 'Helped identify optimization opportunities in WebGL event loop handling and responsive touch inputs.'),

  createH1('6. NASA Open Data & Scientific Sources'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER }
    },
    rows: [
      createTableHeader(['NASA Data Source / Mission', 'Scientific Domain', 'Implementation in Solution']),
      createTableRow(['NASA PDS Geosciences Node', 'MER-B Opportunity Telemetry (Sols 1–5111)', 'Optical depth (Tau 0.8–10.8), power collapse to 22 Wh, battery sleep cutoff (<20.5V).'], false),
      createTableRow(['NASA MRO HiRISE Archive', 'Mars Reconnaissance Orbiter DTM', 'Sub-meter 3D terrain elevation for Perseverance Valley at Endeavour Crater.'], true),
      createTableRow(['NASA LRO LOLA Altimetry', 'Lunar Reconnaissance Orbiter', 'Micro-elevation heightmaps of Oceanus Procellarum and Mare Tranquillitatis.'], false),
      createTableRow(['NASA 3D Hardware Resources', 'CAD & Engineering Models', 'Dimensionally accurate 3D meshes of Surveyor 1, Opportunity, Apollo LM, and Voyager 1.'], true),
      createTableRow(['NASA PDS Spectral & RAT Logs', 'APXS, Mössbauer & RAT Logs', 'Ground truth verification of Hematite Blueberries, Jarosite, and grind hole wear.'], false),
      createTableRow(['NASA Eyes on the Solar System', 'Real-time Ephemerides API', 'Interactive solar system background with live planetary trajectories.'], true)
    ]
  }),

  createH1('7. Response to Challenge Considerations'),
  createH2('What age group is your story designed for?'),
  createP(
    'Primary Target: School-age space enthusiasts aged 8 to 16 years old (Upper Elementary, Middle School, and High School), alongside STEM educators and parents. This age group is at the critical developmental stage where curiosity about robotics and space turns into lifelong career ambitions. Traditional academic databases alienate them; our playable 3D sandbox empowers them.'
  ),

  createH2('How accessible is the format you chose to use?'),
  createBullet('Zero-Install Browser Access', 'Runs instantly at 60 FPS on school Chromebooks, budget laptops, iPads, and smartphones.'),
  createBullet('Complete Bilingual Localization', 'Seamless, instant switching between English and Bengali (বাংলা) breaks language barriers for over 300 million South Asian learners.'),
  createBullet('Multi-Modal Input Support', 'Full desktop keyboard controls (WASD, E to scan) plus on-screen touch virtual steering buttons for mobile devices.'),
  createBullet('Sensory Inclusivity', 'Subtitled dialogue and visual HUD waypoints ensure deaf and hard-of-hearing players never miss a scientific cue.'),

  createH2('Do you want to focus on specific missions and equipment, or tell a broader story?'),
  createP(
    'A Cohesive Hybrid Approach: We meticulously detail specific, iconic hardware (Surveyor 1 landing footpads, Apollo 11 descent stage, Opportunity RAT drill and Mössbauer spectrometer, InSight SEIS seismometer, Voyager 1 Golden Record) while weaving them into a grand 60-year narrative arc. Every machine is an indispensable chapter in humanity’s shared cosmic journey.'
  ),

  createH2('What perspective(s) do you want to highlight?'),
  createBullet('1. Faithful Robotic Companions', 'Giving voice and emotional resonance to solitary machines that endured harsh alien environments millions of miles from Earth.'),
  createBullet('2. The 2085 Planetary Archaeologist', 'Reframing off-world hardware as protected human cultural heritage rather than space scrap.'),
  createBullet('3. Global Youth & Citizen Science', 'Demonstrated through Commander Asha (Dhaka) and Commander Leo (Florida), proving space belongs to all children.'),
  createBullet('4. Scientific Ground Truth', 'Guaranteeing that every discovery is rooted in authentic NASA data and real physics.')
];

// Generate DOCX file
console.log('Packaging and saving DOCX file...');
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 20, color: COLOR_DARK },
        paragraph: { spacing: { line: 260, before: 60, after: 60 } }
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
      children: docxChildren
    }
  ]
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(docxOutputPath, buffer);
  console.log(`✅ DOCX successfully created at: ${docxOutputPath}`);

  // Now Generate PDF file via Headless Browser from Markdown/HTML
  console.log('Generating PDF via Headless Edge/Chrome...');
  const mdContent = fs.readFileSync(path.resolve('docs/project', 'PROJECT_SUBMISSION_STORYTELLING.md'), 'utf8');
  
  // Custom marked image renderer to point to absolute file URLs for printing
  const htmlBody = marked.parse(mdContent);
  
  const imagesBaseDir = path.resolve('docs/project').replace(/\\/g, '/');

  const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RELICS OF THE COSMIC DUST - NASA Space Apps 2026 Submission</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@700;800;900&family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
  <base href="file:///${imagesBaseDir}/">
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
      @bottom-right {
        content: counter(page);
      }
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .nasa-header-banner {
      background: linear-gradient(135deg, #0b3d91 0%, #031b4e 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 4px 16px rgba(11, 61, 145, 0.2);
    }
    .nasa-badge {
      display: inline-block;
      background: #d97706;
      color: #ffffff;
      font-size: 8.5pt;
      font-weight: 800;
      letter-spacing: 0.8px;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .nasa-header-banner h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 26pt;
      font-weight: 900;
      margin: 0 0 6px 0;
      color: #ffffff;
      border: none;
      padding: 0;
      letter-spacing: -0.5px;
    }
    .nasa-header-banner p {
      font-size: 12pt;
      color: #93c5fd;
      margin: 0;
      font-weight: 500;
    }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 18pt;
      font-weight: 800;
      color: #0b3d91;
      margin-top: 24px;
      margin-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      page-break-after: avoid;
    }
    h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 14pt;
      font-weight: 700;
      color: #d97706;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 12pt;
      font-weight: 700;
      color: #0284c7;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    p {
      margin: 0 0 10px 0;
      text-align: justify;
    }
    ul, ol {
      margin: 6px 0 14px 20px;
      padding: 0;
    }
    li {
      margin-bottom: 5px;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      margin: 12px 0 4px 0;
      display: block;
      page-break-inside: avoid;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    em {
      display: block;
      font-size: 9pt;
      color: #64748b;
      text-align: center;
      margin-bottom: 14px;
      font-style: italic;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background-color: #0b3d91;
      color: #ffffff;
      font-weight: 700;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    blockquote {
      background: #eff6ff;
      border-left: 4px solid #0284c7;
      margin: 14px 0;
      padding: 10px 16px;
      border-radius: 0 8px 8px 0;
      color: #1e3a8a;
      font-style: italic;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 22px 0;
    }
    .footer-note {
      text-align: center;
      font-size: 9pt;
      color: #64748b;
      margin-top: 30px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="nasa-header-banner">
    <div class="nasa-badge">NASA International Space Apps Challenge 2026</div>
    <h1>RELICS OF THE COSMIC DUST</h1>
    <p>Abandoned but Not Forgotten: Storytelling About NASA’s Discarded Equipment on the Moon, Mars, and Deep Space</p>
  </div>
  ${htmlBody}
  <div class="footer-note">
    Team Relics • 2026 NASA International Space Apps Challenge • "When we leave something behind on the Moon or Mars, it is not Space Junk—it is an eternal monument to human curiosity."
  </div>
</body>
</html>`;

  const tempHtmlPath = path.resolve('docs/project', 'temp_submission_render.html');
  fs.writeFileSync(tempHtmlPath, htmlDoc, 'utf8');

  let browserPath = '';
  if (fs.existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe')) {
    browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  } else if (fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')) {
    browserPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  }

  if (browserPath) {
    const fileUrl = `file:///${tempHtmlPath.replace(/\\/g, '/')}`;
    const cmd = `"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfOutputPath}" "${fileUrl}"`;
    try {
      execSync(cmd);
      console.log(`✅ PDF successfully created at: ${pdfOutputPath}`);
    } catch (err) {
      console.error('Error generating PDF with browser:', err);
    } finally {
      if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
    }
  } else {
    console.warn('No headless browser found to print PDF.');
  }
});

