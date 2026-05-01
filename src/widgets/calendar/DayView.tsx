import { COLOR_CLASSES, HOUR_END, HOUR_START, MONTHS_GEN, SLOT_HEIGHT, WEEKDAYS } from "./constants";
import { OverflowBadgeCard } from "./OverflowBadge";
import { TimedEventCard } from "./TimedEventCard";
import type { CalendarEvent } from "./types";
import type { OverflowBadge } from "./utils";
import { eventsForDay, isMultiDay, packEvents, sameDay } from "./utils";

interface DayViewProps {
  cursor: Date;
  today: Date;
  events: CalendarEvent[];
  onEventClick: (id: string) => void;
  /**
   * Максимум видимых колонок. По умолчанию 6 — в day view колонка широкая,
   * можно показать больше событий бок о бок.
   */
  maxCols?: number;
  onOverflowClick?: (day: Date, badge: OverflowBadge) => void;
}

export function DayView({ cursor, today, events, onEventClick, maxCols = 6, onOverflowClick }: DayViewProps) {
  const d = cursor;
  const isToday = sameDay(d, today);
  const allDay = eventsForDay(events, d).filter((e) => isMultiDay(e));
  const dayEvts = eventsForDay(events, d).filter((e) => !isMultiDay(e));
  const { events: packed, overflows } = packEvents(dayEvts, { maxCols });

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

          {packed.map((e) => (
            <TimedEventCard key={e.id} event={e} onClick={onEventClick} />
          ))}

          {/* Бейджи переполнения */}
          {overflows.map((b) => (
            <OverflowBadgeCard key={b.id} badge={b} onClick={(badge) => onOverflowClick?.(d, badge)} />
          ))}
        </div>
      </div>
    </div>
  );
}
