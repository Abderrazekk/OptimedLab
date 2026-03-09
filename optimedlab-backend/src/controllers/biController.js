const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const Client = require("../models/Client");
const Quote = require("../models/Quote");
const PDFDocument = require("pdfkit");

// --- Helper Functions (matching pdfGenerator style) ---

const formatCurrency = (amount) => {
  return "TND " + amount.toFixed(3);
};

const generateHr = (doc, y) => {
  doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
};

// Generic table row drawer (columns defined per report type)
const drawTableRow = (doc, y, columns, isHeader = false) => {
  doc.fontSize(10);
  doc.font(isHeader ? "Helvetica-Bold" : "Helvetica");
  columns.forEach((col) => {
    doc.text(col.text, col.x, y, {
      width: col.width,
      align: col.align || "left",
    });
  });
};

// --- BI Controller Functions ---

// @desc    Get dashboard statistics
// @route   GET /api/bi/dashboard
// @access  Private (all roles)
const getDashboardStats = async (req, res) => {
  try {
    const { period = "month" } = req.query; // day, week, month, year
    const userRole = req.user.role;

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Total sales (CA) for period
    const totalSales = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Sales by day/week for chart
    const salesByDate = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Top selling products
    const topProducts = await Invoice.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          name: "$productInfo.name",
          quantity: "$totalQuantity",
          revenue: "$totalRevenue",
        },
      },
    ]);

    // Top clients
    const topClients = await Invoice.aggregate([
      {
        $group: {
          _id: "$client",
          totalSpent: { $sum: "$total" },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "_id",
          as: "clientInfo",
        },
      },
      { $unwind: "$clientInfo" },
      {
        $project: {
          name: "$clientInfo.name",
          totalSpent: 1,
          invoiceCount: 1,
        },
      },
    ]);

    // Stock alerts count
    const stockAlerts = await Product.countDocuments({
      $expr: { $lte: ["$stockQuantity", "$threshold"] },
    });

    // Pending quotes count
    const pendingQuotes = await Quote.countDocuments({ status: "draft" });

    // Unpaid invoices total
    const unpaidInvoices = await Invoice.aggregate([
      { $match: { paymentStatus: { $ne: "paid" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    res.json({
      success: true,
      data: {
        period,
        totalSales: totalSales[0]?.total || 0,
        totalInvoices: totalSales[0]?.count || 0,
        salesByDate: salesByDate.map((item) => ({
          date: `${item._id.year}-${item._id.month}-${item._id.day}`,
          total: item.total,
        })),
        topProducts,
        topClients,
        stockAlerts,
        pendingQuotes,
        unpaidInvoices: unpaidInvoices[0]?.total || 0,
        // Role-based additional data (director gets more)
        ...(userRole === "director" && {
          // Additional deep insights for director
          averageInvoiceValue:
            totalSales[0]?.count > 0
              ? (totalSales[0].total / totalSales[0].count).toFixed(2)
              : 0,
        }),
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate PDF report
// @route   POST /api/bi/reports
// @access  Private (director can generate, others maybe view)
const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, type = "sales" } = req.body;

    // Parse dates
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    let data = [];
    let title = "";
    let columns = [];

    // Fetch data based on type
    switch (type) {
      case "sales":
        title = "RAPPORT DES VENTES";
        data = await Invoice.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
              paymentStatus: "paid",
            },
          },
          {
            $lookup: {
              from: "clients",
              localField: "client",
              foreignField: "_id",
              as: "clientInfo",
            },
          },
          { $unwind: "$clientInfo" },
          {
            $project: {
              invoiceNumber: 1,
              date: "$createdAt",
              client: "$clientInfo.name",
              total: 1,
            },
          },
          { $sort: { date: -1 } },
        ]);
        columns = [
          { text: "N° Facture", x: 50, width: 100, align: "left" },
          { text: "Date", x: 160, width: 80, align: "left" },
          { text: "Client", x: 250, width: 150, align: "left" },
          { text: "Montant", x: 450, width: 100, align: "right" },
        ];
        break;

      case "products":
        title = "RAPPORT PRODUITS";
        data = await Product.aggregate([
          {
            $lookup: {
              from: "suppliers",
              localField: "supplier",
              foreignField: "_id",
              as: "supplierInfo",
            },
          },
          { $unwind: "$supplierInfo" },
          {
            $project: {
              name: 1,
              category: 1,
              price: 1,
              stockQuantity: 1,
              threshold: 1,
              supplier: "$supplierInfo.name",
            },
          },
        ]);
        columns = [
          { text: "Produit", x: 50, width: 150, align: "left" },
          { text: "Catégorie", x: 210, width: 100, align: "left" },
          { text: "Prix", x: 320, width: 80, align: "right" },
          { text: "Stock", x: 410, width: 60, align: "right" },
          { text: "Fournisseur", x: 480, width: 120, align: "left" },
        ];
        break;

      case "stock":
        title = "RAPPORT DE STOCK (Alertes)";
        data = await Product.find({
          $expr: { $lte: ["$stockQuantity", "$threshold"] },
        }).populate("supplier", "name");
        columns = [
          { text: "Produit", x: 50, width: 200, align: "left" },
          { text: "Stock", x: 260, width: 60, align: "right" },
          { text: "Seuil", x: 330, width: 60, align: "right" },
          { text: "Statut", x: 400, width: 100, align: "left" },
          { text: "Fournisseur", x: 510, width: 100, align: "left" },
        ];
        break;

      default:
        title = "RAPPORT COMPLET";
        // For a comprehensive report you might combine data; here we just return empty
        break;
    }

    // --- PDF Generation (styled like invoice/quote) ---
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=rapport-${type}-${Date.now()}.pdf`,
      );
      res.send(pdfData);
    });

    // 1. Header Section
    doc
      .fillColor("#047857")
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("OPTIMEDLAB", 50, 50);

    doc
      .fillColor("#4b5563")
      .fontSize(10)
      .font("Helvetica")
      .text("Adresse de l'entreprise", 50, 80)
      .text("Tél: +216 77 456 789", 50, 95)
      .text("contact@optimedlab.com", 50, 110);

    // Document Title (right aligned)
    doc
      .fillColor("#111827")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(title, 50, 50, { align: "right", width: 500 });

    // Period and generation date (metadata)
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Période:", 350, 80)
      .font("Helvetica")
      .text(
        `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
        420,
        80,
        { width: 130, align: "right" },
      )

      .font("Helvetica-Bold")
      .text("Généré le:", 350, 95)
      .font("Helvetica")
      .text(new Date().toLocaleString(), 420, 95, {
        width: 130,
        align: "right",
      });

    generateHr(doc, 135);

    // 2. Table Section
    const tableTop = 160;
    const rowHeight = 20;

    // Table Header with background
    doc.rect(50, tableTop - 5, 500, 25).fill("#f3f4f6");
    doc.fillColor("#111827");
    drawTableRow(doc, tableTop, columns, true);
    generateHr(doc, tableTop + 20);

    let y = tableTop + 30;

    // Table Rows with Zebra Striping
    if (data.length === 0) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#374151")
        .text("Aucune donnée disponible pour la période sélectionnée.", 50, y);
      y += rowHeight;
    } else {
      data.forEach((item, i) => {
        // Zebra striping
        if (i % 2 !== 0) {
          doc.rect(50, y - 5, 500, rowHeight).fill("#f9fafb");
        }
        doc.fillColor("#374151");

        // Build row data based on report type
        let rowColumns = [];
        if (type === "sales") {
          rowColumns = [
            {
              text: item.invoiceNumber || "-",
              x: 50,
              width: 100,
              align: "left",
            },
            {
              text: new Date(item.date).toLocaleDateString(),
              x: 160,
              width: 80,
              align: "left",
            },
            { text: item.client || "-", x: 250, width: 150, align: "left" },
            {
              text: formatCurrency(item.total || 0),
              x: 450,
              width: 100,
              align: "right",
            },
          ];
        } else if (type === "products") {
          rowColumns = [
            { text: item.name || "-", x: 50, width: 150, align: "left" },
            { text: item.category || "-", x: 210, width: 100, align: "left" },
            {
              text: formatCurrency(item.price || 0),
              x: 320,
              width: 80,
              align: "right",
            },
            {
              text: (item.stockQuantity || 0).toString(),
              x: 410,
              width: 60,
              align: "right",
            },
            { text: item.supplier || "-", x: 480, width: 120, align: "left" },
          ];
        } else if (type === "stock") {
          const status = item.stockQuantity <= 0 ? "Rupture" : "Stock faible";
          rowColumns = [
            { text: item.name || "-", x: 50, width: 200, align: "left" },
            {
              text: (item.stockQuantity || 0).toString(),
              x: 260,
              width: 60,
              align: "right",
            },
            {
              text: (item.threshold || 0).toString(),
              x: 330,
              width: 60,
              align: "right",
            },
            { text: status, x: 400, width: 100, align: "left" },
            {
              text: item.supplier?.name || "-",
              x: 510,
              width: 100,
              align: "left",
            },
          ];
        }

        drawTableRow(doc, y, rowColumns);
        y += rowHeight;
      });
    }

    generateHr(doc, y + 5);

    // 3. Footer with generation timestamp
    const footerY = doc.page.height - 100;
    doc
      .fontSize(9)
      .fillColor("#9ca3af")
      .text(
        `Document généré le ${new Date().toLocaleString()} - OPTIMEDLAB`,
        50,
        footerY,
        { align: "center", width: 500 },
      );

    doc.end();
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  generateReport,
};
