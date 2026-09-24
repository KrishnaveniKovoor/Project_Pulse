import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { teamService } from '../../services/teamService';
import { projectService } from '../../services/projectService';

const statusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const ProjectForm = ({ project, initialData = {}, onSubmit, onSuccess, onCancel, loading: externalLoading }) => {
  const data = project || initialData;
  const [form, setForm] = useState({
    name: data.name || '',
    description: data.description || '',
    status: data.status || 'planning',
    priority: data.priority || 'medium',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    team: data.team?._id || data.team || '',
  });
  const [teams, setTeams] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    teamService.getTeams().then((res) => {
      const teamList = res.data.data || [];
      setTeams([
        { value: '', label: 'No Team' },
        ...teamList.map((t) => ({ value: t._id, label: t.name })),
      ]);
    }).catch(() => setTeams([{ value: '', label: 'No Team' }]));
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Project name is required';
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      errs.endDate = 'End date must be after start date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (!form.team) delete form.team;

    if (onSubmit) {
      onSubmit(form);
      return;
    }

    if (onSuccess) {
      setSubmitting(true);
      try {
        let res;
        if (data._id) {
          res = await projectService.updateProject(data._id, form);
        } else {
          res = await projectService.createProject(form);
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
        label="Project Name"
        required
        placeholder="e.g. Website Redesign"
        value={form.name}
        onChange={set('name')}
        error={errors.name}
      />
      <div>
        <label className="form-label">Description</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={3}
          placeholder="Brief description of the project..."
          className="form-input resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Status" options={statusOptions} value={form.status} onChange={set('status')} />
        <Select label="Priority" options={priorityOptions} value={form.priority} onChange={set('priority')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Date" type="date" value={form.startDate?.slice(0, 10) || ''} onChange={set('startDate')} />
        <Input label="End Date" type="date" value={form.endDate?.slice(0, 10) || ''} onChange={set('endDate')} error={errors.endDate} />
      </div>
      <Select label="Team" options={teams} value={form.team} onChange={set('team')} />

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={isLoading}>
          {isEdit ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
