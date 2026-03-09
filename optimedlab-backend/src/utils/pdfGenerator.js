const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// --- Helper Functions for "Excel-like" Formatting ---

const formatCurrency = (amount) => {
  return amount.toFixed(2) + ' €';
};

const generateHr = (doc, y) => {
  doc.strokeColor('#e5e7eb') // Light gray border
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
};

const drawTableRow = (doc, y, item, qty, price, total, isHeader = false) => {
  // Column definitions (X positions and widths)
  const col1X = 50;  // Produit
  const col2X = 280; // Qté
  const col3X = 350; // Prix unitaire
  const col4X = 450; // Total

  doc.fontSize(10);
  
  if (isHeader) {
    doc.font('Helvetica-Bold');
  } else {
    doc.font('Helvetica');
  }

  doc.text(item, col1X, y, { width: 220, align: 'left' });
  doc.text(qty, col2X, y, { width: 50, align: 'right' });
  doc.text(price, col3X, y, { width: 80, align: 'right' });
  doc.text(total, col4X, y, { width: 100, align: 'right' });
};

// --- PDF Generators ---

const generateQuotePDF = (quote, client, companyInfo = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // 1. Header Section (Company & Document Type)
      doc.fillColor('#047857') // Professional Excel Green / Emerald
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('OPTIMEDLAB', 50, 50);

      doc.fillColor('#4b5563') // Slate gray
         .fontSize(10)
         .font('Helvetica')
         .text(companyInfo.address || 'Adresse de l\'entreprise', 50, 80)
         .text(companyInfo.phone || 'Tél: +123 456 789', 50, 95)
         .text(companyInfo.email || 'contact@optimedlab.com', 50, 110);

      // Document Meta Data (Right aligned)
      doc.fillColor('#111827')
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('DEVIS', 50, 50, { align: 'right', width: 500 });

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('N° Devis:', 350, 80)
         .font('Helvetica')
         .text(quote.quoteNumber, 450, 80, { align: 'right', width: 100 })
         
         .font('Helvetica-Bold')
         .text('Date:', 350, 95)
         .font('Helvetica')
         .text(new Date(quote.createdAt).toLocaleDateString(), 450, 95, { align: 'right', width: 100 });

      generateHr(doc, 135);

      // 2. Client Information Block (Spreadsheet summary style)
      doc.fillColor('#374151')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Facturer à :', 50, 150);

      doc.font('Helvetica')
         .fontSize(10)
         .text(client.name, 50, 165);
         
      if (client.company) doc.text(client.company, 50, 180);
      if (client.email) doc.text(client.email, 50, 195);
      if (client.phone) doc.text(client.phone, 50, 210);

      // 3. Data Table (The "Excel" Part)
      const tableTop = 260;
      
      // Table Header Background
      doc.rect(50, tableTop - 5, 500, 25).fill('#f3f4f6');
      
      doc.fillColor('#111827');
      drawTableRow(doc, tableTop, 'Produit', 'Quantité', 'Prix Unit.', 'Total', true);
      
      generateHr(doc, tableTop + 20);

      let y = tableTop + 30;
      
      // Table Rows with Zebra Striping
      quote.items.forEach((item, i) => {
        // Zebra striping for readability
        if (i % 2 !== 0) {
          doc.rect(50, y - 5, 500, 20).fill('#f9fafb');
        }
        
        doc.fillColor('#374151');
        drawTableRow(
          doc, 
          y, 
          item.product.name || 'Produit inconnu', 
          item.quantity.toString(), 
          formatCurrency(item.price), 
          formatCurrency(item.quantity * item.price)
        );
        
        y += 20;
      });

      generateHr(doc, y + 5);

      // 4. Totals Summary (Bottom Right)
      const summaryTop = y + 20;
      
      doc.font('Helvetica-Bold')
         .fillColor('#111827')
         .text('TOTAL DEVIS:', 350, summaryTop)
         .text(formatCurrency(quote.total), 450, summaryTop, { align: 'right', width: 100 });

      // Bottom border for totals
      doc.strokeColor('#047857') // Accent color
         .lineWidth(2)
         .moveTo(350, summaryTop + 15)
         .lineTo(550, summaryTop + 15)
         .stroke();

      // Footer
      doc.fontSize(9)
         .fillColor('#9ca3af')
         .text('Ce devis est valable pour une durée de 30 jours à compter de la date d\'émission.', 50, doc.page.height - 100, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generateInvoicePDF = (invoice, client, companyInfo = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // 1. Header Section
      doc.fillColor('#047857')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('OPTIMEDLAB', 50, 50);

      doc.fillColor('#4b5563')
         .fontSize(10)
         .font('Helvetica')
         .text(companyInfo.address || 'Adresse de l\'entreprise', 50, 80)
         .text(companyInfo.phone || 'Tél: +216 77 456 789', 50, 95)
         .text(companyInfo.email || 'contact@optimedlab.com', 50, 110);

      // Document Meta Data
      doc.fillColor('#111827')
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('FACTURE', 50, 50, { align: 'right', width: 500 });

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('N° Facture:', 350, 80)
         .font('Helvetica')
         .text(invoice.invoiceNumber, 450, 80, { align: 'right', width: 100 })
         
         .font('Helvetica-Bold')
         .text('Date:', 350, 95)
         .font('Helvetica')
         .text(new Date(invoice.createdAt).toLocaleDateString(), 450, 95, { align: 'right', width: 100 });

      if (invoice.dueDate) {
        doc.font('Helvetica-Bold')
           .text('Échéance:', 350, 110)
           .font('Helvetica')
           .text(new Date(invoice.dueDate).toLocaleDateString(), 450, 110, { align: 'right', width: 100 });
      }

      generateHr(doc, 140);

      // 2. Client Information
      doc.fillColor('#374151')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Facturer à :', 50, 160);

      doc.font('Helvetica')
         .fontSize(10)
         .text(client.name, 50, 175);
         
      if (client.company) doc.text(client.company, 50, 190);
      if (client.email) doc.text(client.email, 50, 205);
      if (client.phone) doc.text(client.phone, 50, 220);

      // 3. Data Table
      const tableTop = 270;
      
      // Header Background
      doc.rect(50, tableTop - 5, 500, 25).fill('#f3f4f6');
      
      doc.fillColor('#111827');
      drawTableRow(doc, tableTop, 'Produit', 'Quantité', 'Prix Unit.', 'Total', true);
      
      generateHr(doc, tableTop + 20);

      let y = tableTop + 30;
      
      // Rows with Zebra Striping
      invoice.items.forEach((item, i) => {
        if (i % 2 !== 0) {
          doc.rect(50, y - 5, 500, 20).fill('#f9fafb');
        }
        
        doc.fillColor('#374151');
        drawTableRow(
          doc, 
          y, 
          item.product.name || 'Produit inconnu', 
          item.quantity.toString(), 
          formatCurrency(item.price), 
          formatCurrency(item.quantity * item.price)
        );
        
        y += 20;
      });

      generateHr(doc, y + 5);

      // 4. Totals & Status
      const summaryTop = y + 20;
      
      doc.font('Helvetica-Bold')
         .fillColor('#111827')
         .text('TOTAL FACTURE:', 350, summaryTop)
         .text(formatCurrency(invoice.total), 450, summaryTop, { align: 'right', width: 100 });

      // Double underline for total
      doc.strokeColor('#047857')
         .lineWidth(1.5)
         .moveTo(350, summaryTop + 15)
         .lineTo(550, summaryTop + 15)
         .stroke()
         .moveTo(350, summaryTop + 18)
         .lineTo(550, summaryTop + 18)
         .stroke();

      // Payment Status Badge (Excel condition formatting style)
      let statusText, statusColor, statusBg;
      switch(invoice.paymentStatus) {
        case 'paid':
          statusText = 'PAYÉE'; statusColor = '#065f46'; statusBg = '#d1fae5'; break;
        case 'partial':
          statusText = 'PARTIELLE'; statusColor = '#92400e'; statusBg = '#fef3c7'; break;
        default:
          statusText = 'IMPAYÉE'; statusColor = '#991b1b'; statusBg = '#fee2e2'; break;
      }

      // Draw Status Badge Box
      doc.rect(50, summaryTop - 5, 120, 25).fill(statusBg);
      doc.fillColor(statusColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(`Statut: ${statusText}`, 50, summaryTop + 2, { width: 120, align: 'center' });

      // Footer
      doc.fontSize(9)
         .fillColor('#9ca3af')
         .text('Merci de votre confiance. En cas de retard de paiement, des pénalités pourront être appliquées.', 50, doc.page.height - 100, { align: 'center', width: 500 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateQuotePDF, generateInvoicePDF };