import { Routes, Route } from 'react-router-dom';

// Import các trang và layout từ các thư mục tương ứng
import LoginPage from './pages/LoginPage';
import ManageUsersPage from './pages/ManageUsersPage';
import MainLayout from './layouts/MainLayout';
import AnnotationPage from './pages/AnnotationPage';

function App() {
  return (
    <Routes>
      {/* Trang Login ở ngoài cùng */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Các trang dành cho Admin được bọc trong MainLayout */}
      <Route path="/admin" element={<MainLayout />}>
        <Route path="users" element={<ManageUsersPage />} />
        {/* Bạn có thể thêm các route con khác ở đây sau này */}
        {/* <Route path="projects" element={<ManageProjectsPage />} /> */}
      </Route>

      {/* 2. Thêm route gán nhãn */}
      <Route path="/tasks" element={<AnnotationPage />} />

      {/* Route dự phòng báo lỗi 404 nếu gõ sai đường dẫn */}
      <Route path="*" element={<h2 style={{ textAlign: 'center', marginTop: '50px' }}>404 - Không tìm thấy trang</h2>} />
    </Routes>
  );
}

// Bắt buộc phải có dòng này để main.jsx có thể import được
export default App;