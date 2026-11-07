import { useMemo, useState } from "react";

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

const initialInventory: InventoryItem[] = [
  {
    id: 1,
    code: "SP001",
    product: "Nước tinh khiết 20L",
    category: "Nước tinh khiết",
    stock: 85,
    minStock: 30,
    unit: "Bình",
    updatedAt: "02/11/2026",
  },
  {
    id: 2,
    code: "SP002",
    product: "Nước khoáng 500ml",
    category: "Nước khoáng",
    stock: 240,
    minStock: 100,
    unit: "Thùng",
    updatedAt: "02/11/2026",
  },
  {
    id: 3,
    code: "SP003",
    product: "Nước khoáng 1.5L",
    category: "Nước khoáng",
    stock: 68,
    minStock: 50,
    unit: "Thùng",
    updatedAt: "01/11/2026",
  },
  {
    id: 4,
    code: "SP004",
    product: "Nước ion kiềm 500ml",
    category: "Nước ion kiềm",
    stock: 24,
    minStock: 50,
    unit: "Thùng",
    updatedAt: "01/11/2026",
  },
  {
    id: 5,
    code: "SP005",
    product: "Nước tinh khiết 350ml",
    category: "Nước tinh khiết",
    stock: 0,
    minStock: 40,
    unit: "Thùng",
    updatedAt: "31/10/2026",
  },
  {
    id: 6,
    code: "SP006",
    product: "Nước suối 330ml",
    category: "Nước suối",
    stock: 120,
    minStock: 60,
    unit: "Thùng",
    updatedAt: "31/10/2026",
  },
];

function Inventory() {
  const [inventory, setInventory] =
    useState<InventoryItem[]>(initialInventory);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("Tất cả");

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

  const getStatus = (item: InventoryItem) => {
    if (item.stock === 0) {
      return "Hết hàng";
    }

    if (item.stock <= item.minStock) {
      return "Sắp hết";
    }

    return "Đủ hàng";
  };

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

  const openAddModal = () => {
    setEditingItem(null);

    setForm({
      code: "",
      product: "",
      category: "Nước tinh khiết",
      stock: "",
      minStock: "",
      unit: "Thùng",
      updatedAt: "02/11/2026",
    });

    setShowModal(true);
  };

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
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    if (
      !form.code.trim() ||
      !form.product.trim() ||
      !form.stock ||
      !form.minStock ||
      !form.updatedAt.trim()
    ) {
      alert("Vui lòng nhập đầy đủ thông tin kho hàng.");
      return;
    }

    const stock = Number(form.stock);
    const minStock = Number(form.minStock);

    if (stock < 0 || minStock < 0) {
      alert("Tồn kho và mức tồn tối thiểu không được âm.");
      return;
    }

    if (editingItem) {
      setInventory((current) =>
        current.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                code: form.code,
                product: form.product,
                category: form.category,
                stock,
                minStock,
                unit: form.unit,
                updatedAt: form.updatedAt,
              }
            : item
        )
      );

      alert("Cập nhật kho hàng thành công!");
    } else {
      const newItem: InventoryItem = {
        id: Date.now(),
        code: form.code,
        product: form.product,
        category: form.category,
        stock,
        minStock,
        unit: form.unit,
        updatedAt: form.updatedAt,
      };

      setInventory((current) => [
        ...current,
        newItem,
      ]);

      alert("Thêm sản phẩm vào kho thành công!");
    }

    closeModal();
  };

  const handleDelete = (item: InventoryItem) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa "${item.product}" khỏi danh sách kho không?`
    );

    if (!confirmed) return;

    setInventory((current) =>
      current.filter(
        (inventoryItem) =>
          inventoryItem.id !== item.id
      )
    );
  };

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
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <select
              className="inventory-filter-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
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
              {filteredInventory.length > 0 ? (
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
                            <strong>
                              {item.product}
                            </strong>

                            <span>
                              Đơn vị: {item.unit}
                            </span>
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
                              {item.stock.toLocaleString(
                                "vi-VN"
                              )}
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
                                width: `${getStockPercent(
                                  item
                                )}%`,
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
                            onClick={() =>
                              openEditModal(item)
                            }
                            title="Chỉnh sửa"
                          >
                            ✎
                          </button>

                          <button
                            className="inventory-delete-button"
                            onClick={() =>
                              handleDelete(item)
                            }
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
                  <td
                    colSpan={8}
                    className="inventory-empty"
                  >
                    <div>
                      <span>⌕</span>

                      <strong>
                        Không tìm thấy sản phẩm
                      </strong>

                      <p>
                        Hãy thử thay đổi từ khóa hoặc
                        bộ lọc.
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
            onClick={(e) =>
              e.stopPropagation()
            }
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
                    placeholder="VD: 02/11/2026"
                    value={form.updatedAt}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        updatedAt:
                          e.target.value,
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
                        category:
                          e.target.value,
                      })
                    }
                  >
                    <option>
                      Nước tinh khiết
                    </option>
                    <option>Nước khoáng</option>
                    <option>Nước ion kiềm</option>
                    <option>Nước suối</option>
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
              >
                Hủy
              </button>

              <button
                className="inventory-save-button"
                onClick={handleSave}
              >
                {editingItem
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