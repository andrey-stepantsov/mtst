import { useState, useRef } from 'react';

const ALL_EVENTS = [
  "50 FR", "100 FR", "200 FR", "500 FR", "1000 FR", "1650 FR",
  "50 BK", "100 BK", "200 BK",
  "50 BR", "100 BR", "200 BR",
  "50 FL", "100 FL", "200 FL",
  "100 IM", "200 IM", "400 IM"
].sort(); // Keep events sorted for consistent display

function App() {
  const [availableEvents, setAvailableEvents] = useState(ALL_EVENTS);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const eventSelectRef = useRef<HTMLSelectElement>(null);

  const handleAddEvent = () => {
    if (eventSelectRef.current) {
      const eventToAdd = eventSelectRef.current.value;
      if (eventToAdd && !selectedEvents.includes(eventToAdd)) {
        setSelectedEvents((prev) => [...prev, eventToAdd]);
        setAvailableEvents((prev) => prev.filter((event) => event !== eventToAdd));
        // Optionally reset the dropdown to the first available option or a placeholder
        if (availableEvents.length > 1) { // If there are other events left
          eventSelectRef.current.value = availableEvents.filter(event => event !== eventToAdd)[0];
        } else { // If no events left, set to empty or disable
          eventSelectRef.current.value = '';
        }
      }
    }
  };

  const handleRemoveEvent = (eventToRemove: string) => {
    setSelectedEvents((prev) => prev.filter((event) => event !== eventToRemove));
    setAvailableEvents((prev) => [...prev, eventToRemove].sort());
  };

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end' }}>
          <div>
            <label htmlFor="age-select">Age: </label>
            <select id="age-select">
              {["10&U", "11-12", "13-14", "15-16", "17-18"].map((ageBracket) => (
                <option key={ageBracket} value={ageBracket}>{ageBracket}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gender-select">Gender: </label>
            <select id="gender-select">
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
            </select>
          </div>

          <div>
            <label htmlFor="course-select">Course: </label>
            <select id="course-select">
              <option value="SCY">SCY</option>
              <option value="LCM">LCM</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end' }}>
          <div>
            <label htmlFor="event-select">Event: </label>
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
          <button onClick={handleAddEvent} disabled={availableEvents.length === 0}>Add</button>
        </div>

        <div className="selected-events-container">
          {selectedEvents.length > 0 && <h3>Selected Events:</h3>}
          {selectedEvents.map((event) => (
            <div key={event} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <span>{event}</span>
              <button onClick={() => handleRemoveEvent(event)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App
