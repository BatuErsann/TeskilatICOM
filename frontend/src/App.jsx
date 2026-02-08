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
import ProtectedRoute from './components/ProtectedRoute';
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

            {/* Protected Admin Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roleRequired="admin">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>

        {/* Footer */}
        <footer className="bg-secondary border-t border-white/10">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              {/* Left: Teşkilat Logo & Copyright */}
              <div className="flex flex-col">
                <img src="/logo.svg" alt="Teşkilat ICOM" className="h-16 w-auto mb-4" />
                <p className="text-gray-400 text-sm pl-12">
                  &copy; 2026 Teskilat<br />All rights reserved.
                </p>
              </div>

              {/* Right: ICOM Logo & Contact */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                {/* Member of ICOM */}
                <div className="flex items-center">
                  <img src={icomMemberLogo} alt="Member of ICOM" className="h-16 w-auto opacity-80 hover:opacity-100 transition-opacity" />
                </div>

                {/* Contact */}
                <div className="text-center md:text-right">
                  <Link to="/contact" className="text-accent font-bold uppercase tracking-wider text-sm mb-4 hover:text-white transition-colors">Contact</Link>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Kozyatağı Mah. Kaya Sultan Sok.<br />
                    Nanda Plaza No: 83 Kat: 1<br />
                    34742 Kadıköy, Istanbul
                  </p>
                  <div className="text-gray-400 text-sm">
                    <span className="block mb-2">Phone: (0216) 356 59 99</span>
                    <span className="block">Email: info@teskilat.com.tr</span>
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
