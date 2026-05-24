# ReferAI — How to Run

ReferAI has two parts: a **Flask backend** (`referai-backend/`) and a **React + Vite frontend** (`referai-frontend/`). Run both simultaneously in separate terminals.

---

## Prerequisites

| Tool | Minimum version | Check |
|------|----------------|-------|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Ollama *(optional)* | any | `ollama --version` |

---

## 1. Backend (Flask)

```bash
cd referai-backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the development server
python app.py
```

The backend starts on **http://127.0.0.1:5000** by default.

### Environment variables (all optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Where your Ollama instance is running |
| `OLLAMA_MODEL` | `llama3.2:3b` | Which local model to use for AI features |

Set them in your shell before running, e.g.:

```bash
export OLLAMA_BASE_URL=http://127.0.0.1:11434
export OLLAMA_MODEL=llama3.2:3b
python app.py
```

---

## 2. Frontend (React + Vite)

Open a **second terminal**:

```bash
cd referai-frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend starts on **http://localhost:5173** and proxies API calls to the Flask backend at `http://127.0.0.1:5000`.

### Optional: point the frontend at a different backend

Create `referai-frontend/.env.local`:

```
VITE_API_BASE_URL=http://127.0.0.1:5000
```

---

## 3. AI features (Ollama — optional)

The app works fully without Ollama; AI coaching text is replaced with static fallback messages when Ollama is unavailable.

To enable local AI:

```bash
# Install Ollama from https://ollama.com
ollama pull llama3.2:3b   # or any model you prefer
ollama serve              # starts on port 11434 by default
```

Then start the backend as normal. The `OLLAMA_MODEL` env var lets you swap models.

---

## 4. Quick-start (all three in one go)

```bash
# Terminal 1 — backend
cd referai-backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python app.py

# Terminal 2 — frontend
cd referai-frontend && npm install && npm run dev

# Terminal 3 — Ollama (optional)
ollama pull llama3.2:3b && ollama serve
```

Open **http://localhost:5173** in your browser.

---

## Project structure

```
referai-backend/
  app.py            # All Flask routes and business logic
  requirements.txt  # Python dependencies

referai-frontend/
  src/
    pages/          # Student, Recruiter, Employee, Landing, Auth views
    components/     # Reusable UI widgets (SkillGap, NetworkGraph, etc.)
    services/api.js # All fetch calls to the backend
    data/seedData.json
  package.json
  vite.config.js
```

---

## Common issues

| Problem | Fix |
|---------|-----|
| `ModuleNotFoundError: flask` | Make sure your virtualenv is activated before running `python app.py` |
| `CORS error` in browser | Confirm the backend is running on port 5000 and `flask-cors` is installed |
| Frontend can't reach backend | Check `VITE_API_BASE_URL` or confirm Flask is on `127.0.0.1:5000` |
| AI features show "unavailable" | Ollama isn't running or the model isn't pulled — that's fine, the app still works |
| `npm install` fails | Ensure Node 18+ is installed; try deleting `node_modules` and re-running |
