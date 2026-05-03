import type { EventColor } from "./types";

export const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
] as const;

export const MONTHS_GEN = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

export const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

/**
 * Tailwind-классы для каждого цвета события.
 * Используются произвольные значения (`bg-[#...]`), чтобы сохранить
 * точное соответствие исходным цветам без конфигурации tailwind.config.
 */
export const COLOR_CLASSES: Record<EventColor, string> = {
  "task-red": "bg-[#FCEBEB] text-[#791F1F]",
  "task-blue": "bg-[#E6F1FB] text-[#0C447C]",
  "task-primary": "bg-[#E6F1FB] text-[#0C447C]",
  "task-green": "bg-[#EAF3DE] text-[#27500A]",
  "task-yellow": "bg-[#FAEEDA] text-[#854F0B]",
  "task-pink": "bg-[#FBEAF0] text-[#72243E]",
  "task-violet": "bg-[#EEEDFE] text-[#3C3489]",
  "task-turquoise": "bg-[#E1F5EE] text-[#085041]",
  "task-gray": "bg-[#F1EFE8] text-[#444441]",
};

/** Только фон — для маленьких индикаторов в легенде и модалке */
export const COLOR_DOT_CLASSES: Record<EventColor, string> = {
  "task-red": "bg-[#FCEBEB]",
  "task-blue": "bg-[#E6F1FB]",
  "task-primary": "bg-[#E6F1FB]",
  "task-green": "bg-[#EAF3DE]",
  "task-yellow": "bg-[#FAEEDA]",
  "task-pink": "bg-[#FBEAF0]",
  "task-violet": "bg-[#EEEDFE]",
  "task-turquoise": "bg-[#E1F5EE]",
  "task-gray": "bg-[#F1EFE8]",
};

export const COLOR_OPTIONS: { value: EventColor; label: string }[] = [
  { value: "task-red", label: "Новости" },
  { value: "task-blue", label: "Культура" },
  { value: "task-yellow", label: "Производство" },
  { value: "task-green", label: "Спецрепортаж" },
  { value: "task-violet", label: "Общее" },
  { value: "task-turquoise", label: "Медиа" },
  { value: "task-pink", label: "Интервью" },
  { value: "task-gray", label: "Разное" },
];

/** Часовые границы дневной/недельной сетки и высота слота в px */
export const HOUR_START = 0;
export const HOUR_END = 23;
export const SLOT_HEIGHT = 36;

/**
 * Высота скроллируемой области с часовой сеткой.
 * Полная сетка = (HOUR_END - HOUR_START + 1) * SLOT_HEIGHT = 864px.
 * Здесь — видимая часть, дальше идёт скролл.
 */
export const BODY_MAX_HEIGHT = 540; // ≈ 15 часовых слотов

/**
 * К какому часу автоматически скроллится сетка при монтировании /
 * смене даты. 7 — стандарт Google Calendar (видны утренние события).
 */
export const DEFAULT_SCROLL_HOUR = 7;

/**
 * Левый отступ для foreground-события, лежащего поверх background-события.
 * Резервирует видимую «полоску» background-события слева — чтобы было понятно
 * что под мелкими событиями скрывается длинное. См. `_overBackground`.
 */
export const BG_OVERLAY_OFFSET_PCT = 25;
