import React, { useState, useEffect } from 'react';

/**
 * OptimizedImage Component
 * Features:
 * - Skeleton Loader while loading
 * - Lazy loading (native)
 * - Fallback for broken images
 * - Smooth transition when loaded
 * - Local caching support (via browser)
 */
const OptimizedImage = ({ 
    src, 
    alt, 
    className = "", 
    fallbackIcon: FallbackIcon = null,
    placeholderColor = "bg-slate-100",
    objectFit = "object-cover"
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(null);

    useEffect(() => {
        if (!src) {
            setError(true);
            setIsLoading(false);
            return;
        }

        // Reset state when src changes
        setIsLoading(true);
        setError(false);

        // Normalize backslashes to forward slashes
        const normalizedSrc = typeof src === 'string' ? src.replace(/\\/g, '/') : src;

        // Prepend base URL if it's a relative path starting with uploads/
        let finalSrc = normalizedSrc;
        if (typeof normalizedSrc === 'string' && normalizedSrc.startsWith('uploads/')) {
            finalSrc = `/${normalizedSrc}`;
        } else if (typeof normalizedSrc === 'string' && normalizedSrc.startsWith('Backend/uploads/')) {
             finalSrc = `/${normalizedSrc.replace('Backend/', '')}`;
        }

        setCurrentSrc(finalSrc);
    }, [src]);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setError(true);
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Skeleton / Placeholder */}
            {isLoading && (
                <div className={`absolute inset-0 ${placeholderColor} animate-pulse z-10`} />
            )}

            {/* Error Fallback */}
            {error ? (
                <div className={`absolute inset-0 ${placeholderColor} flex items-center justify-center text-slate-300`}>
                    {FallbackIcon ? <FallbackIcon size={24} /> : <span className="text-[10px] font-bold">No Image</span>}
                </div>
            ) : (
                <img
                    src={currentSrc}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                    className={`w-full h-full ${objectFit} transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                />
            )}
        </div>
    );
};

export default OptimizedImage;
