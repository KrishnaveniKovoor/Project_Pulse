import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { issueService } from '../../services/issueService';

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const IssueForm = ({ issue, initialData = {}, onSubmit, onSuccess, onCancel, loading: externalLoading, projectId, projects = [], members = [] }) => {
  const { user } = useAuth();
  const data = issue || initialData;
  const [form, setForm] = useState({
    title: data.title || '',
    description: data.description || '',
    priority: data.priority || 'medium',
    status: data.status || 'open',
    assignee: data.assignee?._id || data.assignee || '',
    project: projectId || data.project?._id || data.project || '',
    labels: Array.isArray(data.labels) ? data.labels.join(', ') : (data.labels || ''),
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({ value: m._id || m.id, label: m.name })),
  ];

  const projectOptions = projects.map((p) => ({ value: p._id || p.id, label: p.name }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Issue title is required';
    if (!form.project && !projectId) errs.project = 'Project is required';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      project: projectId || form.project,
      reporter: user?._id || user?.id,
      labels: typeof form.labels === 'string' ? form.labels.split(',').map((l) => l.trim()).filter(Boolean) : form.labels,
    };

    if (onSubmit) {
      onSubmit(payload);
      return;
    }

    if (onSuccess) {
      setSubmitting(true);
      try {
        let res;
        if (data._id) {
          res = await issueService.updateIssue(data._id, payload);
        } else {
          res = await issueService.createIssue(payload);
        }
        onSuccess(res.data?.data || res.data || res);
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const isEdit = !!data._id;
  const isLoading = externalLoading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Issue Title" required placeholder="e.g. Login page not loading" value={form.title} onChange={set('title')} error={errors.title} />
      
      {projects.length > 0 && !projectId && (
        <Select
          label="Project"
          required
          options={[{ value: '', label: 'Select Project' }, ...projectOptions]}
          value={form.project}
          onChange={set('project')}
          error={errors.project}
        />
      )}

      <div>
        <label className="form-label">Description</label>
        <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Describe the issue..." className="form-input resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Priority" options={priorityOptions} value={form.priority} onChange={set('priority')} />
        <Select label="Status" options={statusOptions} value={form.status} onChange={set('status')} />
      </div>

      {members.length > 0 && (
        <Select label="Assignee" options={memberOptions} value={form.assignee} onChange={set('assignee')} />
      )}

      <Input label="Labels" placeholder="bug, frontend, urgent (comma separated)" value={form.labels} onChange={set('labels')} />
      
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isLoading}>
          {isEdit ? 'Update Issue' : 'Create Issue'}
        </Button>
      </div>
    </form>
  );
};

export default IssueForm;
