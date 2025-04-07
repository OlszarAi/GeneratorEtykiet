import React from 'react';
import { QrCode, Building, Hash, Layers, Type, ArrowLeft } from 'lucide-react';

interface OtherSettingsFormProps {
  companyName: string;
  text: string;
  prefix: string;
  uuidLength: number;
  quantity: number;
  previewShortUuid: string;
  onUpdateCompanyName: (name: string) => void;
  onUpdateText: (text: string) => void;
  onUpdatePrefix: (prefix: string) => void;
  onUpdateUuidLength: (length: number) => void;
  onUpdateQuantity: (quantity: number) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export function OtherSettingsForm({
  companyName,
  text,
  prefix,
  uuidLength,
  quantity,
  previewShortUuid,
  onUpdateCompanyName,
  onUpdateText,
  onUpdatePrefix,
  onUpdateUuidLength,
  onUpdateQuantity,
  onBack,
  onGenerate
}: OtherSettingsFormProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Other Settings
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Configure additional label properties
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Company Information */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Company Information</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => onUpdateCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              {/* Custom Text */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <Type className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Custom Text</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => onUpdateText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter custom text"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* UUID Settings */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">UUID Settings</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      UUID Prefix
                    </label>
                    <input
                      type="text"
                      value={prefix}
                      onChange={(e) => onUpdatePrefix(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter prefix (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      UUID Length
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={uuidLength}
                        onChange={(e) => onUpdateUuidLength(Number(e.target.value))}
                        min="4"
                        max="36"
                        className="w-32 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Preview:</div>
                        <code className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm">
                          {previewShortUuid}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Number of Labels */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Number of Labels</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => onUpdateQuantity(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={onGenerate}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 focus:ring-4 focus:ring-blue-500/50 transform transition-all duration-200 ease-in-out hover:scale-105"
            >
              Generate Labels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}