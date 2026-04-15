import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:8080/api';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // State quản lý mảng các nhãn (Mặc định có sẵn 1 nhãn rỗng)
  const [labels, setLabels] = useState([{ name: '', color: '#ff0000' }]);
  const [isLoading, setIsLoading] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // Thêm một dòng nhãn mới
  const addLabelRow = () => {
    setLabels([...labels, { name: '', color: '#000000' }]);
  };

  // Cập nhật giá trị khi người dùng gõ/chọn màu
  const handleLabelChange = (index, field, value) => {
    const newLabels = [...labels];
    newLabels[index][field] = value;
    setLabels(newLabels);
  };

  // Xóa một dòng nhãn
  const removeLabelRow = (index) => {
    const newLabels = labels.filter((_, i) => i !== index);
    setLabels(newLabels);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Lọc bỏ những nhãn mà Manager để trống tên
    const validLabels = labels.filter(label => label.name.trim() !== '');

    const payload = {
      name,
      description,
      labels: validLabels
    };

    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.result) {
        alert("Tạo dự án thành công!");
        // Chuyển hướng về trang danh sách dự án
        navigate('/admin/projects'); 
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>Tạo Dự Án Gán Nhãn Mới</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div>
          <label style={{ fontWeight: 'bold' }}>Tên dự án:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Hướng dẫn gán nhãn (Description):</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows="4" 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>Cấu hình Bộ Nhãn (Label Sets):</label>
            <button type="button" onClick={addLabelRow} style={{ padding: '5px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
              + Thêm nhãn
            </button>
          </div>

          {labels.map((label, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Tên nhãn (vd: Car, Person)" 
                value={label.name} 
                onChange={(e) => handleLabelChange(index, 'name', e.target.value)} 
                style={{ flex: 1, padding: '8px' }}
                required
              />
              <input 
                type="color" 
                value={label.color} 
                onChange={(e) => handleLabelChange(index, 'color', e.target.value)} 
                style={{ width: '50px', height: '35px', padding: '0', cursor: 'pointer' }}
              />
              <button 
                type="button" 
                onClick={() => removeLabelRow(index)} 
                style={{ padding: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          {isLoading ? 'Đang xử lý...' : 'Lưu Dự Án'}
        </button>
      </form>
    </div>
  );
};

export default CreateProjectPage;