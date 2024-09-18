import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaBell, FaCheck, FaPlus, FaTimes, FaUserPlus } from 'react-icons/fa'; 
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

      const publicGroupsData = publicResponse.data.map((group: ExtendedGroup) => {
        const isOwner = group.owner.id === userIdNumber; 
        const isMember = !isOwner && group.users.some(user => user.id === userIdNumber);
        return { ...group, isMember, isOwner };
      });

      const privateGroupsData = privateResponse.data.map((group: ExtendedGroup) => {
        const isMember = group.users.some(user => user.id === userIdNumber);
        const isOwner = group.owner.id === userIdNumber;
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
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/groups/${groupId}/request-join/`,
        {},  
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

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
    try {
     
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `http://localhost:3000/groups/join-requests/${requestId}/approve`,
        {}, 
        {
          headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
          }
        }
      );
  
      if (response.status === 201) {
  
        setJoinRequests(prev => ({
          ...prev,
          [groupId]: prev[groupId].filter(req => req.id !== requestId)
        }));
  
        // Notify the user of success
        alert('Request accepted successfully!');
      } else {
        alert('Failed to accept request. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };
  
  

  const handleRejectRequest = async (groupId: number, requestId: number) => {
    try {
      // Dummy API call
      // await axios.post(`http://localhost:3000/groups/${groupId}/reject-request/${requestId}`);
      
      setJoinRequests(prev => ({
        ...prev,
        [groupId]: prev[groupId].filter(req => req.id !== requestId)
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
      <h1 className="groups-title">Group Management</h1>
      
      <div className="groups-section">
        <div className="mb-12">
          <h2 className="section-title">Private Groups</h2>
          {privateGroups.length === 0 ? (
            <p className="group-info">No private groups available</p>
          ) : (
            <div className="groups-grid">
              {privateGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoinRequest={() => handleRequestPrivateGroup(group.id, group.name)}
                  onShowRequests={() => handleIconClick(group.id)}
                  isActive={activeGroup === group.id}
                  joinRequests={joinRequests[group.id] || []}
                  onAcceptRequest={(requestId) => handleAcceptRequest(group.id, requestId)}
                  onRejectRequest={(requestId) => handleRejectRequest(group.id, requestId)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mb-12">
          <h2 className="section-title">Public Groups</h2>
          {publicGroups.length === 0 ? (
            <p className="group-info">No public groups available</p>
          ) : (
            <div className="groups-grid">
              {publicGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoinGroup={() => handleJoinPublicGroup(group.id)}
                  isPublic
                />
              ))}
            </div>
          )}
        </div>

        <div className="create-group-form">
          <h2 className="form-title">Create New Group</h2>
          <div className="form-content">
            <input
              type="text"
              placeholder="New group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="form-input"
            />
            <select
              value={newGroupVisibility}
              onChange={(e) => setNewGroupVisibility(e.target.value as 'public' | 'private')}
              className="form-select"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <button onClick={handleCreateGroup} className="btn btn-primary">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const GroupCard: React.FC<{
  group: ExtendedGroup;
  onJoinGroup?: () => void;
  onJoinRequest?: () => void;
  onShowRequests?: () => void;
  isActive?: boolean;
  joinRequests?: JoinRequest[];
  onAcceptRequest?: (requestId: number) => void;
  onRejectRequest?: (requestId: number) => void;
  isPublic?: boolean;
}> = ({
  group,
  onJoinGroup,
  onJoinRequest,
  onShowRequests,
  isActive,
  joinRequests,
  onAcceptRequest,
  onRejectRequest,
  isPublic
}) => (
  <div className="group-card">
    <h3 className="group-name">{group.name}</h3>
    <p className="group-info">Owner: {group.owner.fullName}</p>
    <p className="group-info">Members: {group.users.length}</p>
    
    {group.isOwner ? (
      <p className="group-status status-owner">You are the owner of this group</p>
    ) : group.isMember ? (
      <p className="group-status status-member">You are a member of this group</p>
    ) : isPublic ? (
      <button onClick={onJoinGroup} className="btn btn-primary btn-full">
        <FaUserPlus className="btn-icon" />
        Join Group
      </button>
    ) : (
      <button onClick={onJoinRequest} className="btn btn-primary btn-full">
        <FaUserPlus className="btn-icon" />
        Request to Join
      </button>
    )}
    
    {group.joinRequestPending && (
      <p className="group-status status-pending">Join request pending</p>
    )}
    
    {onShowRequests && (
      <button onClick={onShowRequests} className="btn btn-secondary btn-full">
        <FaBell className="btn-icon" />
        {isActive ? 'Hide Requests' : 'Show Requests'}
      </button>
    )}
    
    {isActive && joinRequests && (
      <div className="join-requests">
        {joinRequests.map((request) => (
          <div key={request.id} className="join-request">
            <span>{request.fullName}</span>
            {request.status === 'pending' && (
              <div className="request-actions">
                <button onClick={() => onAcceptRequest?.(request.id)} className="btn btn-accept">
                  <FaCheck />
                </button>
                <button onClick={() => onRejectRequest?.(request.id)} className="btn btn-reject">
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Groups;
