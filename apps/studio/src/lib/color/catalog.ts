import type { Channel, ColorModel } from '@lilbunnyrabbit/chromatics';
import { MODEL_CLASSES } from '@lilbunnyrabbit/chromatics-dsl';

export type Family =
	| 'perceptual'
	| 'lab'
	| 'hue'
	| 'rgb'
	| 'video'
	| 'tristimulus'
	| 'subtractive'
	| 'appearance';

export interface ChannelInfo extends Channel {
	name: string;
}

export interface ModelInfo {
	name: string;
	model: ColorModel;
	id: string;
	label: string;
	family: Family;
	channels: ChannelInfo[];
}

const META: Record<string, [label: string, family: Family]> = {
	Xyz65: ['CIE XYZ (D65)', 'tristimulus'],
	Xyz50: ['CIE XYZ (D50)', 'tristimulus'],
	LinearSrgb: ['Linear sRGB', 'rgb'],
	Srgb: ['sRGB', 'rgb'],
	Srgb8: ['sRGB (8-bit)', 'rgb'],
	DisplayP3: ['Display P3', 'rgb'],
	LinearDisplayP3: ['Linear Display P3', 'rgb'],
	A98Rgb: ['Adobe RGB (1998)', 'rgb'],
	ProphotoRgb: ['ProPhoto RGB', 'rgb'],
	Rec2020: ['Rec. 2020', 'rgb'],
	Rec2100Pq: ['Rec. 2100 PQ', 'rgb'],
	Rec2100Hlg: ['Rec. 2100 HLG', 'rgb'],
	SmpteC: ['SMPTE-C', 'rgb'],
	Aces2065: ['ACES2065-1 (AP0)', 'rgb'],
	Acescg: ['ACEScg (AP1)', 'rgb'],
	Acescc: ['ACEScc', 'rgb'],
	Acescct: ['ACEScct', 'rgb'],
	Ycbcr601: ['YCbCr (BT.601)', 'video'],
	Ycbcr709: ['YCbCr (BT.709)', 'video'],
	Ycbcr2020: ['YCbCr (BT.2020)', 'video'],
	Yiq: ['YIQ (NTSC)', 'video'],
	Yuv: ['YUV (PAL)', 'video'],
	Ydbdr: ['YDbDr (SECAM)', 'video'],
	Ycgco: ['YCgCo', 'video'],
	Oklab: ['Oklab', 'lab'],
	Oklch: ['OKLCH', 'perceptual'],
	Okhsl: ['Okhsl', 'perceptual'],
	Okhsv: ['Okhsv', 'perceptual'],
	Lab: ['CIE Lab (D50)', 'lab'],
	Lch: ['CIE LCh (D50)', 'perceptual'],
	Lab65: ['CIE Lab (D65)', 'lab'],
	Lch65: ['CIE LCh (D65)', 'perceptual'],
	Luv65: ['CIE Luv (D65)', 'lab'],
	Luv50: ['CIE Luv (D50)', 'lab'],
	Lchuv65: ['CIE LCh(uv) (D65)', 'perceptual'],
	Lchuv50: ['CIE LCh(uv) (D50)', 'perceptual'],
	Hsluv: ['HSLuv', 'perceptual'],
	Hpluv: ['HPLuv', 'perceptual'],
	Hsl: ['HSL', 'hue'],
	Hsv: ['HSV', 'hue'],
	Hwb: ['HWB', 'hue'],
	Hsi: ['HSI', 'hue'],
	Hsp: ['HSP', 'hue'],
	Cubehelix: ['Cubehelix', 'hue'],
	Tsl: ['TSL', 'hue'],
	Cmy: ['CMY', 'subtractive'],
	Cmyk: ['CMYK', 'subtractive'],
	Ryb: ['RYB', 'subtractive'],
	Jzazbz: ['JzAzBz', 'lab'],
	Jzczhz: ['JzCzHz', 'perceptual'],
	Ictcp: ['ICtCp (PQ)', 'lab'],
	IctcpHlg: ['ICtCp (HLG)', 'lab'],
	Cam16: ['CAM16', 'appearance'],
	Cam16Ucs: ['CAM16-UCS', 'appearance'],
	Cam16Lcd: ['CAM16-LCD', 'appearance'],
	Cam16Scd: ['CAM16-SCD', 'appearance'],
	Ciecam02: ['CIECAM02', 'appearance'],
	Hct: ['HCT (Material)', 'appearance'],
	Xyy: ['CIE xyY', 'tristimulus'],
	Uvy76: ["CIE 1976 u'v'Y", 'tristimulus'],
	Uvy60: ['CIE 1960 uvY', 'tristimulus'],
	Uvw64: ['CIE 1964 U*V*W*', 'tristimulus'],
	Lms: ['LMS (cone)', 'tristimulus'],
	Ipt: ['IPT', 'lab'],
	HunterLab: ['Hunter Lab', 'lab'],
	Din99: ['DIN99', 'lab'],
	Din99Lch: ['DIN99 LCh', 'perceptual'],
	Din99o: ['DIN99o', 'lab'],
	Din99oLch: ['DIN99o LCh', 'perceptual'],
	Xyb: ['XYB (JPEG XL)', 'tristimulus']
};

export const CATALOG: readonly ModelInfo[] = MODEL_CLASSES.map(([name, model]) => {
	const meta = META[name];
	if (!meta) throw new Error(`catalog: no label for ${name}`);
	return {
		name,
		model,
		id: model.id,
		label: meta[0],
		family: meta[1],
		channels: Object.entries(model.channels).map(([n, ch]) => ({ name: n, ...ch }))
	};
});

const BY_MODEL = new Map<unknown, ModelInfo>(CATALOG.map((m) => [m.model, m]));
const BY_NAME = new Map<string, ModelInfo>(CATALOG.map((m) => [m.name, m]));

export function infoOf(model: ColorModel): ModelInfo {
	const info = BY_MODEL.get(model);
	if (!info) throw new Error(`catalog: unknown model ${model.id}`);
	return info;
}

export function infoByName(name: string): ModelInfo | undefined {
	return BY_NAME.get(name);
}
