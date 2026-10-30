import fs from 'fs';
import path from 'path';
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

const outDirDocx = path.resolve('documentation', 'docx');
if (!fs.existsSync(outDirDocx)) {
  fs.mkdirSync(outDirDocx, { recursive: true });
}

// Styling Constants
const COLOR_PRIMARY = '0B3D91';    // NASA Blue
const COLOR_ACCENT = 'C85A17';     // Martian Rust/Amber
const COLOR_SECONDARY = '00838F';  // Cyan / Tech
const COLOR_DARK = '1A202C';       // Dark Slate
const COLOR_MUTED = '4A5568';      // Muted Gray
const COLOR_BORDER = 'E2E8F0';     // Border light gray
const COLOR_BG_LIGHT = 'F7FAFC';   // Soft off-white
const COLOR_CALLOUT_BG = 'EDF2F7'; // Callout bg

const createHeading1 = (text, icon = '🌌') =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text: `${icon} ${text}`,
        bold: true,
        size: 28,
        color: COLOR_PRIMARY
      })
    ]
  });

const createHeading2 = (text, color = COLOR_ACCENT) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 24,
        color: color
      })
    ]
  });

const createHeading3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 140, after: 60 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 21,
        color: COLOR_SECONDARY
      })
    ]
  });

const createParagraph = (text, boldPrefix = '', italic = false) => {
  const children = [];
  if (boldPrefix) {
    children.push(
      new TextRun({
        text: boldPrefix,
        bold: true,
        size: 21,
        color: COLOR_DARK
      })
    );
  }
  children.push(
    new TextRun({
      text: text,
      size: 21,
      color: COLOR_DARK,
      italics: italic
    })
  );
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 270 },
    children
  });
};

const createBullet = (boldPrefix, text, level = 0) =>
  new Paragraph({
    bullet: { level },
    spacing: { before: 40, after: 40, line: 260 },
    children: [
      new TextRun({
        text: boldPrefix,
        bold: true,
        size: 20,
        color: COLOR_DARK
      }),
      new TextRun({
        text: text,
        size: 20,
        color: COLOR_DARK
      })
    ]
  });

const createCalloutBox = (title, lines) => {
  const tableCells = [
    new TableCell({
      width: { size: 100, type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, fill: COLOR_CALLOUT_BG },
      margins: { top: 120, bottom: 120, left: 160, right: 160 },
      borders: {
        left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_PRIMARY },
        top: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE }
      },
      children: [
        new Paragraph({
          spacing: { before: 40, after: 60 },
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 21,
              color: COLOR_PRIMARY
            })
          ]
        }),
        ...lines.map(
          (l) =>
            new Paragraph({
              spacing: { before: 30, after: 30, line: 250 },
              children: [
                new TextRun({
                  text: l,
                  size: 19,
                  color: COLOR_MUTED
                })
              ]
            })
        )
      ]
    })
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: tableCells })],
    margins: { bottom: 120 }
  });
};

const createDivider = () =>
  new Paragraph({
    border: {
      bottom: { color: 'CBD5E0', space: 1, style: BorderStyle.SINGLE, size: 6 }
    },
    spacing: { before: 140, after: 180 },
    children: []
  });

// Table Generator
const createStyledTable = (headers, rows, widths) => {
  const headerRow = new TableRow({
    children: headers.map(
      (h, idx) =>
        new TableCell({
          width: { size: widths[idx], type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: COLOR_PRIMARY },
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
            bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE }
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: h,
                  bold: true,
                  size: 19,
                  color: 'FFFFFF'
                })
              ]
            })
          ]
        })
    )
  });

  const dataRows = rows.map((row, rIdx) => {
    const isEven = rIdx % 2 === 0;
    return new TableRow({
      children: row.map(
        (cellText, cIdx) =>
          new TableCell({
            width: { size: widths[cIdx], type: WidthType.PERCENTAGE },
            shading: {
              type: ShadingType.CLEAR,
              fill: isEven ? 'FFFFFF' : COLOR_BG_LIGHT
            },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE }
            },
            children: [
              new Paragraph({
                spacing: { before: 20, after: 20, line: 240 },
                children: [
                  new TextRun({
                    text: cellText,
                    size: 18,
                    color: COLOR_DARK
                  })
                ]
              })
            ]
          })
      )
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    margins: { top: 100, bottom: 160 }
  });
};

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Calibri',
          size: 21,
          color: COLOR_DARK
        },
        paragraph: {
          spacing: { line: 270, before: 60, after: 60 }
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
              text: '🔴 RELICS OF THE COSMIC DUST',
              bold: true,
              size: 34,
              color: COLOR_PRIMARY
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 60 },
          children: [
            new TextRun({
              text: 'NASA International Space Apps Challenge 2026 — Official Project Blueprint & Implementation',
              bold: true,
              size: 22,
              color: COLOR_ACCENT
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 20, after: 140 },
          children: [
            new TextRun({
              text: 'Challenge: Abandoned but Not Forgotten: Storytelling About NASA’s Discarded Equipment on the Moon and Mars',
              italics: true,
              size: 19,
              color: COLOR_MUTED
            })
          ]
        }),

        createDivider(),

        // 1. Executive Summary
        createHeading1('Executive Summary & Philosophy', '🌌'),
        createParagraph(
          'Relics of the Cosmic Dust: The Last Transmission is an immersive, educational, and scientifically rigorous WebGL 3D web platform engineered for the NASA International Space Apps Challenge 2026 under the theme "The Next Frontier".'
        ),
        createParagraph(
          'Decades of planetary exploration have left historic probes, rovers, and landers across the Moon, Mars, and Deep Space. In standard government archives, this hardware is often classified as "discarded equipment" or dismissed as "space junk." Relics of the Cosmic Dust reframes these machines into monuments of human curiosity, scientific grit, and engineering triumph.'
        ),
        createParagraph(
          'By ingesting authentic NASA Planetary Data System (PDS) telemetry, MRO HiRISE digital terrain models, and LRO LOLA heightmaps into a browser-based 3D engine, students and educators step directly into the boots of planetary archaeologists to drive historical rovers, perform diagnostic scans, solve genuine astrophysics challenges, and recover the final memory logs of humanity\'s greatest exploration pioneers.'
        ),

        createCalloutBox('🌟 Core Pillars of the Solution', [
          '• Zero-Install Accessibility: Runs smoothly in any web browser without downloads or specialized hardware.',
          '• Rigorous Scientific Ground Truth: 100% powered by real NASA open datasets, CAD meshes, and physical laws.',
          '• Human-Centric Storytelling: Connects youth across continents (Dhaka and Florida) to demonstrate that space belongs to everyone.',
          '• Gamified STEM Mastery: Features hands-on physics mini-game workbenches, interactive quizzes, and authentic telemetry.'
        ]),

        createDivider(),

        // 2. Narrative Framing
        createHeading1('Narrative Framing: The Junior Deep Space Network (JDSN)', '📖'),
        createParagraph(
          'The application grounds dry aerospace data in an emotionally compelling story connecting two 12-year-old youth researchers across opposite sides of the planet:'
        ),
        createBullet('Asha (Age 12 • Dhaka, Bangladesh): ', 'An astrophysicist and amateur radio hacker tracking deep-space carrier harmonics (S-Band / X-Band) with a homemade rooftop Yagi antenna.'),
        createBullet('Leo (Age 12 • Cape Canaveral, Florida, USA): ', 'A robotics engineer and telemetry decoder growing up next to Kennedy Space Center, decoding NASA PDS memory frames.'),
        createBullet('ASTRO-BOT Companion: ', 'A floating AI guide drone that escorts the player across 3D planetary terrain, providing contextual commentary and mission hints.'),
        createBullet('The JDSN Academy: ', 'Asha and Leo bridge their systems to establish the Junior Deep Space Network, locking onto four legendary NASA relics to solve real physics equations and recover their final logs.'),

        createDivider(),

        // 3. Implemented Celestial Worlds
        createHeading1('Implemented Celestial Worlds & 3D Environments', '🪐'),
        createParagraph(
          'The simulator enables real-time travel and instant switching between three distinct space destinations:'
        ),

        createHeading2('1. Mars — Perseverance Valley & Elysium Planitia', COLOR_ACCENT),
        createBullet('Authentic Coordinates: ', 'Lat: 14.5714° S, Lon: 354.6734° E, Elevation: -1,540 m (Endeavour Crater).'),
        createBullet('Topography & Shaders: ', 'Constructed from NASA MRO HiRISE Digital Terrain Models with procedural bedrock, scree fields, and atmospheric scattering.'),
        createBullet('MER-B Opportunity Rover: ', '3D model featuring an authentic 6-wheel rocker-bogie chassis with individual bogie pitch articulation.'),
        createBullet('InSight Lander Actor: ', 'Stationed in Elysium Planitia, featuring its dome-shielded SEIS seismometer deployed on the Martian regolith.'),
        createBullet('Sol 5111 Global Dust Storm Re-enactment: ', 'Dynamic atmospheric opacity (Tau) increases from 0.8 to 10.8, extinguishing solar irradiance via the Beer-Lambert law: I = I0 * exp(-tau / cos(theta)), causing power generation to collapse from 900 Wh to < 22 Wh (< 20.5V bus shutdown).'),

        createHeading2('2. The Moon — Mare Tranquillitatis & Oceanus Procellarum', COLOR_PRIMARY),
        createBullet('Coordinates & Site: ', 'Lat: 0.6741° N, Lon: 23.4730° E (Apollo 11 Eagle Landing Site).'),
        createBullet('Lunar Topography: ', 'Rendered from 16-bit NASA LRO LOLA altimetry grids with impact craters, rim ridges, and micro-regolith relief.'),
        createBullet('Apollo 11 Eagle Descent Stage: ', 'Preserved in 3D with authentic gold foil insulation, descent engine bell, and ladder plaque.'),
        createBullet('Surveyor 1 & Surveyor 3: ', 'America\'s pioneering soft-landers that proved lunar soil would support Apollo astronaut boots.'),
        createBullet('Lunar Physics Engine: ', 'Simulates 1/6th gravity (1.62 m/s²), high-contrast vacuum lighting (0 atm), and a 1.28-second radio communication latency.'),

        createHeading2('3. Deep Space — Interstellar Medium (163 AU / 24.3 Billion km)', COLOR_SECONDARY),
        createBullet('Interstellar Location: ', 'Constellation Ophiuchus, moving outward at 17.0 km/s beyond the Heliopause.'),
        createBullet('Voyager 1 Spacecraft: ', 'High-precision CAD model featuring the 3.7m High-Gain Antenna, 13m Magnetometer boom, and Pu-238 RTG bay.'),
        createBullet('The 12-inch Golden Record: ', 'Full interactive phonograph simulation featuring spoken greetings in 55 human languages (including Bengali, English, Spanish, Arabic, Mandarin, Japanese), Earth sounds, and music.'),
        createBullet('Interstellar Telemetry: ', 'Simulates the genuine 22-hour 34-minute one-way light delay (45h 08m round-trip) and Pu-238 radioactive half-life decay (-4.0 W/year).'),

        createDivider(),

        // 4. The 4 Flagship JPL Science Labs
        createHeading1('The 4 Flagship JPL Science Mini-Game Labs', '🔬'),
        createParagraph(
          'Implemented in src/systems/minigames.js, these interactive workbenches immerse students in authentic aerospace and planetary science challenges:'
        ),

        createStyledTable(
          ['Mission', 'Celestial Body & Relic', 'Scientific Mechanic', 'Authentic Physics / Ground Truth'],
          [
            [
              'Mission 1: The Staging Sacrifice',
              'Moon • Apollo 11 Eagle Descent Stage',
              'Rocket Equation Staging Puzzle: Adjust fuel mass and rock samples to test launch delta-v with and without descent stage jettison.',
              'Tsiolkovsky Rocket Equation:\nΔv = Isp · g0 · ln(m0 / mf) ≥ 1,870 m/s'
            ],
            [
              'Mission 2: Blueberries of Life',
              'Mars • Opportunity MER-B',
              'APXS Spectroscopy Matcher: Calibrate energy shift and gain to match Alpha Particle X-Ray Spectrometer lines to Hematite (α-Fe2O3).',
              'Proves ancient Martian liquid water lakes and aqueous sedimentation.'
            ],
            [
              'Mission 3: Heart of Mars',
              'Mars • InSight Lander',
              'Seismogram Travel-Time Analyzer: Adjust P-wave and S-wave arrival cursors on authentic SEIS marsquake traces to calculate core depth.',
              'Wadati Differential:\nd = (tS - tP) / ((1/vS) - (1/vP))\nCalculates ~1,830 km core radius.'
            ],
            [
              'Mission 4: The Dying Candle',
              'Deep Space • Voyager 1',
              'RTG Power Budgeting & Light Delay: Shut down dormant cameras and heaters to keep vital telemetry alive under a strict 249W budget.',
              'Pu-238 radioactive decay (-4W/yr) & 22h 34m one-way speed of light delay.'
            ]
          ],
          [20, 25, 30, 25]
        ),

        createDivider(),

        // 5. Implemented Core Technical Systems
        createHeading1('Implemented Technical Systems & Features', '⚙️'),
        createBullet('3D Interactive Solar System Orrery: ', 'Three.js powered 3D solar system in the Hero Hub with realistic sphere geometries, procedural shaders, drag-to-orbit physics, and planet selection.'),
        createBullet('Spaceship Hab & Commander Station: ', 'Interactive suit-up sequences, commander selection (Asha vs. Leo), mission dossier viewer, and ASTRO-BOT customization.'),
        createBullet('Rover Driving Kinematics: ', 'WASD / Arrow keyboard driving with suspension conforming to elevation grids, wheel spin, and dynamic dust trails across Mars and Moon.'),
        createBullet('Multiple Camera Perspectives: ', 'Free Orbit camera, Cockpit First-Person Perspective (FPP), and Cinematic Chase mode.'),
        createBullet('Planetary LiDAR Subsystem Scanner: ', 'Raycasting engine that detects clicks on spacecraft components (Pancam, Mini-TES, Mössbauer, RAT, RTG), opening technical telemetry modals with direct shortcuts to JPL science labs.'),
        createBullet('Pixar-Style Rigged Character Story Engine: ', 'Rigged SVG vector avatars with real-time lip-sync animations, speech bubbles, and four emotional states (curious, analytical, emotional, celebrating).'),
        createBullet('Gamified S-Curve Roadmap & Collectibles: ', '6-tier progression map, floating 3D Cosmic Coins, level-up XP logic, badges, and printable Master Planetary Archaeologist Certificate.'),
        createBullet('Web Audio API Procedural Soundscape: ', '100% zero-asset synthesized audio generating Brownian noise Martian winds, lunar vacuum drones, servo motors, scan beeps, and radio static.'),
        createBullet('Space Calendar & Missions Archive: ', 'Comprehensive bilingual archive of NASA missions from Pioneer 4 to Artemis, plus milestone Sol logs.'),
        createBullet('120-Second Pitch Showcase Mode: ', 'Automated cinematic camera flythrough highlighting all major project achievements for judges and educators.'),
        createBullet('Bilingual Support: ', 'Complete English and বাংলা (Bengali) localization across all mission data, facts, and quiz questions.'),

        createDivider(),

        // 6. NASA Open Data Matrix
        createHeading1('NASA Open Data Ingestion Matrix', '📡'),
        createParagraph(
          'Our platform ingests and transforms verified NASA open datasets into real-time rendering assets and physical equations:'
        ),

        createStyledTable(
          ['NASA Data Source', 'Domain / Mission', 'Raw Data Format', 'Application Implementation'],
          [
            [
              'NASA Planetary Data System (PDS) Geosciences',
              'MER-B Opportunity (Sols 1–5111)',
              'ASCII / PDS3 Tables',
              'Atmospheric optical depth (Tau = 0.8 to 10.8), solar array power collapse (900 Wh to 22 Wh), and bus voltage tracking.'
            ],
            [
              'NASA MRO HiRISE Archive',
              'Mars Reconnaissance Orbiter',
              '16-bit GeoTIFF DTM',
              'Sub-meter 3D terrain elevation for Perseverance Valley at Endeavour Crater (-14.57° S, 354.67° E).'
            ],
            [
              'NASA LRO LOLA Altimeter',
              'Lunar Reconnaissance Orbiter',
              '16-bit PDS IMG / GeoTIFF',
              'Micro-elevation heightmaps of lunar exploration sites including Mare Tranquillitatis and Oceanus Procellarum.'
            ],
            [
              'NASA 3D Resources / JPL Archives',
              'Official CAD / Mesh Models',
              '.obj / .gltf Assets',
              'Authentic 3D geometry for MER-B Opportunity, Surveyor 1, Apollo Lunar Module, and Voyager 1.'
            ],
            [
              'NASA Mineral & Science Logs',
              'APXS, Mössbauer & RAT Logs',
              'Spectral Tables / CSV',
              'Ground truth for Hematite Blueberries, Jarosite aqueous minerals, and diamond-grind abrasion patterns.'
            ]
          ],
          [22, 22, 18, 38]
        ),

        createDivider(),

        // 7. Team Relics Roster
        createHeading1('Team Relics Roster & Credits', '👥'),
        createStyledTable(
          ['Team Member', 'Production Role', 'Core Responsibilities'],
          [
            [
              'Shaikot Kundu Akash',
              'Team Lead',
              'Overall project coordination, system architecture direction, lead voiceover, and repository oversight.'
            ],
            [
              'Md. Wahiduzzaman Nayem',
              'System Analyst & Video Editor',
              'Video pacing, motion graphics, audio sync, classroom shot pacing, and educational data review.'
            ],
            [
              'Arni Debnath',
              'Lead Designer',
              'UI/UX wireframing, dark glassmorphism design system, infographics, and completion certificates.'
            ],
            [
              'Tanjir Ahmed Fardin',
              'Researcher & Storyteller',
              'NASA PDS literature review, narrative scriptwriting, bilingual data curation, and educational dialogue.'
            ],
            [
              'Tareq Jamil Sarkar Samrat',
              'Frontend & Core Mechanics Developer',
              'Three.js 3D physics engine, rover kinematics, Sol 5111 atmospheric shaders, and STEM quiz mechanics.'
            ]
          ],
          [25, 30, 45]
        ),

        new Paragraph({
          spacing: { before: 180, after: 60 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'NASA International Space Apps Challenge 2026 • Theme: The Next Frontier',
              bold: true,
              size: 18,
              color: COLOR_MUTED
            })
          ]
        })
      ]
    }
  ]
});

async function run() {
  const rootPath = path.resolve('PROJECT_OVERVIEW_AND_IMPLEMENTATION.docx');
  const docxPath = path.resolve('documentation', 'docx', 'PROJECT_OVERVIEW_AND_IMPLEMENTATION.docx');

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(rootPath, buffer);
  fs.writeFileSync(docxPath, buffer);

  console.log('✅ Successfully generated DOCX at:');
  console.log(`   - ${rootPath}`);
  console.log(`   - ${docxPath}`);
}

run().catch((err) => {
  console.error('Error generating docx:', err);
  process.exit(1);
});

