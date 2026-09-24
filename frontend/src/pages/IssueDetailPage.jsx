import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Edit2, Trash2, MessageSquare, Calendar, User,
  Tag, AlertCircle, Clock, Hash, Send, CheckCircle2
} from 'lucide-react';
import { issueService } from '../services/issueService';
import { commentService } from '../services/commentService';
import IssueForm from '../components/issues/IssueForm';
import Modal from '../components/common/Modal';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDate, formatRelativeTime, getStatusColor, getPriorityColor } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const IssueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [issue, setIssue] = useState(null);
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
      const [issueRes, commentsRes] = await Promise.all([
        issueService.getIssue(id),
        commentService.getComments({ issue: id }),
      ]);
      setIssue(issueRes.data?.data || issueRes.data || issueRes);
      setComments(commentsRes.data?.data || commentsRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load issue details.');
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await issueService.updateIssue(id, { status: newStatus });
      setIssue((prev) => ({ ...prev, status: newStatus }));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteIssue = async () => {
    try {
      await issueService.deleteIssue(id);
      toast.success('Issue deleted');
      navigate('/issues');
    } catch (err) {
      toast.error('Failed to delete issue');
    }
  };

  const handleIssueUpdated = () => {
    setIsEditModalOpen(false);
    fetchData();
    toast.success('Issue updated');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await commentService.createComment({
        issue: id,
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

  if (error || !issue) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-500 mb-4">{error || 'Issue not found'}</h2>
        <button className="btn-outline" onClick={() => navigate('/issues')}>
          Back to Issues
        </button>
      </div>
    );
  }

  const getStatusDisplay = (status) => {
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
    };
    return labels[status] || status;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            className="btn-ghost p-2"
            onClick={() => navigate('/issues')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-400" />
            <span className="text-muted font-medium">Issue #{id.slice(-5).toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline flex items-center gap-1.5" onClick={() => setIsEditModalOpen(true)}>
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button className="btn-danger flex items-center gap-1.5" onClick={() => setIsDeleteConfirmOpen(true)}>
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start gap-3 mb-4">
              <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
              <Badge className={getStatusColor(issue.status)}>{getStatusDisplay(issue.status)}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{issue.title}</h1>
            <div className="prose max-w-none text-gray-700">
              {issue.description || <span className="text-muted italic">No description provided.</span>}
            </div>
            {issue.labels && issue.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {issue.labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-1.5 py-0.5 bg-[#F0FAFD] text-[#3399B7] rounded border border-[#A8D7E8] flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="card p-6">
            <h2 className="section-title flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-[#3399B7]" />
              Comments ({comments.length})
            </h2>

            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                  <Avatar name={comment.author?.name} size="sm" />
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

            <form onSubmit={handleAddComment} className="flex gap-3">
              <Avatar name={user?.name} size="sm" />
              <div className="flex-1">
                <textarea
                  className="form-input w-full min-h-[80px] resize-y"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    className="btn-primary flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    Comment
                  </button>
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
                  value={issue.status}
                  onChange={handleStatusChange}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Priority</label>
                <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
              </div>

              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Project</label>
                <div className="font-medium text-gray-900">{issue.project?.name || 'No Project'}</div>
              </div>

              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Assignee</label>
                <div className="flex items-center gap-2">
                  {issue.assignee ? (
                    <>
                      <Avatar name={issue.assignee.name} size="xs" />
                      <span className="text-sm font-medium">{issue.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted italic">Unassigned</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Reporter</label>
                <div className="flex items-center gap-2">
                  {issue.reporter ? (
                    <>
                      <Avatar name={issue.reporter.name} size="xs" />
                      <span className="text-sm font-medium">{issue.reporter.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted italic">Unknown</span>
                  )}
                </div>
              </div>

              {issue.dueDate && (
                <div>
                  <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Due Date</label>
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Calendar className="w-4 h-4 text-muted" />
                    {formatDate(issue.dueDate)}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t mt-4">
                <div className="text-xs text-muted flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" /> Created {formatDate(issue.createdAt)}
                </div>
                <div className="text-xs text-muted flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Updated {formatRelativeTime(issue.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Issue">
        <IssueForm
          issue={issue}
          onSuccess={handleIssueUpdated}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteIssue}
        title="Delete Issue"
        message={`Are you sure you want to delete this issue? This action cannot be undone.`}
        confirmText="Delete"
        danger
      />
    </div>
  );
};

export default IssueDetailPage;
