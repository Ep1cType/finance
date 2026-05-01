import { COLOR_CLASSES, HOUR_START, SLOT_HEIGHT } from "./constants";
import type { PackedEvent } from "./types";
import { fmtTime } from "./utils";

interface TimedEventCardProps {
  event: PackedEvent;
  onClick: (id: string) => void;
  /** Минимальный отступ справа в px (gap между колонками) */
  gapPx?: number;
}

/**
 * Карточка события в сетке дня/недели.
 *
 * Layout:
 *   left  = (_col / _clusterCols) * 100%
 *   width = (_span / _clusterCols) * 100% − gap
 *
 * Адаптивный контент:
 *   <30 мин — только заголовок одной строкой
 *   30–60 мин — заголовок + время
 *   ≥60 мин — заголовок + время + спикер
 */
export function TimedEventCard({ event: e, onClick, gapPx = 2 }: TimedEventCardProps) {
  const startMin = (e.start.getHours() - HOUR_START) * 60 + e.start.getMinutes();
  const endMin = (e.end.getHours() - HOUR_START) * 60 + e.end.getMinutes();
  const durationMin = endMin - startMin;
  const top = (startMin * SLOT_HEIGHT) / 60;
  const height = Math.max(22, (durationMin * SLOT_HEIGHT) / 60);

  const widthPct = (e._span / e._clusterCols) * 100;
  const leftPct = (e._col / e._clusterCols) * 100;

  // Уровни компактности по реальной высоте плашки (не по длительности),
  // т.к. SLOT_HEIGHT=36 даёт всего 18px на 30-минутное событие.
  const isTiny = height < 30; // только заголовок одной строкой
  const isShort = height < 54; // заголовок + время; без спикера

  // z-index: позже начавшиеся события — выше, чтобы при касании краёв они были
  // сверху. На hover поднимаем ещё выше.
  const baseZ = 10 + Math.floor(startMin / 5);

  return (
    <button
      type="button"
      onClick={(ev) => {
        ev.stopPropagation();
        onClick(e.id);
      }}
      title={`${e.title}${e.speaker ? ` · ${e.speaker}` : ""} · ${fmtTime(e.start)}–${fmtTime(e.end)}`}
      className={`group absolute overflow-hidden rounded-[4px] text-left transition-shadow hover:z-50 hover:shadow-md focus:z-50 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/40 ${COLOR_CLASSES[e.color]} ${
        e.completed ? "opacity-60" : ""
      }`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `${leftPct}%`,
        width: `calc(${widthPct}% - ${gapPx}px)`,
        zIndex: baseZ,
      }}
    >
      {/* Цветная полоска слева — акцент */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-current opacity-50" />

      <div className={`flex h-full flex-col px-2 ${isTiny ? "py-px" : "py-1"} pl-[9px]`}>
        {isTiny ? (
          // Очень короткое: всё в одну строку
          <div className="flex items-center gap-1.5 truncate text-[11px] leading-tight">
            <span className={`truncate font-medium ${e.completed ? "line-through" : ""}`}>{e.title}</span>
            <span className="shrink-0 opacity-70">{fmtTime(e.start)}</span>
          </div>
        ) : (
          <>
            <div className={`truncate text-[11px] font-medium leading-tight ${e.completed ? "line-through" : ""}`}>
              {e.title}
            </div>
            <div className="truncate text-[11px] leading-tight opacity-80">
              {fmtTime(e.start)}–{fmtTime(e.end)}
              {e.speaker && !isShort && ` · ${e.speaker}`}
            </div>
          </>
        )}
      </div>
    </button>
  );
}
