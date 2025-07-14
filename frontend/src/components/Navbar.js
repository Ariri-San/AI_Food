import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Typography as MuiTypography,
  Grid
} from '@mui/material';
import { 
  Home as HomeIcon, 
  List as ListIcon, 
  Settings as SettingsIcon,
  Restaurant as RestaurantIcon,
  Language as LanguageIcon,
  Psychology as MLIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import Drawer from '@mui/material/Drawer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLang } from '../i18n';
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { lang, setLang, t } = useLang();

  // Machine Learning Dialog State
  const [mlDialogOpen, setMlDialogOpen] = React.useState(false);
  const [retraining, setRetraining] = React.useState(false);
  const [retrainResult, setRetrainResult] = React.useState(null);
  const [retrainError, setRetrainError] = React.useState('');

  // Drawer State
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const menuItems = [
    { text: t('home'), path: '/', icon: <HomeIcon /> },
    { text: t('predict'), path: '/predict', icon: <RestaurantIcon /> },
    { text: t('feedbacks'), path: '/feedback', icon: <ListIcon /> },
    { text: t('labels'), path: '/labels', icon: <SettingsIcon /> }
  ];

  // Language menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleLangClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleLangClose = () => {
    setAnchorEl(null);
  };
  const handleLangChange = (lng) => {
    setLang(lng);
    setAnchorEl(null);
  };

  // Machine Learning Functions
  const handleMLClick = () => {
    setMlDialogOpen(true);
    setRetrainResult(null);
    setRetrainError('');
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainResult(null);
    setRetrainError('');
    
    try {
      const result = await api.retrainModel();
      setRetrainResult(result);
    } catch (error) {
      setRetrainError(error.message || 'خطا در آموزش مجدد مدل');
    } finally {
      setRetraining(false);
    }
  };

  const handleCloseMLDialog = () => {
    setMlDialogOpen(false);
    setRetrainResult(null);
    setRetrainError('');
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RestaurantIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              AI Food Recognition
            </Typography>
          </Box>
          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 250, p: 2 }}>
                  {menuItems.map((item) => (
                    <Button
                      key={item.path}
                      color="inherit"
                      startIcon={item.icon}
                      onClick={() => { setDrawerOpen(false); navigate(item.path); }}
                      sx={{
                        justifyContent: 'flex-start',
                        width: '100%',
                        mb: 1,
                        backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        minWidth: 'auto',
                        fontSize: '0.95rem'
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                  <Button
                    color="inherit"
                    startIcon={<MLIcon />}
                    onClick={() => { setDrawerOpen(false); handleMLClick(); }}
                    sx={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      mb: 1,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      },
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      minWidth: 'auto',
                      fontSize: '0.95rem'
                    }}
                  >
                    {t('ml_training')}
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<LanguageIcon />}
                    onClick={handleLangClick}
                    sx={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      minWidth: 'auto',
                      fontSize: '0.95rem'
                    }}
                  >
                    {t(lang)}
                  </Button>
                </Box>
              </Drawer>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleLangClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem selected={lang === 'fa'} onClick={() => handleLangChange('fa')}>{t('fa')}</MenuItem>
                <MenuItem selected={lang === 'en'} onClick={() => handleLangChange('en')}>{t('en')}</MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    minWidth: 120,
                    fontSize: '0.875rem'
                  }}
                >
                  {item.text}
                </Button>
              ))}
              <Button
                color="inherit"
                startIcon={<MLIcon />}
                onClick={handleMLClick}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  minWidth: 120,
                  fontSize: '0.875rem'
                }}
              >
                {t('ml_training')}
              </Button>
              <IconButton
                color="inherit"
                onClick={handleLangClick}
                sx={{ ml: 1 }}
              >
                <LanguageIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleLangClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem selected={lang === 'fa'} onClick={() => handleLangChange('fa')}>{t('fa')}</MenuItem>
                <MenuItem selected={lang === 'en'} onClick={() => handleLangChange('en')}>{t('en')}</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
      
      {/* Machine Learning Dialog */}
      <Dialog 
        open={mlDialogOpen} 
        onClose={handleCloseMLDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MLIcon sx={{ mr: 1 }} />
            {t('ml_training')}
          </Box>
        </DialogTitle>
        <DialogContent>
          <MuiTypography variant="body2" sx={{ mb: 3 }}>
            {t('ml_training_desc')}
          </MuiTypography>
          
          {retraining && (
            <Box sx={{ mb: 3 }}>
              <MuiTypography variant="body2" sx={{ mb: 1 }}>
                {t('training_in_progress')}
              </MuiTypography>
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
          
          {retrainError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {retrainError}
            </Alert>
          )}
          
          {retrainResult && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                {t('training_completed')}
              </Alert>
              
              {/* Training Statistics */}
              {retrainResult.stats && (
                <Box sx={{ mb: 3 }}>
                  <MuiTypography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {t('training_stats')}:
                  </MuiTypography>
                  <Box sx={{ 
                    backgroundColor: '#e3f2fd', 
                    p: 2, 
                    borderRadius: 1,
                    border: '1px solid #2196f3'
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <MuiTypography variant="body2" color="text.secondary">
                          {t('total_samples')}:
                        </MuiTypography>
                        <MuiTypography variant="h6" color="primary">
                          {retrainResult.stats.total_samples || 0}
                        </MuiTypography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <MuiTypography variant="body2" color="text.secondary">
                          {t('labeled_samples')}:
                        </MuiTypography>
                        <MuiTypography variant="h6" color="primary">
                          {retrainResult.stats.labeled_samples || 0}
                        </MuiTypography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <MuiTypography variant="body2" color="text.secondary">
                          {t('total_labels')}:
                        </MuiTypography>
                        <MuiTypography variant="h6" color="primary">
                          {retrainResult.stats.total_labels || 0}
                        </MuiTypography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <MuiTypography variant="body2" color="text.secondary">
                          {t('last_retrain')}:
                        </MuiTypography>
                        <MuiTypography variant="body2" color="primary">
                          {retrainResult.stats.last_retrain ? 
                            new Date(retrainResult.stats.last_retrain).toLocaleString() : 
                            t('unknown')
                          }
                        </MuiTypography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              )}
              
              <MuiTypography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                {t('training_logs')}:
              </MuiTypography>
              <Box 
                sx={{ 
                  backgroundColor: '#f5f5f5', 
                  p: 2, 
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  maxHeight: 300,
                  overflow: 'auto',
                  border: '1px solid #ddd'
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {retrainResult.output || retrainResult.message || 'No logs available'}
                </pre>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMLDialog}>
            {t('close')}
          </Button>
          <Button 
            onClick={handleRetrain}
            variant="contained"
            disabled={retraining}
            sx={{
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
              }
            }}
          >
            {retraining ? t('training') : t('start_training')}
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar; 