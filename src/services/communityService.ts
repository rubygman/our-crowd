import { 
  doc, 
  getDoc,
  serverTimestamp,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { Community } from '../types';

/**
 * טעינת נתוני קהילה
 */
export const getCommunity = async (communityId: string): Promise<Community | null> => {
  const communityRef = doc(db, 'communities', communityId);
  const communitySnap = await getDoc(communityRef);
  
  if (!communitySnap.exists()) {
    return null;
  }
  
  const data = communitySnap.data();
  
  return {
    id: communitySnap.id,
    name: data.name || '',
    description: data.description || '',
    teamId: data.teamId,
    imageURL: data.imageURL,
    memberCount: data.memberCount || 0,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
  };
};

/**
 * בדיקה אם משתמש חבר בקהילה
 */
export const checkMembership = async (
  communityId: string, 
  uid: string
): Promise<boolean> => {
  const memberRef = doc(db, 'communities', communityId, 'members', uid);
  const memberSnap = await getDoc(memberRef);
  return memberSnap.exists();
};

/**
 * הצטרפות לקהילה - פעולה אטומית עם runTransaction
 * מונע כפילויות: אם כבר חבר - לא עושה כלום
 */
export const joinCommunity = async (
  uid: string,
  communityId: string
): Promise<void> => {
  const memberRef = doc(db, 'communities', communityId, 'members', uid);
  const userRef = doc(db, 'users', uid);
  const communityRef = doc(db, 'communities', communityId);
  
  await runTransaction(db, async (transaction) => {
    // בדיקה אם כבר חבר
    const memberSnap = await transaction.get(memberRef);
    if (memberSnap.exists()) {
      // כבר חבר - לא עושים כלום (no-op)
      return;
    }
    
    // קריאת המשתמש והקהילה
    const userSnap = await transaction.get(userRef);
    const communitySnap = await transaction.get(communityRef);
    
    if (!communitySnap.exists()) {
      throw new Error('הקהילה לא נמצאה');
    }
    
    // הוספת המשתמש כחבר בקהילה
    transaction.set(memberRef, {
      uid,
      joinedAt: serverTimestamp(),
      role: 'member',
    });
    
    // עדכון רשימת הקהילות של המשתמש
    const currentCommunityIds = userSnap.exists() 
      ? (userSnap.data().joinedCommunityIds || [])
      : [];
    
    if (!currentCommunityIds.includes(communityId)) {
      transaction.update(userRef, {
        joinedCommunityIds: [...currentCommunityIds, communityId],
        lastActiveAt: serverTimestamp(),
      });
    }
    
    // עדכון מספר החברים בקהילה
    const currentMemberCount = communitySnap.data().memberCount || 0;
    transaction.update(communityRef, {
      memberCount: currentMemberCount + 1,
    });
  });
};

/**
 * עזיבת קהילה - פעולה אטומית עם runTransaction
 * מונע מינוס: אם לא חבר - לא עושה כלום
 */
export const leaveCommunity = async (
  uid: string,
  communityId: string
): Promise<void> => {
  const memberRef = doc(db, 'communities', communityId, 'members', uid);
  const userRef = doc(db, 'users', uid);
  const communityRef = doc(db, 'communities', communityId);
  
  await runTransaction(db, async (transaction) => {
    // בדיקה אם באמת חבר
    const memberSnap = await transaction.get(memberRef);
    if (!memberSnap.exists()) {
      // לא חבר - לא עושים כלום (no-op)
      return;
    }
    
    // קריאת המשתמש והקהילה
    const userSnap = await transaction.get(userRef);
    const communitySnap = await transaction.get(communityRef);
    
    // הסרת המשתמש מחברי הקהילה
    transaction.delete(memberRef);
    
    // עדכון רשימת הקהילות של המשתמש
    if (userSnap.exists()) {
      const currentCommunityIds = userSnap.data().joinedCommunityIds || [];
      const updatedCommunityIds = currentCommunityIds.filter(
        (id: string) => id !== communityId
      );
      transaction.update(userRef, {
        joinedCommunityIds: updatedCommunityIds,
        lastActiveAt: serverTimestamp(),
      });
    }
    
    // עדכון מספר החברים בקהילה (מינימום 0)
    if (communitySnap.exists()) {
      const currentMemberCount = communitySnap.data().memberCount || 0;
      transaction.update(communityRef, {
        memberCount: Math.max(0, currentMemberCount - 1),
      });
    }
  });
};

/**
 * הוספת משתמש כחבר בקהילה
 * @deprecated השתמש ב-joinCommunity במקום
 */
export const addMemberToCommunity = async (
  communityId: string, 
  uid: string
): Promise<void> => {
  await joinCommunity(uid, communityId);
};

/**
 * הסרת משתמש מקהילה
 * @deprecated השתמש ב-leaveCommunity במקום
 */
export const removeMemberFromCommunity = async (
  communityId: string, 
  uid: string
): Promise<void> => {
  await leaveCommunity(uid, communityId);
};

/**
 * המרת teamId ל-communityId
 */
export const getTeamCommunityId = (teamId: string): string => {
  return `team_${teamId}`;
};
