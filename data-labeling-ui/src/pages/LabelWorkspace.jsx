import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Label,
  Tag,
  Text as KonvaText,
} from "react-konva";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:8080/api";

const LabelWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("token");

  // STATES QUẢN LÝ ẢNH & DỰ ÁN TỪ API
  const [image, setImage] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [isLoadingItem, setIsLoadingItem] = useState(true);

  // 🌟 STATES MỚI CHO QUẢN LÝ NHÃN (LABELS)
  const [projectLabels, setProjectLabels] = useState([]);
  const [activeLabel, setActiveLabel] = useState(null); // Nhãn đang được chọn để vẽ
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showGuideline, setShowGuideline] = useState(false);
  const [projectDescription, setProjectDescription] = useState("");

  // States quản lý việc vẽ
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });

  const [isAiLoading, setIsAiLoading] = useState(false);
  // 🌟 GỌI API LẤY DANH SÁCH NHÃN & ẢNH KHI MỞ TRANG
  useEffect(() => {
    fetchProjectLabels();
    fetchNextImage();
    fetchProjectInfo();
  }, [projectId]);

  // Hàm 1: Lấy danh sách các Nhãn (Màu sắc, Tên) của dự án này
  const fetchProjectLabels = async () => {
    try {
      // 🌟 Đổi đường dẫn URL sang gọi API chuyên lấy Label mà ta vừa viết
      const response = await fetch(
        `${API_BASE_URL}/labels/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await response.json();

      // 🌟 Chỉnh lại cách đọc dữ liệu vì API trả về mảng trực tiếp trong data.result
      if (data.result && data.result.length > 0) {
        setProjectLabels(data.result);
        setActiveLabel(data.result[0]); // Mặc định chọn nhãn đầu tiên
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhãn:", error);
    }
  };

  // Hàm 2: Lấy bức ảnh chưa gán tiếp theo
  const fetchNextImage = async () => {
    setIsLoadingItem(true);
    setImage(null);
    setAnnotations([]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/datasets/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await response.json();

      if (data.result && data.result.length > 0) {
        // 🌟 TÌM ẢNH (Bao gồm cả ảnh Mới và ảnh Bị trả về)
        const nextItem = data.result.find(
          (item) => item.status === "UNLABELED" || item.status === "REJECTED",
        );

        if (nextItem) {
          // NẾU CÒN ẢNH: Hiển thị lên để vẽ
          setCurrentItem(nextItem);
          loadHtmlImage(nextItem.fileUrl);
          setIsCompleted(false); // Đảm bảo tắt màn hình hoàn thành (nếu đang bật)
        } else {
          // NẾU HẾT ẢNH: Kích hoạt màn hình "Chờ duyệt"
          setIsCompleted(true);
        }
      } else {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Lỗi tải ảnh:", error);
    } finally {
      setIsLoadingItem(false);
    }
  };
  const fetchProjectInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      console.log("DỮ LIỆU PROJECT:", data.result);
      // Giả sử Backend trả về field 'description' hoặc 'moTa'
      if (data.result && data.result.description) {
        setProjectDescription(data.result.description);
      }
    } catch (error) {
      console.error("Lỗi tải thông tin dự án:", error);
    }
  };
  const loadHtmlImage = (url) => {
    const imgElement = new window.Image();
    imgElement.src = url;
    imgElement.crossOrigin = "Anonymous";
    imgElement.onload = () => setImage(imgElement);
  };

  // --- LOGIC VẼ KHUNG ---
  const handleMouseDown = (e) => {
    if (e.target === e.target.getStage() || !activeLabel) return;
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();

    setNewAnnotation([
      {
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        id: Date.now().toString(),
        labelId: activeLabel.id,
        color: activeLabel.color,
        labelName: activeLabel.name, // 🌟 THÊM ĐÚNG DÒNG NÀY ĐỂ LƯU TÊN NHÃN KHI VẼ TAY
      },
    ]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const point = e.target.getStage().getPointerPosition();
    setNewAnnotation((prev) => {
      const current = prev[0];
      return [
        { ...current, width: point.x - current.x, height: point.y - current.y },
      ];
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const current = newAnnotation[0];
    if (Math.abs(current.width) > 5 && Math.abs(current.height) > 5) {
      setAnnotations([...annotations, current]);
    }
    setNewAnnotation([]);
  };

  const handleDeleteSingleBox = (boxId) => {
    setAnnotations((prev) => prev.filter((box) => box.id !== boxId));
  };

  //AI handle
  const handleAiSuggest = async () => {
    if (!currentItem) return;
    setIsAiLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/datasets/ai-suggest/${currentItem.id}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await response.json();

      // NẾU AI CÓ TRẢ VỀ KẾT QUẢ
      if (data.result && data.result.length > 0) {
        
        const validAiBoxes = []; // Mảng chứa các khung hợp lệ
        let ignoredCount = 0;    // Đếm số khung bị loại bỏ

        // 1. Lặp qua kết quả AI để lọc và tính toán tọa độ
        data.result.forEach((aiBox, index) => {
          // 🌟 TÌM KIẾM NGHIÊM NGẶT: Tên AI trả về phải khớp chính xác với nhãn dự án
          const matchedLabel = projectLabels.find(
            (l) => l.name.toLowerCase() === aiBox.labelName.toLowerCase(),
          );

          if (matchedLabel) {
            // NẾU TRÙNG KHỚP -> Tính tọa độ Pixel và đưa vào mảng hợp lệ
            const pixelWidth = aiBox.width * imageSize.width;
            const pixelHeight = aiBox.height * imageSize.height;

            validAiBoxes.push({
              id: `ai_${Date.now()}_${index}`,
              labelId: matchedLabel.id,
              color: matchedLabel.color,
              labelName: matchedLabel.name,
              confidence: aiBox.confidence,
              x: aiBox.xcenter * imageSize.width - pixelWidth / 2,
              y: aiBox.ycenter * imageSize.height - pixelHeight / 2,
              width: pixelWidth,
              height: pixelHeight,
            });
          } else {
            // NẾU KHÔNG TRÙNG KHỚP -> Đếm số lượng bị loại bỏ
            ignoredCount++;
          }
        });

        // 2. XỬ LÝ GIAO DIỆN SAU KHI LỌC
        if (validAiBoxes.length > 0) {
          // Nếu có ít nhất 1 khung hợp lệ -> Vẽ lên màn hình
          setAnnotations((prev) => [...prev, ...validAiBoxes]);
          toast.success(`🤖 AI đã tìm thấy và gán đúng ${validAiBoxes.length} vật thể!`);
          
          // Báo thêm nếu có vật thể bị bỏ qua do lệch nhãn
          if (ignoredCount > 0) {
            toast.info(`Đã bỏ qua ${ignoredCount} vật thể do không có nhãn phù hợp trong dự án.`);
          }
        } else {
          // AI có nhìn thấy vật thể, nhưng KHÔNG CÓ CÁI NÀO TRÙNG VỚI NHÃN CỦA DỰ ÁN
          toast.warning(
            "🤖 AI phát hiện được vật thể, nhưng không khớp với nhãn nào của dự án (hoặc AI chưa được train cho nhãn này)!"
          );
        }

      } else {
        // AI TRẢ VỀ MẢNG RỖNG (Không nhìn thấy gì cả)
        toast.info("🤖 AI không nhận diện được vật thể nào trong bức ảnh này.");
      }
    } catch (error) {
      console.error("Lỗi AI:", error);
      toast.error("Lỗi kết nối với Server AI.");
    } finally {
      setIsAiLoading(false);
    }
  };
  // --- LOGIC LƯU LÊN DATABASE & CHUYỂN ẢNH TỰ ĐỘNG ---
  const handleSave = async () => {
    if (annotations.length === 0) {
      toast.warning("Vui lòng vẽ ít nhất 1 nhãn!");
      return;
    }
    if (!currentItem) {
      toast.error("Lỗi: Không tìm thấy ID của bức ảnh!");
      return;
    }

    // Tính tọa độ YOLO
    const yoloAnnotations = annotations.map((box) => {
      const absWidth = Math.abs(box.width);
      const absHeight = Math.abs(box.height);
      const startX = box.width < 0 ? box.x + box.width : box.x;
      const startY = box.height < 0 ? box.y + box.height : box.y;

      return {
        labelId: box.labelId, // 🌟 Đã lấy ID Nhãn thật từ khung vẽ
        xcenter: (startX + absWidth / 2) / imageSize.width,
        ycenter: (startY + absHeight / 2) / imageSize.height,
        width: absWidth / imageSize.width,
        height: absHeight / imageSize.height,
      };
    });

    const payload = {
      dataItemId: currentItem.id,
      annotations: yoloAnnotations,
    };

    setIsSaving(true);
    try {
      // 🌟 GỌI API LƯU NHÃN (AnnotationController mà chúng ta đã làm ở Backend)
      const response = await fetch(`${API_BASE_URL}/annotations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // 🎉 LƯU THÀNH CÔNG -> TỰ ĐỘNG TẢI ẢNH TIẾP THEO
        fetchNextImage();
      } else {
        const errorData = await response.json();
        toast.warning("Bức ảnh này vừa được người khác nộp xong.");
        setTimeout(() => {
          fetchNextImage(); // Sau 3s mới thực hiện lệnh này
        }, 3000);
      }
    } catch (error) {
      toast.error("Lỗi kết nối khi lưu nhãn");
    } finally {
      setIsSaving(false);
    }
  };

  // Hàm phụ trợ tạo chuỗi màu rgba trong suốt
  const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    let r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  if (isCompleted) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f1f5f9",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{ color: "#10b981", fontSize: "28px", marginBottom: "15px" }}
          >
            🎉 Hoàn thành xuất sắc!
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "16px",
              marginBottom: "30px",
              lineHeight: "1.5",
            }}
          >
            Bạn đã gán nhãn xong tất cả các ảnh trong dự án này.
            <br />
            Dữ liệu đã được nộp và đang chờ Manager kiểm duyệt.
          </p>
          <button
            onClick={() => navigate("/my-tasks")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            ⬅️ Quay về Danh sách Nhiệm vụ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#f1f5f9" }}
    >
      {/* KHU VỰC VẼ CANVAS */}
      <div
        style={{
          flex: 3,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "800px",
            marginBottom: "10px",
          }}
        >
          <h2>🎨 Giao diện Gán Nhãn</h2>
          <button
            onClick={() => navigate("/my-tasks")}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            Quay lại
          </button>
        </div>

        {currentItem?.status === "REJECTED" && (
          <div
            style={{
              width: "760px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              padding: "15px 20px",
              borderRadius: "8px",
              marginBottom: "15px",
              border: "1px solid #fca5a5",
              boxShadow: "0 2px 4px rgba(220, 38, 38, 0.1)",
            }}
          >
            <strong style={{ fontSize: "16px" }}>
              ⚠️ ẢNH NÀY BỊ YÊU CẦU VẼ LẠI!
            </strong>
            <p style={{ margin: "5px 0 0 0", fontSize: "15px" }}>
              <strong>Lý do từ chối:</strong>{" "}
              {currentItem.rejectReason || "Không có lý do cụ thể"}
            </p>
          </div>
        )}

        {isLoadingItem ? (
          <div style={{ padding: "50px", fontSize: "18px", color: "#64748b" }}>
            Đang tải dữ liệu...
          </div>
        ) : (
          <div
            style={{
              border: "2px solid #cbd5e1",
              backgroundColor: "white",
              cursor: "crosshair",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          >
            <Stage
              width={imageSize.width}
              height={imageSize.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <Layer>
                {image && (
                  <KonvaImage
                    image={image}
                    width={imageSize.width}
                    height={imageSize.height}
                  />
                )}

                {/* 🌟 ĐÃ SỬA: Vẽ các khung ĐÃ vẽ kèm BẢNG TÊN & % */}
                {annotations.map((rect, i) => {
                  const startX = rect.width < 0 ? rect.x + rect.width : rect.x;
                  const startY =
                    rect.height < 0 ? rect.y + rect.height : rect.y;

                  return (
                    <React.Fragment key={rect.id || i}>
                      <Rect
                        x={rect.x}
                        y={rect.y}
                        width={rect.width}
                        height={rect.height}
                        fill={hexToRgba(rect.color, 0.3)}
                        stroke={rect.color || "#3b82f6"}
                        strokeWidth={2}
                        onDblClick={() => handleDeleteSingleBox(rect.id)} // 🌟 THÊM DÒNG NÀY
                        // Thêm cursor pointer để báo hiệu có thể click
                        onMouseEnter={(e) => {
                          e.target.getStage().container().style.cursor =
                            "pointer";
                        }}
                        onMouseLeave={(e) => {
                          e.target.getStage().container().style.cursor =
                            "crosshair";
                        }}
                      />
                      {(rect.labelName || rect.confidence) && (
                        <Label x={startX} y={startY - 24}>
                          <Tag
                            fill={rect.color || "#3b82f6"}
                            cornerRadius={3}
                          />
                          <KonvaText
                            text={`${rect.labelName || "Khung"}${rect.confidence ? ` ${rect.confidence}%` : ""}`}
                            fill="white"
                            fontSize={14}
                            padding={4}
                            fontStyle="bold"
                          />
                        </Label>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Vẽ khung ĐANG kéo chuột */}
                {newAnnotation.map((rect, i) => (
                  <Rect
                    key={i}
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    fill={hexToRgba(rect.color, 0.3)}
                    stroke={rect.color || "#10b981"}
                    strokeWidth={2}
                    dash={[5, 5]}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        )}
      </div>

      {/* THANH CÔNG CỤ (BÊN PHẢI) */}
      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          borderLeft: "1px solid #e2e8f0",
          padding: "20px",
        }}
      >
        <h3>Danh sách Nhãn (Labels)</h3>
        <p style={{ fontSize: "13px", color: "#64748b" }}>
          Click để chọn nhãn trước khi vẽ khung
        </p>

        {/* GIAO DIỆN CHỌN NHÃN (LABEL SELECTOR) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "30px",
          }}
        >
          {projectLabels.length === 0 ? (
            <span style={{ color: "red", fontSize: "14px" }}>
              Dự án này chưa cấu hình Nhãn!
            </span>
          ) : (
            projectLabels.map((label) => (
              <div
                key={label.id}
                onClick={() => setActiveLabel(label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  border: "2px solid",
                  borderColor:
                    activeLabel?.id === label.id ? label.color : "transparent",
                  backgroundColor:
                    activeLabel?.id === label.id
                      ? hexToRgba(label.color, 0.1)
                      : "#f8fafc",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: label.color,
                    borderRadius: "4px",
                  }}
                ></div>
                <span
                  style={{
                    fontWeight:
                      activeLabel?.id === label.id ? "bold" : "normal",
                  }}
                >
                  {label.name}
                </span>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: "1px solid #e2e8f0", margin: "20px 0" }}></div>

        <h3>Công cụ</h3>

        <p style={{ color: "#64748b", fontSize: "14px" }}>
          - Khung đã vẽ: <strong>{annotations.length}</strong>
        </p>
        <button
          onClick={() => setShowGuideline(true)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            backgroundColor: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          📖 Xem Hướng dẫn gán nhãn
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving || !currentItem}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            backgroundColor: isSaving ? "#94a3b8" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: isSaving ? "not-allowed" : "pointer",
          }}
        >
          {isSaving ? "Đang lưu..." : "💾 Lưu & Chuyển ảnh tiếp theo"}
        </button>

        <button
          onClick={handleAiSuggest}
          disabled={isAiLoading || !currentItem}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            backgroundColor: isAiLoading ? "#cbd5e1" : "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: isAiLoading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 6px -1px rgba(139, 92, 246, 0.3)",
          }}
        >
          {isAiLoading ? "🤖 AI Đang phân tích..." : "✨ Dùng AI Gợi Ý Khung"}
        </button>

        <button
          onClick={() => setAnnotations([])}
          disabled={isSaving}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          🗑️ Xóa nhãn vẽ lại
        </button>

        {showGuideline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '12px',
            width: '650px', maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1e293b' }}>📖 Hướng dẫn gán nhãn</h2>
              <button 
                onClick={() => setShowGuideline(false)} 
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >✖</button>
            </div>
            
            <div style={{ lineHeight: '1.6', color: '#334155' }}>
              
              {/* 🌟 PHẦN 1: MÔ TẢ ĐẶC THÙ TỪ MANAGER (Lấy từ DB) */}
              <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '4px', marginBottom: '25px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎯 Yêu cầu cụ thể của dự án:
                </h4>
                {/* Dùng whiteSpace: pre-wrap để giữ nguyên các dấu xuống dòng của Manager */}
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontStyle: projectDescription ? 'normal' : 'italic', color: projectDescription ? '#1e293b' : '#94a3b8' }}>
                  {projectDescription || "Manager không để lại mô tả chi tiết cho dự án này."}
                </p>
              </div>

              {/* 🌟 PHẦN 2: QUY TẮC CHUẨN CỦA HỆ THỐNG */}
              <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>💡 Nguyên tắc gán nhãn chuẩn mực:</h4>
              <ul style={{ paddingLeft: '20px', marginTop: '0' }}>
                <li style={{ marginBottom: '8px' }}>Khung vẽ phải <strong>ôm sát</strong> lề của vật thể, không để thừa quá nhiều khoảng trống.</li>
                <li style={{ marginBottom: '8px' }}>Nếu vật thể bị che khuất một phần, chỉ vẽ khung cho <strong>phần nhìn thấy được</strong>.</li>
                <li style={{ marginBottom: '8px' }}>Sử dụng đúng nhãn (Label) cho từng loại đối tượng.</li>
                <li>Dùng công cụ <strong>AI Gợi Ý</strong> để tăng tốc độ, nhưng luôn kiểm tra lại.</li>
              </ul>
              
              <div style={{ backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginTop: '20px', border: '1px dashed #fca5a5' }}>
                <p style={{ margin: 0, color: '#b91c1c', fontSize: '14px' }}>
                  <strong>* Mẹo thao tác:</strong> Click đúp chuột (Double-click) vào khung trên ảnh để xóa nếu AI vẽ sai hoặc bạn vẽ nhầm.
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '25px', textAlign: 'right' }}>
              <button 
                onClick={() => setShowGuideline(false)}
                style={{ padding: '10px 25px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
              >Đã hiểu & Bắt đầu vẽ</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default LabelWorkspace;
