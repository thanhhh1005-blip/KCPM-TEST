import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:8080/api";

// Hàm giải mã Token để lấy quyền
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const ProjectListPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // State cho Modal & User
  const [showEditModal, setShowEditModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    description: "",
    managerId: "",
    reviewerId: "",
    labels: [],
  });

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchProjects();
    fetchUsers();

    const token = getToken();
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        let rawRole = decoded.scope || decoded.role || decoded.roles || "";
        setUserRole(
          Array.isArray(rawRole) ? rawRole.join(" ") : String(rawRole),
        );
      }
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.result) setProjects(data.result);
    } catch (error) {
      console.error("Lỗi tải dự án:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.result) {
        //  NẾU LÀ PAGE MỚI THÌ LẤY .content, CÒN LÀ LIST CŨ THÌ LẤY LUÔN data.result
        if (data.result.content) {
          setUsers(data.result.content);
        } else {
          setUsers(data.result);
        }
      }
    } catch (error) {
      console.error("Lỗi tải user:", error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (
      !window.confirm(
        "CẢNH BÁO: Xóa dự án sẽ làm mất toàn bộ dữ liệu (ảnh, nhãn). Bạn có chắc chắn?",
      )
    )
      return;
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        toast.success("Đã xóa dự án!");
        fetchProjects();
      } else {
        toast.error("Lỗi khi xóa!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = (project) => {
    setEditData({
      id: project.id,
      name: project.name || "",
      description: project.description || "",
      managerId: project.managerId || "",
      reviewerId: project.reviewerId || "",
      labels: project.labels || [],
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async () => {
    try {
      const requestBody = {
        name: editData.name,
        description: editData.description,
        managerId: editData.managerId,
        reviewerId: editData.reviewerId,
        labels: editData.labels,
      };

      const response = await fetch(`${API_BASE_URL}/projects/${editData.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success("Cập nhật thành công!");
        setShowEditModal(false);
        fetchProjects();
      } else {
        toast.error("Cập nhật thất bại!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const managerList = users.filter((u) =>
    JSON.stringify(u.roles).includes("MANAGER"),
  );
  const reviewerList = users.filter((u) =>
    JSON.stringify(u.roles).includes("REVIEWER"),
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "DRAFT":
        return (
          <span
            style={{
              background: "#e2e8f0",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            Bản nháp
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span
            style={{
              background: "#fef08a",
              color: "#854d0e",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            Đang tiến hành
          </span>
        );
      case "COMPLETED":
        return (
          <span
            style={{
              background: "#bbf7d0",
              color: "#166534",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            Đã hoàn thành
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        minHeight: "80vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Quản lý Dự án Gán nhãn</h2>
        <button
          onClick={() => navigate("/admin/projects/create")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          + Tạo dự án mới
        </button>
      </div>

      {isLoading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f1f5f9",
                borderBottom: "2px solid #cbd5e1",
              }}
            >
              <th style={{ padding: "12px" }}>Tên dự án</th>
              <th style={{ padding: "12px" }}>Trạng thái</th>
              <th style={{ padding: "12px" }}>Số lượng nhãn</th>
              <th style={{ padding: "12px" }}>Số lượng ảnh</th>
              <th style={{ padding: "12px" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Chưa có dự án nào.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.id}
                  style={{ borderBottom: "1px solid #e2e8f0" }}
                >
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    {project.name}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {getStatusBadge(project.status)}
                  </td>
                  <td style={{ padding: "12px" }}>{project.labelCount} nhãn</td>
                  <td style={{ padding: "12px" }}>
                    {project.dataItemCount} ảnh
                  </td>
                  <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => navigate(`/admin/projects/${project.id}`)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => openEditModal(project)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f59e0b",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* MODAL CẬP NHẬT */}
      {showEditModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              width: "500px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
              ✏️ Cập nhật Dự án
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "5px",
                  }}
                >
                  Tên dự án:
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "5px",
                  }}
                >
                  Mô tả:
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    minHeight: "60px",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "15px" }}>
                {userRole.includes("ADMIN") && (
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Quản lý (Manager):
                    </label>
                    <select
                      value={editData.managerId}
                      onChange={(e) =>
                        setEditData({ ...editData, managerId: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">-- Chọn Manager --</option>
                      {managerList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.lastName} {m.firstName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    Người duyệt (Reviewer):
                  </label>
                  <select
                    value={editData.reviewerId}
                    onChange={(e) =>
                      setEditData({ ...editData, reviewerId: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #cbd5e1",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">-- Chọn Reviewer --</option>
                    {reviewerList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.lastName} {r.firstName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "25px",
              }}
            >
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: "8px 15px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateProject}
                style={{
                  padding: "8px 15px",
                  borderRadius: "4px",
                  border: "none",
                  background: "#3b82f6",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                💾 Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;
