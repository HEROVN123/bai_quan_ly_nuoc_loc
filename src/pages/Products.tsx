import { useEffect, useMemo, useState } from "react";

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

const initialProducts: Product[] = [
  {
    id: "1",
    code: "SP001",
    name: "Nước tinh khiết 20L",
    category: "Nước tinh khiết",
    price: 45000,
    stock: 85,
    status: "Đang bán",
    logoUrl: "",
  },
  {
    id: "2",
    code: "SP002",
    name: "Nước khoáng 500ml",
    category: "Nước khoáng",
    price: 75000,
    stock: 240,
    status: "Đang bán",
    logoUrl: "",
  },
  {
    id: "3",
    code: "SP003",
    name: "Nước khoáng 1.5L",
    category: "Nước khoáng",
    price: 90000,
    stock: 68,
    status: "Đang bán",
    logoUrl: "",
  },
  {
    id: "4",
    code: "SP004",
    name: "Nước ion kiềm 500ml",
    category: "Nước ion kiềm",
    price: 120000,
    stock: 24,
    status: "Đang bán",
    logoUrl: "",
  },
  {
    id: "5",
    code: "SP005",
    name: "Nước tinh khiết 350ml",
    category: "Nước tinh khiết",
    price: 65000,
    stock: 0,
    status: "Hết hàng",
    logoUrl: "",
  },
];

function Products() {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem("water_manager_products");

    if (savedProducts) {
      try {
        return JSON.parse(savedProducts);
      } catch {
        return initialProducts;
      }
    }

    return initialProducts;
  });

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

  useEffect(() => {
    localStorage.setItem(
      "water_manager_products",
      JSON.stringify(products)
    );
  }, [products]);

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

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSave = () => {
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

    if (Number.isNaN(price) || price < 0) {
      alert("Giá sản phẩm không hợp lệ.");
      return;
    }

    if (Number.isNaN(stock) || stock < 0) {
      alert("Số lượng tồn kho không hợp lệ.");
      return;
    }

    const status: Product["status"] =
      stock > 0 ? "Đang bán" : "Hết hàng";

    if (editingProduct) {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                code: form.code.trim(),
                name: form.name.trim(),
                category: form.category,
                price,
                stock,
                status,
                logoUrl: form.logoUrl.trim(),
              }
            : product
        )
      );
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        code: form.code.trim(),
        name: form.name.trim(),
        category: form.category,
        price,
        stock,
        status,
        logoUrl: form.logoUrl.trim(),
      };

      setProducts((currentProducts) => [
        ...currentProducts,
        newProduct,
      ]);
    }

    closeModal();
  };

  const handleDelete = (product: Product) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}" không?`
    );

    if (!confirmDelete) return;

    setProducts((currentProducts) =>
      currentProducts.filter(
        (item) => item.id !== product.id
      )
    );
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
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="products-empty"
                  >
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
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="product-table-logo-placeholder">
                            💧
                          </div>
                        )}

                        <div>
                          <strong>{product.name}</strong>

                          <span>
                            Sản phẩm nước
                          </span>
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
                          onClick={() =>
                            openEditModal(product)
                          }
                          title="Chỉnh sửa"
                        >
                          ✎
                        </button>

                        <button
                          className="table-action delete"
                          onClick={() =>
                            handleDelete(product)
                          }
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
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="product-modal">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">
                  {editingProduct
                    ? "CẬP NHẬT"
                    : "SẢN PHẨM MỚI"}
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
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <span>💧</span>
                    )}
                  </div>

                  <div className="product-logo-upload-info">
                    <strong>
                      URL hình ảnh sản phẩm
                    </strong>

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
              >
                Hủy
              </button>

              <button
                className="primary-button"
                onClick={handleSave}
              >
                {editingProduct
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