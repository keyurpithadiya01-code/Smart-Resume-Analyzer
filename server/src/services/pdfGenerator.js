import PDFDocument from 'pdfkit';

export function generateOptimizedPdf(optimizedData, res) {
  const doc = new PDFDocument({ 
    margin: 50, 
    size: 'A4',
    autoFirstPage: true
  });

  // Pipe the PDF to the response
  doc.pipe(res);

  const { personal_info, sections } = optimizedData;

  // --- Header (Personal Info) ---
  if (personal_info) {
    if (personal_info.full_name) {
      doc.font('Helvetica-Bold').fontSize(22).text(personal_info.full_name, { align: 'center' });
      doc.moveDown(0.2);
    }

    if (personal_info.title) {
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#333333').text(personal_info.title, { align: 'center' });
      doc.moveDown(0.2);
    }

    const contactParts = [];
    if (personal_info.email) contactParts.push(personal_info.email);
    if (personal_info.phone) contactParts.push(personal_info.phone);
    if (personal_info.location) contactParts.push(personal_info.location);
    if (personal_info.linkedin) contactParts.push(personal_info.linkedin);

    if (contactParts.length > 0) {
      doc.font('Helvetica').fontSize(10).fillColor('#000000').text(contactParts.join('  |  '), { align: 'center' });
      doc.moveDown(0.5);
    }
  }

  // --- Helper to draw section titles ---
  const drawSectionTitle = (title) => {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000').text(title.toUpperCase());
    doc.moveDown(0.2);
    
    // Draw a strict horizontal line
    doc.moveTo(doc.page.margins.left, doc.y)
       .lineTo(doc.page.width - doc.page.margins.right, doc.y)
       .lineWidth(1)
       .strokeColor('#000000')
       .stroke();
    
    doc.moveDown(0.5);
  };

  // --- Dynamic Sections ---
  if (sections && Array.isArray(sections)) {
    sections.forEach((sec) => {
      if (!sec.heading) return;
      
      drawSectionTitle(sec.heading);
      
      if (sec.items && Array.isArray(sec.items)) {
        sec.items.forEach((item) => {
          
          // Row 1: Title (Bold) and Date (Right aligned if possible, but PDFKit is easier with lines)
          // To make it truly ATS friendly and robust in PDFKit without continued bugs:
          if (item.title) {
            doc.font('Helvetica-Bold').fontSize(11).text(item.title);
          }
          
          // Row 2: Subtitle / Company and Date
          const subParts = [];
          if (item.subtitle) subParts.push(item.subtitle);
          if (item.date) subParts.push(item.date);
          
          if (subParts.length > 0) {
            // Using Helvetica-Oblique for subtitle/date line
            doc.font('Helvetica-Oblique').fontSize(11).fillColor('#444444').text(subParts.join('  |  '));
          }

          if (item.title || subParts.length > 0) {
            doc.moveDown(0.2);
          }

          // Description (Left aligned for bullet points)
          if (item.description) {
            doc.font('Helvetica').fontSize(10).fillColor('#000000').text(item.description, { 
              align: 'left',
              lineGap: 2
            });
            doc.moveDown(0.5);
          } else {
            doc.moveDown(0.2);
          }
        });
      }
    });
  }

  doc.end();
}
