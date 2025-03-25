// src/hooks/useContentSource.js
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';

/**
 * Hook for handling dynamic content sources
 * Supports different content sources: static, firebase, api, or rss
 */
export const useContentSource = (blockId, initialConfig = {}) => {
  const [config, setConfig] = useState(initialConfig);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Save content source configuration to Firebase
  const saveConfig = async (newConfig) => {
    try {
      await setDoc(doc(db, 'content_sources', blockId), newConfig);
      setConfig(newConfig);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };
  
  // Load content from the configured source
  const loadContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      switch (config.type) {
        case 'static':
          // Static content is already in the config
          setContent(config.data);
          break;
          
        case 'firebase':
          // Load from Firestore
          if (config.collection && config.docId) {
            const docRef = doc(db, config.collection, config.docId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              setContent(docSnap.data());
            } else {
              throw new Error('Document not found');
            }
          }
          break;
          
        case 'api':
          // Fetch from external API
          if (config.endpoint) {
            const response = await fetch(config.endpoint, {
              method: config.method || 'GET',
              headers: config.headers || {
                'Content-Type': 'application/json',
              },
              ...(config.body && { body: JSON.stringify(config.body) }),
            });
            
            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Apply data mapping if provided
            if (config.dataMapping) {
              setContent(mapData(data, config.dataMapping));
            } else {
              setContent(data);
            }
          }
          break;
          
        case 'rss':
          // Fetch and parse RSS feed
          if (config.feedUrl) {
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(config.feedUrl)}`);
            const data = await response.json();
            
            if (data.status === 'ok') {
              setContent({
                title: data.feed.title,
                items: data.items.slice(0, config.limit || 5),
              });
            } else {
              throw new Error('Failed to fetch RSS feed');
            }
          }
          break;
          
        default:
          throw new Error('Invalid content source type');
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Apply conditional display logic
  const shouldDisplay = () => {
    if (!config.conditions || config.conditions.length === 0) {
      return true;
    }
    
    return config.conditions.every(condition => {
      switch (condition.type) {
        case 'time':
          const now = new Date();
          const start = new Date(condition.startTime);
          const end = new Date(condition.endTime);
          return now >= start && now <= end;
          
        case 'userProperty':
          // Check user property against condition
          const userValue = condition.userProperty; // This should come from user context
          return condition.operator === 'equals' 
            ? userValue === condition.value
            : userValue !== condition.value;
          
        case 'deviceType':
          const isMobile = window.innerWidth < 768;
          return condition.value === 'mobile' ? isMobile : !isMobile;
          
        default:
          return true;
      }
    });
  };
  
  // Map data using provided mapping configuration
  const mapData = (data, mapping) => {
    if (Array.isArray(data)) {
      return data.map(item => mapItem(item, mapping));
    } else {
      return mapItem(data, mapping);
    }
  };
  
  const mapItem = (item, mapping) => {
    const result = {};
    
    Object.entries(mapping).forEach(([targetKey, sourceKey]) => {
      // Handle nested paths with dot notation
      if (sourceKey.includes('.')) {
        const parts = sourceKey.split('.');
        let value = item;
        
        for (const part of parts) {
          if (value && typeof value === 'object') {
            value = value[part];
          } else {
            value = null;
            break;
          }
        }
        
        result[targetKey] = value;
      } else {
        result[targetKey] = item[sourceKey];
      }
    });
    
    return result;
  };
  
  // Load content when config changes
  useEffect(() => {
    if (config.type) {
      loadContent();
    }
  }, [config]);
  
  return { 
    content, 
    loading, 
    error, 
    saveConfig, 
    loadContent, 
    shouldDisplay 
  };
};
