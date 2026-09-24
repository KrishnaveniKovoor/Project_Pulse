import { useState, useEffect, useCallback } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay
} from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import Modal from '../common/Modal';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import LoadingSpinner from '../common/LoadingSpinner';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#6b7280' },
  { id: 'inprogress', label: 'In Progress', color: '#3399B7' },
  { id: 'inreview', label: 'In Review', color: '#8b5cf6' },
  { id: 'done', label: 'Done', color: '#10b981' },
];

const KanbanBoard = ({ projectId, tasks: externalTasks, onTaskClick, onTaskUpdate }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [internalTasks, setInternalTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);

  // If projectId is provided, fetch tasks; otherwise use externalTasks prop
  const isManaged = !!projectId;

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const params = { project: projectId };
      const res = await taskService.getTasks(params);
      setInternalTasks(res.data?.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isManaged) {
      fetchTasks();
      projectService.getProjects().then(res => setProjects(res.data?.data || []));
    }
  }, [isManaged, fetchTasks]);

  const localTasks = isManaged ? internalTasks : (externalTasks || []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = localTasks.filter((t) => t.status === col.id);
    return acc;
  }, {});

  const handleDragStart = ({ active }) => {
    const task = localTasks.find((t) => t._id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const draggedTaskId = active.id;
    const newStatus = over.id; // column id

    const task = localTasks.find((t) => t._id === draggedTaskId);
    if (!task || task.status === newStatus || !COLUMNS.find(c => c.id === newStatus)) return;

    // Optimistic update
    if (isManaged) {
      setInternalTasks((prev) =>
        prev.map((t) => (t._id === draggedTaskId ? { ...t, status: newStatus } : t))
      );
    }

    try {
      await taskService.updateTask(draggedTaskId, { status: newStatus });
      onTaskUpdate?.();
    } catch {
      // Revert on error
      if (isManaged) {
        setInternalTasks((prev) =>
          prev.map((t) => (t._id === draggedTaskId ? { ...t, status: task.status } : t))
        );
      }
      toast.error('Failed to update task status');
    }
  };

  const handleTaskCreated = () => {
    setShowModal(false);
    if (isManaged) fetchTasks();
    onTaskUpdate?.();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {isManaged && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={15} /> New Task
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 min-h-[500px]">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={grouped[col.id] || []}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>
      </DndContext>

      {isManaged && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="New Task"
          size="lg"
        >
          <TaskForm
            initialData={{ project: projectId }}
            projects={projects}
            onSubmit={async (data) => {
              try {
                await taskService.createTask({ ...data, project: projectId });
                toast.success('Task created!');
                handleTaskCreated();
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to create task');
              }
            }}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </>
  );
};

export default KanbanBoard;
