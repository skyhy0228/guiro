import { useEffect, useState } from 'react';
import { watchReservationSettings } from '../services/bookingService';
import type { ReservationSettings } from '../types/reservation';

export function useReservationSettings() {
  const [settings, setSettings] = useState<ReservationSettings>({ status: 'OPEN' });

  useEffect(() => {
    return watchReservationSettings(setSettings);
  }, []);

  return settings;
}
