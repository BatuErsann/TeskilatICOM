import { Link } from 'react-router-dom';
import useDocumentMeta from '../hooks/useDocumentMeta';

const NotFound = () => {
    useDocumentMeta({
        title: 'Page Not Found | Teskilat ICOM',
        description: 'The page you are looking for does not exist or has been moved.',
        canonicalPath: '/404'
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-8xl font-bold text-accent mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                Page Not Found
            </h2>
            <p className="text-gray-400 max-w-md mb-8">
                The page you are looking for doesn't exist or has been moved.
                Please check the URL or navigate to one of our pages below.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
                <Link
                    to="/"
                    className="px-6 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                >
                    Go Home
                </Link>
                <Link
                    to="/contact"
                    className="px-6 py-3 border border-accent text-accent font-semibold rounded-lg hover:bg-accent/10 transition-colors"
                >
                    Contact Us
                </Link>
            </div>
            <nav className="mt-12 flex flex-wrap gap-6 justify-center text-sm text-gray-400">
                <Link to="/about" className="hover:text-white transition-colors">About</Link>
                <Link to="/services" className="hover:text-white transition-colors">Services</Link>
                <Link to="/works" className="hover:text-white transition-colors">Works</Link>
                <Link to="/brands" className="hover:text-white transition-colors">Brands</Link>
                <Link to="/team" className="hover:text-white transition-colors">Team</Link>
                <Link to="/news" className="hover:text-white transition-colors">News</Link>
                <Link to="/icom-network" className="hover:text-white transition-colors">ICOM Network</Link>
            </nav>
        </div>
    );
};

export default NotFound;
