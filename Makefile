# CRM HCP AI – Developer Makefile
# Usage: make <target>

.PHONY: help setup-backend setup-frontend start-backend start-frontend dev test seed

help:
	@echo ""
	@echo "  CRM HCP AI – Available Commands"
	@echo "  ────────────────────────────────"
	@echo "  make setup-backend    Install Python deps + copy .env"
	@echo "  make setup-frontend   Install Node deps + copy .env"
	@echo "  make start-backend    Run FastAPI dev server (port 8000)"
	@echo "  make start-frontend   Run React dev server (port 3000)"
	@echo "  make dev              Start both servers (requires tmux)"
	@echo "  make test             Run backend pytest suite"
	@echo "  make seed             Seed sample data (backend must be running)"
	@echo ""

setup-backend:
	cd backend && python -m venv venv && \
	. venv/bin/activate && pip install -r requirements.txt && \
	cp -n .env.example .env && \
	echo "✓ Backend ready. Edit backend/.env with your DB + Groq credentials."

setup-frontend:
	cd frontend && npm install && cp -n .env.example .env
	@echo "✓ Frontend ready."

start-backend:
	cd backend && . venv/bin/activate && uvicorn main:app --reload --port 8000

start-frontend:
	cd frontend && npm start

dev:
	@command -v tmux >/dev/null 2>&1 || (echo "Install tmux first: brew install tmux" && exit 1)
	tmux new-session -d -s crm -n backend "cd backend && . venv/bin/activate && uvicorn main:app --reload --port 8000" \; \
	split-window -h "cd frontend && npm start" \; \
	attach-session -t crm

test:
	cd backend && . venv/bin/activate && \
	pip install pytest pytest-asyncio httpx aiosqlite -q && \
	pytest tests/ -v

seed:
	@curl -s -X POST http://localhost:8000/auth/login \
	  -H "Content-Type: application/json" \
	  -d '{"username":"admin","password":"password123"}' | \
	  python3 -c "import sys,json; t=json.load(sys.stdin)['access_token']; print(t)" | \
	  xargs -I{} curl -s -X POST http://localhost:8000/interactions/seed \
	  -H "Authorization: Bearer {}" | python3 -m json.tool
