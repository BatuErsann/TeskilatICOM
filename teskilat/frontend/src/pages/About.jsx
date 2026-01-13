import { useState, useEffect } from 'react';
import { FaLinkedin, FaVideo, FaPaintBrush, FaBullhorn, FaLaptopCode, FaChartLine, FaCameraRetro, FaMobileAlt, FaUsers, FaPlus, FaMinus, FaFilm, FaPalette } from 'react-icons/fa';
import api from '../api';

const About = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, servicesRes] = await Promise.all([
            api.get('/content/team'),
            api.get('/content/services')
        ]);
        setTeamMembers(teamRes.data);
        setServices(servicesRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, []);

  // Get image URL (supports Google Drive)
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      const fileId = idMatch ? idMatch[1] : null;
      if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h1000`;
      }
    }
    return url;
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">ABOUT US</h1>
          <div className="w-32 h-1 bg-accent mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent to-accent-purple opacity-30 blur-lg rounded-lg"></div>
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
              alt="Office" 
              className="relative rounded-lg shadow-2xl border border-white/10 grayscale hover:grayscale-0 transition duration-500"
            />
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold mb-6 text-accent">WHO WE ARE?</h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              In 2007 we started as an independent full-service advertising agency in Istanbul. In 2015 we 
              joined ICOM, an exclusive global marketing network of over 70 like-minded independent 
              agencies with a shared commitment to growth and collaboration. In 2023 we started 
              MKNDRS, an agency specializing in AI-powered visual and video production. This is where AI 
              meets creativity; faster production, hyper-real visuals, limitless possibilities.
            </p>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              We believe in the power of connected ideas that go beyond the brief, connect with 
              consumers, and drive measurable brand success. We go the extra mile!
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-4xl font-display font-bold text-white mb-2">50+</h3>
                <p className="text-accent-purple uppercase tracking-wider text-sm">Global Brands</p>
              </div>
              <div>
                <h3 className="text-4xl font-display font-bold text-white mb-2">120+</h3>
                <p className="text-accent-purple uppercase tracking-wider text-sm">Completed Projects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Services Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4 text-white">OUR SERVICES</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We offer comprehensive creative solutions to elevate your brand
            </p>
            <div className="w-24 h-1 bg-accent mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceAccordion key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* Our Team Section */}
        {teamMembers.length > 0 && (
          <div className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold mb-4 text-white">OUR TEAM</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Meet the creative minds behind our success
              </p>
              <div className="w-24 h-1 bg-accent mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <div key={member.id} className="group relative overflow-hidden rounded-xl bg-secondary">
                  <div className="aspect-[3/4] w-full">
                    {member.image_url ? (
                      <img 
                        src={getImageUrl(member.image_url)} 
                        alt={`${member.name} ${member.surname}`} 
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-6xl text-gray-600">{member.name?.charAt(0)}{member.surname?.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-90 translate-y-full group-hover:translate-y-0 transition duration-300 flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-display font-bold text-white">{member.name} {member.surname}</h3>
                    <p className="text-accent font-medium">{member.title}</p>
                    {member.linkedin_url && (
                      <a 
                        href={member.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-white hover:text-accent transition"
                      >
                        <FaLinkedin size={20} />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    <div className="w-12 h-1 bg-accent mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default About;
