# Prisma Setup Guide - FleetFlow

**Yes, we're already using Prisma!** This guide shows you how to use Prisma commands to set up your database.

## Prisma is Already Configured ✅

- ✅ `prisma/schema.prisma` - Database schema
- ✅ `@prisma/client` - Installed
- ✅ `prisma` CLI - Installed
- ✅ All services use Prisma client

## Quick Setup with Prisma

### Step 1: Set Your DATABASE_URL in `.env`

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fleet_flow?schema=public"
```

**Note:** The database name (`fleet_flow`) doesn't need to exist yet - Prisma will create it!

### Step 2: Create Database & Run Migrations

Prisma can create the database automatically if it doesn't exist:

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database + run migrations (creates DB if missing)
npm run prisma:migrate
```

Or manually:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Create migration and apply it (creates DB automatically)
npx prisma migrate dev --name init
```

**What this does:**
- Creates the `fleet_flow` database if it doesn't exist
- Creates all tables (User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog)
- Sets up indexes and relationships

### Step 3: Seed Initial Data

```bash
npm run prisma:seed
```

This creates:
- Admin user: `admin@fleetflow.com` / `admin123`
- Dispatcher user: `dispatcher@fleetflow.com` / `admin123`

---

## Prisma Commands Available

### Generate Prisma Client
```bash
npm run prisma:generate
# or
npx prisma generate
```
Generates TypeScript types from your schema.

### Run Migrations
```bash
npm run prisma:migrate
# or
npx prisma migrate dev
```
Applies pending migrations to your database.

### Open Prisma Studio (Visual Database Browser)
```bash
npm run prisma:studio
# or
npx prisma studio
```
Opens a web UI at `http://localhost:5555` to view/edit data.

### Create a New Migration
```bash
npx prisma migrate dev --name migration_name
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

### View Migration Status
```bash
npx prisma migrate status
```

---

## Using Prisma Studio to Find Your Database

If you're not sure about your PostgreSQL connection:

1. **Try Prisma Studio** - It will show connection errors if DATABASE_URL is wrong:
   ```bash
   npm run prisma:studio
   ```

2. **Check connection** - Prisma will tell you if it can't connect:
   ```bash
   npx prisma db pull
   ```

---

## Common Prisma Workflows

### Initial Setup (First Time)
```bash
# 1. Set DATABASE_URL in .env
# 2. Generate client
npm run prisma:generate

# 3. Create database and tables
npm run prisma:migrate

# 4. Seed data
npm run prisma:seed

# 5. Start backend
npm run dev
```

### After Schema Changes
```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. Generate updated client
npm run prisma:generate
```

### View Your Data
```bash
# Open Prisma Studio
npm run prisma:studio
```

---

## Troubleshooting with Prisma

### "Can't reach database server"
- Check if PostgreSQL is running
- Verify DATABASE_URL format
- Check if port 5432 is accessible

### "Database does not exist"
- Prisma will create it automatically with `migrate dev`
- Or create manually: `CREATE DATABASE fleet_flow;`

### "Migration failed"
- Check PostgreSQL logs
- Verify user has CREATE DATABASE permissions
- Try: `npx prisma migrate reset` (⚠️ deletes data)

### "Prisma Client not generated"
```bash
npm run prisma:generate
```

---

## Prisma Schema Location

Your schema is at: `prisma/schema.prisma`

It defines:
- ✅ User model (with roles)
- ✅ Vehicle model (with status, type)
- ✅ Driver model (with status, license)
- ✅ Trip model (with status, relationships)
- ✅ MaintenanceLog model
- ✅ FuelLog model

All relationships and indexes are configured!

---

## Quick Test

After setting DATABASE_URL, test Prisma connection:

```bash
# This will show connection errors if any
npx prisma db pull
```

If successful, you're ready to migrate!
