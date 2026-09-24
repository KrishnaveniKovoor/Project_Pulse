import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderKanban, Grid3X3, List } from 'lucide-react';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import SearchInput from '../components/common/SearchInput';
import Select from '../components/common/Select';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await projectService.getProjects(params);
      setProjects(res.data.data || []);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProjects, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleCreate = async (data) => {
    try {
      const res = await projectService.createProject(data);
      toast.success('Project created!');
      setShowModal(false);
      setEditingProject(null);
      fetchProjects();
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleEdit = async (data) => {
    try {
      await projectService.updateProject(editingProject._id, data);
      toast.success('Project updated!');
      setShowModal(false);
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
    }
  };

  const handleDelete = async (id) => {
    try {
      await projectService.deleteProject(id);
      toast.success('Project deleted');
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FolderKanban size={24} className="text-[#3399B7]" /> Projects
          </h1>
          <p className="text-muted mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects…"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#3399B7] text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid3X3 size={15} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[#3399B7] text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchProjects} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={search || statusFilter ? 'Try adjusting your filters' : 'Create your first project to get started'}
          action={{ label: 'New Project', onClick: openCreate }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(project => (
            <ProjectCard
              key={project._id}
              project={project}
              onClick={() => navigate(`/projects/${project._id}`)}
              onEdit={() => openEdit(project)}
              onDelete={() => handleDelete(project._id)}
            />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Members</th>
                <th>Due Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="cursor-pointer"
                >
                  <td>
                    <div>
                      <p className="font-medium text-[#485257]">{project.name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-xs">{project.description}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${project.status === 'active' ? 'bg-[#A8D7E8] text-[#2980a0]' : 'bg-gray-100 text-gray-600'}`}>
                      {project.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3399B7] rounded-full"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{project.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="text-sm text-gray-500">{project.members?.length || 0}</td>
                  <td className="text-sm text-gray-500">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <button
                      onClick={e => { e.stopPropagation(); openEdit(project); }}
                      className="btn-ghost text-xs py-1 px-2"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingProject(null); }}
        title={editingProject ? 'Edit Project' : 'New Project'}
        size="lg"
      >
        <ProjectForm
          initialData={editingProject}
          onSubmit={editingProject ? handleEdit : handleCreate}
          onCancel={() => { setShowModal(false); setEditingProject(null); }}
        />
      </Modal>
    </div>
  );
};

export default ProjectsPage;
