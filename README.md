# Callify — Call Tracker

Ein persönlicher Call-Tracker für den Outbound-B2B-Vertrieb. ADHD-freundlich:
ein Bildschirm, eine Zahl, ein Ziel. Nach jedem abgeschlossenen Call einmal
tippen und live sehen, ob du vor oder hinter Plan liegst.

Gebaut mit **Next.js (App Router) + React + TypeScript + Tailwind CSS v4**.
Kein Backend, keine Datenbank — der State lebt im Client und wird in
`localStorage` persistiert (überlebt Reload, setzt sich beim Datumswechsel
automatisch zurück).

## Starten

```bash
npm install
npm run dev
```

Dann <http://localhost:3000> öffnen. Mobile-first, läuft genauso sauber auf
Desktop.

```bash
npm run build && npm start   # Produktions-Build lokal testen
```

## Funktionen

- **Tagesziel nach Wochentag** — Mi/Do: 40 Calls, Fr: 25 Calls (andere Tage:
  Standard 40).
- **Ein-Tap-Zähler** — großer „Call abgeschlossen"-Button mit Bump-Animation,
  plus Rückgängig für Fehltipps.
- **Fortschrittsring** (der Hero) mit großer Zahl `X / Ziel`, der sich smooth
  füllt; Pace-Status wird über die Banner-Tiefe (erhaben/eingelassen) statt über
  ein Icon signalisiert.
- **Live-Pace-Banner** — rechnet aus dem Arbeitszeitfenster, wie viele Calls du
  zu dieser Uhrzeit haben solltest: „vor Plan / auf Pace / hinter Plan / Ziel
  erreicht".
- **Wochenansicht** — Umschalter „Heute / Woche" zeigt Mo–So der laufenden Woche
  mit Calls pro Tag, Balken und Wochensumme. So siehst du, wie viel du z. B.
  gestern gemacht hast.
- **6 Themes** — Neumorphism, Classic Light, Liquid Glass, Neo-Brutalism,
  Midnight und Claymorphism. Auswahl über das Theme-Icon oben rechts, wird in
  `localStorage` gemerkt.
- **Meilensteine** bei 25/50/75/100 % mit kurzem Erfolgs-Flash und (wo
  verfügbar) dezentem haptischem Feedback.
- **Persistenz & Reset** — Verlauf je Kalendertag in `localStorage`,
  automatischer Reset bei neuem Tag, manueller „Tag zurücksetzen"-Button.
- **Nicht scrollbar** — alles passt in eine Viewport-Höhe. Respektiert
  `prefers-reduced-motion`, sichtbarer Tastatur-Fokus, sauberer Touch.

## Ziele & Arbeitszeiten anpassen

Alle Konstanten liegen in **`src/lib/config.ts`**:

- `DAY_CONFIGS` — Ziel + Arbeitszeitfenster pro Wochentag (0 = Sonntag …
  6 = Samstag). Zeiten in Minuten ab Mitternacht (Helper `hm(stunde, minute)`).
- `DEFAULT_DAY_CONFIG` — Fallback für Tage ohne eigene Konfiguration.
- `MILESTONES` — Schwellen und Texte für die Meilenstein-Flashes.

Beispiel — Donnerstag auf 45 Calls und Fenster 08:30–17:00 setzen:

```ts
4: { goal: 45, window: { startMin: hm(8, 30), endMin: hm(17, 0) } },
```

Die Pace-Logik (`src/lib/pace.ts`) leitet das erwartete Soll linear aus dem
Fenster ab — sie zieht ihre Werte automatisch aus `config.ts`.

## Auf Vercel deployen

1. Repo zu GitHub pushen.
2. Auf [vercel.com](https://vercel.com) „New Project" → Repo importieren.
3. Vercel erkennt Next.js automatisch — keine Env-Variablen, kein Build-Setup
   nötig. „Deploy" klicken, fertig.

## Projektstruktur

```
src/
  app/
    layout.tsx        Fonts, Metadaten, Theme-Init-Script (kein Flash)
    page.tsx          Hauptbildschirm (Heute/Woche, nicht scrollbar)
    globals.css       Tailwind v4 + alle 6 Theme-Skins
  components/
    ProgressRing.tsx  Fortschrittsring + große Zahl (Hero)
    PaceBanner.tsx    Live-Pace-Status
    WeekView.tsx      Wochenansicht mit Tagesbalken
    ThemeSwitcher.tsx Theme-Picker (Overlay)
    MilestoneFlash.tsx Meilenstein-Toast
  hooks/
    useCallTracker.ts State, localStorage-Verlauf, Live-Uhr, Meilensteine
    useTheme.ts       Theme-State + Persistenz
  lib/
    config.ts         >>> Ziele & Arbeitszeiten hier anpassen <<<
    pace.ts           Pace-Berechnung
    status.ts         Pace-Status -> Banner-Tiefe
    themes.ts         Theme-Liste + Metadaten
    date.ts           Datums-/Zeit-Helper (inkl. Wochenberechnung)
```

## Themes anpassen

Die Theme-Liste steht in **`src/lib/themes.ts`**, die zugehörigen Stile als
`[data-theme="…"]`-Blöcke in **`src/app/globals.css`**. Jedes Theme überschreibt
dieselben CSS-Variablen (`--color-ink`, `--ring-fill`, `--app-bg`, …) und die
Skin-Klassen (`.card`, `.cta`, `.icon-btn`, …). Ein neues Theme = ein Eintrag in
`THEMES` plus ein `[data-theme="…"]`-Block.

## Bewusst nicht enthalten

Keine Datenbank, kein Login, kein Multi-User, keine CRM-Integration — ein reiner,
schneller manueller Tracker. Der Verlauf lebt rein lokal im Browser.
