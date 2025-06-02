const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = {
  'blog-1.jpg': { width: 800, height: 400 },
  'blog-2.jpg': { width: 800, height: 400 },
  'blog-3.jpg': { width: 800, height: 400 }
};

const colors = [
  '#00AFFF',
  '#0090cc',
  '#0077aa'
];

Object.entries(sizes).forEach(([filename, size], index) => {
  const canvas = createCanvas(size.width, size.height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#0B0C10';
  ctx.fillRect(0, 0, size.width, size.height);

  // Add gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, size.width, size.height);
  gradient.addColorStop(0, colors[index]);
  gradient.addColorStop(1, '#1A1C23');
  ctx.fillStyle = gradient;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(0, 0, size.width, size.height);

  // Add text
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI Agency Blog', size.width / 2, size.height / 2);

  // Save the image
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(__dirname, '..', 'public', filename), buffer);
}); 