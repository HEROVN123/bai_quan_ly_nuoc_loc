import { useMemo, useState } from "react";

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

const initialCustomers: Customer[] = [
  {
    id: 1,
    code: "KH001",
    name: "Nguyễn Minh Anh",
    phone: "0901234567",
    email: "minhanh@gmail.com",
    address: "Quận 1, TP. Hồ Chí Minh",
    orders: 18,
    status: "Đang hoạt động",
  },
  {
    id: 2,
    code: "KH002",
    name: "Trần Hoàng Nam",
    phone: "0912345678",
    email: "hoangnam@gmail.com",
    address: "Quận 3, TP. Hồ Chí Minh",
    orders: 12,
    status: "Đang hoạt động",
  },
  {
    id: 3,
    code: "KH003",
    name: "Lê Thị Ngọc",
    phone: "0923456789",
    email: "lengoc@gmail.com",
    address: "Quận 7, TP. Hồ Chí Minh",
    orders: 25,
    status: "Đang hoạt động",
  },
  {
    id: 4,
    code: "KH004",
    name: "Phạm Quốc Huy",
    phone: "0934567890",
    email: "quochuy@gmail.com",
    address: "Thủ Đức, TP. Hồ Chí Minh",
    orders: 7,
    status: "Ngừng hoạt động",
  },
  {
    id: 5,
    code: "KH005",
    name: "Võ Thanh Thảo",
    phone: "0945678901",
    email: "thanhthao@gmail.com",
    address: "Bình Thạnh, TP. Hồ Chí Minh",
    orders: 31,
    status: "Đang hoạt động",
  },
];

function Customers() {
  const [customers, setCustomers] =
    useState<Customer[]>(initialCustomers);

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

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleSave = () => {
    if (
      !form.code.trim() ||
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.email.trim()
    ) {
      alert("Vui lòng nhập đầy đủ thông tin khách hàng.");
      return;
    }

    if (editingCustomer) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === editingCustomer.id
            ? {
                ...customer,
                code: form.code,
                name: form.name,
                phone: form.phone,
                email: form.email,
                address: form.address,
                status: form.status,
              }
            : customer
        )
      );

      alert("Cập nhật khách hàng thành công!");
    } else {
      const newCustomer: Customer = {
        id: Date.now(),
        code: form.code,
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        orders: 0,
        status: form.status,
      };

      setCustomers((current) => [...current, newCustomer]);

      alert("Thêm khách hàng thành công!");
    }

    closeModal();
  };

  const handleDelete = (customer: Customer) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa khách hàng "${customer.name}" không?`
    );

    if (!confirmed) return;

    setCustomers((current) =>
      current.filter((item) => item.id !== customer.id)
    );
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
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
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
              {filteredCustomers.length > 0 ? (
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
                        {customer.address}
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
                          customer.status ===
                          "Đang hoạt động"
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
                          onClick={() =>
                            openEditModal(customer)
                          }
                          title="Chỉnh sửa"
                        >
                          ✎
                        </button>

                        <button
                          className="customer-delete-button"
                          onClick={() =>
                            handleDelete(customer)
                          }
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
                  <td
                    colSpan={7}
                    className="customers-empty"
                  >
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
                      status:
                        e.target.value as Customer["status"],
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
              >
                Hủy
              </button>

              <button
                className="customer-save-button"
                onClick={handleSave}
              >
                {editingCustomer
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
