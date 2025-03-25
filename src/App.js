import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import pages and components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SiteGenerator from './pages/SiteGenerator';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TemplateGallery from './pages/TemplateGallery';
import ProtectedRoute from './components/ProtectedRoute';

// Create a dark theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Light blue
    },
    secondary: {
      main: '#f48fb1', // Pink
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/generate" 
            element={
              <ProtectedRoute>
                <SiteGenerator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/templates" 
            element={
              <ProtectedRoute>
                <TemplateGallery />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit/:projectId" 
            element={
              <ProtectedRoute>
                <SiteGenerator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/preview/:projectId" 
            element={
              <ProtectedRoute>
                <SiteGenerator />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
