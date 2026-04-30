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

/** Событие, прошедшее column-packing для пересекающихся однодневных событий */
export interface ColumnedEvent extends CalendarEvent {
  _col: number;
  _totalCols: number;
}
