# FleetFlow Dashboard

Next.js 14 (TypeScript), Tailwind CSS, ShadCN-style UI, Zustand, Axios, Recharts.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Set `NEXT_PUBLIC_API_URL=http://localhost:3000` (or your backend URL).

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or 3001 if 3000 is taken).

## Pages

- **Login** – Role-based; redirects to dashboard when authenticated.
- **Dashboard** – KPI cards: Active Fleet, Maintenance Alerts, Utilization Rate, Pending Cargo.
- **Vehicles** – Registry with filters (status, type, region); status pills.
- **Drivers** – Profiles with license expiry warnings.
- **Trips** – Dispatcher workflow: create draft (only available vehicles & on-duty drivers with valid license), dispatch, complete (with end odometer), cancel. Rule errors and API errors shown.
- **Maintenance** – Logs list; filter by vehicle.
- **Expenses** – Fuel and maintenance totals and tables.
- **Analytics** – KPIs and Recharts (monthly revenue/costs, trips per month).
- **Reports** – Date/vehicle/driver filters; download CSV and PDF for trips, expenses, driver performance.

## Auth

Login stores JWT and user in Zustand (persisted). Axios interceptor sends `Authorization: Bearer <token>` and redirects to `/login` on 401.
