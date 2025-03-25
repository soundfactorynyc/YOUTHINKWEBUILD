// src/pages/SiteGenerator.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useEditorStore } from '../store/editorStore';
import { processPrompt } from '../lib/ai/promptEngine';

const vibeOptions = [
  { id: 'light', label: 'Light & Clean' },
  { id: 'dark', label: 'Dark & Modern' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold & Vibrant' },
  { id: 'retro', label: 'Retro' },
  { id: 'techno', label: 'Techno & Futuristic' },
  { id: 'elegant', label: 'Elegant & Sophisticated' },
  { id: 'playful', label: 'Playful & Energetic' },
  { id: 'corporate', label: 'Corporate & Professional' },
];

const audienceOptions = [
  { id: 'general', label: 'General Audience' },
  { id: 'professional', label: 'Professional/Business' },
  { id: 'creative', label: 'Creative/Artistic' },
  { id: 'technical', label: 'Technical/Developer' },
  { id: 'educational', label: 'Educational/Academic' },
];

const SiteGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { generateFromPrompt, saveSite } = useEditorStore();
  
  const [prompt, setPrompt] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('light');
  const [selectedAudience, setSelectedAudience] = useState('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  
  // Advanced settings
  const [seoOptimize, setSeoOptimize] = useState(true);
  const [contentDepth, setContentDepth] = useState('balanced'); // minimal, balanced, comprehensive
  const [businessGoal, setBusinessGoal] = useState('informational'); // informational, lead-generation, e-commerce
  
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };
  
  const handleVibeChange = (vibe) => {
    setSelectedVibe(vibe);
  };
  
  const handleAudienceChange = (audience) => {
    setSelectedAudience(audience);
  };
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe the website you want to build');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Prepare AI parameters including advanced settings
      const aiParameters = {
        prompt,
        vibe: selectedVibe,
        audience: selectedAudience,
        seoOptimize,
        contentDepth,
        businessGoal,
        advancedMode
      };
      
      // Process the prompt using our enhanced AI engine
      const generatedSite = await processPrompt(prompt, selectedVibe);
      
      // Update the editor store with generated content
      await generateFromPrompt(prompt, selectedVibe, aiParameters);
      
      // Save the generated site to Firestore
      const siteId = await saveSite(user.uid);
      
      // Navigate to the editor with the new site
      navigate(`/editor/${siteId}`);
    } catch (err) {
      console.error('Error generating site:', err);
      setError('An error occurred while generating your site. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Generate prompt suggestions based on selected business goal
  const promptSuggestions = [
    "Create a professional portfolio website for a graphic designer with a minimal style.",
    "Build an online store for handmade jewelry with product listings and customer testimonials.",
    "Design a website for a music producer with sound samples and a booking system.",
    "Make a personal blog with categories for travel, food, and lifestyle content."
  ];
  
  // Smart help insights based on prompt analysis
  const [promptInsights, setPromptInsights] = useState(null);
  
  // Analyze prompt as user types (simplified for example)
  const analyzePromptRealtime = (prompt) => {
    // In a real implementation, this would call a lightweight version of the AI
    // For this example, we'll use simple keyword matching
    
    if (prompt.includes('portfolio') || prompt.includes('showcase')) {
      setPromptInsights({
        recommendedBlocks: ['gallery', 'about', 'contact', 'testimonials'],
        recommendedVibe: 'minimal',
        insights: 'Portfolio sites work best with a clean, minimal design that lets your work be the focus.'
      });
    } else if (prompt.includes('store') || prompt.includes('shop') || prompt.includes('product')) {
      setPromptInsights({
        recommendedBlocks: ['products', 'features', 'testimonials', 'faq'],
        recommendedVibe: 'light',
        insights: 'For e-commerce, consider adding strong calls to action and clear product images.'
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-8">
            <h1 className="text-3xl font-bold text-center mb-2">Create Your Website</h1>
            <p className="text-gray-600 text-center mb-8">
              Describe what you want to build, and our AI will create it for you
            </p>
            
            {/* Prompt Input */}
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Website
              </label>
              <textarea
                id="prompt"
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="E.g., I need a portfolio website for my photography business with a gallery, about section, and contact form..."
                value={prompt}
                onChange={(e) => {
                  handlePromptChange(e);
                  analyzePromptRealtime(e.target.value);
                }}
              />
              
              {/* Prompt Suggestions */}
              <div className="mt-2 flex flex-wrap gap-2">
                {promptSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded-full"
                    onClick={() => setPrompt(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              {/* AI Insights */}
              {promptInsights && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="font-medium text-blue-800">AI Suggests:</p>
                  <p className="text-blue-700">{promptInsights.insights}</p>
                  {promptInsights.recommendedVibe && (
                    <button 
                      className="text-blue-600 underline mt-1"
                      onClick={() => setSelectedVibe(promptInsights.recommendedVibe)}
                    >
                      Apply recommended style
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Basic Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Vibe Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {vibeOptions.map((vibe) => (
                    <button
                      key={vibe.id}
                      type="button"
                      className={`px-4 py-2 rounded-md text-sm ${
                        selectedVibe === vibe.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => handleVibeChange(vibe.id)}
                    >
                      {vibe.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Audience Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {audienceOptions.map((audience) => (
                    <button
                      key={audience.id}
                      type="button"
                      className={`px-4 py-2 rounded-md text-sm ${
                        selectedAudience === audience.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => handleAudienceChange(audience.id)}
                    >
                      {audience.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Advanced Options Toggle */}
            <div className="mb-6">
              <button
                type="button"
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                onClick={() => setAdvancedMode(!advancedMode)}
              >
                {advancedMode ? (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Hide Advanced Options
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show Advanced Options
                  </>
                )}
              </button>
            </div>
            
            {/* Advanced Options Panel */}
            {advancedMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-4 border border-gray-200 rounded-lg"
              >
                <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>
                
                {/* SEO Optimization */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      SEO Optimization
                    </label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="seo-toggle"
                        checked={seoOptimize}
                        onChange={() => setSeoOptimize(!seoOptimize)}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label
                        htmlFor="seo-toggle"
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                          seoOptimize ? 'bg-indigo-500' : 'bg-gray-300'
                        }`}
                      ></label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Generate SEO-optimized content and meta tags
                  </p>
                </div>
                
                {/* Content Depth */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Depth
                  </label>
                  <div className="flex space-x-2">
                    {['minimal', 'balanced', 'comprehensive'].map((depth) => (
                      <button
                        key={depth}
                        type="button"
                        className={`px-3 py-1 rounded text-sm ${
                          contentDepth === depth
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => setContentDepth(depth)}
                      >
                        {depth.charAt(0).toUpperCase() + depth.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Business Goal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Website Goal
                  </label>
                  <div className="flex space-x-2">
                    {[
                      { id: 'informational', label: 'Informational' },
                      { id: 'lead-generation', label: 'Lead Generation' },
                      { id: 'e-commerce', label: 'E-Commerce' }
                    ].map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        className={`px-3 py-1 rounded text-sm ${
                          businessGoal === goal.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => setBusinessGoal(goal.id)}
                      >
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {/* Generate Button */}
            <div className="flex justify-center">
              <button
                type="button"
                className={`px-8 py-3 rounded-lg text-white font-medium text-lg shadow-md
                  ${isGenerating
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Website'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SiteGenerator;
