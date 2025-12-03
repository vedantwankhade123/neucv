/**
 * Structured Data (JSON-LD) Schemas for SEO
 * These improve rich snippets in search results
        "email": "vedantwankhade47@gmail.com",
        "url": "https://vedantwankhade.netlify.app"
    },
    "contactPoint": {
        "@type": "ContactPoint",
        "email": "vedantwankhade47@gmail.com",
        "contactType": "Customer Support"
    },
    "sameAs": [
        "https://www.linkedin.com/in/vedant-wankhade123/",
        "https://vedantwankhade.netlify.app"
    ]
};

/**
 * WebApplication schema for the main landing page
 */
export const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "NeuCV",
    "url": "https://neucv.com",
    "description": "Free AI-powered resume builder and interview coach platform with professional templates",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "screenshot": "https://neucv.com/neucv-logo.png",
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "127"
    },
    "creator": {
        "@type": "Person",
        "name": "Vedant Wankhade",
        "email": "vedantwankhade47@gmail.com",
        "url": "https://vedantwankhade.netlify.app"
    },
    "featureList": [
        "AI Resume Builder",
        "10+ Professional Templates",
        "Real-time Preview",
        "PDF Export",
        "AI Interview Coach",
        "Voice Interaction",
        "Multi-language Support",
        "ATS-Friendly Templates",
        "Drag and Drop Layout",
        "Custom Sections"
    ]
};

/**
 * SoftwareApplication schema for app listing
 */
export const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NeuCV Resume Builder",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "bestRating": "5",
        "ratingCount": "127"
    }
};

/**
 * HowTo schema for resume building guide
 */
export const howToResumeSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Create a Professional Resume with NeuCV",
    "description": "Step-by-step guide to building a professional resume using NeuCV's AI-powered resume builder",
    "image": "https://neucv.com/neucv-logo.png",
    "totalTime": "PT10M",
    "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": "0"
    },
    "step": [
        {
            "@type": "HowToStep",
            "name": "Choose a Template",
            "text": "Browse through 10+ professional resume templates and select one that matches your style and industry.",
            "position": 1
        },
        {
            "@type": "HowToStep",
            "name": "Fill in Your Information",
            "text": "Add your personal details, work experience, education, skills, and other relevant sections.",
            "position": 2
        },
        {
            "@type": "HowToStep",
            "name": "Customize the Design",
            "text": "Adjust colors, fonts, spacing, and layouts using the intuitive design editor.",
            "position": 3
        },
        {
            "@type": "HowToStep",
            "name": "Preview and Edit",
            "text": "Review your resume in real-time preview and make any necessary adjustments.",
            "position": 4
        },
        {
            "@type": "HowToStep",
            "name": "Download",
            "text": "Export your finished resume as a PDF, PNG, or JPG for job applications.",
            "position": 5
        }
    ]
};

/**
 * FAQPage schema for common questions
 */
export const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Is NeuCV resume builder free to use?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, NeuCV is completely free to use. You can create unlimited resumes, access all templates, and use the AI Interview Coach feature at no cost."
            }
        },
        {
            "@type": "Question",
            "name": "How many resume templates are available?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "NeuCV offers 10+ professionally designed resume templates including modern, corporate, creative, and ATS-friendly designs."
            }
        },
        {
            "@type": "Question",
            "name": "What is the AI Interview Coach feature?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI Interview Coach is an AI-powered tool that helps you practice interviews with voice interaction, personalized questions based on your resume, and real-time feedback on your answers."
            }
        },
        {
            "@type": "Question",
            "name": "Can I export my resume as PDF?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can download your resume in multiple formats including PDF, PNG, JPG, and HTML."
            }
        },
        {
            "@type": "Question",
            "name": "Are the resume templates ATS-friendly?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, all NeuCV templates are designed to be ATS (Applicant Tracking System) friendly, ensuring your resume can be properly parsed by recruitment software."
            }
        }
    ]
};

/**
 * Interview Coach specific schema
 */
export const interviewCoachSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NeuCV AI Interview Coach",
    "applicationCategory": "EducationalApplication",
    "description": "AI-powered interview practice tool with voice interaction and personalized feedback",
    "operatingSystem": "Web Browser",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "featureList": [
        "AI-Generated Questions",
        "Voice Interaction",
        "Real-time Feedback",
        "Multi-language Support",
        "Performance Analysis",
        "Resume-based Personalization"
    ]
};
