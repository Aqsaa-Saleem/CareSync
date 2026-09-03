import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signOut() {
  return firebaseSignOut(auth);
}

export function observeAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
