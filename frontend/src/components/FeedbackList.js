import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Card, CardContent, CardMedia, Button, Chip, Grid, Skeleton, Alert, IconButton, Tooltip, Select, MenuItem, FormControl, InputLabel, Pagination, Stack
} from '@mui/material';
import { Edit as EditIcon, Visibility as ViewIcon, Restaurant as FoodIcon, CalendarToday as DateIcon } from '@mui/icons-material';
import api from '../services/api';
import { useLang } from '../i18n';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [pageSize] = useState(10);
  const { t } = useLang();
  const query = useQuery();
  const navigate = useNavigate();

  const label = query.get('label') || '';
  const page = parseInt(query.get('page') || '1', 10);

  useEffect(() => {
    setLoading(true);
    api.getLabels().then(setLabels);
    api.getFeedbackList({ label, page, page_size: pageSize })
      .then(data => {
        setFeedbacks(data.results || []);
        setCount(data.count || 0);
        setLoading(false);
      })
      .catch(err => {
        setError(t('error'));
        setLoading(false);
      });
  }, [label, page, pageSize, t]);

  const handleLabelChange = (event) => {
    const newLabel = event.target.value;
    const params = new URLSearchParams(window.location.search);
    if (newLabel) params.set('label', newLabel); else params.delete('label');
    params.set('page', 1);
    navigate({ search: params.toString() });
  };

  const handlePageChange = (event, value) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', value);
    navigate({ search: params.toString() });
  };

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

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={3}>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>{t('filter_by_label')}</InputLabel>
          <Select
            value={label}
            label={t('filter_by_label')}
            onChange={handleLabelChange}
          >
            <MenuItem value="">{t('all_labels')}</MenuItem>
            {labels.map(l => (
              <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {feedbacks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <FoodIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {t('no_feedback')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('no_feedback_desc')}
          </Typography>
        </Box>
      ) : (
        <>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={feedback.predicted_label || t('no_prediction')}
                        color={feedback.predicted_label === feedback.label?.name ? 'success' : 'warning'}
                        size="small"
                        variant="outlined"
                      />
                      {/* is_correct status chip */}
                      <Chip
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
                        variant="filled"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <Box mt={4} display="flex" justifyContent="center">
            <Pagination
              count={Math.ceil(count / pageSize)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default FeedbackList; 