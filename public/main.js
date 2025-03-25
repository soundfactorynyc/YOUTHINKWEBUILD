// public/main.js
document.addEventListener('DOMContentLoaded', function () {
  // Initialize all systems
  const designSystem = window.YouThinkWeBuild.initComponentSystem('website-container');
  const interactionManager = window.YouThinkWeBuild.initInteractions('interaction-editor', 'website-container');
  const apiManager = window.YouThinkWeBuild.initAPIIntegration('website-container', 'api-editor');

  // Toolbar button: Components
  document.getElementById('open-component-panel').addEventListener('click', function () {
    document.getElementById('interaction-editor').classList.add('hidden');
    document.getElementById('api-editor').classList.add('hidden');
    // Component panel shown by component system internally
  });

  // Toolbar button: Interactions
  document.getElementById('open-interaction-panel').addEventListener('click', function () {
    document.getElementById('interaction-editor').classList.remove('hidden');
    document.getElementById('api-editor').classList.add('hidden');
  });

  // Toolbar button: API Integration
  document.getElementById('open-api-panel').addEventListener('click', function () {
    document.getElementById('interaction-editor').classList.add('hidden');
    document.getElementById('api-editor').classList.remove('hidden');
  });

  // Toolbar button: Preview Site
  document.getElementById('preview-site').addEventListener('click', function () {
    designSystem.previewLayout();
  });

  // Toolbar button: Export Site
  document.getElementById('export-site').addEventListener('click', function () {
    const componentCode = designSystem.generatePreviewHTML(designSystem.saveLayout());
    const interactionCode = interactionManager.generatePageCode?.() || '';

    // Create export modal
    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.innerHTML = `
      <div class="export-modal-content">
        <div class="export-modal-header">
          <h2>Export Website</h2>
          <button class="export-modal-close">&times;</button>
        </div>
        <div class="export-modal-body">
          <p>Your website is ready to export. Click the button below to download all files.</p>
          <button id="download-files" class="download-button">Download Files</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close button
    modal.querySelector('.export-modal-close').addEventListener('click', function () {
      modal.remove();
    });

    // Download button (placeholder)
    modal.querySelector('#download-files').addEventListener('click', function () {
      alert('Your files are being downloaded (this is a placeholder - real zip logic goes here).');
    });
  });
});
