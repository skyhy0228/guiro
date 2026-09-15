import type { EventDate } from '../types/reservation';

export const EVENT_NAME = '귀로';
export const ORGANIZERS = '총동아리연합회 X 사랑방 극 예술연구회';
export const EVENT_DATES: EventDate[] = ['2026-09-29', '2026-09-30'];
export const EVENT_TIMES = [
  '13:00',
  '13:15',
  '13:30',
  '13:45',
  '14:00',
  '14:15',
  '14:30',
  '14:45',
  '15:00',
  '15:15',
  '15:30',
  '15:45',
  '16:00',
  '16:15',
  '16:30',
  '16:45',
] as const;

export const MIN_TEAM_SIZE = 2;
export const MAX_TEAM_SIZE = 6;
export const DEPOSIT_PER_PERSON = 1000;
export const ACCOUNT = {
  bank: '농협',
  number: '351-0966-6520-73',
  holder: '이호열',
};
export const PRIVACY_RETENTION_LABEL = '행사 운영 종료 후 운영진이 정한 정리 시점까지';

export function slotId(date: EventDate, time: string) {
  return `${date}_${time.replace(':', '-')}`;
}

export function formatKoreanDate(date: EventDate) {
  const [, month, day] = date.split('-');
  return `2026년 ${Number(month)}월 ${Number(day)}일`;
}
