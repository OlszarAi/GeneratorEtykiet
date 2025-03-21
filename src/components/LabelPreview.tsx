import React from 'react';
import { LabelRenderer } from './shared/LabelRenderer';
import type { Label } from '../types';

interface LabelPreviewProps {
  label: Label;
}

export function LabelPreview({ label }: LabelPreviewProps) {
  return <LabelRenderer label={label} />;
}