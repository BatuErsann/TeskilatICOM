import { useState, useEffect } from 'react';
import { FaLinkedin } from 'react-icons/fa';
import api from '../api';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get('/content/team');
        setTeamMembers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch team', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 text-white">OUR TEAM</h1>
          <p className="text-xl text-gray-400">The brain team building the future.</p>
        </div>

        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No team members yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="group relative overflow-hidden rounded-xl bg-gray-900">
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
        )}
      </div>
    </div>
  );
};

export default Team;
