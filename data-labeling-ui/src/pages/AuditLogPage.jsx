import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : "http://localhost:8080/api";

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States cho Bộ lọc (Filter)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/audit-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.result) setLogs(data.result);
    } catch (error) {
      console.error("Lỗi tải lịch sử hoạt động:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logic lọc dữ liệu
  const filteredLogs = logs.filter(log => {
    const matchSearch = log.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAction = filterAction === "" || log.action === filterAction;
    return matchSearch && matchAction;
  });

  // Render màu sắc cho từng loại hành động
  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE': return <span style={{ background: '#dcfce3', color: '#15803d', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>🟢 TẠO MỚI</span>;
      case 'UPDATE': return <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>🔵 CẬP NHẬT</span>;
      case 'DELETE': return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>🔴 XÓA</span>;
      default: return <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>⚪ {action}</span>;
    }
  };

  // Format thời gian đẹp mắt
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>🛡️ Nhật ký Hệ thống (Audit Log)</h2>
        <p style={{ color: '#64748b' }}>Theo dõi mọi thay đổi và truy vết hoạt động của người dùng.</p>
      </div>

      {/* Bộ Lọc (Filter Controls) */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <input 
          type="text" 
          placeholder="🔍 Tìm theo Username hoặc Chi tiết..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
        />
        <select 
          value={filterAction} 
          onChange={(e) => setFilterAction(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">Tất cả hành động</option>
          <option value="CREATE">Tạo mới</option>
          <option value="UPDATE">Cập nhật</option>
          <option value="DELETE">Xóa</option>
        </select>
      </div>

      {/* Bảng Hiển thị */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
            <tr>
              <th style={{ padding: '15px' }}>Thời gian</th>
              <th style={{ padding: '15px' }}>Tài khoản</th>
              <th style={{ padding: '15px' }}>IP Address</th>
              <th style={{ padding: '15px' }}>Hành động</th>
              <th style={{ padding: '15px' }}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>⏳ Đang tải dữ liệu...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Không có lịch sử nào phù hợp.</td></tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px', color: '#64748b' }}>{formatDate(log.timestamp)}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#3b82f6' }}>@{log.username}</td>
                  <td style={{ padding: '15px', color: '#94a3b8', fontSize: '12px' }}>{log.ipAddress || 'Unknown'}</td>
                  <td style={{ padding: '15px' }}>{getActionBadge(log.action)}</td>
                  <td style={{ padding: '15px', color: '#1e293b' }}>
                    <span style={{ fontWeight: 'bold' }}>[{log.targetEntity}]</span> - {log.details}
                    {log.status === 'ERROR' && <span style={{ color: 'red', marginLeft: '5px' }}>(Thất bại)</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogPage;