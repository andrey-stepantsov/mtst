import { AGE_BRACKETS } from '../constants';

interface AppBarProps {
  swimmerName: string;
  age: string;
  gender: string;
  onEdit: () => void;
  swimmerNames: string[];
  onSwitchProfile: (name: string) => void;
}

export const AppBar = ({ swimmerName, age, gender, onEdit, swimmerNames, onSwitchProfile }: AppBarProps) => {
  return (
    <header className="app-bar">
      <div className="version-tag">v0.1.0</div>
      <div className="app-bar-control">
        <select id="app-bar-swimmer-select" value={swimmerName} onChange={(e) => onSwitchProfile(e.target.value)}>
          {swimmerNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
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
