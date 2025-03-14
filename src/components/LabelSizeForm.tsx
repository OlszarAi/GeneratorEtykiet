import React from 'react';
import type { LabelSize } from '../types';

interface LabelSizeFormProps {
  labelSize: LabelSize;
  onUpdateLabelSize: (labelSize: LabelSize) => void;
  onNext: () => void;
}

export function LabelSizeForm({ labelSize, onUpdateLabelSize, onNext }: LabelSizeFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">1. Specify Label Size</h2>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Width</label>
          <input
            type="number"
            value={labelSize.width || 0}
            onChange={(e) => onUpdateLabelSize({ ...labelSize, width: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height</label>
          <input
            type="number"
            value={labelSize.height || 0}
            onChange={(e) => onUpdateLabelSize({ ...labelSize, height: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
          <select
            value={labelSize.unit || 'mm'}
            onChange={(e) => onUpdateLabelSize({ ...labelSize, unit: e.target.value as 'mm' | 'cm' | 'in' })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="in">inches</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Border Padding</label>
          <input
            type="number"
            value={labelSize.padding || 0}
            onChange={(e) => onUpdateLabelSize({ ...labelSize, padding: Number(e.target.value) })}
            min={0}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enableBorder"
            checked={labelSize.border.enabled || false}
            onChange={(e) => onUpdateLabelSize({
              ...labelSize,
              border: {
                ...labelSize.border,
                enabled: e.target.checked
              }
            })}
            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-600"
          />
          <label htmlFor="enableBorder" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Add border to labels
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="preventCollisions"
            checked={labelSize.preventCollisions || false}
            onChange={(e) => onUpdateLabelSize({
              ...labelSize,
              preventCollisions: e.target.checked
            })}
            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-600"
          />
          <label htmlFor="preventCollisions" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Prevent elements from overlapping
          </label>
        </div>

        {labelSize.border.enabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Border Width ({labelSize.unit})
              </label>
              <input
                type="number"
                value={labelSize.border.width || 0}
                onChange={(e) => onUpdateLabelSize({
                  ...labelSize,
                  border: {
                    ...labelSize.border,
                    width: Number(e.target.value)
                  }
                })}
                min={0.1}
                step={0.1}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Border Color
              </label>
              <input
                type="color"
                value={labelSize.border.color || '#000000'}
                onChange={(e) => onUpdateLabelSize({
                  ...labelSize,
                  border: {
                    ...labelSize.border,
                    color: e.target.value
                  }
                })}
                className="mt-1 block w-full h-9 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Next
      </button>
    </div>
  );
}