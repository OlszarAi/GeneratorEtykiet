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

  const filteredLabels = searchTerm
    ? labels.filter(label => 
        label.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        label.shortUuid.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : labels;

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">
                Generated Labels
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 text-sm">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search labels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={pdfSettings.type}
                onChange={(e) => handlePdfTypeChange(e.target.value as 'single' | 'multiple')}
                className="rounded-lg bg-gray-800 border-gray-700 text-gray-200 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="p-6 bg-gray-950">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLabels.map((label) => (
              <div 
                key={label.id} 
                className={`bg-gray-900 rounded-lg overflow-hidden transition-all hover:scale-[1.02] ${
                  editingState.selectedLabels.includes(label.id) 
                    ? 'ring-2 ring-blue-500' 
                    : 'hover:ring-1 hover:ring-gray-700'
                }`}
              >
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={editingState.selectedLabels.includes(label.id)}
                        onChange={() => toggleLabelSelection(label.id)}
                        className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="font-mono text-sm text-gray-400">
                        {label.shortUuid}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => duplicateLabel(label)}
                        className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-md transition-colors"
                        title="Duplicate label"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEditing(label.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-md transition-colors"
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
                    className="w-full rounded-lg bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product name"
                  />
                </div>
                <div className="p-4 flex items-center justify-center bg-white dark:bg-gray-100 rounded-b-lg">
                  <div className="transform scale-[0.8]">
                    <LabelPreview label={label} />
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Label Button */}
            <button
              onClick={() => duplicateLabel(labels[0])}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-800 rounded-lg hover:border-blue-500 hover:bg-gray-900/50 transition-all group"
            >
              <Plus className="w-12 h-12 text-gray-700 group-hover:text-blue-500 mb-2 transition-colors" />
              <span className="text-gray-500 group-hover:text-blue-500 transition-colors">Add New Label</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onRestart}
          className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
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