import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, CreateUserProfileData } from '../types';

/**
 * בדיקה האם קיים פרופיל משתמש ב-Firestore
 */
export const checkUserProfileExists = async (uid: string): Promise<boolean> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists();
};

/**
 * קבלת פרופיל משתמש מ-Firestore
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  const data = userSnap.data();
  
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    favoriteTeamIds: data.favoriteTeamIds || [],
    joinedCommunityIds: data.joinedCommunityIds || [],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    lastActiveAt: data.lastActiveAt instanceof Timestamp ? data.lastActiveAt.toDate() : new Date(data.lastActiveAt),
    role: data.role || 'user',
    blockedUserIds: data.blockedUserIds || [],
  };
};

/**
 * יצירת פרופיל משתמש חדש ב-Firestore
 */
export const createUserProfile = async (data: CreateUserProfileData): Promise<void> => {
  const userRef = doc(db, 'users', data.uid);
  
  await setDoc(userRef, {
    uid: data.uid,
    email: data.email,
    displayName: '',
    photoURL: '',
    favoriteTeamIds: [],
    joinedCommunityIds: [],
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
    role: 'user',
    blockedUserIds: [],
  });
};

/**
 * עדכון פרופיל משתמש
 */
export const updateUserProfile = async (
  uid: string, 
  updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  
  await updateDoc(userRef, {
    ...updates,
    lastActiveAt: serverTimestamp(),
  });
};

/**
 * עדכון זמן פעילות אחרון
 */
export const updateLastActive = async (uid: string): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { lastActiveAt: serverTimestamp() }, { merge: true });
};

/**
 * חסימת משתמש
 */
export const blockUser = async (uid: string, userIdToBlock: string): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    blockedUserIds: arrayUnion(userIdToBlock)
  });
};

/**
 * ביטול חסימת משתמש
 */
export const unblockUser = async (uid: string, userIdToUnblock: string): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    blockedUserIds: arrayRemove(userIdToUnblock)
  });
};

/**
 * בדיקה אם משתמש חסום
 */
export const isUserBlocked = async (uid: string, targetUserId: string): Promise<boolean> => {
  const profile = await getUserProfile(uid);
  return profile?.blockedUserIds?.includes(targetUserId) || false;
};

/**
 * קבלת רשימת המשתמשים החסומים
 */
export const getBlockedUsers = async (uid: string): Promise<string[]> => {
  const profile = await getUserProfile(uid);
  return profile?.blockedUserIds || [];
};
