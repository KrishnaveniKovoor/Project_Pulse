import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[#3399B7] text-white hover:bg-[#2980a0] focus:ring-[#3399B7]',
  secondary: 'bg-[#485257] text-white hover:bg-[#3a4245] focus:ring-[#485257]',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  outline: 'border border-[#3399B7] text-[#3399B7] hover:bg-[#3399B7] hover:text-white focus:ring-[#3399B7]',
  ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
  light: 'bg-[#A8D7E8] text-[#485257] hover:bg-[#8fc8dc] focus:ring-[#A8D7E8]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
  icon: Icon,
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
