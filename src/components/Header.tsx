import { useState } from "react";

function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);

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

                  <span>
                    3 thông báo mới
                  </span>
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
                    <strong>
                      Kho hàng sắp hết
                    </strong>

                    <p>
                      2 sản phẩm đang dưới mức tồn
                      tối thiểu.
                    </p>

                    <span>5 phút trước</span>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-item-icon order">
                    🛒
                  </div>

                  <div>
                    <strong>
                      Có đơn hàng mới
                    </strong>

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
                    <strong>
                      Hệ thống hoạt động tốt
                    </strong>

                    <p>
                      Dữ liệu đã được đồng bộ thành
                      công.
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
                    12.8M đ
                  </strong>
                </div>

                <div className="revenue-growth">
                  +8.4%
                </div>
              </div>

              {/* STATS */}
              <div className="revenue-stats">
                <div className="revenue-stat">
                  <span>Tuần này</span>
                  <strong>78.6M đ</strong>
                </div>

                <div className="revenue-stat">
                  <span>Tháng này</span>
                  <strong>286.4M đ</strong>
                </div>

                <div className="revenue-stat">
                  <span>Đơn hôm nay</span>
                  <strong>42</strong>
                </div>

                <div className="revenue-stat">
                  <span>Giá trị TB</span>
                  <strong>305K đ</strong>
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
                    78.6M
                  </span>
                </div>

                <div className="revenue-bars">
                  <div className="revenue-bar-item">
                    <div
                      className="revenue-bar"
                      style={{ height: "45%" }}
                    ></div>
                    <span>T2</span>
                  </div>

                  <div className="revenue-bar-item">
                    <div
                      className="revenue-bar"
                      style={{ height: "62%" }}
                    ></div>
                    <span>T3</span>
                  </div>

                  <div className="revenue-bar-item">
                    <div
                      className="revenue-bar"
                      style={{ height: "50%" }}
                    ></div>
                    <span>T4</span>
                  </div>

                  <div className="revenue-bar-item">
                    <div
                      className="revenue-bar"
                      style={{ height: "75%" }}
                    ></div>
                    <span>T5</span>
                  </div>

                  <div className="revenue-bar-item">
                    <div
                      className="revenue-bar"
                      style={{ height: "66%" }}
                    ></div>
                    <span>T6</span>
                  </div>

                  <div className="revenue-bar-item">
                    <div
                      className="revenue-bar"
                      style={{ height: "88%" }}
                    ></div>
                    <span>T7</span>
                  </div>

                  <div className="revenue-bar-item today">
                    <div
                      className="revenue-bar"
                      style={{ height: "100%" }}
                    ></div>
                    <span>CN</span>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="revenue-panel-footer">
                <span>
                  Cập nhật lần cuối: hôm nay, 09:00
                </span>

                <button>
                  Xem chi tiết →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;