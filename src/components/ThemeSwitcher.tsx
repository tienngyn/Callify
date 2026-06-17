"use client";

import { useState } from "react";
import { THEMES, ThemeId } from "@/lib/themes";

export default function ThemeSwitcher({
  theme,
  setTheme,
}: {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="icon-btn grid h-10 w-10 place-items-center"
        aria-label="Theme wechseln"
      >
        {/* Halb-gefüllter Kreis als Theme-Glyph */}
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <circle
            cx="9"
            cy="9"
            r="7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M9 1.5 A7.5 7.5 0 0 1 9 16.5 Z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Theme auswählen"
        >
          <button
            className="absolute inset-0 bg-black/30"
            aria-label="Schließen"
            onClick={() => setOpen(false)}
          />
          <div className="card animate-flash-in relative m-4 w-full max-w-md p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
                Theme
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="ghost px-3 py-1.5 text-sm font-medium text-muted"
              >
                Fertig
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((t) => {
                const active = t.id === theme;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left ${
                      active ? "card-2" : "card"
                    }`}
                    aria-pressed={active}
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                      style={{
                        background: t.swatch[0],
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                      }}
                      aria-hidden
                    >
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ background: t.swatch[1] }}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-ink">
                        {t.label}
                      </span>
                      <span className="block truncate text-xs text-faint">
                        {t.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
