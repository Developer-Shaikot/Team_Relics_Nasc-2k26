import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const pdfDir = path.resolve('documentation', 'pdf');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NASA Space Apps 2026 - Master Video Script and Production Blueprint</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 14mm 14mm 16mm 14mm;
      @bottom-right {
        content: "Page " counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 9px;
        color: #64748b;
      }
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11.5px;
      line-height: 1.55;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    
    /* Cover / Header Banner */
    .header-card {
      background: linear-gradient(135deg, #0b192c 0%, #1e3a8a 50%, #0f172a 100%);
      color: #ffffff;
      padding: 22px 24px;
      border-radius: 10px;
      margin-bottom: 20px;
      border: 1px solid #3b82f6;
      page-break-inside: avoid;
    }
    .badge-row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #f8fafc;
      font-size: 9.5px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 999px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .badge-accent {
      background: #ea580c;
      border-color: #f97316;
      color: #ffffff;
    }
    .badge-gold {
      background: #ca8a04;
      border-color: #eab308;
      color: #ffffff;
    }
    .header-title {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0 0 6px 0;
      color: #ffffff;
    }
    .header-subtitle {
      font-family: 'Outfit', sans-serif;
      font-size: 13.5px;
      font-weight: 600;
      color: #93c5fd;
      margin: 0 0 12px 0;
    }
    .header-meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      font-size: 10.5px;
      color: #cbd5e1;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 10px;
    }
    .header-meta div strong {
      color: #ffffff;
    }

    /* Section Headings */
    h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 22px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 5px;
      page-break-after: avoid;
    }
    h2 .section-tag {
      background: #0284c7;
      color: #ffffff;
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 4px;
      font-weight: 700;
    }
    h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 12.5px;
      font-weight: 700;
      color: #1e3a8a;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }

    /* Block Header */
    .block-header {
      background: #f1f5f9;
      border-left: 4px solid #0284c7;
      padding: 8px 12px;
      border-radius: 0 6px 6px 0;
      margin: 16px 0 10px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      page-break-inside: avoid;
    }
    .block-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 12px;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .block-time {
      background: #0284c7;
      color: #ffffff;
      font-weight: 700;
      font-size: 9.5px;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Scene Card */
    .scene-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 12px;
      background: #ffffff;
      overflow: hidden;
      page-break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .scene-header {
      background: #f8fafc;
      padding: 7px 12px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .scene-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 11.5px;
      color: #0f172a;
    }
    .scene-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      color: #ea580c;
      background: #fff7ed;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid #ffedd5;
    }
    .scene-body {
      padding: 9px 12px;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 85px 1fr;
      gap: 6px 10px;
      margin-bottom: 6px;
    }
    .detail-label {
      font-weight: 700;
      color: #475569;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .detail-content {
      color: #1e293b;
      font-size: 11px;
    }
    
    /* Dialogue Boxes */
    .dialogue-box {
      background: #f8fafc;
      border-left: 3px solid #6366f1;
      padding: 6px 10px;
      margin: 6px 0;
      border-radius: 0 4px 4px 0;
      font-size: 11px;
    }
    .dialogue-speaker {
      font-weight: 700;
      color: #4338ca;
      font-size: 10px;
      margin-bottom: 2px;
      text-transform: uppercase;
      font-family: 'Outfit', sans-serif;
    }
    .dialogue-text {
      font-style: italic;
      color: #0f172a;
    }

    /* Callout & OSD boxes */
    .osd-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 3px solid #16a34a;
      padding: 6px 10px;
      margin: 6px 0;
      border-radius: 0 4px 4px 0;
      font-size: 10.5px;
      color: #166534;
    }
    .osd-title {
      font-weight: 700;
      font-size: 9.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .nasa-data-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-left: 3px solid #2563eb;
      padding: 6px 10px;
      margin: 6px 0;
      border-radius: 0 4px 4px 0;
      font-size: 10.5px;
      color: #1e40af;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 10.5px;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #0f172a;
      color: #f8fafc;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Code & Formulas */
    .formula {
      font-family: 'JetBrains Mono', monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      color: #0f172a;
      display: inline-block;
    }

    /* Footer */
    .footer-note {
      text-align: center;
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #64748b;
      page-break-inside: avoid;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- HEADER / COVER BANNER -->
  <div class="header-card">
    <div class="badge-row">
      <span class="badge badge-accent">NASA International Space Apps Challenge 2026</span>
      <span class="badge badge-gold">Theme: The Next Frontier</span>
      <span class="badge">Master Video Script & Production Blueprint</span>
    </div>
    <div class="header-title">RELICS OF THE COSMIC DUST</div>
    <div class="header-subtitle">Interactive 3D Planetary Archaeology & STEM Storytelling Platform</div>
    <div class="header-meta">
      <div><strong>Challenge:</strong> Abandoned but Not Forgotten: NASA’s Discarded Equipment on Moon & Mars</div>
      <div><strong>Exact Video Runtime:</strong> 240 Seconds (04:00 Minutes)</div>
      <div><strong>Team Name:</strong> TEAM RELICS</div>
      <div><strong>Technology Core:</strong> Zero-Install WebGL (Three.js) & Web Audio API</div>
    </div>
  </div>

  <!-- SECTION 1: TEAM ROSTER -->
  <h2><span class="section-tag">01</span> Team Members & Production Roles</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Team Member</th>
        <th style="width: 25%;">Production Role</th>
        <th style="width: 50%;">Core Video & Engineering Responsibilities</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Shaikot Kundu Akash</strong></td>
        <td>Team Lead</td>
        <td>Overall project coordination, system architecture, lead presenter VO, repository oversight.</td>
      </tr>
      <tr>
        <td><strong>Md. Wahiduzzaman Nayem</strong></td>
        <td>System Analyst & Video Editor</td>
        <td>Video editing, motion graphics, audio sync, classroom shot pacing, data architecture review.</td>
      </tr>
      <tr>
        <td><strong>Arni Debnath</strong></td>
        <td>Lead Designer</td>
        <td>UI/UX wireframing, dark glassmorphism design system, infographics, certificate rendering.</td>
      </tr>
      <tr>
        <td><strong>Tanjir Ahmed Fardin</strong></td>
        <td>Researcher & Storyteller</td>
        <td>NASA PDS & mission literature review, narrative scriptwriting, educational dialogue design.</td>
      </tr>
      <tr>
        <td><strong>Tareq Jamil Sarkar Samrat</strong></td>
        <td>Frontend & Mechanics Developer</td>
        <td>Three.js 3D physics engine, rover kinematics, Sol 5111 atmospheric shaders, STEM quiz mechanics.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 2: NASA DATASETS -->
  <h2><span class="section-tag">02</span> Master NASA Open Data & Scientific Pipeline Ingestion</h2>
  <p>Our platform directly integrates verified NASA open datasets to drive real-time 3D terrain generation, physics-based atmospheric extinction calculations, authentic CAD geometry, and historical telemetry:</p>

  <table>
    <thead>
      <tr>
        <th style="width: 22%;">NASA Data Source</th>
        <th style="width: 24%;">Mission & Scientific Domain</th>
        <th style="width: 20%;">Raw Format</th>
        <th style="width: 34%;">Direct Implementation in Solution</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>NASA PDS Geosciences Node</strong></td>
        <td>MER-B Opportunity (Sols 1–5111)</td>
        <td>ASCII / PDS3 Tables</td>
        <td>Historical atmospheric tau logs (0.8–10.8), power collapse (900 Wh to 22 Wh), 20.5V battery cutoff, Beer-Lambert solar extinction formula: <span class="formula">I = I₀ · e^(-τ / cos θ)</span>.</td>
      </tr>
      <tr>
        <td><strong>NASA MRO HiRISE Archive</strong></td>
        <td>Mars Reconnaissance Orbiter</td>
        <td>16-bit GeoTIFF DTM</td>
        <td>Sub-meter elevation heightmap for Perseverance Valley at Endeavour Crater (-14.57°S, 354.67°E).</td>
      </tr>
      <tr>
        <td><strong>NASA LRO LOLA Altimetry</strong></td>
        <td>Lunar Reconnaissance Orbiter</td>
        <td>16-bit PDS IMG / GeoTIFF</td>
        <td>Laser altimeter DTM elevation maps for historical lunar sites including Oceanus Procellarum (2.47°S, 316.66°E).</td>
      </tr>
      <tr>
        <td><strong>NASA 3D Resources & JPL</strong></td>
        <td>Surveyor 1 & MER-B Opportunity</td>
        <td>.obj / .gltf 3D Meshes</td>
        <td>Authentic 3D rover and lander models with functional 6-wheel rocker-bogie suspension physics.</td>
      </tr>
      <tr>
        <td><strong>NASA Mineralogical Archives</strong></td>
        <td>APXS, Mössbauer & RAT Logs</td>
        <td>Spectral CSV / PDS Data</td>
        <td>Aqueous mineralogy: Hematite Blueberries at Eagle Crater, Jarosite identification, and rock abrasion grind-hole telemetry.</td>
      </tr>
    </tbody>
  </table>

  <div class="nasa-data-box">
    <div class="osd-title">⚡ DIRECT DATA PIPELINE FLOW</div>
    Raw NASA PDS / GeoTIFF Data ➔ GDAL Raster Converter ➔ 16-Bit Grayscale Heightmap Grids ➔ Three.js Procedural WebGL Terrain + Ray-marched Atmospheric Dust Shaders.
  </div>

  <div class="page-break"></div>

  <!-- SECTION 3: 240-SECOND MASTER SCRIPT -->
  <h2><span class="section-tag">03</span> 240-Second (4-Minute) Master Production Script</h2>

  <!-- BLOCK 1 -->
  <div class="block-header">
    <span class="block-title">Block 1: Introduction & Team Reveal</span>
    <span class="block-time">0:00 – 0:30 (30 Seconds)</span>
  </div>

  <div class="scene-card">
    <div class="scene-header">
      <span class="scene-title">SCENE 1: Establishing the Smart Classroom & Team Reveal</span>
      <span class="scene-time">0:00 – 0:10</span>
    </div>
    <div class="scene-body">
      <div class="detail-grid">
        <div class="detail-label">Visual</div>
        <div class="detail-content">Wide establishing shot of a modern 2026 smart classroom full of students. Morning sunlight streams through large windows; front monitor is asleep. Mr. Kabir stands near his desk smiling. At 0:05, a sleek semi-transparent glassmorphic overlay appears with the NASA Space Apps 2026 badge and Team Relics crest.</div>
        <div class="detail-label">On-Screen</div>
        <div class="detail-content"><strong>TEAM RELICS:</strong> Shaikot Kundu Akash (Lead), Md. Wahiduzzaman Nayem (Systems & Video), Arni Debnath (Design), Tanjir Ahmed Fardin (Research & Story), Tareq Jamil Sarkar Samrat (Frontend & Core Mechanics).</div>
        <div class="detail-label">Audio & SFX</div>
        <div class="detail-content">Classroom murmur fades into an energetic synth pulse. Smooth digital UI chime.</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">VO (Voice-Over, 0:05 – 0:12)</div>
        <div class="dialogue-text">"We are Team Relics—led by Shaikot, with systems and editing by Nayem, UI/UX design by Arni, research and storytelling by Fardin, and interactive mechanics built by Samrat."</div>
      </div>
    </div>
  </div>

  <div class="scene-card">
    <div class="scene-header">
      <span class="scene-title">SCENE 2: The Student's Question & The Next Frontier</span>
      <span class="scene-time">0:10 – 0:30</span>
    </div>
    <div class="scene-body">
      <div class="detail-grid">
        <div class="detail-label">Visual</div>
        <div class="detail-content">Medium close-up on Emon, a curious 12-year-old boy in a striped t-shirt raising his hand eagerly. Cut to wide shot at 0:20 with lower-third displaying the NASA 2026 challenge title.</div>
        <div class="detail-label">On-Screen</div>
        <div class="detail-content"><em>NASA Space Apps 2026 | Theme: The Next Frontier | Challenge: Abandoned but Not Forgotten</em></div>
        <div class="detail-label">Audio & SFX</div>
        <div class="detail-content">Classroom hush, single chair creak, ambient synth continues low in mix.</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">EMON (In-Scene Dialogue, 0:10 – 0:18)</div>
        <div class="dialogue-text">"Sir! NASA sent so many rovers and landers to the Moon and Mars, right? What happened to them? Did they even complete their missions?"</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">VO (Narrator, 0:19 – 0:30)</div>
        <div class="dialogue-text">"Under the 2026 Space Apps theme, 'The Next Frontier', we set out to answer Emon’s question by tackling the challenge: Abandoned but Not Forgotten: Storytelling About NASA’s Discarded Equipment on the Moon and Mars."</div>
      </div>
    </div>
  </div>

  <!-- BLOCK 2 -->
  <div class="block-header">
    <span class="block-title">Block 2: The Problem — Inaccessible Cold Archives</span>
    <span class="block-time">0:30 – 1:00 (30 Seconds)</span>
  </div>

  <div class="scene-card">
    <div class="scene-header">
      <span class="scene-title">SCENES 3, 4 & 5: Teacher’s Search & The Data Wall</span>
      <span class="scene-time">0:30 – 0:48</span>
    </div>
    <div class="scene-body">
      <div class="detail-grid">
        <div class="detail-label">Visual</div>
        <div class="detail-content">Mr. Kabir smiles warmly and types N-A-S-A on a mechanical keyboard with glowing ripples. The giant classroom monitor fills with a dense, text-heavy space archive of raw catalog numbers and tiny thumbnails.</div>
        <div class="detail-label">Audio & SFX</div>
        <div class="detail-content">4 distinct mechanical key-clacks, enter chime, rapid mouse scrolling sounds.</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">MR. KABIR (In-Scene Dialogue, 0:30 – 0:46)</div>
        <div class="dialogue-text">"Great question, Emon! Let's find out together—let me pull up NASA's official mission archive... let's scroll down and see."</div>
      </div>
    </div>
  </div>

  <div class="scene-card">
    <div class="scene-header">
      <span class="scene-title">SCENES 6 & 7: Boring Deep Dive & Students Losing Interest</span>
      <span class="scene-time">0:48 – 1:00</span>
    </div>
    <div class="scene-body">
      <div class="detail-grid">
        <div class="detail-label">Visual</div>
        <div class="detail-content">Close-up of endless scrolling tables. Panning shot across the room: students slumping over desks, one resting head on arms, another doodling.</div>
        <div class="detail-label">On-Screen</div>
        <div class="detail-content">Highlight box over unreadable telemetry: <em>[Table 4.1: MER-B PDS Raw Binary Telemetry Logs — Sol 5111]</em></div>
        <div class="detail-label">Audio & SFX</div>
        <div class="detail-content">Clock ticking softly, exaggerated student yawn, pencil scratch on paper.</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">MR. KABIR (Muttering, 0:48 – 0:52)</div>
        <div class="dialogue-text">"Hmm... so many raw tables... where is the story behind all this?"</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">VO (Narrator, 0:52 – 1:00)</div>
        <div class="dialogue-text">"Decades of planetary exploration have left monumental hardware across the Moon and Mars. Yet, trapped inside dry, complex archives, these triumphs feel like forgotten space junk—draining classroom curiosity before it can start."</div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- BLOCK 3 -->
  <div class="block-header">
    <span class="block-title">Block 3: NASA Data Sources & Ingestion Pipeline</span>
    <span class="block-time">1:00 – 1:30 (30 Seconds)</span>
  </div>

  <div class="scene-card">
    <div class="scene-header">
      <span class="scene-title">SCENES 8, 9 & 10: Emon's Spark & NASA Open Data Architecture</span>
      <span class="scene-time">1:00 – 1:18</span>
    </div>
    <div class="scene-body">
      <div class="detail-grid">
        <div class="detail-label">Visual</div>
        <div class="detail-content">Emon sits upright with a spark in his eye and hands Mr. Kabir a URL note. Mr. Kabir enters the link. A high-tech split-screen schematic reveals NASA’s open-data architecture feeding into the platform.</div>
        <div class="detail-label">On-Screen</div>
        <div class="detail-content">
          🔴 <strong>NASA PDS:</strong> Sols 1–5111 Telemetry & Atmospheric Tau<br>
          🌕 <strong>NASA LRO LOLA:</strong> 16-Bit Lunar Digital Elevation Models (DTM)<br>
          🪐 <strong>NASA MRO HiRISE:</strong> Perseverance Valley Sub-Meter Topographical Grids<br>
          🛰️ <strong>NASA 3D Resources / JPL:</strong> Official CAD Hardware Geometry
        </div>
        <div class="detail-label">Audio & SFX</div>
        <div class="detail-content">Idea chime, rapid keyboard clacks, futuristic UI processing hum.</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">EMON (In-Scene, 1:08 – 1:12)</div>
        <div class="dialogue-text">"Sir, try this! It turns real NASA mission data into a 3D world!"</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">VO (Narrator, 1:12 – 1:18)</div>
        <div class="dialogue-text">"To solve this, we tapped directly into NASA Open Data. We transformed high-resolution digital elevation models from the Lunar Reconnaissance Orbiter and Mars HiRISE..."</div>
      </div>
    </div>
  </div>

  <div class="scene-card">
    <div class="scene-header">
      <span class="scene-title">PIPELINE TRANSITION: Direct Data Pipeline & Scientific Rigor</span>
      <span class="scene-time">1:18 – 1:30</span>
    </div>
    <div class="scene-body">
      <div class="detail-grid">
        <div class="detail-label">Visual</div>
        <div class="detail-content">Animated schematic: Raw NASA GeoTIFF / PDS3 ➔ GDAL Processing ➔ 16-Bit Grayscale Heightmaps ➔ Three.js Procedural Terrain Engine with Beer-Lambert Law physics dynamically calculating sunlight drop.</div>
        <div class="detail-label">On-Screen</div>
        <div class="detail-content"><em>Data Pipeline: NASA PDS ➔ GDAL ➔ Three.js Procedural Engine | Physics: I = I₀ · exp(-τ / cos θ)</em></div>
        <div class="detail-label">Audio & SFX</div>
        <div class="detail-content">Rising musical tension, high-tech sweep effect.</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">VO (Narrator, 1:18 – 1:30)</div>
        <div class="dialogue-text">"...coupling them with NASA's Planetary Data System telemetry and official 3D hardware assets to recreate authentic, scientifically accurate extraterrestrial environments directly in the browser."</div>
      </div>
    </div>
  </div>

  <!-- BLOCK 4 -->
  <div class="block-header">
    <span class="block-title">Block 4: The Solution & Live Interactive Simulation</span>
    <span class="block-time">1:30 – 3:30 (120 Seconds / 2 Minutes)</span>
  </div>

  <div class="scene-card">
    <div class="scene-header">
      <span class="scene-title">SCENES 11 & 12: Platform Reveal & Instant Browser Loading</span>
      <span class="scene-time">1:30 – 1:55</span>
    </div>
    <div class="scene-body">
      <div class="detail-grid">
        <div class="detail-label">Visual</div>
        <div class="detail-content">The classroom monitor explodes with vibrant color: dark space web app with title "RELICS OF THE COSMIC DUST" glowing in gold and cyan. Students gasp in awe. Mr. Kabir clicks [EXPLORE HISTORIC SITES].</div>
        <div class="detail-label">On-Screen</div>
        <div class="detail-content"><em>RELICS OF THE COSMIC DUST — Zero-Install WebGL Platform (Live in Any Browser)</em></div>
        <div class="detail-label">Audio & SFX</div>
        <div class="detail-content">Orchestral swell, particle whoosh, crisp UI click.</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">STUDENTS (1:35 – 1:40)</div>
        <div class="dialogue-text">"Whoa!" / "Look at the graphics!"</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">MR. KABIR (1:40 – 1:44)</div>
        <div class="dialogue-text">"Now THIS looks incredible. Look at that detail!"</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">VO (Narrator, 1:44 – 1:55)</div>
        <div class="dialogue-text">"Meet 'Relics of the Cosmic Dust'—an ultra-lightweight, zero-install WebGL interactive simulation that loads in under three seconds on any classroom device without downloads or setup."</div>
      </div>
    </div>
  </div>

  <div class="scene-card">
    <div class="scene-header">
      <span class="scene-title">SCENES 13 & 14: 3D Lunar Simulator & Driving the Rover</span>
      <span class="scene-time">1:55 – 2:25</span>
    </div>
    <div class="scene-body">
      <div class="detail-grid">
        <div class="detail-label">Visual</div>
        <div class="detail-content">Low-gravity dust drifts across Oceanus Procellarum. In distance, a golden beacon pulses. Split shot: students pressing WASD keys while the 3D rover traverses grey lunar soil kicking up dust puffs.</div>
        <div class="detail-label">On-Screen</div>
        <div class="detail-content"><em>Location: Oceanus Procellarum (2.47°S, 316.66°E) | Elevation: NASA LRO LOLA Altimetry | Live HUD: Coordinates & Incline</em></div>
        <div class="detail-label">Audio & SFX</div>
        <div class="detail-content">Ambient lunar hum, key clicks, electric rover motor whirr, students cheering ("Go, turn left!").</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">MR. KABIR (2:00 – 2:06)</div>
        <div class="dialogue-text">"Look—that beacon marks a real lunar landing site from 1966!"</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">VO (Narrator, 2:06 – 2:25)</div>
        <div class="dialogue-text">"Students step directly into the shoes of Planetary Archaeologists. Navigating authentic lunar topography generated from NASA elevation data, players use intuitive controls to track real telemetry beacons across historical exploration zones."</div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <div class="scene-card">
    <div class="scene-header">
      <span class="scene-title">SCENES 15 & 16: Proximity Arrival, LiDAR Scan & The Living Story</span>
      <span class="scene-time">2:25 – 2:55</span>
    </div>
    <div class="scene-body">
      <div class="detail-grid">
        <div class="detail-label">Visual</div>
        <div class="detail-content">The rover pulls up next to Surveyor 1. A holographic blue LiDAR scanning circle sweeps across the lander. An illustrated story modal unfolds with archival photos and engineering schematics.</div>
        <div class="detail-label">On-Screen</div>
        <div class="detail-content"><em>Target: Surveyor 1 (Landed: June 2, 1966) | Achievement: First U.S. Soft Lunar Touchdown | Proved soil firm for Apollo</em></div>
        <div class="detail-label">Audio & SFX</div>
        <div class="detail-content">Holographic scan sweep, electronic chime, gentle emotional string music.</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">MR. KABIR (2:27 – 2:30)</div>
        <div class="dialogue-text">"Now let's scan its systems and uncover its story."</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">IN-GAME NARRATOR / VO (2:35 – 2:55)</div>
        <div class="dialogue-text">"June 1966. Surveyor 1 softly settled into the lunar dust, proving the ground was firm enough for human boots. It was forgotten for decades—but its solitary landing paved the way for every human step on the Moon."</div>
      </div>
    </div>
  </div>

  <div class="scene-card">
    <div class="scene-header">
      <span class="scene-title">SCENES 17, 18 & 19: Gamified STEM Quiz & Martian Sol 5111 Re-enactment</span>
      <span class="scene-time">2:55 – 3:30</span>
    </div>
    <div class="scene-body">
      <div class="detail-grid">
        <div class="detail-label">Visual</div>
        <div class="detail-content">STEM quiz card appears: "What did Surveyor 1 prove about lunar soil?" Students shout answers. Correct choice clicked ➔ Confetti pop and XP surge. Camera transitions to Mars (Perseverance Valley): sky turns dark red as PDS atmospheric tau hits 10.8, showing Opportunity MER-B's final Sol 5111 storm.</div>
        <div class="detail-label">On-Screen</div>
        <div class="detail-content">
          <em>Achievement Unlocked: Lunar Pioneer (+250 STEM XP)</em><br>
          <em>Mars Ground Truth: Perseverance Valley (-14.57°S, 354.67°E | Sol 5111 Tau=10.8)</em><br>
          <em>PDS Telemetry: Power collapse 900 Wh ➔ 22 Wh/sol (Cutoff: 20.5V)</em>
        </div>
        <div class="detail-label">Audio & SFX</div>
        <div class="detail-content">Quiz chime, confetti pop, classroom cheering, procedural Martian storm wind, upbeat music.</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">STUDENTS (2:58 – 3:02)</div>
        <div class="dialogue-text">"Option B! The soil was firm!"</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">MR. KABIR (3:02 – 3:06)</div>
        <div class="dialogue-text">"Correct! Brilliant teamwork, everyone!"</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">VO (Narrator, 3:06 – 3:30)</div>
        <div class="dialogue-text">"Every relic scanned connects history with gamified STEM learning. Powered by real PDS telemetry, students witness the exact conditions that silenced Opportunity on Sol 5111, test their knowledge with quizzes, and unlock badges on their journey to becoming Master Planetary Archaeologists."</div>
      </div>
    </div>
  </div>

  <!-- BLOCK 5 -->
  <div class="block-header">
    <span class="block-title">Block 5: Educational Impact & Open Science Finale</span>
    <span class="block-time">3:30 – 4:00 (30 Seconds)</span>
  </div>

  <div class="scene-card">
    <div class="scene-header">
      <span class="scene-title">SCENE 20: Classroom Celebration & Global Call-to-Action</span>
      <span class="scene-time">3:30 – 4:00</span>
    </div>
    <div class="scene-body">
      <div class="detail-grid">
        <div class="detail-label">Visual</div>
        <div class="detail-content">Wide shot of classroom giving standing ovation. Mr. Kabir smiles proudly beside the golden "Master Planetary Archaeologist" certificate. Camera tilts out through the window into the sky showing Moon and Mars. Project title card, live URL, and GitHub QR code fade in.</div>
        <div class="detail-label">On-Screen</div>
        <div class="detail-content">
          <strong>RELICS OF THE COSMIC DUST</strong> | Developed by TEAM RELICS<br>
          Live Simulator: [Live-Build-URL] | Open-Source Pipeline: [GitHub-URL]<br>
          NASA International Space Apps Challenge 2026
        </div>
        <div class="detail-label">Audio & SFX</div>
        <div class="detail-content">Triumphant orchestral finale swelling to emotional peak; classroom applause gently fades.</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">MR. KABIR (3:32 – 3:38)</div>
        <div class="dialogue-text">"Look at that—history isn't boring at all, is it? Sometimes you just need the right way to explore it."</div>
      </div>
      <div class="dialogue-box">
        <div class="dialogue-speaker">VO (Narrator / Team Lead Shaikot, 3:38 – 4:00)</div>
        <div class="dialogue-text">"NASA's hardware may sit abandoned across deep space, but their legacy will never be forgotten. By turning cold data into living stories, Team Relics is inspiring the next generation of planetary explorers. Experience the live simulator right now in your browser. Thank you!"</div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 4: MASTER PACING TABLE -->
  <h2><span class="section-tag">04</span> Master Reference & Technical Pacing Table</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 14%;">Time Window</th>
        <th style="width: 18%;">Script Section</th>
        <th style="width: 14%;">Scenes</th>
        <th style="width: 32%;">Primary Visual & NASA Content</th>
        <th style="width: 22%;">Audio State</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>0:00 – 0:30</strong></td>
        <td>Intro & Team</td>
        <td>Scene 1, 2</td>
        <td>Classroom wide shot; Team Relics roster; Emon's question; 2026 Space Apps challenge theme.</td>
        <td>Ambient chatter ➔ Synth pulse ➔ Focused dialogue.</td>
      </tr>
      <tr>
        <td><strong>0:30 – 1:00</strong></td>
        <td>The Problem</td>
        <td>Scene 3 – 7</td>
        <td>NASA archive search; raw PDS tables; students losing interest and slumped over desks.</td>
        <td>Key-clacks ➔ Mouse scroll ➔ Yawn / clock tick ➔ Narrative VO.</td>
      </tr>
      <tr>
        <td><strong>1:00 – 1:30</strong></td>
        <td>Data Pipeline</td>
        <td>Scene 8 – 10</td>
        <td>Emon's note; NASA open data architecture: LOLA, HiRISE, PDS logs, and GDAL to WebGL pipeline.</td>
        <td>Idea chime ➔ Clacks ➔ Rising high-tech synth.</td>
      </tr>
      <tr>
        <td><strong>1:30 – 2:25</strong></td>
        <td>Solution & 3D Drive</td>
        <td>Scene 11 – 14</td>
        <td>Zero-install WebGL load in &lt;3s; driving 3D rover on Moon across Oceanus Procellarum.</td>
        <td>Orchestral swell ➔ UI clicks ➔ Rover motor hum.</td>
      </tr>
      <tr>
        <td><strong>2:25 – 3:30</strong></td>
        <td>Scan & Gamification</td>
        <td>Scene 15 – 19</td>
        <td>Scanning Surveyor 1; story modal; STEM quiz; badge unlock; transition to Mars Sol 5111 storm.</td>
        <td>Holographic sweep ➔ Emotional strings ➔ Confetti & cheering.</td>
      </tr>
      <tr>
        <td><strong>3:30 – 4:00</strong></td>
        <td>Impact & Outro</td>
        <td>Scene 20</td>
        <td>Standing ovation; Master Archaeologist certificate; tilt to sky; Live link & GitHub QR.</td>
        <td>Triumphant orchestral climax ➔ Final closing statement.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 5: CITATIONS -->
  <h2><span class="section-tag">05</span> NASA Scientific Open Data Citations</h2>
  <p>All data and historical records utilized in the project and video are verified open scientific resources:</p>
  <ul>
    <li><strong>NASA Planetary Data System (PDS) Geosciences Node:</strong> MER-B Atmospheric Opacity & Telemetry Logs (<a href="https://pds-geosciences.wustl.edu/missions/mer/">https://pds-geosciences.wustl.edu/missions/mer/</a>)</li>
    <li><strong>NASA Mars Reconnaissance Orbiter (MRO) HiRISE Archive:</strong> Perseverance Valley DTM (<a href="https://www.uahirise.org/">https://www.uahirise.org/</a>)</li>
    <li><strong>NASA Lunar Reconnaissance Orbiter (LRO) LOLA Altimeter:</strong> Lunar Topography Archive (<a href="https://pds.nasa.gov/">https://pds.nasa.gov/</a>)</li>
    <li><strong>NASA 3D Resources & Jet Propulsion Laboratory:</strong> Surveyor 1 & MER-B 3D Structural Assets (<a href="https://nasa3d.arc.nasa.gov/">https://nasa3d.arc.nasa.gov/</a>)</li>
    <li><strong>NASA JPL Mission Status Logs:</strong> Opportunity Sol 1 to Sol 5111 End-of-Mission Report (<a href="https://mars.nasa.gov/mer/">https://mars.nasa.gov/mer/</a>)</li>
  </ul>

  <div class="footer-note">
    <strong>RELICS OF THE COSMIC DUST</strong> — Developed by <strong>TEAM RELICS</strong> for the <strong>NASA International Space Apps Challenge 2026</strong><br>
    <em>"Abandoned across deep space, but their legacy will never be forgotten."</em>
  </div>

</body>
</html>`;

const tempHtmlPath = path.resolve('documentation', 'temp_blueprint_render.html');
const outputPdfPath = path.join(pdfDir, 'NASA_Space_Apps_2026_Relics_of_the_Cosmic_Dust_Master_Video_Script_and_Blueprint.pdf');

fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

// Find browser on macOS or other OS
let browserPath = '';
const candidatePaths = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
  'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe'
];

for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    browserPath = p;
    break;
  }
}

if (!browserPath) {
  console.error('No headless browser found to print PDF.');
  process.exit(1);
}

try {
  console.log(`Rendering PDF using ${browserPath}...`);
  const fileUrl = `file://${tempHtmlPath}`;
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
