import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThreeDMarqueeDemo from '@/components/3d-marquee-demo';
import { LayoutTemplate, Palette, FileText, Download, Github, Mail, Linkedin, Globe, Users, Star, MessageCircle, Mic, BrainCircuit, BarChart3, Sparkles, ArrowRight, Bot, Volume2, Maximize2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex flex-col h-screen overflow-y-auto hide-scrollbar scroll-smooth"
        >
            <header className="fixed top-0 w-full z-50 p-4 flex items-center justify-between bg-transparent">
                <div className="flex items-center">
                    <Logo />
                </div>

                {/* Capsule Navbar */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-50">
                    <div className="bg-background/60 backdrop-blur-md border border-border/40 rounded-full shadow-lg p-1">
                        <nav className="flex items-center gap-1 text-sm">
                            <a href="#" className={cn("font-medium transition-colors px-5 py-2 rounded-full", activeLink === 'home' ? 'bg-black text-white shadow-md' : 'text-muted-foreground hover:text-foreground')}>Home</a>
                            <a href="#features" className={cn("font-medium transition-colors px-5 py-2 rounded-full", activeLink === 'features' ? 'bg-black text-white shadow-md' : 'text-muted-foreground hover:text-foreground')}>Features</a>
                            <a href="#interview" className={cn("font-medium transition-colors px-5 py-2 rounded-full", activeLink === 'interview' ? 'bg-black text-white shadow-md' : 'text-muted-foreground hover:text-foreground')}>Interview</a>
                            <a href="#templates" className={cn("font-medium transition-colors px-5 py-2 rounded-full", activeLink === 'templates' ? 'bg-black text-white shadow-md' : 'text-muted-foreground hover:text-foreground')}>Templates</a>
                            <a href="#connect" className={cn("font-medium transition-colors px-5 py-2 rounded-full", activeLink === 'connect' ? 'bg-black text-white shadow-md' : 'text-muted-foreground hover:text-foreground')}>Connect</a>
                        </nav>
                    </div>
                </div>

                <div className="flex items-center gap-4">
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
                    <div className="hidden xl:flex flex-col gap-8 absolute -left-28 top-[-100px] rotate-12 opacity-90 hover:opacity-100 transition-opacity duration-700 pointer-events-none select-none z-0">
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
                    </div>

                    {/* Right Side Resumes (Desktop Only) */}
                    <div className="hidden xl:flex flex-col gap-8 absolute -right-28 top-[-100px] -rotate-12 opacity-90 hover:opacity-100 transition-opacity duration-700 pointer-events-none select-none z-0">
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
                    </div>

                    <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-6 animate-shine bg-[linear-gradient(110deg,hsl(var(--foreground)),45%,hsl(var(--muted-foreground)),55%,hsl(var(--foreground)))] bg-[length:200%_auto] bg-clip-text text-transparent px-2 leading-tight">
                            Build Resumes. <br /> Master Interviews.
                        </h2>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 px-4 leading-relaxed">
                            Our intuitive builder, professional templates, and real-time editor make it easy to create a polished, print-ready resume that gets you noticed.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button size="lg" className="h-12 px-8 text-lg w-full sm:w-auto rounded-full" asChild>
                                <Link to="/dashboard">Create Your Resume Now</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto gap-2 rounded-full" asChild>
                                <Link to="/dashboard/interview">
                                    <MessageCircle className="h-5 w-5" /> Try Interview Coach
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" ref={featuresRef} className="relative z-20 py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Everything you need to succeed</h2>
                            <p className="text-lg text-slate-500">Powerful tools designed to help you build the perfect resume and land your dream job.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="group p-8 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="mb-6 inline-block p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                    <LayoutTemplate className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-slate-900">Multiple Templates</h3>
                                <p className="text-slate-500 leading-relaxed">Choose from a variety of professionally designed templates to match your style.</p>
                            </div>
                            <div className="group p-8 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="mb-6 inline-block p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform duration-300">
                                    <Palette className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-slate-900">Easy Customization</h3>
                                <p className="text-slate-500 leading-relaxed">Easily change colors, fonts, and layouts to personalize your resume.</p>
                            </div>
                            <div className="group p-8 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="mb-6 inline-block p-3 rounded-xl bg-green-50 text-green-600 group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-slate-900">Real-time Preview</h3>
                                <p className="text-slate-500 leading-relaxed">See your changes live as you edit your resume content and design.</p>
                            </div>
                            <div className="group p-8 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="mb-6 inline-block p-3 rounded-xl bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform duration-300">
                                    <Download className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-slate-900">PDF Download</h3>
                                <p className="text-slate-500 leading-relaxed">Download a print-ready PDF of your resume, perfect for job applications.</p>
                            </div>
                        </div>
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
                            <div className="lg:w-1/2 text-left space-y-6">
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-black">
                                            <BrainCircuit className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">AI-Generated Questions</h4>
                                            <p className="text-sm text-slate-500">Tailored to your specific job role.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-black">
                                            <Mic className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Voice Interaction</h4>
                                            <p className="text-sm text-slate-500">Speak naturally like a real interview.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-black">
                                            <BarChart3 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Instant Feedback</h4>
                                            <p className="text-sm text-slate-500">Detailed performance analysis report.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-black">
                                            <Globe className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Multi-Language</h4>
                                            <p className="text-sm text-slate-500">Practice in English, Hindi, and more.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button size="lg" className="bg-black text-white hover:bg-slate-800 shadow-lg group rounded-full" asChild>
                                        <Link to="/dashboard/interview">
                                            Try Interview Coach <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Right Visual - Mockup Image */}
                            <div className="lg:w-1/2 relative mt-8 lg:mt-0">
                                <div className="relative rounded-2xl overflow-hidden">
                                    <img
                                        src="/mockup.png"
                                        alt="Interview Coach Interface Mockup"
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Templates Section */}
                <section id="templates" ref={templatesRef} className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold">Professionally-Designed Templates</h2>
                            <p className="text-lg text-muted-foreground mt-2">Click "Get Started" to choose a template and customize it to your liking.</p>
                        </div>
                    </div>
                    <ThreeDMarqueeDemo />
                </section>

                {/* Connect Section */}
                <section id="connect" ref={connectRef} className="py-20 bg-muted/50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold">Connect with us</h2>
                            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                                I'm passionate about building great products. Let's connect and create something amazing together!
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                            <div className="flex flex-col items-center p-4 transition-all">
                                <div className="p-3 bg-primary/10 rounded-full mb-3">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-3xl font-bold mb-1">{stats.totalUsers.toLocaleString()}+</h3>
                                <p className="text-muted-foreground text-sm">Active Users</p>
                            </div>
                            <div className="flex flex-col items-center p-4 transition-all">
                                <div className="p-3 bg-primary/10 rounded-full mb-3">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-3xl font-bold mb-1">{stats.totalResumes.toLocaleString()}+</h3>
                                <p className="text-muted-foreground text-sm">Resumes Created</p>
                            </div>
                            <div className="flex flex-col items-center p-4 transition-all">
                                <div className="p-3 bg-primary/10 rounded-full mb-3">
                                    <Download className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-3xl font-bold mb-1">{stats.totalDownloads.toLocaleString()}+</h3>
                                <p className="text-muted-foreground text-sm">Downloads</p>
                            </div>
                            <div className="flex flex-col items-center p-4 transition-all">
                                <div className="p-3 bg-primary/10 rounded-full mb-3">
                                    <Star className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-3xl font-bold mb-1">4.9</h3>
                                <p className="text-muted-foreground text-sm">User Rating</p>
                            </div>
                        </div>

                        <div className="flex justify-center items-center flex-wrap gap-6 md:gap-8">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a href="https://github.com/vedantwankhade123/biocv" target="_blank" rel="noopener noreferrer" className="group">
                                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border-2 group-hover:border-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                                            <Github className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>GitHub: vedantwankhade123/biocv</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a href="mailto:vedantwankhade47@gmail.com" target="_blank" rel="noopener noreferrer" className="group">
                                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border-2 group-hover:border-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                                            <Mail className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Email: vedantwankhade47@gmail.com</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a href="https://www.linkedin.com/in/vedant-wankhade123/" target="_blank" rel="noopener noreferrer" className="group">
                                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border-2 group-hover:border-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                                            <Linkedin className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>LinkedIn: vedant-wankhade123</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a href="https://vedantwankhade.netlify.app/" target="_blank" rel="noopener noreferrer" className="group">
                                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border-2 group-hover:border-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                                            <Globe className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Portfolio: vedantwankhade.netlify.app</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
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
