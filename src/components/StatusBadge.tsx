import type { BookingStatus, PaymentStatus, SlotStatus } from '../types/reservation';
import { bookingStatusLabel, paymentStatusLabel, slotStatusLabel } from '../utils/format';

type BadgeKind = BookingStatus | PaymentStatus | SlotStatus;

export function StatusBadge({ status }: { status: BadgeKind }) {
  const label =
    status === 'available' || status === 'reserved' || status === 'blocked'
      ? slotStatusLabel(status)
      : status === 'unverified' || status === 'needs_review'
        ? paymentStatusLabel(status)
        : status === 'confirmed'
          ? '확정 / 확인 완료'
          : bookingStatusLabel(status);

  return <span className={`status-badge status-${status}`}>{label}</span>;
}
