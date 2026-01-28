import { useState } from 'react';
import { COMMENT_MAX_LENGTH } from '../types';
import './CommentForm.css';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
}

function CommentForm({ onSubmit, disabled }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= COMMENT_MAX_LENGTH) {
      setContent(value);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('נא לכתוב תגובה');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(content.trim());
      setContent('');
    } catch {
      setError('שגיאה בשליחת התגובה. נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  const remainingChars = COMMENT_MAX_LENGTH - content.length;
  const isNearLimit = remainingChars <= 50;

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <div className="comment-input-wrapper">
        <textarea
          className="comment-input"
          value={content}
          onChange={handleContentChange}
          placeholder="כתוב תגובה..."
          disabled={disabled || loading}
          rows={2}
        />
        <div className="comment-form-footer">
          <span className={`char-count ${isNearLimit ? 'near-limit' : ''}`}>
            {remainingChars}
          </span>
          <button
            type="submit"
            className="submit-comment-btn"
            disabled={disabled || loading || !content.trim()}
          >
            {loading ? 'שולח...' : 'שלח'}
          </button>
        </div>
      </div>
      {error && <div className="comment-form-error">{error}</div>}
    </form>
  );
}

export default CommentForm;
