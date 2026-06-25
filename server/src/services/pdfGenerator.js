import PDFDocument from 'pdfkit';

export function generateOptimizedPdf(optimizedData, res) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe the PDF to the response
  doc.pipe(res);

  const { personal_info, summary, experience, projects, education, skills } = optimizedData;

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

  // --- Summary ---
  if (summary) {
    drawSectionTitle('Professional Summary');
    doc.font('Helvetica').fontSize(10).text(summary, { align: 'justify' });
    doc.moveDown(1);
  }

  // --- Skills ---
  if (skills && (skills.technical || skills.soft || skills.tools || skills.languages)) {
    drawSectionTitle('Skills');
    doc.font('Helvetica').fontSize(10);
    if (skills.technical) doc.text(`Technical: ${skills.technical}`);
    if (skills.soft) doc.text(`Soft Skills: ${skills.soft}`);
    if (skills.tools) doc.text(`Tools: ${skills.tools}`);
    if (skills.languages) doc.text(`Languages: ${skills.languages}`);
    doc.moveDown(1);
  }

  // --- Experience ---
  if (experience && experience.length > 0) {
    drawSectionTitle('Experience');
    experience.forEach((exp) => {
      doc.font('Helvetica-Bold').fontSize(11).text(exp.position || '', { continued: true });
      doc.font('Helvetica').text(` at ${exp.company || ''}`, { align: 'left', continued: true });
      
      const dates = [exp.start_date, exp.end_date].filter(Boolean).join(' - ');
      doc.text(`  |  ${dates}`, { align: 'right' });
      doc.moveDown(0.2);

      if (exp.description) {
        doc.font('Helvetica').fontSize(10).text(exp.description);
      }
      doc.moveDown(0.5);
    });
    doc.moveDown(0.5);
  }

  // --- Projects ---
  if (projects && projects.length > 0) {
    drawSectionTitle('Projects');
    projects.forEach((proj) => {
      doc.font('Helvetica-Bold').fontSize(11).text(proj.name || '');
      if (proj.description) {
        doc.font('Helvetica').fontSize(10).text(proj.description);
      }
      doc.moveDown(0.5);
    });
    doc.moveDown(0.5);
  }

  // --- Education ---
  if (education && education.length > 0) {
    drawSectionTitle('Education');
    education.forEach((edu) => {
      doc.font('Helvetica-Bold').fontSize(11).text(edu.school || '', { continued: true });
      doc.font('Helvetica').text(edu.graduation_date ? `  |  ${edu.graduation_date}` : '', { align: 'right' });
      doc.moveDown(0.2);
      
      let degreeInfo = edu.degree || '';
      if (edu.field) degreeInfo += ` in ${edu.field}`;
      if (edu.gpa) degreeInfo += ` (GPA: ${edu.gpa})`;
      
      doc.font('Helvetica').fontSize(10).text(degreeInfo);
      doc.moveDown(0.5);
    });
  }

  doc.end();
}
