
import { useCallback, useEffect, useMemo, useState } from "react";

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

const API_URL = "http://localhost:3000/inventory";

const getHeaders = () => {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getToday = () => {
  return new Date().toLocaleDateString("vi-VN");
};

const getErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();

    if (Array.isArray(data.message)) {
      return data.message.join(", ");
    }

    return data.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
  } catch {
    return "Đã xảy ra lỗi. Vui lòng thử lại.";
  }
};

function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] =
    useState<InventoryItem | null>(null);

  const [form, setForm] = useState({
    code: "",
    product: "",
    category: "Nước tinh khiết",
    stock: "",
    minStock: "",
    unit: "Thùng",
    updatedAt: "",
  });

  // Lấy dữ liệu kho hàng từ Backend
  const fetchInventory = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      const normalizedData: InventoryItem[] = data.map(
        (item: any) => ({
          id: Number(item.id),
          code: item.code,
          product: item.product,
          category: item.category,
          stock: Number(item.stock),
          minStock: Number(item.minStock),
          unit: item.unit,
          updatedAt: item.updatedAt || "",
        })
      );

      setInventory(normalizedData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu kho hàng."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Xác định trạng thái tồn kho
  const getStatus = (item: InventoryItem) => {
    if (item.stock === 0) {
      return "Hết hàng";
    }

    if (item.stock <= item.minStock) {
      return "Sắp hết";
    }

    return "Đủ hàng";
  };

  // Tìm kiếm và lọc
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        item.code.toLowerCase().includes(keyword) ||
        item.product.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Tất cả" ||
        getStatus(item) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, statusFilter]);

  // Thống kê kho hàng
  const totalStock = inventory.reduce(
    (total, item) => total + item.stock,
    0
  );

  const availableProducts = inventory.filter(
    (item) => item.stock > 0
  ).length;

  const lowStockProducts = inventory.filter(
    (item) =>
      item.stock > 0 && item.stock <= item.minStock
  ).length;

  const outOfStockProducts = inventory.filter(
    (item) => item.stock === 0
  ).length;

  // Mở modal thêm mới
  const openAddModal = () => {
    setEditingItem(null);

    setForm({
      code: "",
      product: "",
      category: "Nước tinh khiết",
      stock: "",
      minStock: "",
      unit: "Thùng",
      updatedAt: getToday(),
    });

    setShowModal(true);
  };

  // Mở modal chỉnh sửa
  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);

    setForm({
      code: item.code,
      product: item.product,
      category: item.category,
      stock: String(item.stock),
      minStock: String(item.minStock),
      unit: item.unit,
      updatedAt: item.updatedAt,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingItem(null);
  };

  // Thêm hoặc cập nhật kho hàng
  const handleSave = async () => {
    if (
      !form.code.trim() ||
      !form.product.trim() ||
      form.stock === "" ||
      form.minStock === "" ||
      !form.updatedAt.trim()
    ) {
      alert("Vui lòng nhập đầy đủ thông tin kho hàng.");
      return;
    }

    const stock = Number(form.stock);
    const minStock = Number(form.minStock);

    if (
      !Number.isInteger(stock) ||
      !Number.isInteger(minStock) ||
      stock < 0 ||
      minStock < 0
    ) {
      alert(
        "Tồn kho và mức tồn tối thiểu phải là số nguyên không âm."
      );
      return;
    }

    const inventoryData = {
      code: form.code.trim(),
      product: form.product.trim(),
      category: form.category,
      stock,
      minStock,
      unit: form.unit,
      updatedAt: form.updatedAt.trim(),
    };

    try {
      setSaving(true);

      const url = editingItem
        ? `${API_URL}/${editingItem.id}`
        : API_URL;

      const response = await fetch(url, {
        method: editingItem ? "PATCH" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(inventoryData),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      alert(
        editingItem
          ? "Cập nhật kho hàng thành công!"
          : "Thêm sản phẩm vào kho thành công!"
      );

      setShowModal(false);
      setEditingItem(null);

      await fetchInventory();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Không thể lưu dữ liệu kho hàng."
      );
    } finally {
      setSaving(false);
    }
  };

  // Xóa sản phẩm khỏi kho
  const handleDelete = async (item: InventoryItem) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa "${item.product}" khỏi danh sách kho không?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${item.id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setInventory((current) =>
        current.filter(
          (inventoryItem) => inventoryItem.id !== item.id
        )
      );

      alert("Xóa sản phẩm khỏi kho thành công!");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Không thể xóa sản phẩm khỏi kho."
      );
    }
  };

  // Tính phần trăm thanh tồn kho
  const getStockPercent = (item: InventoryItem) => {
    if (item.minStock === 0) {
      return item.stock > 0 ? 100 : 0;
    }

    const percent =
      (item.stock / (item.minStock * 3)) * 100;

    return Math.min(Math.max(percent, 4), 100);
  };

  return (
    <div className="inventory-page">
      {/* HEADER */}
      <div className="inventory-heading">
        <div>
          <div className="inventory-breadcrumb">
            <span>WATER MANAGER</span>
            <span>/</span>
            <span>Quản lý</span>
            <span>/</span>
            <span>Kho hàng</span>
          </div>

          <h1>Quản lý kho hàng</h1>

          <p>
            Theo dõi số lượng tồn kho và tình trạng sản
            phẩm trong kho.
          </p>
        </div>

        <button
          className="inventory-primary-button"
          onClick={openAddModal}
        >
          <span>＋</span>
          Nhập kho
        </button>
      </div>

      {/* THÔNG BÁO LỖI */}
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
            onClick={fetchInventory}
            style={{
              marginLeft: "12px",
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="inventory-summary">
        <div className="inventory-summary-card">
          <div className="inventory-summary-icon cyan">
            ▤
          </div>

          <div>
            <span>Tổng tồn kho</span>
            <strong>
              {totalStock.toLocaleString("vi-VN")}
            </strong>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-icon green">
            ✓
          </div>

          <div>
            <span>Sản phẩm đang có</span>
            <strong>{availableProducts}</strong>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-icon orange">
            ⚠
          </div>

          <div>
            <span>Sắp hết hàng</span>
            <strong>{lowStockProducts}</strong>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-icon red">
            ×
          </div>

          <div>
            <span>Hết hàng</span>
            <strong>{outOfStockProducts}</strong>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="inventory-main-card">
        <div className="inventory-main-toolbar">
          <div>
            <h2>Tình trạng kho</h2>

            <p>
              {filteredInventory.length} sản phẩm được
              hiển thị
            </p>
          </div>

          <div className="inventory-filters">
            <div className="inventory-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Tìm sản phẩm, mã..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="inventory-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Tất cả</option>
              <option>Đủ hàng</option>
              <option>Sắp hết</option>
              <option>Hết hàng</option>
            </select>
          </div>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Mã SP</th>
                <th>Sản phẩm</th>
                <th>Loại</th>
                <th>Tồn kho</th>
                <th>Mức tối thiểu</th>
                <th>Cập nhật</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="inventory-empty">
                    Đang tải dữ liệu kho hàng...
                  </td>
                </tr>
              ) : filteredInventory.length > 0 ? (
                filteredInventory.map((item) => {
                  const status = getStatus(item);

                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="inventory-code">
                          {item.code}
                        </span>
                      </td>

                      <td>
                        <div className="inventory-product-cell">
                          <div className="inventory-product-icon">
                            💧
                          </div>

                          <div>
                            <strong>{item.product}</strong>
                            <span>Đơn vị: {item.unit}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="inventory-category">
                          {item.category}
                        </span>
                      </td>

                      <td>
                        <div className="inventory-stock-cell">
                          <div className="inventory-stock-number">
                            <strong>
                              {item.stock.toLocaleString("vi-VN")}
                            </strong>

                            <span>{item.unit}</span>
                          </div>

                          <div className="inventory-progress">
                            <div
                              className={`inventory-progress-bar ${
                                status === "Hết hàng"
                                  ? "empty"
                                  : status === "Sắp hết"
                                  ? "low"
                                  : "good"
                              }`}
                              style={{
                                width: `${getStockPercent(item)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="inventory-min-stock">
                          {item.minStock} {item.unit}
                        </span>
                      </td>

                      <td>
                        <span className="inventory-date">
                          {item.updatedAt}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`inventory-status ${
                            status === "Đủ hàng"
                              ? "good"
                              : status === "Sắp hết"
                              ? "low"
                              : "empty"
                          }`}
                        >
                          <span></span>
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="inventory-actions">
                          <button
                            className="inventory-edit-button"
                            onClick={() => openEditModal(item)}
                            title="Chỉnh sửa"
                          >
                            ✎
                          </button>

                          <button
                            className="inventory-delete-button"
                            onClick={() => handleDelete(item)}
                            title="Xóa"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="inventory-empty">
                    <div>
                      <span>⌕</span>

                      <strong>
                        Không tìm thấy sản phẩm
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
          className="inventory-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="inventory-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inventory-modal-header">
              <div className="inventory-modal-title">
                <div className="inventory-modal-icon">
                  {editingItem ? "✎" : "＋"}
                </div>

                <div>
                  <h2>
                    {editingItem
                      ? "Chỉnh sửa kho hàng"
                      : "Nhập sản phẩm vào kho"}
                  </h2>

                  <p>
                    {editingItem
                      ? "Cập nhật thông tin tồn kho"
                      : "Thêm sản phẩm và số lượng vào kho"}
                  </p>
                </div>
              </div>

              <button
                className="inventory-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="inventory-form">
              <div className="inventory-form-row">
                <div className="inventory-form-group">
                  <label>
                    Mã sản phẩm <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="VD: SP007"
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        code: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="inventory-form-group">
                  <label>
                    Ngày cập nhật <span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="VD: 07/11/2026"
                    value={form.updatedAt}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        updatedAt: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="inventory-form-group full">
                <label>
                  Tên sản phẩm <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="Tên sản phẩm"
                  value={form.product}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      product: e.target.value,
                    })
                  }
                />
              </div>

              <div className="inventory-form-row">
                <div className="inventory-form-group">
                  <label>Loại sản phẩm</label>

                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                  >
                    <option>Nước tinh khiết</option>
                    <option>Nước khoáng</option>
                    <option>Nước ion kiềm</option>
                    <option>Nước suối</option>
                    <option>Nước chai</option>
                    <option>Nước bình</option>
                  </select>
                </div>

                <div className="inventory-form-group">
                  <label>Đơn vị</label>

                  <select
                    value={form.unit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        unit: e.target.value,
                      })
                    }
                  >
                    <option>Thùng</option>
                    <option>Bình</option>
                    <option>Chai</option>
                    <option>Cái</option>
                  </select>
                </div>
              </div>

              <div className="inventory-form-row">
                <div className="inventory-form-group">
                  <label>
                    Số lượng tồn kho <span>*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stock: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="inventory-form-group">
                  <label>
                    Mức tồn tối thiểu <span>*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.minStock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        minStock: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="inventory-modal-footer">
              <button
                className="inventory-cancel-button"
                onClick={closeModal}
                disabled={saving}
              >
                Hủy
              </button>

              <button
                className="inventory-save-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Đang lưu..."
                  : editingItem
                  ? "Lưu thay đổi"
                  : "Nhập vào kho"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
