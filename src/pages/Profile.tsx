import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  // Thông báo cập nhật thông tin cá nhân
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // LẤY TOKEN
  const getHeaders = () => {
    const token = localStorage.getItem("accessToken");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // LẤY THÔNG TIN PROFILE
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể tải thông tin tài khoản.");
      }

      setProfile(data);

      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi tải tài khoản."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // HỦY CHỈNH SỬA
  const handleCancelEdit = () => {
    if (profile) {
      setForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });
    }

    setIsEditing(false);
    setError("");
    setMessage("");
  };

  // CẬP NHẬT PROFILE
  const handleSaveProfile = async () => {
    setError("");
    setMessage("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email.trim())) {
      setError("Email không hợp lệ.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Cập nhật thông tin thất bại."
        );
      }

      await fetchProfile();

      // Cập nhật tên và email được lưu trong localStorage
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...user,
              name: form.name.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
            })
          );
        } catch {
          // Không ảnh hưởng nếu dữ liệu localStorage không hợp lệ
        }
      }

      setIsEditing(false);
      setMessage("Cập nhật thông tin tài khoản thành công!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật thông tin."
      );
    } finally {
      setSaving(false);
    }
  };

  // ĐỔI MẬT KHẨU
  
const handleChangePassword = async () => {
  setPasswordError("");
  setPasswordMessage("");

  if (
    !passwordForm.currentPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword
  ) {
    setPasswordError("Vui lòng nhập đầy đủ thông tin mật khẩu.");
    return;
  }

  if (passwordForm.newPassword.length < 6) {
    setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
    return;
  }

  if (passwordForm.newPassword.length > 50) {
    setPasswordError("Mật khẩu mới không được vượt quá 50 ký tự.");
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    setPasswordError("Mật khẩu xác nhận không khớp.");
    return;
  }

  try {
    setChangingPassword(true);

    const response = await fetch(
      `${API_URL}/auth/change-password`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Đổi mật khẩu thất bại."
      );
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordMessage("Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.");
  } catch (err) {
    setPasswordError(
      err instanceof Error
        ? err.message
        : "Không thể đổi mật khẩu."
    );
  } finally {
    setChangingPassword(false);
  }
};


  // ĐỊNH DẠNG NGÀY
  const formatDate = (value?: string) => {
    if (!value) return "Chưa có thông tin";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Chưa có thông tin";
    }

    return date.toLocaleDateString("vi-VN");
  };

  // CHỮ CÁI ĐẠI DIỆN
  const avatarLetter = profile?.name?.trim().charAt(0).toUpperCase() || "Q";

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p>Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h2>Không thể tải hồ sơ</h2>
          <p>{error || "Vui lòng thử lại."}</p>

          <button
            className="profile-save-button"
            onClick={fetchProfile}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* HEADER */}
      <div className="profile-heading">
        <div>
          <div className="profile-breadcrumb">
            <span>WATER MANAGER</span>
            <span>/</span>
            <span>Hệ thống</span>
            <span>/</span>
            <span>Tài khoản</span>
          </div>

          <h1>Tài khoản của tôi</h1>

          <p>
            Quản lý thông tin cá nhân và bảo mật tài khoản.
          </p>
        </div>
      </div>

      {/* THÔNG BÁO */}
      {error && (
        <div className="profile-message profile-error">
          {error}
        </div>
      )}

      {message && (
        <div className="profile-message profile-success">
          {message}
        </div>
      )}

      {/* PROFILE OVERVIEW */}
      <div className="profile-overview">
        <div className="profile-avatar-large">
          {avatarLetter}
        </div>

        <div className="profile-overview-info">
          <h2>{profile.name}</h2>

          <p>{profile.email}</p>

          <div className="profile-overview-meta">
            <span className="profile-role">
              Quản lý
            </span>

            <span className="profile-status">
              <span></span>
              {profile.isActive ? "Đang hoạt động" : "Đã khóa"}
            </span>
          </div>
        </div>

        <div className="profile-overview-right">
          <span>Tài khoản</span>
          <strong>{profile.role || "MANAGER"}</strong>
        </div>
      </div>

      {/* INFORMATION */}
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-header">
            <div>
              <h2>Thông tin cá nhân</h2>

              <p>
                Thông tin cơ bản của tài khoản quản lý.
              </p>
            </div>

            {!isEditing && (
              <button
                className="profile-edit-button"
                onClick={() => {
                  setIsEditing(true);
                  setError("");
                  setMessage("");
                }}
              >
                <span>✎</span>
                Chỉnh sửa
              </button>
            )}
          </div>

          <div className="profile-form">
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Họ và tên</label>

                <input
                  type="text"
                  value={form.name}
                  disabled={!isEditing || saving}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="profile-form-group">
                <label>Chức vụ</label>

                <input
                  type="text"
                  value="Quản lý"
                  disabled
                />
              </div>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Email</label>

                <input
                  type="email"
                  value={form.email}
                  disabled={!isEditing || saving}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="profile-form-group">
                <label>Số điện thoại</label>

                <input
                  type="text"
                  value={form.phone}
                  disabled={!isEditing || saving}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {isEditing && (
              <div className="profile-form-actions">
                <button
                  className="profile-cancel-button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Hủy
                </button>

                <button
                  className="profile-save-button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECURITY */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div>
              <h2>Bảo mật tài khoản</h2>

              <p>
                Thay đổi mật khẩu để bảo vệ tài khoản.
              </p>
            </div>

            <div className="profile-security-icon">
              🔒
            </div>
          </div>

          <div className="profile-form">
            <div className="profile-form-group">
              <label>Mật khẩu hiện tại</label>

              <input
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                value={passwordForm.currentPassword}
                disabled={changingPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="profile-form-group">
              <label>Mật khẩu mới</label>

              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={passwordForm.newPassword}
                disabled={changingPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="profile-form-group">
              <label>Xác nhận mật khẩu mới</label>

              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={passwordForm.confirmPassword}
                disabled={changingPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>

            <button
            className="profile-password-button"
            onClick={handleChangePassword}
            disabled={changingPassword}
          >
            {changingPassword
              ? "Đang cập nhật..."
              : "Cập nhật mật khẩu"}
          </button>

          {passwordError && (
            <div className="profile-message profile-error">
              {passwordError}
            </div>
          )}

          {passwordMessage && (
            <div className="profile-message profile-success">
              {passwordMessage}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* ACCOUNT INFORMATION */}
      <div className="profile-card profile-account-card">
        <div className="profile-card-header">
          <div>
            <h2>Thông tin tài khoản</h2>

            <p>
              Thông tin hệ thống của tài khoản hiện tại.
            </p>
          </div>
        </div>

        <div className="profile-account-grid">
          <div className="profile-account-item">
            <span>Vai trò</span>
            <strong>{profile.role || "MANAGER"}</strong>
          </div>

          <div className="profile-account-item">
            <span>Trạng thái</span>

            <strong className="profile-account-active">
              <span></span>
              {profile.isActive ? "Hoạt động" : "Đã khóa"}
            </strong>
          </div>

          <div className="profile-account-item">
            <span>Ngày tạo</span>
            <strong>{formatDate(profile.createdAt)}</strong>
          </div>

          <div className="profile-account-item">
            <span>Đăng nhập gần nhất</span>
            <strong>
              Thông tin chưa được ghi nhận
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;