import React from 'react';
import { Timer, X } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: number;
  total: number;
  estimatedTimeRemaining?: number;
  isVisible: boolean;
  onCancel?: () => void;
}

export function ProgressIndicator({ 
  progress, 
  total, 
  estimatedTimeRemaining, 
  isVisible,
  onCancel 
}: ProgressIndicatorProps) {
  if (!isVisible) return null;

  const percentage = Math.round((progress / total) * 100);
  
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[300px] animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Generating PDF...
        </span>
        <div className="flex items-center gap-4">
          {estimatedTimeRemaining !== undefined && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Timer className="w-4 h-4 mr-1" />
              {formatTime(estimatedTimeRemaining)}
            </div>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Cancel export"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 text-right text-sm text-gray-500 dark:text-gray-400">
        {progress} of {total} labels
      </div>
    </div>
  );
}