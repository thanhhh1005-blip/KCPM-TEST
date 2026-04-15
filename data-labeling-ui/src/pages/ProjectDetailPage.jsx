import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:8080/api';

const ProjectDetailPage = () => {
  const { projectId } = useParams(); 
  const navigate = useNavigate();
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 🌟 1. State này dùng để chứa TOÀN BỘ ảnh của dự án lấy từ Database
  const [dataset, setDataset] = useState([]); 

  const getToken = () => localStorage.getItem('token');

  // 🌟 2. useEffect này sẽ tự động chạy hàm fetchDataset() ngay khi bạn vừa vào trang này
  useEffect(() => {
    fetchDataset();
  }, [projectId]);

  // Hàm gọi API lấy danh sách ảnh (cái API chuẩn mà bạn vừa gửi đó)
  const fetchDataset = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/datasets/project/${projectId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.result) {
        setDataset(data.result); // Đổ dữ liệu lấy được vào state dataset
      }
    } catch (error) {
      console.error("Lỗi tải danh sách ảnh:", error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ảnh!");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      formData.append('files', file);
    });
    formData.append('projectId', projectId); 

    try {
      const response = await fetch(`${API_BASE_URL}/datasets/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.result) {
        alert("Upload thành công lên Cloudinary!");
        setSelectedFiles([]); // Xóa rỗng ô chọn file
        
        // 🌟 3. QUAN TRỌNG: Gọi lại hàm này để load lại lưới ảnh mới nhất sau khi upload
        fetchDataset(); 
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi mạng:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm format trạng thái bằng tiếng Việt cho đẹp
  const renderStatus = (status) => {
    if (status === 'UNLABELED') return <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold' }}>🔴 Chưa gán</span>;
    if (status === 'LABELED') return <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}>🟢 Đã gán</span>;
    return <span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: 'bold' }}>🔵 Đã duyệt</span>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Chi tiết Dự án & Quản lý Dữ liệu</h2>
        <button 
          onClick={() => navigate('/admin/projects')} 
          style={{ padding: '8px 16px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Quay lại danh sách
        </button>
      </div>
      
      <p style={{ color: '#64748b', marginTop: '10px' }}>
        <strong>Mã dự án (ID):</strong> {projectId}
      </p>

      {/* --- PHẦN 1: VÙNG UPLOAD ẢNH --- */}
      <div style={{ marginTop: '20px', padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
        <input type="file" multiple accept="image/*" onChange={handleFileChange} />
        <button 
          onClick={handleUpload} 
          disabled={isLoading || selectedFiles.length === 0}
          style={{ 
            marginLeft: '10px', padding: '8px 16px', 
            backgroundColor: (isLoading || selectedFiles.length === 0) ? '#94a3b8' : '#10b981', 
            color: 'white', border: 'none', borderRadius: '5px', cursor: (isLoading || selectedFiles.length === 0) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Đang tải lên...' : '🚀 Upload'}
        </button>
      </div>

      {/* --- PHẦN 2: LƯỚI HIỂN THỊ ẢNH (GALLERY) --- */}
      <div style={{ marginTop: '40px', borderTop: '2px solid #e2e8f0', paddingTop: '20px' }}>
        <h3>Bộ dữ liệu đã tải lên ({dataset.length} ảnh)</h3>
        
        {dataset.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>Dự án này chưa có ảnh nào. Vui lòng tải lên!</p>
        ) : (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
            {dataset.map((item) => (
              // Khung bao quanh từng bức ảnh
              <div key={item.id} style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px', backgroundColor: '#f8fafc', width: '220px' }}>
                <img 
                  src={item.fileUrl} 
                  alt={item.fileName} 
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} 
                />
                <div style={{ marginTop: '10px', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.fileName}>
                  {item.fileName}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  {renderStatus(item.status)}
                  <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProjectDetailPage;