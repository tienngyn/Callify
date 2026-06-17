import { PaceStatus } from "./pace";

export type StatusMeta = {
  /** Monochromes Glyph, das den Status ohne Farbe signalisiert. */
  symbol: string;
  /** Tiefe des Pace-Banners: vor/auf Plan ruht erhaben, hinter Plan eingelassen. */
  depth: "raised" | "inset";
};

/**
 * Im Schwarz-Weiß-Design tragen Symbol + Tiefe (raised/inset) die
 * Status-Bedeutung — nicht die Farbe.
 */
export function statusMeta(status: PaceStatus): StatusMeta {
  switch (status) {
    case "done":
      return { symbol: "✓", depth: "raised" };
    case "ahead":
      return { symbol: "▲", depth: "raised" };
    case "onpace":
      return { symbol: "●", depth: "raised" };
    case "warn":
      return { symbol: "▼", depth: "inset" };
    case "alarm":
      return { symbol: "▼▼", depth: "inset" };
  }
}
