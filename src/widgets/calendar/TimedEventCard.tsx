import { BG_OVERLAY_OFFSET_PCT, COLOR_CLASSES, HOUR_START, SLOT_HEIGHT } from "./constants";
import type { PackedEvent } from "./types";
import { fmtTime } from "./utils";

interface TimedEventCardProps {
  event: PackedEvent;
  onClick: (id: string) => void;
  /** Минимальный отступ справа в px (gap между колонками) */
  gapPx?: number;
}

/**
 * Карточка события в сетке дня/недели — right-aligned cascade модель.
 *
 * Каждая карточка упирается в правый край колонки, а левый край сдвинут так,
 * что видимая ширина i-й карточки = `(K - i) / K * availableWidth`.
 *
 *   left  = base + (i / K) * availableWidth
 *   width = 100% - left  (с поправкой на gap)
 *
 * где `base` = 0 для обычных событий и BG_OVERLAY_OFFSET_PCT для событий
 * поверх background — чтобы слева осталась видна полоска bg-события.
 */
export function TimedEventCard({ event: e, onClick, gapPx = 2 }: TimedEventCardProps) {
  const startMin = (e.start.getHours() - HOUR_START) * 60 + e.start.getMinutes();
  const endMin = (e.end.getHours() - HOUR_START) * 60 + e.end.getMinutes();
  const durationMin = endMin - startMin;
  const top = (startMin * SLOT_HEIGHT) / 60;
  const height = Math.max(22, (durationMin * SLOT_HEIGHT) / 60);

  // base — точка отсчёта левого края.
  // Для background и одиночных foreground (не over bg) — 0.
  // Для foreground over bg — резерв слева на видимую полосу bg-события.
  const base = e._overBackground ? BG_OVERLAY_OFFSET_PCT : 0;
  const availableWidth = 100 - base;

  // Cascade: i-я карточка из K имеет видимую ширину (K-i)/K * available.
  // Все карточки заканчиваются на правом крае — поэтому width = 100 - left.
  const i = e._cascadeIndex;
  const K = Math.max(1, e._cascadeTotal);
  const finalLeftPct = base + (i / K) * availableWidth;

  // Уровни компактности по реальной высоте плашки.
  const isTiny = height < 30;
  const isShort = height < 54;

  // z-index:
  //  - background: низкий (1..) для покоя; на hover поднимается выше всего
  //    foreground (60), чтобы можно было «достать» из-под коротких.
  //  - foreground: чем больше cascadeIndex (правее, уже), тем выше z-index
  //    в покое — иначе узкие события заслонялись бы широкими.
  //    На hover любой поднимается до 70 (выше hovered bg = 60).
  const isBg = e._layer === "background";
  const baseZ = isBg ? 2 : 10 + i;
  const hoverZ = isBg ? 60 : 70;

  // Background-события рисуем чуть бледнее. На hover — полную яркость.
  const bgClass = isBg ? "opacity-80 hover:opacity-100 hover:shadow-md" : "hover:shadow-md";

  return (
    <button
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
        // width = 100% - left - gap. Через calc, чтобы карточка точно упёрлась
        // в правый край колонки (минус технический gap для визуального воздуха).
        width: `calc(${100 - finalLeftPct}% - ${gapPx}px)`,
        zIndex: baseZ,
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
