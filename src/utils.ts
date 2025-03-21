import type { Position, LabelSize, ElementStyle, ElementBounds, TextStyle } from './types';

export const getScaleFactor = (unit: 'mm' | 'cm' | 'in') => {
  switch (unit) {
    case 'mm': return 3.779528;  // 1mm = 3.779528px
    case 'cm': return 37.79528;  // 1cm = 37.79528px
    case 'in': return 96;        // 1in = 96px
    default: return 3.779528;
  }
};

export const getElementBounds = (element: ElementStyle, scale: number): ElementBounds => {
  const width = element.width || element.size;
  const elementWidth = width / scale;
  const elementHeight = element.size / scale;

  return {
    left: element.position.x,
    top: element.position.y,
    right: element.position.x + elementWidth,
    bottom: element.position.y + elementHeight
  };
};

export const doElementsOverlap = (bounds1: ElementBounds, bounds2: ElementBounds): boolean => {
  return !(
    bounds1.right <= bounds2.left ||
    bounds1.left >= bounds2.right ||
    bounds1.bottom <= bounds2.top ||
    bounds1.top >= bounds2.bottom
  );
};

export const constrainPosition = (
  position: Position,
  elementSize: number,
  labelSize: LabelSize,
  elementWidth?: number
): Position => {
  if (labelSize.allowElementsOutside) {
    return position;
  }

  const { width, height, padding } = labelSize;
  const elementW = elementWidth || elementSize;
  const effectivePadding = padding || 0;

  // Convert QR code size from pixels to label units (mm/cm/in)
  const scale = getScaleFactor(labelSize.unit);
  const elementWInUnits = elementW / scale;
  const elementHInUnits = elementSize / scale;

  return {
    x: Math.max(
      effectivePadding, 
      Math.min(position.x, width - elementWInUnits - effectivePadding)
    ),
    y: Math.max(
      effectivePadding, 
      Math.min(position.y, height - elementHInUnits - effectivePadding)
    )
  };
};

export const findNonOverlappingPosition = (
  element: ElementStyle,
  otherElements: ElementStyle[],
  labelSize: LabelSize,
  scale: number
): Position => {
  if (!labelSize.preventCollisions || labelSize.allowElementsOutside) {
    return element.position;
  }

  const elementBounds = getElementBounds(element, scale);
  let hasOverlap = false;

  // Check if current position overlaps with any other element
  for (const other of otherElements) {
    if (!other.enabled) continue;
    const otherBounds = getElementBounds(other, scale);
    if (doElementsOverlap(elementBounds, otherBounds)) {
      hasOverlap = true;
      break;
    }
  }

  if (!hasOverlap) {
    return element.position;
  }

  // If there's overlap, try to find a new position
  const { width, height, padding } = labelSize;
  const effectivePadding = padding || 0;
  const elementWidth = (element.width || element.size) / scale;
  const elementHeight = element.size / scale;

  // Define a grid of positions to try
  const gridSize = 10;
  const stepX = (width - elementWidth - 2 * effectivePadding) / gridSize;
  const stepY = (height - elementHeight - 2 * effectivePadding) / gridSize;

  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      const testPosition = {
        x: effectivePadding + i * stepX,
        y: effectivePadding + j * stepY
      };

      const testBounds = {
        left: testPosition.x,
        top: testPosition.y,
        right: testPosition.x + elementWidth,
        bottom: testPosition.y + elementHeight
      };

      let positionValid = true;
      for (const other of otherElements) {
        if (!other.enabled) continue;
        const otherBounds = getElementBounds(other, scale);
        if (doElementsOverlap(testBounds, otherBounds)) {
          positionValid = false;
          break;
        }
      }

      if (positionValid) {
        return testPosition;
      }
    }
  }

  // If no non-overlapping position is found, return the original constrained position
  return constrainPosition(element.position, element.size, labelSize, element.width);
};

export const calculateTextDimensions = (
  text: string,
  fontSize: number,
  maxWidth: number,
  textStyle: TextStyle
): { width: number; height: number } => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = `${fontSize}px sans-serif`;

  if (!textStyle.multiline) {
    const metrics = context.measureText(text);
    return {
      width: Math.min(metrics.width, maxWidth),
      height: fontSize
    };
  }

  const words = text.split(' ');
  let line = '';
  let lines = 1;
  let maxLineWidth = 0;

  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    const metrics = context.measureText(testLine);

    if (metrics.width > maxWidth && line !== '') {
      line = word;
      lines++;
      maxLineWidth = Math.max(maxLineWidth, metrics.width);
    } else {
      line = testLine;
    }
  }

  return {
    width: Math.min(maxLineWidth, maxWidth),
    height: lines * (fontSize * 1.2)
  };
};

export const wrapText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  textStyle: TextStyle
): void => {
  const words = text.split(' ');
  let line = '';
  const lineHeight = fontSize * 1.2;
  let currentY = y;

  context.font = `${fontSize}px sans-serif`;
  context.textAlign = textStyle.align;
  
  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    const metrics = context.measureText(testLine);

    if (metrics.width > maxWidth && line !== '') {
      const xPos = textStyle.align === 'center' ? x + maxWidth / 2 :
                  textStyle.align === 'right' ? x + maxWidth :
                  x;
      context.fillText(line, xPos, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  const xPos = textStyle.align === 'center' ? x + maxWidth / 2 :
              textStyle.align === 'right' ? x + maxWidth :
              x;
  context.fillText(line, xPos, currentY);
};

export const createLabelElement = async (
  label: any, 
  scale: number, 
  qrDataUrl?: string
) => {
  const labelDiv = document.createElement('div');
  labelDiv.style.width = `${label.size.width * scale}px`;
  labelDiv.style.height = `${label.size.height * scale}px`;
  labelDiv.style.position = 'relative';
  labelDiv.style.backgroundColor = 'white';
  labelDiv.style.overflow = 'hidden';

  if (label.size.border.enabled) {
    labelDiv.style.border = `${label.size.border.width * scale}px solid ${label.size.border.color}`;
  }

  const createTextContainer = (element: any) => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = `${element.position.x * scale}px`;
    wrapper.style.top = `${element.position.y * scale}px`;
    
    const container = document.createElement('div');
    container.style.fontSize = `${element.size}px`;
    container.style.lineHeight = '1.2';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontWeight = 'bold';
    container.style.margin = '0';
    container.style.padding = '0';
    
    if (element.textStyle) {
      container.style.color = element.textStyle.color || '#000000';
      if (element.textStyle.multiline && element.textStyle.maxWidth) {
        container.style.width = `${element.textStyle.maxWidth * scale}px`;
        container.style.whiteSpace = 'pre-wrap';
        container.style.wordBreak = 'break-word';
        container.style.overflowWrap = 'break-word';
        container.style.textAlign = element.textStyle.align;
        wrapper.style.width = container.style.width;
      } else {
        container.style.whiteSpace = 'nowrap';
        if (element.textStyle.align === 'center') {
          wrapper.style.width = '0';
          wrapper.style.transform = 'translateX(50%)';
          container.style.transform = 'translateX(-50%)';
        } else if (element.textStyle.align === 'right') {
          wrapper.style.width = '0';
          container.style.transform = 'translateX(-100%)';
        }
        container.style.textAlign = element.textStyle.align;
      }
    }
    
    wrapper.appendChild(container);
    return { wrapper, container };
  };

  if (label.elements.qrCode.enabled && qrDataUrl) {
    const qrContainer = document.createElement('div');
    qrContainer.style.position = 'absolute';
    qrContainer.style.left = `${label.elements.qrCode.position.x * scale}px`;
    qrContainer.style.top = `${label.elements.qrCode.position.y * scale}px`;
    qrContainer.style.width = `${label.elements.qrCode.size}px`;
    qrContainer.style.height = `${label.elements.qrCode.size}px`;
    qrContainer.style.margin = '0';
    qrContainer.style.padding = '0';
    qrContainer.innerHTML = `
      <img 
        src="${qrDataUrl}" 
        width="${label.elements.qrCode.size}" 
        height="${label.elements.qrCode.size}" 
        style="display: block; image-rendering: pixelated; margin: 0; padding: 0;"
      />
    `;
    labelDiv.appendChild(qrContainer);
  }

  if (label.elements.uuid.enabled) {
    const { wrapper: uuidWrapper, container: uuidContainer } = createTextContainer(label.elements.uuid);
    uuidContainer.textContent = label.shortUuid;
    uuidContainer.style.color = label.elements.uuid.color || '#000000';
    labelDiv.appendChild(uuidWrapper);
  }

  if (label.elements.text.enabled) {
    const { wrapper: textWrapper, container: textContainer } = createTextContainer(label.elements.text);
    textContainer.textContent = label.text;
    labelDiv.appendChild(textWrapper);
  }

  if (label.elements.companyName.enabled) {
    const { wrapper: companyWrapper, container: companyContainer } = createTextContainer(label.elements.companyName);
    companyContainer.textContent = label.companyName;
    labelDiv.appendChild(companyWrapper);
  }

  if (label.elements.productName.enabled) {
    const { wrapper: productWrapper, container: productContainer } = createTextContainer(label.elements.productName);
    productContainer.textContent = label.productName;
    labelDiv.appendChild(productWrapper);
  }

  return labelDiv;
};