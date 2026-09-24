const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  required = false,
  ...rest
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={16} className="text-gray-400" />
          </div>
        )}
        <input
          className={`
            w-full px-3 py-2 border rounded-lg text-sm text-gray-700 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#3399B7] focus:border-transparent
            transition-all duration-150 bg-white
            ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}
            ${Icon ? 'pl-9' : ''}
          `}
          {...rest}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-400">{helperText}</p>}
    </div>
  );
};

export default Input;
