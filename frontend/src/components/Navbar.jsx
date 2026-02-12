import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaInstagram, FaLinkedin, FaYoutube, FaVimeoV, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Safari tarayıcısını algıla
  const isSafari = useMemo(() => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="bg-primary/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">

        {/* Left Side: Logo + Navigation Links */}
        <div className="flex items-center gap-x-8">
          <Link to="/" className="flex items-center">
            <video
              autoPlay
              muted
              playsInline
              preload="auto"
              className="w-36 md:w-60 h-auto safari-video-fix"
              style={{ background: 'transparent', mixBlendMode: 'screen' }}
            >
              <source src="/logo-video.webm" type="video/webm" />
              <source src="/logo-video.mov" type="video/quicktime" />
            </video>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/works" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Works</Link>
            <Link to="/services" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Services</Link>
            <Link to="/about" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">About</Link>
            <Link to="/team" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Team</Link>
            <Link to="/brands" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">BRANDS</Link>
            <Link to="/news" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">News</Link>
            <Link to="/contact" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Contact</Link>
            <Link to="/icom-network" className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">ICOM Network</Link>
          </div>
        </div>

        {/* Right Side: Social Icons + Auth */}
        <div className="hidden md:flex items-center gap-x-6">
          {/* Social Media Icons */}
          <div className="flex items-center space-x-4 text-gray-400">
            <a href="https://www.instagram.com/teskilaticom/" target="_blank" rel="noreferrer" className="hover:text-accent transition"><FaInstagram size={20} /></a>
            <a href="https://www.linkedin.com/company/teskilaticom/posts/?feedView=all" target="_blank" rel="noreferrer" className="hover:text-accent transition"><FaLinkedin size={20} /></a>
            <a href="https://www.youtube.com/@teskilaticom3784" target="_blank" rel="noreferrer" className="hover:text-accent transition"><FaYoutube size={20} /></a>
            <a href="https://vimeo.com/teskilaticom" target="_blank" rel="noreferrer" className="hover:text-accent transition"><FaVimeoV size={20} /></a>
          </div>

          {/* Auth Buttons */}
          {!token ? (
            <div className="flex items-center space-x-4 pl-6 border-l border-white/10 hidden">
              <Link to="/login" className="text-gray-300 hover:text-white transition text-sm uppercase font-bold">Login</Link>
              <Link to="/register" className="bg-accent hover:bg-accent-purple text-primary px-5 py-2 rounded-none skew-x-[-10deg] transition duration-300 font-bold text-sm uppercase">
                <span className="skew-x-[10deg] inline-block">Sign Up</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4 pl-6 border-l border-white/10">
              {user.role === 'admin' && (
                <Link to="/admin" className="text-accent-purple hover:text-white transition font-bold text-sm uppercase">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition text-sm uppercase font-bold">Logout</button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-primary border-t border-white/10 absolute w-full left-0 top-full shadow-xl">
          <div className="flex flex-col px-4 py-6 space-y-4">
            <Link to="/works" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Works</Link>
            <Link to="/services" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Services</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">About</Link>
            <Link to="/team" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Team</Link>
            <Link to="/brands" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">BRANDS</Link>
            <Link to="/news" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">News</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">Contact</Link>
            <Link to="/icom-network" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-accent transition font-medium tracking-wide uppercase text-sm">ICOM Network</Link>

            {/* Social Media Icons - Mobile */}
            <div className="border-t border-white/10 pt-4 mt-2 flex items-center space-x-5 text-gray-400">
              <a href="https://www.instagram.com/teskilaticom/" target="_blank" rel="noreferrer" className="hover:text-accent transition"><FaInstagram size={20} /></a>
              <a href="https://www.linkedin.com/company/teskilaticom/posts/?feedView=all" target="_blank" rel="noreferrer" className="hover:text-accent transition"><FaLinkedin size={20} /></a>
              <a href="https://www.youtube.com/@teskilaticom3784" target="_blank" rel="noreferrer" className="hover:text-accent transition"><FaYoutube size={20} /></a>
              <a href="https://vimeo.com/teskilaticom" target="_blank" rel="noreferrer" className="hover:text-accent transition"><FaVimeoV size={20} /></a>
            </div>

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
