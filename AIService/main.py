from fastapi import FastAPI
from pydantic import BaseModel
from ultralytics import YOLO
import urllib.request
import cv2
import numpy as np

app = FastAPI()

# Tự động tải model YOLOv8 phiên bản nhẹ nhất (Nano)
model = YOLO("yolov8n.pt") 

# Khai báo cấu trúc dữ liệu nhận vào (Chỉ cần 1 cái Link ảnh)
class ImageRequest(BaseModel):
    url: str

@app.post("/predict")
def predict_image(req: ImageRequest):
    try:
        # 1. Tải ảnh từ Cloudinary URL về bộ nhớ Python
        resp = urllib.request.urlopen(req.url)
        image = np.asarray(bytearray(resp.read()), dtype="uint8")
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)

        # 2. Đưa ảnh cho YOLO quét
        results = model(image)
        
        # 3. Đọc kết quả và chuyển về chuẩn JSON
        boxes = []
        for result in results:
            for box in result.boxes:
                # Lấy tọa độ
                x, y, w, h = box.xywhn[0].tolist()
                
                # Lấy tên nhãn
                class_id = int(box.cls[0].item())
                class_name = model.names[class_id]
                
                # 🌟 LẤY TỈ LỆ % TỰ TIN (Nhân 100 và làm tròn 1 chữ số)
                conf = round(float(box.conf[0].item()) * 100, 1)
                
                boxes.append({
                    "labelName": class_name,
                    "confidence": conf, # 🌟 Gửi thêm số % này về
                    "xcenter": x,
                    "ycenter": y,
                    "width": w,
                    "height": h
                })
                
        return {"result": boxes}
        
    except Exception as e:
        return {"error": str(e)}

# Lệnh để chạy server: uvicorn main:app --reload --port 8000