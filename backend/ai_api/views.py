from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .models import FoodFeedbackSample, FoodLabel
from django.conf import settings
import torch
import torchvision
from torchvision import transforms
from PIL import Image
import io
import os
from rest_framework import serializers
from rest_framework.decorators import api_view
from rest_framework.reverse import reverse
from .serializers import FoodFeedbackSampleSerializer, ImageOnlySerializer, FoodLabelSerializer
from rest_framework.permissions import IsAdminUser
import subprocess
from rest_framework import generics, permissions
from datetime import datetime

# Load class names dynamically from database
def get_class_names():
    """Get class names from FoodLabel database table"""
    try:
        return list(FoodLabel.objects.order_by('name').values_list('name', flat=True))
    except Exception:
        return []

def get_num_classes():
    """Get number of classes from database"""
    try:
        return FoodLabel.objects.count()
    except Exception:
        return 0

# Load model and class names from database
MODEL_PATH = os.path.join(settings.BASE_DIR, 'efficientnet_food_classifier.pth')

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# مدل را فقط یکبار بارگذاری کن
model = None
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def load_model():
    global model
    class_names = get_class_names()
    num_classes = get_num_classes()
    
    if model is None and os.path.exists(MODEL_PATH) and num_classes > 0:
        try:
            model = torchvision.models.efficientnet_b0(weights=None)
            model.classifier[1] = torch.nn.Linear(in_features=1280, out_features=num_classes)
            model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
            model.eval()
            model.to(device)
        except Exception as e:
            print(f"Error loading model: {e}")
            model = None

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'predict': reverse('predict-food', request=request, format=format),
        'add': reverse('add-food-sample', request=request, format=format),
        'feedback-list': reverse('feedback-list', request=request, format=format),
    })

class PredictFoodView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = ImageOnlySerializer

    def post(self, request, *args, **kwargs):
        load_model()  # Ensure model is loaded
        if model is None:
            return Response({'error': 'Model not available. Please retrain the model.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            class_names = get_class_names()
            image = Image.open(image_file).convert('RGB')
            input_tensor = transform(image)
            input_tensor = input_tensor.unsqueeze(0).to(device)
            with torch.no_grad():
                outputs = model(input_tensor)
                _, predicted = torch.max(outputs, 1)
                predicted_label = class_names[int(predicted.item())]
            
            # اگر کاربر لیبل صحیح را ارسال کرد، ذخیره کن
            correct_label = request.data.get('correct_label')
            if correct_label and correct_label != '' and correct_label != 'undefined':
                try:
                    label_instance = FoodLabel.objects.get(pk=correct_label)
                    feedback = FoodFeedbackSample.objects.create(image=image_file, label=label_instance)
                    serializer = FoodFeedbackSampleSerializer(feedback, context={'request': request})
                    return Response({'predicted_label': predicted_label, 'feedback': serializer.data})
                except FoodLabel.DoesNotExist:
                    return Response({'error': 'Label not found.'}, status=400)
            return Response({'predicted_label': predicted_label})
        except Exception as e:
            return Response({'error': f'Prediction failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FoodLabelListCreateView(generics.ListCreateAPIView):
    queryset = FoodLabel.objects.all()
    serializer_class = FoodLabelSerializer

class AddFoodSampleView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = FoodFeedbackSampleSerializer

    def post(self, request, *args, **kwargs):
        serializer = FoodFeedbackSampleSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            output_serializer = FoodFeedbackSampleSerializer(instance, context={'request': request})
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FoodFeedbackListView(APIView):
    def get(self, request, *args, **kwargs):
        samples = FoodFeedbackSample.objects.all().order_by('-created_at')
        serializer = FoodFeedbackSampleSerializer(samples, many=True, context={'request': request})
        return Response(serializer.data)

class FoodFeedbackSampleUpdateView(generics.RetrieveUpdateAPIView):
    queryset = FoodFeedbackSample.objects.all()
    serializer_class = FoodFeedbackSampleSerializer
    permission_classes = []  # کنترل دسترسی در متد update

    def update(self, request, *args, **kwargs):
        # حذف کنترل توکن و ادمین
        return super().update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        # حذف کنترل توکن و ادمین
        instance.delete()
        return Response({'message': 'Feedback deleted successfully.'}, status=204)

class RetrainModelView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # اجرای اسکریپت آموزش مجدد
            result = subprocess.run(
                ['python', 'retrain_model.py'], 
                capture_output=True, 
                text=True, 
                check=True,
                cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # مسیر پروژه
            )
            
            # Reload model after retraining
            global model
            model = None
            load_model()
            
            return Response({
                'message': 'Model retrained successfully.',
                'output': result.stdout,
                'timestamp': datetime.now().isoformat()
            })
        except subprocess.CalledProcessError as e:
            return Response({
                'error': 'Retrain failed.', 
                'details': e.stderr,
                'return_code': e.returncode
            }, status=500)
        except Exception as e:
            return Response({
                'error': 'Unexpected error during retraining.',
                'details': str(e)
            }, status=500)

class SubmitFeedbackView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        image_file = request.FILES.get('image')
        predicted_label = request.data.get('predicted_label')
        is_correct = request.data.get('is_correct') == 'true'
        correct_label = request.data.get('correct_label')
        
        if not image_file or not predicted_label:
            return Response({'error': 'Image and predicted label are required.'}, status=400)
        
        try:
            if is_correct:
                # اگر پیش‌بینی درست بود، لیبل پیش‌بینی شده را ذخیره کن
                try:
                    label_instance = FoodLabel.objects.get(name=predicted_label)
                except FoodLabel.DoesNotExist:
                    # اگر لیبل وجود نداشت، آن را ایجاد کن
                    label_instance = FoodLabel.objects.create(name=predicted_label)
                
                feedback = FoodFeedbackSample.objects.create(
                    image=image_file, 
                    label=label_instance
                )
            else:
                # اگر پیش‌بینی اشتباه بود، لیبل صحیح را ذخیره کن
                if not correct_label:
                    return Response({'error': 'Correct label is required when prediction is incorrect.'}, status=400)
                
                try:
                    label_instance = FoodLabel.objects.get(pk=correct_label)
                except FoodLabel.DoesNotExist:
                    return Response({'error': 'Correct label not found.'}, status=400)
                
                feedback = FoodFeedbackSample.objects.create(
                    image=image_file, 
                    label=label_instance
                )
            
            serializer = FoodFeedbackSampleSerializer(feedback, context={'request': request})
            return Response({
                'message': 'Feedback submitted successfully.',
                'feedback': serializer.data
            }, status=201)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
