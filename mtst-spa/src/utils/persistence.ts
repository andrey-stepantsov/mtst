import { SelectedEvent } from '../types';

const SELECTED_EVENTS_KEY = 'selectedEvents';
const FILTERS_KEY = 'userFilters';

interface UserFilters {
  age: string;
  gender: string;
  course: string;
}

export function loadSelectedEvents(): SelectedEvent[] {
  try {
    const savedEvents = localStorage.getItem(SELECTED_EVENTS_KEY);
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Could not load events from localStorage", error);
  }
  return [];
}

export function saveSelectedEvents(events: SelectedEvent[]): void {
  try {
    localStorage.setItem(SELECTED_EVENTS_KEY, JSON.stringify(events));
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
