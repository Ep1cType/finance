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
}
