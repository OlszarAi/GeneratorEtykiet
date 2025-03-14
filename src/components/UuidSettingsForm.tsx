import React from 'react';
import { QrCode } from 'lucide-react';

interface UuidSettingsFormProps {
  prefix: string;
  uuidLength: number;
  quantity: number;
  previewShortUuid: string;
  onUpdatePrefix: (prefix: string) => void;
  onUpdateUuidLength: (length: number) => void;
  onUpdateQuantity: (quantity: number) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export function UuidSettingsForm({
  prefix,
  uuidLength,
  quantity,
  previewShortUuid,
  onUpdatePrefix,
  onUpdateUuidLength,
  onUpdateQuantity,
  onBack,
  onGenerate
}: UuidSettingsFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <QrCode className="w-6 h-6" />
        4. UUID Settings
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">UUID Prefix</label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => onUpdatePrefix(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter prefix (optional)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">UUID Length</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={uuidLength}
              onChange={(e) => onUpdateUuidLength(Number(e.target.value))}
              min="1"
              max="32"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Preview: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{previewShortUuid}</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of Labels</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => onUpdateQuantity(Number(e.target.value))}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onGenerate}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Generate Labels
        </button>
      </div>
    </div>
  );
}