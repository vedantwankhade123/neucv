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
                <a href="#interview" className={cn("font-medium transition-colors px-3 py-1.5 rounded-full", activeLink === 'interview' ? 'bg-black text-white shadow-md' : 'text-foreground hover:text-foreground/80')}>Interview</a>
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
              Build Resumes. Master Interviews.
            </h2>
            <p className="text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Our intuitive builder, professional templates, and real-time editor make it easy to create a polished, print-ready resume that gets you noticed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/dashboard">Create Your Resume Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto gap-2">
                <Link to="/dashboard/interview">
                  <MessageCircle className="h-4 w-4" /> Try Interview Coach
                </Link>
              </Button>
            </div>
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
                  Master Your Interview <br/>
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
                  <Button size="lg" className="bg-black text-white hover:bg-slate-800 shadow-lg group" asChild>
                    <Link to="/dashboard/interview">
                      Try Interview Coach <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Visual - Realistic Animated Mockup */}
              <div className="lg:w-1/2 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white transform transition-transform hover:scale-[1.01] duration-500">
                  {/* Fake Browser Header */}
                  <div className="bg-slate-50 border-b p-3 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-md text-[10px] text-slate-400 font-medium border border-slate-200 shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        neucv.com/interview-coach
                    </div>
                    <div className="w-10"></div>
                  </div>

                  {/* App Interface Replica */}
                  <div className="bg-slate-50/50 p-4 h-[400px] flex flex-col gap-4">
                    {/* App Header */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/10">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">AI Coach</div>
                          <div className="text-[10px] text-muted-foreground font-medium">Marketing Manager</div>
                        </div>
                      </div>
                      <div className="flex-1 mx-6 hidden sm:block">
                        <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            <span>Question 1</span>
                            <span>10 Total</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full w-[10%] bg-primary rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-[10px] font-mono font-medium text-slate-600">29:39</div>
                        <Button size="sm" variant="destructive" className="h-7 text-[10px] px-3 shadow-sm">Finish</Button>
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex gap-4 h-full min-h-0">
                      {/* Visualizer (Left) */}
                      <div className="w-1/2 bg-black rounded-2xl relative overflow-hidden flex items-center justify-center p-4 shadow-lg ring-1 ring-black/5">
                        {/* Badge */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20 text-cyan-400 text-[9px] font-bold tracking-widest px-3 py-1 rounded-full z-20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            AI SPEAKING
                        </div>
                        
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-black to-black"></div>

                        {/* CSS Visualizer */}
                        <div className="relative w-40 h-40 flex items-center justify-center">
                          {/* Animated Rings */}
                          <div className="absolute inset-0 rounded-full border-[1px] border-cyan-500/20 animate-[spin_8s_linear_infinite]" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}></div>
                          <div className="absolute inset-2 rounded-full border-[1px] border-blue-500/20 animate-[spin_6s_linear_infinite_reverse]" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}></div>
                          <div className="absolute inset-4 rounded-full border-[1px] border-indigo-500/20 animate-[spin_10s_linear_infinite]" style={{ borderRadius: '50% 50% 20% 80% / 25% 80% 20% 60%' }}></div>
                          
                          {/* Pulse Effect */}
                          <div className="absolute inset-0 bg-cyan-500/5 rounded-full animate-pulse blur-xl"></div>

                          {/* Filament Simulation (Static SVGs rotated with CSS) */}
                          <div className="absolute inset-0 opacity-40 animate-[spin_20s_linear_infinite]">
                             <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-500/30 fill-current">
                                <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="1 3" />
                             </svg>
                          </div>

                          {/* Core */}
                          <div className="w-20 h-20 bg-black rounded-full z-10 flex items-center justify-center border border-white/10 relative shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                            <Volume2 className="h-8 w-8 text-white/90 animate-pulse" />
                          </div>
                        </div>
                        
                        <div className="absolute bottom-8 text-slate-400 text-[10px] font-medium tracking-wide">Interviewer is speaking...</div>
                      </div>

                      {/* Question/Input (Right) */}
                      <div className="w-1/2 flex flex-col gap-3">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col relative overflow-hidden group">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Question 1 / 10</span>
                            <div className="flex gap-1.5">
                              <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">BEHAVIORAL</span>
                              <span className="text-[9px] font-semibold bg-orange-50 border border-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Medium</span>
                            </div>
                          </div>
                          <h3 className="text-sm md:text-base font-bold leading-relaxed text-slate-800 relative z-10">
                            Richard, your resume mentions developing and executing comprehensive marketing strategies at Borcelle Studio...
                          </h3>
                          
                          {/* Fade at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                          
                          {/* Scrollbar Indicator */}
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-slate-100 rounded-full">
                             <div className="w-full h-4 bg-slate-300 rounded-full"></div>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Mic className="h-3 w-3" /> Voice Input
                            </span>
                            <span className="text-[9px] font-medium text-slate-400 hover:text-primary cursor-pointer transition-colors">Switch to Text</span>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-slate-200 transition-colors">
                            <span className="text-xs text-slate-400 font-medium pl-1 group-hover:text-slate-500">Listening... Speak clearly.</span>
                            <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                              <Mic className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 px-1">
                             <span className="text-[9px] text-slate-300 font-medium">0 chars</span>
                             <div className="flex gap-2">
                                <span className="text-[10px] font-medium text-slate-400 px-2 py-1 hover:text-slate-600 cursor-pointer">Skip</span>
                                <div className="text-[10px] font-bold text-white bg-slate-900 px-3 py-1 rounded-md shadow-sm flex items-center gap-1">
                                   Submit <ArrowRight className="h-2.5 w-2.5" />
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pro Tip - Subtle */}
                    <div className="bg-white border border-slate-100 rounded-xl p-3 flex gap-3 items-center shadow-sm">
                       <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                          <Sparkles className="h-4 w-4" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wide">Pro Tip</p>
                          <p className="text-[10px] text-slate-500 leading-snug">Use the STAR method (Situation, Task, Action, Result) to structure your answers.</p>
                       </div>
                    </div>
                  </div>
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