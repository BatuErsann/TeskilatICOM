import { useEffect, useState } from 'react';
import { FaPlay, FaImage, FaExternalLinkAlt, FaTimes, FaInstagram, FaLinkedin, FaYoutube, FaTrophy, FaArrowRight, FaFacebook, FaTwitter, FaLink } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';

const Works = () => {
  const [works, setWorks] = useState([]);
  const [layout, setLayout] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState(null);
  const [filter, setFilter] = useState('all');
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && location.hash === '#announcements') {
      const element = document.getElementById('announcements');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [loading, location.hash]);

  const fetchData = async () => {
    try {
      const [worksRes, layoutRes, announcementsRes] = await Promise.all([
        api.get('/content/works'),
        api.get('/content/works/layout'),
        api.get('/content/announcements/active')
      ]);
      setWorks(worksRes.data);
      setAnnouncements(announcementsRes.data);
      
      let layoutData = [];
      if (layoutRes.data && layoutRes.data.layout_data) {
        layoutData = typeof layoutRes.data.layout_data === 'string' 
          ? JSON.parse(layoutRes.data.layout_data) 
          : layoutRes.data.layout_data;
      }
      setLayout(layoutData);
    } catch (err) {
      console.error('Failed to fetch works', err);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      const fileId = idMatch ? idMatch[1] : null;
      if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920-h1080`;
      }
    }
    return url;
  };

  const categories = ['all', ...new Set(works.map(w => w.category).filter(Boolean))];

  // Get works from layout and add aspect ratio info
  const getDisplayWorks = () => {
    if (layout.length > 0) {
      return layout.map(item => {
        const work = works.find(w => w.id === item.workId);
        if (!work) return null;
        return { ...work, layoutConfig: item };
      }).filter(Boolean);
    }
    // Filter uygula
    const filtered = filter === 'all' ? works : works.filter(w => w.category === filter);
    return filtered.map(w => ({ ...w, layoutConfig: null }));
  };

  const displayWorks = getDisplayWorks();

  const getSocialIcon = (url) => {
    if (!url) return null;
    if (url.includes('instagram.com')) return <FaInstagram size={24} />;
    if (url.includes('linkedin.com')) return <FaLinkedin size={24} />;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return <FaYoutube size={24} />;
    if (url.includes('facebook.com')) return <FaFacebook size={24} />;
    if (url.includes('twitter.com') || url.includes('x.com')) return <FaTwitter size={24} />;
    return <FaLink size={24} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Works
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover our creative projects.
          </p>
        </div>

        {/* Masonry Grid - CSS columns ile organik layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {displayWorks.map((work) => (
            <MasonryCard
              key={work.id}
              work={work}
              getImageUrl={getImageUrl}
              getYouTubeId={getYouTubeId}
              onClick={() => setSelectedWork(work)}
            />
          ))}
        </div>

        {/* Empty State */}
        {displayWorks.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No works added yet.</p>
          </div>
        )}

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <div className="mt-24" id="announcements">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Latest News</h2>
              <div className="w-24 h-1 bg-accent mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-secondary rounded-xl overflow-hidden shadow-2xl border border-accent/20">
                  <div className="md:flex">
                    {announcement.image_url && (
                      <div className="md:w-1/3">
                        <img
                          src={getImageUrl(announcement.image_url)}
                          alt={announcement.title}
                          className="w-full h-64 md:h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className={`p-8 ${announcement.image_url ? 'md:w-2/3' : 'w-full'} relative`}>
                      <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                        {announcement.link_url ? (
                          <a 
                            href={announcement.link_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-accent transition"
                          >
                            {announcement.title}
                          </a>
                        ) : (
                          announcement.title
                        )}
                      </h3>
                      {announcement.short_description && (
                        <p className="text-gray-400 text-lg mb-4">
                          {announcement.short_description}
                        </p>
                      )}
                      {announcement.full_content && (
                        <p className="text-gray-300 mb-6">
                          {announcement.full_content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedWork && (
        <WorkModal 
          work={selectedWork} 
          onClose={() => setSelectedWork(null)} 
          getImageUrl={getImageUrl}
          getYouTubeId={getYouTubeId}
        />
      )}
    </div>
  );
};

// Masonry Card - Each content with its own aspect ratio
const MasonryCard = ({ work, getImageUrl, getYouTubeId, onClick }) => {
  const [loaded, setLoaded] = useState(false);
  const isVideo = work.media_type === 'video';
  const youtubeId = isVideo ? getYouTubeId(work.media_url) : null;
  const isShort = work.media_url?.includes('shorts') || work.layoutConfig?.aspectRatio === 'portrait';
  
  const thumbnail = work.thumbnail_url 
    ? getImageUrl(work.thumbnail_url) 
    : (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : getImageUrl(work.media_url));

  // Aspect ratio'yu layoutConfig'den al
  const getAspectRatio = () => {
    const config = work.layoutConfig;
    if (config?.aspectRatio === 'portrait') return 'aspect-[9/16]';
    if (config?.aspectRatio === 'square') return 'aspect-square';
    if (config?.aspectRatio === 'tall') return 'aspect-[3/4]';
    if (isShort) return 'aspect-[9/16]';
    return 'aspect-video';
  };

  return (
    <div 
      className="break-inside-avoid mb-4 group cursor-pointer"
      onClick={onClick}
    >
      <div className={`relative overflow-hidden rounded-xl bg-gray-800 ${getAspectRatio()}`}>
        {/* Thumbnail */}
        <img
          src={thumbnail}
          alt={work.title}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer"
        />
        
        {/* Loading placeholder */}
        {!loaded && (
          <div className="absolute inset-0 bg-gray-700 animate-pulse" />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button for Videos */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-xl">
              <FaPlay className="text-primary text-lg ml-1" />
            </div>
          </div>
        )}
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium ${
              isVideo ? 'bg-red-500/80 text-white' : 'bg-blue-500/80 text-white'
            }`}>
              {isVideo ? <FaPlay size={8} /> : <FaImage size={8} />}
              {work.category || (isVideo ? 'VIDEO' : 'IMAGE')}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-white font-bold text-base leading-tight drop-shadow-lg">
            {work.title}
          </h3>
        </div>

        {/* External Link Indicator */}
        {(work.link_url || work.layoutConfig?.link_url) && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-accent rounded-full p-2 shadow-lg">
              <FaExternalLinkAlt className="text-primary text-xs" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Work Modal
const WorkModal = ({ work, onClose, getImageUrl, getYouTubeId }) => {
  const isVideo = work.media_type === 'video';
  const youtubeId = isVideo ? getYouTubeId(work.media_url) : null;
  const isShort = work.media_url?.includes('shorts') || work.layoutConfig?.aspectRatio === 'portrait';

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
    >
      <div 
        className={`relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl ${
          isShort ? 'max-w-sm' : 'max-w-5xl'
        } w-full max-h-[90vh] flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white/70 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
        >
          <FaTimes size={20} />
        </button>

        {/* Media */}
        <div className={`bg-black flex-shrink-0 ${isShort ? 'aspect-[9/16]' : 'aspect-video'}`}>
          {isVideo && youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              title={work.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img
              src={getImageUrl(work.media_url)}
              alt={work.title}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {/* Info */}
        <div className="p-5 overflow-y-auto">
          <div className="flex items-center gap-3 mb-2">
            {work.category && (
              <span className="text-xs text-accent uppercase tracking-wider bg-accent/20 px-3 py-1 rounded-full">
                {work.category}
              </span>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">{work.title}</h2>
          
          {work.description && (
            <p className="text-gray-400 text-sm mb-4">{work.description}</p>
          )}

          <div className="flex flex-wrap gap-3">
            {(work.link_url || work.layoutConfig?.link_url) && (
                <a
                href={work.link_url || work.layoutConfig?.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-primary font-bold px-5 py-2 rounded-lg transition text-sm"
              >
                <span>View Project</span>
                <FaExternalLinkAlt size={12} />
              </a>
            )}

            {work.instagram_url && (
              <a
                href={work.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-accent hover:text-primary text-white rounded-lg transition"
                title="View on Instagram"
              >
                <FaInstagram size={20} />
              </a>
            )}

            {work.linkedin_url && (
              <a
                href={work.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-accent hover:text-primary text-white rounded-lg transition"
                title="View on LinkedIn"
              >
                <FaLinkedin size={20} />
              </a>
            )}

            {work.youtube_url && (
              <a
                href={work.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-accent hover:text-primary text-white rounded-lg transition"
                title="View on YouTube"
              >
                <FaYoutube size={20} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Works;
