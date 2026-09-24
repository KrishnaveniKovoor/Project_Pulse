import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { sprintService } from '../../services/sprintService';

const statusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const SprintForm = ({ sprint, initialData = {}, projectId, projects = [], onSubmit, onSuccess, onCancel, loading: externalLoading }) => {
  const data = sprint || initialData || {};
  const [form, setForm] = useState({
    name: data.name || '',
    goal: data.goal || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    status: data.status || 'planned',
    project: projectId || data.project?._id || data.project || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const projectOptions = projects.map((p) => ({ value: p._id || p.id, label: p.name }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Sprint name is required';
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
          res = await sprintService.updateSprint(data._id, payload);
        } else {
          res = await sprintService.createSprint(payload);
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
      <Input label="Sprint Name" required placeholder="e.g. Sprint 1" value={form.name} onChange={set('name')} error={errors.name} />
      
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
        <label className="form-label">Sprint Goal</label>
        <textarea
          value={form.goal}
          onChange={set('goal')}
          rows={2}
          placeholder="What should this sprint achieve?"
          className="form-input resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Date" type="date" value={form.startDate?.slice(0, 10) || ''} onChange={set('startDate')} />
        <Input label="End Date" type="date" value={form.endDate?.slice(0, 10) || ''} onChange={set('endDate')} />
      </div>
      <Select label="Status" options={statusOptions} value={form.status} onChange={set('status')} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isLoading}>
          {isEdit ? 'Update Sprint' : 'Create Sprint'}
        </Button>
      </div>
    </form>
  );
};

export default SprintForm;
