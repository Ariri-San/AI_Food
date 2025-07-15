from django.core.management.base import BaseCommand
import os
import torch
import torchvision
from torchvision import transforms, datasets
from torch import nn
from torch.utils.data import DataLoader, random_split
from ai_api.models import FoodLabel, SystemInfo
from django.utils import timezone

class Command(BaseCommand):
    help = 'Train EfficientNet-B0 on food images and save the model.'

    def handle(self, *args, **options):
        # Paths
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) )
        DATA_DIR = os.path.join(BASE_DIR, 'media', 'food_feedback')
        MODEL_PATH = os.path.join(BASE_DIR, 'model_core', 'efficientnet_food_classifier.pth')

        # Remove old model file if it exists
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)
            self.stdout.write(self.style.WARNING(f"Removed old model file: {MODEL_PATH}"))

        # Hyperparameters
        BATCH_SIZE = 32
        EPOCHS = 10
        LEARNING_RATE = 1e-4

        # Device
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Get class names from database
        def get_class_names_from_db():
            try:
                return list(FoodLabel.objects.order_by('name').values_list('name', flat=True))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error getting class names from database: {e}"))
                return []

        class_names = get_class_names_from_db()
        num_classes = len(class_names)

        if num_classes < 2:
            self.stdout.write(self.style.ERROR("At least two classes are required for training."))
            return

        self.stdout.write(self.style.SUCCESS(f"Found {num_classes} classes from database: {class_names}"))

        # Transforms
        normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        custom_transforms = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            normalize,
        ])

        # Load dataset
        if not os.path.exists(DATA_DIR):
            self.stdout.write(self.style.ERROR(f"Data directory not found: {DATA_DIR}"))
            return

        dataset = datasets.ImageFolder(root=DATA_DIR, transform=custom_transforms)
        folder_class_names = dataset.classes
        folder_num_classes = len(folder_class_names)

        self.stdout.write(self.style.SUCCESS(f"Found {folder_num_classes} classes in folder structure: {folder_class_names}"))

        # Verify that folder classes match database classes
        if set(class_names) != set(folder_class_names):
            self.stdout.write(self.style.WARNING("Warning: Database classes don't match folder classes!"))
            self.stdout.write(self.style.WARNING(f"Database: {class_names}"))
            self.stdout.write(self.style.WARNING(f"Folders: {folder_class_names}"))
            self.stdout.write(self.style.WARNING("Using database classes for model output."))

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

        # Import engine and data_setup modules from model_core dir
        import sys
        sys.path.append(os.path.join(BASE_DIR, 'model_core'))
        try:
            import engine
            import data_setup
        except ImportError:
            self.stdout.write(self.style.ERROR("engine.py or data_setup.py not found in model_core directory."))
            return

        # Train
        results = engine.train(
            model, train_loader, test_loader, optimizer, loss_fn, EPOCHS, device=device
        )

        # ذخیره دقت مدل در SystemInfo
        if 'test_acc' in results and isinstance(results['test_acc'], list):
            accuracy = results['test_acc'][-1]
        else:
            accuracy = results.get('test_acc', None)
        info, _ = SystemInfo.objects.get_or_create(pk=1)
        info.accuracy = accuracy
        info.last_trained = timezone.now()
        info.total_samples = len(train_dataset) + len(test_dataset)
        info.save()

        # Save model
        torch.save(model.state_dict(), MODEL_PATH)
        self.stdout.write(self.style.SUCCESS(f"Model saved to {MODEL_PATH}")) 