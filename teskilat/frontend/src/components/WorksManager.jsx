import { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaGripVertical, FaImage, FaVideo, FaLink, FaTimes, FaExpand, FaCompress, FaEye, FaStar } from 'react-icons/fa';
import api from '../api';

const WorksManager = () => {
  const [works, setWorks] = useState([]);
  const [layout, setLayout] = useState([]);
  const [featuredLayout, setFeaturedLayout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'layout', 'featured'
  const [layoutChanged, setLayoutChanged] = useState(false);
  const [featuredLayoutChanged, setFeaturedLayoutChanged] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_type: 'image',
    media_url: '',
    thumbnail_url: '',
    link_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    category: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [worksRes, layoutRes, featuredLayoutRes] = await Promise.all([
        api.get('/content/works'),
        api.get('/content/works/layout'),
        api.get('/content/works/layout/featured')
      ]);
      setWorks(worksRes.data);
      
      let layoutData = [];
      if (layoutRes.data && layoutRes.data.layout_data) {
        layoutData = typeof layoutRes.data.layout_data === 'string' 
          ? JSON.parse(layoutRes.data.layout_data) 
          : layoutRes.data.layout_data;
      }
      setLayout(layoutData);

      let featuredLayoutData = [];
      if (featuredLayoutRes.data && featuredLayoutRes.data.layout_data) {
        featuredLayoutData = typeof featuredLayoutRes.data.layout_data === 'string' 
          ? JSON.parse(featuredLayoutRes.data.layout_data) 
          : featuredLayoutRes.data.layout_data;
      }
      setFeaturedLayout(featuredLayoutData);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      media_type: 'image',
      media_url: '',
      thumbnail_url: '',
      link_url: '',
      instagram_url: '',
      linkedin_url: '',
      youtube_url: '',
      category: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWork) {
        await api.put(`/content/works/${editingWork.id}`, formData);
        alert('Work updated!');
      } else {
        await api.post('/content/works', formData);
        alert('Work added!');
      }
      setShowAddModal(false);
      setEditingWork(null);
      resetForm();
      fetchData();
    } catch (err) {
      alert('An error occurred!');
      console.error(err);
    }
  };

  const handleEdit = (work) => {
    setEditingWork(work);
    setFormData({
      title: work.title || '',
      description: work.description || '',
      media_type: work.media_type || 'image',
      media_url: work.media_url || '',
      thumbnail_url: work.thumbnail_url || '',
      link_url: work.link_url || '',
      instagram_url: work.instagram_url || '',
      linkedin_url: work.linkedin_url || '',
      youtube_url: work.youtube_url || '',
      category: work.category || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this work?')) {
      try {
        await api.delete(`/content/works/${id}`);
        // Remove from layout if exists
        setLayout(prev => prev.filter(item => item.workId !== id));
        fetchData();
      } catch (err) {
        alert('Delete operation failed!');
      }
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await api.put(`/content/works/${id}/featured`);
      fetchData();
    } catch (err) {
      alert('Failed to change featured status!');
      console.error(err);
    }
  };

  const handleSaveLayout = async () => {
    try {
      await api.put('/content/works/layout', { layout_data: layout });
      setLayoutChanged(false);
      alert('Layout saved!');
    } catch (err) {
      alert('Failed to save layout!');
      console.error(err);
    }
  };

  const handleSaveFeaturedLayout = async () => {
    try {
      await api.put('/content/works/layout/featured', { layout_data: featuredLayout });
      setFeaturedLayoutChanged(false);
      alert('Home page layout saved!');
    } catch (err) {
      alert('Failed to save home page layout!');
      console.error(err);
    }
  };

  // Get image URL (supports Google Drive)
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      const fileId = idMatch ? idMatch[1] : null;
      if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`;
      }
    }
    return url;
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    // YouTube watch, embed, shorts ve youtu.be linklerini destekle
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const getThumbnail = (work) => {
    if (work.thumbnail_url) return getImageUrl(work.thumbnail_url);
    if (work.media_type === 'video') {
      const ytId = getYouTubeId(work.media_url);
      if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
    }
    return getImageUrl(work.media_url);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Works Management</h2>
        <div className="flex flex-wrap gap-3">
          {/* Tab Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'layout' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaGripVertical size={12} />
              Works Layout
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'featured' ? 'bg-yellow-500 text-black' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaStar size={12} />
              Home Layout
            </button>
          </div>
          <button
            onClick={() => {
              setEditingWork(null);
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FaPlus />
            New Work
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'layout' ? (
        <LayoutEditor 
          works={works}
          layout={layout}
          setLayout={setLayout}
          setLayoutChanged={setLayoutChanged}
          layoutChanged={layoutChanged}
          onSave={handleSaveLayout}
          getThumbnail={getThumbnail}
          onEditWork={handleEdit}
          onDeleteWork={handleDelete}
          title="Works Page Layout"
          description="Order and format of content to be displayed on the Works page"
        />
      ) : activeTab === 'featured' ? (
        <LayoutEditor 
          works={works.filter(w => w.is_featured)}
          layout={featuredLayout}
          setLayout={setFeaturedLayout}
          setLayoutChanged={setFeaturedLayoutChanged}
          layoutChanged={featuredLayoutChanged}
          onSave={handleSaveFeaturedLayout}
          getThumbnail={getThumbnail}
          onEditWork={handleEdit}
          onDeleteWork={handleDelete}
          title="Home Page Layout"
          description="Order and format of featured works to be displayed on the home page"
          isFeaturedMode={true}
        />
      ) : (
        /* List Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map(work => (
            <div key={work.id} className="bg-white rounded-lg shadow-lg overflow-hidden group">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-200">
                <img
                  src={getThumbnail(work)}
                  alt={work.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleToggleFeatured(work.id)}
                    className={`p-3 rounded-full transition ${work.is_featured ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white hover:bg-yellow-500'}`}
                    title={work.is_featured ? 'Remove from Home' : 'Show on Home'}
                  >
                    <FaStar />
                  </button>
                  <button
                    onClick={() => handleEdit(work)}
                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(work.id)}
                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    work.media_type === 'video' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {work.media_type === 'video' ? <FaVideo className="inline" /> : <FaImage className="inline" />}
                    <span className="ml-1 uppercase">{work.media_type}</span>
                  </span>
                </div>
                {/* Link indicator */}
                {work.link_url && (
                  <div className="absolute top-2 right-2">
                    <span className="p-2 bg-accent rounded-full">
                      <FaLink className="text-primary text-xs" />
                    </span>
                  </div>
                )}
                {/* Featured badge */}
                {work.is_featured && (
                  <div className="absolute bottom-2 right-2">
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-black rounded text-xs font-bold">
                      <FaStar size={10} /> Featured
                    </span>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {work.category && (
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                      {work.category}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 truncate">{work.title}</h3>
                {work.description && (
                  <p className="text-sm text-gray-500 truncate">{work.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {works.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaImage className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500">No works added yet.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Add your first work →
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <WorkFormModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowAddModal(false);
            setEditingWork(null);
            resetForm();
          }}
          isEditing={!!editingWork}
          getThumbnail={getThumbnail}
          getImageUrl={getImageUrl}
        />
      )}
    </div>
  );
};

// Layout Editor Component with Drag & Drop
const LayoutEditor = ({ works, layout, setLayout, setLayoutChanged, layoutChanged, onSave, getThumbnail, onEditWork, onDeleteWork, title, description, isFeaturedMode }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // Works not in layout
  const availableWorks = works.filter(w => !layout.some(l => l.workId === w.id));

  // Add work to layout with default aspect ratio
  const addToLayout = (work) => {
    const newItem = {
      workId: work.id,
      aspectRatio: 'landscape', // landscape, portrait, square, tall
      link_url: work.link_url || ''
    };
    setLayout([...layout, newItem]);
    setLayoutChanged(true);
  };

  // Remove from layout
  const removeFromLayout = (workId) => {
    setLayout(layout.filter(item => item.workId !== workId));
    setLayoutChanged(true);
  };

  // Update item aspect ratio
  const updateItemAspectRatio = (workId, aspectRatio) => {
    setLayout(layout.map(item => 
      item.workId === workId ? { ...item, aspectRatio } : item
    ));
    setLayoutChanged(true);
  };

  // Update item size (legacy function - kept for backwards compatibility)
  const updateItemSize = (workId, colSpan, rowSpan) => {
    setLayout(layout.map(item => 
      item.workId === workId ? { ...item, colSpan, rowSpan } : item
    ));
    setLayoutChanged(true);
  };

  // Update item link
  const updateItemLink = (workId, link_url) => {
    setLayout(layout.map(item => 
      item.workId === workId ? { ...item, link_url } : item
    ));
    setLayoutChanged(true);
  };

  // Drag handlers
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newLayout = [...layout];
      const draggedItemContent = newLayout[dragItem.current];
      newLayout.splice(dragItem.current, 1);
      newLayout.splice(dragOverItem.current, 0, draggedItemContent);
      setLayout(newLayout);
      setLayoutChanged(true);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Aspect Ratio options
  const aspectRatioOptions = [
    { value: 'landscape', label: '📺 Yatay (16:9)', class: 'aspect-video' },
    { value: 'portrait', label: '📱 Dikey (9:16)', class: 'aspect-[9/16]' },
    { value: 'square', label: '⬜ Kare (1:1)', class: 'aspect-square' },
    { value: 'tall', label: '📄 Uzun (3:4)', class: 'aspect-[3/4]' },
  ];

  const getAspectClass = (aspectRatio) => {
    const option = aspectRatioOptions.find(o => o.value === aspectRatio);
    return option ? option.class : 'aspect-video';
  };

  const getWork = (workId) => works.find(w => w.id === workId);

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      {(title || description) && (
        <div className={`rounded-lg p-4 ${isFeaturedMode ? 'bg-yellow-50 border border-yellow-200' : 'bg-purple-50 border border-purple-200'}`}>
          {title && <h3 className={`font-bold text-lg ${isFeaturedMode ? 'text-yellow-800' : 'text-purple-800'}`}>{title}</h3>}
          {description && <p className={`text-sm mt-1 ${isFeaturedMode ? 'text-yellow-700' : 'text-purple-700'}`}>{description}</p>}
        </div>
      )}

      {/* Save Button */}
      {layoutChanged && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-green-800">Layout changes not saved!</span>
          <button
            onClick={onSave}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FaSave />
            Save Layout
          </button>
        </div>
      )}

      {/* Available Works */}
      {availableWorks.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">
            {isFeaturedMode ? 'Available Featured Works' : 'Available Works'}
          </h3>
          <div className="flex flex-wrap gap-3">
            {availableWorks.map(work => (
              <button
                key={work.id}
                onClick={() => addToLayout(work)}
                className={`flex items-center gap-2 bg-white border-2 border-dashed rounded-lg p-2 transition group ${
                  isFeaturedMode ? 'border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <img
                  src={getThumbnail(work)}
                  alt={work.title}
                  className="w-16 h-12 object-cover rounded"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left">
                  <p className="font-medium text-sm text-gray-900 truncate max-w-[150px]">{work.title}</p>
                  <p className="text-xs text-gray-500">{work.media_type}</p>
                </div>
                <FaPlus className="text-gray-400 group-hover:text-blue-500 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Layout Preview */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <FaEye />
          Layout Preview (Drag & Drop)
        </h3>
        
        {layout.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {layout.map((item, index) => {
              const work = getWork(item.workId);
              if (!work) return null;
              
              const aspectClass = getAspectClass(item.aspectRatio);
              const isPortrait = item.aspectRatio === 'portrait';
              
              return (
                <div
                  key={item.workId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`relative group cursor-move rounded-lg overflow-hidden mb-4 break-inside-avoid ring-2 ring-transparent hover:ring-accent transition-all ${aspectClass}`}
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Background */}
                  <img
                    src={getThumbnail(work)}
                    alt={work.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Aspect Ratio Badge */}
                  <div className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded ${
                    isPortrait ? 'bg-purple-500' : 'bg-blue-500'
                  }`}>
                    {aspectRatioOptions.find(o => o.value === item.aspectRatio)?.label?.split(' ')[0] || '📺'}
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <FaGripVertical className="text-white/50 text-2xl" />
                    <p className="text-white text-sm font-medium text-center px-2">{work.title}</p>
                    
                    {/* Actions */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                          setShowLinkModal(true);
                        }}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        title="Edit Link"
                      >
                        <FaLink size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromLayout(item.workId);
                        }}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        title="Remove"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Link indicator */}
                  {item.link_url && (
                    <div className="absolute top-2 right-2 bg-accent rounded-full p-1">
                      <FaLink className="text-primary text-xs" />
                    </div>
                  )}
                  
                  {/* Index indicator */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FaGripVertical className="mx-auto text-4xl mb-4 opacity-30" />
            <p>{isFeaturedMode ? 'No featured works. Star works from the list first.' : 'Layout is empty. Add works from above.'}</p>
          </div>
        )}
      </div>

      {/* Aspect Ratio Controls for Selected Item */}
      {selectedItem && !showLinkModal && (
        <div className="bg-white rounded-lg p-4 border shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Format Settings: {getWork(selectedItem.workId)?.title}
            </h3>
            <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>
          
          {/* Aspect Ratio Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Content Format</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {aspectRatioOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    updateItemAspectRatio(selectedItem.workId, opt.value);
                    setSelectedItem({...selectedItem, aspectRatio: opt.value});
                  }}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedItem.aspectRatio === opt.value 
                      ? 'border-accent bg-accent/10' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`bg-gray-300 rounded ${
                    opt.value === 'landscape' ? 'w-16 h-9' :
                    opt.value === 'portrait' ? 'w-9 h-16' :
                    opt.value === 'square' ? 'w-12 h-12' :
                    'w-10 h-14'
                  }`}></div>
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Link Edit Modal */}
      {showLinkModal && selectedItem && (
        <LinkEditModal
          item={selectedItem}
          work={getWork(selectedItem.workId)}
          onSave={(link) => {
            updateItemLink(selectedItem.workId, link);
            setShowLinkModal(false);
            setSelectedItem(null);
          }}
          onClose={() => {
            setShowLinkModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};

// Link Edit Modal
const LinkEditModal = ({ item, work, onSave, onClose }) => {
  const [linkUrl, setLinkUrl] = useState(item.link_url || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Link Reference</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Enter the link to open when "{work?.title}" is clicked.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(linkUrl)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Work Form Modal
const WorkFormModal = ({ formData, setFormData, onSubmit, onClose, isEditing, getThumbnail, getImageUrl }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Work' : 'Add New Work'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Project title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Short description about the project"
            />
          </div>

          {/* Media Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Type *</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                formData.media_type === 'image' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="media_type"
                  value="image"
                  checked={formData.media_type === 'image'}
                  onChange={handleChange}
                  className="hidden"
                />
                <FaImage className={formData.media_type === 'image' ? 'text-blue-500' : 'text-gray-400'} size={24} />
                <span className={formData.media_type === 'image' ? 'font-medium text-blue-900' : 'text-gray-600'}>
                  Image
                </span>
              </label>
              <label className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                formData.media_type === 'video' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="media_type"
                  value="video"
                  checked={formData.media_type === 'video'}
                  onChange={handleChange}
                  className="hidden"
                />
                <FaVideo className={formData.media_type === 'video' ? 'text-red-500' : 'text-gray-400'} size={24} />
                <span className={formData.media_type === 'video' ? 'font-medium text-red-900' : 'text-gray-600'}>
                  Video
                </span>
              </label>
            </div>
          </div>

          {/* Media URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.media_type === 'video' ? 'YouTube URL *' : 'Image URL *'}
            </label>
            <input
              type="url"
              name="media_url"
              value={formData.media_url}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={formData.media_type === 'video' ? 'https://youtube.com/watch?v=...' : 'https://... or Google Drive link'}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.media_type === 'image' ? 'Google Drive links are supported' : 'Enter YouTube video link'}
            </p>
          </div>

          {/* Thumbnail URL (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preview Image (Optional)</label>
            <input
              type="url"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Custom thumbnail URL"
            />
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proje Linki (Opsiyonel)</label>
            <input
              type="url"
              name="link_url"
              value={formData.link_url}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://project-website.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              External link to open when clicked
            </p>
          </div>

          {/* Social Media Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
              <input
                type="url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Video Production, Design, vb."
            />
          </div>

          {/* Preview */}
          {formData.media_url && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {formData.media_type === 'video' ? (
                  (() => {
                    const match = formData.media_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
                    const ytId = match ? match[1] : null;
                    return ytId ? (
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Invalid YouTube URL
                      </div>
                    );
                  })()
                ) : (
                  <img
                    src={getImageUrl(formData.media_url)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {isEditing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorksManager;
