import { CalendarDays, Target, Zap } from 'lucide-react';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import Button from '../common/Button';
import { formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers';

const SprintCard = ({ sprint, onStart, onComplete, onEdit, onClick }) => {
  const totalPoints = (sprint.tasks || []).reduce((s, t) => s + (t.storyPoints || 0), 0);
  const donePoints = (sprint.tasks || [])
    .filter((t) => t.status === 'done')
    .reduce((s, t) => s + (t.storyPoints || 0), 0);
  const progress = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(sprint)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={15} className="text-[#3399B7]" />
            <h3 className="font-semibold text-[#485257]">{sprint.name}</h3>
          </div>
          {sprint.goal && <p className="text-xs text-gray-500 line-clamp-1">{sprint.goal}</p>}
        </div>
        <Badge className={getStatusColor(sprint.status)}>{getStatusLabel(sprint.status)}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-[#485257]">{(sprint.tasks || []).length}</p>
          <p className="text-xs text-gray-400">Tasks</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#485257]">{totalPoints}</p>
          <p className="text-xs text-gray-400">Points</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#3399B7]">{donePoints}</p>
          <p className="text-xs text-gray-400">Done</p>
        </div>
      </div>

      <ProgressBar value={progress} showLabel size="sm" className="mb-4" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <CalendarDays size={12} />
          <span>{formatDate(sprint.startDate)} — {formatDate(sprint.endDate)}</span>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {sprint.status === 'planned' && (
            <Button size="sm" variant="outline" onClick={() => onStart?.(sprint._id)}>Start</Button>
          )}
          {sprint.status === 'active' && (
            <Button size="sm" variant="light" onClick={() => onComplete?.(sprint._id)}>Complete</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SprintCard;
