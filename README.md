# NParki

NParki is a shared parking platform built with a Laravel REST API and a React/Vite frontend. Parking owners publish available spots with exact map coordinates and gate QR codes, manage bookings, and track earnings. Drivers search, reserve, scan the gate QR on entry and exit, choose cash or online payment, manage cars, view booking history, and open directions.

## Structure

```text
backend/   Laravel API, Sanctum token auth, migrations, controllers, requests, resources
frontend/  React app, React Router, Axios, reusable UI components, CSS design system
```

## Backend Setup

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Create a MySQL database named `nparki`, then update `.env` if your MySQL username or password differs:

```env
DB_DATABASE=nparki
DB_USERNAME=root
DB_PASSWORD=
FRONTEND_URL=http://localhost:5173
```

Run migrations and expose uploaded parking images:

```bash
php artisan migrate
php artisan storage:link
php artisan serve
```

The API will run at `http://localhost:8000/api`.

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend will run at `http://localhost:5173`.

## Main API Routes

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
PUT    /api/profile

GET    /api/parking-spots
GET    /api/parking-spots/{parkingSpot}
GET    /api/owner/parking-spots
POST   /api/parking-spots
PUT    /api/parking-spots/{parkingSpot}
DELETE /api/parking-spots/{parkingSpot}

GET    /api/bookings
POST   /api/bookings
PATCH  /api/bookings/{booking}/status
PATCH  /api/bookings/{booking}/cancel
POST   /api/bookings/{booking}/gate-scan
POST   /api/bookings/{booking}/payment

GET    /api/cars
POST   /api/cars
PUT    /api/cars/{car}
DELETE /api/cars/{car}
```

## Auth and Roles

Registration requires `name`, `email`, `phone`, `password`, `password_confirmation`, and `role`.

Roles:

- `owner`: owner dashboard, spot CRUD, exact map picker, gate QR codes, image uploads, booking approval/rejection, earnings summary.
- `driver`: driver dashboard, search, 20-minute reservations, QR entry/exit scans, cash/online payment choice, car management.

The React app protects dashboard routes and redirects users to the correct dashboard after login/register.
