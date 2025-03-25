// src/components/editor/controls/PersonalizationSettings.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';

const PersonalizationSettings = ({ siteId, onClose }) => {
  const [settings, setSettings] = useState({
    enabled: false,
    userProfileFields: [],
    contentRules: [],
    abTests: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'personalization_settings', siteId));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load personalization settings');
        setLoading(false);
      }
    };
    loadSettings();
  }, [siteId]);

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    try {
      await setDoc(doc(db, 'personalization_settings', siteId), settings);
      setSaving(false);
      onClose();
    } catch (err) {
      setError('Failed to save personalization settings');
      setSaving(false);
    }
  };

  // Additional logic for fields, rules, and A/B tests would go here

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Personalization Settings</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {/* UI Controls for toggling personalization and managing settings */}
      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default PersonalizationSettings;

