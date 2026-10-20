/**
 * Open/closed state for the first-run welcome showcase (see
 * src/lib/components/Welcome.svelte). The modal is rendered once globally in
 * +layout.svelte and auto-opens on a visitor's first visit; any chrome can
 * re-open it by setting `welcome.open = true`. Whether it has been seen is
 * tracked separately in localStorage (see persistence/local-storage.ts).
 */
export class WelcomeStore {
	open = $state(false);
}

export const welcome = new WelcomeStore();
