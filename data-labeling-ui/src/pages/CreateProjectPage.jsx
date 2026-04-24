import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:8080/api";

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("token");

  // 🌟 HÀM GIẢI MÃ TOKEN ĐỂ KIỂM TRA ROLE
  const checkIsAdmin = () => {
    const token = getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const roles = payload.scope || payload.role || payload.roles || "";
      return roles.includes("ADMIN");
    } catch (e) {
      return false;
    }
  };
  const isAdmin = checkIsAdmin();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    managerId: "",
    reviewerId: "", // 🌟 Thêm reviewerId vào state
  });

  const [labels, setLabels] = useState([{ name: "", color: "#ef4444" }]);
  const [isLoading, setIsLoading] = useState(false);

  // Tách riêng danh sách Manager và Reviewer
  const [managers, setManagers] = useState([]);
  const [reviewers, setReviewers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // 🌟 THÊM ?size=1000 VÀO URL: Ép lấy tối đa 1000 user để không bị sót Reviewer nằm ở trang sau
      const response = await fetch(`${API_BASE_URL}/users?size=1000`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();

      if (data.result) {
        // Trích xuất an toàn dù Backend có phân trang hay không
        const userArray = data.result.content ? data.result.content : data.result;

        // 🌟 DÙNG .includes() ĐỂ BẮT ĐƯỢC CẢ "REVIEWER" LẪN "ROLE_REVIEWER"
        const managerList = userArray.filter(
          (user) => user.roles && user.roles.some((r) => r.name.includes("MANAGER")),
        );
        const reviewerList = userArray.filter(
          (user) => user.roles && user.roles.some((r) => r.name.includes("REVIEWER")),
        );

        setManagers(managerList);
        setReviewers(reviewerList);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách User:", error);
    }
  };

  const addLabelRow = () => {
    setLabels([...labels, { name: "", color: "#3b82f6" }]);
  };

  const handleLabelChange = (index, field, value) => {
    const newLabels = [...labels];
    newLabels[index][field] = value;
    setLabels(newLabels);
  };

  const removeLabelRow = (index) => {
    const newLabels = labels.filter((_, i) => i !== index);
    setLabels(newLabels);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (isAdmin && !formData.managerId) {
      toast.warning("Admin vui lòng chỉ định một Manager cho dự án này!");
      return;
    }
    if (!formData.reviewerId) {
      toast.warning("Vui lòng chỉ định một Reviewer để duyệt nhãn!");
      return;
    }

    const validLabels = labels.filter((label) => label.name.trim() !== "");

    const payload = {
      ...formData,
      labels: validLabels,
    };

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Tạo dự án thành công!");
        navigate("/admin/projects");
      } else {
        const errorData = await response.json();
        toast.error("Lỗi: " + (errorData.message || "Không thể tạo dự án"));
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h2>Tạo Dự án Mới</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* Phần Thông tin chung */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            padding: "15px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            backgroundColor: "#f8fafc",
          }}
        >
          <h3 style={{ margin: 0, color: "#1e293b", fontSize: "16px" }}>
            1. Thông tin chung
          </h3>
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Tên dự án <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Mô tả chi tiết
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                minHeight: "80px",
              }}
            />
          </div>

          {/* 🌟 CHỈ HIỂN THỊ Ô NÀY NẾU LÀ ADMIN */}
          {isAdmin && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Chỉ định Manager quản lý <span style={{ color: "red" }}>*</span>
              </label>
              <select
                required
                value={formData.managerId}
                onChange={(e) =>
                  setFormData({ ...formData, managerId: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "white",
                }}
              >
                <option value="">-- Chọn Manager --</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.lastName} {m.firstName} (@{m.username})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 🌟 Ô CHỈ ĐỊNH REVIEWER (AI CŨNG THẤY) */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Chỉ định Reviewer (Người duyệt){" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            <select
              required
              value={formData.reviewerId}
              onChange={(e) =>
                setFormData({ ...formData, reviewerId: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "2px solid #3b82f6",
                borderRadius: "4px",
                backgroundColor: "white",
              }}
            >
              <option value="">-- Chọn Reviewer --</option>
              {reviewers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.lastName} {r.firstName} (@{r.username})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Phần Nhãn giữ nguyên như cũ của bạn */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "15px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            backgroundColor: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, color: "#1e293b", fontSize: "16px" }}>
              2. Bộ Nhãn Dữ Liệu (Labels)
            </h3>
            <button
              type="button"
              onClick={addLabelRow}
              style={{
                padding: "6px 12px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              + Thêm nhãn
            </button>
          </div>

          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Định nghĩa các nhãn (VD: Dog, Cat, Car) mà Annotator sẽ dùng để phân
            loại trong dự án này.
          </p>

          {labels.map((label, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <input
                type="color"
                value={label.color}
                onChange={(e) =>
                  handleLabelChange(index, "color", e.target.value)
                }
                style={{
                  width: "40px",
                  height: "38px",
                  padding: "0",
                  border: "none",
                  cursor: "pointer",
                }}
                title="Chọn màu hiển thị"
              />
              <input
                type="text"
                placeholder="Tên nhãn (Ví dụ: Chó, Mèo...)"
                value={label.name}
                onChange={(e) =>
                  handleLabelChange(index, "name", e.target.value)
                }
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
                required
              />
              {labels.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLabelRow(index)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  title="Xóa nhãn này"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "12px",
            backgroundColor: isLoading ? "#94a3b8" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {isLoading ? "Đang tạo dự án..." : "🚀 Hoàn tất Tạo Dự án"}
        </button>
      </form>
    </div>
  );
};

export default CreateProjectPage;
