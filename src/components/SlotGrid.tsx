import type { EventDate, Slot } from '../types/reservation';
import { formatKoreanDate } from '../config/event';
import { slotStatusLabel } from '../utils/format';

interface SlotGridProps {
  date: EventDate;
  slots: Slot[];
  selectedTime: string;
  heading?: string;
  onSelect: (time: string) => void;
}

export function SlotGrid({ date, slots, selectedTime, heading, onSelect }: SlotGridProps) {
  return (
    <section className="flow-section" aria-labelledby={`slot-${date}`}>
      <h2 id={`slot-${date}`}>{heading || `${formatKoreanDate(date)} 시간 선택`}</h2>
      {heading && <p className="slot-date">{formatKoreanDate(date)}</p>}
      <div className="slot-grid">
        {slots.map((slot) => {
          const disabled = slot.status !== 'available';
          const selected = selectedTime === slot.time;
          return (
            <button
              type="button"
              key={slot.id}
              className={`slot-button ${slot.status} ${selected ? 'selected' : ''}`}
              disabled={disabled}
              onClick={() => onSelect(slot.time)}
              aria-pressed={selected}
            >
              <strong>{slot.time}</strong>
              <span>{slot.clientStatusLabel || slotStatusLabel(slot.status)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
