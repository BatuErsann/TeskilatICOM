import { useState, useEffect } from 'react';
import { FaTrophy, FaExternalLinkAlt, FaCalendarAlt } from 'react-icons/fa';
import api from '../api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/content/announcements/active');
        setAnnouncements(res.data);
      } catch (err) {
        console.error('Failed to fetch announcements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Helper to convert Google Drive link to direct image link
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      const fileId = idMatch ? idMatch[1] : null;
      if (fileId) {
        // Use larger size to preserve original image dimensions
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
      }
    }
    return url;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="py-12 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <FaTrophy className="text-accent text-4xl" />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 text-white">ANNOUNCEMENTS</h1>
          <p className="text-xl text-gray-400">Stay updated with our latest news and achievements</p>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-20">
            <FaTrophy className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {announcements.map((announcement, index) => (
              <div 
                key={announcement.id} 
                className={`bg-secondary rounded-xl overflow-hidden shadow-xl border border-accent/10 hover:border-accent/30 transition ${
                  selectedAnnouncement === announcement.id ? 'ring-2 ring-accent' : ''
                }`}
              >
                <div className="flex flex-col">
                  {/* Content */}
                  <div className="p-8">
                    {/* Badge & Date */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-semibold">
                        <FaTrophy />
                        <span>Announcement</span>
                      </div>
                      {announcement.created_at && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <FaCalendarAlt />
                          <span>{formatDate(announcement.created_at)}</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                      {announcement.title}
                    </h2>

                    {/* Short Description */}
                    {announcement.short_description && (
                      <p className="text-accent text-lg mb-4">
                        {announcement.short_description}
                      </p>
                    )}

                    {/* Full Content */}
                    {announcement.full_content && (
                      <div className="prose prose-invert max-w-none mb-6">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                          {announcement.full_content}
                        </p>
                      </div>
                    )}

                    {/* Link Button */}
                    {announcement.link_url && (
                      <a
                        href={announcement.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-primary font-bold px-6 py-3 rounded-lg transition"
                      >
                        <span>{announcement.link_text || 'Learn More'}</span>
                        <FaExternalLinkAlt />
                      </a>
                    )}

                    {/* Image - Displayed horizontally at original aspect ratio */}
                    {announcement.image_url && (
                      <div className="mt-6">
                        <img
                          src={getImageUrl(announcement.image_url)}
                          alt={announcement.title}
                          className="max-w-full h-auto rounded-lg object-contain"
                          style={{ maxHeight: '600px' }}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
