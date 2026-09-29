import React, { useState, useMemo } from "react";
import ScoreGauge from "../components/ScoreGauge";
import RiskBadge from "../components/RiskBadge";
import CategoryBar from "../components/CategoryBar";
import { clientCalculatePrivacyScore } from "../api";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Download,
  Share2,
  Sliders,
  ExternalLink,
  Lock,
  Globe,
  Camera,
  Mic,
  MapPin,
  Fingerprint,
  Users,
  MessageSquare,
  HardDrive,
  Cookie,
  Activity,
  Megaphone,
  ScanFace,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const CATEGORY_LABELS = {
  permissions: "Permissions",
  dataCollection: "Data collection",
  tracking: "Tracking",
  dataSharing: "Data sharing",
  dataRetention: "Data retention",
};

export default function Dashboard({ entry, onNewCheck }) {
  const [copied, setCopied] = useState(false);

  // If no entry, render empty state
  if (!entry) {
    return (
      <section className="dashboard-empty-state">
        <div className="empty-state-box">
          <ShieldAlert size={48} className="text-amber" />
          <h2>No Audit Data Available</h2>
          <p>Run an automated URL scan or configure custom permissions to view your privacy breakdown.</p>
          <button className="button button--primary" onClick={onNewCheck}>
            Run New Audit
          </button>
        </div>
      </section>
    );
  }

  const { result, siteName, url, domain, createdAt, id, detectedSignals, securityHeaders } = entry;
  const initialInput = entry.input || {};

  // "What-If" Simulator State
  const [simPermissions, setSimPermissions] = useState(initialInput.permissions || {});
  const [simTracking, setSimTracking] = useState(initialInput.tracking || {});
  const [simDataSharing, setSimDataSharing] = useState(initialInput.dataSharing || "unknown");

  // Recalculate score live if simulator values changed
  const simulatedResult = useMemo(() => {
    return clientCalculatePrivacyScore({
      permissions: simPermissions,
      dataCollection: initialInput.dataCollection || {},
      tracking: simTracking,
      dataSharing: simDataSharing,
      dataRetention: initialInput.dataRetention || "unknown",
    });
  }, [simPermissions, simTracking, simDataSharing, initialInput]);

  const scoreDiff = Math.round(simulatedResult.overallScore - result.overallScore);

  function toggleSimPermission(key) {
    setSimPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleSimTracking(key) {
    setSimTracking((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function resetSimulator() {
    setSimPermissions(initialInput.permissions || {});
    setSimTracking(initialInput.tracking || {});
    setSimDataSharing(initialInput.dataSharing || "unknown");
  }

  function handleCopySummary() {
    const summaryText = `🛡️ Digital Privacy Audit for ${siteName}
Overall Score: ${simulatedResult.overallScore}/100 (${simulatedResult.riskLevel} Risk)
Permissions Triggered: ${Object.keys(simPermissions).filter((k) => simPermissions[k]).join(", ") || "None"}
Trackers Active: ${Object.keys(simTracking).filter((k) => simTracking[k]).join(", ") || "None"}
Audited with Digital Privacy Checker`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  function handleDownloadJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entry, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `privacy-audit-${siteName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  return (
    <section className="dashboard-page">
      {/* Header Banner */}
      <header className="dashboard-header">
        <div className="dashboard-header__left">
          <div className="site-identity">
            {url ? <Globe size={24} className="text-cyan" /> : <Shield size={24} className="text-accent" />}
            <div>
              <h1 className="site-identity__name">{siteName}</h1>
              <div className="site-identity__meta">
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="site-url-link"
                  >
                    <span>{url}</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                <span className="meta-dot">·</span>
                <span className="audit-timestamp">
                  Audited {new Date(createdAt).toLocaleDateString()} at {new Date(createdAt).toLocaleTimeString()}
                </span>
                <span className="meta-dot">·</span>
                <span className="audit-id">ID: {id?.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-header__actions">
          <RiskBadge level={simulatedResult.riskLevel} size="lg" />
          <div className="action-buttons-group">
            <button
              className="button button--secondary button--sm"
              onClick={handleCopySummary}
              title="Copy audit summary to clipboard"
            >
              {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Share Summary"}</span>
            </button>
            <button
              className="button button--secondary button--sm"
              onClick={handleDownloadJson}
              title="Download full JSON report"
            >
              <Download size={14} />
              <span>Export JSON</span>
            </button>
            <button className="button button--primary button--sm" onClick={onNewCheck}>
              <RotateCcw size={14} />
              <span>New Check</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Score & Category Overview */}
      <div className="dashboard-hero-grid">
        <div className="gauge-card">
          <div className="gauge-card__head">
            <span className="gauge-card__eyebrow">Overall Privacy Score</span>
            {scoreDiff !== 0 && (
              <span className={`diff-tag ${scoreDiff > 0 ? "diff-tag--positive" : "diff-tag--negative"}`}>
                {scoreDiff > 0 ? `+${scoreDiff} points simulated` : `${scoreDiff} points`}
              </span>
            )}
          </div>
          <ScoreGauge
            score={simulatedResult.overallScore}
            riskLevel={simulatedResult.riskLevel}
            size={200}
          />
          <p className="gauge-card__footer-note">
            Calculated across 5 deterministic risk vectors with 0% black-box estimation.
          </p>
        </div>

        <div className="categories-card">
          <h3 className="categories-card__title">Risk Category Breakdown</h3>
          <div className="categories-list">
            {Object.entries(simulatedResult.categories).map(([key, cat]) => (
              <CategoryBar
                key={key}
                label={CATEGORY_LABELS[key]}
                score={cat.score}
                weight={cat.weight}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Privacy Nutrition Label Grid */}
      <div className="nutrition-label-card">
        <div className="nutrition-label__header">
          <div className="nutrition-label__badge">
            <Sparkles size={14} />
            <span>Standardized Privacy Nutrition Label</span>
          </div>
          <h2>Data Practice Transparency Profile</h2>
          <p>Direct categorization of sensory access, identity harvesting, and commercial tracking.</p>
        </div>

        <div className="nutrition-grid">
          {/* Column 1: Hardware & Sensory */}
          <div className="nutrition-col">
            <div className="nutrition-col__head">
              <Camera size={18} className="text-rose" />
              <h4>Sensory & Hardware</h4>
            </div>
            <div className="nutrition-col__body">
              {Object.keys(simPermissions).filter((k) => simPermissions[k]).length > 0 ? (
                <div className="nutrition-tags">
                  {Object.keys(simPermissions)
                    .filter((k) => simPermissions[k])
                    .map((k) => (
                      <span key={k} className="nutrition-tag nutrition-tag--danger">
                        {k.charAt(0).toUpperCase() + k.slice(1)} Access
                      </span>
                    ))}
                </div>
              ) : (
                <p className="nutrition-clean-msg">
                  <ShieldCheck size={16} className="text-emerald" />
                  <span>No invasive sensory permissions granted</span>
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Personal Identifiers */}
          <div className="nutrition-col">
            <div className="nutrition-col__head">
              <Users size={18} className="text-amber" />
              <h4>Identifiable Data</h4>
            </div>
            <div className="nutrition-col__body">
              {Object.keys(initialInput.dataCollection || {}).filter((k) => initialInput.dataCollection[k]).length > 0 ? (
                <div className="nutrition-tags">
                  {Object.keys(initialInput.dataCollection)
                    .filter((k) => initialInput.dataCollection[k])
                    .map((k) => (
                      <span key={k} className="nutrition-tag nutrition-tag--warning">
                        {k.replace(/([A-Z])/g, " $1")}
                      </span>
                    ))}
                </div>
              ) : (
                <p className="nutrition-clean-msg">
                  <ShieldCheck size={16} className="text-emerald" />
                  <span>Minimal or no identity points collected</span>
                </p>
              )}
            </div>
          </div>

          {/* Column 3: Tracking & Telemetry */}
          <div className="nutrition-col">
            <div className="nutrition-col__head">
              <Megaphone size={18} className="text-cyan" />
              <h4>Tracking & Profiling</h4>
            </div>
            <div className="nutrition-col__body">
              {Object.keys(simTracking).filter((k) => simTracking[k]).length > 0 ? (
                <div className="nutrition-tags">
                  {Object.keys(simTracking)
                    .filter((k) => simTracking[k])
                    .map((k) => (
                      <span key={k} className="nutrition-tag nutrition-tag--tracking">
                        {k.replace(/([A-Z])/g, " $1")}
                      </span>
                    ))}
                </div>
              ) : (
                <p className="nutrition-clean-msg">
                  <ShieldCheck size={16} className="text-emerald" />
                  <span>Zero trackers or fingerprinting methods</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive "What-If" Revocation Simulator */}
      <div className="simulator-card">
        <div className="simulator-card__head">
          <div className="simulator-card__title-group">
            <Sliders size={20} className="text-cyan" />
            <div>
              <h3>Interactive "What-If" Revocation Simulator</h3>
              <p>Test the privacy impact of revoking specific permissions or blocking trackers in real time.</p>
            </div>
          </div>
          {scoreDiff !== 0 && (
            <button className="button button--outline button--sm" onClick={resetSimulator}>
              <RotateCcw size={13} />
              <span>Reset Simulator</span>
            </button>
          )}
        </div>

        <div className="simulator-toggles-grid">
          {/* Permission Toggles */}
          {Object.keys(initialInput.permissions || {})
            .filter((k) => initialInput.permissions[k])
            .map((k) => (
              <div
                key={k}
                className={`sim-toggle-pill ${simPermissions[k] ? "is-granted" : "is-revoked"}`}
                onClick={() => toggleSimPermission(k)}
              >
                <div className="sim-toggle-info">
                  <span className="sim-toggle-name">{k.toUpperCase()}</span>
                  <span className="sim-toggle-status">
                    {simPermissions[k] ? "Granted (Active)" : "Revoked (Protected)"}
                  </span>
                </div>
                <div className="sim-switch">
                  <span className={`sim-switch__handle ${simPermissions[k] ? "on" : "off"}`}></span>
                </div>
              </div>
            ))}

          {/* Tracking Toggles */}
          {Object.keys(initialInput.tracking || {})
            .filter((k) => initialInput.tracking[k])
            .map((k) => (
              <div
                key={k}
                className={`sim-toggle-pill ${simTracking[k] ? "is-granted" : "is-revoked"}`}
                onClick={() => toggleSimTracking(k)}
              >
                <div className="sim-toggle-info">
                  <span className="sim-toggle-name">{k.toUpperCase()} TRACKING</span>
                  <span className="sim-toggle-status">
                    {simTracking[k] ? "Allowed" : "Blocked by Shield"}
                  </span>
                </div>
                <div className="sim-switch">
                  <span className={`sim-switch__handle ${simTracking[k] ? "on" : "off"}`}></span>
                </div>
              </div>
            ))}
        </div>

        {scoreDiff > 0 && (
          <div className="simulator-gain-banner">
            <Sparkles size={18} className="text-emerald" />
            <span>
              By revoking these permissions, you would raise your privacy score by <strong>+{scoreDiff} points</strong> (to {simulatedResult.overallScore}/100)!
            </span>
          </div>
        )}
      </div>

      {/* Discovered Signals (if from URL scanner) */}
      {detectedSignals && detectedSignals.length > 0 && (
        <div className="signals-card">
          <div className="signals-card__head">
            <Globe size={18} className="text-cyan" />
            <h3>Automated Scanner Telemetry & Signals</h3>
          </div>
          <ul className="signals-list">
            {detectedSignals.map((signal, idx) => (
              <li key={idx} className="signal-item">
                <span className="signal-bullet"></span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Concerns & Recommendations Two-Column */}
      <div className="advisory-grid">
        <div className="advisory-card advisory-card--concerns">
          <div className="advisory-card__head">
            <AlertTriangle size={20} className="text-amber" />
            <h3>Identified Privacy Concerns ({result.concerns.length})</h3>
          </div>
          {result.concerns.length > 0 ? (
            <ul className="advisory-list">
              {result.concerns.map((c, i) => (
                <li key={i} className="advisory-item">
                  <span className="advisory-icon advisory-icon--amber">!</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="advisory-clean-note">
              <ShieldCheck size={18} className="text-emerald" />
              <span>No severe concerns flagged for this configuration.</span>
            </p>
          )}
        </div>

        <div className="advisory-card advisory-card--recs">
          <div className="advisory-card__head">
            <ShieldCheck size={20} className="text-emerald" />
            <h3>Actionable Recommendations ({result.recommendations.length})</h3>
          </div>
          <ul className="advisory-list">
            {result.recommendations.map((r, i) => (
              <li key={i} className="advisory-item">
                <span className="advisory-icon advisory-icon--emerald">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="dashboard-footer-bar">
        <button className="button button--secondary" onClick={onNewCheck}>
          ← Scan Another Service
        </button>
      </div>
    </section>
  );
}
