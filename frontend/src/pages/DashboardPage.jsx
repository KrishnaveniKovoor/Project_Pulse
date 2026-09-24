import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, CheckSquare, AlertCircle, Users,
  TrendingUp, Clock, ArrowRight, Plus, Activity,
  Calendar, BarChart3, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { notificationService } from '../services/notificationService';
import { formatRelativeTime, getStatusColor, getStatusLabel, getPriorityColor } from '../utils/helpers';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProgressBar from '../components/common/ProgressBar';

const StatCard = ({ icon: Icon, label, value, sub, color, onClick }) => (
  <div
    onClick={onClick}
    className={`card p-5 flex items-start gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-[#485257]">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, taskRes, notifRes] = await Promise.allSettled([
          projectService.getProjects({ limit: 5 }),
          taskService.getTasks({ assignee: user?._id, limit: 8, sortBy: 'dueDate', status: 'todo,inprogress,inreview' }),
          notificationService.getNotifications({ limit: 6 }),
        ]);
        if (projRes.status === 'fulfilled') setProjects(projRes.value.data.data || []);
        if (taskRes.status === 'fulfilled') setMyTasks(taskRes.value.data.data || []);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const overdueTasks = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
  const completedTasks = myTasks.filter(t => t.status === 'done').length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-muted mt-1">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/projects')} className="btn-outline flex items-center gap-1.5">
            <FolderKanban size={15} /> View Projects
          </button>
          <button onClick={() => navigate('/tasks')} className="btn-primary flex items-center gap-1.5">
            <Plus size={15} /> New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FolderKanban} label="Active Projects" value={activeProjects}
          sub={`${projects.length} total`} color="bg-[#3399B7]"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          icon={CheckSquare} label="My Tasks" value={myTasks.length}
          sub={`${completedTasks} done`} color="bg-emerald-500"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          icon={AlertCircle} label="Overdue" value={overdueTasks}
          sub="Need attention" color="bg-red-500"
          onClick={() => navigate('/tasks?status=overdue')}
        />
        <StatCard
          icon={Activity} label="In Review" value={myTasks.filter(t => t.status === 'inreview').length}
          sub="Pending review" color="bg-purple-500"
          onClick={() => navigate('/tasks?status=inreview')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <CheckSquare size={18} className="text-[#3399B7]" /> My Active Tasks
            </h2>
            <button onClick={() => navigate('/tasks')} className="text-sm text-[#3399B7] hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {myTasks.filter(t => t.status !== 'done').slice(0, 6).length === 0 ? (
              <div className="py-10 text-center">
                <CheckSquare size={36} className="text-gray-200 mx-auto mb-2" />
                <p className="text-muted">No active tasks assigned to you</p>
              </div>
            ) : (
              myTasks.filter(t => t.status !== 'done').slice(0, 6).map(task => (
                <div
                  key={task._id}
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  className="flex items-start justify-between p-3 rounded-lg border border-gray-100 hover:border-[#A8D7E8] hover:bg-[#F0FAFD] cursor-pointer transition-all group"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-medium text-[#485257] truncate group-hover:text-[#3399B7]">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(task.status)}>{getStatusLabel(task.status)}</Badge>
                      {task.project?.name && (
                        <span className="text-[11px] text-gray-400 truncate">{task.project.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    {task.dueDate && (
                      <span className={`text-[11px] flex items-center gap-0.5 ${
                        new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        <Calendar size={11} />
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Recent Projects */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <Zap size={18} className="text-[#3399B7]" /> Projects
              </h2>
              <button onClick={() => navigate('/projects')} className="text-sm text-[#3399B7] hover:underline flex items-center gap-1">
                All <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 4).map(proj => (
                <div
                  key={proj._id}
                  onClick={() => navigate(`/projects/${proj._id}`)}
                  className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-[#485257] truncate flex-1 mr-2">{proj.name}</p>
                    <Badge className={getStatusColor(proj.status)}>{getStatusLabel(proj.status)}</Badge>
                  </div>
                  <ProgressBar value={proj.progress || 0} max={100} className="h-1.5" />
                  <p className="text-[11px] text-gray-400 mt-1">{proj.progress || 0}% complete</p>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-muted text-center py-4">No projects yet</p>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <Clock size={18} className="text-[#3399B7]" /> Recent Activity
              </h2>
            </div>
            <div className="space-y-2.5">
              {notifications.slice(0, 5).map(notif => (
                <div key={notif._id} className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.isRead ? 'bg-gray-300' : 'bg-[#3399B7]'}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-[#485257] leading-snug">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-muted text-center py-4">No notifications</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-[#3399B7]" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'New Project', icon: FolderKanban, path: '/projects', color: 'bg-[#3399B7]/10 text-[#3399B7] hover:bg-[#3399B7]/20' },
            { label: 'Create Task', icon: CheckSquare, path: '/tasks', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
            { label: 'Log Issue', icon: AlertCircle, path: '/issues', color: 'bg-red-50 text-red-500 hover:bg-red-100' },
            { label: 'View Reports', icon: BarChart3, path: '/reports', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
          ].map(({ label, icon: Icon, path, color }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`flex items-center gap-2 p-3 rounded-xl font-medium text-sm transition-colors ${color}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
