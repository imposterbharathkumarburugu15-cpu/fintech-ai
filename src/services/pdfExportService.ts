// src/services/pdfExportService.ts

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// src/services/pdfExportService.ts

interface ReportData {
  title: string;
  summary: string;
  sections: any[];
  keyTakeaways: string[];
  recommendations: any[];
  nextSteps: string[];
  generatedAt: string;
  reportType: string;
}

export async function exportReportToPDF(
  elementId: string,
  reportData: ReportData
): Promise<void> {
  try {
    const loadingToast = showLoadingToast('Generating PDF...');

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Report element not found');
    }

    // Get the HTML content
    const htmlContent = element.outerHTML;
    
    // Create full HTML document with styles
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${reportData.title}</title>
          <style>
            /* Base styles */
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: #1a1a2e;
              color: #ffffff;
              padding: 40px;
              margin: 0;
            }
            #report-content {
              max-width: 1200px;
              margin: 0 auto;
            }
            /* Chart containers */
            .recharts-wrapper {
              width: 100% !important;
              height: 300px !important;
            }
            .recharts-surface {
              width: 100% !important;
              height: 100% !important;
            }
            /* Utility classes */
            .bg-gray-800\\/50 { background: rgba(31, 41, 55, 0.5); }
            .border-gray-700 { border-color: #374151; }
            .text-gray-300 { color: #d1d5db; }
            .text-gray-400 { color: #9ca3af; }
            .text-white { color: #ffffff; }
            .text-blue-400 { color: #60a5fa; }
            .text-yellow-400 { color: #fbbf24; }
            .text-green-400 { color: #34d399; }
            .text-red-400 { color: #f87171; }
            .bg-yellow-900\\/20 { background: rgba(113, 63, 18, 0.2); }
            .bg-green-900\\/20 { background: rgba(6, 78, 59, 0.2); }
            .bg-red-900\\/20 { background: rgba(127, 29, 29, 0.2); }
            .border-yellow-800\\/30 { border-color: rgba(133, 77, 14, 0.3); }
            .border-green-800\\/30 { border-color: rgba(6, 78, 59, 0.3); }
            .border-red-800\\/30 { border-color: rgba(127, 29, 29, 0.3); }
            .border-blue-800\\/30 { border-color: rgba(30, 64, 175, 0.3); }
            .bg-gray-800 { background: #1f2937; }
            .bg-gray-900 { background: #111827; }
            .rounded-xl { border-radius: 12px; }
            .p-4 { padding: 16px; }
            .p-6 { padding: 24px; }
            .mb-8 { margin-bottom: 32px; }
            .mb-3 { margin-bottom: 12px; }
            .mt-8 { margin-top: 32px; }
            .mt-2 { margin-top: 8px; }
            .border { border: 1px solid; }
            .gap-4 { gap: 16px; }
            .grid { display: grid; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .text-center { text-align: center; }
            .text-2xl { font-size: 24px; }
            .text-xl { font-size: 20px; }
            .text-sm { font-size: 14px; }
            .text-xs { font-size: 12px; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .uppercase { text-transform: uppercase; }
            .tracking-wide { letter-spacing: 0.025em; }
            @media (max-width: 768px) {
              .grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
              .grid-cols-3 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            }
          </style>
        </head>
        <body>
          <div id="report-content">
            ${htmlContent}
          </div>
        </body>
      </html>
    `;

    // Send to server for PDF generation
    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: fullHtml,
        title: reportData.title,
        reportType: reportData.reportType
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate PDF');
    }

    // Download the PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportData.title.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    if (loadingToast) {
      loadingToast.remove();
    }

    showSuccessToast('PDF downloaded successfully!');

  } catch (error) {
    console.error('PDF Export Error:', error);
    showErrorToast('Failed to generate PDF. Please try again.');
  }
}

// Toast functions remain the same...

// ===== CLEAN COLORS FUNCTION =====

function cleanElementColors(element: HTMLElement): void {
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    
    // Fix inline styles
    if (htmlEl.style) {
      const style = htmlEl.style;
      
      // Replace oklch colors
      if (style.backgroundColor && style.backgroundColor.includes('oklch')) {
        style.backgroundColor = '#1a1a2e';
      }
      if (style.color && style.color.includes('oklch')) {
        style.color = '#ffffff';
      }
      if (style.borderColor && style.borderColor.includes('oklch')) {
        style.borderColor = '#374151';
      }
      if (style.fill && style.fill.includes('oklch')) {
        style.fill = '#3B82F6';
      }
      if (style.stroke && style.stroke.includes('oklch')) {
        style.stroke = '#3B82F6';
      }
      if (style.backgroundImage && style.backgroundImage.includes('oklch')) {
        style.backgroundImage = 'none';
        style.backgroundColor = '#1a1a2e';
      }
      if (style.background && style.background.includes('oklch')) {
        style.background = '#1a1a2e';
      }
      
      // Fix gradients
      if (style.backgroundImage && style.backgroundImage.includes('gradient')) {
        style.backgroundImage = 'none';
        style.backgroundColor = '#1a1a2e';
      }
    }
    
    // Fix classes
    const classNames = htmlEl.className || '';
    if (typeof classNames === 'string') {
      let newClasses = classNames;
      
      newClasses = newClasses.replace(/bg-\w+-\d+\/\d+/g, 'bg-gray-800');
      newClasses = newClasses.replace(/bg-gradient-to-[brltrb]+/g, '');
      newClasses = newClasses.replace(/from-\w+-\d+/g, '');
      newClasses = newClasses.replace(/to-\w+-\d+/g, '');
      newClasses = newClasses.replace(/text-\w+-\d+/g, 'text-gray-300');
      newClasses = newClasses.replace(/border-\w+-\d+/g, 'border-gray-700');
      
      if (newClasses !== classNames) {
        htmlEl.className = newClasses;
      }
    }
  });
}

// ===== TOAST FUNCTIONS =====

function showLoadingToast(message: string): HTMLElement | null {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #2563eb;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
  `;
  toast.innerHTML = `
    <svg style="width:20px;height:20px;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  return toast;
}

function showSuccessToast(message: string): void {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #16a34a;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    animation: fadeIn 0.3s ease-out;
  `;
  toast.innerHTML = `
    <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showErrorToast(message: string): void {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #dc2626;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    animation: fadeIn 0.3s ease-out;
  `;
  toast.innerHTML = `
    <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== INJECT CSS =====

function injectStyles(): void {
  if (document.getElementById('pdf-export-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'pdf-export-styles';
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

injectStyles();