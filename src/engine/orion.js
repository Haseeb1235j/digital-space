import { celestialObjects } from '../data/celestialObjects.js';

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function recommendation(mode, current) {
  const candidates = celestialObjects.filter((o) => o.id !== current.id);
  const map = {
    nearby: candidates.filter((o) => o.tags.includes('nearby')).sort((a,b)=>a.distanceLy-b.distanceLy),
    unknown: candidates.filter((o) => o.tags.includes('unknown')),
    important: candidates.filter((o) => o.tags.includes('important')),
    mysterious: candidates.filter((o) => o.tags.includes('mysterious')),
    extreme: candidates.filter((o) => o.tags.includes('extreme')),
    random: candidates,
  };
  return mode === 'nearby' ? (map.nearby[0] || candidates[0]) : pick(map[mode] || candidates);
}

export function orionReply(input, current) {
  const q = input.toLowerCase();
  if (q.includes('uncertain') || q.includes('unknown') || q.includes('sure')) {
    return `${current.name}: scientific confidence is ${current.confidence}. The main unresolved point is: ${current.questions[0]} This view is labeled “${current.rendering},” so it must not be mistaken for a direct photograph.`;
  }
  if (q.includes('how far') || q.includes('distance')) {
    return `${current.name} is shown at ${current.distanceLabel}. The journey uses compressed simulation time; the database value remains separate from the rendered travel distance.`;
  }
  if (q.includes('look') || q.includes('color') || q.includes('image') || q.includes('real')) {
    return `This scene uses ${current.rendering}. Its source mode is ${current.wavelength}. When instruments observe outside visible light, Digital Space uses representative color and labels it instead of claiming a human-eye view.`;
  }
  if (q.includes('why') || q.includes('important')) {
    return `${current.name} matters because ${current.facts.slice(0,2).join('. ')}. A related open question is: ${current.questions[0]}`;
  }
  const named = celestialObjects.find((o) => q.includes(o.name.toLowerCase()));
  if (q.includes('compare') && named && named.id !== current.id) {
    return `${current.name} is a ${current.class}; ${named.name} is a ${named.class}. Their displayed distances are ${current.distanceLabel} and ${named.distanceLabel}. Open both records for a responsible comparison—some values use different measurement methods.`;
  }
  return `${current.name} is classified as ${current.class}. ${current.facts[0]}. Ask me about distance, evidence, color, uncertainty, importance, or compare it with a named destination.`;
}
