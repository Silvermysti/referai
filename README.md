# ReferAI

ReferAI helps job-seekers find the right internal referrer at their target company. Paste a job link, get a ranked list of employees whose background aligns with the role, generate a personalised outreach message, and send a referral request — all in one place.

---

## What it does

- **Parse any job URL** — extracts role, company, skills, and description automatically
- **Rank employees by match score** — skill overlap + network affinity between the job, employee background, and the user's own profile
- **Relationship badges** — Connected (green), Alumni (amber), and Coworker (purple) badges surface warm paths instantly; shared school/company shown inline
- **Profile enrichment** — upload a PDF/DOCX resume or fill in skills, education, and experience manually; match scores update immediately
- **AI career companion** — skill gap analysis and personalised coaching tips (requires Ollama locally; works without it too)
- **Referral requests** — send and track requests with reward tracking
- **Outreach log** *(planned)* — track who you have messaged and whether they replied

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Python 3.10+, Flask, SQLite |
| AI / LLM | Ollama (optional, local); Gemini or DeepSeek for resume extraction |
| Matching | Skill synonym matching + TF-IDF cosine similarity (pure Python, no ML deps) |

---

## Project structure

```
referai/
├── referai-backend/
│   ├── app.py              # All Flask routes, DB schema, matching logic, seed data
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
├── .env.example            # Environment variable reference
├── to-do.md                # Feature roadmap (statuses kept up to date)
└── how-to-run.md           # Step-by-step setup guide
```

---

## Seed data

The database seeds automatically on first run:

- **15 users** — diverse job-seekers from Indian colleges (IIT, BITS, NIT, IIIT, DTU, etc.)
- **500 employees** — 50 per company across 10 companies (Stripe, Google, Microsoft, Flipkart, Netflix, Amazon, Razorpay, Zepto, Meesho, Swiggy), spread across Engineering, Data/ML, DevOps, Mobile, Security, and Product departments

---

## Quick start

See **[how-to-run.md](how-to-run.md)** for the full setup guide.

**TL;DR — two terminals:**

```bash
# Terminal 1: backend
cd referai-backend && python -m venv venv && source venv/bin/activate
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

All optional — the app runs with defaults out of the box.

| Variable | Default | Purpose |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Local Ollama server for AI features |
| `OLLAMA_MODEL` | `llama3.2:3b` | Which model Ollama should use |
| `VITE_API_BASE_URL` | `http://127.0.0.1:5000` | Backend URL the frontend points at |
| `GEMINI_API_KEY` | — | Enables Gemini for resume extraction |
| `DEEPSEEK_API_KEY` | — | Enables DeepSeek as alternative resume extractor |

---

## Contributing

Branch off `main`, work on a feature branch, open a PR back to `main`. The active development branch is `Breeti`.

See `to-do.md` for planned features and their current status.
