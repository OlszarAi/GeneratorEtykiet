import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { Move, QrCode, Type, Building, Package, Settings, Text } from 'lucide-react';
import type { Label, LabelElements, ElementStyle, Position, TextStyle, ElementValidation, ValidationError } from '../types';
import { getScaleFactor, constrainPosition, findNonOverlappingPosition } from '../utils';

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

interface PositionInputs {
  [key: string]: {
    x: string;
    y: string;
  };
}

interface ElementControlsProps {
  element: keyof LabelElements;
  icon: React.ReactNode;
  label: string;
  showTextControls?: boolean;
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
  const [padding, setPadding] = useState(label.size.padding);
  const [elementSpacing, setElementSpacing] = useState(label.size.elementSpacing || 1);
  const [activeTab, setActiveTab] = useState<'layout' | 'settings'>('layout');
  const [validation, setValidation] = useState<Record<keyof LabelElements, ElementValidation>>({
    qrCode: { position: { x: null, y: null }, size: null },
    uuid: { position: { x: null, y: null }, size: null },
    companyName: { position: { x: null, y: null }, size: null },
    productName: { position: { x: null, y: null }, size: null },
    text: { position: { x: null, y: null }, size: null }
  });

  const [positionInputs, setPositionInputs] = useState<PositionInputs>(() => {
    const inputs: PositionInputs = {};
    Object.entries(elements).forEach(([key, element]) => {
      inputs[key] = {
        x: element.position.x.toString(),
        y: element.position.y.toString()
      };
    });
    return inputs;
  });
  
  const editorRef = useRef<HTMLDivElement>(null);
  const [draggingElement, setDraggingElement] = useState<keyof LabelElements | null>(null);
  const [showSaveCancel, setShowSaveCancel] = useState(false);
  const [selectedElement, setSelectedElement] = useState<keyof LabelElements | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState<Position>({ x: 0, y: 0 });

  const scale = getScaleFactor(label.size.unit);

  useEffect(() => {
    setElements(label.elements);
    setPositionInputs(() => {
      const inputs: PositionInputs = {};
      Object.entries(label.elements).forEach(([key, element]) => {
        inputs[key] = {
          x: element.position.x.toString(),
          y: element.position.y.toString()
        };
      });
      return inputs;
    });
  }, [label.elements]);

  const validateInput = (
    value: number,
    min: number,
    max: number,
    field: string
  ): ValidationError | null => {
    if (value < min) {
      return {
        message: `${field} must be at least ${min}`,
        min,
        max
      };
    }
    if (value > max) {
      return {
        message: `${field} cannot exceed ${max}`,
        min,
        max
      };
    }
    return null;
  };

  const handlePositionInputChange = (
    value: string,
    element: keyof LabelElements,
    axis: 'x' | 'y'
  ) => {
    setPositionInputs(prev => ({
      ...prev,
      [element]: {
        ...prev[element],
        [axis]: value
      }
    }));

    const num = parseFloat(value);
    if (!isNaN(num)) {
      const maxPos = axis === 'x' ? label.size.width : label.size.height;
      const error = validateInput(num, 0, maxPos, axis === 'x' ? 'X position' : 'Y position');

      setValidation(prev => ({
        ...prev,
        [element]: {
          ...prev[element],
          position: {
            ...prev[element].position,
            [axis]: error
          }
        }
      }));

      updateElementPosition(element, { [axis]: num });
    }
  };

  const handlePositionInputBlur = (
    element: keyof LabelElements,
    axis: 'x' | 'y'
  ) => {
    const value = positionInputs[element][axis];
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      setPositionInputs(prev => ({
        ...prev,
        [element]: {
          ...prev[element],
          [axis]: elements[element].position[axis].toString()
        }
      }));
      return;
    }

    const maxPos = axis === 'x' ? label.size.width : label.size.height;
    const error = validateInput(num, 0, maxPos, axis === 'x' ? 'X position' : 'Y position');

    if (error) {
      setPositionInputs(prev => ({
        ...prev,
        [element]: {
          ...prev[element],
          [axis]: elements[element].position[axis].toString()
        }
      }));
    }

    setValidation(prev => ({
      ...prev,
      [element]: {
        ...prev[element],
        position: {
          ...prev[element].position,
          [axis]: error
        }
      }
    }));
  };

  const handleSizeInputChange = (
    value: string,
    element: keyof LabelElements
  ) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const error = validateInput(
        num,
        element === 'qrCode' ? 20 : 8,
        element === 'qrCode' ? 200 : 72,
        'Size'
      );

      setValidation(prev => ({
        ...prev,
        [element]: {
          ...prev[element],
          size: error
        }
      }));

      updateElementSize(element, num);
    }
  };

  const updateElementPosition = (element: keyof LabelElements, position: Partial<Position>) => {
    const updatedElements = { ...elements };
    const currentElement = updatedElements[element];
    const otherElements = Object.entries(updatedElements)
      .filter(([key]) => key !== element)
      .map(([, value]) => value);

    const newPosition = constrainPosition(
      { ...currentElement.position, ...position },
      currentElement.size,
      { ...label.size, padding, elementSpacing },
      currentElement.width
    );

    const finalPosition = findNonOverlappingPosition(
      { ...currentElement, position: newPosition },
      otherElements,
      { ...label.size, padding, elementSpacing },
      scale
    );

    updatedElements[element] = {
      ...currentElement,
      position: finalPosition
    };

    setElements(updatedElements);
    setShowSaveCancel(true);
  };

  const updateElementSize = (element: keyof LabelElements, size: number) => {
    const updatedElements = { ...elements };
    updatedElements[element] = { ...updatedElements[element], size };
    setElements(updatedElements);
    setShowSaveCancel(true);
  };

  const updateElementEnabled = (element: keyof LabelElements, enabled: boolean) => {
    const updatedElements = { ...elements };
    updatedElements[element] = { ...updatedElements[element], enabled };
    setElements(updatedElements);
    setShowSaveCancel(true);
  };

  const updateTextStyle = (element: 'companyName' | 'productName' | 'text', textStyle: Partial<TextStyle>) => {
    const updatedElements = { ...elements };
    updatedElements[element] = {
      ...updatedElements[element],
      textStyle: { ...updatedElements[element].textStyle, ...textStyle }
    };
    setElements(updatedElements);
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

    updateElementPosition(draggingElement, {
      x: elementStartPos.x + deltaX,
      y: elementStartPos.y + deltaY
    });

    setPositionInputs(prev => ({
      ...prev,
      [draggingElement]: {
        x: (elementStartPos.x + deltaX).toString(),
        y: (elementStartPos.y + deltaY).toString()
      }
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingElement(null);
  };

  const handleSave = () => {
    const hasErrors = Object.values(validation).some(
      elementValidation =>
        elementValidation.position.x !== null ||
        elementValidation.position.y !== null ||
        elementValidation.size !== null
    );

    if (hasErrors) {
      alert('Please fix all validation errors before saving');
      return;
    }

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

  const renderElement = (
    element: keyof LabelElements,
    content: React.ReactNode,
    style: React.CSSProperties
  ) => {
    const elementStyle = elements[element];
    if (!elementStyle.enabled) return null;

    const isSelected = selectedElement === element;
    const isDragging = draggingElement === element;

    return (
      <div 
        className={`absolute cursor-move select-none ${
          isSelected || isDragging ? 'z-10' : ''
        }`}
        style={{
          ...style,
          left: `${elementStyle.position.x * scale}px`,
          top: `${elementStyle.position.y * scale}px`,
          padding: '8px',
          margin: '-8px',
          borderRadius: '4px',
          background: isSelected || isDragging ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          boxShadow: isSelected || isDragging ? 
            '0 0 0 2px #3b82f6, 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 6px rgba(59, 130, 246, 0.1)' : 
            'none',
          transition: 'all 0.2s ease'
        }}
        onMouseDown={(e) => handleMouseDown(e, element)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement(isSelected ? null : element);
        }}
      >
        <div 
          style={{
            position: 'relative',
            borderRadius: '3px',
            padding: '2px'
          }}
        >
          {content}
        </div>
      </div>
    );
  };

  const ElementControls = ({ 
    element, 
    icon, 
    label: elementLabel,
    showTextControls = false 
  }: ElementControlsProps) => {
    const elementStyle = elements[element];
    const isSelected = selectedElement === element;
    
    return (
      <div className={`bg-gray-50 dark:bg-gray-800 p-4 rounded-lg ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{elementLabel}</h3>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={elementStyle.enabled}
              onChange={(e) => updateElementEnabled(element, e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Enable</span>
          </label>
        </div>

        {elementStyle.enabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  X Position ({label.size.unit})
                  {validation[element].position.x && (
                    <span className="text-red-500 text-xs ml-1">
                      {validation[element].position.x.message}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={positionInputs[element].x}
                  onChange={(e) => handlePositionInputChange(e.target.value, element, 'x')}
                  onBlur={() => handlePositionInputBlur(element, 'x')}
                  step="0.01"
                  className={`mt-1 block w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                    validation[element].position.x ? 'border-red-500' : ''
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Y Position ({label.size.unit})
                  {validation[element].position.y && (
                    <span className="text-red-500 text-xs ml-1">
                      {validation[element].position.y.message}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={positionInputs[element].y}
                  onChange={(e) => handlePositionInputChange(e.target.value, element, 'y')}
                  onBlur={() => handlePositionInputBlur(element, 'y')}
                  step="0.01"
                  className={`mt-1 block w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                    validation[element].position.y ? 'border-red-500' : ''
                  }`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Size {element === 'qrCode' ? '(px)' : '(pt)'}
                {validation[element].size && (
                  <span className="text-red-500 text-xs ml-1">
                    {validation[element].size.message}
                  </span>
                )}
              </label>
              <input
                type="number"
                value={elementStyle.size}
                onChange={(e) => handleSizeInputChange(e.target.value, element)}
                className={`mt-1 block w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                  validation[element].size ? 'border-red-500' : ''
                }`}
              />
            </div>
            {showTextControls && 'textStyle' in elementStyle && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Text Alignment</label>
                  <select
                    value={elementStyle.textStyle.align}
                    onChange={(e) => updateTextStyle(element as 'companyName' | 'productName' | 'text', { 
                      align: e.target.value as TextStyle['align']
                    })}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
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
                      checked={elementStyle.textStyle.multiline}
                      onChange={(e) => updateTextStyle(element as 'companyName' | 'productName' | 'text', { 
                        multiline: e.target.checked
                      })}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Multiline</span>
                  </label>
                </div>
                {elementStyle.textStyle.multiline && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Width ({label.size.unit})</label>
                    <input
                      type="number"
                      value={elementStyle.textStyle.maxWidth || elementStyle.width || elementStyle.size}
                      onChange={(e) => updateTextStyle(element as 'companyName' | 'productName' | 'text', { 
                        maxWidth: Number(e.target.value)
                      })}
                      className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
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
            {!showSaveCancel && !showNextButton && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            )}
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
                  {renderElement(
                    'qrCode',
                    <QRCode value={`${label.prefix}${label.uuid}`} size={elements.qrCode.size} />,
                    { fontSize: `${elements.qrCode.size}px` }
                  )}
                  
                  {renderElement(
                    'uuid',
                    <p className="text-gray-600">{label.shortUuid}</p>,
                    { fontSize: `${elements.uuid.size}px` }
                  )}
                  
                  {renderElement(
                    'text',
                    <p 
                      className="font-bold whitespace-pre-wrap"
                      style={{ 
                        textAlign: elements.text.textStyle.align,
                        maxWidth: elements.text.textStyle.maxWidth ? 
                          `${elements.text.textStyle.maxWidth * scale}px` : 
                          undefined
                      }}
                    >
                      {label.text}
                    </p>,
                    { fontSize: `${elements.text.size}px` }
                  )}
                  
                  {renderElement(
                    'companyName',
                    <p 
                      className="font-bold whitespace-pre-wrap"
                      style={{ 
                        textAlign: elements.companyName.textStyle.align,
                        maxWidth: elements.companyName.textStyle.maxWidth ? 
                          `${elements.companyName.textStyle.maxWidth * scale}px` : 
                          undefined
                      }}
                    >
                      {label.companyName}
                    </p>,
                    { fontSize: `${elements.companyName.size}px` }
                  )}
                  
                  {renderElement(
                    'productName',
                    <p 
                      className="font-bold whitespace-pre-wrap"
                      style={{ 
                        textAlign: elements.productName.textStyle.align,
                        maxWidth: elements.productName.textStyle.maxWidth ? 
                          `${elements.productName.textStyle.maxWidth * scale}px` : 
                          undefined
                      }}
                    >
                      {label.productName}
                    </p>,
                    { fontSize: `${elements.productName.size}px` }
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-[400px] overflow-y-auto pr-2" style={{ marginRight: '-0.5rem' }}>
            <div className="space-y-4 pr-2">
              {activeTab === 'layout' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Border Padding ({label.size.unit})
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={padding}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || !isNaN(parseFloat(value))) {
                              setPadding(value === '' ? 0 : parseFloat(value));
                              setShowSaveCancel(true);
                            }
                          }}
                          min={0}
                          step="0.1"
                          className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={padding === 0}
                            onChange={(e) => {
                              setPadding(e.target.checked ? 0 : 1);
                              setShowSaveCancel(true);
                            }}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Disable</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Element Spacing ({label.size.unit})
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={elementSpacing}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || !isNaN(parseFloat(value))) {
                              setElementSpacing(value === '' ? 0 : parseFloat(value));
                              setShowSaveCancel(true);
                            }
                          }}
                          min={0}
                          step="0.1"
                          className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={elementSpacing === 0}
                            onChange={(e) => {
                              setElementSpacing(e.target.checked ? 0 : 1);
                              setShowSaveCancel(true);
                            }}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Disable</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <ElementControls 
                    element="qrCode" 
                    icon={<QrCode className="w-5 h-5" />} 
                    label="QR Code" 
                  />
                  <ElementControls 
                    element="uuid" 
                    icon={<Type className="w-5 h-5" />} 
                    label="UUID Text" 
                  />
                  <ElementControls 
                    element="text" 
                    icon={<Text className="w-5 h-5" />} 
                    label="Custom Text" 
                    showTextControls
                  />
                  <ElementControls 
                    element="companyName" 
                    icon={<Building className="w-5 h-5" />} 
                    label="Company Name" 
                    showTextControls
                  />
                  <ElementControls 
                    element="productName" 
                    icon={<Package className="w-5 h-5" />} 
                    label="Product Name" 
                    showTextControls
                  />
                </div>
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
                        className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
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
                        className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
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
                        className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
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
                        className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
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