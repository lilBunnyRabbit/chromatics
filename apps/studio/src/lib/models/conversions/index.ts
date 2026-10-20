/**
 * Direct model-to-model conversion edges. Importing this barrel registers every
 * edge as a side effect (`registerEdge`). Each edge bypasses culori's RGB hub
 * for a specific pair; the BFS resolver in registry.ts composes them and falls
 * back to culori for pairs no edge covers. Grow this set per the redesign plan.
 */
import './hue';
