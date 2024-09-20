import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import './Groups.css';
import { ExtendedGroup, JoinRequest } from './types';
import { createGroup, fetchGroups, fetchJoinRequestsForGroup } from './api';
import { GroupCard } from './GroupCard';
import { CreateGroupForm } from './CreateGroupForm';



const Groups: React.FC = () => {
  const [publicGroups, setPublicGroups] = useState<ExtendedGroup[]>([]);
  const [privateGroups, setPrivateGroups] = useState<ExtendedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<{ [key: number]: JoinRequest[] }>({});
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState<{ [key: number]: boolean }>({});
  const [editingName, setEditingName] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchGroupsData(userId);
    }
  }, []);

  const fetchGroupsData = async (userId: string) => {
    try {
      const { publicGroups, privateGroups } = await fetchGroups(userId);
      setPublicGroups(publicGroups);
      setPrivateGroups(privateGroups);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to fetch groups. Please try again later.');
      setLoading(false);
    }
  };

  const handleIconClick = async (groupId: number) => {
    if (activeGroup === groupId) {
      setActiveGroup(null);
    } else {
      try {
        const requests = await fetchJoinRequestsForGroup(groupId);
        setJoinRequests(prev => ({ ...prev, [groupId]: requests }));
        setActiveGroup(groupId);
      } catch (error) {
        console.error('Error fetching join requests:', error);
        alert('Failed to fetch join requests. Please try again.');
      }
    }
  };

  const handleShowSettings = (groupId: number) => {
    setShowSettings(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleCreateGroup = async (name: string, visibility: 'public' | 'private') => {
    try {
      const newGroup = await createGroup(name, visibility);
      if (newGroup.visibility === 'public') {
        setPublicGroups(prev => [...prev, newGroup]);
      } else {
        setPrivateGroups(prev => [...prev, newGroup]);
      }
      alert('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="groups-container">
      <h1 className="groups-title">Groups</h1>
      
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
                  onShowRequests={() => handleIconClick(group.id)}
                  isActive={activeGroup === group.id}
                  joinRequests={joinRequests[group.id] || []}
                  onShowSettings={() => handleShowSettings(group.id)}
                  showSettings={showSettings[group.id]}
                  editingName={editingName[group.id] || ''}
                  setEditingName={(name: any) => setEditingName(prev => ({ ...prev, [group.id]: name }))}
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
                  isPublic
                  onShowSettings={() => handleShowSettings(group.id)}
                  showSettings={showSettings[group.id]}
                  editingName={editingName[group.id] || ''}
                  setEditingName={(name: any) => setEditingName(prev => ({ ...prev, [group.id]: name }))}
                />
              ))}
            </div>
          )}
        </div>

        <CreateGroupForm onCreateGroup={handleCreateGroup} />
      </div>
    </div>
  );
};

export default Groups;