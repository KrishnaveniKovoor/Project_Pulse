import React, { useState, useEffect, useMemo } from 'react';
import { BarChart2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Select from '../components/common/Select';
import EmptyState from '../components/common/EmptyState';
import { getStatusColor } from '../utils/helpers';
import dayjs from 'dayjs';

const WorkloadPage = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, tasksData, projectsData] = await Promise.all([
          userService.getUsers({ limit: 1000 }),
          taskService.getTasks({ limit: 1000 }),
          projectService.getProjects({ limit: 1000 })
        ]);
        
        setUsers(usersData.data?.data || usersData.data || []);
        setTasks(tasksData.data?.data || tasksData.data || []);
        setProjects(projectsData.data?.data || projectsData.data || []);
      } catch (error) {
        toast.error('Failed to load workload data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const projectOptions = useMemo(() => {
    return [
      { value: '', label: 'All Projects' },
      ...projects.map(p => ({ value: p._id || p.id, label: p.name }))
    ];
  }, [projects]);

  const workloadData = useMemo(() => {
    let filteredTasks = tasks;
    if (selectedProjectId) {
      filteredTasks = tasks.filter(t => (t.projectId || t.project) === selectedProjectId);
    }

    const today = dayjs();

    return users.map(user => {
      const userId = user._id || user.id;
      const userTasks = filteredTasks.filter(t => 
        t.assignees?.some(a => (a._id || a.id || a) === userId) ||
        (t.assignee && (t.assignee._id || t.assignee.id || t.assignee) === userId)
      );

      const stats = {
        todo: 0,
        inprogress: 0,
        inreview: 0,
        done: 0,
        overdue: 0,
        total: userTasks.length
      };

      userTasks.forEach(task => {
        const status = task.status?.toLowerCase().replace('-', '') || 'todo';
        if (stats[status] !== undefined) {
          stats[status]++;
        } else {
          stats.todo++; // fallback
        }

        if (task.dueDate && task.status !== 'done' && task.status !== 'Done' && dayjs(task.dueDate).isBefore(today, 'day')) {
          stats.overdue++;
        }
      });

      return {
        user,
        stats
      };
    }).sort((a, b) => b.stats.total - a.stats.total);
  }, [users, tasks, selectedProjectId]);

  const summaryStats = useMemo(() => {
    const totalMembers = users.length;
    let totalTasks = 0;
    
    workloadData.forEach(d => {
      totalTasks += d.stats.total;
    });

    const avgTasks = totalMembers ? (totalTasks / totalMembers).toFixed(1) : 0;

    return { totalMembers, totalTasks, avgTasks };
  }, [workloadData, users.length]);

  if (loading) {
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
            <BarChart2 className="text-[#3399B7]" size={28} />
            Team Workload
          </h1>
          <p className="text-muted mt-1">Overview of task distribution across the team</p>
        </div>
        <div className="w-full sm:w-64">
          <Select
            options={projectOptions}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex flex-col gap-2">
          <span className="text-muted text-sm font-medium">Team Members</span>
          <span className="text-2xl font-bold">{summaryStats.totalMembers}</span>
        </div>
        <div className="card p-4 flex flex-col gap-2">
          <span className="text-muted text-sm font-medium">Total Assigned Tasks</span>
          <span className="text-2xl font-bold">{summaryStats.totalTasks}</span>
        </div>
        <div className="card p-4 flex flex-col gap-2">
          <span className="text-muted text-sm font-medium">Average Tasks / Person</span>
          <span className="text-2xl font-bold">{summaryStats.avgTasks}</span>
        </div>
      </div>

      {workloadData.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No workload data"
          message="There are no users or tasks to display workload for."
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {workloadData.map(({ user, stats }) => (
            <div key={user._id || user.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar user={user} size="lg" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name || 'Unknown User'}</h3>
                    <p className="text-sm text-muted">{user.role || 'Member'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-gray-800">{stats.total} Tasks</span>
                  {stats.overdue > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md mt-1">
                      <AlertCircle size={12} />
                      {stats.overdue} Overdue
                    </span>
                  )}
                </div>
              </div>

              {/* Status breakdown bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted mb-2">
                  <span>Task Distribution</span>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-200"></div> To Do ({stats.todo})</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> In Progress ({stats.inprogress})</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Review ({stats.inreview})</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Done ({stats.done})</span>
                  </div>
                </div>
                
                {stats.total > 0 ? (
                  <div className="h-3 w-full bg-gray-100 rounded-full flex overflow-hidden">
                    <div style={{ width: `${(stats.todo / stats.total) * 100}%` }} className="bg-gray-300 h-full" title={`To Do: ${stats.todo}`}></div>
                    <div style={{ width: `${(stats.inprogress / stats.total) * 100}%` }} className="bg-blue-400 h-full" title={`In Progress: ${stats.inprogress}`}></div>
                    <div style={{ width: `${(stats.inreview / stats.total) * 100}%` }} className="bg-yellow-400 h-full" title={`In Review: ${stats.inreview}`}></div>
                    <div style={{ width: `${(stats.done / stats.total) * 100}%` }} className="bg-green-500 h-full" title={`Done: ${stats.done}`}></div>
                  </div>
                ) : (
                  <div className="h-3 w-full bg-gray-100 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkloadPage;
