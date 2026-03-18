import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaInstagram, FaLinkedin, FaYoutube, FaVimeoV, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isHome = location.pathname === '/';

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setScrolled(window.scrollY > 400);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setIsOpen(false);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1280;
  const logoStartY = isMobile ? 240 : 200;
  const logoMaxScale = isMobile ? 1.8 : 2.2;

  return (
    <nav className="bg-primary/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-5 relative flex items-center justify-between">
        
        {/* Left Side: Navigation Links */}
        <div className="hidden xl:flex items-center space-x-6">
          <Link to="/works" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Works</Link>
          <Link to="/services" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Services</Link>
          <Link to="/about" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">About</Link>
          <Link to="/team" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Team</Link>
          <Link to="/brands" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">BRANDS</Link>
          <Link to="/icom-network" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">ICOM Network</Link>
        </div>

        {/* Center: Logo */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 origin-top"
          style={{
            transform: isHome 
              ? `translateX(-50%) translateY(${Math.max(0, logoStartY - scrollY)}px) scale(${Math.max(1, logoMaxScale - (scrollY / logoStartY) * (logoMaxScale - 1))})`
              : 'translateX(-50%) translateY(0) scale(1)',
            opacity: 1,
            pointerEvents: isHome && scrollY < 50 ? 'none' : 'auto'
          }}
        >
          <Link to="/" className="flex items-center">
            <img
              key={isHome ? 'home-logo' : 'nav-logo'}
              src="/logo.svg"
              alt="Teskilat ICOM Logo"
              className={`w-40 lg:w-48 xl:w-56 h-auto ${isHome ? 'logo-reveal' : ''}`}
            />
          </Link>
        </div>

        {/* Right Side: Nav Links + Auth */}
        <div className="hidden xl:flex items-center gap-x-6">
          <div className="flex items-center">
            <Link to="/contact" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Contact</Link>
          </div>

          {/* Auth Buttons */}
          {!token ? (
            <div className="flex items-center space-x-4 pl-4 border-l border-white/10 hidden">
              <Link to="/login" className="text-gray-300 hover:text-white transition text-sm uppercase font-bold">Login</Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4 pl-4 border-l border-white/10">
              {user.role === 'admin' && (
                <Link to="/admin" className="text-accent-purple hover:text-white transition font-bold text-sm uppercase">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition text-sm uppercase font-bold">Logout</button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="xl:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="xl:hidden bg-primary border-t border-white/10 absolute w-full left-0 top-full shadow-xl">
          <div className="flex flex-col px-4 py-6 space-y-4">
            <Link to="/works" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Works</Link>
            <Link to="/services" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Services</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">About</Link>
            <Link to="/team" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Team</Link>
            <Link to="/brands" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">BRANDS</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Contact</Link>
            <Link to="/icom-network" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">ICOM Network</Link>

            {/* Admin Panel only - no Login/Logout for public users */}
            {token && user.role === 'admin' && (
              <div className="border-t border-white/10 pt-4 mt-2">
                <Link to="/admin" onClick={() => setIsOpen(false)} className="text-accent hover:text-white transition font-bold text-sm uppercase">Admin Panel</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
