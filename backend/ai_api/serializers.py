from rest_framework import serializers
from .models import FoodFeedbackSample, FoodLabel
import os
from django.conf import settings

class FoodLabelSerializer(serializers.ModelSerializer):
    sample_count = serializers.SerializerMethodField()

    class Meta:
        model = FoodLabel
        fields = ['id', 'name', 'sample_count']

    def get_sample_count(self, obj):
        return obj.samples.count()

class FoodFeedbackSampleSerializer(serializers.ModelSerializer):
    label = FoodLabelSerializer(read_only=True)
    label_id = serializers.PrimaryKeyRelatedField(queryset=FoodLabel.objects.all(), source='label', write_only=True)
    token = serializers.UUIDField(read_only=True)
    predicted_label = serializers.CharField(read_only=True, required=False)  # برای سازگاری با فرانت‌اند
    
    class Meta:
        model = FoodFeedbackSample
        fields = ['id', 'image', 'label', 'label_id', 'created_at', 'token', 'predicted_label']

class ImageOnlySerializer(serializers.Serializer):
    image = serializers.ImageField() 