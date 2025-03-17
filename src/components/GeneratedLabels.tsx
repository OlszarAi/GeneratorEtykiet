import React, { useState } from 'react';
import { Edit, Download, Settings, Copy, Plus, Trash2, Search } from 'lucide-react';
import type { Label, PDFSettings, EditingState, PageSettings } from '../types';
import { LabelEditor } from './LabelEditor';
import { PageSettingsModal } from './PageSettingsModal';
import { LabelPreview } from './LabelPreview';

interface GeneratedLabelsProps {
  labels: Label[];
  onUpdateLabels: (labels: Label[]) => void;
  pdfSettings: PDFSettings;
  onUpdatePdfSettings: (settings: PDFSettings) => void;
  onExportPdf: (selectedLabels: Label[]) => void;
  onRestart: () => void;
}

export function GeneratedLabels({
  labels,
  onUpdateLabels,
  pdfSettings,
  onUpdatePdfSettings,
  onExportPdf,
  onRestart
}: GeneratedLabelsProps) {
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    selectedLabels: [],
    editingAll: false
  });
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const defaultPageSettings: PageSettings = {
    width: 210,
    height: 297,
    unit: 'mm',
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 10,
    spacing: 2
  };

  const handleLabelUpdate = (updatedLabel: Label) => {
    const newLabels = labels.map(label => 
      label.id === updatedLabel.id ? updatedLabel : label
    );
    onUpdateLabels(newLabels);
  };

  const handleBulkUpdate = (updatedLabel: Label) => {
    const newLabels = labels.map(label => {
      if (editingState.selectedLabels.includes(label.id) || editingState.editingAll) {
        return {
          ...label,
          elements: updatedLabel.elements,
          size: updatedLabel.size,
          companyName: updatedLabel.companyName,
          text: updatedLabel.text,
          prefix: updatedLabel.prefix,
          shortUuid: updatedLabel.shortUuid.substring(0, updatedLabel.shortUuid.length),
          productName: label.productName
        };
      }
      return label;
    });
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

  const duplicateLabel = (label: Label) => {
    const newLabel = {
      ...label,
      id: crypto.randomUUID(),
      uuid: crypto.randomUUID(),
      shortUuid: crypto.randomUUID().substring(0, label.shortUuid.length)
    };
    onUpdateLabels([...labels, newLabel]);
  };

  const duplicateSelectedLabels = () => {
    const selectedLabels = labels.filter(label => 
      editingState.selectedLabels.includes(label.id)
    );
    
    const newLabels = selectedLabels.map(label => ({
      ...label,
      id: crypto.randomUUID(),
      uuid: crypto.randomUUID(),
      shortUuid: crypto.randomUUID().substring(0, label.shortUuid.length)
    }));

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
      setEditingState({
        isEditing: true,
        selectedLabels: [labelId],
        editingAll: false
      });
    } else if (editingState.selectedLabels.length > 0) {
      setEditingState(prev => ({
        ...prev,
        isEditing: true,
        editingAll: false
      }));
    } else {
      setEditingState({
        isEditing: true,
        selectedLabels: [],
        editingAll: true
      });
    }
  };

  const stopEditing = () => {
    setEditingState({
      isEditing: false,
      selectedLabels: [],
      editingAll: false
    });
  };

  const handleExportPdf = () => {
    const selectedLabels = editingState.selectedLabels.length > 0 
      ? labels.filter(label => editingState.selectedLabels.includes(label.id))
      : labels;
    onExportPdf(selectedLabels);
  };

  const handlePdfTypeChange = (type: 'single' | 'multiple') => {
    if (type === 'multiple' && !pdfSettings.pageSettings) {
      onUpdatePdfSettings({
        ...pdfSettings,
        type,
        pageSettings: defaultPageSettings
      });
      setShowPageSettings(true);
    } else {
      onUpdatePdfSettings({ ...pdfSettings, type });
    }
  };

  const handleUpdateCompanyName = (companyName: string) => {
    if (editingState.editingAll) {
      const newLabels = labels.map(label => ({
        ...label,
        companyName
      }));
      onUpdateLabels(newLabels);
    } else if (editingState.selectedLabels.length > 0) {
      const newLabels = labels.map(label => 
        editingState.selectedLabels.includes(label.id) ? {
          ...label,
          companyName
        } : label
      );
      onUpdateLabels(newLabels);
    }
  };

  const handleUpdateText = (text: string) => {
    if (editingState.editingAll) {
      const newLabels = labels.map(label => ({
        ...label,
        text
      }));
      onUpdateLabels(newLabels);
    } else if (editingState.selectedLabels.length > 0) {
      const newLabels = labels.map(label => 
        editingState.selectedLabels.includes(label.id) ? {
          ...label,
          text
        } : label
      );
      onUpdateLabels(newLabels);
    }
  };

  const handleUpdatePrefix = (prefix: string) => {
    if (editingState.editingAll) {
      const newLabels = labels.map(label => ({
        ...label,
        prefix
      }));
      onUpdateLabels(newLabels);
    } else if (editingState.selectedLabels.length > 0) {
      const newLabels = labels.map(label => 
        editingState.selectedLabels.includes(label.id) ? {
          ...label,
          prefix
        } : label
      );
      onUpdateLabels(newLabels);
    }
  };

  const handleUpdateUuidLength = (length: number) => {
    if (editingState.editingAll) {
      const newLabels = labels.map(label => ({
        ...label,
        shortUuid: label.uuid.substring(0, length)
      }));
      onUpdateLabels(newLabels);
    } else if (editingState.selectedLabels.length > 0) {
      const newLabels = labels.map(label => 
        editingState.selectedLabels.includes(label.id) ? {
          ...label,
          shortUuid: label.uuid.substring(0, length)
        } : label
      );
      onUpdateLabels(newLabels);
    }
  };

  const filteredLabels = searchTerm
    ? labels.filter(label => 
        label.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        label.shortUuid.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : labels;

  return (
    <div className="generated-labels">
      <div className="labels-container">
        {/* Header */}
        <div className="labels-header">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Generated Labels
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm">
                {labels.length} labels
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
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
                className="search-input"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={pdfSettings.type}
                onChange={(e) => handlePdfTypeChange(e.target.value as 'single' | 'multiple')}
                className="dropdown-select"
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
        <div className="labels-grid">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLabels.map((label) => (
              <div 
                key={label.id} 
                className={`label-card ${
                  editingState.selectedLabels.includes(label.id) 
                    ? 'label-card-selected' 
                    : 'hover:ring-1 hover:ring-gray-200 dark:hover:ring-gray-700'
                }`}
              >
                <div className="label-card-header">
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
                    value={label.productName}
                    onChange={(e) => handleLabelUpdate({ ...label, productName: e.target.value })}
                    className="label-input"
                    placeholder="Enter product name"
                  />
                </div>
                <div className="label-card-preview">
                  <div className="transform scale-[0.8]">
                    <LabelPreview label={label} />
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Label Button */}
            <button
              onClick={() => duplicateLabel(labels[0])}
              className="add-label-button"
            >
              <Plus />
              <span>Add New Label</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onRestart}
          className="create-new-button"
        >
          Create New Labels
        </button>
      </div>

      {editingState.isEditing && (
        <LabelEditor
          label={editingState.editingAll ? labels[0] : 
            labels.find(l => l.id === editingState.selectedLabels[0])!}
          onUpdate={editingState.editingAll || editingState.selectedLabels.length > 1 ? 
            handleBulkUpdate : 
            handleLabelUpdate}
          onUpdateCompanyName={handleUpdateCompanyName}
          onUpdateText={handleUpdateText}
          onUpdatePrefix={handleUpdatePrefix}
          onUpdateUuidLength={handleUpdateUuidLength}
          onClose={stopEditing}
        />
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
    </div>
  );
}