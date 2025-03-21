import React from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface TextStyle {
  align: 'left' | 'center' | 'right';
  multiline: boolean;
  maxWidth?: number;
  color: string;
  lineHeight: number;
  width?: number;
  height?: number;
  rotation: number;
}

export interface ElementStyle {
  position: Position;
  size: number;
  width?: number;
  height?: number;
  textStyle?: TextStyle;
  enabled: boolean;
  color?: string;
  isResizing?: boolean;
  resizeDirection?: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;
  rotation: number;
}

export interface LogoStyle extends ElementStyle {
  imageUrl?: string;
  aspectRatio?: number;
}

export interface LabelSize {
  width: number;
  height: number;
  unit: 'mm' | 'cm' | 'in';
  padding: number;
  elementSpacing: number;
  preventCollisions: boolean;
  allowElementsOutside: boolean;
  border: {
    enabled: boolean;
    width: number;
    color: string;
  };
}

export interface LabelElements {
  qrCode: ElementStyle;
  uuid: ElementStyle;
  companyName: ElementStyle & { textStyle: TextStyle };
  productName: ElementStyle & { textStyle: TextStyle };
  text: ElementStyle & { textStyle: TextStyle };
  logo: LogoStyle;
}

export interface Label {
  id: string;
  size: LabelSize;
  elements: LabelElements;
  companyName: string;
  uuid: string;
  shortUuid: string;
  prefix: string;
  productName: string;
  text: string;
}

export interface PageSettings {
  width: number;
  height: number;
  unit: 'mm' | 'cm';
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  spacing: number;
}

export interface PDFSettings {
  type: 'single' | 'multiple';
  labelsPerPage?: number;
  pageSettings?: PageSettings;
}

export interface ElementBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface EditingState {
  isEditing: boolean;
  selectedLabels: string[];
  editingAll: boolean;
  editingLabelId: string | null;
}

export interface ValidationError {
  message: string;
  min?: number;
  max?: number;
}

export interface ElementValidation {
  position: {
    x: ValidationError | null;
    y: ValidationError | null;
  };
  size: ValidationError | null;
}