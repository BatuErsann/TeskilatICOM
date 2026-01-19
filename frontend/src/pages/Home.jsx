import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { FaTrophy, FaTimes, FaExternalLinkAlt, FaPlay, FaImage, FaArrowRight, FaBullhorn, FaPalette, FaFilm, FaMobileAlt, FaChartLine, FaUsers, FaInstagram, FaLinkedin, FaYoutube, FaFacebook, FaTwitter, FaLink, FaPlus, FaMinus } from 'react-icons/fa';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [featuredWorks, setFeaturedWorks] = useState([]);
  const [layout, setLayout] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);
  const [services, setServices] = useState([]);
  const [content, setContent] = useState({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const videoRes = await api.get('/content/videos');
        setVideos(videoRes.data);

        // Fetch active announcements
        const announcementRes = await api.get('/content/announcements/active');
        setAnnouncements(announcementRes.data);

        // Fetch services and content
        const [servicesRes, contentRes] = await Promise.all([
            api.get('/content/services'),
            api.get('/content/site-content')
        ]);
        setServices(servicesRes.data);
        setContent(contentRes.data);

        // Fetch ONLY featured works and featured layout
        const [featuredRes, layoutRes] = await Promise.all([
          api.get('/content/works/featured'),
          api.get('/content/works/layout/featured')
        ]);
        setFeaturedWorks(featuredRes.data);
        
        let layoutData = [];
        if (layoutRes.data && layoutRes.data.layout_data) {
          layoutData = typeof layoutRes.data.layout_data === 'string' 
            ? JSON.parse(layoutRes.data.layout_data) 
            : layoutRes.data.layout_data;
        }
        setLayout(layoutData);
      } catch (err) {
        console.error('Failed to fetch content', err);
      }
    };
    fetchContent();
  }, []);

  const openAnnouncementModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnnouncement(null);
    document.body.style.overflow = 'auto';
  };

  // Helper to get YouTube Embed URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
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

  const createPlatformPlaceholder = (platform, text, colors) => {
    const svg = `
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${platform}-grad-${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%">
            ${colors.map((color, i) => `<stop offset="${(i / (colors.length - 1)) * 100}%" style="stop-color:${color};stop-opacity:1" />`).join('')}
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#${platform}-grad-${Date.now()})"/>
        <text x="960" y="540" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Helper to convert Google Drive link to direct image link
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

  // Get display works from layout - only featured works
  const getDisplayWorks = () => {
    if (layout.length > 0) {
      // Filter layout to only include featured works
      return layout.map(item => {
        const work = featuredWorks.find(w => w.id === item.workId);
        if (!work) return null;
        return { ...work, layoutConfig: item };
      }).filter(Boolean);
    }
    return featuredWorks.map(w => ({ ...w, layoutConfig: null }));
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

  const getTruncatedContent = (text, limit = 400) => {
    if (!text) return '';
    if (text.length <= limit) return text;
    
    const sub = text.substring(0, limit);
    const lastPeriod = sub.lastIndexOf('.');
    
    if (lastPeriod !== -1) {
      return sub.substring(0, lastPeriod + 1);
    }
    return sub;
  };

  return (
    <div>
      {/* Hero Section - Works Gallery */}
      <div className="min-h-screen w-full relative bg-primary pt-8 pb-16">
        <div className="container mx-auto px-4">
          {/* Works Masonry Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {displayWorks.map((work) => (
              <HeroWorkCard
                key={work.id}
                work={work}
                getImageUrl={getImageUrl}
                getYouTubeId={getYouTubeId}
                onClick={() => setSelectedWork(work)}
              />
            ))}
          </div>

          {displayWorks.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No works added yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Our Services Section */}
      <div className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Our Services</h2>
            <div className="w-24 h-1 bg-accent mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.length > 0 ? (
                services.map(service => (
                    <ServiceAccordion key={service.id} service={service} />
                ))
            ) : (
                // Fallback to static if no services in DB (or while loading)
                <>
            <div className="glass-panel p-8 rounded-xl hover:border-accent transition group">
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition">
                <FaBullhorn className="text-accent text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Strategic Communications</h3>
              <p className="text-gray-400">Crafting compelling narratives that resonate with your audience and drive meaningful engagement.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-xl hover:border-accent transition group">
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition">
                <FaPalette className="text-accent text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Creative Design</h3>
              <p className="text-gray-400">Visual storytelling that captures attention and communicates your brand's unique identity.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-xl hover:border-accent transition group">
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition">
                <FaFilm className="text-accent text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Video Production</h3>
              <p className="text-gray-400">High-quality video content from concept to final cut, tailored to your brand message.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-xl hover:border-accent transition group">
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition">
                <FaMobileAlt className="text-accent text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Digital Marketing</h3>
              <p className="text-gray-400">Data-driven strategies that maximize your online presence and deliver measurable results.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-xl hover:border-accent transition group">
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition">
                <FaChartLine className="text-accent text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Brand Strategy</h3>
              <p className="text-gray-400">Building strong brand foundations that drive recognition and long-term growth.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-xl hover:border-accent transition group">
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition">
                <FaUsers className="text-accent text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Event Management</h3>
              <p className="text-gray-400">Creating memorable experiences that connect your brand with your audience.</p>
            </div>
                </>
            )}
          </div>
        </div>
      </div>

      {/* Latest Announcement Section */}
      {announcements.length > 0 && (
        <div className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <FaBullhorn className="text-accent text-2xl" />
                <h2 className="text-3xl font-display font-bold text-white">Latest</h2>
              </div>
              <Link 
                to="/works#announcements" 
                className="flex items-center gap-2 text-accent hover:text-accent/80 transition font-semibold"
              >
                View All <FaArrowRight />
              </Link>
            </div>
            
            <div className="bg-primary rounded-xl overflow-hidden shadow-2xl border border-accent/20">
              <div className="md:flex">
                {announcements[0].image_url && (
                  <div className="md:w-1/6">
                    <img
                      src={getImageUrl(announcements[0].image_url)}
                      alt={announcements[0].title}
                      className="w-full h-32 md:h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className={`p-8 ${announcements[0].image_url ? 'md:w-5/6' : 'w-full'} relative`}>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                    {announcements[0].link_url ? (
                      <a 
                        href={announcements[0].link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-accent transition"
                      >
                        {announcements[0].title}
                      </a>
                    ) : (
                      announcements[0].title
                    )}
                  </h3>
                  {announcements[0].short_description && (
                    <p className="text-gray-400 text-lg mb-4">
                      {announcements[0].short_description}
                    </p>
                  )}
                  {announcements[0].full_content && (
                    <p className="text-gray-300 mb-6">
                      {getTruncatedContent(announcements[0].full_content)}
                      {announcements[0].full_content.length > getTruncatedContent(announcements[0].full_content).length && (
                         <Link to="/works#announcements" className="text-accent ml-2 hover:underline font-bold">Read More</Link>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-24 bg-secondary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-purple"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">READY TO PUSH THE LIMITS?</h2>
          <Link to="/contact" className="inline-block border-2 border-accent text-accent hover:bg-accent hover:text-primary px-10 py-4 text-xl font-bold uppercase tracking-widest transition duration-300">
            GET IN TOUCH
          </Link>
        </div>
      </div>

      {/* Work Modal */}
      {selectedWork && (
        <HomeWorkModal 
          work={selectedWork} 
          onClose={() => setSelectedWork(null)} 
          getImageUrl={getImageUrl}
          getYouTubeId={getYouTubeId}
        />
      )}
    </div>
  );
};

// Hero Work Card Component
const HeroWorkCard = ({ work, getImageUrl, getYouTubeId, onClick }) => {
  const [loaded, setLoaded] = useState(false);
  const isVideo = work.media_type === 'video';
  const platform = work.video_platform || (work.media_url?.includes('youtube.com') || work.media_url?.includes('youtu.be') ? 'youtube' : null);
  const youtubeId = (platform === 'youtube' && isVideo) ? getYouTubeId(work.media_url) : null;
  const vimeoId = (platform === 'vimeo' && isVideo) ? work.media_url?.match(/vimeo\.com\/(\d+)/)?.[1] : null;
  const isShort = work.media_url?.includes('shorts') || work.layoutConfig?.aspectRatio === 'portrait';
  
  const createPlatformPlaceholder = (platform, text, colors) => {
    const svg = `
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${platform}-grad-card" x1="0%" y1="0%" x2="100%" y2="100%">
            ${colors.map((color, i) => `<stop offset="${(i / (colors.length - 1)) * 100}%" style="stop-color:${color};stop-opacity:1" />`).join('')}
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#${platform}-grad-card)"/>
        <text x="960" y="540" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };
  
  const getThumbnailUrl = () => {
    // 1. Öncelik: Manuel yüklenmiş thumbnail (backend'den gelen)
    if (work.thumbnail_url) return getImageUrl(work.thumbnail_url);
    
    if (isVideo) {
      // 2. Platform'a göre otomatik thumbnail
      if (platform === 'youtube' && youtubeId) {
        return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      }
      if (platform === 'vimeo' && vimeoId) {
        return `https://vumbnail.com/${vimeoId}.jpg`;
      }
      if (platform === 'instagram') {
        return createPlatformPlaceholder('instagram', 'Instagram', ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']);
      }
      if (platform === 'tiktok') {
        return createPlatformPlaceholder('tiktok', 'TikTok', ['#000000', '#69C9D0', '#EE1D52']);
      }
    }
    return getImageUrl(work.media_url);
  };
  
  const thumbnail = getThumbnailUrl();

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
        <img
          src={thumbnail}
          alt={work.title}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer"
        />
        
        {!loaded && (
          <div className="absolute inset-0 bg-gray-700 animate-pulse" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
        
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-xl">
              <FaPlay className="text-primary text-lg ml-1" />
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium ${
              isVideo ? 'bg-red-500/80 text-white' : 'bg-blue-500/80 text-white'
            }`}>
              {isVideo ? <FaPlay size={8} /> : <FaImage size={8} />}
              {work.category || (isVideo ? 'VIDEO' : 'IMAGE')}
            </span>
          </div>
          
          <h3 className="text-white font-bold text-base leading-tight drop-shadow-lg">
            {work.title}
          </h3>
        </div>

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

// Home Work Modal Component
const HomeWorkModal = ({ work, onClose, getImageUrl, getYouTubeId }) => {
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
          isShort ? 'max-w-sm' : 'max-w-4xl'
        } w-full mx-4 my-8`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white/70 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
        >
          <FaTimes size={20} />
        </button>

        <div className="max-h-[60vh] overflow-hidden">
          <div className={`bg-black ${isShort ? 'aspect-[9/16] max-h-[50vh]' : 'aspect-video'}`}>
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
        </div>

        <div className="p-5 bg-gray-900">
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

const ServiceAccordion = ({ service }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getIcon = (iconName) => {
      switch(iconName) {
          case 'FaBullhorn': return <FaBullhorn className="text-accent text-2xl" />;
          case 'FaPalette': return <FaPalette className="text-accent text-2xl" />;
          case 'FaFilm': return <FaFilm className="text-accent text-2xl" />;
          case 'FaMobileAlt': return <FaMobileAlt className="text-accent text-2xl" />;
          case 'FaChartLine': return <FaChartLine className="text-accent text-2xl" />;
          case 'FaUsers': return <FaUsers className="text-accent text-2xl" />;
          default: return <FaBullhorn className="text-accent text-2xl" />;
      }
  };

  return (
    <div 
        className={`glass-panel p-6 md:p-8 rounded-xl hover:border-accent transition group cursor-pointer relative ${isOpen ? 'border-accent' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
    >
      <div className="absolute top-6 right-6 text-accent text-xl">
          {isOpen ? <FaMinus /> : <FaPlus />} 
      </div>

      <div className="flex flex-col items-center text-center mt-2">
          <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition">
            {getIcon(service.icon)}
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
      </div>
      
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-400 whitespace-pre-wrap text-center text-sm md:text-base">
            {service.description}
        </p>
      </div>
    </div>
  );
};

export default Home;
