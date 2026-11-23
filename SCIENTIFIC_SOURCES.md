# Scientific source and visualization policy

Research for Digital Space was completed before implementation using authoritative public science references. The application stores source attribution on every curated record and is designed so future API/cached-catalog adapters can add objects without changing the renderer or travel engine.

## Primary source systems

| Domain | Authoritative source | Use in Digital Space |
| --- | --- | --- |
| Solar-system positions and motion | [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) | Ephemeris architecture, orbital-motion and time-dependent-position policy |
| Asteroids, comets and uncertainties | [JPL Small-Body Database](https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html) | Small-body identity, class, orbit, physical parameters and uncertainty policy |
| Planets and moons | [NASA Solar System Exploration](https://science.nasa.gov/solar-system/) | Curated physical facts, missions, dimensions and compositions |
| Exoplanets | [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) | Planet/host measurements, discovery information and API expansion path |
| Stars and Milky Way astrometry | [ESA Gaia DR3](https://www.cosmos.esa.int/web/gaia/dr3) | Stellar coordinates, parallax/proper-motion model and scalable star-catalog path |
| Non-solar-system object identity | [SIMBAD](https://simbad.cds.unistra.fr/simbad/) | Coordinates, classifications, cross-identifications and bibliography model |
| Hubble/Webb archival observations | [STScI MAST](https://archive.stsci.edu/) | Multiwavelength observation and composite-image policy |
| Scientific visualization | [NASA Scientific Visualization Studio](https://svs.gsfc.nasa.gov/) | Data-backed visualization and disclosure conventions |
| Black-hole appearance | [NASA black-hole visualization notes](https://svs.gsfc.nasa.gov/14619/) | Qualitative light-bending, event-horizon/shadow distinction and explicit non-GR-ray-tracing label |
| Large-scale structure | [ESA Euclid](https://www.esa.int/Science_Exploration/Space_Science/Euclid) | 3D redshift-map and simulation/reconstruction policy for cosmic filaments and voids |
| Cosmic microwave background | [ESA Planck](https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_and_the_cosmic_microwave_background) | CMB epoch, 2.725 K context and observer-centered horizon policy |
| Color interpretation | [NASA: From Energy to Image](https://science.nasa.gov/ems/04_energytoimage/) | Visible, representative-color, false-color and multiwavelength labeling |

Important values in the seed catalog are cross-referenced between a mission/science page and a catalog/database where appropriate. The application is not a replacement for precision ephemeris or research-catalog queries.

## Locally cached observation imagery

Core authoritative products are bundled in `public/textures`; `npm run assets` can cache additional products. They are served from localhost, never hot-linked during exploration, and every category has a distinct procedural fallback.

| Rendered target | Image product | Interpretation |
| --- | --- | --- |
| Earth | [NASA SVS Blue Marble](https://svs.gsfc.nasa.gov/3615/) | Cloud-free global surface composite; a separate simulated cloud shell is disclosed by the renderer |
| Moon | [Solar System Scope textures](https://www.solarsystemscope.com/textures/) | NASA-derived global surface map, distributed under CC BY 4.0; local relief enhancement is simulated |
| Mars | [Solar System Scope textures](https://www.solarsystemscope.com/textures/) | NASA/Viking-derived global surface map, distributed under CC BY 4.0 |
| Jupiter | [NASA/JPL Cassini cylindrical map](https://science.nasa.gov/resource/cassinis-best-maps-of-jupiter-cylindrical-map/) | Cylindrical global mosaic from Cassini observations |
| Saturn | [Solar System Scope textures](https://www.solarsystemscope.com/textures/) | NASA/Cassini-derived global band map, distributed under CC BY 4.0; ring gaps are simulated from observed structure |
| Europa | [USGS Voyager–Galileo global mosaic](https://astrogeology.usgs.gov/search/map/europa_voyager_galileo_ssi_global_mosaic_500m) | Combined Voyager and Galileo SSI surface mosaic |
| Pluto | [USGS New Horizons global mosaic](https://astrogeology.usgs.gov/search/map/pluto_new_horizons_lorri_mvic_global_mosaic_300m) | LORRI/MVIC global mosaic; unresolved areas remain limited by mission coverage |
| All-sky background | [Solar System Scope textures](https://www.solarsystemscope.com/textures/) | NASA-derived Milky Way/star environment, distributed under CC BY 4.0; brightness is exposure-compressed |
| Orion Nebula | [NASA/ESA Hubble panoramic observation](https://science.nasa.gov/asset/hubble/hubbles-sharpest-view-of-the-orion-nebula/) | Hubble visible-light mosaic projected at its native square aspect behind a constrained 3D particle interpretation |
| Crab Nebula | [NASA multiwavelength Crab observation](https://science.nasa.gov/asset/hubble/crab-nebula-in-multiple-wavelengths/) | VLA radio, Spitzer infrared, Hubble visible, XMM ultraviolet and Chandra X-ray composite; colors do not represent unaided human vision |
| Andromeda Galaxy | [NASA/ESA Hubble M31 resolved-disk mosaic](https://science.nasa.gov/image-detail/m31-2/) | Hubble observation of a resolved disk section, kept at its native wide aspect and layered with a statistical whole-galaxy stellar model |

## Rendering decisions

- Rocky bodies use rough, non-metallic displaced or noise-constrained surfaces. A procedurally generated unresolved surface is labeled conceptual when no resolved map exists.
- Earth, the Moon, Mars, Jupiter, Saturn, Europa and Pluto prefer mission-derived or NASA-derived global maps; procedural geography/materials are used only when those files cannot be cached.
- Gas giants use mission imagery where a supported global product exists, otherwise latitude-dominant constrained band fields, separate atmospheres and category-specific storm contrast.
- Saturn's rings use a continuous translucent density field with the Cassini Division and Encke Gap instead of a solid decorative disk.
- Stars use animated photospheric granulation and exposure-compressed corona layers. Apparent brightness is not a literal eye-safe exposure.
- Pulsars and magnetars use compact neutron-star bodies plus illustrative rotating beam/magnetic structures; those structures are explicitly conceptual.
- Black holes use a dark shadow, photon-ring cue and warped accretion-flow treatment. The app labels this as qualitative and does not claim full general-relativistic ray tracing.
- Nebulae and supernova remnants use depth-layered emissive particles and volumes. Their third dimension is constrained simulation because most telescope images are projected 2D measurements.
- Galaxies use class-specific stellar-density distributions; unseen sides and individual stellar positions are statistical.
- Clusters, voids, walls and the cosmic web use redshift-survey-inspired statistical volumes. Boundaries are model- and definition-dependent.
- The observable-universe scene is observer-centered and does not pretend to show the universe from outside. Its horizon is not presented as a physical wall.

## Scale policy

Physical values remain in each object record. Display coordinates use logarithmic compression because no single linear scene can simultaneously resolve kilometres and tens of billions of light-years. Travel uses compressed simulation time and continually displays the real catalog distance separately. Approaching a destination increases scene detail and changes the observation context without altering the database value.

## Evidence labels

Records distinguish observed measurements, calculated/inferred values, consensus, active uncertainty and conceptual simulation. The app avoids inventing surfaces or atmospheres for unresolved exoplanets and avoids showing theoretical entities as confirmed observations.
