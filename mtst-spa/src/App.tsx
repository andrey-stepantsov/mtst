import { useState, useMemo, useEffect } from 'react';
import './AppGrid.css'; // Import the new CSS file

// Define types for the standards data
interface StandardTime {
  Event: string;
  B: string;
  BB: string;
  A: string;
  AA: string;
  AAA: string;
  AAAA: string;
}

// Helper function to convert time string (e.g., mm:ss.ff, ss.ff) to total seconds (float)
// Returns Infinity for invalid or empty time strings, treating them as very slow.
const timeToSeconds = (timeString: string): number => {
  if (!timeString) {
    return Infinity;
  }

  const timeParts = timeString.split(':');
  let minutes = 0;
  let secondsAndHundredths;

  if (timeParts.length > 2) {
    return Infinity; // e.g. 1:2:3.45
  }

  if (timeParts.length === 2) {
    minutes = parseInt(timeParts[0], 10);
    secondsAndHundredths = timeParts[1];
  } else { // length is 1
    secondsAndHundredths = timeParts[0];
  }

  const secondParts = secondsAndHundredths.split('.');
  if (secondParts.length > 2) {
    return Infinity; // e.g. 5.6.7
  }

  const seconds = parseInt(secondParts[0], 10);
  let hundredths = 0;
  if (secondParts.length === 2) {
    // Pad with 0 to handle single digit hundredths (e.g., '5' becomes '50')
    const hundredthsStr = secondParts[1].padEnd(2, '0');
    // Take only first two digits for hundredths
    hundredths = parseInt(hundredthsStr.substring(0, 2), 10);
  }

  if (isNaN(minutes) || isNaN(seconds) || isNaN(hundredths) ||
      minutes < 0 || seconds < 0 || seconds >= 60 || hundredths < 0 || hundredths >= 100) {
    return Infinity;
  }

  return (minutes * 60) + seconds + (hundredths / 100);
};

// NEW: Helper function to convert total seconds (float) back to mm:ss.ff string
const secondsToTimeString = (totalSeconds: number): string => {
  const absSeconds = Math.abs(totalSeconds); // Work with absolute value for formatting
  const minutes = Math.floor(absSeconds / 60);
  const seconds = Math.floor(absSeconds % 60);
  const hundredths = Math.floor((absSeconds * 100) % 100);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedHundredths = String(hundredths).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}.${formattedHundredths}`;
};

// NEW: Interface for the detailed cut information
interface CutInfo {
  achievedCut: string;
  nextCut: string | null;
  absoluteDiff: string | null; // e.g., "-00:01.23"
  relativeDiff: string | null; // e.g., "-1.5%"
}

// MODIFIED: Helper function to determine the current and next cut, and differences
const getCutInfo = (bestTime: string, standards: StandardTime | undefined): CutInfo => {
  if (!standards) {
    return {
      achievedCut: "N/A",
      nextCut: "Standards not found.",
      absoluteDiff: null,
      relativeDiff: null,
    };
  }

  const userTimeInSeconds = timeToSeconds(bestTime);

  if (userTimeInSeconds === Infinity) {
    return {
      achievedCut: "N/A",
      nextCut: "Enter a valid time (mm:ss.ff)",
      absoluteDiff: null,
      relativeDiff: null,
    };
  }

  const cuts = [
    { level: 'AAAA', time: timeToSeconds(standards.AAAA), timeStr: standards.AAAA },
    { level: 'AAA', time: timeToSeconds(standards.AAA), timeStr: standards.AAA },
    { level: 'AA', time: timeToSeconds(standards.AA), timeStr: standards.AA },
    { level: 'A', time: timeToSeconds(standards.A), timeStr: standards.A },
    { level: 'BB', time: timeToSeconds(standards.BB), timeStr: standards.BB },
    { level: 'B', time: timeToSeconds(standards.B), timeStr: standards.B },
  ].filter(cut => cut.time !== Infinity); // Filter out invalid/missing standards

  if (cuts.length === 0) {
    return {
      achievedCut: "N/A",
      nextCut: "No valid standards for this event.",
      absoluteDiff: null,
      relativeDiff: null,
    };
  }

  let achievedCutLevel: string = "None";
  let nextCutIndex = -1;

  // Find the highest standard the user has achieved
  for (let i = 0; i < cuts.length; i++) {
    if (userTimeInSeconds <= cuts[i].time) {
      achievedCutLevel = cuts[i].level;
      nextCutIndex = i - 1; // The next goal is the one at the previous index (faster)
      break;
    }
  }

  // Case 1: Slower than the slowest standard (e.g., 'B' cut)
  if (achievedCutLevel === "None") {
    const nextCut = cuts[cuts.length - 1]; // The slowest cut is the next goal
    const timeToImproveInSeconds = userTimeInSeconds - nextCut.time;
    const relativeImprovementPercentage = (timeToImproveInSeconds / userTimeInSeconds) * 100;

    return {
      achievedCut: "None",
      nextCut: `${nextCut.level} (${nextCut.timeStr})`,
      absoluteDiff: `-${secondsToTimeString(timeToImproveInSeconds)}`,
      relativeDiff: `-${relativeImprovementPercentage.toFixed(1)}%`,
    };
  }

  // Case 2: Achieved the fastest standard ('AAAA')
  if (nextCutIndex < 0) {
    return {
      achievedCut: achievedCutLevel, // Will be 'AAAA'
      nextCut: 'Achieved all cuts!',
      absoluteDiff: null,
      relativeDiff: null,
    };
  }

  // Case 3: In between standards
  const nextCut = cuts[nextCutIndex];
  const timeToImproveInSeconds = userTimeInSeconds - nextCut.time;
  const relativeImprovementPercentage = (timeToImproveInSeconds / userTimeInSeconds) * 100;

  return {
    achievedCut: achievedCutLevel,
    nextCut: `${nextCut.level} (${nextCut.timeStr})`,
    absoluteDiff: `-${secondsToTimeString(timeToImproveInSeconds)}`,
    relativeDiff: `-${relativeImprovementPercentage.toFixed(1)}%`,
  };
};

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
  const [selectedEvents, setSelectedEvents] = useState<SelectedEvent[]>([]);

  // State for filter selections
  const [age, setAge] = useState("10&U"); // Default to first age group
  const [gender, setGender] = useState("Girls"); // Default to Girls
  const [course, setCourse] = useState("SCY"); // Default to SCY

  // NEW: State to manage the currently selected event in the dropdown
  const [selectedEventInDropdown, setSelectedEventInDropdown] = useState('');

  const [standards, setStandards] = useState<AgeGroupStandards>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ageGroupKey = age === "10&U" ? "01-10" : age;
    const genderKey = gender === "Boys" ? "Male" : "Female";
    const courseKey = course;

    // Check if data is already loaded (or if a fetch has already failed) to prevent re-fetching.
    // We check for `undefined` because an empty array `[]` is a valid state for a failed fetch.
    if (standards[ageGroupKey]?.[genderKey]?.[courseKey] !== undefined) {
      return;
    }

    const fetchStandards = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/standards/${ageGroupKey}-${genderKey}-${courseKey}.json`);
        
        // For both success and 404, we update the state. For other errors, we don't.
        const data = response.ok ? await response.json() : [];
        
        if (!response.ok && response.status !== 404) {
            throw new Error(`Failed to fetch standards: ${response.statusText}`);
        }

        if (response.status === 404) {
            console.warn(`No standards file found for: ${ageGroupKey}-${genderKey}-${courseKey}.json`);
        }

        setStandards(prev => ({
          ...prev,
          [ageGroupKey]: {
            ...prev[ageGroupKey],
            [genderKey]: {
              ...prev[ageGroupKey]?.[genderKey],
              [courseKey]: data,
            },
          },
        }));

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStandards();
  }, [age, gender, course]);

  // Helper function to get standards for a specific event based on current filters
  const getEventStandards = (eventName: string): StandardTime | undefined => {
    // Map UI values to data keys
    const ageGroupKey = age === "10&U" ? "01-10" : age; // "10&U" -> "01-10"
    const genderKey = gender === "Boys" ? "Male" : "Female"; // "Boys" -> "Male", "Girls" -> "Female"
    const courseKey = course;

    const currentStandards = standards[ageGroupKey]?.[genderKey]?.[courseKey];
    return currentStandards?.find(s => s.Event === eventName);
  };

  // NEW: Memoized list of events for the dropdown, derived from filters and selected events
  const eventsForDropdown = useMemo(() => {
    const ageGroupKey = age === "10&U" ? "01-10" : age;
    const genderKey = gender === "Boys" ? "Male" : "Female";
    const courseKey = course;

    const currentStandards = standards[ageGroupKey]?.[genderKey]?.[courseKey];
    if (!currentStandards) {
      return []; // No standards found for the current selection
    }

    const standardsEvents = new Set(currentStandards.map(s => s.Event));
    const selectedEventNames = new Set(selectedEvents.map(se => se.name));

    // Filter ALL_EVENTS to include only those present in current standards
    // and not already selected by the user.
    return ALL_EVENTS.filter(event =>
      standardsEvents.has(event) && !selectedEventNames.has(event)
    );
  }, [age, gender, course, selectedEvents, standards]); // Re-calculate when these dependencies change

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
          <button onClick={handleAddEvent} disabled={eventsForDropdown.length === 0} style={{ alignSelf: 'end' }}>Add</button>
        </div>

        <div className="selected-events-container">
          {selectedEvents.length > 0 && <h3>Selected Events:</h3>}
          {selectedEvents.map((event) => {
            const eventStandards = getEventStandards(event.name);
            const cutInfo = getCutInfo(event.time, eventStandards);

            return (
              <div key={event.name} className="selected-event-item">
                <span>{event.name}</span>
                <input
                  type="text"
                  value={event.time}
                  onChange={(e) => handleTimeChange(event.name, e.target.value)}
                  placeholder="mm:ss.ff"
                  title="Enter time in mm:ss.ff format (minutes:seconds.hundredths)"
                />
                <div className="next-cut-display">
                  <span>Current: {cutInfo.achievedCut}</span>
                  {cutInfo.nextCut && (
                    <span style={{ marginLeft: '10px' }}>
                      Next: {cutInfo.nextCut}
                      {cutInfo.absoluteDiff && cutInfo.relativeDiff && (
                        <span className="time-diff"> ({cutInfo.absoluteDiff} / {cutInfo.relativeDiff})</span>
                      )}
                    </span>
                  )}
                </div>
                <button onClick={() => handleRemoveEvent(event.name)}>Remove</button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default App;
