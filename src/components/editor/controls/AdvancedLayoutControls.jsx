// src/components/editor/controls/AdvancedLayoutControls.jsx
import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, Globe, Columns, Grid, Smartphone, Tablet, Monitor, Palette, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEditorStore } from '../../../store/editorStore';

// Color contrast utilities
const luminance = (r, g, b) => {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const contrastRatio = (rgb1, rgb2) => {
  const lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

const AdvancedLayoutControls = ({ selectedBlock }) => {
  const { updateBlock, theme } = useEditorStore();
  const [activeTab, setActiveTab] = useState('layout');
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');
  const [layoutType, setLayoutType] = useState('flex');
  const [showA11yPanel, setShowA11yPanel] = useState(false);
  const [language, setLanguage] = useState('en');
  const [direction, setDirection] = useState('ltr');
  
  // Layout settings
  const [layoutSettings, setLayoutSettings] = useState({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '16px',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'auto',
    gridGap: '16px',
    padding: '16px',
    margin: '0',
    width: '100%',
    height: 'auto',
    maxWidth: '100%',
    responsive: {
      mobile: {
        display: 'flex',
        flexDirection: 'column',
        padding: '8px',
      },
      tablet: {
        display: 'flex',
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      desktop: {
        display: 'flex',
        gridTemplateColumns: 'repeat(4, 1fr)',
      },
    },
  });

  // Accessibility metrics
  const [a11yMetrics, setA11yMetrics] = useState({
    contrastIssues: 0,
    missingAria: 0,
    semanticStructure: true,
    altText: true,
  });

  // Languages available
  const languages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', dir: 'rtl' },
    { code: 'he', name: 'Hebrew', dir: 'rtl' },
    { code: 'fr', name: 'French', dir: 'ltr' },
    { code: 'es', name: 'Spanish', dir: 'ltr' },
    { code: 'de', name: 'German', dir: 'ltr' },
    { code: 'ja', name: 'Japanese', dir: 'ltr' },
    { code: 'zh', name: 'Chinese', dir: 'ltr' },
  ];

  useEffect(() => {
    if (selectedBlock && selectedBlock.content && selectedBlock.content.layout) {
      setLayoutSettings(selectedBlock.content.layout);
      setLayoutType(selectedBlock.content.layout.display === 'grid' ? 'grid' : 'flex');
    }
    
    // Perform accessibility check
    performAccessibilityCheck();
  }, [selectedBlock]);

  const performAccessibilityCheck = () => {
    if (!selectedBlock) return;
    
    // Check contrast ratio
    let contrastIssues = 0;
    const bgColor = hexToRgb(theme.colors.background);
    const textColor = hexToRgb(theme.colors.text);
    const contrastScore = contrastRatio(bgColor, textColor);
    
    if (contrastScore < 4.5) {
      contrastIssues++;
    }
    
    // Check for missing ARIA attributes
    let missingAria = 0;
    if (selectedBlock.type === 'button' && !selectedBlock.content.ariaLabel) {
      missingAria++;
    }
    
    // Check for alt text in images
    const hasAltText = !(selectedBlock.type === 'image' && !selectedBlock.content.alt);
    
    setA11yMetrics({
      contrastIssues,
      missingAria,
      semanticStructure: true,
      altText: hasAltText
    });
  };

  const handleLayoutChange = (property, value) => {
    const newLayoutSettings = { ...layoutSettings };
    
    if (currentBreakpoint === 'desktop') {
      newLayoutSettings[property] = value;
    } else {
      newLayoutSettings.responsive[currentBreakpoint][property] = value;
    }
    
    setLayoutSettings(newLayoutSettings);
    
    // Update the block with new layout settings
    if (selectedBlock) {
      updateBlock(selectedBlock.id, {
        layout: newLayoutSettings
      });
    }
  };

  const handleLayoutTypeChange = (type) => {
    setLayoutType(type);
    
    const newDisplay = type === 'grid' ? 'grid' : 'flex';
    handleLayoutChange('display', newDisplay);
  };

  const handleLanguageChange = (lang) => {
    const selectedLang = languages.find(l => l.code === lang);
    setLanguage(lang);
    setDirection(selectedLang.dir);
    
    if (selectedBlock) {
      updateBlock(selectedBlock.id, {
        language: lang,
        direction: selectedLang.dir
      });
    }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
        activeTab === id
          ? 'bg-primary/10 text-primary'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  const BreakpointButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setCurrentBreakpoint(id)}
      className={`flex flex-col items-center justify-center p-2 rounded-md ${
        currentBreakpoint === id
          ? 'bg-primary/10 text-primary border border-primary/30'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={currentBreakpoint === id ? 20 : 16} />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );

  const GridControlPanel = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Grid Template Columns</label>
        <select
          value={layoutSettings.gridTemplateColumns}
          onChange={(e) => handleLayoutChange('gridTemplateColumns', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="repeat(1, 1fr)">1 Column</option>
          <option value="repeat(2, 1fr)">2 Columns (Equal)</option>
          <option value="repeat(3, 1fr)">3 Columns (Equal)</option>
          <option value="repeat(4, 1fr)">4 Columns (Equal)</option>
          <option value="1fr 2fr">2 Columns (1:2 Ratio)</option>
          <option value="2fr 1fr">2 Columns (2:1 Ratio)</option>
          <option value="1fr 1fr 2fr">3 Columns (1:1:2 Ratio)</option>
          <option value="minmax(0, 1fr) 300px">Content + Sidebar</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Grid Gap</label>
        <input
          type="range"
          min="0"
          max="40"
          value={parseInt(layoutSettings.gridGap)}
          onChange={(e) => handleLayoutChange('gridGap', `${e.target.value}px`)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0px</span>
          <span>20px</span>
          <span>40px</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Justify Items</label>
          <select
            value={layoutSettings.justifyItems || 'start'}
            onChange={(e) => handleLayoutChange('justifyItems', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="start">Start</option>
            <option value="end">End</option>
            <option value="center">Center</option>
            <option value="stretch">Stretch</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Align Items</label>
          <select
            value={layoutSettings.alignItems || 'start'}
            onChange={(e) => handleLayoutChange('alignItems', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="start">Start</option>
            <option value="end">End</option>
            <option value="center">Center</option>
            <option value="stretch">Stretch</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center justify-center p-4 border rounded-md bg-gray-50">
        <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-primary/20 h-8 rounded-md flex items-center justify-center text-xs text-primary"
            >
              {i}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const FlexControlPanel = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Flex Direction</label>
        <div className="grid grid-cols-2 gap-2">
          {['row', 'column', 'row-reverse', 'column-reverse'].map((direction) => (
            <button
              key={direction}
              onClick={() => handleLayoutChange('flexDirection', direction)}
              className={`px-3 py-2 border rounded-md text-sm ${
                layoutSettings.flexDirection === direction
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'hover:bg-gray-50'
              }`}
            >
              {direction}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Justify Content</label>
          <select
            value={layoutSettings.justifyContent}
            onChange={(e) => handleLayoutChange('justifyContent', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="flex-start">Start</option>
            <option value="flex-end">End</option>
            <option value="center">Center</option>
            <option value="space-between">Space Between</option>
            <option value="space-around">Space Around</option>
            <option value="space-evenly">Space Evenly</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Align Items</label>
          <select
            value={layoutSettings.alignItems}
            onChange={(e) => handleLayoutChange('alignItems', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="flex-start">Start</option>
            <option value="flex-end">End</option>
            <option value="center">Center</option>
            <option value="stretch">Stretch</option>
            <option value="baseline">Baseline</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Gap</label>
        <input
          type="range"
          min="0"
          max="40"
          value={parseInt(layoutSettings.gap)}
          onChange={(e) => handleLayoutChange('gap', `${e.target.value}px`)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0px</span>
          <span>20px</span>
          <span>40px</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Wrap</label>
        <div className="flex space-x-2">
          {['nowrap', 'wrap', 'wrap-reverse'].map((wrap) => (
            <button
              key={wrap}
              onClick={() => handleLayoutChange('flexWrap', wrap)}
              className={`px-3 py-2 border rounded-md text-sm flex-1 ${
                layoutSettings.flexWrap === wrap
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'hover:bg-gray-50'
              }`}
            >
              {wrap}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const AccessibilityPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Accessibility Score</h3>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded-full ${a11yMetrics.contrastIssues > 0 || a11yMetrics.missingAria > 0 || !a11yMetrics.altText ? 'bg-orange-400' : 'bg-green-400'}`}></div>
          <span className="text-sm">{a11yMetrics.contrastIssues > 0 || a11yMetrics.missingAria > 0 || !a11yMetrics.altText ? 'Issues Detected' : 'Good'}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-1">
            <Palette size={16} />
            Color Contrast
          </span>
          <span className={`text-sm ${a11yMetrics.contrastIssues > 0 ? 'text-orange-500' : 'text-green-500'}`}>
            {a11yMetrics.contrastIssues > 0 ? 'Low Contrast' : 'Good'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-1">
            <AlertTriangle size={16} />
            ARIA Attributes
          </span>
          <span className={`text-sm ${a11yMetrics.missingAria > 0 ? 'text-orange-500' : 'text-green-500'}`}>
            {a11yMetrics.missingAria > 0 ? 'Missing Attributes' : 'Complete'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-1">
            <Eye size={16} />
            Alt Text
          </span>
          <span className={`text-sm ${!a11yMetrics.altText ? 'text-orange-500' : 'text-green-500'}`}>
            {!a11yMetrics.altText ? 'Missing' : 'Present'}
          </span>
        </div>
      </div>
      
      <div className="p-3 bg-gray-50 rounded-md border">
        <h4 className="text-sm font-medium mb-2">Recommendations</h4>
        <ul className="space-y-1 text-xs">
          {a11yMetrics.contrastIssues > 0 && (
            <li className="flex items-start gap-1">
              <AlertTriangle size={12} className="text-orange-500 mt-0.5" />
              <span>Increase the contrast between text and background colors.</span>
            </li>
          )}
          {a11yMetrics.missingAria > 0 && (
            <li className="flex items-start gap-1">
              <AlertTriangle size={12} className="text-orange-500 mt-0.5" />
              <span>Add aria-label attributes to interactive elements.</span>
            </li>
          )}
          {!a11yMetrics.altText && (
            <li className="flex items-start gap-1">
              <AlertTriangle size={12} className="text-orange-500 mt-0.5" />
              <span>Add descriptive alt text to all images.</span>
            </li>
          )}
          {a11yMetrics.contrastIssues === 0 && a11yMetrics.missingAria === 0 && a11yMetrics.altText && (
            <li className="flex items-start gap-1">
              <Check size={12} className="text-green-500 mt-0.5" />
              <span>All accessibility checks passed!</span>
            </li>
          )}
        </ul>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Screen Reader Preview</label>
        <div className="p-3 bg-gray-50 border rounded-md text-sm">
          {selectedBlock?.type === 'heading' && selectedBlock?.content?.text ? (
            <p>Heading level {selectedBlock?.content?.level || 1}: {selectedBlock?.content?.text}</p>
          ) : selectedBlock?.type === 'image' ? (
            <p>Image: {selectedBlock?.content?.alt || 'No alt text provided'}</p>
          ) : selectedBlock?.type === 'button' ? (
            <p>Button: {selectedBlock?.content?.text || 'Unlabeled button'}</p>
          ) : (
            <p>Select an element to see screen reader preview</p>
          )}
        </div>
      </div>
    </div>
  );

  const LanguagePanel = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Content Language</label>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} {lang.dir === 'rtl' ? '(RTL)' : ''}
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Text Direction</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setDirection('ltr')}
            disabled={language === 'ar' || language === 'he'}
            className={`px-3 py-2 border rounded-md text-sm flex-1 ${
              direction === 'ltr'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'hover:bg-gray-50'
            } ${language === 'ar' || language === 'he' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Left to Right (LTR)
          </button>
          <button
            onClick={() => setDirection('rtl')}
            disabled={language !== 'ar' && language !== 'he'}
            className={`px-3 py-2 border rounded-md text-sm flex-1 ${
              direction === 'rtl'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'hover:bg-gray-50'
            } ${language !== 'ar' && language !== 'he' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Right to Left (RTL)
          </button>
        </div>
      </div>
      
      <div className="p-3 border rounded-md bg-gray-50 space-y-2">
        <h4 className="text-sm font-medium">Typography Settings</h4>
        
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Font Family</label>
          <select
            className="w-full px-3 py-1.5 border rounded-md text-sm"
            value={selectedBlock?.content?.fontFamily || theme.fonts.body}
            onChange={(e) => {
              if (selectedBlock) {
                updateBlock(selectedBlock.id, {
                  fontFamily: e.target.value
                });
              }
            }}
          >
            <option value="Inter">Inter (Latin)</option>
            <option value="Roboto">Roboto (Latin)</option>
            <option value="Noto Sans">Noto Sans (Multi-language)</option>
            <option value="Noto Sans Arabic">Noto Sans Arabic (Arabic)</option>
            <option value="Noto Sans Hebrew">Noto Sans Hebrew (Hebrew)</option>
            <option value="Noto Sans JP">Noto Sans JP (Japanese)</option>
            <option value="Noto Sans SC">Noto Sans SC (Chinese)</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Font Size</label>
          <select
            className="w-full px-3 py-1.5 border rounded-md text-sm"
            value={selectedBlock?.content?.fontSize || 'md'}
            onChange={(e) => {
              if (selectedBlock) {
                updateBlock(selectedBlock.id, {
                  fontSize: e.target.value
                });
              }
            }}
          >
            <option value="xs">Extra Small</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
            <option value="2xl">2X Large</option>
          </select>
        </div>
      </div>
      
      <div className="p-3 border rounded-md bg-gray-50">
        <h4 className="text-sm font-medium mb-2">Translation Preview</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>English</span>
            <span>Selected Language</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-white border rounded">
              {selectedBlock?.content?.text || 'No text content'}
            </div>
            <div className={`p-2 bg-white border rounded ${direction === 'rtl' ? 'text-right' : ''}`} dir={direction}>
              {selectedBlock?.content?.translations?.[language] || 'Add translation'}
            </div>
          </div>
          <button
            className="w-full mt-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm hover:bg-primary/20"
            onClick={() => {
              if (selectedBlock) {
                const translations = selectedBlock.content.translations || {};
                updateBlock(selectedBlock.id, {
                  translations: {
                    ...translations,
                    [language]: 'Translation placeholder'
                  }
                });
              }
            }}
          >
            + Add Translation
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">Advanced Layout</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowA11yPanel(!showA11yPanel)}
            className="p-1.5 rounded-md hover:bg-gray-100"
            title="Accessibility Check"
          >
            <AlertTriangle size={16} className={a11yMetrics.contrastIssues > 0 || a11yMetrics.missingAria > 0 || !a11yMetrics.altText ? 'text-orange-500' : 'text-green-500'} />
          </button>
        </div>
      </div>
      
      {showA11yPanel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-b py-3"
        >
          <AccessibilityPanel />
        </motion.div>
      )}
      
      <div className="flex space-x-2 border-b pb-2">
        <TabButton id="layout" label="Layout" icon={Grid} />
        <TabButton id="responsive" label="Responsive" icon={Smartphone} />
        <TabButton id="language" label="Language" icon={Globe} />
      </div>
      
      {activeTab === 'layout' && (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleLayoutTypeChange('flex')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                layoutType === 'flex'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                </div>
              </div>
              <span>Flexbox</span>
            </button>
            
            <button
              onClick={() => handleLayoutTypeChange('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                layoutType === 'grid'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Grid size={16} />
              <span>CSS Grid</span>
            </button>
          </div>
          
          {layoutType === 'grid' ? <GridControlPanel /> : <FlexControlPanel />}
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Spacing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Padding</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="64"
                    value={parseInt(layoutSettings.padding)}
                    onChange={(e) => handleLayoutChange('padding', `${e.target.value}px`)}
                    className="flex-1"
                  />
                  <span className="ml-2 text-xs w-10">{layoutSettings.padding}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Margin</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="64"
                    value={parseInt(layoutSettings.margin) || 0}
                    onChange={(e) => handleLayoutChange('margin', `${e.target.value}px`)}
                    className="flex-1"
                  />
                  <span className="ml-2 text-xs w-10">{layoutSettings.margin || '0px'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'responsive' && (
        <div className="space-y-4">
          <div className="flex justify-center space-x-4 pb-2">
            <BreakpointButton id="mobile" label="Mobile" icon={Smartphone} />
            <BreakpointButton id="tablet" label="Tablet" icon={Tablet} />
            <BreakpointButton id="desktop" label="Desktop" icon={Monitor} />
          </div>
          
          <div className="p-3 bg-gray-50 border rounded-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Breakpoint Preview</h3>
              <span className="text-xs text-gray-500">
                {currentBreakpoint === 'mobile' ? '< 768px' : 
                 currentBreakpoint === 'tablet' ? '768px - 1024px' : 
                 '> 1024px'}
              </span>
            </div>
            
            <div className={`mx-auto border border-dashed rounded-md flex items-center justify-center py-4 ${
              currentBreakpoint === 'mobile' ? 'w-64' :
              currentBreakpoint === 'tablet' ? 'w-3/4' :
              'w-full'
            }`}>
              <div className="text-center text-sm text-gray-500">
                <span>{currentBreakpoint} view</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Responsive Settings</h3>
            
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Display</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={layoutSettings.responsive[currentBreakpoint].display || 'flex'}
                onChange={(e) => {
                  const newSettings = {...layoutSettings};
                  newSettings.responsive[currentBreakpoint].display = e.target.value;
                  setLayoutSettings(newSettings);
                  
                  if (selectedBlock) {
                    updateBlock(selectedBlock.id, {
                      layout: newSettings
                    });
                  }
                }}
              >
                <option value="flex">Flex</option>
                <option value="grid">Grid</option>
                <option value="block">Block</option>
                <option value="none">None (Hidden)</option>
              </select>
            </div>
            
            {layoutSettings.responsive[currentBreakpoint].display === 'flex' && (
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Flex Direction</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={layoutSettings.responsive[currentBreakpoint].flexDirection || 'column'}
                  onChange={(e) => {
                    const newSettings = {...layoutSettings};
                    newSettings.responsive[currentBreakpoint].flexDirection = e.target.value;
                    setLayoutSettings(newSettings);
                    
                    if (selectedBlock) {
                      updateBlock(selectedBlock.id, {
                        layout: newSettings
                      });
                    }
                  }}
                >
                  <option value="row">Row</option>
                  <option value="column">Column</option>
                  <option value="row-reverse">Row Reverse</option>
                  <option value="column-reverse">Column Reverse</option>
                </select>
              </div>
            )}
            
            {layoutSettings.responsive[currentBreakpoint].display === 'grid' && (
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Grid Columns</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={layoutSettings.responsive[currentBreakpoint].gridTemplateColumns || 'repeat(1, 1fr)'}
                  onChange={(e) => {
                    const newSettings = {...layoutSettings};
                    newSettings.responsive[currentBreakpoint].gridTemplateColumns = e.target.value;
                    setLayoutSettings(newSettings);
                    
                    if (selectedBlock) {
                      updateBlock(selectedBlock.id, {
                        layout: newSettings
                      });
                    }
                  }}
                >
                  <option value="repeat(1, 1fr)">1 Column</option>
                  <option value="repeat(2, 1fr)">2 Columns</option>
                  <option value="1fr 2fr">1:2 Ratio</option>
                </select>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Padding</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={parseInt(layoutSettings.responsive[currentBreakpoint].padding || '16')}
                  onChange={(e) => {
                    const newSettings = {...layoutSettings};
                    newSettings.responsive[currentBreakpoint].padding = `${e.target.value}px`;
                    setLayoutSettings(newSettings);
                    
                    if (selectedBlock) {
                      updateBlock(selectedBlock.id, {
                        layout: newSettings
                      });
                    }
                  }}
                  className="flex-1"
                />
                <span className="ml-2 text-xs w-10">
                  {layoutSettings.responsive[currentBreakpoint].padding || '16px'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'language' && <LanguagePanel />}
      
      <div className="pt-2 border-t">
        <button
          onClick={() => {
            if (selectedBlock) {
              updateBlock(selectedBlock.id, {
                layout: layoutSettings,
                language,
                direction
              });
            }
          }}
          className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default AdvancedLayoutControls;

