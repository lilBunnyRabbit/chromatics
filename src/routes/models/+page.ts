// The encyclopedia is a client-only interactive page (canvas, matchMedia,
// live color math), so SSR stays off. It still prerenders to a static shell
// carrying the shared <head> (a real 200 page) instead of GitHub Pages' 404.html.
export const prerender = true;
export const ssr = false;
