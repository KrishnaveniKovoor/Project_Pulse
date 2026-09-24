import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', fullScreen = false, text = '' }) => {
  const sizes = { sm: 16, md: 24, lg: 36, xl: 48 };
  const s = sizes[size] || 24;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F0FAFD] z-50">
        <Loader2 size={40} className="animate-spin text-[#3399B7] mb-3" />
        <p className="text-sm text-gray-500">{text || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <Loader2 size={s} className="animate-spin text-[#3399B7]" />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
