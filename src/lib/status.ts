import { PaceStatus } from "./pace";

/**
 * Tiefe des Pace-Banners: vor/auf Plan ruht erhaben, hinter Plan eingelassen.
 * Trägt den Status in den Tiefen-Themes ganz ohne Icon oder Farbe.
 */
export function paceDepth(status: PaceStatus): "raised" | "inset" {
  return status === "warn" || status === "alarm" ? "inset" : "raised";
}
