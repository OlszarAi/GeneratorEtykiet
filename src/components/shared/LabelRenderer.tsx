import React from 'react';
import QRCode from 'qrcode.react';
import type { Label, LabelElements } from '../../types';
import { getScaleFactor } from '../../utils';

interface LabelRendererProps {
  label: Label;
  isEditor?: boolean;
  onElementSelect?: (elementKey: keyof LabelElements | null) => void;
  onElementMouseDown?: (e: React.MouseEvent, elementKey: keyof LabelElements, resizeDirection?: string) => void;
  selectedElement?: keyof LabelElements | null;
  showResizeHandles?: boolean;
}

export function LabelRenderer({
  label,
  isEditor = false,
  onElementSelect,
  onElementMouseDown,
  selectedElement,
  showResizeHandles
}: LabelRendererProps) {
  const scale = getScaleFactor(label.size.unit);

  const renderResizeHandles = (elementKey: keyof LabelElements) => {
    if (!showResizeHandles || !label.elements[elementKey].textStyle?.multiline) return null;

    return (
      <>
        <div className="resize-border resize-border-n" onMouseDown={(e) => onElementMouseDown?.(e, elementKey, 'n')} />
        <div className="resize-border resize-border-s" onMouseDown={(e) => onElementMouseDown?.(e, elementKey, 's')} />
        <div className="resize-border resize-border-e" onMouseDown={(e) => onElementMouseDown?.(e, elementKey, 'e')} />
        <div className="resize-border resize-border-w" onMouseDown={(e) => onElementMouseDown?.(e, elementKey, 'w')} />
        
        <div className="resize-corner resize-corner-nw" onMouseDown={(e) => onElementMouseDown?.(e, elementKey, 'nw')} />
        <div className="resize-corner resize-corner-ne" onMouseDown={(e) => onElementMouseDown?.(e, elementKey, 'ne')} />
        <div className="resize-corner resize-corner-sw" onMouseDown={(e) => onElementMouseDown?.(e, elementKey, 'sw')} />
        <div className="resize-corner resize-corner-se" onMouseDown={(e) => onElementMouseDown?.(e, elementKey, 'se')} />
      </>
    );
  };

  const renderElement = (elementKey: keyof LabelElements) => {
    const element = label.elements[elementKey];
    if (!element.enabled) return null;

    const isSelected = selectedElement === elementKey;
    const rotation = element.textStyle?.rotation || element.rotation || 0;

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${element.position.x * scale}px`,
      top: `${element.position.y * scale}px`,
      margin: '0',
      padding: '0',
      lineHeight: '0',
      height: `${element.size}px`,
      display: 'block',
      transform: rotation ? `rotate(${rotation}deg)` : undefined,
      transformOrigin: 'center center',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      textRendering: 'optimizeLegibility'
    };

    if (elementKey === 'logo' && (element as any).imageUrl) {
      const logo = element as any;
      return (
        <div
          key={elementKey}
          className={isEditor ? `resizable-text ${isSelected ? 'resizing' : ''}` : 'label-element'}
          style={{
            ...baseStyle,
            width: `${logo.width * scale}px`,
            height: `${logo.height * scale}px`
          }}
          onClick={isEditor ? (e) => {
            e.stopPropagation();
            onElementSelect?.(elementKey);
          } : undefined}
          onMouseDown={isEditor ? (e) => onElementMouseDown?.(e, elementKey) : undefined}
        >
          <img
            src={logo.imageUrl}
            alt="Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: `rotate(${logo.rotation || 0}deg)`,
              imageRendering: 'crisp-edges'
            }}
          />
          {isEditor && isSelected && renderResizeHandles(elementKey)}
        </div>
      );
    }

    const textStyle: React.CSSProperties = {
      fontSize: `${element.size}px`,
      lineHeight: element.textStyle?.lineHeight?.toString() || '1',
      color: element.textStyle?.color || element.color || '#000000',
      margin: '0',
      padding: '0',
      fontFamily: elementKey === 'uuid' ? 
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' : 
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '400',
      display: 'block',
      whiteSpace: 'pre',
      letterSpacing: 'normal',
      textRendering: 'geometricPrecision',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    };

    if (element.textStyle) {
      if (element.textStyle.multiline) {
        textStyle.width = `${element.textStyle.width * scale}px`;
        textStyle.whiteSpace = 'pre-wrap';
        textStyle.wordBreak = 'break-word';
        baseStyle.width = textStyle.width;
        
        if (element.textStyle.height) {
          baseStyle.height = `${element.textStyle.height * scale}px`;
          textStyle.height = '100%';
        }
      }

      textStyle.textAlign = element.textStyle.align;

      if (!element.textStyle.multiline) {
        if (element.textStyle.align === 'center') {
          baseStyle.transform = rotation ? 
            `translateX(-50%) rotate(${rotation}deg)` : 
            'translateX(-50%)';
          baseStyle.left = `${(element.position.x + (element.width || element.size) / 2) * scale}px`;
        } else if (element.textStyle.align === 'right') {
          baseStyle.transform = rotation ? 
            `translateX(-100%) rotate(${rotation}deg)` : 
            'translateX(-100%)';
          baseStyle.left = `${(element.position.x + (element.width || element.size)) * scale}px`;
        }
      }
    }

    const wrapperClassName = isEditor ? 
      `resizable-text ${isSelected ? 'resizing' : ''}` : 
      'label-element';

    return (
      <div
        key={elementKey}
        className={wrapperClassName}
        style={baseStyle}
        onClick={isEditor ? (e) => {
          e.stopPropagation();
          onElementSelect?.(elementKey);
        } : undefined}
        onMouseDown={isEditor ? (e) => onElementMouseDown?.(e, elementKey) : undefined}
      >
        {elementKey === 'qrCode' ? (
          <QRCode
            value={`${label.prefix}${label.uuid}`}
            size={element.size}
            fgColor={element.color || '#000000'}
            className="rounded-sm"
            renderAs="svg"
          />
        ) : (
          <div style={textStyle}>
            {elementKey === 'uuid' ? label.shortUuid :
             elementKey === 'text' ? label.text :
             elementKey === 'companyName' ? label.companyName :
             label.productName}
          </div>
        )}
        {isEditor && isSelected && renderResizeHandles(elementKey)}
      </div>
    );
  };

  return (
    <div 
      className="relative bg-white rounded-lg overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.1),0_6px_16px_rgba(0,0,0,0.1)]" 
      style={{
        width: `${label.size.width * scale}px`,
        height: `${label.size.height * scale}px`,
        ...(label.size.border.enabled && {
          border: `${label.size.border.width * scale}px solid ${label.size.border.color}`
        })
      }}
      onClick={isEditor ? () => onElementSelect?.(null) : undefined}
    >
      {Object.keys(label.elements).map((key) => renderElement(key as keyof LabelElements))}
    </div>
  );
}