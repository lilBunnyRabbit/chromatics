/**
 * RAL Classic — a curated subset of the catalogue with widely-published sRGB
 * approximations of the physical swatches. RAL Classic has no single official
 * colorimetric sRGB value (the swatches are physical paint chips), so these are
 * best-effort references — hence the parent model is `experimental`.
 */
export interface Swatch {
	code: string;
	name: string;
	hex: string;
}

export const RAL_CLASSIC: Swatch[] = [
	{ code: 'RAL 1003', name: 'Signal yellow', hex: '#F9A800' },
	{ code: 'RAL 1004', name: 'Golden yellow', hex: '#CDA434' },
	{ code: 'RAL 1007', name: 'Daffodil yellow', hex: '#E88C00' },
	{ code: 'RAL 1015', name: 'Light ivory', hex: '#E6D2B5' },
	{ code: 'RAL 1018', name: 'Zinc yellow', hex: '#F3DA0B' },
	{ code: 'RAL 1021', name: 'Colza yellow', hex: '#F6B600' },
	{ code: 'RAL 1023', name: 'Traffic yellow', hex: '#FAD201' },
	{ code: 'RAL 1028', name: 'Melon yellow', hex: '#FF9B00' },
	{ code: 'RAL 2002', name: 'Vermilion', hex: '#CB2821' },
	{ code: 'RAL 2003', name: 'Pastel orange', hex: '#FF7514' },
	{ code: 'RAL 2004', name: 'Pure orange', hex: '#E25303' },
	{ code: 'RAL 2008', name: 'Bright red orange', hex: '#ED6B21' },
	{ code: 'RAL 3000', name: 'Flame red', hex: '#AF2B1E' },
	{ code: 'RAL 3001', name: 'Signal red', hex: '#A52019' },
	{ code: 'RAL 3005', name: 'Wine red', hex: '#5E2129' },
	{ code: 'RAL 3020', name: 'Traffic red', hex: '#CC0605' },
	{ code: 'RAL 4005', name: 'Blue lilac', hex: '#6C4675' },
	{ code: 'RAL 4006', name: 'Traffic purple', hex: '#A03472' },
	{ code: 'RAL 4008', name: 'Signal violet', hex: '#924E7D' },
	{ code: 'RAL 5002', name: 'Ultramarine blue', hex: '#20214F' },
	{ code: 'RAL 5005', name: 'Signal blue', hex: '#1D1E33' },
	{ code: 'RAL 5010', name: 'Gentian blue', hex: '#0E294B' },
	{ code: 'RAL 5012', name: 'Light blue', hex: '#0089CF' },
	{ code: 'RAL 5015', name: 'Sky blue', hex: '#1761AB' },
	{ code: 'RAL 5017', name: 'Traffic blue', hex: '#063971' },
	{ code: 'RAL 6005', name: 'Moss green', hex: '#0F4336' },
	{ code: 'RAL 6018', name: 'Yellow green', hex: '#57A639' },
	{ code: 'RAL 6024', name: 'Traffic green', hex: '#308446' },
	{ code: 'RAL 6029', name: 'Mint green', hex: '#20603D' },
	{ code: 'RAL 7016', name: 'Anthracite grey', hex: '#293133' },
	{ code: 'RAL 7035', name: 'Light grey', hex: '#C5C7C4' },
	{ code: 'RAL 7045', name: 'Telegrey 1', hex: '#8F9695' },
	{ code: 'RAL 8002', name: 'Signal brown', hex: '#7B5141' },
	{ code: 'RAL 8017', name: 'Chocolate brown', hex: '#45322E' },
	{ code: 'RAL 9001', name: 'Cream', hex: '#EFEBDC' },
	{ code: 'RAL 9003', name: 'Signal white', hex: '#ECECE7' },
	{ code: 'RAL 9004', name: 'Signal black', hex: '#282828' },
	{ code: 'RAL 9005', name: 'Jet black', hex: '#0A0A0A' },
	{ code: 'RAL 9006', name: 'White aluminium', hex: '#A5A5A5' },
	{ code: 'RAL 9007', name: 'Grey aluminium', hex: '#8F8F8F' },
	{ code: 'RAL 9010', name: 'Pure white', hex: '#F7F9EF' },
	{ code: 'RAL 9011', name: 'Graphite black', hex: '#1C1C1C' },
	{ code: 'RAL 9016', name: 'Traffic white', hex: '#F1F1EA' },
	{ code: 'RAL 9017', name: 'Traffic black', hex: '#1E1E1E' }
];
