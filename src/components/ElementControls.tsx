import React, { useState, useEffect, useRef } from 'react';
import { ElementColorPicker } from './ElementColorPicker';
import { RotationControl } from './RotationControl';
import { Ruler, Image, ChevronDown, ChevronRight, MoveLeft } from 'lucide-react';
import { LogoUploader } from './LogoUploader';
import type { ElementStyle, TextStyle, LogoStyle } from '../types';

interface ElementControlsProps {
  element: ElementStyle | LogoStyle;
  icon: React.ReactNode;
  label: string;
  showTextControls?: boolean;
  onUpdateColor: (color: string) => void;
  onUpdatePosition: (position: { x: number; y: number }) => void;
  onUpdateSize: (size: number) => void;
  onUpdateEnabled: (enabled: boolean) => void;
  onUpdateTextStyle?: (textStyle: Partial<TextStyle>) => void;
  onUpdateRotation?: (rotation: number) => void;
  onUpdateLogo?: (updates: Partial<LogoStyle>) => void;
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
  onUpdateRotation,
  onUpdateLogo,
  unit = 'mm'
}: ElementControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValues, setInputValues] = useState({
    x: element.position.x.toString(),
    y: element.position.y.toString(),
    size: element.size.toString()
  });

  const xInputRef = useRef<HTMLInputElement>(null);
  const yInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== xInputRef.current) {
      setInputValues(prev => ({ ...prev, x: element.position.x.toFixed(1) }));
    }
    if (document.activeElement !== yInputRef.current) {
      setInputValues(prev => ({ ...prev, y: element.position.y.toFixed(1) }));
    }
    if (document.activeElement !== sizeInputRef.current) {
      setInputValues(prev => ({ ...prev, size: element.size.toString() }));
    }
  }, [element.position.x, element.position.y, element.size]);

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    setInputValues(prev => ({ ...prev, [axis]: value }));
    
    if (value === '') return;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdatePosition({
        x: axis === 'x' ? numValue : element.position.x,
        y: axis === 'y' ? numValue : element.position.y
      });
    }
  };

  const handleSizeChange = (value: string) => {
    setInputValues(prev => ({ ...prev, size: value }));
    
    if (value === '') return;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdateSize(numValue);
    }
  };

  const handleBlur = (field: 'x' | 'y' | 'size') => {
    const value = inputValues[field];
    if (value === '' || isNaN(parseFloat(value))) {
      setInputValues(prev => ({
        ...prev,
        [field]: field === 'size' ? 
          element.size.toString() : 
          element.position[field as 'x' | 'y'].toFixed(1)
      }));
    }
  };

  const handleEnableChange = (checked: boolean) => {
    onUpdateEnabled(checked);
    if (checked) {
      setIsExpanded(true);
    }
  };

  const handleMultilineToggle = (checked: boolean) => {
    if (checked && onUpdateTextStyle) {
      onUpdateTextStyle({
        multiline: true,
        width: element.width || element.size,
        height: element.size,
        lineHeight: 1.2
      });
    } else if (onUpdateTextStyle) {
      onUpdateTextStyle({
        multiline: false,
        width: undefined,
        height: undefined,
        lineHeight: undefined
      });
    }
  };

  const handleResetPosition = () => {
    onUpdatePosition({ x: 0, y: 0 });
  };

  const isLogo = 'imageUrl' in element;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:text-blue-500 transition-colors"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{label}</h3>
          </div>
        </button>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={element.enabled}
            onChange={(e) => handleEnableChange(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Enable</span>
        </label>
      </div>

      {isExpanded && element.enabled && (
        <div className="space-y-4 mt-4">
          {isLogo && onUpdateLogo ? (
            <LogoUploader
              logo={element as LogoStyle}
              onUpdateLogo={onUpdateLogo}
            />
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Position ({unit})
                  </label>
                  <button
                    onClick={handleResetPosition}
                    className="flex items-center gap-1.5 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    title="Reset position to 0,0"
                  >
                    <MoveLeft className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      X Position
                    </label>
                    <input
                      ref={xInputRef}
                      type="number"
                      value={inputValues.x}
                      onChange={(e) => handlePositionChange('x', e.target.value)}
                      onBlur={() => handleBlur('x')}
                      step="0.1"
                      className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Y Position
                    </label>
                    <input
                      ref={yInputRef}
                      type="number"
                      value={inputValues.y}
                      onChange={(e) => handlePositionChange('y', e.target.value)}
                      onBlur={() => handleBlur('y')}
                      step="0.1"
                      className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Size {label === 'QR Code' ? '(px)' : '(pt)'}
                </label>
                <input
                  ref={sizeInputRef}
                  type="number"
                  value={inputValues.size}
                  onChange={(e) => handleSizeChange(e.target.value)}
                  onBlur={() => handleBlur('size')}
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
                        onChange={(e) => handleMultilineToggle(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable Multiline & Resizing
                      </span>
                    </label>
                  </div>

                  {element.textStyle.multiline && (
                    <>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Ruler className="w-4 h-4" />
                          Line Height
                        </label>
                        <input
                          type="number"
                          value={element.textStyle.lineHeight || 1.2}
                          onChange={(e) => onUpdateTextStyle({ lineHeight: Number(e.target.value) })}
                          step="0.1"
                          min="1"
                          max="3"
                          className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>Hold Shift + drag edges to resize text box</p>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rotation
                    </label>
                    <RotationControl
                      rotation={element.textStyle.rotation || 0}
                      onChange={(rotation) => onUpdateTextStyle({ rotation })}
                    />
                  </div>
                </div>
              )}

              {!showTextControls && onUpdateRotation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rotation
                  </label>
                  <RotationControl
                    rotation={element.rotation || 0}
                    onChange={onUpdateRotation}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}