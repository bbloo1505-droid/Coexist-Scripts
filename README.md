# Coexist-Scripts

Scripts and presenter materials for [Co-Exist](https://github.com/bbloo1505-droid) events.

## Mary Cairncross speech (standalone presenter)

This repository root is a standalone mobile-first cue cards app for the Co-Exist / Mary Cairncross nature walk talk.

### Run locally

```bash
npm install
npm run dev
```

Opens on port **5174** by default (so it does not clash with PelviLog on 8080).

### Build

```bash
npm run build
npm run preview
```

## Mary Cairncross walk — flashcards component

`mary-cairncross-walk/` contains the React component used for full-screen outdoor cue cards (tap/swipe navigation, speaker mode, wake lock, high-contrast layout).

**Integrated app:** the same component is mounted in PelviLog at the route **`/event-speech`** in [pelviflow-tracker](https://github.com/bbloo1505-droid/pelviflow-tracker).

### Using the component elsewhere

You need a React 18 app with **Tailwind CSS** (the UI uses utility classes), plus:

- `clsx`
- `tailwind-merge`

Copy `EventSpeechFlashcards.tsx` and `utils.ts` into your project (or merge `cn` into your own `lib/utils`). Wire the default export to a route of your choice. The “Back to app” control is a plain `<a href="/">` — adjust the `href` if your app lives under a different path.
