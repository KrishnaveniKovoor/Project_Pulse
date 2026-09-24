import { useNavigate } from 'react-router-dom';
import { CalendarDays, MessageSquare, Paperclip } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import { formatDate, getPriorityColor, getStatusColor, getStatusLabel, isOverdue } from '../../utils/helpers';

const TaskCard = ({ task, onClick }) => {
  const navigate = useNavigate();
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';

  const handleClick = () => {
    if (onClick) onClick(task);
    else navigate(`/tasks/${task._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-100 p-3.5 hover:shadow-sm hover:border-[#A8D7E8] transition-all cursor-pointer group"
    >
      {/* Priority indicator */}
      <div className="flex items-start justify-between mb-2 gap-2">
        <p className="text-sm font-medium text-[#485257] leading-snug group-hover:text-[#3399B7] transition-colors line-clamp-2">
          {task.title}
        </p>
        <Badge className={`${getPriorityColor(task.priority)} flex-shrink-0`}>
          {task.priority}
        </Badge>
      </div>

      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.slice(0, 3).map((label) => (
            <span key={label} className="text-[10px] px-1.5 py-0.5 bg-[#F0FAFD] text-[#3399B7] rounded border border-[#A8D7E8]">
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <Avatar name={task.assignee?.name} size="xs" title={task.assignee?.name} />
          )}
          {task.storyPoints > 0 && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
              {task.storyPoints} pts
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          {task.dueDate && (
            <div className={`flex items-center gap-0.5 text-[10px] ${overdue ? 'text-red-500' : ''}`}>
              <CalendarDays size={11} />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
