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

    document.getElementById('ythinkwebuild-save').addEventListener('click', () => this.saveLayout());
    document.getElementById('ythinkwebuild-preview').addEventListener('click', () => this.previewLayout());
    document.getElementById('ythinkwebuild-export').addEventListener('click', () => this.exportCode());
  }

  initializeDropZone() {
    this.container.classList.add('ythinkwebuild-dropzone');
    this.container.innerHTML = '<div class="ythinkwebuild-dropzone-message">Drag components here</div>';
  }

  loadComponentLibrary() {
    const componentList = document.querySelector('.ythinkwebuild-component-list');
    const components = [
      {
        type: 'header',
        name: 'Header',
        html: '<header class="ythinkwebuild-header">Header</header>'
      },
      {
        type: 'hero',
        name: 'Hero Section',
        html: '<section class="ythinkwebuild-hero">Hero</section>'
      },
      {
        type: 'footer',
        name: 'Footer',
        html: '<footer class="ythinkwebuild-footer">Footer</footer>'
      }
    ];

    components.forEach(component => {
      this.components[component.type] = component;

      const item = document.createElement('div');
      item.className = 'ythinkwebuild-component-item';
      item.textContent = component.name;
      item.draggable = true;
      item.dataset.type = component.type;

      item.addEventListener('dragstart', (e) => {
        this.draggedComponent = component;
        e.dataTransfer.setData('text/plain', component.type);
      });

      componentList.appendChild(item);
    });
  }

  initializeEventListeners() {
    this.container.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    this.container.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('text/plain');
      const component = this.components[type];
      if (component) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ythinkwebuild-component';
        wrapper.innerHTML = component.html;
        this.container.appendChild(wrapper);
      }
    });
  }

  saveLayout() {
    const layout = this.container.innerHTML;
    localStorage.setItem('ythinkwebuild-layout', layout);
    alert('Layout saved!');
  }

  previewLayout() {
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write('<html><head><title>Preview</title></head><body>' + this.container.innerHTML + '</body></html>');
    previewWindow.document.close();
  }

  exportCode() {
    const blob = new Blob([this.container.innerHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'layout.html';
    link.click();
  }
}

const style = document.createElement('style');
style.innerHTML = `
  .ythinkwebuild-toolbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 200px;
    height: 100vh;
    background: #f4f4f4;
    border-right: 1px solid #ccc;
    padding: 1rem;
    box-sizing: border-box;
    overflow-y: auto;
    z-index: 1000;
  }
  .ythinkwebuild-component-list {
    margin-bottom: 1rem;
  }
  .ythinkwebuild-component-item {
    background: #fff;
    border: 1px solid #ccc;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: grab;
  }
  .ythinkwebuild-actions button {
    display: block;
    width: 100%;
    margin-bottom: 0.5rem;
  }
  .ythinkwebuild-dropzone {
    margin-left: 220px;
    padding: 2rem;
    min-height: 100vh;
    background: #fafafa;
  }
`;
document.head.appendChild(style);

const initComponentSystem = (containerId) => {
  const system = new ComponentSystem();
  system.initialize(containerId);
  return system;
};

window.YouThinkWeBuild = {
  initComponentSystem
};

