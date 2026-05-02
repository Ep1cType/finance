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

/** Событие после layout-упаковки для дневного/недельного вида */
export interface PackedEvent extends CalendarEvent {
  /** Колонка внутри кластера (0-based) */
  _col: number;
  /** Сколько колонок занимает справа (>=1). Позволяет одиночным расширяться. */
  _span: number;
  /** Всего колонок в кластере */
  _clusterCols: number;
  /**
   * Каскадный отступ (число «уровней» каскада). Применяется к
   * foreground-событиям, которые начинаются позже какого-то события в более
   * ранней колонке. Левый край смещается на `_indent * CASCADE_INDENT_PCT`,
   * ширина уменьшается на ту же величину. Это нужно чтобы при пересечениях
   * с разными `start` была видна нижняя граница верхнего события.
   * 0 — нет каскада.
   */
  _indent: number;
  /**
   * Признак «foreground-событие лежит поверх background-события».
   * Такое событие сжимается до `(100 - BG_OVERLAY_OFFSET_PCT)%` ширины и
   * выравнивается по правому краю — слева остаётся видимая «полоска»
   * background-события, чтобы было понятно что под ним есть длинное событие.
   *
   * Для background-событий и одиночных foreground (без пересечения с bg)
   * флаг `false`.
   */
  _overBackground: boolean;
  /**
   * Слой рендера:
   *  - `'background'` — рисуется первым, на полную ширину дня, низкий z-index.
   *    Используется для длинных событий, которые могут стать «фоном» под
   *    более короткими. По hover поднимается над foreground.
   *  - `'foreground'` — обычная карточка по column-разметке, поверх background.
   */
  _layer: "background" | "foreground";
}
