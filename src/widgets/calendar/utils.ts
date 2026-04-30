import type { CalendarEvent, ColumnedEvent, LanedEvent } from "./types";

export const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const startOfWeek = (d: Date): Date => {
  const x = startOfDay(d);
  const dow = (x.getDay() + 6) % 7; // понедельник = 0
  x.setDate(x.getDate() - dow);
  return x;
};

export const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const fmtTime = (d: Date): string => `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;

export const dayDiff = (a: Date, b: Date): number =>
  Math.floor((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000);

export const isMultiDay = (e: CalendarEvent): boolean => !!e.allDay || !sameDay(e.start, e.end);

export const eventsForDay = (events: CalendarEvent[], day: Date): CalendarEvent[] => {
  const ds = startOfDay(day);
  const de = addDays(ds, 1);
  return events.filter((e) => e.start < de && e.end > ds);
};

/**
 * Распределяет многодневные события по горизонтальным «дорожкам»,
 * чтобы пересекающиеся события не накладывались друг на друга.
 */
export const packLanes = (evts: CalendarEvent[]): { events: LanedEvent[]; n: number } => {
  const sorted = [...evts].sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());
  const lanes: LanedEvent[][] = [];
  const result: LanedEvent[] = [];

  for (const e of sorted) {
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      const conflict = lanes[i].some(
        (o) => Math.max(o.start.getTime(), e.start.getTime()) < Math.min(o.end.getTime(), e.end.getTime()),
      );
      if (!conflict) {
        const laned: LanedEvent = { ...e, _lane: i };
        lanes[i].push(laned);
        result.push(laned);
        placed = true;
        break;
      }
    }
    if (!placed) {
      const laned: LanedEvent = { ...e, _lane: lanes.length };
      lanes.push([laned]);
      result.push(laned);
    }
  }

  return { events: result, n: lanes.length };
};

/**
 * Распределяет однодневные события по вертикальным колонкам в дневном/недельном
 * виде, чтобы пересекающиеся по времени события рендерились рядом.
 */
export const packCols = (evts: CalendarEvent[]): ColumnedEvent[] => {
  const arr = [...evts].sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());
  const cols: ColumnedEvent[][] = [];
  const result: ColumnedEvent[] = [];

  for (const e of arr) {
    let placed = false;
    for (let i = 0; i < cols.length; i++) {
      const last = cols[i][cols[i].length - 1];
      if (last.end.getTime() <= e.start.getTime()) {
        const col: ColumnedEvent = { ...e, _col: i, _totalCols: 0 };
        cols[i].push(col);
        result.push(col);
        placed = true;
        break;
      }
    }
    if (!placed) {
      const col: ColumnedEvent = { ...e, _col: cols.length, _totalCols: 0 };
      cols.push([col]);
      result.push(col);
    }
  }

  // Проставляем итоговое число колонок для всех событий
  for (const e of result) e._totalCols = cols.length;
  return result;
};

/** Форматирование даты для <input type="datetime-local"> */
export const fmtDateTimeLocal = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
