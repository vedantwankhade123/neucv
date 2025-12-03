/**
 * SEO Utility Functions
 * Provides utilities for managing dynamic meta tags, structured data, and SEO elements
 */

export interface SEOConfig {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    structuredData?: object;
}

/**
 * Updates the page title
 */
export const updateTitle = (title: string) => {
    document.title = title;

    // Update Open Graph title
    updateMetaTag('property', 'og:title', title);

    // Update Twitter title
    updateMetaTag('name', 'twitter:title', title);
};

/**
 * Updates a meta tag by name or property
 */
export const updateMetaTag = (
    attribute: 'name' | 'property',
    value: string,
    content: string
) => {
    let element = document.querySelector(`meta[${attribute}="${value}"]`);

    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
    }

    element.setAttribute('content', content);
};

/**
 * Updates the canonical URL
 */
export const updateCanonical = (url: string) => {
    let link = document.querySelector('link[rel="canonical"]');

    if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
    }

    link.setAttribute('href', url);
};

/**
 * Injects or updates structured data (JSON-LD)
 */
export const updateStructuredData = (data: object, id = 'structured-data') => {
    // Remove existing structured data with this ID
    const existing = document.getElementById(id);
    if (existing) {
        existing.remove();
    }

    // Create new script element
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
};

/**
 * Main function to update all SEO elements
 */
export const updateSEO = (config: SEOConfig) => {
    const baseUrl = 'https://neucv.netlify.app';

    // Update title
    if (config.title) {
        updateTitle(config.title);
    }

    // Update meta description
    if (config.description) {
        updateMetaTag('name', 'description', config.description);
        updateMetaTag('property', 'og:description', config.description);
        updateMetaTag('name', 'twitter:description', config.description);
    }

    // Update keywords
    if (config.keywords) {
        updateMetaTag('name', 'keywords', config.keywords);
    }

    // Update canonical URL
    if (config.canonical) {
        updateCanonical(config.canonical);
    }

    // Update Open Graph tags
    if (config.ogTitle) {
        updateMetaTag('property', 'og:title', config.ogTitle);
    }
    if (config.ogDescription) {
        updateMetaTag('property', 'og:description', config.ogDescription);
    }
    if (config.ogImage) {
        const imageUrl = config.ogImage.startsWith('http')
            ? config.ogImage
            : `${baseUrl}${config.ogImage}`;
        updateMetaTag('property', 'og:image', imageUrl);
    }
    if (config.ogUrl) {
        updateMetaTag('property', 'og:url', config.ogUrl);
    }

    // Update Twitter Card tags
    if (config.twitterTitle) {
        updateMetaTag('name', 'twitter:title', config.twitterTitle);
    }
    if (config.twitterDescription) {
        updateMetaTag('name', 'twitter:description', config.twitterDescription);
    }
    if (config.twitterImage) {
        const imageUrl = config.twitterImage.startsWith('http')
            ? config.twitterImage
            : `${baseUrl}${config.twitterImage}`;
        updateMetaTag('name', 'twitter:image', imageUrl);
    }

    // Update structured data
    if (config.structuredData) {
        updateStructuredData(config.structuredData);
    }
};

/**
 * Resets SEO to default values (useful for SPA navigation)
 */
export const resetSEO = () => {
    updateSEO({
        title: 'NeuCV - Free AI Resume Builder & Interview Coach | Create Professional Resumes',
        description: 'Build professional resumes with AI-powered templates and ace your interviews with our AI Interview Coach. Free resume builder with 10+ templates, real-time preview, and PDF export.',
        keywords: 'resume builder, AI resume, CV maker, interview coach, free resume templates',
        canonical: 'https://neucv.netlify.app/',
    });
};
