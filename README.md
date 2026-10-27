# NeuroTrade – AI Virtual Stock Market 🚀

> A production-grade, full-stack virtual trading platform powered by a real-time simulation engine, TradingView candlestick charts, and AI market analysis.

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-6DB33F?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![TradingView](https://img.shields.io/badge/Charts-Lightweight--Charts-00c9ff?style=flat-square)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)

---

## 🎯 Overview

**NeuroTrade** is a professional virtual stock trading terminal featuring:

- 📊 **TradingView-Grade Candlestick Charts** — High-performance `lightweight-charts` with SMA, EMA, and RSI overlays
- 🔴 **Live Price Simulation** — 15+ stocks streaming price movements and order book depth
- 🤖 **AI Market Signals** — Real-time Buy/Sell signal generation with confidence score overlays
- 💼 **Full Portfolio Management** — Holdings, P&L, transaction history, and asset allocation
- 🔐 **JWT Authentication** — Spring Security 6 with stateless sessions and BCrypt password encryption
- 📡 **Live Market Data** — High-frequency streaming and WebSocket capabilities
- 🎨 **Dark Theme Interface** — Glassmorphism, neon badges, and fluid Framer Motion animations

---

## 🏗️ Architecture

```
neurotrade/
├── backend/                             # Spring Boot 3 Java Backend
│   ├── src/main/java/com/neurotrade/
│   │   ├── config/                      # SecurityConfig, WebSocketConfig
│   │   ├── controller/                  # Auth, Stocks, Portfolio, Trade, AI, Watchlist
│   │   ├── service/                     # AuthService, StockSimulation, Trading, Portfolio
│   │   ├── ai/                          # AiInsightsService
│   │   ├── model/                       # User, Stock, Holding, Transaction, WatchlistItem
│   │   ├── repository/                  # Spring Data JPA repositories
│   │   ├── security/                    # JwtAuthenticationFilter, JwtTokenProvider
│   │   └── exception/                   # GlobalExceptionHandler
│   ├── src/test/java/com/neurotrade/   # Integration & unit test suites
│   ├── pom.xml                          # Maven dependencies (Java 17, Spring Boot 3.2.3, Actuator)
│   ├── Dockerfile                       # Multi-stage production container
│   └── mvnw / mvnw.cmd                  # Maven wrappers
└── frontend/                            # React + Vite Frontend
    └── src/
        ├── context/                     # AuthContext, StockContext, WatchlistContext
        ├── services/                    # api.js (centralized Axios client), priceStream.js
        ├── components/                  # TradingChart, TradingPanel, OrderBook, RSIChart
        └── pages/                       # TradingTerminalPage, DashboardPage, MarketPage, PortfolioPage
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Java 17+**
- **Maven 3.9+** (or use `./mvnw` inside `backend/`)
- **Node.js 18+** & **npm**
- **PostgreSQL 14+** (or Docker)

### 2. Local Database
```sql
CREATE DATABASE neurotrade;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE neurotrade TO postgres;
```

### 3. Start Spring Boot Backend
```bash
cd backend
mvn clean spring-boot:run
```
The backend starts locally at `http://localhost:8080`.
Verify health: `http://localhost:8080/actuator/health` (returns `{"status":"UP"}`).

### 4. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs locally at `http://localhost:5173`.

---

## 🌐 Production Deployment Guide

### A. Deploy Backend to Render (or Railway / AWS / Heroku)

1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new **Web Service**:
   - **Root Directory**: `backend`
   - **Environment**: `Java` (or `Docker`)
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -Dserver.port=${PORT:-8080} -jar target/neurotrade-backend-1.0.0.jar`
3. Provision a **PostgreSQL Database** on Render (or Supabase / Neon).
4. Configure Environment Variables in the Render Dashboard:
   ```env
   DATABASE_URL=jdbc:postgresql://<db-host>:<db-port>/<db-name>
   DATABASE_USERNAME=<db-user>
   DATABASE_PASSWORD=<db-password>
   JWT_SECRET=<generate-a-strong-256-bit-secret>
   CORS_ORIGINS=https://neurotrade-iota.vercel.app
   ```
5. Deploy and obtain your backend URL: e.g. `https://neurotrade-backend.onrender.com`.
6. Verify deployment:
   ```bash
   curl https://<your-backend-domain>/actuator/health
   # Expected: {"status":"UP"}
   ```

### B. Deploy Frontend to Vercel

1. In the [Vercel Dashboard](https://vercel.com), select your `neurotrade` project.
2. Go to **Settings > General**:
   - **Root Directory**: `.` (or set build command to `cd frontend && npm install && npm run build`)
   - **Output Directory**: `frontend/dist`
   - **Framework Preset**: `Vite`
3. Go to **Settings > Environment Variables** and add:
   ```env
   VITE_API_BASE_URL=https://<your-deployed-backend-domain>
   ```
   *(e.g., `https://neurotrade-backend.onrender.com` - do NOT include a trailing slash)*
4. Trigger a **Redeploy** on Vercel.

---

## 🔧 Troubleshooting Guide

| Issue | Cause | Resolution |
|---|---|---|
| **"Cannot connect to the server at..."** on Vercel | `VITE_API_BASE_URL` is missing or points to `localhost` | Set `VITE_API_BASE_URL` to your live HTTPS backend URL in Vercel Project Settings and redeploy. |
| **CORS error in browser console** | Backend does not allow the frontend origin | Ensure `CORS_ORIGINS` on the backend includes `https://neurotrade-iota.vercel.app` (comma-separated, no trailing slash). |
| **Registration fails (400 Bad Request)** | Duplicate username/email or password < 6 chars | Check backend response message; usernames must be >= 3 characters, passwords >= 6 characters. |
| **401 Unauthorized on protected routes** | Expired or missing JWT token | Log in again to obtain a fresh token. The frontend interceptor handles automatic token attachment and 401 redirection. |
| **Database connection refused on startup** | PostgreSQL is unreachable or credentials invalid | Verify `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD`. Ensure PostgreSQL is running and accessible. |
| **Vercel 404 on page refresh** | SPA routing not rewrote to index.html | `vercel.json` contains SPA rewrite rules redirecting client-side routes to `/index.html`. |

---

## 🧪 Testing

Run backend tests:
```bash
cd backend
mvn test
```
*Executes all 5 automated integration tests including Actuator health, JWT authentication, and duplicate user rejection using in-memory H2.*

Run frontend production build verification:
```bash
cd frontend
npm run build
```
