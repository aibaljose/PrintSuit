import React, { useState, useEffect, useRef } from 'react';
import { Eye, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import pdfjsLib from './lib/pdfjs-worker';

const PDFPreview = ({ file, settings }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pageImages, setPageImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate settings
  useEffect(() => {
    if (!settings) {
      console.error('Print settings are required');
      return;
    }

    // Validate required settings
    const requiredSettings = {
      color: 'boolean',
      orientation: 'string',
      copies: 'number',
      pageRange: 'string',
      doubleSided: 'boolean',
      fitToPage: 'boolean',
      paperSize: 'string' // Add this line
    };

    Object.entries(requiredSettings).forEach(([key, type]) => {
      if (typeof settings[key] !== type) {
      }
    });
  }, [settings]);

  // Add paper size scaling calculation
  const calculateViewportScale = (page, paperSize) => {
    const originalWidth = page.getViewport({ scale: 1.0 }).width;
    const originalHeight = page.getViewport({ scale: 1.0 }).height;
    
    // Convert mm to points (1 mm ≈ 2.83465 points)
    const targetWidth = paperSize.width * 2.83465;
    const targetHeight = paperSize.height * 2.83465;
    
    // Calculate scale to fit paper size while maintaining aspect ratio
    const widthScale = targetWidth / originalWidth;
    const heightScale = targetHeight / originalHeight;
    
    // Use the smaller scale to ensure content fits within paper
    return Math.min(widthScale, heightScale) * 2.0; // Multiply by 2.0 for better quality
  };

  // Convert PDF pages to images
  useEffect(() => {
    if (!file || !settings.paperSize) return;

    const convertPDFToImages = async () => {
      try {
        setIsLoading(true);
        const fileArrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: fileArrayBuffer }).promise;
        setNumPages(pdf.numPages);

        const images = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const margin = 50;
          
          // Calculate scale based on paper size
          const scale = calculateViewportScale(page, settings.paperSize);
          const viewport = page.getViewport({ scale });

          // Create canvas with proper paper size ratio
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { alpha: false });
          
          canvas.width = (viewport.width) + (margin * 2);
          canvas.height = (viewport.height) + (margin * 2);

          // Fill white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Render with paper size constraints
          await page.render({
            canvasContext: ctx,
            viewport,
            transform: [1, 0, 0, 1, margin, margin],
            background: 'white'
          }).promise;

          // Apply color settings
          const imageData = ctx.getImageData(margin, margin, viewport.width, viewport.height);
          if (!settings.color) {
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = data[i + 1] = data[i + 2] = avg;
            }
            ctx.putImageData(imageData, margin, margin);
          }

          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          images.push(dataUrl);
        }

        setPageImages(images);
        setError(null);
      } catch (err) {
        console.error('Error converting PDF:', err);
        setError('Could not process PDF');
      } finally {
        setIsLoading(false);
      }
    };

    convertPDFToImages();
  }, [file, settings.color, settings.paperSize]);

  // Handle page navigation
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="pdf-preview bg-gray-100 rounded-lg overflow-hidden">
      <div className="preview-header flex items-center p-3 bg-gray-200">
        <Eye className="mr-2 text-gray-600" />
        <h3 className="text-md font-semibold text-gray-700">PDF Preview</h3>
      </div>
      <div className="preview-container h-[500px] w-full relative p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <span className="animate-pulse">Converting PDF...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            <AlertTriangle className="mr-2" />
            {error}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div 
              className={`relative w-full h-full flex items-center justify-center ${
                settings.orientation.toLowerCase() === 'landscape' ? 'rotate-90' : ''
              }`} 
              style={{ 
                padding: '20px',
                aspectRatio: settings.orientation.toLowerCase() === 'landscape' 
                  ? `${settings.paperSize.height}/${settings.paperSize.width}`
                  : `${settings.paperSize.width}/${settings.paperSize.height}`
              }}
            >
              {pageImages[currentPage - 1] && (
                <img
                  src={pageImages[currentPage - 1]}
                  alt={`Page ${currentPage}`}
                  className={`max-w-full max-h-full object-contain ${
                    settings.fitToPage ? 'w-full h-full' : ''
                  }`}
                  style={{
                    filter: !settings.color ? 'grayscale(100%)' : 'none',
                  }}
                />
              )}
            </div>
            {numPages > 1 && (
              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded bg-blue-500 text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === numPages}
                  className="p-2 rounded bg-blue-500 text-white disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="preview-settings p-4 bg-gray-50 border-t">
        <h4 className="text-md font-semibold mb-3">Print Settings</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Print Type:</strong> {settings.color ? 'Color' : 'Black & White'}
          </div>
          <div>
            <strong>Orientation:</strong> {settings.orientation}
          </div>
          <div>
            <strong>Fit to Page:</strong> {settings.fitToPage ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Double-sided:</strong> {settings.doubleSided ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Page Range:</strong> {settings.pageRange === 'all' ? 'All Pages' : settings.customRange || 'N/A'}
          </div>
          <div>
            <strong>Copies:</strong> {settings.copies}
          </div>
          <div>
            <strong>Paper Size:</strong> {settings.paperSize.width} × {settings.paperSize.height} mm
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;