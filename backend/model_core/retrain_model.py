#!/usr/bin/env python3
"""
Train EfficientNet-B0 on images in backend/media/food_feedback/<label>/ using transfer learning.
Randomly split data into train (80%) and test (20%).
Save model as efficientnet_food_classifier.pth.
Uses Django database for class names instead of labels.txt.
"""
import os
import sys
import torch
import torchvision
from torchvision import transforms, datasets
from torch import nn
from torch.utils.data import DataLoader, random_split
import django
from model_core import engine, data_setup
from ai_api.models import FoodLabel, SystemInfo
from django.utils import timezone

# پیدا کردن ریشه پروژه (پوشه‌ای که backend/ در آن است)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_PATH = os.path.join(PROJECT_ROOT, 'backend')
if BACKEND_PATH not in sys.path:
    sys.path.insert(0, BACKEND_PATH)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

# # Import engine and data_setup modules from backend dir
# # sys.path.append(os.path.dirname(__file__))  # اضافه کردن model_core به sys.path برای import engine و data_setup
# try:
    
# except ImportError:
#     print("engine.py or data_setup.py not found in model_core directory.")
#     # sys.exit(1)

# Paths
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'media', 'food_feedback')
# مسیر مدل:
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'efficientnet_food_classifier.pth')

# Remove old model file if it exists
if os.path.exists(MODEL_PATH):
    os.remove(MODEL_PATH)
    print(f"Removed old model file: {MODEL_PATH}")

# Hyperparameters
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 1e-4

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Get class names from database
def get_class_names_from_db():
    """Get class names from FoodLabel database table"""
    try:
        return list(FoodLabel.objects.order_by('name').values_list('name', flat=True))
    except Exception as e:
        print(f"Error getting class names from database: {e}")
        return []

class_names = get_class_names_from_db()
num_classes = len(class_names)

if num_classes < 2:
    print("At least two classes are required for training.")
    sys.exit(1)

print(f"Found {num_classes} classes from database: {class_names}")

# Transforms
normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
custom_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    normalize,
])

# Load dataset
if not os.path.exists(DATA_DIR):
    print(f"Data directory not found: {DATA_DIR}")
    sys.exit(1)

dataset = datasets.ImageFolder(root=DATA_DIR, transform=custom_transforms)
folder_class_names = dataset.classes
folder_num_classes = len(folder_class_names)

print(f"Found {folder_num_classes} classes in folder structure: {folder_class_names}")

# Verify that folder classes match database classes
if set(class_names) != set(folder_class_names):
    print("Warning: Database classes don't match folder classes!")
    print(f"Database: {class_names}")
    print(f"Folders: {folder_class_names}")
    print("Using database classes for model output.")

# Split dataset
train_size = int(0.8 * len(dataset))
test_size = len(dataset) - train_size
train_dataset, test_dataset = random_split(dataset, [train_size, test_size], generator=torch.Generator().manual_seed(42))

# DataLoaders
train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)

# Model
weights = torchvision.models.EfficientNet_B0_Weights.DEFAULT
model = torchvision.models.efficientnet_b0(weights=weights).to(device)
model.classifier = nn.Sequential(
    nn.Dropout(p=0.2, inplace=True),
    nn.Linear(in_features=1280, out_features=num_classes),
).to(device)

# Loss and optimizer
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(params=model.parameters(), lr=LEARNING_RATE)

# Train
results = engine.train(
    model, train_loader, test_loader, optimizer, loss_fn, EPOCHS, device=device
)

# ذخیره دقت مدل در SystemInfo
accuracy = results['test_acc'] if 'test_acc' in results else None
info, _ = SystemInfo.objects.get_or_create(pk=1)
info.accuracy = accuracy
info.last_trained = timezone.now()
info.total_samples = len(train_dataset) + len(test_dataset)
info.save()

# Save model
torch.save(model.state_dict(), MODEL_PATH)
print(f"Model saved to {MODEL_PATH}") 