// src/services/pdfExportService.ts

import jsPDF from 'jspdf';

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
    const loadingToast = showLoadingToast('Generating your financial report...');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 22;
    let y = margin;
    let pageNumber = 1;

    // ===== ENHANCED COLOR PALETTE =====
    const colors = {
      primary: '#1a1a2e',
      secondary: '#2d2d44',
      accent: '#2563eb',
      textDark: '#1a1a2e',
      textMedium: '#4a4a5a',
      textLight: '#888899',
      border: '#e8e8f0',
      cardBg: '#f8f8fc',
      white: '#ffffff',
      gold: '#d4af37'
    };

    // ===== HELPER FUNCTIONS =====

    const addNewPageIfNeeded = (minSpace: number = 20) => {
      if (y > pageHeight - margin - minSpace) {
        pdf.addPage();
        y = margin;
        pageNumber++;
        return true;
      }
      return false;
    };

    // Enhanced text with better font handling
    const addText = (text: string, size: number = 11, isBold: boolean = false, color: string = colors.textDark, indent: number = 0, lineHeight: number = 5.5) => {
      const lines = pdf.splitTextToSize(text, pageWidth - margin * 2 - indent);
      pdf.setFontSize(size);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setTextColor(color);
      lines.forEach((line: string) => {
        if (y > pageHeight - margin - 10) {
          pdf.addPage();
          y = margin;
          pageNumber++;
        }
        pdf.text(line, margin + indent, y);
        y += lineHeight;
      });
      return y;
    };

    const addDivider = (color: string = colors.border, thickness: number = 0.3, spacing: number = 8) => {
      pdf.setDrawColor(color);
      pdf.setLineWidth(thickness);
      pdf.line(margin, y, pageWidth - margin, y);
      y += spacing;
    };

    const addSectionHeader = (title: string, level: 'h1' | 'h2' | 'h3' = 'h2') => {
      addNewPageIfNeeded(30);
      
      const sizes = { h1: 24, h2: 18, h3: 14 };
      const size = sizes[level] || 14;
      
      pdf.setFontSize(size);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.primary);
      pdf.text(title, margin, y);
      y += size * 0.4;
      
      // Subtle underline for h2
      if (level === 'h2') {
        pdf.setDrawColor(colors.accent);
        pdf.setLineWidth(0.8);
        pdf.line(margin, y, margin + 50, y);
        y += 8;
      } else {
        y += 6;
      }
    };

    // ===== BUILD PDF =====

    // ----- TITLE -----
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.primary);
    pdf.text(reportData.title, margin, y);
    y += 14;

    // ----- DATE -----
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.textLight);
    pdf.text(`Generated on ${new Date(reportData.generatedAt).toLocaleString()}`, margin, y);
    y += 16;

    // Divider
    addDivider(colors.border, 0.5, 12);

    // ----- EXECUTIVE SUMMARY -----
    addSectionHeader('Executive Summary', 'h2');

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.textMedium);
    const summaryPoints = reportData.summary.split(' • ');
    summaryPoints.forEach((point: string) => {
      addText(`- ${point}`, 11, false, colors.textMedium, 0, 5.5);
    });
    y += 4;

    addDivider(colors.border, 0.3, 10);

    // ----- SECTIONS -----
    reportData.sections.forEach((section, sectionIndex) => {
      addNewPageIfNeeded(40);

      const cleanHeading = section.heading.replace(/[^\w\s]/g, '').trim();
      
      // Section header
      addSectionHeader(cleanHeading, 'h2');

      // Content
      let content = section.content;
      
      // Enhance content with better formatting if it's a summary
      if (section.chartData) {
        if (section.heading.toLowerCase().includes('spending') || section.heading.toLowerCase().includes('expense')) {
          const data = Object.entries(section.chartData);
          const total = data.reduce((sum: number, [_, val]) => sum + (val as number), 0);
          const sorted = data.sort((a, b) => (b[1] as number) - (a[1] as number));
          content = `Total monthly spending: ₹${total.toLocaleString()} across ${data.length} categories.`;
        }
      }

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(colors.textDark);
      const contentLines = pdf.splitTextToSize(content, pageWidth - margin * 2);
      contentLines.forEach((line: string) => {
        if (y > pageHeight - margin - 10) {
          pdf.addPage();
          y = margin;
          pageNumber++;
        }
        pdf.text(line, margin, y);
        y += 5.5;
      });
      y += 4;

      // Add data breakdown for spending sections
      if (section.chartData && section.heading.toLowerCase().includes('spending')) {
        const data = Object.entries(section.chartData);
        const total = data.reduce((sum: number, [_, val]) => sum + (val as number), 0);
        const sorted = data.sort((a, b) => (b[1] as number) - (a[1] as number));
        
        y += 2;
        sorted.forEach(([name, value], index) => {
          if (index < 5) { // Show top 5
            const pct = ((value as number) / total * 100);
            addText(`  • ${name}: ₹${(value as number).toLocaleString()} (${pct.toFixed(0)}%)`, 10.5, false, colors.textMedium, 4, 5);
          }
        });
        if (sorted.length > 5) {
          const otherTotal = sorted.slice(5).reduce((sum: number, [_, val]) => sum + (val as number), 0);
          const otherPct = (otherTotal / total * 100);
          addText(`  • Other: ₹${otherTotal.toLocaleString()} (${otherPct.toFixed(0)}%)`, 10.5, false, colors.textMedium, 4, 5);
        }
        y += 4;
      }

      // Divider between sections (except last)
      if (sectionIndex < reportData.sections.length - 1) {
        addDivider(colors.border, 0.3, 10);
      }
    });

    // ----- KEY TAKEAWAYS -----
    if (reportData.keyTakeaways.length > 0) {
      addNewPageIfNeeded(30);

      addSectionHeader('Key Takeaways', 'h2');

      reportData.keyTakeaways.forEach((takeaway: string) => {
        addText(`- ${takeaway}`, 11, false, colors.textMedium, 0, 5.5);
      });
      y += 4;

      addDivider(colors.border, 0.3, 10);
    }

    // ----- RECOMMENDATIONS -----
    if (reportData.recommendations.length > 0) {
      addNewPageIfNeeded(40);

      addSectionHeader('Recommended Actions', 'h2');

      reportData.recommendations.forEach((rec, index) => {
        addNewPageIfNeeded(25);

        // Recommendation header
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.primary);
        pdf.text(`${index + 1}. ${rec.action}`, margin, y);
        y += 7;

        // Why
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.textMedium);
        pdf.text(`Why: ${rec.why}`, margin, y);
        y += 6;

        // Impact
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.textMedium);
        pdf.text(`Impact: ${rec.impact}`, margin, y);
        y += 8;

        // Divider between recommendations
        if (index < reportData.recommendations.length - 1) {
          addDivider(colors.border, 0.2, 6);
        }
      });
      y += 4;

      addDivider(colors.border, 0.3, 10);
    }

    // ----- NEXT STEPS -----
    if (reportData.nextSteps.length > 0) {
      addNewPageIfNeeded(30);

      addSectionHeader('Next Steps', 'h2');

      reportData.nextSteps.forEach((step, index) => {
        addText(`${index + 1}. ${step}`, 11, false, colors.textMedium, 0, 5.5);
      });
    }

    // ===== FOOTER =====
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(colors.textLight);
    const footer = 'Generated by FinPilot AI';
    const footerWidth = pdf.getStringUnitWidth(footer) * 9 / pdf.internal.scaleFactor;
    pdf.text(footer, pageWidth - margin - footerWidth, pageHeight - 12);
    pdf.text(`Page ${pageNumber}`, margin, pageHeight - 12);

    // ===== SAVE =====
    const fileName = `${reportData.title.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    if (loadingToast) {
      loadingToast.remove();
    }

    showSuccessToast('Financial report downloaded successfully!');

  } catch (error) {
    console.error('PDF Export Error:', error);
    showErrorToast('Failed to generate PDF. Please try again.');
  }
}

// ===== TOAST FUNCTIONS =====

function showLoadingToast(message: string): HTMLElement | null {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
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
    font-family: system-ui, -apple-system, sans-serif;
  `;
  toast.innerHTML = `
    <svg style="width:20px;height:20px;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75"/>
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
    bottom: 24px;
    right: 24px;
    background: #059669;
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
    font-family: system-ui, -apple-system, sans-serif;
    animation: fadeIn 0.3s ease-out;
  `;
  toast.innerHTML = `
    <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  
  if (!document.getElementById('pdf-fade-style')) {
    const style = document.createElement('style');
    style.id = 'pdf-fade-style';
    style.textContent = '@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }';
    document.head.appendChild(style);
  }
  
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
    bottom: 24px;
    right: 24px;
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
    font-family: system-ui, -apple-system, sans-serif;
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