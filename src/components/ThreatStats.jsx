import React, { useEffect, useRef, useState } from "react";

// Illustrative figures based on widely-reported industry trends.
// Swap these for a live feed or a real source once you have one wired up.
const YEARLY_BREACHES = [
  { year: "2021", value: 1862 },
  { year: "2022", value: 1802 },
  { year: "2023", value: 3205 },
  { year: "2024", value: 3158 },
  { year: "2025", value: 3400 },
];

const STAT_CARDS = [
  { target: 2200, suffix: "+", label: "Data breaches reported last year" },
  { target: 353, suffix: "M", label: "Records exposed in 2024 alone" },
  { target: 68, suffix: "%", label: "Apps that over-request permissions" },
];

function useCountUp(target, active, duration = 1400) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    let frame;
    function tick(ts) {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

function StatCard({ card, active, delay }) {
  const value = useCountUp(card.target, active);
  return (
    <div className="threat-stat" style={{ transitionDelay: `${delay}ms` }}>
      <span className="threat-stat__value">
        {value.toLocaleString()}
        {card.suffix}
      </span>
      <span className="threat-stat__label">{card.label}</span>
    </div>
  );
}

export default function ThreatStats() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const maxValue = Math.max(...YEARLY_BREACHES.map((d) => d.value));

  return (
    <div className={`threat-stats ${visible ? "is-visible" : ""}`} ref={ref}>
      <p className="threat-stats__eyebrow">Why it matters</p>

      <div className="threat-stats__cards">
        {STAT_CARDS.map((card, i) => (
          <StatCard key={card.label} card={card} active={visible} delay={i * 120} />
        ))}
      </div>

      <div
        className="threat-stats__chart"
        role="img"
        aria-label="Reported data breaches by year, trending upward"
      >
        <div className="threat-stats__chart-head">
          <span>Reported breaches by year</span>
        </div>
        <div className="threat-bars">
          {YEARLY_BREACHES.map((d, i) => (
            <div className="threat-bar" key={d.year} style={{ "--i": i }}>
              <div
                className="threat-bar__fill"
                style={{ height: visible ? `${(d.value / maxValue) * 100}%` : "0%" }}
              />
              <span className="threat-bar__year">{d.year}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="threat-stats__source">
        Illustrative figures based on publicly reported industry trends — swap
        in a live feed or cited source when you're ready.
      </p>
    </div>
  );
}
