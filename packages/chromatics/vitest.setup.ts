import fc from 'fast-check';

// ADR-008: a fixed seed in CI keeps property runs reproducible; locally each run explores new inputs.
const seed = process.env.FC_SEED ?? (process.env.CI ? '42' : undefined);
fc.configureGlobal({ numRuns: 1000, ...(seed === undefined ? {} : { seed: Number(seed) }) });
