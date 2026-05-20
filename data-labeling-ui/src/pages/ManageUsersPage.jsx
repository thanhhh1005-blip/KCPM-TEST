import React, { useState, useEffect } from "react";
import "./ManageUsersPage.css";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:8080/api";

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  //  STATE CHO PHÂN TRANG & TÌM KIẾM
  const [currentPage, setCurrentPage] = useState(0); // Spring Boot bắt đầu từ page 0
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    roles: ["ANNOTATOR"],
  });
  const [isEditMode, setIsEditMode] = useState(false);

  const getToken = () => localStorage.getItem("token");

  //  LOGIC GỌI API: Tự động chạy khi chuyển trang hoặc gõ tìm kiếm (có chống spam 500ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(currentPage, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]);

  const fetchUsers = async (page = 0, search = "") => {
    setLoading(true);
    try {
      // Gọi API kèm theo tham số phân trang và tìm kiếm
      const response = await fetch(
        `${API_BASE_URL}/users?page=${page}&size=10&search=${search}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();

      if (data.result) {
        //  NẾU BACKEND ĐÃ TRẢ VỀ ĐỐI TƯỢNG PAGE CỦA SPRING BOOT
        if (data.result.content) {
          setUsers(data.result.content);
          setTotalPages(data.result.totalPages);
        } else {
          // NẾU BACKEND VẪN ĐANG TRẢ VỀ LIST CŨ (Phòng hờ lỗi khi bạn chưa sửa Backend kịp)
          setUsers(data.result);
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Khi tìm kiếm mới thì luôn quay về trang đầu tiên
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    setFormData({
      id: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      roles: ["ANNOTATOR"],
    });
    setIsEditMode(false);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    const currentRole =
      user.roles && user.roles.length > 0 ? user.roles[0].name : "ANNOTATOR";
    setFormData({
      id: user.id,
      username: user.username,
      password: "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      roles: [currentRole],
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditMode
      ? `${API_BASE_URL}/users/${formData.id}`
      : `${API_BASE_URL}/users`;
    const method = isEditMode ? "PUT" : "POST";

    const { id, roles, ...restPayload } = formData;
    if (isEditMode) delete restPayload.password;

    const finalPayload = {
      ...restPayload,
      roles: roles.map((roleName) => ({ name: roleName })),
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalPayload),
      });
      const data = await response.json();

      if (data.code === 1000 || data.result) {
        setShowModal(false);
        fetchUsers(currentPage, searchTerm); // Tải lại danh sách hiện tại sau khi lưu
      } else {
        toast.error(data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Lỗi khi lưu người dùng:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.result) fetchUsers(currentPage, searchTerm);
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
    }
  };

  return (
    <div className="manage-users-container">
      <div className="page-header">
        <h2>Quản lý Người dùng (Admin)</h2>

        {/*  THANH TÌM KIẾM VÀ NÚT THÊM */}
        <div className="header-actions">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên, username..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="btn btn-primary" onClick={openAddModal}>
            + Thêm người dùng
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Đang tải dữ liệu...</div>
      ) : (
        <>
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Họ và Tên</th>
                <th>Vai trò</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <strong>{user.username}</strong>
                    </td>
                    <td>
                      {user.lastName} {user.firstName}
                    </td>
                    <td>
                      <span className="role-badge">
                        {user.roles && user.roles.length > 0
                          ? user.roles[0].name
                          : "ANNOTATOR"}
                      </span>
                    </td>
                    <td className="actions-cell text-center">
                      <button
                        className="btn btn-edit"
                        onClick={() => openEditModal(user)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(user.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center empty-state">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/*  THANH PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-page"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                &laquo; Trước
              </button>

              <span className="page-info">
                Trang {currentPage + 1} / {totalPages}
              </span>

              <button
                className="btn-page"
                disabled={currentPage === totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Sau &raquo;
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Thêm/Sửa (Giữ nguyên) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {isEditMode ? "Cập nhật Người dùng" : "Thêm Người dùng mới"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isEditMode}
                  required
                />
              </div>
              {!isEditMode && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Vai trò hệ thống</label>
                <select
                  name="roles"
                  value={formData.roles[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, roles: [e.target.value] })
                  }
                  className="role-select"
                >
                  <option value="ANNOTATOR">Annotator (Người gán nhãn)</option>
                  <option value="MANAGER">Manager (Quản lý dự án)</option>
                  <option value="REVIEWER">Reviewer (Người kiểm duyệt)</option>
                  <option value="ADMIN">Admin (Quản trị hệ thống)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;
