import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid
} from '@mui/material';
import { 
  List as ListIcon,
  Feedback as FeedbackIcon
} from '@mui/icons-material';
import FeedbackList from '../components/FeedbackList';
import { useLang } from '../i18n';

const FeedbackPage = () => {
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
            {t('feedback_title')}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t('feedback_subtitle')}
          </Typography>
        </Box>

        {/* Content */}
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
            <FeedbackIcon sx={{ mr: 2, fontSize: 32, color: '#FE6B8B' }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              {t('feedback_list_title')}
            </Typography>
          </Box>
          
          <FeedbackList />
        </Paper>
      </Container>
    </Box>
  );
};

export default FeedbackPage; 