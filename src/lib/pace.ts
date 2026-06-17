import { DayConfig } from "./config";

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
};

/**
 * Linearer Anteil des Ziels über das Arbeitszeitfenster.
 * Vor Fensterbeginn 0, nach Fensterende = Ziel.
 */
export function expectedCalls(
  nowMin: number,
  config: DayConfig
): number {
  const { startMin, endMin } = config.window;
  if (nowMin <= startMin) return 0;
  if (nowMin >= endMin) return config.goal;
  const fraction = (nowMin - startMin) / (endMin - startMin);
  return fraction * config.goal;
}

export function computePace(
  completed: number,
  nowMin: number,
  config: DayConfig
): Pace {
  const expectedRaw = expectedCalls(nowMin, config);
  const expected = Math.round(expectedRaw);
  const diff = completed - expected;

  if (completed >= config.goal) {
    return {
      expected,
      diff,
      status: "done",
      headline: "Ziel erreicht",
      detail: "Alles weitere ist Bonus.",
    };
  }

  if (diff >= 1) {
    return {
      expected,
      diff,
      status: "ahead",
      headline: `${diff} vor Plan`,
      detail: `Soll bis jetzt: ${expected}.`,
    };
  }

  if (diff >= 0) {
    return {
      expected,
      diff,
      status: "onpace",
      headline: "Auf Pace",
      detail: `Genau im Soll (${expected}).`,
    };
  }

  const behind = -diff;
  if (behind <= 3) {
    return {
      expected,
      diff,
      status: "warn",
      headline: `${behind} hinter Plan`,
      detail: `Soll bis jetzt: ${expected}. Gut machbar.`,
    };
  }

  return {
    expected,
    diff,
    status: "alarm",
    headline: `${behind} hinter Plan`,
    detail: `Soll bis jetzt: ${expected}. Jetzt dranbleiben.`,
  };
}
