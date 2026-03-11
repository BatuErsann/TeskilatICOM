import { useEffect } from 'react';

const BASE_URL = 'https://www.teskilat.com.tr';

/**
 * Custom hook to set per-page SEO metadata (title, description, canonical).
 * @param {Object} options
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description
 * @param {string} options.canonicalPath - Path for canonical URL (e.g. '/about')
 */
const useDocumentMeta = ({ title, description, canonicalPath }) => {
    useEffect(() => {
        // Set title
        if (title) {
            document.title = title;
        }

        // Set or create meta description
        if (description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', description);
        }

        // Set or create canonical link
        if (canonicalPath !== undefined) {
            const canonicalUrl = `${BASE_URL}${canonicalPath}`;
            let canonicalLink = document.querySelector('link[rel="canonical"]');
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.setAttribute('rel', 'canonical');
                document.head.appendChild(canonicalLink);
            }
            canonicalLink.setAttribute('href', canonicalUrl);
        }

        // Cleanup: restore defaults when component unmounts
        return () => {
            document.title = 'Teskilat ICOM | Creative Production & Advertising Agency';
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', 'Teskilat ICOM is a creative production and advertising agency in Istanbul, specializing in creative campaigns, photography, video production, digital marketing and brand storytelling. Member of ICOM global network.');
            }
            const canonicalLink = document.querySelector('link[rel="canonical"]');
            if (canonicalLink) {
                canonicalLink.setAttribute('href', `${BASE_URL}/`);
            }
        };
    }, [title, description, canonicalPath]);
};

export default useDocumentMeta;
