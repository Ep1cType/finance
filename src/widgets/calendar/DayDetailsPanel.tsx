import { useEffect, useMemo } from "react";

import { COLOR_CLASSES, MONTHS_GEN, WEEKDAYS } from "./constants";
import type { CalendarEvent } from "./types";
import { eventsForDay, fmtTime, isMultiDay, sameDay } from "./utils";

interface DayDetailsPanelProps {
  day: Date;
  events: CalendarEvent[];
  today: Date;
  onClose: () => void;
  onEventClick: (id: string) => void;
}

/**
 * Форматирует длительность события в человекочитаемый вид.
 * Для all-day или многодневных событий возвращает «Весь день».
 */
function formatDuration(e: CalendarEvent): string {
  if (isMultiDay(e)) return "Весь день";
  const minutes = Math.round((e.end.getTime() - e.start.getTime()) / 60_000);
  if (minutes < 60) return `${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} ч` : `${h} ч ${m} мин`;
}

export function DayDetailsPanel({ day, events, today, onClose, onEventClick }: DayDetailsPanelProps) {
  // Закрытие по Esc
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dayEvents = useMemo(() => {
    return eventsForDay(events, day).sort((a, b) => {
      // multi-day сверху, дальше по времени начала
      const aMulti = isMultiDay(a) ? 0 : 1;
      const bMulti = isMultiDay(b) ? 0 : 1;
      if (aMulti !== bMulti) return aMulti - bMulti;
      return a.start.getTime() - b.start.getTime();
    });
  }, [events, day]);

  const isToday = sameDay(day, today);

  // Индекс, перед которым нужно вставить разделитель «Сейчас».
  // Только для today, и только если есть события и до и после текущего момента.
  const nowIndex = useMemo(() => {
    if (!isToday) return -1;
    const now = today.getTime();
    for (let i = 0; i < dayEvents.length; i++) {
      const e = dayEvents[i];
      if (isMultiDay(e)) continue;
      if (e.start.getTime() >= now) return i;
    }
    return -1;
  }, [dayEvents, today, isToday]);

  const weekdayLabel = WEEKDAYS[(day.getDay() + 6) % 7];
  const headerTitle = `${weekdayLabel}, ${day.getDate()} ${MONTHS_GEN[day.getMonth()]}`;

  return (
    <aside
      className="flex w-full shrink-0 flex-col overflow-hidden rounded-md border-[0.5px] border-gray-200 bg-white sm:w-[340px]"
      aria-label={`События на ${headerTitle}`}
    >
      {/* Шапка */}
      <header className="flex items-center justify-between border-b-[0.5px] border-b-gray-200 bg-gray-50 px-3 py-2.5">
        <h3 className="text-sm font-medium text-gray-900">{headerTitle}</h3>
        <button
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-200 hover:text-gray-900"
        >
          ×
        </button>
      </header>

      {/* Список событий */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {dayEvents.length === 0 ? (
          <div className="py-6 text-center text-[12px] text-gray-500">На этот день событий нет</div>
        ) : (
          <ul className="flex flex-col gap-2">
            {dayEvents.map((e, i) => (
              <li key={e.id}>
                {i === nowIndex && <NowDivider />}
                <EventRow event={e} day={day} onClick={() => onEventClick(e.id)} />
              </li>
            ))}
            {/* Если все события — в прошлом, ставим «Сейчас» в конце */}
            {isToday && nowIndex === -1 && dayEvents.some((e) => !isMultiDay(e)) && (
              <li>
                <NowDivider />
              </li>
            )}
          </ul>
        )}
      </div>
    </aside>
  );
}

function NowDivider() {
  return (
    <div className="my-2 flex items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-[#185FA5] px-2 py-0.5 text-[11px] font-medium text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        Сейчас
      </span>
      <span className="h-px flex-1 bg-[#185FA5]/30" />
    </div>
  );
}

function EventRow({ event, day, onClick }: { event: CalendarEvent; day: Date; onClick: () => void }) {
  const multi = isMultiDay(event);

  // Для многодневного события показываем диапазон, иначе только время старта
  const timeLabel = multi
    ? sameDay(event.start, day)
      ? "С этого дня"
      : sameDay(event.end, day)
        ? "До этого дня"
        : "Целый день"
    : fmtTime(event.start);

  // Для мультидневного день — это «текущий» день, для однодневного — нормальная длительность
  const durationLabel = formatDuration(event);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group grid w-full grid-cols-[64px_1fr] items-stretch gap-2 rounded text-left ${
        event.completed ? "opacity-60" : ""
      }`}
    >
      {/* Колонка времени */}
      <div className="flex flex-col justify-center pt-px">
        <span className="text-[12px] font-medium text-gray-900">{timeLabel}</span>
        <span className="text-[11px] text-gray-500">{durationLabel}</span>
      </div>

      {/* Цветная плашка с заголовком */}
      <div className={`relative overflow-hidden rounded px-2.5 py-1.5 ${COLOR_CLASSES[event.color]}`}>
        {/* Цветная полоска слева как акцент */}
        <span aria-hidden className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-current opacity-40" />
        <div className={`pl-1.5 text-[12px] font-medium leading-snug ${event.completed ? "line-through" : ""}`}>
          {event.title}
        </div>
        {event.speaker && <div className="pl-1.5 text-[11px] opacity-80">{event.speaker}</div>}
        {!multi && (
          <div className="pl-1.5 text-[11px] opacity-70">
            {fmtTime(event.start)}–{fmtTime(event.end)}
          </div>
        )}
      </div>

      {/* SR-only — для скринридера */}
      <span className="sr-only">
        {event.title} в {timeLabel}, длительность {durationLabel}
      </span>
    </button>
  );
}
