import { useEffect, useState } from 'react';
import * as THREE from 'three';

export const SCIENCE_TEXTURES = {
  earth: '/textures/earth-blue-marble.jpg',
  moon: '/textures/moon-lro-color.jpg',
  moonHeight: '/textures/moon-lro-height.jpg',
  mars: '/textures/mars-viking-global.jpg',
  jupiter: '/textures/jupiter-cassini.jpg',
  saturn: '/textures/saturn-nasa-derived.jpg',
  europa: '/textures/europa-galileo.jpg',
  pluto: '/textures/pluto-new-horizons.jpg',
  milkyWay: '/textures/milky-way-sky.jpg',
  orion: '/textures/orion-hubble.jpg',
  crab: '/textures/crab-multiwavelength.jpg',
  andromeda: '/textures/andromeda-hubble.jpg',
};

export const OBJECT_TEXTURES = {
  earth: SCIENCE_TEXTURES.earth,
  moon: SCIENCE_TEXTURES.moon,
  mars: SCIENCE_TEXTURES.mars,
  jupiter: SCIENCE_TEXTURES.jupiter,
  saturn: SCIENCE_TEXTURES.saturn,
  europa: SCIENCE_TEXTURES.europa,
  pluto: SCIENCE_TEXTURES.pluto,
};

export function useScienceTexture(path, colorTexture = true) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!path) {
      setTexture(null);
      return undefined;
    }

    let active = true;
    let loadedTexture;
    const loader = new THREE.TextureLoader();
    loader.load(
      path,
      (nextTexture) => {
        loadedTexture = nextTexture;
        nextTexture.colorSpace = colorTexture ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        nextTexture.wrapS = THREE.RepeatWrapping;
        nextTexture.wrapT = THREE.ClampToEdgeWrapping;
        nextTexture.anisotropy = 8;
        nextTexture.needsUpdate = true;
        if (active) setTexture(nextTexture);
        else nextTexture.dispose();
      },
      undefined,
      () => {
        if (active) setTexture(null);
      },
    );

    return () => {
      active = false;
      if (loadedTexture) loadedTexture.dispose();
    };
  }, [path, colorTexture]);

  return texture;
}
