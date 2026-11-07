import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    {
      path: "/dashboard",
      icon: "⌂",
      label: "Tổng quan",
    },
    {
      path: "/products",
      icon: "◈",
      label: "Sản phẩm",
    },
    {
      path: "/customers",
      icon: "♙",
      label: "Khách hàng",
    },
    {
      path: "/employees",
      icon: "♙",
      label: "Nhân viên",
    },
    {
      path: "/orders",
      icon: "▣",
      label: "Đơn hàng",
    },
    {
      path: "/inventory",
      icon: "▤",
      label: "Kho hàng",
    },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💧</div>

        <div className="sidebar-logo-text">
          <h2>WATER</h2>
          <span>MANAGER</span>
        </div>
      </div>

      {/* Menu */}
      <div className="sidebar-section-title">
        QUẢN LÝ
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <span className="menu-icon">{item.icon}</span>

            <span className="menu-label">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* System */}
      <div className="sidebar-section-title system-title">
        HỆ THỐNG
      </div>

      <nav className="sidebar-menu">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive
              ? "menu-item active"
              : "menu-item"
          }
        >
          <span className="menu-icon">⚙</span>

          <span className="menu-label">
            Tài khoản
          </span>
        </NavLink>
      </nav>

      {/* Bottom manager card */}
      <div className="sidebar-bottom">
        <div className="sidebar-manager-card">
          <div className="manager-avatar">
            Q
          </div>

          <div className="manager-info">
            <strong>Quản lý</strong>
            <span>Đang hoạt động</span>
          </div>

          <span className="online-dot"></span>
        </div>

        <button
          className="logout-button"
          onClick={() => {
            const confirmLogout = window.confirm(
              "Bạn có chắc chắn muốn đăng xuất không?"
            );

            if (confirmLogout) {
              window.location.href = "/login";
            }
          }}
        >
          <span>↪</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
