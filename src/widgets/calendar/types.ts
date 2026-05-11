export type CalendarView = "day" | "week" | "month";

export type EventColor =
  | "task-red"
  | "task-blue"
  | "task-primary"
  | "task-green"
  | "task-yellow"
  | "task-pink"
  | "task-violet"
  | "task-turquoise"
  | "task-gray";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: EventColor;
  speaker?: string;
  allDay?: boolean;
  completed?: boolean;
}

/** Событие, прошедшее обработку lane-packing для отрисовки */
export interface LanedEvent extends CalendarEvent {
  _lane: number;
}

/**
 * Событие после layout-упаковки для дневного/недельного вида.
 *
 * Используется единая right-aligned cascade модель с равными долями: каждая
 * карточка занимает 1/K ширины колонки и упирается в правый край.
 *
 *  - `_cascadeIndex` — порядковый номер в каскаде (0-based, 0 = leftmost,
 *    «база» на 100% ширины; последующие сдвинуты вправо).
 *  - `_cascadeTotal` — K, общее число одновременно пересекающихся событий
 *    в пиковой точке интервала.
 *
 * Формула:
 *   left  = (i / K) * 100%
 *   width = 100% - left = ((K - i) / K) * 100%
 *
 * При K=2: 100% и 50%. При K=3: 100%, 66.6%, 33.3%. При K=4: 100%, 75%, 50%, 25%.
 */
export interface PackedEvent extends CalendarEvent {
  _cascadeIndex: number;
  _cascadeTotal: number;
}
