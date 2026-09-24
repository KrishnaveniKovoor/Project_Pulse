import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { userService } from '../../services/userService';

const TeamForm = ({ initialData = {}, onSubmit, onCancel, loading }) => {
  const data = initialData || {};
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#3399B7',
    ...data,
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Team name is required';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Team Name" required placeholder="e.g. Frontend Team" value={form.name} onChange={set('name')} error={errors.name} />
      <div>
        <label className="form-label">Description</label>
        <textarea value={form.description} onChange={set('description')} rows={2} placeholder="What does this team work on?" className="form-input resize-none" />
      </div>
      <div>
        <label className="form-label">Team Color</label>
        <div className="flex items-center gap-3">
          <input type="color" value={form.color} onChange={set('color')} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
          <span className="text-sm text-gray-500">{form.color}</span>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {initialData._id ? 'Update Team' : 'Create Team'}
        </Button>
      </div>
    </form>
  );
};

export default TeamForm;
