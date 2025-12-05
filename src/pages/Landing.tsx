import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThreeDMarqueeDemo from '@/components/3d-marquee-demo';
import { LayoutTemplate, Palette, FileText, Download, Github, Mail, Linkedin, Globe, Users, Star, MessageCircle, Mic, BrainCircuit, BarChart3, Sparkles, ArrowRight, Bot, Volume2, Maximize2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from 'framer-motion';

import { initialResumeStyle } from '@/data/initialData';
import { previewDataMap } from '@/data/previewData';
import CorporateTemplate from '@/components/templates/CorporateTemplate';
import ExecutiveTemplate from '@/components/templates/ExecutiveTemplate';
import MinimalistTemplate from '@/components/templates/MinimalistTemplate';
import CleanTemplate from '@/components/templates/CleanTemplate';
import { auth } from '@/lib/firebase';
import { getGlobalStats } from '@/lib/stats-service';

const Landing = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeLink, setActiveLink] = useState('home');
    const featuresRef = useRef<HTMLElement>(null);
    const interviewRef = useRef<HTMLElement>(null);
    const templatesRef = useRef<HTMLElement>(null);
    const connectRef = useRef<HTMLElement>(null);

    const [stats, setStats] = useState({ totalUsers: 0, totalResumes: 0, totalDownloads: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getGlobalStats();
            setStats(data);
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (!containerRef.current) return;

        const scrollPosition = containerRef.current.scrollTop + 100;

        const featuresTop = featuresRef.current?.offsetTop ?? Infinity;
        const interviewTop = interviewRef.current?.offsetTop ?? Infinity;
        const templatesTop = templatesRef.current?.offsetTop ?? Infinity;
        const connectTop = connectRef.current?.offsetTop ?? Infinity;

        if (scrollPosition >= connectTop) {
            setActiveLink('connect');
        } else if (scrollPosition >= templatesTop) {
            setActiveLink('templates');
        } else if (scrollPosition >= interviewTop) {
            setActiveLink('interview');
        } else if (scrollPosition >= featuresTop) {
            setActiveLink('features');
        } else {
            setActiveLink('home');
        }
    };

    const styleVariables = {
        '--font-family': initialResumeStyle.fontFamily,
        '--font-size-base': '14px',
        '--accent-color': initialResumeStyle.accentColor,
        '--section-spacing': '24px',
        '--page-margins': '32px',
        '--primary-background-color': 'hsl(var(--card))',
        '--secondary-background-color': 'hsl(var(--muted))',
        '--primary-font-color': 'hsl(var(--card-foreground))',
        '--secondary-font-color': 'hsl(var(--muted-foreground))',
    } as React.CSSProperties;

    // Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const fadeInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
    };

    const fadeInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
    };

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex flex-col h-screen overflow-y-auto hide-scrollbar scroll-smooth"
        >
            <header className="fixed top-0 w-full z-50 p-4 flex items-center justify-between bg-transparent pointer-events-none">
                <div className="flex items-center pointer-events-auto">
                    <Logo />
                </div>

                {/* Capsule Navbar */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-50 pointer-events-auto">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <div className="bg-background/60 backdrop-blur-md border border-border/40 rounded-full shadow-lg p-1">
                            <nav className="flex items-center gap-1 text-sm">
                                <a href="#" className={cn("font-medium transition-colors px-5 py-2 rounded-full", activeLink === 'home' ? 'bg-black text-white shadow-md' : 'text-muted-foreground hover:text-foreground')}>Home</a>
                                <a href="#features" className={cn("font-medium transition-colors px-5 py-2 rounded-full", activeLink === 'features' ? 'bg-black text-white shadow-md' : 'text-muted-foreground hover:text-foreground')}>Features</a>
                                <a href="#interview" className={cn("font-medium transition-colors px-5 py-2 rounded-full", activeLink === 'interview' ? 'bg-black text-white shadow-md' : 'text-muted-foreground hover:text-foreground')}>Interview</a>
                                <a href="#templates" className={cn("font-medium transition-colors px-5 py-2 rounded-full", activeLink === 'templates' ? 'bg-black text-white shadow-md' : 'text-muted-foreground hover:text-foreground')}>Templates</a>
                                <a href="#connect" className={cn("font-medium transition-colors px-5 py-2 rounded-full", activeLink === 'connect' ? 'bg-black text-white shadow-md' : 'text-muted-foreground hover:text-foreground')}>Connect</a>
                            </nav>
                        </div>
                    </motion.div>
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">
                    {loading ? (
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    ) : user ? (
                        <Button asChild>
                            <Link to="/dashboard">Go to Dashboard</Link>
                        </Button>
                    ) : (
                        <div className="flex items-center gap-1 bg-background/60 backdrop-blur-md border border-border/40 p-1.5 rounded-full shadow-sm">
                            <Button variant="ghost" size="sm" className="rounded-full hover:bg-background/80" asChild>
                                <Link to="/login">Sign In</Link>
                            </Button>
                            <Button size="sm" className="rounded-full" asChild>
                                <Link to="/signup">Get Started</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            {/* Hero Section Container */}
            <main className="flex-grow">
                <section id="home" className="relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden bg-background">

                    {/* Left Side Resumes (Desktop Only) */}
                    <motion.div
                        initial={{ x: -100, opacity: 0, rotate: 0 }}
                        animate={{ x: 0, opacity: 0.9, rotate: 12 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="hidden xl:flex flex-col gap-8 absolute -left-28 top-[-100px] hover:opacity-100 transition-opacity duration-700 pointer-events-none select-none z-0"
                    >
                        <div className="w-[360px] h-[500px] bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-200/50">
                            <div className="scale-[0.45] origin-top-left w-[210mm] h-[297mm]">
                                <div style={styleVariables}>
                                    <CorporateTemplate resumeData={previewDataMap.corporate} />
                                </div>
                            </div>
                        </div>
                        <div className="w-[360px] h-[500px] bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-200/50">
                            <div className="scale-[0.45] origin-top-left w-[210mm] h-[297mm]">
                                <div style={styleVariables}>
                                    <ExecutiveTemplate resumeData={previewDataMap.executive} />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side Resumes (Desktop Only) */}
                    <motion.div
                        initial={{ x: 100, opacity: 0, rotate: 0 }}
                        animate={{ x: 0, opacity: 0.9, rotate: -12 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="hidden xl:flex flex-col gap-8 absolute -right-28 top-[-100px] hover:opacity-100 transition-opacity duration-700 pointer-events-none select-none z-0"
                    >
                        <div className="w-[360px] h-[500px] bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-200/50">
                            <div className="scale-[0.45] origin-top-left w-[210mm] h-[297mm]">
                                <div style={styleVariables}>
                                    <MinimalistTemplate resumeData={previewDataMap.minimalist} />
                                </div>
                            </div>
                        </div>
                        <div className="w-[360px] h-[500px] bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-200/50">
                            <div className="scale-[0.45] origin-top-left w-[210mm] h-[297mm]">
                                <div style={styleVariables}>
                                    <CleanTemplate resumeData={previewDataMap.clean} />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="relative z-20 text-center px-4 max-w-4xl mx-auto"
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-6 animate-shine bg-[linear-gradient(110deg,hsl(var(--foreground)),45%,hsl(var(--muted-foreground)),55%,hsl(var(--foreground)))] bg-[length:200%_auto] bg-clip-text text-transparent px-2 leading-tight"
                        >
                            Build Resumes. <br /> Master Interviews.
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 px-4 leading-relaxed"
                        >
                            Our intuitive builder, professional templates, and real-time editor make it easy to create a polished, print-ready resume that gets you noticed.
                        </motion.p>
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <Button size="lg" className="h-12 px-8 text-lg w-full sm:w-auto rounded-full" asChild>
                                <Link to="/dashboard">Create Your Resume Now</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto gap-2 rounded-full" asChild>
                                <Link to="/dashboard/interview">
                                    <MessageCircle className="h-5 w-5" /> Try Interview Coach
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Features Section */}
                <section id="features" ref={featuresRef} className="relative z-20 py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="text-center mb-16 max-w-2xl mx-auto"
                        >
                            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Everything you need to succeed</motion.h2>
                            <motion.p variants={fadeInUp} className="text-lg text-slate-500">Powerful tools designed to help you build the perfect resume and land your dream job.</motion.p>
                        </motion.div>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            <motion.div variants={fadeInUp} className="group p-8 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="mb-6 inline-block p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                    <LayoutTemplate className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-slate-900">Multiple Templates</h3>
                                <p className="text-slate-500 leading-relaxed">Choose from a variety of professionally designed templates to match your style.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="group p-8 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="mb-6 inline-block p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform duration-300">
                                    <Palette className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-slate-900">Easy Customization</h3>
                                <p className="text-slate-500 leading-relaxed">Easily change colors, fonts, and layouts to personalize your resume.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="group p-8 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="mb-6 inline-block p-3 rounded-xl bg-green-50 text-green-600 group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-slate-900">Real-time Preview</h3>
                                <p className="text-slate-500 leading-relaxed">See your changes live as you edit your resume content and design.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="group p-8 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="mb-6 inline-block p-3 rounded-xl bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform duration-300">
                                    <Download className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-slate-900">PDF Download</h3>
                                <p className="text-slate-500 leading-relaxed">Download a print-ready PDF of your resume, perfect for job applications.</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Interview Coach Section */}
                <section id="interview" ref={interviewRef} className="py-24 bg-slate-50 relative overflow-hidden">
                    {/* Background Decorative Blobs */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gray-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-gray-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                            {/* Left Content */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                variants={fadeInLeft}
                                className="lg:w-1/2 text-left space-y-6"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-xs font-semibold tracking-wide uppercase">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    New Feature
                                </div>

                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                                    Master Your Interview <br />
                                    <span className="text-slate-500">Before It Happens</span>
                                </h2>

                                <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                                    Practice with our AI-powered Interview Coach. Get real-time feedback on your answers, tone, and confidence tailored specifically to your resume.
                                </p>

                                <motion.div
                                    variants={staggerContainer}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
                                >
                                    <motion.div variants={fadeInUp} className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-black">
                                            <BrainCircuit className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">AI-Generated Questions</h4>
                                            <p className="text-sm text-slate-500">Tailored to your specific job role.</p>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={fadeInUp} className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-black">
                                            <Mic className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Voice Interaction</h4>
                                            <p className="text-sm text-slate-500">Speak naturally like a real interview.</p>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={fadeInUp} className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-black">
                                            <BarChart3 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Instant Feedback</h4>
                                            <p className="text-sm text-slate-500">Detailed performance analysis report.</p>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={fadeInUp} className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-black">
                                            <Globe className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Multi-Language</h4>
                                            <p className="text-sm text-slate-500">Practice in English, Hindi, and more.</p>
                                        </div>
                                    </motion.div>
                                </motion.div>

                                <div className="pt-4">
                                    <Button size="lg" className="bg-black text-white hover:bg-slate-800 shadow-lg group rounded-full" asChild>
                                        <Link to="/dashboard/interview">
                                            Try Interview Coach <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Right Visual - Mockup Image */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                variants={fadeInRight}
                                className="lg:w-1/2 relative mt-8 lg:mt-0"
                            >
                                <div className="relative rounded-2xl overflow-hidden">
                                    <img
                                        src="/mockup.png"
                                        alt="Interview Coach Interface Mockup"
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </section>

                {/* Templates Section */}
                <section id="templates" ref={templatesRef} className="py-20">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold">Professionally-Designed Templates</h2>
                            <p className="text-lg text-muted-foreground mt-2">Click "Get Started" to choose a template and customize it to your liking.</p>
                        </motion.div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <ThreeDMarqueeDemo />
                    </motion.div>
                </section>

                {/* Connect Section */}
                <section id="connect" ref={connectRef} className="py-24 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-slate-100"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                                {/* Left Column: Text & Socials */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                                            Let's build something <br /> great.
                                        </h2>
                                        <p className="text-lg text-slate-500 leading-relaxed max-w-md">
                                            I'm passionate about building great products. Let's connect and create something amazing together.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <motion.a
                                            whileHover={{ y: -3 }}
                                            href="mailto:vedantwankhade47@gmail.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium text-sm"
                                        >
                                            <Mail className="h-4 w-4" />
                                            <span>Gmail</span>
                                        </motion.a>

                                        <motion.a
                                            whileHover={{ y: -3 }}
                                            href="https://www.linkedin.com/in/vedant-wankhade123/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-100 text-slate-700 hover:bg-[#0077b5] hover:text-white transition-colors font-medium text-sm"
                                        >
                                            <Linkedin className="h-4 w-4" />
                                            <span>LinkedIn</span>
                                        </motion.a>

                                        <motion.a
                                            whileHover={{ y: -3 }}
                                            href="https://vedantwankhade.netlify.app/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-100 text-slate-700 hover:bg-purple-600 hover:text-white transition-colors font-medium text-sm"
                                        >
                                            <Globe className="h-4 w-4" />
                                            <span>Portfolio</span>
                                        </motion.a>
                                    </div>
                                </div>

                                {/* Right Column: Stats Grid */}
                                <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <span className="text-4xl font-bold text-slate-900 tracking-tight">{stats.totalUsers.toLocaleString()}+</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider pl-12">Active Users</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <span className="text-4xl font-bold text-slate-900 tracking-tight">{stats.totalResumes.toLocaleString()}+</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider pl-12">Resumes Built</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                                <Download className="h-5 w-5" />
                                            </div>
                                            <span className="text-4xl font-bold text-slate-900 tracking-tight">{stats.totalDownloads.toLocaleString()}+</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider pl-12">Downloads</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                                                <Star className="h-5 w-5 fill-yellow-600" />
                                            </div>
                                            <span className="text-4xl font-bold text-slate-900 tracking-tight">4.9</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider pl-12">User Rating</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <footer className="bg-background border-t">
                <div className="container mx-auto py-12 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
                        <div className="col-span-1 md:col-span-2">
                            <div className="inline-block">
                                <Logo />
                            </div>
                            <p className="mt-4 text-muted-foreground max-w-xs mx-auto md:mx-0">
                                Create a professional resume that stands out. Your career journey starts here.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold tracking-wider uppercase">Links</h3>
                            <nav className="mt-4 space-y-2">
                                <a href="#" className="block text-muted-foreground hover:text-foreground">Home</a>
                                <a href="#features" className="block text-muted-foreground hover:text-foreground">Features</a>
                                <a href="#interview" className="block text-muted-foreground hover:text-foreground">Interview Coach</a>
                                <a href="#templates" className="block text-muted-foreground hover:text-foreground">Templates</a>
                            </nav>
                        </div>
                        <div>
                            <h3 className="font-semibold tracking-wider uppercase">Legal</h3>
                            <nav className="mt-4 space-y-2">
                                <a href="#" className="block text-muted-foreground hover:text-foreground">Privacy Policy</a>
                                <a href="#" className="block text-muted-foreground hover:text-foreground">Terms of Service</a>
                            </nav>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} NEUCV. All rights reserved.</p>
                        <p className="mt-2">
                            Developed by <span className="bg-foreground text-background px-2 py-1 rounded-md">Vedant Wankhade</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
