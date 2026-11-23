# Digital Space

Digital Space is a full-screen, interactive scientific universe explorer built with React, Three.js, WebGL shaders and a structured astronomical catalog.

The project separates three things that space visualizations often blur together:

- catalog values, coordinates and scientific claims;
- compressed display scale and simulated travel time;
- visual reconstruction, representative-color imagery and procedural fallback rendering.

## Run locally

Requirements: Node.js 20 or newer.

### Windows one-click start

1. Extract the ZIP file.
2. Open the extracted `Digital-Space` folder.
3. Double-click `START-DIGITAL-SPACE.bat`.
4. Keep the command window open while using the application.

The launcher installs dependencies, loads the bundled scientific imagery, starts the local server and opens `http://127.0.0.1:5173` only after the server answers successfully. It does not wait on an external image server.

### Terminal start

```bash
npm install
node scripts/fetch-science-assets.mjs
npm run dev
```

The optional asset command tries to cache additional source imagery. The application does not require it: every object family now has an offline, category-specific scientific renderer, and core NASA maps are bundled.

Open the local URL printed by Vite, normally `http://localhost:5173`.

For a production build:

```bash
npm run build
npm run preview
```

## Included systems

- Object-specific WebGL rendering families for rocky worlds, gas giants, stars, pulsars, magnetars, black holes, quasars, nebulae, remnants, galaxies, clusters, voids, cosmic filaments and the observable-universe context.
- Bundled scientific image maps for Earth, the Moon, Mars, Jupiter and Saturn, plus optional mission-map caching for Europa and Pluto, with separate relief/atmosphere/cloud treatment where appropriate.
- A data-backed Milky Way all-sky environment and bundled NASA observation-image layers for Orion, the multiwavelength Crab Nebula and Andromeda.
- Structured scientific records with evidence state, confidence, unresolved questions, observation wavelength, missions and source attribution.
- Logarithmic scale navigation from surface to observable-universe context.
- Gradual target lock, acceleration, cruise, scale transition, deceleration and approach travel phases.
- Search, category discovery, nearby scanning, random discovery, mystery/importance/extreme discovery and mission-style guided routes.
- ORION, a local catalog-grounded guide that answers from the current record and explicitly discusses uncertainty and visualization mode.
- Object comparison, saved destinations, visit history and return-to-Earth controls.
- Desktop and mobile layouts, three rendering quality levels, reduced-motion and high-contrast modes.
- Scientifically constrained, object-specific offline renderers; a failed source download never leaves an object blank or reduces every planet to one generic shader.

## Scientific responsibility

The interactive geometry is a visualization, not a direct photograph. Mapped Solar System bodies use cited mission mosaics. Every record states its observation wavelength and rendering method. Exoplanet surfaces, subsurface oceans, distant 3D nebula structure, black-hole lensing, galaxy interiors and cosmic-web volumes necessarily include model-based or conceptual elements. The UI labels those cases instead of presenting them as observed detail.

See [SCIENTIFIC_SOURCES.md](./SCIENTIFIC_SOURCES.md) for the source and rendering policy.

## Architecture

```text
src/
  components/        Canvas renderers and interactive interface
  data/              Scientific object records and source registry
  engine/            Scale, travel, coordinate and ORION logic
  App.jsx             Application state and system orchestration
```

New objects are added as structured records in `src/data/celestialObjects.js`. The renderer selects a category-specific visual family and falls back to a non-empty scientific procedural representation.
