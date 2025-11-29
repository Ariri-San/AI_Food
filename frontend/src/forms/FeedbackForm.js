import React, { useState } from 'react';
import { Box, Button, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Paper, Tabs, Tab, Alert, LinearProgress } from '@mui/material';
import { CloudUpload as UploadIcon, Send as SendIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';
import { useLang } from '../i18n';

const FeedbackForm = ({ onResult, onLoading, showTitle = true, mode: controlledMode, onModeChange, onFeedbackSubmitted, result }) => {
  const { t, lang } = useLang();
  const [internalMode, setInternalMode] = useState('predict');
  const mode = controlledMode !== undefined ? controlledMode : internalMode;
  const [image, setImage] = useState(null);
  const [labelId, setLabelId] = useState('');
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // تشخیص موبایل
  React.useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
  }, []);

  React.useEffect(() => {
    if (mode === 'add') {
      api.getLabels().then(setLabels);
    }
  }, [mode]);

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
      'image/tiff'
    ];
    
    // بررسی دقیق‌تر نوع فایل
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'];
    
    // اگر نوع فایل خالی بود (مشکل موبایل)، بر اساس پسوند بررسی کن
    if (!file.type || file.type === '') {
      if (!validExtensions.includes(fileExtension)) {
        setError(`نوع فایل پشتیبانی نمی‌شود. انواع مجاز: JPG, PNG, WebP, GIF, BMP, TIFF`);
        return;
      }
    } else if (!file.type.startsWith('image/') || 
        (!allowedTypes.includes(file.type) && !validExtensions.includes(fileExtension))) {
      setError(`نوع فایل ${file.type} پشتیبانی نمی‌شود. انواع مجاز: JPG, PNG, WebP, GIF, BMP, TIFF`);
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
    if (onResult) onResult(null); // پاک کردن نتیجه قبلی
    e.target.value = ''; // ریست input برای انتخاب مجدد همان فایل
  };

  const handleTabChange = (_, v) => {
    if (onModeChange) onModeChange(v);
    if (controlledMode === undefined) setInternalMode(v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (onLoading) onLoading(true);
    try {
      let result;
      if (mode === 'predict') {
        result = await api.predictFood({ image });
        result.image = image;
      } else {
        if (!labelId) {
          setError(t('select_label'));
          setLoading(false);
          if (onLoading) onLoading(false);
          return;
        }
        // فقط image و labelId را بفرست، is_correct نفرست
        result = await api.addFoodSample({ image, labelId });
        result.image = image;
      }
      onResult && onResult(result);
      // عکس را پاک نمی‌کنیم تا فیدبک نمایش داده شود
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err) {
      setError('خطا در ارسال درخواست');
    } finally {
      setLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      {showTitle && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {t('upload')}
        </Typography>
      )}
      <Tabs
        value={mode}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab value="predict" label={t('predict_mode')} icon={<SearchIcon />} iconPosition="start" />
        <Tab value="add" label={t('add_mode')} icon={<AddIcon />} iconPosition="start" />
      </Tabs>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          fullWidth
          sx={{
            minHeight: '48px', // برای موبایل بهتر
            fontSize: '16px', // برای موبایل بهتر
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            }
          }}
        >
          {image ? 'تغییر فایل' : t('choose_file')}
          <input 
            type="file" 
            hidden 
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/tiff" 
            onChange={handleImageChange}
            multiple={false}
          />
        </Button>
        
        {/* دکمه دوربین برای موبایل */}
        {isMobile && (
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            fullWidth
            sx={{
              minHeight: '48px',
              fontSize: '16px',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderColor: 'success.main',
              color: 'success.main',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
              }
            }}
          >
            دوربین 📷
            <input 
              type="file" 
              hidden 
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/tiff" 
              capture="environment"
              onChange={handleImageChange}
            />
          </Button>
        )}
        
        {image && !result && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
            <Box
              component="img"
              src={URL.createObjectURL(image)}
              alt="Preview"
              sx={{
                width: '100%',
                maxWidth: 300,
                height: 'auto',
                borderRadius: 2,
                border: '2px solid #e0e0e0',
                objectFit: 'cover',
                maxHeight: '300px'
              }}
              onError={(e) => {
                console.error('Error loading image preview');
                setError('خطا در نمایش پیش‌نمایش عکس');
              }}
            />
          </Box>
        )}
        {image && result && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {image.name}
          </Typography>
        )}
        {mode === 'add' && (
          <FormControl fullWidth>
            <InputLabel>{t('select_label')}</InputLabel>
            <Select
              value={labelId}
              label={t('select_label')}
              onChange={e => setLabelId(e.target.value)}
            >
              <MenuItem value=""><em>{t('select_label')}</em></MenuItem>
              {labels.map(label => (
                <MenuItem key={label.id} value={label.id}>{label.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Button
          type="submit"
          variant="contained"
          startIcon={mode === 'predict' ? <SearchIcon /> : <AddIcon />}
          disabled={loading || !image}
        >
          {mode === 'predict' ? t('predict_mode') : t('add_mode')}
        </Button>
        {image && (
          <Button
            variant="outlined"
            onClick={() => {
              setImage(null);
              if (onResult) onResult(null);
            }}
            sx={{ mt: 1 }}
          >
            {t('clear_form')}
          </Button>
        )}
        {loading && <LinearProgress sx={{ mt: 1 }} />}
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
            {error.includes('اتصال') && (
              <Box sx={{ mt: 1, fontSize: '12px', color: 'text.secondary' }}>
                نکات عیب‌یابی:
                <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                  <li>اتصال اینترنت خود را بررسی کنید</li>
                  <li>اگر از VPN استفاده می‌کنید، آن را غیرفعال کنید</li>
                  <li>مرورگر خود را رفرش کنید</li>
                </ul>
              </Box>
            )}
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default FeedbackForm; 