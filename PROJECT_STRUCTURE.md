# FleetFlow - Project Structure

## 📁 Root Structure

```
fleet-flow/
├── .env                    # Backend environment variables (not in git)
├── .env.example            # Backend env template
├── .gitignore             # Comprehensive git ignore rules
├── package.json           # Backend dependencies & scripts
├── tsconfig.json          # TypeScript config for backend
├── README.md              # Main documentation
│
├── prisma/                # Database schema & migrations
│   ├── schema.prisma      # Prisma schema (all models)
│   └── seed.ts            # Database seed script
│
├── src/                   # Backend source code
│   ├── app.ts             # Express app setup
│   ├── server.ts          # Server entry point
│   │
│   ├── controllers/       # Request handlers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── vehicleController.ts
│   │   ├── driverController.ts
│   │   ├── tripController.ts
│   │   ├── maintenanceLogController.ts
│   │   ├── fuelLogController.ts
│   │   ├── analyticsController.ts
│   │   └── reportController.ts
│   │
│   ├── services/          # Business logic layer
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── vehicleService.ts
│   │   ├── driverService.ts
│   │   ├── tripService.ts
│   │   ├── maintenanceLogService.ts
│   │   ├── fuelLogService.ts
│   │   ├── analyticsService.ts
│   │   └── reportService.ts
│   │
│   ├── routes/            # Express routes
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── vehicleRoutes.ts
│   │   ├── driverRoutes.ts
│   │   ├── tripRoutes.ts
│   │   ├── maintenanceLogRoutes.ts
│   │   ├── fuelLogRoutes.ts
│   │   ├── analyticsRoutes.ts
│   │   └── reportRoutes.ts
│   │
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts        # JWT authentication
│   │   ├── rbac.ts        # Role-based access control
│   │   ├── errorHandler.ts # Global error handler
│   │   └── validate.ts    # Zod validation middleware
│   │
│   ├── validations/       # Zod schemas
│   │   ├── user.ts
│   │   ├── vehicle.ts
│   │   ├── driver.ts
│   │   ├── trip.ts
│   │   ├── maintenanceLog.ts
│   │   ├── fuelLog.ts
│   │   └── report.ts
│   │
│   ├── lib/               # Shared utilities
│   │   └── prisma.ts      # Prisma client singleton
│   │
│   └── types/             # TypeScript type definitions
│       └── express.d.ts   # Express Request extension
│
└── frontend/              # Next.js frontend application
    ├── .env               # Frontend environment (not in git)
    ├── .env.local.example # Frontend env template
    ├── package.json       # Frontend dependencies
    ├── tsconfig.json      # TypeScript config
    ├── next.config.js     # Next.js config
    ├── tailwind.config.ts # Tailwind CSS config
    ├── postcss.config.js  # PostCSS config
    │
    ├── app/               # Next.js App Router
    │   ├── layout.tsx     # Root layout
    │   ├── page.tsx       # Home (redirects)
    │   ├── globals.css    # Global styles
    │   │
    │   ├── login/         # Login page
    │   │   └── page.tsx
    │   │
    │   ├── register/      # Registration page
    │   │   └── page.tsx
    │   │
    │   ├── dashboard/     # Dashboard (protected)
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   │
    │   ├── vehicles/      # Vehicles page
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   │
    │   ├── drivers/       # Drivers page
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   │
    │   ├── trips/         # Trips dispatcher
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   │
    │   ├── maintenance/   # Maintenance logs
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   │
    │   ├── expenses/      # Expenses view
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   │
    │   ├── analytics/     # Analytics & charts
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   │
    │   └── reports/       # Reports & exports
    │       ├── layout.tsx
    │       └── page.tsx
    │
    ├── components/        # React components
    │   ├── ui/            # ShadCN-style UI components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── input.tsx
    │   │   ├── badge.tsx
    │   │   └── label.tsx
    │   │
    │   ├── Sidebar.tsx    # Navigation sidebar
    │   ├── DashboardLayout.tsx
    │   └── StatusPill.tsx # Status badge component
    │
    ├── lib/               # Frontend utilities
    │   ├── api.ts         # Axios client & API functions
    │   └── utils.ts       # Helper functions (cn, etc.)
    │
    └── store/             # State management (Zustand)
        └── authStore.ts   # Authentication store
```

## 🎯 Key Directories

### Backend (`src/`)

- **`controllers/`** - HTTP request handlers (thin layer, delegates to services)
- **`services/`** - Business logic, database operations, validation
- **`routes/`** - Express route definitions with middleware
- **`middleware/`** - Auth, RBAC, validation, error handling
- **`validations/`** - Zod schemas for request validation
- **`lib/`** - Shared utilities (Prisma client, helpers)

### Frontend (`frontend/`)

- **`app/`** - Next.js App Router pages (file-based routing)
- **`components/`** - Reusable React components
- **`lib/`** - API client, utilities
- **`store/`** - Zustand state management

## 📝 Important Files

### Backend
- `src/server.ts` - Entry point, starts Express server
- `src/app.ts` - Express app configuration, routes, middleware
- `prisma/schema.prisma` - Database schema (source of truth)
- `.env` - Environment variables (DATABASE_URL, JWT_SECRET, PORT)

### Frontend
- `frontend/app/layout.tsx` - Root layout wrapper
- `frontend/lib/api.ts` - Axios instance, API functions, types
- `frontend/store/authStore.ts` - Auth state (token, user, persist)
- `frontend/.env` - NEXT_PUBLIC_API_URL

## 🔒 Security Notes

- `.env` files are gitignored (use `.env.example` templates)
- `node_modules/` never committed
- Build outputs (`dist/`, `.next/`) excluded
- Secrets, keys, certificates excluded

## 🚀 Build Outputs

- **Backend:** `dist/` (TypeScript compiled to JavaScript)
- **Frontend:** `.next/` (Next.js build output)
- Both are gitignored - rebuild on deployment

## 📦 Dependencies

- **Backend:** Root `package.json` (Express, Prisma, JWT, etc.)
- **Frontend:** `frontend/package.json` (Next.js, React, Tailwind, etc.)

## 🗄️ Database

- **Schema:** `prisma/schema.prisma`
- **Migrations:** `prisma/migrations/` (auto-generated, committed)
- **Seed:** `prisma/seed.ts` (creates admin/dispatcher users)
