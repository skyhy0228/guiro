import { useEffect, useMemo, useState } from 'react';
import { EVENT_DATES, EVENT_TIMES, slotId } from '../config/event';
import type { EventDate, Slot } from '../types/reservation';
import { watchSlots } from '../services/bookingService';

export function useSlots() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    return watchSlots(setSlots, setError);
  }, []);

  const normalizedSlots = useMemo(() => {
    const slotMap = new Map(slots.map((slot) => [slot.id, slot]));
    return EVENT_DATES.flatMap((date) =>
      EVENT_TIMES.map((time) => {
        const id = slotId(date, time);
        return slotMap.get(id) || ({ id, date, time, status: 'available' } as Slot);
      }),
    );
  }, [slots]);

  const slotsByDate = useMemo(() => {
    return EVENT_DATES.reduce<Record<EventDate, Slot[]>>(
      (result, date) => {
        result[date] = normalizedSlots.filter((slot) => slot.date === date);
        return result;
      },
      { '2026-09-29': [], '2026-09-30': [] },
    );
  }, [normalizedSlots]);

  return { slots: normalizedSlots, slotsByDate, error };
}
