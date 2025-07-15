import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  Skeleton
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Label as LabelIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useLang } from '../i18n';
import { Link } from 'react-router-dom';

const LabelsPage = () => {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const { t } = useLang();

  useEffect(() => {
    loadLabels();
  }, []);

  const loadLabels = () => {
    api.getLabels()
      .then(data => {
        setLabels(data);
        setLoading(false);
      })
      .catch(err => {
        setError(t('error'));
        setLoading(false);
      });
  };

  const handleOpenDialog = (label = null) => {
    if (label) {
      setEditingLabel(label);
      setFormData({ name: label.name });
    } else {
      setEditingLabel(null);
      setFormData({ name: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLabel(null);
    setFormData({ name: '' });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const promise = editingLabel 
      ? api.updateLabel(editingLabel.id, formData)
      : api.createLabel(formData);

    promise
      .then(() => {
        loadLabels();
        handleCloseDialog();
      })
      .catch(err => {
        setError(t('error'));
      });
  };

  const handleDelete = (labelId) => {
    if (window.confirm(t('delete_confirm'))) {
      api.deleteLabel(labelId)
        .then(() => {
          loadLabels();
        })
        .catch(err => {
          setError(t('error'));
        });
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

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
            {t('labels_title')}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t('labels_subtitle')}
          </Typography>
        </Box>

        {/* Add Button */}
        <Box sx={{ mb: 3, textAlign: 'right' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
              }
            }}
          >
            {t('add_new_label')}
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Labels Grid */}
        <Grid container spacing={3}>
          {labels.map(label => (
            <Grid item xs={12} sm={6} md={4} key={label.id}>
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
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LabelIcon sx={{ mr: 1, fontSize: 24, color: '#FE6B8B' }} />
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        {label.name}
                      </Typography>
                    </Box>
                    <Chip 
                      component={Link}
                      to={`/feedback?label=${label.id}`}
                      label={`${label.sample_count || 0} ${t('samples_count')}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      clickable
                      sx={{ ml: 1, cursor: 'pointer', textDecoration: 'none' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(label)}
                      sx={{ color: '#2196F3' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(label.id)}
                      sx={{ color: '#F44336' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {labels.length === 0 && !loading && (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3
            }}
          >
            <LabelIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {t('no_labels')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('no_labels_desc')}
            </Typography>
          </Paper>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingLabel ? t('edit_label') : t('add_label')}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('label_name')}
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={!formData.name.trim()}
            >
              {editingLabel ? t('save') : t('add')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default LabelsPage; 