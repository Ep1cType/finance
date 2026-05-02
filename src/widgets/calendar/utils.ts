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
 * Бейдж «+N» для зоны переполнения. Появляется когда у кластера колонок
 * больше, чем `maxCols`: события из «лишних» колонок не отрисовываются
 * как карточки, вместо них в последней видимой колонке показывается бейдж
 * со счётчиком и временным диапазоном скрытых событий.
 */
export interface OverflowBadge {
  /** Уникальный ID для React key */
  id: string;
  /** Колонка, в которой показывается бейдж (всегда `clusterCols - 1`) */
  col: number;
  /** Видимое число колонок кластера (= maxCols) */
  clusterCols: number;
  /** Временной диапазон сегмента переполнения */
  start: Date;
  end: Date;
  /** Сколько событий скрыто в этом сегменте */
  count: number;
  /** ID скрытых событий — пригодятся, если нужно отфильтровать список */
  hiddenIds: string[];
}

export interface PackEventsResult {
  events: PackedEvent[];
  overflows: OverflowBadge[];
}

/**
 * Layout пересекающихся событий по образцу Google Calendar / FullCalendar,
 * с двухслойным рендером для длинных событий-«контейнеров».
 *
 * 1. **Кластеризация.** События объединяются в кластер, если связаны цепочкой
 *    пересечений (A ↔ B, B ↔ C → A, B, C в одном кластере).
 *
 * 2. **Выделение background-слоя.** Внутри кластера итеративно ищем
 *    «контейнерные» события — те, что полностью покрывают по времени хотя бы
 *    одно другое событие кластера. Выбираем самое длинное, переносим в
 *    background-слой и пересчитываем. Если несколько контейнеров не
 *    пересекаются между собой — в background попадают оба (например, два
 *    непересекающихся «Дежурства» по полдня каждое). Background-события
 *    рендерятся на полную ширину дня.
 *
 * 3. **Foreground column packing.** Оставшиеся события упаковываются в колонки
 *    жадно: каждое — в первую свободную колонку, без конфликтов.
 *
 * 4. **Расширение span.** Каждое foreground-событие пытается расшириться
 *    вправо до ближайшего конфликта. Это даёт одиночным событиям полную
 *    ширину foreground-слоя, даже если в кластере несколько колонок.
 *
 * Если задан `options.maxCols` и foreground-кластеру нужно больше колонок —
 * последние сворачиваются в `OverflowBadge` («+N»).
 */
export const packEvents = (evts: CalendarEvent[], options?: { maxCols?: number }): PackEventsResult => {
  if (evts.length === 0) return { events: [], overflows: [] };

  const maxCols = options?.maxCols ?? Infinity;

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

  const result: PackedEvent[] = [];
  const overflows: OverflowBadge[] = [];

  for (const cluster of clusters) {
    // ── 2. Выделение background-слоя ────────────────────────────────
    // «Длинное» событие — то, чья длительность составляет хотя бы
    // BACKGROUND_RATIO от общей длины кластера. Из длинных жадно отбираем
    // непересекающиеся (по убыванию длины) — они станут background.
    //
    // Это даёт нужное поведение для двух типичных случаев:
    //  - одно событие на весь день + мелкие → событие в фон
    //  - два «дежурства» по полдня + мелкая встреча между ними → оба в фон
    //
    // Одиночное длинное событие в собственном кластере (без других) останется
    // foreground — у него и так будет 100% ширины через _span расширение.
    const BACKGROUND_RATIO = 0.5;

    const clusterStart = Math.min(...cluster.map((e) => e.start.getTime()));
    const clusterEnd = Math.max(...cluster.map((e) => e.end.getTime()));
    const clusterDuration = clusterEnd - clusterStart;
    const minBgDuration = clusterDuration * BACKGROUND_RATIO;

    const longCandidates =
      cluster.length > 1
        ? cluster
            .filter((e) => e.end.getTime() - e.start.getTime() >= minBgDuration)
            .sort((a, b) => b.end.getTime() - b.start.getTime() - (a.end.getTime() - a.start.getTime()))
        : [];

    const background: CalendarEvent[] = [];
    for (const candidate of longCandidates) {
      // Берём, если не пересекается ни с одним уже выбранным background
      const conflicts = background.some(
        (b) =>
          Math.max(b.start.getTime(), candidate.start.getTime()) < Math.min(b.end.getTime(), candidate.end.getTime()),
      );
      if (!conflicts) background.push(candidate);
    }

    const remaining = cluster.filter((e) => !background.includes(e));

    // Background события идут на полную ширину
    for (const e of background) {
      result.push({
        ...e,
        _col: 0,
        _span: 1,
        _clusterCols: 1,
        _layer: "background",
      });
    }

    // ── 3. Foreground column packing ────────────────────────────────
    if (remaining.length === 0) continue;

    const cols: CalendarEvent[][] = [];
    const colOf = new Map<string, number>();

    for (const e of remaining) {
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

    const naturalCols = cols.length;
    const isOverflow = naturalCols > maxCols;
    const visibleCols = isOverflow ? maxCols : naturalCols;
    const overflowColIndex = visibleCols - 1;

    const hiddenEvents: CalendarEvent[] = [];

    // ── 4. Расширение span + сбор overflow ─────────────────────────
    for (const e of remaining) {
      const myCol = colOf.get(e.id)!;
      if (isOverflow && myCol >= overflowColIndex) {
        hiddenEvents.push(e);
        continue;
      }

      const spanLimit = isOverflow ? overflowColIndex : naturalCols;
      let span = 1;
      for (let next = myCol + 1; next < spanLimit; next++) {
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
        _clusterCols: visibleCols,
        _layer: "foreground",
      });
    }

    // ── Группировка скрытых событий в overflow-бейджи ──────────────
    if (hiddenEvents.length > 0) {
      const sortedHidden = [...hiddenEvents].sort((a, b) => a.start.getTime() - b.start.getTime());
      let segStart = sortedHidden[0].start;
      let segEnd = sortedHidden[0].end;
      let segIds: string[] = [sortedHidden[0].id];

      const flush = () => {
        overflows.push({
          id: `ovf-${segIds[0]}-${segIds.length}`,
          col: overflowColIndex,
          clusterCols: visibleCols,
          start: segStart,
          end: segEnd,
          count: segIds.length,
          hiddenIds: segIds,
        });
      };

      for (let i = 1; i < sortedHidden.length; i++) {
        const e = sortedHidden[i];
        if (e.start.getTime() < segEnd.getTime()) {
          segIds.push(e.id);
          if (e.end.getTime() > segEnd.getTime()) segEnd = e.end;
        } else {
          flush();
          segStart = e.start;
          segEnd = e.end;
          segIds = [e.id];
        }
      }
      flush();
    }
  }

  return { events: result, overflows };
};

/** Форматирование даты для <input type="datetime-local"> */
export const fmtDateTimeLocal = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
