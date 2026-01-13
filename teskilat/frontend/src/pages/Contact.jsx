import { useState } from 'react';
import { FaEnvelope, FaUsers } from 'react-icons/fa';
import api from '../api';

const Contact = () => {
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' or 'join'
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Join Form State
  const [joinForm, setJoinForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    portfolio: '',
    about: ''
  });

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleJoinChange = (e) => {
    setJoinForm({ ...joinForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/contact', {
        ...contactForm,
        type: 'contact'
      });
      setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to send message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = {
        name: `${joinForm.firstName} ${joinForm.lastName}`,
        email: joinForm.email,
        subject: `Job Application: ${joinForm.position}`,
        message: `Phone: ${joinForm.phone}\nPortfolio: ${joinForm.portfolio}\n\nAbout:\n${joinForm.about}`,
        type: 'join'
      };

      await api.post('/contact', payload);
      setStatus({ type: 'success', message: 'Application sent successfully! Good luck.' });
      setJoinForm({ firstName: '', lastName: '', email: '', phone: '', position: '', portfolio: '', about: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to send application. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-white">CONTACT</h1>
            <p className="text-xl text-gray-400 mb-10">
              Get in touch with us for your projects. Let's design the future together.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-secondary flex items-center justify-center rounded text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Address</h3>
                  <p className="text-gray-400">Kozyatağı Mah. Kaya Sultan Sok.<br/>Nanda Plaza No: 83 Kat: 1<br/>34742 Kadıköy, Istanbul</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-secondary flex items-center justify-center rounded text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Email</h3>
                  <p className="text-gray-400">info@teskilat.com.tr</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-secondary flex items-center justify-center rounded text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Phone</h3>
                  <p className="text-gray-400">(0216) 356 59 99</p>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="mt-8 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.0788646774!2d29.0982467!3d40.9682094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac78b2f1d639b%3A0x68a6e4bb0a44bc04!2sTe%C5%9Fkilat%20ICOM%20Reklam%20Ajans%C4%B1!5e0!3m2!1sen!2str!4v1705240000000!5m2!1sen!2str"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition duration-500"
              ></iframe>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => { setActiveTab('contact'); setStatus({ type: '', message: '' }); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-bold uppercase tracking-wider transition ${
                  activeTab === 'contact' 
                    ? 'bg-accent text-primary' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FaEnvelope />
                Contact Us
              </button>
              <button
                onClick={() => { setActiveTab('join'); setStatus({ type: '', message: '' }); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-bold uppercase tracking-wider transition ${
                  activeTab === 'join' 
                    ? 'bg-accent text-primary' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FaUsers />
                Join The Team
              </button>
            </div>

            {/* Status Message */}
            {status.message && (
              <div className={`p-4 mx-8 mt-8 rounded ${status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {status.message}
              </div>
            )}

            {/* Contact Form */}
            {activeTab === 'contact' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Send us a message</h2>
                <p className="text-gray-400 mb-6">We'll get back to you as soon as possible.</p>
                
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      required
                      className="w-full bg-secondary/50 border border-white/10 rounded p-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      required
                      className="w-full bg-secondary/50 border border-white/10 rounded p-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition" 
                      placeholder="example@company.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Subject</label>
                    <input 
                      type="text" 
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleContactChange}
                      required
                      className="w-full bg-secondary/50 border border-white/10 rounded p-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition" 
                      placeholder="Project inquiry" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Your Message</label>
                    <textarea 
                      rows="4" 
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      required
                      className="w-full bg-secondary/50 border border-white/10 rounded p-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition" 
                      placeholder="Tell us about your project..."
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-accent to-accent-purple text-primary font-bold py-4 rounded uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            )}

            {/* Join The Team Form */}
            {activeTab === 'join' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Join our creative team</h2>
                <p className="text-gray-400 mb-6">We're always looking for talented individuals.</p>
                
                <form onSubmit={handleJoinSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">First Name</label>
                      <input 
                        type="text" 
                        name="firstName"
                        value={joinForm.firstName}
                        onChange={handleJoinChange}
                        required
                        className="w-full bg-secondary/50 border border-white/10 rounded p-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition" 
                        placeholder="John" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={joinForm.lastName}
                        onChange={handleJoinChange}
                        required
                        className="w-full bg-secondary/50 border border-white/10 rounded p-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition" 
                        placeholder="Doe" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={joinForm.email}
                      onChange={handleJoinChange}
                      required
                      className="w-full bg-secondary/50 border border-white/10 rounded p-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition" 
                      placeholder="example@email.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Phone</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={joinForm.phone}
                      onChange={handleJoinChange}
                      required
                      className="w-full bg-secondary/50 border border-white/10 rounded p-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition" 
                      placeholder="+90 5XX XXX XX XX" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Position Interested In</label>
                    <select 
                      name="position"
                      value={joinForm.position}
                      onChange={handleJoinChange}
                      required
                      className="w-full bg-secondary/50 border border-white/10 rounded p-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition"
                    >
                      <option value="" className="bg-primary">Select a position...</option>
                      <option value="Graphic Designer" className="bg-primary">Graphic Designer</option>
                      <option value="Video Editor" className="bg-primary">Video Editor</option>
                      <option value="Web Developer" className="bg-primary">Web Developer</option>
                      <option value="Digital Marketing Specialist" className="bg-primary">Digital Marketing Specialist</option>
                      <option value="Social Media Manager" className="bg-primary">Social Media Manager</option>
                      <option value="Other" className="bg-primary">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Portfolio / LinkedIn URL</label>
                    <input 
                      type="url" 
                      name="portfolio"
                      value={joinForm.portfolio}
                      onChange={handleJoinChange}
                      className="w-full bg-secondary/50 border border-white/10 rounded p-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition" 
                      placeholder="https://..." 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wider">Tell us about yourself</label>
                    <textarea 
                      rows="4" 
                      name="about"
                      value={joinForm.about}
                      onChange={handleJoinChange}
                      required
                      className="w-full bg-secondary/50 border border-white/10 rounded p-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition" 
                      placeholder="Your experience, skills, and why you want to join..."
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-accent to-accent-purple text-primary font-bold py-4 rounded uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Submit Application'}
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
