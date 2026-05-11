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

/**
 * Автоматическое определение «событие на весь день»: start и end попадают на
 * полночь (00:00:00), и end либо равен start, либо ровно начало следующего дня
 * (как exclusive end по соглашению ICS/RFC5545).
 *
 * Это позволяет автору данных просто указать `start = end = D(YYYY, M, D)`
 * без явного `allDay: true` — и событие автоматически уйдёт в all-day полосу.
 */
export const isAutoAllDay = (e: CalendarEvent): boolean => {
  const sIsMidnight =
    e.start.getHours() === 0 &&
    e.start.getMinutes() === 0 &&
    e.start.getSeconds() === 0 &&
    e.start.getMilliseconds() === 0;
  const eIsMidnight =
    e.end.getHours() === 0 && e.end.getMinutes() === 0 && e.end.getSeconds() === 0 && e.end.getMilliseconds() === 0;
  if (!sIsMidnight || !eIsMidnight) return false;
  // start === end (одна точка во времени) или end = следующий день
  const diff = e.end.getTime() - e.start.getTime();
  return diff === 0 || diff === 86_400_000;
};

export const isMultiDay = (e: CalendarEvent): boolean => !!e.allDay || isAutoAllDay(e) || !sameDay(e.start, e.end);

export const eventsForDay = (events: CalendarEvent[], day: Date): CalendarEvent[] => {
  const ds = startOfDay(day);
  const de = addDays(ds, 1);
  return events.filter((e) => {
    // Auto-allDay (одинаковые даты без времени) попадают в день, если start
    // равен этому дню — у них end === start, поэтому общее условие пересечения
    // `end > ds` не сработает.
    if (isAutoAllDay(e)) return sameDay(e.start, day);
    return e.start < de && e.end > ds;
  });
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
 * Layout пересекающихся событий через единую right-aligned cascade модель.
 *
 * 1. **Кластеризация.** События объединяются в кластер по цепочке пересечений
 *    (A ↔ B, B ↔ C → все трое в одном кластере).
 *
 * 2. **Cascade расчёт.** Для каждого события считаем:
 *    - `K` (overlap) — макс. число одновременно пересекающихся событий в его
 *      интервале (sweep по точкам стартов);
 *    - `cascadeIndex` — ранг события среди тех, кто формирует пик K. Сортировка:
 *      сначала по убыванию длины (самое длинное → cascadeIndex 0, «база» 100%),
 *      при равной длине — по позиции в исходном массиве `events`.
 *
 *    Это даёт единое поведение: самое длинное событие в peer-set всегда
 *    становится «базой» и занимает 100%, остальные каскадно сжимаются справа.
 *    Никакого специального background/foreground слоя — одна формула.
 *
 * 3. **Overflow.** Если K > maxCols, последний видимый cascade-слот отдаётся
 *    под `OverflowBadge` («+N»). События с cascadeIndex ≥ maxCols-1 → overflow.
 */
export const packEvents = (evts: CalendarEvent[], options?: { maxCols?: number }): PackEventsResult => {
  if (evts.length === 0) return { events: [], overflows: [] };

  const maxCols = options?.maxCols ?? Infinity;

  // Сортировка для кластеризации: по началу, при равенстве — длиннее раньше.
  const sortedForClustering = [...evts].sort(
    (a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime(),
  );

  // ── 1. Кластеризация ────────────────────────────────────────────
  const clusters: CalendarEvent[][] = [];
  let current: CalendarEvent[] = [];
  let currentEnd = 0;
  for (const e of sortedForClustering) {
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

  // Позиция события в исходном массиве — используется для тай-брейка
  // при равной длине событий в одном peer-set.
  const indexInOriginal = new Map<string, number>();
  evts.forEach((e, i) => indexInOriginal.set(e.id, i));

  const lenOf = (e: CalendarEvent) => e.end.getTime() - e.start.getTime();

  // Компаратор для cascade-сортировки: сначала длинные (становятся базой),
  // при равной длине — раньше добавленные в массив.
  const cascadeCompare = (a: CalendarEvent, b: CalendarEvent) => {
    const lenDiff = lenOf(b) - lenOf(a);
    if (lenDiff !== 0) return lenDiff;
    return (indexInOriginal.get(a.id) ?? 0) - (indexInOriginal.get(b.id) ?? 0);
  };

  for (const cluster of clusters) {
    // ── 2. Cascade расчёт через interval coloring ──────────────────
    // Идём по событиям в порядке cascadeCompare (длинные → база) и каждому
    // присваиваем минимальный cascadeIndex такой, чтобы он не совпадал с
    // уже размещёнными событиями, с которыми текущее пересекается. Это
    // классический greedy interval graph coloring — гарантирует, что
    // пересекающиеся события всегда получат разные cascadeIndex.
    const sortedForCascade = [...cluster].sort(cascadeCompare);
    const cascadeIndexOf = new Map<string, number>();
    const placed: Array<{ id: string; e: CalendarEvent; idx: number }> = [];

    for (const e of sortedForCascade) {
      // Какие уже размещённые события пересекаются с e?
      const conflictingIdxs = new Set<number>();
      for (const p of placed) {
        const overlaps =
          Math.max(p.e.start.getTime(), e.start.getTime()) < Math.min(p.e.end.getTime(), e.end.getTime());
        if (overlaps) conflictingIdxs.add(p.idx);
      }
      // Минимальный свободный cascadeIndex
      let idx = 0;
      while (conflictingIdxs.has(idx)) idx++;

      cascadeIndexOf.set(e.id, idx);
      placed.push({ id: e.id, e, idx });
    }

    // K для каждого события — макс. одновременных пересечений с ним
    // (включая его самого) в любой точке его интервала. Это нужно для
    // расчёта ширины: при K=3 пропорции 1/3, 1/3, 1/3.
    const overlapOf = new Map<string, number>();
    for (const e of cluster) {
      // Точки для проверки: start самого e и все starts других событий,
      // попадающих в [e.start, e.end). Между ними overlap не меняется.
      const points: number[] = [e.start.getTime()];
      for (const o of cluster) {
        const t = o.start.getTime();
        if (t > e.start.getTime() && t < e.end.getTime()) points.push(t);
      }

      let bestK = 0;
      for (const t of points) {
        const k = cluster.filter((o) => o.start.getTime() <= t && t < o.end.getTime()).length;
        if (k > bestK) bestK = k;
      }
      overlapOf.set(e.id, bestK);
    }

    // ── 3. Применение + overflow ───────────────────────────────────
    const hiddenEvents: CalendarEvent[] = [];

    for (const e of cluster) {
      const cascadeIndex = cascadeIndexOf.get(e.id) ?? 0;
      const k = overlapOf.get(e.id) ?? 1;

      // Когда K больше maxCols, последний видимый слот отдан бейджу. Скрываем
      // события с cascadeIndex ≥ maxCols-1 (на месте maxCols-1 будет бейдж).
      // Когда K ≤ maxCols — все события показываются.
      const willHaveBadge = k > maxCols;
      const hideThreshold = willHaveBadge ? maxCols - 1 : maxCols;

      if (cascadeIndex >= hideThreshold) {
        hiddenEvents.push(e);
        continue;
      }

      // Урезаем K до maxCols, чтобы каскад поместился в видимую зону.
      const effectiveK = Math.min(k, maxCols);

      result.push({
        ...e,
        _cascadeIndex: cascadeIndex,
        _cascadeTotal: effectiveK,
      });
    }

    // ── Группировка скрытых в overflow-бейджи ──────────────────────
    if (hiddenEvents.length > 0) {
      const sortedHidden = [...hiddenEvents].sort((a, b) => a.start.getTime() - b.start.getTime());
      let segStart = sortedHidden[0].start;
      let segEnd = sortedHidden[0].end;
      let segIds: string[] = [sortedHidden[0].id];

      const flush = () => {
        overflows.push({
          id: `ovf-${segIds[0]}-${segIds.length}`,
          col: maxCols - 1,
          clusterCols: maxCols,
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
