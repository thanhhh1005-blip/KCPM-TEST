import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:8080/api';

const ProjectListPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.result) {
        setProjects(data.result);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách dự án:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm format trạng thái cho đẹp
  const getStatusBadge = (status) => {
    switch(status) {
      case 'DRAFT': return <span style={{ background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px' }}>Bản nháp</span>;
      case 'IN_PROGRESS': return <span style={{ background: '#fef08a', color: '#854d0e', padding: '4px 8px', borderRadius: '4px' }}>Đang tiến hành</span>;
      case 'COMPLETED': return <span style={{ background: '#bbf7d0', color: '#166534', padding: '4px 8px', borderRadius: '4px' }}>Đã hoàn thành</span>;
      default: return status;
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Quản lý Dự án Gán nhãn</h2>
        <button 
          onClick={() => navigate('/admin/projects/create')} 
          style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Tạo dự án mới
        </button>
      </div>

      {isLoading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '12px' }}>Tên dự án</th>
              <th style={{ padding: '12px' }}>Trạng thái</th>
              <th style={{ padding: '12px' }}>Số lượng nhãn</th>
              <th style={{ padding: '12px' }}>Số lượng ảnh</th>
              <th style={{ padding: '12px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Chưa có dự án nào.</td></tr>
            ) : (
              projects.map(project => (
                <tr key={project.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{project.name}</td>
                  <td style={{ padding: '12px' }}>{getStatusBadge(project.status)}</td>
                  <td style={{ padding: '12px' }}>{project.labelCount} nhãn</td>
                  <td style={{ padding: '12px' }}>{project.dataItemCount} ảnh</td>
                  <td style={{ padding: '12px' }}>
                    {/* ĐÂY LÀ CHỖ CHÚNG TA CHUYỂN HƯỚNG MANG THEO ID */}
                    <button 
                      onClick={() => navigate(`/admin/projects/${project.id}`)}
                      style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Xem chi tiết / Upload
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProjectListPage;