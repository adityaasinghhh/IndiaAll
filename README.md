# INDIA ALL — International Commodity Trading

Responsive trilingual B2B commodity-trading website with a React/Tailwind frontend, Express/Mongoose API, customer accounts, enquiry management, a full admin dashboard, and Nodemailer email notifications.

## Stack
- Frontend: React 18, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express, MongoDB/Mongoose
- Email: Nodemailer over SMTP
- Languages: English, Spanish, Portuguese

## Project structure
- `client/` — primary React website, pages, translations, product photos and customer dashboard
- `client/src/components/admin/` — admin dashboard pages and shared UI primitives
- `server/` — Express API, MongoDB models, customer + admin authentication, enquiry/admin routes, validation, email templates
- `server/src/data/products.js` — backend copy of the static product catalogue (generated, see below)
- `vercel.json` — Vercel Services configuration (one project, two services)

## 1. Install and start the frontend
From the project root:

```powershell
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` (Vite may print a different port if 3000 is occupied).

## 2. Configure the backend
Copy the root `.env.example` to the project-root `.env` for frontend settings. Then copy `server/.env.example` to `server/.env` for backend settings. Replace every placeholder value. Do not commit either `.env` file.

Required values for a working deployment:
- `MONGO_URI`: your MongoDB connection string (local `mongodb://localhost:27017/indiaall` or a MongoDB Atlas URI)
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`: long, random, independent secrets
- `CLIENT_URL`: frontend origin, e.g. `http://localhost:3000`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: credentials for your SMTP provider
- `EMAIL_FROM`: sender address authorized by that provider
- `ENQUIRY_RECIPIENTS`: comma-separated business inboxes that should receive enquiries
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: seed administrator credentials; change the password before use

The root `.env` should keep `VITE_API_BASE_URL=/api/v1` (uses the Vite dev proxy) and `VITE_MAINTENANCE_MODE=false` for local development.

Start the API in a second terminal:

```powershell
cd server
npm install
npm run dev
```

API health check: `http://localhost:5000/api/v1/health`.

## 3. Seed the initial catalogue and administrator
After MongoDB is configured, from the `server/` directory run:

```powershell
npm run seed
```

This creates the owner admin (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`), the 32-product catalogue, and default site settings. Review `src/config/seed.js` and `.env` before seeding. Use a strong unique admin password in your environment.

## 4. Admin dashboard
Visit `/admin` (or `/admin/dashboard`) and sign in with the seeded administrator credentials.

- Sessions use HTTP-only cookies and survive page refresh (`GET /api/v1/admin/session`).
- Access tokens are short-lived; a refresh-token rotation endpoint (`POST /api/v1/admin/refresh`) keeps the session alive.
- Logout and password changes invalidate all previously issued tokens immediately (server-side session version).
- Every admin API endpoint requires the admin cookie; product deletion, customer deletion and admin management are restricted to the `owner` role.
- Sensitive actions (status changes, product edits, customer suspensions, …) are written to the audit log, viewable under Settings → Activity log.

### Admin sections
| Section | Capabilities |
| --- | --- |
| Overview | KPI cards, orders-over-time chart, status distribution, recent orders/enquiries/customers, audit activity, date-range filter |
| Orders | Search, status/date filters, sorting, pagination, detail view, status updates with confirmation, internal notes, CSV export |
| Enquiries | Search, status/date filters, detail view, status + internal notes + follow-up date, email replies, CSV export |
| Products | Search, category/visibility filters, create/edit forms with validation, visibility toggle, delete with confirmation, CSV export |
| Customers | Search, status/registration-date filters, detail view with order & enquiry history, suspend/reactivate, CSV export |
| Reports | Date-range reports: orders/enquiries by status, monthly trends, registration trend, enquiry→order conversion, product demand, CSV exports |
| Settings | Profile, password change, business contact info (persisted), activity log, security overview, sign out |

## 5. Email behaviour
The public enquiry form sends a request to `POST /api/v1/enquiries`. The API validates and stores the enquiry in MongoDB, sends a notification to the configured business inbox, and attempts to send the buyer a confirmation email. Admin routes support enquiry listing, status updates, replies and CSV export.

SMTP credentials are required for actual delivery. If email configuration is missing or incorrect, the enquiry may still be saved while email delivery fails; monitor server logs and test with an inbox you control before production.

## 6. Tests
The server ships with an integration test suite that runs against a real in-memory MongoDB (no external services needed):

```powershell
cd server
npm test
```

It covers authentication, session restore/refresh/logout, RBAC, validation, every admin resource endpoint, CSV exports (including formula-injection safety), and audit logging.

## 7. Production checklist
- Set `VITE_MAINTENANCE_MODE=false` for the normal website experience.
- Set production MongoDB, SMTP, and strong JWT secrets.
- Use HTTPS and configure CORS to the production frontend origin.
- Configure SPF, DKIM and DMARC for the sending domain.
- Replace placeholder WhatsApp number and verify company details/contact information.
- Test registration, login, password reset, enquiry creation, email notifications, customer dashboard and admin operations.
- Run `npm run build` from the project root and `npm start` from `server/`.

Never put secrets in `VITE_*` variables or frontend code. Vite exposes those variables to the browser.

## 8. Deploying to Vercel (one project, two services)

The repository is set up for [Vercel Services](https://vercel.com/docs/services): one Vercel project,
one domain, two independently built services.

- `client` — the public Vite site, served at `/`.
- `server` — the Express API, reached through the `/api/*` rewrite.

The browser always calls the API with a relative path (`/api/v1/...`), so the frontend and the
backend share an origin and no cross-origin requests are made.

### Project settings
- Framework preset: **Services**
- Root Directory: leave empty (the repository root — `vercel.json` lives there)

### Environment variables
Add every variable listed in `.env.example` under Project → Settings → Environment Variables
for Production (and Preview if you want previews to work). A local `.env` file is **not** deployed.

### Shared product catalogue
`client/src/data/products.js` is the source of truth for the static catalogue. The backend needs
the same data but Vercel builds each service from its own root directory, so the backend cannot
import files from `client/`. Keep the copy in `server/src/data/products.js` in step:

```powershell
npm run sync:catalogue --prefix server          # regenerate the backend copy
npm run sync:catalogue:check --prefix server    # fail if the copy is out of date
```

Run `sync:catalogue` whenever you edit the client catalogue.
