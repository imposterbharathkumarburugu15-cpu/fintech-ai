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

export interface PDFExportOptions {
  sectionTypes?: string[]; // ['expense', 'investment', 'health', 'monthly']
  includeAll?: boolean;
  filename?: string;
}

// ===== TOAST FUNCTIONS =====

function showLoadingToast(message: string): HTMLElement | null {
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
    max-width: 400px;
  `;
  toast.innerHTML = `
    <svg style="width:20px;height:20px;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75"/>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

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
    `;
    document.head.appendChild(style);
  }

  return toast;
}

function showSuccessToast(message: string): void {
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
    max-width: 400px;
  `;
  toast.innerHTML = `
    <svg style="width:20px;height:20px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 4000);
}

function showErrorToast(message: string): void {
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
    max-width: 400px;
  `;
  toast.innerHTML = `
    <svg style="width:20px;height:20px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 4000);
}

// ===== HELPER FUNCTIONS =====

function findSectionsByType(element: HTMLElement, types: string[]): HTMLElement[] {
  const sections: HTMLElement[] = [];
  
  // Look for section containers with data attributes
  const allSections = element.querySelectorAll('[data-section-type]');
  
  allSections.forEach((section) => {
    const type = section.getAttribute('data-section-type');
    if (type && types.includes(type)) {
      // Find the parent section container
      let parent = section.closest('.report-section') as HTMLElement;
      if (parent) {
        sections.push(parent);
      }
    }
  });
  
  // Fallback: Look for heading-based identification
  if (sections.length === 0) {
    const headings = element.querySelectorAll('h2, h3, .heading');
    headings.forEach((heading) => {
      const text = heading.textContent?.toLowerCase() || '';
      const shouldInclude = types.some(type => {
        if (type === 'expense') {
          return text.includes('expense') || text.includes('summary') || text.includes('spending');
        }
        if (type === 'investment') {
          return text.includes('investment') || text.includes('portfolio') || text.includes('stock');
        }
        if (type === 'health') {
          return text.includes('health') || text.includes('wellness') || text.includes('checklist');
        }
        if (type === 'monthly') {
          return text.includes('monthly') || text.includes('reality check') || text.includes('trend');
        }
        return false;
      });
      
      if (shouldInclude) {
        let parent = heading.closest('.report-section') as HTMLElement;
        if (parent) {
          sections.push(parent);
        }
      }
    });
  }
  
  return sections;
}

function generateReportTitle(options: PDFExportOptions): string {
  if (options.sectionTypes?.includes('expense')) {
    return 'Expense Analysis Report';
  }
  if (options.sectionTypes?.includes('investment')) {
    return 'Investment Portfolio Report';
  }
  if (options.sectionTypes?.includes('health')) {
    return 'Financial Health Report';
  }
  if (options.sectionTypes?.includes('monthly')) {
    return 'Monthly Financial Report';
  }
  return 'Financial Report';
}

// ===== MAIN EXPORT FUNCTION =====

export async function exportReportToPDF(
  elementId: string,
  reportData: ReportData,
  options: PDFExportOptions = { includeAll: true }
): Promise<void> {
  try {
    // Determine what to export
    const sectionTypes = options.sectionTypes || [];
    const isSpecificExport = sectionTypes.length > 0;
    const exportAll = options.includeAll !== false && !isSpecificExport;
    
    const reportTitle = options.filename || generateReportTitle(options);
    
    showLoadingToast(isSpecificExport 
      ? `Preparing ${sectionTypes.join(', ')} report...` 
      : 'Preparing PDF...'
    );

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Report element not found');
    }

    // Save original title
    const originalTitle = document.title;
    document.title = reportTitle;

    // Create a print container
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      background: #1a1a2e;
      color: #ffffff;
      padding: 40px;
      z-index: -1;
      opacity: 0;
      pointer-events: none;
    `;

    let contentToClone: HTMLElement;

    if (exportAll) {
      // Clone everything
      contentToClone = element.cloneNode(true) as HTMLElement;
    } else {
      // Clone only specific sections
      const wrapper = document.createElement('div');
      wrapper.className = 'report-wrapper';
      
      // Add header
      const header = document.createElement('div');
      header.className = 'report-header';
      header.style.cssText = `
        padding: 20px 0;
        border-bottom: 2px solid #374151;
        margin-bottom: 24px;
      `;
      header.innerHTML = `
        <h1 style="font-size: 24px; font-weight: bold; color: white; margin: 0;">
          ${reportTitle}
        </h1>
        <p style="color: #9ca3af; margin: 8px 0 0 0;">
          Generated on: ${new Date().toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">
          Report Type: ${sectionTypes.join(', ').toUpperCase()}
        </p>
      `;
      wrapper.appendChild(header);

      // Find and clone specific sections
      const allSections = element.querySelectorAll('[data-section-type]');
      let foundSections = false;
      
      allSections.forEach((section) => {
        const type = section.getAttribute('data-section-type');
        if (type && sectionTypes.includes(type)) {
          const parent = section.closest('.report-section') as HTMLElement;
          if (parent) {
            const clone = parent.cloneNode(true) as HTMLElement;
            wrapper.appendChild(clone);
            foundSections = true;
          }
        }
      });

      // If no sections found with data attributes, try using headings
      if (!foundSections) {
        const headings = element.querySelectorAll('h2, h3, .heading');
        let currentSection: HTMLElement | null = null;
        
        headings.forEach((heading) => {
          const text = heading.textContent?.toLowerCase() || '';
          const shouldInclude = sectionTypes.some(type => {
            if (type === 'expense') {
              return text.includes('expense') || text.includes('summary') || text.includes('spending');
            }
            if (type === 'investment') {
              return text.includes('investment') || text.includes('portfolio') || text.includes('stock');
            }
            if (type === 'health') {
              return text.includes('health') || text.includes('wellness') || text.includes('checklist');
            }
            if (type === 'monthly') {
              return text.includes('monthly') || text.includes('reality check') || text.includes('trend');
            }
            return false;
          });
          
          if (shouldInclude) {
            const parent = heading.closest('.report-section') as HTMLElement;
            if (parent) {
              const clone = parent.cloneNode(true) as HTMLElement;
              wrapper.appendChild(clone);
              foundSections = true;
            }
          }
        });
      }

      // If still no sections found, clone all content
      if (!foundSections) {
        contentToClone = element.cloneNode(true) as HTMLElement;
      } else {
        contentToClone = wrapper;
      }
    }

    // Remove interactive elements from clone
    const buttons = contentToClone.querySelectorAll('button, .no-print, .cursor-pointer');
    buttons.forEach(el => {
      if (el.classList) el.classList.add('no-print');
    });

    // Fix chart containers in clone
    const charts = contentToClone.querySelectorAll('.recharts-wrapper');
    charts.forEach((chart: any) => {
      chart.style.width = '100%';
      chart.style.height = '300px';
      chart.style.display = 'block';
    });

    // Add section markers for identification
    const sections = contentToClone.querySelectorAll('.report-section');
    sections.forEach((section, index) => {
      const heading = section.querySelector('h2, h3, .heading');
      if (heading) {
        const type = heading.textContent?.toLowerCase() || '';
        let sectionType = 'unknown';
        if (type.includes('expense') || type.includes('spending')) sectionType = 'expense';
        else if (type.includes('investment') || type.includes('portfolio')) sectionType = 'investment';
        else if (type.includes('health') || type.includes('wellness')) sectionType = 'health';
        else if (type.includes('monthly') || type.includes('reality')) sectionType = 'monthly';
        section.setAttribute('data-section-type', sectionType);
      }
    });

    printContainer.appendChild(contentToClone);
    document.body.appendChild(printContainer);

    // Add print styles
    const printStyles = document.createElement('style');
    printStyles.id = 'print-styles';
    printStyles.textContent = `
      @media print {
        body * {
          visibility: hidden !important;
        }
        #print-container, #print-container * {
          visibility: visible !important;
        }
        #print-container {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          background: #1a1a2e !important;
          color: #ffffff !important;
          padding: 20px !important;
          opacity: 1 !important;
          z-index: 9999 !important;
          pointer-events: auto !important;
        }
        .recharts-wrapper {
          width: 100% !important;
          height: 300px !important;
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
        .text-gray-500 { color: #6b7280 !important; }
        .text-white { color: #ffffff !important; }
        .text-blue-300 { color: #93c5fd !important; }
        .text-blue-400 { color: #60a5fa !important; }
        .text-yellow-400 { color: #fbbf24 !important; }
        .text-green-400 { color: #34d399 !important; }
        .text-red-400 { color: #f87171 !important; }
        .text-purple-400 { color: #a78bfa !important; }
        .bg-gray-800\\/50 { background: rgba(31, 41, 55, 0.5) !important; }
        .bg-gray-900 { background: #111827 !important; }
        .bg-gray-900\\/20 { background: rgba(17, 24, 39, 0.2) !important; }
        .bg-blue-900\\/20 { background: rgba(30, 58, 138, 0.2) !important; }
        .bg-green-900\\/20 { background: rgba(20, 83, 45, 0.2) !important; }
        .bg-purple-900\\/20 { background: rgba(49, 46, 129, 0.2) !important; }
        .bg-yellow-900\\/20 { background: rgba(146, 114, 16, 0.2) !important; }
        .bg-red-900\\/20 { background: rgba(127, 29, 29, 0.2) !important; }
        .border-gray-700 { border-color: #374151 !important; }
        .border-blue-800\\/30 { border-color: rgba(30, 64, 175, 0.3) !important; }
        .border-green-800\\/30 { border-color: rgba(21, 128, 61, 0.3) !important; }
        .border-yellow-800\\/30 { border-color: rgba(113, 63, 18, 0.3) !important; }
        .border-red-800\\/30 { border-color: rgba(127, 29, 29, 0.3) !important; }
        .report-section {
          page-break-inside: avoid;
          margin-bottom: 20px;
        }
        @page {
          margin: 0.5cm;
          size: A4 portrait;
        }
        .space-y-4 > * {
          page-break-inside: avoid;
        }
        .space-y-6 > * {
          page-break-inside: avoid;
        }
      }
    `;
    document.head.appendChild(printStyles);

    // Make print container visible for print
    printContainer.style.opacity = '1';
    printContainer.style.zIndex = '9999';
    printContainer.style.pointerEvents = 'auto';

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 800));

    // Remove loading toast
    const loadingToast = document.querySelector('.pdf-toast');
    if (loadingToast) loadingToast.remove();

    // Trigger print
    window.print();

    // Cleanup
    document.title = originalTitle;
    const styles = document.getElementById('print-styles');
    if (styles) styles.remove();
    if (printContainer.parentNode) printContainer.remove();

    const successMessage = isSpecificExport
      ? `PDF ready! ${sectionTypes.join(', ')} report is prepared. Use "Save as PDF" in the print dialog.`
      : 'PDF ready! Use "Save as PDF" in the print dialog.';
    
    showSuccessToast(successMessage);

  } catch (error) {
    console.error('PDF Export Error:', error);
    const loadingToast = document.querySelector('.pdf-toast');
    if (loadingToast) loadingToast.remove();
    showErrorToast('Failed to prepare PDF. Please try again.');
  }
}

// ===== CONVENIENCE FUNCTIONS =====

export async function exportExpenseReportPDF(
  elementId: string,
  reportData: ReportData,
  filename?: string
): Promise<void> {
  return exportReportToPDF(elementId, reportData, {
    sectionTypes: ['expense'],
    filename: filename || 'Expense_Analysis_Report'
  });
}

export async function exportInvestmentReportPDF(
  elementId: string,
  reportData: ReportData,
  filename?: string
): Promise<void> {
  return exportReportToPDF(elementId, reportData, {
    sectionTypes: ['investment'],
    filename: filename || 'Investment_Portfolio_Report'
  });
}

export async function exportHealthReportPDF(
  elementId: string,
  reportData: ReportData,
  filename?: string
): Promise<void> {
  return exportReportToPDF(elementId, reportData, {
    sectionTypes: ['health'],
    filename: filename || 'Financial_Health_Report'
  });
}

export async function exportMonthlyReportPDF(
  elementId: string,
  reportData: ReportData,
  filename?: string
): Promise<void> {
  return exportReportToPDF(elementId, reportData, {
    sectionTypes: ['monthly'],
    filename: filename || 'Monthly_Financial_Report'
  });
}