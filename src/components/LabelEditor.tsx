import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { Move, QrCode, Type, Building, Package, Settings, Ruler, Grid } from 'lucide-react';
import type { Label, LabelElements, ElementStyle, Position, TextStyle } from '../types';
import { getScaleFactor, constrainPosition, findNonOverlappingPosition } from '../utils';
import { ElementControls } from './ElementControls';

interface LabelEditorProps {
  label: Label;
  onUpdate: (updatedLabel: Label) => void;
  onUpdateCompanyName?: (name: string) => void;
  onUpdateText?: (text: string) => void;
  onUpdatePrefix?: (prefix: string) => void;
  onUpdateUuidLength?: (length: number) => void;
  onClose?: () => void;
  onNext?: () => void;
  showNextButton?: boolean;
}

export function LabelEditor({
  label,
  onUpdate,
  onUpdateCompanyName,
  onUpdateText,
  onUpdatePrefix,
  onUpdateUuidLength,
  onClose,
  onNext,
  showNextButton = false
}: LabelEditorProps) {
  const [elements, setElements] = useState<LabelElements>(label.elements);
  const [padding, setPadding] = useState(0);
  const [elementSpacing, setElementSpacing] = useState(0);
  const [isPaddingEnabled, setIsPaddingEnabled] = useState(false);
  const [isSpacingEnabled, setIsSpacingEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'layout' | 'settings'>('layout');
  const [showSaveCancel, setShowSaveCancel] = useState(false);
  const [selectedElement, setSelectedElement] = useState<keyof LabelElements | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingElement, setDraggingElement] = useState<keyof LabelElements | null>(null);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState<Position>({ x: 0, y: 0 });

  const editorRef = useRef<HTMLDivElement>(null);
  const scale = getScaleFactor(label.size.unit);

  useEffect(() => {
    setElements(label.elements);
    setPadding(0);
    setElementSpacing(0);
    setIsPaddingEnabled(false);
    setIsSpacingEnabled(false);
  }, [label.elements]);

  const handleElementUpdate = (elementKey: keyof LabelElements, updates: Partial<ElementStyle>) => {
    const updatedElements = { ...elements };
    updatedElements[elementKey] = {
      ...updatedElements[elementKey],
      ...updates
    };
    setElements(updatedElements);
    setShowSaveCancel(true);
  };

  const handleElementColorUpdate = (element: keyof LabelElements, color: string) => {
    const updatedElements = { ...elements };
    if ('textStyle' in updatedElements[element]) {
      (updatedElements[element] as ElementStyle & { textStyle: TextStyle }).textStyle.color = color;
    } else {
      (updatedElements[element] as ElementStyle).color = color;
    }
    setElements(updatedElements);
    setShowSaveCancel(true);
  };

  const handleTextStyleUpdate = (element: keyof LabelElements, textStyle: Partial<TextStyle>) => {
    const updatedElements = { ...elements };
    if ('textStyle' in updatedElements[element]) {
      (updatedElements[element] as ElementStyle & { textStyle: TextStyle }).textStyle = {
        ...(updatedElements[element] as ElementStyle & { textStyle: TextStyle }).textStyle,
        ...textStyle
      };
      setElements(updatedElements);
      setShowSaveCancel(true);
    }
  };

  const handlePaddingChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setPadding(numValue);
      setShowSaveCancel(true);
    }
  };

  const handleSpacingChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setElementSpacing(numValue);
      setShowSaveCancel(true);
    }
  };

  const handlePaddingToggle = (enabled: boolean) => {
    setIsPaddingEnabled(enabled);
    setPadding(enabled ? 5 : 0);
    setShowSaveCancel(true);
  };

  const handleSpacingToggle = (enabled: boolean) => {
    setIsSpacingEnabled(enabled);
    setElementSpacing(enabled ? 1 : 0);
    setShowSaveCancel(true);
  };

  const handleMouseDown = (e: React.MouseEvent, element: keyof LabelElements) => {
    if (!editorRef.current) return;

    const rect = editorRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDraggingElement(element);
    setStartDragPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setElementStartPos(elements[element].position);
    
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggingElement || !editorRef.current) return;

    const rect = editorRef.current.getBoundingClientRect();
    const deltaX = (e.clientX - rect.left - startDragPos.x) / scale;
    const deltaY = (e.clientY - rect.top - startDragPos.y) / scale;

    const updatedElements = { ...elements };
    const newPosition = constrainPosition(
      {
        x: elementStartPos.x + deltaX,
        y: elementStartPos.y + deltaY
      },
      elements[draggingElement].size,
      { ...label.size, padding, elementSpacing },
      elements[draggingElement].width
    );

    updatedElements[draggingElement] = {
      ...updatedElements[draggingElement],
      position: newPosition
    };

    setElements(updatedElements);
    setShowSaveCancel(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingElement(null);
  };

  const handleSave = () => {
    onUpdate({ 
      ...label, 
      elements, 
      size: { 
        ...label.size, 
        padding, 
        elementSpacing 
      } 
    });
    setShowSaveCancel(false);
    if (onNext) {
      onNext();
    } else if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    setElements(label.elements);
    setPadding(label.size.padding);
    setElementSpacing(label.size.elementSpacing || 1);
    setShowSaveCancel(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-[1000px] h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Label</h2>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800">
              <button
                onClick={() => setActiveTab('layout')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'layout'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Layout
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'settings'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6 flex-1 min-h-0">
          <div className="w-[500px] flex flex-col">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex-1 flex flex-col">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Preview</h3>
              <div className="flex-1 flex items-center justify-center">
                <div 
                  ref={editorRef}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-100 cursor-pointer relative"
                  style={{
                    width: `${label.size.width * scale}px`,
                    height: `${label.size.height * scale}px`
                  }}
                  onClick={() => setSelectedElement(null)}
                >
                  {Object.entries(elements).map(([key, element]) => {
                    if (!element.enabled) return null;
                    const isSelected = selectedElement === key;
                    const isDragging = draggingElement === key;

                    return (
                      <div
                        key={key}
                        className={`absolute cursor-move select-none ${isSelected || isDragging ? 'z-10' : ''}`}
                        style={{
                          left: `${element.position.x * scale}px`,
                          top: `${element.position.y * scale}px`,
                          padding: '8px',
                          margin: '-8px',
                          borderRadius: '4px',
                          background: isSelected || isDragging ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                          boxShadow: isSelected || isDragging ? 
                            '0 0 0 2px #3b82f6, 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 6px rgba(59, 130, 246, 0.1)' : 
                            'none',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, key as keyof LabelElements)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElement(isSelected ? null : key as keyof LabelElements);
                        }}
                      >
                        {key === 'qrCode' && (
                          <QRCode
                            value={`${label.prefix}${label.uuid}`}
                            size={element.size}
                            fgColor={element.color || '#000000'}
                          />
                        )}
                        {key === 'uuid' && (
                          <p style={{ 
                            fontSize: `${element.size}px`,
                            color: element.color || '#000000'
                          }}>
                            {label.shortUuid}
                          </p>
                        )}
                        {(key === 'text' || key === 'companyName' || key === 'productName') && (
                          <p style={{ 
                            fontSize: `${element.size}px`,
                            color: (element as ElementStyle & { textStyle: TextStyle }).textStyle.color || '#000000',
                            textAlign: (element as ElementStyle & { textStyle: TextStyle }).textStyle.align,
                            whiteSpace: (element as ElementStyle & { textStyle: TextStyle }).textStyle.multiline ? 'pre-wrap' : 'nowrap',
                            maxWidth: (element as ElementStyle & { textStyle: TextStyle }).textStyle.maxWidth ? 
                              `${(element as ElementStyle & { textStyle: TextStyle }).textStyle.maxWidth}px` : 
                              undefined
                          }}>
                            {key === 'text' ? label.text :
                             key === 'companyName' ? label.companyName :
                             label.productName}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="w-[400px] overflow-y-auto pr-2" style={{ marginRight: '-0.5rem' }}>
            <div className="space-y-4">
              {activeTab === 'layout' && (
                <>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Border Padding</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isPaddingEnabled}
                              onChange={(e) => handlePaddingToggle(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        {isPaddingEnabled && (
                          <input
                            type="number"
                            value={padding}
                            onChange={(e) => handlePaddingChange(e.target.value)}
                            min="0"
                            step="0.1"
                            className="mt-2 w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Grid className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Element Spacing</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSpacingEnabled}
                              onChange={(e) => handleSpacingToggle(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        {isSpacingEnabled && (
                          <input
                            type="number"
                            value={elementSpacing}
                            onChange={(e) => handleSpacingChange(e.target.value)}
                            min="0"
                            step="0.1"
                            className="mt-2 w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <ElementControls
                    element={elements.qrCode}
                    icon={<QrCode className="w-5 h-5" />}
                    label="QR Code"
                    onUpdateColor={(color) => handleElementColorUpdate('qrCode', color)}
                    onUpdatePosition={(position) => handleElementUpdate('qrCode', { position })}
                    onUpdateSize={(size) => handleElementUpdate('qrCode', { size })}
                    onUpdateEnabled={(enabled) => handleElementUpdate('qrCode', { enabled })}
                  />
                  <ElementControls
                    element={elements.uuid}
                    icon={<Type className="w-5 h-5" />}
                    label="UUID"
                    onUpdateColor={(color) => handleElementColorUpdate('uuid', color)}
                    onUpdatePosition={(position) => handleElementUpdate('uuid', { position })}
                    onUpdateSize={(size) => handleElementUpdate('uuid', { size })}
                    onUpdateEnabled={(enabled) => handleElementUpdate('uuid', { enabled })}
                  />
                  <ElementControls
                    element={elements.text}
                    icon={<Type className="w-5 h-5" />}
                    label="Custom Text"
                    showTextControls
                    onUpdateColor={(color) => handleElementColorUpdate('text', color)}
                    onUpdatePosition={(position) => handleElementUpdate('text', { position })}
                    onUpdateSize={(size) => handleElementUpdate('text', { size })}
                    onUpdateEnabled={(enabled) => handleElementUpdate('text', { enabled })}
                    onUpdateTextStyle={(textStyle) => handleTextStyleUpdate('text', textStyle)}
                  />
                  <ElementControls
                    element={elements.companyName}
                    icon={<Building className="w-5 h-5" />}
                    label="Company Name"
                    showTextControls
                    onUpdateColor={(color) => handleElementColorUpdate('companyName', color)}
                    onUpdatePosition={(position) => handleElementUpdate('companyName', { position })}
                    onUpdateSize={(size) => handleElementUpdate('companyName', { size })}
                    onUpdateEnabled={(enabled) => handleElementUpdate('companyName', { enabled })}
                    onUpdateTextStyle={(textStyle) => handleTextStyleUpdate('companyName', textStyle)}
                  />
                  <ElementControls
                    element={elements.productName}
                    icon={<Package className="w-5 h-5" />}
                    label="Product Name"
                    showTextControls
                    onUpdateColor={(color) => handleElementColorUpdate('productName', color)}
                    onUpdatePosition={(position) => handleElementUpdate('productName', { position })}
                    onUpdateSize={(size) => handleElementUpdate('productName', { size })}
                    onUpdateEnabled={(enabled) => handleElementUpdate('productName', { enabled })}
                    onUpdateTextStyle={(textStyle) => handleTextStyleUpdate('productName', textStyle)}
                  />
                </>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {onUpdateCompanyName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                      <input
                        type="text"
                        value={label.companyName}
                        onChange={(e) => {
                          onUpdateCompanyName(e.target.value);
                          setShowSaveCancel(true);
                        }}
                        className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  {onUpdateText && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom Text</label>
                      <input
                        type="text"
                        value={label.text}
                        onChange={(e) => {
                          onUpdateText(e.target.value);
                          setShowSaveCancel(true);
                        }}
                        className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  {onUpdatePrefix && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">UUID Prefix</label>
                      <input
                        type="text"
                        value={label.prefix}
                        onChange={(e) => {
                          onUpdatePrefix(e.target.value);
                          setShowSaveCancel(true);
                        }}
                        className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  {onUpdateUuidLength && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">UUID Length</label>
                      <input
                        type="number"
                        value={label.shortUuid.length}
                        onChange={(e) => {
                          onUpdateUuidLength(parseInt(e.target.value));
                          setShowSaveCancel(true);
                        }}
                        min={4}
                        max={36}
                        className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {(showSaveCancel || showNextButton) && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            {showSaveCancel && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {showNextButton ? 'Next' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}