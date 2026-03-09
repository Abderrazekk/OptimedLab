// utils/numberGenerator.js
const generateQuoteNumber = async (Quote) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const prefix = `DEV-${year}${month}${day}`;

    // Use regex to find quotes with today's prefix
    const lastQuote = await Quote.findOne({
      quoteNumber: { $regex: `^${prefix}` },
    }).sort({ quoteNumber: -1 });

    let nextNumber = 1;
    if (lastQuote && lastQuote.quoteNumber) {
      // Extract the last part after the last dash
      const parts = lastQuote.quoteNumber.split("-");
      if (parts.length >= 3) {
        const lastPart = parts[parts.length - 1];
        const parsed = parseInt(lastPart, 10);
        if (!isNaN(parsed)) {
          nextNumber = parsed + 1;
        }
      }
    }

    const numberStr = String(nextNumber).padStart(4, "0");
    return `${prefix}-${numberStr}`;
  } catch (error) {
    console.error("Error generating quote number:", error);
    // Fallback: timestamp-based number
    return `DEV-${Date.now()}`;
  }
};

const generateInvoiceNumber = async (Invoice) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const prefix = `FAC-${year}${month}${day}`;

    const lastInvoice = await Invoice.findOne({
      invoiceNumber: { $regex: `^${prefix}` },
    }).sort({ invoiceNumber: -1 });

    let nextNumber = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const parts = lastInvoice.invoiceNumber.split("-");
      if (parts.length >= 3) {
        const lastPart = parts[parts.length - 1];
        const parsed = parseInt(lastPart, 10);
        if (!isNaN(parsed)) {
          nextNumber = parsed + 1;
        }
      }
    }

    const numberStr = String(nextNumber).padStart(4, "0");
    return `${prefix}-${numberStr}`;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    return `FAC-${Date.now()}`;
  }
};

const generatePONumber = async (PurchaseOrder) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const prefix = `PO-${year}${month}${day}`;

    const lastPO = await PurchaseOrder.findOne({
      poNumber: { $regex: `^${prefix}` },
    }).sort({ poNumber: -1 });
    let nextNumber = 1;
    if (lastPO && lastPO.poNumber) {
      const parts = lastPO.poNumber.split("-");
      if (parts.length >= 3) {
        const lastPart = parts[parts.length - 1];
        const parsed = parseInt(lastPart, 10);
        if (!isNaN(parsed)) nextNumber = parsed + 1;
      }
    }
    const numberStr = String(nextNumber).padStart(4, "0");
    return `${prefix}-${numberStr}`;
  } catch (error) {
    console.error("Error generating PO number:", error);
    return `PO-${Date.now()}`;
  }
};

module.exports = { generateQuoteNumber, generateInvoiceNumber, generatePONumber };
