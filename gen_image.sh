#!/bin/bash

# Create the HTML file
cat << EOF > index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customizable Image Generator</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Customizable Image Generator</h1>
    <form id="image-form">
      <label for="text-input">Enter the text you want to display:</label>
      <textarea id="text-input" rows="3" placeholder="Enter your text here"></textarea>
      <button type="submit">Generate Image</button>
    </form>
    <div id="image-container"></div>
  </div>
  <script src="script.js"></script>
</body>
</html>
EOF

# Create the CSS file
cat << EOF > styles.css
body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: black;
}

.container {
  max-width: 600px;
  width: 100%;
  padding: 40px;
  background-color: black;
  box-shadow: 0 2px 6px rgba(255, 255, 255, 0.1);
  text-align: center;
  color: white;
}

h1 {
  margin-bottom: 30px;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

textarea {
  width: 100%;
  max-width: 400px;
  padding: 10px;
  font-size: 16px;
  background-color: black;
  color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#image-container {
  max-width: 100%;
  height: auto;
}

#image-container img {
  max-width: 100%;
  height: auto;
}
EOF

# Create the JavaScript file
cat << EOF > script.js
const form = document.getElementById('image-form');
const imageContainer = document.getElementById('image-container');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const textInput = document.getElementById('text-input').value;
  generateImage(textInput);
});

function generateImage(text) {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 800; // 8 inches at 100 dpi
  canvas.height = 1000; // 10 inches at 100 dpi

  // Get the 2D rendering context
  const ctx = canvas.getContext('2d');

  // Set the background color to black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set the font and draw the text in white
  ctx.font = '48px "Helvetica Neue"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  // Convert the canvas to a data URL
  const dataURL = canvas.toDataURL('image/png');

  // Create an image element and set its source to the data URL
  const img = document.createElement('img');
  img.src = dataURL;
  img.alt = 'Generated image';

  // Clear the image container and add the new image
  imageContainer.innerHTML = '';
  imageContainer.appendChild(img);

  // Create a download link
  const downloadLink = document.createElement('a');
  downloadLink.href = dataURL;
  downloadLink.download = 'generated-image.png';
  downloadLink.textContent = 'Download Image';

  // Add the download link to the image container
  imageContainer.appendChild(downloadLink);
}
EOF

echo "Files created successfully!"
