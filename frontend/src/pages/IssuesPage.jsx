import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, Plus, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { issueService } from '../services/issueService';
import { projectService } from '../services/projectService';
import IssueForm from '../components/issues/IssueForm';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Select from '../components/common/Select';
import SearchInput from '../components/common/SearchInput';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { getStatusColor, getPriorityColor, formatDate } from '../utils/helpers';

const IssuesPage = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, issueId: null });

  useEffect(() => {
    fetchProjects();
    fetchIssues();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectService.getProjects();
      setProjects(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await issueService.getIssues();
      setIssues(res.data?.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? issue.status === statusFilter : true;
    const matchesPriority = priorityFilter ? issue.priority === priorityFilter : true;
    const matchesProject = projectFilter ? (issue.project?._id === projectFilter || issue.project === projectFilter) : true;
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const handleCreateClick = () => {
    setEditingIssue(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (e, issue) => {
    e.stopPropagation();
    setEditingIssue(issue);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e, issueId) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, issueId });
  };

  const confirmDelete = async () => {
    try {
      await issueService.deleteIssue(deleteDialog.issueId);
      toast.success('Issue deleted');
      setIssues(issues.filter(i => i._id !== deleteDialog.issueId));
    } catch (err) {
      toast.error('Failed to delete issue');
    } finally {
      setDeleteDialog({ isOpen: false, issueId: null });
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchIssues();
    toast.success(editingIssue ? 'Issue updated' : 'Issue created');
  };

  const getStatusDisplay = (status) => {
    const labels = {
      'open': 'Open',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return labels[status] || status;
  };

  // Stats
  const openCount = issues.filter(i => i.status === 'open').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const closedCount = issues.filter(i => i.status === 'closed').length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-danger" />
            Issue Tracker
          </h1>
          <p className="text-muted">Track bugs, problems, and technical debt.</p>
        </div>
        <Button className="btn-primary whitespace-nowrap" onClick={handleCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex flex-col">
          <span className="text-muted text-sm font-medium">Open</span>
          <span className="text-2xl font-bold text-gray-900">{openCount}</span>
        </div>
        <div className="card p-4 flex flex-col">
          <span className="text-muted text-sm font-medium">In Progress</span>
          <span className="text-2xl font-bold text-primary">{inProgressCount}</span>
        </div>
        <div className="card p-4 flex flex-col">
          <span className="text-muted text-sm font-medium">Resolved</span>
          <span className="text-2xl font-bold text-green-600">{resolvedCount}</span>
        </div>
        <div className="card p-4 flex flex-col">
          <span className="text-muted text-sm font-medium">Closed</span>
          <span className="text-2xl font-bold text-gray-500">{closedCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col lg:flex-row gap-4 items-center">
        <div className="w-full lg:w-1/3">
          <SearchInput
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' }
            ]}
          />
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: '', label: 'All Priorities' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' }
            ]}
          />
          <Select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            options={[
              { value: '', label: 'All Projects' },
              ...projects.map(p => ({ value: p._id, label: p.name }))
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredIssues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-sm text-gray-600">Issue</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Priority</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Project</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Assignee</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredIssues.map((issue) => (
                  <tr 
                    key={issue._id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/issues/${issue._id}`)}
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{issue.title}</span>
                        <span className="text-xs text-muted">Created {formatDate(issue.createdAt)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge color={getStatusColor(issue.status)}>
                        {getStatusDisplay(issue.status)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge color={getPriorityColor(issue.priority)}>
                        {issue.priority}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-700">{issue.project?.name || '-'}</span>
                    </td>
                    <td className="p-4">
                      {issue.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar user={issue.assignee} size="xs" />
                          <span className="text-sm text-gray-700">{issue.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={(e) => handleEditClick(e, issue)} className="p-1">
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => handleDeleteClick(e, issue._id)} className="p-1">
                          <Trash2 className="w-4 h-4 text-danger" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={AlertCircle}
            title="No issues found"
            description="There are no issues matching your criteria."
            actionLabel="Report Issue"
            onAction={handleCreateClick}
          />
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingIssue ? 'Edit Issue' : 'Report Issue'}
      >
        <IssueForm 
          issue={editingIssue}
          projects={projects}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, issueId: null })}
        onConfirm={confirmDelete}
        title="Delete Issue"
        message="Are you sure you want to delete this issue? This action cannot be undone."
        confirmText="Delete"
        danger
      />
    </div>
  );
};

export default IssuesPage;
