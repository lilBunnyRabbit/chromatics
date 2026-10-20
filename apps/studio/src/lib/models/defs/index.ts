/**
 * Barrel: importing this registers every model as a side effect. Order only
 * matters for flat-channel-key precedence (first registration wins).
 */
import './root';
import './oklch';
import './oklab';
import './hsl';
import './hsv';
import './hwb';
import './cielab';
import './cielch';
import './srgb';
import './linear-srgb';
import './display-p3';
import './xyz';
// Extra backed models (wide-gamut RGB, more perceptual / hue / video spaces).
import './rgb-wide';
import './perceptual-extra';
import './hue-extra';
import './video';
import './extra-backed'; // xyz50, xyb (culori-backed, stable)
// Experimental — real hand-rolled math via custom culori modes.
import './cmyk';
import './hct';
import './hsluv';
import './perceptual-xyz'; // xyY, UCS 1976/1960, UVW, Hunter Lab, IPT
import './rgb-working'; // ACES family, scRGB, SMPTE-C
import './video-extra'; // YPbPr, YCbCr, YUV, YDbDr, YCgCo, …, Rec.2100
import './hue-experimental'; // HSP, TSL, RYB
import './cam'; // CAM16, CAM16-UCS, CIECAM02
import './print-cone'; // CMY, LMS
import './coming-soon'; // conceptual / device-specific models (advertised, throw)
// Color systems — RAL real (experimental), the rest coming-soon.
import './systems';
// Direct conversion edges (graph that bypasses culori's RGB hub).
import '../conversions';
