import { useEffect, useState } from 'react';
import api from '../api';
import WorksManager from '../components/WorksManager';
import TeamManager from '../components/TeamManager';
import BrandsManager from '../components/BrandsManager';
import ServicesManager from '../components/ServicesManager';
import { FaTrophy, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlus, FaSave, FaTimes, FaShieldAlt, FaQrcode } from 'react-icons/fa';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Content Management States
  const [heroUrl, setHeroUrl] = useState('');
  const [videos, setVideos] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // users, content, works, announcements, team, security

  // Security States
  const [qrCode, setQrCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');

  // Announcements States
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    short_description: '',
    full_content: '',
    image_url: '',
    link_url: '',
    link_text: '',
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchData();
    fetchContent();
  }, []);

  useEffect(() => {
    if (activeTab === 'announcements') {
      fetchAnnouncements();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const usersRes = await api.get('/admin/users');
      const statsRes = await api.get('/admin/stats');
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    }
  };

  const setup2FA = async () => {
    try {
      const res = await api.post('/auth/2fa/setup');
      setQrCode(res.data.qrCode);
      setSecurityMessage('Scan this QR code with Google Authenticator');
    } catch (err) {
      setSecurityMessage('Failed to generate QR code');
    }
  };

  const verify2FA = async () => {
    try {
      await api.post('/auth/2fa/verify', { token: twoFactorCode });
      setSecurityMessage('2FA Enabled Successfully!');
      setQrCode('');
      setTwoFactorCode('');
    } catch (err) {
      setSecurityMessage('Invalid Code. Please try again.');
    }
  };

  const fetchContent = async () => {
    try {
      const heroRes = await api.get('/content/hero');
      if (heroRes.data.url) setHeroUrl(heroRes.data.url);
      
      const videoRes = await api.get('/content/videos');
      setVideos(videoRes.data);
    } catch (err) {
      console.error('Failed to fetch content', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/content/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const handleUpdateHero = async (e) => {
    e.preventDefault();
    try {
      await api.put('/content/hero', { url: heroUrl });
      alert('Hero image updated!');
    } catch (err) {
      alert('Failed to update hero image');
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    try {
      await api.post('/content/videos', { youtube_url: newVideoUrl, title: newVideoTitle });
      setNewVideoUrl('');
      setNewVideoTitle('');
      fetchContent();
      alert('Video added!');
    } catch (err) {
      alert('Failed to add video');
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm('Delete this video?')) {
      try {
        await api.delete(`/content/videos/${id}`);
        fetchContent();
      } catch (err) {
        alert('Failed to delete video');
      }
    }
  };

  // Announcement Handlers
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await api.put(`/content/announcements/${editingAnnouncement.id}`, announcementForm);
        alert('Announcement updated!');
      } else {
        await api.post('/content/announcements', announcementForm);
        alert('Announcement added!');
      }
      resetAnnouncementForm();
      fetchAnnouncements();
    } catch (err) {
      alert('Operation failed!');
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      short_description: announcement.short_description || '',
      full_content: announcement.full_content || '',
      image_url: announcement.image_url || '',
      link_url: announcement.link_url || '',
      link_text: announcement.link_text || '',
      is_active: announcement.is_active,
      display_order: announcement.display_order || 0
    });
    setShowAnnouncementForm(true);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.delete(`/content/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        alert('Delete operation failed!');
      }
    }
  };

  const handleToggleAnnouncementStatus = async (id) => {
    try {
      await api.put(`/content/announcements/${id}/toggle`);
      fetchAnnouncements();
    } catch (err) {
      alert('Status change failed!');
    }
  };

  const resetAnnouncementForm = () => {
    setEditingAnnouncement(null);
    setShowAnnouncementForm(false);
    setAnnouncementForm({
      title: '',
      short_description: '',
      full_content: '',
      image_url: '',
      link_url: '',
      link_text: '',
      is_active: true,
      display_order: 0
    });
  };

  // Helper to convert Google Drive link to direct image link
  const getImageUrl = (url) => {
    if (!url) return '';
    // Check if it's a Google Drive link
    if (url.includes('drive.google.com')) {
      // Extract file ID - supports formats: /d/ID/view, /d/ID, id=ID
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      const fileId = idMatch ? idMatch[1] : null;
      
      if (fileId) {
        // Use thumbnail endpoint which is more reliable for embedding
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920-h1080`;
      }
    }
    return url;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">Admin Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-700 pb-4">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-accent text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded ${activeTab === 'content' ? 'bg-accent text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          Content Management
        </button>
        <button 
          onClick={() => setActiveTab('works')}
          className={`px-4 py-2 rounded ${activeTab === 'works' ? 'bg-accent text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          Works Management
        </button>
        <button 
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded ${activeTab === 'announcements' ? 'bg-accent text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          Announcements
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded ${activeTab === 'team' ? 'bg-accent text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          Team
        </button>
        <button 
          onClick={() => setActiveTab('brands')}
          className={`px-4 py-2 rounded ${activeTab === 'brands' ? 'bg-accent text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          Brands
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded ${activeTab === 'services' ? 'bg-accent text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          Services
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded ${activeTab === 'security' ? 'bg-accent text-primary font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          Security
        </button>
      </div>

      {activeTab === 'security' && (
        <div className="bg-white p-8 rounded shadow text-gray-900 max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FaShieldAlt className="text-accent" />
            Two-Factor Authentication (2FA)
          </h2>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              Secure your admin account by enabling 2FA. You will need an authenticator app like Google Authenticator.
            </p>
            
            {!qrCode ? (
              <button 
                onClick={setup2FA}
                className="bg-primary text-white px-6 py-3 rounded hover:bg-secondary transition flex items-center gap-2"
              >
                <FaQrcode />
                Setup 2FA
              </button>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-100 p-4 rounded text-center">
                  <img src={qrCode} alt="2FA QR Code" className="mx-auto mb-4 border-4 border-white shadow-lg" />
                  <p className="text-sm font-bold text-gray-700">{securityMessage}</p>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Enter Verification Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      className="flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-accent text-center text-xl tracking-widest"
                      placeholder="000000"
                    />
                    <button 
                      onClick={verify2FA}
                      className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition font-bold"
                    >
                      Verify & Enable
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {securityMessage && !qrCode && (
              <div className="mt-4 p-4 bg-green-100 text-green-800 rounded border border-green-200">
                {securityMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded shadow border-l-4 border-accent text-gray-900">
                <h3 className="text-gray-500 text-sm uppercase">Total Users</h3>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="bg-white p-6 rounded shadow border-l-4 border-green-500 text-gray-900">
                <h3 className="text-gray-500 text-sm uppercase">System Status</h3>
                <p className="text-3xl font-bold text-green-500">Active</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded shadow overflow-hidden text-gray-900">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">User Management</h2>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">{user.id}</td>
                    <td className="p-4 font-medium">{user.username}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'content' && (
        <div className="space-y-10">
          {/* Hero Image Settings */}
          <div className="bg-white p-6 rounded shadow text-gray-900">
            <h2 className="text-xl font-bold mb-4">Hero Image Settings</h2>
            <form onSubmit={handleUpdateHero} className="flex gap-4">
              <input 
                type="text" 
                value={heroUrl}
                onChange={(e) => setHeroUrl(e.target.value)}
                placeholder="Enter Image URL"
                className="flex-grow p-2 border rounded"
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Update Image
              </button>
            </form>
            {heroUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                <img 
                  src={getImageUrl(heroUrl)} 
                  alt="Hero Preview" 
                  className="h-40 object-cover rounded" 
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          {/* Video Gallery Settings */}
          <div className="bg-white p-6 rounded shadow text-gray-900">
            <h2 className="text-xl font-bold mb-4">Video Gallery Management</h2>
            
            {/* Add Video Form */}
            <form onSubmit={handleAddVideo} className="mb-8 p-4 bg-gray-50 rounded border">
              <h3 className="font-semibold mb-3">Add New Video</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="Video Title"
                  className="p-2 border rounded"
                  required
                />
                <input 
                  type="text" 
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="YouTube URL"
                  className="p-2 border rounded"
                  required
                />
              </div>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Add Video
              </button>
            </form>

            {/* Video List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {videos.map(video => (
                <div key={video.id} className="border rounded p-3 relative group">
                  <div className="aspect-w-16 aspect-h-9 mb-2 bg-gray-200 rounded overflow-hidden">
                     {/* Simple preview or placeholder */}
                     <div className="flex items-center justify-center h-32 bg-gray-800 text-white">
                        Video Preview
                     </div>
                  </div>
                  <h4 className="font-bold truncate">{video.title}</h4>
                  <p className="text-xs text-gray-500 truncate">{video.youtube_url}</p>
                  <button 
                    onClick={() => handleDeleteVideo(video.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* Site Text Content Manager */}
            <div className="border-t pt-8">
                <ContentManager />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'works' && (
        <div className="bg-white rounded shadow p-6 text-gray-900">
          <WorksManager />
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="bg-white rounded shadow p-6 text-gray-900">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              Announcement Management
            </h2>
            {!showAnnouncementForm && (
              <button
                onClick={() => setShowAnnouncementForm(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                <FaPlus /> New Announcement
              </button>
            )}
          </div>

          {/* Announcement Form */}
          {showAnnouncementForm && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">
                  {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
                </h3>
                <button
                  onClick={resetAnnouncementForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      type="text"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input
                      type="text"
                      value={announcementForm.image_url}
                      onChange={(e) => setAnnouncementForm({...announcementForm, image_url: e.target.value})}
                      className="w-full p-2 border rounded"
                      placeholder="https://... or Google Drive link"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Short Description</label>
                  <input
                    type="text"
                    value={announcementForm.short_description}
                    onChange={(e) => setAnnouncementForm({...announcementForm, short_description: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Short description shown below title in modal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Full Content</label>
                  <textarea
                    value={announcementForm.full_content}
                    onChange={(e) => setAnnouncementForm({...announcementForm, full_content: e.target.value})}
                    className="w-full p-2 border rounded h-32"
                    placeholder="Full description text shown in modal"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Link URL</label>
                    <input
                      type="text"
                      value={announcementForm.link_url}
                      onChange={(e) => setAnnouncementForm({...announcementForm, link_url: e.target.value})}
                      className="w-full p-2 border rounded"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Link Text</label>
                    <input
                      type="text"
                      value={announcementForm.link_text}
                      onChange={(e) => setAnnouncementForm({...announcementForm, link_text: e.target.value})}
                      className="w-full p-2 border rounded"
                      placeholder="Read More"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Order</label>
                    <input
                      type="number"
                      value={announcementForm.display_order}
                      onChange={(e) => setAnnouncementForm({...announcementForm, display_order: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={announcementForm.is_active}
                    onChange={(e) => setAnnouncementForm({...announcementForm, is_active: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_active" className="text-sm">Active (visible in Hero)</label>
                </div>

                {/* Image Preview */}
                {announcementForm.image_url && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                    <img
                      src={getImageUrl(announcementForm.image_url)}
                      alt="Preview"
                      className="h-32 object-cover rounded"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    <FaSave /> {editingAnnouncement ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={resetAnnouncementForm}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Announcements List */}
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No announcements added yet.</p>
            ) : (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg ${announcement.is_active ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                >
                  {/* Image */}
                  {announcement.image_url && (
                    <img
                      src={getImageUrl(announcement.image_url)}
                      alt={announcement.title}
                      className="w-20 h-20 object-cover rounded"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{announcement.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${announcement.is_active ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                        {announcement.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {announcement.short_description && (
                      <p className="text-sm text-gray-600">{announcement.short_description}</p>
                    )}
                    {announcement.link_url && (
                      <a href={announcement.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                        {announcement.link_url}
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAnnouncementStatus(announcement.id)}
                      className={`p-2 rounded ${announcement.is_active ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={announcement.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {announcement.is_active ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                    <button
                      onClick={() => handleEditAnnouncement(announcement)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <TeamManager />
        </div>
      )}

      {activeTab === 'brands' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <BrandsManager />
        </div>
      )}

      {activeTab === 'services' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ServicesManager />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
