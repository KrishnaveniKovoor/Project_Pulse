import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
        <AlertCircle size={22} className="text-red-500" />
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">Error</p>
      <p className="text-sm text-gray-400 mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#3399B7] border border-[#3399B7] rounded-lg hover:bg-[#3399B7] hover:text-white transition-all"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
