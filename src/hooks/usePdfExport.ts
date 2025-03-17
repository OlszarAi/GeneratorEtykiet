import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCodeLib from 'qrcode';
import type { Label, PDFSettings } from '../types';
import { getScaleFactor, createLabelElement } from '../utils';

export function usePdfExport() {
  const exportToPDF = useCallback(async (selectedLabels: Label[], pdfSettings: PDFSettings) => {
    if (selectedLabels.length === 0) return;

    const firstLabel = selectedLabels[0];
    const { pageSettings } = pdfSettings;
    
    if (pdfSettings.type === 'multiple' && pageSettings) {
      await exportMultipleLabelsPerPage(selectedLabels, pageSettings);
    } else {
      await exportSingleLabelPerPage(selectedLabels);
    }
  }, []);

  // Export multiple labels per page
  const exportMultipleLabelsPerPage = async (selectedLabels: Label[], pageSettings: any) => {
    // Convert all measurements to points (1 pt = 1/72 inch)
    const mmToPt = 2.835;
    const cmToPt = 28.35;
    const convertToPt = (value: number, unit: 'mm' | 'cm') => 
      unit === 'mm' ? value * mmToPt : value * cmToPt;

    // Convert page dimensions and margins to points
    const pageWidth = convertToPt(pageSettings.width, pageSettings.unit);
    const pageHeight = convertToPt(pageSettings.height, pageSettings.unit);
    const marginTop = convertToPt(pageSettings.marginTop, pageSettings.unit);
    const marginRight = convertToPt(pageSettings.marginRight, pageSettings.unit);
    const marginBottom = convertToPt(pageSettings.marginBottom, pageSettings.unit);
    const marginLeft = convertToPt(pageSettings.marginLeft, pageSettings.unit);
    const spacing = convertToPt(pageSettings.spacing, pageSettings.unit);

    // Convert label dimensions to points
    const firstLabel = selectedLabels[0];
    const labelWidth = convertToPt(firstLabel.size.width, firstLabel.size.unit);
    const labelHeight = convertToPt(firstLabel.size.height, firstLabel.size.unit);

    // Calculate available space
    const availableWidth = pageWidth - marginLeft - marginRight;
    const availableHeight = pageHeight - marginTop - marginBottom;

    // Calculate how many labels can fit in each row and column
    const labelsPerRow = Math.floor((availableWidth + spacing) / (labelWidth + spacing));
    const labelsPerColumn = Math.floor((availableHeight + spacing) / (labelHeight + spacing));
    const labelsPerPage = labelsPerRow * labelsPerColumn;

    // Create PDF with page size
    const pdf = new jsPDF({
      unit: 'pt',
      format: [pageWidth, pageHeight],
      orientation: 'portrait'
    });

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    try {
      let currentLabel = 0;
      
      while (currentLabel < selectedLabels.length) {
        if (currentLabel > 0) {
          pdf.addPage([pageWidth, pageHeight], 'portrait');
        }

        // Process labels for current page
        for (let row = 0; row < labelsPerColumn && currentLabel < selectedLabels.length; row++) {
          for (let col = 0; col < labelsPerRow && currentLabel < selectedLabels.length; col++) {
            const label = selectedLabels[currentLabel];
            const scale = getScaleFactor(label.size.unit);

            // Calculate position for current label
            const x = marginLeft + col * (labelWidth + spacing);
            const y = marginTop + row * (labelHeight + spacing);

            // Generate high-quality QR code
            const qrSize = label.elements.qrCode.size * 4;
            const qrDataUrl = await QRCodeLib.toDataURL(`${label.prefix}${label.uuid}`, {
              width: qrSize,
              margin: 0,
              errorCorrectionLevel: 'H',
              quality: 1.0,
              scale: 4
            });

            // Create label element with proper font styles
            const labelDiv = await createLabelElement(label, scale, qrDataUrl);
            container.appendChild(labelDiv);

            // Configure html2canvas for better text rendering
            const canvas = await html2canvas(labelDiv, {
              scale: 4,
              backgroundColor: 'white',
              logging: false,
              useCORS: true,
              allowTaint: true,
              imageTimeout: 0,
              onclone: (clonedDoc) => {
                const elements = clonedDoc.querySelectorAll('p, div');
                elements.forEach(el => {
                  if (el instanceof HTMLElement) {
                    // Ensure font styles are explicitly set
                    el.style.fontFamily = 'Arial, sans-serif';
                    if (el.classList.contains('font-bold')) {
                      el.style.fontWeight = '700';
                    }
                    // Preserve font size
                    if (el.style.fontSize) {
                      const size = parseFloat(el.style.fontSize);
                      el.style.fontSize = `${size}px`;
                    }
                    // Ensure text alignment is preserved
                    if (el.style.textAlign) {
                      el.style.textAlign = el.style.textAlign;
                    }
                    // Preserve line breaks and wrapping
                    if (el.style.whiteSpace) {
                      el.style.whiteSpace = el.style.whiteSpace;
                    }
                    if (el.style.wordBreak) {
                      el.style.wordBreak = el.style.wordBreak;
                    }
                  }
                });
              }
            });

            pdf.addImage(
              canvas.toDataURL('image/png', 1.0),
              'PNG',
              x,
              y,
              labelWidth,
              labelHeight,
              undefined,
              'FAST'
            );

            container.removeChild(labelDiv);
            currentLabel++;
          }
        }
      }

      pdf.save('labels.pdf');
    } finally {
      document.body.removeChild(container);
    }
  };

  // Export single label per page
  const exportSingleLabelPerPage = async (selectedLabels: Label[]) => {
    const firstLabel = selectedLabels[0];
    const mmToPt = 2.835;
    const widthPt = firstLabel.size.width * mmToPt;
    const heightPt = firstLabel.size.height * mmToPt;
    const isLandscape = widthPt > heightPt;

    const mainPdf = new jsPDF({
      unit: 'pt',
      format: isLandscape ? [widthPt, heightPt] : [heightPt, widthPt],
      orientation: isLandscape ? 'landscape' : 'portrait'
    });

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    try {
      for (let i = 0; i < selectedLabels.length; i++) {
        const label = selectedLabels[i];
        const scale = getScaleFactor(label.size.unit);
        
        // Generate high-quality QR code
        const qrSize = label.elements.qrCode.size * 4;
        const qrDataUrl = await QRCodeLib.toDataURL(`${label.prefix}${label.uuid}`, {
          width: qrSize,
          margin: 0,
          errorCorrectionLevel: 'H',
          quality: 1.0,
          scale: 4
        });
        
        const labelDiv = await createLabelElement(label, scale, qrDataUrl);
        container.appendChild(labelDiv);
        
        const canvas = await html2canvas(labelDiv, {
          scale: 4,
          backgroundColor: 'white',
          logging: false,
          useCORS: true,
          allowTaint: true,
          imageTimeout: 0,
          onclone: (clonedDoc) => {
            const elements = clonedDoc.querySelectorAll('p, div');
            elements.forEach(el => {
              if (el instanceof HTMLElement) {
                // Ensure font styles are explicitly set
                el.style.fontFamily = 'Arial, sans-serif';
                if (el.classList.contains('font-bold')) {
                  el.style.fontWeight = '700';
                }
                // Preserve font size
                if (el.style.fontSize) {
                  const size = parseFloat(el.style.fontSize);
                  el.style.fontSize = `${size}px`;
                }
                // Ensure text alignment is preserved
                if (el.style.textAlign) {
                  el.style.textAlign = el.style.textAlign;
                }
                // Preserve line breaks and wrapping
                if (el.style.whiteSpace) {
                  el.style.whiteSpace = el.style.whiteSpace;
                }
                if (el.style.wordBreak) {
                  el.style.wordBreak = el.style.wordBreak;
                }
              }
            });
          }
        });

        mainPdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          0,
          0,
          widthPt,
          heightPt,
          undefined,
          'FAST'
        );

        if (i < selectedLabels.length - 1) {
          mainPdf.addPage([widthPt, heightPt], isLandscape ? 'landscape' : 'portrait');
        }
        
        container.removeChild(labelDiv);
      }

      mainPdf.save('labels.pdf');
    } finally {
      document.body.removeChild(container);
    }
  };

  return { exportToPDF };
}