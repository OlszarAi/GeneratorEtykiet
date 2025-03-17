import React from 'react';
import { Palette } from 'lucide-react';

interface ElementColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ElementColorPicker({ color, onChange, label }: ElementColorPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
        <Palette className="w-4 h-4" />
        {label || 'Color'}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}