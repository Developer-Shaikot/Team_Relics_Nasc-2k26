# 🎬 RELICS OF THE COSMIC DUST
## NASA International Space Apps Challenge 2026 Pitch Video Script & Production Blueprint

* **Challenge:** Abandoned but Not Forgotten: Storytelling About NASA’s Discarded Equipment on the Moon and Mars
* **Theme:** The Next Frontier (2026)
* **Total Runtime:** Exactly 240 Seconds (04:00 Minutes)
* **Team:** TEAM RELICS

---

## 1. Team Members & Production Roles

| Team Member | Production Role | Core Video & Engineering Responsibilities |
| :--- | :--- | :--- |
| **Shaikot Kundu Akash** | **Team Lead** | Overall project coordination, system architecture direction, lead voiceover, repository oversight. |
| **Md. Wahiduzzaman Nayem** | **System Analyst & Video Editor** | Video editing, motion graphics, audio sync, classroom shot pacing, data architecture review. |
| **Arni Debnath** | **Lead Designer** | UI/UX wireframing, dark glassmorphism design system, infographics, certificate rendering. |
| **Tanjir Ahmed Fardin** | **Researcher & Storyteller** | NASA PDS & mission literature review, narrative scriptwriting, educational dialogue design. |
| **Tareq Jamil Sarkar Samrat** | **Frontend & Core Mechanics Developer** | Three.js 3D physics engine, rover kinematics, Sol 5111 atmospheric shaders, STEM quiz mechanics. |

---

## 2. NASA Open Data & Scientific Pipeline Ingestion Matrix

Our platform directly ingests and processes verified NASA open-data repositories to drive real-time WebGL rendering, physics equations, and historical storytelling:

| NASA Data Source / Mission | Scientific Domain | Raw Data Format | Application Implementation in Solution |
| :--- | :--- | :--- | :--- |
| **NASA Planetary Data System (PDS) Geosciences Node** | MER-B Opportunity (Sols 1–5111) | ASCII / PDS3 Tables | Real-time atmospheric optical depth ($\tau = 0.8 \to 10.8$), solar array power collapse ($900\text{ Wh} \to 22\text{ Wh/sol}$), bus voltage (<20.5V cutoff), and Beer-Lambert solar extinction equations ($I = I_0 \cdot e^{-\tau/\cos\theta}$). |
| **NASA MRO HiRISE Archive** | Mars Reconnaissance Orbiter | 16-bit GeoTIFF DTM | Sub-meter 3D terrain elevation for Martian exploration at **Perseverance Valley**, Endeavour Crater ($-14.57^\circ\text{ S}, 354.67^\circ\text{ E}$). |
| **NASA LRO LOLA (Lunar Orbiter Laser Altimeter)** | Lunar Reconnaissance Orbiter | 16-bit PDS IMG / GeoTIFF | Micro-elevation heightmaps of lunar exploration zones including **Oceanus Procellarum** ($2.47^\circ\text{S}, 316.66^\circ\text{E}$). |
| **NASA 3D Resources & JPL Hardware Archives** | Official CAD/Mesh Models | .obj / .gltf Assets | Scientifically accurate 3D models of the **Surveyor 1 Lander** and **MER-B Opportunity Rover** with functional rocker-bogie chassis kinematics. |
| **NASA Historical Mission Archives & Mineral Logs** | APXS, Mössbauer & RAT Logs | Spectral CSV / Logs | Verified geological ground truth: **Hematite Blueberries**, **Jarosite** aqueous minerals, and diamond-grind **RAT (Rock Abrasion Tool)** wear patterns. |

---

## 3. 240-Second Master Video Script & Production Blueprint

### BLOCK 1: INTRODUCTION & TEAM (0:00 – 0:30 | 30 Seconds)

#### SCENE 1 — (0:00 – 0:10) Establishing the Classroom & Team Reveal
* **Visual:** Wide establishing shot of a modern 2026 smart classroom full of students at desks. Morning sunlight streams through large windows; the front wall monitor is asleep. Mr. Kabir stands near his desk smiling at the class. Space and planet posters decorate the walls. At 0:05, a sleek semi-transparent glassmorphic overlay appears featuring the official NASA Space Apps 2026 badge and the Team Relics crest.
* **On-Screen Display (0:05 – 0:10):**
  * **TEAM RELICS**
  * **Shaikot Kundu Akash** — Team Lead
  * **Md. Wahiduzzaman Nayem** — System Analyst & Video Editor
  * **Arni Debnath** — Lead Designer
  * **Tanjir Ahmed Fardin** — Researcher & Storyteller
  * **Tareq Jamil Sarkar Samrat** — Frontend & Core Mechanics Developer
* **Audio & Music:** Ambient classroom chatter and chair shuffling fade as an energetic synthetic pulse builds underneath. Smooth digital UI transition sound.
* **Dialogue / Voice-Over:**
  * **VO (0:05 – 0:12):** *"We are Team Relics—led by Shaikot, with systems and editing by Nayem, UI/UX design by Arni, research and storytelling by Fardin, and interactive mechanics built by Samrat."*

---

#### SCENE 2 — (0:10 – 0:30) The Student's Question & The Next Frontier
* **Visual:**
  * *(0:10 – 0:20)* Medium close-up on Emon, a curious 12-year-old boy in a striped t-shirt sitting in the second row, eagerly raising his hand. Other students turn to look.
  * *(0:20 – 0:30)* Cut to wide shot. Lower-third graphic displays the challenge title.
* **On-Screen Display (0:20 – 0:30):**
  * *NASA Space Apps 2026 | Theme: The Next Frontier*
  * *Challenge: Abandoned but Not Forgotten — Storytelling About NASA’s Discarded Equipment on the Moon and Mars*
* **Audio & Music:** Classroom hush, a single chair creak, followed by ambient synth music continuing low in the mix.
* **Dialogue / Voice-Over:**
  * **EMON (In-Scene Dialogue, 0:10 – 0:18):** *"Sir! NASA sent so many rovers and landers to the Moon and Mars. What happened to them? Did they even complete their missions?"*
  * **VO (0:19 – 0:30):** *"Under the 2026 Space Apps theme, 'The Next Frontier', we set out to answer Emon’s question by tackling the challenge: Abandoned but Not Forgotten: Storytelling About NASA’s Discarded Equipment on the Moon and Mars."*

---

### BLOCK 2: THE PROBLEM (0:30 – 1:00 | 30 Seconds)

#### SCENE 3 — (0:30 – 0:36) Teacher’s Curiosity
* **Visual:** Close-up on Mr. Kabir in round glasses and a checkered blue shirt. He smiles warmly, turns to his desk, and reaches for the laptop keyboard.
* **Audio:** Soft footsteps, subtle classroom murmur.
* **Dialogue / Voice-Over:**
  * **MR. KABIR (In-Scene Dialogue):** *"Great question, Emon! Let's find out together—let me pull up the official archives."*

---

#### SCENE 4 — (0:36 – 0:42) The Keyboard Search
* **Visual:** Macro shot of the mechanical keyboard. Mr. Kabir’s fingers type **N-A-S-A** one letter at a time, each keystroke triggering a subtle glowing ripple on screen. Background monitor blurred.
* **Audio:** Crisp, rhythmic mechanical key-clacks (4 distinct clacks), followed by an enter-key chime.

---

#### SCENE 5 — (0:42 – 0:48) The Data Wall
* **Visual:** Wide shot of the giant classroom wall monitor filling with a dense, text-heavy government space archive webpage: tiny thumbnails, academic paragraphs, and raw catalog numbers. Mr. Kabir points with a hand clicker.
* **Audio:** Rapid mouse-scroll clicking, page-load whoosh.
* **Dialogue / Voice-Over:**
  * **MR. KABIR (In-Scene Dialogue):** *"Alright, here's NASA's official mission archive... let's scroll down and see."*

---

#### SCENE 6 & 7 — (0:48 – 1:00) Boring Deep Dive & Students Losing Interest
* **Visual:**
  * *(0:48 – 0:54)* Close-up of the screen showing endless scrolling tables and dense jargon; Mr. Kabir's faint reflection squints at the glass.
  * *(0:54 – 1:00)* Panning shot across the desks: students slumping over, one resting his head on his arms, a girl checking under her desk, another doodling in a notebook.
* **On-Screen Display:** Highlight box over unreadable raw telemetry: *[Table 4.1: MER-B PDS Raw Binary Telemetry Logs — Sol 5111]*
* **Audio:** Clock ticking softly, exaggerated student yawn, pencil scratch on paper, chair squeaks.
* **Dialogue / Voice-Over:**
  * **MR. KABIR (Muttering, 0:48 – 0:52):** *"Hmm... so many raw tables... where is the story behind all this?"*
  * **VO (Narrator, 0:52 – 1:00):** *"Decades of planetary exploration have left monumental hardware across the Moon and Mars. Yet, trapped inside dry, complex archives, these triumphs feel like forgotten space junk—draining classroom curiosity before it can start."*

---

### BLOCK 3: DATA SOURCES & PIPELINE (1:00 – 1:30 | 30 Seconds)

#### SCENE 8 — (1:00 – 1:08) Emon's Spark
* **Visual:** Close-up on Emon sitting upright while others slump. A spark of realization in his eyes. He quickly taps on his tablet screen.
* **Audio:** Soft magical idea chime, rapid glass screen-tap sounds.
* **Dialogue:**
  * **EMON (Whispering to himself):** *"Wait... I know something way better!"*

---

#### SCENE 9 & 10 — (1:08 – 1:18) The Link & The Open Data Ingestion
* **Visual:** Emon walks up and hands Mr. Kabir a note. Mr. Kabir types the URL quickly into his mechanical keyboard. A dynamic split-screen schematic reveals NASA’s open-data architecture feeding into the platform.
* **On-Screen Display (Data Source Architecture):**
  * 🔴 **NASA PDS Geosciences:** Atmospheric $\tau$, Solar Extinction & 5,111 Sol Logs
  * 🌕 **NASA LRO LOLA:** 16-Bit High-Precision Lunar Digital Elevation Models (DTM)
  * 🪐 **NASA MRO HiRISE:** Perseverance Valley Sub-Meter Topographical Heightmaps
  * 🛰️ **NASA 3D Resources / JPL:** Official CAD Hardware & Payload Geometry
* **Audio:** Fast key-clacks, futuristic UI processing hum.
* **Dialogue / Voice-Over:**
  * **EMON (In-Scene, 1:08 – 1:12):** *"Sir, try this! It turns real NASA mission data into a 3D world!"*
  * **VO (Narrator, 1:12 – 1:18):** *"To solve this, we tapped directly into NASA Open Data. We transformed high-resolution digital elevation models from the Lunar Reconnaissance Orbiter and Mars HiRISE..."*

---

#### PIPELINE TRANSITION — (1:18 – 1:30) Scientific Accuracy Validated
* **Visual:** Animated pipeline schematic:
  $$\text{Raw NASA GeoTIFF / PDS3} \longrightarrow \text{GDAL Raster Pipeline} \longrightarrow \text{16-Bit Grayscale Heightmaps} \longrightarrow \text{Three.js WebGL Shaders}$$
* **On-Screen Display:**
  * *Data Pipeline: NASA PDS $\to$ GDAL $\to$ Three.js Procedural Engine*
  * *Physics Engine: $I = I_0 \cdot \exp(-\tau / \cos\theta)$*
* **Audio:** Rising musical tension sting, high-tech sweep effect.
* **Dialogue / Voice-Over:**
  * **VO (Narrator):** *"...coupling them with NASA's Planetary Data System telemetry and official 3D hardware assets to recreate authentic, scientifically accurate extraterrestrial environments directly in the browser."*

---

### BLOCK 4: THE SOLUTION & LIVE DEMO (1:30 – 3:30 | 120 Seconds / 2 Minutes)

#### SCENE 11 & 12 — (1:30 – 1:55) The Platform Reveal & Instant Deployment
* **Visual:**
  * *(1:30 – 1:45)* The giant wall monitor explodes with vibrant color: a dark space-themed web application with an astronaut on a crater ridge and the title **"RELICS OF THE COSMIC DUST"** glowing in gold and cyan. The classroom gasps in awe; faces are illuminated by the blue screen glow.
  * *(1:45 – 1:55)* Close-up of Mr. Kabir clicking the glowing orange button: **[EXPLORE HISTORIC SITES]**. Cosmic dust particle wipe transition.
* **On-Screen Display:** *RELICS OF THE COSMIC DUST — Zero-Install WebGL Platform (Live in Any Browser)*
* **Audio:** Orchestral swell, sci-fi particle whoosh, satisfying UI click.
* **Dialogue / Voice-Over:**
  * **STUDENTS (In-Scene, 1:35 – 1:40):** *"Whoa!" / "Look at the graphics!"*
  * **MR. KABIR (In-Scene, 1:40 – 1:44):** *"Now THIS looks incredible. Look at that detail!"*
  * **VO (Narrator, 1:44 – 1:55):** *"Meet 'Relics of the Cosmic Dust'—an ultra-lightweight, zero-install WebGL interactive simulation that loads in under three seconds on any classroom device without downloads or setup."*

---

#### SCENE 13 & 14 — (1:55 – 2:25) 3D Lunar Simulator & Driving the Rover
* **Visual:**
  * *(1:55 – 2:10)* The 3D lunar surface simulator loads. Low-gravity dust drifts across Oceanus Procellarum. In the distance, a pulsating golden beacon marks an authentic historical site. Live HUD telemetry appears in the top-right corner.
  * *(2:10 – 2:25)* Split shot: Left shows Mr. Kabir and students pressing the WASD/arrow keys; right shows the 3D archaeological rover driving smoothly across the grey lunar soil toward the beacon, kicking up realistic low-gravity dust puffs with functional suspension.
* **On-Screen Display:**
  * *Location:* Oceanus Procellarum ($2.47^{\circ}\text{S}, 316.66^{\circ}\text{E}$)
  * *Elevation Data:* NASA LRO LOLA 16-Bit Topographic Grid
  * *HUD Telemetry:* Coordinates, Wheel RPM, Surface Incline
* **Audio:** Ambient lunar hum, rhythmic key clicks, electric rover motor whirr, students cheering in the classroom (*"Go, turn left, towards the beacon!"*).
* **Dialogue / Voice-Over:**
  * **MR. KABIR (In-Scene, 2:00 – 2:06):** *"Look—that beacon marks a real lunar landing site from 1966!"*
  * **VO (Narrator, 2:06 – 2:25):** *"Students step directly into the shoes of Planetary Archaeologists. Navigating authentic lunar topography generated from NASA elevation data, players use intuitive controls to track real telemetry beacons across historical exploration zones."*

---

#### SCENE 15 & 16 — (2:25 – 2:55) Proximity Arrival, Scan & The Living Story
* **Visual:**
  * *(2:25 – 2:35)* The rover pulls up next to a vintage spacecraft: NASA’s Surveyor 1 lander. A holographic blue LiDAR scanning circle sweeps across the lander's tripod frame.
  * *(2:35 – 2:55)* A dynamic story modal unfolds with vintage archival photos, illustrated engineering schematics, and animated subtitles fading in line by line. The classroom falls completely silent, captivated, reading along.
* **On-Screen Display:**
  * *Target Identified:* Surveyor 1 (Landed: June 2, 1966)
  * *Mission Achievement:* America's First Soft Lunar Touchdown
  * *Scientific Discovery:* Proved lunar soil could support human Apollo landers
* **Audio:** High-tech holographic scan sweep, soft electronic chime, gentle emotional string music underneath.
* **Dialogue / Voice-Over:**
  * **MR. KABIR (In-Scene, 2:27 – 2:30):** *"Now let's scan its systems and uncover its story."*
  * **IN-GAME NARRATOR / VOICE-OVER (2:35 – 2:55):** *"June 1966. Surveyor 1 softly settled into the lunar dust, proving the ground was firm enough for human boots. It was forgotten for decades—but its solitary landing paved the way for every human step on the Moon."*

---

#### SCENE 17, 18 & 19 — (2:55 – 3:30) Gamified STEM Quiz & The Martian Sol 5111 Transition
* **Visual:**
  * *(2:55 – 3:10)* An interactive STEM quiz card appears: *"What did Surveyor 1 prove about lunar soil?"* Students raise hands and shout answers. Mr. Kabir clicks the correct choice. Confetti explodes across the screen; an XP bar surges forward, and a "Lunar Surveyor Badge" unlocks.
  * *(3:10 – 3:20)* Camera zooms out in-game: dynamic transition to the red dust of Mars at Perseverance Valley (Endeavour Crater). Ingested NASA PDS telemetry dynamically dims the sun as atmospheric opacity ($\tau$) hits **10.8**, recreating Opportunity MER-B's final Sol 5111 dust storm.
  * *(3:20 – 3:30)* Fast-paced montage: students discovering Hematite Blueberries, scanning the Mössbauer Spectrometer and RAT drill, earning badges on the S-Curve Roadmap.
* **On-Screen Display:**
  * *Achievement Unlocked:* Lunar Pioneer (+250 STEM XP)
  * *Mars Ground Truth:* Perseverance Valley ($-14.57^\circ\text{S}, 354.67^\circ\text{E}$ \| Sol 5111 $\tau=10.8$)
  * *PDS Telemetry:* Power drops from $900\text{ Wh} \to 22\text{ Wh/sol}$ (Cutoff: 20.5V)
* **Audio:** Quiz chime, confetti pop, classroom clapping and cheering, ominous rising Martian wind (synthesized via Web Audio API), upbeat adventurous musical transition.
* **Dialogue / Voice-Over:**
  * **STUDENTS (Shouting excitedly, 2:58 – 3:02):** *"Option B! The soil was firm!"*
  * **MR. KABIR (In-Scene, 3:02 – 3:06):** *"Correct! Brilliant teamwork, everyone!"*
  * **VO (Narrator, 3:06 – 3:30):** *"Every relic scanned connects history with gamified STEM learning. Powered by real PDS telemetry, students witness the exact conditions that silenced Opportunity on Sol 5111, test their knowledge with quizzes, and unlock badges on their journey to becoming Master Planetary Archaeologists."*

---

### BLOCK 5: IMPACT & CONCLUSION (3:30 – 4:00 | 30 Seconds)

#### SCENE 20 — (3:30 – 4:00) The Inspiring Finale & Open Science Legacy
* **Visual:**
  * *(3:30 – 3:45)* Wide shot of the entire classroom cheering and giving a standing ovation. Mr. Kabir smiles proudly beside the monitor, which now displays a golden **"Master Planetary Archaeologist"** printable certificate of completion.
  * *(3:45 – 4:00)* The camera smoothly pulls back and tilts up through the smart classroom window, revealing a stylized afternoon sky where both the Moon and Mars are subtly visible. The project title card, GitHub repository link, and live deployment QR code fade in.
* **On-Screen Display (3:45 – 4:00):**
  * **RELICS OF THE COSMIC DUST**
  * *Developed by TEAM RELICS*
  * *Play Instantly in Your Browser: [Live-Build-URL]*
  * *Open-Source Code & Data Pipeline: [GitHub-URL]*
  * *NASA International Space Apps Challenge 2026*
* **Audio:** Full triumphant orchestral finale swelling to a warm, emotional peak; classroom applause gently fades under the music into a soft, resonant final chord.
* **Dialogue / Voice-Over:**
  * **MR. KABIR (In-Scene, 3:32 – 3:38):** *"Look at that—history isn't boring at all, is it? Sometimes you just need the right way to explore it."*
  * **VO (Narrator / Team Lead Shaikot, 3:38 – 4:00):** *"NASA's hardware may sit abandoned across deep space, but their legacy will never be forgotten. By turning cold data into living stories, Team Relics is inspiring the next generation of planetary explorers. Experience the live simulator right now in your browser. Thank you!"*

---

## 4. Master Reference & Technical Pacing Table

| Time Window | Script Section | Storyboard Scene | Primary Focus / Video Content | Audio / Track State |
| :--- | :--- | :--- | :--- | :--- |
| **0:00 – 0:30** | Introduction & Team | Scene 1, Scene 2 | Classroom wide shot; Team Relics roster card; Emon's question; Space Apps 2026 theme. | Ambient chatter $\to$ Energetic synth pulse $\to$ Focused dialogue. |
| **0:30 – 1:00** | The Problem | Scene 3 – Scene 7 | Mr. Kabir searches NASA archive; text-heavy tables; students slumped and yawning. | Key-clacks $\to$ Scrolling sounds $\to$ Yawn/clock tick $\to$ Narrative VO. |
| **1:00 – 1:30** | Data Sources & Pipeline | Scene 8 – Scene 10 | Emon's note; GDAL/Python data pipeline; HiRISE, LOLA, and PDS 3D processing. | Idea chime $\to$ Typing clacks $\to$ Rising high-tech synth swell. |
| **1:30 – 2:25** | The Solution & 3D Drive | Scene 11 – Scene 14 | App reveal; instant WebGL loading; driving the archaeological rover on the Moon. | Orchestral swell $\to$ UI clicks $\to$ Rover motor & low-gravity wind. |
| **2:25 – 3:30** | Scan, Story & Gamification | Scene 15 – Scene 19 | Scanning Surveyor 1; illustrated story popup; STEM quiz; badge unlocks; Mars preview. | Holographic scan sweep $\to$ Emotional strings $\to$ Confetti pop & cheers. |
| **3:30 – 4:00** | Impact & Conclusion | Scene 20 | Classroom celebration; certificate; camera tilts to sky; Live link & GitHub QR. | Triumphant orchestral climax $\to$ Final inspiring closing statement. |

---

## 5. NASA Scientific Open Data Citations

1. **NASA Planetary Data System (PDS) Geosciences Node**: MER-B Atmospheric Opacity & Telemetry Logs ([https://pds-geosciences.wustl.edu/missions/mer/](https://pds-geosciences.wustl.edu/missions/mer/))
2. **NASA Mars Reconnaissance Orbiter (MRO) HiRISE Archive**: Perseverance Valley DTM ([https://www.uahirise.org/](https://www.uahirise.org/))
3. **NASA Lunar Reconnaissance Orbiter (LRO) LOLA Altimeter**: Lunar Topography Archive ([https://pds.nasa.gov/](https://pds.nasa.gov/))
4. **NASA 3D Resources & Jet Propulsion Laboratory**: Surveyor 1 & MER-B 3D Structural Assets ([https://nasa3d.arc.nasa.gov/](https://nasa3d.arc.nasa.gov/))
5. **NASA JPL Mission Status Logs**: Opportunity Sol 1 to Sol 5111 End-of-Mission Report ([https://mars.nasa.gov/mer/](https://mars.nasa.gov/mer/))
