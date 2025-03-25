// src/components/editor/blocks/OptimizedImage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { PerformanceService } from '../../../lib/performance/performanceService';

const OptimizedImage = ({ 
  src, 
  alt = '', 
  width, 
  height, 
  quality = 80, 
  className = '', 
  isEditing = false,
  onUpdate,
  blockId
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(null);
  const imgRef = useRef(null);
  
  // Initialize performance service
  const performanceService = new PerformanceService();
  
  // Get optimized image URL
  const optimizedSrc = performanceService.getOptimizedImageUrl(src, width, height, quality);
  
  // Observe when image enters viewport for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;
    
    const options = {
      root: null,
      rootMargin: '100px', // Start loading 100px before it enters viewport
      threshold: 0.01
    };
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsInView(true);
        observer.disconnect(); // Stop observing once in view
      }
    }, options);
    
    observer.observe(imgRef.current);
    
    return () => {
      if (imgRef.current) {
        observer.disconnect();
      }
    };
  }, [imgRef]);
  
  // Handle image load event
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  // Handle image error
  const handleError = () => {
    setError('Failed to load image');
    // Fallback to original image if optimization fails
    if (imgRef.current) {
      imgRef.current.src = src;
    }
  };
  
  // Show edit controls if in editing mode
  const renderEditControls = () => {
    if (!isEditing) return null;
    
    return (
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded p-2 flex space-x-2">
        <button onClick={() => onUpdate({ src, alt, width, height })}>
          Edit
        </button>
      </div>
    );
  };
  
  // Show loading placeholder
  const renderPlaceholder = () => {
    if (isLoaded || !isInView) return null;
    
    return (
      <div 
        className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
        style={{ aspectRatio: width && height ? `${width}/${height}` : 'auto' }}
      >
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
    );
  };
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ aspectRatio: width && height ? `${width}/${height}` : 'auto' }}
      ref={imgRef}
      data-block-id={blockId}
    >
      {renderPlaceholder()}
      {renderEditControls()}
      
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-auto ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600 text-sm p-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
