import React, { useState, useRef, useEffect } from 'react';
import { Move, QrCode, Type, Building, Package, Settings, Ruler, Grid, X, Image, ZoomIn, ZoomOut, RotateCw, MoveLeft } from 'lucide-react';
import type { Label, LabelElements, ElementStyle, Position, TextStyle, LogoStyle } from '../types';
import { getScaleFactor, constrainPosition } from '../utils';
import { ElementControls } from './ElementControls';
import { LabelRenderer } from './shared/LabelRenderer';

interface LabelEditorProps {
  label: Label;
  onUpdate: (updatedLabel: Label) => void;
  onClose?: () => void;
  onNext?: () => void;
  showNextButton?: boolean;
}

export function LabelEditor({
  label,
  onUpdate,
  onClose,
  onNext,
  showNextButton = false
}: LabelEditorProps) {
  const [elements, setElements] = useState<LabelElements>(label.elements);
  const [selectedElement, setSelectedElement] = useState<keyof LabelElements | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ElementStyle['resizeDirection']>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState<Position>({ x: 0, y: 0 });
  const [elementStartSize, setElementStartSize] = useState({ width: 0, height: 0 });
  const [showSaveCancel, setShowSaveCancel] = useState(false);
  const [activeTab, setActiveTab] = useState<'layout' | 'settings'>('layout');
  const [localSettings, setLocalSettings] = useState({
    companyName: label.companyName,
    text: label.text,
    prefix: label.prefix,
    uuidLength: label.shortUuid.length,
    allowElementsOutside: label.size.allowElementsOutside
  });
  const [zoomLevel, setZoomLevel] = useState(1);

  const editorRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const elementControlsRefs = useRef<Record<keyof LabelElements, HTMLDivElement | null>>({
    qrCode: null,
    uuid: null,
    text: null,
    companyName: null,
    productName: null,
    logo: null
  });

  const scale = getScaleFactor(label.size.unit);

  useEffect(() => {
    setLocalSettings({
      companyName: label.companyName,
      text: label.text,
      prefix: label.prefix,
      uuidLength: label.shortUuid.length,
      allowElementsOutside: label.size.allowElementsOutside
    });
  }, [label]);

  useEffect(() => {
    if (selectedElement && controlsRef.current && elementControlsRefs.current[selectedElement]) {
      const elementControls = elementControlsRefs.current[selectedElement];
      if (elementControls) {
        elementControls.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedElement]);

  const handleMouseDown = (e: React.MouseEvent, element: keyof LabelElements, direction?: ElementStyle['resizeDirection']) => {
    if (!editorRef.current) return;

    const rect = editorRef.current.getBoundingClientRect();
    const elementData = elements[element];
    const isMultilineEnabled = elementData.textStyle?.multiline;

    if (direction && isMultilineEnabled && elementData.textStyle) {
      setIsResizing(true);
      setResizeDirection(direction);
      const el = elements[element];
      setElementStartSize({
        width: el.textStyle?.width || el.width || el.size,
        height: el.textStyle?.height || el.size
      });
    } else if (!direction) {
      setIsDragging(true);
    }

    setSelectedElement(element);
    setStartPos({
      x: (e.clientX - rect.left) / zoomLevel,
      y: (e.clientY - rect.top) / zoomLevel
    });
    setElementStartPos(elements[element].position);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if ((!isDragging && !isResizing) || !selectedElement || !editorRef.current) return;

    const rect = editorRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - rect.left) / zoomLevel - startPos.x) / scale;
    const deltaY = ((e.clientY - rect.top) / zoomLevel - startPos.y) / scale;

    const updatedElements = { ...elements };
    const element = updatedElements[selectedElement];

    if (isResizing && resizeDirection && element.textStyle?.multiline) {
      let newWidth = elementStartSize.width;
      let newHeight = elementStartSize.height;
      let newX = elementStartPos.x;
      let newY = elementStartPos.y;

      const textElement = document.createElement('p');
      textElement.style.fontSize = `${element.size}px`;
      textElement.style.lineHeight = `${element.textStyle.lineHeight || 1.2}`;
      textElement.style.width = `${elementStartSize.width}px`;
      textElement.style.whiteSpace = 'pre-wrap';
      textElement.style.visibility = 'hidden';
      textElement.style.position = 'absolute';
      textElement.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      
      if (selectedElement === 'text') textElement.textContent = label.text;
      else if (selectedElement === 'companyName') textElement.textContent = label.companyName;
      else if (selectedElement === 'productName') textElement.textContent = label.productName;
      
      document.body.appendChild(textElement);
      const lineHeight = element.size * (element.textStyle.lineHeight || 1.2);
      document.body.removeChild(textElement);

      const minWidth = 20;
      const minHeight = lineHeight;

      switch (resizeDirection) {
        case 'e':
          newWidth = Math.max(minWidth, elementStartSize.width + deltaX);
          break;
        case 'w':
          newWidth = Math.max(minWidth, elementStartSize.width - deltaX);
          newX = elementStartPos.x + deltaX;
          break;
        case 's':
          newHeight = Math.max(minHeight, elementStartSize.height + deltaY);
          break;
        case 'n':
          newHeight = Math.max(minHeight, elementStartSize.height - deltaY);
          newY = elementStartPos.y + deltaY;
          break;
        case 'ne':
          newWidth = Math.max(minWidth, elementStartSize.width + deltaX);
          newHeight = Math.max(minHeight, elementStartSize.height - deltaY);
          newY = elementStartPos.y + deltaY;
          break;
        case 'nw':
          newWidth = Math.max(minWidth, elementStartSize.width - deltaX);
          newHeight = Math.max(minHeight, elementStartSize.height - deltaY);
          newX = elementStartPos.x + deltaX;
          newY = elementStartPos.y + deltaY;
          break;
        case 'se':
          newWidth = Math.max(minWidth, elementStartSize.width + deltaX);
          newHeight = Math.max(minHeight, elementStartSize.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(minWidth, elementStartSize.width - deltaX);
          newHeight = Math.max(minHeight, elementStartSize.height + deltaY);
          newX = elementStartPos.x + deltaX;
          break;
      }

      const constrainedPos = constrainPosition(
        { x: newX, y: newY },
        element.size,
        label.size,
        newWidth,
        localSettings.allowElementsOutside
      );

      if (element.textStyle) {
        element.textStyle.width = newWidth;
        element.textStyle.height = newHeight;
        element.width = newWidth;
        element.height = newHeight;
        element.position = constrainedPos;
      }
    } else if (isDragging) {
      const newPosition = constrainPosition(
        {
          x: elementStartPos.x + deltaX,
          y: elementStartPos.y + deltaY
        },
        element.size,
        label.size,
        element.width,
        localSettings.allowElementsOutside
      );

      element.position = newPosition;
    }

    setElements(updatedElements);
    setShowSaveCancel(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  const handleElementUpdate = (elementKey: keyof LabelElements, updates: Partial<ElementStyle>) => {
    const updatedElements = { ...elements };
    updatedElements[elementKey] = {
      ...updatedElements[elementKey],
      ...updates
    };
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

  const handleLogoUpdate = (updates: Partial<LogoStyle>) => {
    const updatedElements = { ...elements };
    updatedElements.logo = {
      ...updatedElements.logo,
      ...updates
    };
    setElements(updatedElements);
    setShowSaveCancel(true);
  };

  const handleSettingsChange = (field: keyof typeof localSettings, value: string | number | boolean) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    setShowSaveCancel(true);

    // Immediately update the label with new settings
    const updatedLabel = {
      ...label,
      companyName: field === 'companyName' ? value as string : label.companyName,
      text: field === 'text' ? value as string : label.text,
      prefix: field === 'prefix' ? value as string : label.prefix,
      shortUuid: field === 'uuidLength' ? 
        label.uuid.substring(0, value as number) : 
        label.shortUuid,
      size: {
        ...label.size,
        allowElementsOutside: field === 'allowElementsOutside' ? value as boolean : label.size.allowElementsOutside
      }
    };

    onUpdate(updatedLabel);
  };

  const handleAllowElementsOutsideToggle = (checked: boolean) => {
    handleSettingsChange('allowElementsOutside', checked);
  };

  const handleSave = () => {
    const updatedLabel = {
      ...label,
      elements,
      companyName: localSettings.companyName,
      text: localSettings.text,
      prefix: localSettings.prefix,
      shortUuid: label.uuid.substring(0, localSettings.uuidLength),
      size: {
        ...label.size,
        allowElementsOutside: localSettings.allowElementsOutside
      }
    };
    
    onUpdate(updatedLabel);
    setShowSaveCancel(false);
    
    if (onNext) {
      onNext();
    } else if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    setElements(label.elements);
    setLocalSettings({
      companyName: label.companyName,
      text: label.text,
      prefix: label.prefix,
      uuidLength: label.shortUuid.length,
      allowElementsOutside: label.size.allowElementsOutside
    });
    setShowSaveCancel(false);
    if (onClose) {
      onClose();
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleResetPosition = () => {
    if (!selectedElement) return;

    const updatedElements = { ...elements };
    updatedElements[selectedElement] = {
      ...updatedElements[selectedElement],
      position: { x: 0, y: 0 }
    };
    setElements(updatedElements);
    setShowSaveCancel(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-[1000px] h-[90vh] flex flex-col">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Label</h2>
          <div className="flex items-center gap-4">
            {selectedElement && (
              <button
                onClick={handleResetPosition}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Reset position to 0,0"
              >
                <MoveLeft className="w-4 h-4" />
                <span className="text-sm">Reset Position</span>
              </button>
            )}
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
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
              <div 
                ref={editorRef}
                className="flex-1 flex items-center justify-center overflow-auto"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div
                  className="relative"
                  onClick={() => setSelectedElement(null)}
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.2s ease-out'
                  }}
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCAyMCAwIE0gMCAwIEwgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsIDAsIDAsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10 dark:opacity-5 rounded-lg" />
                  <LabelRenderer
                    label={{ 
                      ...label,
                      elements,
                      companyName: localSettings.companyName,
                      text: localSettings.text,
                      prefix: localSettings.prefix,
                      shortUuid: label.uuid.substring(0, localSettings.uuidLength),
                      size: {
                        ...label.size,
                        allowElementsOutside: localSettings.allowElementsOutside
                      }
                    }}
                    isEditor={true}
                    onElementSelect={setSelectedElement}
                    onElementMouseDown={handleMouseDown}
                    selectedElement={selectedElement}
                    showResizeHandles={true}
                  />
                </div>
              </div>
            </div>
          </div>

          <div ref={controlsRef} className="w-[400px] overflow-y-auto pr-2">
            {activeTab === 'layout' && (
              <div className="space-y-4">
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
                            checked={label.size.padding > 0}
                            onChange={(e) => {
                              const newElements = { ...elements };
                              const newSize = { ...label.size, padding: e.target.checked ? 5 : 0 };
                              onUpdate({ ...label, size: newSize, elements: newElements });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      {label.size.padding > 0 && (
                        <input
                          type="number"
                          value={label.size.padding}
                          onChange={(e) => {
                            const newSize = { ...label.size, padding: Number(e.target.value) };
                            onUpdate({ ...label, size: newSize });
                          }}
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
                          <span className="text-sm text-gray-700 dark:text-gray-300">Allow Elements Outside</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localSettings.allowElementsOutside}
                            onChange={(e) => handleAllowElementsOutsideToggle(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  ref={(el) => elementControlsRefs.current.logo = el}
                  className={`transition-colors duration-200 ${selectedElement === 'logo' ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                >
                  <ElementControls
                    element={elements.logo}
                    icon={<Image className="w-5 h-5" />}
                    label="Logo"
                    onUpdateColor={(color) => handleElementUpdate('logo', { color })}
                    onUpdatePosition={(position) => handleElementUpdate('logo', { position })}
                    onUpdateSize={(size) => handleElementUpdate('logo', { size })}
                    onUpdateEnabled={(enabled) => handleElementUpdate('logo', { enabled })}
                    onUpdateLogo={handleLogoUpdate}
                  />
                </div>

                <div
                  ref={(el) => elementControlsRefs.current.qrCode = el}
                  className={`transition-colors duration-200 ${selectedElement === 'qrCode' ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                >
                  <ElementControls
                    element={elements.qrCode}
                    icon={<QrCode className="w-5 h-5" />}
                    label="QR Code"
                    onUpdateColor={(color) => handleElementUpdate('qrCode', { color })}
                    onUpdatePosition={(position) => handleElementUpdate('qrCode', { position })}
                    onUpdateSize={(size) => handleElementUpdate('qrCode', { size })}
                    onUpdateEnabled={(enabled) => handleElementUpdate('qrCode', { enabled })}
                  />
                </div>

                <div
                  ref={(el) => elementControlsRefs.current.uuid = el}
                  className={`transition-colors duration-200 ${selectedElement === 'uuid' ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                >
                  <ElementControls
                    element={elements.uuid}
                    icon={<Type className="w-5 h-5" />}
                    label="UUID"
                    onUpdateColor={(color) => handleElementUpdate('uuid', { color })}
                    onUpdatePosition={(position) => handleElementUpdate('uuid', { position })}
                    onUpdateSize={(size) => handleElementUpdate('uuid', { size })}
                    onUpdateEnabled={(enabled) => handleElementUpdate('uuid', { enabled })}
                  />
                </div>

                <div
                  ref={(el) => elementControlsRefs.current.text = el}
                  className={`transition-colors duration-200 ${selectedElement === 'text' ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                >
                  <ElementControls
                    element={elements.text}
                    icon={<Type className="w-5 h-5" />}
                    label="Custom Text"
                    showTextControls
                    onUpdateColor={(color) => handleTextStyleUpdate('text', { color })}
                    onUpdatePosition={(position) => handleElementUpdate('text', { position })}
                    onUpdateSize={(size) => handleElementUpdate('text', { size })}
                    onUpdateEnabled={(enabled) => handleElementUpdate('text', { enabled })}
                    onUpdateTextStyle={(textStyle) => handleTextStyleUpdate('text', textStyle)}
                  />
                </div>

                <div
                  ref={(el) => elementControlsRefs.current.companyName = el}
                  className={`transition-colors duration-200 ${selectedElement === 'companyName' ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                >
                  <ElementControls
                    element={elements.companyName}
                    icon={<Building className="w-5 h-5" />}
                    label="Company Name"
                    showTextControls
                    onUpdateColor={(color) => handleTextStyleUpdate('companyName', { color })}
                    onUpdatePosition={(position) => handleElementUpdate('companyName', { position })}
                    onUpdateSize={(size) => handleElementUpdate('companyName', { size })}
                    onUpdateEnabled={(enabled) => handleElementUpdate('companyName', { enabled })}
                    onUpdateTextStyle={(textStyle) => handleTextStyleUpdate('companyName', textStyle)}
                  />
                </div>

                <div
                  ref={(el) => elementControlsRefs.current.productName = el}
                  className={`transition-colors duration-200 ${selectedElement === 'productName' ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                >
                  <ElementControls
                    element={elements.productName}
                    icon={<Package className="w-5 h-5" />}
                    label="Product Name"
                    showTextControls
                    onUpdateColor={(color) => handleTextStyleUpdate('productName', { color })}
                    onUpdatePosition={(position) => handleElementUpdate('productName', { position })}
                    onUpdateSize={(size) => handleElementUpdate('productName', { size })}
                    onUpdateEnabled={(enabled) => handleElementUpdate('productName', { enabled })}
                    onUpdateTextStyle={(textStyle) => handleTextStyleUpdate('productName', textStyle)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={localSettings.companyName}
                    onChange={(e) => handleSettingsChange('companyName', e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Custom Text
                  </label>
                  <input
                    type="text"
                    value={localSettings.text}
                    onChange={(e) => handleSettingsChange('text', e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter custom text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    UUID Prefix
                  </label>
                  <input
                    type="text"
                    value={localSettings.prefix}
                    onChange={(e) => handleSettingsChange('prefix', e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter prefix (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    UUID Length
                  </label>
                  <input
                    type="number"
                    value={localSettings.uuidLength}
                    onChange={(e) => handleSettingsChange('uuidLength', parseInt(e.target.value))}
                    min={4}
                    max={36}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
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