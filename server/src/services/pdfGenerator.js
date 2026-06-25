import PDFDocument from 'pdfkit';

export function generateOptimizedPdf(optimizedData, res) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe the PDF to the response
  doc.pipe(res);

  const { personal_info, sections } = optimizedData;

  // --- Header (Personal Info) ---
  if (personal_info) {
    if (personal_info.full_name) {
      doc.font('Helvetica-Bold').fontSize(20).text(personal_info.full_name, { align: 'center' });
      doc.moveDown(0.2);
    }

    const contactParts = [];
    if (personal_info.email) contactParts.push(personal_info.email);
    if (personal_info.phone) contactParts.push(personal_info.phone);
    if (personal_info.location) contactParts.push(personal_info.location);
    if (personal_info.linkedin) contactParts.push(personal_info.linkedin);

    if (contactParts.length > 0) {
      doc.font('Helvetica').fontSize(10).text(contactParts.join(' | '), { align: 'center' });
      doc.moveDown(0.5);
    }
    
    // Draw a line
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);
  }

  // --- Helper to draw section titles ---
  const drawSectionTitle = (title) => {
    doc.font('Helvetica-Bold').fontSize(12).text(title.toUpperCase());
    doc.moveDown(0.2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
  };

  // --- Dynamic Sections ---
  if (sections && Array.isArray(sections)) {
    sections.forEach((sec) => {
      if (!sec.heading) return;
      
      drawSectionTitle(sec.heading);
      
      if (sec.items && Array.isArray(sec.items)) {
        sec.items.forEach((item) => {
          // Title (e.g. Job Title, Degree)
          if (item.title) {
            doc.font('Helvetica-Bold').fontSize(11).text(item.title, { continued: !!item.subtitle || !!item.date });
          }
          
          // Subtitle (e.g. Company, University)
          if (item.subtitle) {
            doc.font('Helvetica').text(item.title ? ` at ${item.subtitle}` : item.subtitle, { align: 'left', continued: !!item.date });
          }

          // Date
          if (item.date) {
            doc.text(item.title || item.subtitle ? `  |  ${item.date}` : item.date, { align: 'right' });
          } else if (item.title || item.subtitle) {
             // Terminate the continued line if there was no date but there was a title/subtitle
             doc.text(' ');
          }

          if (item.title || item.subtitle || item.date) {
            doc.moveDown(0.2);
          }

          // Description
          if (item.description) {
            doc.font('Helvetica').fontSize(10).text(item.description, { align: 'justify' });
            doc.moveDown(0.4);
          }
        });
      }
      doc.moveDown(0.5);
    });
  }

  doc.end();
}
