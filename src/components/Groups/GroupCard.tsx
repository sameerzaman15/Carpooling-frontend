import React, { useState } from 'react';
import { FaCog, FaUserPlus, FaBell, FaCheck, FaTimes, FaChevronDown, FaChevronUp, FaSignOutAlt, FaUserMinus } from 'react-icons/fa';
import { ExtendedGroup, JoinRequest } from './types';
import { acceptJoinRequest, deleteGroup, editGroupName, joinPublicGroup, leaveGroup, rejectJoinRequest, removeMember, requestPrivateGroup } from './api';

interface GroupCardProps {
  group: ExtendedGroup;
  isPublic?: boolean;
  onShowRequests?: () => void;
  isActive?: boolean;
  joinRequests?: JoinRequest[];
  onShowSettings: () => void;
  showSettings: boolean;
  editingName: string;
  setEditingName: (name: string) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  isPublic,
  onShowRequests,
  isActive,
  joinRequests,
  onShowSettings,
  showSettings,
  editingName,
  setEditingName,
}) => {
  const [showMembers, setShowMembers] = useState(false);

  const handleJoinGroup = async () => {
    try {
      await joinPublicGroup(group.id);
      alert('Successfully joined the group!');
    } catch (error) {
      console.error('Error joining public group:', error);
      alert('Failed to join the group. Please try again.');
    }
  };

  const handleJoinRequest = async () => {
    try {
      await requestPrivateGroup(group.id);
      alert('Join request sent successfully!');
    } catch (error) {
      console.error('Error requesting to join private group:', error);
      alert('Failed to send join request. Please try again.');
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await acceptJoinRequest(requestId);
      alert('Request accepted successfully!');
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await rejectJoinRequest(requestId);
      alert('Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const handleEditName = async () => {
    try {
      await editGroupName(group.id, editingName);
      alert('Group name updated successfully!');
    } catch (error) {
      console.error('Error updating group name:', error);
      alert('Failed to update group name. Please try again.');
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteGroup(group.id);
        alert('Group deleted successfully!');
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('Failed to delete group. Please try again.');
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await leaveGroup(group.id);
        alert('You have left the group successfully!');
      } catch (error) {
        console.error('Error leaving group:', error);
        alert('Failed to leave the group. Please try again.');
      }
    }
  };

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from the group?`)) {
      try {
        await removeMember(group.id, memberId);
        alert(`${memberName} has been removed from the group.`);
      } catch (error) {
        console.error('Error removing member:', error);
        alert('Failed to remove member. Please try again.');
      }
    }
  };

  return (
    <div className="group-card">
      <div className="group-header">
        <h3 className="group-name">{group.name}</h3>
        {group.isOwner && (
          <button onClick={onShowSettings} className="btn btn-icon">
            <FaCog />
          </button>
        )}
      </div>
      {showSettings && (
        <div className="group-settings">
          <input
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            placeholder="New group name"
            className="form-input"
          />
          <button onClick={handleEditName} className="btn btn-primary">
            Update Name
          </button>
          <button onClick={handleDeleteGroup} className="btn btn-danger">
            Delete Group
          </button>
        </div>
      )}
      <p className="group-info members-toggle" onClick={() => setShowMembers(!showMembers)}>
        Members: {group.users.length}
        {showMembers ? <FaChevronUp className="toggle-icon" /> : <FaChevronDown className="toggle-icon" />}
      </p>
      {showMembers && (
        <ul className="members-list">
          {group.users.map(user => (
            <li key={user.id} className="member-item">
              {user.fullName}
              {group.isOwner && user.id !== group.owner.id && (
                <button 
                  onClick={() => handleRemoveMember(user.id, user.fullName)} 
                  className="btn btn-danger btn-small"
                  title="Remove member"
                >
                  <FaUserMinus />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      
      {group.isOwner ? (
        <p className="group-status status-owner">You are the owner of this group</p>
      ) : group.isMember ? (
        <>
          <p className="group-status status-member">You are a member of this group</p>
          <button onClick={handleLeaveGroup} className="btn btn-danger btn-full">
            <FaSignOutAlt className="btn-icon" />
            Leave Group
          </button>
        </>
      ) : isPublic ? (
        <button onClick={handleJoinGroup} className="btn btn-primary btn-full">
          <FaUserPlus className="btn-icon" />
          Join Group
        </button>
      ) : (
        <button onClick={handleJoinRequest} className="btn btn-primary btn-full">
          <FaUserPlus className="btn-icon" />
          Request to Join
        </button>
      )}
      
      {group.joinRequestPending && (
        <p className="group-status status-pending">Join request pending</p>
      )}
      
      {group.isOwner && onShowRequests && (
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
                  <button onClick={() => handleAcceptRequest(request.id)} className="btn btn-accept">
                    <FaCheck />
                  </button>
                  <button onClick={() => handleRejectRequest(request.id)} className="btn btn-reject">
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
};