import { PDFDocument } from 'pdf-lib';

let isHighlighting = false;
let isCommenting = false;
let isDrawing = false;
let annotations = [];

const pdfCanvas = document.getElementById('pdfCanvas');
const annotationCanvas = document.getElementById('annotationCanvas');
const ctx = annotationCanvas.getContext('2d');

// Load and render the PDF
async function loadPDF(url) {

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/octet-stream', // Triggers non-download behavior
        'Accept': 'application/pdf',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    // Continue with PDF.js operations

    const page = pdfDoc.getPages()[0];

    const viewport = {
      width: page.getWidth(),
      height: page.getHeight(),
    };

    pdfCanvas.width = viewport.width;
    pdfCanvas.height = viewport.height;
    annotationCanvas.width = viewport.width;
    annotationCanvas.height = viewport.height;

    const pageImage = await page.renderToCanvas({
      width: viewport.width,
      height: viewport.height,
    });

    pdfCanvas.getContext('2d').drawImage(pageImage, 0, 0);

    console.log('PDF loaded successfully!');
  } catch (error) {
    console.error('Error loading PDF:', error);
  }

  // const pdfBytes = await fetch(url).then((res) => res.arrayBuffer());

}

// Highlighting
document.getElementById('highlightBtn').addEventListener('click', () => {
  isHighlighting = true;
  isCommenting = false;
  isDrawing = false;
});

// Drawing
annotationCanvas.addEventListener('mousedown', (event) => {
  if (isDrawing) {
    const { offsetX, offsetY } = event;
    ctx.moveTo(offsetX, offsetY);
    ctx.beginPath();
  }
});

annotationCanvas.addEventListener('mousemove', (event) => {
  if (isDrawing && event.buttons === 1) {
    const { offsetX, offsetY } = event;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  }
});

document.getElementById('drawBtn').addEventListener('click', () => {
  isHighlighting = false;
  isCommenting = false;
  isDrawing = true;
});

// Adding Comments
document.getElementById('commentBtn').addEventListener('click', () => {
  isHighlighting = false;
  isCommenting = true;
  isDrawing = false;

  annotationCanvas.addEventListener('click', (event) => {
    if (isCommenting) {
      const { offsetX, offsetY } = event;

      const commentBox = document.createElement('textarea');
      commentBox.style.position = 'absolute';
      commentBox.style.left = `${offsetX}px`;
      commentBox.style.top = `${offsetY}px`;
      commentBox.style.width = '200px';
      commentBox.style.height = '50px';
      document.body.appendChild(commentBox);

      annotations.push({ type: 'comment', x: offsetX, y: offsetY, content: '' });
    }
  });
});

// Save PDF
document.getElementById('saveBtn').addEventListener('click', async () => {
  const pdfDoc = await PDFDocument.load(await fetch('ModulesTracker.pdf').then((res) => res.arrayBuffer()));

  annotations.forEach((annotation) => {
    if (annotation.type === 'comment') {
      const page = pdfDoc.getPages()[0];
      page.drawText(annotation.content, {
        x: annotation.x,
        y: annotation.y,
        size: 12,
        color: rgb(0, 0, 0),
      });
    }
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'annotated.pdf';
  link.click();
});

// Load the PDF
loadPDF('ModulesTracker.data');
