import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
    children: React.ReactNode;
    image?: string;
    title?: string;
    subtitle?: string;
    illustration?: string;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className="container relative h-screen flex-col grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-[calc(100vh-2rem)] m-4 flex-col p-10 text-white lg:flex overflow-hidden rounded-3xl border border-zinc-200 shadow-sm">

                {/* Animated Gradient Background - Ultra-Dark Midnight Theme */}
                <motion.div
                    className="absolute inset-0 z-0"
                    style={{
                        background: "linear-gradient(135deg, #0b0b0f 0%, #0f172a 14%, #111111 28%, #f97316 52%, #ff9a3c 66%, #111111 82%, #0b0b0f 100%)",
                        backgroundSize: "340% 340%"
                    }}
                    animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{
                        duration: 14,
                        ease: "easeInOut",
                        repeat: Infinity
                    }}
                />
                <motion.div
                    className="absolute inset-0 z-0"
                    style={{
                        background: "radial-gradient(circle at 25% 30%, rgba(255, 164, 94, 0.28), transparent 40%), radial-gradient(circle at 75% 70%, rgba(255, 255, 255, 0.16), transparent 46%)",
                        mixBlendMode: "screen"
                    }}
                    animate={{
                        opacity: [0.85, 1, 0.85],
                        scale: [1, 1.025, 1]
                    }}
                    transition={{
                        duration: 9,
                        ease: "easeInOut",
                        repeat: Infinity
                    }}
                />
                <motion.div
                    className="absolute inset-0 z-0"
                    style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.22) 45%, transparent 90%)"
                    }}
                    animate={{
                        backgroundPosition: ["-120% 0%", "120% 0%"]
                    }}
                    transition={{
                        duration: 6,
                        ease: "easeInOut",
                        repeat: Infinity
                    }}
                />

                {/* Logo - Fixed Positioning */}
                <div className="absolute top-10 left-10 z-30">
                    <Logo />
                </div>

                {/* Animated Background Elements - Subtle Overlay */}
                <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none z-10">
                    <motion.div
                        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-white/10 blur-3xl"
                        animate={{
                            x: [0, 100, 0],
                            y: [0, 50, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                {/* Text Content - Centered hero copy */}
                <div className="relative z-20 flex-1 w-full flex items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="space-y-4 max-w-xl"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 ring-1 ring-white/15">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            New user welcome
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-white">
                            Build your professional resume and prep for interviews—faster.
                        </h1>
                        <p className="text-lg text-white/80 leading-relaxed">
                            AI-powered resumes, tailored interview practice, and credits to get you started. Stay focused on landing the offer—let us handle the polish.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white/80">
                            <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur">
                                <p className="font-semibold text-white">Smart interview coach</p>
                                <p className="text-white/70">Adaptive Q&A with instant feedback.</p>
                            </div>
                            <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur">
                                <p className="font-semibold text-white">Polished resumes</p>
                                <p className="text-white/70">ATS-friendly templates and quick edits.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <div className="lg:p-8 relative h-full flex flex-col justify-center">
                <div className="absolute top-4 left-4 md:top-8 md:left-8">
                    <Button variant="ghost" asChild className="gap-2">
                        <Link to="/">
                            <ChevronLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    {children}
                </div>
            </div>
        </div>
    );
};
