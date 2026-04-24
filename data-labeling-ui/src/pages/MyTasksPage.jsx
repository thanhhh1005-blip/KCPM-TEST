import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:8080/api";

const MyTasksPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("token");

  // Hàm giải mã Token để biết Role
  const getUserRole = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const roles = payload.scope || payload.role || payload.roles || "";
      if (roles.includes("REVIEWER")) return "REVIEWER";
      if (roles.includes("ANNOTATOR")) return "ANNOTATOR";
      return null;
    } catch (e) {
      return null;
    }
  };

  const role = getUserRole();

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    setIsLoading(true);
    try {
      let endpoint = "";
      if (role === "REVIEWER") {
        endpoint = `${API_BASE_URL}/projects/reviewer/my-projects`;
      } else {
        endpoint = `${API_BASE_URL}/projects/my-projects`;
      }

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (data.result) {
        setProjects(data.result);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách dự án:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎯 Nhiệm vụ của tôi ({role})</h2>

      {isLoading ? (
        <p>Đang tải dữ liệu...</p>
      ) : projects.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            border: "1px dashed #ccc",
            borderRadius: "8px",
            backgroundColor: "white",
          }}
        >
          <h3>Bạn chưa được phân công vào dự án nào.</h3>
          <p>Hãy liên hệ với Manager nếu bạn nghĩ đây là lỗi.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {projects.map((project) => {
            // ==========================================
            // 🌟 LOGIC TRẠNG THÁI HOÀN CHỈNH
            // ==========================================

            // 1. Các trạng thái tổng quan
            const isCompleted = project.status === "COMPLETED"; // Admin đã đóng dự án
            const isEmpty = project.dataItemCount === 0; // Dự án chưa có ảnh nào
            const isAllApproved =
              project.dataItemCount > 0 &&
              project.approvedItemCount === project.dataItemCount; // Đã duyệt xong 100%

            // 2. Logic cho Annotator
            const isWaitingToLabel =
              role === "ANNOTATOR" &&
              project.pendingItemCount > 0 &&
              !isCompleted &&
              !isAllApproved;
            const isAnnotatorWaitingReview =
              role === "ANNOTATOR" &&
              project.pendingItemCount === 0 &&
              !isAllApproved &&
              !isEmpty &&
              !isCompleted;

            // 3. Logic cho Reviewer
            const isReviewerHasWork =
              role === "REVIEWER" &&
              project.pendingItemCount > 0 &&
              !isCompleted &&
              !isAllApproved;
            const isReviewerWaiting =
              role === "REVIEWER" &&
              project.pendingItemCount === 0 &&
              !isAllApproved &&
              !isEmpty &&
              !isCompleted;

            // Điều kiện để khóa nút bấm (Không khóa nếu isAllApproved để user vào xem kết quả)
            const isButtonDisabled =
              isEmpty ||
              (role === "REVIEWER" && isReviewerWaiting && !isCompleted);

            return (
              <div
                key={project.id}
                style={{
                  padding: "20px",
                  backgroundColor: isCompleted ? "#f8fafc" : "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  opacity: isCompleted ? 0.6 : 1, // CHỈ làm mờ khi đã bị Admin đóng
                  position: "relative",
                }}
              >
                {/* 🌟 HUY HIỆU (BADGE) GÓC PHẢI TRÊN */}
                <div
                  style={{ position: "absolute", top: "15px", right: "15px" }}
                >
                  {isCompleted ? (
                    <span
                      style={{
                        background: "#bbf7d0",
                        color: "#166534",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      ✅ Đã hoàn thành
                    </span>
                  ) : isAllApproved ? (
                    <span
                      style={{
                        background: "#bbf7d0",
                        color: "#166534",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      ✅ Đã duyệt xong
                    </span>
                  ) : isEmpty ? (
                    <span
                      style={{
                        background: "#e2e8f0",
                        color: "#475569",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      📁 Dự án trống
                    </span>
                  ) : isAnnotatorWaitingReview ? (
                    <span
                      style={{
                        background: "#bfdbfe",
                        color: "#1e3a8a",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      ⏳ Đang chờ duyệt
                    </span>
                  ) : isWaitingToLabel ? (
                    <span
                      style={{
                        background: "#fef08a",
                        color: "#854d0e",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      ⏳ Chờ gán nhãn ({project.pendingItemCount})
                    </span>
                  ) : isReviewerHasWork ? (
                    <span
                      style={{
                        background: "#fef08a",
                        color: "#854d0e",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      🔍 Cần duyệt ({project.pendingItemCount})
                    </span>
                  ) : (
                    <span
                      style={{
                        background: "#e2e8f0",
                        color: "#475569",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      ⏸️ Chờ Annotator vẽ
                    </span>
                  )}
                </div>

                <h3 style={{ marginTop: 0, paddingRight: "120px" }}>
                  {project.name}
                </h3>

                {/* Dòng Debug (Bạn có thể xóa sau khi test xong) */}
                <div
                  style={{
                    fontSize: "11px",
                    color: "red",
                    marginBottom: "10px",
                    fontWeight: "bold",
                  }}
                >
                  [Debug: Tổng {project.dataItemCount} | Pending:{" "}
                  {project.pendingItemCount} | Approved:{" "}
                  {project.approvedItemCount || 0}]
                </div>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    minHeight: "40px",
                    marginTop: 0,
                  }}
                >
                  {project.description || "Không có mô tả"}
                </p>

                {/* 🌟 NÚT BẤM ĐIỀU HƯỚNG */}
                <button
                  disabled={isButtonDisabled}
                  onClick={() =>
                    navigate(
                      role === "REVIEWER"
                        ? `/admin/review/${project.id}`
                        : `/workspace/${project.id}`,
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: isButtonDisabled
                      ? "#cbd5e1" // Xám (Khóa)
                      : isAllApproved || isAnnotatorWaitingReview
                        ? "#8b5cf6" // Tím (Xem lại / Chờ duyệt)
                        : role === "REVIEWER"
                          ? "#eab308" // Vàng (Reviewer)
                          : "#3b82f6", // Xanh (Annotator)
                    color: isButtonDisabled ? "#64748b" : "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isButtonDisabled ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {isCompleted
                    ? "Đã hoàn thành"
                    : isEmpty
                      ? "🔒 Chưa có dữ liệu"
                      : isAllApproved
                        ? "👀 Xem kết quả"
                        : isAnnotatorWaitingReview
                          ? "👀 Xem tiến độ"
                          : isWaitingToLabel
                            ? "🎨 Bắt đầu Gán Nhãn"
                            : isReviewerHasWork
                              ? "🔍 Vào Duyệt Nhãn"
                              : "🔒 Chưa có ảnh để duyệt"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
