# NeuroTrade – AI Virtual Stock Market 🚀

> A production-grade, full-stack virtual trading platform powered by a real-time simulation engine and AI market analysis.

![NeuroTrade Banner](https://img.shields.io/badge/NeuroTrade-AI%20Stock%20Market-00c9ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMiAyMmgyMEwxMiAyeiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-6DB33F?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-00c9ff?style=flat-square)

---

## 🎯 Overview

**NeuroTrade** is a hackathon/portfolio-grade virtual stock trading platform featuring:

- 🔴 **Live price simulation** — 15+ stocks updated every second using Geometric Brownian Motion
- 🤖 **AI market analyst** — Rule-based insights engine (pluggable to GPT/Claude)
- 💼 **Full portfolio management** — Holdings, P&L, win-rate, sector allocation
- 🔐 **JWT authentication** — Spring Security with role-based access (USER / ADMIN / GUEST)
- 📡 **WebSocket streaming** — Live price broadcast via STOMP/SockJS
- 📊 **Premium dark UI** — Glassmorphism, neon indicators, animated charts

---

## 🏗️ Architecture

```
neurotrade/
├── backend/                     # Spring Boot 3 application
│   └── src/main/java/com/neurotrade/
│       ├── config/              # Security + WebSocket config
│       ├── controller/          # REST API controllers
│       ├── service/             # Business logic services
│       │   ├── AuthService.java
│       │   ├── StockSimulationService.java  ← GBM price engine
│       │   ├── TradingService.java          ← Atomic buy/sell
│       │   └── PortfolioService.java
│       ├── ai/                  # AI insights engine (pluggable)
│       ├── model/               # JPA entities
│       ├── repository/          # Spring Data JPA repos
│       ├── security/            # JWT filter + provider
│       ├── dto/                 # Request/response DTOs
│       └── exception/           # Global error handler
└── frontend/                    # React + Vite application
    └── src/
        ├── context/             # AuthContext, StockContext (WebSocket)
        ├── services/            # Axios API client
        ├── layouts/             # AppLayout (sidebar + ticker)
        ├── pages/               # Landing, Login, Register, Dashboard, Market, Portfolio
        └── components/          # StockCard, TradeModal, AiInsightsPanel, LiveTicker
```

---

## 🚀 Quick Start

### Prerequisites

| Tool         | Version  |
|--------------|----------|
| Java         | 17+      |
| Maven        | 3.9+     |
| Node.js      | 20+      |
| PostgreSQL   | 15+      |
| Docker       | (optional)|

---

### Option A: Run with Docker Compose (Recommended)

```bash
# Clone and start everything
cd neurotrade
docker-compose up --build
```

- Frontend → http://localhost:5173
- Backend  → http://localhost:8080
- DB       → localhost:5432

---

### Option B: Run Locally

#### 1. PostgreSQL Setup

```sql
CREATE DATABASE neurotrade;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE neurotrade TO postgres;
```

#### 2. Backend

```bash
cd backend

# Configure environment (or set in application.yml)
export DB_HOST=localhost
export DB_NAME=neurotrade
export DB_USER=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=NeuroTradeSecretKey2024!!VeryLongAndSecureBase64EncodedString

mvn clean install -DskipTests
mvn spring-boot:run
```

Backend runs at → **http://localhost:8080**

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at → **http://localhost:5173**

---

## 🔌 API Reference

### Auth
| Method | Endpoint              | Auth | Description        |
|--------|-----------------------|------|--------------------|
| POST   | `/api/auth/register`  | ❌   | Register new user  |
| POST   | `/api/auth/login`     | ❌   | Login + get token  |

### Stocks
| Method | Endpoint                    | Auth | Description         |
|--------|-----------------------------|------|---------------------|
| GET    | `/api/stocks/public`        | ❌   | All stocks (guest)  |
| GET    | `/api/stocks`               | ✅   | All stocks          |
| GET    | `/api/stocks/{symbol}`      | ✅   | Single stock        |

### Trading
| Method | Endpoint              | Auth | Description          |
|--------|-----------------------|------|----------------------|
| POST   | `/api/trade/execute`  | ✅   | Execute BUY/SELL     |

### Portfolio
| Method | Endpoint                          | Auth | Description            |
|--------|-----------------------------------|------|------------------------|
| GET    | `/api/portfolio/summary`          | ✅   | Full portfolio summary |
| GET    | `/api/portfolio/transactions`     | ✅   | Transaction history    |
| GET    | `/api/portfolio/allocation`       | ✅   | Sector allocation      |

### AI
| Method | Endpoint            | Auth | Description           |
|--------|---------------------|------|-----------------------|
| GET    | `/api/ai/insights`  | ✅   | AI portfolio analysis |

### WebSocket
```
Connect:    ws://localhost:8080/ws  (SockJS)
Subscribe:  /topic/stocks           (live price updates every 1s)
```

---

## 🤖 AI Insights Engine

The AI module (`AiInsightsService`) is **pluggable**:

```java
// Current: rule-based
analyzePortfolio() → rule-based metrics

// Future: swap implementation
analyzePortfolio() → openAiClient.complete(prompt)
analyzePortfolio() → anthropicClient.message(prompt)
```

**Output schema:**
```json
{
  "sentiment":        "bullish",
  "confidence":       0.78,
  "advice":           "Portfolio is balanced. Monitor sector concentrations.",
  "riskScore":        42,
  "portfolioHealth":  "GOOD",
  "traderSkill": {
    "winRate":          62.5,
    "discipline":       80,
    "riskScore":        42,
    "totalTrades":      8,
    "profitableTrades": 5
  },
  "marketSignals": [
    { "symbol": "NVDA", "signal": "TAKE_PROFIT", "strength": "STRONG", "pnlPct": 12.4 }
  ],
  "aiModel": "rule-based"
}
```

---

## 📈 Stock Simulation Engine

Prices are updated every **1 second** using **Geometric Brownian Motion**:

```
newPrice = prevPrice × e^(trend + meanReversion + volatility × Z)
```

Where:
- `Z ~ N(0,1)` — Gaussian random shock
- `trend` — persistent directional bias (mutates slowly)
- `meanReversion` — pulls price toward opening value (prevents runaway)
- `volatility` — per-stock volatility factor (COIN=6%, TSLA=4.5%, MSFT=1.5%)

---

## 🎨 UI Features

| Feature                | Description                                        |
|------------------------|----------------------------------------------------|
| Live Ticker Bar        | Scrolling marquee of all 15 stocks                 |
| Price Flash Animations | Green/red cell flash on price change               |
| Glassmorphism Cards    | Frosted glass effect on all panels                 |
| Neon Indicators        | Green gains, red losses with glow effects          |
| Sector Pills           | Filter stocks by sector                            |
| Portfolio Heatmap      | Color-coded bar chart of position P&L              |
| AI Panel               | Sentiment badge, confidence meter, skill bars      |
| Day Range Bar          | Mini progress bar showing intraday price range     |

---

## 🔐 Security

- **Passwords**: BCrypt (strength 12)
- **JWT**: HS256, configurable expiry (default 24h)
- **No hardcoded credentials** — all via environment variables
- **CORS**: configurable via `CORS_ORIGINS` env var
- **Input validation**: Jakarta Bean Validation on all DTOs
- **Global error handler**: Structured JSON error responses

---

## 🧩 Plugin Architecture

The codebase is designed to be extended:

| Plugin Point              | Config                   |
|---------------------------|--------------------------|
| LLM AI backend            | `neurotrade.ai.model`    |
| Real stock price API      | Swap `StockSimulationService.simulatePrices()` |
| Payment gateway           | Add `PaymentService` interface |
| Mobile app                | REST API is already mobile-ready |
| Redis caching             | Add `@Cacheable` to stock/portfolio methods |

---

## 🏆 Built For

- ✅ **Hackathons** – Real-time simulation + AI makes it stand out
- ✅ **Portfolio Projects** – Full production stack (Auth, DB, WS, AI)
- ✅ **Interviews** – Clean architecture, proper patterns, SOLID principles
- ✅ **Learning** – Covers JWT, WebSocket, trading algorithms, React Context

---

## 📁 Environment Variables

| Variable              | Default                              | Description              |
|-----------------------|--------------------------------------|--------------------------|
| `DB_HOST`             | `localhost`                          | PostgreSQL host          |
| `DB_PORT`             | `5432`                               | PostgreSQL port          |
| `DB_NAME`             | `neurotrade`                         | Database name            |
| `DB_USER`             | `postgres`                           | Database user            |
| `DB_PASSWORD`         | `postgres`                           | Database password        |
| `JWT_SECRET`          | *(long default)*                     | JWT signing secret       |
| `JWT_EXPIRATION_MS`   | `86400000`                           | Token lifetime (24h)     |
| `CORS_ORIGINS`        | `http://localhost:5173`              | Allowed CORS origins     |
| `OPENAI_API_KEY`      | *(empty)*                            | Optional – for LLM AI    |

---

*Built with ❤️ using Spring Boot 3 + React 18 + PostgreSQL + WebSocket*
