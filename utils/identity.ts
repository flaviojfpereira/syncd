import { HabitStage } from '../types';

export const getHabitStage = (days: number): HabitStage => {
  if (days < 8) return 'ATTEMPTING';
  if (days < 22) return 'PRACTICING';
  if (days < 67) return 'CONSISTENT';
  return 'IDENTITY';
};

export const getStageLabel = (days: number): string => {
  const stage = getHabitStage(days);
  return stage.charAt(0) + stage.slice(1).toLowerCase();
};

export const getIdentityLabel = (days: number, habit: string, identity: string): string => {
  const stage = getHabitStage(days);
  
  switch (stage) {
    case 'ATTEMPTING':
      return `ATTEMPTING ${habit.toUpperCase()}`;
    case 'PRACTICING':
      return `PRACTICING ${habit.toUpperCase()}`;
    case 'CONSISTENT':
      return `CONSISTENT ${habit.toUpperCase()}`;
    case 'IDENTITY':
      return `I AM A ${identity.toUpperCase()}`;
  }
};