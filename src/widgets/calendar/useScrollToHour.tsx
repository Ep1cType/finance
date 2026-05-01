"use client";

import { useEffect, useRef } from "react";

import { DEFAULT_SCROLL_HOUR, HOUR_START, SLOT_HEIGHT } from "./constants";
import { sameDay } from "./utils";

interface UseScrollToHourArgs {
  /** Сменяющий ключ — на его изменение реагирует скролл. Обычно это cursor.getTime() */
  resetKey: number;
  /** today — если он попадает в видимый диапазон, скролим к текущему часу */
  today: Date;
  /** Список дней, которые сейчас видны (1 для Day, 7 для Week) */
  visibleDays: Date[];
}

/**
 * Возвращает ref для скроллируемого контейнера часовой сетки.
 * При изменении `resetKey` (например, смены даты) скролит:
 *   - к (today.hour - 1), если today виден;
 *   - иначе к DEFAULT_SCROLL_HOUR (7:00).
 *
 * Используется только при программной смене даты — пользовательский скролл
 * не перебивается (хук вызывается только когда reset ключ меняется).
 */
export function useScrollToHour({ resetKey, today, visibleDays }: UseScrollToHourArgs) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const showsToday = visibleDays.some((d) => sameDay(d, today));
    const targetHour = showsToday ? Math.max(HOUR_START, today.getHours() - 1) : DEFAULT_SCROLL_HOUR;
    ref.current.scrollTop = (targetHour - HOUR_START) * SLOT_HEIGHT;
    // visibleDays и today обновляются вместе с resetKey — не добавляем их в deps,
    // чтобы избежать лишних скроллов на re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return ref;
}
