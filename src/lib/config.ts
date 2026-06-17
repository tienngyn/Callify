/**
 * Zentrale Konfiguration für Callify.
 *
 * Hier passt du Tagesziele und Arbeitszeitfenster an — alles andere
 * (Pace-Berechnung, Anzeige) leitet sich daraus ab.
 *
 * Wochentage: 0 = Sonntag, 1 = Montag, ... 6 = Samstag.
 */

export type WorkWindow = {
  /** Start in Minuten ab Mitternacht (z. B. 8 * 60 = 08:00). */
  startMin: number;
  /** Ende in Minuten ab Mitternacht (z. B. 16 * 60 + 30 = 16:30). */
  endMin: number;
};

/** Pause innerhalb des Arbeitsfensters (zählt nicht ins Soll). */
export type Break = {
  startMin: number;
  endMin: number;
};

export type DayConfig = {
  /** Echtes Tagesziel — danach gilt alles als Bonus. */
  goal: number;
  /** Stretch-Ziel zum Overperformen (sichtbar, aber kein „Muss"). */
  stretchGoal: number;
  /** Arbeitszeitfenster für die Pace-Berechnung. */
  window: WorkWindow;
  /** Pausen, in denen das Soll pausiert (z. B. Mittagspause). */
  breaks: Break[];
};

const hm = (h: number, m = 0) => h * 60 + m;

/** Standard-Mittagspause an langen Tagen (Mi/Do). Hier anpassbar. */
const LUNCH: Break = { startMin: hm(12, 0), endMin: hm(12, 30) };

/**
 * Ziel + Stretch + Arbeitsfenster pro Wochentag.
 * Mi (3) & Do (4): Ziel 35 (Stretch 40), 08:00–16:30, Mittagspause 12:00–12:30.
 * Fr (5): Ziel 20 (Stretch 25), 08:30–12:30 (Halbtag, keine Pause).
 */
export const DAY_CONFIGS: Record<number, DayConfig> = {
  3: { goal: 35, stretchGoal: 40, window: { startMin: hm(8, 0), endMin: hm(16, 30) }, breaks: [LUNCH] }, // Mittwoch
  4: { goal: 35, stretchGoal: 40, window: { startMin: hm(8, 0), endMin: hm(16, 30) }, breaks: [LUNCH] }, // Donnerstag
  5: { goal: 20, stretchGoal: 25, window: { startMin: hm(8, 30), endMin: hm(12, 30) }, breaks: [] }, // Freitag
};

/** Fallback für Tage ohne eigene Konfiguration (keine echten Arbeitstage). */
export const DEFAULT_DAY_CONFIG: DayConfig = {
  goal: 35,
  stretchGoal: 40,
  window: { startMin: hm(8, 0), endMin: hm(16, 30) },
  breaks: [LUNCH],
};

export function getDayConfig(weekday: number): DayConfig {
  return DAY_CONFIGS[weekday] ?? DEFAULT_DAY_CONFIG;
}

/** Deutsche Wochentagsnamen. */
export const WEEKDAY_NAMES = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
] as const;

/** Kurze Wochentagsnamen (für die Wochenansicht). */
export const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;

/** Ob für diesen Wochentag ein echtes Arbeitsziel konfiguriert ist. */
export function isWorkday(weekday: number): boolean {
  return weekday in DAY_CONFIGS;
}

/** Meilensteine als Anteil des Ziels mit Begleittext. */
export const MILESTONES: { fraction: number; label: string; message: string }[] = [
  { fraction: 0.25, label: "25 %", message: "Guter Start — ein Viertel steht." },
  { fraction: 0.5, label: "Halbzeit", message: "Die Hälfte ist geschafft." },
  { fraction: 0.75, label: "75 %", message: "Drei Viertel — Endspurt." },
  { fraction: 1, label: "Ziel geknackt", message: "Tagesziel erreicht. Alles weitere ist Bonus." },
];

export const STORAGE_KEY = "callify.state.v1";
