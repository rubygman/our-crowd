import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks';

/**
 * רכיב שמגן על נתיבים ומפנה ל-login אם המשתמש לא מחובר
 */
function ProtectedRoute() {
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

  // אם לא מחובר - מפנה לדף ההתחברות
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // אם מחובר - מציג את התוכן המבוקש
  return <Outlet />;
}

export default ProtectedRoute;
