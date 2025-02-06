import type { AssessmentState } from './types';
import { defaultState } from './reducer';

interface StoredState {
  version: string;
  state: AssessmentState;
  lastUpdated: number;  // Add timestamp
}

const STORAGE_KEY = 'assessment-state';
const CURRENT_VERSION = '1.0';

// Add version history for migrations
const VERSIONS = {
  '1.0': defaultState,
  // Add new versions here as the state structure evolves
};

export const persistenceManager = {
  save: (state: AssessmentState): void => {
    try {
      const storedState: StoredState = {
        version: CURRENT_VERSION,
        state,
        lastUpdated: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedState));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  },

  load: (): AssessmentState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return defaultState;

      const storedState = JSON.parse(saved) as StoredState;
      
      // Check if stored state is too old (e.g., 24 hours)
      const isExpired = Date.now() - (storedState.lastUpdated || 0) > 24 * 60 * 60 * 1000;
      if (isExpired) {
        console.log('Stored state expired, returning default state');
        persistenceManager.clear();
        return defaultState;
      }

      return persistenceManager.migrate(storedState);
    } catch (error) {
      console.error('Failed to load state:', error);
      return defaultState;
    }
  },

  migrate: (storedState: StoredState): AssessmentState => {
    const migrations: Record<string, (state: AssessmentState) => AssessmentState> = {
      '1.0': (state) => state,
      // Add migration functions for future versions
      // '1.1': (state) => ({ ...state, newField: defaultValue }),
    };

    let currentState = storedState.state;
    const versions = Object.keys(VERSIONS);
    const startIdx = versions.indexOf(storedState.version);
    
    // Apply all migrations from stored version to current version
    for (let i = startIdx + 1; i < versions.length; i++) {
      const migrate = migrations[versions[i]];
      if (migrate) {
        currentState = migrate(currentState);
      }
    }

    return currentState;
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear state:', error);
    }
  }
}; 