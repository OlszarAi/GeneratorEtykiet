import React from 'react';
import { Ruler, Square, Maximize, Grid } from 'lucide-react';
import type { LabelSize } from '../types';

interface LabelSizeFormProps {
  labelSize: LabelSize;
  onUpdateLabelSize: (labelSize: LabelSize) => void;
  onNext: () => void;
}

export function LabelSizeForm({ labelSize, onUpdateLabelSize, onNext }: LabelSizeFormProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Label Dimensions
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Set the size and properties of your label
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Square className="w-4 h-4" />
                  Width
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={labelSize.width || 0}
                    onChange={(e) => onUpdateLabelSize({ ...labelSize, width: Number(e.target.value) })}
                    className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white
                             transition-all duration-200 ease-in-out"
                    min="0"
                    step="0.1"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    {labelSize.unit}
                  </span>
                </div>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Maximize className="w-4 h-4" />
                  Height
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={labelSize.height || 0}
                    onChange={(e) => onUpdateLabelSize({ ...labelSize, height: Number(e.target.value) })}
                    className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white
                             transition-all duration-200 ease-in-out"
                    min="0"
                    step="0.1"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    {labelSize.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Grid className="w-4 h-4" />
                  Unit
                </label>
                <select
                  value={labelSize.unit || 'mm'}
                  onChange={(e) => onUpdateLabelSize({ ...labelSize, unit: e.target.value as 'mm' | 'cm' | 'in' })}
                  className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white
                           transition-all duration-200 ease-in-out appearance-none bg-no-repeat"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 1rem center",
                    backgroundSize: "1.5em 1.5em"
                  }}
                >
                  <option value="mm">Millimeters (mm)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Border Padding
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={labelSize.padding || 0}
                    onChange={(e) => onUpdateLabelSize({ ...labelSize, padding: Number(e.target.value) })}
                    min="0"
                    step="0.1"
                    className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white
                             transition-all duration-200 ease-in-out"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    {labelSize.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={labelSize.border.enabled || false}
                onChange={(e) => onUpdateLabelSize({
                  ...labelSize,
                  border: {
                    ...labelSize.border,
                    enabled: e.target.checked
                  }
                })}
                className="w-5 h-5 rounded-md border-2 border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-600"
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Add border to labels</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enable this to add a customizable border around each label</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={labelSize.preventCollisions || false}
                onChange={(e) => onUpdateLabelSize({
                  ...labelSize,
                  preventCollisions: e.target.checked
                })}
                className="w-5 h-5 rounded-md border-2 border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-600"
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Prevent element overlapping</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Automatically adjust element positions to prevent overlapping</p>
              </div>
            </label>

            {labelSize.border.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white
                             transition-all duration-200 ease-in-out"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="block w-full h-[46px] rounded-xl border-2 border-gray-200 dark:border-gray-600 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl
                       hover:from-blue-600 hover:to-purple-600 focus:ring-4 focus:ring-blue-500/50 
                       transform transition-all duration-200 ease-in-out hover:scale-105"
            >
              Continue to Next Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}