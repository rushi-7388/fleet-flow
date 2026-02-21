# Frontend testing checklist

Use this to confirm the app and API work end-to-end.

## Before you start

1. **Backend** running: `npm run dev` in `e:\fleet-flow` (API on port 4000).
2. **Frontend** running: `npm run dev` in `e:\fleet-flow\frontend` (e.g. port 3000).
3. **Database** migrated and seeded: `npx prisma migrate dev` and `npm run prisma:seed` in backend.

---

## 1. API status on Dashboard

- Log in and open **Dashboard**.
- Top right should show **“Backend connected”** (green check).
- If it shows **“Backend unreachable”**, the frontend cannot reach the API (wrong URL, backend not running, or CORS).

---

## 2. Login

| Step | What to do | Expected |
|------|------------|----------|
| 1 | Open `/login`. | Login form with email/password. |
| 2 | Enter **admin@fleetflow.com** / **admin123**. | Redirect to `/dashboard`, no error. |
| 3 | Wrong password. | Red message: “Invalid email or password”. |
| 4 | Log out (sidebar), then open dashboard. | Redirect back to `/login`. |

---

## 3. Dashboard

| Step | What to do | Expected |
|------|------------|----------|
| 1 | After login, stay on Dashboard. | Four KPI cards: Active Fleet, Maintenance Alerts, Utilization Rate, Pending Cargo. |
| 2 | Check top right. | “Backend connected” (if backend is running). |
| 3 | Values may be 0. | OK if DB is empty; numbers appear after you add vehicles/trips. |

---

## 4. Vehicles

| Step | What to do | Expected |
|------|------------|----------|
| 1 | Go to **Vehicles**. | Table (empty or with data). |
| 2 | Use filters: status, type, region. | List updates. |
| 3 | No 401/403 in Network tab. | Requests succeed with your JWT. |

---

## 5. Drivers

| Step | What to do | Expected |
|------|------------|----------|
| 1 | Go to **Drivers**. | Table (empty or with data). |
| 2 | If a driver’s license expiry is in the past. | “License expired” warning on that row. |

---

## 6. Trips (dispatcher flow)

| Step | What to do | Expected |
|------|------------|----------|
| 1 | Go to **Trips**. | Trips list (and “New trip” if your role can create). |
| 2 | Click **New trip**. | Form: vehicle (only available), driver (on duty), cargo, origin, destination. |
| 3 | Submit with cargo &gt; vehicle max capacity. | Validation error (e.g. “Cargo weight exceeds…”). |
| 4 | Submit valid data. | New draft trip in list. |
| 5 | Click **Dispatch** on a draft. | Trip status → Dispatched (if vehicle/driver rules pass). |
| 6 | Click **Complete**, enter end odometer, confirm. | Trip → Completed; vehicle/driver freed. |
| 7 | Click **Cancel** on draft or dispatched. | Trip → Cancelled. |

---

## 7. Maintenance

| Step | What to do | Expected |
|------|------------|----------|
| 1 | Go to **Maintenance**. | Table of maintenance logs (or empty). |
| 2 | Filter by vehicle ID if you have data. | List filters correctly. |

---

## 8. Expenses

| Step | What to do | Expected |
|------|------------|----------|
| 1 | Go to **Expenses**. | Two summary cards (fuel total, maintenance total) and two tables. |
| 2 | Tables show fuel logs and maintenance logs. | Data matches backend (or empty). |

---

## 9. Analytics

| Step | What to do | Expected |
|------|------------|----------|
| 1 | Go to **Analytics**. | Same KPIs as dashboard + charts. |
| 2 | Monthly revenue/costs chart. | Bars or “No monthly data yet”. |
| 3 | Trips per month chart. | Line chart or “No data”. |

---

## 10. Reports

| Step | What to do | Expected |
|------|------------|----------|
| 1 | Go to **Reports**. | Filters (date, vehicle, driver) and three report blocks. |
| 2 | Set date range (optional), click **CSV** for Trips. | File download: `trips-report.csv`. |
| 3 | Click **PDF** for Trips. | File download: `trips-report.pdf`. |
| 4 | Same for Expenses and Driver performance. | CSV and PDF download without error. |

---

## Quick “everything works” check

1. Login with **admin@fleetflow.com** / **admin123**.
2. Dashboard shows **“Backend connected”** and four KPI cards.
3. Open **Vehicles**, **Drivers**, **Trips** — no redirect to login, no 500 in console/Network.
4. Open **Analytics** — charts load (or “No data”).
5. Open **Reports** — download at least one CSV and one PDF.

If all of the above pass, frontend and backend are working together.

---

## If something fails

- **“Backend unreachable”**  
  - Backend running? `http://localhost:4000/health` returns JSON in browser?  
  - `frontend/.env`: `NEXT_PUBLIC_API_URL=http://localhost:4000` and restart frontend dev server.

- **401 on any page**  
  - Token might be missing or expired. Log out and log in again.

- **Blank or wrong data**  
  - Run seed: in backend `npm run prisma:seed`.  
  - Create a vehicle/driver/trip from the UI or via API/Prisma Studio and re-check.

- **CORS errors in console**  
  - Backend uses `cors()` with no origin restriction in dev; if you changed ports, ensure frontend URL is allowed or keep default config.
