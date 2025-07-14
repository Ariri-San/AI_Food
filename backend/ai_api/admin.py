from django.contrib import admin
from .models import FoodLabel, FoodFeedbackSample

@admin.register(FoodLabel)
class FoodLabelAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(FoodFeedbackSample)
class FoodFeedbackSampleAdmin(admin.ModelAdmin):
    list_display = ['label', 'created_at']
    list_filter = ['label', 'created_at']
    search_fields = ['label__name']
