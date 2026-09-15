import { X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel, busy, onConfirm, onClose }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="닫기">
          <X size={20} aria-hidden="true" />
        </button>
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose} disabled={busy}>
            돌아가기
          </button>
          <button className="danger-button" type="button" onClick={onConfirm} disabled={busy}>
            {busy ? '처리 중...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
