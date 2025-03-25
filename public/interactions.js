// interactions.js
class InteractionManager {
  constructor() {
    this.interactions = {};
    this.activeElement = null;
    this.editorContainer = null;
    this.previewContainer = null;
    this.initialized = false;
  }

  initialize(editorContainerId, previewContainerId) {
    // Get containers
    this.editorContainer = document.getElementById(editorContainerId);
    this.previewContainer = document.getElementById(previewContainerId);
    
    if (!this.editorContainer || !this.previewContainer) {
      console.error('Interaction Manager: Container elements not found');
      return false;
    }
    
    // Load predefined interactions
    this.loadPredefinedInteractions();
    
    // Create UI
    this.createUI();
    
    // Set up event listeners
    this.setupEventListeners();
    
    this.initialized = true;
    return true;
  }

  loadPredefinedInteractions() {
    // Hover animations
    this.registerInteraction('hover-grow', {
      name: 'Grow on Hover',
      category: 'hover',
      properties: {
        scale: { type: 'range', min: 1, max: 2, step: 0.05, default: 1.1 },
        duration: { type: 'range', min: 0.1, max: 2, step: 0.1, default: 0.3 }
      },
      generateCSS: (elementId, props) => `
        #${elementId} {
          transition: transform ${props.duration}s ease;
        }
        #${elementId}:hover {
          transform: scale(${props.scale});
        }
      `,
      previewCode: (props) => {
        return {
          js: '',
          init: function(element) {
            element.style.transition = `transform ${props.duration}s ease`;
            
            element.addEventListener('mouseenter', () => {
              element.style.transform = `scale(${props.scale})`;
            });
            
            element.addEventListener('mouseleave', () => {
              element.style.transform = 'scale(1)';
            });
          }
        };
      }
    });

    // Click effects
    this.registerInteraction('click-ripple', {
      name: 'Ripple Effect',
      category: 'click',
      properties: {
        color: { type: 'color', default: 'rgba(255, 255, 255, 0.7)' },
        duration: { type: 'range', min: 0.3, max: 2, step: 0.1, default: 0.8 }
      },
      generateCSS: (elementId, props) => `
        #${elementId} {
          position: relative;
          overflow: hidden;
        }
        
        .ripple {
          position: absolute;
          border-radius: 50%;
          background-color: ${props.color};
          transform: scale(0);
          animation: ripple-effect ${props.duration}s linear;
          pointer-events: none;
        }
        
        @keyframes ripple-effect {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `,
      generateJS: (elementId, props) => `
        document.getElementById('${elementId}').addEventListener('click', function(e) {
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const ripple = document.createElement('span');
          ripple.className = 'ripple';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          
          this.appendChild(ripple);
          
          setTimeout(() => {
            ripple.remove();
          }, ${props.duration * 1000});
        });
      `,
      previewCode: (props) => {
        return {
          js: '',
          init: function(element) {
            element.style.position = 'relative';
            element.style.overflow = 'hidden';
            
            element.addEventListener('click', (e) => {
              const rect = element.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              const ripple = document.createElement('span');
              ripple.style.position = 'absolute';
              ripple.style.borderRadius = '50%';
              ripple.style.backgroundColor = props.color;
              ripple.style.transform = 'scale(0)';
              ripple.style.width = '20px';
              ripple.style.height = '20px';
              ripple.style.left = (x - 10) + 'px';
              ripple.style.top = (y - 10) + 'px';
              ripple.style.pointerEvents = 'none';
              
              const keyframes = [
                { transform: 'scale(0)', opacity: 1 },
                { transform: 'scale(4)', opacity: 0 }
              ];
              
              const animation = ripple.animate(keyframes, {
                duration: props.duration * 1000,
                easing: 'linear',
                fill: 'forwards'
              });
              
              element.appendChild(ripple);
              
              animation.onfinish = () => ripple.remove();
            });
          }
        };
      }
    });

    // Scroll animations
    this.registerInteraction('scroll-fade-in', {
      name: 'Fade In on Scroll',
      category: 'scroll',
      properties: {
        delay: { type: 'range', min: 0, max: 1, step: 0.1, default: 0.2 },
        duration: { type: 'range', min: 0.3, max: 2, step: 0.1, default: 0.8 },
        offset: { type: 'range', min: 0, max: 300, step: 10, default: 50 }
      },
      generateCSS: (elementId, props) => `
        #${elementId} {
          opacity: 0;
          transform: translateY(${props.offset}px);
          transition: opacity ${props.duration}s ease, transform ${props.duration}s ease;
          transition-delay: ${props.delay}s;
        }
        
        #${elementId}.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `,
      generateJS: (elementId, props) => `
        // Wait for document to be fully loaded
        document.addEventListener('DOMContentLoaded', () => {
          const element = document.getElementById('${elementId}');
          
          // Initial check on page load
          checkIfInView();
          
          // Check on scroll
          window.addEventListener('scroll', checkIfInView);
          
          function checkIfInView() {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            
            // If element is in viewport
            if (elementTop < windowHeight - 100) {
              element.classList.add('visible');
            }
          }
        });
      `,
      previewCode: (props) => {
        return {
          js: '',
          init: function(element) {
            element.style.opacity = '0';
            element.style.transform = `translateY(${props.offset}px)`;
            element.style.transition = `opacity ${props.duration}s ease, transform ${props.duration}s ease`;
            element.style.transitionDelay = `${props.delay}s`;
            
            // Simulate scroll effect for preview
            setTimeout(() => {
              element.style.opacity = '1';
              element.style.transform = 'translateY(0)';
            }, 500);
          }
        };
      }
    });

    // Scroll reveal animation
    this.registerInteraction('scroll-reveal', {
      name: 'Reveal on Scroll',
      category: 'scroll',
      properties: {
        direction: { 
          type: 'select', 
          options: ['left', 'right', 'top', 'bottom'], 
          default: 'bottom'
        },
        distance: { type: 'range', min: 20, max: 200, step: 10, default: 50 },
        duration: { type: 'range', min: 0.3, max: 2, step: 0.1, default: 0.6 }
      },
      generateCSS: (elementId, props) => {
        let transform;
        switch (props.direction) {
          case 'left': transform = `translateX(-${props.distance}px)`; break;
          case 'right': transform = `translateX(${props.distance}px)`; break;
          case 'top': transform = `translateY(-${props.distance}px)`; break;
          case 'bottom': 
          default: transform = `translateY(${props.distance}px)`; break;
        }
        
        return `
          #${elementId} {
            opacity: 0;
            transform: ${transform};
            transition: opacity ${props.duration}s ease-out, transform ${props.duration}s ease-out;
          }
          
          #${elementId}.revealed {
            opacity: 1;
            transform: translate(0, 0);
          }
        `;
      },
      generateJS: (elementId, props) => `
        document.addEventListener('DOMContentLoaded', () => {
          const el = document.getElementById('${elementId}');
          
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
              }
            });
          }, {
            threshold: 0.1
          });
          
          observer.observe(el);
        });
      `,
      previewCode: (props) => {
        let transform;
        switch (props.direction) {
          case 'left': transform = `translateX(-${props.distance}px)`; break;
          case 'right': transform = `translateX(${props.distance}px)`; break;
          case 'top': transform = `translateY(-${props.distance}px)`; break;
          case 'bottom': 
          default: transform = `translateY(${props.distance}px)`; break;
        }
        
        return {
          js: '',
          init: function(element) {
            element.style.opacity = '0';
            element.style.transform = transform;
            element.style.transition = `opacity ${props.duration}s ease-out, transform ${props.duration}s ease-out`;
            
            // Simulate scroll effect for preview
            setTimeout(() => {
              element.style.opacity = '1';
              element.style.transform = 'translate(0, 0)';
            }, 500);
          }
        };
      }
    });

    // Parallax background
    this.registerInteraction('parallax-background', {
      name: 'Parallax Background',
      category: 'scroll',
      properties: {
        speed: { type: 'range', min: 0.1, max: 0.9, step: 0.1, default: 0.5 },
        backgroundImage: { type: 'image', default: 'https://source.unsplash.com/random/1600x900/?nature' }
      },
      generateCSS: (elementId, props) => `
        #${elementId} {
          position: relative;
          background-image: url('${props.backgroundImage}');
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          z-index: 1;
        }
        
        #${elementId}::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: inherit;
          z-index: -1;
          transform: translateZ(0);
        }
      `,
      generateJS: (elementId, props) => `
        document.addEventListener('DOMContentLoaded', () => {
          const el = document.getElementById('${elementId}');
          
          window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;
            const offset = scrollPosition * ${props.speed};
            el.style.backgroundPositionY = \`calc(50% + \${offset}px)\`;
          });
        });
      `,
      previewCode: (props) => {
        return {
          js: '',
          init: function(element) {
            element.style.position = 'relative';
            element.style.backgroundImage = `url('${props.backgroundImage}')`;
            element.style.backgroundPosition = 'center';
            element.style.backgroundRepeat = 'no-repeat';
            element.style.backgroundSize = 'cover';
            
            // Simulate scroll for preview
            let offset = 0;
            const interval = setInterval(() => {
              offset += 1;
              element.style.backgroundPositionY = `calc(50% + ${offset * props.speed}px)`;
              
              if (offset > 100) {
                clearInterval(interval);
              }
            }, 50);
          }
        };
      }
    });
