# -*- coding: utf-8 -*-
"""
Created on Fri Mar 21 18:27:17 2025

@author: Shayan Ghoddos

Transfer Learning
"""

import torch
import torchvision


device = "cuda" if torch.cuda.is_available() else "cpu"

print(torch.__version__)
print(torchvision.__version__)


# Continue with regular imports
import matplotlib.pyplot as plt

from torch import nn
from torchvision import transforms

# Try to get torchinfo, install it if it doesn't work
try:
    from torchinfo import summary
except:
    print("[INFO] Couldn't find torchinfo... installing it.")
    # !pip install -q torchinfo
    from torchinfo import summary

# Try to import the going_modular directory, download it from GitHub if it doesn't work
import data_setup, engine

# try:
# except:
#     # Get the going_modular scripts
#     print("[INFO] Couldn't find going_modular scripts... downloading them from GitHub.")
#     # !git clone https://github.com/mrdbourke/pytorch-deep-learning
#     # !mv pytorch-deep-learning/going_modular .
#     # !rm -rf pytorch-deep-learning
#     from pytorch_deep_learning.going_modular.going_modular import data_setup, engine


import os
import zipfile
import requests

from pathlib import Path


data_path = Path("data/")
image_path = data_path / "pizza_steak_sushi"


if image_path.is_dir():
    print("skip re download.")
else:
    print("create folder...")
    image_path.mkdir(parents=True, exist_ok=True)

    # Download Zip
    with open(data_path / "pizza_steak_sushi.zip", "wb") as f:
        request = requests.get(
            "https://github.com/mrdbourke/pytorch-deep-learning/raw/main/data/pizza_steak_sushi.zip"
        )
        print("downloading...")
        f.write(request.content)

    # Unzip
    with zipfile.ZipFile(data_path / "pizza_steak_sushi.zip", "r") as zip_ref:
        print("unzipping...")
        zip_ref.extractall(image_path)

    # Remove Zip
    os.remove(data_path / "pizza_steak_sushi.zip")


train_dir = image_path / "train"
test_dir = image_path / "test"

BACH_SIZE = 32

normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])

custom_transforms = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        normalize,
    ]
)

train_dataloader, test_dataloader, class_names = data_setup.create_dataloaders(
    train_dir=str(train_dir),
    test_dir=str(test_dir),
    transform=custom_transforms,
    batch_size=BACH_SIZE,
    num_workers=0,
)

# create model
weights = torchvision.models.EfficientNet_B0_Weights.DEFAULT
model = torchvision.models.efficientnet_b0(weights=weights).to(device)

custom_summary = summary(
    model=model,
    input_size=(1, 3, 224, 224),
    col_names=["input_size", "output_size", "num_params", "trainable"],
    col_width=20,
    row_settings=["var_names"],
)


# freeze params of layers
# for pram in model.features.parameters():
#     pram.requires_grad = False


print(model.classifier)

torch.manual_seed(42)
torch.cuda.manual_seed(42)

model.classifier = nn.Sequential(
    nn.Dropout(p=0.2, inplace=True),
    nn.Linear(in_features=1280, out_features=len(class_names)),
).to(device)

print(model.classifier)


# from test_5 import training_model

EPOCHS = 10

loss_fn = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(params=model.parameters(), lr=0.0001)


# values_model = training_model(model, train_dataloader, test_dataloader, loss_fn, optimizer, epochs=EPOCHS)
results = engine.train(
    model, train_dataloader, test_dataloader, optimizer, loss_fn, EPOCHS, device=device
)


# # # # اطمینان حاصل کنیم که test_preds مقدار گرفته
# if values_model["preds"] is not None:
#     preds = torch.cat(values_model["preds"]).cpu()

#     idx = 0  # شماره تصویر برای هماهنگی با preds

#     for images, labels in test_dataloader:
#         images = images.cpu()
#         labels = labels.cpu()

#         for i in range(len(images)):
#             img = images[i].permute(1, 2, 0)
#             real_label = labels[i].item()
#             pred_label = preds[idx].item()

#             plt.figure(figsize=(3, 3))
#             plt.imshow(img)
#             plt.axis("off")
#             plt.title(f"RE = {real_label}: {class_names[real_label]}\n"
#                       f"AI = {pred_label}: {class_names[pred_label]}")
#             plt.show()

#             idx += 1
# else:
#     print("⛔ test_preds مقداردهی نشده! ابتدا مدل را train کن.")


plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.plot(results["train_loss"], label="Train Loss")
plt.plot(results["test_loss"], label="Test Loss")
plt.title("Loss Curves")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()
plt.grid(True)

plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 2)
plt.plot(results["train_acc"], label="Train Accuracy")
plt.plot(results["test_acc"], label="Test Accuracy")
plt.title("Accuracy Curve")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()
plt.grid(True)

plt.tight_layout()


def check_images_labels_dir(folder_images, model):
    files_images = os.listdir(folder_images)

    transform_custom_image = transforms.Compose([transforms.Resize(size=(224, 224))])

    for file in files_images:
        file_image = os.path.join(folder_images, file)
        print(file_image)

        image = torchvision.io.read_image(file_image).type(torch.float32) / 255.0
        transformed_image = transform_custom_image(image)
        # print(transformed_image)

        model.eval()
        with torch.inference_mode():
            pred_custom_image = model(transformed_image.unsqueeze(0).to(device))
            print(pred_custom_image)

            pred_label = torch.softmax(pred_custom_image, dim=1).argmax(dim=1).cpu()
            print(class_names[pred_label])

        plt.figure()
        plt.title(file)
        plt.imshow(image.permute(1, 2, 0))

        plt.figure()
        plt.title(file + "\n" + class_names[pred_label])
        plt.imshow(transformed_image.permute(1, 2, 0))


folder_images = "E:\codes\AI projects\Samples\data\images_foods"
check_images_labels_dir(folder_images, model)

torch.save(model.state_dict(), "efficientnet_food_classifier.pth")
