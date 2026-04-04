const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const seedAdmin = require("./src/utils/seedAdmin");

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
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    credentials: true,
  }),
);

const path = require("path");
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
app.use("/api/visits", require("./src/routes/visitRoutes"));
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
