/**
 * Named color systems (catalogs). These are swatch lookups, not algorithms.
 *
 *  - RAL Classic ships a real (experimental) nearest-swatch search over an
 *    embedded subset, since its values are publicly approximated.
 *  - The licensed / proprietary books (Pantone, NCS, Munsell, HKS, DIC, Toyo,
 *    Copic, Trumatch) have no openly-distributable dataset, so they advertise
 *    their lookups but are `coming-soon` (throw an actionable error on use).
 */
import {
	register,
	defineModel,
	parse,
	toMode,
	differenceCiede2000,
	type CuloriColor
} from '../registry';
import { ColorValue } from '../value';
import { method, unbacked } from '../util';
import { RAL_CLASSIC, type Swatch } from './data/ral-classic';

const deltaE = differenceCiede2000();

/** Register a swatch-backed system with a real nearest()/code()/name(). */
function catalogSystem(id: string, label: string, swatches: Swatch[]) {
	// Pre-project every swatch to Lab once for the ΔE search.
	const labs = swatches.map((s) => toMode('lab')(parse(s.hex) as CuloriColor));

	function nearest(self: ColorValue): Swatch {
		const here = self.project('lab');
		let best = swatches[0];
		let bestD = Infinity;
		for (let i = 0; i < swatches.length; i++) {
			const d = deltaE(here, labs[i]);
			if (d < bestD) {
				bestD = d;
				best = swatches[i];
			}
		}
		return best;
	}

	register(
		defineModel({
			id,
			label,
			family: 'system',
			status: 'experimental',
			ownMethods: [
				method('nearest', [], 'color', `Closest ${label} swatch (ΔE2000)`, (self) =>
					ColorValue.from(parse(nearest(self).hex) as CuloriColor)
				),
				method(
					'code',
					[],
					'string',
					`${label} code of the nearest swatch`,
					(self) => nearest(self).code
				),
				method(
					'name',
					[],
					'string',
					`${label} name of the nearest swatch`,
					(self) => nearest(self).name
				),
				method('deltaE', [], 'number', `ΔE2000 to the nearest ${label} swatch`, (self) =>
					deltaE(self.project('lab'), toMode('lab')(parse(nearest(self).hex) as CuloriColor))
				)
			]
		})
	);
}

/** Register an advertised-but-unimplemented system (needs a licensed dataset). */
function comingSoonSystem(id: string, label: string) {
	register(
		defineModel({
			id,
			label,
			family: 'system',
			status: 'coming-soon',
			ownMethods: [
				method('nearest', [], 'color', `Nearest ${label} swatch`, () => unbacked(label)),
				method('code', [], 'string', `${label} code / notation`, () => unbacked(label))
			]
		})
	);
}

// Real (experimental): publicly-approximated swatch book.
catalogSystem('ral', 'RAL Classic', RAL_CLASSIC);

// Coming soon: catalogs awaiting a dataset. The licensed books (Pantone, NCS,
// HKS, DIC, Toyo, …) can't be bundled; the public-domain ones (Munsell, Federal
// Standard 595, ISCC-NBS, Werner's, Copic) are obtainable and can be populated
// like RAL once their swatch tables are imported.
for (const [id, label] of [
	['pantone', 'Pantone (PMS)'],
	['munsell', 'Munsell'],
	['ncs', 'NCS'],
	['hks', 'HKS'],
	['copic', 'Copic'],
	['dic', 'DIC'],
	['toyo', 'Toyo'],
	['trumatch', 'Trumatch'],
	['ansi', 'ANSI'],
	['bs', 'British Standard (BS)'],
	['fedstd595', 'Federal Standard 595'],
	['iscc_nbs', 'ISCC–NBS'],
	['werner', "Werner's Nomenclature"],
	['din6164', 'DIN 6164'],
	['ostwald', 'Ostwald'],
	['pccs', 'PCCS'],
	['coloroid', 'Coloroid'],
	['cns', 'CNS'],
	['hexachrome', 'Hexachrome'],
	['focoltone', 'Focoltone'],
	['scotdic', 'SCOTDIC'],
	['as2700', 'AS 2700'],
	['anpa', 'ANPA'],
	['coloradd', 'ColorADD'],
	['colorindex', 'Colour Index International'],
	['iccprofile', 'ICC profile'],
	['isocie', 'ISO–CIE']
] as const) {
	comingSoonSystem(id, label);
}
