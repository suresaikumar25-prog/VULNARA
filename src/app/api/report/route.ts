import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jsPDF from 'jspdf';

interface Vulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
}

interface ScanResult {
  url: string;
  timestamp: string;
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  securityScore: {
    score: number;
    grade: string;
    color: string;
    description: string;
  };
  certificateInfo?: {
    isValid: boolean;
    issuer: string;
    validFrom: string;
    validTo: string;
    daysUntilExpiry: number;
    keySize: number;
    algorithm: string;
  };
}

function generatePDFReport(scanResult: ScanResult): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  
  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * (fontSize * 0.4));
  };
  
  // Helper function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return [255, 0, 0]; // Red
      case 'high': return [255, 165, 0]; // Orange
      case 'medium': return [255, 255, 0]; // Yellow
      case 'low': return [0, 0, 255]; // Blue
      default: return [128, 128, 128]; // Gray
    }
  };
  
  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ThreatLens Security Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;
  
  // Subtitle
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Web Vulnerability Assessment Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 30;
  
  // Scan Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Scan Information', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(`Target URL: ${scanResult.url}`, 20, yPosition, pageWidth - 40);
  yPosition = addWrappedText(`Scan Date: ${new Date(scanResult.timestamp).toLocaleString()}`, 20, yPosition, pageWidth - 40);
  yPosition += 20;
  
  // Security Score
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Security Score', 20, yPosition);
  yPosition += 15;
  
  // Score box
  const scoreBoxWidth = 60;
  const scoreBoxHeight = 30;
  const scoreBoxX = 20;
  const scoreBoxY = yPosition;
  
  // Draw score box
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight);
  
  // Add score content
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(scanResult.securityScore.score.toString(), scoreBoxX + 10, scoreBoxY + 15);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Score', scoreBoxX + 10, scoreBoxY + 22);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(scanResult.securityScore.grade, scoreBoxX + 35, scoreBoxY + 15);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Grade', scoreBoxX + 35, scoreBoxY + 22);
  
  // Score description
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(`Security Assessment: ${scanResult.securityScore.description}`, scoreBoxX + scoreBoxWidth + 10, scoreBoxY + 10, pageWidth - scoreBoxWidth - 30);
  yPosition += 30;

  // Executive Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryText = `This security assessment identified ${scanResult.summary.total} vulnerabilities across the target website, 
    resulting in a security score of ${scanResult.securityScore.score}/100 (Grade: ${scanResult.securityScore.grade}). 
    The findings include ${scanResult.summary.critical} critical, ${scanResult.summary.high} high, ${scanResult.summary.medium} medium, 
    and ${scanResult.summary.low} low severity issues.`;
  yPosition = addWrappedText(summaryText, 20, yPosition, pageWidth - 40);
  yPosition += 20;
  
  // Certificate Information
  if (scanResult.certificateInfo) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TLS Certificate Information', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const certInfo = scanResult.certificateInfo;
    const certText = `Issuer: ${certInfo.issuer}
Status: ${certInfo.isValid ? 'Valid' : 'Invalid'}
Valid From: ${certInfo.validFrom}
Valid To: ${certInfo.validTo}
Days Until Expiry: ${certInfo.daysUntilExpiry}
Key Size: ${certInfo.keySize} bits
Algorithm: ${certInfo.algorithm}`;
    
    yPosition = addWrappedText(certText, 20, yPosition, pageWidth - 40);
    yPosition += 20;
  }
  
  // Vulnerability Summary Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Vulnerability Summary', 20, yPosition);
  yPosition += 15;
  
  // Create summary table
  const tableData = [
    ['Severity', 'Count'],
    ['Critical', scanResult.summary.critical.toString()],
    ['High', scanResult.summary.high.toString()],
    ['Medium', scanResult.summary.medium.toString()],
    ['Low', scanResult.summary.low.toString()],
    ['Total', scanResult.summary.total.toString()]
  ];
  
  // Draw table
  const tableTop = yPosition;
  const cellHeight = 8;
  const colWidths = [60, 30];
  const tableLeft = 20;
  
  tableData.forEach((row, rowIndex) => {
    let xPosition = tableLeft;
    
    row.forEach((cell, colIndex) => {
      // Set background color for severity rows
      if (rowIndex > 0 && colIndex === 0) {
        const severity = row[0].toLowerCase();
        const color = getSeverityColor(severity);
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(xPosition, tableTop + (rowIndex * cellHeight), colWidths[colIndex], cellHeight, 'F');
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setTextColor(0, 0, 0);
      }
      
      // Draw cell border
      doc.rect(xPosition, tableTop + (rowIndex * cellHeight), colWidths[colIndex], cellHeight);
      
      // Add text
      doc.setFontSize(10);
      doc.setFont('helvetica', rowIndex === 0 ? 'bold' : 'normal');
      doc.text(cell, xPosition + 2, tableTop + (rowIndex * cellHeight) + 5);
      
      xPosition += colWidths[colIndex];
    });
  });
  
  yPosition = tableTop + (tableData.length * cellHeight) + 20;
  
  // Detailed Findings
  if (scanResult.vulnerabilities.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Findings', 20, yPosition);
    yPosition += 15;
    
    scanResult.vulnerabilities.forEach((vuln, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Vulnerability header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${vuln.type}`, 20, yPosition);
      yPosition += 10;
      
      // Severity badge
      const severityColor = getSeverityColor(vuln.severity);
      doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
      doc.rect(20, yPosition - 5, 40, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(vuln.severity.toUpperCase(), 25, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 15;
      
      // Description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPosition = addWrappedText(`Description: ${vuln.description}`, 20, yPosition, pageWidth - 40);
      yPosition += 5;
      
      // Location
      yPosition = addWrappedText(`Location: ${vuln.location}`, 20, yPosition, pageWidth - 40);
      yPosition += 15;
    });
  } else {
    // No vulnerabilities found
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Findings', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 128, 0); // Green color
    doc.text('✓ No vulnerabilities detected', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text('The target website appears to be secure based on the performed tests.', 20, yPosition);
    yPosition += 20;
  }
  
  // Recommendations
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendations', 20, yPosition);
  yPosition += 15;
  
  const recommendations = [
    'Implement proper input validation and sanitization for all user inputs',
    'Use parameterized queries to prevent SQL injection attacks',
    'Implement Content Security Policy (CSP) headers',
    'Enable security headers like X-Frame-Options and X-Content-Type-Options',
    'Regularly update all software components and dependencies',
    'Conduct regular security assessments and penetration testing',
    'Implement proper error handling to avoid information disclosure',
    'Use HTTPS with proper certificate management'
  ];
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  recommendations.forEach((rec, index) => {
    yPosition = addWrappedText(`${index + 1}. ${rec}`, 20, yPosition, pageWidth - 40);
    yPosition += 3;
  });
  
  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by ThreatLens - Web Vulnerability Scanner', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Report generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 8, { align: 'center' });
  
  return Buffer.from(doc.output('arraybuffer'));
}

// Authentication check function
async function checkAuth() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('threatlens-session');
  
  if (!sessionToken) {
    return false;
  }
  
  try {
    const decoded = Buffer.from(sessionToken.value, 'base64').toString();
    const [username, timestamp] = decoded.split(':');
    const sessionTime = parseInt(timestamp);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return now - sessionTime <= maxAge;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const scanResult: ScanResult = await request.json();
    
    if (!scanResult.url || !scanResult.vulnerabilities || !scanResult.summary) {
      return NextResponse.json({ error: 'Invalid scan result data' }, { status: 400 });
    }
    
    console.log(`Generating PDF report for: ${scanResult.url}`);
    
    const pdfBuffer = generatePDFReport(scanResult);
    
    // Return PDF as response
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="threatlens-report-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during report generation' },
      { status: 500 }
    );
  }
}
