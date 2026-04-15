import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import ManageUsersPage from './pages/ManageUsersPage';
import MainLayout from './layouts/MainLayout';
import ProjectListPage from './pages/ProjectListPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AnnotationPage from './pages/AnnotationPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/admin" element={<MainLayout />}>
        <Route path="users" element={<ManageUsersPage />} />
        <Route path="projects" element={<ProjectListPage />} />
        <Route path="projects/create" element={<CreateProjectPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
</Route>

<Route path="/tasks" element={<AnnotationPage />} />
{/* Route dự phòng báo lỗi 404 nếu gõ sai đường dẫn */}
<Route path="*" element={<h2 style={{ textAlign: 'center', marginTop: '50px' }}>404 - Không tìm thấy trang</h2>} />
    </Routes>
  );
}
export default App;