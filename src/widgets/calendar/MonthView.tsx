"use client";

import { Fragment } from "react";

import { COLOR_CLASSES, WEEKDAYS } from "./constants";
import type { CalendarEvent } from "./types";
import {
  addDays,
  dayDiff,
  eventsForDay,
  fmtTime,
  isMultiDay,
  packLanes,
  sameDay,
  startOfDay,
  startOfWeek,
} from "./utils";

const MAX_LANES = 2;

interface MonthViewProps {
  cursor: Date;
  today: Date;
  events: CalendarEvent[];
  onEventClick: (id: string) => void;
}

export function MonthView({ cursor, today, events, onEventClick }: MonthViewProps) {
  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const start = startOfWeek(new Date(y, m, 1));

  return (
    <div className="overflow-hidden rounded-md border-[0.5px] border-gray-200 bg-white">
      {/* Шапка с днями недели */}
      <div className="grid grid-cols-7 border-b-[0.5px] border-b-gray-200 bg-gray-50">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-1 py-1.5 text-center text-[11px] text-gray-500">
            {d}
          </div>
        ))}
      </div>

      {/* 6 недельных строк */}
      {Array.from({ length: 6 }).map((_, w) => {
        const wkStart = addDays(start, w * 7);
        const wkEnd = addDays(wkStart, 7);

        // Многодневные события, попадающие в эту неделю
        const multi = events.filter((e) => isMultiDay(e) && e.start < wkEnd && e.end > wkStart);
        const { events: laned, n: numLanes } = packLanes(multi);
        const visibleLanes = Math.min(MAX_LANES, numLanes);
        const laneOffset = visibleLanes * 18;

        return (
          <div key={w} className="relative grid grid-cols-7 border-t-[0.5px] border-t-gray-200 first:border-t-0">
            {/* Ячейки недели */}
            {Array.from({ length: 7 }).map((_, i) => {
              const day = addDays(wkStart, i);
              const inMonth = day.getMonth() === m;
              const isToday = sameDay(day, today);

              const single = eventsForDay(events, day).filter((e) => !isMultiDay(e));
              const dayMultiHidden = laned.filter(
                (e) => e._lane >= MAX_LANES && e.start < addDays(day, 1) && e.end > startOfDay(day),
              ).length;
              const maxSingle = Math.max(0, 3 - visibleLanes);
              const visibleSingle = single.slice(0, maxSingle);
              const hidden = single.length - visibleSingle.length + dayMultiHidden;

              return (
                <div
                  key={i}
                  className={`relative flex min-h-[90px] flex-col border-r-[0.5px] border-r-gray-200 px-[3px] pb-1 pt-6 last:border-r-0 ${
                    inMonth ? "" : "bg-gray-50"
                  }`}
                >
                  {/* Номер дня */}
                  <span
                    className={
                      isToday
                        ? "absolute left-1 top-[3px] inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#185FA5] text-[11px] font-medium text-white"
                        : `absolute left-1.5 top-1 text-[11px] font-medium ${
                            inMonth ? "text-gray-900" : "text-gray-500"
                          }`
                    }
                  >
                    {day.getDate()}
                  </span>

                  {/* Однодневные события */}
                  <div className="flex flex-col gap-px" style={{ marginTop: `${laneOffset}px` }}>
                    {visibleSingle.map((e) => (
                      <div
                        key={e.id}
                        className={`cursor-pointer truncate rounded-[3px] px-[5px] py-px text-[11px] leading-[1.5] ${COLOR_CLASSES[e.color]} ${
                          e.completed ? "line-through opacity-55" : ""
                        }`}
                        title={e.title}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onEventClick(e.id);
                        }}
                      >
                        {fmtTime(e.start)} {e.title}
                      </div>
                    ))}
                    {hidden > 0 && (
                      <div className="cursor-pointer px-[5px] text-[11px] text-gray-500">+{hidden} ещё</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Многодневные полосы поверх ячеек */}
            {laned
              .filter((e) => e._lane < MAX_LANES)
              .map((e) => {
                const sIdx = Math.max(0, dayDiff(e.start, wkStart));
                const eIdx = Math.min(6, dayDiff(e.end, wkStart));
                const span = eIdx - sIdx + 1;
                const top = 23 + e._lane * 18;
                return (
                  <Fragment key={e.id}>
                    <div
                      className={`absolute h-[17px] cursor-pointer truncate rounded-[3px] px-1.5 py-px text-[11px] leading-[15px] ${COLOR_CLASSES[e.color]} ${
                        e.completed ? "line-through opacity-55" : ""
                      }`}
                      style={{
                        left: `calc(${sIdx} * 100% / 7 + 2px)`,
                        width: `calc(${span} * 100% / 7 - 4px)`,
                        top: `${top}px`,
                      }}
                      title={`${e.title} · ${e.speaker ?? ""}`}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onEventClick(e.id);
                      }}
                    >
                      {e.title}
                    </div>
                  </Fragment>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}
