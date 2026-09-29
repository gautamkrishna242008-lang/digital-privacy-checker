import React from "react";
import { Shield, Database, Crosshair, Share2, Clock } from "lucide-react";

const CATEGORY_ICONS = {
  Permissions: <Shield size={16} />,
  "Data collection": <Database size={16} />,
  Tracking: <Crosshair size={16} />,
  "Data sharing": <Share2 size={16} />,
  "Data retention": <Clock size={16} />,
};

export default function CategoryBar({ label, score, weight }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tone = clamped >= 75 ? "low" : clamped >= 45 ? "medium" : "high";

  return (
    <div className="category-bar">
      <div className="category-bar__head">
        <div className="category-bar__title-group">
          <span className="category-bar__icon">{CATEGORY_ICONS[label] || <Shield size={16} />}</span>
          <span className="category-bar__label">{label}</span>
        </div>
        <div className="category-bar__meta">
          <span className={`category-bar__score category-bar__score--${tone}`}>{clamped} / 100</span>
          <span className="category-bar__weight">Impact: {weight}%</span>
        </div>
      </div>
      <div className="category-bar__track">
        <div
          className={`category-bar__fill category-bar__fill--${tone}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
