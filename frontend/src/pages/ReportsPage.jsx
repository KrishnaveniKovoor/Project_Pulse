import { useState, useEffect } from 'react';
import { PieChart, BarChart3, TrendingUp, CheckSquare, FolderKanban, AlertCircle, Users, Download } from 'lucide-react';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { teamService } from '../services/teamService';
import { reportService } from '../services/reportService';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProgressBar from '../components/common/ProgressBar';
import { getStatusColor, getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

const MetricCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card p-5">
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#485257]">{value}</p>
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

const SimpleBar = ({ label, value, max, color }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm text-gray-600 w-28 flex-shrink-0 truncate">{label}</span>
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: max > 0 ? `${Math.min((value / max) * 100, 100)}%` : '0%' }}
      />
    </div>
    <span className="text-sm font-medium text-gray-700 w-6 text-right">{value}</span>
  </div>
);

const ReportsPage = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [projRes, taskRes, teamRes] = await Promise.allSettled([
          projectService.getProjects({ limit: 1000 }),
          taskService.getTasks({ limit: 1000 }),
          teamService.getTeams(),
        ]);
        if (projRes.status === 'fulfilled') setProjects(projRes.value.data.data || []);
        if (taskRes.status === 'fulfilled') setTasks(taskRes.value.data.data || []);
        if (teamRes.status === 'fulfilled') setTeams(teamRes.value.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredTasks = selectedProject
    ? tasks.filter(t => t.project?._id === selectedProject || t.project === selectedProject)
    : tasks;

  // Task stats
  const todoCount = filteredTasks.filter(t => t.status === 'todo').length;
  const inProgressCount = filteredTasks.filter(t => t.status === 'inprogress').length;
  const inReviewCount = filteredTasks.filter(t => t.status === 'inreview').length;
  const doneCount = filteredTasks.filter(t => t.status === 'done').length;
  const overdueCount = filteredTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
  const totalTasks = filteredTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  // Project stats
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  // Priority distribution
  const priorityCounts = {
    low: filteredTasks.filter(t => t.priority === 'low').length,
    medium: filteredTasks.filter(t => t.priority === 'medium').length,
    high: filteredTasks.filter(t => t.priority === 'high').length,
    critical: filteredTasks.filter(t => t.priority === 'critical').length,
  };

  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...projects.map(p => ({ value: p._id, label: p.name })),
  ];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'tasks', label: 'Task Analytics' },
    { key: 'projects', label: 'Project Status' },
  ];

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BarChart3 size={24} className="text-[#3399B7]" /> Reports & Analytics
          </h1>
          <p className="text-muted mt-1">Insights into your team's performance</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-48">
            <Select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} options={projectOptions} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`tab-btn px-5 py-1.5 rounded-lg ${activeTab === t.key ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={FolderKanban} label="Total Projects" value={projects.length} sub={`${activeProjects} active`} color="bg-[#3399B7]" />
            <MetricCard icon={CheckSquare} label="Total Tasks" value={totalTasks} sub={`${completionRate}% complete`} color="bg-emerald-500" />
            <MetricCard icon={AlertCircle} label="Overdue Tasks" value={overdueCount} sub="Need attention" color="bg-red-500" />
            <MetricCard icon={Users} label="Teams" value={teams.length} sub="Active teams" color="bg-purple-500" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status */}
            <div className="card p-5">
              <h3 className="section-title mb-4">Task Status Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'To Do', value: todoCount, color: 'bg-gray-400' },
                  { label: 'In Progress', value: inProgressCount, color: 'bg-blue-500' },
                  { label: 'In Review', value: inReviewCount, color: 'bg-purple-500' },
                  { label: 'Done', value: doneCount, color: 'bg-emerald-500' },
                ].map(item => (
                  <SimpleBar key={item.label} {...item} max={totalTasks} />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Completion</span>
                  <span className="text-sm font-bold text-[#3399B7]">{completionRate}%</span>
                </div>
                <ProgressBar value={completionRate} max={100} className="h-2 mt-2" />
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="card p-5">
              <h3 className="section-title mb-4">Task Priority Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Critical', value: priorityCounts.critical, color: 'bg-red-500' },
                  { label: 'High', value: priorityCounts.high, color: 'bg-orange-500' },
                  { label: 'Medium', value: priorityCounts.medium, color: 'bg-yellow-500' },
                  { label: 'Low', value: priorityCounts.low, color: 'bg-green-500' },
                ].map(item => (
                  <SimpleBar key={item.label} {...item} max={Math.max(...Object.values(priorityCounts), 1)} />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                {[
                  { label: 'Critical', val: priorityCounts.critical, cls: 'bg-red-100 text-red-700' },
                  { label: 'High', val: priorityCounts.high, cls: 'bg-orange-100 text-orange-700' },
                  { label: 'Medium', val: priorityCounts.medium, cls: 'bg-yellow-100 text-yellow-700' },
                  { label: 'Low', val: priorityCounts.low, cls: 'bg-green-100 text-green-700' },
                ].map(({ label, val, cls }) => (
                  <div key={label} className={`rounded-lg p-2.5 text-center ${cls}`}>
                    <p className="text-lg font-bold">{val}</p>
                    <p className="text-xs font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'To Do', value: todoCount, color: 'bg-gray-100 text-gray-700', border: 'border-gray-300' },
              { label: 'In Progress', value: inProgressCount, color: 'bg-blue-50 text-blue-700', border: 'border-blue-300' },
              { label: 'In Review', value: inReviewCount, color: 'bg-purple-50 text-purple-700', border: 'border-purple-300' },
              { label: 'Completed', value: doneCount, color: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-300' },
            ].map(({ label, value, color, border }) => (
              <div key={label} className={`card p-5 border-l-4 ${border}`}>
                <p className="text-2xl font-bold text-[#485257]">{value}</p>
                <p className={`text-sm font-medium mt-1 ${color.split(' ')[1]}`}>{label}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {totalTasks > 0 ? `${Math.round((value / totalTasks) * 100)}%` : '0%'} of total
                </p>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-4">Task Completion Rate</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9155" fill="none"
                    stroke="#3399B7" strokeWidth="3"
                    strokeDasharray={`${completionRate} ${100 - completionRate}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-[#485257]">{completionRate}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong className="text-[#485257]">{doneCount}</strong> of <strong>{totalTasks}</strong> tasks completed
                </p>
                {overdueCount > 0 && (
                  <p className="text-sm text-red-500 font-medium">⚠️ {overdueCount} overdue task{overdueCount !== 1 ? 's' : ''}</p>
                )}
                <p className="text-xs text-gray-400">Across {selectedProject ? '1 project' : `${projects.length} projects`}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Planning', count: projects.filter(p => p.status === 'planning').length, cls: 'bg-gray-100 text-gray-700' },
              { label: 'Active', count: activeProjects, cls: 'bg-[#A8D7E8] text-[#2980a0]' },
              { label: 'On Hold', count: projects.filter(p => p.status === 'on_hold').length, cls: 'bg-yellow-100 text-yellow-700' },
              { label: 'Completed', count: completedProjects, cls: 'bg-green-100 text-green-700' },
            ].map(({ label, count, cls }) => (
              <div key={label} className="card p-5 text-center">
                <p className="text-2xl font-bold text-[#485257]">{count}</p>
                <span className={`badge ${cls} mt-2`}>{label}</span>
              </div>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="section-title">Project Progress</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {projects.map(project => (
                <div key={project._id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-[#485257]">{project.name}</p>
                      <span className={`badge ${getStatusColor(project.status)} mt-0.5`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#3399B7]">{project.progress || 0}%</span>
                  </div>
                  <ProgressBar value={project.progress || 0} max={100} className="h-2" />
                </div>
              ))}
              {projects.length === 0 && (
                <div className="py-10 text-center text-muted">No projects found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
