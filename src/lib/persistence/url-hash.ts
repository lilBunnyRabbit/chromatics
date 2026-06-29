/**
 * Share-link round-trip: the source text encoded into location.hash.
 *
 * The DSL source is highly repetitive, so we compress it with raw DEFLATE
 * (LZ77 + Huffman) via the browser-native CompressionStream — no dependency —
 * then base64url-encode the bytes. This is ~74% shorter than a plain base64 of
 * the source on the larger templates.
 *
 * Hash format: '~' sentinel + 1 version digit + base64url payload.
 *   ~1<b64url>  raw DEFLATE (RFC 1951) of the UTF-8 source   (default)
 *   ~0<b64url>  uncompressed UTF-8 source                    (fallback when
 *                                                             CompressionStream
 *                                                             is unavailable)
 * The version digit lets the format evolve without breaking already-shared
 * links: bump it and keep the old branch.
 */
export interface ShareState {
	source: string;
}

function bytesToB64url(bytes: Uint8Array): string {
	let bin = '';
	for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
	return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(s: string): Uint8Array {
	const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
	const cs = new CompressionStream('deflate-raw');
	const buf = await new Response(
		new Blob([bytes as BlobPart]).stream().pipeThrough(cs)
	).arrayBuffer();
	return new Uint8Array(buf);
}

async function inflateRaw(bytes: Uint8Array): Promise<string> {
	const ds = new DecompressionStream('deflate-raw');
	// Response.text() decodes the inflated bytes as UTF-8 — full unicode.
	return await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(ds)).text();
}

export async function encodeHash(state: ShareState): Promise<string> {
	const bytes = new TextEncoder().encode(state.source);
	if (typeof CompressionStream !== 'undefined') {
		return '~1' + bytesToB64url(await deflateRaw(bytes));
	}
	return '~0' + bytesToB64url(bytes); // still URL-safe; decodes via version 0
}

export async function decodeHash(hash: string): Promise<ShareState | null> {
	try {
		const raw = hash.replace(/^#/, '');
		if (raw[0] !== '~') return null;
		const version = raw[1];
		const payload = raw.slice(2);
		if (!payload) return null;
		if (version === '1') return { source: await inflateRaw(b64urlToBytes(payload)) };
		if (version === '0') return { source: new TextDecoder().decode(b64urlToBytes(payload)) };
		return null; // unknown version
	} catch {
		return null;
	}
}
