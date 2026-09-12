# Sudoku

A lightweight Sudoku web app with live puzzle generation, notes, hints, and offline PWA support.

**Play:** [https://f05036361288.github.io/Sudoku/](https://f05036361288.github.io/Sudoku/)

## Features

- **5 difficulty levels** — Beginner → Expert (unique-solution puzzles)
- **Notes (pencil) mode** — mark candidates in a cell
- **Instant check** — wrong entries highlight in red
- **Hints** — fill the selected cell from the solution
- **Auto-save** — progress restores in the same browser
- **i18n** — English, 繁體中文, 简体中文
- **PWA** — installable; updates automatically when a new build is deployed

## Tech stack

- Vite + TypeScript (vanilla)
- `vite-plugin-pwa` for service worker / installability
- GitHub Actions → GitHub Pages on every push to `main`

## Local development

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build    # typecheck + production build → dist/
npm run preview  # preview the production build
```

Requires Node.js 22+ (same as the deploy workflow).

## Deploy

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. `npm ci`
2. `npm run build`
3. Deploy `dist/` to GitHub Pages

Repo Settings → Pages → Source should be **GitHub Actions**.

## Project layout

```
src/
  main.ts      # UI + game loop
  generate.ts  # puzzle generation & solver
  sudoku.ts    # board helpers & conflict checks
  puzzles.ts   # difficulty types
  storage.ts   # localStorage save/load
  i18n.ts      # locales
  style.css
```
