import React, { useState } from 'react';
import { Edit, Download, Settings, Copy, Plus, Trash2, Search, X, CheckSquare, Square, ArrowLeft } from 'lucide-react';
import type { Label, PDFSettings, EditingState } from '../types';
import { LabelEditor } from './LabelEditor';
import { PageSettingsModal } from './PageSettingsModal';
import { LabelPreview } from './LabelPreview';
import { ProgressIndicator } from './ProgressIndicator';
import { usePdfExport } from '../hooks/usePdfExport';

interface GeneratedLabelsProps {
  labels: Label[];
  onUpdateLabels: (labels: Label[]) => void;
  pdfSettings: PDFSettings;
  onUpdatePdfSettings: (settings: PDFSettings) => void;
  onRestart: () => void;
}

export function GeneratedLabels({
  labels,
  onUpdateLabels,
  pdfSettings,
  onUpdatePdfSettings,
  onRestart
}: GeneratedLabelsProps) {
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    selectedLabels: [],
    editingAll: false,
    editingLabelId: null
  });
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { exportToPDF, progress, cancelExport } = usePdfExport();

  const handleLabelUpdate = (updatedLabel: Label) => {
    const newLabels = labels.map(label => {
      // If editing all labels
      if (editingState.editingAll) {
        return {
          ...label,
          elements: {
            qrCode: {
              ...updatedLabel.elements.qrCode,
              position: label.elements.qrCode.position
            },
            uuid: {
              ...updatedLabel.elements.uuid,
              position: label.elements.uuid.position
            },
            text: {
              ...updatedLabel.elements.text,
              position: label.elements.text.position
            },
            companyName: {
              ...updatedLabel.elements.companyName,
              position: label.elements.companyName.position
            },
            productName: {
              ...updatedLabel.elements.productName,
              position: label.elements.productName.position
            },
            logo: {
              ...updatedLabel.elements.logo,
              position: label.elements.logo.position
            }
          },
          size: updatedLabel.size,
          companyName: updatedLabel.companyName,
          text: updatedLabel.text,
          prefix: updatedLabel.prefix,
          shortUuid: label.uuid.substring(0, updatedLabel.shortUuid.length),
          productName: label.productName // Preserve original product name
        };
      }
      
      // If editing selected labels
      if (editingState.selectedLabels.includes(label.id) && !editingState.editingAll) {
        // If this is the label being directly edited
        if (label.id === updatedLabel.id) {
          return {
            ...updatedLabel,
            productName: label.productName // Preserve original product name
          };
        }
        
        // For other selected labels
        return {
          ...label,
          elements: {
            qrCode: {
              ...updatedLabel.elements.qrCode,
              position: label.elements.qrCode.position
            },
            uuid: {
              ...updatedLabel.elements.uuid,
              position: label.elements.uuid.position
            },
            text: {
              ...updatedLabel.elements.text,
              position: label.elements.text.position
            },
            companyName: {
              ...updatedLabel.elements.companyName,
              position: label.elements.companyName.position
            },
            productName: {
              ...updatedLabel.elements.productName,
              position: label.elements.productName.position
            },
            logo: {
              ...updatedLabel.elements.logo,
              position: label.elements.logo.position
            }
          },
          size: updatedLabel.size,
          companyName: updatedLabel.companyName,
          text: updatedLabel.text,
          prefix: updatedLabel.prefix,
          shortUuid: label.uuid.substring(0, updatedLabel.shortUuid.length),
          productName: label.productName // Preserve original product name
        };
      }
      
      // If editing single label
      if (label.id === updatedLabel.id && !editingState.editingAll && editingState.selectedLabels.length === 1) {
        return {
          ...updatedLabel,
          productName: label.productName // Preserve original product name
        };
      }

      return label;
    });

    onUpdateLabels(newLabels);
  };

  const handleProductNameChange = (labelId: string, productName: string) => {
    const newLabels = labels.map(label => 
      label.id === labelId ? { ...label, productName } : label
    );
    onUpdateLabels(newLabels);
  };

  const toggleLabelSelection = (labelId: string) => {
    setEditingState(prev => ({
      ...prev,
      selectedLabels: prev.selectedLabels.includes(labelId) ?
        prev.selectedLabels.filter(id => id !== labelId) :
        [...prev.selectedLabels, labelId]
    }));
  };

  const toggleAllLabels = () => {
    setEditingState(prev => ({
      ...prev,
      selectedLabels: prev.selectedLabels.length === labels.length ? [] : labels.map(l => l.id)
    }));
  };

  const duplicateLabel = (label: Label) => {
    const newUuid = crypto.randomUUID();
    const newLabel = JSON.parse(JSON.stringify(label)); // Deep clone
    
    newLabel.id = crypto.randomUUID();
    newLabel.uuid = newUuid;
    newLabel.shortUuid = newUuid.substring(0, label.shortUuid.length);
    
    onUpdateLabels([...labels, newLabel]);
  };

  const duplicateSelectedLabels = () => {
    const selectedLabels = labels.filter(label => 
      editingState.selectedLabels.includes(label.id)
    );
    
    const newLabels = selectedLabels.map(label => {
      const newUuid = crypto.randomUUID();
      const clonedLabel = JSON.parse(JSON.stringify(label)); // Deep clone
      
      clonedLabel.id = crypto.randomUUID();
      clonedLabel.uuid = newUuid;
      clonedLabel.shortUuid = newUuid.substring(0, label.shortUuid.length);
      
      return clonedLabel;
    });

    onUpdateLabels([...labels, ...newLabels]);
    setEditingState(prev => ({ ...prev, selectedLabels: [] }));
  };

  const deleteSelectedLabels = () => {
    const newLabels = labels.filter(label => 
      !editingState.selectedLabels.includes(label.id)
    );
    onUpdateLabels(newLabels);
    setEditingState(prev => ({ ...prev, selectedLabels: [] }));
  };

  const startEditing = (labelId?: string) => {
    if (labelId) {
      // Edit single label
      setEditingState({
        isEditing: true,
        selectedLabels: [labelId],
        editingAll: false,
        editingLabelId: labelId
      });
    } else if (editingState.selectedLabels.length > 0) {
      // Edit selected labels
      setEditingState(prev => ({
        ...prev,
        isEditing: true,
        editingAll: false,
        editingLabelId: prev.selectedLabels[0]
      }));
    } else {
      // Edit all labels
      setEditingState({
        isEditing: true,
        selectedLabels: labels.map(l => l.id),
        editingAll: true,
        editingLabelId: labels[0].id
      });
    }
  };

  const stopEditing = () => {
    setEditingState({
      isEditing: false,
      selectedLabels: [],
      editingAll: false,
      editingLabelId: null
    });
  };

  const handleExportPdf = () => {
    const selectedLabels = editingState.selectedLabels.length > 0 
      ? labels.filter(label => editingState.selectedLabels.includes(label.id))
      : labels;
    exportToPDF(selectedLabels, pdfSettings);
  };

  const handlePdfTypeChange = (type: 'single' | 'multiple') => {
    if (type === 'multiple' && !pdfSettings.pageSettings) {
      onUpdatePdfSettings({
        ...pdfSettings,
        type,
        pageSettings: {
          width: 210,
          height: 297,
          unit: 'mm',
          marginTop: 10,
          marginRight: 10,
          marginBottom: 10,
          marginLeft: 10,
          spacing: 2
        }
      });
      setShowPageSettings(true);
    } else {
      onUpdatePdfSettings({ ...pdfSettings, type });
    }
  };

  const filteredLabels = searchTerm
    ? labels.filter(label => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (label.productName || '').toLowerCase().includes(searchLower) ||
          (label.shortUuid || '').toLowerCase().includes(searchLower) ||
          (label.companyName || '').toLowerCase().includes(searchLower) ||
          (label.text || '').toLowerCase().includes(searchLower)
        );
      })
    : labels;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Create new labels"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">New Labels</span>
              </button>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Generated Labels
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm">
                  {labels.length} labels
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleAllLabels}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {editingState.selectedLabels.length === labels.length ? (
                  <Square className="w-4 h-4 mr-2" />
                ) : (
                  <CheckSquare className="w-4 h-4 mr-2" />
                )}
                {editingState.selectedLabels.length === labels.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => startEditing()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit All
              </button>
              {editingState.selectedLabels.length > 0 && (
                <>
                  <button
                    onClick={() => startEditing(editingState.selectedLabels[0])}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Selected ({editingState.selectedLabels.length})
                  </button>
                  <button
                    onClick={duplicateSelectedLabels}
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate ({editingState.selectedLabels.length})
                  </button>
                  <button
                    onClick={deleteSelectedLabels}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search and Export Controls */}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search labels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={pdfSettings.type}
                onChange={(e) => handlePdfTypeChange(e.target.value as 'single' | 'multiple')}
                className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="single">One Label per Page</option>
                <option value="multiple">Multiple Labels per Page</option>
              </select>
              {pdfSettings.type === 'multiple' && (
                <button
                  onClick={() => setShowPageSettings(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Page Settings
                </button>
              )}
              <button
                onClick={handleExportPdf}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export to PDF
              </button>
            </div>
          </div>
        </div>

        {/* Labels Grid */}
        <div className="p-6 bg-gray-50 dark:bg-gray-950">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLabels.map((label) => (
              <div 
                key={label.id} 
                className={`bg-white dark:bg-gray-900 rounded-lg overflow-hidden transition-all hover:scale-[1.02] ${
                  editingState.selectedLabels.includes(label.id) 
                    ? 'ring-2 ring-blue-500' 
                    : 'hover:ring-1 hover:ring-gray-200 dark:hover:ring-gray-700'
                }`}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={editingState.selectedLabels.includes(label.id)}
                        onChange={() => toggleLabelSelection(label.id)}
                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
                        {label.shortUuid}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => duplicateLabel(label)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        title="Duplicate label"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEditing(label.id)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        title="Edit label"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={label.productName || ''}
                    onChange={(e) => handleProductNameChange(label.id, e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product name"
                  />
                </div>
                <div className="p-4 flex items-center justify-center bg-white dark:bg-gray-900 rounded-b-lg">
                  <div className="transform scale-[0.8]">
                    <LabelPreview label={label} />
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Label Button */}
            <button
              onClick={() => duplicateLabel(labels[0])}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
            >
              <Plus className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-2 transition-colors group-hover:text-blue-500" />
              <span className="text-gray-500 dark:text-gray-400 group-hover:text-blue-500">Add New Label</span>
            </button>
          </div>
        </div>
      </div>

      {editingState.isEditing && editingState.editingLabelId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-[1000px] h-[90vh] flex flex-col relative">
            <button
              onClick={stopEditing}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
            <LabelEditor
              label={labels.find(l => l.id === editingState.editingLabelId)!}
              onUpdate={handleLabelUpdate}
              onClose={stopEditing}
            />
          </div>
        </div>
      )}

      {showPageSettings && pdfSettings.pageSettings && (
        <PageSettingsModal
          settings={pdfSettings.pageSettings}
          onUpdate={(newSettings) => {
            onUpdatePdfSettings({
              ...pdfSettings,
              pageSettings: newSettings
            });
          }}
          onClose={() => setShowPageSettings(false)}
        />
      )}

      <ProgressIndicator 
        progress={progress.current}
        total={progress.total}
        estimatedTimeRemaining={progress.estimatedTimeRemaining}
        isVisible={progress.isVisible}
        onCancel={cancelExport}
      />
    </div>
  );
}