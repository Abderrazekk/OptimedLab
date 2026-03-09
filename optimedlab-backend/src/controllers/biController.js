// controllers/biController.js
const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const Client = require("../models/Client");
const Quote = require("../models/Quote");

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

    let data = {};
    let title = "";

    switch (type) {
      case "sales":
        title = "Sales Report";
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
              items: 1,
            },
          },
          { $sort: { date: -1 } },
        ]);
        break;

      case "products":
        title = "Product Performance Report";
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
        break;

      case "stock":
        title = "Stock Status Report";
        data = await Product.find({
          $expr: { $lte: ["$stockQuantity", "$threshold"] },
        }).populate("supplier", "name");
        break;

      default:
        title = "Comprehensive Report";
        // Combine multiple data sources
        break;
    }

    // Generate PDF using pdfkit (similar to previous PDF generation)
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=report-${type}-${Date.now()}.pdf`,
      );
      res.send(pdfData);
    });

    // Build PDF
    doc.fontSize(20).text("OPTIMEDLAB", { align: "center" });
    doc.fontSize(16).text(title, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(
        `Period: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
      );
    doc.moveDown();

    // Add content based on type
    if (Array.isArray(data) && data.length > 0) {
      if (type === "sales") {
        // Table headers
        let y = doc.y;
        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Invoice", 50, y);
        doc.text("Date", 150, y);
        doc.text("Client", 250, y);
        doc.text("Total", 450, y);
        doc.font("Helvetica");

        data.forEach((item, i) => {
          y = doc.y + 20;
          doc.text(item.invoiceNumber || "-", 50, y);
          doc.text(new Date(item.date).toLocaleDateString(), 150, y);
          doc.text(item.client || "-", 250, y);
          doc.text(`${item.total?.toFixed(2)} €`, 450, y);
        });
      } else if (type === "products") {
        let y = doc.y;
        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Product", 50, y);
        doc.text("Category", 200, y);
        doc.text("Price", 300, y);
        doc.text("Stock", 380, y);
        doc.text("Supplier", 450, y);
        doc.font("Helvetica");

        data.forEach((item, i) => {
          y = doc.y + 20;
          doc.text(item.name, 50, y);
          doc.text(item.category, 200, y);
          doc.text(`${item.price?.toFixed(2)} €`, 300, y);
          doc.text(item.stockQuantity?.toString(), 380, y);
          doc.text(item.supplier || "-", 450, y);
        });
      } else if (type === "stock") {
        let y = doc.y;
        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Product", 50, y);
        doc.text("Stock", 200, y);
        doc.text("Threshold", 280, y);
        doc.text("Status", 350, y);
        doc.font("Helvetica");

        data.forEach((item, i) => {
          y = doc.y + 20;
          const status = item.stockQuantity <= 0 ? "Out of Stock" : "Low Stock";
          doc.text(item.name, 50, y);
          doc.text(item.stockQuantity?.toString(), 200, y);
          doc.text(item.threshold?.toString(), 280, y);
          doc.text(status, 350, y);
        });
      }
    } else {
      doc.text("No data available for the selected period.");
    }

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
