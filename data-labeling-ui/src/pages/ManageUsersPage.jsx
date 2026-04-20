import React, { useState, useEffect } from 'react';
import './ManageUsersPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:8080/api';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // State quản lý form (Thêm trường roles mặc định là ANNOTATOR)
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    roles: ['ANNOTATOR'] // 🌟 THÊM TRƯỜNG NÀY
  });
  const [isEditMode, setIsEditMode] = useState(false);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.result) setUsers(data.result);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    setFormData({ id: '', username: '', password: '', firstName: '', lastName: '', roles: ['ANNOTATOR'] });
    setIsEditMode(false);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    // Nếu user có mảng roles, lấy role đầu tiên, nếu không thì mặc định ANNOTATOR
    const currentRole = user.roles && user.roles.length > 0 ? user.roles[0].name : 'ANNOTATOR';
    
    setFormData({ 
        id: user.id, 
        username: user.username, 
        password: '', 
        firstName: user.firstName || '', 
        lastName: user.lastName || '',
        roles: [currentRole] // Lấy quyền hiện tại
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditMode ? `${API_BASE_URL}/users/${formData.id}` : `${API_BASE_URL}/users`;
    const method = isEditMode ? 'PUT' : 'POST';

    // Loại bỏ id khỏi payload khi gửi đi
    const { id, roles, ...restPayload } = formData;
    if (isEditMode) delete restPayload.password; 

    // 🌟 CHUẨN BỊ PAYLOAD VỚI MẢNG OBJECT ROLE
    const finalPayload = {
      ...restPayload,
      roles: roles.map(roleName => ({ name: roleName })) // Biến ['MANAGER'] thành [{ name: 'MANAGER' }]
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalPayload)
      });
      const data = await response.json();
      
      if (data.code === 1000 || data.result) { 
        setShowModal(false);
        fetchUsers(); 
      } else {
        alert(data.message || 'Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Lỗi khi lưu người dùng:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      const data = await response.json();
      if (data.result) fetchUsers();
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
    }
  };

  return (
    <div className="manage-users-container">
      <div className="page-header">
        <h2>Quản lý Người dùng (Admin)</h2>
        <button className="btn btn-primary" onClick={openAddModal}>+ Thêm người dùng</button>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Họ và Tên</th>
              <th>Vai trò</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.lastName} {user.firstName}</td>
                {/* 🌟 Hiển thị Role trên bảng */}
                <td>
                  <span style={{ backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    {user.roles && user.roles.length > 0 ? user.roles[0].name : 'ANNOTATOR'}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="btn btn-edit" onClick={() => openEditModal(user)}>Sửa</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>Xóa</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="text-center">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditMode ? 'Cập nhật Người dùng' : 'Thêm Người dùng mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} disabled={isEditMode} required />
              </div>
              {!isEditMode && (
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                </div>
              )}
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
              </div>
              
              {/* 🌟 FORM CHỌN QUYỀN (CHỈ DÀNH CHO ADMIN) */}
              <div className="form-group">
                <label>Vai trò hệ thống</label>
                <select 
                  name="roles" 
                  value={formData.roles[0]} 
                  onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="ANNOTATOR">Annotator (Người gán nhãn)</option>
                  <option value="MANAGER">Manager (Quản lý dự án)</option>
                  <option value="REVIEWER">Reviewer (Người kiểm duyệt)</option>
                  <option value="ADMIN">Admin (Quản trị hệ thống)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;