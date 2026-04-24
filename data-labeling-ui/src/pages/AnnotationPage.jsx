import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";

const AnnotationPage = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [boxes, setBoxes] = useState([]);
  const [currentBox, setCurrentBox] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(0);

  const labels = ["Car", "Motorbike", "Pedestrian", "Truck"];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800";

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      boxes.forEach((box) => {
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        ctx.fillStyle = "#00ff00";
        ctx.font = "16px Arial";
        ctx.fillText(labels[box.labelId], box.x, box.y - 5);
      });
      if (currentBox) {
        ctx.strokeStyle = "#ff0000";
        ctx.setLineDash([5]);
        ctx.strokeRect(
          currentBox.x,
          currentBox.y,
          currentBox.width,
          currentBox.height,
        );
        ctx.setLineDash([]);
      }
    };
  }, [boxes, currentBox]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setCurrentBox({
      x: startPos.x,
      y: startPos.y,
      width: e.clientX - rect.left - startPos.x,
      height: e.clientY - rect.top - startPos.y,
      labelId: selectedLabel,
    });
  };

  const handleMouseUp = () => {
    if (currentBox && Math.abs(currentBox.width) > 5) {
      setBoxes([...boxes, currentBox]);
    }
    setIsDrawing(false);
    setCurrentBox(null);
  };

  // --- HÀM KẾT NỐI BACKEND (ĐÃ CẬP NHẬT) ---
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const taskId = "1";

    // 1. Kiểm tra Token ngay tại Frontend để tránh gửi request rác
    if (!token) {
      toast.error(
        "Lỗi: Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!",
      );
      return;
    }

    const requestBody = {
      taskId: taskId,
      annotations: boxes.map((b) => ({
        labelId: b.labelId,
        xcenter: (b.x + b.width / 2) / 800,
        ycenter: (b.y + b.height / 2) / 550,
        width: Math.abs(b.width) / 800,
        height: Math.abs(b.height) / 550,
      })),
    };

    try {
      const response = await fetch("http://localhost:8080/api/annotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 2. Đảm bảo gửi kèm Token theo chuẩn Bearer
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Kiểm tra nếu Token hết hạn (401) hoặc không có quyền (403)
      if (response.status === 401 || response.status === 403) {
        toast.error("Lỗi bảo mật: Bạn không có quyền thực hiện hành động này!");
        return;
      }

      const data = await response.json();

      if (response.ok) {
        toast.success("Lưu dữ liệu gán nhãn thành công!");
      } else {
        // Hiển thị lỗi cụ thể từ Backend trả về
        toast.error(
          "Lỗi từ hệ thống: " + (data.message || "Yêu cầu không hợp lệ"),
        );
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error(
        "Không kết nối được server Java! Hãy kiểm tra Backend đã chạy chưa.",
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>✏️ Nhiệm vụ gán nhãn dữ liệu</h2>
      <div style={{ display: "flex", gap: "30px" }}>
        <div
          style={{
            background: "#fff",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={550}
            style={{ cursor: "crosshair" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>
        <div
          style={{
            width: "300px",
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3>1. Chọn nhãn</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {labels.map((label, index) => (
              <button
                key={index}
                onClick={() => setSelectedLabel(index)}
                style={{
                  padding: "10px",
                  backgroundColor: selectedLabel === index ? "#4A90E2" : "#fff",
                  color: selectedLabel === index ? "#fff" : "#000",
                  cursor: "pointer",
                }}
              >
                {index}. {label}
              </button>
            ))}
          </div>
          <hr />
          <button
            onClick={() => setBoxes([])}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#e74c3c",
              color: "#fff",
              marginBottom: "10px",
              cursor: "pointer",
            }}
          >
            Xóa tất cả
          </button>
          <button
            onClick={handleSave}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#27ae60",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Hoàn thành & Lưu nhãn
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnotationPage;
