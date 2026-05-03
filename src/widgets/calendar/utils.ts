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
 * Layout пересекающихся событий через right-aligned cascade модель.
 *
 * 1. **Кластеризация.** События объединяются в кластер, если связаны цепочкой
 *    пересечений (A ↔ B, B ↔ C → A, B, C в одном кластере).
 *
 * 2. **Выделение background-слоя.** Внутри кластера ищем «контейнерные»
 *    события — те, что значительно длиннее остальных. Они рендерятся на
 *    100% ширины, низким z-index. Каскад foreground идёт поверх.
 *
 * 3. **Cascade расчёт.** Для каждого foreground-события считается K — макс.
 *    число одновременно пересекающихся foreground-событий в его собственном
 *    интервале (sweep line). Видимая ширина i-й карточки = `(K - i) / K *
 *    availableWidth`. Все карточки упираются в правый край колонки.
 *
 *    Порядок: события сортируются по позиции в массиве (стабильно). Раньше
 *    добавленные → леверее → шире. При переупорядочивании массива (drag &
 *    drop, изменение времени) layout автоматически пересчитывается.
 *
 * 4. **Overflow.** Если K > maxCols, события с cascade-индексом ≥ maxCols
 *    группируются по непрерывным временным сегментам и заменяются на
 *    `OverflowBadge` («+N»).
 */
export const packEvents = (evts: CalendarEvent[], options?: { maxCols?: number }): PackEventsResult => {
  if (evts.length === 0) return { events: [], overflows: [] };

  const maxCols = options?.maxCols ?? Infinity;

  // Сортировка для кластеризации: по началу, при равенстве — длиннее раньше.
  // (Для каскада потом будет использоваться исходный порядок массива.)
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

  for (const cluster of clusters) {
    // ── 2. Выделение background-слоя ────────────────────────────────
    // Событие → background, если хотя бы одно:
    //  (a) полностью покрывает другое событие кластера И само ≥ 2× длиннее
    //      покрываемого;
    //  (b) длина ≥ BACKGROUND_RATIO × длины кластера И в кластере есть
    //      событие хотя бы в 2 раза короче.
    const BACKGROUND_RATIO = 0.5;
    const CONTAINER_RATIO = 2;

    const clusterStart = Math.min(...cluster.map((e) => e.start.getTime()));
    const clusterEnd = Math.max(...cluster.map((e) => e.end.getTime()));
    const clusterDuration = clusterEnd - clusterStart;
    const minBgDuration = clusterDuration * BACKGROUND_RATIO;

    const lenOf = (e: CalendarEvent) => e.end.getTime() - e.start.getTime();

    const isContainer = (e: CalendarEvent) =>
      cluster.some(
        (o) =>
          o.id !== e.id &&
          o.start.getTime() >= e.start.getTime() &&
          o.end.getTime() <= e.end.getTime() &&
          lenOf(e) >= lenOf(o) * CONTAINER_RATIO,
      );

    const longCandidates =
      cluster.length > 1
        ? cluster
            .filter((e) => {
              const len = lenOf(e);
              if (isContainer(e)) return true;
              if (len < minBgDuration) return false;
              const shortThreshold = len * BACKGROUND_RATIO;
              return cluster.some((o) => o.id !== e.id && lenOf(o) < shortThreshold);
            })
            .sort((a, b) => lenOf(b) - lenOf(a))
        : [];

    const background: CalendarEvent[] = [];
    for (const candidate of longCandidates) {
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
        _cascadeIndex: 0,
        _cascadeTotal: 1,
        _overBackground: false,
        _layer: "background",
      });
    }

    // ── 3. Cascade layout для foreground ───────────────────────────
    if (remaining.length === 0) continue;

    // Сохраняем позицию каждого события в исходном массиве `evts` —
    // это и есть порядок каскада.
    const indexInOriginal = new Map<string, number>();
    evts.forEach((e, i) => indexInOriginal.set(e.id, i));

    const overlaps = (a: CalendarEvent, b: CalendarEvent) =>
      Math.max(a.start.getTime(), b.start.getTime()) < Math.min(a.end.getTime(), b.end.getTime());

    // Для каждого события считаем:
    //  - K (overlap): максимум одновременно пересекающихся foreground-событий
    //    в любой точке его интервала (sweep по точкам стартов).
    //  - cascadeIndex: его ранг среди тех событий, которые с ним реально
    //    пересекаются И при этом тоже находятся в своём максимуме перекрытий
    //    в общей точке. Проще: в какой-то точке t события e и o оба активны,
    //    и в этой точке overlap = K(e). Тогда они «соседи по cascade» и
    //    индекс e = ранг по indexInOriginal среди таких событий.
    //
    // Для одиночного события (K=1) cascadeIndex = 0 → left = 0% (или base
    // если over bg) и width = 100%.
    const cascadeIndexOf = new Map<string, number>();
    const overlapOf = new Map<string, number>();

    for (const e of remaining) {
      // Точки для проверки: start самого e и все starts других событий,
      // попадающих в [e.start, e.end). Между этими точками overlap не меняется.
      const points: number[] = [e.start.getTime()];
      for (const o of remaining) {
        const t = o.start.getTime();
        if (t > e.start.getTime() && t < e.end.getTime()) points.push(t);
      }

      let bestK = 0;
      let bestPeers: CalendarEvent[] = [];
      for (const t of points) {
        const peers = remaining.filter((o) => o.start.getTime() <= t && t < o.end.getTime());
        if (peers.length > bestK) {
          bestK = peers.length;
          bestPeers = peers;
        }
      }

      overlapOf.set(e.id, bestK);
      // Ранг e среди bestPeers по позиции в исходном массиве
      const sortedPeers = [...bestPeers].sort(
        (a, b) => (indexInOriginal.get(a.id) ?? 0) - (indexInOriginal.get(b.id) ?? 0),
      );
      cascadeIndexOf.set(
        e.id,
        sortedPeers.findIndex((p) => p.id === e.id),
      );
    }

    // ── 4. Применение _cascadeIndex / _cascadeTotal + overflow ─────
    const hiddenEvents: CalendarEvent[] = [];

    for (const e of remaining) {
      const cascadeIndex = cascadeIndexOf.get(e.id) ?? 0;
      const k = overlapOf.get(e.id) ?? 1;

      if (cascadeIndex >= maxCols) {
        hiddenEvents.push(e);
        continue;
      }

      // Если K больше maxCols, урезаем до maxCols — иначе пропорции
      // сделают левые карточки слишком широкими, и overflow-бейдж не
      // вписался бы в оставшиеся проценты.
      const effectiveK = Math.min(k, maxCols);

      const overBg = background.some((b) => overlaps(b, e));

      result.push({
        ...e,
        _cascadeIndex: cascadeIndex,
        _cascadeTotal: effectiveK,
        _overBackground: overBg,
        _layer: "foreground",
      });
    }

    // Группируем скрытые события в overflow-бейджи. Каждый бейдж ставится в
    // последний видимый cascade-уровень (maxCols-1) с _cascadeTotal = maxCols.
    if (hiddenEvents.length > 0) {
      const sortedHidden = [...hiddenEvents].sort((a, b) => a.start.getTime() - b.start.getTime());
      let segStart = sortedHidden[0].start;
      let segEnd = sortedHidden[0].end;
      let segIds: string[] = [sortedHidden[0].id];

      const flush = () => {
        overflows.push({
          id: `ovf-${segIds[0]}-${segIds.length}`,
          // Старые поля col/clusterCols сохраняются для совместимости с
          // OverflowBadgeCard, но интерпретируются под cascade-модель:
          // col = maxCols - 1 (последний видимый уровень),
          // clusterCols = maxCols.
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
