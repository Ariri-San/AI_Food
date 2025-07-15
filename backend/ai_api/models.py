from django.db import models
import uuid

# Create your models here.

class FoodLabel(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name

def feedback_image_upload_to(instance, filename):
    # اگر label هنوز ست نشده، از یک نام موقت استفاده کن
    if instance.label:
        return f'food_feedback/{instance.label.name}/{filename}'
    else:
        return f'food_feedback/unknown/{filename}'

class FoodFeedbackSample(models.Model):
    label = models.ForeignKey(FoodLabel, on_delete=models.CASCADE, related_name='samples')
    image = models.ImageField(upload_to=feedback_image_upload_to)
    created_at = models.DateTimeField(auto_now_add=True)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_correct = models.BooleanField(null=True, blank=True, help_text='آیا پیش‌بینی مدل درست بوده است؟')

    def __str__(self):
        return f"{self.label} - {self.created_at}"

class SystemInfo(models.Model):
    accuracy = models.FloatField(null=True, blank=True)
    last_trained = models.DateTimeField(null=True, blank=True)
    total_samples = models.IntegerField(null=True, blank=True)
    # می‌توان فیلدهای بیشتری اضافه کرد

    def __str__(self):
        return f"SystemInfo (accuracy={self.accuracy}, last_trained={self.last_trained})"
