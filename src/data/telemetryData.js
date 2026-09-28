// Authentic NASA Planetary Data System (PDS), MER-B Opportunity & Apollo Moon Missions Telemetry Archive

export const MISSION_METRICS = {
  roverName: "Opportunity (MER-B) & Apollo Lunar Relics",
  missionStatus: "Mission Complete / Monument Preserved",
  primarySite: "Perseverance Valley (Mars) / Sea of Tranquility & Oceanus Procellarum (Moon)",
  coordinates: {
    lat: -14.5714,
    lon: 354.6734,
    elevation: -1540
  },
  landedSol: "Sol 1 (January 25, 2004 UTC)",
  lastContactSol: "Sol 5111 (June 10, 2018 UTC)",
  totalSols: 5111,
  designLifeSols: 90,
  totalOdometerKm: 45.16,
  totalOdometerMiles: 28.06,
  rawImagesReturned: 217594,
  atmosphericPhenomenon: "2018 Planet-Encircling Dust Event (PEDE)"
};

export const SCIENTIFIC_PAYLOADS = [
  {
    id: "pancam",
    name: "Pancam (Panoramic Multispectral Camera)",
    abbreviation: "PANCAM",
    location: "Mast Assembly (PMA)",
    discoveries: "Captured over 100,000 multispectral panoramas across Eagle, Endurance, Victoria, and Endeavour craters. Documented atmospheric dust optical depth (Tau) and imaged the final obscured sky before darkness fell on Sol 5111.",
    wavelengths: "400 nm - 1000 nm (13 narrow-band geological filters)",
    resolution: "1024 x 1024 pixels per frame, stereo baseline 30 cm",
    significance: "Primary sensory organ for geology and atmospheric monitoring."
  },
  {
    id: "mini_tes",
    name: "Mini-TES (Thermal Emission Spectrometer)",
    abbreviation: "MINI-TES",
    location: "Warm Electronics Box (View via Mast Periscope)",
    discoveries: "Identified carbonate minerals and coarse-grained crystalline hematite deposits from hundreds of meters away, guiding Opportunity directly to historic aqueous outcrop discoveries.",
    wavelengths: "5.0 - 29.0 µm infrared thermal spectroscopy",
    resolution: "8 and 20 mrad selectable field of view",
    significance: "Determined mineralogy and thermophysical rock properties from a distance."
  },
  {
    id: "mossbauer",
    name: "Mössbauer Spectrometer (MIMOS II)",
    abbreviation: "MB",
    location: "Instrument Deployment Device (IDD / Robotic Arm)",
    discoveries: "Confirmed the presence of jarosite—an iron sulfate mineral that can only crystallize in liquid acidic water—providing definitive proof that Mars once harbored surface water lakes.",
    wavelengths: "14.4 keV Gamma-Ray emission (Cobalt-57 radioactive source)",
    resolution: "Detects oxidation states of iron (Fe2+, Fe3+, metallic Fe)",
    significance: "Definitive iron mineralogy validation of Martian aqueous history."
  },
  {
    id: "rat",
    name: "RAT (Rock Abrasion Tool)",
    abbreviation: "RAT",
    location: "Instrument Deployment Device (IDD / Robotic Arm)",
    discoveries: "Ground away millimeters of heavily weathered Martian rind on rocks like 'Esperance' and 'El Capitan', revealing pristine, unaltered interior rock chemistry rich in clay minerals.",
    wavelengths: "Mechanical diamond-resin grinding wheel (3000 RPM)",
    resolution: "Grinds 45 mm diameter circular hole up to 5 mm deep",
    significance: "The first mechanical diamond grinding tool operated on an extraterrestrial body."
  },
  {
    id: "apxs",
    name: "APXS (Alpha Particle X-Ray Spectrometer)",
    abbreviation: "APXS",
    location: "Instrument Deployment Device (IDD / Robotic Arm)",
    discoveries: "Measured elemental composition of Martian soils and rocks, discovering high concentrations of sulfur, chlorine, and nickel.",
    wavelengths: "Curium-244 alpha source & X-ray fluorescence",
    resolution: "Quantitative elemental abundance from sodium to strontium",
    significance: "Direct elemental rock chemistry analysis."
  },
  {
    id: "solar_array",
    name: "Solar Photovoltaic Power Subsystem",
    abbreviation: "PV-ARRAY",
    location: "Upper Deck Wings & Center Panel",
    discoveries: "Triple-junction Gallium Arsenide (GaAs) solar cells designed for 900 Wh/sol peak. Survived 15 years through sporadic Martian 'cleaning events' caused by dust devils until the extreme 2018 PEDE.",
    wavelengths: "Solar spectrum 300 - 1100 nm",
    resolution: "1.3 m² active surface area",
    significance: "Lifeblood of the rover; extinguished when Tau exceeded 10.8 on Sol 5111."
  }
];

export const HISTORICAL_SOL_LOGS = [
  {
    sol: 1,
    date: "2004-01-25",
    location: "Eagle Crater, Meridiani Planum",
    event: "Landing in a 'hole-in-one'. First images reveal layered bedrock outcroppings and hematite spherules ('blueberries').",
    tau: 0.9,
    powerWh: 910
  },
  {
    sol: 130,
    date: "2004-06-08",
    location: "Endurance Crater",
    event: "Entered the 20-meter deep Endurance Crater to study deep layered stratigraphy, discovering extensive past water evidence.",
    tau: 0.5,
    powerWh: 820
  },
  {
    sol: 950,
    date: "2006-09-28",
    location: "Victoria Crater Rim",
    event: "Reached the 800-meter wide Victoria Crater after 2 years of driving, studying massive layered cliffs at Duck Bay.",
    tau: 0.7,
    powerWh: 610
  },
  {
    sol: 1220,
    date: "2007-06-30",
    location: "Victoria Crater Interior",
    event: "Survived 2007 global dust storm when Tau spiked to 4.7. Cleaned by wind gusts on Sol 1240.",
    tau: 4.7,
    powerWh: 128
  },
  {
    sol: 2700,
    date: "2011-08-09",
    location: "Endeavour Crater (Spirit Point)",
    event: "Arrived at the 22-km wide Endeavour Crater, identifying gypsum veins formed in neutral water.",
    tau: 0.4,
    powerWh: 540
  },
  {
    sol: 3968,
    date: "2015-03-24",
    location: "Marathon Valley, Endeavour Rim",
    event: "Completed 42.195 km (26.219 miles)—completing the first official Marathon run on another planet!",
    tau: 0.6,
    powerWh: 590
  },
  {
    sol: 5000,
    date: "2018-02-16",
    location: "Perseverance Valley",
    event: "Celebrated 5,000 sols of continuous exploration, photographing carved fluid channels descending the rim.",
    tau: 0.8,
    powerWh: 640
  },
  {
    sol: 5105,
    date: "2018-06-04",
    location: "Perseverance Valley",
    event: "Atmospheric optical depth Tau jumps sharply from 1.0 to 2.1 as regional dust storm rapidly intensifies.",
    tau: 2.1,
    powerWh: 345
  },
  {
    sol: 5111,
    date: "2018-06-10",
    location: "Perseverance Valley (Monument Site)",
    event: "Optical Tau reaches unprecedented 10.8. Solar array output collapses to 22 Wh. Final housekeeping packet transmitted before entering terminal sleep.",
    tau: 10.8,
    powerWh: 22
  }
];

export const ARCHAEOLOGICAL_ARTIFACTS = [
  {
    id: "oppy_rover",
    missionId: "mission_locate",
    title: "MER-B Opportunity Rover Chassis",
    coords: { x: 0.0, y: 0.0, z: 0.0 },
    description: "The 185-kilogram robotic explorer resting silently on a 15-degree slope in Perseverance Valley. Its gold Kapton-wrapped chassis and solar panels are layered in fine iron oxide dust.",
    significance: "First machine to complete a marathon distance on another world.",
    icon: "rover",
    color: 0xff5e28
  },
  {
    id: "hematite_blueberries",
    missionId: "mission_blueberries",
    title: "Hematite Concretions ('Martian Blueberries')",
    coords: { x: 18.0, y: 0.2, z: 14.0 },
    description: "Millimeter-scale iron-rich spherules formed millions of years ago in groundwater-permeated basaltic sandstone. Conclusive physical proof of past liquid water.",
    significance: "Conclusive physical evidence of ancient Martian hydrology.",
    icon: "gem",
    color: 0x00e5ff
  },
  {
    id: "rat_grind_spot",
    missionId: "mission_rat",
    title: "Sol 5105 Rock Abrasion Spot ('Esperance-Class')",
    coords: { x: -22.0, y: 0.3, z: 10.5 },
    description: "A pristine circular grind patch 45mm across cut by Opportunity's diamond-resin RAT. Revealing high clay mineral concentrations in unweathered bedrock.",
    significance: "Demonstrates neutral pH water suitable for pre-biotic chemistry.",
    icon: "disc",
    color: 0xffb700
  },
  {
    id: "mossbauer",
    missionId: "mission_mossbauer",
    title: "Mössbauer Jarosite Mineral Outcrop",
    coords: { x: -12.0, y: 0.3, z: -18.0 },
    description: "Iron sulfate mineral crystallization bedrock analyzed by Mössbauer gamma-ray spectroscopy, proving standing acidic water lake conditions in Mars' early epoch.",
    significance: "Definitive iron mineralogy validation of Martian aqueous history.",
    icon: "microscope",
    color: 0xa855f7
  },
  {
    id: "storm_station",
    missionId: "mission_storm",
    title: "Sol 5111 High Rim Atmospheric Weather Station",
    coords: { x: 16.0, y: 0.5, z: -20.0 },
    description: "Overlook where optical depth Tau escalated from 1.0 to 10.8 during the 2018 Planet-Encircling Dust Event, capturing the solar generation collapse to 22 Wh.",
    significance: "Historic record of Martian global dust storm physics.",
    icon: "tornado",
    color: 0xff5e28
  },
  {
    id: "blackbox_core",
    missionId: "mission_blackbox",
    title: "MER-B Master Solid-State Memory Core (2085 Recovery)",
    coords: { x: 0.0, y: 0.9, z: 0.0 },
    description: "The rad-hardened EEPROM storage core containing 15 years of telemetry, navigational waypoints, science packets, and the final encoded transmission from Sol 5111.",
    significance: "The complete digital soul of the Opportunity mission.",
    icon: "cpu",
    color: 0x00e5ff
  }
];

export const PITCH_SCRIPT_MARS = [
  {
    start: 0,
    end: 18,
    title: "Act I: The Storm That Stole the Light",
    subtitle: "2004 - 2018: 5,111 Sols of Endurance",
    script: "In 2004, Opportunity landed on Mars for a 90-sol mission. It endured for 15 years. Then, on Sol 5111, an unprecedented global dust storm stole its light.",
    camTarget: { x: 0, y: 8, z: 18 },
    tau: 10.8,
    mode: "sol5111"
  },
  {
    start: 19,
    end: 55,
    title: "Act II: The 2085 Planetary Archaeologist",
    subtitle: "Real-time WebGL Zero-Install Investigation",
    script: "In 2085, players return as planetary archaeologists. In a zero-install WebGL experience, students explore authentic Martian terrain to recover the machine that rewrote planetary science.",
    camTarget: { x: -3.5, y: 1.8, z: 4.5 },
    tau: 1.5,
    mode: "archaeologist"
  },
  {
    start: 56,
    end: 88,
    title: "Act III: NASA Open Data Ingestion",
    subtitle: "HiRISE 16-bit DTM & Beer-Lambert Physics",
    script: "Every valley slope and crater rim is mathematically derived from NASA's HiRISE elevation models. The atmospheric blackout simulates the actual Sol 5111 opacity metrics.",
    camTarget: { x: 6, y: 4.5, z: 8 },
    tau: 6.5,
    mode: "data"
  },
  {
    start: 89,
    end: 120,
    title: "Act IV: Science is Eternal",
    subtitle: "Inspiring the Next Generation of Explorers",
    script: "Opportunity went silent, but its science is eternal. By turning abandoned hardware into interactive history, we inspire the next generation of explorers.",
    camTarget: { x: 0, y: 1.2, z: 3.2 },
    tau: 0.5,
    mode: "heritage"
  }
];

export const PITCH_SCRIPT_MOON = [
  {
    start: 0,
    end: 20,
    title: "Act I: From Tranquility Base to the Stars",
    subtitle: "1969 Apollo 11 & The First Footsteps",
    script: "In July 1969, humanity took its first giant leap onto the Moon. At Tranquility Base and Oceanus Procellarum, robotic scouts and astronauts forged our first off-world foothold.",
    camTarget: { x: 0, y: 5, z: 14 },
    tau: 0.0,
    mode: "moon_apollo"
  },
  {
    start: 21,
    end: 55,
    title: "Act II: The Surveyor 3 Retrieval & Lunar Buggy",
    subtitle: "The First Off-World Archaeology Mission",
    script: "Apollo 12 performed the only retrieval of an extraterrestrial robotic probe—Surveyor 3. Then, Apollo 15 drove the first electric Lunar Roving Vehicle across the lunar mountains.",
    camTarget: { x: 8, y: 3, z: 6 },
    tau: 0.0,
    mode: "moon_surveyor"
  },
  {
    start: 56,
    end: 88,
    title: "Act III: Water Ice in Permanent Shadows",
    subtitle: "LCROSS, LRO, and Commercial CLPS",
    script: "LCROSS and Lunar Prospector proved billions of tons of water ice lie trapped inside polar cold traps—the fuel and lifeblood for future human civilization.",
    camTarget: { x: -6, y: 4, z: 8 },
    tau: 0.0,
    mode: "moon_water"
  },
  {
    start: 89,
    end: 120,
    title: "Act IV: The Artemis Generation Returns",
    subtitle: "Artemis II, Gateway, and the Highway to Mars",
    script: "With Artemis II in 2026 and permanent lunar base camps on the horizon, the Moon is not our final destination—it is humanity's stepping stone to Mars and beyond!",
    camTarget: { x: 0, y: 2, z: 4 },
    tau: 0.0,
    mode: "artemis_future"
  }
];

export const PITCH_SCRIPT_TIMESTAMPS = PITCH_SCRIPT_MARS; // Default
