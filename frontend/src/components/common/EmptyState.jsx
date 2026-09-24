import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'Nothing here yet', description = '', action }) => {
  const actionButton = action && typeof action === 'object' && 'label' in action && typeof action.onClick === 'function'
    ? (
      <button type="button" onClick={action.onClick} className="btn-primary">
        {action.label}
      </button>
    )
    : action;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-[#F0FAFD] border border-[#A8D7E8] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[#3399B7]" />
      </div>
      <h3 className="text-base font-semibold text-[#485257] mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 mb-4 max-w-xs">{description}</p>}
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
