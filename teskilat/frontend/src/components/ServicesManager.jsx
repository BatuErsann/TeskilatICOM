import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaTimes, FaBullhorn, FaPalette, FaFilm, FaMobileAlt, FaChartLine, FaUsers } from 'react-icons/fa';
import api from '../api';

const ServicesManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'FaBullhorn',
    display_order: 0
  });

  const iconOptions = [
    { value: 'FaBullhorn', label: 'Bullhorn (Strategy)' },
    { value: 'FaPalette', label: 'Palette (Design)' },
    { value: 'FaFilm', label: 'Film (Video)' },
    { value: 'FaMobileAlt', label: 'Mobile (Digital)' },
    { value: 'FaChartLine', label: 'Chart (Brand)' },
    { value: 'FaUsers', label: 'Users (Event)' }
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/content/services');
      setServices(res.data);
    } catch (err) {
      console.error('Failed to fetch services', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: 'FaBullhorn',
      display_order: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/content/services/${editingService.id}`, formData);
        alert('Service updated!');
      } else {
        await api.post('/content/services', formData);
        alert('Service added!');
      }
      setShowModal(false);
      setEditingService(null);
      resetForm();
      fetchServices();
    } catch (err) {
      alert('An error occurred!');
      console.error(err);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      icon: service.icon || 'FaBullhorn',
      display_order: service.display_order || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/content/services/${id}`);
        fetchServices();
      } catch (err) {
        alert('Delete operation failed!');
      }
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-secondary/50 p-6 rounded-xl border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Services Management</h2>
        <button 
          onClick={() => {
            setEditingService(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-accent text-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-accent/80 transition"
        >
          <FaPlus /> Add Service
        </button>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <div key={service.id} className="bg-primary/50 p-4 rounded-lg flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center text-accent">
                 {/* Simple icon render */}
                 {service.icon === 'FaBullhorn' && <FaBullhorn />}
                 {service.icon === 'FaPalette' && <FaPalette />}
                 {service.icon === 'FaFilm' && <FaFilm />}
                 {service.icon === 'FaMobileAlt' && <FaMobileAlt />}
                 {service.icon === 'FaChartLine' && <FaChartLine />}
                 {service.icon === 'FaUsers' && <FaUsers />}
              </div>
              <div>
                <h3 className="font-bold text-white">{service.title}</h3>
                <p className="text-sm text-gray-400 truncate max-w-md">{service.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleEdit(service)}
                className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition"
              >
                <FaEdit />
              </button>
              <button 
                onClick={() => handleDelete(service.id)}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                >
                  {iconOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none h-32"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 rounded-lg text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-accent text-primary font-bold hover:bg-accent/80 transition"
                >
                  {editingService ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManager;
