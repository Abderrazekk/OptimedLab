const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const seedAdmin = require("./src/utils/seedAdmin");
const path = require("path");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Seed super admin
seedAdmin();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
// ⚠️ IMPORTANT: Replace the Vercel URL below with your actual deployed frontend URL!
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Keeps local development working
      "https://your-actual-vercel-url.vercel.app", // Allows your Vercel frontend
    ],
    credentials: true,
  }),
);

// Health check route to fix "Cannot GET /"
app.get("/", (req, res) => {
  res.send("OptimedLab API is live and running!");
});

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/clients", require("./src/routes/clientRoutes"));
app.use("/api/suppliers", require("./src/routes/supplierRoutes"));
app.use("/api/products", require("./src/routes/productRoutes"));
app.use("/api/quotes", require("./src/routes/quoteRoutes"));
app.use("/api/invoices", require("./src/routes/invoiceRoutes"));
app.use("/api/stock", require("./src/routes/stockRoutes"));
app.use("/api/purchase-orders", require("./src/routes/purchaseOrderRoutes"));
app.use("/api/bi", require("./src/routes/biRoutes"));
app.use("/api/chatbot", require("./src/routes/chatbotRoutes"));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
