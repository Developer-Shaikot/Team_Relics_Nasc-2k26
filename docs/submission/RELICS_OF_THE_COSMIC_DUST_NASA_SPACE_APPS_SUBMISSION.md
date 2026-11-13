# Relics of the Cosmic Dust

### Abandoned but Not Forgotten — an interactive 3D story about NASA's discarded equipment on the Moon, Mars and in deep space

**2026 NASA International Space Apps Challenge · Team Relics**

| | |
| :-- | :-- |
| **Challenge** | Abandoned but Not Forgotten: Storytelling About NASA's Discarded Equipment on the Moon and Mars |
| **Theme** | The Next Frontier (2026) |
| **Difficulty** | Beginner / Youth (also suitable for Intermediate learners) |
| **Subjects** | Astrophysics · Planets & Moons · Space Exploration |
| **Format** | Interactive web-based 3D educational game (HTML, CSS, JavaScript, WebGL) |
| **Audience** | Built mainly for school students, but open to anyone curious about space, plus teachers and parents |
| **Language** | English, written in simple words for children |
| **Screenshots** | All figures in this document are captured from the current build of the game (November 2026) |

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Project Details — the WHY, the WHAT and the HOW](#2-project-details--the-why-the-what-and-the-how)
   - 2.1 [The WHY — what problem we are solving](#21-the-why--what-problem-we-are-solving)
   - 2.2 [The WHAT — the game in one page](#22-the-what--the-game-in-one-page)
   - 2.3 [A guided tour of the game](#23-a-guided-tour-of-the-game)
   - 2.4 [The hardware we tell stories about](#24-the-hardware-we-tell-stories-about)
   - 2.5 [Science you can feel — the learning mechanics](#25-science-you-can-feel--the-learning-mechanics)
   - 2.6 [Designing for children — "the child stays in control"](#26-designing-for-children--the-child-stays-in-control)
   - 2.7 [The HOW — architecture and implementation](#27-the-how--architecture-and-implementation)
   - 2.8 [Impact, community and future work](#28-impact-community-and-future-work)
   - 2.9 [Playing on a phone — the mobile experience](#29-playing-on-a-phone--the-mobile-experience)
   - 2.10 [Take-home poster for children](#210-take-home-poster-for-children)
   - 2.11 [How we worked — an Agile process](#211-how-we-worked--an-agile-process)
3. [Responses to the Challenge Considerations](#3-responses-to-the-challenge-considerations)
4. [Tools and Technologies](#4-tools-and-technologies)
5. [Use of Artificial Intelligence](#5-use-of-artificial-intelligence)
6. [NASA Data, Resources and Space Agency References](#6-nasa-data-resources-and-space-agency-references)
7. [Team](#7-team)
8. [How to Run the Project](#8-how-to-run-the-project)
9. [References](#9-references)

---

## 1. Project Summary

For more than sixty years NASA has left machines behind: landers and descent stages on the Moon, rovers and stations on Mars, and probes that are still flying away from the Sun. Children usually hear about missions that are active today. The older machines are rarely mentioned, or they are dismissed as "space junk".

**Relics of the Cosmic Dust** turns those machines into the heroes of a playable story. The player is a young *Planetary Archaeologist* working in the year 2085. Their job is to revisit the places where humanity left hardware behind, find each relic, scan it, and uncover **what it was built to do, what it discovered, and why it was left there**.

Instead of reading a list of facts, the child:

- **watches a one-minute tour** of the real game before they start;
- **drives a rover** across the Moon and Mars toward a glowing beacon;
- **chooses when to scan** a relic and reads its story in plain language;
- **tilts and inspects Voyager 1** in deep space, 24.3 billion km from Earth;
- **runs four interactive science labs** (rocket staging, X-ray spectroscopy, seismology, deep-space telemetry);
- **earns Cosmic Dust, Gems, XP, badges and a Master Certificate**.

The message the game is built to leave behind is one sentence:

> "When we leave something behind on the Moon or Mars, it is not 'space junk' — it is a permanent monument to human curiosity."

![Figure 1 — Game Hub: three gateways (Moon, Mars, Voyager 1) over a live 3D solar-system orrery](./images/07_game_hub.jpg)

_Figure 1 — The Mission Control Hub. Three large gateways lead to The Moon, Planet Mars and Voyager 1. The background is a live, draggable 3D orrery._

---

## 2. Project Details — the WHY, the WHAT and the HOW

### 2.1 The WHY — what problem we are solving

The challenge asks for a story that "introduces school-age space enthusiasts to the hardware and the science it made possible". We identified four obstacles that stop children from engaging with this history:

| Obstacle | What children experience today | How the game answers it |
| :-- | :-- | :-- |
| **Dense sources** | Mission archives are long technical pages and tables. | Every fact is delivered through an action: drive, scan, tilt, balance, align. |
| **Active missions get all the attention** | Retired hardware is invisible or called "junk". | Retired hardware is the *protagonist*; the player is the archaeologist who rediscovers it. |
| **Passive formats** | Videos and slides are watched, then forgotten. | A one-minute tour shows what is possible, then the child controls the camera, the rover and every discovery moment. |
| **Reading and device barriers** | Most space content is long, full of expert words and needs a strong computer. | Short, simple English with a one-sentence takeaway per discovery; runs in a normal browser with no install. |

Our central idea, **Planetary Archaeology 2085**, reframes the debate. In 2085 the landing sites are heritage monuments. The player is not cleaning up litter — they are *reading history from the objects themselves*.

### 2.2 The WHAT — the game in one page

| Layer | What it is |
| :-- | :-- |
| **Story frame** | A cadet of the *Junior Deep Space Network (JDSN)* in 2085, guided by two mission commanders: **Asha** (Dhaka, Bangladesh) and **Leo** (Cape Canaveral, Florida). |
| **Three worlds** | **The Moon** (Tranquility Base), **Mars** (Perseverance Valley) and **Deep Space** (Voyager 1). |
| **Companions** | Three selectable robot buddies: Astro-Bot "Echo", Cyber-Kitty "Nova", Rover-Drone "Orion". |
| **Onboarding** | A five-step briefing: Welcome (name and age), The Story, a one-minute game tour video, Meet the Bots, and Levels. |
| **In-game help** | Short tips that point at the real buttons the first time a child visits each screen, with a 💡 button to see them again. |
| **Progression** | A 6-level roadmap per world with XP, Cosmic Dust, Gems, badges, a quiz and a Master Certificate. |
| **Science labs** | Four hands-on JPL-style workbenches. |
| **Profiles** | Multiple cadets can share one device; each keeps independent progress. |

### 2.3 A guided tour of the game

The two figures below show the whole journey in 27 numbered screenshots from the current build. Figure 2 covers the menus, hub and progress screens; Figure 3 covers the 3D WebGL worlds and science labs. The steps that follow refer to the tile numbers.

![Figure 2 — Getting started: onboarding, hub and progress](./images/22_tour_getting_started.jpg)

_Figure 2 — Getting started (tiles 1–12): the Start Game screen and five-step onboarding (1–6), the Mission Control Hub with its first-visit tip, hover effect, menu drawer and cadet profiles (7–10), and the roadmap and quiz (11–12)._

![Figure 3 — Inside the 3D worlds: WebGL missions and science labs](./images/23_tour_3d_worlds.jpg)

_Figure 3 — Inside the 3D worlds (tiles 13–27): the drive → scan → discover loop on the Moon (13–17) and on Mars (18–22), then Voyager 1 in deep space and the four hands-on science labs (23–27)._

#### Step 1 — Start screen and onboarding (tiles 1–6)

A new visitor always starts on the **Start Game** screen: "Blast off on a real NASA space adventure!" (1). A five-step expedition briefing follows:

- **Welcome** (2): a robot guide says hello. The child types a name (or presses **Surprise me**) and taps their age, grouped into **Junior Explorer (6–10)** and **Space Cadet (11–16)**; the age is saved to the cadet's profile.
- **The story** (3): robotic pioneers were left behind, and the player's mission is to find them.
- **Tour video** (4): a one-minute tour recorded from the real game, with English captions and chapter buttons (Game Hub, Drive on Mars, Scan a Relic, The Moon, Deep Space, Science Labs, Quiz & Badges).
- **Meet the bots** (5): choose a companion, each with a different strength (+50% LiDAR range, +40% speed and coin magnet, or +35% storm stability).
- **Levels** (6): a preview of the levels to unlock, each of which can be started directly.

Closing the briefing (✕ or Esc) always returns the child to the Game Hub.

#### Step 2 — The Mission Control Hub (tiles 7–10)

The hub is designed to be understood by a child in seconds: **three big destination cards**, a one-line commander switcher, three large buttons (**Play Game**, **Level**, **Menu**) and a bottom bar of quick tabs (**Home, Story, Science Labs, 3D Space, Drive Rover, Levels, Demo Reel, Space Quiz**).

- **First-visit tips** (7): the rest of the screen dims, one real button is highlighted and the robot guide explains it. The highlighted button still works, each tip can be skipped, **Don't show tips again** turns them off everywhere, and the 💡 **Tips** button brings them back.
- **Hover effect** (8): pointing at "Planet Mars" flies the 3D background to Mars, so the child sees where they are about to go.
- **Menu drawer** (9): call sign, commander, companion, and quick links to the Prologue, Moon, Mars, Calendar, Archive, Labs, Quiz, Badges, Roadmap and more.
- **Cadet Registry** (10): several children can share a device; each profile keeps its own Dust, Gems, XP, mission progress and tip settings, and **Log Out** returns to a fresh Start screen.

#### Step 3 — Explore the Moon (tiles 13–17)

Pressing **Enter Base** places the child directly in a lunar rover at the start of Moon Mission 1, "First Soft Landing" (13). A glowing beacon marks the first relic, Surveyor 1; the top bar shows the mission and the distance, the radar map tracks the target, and the companion bot gives a one-sentence hint. **Back to Hub** and the 💡 button sit together in the top-left corner on every game screen.

The child drives with **W / A / S / D** or the arrow keys, or the on-screen arrow pad on touch devices (14). Within about 4.5 m of the relic the game *offers* a scan, and nothing happens until the child presses **E** or taps **Scan** (15). The relic log then explains what the machine is, what it discovered and why it matters, in plain language (16). XP and Cosmic Dust are awarded and the beacon moves on to Mission 2, the Apollo 11 "Eagle" descent stage (17).

#### Step 4 — Explore Mars (tiles 18–22)

On Mars the rover starts 10 m from the **Opportunity (MER-B)** rover in Perseverance Valley (18). The same drive → scan → discover loop applies (19–20), now with the real story of a rover built for 90 days that worked for more than fourteen years. Relics linked to a science lab offer **Open JPL Science Workbench** in their log; **Close Log** returns to driving (21). The first time a child enters a world, tips explain the driving keys, the goal tracker, the radar map (22), scanning with E, Back to Hub and the 💡 button; tips for buttons that are not on screen are skipped automatically.

#### Step 5 — Roadmap and levels (tile 11)

Each world has a six-level, winding roadmap (11). Completed levels glow, the next level is highlighted, and the final stop is the Master Certificate. The Mars route runs Eagle Crater Base → Find Oppy → Blueberries of Life (APXS) → Diamond RAT Grinder → InSight Heart of Mars → The Sol 5111 Storm → Voyager 1 Golden Record → Master Certificate; a second tab shows the Moon roadmap.

#### Step 6 — Deep Space with Voyager 1 (tile 23)

In deep space there is no ground, so the game becomes an inspection scene (23). The child rotates Voyager 1 with **W / A / S / D** and inspects its parts (high-gain dish, RTG power source, Golden Record) while the HUD reminds them that a radio message takes **22 hours 34 minutes** to arrive from 24.3 billion km away. The Science Lab opens only when the child chooses it (press **E** or click).

#### Step 7 — Four hands-on science labs (tiles 24–27)

Each lab turns one real piece of science into a small puzzle, with a commander giving context:

| Tile | Lab | The puzzle |
| :-- | :-- | :-- |
| 24 | **Apollo 11 Δv Rocket Lab** | Why did the astronauts leave the heavy descent stage on the Moon? |
| 25 | **Oppy APXS Spectrum Lab** | Align X-ray peaks to identify the iron in the "blueberries" that proved Mars once had liquid water. |
| 26 | **InSight Marsquake Lab** | Match P-waves and S-waves to listen to the heart of Mars. |
| 27 | **Voyager 1 & Golden Record** | Balance a decaying plutonium power budget, then transmit a handshake across the 22-hour light delay. |

#### Step 8 — Quiz and certificate (tile 12)

After exploring, the child can test their knowledge in the Space Cadet Quiz and compare ranks on the leaderboard (12). Finishing every mission on a world unlocks the printable Master Certificate.

### 2.4 The hardware we tell stories about

Every relic in the game is real NASA hardware. Each one is paired with one clear idea a child can carry away.

#### The Moon

| Level | Relic | Year | The story in one sentence |
| :-- | :-- | :-- | :-- |
| 1 | **Surveyor 1** | 1966 | The first U.S. soft landing on the Moon proved the surface was firm, not a sea of dust that would swallow a spacecraft. |
| 2 | **Apollo 11 Lunar Module "Eagle"** | 1969 | The golden descent stage was left behind on purpose to save fuel for the trip home — the rocket equation in action. |
| 3 | **Surveyor 3** | 1969 | Apollo 12 astronauts walked to it and brought parts back: the first off-world archaeology. |
| 4 | **Lunar Roving Vehicle** | 1971 | A battery-powered buggy that drove in one-sixth gravity. |
| 5 | **LCROSS** | 2009 | A mission that confirmed water ice in a permanently shadowed lunar crater. |
| 6 | **Artemis era** | 2026 | The return to the Moon, built on the lessons of the relics above. |

#### Mars

| Level | Relic | Year | The story in one sentence |
| :-- | :-- | :-- | :-- |
| 1 | **Opportunity (MER-B)** | 2004–2018 | Built for 90 sols, it worked for 5,111 — about 57 times longer than planned. |
| 2 | **Hematite "blueberries"** (APXS) | 2004 | Tiny iron-rich spheres showing that liquid water once soaked this ground. |
| 3 | **Rock Abrasion Tool (RAT)** | 2004+ | A diamond grinder that cleaned dust from rock to reveal what lay beneath. |
| 4 | **InSight lander** | 2018–2022 | Its seismometer recorded 1,319 marsquakes and revealed Mars's core. |
| 5 | **Sol 5111 dust storm** | 2018 | A planet-wide storm blocked the sunlight and silenced Opportunity: *"My battery is low and it's getting dark."* |
| 6 | **Voyager 1 & the Golden Record** | 1977– | A gold-plated disc of Earth's sounds, music and greetings in 55 languages, now in interstellar space. |

#### Deep space

| Relic | Story |
| :-- | :-- |
| **Voyager 1** | Launched in 1977, now more than 24 billion km away and still sending data using a plutonium power source that weakens every year. |

### 2.5 Science you can feel — the learning mechanics

The game never asks a child to memorise an equation. It lets them feel the idea first, and names it second.

| Idea | Where the child meets it | What they actually do |
| :-- | :-- | :-- |
| **Rocket staging and Δv** | Apollo 11 lab | Decide what to drop to reach orbit with limited fuel. |
| **Spectroscopy** | Opportunity APXS lab | Line up X-ray peaks to identify iron in a rock. |
| **Seismology** | InSight lab | Match P-wave and S-wave arrival times to find a quake's distance. |
| **Power budgets** | Voyager lab | Switch off instruments so the power draw drops below what the RTG can supply. |
| **Light-travel time** | Voyager HUD and lab | See why a message to a probe 24.3 billion km away takes 22 h 34 min. |
| **Dust and sunlight** | Mars Sol 5111 level | See how atmospheric dust reduces solar-panel power. |
| **Low gravity** | Moon and Mars HUD | Watch the G-force read-out change between the Moon (0.16 g) and Mars (0.38 g). |

### 2.6 Designing for children — "the child stays in control"

During testing we found that children dislike being interrupted, but also get lost without help. We therefore made a deliberate rule:

> The game never takes an action *for* the child. It only offers a choice — and help is offered once, then gets out of the way.

| Moment | What we removed or changed | What the child controls now |
| :-- | :-- | :-- |
| First screen | Small, all-caps text and tiny controls. | Rounded, readable fonts, big age bubbles and buttons of at least 44 px, and a robot guide that says hello. |
| Closing the briefing | ✕ dropped the child into the 3D game. | ✕ or Esc returns to the Game Hub. |
| Start of a world | An automatic roadmap pop-up and an automatic radio dialogue. | The rover is simply ready to drive. |
| Reaching a relic | An automatic history pop-up that froze the rover. | A *scan prompt* appears; the child chooses when to scan. |
| After a scan | An automatic rocket animation and automatic next-level spawn. | The relic log stays until the child closes it or opens the science lab; then the next beacon lights up. |
| First visit to a screen | A long tour overlay. | Short tips that point at the real buttons, shown once per screen per cadet; **Skip**, Esc or **Don't show tips again**; the 💡 button replays them. |
| Deep space | An automatic science-lab pop-up. | Pressing E or clicking opens the lab when wanted. |
| Every screen | Dead ends. | A visible **Back to Hub** button on every game screen. |
| Reload | Losing your place. | Progress and the active cadet are restored; logging out returns to a clean Start screen. |

### 2.7 The HOW — architecture and implementation

```
┌──────────────────────── Browser (no install) ────────────────────────┐
│  index.html  ->  assembled at build time from src/partials/**        │
│  src/styles/    (hub, HUD, modals, wizard, tips, mobile landscape)   │
│                                                                      │
│  src/main.js  (game director)                                        │
│   ├─ renderer/        Three.js scenes: Mars, Moon, deep-space actors │
│   ├─ systems/                                                        │
│   │   ├─ roverControls.js      rocker-bogie rover, W/A/S/D, slope    │
│   │   ├─ scanner.js            raycast + manual scan, relic data     │
│   │   ├─ quests.js             missions, XP, badges, certificate     │
│   │   ├─ minigames.js          the four science labs                 │
│   │   ├─ profileManager.js     multi-cadet profiles in localStorage  │
│   │   ├─ coachmarks.js         first-visit tips for every screen     │
│   │   ├─ hero3DOrrery.js       hub 3D solar-system background        │
│   │   ├─ audio.js              Web Audio synthesised sound           │
│   │   └─ kittyCompanionManager.js  companion bots and guidance       │
│   └─ data/            relic, mission and telemetry data              │
│  public/videos/       game tour video and poster                     │
└──────────────────────────────────────────────────────────────────────┘
```

| Concern | Implementation |
| :-- | :-- |
| **3D rendering** | Three.js (WebGL) with procedurally generated terrain modelled on the character of lunar and Martian surfaces; custom lighting, fog and atmosphere per world. |
| **Rover physics** | Six-wheel rocker-bogie style rover that follows terrain height, tilts on slopes and reports speed, heading, G-force and altitude. |
| **Guidance** | A cyan beacon pillar, a distance read-out, a radar map and a companion-bot hint — four independent cues so a child is never lost. |
| **Discovery loop** | Proximity check → scan prompt → child scans → relic log → rewards → next beacon. |
| **First-visit tips** | `coachmarks.js` detects which screen is showing, waits until nothing else is open, then spotlights one real button at a time with an arrow bubble. Steps for hidden buttons are skipped; "seen" and "tips off" are stored per cadet profile. |
| **Onboarding** | Five-step wizard with kid-friendly cards (name with "Surprise me", colour-coded age groups) and a captioned tour video with chapters, scrubbing and full-screen. |
| **Progress and profiles** | Each cadet's name, age, bot, Dust, Gems, XP and completed missions are stored in `localStorage` under their own profile; logout clears the active session without deleting profiles. |
| **Audio** | Procedural Web Audio (UI clicks, scanner beeps, thruster puffs, transmission tones) — no audio downloads required. |
| **Plain-language content** | Short, child-friendly English across the wizard, tips, video captions, HUD, missions and labs. |
| **Hub background** | A live, draggable Three.js orrery of the Moon, Mars and Voyager 1 that flies to the world a child points at. |
| **Build and performance** | Vite; a small build plugin assembles `index.html` from HTML partials; single-page; runs at interactive frame rates in a normal laptop browser. |

### 2.8 Impact, community and future work

**Who benefits**

- **School students, and anyone curious about space,** meet real NASA history through play instead of text.
- **Teachers and parents** get a classroom-ready, no-install tool with built-in quiz and certificate.
- **Learners with ordinary computers or phones** can play in any browser with nothing to install.
- **Siblings and classmates** can share one device with separate profiles.

**A global perspective.** The two mission commanders — **Asha** at a rooftop antenna ground station in Dhaka and **Leo** at a flight-telemetry console near Cape Canaveral — show that space exploration belongs to children everywhere.

**Roadmap**

| Next step | Why |
| :-- | :-- |
| More relics: Viking, Pathfinder/Sojourner, Curiosity, Perseverance/Ingenuity | Broader story across more decades. |
| Chinese, Indian and European relics | Wider international view of discarded hardware. |
| Age-adaptive hints and difficulty based on the age chosen in onboarding | A better fit for both 6-year-olds and 16-year-olds. |
| Teacher dashboard (class progress export) | Classroom adoption. |
| More languages, starting with Bengali | Reach more learners in their own language. |
| Narrated audio mode and a narrated tour video | Further accessibility for early readers. |

### 2.9 Playing on a phone — the mobile experience

Many children in our audience will first meet the game on a parent's phone rather than a laptop, so the phone is a first-class platform, not an afterthought. The same web build runs on phones and tablets with no install. An Android app built with Capacitor wraps that same build.

![Figure 4 — The mobile experience in seven steps](./images/19_mobile_experience.jpg)

_Figure 4 — The mobile experience in seven steps, captured from the real game on a phone in landscape (844 × 390): (1) a "turn your device sideways" card in portrait, (2) Start Game, (3) the Game Hub with a first-visit tip, (4) driving with the on-screen arrow pad and SCAN button, (5) reaching a relic, (6) the relic log and badge, and (7) Voyager 1, where the action button becomes LAB._

| Mobile feature | How it works |
| :-- | :-- |
| **Landscape play** | Touch devices are detected automatically. In portrait a rotate card asks the child to turn the phone; in fullscreen the screen is locked to landscape on Android. |
| **Touch controls** | An on-screen arrow pad and a large SCAN / LAB button send the same W/A/S/D/E inputs as the keyboard, so every mission works without a keyboard. |
| **Short-screen layouts** | The hub, HUD, pop-ups, relic logs and science labs are re-laid out for a phone's short screen, with touch targets of at least 44 px. |
| **Tips for touch** | First-visit tips mention the arrow pad on phones, so a child is never told to "press W" with no keyboard. |
| **Performance** | A lighter rendering mode is switched on automatically on phones to keep the 3D scenes smooth. |
| **Android app** | The same build is packaged as an Android APK/AAB with Capacitor, always fullscreen. |

### 2.10 Take-home poster for children

To bring the game to children who never see the submission page, we designed an A4 poster to print and hand out at schools, clubs and science events. Its QR code opens **[nasa-2k26.vercel.app](https://nasa-2k26.vercel.app)** directly, so a short visit can turn into an adventure at home. The print-ready file is [`poster/Relics_Kids_Poster_A4.pdf`](./poster/Relics_Kids_Poster_A4.pdf).

![Figure 5 — The A4 take-home poster](./images/21_kids_poster.jpg)

_Figure 5 — The A4 take-home poster: the three worlds, six things to do, and a large QR code with three simple steps for a child and a grown-up. The white background keeps it cheap to print on any school printer._

### 2.11 How we worked — an Agile process

We built the project in **five short sprints between 27 September and 12 November 2026**. Each sprint started from a prioritised backlog of user stories (for example, *"As a 7-year-old I can drive the rover without a keyboard"*) and ended with a playable build that we reviewed together. What we learned in each review, especially from watching children play, went straight into the next sprint's plan.

![Figure 6 — Our Agile process: sprint loop, branch flow and the five sprints](./images/20_agile_process.jpg)

_Figure 6 — Our Agile process. Each sprint went through Plan → Build → Test on QA → Review. Work moved from feature branches to a shared **QA** branch for integration and play-testing, and only then to **main** (auto-deployed to Vercel) and **android-app** (the Android build)._

| Sprint | Dates (2026) | Sprint goal | Main outcomes |
| :-- | :-- | :-- | :-- |
| **1** | 27 Sep – 3 Oct | Mars MVP | Rover controls, scanner, HUD, the Opportunity story, CI/CD to Vercel |
| **2** | 4 – 28 Oct | Research and data | NASA PDS and mission sources, pitch and story script, lunar relic data |
| **3** | 29 Oct – 4 Nov | Three worlds | The Moon and Voyager 1, four science labs, 3D orrery, companion bots, onboarding wizard |
| **4** | 5 – 9 Nov | Kid-friendly UX | First-visit tips, game tour video and story film, submission documents |
| **5** | 9 – 12 Nov | Mobile and release | Touch arrow pad and landscape mode, mobile-friendly pop-ups, Android app, QA → main release flow |

**Our working agreements**

- **Definition of done:** a feature works on desktop and on a phone, and always offers a way back to the Game Hub.
- **Nothing reaches children untested:** every change is merged into QA and play-tested there before it is promoted to main.
- **Continuous delivery:** every merge to main is live on the public site within minutes, so reviewers and children always see the latest build.
- **Small, visible increments:** the commit history mirrors the sprints, from the first Mars prototype to the mobile release.

---

## 3. Responses to the Challenge Considerations

### What age group is your story designed for?

**Built mainly for school students, but there is no age limit: anyone curious about space can play.** The language is simple, each discovery has a one-sentence takeaway, and the controls are the familiar W/A/S/D. Younger players can enjoy the driving, rewards, companion bots and first-visit tips; older students can go deeper in the science labs and the harder quiz tiers (Junior, Intermediate, Senior, Expert). Each cadet's age is recorded in their profile during onboarding. Teachers, parents and adult space fans are welcome too.

### How accessible is the format you chose to use?

| Barrier | Our answer |
| :-- | :-- |
| Software installation | None — it runs in a web browser. |
| Powerful hardware | Procedural graphics keep downloads small and run on ordinary laptops. |
| Language | Simple English with short sentences, including tips and video captions. |
| Reading level | Short sentences, rounded readable fonts and large tap targets (at least 44 px). |
| Input device | Keyboard (W/A/S/D, E) and on-screen touch controls; tips and the video player work with the keyboard. |
| Hearing | Every spoken or audio cue also appears as on-screen text; the tour video has captions. |
| Motion sensitivity | The onboarding animations, tips and tour-video autoplay respect the "reduce motion" setting. |
| Getting lost | Beacon, distance read-out, radar map and bot hint; first-visit tips; a **Back to Hub** button on every screen. |
| Shared devices | Multi-cadet profiles with a clean logout. |

### Do you want to focus on specific missions and pieces of equipment, or tell a broader story about NASA's exploration?

**Both.** Each level focuses on one specific machine — Surveyor 1, the Apollo 11 descent stage, Opportunity, InSight, Voyager 1 — and teaches its purpose and discovery in detail. The roadmaps then connect those machines into one arc: *each robot made the next mission possible*.

### What perspective(s) do you want to highlight?

1. **The machines' perspective** — they are explorers with stories, not litter.
2. **The future archaeologist** — in 2085 these sites are heritage monuments.
3. **A global youth perspective** — commanders in Dhaka and Florida, built by a student team from Bangladesh.
4. **The scientist's perspective** — every discovery is tied to a real measurement or physical idea.

---

## 4. Tools and Technologies

| Area | Tools |
| :-- | :-- |
| Languages | JavaScript (ES modules), HTML5, CSS3 |
| 3D and graphics | Three.js, WebGL, procedural terrain and shaders |
| Audio | Web Audio API (synthesised) |
| Build | Vite (with a small HTML-partials plugin), Node.js |
| Libraries | canvas-confetti (celebrations), marked (document generation), docx (Word export) |
| Design | Dark space interface with kid-friendly rounded type (Lilita One, Fredoka), SVG icons, responsive layout |
| Video | Real gameplay recorded with headless Chrome and encoded with FFmpeg (H.264 MP4) |
| Documentation | Markdown, DOCX and PDF generated from one source by `scripts/docs/build-final-docs.mjs` |
| Testing | Headless Chrome (Puppeteer) driving the real game flow on desktop and phone widths |

---

## 5. Use of Artificial Intelligence

In line with the Space Apps guidance, we state clearly how AI was used:

- **Coding assistance.** An AI coding assistant helped us write, review and debug parts of the code — for example the profile/logout flow, the hub redesign, the removal of automatic pop-ups, the first-visit tips, the kid-friendly onboarding cards, and the scripts that capture screenshots and record the tour video.
- **Writing support.** AI helped us draft and polish documentation.
- **Human responsibility.** The concept (Planetary Archaeology 2085), the story, the choice of relics and facts, the game design, and all final decisions were made by the team. We reviewed and tested every AI-assisted change by running the game.
- **No AI-generated gameplay content at runtime.** The game contains no live generative AI; everything a child sees is authored and fixed. The tour video is a recording of the real game, not generated footage.

---

## 6. NASA Data, Resources and Space Agency References

| Source | How it informed the project |
| :-- | :-- |
| **NASA Planetary Data System (PDS)** — MER-B Opportunity | Mission timeline (landing 2004, Sol 5111 in 2018), dust-storm opacity and power figures used in the Mars story and levels. |
| **NASA Mars Reconnaissance Orbiter / HiRISE** | Reference for the character of Perseverance Valley terrain used to shape the procedural Mars surface. |
| **NASA Lunar Reconnaissance Orbiter / LOLA** | Reference for lunar terrain character used to shape the procedural Moon surface. |
| **NASA mission archives** — Surveyor 1 and 3, Apollo 11 and 12, LRV, LCROSS | Historical facts, dates and relic descriptions. |
| **NASA/JPL** — InSight and Voyager | Seismology facts (marsquake count) and Voyager facts (distance, 22 h 34 min light time, RTG decay, Golden Record). |
| **NASA Eyes on the Solar System** | Inspiration for the hub's interactive 3D solar-system view. |
| **NASA 3D Resources and JPL hardware references** | Reference for the shapes and proportions of the hardware models. |

Links to every source are listed in [Section 9 — References](#9-references). Detailed data notes are kept in `docs/project/NASA_DATA_SOURCES.md`.

> Terrain and hardware in the game are procedural and illustrative, informed by these sources rather than copied from them. Facts, dates and figures are drawn from NASA public sources.

---

## 7. Team

![Team Relics — Shaikot Kundu Akash, Md. Wahiduzzaman Nayem, Arni Rani Nath, Tareq Jamil Sarkar Samrat and Tanjir Ahmed Fardin](./images/00_team_relics.jpg)

_Team Relics — NASA International Space Apps Challenge 2026._

| Member | Role | Responsibilities |
| :-- | :-- | :-- |
| **Shaikot Kundu Akash** | Team Lead | Overall project coordination, system architecture, lead presenter voice-over, repository oversight |
| **Md. Wahiduzzaman Nayem** | System Analyst | Video editing, motion graphics, audio sync, classroom shot pacing, data architecture review |
| **Arni Rani Nath** | Designer | UI/UX design, wireframing, infographics, dark glassmorphism design system, certificate rendering |
| **Tareq Jamil Sarkar Samrat** | Developer | Three.js 3D physics engine, rover kinematics, Sol 5111 atmospheric shaders, STEM quiz mechanics |
| **Tanjir Ahmed Fardin** | Researcher | NASA PDS and mission literature review, narrative script writing, educational dialogue design |

---

## 8. How to Run the Project

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (http://localhost:3000)
npm run dev

# 3. Build for production
npm run build
```

**Controls**

| Action | Keyboard | Touch |
| :-- | :-- | :-- |
| Drive rover | W / A / S / D or arrow keys | On-screen steering buttons |
| Scan a relic | E | Scan button |
| Rotate Voyager 1 | W / A / S / D | Drag |
| Show tips again | 💡 button | 💡 button |
| Skip tips | Esc or **Skip** | **Skip** |
| Back to hub | **Back to Hub** button | **Back to Hub** button |
| Leave full-screen | Esc or F | Exit button |

---

## 9. References

Every NASA data set, archive and mission record used in the game, with its link. Section 6 explains how each one informed the project.

### NASA data archives

**[1]** **NASA Planetary Data System (PDS)** — the main archive for NASA planetary mission data: [https://pds.nasa.gov/](https://pds.nasa.gov/)

**[2]** **PDS Geosciences Node — Mars Exploration Rover (MER) archive**: Opportunity's mission timeline, atmospheric dust opacity (τ) and power data: [https://pds-geosciences.wustl.edu/missions/mer/](https://pds-geosciences.wustl.edu/missions/mer/)

**[3]** **MER Analyst's Notebook (PDS Geosciences Node)**: Opportunity's sol-by-sol activity and science observations: [https://an.rsl.wustl.edu/mer/](https://an.rsl.wustl.edu/mer/)

**[4]** **PDS Imaging Node**: rover and orbiter images: [https://pds-imaging.jpl.nasa.gov/](https://pds-imaging.jpl.nasa.gov/)

**[5]** **Mars Reconnaissance Orbiter — HiRISE**: Mars surface images used as the reference for the Perseverance Valley terrain: [https://www.uahirise.org/](https://www.uahirise.org/)

**[6]** **HiRISE Digital Terrain Models (DTMs)**: [https://www.uahirise.org/dtm/](https://www.uahirise.org/dtm/)

**[7]** **Mars Reconnaissance Orbiter mission**: [https://science.nasa.gov/mission/mars-reconnaissance-orbiter/](https://science.nasa.gov/mission/mars-reconnaissance-orbiter/)

**[8]** **Lunar Reconnaissance Orbiter — LOLA altimeter data (PDS Geosciences Node)**: lunar elevation used as the reference for the Moon terrain: [https://pds-geosciences.wustl.edu/missions/lro/lola.htm](https://pds-geosciences.wustl.edu/missions/lro/lola.htm)

**[9]** **Lunar Reconnaissance Orbiter mission**: [https://science.nasa.gov/mission/lro/](https://science.nasa.gov/mission/lro/)

### Mission records for the relics in the game

**The Moon**

**[10]** **Surveyor 1 (1966)**: [https://science.nasa.gov/mission/surveyor-1/](https://science.nasa.gov/mission/surveyor-1/) · NSSDCA record: [https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-045A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-045A)

**[11]** **Surveyor 3 (1967)**: [https://science.nasa.gov/mission/surveyor-3/](https://science.nasa.gov/mission/surveyor-3/) · NSSDCA record: [https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A)

**[12]** **Apollo 11 (1969)**: [https://www.nasa.gov/mission/apollo-11/](https://www.nasa.gov/mission/apollo-11/) · Lunar Module "Eagle" NSSDCA record: [https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C)

**[13]** **Apollo 12 (1969)**, the visit to Surveyor 3: [https://www.nasa.gov/mission/apollo-12/](https://www.nasa.gov/mission/apollo-12/)

**[14]** **Apollo 15 (1971)**, the first Lunar Roving Vehicle: [https://www.nasa.gov/mission/apollo-15/](https://www.nasa.gov/mission/apollo-15/)

**[15]** **LCROSS (2009)**: [https://science.nasa.gov/mission/lcross/](https://science.nasa.gov/mission/lcross/) · NSSDCA record: [https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2009-031B](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2009-031B)

**Mars**

**[16]** **Opportunity (MER-B, 2004–2018)**: [https://science.nasa.gov/mission/mer-opportunity/](https://science.nasa.gov/mission/mer-opportunity/) · NSSDCA record: [https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A)

**[17]** **Mars Exploration Rovers Spirit and Opportunity**: [https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/](https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/)

**[18]** **InSight lander (2018–2022)**: [https://science.nasa.gov/mission/insight/](https://science.nasa.gov/mission/insight/)

**Deep space**

**[19]** **Voyager 1**: [https://science.nasa.gov/mission/voyager/](https://science.nasa.gov/mission/voyager/) · JPL mission status: [https://voyager.jpl.nasa.gov/](https://voyager.jpl.nasa.gov/)

**[20]** **The Voyager Golden Record**: [https://science.nasa.gov/mission/voyager/voyager-golden-record-overview/](https://science.nasa.gov/mission/voyager/voyager-golden-record-overview/)

### NASA tools and 3D resources

**[21]** **NASA's Eyes on the Solar System**: [https://eyes.nasa.gov/](https://eyes.nasa.gov/)

**[22]** **NASA 3D Resources**: [https://science.nasa.gov/3d-resources/](https://science.nasa.gov/3d-resources/)

### The challenge

**[23]** **NASA Space Apps Challenge 2026 — Abandoned but Not Forgotten**: [https://www.spaceappschallenge.org/2026/challenges/abandoned-but-not-forgotten-storytelling-about-nasas-discarded-equipment-on-the-moon-and-mars/](https://www.spaceappschallenge.org/2026/challenges/abandoned-but-not-forgotten-storytelling-about-nasas-discarded-equipment-on-the-moon-and-mars/)

---

*Team Relics · 2026 NASA International Space Apps Challenge*
