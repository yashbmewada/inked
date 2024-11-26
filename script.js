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
  const words = text.split(' ');
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
    const scale = 300 / 96;
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 3000;

    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    
    // Black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text settings
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const paragraphs = text.split('\n\n');
    
    // Use slider values
    const verticalMargin = (canvas.height / scale) * (currentMargin / 100);
    const horizontalMargin = (canvas.width / scale) * (currentMargin / 100);
    const contentWidth = (canvas.width / scale) * (currentWidth / 100);
    
    // Use font size from slider
    const fontSize = currentFontSize;
    ctx.font = `300 ${fontSize}px "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif`;
    
    const lineHeight = fontSize * 1.5;
    const paragraphSpacing = fontSize * 2;
    
    let currentY;
    
    // Get title
    const title = document.getElementById('title-input').value;
    
    // If there's a title, draw it first
    if (title) {
      const titleFontSize = fontSize * 1.2; // Make title slightly larger
      ctx.font = `300 ${titleFontSize}px "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif`;
      ctx.textAlign = 'center'; // Center the title
      
      // Draw title at the top with some padding
      ctx.fillText(title, canvas.width / (2 * scale), verticalMargin);
      
      // Reset text alignment for main content
      ctx.textAlign = 'left';
      ctx.font = `300 ${fontSize}px "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif`;
      
      // Adjust starting Y position for main content
      currentY = verticalMargin + titleFontSize * 2;
    } else {
      currentY = verticalMargin;
    }

    // Draw paragraphs
    paragraphs.forEach((paragraph, index) => {
      const lines = wrapText(ctx, paragraph.trim(), contentWidth);
      lines.forEach(line => {
        ctx.fillText(line, horizontalMargin, currentY);
        currentY += lineHeight;
      });
      
      if (index < paragraphs.length - 1) {
        currentY += paragraphSpacing;
      }
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
