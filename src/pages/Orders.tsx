
import { useEffect, useMemo, useState } from "react";

interface Order {
  id: number;
  code: string;
  customer: string;
  phone: string;
  product: string;
  quantity: number;
  total: number;
  date: string;
  status:
    | "Đang xử lý"
    | "Đang giao"
    | "Hoàn thành"
    | "Đã hủy";
}

const API_URL = "http://localhost:3000/orders";

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [form, setForm] = useState({
    code: "",
    customer: "",
    phone: "",
    product: "Nước tinh khiết 20L",
    quantity: "",
    total: "",
    date: "",
    status: "Đang xử lý" as Order["status"],
  });

  // Header gửi token nếu người dùng đã đăng nhập
  const getHeaders = () => {
    const token = localStorage.getItem("accessToken");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Xử lý lỗi trả về từ Backend
  const getErrorMessage = async (response: Response) => {
    try {
      const data = await response.json();

      if (Array.isArray(data.message)) {
        return data.message.join("\n");
      }

      return data.message || "Đã xảy ra lỗi!";
    } catch {
      return "Không thể kết nối đến máy chủ!";
    }
  };

  // Chuẩn hóa dữ liệu nhận từ SQL Server
  const normalizeOrder = (item: any): Order => ({
    id: Number(item.id),
    code: item.code,
    customer: item.customer,
    phone: item.phone,
    product: item.product,
    quantity: Number(item.quantity),
    total: Number(item.total),
    date: item.date,
    status: item.status,
  });

  // Lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      setOrders(data.map(normalizeOrder));
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách đơn hàng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        order.code.toLowerCase().includes(keyword) ||
        order.customer.toLowerCase().includes(keyword) ||
        order.phone.toLowerCase().includes(keyword) ||
        order.product.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Tất cả" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalOrders = orders.length;

  const completedOrders = orders.filter(
    (order) => order.status === "Hoàn thành"
  ).length;

  const processingOrders = orders.filter(
    (order) =>
      order.status === "Đang xử lý" ||
      order.status === "Đang giao"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Đã hủy"
  ).length;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price);

  const openAddModal = () => {
    setEditingOrder(null);

    setForm({
      code: "",
      customer: "",
      phone: "",
      product: "Nước tinh khiết 20L",
      quantity: "",
      total: "",
      date: new Date().toLocaleDateString("vi-VN"),
      status: "Đang xử lý",
    });

    setShowModal(true);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);

    setForm({
      code: order.code,
      customer: order.customer,
      phone: order.phone,
      product: order.product,
      quantity: String(order.quantity),
      total: String(order.total),
      date: order.date,
      status: order.status,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingOrder(null);
  };

  // Thêm hoặc cập nhật đơn hàng
  const handleSave = async () => {
    if (
      !form.code.trim() ||
      !form.customer.trim() ||
      !form.phone.trim() ||
      !form.product.trim() ||
      !form.quantity ||
      form.total === "" ||
      !form.date.trim()
    ) {
      alert("Vui lòng nhập đầy đủ thông tin đơn hàng.");
      return;
    }

    const quantity = Number(form.quantity);
    const total = Number(form.total);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(total) ||
      total < 0
    ) {
      alert("Số lượng phải là số nguyên lớn hơn 0 và tổng tiền không được âm.");
      return;
    }

    const orderData = {
      code: form.code.trim(),
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      product: form.product,
      quantity,
      total,
      date: form.date.trim(),
      status: form.status,
    };

    try {
      setSaving(true);

      const isEditing = Boolean(editingOrder);

      const response = await fetch(
        isEditing
          ? `${API_URL}/${editingOrder!.id}`
          : API_URL,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      alert(
        isEditing
          ? "Cập nhật đơn hàng thành công!"
          : "Thêm đơn hàng thành công!"
      );

      setShowModal(false);
      setEditingOrder(null);

      await fetchOrders();
    } catch (err) {
      console.error("Lỗi lưu đơn hàng:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Không thể lưu đơn hàng!"
      );
    } finally {
      setSaving(false);
    }
  };

  // Xóa đơn hàng
  const handleDelete = async (order: Order) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa đơn hàng "${order.code}" không?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${order.id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      alert("Xóa đơn hàng thành công!");

      await fetchOrders();
    } catch (err) {
      console.error("Lỗi xóa đơn hàng:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Không thể xóa đơn hàng!"
      );
    }
  };

  return (
    <div className="orders-page">
      {/* HEADING */}
      <div className="orders-heading">
        <div>
          <div className="orders-breadcrumb">
            <span>WATER MANAGER</span>
            <span>/</span>
            <span>Quản lý</span>
            <span>/</span>
            <span>Đơn hàng</span>
          </div>

          <h1>Quản lý đơn hàng</h1>

          <p>
            Quản lý đơn hàng, khách hàng, sản phẩm và
            tình trạng giao hàng.
          </p>
        </div>

        <button
          className="orders-primary-button"
          onClick={openAddModal}
        >
          <span>＋</span>
          Tạo đơn hàng
        </button>
      </div>

      {/* SUMMARY */}
      <div className="orders-summary">
        <div className="order-summary-card">
          <div className="order-summary-icon cyan">▣</div>

          <div>
            <span>Tổng đơn hàng</span>
            <strong>{totalOrders}</strong>
          </div>
        </div>

        <div className="order-summary-card">
          <div className="order-summary-icon green">✓</div>

          <div>
            <span>Hoàn thành</span>
            <strong>{completedOrders}</strong>
          </div>
        </div>

        <div className="order-summary-card">
          <div className="order-summary-icon orange">◷</div>

          <div>
            <span>Đang xử lý</span>
            <strong>{processingOrders}</strong>
          </div>
        </div>

        <div className="order-summary-card">
          <div className="order-summary-icon red">×</div>

          <div>
            <span>Đã hủy</span>
            <strong>{cancelledOrders}</strong>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="orders-card">
        <div className="orders-toolbar">
          <div>
            <h2>Danh sách đơn hàng</h2>

            <p>
              {filteredOrders.length} đơn hàng được hiển thị
            </p>
          </div>

          <div className="orders-filters">
            <div className="orders-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Tìm mã đơn, khách hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="orders-filter-select"
            >
              <option>Tất cả</option>
              <option>Đang xử lý</option>
              <option>Đang giao</option>
              <option>Hoàn thành</option>
              <option>Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>SL</th>
                <th>Tổng tiền</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="orders-empty">
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="orders-empty">
                    <div>
                      <strong>Không thể tải đơn hàng</strong>
                      <p>{error}</p>
                      <button onClick={fetchOrders}>
                        Thử tải lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="order-code">
                        {order.code}
                      </span>
                    </td>

                    <td>
                      <div className="order-customer-cell">
                        <div className="order-customer-avatar">
                          {order.customer.charAt(0)}
                        </div>

                        <div>
                          <strong>{order.customer}</strong>
                          <span>{order.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="order-product-cell">
                        <div className="order-product-icon">💧</div>
                        <span>{order.product}</span>
                      </div>
                    </td>

                    <td>
                      <strong className="order-quantity">
                        {order.quantity}
                      </strong>
                    </td>

                    <td>
                      <strong className="order-total">
                        {formatPrice(order.total)}đ
                      </strong>
                    </td>

                    <td>
                      <span className="order-date">
                        {order.date}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`order-status ${
                          order.status === "Hoàn thành"
                            ? "completed"
                            : order.status === "Đã hủy"
                            ? "cancelled"
                            : order.status === "Đang giao"
                            ? "shipping"
                            : "processing"
                        }`}
                      >
                        <span></span>
                        {order.status}
                      </span>
                    </td>

                    <td>
                      <div className="order-actions">
                        <button
                          className="order-edit-button"
                          onClick={() => openEditModal(order)}
                          title="Chỉnh sửa"
                        >
                          ✎
                        </button>

                        <button
                          className="order-delete-button"
                          onClick={() => handleDelete(order)}
                          title="Xóa"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="orders-empty">
                    <div>
                      <span>⌕</span>

                      <strong>Không tìm thấy đơn hàng</strong>

                      <p>
                        Hãy thử thay đổi từ khóa hoặc bộ lọc.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="order-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="order-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-modal-header">
              <div className="order-modal-title">
                <div className="order-modal-icon">
                  {editingOrder ? "✎" : "＋"}
                </div>

                <div>
                  <h2>
                    {editingOrder
                      ? "Chỉnh sửa đơn hàng"
                      : "Tạo đơn hàng mới"}
                  </h2>

                  <p>
                    {editingOrder
                      ? "Cập nhật thông tin đơn hàng"
                      : "Nhập thông tin đơn hàng vào hệ thống"}
                  </p>
                </div>
              </div>

              <button
                className="order-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="order-form">
              <div className="order-form-row">
                <div className="order-form-group">
                  <label>
                    Mã đơn hàng <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="VD: DH0017"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value })
                    }
                  />
                </div>

                <div className="order-form-group">
                  <label>
                    Ngày đặt <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="VD: 07/11/2026"
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="order-form-row">
                <div className="order-form-group">
                  <label>
                    Khách hàng <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Tên khách hàng"
                    value={form.customer}
                    onChange={(e) =>
                      setForm({ ...form, customer: e.target.value })
                    }
                  />
                </div>

                <div className="order-form-group">
                  <label>
                    Số điện thoại <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="0901234567"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="order-form-row">
                <div className="order-form-group">
                  <label>Sản phẩm</label>

                  <select
                    value={form.product}
                    onChange={(e) =>
                      setForm({ ...form, product: e.target.value })
                    }
                  >
                    <option>Nước tinh khiết 20L</option>
                    <option>Nước khoáng 500ml</option>
                    <option>Nước khoáng 1.5L</option>
                    <option>Nước ion kiềm 500ml</option>
                    <option>Nước tinh khiết 350ml</option>
                  </select>
                </div>

                <div className="order-form-group">
                  <label>
                    Số lượng <span>*</span>
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="0"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="order-form-row">
                <div className="order-form-group">
                  <label>
                    Tổng tiền <span>*</span>
                  </label>

                  <div className="order-input-unit">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.total}
                      onChange={(e) =>
                        setForm({ ...form, total: e.target.value })
                      }
                    />

                    <span>VNĐ</span>
                  </div>
                </div>

                <div className="order-form-group">
                  <label>Trạng thái</label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as Order["status"],
                      })
                    }
                  >
                    <option>Đang xử lý</option>
                    <option>Đang giao</option>
                    <option>Hoàn thành</option>
                    <option>Đã hủy</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="order-modal-footer">
              <button
                className="order-cancel-button"
                onClick={closeModal}
                disabled={saving}
              >
                Hủy
              </button>

              <button
                className="order-save-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Đang lưu..."
                  : editingOrder
                  ? "Lưu thay đổi"
                  : "Tạo đơn hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
