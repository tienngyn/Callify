"use client";

import { PaceStatus } from "@/lib/pace";

/**
 * Selbstgezeichneter „Salesman" als Pace-Maskottchen.
 * Mimik + Haltung + Animation richten sich nach dem Pace-Status —
 * monochrom (currentColor), damit es zu allen Themes passt.
 */

type Cfg = {
  lean: number;
  anim: string;
  label: string;
};

const CFG: Record<PaceStatus, Cfg> = {
  done: { lean: 0, anim: "mascot-cheer", label: "jubelnd" },
  ahead: { lean: -6, anim: "mascot-dash", label: "voll motiviert" },
  onpace: { lean: 0, anim: "mascot-bob", label: "im Tritt" },
  warn: { lean: 4, anim: "mascot-sway", label: "etwas zäh" },
  alarm: { lean: 8, anim: "mascot-tired", label: "müde" },
};

function Face({ status }: { status: PaceStatus }) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  // Augen
  let eyes: React.ReactNode;
  if (status === "done") {
    eyes = (
      <>
        <path d="M25 21 q2.5 -3 5 0" {...stroke} />
        <path d="M34 21 q2.5 -3 5 0" {...stroke} />
      </>
    );
  } else if (status === "ahead" || status === "onpace") {
    eyes = (
      <>
        <circle cx="27.5" cy="21" r="2" fill="currentColor" />
        <circle cx="36.5" cy="21" r="2" fill="currentColor" />
        {status === "ahead" && (
          <>
            <path d="M24.5 17 l3 -1.5" {...stroke} />
            <path d="M39.5 17 l-3 -1.5" {...stroke} />
          </>
        )}
      </>
    );
  } else if (status === "warn") {
    eyes = (
      <>
        <path d="M25 21 h5" {...stroke} />
        <path d="M34 21 h5" {...stroke} />
      </>
    );
  } else {
    // alarm — müde, hängende Augen
    eyes = (
      <>
        <path d="M25 20 q2.5 3 5 0" {...stroke} />
        <path d="M34 20 q2.5 3 5 0" {...stroke} />
        <path d="M24 16 l4 1.5" {...stroke} />
        <path d="M40 16 l-4 1.5" {...stroke} />
      </>
    );
  }

  // Mund
  let mouth: React.ReactNode;
  if (status === "done") {
    mouth = <path d="M25 28 q7 8 14 0 q-7 3 -14 0 Z" fill="currentColor" />;
  } else if (status === "ahead") {
    mouth = <path d="M25 28 q7 6 14 0" {...stroke} />;
  } else if (status === "onpace") {
    mouth = <path d="M26 28 q6 4 12 0" {...stroke} />;
  } else if (status === "warn") {
    mouth = <path d="M27 30 h10" {...stroke} />;
  } else {
    mouth = <path d="M27 31 q5 -4 10 0" {...stroke} />;
  }

  return (
    <>
      {eyes}
      {mouth}
    </>
  );
}

function Accessory({ status }: { status: PaceStatus }) {
  if (status === "done") {
    return (
      <g fill="currentColor">
        <path d="M11 12 l1 2.5 l2.5 1 l-2.5 1 l-1 2.5 l-1 -2.5 l-2.5 -1 l2.5 -1 Z" />
        <path d="M52 9 l0.8 2 l2 0.8 l-2 0.8 l-0.8 2 l-0.8 -2 l-2 -0.8 l2 -0.8 Z" />
        <path d="M53 30 l0.7 1.7 l1.7 0.7 l-1.7 0.7 l-0.7 1.7 l-0.7 -1.7 l-1.7 -0.7 l1.7 -0.7 Z" />
      </g>
    );
  }
  if (status === "ahead") {
    return (
      <g
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.45}
      >
        <path d="M3 20 h9" />
        <path d="M2 30 h11" />
        <path d="M4 40 h8" />
      </g>
    );
  }
  if (status === "warn") {
    return (
      <path
        d="M45 12 q2.5 3.5 0 5 q-2.5 -1.5 0 -5 Z"
        fill="currentColor"
        opacity={0.55}
      />
    );
  }
  if (status === "alarm") {
    return (
      <g fill="currentColor" opacity={0.55}>
        <path d="M45 11 q2.5 3.5 0 5 q-2.5 -1.5 0 -5 Z" />
        <path d="M49 21 q2 3 0 4.2 q-2 -1.2 0 -4.2 Z" />
      </g>
    );
  }
  return null;
}

export default function PaceMascot({
  status,
  size = 58,
}: {
  status: PaceStatus;
  size?: number;
}) {
  const cfg = CFG[status];
  return (
    <span
      className="shrink-0 text-ink"
      style={{ display: "inline-block", width: size, height: size }}
      role="img"
      aria-label={`Maskottchen ${cfg.label}`}
    >
      <span
        style={{
          display: "inline-block",
          transform: `rotate(${cfg.lean}deg)`,
          transformOrigin: "50% 92%",
        }}
      >
        <span
          className={`mascot ${cfg.anim}`}
          style={{ display: "inline-block" }}
        >
          <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
            <Accessory status={status} />
            {/* Körper */}
            <path
              d="M19 55 L20 41 Q20 36 26 36 L38 36 Q44 36 44 41 L45 55 Z"
              fill="currentColor"
              opacity={0.12}
              stroke="currentColor"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {/* Krawatte */}
            <path
              d="M32 36 L29.5 40 L32 51 L34.5 40 Z"
              fill="currentColor"
            />
            {/* Aktenkoffer */}
            <rect
              x="43"
              y="44"
              width="12"
              height="9"
              rx="1.5"
              fill="currentColor"
              opacity={0.15}
              stroke="currentColor"
              strokeWidth={2}
            />
            <path
              d="M47 44 v-1.5 q0 -1 1 -1 h3 q1 0 1 1 V44"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
            />
            {/* Kopf */}
            <circle
              cx="32"
              cy="22"
              r="13"
              fill="currentColor"
              opacity={0.08}
              stroke="currentColor"
              strokeWidth={2}
            />
            <Face status={status} />
          </svg>
        </span>
      </span>
    </span>
  );
}
