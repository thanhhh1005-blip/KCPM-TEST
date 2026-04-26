import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./LoginPage.css"; // Tận dụng luôn CSS của trang Login cho đồng bộ

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Bám sát DTO UserCreationRequest của Backend
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "", // Frontend cần thêm trường này để kiểm tra
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Kiểm tra Validate ở Frontend trước khi gọi API
    if (formData.username.length < 3) {
      setError("Tên đăng nhập phải có ít nhất 3 ký tự.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    // Tính tuổi (Backend yêu cầu >= 18)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setError("Bạn phải từ 18 tuổi trở lên để tham gia hệ thống.");
      return;
    }

    // 2. Chuẩn bị Payload (Loại bỏ confirmPassword vì Backend không cần)
    const { confirmPassword, ...payload } = formData;

    setIsLoading(true);
    try {
      // Gọi API tạo User (Không truyền Roles -> Backend tự gán ANNOTATOR)
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.code === 1000) {
        toast.success("🎉 Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login"); // Đẩy về trang đăng nhập
      } else {
        // Bắt lỗi từ Backend (Ví dụ: Trùng username)
        setError(data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch (err) {
      console.error("Lỗi:", err);
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box" style={{ maxWidth: "500px" }}> {/* Nới rộng Form ra một chút */}
        
        <div className="login-header" style={{ marginBottom: "20px" }}>
          <h1>Tham Gia Hệ Thống</h1>
          <p>Tạo tài khoản Annotator mới</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="lastName">Họ</label>
              <input id="lastName" type="text" value={formData.lastName} onChange={handleInputChange} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="firstName">Tên</label>
              <input id="firstName" type="text" value={formData.firstName} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập (Username)</label>
            <input id="username" type="text" value={formData.username} onChange={handleInputChange} required placeholder="Ví dụ: nguyen_van_a" />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="email@example.com" />
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Ngày sinh (Yêu cầu từ 18 tuổi trở lên)</label>
            <input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} required />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="password">Mật khẩu</label>
              <input id="password" type="password" value={formData.password} onChange={handleInputChange} required placeholder="••••••••" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="confirmPassword">Nhập lại Mật khẩu</label>
              <input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required placeholder="••••••••" />
            </div>
          </div>

          {error && (
            <div className="form-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? <span className="loader"></span> : "Đăng Ký Tài Khoản"}
          </button>
        </form>

        <div className="auth-switch">
          <span>Đã có tài khoản?</span>
          <button type="button" className="btn-link" onClick={() => navigate("/login")}>
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;