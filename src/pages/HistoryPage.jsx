import React, { useState, useEffect } from "react";
import { getHistory, getStats } from "../api";
import RiskBadge from "../components/RiskBadge";
import { History, Search, ArrowRight, ShieldCheck, AlertCircle, ExternalLink, Calendar, Database, Sparkles, Filter } from "lucide-react";

export default function HistoryPage({ onSelectEntry, onNewCheck }) {
  const [historyList, setHistoryList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all"); // "all" | "Low" | "Medium" | "High"

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [hist, st] = await Promise.allSettled([getHistory(), getStats()]);
        if (hist.status === "fulfilled") setHistoryList(hist.value || []);
        if (st.status === "fulfilled") setStats(st.value || null);
      } catch (err) {
        console.error("Failed to load audit history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredItems = historyList.filter((item) => {
    const matchesQuery = item.siteName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (item.url && item.url.toLowerCase().includes(filterQuery.toLowerCase()));
    const matchesRisk = riskFilter === "all" || item.result?.riskLevel === riskFilter;
    return matchesQuery && matchesRisk;
  });

  return (
    <section className="history-page">
      <header className="history-header">
        <div className="history-header__left">
          <div className="history-badge">
            <Database size={14} className="text-cyan" />
            <span>SQLite Audit Vault</span>
          </div>
          <h1 className="history-title">Audit History & Records</h1>
          <p className="history-subtitle">
            Review past privacy assessments, inspect previous telemetry scans, and track changes across services.
          </p>
        </div>
        <button className="button button--primary" onClick={onNewCheck}>
          + Run New Audit
        </button>
      </header>

      {/* Aggregate Stats Banner */}
      {stats && (
        <div className="history-stats-banner">
          <div className="history-stat-card">
            <span className="stat-label">Total Audits Performed</span>
            <span className="stat-value">{stats.total || historyList.length}</span>
          </div>
          <div className="history-stat-card">
            <span className="stat-label">Average Privacy Score</span>
            <span className="stat-value text-accent">
              {stats.avgScore ? `${stats.avgScore} / 100` : "N/A"}
            </span>
          </div>
          <div className="history-stat-card">
            <span className="stat-label">High-Risk Services Flagged</span>
            <span className="stat-value text-rose">{stats.highRiskCount || 0}</span>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="history-controls">
        <div className="history-search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by site name or URL..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>

        <div className="history-filter-chips">
          {["all", "Low", "Medium", "High"].map((level) => (
            <button
              key={level}
              type="button"
              className={`filter-chip ${riskFilter === level ? "is-active" : ""}`}
              onClick={() => setRiskFilter(level)}
            >
              {level === "all" ? "All Audits" : `${level} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      {loading ? (
        <div className="history-loading">
          <div className="spinner"></div>
          <p>Retrieving past audit records from secure database...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="history-empty">
          <AlertCircle size={40} className="text-amber" />
          <h3>No matching audit records</h3>
          <p>Try clearing your filter or run a new scan.</p>
        </div>
      ) : (
        <div className="history-cards-grid">
          {filteredItems.map((entry) => {
            const score = entry.result?.overallScore || 0;
            const level = entry.result?.riskLevel || "Unknown";
            const dateStr = new Date(entry.createdAt).toLocaleDateString();
            const timeStr = new Date(entry.createdAt).toLocaleTimeString();

            return (
              <div
                key={entry.id}
                className="history-entry-card"
                onClick={() => onSelectEntry(entry)}
              >
                <div className="history-entry-card__top">
                  <div>
                    <h3 className="history-entry__name">{entry.siteName}</h3>
                    {entry.url && (
                      <span className="history-entry__url">{entry.url}</span>
                    )}
                  </div>
                  <RiskBadge level={level} size="sm" />
                </div>

                <div className="history-entry-card__middle">
                  <div className="score-mini-pill">
                    <span className="score-num">{score}</span>
                    <span className="score-denom">/ 100</span>
                  </div>

                  <div className="entry-meta-flags">
                    <span>
                      {Object.keys(entry.input?.permissions || {}).filter((k) => entry.input.permissions[k]).length} permissions
                    </span>
                    <span className="meta-dot">·</span>
                    <span>
                      {Object.keys(entry.input?.tracking || {}).filter((k) => entry.input.tracking[k]).length} trackers
                    </span>
                  </div>
                </div>

                <div className="history-entry-card__bottom">
                  <div className="entry-timestamp">
                    <Calendar size={13} />
                    <span>{dateStr} {timeStr}</span>
                  </div>
                  <span className="view-report-link">
                    <span>View Report</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
