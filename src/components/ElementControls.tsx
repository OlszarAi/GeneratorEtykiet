import React, { useState, useEffect } from 'react';
import { ElementColorPicker } from './ElementColorPicker';
import type { ElementStyle, TextStyle } from '../types';

interface ElementControlsProps {
  element: ElementStyle & { textStyle?: TextStyle };
  icon: React.ReactNode;
  label: string;
  showTextControls?: boolean;
  onUpdateColor: (color: string) => void;
  onUpdatePosition: (position: { x: number; y: number }) => void;
  onUpdateSize: (size: number) => void;
  onUpdateEnabled: (enabled: boolean) => void;
  onUpdateTextStyle?: (textStyle: Partial<TextStyle>) => void;
  unit?: string;
}

export function ElementControls({
  element,
  icon,
  label,
  showTextControls = false,
  onUpdateColor,
  onUpdatePosition,
  onUpdateSize,
  onUpdateEnabled,
  onUpdateTextStyle,
  unit = 'mm'
}: ElementControlsProps) {
  // Local state for input values
  const [xPosition, setXPosition] = useState(element.position.x.toString());
  const [yPosition, setYPosition] = useState(element.position.y.toString());
  const [size, setSize] = useState(element.size.toString());

  // Update local state when element changes
  useEffect(() => {
    setXPosition(element.position.x.toString());
    setYPosition(element.position.y.toString());
    setSize(element.size.toString());
  }, [element]);

  // Handle position changes
  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    if (axis === 'x') {
      setXPosition(value);
      if (value === '') return;
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onUpdatePosition({ x: numValue, y: element.position.y });
      }
    } else {
      setYPosition(value);
      if (value === '') return;
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onUpdatePosition({ x: element.position.x, y: numValue });
      }
    }
  };

  // Handle size changes
  const handleSizeChange = (value: string) => {
    setSize(value);
    if (value === '') return;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdateSize(numValue);
    }
  };

  // Handle position blur
  const handlePositionBlur = (axis: 'x' | 'y') => {
    const value = axis === 'x' ? xPosition : yPosition;
    if (value === '' || isNaN(parseFloat(value))) {
      if (axis === 'x') {
        setXPosition(element.position.x.toString());
      } else {
        setYPosition(element.position.y.toString());
      }
    }
  };

  // Handle size blur
  const handleSizeBlur = () => {
    if (size === '' || isNaN(parseFloat(size))) {
      setSize(element.size.toString());
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{label}</h3>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={element.enabled}
            onChange={(e) => onUpdateEnabled(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Enable</span>
        </label>
      </div>

      {element.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                X Position ({unit})
              </label>
              <input
                type="number"
                value={xPosition}
                onChange={(e) => handlePositionChange('x', e.target.value)}
                onBlur={() => handlePositionBlur('x')}
                step="0.1"
                className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Y Position ({unit})
              </label>
              <input
                type="number"
                value={yPosition}
                onChange={(e) => handlePositionChange('y', e.target.value)}
                onBlur={() => handlePositionBlur('y')}
                step="0.1"
                className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Size {label === 'QR Code' ? '(px)' : '(pt)'}
            </label>
            <input
              type="number"
              value={size}
              onChange={(e) => handleSizeChange(e.target.value)}
              onBlur={handleSizeBlur}
              step="1"
              min="1"
              className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <ElementColorPicker
            color={element.color || (element.textStyle?.color || '#000000')}
            onChange={onUpdateColor}
          />

          {showTextControls && element.textStyle && onUpdateTextStyle && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Text Alignment
                </label>
                <select
                  value={element.textStyle.align}
                  onChange={(e) => onUpdateTextStyle({ align: e.target.value as TextStyle['align'] })}
                  className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.textStyle.multiline}
                    onChange={(e) => onUpdateTextStyle({ multiline: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Multiline
                  </span>
                </label>
              </div>

              {element.textStyle.multiline && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Max Width ({unit})
                  </label>
                  <input
                    type="number"
                    value={element.textStyle.maxWidth || element.width || element.size}
                    onChange={(e) => onUpdateTextStyle({ maxWidth: Number(e.target.value) })}
                    step="0.1"
                    min="1"
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}