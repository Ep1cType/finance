"use client";

import { COLOR_CLASSES, HOUR_END, HOUR_START, MONTHS_GEN, SLOT_HEIGHT, WEEKDAYS } from "./constants";
import type { CalendarEvent } from "./types";
import { eventsForDay, fmtTime, isMultiDay, packCols, sameDay } from "./utils";

interface DayViewProps {
  cursor: Date;
  today: Date;
  events: CalendarEvent[];
  onEventClick: (id: string) => void;
}

export function DayView({ cursor, today, events, onEventClick }: DayViewProps) {
  const d = cursor;
  const isToday = sameDay(d, today);
  const allDay = eventsForDay(events, d).filter((e) => isMultiDay(e));
  const dayEvts = eventsForDay(events, d).filter((e) => !isMultiDay(e));
  const packed = packCols(dayEvts);

  const gridStyle = { gridTemplateColumns: "50px 1fr" };

  const hours: number[] = [];
  for (let h = HOUR_START; h <= HOUR_END; h++) hours.push(h);

  const weekdayLabel = WEEKDAYS[(d.getDay() + 6) % 7];

  return (
    <div className="overflow-hidden rounded-md border-[0.5px] border-gray-200 bg-white">
      {/* Шапка */}
      <div className="grid border-b-[0.5px] border-b-gray-200 bg-gray-50" style={gridStyle}>
        <div className="border-r-[0.5px] border-r-gray-200 px-1 py-1.5 text-[11px]" />
        <div
          className={`px-1 py-1.5 text-center text-[11px] ${isToday ? "font-medium text-[#185FA5]" : "text-gray-500"}`}
        >
          {weekdayLabel}, {d.getDate()} {MONTHS_GEN[d.getMonth()]}
        </div>
      </div>

      {/* All-day полоса (если есть многодневные события) */}
      {allDay.length > 0 && (
        <div
          className="relative grid border-b-[0.5px] border-b-gray-200"
          style={{ ...gridStyle, minHeight: `${8 + allDay.length * 22}px` }}
        >
          <div className="border-r-[0.5px] border-r-gray-200" />
          <div />
          {allDay.map((e, idx) => (
            <div
              key={e.id}
              className={`absolute h-[18px] cursor-pointer truncate rounded-[3px] px-1.5 py-px text-[11px] leading-4 ${COLOR_CLASSES[e.color]} ${
                e.completed ? "line-through opacity-55" : ""
              }`}
              style={{
                left: "54px",
                right: "6px",
                top: `${4 + idx * 22}px`,
              }}
              onClick={(ev) => {
                ev.stopPropagation();
                onEventClick(e.id);
              }}
            >
              {e.title}
              {e.speaker ? ` · ${e.speaker}` : ""}
            </div>
          ))}
        </div>
      )}

      {/* Тело */}
      <div className="relative grid" style={gridStyle}>
        {/* Часы */}
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

        {/* Колонка дня */}
        <div className="relative border-r-[0.5px] border-r-gray-200 last:border-r-0">
          {hours.map((h) => (
            <div key={h} className="border-b-[0.5px] border-b-gray-200" style={{ height: `${SLOT_HEIGHT}px` }} />
          ))}

          {packed.map((e) => {
            const sM = (e.start.getHours() - HOUR_START) * 60 + e.start.getMinutes();
            const eM = (e.end.getHours() - HOUR_START) * 60 + e.end.getMinutes();
            const top = (sM * SLOT_HEIGHT) / 60;
            const h = Math.max(28, ((eM - sM) * SLOT_HEIGHT) / 60);
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
                  width: `calc(${wp}% - 4px)`,
                }}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onEventClick(e.id);
                }}
              >
                <b className="block truncate font-medium">{e.title}</b>
                <span className="block truncate text-[11px] opacity-85">
                  {fmtTime(e.start)}–{fmtTime(e.end)}
                  {e.speaker ? ` · ${e.speaker}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
