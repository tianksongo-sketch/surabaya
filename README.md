# Surabaya Historical Archive

A React + Vite single-page site with liquid-glass UI, scroll-revealed timeline, theme toggle, event search, and figure cards.

## Run locally
    npm install
    npm run dev

## Build
    npm run build      # output in dist/

## Deploy on Vercel
Option A: push this folder to GitHub, then import the repository in Vercel. Framework preset: Vite.
Option B: extract the ZIP, then run:
    npm install
    npm run build
    npx vercel

## Status and limitations
- Build status: not run. This project was written without a working package install, so `npm install` and `npm run build` have not been executed. Run them before deploying.
- Historical content: dates and descriptions were written from general knowledge. Verify each entry against primary sources and academic histories before publishing.
- Images: no photographs are included. The hero uses gradients. Add licensed images to `public/images/` and reference them in `src/App.jsx`.
- Not yet included: Leaflet map, a modal search (search is an inline filter), TypeScript, and framer-motion (animations use CSS and IntersectionObserver).
