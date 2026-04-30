import type { CalendarEvent } from "./types";

const D = (y: number, m: number, d: number, h = 0, mi = 0): Date => new Date(y, m - 1, d, h, mi);

export const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Планёрка",
    start: D(2026, 4, 6, 9, 0),
    end: D(2026, 4, 6, 10, 0),
    color: "task-violet",
    speaker: "Все",
  },
  {
    id: "2",
    title: "Эфир: новости",
    start: D(2026, 4, 13, 8, 0),
    end: D(2026, 4, 13, 10, 0),
    color: "task-red",
    speaker: "М. Соколов",
  },
  {
    id: "3",
    title: "Утренний эфир",
    start: D(2026, 4, 27, 9, 0),
    end: D(2026, 4, 27, 10, 30),
    color: "task-red",
    speaker: "А. Иванов",
  },
  {
    id: "4",
    title: "Интервью с гостем",
    start: D(2026, 4, 27, 11, 0),
    end: D(2026, 4, 27, 12, 30),
    color: "task-pink",
    speaker: "М. Петрова",
  },
  {
    id: "5",
    title: "Монтаж сюжета",
    start: D(2026, 4, 27, 11, 30),
    end: D(2026, 4, 27, 13, 0),
    color: "task-yellow",
    speaker: "Д. Смирнов",
  },
  {
    id: "6",
    title: "Командировка в Питер",
    start: D(2026, 4, 28),
    end: D(2026, 4, 30, 23, 59),
    color: "task-green",
    speaker: "К. Орлов",
    allDay: true,
  },
  {
    id: "7",
    title: "Планёрка",
    start: D(2026, 4, 29, 9, 0),
    end: D(2026, 4, 29, 10, 0),
    color: "task-violet",
    speaker: "Все редакции",
  },
  {
    id: "8",
    title: "Подкаст: культура",
    start: D(2026, 4, 29, 14, 0),
    end: D(2026, 4, 29, 15, 30),
    color: "task-blue",
    speaker: "Е. Лебедева",
  },
  {
    id: "9",
    title: "Гость в студии",
    start: D(2026, 4, 30, 13, 0),
    end: D(2026, 4, 30, 14, 30),
    color: "task-pink",
    speaker: "И. Соколов",
  },
  {
    id: "10",
    title: "Запись подкаста",
    start: D(2026, 4, 30, 15, 30),
    end: D(2026, 4, 30, 16, 30),
    color: "task-turquoise",
    speaker: "Е. Лебедева",
  },
  {
    id: "11",
    title: "Дедлайн материала",
    start: D(2026, 5, 1, 18, 0),
    end: D(2026, 5, 1, 19, 0),
    color: "task-red",
    speaker: "А. Морозова",
    completed: true,
  },
  {
    id: "12",
    title: "Эфир выходного",
    start: D(2026, 5, 3, 12, 0),
    end: D(2026, 5, 3, 14, 0),
    color: "task-red",
    speaker: "Дежурная бригада",
  },
];

/** Якорь «сегодня» — соответствует исходному прототипу */
export const TODAY_ANCHOR = new Date(2026, 3, 30);
