import { SwimmerProfiles, SwimmerProfile } from '../types';

const PROFILES_KEY = 'swimmerProfiles';
const ACTIVE_SWIMMER_KEY = 'activeSwimmerName';

// For migration from the old single-swimmer format
const OLD_EVENTS_KEY = 'selectedEvents';
const OLD_FILTERS_KEY = 'userFilters';

export function loadProfiles(): SwimmerProfiles {
  const savedProfiles = localStorage.getItem(PROFILES_KEY);
  if (savedProfiles) {
    try {
      return JSON.parse(savedProfiles);
    } catch (e) {
      console.error("Could not parse swimmer profiles from localStorage", e);
    }
  }

  // Migration from old format
  const oldFiltersJSON = localStorage.getItem(OLD_FILTERS_KEY);
  const oldEventsJSON = localStorage.getItem(OLD_EVENTS_KEY);

  if (oldFiltersJSON && oldEventsJSON) {
    try {
      const oldFilters = JSON.parse(oldFiltersJSON);
      const oldEvents = JSON.parse(oldEventsJSON);

      const swimmerName = oldFilters.swimmerName || 'swimmer';
      const age = oldFilters.age || '10&U';
      const gender = oldFilters.gender || 'Girls';
      const selectedEvents = { SCY: oldEvents.SCY || [], LCM: oldEvents.LCM || [] };

      const migratedProfile: SwimmerProfile = { age, gender, selectedEvents };
      const migratedProfiles: SwimmerProfiles = { [swimmerName]: migratedProfile };

      saveProfiles(migratedProfiles);
      saveActiveSwimmerName(swimmerName);

      // Clean up old data
      localStorage.removeItem(OLD_EVENTS_KEY);
      localStorage.removeItem(OLD_FILTERS_KEY);

      console.log("Successfully migrated old data to new profile format.");
      return migratedProfiles;

    } catch (e) {
      console.error("Failed to migrate old data", e);
    }
  }

  // Default for a brand new user
  const defaultProfile: SwimmerProfile = {
    age: '10&U',
    gender: 'Girls',
    selectedEvents: { SCY: [], LCM: [] },
  };
  return { 'swimmer': defaultProfile };
}

export function saveProfiles(profiles: SwimmerProfiles): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error("Could not save profiles to localStorage", e);
  }
}

export function loadActiveSwimmerName(): string | null {
  return localStorage.getItem(ACTIVE_SWIMMER_KEY);
}

export function saveActiveSwimmerName(name: string): void {
  localStorage.setItem(ACTIVE_SWIMMER_KEY, name);
}
