import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:8080/api";

const ReviewWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("token");
  const getUserId = () => "ID_CUA_MANAGER"; // Tạm thời, sau này lấy từ Token

  const [image, setImage] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [errorCategory, setErrorCategory] = useState("SAI_TOA_DO");
  const [showRejectBox, setShowRejectBox] = useState(false);

  useEffect(() => {
    fetchPendingItem();
  }, [projectId]);

  // 1. Lấy ảnh đang chờ duyệt (LABELED)
  const fetchPendingItem = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/pending/${projectId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.result && data.result.length > 0) {
        const item = data.result[0];
        setCurrentItem(item);
        loadHtmlImage(item.fileUrl);
        fetchAnnotations(item.id); // Lấy nhãn đã vẽ của ảnh này
      } else {
        toast.info("Không còn ảnh nào chờ duyệt!");
        navigate("/my-tasks");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Lấy danh sách nhãn Annotator đã vẽ
  const fetchAnnotations = async (itemId) => {
    const res = await fetch(`${API_BASE_URL}/annotations/item/${itemId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();

    // 🌟 THÊM DÒNG NÀY ĐỂ SOI XEM BACKEND ĐANG TRẢ VỀ TÊN BIẾN LÀ GÌ
    console.log("Dữ liệu Annotation từ Backend:", data.result);

    const mapped = data.result.map((ann) => {
      // 🌟 "Phòng thủ": Lấy cả viết hoa lẫn viết thường, nếu không có thì cho bằng 0
      const xc = ann.xcenter !== undefined ? ann.xcenter : ann.xCenter;
      const yc = ann.ycenter !== undefined ? ann.ycenter : ann.yCenter;
      const w = ann.width;
      const h = ann.height;

      return {
        x: (xc - w / 2) * 800,
        y: (yc - h / 2) * 600,
        width: w * 800,
        height: h * 600,
        color: ann.label?.color || "#ef4444",
        labelName: ann.label?.name || "Unknown",
      };
    });
    setAnnotations(mapped);
  };

  const loadHtmlImage = (url) => {
    const img = new window.Image();
    img.src = url;
    img.crossOrigin = "Anonymous";
    img.onload = () => setImage(img);
  };

  // 3. Xử lý Duyệt (Approve)
  const handleApprove = async () => {
    await fetch(`${API_BASE_URL}/reviews/${currentItem.id}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchPendingItem(); // Tự động sang ảnh tiếp theo
  };

  // 4. Xử lý Từ chối (Reject)
  const handleReject = async () => {
    // 1. Kiểm tra: Bắt buộc nhập lý do nếu chọn lỗi "Khác"
    if (errorCategory === "KHAC" && !rejectReason.trim()) {
      toast.warning("Vui lòng nhập chi tiết lý do lỗi!");
      return;
    }

    // 2. Tự động ghép: [LOẠI LỖI] + Chi tiết lý do
    // Nếu có gõ chữ thì ghép vào, không gõ thì chỉ gửi [LOẠI LỖI]
    const finalReason = rejectReason.trim()
      ? `[${errorCategory}] ${rejectReason.trim()}`
      : `[${errorCategory}]`;

    try {
      const res = await fetch(
        `${API_BASE_URL}/reviews/${currentItem.id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          // 🌟 Gửi trường rejectReason nhưng chứa chuỗi đã ghép cực kỳ xịn sò
          body: JSON.stringify({ rejectReason: finalReason }),
        },
      );

      if (res.ok) {
        toast.success("Đã gửi phản hồi từ chối cho Annotator!");
        setShowRejectBox(false);
        setRejectReason(""); // Xóa text đi để duyệt ảnh sau không bị dính
        fetchPendingItem(); // Chuyển sang ảnh tiếp theo
      } else {
        toast.error("Có lỗi xảy ra từ phía Server khi từ chối ảnh!");
        console.error("Lỗi từ Backend");
      }
    } catch (err) {
      toast.error("Lỗi kết nối mạng!");
      console.error("Lỗi kết nối", err);
    }
  };

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#f1f5f9" }}
    >
      <div
        style={{
          flex: 3,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>🔍 Màn hình Duyệt Nhãn</h2>
        <div style={{ border: "2px solid #334155", backgroundColor: "white" }}>
          <Stage width={800} height={600}>
            <Layer>
              {image && <KonvaImage image={image} width={800} height={600} />}
              {annotations.map((ann, i) => (
                <Rect
                  key={i}
                  x={ann.x}
                  y={ann.y}
                  width={ann.width}
                  height={ann.height}
                  stroke={ann.color}
                  strokeWidth={3}
                  fill={ann.color + "33"}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          padding: "20px",
          borderLeft: "1px solid #ddd",
        }}
      >
        <h3>Thông tin ảnh</h3>
        <p>Tên file: {currentItem?.fileName}</p>
        <hr />
        <button
          onClick={handleApprove}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ✅ PHÊ DUYỆT (APPROVE)
        </button>

        <button
          onClick={() => setShowRejectBox(true)}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          ❌ TỪ CHỐI (REJECT)
        </button>

        {showRejectBox && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              backgroundColor: "#fee2e2",
              borderRadius: "8px",
              border: "1px solid #fca5a5",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h4
              style={{
                margin: "0 0 15px 0",
                color: "#b91c1c",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ⚠️ Trả về yêu cầu làm lại
            </h4>

            <label
              style={{ fontWeight: "bold", fontSize: "14px", color: "#7f1d1d" }}
            >
              1. Chọn loại lỗi (Bắt buộc):
            </label>
            <select
              value={errorCategory}
              onChange={(e) => setErrorCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "8px",
                marginBottom: "15px",
                borderRadius: "6px",
                border: "1px solid #f87171",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              <option value="SAI_TOA_DO">
                📐 Sai tọa độ (Vẽ lệch, viền khung to/nhỏ quá)
              </option>
              <option value="SAI_NHAN">
                🔴 Chọn sai nhãn (Nhầm tên vật thể)
              </option>
              <option value="BO_SOT">
                👁️ Bỏ sót (Có vật thể nhưng quên không vẽ)
              </option>
              <option value="KHAC">📝 Lỗi khác...</option>
            </select>

            <label
              style={{ fontWeight: "bold", fontSize: "14px", color: "#7f1d1d" }}
            >
              2. Chi tiết thêm (Tùy chọn):
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                width: "100%",
                height: "70px",
                marginTop: "8px",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #f87171",
                resize: "vertical",
              }}
              placeholder={
                errorCategory === "KHAC"
                  ? "Bắt buộc nhập lý do vào đây..."
                  : "Ví dụ: Khung ở góc trái dưới cùng vẽ hơi rộng..."
              }
            ></textarea>

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button
                onClick={handleReject}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#b91c1c",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                📤 Gửi phản hồi
              </button>
              {/* Thêm nút Hủy để lỡ bấm nhầm thì tắt đi được */}
              <button
                onClick={() => setShowRejectBox(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#fca5a5",
                  color: "#7f1d1d",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewWorkspace;
