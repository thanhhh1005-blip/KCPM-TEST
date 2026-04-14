import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/token`;

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // 2. KHỞI TẠO BIẾN ĐIỀU HƯỚNG

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.result?.token) {
        setError(
          payload?.message || "Tên đăng nhập hoặc mật khẩu không chính xác."
        );
        return;
      }

      // 3. ĐÂY LÀ ĐIỂM QUAN TRỌNG: Lưu token và chuyển trang thẳng vào Admin
      localStorage.setItem("token", payload.result.token);
      navigate("/admin/users"); 
      
    } catch (err) {
      console.error("Lỗi chi tiết:", err); // In ra log thật để dễ debug
      setError("Không thể kết nối đến máy chủ hoặc có lỗi xử lý.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-box">
        
        {/* Phần Logo & Tiêu đề */}
        <div className="login-header">
          <div className="logo-icon">g
            {/* Vẽ một icon đơn giản bằng CSS/SVG đại diện cho Data Labeling */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h1>Hệ Thống Gán Nhãn</h1>
          <p>Đăng nhập để vào không gian làm việc</p>
        </div>

        {/* Phần Form nhập liệu */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tài khoản của bạn"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Hiển thị lỗi nếu có */}
          {error && (
            <div className="form-error">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Nút Submit */}
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? <span className="loader"></span> : "Đăng Nhập"}
          </button>
        </form>

        {/* Footer của form */}
        <div className="login-footer">
          Đang kết nối tới: <span>{API_BASE_URL}</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;