import { AGE_BRACKETS_ALL } from '../constants';
import { Models } from 'appwrite';

interface AppBarProps {
  swimmerName: string;
  age: string;
  gender: string;
  onEdit: () => void;
  swimmerNames: string[];
  onSwitchProfile: (name: string) => void;
  user: Models.User<Models.Preferences> | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const AppBar = ({ swimmerName, age, gender, onEdit, swimmerNames, onSwitchProfile, user, onLogin, onLogout }: AppBarProps) => {
  return (
    <header className="app-bar">
      <div className="app-bar-control">
        <select id="app-bar-swimmer-select" value={swimmerName} onChange={(e) => onSwitchProfile(e.target.value)}>
          {swimmerNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      <div className="app-bar-control">
        <select id="app-bar-gender-select" value={gender} disabled>
          <option value="Boys">Boys</option>
          <option value="Girls">Girls</option>
        </select>
        <span>/</span>
        <select id="app-bar-age-select" value={age} disabled>
          {AGE_BRACKETS_ALL.map((ageBracket) => (
            <option key={ageBracket} value={ageBracket}>{ageBracket}</option>
          ))}
        </select>
      </div>
      <button onClick={onEdit} className="icon-button edit-profile-button" title="Edit Profile">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12"cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
      </button>
      <div className="app-bar-auth">
        {user ? (
          <>
            <span className="user-name">{user.name}</span>
            <button onClick={onLogout} className="icon-button" title="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </>
        ) : (
          <button onClick={onLogin}>Login with Google</button>
        )}
      </div>
    </header>
  );
};
