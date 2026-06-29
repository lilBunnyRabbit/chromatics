/**
 * First-run welcome flag in localStorage (client-only; guarded). Documents and
 * autosave now live in persistence/documents.ts; share-links in url-hash.ts.
 */
const WELCOMED = 'chromatics:welcomed';

function safe<T>(fn: () => T, fallback: T): T {
	try {
		if (typeof localStorage === 'undefined') return fallback;
		return fn();
	} catch {
		return fallback;
	}
}

/**
 * First-run flag for the welcome showcase. Defaults to "already welcomed" when
 * storage is unavailable (SSR / privacy mode) so the modal never auto-pops in a
 * context where we can't persist the dismissal.
 */
export function hasWelcomed(): boolean {
	return safe(() => localStorage.getItem(WELCOMED) === '1', true);
}
export function markWelcomed(): void {
	safe(() => localStorage.setItem(WELCOMED, '1'), undefined);
}
