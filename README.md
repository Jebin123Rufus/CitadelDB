# CitadelDB

**CitadelDB** is a production-grade cybersecurity threat intelligence platform for security researchers, SOC analysts, students, blue teamers, and penetration testers.

Investigate vulnerabilities, understand threats, and analyze cybersecurity intelligence from a single stateless portal — no authentication, databases, or user storage required.

## Features

| Module | Description |
|--------|-------------|
| **Threat Intelligence Dashboard** | SOC-style dashboard with live NVD CVE data, charts, and insights |
| **CVE Intelligence Center** | Search, filter, and inspect vulnerabilities from the NVD API |
| **AI Threat Analyst** | GROQ-powered Llama 3.3 threat intelligence reports |
| **Threat Explainer** | Visual attack-flow explanations for any CVE |
| **Security News Center** | RSS aggregation with AI summaries and briefings |
| **MITRE ATT&CK Explorer** | Browse tactics, techniques, detection & defenses |
| **Threat Trends Analytics** | 30-day vulnerability trend visualizations |
| **IOC Analysis Center** | IP, domain, URL, and hash analysis with AI |
| **Security Toolkit** | CVSS, hash, URL, password, and header utilities |
| **AI Cybersecurity Assistant** | Focused security chatbot |

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Recharts
- **Backend:** Node.js, Express
- **AI:** GROQ SDK (Llama 3.3 70B Versatile)
- **Data:** NVD API, MITRE ATT&CK STIX, RSS feeds

## Quick Start

### Prerequisites

- Node.js 18+
- [GROQ API Key](https://console.groq.com/)
- [NVD API Key](https://nvd.nist.gov/developers/request-an-api-key)

### Setup

```bash
# Clone and enter project
cd CitadelDB

# Install dependencies
npm run install:all

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run development (API + frontend)
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3001

### Production

```bash
npm run build
npm start
```

Or use the combined production command:

```bash
npm run start:prod
```

This builds the frontend and serves the built React app from Express on port 3001.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | GROQ API key for AI features |
| `NVD_API_KEY` | NIST NVD API key (recommended for rate limits) |
| `PORT` | Server port (default: 3001) |

## Architecture

- **Stateless** — no database or persistent user storage
- **API-driven** — all intelligence fetched live from external APIs
- **Modular** — separate services for NVD, GROQ, ATT&CK, news, IOC, toolkit
- **Rate-limited** — Express rate limiting on API routes
- **Secure headers** — Helmet, CORS, compression

## Project Structure

```
CitadelDB/
├── client/          # React + Vite frontend
├── server/          # Express API
│   ├── routes/
│   └── services/
├── .env.example
└── package.json
```

## License

MIT
