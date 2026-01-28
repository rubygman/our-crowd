import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../hooks';
import { 
  getUserNotifications, 
  markNotificationAsRead,
  markAllNotificationsAsRead 
} from '../services';
import { NotificationItem, LoadingSpinner, EmptyState } from '../components';
import { Notification } from '../types';
import { getFirebaseErrorMessage, extractErrorCode, MESSAGES } from '../utils';
import './NotificationsPage.css';

function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');
      
      const notificationsData = await getUserNotifications(user.uid);
      setNotifications(notificationsData);
    } catch (err) {
      const errorCode = extractErrorCode(err);
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!user) return;

    // סימון כנקראה
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(user.uid, notification.id);
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      } catch {
        // ממשיכים גם אם השמירה נכשלה
      }
    }

    // מעבר לפוסט אם קיים
    if (notification.postId) {
      navigate(`/post/${notification.postId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await markAllNotificationsAsRead(user.uid);
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (err) {
      const errorCode = extractErrorCode(err);
      showError(getFirebaseErrorMessage(errorCode));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="page notifications-page">
        <div className="container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="טוען התראות..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page notifications-page">
      <div className="container">
        <div className="notifications-header">
          <div className="header-title-section">
            <h1 className="notifications-title">התראות</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} חדשות</span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button 
              type="button"
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
            >
              סמן הכל כנקרא
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <EmptyState
              icon="🔔"
              title={MESSAGES.INFO.NO_NOTIFICATIONS}
              description="כשמישהו יגיב או יעשה לייק לפוסטים שלך, תראה את זה כאן"
            />
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
