FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files (including main.py, database/, schemas/, service/)
COPY . .

# Expose your FastAPI port
EXPOSE 10000

# Run Uvicorn pointing directly to main:app
CMD ["python", "src/main.py"]