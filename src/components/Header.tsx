import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

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

interface RevenueDay {
  date: Date;
  label: string;
  total: number;
}

function Header() {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [revenueError, setRevenueError] = useState("");

  // Lấy ngày theo giờ địa phương
  const getStartOfDay = (date: Date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  // Đọc ngày dd/MM/yyyy hoặc yyyy-MM-dd
  const parseOrderDate = (value?: string): Date | null => {
    if (!value) return null;

    const text = String(value).trim();

    // Định dạng dd/MM/yyyy
    const vietnameseDate = text.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (vietnameseDate) {
      const day = Number(vietnameseDate[1]);
      const month = Number(vietnameseDate[2]);
      const year = Number(vietnameseDate[3]);

      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {
        return date;
      }

      return null;
    }

    // Định dạng yyyy-MM-dd hoặc ISO datetime
    const isoDate = text.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (isoDate) {
      const year = Number(isoDate[1]);
      const month = Number(isoDate[2]);
      const day = Number(isoDate[3]);

      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {
        return date;
      }

      return null;
    }

    return null;
  };

  // Lấy ngày đặt hàng, nếu không có thì dùng createdAt
  const getOrderDate = (order: Order): Date | null => {
    return (
      parseOrderDate(order.date) ||
      parseOrderDate(order.createdAt)
    );
  };

  // Kiểm tra đơn hàng đã hoàn thành
  const isCompleted = (order: Order) => {
    return order.status?.trim().toLowerCase() === "hoàn thành";
  };

  // Định dạng tiền VNĐ
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Định dạng số tiền ngắn gọn trên biểu đồ
  const formatShortCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}K`;
    }

    return `${value.toLocaleString("vi-VN")}`;
  };

  // Lấy dữ liệu doanh thu từ API
  useEffect(() => {
    if (!showRevenue) return;

    const controller = new AbortController();

    const fetchOrders = async () => {
      try {
        setLoadingRevenue(true);
        setRevenueError("");

        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${API_URL}/orders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu doanh thu.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Dữ liệu đơn hàng không hợp lệ.");
        }

        setOrders(data);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setRevenueError(
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi tải doanh thu."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingRevenue(false);
        }
      }
    };

    fetchOrders();

    return () => {
      controller.abort();
    };
  }, [showRevenue]);

  // Tính toán doanh thu
  const revenueData = useMemo(() => {
    const today = getStartOfDay(new Date());

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Đầu tuần là thứ Hai
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();

    startOfWeek.setDate(
      today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    );

    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const completedOrders = orders
      .filter(isCompleted)
      .map((order) => ({
        ...order,
        parsedDate: getOrderDate(order),
        amount: Number(order.total) || 0,
      }))
      .filter((order) => order.parsedDate !== null);

    const getTotalByDate = (targetDate: Date) => {
      return completedOrders
        .filter((order) => {
          return (
            getStartOfDay(order.parsedDate!).getTime() ===
            targetDate.getTime()
          );
        })
        .reduce((sum, order) => sum + order.amount, 0);
    };

    const todayOrders = completedOrders.filter(
      (order) =>
        getStartOfDay(order.parsedDate!).getTime() === today.getTime()
    );

    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + order.amount,
      0
    );

    const yesterdayRevenue = getTotalByDate(yesterday);

    const weekRevenue = completedOrders
      .filter((order) => {
        const date = getStartOfDay(order.parsedDate!);

        return (
          date >= startOfWeek &&
          date <= today
        );
      })
      .reduce((sum, order) => sum + order.amount, 0);

    const monthRevenue = completedOrders
      .filter((order) => {
        const date = getStartOfDay(order.parsedDate!);

        return (
          date >= startOfMonth &&
          date <= today
        );
      })
      .reduce((sum, order) => sum + order.amount, 0);

    const averageOrder =
      todayOrders.length > 0
        ? todayRevenue / todayOrders.length
        : 0;

    // Tính tỷ lệ tăng trưởng so với hôm qua
    let growthText = "0%";

    if (yesterdayRevenue === 0 && todayRevenue > 0) {
      growthText = "Mới";
    } else if (yesterdayRevenue > 0) {
      const growth =
        ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

      growthText = `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`;
    }

    // Dữ liệu biểu đồ 7 ngày gần nhất
    const chartDays: RevenueDay[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const weekdayLabels = [
        "CN",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
      ];

      chartDays.push({
        date,
        label: weekdayLabels[date.getDay()],
        total: getTotalByDate(date),
      });
    }

    const chartTotal = chartDays.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const maxRevenue = Math.max(
      ...chartDays.map((item) => item.total),
      1
    );

    return {
      todayRevenue,
      weekRevenue,
      monthRevenue,
      todayOrderCount: todayOrders.length,
      averageOrder,
      growthText,
      chartDays,
      chartTotal,
      maxRevenue,
    };
  }, [orders]);

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="header-greeting">
          <span className="header-welcome">
            Chào buổi sáng,
          </span>

          <h1>Hệ thống quản lý 👋</h1>
        </div>
      </div>

      <div className="header-right">
        {/* SEARCH */}
        <div className="header-search">
          <span className="header-search-icon">⌕</span>

          <input
            type="text"
            placeholder="Tìm kiếm..."
          />

          <span className="search-shortcut">
            Ctrl K
          </span>
        </div>

        {/* NOTIFICATION */}
        <div className="notification-wrapper">
          <button
            className="notification-button"
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
            aria-label="Thông báo"
          >
            <span className="notification-icon">
              ♧
            </span>

            <span className="notification-badge">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <div>
                  <h3>Thông báo</h3>

                  <span>3 thông báo mới</span>
                </div>

                <button
                  onClick={() =>
                    setShowNotifications(false)
                  }
                >
                  ×
                </button>
              </div>

              <div className="notification-list">
                <div className="notification-item">
                  <div className="notification-item-icon inventory">
                    📦
                  </div>

                  <div>
                    <strong>Kho hàng sắp hết</strong>

                    <p>
                      2 sản phẩm đang dưới mức tồn tối thiểu.
                    </p>

                    <span>5 phút trước</span>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-item-icon order">
                    🛒
                  </div>

                  <div>
                    <strong>Có đơn hàng mới</strong>

                    <p>
                      Đơn hàng #DH0012 đang chờ xử lý.
                    </p>

                    <span>18 phút trước</span>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-item-icon system">
                    ✓
                  </div>

                  <div>
                    <strong>Hệ thống hoạt động tốt</strong>

                    <p>
                      Dữ liệu đã được đồng bộ thành công.
                    </p>

                    <span>1 giờ trước</span>
                  </div>
                </div>
              </div>

              <button className="notification-footer">
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>

        <div className="header-divider"></div>

        {/* REVENUE BUTTON */}
        <div className="revenue-wrapper">
          <button
            className={
              showRevenue
                ? "revenue-button active"
                : "revenue-button"
            }
            onClick={() =>
              setShowRevenue(!showRevenue)
            }
          >
            <span className="revenue-button-icon">
              ↗
            </span>

            <span className="revenue-button-text">
              Xem doanh thu
            </span>

            <span
              className={
                showRevenue
                  ? "revenue-chevron rotate"
                  : "revenue-chevron"
              }
            >
              ⌄
            </span>
          </button>

          {showRevenue && (
            <div className="revenue-panel">
              {/* PANEL HEADER */}
              <div className="revenue-panel-header">
                <div>
                  <span className="revenue-panel-eyebrow">
                    BÁO CÁO DOANH THU
                  </span>

                  <h3>Doanh thu</h3>

                  <p>
                    Tổng quan hoạt động kinh doanh
                  </p>
                </div>

                <button
                  className="revenue-panel-close"
                  onClick={() =>
                    setShowRevenue(false)
                  }
                >
                  ×
                </button>
              </div>

              {loadingRevenue ? (
                <div className="revenue-loading">
                  Đang tải dữ liệu doanh thu...
                </div>
              ) : revenueError ? (
                <div className="revenue-error">
                  {revenueError}
                  <button
                    onClick={() => {
                      setShowRevenue(false);
                      setTimeout(() => setShowRevenue(true), 0);
                    }}
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <>
                  {/* MAIN REVENUE */}
                  <div className="revenue-main-card">
                    <div className="revenue-main-icon">
                      ↗
                    </div>

                    <div className="revenue-main-info">
                      <span>
                        Doanh thu hôm nay
                      </span>

                      <strong>
                        {formatCurrency(revenueData.todayRevenue)}
                      </strong>
                    </div>

                    <div className="revenue-growth">
                      {revenueData.growthText}
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="revenue-stats">
                    <div className="revenue-stat">
                      <span>Tuần này</span>

                      <strong>
                        {formatShortCurrency(revenueData.weekRevenue)} đ
                      </strong>
                    </div>

                    <div className="revenue-stat">
                      <span>Tháng này</span>

                      <strong>
                        {formatShortCurrency(revenueData.monthRevenue)} đ
                      </strong>
                    </div>

                    <div className="revenue-stat">
                      <span>Đơn hôm nay</span>

                      <strong>
                        {revenueData.todayOrderCount}
                      </strong>
                    </div>

                    <div className="revenue-stat">
                      <span>Giá trị TB</span>

                      <strong>
                        {formatShortCurrency(revenueData.averageOrder)} đ
                      </strong>
                    </div>
                  </div>

                  {/* MINI CHART */}
                  <div className="revenue-chart">
                    <div className="revenue-chart-header">
                      <div>
                        <strong>
                          Hiệu suất 7 ngày
                        </strong>

                        <span>
                          Doanh thu theo ngày
                        </span>
                      </div>

                      <span className="revenue-chart-total">
                        {formatShortCurrency(revenueData.chartTotal)} đ
                      </span>
                    </div>

                    <div className="revenue-bars">
                      {revenueData.chartDays.map((item, index) => {
                        const height =
                          item.total > 0
                            ? Math.max(
                                (item.total / revenueData.maxRevenue) * 100,
                                5
                              )
                            : 0;

                        const isToday = index === 6;

                        return (
                          <div
                            className={
                              isToday
                                ? "revenue-bar-item today"
                                : "revenue-bar-item"
                            }
                            key={item.date.toISOString()}
                            title={`${item.label}: ${formatCurrency(item.total)}`}
                          >
                            <div
                              className="revenue-bar"
                              style={{
                                height: `${height}%`,
                              }}
                            ></div>

                            <span>{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="revenue-panel-footer">
                    <span>
                      Dữ liệu từ đơn hàng đã hoàn thành
                    </span>

                    <button
                      onClick={() => {
                        setShowRevenue(false);
                        navigate("/orders");
                      }}
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;