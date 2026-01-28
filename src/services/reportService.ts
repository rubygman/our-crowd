import { 
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { CreateReportData } from '../types';

/**
 * יצירת דיווח חדש
 */
export const createReport = async (data: CreateReportData): Promise<string> => {
  const reportsRef = collection(db, 'reports');
  
  const reportData = {
    type: data.type,
    targetId: data.targetId,
    targetAuthorId: data.targetAuthorId || '',
    reporterId: data.reporterId,
    reason: data.reason,
    description: data.description || '',
    status: 'pending',
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(reportsRef, reportData);
  return docRef.id;
};
