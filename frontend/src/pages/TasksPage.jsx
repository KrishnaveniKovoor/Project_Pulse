import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, CheckSquare, LayoutGrid, List, Filter } from 'lucide-react';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';
import KanbanBoard from '../components/tasks/KanbanBoard';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { getStatusColor, getStatusLabel, getPriorityColor, formatDate, isOverdue } from '../utils/helpers';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';

const TasksPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: searchParams.get('status') || '',
    priority: '',
    assignee: '',
    project: '',
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status && filters.status !== 'overdue') params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.assignee) params.assignee = filters.assignee;
      if (filters.project) params.project = filters.project;
      const res = await taskService.getTasks(params);
      let data = res.data.data || [];
      if (filters.status === 'overdue') {
        data = data.filter(t => isOverdue(t.dueDate) && t.status !== 'done');
      }
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchTasks, 300);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  useEffect(() => {
    projectService.getProjects().then(res => setProjects(res.data.data || []));
  }, []);

  const handleCreate = async (data) => {
    try {
      await taskService.createTask(data);
      toast.success('Task created!');
      setShowModal(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await taskService.updateTask(editingTask._id, data);
      toast.success('Task updated!');
      setShowModal(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted');
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const openCreate = () => { setEditingTask(null); setShowModal(true); };
  const openEdit = (task) => { setEditingTask(task); setShowModal(true); };

  const groupedTasks = {
    todo: tasks.filter(t => t.status === 'todo'),
    inprogress: tasks.filter(t => t.status === 'inprogress'),
    inreview: tasks.filter(t => t.status === 'inreview'),
    done: tasks.filter(t => t.status === 'done'),
  };

  const statusGroups = [
    { key: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-600' },
    { key: 'inprogress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    { key: 'inreview', label: 'In Review', color: 'bg-purple-100 text-purple-700' },
    { key: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <CheckSquare size={24} className="text-[#3399B7]" /> Tasks
          </h1>
          <p className="text-muted mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-outline flex items-center gap-1.5 ${showFilters ? 'bg-[#3399B7] text-white border-[#3399B7]' : ''}`}
          >
            <Filter size={15} /> Filters
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 animate-slide-in">
          <TaskFilters filters={filters} onFiltersChange={setFilters} projects={projects} />
        </div>
      )}

      {/* View switcher */}
      <div className="flex items-center gap-2">
        {[
          { mode: 'list', icon: List, label: 'List' },
          { mode: 'board', icon: LayoutGrid, label: 'Board' },
        ].map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`tab-btn flex items-center gap-1.5 ${viewMode === mode ? 'active' : ''}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Create your first task or adjust your filters"
          action={{ label: 'New Task', onClick: openCreate }}
        />
      ) : viewMode === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusGroups.map(({ key, label, color }) => (
            <div key={key} className="kanban-column">
              <div className="flex items-center justify-between mb-3">
                <span className={`badge ${color}`}>{label}</span>
                <span className="text-xs text-gray-400 font-medium">{groupedTasks[key].length}</span>
              </div>
              <div className="space-y-2">
                {groupedTasks[key].map(task => (
                  <TaskCard key={task._id} task={task} onClick={() => openEdit(task)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {statusGroups.filter(s => groupedTasks[s.key].length > 0).map(({ key, label, color }) => (
            <div key={key} className="card overflow-hidden">
              <div className={`px-4 py-2.5 flex items-center gap-2 border-b border-gray-100 bg-gray-50`}>
                <span className={`badge ${color}`}>{label}</span>
                <span className="text-xs text-gray-400">{groupedTasks[key].length} task{groupedTasks[key].length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {groupedTasks[key].map(task => {
                  const overdue = isOverdue(task.dueDate) && task.status !== 'done';
                  return (
                    <div
                      key={task._id}
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#485257] group-hover:text-[#3399B7] transition-colors truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {task.project?.name && (
                            <span className="text-xs text-gray-400">{task.project.name}</span>
                          )}
                          {task.labels?.slice(0, 2).map(l => (
                            <span key={l} className="text-[10px] px-1.5 py-0.5 bg-[#F0FAFD] text-[#3399B7] rounded border border-[#A8D7E8]">{l}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        {task.assignee && <Avatar name={task.assignee?.name} size="xs" title={task.assignee?.name} />}
                        {task.dueDate && (
                          <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); openEdit(task); }}
                          className="text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100 text-xs font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTask(null); }}
        title={editingTask ? 'Edit Task' : 'New Task'}
        size="lg"
      >
        <TaskForm
          initialData={editingTask}
          projects={projects}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={() => { setShowModal(false); setEditingTask(null); }}
        />
      </Modal>
    </div>
  );
};

export default TasksPage;
