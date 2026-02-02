import { useState } from 'react';
import { FaBullhorn, FaPalette, FaFilm, FaMobileAlt, FaChartLine, FaUsers, FaPlus, FaMinus, FaRobot } from 'react-icons/fa';

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
          case 'FaRobot': return <FaRobot className="text-accent text-2xl" />;
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

export default ServiceAccordion;
