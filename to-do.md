# ReferAI — Feature Roadmap

---

## 1. Profile Enrichment (Resume Upload + Manual Entry)

**Goal:** Let users build a rich profile so the cosine similarity matching uses real data instead of the sparse seed fields.

### What to build

**Resume upload**
- File upload input (PDF/DOCX) on the signup page and in a profile settings page
- Backend: parse with `pdfplumber` (PDF) and `python-docx` (DOCX) to extract skills, education, and experience
- Show extracted fields as a preview the user can correct before saving
- Write confirmed fields into `users` table columns

**Manual entry**
- Profile settings page (accessible after login) with sections for:
  - Skills — tag-style input (add/remove individual skills)
  - Education — add multiple entries: college, degree, branch, graduation year
  - Experience — add multiple entries: company, role, duration, one-line description
  - Target role and target company
- Changes take effect on the next `/api/match` call immediately

### Components needed

| Layer | Component |
|---|---|
| DB | No schema change — existing `skills`, `education`, `experience` columns used |
| Backend | `POST /api/profile/upload-resume` — parse file, return extracted fields |
| Backend | `PUT /api/profile` — partial update of any user fields |
| Frontend | `Profile.jsx` — new page with all sections |
| Frontend | `SkillTagInput.jsx` — add/remove skill chips |
| Frontend | `EducationEditor.jsx` — list of education entries with add/remove |
| Frontend | `ExperienceEditor.jsx` — list of experience entries with add/remove |
| Frontend | Resume upload section with extraction preview and confirm step |
| `api.js` | `uploadResume(file)`, `updateProfile(fields)` |

### Implementation checklist

- [ ] `pdfplumber` + `python-docx` added to `requirements.txt`
- [ ] `POST /api/profile/upload-resume`
- [ ] `PUT /api/profile`
- [ ] `Profile.jsx` page wired to `/profile` route in `App.jsx`
- [ ] `SkillTagInput.jsx`, `EducationEditor.jsx`, `ExperienceEditor.jsx`
- [ ] Resume upload + extraction preview
- [ ] Re-run `/api/match` after profile save so results refresh

---

## 2. Live Job & Internship Discovery

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

**Goal:** Surface relationship context on every employee card so users immediately know who they have a warm path to.

### Badge definitions

| Badge | Colour | Condition |
|---|---|---|
| **Connected** | Green | `user_employee_connections` row exists for this user + employee pair. Already tracked. |
| **Alumni** | Amber | At least one college in `user.education[].college` matches a college in `employee.education[].college` (case-insensitive) |
| **Coworker** | Purple | At least one company in `user.experience[].company` matches a company in `employee.experience[].company` (case-insensitive) |

Alumni and coworker matches also get a small score bonus (+5 each, stackable) in `/api/match` because shared background makes outreach warmer.

### Components needed

| Layer | Component |
|---|---|
| DB | No change — uses existing `education` and `experience` JSON columns on both tables |
| Backend | `/api/match` update — compute `is_alumni` and `is_coworker` for each employee result by comparing user and employee education/experience lists; add score bonus |
| Backend | Helper `shared_colleges(user, emp)` and `shared_companies(user, emp)` — return bool |
| Frontend | `Student.jsx` employee cards: show "Alumni" and "Coworker" badges alongside existing "Connected" badge |
| Frontend | `Student.jsx` employee detail panel: show relationship summary line ("Same college: IIT Bombay") |

### Implementation checklist

- [ ] `shared_colleges(user, emp)` helper in `app.py`
- [ ] `shared_companies(user, emp)` helper in `app.py`
- [ ] `/api/match` computes `is_alumni`, `is_coworker`, adds `+5` bonus per match to score
- [ ] Employee cards in `Student.jsx` show Alumni (amber) and Coworker (purple) badges
- [ ] Employee detail panel shows which college/company is shared (e.g. "IIT Bombay · both attended")

---

## 5. Student vs Professional Distinction

**Goal:** Know whether a user is a student or a working professional so the app can surface the right opportunities (internships vs full-time) and weight matches appropriately.

### How it affects matching

| Signal | Student | Professional |
|---|---|---|
| Job type shown first | Internships, new-grad roles | Full-time, experienced roles |
| Employee seniority bonus | +5 for Junior / New Grad employees (more relatable referrers for interns) | No seniority bonus — all levels equally weighted |
| Discover-jobs filter (feature 2) | Filter for internship/entry-level listings | Filter for full-time/mid-to-senior listings |
| Career companion framing | Tips oriented toward first job, internship convert | Tips oriented toward role change, promotion |

### Components needed

| Layer | Component |
|---|---|
| DB | Add `user_type TEXT DEFAULT 'student'` column to `users` table (`'student'` or `'professional'`) |
| Backend | `init_db()` — add column with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so existing DBs are not broken |
| Backend | Signup endpoint — accept and save `user_type` field |
| Backend | `/api/match` — read `user.user_type`; if `student`, apply Junior/New Grad seniority bonus (+5); adjust career companion prompt tone |
| Backend | `/api/discover-jobs` (feature 2) — pass `user_type` as a filter hint to job APIs |
| Frontend | `Auth.jsx` signup form — add a toggle or select: "I am a student" / "I am a working professional" |
| Frontend | `Student.jsx` — show a small label on the job card ("Internship match" or "Full-time match") based on `user.user_type` and job description keywords |

### Implementation checklist

- [ ] `ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'student'` in `init_db()`
- [ ] Signup endpoint updated to accept `user_type`
- [ ] SEED_USERS updated: students get `user_type: 'student'`, professionals get `user_type: 'professional'`
- [ ] `/api/match` reads `user_type` and applies seniority bonus for students
- [ ] Career companion prompt adjusted based on `user_type`
- [ ] Auth.jsx signup toggle for student / professional
- [ ] Job card label in Student.jsx reflects user type context
