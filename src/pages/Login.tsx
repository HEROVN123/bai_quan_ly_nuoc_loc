
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface LoginResponse {
  message: string;
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
  };
}

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : Array.isArray(data.message)
              ? data.message.join(", ")
              : "Email hoặc mật khẩu không chính xác."
        );
      }

      const result = data as LoginResponse;

      // Lưu JWT Token
      localStorage.setItem(
        "accessToken",
        result.accessToken
      );

      // Lưu thông tin tài khoản
      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      // Chuyển đến Dashboard
      navigate("/dashboard");

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <div className="login-logo">💧</div>

          <h1>Đăng nhập</h1>

          <p>
            Đăng nhập tài khoản quản lý Water Manager
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>

            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="login-forgot">
            <Link to="/forgot-password">
              Quên mật khẩu?
            </Link>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Chưa có tài khoản?{" "}
            <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;
