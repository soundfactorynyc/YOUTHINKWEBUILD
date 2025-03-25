// src/components/editor/blocks/DynamicContent.jsx
import React, { useState } from 'react';
import { useContentSource } from '../../../hooks/useContentSource';

const DynamicContent = ({ id, initialContent = {}, onUpdate, isEditing }) => {
  const [editing, setEditing] = useState(false);
  
  const {
    content,
    loading,
    error,
    saveConfig,
    loadContent,
    shouldDisplay
  } = useContentSource(id, initialContent.config || { type: 'static', data: {} });
  
  // If conditions aren't met, don't render
  if (!shouldDisplay() && !isEditing) {
    return null;
  }
  
  // Save the updated configuration
  const handleSaveConfig = async (newConfig) => {
    const success = await saveConfig(newConfig);
    if (success) {
      setEditing(false);
      onUpdate({
        ...initialContent,
        config: newConfig
      });
    }
  };
  
  // Refresh content from source
  const handleRefresh = () => {
    loadContent();
  };
  
  return (
    <div className="relative p-4 border rounded-lg">
      {isEditing && (
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={() => setEditing(!editing)}
            className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
          >
            {editing ? 'Cancel' : 'Configure'}
          </button>
          {!editing && (
            <button
              onClick={handleRefresh}
              className="bg-green-500 text-white px-2 py-1 rounded text-sm"
            >
              Refresh
            </button>
          )}
        </div>
      )}
      
      {/* Configuration UI */}
      {isEditing && editing ? (
        <ConfigurationUI
          currentConfig={initialContent.config}
          onSave={handleSaveConfig}
        />
      ) : (
        <div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              <p>Error: {error}</p>
            </div>
          ) : (
            <ContentRenderer
              content={content}
              template={initialContent.template}
              isEditing={isEditing}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Component to configure content source
const ConfigurationUI = ({ currentConfig, onSave }) => {
  const [config, setConfig] = useState(currentConfig || { type: 'static', data: {} });
  
  const handleTypeChange = (e) => {
    setConfig({
      ...config,
      type: e.target.value,
    });
  };
  
  const handleInputChange = (e, section, field) => {
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [field]: e.target.value
      }
    });
  };
  
  const addCondition = () => {
    setConfig({
      ...config,
      conditions: [
        ...(config.conditions || []),
        { type: 'time', startTime: '', endTime: '' }
      ]
    });
  };
  
  const updateCondition = (index, field, value) => {
    const updatedConditions = [...(config.conditions || [])];
    
    if (!updatedConditions[index]) {
      return;
    }
    
    updatedConditions[index] = {
      ...updatedConditions[index],
      [field]: value
    };
    
    setConfig({
      ...config,
      conditions: updatedConditions
    });
  };
  
  const removeCondition = (index) => {
    const updatedConditions = [...(config.conditions || [])];
    updatedConditions.splice(index, 1);
    
    setConfig({
      ...config,
      conditions: updatedConditions
    });
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Configure Content Source</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Source Type</label>
        <select
          value={config.type}
          onChange={handleTypeChange}
          className="w-full p-2 border rounded"
        >
          <option value="static">Static (Manual)</option>
          <option value="firebase">Firebase</option>
          <option value="api">External API</option>
          <option value="rss">RSS Feed</option>
        </select>
      </div>
      
      {/* Show different fields based on the selected type */}
      {config.type === 'firebase' && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Collection</label>
            <input
              type="text"
              value={config.collection || ''}
              onChange={(e) => handleInputChange(e, 'collection', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g. blogs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Document ID</label>
            <input
              type="text"
              value={config.docId || ''}
              onChange={(e) => handleInputChange(e, 'docId', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g. latest-post"
            />
          </div>
        </div>
      )}
      
      {config.type === 'api' && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">API Endpoint</label>
            <input
              type="text"
              value={config.endpoint || ''}
              onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="https://api.example.com/data"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">HTTP Method</label>
            <select
              value={config.method || 'GET'}
              onChange={(e) => setConfig({ ...config, method: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Mapping (JSON)</label>
            <textarea
              value={JSON.stringify(config.dataMapping || {}, null, 2)}
              onChange={(e) => {
                try {
                  const mapping = JSON.parse(e.target.value);
                  setConfig({ ...config, dataMapping: mapping });
                } catch (err) {
                  // Handle invalid JSON
                }
              }}
              className="w-full p-2 border rounded h-32 font-mono text-sm"
              placeholder='{"title": "data.title", "content": "data.body"}'
            />
          </div>
        </div>
      )}
      
      {config.type === 'rss' && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">RSS Feed URL</label>
            <input
              type="text"
              value={config.feedUrl || ''}
              onChange={(e) => setConfig({ ...config, feedUrl: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="https://example.com/feed.xml"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Item Limit</label>
            <input
              type="number"
              value={config.limit || 5}
              onChange={(e) => setConfig({ ...config, limit: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
              min="1"
              max="20"
            />
          </div>
        </div>
      )}
      
      {config.type === 'static' && (
        <div>
          <label className="block text-sm font-medium mb-1">Static Content (JSON)</label>
          <textarea
            value={JSON.stringify(config.data || {}, null, 2)}
            onChange={(e) => {
              try {
                const data = JSON.parse(e.target.value);
                setConfig({ ...config, data });
              } catch (err) {
                // Handle invalid JSON
              }
            }}
            className="w-full p-2 border rounded h-32 font-mono text-sm"
            placeholder='{"title": "My Title", "items": [{"name": "Item 1"}]}'
          />
        </div>
      )}
      
      {/* Display Conditions Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Display Conditions</h4>
          <button
            onClick={addCondition}
            className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
          >
            Add Condition
          </button>
        </div>
        
        {(config.conditions || []).map((condition, index) => (
          <div key={index} className="p-3 border rounded mb-2">
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-medium">Condition Type</label>
              <button
                onClick={() => removeCondition(index)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
            
            <select
              value={condition.type}
              onChange={(e) => updateCondition(index, 'type', e.target.value)}
              className="w-full p-2 border rounded mb-2"
            >
              <option value="time">Time Range</option>
              <option value="userProperty">User Property</option>
              <option value="deviceType">Device Type</option>
            </select>
            
            {condition.type === 'time' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={condition.startTime || ''}
                    onChange={(e) => updateCondition(index, 'startTime', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={condition.endTime || ''}
                    onChange={(e) => updateCondition(index, 'endTime', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
            
            {condition.type === 'userProperty' && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm mb-1">Property</label>
                  <select
                    value={condition.property || 'role'}
                    onChange={(e) => updateCondition(index, 'property', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="role">User Role</option>
                    <option value="country">Country</option>
                    <option value="isLoggedIn">Login Status</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Operator</label>
                  <select
                    value={condition.operator || 'equals'}
                    onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="equals">Equals</option>
                    <option value="notEquals">Not Equals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Value</label>
                  <input
                    type="text"
                    value={condition.value || ''}
                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
            
            {condition.type === 'deviceType' && (
              <div>
                <label className="block text-sm mb-1">Device Type</label>
                <select
                  value={condition.value || 'desktop'}
                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => onSave(config)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};

// Component to render content based on templates
const ContentRenderer = ({ content, template = 'default', isEditing }) => {
  // Skip rendering if no content
  if (!content) {
    return isEditing ? (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded text-center text-gray-500">
        No content available. Configure a content source.
      </div>
    ) : null;
  }
  
  // Basic templates for different content types
  const templates = {
    default: (data) => (
      <div>
        {data.title && <h3 className="text-xl font-bold mb-2">{data.title}</h3>}
        {data.content && <div>{data.content}</div>}
        {data.items && Array.isArray(data.items) && (
          <ul className="mt-2 space-y-1">
            {data.items.map((item, i) => (
              <li key={i} className="p-2 hover:bg-gray-50">
                {item.title && <h4 className="font-medium">{item.title}</h4>}
                {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                {item.url && (
                  <a href={item.url} className="text-blue-500 text-sm" target="_blank" rel="noopener noreferrer">
                    Read more →
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
    
    blog: (data) => (
      <div className="space-y-4">
        {data.title && <h2 className="text-2xl font-bold">{data.title}</h2>}
        {data.items && Array.isArray(data.items) && (
          <div className="space-y-6">
            {data.items.map((post, i) => (
              <div key={i} className="border-b pb-4">
                {post.title && <h3 className="text-xl font-medium">{post.title}</h3>}
                {post.pubDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(post.pubDate).toLocaleDateString()}
                  </p>
                )}
                {post.description && (
                  <div 
                    className="mt-2 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: post.description.substring(0, 150) + '...' }}
                  />
                )}
                {post.link && (
                  <a href={post.link} className="inline-block mt-2 text-blue-500" target="_blank" rel="noopener noreferrer">
                    Read full post →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    
    products: (data) => (
      <div>
        {data.title && <h2 className="text-2xl font-bold mb-4">{data.title}</h2>}
        {data.items && Array.isArray(data.items) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((product, i) => (
              <div key={i} className="border rounded-lg overflow-hidden shadow-sm">
                {product.image && (
                  <img src={product.image} alt={product.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  {product.title && <h3 className="font-medium">{product.title}</h3>}
                  {product.price && <p className="text-lg font-bold mt-1">{product.price}</p>}
                  {product.description && <p className="mt-2 text-sm text-gray-600">{product.description}</p>}
                  {product.url && (
                    <a href={product.url} className="mt-3 inline-block bg-blue-500 text-white px-4 py-2 rounded text-sm">
                      View Product
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    
    events: (data) => (
      <div>
        {data.title && <h2 className="text-2xl font-bold mb-4">{data.title}</h2>}
        {data.items && Array.isArray(data.items) && (
          <div className="space-y-4">
            {data.items.map((event, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <div>
                    {event.title && <h3 className="font-medium">{event.title}</h3>}
                    {event.location && <p className="text-sm text-gray-600 mt-1">{event.location}</p>}
                    {event.description && <p className="mt-2">{event.description}</p>}
                  </div>
                  {event.date && (
                    <div className="bg-gray-100 p-3 rounded text-center min-w-[80px]">
                      <div className="text-lg font-bold">
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-sm">
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  };
  
  // Use the specified template or fall back to default
  const renderTemplate = templates[template] || templates.default;
  
  return <div className="dynamic-content">{renderTemplate(content)}</div>;
};

export default DynamicContent;
