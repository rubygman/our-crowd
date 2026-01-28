// תגובה
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: Date;
  isDeleted: boolean;
}

// נתונים ליצירת תגובה חדשה
export interface CreateCommentData {
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
}

// מגבלות תגובה
export const COMMENT_MAX_LENGTH = 500;
