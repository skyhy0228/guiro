# 운영 전 검증 시나리오

1. 사용자 A가 2026-09-29 13:00을 예약하면 성공해야 한다.
2. 사용자 B가 같은 슬롯을 동시에 예약하면 transaction 또는 representative lock/slot update 규칙으로 실패해야 한다.
3. 사용자 A와 같은 전화번호로 14:00을 예약하면 `representativeLocks/{phoneHash}` 생성 충돌로 실패해야 한다.
4. 사용자 A가 예약을 14:00으로 변경하면 기존 13:00은 `available`, 14:00은 `reserved`가 되어야 한다.
5. 사용자 A가 취소하면 해당 슬롯은 `available`이 되고 대표자 lock 문서는 삭제되어 같은 전화번호로 다시 예약할 수 있어야 한다.
6. 2명 예약금은 2,000원, 6명 예약금은 6,000원으로 표시되어야 한다.
7. 1명 또는 7명은 UI와 validation에서 예약할 수 없어야 한다.
8. 일반 사용자가 DevTools로 `paymentStatus = "confirmed"`를 쓰면 Firestore Rules가 거부해야 한다.
9. 일반 사용자의 전체 `bookings` list/query 요청은 거부되어야 한다.
10. `admins/{uid}` 문서가 있는 관리자만 전체 예약 목록을 볼 수 있어야 한다.
11. 예약 현황 화면은 `slots`만 읽고 `bookings` collection을 내려받지 않아야 한다.
12. 기존 형식의 5자리 예약번호만으로 예약 관리 코드 없이 조회되어야 한다.
13. 일반 사용자의 정확한 `bookingLookups/{bookingCode}` 문서 조회는 허용되지만 전체 list/query 요청은 거부되어야 한다.
