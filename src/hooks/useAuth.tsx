import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from '../services/firebase';
import { AuthUser, AuthState } from '../types';

// ממשק הקונטקסט
interface AuthContextType extends AuthState {
  // פונקציות נוספות יתווספו בהמשך אם יידרש
}

// יצירת הקונטקסט
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props של הספק
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * ספק הקונטקסט לאימות
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // האזנה לשינויים במצב האימות
    const unsubscribe = onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // ניקוי ההאזנה בעת פירוק הקומפוננטה
    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * הוק לשימוש בקונטקסט האימות
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth חייב להיות בתוך AuthProvider');
  }
  
  return context;
}
