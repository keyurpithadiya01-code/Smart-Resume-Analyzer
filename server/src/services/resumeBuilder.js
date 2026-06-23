import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ExternalHyperlink, UnderlineType
} from 'docx';

function bullet(text) {
  return new Paragraph({ text: `• ${text}`, spacing: { after: 80 } });
}

function sectionTitle(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
  });
}

function buildModern(data) {
  const p = data.personal_info || {};
  const contactChildren = [];
  const addContact = (item, isLink = false) => {
    if (!item) return;
    if (contactChildren.length > 0) {
      contactChildren.push(new TextRun({ text: ' | ', size: 20 }));
    }
    if (isLink) {
      contactChildren.push(new ExternalHyperlink({
        children: [new TextRun({ text: item, size: 20, color: "0563C1", underline: { type: UnderlineType.SINGLE } })],
        link: item.startsWith('http') ? item : `https://${item}`
      }));
    } else {
      contactChildren.push(new TextRun({ text: item, size: 20 }));
    }
  };

  addContact(p.email);
  addContact(p.phone);
  addContact(p.location);
  addContact(p.linkedin, true);
  addContact(p.portfolio, true);

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: p.full_name || 'Your Name', bold: true, size: 36 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: contactChildren,
    }),
  ];
  if (data.summary) {
    children.push(sectionTitle('Summary'), new Paragraph(data.summary));
  }
  if (data.experience?.length) {
    children.push(sectionTitle('Experience'));
    data.experience.forEach((exp) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `${exp.position || ''} — ${exp.company || ''}`, bold: true })],
      }));
      const desc = exp.description || (exp.responsibilities || []).join(' ');
      if (desc) children.push(bullet(desc));
    });
  }
  if (data.education?.length) {
    children.push(sectionTitle('Education'));
    data.education.forEach((edu) => {
      const line = [edu.degree, edu.field, edu.school].filter(Boolean).join(' — ');
      const tail = [edu.graduation_date, edu.gpa].filter(Boolean).join(' · ');
      children.push(bullet(tail ? `${line} (${tail})` : line || 'Education'));
    });
  }
  if (data.skills) {
    children.push(sectionTitle('Skills'));
    const all = [
      ...(data.skills.technical || []),
      ...(data.skills.soft || []),
      ...(data.skills.tools || []),
      ...(data.skills.languages || []),
    ];
    children.push(new Paragraph(all.join(', ')));
  }
  return new Document({ sections: [{ children }] });
}

function buildProfessional(data) {
  return buildModern(data);
}

function buildMinimal(data) {
  return buildModern(data);
}

function buildCreative(data) {
  return buildModern(data);
}

export async function generateResumeDocx(data) {
  const template = (data.template || 'Modern').toLowerCase();
  let doc;
  switch (template) {
    case 'professional':
      doc = buildProfessional(data);
      break;
    case 'minimal':
      doc = buildMinimal(data);
      break;
    case 'creative':
      doc = buildCreative(data);
      break;
    default:
      doc = buildModern(data);
  }
  return Packer.toBuffer(doc);
}
