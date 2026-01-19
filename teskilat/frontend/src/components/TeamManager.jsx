import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaTimes, FaLinkedin, FaUser, FaGripVertical } from 'react-icons/fa';
import api from '../api';
import ImageUploader from './ImageUploader';

const TeamManager = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    title: '',
    image_url: '',
    linkedin_url: '',
    display_order: 1
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/content/team');
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch team members', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      title: '',
      image_url: '',
      linkedin_url: '',
      display_order: 1
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await api.put(`/content/team/${editingMember.id}`, formData);
        alert('Team member updated!');
      } else {
        await api.post('/content/team', formData);
        alert('Team member added!');
      }
      setShowModal(false);
      setEditingMember(null);
      resetForm();
      fetchMembers();
    } catch (err) {
      alert('An error occurred!');
      console.error(err);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      surname: member.surname || '',
      title: member.title || '',
      image_url: member.image_url || '',
      linkedin_url: member.linkedin_url || '',
      display_order: member.display_order || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await api.delete(`/content/team/${id}`);
        fetchMembers();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
        <button
          onClick={() => {
            setEditingMember(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <FaPlus />
          Add New Member
        </button>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map(member => (
          <div key={member.id} className="bg-white rounded-lg shadow-lg overflow-hidden group">
            {/* Photo */}
            <div className="relative aspect-square bg-gray-200">
              {member.image_url ? (
                <img
                  src={getImageUrl(member.image_url)}
                  alt={`${member.name} ${member.surname}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <FaUser className="text-6xl text-gray-300" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => handleEdit(member)}
                  className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <FaTrash />
                </button>
              </div>

              {/* Order badge */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <FaGripVertical size={10} />
                #{member.display_order}
              </div>
            </div>
            
            {/* Info */}
            <div className="p-4">
              <h3 className="font-bold text-gray-900">{member.name} {member.surname}</h3>
              {member.title && (
                <p className="text-sm text-gray-500">{member.title}</p>
              )}
              {member.linkedin_url && (
                <a 
                  href={member.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <FaLinkedin />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {members.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaUser className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500">No team members added yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Add first team member →
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingMember ? 'Edit Team Member' : 'New Team Member'}
                </h3>
                <button onClick={() => { setShowModal(false); setEditingMember(null); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Preview */}
                {formData.image_url && (
                  <div className="flex justify-center">
                    <img
                      src={getImageUrl(formData.image_url)}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-full border-4 border-gray-200"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>

                {/* Surname */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Creative Director"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                  <ImageUploader
                    value={formData.image_url}
                    onChange={(url) => setFormData({...formData, image_url: url})}
                    placeholder="Fotoğraf yüklemek için sürükle-bırak veya tıkla"
                    previewClassName="w-32 h-32 rounded-full mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supports direct URLs and Google Drive links</p>
                </div>

                {/* LinkedIn URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 1})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingMember(null); resetForm(); }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingMember ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;
