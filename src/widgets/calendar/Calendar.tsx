"use client";

import { useMemo, useState } from "react";

import { COLOR_DOT_CLASSES, MONTHS, MONTHS_GEN, WEEKDAYS } from "./constants";
import { DayDetailsPanel } from "./DayDetailsPanel";
import { DayView } from "./DayView";
import { EventModal } from "./EventModal";
import { MonthView } from "./MonthView";
import type { CalendarEvent, CalendarView } from "./types";
import { addDays, sameDay, startOfWeek } from "./utils";
import { WeekView } from "./WeekView";

interface CalendarProps {
  /** Начальный набор событий */
  initialEvents: CalendarEvent[];
  /** Стартовая дата (по умолчанию — текущая) */
  initialCursor?: Date;
  /** Стартовый вид (по умолчанию `month`) */
  initialView?: CalendarView;
  /** Якорь «сегодня» — нужен для тестов и фиксированных прототипов */
  today?: Date;
  /** Колбэк при сохранении любого события */
  onEventChange?: (event: CalendarEvent) => void;
}

export function Calendar({
  initialEvents,
  initialCursor,
  initialView = "month",
  today = new Date(),
  onEventChange,
}: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [cursor, setCursor] = useState<Date>(initialCursor ?? new Date());
  const [view, setView] = useState<CalendarView>(initialView);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const editingEvent = useMemo(() => events.find((e) => e.id === editingId) ?? null, [events, editingId]);

  // Боковая панель доступна во всех видах. В Month — открывается кликом по дню /
  // «+N ещё»; в Week/Day — кликом по «+N» бейджу overflow.
  const showDayPanel = selectedDay !== null;

  const handleDayClick = (day: Date) => {
    // Повторный клик по тому же дню — закрывает панель
    setSelectedDay((prev) => (prev && sameDay(prev, day) ? null : day));
  };

  // Клик по бейджу переполнения в Day/Week view — открыть детали этого дня
  const handleOverflowClick = (day: Date) => {
    setSelectedDay(day);
  };

  // Заголовок по виду
  const title = useMemo(() => {
    if (view === "month") {
      return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
    }
    if (view === "week") {
      const start = startOfWeek(cursor);
      const end = addDays(start, 6);
      return `${start.getDate()} ${MONTHS_GEN[start.getMonth()]} – ${end.getDate()} ${MONTHS_GEN[end.getMonth()]} ${end.getFullYear()}`;
    }
    // day
    return `${WEEKDAYS[(cursor.getDay() + 6) % 7]}, ${cursor.getDate()} ${MONTHS_GEN[cursor.getMonth()]} ${cursor.getFullYear()}`;
  }, [view, cursor]);

  const goPrev = () => {
    setCursor((c) => {
      if (view === "month") {
        const x = new Date(c);
        x.setMonth(x.getMonth() - 1);
        return x;
      }
      if (view === "week") return addDays(c, -7);
      return addDays(c, -1);
    });
  };

  const goNext = () => {
    setCursor((c) => {
      if (view === "month") {
        const x = new Date(c);
        x.setMonth(x.getMonth() + 1);
        return x;
      }
      if (view === "week") return addDays(c, 7);
      return addDays(c, 1);
    });
  };

  const goToday = () => setCursor(new Date(today));

  const handleEventClick = (id: string) => setEditingId(id);

  const handleSave = (updated: CalendarEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    onEventChange?.(updated);
    setEditingId(null);
  };

  return (
    <div className="relative">
      <div className="font-sans text-sm text-gray-900">
        {/* Тулбар */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Назад"
              onClick={goPrev}
              className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 hover:bg-gray-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goToday}
              className="h-7 rounded border border-gray-200 px-3 text-[13px] hover:bg-gray-100"
            >
              Сегодня
            </button>
            <button
              type="button"
              aria-label="Вперёд"
              onClick={goNext}
              className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 hover:bg-gray-100"
            >
              ›
            </button>
            <span className="px-1 text-sm font-medium">{title}</span>
          </div>

          <div className="flex items-center gap-1">
            {(["day", "week", "month"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`h-7 rounded border px-3 text-[13px] ${
                  view === v ? "border-gray-300 bg-gray-100" : "border-gray-200 hover:bg-gray-100"
                }`}
              >
                {v === "day" ? "День" : v === "week" ? "Неделя" : "Месяц"}
              </button>
            ))}
          </div>
        </div>

        {/* Легенда */}
        <div className="mb-3 flex flex-wrap gap-x-3.5 gap-y-2.5 rounded-md bg-gray-50 px-3 py-2.5 text-[12px] text-gray-500">
          <LegendItem color={COLOR_DOT_CLASSES["task-red"]} label="Новости" />
          <LegendItem color={COLOR_DOT_CLASSES["task-blue"]} label="Культура" />
          <LegendItem color={COLOR_DOT_CLASSES["task-yellow"]} label="Производство" />
          <LegendItem color={COLOR_DOT_CLASSES["task-green"]} label="Спецрепортаж" />
          <LegendItem color={COLOR_DOT_CLASSES["task-violet"]} label="Общее" />
          <LegendItem color={COLOR_DOT_CLASSES["task-turquoise"]} label="Медиа" />
          <LegendItem color={COLOR_DOT_CLASSES["task-pink"]} label="Интервью" />
        </div>

        {/* Тело: в месячном виде с открытой панелью — split layout */}
        <div className={showDayPanel ? "flex flex-col gap-3 lg:flex-row lg:items-start" : ""}>
          <div className="min-w-0 flex-1">
            {view === "month" && (
              <MonthView
                cursor={cursor}
                today={today}
                events={events}
                onEventClick={handleEventClick}
                onDayClick={handleDayClick}
                selectedDay={selectedDay}
              />
            )}
            {view === "week" && (
              <WeekView
                cursor={cursor}
                today={today}
                events={events}
                onEventClick={handleEventClick}
                onOverflowClick={handleOverflowClick}
              />
            )}
            {view === "day" && (
              <DayView
                cursor={cursor}
                today={today}
                events={events}
                onEventClick={handleEventClick}
                onOverflowClick={handleOverflowClick}
              />
            )}
          </div>

          {showDayPanel && selectedDay && (
            <DayDetailsPanel
              day={selectedDay}
              events={events}
              today={today}
              onClose={() => setSelectedDay(null)}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </div>

      {/* Модалка */}
      <EventModal event={editingEvent} onClose={() => setEditingId(null)} onSave={handleSave} />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-[2px] ${color}`} />
      {label}
    </span>
  );
}
