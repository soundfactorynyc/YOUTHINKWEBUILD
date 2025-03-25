// src/lib/ai/promptEngine.js
import { v4 as uuidv4 } from 'uuid';

// Mock data for website elements
const blockTypes = [
  'hero',
  'about',
  'features',
  'gallery',
  'testimonials',
  'pricing',
  'contact',
  'footer',
  'embed',
  'countdown',
  'products',
  'events',
  'blog',
  'subscribe',
  'team',
  'faq',
  'cta',
];

const vibeStyles = {
  dark: {
    colors: {
      primary: '#6d28d9',
      secondary: '#4f46e5',
      accent: '#ec4899',
      background: '#18181b',
      text: '#f4f4f5',
    },
    fonts: {
      heading: 'Orbitron',
      body: 'Inter',
    },
    spacing: 'compact',
    borderRadius: 'small',
  },
  light: {
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Roboto',
    },
    spacing: 'normal',
    borderRadius: 'medium',
  },
  minimal: {
    colors: {
      primary: '#000000',
      secondary: '#404040',
      accent: '#d4d4d4',
      background: '#ffffff',
      text: '#171717',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    spacing: 'spacious',
    borderRadius: 'none',
  },
  bold: {
    colors: {
      primary: '#ef4444',
      secondary: '#f97316',
      accent: '#f59e0b',
      background: '#fef2f2',
      text: '#0f172a',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Roboto',
    },
    spacing: 'normal',
    borderRadius: 'large',
  },
  retro: {
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#f59e0b',
      background: '#fdf4ff',
      text: '#581c87',
    },
    fonts: {
      heading: 'VT323',
      body: 'Space Mono',
    },
    spacing: 'compact',
    borderRadius: 'medium',
  },
  techno: {
    colors: {
      primary: '#10b981',
      secondary: '#3b82f6',
      accent: '#8b5cf6',
      background: '#0f172a',
      text: '#f8fafc',
    },
    fonts: {
      heading: 'Chakra Petch',
      body: 'Roboto Mono',
    },
    spacing: 'normal',
    borderRadius: 'small',
  },
};

// Export the main function that will be used by SiteGenerator.jsx
export async function processPrompt(prompt, vibe = 'light') {
  // In a real implementation, this would connect to OpenAI or Claude
  // For now, we'll use keyword matching and templates
  
  console.log('Processing prompt:', prompt);
  console.log('Selected vibe:', vibe);
  
  // Analyze the prompt to determine site purpose and features
  const analysis = analyzePrompt(prompt);
  
  // Select theme based on vibe or analysis
  const theme = vibeStyles[vibe] || vibeStyles.light;
  
  // Generate site structure based on analysis
  const siteStructure = generateSiteStructure(analysis, theme);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    ...siteStructure,
    theme
  };
}

// Function to process user prompt and generate website structure
export async function analyzePrompt(prompt) {
  const promptLower = prompt.toLowerCase();
  
  // Initialize analysis object
  const analysis = {
    niche: 'general',
    features: [],
    style: 'light',
    name: '',
    blocks: []
  };
  
  // Niche keywords
  const nicheKeywords = {
    music: ['dj', 'producer', 'band', 'musician', 'artist', 'singer', 'composer', 'rapper', 'songwriter'],
    art: ['artist', 'painter', 'sculptor', 'gallery', 'exhibition', 'creative', 'design', 'portfolio'],
    events: ['event', 'festival', 'conference', 'workshop', 'meetup', 'concert', 'show', 'party', 'wedding'],
    creators: ['YouTuber', 'streamer', 'podcaster', 'blogger', 'influencer', 'content creator'],
  };
  
  // Determine niche based on keywords
  for (const [niche, keywords] of Object.entries(nicheKeywords)) {
    if (keywords.some(keyword => promptLower.includes(keyword))) {
      analysis.niche = niche;
      break;
    }
  }
  
  // Check for requested features
  const featureKeywords = [
    { keyword: 'contact', feature: 'contact form' },
    { keyword: 'gallery', feature: 'image gallery' },
    { keyword: 'book', feature: 'booking form' },
    { keyword: 'portfolio', feature: 'portfolio' },
    { keyword: 'blog', feature: 'blog section' },
    { keyword: 'shop', feature: 'store' },
    { keyword: 'product', feature: 'products' },
    { keyword: 'testimonial', feature: 'testimonials' },
  ];
  
  featureKeywords.forEach(({ keyword, feature }) => {
    if (promptLower.includes(keyword)) {
      analysis.features.push(feature);
    }
  });
  
  // Determine blocks based on niche and features
  determineBlocks(analysis);
  
  return analysis;
}

// Determine which blocks to include based on analysis
function determineBlocks(analysis) {
  // Start with required blocks
  analysis.blocks.push('hero', 'about', 'footer');
  
  // Add niche-specific blocks
  switch (analysis.niche) {
    case 'music':
      analysis.blocks.push('embed', 'events');
      break;
    case 'art':
      analysis.blocks.push('gallery', 'portfolio');
      break;
    case 'events':
      analysis.blocks.push('events', 'countdown');
      break;
    case 'creators':
      analysis.blocks.push('embed', 'subscribe');
      break;
    default:
      break;
  }
  
  // Add feature-specific blocks
  const featureBlockMap = {
    'contact form': 'contact',
    'booking form': 'contact',
    'image gallery': 'gallery',
    'portfolio': 'portfolio',
    'blog section': 'blog',
    'store': 'products',
    'products': 'products',
    'testimonials': 'testimonials',
  };
  
  analysis.features.forEach(feature => {
    const block = featureBlockMap[feature];
    if (block && !analysis.blocks.includes(block)) {
      analysis.blocks.push(block);
    }
  });
  
  // Remove duplicates and ensure core blocks
  analysis.blocks = [...new Set(analysis.blocks)];
  
  return analysis;
}

// Generate site structure based on analysis
function generateSiteStructure(analysis, theme) {
  // Initialize site data
  const siteName = "New Website";
  const siteDescription = "Created with AI Site Generator";
  
  // Generate blocks based on analysis
  const blocks = [];
  
  // Add a default hero block
  blocks.push({
    id: uuidv4(),
    type: 'hero',
    content: {
      heading: "Welcome to Your New Website",
      subheading: "Created with AI Site Generator",
      ctaText: "Learn More",
      ctaLink: "#about",
    }
  });
  
  // Add a default about block
  blocks.push({
    id: uuidv4(),
    type: 'about',
    content: {
      heading: "About",
      text: "This is a section about your business or project. Replace this with your own content.",
    }
  });
  
  // Add a default contact block
  blocks.push({
    id: uuidv4(),
    type: 'contact',
    content: {
      heading: "Contact Us",
      subheading: "Get in touch",
      email: "contact@example.com",
      includeForm: true,
      formFields: ['name', 'email', 'message']
    }
  });
  
  // Add a default footer block
  blocks.push({
    id: uuidv4(),
    type: 'footer',
    content: {
      copyright: `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`,
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com/' },
        { platform: 'facebook', url: 'https://facebook.com/' },
        { platform: 'twitter', url: 'https://twitter.com/' }
      ]
    }
  });
  
  return {
    siteName,
    siteDescription,
    blocks
  };
}
