import { useState, useEffect } from 'react';
import ServiceAccordion from '../components/ServiceAccordion';
import FadeIn from '../components/FadeIn';
import api from '../api';
import { FaBullhorn, FaPalette } from 'react-icons/fa';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/content/services');
                setServices(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Failed to fetch services', err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

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
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Our Services</h1>
                    <div className="w-24 h-1 bg-accent mx-auto mb-8"></div>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        We offer a comprehensive range of creative and strategic services to help your brand thrive in the digital age.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.length > 0 ? (
                        services.map((service, index) => (
                            <FadeIn key={service.id} delay={index * 100} direction="up">
                                <ServiceAccordion service={service} />
                            </FadeIn>
                        ))
                    ) : (
                        // Fallback static content if needed
                        <>
                            <div className="glass-panel p-8 rounded-xl border border-white/5">
                                <p className="text-gray-400 text-center">No services found.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Services;
