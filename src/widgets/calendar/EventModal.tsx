import { useEffect, useState } from "react";

import { COLOR_DOT_CLASSES, COLOR_OPTIONS } from "./constants";
import type { CalendarEvent, EventColor } from "./types";
import { fmtDateTimeLocal } from "./utils";

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onSave: (updated: CalendarEvent) => void;
}

export function EventModal({ event, onClose, onSave }: EventModalProps) {
  const [draft, setDraft] = useState<CalendarEvent | null>(event);

  // Синхронизируем локальный черновик при смене редактируемого события
  useEffect(() => {
    setDraft(event);
  }, [event]);

  if (!draft) return null;

  const update = <K extends keyof CalendarEvent>(key: K, value: CalendarEvent[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 z-[1000] flex items-center justify-center rounded-md bg-black/45 p-5"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-[380px] rounded-lg border-[0.5px] border-gray-200 bg-white px-[18px] py-4">
        {/* Шапка модалки: точка цвета + название + крестик */}
        <div className="mb-3.5 flex items-center gap-2.5">
          <span className={`inline-block h-2.5 w-2.5 flex-shrink-0 rounded-[2px] ${COLOR_DOT_CLASSES[draft.color]}`} />
          <input
            value={draft.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Название"
            className="h-8 flex-1 rounded border border-gray-200 px-2 text-sm font-medium outline-none focus:border-[#185FA5]"
          />
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-gray-200 text-gray-700 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="grid gap-2.5">
          {/* Весь день */}
          <label className="flex items-center gap-2 text-[13px]">
            <input type="checkbox" checked={!!draft.allDay} onChange={(e) => update("allDay", e.target.checked)} />
            <span>Весь день</span>
          </label>

          {/* Начало */}
          <ModalRow label="Начало">
            <input
              type="datetime-local"
              value={fmtDateTimeLocal(draft.start)}
              onChange={(e) => update("start", new Date(e.target.value))}
              className="h-8 w-full rounded border border-gray-200 px-2 text-[13px] outline-none focus:border-[#185FA5]"
            />
          </ModalRow>

          {/* Конец */}
          <ModalRow label="Конец">
            <input
              type="datetime-local"
              value={fmtDateTimeLocal(draft.end)}
              onChange={(e) => update("end", new Date(e.target.value))}
              className="h-8 w-full rounded border border-gray-200 px-2 text-[13px] outline-none focus:border-[#185FA5]"
            />
          </ModalRow>

          {/* Спикер */}
          <ModalRow label="Спикер">
            <input
              value={draft.speaker ?? ""}
              onChange={(e) => update("speaker", e.target.value)}
              className="h-8 w-full rounded border border-gray-200 px-2 text-[13px] outline-none focus:border-[#185FA5]"
            />
          </ModalRow>

          {/* Цвет */}
          <ModalRow label="Цвет">
            <select
              value={draft.color}
              onChange={(e) => update("color", e.target.value as EventColor)}
              className="h-8 w-full rounded border border-gray-200 bg-white px-2 text-[13px] outline-none focus:border-[#185FA5]"
            >
              {COLOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </ModalRow>

          {/* Выполнено */}
          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={!!draft.completed}
              onChange={(e) => update("completed", e.target.checked)}
            />
            <span>Выполнено</span>
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded border border-gray-200 px-3 text-[13px] hover:bg-gray-100"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="h-8 rounded bg-[#185FA5] px-3 text-[13px] text-white hover:bg-[#134c84]"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-2" style={{ gridTemplateColumns: "70px 1fr" }}>
      <span className="text-[12px] text-gray-500">{label}</span>
      {children}
    </div>
  );
}
