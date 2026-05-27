# ReferAI — Feature Roadmap

---

## 1. Profile Enrichment (Resume Upload + Manual Entry)

**Status: Complete**

### What was built

**Resume upload**
- File upload input (PDF/DOCX) on the profile settings page
- Backend: parses with `pdfplumber` (PDF) and `python-docx` (DOCX) to extract skills, education, and experience
- `ExtractionPreview.jsx` — shows extracted fields the user can correct before saving
- Gemini + DeepSeek as alternative LLM extractors (configurable via `.env`)

**Manual entry**
- `Profile.jsx` — full settings page with sections for skills, education, experience, target role, and target company
- `TagInput.jsx` — tag-style add/remove skill chips
- `AutocompleteInput.jsx` — autocomplete for skill/company/college dropdowns
- Education and experience entries editable inline

### Implementation checklist

- [x] `pdfplumber` + `python-docx` added to `requirements.txt`
- [x] `POST /api/profile/upload-resume`
- [x] `PUT /api/profile`
- [x] `Profile.jsx` page wired to `/profile` route in `App.jsx`
- [x] `TagInput.jsx`, `ExtractionPreview.jsx`, `AutocompleteInput.jsx`
- [x] Resume upload + extraction preview with confirm step
- [x] `/api/match` uses updated profile fields immediately after save

---

## 2. Live Job & Internship Discovery

**Status: Not started**

**Goal:** Surface real open roles matching each user's target companies and skills.

### Site research — APIs that allow programmatic access

| Source | Notes |
|---|---|
| **Adzuna** | Public REST API, free tier, covers internships + full-time globally. Needs API key. |
| **Remotive** | Public JSON feed at `remotive.com/api/remote-jobs`, no auth, remote roles only |
| **Arbeitnow** | Free public API at `arbeitnow.com/api/job-board-api`, no key needed |
| **USAJobs** | US federal roles, fully open REST API |
| LinkedIn / Indeed | Scraping violates ToS — do not use |

Start with Adzuna + Remotive. Confirm ToS before building.

### Components needed

| Layer | Component |
|---|---|
| DB | Optional `discovered_jobs` cache table, or reuse `jobs` with `is_live_extract=1` |
| Backend | `GET /api/discover-jobs` — queries external APIs, normalises to existing job schema |
| Backend | In-memory or DB 30-min cache per query |
| Frontend | Discover section/tab in Student.jsx or new `Discover.jsx` page |
| Frontend | `JobDiscoveryCard.jsx` — role, company, location, source badge, "Find referrer" CTA |
| Frontend | Filter bar: keyword, company, role type |
| `api.js` | `discoverJobs({ company, role, skills })` |

### Implementation checklist

- [ ] Evaluate Adzuna and Remotive ToS; get Adzuna API key
- [ ] `GET /api/discover-jobs` with normalisation layer
- [ ] Caching layer (30-min TTL)
- [ ] `JobDiscoveryCard.jsx`
- [ ] Discover tab in Student.jsx
- [ ] Filter bar
- [ ] "Find referrer" wires directly into `getMatches` with discovered job object

---

## 3. Outreach Tracker (Message Sent + Reply Tracking)

**Status: Not started**

**Goal:** Let users record which employees they have already messaged and whether they received a reply. Use the aggregated response rate as an additional match signal once enough data exists.

### How response rate works

- Each time any user messages an employee, it is logged in `outreach_log`
- `response_rate` for an employee = (replied rows / messaged rows) for that employee across **all** users
- This rate is **only factored into the match score once the employee has been messaged by at least 3 different users** — before that threshold there is not enough signal
- Score contribution: `response_rate × 10` added to the existing cosine score (capped at 99 overall)

### Components needed

| Layer | Component |
|---|---|
| DB | New `outreach_log` table — see schema below |
| Backend | `POST /api/outreach` — log a message sent (user_id + employee_id) |
| Backend | `PATCH /api/outreach/<id>/replied` — mark that employee replied |
| Backend | `GET /api/outreach?user_id=X` — return user's full outreach history |
| Backend | `employee_response_rate(employee_id)` helper — returns rate only if 3+ rows exist, else `None` |
| Backend | `/api/match` update — call `employee_response_rate` for each result; add `community_response_rate` field; factor into score if not `None` |
| Frontend | `Student.jsx` employee detail panel: "Mark messaged" button → `POST /api/outreach`; "Mark replied" button → `PATCH /api/outreach/<id>/replied` |
| Frontend | Employee cards in list: "Messaged" badge (blue) if user already messaged, "Replied" badge (green) if reply received |
| Frontend | `OutreachLog.jsx` — table showing all employees messaged, date sent, reply status |
| Frontend | Outreach log accessible from a "My outreach" tab or section below the results |
| `api.js` | `createOutreach({ userId, employeeId })`, `markReplied(outreachId)`, `getOutreach(userId)` |

### New DB table

```sql
CREATE TABLE IF NOT EXISTS outreach_log (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL,
    employee_id  TEXT NOT NULL,
    messaged_at  TEXT NOT NULL,
    replied_at   TEXT,              -- NULL until user marks reply
    status       TEXT NOT NULL DEFAULT 'messaged'  -- 'messaged' | 'replied' | 'no_response'
);
```

### Implementation checklist

- [ ] Add `outreach_log` table to `init_db()`
- [ ] `POST /api/outreach`
- [ ] `PATCH /api/outreach/<id>/replied`
- [ ] `GET /api/outreach?user_id=X`
- [ ] `employee_response_rate(employee_id)` helper (threshold: 3)
- [ ] `/api/match` updated to include `community_response_rate` and factor into score
- [ ] "Mark messaged" / "Mark replied" buttons in employee detail panel in `Student.jsx`
- [ ] "Messaged" / "Replied" status badges on employee cards
- [ ] `OutreachLog.jsx` component
- [ ] `api.js` additions

---

## 4. Connection, Alumni, and Coworker Badges

**Status: Complete**

### What was built

- `/api/match` computes `is_alumni` and `is_coworker` for each employee by comparing user and employee education/experience lists
- Alumni (+5) and Coworker (+5) score bonuses applied in `/api/match`, stackable with each other
- `Student.jsx` employee cards show **Alumni** (amber) and **Coworker** (purple) badges alongside the existing **Connected** (green) badge
- Employee detail panel shows which college or company is shared (e.g. "Alumni · IIT Bombay")

### Implementation checklist

- [x] `shared_colleges` / `shared_companies` logic in `/api/match`
- [x] `/api/match` computes `is_alumni`, `is_coworker`, adds `+5` bonus per match to score
- [x] Employee cards in `Student.jsx` show Alumni (amber) and Coworker (purple) badges
- [x] Employee detail panel shows which college/company is shared

---

## 5. Student vs Professional Distinction

**Status: Partial — frontend detection only**

`Student.jsx` infers whether an *employee* is a student from their education dates, and shows a "Student" badge on their card. The **user**-side `user_type` field (student vs professional) is not yet stored or used for filtering job types, seniority bonuses, or career companion tone.

### Remaining work

| Layer | Component |
|---|---|
| DB | Add `user_type TEXT DEFAULT 'student'` column to `users` table (`'student'` or `'professional'`) |
| Backend | `init_db()` — add column with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so existing DBs are not broken |
| Backend | Signup endpoint — accept and save `user_type` field |
| Backend | `/api/match` — apply Junior/New Grad seniority bonus (+5) for students; adjust career companion prompt tone |
| Backend | `/api/discover-jobs` (feature 2) — pass `user_type` as a filter hint to job APIs |
| Frontend | `Auth.jsx` signup form — add a toggle or select: "I am a student" / "I am a working professional" |
| Frontend | `Student.jsx` — show job card label ("Internship match" / "Full-time match") based on `user.user_type` |

### Implementation checklist

- [ ] `ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'student'` in `init_db()`
- [ ] Signup endpoint updated to accept `user_type`
- [ ] SEED_USERS updated: students get `user_type: 'student'`, professionals get `user_type: 'professional'`
- [ ] `/api/match` reads `user_type` and applies seniority bonus for students
- [ ] Career companion prompt adjusted based on `user_type`
- [ ] Auth.jsx signup toggle for student / professional
- [ ] Job card label in Student.jsx reflects user type context
