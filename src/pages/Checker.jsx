import React, { useState, useMemo } from "react";
import { analyzeSite, clientCalculatePrivacyScore } from "../api";
import UrlScanner from "../components/UrlScanner";
import ScoreGauge from "../components/ScoreGauge";
import RiskBadge from "../components/RiskBadge";
import {
  Camera,
  Mic,
  MapPin,
  Fingerprint,
  Users,
  MessageSquare,
  HardDrive,
  User,
  Mail,
  Phone,
  CreditCard,
  HeartPulse,
  History,
  Laptop,
  Cookie,
  Activity,
  Megaphone,
  ScanFace,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Zap,
} from "lucide-react";

const PERMISSION_CONFIG = [
  { key: "camera", label: "Camera Access", desc: "Can record video and capture device optical feeds", risk: "High", icon: Camera },
  { key: "microphone", label: "Microphone Access", desc: "Can listen to ambient audio and voice inputs", risk: "High", icon: Mic },
  { key: "location", label: "Precise Geolocation", desc: "Tracks real-time GPS coordinates and physical whereabouts", risk: "Critical", icon: MapPin },
  { key: "biometrics", label: "Biometric Sensors", desc: "Accesses fingerprint, facial geometry, or retina scans", risk: "Critical", icon: Fingerprint },
  { key: "contacts", label: "Address Book & Contacts", desc: "Reads private contacts, emails, and phone records of peers", risk: "Medium", icon: Users },
  { key: "sms", label: "SMS & Text Messages", desc: "Can intercept OTP verification codes and personal messages", risk: "Medium", icon: MessageSquare },
  { key: "storage", label: "Local Filesystem & Storage", desc: "Accesses documents, photos, or cached files on device", risk: "Low", icon: HardDrive },
];

const DATA_CONFIG = [
  { key: "name", label: "Full Legal Name", desc: "Identifies your real-world identity", icon: User },
  { key: "email", label: "Email Address", desc: "Primary digital identifier and communication channel", icon: Mail },
  { key: "phone", label: "Phone Number", desc: "Direct cellular line, susceptible to SIM-swapping", icon: Phone },
  { key: "financial", label: "Financial & Card Data", desc: "Credit cards, bank accounts, or purchase transactions", icon: CreditCard, highlight: true },
  { key: "health", label: "Health & Medical Data", desc: "Sensitive biometric, fitness, or diagnostic records", icon: HeartPulse, highlight: true },
  { key: "browsingHistory", label: "Browsing History", desc: "Detailed timeline of websites visited and search queries", icon: History },
  { key: "deviceId", label: "Hardware & Device ID", desc: "Unique hardware identifiers (IMEI, MAC, serial numbers)", icon: Laptop },
];

const TRACKING_CONFIG = [
  { key: "cookies", label: "Tracking Cookies", desc: "Maintains session state and monitors activity across tabs", icon: Cookie },
  { key: "analytics", label: "Behavioral Analytics", desc: "Records clicks, scrolls, dwell time, and user flows", icon: Activity },
  { key: "adTrackers", label: "Commercial Ad Trackers", desc: "Feeds cross-platform targeted advertising networks", icon: Megaphone, highlight: true },
  { key: "fingerprinting", label: "Device Fingerprinting", desc: "Silently profiles canvas, audio, and hardware entropy", icon: ScanFace, highlight: true },
];

const SHARING_OPTIONS = [
  { value: "none", label: "Never Shared", desc: "Strictly confined to core service operation" },
  { value: "partners", label: "Third-Party Partners", desc: "Shared with advertisers, affiliates & data brokers" },
  { value: "public", label: "Made Public", desc: "Visible to any internet user or search engine index" },
  { value: "unknown", label: "Unclear / Undisclosed", desc: "Vague privacy policy wording (treated as high risk)" },
];

const RETENTION_OPTIONS = [
  { value: "session", label: "Session Only", desc: "Purged immediately upon closing session" },
  { value: "limited", label: "Fixed Duration", desc: "Retained for stated period (e.g. 30-90 days)" },
  { value: "indefinite", label: "Indefinite Storage", desc: "Stored forever with no automatic deletion policy" },
  { value: "unknown", label: "Undisclosed", desc: "No explicit retention expiration defined" },
];

const PRESETS = [
  {
    name: "Social Media App",
    tag: "e.g. Instagram / TikTok",
    state: {
      permissions: { camera: true, microphone: true, location: true, contacts: true, storage: true, biometrics: false, sms: false },
      dataCollection: { name: true, email: true, phone: true, browsingHistory: true, deviceId: true, financial: false, health: false },
      tracking: { cookies: true, analytics: true, adTrackers: true, fingerprinting: true },
      dataSharing: "partners",
      dataRetention: "indefinite",
    },
  },
  {
    name: "Video Conferencing",
    tag: "e.g. Zoom / Meet",
    state: {
      permissions: { camera: true, microphone: true, storage: true, location: false, contacts: false, biometrics: false, sms: false },
      dataCollection: { name: true, email: true, deviceId: true, phone: false, financial: false, health: false, browsingHistory: false },
      tracking: { cookies: true, analytics: true, adTrackers: false, fingerprinting: false },
      dataSharing: "partners",
      dataRetention: "limited",
    },
  },
  {
    name: "Banking / Fintech",
    tag: "e.g. PayPal / Bank",
    state: {
      permissions: { biometrics: true, storage: true, camera: false, microphone: false, location: false, contacts: false, sms: false },
      dataCollection: { name: true, email: true, phone: true, financial: true, deviceId: true, health: false, browsingHistory: false },
      tracking: { cookies: true, analytics: true, adTrackers: false, fingerprinting: false },
      dataSharing: "partners",
      dataRetention: "limited",
    },
  },
  {
    name: "Private Search Engine",
    tag: "e.g. DuckDuckGo / Brave",
    state: {
      permissions: { camera: false, microphone: false, location: false, contacts: false, storage: false, biometrics: false, sms: false },
      dataCollection: { name: false, email: false, phone: false, financial: false, health: false, browsingHistory: false, deviceId: false },
      tracking: { cookies: false, analytics: false, adTrackers: false, fingerprinting: false },
      dataSharing: "none",
      dataRetention: "session",
    },
  },
];

function initCheckboxState(fields) {
  return Object.fromEntries(fields.map((f) => [f.key, false]));
}

export default function Checker({ onAnalyzed, onBack, initialMode = "url" }) {
  const [activeTab, setActiveTab] = useState(initialMode); // "url" | "manual"
  const [siteName, setSiteName] = useState("");
  const [permissions, setPermissions] = useState(initCheckboxState(PERMISSION_CONFIG));
  const [dataCollection, setDataCollection] = useState(initCheckboxState(DATA_CONFIG));
  const [tracking, setTracking] = useState(initCheckboxState(TRACKING_CONFIG));
  const [dataSharing, setDataSharing] = useState("unknown");
  const [dataRetention, setDataRetention] = useState("unknown");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Live Reactive Risk Score Calculation
  const liveEstimate = useMemo(() => {
    return clientCalculatePrivacyScore({
      permissions,
      dataCollection,
      tracking,
      dataSharing,
      dataRetention,
    });
  }, [permissions, dataCollection, tracking, dataSharing, dataRetention]);

  function toggle(setter, key) {
    setter((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function applyPreset(preset) {
    setSiteName(preset.name);
    setPermissions(preset.state.permissions);
    setDataCollection(preset.state.dataCollection);
    setTracking(preset.state.tracking);
    setDataSharing(preset.state.dataSharing);
    setDataRetention(preset.state.dataRetention);
  }

  function resetForm() {
    setSiteName("");
    setPermissions(initCheckboxState(PERMISSION_CONFIG));
    setDataCollection(initCheckboxState(DATA_CONFIG));
    setTracking(initCheckboxState(TRACKING_CONFIG));
    setDataSharing("unknown");
    setDataRetention("unknown");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const entry = await analyzeSite({
        siteName: siteName.trim() || undefined,
        permissions,
        dataCollection,
        tracking,
        dataSharing,
        dataRetention,
      });
      onAnalyzed(entry);
    } catch (err) {
      setError(
        err.message?.includes("Failed to fetch")
          ? "Could not connect to the backend server at http://localhost:5000."
          : err.message || "Failed to analyze permissions."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="checker-page">
      <div className="checker-page__top">
        <button className="link-back" onClick={onBack} type="button">
          <ArrowLeft size={16} />
          <span>Back to Overview</span>
        </button>

        {/* Tab Switcher */}
        <div className="checker-mode-tabs">
          <button
            className={`mode-tab ${activeTab === "url" ? "is-active" : ""}`}
            onClick={() => setActiveTab("url")}
          >
            <Sparkles size={16} />
            <span>Automated URL Scanner</span>
          </button>
          <button
            className={`mode-tab ${activeTab === "manual" ? "is-active" : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            <Zap size={16} />
            <span>Custom Permission Auditor</span>
          </button>
        </div>
      </div>

      {activeTab === "url" ? (
        <UrlScanner
          onScanned={onAnalyzed}
          onCustomAudit={() => setActiveTab("manual")}
        />
      ) : (
        <div className="checker-layout">
          {/* Main Form */}
          <div className="checker-main">
            <header className="checker-header">
              <h1 className="checker-header__title">Audit Permissions & Trackers</h1>
              <p className="checker-header__subtitle">
                Select the hardware permissions, personal telemetry, and data policies for any website or app to simulate risk exposure.
              </p>
            </header>

            {/* Quick Presets */}
            <div className="presets-bar">
              <span className="presets-label">Quick Presets:</span>
              <div className="preset-buttons">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    className="preset-btn"
                    onClick={() => applyPreset(p)}
                  >
                    <span>{p.name}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="preset-btn preset-btn--reset"
                  onClick={resetForm}
                  title="Clear all selections"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="checker-form">
              {/* Site Name Input */}
              <div className="field-card">
                <label className="field-label" htmlFor="siteNameInput">
                  Site or Application Name
                </label>
                <input
                  id="siteNameInput"
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. Social Video App, Messaging Tool, or Custom Service"
                  className="field-input"
                />
              </div>

              {/* Hardware & Device Permissions */}
              <div className="audit-section">
                <div className="audit-section__head">
                  <div className="audit-section__title-group">
                    <ShieldAlert size={20} className="text-accent" />
                    <h3>Hardware & Device Permissions</h3>
                  </div>
                  <span className="audit-section__badge">High Exposure Risk</span>
                </div>
                <div className="cards-grid">
                  {PERMISSION_CONFIG.map((p) => {
                    const Icon = p.icon;
                    const isChecked = permissions[p.key];
                    return (
                      <div
                        key={p.key}
                        className={`permission-card ${isChecked ? "is-selected" : ""}`}
                        onClick={() => toggle(setPermissions, p.key)}
                      >
                        <div className="permission-card__head">
                          <div className={`permission-card__icon ${isChecked ? "is-active" : ""}`}>
                            <Icon size={18} />
                          </div>
                          <span className={`risk-tag risk-tag--${p.risk.toLowerCase()}`}>
                            {p.risk} Risk
                          </span>
                        </div>
                        <div className="permission-card__content">
                          <h4>{p.label}</h4>
                          <p>{p.desc}</p>
                        </div>
                        <div className="permission-card__toggle">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            aria-label={p.label}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Personal Data Collection */}
              <div className="audit-section">
                <div className="audit-section__head">
                  <div className="audit-section__title-group">
                    <User size={20} className="text-accent" />
                    <h3>Personal Data Collection</h3>
                  </div>
                  <span className="audit-section__badge">Identity Exposure</span>
                </div>
                <div className="cards-grid">
                  {DATA_CONFIG.map((d) => {
                    const Icon = d.icon;
                    const isChecked = dataCollection[d.key];
                    return (
                      <div
                        key={d.key}
                        className={`permission-card ${isChecked ? "is-selected" : ""} ${
                          d.highlight ? "permission-card--highlight" : ""
                        }`}
                        onClick={() => toggle(setDataCollection, d.key)}
                      >
                        <div className="permission-card__head">
                          <div className={`permission-card__icon ${isChecked ? "is-active" : ""}`}>
                            <Icon size={18} />
                          </div>
                          {d.highlight && <span className="risk-tag risk-tag--critical">Sensitive</span>}
                        </div>
                        <div className="permission-card__content">
                          <h4>{d.label}</h4>
                          <p>{d.desc}</p>
                        </div>
                        <div className="permission-card__toggle">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            aria-label={d.label}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracking & Telemetry */}
              <div className="audit-section">
                <div className="audit-section__head">
                  <div className="audit-section__title-group">
                    <Activity size={20} className="text-accent" />
                    <h3>Tracking & Profiling Methods</h3>
                  </div>
                  <span className="audit-section__badge">Cross-Site Surveillance</span>
                </div>
                <div className="cards-grid">
                  {TRACKING_CONFIG.map((t) => {
                    const Icon = t.icon;
                    const isChecked = tracking[t.key];
                    return (
                      <div
                        key={t.key}
                        className={`permission-card ${isChecked ? "is-selected" : ""} ${
                          t.highlight ? "permission-card--highlight" : ""
                        }`}
                        onClick={() => toggle(setTracking, t.key)}
                      >
                        <div className="permission-card__head">
                          <div className={`permission-card__icon ${isChecked ? "is-active" : ""}`}>
                            <Icon size={18} />
                          </div>
                          {t.highlight && <span className="risk-tag risk-tag--high">Aggressive</span>}
                        </div>
                        <div className="permission-card__content">
                          <h4>{t.label}</h4>
                          <p>{t.desc}</p>
                        </div>
                        <div className="permission-card__toggle">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            aria-label={t.label}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Sharing Policy */}
              <div className="audit-section">
                <div className="audit-section__head">
                  <h3>Data Sharing Policy</h3>
                </div>
                <div className="radio-cards-grid">
                  {SHARING_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`radio-card ${dataSharing === opt.value ? "is-selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="dataSharing"
                        value={opt.value}
                        checked={dataSharing === opt.value}
                        onChange={() => setDataSharing(opt.value)}
                      />
                      <div className="radio-card__content">
                        <span className="radio-card__title">{opt.label}</span>
                        <span className="radio-card__desc">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Data Retention Duration */}
              <div className="audit-section">
                <div className="audit-section__head">
                  <h3>Data Retention Policy</h3>
                </div>
                <div className="radio-cards-grid">
                  {RETENTION_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`radio-card ${dataRetention === opt.value ? "is-selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="dataRetention"
                        value={opt.value}
                        checked={dataRetention === opt.value}
                        onChange={() => setDataRetention(opt.value)}
                      />
                      <div className="radio-card__content">
                        <span className="radio-card__title">{opt.label}</span>
                        <span className="radio-card__desc">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="scanner-error-banner">
                  <AlertTriangle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="button button--primary button--large submit-audit-btn"
                disabled={loading}
              >
                {loading ? "Generating Report…" : "Finalize & Generate Official Report"}
              </button>
            </form>
          </div>

          {/* Sticky Reactive Sidebar */}
          <aside className="checker-sidebar">
            <div className="sidebar-meter-card sticky-sidebar">
              <div className="sidebar-meter__header">
                <span className="sidebar-meter__tag">
                  <Zap size={14} className="text-amber" />
                  <span>Real-Time Reactive Meter</span>
                </span>
                <RiskBadge level={liveEstimate.riskLevel} />
              </div>

              <div className="sidebar-meter__gauge">
                <ScoreGauge score={liveEstimate.overallScore} riskLevel={liveEstimate.riskLevel} size={180} />
              </div>

              <div className="sidebar-meter__telemetry">
                <div className="telemetry-row">
                  <span>Hardware Access:</span>
                  <strong>{liveEstimate.categories.permissions.triggered.length} active</strong>
                </div>
                <div className="telemetry-row">
                  <span>Data Points:</span>
                  <strong>{liveEstimate.categories.dataCollection.triggered.length} collected</strong>
                </div>
                <div className="telemetry-row">
                  <span>Trackers:</span>
                  <strong>{liveEstimate.categories.tracking.triggered.length} active</strong>
                </div>
                <div className="telemetry-row">
                  <span>Sharing Policy:</span>
                  <strong className="text-capitalize">{dataSharing}</strong>
                </div>
              </div>

              <p className="sidebar-meter__hint">
                Toggling permissions or trackers recalculates this estimate live using our deterministic rule engine.
              </p>

              <button
                type="button"
                className="button button--primary button--full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Calculating..." : "View Full Report →"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
