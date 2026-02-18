/**
 * Shared utility for resolving image URLs.
 * Handles:
 * - Relative upload paths (/uploads/...)
 * - Old localhost URLs (http://localhost:5000/uploads/...)
 * - Google Drive URLs
 * - Regular external URLs
 */

// Backend base URL (without /api)
const BACKEND_BASE = import.meta.env.MODE === 'production'
    ? 'https://backend.teskilat.com.tr'
    : 'http://localhost:5000';

/**
 * Convert an image URL to a displayable URL.
 * @param {string} url - The raw image URL from the database
 * @param {object} options - Optional settings
 * @param {string} options.gDriveSize - Google Drive thumbnail size (default: 'w1920-h1080')
 * @returns {string} The resolved image URL
 */
export const getImageUrl = (url, options = {}) => {
    if (!url) return '';

    // Handle relative upload paths: /uploads/filename.ext
    if (url.startsWith('/uploads/')) {
        return `${BACKEND_BASE}${url}`;
    }

    // Handle old localhost URLs that may be stored in DB
    // Convert http://localhost:5000/uploads/... to proper backend URL
    const localhostMatch = url.match(/^https?:\/\/localhost(:\d+)?\/uploads\/(.+)$/);
    if (localhostMatch) {
        return `${BACKEND_BASE}/uploads/${localhostMatch[2]}`;
    }

    // Handle Google Drive URLs
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
        const fileId = idMatch ? idMatch[1] : null;
        if (fileId) {
            const size = options.gDriveSize || 'w1920-h1080';
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
        }
    }

    // Return as-is for external URLs
    return url;
};

export default getImageUrl;
