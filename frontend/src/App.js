import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import FeedbackPage from './pages/FeedbackPage';
import LabelsPage from './pages/LabelsPage';
import EditFeedbackPage from './pages/EditFeedbackPage';
import './App.css';
import { LanguageProvider, useLang } from './i18n';

// ایجاد تم سفارشی
const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Vazir, Roboto, Arial, sans-serif',
  },
  palette: {
    primary: {
      main: '#FE6B8B',
    },
    secondary: {
      main: '#FF8E53',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function ThemedApp() {
  const { lang } = useLang();
  const theme = React.useMemo(() => createTheme({
    direction: lang === 'fa' ? 'rtl' : 'ltr',
    typography: {
      fontFamily: 'Vazir, Roboto, Arial, sans-serif',
    },
    palette: {
      primary: {
        main: '#FE6B8B',
      },
      secondary: {
        main: '#FF8E53',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 'bold',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  }), [lang]);

  React.useEffect(() => {
    if (lang === 'en') {
      document.body.dir = 'ltr';
      document.body.style.textAlign = 'left';
    } else {
      document.body.dir = '';
      document.body.style.textAlign = '';
    }
  }, [lang]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/predict" element={<PredictPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/labels" element={<LabelsPage />} />
            <Route path="/feedback/:id/edit" element={<EditFeedbackPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemedApp />
    </LanguageProvider>
  );
}

export default App;
