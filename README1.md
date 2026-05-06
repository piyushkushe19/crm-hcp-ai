<div align="center">

# 🏥 MedCRM — AI-First HCP Interaction Platform

### *Turn every doctor visit into structured, actionable CRM data — in seconds*

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agent-FF6B35?style=flat-square)](https://langchain-ai.github.io/langgraph)
[![Groq](https://img.shields.io/badge/Groq-gemma2--9b--it-F55036?style=flat-square)](https://groq.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-2.2-764ABC?style=flat-square&logo=redux&logoColor=white)](https://redux-toolkit.js.org)

<br/>

> A pharmaceutical CRM module where field reps log HCP interactions either through a **structured form** or by simply **typing in plain English** — and the AI does the rest.

<br/>

[🚀 Quick Start](#-quick-start) &nbsp;·&nbsp; [🧠 How It Works](#-how-it-works) &nbsp;·&nbsp; [📡 API Reference](#-api-reference) &nbsp;·&nbsp; [🎬 Demo Guide](#-video-demo-guide) &nbsp;·&nbsp; [🏗️ Architecture](#️-architecture)

---

</div>

<br/>

## 🤔 What Problem Does This Solve?

Pharmaceutical field representatives visit **10–20 doctors every single day**. After each visit, they must record structured data into a CRM — doctor name, hospital, products discussed, follow-up dates, sentiment, priority, notes.

**The old way:** Fill a long form manually at the end of a tiring day → forgotten details, inconsistent data, zero follow-through.

**The MedCRM way:**

```
Rep types:   "Met Dr. Sharma at Apollo today. He was really interested in
              Metformin XR and wants a follow-up next Tuesday."

AI returns:  ✓ HCP Name     →  Dr. Sharma
             ✓ Hospital     →  Apollo Hospital
             ✓ Product      →  Metformin XR
             ✓ Sentiment    →  Positive
             ✓ Follow-up    →  2025-01-14  (calculated from "next Tuesday")
             ✓ Priority     →  High
             ✓ Summary      →  Doctor showed strong interest in diabetes launch...
             ✓ Next Action  →  Send clinical trial data within 48 hours
```

**Result:** A fully structured, saved CRM record in under 10 seconds — with zero manual field entry.

<br/>

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📋 **Structured Form** | Traditional 12-field CRM form for precise manual entry |
| 🤖 **AI Chat Logging** | Type naturally → LangGraph agent extracts all CRM fields instantly |
| 💡 **Next Best Action** | AI recommends the single most impactful follow-up move |
| 🛡️ **Compliance Checker** | Auto-flags risky pharma language before it becomes a legal issue |
| 🔍 **HCP Profile Lookup** | Instant history of any doctor's past interactions |
| ✏️ **Edit Interactions** | AI-assisted editing — describe what to change, AI finds the fields |
| 📊 **Dashboard Analytics** | Sentiment trends, priority accounts, follow-up tracker |
| 🔐 **JWT Auth** | Secure token-based login with bcrypt password hashing |

<br/>

---

## 🧠 How It Works

### The LangGraph Agent

The core intelligence is a **LangGraph state machine** called `HCPInteractionAgent`. It routes every message through the right tool automatically using intent detection:

```
                    ┌────────────────────────────────┐
                    │          User Input             │
                    │  "I met Dr. Sharma today..."    │
                    └───────────────┬────────────────┘
                                    │
                                    ▼
                         ┌──────────────────┐
                         │  detect_intent   │  ← Groq LLM classifies intent
                         └────────┬─────────┘
                                  │
             ┌────────────────────┼──────────────────────┐
             ▼            ▼               ▼         ▼              ▼
   ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐
   │     Log      │ │   Edit   │ │  Lookup  │ │  NBA   │ │ Compliance   │
   │ Interaction  │ │Interaction│ │  HCP     │ │  Tool  │ │  Checker     │
   │   Tool  ①   │ │  Tool ②  │ │ Tool ③   │ │ Tool ④ │ │  Tool  ⑤   │
   └──────┬───────┘ └────┬─────┘ └────┬─────┘ └────┬───┘ └──────┬───────┘
          └──────────────┴────────────┴─────────────┴────────────┘
                                       │
                                       ▼
                             ┌──────────────────┐
                             │  Structured JSON  │
                             │  + NBA Tip        │
                             │  + Compliance     │
                             └──────────────────┘
```

### The 5 Agent Tools

| # | Tool | Triggered When Rep Says | Output |
|---|------|------------------------|--------|
| ① | **Log Interaction** | *"I met / visited / called Dr…"* | Full structured CRM fields from natural language |
| ② | **Edit Interaction** | *"Update / change / modify…"* | Only the fields that need changing (partial patch) |
| ③ | **HCP Profile Lookup** | *"Show history / profile for…"* | Summarised interaction history for that doctor |
| ④ | **Next Best Action** | *"What should I do / next step…"* | One specific, actionable follow-up recommendation |
| ⑤ | **Compliance Checker** | *"Check compliance / review this…"* | List of flagged risky or non-compliant phrases |

All tools use **Groq API with `gemma2-9b-it`** at `temperature=0` for deterministic extraction.

<br/>

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       FRONTEND  (React 18)                        │
│                                                                    │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────┐  ┌────────┐  │
│  │  Login Page  │  │ Log Interaction │  │   List   │  │  Demo  │  │
│  │              │  │  Form | Chat   │  │ + Filter │  │ Tools  │  │
│  └──────────────┘  └────────────────┘  └──────────┘  └────────┘  │
│                                                                    │
│  ┌──────────────────────── Redux Toolkit Store ─────────────────┐  │
│  │   authSlice  ·  interactionsSlice  ·  uiSlice (toasts)      │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                             │  REST  (Axios + JWT Bearer token)
┌────────────────────────────▼─────────────────────────────────────┐
│                       BACKEND  (FastAPI)                          │
│                                                                    │
│   /auth/login   /interactions/*   /ai/chat-log   /ai/demo-tool   │
│                                                                    │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │                    LangGraph Agent                         │    │
│  │    detect_intent → [log | edit | lookup | nba | compliance]│    │
│  │                    Groq API  (gemma2-9b-it)               │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │           SQLAlchemy (async) + PostgreSQL 14+              │    │
│  │                   interactions table                       │    │
│  └───────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

<br/>

---

## 🗂️ Project Structure

```
crm-hcp-ai/
│
├── 📁 backend/
│   ├── main.py                        # FastAPI app, CORS, lifespan hooks
│   ├── requirements.txt
│   ├── alembic.ini                    # DB migration config
│   ├── pytest.ini
│   │
│   └── 📁 app/
│       ├── 📁 core/
│       │   ├── config.py             # Pydantic settings — reads .env
│       │   └── security.py           # JWT create/verify, bcrypt, auth dep
│       │
│       ├── 📁 db/
│       │   └── database.py           # Async engine, session factory, Base
│       │
│       ├── 📁 models/
│       │   └── interaction.py        # SQLAlchemy ORM model
│       │
│       ├── 📁 schemas/
│       │   └── interaction.py        # Pydantic request / response schemas
│       │
│       ├── 📁 agents/
│       │   └── hcp_agent.py          # ★ LangGraph agent + all 5 tools
│       │
│       └── 📁 api/
│           ├── auth.py               # POST /auth/login
│           ├── interactions.py       # Full CRUD + /seed demo data
│           └── ai_chat.py            # /ai/chat-log + /ai/demo-tool
│
├── 📁 frontend/
│   ├── package.json
│   │
│   └── 📁 src/
│       ├── App.js                    # Router + Redux Provider + auth guard
│       ├── styles/global.css         # Design tokens, animations, components
│       ├── utils/api.js              # Axios + JWT interceptor + 401 handler
│       │
│       ├── 📁 store/slices/
│       │   ├── authSlice.js          # Login thunk + localStorage persistence
│       │   ├── interactionsSlice.js  # CRUD thunks (fetch/log/edit/delete)
│       │   └── uiSlice.js            # Toast notifications + global loading
│       │
│       ├── 📁 components/
│       │   ├── layout/Sidebar.jsx    # Dark fixed nav with active highlights
│       │   ├── layout/Header.jsx     # Top bar with search + user avatar
│       │   ├── interactions/
│       │   │   ├── StructuredForm.jsx   # 12-field form with toggle switch
│       │   │   └── InteractionCard.jsx  # Expandable card with inline edit
│       │   ├── chat/AIChatLogger.jsx # Chat UI + live extraction display
│       │   └── shared/Toast.jsx      # Auto-dismiss notification toasts
│       │
│       └── 📁 pages/
│           ├── LoginPage.jsx         # Split-screen brand + credential form
│           ├── DashboardPage.jsx     # 4 stat cards + recent interactions
│           ├── LogInteractionPage.jsx  # ★ Main screen: Form tab + AI tab
│           ├── InteractionsPage.jsx  # Search + filter + full list
│           └── DemoPage.jsx          # ★ Live sandbox for all 5 agent tools
│
├── Makefile                          # Dev shortcuts (setup, start, test, seed)
└── README.md
```

<br/>

---

## 🚀 Quick Start

### Prerequisites

| Tool | Min Version | Check |
|------|-------------|-------|
| Python | 3.11+ | `python --version` |
| Node.js | 18+ | `node --version` |
| PostgreSQL | 14+ | `psql --version` |
| Groq API Key | Free | [console.groq.com](https://console.groq.com) |

---

### Step 1 — Create the Database

```bash
psql -U postgres
CREATE DATABASE crm_hcp;
\q
```

---

### Step 2 — Backend Setup

```bash
cd crm-hcp-ai/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install all Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/crm_hcp
SECRET_KEY=replace-with-any-long-random-string
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=gemma2-9b-it
ALLOWED_ORIGINS=http://localhost:3000
```

> Get a **free** Groq API key at [console.groq.com](https://console.groq.com) → API Keys → Create

```bash
# Launch the API server (DB tables auto-create on first run)
uvicorn main:app --reload --port 8000
```

| URL | Purpose |
|-----|---------|
| http://localhost:8000/health | Verify server is running |
| http://localhost:8000/docs | Interactive Swagger API docs |

---

### Step 3 — Frontend Setup

Open a **new terminal tab**:

```bash
cd crm-hcp-ai/frontend

npm install

cp .env.example .env
# Ensure .env contains: REACT_APP_API_URL=http://localhost:8000

npm start
```

Browser opens at **http://localhost:3000**

---

### Step 4 — Login & Load Data

```
Username:  admin
Password:  password123
```

On the Dashboard, click **"Load Sample Data"** to seed 5 realistic HCP interaction records instantly.

---

### Makefile Shortcuts

```bash
make setup-backend    # Install Python deps + copy .env
make setup-frontend   # Install Node deps + copy .env
make start-backend    # Run uvicorn on port 8000
make start-frontend   # Run React dev server on port 3000
make test             # Run pytest integration suite
make seed             # POST sample data via API
```

<br/>

---

## 📡 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/auth/login` | ❌ | Get JWT access token |

```json
// Request
{ "username": "admin", "password": "password123" }

// Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": { "username": "admin", "full_name": "Alex Johnson", "role": "Field Rep" }
}
```

---

### Interactions (CRUD)

All routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/interactions` | List all (newest first) |
| `POST` | `/interactions/log` | Create new interaction |
| `PUT` | `/interactions/edit/{id}` | Partial update |
| `DELETE` | `/interactions/{id}` | Delete by ID |
| `POST` | `/interactions/seed` | Load 5 sample demo records |

---

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/chat-log` | Run LangGraph agent on free-text input |
| `POST` | `/ai/demo-tool/{tool}` | Force a specific tool: `log` `edit` `lookup` `nba` `compliance` |

```json
// POST /ai/chat-log  — Request
{
  "message": "Met Dr. Sharma at Apollo. Discussed Metformin XR. Very interested.",
  "save": false
}

// Response
{
  "extracted": {
    "hcp_name": "Dr. Sharma",
    "hospital": "Apollo",
    "products": "Metformin XR",
    "sentiment": "Positive",
    "follow_up_required": false,
    "summary": "Field rep visited Dr. Sharma...",
    "priority_level": "Medium",
    "next_best_action": "Send clinical data pack within 48 hours.",
    "compliance_issues": []
  },
  "saved_id": null,
  "message": "Interaction extracted successfully."
}
```

<br/>

---

## 🌍 Environment Variables

### Backend

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL async URL (`postgresql+asyncpg://...`) |
| `SECRET_KEY` | ✅ | — | JWT signing secret — use a long random string |
| `GROQ_API_KEY` | ✅ | — | Your Groq API key |
| `GROQ_MODEL` | ❌ | `gemma2-9b-it` | Also supports `llama-3.3-70b-versatile` |
| `ALGORITHM` | ❌ | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `60` | Token lifetime |
| `ALLOWED_ORIGINS` | ❌ | `http://localhost:3000` | CORS allowed origins |

### Frontend

| Variable | Required | Description |
|----------|:--------:|-------------|
| `REACT_APP_API_URL` | ✅ | Backend base URL — no trailing slash |

<br/>

---

## 🎬 Video Demo Guide

Follow this sequence to showcase every feature:

**① Login Screen**
Navigate to `http://localhost:3000` → enter `admin` / `password123`

**② Dashboard + Seed Data**
Click **"Load Sample Data"** → see 5 HCP interactions populate with stats cards updating live

**③ Structured Form (Tab A)**
Sidebar → **Log Interaction** → **Structured Form** tab → fill all fields including the Follow-up toggle → click **Log Interaction** → toast confirmation appears

**④ AI Chat Logging (Tab B)**
Switch to **AI Chat Logging** tab → click an example prompt bubble → watch the AI extraction card animate in with all parsed fields → click **Save Interaction**

**⑤ All Interactions Page**
Sidebar → **All Interactions** → type in the search box → change the sentiment filter → expand a card → edit notes inline → save → delete a record

**⑥ AI Tools Demo (all 5 tools)**
Sidebar → **AI Tools Demo** → click **Run Tool** on each panel in order — show the JSON agent output for each of the 5 LangGraph tools

<br/>

---

## 🧪 Running Tests

```bash
cd backend
source venv/bin/activate

# Install test dependencies (once)
pip install pytest pytest-asyncio httpx aiosqlite

# Run test suite
pytest tests/ -v
```

Tests use **in-memory SQLite** — no PostgreSQL required for CI.

Tests cover: login success, wrong password, create, list, edit, delete, 404 handling, auth guard, health endpoint.

<br/>

---

## 🛠️ Tech Stack Decisions

| Layer | Technology | Reason |
|-------|-----------|--------|
| **AI Agent** | LangGraph | Stateful graph enables clean intent detection → tool routing in one pipeline |
| **LLM** | Groq `gemma2-9b-it` | Fastest inference; `temperature=0` for deterministic field extraction |
| **API** | FastAPI | Async-native, auto Swagger docs, Pydantic v2 validation built-in |
| **ORM** | SQLAlchemy 2.0 async | Type-safe, async-ready, Alembic migration support |
| **Auth** | python-jose + bcrypt | Industry-standard JWT with secure password hashing |
| **Frontend** | React 18 | Component model with fine-grained re-renders |
| **State** | Redux Toolkit | Predictable state, async thunks, DevTools support |
| **HTTP Client** | Axios + interceptors | Automatic JWT injection, centralised 401 redirect |
| **Styling** | CSS custom properties | Zero runtime cost, full theming via design tokens |

<br/>

---

## 🔮 Production Checklist

- [ ] Replace demo users with a proper `users` table and registration flow
- [ ] Use `alembic upgrade head` for schema migrations (not `create_all`)
- [ ] Put FastAPI behind nginx with HTTPS / TLS
- [ ] Add rate limiting on `/ai/chat-log` to control LLM API costs
- [ ] Add Redis caching for HCP profile lookups
- [ ] Integrate Sentry for error monitoring (backend + frontend)
- [ ] Containerise with Docker Compose for consistent deploys
- [ ] Store JWT in `HttpOnly` cookies instead of `localStorage`

<br/>

---

<div align="center">

**Built with FastAPI · LangGraph · Groq · React · Redux Toolkit · PostgreSQL**

*Interview assignment — demonstrating AI-first CRM architecture*

</div>
