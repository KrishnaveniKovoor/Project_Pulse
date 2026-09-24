import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Zap, Plus } from 'lucide-react';
import { sprintService } from '../services/sprintService';
import { projectService } from '../services/projectService';
import SprintCard from '../components/sprints/SprintCard';
import SprintForm from '../components/sprints/SprintForm';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';

const SprintsPage = () => {
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, sprintId: null });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchSprints();
  }, [selectedProjectId]);

  const fetchInitialData = async () => {
    try {
      const projRes = await projectService.getProjects();
      setProjects(projRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load projects');
    }
  };

  const fetchSprints = async () => {
    setLoading(true);
    try {
      const res = await sprintService.getSprints(selectedProjectId || undefined);
      setSprints(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load sprints');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingSprint(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (sprint) => {
    setEditingSprint(sprint);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (sprintId) => {
    setDeleteDialog({ isOpen: true, sprintId });
  };

  const confirmDelete = async () => {
    try {
      await sprintService.deleteSprint(deleteDialog.sprintId);
      toast.success('Sprint deleted successfully');
      setSprints(sprints.filter(s => s._id !== deleteDialog.sprintId));
    } catch (err) {
      toast.error('Failed to delete sprint');
    } finally {
      setDeleteDialog({ isOpen: false, sprintId: null });
    }
  };

  const handleFormSuccess = (savedSprint) => {
    setIsModalOpen(false);
    toast.success(editingSprint ? 'Sprint updated' : 'Sprint created');
    fetchSprints(); // Reload to ensure correct ordering and relationships
  };

  // Derived Stats
  const activeSprints = sprints.filter(s => s.status === 'active').length;
  const plannedSprints = sprints.filter(s => s.status === 'planned').length;
  const completedSprints = sprints.filter(s => s.status === 'completed').length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Sprints
          </h1>
          <p className="text-muted">Manage iterative work cycles across projects.</p>
        </div>
        <Button className="btn-primary whitespace-nowrap" onClick={handleCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          New Sprint
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="w-full md:w-64">
          <Select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            options={[
              { value: '', label: 'All Projects' },
              ...projects.map(p => ({ value: p._id, label: p.name }))
            ]}
            className="w-full"
          />
        </div>
        
        <div className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>
        
        <div className="flex flex-1 w-full justify-between sm:justify-start gap-6 overflow-x-auto text-sm">
          <div className="flex flex-col">
            <span className="text-muted uppercase tracking-wide text-xs">Total</span>
            <span className="font-semibold text-gray-900 text-lg">{sprints.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted uppercase tracking-wide text-xs">Active</span>
            <span className="font-semibold text-primary text-lg">{activeSprints}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted uppercase tracking-wide text-xs">Planned</span>
            <span className="font-semibold text-orange-500 text-lg">{plannedSprints}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted uppercase tracking-wide text-xs">Completed</span>
            <span className="font-semibold text-green-600 text-lg">{completedSprints}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : sprints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sprints.map(sprint => (
            <SprintCard
              key={sprint._id}
              sprint={sprint}
              onEdit={() => handleEditClick(sprint)}
              onDelete={() => handleDeleteClick(sprint._id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Zap}
          title="No sprints found"
          description={selectedProjectId ? "This project doesn't have any sprints yet." : "You haven't created any sprints yet."}
          actionLabel="Create Sprint"
          onAction={handleCreateClick}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingSprint ? 'Edit Sprint' : 'Create Sprint'}
      >
        <SprintForm 
          sprint={editingSprint}
          projects={projects}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, sprintId: null })}
        onConfirm={confirmDelete}
        title="Delete Sprint"
        message="Are you sure you want to delete this sprint? The tasks associated with it will not be deleted but will lose their sprint association."
        confirmText="Delete Sprint"
        danger
      />
    </div>
  );
};

export default SprintsPage;
