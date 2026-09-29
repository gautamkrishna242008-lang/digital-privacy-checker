import React from "react";
import { ShieldCheck, Search, History, BarChart3, Sun, Moon, Sparkles } from "lucide-react";

export default function Navbar({ current, onNavigate, theme, onToggleTheme }) {
  return (
    <header className="navbar">
      <div className="navbar__container">
        <button className="navbar__brand" onClick={() => onNavigate("landing")}>
          <div className="navbar__logo-box">
            <ShieldCheck className="navbar__shield" size={22} />
          </div>
          <div className="navbar__brand-text">
            <span className="navbar__title">Digital Privacy Checker</span>
            <span className="navbar__badge">CYBER AUDIT v2.4</span>
          </div>
        </button>

        <nav className="navbar__links">
          <button
            className={`navbar__link ${current === "checker" ? "is-active" : ""}`}
            onClick={() => onNavigate("checker")}
          >
            <Search size={15} />
            <span>Audit Site</span>
          </button>

          <button
            className={`navbar__link ${current === "history" ? "is-active" : ""}`}
            onClick={() => onNavigate("history")}
          >
            <History size={15} />
            <span>Audit Logs</span>
          </button>

          <button
            className={`navbar__link ${current === "stats" ? "is-active" : ""}`}
            onClick={() => onNavigate("stats")}
          >
            <BarChart3 size={15} />
            <span>Threat Intel</span>
          </button>

          <div className="navbar__divider"></div>

          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label="Toggle theme mode"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
