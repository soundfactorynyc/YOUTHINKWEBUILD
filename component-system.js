// component-system.js
class ComponentSystem {
  constructor() {
    this.components = {};
    this.container = null;
    this.draggedComponent = null;
    this.draggedComponentPlaceholder = null;
    this.editingComponent = null;
    this.componentCounter = 0;
  }

  initialize(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }
    
    this.initializeToolbar();
    this.initializeDropZone();
    this.loadComponentLibrary();
    this.initializeEventListeners();
  }

  initializeToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'ythinkwebuild-toolbar';
    toolbar.innerHTML = `
      <div class="ythinkwebuild-component-list"></div>
      <div class="ythinkwebuild-actions">
        <button id="ythinkwebuild-save">Save Layout</button>
        <button id="ythinkwebuild-preview">Preview</button>
        <button id="ythinkwebuild-export">Export Code</button>
      </div>
    `;
    document.body.insertBefore(toolbar, this.container);

    // Event listeners for toolbar buttons
    document.getElementById('ythinkwebuild-save').addEventListener('click', () => this.saveLayout());
    document.getElementById('ythinkwebuild-preview').addEventListener('click', () => this.previewLayout());
    document.getElementById('ythinkwebuild-export').addEventListener('click', () => this.exportCode());
  }

  initializeDropZone() {
    this.container.classList.add('ythinkwebuild-dropzone');
    this.container.innerHTML = '<div class="ythinkwebuild-dropzone-message">Drag components here</div>';
  }

  loadComponentLibrary() {
    // Define standard components
    const standardComponents = [
      {
        type: 'header',
        name: 'Header',
        icon: 'header-icon.svg',
        html: `
          <header class="ythinkwebuild-header">
            <div class="ythinkwebuild-logo">Logo</div>
            <nav class="ythinkwebuild-nav">
              <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Services</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </nav>
          </header>
        `,
        properties: {
          backgroundColor: { type: 'color', default: '#ffffff' },
          textColor: { type: 'color', default: '#333333' },
          logoText: { type: 'text', default: 'Logo' },
          fixed: { type: 'boolean', default: false }
        }
      },
      {
        type: 'hero',
        name: 'Hero Section',
        icon: 'hero-icon.svg',
        html: `
          <section class="ythinkwebuild-hero">
            <h1>Welcome to Our Website</h1>
            <p>This is a hero section with a powerful call to action</p>
            <button class="ythinkwebuild-button">Learn More</button>
          </section>
        `,
        properties: {
          heading: { type: 'text', default: 'Welcome to Our Website' },
          subheading: { type: 'textarea', default: 'This is a hero section with a powerful call to action' },
          buttonText: { type: 'text', default: 'Learn More' },
          backgroundImage: { type: 'image', default: '' },
          textColor: { type: 'color', default: '#ffffff' }
        }
      },
      {
        type: 'grid',
        name: 'Content Grid',
        icon: 'grid-icon.svg',
        html: `
          <div class="ythinkwebuild-grid">
            <div class="ythinkwebuild-grid-item">Column 1</div>
            <div class="ythinkwebuild-grid-item">Column 2</div>
            <div class="ythinkwebuild-grid-item">Column 3</div>
          </div>
        `,
        properties: {
          columns: { type: 'number', default: 3, min: 1, max: 6 },
          columnGap: { type: 'range', default: 20, min: 0, max: 50, unit: 'px' },
          rowGap: { type: 'range', default: 20, min: 0, max: 50, unit: 'px' }
        }
      },
      // Add more component definitions as needed
    ];

    // Register standard components
    standardComponents.forEach(component => {
      this.registerComponent(component);
    });

    // Populate component list in toolbar
    const componentList = document.querySelector('.ythinkwebuild-component-list');
    Object.values(this.components).forEach(component => {
      const componentItem = document.createElement('div');
      componentItem.className = 'ythinkwebuild-component-item';
      componentItem.draggable = true;
      componentItem.dataset.type = component.type;
      componentItem.innerHTML = `
        <div class="ythinkwebuild-component-icon">${component.icon ? `<img src="${component.icon}">` : ''}</div>
        <div class="ythinkwebuild-component-name">${component.name}</div>
      `;
      
      componentItem.addEventListener('dragstart', (e) => this.handleDragStart(e, component));
      componentList.appendChild(componentItem);
    });
  }

  registerComponent(componentDefinition) {
    if (!componentDefinition.type || !componentDefinition.name || !componentDefinition.html) {
      console.error('Invalid component definition. Required: type, name, html');
      return;
    }
    
    this.components[componentDefinition.type] = componentDefinition;
  }

  initializeEventListeners() {
    // Drag and drop events for the container
    this.container.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.container.addEventListener('drop', (e) => this.handleDrop(e));
    this.container.addEventListener('dragenter', (e) => e.preventDefault());
    this.container.addEventListener('dragleave', (e) => e.preventDefault());
  }

  handleDragStart(e, component) {
    this.draggedComponent = component;
    e.dataTransfer.setData('text/plain', component.type);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Create a placeholder element to show while dragging
    this.draggedComponentPlaceholder = document.createElement('div');
    this.draggedComponentPlaceholder.className = 'ythinkwebuild-placeholder';
    this.draggedComponentPlaceholder.textContent = `Add ${component.name} here`;
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    // Highlight drop zone
    this.container.classList.add('ythinkwebuild-dropzone-active');
  }

  handleDrop(e) {
    e.preventDefault();
    
    // Remove highlighting
    this.container.classList.remove('ythinkwebuild-dropzone-active');
    
    // Get the component type from the dataTransfer
    const componentType = e.dataTransfer.getData('text/plain');
    if (!componentType || !this.components[componentType]) {
      console.error('Invalid component dropped');
      return;
    }
    
    // Remove the dropzone message if it's the first component
    const dropMessage = this.container.querySelector('.ythinkwebuild-dropzone-message');
    if (dropMessage) {
      dropMessage.remove();
    }
    
    // Add the component to the container
    this.addComponent(componentType, { 
      x: e.clientX - this.container.getBoundingClientRect().left, 
      y: e.clientY - this.container.getBoundingClientRect().top 
    });
  }

  addComponent(componentType, position) {
    const component = this.components[componentType];
    if (!component) {
      console.error(`Component type ${componentType} not found`);
      return;
    }
    
    const id = `component-${Date.now()}-${this.componentCounter++}`;
    
    // Create wrapper for the component
    const wrapper = document.createElement('div');
    wrapper.className = 'ythinkwebuild-component';
    wrapper.dataset.type = componentType;
    wrapper.dataset.id = id;
    wrapper.innerHTML = component.html;
    
    // Add component controls
    const controls = document.createElement('div');
    controls.className = 'ythinkwebuild-component-controls';
    controls.innerHTML = `
      <button class="ythinkwebuild-edit" title="Edit"><span>✏️</span></button>
      <button class="ythinkwebuild-move" title="Move"><span>↕️</span></button>
      <button class="ythinkwebuild-delete" title="Delete"><span>🗑️</span></button>
    `;
    wrapper.appendChild(controls);
    
    // Make component draggable for repositioning
    wrapper.draggable = true;
    
    // Add to container at the specified position
    this.container.appendChild(wrapper);
    
    // Set up event listeners for component controls
    const editBtn = wrapper.querySelector('.ythinkwebuild-edit');
    const moveBtn = wrapper.querySelector('.ythinkwebuild-move');
    const deleteBtn = wrapper.querySelector('.ythinkwebuild-delete');
    
    editBtn.addEventListener('click', () => this.openEditor(id, componentType));
    moveBtn.addEventListener('mousedown', (e) => this.startComponentMove(e, wrapper));
    deleteBtn.addEventListener('click', () => this.deleteComponent(id));
    
    // Apply default properties
    this.applyComponentProperties(id, component.properties);
    
    return wrapper;
  }

  openEditor(componentId, componentType) {
    const componentEl = document.querySelector(`[data-id="${componentId}"]`);
    if (!componentEl) return;
    
    this.editingComponent = { id: componentId, type: componentType };
    
    const component = this.components[componentType];
    
    // Create editor modal
    const modal = document.createElement('div');
    modal.className = 'ythinkwebuild-modal';
    modal.innerHTML = `
      <div class="ythinkwebuild-modal-content">
        <div class="ythinkwebuild-modal-header">
          <h2>Edit ${component.name}</h2>
          <button class="ythinkwebuild-modal-close">&times;</button>
        </div>
        <div class="ythinkwebuild-modal-body">
          <form id="ythinkwebuild-editor-form"></form>
        </div>
        <div class="ythinkwebuild-modal-footer">
          <button id="ythinkwebuild-save-component">Save Changes</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button event
    modal.querySelector('.ythinkwebuild-modal-close').addEventListener('click', () => {
      modal.remove();
      this.editingComponent = null;
    });
    
    // Create form fields for properties
    const form = modal.querySelector('#ythinkwebuild-editor-form');
    
    if (component.properties) {
      for (const [key, prop] of Object.entries(component.properties)) {
        const currentValue = componentEl.dataset[key] || prop.default;
        const formGroup = document.createElement('div');
        formGroup.className = 'ythinkwebuild-form-group';
        
        const label = document.createElement('label');
        label.textContent = this.camelCaseToTitle(key);
        label.htmlFor = `property-${key}`;
        
        let input;
        
        switch (prop.type) {
          case 'color':
            input = document.createElement('input');
            input.type = 'color';
            input.value = currentValue;
            break;
            
          case 'text':
            input = document.createElement('input');
            input.type = 'text';
            input.value = currentValue;
            break;
            
          case 'textarea':
            input = document.createElement('textarea');
            input.value = currentValue;
            break;
            
          case 'number':
            input = document.createElement('input');
            input.type = 'number';
            input.value = currentValue;
            if (prop.min !== undefined) input.min = prop.min;
            if (prop.max !== undefined) input.max = prop.max;
            break;
            
          case 'range':
            input = document.createElement('div');
            input.className = 'ythinkwebuild-range-group';
            input.innerHTML = `
              <input type="range" id="property-${key}" 
                value="${currentValue}" 
                min="${prop.min || 0}" 
                max="${prop.max || 100}" 
                step="1">
              <span class="ythinkwebuild-range-value">${currentValue}${prop.unit || ''}</span>
            `;
            const rangeInput = input.querySelector('input');
            const rangeValue = input.querySelector('.ythinkwebuild-range-value');
            rangeInput.addEventListener('input', () => {
              rangeValue.textContent = `${rangeInput.value}${prop.unit || ''}`;
            });
            break;
            
          case 'boolean':
            input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = currentValue === 'true' || currentValue === true;
            break;
            
          case 'image':
            input = document.createElement('div');
            input.className = 'ythinkwebuild-image-input';
            input.innerHTML = `
              <input type="text" id="property-${key}" value="${currentValue}" placeholder="Image URL">
              <button type="button" class="ythinkwebuild-browse-image">Browse</button>
              ${currentValue ? `<div class="ythinkwebuild-image-preview"><img src="${currentValue}"></div>` : ''}
            `;
            const browseBtn = input.querySelector('.ythinkwebuild-browse-image');
            browseBtn.addEventListener('click', () => this.openImageBrowser(input.querySelector('input')));
            break;
            
          default:
            input = document.createElement('input');
            input.type = 'text';
            input.value = currentValue;
        }
        
        if (input.id !== undefined) {
          input.id = `property-${key}`;
        }
        input.name = key;
        input.dataset.type = prop.type;
        
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        form.appendChild(formGroup);
      }
    }
    
    // Save button event
    modal.querySelector('#ythinkwebuild-save-component').addEventListener('click', () => {
      this.saveComponentProperties(form);
      modal.remove();
      this.editingComponent = null;
    });
  }

  saveComponentProperties(form) {
    const { id, type } = this.editingComponent;
    const componentEl = document.querySelector(`[data-id="${id}"]`);
    if (!componentEl) return;
    
    const component = this.components[type];
    const properties = {};
    
    if (component.properties) {
      for (const [key, prop] of Object.entries(component.properties)) {
        let input = form.querySelector(`[name="${key}"]`);
        let value;
        
        if (prop.type === 'range') {
          input = form.querySelector(`#property-${key}`);
        }
        
        switch (prop.type) {
          case 'boolean':
            value = input.checked;
            break;
          case 'number':
          case 'range':
            value = parseFloat(input.value);
            break;
          default:
            value = input.value;
        }
        
        properties[key] = value;
        componentEl.dataset[key] = value;
      }
    }
    
    this.applyComponentProperties(id, properties);
  }

  applyComponentProperties(id, properties) {
    const componentEl = document.querySelector(`[data-id="${id}"]`);
    if (!componentEl) return;
    
    // Apply properties as inline styles or attributes
    for (const [key, value] of Object.entries(properties)) {
      // Store in dataset
      componentEl.dataset[key] = value;
      
      // Apply different properties based on property name
      switch (key) {
        case 'backgroundColor':
          componentEl.style.backgroundColor = value;
          break;
          
        case 'textColor':
          componentEl.style.color = value;
          break;
          
        case 'backgroundImage':
          if (value) {
            componentEl.style.backgroundImage = `url(${value})`;
            componentEl.style.backgroundSize = 'cover';
            componentEl.style.backgroundPosition = 'center';
          } else {
            componentEl.style.backgroundImage = 'none';
          }
          break;
          
        case 'columns':
          // For grid components
          if (componentEl.classList.contains('ythinkwebuild-grid') || componentEl.querySelector('.ythinkwebuild-grid')) {
            const grid = componentEl.classList.contains('ythinkwebuild-grid') 
              ? componentEl 
              : componentEl.querySelector('.ythinkwebuild-grid');
              
            if (grid) {
              // Clear existing columns
              grid.innerHTML = '';
              
              // Create new columns
              for (let i = 0; i < value; i++) {
                const column = document.createElement('div');
                column.className = 'ythinkwebuild-grid-item';
                column.textContent = `Column ${i + 1}`;
                grid.appendChild(column);
              }
              
              // Update grid template CSS
              grid.style.gridTemplateColumns = `repeat(${value}, 1fr)`;
            }
          }
          break;
          
        case 'columnGap':
          // For grid components
          const gridWithColumnGap = componentEl.querySelector('.ythinkwebuild-grid');
          if (gridWithColumnGap) {
            gridWithColumnGap.style.columnGap = `${value}px`;
          }
          break;
          
        case 'rowGap':
          // For grid components
          const gridWithRowGap = componentEl.querySelector('.ythinkwebuild-grid');
          if (gridWithRowGap) {
            gridWithRowGap.style.rowGap = `${value}px`;
          }
          break;
          
        case 'heading':
          // For components with headings
          const heading = componentEl.querySelector('h1, h2, h3, h4, h5, h6');
          if (heading) {
            heading.textContent = value;
          }
          break;
          
        case 'subheading':
          // For components with subheadings
          const paragraph = componentEl.querySelector('p');
          if (paragraph) {
            paragraph.textContent = value;
          }
          break;
          
        case 'buttonText':
          // For components with buttons
          const button = componentEl.querySelector('button, .ythinkwebuild-button');
          if (button) {
            button.textContent = value;
          }
          break;
          
        case 'logoText':
          // For components with logo text
          const logo = componentEl.querySelector('.ythinkwebuild-logo');
          if (logo) {
            logo.textContent = value;
          }
          break;
          
        case 'fixed':
          // For fixed position components like headers
          if (value === true || value === 'true') {
            componentEl.style.position = 'sticky';
            componentEl.style.top = '0';
            componentEl.style.zIndex = '100';
          } else {
            componentEl.style.position = 'relative';
            componentEl.style.top = 'auto';
            componentEl.style.zIndex = 'auto';
          }
          break;
      }
    }
  }

  startComponentMove(e, component) {
    // Set dragging class
    component.classList.add('ythinkwebuild-dragging');
    
    // Store original position
    const originalRect = component.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startTop = originalRect.top - containerRect.top;
    const startLeft = originalRect.left - containerRect.left;
    
    // Create move handler
    const moveHandler = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      // Update position
      component.style.position = 'absolute';
      component.style.top = `${startTop + dy}px`;
      component.style.left = `${startLeft + dx}px`;
    };
    
    // Create up handler to stop dragging
    const upHandler = () => {
      component.classList.remove('ythinkwebuild-dragging');
      
      // Remove event listeners
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }

  deleteComponent(id) {
    const component = document.querySelector(`[data-id="${id}"]`);
    if (component) {
      // Add deletion animation
      component.classList.add('ythinkwebuild-deleting');
      
      // Remove after animation completes
      setTimeout(() => {
        component.remove();
        
        // If no components left, show drop message
        if (this.container.querySelectorAll('.ythinkwebuild-component').length === 0) {
          this.container.innerHTML = '<div class="ythinkwebuild-dropzone-message">Drag components here</div>';
        }
      }, 300);
    }
  }

  saveLayout() {
    // Collect all components and their properties
    const components = [];
    const componentEls = this.container.querySelectorAll('.ythinkwebuild-component');
    
    componentEls.forEach(el => {
      const component = {
        id: el.dataset.id,
        type: el.dataset.type,
        properties: {},
        position: {
          top: el.style.top || 'auto',
          left: el.style.left || 'auto',
          width: el.style.width || 'auto',
          height: el.style.height || 'auto'
        }
      };
      
      // Collect all data attributes as properties
      for (const key in el.dataset) {
        if (key !== 'id' && key !== 'type') {
          component.properties[key] = el.dataset[key];
        }
      }
      
      components.push(component);
    });
    
    const layoutData = {
      components,
      containerId: this.container.id,
      timestamp: Date.now()
    };
    
    // Save to localStorage for now
    localStorage.setItem('ythinkwebuild-layout', JSON.stringify(layoutData));
    
    // Show success message
    this.showNotification('Layout saved successfully!');
    
    return layoutData;
  }

  loadLayout(layoutData) {
    if (!layoutData) {
      // Try to load from localStorage
      const savedLayout = localStorage.getItem('ythinkwebuild-layout');
      if (savedLayout) {
        layoutData = JSON.parse(savedLayout);
      } else {
        console.error('No layout data provided and none found in storage');
        return;
      }
    }
    
    // Clear container
    this.container.innerHTML = '';
    
    // Add each component
    layoutData.components.forEach(component => {
      const wrapper = this.addComponent(component.type);
      
      // Apply ID
      wrapper.dataset.id = component.id;
      
      // Apply position
      if (component.position) {
        wrapper.style.position = 'absolute';
        wrapper.style.top = component.position.top;
        wrapper.style.left = component.position.left;
        wrapper.style.width = component.position.width;
        wrapper.style.height = component.position.height;
      }
      
      // Apply properties
      this.applyComponentProperties(component.id, component.properties);
    });
    
    this.showNotification('Layout loaded successfully!');
  }

  previewLayout() {
    // Save current layout
    const layoutData = this.saveLayout();
    
    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    
    // Generate preview HTML
    const previewHTML = this.generatePreviewHTML(layoutData);
    
    // Write to the new window
    previewWindow.document.open();
    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
  }

  generatePreviewHTML(layoutData) {
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YouThinkWeBuild Preview</title>
        <style>
          ${this.generateCSS()}
        </style>
      </head>
      <body>
        <div id="preview-container">
    `;
    
    // Add components
    layoutData.components.forEach(component => {
      const componentDef = this.components[component.type];
      if (!componentDef) return;
      
      let componentHTML = componentDef.html;
      
      // Replace content based on properties
      for (const [key, value] of Object.entries(component.properties)) {
        switch (key) {
          case 'heading':
            componentHTML = componentHTML.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i, `<h1>${value}</h1>`);
            break;
            
          case 'subheading':
            componentHTML = componentHTML.replace(/<p>(.*?)<\/p>/i, `<p>${value}</p>`);
            break;
            
          case 'buttonText':
            componentHTML = componentHTML.replace(/<button[^>]*>(.*?)<\/button>/i, `<button>${value}</button>`);
            break;
            
          case 'logoText':
            componentHTML = componentHTML.replace(/<div class="ythinkwebuild-logo">[^<]*<\/div>/i, `<div class="ythinkwebuild-logo">${value}</div>`);
            break;
        }
      }
      
      // Wrap component with div and apply properties
      html += `<div class="preview-component" 
                   data-type="${component.type}" 
                   style="${this.generateComponentStyles(component)}">
                ${componentHTML}
              </div>`;
    });
    
    html += `
        </div>
      </body>
      </html>
    `;
    
    return html;
  }

  generateComponentStyles(component) {
    let styles = '';
    
    // Position styles
    if (component.position) {
      styles += `position: absolute; `;
      styles += `top: ${component.position.top}; `;
      styles += `left: ${component.position.left}; `;
      
      if (component.position.width !== 'auto') {
        styles += `width: ${component.position.width}; `;
      }
      
      if (component.position.height !== 'auto') {
        styles += `height: ${component.position.height}; `;
      }
    }
    
    // Property-based styles
    if (component.properties) {
      for (const [key, value] of Object.entries(component.properties)) {
        switch (key) {
          case 'backgroundColor':
            styles += `background-color: ${value}; `;
            break;
            
          case 'textColor':
            styles += `color: ${value}; `;
            break;
            
          case 'backgroundImage':
            if (value) {
              styles += `background-image: url(${value}); background-size: cover; background-position: center; `;
            }
            break;
            
          case 'fixed':
            if (value === true || value === 'true') {
              styles += `position: sticky; top: 0; z-index: 100; `;
            }
            break;
        }
      }
    }
    
    return styles;
  }

  generateCSS() {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
      }
      
      #preview-container {
        position: relative;
        width: 100%;
        min-height: 100vh;
      }
      
      .preview-component {
        width: 100%;
      }
      
      /* Component styles */
      .ythinkwebuild-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background-color: #ffffff;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      
      .ythinkwebuild-logo {
        font-size: 1.5rem;
        font-weight: bold;
      }
      
      .ythinkwebuild-nav ul {
        display: flex;
        list-style: none;
      }
      
      .ythinkwebuild-nav li {
        margin-left: 1rem;
      }
      
      .ythinkwebuild-nav a {
        text-decoration: none;
        color: inherit;
      }
      
      .ythinkwebuild-hero {
        padding: 4rem 2rem;
        text-align: center;
        background-color: #f5f5f5;
      }
      
      .ythinkwebuild-hero h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }
      
      .ythinkwebuild-hero p {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
      }
      
      .ythinkwebuild-button {
        padding: 0.75rem 1.5rem;
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
      }
      
      .ythinkwebuild-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        padding: 2rem;
      }
      
      .ythinkwebuild-grid-item {
        padding: 2rem;
        background-color: #f9f9f9;
        border-radius: 4px;
        text-align: center;
      }
    `;
  }

  exportCode() {
    // Save current layout
    const layoutData = this.saveLayout();
    
    // Generate HTML and CSS
    const html = this.generatePreviewHTML(layoutData);
    
    // Create export modal
    const modal = document.createElement('div');
    modal.className = 'ythinkwebuild-modal';
    modal.innerHTML = `
      <div class="ythinkwebuild-modal-content ythinkwebuild-export-modal">
        <div class="ythinkwebuild-modal-header">
          <h2>Export Code</h2>
          <button class="ythinkwebuild-modal-close">&times;</button>
        </div>
        <div class="ythinkwebuild-modal-body">
          <div class="ythinkwebuild-tabs">
            <button class="ythinkwebuild-tab active" data-tab="html">HTML</button>
            <button class="ythinkwebuild-tab" data-tab="css">CSS</button>
            <button class="ythinkwebuild-tab" data-tab="js">JavaScript</button>
          </div>
          <div class="ythinkwebuild-tab-content active" data-tab="html">
            <pre><code>${this.escapeHTML(html)}</code></pre>
          </div>
          <div class="ythinkwebuild-tab-content" data-tab="css">
            <pre><code>${this.escapeHTML(this.generateCSS())}</code></pre>
          </div>
          <div class="ythinkwebuild-tab-content" data-tab="js">
            <pre><code>// JavaScript for your website
document.addEventListener('DOMContentLoaded', function() {
  // Initialize interactive elements
  const buttons = document.querySelectorAll('.ythinkwebuild-button');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      alert('Button clicked: ' + this.textContent);
    });
  });
});
</code></pre>
          </div>
        </div>
        <div class="ythinkwebuild-modal-footer">
          <button id="ythinkwebuild-copy-code">Copy Current Tab</button>
          <button id="ythinkwebuild-download-zip">Download All Files</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Tab switching
    const tabs = modal.querySelectorAll('.ythinkwebuild-tab');
    const tabContents = modal.querySelectorAll('.ythinkwebuild-tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        const tabName = tab.dataset.tab;
        modal.querySelector(`.ythinkwebuild-tab-content[data-tab="${tabName}"]`).classList.add('active');
      });
    });
    
    // Copy button
    modal.querySelector('#ythinkwebuild-copy-code').addEventListener('click', () => {
      const activeTab = modal.querySelector('.ythinkwebuild-tab-content.active pre code');
      const textToCopy = activeTab.textContent;
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          this.showNotification('Code copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          this.showNotification('Failed to copy code', 'error');
        });
    });
    
    // Download button
    modal.querySelector('#ythinkwebuild-download-zip').addEventListener('click', () => {
      this.downloadZip(layoutData);
    });
    
    // Close button
    modal.querySelector('.ythinkwebuild-modal-close').addEventListener('click', () => {
      modal.remove();
    });
  }

  downloadZip(layoutData) {
    // In a real implementation, you would generate a ZIP file with all the code
    // For this example, just show a notification
    this.showNotification('Downloading files...');
    
    // You would need to include a library like JSZip to create actual ZIP files
    // and FileSaver.js to trigger the download
    setTimeout(() => {
      this.showNotification('Files downloaded successfully!');
    }, 1000);
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `ythinkwebuild-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  openImageBrowser(inputElement) {
    // In a real implementation, you would open a media library
    // For this example, just prompt for a URL
    const url = prompt('Enter image URL:', inputElement.value);
    if (url) {
      inputElement.value = url;
      
      // Update preview if it exists
      const previewContainer = inputElement.parentElement.querySelector('.ythinkwebuild-image-preview');
      if (previewContainer) {
        previewContainer.innerHTML = `<img src="${url}">`;
      } else {
        const newPreview = document.createElement('div');
        newPreview.className = 'ythinkwebuild-image-preview';
        newPreview.innerHTML = `<img src="${url}">`;
        inputElement.parentElement.appendChild(newPreview);
      }
    }
  }

  escapeHTML(html) {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  camelCaseToTitle(text) {
    return text
      // Insert space before capital letters
      .replace(/([A-Z])/g, ' $1')
      // Uppercase first letter
      .replace(/^./, function(str) { return str.toUpperCase(); });
  }
}

// CSS for the component system
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
  .ythinkwebuild-toolbar {
    position: fixed;
    left: 0;
    top: 0;
    width: 250px;
    height: 100vh;
    background-color: #f0f0f0;
    border-right: 1px solid #ddd;
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
    z-index: 1000;
    display: flex;
    flex-direction: column;
  }
  
  .ythinkwebuild-component-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
  
  .ythinkwebuild-component-item {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    cursor: grab;
    display: flex;
    align-items: center;
  }
  
  .ythinkwebuild-component-icon {
    width: 24px;
    height: 24px;
    margin-right: 0.5rem;
  }
  
  .ythinkwebuild-actions {
    padding: 1rem;
    border-top: 1px solid #ddd;
  }
  
  .ythinkwebuild-actions button {
    display: block;
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .ythinkwebuild-dropzone {
    margin-left: 250px;
    min-height: 100vh;
    padding: 1rem;
    position: relative;
    background-color: #f9f9f9;
  }
  
  .ythinkwebuild-dropzone-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.5rem;
    color: #ccc;
    text-align: center;
  }
  
  .ythinkwebuild-dropzone-active {
    background-color: #f0f7ff;
    outline: 2px dashed #4a90e2;
  }
  
  .ythinkwebuild-component {
    position: relative;
    margin-bottom: 1rem;
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .ythinkwebuild-component:hover {
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  .ythinkwebuild-component-controls {
    position: absolute;
    top: 0;
    right: 0;
    display: none;
    background-color: rgba(255,255,255,0.9);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .ythinkwebuild-component:hover .ythinkwebuild-component-controls {
    display: flex;
  }
  
  .ythinkwebuild-component-controls button {
    width: 30px;
    height: 30px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .ythinkwebuild-component-controls button:hover {
    background-color: rgba(0,0,0,0.05);
  }
  
  .ythinkwebuild-dragging {
    opacity: 0.7;
    z-index: 100;
  }
  
  .ythinkwebuild-deleting {
    transform: scale(0.8);
    opacity: 0;
    transition: transform 0.3s, opacity 0.3s;
  }
  
  .ythinkwebuild-placeholder {
    border: 2px dashed #ddd;
    padding: 1rem;
    margin-bottom: 1rem;
    text-align: center;
    color: #aaa;
  }
  
  .ythinkwebuild-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  
  .ythinkwebuild-modal-content {
    background-color: white;
    border-radius: 8px;
    width: 600px;
    max-width: 90%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .ythinkwebuild-export-modal {
    width: 800px;
  }
  
  .ythinkwebuild-modal-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .ythinkwebuild-modal-header h2 {
    margin: 0;
  }
  
  .ythinkwebuild-modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
  
  .ythinkwebuild-modal-body {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
  }
  
  .ythinkwebuild-modal-footer {
    padding: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
  }
  
  .ythinkwebuild-modal-footer button {
    padding: 0.5rem 1rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 0.5rem;
  }
  
  .ythinkwebuild-form-group {
    margin-bottom: 1rem;
  }
  
  .ythinkwebuild-form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .ythinkwebuild-form-group input[type="text"],
  .ythinkwebuild-form-group input[type="number"],
  .ythinkwebuild-form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .ythinkwebuild-form-group textarea {
    min-height: 100px;
  }
  
  .ythinkwebuild-range-group {
    display: flex;
    align-items: center;
  }
  
  .ythinkwebuild-range-group input {
    flex: 1;
  }
  
  .ythinkwebuild-range-value {
    margin-left: 1rem;
    min-width: 40px;
  }
  
  .ythinkwebuild-image-input {
    display: flex;
    flex-wrap: wrap;
  }
  
  .ythinkwebuild-image-input input {
    flex: 1;
    margin-right: 0.5rem;
  }
  
  .ythinkwebuild-image-preview {
    width: 100%;
    margin-top: 0.5rem;
    border: 1px solid #ddd;
    padding: 0.5rem;
    border-radius: 4px;
  }
  
  .ythinkwebuild-image-preview img {
    max-width: 100%;
    max-height: 150px;
    display: block;
    margin: 0 auto;
  }
  
  .ythinkwebuild-tabs {
    display: flex;
    border-bottom: 1px solid #ddd;
    margin-bottom: 1rem;
  }
  
  .ythinkwebuild-tab {
    padding: 0.5rem 1rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
  }
  
  .ythinkwebuild-tab.active {
    border-bottom-color: #4a90e2;
    font-weight: bold;
  }
  
  .ythinkwebuild-tab-content {
    display: none;
  }
  
  .ythinkwebuild-tab-content.active {
    display: block;
  }
  
  .ythinkwebuild-tab-content pre {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
  }
  
  .ythinkwebuild-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 1rem;
    background-color: #4CAF50;
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transform: translateY(100px);
    opacity: 0;
    transition: transform 0.3s, opacity 0.3s;
  }
  
  .ythinkwebuild-notification.show {
    transform: translateY(0);
    opacity: 1;
  }
  
  .ythinkwebuild-notification.error {
    background-color: #F44336;
  }
`;
document.head.appendChild(styleSheet);

// Initialize the component system
const initComponentSystem = (containerId) => {
  const system = new ComponentSystem();
  system.initialize(containerId);
  return system;
};

// Export the initialization function
window.YouThinkWeBuild = {
  initComponentSystem
};

// Usage example:
// document.addEventListener('DOMContentLoaded', function() {
//   const designSystem = window.YouThinkWeBuild.initComponentSystem('website-container');
// });
