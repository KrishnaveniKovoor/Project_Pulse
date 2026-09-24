import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Calendar, Users, Activity, CheckCircle, 
  Settings, Layout, LayoutList, Clock, Plus, Trash2, 
  AlertCircle, FileText, Edit
} from 'lucide-react';

import { projectService } from '../services/projectService';
import { sprintService } from '../services/sprintService';
// Assuming taskService is used inside KanbanBoard or needed for stats, but project stats might come from project details.

import KanbanBoard from '../components/tasks/KanbanBoard';
import SprintCard from '../components/sprints/SprintCard';
import SprintForm from '../components/sprints/SprintForm';
import ProjectForm from '../components/projects/ProjectForm';

import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ProgressBar from '../components/common/ProgressBar';

import { formatDate, getStatusColor, getStatusLabel, getPriorityColor } from '../utils/helpers';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  const [sprints, setSprints] = useState([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'overview' && project) {
      fetchActivities();
    } else if (activeTab === 'sprints' && project) {
      fetchSprints();
    }
  }, [activeTab, project]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, statsRes] = await Promise.allSettled([
        projectService.getProject(id),
        projectService.getProjectStats(id),
      ]);
      const projData = projRes.status === 'fulfilled' ? (projRes.value.data?.data || projRes.value.data) : null;
      const statsData = statsRes.status === 'fulfilled' ? (statsRes.value.data?.data || statsRes.value.data) : null;
      if (projData) {
        setProject({ ...projData, stats: statsData });
      } else {
        setError('Failed to load project details.');
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project details. Please try again later.');
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const response = await projectService.getProjectActivity(id);
      setActivities(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchSprints = async () => {
    setLoadingSprints(true);
    try {
      const response = await sprintService.getSprints(id);
      setSprints(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching sprints:', err);
      toast.error('Failed to load sprints');
    } finally {
      setLoadingSprints(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await projectService.deleteProject(id);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleProjectUpdate = (updatedProject) => {
    setProject(updatedProject);
    toast.success('Project updated successfully');
  };

  const handleSprintCreated = (newSprint) => {
    setSprints(prev => [newSprint, ...prev]);
    setIsSprintModalOpen(false);
    toast.success('Sprint created successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading project details..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        <EmptyState 
          icon={AlertCircle}
          title="Project Not Found"
          description={error || "The project you're looking for doesn't exist or you don't have permission to view it."}
          action={<Button onClick={() => navigate('/projects')}>View All Projects</Button>}
        />
      </div>
    );
  }

  // Calculate stats
  const totalTasks = project.stats?.totalTasks || 0;
  const completedTasks = project.stats?.completedTasks || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const membersCount = project.members?.length || 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layout },
    { id: 'tasks', label: 'Tasks', icon: LayoutList },
    { id: 'sprints', label: 'Sprints', icon: Clock },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header section */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="mb-4 -ml-3 text-sidebar">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-sidebar">{project.name}</h1>
                <Badge variant={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
                <Badge variant={getPriorityColor(project.priority)}>
                  {project.priority || 'Medium'} Priority
                </Badge>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted mt-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Due {formatDate(project.endDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{membersCount} members</span>
                </div>
              </div>
            </div>
            
            {activeTab === 'tasks' && (
              <Button onClick={() => {/* handle open task modal, possibly handled inside KanbanBoard but good to have here if standard */}}>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            )}
            
            {activeTab === 'sprints' && (
              <Button onClick={() => setIsSprintModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Sprint
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-sidebar hover:text-primary hover:border-gray-300'
                }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-sidebar flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  Project Description
                </h3>
                <div className="text-sidebar whitespace-pre-wrap">
                  {project.description || 'No description provided.'}
                </div>
              </div>

              <div className="card p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-sidebar flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-sidebar font-medium">Overall Completion</span>
                    <span className="text-primary font-bold">{progress}%</span>
                  </div>
                  <ProgressBar progress={progress} className="h-3" color="primary" />
                  <div className="flex justify-between text-sm text-muted pt-2 border-t border-gray-100">
                    <span>{completedTasks} completed tasks</span>
                    <span>{totalTasks} total tasks</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-sidebar flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </h3>
                {loadingActivities ? (
                  <div className="py-4 text-center">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((activity, index) => (
                      <div key={activity.id || index} className="flex gap-3 text-sm">
                        <div className="mt-0.5">
                          <Avatar size="sm" name={activity.user?.name} src={activity.user?.avatar} />
                        </div>
                        <div>
                          <p className="text-sidebar">
                            <span className="font-medium">{activity.user?.name}</span> {activity.action}
                          </p>
                          <p className="text-xs text-muted mt-1">{formatDate(activity.createdAt, true)}</p>
                        </div>
                      </div>
                    ))}
                    {activities.length > 5 && (
                      <Button variant="ghost" size="sm" className="w-full mt-2">View All Activity</Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted italic">No recent activity.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="h-full min-h-[500px]">
            <KanbanBoard projectId={id} />
          </div>
        )}

        {/* Sprints Tab */}
        {activeTab === 'sprints' && (
          <div>
            {loadingSprints ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner text="Loading sprints..." />
              </div>
            ) : sprints.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sprints.map(sprint => (
                  <SprintCard key={sprint._id || sprint.id} sprint={sprint} />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Clock}
                title="No Sprints Found"
                description="This project doesn't have any sprints yet. Create one to start organizing your tasks."
                action={<Button onClick={() => setIsSprintModalOpen(true)}>Create Sprint</Button>}
              />
            )}

            <Modal
              isOpen={isSprintModalOpen}
              onClose={() => setIsSprintModalOpen(false)}
              title="Create New Sprint"
            >
              <SprintForm 
                projectId={id} 
                onSuccess={handleSprintCreated} 
                onCancel={() => setIsSprintModalOpen(false)} 
              />
            </Modal>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-sidebar">Project Members ({project.members?.length || 0})</h3>
              <Button size="sm" variant="outline">Manage Members</Button>
            </div>
            <ul className="divide-y divide-gray-100">
              {project.members?.length > 0 ? (
                project.members.map((member) => {
                  // Handle populated member objects vs IDs
                  const user = member.user || member;
                  const role = member.role || 'Member';
                  
                  return (
                    <li key={user._id || user.id || Math.random()} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} src={user.avatarUrl} />
                        <div>
                          <p className="font-medium text-sidebar">{user.name}</p>
                          <p className="text-sm text-muted">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {role}
                      </Badge>
                    </li>
                  );
                })
              ) : (
                <li className="p-8 text-center text-muted">No members assigned to this project.</li>
              )}
            </ul>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-sidebar mb-6 flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary" />
                Edit Project Details
              </h3>
              <ProjectForm 
                project={project} 
                onSuccess={handleProjectUpdate} 
                isEdit={true}
              />
            </div>

            <div className="card bg-white p-6 rounded-lg shadow-sm border border-red-100">
              <h3 className="text-lg font-semibold text-red-600 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-sidebar mb-4">
                Deleting a project is irreversible. All tasks, sprints, and data associated with this project will be permanently removed.
              </p>
              <Button 
                variant="danger" 
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </Button>
            </div>

            <ConfirmDialog
              isOpen={isDeleteConfirmOpen}
              onClose={() => setIsDeleteConfirmOpen(false)}
              onConfirm={handleDeleteProject}
              title="Delete Project"
              message={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will delete all associated tasks and sprints.`}
              confirmText="Yes, Delete Project"
              cancelText="Cancel"
              type="danger"
              isLoading={isDeleting}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
