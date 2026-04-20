import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:8080/api';

const ReviewWorkspace = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const getToken = () => localStorage.getItem('token');
    const getUserId = () => "ID_CUA_MANAGER"; // Tạm thời, sau này lấy từ Token

    const [image, setImage] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [annotations, setAnnotations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectBox, setShowRejectBox] = useState(false);

    useEffect(() => {
        fetchPendingItem();
    }, [projectId]);

    // 1. Lấy ảnh đang chờ duyệt (LABELED)
    const fetchPendingItem = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/reviews/pending/${projectId}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (data.result && data.result.length > 0) {
                const item = data.result[0];
                setCurrentItem(item);
                loadHtmlImage(item.fileUrl);
                fetchAnnotations(item.id); // Lấy nhãn đã vẽ của ảnh này
            } else {
                alert("Không còn ảnh nào chờ duyệt!");
                navigate('/admin/projects');
            }
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    };

    // 2. Lấy danh sách nhãn Annotator đã vẽ
    const fetchAnnotations = async (itemId) => {
        const res = await fetch(`${API_BASE_URL}/annotations/item/${itemId}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        
        // 🌟 THÊM DÒNG NÀY ĐỂ SOI XEM BACKEND ĐANG TRẢ VỀ TÊN BIẾN LÀ GÌ
        console.log("Dữ liệu Annotation từ Backend:", data.result);

        const mapped = data.result.map(ann => {
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
                color: ann.label?.color || '#ef4444', 
                labelName: ann.label?.name || 'Unknown'
            };
        });
        setAnnotations(mapped);
    };

    const loadHtmlImage = (url) => {
        const img = new window.Image();
        img.src = url;
        img.crossOrigin = 'Anonymous';
        img.onload = () => setImage(img);
    };

    // 3. Xử lý Duyệt (Approve)
    const handleApprove = async () => {
        await fetch(`${API_BASE_URL}/reviews/${currentItem.id}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        fetchPendingItem(); // Tự động sang ảnh tiếp theo
    };

    // 4. Xử lý Từ chối (Reject)
    const handleReject = async () => {
        if (!rejectReason) return alert("Vui lòng nhập lý do từ chối!");
        
        try {
            const res = await fetch(`${API_BASE_URL}/reviews/${currentItem.id}/reject`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                // 🌟 GỬI ĐÚNG 1 TRƯỜNG DỮ LIỆU NÀY CHO KHỚP VỚI DTO
                body: JSON.stringify({ rejectReason: rejectReason }) 
            });

            if (res.ok) {
                alert("Đã gửi phản hồi từ chối cho Annotator!");
                setShowRejectBox(false);
                setRejectReason("");
                fetchPendingItem(); // Chuyển sang ảnh tiếp theo
            } else {
                console.error("Lỗi từ Backend");
            }
        } catch (err) {
            console.error("Lỗi kết nối", err);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
            <div style={{ flex: 3, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2>🔍 Màn hình Duyệt Nhãn</h2>
                <div style={{ border: '2px solid #334155', backgroundColor: 'white' }}>
                    <Stage width={800} height={600}>
                        <Layer>
                            {image && <KonvaImage image={image} width={800} height={600} />}
                            {annotations.map((ann, i) => (
                                <Rect key={i} x={ann.x} y={ann.y} width={ann.width} height={ann.height} 
                                      stroke={ann.color} strokeWidth={3} fill={ann.color + "33"} />
                            ))}
                        </Layer>
                    </Stage>
                </div>
            </div>

            <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderLeft: '1px solid #ddd' }}>
                <h3>Thông tin ảnh</h3>
                <p>Tên file: {currentItem?.fileName}</p>
                <hr/>
                <button onClick={handleApprove} style={{ width: '100%', padding: '15px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ✅ PHÊ DUYỆT (APPROVE)
                </button>

                <button onClick={() => setShowRejectBox(true)} style={{ width: '100%', padding: '15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                    ❌ TỪ CHỐI (REJECT)
                </button>

                {showRejectBox && (
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                        <label>Lý do từ chối:</label>
                        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} style={{ width: '100%', height: '80px', marginTop: '5px' }} placeholder="Ví dụ: Vẽ khung quá rộng, sai nhãn..."></textarea>
                        <button onClick={handleReject} style={{ marginTop: '10px', padding: '8px', backgroundColor: '#b91c1c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Gửi phản hồi</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewWorkspace;