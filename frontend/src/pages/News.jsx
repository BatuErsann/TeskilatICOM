import { useState, useEffect } from 'react';
import api from '../api';
import FadeIn from '../components/FadeIn';

const News = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await api.get('/content/announcements/active');
                setAnnouncements(res.data);
            } catch (err) {
                console.error('Failed to fetch announcements', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.includes('drive.google.com')) {
            const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
            const fileId = idMatch ? idMatch[1] : null;
            if (fileId) {
                return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920-h1080`;
            }
        }
        return url;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-primary">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">News</h1>
                    <div className="w-24 h-1 bg-accent mx-auto mb-8"></div>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Latest updates, announcements, and insights from our team.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
                    {announcements.length > 0 ? (
                        announcements.map((announcement, index) => (
                            <FadeIn key={announcement.id} delay={index * 100} direction="up">
                                <div className="bg-secondary rounded-xl overflow-hidden shadow-2xl border border-accent/20">
                                    <div className="md:flex">
                                        {announcement.image_url && (
                                            <div className="md:w-1/3 relative group cursor-pointer overflow-hidden">
                                                <img
                                                    src={getImageUrl(announcement.image_url)}
                                                    alt={announcement.title}
                                                    className="w-full h-64 md:h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    referrerPolicy="no-referrer"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                        )}
                                        <div className={`p-8 ${announcement.image_url ? 'md:w-2/3' : 'w-full'} relative`}>
                                            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                                                {announcement.link_url ? (
                                                    <a
                                                        href={announcement.link_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-accent transition"
                                                    >
                                                        {announcement.title}
                                                    </a>
                                                ) : (
                                                    announcement.title
                                                )}
                                            </h3>
                                            
                                            <div className="w-12 h-1 bg-accent/30 mb-6"></div>

                                            {announcement.short_description && (
                                                <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                                                    {announcement.short_description}
                                                </p>
                                            )}
                                            {announcement.full_content && (
                                                <p className="text-gray-400 mb-6 leading-relaxed">
                                                    {announcement.full_content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-secondary rounded-xl border border-white/5">
                            <p className="text-gray-500 text-lg">No news to display.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default News;
