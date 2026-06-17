"use client";

import { useState } from "react";
import { useCallTracker } from "@/hooks/useCallTracker";
import { useTheme } from "@/hooks/useTheme";
import { WEEKDAY_NAMES } from "@/lib/config";
import { formatMinutes } from "@/lib/date";
import ProgressRing from "@/components/ProgressRing";
import PaceBanner from "@/components/PaceBanner";
import MilestoneFlash from "@/components/MilestoneFlash";
import WeekView from "@/components/WeekView";
import MonthView from "@/components/MonthView";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import DaySummary from "@/components/DaySummary";

type View = "today" | "week" | "month";

const VIEW_LABELS: Record<View, string> = {
  today: "Heute",
  week: "Woche",
  month: "Monat",
};

export default function Home() {
  const t = useCallTracker();
  const { theme, setTheme } = useTheme();
  const [view, setView] = useState<View>("today");
  const [confirmReset, setConfirmReset] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  if (!t.hydrated) {
    return (
      <main className="flex h-dvh items-center justify-center">
        <div className="card-2 h-3 w-28 rounded-full" />
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col items-center overflow-hidden px-5 pb-6 pt-6">
      <MilestoneFlash milestone={t.milestone} onDismiss={t.dismissMilestone} />
      <DaySummary
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        session={t.session}
        goal={t.goal}
        stretch={t.stretchGoal}
        days={t.days}
        now={t.now}
      />

      <div className="flex min-h-0 w-full max-w-md flex-1 flex-col">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-ink">
              Callify
            </h1>
            <p className="text-sm text-muted">
              {WEEKDAY_NAMES[t.weekday]} · Ziel{" "}
              <span className="tnum font-semibold text-ink">{t.goal}</span>
              <span className="text-faint"> · Stretch {t.stretchGoal}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="chip tnum px-3.5 py-2 text-sm font-semibold text-muted">
              {formatMinutes(t.now.getHours() * 60 + t.now.getMinutes())}
            </span>
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
          </div>
        </header>

        {/* Ansicht-Umschalter */}
        <div className="seg mt-5 flex shrink-0 gap-1 p-1">
          {(["today", "week", "month"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                view === v ? "seg-active text-ink" : "text-muted"
              }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>

        {/* Inhalt */}
        {view === "today" ? (
          <>
            <section className="flex min-h-0 flex-1 flex-col items-center justify-center">
              <ProgressRing
                completed={t.completed}
                goal={t.goal}
                stretch={t.stretchGoal}
                bumped={t.justBumped}
              />
            </section>

            <section className="shrink-0">
              <PaceBanner pace={t.pace} />
            </section>

            {/* Aktionen */}
            <section className="shrink-0 pt-4">
              {/* Arbeitstag-Status */}
              <div className="mb-2 flex h-5 items-center justify-center">
                {t.workdayActive && t.session?.startedAt != null ? (
                  <span className="tnum text-xs font-medium text-faint">
                    ● Arbeitstag läuft seit {formatMinutes(t.session.startedAt)}
                  </span>
                ) : t.workdayEnded ? (
                  <button
                    onClick={() => setSummaryOpen(true)}
                    className="text-xs font-medium text-faint underline-offset-2 hover:underline"
                  >
                    Arbeitstag beendet · {t.completed} Calls · Übersicht ansehen
                  </button>
                ) : (
                  <span className="text-xs font-medium text-faint">
                    Arbeitstag noch nicht gestartet
                  </span>
                )}
              </div>

              <button
                onClick={t.addCompleted}
                className="cta flex w-full items-center justify-center gap-2 px-6 py-5 text-xl"
              >
                <span aria-hidden className="text-2xl leading-none">
                  ＋
                </span>
                Call abgeschlossen
              </button>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  onClick={t.undoCompleted}
                  disabled={t.completed === 0}
                  className="ghost px-4 py-2.5 text-sm font-semibold text-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ↩ Rückgängig
                </button>

                {t.workdayActive ? (
                  <button
                    onClick={() => {
                      t.endWorkday();
                      setSummaryOpen(true);
                    }}
                    className="ghost px-4 py-2.5 text-sm font-bold text-ink"
                  >
                    ■ Arbeitstag beenden
                  </button>
                ) : (
                  <button
                    onClick={t.startWorkday}
                    className="ghost px-4 py-2.5 text-sm font-bold text-ink"
                  >
                    ▶ Arbeitstag starten
                  </button>
                )}
              </div>

              {/* Tag zurücksetzen — dezent */}
              <div className="mt-1 flex h-6 items-center justify-center">
                {confirmReset ? (
                  <span className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        t.resetDay();
                        setConfirmReset(false);
                      }}
                      className="text-xs font-bold text-ink"
                    >
                      Wirklich zurücksetzen?
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="text-xs font-medium text-faint"
                    >
                      Abbrechen
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="text-xs font-medium text-faint hover:text-muted"
                  >
                    Tag zurücksetzen
                  </button>
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
            {view === "week" ? (
              <WeekView days={t.days} now={t.now} />
            ) : (
              <MonthView days={t.days} now={t.now} />
            )}
          </section>
        )}
      </div>
    </main>
  );
}
