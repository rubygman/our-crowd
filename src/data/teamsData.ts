// סקריפט להוספת קבוצות ל-Firestore
// הרץ את הסקריפט הזה פעם אחת ב-Firebase Console או ב-Node.js

/*
הוראות הרצה:
1. לך ל-Firebase Console → Firestore
2. צור אוסף (collection) בשם "teams"
3. הוסף מסמכים עם המבנה הבא:

או לחילופין, הרץ ב-Console של הדפדפן אחרי שאתה מחובר לאפליקציה:
*/

const teamsData = [
  // ליגת העל
  { id: 'maccabi-tel-aviv', name: 'מכבי תל אביב', league: 'ליגת העל' },
  { id: 'hapoel-tel-aviv', name: 'הפועל תל אביב', league: 'ליגת העל' },
  { id: 'maccabi-haifa', name: 'מכבי חיפה', league: 'ליגת העל' },
  { id: 'hapoel-beer-sheva', name: 'הפועל באר שבע', league: 'ליגת העל' },
  { id: 'beitar-jerusalem', name: 'בית"ר ירושלים', league: 'ליגת העל' },
  { id: 'bnei-sakhnin', name: 'בני סכנין', league: 'ליגת העל' },
  { id: 'hapoel-haifa', name: 'הפועל חיפה', league: 'ליגת העל' },
  { id: 'maccabi-netanya', name: 'מכבי נתניה', league: 'ליגת העל' },
  { id: 'hapoel-jerusalem', name: 'הפועל ירושלים', league: 'ליגת העל' },
  { id: 'ashdod-fc', name: 'מ.ס. אשדוד', league: 'ליגת העל' },
  { id: 'bnei-yehuda', name: 'בני יהודה', league: 'ליגת העל' },
  { id: 'maccabi-petah-tikva', name: 'מכבי פתח תקווה', league: 'ליגת העל' },
  { id: 'hapoel-hadera', name: 'הפועל חדרה', league: 'ליגת העל' },
  { id: 'ironi-kiryat-shmona', name: 'עירוני קריית שמונה', league: 'ליגת העל' },
  
  // ליגה לאומית
  { id: 'hapoel-katamon', name: 'הפועל קטמון ירושלים', league: 'ליגה לאומית' },
  { id: 'hapoel-raanana', name: 'הפועל רעננה', league: 'ליגה לאומית' },
  { id: 'hapoel-afula', name: 'הפועל עפולה', league: 'ליגה לאומית' },
  { id: 'hapoel-acre', name: 'הפועל עכו', league: 'ליגה לאומית' },
  { id: 'hapoel-rishon', name: 'הפועל ראשון לציון', league: 'ליגה לאומית' },
  { id: 'hapoel-petah-tikva', name: 'הפועל פתח תקווה', league: 'ליגה לאומית' },
  { id: 'hapoel-nof-hagalil', name: 'הפועל נוף הגליל', league: 'ליגה לאומית' },
  { id: 'sekzia-nes-tziona', name: 'סקציה נס ציונה', league: 'ליגה לאומית' },
];

// קוד להוספת הנתונים (להריץ פעם אחת)
/*
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

async function seedTeams() {
  for (const team of teamsData) {
    await setDoc(doc(db, 'teams', team.id), {
      name: team.name,
      league: team.league,
      logo: '',
    });
    console.log(`נוספה קבוצה: ${team.name}`);
  }
  console.log('כל הקבוצות נוספו בהצלחה!');
}

seedTeams();
*/

export default teamsData;
