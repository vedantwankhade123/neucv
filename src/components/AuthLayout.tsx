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

export const AuthLayout = ({ children, image, title, subtitle, illustration }: AuthLayoutProps) => {
    return (
        <div className="container relative h-screen flex-col grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-[calc(100vh-2rem)] m-4 flex-col p-10 text-white lg:flex overflow-hidden rounded-3xl border border-zinc-200 shadow-sm">

                {/* Animated Gradient Background - Ultra-Dark Midnight Theme */}
                <motion.div
                    className="absolute inset-0 z-0"
                    style={{
                        background: "linear-gradient(-45deg, #000000, #020617, #0f172a, #020617)",
                        backgroundSize: "400% 400%"
                    }}
                    animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{
                        duration: 15,
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

                {/* Illustration - Takes available space */}
                <div className="relative z-20 flex-1 flex items-center justify-center w-full">
                    {illustration && (
                        <motion.div
                            className="relative w-full flex justify-center items-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <img
                                src={illustration}
                                alt="Authentication Illustration"
                                className="object-contain max-h-[75vh] w-auto drop-shadow-md"
                            />
                        </motion.div>
                    )}
                </div>

                {/* Text Content - Bottom Aligned */}
                <div className="relative z-20 mt-auto space-y-2 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <h1 className="text-3xl font-bold tracking-tight">Build your professional resume in minutes.</h1>
                        <p className="text-lg text-white/80">
                            Join thousands of users who have landed their dream jobs with our AI-powered resume builder.
                        </p>
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
