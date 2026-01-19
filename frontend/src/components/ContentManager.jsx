import { useState, useEffect } from 'react';
import api from '../api';

const ContentManager = () => {
  const [contents, setContents] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

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

  const handleSave = async (key) => {
    try {
      await api.post('/content/site-content', {
        key,
        value: editValue
      });
      setContents({...contents, [key]: editValue});
      setEditingKey(null);
      alert('Saved!');
    } catch (err) {
      alert('Failed to save');
    }
  };

  return (
    <div className="bg-secondary/50 p-6 rounded-xl border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">Site Content Management</h2>
      
      <div className="space-y-4">
        {Object.entries(contents).map(([key, value]) => (
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
