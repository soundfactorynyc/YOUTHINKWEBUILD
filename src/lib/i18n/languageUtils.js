// src/lib/i18n/languageUtils.js

/**
 * Utilities for multi-language support and translations
 */

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', dir: 'ltr', default: true },
  { code: 'ar', name: 'العربية', dir: 'rtl' }, // Arabic
  { code: 'he', name: 'עברית', dir: 'rtl' }, // Hebrew
  { code: 'fr', name: 'Français', dir: 'ltr' }, // French
  { code: 'es', name: 'Español', dir: 'ltr' }, // Spanish
  { code: 'de', name: 'Deutsch', dir: 'ltr' }, // German
  { code: 'ja', name: '日本語', dir: 'ltr' }, // Japanese
  { code: 'zh', name: '中文', dir: 'ltr' }, // Chinese
  { code: 'ru', name: 'Русский', dir: 'ltr' }, // Russian
  { code: 'pt', name: 'Português', dir: 'ltr' }, // Portuguese
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' }, // Hindi
  { code: 'ko', name: '한국어', dir: 'ltr' }, // Korean
];

// Font recommendations for different languages
export const LANGUAGE_FONTS = {
  default: ['Inter', 'Roboto', 'Open Sans'],
  ar: ['Noto Sans Arabic', 'Tajawal', 'Cairo'],
  he: ['Noto Sans Hebrew', 'Heebo', 'David Libre'],
  ja: ['Noto Sans JP', 'Hiragino Sans', 'Meiryo'],
  zh: ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei'],
  ko: ['Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo'],
  hi: ['Noto Sans Devanagari', 'Poppins', 'Hind'],
  th: ['Noto Sans Thai', 'Prompt', 'Sarabun'],
};

/**
 * Get recommended fonts for a specific language
 * @param {string} langCode - Language code
 * @returns {Array} Array of recommended font families
 */
export const getRecommendedFonts = (langCode) => {
  return LANGUAGE_FONTS[langCode] || LANGUAGE_FONTS.default;
};

/**
 * Get the text direction for a language
 * @param {string} langCode - Language code
 * @returns {string} 'rtl' or 'ltr'
 */
export const getLanguageDirection = (langCode) => {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode);
  return language?.dir || 'ltr';
};

/**
 * Extract translatable text from a block
 * @param {Object} block - Block to extract text from
 * @returns {Array} Array of translatable text objects
 */
export const extractTranslatableText = (block) => {
  const translatableFields = [];
  
  if (!block || !block.content) return translatableFields;
  
  // Common text fields by block type
  const textFieldsByType = {
    heading: ['text'],
    paragraph: ['text'],
    button: ['text', 'ariaLabel'],
    link: ['text', 'ariaLabel'],
    image: ['alt', 'caption'],
    hero: ['heading', 'subheading', 'ctaText'],
    features: ['heading', 'subheading'],
    testimonials: ['heading', 'subheading'],
    contact: ['heading', 'subheading', 'submitText'],
    footer: ['copyright'],
    subscribe: ['heading', 'subheading', 'buttonText', 'placeholder'],
  };
  
  // Get fields to translate for this block type
  const fieldsToTranslate = textFieldsByType[block.type] || [];
  
  // Add each field that has content
  fieldsToTranslate.forEach(field => {
    if (block.content[field]) {
      translatableFields.push({
        fieldId: field,
        sourceText: block.content[field],
        translations: block.content.translations?.[field] || {}
      });
    }
  });
  
  // Special handling for block types with nested content
  if (block.type === 'features' && block.content.features) {
    block.content.features.forEach((feature, index) => {
      if (feature.title) {
        translatableFields.push({
          fieldId: `features.${index}.title`,
          sourceText: feature.title,
          translations: block.content.translations?.[`features.${index}.title`] || {}
        });
      }
      if (feature.description) {
        translatableFields.push({
          fieldId: `features.${index}.description`,
          sourceText: feature.description,
          translations: block.content.translations?.[`features.${index}.description`] || {}
        });
      }
    });
  }
  
  if (block.type === 'testimonials' && block.content.testimonials) {
    block.content.testimonials.forEach((testimonial, index) => {
      if (testimonial.text) {
        translatableFields.push({
          fieldId: `testimonials.${index}.text`,
          sourceText: testimonial.text,
          translations: block.content.translations?.[`testimonials.${index}.text`] || {}
        });
      }
      if (testimonial.name) {
        translatableFields.push({
          fieldId: `testimonials.${index}.name`,
          sourceText: testimonial.name,
          translations: block.content.translations?.[`testimonials.${index}.name`] || {}
        });
      }
      if (testimonial.role) {
        translatableFields.push({
          fieldId: `testimonials.${index}.role`,
          sourceText: testimonial.role,
          translations: block.content.translations?.[`testimonials.${index}.role`] || {}
        });
      }
    });
  }
  
  return translatableFields;
};

/**
 * Update block translations
 * @param {Object} block - Block to update
 * @param {Object} translations - Object with translations by field and language
 * @returns {Object} Updated block with translations
 */
export const updateBlockTranslations = (block, translations) => {
  if (!block || !block.content) return block;
  
  const updatedBlock = {
    ...block,
    content: {
      ...block.content,
      translations: {
        ...(block.content.translations || {}),
        ...translations
      }
    }
  };
  
  return updatedBlock;
};

/**
 * Get translated content for a block
 * @param {Object} block - Block to translate
 * @param {string} language - Target language code
 * @returns {Object} Translated block
 */
export const getTranslatedBlock = (block, language) => {
  if (!block || !block.content || !language || language === 'en') {
    return block; // Return original if no language specified or it's the default
  }
  
  // Create a deep copy of the block
  const translatedBlock = JSON.parse(JSON.stringify(block));
  
  // Recursively replace text with translations if available
  const translateContent = (content, path = '') => {
    if (!content || typeof content !== 'object') return content;
    
    // For arrays, process each item
    if (Array.isArray(content)) {
      return content.map((item, index) => translateContent(item, `${path}${path ? '.' : ''}${index}`));
    }
    
    // For objects, process each property
    const result = { ...content };
    
    // Skip processing the translations object itself
    if (path === 'translations') return result;
    
    for (const [key, value] of Object.entries(content)) {
      const currentPath = `${path}${path ? '.' : ''}${key}`;
      
      if (typeof value === 'string') {
        // Check if we have a translation for this field
        const translation = content.translations?.[key]?.[language];
        if (translation) {
          result[key] = translation;
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects
        result[key] = translateContent(value, currentPath);
      }
    }
    
    return result;
  };
  
  translatedBlock.content = translateContent(translatedBlock.content);
  
  return translatedBlock;
};

/**
 * Process translations for all blocks in a site
 * @param {Array} blocks - All blocks in the site
 * @param {string} language - Target language code
 * @returns {Array} Translated blocks
 */
export const translateSite = (blocks, language) => {
  if (!blocks || !language || language === 'en') {
    return blocks; // Return original if no language specified or it's the default
  }
  
  return blocks.map(block => getTranslatedBlock(block, language));
};

/**
 * Create a translation configuration for a site
 * @param {Array} blocks - All blocks in the site
 * @returns {Object} Translation configuration with all translatable content
 */
export const createTranslationConfig = (blocks) => {
  if (!blocks || !blocks.length) return { translatableContent: [] };
  
  const translatableContent = [];
  
  // Extract translatable content from all blocks
  blocks.forEach(block => {
    const blockContent = extractTranslatableText(block);
    
    if (blockContent.length > 0) {
      translatableContent.push({
        blockId: block.id,
        blockType: block.type,
        content: blockContent
      });
    }
  });
  
  // Default config with extracted content
  return {
    sourceLanguage: 'en',
    targetLanguages: SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en').map(lang => lang.code),
    translatableContent
  };
};

/**
 * Check if a site has complete translations
 * @param {Array} blocks - All blocks in the site  
 * @param {Array} languages - Languages to check
 * @returns {Object} Status of translations for each language
 */
export const checkTranslationStatus = (blocks, languages = []) => {
  if (!blocks || !blocks.length) return {};
  
  // If no languages specified, check all supported languages
  const languagesToCheck = languages.length > 0 
    ? languages 
    : SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en').map(lang => lang.code);
  
  const status = {};
  
  // Initialize status for each language
  languagesToCheck.forEach(langCode => {
    status[langCode] = {
      translatedCount: 0,
      totalCount: 0,
      percentage: 0,
      complete: false
    };
  });
  
  // Count translatable content
  blocks.forEach(block => {
    const translatableFields = extractTranslatableText(block);
    
    languagesToCheck.forEach(langCode => {
      translatableFields.forEach(field => {
        status[langCode].totalCount++;
        if (field.translations[langCode]) {
          status[langCode].translatedCount++;
        }
      });
    });
  });
  
  // Calculate percentages and completeness
  languagesToCheck.forEach(langCode => {
    if (status[langCode].totalCount > 0) {
      status[langCode].percentage = Math.round(
        (status[langCode].translatedCount / status[langCode].totalCount) * 100
      );
      status[langCode].complete = status[langCode].translatedCount === status[langCode].totalCount;
    } else {
      status[langCode].percentage = 0;
      status[langCode].complete = false;
    }
  });
  
  return status;
};

// Export default object with all utilities
export default {
  SUPPORTED_LANGUAGES,
  getRecommendedFonts,
  getLanguageDirection,
  extractTranslatableText,
  updateBlockTranslations,
  getTranslatedBlock,
  translateSite,
  createTranslationConfig,
  checkTranslationStatus
};
