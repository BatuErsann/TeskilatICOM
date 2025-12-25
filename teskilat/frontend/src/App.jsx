import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import IcomNetwork from './pages/IcomNetwork';
import ProtectedRoute from './components/ProtectedRoute';

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Logo & Copyright */}
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">
                  TESKILAT<span className="text-accent">.</span>
                </h3>
                <p className="text-gray-400 text-sm">
                  &copy; 2025 Teskilat Platform.<br/>All rights reserved.
                </p>
              </div>
              
              {/* Address */}
              <div>
                <h4 className="text-accent font-bold uppercase tracking-wider text-sm mb-4">Address</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Kozyatağı Mah. Kaya Sultan Sok.<br/>
                  Nanda Plaza No: 83 Kat: 1<br/>
                  34742 Kadıköy, Istanbul
                </p>
              </div>
              
              {/* Contact */}
              <div>
                <h4 className="text-accent font-bold uppercase tracking-wider text-sm mb-4">Contact</h4>
                <p className="text-gray-400 text-sm">
                  <span className="block mb-2">Phone: (0216) 356 59 99</span>
                  <span className="block">Email: info@teskilat.com.tr</span>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
