import React, { useState, useEffect, useMemo } from 'react';
import { Users, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService } from '../services/teamService';
import TeamCard from '../components/teams/TeamCard';
import TeamForm from '../components/teams/TeamForm';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import SearchInput from '../components/common/SearchInput';
import Button from '../components/common/Button';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await teamService.getTeams();
      setTeams(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreate = () => {
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  const handleDelete = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await teamService.deleteTeam(teamId);
        toast.success('Team deleted successfully');
        fetchTeams();
      } catch (error) {
        toast.error('Failed to delete team');
      }
    }
  };

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      if (editingTeam?._id) {
        await teamService.updateTeam(editingTeam._id, data);
        toast.success('Team updated successfully');
      } else {
        await teamService.createTeam(data);
        toast.success('Team created successfully');
      }
      setIsModalOpen(false);
      setEditingTeam(null);
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save team');
    } finally {
      setSaving(false);
    }
  };

  const filteredTeams = useMemo(() => {
    return teams.filter(team => 
      team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teams, searchQuery]);

  const totalMembers = useMemo(() => {
    return teams.reduce((acc, team) => acc + (team.members?.length || 0), 0);
  }, [teams]);

  if (loading && teams.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Users className="text-[#3399B7]" size={28} />
            Teams
          </h1>
          <p className="text-muted mt-1">Manage your organization's teams and members</p>
        </div>
        <Button variant="primary" onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={18} />
          Create Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 flex flex-col gap-2 border-l-4 border-l-[#3399B7]">
          <span className="text-muted text-sm font-medium">Total Teams</span>
          <span className="text-2xl font-bold">{teams.length}</span>
        </div>
        <div className="card p-4 flex flex-col gap-2 border-l-4 border-l-[#A8D7E8]">
          <span className="text-muted text-sm font-medium">Total Members</span>
          <span className="text-2xl font-bold">{totalMembers}</span>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="w-full max-w-md">
          <SearchInput 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search teams..." 
          />
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery ? "No teams found" : "No teams yet"}
          description={searchQuery ? "Try adjusting your search query" : "Create your first team to start collaborating"}
          action={{
            label: searchQuery ? "Clear Search" : "Create Team",
            onClick: searchQuery ? () => setSearchQuery('') : handleCreate,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map(team => (
            <TeamCard 
              key={team._id || team.id} 
              team={team} 
              onEdit={() => handleEdit(team)}
              onDelete={() => handleDelete(team._id || team.id)}
            />
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTeam(null); }}
        title={editingTeam ? 'Edit Team' : 'Create Team'}
      >
        <TeamForm 
          initialData={editingTeam || {}}
          onSubmit={handleSubmit}
          onCancel={() => { setIsModalOpen(false); setEditingTeam(null); }}
          loading={saving}
        />
      </Modal>
    </div>
  );
};

export default TeamsPage;
