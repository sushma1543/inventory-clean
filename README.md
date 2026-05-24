# Allo Engineering Take Home - Inventory Reservation System

## Live Deployment

Frontend Deployment:
https://allohealth-33lo16l81-shushma.vercel.app

GitHub Repository:
https://github.com/sushma1543/inventory-clean

---

## Tech Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- Supabase PostgreSQL
- TailwindCSS
- Vercel Deployment

---

## Features

- Multi-warehouse inventory with product-level stock per warehouse
- Reservation lifecycle with `PENDING`, `CONFIRMED`, and `RELEASED` states
- Concurrency-safe reservation creation using PostgreSQL transactions
- Reservation confirmation and release endpoints
- Live checkout page with countdown timer
- Automatic reservation expiry handling
- Real-time inventory availability updates
- Idempotent reservation and confirmation APIs
- Lazy cleanup strategy for expired reservations
- Seeded demo products and warehouses

---

## API Endpoints

### Products

`GET /api/products`

Returns products with warehouse-wise stock availability.

### Warehouses

`GET /api/warehouses`

Returns all warehouses.

### Create Reservation

`POST /api/reservations`

Creates a temporary reservation for inventory units.

Returns:
- `200` on success
- `409` if stock is unavailable

### Confirm Reservation

`POST /api/reservations/:id/confirm`

Confirms a pending reservation after successful payment.

Returns:
- `200` on success
- `410` if reservation has expired

### Release Reservation

`POST /api/reservations/:id/release`

Releases a reservation early if payment fails or user cancels checkout.

---

## Local Setup

### Install Dependencies

```bash
npm install