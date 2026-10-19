import type { ColorModel } from './core/model.js';

/** Every model the package ships, for listings and graph queries. Importing it bundles all of them. */
export const models: readonly ColorModel[] = [];

export { path, reachable } from './core/router.js';
