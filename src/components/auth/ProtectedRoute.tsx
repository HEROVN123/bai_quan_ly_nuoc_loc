
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const token = localStorage.getItem("accessToken");

  // Chưa đăng nhập thì chuyển về trang Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Có Token thì cho phép truy cập trang
  return <Outlet />;
}

export default ProtectedRoute;
