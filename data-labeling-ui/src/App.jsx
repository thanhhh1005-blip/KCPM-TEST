import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import ManageUsersPage from './pages/ManageUsersPage';
import MainLayout from './layouts/MainLayout';
import ProjectListPage from './pages/ProjectListPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AnnotationPage from './pages/AnnotationPage';
import MyTasksPage from './pages/MyTasksPage';
import LabelWorkspace from './pages/LabelWorkspace';
import ProtectedRoute from './components/ProtectedRoute';
import ReviewWorkspace from './pages/ReviewWorkspace';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/workspace/:projectId" element={
      <ProtectedRoute allowedRoles={['ANNOTATOR']}>
        <LabelWorkspace />
      </ProtectedRoute>
      } />
      <Route path="/admin/review/:projectId" element={
        <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN', 'REVIEWER']}>
          <ReviewWorkspace />
        </ProtectedRoute>
      } />
      
      {/* 🌟 TẤT CẢ USER ĐÃ ĐĂNG NHẬP ĐỀU DÙNG CHUNG MAIN LAYOUT */}
      <Route element={<MainLayout />}>
        
        {/* Khu vực của Annotator */}
        <Route path="/my-tasks" element={<MyTasksPage />} />
        <Route path="/tasks" element={<AnnotationPage />} />

        {/* Khu vực của Admin / Manager */}
        <Route path="/admin/users" element={<ManageUsersPage />} />
        <Route path="/admin/projects" element={<ProjectListPage />} />
        <Route path="/admin/projects/create" element={<CreateProjectPage />} />
        <Route path="/admin/projects/:projectId" element={<ProjectDetailPage />} />

      </Route>

      <Route path="*" element={<h2 style={{ textAlign: 'center', marginTop: '50px' }}>404 - Không tìm thấy trang</h2>} />
    </Routes>
  );
}
export default App;