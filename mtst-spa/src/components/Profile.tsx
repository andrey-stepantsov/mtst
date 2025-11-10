import { useState, useEffect } from 'react';
import { AGE_BRACKETS } from '../constants';

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (profile: { swimmerName:string; age: string; gender: string }) => void;
  currentProfile: { swimmerName: string; age: string; gender: string };
  swimmerNames: string[];
  onSwitchProfile: (name: string) => void;
  onNewSwimmer: () => void;
}

export const Profile = ({ isOpen, onClose, onConfirm, currentProfile, swimmerNames, onSwitchProfile, onNewSwimmer }: ProfileProps) => {
  const [name, setName] = useState(currentProfile.swimmerName);
  const [age, setAge] = useState(currentProfile.age);
  const [gender, setGender] = useState(currentProfile.gender);

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
            {AGE_BRACKETS.map((ageBracket) => (
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
        <div className="profile-buttons-container">
          <button onClick={handleNewSwimmerClick} className="profile-new-button">New Swimmer</button>
          <button onClick={handleConfirm} className="profile-confirm-button">Update</button>
        </div>
      </div>
    </div>
  );
};
