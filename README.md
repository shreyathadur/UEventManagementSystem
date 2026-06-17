# UEMS — University Event Management Platform

A full-stack, Dockerized event management platform designed for college fests and technical events.

**Tech Stack:** React + Vite (Frontend) · Spring Boot 3.3 / Java 17 (Backend) · PostgreSQL (Database) · Docker + Render (Deployment)

---

## ✨ Core Features

| Feature | Description |
|---|---|
| **QR Ticket Generation** | Unique HMAC-signed QR codes per registration. Download as PNG. |
| **Event Check-in Scanning** | Camera-based QR scanner for volunteers/admins. Real-time check-in counts. |
| **Certificate Generation** | Auto-generated landscape PDF certificates with unique verification IDs. |
| **Volunteer Management** | Apply, get approved, view assigned tasks, log hours, receive ratings. |
| **Sponsorship Management** | CRUD sponsors with tiers (Platinum/Gold/Silver), logos, and contributions. |
| **Analytics Dashboard** | Real-time Recharts: bar, pie, and line charts for registrations, check-ins, hours, revenue. |
| **JWT Authentication** | Role-based access: `ROLE_USER`, `ROLE_VOLUNTEER`, `ROLE_ADMIN`. |

---

## 📁 Project Structure

```
UEMS/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/com/uems/api/
│   │   ├── config/             # Security, JWT, Data Initializer
│   │   ├── controller/         # REST Controllers
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── entity/             # JPA Entities
│   │   ├── exception/          # Global Exception Handler
│   │   ├── repository/         # Spring Data Repositories
│   │   └── service/            # Business Logic & PDF/QR generation
│   ├── src/main/resources/
│   │   ├── application.yml     # App configuration
│   │   └── schema.sql          # Database DDL
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                   # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # Navbar, EventCard, QrScannerModal
│   │   ├── context/            # AuthContext (JWT session)
│   │   ├── views/              # Home, Auth, Event, Dashboard views
│   │   ├── config.ts           # API base URL + auth headers
│   │   ├── App.tsx             # Router + route guards
│   │   └── index.css           # Premium dark glassmorphic design system
│   ├── nginx.conf
│   ├── Dockerfile
│   └── index.html
├── docker-compose.yml          # Local orchestration
├── render.yaml                 # Render deployment config
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Java 17+, Maven 3.9+
- Node.js 20+, npm 10+
- PostgreSQL 15+ running locally (or Docker)

### 1. Database Setup
```bash
# Create database
psql -U postgres -c "CREATE DATABASE uems;"
```

### 2. Start Backend
```bash
cd backend
mvn clean spring-boot:run
```
The API starts at `http://localhost:8080`. Sample data is auto-seeded on first run.

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:5173` with API proxy to `:8080`.

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Access:
#   Frontend: http://localhost:3000
#   Backend:  http://localhost:8080
#   Database: localhost:5432
```

---

## ☁️ Render Deployment

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New → Blueprint** and connect your repo
4. Render reads `render.yaml` and provisions:
   - PostgreSQL database (`uems-db`)
   - Backend web service (`uems-backend`)
   - Static site (`uems-frontend`)
5. Set `VITE_API_URL` in the frontend service to your backend URL

---

## 🔐 Sample Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@uems.edu` | `admin123` |
| Volunteer | `volunteer@uems.edu` | `volunteer123` |
| Student | `student@uems.edu` | `student123` |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/events` | Public | List all events |
| GET | `/api/events/{id}` | Public | Event details |
| POST | `/api/events` | Admin | Create event |
| PUT | `/api/events/{id}` | Admin | Update event |
| DELETE | `/api/events/{id}` | Admin | Delete event |
| POST | `/api/tickets/book?eventId=` | User | Book ticket (generates QR) |
| GET | `/api/tickets/my` | User | My tickets |
| GET | `/api/tickets/{id}/qrcode` | Public | QR code PNG image |
| POST | `/api/checkins/scan` | Vol/Admin | Scan & validate QR ticket |
| GET | `/api/certificates/my` | User | My certificates |
| POST | `/api/certificates/claim?eventId=` | User | Claim certificate |
| GET | `/api/certificates/{id}/download` | User | Download PDF certificate |
| POST | `/api/volunteers/apply` | User | Apply to volunteer |
| GET | `/api/volunteers/my-tasks` | Volunteer | My assigned tasks |
| GET | `/api/volunteers/admin/list` | Admin | All volunteers |
| PUT | `/api/volunteers/admin/review/{id}` | Admin | Approve/reject volunteer |
| PUT | `/api/volunteers/admin/log/{id}` | Admin | Log hours & rating |
| GET | `/api/sponsors` | Public | All sponsors |
| GET | `/api/sponsors/event/{id}` | Public | Sponsors by event |
| POST | `/api/sponsors` | Admin | Add sponsor |
| DELETE | `/api/sponsors/{id}` | Admin | Remove sponsor |
| GET | `/api/analytics/overview` | Admin | Dashboard analytics |

---

## 🎨 Design System

- **Theme**: Ultra-dark glassmorphic UI with HSL-tailored color palette
- **Fonts**: Outfit (headings) + Inter (body) from Google Fonts
- **Animations**: Fade-in transitions, hover scaling, glowing borders
- **Charts**: Recharts with custom dark-themed tooltips and styled axes

---

## 📄 License

MIT License — Built for educational and campus use.
