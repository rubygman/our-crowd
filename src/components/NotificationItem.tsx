import { Notification } from '../types';
import { formatRelativeTime } from '../utils';
import './NotificationItem.css';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const handleClick = () => {
    onClick(notification);
  };

  const getIcon = (): string => {
    switch (notification.type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      case 'mention':
        return '📣';
      default:
        return '🔔';
    }
  };

  return (
    <button
      type="button"
      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
      onClick={handleClick}
    >
      <div className="notification-icon">{getIcon()}</div>
      
      <div className="notification-avatar">
        {notification.fromUserPhotoURL ? (
          <img 
            src={notification.fromUserPhotoURL} 
            alt={notification.fromUserName} 
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            {notification.fromUserName.charAt(0)}
          </div>
        )}
      </div>
      
      <div className="notification-content">
        <p className="notification-message">{notification.message}</p>
        <span className="notification-time">{formatRelativeTime(notification.createdAt)}</span>
      </div>
      
      {!notification.isRead && <div className="unread-indicator" />}
    </button>
  );
}

export default NotificationItem;
