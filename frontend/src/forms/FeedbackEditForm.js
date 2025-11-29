import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  Restaurant as FoodIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useLang } from '../i18n';
import { useNavigate } from 'react-router-dom';

const FeedbackEditForm = ({ feedbackId, token: initialToken }) => {
  const [labels, setLabels] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [labelId, setLabelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const { t } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [labelsData, feedbackData] = await Promise.all([
          api.getLabels(),
          api.getFeedbackDetail(feedbackId)
        ]);
        setLabels(labelsData);
        setFeedback(feedbackData);
        setLabelId(feedbackData.label?.id || '');
        setPreviewUrl(feedbackData.image);
      } catch (err) {
        setError(t('error'));
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [feedbackId, t]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // بررسی نوع فایل - پشتیبانی از انواع مختلف تصاویر
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/svg+xml'
    ];
    
    if (!file.type.startsWith('image/') || !allowedTypes.includes(file.type)) {
      setError('لطفاً فقط فایل تصویری انتخاب کنید (JPG, PNG, WebP, GIF, BMP, TIFF, SVG)');
      return;
    }
    
    // بررسی اندازه فایل (حداکثر 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('حجم فایل نباید بیشتر از 10 مگابایت باشد');
      return;
    }
    
    setImage(file);
    setError(''); // پاک کردن خطاهای قبلی
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    
    try {
      const result = await api.editFeedback({ 
        id: feedbackId, 
        image, 
        labelId
      });
      
      if (result.id) {
        setSuccess(true);
        setFeedback(result);
      } else {
        setError(result.error || t('error'));
      }
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('delete_confirm'))) return;
    setLoading(true);
    setError('');
    try {
      await api.deleteFeedback({ id: feedbackId });
      setDeleteSuccess(true);
      setFeedback(null);
      setTimeout(() => {
        navigate('/feedback');
      }, 1000);
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>{t('loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* تصویر فعلی */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                {t('current_image')}
              </Typography>
              {previewUrl && (
                <CardMedia
                  component="img"
                  height="300"
                  image={previewUrl}
                  alt="Food"
                  sx={{ borderRadius: 2, objectFit: 'cover' }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* فرم ویرایش */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* آپلود عکس جدید */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                {t('upload_new_image')}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
                fullWidth
              >
                {t('choose_file')}
                <input
                  type="file"
                  hidden
                  accept="image/*,image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/svg+xml"
                  onChange={handleImageChange}
                />
              </Button>
              
              {/* دکمه دوربین برای موبایل */}
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
                fullWidth
                style={{
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  borderColor: '#4caf50',
                  color: '#4caf50'
                }}
              >
                دوربین 📷
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                />
              </Button>
              {image && (
                <Chip 
                  label={image.name} 
                  color="primary" 
                  variant="outlined"
                  onDelete={() => {
                    setImage(null);
                    setPreviewUrl(feedback?.image || '');
                  }}
                />
              )}
            </Box>

            {/* انتخاب لیبل */}
            <FormControl fullWidth>
              <InputLabel>{t('select_label')}</InputLabel>
              <Select
                value={labelId}
                label={t('select_label')}
                onChange={(e) => setLabelId(e.target.value)}
                startAdornment={<FoodIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="">
                  <em>{t('select_label')}</em>
                </MenuItem>
                {labels.map(label => (
                  <MenuItem key={label.id} value={label.id}>
                    {label.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* دکمه ثبت */}
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
              sx={{
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
                }
              }}
            >
              {loading ? t('saving') : t('save_changes')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {t('delete')}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* پیام‌های موفقیت و خطا */}
      {success && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {t('changes_saved')}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {deleteSuccess && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {t('delete_success')}
        </Alert>
      )}

      {/* اطلاعات فعلی */}
      {feedback && (
        <Card sx={{ mt: 3, background: 'rgba(76, 175, 80, 0.1)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              {t('current_info')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('food_type')} <strong>{feedback.label?.name || t('no_label')}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('prediction')} <strong>{feedback.predicted_label || t('no_prediction')}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('created_date')} <strong>{new Date(feedback.created_at).toLocaleDateString('fa-IR')}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('status')} <Chip 
                    label={
                      feedback.is_correct === true
                        ? t('correct')
                        : feedback.is_correct === false
                        ? t('incorrect')
                        : t('user_data')
                    }
                    color={
                      feedback.is_correct === true
                        ? 'success'
                        : feedback.is_correct === false
                        ? 'error'
                        : 'default'
                    }
                    size="small"
                  />
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default FeedbackEditForm; 