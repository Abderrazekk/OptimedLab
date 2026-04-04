// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/common/PrivateRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Clients from "./pages/Clients";
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import StockMovements from "./pages/StockMovements";
import PurchaseOrders from "./pages/PurchaseOrders";
import Quotes from "./pages/Quotes";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Profile from './pages/Profile';
import Calendar from "./pages/Calendar";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected routes with Layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="clients" element={<Clients />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="products" element={<Products />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="stock" element={<Stock />} />
            <Route path="stock/movements" element={<StockMovements />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
