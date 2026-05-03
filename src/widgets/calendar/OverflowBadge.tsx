import { HOUR_START, SLOT_HEIGHT } from "./constants";
import type { OverflowBadge } from "./utils";
import { fmtTime } from "./utils";

interface OverflowBadgeCardProps {
  badge: OverflowBadge;
  onClick: (badge: OverflowBadge) => void;
  gapPx?: number;
}

/**
 * Компактная карточка-индикатор «+N» в зоне переполнения (последняя
 * колонка кластера, где больше событий, чем влезает по ширине).
 *
 * Визуально: серый/нейтральный фон, шрифт чуть крупнее обычного события,
 * выделяется штриховкой по правому краю — даёт понять, что есть «ещё».
 *
 * Клик передаётся наверх; обычно открывает `DayDetailsPanel` или попап
 * со списком скрытых событий.
 */
export function OverflowBadgeCard({ badge, onClick, gapPx = 2 }: OverflowBadgeCardProps) {
  const startMin = (badge.start.getHours() - HOUR_START) * 60 + badge.start.getMinutes();
  const endMin = (badge.end.getHours() - HOUR_START) * 60 + badge.end.getMinutes();
  const top = (startMin * SLOT_HEIGHT) / 60;
  const height = Math.max(22, ((endMin - startMin) * SLOT_HEIGHT) / 60);

  // Cascade-расчёт: badge.col = последний видимый уровень, clusterCols = K.
  // Бейдж занимает позицию K-1 уровня и упирается в правый край.
  const leftPct = (badge.col / badge.clusterCols) * 100;

  return (
    <button
      type="button"
      onClick={(ev) => {
        ev.stopPropagation();
        onClick(badge);
      }}
      title={`Ещё ${badge.count} событий · ${fmtTime(badge.start)}–${fmtTime(badge.end)}`}
      aria-label={`Показать ещё ${badge.count} событий`}
      className="group absolute flex flex-col items-center justify-center overflow-hidden rounded-[4px] border border-dashed border-gray-400 bg-gray-100 text-center text-gray-700 transition-shadow hover:z-50 hover:bg-gray-200 hover:shadow-md focus:z-50 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/40"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `${leftPct}%`,
        width: `calc(${100 - leftPct}% - ${gapPx}px)`,
        zIndex: 5,
      }}
    >
      <span className="text-[12px] font-semibold leading-tight">+{badge.count}</span>
      {height >= 36 && <span className="text-[10px] leading-tight opacity-70">ещё</span>}
    </button>
  );
}
