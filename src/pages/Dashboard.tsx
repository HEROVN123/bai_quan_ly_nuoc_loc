import { useState } from "react";

type ModalType =
  | "report"
  | "create-order"
  | "inventory"
  | "orders"
  | "product"
  | "customer"
  | "suggestion"
  | null;

function Dashboard() {
  const [period, setPeriod] = useState("7 ngày");
  const [modalType, setModalType] = useState<ModalType>(null);

  const stats = [
    {
      title: "Tổng sản phẩm",
      value: "128",
      change: "+8.2%",
      description: "so với tháng trước",
      icon: "◈",
      type: "cyan",
    },
    {
      title: "Đơn hàng",
      value: "356",
      change: "+12.5%",
      description: "so với tháng trước",
      icon: "▣",
      type: "blue",
    },
    {
      title: "Khách hàng",
      value: "1,248",
      change: "+6.8%",
      description: "khách hàng đang hoạt động",
      icon: "♙",
      type: "purple",
    },
    {
      title: "Doanh thu",
      value: "286.4M",
      change: "+15.3%",
      description: "so với tháng trước",
      icon: "₫",
      type: "green",
    },
  ];

  const recentOrders = [
    {
      code: "#DH0012",
      customer: "Nguyễn Minh Anh",
      product: "Nước tinh khiết 20L",
      quantity: "5 bình",
      total: "450.000đ",
      status: "Đang giao",
    },
    {
      code: "#DH0011",
      customer: "Trần Hoàng Nam",
      product: "Nước khoáng 500ml",
      quantity: "10 thùng",
      total: "720.000đ",
      status: "Đã giao",
    },
    {
      code: "#DH0010",
      customer: "Công ty ABC",
      product: "Nước tinh khiết 20L",
      quantity: "20 bình",
      total: "1.800.000đ",
      status: "Chờ xử lý",
    },
    {
      code: "#DH0009",
      customer: "Lê Thị Hương",
      product: "Nước khoáng 1.5L",
      quantity: "8 thùng",
      total: "640.000đ",
      status: "Đã giao",
    },
  ];

  const inventory = [
    {
      name: "Nước tinh khiết 20L",
      stock: 82,
      total: 100,
      unit: "bình",
    },
    {
      name: "Nước khoáng 500ml",
      stock: 64,
      total: 100,
      unit: "thùng",
    },
    {
      name: "Nước khoáng 1.5L",
      stock: 45,
      total: 100,
      unit: "thùng",
    },
    {
      name: "Nước ion kiềm 500ml",
      stock: 28,
      total: 100,
      unit: "thùng",
    },
  ];

  const performance = [42, 55, 48, 72, 61, 78, 86];

  const closeModal = () => {
    setModalType(null);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "report":
        return "Xuất báo cáo";
      case "create-order":
        return "Tạo đơn hàng";
      case "inventory":
        return "Tình trạng kho";
      case "orders":
        return "Đơn hàng gần đây";
      case "product":
        return "Thêm sản phẩm";
      case "customer":
        return "Thêm khách hàng";
      case "suggestion":
        return "Thông tin vận hành";
      default:
        return "";
    }
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "report":
        return (
          <>
            <div className="dashboard-modal-summary">
              <div>
                <span>Doanh thu</span>
                <strong>286.4M đ</strong>
              </div>

              <div>
                <span>Đơn hàng</span>
                <strong>356</strong>
              </div>

              <div>
                <span>Khách hàng</span>
                <strong>1,248</strong>
              </div>
            </div>

            <div className="dashboard-report-box">
              <div>
                <strong>Báo cáo kinh doanh</strong>
                <span>Tháng hiện tại</span>
              </div>

              <span className="dashboard-report-status">
                Sẵn sàng
              </span>
            </div>

            <div className="dashboard-report-options">
              <label>
                <span>Khoảng thời gian</span>

                <select defaultValue="Tháng này">
                  <option>Hôm nay</option>
                  <option>7 ngày qua</option>
                  <option>Tháng này</option>
                  <option>3 tháng gần nhất</option>
                </select>
              </label>

              <label>
                <span>Định dạng</span>

                <select defaultValue="Excel">
                  <option>Excel</option>
                  <option>PDF</option>
                </select>
              </label>
            </div>

            <div className="dashboard-modal-footer">
              <button
                className="dashboard-modal-cancel"
                onClick={closeModal}
              >
                Hủy
              </button>

              <button
                className="dashboard-modal-primary"
                onClick={() =>
                  window.alert(
                    "Báo cáo đã được chuẩn bị thành công."
                  )
                }
              >
                ↓ Xuất báo cáo
              </button>
            </div>
          </>
        );

      case "create-order":
        return (
          <>
            <div className="dashboard-form-grid">
              <label>
                <span>Khách hàng</span>

                <select defaultValue="">
                  <option value="" disabled>
                    Chọn khách hàng
                  </option>
                  <option>
                    Nguyễn Minh Anh
                  </option>
                  <option>
                    Trần Hoàng Nam
                  </option>
                  <option>
                    Công ty ABC
                  </option>
                </select>
              </label>

              <label>
                <span>Sản phẩm</span>

                <select defaultValue="">
                  <option value="" disabled>
                    Chọn sản phẩm
                  </option>
                  <option>
                    Nước tinh khiết 20L
                  </option>
                  <option>
                    Nước khoáng 500ml
                  </option>
                  <option>
                    Nước khoáng 1.5L
                  </option>
                </select>
              </label>

              <label>
                <span>Số lượng</span>

                <input
                  type="number"
                  min="1"
                  placeholder="Nhập số lượng"
                />
              </label>

              <label>
                <span>Ngày giao</span>

                <input type="date" />
              </label>
            </div>

            <div className="dashboard-order-note">
              <span>Ghi chú</span>

              <textarea
                placeholder="Nhập ghi chú cho đơn hàng..."
                rows={3}
              ></textarea>
            </div>

            <div className="dashboard-modal-footer">
              <button
                className="dashboard-modal-cancel"
                onClick={closeModal}
              >
                Hủy
              </button>

              <button
                className="dashboard-modal-primary"
                onClick={() =>
                  window.alert(
                    "Đơn hàng đã được tạo thành công."
                  )
                }
              >
                + Tạo đơn hàng
              </button>
            </div>
          </>
        );

      case "inventory":
        return (
          <>
            <div className="dashboard-modal-list">
              {inventory.map((item) => {
                const percentage =
                  (item.stock / item.total) * 100;

                let level = "high";

                if (percentage < 35) {
                  level = "low";
                } else if (percentage < 60) {
                  level = "medium";
                }

                return (
                  <div
                    className="dashboard-modal-inventory-item"
                    key={item.name}
                  >
                    <div>
                      <strong>{item.name}</strong>

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
                      {percentage.toFixed(0)}% tồn kho
                    </small>
                  </div>
                );
              })}
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
                onClick={() =>
                  window.alert(
                    "Đây sẽ là nơi chuyển sang quản lý kho."
                  )
                }
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
              {recentOrders.map((order) => (
                <div
                  className="dashboard-modal-order"
                  key={order.code}
                >
                  <div>
                    <strong>{order.code}</strong>

                    <span>{order.customer}</span>
                  </div>

                  <div>
                    <span>{order.product}</span>

                    <small>
                      {order.quantity}
                    </small>
                  </div>

                  <strong>{order.total}</strong>

                  <span
                    className={`dashboard-status ${
                      order.status === "Đã giao"
                        ? "delivered"
                        : order.status === "Đang giao"
                        ? "shipping"
                        : "pending"
                    }`}
                  >
                    <span></span>
                    {order.status}
                  </span>
                </div>
              ))}
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
                onClick={() =>
                  window.alert(
                    "Đây sẽ là nơi chuyển sang quản lý đơn hàng."
                  )
                }
              >
                Quản lý đơn hàng →
              </button>
            </div>
          </>
        );

      case "product":
        return (
          <>
            <div className="dashboard-form-grid">
              <label>
                <span>Tên sản phẩm</span>

                <input
                  type="text"
                  placeholder="Ví dụ: Nước tinh khiết 20L"
                />
              </label>

              <label>
                <span>Mã sản phẩm</span>

                <input
                  type="text"
                  placeholder="Ví dụ: SP007"
                />
              </label>

              <label>
                <span>Giá bán</span>

                <input
                  type="number"
                  placeholder="Nhập giá bán"
                />
              </label>

              <label>
                <span>Tồn kho</span>

                <input
                  type="number"
                  placeholder="Nhập số lượng"
                />
              </label>
            </div>

            <div className="dashboard-modal-footer">
              <button
                className="dashboard-modal-cancel"
                onClick={closeModal}
              >
                Hủy
              </button>

              <button
                className="dashboard-modal-primary"
                onClick={() =>
                  window.alert(
                    "Sản phẩm đã được thêm thành công."
                  )
                }
              >
                + Thêm sản phẩm
              </button>
            </div>
          </>
        );

      case "customer":
        return (
          <>
            <div className="dashboard-form-grid">
              <label>
                <span>Họ và tên</span>

                <input
                  type="text"
                  placeholder="Nhập tên khách hàng"
                />
              </label>

              <label>
                <span>Số điện thoại</span>

                <input
                  type="text"
                  placeholder="Nhập số điện thoại"
                />
              </label>

              <label>
                <span>Email</span>

                <input
                  type="email"
                  placeholder="Nhập email"
                />
              </label>

              <label>
                <span>Địa chỉ</span>

                <input
                  type="text"
                  placeholder="Nhập địa chỉ"
                />
              </label>
            </div>

            <div className="dashboard-modal-footer">
              <button
                className="dashboard-modal-cancel"
                onClick={closeModal}
              >
                Hủy
              </button>

              <button
                className="dashboard-modal-primary"
                onClick={() =>
                  window.alert(
                    "Khách hàng đã được thêm thành công."
                  )
                }
              >
                + Thêm khách hàng
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
                <strong>
                  Kiểm tra tồn kho
                </strong>

                <p>
                  Hiện có 2 sản phẩm đang ở mức tồn
                  kho thấp. Bạn nên kiểm tra và nhập
                  thêm hàng để tránh thiếu sản phẩm.
                </p>
              </div>
            </div>

            <div className="dashboard-suggestion-detail">
              <div className="dashboard-suggestion-detail-icon">
                ✓
              </div>

              <div>
                <strong>
                  Xử lý đơn hàng
                </strong>

                <p>
                  Có 12 đơn hàng đang chờ xử lý.
                  Bạn nên kiểm tra các đơn này trong
                  hôm nay.
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
            ↓ Xuất báo cáo
          </button>

          <button
            className="dashboard-primary-button"
            onClick={() =>
              setModalType("create-order")
            }
          >
            + Tạo đơn hàng
          </button>
        </div>
      </div>


      {/* STATS */}

      <div className="dashboard-stats">
        {stats.map((stat) => (
          <div
            className="dashboard-stat-card"
            key={stat.title}
          >
            <div className="stat-card-top">
              <div
                className={`stat-icon ${stat.type}`}
              >
                {stat.icon}
              </div>

              <span className="stat-change">
                ↑ {stat.change}
              </span>
            </div>

            <div className="stat-value">
              {stat.value}
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
            onChange={(e) =>
              setPeriod(e.target.value)
            }
            className="dashboard-select"
          >
            <option>7 ngày</option>
            <option>30 ngày</option>
            <option>3 tháng</option>
          </select>
        </div>

        <div className="performance-summary">
          <div>
            <strong>42.8M</strong>
            <span>Doanh thu</span>
          </div>

          <div>
            <strong>86</strong>
            <span>Đơn hàng</span>
          </div>

          <div>
            <strong>+15.3%</strong>
            <span>Tăng trưởng</span>
          </div>
        </div>

        <div className="chart-container">

          <div className="chart-y-axis">
            <span>100M</span>
            <span>75M</span>
            <span>50M</span>
            <span>25M</span>
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
              {performance.map((value, index) => (
                <div
                  className="chart-column"
                  key={index}
                >
                  <div
                    className="chart-bar"
                    style={{
                      height: `${value}%`,
                    }}
                  >
                    <span className="chart-tooltip">
                      {value}M
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chart-labels">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
            </div>

          </div>
        </div>
      </div>


      {/* ===================================================
    INVENTORY
    =================================================== */}

<div className="dashboard-card inventory-card">

  <div className="dashboard-card-header inventory-card-header">
    <div>
      <h2>Tình trạng kho</h2>
      <p>Thông tin tồn kho hiện tại</p>
    </div>

    <span className="inventory-total">
      128 sản phẩm
    </span>
  </div>

  <div className="dashboard-inventory-grid">

    {inventory.map((item) => {
      const percentage =
        (item.stock / item.total) * 100;

      let level = "high";

      if (percentage < 35) {
        level = "low";
      } else if (percentage < 60) {
        level = "medium";
      }

      return (
        <div
          className="dashboard-inventory-item"
          key={item.name}
        >

          <div className="dashboard-inventory-item-top">
            <div className="dashboard-inventory-name">
              <span className={`inventory-level-dot ${level}`}></span>

              <span>{item.name}</span>
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
    })}

  </div>

  <div className="dashboard-inventory-footer">
    <span>
      Kiểm tra và cập nhật số lượng tồn kho thường xuyên.
    </span>

    <button
      className="dashboard-inventory-detail-button"
      onClick={() => {
        window.location.href = "/inventory";
      }}
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
            onClick={() =>
              setModalType("orders")
            }
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
              {recentOrders.map((order) => (
                <tr key={order.code}>

                  <td>
                    <strong className="order-code">
                      {order.code}
                    </strong>
                  </td>

                  <td>
                    {order.customer}
                  </td>

                  <td>
                    {order.product}
                  </td>

                  <td>
                    {order.quantity}
                  </td>

                  <td>
                    <strong>
                      {order.total}
                    </strong>
                  </td>

                  <td>
                    <span
                      className={`dashboard-status ${
                        order.status === "Đã giao"
                          ? "delivered"
                          : order.status === "Đang giao"
                          ? "shipping"
                          : "pending"
                      }`}
                    >
                      <span></span>

                      {order.status}
                    </span>
                  </td>

                </tr>
              ))}
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
                <strong>
                  Kiểm tra tồn kho
                </strong>

                <p>
                  2 sản phẩm đang sắp hết hàng.
                </p>
              </div>

              <button
                onClick={() =>
                  setModalType("suggestion")
                }
              >
                →
              </button>
            </div>

            <div className="suggestion-item">
              <div className="suggestion-icon info">
                ✓
              </div>

              <div>
                <strong>
                  Xử lý đơn hàng
                </strong>

                <p>
                  Có 12 đơn hàng đang chờ xử lý.
                </p>
              </div>

              <button
                onClick={() =>
                  setModalType("orders")
                }
              >
                →
              </button>
            </div>

            <div className="suggestion-item">
              <div className="suggestion-icon success">
                ★
              </div>

              <div>
                <strong>
                  Hiệu suất tốt
                </strong>

                <p>
                  Doanh thu đang tăng 15.3% so với
                  tháng trước.
                </p>
              </div>

              <button
                onClick={() =>
                  setModalType("report")
                }
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
              onClick={() =>
                setModalType("product")
              }
            >
              <span>＋</span>

              <div>
                <strong>
                  Thêm sản phẩm
                </strong>

                <small>
                  Tạo sản phẩm mới
                </small>
              </div>
            </button>

            <button
              onClick={() =>
                setModalType("create-order")
              }
            >
              <span>▣</span>

              <div>
                <strong>
                  Tạo đơn hàng
                </strong>

                <small>
                  Tạo đơn phân phối mới
                </small>
              </div>
            </button>

            <button
              onClick={() =>
                setModalType("customer")
              }
            >
              <span>♙</span>

              <div>
                <strong>
                  Thêm khách hàng
                </strong>

                <small>
                  Thêm khách hàng mới
                </small>
              </div>
            </button>

            <button
              onClick={() =>
                setModalType("inventory")
              }
            >
              <span>▤</span>

              <div>
                <strong>
                  Kiểm tra kho
                </strong>

                <small>
                  Xem tình trạng tồn kho
                </small>
              </div>
            </button>

          </div>
        </div>

      </div>


      {/* =====================================================
          CENTER MODAL
          ===================================================== */}

      {modalType && (
        <div
          className="dashboard-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="dashboard-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="dashboard-modal-header">
              <div>
                <span>
                  WATER MANAGER
                </span>

                <h2>
                  {getModalTitle()}
                </h2>
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