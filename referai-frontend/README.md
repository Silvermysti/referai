# 🚀 Network Equity Engine

A next-generation hiring platform that replaces resume-based hiring with a **merit-first, proof-of-work driven system**.

Built to demonstrate how hiring can evolve beyond resumes and referrals into a **trust-based, skill-verified pipeline**.

---

## 🧠 Core Idea

Traditional hiring is broken:

- Resumes are noisy  
- Referrals are biased  
- Skills are not truly validated  

**Network Equity Engine solves this by:**

- Verifying candidates through proof-of-work  
- Scoring trust dynamically  
- Enabling merit-gated referrals  
- Supporting bias-free hiring (DEI mode)  

> **"Opportunities should be earned through demonstrated ability, not connections."**

---

## ✨ Key Features

### 📥 Job Intelligence Engine
- Parses job input (link or description)
- Extracts:
  - Required skills  
  - Role expectations  
  - Key evaluation signals  
- Displays simulated AI reasoning logs  

---

### 🎯 Candidate Intelligence Layer
- Displays:
  - Skill Match %  
  - Missing Skills  
  - Trust Score  
  - Growth Signal  

- Includes **Skill Gap Diff View**:
  - ✅ Matched skills  
  - ⚠️ Missing skills  
  - 🧠 AI reasoning summary  

---

### 💻 Proof-of-Work Validation (Core Feature)
- Identifies a **critical missing skill**
- Generates a challenge (code/task)

**On submission:**
- Evaluates performance (simulated intelligence)
- Returns:
  - Score  
  - Strengths  
  - Gaps  
  - Feedback  

**System updates dynamically:**
- Trust Score (animated)
- Candidate ranking

---

### 🔗 Network Referral Engine
Visual pipeline:
Candidate → Alumni → Company


Displays:
- Conversion probability  
- Trust tier  
- Network strength  

---

### 🔐 Merit-Gated Referral System
- Referral is **locked by default**

**Unlock condition:**
👉 Complete proof-of-work  

**After unlock:**
- Generates a high-quality referral message  
- Editable by user  

> Prevents referral spam and enforces merit-based access  

---

### 📊 Recruiter Dashboard
- Ranked candidate view  

Displays:
- Trust score  
- Skill match  
- Proof-of-work validation  

---

### ⚖️ DEI Mode (Bias-Free Hiring)

**Toggle ON:**
- Hides:
  - Names  
  - Photos  
  - Colleges  
- Shows only:
  - Skills  
  - Scores  
  - Capability signals  

**Toggle OFF:**
- Restores full identity  

> Demonstrates fair, bias-resistant hiring  

---

## 🔄 Demo Flow (For Judges)

1. Enter job description  
2. View candidate match & skill gaps  
3. Complete proof-of-work challenge  
4. Watch trust score update  
5. Unlock referral system  
6. View recruiter dashboard  
7. Toggle DEI mode  

---

## 🧩 System Design Philosophy

- Minimal UI, high signal  
- Every interaction has meaning  
- No dead buttons or fake flows  
- Intelligence is **visible and interactive**  

---

## ⚙️ Tech Stack

- **Frontend:** React (Vite)  
- **Styling:** Tailwind CSS  
- **State Management:** React Hooks  
- **Backend:** Python (Flask / FastAPI style app.py)  

---

## 🤖 Why Limited External APIs?

We intentionally avoided heavy external dependencies to:

- 🚀 Ensure a fast, reliable demo  
- 🔒 Avoid rate limits and API failures  
- 🧠 Simulate AI deterministically using structured logic  
- 🎯 Focus on product design, UX, and system thinking  

---

## ▶️ How to Run Locally

⚠️ This project requires running **frontend and backend in separate terminals**

---

### 1. Clone the Repository

```bash
git clone https://github.com/aishwarya-mol-2046/referai
cd referai
2. Open TWO Terminals in VS Code
Terminal 1 → Backend

Terminal 2 → Frontend

⚙️ Terminal 1 — Run Backend (Python)
cd backend

# Create virtual environment (optional)
python -m venv venv

# Activate environment

# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python app.py
👉 Backend runs on:
http://127.0.0.1:5000

🌐 Terminal 2 — Run Frontend (React)
cd frontend

npm install
npm run dev
👉 Frontend runs on:
http://localhost:5173

🔁 Final Setup
Frontend → http://localhost:5173

Backend → http://127.0.0.1:5000

✔ Frontend communicates with backend via API calls