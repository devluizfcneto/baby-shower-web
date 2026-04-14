# baby-shower-web

Scaffolded with Vuetify CLI.

## ❗️ Documentation

- Primary docs: https://vuetifyjs.com/
- Getting started guide: https://vuetifyjs.com/en/getting-started/installation/
- Community support: https://community.vuetifyjs.com/
- Issue tracker: https://issues.vuetifyjs.com/

## 🧱 Stack

- Framework: Vue 3 + Vite
- UI Library: Vuetify
- Language: TypeScript
- Package manager: npm

## 🧭 Start Here

- Main entry: `src/main.ts`
- Main app component: `src/App.vue`
- Main styles: `src/styles/`
- Plugin setup: `src/plugins/`

## 📁 Project Structure

- `src/main.ts` — application entry point
- `src/App.vue` — root component
- `src/components/` — reusable Vue components
- `src/plugins/` — plugin registration and setup
- `src/styles/` — global styles and theme settings
- `public/` — static public files

## ✨ Enabled Features

- ESLint
- Pinia
- Vue Router

## 💿 Install

Use your selected package manager (npm) to install dependencies:

```bash
npm install
```

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## ⚙️ Environment Setup (Routes + API)

1. Create your local env file from the example:

```bash
cp .env.example .env.local
```

2. Configure values:

- `VITE_APP_BASE_PATH`: base path for the SPA router (example: `/` or `/baby-shower/`)
- `VITE_API_BASE_URL`: REST API host (example: `https://api.example.com`)
- `VITE_API_PREFIX`: API prefix used by the app (example: `/api` or `/v1`)
- `VITE_API_PROXY_TARGET` (optional): dev proxy target to avoid CORS during local development

When `VITE_API_PROXY_TARGET` is defined, Vite proxies local `/api/*` requests to your backend target.

## 🌐 REST Consumption Pattern

Use the centralized HTTP helper:

- URL builder: `src/services/http.ts` -> `buildApiUrl(path)`
- Request helper: `src/services/http.ts` -> `apiFetch<T>(path, init)`

Example:

```ts
import { apiFetch } from '@/services/http'

type Guest = { id: string; name: string }

const guests = await apiFetch<Guest[]>('/guests')
```

## 🏗️ Build

```bash
npm run build
```

## 🧪 Available Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run build-only`
- `npm run type-check`
- `npm run lint`
- `npm run lint:fix`

## 💪 Support Vuetify Development

This project uses Vuetify - an MIT licensed Open Source project. We are glad to welcome contributors and any support for ongoing development:

- Contribute to Vuetify and ecosystem projects: https://github.com/vuetifyjs
- Request enterprise support: https://support.vuetifyjs.com/
- Sponsor on GitHub: https://github.com/sponsors/vuetifyjs
- Support on Open Collective: https://opencollective.com/vuetify
