import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Groups.css';

interface Group {
  id: number;
  name: string;
  isMember?: boolean;
}

const Groups: React.FC = () => {
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [privateGroups, setPrivateGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupVisibility, setNewGroupVisibility] = useState<'public' | 'private'>('public');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const [publicResponse, privateResponse] = await Promise.all([
        axios.get('http://localhost:3000/groups/public', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/groups/private', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPublicGroups(publicResponse.data.map((group: Group) => ({ ...group, isMember: group.isMember || false })));
      setPrivateGroups(privateResponse.data.map((group: Group) => ({ ...group, isMember: group.isMember || false })));
      console.log('Private Groups:', privateResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to fetch groups. Please try again later.');
      setLoading(false);
    }
  };

  const handleJoinPublicGroup = async (groupId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Authentication token not found. Please log in.');
      return;
    }
  
    try {
      const response = await axios.post(`http://localhost:3000/groups/${groupId}/join`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.data.alreadyMember) {
        alert('You are already a member of this group.');
      } else {
        alert('You have successfully joined the group.');
        setPublicGroups(prevGroups =>
          prevGroups.map(group =>
            group.id === groupId ? { ...group, isMember: true } : group
          )
        );
      }
      console.log(response.data);
    } catch (error) {
      console.error('Error joining the group:', error);
      alert('Failed to join the group. Please try again later.');
    }
  };
  
  const handleRequestPrivateGroup = async (groupId: number, groupName: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Authentication token not found. Please log in.');
      return;
    }
  
    try {
      const response = await axios.post(`http://localhost:3000/groups/request-join/${groupId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      alert(`Request to join ${groupName} has been sent.`);
      console.log(response.data);
    } catch (error) {
      console.error('Error requesting to join the group:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          alert('This operation is only allowed for private groups.');
        } else if (error.response.status === 404) {
          alert('Group or user not found.');
        } else {
          alert('Failed to send join request. Please try again later.');
        }
      } else {
        alert('An unexpected error occurred. Please try again later.');
      }
    }
  };
  
  const handleCreateGroup = async () => {
    if (!newGroupName) {
      alert('Group name is required');
      return;
    }

    if (!userId) {
      alert('You must be logged in to create a group');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/groups/create', {
        name: newGroupName,
        visibility: newGroupVisibility,
        userId: parseInt(userId, 10)
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const createdGroup = response.data;

      // Update the appropriate group list
      if (newGroupVisibility === 'public') {
        setPublicGroups(prevGroups => [...prevGroups, { ...createdGroup, isMember: true }]);
      } else {
        setPrivateGroups(prevGroups => [...prevGroups, { ...createdGroup, isMember: true }]);
      }

      // Reset form
      setNewGroupName('');
      setNewGroupVisibility('public');

      alert('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading groups...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="groups-container">
      <h2 className="groups-heading">Groups</h2>
      
      <div className="groups-section">
        <h3>Private Groups</h3>
        <table className="groups-table">
          <tbody>
            {privateGroups.map(group => (
              <tr 
                key={group.id} 
                onClick={() => handleRequestPrivateGroup(group.id ,group.name)}
                style={{ backgroundColor: group.isMember ? 'lightgreen' : 'inherit' }}
              >
                <td>{group.name}</td>
                <td>{group.isMember ? '(Member)' : ''}</td>
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
              <tr 
                key={group.id} 
                onClick={() => handleJoinPublicGroup(group.id)}
                style={{ backgroundColor: group.isMember ? 'black' : 'inherit' }}
              >
                <td>{group.name}</td>
                <td>{group.isMember ? '(Member)' : 'Join'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="create-group">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="New Group Name"
        />
        <select
          value={newGroupVisibility}
          onChange={(e) => setNewGroupVisibility(e.target.value as 'public' | 'private')}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <button onClick={handleCreateGroup} className="create-group-button">
          Create Group
        </button>
      </div>
    </div>
  );
};

export default Groups;