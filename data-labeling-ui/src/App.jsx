import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function App() {
  const [adminUser, setAdminUser] = useState(null);
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("adminToken"),
  );

  useEffect(() => {
    if (authToken) {
      localStorage.setItem("adminToken", authToken);
    } else {
      localStorage.removeItem("adminToken");
    }
  }, [authToken]);

  function handleLoginSuccess(data) {
    setAuthToken(data.token);
    setAdminUser(data.user || { name: "Admin" });
  }

  function handleLogout() {
    setAuthToken(null);
    setAdminUser(null);
  }

  if (!authToken) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  return (
    <main className="admin-dashboard">
      <section className="dashboard-card">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-role">Admin Dashboard</p>
            <h1>Xin chào, {adminUser?.name || "Admin"}</h1>
          </div>
          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </header>

        <div className="dashboard-summary">
          <div className="summary-card">
            <h2>Quản lý dự án</h2>
            <p>Tạo, sửa, phân công và theo dõi tiến độ gán nhãn.</p>
          </div>
          <div className="summary-card">
            <h2>Quản lý người dùng</h2>
            <p>
              Thêm hoặc điều chỉnh quyền cho Annotator, Reviewer và Manager.
            </p>
          </div>
          <div className="summary-card">
            <h2>Xuất dữ liệu</h2>
            <p>Chuẩn hoá dữ liệu gán nhãn ra định dạng phù hợp cho mô hình.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
