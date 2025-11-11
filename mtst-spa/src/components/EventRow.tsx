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
        <button onClick={() => handleRemoveEvent(course, event.name)} className="icon-button remove-button" title={`Remove ${course} event`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
  );
};
