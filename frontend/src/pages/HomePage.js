import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button
} from '@mui/material';
import { 
  Restaurant as RestaurantIcon,
  CameraAlt as CameraIcon,
  Psychology as AIIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n';
import api from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLang();

  const [stats, setStats] = useState({ feedback_count: 0, label_count: 0, accuracy: null });
  useEffect(() => {
    api.getSystemStats().then(setStats);
  }, []);

  const features = [
    {
      icon: <CameraIcon sx={{ fontSize: 40, color: '#FE6B8B' }} />,
      title: t('feature_upload_title'),
      description: t('feature_upload_desc')
    },
    {
      icon: <AIIcon sx={{ fontSize: 40, color: '#FF8E53' }} />,
      title: t('feature_ai_title'),
      description: t('feature_ai_desc')
    },
    {
      icon: <TrendingIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: t('feature_learning_title'),
      description: t('feature_learning_desc')
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {t('hero_title')}
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            {t('hero_subtitle')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<RestaurantIcon />}
            onClick={() => navigate('/predict')}
            sx={{
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              '&:hover': {
                background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
              }
            }}
          >
            {t('start_predicting')}
          </Button>
        </Box>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto', maxWidth: 220, mx: 'auto', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Stats Section */}
        <Paper 
          sx={{ 
            p: 4, 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3
          }}
        >
          <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
            {t('stats_title')}
          </Typography>
          <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', textAlign: 'center' }}>
            <Grid item xs={12} sm={3} sx={{ flex: 1, minWidth: 0, textAlign: 'center', px: 2, py: { xs: 1, sm: 1 } }}>
              <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {stats.correct_predictions ?? '--'}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {t('stats_predictions')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3} sx={{ flex: 1, minWidth: 0, textAlign: 'center', px: 2, py: { xs: 1, sm: 1 } }}>
              <Typography variant="h3" sx={{ color: '#FE6B8B', fontWeight: 'bold' }}>
                {stats.feedback_count}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {t('stats_data_count')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3} sx={{ flex: 1, minWidth: 0, textAlign: 'center', px: 2, py: { xs: 1, sm: 1 } }}>
              <Typography variant="h3" sx={{ color: '#FF8E53', fontWeight: 'bold' }}>
                {stats.label_count}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {t('stats_foods')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3} sx={{ flex: 1, minWidth: 0, textAlign: 'center', px: 10, py: { xs: 1, sm: 1 } }}>
              <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {stats.accuracy !== null ? `${Math.round(stats.accuracy * 1000000) / 10000}%` : '--'}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {t('stats_accuracy')}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage; 