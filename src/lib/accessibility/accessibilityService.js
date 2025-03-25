// src/lib/accessibility/accessibilityService.js

/**
 * Service for checking and enhancing accessibility compliance
 */

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

// WCAG Contrast standards
const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3.0;
const WCAG_AAA_NORMAL = 7.0;
const WCAG_AAA_LARGE = 4.5;

/**
 * Check color contrast between two colors
 * @param {string} color1 - Hex color code
 * @param {string} color2 - Hex color code
 * @param {boolean} isLargeText - Is this for large text (18pt or 14pt bold)
 * @returns {Object} Object with contrast ratio and compliance levels
 */
export const checkColorContrast = (color1, color2, isLargeText = false) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const ratio = contrastRatio(rgb1, rgb2);
  
  return {
    ratio,
    passesAA: isLargeText ? ratio >= WCAG_AA_LARGE : ratio >= WCAG_AA_NORMAL,
    passesAAA: isLargeText ? ratio >= WCAG_AAA_LARGE : ratio >= WCAG_AAA_NORMAL,
  };
};

/**
 * Check if a block has all required accessibility attributes
 * @param {Object} block - Block to check
 * @returns {Object} Object with missing attributes and suggestions
 */
export const checkBlockAccessibility = (block) => {
  const issues = [];
  
  // Check for specific block types
  switch (block.type) {
    case 'image':
      if (!block.content.alt) {
        issues.push({
          type: 'missing-alt',
          message: 'Image is missing alt text',
          fix: 'Add descriptive alt text to the image',
          severity: 'high'
        });
      } else if (block.content.alt.length < 5) {
        issues.push({
          type: 'poor-alt',
          message: 'Image alt text may be too short',
          fix: 'Ensure alt text is descriptive',
          severity: 'medium'
        });
      }
      break;
      
    case 'button':
      if (!block.content.ariaLabel && !block.content.text) {
        issues.push({
          type: 'missing-label',
          message: 'Button has no accessible name',
          fix: 'Add text content or aria-label to the button',
          severity: 'high'
        });
      }
      break;
      
    case 'link':
      if (!block.content.ariaLabel && (!block.content.text || block.content.text === 'Click here' || block.content.text === 'Read more')) {
        issues.push({
          type: 'poor-link-text',
          message: 'Link text is generic or missing',
          fix: 'Use descriptive link text that indicates the link\'s purpose',
          severity: 'medium'
        });
      }
      break;
      
    case 'video':
    case 'embed':
      if (!block.content.captions) {
        issues.push({
          type: 'missing-captions',
          message: 'Media may be missing captions',
          fix: 'Add captions to make content accessible to deaf or hard-of-hearing users',
          severity: 'high'
        });
      }
      break;
      
    case 'form':
      if (block.content.fields) {
        block.content.fields.forEach(field => {
          if (!field.label) {
            issues.push({
              type: 'missing-form-label',
              message: 'Form field is missing a label',
              fix: 'Add a descriptive label to each form field',
              severity: 'high'
            });
          }
        });
      }
      break;
  }
  
  // Check color contrast if the block has background and text colors
  if (block.content.backgroundColor && block.content.textColor) {
    const contrast = checkColorContrast(
      block.content.backgroundColor, 
      block.content.textColor, 
      block.type === 'heading' || (block.content.fontSize && parseInt(block.content.fontSize) >= 18)
    );
    
    if (!contrast.passesAA) {
      issues.push({
        type: 'contrast',
        message: `Poor color contrast ratio (${contrast.ratio.toFixed(2)}:1)`,
        fix: 'Increase the contrast between text and background colors',
        severity: 'high'
      });
    }
  }
  
  return {
    hasIssues: issues.length > 0,
    issues,
    score: calculateA11yScore(issues)
  };
};

/**
 * Calculate accessibility score based on issues
 * @param {Array} issues - List of accessibility issues
 * @returns {number} Score from 0-100
 */
const calculateA11yScore = (issues) => {
  if (issues.length === 0) return 100;
  
  const highSeverityCount = issues.filter(issue => issue.severity === 'high').length;
  const mediumSeverityCount = issues.filter(issue => issue.severity === 'medium').length;
  
  // Weighted scoring: high severity issues impact score more
  const score = 100 - (highSeverityCount * 15 + mediumSeverityCount * 5);
  
  return Math.max(0, score);
};

/**
 * Generate ARIA attributes for a block based on its type and content
 * @param {Object} block - Block to generate ARIA attributes for
 * @returns {Object} Object with recommended ARIA attributes
 */
export const generateAriaAttributes = (block) => {
  const aria = {};
  
  switch (block.type) {
    case 'button':
      if (!block.content.text) {
        aria['aria-label'] = 'Button';
      }
      break;
      
    case 'image':
      // If decorative image
      if (block.content.isDecorative) {
        aria['aria-hidden'] = 'true';
      }
      break;
      
    case 'tabs':
      aria['role'] = 'tablist';
      break;
      
    case 'accordion':
      aria['role'] = 'region';
      break;
      
    case 'tooltip':
      aria['role'] = 'tooltip';
      break;
      
    case 'alert':
      aria['role'] = 'alert';
      break;
      
    case 'modal':
      aria['role'] = 'dialog';
      aria['aria-modal'] = 'true';
      break;
  }
  
  return aria;
};

/**
 * Check accessibility for an entire site
 * @param {Array} blocks - All blocks in the site
 * @param {Object} theme - Site theme settings
 * @returns {Object} Accessibility report
 */
export const siteAccessibilityAudit = (blocks, theme) => {
  const blockIssues = blocks.map(block => ({
    blockId: block.id,
    blockType: block.type,
    ...checkBlockAccessibility(block, theme)
  }));
  
  // Check theme colors
  const themeIssues = [];
  
  // Check contrast of theme colors
  if (theme.colors) {
    const textBgContrast = checkColorContrast(theme.colors.text, theme.colors.background);
    if (!textBgContrast.passesAA) {
      themeIssues.push({
        type: 'theme-contrast',
        message: `Poor contrast between theme text and background colors (${textBgContrast.ratio.toFixed(2)}:1)`,
        fix: 'Adjust theme text or background colors for better contrast',
        severity: 'high'
      });
    }
    
    const primaryBgContrast = checkColorContrast(theme.colors.primary, theme.colors.background);
    if (!primaryBgContrast.passesAA) {
      themeIssues.push({
        type: 'theme-contrast',
        message: `Poor contrast between primary and background colors (${primaryBgContrast.ratio.toFixed(2)}:1)`,
        fix: 'Adjust theme primary or background colors for better contrast',
        severity: 'medium'
      });
    }
  }
  
  // Calculate overall score
  const allIssues = [
    ...blockIssues.flatMap(bi => bi.issues),
    ...themeIssues
  ];
  
  const overallScore = calculateA11yScore(allIssues);
  
  return {
    score: overallScore,
    blockIssues,
    themeIssues,
    complianceLevel: getComplianceLevel(overallScore),
    totalIssuesCount: allIssues.length,
    highSeverityCount: allIssues.filter(i => i.severity === 'high').length,
    recommendations: generateRecommendations(allIssues, blocks)
  };
};

/**
 * Get compliance level based on accessibility score
 * @param {number} score - Accessibility score
 * @returns {string} Compliance level
 */
const getComplianceLevel = (score) => {
  if (score >= 90) return 'AAA';
  if (score >= 75) return 'AA';
  if (score >= 60) return 'A';
  return 'Non-compliant';
};

/**
 * Generate prioritized recommendations based on issues
 * @param {Array} issues - All accessibility issues
 * @param {Array} blocks - All blocks
 * @returns {Array} Prioritized recommendations
 */
const generateRecommendations = (issues, blocks) => {
  // Group similar issues
  const issueGroups = {};
  
  issues.forEach(issue => {
    if (!issueGroups[issue.type]) {
      issueGroups[issue.type] = {
        type: issue.type,
        count: 0,
        fix: issue.fix,
        severity: issue.severity,
        examples: []
      };
    }
    
    issueGroups[issue.type].count++;
    
    // Add example if we don't have many yet
    if (issueGroups[issue.type].examples.length < 3) {
      issueGroups[issue.type].examples.push(issue.message);
    }
  });
  
  // Convert to array and sort by severity and count
  const recommendations = Object.values(issueGroups)
    .sort((a, b) => {
      // Sort by severity first
      if (a.severity !== b.severity) {
        return a.severity === 'high' ? -1 : 1;
      }
      // Then by count
      return b.count - a.count;
    })
    .map(group => ({
      type: group.type,
      fix: group.fix,
      count: group.count,
      examples: group.examples
    }));
  
  return recommendations;
};

/**
 * Generate screen reader preview text for a block
 * @param {Object} block - Block to preview
 * @returns {string} Screen reader text
 */
export const generateScreenReaderPreview = (block) => {
  if (!block) return '';
  
  switch (block.type) {
    case 'heading':
      return `Heading level ${block.content.level || 2}: ${block.content.text || ''}`;
      
    case 'paragraph':
      return `${block.content.text || ''}`;
      
    case 'image':
      if (block.content.isDecorative) {
        return '[This image is decorative and will be ignored by screen readers]';
      }
      return `Image: ${block.content.alt || 'No alt text provided'}`;
      
    case 'button':
      return `Button: ${block.content.text || block.content.ariaLabel || 'Unlabeled button'}`;
      
    case 'link':
      return `Link: ${block.content.text || block.content.ariaLabel || 'Unlabeled link'}`;
      
    case 'list':
      return `List with ${block.content.items?.length || 0} items`;
      
    case 'form':
      return `Form: ${block.content.title || 'Untitled form'} with ${block.content.fields?.length || 0} fields`;
      
    case 'video':
    case 'embed':
      return `Media: ${block.content.title || 'Untitled media'} ${block.content.captions ? 'with captions' : 'without captions'}`;
      
    default:
      return `${block.type} content`;
  }
};

// Export default object with all accessibility utilities
export default {
  checkColorContrast,
  checkBlockAccessibility,
  generateAriaAttributes,
  siteAccessibilityAudit,
  generateScreenReaderPreview
};
