import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  CardActions 
} from '@mui/material';
import { Link } from 'react-router-dom';
import CodeIcon from '@mui/icons-material/Code';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const Home = () => {
  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8,
          px: 2
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Build Websites with AI
              </Typography>
              <Typography variant="h5" component="p" gutterBottom>
                Describe your idea, and we'll build your website in seconds.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large" 
                  component={Link} 
                  to="/generate"
                  sx={{ mr: 2, mb: 2 }}
                >
                  Try It Now
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large" 
                  component={Link} 
                  to="/signup"
                  sx={{ mb: 2 }}
                >
                  Sign Up Free
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: 2,
                  boxShadow: 3
                }}
              >
                <Typography variant="body1" component="pre" sx={{ color: '#e0e0e0', fontFamily: 'monospace', overflowX: 'auto' }}>
                  {"// Just describe what you want\n"}
                  {"const myWebsite = await AI.generate({\n"}
                  {"  description: \"A professional portfolio site\",\n"}
                  {"  features: [\"responsive\", \"dark mode\", \"contact form\"],\n"}
                  {"  style: \"minimalist\"\n"}
                  {"});"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <AutoFixHighIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Describe Your Idea
                </Typography>
                <Typography variant="body1">
                  Tell our AI what kind of website you want. Be as detailed or as vague as you like - our AI can work with anything.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <CodeIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  AI Generates Your Site
                </Typography>
                <Typography variant="body1">
                  Our advanced AI creates custom HTML, CSS, and JavaScript code based on your description, optimized for performance and responsiveness.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <SpeedIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Deploy In Seconds
                </Typography>
                <Typography variant="body1">
                  Preview your site instantly, make any adjustments, and deploy to your hosting service with a single click.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button size="small" component={Link} to="/signup">Get Started</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
