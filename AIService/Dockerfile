FROM python:3.11-slim

WORKDIR /app

# Cài system dependencies cho OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements trước để cache layer pip install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code và model
COPY main.py .
COPY yolov8n.pt .

# Expose port
EXPOSE 8000

# Chạy FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
