// src/services/pdfExportService.ts

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

    // Create a clean clone with safe colors
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1200px';
    container.style.backgroundColor = '#1a1a2e';
    container.style.padding = '40px';
    container.style.borderRadius = '16px';
    container.style.color = '#ffffff';
    container.style.fontFamily = 'Arial, sans-serif';

    // Clone the element
    const clone = element.cloneNode(true) as HTMLElement;
    
    // ✅ FIX: Clean all oklch colors from the clone
    removeAllOklchColors(clone);
    
    // ✅ FIX: Replace all Tailwind color classes with safe colors
    replaceTailwindClasses(clone);
    
    container.appendChild(clone);
    document.body.appendChild(container);

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Capture with html2canvas
    const canvas = await html2canvas(container, {
      scale: 2.5,
      backgroundColor: '#1a1a2e',
      useCORS: true,
      logging: false,
      width: 1200,
      height: container.scrollHeight,
      windowWidth: 1200,
      windowHeight: container.scrollHeight,
      onclone: (clonedDoc) => {
        // Final cleanup of any remaining oklch colors
        const elements = clonedDoc.querySelectorAll('*');
        elements.forEach((el: any) => {
          if (el.style) {
            // Replace any remaining oklch colors
            ['backgroundColor', 'color', 'borderColor', 'fill', 'stroke', 'background'].forEach(prop => {
              if (el.style[prop] && el.style[prop].includes('oklch')) {
                el.style[prop] = prop === 'color' ? '#ffffff' : 
                                 prop === 'backgroundColor' ? '#1a1a2e' :
                                 prop === 'borderColor' ? '#374151' :
                                 '#1a1a2e';
              }
            });
            // Fix gradients
            if (el.style.backgroundImage && el.style.backgroundImage.includes('oklch')) {
              el.style.backgroundImage = 'none';
              el.style.backgroundColor = '#1a1a2e';
            }
          }
        });
        
        // Fix chart containers
        const charts = clonedDoc.querySelectorAll('.recharts-wrapper');
        charts.forEach((chart: any) => {
          chart.style.width = '100%';
          chart.style.height = '300px';
          chart.style.display = 'block';
        });
      }
    });

    // Remove container
    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = pdfHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    // Add subsequent pages if needed
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    if (loadingToast) {
      loadingToast.remove();
    }

    const fileName = `${reportData.title.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    showSuccessToast('PDF downloaded successfully!');

  } catch (error) {
    console.error('PDF Export Error:', error);
    showErrorToast('Failed to generate PDF. Please try again.');
  }
}

// ===== REMOVE OKLCH COLORS =====

function removeAllOklchColors(element: HTMLElement): void {
  // Remove oklch from inline styles
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    
    if (htmlEl.style) {
      const style = htmlEl.style;
      
      // Check all style properties for oklch
      const props = ['backgroundColor', 'color', 'borderColor', 'fill', 'stroke', 'background', 'backgroundImage'];
      props.forEach(prop => {
        const value = (style as any)[prop];
        if (value && value.includes('oklch')) {
          (style as any)[prop] = prop === 'color' ? '#ffffff' : 
                                 prop === 'backgroundColor' ? '#1a1a2e' :
                                 prop === 'borderColor' ? '#374151' :
                                 prop === 'fill' ? '#3B82F6' :
                                 prop === 'stroke' ? '#3B82F6' :
                                 '#1a1a2e';
        }
      });
      
      // Fix gradients
      if (style.backgroundImage && style.backgroundImage.includes('oklch')) {
        style.backgroundImage = 'none';
        style.backgroundColor = '#1a1a2e';
      }
      if (style.background && style.background.includes('oklch')) {
        style.background = '#1a1a2e';
      }
      
      // Fix box-shadow
      if (style.boxShadow && style.boxShadow.includes('oklch')) {
        style.boxShadow = 'none';
      }
    }
  });
}

// ===== REPLACE TAILWIND CLASSES =====

function replaceTailwindClasses(element: HTMLElement): void {
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const classNames = htmlEl.className || '';
    
    if (typeof classNames === 'string') {
      let newClasses = classNames;
      
      // Background colors
      newClasses = newClasses.replace(/bg-\w+-\d+\/\d+/g, 'bg-gray-800');
      newClasses = newClasses.replace(/bg-gray-\d+\/\d+/g, 'bg-gray-800');
      newClasses = newClasses.replace(/bg-gray-\d+/g, 'bg-gray-800');
      newClasses = newClasses.replace(/bg-white\/\d+/g, '');
      
      // Gradients
      newClasses = newClasses.replace(/bg-gradient-to-[brltrb]+/g, '');
      newClasses = newClasses.replace(/from-\w+-\d+/g, '');
      newClasses = newClasses.replace(/to-\w+-\d+/g, '');
      newClasses = newClasses.replace(/via-\w+-\d+/g, '');
      
      // Text colors
      newClasses = newClasses.replace(/text-\w+-\d+/g, 'text-gray-300');
      newClasses = newClasses.replace(/text-\w+-\d+\/\d+/g, 'text-gray-300');
      newClasses = newClasses.replace(/text-white/g, 'text-white');
      
      // Border colors
      newClasses = newClasses.replace(/border-\w+-\d+/g, 'border-gray-700');
      newClasses = newClasses.replace(/border-\w+-\d+\/\d+/g, 'border-gray-700');
      
      // Ring colors
      newClasses = newClasses.replace(/ring-\w+-\d+/g, '');
      newClasses = newClasses.replace(/ring-\w+-\d+\/\d+/g, '');
      
      // Shadow
      newClasses = newClasses.replace(/shadow-\w+/g, '');
      newClasses = newClasses.replace(/shadow-\w+\/\d+/g, '');
      
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