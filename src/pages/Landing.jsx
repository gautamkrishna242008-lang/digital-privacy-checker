import React, { useState } from "react";
import ThreatStats from "../components/ThreatStats";
import {
  ShieldCheck,
  Globe,
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2,
  Lock,
  Search,
  EyeOff,
  Zap,
} from "lucide-react";

const QUICK_BENCHMARKS = ["zoom.us", "instagram.com", "reddit.com", "paypal.com", "duckduckgo.com"];

export default function Landing({ onStartScanUrl, onStartManualAudit }) {
  const [heroUrl, setHeroUrl] = useState("");

  function handleHeroSubmit(e) {
    e.preventDefault();
    if (heroUrl.trim()) {
      onStartScanUrl(heroUrl.trim());
    } else {
      onStartScanUrl();
    }
  }

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <div className="landing-hero__badge">
            <Sparkles size={14} className="text-cyan" />
            <span>Next-Gen Web Privacy & Permissions Telemetry</span>
          </div>

          <h1 className="landing-hero__headline">
            Unmask what any website or app <span className="gradient-text">actually does</span> with your data.
          </h1>

          <p className="landing-hero__subtitle">
            Instantly scan any web address to detect invasive permissions, third-party advertising trackers, fingerprinting scripts, and data retention policies. Transparent, 100% deterministic rule-based auditing.
          </p>

          {/* Quick Hero URL Search Bar */}
          <form onSubmit={handleHeroSubmit} className="hero-search-form">
            <div className="hero-search-bar">
              <Globe className="hero-search-icon" size={20} />
              <input
                type="text"
                className="hero-search-input"
                placeholder="Enter any domain or URL (e.g. zoom.us, instagram.com)"
                value={heroUrl}
                onChange={(e) => setHeroUrl(e.target.value)}
              />
              <button type="submit" className="button button--primary hero-search-btn">
                <span>Scan Site</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>

          {/* Quick benchmark chips */}
          <div className="hero-quick-chips">
            <span className="chips-label">Popular Audits:</span>
            {QUICK_BENCHMARKS.map((domain) => (
              <button
                key={domain}
                type="button"
                className="quick-chip"
                onClick={() => onStartScanUrl(domain)}
              >
                {domain}
              </button>
            ))}
          </div>

          {/* Manual Option Secondary Button */}
          <div className="hero-secondary-action">
            <span>Or test specific permissions:</span>
            <button
              type="button"
              className="link-button"
              onClick={onStartManualAudit}
            >
              Configure Custom Permissions Audit →
            </button>
          </div>
        </div>

        {/* Hero Visual Holographic Graphic */}
        <div className="landing-hero__visual">
          <div className="hero-graphic-card">
            <div className="hero-graphic-card__inner">
              <div className="graphic-scanner-grid"></div>
              <div className="graphic-shield-core">
                <ShieldCheck size={56} className="text-accent" />
                <div className="pulse-ring pulse-ring--1"></div>
                <div className="pulse-ring pulse-ring--2"></div>
              </div>
              <div className="graphic-telemetry-badge top-left">
                <Lock size={13} className="text-emerald" />
                <span>Zero Black-Box Scoring</span>
              </div>
              <div className="graphic-telemetry-badge bottom-right">
                <Zap size={13} className="text-cyan" />
                <span>Real-Time Permissions Policy</span>
              </div>
              <div className="graphic-telemetry-badge bottom-left">
                <EyeOff size={13} className="text-amber" />
                <span>Tracker & Ad Detection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="landing-features">
        <div className="feature-pillar">
          <div className="pillar-icon pillar-icon--cyan">
            <Globe size={24} />
          </div>
          <h3>Automated URL Inspection</h3>
          <p>
            Fetches live Permissions-Policy directives, CSP script sources, and cookie configurations to detect tracking vectors automatically.
          </p>
        </div>

        <div className="feature-pillar">
          <div className="pillar-icon pillar-icon--emerald">
            <ShieldCheck size={24} />
          </div>
          <h3>Apple-Style Nutrition Labels</h3>
          <p>
            Translates complex legal privacy policies into concise, standard nutrition labels highlighting sensory access and identity exposure.
          </p>
        </div>

        <div className="feature-pillar">
          <div className="pillar-icon pillar-icon--amber">
            <Sliders size={24} />
          </div>
          <h3>Interactive Revocation Simulator</h3>
          <p>
            Test "What happens if I block location or camera?" directly on the results screen and watch your privacy score recover live.
          </p>
        </div>
      </section>

      {/* Threat Stats Section */}
      <section className="landing-threats-wrapper">
        <ThreatStats />
      </section>
    </div>
  );
}
