"use client";

import { COLOR_CLASSES, HOUR_END, HOUR_START, SLOT_HEIGHT, WEEKDAYS } from "./constants";
import type { CalendarEvent } from "./types";
import {
  addDays,
  dayDiff,
  eventsForDay,
  fmtTime,
  isMultiDay,
  packCols,
  packLanes,
  sameDay,
  startOfWeek,
} from "./utils";

interface WeekViewProps {
  cursor: Date;
  today: Date;
  events: CalendarEvent[];
  onEventClick: (id: string) => void;
}

export function WeekView({ cursor, today, events, onEventClick }: WeekViewProps) {
  const start = startOfWeek(cursor);
  const end = addDays(start, 6);

  // Многодневные / all-day события, пересекающиеся с этой неделей
  const allDay = events.filter((e) => e.start < addDays(end, 1) && e.end > start && isMultiDay(e));
  const { events: aLaned, n: aLanes } = packLanes(allDay);
  const allDayHeight = 8 + Math.max(1, aLanes) * 22;

  // Сетка: 50px gutter + 7 равных колонок
  const gridStyle = { gridTemplateColumns: "50px repeat(7, 1fr)" };

  const hours: number[] = [];
  for (let h = HOUR_START; h <= HOUR_END; h++) hours.push(h);

  return (
    <div className="overflow-hidden rounded-md border-[0.5px] border-gray-200 bg-white">
      {/* Шапка с датами */}
      <div className="grid border-b-[0.5px] border-b-gray-200 bg-gray-50" style={gridStyle}>
        <div className="border-r-[0.5px] border-r-gray-200 px-1 py-1.5 text-[11px]" />
        {Array.from({ length: 7 }).map((_, i) => {
          const d = addDays(start, i);
          const isToday = sameDay(d, today);
          return (
            <div
              key={i}
              className={`border-r-[0.5px] border-r-gray-200 px-1 py-1.5 text-center text-[11px] last:border-r-0 ${
                isToday ? "font-medium text-[#185FA5]" : "text-gray-500"
              }`}
            >
              {WEEKDAYS[i]} {d.getDate()}
            </div>
          );
        })}
      </div>

      {/* Полоса all-day событий */}
      <div
        className="relative grid border-b-[0.5px] border-b-gray-200"
        style={{ ...gridStyle, minHeight: `${allDayHeight}px` }}
      >
        <div className="border-r-[0.5px] border-r-gray-200" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="border-r-[0.5px] border-r-gray-200 last:border-r-0" />
        ))}
        {aLaned.map((e) => {
          const sIdx = Math.max(0, dayDiff(e.start, start));
          const eIdx = Math.min(6, dayDiff(e.end, start));
          const span = eIdx - sIdx + 1;
          return (
            <div
              key={e.id}
              className={`absolute h-[18px] cursor-pointer truncate rounded-[3px] px-1.5 py-px text-[11px] leading-4 ${COLOR_CLASSES[e.color]} ${
                e.completed ? "line-through opacity-55" : ""
              }`}
              style={{
                left: `calc(50px + ${sIdx} * (100% - 50px) / 7 + 2px)`,
                width: `calc(${span} * (100% - 50px) / 7 - 4px)`,
                top: `${4 + e._lane * 22}px`,
              }}
              onClick={(ev) => {
                ev.stopPropagation();
                onEventClick(e.id);
              }}
            >
              {e.title}
              {e.speaker ? ` · ${e.speaker}` : ""}
            </div>
          );
        })}
      </div>

      {/* Тело: часы слева + 7 колонок дней */}
      <div className="relative grid" style={gridStyle}>
        {/* Колонка часов */}
        <div className="border-r-[0.5px] border-r-gray-200">
          {hours.map((h) => (
            <div
              key={h}
              className="border-b-[0.5px] border-b-gray-200 px-1.5 py-px text-right text-[11px] text-gray-500"
              style={{ height: `${SLOT_HEIGHT}px` }}
            >
              {h}:00
            </div>
          ))}
        </div>

        {/* Колонки дней */}
        {Array.from({ length: 7 }).map((_, i) => {
          const d = addDays(start, i);
          const dayEvts = eventsForDay(events, d).filter((e) => !isMultiDay(e));
          const packed = packCols(dayEvts);

          return (
            <div key={i} className="relative border-r-[0.5px] border-r-gray-200 last:border-r-0">
              {/* Часовые слоты */}
              {hours.map((h) => (
                <div key={h} className="border-b-[0.5px] border-b-gray-200" style={{ height: `${SLOT_HEIGHT}px` }} />
              ))}

              {/* События дня */}
              {packed.map((e) => {
                const sM = (e.start.getHours() - HOUR_START) * 60 + e.start.getMinutes();
                const eM = (e.end.getHours() - HOUR_START) * 60 + e.end.getMinutes();
                const top = (sM * SLOT_HEIGHT) / 60;
                const h = Math.max(22, ((eM - sM) * SLOT_HEIGHT) / 60);
                const wp = 100 / e._totalCols;
                const lp = e._col * wp;
                return (
                  <div
                    key={e.id}
                    className={`absolute cursor-pointer overflow-hidden rounded-[4px] px-1.5 py-[3px] text-[11px] leading-[1.3] ${COLOR_CLASSES[e.color]} ${
                      e.completed ? "line-through opacity-55" : ""
                    }`}
                    style={{
                      top: `${top}px`,
                      height: `${h}px`,
                      left: `${lp}%`,
                      width: `calc(${wp}% - 2px)`,
                    }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEventClick(e.id);
                    }}
                  >
                    <b className="block truncate font-medium">{e.title}</b>
                    <span className="block truncate text-[11px] opacity-85">
                      {fmtTime(e.start)}
                      {e.speaker ? ` · ${e.speaker}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
