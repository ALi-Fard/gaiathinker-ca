# GaiaThinker — gaiathinker.ca

> AI-powered climate literacy for the next generation of decision-makers.

[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?style=flat&logo=cloudflare&logoColor=white)](https://gaiathinker.ca)
[![Built with Azure OpenAI](https://img.shields.io/badge/Powered%20by-Azure%20OpenAI-0078D4?style=flat&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com/en-ca/products/ai-services/openai-service)
[![FIPPA Compliant](https://img.shields.io/badge/Privacy-FIPPA%20%2F%20PIPEDA-107C10?style=flat)](https://gaiathinker.ca/privacy)
[![Canadian Data Residency](https://img.shields.io/badge/Data%20Residency-Canada-red?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyeiIvPjwvc3ZnPg==)](https://gaiathinker.ca)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-323130?style=flat)](./LICENSE.md)

---

## What Is GaiaThinker?

GaiaThinker is a Microsoft Azure-powered climate literacy platform built for **BC Grades 9–12** schools. It delivers curriculum-aligned lessons, AI-guided scenario exploration, and formative assessment tools — all without creating student accounts or storing personal data.

**No student accounts. No student emails. No personal data stored.**  
Canadian data residency. FIPPA-aligned. First Peoples Principles of Learning integrated.

---

## The Problem We're Solving

British Columbia's revised curriculum mandates climate literacy across Grades 9–12 — but teachers lack tools that are curriculum-mapped, FIPPA-compliant, and engaging enough for Gen Z learners raised on short-form content and interactive media.

GaiaThinker closes that gap.

---

## Core Product

| Feature | Description |
|---|---|
| **Professor Ember** | AI climate tutor powered by Azure OpenAI Service. Socratic dialogue, not answers. |
| **Scenario Engine** | Students navigate real-world climate dilemmas and classify outcomes. |
| **Lesson Cards** | Modular, curriculum-mapped content for BC Grades 9–12. |
| **Educator Dashboard** | Aggregated, anonymized progress summaries. No individual student data. |
| **Gamification Layer** | Streak mechanics, challenge modes, and peer scenario comparisons. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **AI** | Microsoft Azure OpenAI Service (Canadian region) |
| **Frontend** | HTML5 · CSS3 (Microsoft Fluent Design System) · Vanilla JS |
| **Hosting** | Cloudflare Pages (free tier, global CDN) |
| **DNS / Security** | Cloudflare (DDoS protection, SSL/TLS, WAF) |
| **Identity (roadmap)** | Microsoft Entra ID · Azure AD SSO for districts |
| **Analytics (roadmap)** | Microsoft Power BI Embedded |
| **Collaboration (roadmap)** | Microsoft Teams integration |

---

## Repository Structure

```
gaiathinker-ca/
│
├── index.html              # / — Public landing page
├── privacy.html            # /privacy — FIPPA/PIPEDA policy
├── terms.html              # /terms — Terms & Conditions
├── support.html            # /support — Help & contact (Partner Center)
├── educators.html          # /educators — Curriculum alignment, pilot info
├── students.html           # /students — Student product experience
├── districts.html          # /districts — Procurement, DPA requests
├── about.html              # /about — GaiaLink mission & team
├── accessibility.html      # /accessibility — WCAG 2.1 AA statement
├── demo.html               # /demo — Request access & live demo
├── insights/
│   └── index.html          # /insights — Research & thought leadership
│
├── assets/
│   ├── logo/               # GaiaThinker logo variants
│   ├── screenshots/        # Partner Center AppSource screenshots
│   └── og/                 # Open Graph / social preview images
│
├── LICENSE.md
└── README.md
```

---

## Deployment

This site is deployed automatically via **Cloudflare Pages** on every push to `main`.

```
Branch:     main
Build cmd:  (none — static HTML)
Output dir: /
Domain:     gaiathinker.ca
SSL:        Cloudflare managed (auto-renewed)
```

To preview locally:

```bash
# Option 1 — Python (no install required)
python -m http.server 8080

# Option 2 — Node
npx serve .
```

Open `http://localhost:8080` in your browser.

---

## Privacy Architecture

GaiaThinker is built privacy-first by design:

- **No student accounts** — students access via educator-initiated sessions only
- **No personal data collected** — no names, emails, device IDs, or IP addresses tied to individuals
- **Azure Canada Central** — all AI inference stays within Canadian jurisdiction
- **Session-only AI context** — Professor Ember does not retain conversation history between sessions
- **FIPPA / PIPEDA compliant** — designed for BC public school procurement

Full policy: [gaiathinker.ca/privacy](https://gaiathinker.ca/privacy)

---

## Microsoft Ecosystem Alignment

| Integration | Status |
|---|---|
| Azure OpenAI Service | ✅ Live |
| Azure Canada Central data residency | ✅ Live |
| Microsoft Responsible AI principles | ✅ Live |
| Microsoft Entra ID / SSO | 🔄 Q1 2027 |
| Microsoft Teams tab integration | 🔄 Q1 2027 |
| Microsoft Power BI Embedded | 🗺 2028 Roadmap |
| Microsoft Copilot integration | 🗺 2028 Roadmap |

GaiaThinker is listed on **Microsoft AppSource** as "GaiaThinker Pilot Offer 2026" under GaiaLink Intelligence Systems Inc.

---

## BC Pilot Program

The inaugural GaiaThinker pilot launches **Autumn 2026** across participating British Columbia school districts. Pilot scope:

- Grades 9–12 science and social studies classrooms
- Educator onboarding, no IT setup required
- Formative assessment reporting for school administrators
- First Peoples Principles of Learning and OCAP® principles integrated throughout

To apply for the pilot: [gaiathinker.ca/districts](https://gaiathinker.ca/districts)

---

## Roadmap

```
2026  BC Pilot (Grades 9–12) ──────────── Azure OpenAI · FIPPA-aligned
2027  Province-wide scale ───────────────── Entra ID SSO · Teams integration
2028  National expansion ──────────────────── Power BI · Copilot · French
2029  US Pacific Northwest ─────────────────────── FERPA · State curriculum
2030  International ────────────────────────────────── IB curriculum · EU AI Act
```

---

## Contributing

This is a **private repository**. Access is granted by GaiaLink Intelligence Systems Inc. only.

If you are a contractor or advisor with repository access, please:

1. Never commit API keys, secrets, or credentials
2. Branch from `main`, prefix with `feature/`, `fix/`, or `content/`
3. Open a pull request with a clear description — no direct pushes to `main`
4. All content changes must be reviewed before deployment

---

## Contact

**GaiaLink Intelligence Systems Inc.**  
British Columbia, Canada  
[ali.reza.farshadfard@gaiasystems.ca](mailto:ali.reza.farshadfard@gaiasystems.ca)  
[gaiathinker.ca](https://gaiathinker.ca) · [gaiasystems.ca](https://gaiasystems.ca)

---

## License

Copyright © 2026 GaiaLink Intelligence Systems Inc. All rights reserved.  
See [LICENSE.md](./LICENSE.md) for terms.

GaiaThinker™ is a trademark of GaiaLink Intelligence Systems Inc.
