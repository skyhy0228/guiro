import { Copy } from 'lucide-react';
import { ACCOUNT } from '../config/event';
import { copyAccountToClipboard } from '../services/bookingService';
import { formatCurrency } from '../utils/format';

export function AccountBox({ teamSize, expectedDeposit }: { teamSize: number; expectedDeposit: number }) {
  return (
    <aside className="account-box">
      <p className="notice-strong">예약 인원 1인당 1,000원의 예약금을 아래 계좌로 입금해야 최종 예약이 완료됩니다.</p>
      <dl>
        <div>
          <dt>예약 인원</dt>
          <dd>{teamSize}명</dd>
        </div>
        <div>
          <dt>입금하실 예약금</dt>
          <dd>{formatCurrency(expectedDeposit)}</dd>
        </div>
        <div>
          <dt>입금 계좌</dt>
          <dd>
            {ACCOUNT.bank} {ACCOUNT.number}
            <br />
            예금주 {ACCOUNT.holder}
          </dd>
        </div>
      </dl>
      <button className="secondary-button" type="button" onClick={() => void copyAccountToClipboard()}>
        <Copy size={18} aria-hidden="true" />
        계좌번호 복사
      </button>
    </aside>
  );
}
