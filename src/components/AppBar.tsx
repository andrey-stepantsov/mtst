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
        <img src="/lanemetrics-logo.png" alt="LaneMetrics Logo" />
      </div>
      <div className="app-bar-auth">
        <a href='https://ko-fi.com/J3J51OB6YV' target='_blank' rel="noopener noreferrer" className="kofi-link">
          <img
            height='36'
            style={{ border: '0px', height: '36px' }}
            src='https://storage.ko-fi.com/cdn/kofi5.png?v=6'
            alt='Buy Me a Coffee at ko-fi.com'
          />
        </a>
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
