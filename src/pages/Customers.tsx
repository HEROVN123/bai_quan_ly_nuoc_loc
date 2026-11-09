
import { useEffect, useMemo, useState } from "react";

interface Customer {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  orders: number;
  status: "Đang hoạt động" | "Ngừng hoạt động";
}

interface ApiCustomer {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  isActive: boolean;
}

const API_URL = "http://localhost:3000";

const getHeaders = () => {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Chuyển dữ liệu từ Backend sang giao diện Frontend
const mapCustomer = (customer: ApiCustomer): Customer => ({
  id: customer.id,
  code: customer.code,
  name: customer.name,
  phone: customer.phone,
  email: customer.email,
  address: customer.address ?? "",
  orders: 0,
  status: customer.isActive
    ? "Đang hoạt động"
    : "Ngừng hoạt động",
});

// Đọc thông báo lỗi từ Backend
const getErrorMessage = async (response: Response) => {
  const data = await response.json().catch(() => null);

  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  return data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
};

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    status: "Đang hoạt động" as Customer["status"],
  });

  // Lấy danh sách khách hàng từ SQL Server thông qua API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(`${API_URL}/customers`, {
          method: "GET",
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const data: ApiCustomer[] = await response.json();

        setCustomers(data.map(mapCustomer));
      } catch (error) {
        console.error("Lỗi lấy danh sách khách hàng:", error);

        setLoadError(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách khách hàng."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Tìm kiếm và lọc khách hàng
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        customer.code.toLowerCase().includes(keyword) ||
        customer.name.toLowerCase().includes(keyword) ||
        customer.phone.toLowerCase().includes(keyword) ||
        customer.email.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Tất cả" ||
        customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  // Thống kê
  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Đang hoạt động"
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "Ngừng hoạt động"
  ).length;

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.orders,
    0
  );

  // Mở form thêm khách hàng
  const openAddModal = () => {
    setEditingCustomer(null);

    setForm({
      code: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      status: "Đang hoạt động",
    });

    setShowModal(true);
  };

  // Mở form chỉnh sửa
  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);

    setForm({
      code: customer.code,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      status: customer.status,
    });

    setShowModal(true);
  };

  // Đóng form
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCustomer(null);
  };

  // Thêm hoặc cập nhật khách hàng qua API
  const handleSave = async () => {
    if (
      !form.code.trim() ||
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.email.trim()
    ) {
      alert("Vui lòng nhập đầy đủ thông tin khách hàng.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      alert("Email không hợp lệ.");
      return;
    }

    const customerData = {
      code: form.code.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim() || null,
      isActive: form.status === "Đang hoạt động",
    };

    try {
      setSaving(true);

      if (editingCustomer) {
        // Cập nhật khách hàng
        const response = await fetch(
          `${API_URL}/customers/${editingCustomer.id}`,
          {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(customerData),
          }
        );

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const updatedData: ApiCustomer = await response.json();
        const updatedCustomer = mapCustomer(updatedData);

        setCustomers((current) =>
          current.map((customer) =>
            customer.id === editingCustomer.id
              ? updatedCustomer
              : customer
          )
        );

        alert("Cập nhật khách hàng thành công!");
      } else {
        // Thêm khách hàng mới
        const response = await fetch(`${API_URL}/customers`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(customerData),
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const newData: ApiCustomer = await response.json();
        const newCustomer = mapCustomer(newData);

        setCustomers((current) => [
          newCustomer,
          ...current,
        ]);

        alert("Thêm khách hàng thành công!");
      }

      setShowModal(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("Lỗi lưu khách hàng:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể lưu khách hàng."
      );
    } finally {
      setSaving(false);
    }
  };

  // Xóa khách hàng qua API
  const handleDelete = async (customer: Customer) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa khách hàng "${customer.name}" không?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/customers/${customer.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setCustomers((current) =>
        current.filter((item) => item.id !== customer.id)
      );

      alert("Xóa khách hàng thành công!");
    } catch (error) {
      console.error("Lỗi xóa khách hàng:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể xóa khách hàng."
      );
    }
  };

  return (
    <div className="customers-page">
      {/* HEADING */}
      <div className="customers-heading">
        <div>
          <div className="customers-breadcrumb">
            <span>WATER MANAGER</span>
            <span>/</span>
            <span>Quản lý</span>
            <span>/</span>
            <span>Khách hàng</span>
          </div>

          <h1>Quản lý khách hàng</h1>

          <p>
            Quản lý thông tin khách hàng, lịch sử giao dịch
            và trạng thái hoạt động.
          </p>
        </div>

        <button
          className="customers-primary-button"
          onClick={openAddModal}
        >
          <span>＋</span>
          Thêm khách hàng
        </button>
      </div>

      {/* SUMMARY */}
      <div className="customers-summary">
        <div className="customer-summary-card">
          <div className="customer-summary-icon cyan">
            ♙
          </div>

          <div>
            <span>Tổng khách hàng</span>
            <strong>{totalCustomers}</strong>
          </div>
        </div>

        <div className="customer-summary-card">
          <div className="customer-summary-icon green">
            ✓
          </div>

          <div>
            <span>Đang hoạt động</span>
            <strong>{activeCustomers}</strong>
          </div>
        </div>

        <div className="customer-summary-card">
          <div className="customer-summary-icon orange">
            !
          </div>

          <div>
            <span>Ngừng hoạt động</span>
            <strong>{inactiveCustomers}</strong>
          </div>
        </div>

        <div className="customer-summary-card">
          <div className="customer-summary-icon blue">
            ▣
          </div>

          <div>
            <span>Tổng đơn hàng</span>
            <strong>{totalOrders}</strong>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="customers-card">
        <div className="customers-toolbar">
          <div>
            <h2>Danh sách khách hàng</h2>

            <p>
              {filteredCustomers.length} khách hàng được hiển thị
            </p>
          </div>

          <div className="customers-filters">
            <div className="customers-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Tìm tên, mã, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="customers-filter-select"
            >
              <option>Tất cả</option>
              <option>Đang hoạt động</option>
              <option>Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Mã khách hàng</th>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Địa chỉ</th>
                <th>Đơn hàng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="customers-empty">
                    Đang tải danh sách khách hàng...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={7} className="customers-empty">
                    <div>
                      <strong>Không thể tải khách hàng</strong>
                      <p>{loadError}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <span className="customer-code">
                        {customer.code}
                      </span>
                    </td>

                    <td>
                      <div className="customer-name-cell">
                        <div className="customer-avatar">
                          {customer.name.charAt(0)}
                        </div>

                        <div>
                          <strong>{customer.name}</strong>
                          <span>Khách hàng</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="customer-contact">
                        <span>{customer.phone}</span>
                        <small>{customer.email}</small>
                      </div>
                    </td>

                    <td>
                      <span className="customer-address">
                        {customer.address || "Chưa cập nhật"}
                      </span>
                    </td>

                    <td>
                      <strong className="customer-orders">
                        {customer.orders}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`customer-status ${
                          customer.status === "Đang hoạt động"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        <span></span>
                        {customer.status}
                      </span>
                    </td>

                    <td>
                      <div className="customer-actions">
                        <button
                          className="customer-edit-button"
                          onClick={() => openEditModal(customer)}
                          title="Chỉnh sửa"
                        >
                          ✎
                        </button>

                        <button
                          className="customer-delete-button"
                          onClick={() => handleDelete(customer)}
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
                  <td colSpan={7} className="customers-empty">
                    <div>
                      <span>⌕</span>

                      <strong>
                        Không tìm thấy khách hàng
                      </strong>

                      <p>
                        Hãy thử thay đổi từ khóa tìm kiếm
                        hoặc bộ lọc.
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
          className="customer-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="customer-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="customer-modal-header">
              <div className="customer-modal-title">
                <div className="customer-modal-icon">
                  {editingCustomer ? "✎" : "＋"}
                </div>

                <div>
                  <h2>
                    {editingCustomer
                      ? "Chỉnh sửa khách hàng"
                      : "Thêm khách hàng mới"}
                  </h2>

                  <p>
                    {editingCustomer
                      ? "Cập nhật thông tin khách hàng"
                      : "Nhập thông tin khách hàng vào hệ thống"}
                  </p>
                </div>
              </div>

              <button
                className="customer-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="customer-form">
              <div className="customer-form-row">
                <div className="customer-form-group">
                  <label>
                    Mã khách hàng <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="VD: KH006"
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        code: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="customer-form-group">
                  <label>
                    Họ và tên <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="customer-form-row">
                <div className="customer-form-group">
                  <label>
                    Số điện thoại <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="0901234567"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="customer-form-group">
                  <label>
                    Email <span>*</span>
                  </label>

                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="customer-form-group">
                <label>Địa chỉ</label>

                <input
                  type="text"
                  placeholder="Nhập địa chỉ khách hàng"
                  value={form.address}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              <div className="customer-form-group">
                <label>Trạng thái</label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as Customer["status"],
                    })
                  }
                >
                  <option>Đang hoạt động</option>
                  <option>Ngừng hoạt động</option>
                </select>
              </div>
            </div>

            <div className="customer-modal-footer">
              <button
                className="customer-cancel-button"
                onClick={closeModal}
                disabled={saving}
              >
                Hủy
              </button>

              <button
                className="customer-save-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Đang lưu..."
                  : editingCustomer
                    ? "Lưu thay đổi"
                    : "Thêm khách hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
