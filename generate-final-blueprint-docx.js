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
  ShadingType,
  ExternalHyperlink
} from 'docx';

const outDirDoc = path.resolve('documentation');
const outDirDocx = path.resolve('documentation', 'docx');

if (!fs.existsSync(outDirDoc)) {
  fs.mkdirSync(outDirDoc, { recursive: true });
}
if (!fs.existsSync(outDirDocx)) {
  fs.mkdirSync(outDirDocx, { recursive: true });
}

// Utility Helpers for clean DOCX styling
const createDivider = () =>
  new Paragraph({
    border: {
      bottom: { color: 'CBD5E0', space: 1, style: BorderStyle.SINGLE, size: 6 }
    },
    spacing: { before: 120, after: 180 },
    children: []
  });

const createHeading1 = (title, color = '1A365D') =>
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

const createHeading2 = (title, color = '2B6CB0') =>
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

const createHyperlinkRun = (text, url) => {
  return new ExternalHyperlink({
    children: [
      new TextRun({
        text: text,
        color: '2B6CB0',
        underline: { color: '2B6CB0' }
      })
    ],
    link: url
  });
};

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Calibri',
          size: 21,
          color: '2D3748'
        },
        paragraph: {
          spacing: { line: 260, before: 60, after: 60 }
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1000,
            bottom: 1000,
            left: 1100,
            right: 1100
          }
        }
      },
      children: [
        // ==========================================
        // TITLE & COVER BLOCK
        // ==========================================
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: 'NASA SPACE APPS CHALLENGE 2026',
              bold: true,
              size: 28,
              color: '1A365D'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: 'Relics of the Red Dust: 240-Second Video Script',
              bold: true,
              size: 24,
              color: 'C53030'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: 'Official Production Blueprint, Technical Architecture & Verified NASA Data Dossier',
              italics: true,
              size: 19,
              color: '4A5568'
            })
          ]
        }),

        createDivider(),

        // Project Metadata Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Project Name', bold: true, color: '1A202C' })] })]
                }),
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Relics of the Red Dust (রিলিক্স অব দ্য রেড ডাস্ট: ইয়ুথ এক্সপ্লোরার)', bold: true, color: 'DD6B20' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Challenge Selected', bold: true, color: '1A202C' })] })]
                }),
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: "Abandoned but Not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars", italics: true })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Global Theme', bold: true, color: '1A202C' })] })]
                }),
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'The Next Frontier (2026)' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Project Scope & Target', bold: true, color: '1A202C' })] })]
                }),
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Beginner / Youth & Intermediate — Interactive 3D Web & STEM Storytelling Platform' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'NASA Data Compliance', bold: true, color: '1A202C' })] })]
                }),
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'F0FFF4' },
                  children: [new Paragraph({ children: [new TextRun({ text: '✅ 100% Validated against NASA Planetary Data System (PDS), HiRISE DEMs & Sol 5111 Telemetry', bold: true, color: '276749' })] })]
                })
              ]
            })
          ]
        }),

        createDivider(),

        // ==========================================
        // PROMINENT NASA DATA PROOF HIGHLIGHT
        // ==========================================
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: 'EBF8FF' },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 12, color: '3182CE' },
                    bottom: { style: BorderStyle.SINGLE, size: 12, color: '3182CE' },
                    left: { style: BorderStyle.SINGLE, size: 24, color: '2B6CB0' },
                    right: { style: BorderStyle.SINGLE, size: 12, color: '3182CE' }
                  },
                  margins: { top: 140, bottom: 140, left: 180, right: 180 },
                  children: [
                    new Paragraph({
                      spacing: { after: 60 },
                      children: [
                        new TextRun({ text: '🛰️ NASA DATA INTEGRATION & SCIENTIFIC PROOF SUMMARY', bold: true, size: 22, color: '2B6CB0' })
                      ]
                    }),
                    new Paragraph({
                      spacing: { after: 40 },
                      children: [
                        new TextRun({ text: 'All data points, atmospheric equations, instruments, and rover locations in this solution are directly derived from official NASA archives:\n' }),
                        new TextRun({ text: '• Planetary Data System (PDS): ', bold: true }),
                        new TextRun({ text: 'MER-B Opportunity Sol 1–5111 historical power (900 Wh to 22 Wh) and battery voltage logs.\n' }),
                        new TextRun({ text: '• Atmospheric Optical Depth (Tau): ', bold: true }),
                        new TextRun({ text: 'Sol 5111 recorded Tau = 10.8 (apocalyptic dust blackout) simulated via Beer-Lambert Law.\n' }),
                        new TextRun({ text: '• HiRISE Orbital Terrain: ', bold: true }),
                        new TextRun({ text: 'Endeavour Crater rim & Perseverance Valley (2.21°S, 354.67°E) elevation reconstruction.\n' }),
                        new TextRun({ text: '• Complete Clickable Proven Links Directory: ', bold: true }),
                        new TextRun({ text: 'Listed under Section 4 with direct verified URLs to NASA, PDS, JPL, USGS, and peer-reviewed journals.' })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        }),

        createDivider(),

        // ==========================================
        // SECTION 1: TEAM MEMBERS & PRODUCTION ROLES
        // ==========================================
        createHeading1('1. Team Members & Production Roles'),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: 'The multidisciplinary production and engineering team behind Relics of the Red Dust combines software engineering, 3D graphics, scientific research, and visual storytelling:'
            })
          ]
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 28, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: '2B6CB0' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Member Name', bold: true, color: 'FFFFFF' })] })]
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: '2B6CB0' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Assigned Role', bold: true, color: 'FFFFFF' })] })]
                }),
                new TableCell({
                  width: { size: 42, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: '2B6CB0' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Primary Responsibilities', bold: true, color: 'FFFFFF' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Shaikot Kundu Akash', bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Team Lead', bold: true, color: 'C53030' })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Overall project coordination, system architecture direction, team sync, and lead presenter.' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Nayem Wahid', bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'System Architect & Video Editor', bold: true, color: '2B6CB0' })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Core web architecture, audio-visual editing, motion graphics design, and video production pipeline.' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Arni Debnath', bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Lead Designer', bold: true, color: 'DD6B20' })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'UI/UX wireframes, glassmorphism HUD design, graphic assets, typography, and certificate visuals.' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Tanjir Ahmed Fardin', bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Researcher & Storyteller', bold: true, color: '38A169' })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Scientific literature review, narrative scriptwriting, PDS data curation, and bilingual dialogue design.' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Tareq Jamil Sarkar Samrat', bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Frontend & Core Mechanics Developer', bold: true, color: '805AD5' })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Three.js 3D physics engine, rover controls, Sol 5111 simulation shaders, and quest gamification engine.' })] })]
                })
              ]
            })
          ]
        }),

        createDivider(),

        // =========================================================================
        // SECTION 2: 240-SECOND VIDEO SCRIPT & PRODUCTION TIMELINE (4 MINUTES)
        // =========================================================================
        createHeading1('2. 240-Second Video Script & Production Timeline (4 Minutes)'),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: 'This exact timeline blueprint guides the official 4-minute presentation video, combining synchronized screen captures, audio voiceovers, dynamic sound design, and live 3D prototype demonstrations.'
            })
          ]
        }),

        // ----------------------------------------------------
        // Act I: 0:00 - 0:30
        // ----------------------------------------------------
        createHeading2('■ 0:00 – 0:30 | Act I: Introduction & Team (30 Seconds)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Core Focus', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Establish team identity, member roles, and chosen NASA challenge under the 2026 global theme.' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Visuals & Action', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: '• 0:00–0:10: ', bold: true }),
                        new TextRun({ text: "High-energy opening title sequence with cinematic Martian topography, project title 'Relics of the Red Dust', and the NASA Space Apps 2026 'The Next Frontier' logo overlay.\n" }),
                        new TextRun({ text: '• 0:10–0:30: ', bold: true }),
                        new TextRun({ text: 'Crisp dynamic grid showcasing all five team members with animated lower-third title cards highlighting each member’s name and dedicated role:\n' }),
                        new TextRun({ text: '   - Shaikot Kundu Akash (Team Lead)\n   - Nayem Wahid (System Architect & Video Editor)\n   - Arni Debnath (Designer)\n   - Tanjir Ahmed Fardin (Researcher & Storyteller)\n   - Tareq Jamil Sarkar Samrat (Frontend & Core Mechanics Developer).' })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Spoken Voiceover\n(Exact VO)', bold: true, color: 'C53030' })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'FFF5F5' },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '"Hello NASA Space Apps! We are Team Relics of the Red Dust. I am Shaikot Kundu Akash, Team Lead. Joining me are Nayem Wahid, our System Architect and Video Editor; Arni Debnath, our Lead Designer; Tanjir Ahmed Fardin, Researcher and Storyteller; and Tareq Jamil Sarkar Samrat, Frontend and Core Mechanics Developer. Under the 2026 theme \'The Next Frontier\', we tackled the challenge: Abandoned but Not Forgotten: Storytelling about NASA\'s Discarded Equipment on the Moon and Mars."',
                          italics: true,
                          bold: true
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Director & Audio Notes', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Camera starts wide and pushes in on each member portrait during callouts. Keep music upbeat, futuristic synth at -18dB under voiceover.' })] })]
                })
              ]
            })
          ]
        }),

        // ----------------------------------------------------
        // Act II: 0:30 - 1:00
        // ----------------------------------------------------
        createHeading2('■ 0:30 – 1:00 | Act II: The Problem (30 Seconds)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Core Focus', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Identify the disconnect between decommissioned NASA hardware and public/student accessibility.' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Visuals & Action', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: '• 0:30–0:45: ', bold: true }),
                        new TextRun({ text: 'Dramatic slow-panning 3D shot of the Opportunity (MER-B) rover resting motionless in Perseverance Valley / Endeavour Crater, enveloped in reddish haze and dust accumulation.\n' }),
                        new TextRun({ text: '• 0:45–1:00: ', bold: true }),
                        new TextRun({ text: 'Fast split-screen montage contrasting dense, inaccessible raw telemetry tables and academic PDF papers against uninspired students struggling with conventional space education materials.' })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Spoken Voiceover\n(Exact VO)', bold: true, color: 'C53030' })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'FFF5F5' },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '"Since the 1960s, NASA has deployed historic rovers and landers across extraterrestrial terrains. Though their operational lifespans end, they remain humanity\'s greatest archaeological monuments in deep space. For instance, the Opportunity rover traversed over 45 kilometers on Mars before succumbing to a catastrophic global dust storm. Tragically, these historic voyages and scientific breakthroughs remain buried within complex technical archives—far out of reach for students and young minds. How do we resurrect these dormant relics to educate and inspire the next generation of space pioneers?"',
                          italics: true,
                          bold: true
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Director & Audio Notes', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Tone shifts to contemplative and solemn. Wind sound effects mixed lightly into the background with resonant atmospheric filtering.' })] })]
                })
              ]
            })
          ]
        }),

        // ----------------------------------------------------
        // Act III: 1:00 - 1:30
        // ----------------------------------------------------
        createHeading2('■ 1:00 – 1:30 | Act III: Data Sources & Ingestion Pipeline (30 Seconds)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Core Focus', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Transparently validate NASA open data integration and technical ingestion pipeline.' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Visuals & Action', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: '• 1:00–1:15: ', bold: true }),
                        new TextRun({ text: "Screen recording of accessing NASA Planetary Data System (PDS) archives, downloading HiRISE Digital Elevation Models (DEMs), and Opportunity's Sol 1 to Sol 5111 mission logs.\n" }),
                        new TextRun({ text: '• 1:15–1:30: ', bold: true }),
                        new TextRun({ text: 'Fast animated diagram showcasing data flow: PDS telemetry logs converting into Three.js terrain heightmaps, wheel rotation physics, and real-time atmospheric optical depth (Tau) shader parameters.' })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Spoken Voiceover\n(Exact VO)', bold: true, color: 'C53030' })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'FFF5F5' },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '"To guarantee rigorous scientific authenticity, our platform directly integrates open data from the NASA Planetary Data System (PDS). We reconstructed authentic Martian surface topography inspired by HiRISE orbital elevation data, incorporated Opportunity\'s exact 45.16-kilometer historical odometer logs, and mapped recorded atmospheric optical depth—tau—measurements up through the rover\'s poignant final transmission at Sol 5111."',
                          italics: true,
                          bold: true
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Director & Audio Notes', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Highlight NASA logos, PDS data URLs, and code snippets on screen to demonstrate rigorous authenticity and scientific traceability.' })] })]
                })
              ]
            })
          ]
        }),

        // ----------------------------------------------------
        // Act IV: 1:30 - 3:30
        // ----------------------------------------------------
        createHeading2('■ 1:30 – 3:30 | Act IV: The Solution & Live Interactive Prototype Demo (120 Seconds)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Core Focus', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Comprehensive walkthrough of prototype functionality: 3D physics navigation, archaeological relics, Beer-Lambert atmospheric simulation, and certification academy.' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Visuals & Screen Action\n(4 Sub-Segments)', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: '1. 1:30–1:55 [Core Drive & HUD Mechanics]: ', bold: true, color: '2B6CB0' }),
                        new TextRun({ text: 'Full HD screencast of user piloting Opportunity with WASD controls. Dynamic 3D suspension responds to red dunes, live odometer counts meters traversed, and an 8-meter holographic beacon beams into the Martian sky as a GPS waypoint.\n\n' }),
                        new TextRun({ text: '2. 1:55–2:30 [Archaeological Payload Discovery]: ', bold: true, color: '2B6CB0' }),
                        new TextRun({ text: 'Proximity prompt [E] triggers interactive LiDAR scan. 3D exploded view of Pancam, Hematite Blueberries, Rock Abrasion Tool (RAT), and Mössbauer Spectrometer with bilingual English/Bengali info drawers and companion bot dialogues.\n\n' }),
                        new TextRun({ text: '3. 2:30–3:05 [Sol 5111 Beer-Lambert Simulation]: ', bold: true, color: '2B6CB0' }),
                        new TextRun({ text: 'Interactive timeline slider scrubbed across the June 2018 storm. Sky shader darkens from rust-orange to pitch black as tau spikes to 10.8; live telemetry gauges demonstrate solar power output crashing from 900 Wh down to 22 Wh.\n\n' }),
                        new TextRun({ text: '4. 3:05–3:30 [Space Cadet Academy & Certification]: ', bold: true, color: '2B6CB0' }),
                        new TextRun({ text: 'Decoding the Blackbox memory core, solving gamified STEM questions, and displaying the personalized, verified \'Martian Archaeologist Certificate\' with instant export.' })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Spoken Voiceover\n(Exact VO)', bold: true, color: 'C53030' })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'FFF5F5' },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '"Enter \'Relics of the Red Dust\'—an immersive 3D web platform where students become Martian Archaeologists in the year 2085.\n\nPowered by custom WebGL physics, students navigate Opportunity across realistic Martian terrain with dynamic suspension and real-time odometry. Towering holographic beacons direct explorers toward six historic relic sites. Approaching a waypoint activates the automated proximity scanner, allowing users to inspect authentic scientific payloads—from the high-resolution Pancam and diamond-grit RAT grinder, to the Mössbauer spectrometer that confirmed ancient acidic water, and the enigmatic hematite blueberries. Full bilingual localization in Bengali and English ensures barrier-free STEM education for emerging communities worldwide.\n\nThrough our Sol 5111 Time-Machine simulation, students physically experience atmospheric physics. By sliding the historical storm timeline, real-time Beer-Lambert extinction shaders simulate how an atmospheric tau of 10.8 suffocated solar power down to critical levels. Finally, decoding the blackbox core unlocks the Space Cadet Academy, testing learners with interactive quizzes and conferring an official, verified Martian Archaeologist Certificate."',
                          italics: true,
                          bold: true
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Director & Audio Notes', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Pacing must be brisk and fluid. Cursor movements should be smooth and deliberate. Audio should emphasize UI clicks, rover engine whirs, telemetry chimes, and storm wind howl.' })] })]
                })
              ]
            })
          ]
        }),

        // ----------------------------------------------------
        // Act V: 3:30 - 4:00
        // ----------------------------------------------------
        createHeading2('■ 3:30 – 4:00 | Act V: Impact, Future Vision & Conclusion (30 Seconds)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Core Focus', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Broader vision, educational impact, future hardware preservation roadmap, and formal closing.' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Visuals & Action', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: '• 3:30–3:45: ', bold: true }),
                        new TextRun({ text: 'Future roadmap montage: Preview of Apollo 11 Lunar Module landing site, Voyager 1 & 2 Golden Record deep-space audio explorer, and immersive WebXR VR headset testing.\n' }),
                        new TextRun({ text: '• 3:45–4:00: ', bold: true }),
                        new TextRun({ text: 'Final hero shot of the Martian sunset with Opportunity, transitioning to the full team roster, GitHub/demo links, and NASA Space Apps 2026 closing laurels.' })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Spoken Voiceover\n(Exact VO)', bold: true, color: 'C53030' })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'FFF5F5' },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '"Looking ahead, we are expanding our platform to preserve Apollo lunar landing modules and Voyager deep-space probes via WebXR. \'Relics of the Red Dust\' transforms dormant hardware into living educational monuments, empowering youth worldwide to pursue careers in space science. Though their batteries have drained and dust covers their frames, the trails blazed by these robotic pioneers will guide humanity\'s first footsteps on Mars. Thank you, NASA Space Apps Challenge!"',
                          italics: true,
                          bold: true
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Director & Audio Notes', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Music swells to an inspiring, heroic resolution. Text on screen displays team name, member roles, repository URL, and NASA Space Apps attribution.' })] })]
                })
              ]
            })
          ]
        }),

        createDivider(),

        // =========================================================================
        // SECTION 3: TECHNICAL STACK & NASA DATASET INGESTION ARCHITECTURE
        // =========================================================================
        createHeading1('3. Technical Stack & NASA Scientific Dataset Ingestion Architecture'),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: 'Relics of the Red Dust is engineered without heavy third-party gaming engine bloat, running directly in the browser at a silky 60 FPS across desktop and mobile devices.'
            })
          ]
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: '2B6CB0' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Architecture Layer', bold: true, color: 'FFFFFF' })] })]
                }),
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: '2B6CB0' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Implementation Details & Engineering Stack', bold: true, color: 'FFFFFF' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: '3D Graphics & Physics', bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Three.js (r170), WebGL 2.0, procedural Martian terrain generation via Perlin noise & HiRISE elevation models, ray-marched atmospheric dust shaders, and custom 6-wheel dynamic suspension kinematics.' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Scientific Datasets', bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'NASA Planetary Data System (PDS) Geosciences Node, MER-B Sol 1 to Sol 5111 Odometer and Solar Power logs, and HiRISE DEMs of Perseverance Valley / Endeavour Crater.' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Atmospheric Physics', bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Beer-Lambert Law (I = I₀ · e^(-τ / cos θ)) mathematically modeling sunlight extinction under global dust storms across Tau values from 0.5 (clear sky) to 10.8 (apocalyptic blackout).' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Spatial Web Audio Engine', bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Custom Web Audio API synthesizer generating real-time Martian atmospheric wind through resonant bandpass filters dynamically modulated by tau, telemetry chirps, and Morse code audio.' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Localization & Accessibility', bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Complete bilingual English and Bengali narration, UI labels, and scientific instrument drawers; responsive dual-mode controls (WASD keyboard + virtual mobile touch joystick).' })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Future Capabilities', bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'WebXR VR/AR immersive walk-around mode, Apollo 11 Tranquility Base Lunar Module exploration, and Voyager 1 & 2 Interstellar Golden Record audio decoder.' })] })]
                })
              ]
            })
          ]
        }),

        createDivider(),

        // =========================================================================
        // SECTION 4: ALL PROVEN SCIENTIFIC LINKS, DATASETS & TECHNOLOGIES
        // =========================================================================
        createHeading1('4. Directory of Proven Links & Verified NASA Scientific Sources'),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: 'Every scientific dataset, historical telemetry point, geological artifact, optical extinction equation, and open-source software library utilized in building Relics of the Red Dust is fully verified with clickable links below:'
            })
          ]
        }),

        createHeading2('4.1 NASA Planetary Data System & Mission Telemetry Archives'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Resource / Dataset Name', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Clickable Proven Link', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Role in Solution', bold: true })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NASA PDS Geosciences Node (MER Archive)', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('pds-geosciences.wustl.edu/missions/mer', 'https://pds-geosciences.wustl.edu/missions/mer/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Ground-truth historical rover telemetry, raw odometer data, and instrument logs.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NASA Science: MER Opportunity Mission', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('science.nasa.gov/mission/mer-opportunity', 'https://science.nasa.gov/mission/mer-opportunity/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Official mission timeline, milestones, and scientific legacy documentation.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NASA JPL Mars Exploration Rovers Portal', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('mars.nasa.gov/mer', 'https://mars.nasa.gov/mer/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Rover engineering specs, landing coordinates, and rover operations logs.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NASA Opportunity Sol 1–5111 All Status Logs', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('mars.nasa.gov/mer/mission/status_opportunityAll.html', 'https://mars.nasa.gov/mer/mission/status_opportunityAll.html')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Daily Sol-by-Sol operational status and historical Sol 5111 storm records.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NASA Opportunity Mission Timeline & Odometer', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('mars.nasa.gov/mer/mission/timeline', 'https://mars.nasa.gov/mer/mission/timeline/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '45.16 km distance record verification across Perseverance Valley & Endeavour Crater.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NASA PDS Atmospheres Node (MER Tau Data)', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/mer.html', 'https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/mer.html')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Atmospheric optical depth (tau) historical measurements and dust opacity series.' })] })] })
              ]
            })
          ]
        }),

        createHeading2('4.2 Martian Surface Topography & Orbital Mapping'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Resource / Dataset Name', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Clickable Proven Link', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Role in Solution', bold: true })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'University of Arizona / HiRISE High-Resolution Camera', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('www.uahirise.org', 'https://www.uahirise.org/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Perseverance Valley and Endeavour crater rim terrain imagery.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'USGS Astrogeology Science Center / HiRISE DEMs', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('astrogeology.usgs.gov/search/map/Mars/.../HiRISE', 'https://astrogeology.usgs.gov/search/map/Mars/Mars_Reconnaissance_Orbiter/HiRISE/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Digital Elevation Model elevation data used to sculpt 3D Martian terrain heightmap.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NASA Mars Trek 3D Interactive Map', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('trek.nasa.gov/mars', 'https://trek.nasa.gov/mars/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Geographic coordinate mapping for Endeavour Crater (2.21°S, 354.67°E).' })] })] })
              ]
            })
          ]
        }),

        createHeading2('4.3 Opportunity Scientific Payloads & Geological Discovery Records'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Scientific Instrument / Relic', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Clickable Proven Link', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Scientific Role in App', bold: true })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pancam (Panoramic Camera - Cornell / JPL)', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('pancam.astro.cornell.edu', 'https://pancam.astro.cornell.edu/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Stereoscopic multispectral imaging instrument specs & diagnostic scan.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'RAT (Rock Abrasion Tool - Honeybee Robotics / NASA)', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('mars.nasa.gov/mer/mission/spacecraft_instru_rat.html', 'https://mars.nasa.gov/mer/mission/spacecraft_instru_rat.html')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Diamond-grit grinding wheel specs and rock grinding interactive discovery.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'MIMOS II Mössbauer Spectrometer (Univ. Mainz / NASA)', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('mars.nasa.gov/mer/mission/spacecraft_instru_mossbauer.html', 'https://mars.nasa.gov/mer/mission/spacecraft_instru_mossbauer.html')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Verification of Jarosite mineral confirming ancient acidic liquid water.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'APXS (Alpha Particle X-Ray Spectrometer - Max Planck / NASA)', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('mars.nasa.gov/mer/mission/spacecraft_instru_apxs.html', 'https://mars.nasa.gov/mer/mission/spacecraft_instru_apxs.html')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Elemental chemical composition analysis of Martian target rocks.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Microscopic Imager (MI - USGS / NASA)', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('mars.nasa.gov/mer/mission/spacecraft_instru_mi.html', 'https://mars.nasa.gov/mer/mission/spacecraft_instru_mi.html')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Close-up sub-millimeter texture inspection of spherules.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Hematite "Martian Blueberries" Discovery Archive', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('nasa.gov/mission_pages/mer/news/mer-20040318.html', 'https://www.nasa.gov/mission_pages/mer/news/mer-20040318.html')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Groundwater concretion discovery at Eagle Crater / Meridiani Planum.' })] })] })
              ]
            })
          ]
        }),

        createHeading2('4.4 Atmospheric Physics & Scientific Literature'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Research Paper / Reference', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Clickable Proven DOI / Link', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Equation & Physical Application', bold: true })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Lemmon et al., Atmospheric Imaging Results from MER', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('doi.org/10.1016/j.icarus.2014.03.029', 'https://doi.org/10.1016/j.icarus.2014.03.029')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Beer-Lambert optical depth equation: I = I₀ · e^(-τ / cos θ).' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NASA JPL Sol 5111 Final Status & Power Collapse Report', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('jpl.nasa.gov/news/nasa-silent-rover-opportunity-leaves-legacy', 'https://www.jpl.nasa.gov/news/nasa-silent-rover-opportunity-leaves-legacy')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Verification of Sol 5111 power collapse from 900 Wh down to 22 Wh.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'The Planetary Society: Opportunity Final Dust Storm Analysis', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('planetary.org/articles/06-mer-update-planet-encircling-dust-cloud', 'https://www.planetary.org/articles/06-mer-update-planet-encircling-dust-cloud')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Planet-encircling dust storm dynamics and solar array obscuration.' })] })] })
              ]
            })
          ]
        }),

        createHeading2('4.5 Web Engineering, Frameworks & Open-Source Libraries'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Library / Tool', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Clickable Proven Link', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Integration in Solution', bold: true })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Three.js (r170)', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('threejs.org', 'https://threejs.org/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '3D WebGL 2.0 rendering engine, shaders, cameras, and raycasting.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Web Audio API (W3C Standard)', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('developer.mozilla.org/Web_Audio_API', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Browser-native audio synthesizer for wind noise, chirps, and Morse code.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Canvas-Confetti', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('npmjs.com/package/canvas-confetti', 'https://www.npmjs.com/package/canvas-confetti')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Celebratory particle effects upon completing Space Cadet missions.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Vite Next-Gen Frontend Tooling', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('vitejs.dev', 'https://vitejs.dev/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Fast ESM bundler and optimized client-side distribution.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Google Fonts', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('fonts.google.com', 'https://fonts.google.com/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Modern typography system supporting English and Bengali scripts.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Docx JavaScript Document Library', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('docx.js.org', 'https://docx.js.org/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Programmatic compilation of formal NASA pitch & SRS documentation.' })] })] })
              ]
            })
          ]
        }),

        createHeading2('4.6 NASA Space Apps Challenge Official Portals'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Challenge Portal', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Clickable Proven Link', bold: true })] })]
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NASA Space Apps 2026 Challenge Page', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('spaceappschallenge.org/.../abandoned-but-not-forgotten', 'https://www.spaceappschallenge.org/2026/challenges/abandoned-but-not-forgotten-storytelling-about-nasas-discarded-equipment-on-the-moon-and-mars/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Official challenge guidelines, goals, and submission portal.' })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NASA Space Apps Global Hackathon', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [createHyperlinkRun('spaceappschallenge.org', 'https://www.spaceappschallenge.org/')] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Global hackathon homepage, resources, and community hub.' })] })] })
              ]
            })
          ]
        }),

        createDivider(),

        // ==========================================
        // CLOSING INSPIRATIONAL STATEMENT
        // ==========================================
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 80 },
          shading: { type: ShadingType.CLEAR, fill: 'FFF5F5' },
          children: [
            new TextRun({
              text: '"Though their batteries have drained and dust has covered their frames, the trails blazed by these robotic pioneers will guide humanity\'s first footsteps on Mars."\n',
              italics: true,
              bold: true,
              size: 22,
              color: 'C53030'
            }),
            new TextRun({
              text: '— Team Relics of the Red Dust, NASA Space Apps Challenge 2026',
              bold: true,
              size: 20,
              color: '742A2A'
            })
          ]
        })
      ]
    }
  ]
});

// Output targets
const targetFilePath1 = path.join(outDirDoc, 'NASA_Space_Apps_2026_Relics_of_the_Red_Dust_Official_Production_Blueprint.docx');
const targetFilePath2 = path.join(outDirDocx, 'NASA_Space_Apps_2026_Relics_of_the_Red_Dust_Official_Production_Blueprint.docx');
const targetFilePath3 = path.join(outDirDoc, '06_OFFICIAL_PRODUCTION_BLUEPRINT_AND_VIDEO_SCRIPT.docx');
const targetFilePath4 = path.join(outDirDocx, '06_OFFICIAL_PRODUCTION_BLUEPRINT_AND_VIDEO_SCRIPT.docx');

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(targetFilePath1, buffer);
  fs.writeFileSync(targetFilePath2, buffer);
  fs.writeFileSync(targetFilePath3, buffer);
  fs.writeFileSync(targetFilePath4, buffer);
  console.log(`✅ Main DOCX created successfully at: ${targetFilePath1}`);
  console.log(`✅ Copy DOCX created successfully at: ${targetFilePath2}`);
  console.log(`✅ Direct DOCX created successfully at: ${targetFilePath3}`);
  console.log(`✅ Copy Direct DOCX created successfully at: ${targetFilePath4}`);
});

