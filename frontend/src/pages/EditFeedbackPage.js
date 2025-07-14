import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Alert
} from '@mui/material';
import { 
  Edit as EditIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import FeedbackEditForm from '../forms/FeedbackEditForm';
import { useLang } from '../i18n';

const EditFeedbackPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
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
            {t('edit_feedback_title')}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t('edit_feedback_subtitle')}
          </Typography>
        </Box>

        {/* Token Alert */}
        {!token && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              {t('token_warning')}
            </Typography>
          </Alert>
        )}

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
            <EditIcon sx={{ mr: 2, fontSize: 32, color: '#FE6B8B' }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              {t('edit_feedback_title')} #{id}
            </Typography>
          </Box>
          
          <FeedbackEditForm feedbackId={id} token={token} />
        </Paper>
      </Container>
    </Box>
  );
};

export default EditFeedbackPage; 