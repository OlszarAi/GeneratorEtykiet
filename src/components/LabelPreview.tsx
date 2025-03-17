import React from 'react';
import QRCode from 'qrcode.react';
import type { Label } from '../types';
import { getScaleFactor } from '../utils';

interface LabelPreviewProps {
  label: Label;
}

export function LabelPreview({ label }: LabelPreviewProps) {
  const scale = getScaleFactor(label.size.unit);
  
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
    >
      {label.elements.qrCode.enabled && (
        <div style={{
          position: 'absolute',
          left: `${label.elements.qrCode.position.x * scale}px`,
          top: `${label.elements.qrCode.position.y * scale}px`
        }}>
          <QRCode 
            value={`${label.prefix}${label.uuid}`} 
            size={label.elements.qrCode.size}
            fgColor={label.elements.qrCode.color || '#000000'}
            className="rounded-sm"
          />
        </div>
      )}
      
      {label.elements.uuid.enabled && (
        <div style={{
          position: 'absolute',
          left: `${label.elements.uuid.position.x * scale}px`,
          top: `${label.elements.uuid.position.y * scale}px`,
          fontSize: `${label.elements.uuid.size}px`,
          color: label.elements.uuid.color || '#000000'
        }}>
          <p className="font-mono">{label.shortUuid}</p>
        </div>
      )}

      {label.elements.text.enabled && (
        <div style={{
          position: 'absolute',
          left: `${label.elements.text.position.x * scale}px`,
          top: `${label.elements.text.position.y * scale}px`,
          fontSize: `${label.elements.text.size}px`,
          maxWidth: label.elements.text.textStyle.maxWidth ? 
            `${label.elements.text.textStyle.maxWidth * scale}px` : 
            undefined,
          width: label.elements.text.textStyle.multiline ? 
            `${(label.elements.text.textStyle.maxWidth || label.size.width - label.elements.text.position.x) * scale}px` : 
            'auto',
          wordBreak: 'break-word',
          whiteSpace: label.elements.text.textStyle.multiline ? 'pre-wrap' : 'nowrap',
          overflow: 'hidden',
          textAlign: label.elements.text.textStyle.align,
          color: label.elements.text.textStyle.color || '#000000'
        }}>
          <p className="font-bold">{label.text}</p>
        </div>
      )}
      
      {label.elements.companyName.enabled && (
        <div style={{
          position: 'absolute',
          left: `${label.elements.companyName.position.x * scale}px`,
          top: `${label.elements.companyName.position.y * scale}px`,
          fontSize: `${label.elements.companyName.size}px`,
          maxWidth: label.elements.companyName.textStyle.maxWidth ? 
            `${label.elements.companyName.textStyle.maxWidth * scale}px` : 
            undefined,
          width: label.elements.companyName.textStyle.multiline ? 
            `${(label.elements.companyName.textStyle.maxWidth || label.size.width - label.elements.companyName.position.x) * scale}px` : 
            'auto',
          wordBreak: 'break-word',
          whiteSpace: label.elements.companyName.textStyle.multiline ? 'pre-wrap' : 'nowrap',
          overflow: 'hidden',
          textAlign: label.elements.companyName.textStyle.align,
          color: label.elements.companyName.textStyle.color || '#000000'
        }}>
          <p className="font-bold">{label.companyName}</p>
        </div>
      )}
      
      {label.elements.productName.enabled && (
        <div style={{
          position: 'absolute',
          left: `${label.elements.productName.position.x * scale}px`,
          top: `${label.elements.productName.position.y * scale}px`,
          fontSize: `${label.elements.productName.size}px`,
          maxWidth: label.elements.productName.textStyle.maxWidth ? 
            `${label.elements.productName.textStyle.maxWidth * scale}px` : 
            undefined,
          width: label.elements.productName.textStyle.multiline ? 
            `${(label.elements.productName.textStyle.maxWidth || label.size.width - label.elements.productName.position.x) * scale}px` : 
            'auto',
          wordBreak: 'break-word',
          whiteSpace: label.elements.productName.textStyle.multiline ? 'pre-wrap' : 'nowrap',
          overflow: 'hidden',
          textAlign: label.elements.productName.textStyle.align,
          color: label.elements.productName.textStyle.color || '#000000'
        }}>
          <p className="font-bold">{label.productName}</p>
        </div>
      )}
    </div>
  );
}