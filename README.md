# Rafael Vales — Portfolio

My bilingual personal portfolio: projects, product decisions, and the work behind them.

**Live:** [rafaelvales.com](https://rafaelvales.com) · [English version](https://rafaelvales.com/en)

## Features

- Spanish and English pages with language-specific CV downloads.
- Interactive particle portrait with pointer and touch input, a pause control, and reduced-motion handling.
- Project gallery featuring TripPilot, Animal Feed, and a dermatology clinic project, with direct links to selected projects.
- Clinic screenshot viewer covering desktop screens, mobile booking, and the QR photo-upload flow.
- Animal Feed demo embedded from its separate deployment, with a link to its public code.
- Product-decision walkthroughs, a career timeline, technology overview, and contact links.
- Light and dark themes, page metadata, sitemap, robots file, and Person structured data.

## Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, custom CSS, and Canvas/WebGL rendering. Fraunces is bundled locally for headings.

## Architecture

- `src/app/`: Spanish home page, `/en`, metadata endpoints, and global styles.
- `src/components/`: project showcases, navigation, career timeline, and interactive UI.
- `src/content/translations.ts` and `LocaleProvider`: shared translation lookup and locale-specific links.
- `src/lib/particle-motion.ts` and `particle-renderer.ts`: particle rendering helpers used by the portrait component.
- `public/`: screenshots, videos, CV PDFs, and other downloadable assets.

The portfolio does not require a database or credentials for the projects it showcases. Those projects run separately. Documents are rendered per request to support a nonce-based Content Security Policy; this is not a static export.

## Run locally

Use Node.js 22.12+ and npm.

```sh
git clone https://github.com/Rafael-Vales/Portfolio.git
cd Portfolio
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No environment variables are required for local development.

```sh
npm run lint
npx tsc --noEmit
npm run build
npm start
```

The build script explicitly uses Webpack. For Vercel, use the Next.js preset, `npm ci`, and `npm run build`, with the default output directory.

## Secret checks and public assets

The repository includes a Gitleaks-based GitHub Actions workflow and an optional local pre-push hook. To enable the hook, install Gitleaks 8.30.1 on your PATH (or set `GITLEAKS_BIN`), then run:

```sh
git config --local core.hooksPath .githooks
npm run security
npm run test:security
```

Everything under `public/` is publicly downloadable. Review new screenshots, documents, and media before committing them.

## Author

Built by **Rafael Vales**, a full-stack developer focused on frontend.

[Website](https://rafaelvales.com) · [LinkedIn](https://www.linkedin.com/in/rafael-vales/) · [GitHub](https://github.com/Rafael-Vales)
