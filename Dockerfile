# Use official Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project files
COPY backend/ ./backend/
COPY backend/manage.py ./manage.py

# Collect static files (optional, if you use collectstatic)
# RUN python manage.py collectstatic --noinput

# Expose port (default Django runserver)
EXPOSE 8000

# Run migrations and start gunicorn on port 10000 (Render requirement)
CMD ["sh", "-c", "cd backend && python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:10000"]