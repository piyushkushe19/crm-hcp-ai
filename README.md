# 🏥 MedCRM – AI-First CRM HCP Module

> A production-grade CRM for pharmaceutical field representatives to log, analyse, and act on Healthcare Professional (HCP) interactions using AI.

---

## 🎯 Overview

MedCRM enables field reps to log HCP interactions in two ways:

| Mode | Description |
|------|-------------|
| **Structured Form** | Traditional form with all CRM fields |
| **AI Chat Logging** | Type in natural language → LangGraph agent extracts structured data |

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Redux Toolkit + React Router v6 |
| Backend | Python 3.11 + FastAPI |
| AI Agent | LangGraph + LangChain |
| LLM | Groq API (`gemma2-9b-it`) |
| Database | PostgreSQL + SQLAlchemy (async) |
| Auth | JWT (python-jose + bcrypt) |
| Fonts | DM Sans (headings) + Inter (body) |

---

## 📁 Project Structure

```
crm-hcp-ai/
├── backend/
│   ├── main.py                     # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── core/
│       │   ├── config.py           # Pydantic settings
│       │   └── security.py         # JWT + bcrypt
│       ├── db/
│       │   └── database.py         # Async SQLAlchemy engine
│       ├── models/
│       │   └── interaction.py      # ORM model
│       ├── schemas/
│       │   └── interaction.py      # Pydantic request/response schemas
│       ├── agents/
│       │   └── hcp_agent.py        # LangGraph HCPInteractionAgent (5 tools)
│       └── api/
│           ├── auth.py             # POST /auth/login
│           ├── interactions.py     # CRUD /interactions/*
│           └── ai_chat.py          # POST /ai/chat-log
│
├── frontend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── App.js                  # Router + Provider
│       ├── index.js
│       ├── styles/global.css       # Design tokens + global styles
│       ├── utils/api.js            # Axios client with interceptors
│       ├── store/
│       │   ├── index.js            # Redux store
│       │   └── slices/
│       │       ├── authSlice.js
│       │       ├── interactionsSlice.js
│       │       └── uiSlice.js
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.jsx
│       │   │   └── Header.jsx
│       │   ├── interactions/
│       │   │   ├── StructuredForm.jsx
│       │   │   └── InteractionCard.jsx
│       │   ├── chat/
│       │   │   └── AIChatLogger.jsx
│       │   └── shared/
│       │       └── Toast.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── DashboardPage.jsx
│           ├── LogInteractionPage.jsx
│           ├── InteractionsPage.jsx
│           └── DemoPage.jsx
│
└── README.md
```

---

## ⚙️ Backend Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Groq API key ([get one free](https://console.groq.com))

### 1. Create & activate virtual environment
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/crm_hcp
SECRET_KEY=your-super-secret-key
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=gemma2-9b-it
ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Create PostgreSQL database
```sql
CREATE DATABASE crm_hcp;
```

### 5. Run the server
```bash
uvicorn main:app --reload --port 8000
```

Tables are created automatically on startup.

**API docs available at:** http://localhost:8000/docs

---

## 💻 Frontend Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

`.env` contents:
```env
REACT_APP_API_URL=http://localhost:8000
```

### 3. Start development server
```bash
npm start
```

App runs at: http://localhost:3000

**Demo login:** `admin` / `password123`

---

## 🔑 Environment Variables

### Backend (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `SECRET_KEY` | JWT signing secret | — |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL | `60` |
| `GROQ_API_KEY` | Groq API key | — |
| `GROQ_MODEL` | LLM model name | `gemma2-9b-it` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000` |

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend base URL |

---

## 🧠 How LangGraph Works

### Agent Architecture

```
User Input (natural language)
        ↓
  detect_intent node
  (LLM classifies intent)
        ↓
  ┌─────────────────────────────────────┐
  │  Conditional Router                 │
  └──┬──────┬───────┬────────┬──────────┘
     ↓      ↓       ↓        ↓        ↓
  [Tool 1] [Tool 2] [Tool 3] [Tool 4] [Tool 5]
  log      edit    lookup    nba      compliance
     ↓      ↓       ↓        ↓        ↓
          ← ← ← ←  END  → → → →
```

### 5 Agent Tools

| # | Tool | Trigger Phrase | Output |
|---|------|----------------|--------|
| 1 | **Log Interaction** | "I met / visited / called..." | Extracted CRM fields JSON |
| 2 | **Edit Interaction** | "Update / change / modify..." | Partial update fields JSON |
| 3 | **HCP Profile Lookup** | "Show history / profile for..." | Doctor interaction summary |
| 4 | **Next Best Action** | "What should I do / next step..." | Recommended follow-up action |
| 5 | **Compliance Checker** | "Check compliance / is this okay..." | List of compliance flags |

### LLM Config
```python
from langchain_groq import ChatGroq

llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model="gemma2-9b-it",   # or "llama-3.3-70b-versatile"
    temperature=0,
    max_tokens=1024,
)
```

---

## 📡 API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/login` | Returns JWT token |

### Interactions
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/interactions` | List all interactions |
| POST | `/interactions/log` | Create new interaction |
| PUT | `/interactions/edit/{id}` | Update interaction |
| DELETE | `/interactions/{id}` | Delete interaction |
| POST | `/interactions/seed` | Load 5 sample records |

### AI
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/ai/chat-log` | Run LangGraph agent on text |
| POST | `/ai/demo-tool/{tool}` | Test specific agent tool |

---

## 🎬 Video Demo Instructions

### Step 1 – Login
- Open http://localhost:3000
- Login with `admin` / `password123`

### Step 2 – Load Sample Data
- Go to Dashboard
- Click "Load Sample Data" to seed 5 HCP interactions

### Step 3 – Structured Form (Tab A)
- Go to "Log Interaction"
- Fill in the form and click "Log Interaction"

### Step 4 – AI Chat Logging (Tab B)
- Switch to "AI Chat Logging" tab
- Click one of the example prompts OR type your own
- Show the live extraction of CRM fields
- Click "Save Interaction"

### Step 5 – View All Interactions
- Go to "All Interactions"
- Show search, filter, expand, edit notes, delete

### Step 6 – AI Tools Demo (All 5 Tools)
- Go to "AI Tools Demo" page
- Click "Run Tool" on each of the 5 panels
- Show the agent output JSON for each tool

---

## 🔧 Development Notes

### Switching LLM Model
In `.env`:
```env
GROQ_MODEL=llama-3.3-70b-versatile
```

### Running tests (backend)
```bash
pip install pytest pytest-asyncio httpx
pytest
```

### Production considerations
- Replace `hash_password` demo users with a proper `users` table
- Use Alembic for DB migrations instead of `create_all`
- Enable HTTPS and secure cookie storage for JWT
- Add rate limiting on `/ai/chat-log` (LLM calls are expensive)
- Consider Redis for session/cache layer

---

## 📄 License

MIT © 2024 – Built for interview assignment demonstration purposes.
