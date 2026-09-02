import { seededRandom } from './progression';

const seedParam = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('seed');
const parsedSeed = seedParam === null ? Number.NaN : Number(seedParam);

/** Add ?seed=123 to a game URL to reproduce challenge and event selection. */
export const gameRandom: () => number = Number.isFinite(parsedSeed) ? seededRandom(parsedSeed) : Math.random;
