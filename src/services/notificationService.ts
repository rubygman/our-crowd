import { 
  collection,
  doc, 
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Notification, NotificationType } from '../types';

/**
 * נתונים ליצירת התראה
 */
export interface CreateNotificationData {
  type: NotificationType;
  toUserId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserPhotoURL?: string;
  postId?: string;
  commentId?: string;
}

/**
 * יצירת התראה חדשה
 * מבנה המסמך תואם ל-firestore.rules
 */
export const createNotification = async (data: CreateNotificationData): Promise<void> => {
  // לא יוצרים התראה למשתמש על פעולות שלו עצמו
  if (data.toUserId === data.fromUserId) {
    return;
  }

  // ולידציה של סוג ההתראה - חייב להיות מסוג מותר
  const validTypes: NotificationType[] = ['like', 'comment', 'mention'];
  if (!validTypes.includes(data.type)) {
    console.error('Invalid notification type:', data.type);
    return;
  }

  const notificationsRef = collection(db, 'users', data.toUserId, 'notifications');
  
  const message = getDefaultMessage(data.type, data.fromUserName);
  
  // מבנה המסמך תואם ל-firestore.rules:
  // - fromUserId == request.auth.uid (נאכף בצד הלקוח)
  // - type in ['like', 'comment', 'mention']
  // - isRead == false
  await addDoc(notificationsRef, {
    type: data.type,
    fromUserId: data.fromUserId,
    fromUserName: data.fromUserName,
    fromUserPhotoURL: data.fromUserPhotoURL || '',
    postId: data.postId || '',
    commentId: data.commentId || '',
    message,
    isRead: false, // חייב להיות false לפי rules
    createdAt: serverTimestamp(),
  });
};

/**
 * יצירת התראת תגובה
 */
export const createCommentNotification = async (
  postAuthorId: string,
  commenterId: string,
  commenterName: string,
  commenterPhotoURL: string | undefined,
  postId: string,
  commentId: string
): Promise<void> => {
  await createNotification({
    type: 'comment',
    toUserId: postAuthorId,
    fromUserId: commenterId,
    fromUserName: commenterName,
    fromUserPhotoURL: commenterPhotoURL,
    postId,
    commentId,
  });
};

/**
 * יצירת התראת לייק
 */
export const createLikeNotification = async (
  postAuthorId: string,
  likerId: string,
  likerName: string,
  likerPhotoURL: string | undefined,
  postId: string
): Promise<void> => {
  await createNotification({
    type: 'like',
    toUserId: postAuthorId,
    fromUserId: likerId,
    fromUserName: likerName,
    fromUserPhotoURL: likerPhotoURL,
    postId,
  });
};

/**
 * טעינת התראות של משתמש
 */
export const getUserNotifications = async (uid: string): Promise<Notification[]> => {
  const notificationsRef = collection(db, 'users', uid, 'notifications');
  const q = query(
    notificationsRef,
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      type: data.type,
      fromUserId: data.fromUserId,
      fromUserName: data.fromUserName || 'משתמש',
      fromUserPhotoURL: data.fromUserPhotoURL,
      postId: data.postId,
      commentId: data.commentId,
      message: data.message || getDefaultMessage(data.type, data.fromUserName),
      isRead: data.isRead || false,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    };
  });
};

/**
 * סימון התראה כנקראה
 */
export const markNotificationAsRead = async (
  uid: string, 
  notificationId: string
): Promise<void> => {
  const notificationRef = doc(db, 'users', uid, 'notifications', notificationId);
  await updateDoc(notificationRef, { isRead: true });
};

/**
 * סימון כל ההתראות כנקראו
 */
export const markAllNotificationsAsRead = async (uid: string): Promise<void> => {
  const notificationsRef = collection(db, 'users', uid, 'notifications');
  const q = query(
    notificationsRef,
    where('isRead', '==', false)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return;
  
  const batch = writeBatch(db);
  
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { isRead: true });
  });
  
  await batch.commit();
};

/**
 * קבלת מספר ההתראות שלא נקראו
 */
export const getUnreadNotificationsCount = async (uid: string): Promise<number> => {
  const notificationsRef = collection(db, 'users', uid, 'notifications');
  const q = query(
    notificationsRef,
    where('isRead', '==', false)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.size;
};

/**
 * יצירת הודעת ברירת מחדל לפי סוג ההתראה
 */
const getDefaultMessage = (type: string, fromUserName: string): string => {
  switch (type) {
    case 'like':
      return `${fromUserName} עשה לייק לפוסט שלך`;
    case 'comment':
      return `${fromUserName} הגיב לפוסט שלך`;
    case 'follow':
      return `${fromUserName} התחיל לעקוב אחריך`;
    case 'mention':
      return `${fromUserName} הזכיר אותך בפוסט`;
    default:
      return 'יש לך התראה חדשה';
  }
};
