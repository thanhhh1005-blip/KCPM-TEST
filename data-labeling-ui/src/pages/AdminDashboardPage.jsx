import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Bỏ useParams đi vì không cần lấy ID từ URL nữa
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:8080/api";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  
  // 🌟 States mới cho việc Chọn Dự Án
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  
  // States cho Dữ liệu Thống kê
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const annotatorList = stats && stats.annotatorStats ? stats.annotatorStats : [];
  const getToken = () => localStorage.getItem("token");

  // 1. Khi mới vào trang: Gọi API lấy danh sách toàn bộ dự án
  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. Khi Dropdown thay đổi: Gọi API lấy thống kê của dự án đó
  useEffect(() => {
    if (selectedProjectId) {
      fetchDashboardStats(selectedProjectId);
    } else {
      setStats(null); // Ẩn biểu đồ nếu không chọn dự án
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.result) {
        setProjects(data.result);
        // Tự động chọn dự án đầu tiên cho người dùng đỡ phải click
        if (data.result.length > 0) setSelectedProjectId(data.result[0].id);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách dự án:", error);
    }
  };

  const fetchDashboardStats = async (projectId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/dashboard`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      
      if (data.result) {
        setStats(data.result);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 Bảo vệ dữ liệu: Chỉ tính toán khi stats đã có
  const pieData = stats ? [
    { name: 'Đã duyệt', value: stats.approvedImages, color: '#10b981' }, 
    { name: 'Chờ duyệt', value: stats.pendingImages, color: '#f59e0b' }, 
    { name: 'Bị từ chối', value: stats.rejectedImages, color: '#ef4444' }, 
    { name: 'Chưa làm', value: stats.totalImages - (stats.approvedImages + stats.pendingImages + stats.rejectedImages), color: '#94a3b8' } 
  ].filter(item => item.value > 0) : []; 

  const barData = stats && stats.labelStats 
    ? Object.entries(stats.labelStats).map(([key, val]) => ({ name: key, count: val }))
    : [];

  const mockAnnotators = [
    { id: 1, name: 'Hồ Na (@nana)', done: 400, rejected: 20, errorRate: '5%' },
    { id: 2, name: 'Nguyễn Thanh (@thanh)', done: 500, rejected: 10, errorRate: '2%' },
    { id: 3, name: 'Trần Minh (@minh)', done: 300, rejected: 36, errorRate: '12%' },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui' }}>
      
      {/* 🌟 Header & Dropdown chọn dự án */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>📊 Dashboard Thống Kê</h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Theo dõi chất lượng và tiến độ dự án</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <label style={{ fontWeight: 'bold', color: '#475569' }}>Chọn dự án:</label>
          <select 
            value={selectedProjectId} 
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '300px', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">-- Vui lòng chọn dự án --</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} (Mã: {p.id.substring(0,8)}...)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Trạng thái Loading hoặc Chưa chọn */}
      {!selectedProjectId && <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#64748b' }}>Vui lòng chọn một dự án ở trên để xem thống kê.</div>}
      {isLoading && <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>⏳ Đang tải dữ liệu Dashboard...</div>}
      {selectedProjectId && !isLoading && !stats && <div style={{ padding: '50px', color: 'red', textAlign: 'center' }}>❌ Không lấy được dữ liệu. Hãy kiểm tra lại Backend.</div>}

      {/* 🌟 CHỈ HIỂN THỊ BIỂU ĐỒ KHI ĐÃ CÓ DATA */}
      {stats && !isLoading && (
        <>
          {/* 4 Thẻ Số Liệu (Cards) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '5px solid #3b82f6' }}>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>TỔNG SỐ ẢNH</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginTop: '10px' }}>{stats.totalImages}</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '5px solid #10b981' }}>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>ĐÃ DUYỆT</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginTop: '10px' }}>{stats.approvedImages}</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '5px solid #f59e0b' }}>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>CHỜ DUYỆT</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginTop: '10px' }}>{stats.pendingImages}</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '5px solid #ef4444' }}>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>BỊ TỪ CHỐI</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginTop: '10px' }}>{stats.rejectedImages}</div>
            </div>
          </div>

          {/* Khu vực Biểu đồ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '30px' }}>
            
            {/* Biểu đồ Tròn */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Tiến độ xử lý ảnh</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Biểu đồ Cột */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Phân bố Nhãn (Labels)</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" name="Số lượng khung vẽ" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bảng Xếp hạng Annotator */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>🏆 Hiệu suất đội ngũ Annotator</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', color: '#475569' }}>Nhân viên</th>
                  <th style={{ padding: '12px', color: '#475569' }}>Số ảnh đã xử lý</th>
                  <th style={{ padding: '12px', color: '#475569' }}>Số ảnh bị từ chối</th>
                  <th style={{ padding: '12px', color: '#475569' }}>Tỉ lệ lỗi</th>
                </tr>
              </thead>
              <tbody>
                {annotatorList.map((user, index) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#1e293b' }}>{user.name}</td>
                    <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>{user.done}</td>
                    <td style={{ padding: '12px', color: '#ef4444' }}>{user.rejected}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ backgroundColor: index === 2 ? '#fee2e2' : '#dcfce3', color: index === 2 ? '#b91c1c' : '#15803d', padding: '4px 8px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                        {user.errorRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;