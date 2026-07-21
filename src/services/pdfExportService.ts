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

// ===== TOAST FUNCTIONS =====

function showLoadingToast(message: string): HTMLElement | null {
  // Remove any existing toast
  const existing = document.querySelector('.pdf-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'pdf-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #2563eb;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: fadeIn 0.3s ease-out;
  `;
  toast.innerHTML = `
    <svg style="width:20px;height:20px;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75"/>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  // Add animation styles if not already present
  if (!document.getElementById('pdf-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'pdf-toast-styles';
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
      }
    `;
    document.head.appendChild(style);
  }

  return toast;
}

function showSuccessToast(message: string): void {
  // Remove any existing toast
  const existing = document.querySelector('.pdf-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'pdf-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #16a34a;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    toast.style.animation = 'fadeOut 0.3s ease-in';
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 300);
  }, 3000);
}

function showErrorToast(message: string): void {
  // Remove any existing toast
  const existing = document.querySelector('.pdf-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'pdf-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #dc2626;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    toast.style.animation = 'fadeOut 0.3s ease-in';
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 300);
  }, 3000);
}

// ===== MAIN EXPORT FUNCTION =====

export async function exportReportToPDF(
  elementId: string,
  reportData: ReportData
): Promise<void> {
  try {
    showLoadingToast('Preparing PDF...');

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Report element not found');
    }

    // Save current title
    const originalTitle = document.title;
    document.title = reportData.title || 'Financial Report';

    // Scroll to top
    window.scrollTo(0, 0);

    // Add print styles
    const printStyles = document.createElement('style');
    printStyles.id = 'print-styles';
    printStyles.textContent = `
      @media print {
        body * {
          visibility: hidden !important;
        }
        #report-content, #report-content * {
          visibility: visible !important;
        }
        #report-content {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          background: #1a1a2e !important;
          color: #ffffff !important;
          padding: 20px !important;
          max-width: 100% !important;
        }
        .recharts-wrapper {
          width: 100% !important;
          height: 300px !important;
          overflow: visible !important;
          page-break-inside: avoid !important;
        }
        .recharts-surface {
          width: 100% !important;
          height: 100% !important;
        }
        .no-print {
          display: none !important;
        }
        .text-gray-300 { color: #d1d5db !important; }
        .text-gray-400 { color: #9ca3af !important; }
        .text-white { color: #ffffff !important; }
        .text-blue-400 { color: #60a5fa !important; }
        .text-yellow-400 { color: #fbbf24 !important; }
        .text-green-400 { color: #34d399 !important; }
        .text-red-400 { color: #f87171 !important; }
        .bg-gray-800\\/50 { background: rgba(31, 41, 55, 0.5) !important; }
        .bg-gray-900 { background: #111827 !important; }
        @page {
          margin: 0.5cm;
          size: A4 portrait;
        }
      }
    `;
    document.head.appendChild(printStyles);

    // Wait for styles
    await new Promise(resolve => setTimeout(resolve, 500));

    // Trigger print
    window.print();

    // Clean up
    document.title = originalTitle;
    const styles = document.getElementById('print-styles');
    if (styles) styles.remove();

    // Remove loading toast
    const loadingToast = document.querySelector('.pdf-toast');
    if (loadingToast) loadingToast.remove();

    showSuccessToast('PDF ready! Use "Save as PDF" in the print dialog.');

  } catch (error) {
    console.error('PDF Export Error:', error);
    const loadingToast = document.querySelector('.pdf-toast');
    if (loadingToast) loadingToast.remove();
    showErrorToast('Failed to prepare PDF. Please try again.');
  }
}