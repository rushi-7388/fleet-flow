# Fleet Flow – Fleet & Logistics Management API

Node.js + Express + TypeScript backend with Prisma, PostgreSQL, JWT auth, and RBAC.

## Tech stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT
- **Access:** Role-based (RBAC)
- **Validation:** Zod

## Project structure

```
├── prisma/
│   ├── schema.prisma    # DB models & enums
│   └── seed.ts         # Seed users
├── src/
│   ├── controllers/
│   ├── middleware/     # auth, RBAC, validate, errorHandler
│   ├── routes/
│   ├── services/       # business logic
│   ├── validations/    # Zod schemas
│   ├── lib/            # Prisma client
│   ├── types/
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Setup

1. **Clone and install**

   ```bash
   cd fleet-flow
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` – PostgreSQL connection string
   - `JWT_SECRET` – secret for signing tokens
   - `PORT` (optional, default 3000)

3. **Database**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

   **Demo data:** The seed creates users (`admin@fleetflow.com` / `admin123`), 3 vehicles (Van-05, Truck-01, Bike-01), and 2 drivers (Alex OnDuty, Maria OffDuty). Use these to create trips from the dashboard.

4. **Run**

   ```bash
   npm run dev
   ```

   API base: `http://localhost:3000`

## API overview

| Method | Path | Auth | Roles | Description |
|--------|------|------|--------|-------------|
| POST | `/api/auth/register` | No | - | Register (body: name, email, password, role) |
| POST | `/api/auth/login` | No | - | Login (body: email, password) → JWT |
| GET | `/api/users` | JWT | ADMIN, MANAGER | List users |
| GET | `/api/users/:id` | JWT | ADMIN, MANAGER | Get user |
| POST | `/api/users` | JWT | ADMIN | Create user |
| PATCH | `/api/users/:id` | JWT | ADMIN, MANAGER | Update user |
| DELETE | `/api/users/:id` | JWT | ADMIN, MANAGER | Delete user |
| GET | `/api/vehicles` | JWT | Any | List (query: status, type, region) |
| GET | `/api/vehicles/:id` | JWT | Any | Get vehicle |
| POST | `/api/vehicles` | JWT | ADMIN, MANAGER, DISPATCHER | Create vehicle |
| PATCH | `/api/vehicles/:id` | JWT | ADMIN, MANAGER, DISPATCHER | Update vehicle |
| DELETE | `/api/vehicles/:id` | JWT | ADMIN, MANAGER, DISPATCHER | Delete vehicle |
| GET | `/api/drivers` | JWT | Any | List (query: status) |
| GET | `/api/drivers/:id` | JWT | Any | Get driver |
| POST | `/api/drivers` | JWT | ADMIN, MANAGER, DISPATCHER | Create driver |
| PATCH | `/api/drivers/:id` | JWT | ADMIN, MANAGER, DISPATCHER | Update driver |
| DELETE | `/api/drivers/:id` | JWT | ADMIN, MANAGER, DISPATCHER | Delete driver |
| GET | `/api/trips` | JWT | Any | List (query: status, vehicleId, driverId) |
| GET | `/api/trips/:id` | JWT | Any | Get trip |
| POST | `/api/trips` | JWT | DISPATCHER+ | Create trip (Draft) |
| PATCH | `/api/trips/:id` | JWT | DISPATCHER+ | Update draft trip |
| POST | `/api/trips/:id/dispatch` | JWT | DISPATCHER+ | Dispatch → vehicle/driver OnTrip |
| POST | `/api/trips/:id/complete` | JWT | DISPATCHER+ | Complete (body: endOdometer, revenue?) |
| POST | `/api/trips/:id/cancel` | JWT | DISPATCHER+ | Cancel trip |
| DELETE | `/api/trips/:id` | JWT | DISPATCHER+ | Delete draft trip |
| GET | `/api/maintenance-logs` | JWT | Any | List (query: vehicleId) |
| GET | `/api/maintenance-logs/:id` | JWT | Any | Get log |
| POST | `/api/maintenance-logs` | JWT | DISPATCHER+ | Create → vehicle InShop |
| PATCH | `/api/maintenance-logs/:id` | JWT | DISPATCHER+ | Update |
| DELETE | `/api/maintenance-logs/:id` | JWT | DISPATCHER+ | Delete |
| GET | `/api/fuel-logs` | JWT | Any | List (query: vehicleId) |
| GET | `/api/fuel-logs/:id` | JWT | Any | Get log |
| POST | `/api/fuel-logs` | JWT | DISPATCHER+ | Create |
| PATCH | `/api/fuel-logs/:id` | JWT | DISPATCHER+ | Update |
| DELETE | `/api/fuel-logs/:id` | JWT | DISPATCHER+ | Delete |
| GET | `/api/analytics/kpis` | JWT | Any | Dashboard KPIs (activeFleet, maintenanceAlerts, utilizationRate, pendingCargo) |
| GET | `/api/analytics/vehicles` | JWT | Any | Vehicle analytics (fuel efficiency, operational cost, ROI) |
| GET | `/api/analytics/monthly-summaries` | JWT | Any | Monthly revenue, fuel/maintenance cost, trips (query: start, end) |
| GET | `/api/analytics/utilization` | JWT | Any | Utilization series (query: start, end) |
| GET | `/api/analytics/fuel-efficiency` | JWT | Any | Fuel efficiency by vehicle |
| GET | `/api/reports/trips` | JWT | DISPATCHER+ | Trips report JSON (query: startDate, endDate, vehicleId, driverId) |
| GET | `/api/reports/trips/export/csv` | JWT | DISPATCHER+ | Trips CSV download |
| GET | `/api/reports/trips/export/pdf` | JWT | DISPATCHER+ | Trips PDF download |
| GET | `/api/reports/expenses` | JWT | DISPATCHER+ | Fuel & maintenance report JSON |
| GET | `/api/reports/expenses/export/csv` | JWT | DISPATCHER+ | Expenses CSV download |
| GET | `/api/reports/expenses/export/pdf` | JWT | DISPATCHER+ | Expenses PDF download |
| GET | `/api/reports/driver-performance` | JWT | DISPATCHER+ | Driver performance JSON |
| GET | `/api/reports/driver-performance/export/csv` | JWT | DISPATCHER+ | Driver performance CSV |
| GET | `/api/reports/driver-performance/export/pdf` | JWT | DISPATCHER+ | Driver performance PDF |

**Auth header:** `Authorization: Bearer <token>`

## Business rules

- **Trips**
  - Create/update: `cargoWeight` must be ≤ vehicle `maxCapacity`.
  - Vehicle must be `Available`; driver must be `OnDuty`; driver `licenseExpiry` must not be expired.
  - **Dispatch:** vehicle and driver status set to `OnTrip`; trip status → `Dispatched`.
  - **Complete:** vehicle → `Available`, driver → `OnDuty`, vehicle `odometer` updated; trip → `Completed`.
  - **Cancel:** if Dispatched, vehicle and driver reset to Available/OnDuty; trip → `Cancelled`.
- **Maintenance log:** on create, vehicle status set to `InShop`.

## Roles

- **ADMIN** – full access, user management.
- **MANAGER** – same as DISPATCHER + user list/update (no create user).
- **DISPATCHER** – create/edit vehicles, drivers, trips, maintenance, fuel logs; dispatch/complete/cancel trips.
- **VIEWER** – read-only (vehicles, drivers, trips, maintenance, fuel logs).

## Seed users

After `npm run prisma:seed`:

- `admin@fleetflow.com` / `admin123` (ADMIN)
- `dispatcher@fleetflow.com` / `admin123` (DISPATCHER)

## Frontend (Next.js dashboard)

The `frontend/` folder contains a Next.js 14 app (TypeScript, Tailwind, ShadCN-style UI, Zustand, Axios, Recharts).

- **Pages:** `/login`, `/dashboard`, `/vehicles`, `/drivers`, `/trips`, `/maintenance`, `/expenses`, `/analytics`, `/reports`
- **Dashboard:** KPI cards (Active Fleet, Maintenance Alerts, Utilization Rate, Pending Cargo)
- **Trip dispatcher:** Only available vehicles and on-duty drivers with valid license; validation errors shown
- **Reports:** Filter by date range, vehicle, driver; download CSV and PDF

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:3000
npm install
npm run dev
```

Runs on `http://localhost:3001` by default (backend on 3000).

## Scripts

- `npm run dev` – dev server (ts-node-dev)
- `npm run build` – compile TypeScript
- `npm start` – run compiled app
- `npx prisma migrate dev` – run migrations
- `npx prisma studio` – open Prisma Studio
- `npm run prisma:seed` – seed database
