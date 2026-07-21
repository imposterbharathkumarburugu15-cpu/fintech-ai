// src/components/reports/ReportRenderer.tsx

import React from 'react';

interface ReportRendererProps {
  sections: any[];
  reportType: string;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({ sections, reportType }) => {
  return (
    <div id="report-container" className="report-container">
      {sections.map((section, index) => (
        <div 
          key={index} 
          className="report-section mb-8"
          data-section-type={section.sectionType || reportType}
        >
          {/* Section heading */}
          <h2 className="text-xl font-bold text-white mb-3">
            {section.heading}
          </h2>
          
          {/* Section content */}
          {section.content && (
            <p className="text-gray-300 text-sm mb-4">
              {section.content}
            </p>
          )}
          
          {/* Custom component */}
          {section.customComponent && section.customComponent}
          
          {/* Charts */}
          {section.chartData && (
            <div className="chart-container">
              {/* Your chart rendering logic here */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReportRenderer;