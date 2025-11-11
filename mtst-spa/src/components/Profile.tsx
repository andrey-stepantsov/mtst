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
  onDeleteSwimmer: (name: string) => void;
}

export const Profile = ({ isOpen, onClose, onConfirm, currentProfile, swimmerNames, onSwitchProfile, onNewSwimmer, onDeleteSwimmer }: ProfileProps) => {
  const [name, setName] = useState(currentProfile.swimmerName);
  const [age, setAge] = useState(currentProfile.age);
  const [gender, setGender] = useState(currentProfile.gender);

  useEffect(() => {
    if (isOpen) {
      setName(currentProfile.swimmerName);
      setAge(currentProfile.age);
      // Map old gender values to new ones for a smooth transition.
      const currentGender = currentProfile.gender;
      if (currentGender === 'Boys') {
        setGender('Male');
      } else if (currentGender === 'Girls') {
        setGender('Female');
      } else {
        setGender(currentGender); // Handles 'Male', 'Female', or other values
      }
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
            {AGE_BRACKETS.map((ageBracket) => (
              <option key={ageBracket} value={ageBracket}>{ageBracket}</option>
            ))}
          </select>
        </div>
        <div className="profile-control">
          <label htmlFor="profile-gender">Gender:</label>
          <select id="profile-gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="profile-buttons-container">
          <button onClick={onClose} className="profile-close-button">Close</button>
          <button onClick={handleConfirm} className="profile-confirm-button">Update</button>
        </div>
        <div className="profile-buttons-container">
          <button onClick={handleNewSwimmerClick} className="profile-new-button">New Swimmer</button>
          <button onClick={handleDeleteSwimmerClick} className="profile-delete-button" disabled={swimmerNames.length <= 1}>Delete Swimmer</button>
        </div>
        <div className="version-tag">v0.7.0</div>
      </div>
    </div>
  );
};
