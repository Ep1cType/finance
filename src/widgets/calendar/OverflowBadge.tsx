import { BG_OVERLAY_OFFSET_PCT, HOUR_START, SLOT_HEIGHT } from "./constants";
import type { OverflowBadge } from "./utils";
import { fmtTime } from "./utils";

interface OverflowBadgeCardProps {
  badge: OverflowBadge;
  onClick: (badge: OverflowBadge) => void;
  gapPx?: number;
}

/**
 * Компактная карточка-индикатор «+N» в зоне переполнения. Стоит на месте
 * последнего видимого cascade-уровня (cascadeIndex = maxCols - 1, K = maxCols).
 * Если бейдж лежит поверх background-события, его доступная зона начинается
 * с BG_OVERLAY_OFFSET_PCT — так же как у foreground-карточек.
 */
export function OverflowBadgeCard({ badge, onClick, gapPx = 2 }: OverflowBadgeCardProps) {
  const startMin = (badge.start.getHours() - HOUR_START) * 60 + badge.start.getMinutes();
  const endMin = (badge.end.getHours() - HOUR_START) * 60 + badge.end.getMinutes();
  const top = (startMin * SLOT_HEIGHT) / 60;
  const height = Math.max(22, ((endMin - startMin) * SLOT_HEIGHT) / 60);

  // Cascade-формула: бейдж занимает позицию (col / clusterCols) от base.
  const base = badge.overBackground ? BG_OVERLAY_OFFSET_PCT : 0;
  const availableWidth = 100 - base;
  const leftPct = base + (badge.col / badge.clusterCols) * availableWidth;

  return (
    <button
      type="button"
      onClick={(ev) => {
        ev.stopPropagation();
        onClick(badge);
      }}
      title={`Ещё ${badge.count} событий · ${fmtTime(badge.start)}–${fmtTime(badge.end)}`}
      aria-label={`Показать ещё ${badge.count} событий`}
      className="group absolute flex flex-col items-center justify-center overflow-hidden rounded-[4px] border border-dashed border-gray-400 bg-gray-100 text-center text-gray-700 transition-shadow hover:bg-gray-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#185FA5]/40"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `${leftPct}%`,
        width: `calc(${100 - leftPct}% - ${gapPx}px)`,
        // Бейдж должен быть поверх обычных foreground (которые могут заехать
        // под него каскадом), поэтому z-index = 10 + maxCols (выше любого
        // foreground cascadeIndex).
        zIndex: 10 + badge.clusterCols,
      }}
    >
      <span className="text-[12px] font-semibold leading-tight">+{badge.count}</span>
      {height >= 36 && <span className="text-[10px] leading-tight opacity-70">ещё</span>}
    </button>
  );
}
