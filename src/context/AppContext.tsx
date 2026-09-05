import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import type { AppState, Screen, ChildProfile, ParentNote, ChatMessage, Notification, ProfileSetupMode } from '../types';
import { signIn, signUp, signInWithGoogle, sendPasswordReset, signOut as firebaseSignOut, observeAuth } from '../firebase/auth';
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
    authInitialized: false,
    userDataLoading: false,
    authError: null,
    authErrorCode: null,
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
  | { type: 'SET_AUTH_INITIALIZED'; initialized: boolean }
  | { type: 'SET_USER_DATA_LOADING'; loading: boolean }
  | { type: 'SET_AUTH_ERROR'; error: string | null; code?: string | null }
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
    case 'SET_AUTH_INITIALIZED':
      return { ...state, authInitialized: action.initialized };
    case 'SET_USER_DATA_LOADING':
      return { ...state, userDataLoading: action.loading };
    case 'SET_AUTH_ERROR':
      return { ...state, authError: action.error, authErrorCode: action.code ?? null };
    case 'SET_SYNC_ERROR':
      return { ...state, syncError: action.error, syncStatus: action.error ? 'error' : state.syncStatus };
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.status, syncError: action.status === 'error' ? state.syncError : null };
    case 'LOAD_FIREBASE_STATE': {
      // Firestore only owns persisted app data. Never let a loaded state replace
      // the active Firebase Auth session or its in-flight bootstrap flags.
      const merged = {
        ...state,
        ...action.state,
        authUser: state.authUser,
        authLoading: state.authLoading,
        authInitialized: state.authInitialized,
        userDataLoading: state.userDataLoading,
        authError: state.authError,
        authErrorCode: state.authErrorCode,
      };
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
        authInitialized: true,
        userDataLoading: false,
        authError: null,
        authErrorCode: null,
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
  sendPasswordReset: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  setAuthError: (error: string | null) => void;
  clearSyncError: () => void;
  retrySave: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

function getFirebaseErrorCode(error: unknown): string | null {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : null;
}

function mapFirebaseError(error: unknown): string {
  switch (getFirebaseErrorCode(error)) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found. Please sign up first to create your CareSync account.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or reset your password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-credential':
      return 'We could not log you in. Check your email and password, or sign up if you are new to CareSync.';
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled for this Firebase project.';
    case 'auth/unauthorized-continue-uri':
    case 'auth/invalid-continue-uri':
    case 'auth/missing-continue-uri':
      return 'Password reset cannot be sent because this site domain is not authorized.';
    case 'auth/invalid-api-key':
      return 'CareSync could not connect to Firebase. Please check the deployed Firebase configuration.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please wait a moment before trying again.';
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

  // Resolve Firebase Auth before routing. A signed-in user is never sent back to
  // the login screen while the initial observer callback or user-data load runs.
  useEffect(() => {
    dispatch({ type: 'SET_AUTH_LOADING', loading: true });
    unsubscribeAuthRef.current = observeAuth(
      (user) => {
        if (!user) {
          unsubscribeDataRef.current?.();
          unsubscribeDataRef.current = null;
          dispatch({ type: 'SIGN_OUT' });
          return;
        }

        dispatch({ type: 'SET_AUTH_USER', user });
        dispatch({ type: 'SET_AUTH_INITIALIZED', initialized: true });
        dispatch({ type: 'SET_AUTH_LOADING', loading: false });
        dispatch({ type: 'SET_USER_DATA_LOADING', loading: true });
      },
      (error) => {
        dispatch({ type: 'SIGN_OUT' });
        dispatch({ type: 'SET_AUTH_ERROR', error: mapFirebaseError(error), code: getFirebaseErrorCode(error) });
      },
    );

    return () => {
      unsubscribeAuthRef.current?.();
    };
  }, []);

  // Bootstrap a user's Firestore document before subscribing. Starting the
  // listener afterward avoids it routing to the splash screen with stale data.
  useEffect(() => {
    const authUser = state.authUser;
    if (!authUser || !state.authInitialized) {
      unsubscribeDataRef.current?.();
      unsubscribeDataRef.current = null;
      return;
    }

    let isCurrent = true;
    const uid = authUser.uid;
    const email = authUser.email || '';
    dispatch({ type: 'SET_USER_DATA_LOADING', loading: true });

    const bootstrapUserData = async () => {
      try {
        let data = await loadUserData(uid);
        if (!isCurrent) return;

        if (!data) {
          // A newly created Firebase account has no document yet. Create it
          // without merging a fresh AppState that would clear authUser.
          const fresh = createInitialUserState();
          data = await createUserData(uid, email, fresh.notifications);
          if (!isCurrent) return;
        }

        const loadedState = storedDataToState(data, uid);
        const entryScreen = loadedState.childProfile ? 'home' : 'profile-setup';
        dispatch({
          type: 'LOAD_FIREBASE_STATE',
          state: {
            ...loadedState,
            currentScreen: entryScreen,
            previousScreen: null,
            history: [entryScreen],
            profileSetupMode: 'create',
            editingChildId: null,
          },
        });
        dispatch({ type: 'SET_SYNC_STATUS', status: 'saved' });

        // Subscribe only after the initial document has selected the entry screen.
        unsubscribeDataRef.current = subscribeToUserData(
          uid,
          (updatedData) => {
            if (!updatedData) return;
            dispatch({
              type: 'LOAD_FIREBASE_STATE',
              state: storedDataToState(updatedData, uid),
            });
            dispatch({ type: 'SET_SYNC_STATUS', status: 'saved' });
          },
          (error) => {
            dispatch({ type: 'SET_SYNC_ERROR', error: mapFirebaseError(error) });
          },
        );
      } catch (error) {
        if (!isCurrent) return;
        dispatch({ type: 'SET_SYNC_ERROR', error: mapFirebaseError(error) });
      } finally {
        if (isCurrent) dispatch({ type: 'SET_USER_DATA_LOADING', loading: false });
      }
    };

    void bootstrapUserData();

    return () => {
      isCurrent = false;
      unsubscribeDataRef.current?.();
      unsubscribeDataRef.current = null;
    };
  }, [state.authUser, state.authInitialized]);

  // Save state changes to Firestore (debounced)
  useEffect(() => {
    // Never save the blank in-memory state while authenticated data is still
    // loading, or after Firestore reported an error.
    if (!state.authUser || state.authLoading || state.userDataLoading || state.syncError) return;
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
    state.userDataLoading,
    state.syncError,
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
      // Keep the form loading until onAuthStateChanged confirms the session.
    } catch (error) {
      dispatch({ type: 'SET_AUTH_ERROR', error: mapFirebaseError(error), code: getFirebaseErrorCode(error) });
      dispatch({ type: 'SET_AUTH_LOADING', loading: false });
    }
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_AUTH_LOADING', loading: true });
    dispatch({ type: 'SET_AUTH_ERROR', error: null });
    try {
      await signUp(email, password);
      // The confirmed auth observer routes a new account to Profile Setup.
    } catch (error) {
      dispatch({ type: 'SET_AUTH_ERROR', error: mapFirebaseError(error), code: getFirebaseErrorCode(error) });
      dispatch({ type: 'SET_AUTH_LOADING', loading: false });
    }
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    dispatch({ type: 'SET_AUTH_LOADING', loading: true });
    dispatch({ type: 'SET_AUTH_ERROR', error: null });
    try {
      await signInWithGoogle();
      // Keep the form loading until onAuthStateChanged confirms the session.
    } catch (error) {
      dispatch({ type: 'SET_AUTH_ERROR', error: mapFirebaseError(error), code: getFirebaseErrorCode(error) });
      dispatch({ type: 'SET_AUTH_LOADING', loading: false });
    }
  }, []);

  const handlePasswordReset = useCallback(async (email: string) => {
    dispatch({ type: 'SET_AUTH_LOADING', loading: true });
    dispatch({ type: 'SET_AUTH_ERROR', error: null });
    try {
      await sendPasswordReset(email);
      return true;
    } catch (error) {
      dispatch({ type: 'SET_AUTH_ERROR', error: mapFirebaseError(error), code: getFirebaseErrorCode(error) });
      return false;
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
      dispatch({ type: 'SET_AUTH_ERROR', error: mapFirebaseError(error), code: getFirebaseErrorCode(error) });
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
        sendPasswordReset: handlePasswordReset,
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
