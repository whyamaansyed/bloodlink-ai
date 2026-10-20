# 🩸 BLOODLINK AI — Smart Blood Bank Demand & Inventory Management System

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://mongoosejs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A production-grade, full-stack **MERN** web platform engineered for real-time blood inventory monitoring, intelligent FEFO dispatching, emergency donor broadcasts, nearby blood bank discovery, and multi-hospital data isolation.

---

## 📌 Table of Contents
- [Project Overview](#-project-overview)
- [Tech Stack Architecture](#-tech-stack-architecture)
  - [Frontend](#frontend)
  - [Backend & Security](#backend--security)
  - [Database & Data Models](#database--data-models)
- [Key Features](#-key-features)
- [System Architecture & Entity-Relationship (ER)](#-system-architecture--entity-relationship-er)
- [Demo Credentials](#-demo-credentials)
- [Getting Started & Installation](#-getting-started--installation)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Project Structure](#-project-structure)
- [Included Presentation & Hackathon Deck](#-included-presentation--hackathon-deck)

---

## 🌟 Project Overview

**BLOODLINK AI** solves critical friction points in healthcare logistics: blood unit wastage from expiration, delayed emergency dispatch, lack of cross-hospital stock visibility, and manual donor outreach.

Through automated state machines, intelligent RBC/Plasma compatibility algorithms, and a **First-Expired, First-Out (FEFO)** inventory dispatch engine, BloodLink AI coordinates donors, hospitals, and blood banks in real time.

---

## 🛠 Tech Stack Architecture

### Frontend
- **Framework & Core:** [React 18.3](https://react.dev/) with [Vite 5](https://vitejs.dev/) for high-performance HMR.
- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/) with custom dark/light healthcare UI themes and `@tailwindcss/forms`.
- **Icons:** [Lucide React](https://lucide.dev/) (modern icon set).
- **Routing:** [React Router v6](https://reactrouter.com/) with Role-Based Route Guards (`Admin`, `Hospital`, `Donor`).
- **Data Visualization & Analytics:** [Recharts 2.12](https://recharts.org/) for real-time demand, blood type distribution, and shortage trend charts.
- **Form Management:** [React Hook Form](https://react-hook-form.com/) with client-side validation.
- **HTTP Client:** [Axios](https://axios-http.com/) with centralized JWT interceptors and auto error handling.

### Backend & Security
- **Runtime & Framework:** [Node.js](https://nodejs.org/) & [Express.js 4](https://expressjs.com/).
- **Authentication:** Stateless **JSON Web Tokens (JWT)** with role-based claims.
- **Password Security:** **Bcrypt.js** (salted hashing).
- **Data Validation:** `express-validator` middleware enforcing sanitization on all incoming requests.
- **Multi-Hospital Isolation:** Custom `getAuthenticatedHospital` middleware preventing cross-hospital data leakage (HTTP 403 Forbidden enforcement).
- **State Machine Enforcement:** Strict transition guards on donation and request lifecycles.

### Database & Data Models
- **Database Engine:** [MongoDB](https://www.mongodb.com/) via [Mongoose 8.5](https://mongoosejs.com/) ODM.
- **Zero-Setup Embedded Database:** Integrated `mongodb-memory-server` fallback for instant out-of-the-box local testing without needing an external MongoDB instance.
- **10 Core Collections / Mongoose Schemas:**
  1. `User` — Authentication, roles (`ADMIN`, `HOSPITAL`, `DONOR`), hashed passwords.
  2. `Hospital` — Organization profile, license number, geo-coordinates, capacity.
  3. `Donor` — Voluntary donor directory, eligibility status, last donation date, health records.
  4. `Donation` — Donation appointment lifecycle (`SCHEDULED` ➔ `CHECK_IN` ➔ `COMPLETED` ➔ `AVAILABLE`).
  5. `BloodInventory` — Individual blood units with component type, batch number (`DON-xxx`), and expiration date.
  6. `BloodRequest` — Hospital blood requests with urgency ranking (`NORMAL`, `URGENT`, `EMERGENCY 🚨`).
  7. `BloodUnitTransaction` — Complete audit trail (`DONATED` ➔ `AVAILABLE` ➔ `RESERVED` ➔ `ISSUED`).
  8. `Notification` — Real-time alerts for low stock, emergency requests, and donor outreach.
  9. `DemandRecord` — Historical request logs powering predictive analytics.
  10. `StockThreshold` — Configurable alert limits for critical inventory shortage thresholds.

---

## ⚡ Key Features

| Feature | Description |
|---|---|
| **🩸 Real-Time Inventory Matrix** | Live dashboard tracking all 8 blood groups (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`) across 4 blood components (Whole Blood, Packed Red Cells, Platelets, Fresh Frozen Plasma). |
| **⏳ FEFO Expiry Sweep Engine** | First-Expired, First-Out algorithm categorizing stock into *Normal (>7d)*, *Warning (4–7d)*, *Critical (1–3d)*, and *Expired (≤0d)* to prevent wastage. |
| **🚨 Emergency Priority Queue** | Real-time score ranking (`urgencyWeight + hoursPending * 2`) to prioritize critical trauma & ICU requests. |
| **🧬 Smart Compatibility Matching** | Automatic ABO/Rh compatibility engine matching requests with available units in inventory. |
| **📣 Emergency Donor Broadcast** | Broadcasts targeted notifications to eligible nearby donors when an emergency request occurs. |
| **🏥 Hospital Request Portal** | Complete request lifecycle tracking: `PENDING` ➔ `APPROVED` / `REJECTED` ➔ `FULFILLED` with instant stock allocation. |
| **📜 Complete Audit Trail** | Every unit move recorded in `BloodUnitTransaction` with an interactive timeline modal. |
| **📊 Analytics & Reports** | 5 Recharts data dashboards, shortage trend analysis, print-ready reports, and CSV exports. |
| **📍 Nearby Blood Bank Discovery** | Interactive discovery module with location filtering, distance estimation, and emergency hotlines. |
| **🔒 Strict Multi-Hospital Isolation** | Built-in isolation guards ensuring hospital staff only manage their own inventory and requests. |

---

## 🗺 System Architecture & Entity-Relationship (ER)

```
+---------------+           1 : 1          +---------------+
|     USER      | <----------------------> |   HOSPITAL    |
| (Auth & Role) |                          | (Org Profile) |
+---------------+                          +---------------+
        |                                          |
        | 1 : 1                                    | 1 : N
        v                                          v
+---------------+       1 : N              +---------------+
|     DONOR     | -----------------------> | BLOOD_REQUEST |
| (Eligibility) |                          |  (Urgency)    |
+---------------+                          +---------------+
        |                                          |
        | 1 : N                                    | 1 : N
        v                                          v
+---------------+       1 : 1              +---------------+
|   DONATION    | -----------------------> |BLOOD_INVENTORY|
|  (Lifecycle)  |                          | (FEFO Expiry) |
+---------------+                          +---------------+
                                                   |
                                                   | 1 : N
                                                   v
                                           +---------------+
                                           |  TRANSACTION  |
                                           | (Audit Trail) |
                                           +---------------+
```

---

## 🔑 Demo Login Credentials

Pre-seeded testing credentials with Quick-Login buttons:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin / Staff** | `admin@bloodlink.ai` | `Admin@123` | Full system access, stock management, analytics & audits |
| **Hospital** | `hospital@bloodlink.ai` | `Hospital@123` | Hospital request portal, stock requests, department inventory |
| **Donor** | `donor@bloodlink.ai` | `Donor@123` | Donor profile, appointment booking, donation history |

---

## 🚀 Getting Started & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/bloodlink-ai.git
cd bloodlink-ai
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
cd ..
```

### 3. Run the Application (Single Command)
Run both frontend and backend concurrently from the project root:
```bash
npm run dev
```

- 🟢 **Backend API Server:** running on `http://localhost:5000`
- 🔵 **Frontend Web App:** running on `http://localhost:5173`

Open your browser at **`http://localhost:5173`** to access the application.

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new donor or hospital user
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated session

### Blood Inventory & FEFO (`/api/inventory`)
- `GET /api/inventory` — Fetch inventory matrix & expiration status
- `POST /api/inventory` — Add tested blood units to stock
- `GET /api/inventory/alerts` — Retrieve low-stock and near-expiry alerts

### Hospital Requests (`/api/requests`)
- `GET /api/requests` — List requests (filtered by hospital isolation)
- `POST /api/requests` — Submit emergency or scheduled blood request
- `PUT /api/requests/:id/status` — State machine transition update

### Donations & Donors (`/api/donations`, `/api/donors`)
- `GET /api/donors` — Directory of voluntary donors and eligibility
- `POST /api/donations/schedule` — Book a donation appointment
- `PUT /api/donations/:id/status` — Advance donation workflow

### Analytics & Reports (`/api/analytics`)
- `GET /api/analytics/summary` — Key KPI metrics and shortage warnings
- `GET /api/analytics/charts` — Aggregated data for Recharts visualization

---

## 📁 Project Structure

```text
bloodlink-ai/
├── client/                     # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI widgets, Modals, Navbars
│   │   ├── pages/              # Portal views (Admin, Hospital, Donor)
│   │   ├── context/            # Global Auth & Notification Contexts
│   │   ├── services/           # Axios API client functions
│   │   └── utils/              # FEFO helpers, compatibility algorithms
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/        # Request handlers & state machine logic
│   │   ├── models/             # 10 Mongoose schemas (User, Inventory, etc.)
│   │   ├── middleware/         # Auth, hospital isolation, validator
│   │   ├── routes/             # REST API endpoint definitions
│   │   └── utils/              # Compatibility matrix & seed data
│   └── package.json
│
├── scripts/                    # Dev orchestration & runtime helpers
├── bloodlink_presentation.pptx # 7-slide native PowerPoint deck
├── package.json                # Root scripts
└── README.md                   # Complete documentation
```

---

## 📊 Included Presentation & Hackathon Deck

This repository includes a presentation package:
- **`bloodlink_presentation.pptx`** — 7-slide widescreen (16:9) presentation deck covering:
  1. Executive Summary & Tagline
  2. Frontend Architecture (React, Vite, Tailwind, Recharts)
  3. Backend Architecture (Node, Express, JWT, Isolation)
  4. Database Schemas (10 Mongoose collections)
  5. Entity-Relationship (ER) Diagram
  6. End-to-End Workflow & FEFO Engine
  7. Security Invariants, Hackathon Pitch & Impact Metrics

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
