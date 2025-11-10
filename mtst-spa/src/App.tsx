import { useState, useMemo, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
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

interface EventRowProps {
  course: 'SCY' | 'LCM';
  event: SelectedEvent;
  standards: StandardTime[] | undefined;
  handleRemoveEvent: (course: 'SCY' | 'LCM', eventToRemoveName: string) => void;
  handleTimeChange: (course: 'SCY' | 'LCM', eventName: string, newTime: string) => void;
  getEventStandards: (eventName: string, standards: StandardTime[] | undefined) => StandardTime | undefined;
}

const EventRow = ({
  course,
  event,
  standards,
  handleRemoveEvent,
  handleTimeChange,
  getEventStandards,
}: EventRowProps) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => handleRemoveEvent(course, event.name),
    trackMouse: true,
  });

  const eventStandards = getEventStandards(event.name, standards);
  const cutInfo = getCutInfo(event.time, eventStandards);

  return (
    <div {...handlers} style={{ display: 'contents' }}>
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
        <span className="swipe-hint" title="Swipe left to delete">&larr;</span>
      </div>
    </div>
  );
};

function App() {
  const [selectedEvents, setSelectedEvents] = useState<{ [course: string]: SelectedEvent[] }>(loadSelectedEvents());

  // State for filter selections
  const initialFilters = loadUserFilters();
  const [age, setAge] = useState(initialFilters.age || "10&U");
  const [gender, setGender] = useState(initialFilters.gender || "Girls");

  // State to manage the currently selected event in each dropdown
  const [scySelectedEventInDropdown, setScySelectedEventInDropdown] = useState('');
  const [lcmSelectedEventInDropdown, setLcmSelectedEventInDropdown] = useState('');

  const { standardsForSelectedFilters: scyStandards, isLoading: isLoadingScy } = useStandards(age, gender, 'SCY');
  const { standardsForSelectedFilters: lcmStandards, isLoading: isLoadingLcm } = useStandards(age, gender, 'LCM');

  // Persist selected events to localStorage
  useEffect(() => {
    saveSelectedEvents(selectedEvents);
  }, [selectedEvents]);

  // Persist filters to localStorage
  useEffect(() => {
    saveUserFilters({ age, gender });
  }, [age, gender]);

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

  const scyEventsForDropdown = useMemo(() => createEventsForDropdown(scyStandards, selectedEvents.SCY || []), [scyStandards, selectedEvents.SCY]);
  const lcmEventsForDropdown = useMemo(() => createEventsForDropdown(lcmStandards, selectedEvents.LCM || []), [lcmStandards, selectedEvents.LCM]);

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
    if (eventNameToAdd && !selectedEvents[course]?.some(e => e.name === eventNameToAdd)) {
      setSelectedEvents(prev => ({
        ...prev,
        [course]: [...(prev[course] || []), { name: eventNameToAdd, time: '' }],
      }));
    }
  };

  const handleRemoveEvent = (course: 'SCY' | 'LCM', eventToRemoveName: string) => {
    setSelectedEvents(prev => ({
      ...prev,
      [course]: prev[course].filter((event) => event.name !== eventToRemoveName),
    }));
  };

  const handleTimeChange = (course: 'SCY' | 'LCM', eventName: string, newTime: string) => {
    setSelectedEvents(prev => ({
      ...prev,
      [course]: prev[course].map((event) =>
        event.name === eventName ? { ...event, time: newTime } : event,
      ),
    }));
  };

  // Render function for the events grid to avoid duplicating JSX
  const renderEventsGrid = (course: 'SCY' | 'LCM', events: SelectedEvent[], standards: StandardTime[] | undefined) => {
    if (!events || events.length === 0) return null;

    return (
      <div className="selected-events-grid">
        <div className="grid-header">Event</div>
        <div className="grid-header">Time</div>
        <div className="grid-header">Current Cut</div>
        <div className="grid-header">Next Cut</div>
        <div className="grid-header">Difference</div>
        <div className="grid-header">Action</div>

        {events.map((event) => (
          <EventRow
            key={event.name}
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

        <div className="course-groups-container">
          {/* SCY Group */}
          <div className="course-group">
            <h2>SCY Events</h2>
            <div className="controls-grid">
              <div>
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
            {renderEventsGrid('SCY', selectedEvents.SCY, scyStandards)}
          </div>

          {/* LCM Group */}
          <div className="course-group">
            <h2>LCM Events</h2>
            <div className="controls-grid">
              <div>
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
            {renderEventsGrid('LCM', selectedEvents.LCM, lcmStandards)}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
