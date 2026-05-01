import type { CalendarEvent, LanedEvent, PackedEvent } from "./types";

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
 * Layout пересекающихся событий по образцу Google Calendar / FullCalendar.
 *
 * 1. Кластеризация: события объединяются в кластер, если связаны цепочкой
 *    пересечений (A пересекается с B, B с C → A, B, C в одном кластере).
 * 2. Column packing внутри кластера: каждое событие в первую свободную колонку.
 * 3. Расширение (span): после размещения каждое событие пытается расшириться
 *    в правые колонки, пока там нет пересекающихся с ним событий. Это даёт
 *    одиночному событию шанс занять всю ширину, даже если рядом по времени
 *    есть кластер с большим числом колонок.
 */
export const packEvents = (evts: CalendarEvent[]): PackedEvent[] => {
  if (evts.length === 0) return [];

  // Сортировка: по началу, при равенстве — длиннее раньше
  const sorted = [...evts].sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());

  // ── 1. Кластеризация ────────────────────────────────────────────
  const clusters: CalendarEvent[][] = [];
  let current: CalendarEvent[] = [];
  let currentEnd = 0;
  for (const e of sorted) {
    if (current.length === 0 || e.start.getTime() < currentEnd) {
      current.push(e);
      currentEnd = Math.max(currentEnd, e.end.getTime());
    } else {
      clusters.push(current);
      current = [e];
      currentEnd = e.end.getTime();
    }
  }
  if (current.length) clusters.push(current);

  // ── 2 + 3. Column packing и расширение для каждого кластера ─────
  const result: PackedEvent[] = [];
  for (const cluster of clusters) {
    const cols: CalendarEvent[][] = [];
    const colOf = new Map<string, number>();

    for (const e of cluster) {
      let placed = false;
      for (let i = 0; i < cols.length; i++) {
        const last = cols[i][cols[i].length - 1];
        if (last.end.getTime() <= e.start.getTime()) {
          cols[i].push(e);
          colOf.set(e.id, i);
          placed = true;
          break;
        }
      }
      if (!placed) {
        cols.push([e]);
        colOf.set(e.id, cols.length - 1);
      }
    }

    const totalCols = cols.length;

    for (const e of cluster) {
      const myCol = colOf.get(e.id)!;
      let span = 1;
      // Расширяем вправо пока нет пересечений
      for (let next = myCol + 1; next < totalCols; next++) {
        const conflict = cols[next].some(
          (o) => Math.max(o.start.getTime(), e.start.getTime()) < Math.min(o.end.getTime(), e.end.getTime()),
        );
        if (conflict) break;
        span++;
      }
      result.push({
        ...e,
        _col: myCol,
        _span: span,
        _clusterCols: totalCols,
      });
    }
  }

  return result;
};

/** Форматирование даты для <input type="datetime-local"> */
export const fmtDateTimeLocal = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
