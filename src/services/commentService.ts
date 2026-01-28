import { 
  collection,
  doc, 
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { Comment, CreateCommentData } from '../types';
import { createCommentNotification } from './notificationService';

/**
 * טעינת תגובות של פוסט
 */
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  const commentsRef = collection(db, 'posts', postId, 'comments');
  const q = query(
    commentsRef,
    where('isDeleted', '==', false),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      postId: postId,
      authorId: data.authorId,
      authorName: data.authorName || 'משתמש אנונימי',
      authorPhotoURL: data.authorPhotoURL,
      content: data.content,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      isDeleted: data.isDeleted || false,
    };
  });
};

/**
 * יצירת תגובה חדשה
 */
export const createComment = async (data: CreateCommentData): Promise<string> => {
  const commentsRef = collection(db, 'posts', data.postId, 'comments');
  const postRef = doc(db, 'posts', data.postId);
  
  // יצירת התגובה
  const commentData = {
    authorId: data.authorId,
    authorName: data.authorName,
    authorPhotoURL: data.authorPhotoURL || '',
    content: data.content,
    createdAt: serverTimestamp(),
    isDeleted: false,
  };
  
  const docRef = await addDoc(commentsRef, commentData);
  
  // עדכון מונה התגובות בפוסט
  await updateDoc(postRef, {
    commentCount: increment(1)
  });
  
  // יצירת התראה לבעל הפוסט
  try {
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      const postAuthorId = postData.authorId;
      
      // יצירת התראה רק אם המגיב הוא לא בעל הפוסט
      if (postAuthorId && postAuthorId !== data.authorId) {
        await createCommentNotification(
          postAuthorId,
          data.authorId,
          data.authorName,
          data.authorPhotoURL,
          data.postId,
          docRef.id
        );
      }
    }
  } catch {
    // אם יצירת ההתראה נכשלה, לא נכשיל את כל הפעולה
    console.error('Failed to create comment notification');
  }
  
  return docRef.id;
};
