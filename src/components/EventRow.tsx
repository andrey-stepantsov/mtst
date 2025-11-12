import { SelectedEvent, StandardTime } from '../types';
import { getCutInfo } from '../utils/standards';

interface EventRowProps {
  course: 'SCY' | 'LCM';
  index: number;
  event: SelectedEvent;
  standards: StandardTime[] | undefined;
  handleRemoveEvent: (course: 'SCY' | 'LCM', eventToRemoveName: string) => void;
  handleTimeChange: (course: 'SCY' | 'LCM', eventName: string, newTime: string) => void;
  getEventStandards: (eventName: string, standards: StandardTime[] | undefined) => StandardTime | undefined;
}

export const EventRow = ({
  course,
  index,
  event,
  standards,
  handleRemoveEvent,
  handleTimeChange,
  getEventStandards,
}: EventRowProps) => {
  const eventStandards = getEventStandards(event.name, standards);
  const cutInfo = getCutInfo(event.time, eventStandards);
  const rowClass = index % 2 === 1 ? 'odd-row' : 'even-row';

  const handleRemoveClick = () => {
    if (window.confirm(`Are you sure you want to remove the ${course} ${event.name}?`)) {
      handleRemoveEvent(course, event.name);
    }
  };

  return (
    <div className={`event-row-wrapper ${rowClass}`}>
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
        <button onClick={handleRemoveClick} className="icon-button remove-button" title={`Remove ${course} event`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};
