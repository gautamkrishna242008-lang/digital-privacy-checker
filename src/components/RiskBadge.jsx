import React from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

export default function RiskBadge({ level, size = "md" }) {
  const normalized = level?.toLowerCase() || "unknown";

  const icons = {
    low: <ShieldCheck size={size === "lg" ? 18 : 14} />,
    medium: <AlertTriangle size={size === "lg" ? 18 : 14} />,
    high: <ShieldAlert size={size === "lg" ? 18 : 14} />,
  };

  return (
    <span className={`risk-badge risk-badge--${normalized} risk-badge--${size}`}>
      <span className="risk-badge__pulse"></span>
      <span className="risk-badge__icon">{icons[normalized]}</span>
      <span className="risk-badge__text">{level || "Unknown"} Risk</span>
    </span>
  );
}
