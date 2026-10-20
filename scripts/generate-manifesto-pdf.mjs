/**
 * Builds public/manifesto.pdf from src/config/campaignConfig.js.
 * Runs automatically before every `npm run build` (so Vercel always ships an up-to-date PDF),
 * or manually with `npm run manifesto`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import config from '../src/config/campaignConfig.js';
import { displayWhatsAppNumber } from '../src/services/whatsappService.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public', 'manifesto.pdf');

const NAVY = '#0a1a3a';
const GOLD = '#d99a00';
const INK = '#2a3550';
const { candidate, contact } = config;

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 56, bottom: 64, left: 56, right: 56 },
  info: { Title: `${candidate.position} Campaign Manifesto`, Author: candidate.name, Subject: candidate.slogan },
  bufferPages: true,
});
fs.mkdirSync(path.dirname(out), { recursive: true });
doc.pipe(fs.createWriteStream(out));

const W = doc.page.width;
const contentW = W - 112;

// Cover band
doc.rect(0, 0, W, 250).fill(NAVY);
doc.rect(0, 250, W, 6).fill(GOLD);
doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text(`${candidate.university.toUpperCase()}  |  ${candidate.faculty.toUpperCase()}`, 56, 60, { characterSpacing: 1.5 });
doc.fontSize(30).text(candidate.name, 56, 92, { width: contentW });
doc.fillColor('#ffc933').fontSize(15).text(candidate.position, 56, doc.y + 6, { width: contentW });
doc.fillColor('#ffffff').font('Helvetica-Oblique').fontSize(14).text(`"${candidate.slogan}"`, 56, doc.y + 22, { width: contentW });
doc.fillColor('#b9c6e4').font('Helvetica').fontSize(9).text('Independent student campaign. Not an official university publication.', 56, 220, { width: contentW });

doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(16).text('Vision', 56, 290);
doc.fillColor(INK).font('Helvetica').fontSize(11).text(candidate.vision, { width: contentW, lineGap: 3 });
doc.moveDown(1);
doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(16).text('Mission');
doc.fillColor(INK).font('Helvetica').fontSize(11).text(candidate.mission, { width: contentW, lineGap: 3 });
doc.moveDown(1.2);
doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(16).text('About');
doc.fillColor(INK).font('Helvetica').fontSize(11).text(candidate.intro, { width: contentW, lineGap: 3 });

doc.addPage();
doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(22).text('Twenty campaign commitments', { width: contentW });
doc.fillColor(INK).font('Helvetica-Oblique').fontSize(10).text('Campaign commitments and advocacy priorities - not guaranteed results.', { width: contentW });
doc.moveDown(1);

for (const m of config.manifestos) {
  doc.font('Helvetica-Bold').fontSize(12.5);
  const titleH = doc.heightOfString(`${m.id}. ${m.title}`, { width: contentW - 12 });
  doc.font('Helvetica').fontSize(10.5);
  const bodyH = doc.heightOfString(m.text, { width: contentW - 12, lineGap: 2 });
  if (doc.y + titleH + bodyH + 30 > doc.page.height - 70) doc.addPage();
  const y = doc.y;
  doc.rect(56, y, 3, titleH + bodyH + 8).fill(GOLD);
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(12.5).text(`${m.id}. ${m.title}`, 68, y, { width: contentW - 12 });
  doc.fillColor(INK).font('Helvetica').fontSize(10.5).text(m.text, 68, doc.y + 2, { width: contentW - 12, lineGap: 2 });
  doc.moveDown(0.9);
}

// Contact block
if (doc.y + 120 > doc.page.height - 70) doc.addPage();
doc.moveDown(0.5);
const cy = doc.y;
doc.roundedRect(56, cy, contentW, 92, 8).fill('#f4f7fc');
doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(13).text('Get in touch', 72, cy + 14);
doc.fillColor(INK).font('Helvetica').fontSize(11).text(`Email: ${contact.email}`, 72, cy + 36);
doc.text(`WhatsApp: ${displayWhatsAppNumber()}`, 72, cy + 54);

// Footer on every page
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  doc.page.margins.bottom = 0; // otherwise writing in the footer area would add a blank page
  doc.fillColor('#8190b0').font('Helvetica').fontSize(8)
    .text(`${candidate.slogan}  |  Page ${i + 1} of ${range.count}`, 56, doc.page.height - 40, { width: contentW, align: 'center', lineBreak: false });
}

doc.end();
doc.on('end', () => console.log(`manifesto.pdf written (${config.manifestos.length} manifestos).`));
