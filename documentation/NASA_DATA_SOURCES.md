# 🛰️ NASA Data Sources & Open Data Integration

> **NASA International Space Apps Challenge 2026**  
> **Challenge**: *Abandoned but Not Forgotten — Storytelling About NASA's Discarded Equipment on the Moon and Mars*  
> **Project**: *Relics of the Red Dust: The Last Transmission*

---

## 📌 Executive Summary

**Relics of the Red Dust: The Last Transmission** relies entirely on authentic, peer-reviewed, and publicly accessible **NASA Open Data** to recreate the physical, geological, and atmospheric environments of Mars and the Moon. 

Every telemetry parameter (Atmospheric Optical Depth $\tau$, power generation curves in Wh/sol, battery bus voltages), 3D surface elevation model, scientific payload schematic, and mineralogical discovery in this application directly maps to verifiable NASA archives.

---

## 📊 Comprehensive NASA Data Sources & Citations

| # | NASA Data Source / Mission Archive | Scientific Domain | Raw Data Format | Direct Source & Archive Link | Implementation in Application |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | **NASA Planetary Data System (PDS) Geosciences Node** *(MER-B Opportunity Mission)* | Atmospheric Science & Engineering Telemetry | ASCII Tables / PDS3 Archive | [PDS Geosciences MER Archive](https://pds-geosciences.wustl.edu/missions/mer/)<br>[PDS Primary Portal](https://pds.nasa.gov/) | Ingested for Opportunity's **Sol 1–5111 historical logs**, atmospheric dust opacity ($\tau = 0.8 \to 10.8$), daily solar power decay ($900\text{ Wh} \to 22\text{ Wh/sol}$), and bus voltage threshold monitoring ($< 20.5\text{V}$ cutoff). |
| **2** | **NASA Mars Reconnaissance Orbiter (MRO) — HiRISE** | Planetary Geology & Photogrammetry | 16-bit GeoTIFF Digital Terrain Models (DTM) | [HiRISE DTM Archive](https://www.uahirise.org/dtm/)<br>[HiRISE Endeavour Crater DTM](https://hirise.lpl.arizona.edu/dtm/dtm.php?ID=ESP_032788_1775)<br>[PDS Imaging Node](https://pds-imaging.jpl.nasa.gov/) | Sub-meter 3D digital elevation heightmaps for Martian surface rendering in **Perseverance Valley**, Rim of Endeavour Crater ($-14.57^\circ\text{S}, 354.67^\circ\text{E}$). |
| **3** | **NASA Lunar Reconnaissance Orbiter (LRO) — LOLA Altimeter** | Lunar Topography & Altimetry | 16-bit PDS IMG / GeoTIFF Altimetry | [LRO LOLA Science Team Portal](https://lola.gsfc.nasa.gov/)<br>[PDS LOLA Data Products](https://pds-geosciences.wustl.edu/missions/lro/lola.htm) | Micro-elevation heightmaps of lunar exploration zones including the **Oceanus Procellarum** landing site of Surveyor 1 ($2.47^\circ\text{S}, 316.66^\circ\text{E}$). |
| **4** | **NASA 3D Resources & JPL Hardware Archives** | Aerospace Hardware Engineering | .obj / .gltf / CAD Assets | [NASA 3D Resources Portal](https://nasa3d.arc.nasa.gov/)<br>[NASA Solar System Interactive (Eyes on the Solar System)](https://eyes.nasa.gov/)<br>[JPL Spacecraft Models](https://nasa3d.arc.nasa.gov/models) | High-fidelity 3D structural geometry of the **Mars Exploration Rover (MER-B Opportunity)** and **Surveyor 1 Lunar Lander**, including the 6-wheel rocker-bogie chassis and instrument deployment device (IDD). |
| **5** | **NASA PDS / MER Analyst's Notebook & Mineralogy Archives** | In-situ Planetary Geochemistry | Spectral CSV / Diagnostic Tables | [MER Analyst's Notebook](https://an.rsl.wustl.edu/mer/)<br>[NASA MER Science Payloads](https://mars.nasa.gov/mer/mission/instruments/) | In-situ mineralogical spectra and archaeological ground truth: **Hematite Blueberries (Spherules)** at Eagle Crater, **Jarosite aqueous minerals** via Mössbauer spectrometry, and diamond-grind wear marks via the **Rock Abrasion Tool (RAT)**. |
| **6** | **NASA Space Science Data Coordinated Archive (NSSDCA)** | Mission Trajectory & Master History | Mission Master Catalogs / PDS Datasets | [NSSDCA Opportunity Master Record](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A)<br>[NASA Mars Exploration Program](https://mars.nasa.gov/mer/) | Timeline validation of Opportunity's 14-year odyssey, 45.16 km traverse distance across Meridiani Planum, and the June 2018 planet-encircling dust storm timeline. |

---

## 🔬 Scientific Data Processing & Mathematical Pipeline

### 1. Atmospheric Optical Depth Extinction ($\tau$ / Tau)
The application implements the **Beer-Lambert Law** to model solar radiation attenuation dynamically as players adjust the atmospheric opacity slider from clear Martian skies ($\tau = 0.8$) to the catastrophic Sol 5111 global dust storm ($\tau = 10.8$):

$$I(\tau, \theta) = I_0 \cdot \exp\left(-\frac{\tau}{\cos\theta}\right)$$

* **$I_0$**: Baseline extraterrestrial solar flux at Mars orbit ($\sim 590\text{ W/m}^2$).
* **$\tau$ (Tau)**: Atmospheric optical depth retrieved from PDS Pancam optical extinction measurements.
* **$\theta$**: Solar zenith angle.
* **Extinction during Sol 5111**: At peak $\tau = 10.8$, $99.998\%$ of incident sunlight was blocked ($1 - e^{-10.8}$), reducing daily solar power from $\sim 900\text{ Wh/sol}$ to a lethal $22\text{ Wh/sol}$.

### 2. Terrain Digital Elevation Mapping (DEM / DTM)
* **Dataset**: MRO HiRISE Stereo Digital Terrain Model (`ESP_032788_1775`).
* **Processing**: The 16-bit displacement data was processed into normalized 2D elevation grids and displacement maps, which are dynamically evaluated in Three.js vertex shaders to construct Endeavour Crater's ridge topology.

### 3. Subsystem Diagnostics & Geochemical Ingestion
* **Pancam (Panoramic Camera)**: Multispectral stereo imaging ($432\text{ nm} \to 1009\text{ nm}$).
* **Mini-TES (Thermal Emission Spectrometer)**: Thermal infrared spectral emissivity ($5\text{–}29\ \mu\text{m}$) detecting carbonate and olivine mineral signatures.
* **MIMOS II Mössbauer Spectrometer**: Fe-bearing mineral identification, confirming the discovery of **Jarosite** (proof of past liquid, acidic groundwater).
* **Alpha Particle X-Ray Spectrometer (APXS)**: Elemental chemistry of Martian surface rocks.
* **Rock Abrasion Tool (RAT)**: Diamond-infused resin grinding teeth data to reveal unweathered subsurface basalt.

---

## 🔗 Official Verification Links & References

1. **NASA Planetary Data System (PDS) Central**: [https://pds.nasa.gov/](https://pds.nasa.gov/)
2. **PDS Geosciences Node (MER Mission Archive)**: [https://pds-geosciences.wustl.edu/missions/mer/](https://pds-geosciences.wustl.edu/missions/mer/)
3. **NASA Mars Reconnaissance Orbiter HiRISE**: [https://www.uahirise.org/](https://www.uahirise.org/)
4. **NASA Lunar Reconnaissance Orbiter LOLA**: [https://lola.gsfc.nasa.gov/](https://lola.gsfc.nasa.gov/)
5. **NASA 3D Resources & Interactive Assets**: [https://nasa3d.arc.nasa.gov/](https://nasa3d.arc.nasa.gov/)
6. **NASA Mars Exploration Rovers Official Science Archive**: [https://mars.nasa.gov/mer/](https://mars.nasa.gov/mer/)
7. **NASA MER Analyst's Notebook (Washington University in St. Louis)**: [https://an.rsl.wustl.edu/mer/](https://an.rsl.wustl.edu/mer/)
8. **NASA Jet Propulsion Laboratory (JPL) Mars Science**: [https://www.jpl.nasa.gov/missions/mars-exploration-rover-opportunity-mer](https://www.jpl.nasa.gov/missions/mars-exploration-rover-opportunity-mer)

---

<p align="center">
  <b>Relics of the Red Dust: The Last Transmission</b><br>
  <i>Empowering open science, planetary archaeology, and STEM education through NASA Open Data.</i>
</p>
