"use client";

type Props = {
  completed: number;
  goal: number;
  bumped: boolean;
  size?: number;
};

export default function ProgressRing({
  completed,
  goal,
  bumped,
  size = 248,
}: Props) {
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = goal > 0 ? Math.min(completed / goal, 1) : 0;
  const dashoffset = circumference * (1 - progress);
  const pct = Math.round(progress * 100);

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
        aria-label={`${completed} von ${goal} Calls, ${pct} Prozent`}
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
        <span className="mt-1 text-sm font-medium text-muted tnum">
          {pct}% erreicht
        </span>
      </div>
    </div>
  );
}
