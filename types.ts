export type HabitStage = 
  | 'ATTEMPTING' 
  | 'PRACTICING' 
  | 'CONSISTENT' 
  | 'IDENTITY';

export type HabitStatus = 'ACTIVE' | 'STASIS';

export interface Habit {
  id: string;
  name: string;
  identityName: string;
  streakDays: number;
  lastLogged: Date | null;
  status: HabitStatus; // New field for Recovery Ritual
}

export interface FocusSession {
  isActive: boolean;
  startTime?: Date;
  intention?: string;
  verification?: string;
}

export interface User {
  id: string;
  name: string;
  habits: Habit[];
  focusSession: FocusSession;
  lastActive: Date;
  dailyWin?: string;
}

export interface AppState {
  currentUser: User;
  friends: User[];
  currentTime: Date;
  isJolted: boolean;
}