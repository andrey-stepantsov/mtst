import { SelectedEvent } from '../types';

const EVENTS_KEY = 'selectedEvents';
const FILTERS_KEY = 'userFilters';

interface UserFilters {
  age: string;
  gender: string;
  swimmerName: string;
}

export function loadSelectedEvents(): { [course: string]: SelectedEvent[] } {
  try {
    const savedEvents = localStorage.getItem(EVENTS_KEY);
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      // Basic validation to ensure it's an object with SCY/LCM keys
      if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
        return { SCY: parsed.SCY || [], LCM: parsed.LCM || [] };
      }
    }
  } catch (error) {
    console.error("Could not load events from localStorage", error);
  }
  return { SCY: [], LCM: [] };
}

export function saveSelectedEvents(events: { [course: string]: SelectedEvent[] }): void {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error("Could not save events to localStorage", error);
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
