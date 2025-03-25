import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Button,
  Box,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const templates = [
  {
    id: 'portfolio',
    name: 'Professional Portfolio',
    description: 'A clean, modern portfolio for showcasing your work and skills.',
    image: 'https://placehold.co/600x400/333/white?text=Portfolio+Template',
    tags: ['Portfolio', 'Professional', 'Minimalist'],
    prompt: 'Create a professional portfolio website with a hero section, about me, skills, projects gallery, and contact form. Use a minimalist design with smooth animations.'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'A complete online store layout with product listings and cart.',
    image: 'https://placehold.co/600x400/333/white?text=E-commerce+Template',
    tags: ['E-commerce', 'Shop', 'Products'],
    prompt: 'Create an e-commerce website with a hero section featuring special offers, product categories, featured products grid, testimonials, and a newsletter signup. Include a sticky header with cart icon.'
  },
  {
    id: 'blog',
    name: 'Modern Blog',
    description: 'A content-focused blog design with excellent readability.',
    image: 'https://placehold.co/600x400/333/white?text=Blog+Template',
    tags: ['Blog', 'Content', 'Editorial'],
    prompt: 'Create a modern blog website with a featured posts slider, latest articles grid, categories sidebar, author profiles, and newsletter subscription. Optimize for readability with clean typography.'
  },
  {
    id: 'landing',
    name: 'SaaS Landing Page',
    description: 'High-conversion landing page for software products.',
    image: 'https://placehold.co/600x400/333/white?text=Landing+Page+Template',
    tags: ['Landing Page', 'SaaS', 'Conversion'],
    prompt: 'Create a SaaS landing page with a compelling hero section with call-to-action, feature highlights with icons, pricing comparison table, customer testimonials, FAQ accordion, and a sticky call-to-action header.'
  },
  {
    id: 'restaurant',
    name: 'Restaurant Website',
    description: 'Showcase your menu and accept reservations with style.',
    image: 'https://placehold.co/600x400/333/white?text=Restaurant+Template',
    tags: ['Restaurant', 'Food', 'Reservations'],
    prompt: 'Create a restaurant website with an attractive hero image, about section with the restaurant story, full menu with categories, chef profiles, image gallery, testimonials, reservation form, and contact information with Google Maps integration.'
  },
  {
    id: 'agency',
    name: 'Creative Agency',
    description: 'Bold, creative design for agencies and creative professionals.',
    image: 'https://placehold.co/600x400/333/white?text=Agency+Template',
    tags: ['Agency', 'Creative', 'Services'],
    prompt: 'Create a creative agency website with a bold, modern design. Include a dynamic hero section with particle animation, services offered, team members, past work portfolio with filtering, client logos, testimonials, and a creative contact form.'
  }
];

const TemplateGallery = () => {
  const navigate = useNavigate();

  const handleSelectTemplate = (template) => {
    // Navigate to site generator with the template prompt
    navigate('/generate', { 
      state: { 
        templatePrompt: template.prompt,
        templateName: template.name
      } 
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Template Gallery
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Choose a template to jumpstart your website creation. Each template can be fully customized after selection.
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={template.image}
                alt={template.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {template.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {template.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => handleSelectTemplate(template)}
                  fullWidth
                >
                  Use This Template
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TemplateGallery;
