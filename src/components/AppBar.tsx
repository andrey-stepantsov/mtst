import { AGE_BRACKETS } from '../constants';
import { Models } from 'appwrite';

interface AppBarProps {
  swimmerName: string;
  swimmerNames: string[];
  onSwitchProfile: (name: string) => void;
  user: Models.User<Models.Preferences> | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const AppBar = ({ swimmerName, swimmerNames, onSwitchProfile, user, onLogin, onLogout }: AppBarProps) => {
  return (
    <header className="app-bar">
      <div className="app-bar-control">
        <select id="app-bar-swimmer-select" value={swimmerName} onChange={(e) => onSwitchProfile(e.target.value)}>
          {swimmerNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
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
