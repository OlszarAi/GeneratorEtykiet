import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Printer } from 'lucide-react';
import { LabelEditor } from './components/LabelEditor';
import { GeneratedLabels } from './components/GeneratedLabels';
import { ThemeToggle } from './components/ThemeToggle';
import { LabelSizeForm } from './components/LabelSizeForm';
import { OtherSettingsForm } from './components/OtherSettingsForm';
import { useLabels } from './hooks/useLabels';
import { usePdfExport } from './hooks/usePdfExport';
import type { Label, LabelSize, LabelElements, PDFSettings } from './types';

function App() {
  const [step, setStep] = useState(1);
  const [labelSize, setLabelSize] = useState<LabelSize>({ 
    width: 100, 
    height: 50, 
    unit: 'mm',
    padding: 5,
    elementSpacing: 1,
    preventCollisions: false,
    border: {
      enabled: false,
      width: 0.3,
      color: '#000000'
    }
  });
  
  const [elements, setElements] = useState<LabelElements>({
    qrCode: { 
      position: { x: 10, y: 10 }, 
      size: 50,
      enabled: true
    },
    uuid: { 
      position: { x: 10, y: 35 }, 
      size: 12,
      enabled: true
    },
    text: {
      position: { x: 10, y: 25 },
      size: 14,
      enabled: true,
      textStyle: {
        align: 'left',
        multiline: false,
        maxWidth: 80
      }
    },
    companyName: { 
      position: { x: 10, y: 45 }, 
      size: 14,
      enabled: true,
      textStyle: {
        align: 'left',
        multiline: false,
        maxWidth: 80
      }
    },
    productName: { 
      position: { x: 70, y: 45 }, 
      size: 14,
      enabled: true,
      textStyle: {
        align: 'left',
        multiline: false,
        maxWidth: 80
      }
    }
  });
  
  const [companyName, setCompanyName] = useState('');
  const [text, setText] = useState('');
  const [prefix, setPrefix] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [uuidLength, setUuidLength] = useState(8);
  const [pdfSettings, setPdfSettings] = useState<PDFSettings>({ 
    type: 'single', 
    labelsPerPage: 4 
  });
  
  const [previewUuid, setPreviewUuid] = useState('');
  const [previewShortUuid, setPreviewShortUuid] = useState('');
  
  const { labels, setLabels } = useLabels();
  const { exportToPDF } = usePdfExport();
  
  useEffect(() => {
    const fullUuid = uuidv4();
    setPreviewUuid(fullUuid);
    setPreviewShortUuid(fullUuid.substring(0, uuidLength));
  }, [uuidLength]);
  
  const generateLabels = () => {
    const newLabels = Array.from({ length: quantity }, () => {
      const fullUuid = uuidv4();
      const shortUuid = fullUuid.substring(0, uuidLength);
      
      return {
        id: uuidv4(),
        size: labelSize,
        elements,
        companyName,
        text,
        uuid: fullUuid,
        shortUuid,
        prefix,
        productName: ''
      };
    });
    
    setLabels(newLabels);
    setStep(4);
  };

  const handleExportPDF = (selectedLabels: Label[]) => {
    exportToPDF(selectedLabels, pdfSettings);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Printer className="w-8 h-8" />
            Label Generator
          </h1>
          <ThemeToggle />
        </div>

        <div className="space-y-8">
          {step === 1 && (
            <LabelSizeForm 
              labelSize={labelSize} 
              onUpdateLabelSize={setLabelSize} 
              onNext={() => setStep(2)} 
            />
          )}

          {step === 2 && (
            <LabelEditor
              label={{
                id: 'template',
                size: labelSize,
                elements,
                companyName: companyName || 'Company Name',
                text: text || 'Custom Text',
                uuid: previewUuid,
                shortUuid: previewShortUuid,
                prefix,
                productName: 'Product Name'
              }}
              onUpdate={(updatedLabel) => {
                setElements(updatedLabel.elements);
                setLabelSize(updatedLabel.size);
              }}
              onUpdateCompanyName={setCompanyName}
              onUpdateText={setText}
              onUpdatePrefix={setPrefix}
              onUpdateUuidLength={setUuidLength}
              onNext={() => setStep(3)}
              showNextButton
            />
          )}

          {step === 3 && (
            <OtherSettingsForm
              companyName={companyName}
              text={text}
              prefix={prefix}
              uuidLength={uuidLength}
              quantity={quantity}
              previewShortUuid={previewShortUuid}
              onUpdateCompanyName={setCompanyName}
              onUpdateText={setText}
              onUpdatePrefix={setPrefix}
              onUpdateUuidLength={setUuidLength}
              onUpdateQuantity={setQuantity}
              onBack={() => setStep(2)}
              onGenerate={generateLabels}
            />
          )}

          {step === 4 && (
            <GeneratedLabels
              labels={labels}
              onUpdateLabels={setLabels}
              pdfSettings={pdfSettings}
              onUpdatePdfSettings={setPdfSettings}
              onExportPdf={handleExportPDF}
              onRestart={() => setStep(1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;