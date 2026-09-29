# Digital Privacy Checker - Backend API

A high-performance Node.js & Express API with a transparent, rule-based privacy scoring engine, embedded SQLite database (`better-sqlite3`), and an automated URL inspector with SSRF protection.

## Features
- **Deterministic Rule Engine**: 100% transparent scoring based on explicit category weights. Zero black-box AI.
- **Automated URL Inspector (`POST /api/scan-url`)**: Fetches live HTTP security headers (`Permissions-Policy`, `Content-Security-Policy`), scans for third-party trackers (Google Analytics, Meta Pixel, Hotjar, TikTok), and parses domain permission profiles.
- **SSRF Guard**: Prohibits requests targeting internal/loopback/private IP spaces.
- **SQLite Persistence (`WAL` Mode)**: High-speed, embedded storage for audit logs and platform telemetry.

## How to Run in VS Code

1. Open this folder in VS Code (`File > Open Folder...`).
2. Open terminal in VS Code: ``Ctrl + ` `` (or `Terminal > New Terminal`).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the API server:
   ```bash
   node server.js
   ```
5. Server will run on **`http://localhost:5000`**.

## Key Endpoints
- `POST /api/scan-url` - Takes `{ "url": "https://example.com" }` and returns detected permissions, trackers, and score.
- `POST /api/analyze` - Takes `{ siteName, permissions, dataCollection, tracking, dataSharing, dataRetention }` and returns report.
- `GET /api/history` - Returns list of past checks stored in SQLite.
- `GET /api/history/:id` - Returns a specific check by ID.
- `GET /api/stats` - Returns aggregate count, average score, and high-risk audit flags.
