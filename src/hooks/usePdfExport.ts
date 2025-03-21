import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCodeLib from 'qrcode';
import type { Label, PDFSettings } from '../types';
import { getScaleFactor } from '../utils';

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

  const createLabelElement = async (label: Label, scale: number): Promise<HTMLDivElement> => {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = `${label.size.width * scale}px`;
    container.style.height = `${label.size.height * scale}px`;
    container.style.backgroundColor = 'white';
    container.style.overflow = 'hidden';

    if (label.size.border.enabled) {
      container.style.border = `${label.size.border.width * scale}px solid ${label.size.border.color}`;
    }

    // QR Code
    if (label.elements.qrCode.enabled) {
      const qrSize = label.elements.qrCode.size * 4;
      const qrDataUrl = await QRCodeLib.toDataURL(`${label.prefix}${label.uuid}`, {
        width: qrSize,
        margin: 0,
        color: {
          dark: label.elements.qrCode.color || '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      const qrContainer = document.createElement('div');
      qrContainer.style.position = 'absolute';
      qrContainer.style.left = `${label.elements.qrCode.position.x * scale}px`;
      qrContainer.style.top = `${label.elements.qrCode.position.y * scale}px`;
      qrContainer.style.width = `${label.elements.qrCode.size}px`;
      qrContainer.style.height = `${label.elements.qrCode.size}px`;
      qrContainer.style.margin = '0';
      qrContainer.style.padding = '0';
      qrContainer.style.lineHeight = '0';
      qrContainer.style.transform = label.elements.qrCode.rotation ? 
        `rotate(${label.elements.qrCode.rotation}deg)` : '';
      qrContainer.style.transformOrigin = 'center center';
      
      const qrImg = document.createElement('img');
      qrImg.src = qrDataUrl;
      qrImg.width = label.elements.qrCode.size;
      qrImg.height = label.elements.qrCode.size;
      qrImg.style.display = 'block';
      qrImg.style.imageRendering = 'pixelated';
      
      qrContainer.appendChild(qrImg);
      container.appendChild(qrContainer);
    }

    // Logo
    if (label.elements.logo.enabled && label.elements.logo.imageUrl) {
      const logo = label.elements.logo;
      const logoContainer = document.createElement('div');
      logoContainer.style.position = 'absolute';
      logoContainer.style.left = `${logo.position.x * scale}px`;
      logoContainer.style.top = `${logo.position.y * scale}px`;
      logoContainer.style.width = `${(logo.width || logo.size) * scale}px`;
      logoContainer.style.height = `${(logo.height || logo.size) * scale}px`;
      logoContainer.style.margin = '0';
      logoContainer.style.padding = '0';
      logoContainer.style.lineHeight = '0';
      logoContainer.style.transform = logo.rotation ? `rotate(${logo.rotation}deg)` : '';
      logoContainer.style.transformOrigin = 'center center';
      logoContainer.style.display = 'flex';
      logoContainer.style.alignItems = 'center';
      logoContainer.style.justifyContent = 'center';

      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = logo.imageUrl;
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });

      logoImg.style.width = '100%';
      logoImg.style.height = '100%';
      logoImg.style.objectFit = 'contain';
      logoImg.style.display = 'block';
      logoImg.style.imageRendering = 'high-quality';
      logoImg.style.WebkitFontSmoothing = 'antialiased';
      logoImg.style.MozOsxFontSmoothing = 'grayscale';

      logoContainer.appendChild(logoImg);
      container.appendChild(logoContainer);
    }

    const createTextElement = (
      content: string,
      element: any,
      isMonospace: boolean = false
    ) => {
      const textContainer = document.createElement('div');
      textContainer.style.position = 'absolute';
      textContainer.style.left = `${element.position.x * scale}px`;
      textContainer.style.top = `${element.position.y * scale}px`;
      textContainer.style.margin = '0';
      textContainer.style.padding = '0';
      textContainer.style.fontSize = `${element.size}px`;
      textContainer.style.lineHeight = '1';
      textContainer.style.height = `${element.size}px`;
      textContainer.style.fontFamily = isMonospace ? 
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' : 
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      textContainer.style.color = (element.textStyle?.color || element.color || '#000000');
      textContainer.style.fontWeight = '400';
      textContainer.style.whiteSpace = 'pre';
      textContainer.style.letterSpacing = 'normal';
      textContainer.style.textRendering = 'geometricPrecision';
      textContainer.style.WebkitFontSmoothing = 'antialiased';
      textContainer.style.MozOsxFontSmoothing = 'grayscale';
      textContainer.style.display = 'block';
      textContainer.style.transformOrigin = 'center center';

      // Apply rotation from either textStyle or element
      const rotation = element.textStyle?.rotation || element.rotation || 0;
      if (rotation) {
        textContainer.style.transform = `rotate(${rotation}deg)`;
      }

      if (element.textStyle) {
        if (element.textStyle.multiline) {
          textContainer.style.width = `${element.textStyle.width * scale}px`;
          textContainer.style.whiteSpace = 'pre-wrap';
          textContainer.style.wordBreak = 'break-word';
          
          if (element.textStyle.height) {
            textContainer.style.height = `${element.textStyle.height * scale}px`;
          }
        }

        textContainer.style.textAlign = element.textStyle.align;

        if (!element.textStyle.multiline) {
          if (element.textStyle.align === 'center') {
            textContainer.style.transform = rotation ? 
              `translateX(-50%) rotate(${rotation}deg)` : 
              'translateX(-50%)';
            textContainer.style.left = `${(element.position.x + (element.width || element.size) / 2) * scale}px`;
          } else if (element.textStyle.align === 'right') {
            textContainer.style.transform = rotation ? 
              `translateX(-100%) rotate(${rotation}deg)` : 
              'translateX(-100%)';
            textContainer.style.left = `${(element.position.x + (element.width || element.size)) * scale}px`;
          }
        }
      }

      textContainer.textContent = content;
      return textContainer;
    };

    // UUID
    if (label.elements.uuid.enabled) {
      const uuidElement = createTextElement(label.shortUuid, label.elements.uuid, true);
      container.appendChild(uuidElement);
    }

    // Custom Text
    if (label.elements.text.enabled) {
      const textElement = createTextElement(label.text, label.elements.text);
      container.appendChild(textElement);
    }

    // Company Name
    if (label.elements.companyName.enabled) {
      const companyElement = createTextElement(label.companyName, label.elements.companyName);
      container.appendChild(companyElement);
    }

    // Product Name
    if (label.elements.productName.enabled) {
      const productElement = createTextElement(label.productName, label.elements.productName);
      container.appendChild(productElement);
    }

    return container;
  };

  const exportMultipleLabelsPerPage = async (selectedLabels: Label[], pageSettings: any) => {
    const mmToPt = 2.835;
    const cmToPt = 28.35;
    const convertToPt = (value: number, unit: 'mm' | 'cm') => 
      unit === 'mm' ? value * mmToPt : value * cmToPt;

    const pageWidth = convertToPt(pageSettings.width, pageSettings.unit);
    const pageHeight = convertToPt(pageSettings.height, pageSettings.unit);
    const marginTop = convertToPt(pageSettings.marginTop, pageSettings.unit);
    const marginRight = convertToPt(pageSettings.marginRight, pageSettings.unit);
    const marginBottom = convertToPt(pageSettings.marginBottom, pageSettings.unit);
    const marginLeft = convertToPt(pageSettings.marginLeft, pageSettings.unit);
    const spacing = convertToPt(pageSettings.spacing, pageSettings.unit);

    const firstLabel = selectedLabels[0];
    const labelWidth = convertToPt(firstLabel.size.width, firstLabel.size.unit);
    const labelHeight = convertToPt(firstLabel.size.height, firstLabel.size.unit);

    const availableWidth = pageWidth - marginLeft - marginRight;
    const availableHeight = pageHeight - marginTop - marginBottom;
    const labelsPerRow = Math.floor((availableWidth + spacing) / (labelWidth + spacing));
    const labelsPerColumn = Math.floor((availableHeight + spacing) / (labelHeight + spacing));

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
      const scale = getScaleFactor(firstLabel.size.unit);

      while (currentLabel < selectedLabels.length) {
        if (currentLabel > 0) {
          pdf.addPage([pageWidth, pageHeight], 'portrait');
        }

        for (let row = 0; row < labelsPerColumn && currentLabel < selectedLabels.length; row++) {
          for (let col = 0; col < labelsPerRow && currentLabel < selectedLabels.length; col++) {
            const label = selectedLabels[currentLabel];
            const x = marginLeft + col * (labelWidth + spacing);
            const y = marginTop + row * (labelHeight + spacing);

            const labelElement = await createLabelElement(label, scale);
            container.appendChild(labelElement);

            const canvas = await html2canvas(labelElement, {
              scale: 4,
              backgroundColor: 'white',
              logging: false,
              useCORS: true,
              allowTaint: true,
              letterRendering: true,
              imageTimeout: 0,
              onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.querySelector('div');
                if (clonedElement) {
                  clonedElement.style.transform = 'none';
                }
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

            container.removeChild(labelElement);
            currentLabel++;
          }
        }
      }

      pdf.save('labels.pdf');
    } finally {
      document.body.removeChild(container);
    }
  };

  const exportSingleLabelPerPage = async (selectedLabels: Label[]) => {
    const firstLabel = selectedLabels[0];
    const mmToPt = 2.835;
    const widthPt = firstLabel.size.width * mmToPt;
    const heightPt = firstLabel.size.height * mmToPt;
    const isLandscape = widthPt > heightPt;

    const pdf = new jsPDF({
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
      const scale = getScaleFactor(firstLabel.size.unit);

      for (let i = 0; i < selectedLabels.length; i++) {
        if (i > 0) {
          pdf.addPage([widthPt, heightPt], isLandscape ? 'landscape' : 'portrait');
        }

        const label = selectedLabels[i];
        const labelElement = await createLabelElement(label, scale);
        container.appendChild(labelElement);

        const canvas = await html2canvas(labelElement, {
          scale: 4,
          backgroundColor: 'white',
          logging: false,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
          imageTimeout: 0,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('div');
            if (clonedElement) {
              clonedElement.style.transform = 'none';
            }
          }
        });

        pdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          0,
          0,
          widthPt,
          heightPt,
          undefined,
          'FAST'
        );

        container.removeChild(labelElement);
      }

      pdf.save('labels.pdf');
    } finally {
      document.body.removeChild(container);
    }
  };

  return { exportToPDF };
}