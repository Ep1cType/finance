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
 * Карточка события в сетке дня/недели — right-aligned cascade модель
 * с равными долями.
 *
 * Формула:
 *   left  = (i / K) * 100%
 *   width = 100% - left
 *
 * Например при K=3:
 *   i=0 → 0%/100% (база)
 *   i=1 → 33.3%/66.6%
 *   i=2 → 66.6%/33.3%
 */
export function TimedEventCard({ event: e, onClick, gapPx = 2 }: TimedEventCardProps) {
  const startMin = (e.start.getHours() - HOUR_START) * 60 + e.start.getMinutes();
  const endMin = (e.end.getHours() - HOUR_START) * 60 + e.end.getMinutes();
  const durationMin = endMin - startMin;
  const top = (startMin * SLOT_HEIGHT) / 60;
  const height = Math.max(22, (durationMin * SLOT_HEIGHT) / 60);

  const i = e._cascadeIndex;
  const K = Math.max(1, e._cascadeTotal);

  // Формула равных долей: каждая карточка занимает 1/K ширины колонки
  // (с правым выравниванием).
  //   left  = (i / K) * 100%
  //   width = 100% - left = (K - i) / K * 100%
  // Например при K=3:
  //   i=0 → 0%/100% (база)
  //   i=1 → 33.3%/66.6%
  //   i=2 → 66.6%/33.3%
  const finalLeftPct = (i / K) * 100;

  // Уровни компактности по реальной высоте плашки.
  const isTiny = height < 30;
  const isShort = height < 54;

  // z-index: чем больше cascadeIndex (правее, уже), тем выше — иначе узкие
  // правые события скрывались бы под широкими левыми. Hover не меняет z-index
  // (намеренно: сбивало с толку при перетаскивании в будущем).
  const baseZ = 10 + i;

  return (
    <button
      type="button"
      onClick={(ev) => {
        ev.stopPropagation();
        onClick(e.id);
      }}
      title={`${e.title}${e.speaker ? ` · ${e.speaker}` : ""} · ${fmtTime(e.start)}–${fmtTime(e.end)}`}
      className={`group absolute overflow-hidden rounded-[4px] text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#185FA5]/40 ${COLOR_CLASSES[e.color]} ${
        e.completed ? "opacity-60" : ""
      }`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `${finalLeftPct}%`,
        width: `calc(${100 - finalLeftPct}% - ${gapPx}px)`,
        zIndex: baseZ,
      }}
    >
      {/* Цветная полоска слева — акцент */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-current opacity-50" />

      <div className={`flex h-full flex-col px-2 ${isTiny ? "py-px" : "py-1"} pl-[9px]`}>
        {isTiny ? (
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
