# How to Run ReferAI

ReferAI has two parts that must both be running: a **Flask backend** on port 5000 and a **React/Vite frontend** on port 5173. Open two terminals and keep both alive.

---

## Prerequisites

Install these before you start.

| Tool | Minimum version | How to check |
|---|---|---|
| Python | 3.10+ | `python3 --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | any | `git --version` |
| Ollama | any | `ollama --version` *(optional — only needed for AI coaching)* |

You will also need:

- A **DeepSeek API key** — free tier at [platform.deepseek.com](https://platform.deepseek.com)
- A **GitHub Personal Access Token** — create one at [github.com/settings/tokens](https://github.com/settings/tokens) with `read:user` and `read:org` scopes

---

## Step 1 — Clone the repo

```bash
git clone https://github.com/unnati-joshi/referai.git
cd referai
```

---

## Step 2 — Set up environment variables

```bash
cd referai-backend
cp .env.example .env
```

Open `.env` and fill in your keys:

```
DEEPSEEK_API_KEY=sk-...        # from platform.deepseek.com
GITHUB_PAT=github_pat_...      # from github.com/settings/tokens
```

The Ollama variables are pre-filled with sensible defaults — leave them unless you changed Ollama's port or want a different model.

> **The app works without these keys** but employee search and job parsing will only use the seed database (10 companies, 500 static profiles). With the keys, it searches GitHub live and supplements with AI-suggested profiles for any company.

---

## Step 3 — Backend

```bash
cd referai-backend   # (already here if you followed Step 2)

# Create a virtual environment (one-time)
python3 -m venv venv

# Activate it
source venv/bin/activate          # macOS / Linux
# venv\Scripts\activate           # Windows (Command Prompt)
# venv\Scripts\Activate.ps1       # Windows (PowerShell)

# Install Python dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

The SQLite database (`referai.db`) is created automatically on first run and seeded with 15 users and 500 employees. You do not need to run any migrations.

> **Keep this terminal open.** The backend must stay running.

---

## Step 4 — Frontend

Open a **new terminal** (do not close the backend one):

```bash
cd referai-frontend

# Install Node dependencies (one-time)
npm install

# Start the dev server
npm run dev
```

You should see:
```
  VITE vX.X.X  ready in Xms

  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

> **Keep this terminal open too.**

---

## Step 5 — Log in

Use any seed account:

| Email | Password |
|---|---|
| `arjun.sharma@seed.referai` | `referai123` |
| `priya.nair@seed.referai` | `referai123` |
| `rahul.verma@seed.referai` | `referai123` |

All 15 seed users share the password `referai123`. Or click **Sign up** to create your own account.

---

## Step 6 — Try it out

1. Log in with a seed account
2. Paste a job description (raw text from LinkedIn, Greenhouse, Lever, Workday, or any job board)
3. Click **Search**
4. Browse the ranked employee list — each card shows match score, department, seniority, skills, and contact links (GitHub, LinkedIn, email where available)
5. Look for the source badge above the results:
   - 🔵 **Live from GitHub** — profiles fetched from the company's GitHub org in real time
   - 🟣 **AI suggested** — profiles DeepSeek knows about from its training data
   - 🟡 **From database** — static seed data (fallback when GitHub and AI return nothing)
6. Click an employee to see their full profile, an AI-generated outreach message, and the referral request button

---

## Optional: Enable AI coaching (Ollama)

The app works without Ollama — AI sections show a static fallback message. To enable local LLM coaching:

```bash
# Install Ollama from https://ollama.com, then:
ollama pull llama3.2:3b
ollama serve                      # starts on http://127.0.0.1:11434
```

Restart the Flask backend. It will detect Ollama automatically.

To use a different model, update `OLLAMA_MODEL` in `referai-backend/.env`:

```
OLLAMA_MODEL=mistral
```

---

## Optional: Point the frontend at a different backend

If your backend runs on a different host or port, create `referai-frontend/.env.local`:

```
VITE_API_BASE_URL=http://192.168.1.X:5000
```

Then restart the frontend (`npm run dev`).

---

## Resetting the database

If you want a clean slate (re-run seeding, wipe all user-created data):

```bash
cd referai-backend
rm referai.db referai.db-shm referai.db-wal 2>/dev/null; python app.py
```

The database is recreated and re-seeded automatically on the next startup.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'flask'` | Virtual environment is not activated — run `source venv/bin/activate` first |
| `Address already in use` on port 5000 | Something else is using port 5000. Kill it: `lsof -ti:5000 \| xargs kill` |
| Browser shows CORS error | Confirm the Flask backend is running and `flask-cors` is installed (`pip install flask-cors`) |
| Frontend shows "ReferAI service request failed" | Backend is not running or is on a different port — check the terminal running `python app.py` |
| `npm install` fails | Ensure Node 18+ is installed; delete `node_modules/` and try again |
| Employee search returns seed data only | `DEEPSEEK_API_KEY` or `GITHUB_PAT` not set in `.env` — add both for live results |
| GitHub search returns no results | Token may be missing `read:org` scope — regenerate with `read:user` and `read:org` |
| AI sections show "Offline fallback" | Ollama is not running — that is fine, everything else works |
| Login returns 400 | Email field is empty or not a valid email address |
| Login returns 401 | Wrong email or password — seed passwords are all `referai123` |

---

## Project layout (quick reference)

```
referai-backend/
  app.py              ← entire backend: routes, DB, matching, seed data
  .env.example        ← copy to .env and fill in your API keys
  requirements.txt    ← Flask, flask-cors, pdfplumber, python-docx
  referai.db          ← SQLite file (gitignored, auto-created)

referai-frontend/
  src/
    pages/
      Landing.jsx     ← marketing / logged-out homepage
      Auth.jsx        ← login + signup
      Student.jsx     ← main app: job search, employee matching, referral
      Profile.jsx     ← resume upload + profile settings
    components/
      TagInput.jsx
      AutocompleteInput.jsx
    services/
      api.js          ← all API calls to the backend
  package.json
  vite.config.js
```
