import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks';

/**
 * רכיב לנתיבים ציבוריים - מפנה לפיד אם המשתמש כבר מחובר
 */
function PublicRoute() {
  const { user, loading } = useAuth();

  // מציג מסך טעינה בזמן בדיקת מצב האימות
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>טוען...</p>
      </div>
    );
  }

  // אם מחובר - מפנה לפיד
  if (user) {
    return <Navigate to="/feed" replace />;
  }

  // אם לא מחובר - מציג את התוכן
  return <Outlet />;
}

export default PublicRoute;
