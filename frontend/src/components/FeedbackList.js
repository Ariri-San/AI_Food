import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Chip, 
  Grid,
  Skeleton,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Edit as EditIcon,
  Visibility as ViewIcon,
  Restaurant as FoodIcon,
  CalendarToday as DateIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useLang } from '../i18n';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLang();

  useEffect(() => {
    api.getFeedbackList()
      .then(data => {
        setFeedbacks(data);
        setLoading(false);
      })
      .catch(err => {
        setError(t('error'));
        setLoading(false);
      });
  }, [t]);

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
            <Card>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="80%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <FoodIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          {t('no_feedback')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('no_feedback_desc')}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {feedbacks.map(feedback => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={feedback.id}>
          <Card 
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image={feedback.image}
              alt={`Food ${feedback.id}`}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FoodIcon sx={{ mr: 1, fontSize: 20, color: '#FE6B8B' }} />
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                  {feedback.label?.name || t('no_label')}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DateIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {new Date(feedback.created_at).toLocaleDateString('fa-IR')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={feedback.predicted_label || t('no_prediction')}
                  color={feedback.predicted_label === feedback.label?.name ? 'success' : 'warning'}
                  size="small"
                  variant="outlined"
                />
                
                <Box>
                  <Tooltip title={t('view_details')}>
                    <IconButton 
                      size="small" 
                      component={Link} 
                      to={`/feedback/${feedback.id}/edit`}
                      sx={{ color: '#2196F3' }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {feedback.token && (
                    <Tooltip title={t('edit')}>
                      <IconButton 
                        size="small" 
                        component={Link} 
                        to={`/feedback/${feedback.id}/edit?token=${feedback.token}`}
                        sx={{ color: '#4CAF50' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default FeedbackList; 