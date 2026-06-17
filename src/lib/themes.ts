export type ThemeId =
  | "neumorphism"
  | "classic"
  | "glass"
  | "brutalism"
  | "midnight"
  | "clay";

export type ThemeDef = {
  id: ThemeId;
  label: string;
  /** Kurzbeschreibung für den Theme-Picker. */
  hint: string;
  /** Zwei Farben für die Vorschau-Swatch im Picker. */
  swatch: [string, string];
};

export const THEMES: ThemeDef[] = [
  {
    id: "neumorphism",
    label: "Neumorphism",
    hint: "Weiche Schatten, monochrom",
    swatch: ["#e8e8e8", "#1d1d1d"],
  },
  {
    id: "classic",
    label: "Classic Light",
    hint: "Heller SaaS-Look",
    swatch: ["#f6f5f1", "#2f9e6f"],
  },
  {
    id: "glass",
    label: "Liquid Glass",
    hint: "Mattes Glas, Farbverlauf",
    swatch: ["#b8c6ff", "#6d28d9"],
  },
  {
    id: "brutalism",
    label: "Neo-Brutalism",
    hint: "Harte Kanten, knallig",
    swatch: ["#fef08a", "#111111"],
  },
  {
    id: "midnight",
    label: "Midnight",
    hint: "Dunkel, minimal, Glow",
    swatch: ["#0b0b0f", "#6366f1"],
  },
  {
    id: "clay",
    label: "Claymorphism",
    hint: "Knetig, pastellig",
    swatch: ["#e9e6ff", "#7c6cff"],
  },
];

export const DEFAULT_THEME: ThemeId = "neumorphism";
export const THEME_STORAGE_KEY = "callify.theme.v1";

export function isThemeId(v: unknown): v is ThemeId {
  return THEMES.some((t) => t.id === v);
}
