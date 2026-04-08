import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Brands from './pages/Brands';
import Contact from './pages/Contact';
import Team from './pages/Team';
import Works from './pages/Works';
import Services from './pages/Services';
import News from './pages/News';
import IcomNetwork from './pages/IcomNetwork';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import { FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import icomMemberLogo from '../assets/TeskilatLogo/member-of-icom-network.svg';

const Layout = ({ children }) => {
  const location = useLocation();
  const isFullWidth = location.pathname === '/' || location.pathname === '/icom-network';

  return (
    <main className={`flex-grow ${isFullWidth ? '' : 'container mx-auto px-4 py-8'}`}>
      {children}
    </main>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/team" element={<Team />} />
            <Route path="/works" element={<Works />} />
            <Route path="/services" element={<Services />} />
            <Route path="/news" element={<News />} />
            <Route path="/icom-network" element={<IcomNetwork />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Admin Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roleRequired="admin">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/privacy" element={<Privacy />} />

            {/* Old Umbraco URL redirects → Homepage */}
            <Route path="/what-we-do" element={<Navigate to="/" replace />} />
            <Route path="/who-we-are" element={<Navigate to="/" replace />} />
            <Route path="/about-us" element={<Navigate to="/" replace />} />
            <Route path="/our-work" element={<Navigate to="/" replace />} />
            <Route path="/our-team" element={<Navigate to="/" replace />} />
            <Route path="/our-brands" element={<Navigate to="/" replace />} />
            <Route path="/contact-us" element={<Navigate to="/" replace />} />
            <Route path="/portfolio" element={<Navigate to="/" replace />} />
            <Route path="/icom" element={<Navigate to="/" replace />} />
            <Route path="/icom-network-member" element={<Navigate to="/" replace />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/default" element={<Navigate to="/" replace />} />
            <Route path="/homepage" element={<Navigate to="/" replace />} />
            <Route path="/hakkimizda" element={<Navigate to="/" replace />} />
            <Route path="/hizmetlerimiz" element={<Navigate to="/" replace />} />
            <Route path="/ekibimiz" element={<Navigate to="/" replace />} />
            <Route path="/markalarimiz" element={<Navigate to="/" replace />} />
            <Route path="/islerimiz" element={<Navigate to="/" replace />} />
            <Route path="/iletisim" element={<Navigate to="/" replace />} />
            <Route path="/haberler" element={<Navigate to="/" replace />} />
            <Route path="/careers" element={<Navigate to="/" replace />} />

            {/* 404 catch-all for unmatched routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>

        {/* Footer */}
        <footer className="bg-secondary border-t border-white/10">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center md:flex-row md:justify-between md:items-start gap-8">
              {/* Left: Teşkilat Logo & Copyright */}
              <div className="flex flex-col items-center md:items-start">
                <Link to="/">
                  <img src="/logo.svg" alt="Teşkilat ICOM" className="h-24 w-auto mb-4" />
                </Link>
                <div className="flex flex-col items-center md:items-start">
                  <p className="text-gray-400 text-sm text-center md:text-left mb-2">
                    &copy; 2026 Teskilat<br />All rights reserved.
                  </p>
                  <Link to="/privacy" className="text-accent hover:text-white transition-colors text-sm font-bold tracking-wider hover:underline">
                    Privacy Policy
                  </Link>
                </div>
              </div>

              {/* Right: ICOM Logo, Socials & Contact */}
              <div className="flex flex-col items-center md:flex-row md:items-start gap-8 md:gap-12">
                {/* Member of ICOM */}
                <div className="flex items-center">
                  <a href="https://icomagencies.com/" target="_blank" rel="noopener noreferrer">
                    <img src={icomMemberLogo} alt="Member of ICOM" className="h-24 w-auto opacity-80 hover:opacity-100 transition-opacity" />
                  </a>
                </div>

                {/* Socials & Contact */}
                <div className="text-center md:text-right flex flex-col items-center md:items-end">
                  <Link to="/contact" className="text-accent font-bold uppercase tracking-wider text-sm mb-4 hover:text-white transition-colors">Contact</Link>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Kozyatağı Mah. Kaya Sultan Sok.<br />
                    Nanda Plaza No: 83 Kat: 1<br />
                    34742 Kadıköy, Istanbul
                  </p>
                  <div className="text-gray-400 text-sm mb-4 border-b border-gray-700/50 pb-4">
                    <span className="block mb-2">Phone: (0216) 356 59 99</span>
                    <span className="block">Email: info@teskilat.com.tr</span>
                  </div>
                  
                  {/* Social Media Icons */}
                  <div className="flex items-center space-x-4 text-gray-400">
                    <a href="https://www.instagram.com/teskilaticom/" target="_blank" rel="noreferrer" className="hover:text-accent transition"><FaInstagram size={22} /></a>
                    <a href="https://www.linkedin.com/company/teskilaticom/posts/?feedView=all" target="_blank" rel="noreferrer" className="hover:text-accent transition"><FaLinkedin size={22} /></a>
                    <a href="https://www.youtube.com/@teskilaticom3784" target="_blank" rel="noreferrer" className="hover:text-accent transition"><FaYoutube size={22} /></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
