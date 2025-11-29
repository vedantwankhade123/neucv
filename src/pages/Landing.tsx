import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThreeDMarqueeDemo from '@/components/3d-marquee-demo';
import { LayoutTemplate, Palette, FileText, Download, Github, Mail, Linkedin, Globe, Users, Star } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { initialResumeStyle } from '@/data/initialData';
import { previewDataMap } from '@/data/previewData';
import CorporateTemplate from '@/components/templates/CorporateTemplate';
import { auth } from '@/lib/firebase';
import { getGlobalStats } from '@/lib/stats-service';

const Landing = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLink, setActiveLink] = useState('home');
  const featuresRef = useRef<HTMLElement>(null);
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

    const scrollPosition = containerRef.current.scrollTop + 100; // Add offset for better trigger point

    const featuresTop = featuresRef.current?.offsetTop ?? Infinity;
    const templatesTop = templatesRef.current?.offsetTop ?? Infinity;
    const connectTop = connectRef.current?.offsetTop ?? Infinity;

    if (scrollPosition >= connectTop) {
      setActiveLink('connect');
    } else if (scrollPosition >= templatesTop) {
      setActiveLink('templates');
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
      <header className="sticky top-0 z-50 p-4 flex items-center justify-between bg-background/80 backdrop-blur-sm">
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Notch Navbar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 hidden md:block" style={{ perspective: '300px' }}>
          <div
            className="bg-background/95 border border-foreground/10 rounded-b-2xl shadow-lg"
            style={{ transform: 'rotateX(-15deg)', transformOrigin: 'top' }}
          >
            <nav className="px-6 py-3">
              <div className="flex items-center gap-4 text-sm">
                <a href="#" className={cn("font-medium transition-colors px-3 py-1.5 rounded-full", activeLink === 'home' ? 'bg-black text-white shadow-md' : 'text-foreground hover:text-foreground/80')}>Home</a>
                <a href="#features" className={cn("font-medium transition-colors px-3 py-1.5 rounded-full", activeLink === 'features' ? 'bg-black text-white shadow-md' : 'text-foreground hover:text-foreground/80')}>Features</a>
                <a href="#templates" className={cn("font-medium transition-colors px-3 py-1.5 rounded-full", activeLink === 'templates' ? 'bg-black text-white shadow-md' : 'text-foreground hover:text-foreground/80')}>Templates</a>
                <Link to="/pricing" className="font-medium transition-colors px-3 py-1.5 rounded-full text-foreground hover:text-foreground/80">Pricing</Link>
                <a href="#connect" className={cn("font-medium transition-colors px-3 py-1.5 rounded-full", activeLink === 'connect' ? 'bg-black text-white shadow-md' : 'text-foreground hover:text-foreground/80')}>Connect</a>
              </div>
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
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section Container */}
      <main className="flex-grow">
        <section id="home" className="relative text-center px-4 pt-16 md:pt-20 pb-0 md:pb-12 md:min-h-screen md:flex md:flex-col md:justify-end md:items-center md:overflow-hidden">
          <div className="relative z-20 md:pb-[480px]">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4 animate-shine bg-[linear-gradient(110deg,hsl(var(--foreground)),45%,hsl(var(--muted-foreground)),55%,hsl(var(--foreground)))] bg-[length:200%_auto] bg-clip-text text-transparent">
              Craft a Standout Resume in Minutes
            </h2>
            <p className="text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Our intuitive builder, professional templates, and real-time editor make it easy to create a polished, print-ready resume that gets you noticed.
            </p>
            <Button size="lg" asChild>
              <Link to="/dashboard">Create Your Resume Now</Link>
            </Button>
          </div>

          {/* Responsive Resume Preview */}
          <div className="relative w-full max-w-sm h-[506px] md:max-w-none md:w-[800px] md:h-[900px] mt-12 md:mt-0 md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:translate-y-1/2 md:z-10 bg-card shadow-2xl rounded-lg border overflow-hidden">
            {/* Mobile Scaler */}
            <div className="md:hidden" style={{ transform: 'scale(0.45)', transformOrigin: 'top left' }}>
              <div style={styleVariables}>
                <CorporateTemplate resumeData={previewDataMap.corporate} />
              </div>
            </div>
            {/* Desktop Scaler */}
            <div className="hidden md:block" style={{ transform: 'scale(1.0)', transformOrigin: 'top left' }}>
              <div style={styleVariables}>
                <CorporateTemplate resumeData={previewDataMap.corporate} />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" ref={featuresRef} className="relative z-20 py-16 bg-gradient-to-b from-black to-gray-900 m-1.5 rounded-2xl">
          <div className="container mx-auto px-4 pt-10 md:pt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-50">Features to Help You Succeed</h2>
              <p className="text-lg text-slate-300 mt-2">Everything you need to create the perfect resume.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 rounded-lg text-center transition-transform duration-300 hover:-translate-y-2">
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 text-white p-3 rounded-full">
                    <LayoutTemplate className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-50">Multiple Templates</h3>
                <p className="text-slate-400">Choose from a variety of professionally designed templates to match your style.</p>
              </div>
              <div className="p-6 rounded-lg text-center transition-transform duration-300 hover:-translate-y-2">
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 text-white p-3 rounded-full">
                    <Palette className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-50">Easy Customization</h3>
                <p className="text-slate-400">Easily change colors, fonts, and layouts to personalize your resume.</p>
              </div>
              <div className="p-6 rounded-lg text-center transition-transform duration-300 hover:-translate-y-2">
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 text-white p-3 rounded-full">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-50">Real-time Preview</h3>
                <p className="text-slate-400">See your changes live as you edit your resume content and design.</p>
              </div>
              <div className="p-6 rounded-lg text-center transition-transform duration-300 hover:-translate-y-2">
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 text-white p-3 rounded-full">
                    <Download className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-50">PDF Download</h3>
                <p className="text-slate-400">Download a print-ready PDF of your resume, perfect for job applications.</p>
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