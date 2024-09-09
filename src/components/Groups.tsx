import React, { useState } from 'react';
import './Groups.css'; //

const Groups: React.FC = () => {
  const [publicGroups] = useState([
    { id: 1, name: 'Public Group 1' },
    { id: 2, name: 'Public Group 2' },
  ]);

  const [privateGroups] = useState([
    { id: 1, name: 'Private Group 1' },
    { id: 2, name: 'Private Group 2' },
  ]);

  const handleJoinPublicGroup = (groupName: string) => {
    alert(`You have joined ${groupName}`);
    
  };

  const handleRequestPrivateGroup = (groupName: string) => {
    alert(`Request to join ${groupName} has been sent.`);
    
  };

  const handleCreateGroup = () => {
    alert('Create Group modal or form will be triggered.');
    
  };

  return (
    <div className="groups-container">
      <h2 className="groups-heading">Groups</h2>

      <div className="groups-section">
        <h3>Private Groups</h3>
        <table className="groups-table">
          <tbody>
            {privateGroups.map(group => (
              <tr key={group.id} onClick={() => handleRequestPrivateGroup(group.name)}>
                <td>{group.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="groups-section">
        <h3>Public Groups</h3>
        <table className="groups-table">
          <tbody>
            {publicGroups.map(group => (
              <tr key={group.id} onClick={() => handleJoinPublicGroup(group.name)}>
                <td>{group.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="create-group">
        <button onClick={handleCreateGroup} className="create-group-button">
          Create Your Own Group
        </button>
      </div>
    </div>
  );
};

export default Groups;
