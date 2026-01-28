// סוג התראה
export type NotificationType = 'like' | 'comment' | 'follow' | 'mention';

// התראה
export interface Notification {
  id: string;
  type: NotificationType;
  fromUserId: string;
  fromUserName: string;
  fromUserPhotoURL?: string;
  postId?: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
