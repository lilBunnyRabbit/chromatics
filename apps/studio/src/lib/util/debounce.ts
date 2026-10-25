/** Trailing debounce: runs `fn` once `wait` ms have passed without a new call. */
export interface Debounced<A extends unknown[]> {
	(...args: A): void;
	/** Run the pending call now (if any) and clear the timer. */
	flush(): void;
	/** Drop the pending call without running it. */
	cancel(): void;
	/** Whether a call is currently scheduled. */
	pending(): boolean;
}

export function debounce<A extends unknown[]>(
	fn: (...args: A) => void,
	wait: number
): Debounced<A> {
	let timer: ReturnType<typeof setTimeout> | null = null;
	let queued: A | null = null;

	const run = () => {
		timer = null;
		if (!queued) return;
		const args = queued;
		queued = null;
		fn(...args);
	};

	const debounced = ((...args: A) => {
		queued = args;
		if (timer) clearTimeout(timer);
		timer = setTimeout(run, wait);
	}) as Debounced<A>;

	debounced.flush = () => {
		if (timer) clearTimeout(timer);
		run();
	};
	debounced.cancel = () => {
		if (timer) clearTimeout(timer);
		timer = null;
		queued = null;
	};
	debounced.pending = () => timer !== null;

	return debounced;
}
