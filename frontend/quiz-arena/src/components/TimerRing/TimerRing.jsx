import React, { useEffect, useRef, useState } from "react";
import "./TimerRing.css";

const SIZE = 96;
const STROKE = 7;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TimerRing({
  duration,
  onExpire,
  isPaused = false,
  resetKey,
}) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    setSecondsLeft(duration);
    hasExpiredRef.current = false;
  }, [resetKey, duration]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, resetKey]);

  const progress = secondsLeft / duration;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const ratio = secondsLeft / duration;
  const color =
    ratio > 0.5 ? "var(--orange)" : ratio > 0.25 ? "var(--gold)" : "var(--red)";

  return (
    <div
      className="timer-ring"
      role="timer"
      aria-live="polite"
      aria-label={`${secondsLeft} seconds left`}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{
            transition: "stroke-dashoffset 1s linear, stroke 0.3s ease",
          }}
        />
      </svg>
      <span className="timer-number" style={{ color }}>
        {secondsLeft}
      </span>
    </div>
  );
}
