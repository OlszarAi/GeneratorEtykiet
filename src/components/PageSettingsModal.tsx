import React from 'react';
import type { PageSettings } from '../types';

interface PageSettingsModalProps {
  settings: PageSettings;
  onUpdate: (settings: PageSettings) => void;
  onClose: () => void;
}

export function PageSettingsModal({ settings, onUpdate, onClose }: PageSettingsModalProps) {
  const handleChange = (field: keyof PageSettings, value: string) => {
    if (field === 'unit') {
      onUpdate({ ...settings, unit: value as 'mm' | 'cm' });
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onUpdate({ ...settings, [field]: numValue });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Page Settings</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
              <select
                value={settings.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="mm">Millimeters (mm)</option>
                <option value="cm">Centimeters (cm)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Page Width ({settings.unit})</label>
              <input
                type="number"
                value={settings.width}
                onChange={(e) => handleChange('width', e.target.value)}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Page Height ({settings.unit})</label>
              <input
                type="number"
                value={settings.height}
                onChange={(e) => handleChange('height', e.target.value)}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Top Margin ({settings.unit})</label>
              <input
                type="number"
                value={settings.marginTop}
                onChange={(e) => handleChange('marginTop', e.target.value)}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Right Margin ({settings.unit})</label>
              <input
                type="number"
                value={settings.marginRight}
                onChange={(e) => handleChange('marginRight', e.target.value)}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bottom Margin ({settings.unit})</label>
              <input
                type="number"
                value={settings.marginBottom}
                onChange={(e) => handleChange('marginBottom', e.target.value)}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Left Margin ({settings.unit})</label>
              <input
                type="number"
                value={settings.marginLeft}
                onChange={(e) => handleChange('marginLeft', e.target.value)}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Label Spacing ({settings.unit})</label>
            <input
              type="number"
              value={settings.spacing}
              onChange={(e) => handleChange('spacing', e.target.value)}
              min="0"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}