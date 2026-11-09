
import { useEffect, useMemo, useState } from "react";

interface Employee {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  department: string;
  position: string;
  status: "Đang làm việc" | "Nghỉ việc";
}

interface ApiEmployee {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  department: string;
  position: string;
  isActive: boolean;
}

const API_URL = "http://localhost:3000/employees";

// Lấy dữ liệu từ Backend
const getHeaders = () => {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Chuyển dữ liệu Backend thành dữ liệu giao diện
const mapEmployee = (employee: ApiEmployee): Employee => ({
  id: employee.id,
  code: employee.code,
  name: employee.name,
  phone: employee.phone,
  email: employee.email,
  department: employee.department,
  position: employee.position,
  status: employee.isActive ? "Đang làm việc" : "Nghỉ việc",
});

// Đọc lỗi từ Backend
const getErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();

    if (Array.isArray(data.message)) {
      return data.message.join(", ");
    }

    return data.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
  } catch {
    return "Không thể kết nối đến máy chủ.";
  }
};

function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [departmentFilter, setDepartmentFilter] = useState("Tất cả");

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    phone: "",
    email: "",
    department: "Kinh doanh",
    position: "Nhân viên kinh doanh",
    status: "Đang làm việc" as Employee["status"],
  });

  // Lấy danh sách nhân viên từ SQL Server
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const data: ApiEmployee[] = await response.json();

        setEmployees(data.map(mapEmployee));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách nhân viên."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        employee.code.toLowerCase().includes(keyword) ||
        employee.name.toLowerCase().includes(keyword) ||
        employee.phone.toLowerCase().includes(keyword) ||
        employee.email.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Tất cả" ||
        employee.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "Tất cả" ||
        employee.department === departmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDepartment
      );
    });
  }, [employees, search, statusFilter, departmentFilter]);

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Đang làm việc"
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) => employee.status === "Nghỉ việc"
  ).length;

  const departmentCount = new Set(
    employees.map((employee) => employee.department)
  ).size;

  const openAddModal = () => {
    setEditingEmployee(null);

    setForm({
      code: "",
      name: "",
      phone: "",
      email: "",
      department: "Kinh doanh",
      position: "Nhân viên kinh doanh",
      status: "Đang làm việc",
    });

    setShowModal(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);

    setForm({
      code: employee.code,
      name: employee.name,
      phone: employee.phone,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      status: employee.status,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingEmployee(null);
  };

  // Thêm hoặc cập nhật nhân viên
  const handleSave = async () => {
    if (
      !form.code.trim() ||
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.email.trim()
    ) {
      alert("Vui lòng nhập đầy đủ thông tin nhân viên.");
      return;
    }

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      department: form.department,
      position: form.position,
      isActive: form.status === "Đang làm việc",
    };

    try {
      setSaving(true);
      setError("");

      const isEditing = Boolean(editingEmployee);

      const url = isEditing
        ? `${API_URL}/${editingEmployee!.id}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const savedEmployee: ApiEmployee = await response.json();
      const mappedEmployee = mapEmployee(savedEmployee);

      if (isEditing) {
        setEmployees((current) =>
          current.map((employee) =>
            employee.id === mappedEmployee.id
              ? mappedEmployee
              : employee
          )
        );

        alert("Cập nhật nhân viên thành công!");
      } else {
        setEmployees((current) => [
          mappedEmployee,
          ...current,
        ]);

        alert("Thêm nhân viên thành công!");
      }

      setShowModal(false);
      setEditingEmployee(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể lưu thông tin nhân viên.";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  // Xóa nhân viên
  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa nhân viên "${employee.name}" không?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/${employee.id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setEmployees((current) =>
        current.filter((item) => item.id !== employee.id)
      );

      alert("Xóa nhân viên thành công!");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể xóa nhân viên.";

      alert(message);
    }
  };

  return (
    <div className="employees-page">
      {/* HEADING */}
      <div className="employees-heading">
        <div>
          <div className="employees-breadcrumb">
            <span>WATER MANAGER</span>
            <span>/</span>
            <span>Quản lý</span>
            <span>/</span>
            <span>Nhân viên</span>
          </div>

          <h1>Quản lý nhân viên</h1>

          <p>
            Quản lý thông tin nhân viên, phòng ban,
            chức vụ và trạng thái làm việc.
          </p>
        </div>

        <button
          className="employees-primary-button"
          onClick={openAddModal}
        >
          <span>＋</span>
          Thêm nhân viên
        </button>
      </div>

      {/* SUMMARY */}
      <div className="employees-summary">
        <div className="employee-summary-card">
          <div className="employee-summary-icon cyan">
            ♙
          </div>

          <div>
            <span>Tổng nhân viên</span>
            <strong>{totalEmployees}</strong>
          </div>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-icon green">
            ✓
          </div>

          <div>
            <span>Đang làm việc</span>
            <strong>{activeEmployees}</strong>
          </div>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-icon orange">
            !
          </div>

          <div>
            <span>Nghỉ việc</span>
            <strong>{inactiveEmployees}</strong>
          </div>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-icon blue">
            ▣
          </div>

          <div>
            <span>Phòng ban</span>
            <strong>{departmentCount}</strong>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="employees-card">
        <div className="employees-toolbar">
          <div>
            <h2>Danh sách nhân viên</h2>

            <p>
              {filteredEmployees.length} nhân viên được hiển thị
            </p>
          </div>

          <div className="employees-filters">
            <div className="employees-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Tìm tên, mã, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="employees-filter-select"
            >
              <option>Tất cả</option>
              <option>Kinh doanh</option>
              <option>Kế toán</option>
              <option>Kho vận</option>
              <option>Nhân sự</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="employees-filter-select"
            >
              <option>Tất cả</option>
              <option>Đang làm việc</option>
              <option>Nghỉ việc</option>
            </select>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            style={{ color: "#dc2626", padding: "12px 20px" }}
          >
            {error}
          </p>
        )}

        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Mã nhân viên</th>
                <th>Nhân viên</th>
                <th>Liên hệ</th>
                <th>Phòng ban</th>
                <th>Chức vụ</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="employees-empty">
                    Đang tải danh sách nhân viên...
                  </td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <span className="employee-code">
                        {employee.code}
                      </span>
                    </td>

                    <td>
                      <div className="employee-name-cell">
                        <div className="employee-avatar">
                          {employee.name.charAt(0)}
                        </div>

                        <div>
                          <strong>{employee.name}</strong>
                          <span>Nhân viên</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="employee-contact">
                        <span>{employee.phone}</span>
                        <small>{employee.email}</small>
                      </div>
                    </td>

                    <td>
                      <span className="employee-department">
                        {employee.department}
                      </span>
                    </td>

                    <td>
                      <span className="employee-position">
                        {employee.position}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`employee-status ${
                          employee.status === "Đang làm việc"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        <span></span>
                        {employee.status}
                      </span>
                    </td>

                    <td>
                      <div className="employee-actions">
                        <button
                          className="employee-edit-button"
                          onClick={() => openEditModal(employee)}
                          title="Chỉnh sửa"
                        >
                          ✎
                        </button>

                        <button
                          className="employee-delete-button"
                          onClick={() => handleDelete(employee)}
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
                  <td colSpan={7} className="employees-empty">
                    <div>
                      <span>⌕</span>

                      <strong>
                        Không tìm thấy nhân viên
                      </strong>

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
          className="employee-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="employee-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="employee-modal-header">
              <div className="employee-modal-title">
                <div className="employee-modal-icon">
                  {editingEmployee ? "✎" : "＋"}
                </div>

                <div>
                  <h2>
                    {editingEmployee
                      ? "Chỉnh sửa nhân viên"
                      : "Thêm nhân viên mới"}
                  </h2>

                  <p>
                    {editingEmployee
                      ? "Cập nhật thông tin nhân viên"
                      : "Nhập thông tin nhân viên vào hệ thống"}
                  </p>
                </div>
              </div>

              <button
                className="employee-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="employee-form">
              <div className="employee-form-row">
                <div className="employee-form-group">
                  <label>
                    Mã nhân viên <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="VD: NV006"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value })
                    }
                  />
                </div>

                <div className="employee-form-group">
                  <label>
                    Họ và tên <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="employee-form-row">
                <div className="employee-form-group">
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

                <div className="employee-form-group">
                  <label>
                    Email <span>*</span>
                  </label>

                  <input
                    type="email"
                    placeholder="employee@watermanager.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="employee-form-row">
                <div className="employee-form-group">
                  <label>Phòng ban</label>

                  <select
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                  >
                    <option>Kinh doanh</option>
                    <option>Kế toán</option>
                    <option>Kho vận</option>
                    <option>Nhân sự</option>
                  </select>
                </div>

                <div className="employee-form-group">
                  <label>Chức vụ</label>

                  <select
                    value={form.position}
                    onChange={(e) =>
                      setForm({ ...form, position: e.target.value })
                    }
                  >
                    <option>Nhân viên kinh doanh</option>
                    <option>Kế toán viên</option>
                    <option>Nhân viên kho</option>
                    <option>Nhân viên giao hàng</option>
                    <option>Nhân viên nhân sự</option>
                  </select>
                </div>
              </div>

              <div className="employee-form-group">
                <label>Trạng thái</label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as Employee["status"],
                    })
                  }
                >
                  <option>Đang làm việc</option>
                  <option>Nghỉ việc</option>
                </select>
              </div>
            </div>

            <div className="employee-modal-footer">
              <button
                className="employee-cancel-button"
                onClick={closeModal}
                disabled={saving}
              >
                Hủy
              </button>

              <button
                className="employee-save-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Đang lưu..."
                  : editingEmployee
                    ? "Lưu thay đổi"
                    : "Thêm nhân viên"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;
