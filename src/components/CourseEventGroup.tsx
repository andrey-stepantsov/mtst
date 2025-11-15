import { useState, useMemo, useEffect } from 'react';
import { SelectedEvent, StandardTime } from '../types';
import { ALL_EVENTS } from '../constants';
import { EventRow } from './EventRow';

const strokeOrder = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Individual Medley'];

const parseEventName = (eventName: string) => {
    const parts = eventName.split(' ');
    const distance = parseInt(parts[0], 10);
    let stroke = parts.slice(1).join(' ');
    if (stroke === 'IM') {
        stroke = 'Individual Medley';
    }
    return { distance, stroke };
};

const eventSorter = (a: SelectedEvent, b: SelectedEvent) => {
    const eventA = parseEventName(a.name);
    const eventB = parseEventName(b.name);

    if (eventA.distance !== eventB.distance) {
        return eventA.distance - eventB.distance;
    }

    const strokeAIndex = strokeOrder.indexOf(eventA.stroke);
    const strokeBIndex = strokeOrder.indexOf(eventB.stroke);

    if (strokeAIndex === -1) return 1;
    if (strokeBIndex === -1) return -1;

    return strokeAIndex - strokeBIndex;
};

const getEventStandards = (eventName: string, standards: StandardTime[] | undefined): StandardTime | undefined => {
  return standards?.find(s => s.Event === eventName);
};

const createEventsForDropdown = (
  standards: StandardTime[] | undefined,
  currentSelectedEvents: SelectedEvent[]
) => {
  if (!standards) return [];
  const standardsEvents = new Set(standards.map(s => s.Event));
  const selectedEventNames = new Set(currentSelectedEvents.map(se => se.name));
  return ALL_EVENTS.filter(event => standardsEvents.has(event) && !selectedEventNames.has(event));
};

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

const EventsGrid = ({ course, events, standards, handleRemoveEvent, handleTimeChange }: {
    course: 'SCY' | 'LCM';
    events: SelectedEvent[];
    standards: StandardTime[] | undefined;
    handleRemoveEvent: (course: 'SCY' | 'LCM', eventToRemoveName: string) => void;
    handleTimeChange: (course: 'SCY' | 'LCM', eventName: string, newTime: string) => void;
}) => {
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

interface CourseEventGroupProps {
    course: 'SCY' | 'LCM';
    standards: StandardTime[] | undefined;
    isLoading: boolean;
    selectedEvents: SelectedEvent[];
    onAddEvent: (course: 'SCY' | 'LCM', eventName: string) => void;
    onRemoveEvent: (course: 'SCY' | 'LCM', eventToRemoveName: string) => void;
    onTimeChange: (course: 'SCY' | 'LCM', eventName: string, newTime: string) => void;
}

export const CourseEventGroup = ({ course, standards, isLoading, selectedEvents, onAddEvent, onRemoveEvent, onTimeChange }: CourseEventGroupProps) => {
    const [selectedEventInDropdown, setSelectedEventInDropdown] = useState('');
    const eventsForDropdown = useMemo(() => createEventsForDropdown(standards, selectedEvents), [standards, selectedEvents]);
    useUpdateDropdownSelection(eventsForDropdown, selectedEventInDropdown, setSelectedEventInDropdown);
    const sortedEvents = useMemo(() => [...selectedEvents].sort(eventSorter), [selectedEvents]);

    const handleAddClick = () => {
        if (selectedEventInDropdown) {
            onAddEvent(course, selectedEventInDropdown);
        }
    };

    return (
        <div className="course-group">
            <h2>{course} Events</h2>
            <div className="controls-grid">
                <div className="event-select-wrapper">
                    <label htmlFor={`${course.toLowerCase()}-event-select`}>Event:</label>
                    {isLoading && <span className="loading-indicator"> Loading...</span>}
                    <select
                        id={`${course.toLowerCase()}-event-select`}
                        value={selectedEventInDropdown}
                        onChange={(e) => setSelectedEventInDropdown(e.target.value)}
                        disabled={eventsForDropdown.length === 0}
                    >
                        {eventsForDropdown.length > 0 ? (
                            eventsForDropdown.map((event) => <option key={event} value={event}>{event}</option>)
                        ) : (
                            <option value="" disabled>No events available</option>
                        )}
                    </select>
                </div>
                <button onClick={handleAddClick} disabled={eventsForDropdown.length === 0} className="icon-button add-button" title={`Add ${course} event`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
            </div>
            <EventsGrid
                course={course}
                events={sortedEvents}
                standards={standards}
                handleRemoveEvent={onRemoveEvent}
                handleTimeChange={onTimeChange}
            />
        </div>
    );
};
