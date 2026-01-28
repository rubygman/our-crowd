// פוסט
export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  imageURL?: string;
  likeCount: number;
  commentCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// נתונים ליצירת פוסט חדש
export interface CreatePostData {
  communityId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
}

// מגבלות פוסט
export const POST_MAX_LENGTH = 1500;
