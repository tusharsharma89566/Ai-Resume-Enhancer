
import React from 'react';

interface LoadingSpinnerProps {
    message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="absolute inset-0 bg-slate-200 bg-opacity-60 flex flex-col items-center justify-center z-50 rounded-lg">
      <div className="w-12 h-12 border-4 border-slate-400 border-t-slate-700 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-700 font-semibold">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
