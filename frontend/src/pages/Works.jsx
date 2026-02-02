import { useEffect, useState } from 'react';
import { FaPlay, FaImage, FaExternalLinkAlt, FaTimes, FaInstagram, FaLinkedin, FaYoutube, FaTrophy, FaArrowRight, FaFacebook, FaTwitter, FaLink } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';

const Works = () => {
  const [works, setWorks] = useState([]);
  const [layout, setLayout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState(null);
  const [filter, setFilter] = useState('all');
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [worksRes, layoutRes] = await Promise.all([
        api.get('/content/works'),
        api.get('/content/works/layout')
      ]);
      setWorks(worksRes.data);
      
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

  const getVimeoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:vimeo\.com\/)(\d+)/);
    return match ? match[1] : null;
  };

  const getInstagramId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:instagram\.com\/(?:p|reel|tv)\/)([\w-]+)/);
    return match ? match[1] : null;
  };

  const detectVideoPlatform = (work) => {
    if (work.video_platform) return work.video_platform;
    const url = work.media_url;
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('tiktok.com')) return 'tiktok';
    return 'other';
  };

  const getVideoThumbnail = (work) => {
    // 1. Öncelik: Manuel yüklenmiş thumbnail (backend'den gelen)
    if (work.thumbnail_url) return getImageUrl(work.thumbnail_url);
    
    const platform = detectVideoPlatform(work);
    
    // SVG placeholder oluştur
    const createPlatformPlaceholder = (platform, text, colors) => {
      const svg = `
        <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${platform}-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              ${colors.map((color, i) => `<stop offset="${(i / (colors.length - 1)) * 100}%" style="stop-color:${color};stop-opacity:1" />`).join('')}
            </linearGradient>
          </defs>
          <rect width="1920" height="1080" fill="url(#${platform}-grad)"/>
          <text x="960" y="540" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    };
    
    // 2. Platform'a göre otomatik thumbnail
    switch(platform) {
      case 'youtube': {
        const ytId = getYouTubeId(work.media_url);
        if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
        break;
      }
      case 'vimeo': {
        const vimeoId = getVimeoId(work.media_url);
        if (vimeoId) return `https://vumbnail.com/${vimeoId}.jpg`;
        break;
      }
      case 'instagram':
        // Backend'den gelmişse kullan, yoksa placeholder
        return createPlatformPlaceholder('instagram', 'Instagram', ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']);
      case 'tiktok':
        // Backend'den gelmişse kullan, yoksa placeholder
        return createPlatformPlaceholder('tiktok', 'TikTok', ['#000000', '#69C9D0', '#EE1D52']);
      default:
        return createPlatformPlaceholder('video', 'Video', ['#6B7280', '#4B5563']);
    }
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
  const platform = work.video_platform || (work.media_url?.includes('youtube.com') || work.media_url?.includes('youtu.be') ? 'youtube' : null);
  const youtubeId = (platform === 'youtube' && isVideo) ? getYouTubeId(work.media_url) : null;
  const vimeoId = (platform === 'vimeo' && isVideo) ? work.media_url?.match(/vimeo\.com\/(\d+)/)?.[1] : null;
  const isShort = work.media_url?.includes('shorts') || work.layoutConfig?.aspectRatio === 'portrait';
  
  // Thumbnail önceliği: work.thumbnail_url > platform thumbnail > media_url
  const getThumbnailUrl = () => {
    if (work.thumbnail_url) return getImageUrl(work.thumbnail_url);
    if (isVideo) {
      if (platform === 'youtube' && youtubeId) return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      if (platform === 'vimeo' && vimeoId) return `https://vumbnail.com/${vimeoId}.jpg`;
    }
    return getImageUrl(work.media_url);
  };
  
  const thumbnail = getThumbnailUrl();

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
  const platform = work.video_platform || (work.media_url?.includes('youtube.com') || work.media_url?.includes('youtu.be') ? 'youtube' : 'other');
  const youtubeId = (platform === 'youtube' && isVideo) ? getYouTubeId(work.media_url) : null;
  const vimeoId = (platform === 'vimeo' && isVideo) ? work.media_url?.match(/vimeo\.com\/(\d+)/)?.[1] : null;
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
          {isVideo ? (
            <>
              {platform === 'youtube' && youtubeId && (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                  title={work.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {platform === 'vimeo' && vimeoId && (
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
                  title={work.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
              {platform === 'instagram' && (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <p className="mb-4">Instagram videoları harici bağlantı olarak açılır</p>
                    <a 
                      href={work.media_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:scale-105 transition inline-block"
                    >
                      Instagram'da Aç
                    </a>
                  </div>
                </div>
              )}
              {platform === 'tiktok' && (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <p className="mb-4">TikTok videoları harici bağlantı olarak açılır</p>
                    <a 
                      href={work.media_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-black rounded-full hover:scale-105 transition inline-block"
                    >
                      TikTok'ta Aç
                    </a>
                  </div>
                </div>
              )}
              {(!youtubeId && !vimeoId && platform === 'other') && (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <p className="mb-4">Video harici bağlantı olarak açılır</p>
                    <a 
                      href={work.media_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-blue-600 rounded-full hover:scale-105 transition inline-block"
                    >
                      Videoyu Aç
                    </a>
                  </div>
                </div>
              )}
            </>
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
