import { SelectedEvent, Swimmer } from '../types';

const SWIMMERS_KEY = 'swimmers';
const FILTERS_KEY = 'userFilters';

interface UserFilters {
  age: string;
  gender: string;
}

export function loadSwimmers(): Swimmer[] {
  const savedSwimmers = localStorage.getItem(SWIMMERS_KEY);
  if (savedSwimmers) {
    try {
      return JSON.parse(savedSwimmers);
    } catch (error) {
      console.error("Could not load swimmers from localStorage", error);
    }
  }

  // Migration from old format
  const oldSavedEvents = localStorage.getItem('selectedEvents'); // Old key
  if (oldSavedEvents) {
    try {
      const parsed = JSON.parse(oldSavedEvents);
      let selectedEvents = { SCY: [], LCM: [] };

      if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
        selectedEvents = { ...selectedEvents, ...parsed };
      } else if (Array.isArray(parsed)) {
        selectedEvents.SCY = parsed;
      }

      const migratedSwimmer: Swimmer = {
        id: `swimmer-${Date.now()}`,
        name: 'Swimmer 1',
        selectedEvents: selectedEvents,
      };
      
      saveSwimmers([migratedSwimmer]);
      localStorage.removeItem('selectedEvents');
      
      return [migratedSwimmer];
    } catch (error) {
      console.error("Could not migrate old events from localStorage", error);
    }
  }

  // Default for new user
  return [{
    id: `swimmer-${Date.now()}`,
    name: 'Swimmer 1',
    selectedEvents: { SCY: [], LCM: [] },
  }];
}

export function saveSwimmers(swimmers: Swimmer[]): void {
  try {
    localStorage.setItem(SWIMMERS_KEY, JSON.stringify(swimmers));
  } catch (error) {
    console.error("Could not save swimmers to localStorage", error);
  }
}

export function loadUserFilters(): Partial<UserFilters> {
  try {
    const savedFilters = localStorage.getItem(FILTERS_KEY);
    return savedFilters ? JSON.parse(savedFilters) : {};
  } catch (error) {
    console.error("Could not load filters from localStorage", error);
    return {};
  }
}

export function saveUserFilters(filters: UserFilters): void {
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error("Could not save filters to localStorage", error);
  }
}
