/**
 * Barrel for the extended custom culori modes. Importing this registers every
 * extra space (side effect) with culori's converter graph. Must load before any
 * converter for these modes is built — registry.ts imports it at the top.
 */
import './xyz-derived';
import './rgb-working';
import './video';
import './hue';
import './cam';
import './extra';
