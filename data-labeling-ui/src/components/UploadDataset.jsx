import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:8080/api';

const UploadDataset = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Hàm lấy token để gắn vào Header bảo mật
  const getToken = () => localStorage.getItem('token');

  // Xử lý khi người dùng chọn file từ máy tính
  const handleFileChange = (e) => {
    // Lưu danh sách file vào state (có thể chọn nhiều file)
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ảnh!");
      return;
    }

    setIsLoading(true);

    // 1. Dùng FormData để đóng gói file
    const formData = new FormData();
    // Lặp qua mảng file để append vào formData (trùng tên 'files' bên Backend)
    Array.from(selectedFiles).forEach(file => {
      formData.append('files', file);
    });
    formData.append('projectId', 'currentProjectId'); // Thêm projectId nếu cần thiết

    try {
      // 2. Gửi file lên Spring Boot
      const response = await fetch(`${API_BASE_URL}/datasets/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
          // 🛑 LƯU Ý: Không được khai báo 'Content-Type' ở đây khi dùng FormData
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.result) {
        alert("Upload thành công!");
        setUploadedImages(data.result); // Lưu danh sách URL trả về để hiển thị
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

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h3>Tải ảnh lên Bộ Dữ Liệu</h3>
      
      <div style={{ margin: '20px 0' }}>
        {/* Thuộc tính multiple cho phép chọn nhiều file cùng lúc, accept giới hạn chỉ chọn ảnh */}
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange} 
          style={{ marginBottom: '10px' }}
        />
        <br/>
        <button 
          onClick={handleUpload} 
          disabled={isLoading}
          style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isLoading ? 'Đang tải lên...' : 'Upload Ảnh'}
        </button>
      </div>

      {/* Hiển thị trước các ảnh đã upload thành công từ Cloudinary */}
      {uploadedImages.length > 0 && (
        <div>
          <h4>Ảnh đã tải lên Cloudinary:</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {uploadedImages.map((url, index) => (
              <img key={index} src={url} alt={`Uploaded ${index}`} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDataset;