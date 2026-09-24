import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit2, Trash2, MessageSquare, Calendar, User, Tag, CheckSquare, Clock, Hash, Send } from 'lucide-react';
import { taskService } from '../services/taskService';
import { commentService } from '../services/commentService';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Select from '../components/common/Select';
import { formatDate, formatRelativeTime, getStatusColor, getStatusLabel, getPriorityColor } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [taskRes, commentsRes] = await Promise.all([
        taskService.getTask(id),
        commentService.getComments({ task: id }),
      ]);
      setTask(taskRes.data?.data || taskRes.data || taskRes);
      setComments(commentsRes.data?.data || commentsRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load task details.');
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await taskService.updateTask(id, { status: newStatus });
      setTask((prev) => ({ ...prev, status: newStatus }));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted');
      navigate('/tasks');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    setTask(updatedTask);
    setIsEditModalOpen(false);
    toast.success('Task updated');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await commentService.createComment({
        task: id,
        text: newComment,
        content: newComment,
      });
      setComments([...comments, res.data?.data || res.data || res]);
      setNewComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-danger mb-4">{error || 'Task not found'}</h2>
        <Button variant="outline" onClick={() => navigate('/tasks')}>
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/tasks')} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-muted" />
            <span className="text-muted font-medium">Task {id.slice(-5).toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteConfirmOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h1>
            <div className="prose max-w-none text-gray-700 mb-6">
              {task.description || <span className="text-muted italic">No description provided.</span>}
            </div>
            
            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {task.labels.map((label, idx) => (
                  <Badge key={idx} variant="info" className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="card p-6">
            <h2 className="section-title flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5" />
              Comments ({comments.length})
            </h2>

            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                  <Avatar user={comment.author} size="sm" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.author?.name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.text || comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-muted text-center py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <Avatar user={user} size="sm" />
              <div className="flex-1">
                <textarea
                  className="form-input w-full min-h-[80px] resize-y"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <Button type="submit" disabled={!newComment.trim() || submittingComment} className="btn-primary">
                    <Send className="w-4 h-4 mr-2" />
                    Comment
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Status</label>
                <select
                  className="form-input w-full"
                  value={task.status}
                  onChange={handleStatusChange}
                >
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="inreview">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Project</label>
                <div className="font-medium text-gray-900">{task.project?.name || 'No Project'}</div>
              </div>

              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Priority</label>
                <Badge color={getPriorityColor(task.priority)}>{task.priority}</Badge>
              </div>

              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Assignee</label>
                <div className="flex items-center gap-2">
                  {task.assignee ? (
                    <>
                      <Avatar user={task.assignee} size="xs" />
                      <span className="text-sm font-medium">{task.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted italic">Unassigned</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Reporter</label>
                <div className="flex items-center gap-2">
                  {task.reporter ? (
                    <>
                      <Avatar user={task.reporter} size="xs" />
                      <span className="text-sm font-medium">{task.reporter.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted italic">Unknown</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Due Date</label>
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <Calendar className="w-4 h-4 text-muted" />
                  {task.dueDate ? formatDate(task.dueDate) : <span className="text-muted">None</span>}
                </div>
              </div>

              {task.storyPoints && (
                <div>
                  <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Story Points</label>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckSquare className="w-4 h-4 text-muted" />
                    {task.storyPoints}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t mt-4">
                <div className="text-xs text-muted flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" /> Created {formatDate(task.createdAt, 'MMM D, YYYY HH:mm')}
                </div>
                <div className="text-xs text-muted flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Updated {formatRelativeTime(task.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Task">
        <TaskForm task={task} onSuccess={handleTaskUpdated} onCancel={() => setIsEditModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        danger
      />
    </div>
  );
};

export default TaskDetailPage;
