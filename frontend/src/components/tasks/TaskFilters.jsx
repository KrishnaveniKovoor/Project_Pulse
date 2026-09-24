import Select from '../common/Select';
import SearchInput from '../common/SearchInput';
import Button from '../common/Button';
import { X } from 'lucide-react';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'inreview', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const TaskFilters = ({ filters, onChange, members = [], sprints = [], onClear }) => {
  const hasFilters = filters.status || filters.priority || filters.assignee || filters.sprint || filters.search;

  const memberOptions = [
    { value: '', label: 'All Members' },
    ...members.map((m) => ({ value: m._id, label: m.name })),
  ];

  const sprintOptions = [
    { value: '', label: 'All Sprints' },
    ...sprints.map((s) => ({ value: s._id, label: s.name })),
  ];

  return (
    <div className="flex flex-wrap items-end gap-3">
      <SearchInput
        value={filters.search || ''}
        onChange={(e) => onChange('search', e.target.value)}
        placeholder="Search tasks..."
        className="w-52"
      />
      <Select
        options={statusOptions}
        value={filters.status || ''}
        onChange={(e) => onChange('status', e.target.value)}
        className="w-40"
      />
      <Select
        options={priorityOptions}
        value={filters.priority || ''}
        onChange={(e) => onChange('priority', e.target.value)}
        className="w-40"
      />
      {members.length > 0 && (
        <Select
          options={memberOptions}
          value={filters.assignee || ''}
          onChange={(e) => onChange('assignee', e.target.value)}
          className="w-44"
        />
      )}
      {sprints.length > 0 && (
        <Select
          options={sprintOptions}
          value={filters.sprint || ''}
          onChange={(e) => onChange('sprint', e.target.value)}
          className="w-44"
        />
      )}
      {hasFilters && (
        <Button variant="ghost" size="sm" icon={X} onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  );
};

export default TaskFilters;
