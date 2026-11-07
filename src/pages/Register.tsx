import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRules = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passwordScore =
    Object.values(passwordRules).filter(Boolean).length;

  const getPasswordStrength = () => {
    if (!password) {
      return {
        text: "",
        className: "",
      };
    }

    if (passwordScore <= 2) {
      return {
        text: "Yếu",
        className: "password-strength weak",
      };
    }

    if (passwordScore <= 4) {
      return {
        text: "Trung bình",
        className: "password-strength medium",
      };
    }

    return {
      text: "Mạnh",
      className: "password-strength strong",
    };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Họ và tên không được để trống.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Họ và tên phải có ít nhất 2 ký tự.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@(gmail\.com|edu\.vn|outlook\.com|hotmail\.com|yahoo\.com)$/i;

    if (!emailRegex.test(trimmedEmail)) {
      setError(
        "Email phải có dạng hợp lệ, ví dụ: ten@gmail.com hoặc ten@edu.vn."
      );
      return;
    }

    if (!passwordRules.minLength) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (!passwordRules.uppercase) {
      setError("Mật khẩu phải có ít nhất 1 chữ cái viết hoa.");
      return;
    }

    if (!passwordRules.lowercase) {
      setError("Mật khẩu phải có ít nhất 1 chữ cái viết thường.");
      return;
    }

    if (!passwordRules.number) {
      setError("Mật khẩu phải có ít nhất 1 chữ số.");
      return;
    }

    if (!passwordRules.special) {
      setError("Mật khẩu phải có ít nhất 1 ký tự đặc biệt.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      // Tạm thời giả lập đăng ký.
      // Sau này sẽ thay bằng API NestJS.
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Đăng ký tài khoản quản lý:", {
        name: trimmedName,
        email: trimmedEmail,
        role: "MANAGER",
      });

      setSuccess(
        "Đăng ký tài khoản quản lý thành công! Đang chuyển sang trang đăng nhập..."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch {
      setError("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <div className="login-logo">💧</div>

          <h1>Đăng ký</h1>

          <p>
            Tạo tài khoản quản lý Water Manager
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên</label>

            <input
              type="text"
              placeholder="Nhập họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Ví dụ: ten@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <small className="form-hint">
              Hỗ trợ Gmail, Outlook, Yahoo và email .edu.vn
            </small>
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mạnh"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {password && (
              <div className="password-strength-box">
                <div className="password-strength-header">
                  <span>Độ mạnh mật khẩu</span>

                  <strong
                    className={passwordStrength.className}
                  >
                    {passwordStrength.text}
                  </strong>
                </div>

                <div className="password-strength-bar">
                  <div
                    className={`password-strength-progress ${passwordStrength.className}`}
                    style={{
                      width: `${(passwordScore / 5) * 100}%`,
                    }}
                  />
                </div>

                <div className="password-rules">
                  <div
                    className={
                      passwordRules.minLength
                        ? "rule valid"
                        : "rule"
                    }
                  >
                    {passwordRules.minLength ? "✓" : "○"} Ít nhất 8 ký tự
                  </div>

                  <div
                    className={
                      passwordRules.uppercase
                        ? "rule valid"
                        : "rule"
                    }
                  >
                    {passwordRules.uppercase ? "✓" : "○"} Có chữ hoa
                  </div>

                  <div
                    className={
                      passwordRules.lowercase
                        ? "rule valid"
                        : "rule"
                    }
                  >
                    {passwordRules.lowercase ? "✓" : "○"} Có chữ thường
                  </div>

                  <div
                    className={
                      passwordRules.number
                        ? "rule valid"
                        : "rule"
                    }
                  >
                    {passwordRules.number ? "✓" : "○"} Có chữ số
                  </div>

                  <div
                    className={
                      passwordRules.special
                        ? "rule valid"
                        : "rule"
                    }
                  >
                    {passwordRules.special ? "✓" : "○"} Có ký tự đặc biệt
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>

            <div className="password-input-wrapper">
              <input
                type={
                  showConfirmPassword ? "text" : "password"
                }
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {success && (
            <div className="register-success">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Đã có tài khoản?{" "}
            <Link to="/login">Đăng nhập</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;
