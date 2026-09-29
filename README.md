# Digital Privacy Checker - Frontend

A modern, cybersecurity-grade React + Vite web application for auditing website permissions, analyzing tracking telemetry, and evaluating privacy risks.

## Features
- **Automated URL Scanner**: Deep-inspects headers (`Permissions-Policy`, `CSP`), cookie flags, and tracker signatures.
- **Real-Time Reactive Meter**: Instantaneous client-side score preview as you toggle permissions.
- **Privacy Nutrition Label**: Standardized categorization of sensory access and data harvesting.
- **"What-If" Revocation Simulator**: Recalculates privacy scores live when permissions are revoked.
- **Dark/Light Theme Toggle**: High-contrast cybersecurity aesthetic with theme persistence.

## How to Run in VS Code

1. Open this folder in VS Code (`File > Open Folder...`).
2. Open terminal in VS Code: ``Ctrl + ` `` (or `Terminal > New Terminal`).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Open **`http://localhost:5173`** in your browser.

*Note: Start the backend server first (on port 5000) so the automated URL scanner and audit database work seamlessly.*
