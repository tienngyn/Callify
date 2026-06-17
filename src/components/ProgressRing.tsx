"use client";

type Props = {
  completed: number;
  goal: number;
  stretch: number;
  bumped: boolean;
  size?: number;
};

export default function ProgressRing({
  completed,
  goal,
  stretch,
  bumped,
  size = 248,
}: Props) {
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = goal > 0 ? Math.min(completed / goal, 1) : 0;
  const dashoffset = circumference * (1 - progress);
  const pct = Math.round(progress * 100);

  const done = completed >= goal;
  const bonus = Math.max(0, completed - goal);

  // Bonus-Bogen (Ziel -> Stretch) als zweiter, innerer Ring.
  const innerRadius = radius - stroke - 4;
  const innerCirc = 2 * Math.PI * innerRadius;
  const bonusSpan = Math.max(0, stretch - goal);
  const bonusProgress = bonusSpan > 0 ? Math.min(bonus / bonusSpan, 1) : 0;
  const innerOffset = innerCirc * (1 - bonusProgress);

  return (
    <div
      className="ring-shell relative grid place-items-center"
      style={{ width: size + 36, height: size + 36 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`${completed} von ${goal} Calls${
          bonus > 0 ? `, plus ${bonus} Bonus` : ""
        }`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ring-fill)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{
            transition: "stroke-dashoffset 0.6s cubic-bezier(0.2,0.8,0.2,1)",
          }}
        />
        {/* Bonus-Fortschritt Richtung Stretch, dezent und nur wenn aktiv. */}
        {done && bonusProgress > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            fill="none"
            stroke="var(--ring-fill)"
            strokeOpacity={0.4}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={innerCirc}
            strokeDashoffset={innerOffset}
            style={{
              transition: "stroke-dashoffset 0.6s cubic-bezier(0.2,0.8,0.2,1)",
            }}
          />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={`tnum flex items-baseline gap-1 font-[family-name:var(--font-display)] leading-none text-ink ${
            bumped ? "animate-bump" : ""
          }`}
        >
          <span className="text-[5rem] font-bold tracking-tight">
            {completed}
          </span>
          <span className="text-3xl font-semibold text-faint">/{goal}</span>
        </div>
        {done ? (
          <span className="tnum mt-1 text-sm font-semibold text-ink">
            {bonus > 0 ? `Ziel ✓ · +${bonus} Bonus` : "Ziel erreicht ✓"}
            <span className="font-medium text-faint"> · Stretch {stretch}</span>
          </span>
        ) : (
          <span className="tnum mt-1 text-sm font-medium text-muted">
            {pct}% · Stretch {stretch}
          </span>
        )}
      </div>
    </div>
  );
}
