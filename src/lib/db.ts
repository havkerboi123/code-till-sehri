import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { supabase, STORAGE_BUCKET } from './supabase';

export type Project = {
  id: string;
  title: string;
  description: string;
  motivation: string;
  liveUrl: string;
  imageUrl: string;
  videoUrl: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: Timestamp;
  voteCount: number;
  totalScore: number;
};

export type Vote = {
  projectId: string;
  userId: string;
  score: number;
};

const PROJECTS = 'projects';
const VOTES = 'votes';

function requireDb(): NonNullable<typeof db> {
  if (!db) throw new Error('Firebase is not configured. Add your config to .env.local');
  return db;
}

export async function createProject(data: {
  title: string;
  description: string;
  motivation: string;
  liveUrl: string;
  imageUrl: string;
  videoUrl: string;
  userId: string;
  userName: string;
  userEmail: string;
}): Promise<string> {
  const firestore = requireDb();
  const ref = await addDoc(collection(firestore, PROJECTS), {
    ...data,
    createdAt: serverTimestamp(),
    voteCount: 0,
    totalScore: 0,
  });
  return ref.id;
}

export async function getProjects(): Promise<Project[]> {
  if (!db) return [];
  const snap = await getDocs(collection(db, PROJECTS));
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      title: x.title ?? '',
      description: x.description ?? '',
      motivation: x.motivation ?? '',
      liveUrl: x.liveUrl ?? '',
      imageUrl: x.imageUrl ?? '',
      videoUrl: x.videoUrl ?? '',
      userId: x.userId ?? '',
      userName: x.userName ?? '',
      userEmail: x.userEmail ?? '',
      createdAt: x.createdAt ?? Timestamp.now(),
      voteCount: x.voteCount ?? 0,
      totalScore: x.totalScore ?? 0,
    };
  });
}

export async function getUserVote(projectId: string, userId: string): Promise<number | null> {
  if (!db) return null;
  const q = query(
    collection(db, VOTES),
    where('projectId', '==', projectId),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data().score ?? null;
}

export async function submitVote(projectId: string, userId: string, score: number): Promise<void> {
  const firestore = requireDb();
  const voteQuery = query(
    collection(firestore, VOTES),
    where('projectId', '==', projectId),
    where('userId', '==', userId)
  );
  const voteSnap = await getDocs(voteQuery);
  if (!voteSnap.empty) return; // already voted, do not allow change

  const projectRef = doc(firestore, PROJECTS, projectId);
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) return;

  const batch = writeBatch(firestore);
  batch.set(doc(collection(firestore, VOTES)), { projectId, userId, score });

  const p = projectSnap.data();
  const voteCount = (p?.voteCount ?? 0) + 1;
  const totalScore = (p?.totalScore ?? 0) + score;
  batch.update(projectRef, { voteCount, totalScore });

  await batch.commit();
}

/**
 * Upload a project image to Supabase Storage.
 * Must receive the raw File from the input — do not wrap in FormData.
 */
export async function uploadImage(file: File, userId: string): Promise<string> {
  if (!(file instanceof File)) {
    throw new Error('uploadImage expects a raw File; do not pass FormData.');
  }
  const path = `${userId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
