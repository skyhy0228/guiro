import { DEPOSIT_PER_PERSON } from '../config/event';
import type { BookingStatus, PaymentStatus, SlotStatus } from '../types/reservation';

export function formatCurrency(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}

export function calculateDeposit(teamSize: number) {
  return teamSize * DEPOSIT_PER_PERSON;
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '');
}

export function formatPhone(phone: string) {
  const digits = normalizePhone(phone).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function slotStatusLabel(status: SlotStatus) {
  return status === 'available' ? '예약 가능' : status === 'reserved' ? '예약 완료' : '운영진 차단';
}

export function bookingStatusLabel(status: BookingStatus) {
  const labels: Record<BookingStatus, string> = {
    submitted: '예약 접수',
    confirmed: '예약 확정',
    cancelled: '예약 취소',
  };
  return labels[status];
}

export function paymentStatusLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    unverified: '입금 확인 전',
    confirmed: '입금 확인 완료',
    needs_review: '변경사항 확인 필요',
  };
  return labels[status];
}
