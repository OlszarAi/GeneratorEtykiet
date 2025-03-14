import React from 'react';
import { QrCode, Building, Hash, Layers } from 'lucide-react';

interface OtherSettingsFormProps {
  companyName: string;
  prefix: string;
  uuidLength: number;
  quantity: number;
  previewShortUuid: string;
  onUpdateCompanyName: (name: string) => void;
  onUpdatePrefix: (prefix: string) => void;
  onUpdateUuidLength: (length: number) => void;
  onUpdateQuantity: (quantity: number) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export function OtherSettingsForm({
  companyName,
  prefix,
  uuidLength,
  quantity,
  previewShortUuid,
  onUpdateCompanyName,
  onUpdatePrefix,
  onUpdateUuidLength,
  onUpdateQuantity,
  onBack,
  onGenerate
}: OtherSettingsFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
        3. Other Settings
      </h2>

      <div className="space-y-8">
        {/* Company Information Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <Building className="w-5 h-5" />
            Company Information
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => onUpdateCompanyName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter company name"
            />
          </div>
        </div>

        {/* UUID Settings Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <Hash className="w-5 h-5" />
            UUID Settings
          </h3>
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
          </div>
        </div>

        {/* Number of Labels Section */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <Layers className="w-5 h-5" />
            Number of Labels
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => onUpdateQuantity(Number(e.target.value))}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
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