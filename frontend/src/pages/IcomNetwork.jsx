import { FaHandshake, FaLightbulb, FaGlobe, FaChartLine } from 'react-icons/fa';
import icomLogo from '../../assets/images/icom-network.svg';
import icomWorld from '../../assets/images/icom-world.svg';
import madridWorkers from '../../assets/images/madridworkers.jpg';

const IcomNetwork = () => {
  const benefits = [
    {
      icon: FaHandshake,
      title: 'We work with trusted agency partners',
      description: 'to deliver consistent and global execution.'
    },
    {
      icon: FaLightbulb,
      title: 'We share knowledge, resources, and experience',
      description: 'to empower us and our clients, grow.'
    },
    {
      icon: FaGlobe,
      title: 'We elevate our work',
      description: 'through, mentorship, training, and global collaboration.'
    },
    {
      icon: FaChartLine,
      title: 'We scale our services',
      description: 'and unlock international opportunities without increasing overhead.'
    }
  ];

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section - Dark Background */}
      <div className="bg-secondary py-16 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* ICOM Logo */}
              <div className="mb-6">
                <img src={icomLogo} alt="ICOM Network" className="h-16 brightness-0 invert" />
              </div>

              <p className="text-gray-300 text-lg mb-8 max-w-md">
                ICOM is an exclusive global marketing network of over 70 like-minded 
                independent agencies with a shared commitment to growth and collaboration.
              </p>

              <a 
                href="https://icomagencies.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-accent hover:bg-accent/80 text-primary px-8 py-3 rounded-full font-medium transition"
              >
                Connect to Grow
              </a>
            </div>

            {/* Right Content - World Map */}
            <div className="relative">
              <img src={icomWorld} alt="ICOM Global Network" className="w-full h-auto brightness-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Being a Member Section - Dark Background */}
      <div className="bg-primary py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Being a member</h2>
              
              <p className="text-gray-300 text-lg mb-6">
                As members of ICOM, we are part of a trusted, non-competing 
                community that shares knowledge, resources, and opportunities.
              </p>
              
              <p className="text-gray-300 text-lg mb-6">
                This means our clients benefit from local expertise powered by 
                global insight, rapid access to market intelligence, and access 
                to experts through real-world collaboration, all delivered with 
                the personal attention of an independent agency.
              </p>
              
              <p className="text-gray-300 text-lg">
                ICOM keeps us agile, informed, and connected so we can 
                deliver smarter, faster, and more impactful work, wherever it's 
                needed.
              </p>
            </div>

            {/* Right Content - Madrid Workers Image */}
            <div className="relative flex items-center justify-center">
              <img 
                src={madridWorkers}
                alt="Madrid Workers - ICOM Network Event"
                className="max-w-sm lg:max-w-md rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-secondary py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-3 h-3 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-gray-300">
                    <span className="font-semibold text-white">{benefit.title}</span>{' '}
                    <span>{benefit.description}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IcomNetwork;
