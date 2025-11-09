import { useState, useRef, useEffect } from 'react';
import './AppGrid.css'; // Import the new CSS file

// Define types for the standards data
interface StandardTime {
  Event: string;
  A: string;
  AA: string;
  AAA: string;
  AAAA: string;
}

interface CourseStandards {
  [course: string]: StandardTime[]; // e.g., "LCM": [{Event: "50 FR", ...}]
}

interface GenderStandards {
  [gender: string]: CourseStandards; // e.g., "Female": {"LCM": [...]}
}

interface AgeGroupStandards {
  [ageGroup: string]: GenderStandards; // e.g., "01-10": {"Female": {...}}
}

const ALL_EVENTS = [
  "50 FR", "100 FR", "200 FR", "500 FR", "1000 FR", "1650 FR",
  "50 BK", "100 BK", "200 BK",
  "50 BR", "100 BR", "200 BR",
  "50 FL", "100 FL", "200 FL",
  "100 IM", "200 IM", "400 IM"
].sort((a, b) => {
  const getPostfix = (event: string) => event.split(' ').pop() || '';
  const getLength = (event: string) => parseInt(event.split(' ')[0]) || 0;

  const postfixA = getPostfix(a);
  const postfixB = getPostfix(b);

  // Sort by postfix first
  if (postfixA < postfixB) return -1;
  if (postfixA > postfixB) return 1;

  // If postfixes are the same, sort by length
  const lengthA = getLength(a);
  const lengthB = getLength(b);
  return lengthA - lengthB;
});

interface SelectedEvent {
  name: string;
  time: string; // Duration in mm:ss.ff format
}

function App() {
  const [availableEvents, setAvailableEvents] = useState(ALL_EVENTS);
  const [selectedEvents, setSelectedEvents] = useState<SelectedEvent[]>([]);
  const eventSelectRef = useRef<HTMLSelectElement>(null);

  // State for filter selections
  const [age, setAge] = useState("10&U"); // Default to first age group
  const [gender, setGender] = useState("Girls"); // Default to Girls
  const [course, setCourse] = useState("SCY"); // Default to SCY

  // State for loaded standards data
  const [standards, setStandards] = useState<AgeGroupStandards | null>(null);

  // Load standards data from public/standards.json
  useEffect(() => {
    fetch('/standards.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setStandards(data))
      .catch(error => console.error("Failed to load standards data:", error));
  }, []); // Empty dependency array means this runs once on mount

  // Helper function to get standards for a specific event based on current filters
  const getEventStandards = (eventName: string): StandardTime | undefined => {
    if (!standards) return undefined;

    // Map UI values to data keys
    const ageGroupKey = age === "10&U" ? "01-10" : age; // "10&U" -> "01-10"
    const genderKey = gender === "Boys" ? "Male" : "Female"; // "Boys" -> "Male", "Girls" -> "Female"
    const courseKey = course;

    const currentStandards = standards[ageGroupKey]?.[genderKey]?.[courseKey];
    return currentStandards?.find(s => s.Event === eventName);
  };

  const handleAddEvent = () => {
    if (eventSelectRef.current) {
      const eventNameToAdd = eventSelectRef.current.value;
      if (eventNameToAdd && !selectedEvents.some(e => e.name === eventNameToAdd)) {
        setSelectedEvents((prev) => [...prev, { name: eventNameToAdd, time: '' }]);
        setAvailableEvents((prev) => prev.filter((event) => event !== eventNameToAdd));
        // Optionally reset the dropdown to the first available option or a placeholder
        const remainingEvents = availableEvents.filter(event => event !== eventNameToAdd);
        if (remainingEvents.length > 0) {
          eventSelectRef.current.value = remainingEvents[0];
        } else {
          eventSelectRef.current.value = '';
        }
      }
    }
  };

  const handleRemoveEvent = (eventToRemoveName: string) => {
    setSelectedEvents((prev) => prev.filter((event) => event.name !== eventToRemoveName));
    setAvailableEvents((prev) => [...prev, eventToRemoveName].sort());
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
        <div className="controls-grid">
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

          <div>
            <label htmlFor="course-select">Course:</label>
            <select id="course-select" value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="SCY">SCY</option>
              <option value="LCM">LCM</option>
            </select>
          </div>

          <div>
            <label htmlFor="event-select">Event:</label>
            <select id="event-select" ref={eventSelectRef} disabled={availableEvents.length === 0}>
              {availableEvents.length > 0 ? (
                availableEvents.map((event) => (
                  <option key={event} value={event}>{event}</option>
                ))
              ) : (
                <option value="" disabled>No events available</option>
              )}
            </select>
          </div>
          {/* The Add button is a direct child of the grid to align with the event select */}
          <button onClick={handleAddEvent} disabled={availableEvents.length === 0} style={{ alignSelf: 'end' }}>Add</button>
        </div>

        <div className="selected-events-container">
          {selectedEvents.length > 0 && <h3>Selected Events:</h3>}
          {selectedEvents.map((event) => {
            const eventStandards = getEventStandards(event.name);
            return (
              <div key={event.name} className="selected-event-item">
                <span>{event.name}</span>
                <input
                  type="text"
                  value={event.time}
                  onChange={(e) => handleTimeChange(event.name, e.target.value)}
                  placeholder="mm:ss.ff"
                  title="Enter time in mm:ss.ff format (minutes:seconds.hundredths)"
                  style={{ width: '100px', textAlign: 'center' }}
                />
                {eventStandards ? (
                  <div className="standards-display">
                    <span>A: {eventStandards.A}</span>
                    <span>AA: {eventStandards.AA}</span>
                    <span>AAA: {eventStandards.AAA}</span>
                    <span>AAAA: {eventStandards.AAAA}</span>
                  </div>
                ) : (
                  <span className="standards-display">Standards not found</span>
                )}
                <button onClick={() => handleRemoveEvent(event.name)}>Remove</button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default App
