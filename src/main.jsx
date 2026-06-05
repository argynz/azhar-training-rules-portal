import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App.jsx';
import './styles.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#245c73',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8a5a44',
    },
    success: {
      main: '#2f7d5a',
    },
    warning: {
      main: '#b26a00',
    },
    background: {
      default: '#f6f8f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2a2e',
      secondary: '#607077',
    },
  },
  typography: {
    fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: 0 },
    h2: { fontSize: '1.35rem', fontWeight: 700, letterSpacing: 0 },
    h3: { fontSize: '1.05rem', fontWeight: 700, letterSpacing: 0 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: {
    borderRadius: 8,
  },
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
