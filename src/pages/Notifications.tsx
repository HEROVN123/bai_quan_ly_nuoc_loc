
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000/inventory";

interface InventoryAlert {
  id: number;
  code: string;
  product: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  updatedAt: string;
}

type FilterType = "all" | "low" | "out";

function Notifications() {
  const navigate = useNavigate();

  const [items, setItems] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu thông báo kho hàng.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu kho hàng không hợp lệ.");
      }

      const alerts: InventoryAlert[] = data
        .map((item: any) => ({
          id: Number(item.id),
          code: String(item.code ?? ""),
          product: String(item.product ?? ""),
          category: String(item.category ?? ""),
          stock: Number(item.stock),
          minStock: Number(item.minStock),
          unit: String(item.unit ?? ""),
          updatedAt: String(item.updatedAt ?? ""),
        }))
        .filter(
          (item) =>
            Number.isFinite(item.stock) &&
            Number.isFinite(item.minStock) &&
            item.stock <= item.minStock
        );

      setItems(alerts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi tải thông báo."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự tải thông báo khi mở trang
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const outOfStockCount = useMemo(
    () => items.filter((item) => item.stock === 0).length,
    [items]
  );

  const lowStockCount = useMemo(
    () => items.filter((item) => item.stock > 0).length,
    [items]
  );

  const filteredItems = useMemo(() => {
    if (filter === "out") {
      return items.filter((item) => item.stock === 0);
    }

    if (filter === "low") {
      return items.filter((item) => item.stock > 0);
    }

    return items;
  }, [items, filter]);

  const formatDate = (value: string) => {
    if (!value) return "Chưa cập nhật";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="notifications-page">
      <div className="notifications-page-header">
        <div>
          <span className="notifications-eyebrow">
            WATER MANAGER
          </span>

          <h1>Thông báo</h1>

          <p>
            Theo dõi tình trạng tồn kho và các sản phẩm cần được kiểm tra.
          </p>
        </div>

        <div className="notifications-actions">
          <button
            type="button"
            className="notifications-refresh"
            onClick={fetchNotifications}
            disabled={loading}
          >
            ↻ {loading ? "Đang tải..." : "Làm mới"}
          </button>

          <button
            type="button"
            className="notifications-back"
            onClick={() => navigate("/dashboard")}
          >
            ← Trang chủ
          </button>
        </div>
      </div>

      {/* THỐNG KÊ */}
      <div className="notifications-summary">
        <div className="notifications-summary-card">
          <div className="notifications-summary-icon">
            🔔
          </div>

          <div>
            <span>Tổng cảnh báo</span>
            <strong>{items.length}</strong>
          </div>
        </div>

        <div className="notifications-summary-card">
          <div className="notifications-summary-icon warning">
            📦
          </div>

          <div>
            <span>Sắp hết hàng</span>
            <strong>{lowStockCount}</strong>
          </div>
        </div>

        <div className="notifications-summary-card">
          <div className="notifications-summary-icon danger">
            ⚠
          </div>

          <div>
            <span>Đã hết hàng</span>
            <strong>{outOfStockCount}</strong>
          </div>
        </div>
      </div>

      {/* DANH SÁCH THÔNG BÁO */}
      <div className="notifications-page-list">
        <div className="notifications-list-header">
          <div>
            <h2>Cảnh báo kho hàng</h2>
            <p>
              Danh sách sản phẩm có số lượng tồn không đạt mức tối thiểu.
            </p>
          </div>

          <div className="notifications-filters">
            <button
              type="button"
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              Tất cả ({items.length})
            </button>

            <button
              type="button"
              className={filter === "low" ? "active" : ""}
              onClick={() => setFilter("low")}
            >
              Sắp hết ({lowStockCount})
            </button>

            <button
              type="button"
              className={filter === "out" ? "active" : ""}
              onClick={() => setFilter("out")}
            >
              Hết hàng ({outOfStockCount})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="notifications-empty">
            <span>⏳</span>
            <strong>Đang tải thông báo...</strong>
            <p>Vui lòng chờ trong giây lát.</p>
          </div>
        ) : error ? (
          <div className="notifications-empty notifications-error">
            <span>⚠</span>
            <strong>Không thể tải thông báo</strong>
            <p>{error}</p>

            <button
              type="button"
              className="notifications-refresh"
              onClick={fetchNotifications}
            >
              Thử lại
            </button>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="notifications-items">
            {filteredItems.map((item) => {
              const isOutOfStock = item.stock === 0;

              return (
                <div
                  className="notifications-page-item"
                  key={item.id}
                >
                  <div
                    className={`notification-item-icon ${
                      isOutOfStock ? "system" : "inventory"
                    }`}
                  >
                    {isOutOfStock ? "⚠" : "📦"}
                  </div>

                  <div className="notifications-page-content">
                    <div className="notifications-item-heading">
                      <strong>
                        {isOutOfStock
                          ? "Sản phẩm đã hết hàng"
                          : "Kho hàng sắp hết"}
                      </strong>

                      <span
                        className={`notifications-status ${
                          isOutOfStock ? "danger" : "warning"
                        }`}
                      >
                        {isOutOfStock ? "Hết hàng" : "Sắp hết"}
                      </span>
                    </div>

                    <p>
                      <strong>{item.product}</strong> ({item.code})
                    </p>

                    <p>
                      Số lượng còn:{" "}
                      <strong>{item.stock} {item.unit}</strong>
                      {" · "}
                      Mức tồn tối thiểu:{" "}
                      <strong>{item.minStock} {item.unit}</strong>
                    </p>

                    <span className="notifications-item-date">
                      Cập nhật: {formatDate(item.updatedAt)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="notifications-view-button"
                    onClick={() => navigate("/inventory")}
                  >
                    Xem kho hàng →
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="notifications-empty">
            <span>✓</span>
            <strong>
              {filter === "all"
                ? "Kho hàng đang ổn định"
                : filter === "low"
                  ? "Không có sản phẩm sắp hết hàng"
                  : "Không có sản phẩm hết hàng"}
            </strong>
            <p>
              {filter === "all"
                ? "Hiện tại không có sản phẩm nào cần cảnh báo."
                : "Không có thông báo nào phù hợp với bộ lọc này."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
