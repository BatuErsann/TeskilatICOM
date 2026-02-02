import { useState, useEffect } from 'react';
import api from '../api';
import ImageUploader from './ImageUploader';

const ContentManager = () => {
  const [contents, setContents] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Manifesto specific states
  const [manifestoImage, setManifestoImage] = useState('');
  const [manifestoOpacity, setManifestoOpacity] = useState(0.5);

  // About specific states
  const [aboutImage, setAboutImage] = useState('');
  const [aboutOpacity, setAboutOpacity] = useState(0.8);

  useEffect(() => {
    fetchContent();
    fetchAboutSettings();
  }, []);

  useEffect(() => {
    if (contents.manifesto_bg_image) {
      setManifestoImage(contents.manifesto_bg_image);
    }
    if (contents.manifesto_overlay_opacity) {
      setManifestoOpacity(parseFloat(contents.manifesto_overlay_opacity));
    }
  }, [contents]);

  const fetchContent = async () => {
    try {
      const res = await api.get('/content/site-content');
      setContents(res.data);
    } catch (err) {
      console.error('Failed to fetch content', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAboutSettings = async () => {
    try {
      const [bgRes, opacityRes] = await Promise.all([
        api.get('/content/about/background'),
        api.get('/content/about/overlay-opacity')
      ]);
      setAboutImage(bgRes.data.url || '');
      setAboutOpacity(parseFloat(opacityRes.data.opacity) || 0.8);
    } catch (err) {
      console.error('Failed to fetch about settings', err);
    }
  };

  const handleSave = async (key, valueToSave) => {
    const val = valueToSave !== undefined ? valueToSave : editValue;
    try {
      await api.post('/content/site-content', {
        key,
        value: val
      });
      setContents(prev => ({...prev, [key]: val}));
      if (key === editingKey) {
        setEditingKey(null);
      }
      return true;
    } catch (err) {
      alert('Failed to save');
      return false;
    }
  };

  const savedManifestoImage = async (url) => {
    setManifestoImage(url);
    await handleSave('manifesto_bg_image', url);
  };

  const saveManifestoOpacity = async (val) => {
    setManifestoOpacity(val);
    await handleSave('manifesto_overlay_opacity', val.toString());
  };

  const saveAboutImage = async (url) => {
    setAboutImage(url);
    try {
      await api.put('/content/about/background', { url });
    } catch (err) {
      alert('Failed to save about background');
    }
  };

  const saveAboutOpacity = async (val) => {
    setAboutOpacity(val);
    try {
      await api.put('/content/about/overlay-opacity', { opacity: val.toString() });
    } catch (err) {
      alert('Failed to save about opacity');
    }
  };

  return (
    <div className="bg-secondary/50 p-6 rounded-xl border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">Site Content Management</h2>
      
      {/* Manifesto Settings Section */}
      <div className="bg-primary/50 p-6 rounded-lg border border-white/5 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Manifesto Section Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <label className="block text-gray-300 mb-2">Background Image</label>
                <ImageUploader 
                    value={manifestoImage} 
                    onChange={savedManifestoImage} 
                    className="mb-4"
                />
                
                <label className="block text-gray-300 mb-2">Overlay Opacity: {manifestoOpacity}</label>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={manifestoOpacity}
                    onChange={(e) => saveManifestoOpacity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div>
                <label className="block text-gray-300 mb-2">Preview</label>
                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/10 bg-black">
                    {/* Background Image */}
                    {manifestoImage && (
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${manifestoImage})` }}
                        />
                    )}
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-primary"
                        style={{ opacity: manifestoOpacity }}
                    ></div>
                    
                    {/* Content Preview */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                        <h1 className="text-2xl font-display font-bold text-white mb-2">
                        We go the extra mile!
                        </h1>
                        <p className="text-sm text-gray-300 font-light">
                        At its core, Teşkilat believes...
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* About Section Settings */}
      <div className="bg-primary/50 p-6 rounded-lg border border-white/5 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">About Section Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <label className="block text-gray-300 mb-2">Background Image</label>
                <ImageUploader 
                    value={aboutImage} 
                    onChange={saveAboutImage} 
                    className="mb-4"
                />
                
                <label className="block text-gray-300 mb-2">Overlay Opacity: {aboutOpacity}</label>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={aboutOpacity}
                    onChange={(e) => saveAboutOpacity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div>
                <label className="block text-gray-300 mb-2">Preview</label>
                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/10 bg-black">
                    {/* Background Image */}
                    {aboutImage && (
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${aboutImage})` }}
                        />
                    )}
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-primary"
                        style={{ opacity: aboutOpacity }}
                    ></div>
                    
                    {/* Content Preview */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                        <h2 className="text-xl font-display font-bold text-accent mb-2">
                        WHO WE ARE?
                        </h2>
                        <p className="text-xs text-gray-300 font-light">
                        We believe in the power of connected ideas...
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-4">Advance/Raw Content</h3>
        {Object.entries(contents)
            .filter(([key]) => !['manifesto_bg_image', 'manifesto_overlay_opacity'].includes(key))
            .map(([key, value]) => (
          <div key={key} className="bg-primary/50 p-4 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-accent font-mono text-sm">{key}</span>
              <button 
                onClick={() => {
                    if (editingKey === key) {
                        handleSave(key);
                    } else {
                        setEditingKey(key);
                        setEditValue(value);
                    }
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                {editingKey === key ? 'Save' : 'Edit'}
              </button>
            </div>
            {editingKey === key ? (
                <textarea 
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white h-32"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                />
            ) : (
                <p className="text-gray-300 whitespace-pre-wrap">{value}</p>
            )}
          </div>
        ))}
        
        {/* Add New Key Section */}
        <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Add New Content</h3>
            <AddNewContentForm onAdd={(k, v) => {
                setContents({...contents, [k]: v});
            }} />
        </div>
      </div>
    </div>
  );
};

const AddNewContentForm = ({ onAdd }) => {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/content/site-content', { key, value });
            onAdd(key, value);
            setKey('');
            setValue('');
            alert('Added!');
        } catch (err) {
            alert('Failed to add');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-400 text-sm mb-1">Key (e.g., home_title)</label>
                <input 
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    required
                />
            </div>
            <div>
                <label className="block text-gray-400 text-sm mb-1">Value</label>
                <textarea 
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white h-32"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="bg-accent text-primary px-4 py-2 rounded font-bold">
                Add Content
            </button>
        </form>
    );
};

export default ContentManager;
