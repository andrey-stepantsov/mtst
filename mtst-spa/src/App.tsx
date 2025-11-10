import { useState, useMemo, useEffect, Fragment } from 'react';
import './AppGrid.css';
import { SelectedEvent, StandardTime } from './types';
import { ALL_EVENTS } from './constants';
import { getCutInfo } from './utils/standards';
import { useStandards } from './hooks/useStandards';
import {
  loadSelectedEvents,
  saveSelectedEvents,
  loadUserFilters,
  saveUserFilters,
} from './utils/persistence';

function App() {
  const [selectedEvents, setSelectedEvents] = useState<SelectedEvent[]>(loadSelectedEvents);

  // State for filter selections
  const initialFilters = loadUserFilters();
  const [age, setAge] = useState(initialFilters.age || "10&U");
  const [gender, setGender] = useState(initialFilters.gender || "Girls");
  const [course, setCourse] = useState(initialFilters.course || "SCY");

  // NEW: State to manage the currently selected event in the dropdown
  const [selectedEventInDropdown, setSelectedEventInDropdown] = useState('');

  const { standardsForSelectedFilters, isLoading } = useStandards(age, gender, course);

  // Persist selected events to localStorage
  useEffect(() => {
    saveSelectedEvents(selectedEvents);
  }, [selectedEvents]);

  // Persist filters to localStorage
  useEffect(() => {
    saveUserFilters({ age, gender, course });
  }, [age, gender, course]);

  // Helper function to get standards for a specific event based on current filters
  const getEventStandards = (eventName: string): StandardTime | undefined => {
    return standardsForSelectedFilters?.find(s => s.Event === eventName);
  };

  // Memoized list of events for the dropdown, derived from filters and selected events
  const eventsForDropdown = useMemo(() => {
    if (!standardsForSelectedFilters) {
      return []; // No standards found for the current selection
    }

    const standardsEvents = new Set(standardsForSelectedFilters.map(s => s.Event));
    const selectedEventNames = new Set(selectedEvents.map(se => se.name));

    // Filter ALL_EVENTS to include only those present in current standards
    // and not already selected by the user.
    return ALL_EVENTS.filter(event =>
      standardsEvents.has(event) && !selectedEventNames.has(event)
    );
  }, [selectedEvents, standardsForSelectedFilters]); // Re-calculate when these dependencies change

  // NEW: useEffect to manage the selectedEventInDropdown state
  useEffect(() => {
    if (eventsForDropdown.length > 0) {
      // If there are events, and the current selection is not valid or empty,
      // set it to the first available event.
      if (!eventsForDropdown.includes(selectedEventInDropdown)) {
        setSelectedEventInDropdown(eventsForDropdown[0]);
      }
    } else {
      // If no events are available, clear the selection.
      if (selectedEventInDropdown !== '') {
        setSelectedEventInDropdown('');
      }
    }
  }, [eventsForDropdown, selectedEventInDropdown]); // Re-run when eventsForDropdown or selectedEventInDropdown changes

  const handleAddEvent = () => {
    // MODIFIED: Use selectedEventInDropdown state instead of ref
    const eventNameToAdd = selectedEventInDropdown;
    if (eventNameToAdd && !selectedEvents.some(e => e.name === eventNameToAdd)) {
      setSelectedEvents((prev) => [...prev, { name: eventNameToAdd, time: '' }]);
    }
  };

  const handleRemoveEvent = (eventToRemoveName: string) => {
    setSelectedEvents((prev) => prev.filter((event) => event.name !== eventToRemoveName));
    // No need to manually update availableEvents. eventsForDropdown will re-calculate.
  };

  const handleTimeChange = (eventName: string, newTime: string) => {
    setSelectedEvents((prev) =>
      prev.map((event) =>
        event.name === eventName ? { ...event, time: newTime } : event
      )
    );
  };

  return (
    <>
      <div className="card">
        <div className="top-controls">
          <div>
            <label htmlFor="age-select">Age:</label>
            <select id="age-select" value={age} onChange={(e) => setAge(e.target.value)}>
              {["10&U", "11-12", "13-14", "15-16", "17-18"].map((ageBracket) => (
                <option key={ageBracket} value={ageBracket}>{ageBracket}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gender-select">Gender:</label>
            <select id="gender-select" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
            </select>
          </div>
        </div>
        <div className="controls-grid">
          <div>
            <label htmlFor="course-select">Course:</label>
            <select id="course-select" value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="SCY">SCY</option>
              <option value="LCM">LCM</option>
            </select>
          </div>

          <div>
            <label htmlFor="event-select">Event:</label>
            {isLoading && <span className="loading-indicator"> Loading...</span>}
            {/* MODIFIED: Bind value to selectedEventInDropdown state and remove ref */}
            <select
              id="event-select"
              value={selectedEventInDropdown}
              onChange={(e) => setSelectedEventInDropdown(e.target.value)}
              disabled={eventsForDropdown.length === 0}
            >
              {eventsForDropdown.length > 0 ? (
                eventsForDropdown.map((event) => (
                  <option key={event} value={event}>{event}</option>
                ))
              ) : (
                <option value="" disabled>No events available</option>
              )}
            </select>
          </div>
          {/* The Add button's disabled state also depends on eventsForDropdown */}
          <button
            onClick={handleAddEvent}
            disabled={eventsForDropdown.length === 0}
            style={{ alignSelf: 'end' }}
            className="icon-button add-button"
            title="Add event"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>

        <div className="selected-events-grid">
          {selectedEvents.length > 0 && (
            <>
              <div className="grid-header">Event</div>
              <div className="grid-header">Time</div>
              <div className="grid-header">Current Cut</div>
              <div className="grid-header">Next Cut</div>
              <div className="grid-header">Difference</div>
              <div className="grid-header">Action</div>

              {selectedEvents.map((event) => {
                const eventStandards = getEventStandards(event.name);
                const cutInfo = getCutInfo(event.time, eventStandards);

                return (
                  <Fragment key={event.name}>
                    <div className="grid-cell event-name-cell">{event.name}</div>
                    <div className="grid-cell">
                      <input
                        type="text"
                        value={event.time}
                        onChange={(e) => handleTimeChange(event.name, e.target.value)}
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
                    <div className="grid-cell">
                      <button onClick={() => handleRemoveEvent(event.name)} className="icon-button remove-button" title="Remove event">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  </Fragment>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
