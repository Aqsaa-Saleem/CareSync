import type { User } from 'firebase/auth';

export type SupportNeed = 'autism' | 'speech' | 'motor' | 'visual' | 'hearing' | 'multiple' | 'unsure';
export type DiagnosisStatus = 'diagnosed' | 'under_assessment' | 'not_diagnosed' | 'prefer_not_to_say';
export type Gender = 'male' | 'female' | 'other';
export type ProfileSetupMode = 'create' | 'add' | 'edit';

export interface ChildProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: Gender;
  city: string;
  province: string;
  supportNeed: SupportNeed;
  diagnosisStatus: DiagnosisStatus;
  parentName: string;
  avatar?: string;
  photo?: string | null;
}

export interface Activity {
  id: string;
  name: string;
  category: SupportNeed | 'sensory' | 'communication';
  ageRange: string;
  duration: number;
  description: string;
  purpose: string;
  materials: string[];
  steps: string[];
  safetyNote: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  imageEmoji: string;
  activityType: 'Sensory Play' | 'Communication Game' | 'Motor Exercise' | 'Cognitive Task' | 'Daily Living' | 'Social Skill' | 'Creative Play' | 'Routine Practice';
  skillArea: 'Fine Motor' | 'Gross Motor' | 'Communication' | 'Social Interaction' | 'Sensory Processing' | 'Cognitive' | 'Emotional Regulation' | 'Visual Skills' | 'Auditory Skills' | 'Daily Living';
}

export interface Professional {
  id: string;
  name: string;
  specialization: string;
  supportArea: string;
  city: string;
  province: string;
  clinic: string;
  address: string;
  phone: string;
  availability: string;
  website: string;
  verified: boolean;
}

export interface Centre {
  id: string;
  name: string;
  type: string;
  city: string;
  province: string;
  supportArea: string;
  services: string[];
  phone: string;
  address: string;
  verified: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface ParentNote {
  id: string;
  date: string;
  category: string;
  note: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface ActivityProgress {
  activityId: string;
  completed: boolean;
  completedAt?: string;
  saved: boolean;
}

export type Screen =
  | 'splash'
  | 'onboarding'
  | 'profile-setup'
  | 'home'
  | 'activities'
  | 'activity-detail'
  | 'care-ai'
  | 'centres'
  | 'centre-detail'
  | 'professionals'
  | 'professional-detail'
  | 'progress'
  | 'profile'
  | 'settings'
  | 'notifications'
  | 'parent-notes'
  | 'add-note'
  | 'help-support'
  | 'saved-activities'
  | 'child-profile'
  | 'about'
  | 'privacy';

export interface AppState {
  currentScreen: Screen;
  previousScreen: Screen | null;
  history: Screen[];
  userId: string;
  childProfile: ChildProfile | null;
  children: ChildProfile[];
  activeChildId: string | null;
  profileSetupMode: ProfileSetupMode;
  editingChildId: string | null;
  onboardingStep: number;
  completedActivities: string[];
  savedActivities: string[];
  parentNotes: ParentNote[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  streak: number;
  selectedActivityId: string | null;
  selectedCentreId: string | null;
  selectedProfessionalId: string | null;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  language: 'en' | 'ur';
  authUser: User | null;
  authLoading: boolean;
  authError: string | null;
  syncError: string | null;
  syncStatus: 'idle' | 'saving' | 'saved' | 'error';
}
