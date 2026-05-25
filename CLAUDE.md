# ReferAI Algorithm Improvements

## /improve-matching

Apply the following changes to `referai-backend/app.py`. Make only the changes described. Do not reformat or reorganise unrelated code.

---

### Step 1 — Add constants and helpers after the imports block (after `from uuid import uuid4`)

Insert this entire block:

```python
# ---------------------------------------------------------------------------
# Skill synonym map — groups equivalent skill names for fuzzy matching.
# Handles cases like "Postgres" matching "PostgreSQL", "k8s" matching
# "Kubernetes", etc. that the old substring check missed entirely.
# ---------------------------------------------------------------------------
SKILL_SYNONYMS = {
    "postgresql":         {"postgres", "pg", "psql", "rdbms", "relational database"},
    "javascript":         {"js", "es6", "es2015", "ecmascript", "vanilla js"},
    "typescript":         {"ts", "typed js"},
    "python":             {"py", "python3", "python scripting"},
    "fastapi":            {"fast api", "async python apis", "starlette", "async rest"},
    "docker":             {"containerization", "containers", "dockerfile"},
    "kubernetes":         {"k8s", "container orchestration", "helm"},
    "react":              {"reactjs", "react.js", "react hooks"},
    "redis":              {"cache", "caching layer", "in-memory store"},
    "distributed systems":{"distributed computing", "consensus", "raft", "paxos"},
    "machine learning":   {"ml", "deep learning", "neural networks", "ai/ml"},
    "sql":                {"mysql", "sqlite", "database queries", "query language"},
    "aws":                {"amazon web services", "ec2", "s3", "lambda", "cloud infrastructure"},
    "ci/cd":              {"continuous integration", "github actions", "jenkins", "pipelines"},
    "rest api":           {"restful", "rest", "http api", "web api"},
}

# ---------------------------------------------------------------------------
# Scoring weights — only signals actually available from Google search
# snippets are used. Signals that require scraping full LinkedIn profiles
# (education, experience history, trust scores, equity attributes) are
# left as placeholders on the candidate object but not used in scoring yet.
#
# Available from Google snippet:  name, headline, current role, company,
#                                  skills (inferred), location (partial)
# Placeholder (self-entered later): school, past_companies, experience
# Not available / removed:         network_trust_coefficient,
#                                  growth_velocity_score, equity_boost,
#                                  culture_alignment_score
# ---------------------------------------------------------------------------
SKILL_WEIGHT        = 0.80   # dominant signal — skills readable from snippet
NETWORK_WEIGHT      = 0.20   # weak signal — only current company known for now;
                              # will strengthen once school/experience placeholders
                              # are filled in by candidates on signup
COMPANY_MATCH_BONUS = 8      # flat bonus when candidate's target company matches job


def skills_match(required_skill: str, candidate_skill: str) -> bool:
    """Return True if two skill strings refer to the same skill.

    Checks in order:
    1. Exact match
    2. Substring containment (existing behaviour, kept)
    3. Synonym group membership (new — handles Postgres/PostgreSQL etc.)
    """
    r = required_skill.lower().strip()
    c = candidate_skill.lower().strip()
    if r == c or r in c or c in r:
        return True
    for canonical, synonyms in SKILL_SYNONYMS.items():
        group = synonyms | {canonical}
        if r in group and c in group:
            return True
        if r in group and any(syn in c or c in syn for syn in group):
            return True
        if c in group and any(syn in r or r in syn for syn in group):
            return True
    return False


def network_affinity_score(path: dict, candidate: dict) -> int:
    """Compute referrer response probability from available signals only.

    Currently uses:
    - Base probability from seed / search data
    - shared_institution: +15 if referrer shares candidate's school
      (placeholder field — zero effect until candidate fills in school)
    - relationship_type: co-author/classmate/club/cold bonus
      (placeholder field — zero effect until candidate fills in experience)

    Deliberately excluded (not in Google snippet):
    - growth_velocity_score
    - network_trust_coefficient
    - equity_boost
    """
    relationship_boost = {
        "co-author": 20,
        "classmate":  15,
        "club":       10,
        "cold":        0,
    }
    base = path.get("_base_response_probability", path.get("response_probability", 50))

    # Placeholder: will activate once candidate provides school on signup
    candidate_school     = candidate.get("school", "").lower()
    shared_institution   = path.get("shared_institution", "").lower()
    alumni_bonus = 15 if (shared_institution and candidate_school and shared_institution in candidate_school) else 0

    # Placeholder: will activate once candidate provides experience history
    rel_bonus = relationship_boost.get(path.get("relationship_type", "cold"), 0)

    return min(99, max(5, base + alumni_bonus + rel_bonus))
```

---

### Step 2 — Rewrite compute_match() to use only available signals

Find and replace this exact block:

```python
def compute_match(candidate, job, dei_mode=False):
    required = set(job["skills"])
    candidate_skills = {skill.lower(): skill for skill in candidate["technical_skills"]}
    verified = {skill["name"].lower(): skill["name"] for skill in candidate["skills_matrix"] if skill["status"] == "VERIFIED"}
    matched_skills = sorted(
        skill
        for skill in required
        if skill.lower() in candidate_skills
        or skill.lower() in verified
        or any(skill.lower() in candidate_skill.lower() or candidate_skill.lower() in skill.lower() for candidate_skill in candidate["technical_skills"])
    )
    missing_skills = sorted(required.difference(matched_skills))
    skill_score = round((len(matched_skills) / max(len(required), 1)) * 100)
    referrer = best_referrer(candidate, job)
    network_score = referrer["response_probability"]
    trust_score = candidate["network_trust_coefficient"] * 10
    company_bonus = 8 if company_matches(candidate.get("target_company"), job.get("company")) else 0
    base_score = round((skill_score * 0.58) + (network_score * 0.16) + (trust_score * 0.14) + (candidate["growth_velocity_score"] * 0.08) + company_bonus)
    final_score = min(99, base_score + (candidate["equity_boost"] if dei_mode else 0))

    return {
        **candidate,
        "match_score": final_score,
        "skill_match": skill_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "skills_matrix": build_skill_matrix(candidate, job, matched_skills, missing_skills),
        "recommended_referrer": referrer,
        "explainability": [
            f"{skill_score}% skill overlap with the role",
            f"{network_score}% referrer response probability based on available network paths",
            f"{candidate['growth_velocity_score']} growth velocity score",
        ],
    }
```

Replace with:

```python
def compute_match(candidate, job, dei_mode=False):
    # --- Skill matching ---
    # Source: skills section of LinkedIn snippet + verified skills_matrix entries.
    # Uses synonym map so "Postgres" matches "PostgreSQL", "k8s" matches "Kubernetes".
    all_candidate_skills = list(candidate.get("technical_skills", [])) + [
        s["name"] for s in candidate.get("skills_matrix", []) if s.get("status") == "VERIFIED"
    ]
    required = set(job["skills"])
    matched_skills = sorted(
        skill for skill in required
        if any(skills_match(skill, cs) for cs in all_candidate_skills)
    )
    missing_skills = sorted(required.difference(matched_skills))
    skill_score = round((len(matched_skills) / max(len(required), 1)) * 100)

    # --- Network score ---
    # Source: current company from headline (already in snippet).
    # school + relationship_type are placeholder fields — they default to no
    # bonus until the candidate fills them in via signup form.
    referrer = best_referrer(candidate, job)
    network_score = network_affinity_score(referrer, candidate)

    # --- Company match bonus ---
    # Source: candidate's target_company (self-entered) vs job company.
    company_bonus = COMPANY_MATCH_BONUS if company_matches(candidate.get("target_company"), job.get("company")) else 0

    # --- Final score ---
    # Removed: network_trust_coefficient, growth_velocity_score, equity_boost
    # (none of these are available from Google search snippets)
    base_score = round(
        (skill_score * SKILL_WEIGHT)
        + (network_score * NETWORK_WEIGHT)
        + company_bonus
    )
    final_score = min(99, max(1, base_score))

    return {
        **candidate,
        "match_score": final_score,
        "skill_match": skill_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "skills_matrix": build_skill_matrix(candidate, job, matched_skills, missing_skills),
        "recommended_referrer": referrer,
        "explainability": [
            f"{skill_score}% skill overlap with the role",
            f"{network_score}% referrer affinity score (placeholder: improves with school + experience data)",
            f"Company match bonus: {'yes +' + str(COMPANY_MATCH_BONUS) if company_bonus else 'no'}",
        ],
    }
```

---

### Step 3 — Fix ai_readiness_score() to remove unavailable signals

Find this exact block inside `ai_readiness_score()`:

```python
    semantic_fit = cosine_similarity(candidate_signal_text(candidate), f"{job.get('role', '')} {job.get('description', '')} {' '.join(job.get('skills', []))}")
    evidence_score = round(
        len([skill for skill in match.get("skills_matrix", []) if skill["status"] == "VERIFIED"])
        / max(len(match.get("skills_matrix", [])), 1)
        * 100
    )
    score = round(
        (match.get("skill_match", 0) * AI_AGENT_WEIGHTS["Skill Gap Agent"])
        + (match.get("match_score", 0) * AI_AGENT_WEIGHTS["Opportunity Access Agent"])
        + (evidence_score * AI_AGENT_WEIGHTS["Work Simulation Agent"])
        + (candidate.get("growth_velocity_score", 80) * AI_AGENT_WEIGHTS["Career Discovery Agent"])
        + ((100 if candidate.get("equity_boost", 0) else 86) * AI_AGENT_WEIGHTS["Inclusion Guardrail Agent"])
        + (semantic_fit * 10)
    )
```

Replace with:

```python
    evidence_score = round(
        len([skill for skill in match.get("skills_matrix", []) if skill["status"] == "VERIFIED"])
        / max(len(match.get("skills_matrix", [])), 1)
        * 100
    )
    # Cosine over resume_signal vs job description only — avoids double-counting
    # skills that are already captured in skill_match above.
    narrative_fit = cosine_similarity(
        candidate.get("resume_signal", ""),
        f"{job.get('description', '')} {job.get('role', '')}"
    )
    # Removed: growth_velocity_score, equity_boost — not available from snippet.
    # Career Discovery and Inclusion Guardrail agent weights redistributed to
    # skill and opportunity signals until real data is available.
    score = round(
        (match.get("skill_match", 0) * AI_AGENT_WEIGHTS["Skill Gap Agent"])
        + (match.get("match_score", 0) * AI_AGENT_WEIGHTS["Opportunity Access Agent"])
        + (evidence_score * AI_AGENT_WEIGHTS["Work Simulation Agent"])
        + (narrative_fit * 5)
    )
```

---

### Step 4 — Add placeholder fields to candidate seed data

For each candidate in the `CANDIDATES` list, add these placeholder fields at the top level (alongside `school`, `current_role`, etc.). Do not remove any existing fields:

```python
"past_companies": [],        # placeholder — to be filled by candidate on signup
"experience": [],            # placeholder — to be filled by candidate on signup
```

For every dict inside `alumni_referral_paths`, add:

```python
"_base_response_probability": <copy current response_probability integer value>,
"relationship_type": "cold",     # placeholder — update when experience data available
"shared_institution": "",        # placeholder — update when school data available
```

---

### Step 5 — Verify

Run:

```bash
cd referai-backend
source venv/bin/activate
python -c "
from app import compute_match, CANDIDATES, JOBS
m = compute_match(CANDIDATES[0], JOBS[0])
print('match_score   :', m['match_score'])
print('skill_match   :', m['skill_match'])
print('matched_skills:', m['matched_skills'])
print('explainability:', m['explainability'])
"
```

Expected: `match_score` between 1–99, `matched_skills` is non-empty, no KeyError or AttributeError. If it errors show the full traceback and fix it before finishing.
