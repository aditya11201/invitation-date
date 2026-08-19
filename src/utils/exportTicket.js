import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Export ticket element as a high-resolution PNG image
 */
export async function exportTicketAsPng(ticketElement, filename = 'Our-Date-Ticket.png') {
  if (!ticketElement) return false;

  try {
    const canvas = await html2canvas(ticketElement, {
      scale: 3, // 3x high-DPI
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure no interactive overlay or hover outlines in cloned render
        const clonedTicket = clonedDoc.getElementById('date-ticket-card');
        if (clonedTicket) {
          clonedTicket.style.transform = 'none';
          clonedTicket.style.boxShadow = '0 20px 40px rgba(219, 39, 119, 0.2)';
        }
      }
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to export PNG:', error);
    return false;
  }
}

/**
 * Export ticket element as PDF format using jsPDF
 */
export async function exportTicketAsPdf(ticketElement, filename = 'Our-Date-Ticket.pdf') {
  if (!ticketElement) return false;

  try {
    const canvas = await html2canvas(ticketElement, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: '#fdf2f4',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate aspect ratio
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth - 20; // 10mm padding on sides
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    const yPos = (pdfHeight - imgHeight) / 2;

    // Draw romantic background
    pdf.setFillColor(253, 242, 244);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

    // Add ticket image
    pdf.addImage(imgData, 'PNG', 10, yPos > 10 ? yPos : 10, imgWidth, imgHeight);
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Failed to export PDF:', error);
    return false;
  }
}
