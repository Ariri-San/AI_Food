from itertools import islice
import os

from django.conf import settings
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .remove_functions import delete_file_when_delete, delete_file_when_update
from ..models import FoodFeedbackSample


#  DELETE IMAGE OF  -- FoodFeedbackSample --
@receiver(post_delete, sender=FoodFeedbackSample)
def auto_delete_file_food_feedback_on_delete(sender, instance, **kwargs):
    delete_file_when_delete(instance, "image")

@receiver(pre_save, sender=FoodFeedbackSample)
def auto_delete_file_food_feedback_on_change(sender, instance, **kwargs):
    """
    Deletes old file from filesystem
    when corresponding `Model` object is updated
    with new file.
    """
    if not instance.pk:
        return False

    try:
        old_object = FoodFeedbackSample.objects.get(pk=instance.pk)
        old_image = old_object.image
        old_label = old_object.label.id
    except FoodFeedbackSample.DoesNotExist:
        return False

    new_image = instance.image
    new_label = instance.label.id
    
    if (old_image != new_image or old_label != new_label) and old_image:
        try:
            if os.path.isfile(old_image.path):
                os.remove(old_image.path)
        except:
            return False


