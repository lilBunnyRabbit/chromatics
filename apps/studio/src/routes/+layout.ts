// Prerender the whole app to static HTML so every route ships as a real 200
// page (with the full <head>) instead of GitHub Pages serving the 404.html
// fallback for every URL. The home route `/` keeps SSR on (no `ssr = false`
// here): its mount-gated shell renders DesktopShell during prerender, giving
// the homepage a real <title>, <h1> and crawlable body. The interactive
// /mixer and /models routes opt back out of SSR in their own +page.ts (they
// touch browser-only APIs) but still prerender to a shell with the shared head.
export const prerender = true;
