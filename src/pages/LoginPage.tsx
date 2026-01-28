import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp, checkUserProfileExists, createUserProfile } from '../services';
import { getFirebaseErrorMessage, extractErrorCode } from '../utils';
import './LoginPage.css';

type AuthMode = 'login' | 'register';

function LoginPage() {
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const switchToLogin = () => {
    setMode('login');
    setError('');
    setConfirmPassword('');
  };

  const switchToRegister = () => {
    setMode('register');
    setError('');
  };

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('נא להזין כתובת אימייל');
      return false;
    }
    if (!password) {
      setError('נא להזין סיסמה');
      return false;
    }
    if (mode === 'register') {
      if (password.length < 6) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים');
        return false;
      }
      if (password !== confirmPassword) {
        setError('הסיסמאות אינן תואמות');
        return false;
      }
    }
    return true;
  };

  const handleAfterAuth = async (uid: string, userEmail: string, isNewUser: boolean) => {
    if (isNewUser) {
      // משתמש חדש - יצירת פרופיל והפניה ל-onboarding
      await createUserProfile({ uid, email: userEmail });
      navigate('/onboarding');
    } else {
      // משתמש קיים - בדיקה אם יש פרופיל
      const hasProfile = await checkUserProfileExists(uid);
      if (hasProfile) {
        navigate('/feed');
      } else {
        // אין פרופיל - יצירה והפניה ל-onboarding
        await createUserProfile({ uid, email: userEmail });
        navigate('/onboarding');
      }
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const user = await signIn(email, password);
      await handleAfterAuth(user.uid, user.email || email, false);
    } catch (err) {
      const errorCode = extractErrorCode(err);
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const user = await signUp(email, password);
      await handleAfterAuth(user.uid, user.email || email, true);
    } catch (err) {
      const errorCode = extractErrorCode(err);
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">הקהל שלנו</h1>
          <p className="login-subtitle">הרשת החברתית לאוהדי הכדורגל הישראלי</p>
        </div>

        <div className="login-tabs">
          <button 
            className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={switchToLogin}
            type="button"
          >
            התחברות
          </button>
          <button 
            className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={switchToRegister}
            type="button"
          >
            הרשמה
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">אימייל</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="הזן את האימייל שלך"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="הזן סיסמה"
              disabled={loading}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">אימות סיסמה</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="הזן את הסיסמה שנית"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'מעבד...' : mode === 'login' ? 'התחבר' : 'הירשם'}
          </button>
        </form>

        <div className="login-footer">
          {mode === 'login' ? (
            <p>
              אין לך חשבון?{' '}
              <button type="button" className="link-btn" onClick={switchToRegister}>
                הירשם עכשיו
              </button>
            </p>
          ) : (
            <p>
              כבר יש לך חשבון?{' '}
              <button type="button" className="link-btn" onClick={switchToLogin}>
                התחבר
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
