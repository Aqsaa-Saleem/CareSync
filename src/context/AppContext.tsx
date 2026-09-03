import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import type { AppState, Screen, ChildProfile, ParentNote, ChatMessage, Notification, ProfileSetupMode } from '../types';
import { signIn, signUp, signInWithGoogle, signOut as firebaseSignOut, observeAuth } from '../firebase/auth';
import {
  loadUserData,
  saveUserData,
  createUserData,
  subscribeToUserData,
  stateToStoredData,
  storedDataToState,
  type StoredUserData,
} from '../firebase/firestore';

function createWelcomeNotification(): Notification {
  return {
    id: 'welcome-1',
    title: 'Welcome to CareSync',
    message: "Welcome to CareSync! We're here to support you and your child's journey.",
    time: 'Just now',
    read: false,
  };
}

function createInitialUserState(): AppState {
  return {
    currentScreen: 'splash',
    previousScreen: null,
    history: ['splash'],
    userId: '',
    childProfile: null,
    children: [],
    activeChildId: null,
    profileSetupMode: 'create',
    editingChildId: null,
    onboardingStep: 0,
    completedActivities: [],
    savedActivities: [],
    parentNotes: [],
    notifications: [createWelcomeNotification()],
    chatMessages: [],
    streak: 0,
    selectedActivityId: null,
    selectedCentreId: null,
    selectedProfessionalId: null,
    darkMode: false,
    fontSize: 'medium',
    language: 'en',
    authUser: null,
    authLoading: true,
    authError: null,
    syncError: null,
    syncStatus: 'idle',
  };
}

const initialState: AppState = createInitialUserState();

type Action =
  | { type: 'NAVIGATE'; screen: Screen }
  | { type: 'GO_BACK' }
  | { type: 'SET_ONBOARDING_STEP'; step: number }
  | { type: 'SET_CHILD_PROFILE'; profile: ChildProfile }
  | { type: 'SET_ACTIVE_CHILD'; childId: string }
  | { type: 'SET_PROFILE_SETUP_MODE'; mode: ProfileSetupMode; editingChildId?: string }
  | { type: 'DELETE_CHILD'; childId: string }
  | { type: 'COMPLETE_ACTIVITY'; activityId: string }
  | { type: 'SAVE_ACTIVITY'; activityId: string }
  | { type: 'UNSAVE_ACTIVITY'; activityId: string }
  | { type: 'ADD_NOTE'; note: ParentNote }
  | { type: 'DELETE_NOTE'; noteId: string }
  | { type: 'ADD_CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'SELECT_ACTIVITY'; activityId: string }
  | { type: 'SELECT_CENTRE'; centreId: string }
  | { type: 'SELECT_PROFESSIONAL'; professionalId: string }
  | { type: 'MARK_NOTIFICATION_READ'; notificationId: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_FONT_SIZE'; size: 'small' | 'medium' | 'large' }
  | { type: 'SET_LANGUAGE'; language: 'en' | 'ur' }
  | { type: 'SET_AUTH_USER'; user: User | null }
  | { type: 'SET_AUTH_LOADING'; loading: boolean }
  | { type: 'SET_AUTH_ERROR'; error: string | null }
  | { type: 'SET_SYNC_ERROR'; error: string | null }
  | { type: 'SET_SYNC_STATUS'; status: AppState['syncStatus'] }
  | { type: 'LOAD_FIREBASE_STATE'; state: Partial<AppState> }
  | { type: 'SIGN_OUT' };

function getActiveChild(state: AppState): ChildProfile | null {
  if (state.activeChildId) {
    return state.children.find((c) => c.id === state.activeChildId) || state.childProfile;
  }
  return state.children[0] || state.childProfile;
}

function dedupeNotifications(notifications: Notification[]): Notification[] {
  const seen = new Set<string>();
  return notifications.filter((n) => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'NAVIGATE': {
      if (state.currentScreen === action.screen) return state;
      const newHistory = [...state.history, action.screen];
      return {
        ...state,
        history: newHistory,
        previousScreen: state.currentScreen,
        currentScreen: action.screen,
      };
    }
    case 'GO_BACK': {
      if (state.history.length <= 1) return state;
      const newHistory = state.history.slice(0, -1);
      return {
        ...state,
        history: newHistory,
        currentScreen: newHistory[newHistory.length - 1],
        previousScreen: newHistory.length > 1 ? newHistory[newHistory.length - 2] : null,
      };
    }
    case 'SET_ONBOARDING_STEP':
      return { ...state, onboardingStep: action.step };
    case 'SET_CHILD_PROFILE': {
      const existingIndex = state.children.findIndex((c) => c.id === action.profile.id);
      let children: ChildProfile[];
      if (existingIndex >= 0) {
        children = [...state.children];
        children[existingIndex] = action.profile;
      } else {
        children = [...state.children, action.profile];
      }
      return {
        ...state,
        children,
        activeChildId: action.profile.id,
        childProfile: action.profile,
        profileSetupMode: 'create',
        editingChildId: null,
      };
    }
    case 'SET_ACTIVE_CHILD': {
      const active = state.children.find((c) => c.id === action.childId) || null;
      return { ...state, activeChildId: active?.id || null, childProfile: active };
    }
    case 'SET_PROFILE_SETUP_MODE':
      return { ...state, profileSetupMode: action.mode, editingChildId: action.editingChildId || null };
    case 'DELETE_CHILD': {
      const children = state.children.filter((c) => c.id !== action.childId);
      const active = getActiveChild({ ...state, children });
      return { ...state, children, activeChildId: active?.id || null, childProfile: active };
    }
    case 'COMPLETE_ACTIVITY':
      if (state.completedActivities.includes(action.activityId)) return state;
      return { ...state, completedActivities: [...state.completedActivities, action.activityId] };
    case 'SAVE_ACTIVITY':
      if (state.savedActivities.includes(action.activityId)) return state;
      return { ...state, savedActivities: [...state.savedActivities, action.activityId] };
    case 'UNSAVE_ACTIVITY':
      return { ...state, savedActivities: state.savedActivities.filter((id) => id !== action.activityId) };
    case 'ADD_NOTE':
      return { ...state, parentNotes: [action.note, ...state.parentNotes] };
    case 'DELETE_NOTE':
      return { ...state, parentNotes: state.parentNotes.filter((n) => n.id !== action.noteId) };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.message] };
    case 'SELECT_ACTIVITY':
      return { ...state, selectedActivityId: action.activityId };
    case 'SELECT_CENTRE':
      return { ...state, selectedCentreId: action.centreId };
    case 'SELECT_PROFESSIONAL':
      return { ...state, selectedProfessionalId: action.professionalId };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read: true } : n
        ),
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.size };
    case 'SET_LANGUAGE':
      return { ...state, language: action.language };
    case 'SET_AUTH_USER':
      return { ...state, authUser: action.user };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.loading };
    case 'SET_AUTH_ERROR':
      return { ...state, authError: action.error };
    case 'SET_SYNC_ERROR':
      return { ...state, syncError: action.error, syncStatus: action.error ? 'error' : state.syncStatus };
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.status, syncError: action.status === 'error' ? state.syncError : null };
    case 'LOAD_FIREBASE_STATE': {
      const merged = { ...state, ...action.state };
      merged.notifications = dedupeNotifications(merged.notifications);
      const active = merged.children.find((c) => c.id === merged.activeChildId) || merged.children[0] || null;
      merged.childProfile = active;
      merged.activeChildId = active?.id || null;
      // Ensure history is consistent with currentScreen
      if (!merged.history || merged.history.length === 0) {
        merged.history = [merged.currentScreen];
      }
      if (merged.history[merged.history.length - 1] !== merged.currentScreen) {
        merged.history = [...merged.history, merged.currentScreen];
      }
      return merged;
    }
    case 'SIGN_OUT':
      return {
        ...createInitialUserState(),
        authUser: null,
        authLoading: false,
        authError: null,
        syncError: null,
        syncStatus: 'idle',
        currentScreen: 'splash',
        history: ['splash'],
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  navigate: (screen: Screen) => void;
  goBack: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setAuthError: (error: string | null) => void;
  clearSyncError: () => void;
  retrySave: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

function mapFirebaseError(error: unknown): string {
  const code = (error as any)?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'permission-denied':
      return 'Permission denied. Please check your Firebase security rules.';
    case 'unauthenticated':
    case 'auth/unauthenticated':
      return 'You need to be signed in.';
    case 'unavailable':
    case 'resource-exhausted':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const unsubscribeAuthRef = useRef<(() => void) | null>(null);
  const unsubscribeDataRef = useRef<(() => void) | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef<Partial<StoredUserData> | null>(null);

  // Observe Firebase Auth state
  useEffect(() => {
    dispatch({ type: 'SET_AUTH_LOADING', loading: true });
    unsubscribeAuthRef.current = observeAuth((user) => {
      dispatch({ type: 'SET_AUTH_USER', user });
      dispatch({ type: 'SET_AUTH_LOADING', loading: false });
      if (!user) {
        dispatch({ type: 'SIGN_OUT' });
      }
    });
    return () => {
      unsubscribeAuthRef.current?.();
    };
  }, []);

  // Subscribe to Firestore data when authenticated
  useEffect(() => {
    if (!state.authUser) {
      unsubscribeDataRef.current?.();
      unsubscribeDataRef.current = null;
      return;
    }

    const uid = state.authUser.uid;
    dispatch({ type: 'SET_AUTH_LOADING', loading: true });

    loadUserData(uid)
      .then(async (data) => {
        if (!data) {
          // New user: create initial Firestore document with welcome notification
          const fresh = createInitialUserState();
          await createUserData(uid, state.authUser?.email || '', fresh.notifications);
          dispatch({
            type: 'LOAD_FIREBASE_STATE',
            state: {
              ...fresh,
              userId: uid,
              currentScreen: 'onboarding',
            },
          });
          dispatch({ type: 'SET_SYNC_STATUS', status: 'saved' });
        } else {
          // Existing user: load saved data
          const loadedState = storedDataToState(data as StoredUserData, uid);
          dispatch({
            type: 'LOAD_FIREBASE_STATE',
            state: {
              ...loadedState,
              currentScreen: loadedState.childProfile ? 'home' : 'onboarding',
            },
          });
          dispatch({ type: 'SET_SYNC_STATUS', status: 'saved' });
        }
        dispatch({ type: 'SET_AUTH_LOADING', loading: false });
      })
      .catch((error) => {
        dispatch({ type: 'SET_SYNC_ERROR', error: mapFirebaseError(error) });
        // Fall back to onboarding so the user is not stuck on splash
        dispatch({ type: 'NAVIGATE', screen: state.childProfile ? 'home' : 'onboarding' });
        dispatch({ type: 'SET_AUTH_LOADING', loading: false });
      });

    unsubscribeDataRef.current = subscribeToUserData(
      uid,
      (data) => {
        if (!data) return;
        dispatch({
          type: 'LOAD_FIREBASE_STATE',
          state: storedDataToState(data, uid),
        });
        dispatch({ type: 'SET_SYNC_STATUS', status: 'saved' });
      },
      (error) => {
        dispatch({ type: 'SET_SYNC_ERROR', error: mapFirebaseError(error) });
      }
    );

    return () => {
      unsubscribeDataRef.current?.();
    };
  }, [state.authUser?.uid]);

  // Save state changes to Firestore (debounced)
  useEffect(() => {
    if (!state.authUser || state.authLoading) return;
    const data = stateToStoredData(state, state.authUser.email || undefined);
    pendingSaveRef.current = data;

    dispatch({ type: 'SET_SYNC_STATUS', status: 'saving' });

    const timer = setTimeout(() => {
      if (!pendingSaveRef.current || isSavingRef.current) return;
      isSavingRef.current = true;
      saveUserData(state.authUser!.uid, pendingSaveRef.current)
        .then(() => {
          pendingSaveRef.current = null;
          dispatch({ type: 'SET_SYNC_STATUS', status: 'saved' });
        })
        .catch((error) => {
          console.error('Failed to save user data:', error);
          dispatch({ type: 'SET_SYNC_ERROR', error: mapFirebaseError(error) });
        })
        .finally(() => {
          isSavingRef.current = false;
        });
    }, 800);

    return () => clearTimeout(timer);
  }, [
    state.children,
    state.activeChildId,
    state.completedActivities,
    state.savedActivities,
    state.parentNotes,
    state.notifications,
    state.chatMessages,
    state.streak,
    state.darkMode,
    state.fontSize,
    state.language,
    state.authUser,
    state.authLoading,
  ]);

  const navigate = useCallback((screen: Screen) => dispatch({ type: 'NAVIGATE', screen }), []);
  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, []);

  const setAuthError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_AUTH_ERROR', error });
  }, []);

  const clearSyncError = useCallback(() => {
    dispatch({ type: 'SET_SYNC_ERROR', error: null });
  }, []);

  const retrySave = useCallback(async () => {
    if (!state.authUser || isSavingRef.current) return;
    dispatch({ type: 'SET_SYNC_ERROR', error: null });
    dispatch({ type: 'SET_SYNC_STATUS', status: 'saving' });
    isSavingRef.current = true;
    try {
      const data = stateToStoredData(state, state.authUser.email || undefined);
      await saveUserData(state.authUser.uid, data);
      pendingSaveRef.current = null;
      dispatch({ type: 'SET_SYNC_STATUS', status: 'saved' });
    } catch (error) {
      dispatch({ type: 'SET_SYNC_ERROR', error: mapFirebaseError(error) });
    } finally {
      isSavingRef.current = false;
    }
  }, [state]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_AUTH_LOADING', loading: true });
    dispatch({ type: 'SET_AUTH_ERROR', error: null });
    try {
      await signIn(email, password);
    } catch (error) {
      dispatch({ type: 'SET_AUTH_ERROR', error: mapFirebaseError(error) });
    } finally {
      dispatch({ type: 'SET_AUTH_LOADING', loading: false });
    }
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_AUTH_LOADING', loading: true });
    dispatch({ type: 'SET_AUTH_ERROR', error: null });
    try {
      await signUp(email, password);
    } catch (error) {
      dispatch({ type: 'SET_AUTH_ERROR', error: mapFirebaseError(error) });
    } finally {
      dispatch({ type: 'SET_AUTH_LOADING', loading: false });
    }
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    dispatch({ type: 'SET_AUTH_LOADING', loading: true });
    dispatch({ type: 'SET_AUTH_ERROR', error: null });
    try {
      await signInWithGoogle();
    } catch (error) {
      dispatch({ type: 'SET_AUTH_ERROR', error: mapFirebaseError(error) });
    } finally {
      dispatch({ type: 'SET_AUTH_LOADING', loading: false });
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    dispatch({ type: 'SET_AUTH_LOADING', loading: true });
    try {
      await firebaseSignOut();
      dispatch({ type: 'SIGN_OUT' });
    } catch (error) {
      dispatch({ type: 'SET_AUTH_ERROR', error: mapFirebaseError(error) });
    } finally {
      dispatch({ type: 'SET_AUTH_LOADING', loading: false });
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        navigate,
        goBack,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
        setAuthError,
        clearSyncError,
        retrySave,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
