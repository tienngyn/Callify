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
