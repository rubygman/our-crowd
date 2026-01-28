import { User as FirebaseUser } from 'firebase/auth';

// טיפוס משתמש Firebase
export type AuthUser = FirebaseUser | null;

// מצב האימות
export interface AuthState {
  user: AuthUser;
  loading: boolean;
}

// תפקיד משתמש
export type UserRole = 'user' | 'moderator' | 'admin';

// פרופיל משתמש מלא ב-Firestore
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  favoriteTeamIds: string[];
  joinedCommunityIds: string[];
  createdAt: Date;
  lastActiveAt: Date;
  role: UserRole;
  blockedUserIds: string[];
}

// נתונים ליצירת פרופיל חדש
export interface CreateUserProfileData {
  uid: string;
  email: string;
}
