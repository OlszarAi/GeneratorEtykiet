import React, { useRef, useState, useEffect } from 'react';
import { Upload, RotateCw, Trash2, Ruler, Move } from 'lucide-react';
import type { LogoStyle } from '../types';

interface LogoUploaderProps {
  logo: LogoStyle;
  onUpdateLogo: (updates: Partial<LogoStyle>) => void;
}

export function LogoUploader({ logo, onUpdateLogo }: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({
    width: logo.width || logo.size,
    height: logo.height || logo.size
  });
  const [position, setPosition] = useState({
    x: logo.position.x,
    y: logo.position.y
  });

  useEffect(() => {
    setDimensions({
      width: logo.width || logo.size,
      height: logo.height || logo.size
    });
    setPosition({
      x: logo.position.x,
      y: logo.position.y
    });
  }, [logo.width, logo.height, logo.size, logo.position.x, logo.position.y]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is PNG
    if (file.type !== 'image/png') {
      alert('Please select a PNG file');
      return;
    }

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert('File size should be less than 1MB');
      return;
    }

    // Create object URL
    const url = URL.createObjectURL(file);

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const newWidth = logo.size;
      const newHeight = logo.size / aspectRatio;
      
      setDimensions({
        width: newWidth,
        height: newHeight
      });

      onUpdateLogo({ 
        imageUrl: url,
        aspectRatio,
        width: newWidth,
        height: newHeight
      });
    };
    img.src = url;
  };

  const handleRotate = () => {
    onUpdateLogo({ 
      rotation: ((logo.rotation || 0) + 90) % 360,
      width: dimensions.height,
      height: dimensions.width
    });
    setDimensions({
      width: dimensions.height,
      height: dimensions.width
    });
  };

  const handleRemove = () => {
    if (logo.imageUrl) {
      URL.revokeObjectURL(logo.imageUrl);
    }
    onUpdateLogo({ 
      imageUrl: undefined,
      aspectRatio: undefined,
      rotation: 0,
      width: logo.size,
      height: logo.size
    });
    setDimensions({
      width: logo.size,
      height: logo.size
    });
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;

    const aspectRatio = logo.aspectRatio || 1;
    let newWidth = dimensions.width;
    let newHeight = dimensions.height;

    if (dimension === 'width') {
      newWidth = numValue;
      newHeight = logo.aspectRatio ? numValue / aspectRatio : numValue;
    } else {
      newHeight = numValue;
      newWidth = logo.aspectRatio ? numValue * aspectRatio : numValue;
    }

    setDimensions({
      width: newWidth,
      height: newHeight
    });

    onUpdateLogo({
      width: newWidth,
      height: newHeight
    });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const newPosition = {
      ...position,
      [axis]: numValue
    };

    setPosition(newPosition);
    onUpdateLogo({
      position: newPosition
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload PNG Logo
        </button>
        {logo.imageUrl && (
          <>
            <button
              onClick={handleRotate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              title="Rotate 90° clockwise"
            >
              <RotateCw className="w-4 h-4" />
              Rotate
            </button>
            <button
              onClick={handleRemove}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".png"
        onChange={handleFileChange}
        className="hidden"
      />
      {logo.imageUrl && (
        <>
          <div className="relative w-32 h-32 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <img
              src={logo.imageUrl}
              alt="Logo preview"
              className="w-full h-full object-contain"
              style={{
                transform: `rotate(${logo.rotation || 0}deg)`
              }}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Move className="w-4 h-4" />
                Position (mm)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    X Position
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={position.x.toFixed(1)}
                      onChange={(e) => handlePositionChange('x', e.target.value)}
                      step="0.1"
                      className="block w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 pr-12"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">mm</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Y Position
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={position.y.toFixed(1)}
                      onChange={(e) => handlePositionChange('y', e.target.value)}
                      step="0.1"
                      className="block w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 pr-12"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">mm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Ruler className="w-4 h-4" />
                Dimensions (mm)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Width
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={dimensions.width.toFixed(1)}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                      step="0.1"
                      min="1"
                      className="block w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 pr-12"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">mm</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Height
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={dimensions.height.toFixed(1)}
                      onChange={(e) => handleDimensionChange('height', e.target.value)}
                      step="0.1"
                      min="1"
                      className="block w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 pr-12"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">mm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}