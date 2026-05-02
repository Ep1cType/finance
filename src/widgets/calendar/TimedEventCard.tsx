import { BG_OVERLAY_OFFSET_PCT, CASCADE_INDENT_PCT, COLOR_CLASSES, HOUR_START, SLOT_HEIGHT } from "./constants";
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

  // Если событие лежит поверх background, слева резервируется полоса
  // BG_OVERLAY_OFFSET_PCT — на ней будет видно фоновое событие. Внутри
  // оставшейся ширины событие всё равно делит место с другими foreground
  // по обычной column-разметке.
  const reserved = e._overBackground ? BG_OVERLAY_OFFSET_PCT : 0;
  const availableWidth = 100 - reserved;
  const widthPct = (e._span / e._clusterCols) * availableWidth;
  const leftPct = reserved + (e._col / e._clusterCols) * availableWidth;

  // Каскадный сдвиг (вариант (а): событие сжимается). При indent = N левый
  // край сдвигается на N * CASCADE_INDENT_PCT процентов вправо, ширина
  // уменьшается на ту же величину. Background-событиям _indent всегда 0.
  const indentPct = e._indent * CASCADE_INDENT_PCT;
  const finalLeftPct = leftPct + indentPct;
  const finalWidthPct = widthPct - indentPct;

  // Уровни компактности по реальной высоте плашки (не по длительности),
  // т.к. SLOT_HEIGHT=36 даёт всего 18px на 30-минутное событие.
  const isTiny = height < 30; // только заголовок одной строкой
  const isShort = height < 54; // заголовок + время; без спикера

  // z-index по слою:
  //   background — внизу (1..5), при hover поднимается выше foreground (60).
  //   foreground — сверху (10+), при hover ещё выше (50). Поздние события
  //   получают чуть больший z, чтобы при касании краёв оказывались сверху.
  const isBg = e._layer === "background";
  const baseZ = isBg ? 1 + Math.floor(startMin / 60) : 10 + Math.floor(startMin / 5);
  const hoverZ = isBg ? 60 : 50;

  // Background-события рисуем чуть бледнее, чтобы поверх лежащие foreground
  // были чётче. Также убираем тень — фон не должен «всплывать» в покое.
  const bgClass = isBg ? "opacity-80 hover:opacity-100 hover:shadow-md" : "hover:shadow-md";

  return (
    <button
      data-set={availableWidth}
      type="button"
      onClick={(ev) => {
        ev.stopPropagation();
        onClick(e.id);
      }}
      title={`${e.title}${e.speaker ? ` · ${e.speaker}` : ""} · ${fmtTime(e.start)}–${fmtTime(e.end)}`}
      className={`group absolute overflow-hidden rounded-[4px] text-left transition-[opacity,box-shadow] focus:outline-none focus:ring-2 focus:ring-[#185FA5]/40 ${COLOR_CLASSES[e.color]} ${bgClass} ${
        e.completed ? "opacity-60" : ""
      }`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `${finalLeftPct}%`,
        width: `calc(${100 - finalLeftPct}% - ${gapPx}px)`,
        zIndex: baseZ,
        // Inline-стиль на hover: используем CSS-переменную для динамического z-index
        ["--hover-z" as string]: hoverZ,
      }}
      onMouseEnter={(ev) => {
        ev.currentTarget.style.zIndex = String(hoverZ);
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.zIndex = String(baseZ);
      }}
      onFocus={(ev) => {
        ev.currentTarget.style.zIndex = String(hoverZ);
      }}
      onBlur={(ev) => {
        ev.currentTarget.style.zIndex = String(baseZ);
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
