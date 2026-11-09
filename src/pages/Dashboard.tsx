
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  isActive?: boolean;
}

interface Customer {
  id: number;
  name: string;
  isActive?: boolean;
}

interface Order {
  id: number;
  code: string;
  customer: string;
  phone: string;
  product: string;
  quantity: number;
  total: number;
  date: string;
  status: string;
  createdAt?: string;
}

interface InventoryItem {
  id: number;
  code: string;
  product: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  updatedAt: string;
}

type ModalType = "report" | "inventory" | "orders" | "suggestion" | null;

const getHeaders = () => {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();

    if (Array.isArray(data.message)) {
      return data.message.join(", ");
    }

    return data.message || "Không thể tải dữ liệu.";
  } catch {
    return "Không thể tải dữ liệu từ máy chủ.";
  }
};

const formatMoney = (value: number) => {
  return value.toLocaleString("vi-VN") + "đ";
};

const formatShortMoney = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  }

  if (value >= 1000) {
    return (value / 1000).toFixed(0) + "K";
  }

  return String(value);
};

// Chuyển ngày từ Backend thành Date
const parseOrderDate = (value?: string) => {
  if (!value) return null;

  // Hỗ trợ định dạng dd/MM/yyyy
  const vietnameseDate = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (vietnameseDate) {
    const [, day, month, year] = vietnameseDate;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );
  }

  // Hỗ trợ định dạng yyyy-MM-dd
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const getOrderDate = (order: Order) => {
  return parseOrderDate(order.date) ||
    parseOrderDate(order.createdAt);
};

const getOrderTime = (order: Order) => {
  return getOrderDate(order)?.getTime() || 0;
};

function Dashboard() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState("7 ngày");
  const [modalType, setModalType] = useState<ModalType>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lấy dữ liệu từ các API
  const fetchDashboardData = useCallback(async () => {
    try {
      setError("");

      const endpoints = [
        `${API_BASE}/products`,
        `${API_BASE}/customers`,
        `${API_BASE}/orders`,
        `${API_BASE}/inventory`,
      ];

      const responses = await Promise.all(
        endpoints.map((url) =>
          fetch(url, {
            method: "GET",
            headers: getHeaders(),
          })
        )
      );

      for (const response of responses) {
        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }
      }

      const [
        productData,
        customerData,
        orderData,
        inventoryData,
      ] = await Promise.all(
        responses.map((response) => response.json())
      );

      setProducts(
        Array.isArray(productData) ? productData : []
      );

      setCustomers(
        Array.isArray(customerData) ? customerData : []
      );

      setOrders(
        Array.isArray(orderData) ? orderData : []
      );

      setInventory(
        Array.isArray(inventoryData) ? inventoryData : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu Dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const closeModal = () => {
    setModalType(null);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "report":
        return "Báo cáo kinh doanh";
      case "inventory":
        return "Tình trạng kho";
      case "orders":
        return "Đơn hàng gần đây";
      case "suggestion":
        return "Thông tin vận hành";
      default:
        return "";
    }
  };

  // Doanh thu: không tính các đơn đã hủy
  const totalRevenue = orders.reduce((total, order) => {
    return order.status === "Đã hủy"
      ? total
      : total + Number(order.total || 0);
  }, 0);

  // Đơn hàng gần đây
  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => getOrderTime(b) - getOrderTime(a)
    );
  }, [orders]);

  const recentOrders = sortedOrders.slice(0, 4);

  // Tình trạng kho
  const lowStockItems = inventory.filter(
    (item) => item.stock > 0 && item.stock <= item.minStock
  );

  const outOfStockItems = inventory.filter(
    (item) => item.stock === 0
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "Đang xử lý"
  );

  // Thống kê
  const stats = [
    {
      title: "Tổng sản phẩm",
      value: products.length.toLocaleString("vi-VN"),
      description: "sản phẩm trong hệ thống",
      icon: "◈",
      type: "cyan",
    },
    {
      title: "Đơn hàng",
      value: orders.length.toLocaleString("vi-VN"),
      description: "đơn hàng trong hệ thống",
      icon: "▣",
      type: "blue",
    },
    {
      title: "Khách hàng",
      value: customers.length.toLocaleString("vi-VN"),
      description: "khách hàng trong hệ thống",
      icon: "♙",
      type: "purple",
    },
    {
      title: "Doanh thu",
      value: formatShortMoney(totalRevenue),
      description: "tổng giá trị đơn chưa hủy",
      icon: "₫",
      type: "green",
    },
  ];

  // Tính doanh thu theo khoảng thời gian
  const performance = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days =
      period === "7 ngày"
        ? 7
        : period === "30 ngày"
        ? 30
        : 90;

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days + 1);

    const bucketCount = 7;
    const bucketSize = days / bucketCount;

    const buckets = Array.from(
      { length: bucketCount },
      (_, index) => {
        const start = new Date(startDate);

        start.setDate(
          startDate.getDate() + Math.floor(index * bucketSize)
        );

        const end = new Date(startDate);

        end.setDate(
          startDate.getDate() +
            Math.floor((index + 1) * bucketSize)
        );

        const label =
          period === "7 ngày"
            ? start.toLocaleDateString("vi-VN", {
                weekday: "short",
              })
            : `${start.getDate()}/${start.getMonth() + 1}`;

        return {
          label,
          start,
          end,
          revenue: 0,
          count: 0,
        };
      }
    );

    orders.forEach((order) => {
      if (order.status === "Đã hủy") return;

      const orderDate = getOrderDate(order);

      if (!orderDate) return;

      orderDate.setHours(0, 0, 0, 0);

      const bucket = buckets.find(
        (item) =>
          orderDate >= item.start &&
          orderDate < item.end
      );

      if (bucket) {
        bucket.revenue += Number(order.total || 0);
        bucket.count += 1;
      }
    });

    return buckets;
  }, [orders, period]);

  const periodRevenue = performance.reduce(
    (total, item) => total + item.revenue,
    0
  );

  const periodOrderCount = performance.reduce(
    (total, item) => total + item.count,
    0
  );

  const maxRevenue = Math.max(
    ...performance.map((item) => item.revenue),
    1
  );

  const chartMax = Math.ceil(maxRevenue / 4) * 4 || 4;

  const getStatusClass = (status: string) => {
    if (status === "Hoàn thành" || status === "Đã giao") {
      return "delivered";
    }

    if (status === "Đang giao") {
      return "shipping";
    }

    return "pending";
  };

  const getInventoryPercent = (item: InventoryItem) => {
    if (item.minStock === 0) {
      return item.stock > 0 ? 100 : 0;
    }

    const percent =
      (item.stock / (item.minStock * 3)) * 100;

    return Math.min(Math.max(percent, 0), 100);
  };

  const getInventoryLevel = (item: InventoryItem) => {
    if (item.stock === 0 || item.stock <= item.minStock) {
      return "low";
    }

    if (item.stock <= item.minStock * 2) {
      return "medium";
    }

    return "high";
  };

  // Nội dung Modal
  const renderModalContent = () => {
    switch (modalType) {
      case "report":
        return (
          <>
            <div className="dashboard-modal-summary">
              <div>
                <span>Doanh thu</span>
                <strong>{formatMoney(totalRevenue)}</strong>
              </div>

              <div>
                <span>Đơn hàng</span>
                <strong>{orders.length}</strong>
              </div>

              <div>
                <span>Khách hàng</span>
                <strong>{customers.length}</strong>
              </div>
            </div>

            <div className="dashboard-report-box">
              <div>
                <strong>Báo cáo kinh doanh</strong>
                <span>Dữ liệu hiện tại từ hệ thống</span>
              </div>

              <span className="dashboard-report-status">
                Đã cập nhật
              </span>
            </div>

            <p>
              Báo cáo đang hiển thị số liệu thực tế được lấy
              từ cơ sở dữ liệu. Chức năng xuất file Excel/PDF
              có thể bổ sung sau.
            </p>

            <div className="dashboard-modal-footer">
              <button
                className="dashboard-modal-cancel"
                onClick={closeModal}
              >
                Đóng
              </button>
            </div>
          </>
        );

      case "inventory":
        return (
          <>
            <div className="dashboard-modal-list">
              {inventory.length > 0 ? (
                inventory.map((item) => {
                  const percentage = getInventoryPercent(item);
                  const level = getInventoryLevel(item);

                  return (
                    <div
                      className="dashboard-modal-inventory-item"
                      key={item.id}
                    >
                      <div>
                        <strong>{item.product}</strong>
                        <span>
                          {item.stock} {item.unit}
                        </span>
                      </div>

                      <div className="dashboard-modal-progress">
                        <div
                          className={`dashboard-modal-progress-bar ${level}`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>
                      </div>

                      <small>
                        {percentage.toFixed(0)}% mức tồn kho
                      </small>
                    </div>
                  );
                })
              ) : (
                <p>Chưa có dữ liệu kho hàng.</p>
              )}
            </div>

            <div className="dashboard-modal-footer">
              <button
                className="dashboard-modal-cancel"
                onClick={closeModal}
              >
                Đóng
              </button>

              <button
                className="dashboard-modal-primary"
                onClick={() => navigate("/inventory")}
              >
                Quản lý kho →
              </button>
            </div>
          </>
        );

      case "orders":
        return (
          <>
            <div className="dashboard-modal-orders">
              {sortedOrders.length > 0 ? (
                sortedOrders.slice(0, 8).map((order) => (
                  <div
                    className="dashboard-modal-order"
                    key={order.id}
                  >
                    <div>
                      <strong>{order.code}</strong>
                      <span>{order.customer}</span>
                    </div>

                    <div>
                      <span>{order.product}</span>
                      <small>{order.quantity}</small>
                    </div>

                    <strong>
                      {formatMoney(Number(order.total || 0))}
                    </strong>

                    <span
                      className={`dashboard-status ${getStatusClass(
                        order.status
                      )}`}
                    >
                      <span></span>
                      {order.status}
                    </span>
                  </div>
                ))
              ) : (
                <p>Chưa có đơn hàng nào.</p>
              )}
            </div>

            <div className="dashboard-modal-footer">
              <button
                className="dashboard-modal-cancel"
                onClick={closeModal}
              >
                Đóng
              </button>

              <button
                className="dashboard-modal-primary"
                onClick={() => navigate("/orders")}
              >
                Quản lý đơn hàng →
              </button>
            </div>
          </>
        );

      case "suggestion":
        return (
          <>
            <div className="dashboard-suggestion-detail">
              <div className="dashboard-suggestion-detail-icon">
                !
              </div>

              <div>
                <strong>Kiểm tra tồn kho</strong>

                <p>
                  {lowStockItems.length + outOfStockItems.length > 0
                    ? `Có ${lowStockItems.length} sản phẩm sắp hết và ${outOfStockItems.length} sản phẩm đã hết hàng. Bạn nên kiểm tra và nhập thêm hàng.`
                    : "Tình trạng tồn kho hiện tại đang ổn định."}
                </p>
              </div>
            </div>

            <div className="dashboard-suggestion-detail">
              <div className="dashboard-suggestion-detail-icon">
                ✓
              </div>

              <div>
                <strong>Xử lý đơn hàng</strong>

                <p>
                  {pendingOrders.length > 0
                    ? `Có ${pendingOrders.length} đơn hàng đang chờ xử lý. Bạn nên kiểm tra các đơn này.`
                    : "Hiện không có đơn hàng nào đang chờ xử lý."}
                </p>
              </div>
            </div>

            <div className="dashboard-modal-footer">
              <button
                className="dashboard-modal-primary"
                onClick={closeModal}
              >
                Đã hiểu
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
      {/* PAGE HEADER */}
      <div className="dashboard-heading">
        <div>
          <div className="dashboard-breadcrumb">
            <span>WATER MANAGER</span>
            <span>/</span>
            <span>Tổng quan</span>
          </div>

          <h1>Tổng quan hệ thống</h1>

          <p>
            Theo dõi tình hình kinh doanh và vận hành
            hệ thống nước của bạn.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            className="dashboard-outline-button"
            onClick={() => setModalType("report")}
          >
            ↓ Xem báo cáo
          </button>

          <button
            className="dashboard-primary-button"
            onClick={() => navigate("/orders")}
          >
            + Tạo đơn hàng
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            color: "#dc2626",
            background: "#fef2f2",
            borderRadius: "8px",
          }}
        >
          {error}
          <button
            onClick={fetchDashboardData}
            style={{
              marginLeft: "12px",
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="dashboard-stats">
        {stats.map((stat) => (
          <div
            className="dashboard-stat-card"
            key={stat.title}
          >
            <div className="stat-card-top">
              <div className={`stat-icon ${stat.type}`}>
                {stat.icon}
              </div>

              <span className="stat-change">
                {loading ? "..." : "Thực tế"}
              </span>
            </div>

            <div className="stat-value">
              {loading ? "..." : stat.value}
            </div>

            <div className="stat-title">
              {stat.title}
            </div>

            <div className="stat-description">
              {stat.description}
            </div>
          </div>
        ))}
      </div>

      {/* PERFORMANCE */}
      <div className="dashboard-card performance-card dashboard-full-card">
        <div className="dashboard-card-header">
          <div>
            <h2>Hiệu suất kinh doanh</h2>

            <p>
              Tổng quan doanh thu trong thời gian gần đây
            </p>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="dashboard-select"
          >
            <option>7 ngày</option>
            <option>30 ngày</option>
            <option>3 tháng</option>
          </select>
        </div>

        <div className="performance-summary">
          <div>
            <strong>
              {loading ? "..." : formatShortMoney(periodRevenue)}
            </strong>
            <span>Doanh thu</span>
          </div>

          <div>
            <strong>
              {loading ? "..." : periodOrderCount}
            </strong>
            <span>Đơn hàng</span>
          </div>

          <div>
            <strong>
              {loading
                ? "..."
                : periodOrderCount > 0
                ? formatMoney(
                    Math.round(periodRevenue / periodOrderCount)
                  )
                : "0đ"}
            </strong>
            <span>Trung bình/đơn</span>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-y-axis">
            <span>{formatShortMoney(chartMax)}</span>
            <span>{formatShortMoney(chartMax * 0.75)}</span>
            <span>{formatShortMoney(chartMax * 0.5)}</span>
            <span>{formatShortMoney(chartMax * 0.25)}</span>
            <span>0</span>
          </div>

          <div className="chart-area">
            <div className="chart-grid-lines">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="chart-bars">
              {performance.map((item, index) => {
                const height =
                  (item.revenue / chartMax) * 100;

                return (
                  <div
                    className="chart-column"
                    key={index}
                  >
                    <div
                      className="chart-bar"
                      style={{
                        height: `${height}%`,
                      }}
                    >
                      <span className="chart-tooltip">
                        {formatMoney(item.revenue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="chart-labels">
              {performance.map((item, index) => (
                <span key={index}>{item.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* INVENTORY */}
      <div className="dashboard-card inventory-card">
        <div className="dashboard-card-header inventory-card-header">
          <div>
            <h2>Tình trạng kho</h2>
            <p>Thông tin tồn kho hiện tại</p>
          </div>

          <span className="inventory-total">
            {inventory.length} sản phẩm
          </span>
        </div>

        <div className="dashboard-inventory-grid">
          {inventory.length > 0 ? (
            inventory.slice(0, 4).map((item) => {
              const percentage = getInventoryPercent(item);
              const level = getInventoryLevel(item);

              return (
                <div
                  className="dashboard-inventory-item"
                  key={item.id}
                >
                  <div className="dashboard-inventory-item-top">
                    <div className="dashboard-inventory-name">
                      <span
                        className={`inventory-level-dot ${level}`}
                      ></span>

                      <span>{item.product}</span>
                    </div>

                    <strong>
                      {item.stock} {item.unit}
                    </strong>
                  </div>

                  <div className="dashboard-inventory-progress">
                    <div
                      className={`dashboard-inventory-progress-bar ${level}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>
                  </div>

                  <div className="dashboard-inventory-bottom">
                    <span>Tồn kho</span>

                    <strong>
                      {percentage.toFixed(0)}%
                    </strong>
                  </div>
                </div>
              );
            })
          ) : (
            <p>
              {loading
                ? "Đang tải dữ liệu kho..."
                : "Chưa có dữ liệu kho hàng."}
            </p>
          )}
        </div>

        <div className="dashboard-inventory-footer">
          <span>
            Có {lowStockItems.length} sản phẩm sắp hết và{" "}
            {outOfStockItems.length} sản phẩm hết hàng.
          </span>

          <button
            className="dashboard-inventory-detail-button"
            onClick={() => navigate("/inventory")}
          >
            Xem chi tiết kho
            <span>→</span>
          </button>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="dashboard-card recent-orders-card">
        <div className="dashboard-card-header">
          <div>
            <h2>Đơn hàng gần đây</h2>

            <p>
              Những đơn hàng mới nhất trong hệ thống
            </p>
          </div>

          <button
            className="view-all-button"
            onClick={() => navigate("/orders")}
          >
            Xem tất cả →
          </button>
        </div>

        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>Đang tải đơn hàng...</td>
                </tr>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong className="order-code">
                        {order.code}
                      </strong>
                    </td>

                    <td>{order.customer}</td>

                    <td>{order.product}</td>

                    <td>{order.quantity}</td>

                    <td>
                      <strong>
                        {formatMoney(Number(order.total || 0))}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`dashboard-status ${getStatusClass(
                          order.status
                        )}`}
                      >
                        <span></span>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM GRID */}
      <div className="dashboard-bottom-grid">
        {/* SUGGESTIONS */}
        <div className="dashboard-card suggestion-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Gợi ý vận hành</h2>

              <p>
                Một số việc bạn nên kiểm tra hôm nay
              </p>
            </div>
          </div>

          <div className="suggestion-list">
            <div className="suggestion-item">
              <div className="suggestion-icon warning">
                !
              </div>

              <div>
                <strong>Kiểm tra tồn kho</strong>

                <p>
                  {lowStockItems.length + outOfStockItems.length}{" "}
                  sản phẩm cần kiểm tra.
                </p>
              </div>

              <button
                onClick={() => setModalType("suggestion")}
              >
                →
              </button>
            </div>

            <div className="suggestion-item">
              <div className="suggestion-icon info">
                ✓
              </div>

              <div>
                <strong>Xử lý đơn hàng</strong>

                <p>
                  Có {pendingOrders.length} đơn đang chờ xử lý.
                </p>
              </div>

              <button
                onClick={() => navigate("/orders")}
              >
                →
              </button>
            </div>

            <div className="suggestion-item">
              <div className="suggestion-icon success">
                ★
              </div>

              <div>
                <strong>Doanh thu hiện tại</strong>

                <p>
                  Tổng giá trị đơn hàng chưa bị hủy:{" "}
                  {formatShortMoney(totalRevenue)}.
                </p>
              </div>

              <button
                onClick={() => setModalType("report")}
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="dashboard-card quick-actions-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Thao tác nhanh</h2>

              <p>
                Truy cập nhanh các chức năng thường dùng
              </p>
            </div>
          </div>

          <div className="quick-actions">
            <button
              onClick={() => navigate("/san-pham")}
            >
              <span>＋</span>

              <div>
                <strong>Thêm sản phẩm</strong>
                <small>Tạo sản phẩm mới</small>
              </div>
            </button>

            <button
              onClick={() => navigate("/orders")}
            >
              <span>▣</span>

              <div>
                <strong>Tạo đơn hàng</strong>
                <small>Tạo đơn phân phối mới</small>
              </div>
            </button>

            <button
              onClick={() => navigate("/khach-hang")}
            >
              <span>♙</span>

              <div>
                <strong>Thêm khách hàng</strong>
                <small>Thêm khách hàng mới</small>
              </div>
            </button>

            <button
              onClick={() => navigate("/inventory")}
            >
              <span>▤</span>

              <div>
                <strong>Kiểm tra kho</strong>
                <small>Xem tình trạng tồn kho</small>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* CENTER MODAL */}
      {modalType && (
        <div
          className="dashboard-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="dashboard-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dashboard-modal-header">
              <div>
                <span>WATER MANAGER</span>

                <h2>{getModalTitle()}</h2>
              </div>

              <button
                className="dashboard-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <div className="dashboard-modal-body">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
