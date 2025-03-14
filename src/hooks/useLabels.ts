import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Label, LabelSize, LabelElements } from '../types';

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([]);

  const generateLabels = (
    quantity: number,
    labelSize: LabelSize,
    elements: LabelElements,
    companyName: string,
    prefix: string,
    uuidLength: number
  ) => {
    const newLabels = Array.from({ length: quantity }, () => {
      const fullUuid = uuidv4();
      const shortUuid = fullUuid.substring(0, uuidLength);
      
      return {
        id: uuidv4(),
        size: labelSize,
        elements,
        companyName,
        uuid: fullUuid,
        shortUuid,
        prefix,
        productName: ''
      };
    });
    
    setLabels(newLabels);
    return newLabels;
  };

  const updateLabel = (updatedLabel: Label) => {
    setLabels(prevLabels => 
      prevLabels.map(label => 
        label.id === updatedLabel.id ? updatedLabel : label
      )
    );
  };

  const updateAllLabels = (updates: Partial<Label>) => {
    setLabels(prevLabels => 
      prevLabels.map(label => ({
        ...label,
        ...updates
      }))
    );
  };

  const updateSelectedLabels = (selectedIds: string[], updates: Partial<Label>) => {
    setLabels(prevLabels => 
      prevLabels.map(label => 
        selectedIds.includes(label.id) ? { ...label, ...updates } : label
      )
    );
  };

  return {
    labels,
    setLabels,
    generateLabels,
    updateLabel,
    updateAllLabels,
    updateSelectedLabels
  };
}