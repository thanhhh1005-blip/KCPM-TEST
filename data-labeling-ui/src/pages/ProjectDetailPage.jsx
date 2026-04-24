import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:8080/api";

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataset, setDataset] = useState([]);

  const [allUsers, setAllUsers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // 🌟 State mới để tạo hiệu ứng Loading khi tải file
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("YOLO");
  const [isExporting, setIsExporting] = useState(false);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchDataset();
    fetchAllUsers();
    fetchProjectMembers();
  }, [projectId]);

  const fetchDataset = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/datasets/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await response.json();
      if (data.result) setDataset(data.result);
    } catch (error) {
      console.error("Lỗi tải danh sách ảnh:", error);
    }
  };

  const handleFileChange = (e) => setSelectedFiles(e.target.files);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 ảnh!");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => formData.append("files", file));
    formData.append("projectId", projectId);

    try {
      const response = await fetch(`${API_BASE_URL}/datasets/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await response.json();
      if (data.result) {
        toast.success("Upload thành công!");
        setSelectedFiles([]);
        fetchDataset();
      } else {
        toast.error("Lỗi: " + data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối mạng.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.result) setAllUsers(data.result);
    } catch (error) {
      console.error("Lỗi tải danh sách User:", error);
    }
  };

  const fetchProjectMembers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/members`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await response.json();
      if (data.result) setProjectMembers(data.result);
    } catch (error) {
      console.error("Lỗi tải thành viên dự án:", error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.warning("Vui lòng chọn một nhân viên!");
      return;
    }

    setIsAssigning(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/members`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: selectedUserId,
            roleName: "ANNOTATOR",
          }),
        },
      );
      const data = await response.json();
      if (data.result) {
        setSelectedUserId("");
        fetchProjectMembers();
      } else {
        toast.error("Lỗi: " + data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối mạng khi phân công.");
    } finally {
      setIsAssigning(false);
    }
  };

  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(
        decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        ),
      );
    } catch (e) {
      return null;
    }
  }

  // 🌟 HÀM TÌM TRANG CHỦ THEO ROLE
  const getHomeRoute = () => {
    const token = localStorage.getItem("token");
    if (!token) return "/login";

    const decoded = parseJwt(token);
    if (!decoded) return "/login";

    let rawRole = decoded.scope || decoded.role || decoded.roles || "";
    let role = String(rawRole).toUpperCase();

    // Nếu là sếp -> về trang quản lý dự án
    if (role.includes("ADMIN") || role.includes("MANAGER")) {
      return "/admin/projects";
    }
    // Nếu là lính -> về trang nhiệm vụ
    return "/my-tasks";
  };
  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi dự án?"))
      return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/members/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await response.json();
      if (data.result) fetchProjectMembers();
    } catch (error) {
      toast.error("Lỗi khi xóa thành viên.");
    }
  };

  // 🌟 HÀM XUẤT FILE ZIP
  const handleConfirmExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/export/${projectId}?format=${exportFormat}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      if (!response.ok) throw new Error("Lỗi khi xuất file");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `dataset_${projectId}_${exportFormat}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

      // 🌟 Tải xong thì tự động đóng Popup lại
      setShowExportModal(false);
    } catch (error) {
      toast.error(
        "Xuất dữ liệu thất bại! Có thể do Backend lỗi hoặc dự án chưa có ảnh nào được duyệt.",
      );
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };
  // 🗑️ Hàm Xóa ảnh
  const handleDeleteImage = async (imageId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa ảnh này không? (Dữ liệu khung vẽ cũng sẽ bị xóa)",
      )
    )
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/datasets/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        fetchDataset(); // Gọi lại hàm tải danh sách ảnh để update giao diện
      } else {
        toast.error("Lỗi khi xóa ảnh!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 🗑️ Hàm Xóa dự án
  const handleDeleteProject = async () => {
    if (
      !window.confirm(
        "CẢNH BÁO BÁO ĐỘNG ĐỎ 🚨\nBạn có chắc chắn muốn XÓA TOÀN BỘ dự án này không? Mọi dữ liệu sẽ biến mất vĩnh viễn!",
      )
    )
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        toast.success("Đã xóa dự án thành công!");
        navigate("/admin/projects"); // Đá người dùng về trang danh sách dự án
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ✏️ Hàm Sửa tên dự án nhanh (Dùng Prompt cho đơn giản)
  const handleEditProject = async () => {
    const newName = window.prompt("Nhập tên mới cho dự án:");
    if (!newName) return; // Nếu bấm Hủy hoặc để trống thì thôi

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName,
          description: "Cập nhật từ chi tiết",
        }), // Chỉnh tham số cho khớp DTO của bạn
      });
      if (response.ok) {
        toast.success("Đã đổi tên thành công!");
        window.location.reload(); // Tải lại trang để thấy tên mới
      }
    } catch (error) {
      console.error(error);
    }
  };
  const renderStatus = (status) => {
    if (status === "UNLABELED")
      return (
        <span
          style={{ color: "#ef4444", fontSize: "13px", fontWeight: "bold" }}
        >
          🔴 Chưa gán
        </span>
      );
    if (status === "LABELED")
      return (
        <span
          style={{ color: "#f59e0b", fontSize: "13px", fontWeight: "bold" }}
        >
          🟡 Chờ duyệt
        </span>
      );
    if (status === "REJECTED")
      return (
        <span
          style={{ color: "#b91c1c", fontSize: "13px", fontWeight: "bold" }}
        >
          ❌ Bị từ chối
        </span>
      );
    return (
      <span style={{ color: "#10b981", fontSize: "13px", fontWeight: "bold" }}>
        🟢 Đã duyệt
      </span>
    );
  };

  const annotatorList = allUsers.filter((user) => {
    if (!user.roles || user.roles.length === 0) return true;
    return user.roles.some((r) => r.name === "ANNOTATOR");
  });

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
        }}
      >
        <h2>Chi tiết Dự án & Quản lý</h2>
        <button
          onClick={() => navigate("/admin/dashboard")} // 🌟 BỎ ĐOẠN ${projectId} ĐI
          style={{
            padding: "8px 15px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📈 Xem Dashboard Thống Kê
        </button>
        <button
          onClick={() => navigate("/admin/projects")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#64748b",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Quay lại danh sách
        </button>
      </div>
      <p style={{ color: "#64748b", marginTop: "10px" }}>
        <strong>Mã dự án:</strong> {projectId}
      </p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div
          style={{
            flex: 1.5,
            padding: "20px",
            border: "2px dashed #cbd5e1",
            borderRadius: "8px",
            textAlign: "center",
            backgroundColor: "#f8fafc",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>
            Kéo thả hoặc chọn ảnh từ máy tính
          </h3>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
          <button
            onClick={handleUpload}
            disabled={isLoading || selectedFiles.length === 0}
            style={{
              marginLeft: "10px",
              padding: "8px 16px",
              backgroundColor:
                isLoading || selectedFiles.length === 0 ? "#94a3b8" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {isLoading ? "Đang tải lên..." : "🚀 Upload Dữ liệu"}
          </button>
        </div>

        <div
          style={{
            flex: 2,
            padding: "20px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            backgroundColor: "#f1f5f9",
          }}
        >
          <h3 style={{ marginBottom: "15px", color: "#1e293b" }}>
            👥 Giao việc (Annotator)
          </h3>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
          >
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">-- Chọn Annotator để giao việc --</option>
              {annotatorList.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} (@{user.username})
                </option>
              ))}
            </select>

            <button
              onClick={handleAddMember}
              disabled={isAssigning}
              style={{
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              {isAssigning ? "Đang giao..." : "+ Giao việc"}
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {projectMembers.length === 0 ? (
              <p
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                Chưa có thành viên nào trong dự án.
              </p>
            ) : (
              projectMembers.map((member) => (
                <div
                  key={member.userId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    backgroundColor: "white",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <strong>{member.fullName}</strong>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      @{member.username}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                    title="Hủy giao việc"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "40px",
          borderTop: "2px solid #e2e8f0",
          paddingTop: "20px",
        }}
      >
        {/* 🌟 THÊM KHUNG CHỨA NÚT XUẤT DỮ LIỆU Ở ĐÂY */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3>Bộ dữ liệu đã tải lên ({dataset.length} ảnh)</h3>

          <button
            // 🌟 ĐỔI DÒNG NÀY ĐỂ MỞ POPUP THAY VÌ TẢI LUÔN
            onClick={() => setShowExportModal(true)}
            disabled={isExporting || dataset.length === 0}
            style={{
              padding: "10px 20px",
              backgroundColor:
                isExporting || dataset.length === 0 ? "#cbd5e1" : "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor:
                isExporting || dataset.length === 0 ? "not-allowed" : "pointer",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            {isExporting ? "⏳ Đang nén file..." : "📦 Xuất Dữ Liệu AI"}
          </button>
        </div>

        {dataset.length === 0 ? (
          <p style={{ color: "#64748b", fontStyle: "italic" }}>
            Dự án này chưa có ảnh nào. Vui lòng tải lên!
          </p>
        ) : (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {dataset.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #cbd5e1",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                  width: "220px",
                }}
              >
                <img
                  src={item.fileUrl}
                  alt={item.fileName}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={item.fileName}
                >
                  {item.fileName}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  {renderStatus(item.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showExportModal && (
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
              padding: "25px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>📦 Chọn định dạng xuất dữ liệu</h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                margin: "20px 0",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="format"
                  value="YOLO"
                  checked={exportFormat === "YOLO"}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div>
                  <strong>YOLO (.txt)</strong>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Định dạng chuẩn cho các model YOLOv5, v8, v11...
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="format"
                  value="VOC"
                  checked={exportFormat === "VOC"}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div>
                  <strong>PASCAL VOC (.xml)</strong>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Sử dụng cho Faster R-CNN, SSD...
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="format"
                  value="COCO"
                  checked={exportFormat === "COCO"}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div>
                  <strong>COCO (.json)</strong>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Gom toàn bộ dữ liệu vào 1 file annotations.json
                  </div>
                </div>
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => setShowExportModal(false)}
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
                onClick={handleConfirmExport}
                disabled={isExporting}
                style={{
                  padding: "8px 15px",
                  borderRadius: "4px",
                  border: "none",
                  background: "#3b82f6",
                  color: "white",
                  fontWeight: "bold",
                  cursor: isExporting ? "not-allowed" : "pointer",
                }}
              >
                {isExporting ? "Đang nén file..." : "Tải xuống"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
