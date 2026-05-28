# ReferAI

ReferAI is a full-stack smart referral and hiring marketplace built for hackathon demos. It helps students move from a job link to a structured referral request, gives employees a proof-based review console, and gives recruiters a verified candidate pipeline.

## Problem

Students currently apply on job boards, copy job IDs, and manually DM employees for referrals. Most messages are ignored because employees lack context, candidates lack verification, and recruiters still need to sort noisy inbound applications.

## Solution

ReferAI creates a referral marketplace where:

- Students paste a job ID or application link.
- The backend parses the opportunity and ranks best-fit alumni or employees.
- Candidates complete proof-of-work before requesting a referral.
- Employees review structured evidence and submit a vouch decision.
- Recruiters see verified, explainable candidate matches.
- Rewards and platform commission are tracked in the referral flow.

## Demo Flow

1. Open the Student Portal.
2. Click `Analyze` on the sample Stripe job link.
3. Review ranked candidates and the best referrer.
4. Submit a proof-of-work answer.
5. Send the referral request.
6. Open the Employee Console and submit a vouch decision.
7. Open the Recruiter Command dashboard to see verified referrals and analytics.

## Full-Stack Features

- Flask API with job parsing, candidate matching, proof scoring, referral request creation, employee decisions, and recruiter analytics.
- React role-based UI for students, employees, and recruiters.
- Shared backend state across all screens during the running demo.
- Explainable match scoring using skills, trust, growth velocity, network response probability, and equity boost.
- Referral reward and platform fee tracking.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Python, Flask, Flask-CORS
- State: in-memory backend demo store

## Run Locally

Start the backend:

```bash
cd referai/referai-backend
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend URL:

```text
http://127.0.0.1:5000
```

Start the frontend in a second terminal:

```bash
cd referai/referai-frontend
npm install
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

Optional API override:

```bash
VITE_API_BASE_URL=http://127.0.0.1:5000 npm run dev
```
