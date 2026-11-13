// Editorial Pre-Mission Story & History Articles
// Inspired by NASA JPL Archives & Space Archaeology

export const MISSION_STORY_ARTICLES = {
  apollo11: {
    id: "apollo11",
    planet: "moon",
    destination: "moon",
    badge: "🌕 NASA APOLLO ARCHIVE",
    readTime: "3 MIN READ",
    author: "NASA Historical Office • Neil A. Armstrong Space Heritage",
    title: "Why Apollo 11 Left Its Golden Base on the Lunar Dust",
    subtitle: "The Tsiolkovsky rocket equation, the Ascent Stage escape, and humanity's first footprint.",
    heroImage: "./images/hero_astronaut_mars.jpg",
    tags: ["Sea of Tranquility", "Descent Stage", "Delta-v Balance", "July 20, 1969"],
    summary: "When Neil Armstrong and Buzz Aldrin stepped onto the Sea of Tranquility, they knew they could never bring everything back. Every single kilogram had to be calculated against the harsh math of gravity.",
    paragraphs: [
      "On July 20, 1969, humanity completed its greatest technological leap. The Apollo 11 Lunar Module, christened *Eagle*, touched down on Mare Tranquillitatis with less than thirty seconds of fuel remaining. Beneath the landing pads lay centuries of human dreaming.",
      "Yet, the most poignant piece of history was not what the astronauts brought home—it was what they were forced to leave behind. To return safely to Earth, Neil Armstrong and Buzz Aldrin had to ignite the Lunar Module's Ascent Stage engine. But the rocket equation (*Δv = v_e · ln(m_0 / m_f)*) is unforgiving: every gram of dead mass requires precious propellant.",
      "The heavy golden Descent Stage, complete with its descent rocket engine, landing legs, surface scientific packages, and the historic plaque bearing the words *'We Came In Peace For All Mankind'*, was turned into a permanent lunar launch pad. As the ascent stage roared back into lunar orbit, the golden stage remained forever resting in the undisturbed dust of the Moon.",
      "Today, the Apollo 11 descent stage is not 'space debris'—it is the archaeological monument of humanity's arrival on another world, silently awaiting the future explorers who will walk those historic tracks again."
    ],
    fastFacts: [
      { label: "Landing Sol / Date", val: "July 20, 1969 (20:17 UTC)" },
      { label: "Hardware Left", val: "Lunar Module Descent Stage + Plaque" },
      { label: "Surface Mass", val: "2,034 kg resting in Tranquility" },
      { label: "Mission Challenge", val: "Balance fuel & mass in Delta-v Lab" }
    ],
    missionType: "apollo11",
    labMode: "apollo11"
  },

  opportunity: {
    id: "opportunity",
    planet: "mars",
    destination: "mars",
    badge: "🔴 MARS RECONNAISSANCE & ROBOTICS",
    readTime: "4 MIN READ",
    author: "JPL Planetary Science Division • Pasadena, CA",
    title: "Opportunity: The Blueberries of Ancient Martian Oceans",
    subtitle: "How a 90-day golf-cart robot survived 15 years and proved Mars was once soaked in water.",
    heroImage: "./images/thumb_archaeology.jpg",
    tags: ["Perseverance Valley", "Hematite Blueberries", "APXS Spectrometer", "Sol 5111"],
    summary: "When Opportunity bounced into Eagle Crater on January 25, 2004, it was only expected to survive 90 Martian days. It ended up driving a marathon 45.16 kilometers across alien plains, transforming our understanding of planetary habitability.",
    paragraphs: [
      "On January 25, 2004, NASA's Mars Exploration Rover *Opportunity* (MER-B) touched down on Meridiani Planum inside a tiny 22-meter crater. What the cameras transmitted back stunned planetary geologists across the globe: the bedrock was studded with billions of tiny spherical grains, soon nicknamed 'Martian Blueberries'.",
      "To unmask their identity, Opportunity wheeled forward and deployed its robotic arm instrument turret. The Alpha Particle X-Ray Spectrometer (APXS) bombarded the spherules with Curium-244 radiation, detecting distinct Fe Kα (6.40 keV) and Fe Kβ (7.06 keV) fluorescent spectral lines of pure gray crystalline hematite (α-Fe2O3).",
      "On Earth, hematite spherules form almost exclusively through groundwater percolation through porous sedimentary rock. Opportunity had found the undisputed smoking gun: ancient Mars was not a barren desert, but a world of lakes, warm geothermal springs, and flowing water.",
      "Opportunity persevered through frozen Martian winters, steep crater slopes, and wheel motor failures for an unbelievable 5,111 Sols (15 Earth years), until the cataclysmic global dust storm of June 2018 darkened the skies above Perseverance Valley. Its final resting place stands as an eternal testament to robotic endurance."
    ],
    fastFacts: [
      { label: "Design Lifespan", val: "90 Sols (Achieved 5,111 Sols!)" },
      { label: "Distance Driven", val: "45.16 km (World Off-Earth Record)" },
      { label: "Key Discovery", val: "Hematite blueberries & jarosite water minerals" },
      { label: "Mission Challenge", val: "Calibrate APXS X-ray energy lines" }
    ],
    missionType: "opportunity",
    labMode: "opportunity"
  },

  insight: {
    id: "insight",
    planet: "mars",
    destination: "mars",
    badge: "🔴 GEOPHYSICAL SEISMOLOGY",
    readTime: "3 MIN READ",
    author: "SEIS Consortium • CNES & NASA JPL",
    title: "InSight: Listening to the Deep Heartbeat of Mars",
    subtitle: "Placing humanity's most sensitive ear on the red dirt to map an alien core.",
    heroImage: "./images/thumb_storm.jpg",
    tags: ["Elysium Planitia", "SEIS Seismometer", "P & S Waves", "Liquid Core"],
    summary: "Unlike rovers that rolled across the surface, InSight sat motionless in Elysium Planitia, placing a golden dome on the Martian dirt to hear the murmurs of marsquakes and meteoroid strikes.",
    paragraphs: [
      "For centuries, humans stared at Mars through telescopes, wondering what lay hidden beneath its rusted orange crust. On November 26, 2018, NASA's Interior Exploration using Seismic Investigations, Geodesy and Heat Transport (*InSight*) lander set its feet down on the flat, wind-swept plains of Elysium Planitia.",
      "Using its robotic arm, InSight lifted the Seismic Experiment for Interior Structure (SEIS)—an ultra-sensitive seismometer capable of detecting vibrations smaller than the radius of a single hydrogen atom—and gently set it onto the Martian surface, shielding it with a domed wind and thermal cover.",
      "Over four years, InSight detected over 1,300 marsquakes. When meteoroids collided with the Martian atmosphere and slammed into the crust, seismic waves reverberated through the planet. By measuring the arrival delay between compression P-waves and shearing S-waves, scientists calculated the thickness of the Martian crust and discovered that Mars possesses a massive, molten liquid-iron core.",
      "As Martian dust gradually suffocated InSight's solar arrays in late 2022, its seismometer faithfully transmitted until its final milliampere of battery depleted. Its quiet metallic body remains forever tuned to the trembling heartbeat of the planet."
    ],
    fastFacts: [
      { label: "Landing Location", val: "Elysium Planitia, Mars" },
      { label: "Marsquakes Detected", val: "1,319 seismic events logged" },
      { label: "Key Discovery", val: "Mars core is liquid iron-nickel (~1,830 km radius)" },
      { label: "Mission Challenge", val: "Align P-wave & S-wave seismogram arrival" }
    ],
    missionType: "insight",
    labMode: "insight"
  },

  voyager1: {
    id: "voyager1",
    planet: "deepspace",
    destination: "deepspace",
    badge: "🌌 INTERSTELLAR EXPEDITION",
    readTime: "4 MIN READ",
    author: "NASA Jet Propulsion Laboratory • Interstellar Heritage",
    title: "Voyager 1: The Dying Candle in Interstellar Space",
    subtitle: "Over 24 billion kilometers from Earth, carrying humanity's Golden Record into the dark.",
    heroImage: "./images/thumb_roadmap.jpg",
    tags: ["Heliopause", "Pu-238 RTG", "Golden Record", "22h 34m Delay"],
    summary: "Launched in 1977, Voyager 1 is the farthest human-made object in history. Powered by decaying plutonium pellets, it crossed into the interstellar medium, carrying our sounds, art, and greetings to the stars.",
    paragraphs: [
      "On September 5, 1977, Voyager 1 blasted off from Cape Canaveral atop a Titan IIIE rocket. Its grand tour took it past the swirling storms of Jupiter and the breathtaking icy rings of Saturn. But its most heroic chapter began after its primary mission ended.",
      "Voyager 1 accelerated outward toward the boundary where the solar wind gives way to the icy sea of interstellar space. On August 25, 2012, its plasma wave sensors recorded a sudden jump in cosmic ray density: Voyager 1 had crossed the Heliopause. It had become humanity's first interstellar ambassador.",
      "Today, Voyager 1 is over 24.3 billion kilometers (162 Astronomical Units) away. A radio signal traveling at the speed of light takes 22 hours and 34 minutes to reach it, and another 22 hours to return. Its radioactive Plutonium-238 generators produce less heat each passing year, forcing engineers to turn off heaters and instruments one by one to keep the candle burning.",
      "Bolted to its side is the Golden Record—a gold-plated copper phonograph containing the sounds of ocean surf, laughter, bird calls, Bach, Chuck Berry, and greetings in 55 human languages. When its last radio whisper goes quiet around 2028, Voyager 1 will wander the Milky Way for billions of years—an indestructible monument to human curiosity."
    ],
    fastFacts: [
      { label: "Current Distance", val: "24.3+ Billion km (162 AU)" },
      { label: "Radio Light Time", val: "22 hours, 34 minutes each way" },
      { label: "Nuclear Power", val: "Pu-238 RTG decay (~220 Watts left)" },
      { label: "Mission Challenge", val: "Manage power grid & decode Golden Record" }
    ],
    missionType: "voyager1",
    labMode: "voyager1"
  }
};

