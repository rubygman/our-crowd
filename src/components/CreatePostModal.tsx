import { useState } from 'react';
import { POST_MAX_LENGTH } from '../types';
import './CreatePostModal.css';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  communityName: string;
}

function CreatePostModal({ isOpen, onClose, onSubmit, communityName }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= POST_MAX_LENGTH) {
      setContent(value);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('נא לכתוב תוכן לפוסט');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(content.trim());
      setContent('');
      onClose();
    } catch {
      setError('שגיאה בפרסום הפוסט. נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContent('');
      setError('');
      onClose();
    }
  };

  const remainingChars = POST_MAX_LENGTH - content.length;
  const isNearLimit = remainingChars <= 100;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">פוסט חדש</h2>
          <span className="modal-subtitle">ב{communityName}</span>
          <button 
            type="button" 
            className="modal-close" 
            onClick={handleClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <textarea
            className="post-textarea"
            value={content}
            onChange={handleContentChange}
            placeholder="מה בראש שלך?"
            disabled={loading}
            autoFocus
          />
          
          <div className={`char-counter ${isNearLimit ? 'near-limit' : ''}`}>
            {remainingChars} תווים נותרו
          </div>

          {error && <div className="modal-error">{error}</div>}
        </div>

        <div className="modal-footer">
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
            className="btn-submit" 
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
          >
            {loading ? 'מפרסם...' : 'פרסם'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;
