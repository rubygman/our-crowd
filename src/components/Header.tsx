import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from '../services';
import './Header.css';

function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('שגיאה בהתנתקות:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <NavLink to="/feed">הקהל שלנו</NavLink>
        </div>
        <nav className="header-nav">
          <NavLink to="/feed" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            פיד
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            חיפוש
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            התראות
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            פרופיל
          </NavLink>
          <button onClick={handleLogout} className="nav-link logout-btn">
            התנתק
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
