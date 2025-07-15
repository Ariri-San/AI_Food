import React, { useState } from 'react';
import { Box, Button, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Paper, Tabs, Tab, Alert, LinearProgress } from '@mui/material';
import { CloudUpload as UploadIcon, Send as SendIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';
import { useLang } from '../i18n';

const FeedbackForm = ({ onResult, onLoading, showTitle = true, mode: controlledMode, onModeChange }) => {
  const { t, lang } = useLang();
  const [internalMode, setInternalMode] = useState('predict');
  const mode = controlledMode !== undefined ? controlledMode : internalMode;
  const [image, setImage] = useState(null);
  const [labelId, setLabelId] = useState('');
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (mode === 'add') {
      api.getLabels().then(setLabels);
    }
  }, [mode]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
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
        >
          {t('choose_file')}
          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        </Button>
        {image && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{image.name}</Typography>
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
        {loading && <LinearProgress sx={{ mt: 1 }} />}
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      </Box>
    </Paper>
  );
};

export default FeedbackForm; 