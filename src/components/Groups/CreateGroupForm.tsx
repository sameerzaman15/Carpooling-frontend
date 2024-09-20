import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

interface CreateGroupFormProps {
  onCreateGroup: (name: string, visibility: 'public' | 'private') => void;
}

export const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onCreateGroup }) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupVisibility, setNewGroupVisibility] = useState<'public' | 'private'>('public');

  const handleCreateGroup = () => {
    if (!newGroupName) {
      alert('Group name is required');
      return;
    }
    onCreateGroup(newGroupName, newGroupVisibility);
    setNewGroupName('');
    setNewGroupVisibility('public');
  };

  return (
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
          <FaPlus className="btn-icon" />
          Add
        </button>
      </div>
    </div>
  );
};