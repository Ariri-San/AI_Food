import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Alert,
  LinearProgress,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Restaurant as FoodIcon,
  TrendingUp as ConfidenceIcon,
  ThumbUp as CorrectIcon,
  ThumbDown as IncorrectIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useLang } from '../i18n';
import api from '../services/api';

const PredictionResult = ({ result, onFeedbackSubmit }) => {
  const { t } = useLang();
  const [feedbackState, setFeedbackState] = useState('none'); // 'none', 'correct', 'incorrect'
  const [selectedLabel, setSelectedLabel] = useState('');
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  
  if (!result) return null;

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return t('excellent');
    if (confidence >= 0.6) return t('good');
    return t('poor');
  };

  const handleCorrectFeedback = async () => {
    setLoading(true);
    try {
      // ارسال فیدبک مثبت - پیش‌بینی درست بود
      const feedbackResult = await api.submitFeedback({
        image: result.image,
        predictedLabel: result.predicted_label,
        isCorrect: true
      });
      
      setFeedbackSuccess(true);
      setFeedbackState('correct');
      if (onFeedbackSubmit) {
        onFeedbackSubmit(feedbackResult);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncorrectFeedback = async () => {
    // بارگذاری لیبل‌ها برای انتخاب
    try {
      const labelsData = await api.getLabels();
      setLabels(labelsData);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error loading labels:', error);
    }
  };

  const handleSubmitCorrection = async () => {
    if (!selectedLabel) return;
    
    setLoading(true);
    try {
      const feedbackResult = await api.submitFeedback({
        image: result.image,
        predictedLabel: result.predicted_label,
        correctLabel: selectedLabel,
        isCorrect: false
      });
      
      setFeedbackSuccess(true);
      setFeedbackState('incorrect');
      setOpenDialog(false);
      if (onFeedbackSubmit) {
        onFeedbackSubmit(feedbackResult);
      }
    } catch (error) {
      console.error('Error submitting correction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {result.error && (
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ mb: 2 }}
        >
          {result.error}
        </Alert>
      )}

      {result.predicted_label && (
        <Card sx={{ mb: 2, background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FoodIcon sx={{ mr: 1, color: '#4CAF50' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {t('predicted_food')}
              </Typography>
            </Box>
            
            <Chip
              label={result.predicted_label}
              color="success"
              variant="filled"
              sx={{ 
                fontSize: '1.1rem', 
                py: 1,
                px: 2,
                fontWeight: 'bold'
              }}
            />

            {result.confidence && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ConfidenceIcon sx={{ mr: 1, fontSize: 20, color: getConfidenceColor(result.confidence) }} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {t('confidence_level')} {getConfidenceText(result.confidence)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={result.confidence * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getConfidenceColor(result.confidence),
                      borderRadius: 4
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {(result.confidence * 100).toFixed(1)}%
                </Typography>
              </Box>
            )}

            {/* سیستم فیدبک تعاملی */}
            {!feedbackSuccess && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {t('is_prediction_correct')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CorrectIcon />}
                    onClick={handleCorrectFeedback}
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    {t('correct')}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<IncorrectIcon />}
                    onClick={handleIncorrectFeedback}
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    {t('incorrect')}
                  </Button>
                </Box>
              </Box>
            )}

            {/* پیام موفقیت فیدبک */}
            {feedbackSuccess && (
              <Alert 
                severity="success" 
                icon={<CheckIcon />}
                sx={{ mt: 2 }}
              >
                <Typography variant="body2">
                  {feedbackState === 'correct' ? t('feedback_saved_correct') : t('feedback_saved_incorrect')}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* دیالوگ انتخاب لیبل صحیح */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} />
            {t('select_correct_label')}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('select_correct_label_desc')}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>{t('correct_food_type')}</InputLabel>
            <Select
              value={selectedLabel}
              label={t('correct_food_type')}
              onChange={(e) => setSelectedLabel(e.target.value)}
            >
              {labels.map(label => (
                <MenuItem key={label.id} value={label.id}>
                  {label.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSubmitCorrection}
            variant="contained"
            disabled={!selectedLabel || loading}
          >
            {loading ? t('saving') : t('submit_correction')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PredictionResult; 