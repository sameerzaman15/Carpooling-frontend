import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaBell } from 'react-icons/fa'; 
import './Groups.css';

interface ExtendedGroup {
  id: number;
  name: string;
  visibility: 'public' | 'private';
  owner: {
    id: number;
    fullName: string;
  };
  users: { id: number; fullName: string }[];
  isMember?: boolean; 
  isOwner?: boolean;
  joinRequestPending?: boolean;  
}

interface JoinRequest {
  id: number;
  fullName: string;
  status: string;
}

const Groups: React.FC = () => {
  const [publicGroups, setPublicGroups] = useState<ExtendedGroup[]>([]);
  const [privateGroups, setPrivateGroups] = useState<ExtendedGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupVisibility, setNewGroupVisibility] = useState<'public' | 'private'>('public');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<{ [key: number]: JoinRequest[] }>({});
  const [activeGroup, setActiveGroup] = useState<number | null>(null); 

  const hasFetchedData = useRef(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      console.log('User found in local storage.', storedUserId);
    } else {
      console.log('User ID not found in local storage.', storedUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchGroups();
    }
  }, [userId]); 

  const fetchGroups = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    if (!userId) {
      setError('User ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const userIdNumber = parseInt(userId, 10);

      if (isNaN(userIdNumber)) {
        console.error('Invalid User ID:', userId);
        setError('Invalid User ID. Please log in again.');
        setLoading(false);
        return;
      }

      const [publicResponse, privateResponse] = await Promise.all([
        axios.get('http://localhost:3000/groups/public', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/groups/private', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('Public groups response:', publicResponse.data);
      console.log('Private groups response:', privateResponse.data);

      const publicGroupsData = publicResponse.data.map((group: ExtendedGroup) => {
        const isOwner = group.owner.id === userIdNumber; 
        const isMember = !isOwner && group.users.some(user => user.id === userIdNumber);
        console.log(`Group ${group.name} - isMember: ${isMember}, isOwner: ${isOwner}`);
        return { ...group, isMember, isOwner };
      });
      

      const privateGroupsData = privateResponse.data.map((group: ExtendedGroup) => {
        const isMember = group.users.some(user => user.id === userIdNumber);
        const isOwner = group.owner.id === userIdNumber;
        console.log(`Group ${group.name} - isMember: ${isMember}, isOwner: ${isOwner}`);
        return { ...group, isMember, isOwner };
      });

      setPublicGroups(publicGroupsData);
      setPrivateGroups(privateGroupsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to fetch groups. Please try again later.');
      setLoading(false);
    }
  };

  const fetchJoinRequestsForGroup = async (groupId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Authentication token not found. Please log in.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/groups/${groupId}/join-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const requests = response.data;
      const formattedRequests = requests.map((request: any) => ({
        id: request.id,
        fullName: request.user.fullName,
        status: request.status
      }));

      setJoinRequests(prev => ({ ...prev, [groupId]: formattedRequests }));
      setActiveGroup(groupId); 
    } catch (error) {
      console.error('Error fetching join requests:', error);
      alert('Failed to fetch join requests. Please try again.');
    }
  };

  const handleIconClick = async (groupId: number) => {
    if (activeGroup === groupId) {
      setActiveGroup(null);
    } else {
      await fetchJoinRequestsForGroup(groupId);
    }
  };

  const handleJoinPublicGroup = async (groupId: number) => {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('userId');
    
    if (!token) {
      alert('Authentication token not found. Please log in.');
      return;
    }
  
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }
  
    try {
      const response = await axios.post(
        `http://localhost:3000/groups/${groupId}/join`,
        { userId: parseInt(userId, 10) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      console.log('Join public group response:', response.data);
  
      setPublicGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === groupId ? { ...group, isMember: true } : group
        )
      );
      alert('Successfully joined the group!');
    } catch (error) {
      console.error('Error joining public group:', error);
      alert('Failed to join the group. Please try again.');
    }
  };

  const handleRequestPrivateGroup = async (groupId: number, groupName: string) => {
    console.log(`Request to join private group with ID: ${groupId} and Name: ${groupName}`);
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/groups/request-join/${groupId}`,
        {},  // Empty body as we're sending the user info via token
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Request to join private group response:', response.data);

      // Update local state to reflect the pending join request
      setPrivateGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === groupId ? { ...group, joinRequestPending: true } : group
        )
      );

      alert('Join request sent successfully!');
    } catch (error) {
      console.error('Error requesting to join private group:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Failed to send join request: ${error.response.data.message || 'Please try again.'}`);
      } else {
        alert('Failed to send join request. Please try again.');
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

      console.log('Created group response:', response.data);

      const createdGroup = response.data;

      const newGroup: ExtendedGroup = {
        id: createdGroup.id,
        name: createdGroup.name,
        visibility: createdGroup.visibility,
        owner: { id: parseInt(userId, 10), fullName: 'You' },
        users: [{ id: parseInt(userId, 10), fullName: 'You' }],
        isOwner: true,
        isMember: createdGroup.visibility === 'public' 
      };

      if (newGroup.visibility === 'public') {
        setPublicGroups((prevGroups) => [...prevGroups, newGroup]);
      } else {
        setPrivateGroups((prevGroups) => [...prevGroups, newGroup]);
      }

      setNewGroupName('');
      setNewGroupVisibility('public');
      alert('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const handleAcceptRequest = async (groupId: number, requestId: number) => {
    console.log(`Accepting request ${requestId} for group ${groupId}`);
    // Dummy API call
    try {
      // In a real scenario, you would make an API call here
      // await axios.post(`http://localhost:3000/groups/${groupId}/accept-request/${requestId}`);
      
      // Update local state
      setJoinRequests(prev => ({
        ...prev,
        [groupId]: prev[groupId].filter(request => request.id !== requestId)
      }));

      alert('Request accepted successfully!');
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const handleRejectRequest = async (groupId: number, requestId: number) => {
    console.log(`Rejecting request ${requestId} for group ${groupId}`);
    // Dummy API call
    try {
      // In a real scenario, you would make an API call here
      // await axios.post(`http://localhost:3000/groups/${groupId}/reject-request/${requestId}`);
      
      // Update local state
      setJoinRequests(prev => ({
        ...prev,
        [groupId]: prev[groupId].filter(request => request.id !== requestId)
      }));

      alert('Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

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
                style={{ backgroundColor: group.isOwner ? 'lightblue' : group.isMember ? 'lightgreen' : 'inherit' }}
              >
                <td>{group.name}</td>
                <td>
                  {group.isMember ? (
                    <span>Member</span>
                  ) : group.isOwner ? (
                    <span>Owner</span>
                  ) : (
                    <button onClick={() => handleRequestPrivateGroup(group.id, group.name)}>
                      {group.joinRequestPending ? 'Request Sent' : 'Request to Join'}
                    </button>
                  )}
                </td>
                {group.visibility === 'private' && (
                  <td>
                    <FaBell
                      className="notification-icon"
                      onClick={() => handleIconClick(group.id)}
                    />
                    {activeGroup === group.id && (
                      <div>
                        {joinRequests[group.id]?.length > 0 ? (
                          joinRequests[group.id].map((request) => (
                            <div key={request.id}>
                              {request.fullName} has requested to join your group!
                              <button onClick={() => handleAcceptRequest(group.id, request.id)}>Accept</button>
                              <button onClick={() => handleRejectRequest(group.id, request.id)}>Reject</button>
                            </div>
                          ))
                        ) : (
                          <div>No join requests for this group</div>
                        )}
                      </div>
                    )}
                  </td>
                )}
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
                style={{ backgroundColor: group.isOwner ? 'lightblue' : group.isMember ? 'lightgreen' : 'inherit' }}
              >
                <td>{group.name}</td>
                <td>
                  {group.isMember ? (
                    <span>Member</span>
                  ) : group.isOwner ? (
                    <span>Owner</span>
                  ) : (
                    <button onClick={() => handleJoinPublicGroup(group.id)}>
                      {group.isMember ? 'Joined' : 'Join'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="create-group-section">
        <h3>Create a New Group</h3>
        <input
          type="text"
          placeholder="Group Name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <select
          value={newGroupVisibility}
          onChange={(e) => setNewGroupVisibility(e.target.value as 'public' | 'private')}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <button onClick={handleCreateGroup}>Create Group</button>
      </div>
    </div>
  );
};

export default Groups;