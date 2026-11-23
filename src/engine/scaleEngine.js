import { scaleLevels } from '../data/celestialObjects.js';

export const LIGHT_YEAR_KM = 9.4607304725808e12;

export function scaleForDistance(distanceLy = 0) {
  return scaleLevels.find((level) => distanceLy <= level.maxLy) ?? scaleLevels.at(-1);
}

export function compressedDistance(distanceLy = 0) {
  if (distanceLy <= 0) return 0;
  return Math.log10(1 + distanceLy * 1e6) * 2.1;
}

export function scientificPosition(object) {
  const d = compressedDistance(object.distanceLy);
  const hash = [...object.id].reduce((n, c) => n + c.charCodeAt(0) * 0.017, 0);
  return [Math.cos(hash) * d, Math.sin(hash * 0.71) * d * 0.55, Math.sin(hash) * d];
}

export function travelDuration(distanceLy, reducedMotion = false) {
  if (reducedMotion) return 900;
  const log = Math.log10(Math.max(distanceLy, 1e-10) + 1e-10) + 10;
  return Math.min(11500, Math.max(4600, 3800 + log * 520));
}

export function travelPhase(progress) {
  if (progress < 0.08) return 'TARGET LOCK';
  if (progress < 0.24) return 'ACCELERATION';
  if (progress < 0.69) return 'CRUISE · TIME COMPRESSION ACTIVE';
  if (progress < 0.87) return 'SCALE TRANSITION';
  if (progress < 0.97) return 'DECELERATION';
  return 'FINAL APPROACH';
}

export function displaySpeed(progress, distanceLy) {
  const bell = Math.sin(Math.PI * Math.min(1, progress));
  const lightYearsPerSecond = Math.max(0.001, distanceLy / 4.5) * bell;
  if (distanceLy < 1e-4) return `${Math.round(20 + bell * 180)} km/s SIM`;
  if (lightYearsPerSecond < 1) return `${(lightYearsPerSecond * 365.25).toFixed(2)} light-days/s SIM`;
  return `${lightYearsPerSecond.toFixed(lightYearsPerSecond > 100 ? 0 : 2)} ly/s SIM`;
}

export function remainingDistance(object, progress) {
  const remaining = Math.max(0, object.distanceLy * (1 - progress));
  if (remaining < 1e-8) return `${Math.round(remaining * LIGHT_YEAR_KM).toLocaleString()} km`;
  if (remaining < 0.01) return `${(remaining * LIGHT_YEAR_KM / 1.496e8).toFixed(2)} AU`;
  if (remaining < 1000) return `${remaining.toFixed(2)} ly`;
  if (remaining < 1e6) return `${(remaining / 1000).toFixed(2)} kly`;
  if (remaining < 1e9) return `${(remaining / 1e6).toFixed(2)} Mly`;
  return `${(remaining / 1e9).toFixed(2)} Gly`;
}
