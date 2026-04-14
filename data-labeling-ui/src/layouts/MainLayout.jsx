// src/layouts/MainLayout.jsx
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState ,} from "react";
import "./MainLayout.css"; // File CSS của layout này

// Hàm giải mã JWT Token đơn giản để lấy thông tin (Role, Username)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState({ username: "User", role: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const decoded = parseJwt(token);
    if (decoded) {
      const userRole = decoded.scope || decoded.role || "";
      setUserInfo({ username: decoded.sub || "User", role: userRole });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Định nghĩa menu dựa trên role
  const MENU_ITEMS = [
    { path: "/dashboard", label: "Dashboard", icon: "📊", roles: ["ADMIN", "MANAGER", "ANNOTATOR", "REVIEWER"] },
    { path: "/users", label: "Quản lý User", icon: "👥", roles: ["ADMIN"] },
    { path: "/projects", label: "Quản lý Dự án", icon: "📁", roles: ["ADMIN", "MANAGER"] },
    { path: "/tasks", label: "Việc gán nhãn", icon: "✏️", roles: ["ANNOTATOR", "REVIEWER"] },
    { path: "/export", label: "Xuất dữ liệu", icon: "📥", roles: ["ADMIN", "MANAGER"] }
  ];

  // Lọc các menu mà người dùng hiện tại có quyền xem
  const allowedMenus = MENU_ITEMS.filter(menu =>
    menu.roles.some(r => userInfo.role.includes(r)) || userInfo.role === ""
  );

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>LabelMaster</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {allowedMenus.map((menu, index) => (
              <li key={index} className={location.pathname.includes(menu.path) ? "active" : ""}>
                <Link to={menu.path}>
                  <span className="menu-icon">{menu.icon}</span>
                  {menu.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <span className="header-role-badge">Vai trò: {userInfo.role.replace("ROLE_", "") || "Đang tải..."}</span>
          </div>
          <div className="header-right">
            <div className="avatar">{userInfo.username.substring(0, 2).toUpperCase()}</div>
            <button className="btn-logout" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </header>

        <main className="body-content">
          <Outlet /> {/* Các trang con sẽ hiển thị tại đây */}
        </main>

        <footer className="footer">
          <p>© 2026 Data Labeling System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default MainLayout;