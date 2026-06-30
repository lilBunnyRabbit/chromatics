// The Mixer is a client-only interactive page (live color math, rAF, matchMedia),
// so SSR stays off. It still prerenders to a static shell carrying the shared
// <head> (a real 200 page) instead of falling through to GitHub Pages' 404.html.
export const prerender = true;
export const ssr = false;
