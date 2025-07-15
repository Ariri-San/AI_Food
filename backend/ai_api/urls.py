from django.urls import path
from .views import PredictFoodView, AddFoodSampleView, FoodFeedbackListView, api_root, RetrainModelView \
    , FoodLabelListCreateView, FoodFeedbackSampleUpdateView, SubmitFeedbackView, system_stats

urlpatterns = [
    # path('', api_root, name='api-root'),
    path('predict/', PredictFoodView.as_view(), name='predict-food'),
    path('add/', AddFoodSampleView.as_view(), name='add-food-sample'),
    path('feedback-list/', FoodFeedbackListView.as_view(), name='feedback-list'),
    path('retrain/', RetrainModelView.as_view(), name='retrain-model'),
    path('labels/', FoodLabelListCreateView.as_view(), name='food-label-list-create'),
    path('feedback/<int:pk>/', FoodFeedbackSampleUpdateView.as_view(), name='feedback-edit'),
    path('submit-feedback/', SubmitFeedbackView.as_view(), name='submit-feedback'),
]

urlpatterns += [
    path('system-stats/', system_stats, name='system-stats'),
] 