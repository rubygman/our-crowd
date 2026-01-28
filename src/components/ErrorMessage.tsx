import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-message-box">
      <div className="error-icon">⚠️</div>
      <p className="error-text">{message}</p>
      {onRetry && (
        <button type="button" className="retry-btn" onClick={onRetry}>
          נסה שוב
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
