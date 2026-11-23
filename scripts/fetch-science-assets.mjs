import { mkdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const assets = [
  {
    file: 'earth-blue-marble.jpg',
    source: 'NASA Scientific Visualization Studio — Blue Marble',
    url: 'https://assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/images/bmng/bmng-base/january/world.200401.3x5400x2700.jpg?w=5400&h=2700&fit=clip&crop=faces%2Cfocalpoint',
  },
  {
    file: 'moon-lro-color.jpg',
    source: 'NASA SVS / Lunar Reconnaissance Orbiter',
    url: 'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg',
  },
  {
    file: 'moon-lro-height.jpg',
    source: 'NASA SVS / Lunar Reconnaissance Orbiter LOLA',
    url: 'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_3_8bit.jpg',
  },
  {
    file: 'mars-viking-global.jpg',
    source: 'USGS Astrogeology / Viking MDIM 2.1',
    url: 'https://astrogeology.usgs.gov/ckan/dataset/7131d503-cdc9-45a5-8f83-5126c0fd397e/resource/5ea881c6-01b3-41fa-a7af-42d2131b54f1/download/mars_viking_mdim21_clrmosaic_1km.jpg',
  },
  {
    file: 'jupiter-cassini.jpg',
    source: 'NASA/JPL-Caltech/SSI — Cassini Jupiter map',
    url: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/09/p/PIA07782.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1801&w=3601',
  },
  {
    file: 'europa-galileo.jpg',
    source: 'USGS Astrogeology / Voyager and Galileo SSI',
    url: 'https://astrogeology.usgs.gov/ckan/dataset/4080036f-afc5-422e-abe9-1c0c8e4f98ea/resource/3647e7b3-425e-4dcf-951b-cc4a22fb0129/download/europa_voyager_galileossi_global_mosaic_500m_1024.jpg',
  },
  {
    file: 'pluto-new-horizons.jpg',
    source: 'USGS Astrogeology / New Horizons LORRI and MVIC',
    url: 'https://astrogeology.usgs.gov/ckan/dataset/a5f1b7f4-9822-4697-a201-e23ef4bd3e16/resource/96be2aa1-f384-4a9f-9458-a8431a0e7956/download/pluto_newhorizons_global_mosaic_300m_jul2017_1024.jpg',
  },
  {
    file: 'milky-way-sky.jpg',
    source: 'NASA SVS / Gaia and ground-based all-sky imagery',
    url: 'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004851/milkyway_2020_4k_print.jpg',
  },
  {
    file: 'orion-hubble.jpg',
    source: 'NASA/ESA Hubble Space Telescope — Orion Nebula',
    url: 'https://svs.gsfc.nasa.gov/vis/a030000/a030900/a030959/STScI-H-Orion_VIS_1920x1080.png',
  },
  {
    file: 'crab-multiwavelength.jpg',
    source: 'NASA/ESA Hubble and partner observatories — Crab Nebula composite',
    url: 'https://svs.gsfc.nasa.gov/vis/a030000/a030900/a030944/STScI-H-CrabNebula_combined_1920x1080.png',
  },
  {
    file: 'andromeda-hubble.jpg',
    source: 'NASA/ESA Hubble Space Telescope — Andromeda Galaxy',
    url: 'https://svs.gsfc.nasa.gov/vis/a030000/a030900/a030990/STScI-J-Andromeda_VIS-1920x1080.png',
  },
];

const targetDirectory = path.resolve('public', 'textures');
await mkdir(targetDirectory, { recursive: true });

async function isCached(target) {
  try {
    return (await stat(target)).size > 10_000;
  } catch {
    return false;
  }
}

async function download(asset) {
  const target = path.join(targetDirectory, asset.file);
  const temporary = `${target}.download`;
  if (await isCached(target)) {
    console.log(`  cached   ${asset.file}`);
    return true;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetch(asset.url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'image/avif,image/webp,image/png,image/jpeg,*/*',
        'User-Agent': 'Digital-Space/1.1 scientific-asset-cache',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 10_000) throw new Error('response was not a usable image');
    await writeFile(temporary, bytes);
    await rename(temporary, target);
    console.log(`  received ${asset.file} — ${asset.source}`);
    return true;
  } catch (error) {
    await unlink(temporary).catch(() => {});
    console.warn(`  fallback ${asset.file} — ${error.message}`);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

console.log('\nChecking official scientific image cache...');
const results = await Promise.all(assets.map(download));
const received = results.filter(Boolean).length;
console.log(`Scientific assets ready: ${received}/${assets.length}.`);
if (received < assets.length) {
  console.log('Missing files will use the built-in procedural fallback and be retried next launch.\n');
}
