import { useState, useEffect } from 'react';
import { account } from './appwrite';
import { Models } from 'appwrite';
import './AppGrid.css';
import './AppBar.css';
import './Profile.css';
import { SwimmerProfiles } from './types';
import { useStandards } from './hooks/useStandards';
import {
  loadProfiles,
  saveProfiles,
  loadActiveSwimmerName,
  saveActiveSwimmerName,
} from './utils/persistence';
import { AppBar } from './components/AppBar';
import { Profile } from './components/Profile';
import { CourseEventGroup } from './components/CourseEventGroup';

function App() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  // Check for an active session when the app loads
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (error) {
        console.log("No active session:", error);
        setUser(null);
      }
    };
    checkSession();
  }, []);

  // This effect handles the OAuth2 callback from Google
  useEffect(() => {
    const finishOAuth2Login = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const secret = urlParams.get('secret');
      const userId = urlParams.get('userId');

      if (secret && userId) {
        try {
          await account.updateOAuth2Session(userId, secret);
          const currentUser = await account.get();
          setUser(currentUser);
        } catch (error) {
          console.error("Failed to complete OAuth2 login:", error);
          setUser(null);
        } finally {
          // Clean the URL by removing the query parameters to prevent re-triggering
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    finishOAuth2Login();
  }, []);

  // Login function
  const loginWithGoogle = async () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const successUrl = isLocalhost ? `${window.location.origin}/` : `${window.location.origin}/mtst/`;
    const failureUrl = isLocalhost ? `${window.location.origin}/failure` : `${window.location.origin}/mtst/failure`;

    try {
      // This will redirect the user to Google's login page
      account.createOAuth2Token(
        'google',
        successUrl, // URL to redirect to on success
        failureUrl // URL to redirect to on failure
      );
    } catch (error) {
      console.error("Failed to initiate Google login:", error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const [profiles, setProfiles] = useState<SwimmerProfiles>(loadProfiles());
  const [activeSwimmerName, setActiveSwimmerName] = useState<string>(() => {
    const savedName = loadActiveSwimmerName();
    const profileKeys = Object.keys(profiles);
    if (savedName && profileKeys.includes(savedName)) {
      return savedName;
    }
    // Fallback: if no saved name or saved name doesn't exist, use the first profile or 'swimmer'
    return profileKeys.length > 0 ? profileKeys[0] : 'swimmer';
  });

  // Derived state for the active profile
  const activeProfile = profiles[activeSwimmerName] || { age: '10&U', gender: 'Girls', selectedEvents: { SCY: [], LCM: [] } }; // Provide a default if activeSwimmerName is not found
  const { age, gender, selectedEvents } = activeProfile;

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { standardsForSelectedFilters: scyStandards, isLoading: isLoadingScy } = useStandards(age, gender, 'SCY');
  const { standardsForSelectedFilters: lcmStandards, isLoading: isLoadingLcm } = useStandards(age, gender, 'LCM');

  // Persist profiles to localStorage
  useEffect(() => {
    saveProfiles(profiles);
  }, [profiles]);

  // Persist active swimmer name to localStorage
  useEffect(() => {
    saveActiveSwimmerName(activeSwimmerName);
  }, [activeSwimmerName]);

  // When profiles change (e.g., deletion), ensure activeSwimmerName is valid
  useEffect(() => {
    const profileKeys = Object.keys(profiles);
    if (profileKeys.length > 0 && !profileKeys.includes(activeSwimmerName)) {
      setActiveSwimmerName(profileKeys[0]);
    }
  }, [profiles, activeSwimmerName]);

  const handleAddEvent = (course: 'SCY' | 'LCM', eventNameToAdd: string) => {
    if (!eventNameToAdd) return;

    setProfiles(prevProfiles => {
      const newProfiles = { ...prevProfiles };
      const currentProfile = { ...newProfiles[activeSwimmerName] };

      if (currentProfile.selectedEvents[course]?.some(e => e.name === eventNameToAdd)) {
        return prevProfiles; // No change
      }

      currentProfile.selectedEvents = {
        ...currentProfile.selectedEvents,
        [course]: [...(currentProfile.selectedEvents[course] || []), { name: eventNameToAdd, time: '' }],
      };
      newProfiles[activeSwimmerName] = currentProfile;
      return newProfiles;
    });
  };

  const handleRemoveEvent = (course: 'SCY' | 'LCM', eventToRemoveName: string) => {
    setProfiles(prevProfiles => {
      const newProfiles = { ...prevProfiles };
      const currentProfile = { ...newProfiles[activeSwimmerName] };
      currentProfile.selectedEvents = {
        ...currentProfile.selectedEvents,
        [course]: currentProfile.selectedEvents[course].filter((event) => event.name !== eventToRemoveName),
      };
      newProfiles[activeSwimmerName] = currentProfile;
      return newProfiles;
    });
  };

  const handleTimeChange = (course: 'SCY' | 'LCM', eventName: string, newTime: string) => {
    setProfiles(prevProfiles => {
      const newProfiles = { ...prevProfiles };
      const currentProfile = { ...newProfiles[activeSwimmerName] };
      currentProfile.selectedEvents = {
        ...currentProfile.selectedEvents,
        [course]: currentProfile.selectedEvents[course].map((event) =>
          event.name === eventName ? { ...event, time: newTime } : event,
        ),
      };
      newProfiles[activeSwimmerName] = currentProfile;
      return newProfiles;
    });
  };

  const handleSwitchProfile = (name: string) => {
    setActiveSwimmerName(name);
  };

  const handleNewSwimmer = () => {
    setProfiles(prevProfiles => {
      let newSwimmerName = `Swimmer ${Object.keys(prevProfiles).length + 1}`;
      let counter = 2;
      while (prevProfiles[newSwimmerName]) {
        newSwimmerName = `Swimmer ${Object.keys(prevProfiles).length + counter}`;
        counter++;
      }

      const newProfile = {
        age: '10&U',
        gender: 'Girls',
        selectedEvents: { SCY: [], LCM: [] },
      };

      const newProfiles = { ...prevProfiles, [newSwimmerName]: newProfile };
      setActiveSwimmerName(newSwimmerName);
      return newProfiles;
    });
  };

  const handleDeleteSwimmer = (nameToDelete: string) => {
    if (Object.keys(profiles).length <= 1) {
      alert("Cannot delete the only swimmer profile.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete swimmer "${nameToDelete}"? This action cannot be undone.`)) {
      setProfiles(prevProfiles => {
        const newProfiles = { ...prevProfiles };
        delete newProfiles[nameToDelete];
        return newProfiles;
      });
    }
  };

  const handleProfileConfirm = (profileUpdate: { swimmerName: string; age: string; gender: string }) => {
    const { swimmerName: newName, age: newAge, gender: newGender } = profileUpdate;
    const oldName = activeSwimmerName;

    setProfiles(prevProfiles => {
      const newProfiles = { ...prevProfiles };

      if (newName !== oldName) {
        // Name changed, need to rename the key
        if (newProfiles[newName]) {
          alert(`A profile with the name "${newName}" already exists.`);
          return prevProfiles; // Abort update
        }
        const profileData = newProfiles[oldName];
        delete newProfiles[oldName];
        newProfiles[newName] = {
          ...profileData,
          age: newAge,
          gender: newGender,
        };
      } else {
        // Name is the same, just update age and gender
        newProfiles[newName] = {
          ...newProfiles[newName],
          age: newAge,
          gender: newGender,
        };
      }
      return newProfiles;
    });

    // If name changed, update the active swimmer name state
    if (newName !== oldName) {
      setActiveSwimmerName(newName);
    }
  };

  return (
    <>
      <AppBar
        swimmerName={activeSwimmerName}
        age={age}
        gender={gender}
        onEdit={() => setIsProfileModalOpen(true)}
        swimmerNames={Object.keys(profiles)}
        onSwitchProfile={handleSwitchProfile}
        user={user}
        onLogin={loginWithGoogle}
        onLogout={logout}
      />
      <Profile
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onConfirm={handleProfileConfirm}
        currentProfile={{ swimmerName: activeSwimmerName, age, gender }}
        swimmerNames={Object.keys(profiles)}
        onSwitchProfile={handleSwitchProfile}
        onNewSwimmer={handleNewSwimmer}
        onDeleteSwimmer={handleDeleteSwimmer}
      />
      <main className="main-content">
        <div className="card">
          <div className="course-groups-container">
            <CourseEventGroup
              course="SCY"
              standards={scyStandards}
              isLoading={isLoadingScy}
              selectedEvents={selectedEvents.SCY || []}
              onAddEvent={handleAddEvent}
              onRemoveEvent={handleRemoveEvent}
              onTimeChange={handleTimeChange}
            />
            <CourseEventGroup
              course="LCM"
              standards={lcmStandards}
              isLoading={isLoadingLcm}
              selectedEvents={selectedEvents.LCM || []}
              onAddEvent={handleAddEvent}
              onRemoveEvent={handleRemoveEvent}
              onTimeChange={handleTimeChange}
            />
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
