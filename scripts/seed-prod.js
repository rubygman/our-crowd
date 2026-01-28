/**
 * סקריפט Seed לפרויקט Firebase PROD
 * מזריע קבוצות וקהילות ראשוניות
 * 
 * הרצה: npm run seed:prod
 * דרישות: קובץ serviceAccountKey-prod.json בשורש הפרויקט
 */

const admin = require('firebase-admin');
const path = require('path');

// === הגדרות ===
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'serviceAccountKey-prod.json');

// === נתוני קבוצות ===
const TEAMS_DATA = [
  // ליגת העל
  { id: 'maccabi-tel-aviv', nameHe: 'מכבי תל אביב', slug: 'maccabi-tel-aviv', league: 'ליגת העל', logoURL: '' },
  { id: 'hapoel-tel-aviv', nameHe: 'הפועל תל אביב', slug: 'hapoel-tel-aviv', league: 'ליגת העל', logoURL: '' },
  { id: 'maccabi-haifa', nameHe: 'מכבי חיפה', slug: 'maccabi-haifa', league: 'ליגת העל', logoURL: '' },
  { id: 'hapoel-beer-sheva', nameHe: 'הפועל באר שבע', slug: 'hapoel-beer-sheva', league: 'ליגת העל', logoURL: '' },
  { id: 'beitar-jerusalem', nameHe: 'בית"ר ירושלים', slug: 'beitar-jerusalem', league: 'ליגת העל', logoURL: '' },
  { id: 'hapoel-jerusalem', nameHe: 'הפועל ירושלים', slug: 'hapoel-jerusalem', league: 'ליגת העל', logoURL: '' },
  { id: 'maccabi-netanya', nameHe: 'מכבי נתניה', slug: 'maccabi-netanya', league: 'ליגת העל', logoURL: '' },
  { id: 'hapoel-haifa', nameHe: 'הפועל חיפה', slug: 'hapoel-haifa', league: 'ליגת העל', logoURL: '' },
  { id: 'bnei-sakhnin', nameHe: 'בני סכנין', slug: 'bnei-sakhnin', league: 'ליגת העל', logoURL: '' },
  { id: 'maccabi-bnei-reineh', nameHe: 'מכבי בני ריינה', slug: 'maccabi-bnei-reineh', league: 'ליגת העל', logoURL: '' },
  { id: 'hapoel-hadera', nameHe: 'הפועל חדרה', slug: 'hapoel-hadera', league: 'ליגת העל', logoURL: '' },
  { id: 'ashdod', nameHe: 'מ.ס. אשדוד', slug: 'ashdod', league: 'ליגת העל', logoURL: '' },
  { id: 'maccabi-petah-tikva', nameHe: 'מכבי פתח תקווה', slug: 'maccabi-petah-tikva', league: 'ליגת העל', logoURL: '' },
  { id: 'hapoel-petah-tikva', nameHe: 'הפועל פתח תקווה', slug: 'hapoel-petah-tikva', league: 'ליגת העל', logoURL: '' },
  
  // ליגה לאומית
  { id: 'hapoel-raanana', nameHe: 'הפועל רעננה', slug: 'hapoel-raanana', league: 'ליגה לאומית', logoURL: '' },
  { id: 'hapoel-rishon', nameHe: 'הפועל ראשון לציון', slug: 'hapoel-rishon', league: 'ליגה לאומית', logoURL: '' },
  { id: 'hapoel-afula', nameHe: 'הפועל עפולה', slug: 'hapoel-afula', league: 'ליגה לאומית', logoURL: '' },
  { id: 'hapoel-kfar-saba', nameHe: 'הפועל כפר סבא', slug: 'hapoel-kfar-saba', league: 'ליגה לאומית', logoURL: '' },
  { id: 'ironi-kiryat-shmona', nameHe: 'עירוני קריית שמונה', slug: 'ironi-kiryat-shmona', league: 'ליגה לאומית', logoURL: '' },
  { id: 'hapoel-nazareth', nameHe: 'הפועל נצרת עילית', slug: 'hapoel-nazareth', league: 'ליגה לאומית', logoURL: '' },
];

// === נתוני קהילות נושאיות ===
const TOPIC_COMMUNITIES = [
  { id: 'topic_transfers', name: 'העברות ושמועות', description: 'כל העברות השחקנים, השמועות והעסקאות בכדורגל הישראלי' },
  { id: 'topic_referees', name: 'שופטים ו-VAR', description: 'דיונים על שיפוט, החלטות VAR ומקרים שנויים במחלוקת' },
  { id: 'topic_national-team', name: 'נבחרת ישראל', description: 'כל מה שקשור לנבחרת ישראל - משחקים, שחקנים ומוקדמות' },
  { id: 'topic_nostalgia', name: 'נוסטלגיה', description: 'זכרונות, סיפורים והיסטוריה של הכדורגל הישראלי' },
  { id: 'topic_tactics', name: 'טקטיקה וניתוח', description: 'ניתוחי משחקים, טקטיקות ואסטרטגיות' },
  { id: 'topic_fantasy', name: 'פנטזי ליגת העל', description: 'טיפים, דיונים וליגות פנטזי' },
];

// === פונקציות עזר ===

/**
 * אתחול Firebase Admin
 */
function initializeFirebase() {
  try {
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin מאותחל בהצלחה');
    console.log(`📁 פרויקט: ${serviceAccount.project_id}`);
    
    return admin.firestore();
  } catch (error) {
    console.error('❌ שגיאה באתחול Firebase:');
    console.error(`   ודא שהקובץ serviceAccountKey-prod.json קיים בשורש הפרויקט`);
    console.error(`   נתיב צפוי: ${SERVICE_ACCOUNT_PATH}`);
    process.exit(1);
  }
}

/**
 * זריעת קבוצות
 */
async function seedTeams(db) {
  console.log('\n📦 זורע קבוצות...');
  
  const batch = db.batch();
  let count = 0;
  
  for (const team of TEAMS_DATA) {
    const teamRef = db.collection('teams').doc(team.id);
    
    batch.set(teamRef, {
      nameHe: team.nameHe,
      slug: team.slug,
      league: team.league,
      logoURL: team.logoURL,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    count++;
  }
  
  await batch.commit();
  console.log(`   ✅ נוצרו/עודכנו ${count} קבוצות`);
  
  return count;
}

/**
 * זריעת קהילות קבוצות
 */
async function seedTeamCommunities(db) {
  console.log('\n📦 זורע קהילות קבוצות...');
  
  const batch = db.batch();
  let count = 0;
  
  for (const team of TEAMS_DATA) {
    const communityId = `team_${team.id}`;
    const communityRef = db.collection('communities').doc(communityId);
    
    batch.set(communityRef, {
      type: 'team',
      teamId: team.id,
      name: `אוהדי ${team.nameHe}`,
      description: `הקהילה הרשמית של אוהדי ${team.nameHe}. הצטרפו לדיונים, חדשות ועדכונים!`,
      memberCount: 0,
      isPublic: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    count++;
  }
  
  await batch.commit();
  console.log(`   ✅ נוצרו/עודכנו ${count} קהילות קבוצות`);
  
  return count;
}

/**
 * זריעת קהילות נושאיות
 */
async function seedTopicCommunities(db) {
  console.log('\n📦 זורע קהילות נושאיות...');
  
  const batch = db.batch();
  let count = 0;
  
  for (const topic of TOPIC_COMMUNITIES) {
    const communityRef = db.collection('communities').doc(topic.id);
    
    batch.set(communityRef, {
      type: 'topic',
      name: topic.name,
      description: topic.description,
      memberCount: 0,
      isPublic: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    count++;
  }
  
  await batch.commit();
  console.log(`   ✅ נוצרו/עודכנו ${count} קהילות נושאיות`);
  
  return count;
}

/**
 * הפונקציה הראשית
 */
async function main() {
  console.log('🚀 מתחיל Seed לפרויקט PROD...\n');
  console.log('='.repeat(50));
  
  const db = initializeFirebase();
  
  try {
    const teamsCount = await seedTeams(db);
    const teamCommunitiesCount = await seedTeamCommunities(db);
    const topicCommunitiesCount = await seedTopicCommunities(db);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Seed הושלם בהצלחה!');
    console.log(`   📊 סה"כ קבוצות: ${teamsCount}`);
    console.log(`   📊 סה"כ קהילות קבוצות: ${teamCommunitiesCount}`);
    console.log(`   📊 סה"כ קהילות נושאיות: ${topicCommunitiesCount}`);
    console.log(`   📊 סה"כ מסמכים: ${teamsCount + teamCommunitiesCount + topicCommunitiesCount}`);
    
  } catch (error) {
    console.error('\n❌ שגיאה בזריעה:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

// הרצה
main();
