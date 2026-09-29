import React from "react";

const RISK_CONFIG = {
  Low: {
    color: "#10b981", // Emerald
    gradient: ["#10b981", "#34d399"],
    glow: "rgba(16, 185, 129, 0.35)",
    label: "Low Risk",
    description: "Privacy-Respecting",
  },
  Medium: {
    color: "#f59e0b", // Amber
    gradient: ["#f59e0b", "#fbbf24"],
    glow: "rgba(245, 158, 11, 0.35)",
    label: "Moderate Risk",
    description: "Significant Data Exposure",
  },
  High: {
    color: "#f43f5e", // Rose / Red
    gradient: ["#f43f5e", "#fb7185"],
    glow: "rgba(244, 63, 94, 0.4)",
    label: "High Risk",
    description: "Severe Privacy Concerns",
  },
};

export default function ScoreGauge({ score, riskLevel, size = 220 }) {
  const config = RISK_CONFIG[riskLevel] || RISK_CONFIG.Medium;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const offset = circumference * (1 - clamped / 100);

  const gradientId = `gauge-gradient-${riskLevel.toLowerCase()}`;

  return (
    <div className="score-gauge-container">
      <div
        className="score-gauge"
        style={{
          width: size,
          height: size,
          filter: `drop-shadow(0 0 16px ${config.glow})`,
        }}
      >
        <svg width={size} height={size} viewBox="0 0 200 200">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.gradient[0]} />
              <stop offset="100%" stopColor={config.gradient[1]} />
            </linearGradient>
            <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background track circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="score-gauge__track"
            strokeWidth="12"
          />

          {/* Value arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
            className="score-gauge__value"
          />
        </svg>

        <div className="score-gauge__label">
          <span className="score-gauge__number" style={{ color: config.color }}>
            {clamped}
          </span>
          <span className="score-gauge__out-of">Score / 100</span>
          <span
            className="score-gauge__pill"
            style={{
              backgroundColor: `${config.color}20`,
              color: config.color,
              borderColor: `${config.color}50`,
            }}
          >
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
}
