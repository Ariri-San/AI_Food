import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import { 
  Restaurant as RestaurantIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import FeedbackForm from '../forms/FeedbackForm';
import PredictionResult from '../components/PredictionResult';
import { useLang } from '../i18n';

const PredictPage = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formMode, setFormMode] = useState('predict');
  const { t } = useLang();

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {t('predict_title')}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t('predict_subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Form Section */}
          <Grid item xs={12} lg={6}>
            <Paper 
              sx={{ 
                p: 4, 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                height: 'fit-content'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <RestaurantIcon sx={{ mr: 2, fontSize: 32, color: '#FE6B8B' }} />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  {t('upload_section')}
                </Typography>
              </Box>
              
              {loading && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t('processing')}
                  </Typography>
                  <LinearProgress 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(254, 107, 139, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)'
                      }
                    }} 
                  />
                </Box>
              )}

              <FeedbackForm 
                onResult={setResult} 
                onLoading={setLoading}
                showTitle={false}
                mode={formMode}
                onModeChange={setFormMode}
              />
            </Paper>
          </Grid>

          {/* Result Section */}
          <Grid item xs={12} lg={6}>
            {result && formMode === 'predict' ? (
              <Paper 
                sx={{ 
                  p: 4, 
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckIcon sx={{ mr: 2, fontSize: 32, color: '#4CAF50' }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    {t('result_title')}
                  </Typography>
                </Box>
                
                <PredictionResult 
                  result={result} 
                  onFeedbackSubmit={(feedbackData) => {
                    // می‌توانیم اینجا کارهای اضافی انجام دهیم، مثلاً نمایش پیام موفقیت
                    console.log('Feedback submitted:', feedbackData);
                  }}
                />
              </Paper>
            ) : result && formMode === 'add' ? (
              <Paper 
                sx={{ 
                  p: 4, 
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  height: 'fit-content'
                }}
              >
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckIcon sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    {t('add_sample_success')}
                  </Typography>
                </Box>
              </Paper>
            ) : (
              <Paper 
                sx={{ 
                  p: 4, 
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  height: 'fit-content'
                }}
              >
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <RestaurantIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    {t('waiting_for_upload')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('waiting_desc')}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Info Section */}
        <Paper 
          sx={{ 
            mt: 4, 
            p: 3, 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            {t('tips_title')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckIcon sx={{ mr: 1, fontSize: 16, color: '#4CAF50' }} />
                <Typography variant="body2">{t('tip_clear')}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckIcon sx={{ mr: 1, fontSize: 16, color: '#4CAF50' }} />
                <Typography variant="body2">{t('tip_light')}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckIcon sx={{ mr: 1, fontSize: 16, color: '#4CAF50' }} />
                <Typography variant="body2">{t('tip_center')}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckIcon sx={{ mr: 1, fontSize: 16, color: '#4CAF50' }} />
                <Typography variant="body2">{t('tip_format')}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default PredictPage; 