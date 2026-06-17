import { Break, DayConfig } from "./config";

export type PaceStatus = "done" | "ahead" | "onpace" | "warn" | "alarm";

export type Pace = {
  /** Wie viele Calls man zu dieser Uhrzeit haben sollte (gerundet). */
  expected: number;
  /** completed - expected (positiv = vor Plan). */
  diff: number;
  status: PaceStatus;
  /** Hauptzeile fürs Banner. */
  headline: string;
  /** Erklärende Unterzeile. */
  detail: string;
  /** Liegt `now` gerade in einer Pause? */
  inBreak: boolean;
};

/** Arbeitsminuten zwischen `from` und `to`, abzüglich aller Pausen-Überlappungen. */
function workedMinutes(from: number, to: number, breaks: Break[]): number {
  let span = Math.max(0, to - from);
  for (const b of breaks) {
    const overlap = Math.max(0, Math.min(to, b.endMin) - Math.max(from, b.startMin));
    span -= overlap;
  }
  return Math.max(0, span);
}

export function isInBreak(nowMin: number, breaks: Break[]): boolean {
  return breaks.some((b) => nowMin >= b.startMin && nowMin < b.endMin);
}

/**
 * Anteil des Ziels über die effektive Arbeitszeit (ohne Pausen).
 * Vor Fensterbeginn 0, nach Fensterende = Ziel. Während einer Pause
 * bleibt der Wert flach, weil Pausenminuten nicht zählen.
 */
export function expectedCalls(nowMin: number, config: DayConfig): number {
  const { startMin, endMin } = config.window;
  const { breaks } = config;
  if (nowMin <= startMin) return 0;
  if (nowMin >= endMin) return config.goal;

  const total = workedMinutes(startMin, endMin, breaks);
  if (total <= 0) return config.goal;
  const elapsed = workedMinutes(startMin, nowMin, breaks);
  return (elapsed / total) * config.goal;
}

export function computePace(
  completed: number,
  nowMin: number,
  config: DayConfig
): Pace {
  const expected = Math.round(expectedCalls(nowMin, config));
  const diff = completed - expected;
  const inBreak = isInBreak(nowMin, config.breaks);
  const pauseNote = inBreak ? " · Pause" : "";

  if (completed >= config.goal) {
    return {
      expected,
      diff,
      inBreak,
      status: "done",
      headline: "Ziel erreicht",
      detail: "Alles weitere ist Bonus.",
    };
  }

  if (diff >= 1) {
    return {
      expected,
      diff,
      inBreak,
      status: "ahead",
      headline: `${diff} vor Plan`,
      detail: `Soll bis jetzt: ${expected}.${pauseNote}`,
    };
  }

  if (diff >= 0) {
    return {
      expected,
      diff,
      inBreak,
      status: "onpace",
      headline: "Auf Pace",
      detail: `Genau im Soll (${expected}).${pauseNote}`,
    };
  }

  const behind = -diff;
  if (behind <= 3) {
    return {
      expected,
      diff,
      inBreak,
      status: "warn",
      headline: `${behind} hinter Plan`,
      detail: `Soll bis jetzt: ${expected}. Gut machbar.${pauseNote}`,
    };
  }

  return {
    expected,
    diff,
    inBreak,
    status: "alarm",
    headline: `${behind} hinter Plan`,
    detail: `Soll bis jetzt: ${expected}. Jetzt dranbleiben.${pauseNote}`,
  };
}
