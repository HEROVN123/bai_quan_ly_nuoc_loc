
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Employees from "./pages/Employees";
import Notifications from "./pages/Notifications";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang công khai */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

        {/* Các trang cần đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/thong-bao" element={<Notifications />} />
          </Route>
        </Route>

        {/* Đường dẫn mặc định */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* URL không tồn tại */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
