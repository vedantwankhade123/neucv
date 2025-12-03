import { useEffect } from 'react';
import { updateSEO, SEOConfig } from '@/utils/seo';

/**
 * React hook for managing SEO tags on a per-page basis
 * 
 * @example
 * useSEO({
 *   title: 'Dashboard - NeuCV',
 *   description: 'Manage your resumes',
 *   canonical: 'https://neucv.com/dashboard'
 * });
 */
export const useSEO = (config: SEOConfig) => {
    useEffect(() => {
        // Update SEO when component mounts or config changes
        updateSEO(config);

        // Cleanup function to reset to defaults when unmounting (optional)
        // Uncomment if you want to reset SEO on page navigation
        // return () => {
        //   resetSEO();
        // };
    }, [
        config.title,
        config.description,
        config.keywords,
        config.canonical,
        config.ogTitle,
        config.ogDescription,
        config.ogImage,
        config.ogUrl,
        config.twitterTitle,
        config.twitterDescription,
        config.twitterImage,
        // Note: structuredData is an object, so we stringify for comparison
        JSON.stringify(config.structuredData),
    ]);
};

export default useSEO;
