import React, { useState } from 'react';

export default function SiteGenerator() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleGenerate = () => {
    // Placeholder for OpenAI integration
    setResponse(`🔮 AI says: "${prompt}" is a great idea!`);
  };

  return (
    <div>
      <h1>🛠️ Site Generator</h1>
      <input 
        type="text" 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
        placeholder="Describe the site you want to build..." 
        style={{ width: '80%', padding: '10px', fontSize: '1rem' }}
      />
      <br />
      <button onClick={handleGenerate} style={{ marginTop: '10px' }}>
        Generate with AI
      </button>
      <p style={{ marginTop: '20px' }}>{response}</p>
    </div>
  );
}
