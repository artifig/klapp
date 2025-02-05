import type { AssessmentState } from './types';
import { defaultState } from './reducer';

interface StoredState {
  version: string;
  state: AssessmentState;
}

const STORAGE_KEY = 'assessment-state';
const CURRENT_VERSION = '1.0';

export const persistenceManager = {
  save: (state: AssessmentState): void => {
    try {
      const storedState: StoredState = {
        version: CURRENT_VERSION,
        state
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedState));
    } catch (error) {
      console.error('Failed to save state:', error);
      // Optionally handle storage quota exceeded
    }
  },

  load: (): AssessmentState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return defaultState;

      const storedState = JSON.parse(saved) as StoredState;
      return persistenceManager.migrate(storedState);
    } catch (error) {
      console.error('Failed to load state:', error);
      return defaultState;
    }
  },

  migrate: (storedState: StoredState): AssessmentState => {
    // Handle version migrations here
    switch (storedState.version) {
      case '1.0':
        return storedState.state;
      default:
        console.warn(`Unknown state version: ${storedState.version}, resetting to default`);
        return defaultState;
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear state:', error);
    }
  }
}; 