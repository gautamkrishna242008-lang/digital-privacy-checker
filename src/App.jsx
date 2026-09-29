import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Checker from "./pages/Checker";
import Dashboard from "./pages/Dashboard";
import HistoryPage from "./pages/HistoryPage";
import ThreatStats from "./components/ThreatStats";

export default function App() {
  const [view, setView] = useState("landing"); // "landing" | "checker" | "dashboard" | "history" | "stats"
  const [result, setResult] = useState(null);
  const [checkerMode, setCheckerMode] = useState("url"); // "url" | "manual"
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme_preference") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme_preference", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function handleAnalyzed(entry) {
    setResult(entry);
    setView("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleStartScanUrl(prefilledUrl) {
    setCheckerMode("url");
    setView("checker");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleStartManualAudit() {
    setCheckerMode("manual");
    setView("checker");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelectHistoryEntry(entry) {
    setResult(entry);
    setView("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <Navbar
        current={view}
        onNavigate={(newView) => {
          if (newView === "checker") setCheckerMode("url");
          setView(newView);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="app-main">
        {view === "landing" && (
          <Landing
            onStartScanUrl={handleStartScanUrl}
            onStartManualAudit={handleStartManualAudit}
          />
        )}

        {view === "checker" && (
          <Checker
            initialMode={checkerMode}
            onAnalyzed={handleAnalyzed}
            onBack={() => setView("landing")}
          />
        )}

        {view === "dashboard" && (
          <Dashboard
            entry={result}
            onNewCheck={() => {
              setCheckerMode("url");
              setView("checker");
            }}
          />
        )}

        {view === "history" && (
          <HistoryPage
            onSelectEntry={handleSelectHistoryEntry}
            onNewCheck={() => {
              setCheckerMode("url");
              setView("checker");
            }}
          />
        )}

        {view === "stats" && (
          <section className="stats-view-container">
            <header className="stats-view-header">
              <h1>Threat Intelligence & Ecosystem Trends</h1>
              <p>Aggregated telemetry on web permissions, tracker proliferations, and security postures.</p>
            </header>
            <ThreatStats />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <div className="app-footer__container">
          <div className="footer-brand">
            <span className="footer-title">Digital Privacy Checker</span>
            <span className="footer-subtitle">Cybersecurity Permission Auditor</span>
          </div>
          <p className="footer-copy">
            Transparent, rule-based algorithmic scoring. Zero data sold or monetized.
          </p>
        </div>
      </footer>
    </div>
  );
}
