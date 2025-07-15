from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models import FoodLabel, FoodFeedbackSample
from django.core.files.uploadedfile import SimpleUploadedFile
import io
from PIL import Image

def create_test_image():
    img = Image.new('RGB', (100, 100), color = (73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    buf.seek(0)
    return SimpleUploadedFile('test.jpg', buf.read(), content_type='image/jpeg')

class APITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.label1 = FoodLabel.objects.create(name='pizza')
        self.label2 = FoodLabel.objects.create(name='steak')

    def test_labels_list(self):
        response = self.client.get('/api/food/labels/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(any(l['name'] == 'pizza' for l in response.json()))

    def test_feedback_list(self):
        response = self.client.get('/api/food/feedback-list/')
        self.assertEqual(response.status_code, 200)

    def test_predict_no_image(self):
        response = self.client.post('/api/food/predict/', {})
        self.assertEqual(response.status_code, 400)

    def test_submit_feedback_success(self):
        image = create_test_image()
        data = {
            'image': image,
            'predicted_label': 'pizza',
            'is_correct': 'true',
        }
        response = self.client.post('/api/food/submit-feedback/', data, format='multipart')
        self.assertEqual(response.status_code, 201)
        self.assertIn('feedback', response.json())

    def test_submit_feedback_missing_image(self):
        data = {
            'predicted_label': 'pizza',
            'is_correct': 'true',
        }
        response = self.client.post('/api/food/submit-feedback/', data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())

    def test_submit_feedback_wrong_label(self):
        image = create_test_image()
        data = {
            'image': image,
            'predicted_label': 'pizza',
            'is_correct': 'false',
            'correct_label': 9999  # label id that does not exist
        }
        response = self.client.post('/api/food/submit-feedback/', data, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())
