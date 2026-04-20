import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:8080/api';

const MyTasksPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem('token');

  // Hàm giải mã Token để biết Role
  const getUserRole = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload.scope || payload.role || payload.roles || "";
      if (roles.includes('REVIEWER')) return 'REVIEWER';
      if (roles.includes('ANNOTATOR')) return 'ANNOTATOR';
      return null;
    } catch (e) { return null; }
  };

  const role = getUserRole();

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    setIsLoading(true);
    try {
      let endpoint = '';
      if (role === 'REVIEWER') {
        endpoint = `${API_BASE_URL}/projects/reviewer/my-projects`; // 🌟 Gọi API mới của Reviewer
      } else {
        // 🌟 Chỗ này bạn giữ nguyên API cũ đang lấy task cho Annotator của bạn
        endpoint = `${API_BASE_URL}/projects/my-projects`; 
      }

      const response = await fetch(endpoint, {
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

  return (
    <div style={{ padding: '20px' }}>
      <h2>🎯 Nhiệm vụ của tôi ({role})</h2>
      
      {isLoading ? (
        <p>Đang tải dữ liệu...</p>
      ) : projects.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
          <h3>Bạn chưa được phân công vào dự án nào.</h3>
          <p>Hãy liên hệ với Manager nếu bạn nghĩ đây là lỗi.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {projects.map(project => (
            <div key={project.id} style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: 0 }}>{project.name}</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>{project.description || "Không có mô tả"}</p>
              
              {role === 'REVIEWER' ? (
                <button 
                  onClick={() => navigate(`/admin/review/${project.id}`)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#eab308', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🔍 Vào Duyệt Nhãn
                </button>
              ) : (
                <button 
                  onClick={() => navigate(`/workspace/${project.id}`)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🎨 Bắt đầu Gán Nhãn
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;