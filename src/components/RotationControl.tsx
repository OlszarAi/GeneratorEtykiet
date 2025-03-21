import React from 'react';
import { RotateCw } from 'lucide-react';

interface RotationControlProps {
  rotation: number;
  onChange: (rotation: number) => void;
}

export function RotationControl({ rotation, onChange }: RotationControlProps) {
  const handleRotate = () => {
    onChange((rotation + 90) % 360);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRotate}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title="Rotate 90° clockwise"
      >
        <RotateCw className="w-4 h-4" />
        <span className="text-sm">{rotation}°</span>
      </button>
    </div>
  );
}