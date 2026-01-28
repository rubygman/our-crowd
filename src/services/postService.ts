import { 
  collection,
  doc, 
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { Post, CreatePostData } from '../types';
import { createLikeNotification } from './notificationService';

const FEED_PAGE_SIZE = 20;

/**
 * המרת מסמך Firestore לאובייקט Post
 */
const docToPost = (docSnap: DocumentSnapshot): Post => {
  const data = docSnap.data()!;
  return {
    id: docSnap.id,
    communityId: data.communityId,
    authorId: data.authorId,
    authorName: data.authorName || 'משתמש אנונימי',
    authorPhotoURL: data.authorPhotoURL,
    content: data.content,
    imageURL: data.imageURL,
    likeCount: data.likeCount || 0,
    commentCount: data.commentCount || 0,
    isDeleted: data.isDeleted || false,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
  };
};

/**
 * טעינת פוסט בודד
 */
export const getPost = async (postId: string): Promise<Post | null> => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) {
    return null;
  }
  
  return docToPost(postSnap);
};

/**
 * טעינת פוסטים של קהילה
 */
export const getCommunityPosts = async (communityId: string): Promise<Post[]> => {
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('communityId', '==', communityId),
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToPost);
};

/**
 * תוצאת פיד עם תמיכה בדפדוף
 */
export interface FeedResult {
  posts: Post[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * טעינת פיד לפי קהילות המשתמש
 */
export const getFeedPosts = async (
  communityIds: string[],
  lastDocument?: DocumentSnapshot | null
): Promise<FeedResult> => {
  // אם אין קהילות, החזר רשימה ריקה
  if (communityIds.length === 0) {
    return { posts: [], lastDoc: null, hasMore: false };
  }

  const postsRef = collection(db, 'posts');
  
  // Firestore מגביל ל-10 ערכים ב-'in' query
  const limitedCommunityIds = communityIds.slice(0, 10);
  
  let q = query(
    postsRef,
    where('communityId', 'in', limitedCommunityIds),
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc'),
    limit(FEED_PAGE_SIZE)
  );
  
  // אם יש מסמך אחרון, המשך ממנו
  if (lastDocument) {
    q = query(
      postsRef,
      where('communityId', 'in', limitedCommunityIds),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc'),
      startAfter(lastDocument),
      limit(FEED_PAGE_SIZE)
    );
  }
  
  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(docToPost);
  const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  
  return {
    posts,
    lastDoc: newLastDoc,
    hasMore: snapshot.docs.length === FEED_PAGE_SIZE,
  };
};

/**
 * יצירת פוסט חדש
 */
export const createPost = async (data: CreatePostData): Promise<string> => {
  const postsRef = collection(db, 'posts');
  
  const postData = {
    communityId: data.communityId,
    authorId: data.authorId,
    authorName: data.authorName,
    authorPhotoURL: data.authorPhotoURL || '',
    content: data.content,
    imageURL: '',
    likeCount: 0,
    commentCount: 0,
    isDeleted: false,
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(postsRef, postData);
  return docRef.id;
};

/**
 * Toggle לייק עם טרנזקציה
 * מחזיר האם עכשיו יש לייק או לא
 */
export const toggleLike = async (
  postId: string, 
  userId: string,
  userName?: string,
  userPhotoURL?: string
): Promise<boolean> => {
  const likeRef = doc(db, 'posts', postId, 'likes', userId);
  const postRef = doc(db, 'posts', postId);
  
  // שמירת מידע על הפוסט ליצירת התראה
  let postAuthorId: string | null = null;
  
  const isNowLiked = await runTransaction(db, async (transaction) => {
    const likeSnap = await transaction.get(likeRef);
    const postSnap = await transaction.get(postRef);
    
    if (!postSnap.exists()) {
      throw new Error('הפוסט לא נמצא');
    }
    
    const postData = postSnap.data();
    postAuthorId = postData.authorId;
    const currentLikeCount = postData.likeCount || 0;
    
    if (likeSnap.exists()) {
      // הסרת לייק - לא יוצרים התראה
      transaction.delete(likeRef);
      transaction.update(postRef, {
        likeCount: Math.max(0, currentLikeCount - 1)
      });
      return false;
    } else {
      // הוספת לייק
      transaction.set(likeRef, {
        userId,
        createdAt: serverTimestamp(),
      });
      transaction.update(postRef, {
        likeCount: currentLikeCount + 1
      });
      return true;
    }
  });
  
  // יצירת התראה רק בהוספת לייק (ולא בהסרה)
  if (isNowLiked && postAuthorId && postAuthorId !== userId && userName) {
    try {
      await createLikeNotification(
        postAuthorId,
        userId,
        userName,
        userPhotoURL,
        postId
      );
    } catch {
      // אם יצירת ההתראה נכשלה, לא נכשיל את כל הפעולה
      console.error('Failed to create like notification');
    }
  }
  
  return isNowLiked;
};

/**
 * הוספת לייק לפוסט (ישנה - לתאימות אחורה)
 */
export const likePost = async (
  postId: string, 
  userId: string,
  userName?: string,
  userPhotoURL?: string
): Promise<void> => {
  const likeRef = doc(db, 'posts', postId, 'likes', userId);
  const likeSnap = await getDoc(likeRef);
  
  if (!likeSnap.exists()) {
    await toggleLike(postId, userId, userName, userPhotoURL);
  }
};

/**
 * הסרת לייק מפוסט (ישנה - לתאימות אחורה)
 */
export const unlikePost = async (postId: string, userId: string): Promise<void> => {
  const likeRef = doc(db, 'posts', postId, 'likes', userId);
  const likeSnap = await getDoc(likeRef);
  
  if (likeSnap.exists()) {
    // לא מעבירים שם משתמש כי לא רוצים ליצור התראה בזמן unlike
    await toggleLike(postId, userId);
  }
};

/**
 * בדיקה אם משתמש עשה לייק לפוסט
 */
export const checkUserLiked = async (postId: string, userId: string): Promise<boolean> => {
  const likeRef = doc(db, 'posts', postId, 'likes', userId);
  const likeSnap = await getDoc(likeRef);
  return likeSnap.exists();
};

/**
 * בדיקת לייקים למספר פוסטים
 */
export const checkUserLikedPosts = async (
  postIds: string[], 
  userId: string
): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {};
  
  await Promise.all(
    postIds.map(async (postId) => {
      results[postId] = await checkUserLiked(postId, userId);
    })
  );
  
  return results;
};
