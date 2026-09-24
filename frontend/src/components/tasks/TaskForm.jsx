import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/taskService';

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'inreview', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

const TaskForm = ({ task, initialData = {}, onSubmit, onSuccess, onCancel, loading: externalLoading, projectId, projects = [], members = [], sprints = [] }) => {
  const { user } = useAuth();
  const data = task || initialData;
  const [form, setForm] = useState({
    title: data.title || '',
    description: data.description || '',
    priority: data.priority || 'medium',
    status: data.status || 'todo',
    assignee: data.assignee?._id || data.assignee || '',
    sprint: data.sprint?._id || data.sprint || '',
    project: projectId || data.project?._id || data.project || '',
    dueDate: data.dueDate || '',
    storyPoints: data.storyPoints || 0,
    labels: Array.isArray(data.labels) ? data.labels.join(', ') : (data.labels || ''),
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({ value: m._id || m.id || m, label: m.name || m })),
  ];

  const sprintOptions = [
    { value: '', label: 'No Sprint' },
    ...sprints.map((s) => ({ value: s._id || s.id, label: s.name })),
  ];

  const projectOptions = projects.map((p) => ({ value: p._id || p.id, label: p.name }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task title is required';
    if (!form.project && !projectId) errs.project = 'Project is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      project: projectId || form.project,
      reporter: user?._id || user?.id,
      storyPoints: Number(form.storyPoints) || 0,
      labels: typeof form.labels === 'string' ? form.labels.split(',').map((l) => l.trim()).filter(Boolean) : form.labels,
    };
    if (!payload.sprint) delete payload.sprint;
    if (!payload.assignee) delete payload.assignee;

    if (onSubmit) {
      onSubmit(payload);
      return;
    }

    if (onSuccess) {
      setSubmitting(true);
      try {
        let res;
        if (data._id) {
          res = await taskService.updateTask(data._id, payload);
        } else {
          res = await taskService.createTask(payload);
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
      <Input
        label="Task Title"
        required
        placeholder="e.g. Implement login page"
        value={form.title}
        onChange={set('title')}
        error={errors.title}
      />

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
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={3}
          placeholder="Task description..."
          className="form-input resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Priority" options={priorityOptions} value={form.priority} onChange={set('priority')} />
        <Select label="Status" options={statusOptions} value={form.status} onChange={set('status')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Assignee" options={memberOptions} value={form.assignee} onChange={set('assignee')} />
        <Select label="Sprint" options={sprintOptions} value={form.sprint} onChange={set('sprint')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Due Date" type="date" value={form.dueDate?.slice(0, 10) || ''} onChange={set('dueDate')} />
        <Input label="Story Points" type="number" min="0" max="100" value={form.storyPoints} onChange={set('storyPoints')} />
      </div>
      <Input label="Labels" placeholder="bug, feature, ui (comma separated)" value={form.labels} onChange={set('labels')} />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isLoading}>
          {isEdit ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
