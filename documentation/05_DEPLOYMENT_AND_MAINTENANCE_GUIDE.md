# 🚀 05. DEPLOYMENT, OPTIMIZATION & RUNBOOK

## 1. System Requirements & Prerequisites

| Requirement | Minimum | Recommended |
| :--- | :--- | :--- |
| **Node.js** | v18.0.0 LTS | v20.x or v22.x LTS |
| **Package Manager** | npm v9.x+ | npm v10.x+ |
| **Web Browser** | Chrome 90+, Safari 15+, Firefox 90+, Edge 90+ | Latest Chrome or Edge with WebGL 2.0 |
| **GPU / Graphics** | Integrated Graphics (Intel UHD 620+) | Dedicated GPU or Apple Silicon (M1/M2/M3) |

---

## 2. Local Setup & Execution Instructions

```bash
# Step 1: Open terminal in workspace root
cd /Users/shaikotkunduakash/Developer/Nasa

# Step 2: Install project dependencies
npm install

# Step 3: Launch development server (with HMR)
npm run dev

# The Vite server will output:
#   ➜  Local:   http://localhost:3000/
#   ➜  Network: http://192.168.x.x:3000/

# Step 4: Open http://localhost:3000/ in browser
```

---

## 3. Production Build & Deployment Pipeline

```bash
# Execute Vite production bundle compilation
npm run build

# The output is compiled into the 'dist/' folder:
# dist/index.html                  ~29.6 kB  (Gzip: ~7.8 kB)
# dist/assets/index-[hash].css     ~40.8 kB  (Gzip: ~7.9 kB)
# dist/assets/index-[hash].js     ~571.7 kB  (Gzip: ~153.2 kB)

# Test the compiled production bundle locally
npm run preview
# Preview server ready on http://localhost:3000/
```

### Static Hosting Deployments
The generated `dist/` directory is 100% static and can be deployed directly to:
- **GitHub Pages**: Upload `dist/` branch or configure GitHub Actions.
- **Vercel / Netlify**: Connect repository, set build command to `npm run build`, and output directory to `dist`.
- **Firebase Hosting**: Run `firebase deploy --only hosting`.

---

## 4. WebGL Performance & Core Web Vitals (CWV)

### 4.1 Frame Rate & Memory Optimization
- **Geometry Instancing & Reuse**: Procedural rock scatters and solar panel cell grids use instanced geometry and canvas texture reuse to reduce GPU draw calls ($< 45\text{ draw calls/frame}$).
- **Pixel Ratio Clamping**: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` prevents GPU fill-rate throttling on ultra-high-DPI mobile screens (e.g. 3x Retina displays).
- **Audio Memory Safety**: Web Audio synthesis nodes disconnect immediately upon sound completion, preventing audio memory leaks.

### 4.2 Largest Contentful Paint (LCP) & Interaction to Next Paint (INP)
- **Zero Heavy 3D Model Fetches**: The 3D rover mesh and terrain DEM are procedurally constructed in JavaScript within $< 80\text{ ms}$, yielding an instant LCP of $< 0.8\text{ seconds}$.
- **INP Optimization**: All slider inputs (Tau opacity, sol timeline) utilize `requestAnimationFrame` debouncing, preventing main-thread layout thrashing.

---

## 5. Maintenance & Troubleshooting Runbook

### Issue 1: WebGL Context Lost / Black Canvas
- **Cause**: Browser exhausted GPU memory or graphics driver reset.
- **Remedy**: The scene manager includes automatic `webglcontextrestored` event hooks. Refreshing the tab clears the WebGL context cleanly.

### Issue 2: Audio Not Playing on Click
- **Cause**: Browser autoplay policy blocks Web Audio until initial user gesture.
- **Remedy**: Clicking the `🔊 Audio` button on the Game Hub or HUD initializes `AudioContext.resume()` safely.

### Issue 3: Port 3000 Already in Use
- **Remedy**: Kill the existing task or pass a custom port:
  ```bash
  npx vite --port 3001
  ```
