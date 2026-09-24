import { Outlet } from 'react-router-dom';
import { Target } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#F0FAFD] flex flex-col items-center justify-center px-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-[#3399B7] rounded-xl flex items-center justify-center mb-3 shadow-lg">
          <Target size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#485257] tracking-tight">ProjectPulse</h1>
        <p className="text-sm text-gray-400 mt-1">Agile Project & Team Collaboration</p>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
      <p className="mt-8 text-xs text-gray-400">© 2024 ProjectPulse. All rights reserved.</p>
    </div>
  );
};

export default AuthLayout;
