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
    const loadingToast = showLoadingToast('Preparing PDF...');

    // Get the element
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Report element not found');
    }

    // Save current title
    const originalTitle = document.title;
    document.title = reportData.title || 'Financial Report';

    // Add print styles
    const printStyles = document.createElement('style');
    printStyles.id = 'print-styles';
    printStyles.textContent = `
      @media print {
        /* Hide everything except the report */
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
        }
        /* Fix chart rendering */
        .recharts-wrapper {
          width: 100% !important;
          height: 300px !important;
          overflow: visible !important;
        }
        .recharts-surface {
          width: 100% !important;
          height: 100% !important;
        }
        /* Remove interactive elements */
        button, .cursor-pointer {
          cursor: default !important;
        }
        /* Hide export buttons and interactive elements */
        .no-print {
          display: none !important;
        }
        /* Ensure all text is visible */
        .text-gray-300 { color: #d1d5db !important; }
        .text-gray-400 { color: #9ca3af !important; }
        .text-white { color: #ffffff !important; }
        .text-blue-400 { color: #60a5fa !important; }
        .text-yellow-400 { color: #fbbf24 !important; }
        .text-green-400 { color: #34d399 !important; }
        .text-red-400 { color: #f87171 !important; }
        /* Fix backgrounds */
        .bg-gray-800\\/50 { background: rgba(31, 41, 55, 0.5) !important; }
        .bg-gray-900 { background: #111827 !important; }
        /* Ensure charts are visible */
        .recharts-pie, .recharts-bar, .recharts-line {
          opacity: 1 !important;
        }
        /* Page margins */
        @page {
          margin: 0.5cm;
          size: A4 portrait;
        }
      }
    `;
    document.head.appendChild(printStyles);

    // Wait for styles to apply
    await new Promise(resolve => setTimeout(resolve, 300));

    // Close loading toast
    if (loadingToast) {
      loadingToast.remove();
    }

    // Use browser's print dialog - user can choose "Save as PDF"
    window.print();

    // Clean up
    document.title = originalTitle;
    const styles = document.getElementById('print-styles');
    if (styles) {
      styles.remove();
    }

    showSuccessToast('PDF ready! Use "Save as PDF" in the print dialog.');

  } catch (error) {
    console.error('PDF Export Error:', error);
    showErrorToast('Failed to prepare PDF. Please try again.');
  }
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
  
  if (!document.getElementById('pdf-spin-style')) {
    const style = document.createElement('style');
    style.id = 'pdf-spin-style';
    style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }
  
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

// Inject styles
const style = document.createElement('style');
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