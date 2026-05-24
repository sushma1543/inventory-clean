
 # Allo Engineering Take Home - Inventory Reservation System

 ## Tech Stack
 - Next.js App Router
 - TypeScript
 - Prisma ORM
 - PostgreSQL
 - TailwindCSS

 ## Features
 - Multi-warehouse inventory with product-level stock per warehouse
 - Reservation lifecycle: pending, confirmed, released
 - Concurrency-safe reservation creation with PostgreSQL row locking
 - Confirm and release endpoints with status validation
 - Live checkout page with countdown, confirmation, and cancellation
 - Visual stock dashboard and availability bar charts
 - Lazy expiry cleanup on product reads and reservation writes

 ## API Endpoints
 - `GET /api/products` — lists products and stock by warehouse
 - `GET /api/warehouses` — lists warehouses
 - `POST /api/reservations` — reserves units; returns `409` if stock is unavailable
 - `POST /api/reservations/:id/confirm` — confirms a pending reservation; returns `410` if expired
 - `POST /api/reservations/:id/release` — releases a pending reservation early

 ## Concurrency Strategy
 Reservations use PostgreSQL row-level locks inside a transaction:
 1. Lock the stock row with `FOR UPDATE`
 2. Recompute available stock
 3. Increment `reservedUnits`
 4. Create the reservation record
 This ensures only one concurrent reservation can successfully claim the last available unit.

 ## Expiry Strategy
 Expiry is handled lazily in the application:
 - `GET /api/products` triggers cleanup of expired pending reservations
 - `POST /api/reservations` also runs cleanup before reserving
 Expired reservations automatically restore `reservedUnits` and move to `RELEASED`.
 In production, this can be extended with a cron job or background worker for tighter guarantees.

For convenience the app exposes a small admin endpoint to run cleanup on demand:

- `GET /api/cleanup` — runs expiry cleanup and returns `{ success: true }`. Use a Vercel Cron or external scheduler to call this endpoint regularly (e.g. every minute).

To test concurrency locally, there's a small script that fires multiple concurrent reservation requests:

```bash
# Node 18+
node scripts/concurrent-reserve.js http://localhost:3000 10 <productId> <warehouseId> <quantity>
```

This script helps validate that only one of several simultaneous requests for the same last unit will succeed (others should receive `409`).

## Idempotency

The `POST /api/reservations` and `POST /api/reservations/:id/confirm` endpoints support idempotency via the `Idempotency-Key` request header. If a client retries a request with the same key, the server will return the original response (status and body) without re-applying side effects.

After modifying the Prisma schema to add the `IdempotencyKey` model, run:

```bash
npx prisma migrate dev --name add-idempotency
npx prisma db seed
```

The app uses a best-effort upsert to store responses; failures to persist idempotency metadata do not block the normal request flow.
 ## Run Locally

 ```bash
 npm install
 ```

Create a `.env` file in the project root with your hosted Postgres connection string. You can start from `.env.example` and fill in your values:

 ```env
 DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
 DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
 ```

 Then run migrations and seed data:

 ```bash
 npx prisma migrate dev --name init
 npx prisma db seed
 npm run dev
 ```

This project now includes 20 additional seeded products with Unsplash-sourced images, so the storefront will display a richer catalog once the DB is seeded.

 ## Notes
 - The app is designed to work with hosted Postgres in production.
 - The current code base is ready for a Vercel deployment with a managed database.

