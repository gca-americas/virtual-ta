# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    -i https://pypi.org/simple/ \
    --extra-index-url https://us-python.pkg.dev/artifact-foundry-prod/ah-3p-staging-python/simple/

# Copy application code
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY .env .

# Expose the port (Cloud Run will override this with its own $PORT)
EXPOSE 8080

# Command to run the application using uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
