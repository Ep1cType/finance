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
 * Используется right-aligned cascade модель: события на одной горизонтали
 * каскадно сдвигаются вправо так, что каждое следующее имеет видимую ширину
 * меньше предыдущего, но все упираются в правый край колонки.
 *
 *  - `_cascadeIndex` — порядковый номер в каскаде (0-based, 0 = leftmost,
 *    самое широкое; K-1 = rightmost, самое узкое).
 *  - `_cascadeTotal` — K, общее число foreground-событий в каскаде на момент
 *    самого «плотного» пересечения внутри собственного интервала события.
 *    Видимая ширина i-й карточки = `(K - i) / K * availableWidth`.
 *  - `_overBackground` — событие лежит поверх какого-то background-события.
 *    Если true, доступная зона начинается с BG_OVERLAY_OFFSET_PCT и каскад
 *    идёт внутри неё, а не от 0.
 *  - `_layer`:
 *      - `'background'` — рисуется первым, на полную ширину дня, низкий
 *        z-index. По hover поднимается над foreground.
 *      - `'foreground'` — обычная карточка по cascade-разметке, поверх
 *        background.
 */
export interface PackedEvent extends CalendarEvent {
  _cascadeIndex: number;
  _cascadeTotal: number;
  _overBackground: boolean;
  _layer: "background" | "foreground";
}
