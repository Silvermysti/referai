import html
import json
import os
import re
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import quote, unquote, urlparse
from urllib.request import Request, urlopen
from uuid import uuid4

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


JOBS = [
    {
        "id": "job_stripe_backend",
        "company": "Stripe",
        "role": "Backend Performance Engineer",
        "location": "Bengaluru / Remote",
        "level": "Internship to New Grad",
        "skills": [
            "Distributed Systems Design",
            "FastAPI & Async IO Optimization",
            "Redis Layer Caching Strategies",
            "Idempotent API Architecture",
            "PostgreSQL",
            "Docker & Kubernetes",
        ],
        "description": "Build reliable payment infrastructure, reduce latency, and design safe APIs for high-volume transaction systems.",
    },
    {
        "id": "job_vercel_frontend",
        "company": "Vercel",
        "role": "Frontend Platform Engineer",
        "location": "Hybrid",
        "level": "New Grad",
        "skills": [
            "React",
            "Edge Computing Middleware",
            "AST Parsers",
            "Web Performance",
            "TypeScript",
        ],
        "description": "Improve developer workflows, framework performance, and edge-rendered user experiences.",
    },
]


CANDIDATES = [
    {
        "id": "cand_01",
        "full_name": "Meera Karan",
        "anonymous_id": "Candidate Alpha",
        "school": "IIT Madras Affiliate",
        "current_role": "Early-career Backend Engineer",
        "target_company": "Stripe",
        "target_role": "Backend Performance Engineer",
        "technical_skills": [
            "Distributed Systems Design",
            "FastAPI & Async IO Optimization",
            "Redis Layer Caching Strategies",
            "Python",
            "Docker & Kubernetes",
            "PostgreSQL",
        ],
        "growth_velocity_score": 96,
        "culture_alignment_score": 92,
        "network_trust_coefficient": 9.4,
        "equity_boost": 6,
        "resume_signal": "Open-source Raft consensus engine, event gateway optimization, and cloud infrastructure projects.",
        "skills_matrix": [
            {
                "name": "Distributed Systems Design",
                "status": "VERIFIED",
                "proof_of_work": "Built an open-source Raft consensus engine with 800+ GitHub stars.",
            },
            {
                "name": "FastAPI & Async IO Optimization",
                "status": "VERIFIED",
                "proof_of_work": "Optimized a high-throughput event gateway reducing memory consumption by 34%.",
            },
            {
                "name": "Redis Layer Caching Strategies",
                "status": "VERIFIED",
                "proof_of_work": "Implemented cache eviction algorithms for multi-tenant architectures.",
            },
            {
                "name": "Idempotent API Architecture",
                "status": "MISSING",
                "proof_of_work": "Design a double-spend prevention fallback for payment retries.",
            },
        ],
        "alumni_referral_paths": [
            {
                "id": "emp_rahul",
                "alumnus_name": "Rahul Subramanian",
                "alumnus_role": "Staff Software Engineer",
                "alumnus_company": "Stripe",
                "ghosting_risk": "Low",
                "response_probability": 94,
                "vouch_tier": "Tier 1",
                "reward": 10,
                "shared_affinity_context": "Co-authored a parallel processing research paper under Prof. Sharma in 2024.",
            },
            {
                "id": "emp_priya",
                "alumnus_name": "Priya Nair",
                "alumnus_role": "Senior Systems Architect",
                "alumnus_company": "Stripe",
                "ghosting_risk": "Medium",
                "response_probability": 72,
                "vouch_tier": "Tier 2",
                "reward": 10,
                "shared_affinity_context": "Maintained the same open-source infrastructure toolkit.",
            },
        ],
    },
    {
        "id": "cand_02",
        "full_name": "Vikramaditya Rao",
        "anonymous_id": "Candidate Beta",
        "school": "IISc Bengaluru",
        "current_role": "Data Analyst Intern",
        "target_company": "Netflix",
        "target_role": "Data Analyst",
        "technical_skills": ["Python", "SQL", "Excel", "Tableau", "Data Visualization", "Statistics"],
        "growth_velocity_score": 98,
        "culture_alignment_score": 89,
        "network_trust_coefficient": 9.1,
        "equity_boost": 3,
        "resume_signal": "Kernel observability projects and lock-free systems work.",
        "skills_matrix": [
            {"name": "SQL", "status": "VERIFIED", "proof_of_work": "Built cohort and funnel analysis queries over product events."},
            {"name": "Tableau", "status": "VERIFIED", "proof_of_work": "Published an executive dashboard for weekly hiring funnel health."},
            {"name": "Statistics", "status": "MISSING", "proof_of_work": "Design an A/B test readout for recruiter response-rate changes."},
        ],
        "alumni_referral_paths": [
            {
                "id": "emp_siddharth",
                "alumnus_name": "Siddharth Verma",
                "alumnus_role": "People Analytics Lead",
                "alumnus_company": "Netflix",
                "ghosting_risk": "Low",
                "response_probability": 91,
                "vouch_tier": "Tier 1",
                "reward": 10,
                "shared_affinity_context": "Worked on hiring analytics and funnel health projects in 2023.",
            }
        ],
    },
    {
        "id": "cand_03",
        "full_name": "Meera Choithramani",
        "anonymous_id": "Candidate Gamma",
        "school": "NIT Trichy",
        "current_role": "Full Stack Dev Lead",
        "target_company": "Vercel",
        "target_role": "Frontend Platform Engineer",
        "technical_skills": ["React", "AST Parsers", "Edge Computing Middleware", "TypeScript", "Web Performance"],
        "growth_velocity_score": 91,
        "culture_alignment_score": 95,
        "network_trust_coefficient": 8.9,
        "equity_boost": 8,
        "resume_signal": "Babel plugin, edge middleware, and global performance deployments.",
        "skills_matrix": [
            {"name": "AST Parsers", "status": "VERIFIED", "proof_of_work": "Created a Babel plugin for dead-code elimination."},
            {"name": "Edge Computing Middleware", "status": "VERIFIED", "proof_of_work": "Deployed auth handlers executing sub-15ms globally."},
            {"name": "WASM Compilation Bridges", "status": "MISSING", "proof_of_work": "Port image-processing layer to Rust WASM."},
        ],
        "alumni_referral_paths": [
            {
                "id": "emp_ananya",
                "alumnus_name": "Ananya Hegde",
                "alumnus_role": "Senior Developer Relations Engineer",
                "alumnus_company": "Vercel",
                "ghosting_risk": "Low",
                "response_probability": 88,
                "vouch_tier": "Tier 1",
                "reward": 10,
                "shared_affinity_context": "Successive presidents of the NIT-T Open Source Society.",
            }
        ],
    },
]


REFERRAL_REQUESTS = []
RECRUITER_REFERRALS = []
PARSED_JOBS = {}
USERS = {}
PHONE_OTPS = {}
CONNECTION_REQUESTS = []
MESSAGES = []

EMAIL_RE = re.compile(r"^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$", re.I)
PHONE_RE = re.compile(r"^\+?[1-9]\d{9,14}$")

AI_AGENT_WEIGHTS = {
    "Career Discovery Agent": 0.28,
    "Skill Gap Agent": 0.26,
    "Opportunity Access Agent": 0.2,
    "Work Simulation Agent": 0.16,
    "Inclusion Guardrail Agent": 0.1,
}

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "in",
    "is",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
}

SKILL_KEYWORDS = {
    "Python": ["python", "pandas", "numpy", "scipy"],
    "SQL": ["sql", "mysql", "postgresql", "postgres", "database", "queries"],
    "Excel": ["excel", "spreadsheet", "vlookup", "pivot"],
    "Power BI": ["power bi", "powerbi"],
    "Tableau": ["tableau"],
    "Data Visualization": ["visualization", "visualisation", "dashboard", "reporting", "reports"],
    "Statistics": ["statistics", "statistical", "hypothesis", "regression"],
    "Data Cleaning": ["data cleaning", "etl", "data quality", "wrangling"],
    "Machine Learning": ["machine learning", "ml model", "predictive"],
    "Growth Marketing": ["growth", "growth marketing", "growth strategy", "acquisition", "retention"],
    "D2C": ["d2c", "direct to consumer", "ecommerce", "e-commerce"],
    "Marketing Analytics": ["marketing analytics", "funnel", "conversion", "cohort", "campaign"],
    "Performance Marketing": ["performance marketing", "paid ads", "meta ads", "google ads", "roas"],
    "SEO": ["seo", "organic growth", "search engine"],
    "Content Marketing": ["content marketing", "copywriting", "brand content"],
    "Social Media": ["social media", "instagram", "linkedin marketing", "community"],
    "FastAPI": ["fastapi"],
    "Async IO": ["asyncio", "async io", "asynchronous"],
    "Redis": ["redis", "cache", "caching"],
    "Distributed Systems": ["distributed systems", "distributed"],
    "Idempotent API Architecture": ["idempotent", "idempotency", "payment retries"],
    "React": ["react", "jsx"],
    "TypeScript": ["typescript"],
    "JavaScript": ["javascript", "js", "es6"],
    "HTML": ["html", "html5"],
    "CSS": ["css", "css3", "tailwind", "bootstrap"],
    "Responsive Design": ["responsive", "mobile first", "cross-browser"],
    "Web Performance": ["web performance", "lighthouse", "core web vitals"],
    "Docker & Kubernetes": ["docker", "kubernetes", "k8s"],
}

INDIAN_CITY_TOKENS = {
    "bangalore",
    "bengaluru",
    "chennai",
    "delhi",
    "gurgaon",
    "gurugram",
    "hyderabad",
    "mumbai",
    "noida",
    "pune",
    "remote",
}

ROLE_HINTS = {
    "analyst",
    "backend",
    "data",
    "developer",
    "engineer",
    "frontend",
    "full",
    "intern",
    "machine",
    "performance",
    "software",
    "stack",
}


def clean_text(value):
    value = html.unescape(value or "")
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def text_tokens(value):
    return [token for token in re.findall(r"[a-z0-9+#.]+", (value or "").lower()) if token not in STOPWORDS and len(token) > 1]


def token_vector(value):
    vector = {}
    for token in text_tokens(value):
        vector[token] = vector.get(token, 0) + 1
    return vector


def cosine_similarity(left, right):
    left_vector = token_vector(left)
    right_vector = token_vector(right)
    if not left_vector or not right_vector:
        return 0
    overlap = set(left_vector).intersection(right_vector)
    dot = sum(left_vector[token] * right_vector[token] for token in overlap)
    left_norm = sum(value * value for value in left_vector.values()) ** 0.5
    right_norm = sum(value * value for value in right_vector.values()) ** 0.5
    return round(dot / max(left_norm * right_norm, 1), 3)


def rank_keywords(source, target, limit=5):
    source_tokens = set(text_tokens(source))
    target_tokens = [token for token in text_tokens(target) if token not in source_tokens]
    ranked = sorted(set(target_tokens), key=lambda token: target_tokens.count(token), reverse=True)
    return ranked[:limit]


def free_llm_generate(prompt, timeout=1.0):
    payload = json.dumps(
        {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.35, "num_predict": 180},
        }
    ).encode("utf-8")
    req = Request(
        f"{OLLAMA_BASE_URL}/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(req, timeout=timeout) as response:
            data = json.loads(response.read().decode("utf-8", errors="ignore"))
            text = clean_text(data.get("response", ""))
            if text:
                return {
                    "active": True,
                    "provider": "Ollama local",
                    "model": OLLAMA_MODEL,
                    "text": text,
                }
    except (HTTPError, URLError, TimeoutError, ValueError, json.JSONDecodeError):
        pass
    return {
        "active": False,
        "provider": "Ollama local",
        "model": OLLAMA_MODEL,
        "text": "",
        "notice": "AI reasoning is unavailable right now.",
    }


def is_valid_email(email):
    email = (email or "").strip().lower()
    if not EMAIL_RE.match(email):
        return False
    domain = email.rsplit("@", 1)[-1]
    if ".." in domain or domain.startswith("-") or domain.endswith("-"):
        return False
    return True


def is_valid_phone(phone):
    return bool(PHONE_RE.match((phone or "").replace(" ", "").replace("-", "")))


def normalize_phone(phone):
    return (phone or "").replace(" ", "").replace("-", "")


def extract_emails(text):
    return sorted(set(re.findall(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", text or "", flags=re.I)))


def extract_phones(text):
    phones = set()
    cleaned = clean_text(text)
    for match in re.finditer(r"(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}", cleaned or ""):
        context = cleaned[max(0, match.start() - 50) : min(len(cleaned), match.end() + 50)].lower()
        if any(label in context for label in ["call", "contact", "mobile", "phone", "tel", "whatsapp"]):
            phones.add(normalize_phone(match.group(0)))
    return sorted(phones)


def title_case(value):
    uppercase = {"ai", "csk", "llp", "ltd", "ml", "opc", "pvt", "qa", "ui", "ux"}
    return " ".join(part.upper() if part in uppercase else part.capitalize() for part in value.split())


def fetch_job_page(job_url):
    req = Request(
        job_url,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ReferAI/1.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    )
    with urlopen(req, timeout=8) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="ignore")


def extract_meta(page_html):
    meta = {}
    for match in re.finditer(r"<meta\s+[^>]*>", page_html, flags=re.IGNORECASE):
        tag = match.group(0)
        name_match = re.search(r'(?:name|property)=["\']([^"\']+)["\']', tag, flags=re.IGNORECASE)
        content_match = re.search(r'content=["\']([^"\']*)["\']', tag, flags=re.IGNORECASE)
        if name_match and content_match:
            meta[name_match.group(1).lower()] = clean_text(content_match.group(1))
    title_match = re.search(r"<title[^>]*>(.*?)</title>", page_html, flags=re.IGNORECASE | re.DOTALL)
    if title_match:
        meta["title"] = clean_text(title_match.group(1))
    return meta


def extract_jsonld_job(page_html):
    for match in re.finditer(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', page_html, re.I | re.S):
        raw = clean_text(match.group(1))
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            continue
        items = payload if isinstance(payload, list) else [payload]
        for item in items:
            if isinstance(item, dict) and item.get("@type") == "JobPosting":
                org = item.get("hiringOrganization") or {}
                location = item.get("jobLocation") or {}
                address = location[0].get("address", {}) if isinstance(location, list) and location else location.get("address", {}) if isinstance(location, dict) else {}
                return {
                    "role": clean_text(item.get("title")),
                    "company": clean_text(org.get("name") if isinstance(org, dict) else ""),
                    "location": clean_text(", ".join(filter(None, [address.get("addressLocality"), address.get("addressRegion")]))),
                    "description": clean_text(item.get("description")),
                    "level": clean_text(item.get("employmentType")) or "Not specified",
                }
    return {}


def infer_job_from_slug(job_url):
    parsed = urlparse(job_url)
    slug = parsed.path.strip("/").split("/")[-1]
    slug = re.sub(r"^job-listings-", "", slug)
    slug = re.sub(r"-\d{8,}.*$", "", slug)
    tokens = [token for token in slug.split("-") if token and not token.isdigit()]
    location_index = next((index for index, token in enumerate(tokens) if token in INDIAN_CITY_TOKENS), None)
    location = title_case(tokens[location_index]) if location_index is not None else "Not listed"
    core = tokens[:location_index] if location_index is not None else tokens
    role_end = 0
    for index, token in enumerate(core):
        if token in ROLE_HINTS:
            role_end = index + 1
        elif role_end:
            break
    role_tokens = core[: max(role_end, 2)]
    company_tokens = core[len(role_tokens) :]
    return {
        "role": title_case(" ".join(role_tokens)) or "Role from job link",
        "company": title_case(" ".join(company_tokens)) or parsed.netloc.replace("www.", ""),
        "location": location,
        "level": "Not specified",
        "description": "Job details were inferred from the link because the page did not expose a full readable description.",
    }


def infer_skills(job):
    haystack = f"{job.get('role', '')} {job.get('description', '')}".lower()
    skills = [skill for skill, keywords in SKILL_KEYWORDS.items() if any(keyword in haystack for keyword in keywords)]
    if "analyst" in haystack and "SQL" not in skills:
        skills.extend(["SQL", "Excel", "Data Visualization"])
    if "backend" in haystack and "Python" not in skills:
        skills.extend(["Python", "Distributed Systems", "SQL"])
    if any(token in haystack for token in ["front-end", "frontend", "front end", "ui developer", "web developer"]):
        skills.extend(["React", "JavaScript", "HTML", "CSS", "Responsive Design"])
    deduped = []
    for skill in skills:
        if skill not in deduped:
            deduped.append(skill)
    return deduped[:8] or ["Role-specific experience", "Communication", "Problem Solving"]


def clean_role_for_company(role, company):
    role = clean_text(role)
    company = clean_text(company)
    if company:
        role = re.sub(rf"\s*\|\s*{re.escape(company)}\s*$", "", role, flags=re.I)
        role = re.sub(rf"\s+at\s+{re.escape(company)}\s*$", "", role, flags=re.I)
    return role


def parse_live_job(job_url):
    scraped = {}
    extraction_notes = []
    try:
        page_html = fetch_job_page(job_url)
        scraped = extract_jsonld_job(page_html)
        meta = extract_meta(page_html)
        if not scraped.get("role"):
            title = meta.get("og:title") or meta.get("title") or ""
            hiring_match = re.search(r"(.+?)\s+hiring\s+(.+?)(?:\s+in\s+.+)?(?:\s+\|\s+LinkedIn)?$", title, flags=re.I)
            if hiring_match:
                scraped["company"] = clean_text(hiring_match.group(1))
                scraped["role"] = clean_text(hiring_match.group(2))
            parts = re.split(r"\s+[-|]\s+|\s+at\s+", title, maxsplit=1, flags=re.I)
            if not scraped.get("role"):
                scraped["role"] = clean_text(parts[0])
            if len(parts) > 1 and not scraped.get("company"):
                scraped["company"] = clean_text(parts[1].split("|")[0])
        scraped["description"] = scraped.get("description") or meta.get("description") or meta.get("og:description") or ""
        scraped["emails"] = extract_emails(page_html)
        scraped["phones"] = extract_phones(page_html)
        company_match = re.search(r'https?://[^"\']*linkedin\.com/company/[^"\']+?(?=["\'])', page_html)
        if company_match:
            scraped["company_url"] = html.unescape(company_match.group(0)).split("?")[0]
        extraction_notes.append("Read live job page metadata")
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        extraction_notes.append(f"Could not read live page ({exc.__class__.__name__}); inferred details from the URL")

    inferred = infer_job_from_slug(job_url)
    job = {**inferred, **{key: value for key, value in scraped.items() if value}}
    job["role"] = clean_role_for_company(job.get("role"), job.get("company"))
    job["id"] = f"job_live_{uuid4().hex[:10]}"
    job["source_url"] = job_url
    job["skills"] = infer_skills(job)
    job["emails"] = scraped.get("emails", [])
    job["phones"] = scraped.get("phones", [])
    job["company_url"] = scraped.get("company_url")
    job["contact_routes"] = build_contact_routes(job)
    job["profiles"] = search_public_profiles(job)
    job["extraction_notes"] = extraction_notes
    job["is_live_extract"] = True
    return job


def parse_recruiter_role_text(raw_text):
    text = clean_text(raw_text)
    role = text
    company = "Target company"
    at_match = re.search(r"(.+?)\s+(?:at|@|for)\s+(.+)$", text, flags=re.I)
    if at_match:
        role = clean_text(at_match.group(1))
        company = clean_text(at_match.group(2))
    job = {
        "id": f"job_recruiter_{uuid4().hex[:10]}",
        "role": role or "Open role",
        "company": company,
        "location": "Not specified",
        "level": "Not specified",
        "description": f"Recruiter-supplied role: {text}.",
        "source_url": "",
        "skills": [],
        "emails": [],
        "phones": [],
        "company_url": None,
        "is_live_extract": True,
    }
    job["skills"] = infer_skills(job)
    job["contact_routes"] = build_contact_routes(job)
    job["profiles"] = search_public_profiles(job)
    job["extraction_notes"] = ["Parsed recruiter role text"]
    return job


def fetch_public_search(query):
    search_url = f"https://www.bing.com/search?format=rss&q={quote(query)}"
    req = Request(search_url, headers={"User-Agent": "Mozilla/5.0 ReferAI/1.0"})
    with urlopen(req, timeout=8) as response:
        return response.read().decode("utf-8", errors="ignore")


def fetch_brave_search(query):
    search_url = f"https://search.brave.com/search?q={quote(query)}&source=web"
    req = Request(
        search_url,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ReferAI/1.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    )
    with urlopen(req, timeout=8) as response:
        return response.read().decode("utf-8", errors="ignore")


def decode_result_url(url):
    if "uddg=" in url:
        encoded = re.search(r"uddg=([^&]+)", url)
        if encoded:
            return unquote(encoded.group(1))
    return html.unescape(url)


def decode_js_string(value):
    try:
        return json.loads(f'"{value}"')
    except (TypeError, ValueError, json.JSONDecodeError):
        return html.unescape((value or "").replace("\\/", "/"))


def public_text_tokens(value):
    return {token for token in re.findall(r"[a-z0-9]+", (value or "").lower()) if len(token) > 2}


def clean_linkedin_url(url):
    return html.unescape(url).split("?")[0]


def is_linkedin_profile_url(url):
    return bool(re.search(r"https?://(?:[a-z]{2}\.)?linkedin\.com/in/[^/?#\"'<>\s]+", url or "", flags=re.I))


def profile_name_from_title(title):
    title = re.sub(r"\s*\|\s*LinkedIn.*$", "", clean_text(title), flags=re.I)
    return title.split(" - ")[0].strip() or "LinkedIn profile"


def profile_headline_from_title(title, description, role):
    title = re.sub(r"\s*\|\s*LinkedIn.*$", "", clean_text(title), flags=re.I)
    parts = [part.strip() for part in title.split(" - ")[1:] if part.strip()]
    return " - ".join(parts) or clean_text(description)[:150] or f"Public LinkedIn profile related to {role}"


def profile_company_from_title(title):
    title = re.sub(r"\s*\|\s*LinkedIn.*$", "", clean_text(title), flags=re.I)
    parts = [part.strip() for part in title.split(" - ")[1:] if part.strip()]
    if len(parts) >= 2:
        return parts[-1]
    if len(parts) == 1 and " at " in parts[0].lower():
        return re.split(r"\s+at\s+", parts[0], flags=re.I)[-1].strip()
    return ""


def company_slug(company):
    slug = re.sub(r"[^a-z0-9]+", "-", (company or "").lower()).strip("-")
    return slug


def company_page_candidates(job):
    urls = []
    if job.get("company_url"):
        urls.append(job["company_url"])
    slug = company_slug(job.get("company"))
    if slug:
        urls.extend(
            [
                f"https://www.linkedin.com/company/{slug}",
                f"https://in.linkedin.com/company/{slug}",
            ]
        )
    deduped = []
    for url in urls:
        if url and url not in deduped:
            deduped.append(url)
    return deduped


def score_profile(profile, job):
    role_tokens = public_text_tokens(job.get("role"))
    skill_tokens = public_text_tokens(" ".join(job.get("skills", [])))
    location_tokens = public_text_tokens(job.get("location"))
    haystack = " ".join([profile.get("name", ""), profile.get("headline", ""), profile.get("summary", "")]).lower()
    profile_tokens = public_text_tokens(haystack)

    score = 42
    reasons = []
    role_overlap = role_tokens.intersection(profile_tokens)
    skill_overlap = skill_tokens.intersection(profile_tokens)
    location_overlap = location_tokens.intersection(profile_tokens)
    if role_overlap:
        score += min(24, len(role_overlap) * 8)
        reasons.append(f"Role keyword match: {', '.join(sorted(role_overlap)[:3])}")
    if skill_overlap:
        score += min(16, len(skill_overlap) * 4)
        reasons.append(f"Skill context match: {', '.join(sorted(skill_overlap)[:3])}")
    if any(word in haystack for word in ["recruiter", "talent", "hiring", "people", "founder", "co-founder"]):
        score += 18
        reasons.append("Likely hiring/referral authority")
    if location_overlap:
        score += 8
        reasons.append(f"Location signal: {', '.join(sorted(location_overlap)[:2])}")
    if profile.get("source") == "LinkedIn company employee section":
        score += 10
        reasons.append("Listed on company LinkedIn page")
    if not reasons:
        reasons.append("Works at the target company")
    return min(98, score), reasons


def linkedin_handle(url):
    match = re.search(r"linkedin\.com/in/([^/?#]+)", url or "", flags=re.I)
    return match.group(1) if match else "linkedin-profile"


def avatar_url(name):
    return f"https://ui-avatars.com/api/?name={quote(name or 'Candidate')}&background=2155d9&color=fff&bold=true"


def infer_profile_location(text):
    lowered = (text or "").lower()
    city_aliases = {
        "bengaluru": "Bengaluru",
        "bangalore": "Bengaluru",
        "delhi": "Delhi NCR",
        "gurgaon": "Gurugram",
        "gurugram": "Gurugram",
        "hyderabad": "Hyderabad",
        "mumbai": "Mumbai",
        "noida": "Noida",
        "pune": "Pune",
        "india": "India",
        "remote": "Remote",
    }
    for token, label in city_aliases.items():
        if token in lowered:
            return label
    return "Location not public"


def candidate_skill_tags(profile, job):
    haystack = " ".join([profile.get("headline", ""), profile.get("summary", ""), profile.get("name", "")]).lower()
    tags = []
    for skill in job.get("skills", []):
        tokens = public_text_tokens(skill)
        if skill and (skill.lower() in haystack or any(token in haystack for token in tokens)):
            tags.append(skill)
    for skill, keywords in SKILL_KEYWORDS.items():
        if any(keyword in haystack for keyword in keywords) and skill not in tags:
            tags.append(skill)
    return tags[:6] or job.get("skills", [])[:4]


def works_at_hiring_company(profile, job):
    company = (job.get("company") or "").strip().lower()
    if not company or company == "target company":
        return False
    haystack = " ".join([profile.get("headline", ""), profile.get("summary", ""), profile.get("company", "")]).lower()
    company_tokens = public_text_tokens(company)
    employee_phrases = [
        f"employee at {company}",
        f"employees at {company}",
        f"works at {company}",
        f"working at {company}",
        f"at {company}",
        f"{company} employee",
    ]
    if any(phrase in haystack for phrase in employee_phrases):
        return True
    if company in haystack:
        return True
    return bool(company_tokens and all(token in haystack for token in company_tokens))


def is_company_employee_section_profile(profile, job):
    source = (profile.get("source") or "").lower()
    summary = (profile.get("summary") or "").lower()
    return "company employee section" in source or "employees at" in summary or works_at_hiring_company(profile, job)


def enrich_candidate_profile(profile, job):
    text = " ".join([profile.get("headline", ""), profile.get("summary", "")])
    profile["linkedin_handle"] = linkedin_handle(profile.get("linkedin_url"))
    profile["location"] = infer_profile_location(text)
    profile["skills"] = candidate_skill_tags(profile, job)
    profile["profile_image_url"] = profile.get("profile_image_url") or avatar_url(profile.get("name"))
    try:
        page = fetch_job_page(profile["linkedin_url"])
        meta = extract_meta(page)
        image = meta.get("og:image") or meta.get("twitter:image")
        description = meta.get("description") or meta.get("og:description")
        title = meta.get("og:title") or meta.get("title")
        if image:
            profile["profile_image_url"] = image
        if description and len(description) > len(profile.get("summary", "")):
            profile["summary"] = description
        if title and profile.get("name", "LinkedIn profile") == "LinkedIn profile":
            profile["name"] = re.sub(r"\s*\|\s*LinkedIn.*$", "", title, flags=re.I)
    except (HTTPError, URLError, TimeoutError, ValueError):
        pass
    profile["location"] = infer_profile_location(" ".join([profile.get("headline", ""), profile.get("summary", "")]))
    profile["skills"] = candidate_skill_tags(profile, job)
    return profile


def score_candidate_profile(profile, job):
    role_tokens = public_text_tokens(job.get("role"))
    skill_tokens = public_text_tokens(" ".join(job.get("skills", [])))
    location_tokens = public_text_tokens(job.get("location"))
    haystack = " ".join([profile.get("name", ""), profile.get("headline", ""), profile.get("summary", ""), " ".join(profile.get("skills", []))]).lower()
    profile_tokens = public_text_tokens(haystack)
    score = 36
    reasons = []
    role_overlap = role_tokens.intersection(profile_tokens)
    skill_overlap = skill_tokens.intersection(profile_tokens)
    location_overlap = location_tokens.intersection(profile_tokens)
    if role_overlap:
        score += min(28, len(role_overlap) * 7)
        reasons.append(f"Role match: {', '.join(sorted(role_overlap)[:3])}")
    if skill_overlap:
        score += min(28, len(skill_overlap) * 7)
        reasons.append(f"Skill match: {', '.join(sorted(skill_overlap)[:3])}")
    if profile.get("location") != "Location not public":
        score += 6
        reasons.append(f"Location signal: {profile['location']}")
    elif location_overlap:
        score += 6
        reasons.append(f"Location signal: {', '.join(sorted(location_overlap)[:2])}")
    if any(word in haystack for word in ["intern", "student", "associate", "analyst", "growth", "marketing", "founder"]):
        score += 8
        reasons.append("Career stage or domain signal")
    if works_at_hiring_company(profile, job):
        score -= 34
        reasons.append("Excluded as current target-company employee")
    if not reasons:
        reasons.append("Public profile has partial role context")
    return max(1, min(98, score)), reasons[:4]


def extract_company_employee_profiles(job):
    profiles = []
    seen = set()
    company = job.get("company") or ""
    for company_url in company_page_candidates(job):
        try:
            page = fetch_job_page(company_url)
        except (HTTPError, URLError, TimeoutError, ValueError):
            continue
        marker = f"Employees at {company}"
        start = page.find(marker)
        section = page[start : start + 16000] if start >= 0 else page
        for match in re.finditer(
            r'<a href="([^"]*linkedin\.com/in/[^"]+)"[^>]*data-tracking-control-name="org-employees"[^>]*>(.*?)</a>',
            section,
            flags=re.I | re.S,
        ):
            linkedin_url = clean_linkedin_url(match.group(1))
            if linkedin_url in seen:
                continue
            inner = match.group(2)
            text = clean_text(inner)
            image_match = re.search(r'data-delayed-url="([^"]+)"', inner)
            profile = {
                "id": f"profile_{len(profiles) + 1}",
                "name": text or "LinkedIn profile",
                "headline": f"Employee at {company}",
                "summary": f"Visible in the Employees at {company} section on LinkedIn.",
                "company": company,
                "linkedin_url": linkedin_url,
                "email": None,
                "phone": None,
                "profile_image_url": html.unescape(image_match.group(1)) if image_match else None,
                "source": "LinkedIn company employee section",
            }
            profile["match_score"], profile["match_reasons"] = score_profile(profile, job)
            profiles.append(profile)
            seen.add(linkedin_url)
    return profiles


def extract_search_profiles(job, existing_urls):
    company = job.get("company") or ""
    role = job.get("role") or ""
    queries = [
        f'site:linkedin.com/in "{company}" "{role}"',
        f'site:linkedin.com/in "{company}" recruiter',
        f'site:linkedin.com/in "{company}" founder',
        f'site:linkedin.com/in "{company}" "business development"',
        f'site:linkedin.com/in "{company}"',
    ]
    profiles = []
    seen = set(existing_urls)
    for query in queries:
        try:
            page = fetch_public_search(query)
        except (HTTPError, URLError, TimeoutError, ValueError):
            continue
        for item in re.finditer(r"<item>(.*?)</item>", page, flags=re.I | re.S):
            block = item.group(1)
            title_match = re.search(r"<title>(.*?)</title>", block, flags=re.I | re.S)
            link_match = re.search(r"<link>(.*?)</link>", block, flags=re.I | re.S)
            description_match = re.search(r"<description>(.*?)</description>", block, flags=re.I | re.S)
            if not link_match:
                continue
            url = clean_linkedin_url(clean_text(link_match.group(1)))
            if "linkedin.com/in/" not in url or url in seen:
                continue
            title = re.sub(r"\s*\|\s*LinkedIn.*$", "", clean_text(title_match.group(1) if title_match else "LinkedIn profile"), flags=re.I)
            description = clean_text(description_match.group(1) if description_match else "")
            name = title.split(" - ")[0].strip() or "LinkedIn profile"
            headline = " - ".join(title.split(" - ")[1:]).strip() or description[:140] or f"Public LinkedIn result related to {company}"
            profile = {
                "id": f"profile_search_{len(profiles) + 1}",
                "name": name,
                "headline": headline,
                "summary": description or f"Public search result mentioning {company}.",
                "company": company,
                "linkedin_url": url,
                "email": None,
                "phone": None,
                "profile_image_url": None,
                "source": "Public web search result",
            }
            profile["match_score"], profile["match_reasons"] = score_profile(profile, job)
            profiles.append(profile)
            seen.add(url)
            if len(profiles) >= 8:
                return profiles
    return profiles


def search_public_profiles(job):
    return search_candidate_profiles(job)


def candidate_search_queries(job):
    role = job.get("role") or ""
    company = job.get("company") or ""
    skills = job.get("skills", [])
    raw_location = job.get("location") or ""
    location = raw_location if raw_location and raw_location.lower() not in {"not specified", "not listed", "location not public"} else "India"
    skill_text = " ".join(skills[:3])
    role_without_company = clean_role_for_company(role, company)
    role_search = re.sub(r"front\s*-\s*end", "frontend", role_without_company, flags=re.I)
    company_exclusion = f' -"{company}"' if company and company != "Target company" else ""
    core_queries = [
        f'site:linkedin.com/in {role_search} {skill_text} {location}{company_exclusion}',
        f'site:linkedin.com/in {role_search} student intern {location}{company_exclusion}',
        f'site:linkedin.com/in {skill_text} portfolio open to work {location}{company_exclusion}',
        f'site:linkedin.com/in {role_search} fresher {location}{company_exclusion}',
    ]
    if any(skill in skills for skill in ["React", "JavaScript", "HTML", "CSS"]):
        core_queries.extend(
            [
                f'site:linkedin.com/in frontend developer React JavaScript HTML CSS India{company_exclusion}',
                f'site:linkedin.com/in web developer intern React portfolio India{company_exclusion}',
            ]
        )
    if any(skill in skills for skill in ["Growth Marketing", "D2C", "Performance Marketing"]):
        core_queries.extend(
            [
                f'site:linkedin.com/in growth marketing D2C ecommerce India{company_exclusion}',
                f'site:linkedin.com/in marketing intern performance marketing India{company_exclusion}',
            ]
        )
    return [query for query in core_queries if len(query.strip()) > 20]


def brave_profile_results(query):
    try:
        page = fetch_brave_search(query)
    except (HTTPError, URLError, TimeoutError, ValueError):
        return []
    results = []
    seen_urls = set()
    pattern = re.compile(
        r'title:"(?P<title>(?:\\.|[^"\\])*)",url:"(?P<url>https?://(?:[a-z]{2}\.)?linkedin\.com/in/[^"\\]+?)".{0,1200}?description:"(?P<description>(?:\\.|[^"\\])*)"',
        flags=re.I | re.S,
    )
    for match in pattern.finditer(page):
        url = clean_linkedin_url(decode_js_string(match.group("url")))
        if not is_linkedin_profile_url(url) or url in seen_urls:
            continue
        block = page[match.start() : match.end() + 3500]
        image_match = re.search(r'thumbnail:\{(?:.*?)original:"(?P<image>(?:\\.|[^"\\])*)"', block, flags=re.I | re.S)
        results.append(
            {
                "title": decode_js_string(match.group("title")),
                "url": url,
                "description": clean_text(decode_js_string(match.group("description"))),
                "image": html.unescape(decode_js_string(image_match.group("image"))) if image_match else None,
            }
        )
        seen_urls.add(url)
    return results


def bing_profile_results(query):
    try:
        page = fetch_public_search(query)
    except (HTTPError, URLError, TimeoutError, ValueError):
        return []
    results = []
    seen_urls = set()
    for item in re.finditer(r"<item>(.*?)</item>", page, flags=re.I | re.S):
        block = item.group(1)
        title_match = re.search(r"<title>(.*?)</title>", block, flags=re.I | re.S)
        link_match = re.search(r"<link>(.*?)</link>", block, flags=re.I | re.S)
        description_match = re.search(r"<description>(.*?)</description>", block, flags=re.I | re.S)
        if not link_match:
            continue
        url = clean_linkedin_url(clean_text(link_match.group(1)))
        if not is_linkedin_profile_url(url) or url in seen_urls:
            continue
        results.append(
            {
                "title": clean_text(title_match.group(1) if title_match else "LinkedIn profile"),
                "url": url,
                "description": clean_text(description_match.group(1) if description_match else ""),
                "image": None,
            }
        )
        seen_urls.add(url)
    return results


def extract_candidate_search_profiles(job):
    profiles = []
    seen = set()
    for query in candidate_search_queries(job):
        for result in [*brave_profile_results(query), *bing_profile_results(query)]:
            url = clean_linkedin_url(result.get("url"))
            if not is_linkedin_profile_url(url) or url in seen:
                continue
            title = result.get("title") or "LinkedIn profile"
            description = result.get("description") or ""
            profile = {
                "id": f"candidate_profile_{len(profiles) + 1}",
                "name": profile_name_from_title(title),
                "headline": profile_headline_from_title(title, description, job.get("role")),
                "summary": description or f"Public profile surfaced for {job.get('role')} sourcing.",
                "company": profile_company_from_title(title),
                "linkedin_url": url,
                "email": None,
                "phone": None,
                "profile_image_url": result.get("image"),
                "source": "Public LinkedIn candidate search",
            }
            profile = enrich_candidate_profile(profile, job)
            if is_company_employee_section_profile(profile, job):
                seen.add(url)
                continue
            profile["match_score"], profile["match_reasons"] = score_candidate_profile(profile, job)
            profiles.append(profile)
            seen.add(url)
            if len(profiles) >= 14:
                return profiles
    return profiles


def search_candidate_profiles(job):
    profiles = extract_candidate_search_profiles(job)
    profiles = [profile for profile in profiles if not is_company_employee_section_profile(profile, job)]
    ranked = sorted(profiles, key=lambda profile: profile["match_score"], reverse=True)
    for index, profile in enumerate(ranked[:20], start=1):
        profile["rank"] = index
        profile["id"] = f"candidate_profile_{index}"
    return ranked[:20]


def build_contact_routes(job):
    company = job.get("company") or "the company"
    role = job.get("role") or "this role"
    source_url = job.get("source_url", "")
    routes = []
    if source_url:
        routes.append(
            {
                "id": "apply_source",
                "type": "apply",
                "label": "Open original job",
                "title": f"Apply on {urlparse(source_url).netloc.replace('www.', '')}",
                "subtitle": "This is the real job source you pasted.",
                "url": source_url,
                "verified": True,
            }
        )
    for email in job.get("emails", []):
        subject = quote(f"Application for {role}")
        body = quote(f"Hi,\n\nI am interested in the {role} role at {company}. Could you please confirm the right application/referral process?\n\nThanks")
        routes.append(
            {
                "id": f"email_{email}",
                "type": "email",
                "label": "Open email draft",
                "title": email,
                "subtitle": "Email address found on the job page.",
                "url": f"mailto:{email}?subject={subject}&body={body}",
                "verified": True,
            }
        )
    for phone in job.get("phones", []):
        routes.append(
            {
                "id": f"phone_{phone}",
                "type": "phone",
                "label": "Call phone",
                "title": phone,
                "subtitle": "Phone number found on the job page.",
                "url": f"tel:{phone}",
                "verified": True,
            }
        )
    linkedin_people_query = "+".join([company, "recruiter", role]).replace(" ", "+")
    routes.append(
        {
            "id": "linkedin_recruiters",
            "type": "linkedin",
            "label": "Search LinkedIn recruiters",
            "title": f"{company} recruiters",
            "subtitle": "Opens LinkedIn people search; send only after you choose a real profile.",
            "url": f"https://www.linkedin.com/search/results/people/?keywords={linkedin_people_query}",
            "verified": False,
        }
    )
    linkedin_company_query = "+".join([company, role]).replace(" ", "+")
    routes.append(
        {
            "id": "linkedin_employees",
            "type": "linkedin",
            "label": "Search company employees",
            "title": f"{company} employees",
            "subtitle": "No fake names. Pick an actual employee from LinkedIn.",
            "url": f"https://www.linkedin.com/search/results/people/?keywords={linkedin_company_query}",
            "verified": False,
        }
    )
    return routes


def live_job_response(job):
    return {
        "job": job,
        "matches": [],
        "contacts": job.get("contact_routes") or build_contact_routes(job),
        "profiles": job.get("profiles", []),
        "notice": "This is a live job, so ReferAI is not showing seeded demo candidates or fake referrers. Use the real job source or LinkedIn search routes to contact actual people.",
    }


def find_candidate(candidate_id):
    return next((candidate for candidate in CANDIDATES if candidate["id"] == candidate_id), None)


def user_by_id(user_id):
    return next((user for user in USERS.values() if user["id"] == user_id), None)


def split_list(value):
    return [item.strip() for item in re.split(r"[,;\n]+", value or "") if item.strip()]


def registered_employees():
    return [user for user in USERS.values() if user.get("role") == "employee"]


def registered_recruiters():
    return [user for user in USERS.values() if user.get("role") == "recruiter"]


def candidate_profile(user):
    skills = user.get("skills", [])
    name = user.get("name", "Employee")
    current_role = user.get("current_role") or "Open to opportunities"
    target_role = user.get("target_role") or current_role
    target_company = user.get("target_company") or "Open"
    slug = quote(name)
    return {
        "id": user["id"],
        "full_name": name,
        "email": user.get("email"),
        "phone": user.get("phone"),
        "current_role": current_role,
        "target_role": target_role,
        "target_company": target_company,
        "technical_skills": skills,
        "location": user.get("location", ""),
        "summary": user.get("summary", ""),
        "profile_type": "candidate",
        "headline": " · ".join(part for part in [current_role, target_role] if part),
        "linkedin_url": user.get("linkedin_url") or f"https://www.linkedin.com/search/results/people/?keywords={slug}",
        "in_app_profile_url": f"/profiles/candidates/{user['id']}",
        "skills_text": ", ".join(skills),
    }


def seeded_candidate_profile(candidate):
    slug = quote(candidate["full_name"])
    return {
        "id": candidate["id"],
        "full_name": candidate["full_name"],
        "email": None,
        "phone": None,
        "current_role": candidate.get("current_role", ""),
        "target_role": candidate.get("target_role", ""),
        "target_company": candidate.get("target_company", ""),
        "technical_skills": candidate.get("technical_skills", []),
        "location": candidate.get("school", ""),
        "summary": candidate.get("resume_signal", ""),
        "profile_type": "candidate",
        "headline": " · ".join(part for part in [candidate.get("current_role"), candidate.get("target_role")] if part),
        "linkedin_url": f"https://www.linkedin.com/search/results/people/?keywords={slug}",
        "in_app_profile_url": f"/profiles/candidates/{candidate['id']}",
        "skills_text": ", ".join(candidate.get("technical_skills", [])),
    }


def recruiter_profile(user):
    focus = user.get("focus", [])
    name = user.get("name", "Recruiter")
    company = user.get("company") or "Company not set"
    role = user.get("recruiter_title") or "Recruiter"
    slug = quote(f"{name} {company} recruiter")
    return {
        "id": user["id"],
        "name": name,
        "email": user.get("email"),
        "phone": user.get("phone"),
        "company": company,
        "role": role,
        "focus": focus,
        "location": user.get("location", ""),
        "summary": user.get("summary", ""),
        "profile_type": "recruiter",
        "linkedin_url": user.get("linkedin_url") or f"https://www.linkedin.com/search/results/people/?keywords={slug}",
        "in_app_profile_url": f"/profiles/recruiters/{user['id']}",
        "skills_text": ", ".join(focus),
    }


def filter_profiles(profiles, search="", skill="", role=""):
    search_tokens = public_text_tokens(search)
    skill_text = (skill or "").lower()
    role_text = (role or "").lower()
    filtered = []
    for profile in profiles:
        haystack = " ".join(
            str(profile.get(key, ""))
            for key in ["name", "full_name", "headline", "role", "current_role", "target_role", "company", "skills_text", "location"]
        ).lower()
        if search_tokens and not all(token in haystack for token in search_tokens):
            continue
        if skill_text and skill_text != "all" and skill_text not in haystack:
            continue
        if role_text and role_text != "all" and role_text not in haystack:
            continue
        filtered.append(profile)
    return filtered


def profile_name(profile_type, profile_id):
    if profile_type == "recruiter":
        recruiter = user_by_id(profile_id)
        return recruiter["name"] if recruiter else "Recruiter"
    candidate = user_by_id(profile_id) or find_candidate(profile_id)
    return (candidate.get("name") or candidate.get("full_name")) if candidate else "Candidate"


def connection_between(left_type, left_id, right_type, right_id):
    return next(
        (
            item
            for item in CONNECTION_REQUESTS
            if {
                (item["from_type"], item["from_id"]),
                (item["to_type"], item["to_id"]),
            }
            == {(left_type, left_id), (right_type, right_id)}
        ),
        None,
    )


def hydrate_connection(item):
    return {
        **item,
        "from_name": profile_name(item["from_type"], item["from_id"]),
        "to_name": profile_name(item["to_type"], item["to_id"]),
    }


def find_job(job_id):
    if not job_id:
        return JOBS[0]
    return PARSED_JOBS.get(job_id) or next((job for job in JOBS if job["id"] == job_id), JOBS[0])


def find_employee(candidate, employee_id):
    return next(
        (path for path in candidate["alumni_referral_paths"] if path["id"] == employee_id),
        candidate["alumni_referral_paths"][0],
    )


def company_matches(left, right):
    left_tokens = {token for token in re.findall(r"[a-z0-9]+", (left or "").lower()) if len(token) > 2}
    right_tokens = {token for token in re.findall(r"[a-z0-9]+", (right or "").lower()) if len(token) > 2}
    return bool(left_tokens and right_tokens and left_tokens.intersection(right_tokens))


def best_referrer(candidate, job):
    exact_paths = [path for path in candidate["alumni_referral_paths"] if company_matches(path["alumnus_company"], job["company"])]
    if exact_paths:
        referrer = max(exact_paths, key=lambda path: path["response_probability"])
        return {**referrer, "is_verified_for_company": True}

    fallback = max(candidate["alumni_referral_paths"], key=lambda path: path["response_probability"])
    return {
        **fallback,
        "id": f"{fallback['id']}_no_company_match",
        "is_verified_for_company": False,
        "response_probability": min(fallback["response_probability"], 38),
        "ghosting_risk": "High",
        "shared_affinity_context": (
            f"No verified {job['company']} referrer exists in this local network yet. "
            f"This is only the closest warm path, not a confirmed employee at {job['company']}."
        ),
    }


def build_skill_matrix(candidate, job, matched_skills, missing_skills):
    verified_by_name = {skill["name"]: skill for skill in candidate["skills_matrix"] if skill["status"] == "VERIFIED"}
    matrix = []
    for skill in job["skills"]:
        if skill in matched_skills:
            proof = verified_by_name.get(skill, {}).get("proof_of_work") or f"Profile contains evidence for {skill}."
            matrix.append({"name": skill, "status": "VERIFIED", "proof_of_work": proof})
        elif skill in missing_skills:
            matrix.append(
                {
                    "name": skill,
                    "status": "MISSING",
                    "proof_of_work": f"Show practical proof for {skill} using the responsibilities in this job description.",
                }
            )
    return matrix


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


def candidate_signal_text(candidate):
    return " ".join(
        [
            candidate.get("full_name", ""),
            candidate.get("current_role", ""),
            candidate.get("target_role", ""),
            candidate.get("target_company", ""),
            candidate.get("resume_signal", ""),
            " ".join(candidate.get("technical_skills", [])),
            " ".join(skill.get("proof_of_work", "") for skill in candidate.get("skills_matrix", [])),
        ]
    )


def ai_readiness_score(candidate, job, match):
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
    return min(99, max(1, score))


def build_ai_career_companion(candidate, job, account=None):
    match = compute_match(candidate, job, dei_mode=True)
    missing_skills = match.get("missing_skills", [])
    matched_skills = match.get("matched_skills", [])
    keyword_gaps = rank_keywords(candidate_signal_text(candidate), f"{job.get('role', '')} {job.get('description', '')} {' '.join(job.get('skills', []))}")
    readiness = ai_readiness_score(candidate, job, match)
    strongest_referrer = match["recommended_referrer"]
    first_gap = missing_skills[0] if missing_skills else (keyword_gaps[0].title() if keyword_gaps else job["skills"][0])
    simulation = {
        "title": f"{first_gap} proof sprint",
        "brief": (
            f"Create a 60-90 minute work sample for the {job['role']} role: explain the tradeoffs, show one artifact, "
            "and include how you would measure success in production."
        ),
        "deliverables": [
            f"One-page approach for {first_gap}",
            "A short before/after metric or evaluation plan",
            "Risks, edge cases, and rollback plan",
        ],
        "rubric": ["Role relevance", "Practical reasoning", "Evidence quality", "Communication clarity"],
    }
    agents = [
        {
            "name": "Career Discovery Agent",
            "score": readiness,
            "finding": f"This role is a {readiness}% readiness path based on growth velocity, job semantics, and current evidence.",
            "action": f"Position the profile around {', '.join(matched_skills[:2]) or candidate.get('current_role', 'your strongest projects')}.",
        },
        {
            "name": "Skill Gap Agent",
            "score": match["skill_match"],
            "finding": f"{match['skill_match']}% of required skills are already supported by profile evidence.",
            "action": f"Close the visible gap: {', '.join(missing_skills[:3]) if missing_skills else 'turn existing proof into a concise portfolio artifact'}.",
        },
        {
            "name": "Opportunity Access Agent",
            "score": strongest_referrer["response_probability"],
            "finding": f"Best warm path is {strongest_referrer['alumnus_name']} with {strongest_referrer['response_probability']}% reply probability.",
            "action": "Send a proof-led message instead of a generic referral request.",
        },
        {
            "name": "Work Simulation Agent",
            "score": 88 if missing_skills else 95,
            "finding": f"The fastest credibility signal is a focused work simulation around {first_gap}.",
            "action": simulation["brief"],
        },
        {
            "name": "Inclusion Guardrail Agent",
            "score": 94,
            "finding": "Ranking keeps school and pedigree secondary to proof, growth velocity, and verified work signals.",
            "action": "Lead with capabilities and artifacts; avoid relying on background-only signals.",
        },
    ]
    outreach_angles = [
        f"Open with the {job['role']} role and the strongest proof: {', '.join(matched_skills[:2]) or candidate.get('resume_signal')}.",
        f"Ask for a review of the {simulation['title']} before asking for a referral.",
        "Make the request easy to answer: referral, better internal contact, or feedback on readiness.",
    ]
    llm = free_llm_generate(
        (
            "You are ReferAI's free local LLM career coach. "
            "Write 3 concise, practical bullets for this candidate and role. "
            f"Candidate: {candidate.get('full_name')}, {candidate.get('current_role')}. "
            f"Role: {job.get('role')} at {job.get('company')}. "
            f"Matched skills: {', '.join(matched_skills) or 'none yet'}. "
            f"Missing skills: {', '.join(missing_skills) or 'none'}."
        )
    )
    return {
        "readiness_score": readiness,
        "llm": {
            "active": llm["active"],
            "provider": llm["provider"],
            "model": llm["model"],
            "notice": llm.get("notice"),
        },
        "llm_summary": llm["text"]
        or "Start the free local Ollama model to generate LLM-written coaching here. The AI scoring and agent plan still work offline.",
        "theme_fit": [
            "Career Discovery & Skill Building",
            "Hiring, Networking & Opportunity Access",
            "Work Simulation & AI Teammates",
            "Intelligent Orchestrators & Multi-Agent Systems",
            "AI for Inclusive & Accessible Opportunities",
        ],
        "agents": agents,
        "recommended_path": [
            f"Target {job['role']} at {job['company']}.",
            f"Strengthen proof for {first_gap}.",
            f"Contact {strongest_referrer['alumnus_name']} with a proof-led ask.",
            "Use recruiter follow-up only after the work sample is attached.",
        ],
        "simulation": simulation,
        "outreach_angles": outreach_angles,
        "semantic_fit": cosine_similarity(candidate_signal_text(candidate), f"{job.get('role', '')} {job.get('description', '')}"),
        "keyword_gaps": keyword_gaps,
        "owner": account.get("name") if isinstance(account, dict) and account.get("name") else candidate.get("full_name"),
    }


def recruiter_referral_status(job_id, profile):
    url = profile.get("linkedin_url")
    existing = next((item for item in RECRUITER_REFERRALS if item["job_id"] == job_id and item["profile_url"] == url), None)
    return existing["status"] if existing else "Awaiting review"


def llm_profile_reason(profile, job, score, reasons):
    llm = free_llm_generate(
        (
            "You are a free local LLM helping a recruiter shortlist candidates. "
            "Write one concise reason this profile is or is not a good match. "
            f"Job: {job.get('role')} at {job.get('company')}. Skills: {', '.join(job.get('skills', []))}. "
            f"Profile: {profile.get('name')}. Headline: {profile.get('headline')}. "
            f"Skills: {', '.join(profile.get('skills', []))}. Location: {profile.get('location')}. Summary: {profile.get('summary')}. "
            f"Computed match: {score}%. Signals: {', '.join(reasons)}."
        )
    )
    return llm


def build_recruiter_profile_matches(job):
    profiles = search_candidate_profiles(job)
    matches = []
    for profile in profiles[:20]:
        if is_company_employee_section_profile(profile, job):
            continue
        score = profile.get("match_score")
        reasons = profile.get("match_reasons")
        if score is None or not reasons:
            score, reasons = score_candidate_profile(profile, job)
        llm = llm_profile_reason(profile, job, score, reasons)
        fit_reason = llm["text"] or "Ranked from public profile signals that match this role, skills, location, and career stage."
        matches.append(
            {
                **profile,
                "match_score": score,
                "match_reasons": reasons,
                "llm_reason": fit_reason,
                "fit_reason": fit_reason,
                "llm": {
                    "active": llm["active"],
                    "provider": llm["provider"],
                    "model": llm["model"],
                    "notice": llm.get("notice"),
                },
                "status": recruiter_referral_status(job["id"], profile),
            }
        )
    ranked = sorted(matches, key=lambda item: item["match_score"], reverse=True)
    for index, profile in enumerate(ranked, start=1):
        profile["rank"] = index
    return ranked[:20]


@app.route("/")
def home():
    return jsonify({"message": "ReferAI backend running", "version": "2.0"})


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "jobs": len(JOBS), "candidates": len(CANDIDATES), "requests": len(REFERRAL_REQUESTS)})


@app.route("/api/auth/phone/start", methods=["POST"])
def start_phone_auth():
    payload = request.get_json(silent=True) or {}
    phone = normalize_phone(payload.get("phone"))
    if not is_valid_phone(phone):
        return jsonify({"error": "Enter a valid phone number with country code, for example +919876543210."}), 400
    PHONE_OTPS[phone] = "123456"
    return jsonify({"status": "otp_sent", "message": "OTP generated for local development. Use 123456."})


@app.route("/api/auth/phone/verify", methods=["POST"])
def verify_phone_auth():
    payload = request.get_json(silent=True) or {}
    phone = normalize_phone(payload.get("phone"))
    otp = (payload.get("otp") or "").strip()
    if PHONE_OTPS.get(phone) != otp:
        return jsonify({"error": "Invalid phone OTP."}), 400
    return jsonify({"status": "verified"})


@app.route("/api/auth/signup", methods=["POST"])
def signup():
    payload = request.get_json(silent=True) or {}
    name = clean_text(payload.get("name"))
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    role = payload.get("role") or "employee"
    if role == "student":
        role = "employee"
    if role not in {"employee", "recruiter"}:
        return jsonify({"error": "Choose employee or recruiter."}), 400
    phone = normalize_phone(payload.get("phone"))
    otp = (payload.get("otp") or "").strip()

    if not name:
        return jsonify({"error": "Enter your full name."}), 400
    if not is_valid_email(email):
        return jsonify({"error": "Enter a valid email address with a real domain, like name@example.com."}), 400
    if email in USERS:
        return jsonify({"error": "An account already exists for this email. Log in instead."}), 409
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400
    if not is_valid_phone(phone):
        return jsonify({"error": "Enter a valid phone number with country code."}), 400
    if PHONE_OTPS.get(phone) != otp:
        return jsonify({"error": "Verify your phone OTP before creating an account."}), 400

    profile = {
        "id": f"user_{uuid4().hex[:8]}",
        "name": name,
        "email": email,
        "role": role,
        "phone": phone,
        "linkedin_url": clean_text(payload.get("linkedin_url")),
        "location": clean_text(payload.get("location")),
        "summary": clean_text(payload.get("summary")),
    }
    if role == "recruiter":
        profile.update(
            {
                "company": clean_text(payload.get("company")),
                "recruiter_title": clean_text(payload.get("recruiter_title")) or "Recruiter",
                "focus": split_list(payload.get("focus")),
            }
        )
    else:
        profile.update(
            {
                "current_role": clean_text(payload.get("current_role")),
                "target_role": clean_text(payload.get("target_role")),
                "target_company": clean_text(payload.get("target_company")),
                "skills": split_list(payload.get("skills")),
            }
        )

    user = profile
    USERS[email] = {**user, "password": password}
    return jsonify({"user": user}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not is_valid_email(email):
        return jsonify({"error": "Enter a valid email address."}), 400
    existing = USERS.get(email)
    if not existing or existing["password"] != password:
        return jsonify({"error": "No matching account found. Check your email/password or create an account."}), 401
    return jsonify({"user": {key: value for key, value in existing.items() if key != "password"}})


@app.route("/api/marketplace")
def marketplace():
    return jsonify({"jobs": JOBS, "candidates": CANDIDATES, "requests": hydrate_requests()})


@app.route("/api/candidates")
def candidate_directory():
    profiles = [candidate_profile(user) for user in registered_employees()]
    filtered = filter_profiles(
        profiles,
        search=request.args.get("q", ""),
        skill=request.args.get("skill", ""),
        role=request.args.get("role", ""),
    )
    return jsonify(
        {
            "candidates": filtered,
            "skills": sorted({skill for profile in profiles for skill in profile.get("technical_skills", [])}),
            "roles": sorted({profile.get("target_role") for profile in profiles if profile.get("target_role")}),
        }
    )


@app.route("/api/recruiters")
def recruiter_directory():
    profiles = [recruiter_profile(user) for user in registered_recruiters()]
    filtered = filter_profiles(
        profiles,
        search=request.args.get("q", ""),
        skill=request.args.get("skill", ""),
        role=request.args.get("role", ""),
    )
    return jsonify(
        {
            "recruiters": filtered,
            "skills": sorted({focus for user in registered_recruiters() for focus in user.get("focus", [])}),
            "roles": sorted({user.get("recruiter_title") for user in registered_recruiters() if user.get("recruiter_title")}),
        }
    )


@app.route("/api/connections", methods=["GET", "POST"])
def connections():
    if request.method == "GET":
        return jsonify({"connections": [hydrate_connection(item) for item in CONNECTION_REQUESTS]})

    payload = request.get_json(silent=True) or {}
    from_type = payload.get("from_type")
    from_id = payload.get("from_id")
    to_type = payload.get("to_type")
    to_id = payload.get("to_id")
    note = clean_text(payload.get("note"))
    if from_type not in {"candidate", "recruiter"} or to_type not in {"candidate", "recruiter"}:
        return jsonify({"error": "Connections must be between candidates and recruiters."}), 400
    if not from_id or not to_id or (from_type == to_type and from_id == to_id):
        return jsonify({"error": "Choose a valid person to connect with."}), 400

    existing = connection_between(from_type, from_id, to_type, to_id)
    if existing:
        return jsonify({"connection": hydrate_connection(existing), "created": False})

    connection = {
        "id": f"conn_{uuid4().hex[:8]}",
        "from_type": from_type,
        "from_id": from_id,
        "to_type": to_type,
        "to_id": to_id,
        "note": note,
        "status": "connected",
        "created_at": now_iso(),
    }
    CONNECTION_REQUESTS.insert(0, connection)
    return jsonify({"connection": hydrate_connection(connection), "created": True}), 201


@app.route("/api/messages", methods=["GET", "POST"])
def messages():
    if request.method == "GET":
        connection_id = request.args.get("connection_id")
        return jsonify({"messages": [item for item in MESSAGES if item["connection_id"] == connection_id]})

    payload = request.get_json(silent=True) or {}
    connection = next((item for item in CONNECTION_REQUESTS if item["id"] == payload.get("connection_id")), None)
    if not connection or connection["status"] != "connected":
        return jsonify({"error": "You can message after the connection is accepted."}), 403
    sender_type = payload.get("sender_type")
    sender_id = payload.get("sender_id")
    participants = {(connection["from_type"], connection["from_id"]), (connection["to_type"], connection["to_id"])}
    if (sender_type, sender_id) not in participants:
        return jsonify({"error": "Only connected people can send messages in this conversation."}), 403
    body = clean_text(payload.get("body"))
    if not body:
        return jsonify({"error": "Write a message first."}), 400
    message = {
        "id": f"msg_{uuid4().hex[:8]}",
        "connection_id": connection["id"],
        "sender_type": sender_type,
        "sender_id": sender_id,
        "body": body,
        "created_at": now_iso(),
    }
    MESSAGES.append(message)
    return jsonify({"message": message}), 201


@app.route("/api/parse-job", methods=["POST"])
def parse_job():
    payload = request.get_json(silent=True) or {}
    raw_original = (payload.get("job_url") or payload.get("job_id") or "").strip()
    raw_input = raw_original.lower()
    if not raw_input:
        return jsonify({"error": "Add a job link or job ID to search."}), 400

    selected = None

    for job in JOBS:
        if job["company"].lower() in raw_input or job["role"].lower().split()[0] in raw_input or job["id"] in raw_input:
            selected = job
            break

    if selected is None:
        selected = parse_live_job(raw_original)
        PARSED_JOBS[selected["id"]] = selected

    confidence = 0.93 if selected.get("description") and not selected.get("description", "").startswith("Job details were inferred") else 0.62
    return jsonify({"job": selected, "source": raw_original, "confidence": confidence})


@app.route("/api/match", methods=["POST"])
def match():
    payload = request.get_json(silent=True) or {}
    incoming_job = payload.get("job") or {}
    if incoming_job.get("id"):
        PARSED_JOBS[incoming_job["id"]] = incoming_job
    job = find_job(payload.get("job_id") or incoming_job.get("id"))
    dei_mode = bool(payload.get("dei_mode"))
    if job.get("is_live_extract"):
        return jsonify(live_job_response(job))
    ranked = sorted([compute_match(candidate, job, dei_mode) for candidate in CANDIDATES], key=lambda item: item["match_score"], reverse=True)
    return jsonify({"job": job, "matches": ranked})


@app.route("/api/ai/career-companion", methods=["POST"])
def career_companion():
    payload = request.get_json(silent=True) or {}
    incoming_job = payload.get("job") or {}
    if incoming_job.get("id"):
        PARSED_JOBS[incoming_job["id"]] = incoming_job
    job = find_job(payload.get("job_id") or incoming_job.get("id"))
    candidate = find_candidate(payload.get("candidate_id")) or CANDIDATES[0]
    return jsonify({"copilot": build_ai_career_companion(candidate, job, payload.get("profile") or {})})


@app.route("/api/recruiter-search", methods=["POST"])
def recruiter_search():
    payload = request.get_json(silent=True) or {}
    raw_job = (payload.get("job_url") or payload.get("job") or "").strip()
    if not raw_job:
        return jsonify({"error": "Paste a job link or role to source candidates."}), 400
    parsed = parse_live_job(raw_job) if raw_job.startswith(("http://", "https://")) else parse_recruiter_role_text(raw_job)
    parsed["profiles"] = search_candidate_profiles(parsed)
    PARSED_JOBS[parsed["id"]] = parsed
    matches = build_recruiter_profile_matches(parsed)
    llm_active = any(match["llm"]["active"] for match in matches)
    return jsonify(
        {
            "job": parsed,
            "matches": matches,
            "llm": {
                "active": llm_active,
                "provider": "Ollama local",
                "model": OLLAMA_MODEL,
                "notice": None,
            },
            "notice": "Showing public candidate profiles whose visible experience matches this role. Current employees at the hiring company are filtered out.",
        }
    )


@app.route("/api/recruiter-referrals", methods=["POST"])
def recruiter_referrals():
    payload = request.get_json(silent=True) or {}
    job = payload.get("job") or find_job(payload.get("job_id"))
    profile = payload.get("profile") or {}
    profile_url = profile.get("linkedin_url")
    if not job.get("id") or not profile_url:
        return jsonify({"error": "Choose a candidate profile before marking it referred."}), 400
    existing = next((item for item in RECRUITER_REFERRALS if item["job_id"] == job["id"] and item["profile_url"] == profile_url), None)
    if existing:
        existing["status"] = "Shortlisted"
        existing["updated_at"] = now_iso()
        return jsonify({"referral": existing, "created": False})
    referral = {
        "id": f"rec_ref_{uuid4().hex[:8]}",
        "job_id": job["id"],
        "job_role": job.get("role"),
        "job_company": job.get("company"),
        "profile_name": profile.get("name"),
        "profile_url": profile_url,
        "match_score": profile.get("match_score"),
        "status": "Shortlisted",
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    RECRUITER_REFERRALS.insert(0, referral)
    return jsonify({"referral": referral, "created": True}), 201


@app.route("/api/proof/submit", methods=["POST"])
def submit_proof():
    payload = request.get_json(silent=True) or {}
    candidate = find_candidate(payload.get("candidate_id")) or CANDIDATES[0]
    solution = payload.get("solution", "")
    solution_quality = cosine_similarity(solution, candidate_signal_text(candidate))
    score = min(98, 68 + len(solution.split()) * 2 + round(solution_quality * 12))
    trust_delta = 0.3 if score >= 82 else 0.1
    return jsonify(
        {
            "candidate_id": candidate["id"],
            "status": "verified" if score >= 82 else "needs_review",
            "proof_score": score,
            "trust_delta": trust_delta,
            "new_trust_score": round(candidate["network_trust_coefficient"] + trust_delta, 1),
            "feedback": "AI review: strong practical reasoning, clear failure-mode handling, and enough concrete evidence for a referral conversation."
            if score >= 82
            else "AI review: add a sharper implementation plan, measurable success criteria, and one concrete artifact from your work sample.",
        }
    )


@app.route("/api/referral-requests", methods=["GET", "POST"])
def referral_requests():
    if request.method == "GET":
        return jsonify({"requests": hydrate_requests()})

    payload = request.get_json(silent=True) or {}
    candidate = find_candidate(payload.get("candidate_id")) or CANDIDATES[0]
    incoming_job = payload.get("job") or {}
    if incoming_job.get("id"):
        PARSED_JOBS[incoming_job["id"]] = incoming_job
    job = find_job(payload.get("job_id") or incoming_job.get("id"))
    employee = find_employee(candidate, payload.get("employee_id") or candidate["alumni_referral_paths"][0]["id"])

    existing = next(
        (
            item
            for item in REFERRAL_REQUESTS
            if item["candidate_id"] == candidate["id"] and item["employee_id"] == employee["id"] and item["job_id"] == job["id"]
        ),
        None,
    )
    if existing:
        existing["status"] = "Awaiting employee review"
        existing["updated_at"] = now_iso()
        return jsonify({"request": hydrate_request(existing), "created": False})

    referral_request = {
        "id": f"ref_{uuid4().hex[:8]}",
        "candidate_id": candidate["id"],
        "employee_id": employee["id"],
        "job_id": job["id"],
        "status": "Awaiting employee review",
        "decision": None,
        "notes": payload.get("message", ""),
        "reward": employee["reward"],
        "platform_fee": 2,
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    REFERRAL_REQUESTS.insert(0, referral_request)
    return jsonify({"request": hydrate_request(referral_request), "created": True}), 201


@app.route("/api/referral-requests/<request_id>/decision", methods=["POST"])
def decide_referral(request_id):
    payload = request.get_json(silent=True) or {}
    referral_request = next((item for item in REFERRAL_REQUESTS if item["id"] == request_id), None)
    if not referral_request:
        return jsonify({"error": "Referral request not found"}), 404

    decision = payload.get("decision", "strong_vouch")
    referral_request["decision"] = decision
    referral_request["notes"] = payload.get("notes", "")
    referral_request["status"] = "Referred to recruiter" if decision != "not_ready" else "Needs more proof"
    referral_request["updated_at"] = now_iso()
    return jsonify({"request": hydrate_request(referral_request)})


@app.route("/api/recruiter-dashboard")
def recruiter_dashboard():
    job = JOBS[0]
    requests = hydrate_requests()
    request_candidate_ids = {item["candidate_id"] for item in REFERRAL_REQUESTS}
    matches = sorted(
        [compute_match(candidate, job, dei_mode=True) for candidate in CANDIDATES if candidate["id"] in request_candidate_ids],
        key=lambda item: item["match_score"],
        reverse=True,
    )
    referred = [item for item in requests if item["status"] == "Referred to recruiter"]
    return jsonify(
        {
            "job": job,
            "top_candidates": matches,
            "requests": requests,
            "analytics": {
                "total_candidates": len(matches),
                "active_requests": len(requests),
                "verified_referrals": len(referred),
                "average_match_score": round(sum(item["match_score"] for item in matches) / len(matches)) if matches else 0,
                "projected_hours_saved": len(requests) * 3,
                "platform_revenue": sum(item["platform_fee"] for item in requests),
                "employee_rewards": sum(item["reward"] for item in requests if item["status"] == "Referred to recruiter"),
            },
        }
    )


@app.route("/api/generate-message", methods=["POST"])
def generate_message():
    payload = request.get_json(silent=True) or {}
    candidate = find_candidate(payload.get("candidate_id")) or CANDIDATES[0]
    incoming_job = payload.get("job") or {}
    if incoming_job.get("id"):
        PARSED_JOBS[incoming_job["id"]] = incoming_job
    job = find_job(payload.get("job_id") or incoming_job.get("id"))
    employee = best_referrer(candidate, job)

    matched = compute_match(candidate, job)
    matched_text = ", ".join(matched["matched_skills"][:3]) or candidate["resume_signal"]
    missing_text = ", ".join(matched["missing_skills"][:2])
    company_note = (
        f"ReferAI found you as my strongest available path, but it has not verified a direct {job['company']} employee connection yet."
        if not employee.get("is_verified_for_company")
        else f"ReferAI matched us because {employee['shared_affinity_context']}"
    )

    fallback_message = (
        f"Hi {employee['alumnus_name']},\n\n"
        f"I am applying for the {job['role']} role at {job['company']}. {company_note}\n\n"
        f"My strongest role-relevant signals are: {matched_text}. "
        f"My current match score is {matched['match_score']} with {matched['skill_match']}% skill overlap"
        f"{f', and I am adding proof for {missing_text}' if missing_text else ''}.\n\n"
        "Would you be open to reviewing my proof-of-work and considering a referral or a more relevant internal contact?\n\n"
        f"Thanks,\n{candidate['full_name']}"
    )
    llm = free_llm_generate(
        (
            "Draft a concise referral request message. Keep it natural, respectful, and under 140 words. "
            f"Candidate: {candidate['full_name']}. Referrer: {employee['alumnus_name']}. "
            f"Role: {job['role']} at {job['company']}. "
            f"Strong signals: {matched_text}. Missing skills being improved: {missing_text or 'none'}."
        )
    )
    return jsonify(
        {
            "message": llm["text"] or fallback_message,
            "llm": {
                "active": llm["active"],
                "provider": llm["provider"],
                "model": llm["model"],
                "notice": llm.get("notice"),
            },
        }
    )


def hydrate_requests():
    return [hydrate_request(item) for item in REFERRAL_REQUESTS]


def hydrate_request(referral_request):
    candidate = find_candidate(referral_request["candidate_id"])
    job = find_job(referral_request["job_id"])
    employee = find_employee(candidate, referral_request["employee_id"])
    ai_review = build_ai_career_companion(candidate, job, {})
    return {
        **referral_request,
        "candidate": candidate,
        "job": job,
        "employee": employee,
        "match": compute_match(candidate, job, dei_mode=True),
        "ai_review": {
            "readiness_score": ai_review["readiness_score"],
            "llm": ai_review["llm"],
            "llm_summary": ai_review["llm_summary"],
            "recommended_path": ai_review["recommended_path"],
            "simulation": ai_review["simulation"],
        },
    }


if __name__ == "__main__":
    app.run(debug=True)
