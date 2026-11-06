const form = document.getElementById('image-form');
const imageContainer = document.getElementById('image-container');

let currentFontSize = 42;
let currentMargin = 20;
let currentWidth = 70;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const textInput = document.getElementById('text-input').value;
  generateImage(textInput);
});

document.getElementById('fontSize').addEventListener('input', function(e) {
  currentFontSize = parseInt(e.target.value);
  document.getElementById('fontSizeValue').textContent = `${currentFontSize}px`;
  generateImage(document.getElementById('text-input').value);
});

document.getElementById('margin').addEventListener('input', function(e) {
  currentMargin = parseInt(e.target.value);
  document.getElementById('marginValue').textContent = `${currentMargin}%`;
  generateImage(document.getElementById('text-input').value);
});

document.getElementById('contentWidth').addEventListener('input', function(e) {
  currentWidth = parseInt(e.target.value);
  document.getElementById('contentWidthValue').textContent = `${currentWidth}%`;
  generateImage(document.getElementById('text-input').value);
});

// Add title input event listener
document.getElementById('title-input').addEventListener('input', function(e) {
  generateImage(document.getElementById('text-input').value);
});

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function generateImage(text) {
  document.fonts.ready.then(() => {
    // 8x10 inch page; layout is done in 768x960 CSS px and scaled up to DPI
    const DPI = 600;
    const scale = DPI / 96;
    const canvas = document.createElement('canvas');
    canvas.width = 8 * DPI;
    canvas.height = 10 * DPI;

    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    
    // Black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text settings
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Use slider values
    const pageWidth = canvas.width / scale;
    const pageHeight = canvas.height / scale;
    const verticalMargin = pageHeight * (currentMargin / 100);
    const horizontalMargin = pageWidth * (currentMargin / 100);
    // Keep the text block inside the page even when margin + width exceed 100%
    const contentWidth = Math.min(pageWidth * (currentWidth / 100), pageWidth - 2 * horizontalMargin);
    const availableHeight = pageHeight - 2 * verticalMargin;

    const title = document.getElementById('title-input').value;
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const fontFor = size => `300 ${size}px "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif`;

    // Wrap the text at a given size and measure how tall the block would be
    function layout(fontSize) {
      ctx.font = fontFor(fontSize);
      const wrapped = paragraphs.map(p => wrapText(ctx, p, contentWidth));
      const lineCount = wrapped.reduce((n, lines) => n + lines.length, 0);
      const titleHeight = title ? fontSize * 1.2 * 2 : 0;
      const height = titleHeight
        + Math.max(lineCount - 1, 0) * fontSize * 1.5
        + Math.max(wrapped.length - 1, 0) * fontSize * 2;
      return { wrapped, height };
    }

    // Shrink from the slider value until the text fits between the margins
    let fontSize = currentFontSize;
    let result = layout(fontSize);
    while (result.height > availableHeight && fontSize > 6) {
      fontSize -= 0.5;
      result = layout(fontSize);
    }
    document.getElementById('fontSizeValue').textContent =
      fontSize < currentFontSize ? `${currentFontSize}px (fitted to ${fontSize}px)` : `${currentFontSize}px`;

    const lineHeight = fontSize * 1.5;
    const paragraphSpacing = fontSize * 2;
    let currentY = verticalMargin;

    if (title) {
      const titleFontSize = fontSize * 1.2;
      ctx.font = fontFor(titleFontSize);
      ctx.textAlign = 'center';
      ctx.fillText(title, pageWidth / 2, verticalMargin);
      ctx.textAlign = 'left';
      currentY += titleFontSize * 2;
    }

    ctx.font = fontFor(fontSize);
    result.wrapped.forEach(lines => {
      lines.forEach(line => {
        ctx.fillText(line, horizontalMargin, currentY);
        currentY += lineHeight;
      });
      currentY += paragraphSpacing;
    });

    // Convert to image and setup download
    const dataURL = canvas.toDataURL('image/png');
    const img = document.createElement('img');
    img.src = dataURL;
    img.alt = 'Generated poem';
    
    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = '';
    imageContainer.appendChild(img);

    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'poem.png';
    downloadLink.className = 'download-button';
    downloadLink.textContent = 'Download Image';
    imageContainer.appendChild(downloadLink);
  });
}
