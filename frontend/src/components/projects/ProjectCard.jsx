import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Users, MoreVertical, Edit, Trash2, Archive } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import ProgressBar from '../common/ProgressBar';
import Dropdown from '../common/Dropdown';
import { formatDate, getStatusColor, getStatusLabel, getPriorityColor } from '../../utils/helpers';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Edit', icon: Edit, onClick: (e) => { onEdit?.(project); } },
    { label: 'Delete', icon: Trash2, onClick: () => onDelete?.(project), danger: true },
  ];

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      {/* Top accent bar */}
      <div className="h-1 rounded-t-xl bg-[#3399B7]" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#485257] text-base truncate group-hover:text-[#3399B7] transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{project.description || 'No description'}</p>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={
                <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical size={15} />
                </button>
              }
              items={menuItems}
              align="right"
            />
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="primary" className={getStatusColor(project.status)}>
            {getStatusLabel(project.status)}
          </Badge>
          {project.priority && (
            <Badge className={getPriorityColor(project.priority)}>
              {project.priority}
            </Badge>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <ProgressBar value={project.progress || 0} showLabel size="sm" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Members */}
          <div className="flex -space-x-2">
            {(project.members || []).slice(0, 4).map((member, i) => (
              <Avatar
                key={member._id || i}
                name={member.name || member}
                size="xs"
                className="border-2 border-white"
                title={member.name || ''}
              />
            ))}
            {(project.members || []).length > 4 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                <span className="text-[9px] text-gray-500 font-medium">+{project.members.length - 4}</span>
              </div>
            )}
          </div>

          {/* Due date */}
          {project.endDate && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <CalendarDays size={12} />
              <span>{formatDate(project.endDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
