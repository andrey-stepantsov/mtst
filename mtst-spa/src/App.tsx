import { useState, useMemo, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import './AppGrid.css';
import './AppBar.css';
import './Profile.css';
import { SelectedEvent, StandardTime, SwimmerProfiles } from './types';
import { ALL_EVENTS } from './constants';
import { getCutInfo } from './utils/standards';
import { useStandards } from './hooks/useStandards';
import {
  loadProfiles,
  saveProfiles,
  loadActiveSwimmerName,
  saveActiveSwimmerName,
} from './utils/persistence';

const AGE_BRACKETS = ["10&U", "11-12", "13-14"];

interface EventRowProps {
  course: 'SCY' | 'LCM';
  index: number;
  event: SelectedEvent;
  standards: StandardTime[] | undefined;
  handleRemoveEvent: (course: 'SCY' | 'LCM', eventToRemoveName: string) => void;
  handleTimeChange: (course: 'SCY' | 'LCM', eventName: string, newTime: string) => void;
  getEventStandards: (eventName: string, standards: StandardTime[] | undefined) => StandardTime | undefined;
}

const EventRow = ({
  course,
  index,
  event,
  standards,
  handleRemoveEvent,
  handleTimeChange,
  getEventStandards,
}: EventRowProps) => {
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => handleRemoveEvent(course, event.name),
    disabled: !isMobile,
  });

  const eventStandards = getEventStandards(event.name, standards);
  const cutInfo = getCutInfo(event.time, eventStandards);
  const rowClass = index % 2 === 1 ? 'odd-row' : 'even-row';

  return (
    <div {...handlers} className={`event-row-wrapper ${rowClass}`}>
      <div className="grid-cell event-name-cell">{event.name}</div>
      <div className="grid-cell">
        <input
          type="text"
          value={event.time}
          onChange={(e) => handleTimeChange(course, event.name, e.target.value)}
          placeholder="mm:ss.ff"
          title="Enter time in mm:ss.ff format (minutes:seconds.hundredths)"
        />
      </div>
      <div className="grid-cell">{cutInfo.achievedCut}</div>
      <div className="grid-cell">{cutInfo.nextCut || 'N/A'}</div>
      <div className="grid-cell">
        {cutInfo.absoluteDiff && cutInfo.relativeDiff
          ? `${cutInfo.absoluteDiff} / ${cutInfo.relativeDiff}`
          : 'N/A'}
      </div>
      <div className="grid-cell action-cell">
        {isMobile ? (
          <span className="swipe-hint" title="Swipe left to delete">&larr;</span>
        ) : (
          <button onClick={() => handleRemoveEvent(course, event.name)} className="icon-button remove-button" title={`Remove ${course} event`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
      </div>
    </div>
  );
};

interface AppBarProps {
  swimmerName: string;
  age: string;
  gender: string;
  onEdit: () => void;
}

const AppBar = ({ swimmerName, age, gender, onEdit }: AppBarProps) => {
  return (
    <header className="app-bar">
      <div className="app-bar-control">
        <input
          id="app-bar-swimmer-name"
          type="text"
          value={swimmerName}
          placeholder="Swimmer Name"
          readOnly
        />
      </div>
      <div className="app-bar-control">
        <label htmlFor="app-bar-age-select">Age:</label>
        <select id="app-bar-age-select" value={age} disabled>
          {AGE_BRACKETS.map((ageBracket) => (
            <option key={ageBracket} value={ageBracket}>{ageBracket}</option>
          ))}
        </select>
      </div>
      <div className="app-bar-control">
        <label htmlFor="app-bar-gender-select">Gender:</label>
        <select id="app-bar-gender-select" value={gender} disabled>
          <option value="Boys">Boys</option>
          <option value="Girls">Girls</option>
        </select>
      </div>
      <button onClick={onEdit} className="icon-button edit-profile-button" title="Edit Profile">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
      </button>
    </header>
  );
};

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (profile: { swimmerName: string; age: string; gender: string }) => void;
  currentProfile: { swimmerName: string; age: string; gender: string };
  swimmerNames: string[];
  onSwitchProfile: (name: string) => void;
}

const Profile = ({ isOpen, onClose, onConfirm, currentProfile, swimmerNames, onSwitchProfile }: ProfileProps) => {
  const [name, setName] = useState(currentProfile.swimmerName);
  const [age, setAge] = useState(currentProfile.age);
  const [gender, setGender] = useState(currentProfile.gender);

  useEffect(() => {
    if (isOpen) {
      setName(currentProfile.swimmerName);
      setAge(currentProfile.age);
      setGender(currentProfile.gender);
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({ swimmerName: name, age, gender });
    onClose();
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSwitchProfile(e.target.value);
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Profile</h2>

        {swimmerNames.length > 1 && (
          <div className="profile-control">
            <label htmlFor="profile-switch">Switch Profile:</label>
            <select id="profile-switch" value={currentProfile.swimmerName} onChange={handleSwitch}>
              {swimmerNames.map((swimmerName) => (
                <option key={swimmerName} value={swimmerName}>{swimmerName}</option>
              ))}
            </select>
          </div>
        )}

        <div className="profile-control">
          <label htmlFor="profile-name">Swimmer Name:</label>
          <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="profile-control">
          <label htmlFor="profile-age">Age:</label>
          <select id="profile-age" value={age} onChange={(e) => setAge(e.target.value)}>
            {AGE_BRACKETS.map((ageBracket) => (
              <option key={ageBracket} value={ageBracket}>{ageBracket}</option>
            ))}
          </select>
        </div>
        <div className="profile-control">
          <label htmlFor="profile-gender">Gender:</label>
          <select id="profile-gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
          </select>
        </div>
        <button onClick={handleConfirm} className="profile-confirm-button">Confirm</button>
      </div>
    </div>
  );
};

function App() {
  const [profiles, setProfiles] = useState<SwimmerProfiles>(loadProfiles());
  const [activeSwimmerName, setActiveSwimmerName] = useState<string>(() => {
    const savedName = loadActiveSwimmerName();
    const profileKeys = Object.keys(profiles);
    if (savedName && profileKeys.includes(savedName)) {
      return savedName;
    }
    return profileKeys[0] || 'swimmer'; // Fallback
  });

  // Derived state for the active profile
  const activeProfile = profiles[activeSwimmerName];
  const { age, gender, selectedEvents } = activeProfile;

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // State to manage the currently selected event in each dropdown
  const [scySelectedEventInDropdown, setScySelectedEventInDropdown] = useState('');
  const [lcmSelectedEventInDropdown, setLcmSelectedEventInDropdown] = useState('');

  const { standardsForSelectedFilters: scyStandards, isLoading: isLoadingScy } = useStandards(age, gender, 'SCY');
  const { standardsForSelectedFilters: lcmStandards, isLoading: isLoadingLcm } = useStandards(age, gender, 'LCM');

  // Persist profiles to localStorage
  useEffect(() => {
    saveProfiles(profiles);
  }, [profiles]);

  // Persist active swimmer name to localStorage
  useEffect(() => {
    saveActiveSwimmerName(activeSwimmerName);
  }, [activeSwimmerName]);

  // Helper function to get standards for a specific event based on current filters
  const getEventStandards = (eventName: string, standards: StandardTime[] | undefined): StandardTime | undefined => {
    return standards?.find(s => s.Event === eventName);
  };

  // Helper to generate available events for a dropdown
  const createEventsForDropdown = (
    standards: StandardTime[] | undefined,
    currentSelectedEvents: SelectedEvent[]
  ) => {
    if (!standards) return [];
    const standardsEvents = new Set(standards.map(s => s.Event));
    const selectedEventNames = new Set(currentSelectedEvents.map(se => se.name));
    return ALL_EVENTS.filter(event => standardsEvents.has(event) && !selectedEventNames.has(event));
  };

  const scyEventsForDropdown = useMemo(() => createEventsForDropdown(scyStandards, selectedEvents.SCY || []), [scyStandards, selectedEvents]);
  const lcmEventsForDropdown = useMemo(() => createEventsForDropdown(lcmStandards, selectedEvents.LCM || []), [lcmStandards, selectedEvents]);

  // Custom hook to manage dropdown selection state
  const useUpdateDropdownSelection = (
    eventsForDropdown: string[],
    selectedEvent: string,
    setSelectedEvent: (value: string) => void
  ) => {
    useEffect(() => {
      if (eventsForDropdown.length > 0) {
        if (!eventsForDropdown.includes(selectedEvent)) {
          setSelectedEvent(eventsForDropdown[0]);
        }
      } else {
        if (selectedEvent !== '') {
          setSelectedEvent('');
        }
      }
    }, [eventsForDropdown, selectedEvent, setSelectedEvent]);
  };

  useUpdateDropdownSelection(scyEventsForDropdown, scySelectedEventInDropdown, setScySelectedEventInDropdown);
  useUpdateDropdownSelection(lcmEventsForDropdown, lcmSelectedEventInDropdown, setLcmSelectedEventInDropdown);

  const handleAddEvent = (course: 'SCY' | 'LCM') => {
    const eventNameToAdd = course === 'SCY' ? scySelectedEventInDropdown : lcmSelectedEventInDropdown;
    if (!eventNameToAdd) return;

    setProfiles(prevProfiles => {
      const newProfiles = { ...prevProfiles };
      const currentProfile = { ...newProfiles[activeSwimmerName] };
      
      if (currentProfile.selectedEvents[course]?.some(e => e.name === eventNameToAdd)) {
        return prevProfiles; // No change
      }

      currentProfile.selectedEvents = {
        ...currentProfile.selectedEvents,
        [course]: [...(currentProfile.selectedEvents[course] || []), { name: eventNameToAdd, time: '' }],
      };
      newProfiles[activeSwimmerName] = currentProfile;
      return newProfiles;
    });
  };

  const handleRemoveEvent = (course: 'SCY' | 'LCM', eventToRemoveName: string) => {
    setProfiles(prevProfiles => {
      const newProfiles = { ...prevProfiles };
      const currentProfile = { ...newProfiles[activeSwimmerName] };
      currentProfile.selectedEvents = {
        ...currentProfile.selectedEvents,
        [course]: currentProfile.selectedEvents[course].filter((event) => event.name !== eventToRemoveName),
      };
      newProfiles[activeSwimmerName] = currentProfile;
      return newProfiles;
    });
  };

  const handleTimeChange = (course: 'SCY' | 'LCM', eventName: string, newTime: string) => {
    setProfiles(prevProfiles => {
      const newProfiles = { ...prevProfiles };
      const currentProfile = { ...newProfiles[activeSwimmerName] };
      currentProfile.selectedEvents = {
        ...currentProfile.selectedEvents,
        [course]: currentProfile.selectedEvents[course].map((event) =>
          event.name === eventName ? { ...event, time: newTime } : event,
        ),
      };
      newProfiles[activeSwimmerName] = currentProfile;
      return newProfiles;
    });
  };

  const handleProfileConfirm = (profileUpdate: { swimmerName: string; age: string; gender: string }) => {
    const { swimmerName: newName, age: newAge, gender: newGender } = profileUpdate;
    const oldName = activeSwimmerName;

    setProfiles(prevProfiles => {
      const newProfiles = { ...prevProfiles };

      if (newName !== oldName) {
        // Name changed, need to rename the key
        if (newProfiles[newName]) {
          alert(`A profile with the name "${newName}" already exists.`);
          return prevProfiles; // Abort update
        }
        const profileData = newProfiles[oldName];
        delete newProfiles[oldName];
        newProfiles[newName] = {
          ...profileData,
          age: newAge,
          gender: newGender,
        };
      } else {
        // Name is the same, just update age and gender
        newProfiles[newName] = {
          ...newProfiles[newName],
          age: newAge,
          gender: newGender,
        };
      }
      return newProfiles;
    });

    // If name changed, update the active swimmer name state
    if (newName !== oldName) {
      setActiveSwimmerName(newName);
    }
  };

  // Render function for the events grid to avoid duplicating JSX
  const renderEventsGrid = (course: 'SCY' | 'LCM', events: SelectedEvent[], standards: StandardTime[] | undefined) => {
    if (!events || events.length === 0) return null;

    return (
      <div className="selected-events-grid">
        <div className="grid-header-wrapper">
          <div className="grid-header">Event</div>
          <div className="grid-header">Time</div>
          <div className="grid-header">My Cut</div>
          <div className="grid-header">Next Cut</div>
          <div className="grid-header">Difference</div>
          <div className="grid-header"></div>
        </div>

        {events.map((event, index) => (
          <EventRow
            key={event.name}
            index={index}
            course={course}
            event={event}
            standards={standards}
            handleRemoveEvent={handleRemoveEvent}
            handleTimeChange={handleTimeChange}
            getEventStandards={getEventStandards}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <AppBar
        swimmerName={activeSwimmerName}
        age={age}
        gender={gender}
        onEdit={() => setIsProfileModalOpen(true)}
      />
      <Profile
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onConfirm={handleProfileConfirm}
        currentProfile={{ swimmerName: activeSwimmerName, age, gender }}
        swimmerNames={Object.keys(profiles)}
        onSwitchProfile={handleSwitchProfile}
      />
      <main className="main-content">
        <div className="card">
          <div className="course-groups-container">
            {/* SCY Group */}
            <div className="course-group">
              <h2>SCY Events</h2>
              <div className="controls-grid">
                <div className="event-select-wrapper">
                  <label htmlFor="scy-event-select">Event:</label>
                  {isLoadingScy && <span className="loading-indicator"> Loading...</span>}
                  <select
                    id="scy-event-select"
                    value={scySelectedEventInDropdown}
                    onChange={(e) => setScySelectedEventInDropdown(e.target.value)}
                    disabled={scyEventsForDropdown.length === 0}
                  >
                    {scyEventsForDropdown.length > 0 ? (
                      scyEventsForDropdown.map((event) => <option key={event} value={event}>{event}</option>)
                    ) : (
                      <option value="" disabled>No events available</option>
                    )}
                  </select>
                </div>
                <button onClick={() => handleAddEvent('SCY')} disabled={scyEventsForDropdown.length === 0} className="icon-button add-button" title="Add SCY event">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
              {renderEventsGrid('SCY', selectedEvents.SCY || [], scyStandards)}
            </div>

            {/* LCM Group */}
            <div className="course-group">
              <h2>LCM Events</h2>
              <div className="controls-grid">
                <div className="event-select-wrapper">
                  <label htmlFor="lcm-event-select">Event:</label>
                  {isLoadingLcm && <span className="loading-indicator"> Loading...</span>}
                  <select
                    id="lcm-event-select"
                    value={lcmSelectedEventInDropdown}
                    onChange={(e) => setLcmSelectedEventInDropdown(e.target.value)}
                    disabled={lcmEventsForDropdown.length === 0}
                  >
                    {lcmEventsForDropdown.length > 0 ? (
                      lcmEventsForDropdown.map((event) => <option key={event} value={event}>{event}</option>)
                    ) : (
                      <option value="" disabled>No events available</option>
                    )}
                  </select>
                </div>
                <button onClick={() => handleAddEvent('LCM')} disabled={lcmEventsForDropdown.length === 0} className="icon-button add-button" title="Add LCM event">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
              {renderEventsGrid('LCM', selectedEvents.LCM || [], lcmStandards)}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
