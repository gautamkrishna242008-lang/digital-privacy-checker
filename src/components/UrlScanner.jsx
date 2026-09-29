import React, { useState, useEffect } from "react";
import { scanUrl } from "../api";
import { Globe, Search, ArrowRight, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, Terminal } from "lucide-react";

const SUGGESTIONS = [
  { label: "Zoom (Conferencing)", url: "zoom.us", tag: "Meetings" },
  { label: "Instagram (Social)", url: "instagram.com", tag: "Social" },
  { label: "Reddit (Discussion)", url: "reddit.com", tag: "Forum" },
  { label: "PayPal (Fintech)", url: "paypal.com", tag: "Finance" },
  { label: "DuckDuckGo (Private)", url: "duckduckgo.com", tag: "Private" },
];

const SCAN_STEPS = [
  "Connecting to target host via secure TLS...",
  "Analyzing Permissions-Policy & Feature-Policy directives...",
  "Inspecting Content-Security-Policy & tracker scripts...",
  "Scanning tracking cookies & telemetry fingerprints...",
  "Evaluating personal data points & retention statements...",
  "Synthesizing privacy score & generating recommendations...",
];

export default function UrlScanner({ onScanned, onCustomAudit }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setStepIndex((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
      }, 700);
    } else {
      setStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  async function handleScan(targetUrl) {
    const inputUrl = (targetUrl || url).trim();
    if (!inputUrl) {
      setError("Please enter a valid website address or domain.");
      return;
    }

    setLoading(true);
    setError(null);
    setStepIndex(0);

    try {
      const entry = await scanUrl(inputUrl);
      onScanned(entry);
    } catch (err) {
      setError(
        err.message?.includes("Failed to fetch")
          ? "Unable to reach the privacy engine backend. Ensure server is running on http://localhost:5000."
          : err.message || "Failed to scan target website."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    handleScan();
  }

  return (
    <div className="url-scanner-card">
      <div className="url-scanner__header">
        <div className="url-scanner__badge">
          <Sparkles className="icon-pulse" size={14} />
          <span>Automated Domain Inspector</span>
        </div>
        <h2 className="url-scanner__title">Inspect Any Website URL</h2>
        <p className="url-scanner__subtitle">
          Enter a web address to automatically inspect its permissions policies, tracking scripts, third-party cookies, and data practices.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="url-scanner__form">
        <div className="url-input-wrapper">
          <Globe className="url-input__icon" size={20} />
          <input
            type="text"
            className="url-input"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. zoom.us, instagram.com, or https://example.com"
            disabled={loading}
          />
          <button
            type="submit"
            className="url-scan-btn button button--primary"
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <span>Analyze Site</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="scanner-error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="scanner-terminal">
          <div className="terminal-header">
            <Terminal size={14} />
            <span>Scanning Diagnostics: {url}</span>
          </div>
          <div className="terminal-body">
            {SCAN_STEPS.map((step, idx) => (
              <div
                key={idx}
                className={`terminal-line ${
                  idx < stepIndex ? "done" : idx === stepIndex ? "active" : "pending"
                }`}
              >
                {idx < stepIndex ? (
                  <CheckCircle2 size={13} className="text-emerald" />
                ) : idx === stepIndex ? (
                  <span className="terminal-dot"></span>
                ) : (
                  <span className="terminal-dash">-</span>
                )}
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="url-scanner__suggestions">
        <span className="suggestions-label">Try popular benchmarks:</span>
        <div className="suggestion-chips">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.url}
              type="button"
              className="suggestion-chip"
              disabled={loading}
              onClick={() => {
                setUrl(s.url);
                handleScan(s.url);
              }}
            >
              <span>{s.url}</span>
              <span className="chip-tag">{s.tag}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="url-scanner__divider">
        <span>OR</span>
      </div>

      <div className="url-scanner__manual-prompt">
        <div>
          <h4>Know the specific permissions an app requested?</h4>
          <p>Manually configure cameras, microphones, biometric sensors, and trackers.</p>
        </div>
        <button
          type="button"
          className="button button--outline"
          onClick={onCustomAudit}
        >
          Open Custom Auditor
        </button>
      </div>
    </div>
  );
}
