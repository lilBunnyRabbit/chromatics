import { name as overviewName, source as overviewSource } from './overview';
import { name as showcaseName, source as showcaseSource } from './showcase';
import { name as previewsName, source as previewsSource } from './previews';
import { name as simpleName, source as simpleSource } from './simple';
import { name as conversionsName, source as conversionsSource } from './conversions';
import { name as dynamicName, source as dynamicSource } from './dynamic-theme';
import { name as designSystemName, source as designSystemSource } from './design-system';
import { name as microsaasName, source as microsaasSource } from './microsaas';
import {
	name as microsaasEnforcedName,
	source as microsaasEnforcedSource
} from './microsaas-enforced';
import { name as brandDarkName, source as brandDarkSource } from './brand-dark';

export interface Example {
	name: string;
	source: string;
}

/** Ordered list of editor examples. First entry is the default on load. */
export const examples: Example[] = [
	{ name: overviewName, source: overviewSource },
	{ name: simpleName, source: simpleSource },
	{ name: conversionsName, source: conversionsSource },
	{ name: showcaseName, source: showcaseSource },
	{ name: previewsName, source: previewsSource },
	{ name: designSystemName, source: designSystemSource },
	{ name: microsaasName, source: microsaasSource },
	{ name: microsaasEnforcedName, source: microsaasEnforcedSource },
	{ name: brandDarkName, source: brandDarkSource },
	{ name: dynamicName, source: dynamicSource }
];
