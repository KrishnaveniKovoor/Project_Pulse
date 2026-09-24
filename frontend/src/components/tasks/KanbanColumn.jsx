import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

const SortableTaskCard = ({ task, onTaskClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onTaskClick} />
    </div>
  );
};

const KanbanColumn = ({ column, tasks = [], onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      className={`flex-shrink-0 w-64 flex flex-col rounded-xl transition-colors duration-150 ${
        isOver ? 'bg-[#A8D7E8]/20 ring-2 ring-[#3399B7]/30' : 'bg-gray-50'
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            {column.label}
          </span>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div ref={setNodeRef} className="flex-1 px-2 pb-3 space-y-2 min-h-[120px]">
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} onTaskClick={onTaskClick} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-xs text-gray-300">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
