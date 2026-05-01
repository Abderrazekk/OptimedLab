// src/utils/pdfGenerator.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path"); // Used to handle file paths safely

// 🖼️ Define the path to your logo image 🖼️
// Assuming pdfGenerator.js is in src/utils/ and logo is in src/assets/
const LOGO_PATH = path.join(__dirname, "..", "assets", "optimedlab_logo.png");

// --- Helper Functions for "Excel-like" Formatting ---

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount))
    return "TND 0.000";
  return "TND " + Number(amount).toFixed(3);
};

const generateHr = (doc, y) => {
  doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
};

const drawTableRow = (doc, y, item, qty, price, total, isHeader = false) => {
  const col1X = 50;
  const col2X = 280;
  const col3X = 350;
  const col4X = 450;

  doc.fontSize(10);

  if (isHeader) {
    doc.font("Helvetica-Bold");
  } else {
    doc.font("Helvetica");
  }

  doc.text(item, col1X, y, { width: 220, align: "left" });
  doc.text(qty, col2X, y, { width: 50, align: "right" });
  doc.text(price, col3X, y, { width: 80, align: "right" });
  doc.text(total, col4X, y, { width: 100, align: "right" });
};

// --- Custom Footer Function Matching Client PDFs ---
const generateCustomFooter = (doc) => {
  // FIX: Temporarily remove bottom margin to prevent automatic page breaks
  const originalBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;

  const footerY = doc.page.height - 90;

  generateHr(doc, footerY - 10);

  doc.fontSize(8).font("Helvetica").fillColor("#4b5563");

  // Left side footer (Company details)
  doc.text("OptiMedLab - Kalaât El Andalous - 2022 Ariana", 50, footerY, {
    lineBreak: false,
  });
  doc.text(
    "Gérant: Mohamed Amine Ben Haj Mohamed - Tél: 92 021 038",
    50,
    footerY + 12,
    { lineBreak: false },
  );
  doc.text(
    "E-mail: contact@optimedlab.com - www.optimedlab.com",
    50,
    footerY + 24,
    { lineBreak: false },
  );

  // Right side footer (Financial details from PDF)
  doc
    .font("Helvetica-Bold")
    .text("Banque:", 350, footerY, { lineBreak: false });
  doc.font("Helvetica").text("Amen Banque", 450, footerY, { lineBreak: false });

  doc
    .font("Helvetica-Bold")
    .text("Matricule Fiscale:", 350, footerY + 12, { lineBreak: false });
  doc
    .font("Helvetica")
    .text("1898215 H/N/M/000", 450, footerY + 12, { lineBreak: false });

  doc
    .font("Helvetica-Bold")
    .text("RIB bancaire:", 350, footerY + 24, { lineBreak: false });
  doc
    .font("Helvetica")
    .text("07505006610111137982", 450, footerY + 24, { lineBreak: false });

  // FIX: Restore margin
  doc.page.margins.bottom = originalBottomMargin;
};

// --- PDF Generators ---

const generateQuotePDF = (quote, client, companyInfo = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // 1. Header Section - 🖼️ UPDATED TO USE IMAGE 🖼️
      if (fs.existsSync(LOGO_PATH)) {
        // Render image if file exists. Width 150 keeps it consistent.
        doc.image(LOGO_PATH, 50, 45, { width: 100 });
      } else {
        // Fallback to text if image is missing so generation doesn't crash
        doc
          .fillColor("#047857")
          .fontSize(20)
          .font("Helvetica-Bold")
          .text("OPTIMEDLAB", 50, 50);
        console.warn("Logo file not found at:", LOGO_PATH);
      }

      // Move address details down slightly to accommodate image height
      doc
        .fillColor("#4b5563")
        .fontSize(10)
        .font("Helvetica")
        .text("Kalaât El Andalous, Ariana", 50, 90)
        .text("Tunisie", 50, 105)
        .text("Tél: 92 021 038", 50, 120);

      // Document Type/Title (Right Aligned)
      doc
        .fillColor("#111827")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(quote.remise > 0 ? "DEVIS AVEC REMISE" : "DEVIS", 50, 50, {
          align: "right",
          width: 500,
        });

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Référence du devis:", 320, 80)
        .font("Helvetica")
        .text(quote.quoteNumber, 450, 80, { align: "right", width: 100 })
        .font("Helvetica-Bold")
        .text("Date du devis:", 320, 95)
        .font("Helvetica")
        .text(new Date(quote.createdAt).toLocaleDateString(), 450, 95, {
          align: "right",
          width: 100,
        });

      generateHr(doc, 145); // Moved down slightly

      // 2. Client Information Block
      doc
        .fillColor("#374151")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Client", 50, 160);
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(client.name || "Client Inconnu", 50, 175);

      if (client.company) doc.text(client.company, 50, 190);
      if (client.email) doc.text(client.email, 50, 205);
      if (client.phone) doc.text(client.phone, 50, 220);

      // 3. Data Table
      const tableTop = 270;
      doc.rect(50, tableTop - 5, 500, 25).fill("#f3f4f6");
      doc.fillColor("#111827");
      drawTableRow(
        doc,
        tableTop,
        "Description",
        "Quantité",
        "Prix Unitaire HT",
        "Total",
        true,
      );

      generateHr(doc, tableTop + 20);

      let y = tableTop + 30;

      quote.items.forEach((item, i) => {
        // Auto Page Break if table gets too long
        if (y > doc.page.height - 250) {
          doc.addPage();
          y = 50; // Reset Y for new page
        }

        if (i % 2 !== 0) doc.rect(50, y - 5, 500, 20).fill("#f9fafb");

        doc.fillColor("#374151");
        drawTableRow(
          doc,
          y,
          item.product?.name || "Produit inconnu",
          item.quantity.toString(),
          formatCurrency(item.price),
          formatCurrency(item.quantity * item.price),
        );
        y += 20;
      });

      generateHr(doc, y + 5);

      // Check if we need to push totals to a new page
      if (y > doc.page.height - 220) {
        doc.addPage();
        y = 50;
      }

      // 4. Totals Summary
      const summaryTop = y + 10;
      const labelX = 350;
      const valueX = 450;
      let currentY = summaryTop;

      doc.font("Helvetica").fillColor("#374151");
      doc.text("Total HT :", labelX, currentY);
      doc.text(formatCurrency(quote.totalHT), valueX, currentY, {
        align: "right",
        width: 100,
      });
      currentY += 20;

      if (quote.remise && quote.remise > 0) {
        doc.text("Remise :", labelX, currentY);
        doc.text("-" + formatCurrency(quote.remise), valueX, currentY, {
          align: "right",
          width: 100,
        });
        currentY += 20;
      }

      doc.text("Total TVA (19%) :", labelX, currentY);
      doc.text(formatCurrency(quote.tvaAmount), valueX, currentY, {
        align: "right",
        width: 100,
      });
      currentY += 20;

      doc.text("Timbre :", labelX, currentY);
      doc.text(formatCurrency(quote.timbreAmount || 1.0), valueX, currentY, {
        align: "right",
        width: 100,
      });
      currentY += 25;

      doc.font("Helvetica-Bold").fillColor("#111827");
      doc.text("Total TTC :", labelX, currentY);
      doc.text(formatCurrency(quote.totalTTC), valueX, currentY, {
        align: "right",
        width: 100,
      });

      doc
        .strokeColor("#047857")
        .lineWidth(2)
        .moveTo(labelX, currentY + 15)
        .lineTo(550, currentY + 15)
        .stroke();

      // 5. Signature Section
      const signatureY = doc.page.height - 150;

      // Disable bottom margin temporarily
      doc.page.margins.bottom = 0;

      doc
        .moveTo(50, signatureY)
        .lineTo(250, signatureY)
        .strokeColor("#000000")
        .lineWidth(1)
        .stroke();
      doc
        .fontSize(10)
        .fillColor("#374151")
        .font("Helvetica")
        .text("Signature du client :", 50, signatureY - 15, {
          lineBreak: false,
        });

      doc.moveTo(300, signatureY).lineTo(500, signatureY).stroke();
      doc.text("Date :", 300, signatureY - 15, { lineBreak: false });
      doc.text("_____________", 340, signatureY - 15, { lineBreak: false });

      generateCustomFooter(doc);

      // Restore margin
      doc.page.margins.bottom = 50;

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generateInvoicePDF = (invoice, client, companyInfo = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // 1. Header Section - 🖼️ UPDATED TO USE IMAGE 🖼️
      if (fs.existsSync(LOGO_PATH)) {
        doc.image(LOGO_PATH, 50, 45, { width: 100 });
      } else {
        doc
          .fillColor("#047857")
          .fontSize(20)
          .font("Helvetica-Bold")
          .text("OPTIMEDLAB", 50, 50);
        console.warn("Logo file not found at:", LOGO_PATH);
      }

      doc
        .fillColor("#4b5563")
        .fontSize(10)
        .font("Helvetica")
        .text("Kalaât El Andalous, Ariana", 50, 90)
        .text("Tunisie", 50, 105)
        .text("Tél: 92 021 038", 50, 120);

      // Document Type/Title
      doc
        .fillColor("#111827")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("FACTURE / BL", 50, 50, { align: "right", width: 500 });

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Référence de Facture/BL:", 300, 80)
        .font("Helvetica")
        .text(invoice.invoiceNumber, 450, 80, { align: "right", width: 100 })
        .font("Helvetica-Bold")
        .text("Date du Facture:", 300, 95)
        .font("Helvetica")
        .text(new Date(invoice.createdAt).toLocaleDateString(), 450, 95, {
          align: "right",
          width: 100,
        });

      if (invoice.dueDate) {
        doc
          .font("Helvetica-Bold")
          .text("Échéance:", 300, 110)
          .font("Helvetica")
          .text(new Date(invoice.dueDate).toLocaleDateString(), 450, 110, {
            align: "right",
            width: 100,
          });
      }

      generateHr(doc, 145);

      // 2. Client Information
      doc
        .fillColor("#374151")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Client :", 50, 160);

      let clientY = 175;
      doc.fontSize(10).font("Helvetica");

      let parts = [];
      if (client.name) parts.push(`Client: ${client.name}`);
      if (client.company) parts.push(`Company: ${client.company}`);
      if (client.email) parts.push(`Email: ${client.email}`);
      if (client.phone) parts.push(`Tel: ${client.phone}`);

      if (parts.length > 0) {
        doc.text(parts.join("    "), 50, clientY);
        clientY += 15;
      }

      // 3. Data Table
      const tableTop = clientY + 30;
      doc.rect(50, tableTop - 5, 500, 25).fill("#f3f4f6");
      doc.fillColor("#111827");
      drawTableRow(
        doc,
        tableTop,
        "Description",
        "Quantité",
        "Prix Unitaire HT",
        "Total",
        true,
      );

      generateHr(doc, tableTop + 20);

      let y = tableTop + 30;

      invoice.items.forEach((item, i) => {
        // Auto Page Break if table gets too long
        if (y > doc.page.height - 250) {
          doc.addPage();
          y = 50;
        }

        if (i % 2 !== 0) doc.rect(50, y - 5, 500, 20).fill("#f9fafb");

        doc.fillColor("#374151");
        drawTableRow(
          doc,
          y,
          item.product?.name || "Produit inconnu",
          item.quantity.toString(),
          formatCurrency(item.price),
          formatCurrency(item.quantity * item.price),
        );
        y += 20;
      });

      generateHr(doc, y + 5);

      // Check if we need to push totals to a new page
      if (y > doc.page.height - 220) {
        doc.addPage();
        y = 50;
      }

      // 4. Totals Summary
      const summaryTop = y + 10;
      const labelX = 350;
      const valueX = 450;
      let currentY = summaryTop;

      doc.font("Helvetica").fillColor("#374151");
      doc.text("Total HT :", labelX, currentY);
      doc.text(formatCurrency(invoice.totalHT), valueX, currentY, {
        align: "right",
        width: 100,
      });
      currentY += 20;

      if (invoice.remise && invoice.remise > 0) {
        doc.text("Remise :", labelX, currentY);
        doc.text("-" + formatCurrency(invoice.remise), valueX, currentY, {
          align: "right",
          width: 100,
        });
        currentY += 20;
      }

      doc.text("Total TVA (19%) :", labelX, currentY);
      doc.text(formatCurrency(invoice.tvaAmount), valueX, currentY, {
        align: "right",
        width: 100,
      });
      currentY += 20;

      doc.text("Timbre :", labelX, currentY);
      doc.text(formatCurrency(invoice.timbreAmount || 1.0), valueX, currentY, {
        align: "right",
        width: 100,
      });
      currentY += 25;

      doc.font("Helvetica-Bold").fillColor("#111827");
      doc.text("Total TTC :", labelX, currentY);
      doc.text(formatCurrency(invoice.totalTTC), valueX, currentY, {
        align: "right",
        width: 100,
      });

      doc
        .strokeColor("#047857")
        .lineWidth(2)
        .moveTo(labelX, currentY + 15)
        .lineTo(550, currentY + 15)
        .stroke();

      // Status badge
      let statusText, statusColor, statusBg;
      switch (invoice.paymentStatus) {
        case "paid":
          statusText = "PAYÉE";
          statusColor = "#065f46";
          statusBg = "#d1fae5";
          break;
        case "partially":
          statusText = "PARTIELLE";
          statusColor = "#92400e";
          statusBg = "#fef3c7";
          break;
        default:
          statusText = "IMPAYÉE";
          statusColor = "#991b1b";
          statusBg = "#fee2e2";
          break;
      }

      doc.rect(50, summaryTop - 5, 120, 25).fill(statusBg);
      doc
        .fillColor(statusColor)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`Statut: ${statusText}`, 50, summaryTop + 2, {
          width: 120,
          align: "center",
        });

      // 5. Signature Section
      const signatureY = doc.page.height - 150;

      // Disable bottom margin temporarily
      doc.page.margins.bottom = 0;

      doc
        .moveTo(50, signatureY)
        .lineTo(250, signatureY)
        .strokeColor("#000000")
        .lineWidth(1)
        .stroke();
      doc
        .fontSize(10)
        .fillColor("#374151")
        .font("Helvetica")
        .text("Signature du client :", 50, signatureY - 15, {
          lineBreak: false,
        });

      doc.moveTo(300, signatureY).lineTo(500, signatureY).stroke();
      doc.text("Date :", 300, signatureY - 15, { lineBreak: false });
      doc.text("_____________", 340, signatureY - 15, { lineBreak: false });

      generateCustomFooter(doc);

      // Restore margin
      doc.page.margins.bottom = 50;

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateQuotePDF, generateInvoicePDF };
