import { Users, FolderKanban, MoreVertical, Edit, Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import Dropdown from '../common/Dropdown';

const TeamCard = ({ team, onClick, onEdit, onDelete }) => {
  const menuItems = [
    { label: 'Edit', icon: Edit, onClick: () => onEdit?.(team) },
    { label: 'Delete', icon: Trash2, onClick: () => onDelete?.(team), danger: true },
  ];

  return (
    <div
      onClick={() => onClick?.(team)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: team.color || '#3399B7' }}
          >
            {team.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-[#485257] group-hover:text-[#3399B7] transition-colors">{team.name}</h3>
            {team.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{team.description}</p>
            )}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                <MoreVertical size={15} />
              </button>
            }
            items={menuItems}
            align="right"
          />
        </div>
      </div>

      {/* Team lead */}
      {team.lead && (
        <div className="flex items-center gap-2 mb-3">
          <Avatar name={team.lead?.name} size="xs" />
          <div>
            <p className="text-xs text-gray-500">Team Lead</p>
            <p className="text-xs font-medium text-[#485257]">{team.lead?.name}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users size={13} className="text-[#3399B7]" />
          <span><strong className="text-[#485257]">{team.members?.length || 0}</strong> members</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FolderKanban size={13} className="text-[#3399B7]" />
          <span><strong className="text-[#485257]">{team.projects?.length || 0}</strong> projects</span>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
