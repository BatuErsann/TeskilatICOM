import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaTimes, FaImage } from 'react-icons/fa';
import api from '../api';

const BrandsManager = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    display_order: 0
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands');
      setBrands(res.data);
    } catch (err) {
      console.error('Failed to fetch brands', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      display_order: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, formData);
        alert('Brand updated!');
      } else {
        await api.post('/brands', formData);
        alert('Brand added!');
      }
      setShowModal(false);
      setEditingBrand(null);
      resetForm();
      fetchBrands();
    } catch (err) {
      alert('An error occurred!');
      console.error(err);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      logo_url: brand.logo_url || '',
      display_order: brand.display_order || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await api.delete(`/brands/${id}`);
        fetchBrands();
      } catch (err) {
        alert('Delete operation failed!');
      }
    }
  };

  // Get image URL (supports Google Drive)
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      const fileId = idMatch ? idMatch[1] : null;
      if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`;
      }
    }
    return url;
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-secondary/50 p-6 rounded-xl border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Brands Management</h2>
        <button 
          onClick={() => {
            setEditingBrand(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-accent hover:bg-accent/80 text-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
        >
          <FaPlus /> Add Brand
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-primary/50 p-4 rounded-lg border border-white/5 flex items-center gap-4 group">
            <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {brand.logo_url ? (
                <img 
                  src={getImageUrl(brand.logo_url)} 
                  alt={brand.name} 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <FaImage className="text-gray-600 text-2xl" />
              )}
            </div>
            
            <div className="flex-grow">
              <h3 className="text-white font-bold">{brand.name}</h3>
              <p className="text-gray-500 text-sm">Order: {brand.display_order}</p>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(brand)}
                className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/40 transition"
              >
                <FaEdit />
              </button>
              <button 
                onClick={() => handleDelete(brand.id)}
                className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-secondary w-full max-w-md rounded-xl border border-white/10 p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FaTimes size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Brand Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-primary border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Logo URL</label>
                <input 
                  type="text" 
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                  className="w-full bg-primary border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Display Order</label>
                <input 
                  type="number" 
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  className="w-full bg-primary border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-accent hover:bg-accent/80 text-primary font-bold py-3 rounded-lg transition mt-4"
              >
                {editingBrand ? 'Update Brand' : 'Add Brand'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandsManager;
