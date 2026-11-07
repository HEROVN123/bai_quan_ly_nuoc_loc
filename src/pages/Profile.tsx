import { useState } from "react";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    name: "Nguyễn Văn Quản Lý",
    email: "manager@watermanager.com",
    phone: "0901234567",
    position: "Quản lý",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setIsEditing(false);
    alert("Cập nhật thông tin tài khoản thành công!");
  };

  const handleChangePassword = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      alert("Vui lòng nhập đầy đủ thông tin mật khẩu.");
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      alert("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    alert("Đổi mật khẩu thành công!");
  };

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

      {/* PROFILE OVERVIEW */}
      <div className="profile-overview">
        <div className="profile-avatar-large">
          Q
        </div>

        <div className="profile-overview-info">
          <h2>{form.name}</h2>

          <p>{form.email}</p>

          <div className="profile-overview-meta">
            <span className="profile-role">
              Quản lý
            </span>

            <span className="profile-status">
              <span></span>
              Đang hoạt động
            </span>
          </div>
        </div>

        <div className="profile-overview-right">
          <span>Tài khoản</span>
          <strong>MANAGER</strong>
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
                onClick={() => setIsEditing(true)}
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
                  disabled={!isEditing}
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
                  value={form.position}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  onClick={() => setIsEditing(false)}
                >
                  Hủy
                </button>

                <button
                  className="profile-save-button"
                  onClick={handleSaveProfile}
                >
                  Lưu thay đổi
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
                value={
                  passwordForm.currentPassword
                }
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword:
                      e.target.value,
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
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword:
                      e.target.value,
                  })
                }
              />
            </div>

            <div className="profile-form-group">
              <label>Xác nhận mật khẩu mới</label>

              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={
                  passwordForm.confirmPassword
                }
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword:
                      e.target.value,
                  })
                }
              />
            </div>

            <button
              className="profile-password-button"
              onClick={handleChangePassword}
            >
              Cập nhật mật khẩu
            </button>
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
            <strong>MANAGER</strong>
          </div>

          <div className="profile-account-item">
            <span>Trạng thái</span>

            <strong className="profile-account-active">
              <span></span>
              Hoạt động
            </strong>
          </div>

          <div className="profile-account-item">
            <span>Ngày tạo</span>
            <strong>01/11/2026</strong>
          </div>

          <div className="profile-account-item">
            <span>Đăng nhập gần nhất</span>
            <strong>02/11/2026</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;