import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : "http://localhost:8080/api";

const SystemConfigPage = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.result) {
        // Tự động load dữ liệu từ DB (Đã xóa YOLO trong DB thì ở đây sẽ không còn)
        setConfigs(data.result);
      }
    } catch (error) {
      console.error("Lỗi tải cấu hình:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key, newValue) => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${key}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'text/plain' // Gửi dạng text thô theo chuẩn của Backend
        },
        body: String(newValue) 
      });

      if (response.ok) {
        toast.success(`Đã lưu thay đổi cho [${key}]`);
        fetchConfigs(); 
      } else {
        toast.error("Lưu thất bại! Vui lòng kiểm tra lại.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối đến máy chủ.");
    }
  };

  if (loading) return <div style={{ padding: '30px', textAlign: 'center' }}>⏳ Đang tải cấu hình...</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>⚙️ Cấu hình Hệ thống</h2>
        <p style={{ color: '#64748b', marginTop: '5px' }}>Thiết lập các tham số vận hành toàn Server. Thay đổi sẽ có tác dụng ngay lập tức.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '800px' }}>
        {configs.length === 0 ? (
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', color: '#ef4444' }}>
            ⚠️ Chưa có dữ liệu cấu hình trong Database. Hãy chạy lệnh INSERT vào bảng system_config.
          </div>
        ) : (
          configs.map(item => (
            <div key={item.key} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              
              <div style={{ flex: 1, paddingRight: '20px' }}>
                <strong style={{ fontSize: '16px', color: '#3b82f6' }}>{item.key}</strong>
                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>{item.description}</div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* NHẬN DIỆN TRUE/FALSE ĐỂ HIỆN DROPDOWN BẬT/TẮT */}
                {item.value === 'true' || item.value === 'false' ? (
                  <select 
                    defaultValue={item.value}
                    onChange={(e) => handleUpdate(item.key, e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '200px', fontSize: '14px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                  >
                    <option value="true">Bật (True)</option>
                    <option value="false">Tắt (False)</option>
                  </select>
                ) : (
                  /* CÁC TRƯỜNG HỢP CÒN LẠI (SỐ, CHỮ) SẼ HIỆN Ô NHẬP TEXT */
                  <input 
                    type="text" 
                    defaultValue={item.value} 
                    onBlur={(e) => {
                      if (e.target.value !== item.value) handleUpdate(item.key, e.target.value);
                    }}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '178px', fontSize: '14px', outline: 'none' }}
                  />
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SystemConfigPage;