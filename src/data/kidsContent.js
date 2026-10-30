// Comprehensive Kids & Youth Content: Missions, Multi-Level Quizzes, Badges, Companion Dialogues, and Calendar Milestones

export const KIDS_MISSIONS_MARS = [
  {
    id: "mission_locate",
    planet: "mars",
    level: 1,
    tier: "junior",
    stationYear: "2085",
    icon: "🤖",
    shortTitle_en: "Find Oppy 2085",
    shortTitle_bn: "রোভার সন্ধান ২০৮৫",
    title_en: "Mission 1: The First Step on Mars",
    title_bn: "মিশন ১: মঙ্গলের মাটিতে প্রথম অনুসন্ধান",
    desc_en: "Locate Opportunity (MER-B) resting at Perseverance Valley and activate your 2085 LiDAR Scanner.",
    desc_bn: "পারসিভেরেন্স ভ্যালিতে থেমে থাকা অপরচুনিটি রোভারটিকে খুঁজে বের করো এবং তোমার ২০৮৫ লিডার স্ক্যানার চালু করো।",
    badge: "🚀",
    badgeName_en: "Mars Explorer Badge",
    badgeName_bn: "মার্স এক্সপ্লোরার ব্যাজ",
    hint_en: "Click on any part of Opportunity rover to initiate your first diagnostic scan.",
    hint_bn: "রোভারের যেকোনো অংশে ক্লিক করে প্রথম ডায়াগনস্টিক স্ক্যান শুরু করো।",
    rewardXP: 100,
    discoveryImg: "./thumb_archaeology.jpg",
    discoveryFact_en: "Opportunity explored Mars for 5,111 sols (over 14 years), driving 45.16 km!",
    discoveryFact_bn: "অপরচুনিটি টানা ৫,১১১ সল কাজ করে ৪৫.১৬ কিলোমিটার পথ পাড়ি দেওয়ার ইতিহাস গড়েছে!"
  },
  {
    id: "mission_blueberries",
    planet: "mars",
    level: 2,
    tier: "intermediate",
    stationYear: "2018",
    icon: "🫐",
    shortTitle_en: "Blueberries of Life (APXS)",
    shortTitle_bn: "Blueberries of Life (APXS)",
    title_en: "Mission 2: Opportunity — The Blueberries of Life (APXS)",
    title_bn: "Mission 2: Opportunity — The Blueberries of Life (APXS)",
    desc_en: "Use Opportunity's Alpha Particle X-Ray Spectrometer (APXS) to match the red and blue spectral lines of Hematite (α-Fe2O3) and prove liquid rivers once flowed on Mars!",
    desc_bn: "Use Opportunity's Alpha Particle X-Ray Spectrometer (APXS) to match the red and blue spectral lines of Hematite (α-Fe2O3) and prove liquid rivers once flowed on Mars!",
    badge: "🫐",
    badgeName_en: "APXS Spectroscopy Badge",
    badgeName_bn: "APXS Spectroscopy Badge",
    hint_en: "Scan the Hematite Blueberries or launch the APXS Spectroscopy Mini-Game Workbench!",
    hint_bn: "Scan the Hematite Blueberries or launch the APXS Spectroscopy Mini-Game Workbench!",
    rewardXP: 200,
    discoveryImg: "./thumb_archaeology.jpg",
    discoveryFact_en: "'My solar panels are covered in darkness, but I left proof for you—rivers once flowed on Mars!' — Opportunity (MER-B)",
    discoveryFact_bn: "'My solar panels are covered in darkness, but I left proof for you—rivers once flowed on Mars!' — Opportunity (MER-B)"
  },
  {
    id: "mission_rat",
    planet: "mars",
    level: 3,
    tier: "intermediate",
    stationYear: "2082",
    icon: "💎",
    shortTitle_en: "Diamond RAT Grinder",
    shortTitle_bn: "Diamond RAT Grinder",
    title_en: "Mission 3: Drilling Alien Rock",
    title_bn: "Mission 3: Drilling Alien Rock",
    desc_en: "Inspect the circular grind hole created by Opportunity's diamond Rock Abrasion Tool (RAT).",
    desc_bn: "Inspect the circular grind hole created by Opportunity's diamond Rock Abrasion Tool (RAT).",
    badge: "💎",
    badgeName_en: "Master Geologist Badge",
    badgeName_bn: "Master Geologist Badge",
    hint_en: "Find the rock with the silver-grey circle grind mark on the left side of the rover.",
    hint_bn: "Find the rock with the silver-grey circle grind mark on the left side of the rover.",
    rewardXP: 200,
    discoveryImg: "./thumb_archaeology.jpg",
    discoveryFact_en: "RAT was the first diamond-tipped mechanical grinder operated on another planet.",
    facts_bn: "RAT was the first diamond-tipped mechanical grinder operated on another planet."
  },
  {
    id: "mission_mossbauer",
    planet: "mars",
    level: 4,
    tier: "senior",
    stationYear: "2022",
    icon: "🫀",
    shortTitle_en: "InSight Heart of Mars",
    shortTitle_bn: "InSight Heart of Mars",
    title_en: "Mission 4: InSight Lander — Listening to the Heart of Mars",
    title_bn: "Mission 4: InSight Lander — Listening to the Heart of Mars",
    desc_en: "Listen to a real meteoroid impact Marsquake through headphones and align the P-Wave (Primary) and S-Wave (Secondary) arrivals on InSight's SEIS seismogram!",
    desc_bn: "Listen to a real meteoroid impact Marsquake through headphones and align the P-Wave (Primary) and S-Wave (Secondary) arrivals on InSight's SEIS seismogram!",
    badge: "🫀",
    badgeName_en: "Planetary Seismologist Badge",
    badgeName_bn: "Planetary Seismologist Badge",
    hint_en: "Scan the InSight Lander SEIS Dome or open the Planetary Seismology Mini-Game!",
    hint_bn: "Scan the InSight Lander SEIS Dome or open the Planetary Seismology Mini-Game!",
    rewardXP: 250,
    discoveryImg: "./thumb_storm.jpg",
    discoveryFact_en: "InSight recorded 1,319 marsquakes with its golden SEIS dome, proving Mars has a molten liquid iron-alloy core!",
    discoveryFact_bn: "InSight recorded 1,319 marsquakes with its golden SEIS dome, proving Mars has a molten liquid iron-alloy core!"
  },
  {
    id: "mission_storm",
    planet: "mars",
    level: 5,
    tier: "senior",
    stationYear: "Sol 5111",
    icon: "🌪️",
    shortTitle_en: "The Sol 5111 Storm",
    shortTitle_bn: "The Sol 5111 Storm",
    title_en: "Mission 5: The Fateful Sol 5111 Storm",
    title_bn: "মিশন ৫: বিধ্বংসী সল ৫১১১ ধূলিঝড়",
    desc_en: "Drive to the Sol 5111 High Rim Atmospheric Weather Station and inspect the fatal global dust storm record where Tau reached 10.8.",
    desc_bn: "সল ৫১১১ হাই রিম আবহাওয়া স্টেশনে যাও এবং বায়ুমণ্ডলীয় ডাস্ট স্টর্ম রেকর্ড স্ক্যান করে দেখে নাও কীভাবে অপটিক্যাল টাউ ১০.৮-এ পৌঁছায়।",
    badge: "🌪️",
    badgeName_en: "Storm Chaser Badge",
    badgeName_bn: "ঝড় বিশেষজ্ঞ ব্যাজ",
    hint_en: "Drive toward the glowing beacon and weather station tower on the high rim overlook.",
    hint_bn: "সামনের হাই রিম ওভারলুকে অবস্থিত আলোকময় বিকন ও ওয়েদার স্টেশন টাওয়ারের দিকে ড্রাইভ করো।",
    rewardXP: 300,
    discoveryImg: "./thumb_storm.jpg",
    discoveryFact_en: "At Tau 10.8, 99.998% of sunlight was blocked, dropping power from 900 Wh to only 22 Wh.",
    discoveryFact_bn: "At Tau 10.8, 99.998% of sunlight was blocked, dropping power from 900 Wh to only 22 Wh."
  },
  {
    id: "mission_blackbox",
    planet: "mars",
    level: 6,
    tier: "expert",
    stationYear: "24.3B km",
    icon: "📀",
    shortTitle_en: "Voyager 1 Golden Record",
    shortTitle_bn: "Voyager 1 Golden Record",
    title_en: "Mission 6: Voyager 1 — The Dying Candle & The Golden Record",
    title_bn: "Mission 6: Voyager 1 — The Dying Candle & The Golden Record",
    desc_en: "Balance Voyager 1's decaying Plutonium-238 RTG battery (-4W/yr), wait through the 22-hour light-travel time delay across 24.3 billion km, and unlock the 55-language Golden Record!",
    desc_bn: "Balance Voyager 1's decaying Plutonium-238 RTG battery (-4W/yr), wait through the 22-hour light-travel time delay across 24.3 billion km, and unlock the 55-language Golden Record!",
    badge: "📀",
    badgeName_en: "Interstellar Golden Record Master",
    badgeName_bn: "Interstellar Golden Record Master",
    hint_en: "Switch to Deep Space (Voyager 1) or click the Memory Core to launch the RTG & Golden Record Mini-Game!",
    hint_bn: "Switch to Deep Space (Voyager 1) or click the Memory Core to launch the RTG & Golden Record Mini-Game!",
    rewardXP: 500,
    discoveryImg: "./hero_astronaut_mars.jpg",
    discoveryFact_en: "Voyager 1 carries greetings in 55 languages—including Bengali ('Namaskar! Vishwe shanti hok')—and melodies into eternity!",
    discoveryFact_bn: "Voyager 1 carries greetings in 55 languages—including Bengali ('Namaskar! Vishwe shanti hok')—and melodies into eternity!"
  }
];

export const KIDS_MISSIONS_MOON = [
  {
    id: "moon_quest_pioneer",
    planet: "moon",
    level: 1,
    tier: "junior",
    stationYear: "1966",
    icon: "🛬",
    shortTitle_en: "Surveyor 1 Soft Landing",
    shortTitle_bn: "সার্ভেয়ার ১ সফট ল্যান্ডিং",
    title_en: "Moon Mission 1: First Soft Landing",
    title_bn: "চন্দ্র মিশন ১: প্রথম মার্কিন সফট ল্যান্ডিং",
    desc_en: "Locate Surveyor 1 in Oceanus Procellarum and verify that the lunar regolith is firm enough for human landings.",
    desc_bn: "ওশেনাস প্রোসেলোরামে সার্ভেয়ার ১ ল্যান্ডার খুঁজে বের করো এবং চাঁদের মাটি নভোচারীদের জন্য উপযুক্ত কিনা পরীক্ষা করো।",
    badge: "🌕",
    badgeName_en: "Lunar Scout Badge",
    badgeName_bn: "লুনার স্কাউট ব্যাজ",
    hint_en: "Click on the historic Surveyor tripod lander model.",
    hint_bn: "ঐতিহাসিক সার্ভেয়ার ট্রাইপড ল্যান্ডারে ক্লিক করো।",
    rewardXP: 100,
    discoveryImg: "./thumb_archaeology.jpg",
    discoveryFact_en: "Surveyor 1 proved the Moon's surface would not swallow a heavy spacecraft!",
    discoveryFact_bn: "সার্ভেয়ার ১ প্রমাণ করে চাঁদের মাটি শক্ত এবং মানুষের অবতরণের জন্য নিরাপদ।"
  },
  {
    id: "moon_quest_apollo11",
    planet: "moon",
    level: 2,
    tier: "junior",
    stationYear: "1969",
    icon: "👨‍🚀",
    shortTitle_en: "Apollo 11: The Staging Sacrifice",
    shortTitle_bn: "Apollo 11: The Staging Sacrifice",
    title_en: "Moon Mission 2: Apollo 11 — The Staging Sacrifice (Delta-V Puzzle)",
    title_bn: "Moon Mission 2: Apollo 11 — The Staging Sacrifice (Delta-V Puzzle)",
    desc_en: "Balance Tsiolkovsky's Rocket Equation (Delta-V ≥ 1,870 m/s) at Tranquility Base to discover why the golden Eagle Descent Stage sacrificed itself so Neil and Buzz could return home!",
    desc_bn: "Balance Tsiolkovsky's Rocket Equation (Delta-V ≥ 1,870 m/s) at Tranquility Base to discover why the golden Eagle Descent Stage sacrificed itself so Neil and Buzz could return home!",
    badge: "👨‍🚀",
    badgeName_en: "Delta-V Rocketry Hero Badge",
    badgeName_bn: "Delta-V Rocketry Hero Badge",
    hint_en: "Scan the golden Apollo 11 Lunar Module or open the Delta-V Rocket Equation Mini-Game!",
    hint_bn: "Scan the golden Apollo 11 Lunar Module or open the Delta-V Rocket Equation Mini-Game!",
    rewardXP: 200,
    discoveryImg: "./hero_astronaut_mars.jpg",
    discoveryFact_en: "By leaving the 2,150 kg golden Descent Stage behind as a launchpad, Eagle's Ascent Stage achieved the 1,870 m/s Delta-V needed to reach lunar orbit!",
    discoveryFact_bn: "By leaving the 2,150 kg golden Descent Stage behind as a launchpad, Eagle's Ascent Stage achieved the 1,870 m/s Delta-V needed to reach lunar orbit!"
  },
  {
    id: "moon_quest_surveyor3_retrieval",
    planet: "moon",
    level: 3,
    tier: "intermediate",
    stationYear: "1969",
    icon: "🏗️",
    shortTitle_en: "Surveyor 3 Relic Retrieval",
    shortTitle_bn: "সার্ভেয়ার ৩ যন্ত্রাংশ উদ্ধার",
    title_en: "Moon Mission 3: The First Off-World Archaeology",
    title_bn: "চন্দ্র মিশন ৩: মহাকাশের প্রথম প্রত্নতাত্ত্বিক পুনরুদ্ধার",
    desc_en: "Re-enact Apollo 12 landing 180m from Surveyor 3 to retrieve its robotic camera and scoop to study space weathering.",
    desc_bn: "অ্যাপোলো ১২-এর মতো সার্ভেয়ার ৩ ল্যান্ডারের কাছে গিয়ে এর ক্যামেরা ও স্কুপ খুলে মহাকাশের প্রভাব পরীক্ষা করো।",
    badge: "🏗️",
    badgeName_en: "Lunar Archaeologist Badge",
    badgeName_bn: "লুনার আর্কিওলজিস্ট ব্যাজ",
    hint_en: "Find the Surveyor 3 probe sitting inside the lunar crater.",
    hint_bn: "ক্রেটারের ঢালে থাকা সার্ভেয়ার ৩ প্রোবে ক্লিক করো।",
    rewardXP: 200,
    discoveryImg: "./thumb_archaeology.jpg",
    discoveryFact_en: "Apollo 12 astronauts Pete Conrad and Alan Bean cut off the TV camera and brought it back to Earth!",
    discoveryFact_bn: "মানুষের হাতে অন্য কোনো গ্রহের মহাকাশযানের যন্ত্রাংশ পৃথিবীতে ফিরিয়ে আনার একমাত্র ঘটনা।"
  },
  {
    id: "moon_quest_lrv_buggy",
    planet: "moon",
    level: 4,
    tier: "intermediate",
    stationYear: "1971",
    icon: "🚙",
    shortTitle_en: "Drive Apollo Lunar Rover",
    shortTitle_bn: "লুনার রোভার ড্রাইভ",
    title_en: "Moon Mission 4: The 1/6th Gravity Buggy Run",
    title_bn: "চন্দ্র মিশন ৪: চাঁদের বুকে বৈদ্যুতিক গাড়ির দৌড়",
    desc_en: "Drive the Boeing/GM Lunar Roving Vehicle (LRV) across craters at 1/6th Earth gravity, reaching 13 km/h.",
    desc_bn: "চাঁদের ১/৬ মহাকর্ষে অ্যাপোলো ১৫-এর বৈদ্যুতিক মুন-বাগি চালিয়ে পাহাড়ি ক্রেটারে নমুনা সংগ্রহ করো।",
    badge: "🚙",
    badgeName_en: "Lunar Charioteer Badge",
    badgeName_bn: "লুনার চ্যারিয়টিয়ার ব্যাজ",
    hint_en: "Switch to 'Drive Rover' on the Moon environment and drive the LRV.",
    hint_bn: "মুন পরিবেশে রোভার ড্রাইভ মোডে গাড়ি চালাও।",
    rewardXP: 250,
    discoveryImg: "./thumb_roadmap.jpg",
    discoveryFact_en: "The Lunar Rover had wire-mesh titanium chevron tires and drove up to 27.8 km on Apollo 15!",
    discoveryFact_bn: "লুনার রোভারের চাকা স্প্রিং ও টাইটানিয়াম তারের জালি দিয়ে তৈরি ছিল।"
  },
  {
    id: "moon_quest_lcross_ice",
    planet: "moon",
    level: 5,
    tier: "senior",
    stationYear: "2009",
    icon: "🧊",
    shortTitle_en: "LCROSS Water Ice Hunter",
    shortTitle_bn: "এলক্রস মেরু বরফ সন্ধান",
    title_en: "Moon Mission 5: Finding Lunar Water Ice",
    title_bn: "চন্দ্র মিশন ৫: দক্ষিণ মেরুতে পানির বরফ নিশ্চিতকরণ",
    desc_en: "Analyze the sensor plume data from the LCROSS kinetic impact in Cabeus crater to confirm pure water ice in permanent shadows.",
    desc_bn: "ক্যাবেউস ক্রেটারে আছড়ে পড়া এলক্রস রকেটের ধূলিমেঘ বিশ্লেষণ করে চির-অন্ধকার ক্রেটারে পানির বরফ নিশ্চিত করো।",
    badge: "💧",
    badgeName_en: "Polar Ice Master Badge",
    badgeName_bn: "পোলার আইস মাস্টার ব্যাজ",
    hint_en: "Scan the ice-laden polar crater deposits near the South Pole.",
    hint_bn: "দক্ষিণ মেরুর বরফসমৃদ্ধ ক্রেটারে ক্লিক করো।",
    rewardXP: 300,
    discoveryImg: "./thumb_storm.jpg",
    discoveryFact_en: "LCROSS proved millions of metric tons of water ice exist in lunar cold traps!",
    discoveryFact_bn: "এলক্রস নিশ্চিত করেছে চাঁদের মেরুতে কোটি কোটি টন বিশুদ্ধ পানির বরফ সংরক্ষিত রয়েছে।"
  },
  {
    id: "moon_quest_artemis_base",
    planet: "moon",
    level: 6,
    tier: "expert",
    stationYear: "2026",
    icon: "🏕️",
    shortTitle_en: "Artemis Gateway & Base Camp",
    shortTitle_bn: "আর্টেমিস বেসক্যাম্প ও গেটওয়ে",
    title_en: "Moon Mission 6: The Artemis Era",
    title_bn: "চন্দ্র মিশন ৬: আর্টেমিস যুগে মানব প্রত্যাবর্তন",
    desc_en: "Connect with the 2026 Artemis II crewed flyby and establish the foundation for the permanent Lunar South Pole Base Camp.",
    desc_bn: "২০২৬ সালের আর্টেমিস ২ মানুষবাহী মিশন এবং দক্ষিণ মেরুর স্থায়ী আর্টেমিস ক্যাম্পের যোগাযোগ ব্যবস্থা সক্রিয় করো।",
    badge: "👑",
    badgeName_en: "Artemis Moon Master",
    badgeName_bn: "মাস্টার আর্টেমিস কমান্ডার",
    hint_en: "Activate the Artemis South Pole Beacon to unlock the Grand Master Certificate.",
    hint_bn: "আর্টেমিস সাউথ পোল বিকন সক্রিয় করে মাস্টার সার্টিফিকেট অর্জন করো।",
    rewardXP: 500,
    discoveryImg: "./hero_astronaut_mars.jpg",
    discoveryFact_en: "Artemis is building humanity's first permanent base camp on the Moon as a stepping stone to Mars!",
    discoveryFact_bn: "আর্টেমিস প্রোগ্রাম চাঁদে মানুষের স্থায়ী ক্যাম্প বানাচ্ছে, যা পরবর্তীতে মঙ্গলে যাওয়ার ভিত্তি হবে!"
  }
];

export const KIDS_MISSIONS = KIDS_MISSIONS_MARS; // Default export for compatibility

export const CADET_QUIZ_LEVELS = {
  junior: [
    {
      id: "q_j1",
      level: "junior",
      question_en: "Who were the first humans to land on the Moon in July 1969?",
      question_bn: "১৯৬৯ সালের জুলাই মাসে প্রথম কোন মানুষ চাঁদে পা রেখেছিলেন?",
      options_en: ["Neil Armstrong & Buzz Aldrin", "Yuri Gagarin & Alan Shepard", "Michael Collins & John Glenn", "Carl Sagan & Pete Conrad"],
      options_bn: ["নীল আর্মস্ট্রং ও বাজ অলড্রিন", "ইউরি গ্যাগারিন ও অ্যালান শেফার্ড", "মাইকেল কলিন্স ও জন গ্লেন", "কার্ল সাগান ও পিট কনরাড"],
      correct: 0,
      explanation_en: "Correct! Neil Armstrong and Buzz Aldrin landed the Apollo 11 Lunar Module Eagle on July 20, 1969.",
      explanation_bn: "সঠিক! ১৯৬৯ সালের ২০ জুলাই নীল আর্মস্ট্রং ও বাজ অলড্রিন চাঁদের শান্ত সাগরে অবতরণ করেন।"
    },
    {
      id: "q_j2",
      level: "junior",
      question_en: "Why is Mars famously called 'The Red Planet'?",
      question_bn: "মঙ্গল গ্রহকে কেন 'লাল গ্রহ' বলা হয়?",
      options_en: ["Its soil is full of iron oxide (rust)", "It is extremely hot like fire", "It is covered in red flowers", "It reflects red sunlight from Jupiter"],
      options_bn: ["এর মাটিতে প্রচুর আয়রন অক্সাইড (মরিচা) রয়েছে", "এটি আগুনের মতো প্রচণ্ড উত্তপ্ত", "এটি লাল ফুলে আবৃত", "বৃহস্পতির আলো প্রতিফলিত করে"],
      correct: 0,
      explanation_en: "Correct! Mars is red because the fine dust on its surface is rich in iron oxide (rust)!",
      explanation_bn: "সঠিক! মঙ্গলের মাটির ধূলিকণায় প্রচুর আয়রন অক্সাইড বা মরিচা রয়েছে।"
    },
    {
      id: "q_j3",
      level: "junior",
      question_en: "How many Martian days (sols) did Opportunity explore Mars before Sol 5111?",
      question_bn: "সল ৫১১১-এর আগে অপরচুনিটি রোভার মঙ্গলে মোট কত সল কাজ করেছিল?",
      options_en: ["90 sols", "500 sols", "5,111 sols", "10,000 sols"],
      options_bn: ["৯০ সল", "৫০০ সল", "৫,১১১ সল", "১০,০০০ সল"],
      correct: 2,
      explanation_en: "Correct! Opportunity was designed for only 90 sols but lasted 5,111 sols (over 14 Earth years)!",
      explanation_bn: "সঠিক! ৯০ সলের জন্য নির্মিত হলেও রোভারটি টানা ৫,১১১ সল ধরে কাজ করেছিল।"
    },
    {
      id: "q_j4",
      level: "junior",
      question_en: "What vehicle did Apollo 15 astronauts drive on the Moon for the first time?",
      question_bn: "অ্যাপোলো ১৫ মিশনে নভোচারীরা প্রথম কোন বাহনটি চাঁদের বুকে ড্রাইভ করেছিলেন?",
      options_en: ["Lunar Roving Vehicle (LRV Buggy)", "Mars Rover Sojourner", "Solar Helicopter", "Hovercraft"],
      options_bn: ["লুনার রোভিং ভেহিকেল (মুন-বাগি)", "মার্স রোভার সোজার্নার", "সোলার হেলিকপ্টার", "হোভারক্রাফট"],
      correct: 0,
      explanation_en: "Correct! The electric Lunar Roving Vehicle allowed astronauts to travel 27.8 km across the Moon.",
      explanation_bn: "সঠিক! বৈদ্যুতিক মুন-বাগি দিয়ে নভোচারীরা চাঁদে ২৭.৮ কিলোমিটার এলাকা ঘুরে দেখেন।"
    }
  ],
  intermediate: [
    {
      id: "q_i1",
      level: "intermediate",
      question_en: "What did Apollo 12 astronauts do at the Surveyor 3 robotic landing site?",
      question_bn: "অ্যাপোলো ১২ নভোচারীরা চাঁদে থাকা সার্ভেয়ার ৩ রোবটের কী করেছিলেন?",
      options_en: ["Landed 180m away and retrieved its TV camera & scoop", "Repaired its solar engine to fly again", "Destroyed it with a laser", "Pushed it inside a volcano"],
      options_bn: ["১৮০ মিটার দূরে নেমে এর ক্যামেরা ও স্কুপ খুলে পৃথিবীতে আনেন", "ইঞ্জিন মেরামত করে আবার আকাশে উড়ান", "লেজার দিয়ে ধ্বংস করেন", "আগ্নেয়গিরিতে ফেলে দেন"],
      correct: 0,
      explanation_en: "Correct! It remains the only time humans have retrieved parts of an uncrewed robotic probe from another world!",
      explanation_bn: "সঠিক! এটি মহাকাশের একমাত্র ঘটনা যেখানে মানুষ অন্য গ্রহে থাকা কোনো রোবটের পার্টস খুলে পৃথিবীতে এনে পরীক্ষা করেছে।"
    },
    {
      id: "q_i2",
      level: "intermediate",
      question_en: "What did the discovery of 'Martian Blueberries' (Hematite) prove about ancient Mars?",
      question_bn: "হেমাটাইট 'ব্লুবেরি' আবিষ্কারের মাধ্যমে প্রাচীন মঙ্গল সম্পর্কে কী প্রমাণিত হয়?",
      options_en: ["Liquid groundwater once existed on Mars", "Alien trees used to grow there", "Mars has a breathable oxygen atmosphere", "Mars was hollow inside"],
      options_bn: ["মঙ্গলে একসময় তরল ভূগর্ভস্থ পানি বিদ্যমান ছিল", "সেখানে ভিনগ্রহের গাছপালা জন্মাত", "মঙ্গলে শ্বাসযোগ্য অক্সিজেন ছিল", "মঙ্গল ভেতর থেকে ফাঁপা"],
      correct: 0,
      explanation_en: "Correct! Hematite spherules can only crystallize inside persistent liquid water.",
      explanation_bn: "সঠিক! হেমাটাইট খনিজ একমাত্র তরল ভূগর্ভস্থ পানির উপস্থিতিতেই গঠিত হতে পারে।"
    },
    {
      id: "q_i3",
      level: "intermediate",
      question_en: "What was the name of the first wheeled robotic rover on Mars in 1997?",
      question_bn: "১৯৯৭ সালে মঙ্গলে অবতরণকারী প্রথম চাকাযুক্ত রোভারটির নাম কী ছিল?",
      options_en: ["Sojourner (Pathfinder mission)", "Curiosity", "Perseverance", "Opportunity"],
      options_bn: ["সোজার্নার (পাথফাইন্ডার মিশন)", "কিউরিওসিটি", "পারসিভেরেন্স", "অপরচুনিটি"],
      correct: 0,
      explanation_en: "Correct! The microwave-oven sized Sojourner rover operated for 83 sols in Ares Vallis.",
      explanation_bn: "সঠিক! সোজার্নার ছিল মঙ্গলে মানুষের পাঠানো প্রথম চাকাযুক্ত রোভার।"
    },
    {
      id: "q_i4",
      level: "intermediate",
      question_en: "Which CubeSat is currently testing the Near-Rectilinear Halo Orbit (NRHO) for the Artemis Gateway station?",
      question_bn: "ভবিষ্যতের গেটওয়ে স্পেস স্টেশনের NRHO কক্ষপথ পরীক্ষা করছে কোন কিউবস্যাটটি?",
      options_en: ["CAPSTONE", "LADEE", "GRAIL", "Clementine"],
      options_bn: ["ক্যাপস্টোন (CAPSTONE)", "লাডি (LADEE)", "গ্রেইল (GRAIL)", "ক্লেমেন্টাইন"],
      correct: 0,
      explanation_en: "Correct! CAPSTONE has been successfully orbiting the Moon validating Gateway's special halo orbit.",
      explanation_bn: "সঠিক! ক্যাপস্টোন কিউবস্যাট লুনার গেটওয়ে স্টেশনের বিশেষ কক্ষপথ যাচাই করছে।"
    }
  ],
  senior: [
    {
      id: "q_s1",
      level: "senior",
      question_en: "According to the Beer-Lambert law, what happens to solar power when atmospheric dust Tau reaches 10.8?",
      question_bn: "বিয়ার-ল্যাম্বার্ট সূত্র অনুযায়ী ধূলিঝড়ে অপটিক্যাল টাউ ১০.৮ হলে সোলার পাওয়ারে কী ঘটে?",
      options_en: ["Over 99.99% of sunlight is extinguished, collapsing power to ~22 Wh", "Solar generation doubles due to dust reflection", "Batteries instantly explode", "Radio communications speed up"],
      options_bn: ["৯৯.৯৯%-এর বেশি আলো বন্ধ হয়ে শক্তি ২২ Wh-এ নেমে যায়", "ধূলিকণার আলোতে সোলার শক্তি দ্বিগুণ হয়", "ব্যাটারি সাথে সাথে বিস্ফোরিত হয়", "রেডিও সংকেতের গতি বেড়ে যায়"],
      correct: 0,
      explanation_en: "Correct! Optical extinction I = I₀ · e^(-Tau) blocks almost all photons, causing critical power loss.",
      explanation_bn: "সঠিক! সূচকীয় হারে আলো কমে যাওয়ায় অপরচুনিটির সোলার উৎপাদন ২২ Wh-এ নেমে এসেছিল।"
    },
    {
      id: "q_s2",
      level: "senior",
      question_en: "How did NASA's 2009 LCROSS mission definitively confirm water ice on the Moon?",
      question_bn: "২০০৯ সালে নাসার এলক্রস (LCROSS) মিশন কীভাবে চাঁদে পানির বরফ নিশ্চিত করেছিল?",
      options_en: ["Smashed a Centaur rocket into Cabeus crater and spectrally analyzed the dust plume", "Drilled 5 miles down with a laser", "Melted the south pole with nuclear heaters", "Found an open frozen lake in sunshine"],
      options_bn: ["ক্যাবেউস ক্রেটারে রকেট আছড়ে ফেলে ধূলিমেঘে স্পেকট্রোমিটার চালায়", "লেজার দিয়ে ৫ মাইল গভীর ড্রিল করে", "পরমাণু হিটার দিয়ে মেরু গলিয়ে ফেলে", "সূর্যালোকের নিচে উন্মুক্ত বরফের হ্রদ খুঁজে পায়"],
      correct: 0,
      explanation_en: "Correct! The impact plume contained pure hydroxyl and water ice spectral absorption lines.",
      explanation_bn: "সঠিক! রকেট আছড়ে ফেলার পর উড়ন্ত ধূলিকণায় সরাসরি পানির অনুর সন্ধান মেলে।"
    },
    {
      id: "q_s3",
      level: "senior",
      question_en: "What iron sulfate mineral was verified by Opportunity's Mössbauer spectrometer to prove acidic surface water?",
      question_bn: "অপরচুনিটির মসবায়ার স্পেকট্রোমিটার কোন খনিজ শনাক্ত করে প্রাচীন এসিডিক পানির উপস্থিতি প্রমাণ করে?",
      options_en: ["Jarosite", "Olivine", "Pyroxene", "Diamond"],
      options_bn: ["জারোসাইট (Jarosite)", "অলিভাইন", "পাইরক্সিন", "হীরা"],
      correct: 0,
      explanation_en: "Correct! Jarosite requires liquid water and acidic oxidizing conditions to precipitate.",
      explanation_bn: "সঠিক! জারোসাইট খনিজ তরল এসিডিক পানিতেই কেবল তৈরি হতে পারে।"
    },
    {
      id: "q_s4",
      level: "senior",
      question_en: "What major discovery did the InSight lander make about the deep interior of Mars?",
      question_bn: "ইনসাইট (InSight) ল্যান্ডার মঙ্গলের অভ্যন্তরীণ গঠন সম্পর্কে কী যুগান্তকারী আবিষ্কার করে?",
      options_en: ["Recorded 1,300+ marsquakes and proved Mars has a large, molten liquid core", "Found underground alien cities", "Proved Mars is completely solid stone without a core", "Discovered oceans of crude oil"],
      options_bn: ["১৩০০+ ভূমিকম্প রেকর্ড করে এবং মঙ্গলের তরল ধাতব কোরের অস্তিত্ব প্রমাণ করে", "মাটির নিচে শহর খুঁজে পায়", "প্রমাণ করে মঙ্গলের কোনো কোর নেই", "মাটির নিচে তেলের খনি আবিষ্কার করে"],
      correct: 0,
      explanation_en: "Correct! InSight's SEIS seismometer mapped the crust, mantle, and liquid metallic core.",
      explanation_bn: "সঠিক! ইনসাইটের সিসমোমিটার মঙ্গলের তরল লাভা কোরের সন্ধান দেয়।"
    }
  ],
  expert: [
    {
      id: "q_e1",
      level: "expert",
      question_en: "How many total powered atmospheric flights did the Ingenuity Mars helicopter complete before retirement?",
      question_bn: "অবসরে যাওয়ার আগ পর্যন্ত ইনজেনুইটি মার্স হেলিকপ্টার মঙ্গলের আকাশে মোট কতটি ফ্লাইট সম্পন্ন করেছিল?",
      options_en: ["72 flights (designed for 5)", "5 flights", "150 flights", "1 flight"],
      options_bn: ["৭২টি ফ্লাইট (পরিকল্পিত ছিল ৫টি)", "৫টি ফ্লাইট", "১৫০টি ফ্লাইট", "১টি ফ্লাইট"],
      correct: 0,
      explanation_en: "Correct! Designed as a 5-flight tech demo, Ingenuity completed 72 flights covering 17 km over 3 years!",
      explanation_bn: "সঠিক! মাত্র ৫টি ফ্লাইটের জন্য তৈরি হলেও ইনজেনুইটি একটানা ৭২টি সফল উড্ডয়ন করে বিশ্বরেকর্ড গড়ে।"
    },
    {
      id: "q_e2",
      level: "expert",
      question_en: "What camera on the Mars Reconnaissance Orbiter (MRO) generates 30 cm/pixel digital terrain models?",
      question_bn: "এমআরও (MRO) অরবিটারের কোন ক্যামেরাটি ৩০ সেমি/পিক্সেল রেজোলিউশনে ডিজিটাল এলিভেশন মডেল তৈরি করে?",
      options_en: ["HiRISE (High Resolution Imaging Science Experiment)", "Mastcam-Z", "Hazcam", "ChemCam"],
      options_bn: ["হাইরাইজ (HiRISE)", "মাস্টক্যাম-জেড", "হ্যাক্যাম", "কেমক্যাম"],
      correct: 0,
      explanation_en: "Correct! HiRISE provides the ultra-high resolution elevation data used in modern 3D terrain engines.",
      explanation_bn: "সঠিক! হাইরাইজ ক্যামেরা মঙ্গলের সবচেয়ে নিখুঁত এলিভেশন ডেটা পাঠায়।"
    },
    {
      id: "q_e3",
      level: "expert",
      question_en: "Which commercial lunar lander achieved the first 100% successful private soft-landing operating for a full lunar day in 2025?",
      question_bn: "২০২৫ সালে বেসরকারি উদ্যোগে পুরো এক চান্দ্র-দিন সফলভাবে কাজ করা ল্যান্ডারটির নাম কী?",
      options_en: ["Blue Ghost (Firefly Aerospace / CLPS)", "Peregrine", "Odysseus IM-1", "Beresheet"],
      options_bn: ["ব্লু ঘোস্ট (Blue Ghost - Firefly Aerospace)", "পেরেগ্রিন", "ওডিসিয়াস", "বেরেশিট"],
      correct: 0,
      explanation_en: "Correct! Blue Ghost touched down at Mare Crisium in 2025, operating flawlessly for 14 Earth days.",
      explanation_bn: "সঠিক! ফায়ারফ্লাই এরোসপেসের ব্লু ঘোস্ট পুরো ১৪ দিন সক্রিয় থেকে নাসা পেলোড পরিচালনা করে।"
    },
    {
      id: "q_e4",
      level: "expert",
      question_en: "What key rocket system will launch cached sample tubes from the Martian surface back into orbit for Mars Sample Return?",
      question_bn: "মার্স স্যাম্পল রিটার্ন মিশনে মঙ্গলের মাটি থেকে পাথরের টিউব মহাকাশে তুলতে কোন রকেট ব্যবহৃত হবে?",
      options_en: ["Mars Ascent Vehicle (MAV)", "Saturn V", "Orion Capsule", "Centaur Upper Stage"],
      options_bn: ["মার্স অ্যাসেন্ট ভেহিকেল (MAV)", "স্যাটার্ন ৫", "ওরিয়ন ক্যাপসুল", "সেন্টর আপার স্টেজ"],
      correct: 0,
      explanation_en: "Correct! The Mars Ascent Vehicle (MAV) will be the first rocket ever launched from the surface of another planet.",
      explanation_bn: "সঠিক! এমএভি হবে অন্য গ্রহের মাটি থেকে পৃথিবীর উদ্দেশ্যে উৎক্ষেপিত প্রথম রকেট।"
    }
  ]
};

export const CADET_QUIZ = CADET_QUIZ_LEVELS.junior; // Default for backwards compatibility

export const LEVEL_BADGES_SHOWCASE = [
  {
    id: "badge_junior",
    tier: "Junior Cadet",
    tier_bn: "জুনিয়র ক্যাডেট",
    minXP: 100,
    icon: "🚀",
    name_en: "Pioneer Explorer",
    name_bn: "পায়োনিয়ার এক্সপ্লোরার",
    unlockCondition_en: "Complete Junior level missions or answer 2 quiz questions",
    unlockCondition_bn: "জুনিয়র মিশন অথবা ২টি কুইজ সঠিক উত্তর দাও",
    color: "#00e5ff"
  },
  {
    id: "badge_intermediate",
    tier: "Intermediate Explorer",
    tier_bn: "ইন্টারমিডিয়েট এক্সপ্লোরার",
    minXP: 500,
    icon: "💎",
    name_en: "Planetary Geologist",
    name_bn: "প্ল্যানেটারি জিওলজিস্ট",
    unlockCondition_en: "Scan Blueberries & Surveyor 3 Relics, reach 500 XP",
    unlockCondition_bn: "ব্লুবেরি ও সার্ভেয়ার ৩ স্ক্যান করো, ৫০০ এক্সপি অর্জন করো",
    color: "#ffb700"
  },
  {
    id: "badge_senior",
    tier: "Senior Scientist",
    tier_bn: "সিনিয়র সায়েন্টিস্ট",
    minXP: 1000,
    icon: "🔬",
    name_en: "Astrochemistry Specialist",
    name_bn: "অ্যাস্ট্রোকেমিস্ট্রি স্পেশালিস্ট",
    unlockCondition_en: "Analyze Sol 5111 Tau storm & LCROSS water ice, reach 1000 XP",
    unlockCondition_bn: "সল ৫১১১ ঝড় ও চাঁদের বরফ বিশ্লেষণ করো, ১০০০ এক্সপি অর্জন করো",
    color: "#10b981"
  },
  {
    id: "badge_expert",
    tier: "Expert Commander",
    tier_bn: "এক্সপার্ট কমান্ডার",
    minXP: 1500,
    icon: "👑",
    name_en: "Cosmic Grand Master",
    name_bn: "কসমিক গ্র্যান্ড মাস্টার",
    unlockCondition_en: "Decode Blackbox & Artemis Gateway base, reach 1500 XP",
    unlockCondition_bn: "ব্ল্যাকবক্স ডিকোড ও আর্টেমিস বেসক্যাম্প আনলক করো, ১৫০০ এক্সপি অর্জন করো",
    color: "#ec4899"
  }
];

export const SPACE_MILESTONE_CALENDAR = [
  {
    date: "1969-07-20",
    title_en: "Apollo 11: First Human Moonwalk",
    title_bn: "অ্যাপোলো ১১: চাঁদের বুকে প্রথম মানব পদক্ষেপ",
    body: "moon",
    icon: "👨‍🚀",
    desc_en: "Neil Armstrong & Buzz Aldrin landed the LM Eagle at Sea of Tranquility. 'That's one small step for man, one giant leap for mankind.'",
    desc_bn: "নীল আর্মস্ট্রং ও বাজ অলড্রিন চাঁদের শান্ত সাগরে অবতরণ করেন।"
  },
  {
    date: "1969-11-19",
    title_en: "Apollo 12 & Surveyor 3 Relic Retrieval",
    title_bn: "অ্যাপোলো ১২ ও সার্ভেয়ার ৩ যন্ত্রাংশ উদ্ধার",
    body: "moon",
    icon: "🎯",
    desc_en: "Pinpoint landing 180m from Surveyor 3. Astronauts walked to the robot and retrieved its camera to study space exposure on Earth.",
    desc_bn: "সার্ভেয়ার ৩ রোবটের পাশে নেমে এর ক্যামেরা ও স্কুপ পৃথিবীতে ফেরত আনার ঘটনা।"
  },
  {
    date: "1976-07-20",
    title_en: "Viking 1: First U.S. Mars Soft Landing",
    title_bn: "ভাইকিং ১: মঙ্গলে প্রথম মার্কিন সফট ল্যান্ডিং",
    body: "mars",
    icon: "🛬",
    desc_en: "Viking 1 touched down at Chryse Planitia, transmitting the first color panoramas from the Martian surface.",
    desc_bn: "মঙ্গলের মাটিতে ভাইকিং ১-এর প্রথম রঙিন প্যানোরামা ও সয়েল টেস্ট।"
  },
  {
    date: "1997-07-04",
    title_en: "Mars Pathfinder & Sojourner Landing",
    title_bn: "পাথফাইন্ডার ও সোজার্নার রোভার অবতরণ",
    body: "mars",
    icon: "🤖",
    desc_en: "First wheeled rover on Mars touched down in Ares Vallis, captivating millions of internet users worldwide.",
    desc_bn: "মঙ্গলে প্রথম চাকাযুক্ত রোভার সোজার্নারের সফল পদচারণা।"
  },
  {
    date: "2004-01-25",
    title_en: "Opportunity (MER-B) 'Hole-in-One' Landing",
    title_bn: "অপরচুনিটি রোভারের ঈগল ক্রেটারে অবতরণ",
    body: "mars",
    icon: "🚀",
    desc_en: "Opportunity landed directly inside Eagle Crater on Meridiani Planum, instantly finding hematite blueberries.",
    desc_bn: "অপরচুনিটি রোভার সরাসরি ঈগল ক্রেটারে নেমে হেমাটাইট ব্লুবেরি আবিষ্কার করে।"
  },
  {
    date: "2009-10-09",
    title_en: "LCROSS Lunar Water Ice Confirmation",
    title_bn: "এলক্রস মিশনে চাঁদের বরফ নিশ্চিতকরণ",
    body: "moon",
    icon: "💧",
    desc_en: "Centaur rocket stage impacted Cabeus crater; sensors proved pure water ice in permanent shadow.",
    desc_bn: "ক্যাবেউস ক্রেটারে আছড়ে পড়ে কোটি কোটি টন পানির বরফের অস্তিত্ব প্রমাণ।"
  },
  {
    date: "2012-08-06",
    title_en: "Curiosity Sky Crane Landing at Gale Crater",
    title_bn: "কিউরিওসিটি রোভারের স্কাই ক্রেন ল্যান্ডিং",
    body: "mars",
    icon: "🔬",
    desc_en: "Nuclear rover touched down via rocket sky crane, later finding organic carbon in ancient lake mudstones.",
    desc_bn: "গেল ক্রেটারে কিউরিওসিটি রোভার নেমে প্রাচীন হ্রদে জৈব অণুর সন্ধান পায়।"
  },
  {
    date: "2018-06-10",
    title_en: "Opportunity Sol 5111 Final Transmission",
    title_bn: "অপরচুনিটি রোভারের সল ৫১১১ শেষ বার্তা",
    body: "mars",
    icon: "🌪️",
    desc_en: "The historic PEDE global dust storm raised Tau to 10.8, extinguishing sunlight. MER-B sent its final housekeeping frame.",
    desc_bn: "ভয়াল বৈশ্বিক ধূলিঝড়ে অপটিক্যাল টাউ ১০.৮ হয়ে অপরচুনিটির ১৫ বছরের মিশন সমাপ্ত হয়।"
  },
  {
    date: "2021-02-18",
    title_en: "Perseverance & Ingenuity Jezero Landing",
    title_bn: "পারসিভেরেন্স ও ইনজেনুইটি অবতরণ",
    body: "mars",
    icon: "🚁",
    desc_en: "Touched down in Jezero crater river delta. Ingenuity completed 72 powered flights in thin Martian atmosphere.",
    desc_bn: "জেজেরো ডেল্টায় পারসিভেরেন্সের নমুনা সংগ্রহ ও ইনজেনুইটির ৭২টি ফ্লাইট।"
  },
  {
    date: "2022-11-16",
    title_en: "Artemis I SLS Mega-Rocket Flight",
    title_bn: "আর্টেমিস ১ এসএলএস মেগা-রকেট উৎক্ষেপণ",
    body: "moon",
    icon: "🚀",
    desc_en: "Orion capsule traveled 2.25 million km around the Moon and returned safely, testing human heat shield.",
    desc_bn: "মানুষবিহীন আর্টেমিস ১ সফলভাবে চাঁদ প্রদক্ষিণ করে পৃথিবীতে ফেরে।"
  },
  {
    date: "2026-04-01",
    title_en: "Artemis II Crewed Lunar Flyby Launch",
    title_bn: "আর্টেমিস ২ মানুষবাহী চন্দ্র পরিক্রমা",
    body: "moon",
    icon: "👨‍🚀",
    desc_en: "4 astronauts journey beyond low Earth orbit for the first time since 1972, flying around the Moon.",
    desc_bn: "১৯৭২ সালের পর প্রথম ৪ জন নভোচারী চাঁদ প্রদক্ষিণ করে ইতিহাস সৃষ্টি করেন।"
  }
];

export const FUN_FACTS = [
  {
    title_en: "Why is Mars Red?",
    title_bn: "মঙ্গল গ্রহ লাল কেন?",
    text_en: "Mars' surface is covered in iron oxide (rust)—just like an old bicycle left out in the rain! The fine red dust blows all over the planet in giant storms.",
    text_bn: "মঙ্গলের মাটিতে প্রচুর আয়রন অক্সাইড বা মরিচা রয়েছে—ঠিক যেমন বৃষ্টির পানিতে রাখা পুরনো সাইকেলে মরিচা পড়ে! এই লাল ধূলিকণাই ঝড়ে উড়ে পুরো আকাশ লালচে করে তোলে।"
  },
  {
    title_en: "57 Times Longer than Designed!",
    title_bn: "পরিকল্পনার চেয়ে ৫৭ গুণ বেশি দিন টিকে ছিল!",
    text_en: "NASA engineers designed Opportunity to survive for only 90 Martian days (sols). Incredibly, it explored Mars for 5,111 sols (over 14 Earth years)!",
    text_bn: "নাসার বিজ্ঞানীরা অপরচুনিটিকে মাত্র ৯০ মঙ্গলায়ন দিন (সল)-এর জন্য তৈরি করেছিলেন। কিন্তু রোভারটি অবিশ্বাস্যভাবে একটানা ৫,১১১ সল (১৪ বছরের বেশি) মঙ্গল অনুসন্ধান করেছে!"
  },
  {
    title_en: "What are Martian Blueberries?",
    title_bn: "মার্শিয়ান ব্লুবেরি কী?",
    text_en: "They aren't real fruit! They are tiny round hematite marbles formed billions of years ago inside liquid water lakes on Mars.",
    text_bn: "এগুলো কোনো খাবার ফল নয়! এগুলো ছোট ছোট গোল হেমাটাইট খনিজের মার্বেল, যা কোটি কোটি বছর আগে মঙ্গলের তরল পানিতে গঠিত হয়েছিল।"
  },
  {
    title_en: "The Marathon Runner on Mars",
    title_bn: "মঙ্গলের ম্যারাথন বিজয়ী",
    text_en: "Opportunity drove 45.16 kilometers (28.06 miles)—the longest overland distance any wheeled vehicle has ever driven on another planet!",
    text_bn: "রোভারটি মঙ্গলে মোট ৪৫.১৬ কিমি পথ পাড়ি দিয়েছে—যা পৃথিবীর বাইরে অন্য কোনো গ্রহে মানুষের তৈরি গাড়ির দীর্ঘতম ভ্রমণের বিশ্বরেকর্ড!"
  },
  {
    title_en: "Why is the Moon's Sky Always Black?",
    title_bn: "চাঁদের আকাশ সবসময় কালো কেন?",
    text_en: "Because the Moon has no atmosphere! Without air to scatter sunlight like Earth's blue sky, space is pitch black with bright stars visible even in daytime.",
    text_bn: "কারণ চাঁদে কোনো বাতাস বা বায়ুমণ্ডল নেই! আলো ছড়ানোর বাতাস না থাকায় চাঁদের আকাশ সবসময় ঘোর কালো এবং দিনের বেলাতেও উজ্জ্বল তারা দেখা যায়।"
  },
  {
    title_en: "Surveyor 3 Came Back to Earth!",
    title_bn: "সার্ভেয়ার ৩ রোবটের পৃথিবীতে প্রত্যাবর্তন!",
    text_en: "In 1969, Apollo 12 astronauts landed 180 meters from Surveyor 3, unbolted its TV camera and scoop, and brought them back to Earth for NASA testing!",
    text_bn: "১৯৬৯ সালে অ্যাপোলো ১২-এর নভোচারীরা সার্ভেয়ার ৩ ল্যান্ডারের পাশে নেমে এর ক্যামেরা ও যন্ত্রাংশ খুলে পৃথিবীতে এনে পরীক্ষা করেন!"
  }
];

export const COMPANION_BOT_LINES = {
  welcome_en: "👋 Signal Locked! We are Asha (in Dhaka, Bangladesh) and Leo (at Kennedy Space Center, Florida)—welcome to the Junior Deep Space Network! Click any glowing relic or launch our 4 JPL Science Mini-Games!",
  welcome_bn: "👋 Signal Locked! We are Asha (in Dhaka, Bangladesh) and Leo (at Kennedy Space Center, Florida)—welcome to the Junior Deep Space Network! Click any glowing relic or launch our 4 JPL Science Mini-Games!",
  mission_done_en: "🎉 Eureka! Asha's rooftop antenna and Leo's robotics console decoded the memory log! You've unlocked a new NASA Badge and earned XP!",
  mission_done_bn: "🎉 Eureka! Asha's rooftop antenna and Leo's robotics console decoded the memory log! You've unlocked a new NASA Badge and earned XP!",
  storm_warn_en: "⚠️ Atmospheric Tau rising! Notice how the sky darkens and solar array wattage plummets according to Beer-Lambert physics!",
  storm_warn_bn: "⚠️ Atmospheric Tau rising! Notice how the sky darkens and solar array wattage plummets according to Beer-Lambert physics!",
  all_completed_en: "🌟 THE LAST HANDSHAKE COMPLETE! You helped Asha and Leo recover every NASA relic across the Moon, Mars, and Deep Space!",
  all_completed_bn: "🌟 THE LAST HANDSHAKE COMPLETE! You helped Asha and Leo recover every NASA relic across the Moon, Mars, and Deep Space!"
};
