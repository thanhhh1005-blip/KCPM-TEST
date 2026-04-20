import React from 'react';
import { Navigate } from 'react-router-dom';

// Hàm giải mã Token (Dùng chung để lấy Role)
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

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  
  // Nếu chưa đăng nhập -> Đá ra trang Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Giải mã Token để lấy Role
  const decoded = parseJwt(token);
  let userRoleString = "";
  
  if (decoded) {
    let rawRole = decoded.scope || decoded.role || decoded.roles || decoded.authorities || "";
    userRoleString = Array.isArray(rawRole) ? rawRole.join(" ") : String(rawRole);
    userRoleString = userRoleString.toUpperCase();
  }

  // Kiểm tra xem Role của user có nằm trong danh sách được phép vào trang này không
  const hasPermission = allowedRoles.some(role => userRoleString.includes(role));

  if (!hasPermission) {
    // Nếu không có quyền -> Đá về trang phù hợp với quyền của họ
    if (userRoleString.includes('ANNOTATOR')) return <Navigate to="/my-tasks" replace />;
    if (userRoleString.includes('MANAGER') || userRoleString.includes('ADMIN')) return <Navigate to="/admin/projects" replace />;
    
    // Nếu kẹt quá thì đá về login
    return <Navigate to="/login" replace />;
  }

  // Đủ quyền thì cho phép render Component bên trong
  return children;
};

export default ProtectedRoute;