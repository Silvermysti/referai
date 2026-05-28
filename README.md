# ReferAI

ReferAI helps job-seekers find the right internal referrer at their target company. Paste a job description, get a ranked list of employees whose background aligns with the role, generate a personalised outreach message, and send a referral request — all in one place.

---

## What it does

- **Parse any job description** — paste raw text from LinkedIn, Greenhouse, Lever, Workday, or anywhere; role, company, skills, tech stack, and location are extracted automatically via DeepSeek
- **Live employee discovery** — searches GitHub org members in real time; supplements with AI-suggested profiles from DeepSeek's training knowledge for companies with low GitHub presence
- **Source badge** — results are labelled "Live from GitHub", "AI suggested", or "From database" so you always know where the data came from
- **Rank employees by match score** — skill overlap + shared background between the job, employee profile, and your own resume
- **Contact info on every card** — GitHub profile, LinkedIn, and email links extracted directly from public profiles
- **Profile enrichment** — upload a PDF/DOCX resume or fill in skills, education, and experience manually; match scores update immediately
- **AI career companion** — skill gap analysis and personalised coaching tips (requires Ollama locally; works without it too)
- **Referral requests** — send and track requests with reward tracking

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Python 3.10+, Flask, SQLite |
| Employee discovery | GitHub REST API (live org/user search) + DeepSeek (AI-suggested profiles) |
| Job parsing & resume extraction | DeepSeek (`deepseek-chat`) |
| AI coaching | Ollama (optional, local — `llama3.2:3b` default) |
| Matching | Skill synonym map + TF-IDF cosine similarity (pure Python, no ML deps) |

---

## Project structure

```
referai/
├── referai-backend/
│   ├── app.py              # All Flask routes, DB schema, matching logic, seed data
│   ├── .env.example        # Environment variable reference — copy to .env and fill in
│   ├── referai.db          # SQLite database (auto-created on first run, gitignored)
│   └── requirements.txt    # Python deps (Flask, flask-cors, pdfplumber, python-docx)
│
├── referai-frontend/
│   ├── src/
│   │   ├── pages/          # Landing, Auth, Student (main app), Profile (settings)
│   │   ├── components/     # TagInput, AutocompleteInput, ExtractionPreview, Layout, etc.
│   │   └── services/api.js # All fetch calls to the backend
│   ├── package.json
│   └── vite.config.js
│
├── to-do.md                # Feature roadmap (statuses kept up to date)
└── how-to-run.md           # Step-by-step setup guide
```

---

## Seed data

The database seeds automatically on first run:

- **15 users** — diverse job-seekers from Indian colleges (IIT, BITS, NIT, IIIT, DTU, etc.)
- **500 employees** — 50 per company across 10 companies (Stripe, Google, Microsoft, Flipkart, Netflix, Amazon, Razorpay, Zepto, Meesho, Swiggy), spread across Engineering, Data/ML, DevOps, Mobile, Security, and Product departments

Live search via GitHub and DeepSeek always runs first; the seed DB is only the last-resort fallback.

---

## Quick start

See **[how-to-run.md](how-to-run.md)** for the full setup guide.

**TL;DR — two terminals:**

```bash
# Terminal 1: backend
cd referai-backend
cp .env.example .env           # fill in DEEPSEEK_API_KEY and GITHUB_PAT
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python app.py

# Terminal 2: frontend
cd referai-frontend && npm install && npm run dev
```

Open **http://localhost:5173** and log in with any seed account (e.g. `arjun.sharma@seed.referai` / `referai123`).

---

## Seed login credentials

Any of the 15 seed users can be used to log in. All share the password `referai123`.

| Email | Password |
|---|---|
| `arjun.sharma@seed.referai` | `referai123` |
| `priya.nair@seed.referai` | `referai123` |
| `rahul.verma@seed.referai` | `referai123` |

> Full list: `arjun.sharma`, `priya.nair`, `rahul.verma`, `sneha.patel`, `karthik.rajan`, `ananya.krishnan`, `rohan.mehta`, `divya.iyer`, `vikram.singh`, `meera.subramanian`, `aditya.kumar`, `pooja.desai`, `nikhil.gupta`, `shreya.chatterjee`, `tanvi.shah` — all at `@seed.referai`. Create a new account via the signup page to test with a custom profile.

---

## Environment variables

Set in `referai-backend/.env` (copy from `.env.example`).

| Variable | Required | Purpose |
|---|---|---|
| `DEEPSEEK_API_KEY` | **Yes** | Job parsing, resume extraction, AI employee suggestions |
| `GITHUB_PAT` | **Yes** | Live employee search via GitHub org/user API |
| `OLLAMA_BASE_URL` | No | Local Ollama server for AI coaching (default: `http://127.0.0.1:11434`) |
| `OLLAMA_MODEL` | No | Ollama model to use (default: `llama3.2:3b`) |
| `VITE_API_BASE_URL` | No | Backend URL the frontend points at (default: `http://127.0.0.1:5000`) |

The app runs without `DEEPSEEK_API_KEY` and `GITHUB_PAT` but employee search and job parsing will fall back to the seed database only.

---

## Contributing

Branch off `main`, work on a feature branch, open a PR back to `main`. The active development branch is `Breeti`.

See `to-do.md` for planned features and their current status.
