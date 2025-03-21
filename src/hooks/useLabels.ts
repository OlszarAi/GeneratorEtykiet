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
      // Generate unique IDs for each label
      const id = crypto.randomUUID();
      const uuid = crypto.randomUUID();
      const shortUuid = uuid.substring(0, uuidLength);
      
      // Create a completely new elements object for each label
      const clonedElements = JSON.parse(JSON.stringify(elements));
      
      // Create a completely new size object for each label
      const clonedSize = JSON.parse(JSON.stringify(labelSize));
      
      return {
        id,
        size: clonedSize,
        elements: clonedElements,
        companyName,
        uuid,
        shortUuid,
        prefix,
        productName: '',
        text: ''
      };
    });
    
    setLabels(newLabels);
    return newLabels;
  };

  const updateLabel = (updatedLabel: Label) => {
    setLabels(prevLabels => 
      prevLabels.map(label => {
        if (label.id !== updatedLabel.id) {
          return label;
        }
        
        // Create a completely new label object with deep cloning
        return JSON.parse(JSON.stringify(updatedLabel));
      })
    );
  };

  const updateAllLabels = (updates: Partial<Label>) => {
    setLabels(prevLabels => 
      prevLabels.map(label => {
        // Create a new label object
        const newLabel = { ...label };
        
        // Apply updates while preserving unique properties
        if (updates.elements) {
          newLabel.elements = JSON.parse(JSON.stringify(updates.elements));
        }
        if (updates.size) {
          newLabel.size = JSON.parse(JSON.stringify(updates.size));
        }
        if (updates.companyName !== undefined) {
          newLabel.companyName = updates.companyName;
        }
        if (updates.text !== undefined) {
          newLabel.text = updates.text;
        }
        if (updates.prefix !== undefined) {
          newLabel.prefix = updates.prefix;
        }
        
        // Always preserve unique identifiers
        newLabel.id = label.id;
        newLabel.uuid = label.uuid;
        newLabel.shortUuid = label.shortUuid;
        
        return newLabel;
      })
    );
  };

  const updateSelectedLabels = (selectedIds: string[], updates: Partial<Label>) => {
    setLabels(prevLabels => 
      prevLabels.map(label => {
        if (!selectedIds.includes(label.id)) {
          return label;
        }
        
        // Create a new label object
        const newLabel = { ...label };
        
        // Apply updates while preserving unique properties
        if (updates.elements) {
          // Deep clone elements but preserve positions
          const clonedElements = JSON.parse(JSON.stringify(updates.elements));
          Object.keys(clonedElements).forEach(key => {
            if (clonedElements[key].position) {
              clonedElements[key].position = { ...label.elements[key].position };
            }
          });
          newLabel.elements = clonedElements;
        }
        if (updates.size) {
          newLabel.size = JSON.parse(JSON.stringify(updates.size));
        }
        if (updates.companyName !== undefined) {
          newLabel.companyName = updates.companyName;
        }
        if (updates.text !== undefined) {
          newLabel.text = updates.text;
        }
        if (updates.prefix !== undefined) {
          newLabel.prefix = updates.prefix;
        }
        
        // Always preserve unique identifiers
        newLabel.id = label.id;
        newLabel.uuid = label.uuid;
        newLabel.shortUuid = label.shortUuid;
        
        return newLabel;
      })
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