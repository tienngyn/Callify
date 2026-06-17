import { PaceStatus } from "./pace";

export type StatusColors = {
  /** Kräftige Statusfarbe (Ring, Text, Akzent). */
  main: string;
  /** Sehr helle Variante (Banner-Hintergrund, Chips). */
  soft: string;
};

/** Mappt einen Pace-Status auf die CSS-Variablen aus globals.css. */
export function statusColors(status: PaceStatus): StatusColors {
  switch (status) {
    case "done":
      return { main: "var(--color-done)", soft: "var(--color-done-soft)" };
    case "ahead":
      return { main: "var(--color-ahead)", soft: "var(--color-ahead-soft)" };
    case "onpace":
      return { main: "var(--color-onpace)", soft: "var(--color-onpace-soft)" };
    case "warn":
      return { main: "var(--color-warn)", soft: "var(--color-warn-soft)" };
    case "alarm":
      return { main: "var(--color-alarm)", soft: "var(--color-alarm-soft)" };
  }
}
