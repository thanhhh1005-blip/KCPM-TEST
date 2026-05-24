import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./MainLayout.css"; 

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
      let rawRole = decoded.scope || decoded.role || decoded.roles || decoded.authorities || "";
      let userRoleString = Array.isArray(rawRole) ? rawRole.join(" ") : String(rawRole);
      
      // Chỉ lấy các role (ROLE_XXX), bỏ permissions
      let roleNames = userRoleString.split(" ")
        .filter(s => s.startsWith("ROLE_"))
        .map(s => s.replace("ROLE_", ""))
        .join(", ");
      
      setUserInfo({ 
        username: decoded.sub || "User", 
        role: roleNames.toUpperCase() || userRoleString.toUpperCase()
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const MENU_ITEMS = [
    { path: "/my-tasks", label: "Nhiệm vụ của tôi", icon: "🎯", roles: ["ANNOTATOR", "REVIEWER"] },
    { path: "/admin/projects", label: "Quản lý Dự án", icon: "📁", roles: ["ADMIN", "MANAGER"] },
    { path: "/admin/dashboard", label: "Thống kê & Báo cáo", icon: "📊", roles: ["ADMIN", "MANAGER"] },
    { path: "/admin/users", label: "Quản lý User", icon: "👥", roles: ["ADMIN"] },
    { path: "/admin/audit-logs", label: "Nhật ký Hệ thống", icon: "🛡️", roles: ["ADMIN"] },
    { path: "/admin/settings", label: "Cấu hình Hệ thống", icon: "⚙️", roles: ["ADMIN"] },
  ];

  const allowedMenus = MENU_ITEMS.filter(menu => {
    if (!userInfo.role) return false; 
    return menu.roles.some(r => userInfo.role.includes(r));
  });

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>LabelMaster</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {allowedMenus.map((menu, index) => (
              <li key={index} className={location.pathname.startsWith(menu.path) ? "active" : ""}>
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
          <Outlet /> 
        </main>

        <footer className="footer">
          <p>© 2026 Data Labeling System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default MainLayout;