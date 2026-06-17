/** Lokaler Datums-Key im Format YYYY-MM-DD (für den Datumswechsel-Reset). */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Minuten seit Mitternacht (lokal). */
export function minutesOfDay(d: Date = new Date()): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** Minuten -> "HH:MM". */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Die sieben Tage (Mo–So) der Woche, in der `ref` liegt. */
export function weekDates(ref: Date = new Date()): Date[] {
  const base = new Date(ref);
  base.setHours(0, 0, 0, 0);
  const diffToMonday = (base.getDay() + 6) % 7; // Mo = 0
  const monday = new Date(base);
  monday.setDate(base.getDate() - diffToMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
