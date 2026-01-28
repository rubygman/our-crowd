# הקהל שלנו 🏟️

רשת חברתית לאוהדי הכדורגל הישראלי.

## טכנולוגיות

- **Frontend:** React + Vite + TypeScript
- **Backend:** Firebase (Auth + Firestore + Storage)
- **UI:** RTL מלא, עברית בלבד

## התקנה והרצה

```bash
# התקנת חבילות
npm install

# הרצה בסביבת פיתוח
npm run dev

# בנייה לייצור
npm run build
```

## מבנה הפרויקט

```
src/
├── components/    # רכיבי UI משותפים
├── pages/         # דפי האפליקציה
├── services/      # שירותי Firebase
├── hooks/         # הוקים מותאמים
├── types/         # טיפוסי TypeScript
└── utils/         # פונקציות עזר
```

## דפים זמינים

| נתיב | תיאור |
|------|-------|
| `/login` | דף התחברות |
| `/onboarding` | הגדרת פרופיל חדש |
| `/feed` | פיד ראשי |
| `/community/:id` | עמוד קהילה |
| `/post/:id` | עמוד פוסט |
| `/profile` | הפרופיל שלי |
| `/notifications` | התראות |
| `/search` | חיפוש |
