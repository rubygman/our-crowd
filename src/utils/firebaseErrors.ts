/**
 * מיפוי קודי שגיאה של Firebase להודעות בעברית
 */
const firebaseErrorMessages: Record<string, string> = {
  // שגיאות אימות - התחברות והרשמה
  'auth/invalid-email': 'כתובת האימייל אינה תקינה',
  'auth/user-disabled': 'החשבון הזה הושבת',
  'auth/user-not-found': 'לא נמצא משתמש עם אימייל זה',
  'auth/wrong-password': 'הסיסמה שגויה',
  'auth/email-already-in-use': 'כתובת האימייל כבר בשימוש',
  'auth/weak-password': 'הסיסמה חלשה מדי. נדרשות לפחות 6 תווים',
  'auth/operation-not-allowed': 'הפעולה לא מותרת',
  'auth/too-many-requests': 'יותר מדי ניסיונות. נסה שוב מאוחר יותר',
  'auth/network-request-failed': 'בעיית תקשורת. בדוק את החיבור לאינטרנט',
  'auth/invalid-credential': 'פרטי ההתחברות שגויים',
  'auth/invalid-login-credentials': 'אימייל או סיסמה שגויים',
  'auth/account-exists-with-different-credential': 'קיים חשבון עם אימייל זה בשיטת התחברות אחרת',
  'auth/requires-recent-login': 'יש להתחבר מחדש לביצוע פעולה זו',
  'auth/popup-closed-by-user': 'החלון נסגר לפני השלמת ההתחברות',
  'auth/cancelled-popup-request': 'הבקשה בוטלה',
  'auth/popup-blocked': 'החלון נחסם על ידי הדפדפן',
  
  // שגיאות Firestore
  'permission-denied': 'אין הרשאה לביצוע פעולה זו',
  'not-found': 'המסמך לא נמצא',
  'already-exists': 'המסמך כבר קיים',
  'resource-exhausted': 'חריגה ממכסת השימוש',
  'failed-precondition': 'הפעולה נכשלה בגלל מצב לא תקין',
  'aborted': 'הפעולה בוטלה',
  'out-of-range': 'ערך מחוץ לטווח',
  'unimplemented': 'הפעולה לא נתמכת',
  'internal': 'שגיאה פנימית',
  'unavailable': 'השירות לא זמין כרגע',
  'data-loss': 'אובדן נתונים',
  'unauthenticated': 'יש להתחבר כדי לבצע פעולה זו',
  'deadline-exceeded': 'הבקשה ארכה יותר מדי זמן',
  'cancelled': 'הבקשה בוטלה',
  'invalid-argument': 'ערך לא תקין',
  
  // שגיאות Storage
  'storage/unknown': 'שגיאה לא ידועה בהעלאת הקובץ',
  'storage/object-not-found': 'הקובץ לא נמצא',
  'storage/bucket-not-found': 'האחסון לא נמצא',
  'storage/project-not-found': 'הפרויקט לא נמצא',
  'storage/quota-exceeded': 'חריגה ממכסת האחסון',
  'storage/unauthenticated': 'יש להתחבר כדי להעלות קבצים',
  'storage/unauthorized': 'אין הרשאה להעלות קבצים',
  'storage/retry-limit-exceeded': 'חריגה ממספר הניסיונות המותר',
  'storage/invalid-checksum': 'הקובץ פגום',
  'storage/canceled': 'ההעלאה בוטלה',
  'storage/invalid-url': 'כתובת לא תקינה',
  'storage/cannot-slice-blob': 'בעיה בעיבוד הקובץ',
  'storage/server-file-wrong-size': 'גודל הקובץ לא תואם',
  
  // שגיאות כלליות
  'network-error': 'בעיית תקשורת. בדוק את החיבור לאינטרנט',
  'timeout': 'הבקשה ארכה יותר מדי זמן. נסה שוב',
  'unknown': 'אירעה שגיאה לא צפויה',
};

/**
 * קבלת הודעת שגיאה בעברית לפי קוד
 */
export const getFirebaseErrorMessage = (errorCode: string): string => {
  // ניקוי הקוד מקידומות אפשריות
  const cleanCode = errorCode.replace('auth/', '').replace('storage/', '');
  
  return (
    firebaseErrorMessages[errorCode] || 
    firebaseErrorMessages[cleanCode] || 
    'אירעה שגיאה. נסה שוב מאוחר יותר'
  );
};

/**
 * חילוץ קוד שגיאה מאובייקט שגיאה
 */
export const extractErrorCode = (error: unknown): string => {
  if (error && typeof error === 'object') {
    if ('code' in error && typeof error.code === 'string') {
      return error.code;
    }
    if ('message' in error && typeof error.message === 'string') {
      // ניסיון לחלץ קוד מההודעה
      const match = error.message.match(/\(([^)]+)\)/);
      if (match) {
        return match[1];
      }
      return error.message;
    }
  }
  return 'unknown';
};

/**
 * הודעות מותאמות לפעולות ספציפיות
 */
export const MESSAGES = {
  // הצלחות
  SUCCESS: {
    LOGIN: 'התחברת בהצלחה!',
    REGISTER: 'נרשמת בהצלחה!',
    LOGOUT: 'התנתקת בהצלחה',
    POST_CREATED: 'הפוסט פורסם בהצלחה',
    COMMENT_ADDED: 'התגובה נוספה בהצלחה',
    PROFILE_UPDATED: 'הפרופיל עודכן בהצלחה',
    JOINED_COMMUNITY: 'הצטרפת לקהילה בהצלחה',
    LEFT_COMMUNITY: 'עזבת את הקהילה',
    REPORT_SENT: 'הדיווח נשלח. תודה!',
    USER_BLOCKED: 'המשתמש נחסם',
    USER_UNBLOCKED: 'החסימה הוסרה',
    TEAMS_SAVED: 'הקבוצות נשמרו בהצלחה',
  },
  
  // שגיאות
  ERROR: {
    GENERIC: 'אירעה שגיאה. נסה שוב',
    NETWORK: 'בעיית תקשורת. בדוק את החיבור לאינטרנט',
    UNAUTHORIZED: 'אין הרשאה לביצוע פעולה זו',
    NOT_FOUND: 'הפריט המבוקש לא נמצא',
    LOAD_FAILED: 'טעינת הנתונים נכשלה',
    SAVE_FAILED: 'השמירה נכשלה. נסה שוב',
    EMPTY_FIELD: 'נא למלא את כל השדות',
    INVALID_INPUT: 'הנתונים שהוזנו אינם תקינים',
    POST_NOT_FOUND: 'הפוסט לא נמצא',
    COMMUNITY_NOT_FOUND: 'הקהילה לא נמצאה',
    USER_NOT_FOUND: 'המשתמש לא נמצא',
    ALREADY_MEMBER: 'אתה כבר חבר בקהילה זו',
    NOT_MEMBER: 'אתה לא חבר בקהילה זו',
    PASSWORDS_NOT_MATCH: 'הסיסמאות אינן תואמות',
    MIN_TEAMS: 'יש לבחור לפחות קבוצה אחת',
    MAX_TEAMS: 'ניתן לבחור עד 3 קבוצות',
    CONTENT_TOO_LONG: 'התוכן ארוך מדי',
    CONTENT_EMPTY: 'נא לכתוב תוכן',
  },
  
  // אזהרות
  WARNING: {
    UNSAVED_CHANGES: 'יש שינויים שלא נשמרו',
    LEAVING_PAGE: 'האם אתה בטוח שברצונך לעזוב?',
    DELETE_CONFIRM: 'האם אתה בטוח שברצונך למחוק?',
    BLOCK_CONFIRM: 'האם אתה בטוח שברצונך לחסום את המשתמש?',
  },
  
  // מידע
  INFO: {
    LOADING: 'טוען...',
    NO_RESULTS: 'לא נמצאו תוצאות',
    END_OF_LIST: 'הגעת לסוף הרשימה',
    NO_POSTS: 'אין עדיין פוסטים',
    NO_COMMENTS: 'אין עדיין תגובות',
    NO_NOTIFICATIONS: 'אין התראות',
    NO_COMMUNITIES: 'עדיין לא הצטרפת לקהילות',
  },
};
