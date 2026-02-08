import { useState, useEffect } from 'react';
import api from '../api';

const Brands = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get('/brands');
        setBrands(res.data);
      } catch (err) {
        console.error('Failed to fetch brands', err);
      }
    };
    fetchBrands();
  }, []);

  // Helper for image url - handles both local uploads and external URLs
  const getImageUrl = (url) => {
    if (!url) return '';
    // If it's a local upload path, prepend the API base URL
    if (url.startsWith('/uploads/')) {
      return `http://localhost:5000${url}`;
    }
    // Handle Google Drive URLs
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      const fileId = idMatch ? idMatch[1] : null;
      if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`;
      }
    }
    return url;
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 text-white">Brands</h1>
          <p className="text-xl text-gray-400">Global brands that trust us.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="glass-panel h-32 flex items-center justify-center rounded-lg hover:bg-white/5 transition duration-300 group cursor-pointer border border-white/5 hover:border-accent/50 p-6"
            >
              {brand.logo_url ? (
                <img
                  src={getImageUrl(brand.logo_url)}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xl font-display font-bold text-gray-500 group-hover:text-white transition tracking-widest">{brand.name}</span>
              )}
            </div>
          ))}
          {brands.length === 0 && (
            <div className="col-span-full text-center text-gray-500">No brands added yet.</div>
          )}
        </div>

        <div className="mt-24 bg-secondary/50 p-12 rounded-2xl border border-white/5 text-center">
          <h2 className="text-3xl font-display font-bold mb-6">TAKE YOUR PLACE</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Work with us to take your brand to the next level.
            Experience our global standard service and futuristic vision.
          </p>
          <button className="bg-transparent border border-accent text-accent hover:bg-accent hover:text-primary px-8 py-3 font-bold uppercase tracking-wider transition duration-300">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default Brands;
