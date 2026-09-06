# Hamid Cloth House — Full E-Commerce Platform

A production-ready e-commerce platform for Pakistani clothing built with a **FastAPI** backend, **React 19 + TypeScript** frontend (styled with an Uber-inspired monochrome design system), and **MongoDB** (Beanie ODM + GridFS for image storage).

---

## Architecture Overview

```
                          ┌──────────────────────────┐
                          │   React 19 Frontend      │
                          │   (Vite + TypeScript)    │
                          │   Port 5173              │
                          └─────────────┬────────────┘
                                        │ REST / WebSocket
                                        ▼
                          ┌──────────────────────────┐
                          │     FastAPI Backend      │
                          │     Port 8015            │
                          └──────┬────────────┬──────┘
                                 │            │
                      Motor / Beanie      GridFS Bucket
                                 │            │
                                 ▼            ▼
                          ┌──────────────────────────┐
                          │      MongoDB Database    │
                          │      Port 27017          │
                          └──────────────────────────┘
```

- **Backend:** FastAPI, Beanie ODM (MongoDB), Motor, Pydantic v2, Bcrypt, JWT auth, SlowAPI rate limiting, SMTP email service, WebSocket notifications.
- **Frontend:** React 19, TypeScript, React Router v7, Zustand, Recharts, Lucide React, React Helmet Async, Vanilla CSS tokens.
- **File Storage:** MongoDB GridFS for direct image uploads and streaming via `/api/images/{file_id}`.
- **Order Pipeline:** Atomic daily numbering (`HC-YYYYMMDD-XXXX`), price snapshotting, inventory locking, bank receipt uploads.

---

## Quick Start Guide

### 1. Prerequisites
- Python 3.12+
- Node.js 18+ and npm
- MongoDB 7.0+ (running locally on port 27017 or via MongoDB Atlas)

---

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (if not present)
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

#### Populate Database with Initial Seed Data:
```bash
PYTHONPATH=. .venv/bin/python seed.py
```
> Populates categories (Men's & Women's Clothing), catalog products with variations, sample orders, sliders, bank accounts, and the default admin user.

#### Launch Backend Server (Port 8015):
```bash
.venv/bin/uvicorn app.main:app --reload --port 8015
```

- **Interactive Swagger Docs:** [http://localhost:8015/docs](http://localhost:8015/docs)
- **ReDoc Documentation:** [http://localhost:8015/redoc](http://localhost:8015/redoc)
- **Health Check:** [http://localhost:8015/api/health](http://localhost:8015/api/health)

---

### 3. Frontend Setup

```bash
# From project root
npm install

# Start Vite dev server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@hamidcloth.com` | `admin123` |
| **Customer 1** | `ahmed@example.com` | `customer123` |
| **Customer 2** | `fatima@example.com` | `customer123` |
| **Customer 3** | `hassan@example.com` | `customer123` |

To access the admin dashboard, sign in with the admin credentials and navigate to [http://localhost:5173/admin](http://localhost:5173/admin) or click **Admin Dashboard** in the user dropdown.

---

## Application Features

### Customer Experience:
- **Hero Slider & Banner:** Configurable promotion sliders with auto-rotation.
- **Catalog & Search:** Live category filtering, price range filters, search, and pagination.
- **Product Detail:** Multi-angle image gallery, color & size variation selection, real-time stock counters, tabbed details, customer reviews, and star ratings.
- **Cart & Subtotal:** Quantity steppers, auto-calculated free shipping threshold (Rs. 3,000+), subtotal updates.
- **Checkout & Proof Upload:** Multi-step shipping form, Pakistani bank account details (HBL, MCB), and bank transfer receipt upload.
- **Order Tracking:** Real-time milestone tracker (`received` → `packing` → `dispatched` → `delivered`).
- **Account & Profile:** Personal details update, contact change, and secure password update.
- **Password Recovery:** Forgot password token generation via email.
- **Responsive Navigation:** Desktop sticky navbar + mobile bottom navigation bar (`MobileNav`).

### Admin Dashboard (`/admin`):
- **Dashboard:** Revenue stats, order volume, average order value, recent orders table, live WebSocket notification badges.
- **Product Management:** Full CRUD modal, multi-variation creation (color, size, price, stock, SKU), multi-image upload to GridFS, SEO keyword auto-generator, deep product duplication.
- **Order Lifecycle:** Update status (`received`, `packing`, `dispatched`, `delivered`), toggle payment status (`pending`, `paid`, `refunded`), view payment proof receipts.
- **Visual Analytics:** Interactive Recharts charts for monthly order velocity, revenue momentum, and top-selling products.
- **Category Hierarchy:** Parent/child category trees, slug auto-generation, soft deletion checks.
- **Customer & Review Management:** User role toggles, review approvals, and official store replies.
- **Promotions & Sliders:** Manage home page slider images, banner links, and percentage-based discounts.
- **Store Settings:** Branding, WhatsApp support number, and social media URLs.

---

## Testing & Quality Assurance

### Run Backend Tests (Pytest)
```bash
PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/ -v
```
> Runs 16 automated tests covering authentication, tokens, admin route guards, health checks, slugification, model constraints, and schema validations.

### Build Frontend (Vite + TypeScript)
```bash
npm run build
```
> Type-checks and compiles production bundle to `dist/`.

---

## Production Deployment

### Docker Compose
```bash
docker compose up -d --build
```
Spins up MongoDB container and backend service on port 8015.

### Render Deploy (`render.yaml`)
Push to your repository and deploy via the Render dashboard using the included [`render.yaml`](./render.yaml).
