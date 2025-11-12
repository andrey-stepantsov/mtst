import { useState, useEffect } from 'react';
import { AGE_BRACKETS_SINGLE, AGE_BRACKETS_ALL } from '../constants';

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (profile: { swimmerName:string; age: string; gender: string }) => void;
  currentProfile: { swimmerName: string; age: string; gender: string };
  swimmerNames: string[];
  onSwitchProfile: (name: string) => void;
  onNewSwimmer: () => void;
  onDeleteSwimmer: (name: string) => void;
  showAgeGroupStandards: boolean;
  onShowAgeGroupStandardsChange: (checked: boolean) => void;
}

export const Profile = ({ isOpen, onClose, onConfirm, currentProfile, swimmerNames, onSwitchProfile, onNewSwimmer, onDeleteSwimmer, showAgeGroupStandards, onShowAgeGroupStandardsChange }: ProfileProps) => {
  const [name, setName] = useState(currentProfile.swimmerName);
  const [age, setAge] = useState(currentProfile.age);
  const [gender, setGender] = useState(currentProfile.gender);

  const ageBracketsToShow = showAgeGroupStandards ? AGE_BRACKETS_ALL : AGE_BRACKETS_SINGLE;

  useEffect(() => {
    // If the currently selected age is not in the new list of options, reset it.
    if (!ageBracketsToShow.includes(age)) {
      // If switching from group to single, and '01-10' was selected, switch to '10&U'.
      if (!showAgeGroupStandards && age === '01-10') {
        setAge('10&U');
      }
    }
  }, [showAgeGroupStandards, age, ageBracketsToShow]);

  useEffect(() => {
    if (isOpen) {
      setName(currentProfile.swimmerName);
      setAge(currentProfile.age);
      setGender(currentProfile.gender);
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({ swimmerName: name, age, gender });
    onClose();
  };

  const handleNewSwimmerClick = () => {
    onNewSwimmer();
    onClose();
  };

  const handleDeleteSwimmerClick = () => {
    onDeleteSwimmer(currentProfile.swimmerName);
    onClose();
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSwitchProfile(e.target.value);
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Profile</h2>

        {swimmerNames.length > 1 && (
          <div className="profile-control">
            <label htmlFor="profile-switch">Switch Profile:</label>
            <select id="profile-switch" value={currentProfile.swimmerName} onChange={handleSwitch}>
              {swimmerNames.map((swimmerName) => (
                <option key={swimmerName} value={swimmerName}>{swimmerName}</option>
              ))}
            </select>
          </div>
        )}

        <div className="profile-control">
          <label htmlFor="profile-name">Swimmer Name:</label>
          <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="profile-control">
          <label htmlFor="profile-age">Age:</label>
          <select id="profile-age" value={age} onChange={(e) => setAge(e.target.value)}>
            {ageBracketsToShow.map((ageBracket) => (
              <option key={ageBracket} value={ageBracket}>{ageBracket}</option>
            ))}
          </select>
        </div>
        <div className="profile-control">
          <label htmlFor="profile-gender">Gender:</label>
          <select id="profile-gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
          </select>
        </div>
        <div className="profile-control">
          <input
            id="show-age-group-standards"
            type="checkbox"
            checked={showAgeGroupStandards}
            onChange={(e) => onShowAgeGroupStandardsChange(e.target.checked)}
          />
          <label htmlFor="show-age-group-standards" style={{ marginLeft: '8px', userSelect: 'none' }}>Show Age Group Standards</label>
        </div>
        <div className="profile-buttons-container">
          <button onClick={onClose} className="profile-close-button">Close</button>
          <button onClick={handleConfirm} className="profile-confirm-button">Update</button>
        </div>
        <div className="profile-buttons-container">
          <button onClick={handleNewSwimmerClick} className="profile-new-button">New Swimmer</button>
          <button onClick={handleDeleteSwimmerClick} className="profile-delete-button" disabled={swimmerNames.length <= 1}>Delete Swimmer</button>
        </div>
        <div className="version-tag">v{__APP_VERSION__}</div>
      </div>
    </div>
  );
};
