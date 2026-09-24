import { getInitials } from '../../utils/helpers';

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
};

const Avatar = ({ name, src, size = 'md', className = '', title }) => {
  const sizeClass = sizes[size] || sizes.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        title={title || name}
        className={`rounded-full object-cover flex-shrink-0 ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      title={title || name}
      className={`
        rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0
        bg-[#3399B7] ${sizeClass} ${className}
      `}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
