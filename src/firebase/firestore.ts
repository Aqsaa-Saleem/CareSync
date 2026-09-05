import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { AppState, ChildProfile, ParentNote, Notification, ChatMessage } from '../types';

const USERS_COLLECTION = 'users';

export interface StoredUserData {
  email: string;
  createdAt: string;
  children: ChildProfile[];
  activeChildId: string | null;
  completedActivities: string[];
  savedActivities: string[];
  parentNotes: ParentNote[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  streak: number;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  language: 'en' | 'ur';
}

function serializeMessages(messages: ChatMessage[]): Record<string, unknown>[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    text: m.text,
    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
  }));
}

function parseMessages(messages: unknown[]): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages.map((m: any) => ({
    id: m.id,
    role: m.role,
    text: m.text,
    timestamp: new Date(m.timestamp || Date.now()),
  }));
}

export function getUserDocRef(uid: string) {
  return doc(db, USERS_COLLECTION, uid);
}

export async function loadUserData(uid: string): Promise<Partial<StoredUserData> | null> {
  try {
    const snap = await getDoc(getUserDocRef(uid));
    if (!snap.exists()) return null;
    const data = snap.data() as StoredUserData;
    if (data.chatMessages) {
      data.chatMessages = parseMessages(data.chatMessages as unknown[]);
    }
    return data;
  } catch (error) {
    console.error('Error loading user data:', error);
    throw error;
  }
}

export async function saveUserData(uid: string, data: Partial<StoredUserData>): Promise<void> {
  try {
    const payload = { ...data } as Record<string, unknown>;
    if (data.chatMessages) {
      payload.chatMessages = serializeMessages(data.chatMessages);
    }
    await setDoc(getUserDocRef(uid), payload, { merge: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
}

export async function createUserData(
  uid: string,
  email: string,
  notifications: Notification[] = []
): Promise<StoredUserData> {
  const now = new Date().toISOString();
  const initial: StoredUserData = {
    email,
    createdAt: now,
    children: [],
    activeChildId: null,
    completedActivities: [],
    savedActivities: [],
    parentNotes: [],
    notifications,
    chatMessages: [],
    streak: 0,
    darkMode: false,
    fontSize: 'medium',
    language: 'en',
  };
  await setDoc(getUserDocRef(uid), initial);
  return initial;
}

export function subscribeToUserData(
  uid: string,
  callback: (data: StoredUserData | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    getUserDocRef(uid),
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      const data = snap.data() as StoredUserData;
      if (data.chatMessages) {
        data.chatMessages = parseMessages(data.chatMessages as unknown[]);
      }
      callback(data);
    },
    (error) => {
      console.error('Error subscribing to user data:', error);
      onError?.(error);
      callback(null);
    }
  );
}

export function stateToStoredData(state: AppState, email?: string): Partial<StoredUserData> {
  const data: Partial<StoredUserData> = {
    children: state.children,
    activeChildId: state.activeChildId,
    completedActivities: state.completedActivities,
    savedActivities: state.savedActivities,
    parentNotes: state.parentNotes,
    notifications: state.notifications,
    chatMessages: state.chatMessages,
    streak: state.streak,
    darkMode: state.darkMode,
    fontSize: state.fontSize,
    language: state.language,
  };
  if (email) data.email = email;
  return data;
}

export function storedDataToState(data: Partial<StoredUserData>, uid: string): Partial<AppState> {
  // Existing accounts may have been created before every field was persisted.
  // Normalize optional data so one missing field cannot block app entry.
  const children = Array.isArray(data.children) ? data.children : [];
  const active = children.find((c) => c.id === data.activeChildId) || children[0] || null;
  return {
    userId: uid,
    childProfile: active,
    children,
    activeChildId: active?.id || null,
    completedActivities: Array.isArray(data.completedActivities) ? data.completedActivities : [],
    savedActivities: Array.isArray(data.savedActivities) ? data.savedActivities : [],
    parentNotes: Array.isArray(data.parentNotes) ? data.parentNotes : [],
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    chatMessages: Array.isArray(data.chatMessages) ? data.chatMessages : [],
    streak: data.streak || 0,
    darkMode: data.darkMode ?? false,
    fontSize: data.fontSize || 'medium',
    language: data.language || 'en',
  };
}
