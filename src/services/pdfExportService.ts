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
    animation: fadeIn 0.3s ease-out;
  `;
  toast.innerHTML = `
    <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4000);
}

function showErrorToast(message: string): void {
  const existing = document.querySelector('.pdf-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
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
    animation: fadeIn 0.3s ease-out;
  `;
  toast.innerHTML = `
    <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4000);
}

// ===== GENERATE COMPREHENSIVE REPORT HTML =====

function generateComprehensiveReportHTML(reportData: ReportData): string {
  // Extract data from sections
  let expenseAnalysisContent = '';
  let monthlyInsights = '';
  let portfolioInsights = '';
  let healthInsights = '';

  reportData.sections.forEach((section: any) => {
    if (section.heading.includes('Spending Pattern') || 
        section.heading.includes('Where Your Money Goes') ||
        section.heading.includes('Unusual') ||
        section.heading.includes('Friendly Suggestions')) {
      expenseAnalysisContent += `
        <div style="margin-bottom: 20px; padding: 16px; background: #1f2937; border-radius: 12px; border: 1px solid #374151;">
          <h3 style="color: #60a5fa; font-size: 18px; margin-bottom: 8px;">${section.heading}</h3>
          <p style="color: #d1d5db; font-size: 14px; line-height: 1.6;">${section.content || 'See details below'}</p>
        </div>
      `;
    }
  });

  // Build full HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${reportData.title} - Comprehensive Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          background: #1a1a2e;
          color: #ffffff;
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 2px solid #374151;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }
        .header p {
          color: #9ca3af;
          font-size: 14px;
          margin: 8px 0 0;
        }
        .section {
          margin-bottom: 30px;
          background: #111827;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #374151;
        }
        .section h2 {
          color: #60a5fa;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #374151;
        }
        .section h3 {
          color: #fbbf24;
          font-size: 16px;
          font-weight: 600;
          margin: 16px 0 8px 0;
        }
        .section p, .section li {
          color: #d1d5db;
          font-size: 14px;
          line-height: 1.6;
        }
        .section ul {
          padding-left: 20px;
        }
        .section li {
          margin-bottom: 4px;
        }
        .highlight-green { color: #34d399; }
        .highlight-red { color: #f87171; }
        .highlight-yellow { color: #fbbf24; }
        .highlight-blue { color: #60a5fa; }
        .card {
          background: #1f2937;
          border-radius: 8px;
          padding: 16px;
          margin: 12px 0;
          border: 1px solid #374151;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        .stat {
          text-align: center;
          padding: 16px;
          background: #1f2937;
          border-radius: 8px;
          border: 1px solid #374151;
        }
        .stat .number {
          font-size: 28px;
          font-weight: 700;
        }
        .stat .label {
          color: #9ca3af;
          font-size: 12px;
          margin-top: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #374151;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        @media print {
          body { padding: 20px; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 ${reportData.title}</h1>
        <p>Generated on ${new Date(reportData.generatedAt).toLocaleString()} • Report Type: ${reportData.reportType}</p>
      </div>

      <!-- Executive Summary -->
      <div class="section">
        <h2>📋 Executive Summary</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
          ${reportData.keyTakeaways.slice(0, 3).map((item: string) => `
            <div class="stat">
              <div class="number highlight-blue">${item.split(':')[0]}</div>
              <div class="label">${item.split(':')[1] || item}</div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 16px;">
          ${reportData.summary ? `<p>${reportData.summary}</p>` : ''}
        </div>
      </div>

      <!-- Expense Analysis -->
      <div class="section">
        <h2>💸 Expense Analysis</h2>
        ${expenseAnalysisContent || '<p>Expense analysis details available in the full report.</p>'}
      </div>

      <!-- Monthly Insights -->
      <div class="section">
        <h2>📈 Monthly Spending Insights</h2>
        <div class="grid-2">
          ${reportData.sections
            .filter((s: any) => s.heading.includes('Trend') || s.heading.includes('Reality'))
            .map((section: any) => `
              <div class="card">
                <h3>${section.heading}</h3>
                <p>${section.content || 'Analysis available'}</p>
              </div>
            `).join('')}
        </div>
      </div>

      <!-- Portfolio Insights -->
      <div class="section">
        <h2>📊 Portfolio Summary</h2>
        ${reportData.sections
          .filter((s: any) => s.heading.includes('Portfolio') || s.heading.includes('Stock') || s.heading.includes('Sector'))
          .slice(0, 2)
          .map((section: any) => `
            <div class="card">
              <h3>${section.heading}</h3>
              <p>${section.content || 'Portfolio details available'}</p>
            </div>
          `).join('') || '<p>No portfolio data available.</p>'}
      </div>

      <!-- Health Insights -->
      <div class="section">
        <h2>❤️ Financial Wellness</h2>
        ${reportData.sections
          .filter((s: any) => s.heading.includes('Wellness') || s.heading.includes('Health') || s.heading.includes('Action'))
          .slice(0, 2)
          .map((section: any) => `
            <div class="card">
              <h3>${section.heading}</h3>
              <p>${section.content || 'Wellness insights available'}</p>
            </div>
          `).join('') || '<p>No wellness data available.</p>'}
      </div>

      <!-- Recommendations -->
      <div class="section">
        <h2>🎯 Recommendations</h2>
        ${reportData.recommendations.map((rec: any) => `
          <div class="card" style="border-left: 4px solid #60a5fa;">
            <h3 style="color: #60a5fa; margin: 0 0 4px 0;">${rec.action}</h3>
            <p style="margin: 4px 0; color: #9ca3af;">Why: ${rec.why}</p>
            <p style="margin: 4px 0; color: #34d399;">Impact: ${rec.impact}</p>
          </div>
        `).join('')}
      </div>

      <!-- Next Steps -->
      <div class="section">
        <h2>🚀 Next Steps</h2>
        <ul>
          ${reportData.nextSteps.map((step: string) => `
            <li>${step}</li>
          `).join('')}
        </ul>
      </div>

      <div class="footer">
        Generated by FinPilot AI • Confidential Financial Report
      </div>
    </body>
    </html>
  `;
}

// ===== MAIN EXPORT FUNCTION =====

export async function exportReportToPDF(
  elementId: string,
  reportData: ReportData
): Promise<void> {
  try {
    // Only allow export for expense analysis
    if (reportData.reportType !== 'expense') {
      showErrorToast('PDF export is only available for Expense Analysis reports.');
      return;
    }

    showLoadingToast('Generating comprehensive PDF report...');

    // Generate comprehensive HTML
    const htmlContent = generateComprehensiveReportHTML(reportData);

    // Create a print container
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.innerHTML = htmlContent;
    printContainer.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      background: #1a1a2e;
      color: #ffffff;
      padding: 40px;
      z-index: 99999;
      overflow-y: auto;
      max-height: 100vh;
    `;
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
          max-height: none !important;
        }
        @page {
          margin: 0.5cm;
          size: A4 portrait;
        }
        .section {
          page-break-inside: avoid;
        }
      }
    `;
    document.head.appendChild(printStyles);

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 800));

    // Remove loading toast
    const loadingToast = document.querySelector('.pdf-toast');
    if (loadingToast) loadingToast.remove();

    // Trigger print
    window.print();

    // Cleanup
    const styles = document.getElementById('print-styles');
    if (styles) styles.remove();
    if (printContainer.parentNode) printContainer.remove();

    showSuccessToast('PDF downloaded successfully!');

  } catch (error) {
    console.error('PDF Export Error:', error);
    const loadingToast = document.querySelector('.pdf-toast');
    if (loadingToast) loadingToast.remove();
    showErrorToast('Failed to generate PDF. Please try again.');
  }
}