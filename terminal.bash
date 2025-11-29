cd backend
docker build -t ai-food-app .
docker run -d -p 8000:8000 ai-food-app