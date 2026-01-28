import { 
  collection, 
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { Team } from '../types';

/**
 * טעינת כל הקבוצות מ-Firestore
 * תומך גם בשדה name וגם בשדה nameHe
 */
export const getAllTeams = async (): Promise<Team[]> => {
  const teamsRef = collection(db, 'teams');
  const snapshot = await getDocs(teamsRef);
  
  const teams: Team[] = snapshot.docs.map(doc => {
    const data = doc.data();
    
    // תמיכה בשדות שם שונים
    const name = data.name ?? data.nameHe ?? '';
    
    // תמיכה בשדות לוגו שונים
    const logo = data.logo ?? data.logoURL ?? '';
    
    return {
      id: doc.id,
      name,
      logo,
      league: data.league ?? '',
    };
  });
  
  // מיון לפי שם בעברית בצד הלקוח
  teams.sort((a, b) => a.name.localeCompare(b.name, 'he'));
  
  return teams;
};
