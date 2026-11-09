
import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:3000";

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Đang bán" | "Hết hàng";
  logoUrl?: string;
}

interface ProductApi {
  id: number;
  code?: string | null;
  name: string;
  category: string | null;
  price: number;
  quantity: number;
  image: string | null;
  isActive: boolean;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "Nước tinh khiết",
    price: "",
    stock: "",
    logoUrl: "",
  });

  // Lấy token đăng nhập
  const getHeaders = () => {
    const token = localStorage.getItem("accessToken");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Chuyển dữ liệu từ Backend sang giao diện
  const mapProduct = (item: ProductApi): Product => ({
    id: String(item.id),
    code: item.code || `SP${String(item.id).padStart(3, "0")}`,
    name: item.name,
    category: item.category || "Chưa phân loại",
    price: Number(item.price),
    stock: Number(item.quantity),
    status: Number(item.quantity) > 0 ? "Đang bán" : "Hết hàng",
    logoUrl: item.image || "",
  });

  // Lấy danh sách sản phẩm từ SQL Server thông qua API
  const loadProducts = async () => {
    try {
      setLoading(true);
      setApiError("");

      const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Không thể tải danh sách sản phẩm."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu sản phẩm từ Backend không hợp lệ.");
      }

      setProducts(data.map((item: ProductApi) => mapProduct(item)));
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Không thể kết nối với Backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Tìm kiếm và lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const keyword = search.toLowerCase().trim();

      const matchesSearch =
        product.name.toLowerCase().includes(keyword) ||
        product.code.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Tất cả" ||
        product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  // Thống kê
  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.status === "Đang bán"
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.status === "Hết hàng"
  ).length;

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  // Mở form thêm sản phẩm
  const openAddModal = () => {
    setEditingProduct(null);

    setForm({
      code: "",
      name: "",
      category: "Nước tinh khiết",
      price: "",
      stock: "",
      logoUrl: "",
    });

    setShowModal(true);
  };

  // Mở form chỉnh sửa
  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    setForm({
      code: product.code,
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      logoUrl: product.logoUrl || "",
    });

    setShowModal(true);
  };

  // Đóng form
  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  // Thêm hoặc cập nhật sản phẩm qua API
  const handleSave = async () => {
    if (
      !form.code.trim() ||
      !form.name.trim() ||
      form.price === "" ||
      form.stock === ""
    ) {
      alert("Vui lòng nhập đầy đủ thông tin sản phẩm.");
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!Number.isFinite(price) || price < 0) {
      alert("Giá sản phẩm không hợp lệ.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      alert("Số lượng tồn kho phải là số nguyên không âm.");
      return;
    }

    const productData = {
      code: form.code.trim(),
      name: form.name.trim(),
      category: form.category,
      price,
      quantity: stock,
      image: form.logoUrl.trim() || null,
    };

    try {
      setSaving(true);

      const isEditing = Boolean(editingProduct);

      const url = isEditing
        ? `${API_URL}/products/${editingProduct!.id}`
        : `${API_URL}/products`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Không thể lưu sản phẩm."
        );
      }

      await loadProducts();

      closeModal();

      alert(
        isEditing
          ? "Cập nhật sản phẩm thành công!"
          : "Thêm sản phẩm thành công!"
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi lưu sản phẩm."
      );
    } finally {
      setSaving(false);
    }
  };

  // Xóa sản phẩm qua API
  const handleDelete = async (product: Product) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}" không?`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/products/${product.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Không thể xóa sản phẩm."
        );
      }

      await loadProducts();

      alert("Xóa sản phẩm thành công!");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi xóa sản phẩm."
      );
    }
  };

  return (
    <div className="page-container products-page">
      {/* HEADER */}
      <div className="customers-heading">
        <div>
          <div className="customers-breadcrumb">
            <span>WATER MANAGER</span>
            <span>/</span>
            <span>Quản lý</span>
            <span>/</span>
            <span>Sản phẩm</span>
          </div>

          <h1>Quản lý sản phẩm</h1>

          <p>
            Quản lý danh sách sản phẩm nước và tình trạng tồn kho.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          <span>＋</span>
          Thêm sản phẩm
        </button>
      </div>

      {/* THÔNG BÁO LỖI */}
      {apiError && (
        <div className="login-error">
          {apiError}
          <button
            onClick={loadProducts}
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
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-card-icon blue">◈</div>
          <div>
            <span>Tổng sản phẩm</span>
            <strong>{totalProducts}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon green">✓</div>
          <div>
            <span>Đang bán</span>
            <strong>{activeProducts}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon red">!</div>
          <div>
            <span>Hết hàng</span>
            <strong>{outOfStockProducts}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon cyan">▤</div>
          <div>
            <span>Tồn kho</span>
            <strong>{totalStock}</strong>
          </div>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="products-main-card">
        <div className="products-toolbar">
          <div>
            <h2>Danh sách sản phẩm</h2>
            <p>
              Hiển thị {filteredProducts.length} /{" "}
              {products.length} sản phẩm
            </p>
          </div>

          <div className="products-filters">
            <div className="products-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="products-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Tất cả</option>
              <option>Đang bán</option>
              <option>Hết hàng</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>SẢN PHẨM</th>
                <th>MÃ SP</th>
                <th>DANH MỤC</th>
                <th>GIÁ</th>
                <th>TỒN KHO</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="products-empty">
                    Đang tải dữ liệu sản phẩm...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="products-empty">
                    Không tìm thấy sản phẩm phù hợp.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-name-cell">
                        {product.logoUrl ? (
                          <img
                            src={product.logoUrl}
                            alt={product.name}
                            className="product-table-logo"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="product-table-logo-placeholder">
                            💧
                          </div>
                        )}

                        <div>
                          <strong>{product.name}</strong>
                          <span>Sản phẩm nước</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="product-code">
                        {product.code}
                      </span>
                    </td>

                    <td>{product.category}</td>

                    <td>
                      <strong className="product-price">
                        {formatPrice(product.price)}
                      </strong>
                    </td>

                    <td>
                      <span className="product-stock">
                        {product.stock}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          product.status === "Đang bán"
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                      >
                        <span></span>
                        {product.status}
                      </span>
                    </td>

                    <td>
                      <div className="product-actions">
                        <button
                          className="table-action edit"
                          onClick={() => openEditModal(product)}
                          title="Chỉnh sửa"
                        >
                          ✎
                        </button>

                        <button
                          className="table-action delete"
                          onClick={() => handleDelete(product)}
                          title="Xóa"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              closeModal();
            }
          }}
        >
          <div className="product-modal">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">
                  {editingProduct ? "CẬP NHẬT" : "SẢN PHẨM MỚI"}
                </span>

                <h2>
                  {editingProduct
                    ? "Chỉnh sửa sản phẩm"
                    : "Thêm sản phẩm"}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* LOGO URL */}
              <div className="product-logo-form-section">
                <label>Logo hãng nước</label>

                <div className="product-logo-upload">
                  <div className="product-logo-preview">
                    {form.logoUrl.trim() ? (
                      <img
                        src={form.logoUrl}
                        alt="Logo xem trước"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span>💧</span>
                    )}
                  </div>

                  <div className="product-logo-upload-info">
                    <strong>URL hình ảnh sản phẩm</strong>
                    <span>
                      Dán đường dẫn ảnh logo vào ô bên dưới.
                    </span>
                  </div>
                </div>

                <input
                  type="url"
                  className="product-logo-url-input"
                  value={form.logoUrl}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      logoUrl: e.target.value,
                    })
                  }
                  placeholder="https://example.com/logo.png"
                />

                <small className="product-logo-url-help">
                  Ví dụ: https://example.com/logo.png
                </small>
              </div>

              {/* FORM GRID */}
              <div className="product-form-grid">
                <div className="form-group">
                  <label>Mã sản phẩm</label>

                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        code: e.target.value,
                      })
                    }
                    placeholder="VD: SP007"
                  />
                </div>

                <div className="form-group">
                  <label>Tên sản phẩm</label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="VD: Nước khoáng 500ml"
                  />
                </div>

                <div className="form-group">
                  <label>Danh mục</label>

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
                    <option>Nước đóng chai</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Giá bán</label>

                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: e.target.value,
                      })
                    }
                    placeholder="45000"
                  />
                </div>

                <div className="form-group">
                  <label>Số lượng tồn kho</label>

                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stock: e.target.value,
                      })
                    }
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={closeModal}
                disabled={saving}
              >
                Hủy
              </button>

              <button
                className="primary-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Đang lưu..."
                  : editingProduct
                    ? "Lưu thay đổi"
                    : "Thêm sản phẩm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
