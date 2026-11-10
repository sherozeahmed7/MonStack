# Monstack

A MERN resume workspace for a small group: MongoDB, Express, React, Node.js. Each account has private application history, a structured resume editor, job-description analysis, optional AI tailoring and live market research, and PDF/DOCX/TXT exports.

## Try locally

Requires Node.js 24 and npm.

```powershell
cd 'E:\Documents\cv maker\monstack'
npm ci
npm run build
npm run dev
```

Open http://localhost:3000 (built app) or http://127.0.0.1:5173 (live development). Create your own account on the sign-in page. There is no shared default password.

Without `MONGODB_URI`, the development script starts a real local MongoDB process and retains data in `.local/mongodb`. Its first run downloads the MongoDB executable. This local database is for development, not public hosting. If MongoDB download access is unavailable, configure an existing database in `.env` instead. Stop with Ctrl+C; start with the same command to reuse local data. Local data is not copied automatically into Atlas.

## Features

- Register, sign in and sign out; hashed passwords and expiring HTTP-only session cookies.
- Per-account resume storage and server-side ownership checks on every resume operation.
- Separate applications by target company, role and country/market; search company or role, track Draft/Applied/Interview/Offer/Archived status, duplicate and delete.
- Import text-based PDF, DOCX or TXT (5 MB maximum). Original extracted text remains available. Scanned PDFs require OCR outside the app. Basic mode extracts name/email/phone/known skills; AI structuring is an explicit optional action.
- Edit contact details, summary, skills, work experience, education, projects and certifications. Add/remove roles and bullets; preview updates as text flows.
- Transparent recognized-keyword coverage and structure checks. These are heuristics, not a proprietary ATS score, an ATS certification, or a hiring guarantee.
- AI extracts additional JD skills, proposes a summary and at most three bullets per existing role. Nothing is applied automatically. Skill approval and employer-specific bullet confirmation are separate actions.
- Country-specific current job research with source links and a research date. It is a sample of available sources, not a complete market survey.
- Single-column PDF with automatic pagination, editable DOCX, and plain text exports. Preview is continuous and is not an exact paginated Word/PDF rendering. Inspect the final file before submitting.

## AI setup

Copy `.env.example` to `.env`. Set `OPENAI_API_KEY` and an accessible `OPENAI_MODEL`. The example model is `gpt-6-astra`; select a Responses API model that supports `web_search` for research. No key is bundled or placed in frontend code.

The app uses `POST https://api.openai.com/v1/responses`, sets `store: false`, and limits each account to 20 AI operations per hour. Usage may incur provider charges. Full CV text is sent only for AI import/tailoring; market research sends the target role and market. Without a key, the UI disables AI actions and the API returns a clear configuration error; it does not simulate live research.

Live provider calls have not been verified without a configured API key. The application validates output fields, but users must still verify the factual accuracy of generated text and citations. Approved general skills do not establish that a skill was used at any specific employer.

## Deploy to Vercel + Render + MongoDB Atlas

This is the requested production architecture. Vercel serves React and proxies `/api/*` to Render using `vercel.mjs`; Render runs Express and connects to Atlas. The browser only uses the Vercel origin, so authentication does not depend on third-party cookies. Responses containing account or resume data are never cached. See [Vercel's external rewrite documentation](https://vercel.com/docs/routing/rewrites).

1. Connect the source repository to Render and Vercel. If this folder is inside a larger repository, set the root directory to `monstack` on both hosts.
2. Provision the Atlas app database and a restricted database user. Add Render's outbound addresses to Atlas network access.
3. On Render, create the Node web service from `render.yaml` (or use the commands below). Set `MONGODB_URI`, `NODE_ENV=production`, `APP_ORIGIN` to your exact Vercel production origin, and the AI variables. Keep credentials only on Render.
4. On Vercel, choose the Vite framework, Node 24, output directory `dist`, and set **`BACKEND_ORIGIN`** to the Render HTTPS origin. `vercel.mjs` fails clearly if this is missing. No MongoDB or OpenAI secrets are needed on Vercel.
5. Deploy both services. Open the Vercel URL and test `/api/health`, registration, saving, export and research. A preview domain is deliberately not an allowed write origin unless configured on Render; use the production domain for the initial test.
6. Keep the Render service awake on a suitable plan when reliable response times matter. Vercel external rewrites have a finite timeout; if live AI work times out, the app reports an error instead of claiming it completed.

The Vercel CLI on the development computer was found but its existing token was invalid. Vercel, Render and Atlas integrations must be connected, or the services deployed from your dashboards, before a public URL can be verified. This does not affect the local running app.

### Render settings / alternative single-server deployment

The frontend and API are served by the same Express process. `render.yaml` is provided for Render; `Dockerfile` supports a container host/VPS. Sites/Cloudflare Workers hosting does not run this standard MERN backend, so this project does not replace MongoDB with another database merely to publish a preview.

1. Push the source to a repository connected to your hosting account. Do not commit `.env`, `.local`, or credentials.
2. Create an Atlas cluster and database user with access only to the app database. Allow the hosting server's outbound network access in Atlas. Configure backups appropriate to the chosen Atlas tier.
3. Configure runtime variables in the hosting dashboard:

   | Variable | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Atlas connection string including database name |
   | `APP_ORIGIN` | Exact public HTTPS origin, without trailing slash |
   | `OPENAI_API_KEY` | Server-side API key, required for AI features |
   | `OPENAI_MODEL` | Accessible Responses model with web search |
   | `REGISTRATION_CLOSED` | `false` initially; set `true` after your group joins |
   | `PORT` | Set by the hosting provider, defaults to 3000 |

4. Build: `npm ci && npm run build`. Start: `npm start`. Health check: `/api/health`.
5. Enable HTTPS at the hosting proxy. Production cookies use `Secure`. The application expects one trusted reverse proxy hop; adjust `trust proxy` in `server/app.js` if your host has a different network topology.
6. Verify registration, second-user isolation, uploads, live research, exports, and persistence after a restart on the deployed URL.

The app is intended for roughly 30–50 users. It has baseline authentication, validation, file-size limits, login/AI rate limits and origin checks, not enterprise account management. There is no email verification or self-service password reset in this version. Password recovery would need an email provider or an operator-managed process. In-memory rate limits suit one server; use a shared limiter before scaling across replicas.

Credentials belong in your account's secrets dashboard. No MongoDB Atlas account, paid service, or public deployment has been created by this project. Account passwords are never needed in source code.

## Verification

```powershell
npm test
npm run build
# With npm run dev already running and Chrome installed:
node tests/browser.mjs
```

Integration tests use an isolated disposable MongoDB instance. They cover registration/session behavior, cross-user isolation, validation, saved edits, search escaping, import/export round trips, multi-page PDF text preservation, duplicate/delete, missing-AI configuration, and logout. Browser tests cover creating an account and resume, editing, persistence on reload, searching, downloading PDF, mobile layout, and logout. Browser tests create clearly named local QA accounts (`qa-…@example.com`). Their screenshots/files are ignored in `.local/qa`.

## Design and ATS references

- [Greenhouse: unsuccessful resume parsing](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse) — format limitations inform the single-column export and standard headings.
- [OpenAI: web search](https://developers.openai.com/api/docs/guides/tools-web-search) — Responses web search and source extraction.
- [Express: production security](https://expressjs.com/advanced/best-practice-security/) — HTTPS, validation, Helmet and secure cookies.

Generated resumes use a consistent Monstack template. Import preserves readable content, not the original CV's visual styling. English/Latin-script resumes are the tested export target; embedded multilingual font support would be needed for broader PDF language coverage.

## Free-tier AI with Gemini

Create a Gemini API key in Google AI Studio and set `GEMINI_API_KEY` on the Render MonStack service. Optionally set `GEMINI_MODEL` (default: `gemini-3.5-flash-lite`). Gemini takes priority over OpenAI when its key is present. No fallback to a paid provider occurs. Keep your Google project on the free tier without billing to avoid paid usage. Free quotas vary by account and can limit concurrent users; this is not unlimited hosting for 50 users. Google may use free-tier input/output to improve its products; review its terms before submitting personal CVs.

Resume structuring and tailoring use JSON output. Market research uses Google Search and requires returned source links. The app does not save unsourced research as verified research.
