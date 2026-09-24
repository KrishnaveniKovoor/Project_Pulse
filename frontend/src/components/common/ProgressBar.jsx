const ProgressBar = ({ value = 0, color = '#3399B7', size = 'md', showLabel = false, className = '' }) => {
  const clamped = Math.min(100, Math.max(0, value));
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span className="font-medium text-[#485257]">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
