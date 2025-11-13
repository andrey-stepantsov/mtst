import { Models } from 'appwrite';

interface AppBarProps {
  user: Models.User<Models.Preferences> | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const AppBar = ({ user, onLogin, onLogout }: AppBarProps) => {
  return (
    <header className="app-bar">
      <div className="app-bar-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M16 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          <path d="M6 11l4 -2l3.5 3l-1.5 4"></path>
          <path d="M4 20l5 -3l2.5 -3"></path>
          <path d="M15 5.5l-3 3"></path>
        </svg>
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
