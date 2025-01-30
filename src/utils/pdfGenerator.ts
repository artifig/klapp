import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

interface PDFData {
  companyName: string;
  contactName: string;
  email: string;
  date: string;
  scores: Array<{
    category: string;
    score: number;
  }>;
  recommendations: Array<{
    title: string;
    text: string;
    priority: string;
    provider: string;
    offer: string;
  }>;
}

export const generatePDF = (data: PDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Helper for centered text
  const centerText = (text: string, y: number, size = 12) => {
    doc.setFontSize(size);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Header
  doc.addImage('/logo.png', 'PNG', margin, margin, 40, 40);
  doc.setFontSize(24);
  doc.setTextColor('#FF6600');
  centerText('Tehisaru valmisoleku raport', 70);

  // Company Info
  doc.setFontSize(12);
  doc.setTextColor('#000000');
  doc.text(`Ettevõte: ${data.companyName}`, margin, 90);
  doc.text(`Kontakt: ${data.contactName}`, margin, 100);
  doc.text(`E-post: ${data.email}`, margin, 110);
  doc.text(`Kuupäev: ${data.date}`, margin, 120);

  // Scores Table
  doc.autoTable({
    startY: 140,
    head: [['Kategooria', 'Tulemus']],
    body: data.scores.map(score => [score.category, `${score.score}%`]),
    styles: {
      fillColor: [255, 102, 0],
      textColor: [255, 255, 255],
      fontSize: 10
    },
    headStyles: {
      fillColor: [255, 102, 0]
    },
    alternateRowStyles: {
      fillColor: [255, 240, 230]
    }
  });

  // Recommendations
  doc.addPage();
  doc.setFontSize(20);
  doc.setTextColor('#FF6600');
  centerText('Soovitused', 30);

  let yPos = 50;
  data.recommendations.forEach((rec, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }

    doc.setFontSize(14);
    doc.setTextColor('#000000');
    doc.text(rec.title, margin, yPos);
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    const lines = doc.splitTextToSize(rec.text, pageWidth - 2 * margin);
    doc.text(lines, margin, yPos + 10);

    doc.setFontSize(10);
    doc.setTextColor('#000000');
    doc.text(`Prioriteet: ${rec.priority}`, margin, yPos + 25);
    doc.text(`Pakkuja: ${rec.provider}`, margin, yPos + 35);
    doc.text(`Teenus: ${rec.offer}`, margin, yPos + 45);

    yPos += 60;
  });

  // Footer with contact info
  const footerText = 'Kontakt: info@tehisaru.ee | Tel: +372 5555 5555 | www.tehisaru.ee';
  doc.setFontSize(10);
  doc.setTextColor('#666666');
  centerText(footerText, doc.internal.pageSize.height - 10);

  return doc;
}; 