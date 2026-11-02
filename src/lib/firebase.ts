import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  onSnapshot, 
  setDoc, 
  getDocs,
  getDoc,
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  type Unsubscribe 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { CitizenReport, Mission, RedeemedVoucher, UserProfile, CityMetrics } from '../types';
import { 
  INITIAL_REPORTS, 
  INITIAL_MISSIONS, 
  INITIAL_CITY_METRICS, 
  INITIAL_USER,
  INITIAL_TOP_CONTRIBUTORS 
} from '../data/initialData';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Bootstrap connectivity verification
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, check network connection.');
    }
  }
}

// Seed initial documents if collection is empty
export async function seedInitialFirestoreData() {
  try {
    const reportsSnapshot = await getDocs(collection(db, 'reports'));
    if (reportsSnapshot.empty) {
      console.log('Seeding initial reports to Firestore...');
      for (const report of INITIAL_REPORTS) {
        try {
          await setDoc(doc(db, 'reports', report.id), {
            ...report,
            syncedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn(`Could not seed report ${report.id}:`, e);
        }
      }
    }
  } catch (err) {
    console.warn('Notice checking/seeding reports collection:', err);
  }

  try {
    const missionsSnapshot = await getDocs(collection(db, 'missions'));
    if (missionsSnapshot.empty) {
      console.log('Seeding initial missions to Firestore...');
      for (const mission of INITIAL_MISSIONS) {
        try {
          await setDoc(doc(db, 'missions', mission.id), {
            ...mission,
            syncedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn(`Could not seed mission ${mission.id}:`, e);
        }
      }
    }
  } catch (err) {
    console.warn('Notice checking/seeding missions collection:', err);
  }

  try {
    const metricsDoc = await getDoc(doc(db, 'metrics', 'current'));
    if (!metricsDoc.exists()) {
      console.log('Seeding initial metrics to Firestore...');
      await setDoc(doc(db, 'metrics', 'current'), {
        ...INITIAL_CITY_METRICS,
        syncedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Notice checking/seeding metrics collection:', err);
  }

  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    if (usersSnapshot.empty) {
      console.log('Seeding initial users to Firestore...');
      const defaultUserId = INITIAL_USER.id || 'steward-sangay';
      try {
        await setDoc(doc(db, 'users', defaultUserId), {
          ...INITIAL_USER,
          id: defaultUserId,
          syncedAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Could not seed default user:', e);
      }
      for (const contributor of INITIAL_TOP_CONTRIBUTORS) {
        try {
          await setDoc(doc(db, 'users', contributor.id), {
            id: contributor.id,
            name: contributor.name,
            role: 'citizen',
            avatarUrl: contributor.avatarUrl || '',
            avatarEmoji: contributor.avatarEmoji,
            levelTitle: contributor.levelTitle,
            levelNumber: contributor.levelNumber,
            totalKarmaPoints: contributor.totalKarmaPoints,
            spendablePoints: contributor.totalKarmaPoints,
            totalReportsCount: contributor.reportsSubmitted,
            reportsResolvedCount: contributor.missionsCompleted,
            rank: contributor.rank,
            isRisingStar: contributor.isRisingStar,
            rankChange24h: contributor.rankChange24h,
            badges: contributor.badges,
            syncedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn(`Could not seed contributor ${contributor.id}:`, e);
        }
      }
    }
  } catch (err) {
    console.warn('Notice checking/seeding users collection:', err);
  }
}

// Real-time synchronization subscribers
export function subscribeToReports(
  callback: (reports: CitizenReport[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const reportsPath = 'reports';
  return onSnapshot(
    collection(db, reportsPath),
    (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_REPORTS);
        return;
      }
      const data: CitizenReport[] = [];
      snapshot.forEach(docSnap => {
        data.push(docSnap.data() as CitizenReport);
      });
      // Sort newest first
      data.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return timeB - timeA;
      });
      callback(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, reportsPath);
      if (onError) onError(error as Error);
    }
  );
}

export function subscribeToMissions(
  callback: (missions: Mission[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const missionsPath = 'missions';
  return onSnapshot(
    collection(db, missionsPath),
    (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_MISSIONS);
        return;
      }
      const data: Mission[] = [];
      snapshot.forEach(docSnap => {
        data.push(docSnap.data() as Mission);
      });
      callback(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, missionsPath);
      if (onError) onError(error as Error);
    }
  );
}

export function subscribeToVouchers(
  callback: (vouchers: RedeemedVoucher[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const vouchersPath = 'vouchers';
  return onSnapshot(
    collection(db, vouchersPath),
    (snapshot) => {
      const data: RedeemedVoucher[] = [];
      snapshot.forEach(docSnap => {
        data.push(docSnap.data() as RedeemedVoucher);
      });
      callback(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, vouchersPath);
      if (onError) onError(error as Error);
    }
  );
}

export function subscribeToMetrics(
  callback: (metrics: CityMetrics) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const metricsDocPath = 'metrics/current';
  return onSnapshot(
    doc(db, 'metrics', 'current'),
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as CityMetrics);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, metricsDocPath);
      if (onError) onError(error as Error);
    }
  );
}

export function subscribeToUsers(
  callback: (users: UserProfile[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const usersPath = 'users';
  return onSnapshot(
    collection(db, usersPath),
    (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as UserProfile);
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, usersPath);
      if (onError) onError(error as Error);
    }
  );
}

// Mutator helpers
export async function saveReportToFirestore(report: CitizenReport) {
  const path = `reports/${report.id}`;
  try {
    await setDoc(doc(db, 'reports', report.id), {
      ...report,
      createdAt: report.createdAt || new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateReportInFirestore(reportId: string, updates: Partial<CitizenReport>) {
  const path = `reports/${reportId}`;
  try {
    await updateDoc(doc(db, 'reports', reportId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateMissionInFirestore(missionId: string, updates: Partial<Mission>) {
  const path = `missions/${missionId}`;
  try {
    await updateDoc(doc(db, 'missions', missionId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveVoucherToFirestore(voucher: RedeemedVoucher) {
  const path = `vouchers/${voucher.id}`;
  try {
    await setDoc(doc(db, 'vouchers', voucher.id), voucher);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveUserToFirestore(user: UserProfile) {
  const rawId = user.id || (user.email ? user.email.replace(/[@.]/g, '-') : 'citizen-default');
  const userId = rawId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120) || 'citizen-default';
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), {
      ...user,
      id: userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
