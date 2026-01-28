// סוג דיווח
export type ReportType = 'post' | 'comment' | 'user';

// סיבת דיווח
export type ReportReason = 
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'inappropriate'
  | 'violence'
  | 'other';

// דיווח
export interface Report {
  id: string;
  type: ReportType;
  targetId: string;           // ID של הפוסט/תגובה/משתמש
  targetAuthorId?: string;    // ID של כותב התוכן
  reporterId: string;
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}

// נתונים ליצירת דיווח
export interface CreateReportData {
  type: ReportType;
  targetId: string;
  targetAuthorId?: string;
  reporterId: string;
  reason: ReportReason;
  description?: string;
}

// סיבות דיווח בעברית
export const REPORT_REASONS: Record<ReportReason, string> = {
  spam: 'ספאם',
  harassment: 'הטרדה',
  hate_speech: 'דברי שנאה',
  inappropriate: 'תוכן לא הולם',
  violence: 'אלימות',
  other: 'אחר',
};
