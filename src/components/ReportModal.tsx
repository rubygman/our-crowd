import { useState } from 'react';
import { ReportReason, ReportType, REPORT_REASONS } from '../types';
import './ReportModal.css';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, description: string) => Promise<void>;
  type: ReportType;
}

function ReportModal({ isOpen, onClose, onSubmit, type }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const getTitle = (): string => {
    switch (type) {
      case 'post':
        return 'דיווח על פוסט';
      case 'comment':
        return 'דיווח על תגובה';
      case 'user':
        return 'דיווח על משתמש';
      default:
        return 'דיווח';
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReason(e.target.value as ReportReason);
    setError('');
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async () => {
    if (!reason) {
      setError('נא לבחור סיבה לדיווח');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(reason, description.trim());
      handleClose();
    } catch {
      setError('שגיאה בשליחת הדיווח. נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  return (
    <div className="report-modal-overlay" onClick={handleOverlayClick}>
      <div className="report-modal">
        <div className="report-modal-header">
          <h2 className="report-modal-title">{getTitle()}</h2>
          <button 
            type="button" 
            className="report-modal-close"
            onClick={handleClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="report-modal-body">
          <div className="form-group">
            <label htmlFor="report-reason">סיבת הדיווח</label>
            <select
              id="report-reason"
              value={reason}
              onChange={handleReasonChange}
              disabled={loading}
              className="report-select"
            >
              <option value="">בחר סיבה...</option>
              {Object.entries(REPORT_REASONS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="report-description">פרטים נוספים (אופציונלי)</label>
            <textarea
              id="report-description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="ספר לנו עוד על הבעיה..."
              disabled={loading}
              className="report-textarea"
              rows={3}
            />
          </div>

          {error && <div className="report-error">{error}</div>}
        </div>

        <div className="report-modal-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleClose}
            disabled={loading}
          >
            ביטול
          </button>
          <button
            type="button"
            className="btn-report"
            onClick={handleSubmit}
            disabled={loading || !reason}
          >
            {loading ? 'שולח...' : 'שלח דיווח'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
