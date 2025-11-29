import { useState, useEffect } from 'react';
import { Check, Sparkles, FileText, LayoutTemplate, Zap, CreditCard, Loader2, Star, ShieldCheck, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { UserNav } from "@/components/UserNav";
import { cn } from "@/lib/utils";
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addCredits, updateUserPlan, addTemplateCredits } from '@/lib/user-service';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const plans = [
    {
        id: 'free',
        name: "Free",
        price: "₹0",
        description: "Get started with a simple, professional resume.",
        features: [
            "Access to Basic Templates",
            "PDF Download",
            "Standard Formatting",
            "5 Free AI Credits",
        ],
        popular: false,
        buttonText: "Start for Free",
        gradient: "from-slate-500 to-slate-400",
        icon: FileText,
        type: 'plan',
        value: 'free',
        delay: 0.1
    },
    {
        id: 'single',
        name: "Single Premium",
        price: "₹99",
        description: "Unlock any single premium template of your choice.",
        features: [
            "1 Premium Template Credit",
            "Lifetime Access",
            "Advanced Design Options",
            "Stand Out from the Crowd",
        ],
        popular: false,
        buttonText: "Buy Template Credit",
        gradient: "from-blue-500 to-cyan-400",
        icon: LayoutTemplate,
        type: 'template-credit',
        value: 1,
        delay: 0.2
    },
    {
        id: 'pro',
        name: "Pro Lifetime",
        price: "₹499",
        description: "Unlock everything forever. Best value for serious job seekers.",
        features: [
            "Unlock ALL Premium Templates",
            "Future Templates Included",
            "50 Bonus AI Credits",
            "Priority Support",
            "Founder Badge",
        ],
        popular: true,
        buttonText: "Get Lifetime Access",
        gradient: "from-violet-600 to-indigo-600",
        icon: Crown,
        type: 'plan',
        value: 'pro',
        delay: 0.3
    },
];

const creditPacks = [
    {
        id: 'credits-10',
        name: "Starter Pack",
        credits: 10,
        price: "₹99",
        description: "Perfect for tweaking a few resumes.",
        gradient: "from-blue-500 to-cyan-400",
        popular: false,
        delay: 0.4
    },
    {
        id: 'credits-50',
        name: "Power Pack",
        credits: 50,
        price: "₹399",
        description: "Best value for heavy AI usage.",
        gradient: "from-emerald-500 to-teal-400",
        popular: true,
        delay: 0.5
    }
];

const Pricing = () => {
    const [user, loadingAuth] = useAuthState(auth);
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState<string | null>(null);
    const isDashboard = location.pathname.includes('/dashboard');

    useEffect(() => {
        if (!loadingAuth && user && !isDashboard) {
            navigate('/dashboard/pricing');
        }
    }, [user, loadingAuth, isDashboard, navigate]);

    const handlePurchase = async (item: any) => {
        if (!user) {
            toast({ title: "Login Required", description: "Please login to purchase.", variant: "destructive" });
            navigate('/login');
            return;
        }

        if (item.type === 'plan' && item.value === 'free') {
            navigate('/dashboard');
            return;
        }

        setLoading(item.id);

        // Mock payment delay
        setTimeout(async () => {
            try {
                if (item.type === 'plan') {
                    await updateUserPlan(user.uid, item.value);
                    if (item.value === 'pro') {
                        await addCredits(user.uid, 50); // Bonus credits
                    }
                    toast({ title: "Upgrade Successful!", description: `You are now on the ${item.name} plan.` });
                } else if (item.type === 'template-credit') {
                    await addTemplateCredits(user.uid, item.value);
                    toast({ title: "Purchase Successful!", description: "1 Template Credit added to your account." });
                } else {
                    // Credit pack
                    await addCredits(user.uid, item.credits);
                    toast({ title: "Credits Added!", description: `${item.credits} credits added to your account.` });
                }
            } catch (error) {
                console.error(error);
                toast({ title: "Purchase Failed", description: "Something went wrong.", variant: "destructive" });
            } finally {
                setLoading(null);
            }
        }, 1500);
    };

    return (
        <div className="flex flex-col min-h-full bg-white overflow-hidden">
            <header className="bg-white border-b p-3 hidden md:block flex-shrink-0 no-print h-14 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold tracking-tight">Plans & Pricing</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {user ? (
                            <UserNav />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to="/login">Sign In</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link to="/signup">Get Started</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-grow overflow-y-auto overflow-x-hidden scroll-smooth w-full max-w-7xl mx-auto">
                <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-8">

                    {/* Hero Section */}
                    <div className="text-center space-y-3 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-3xl font-bold tracking-tight"
                        >
                            Simple, Transparent <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">Pricing</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto"
                        >
                            Choose the plan that fits your career goals. Pay once, own it forever.
                        </motion.p>
                    </div>

                    {/* Main Plans */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                        {plans.map((plan) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: plan.delay }}
                                whileHover={{ y: -5 }}
                                className="h-full"
                            >
                                <Card
                                    className={cn(
                                        "relative flex flex-col h-full transition-all duration-300 border-2 overflow-hidden",
                                        plan.popular
                                            ? "border-primary/50 shadow-2xl shadow-primary/10 bg-gradient-to-b from-background to-primary/5"
                                            : "border-muted hover:border-primary/30 bg-card/50 backdrop-blur-sm"
                                    )}
                                >
                                    {plan.popular && (
                                        <div className="absolute top-0 right-0">
                                            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-8 py-1 rotate-45 translate-x-8 translate-y-4 shadow-sm">
                                                POPULAR
                                            </div>
                                        </div>
                                    )}
                                    <CardHeader className="p-4">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white shadow-md ring-2 ring-background", `bg-gradient-to-br ${plan.gradient}`)}>
                                            <plan.icon className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                                        <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-4 p-4 pt-0">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                                            {plan.value === "pro" && <span className="text-muted-foreground font-medium text-sm">/ lifetime</span>}
                                            {plan.value === "single" && <span className="text-muted-foreground font-medium text-sm">/ template</span>}
                                        </div>
                                        <div className="space-y-2.5">
                                            {plan.features.map((feature) => (
                                                <div key={feature} className="flex items-start gap-2">
                                                    <div className={cn("mt-0.5 h-4 w-4 rounded-full flex items-center justify-center text-white text-[8px] flex-shrink-0", `bg-gradient-to-br ${plan.gradient}`)}>
                                                        <Check className="h-2.5 w-2.5" />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground leading-tight">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4 p-4">
                                        <Button
                                            className={cn("w-full h-9 text-sm font-semibold transition-all duration-300", plan.popular ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-primary/30" : "")}
                                            variant={plan.popular ? "default" : "outline"}
                                            onClick={() => handlePurchase(plan)}
                                            disabled={loading !== null}
                                        >
                                            {loading === plan.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            {plan.buttonText}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Simplified AI Credit Packs */}
                    <div className="space-y-4">
                        <div className="text-center space-y-1">
                            <h2 className="text-xl font-bold tracking-tight">AI Credit Packs</h2>
                            <p className="text-muted-foreground text-sm">Top up your credits for more AI generations.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                            {creditPacks.map((pack) => (
                                <Card key={pack.name} className="flex items-center justify-between p-4 hover:border-primary transition-colors">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-sm">{pack.name}</h3>
                                            {pack.popular && <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">Best Value</span>}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Zap className="h-3 w-3" />
                                            <span>{pack.credits} Credits</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-base">{pack.price}</span>
                                        <Button size="sm" className="h-8 text-xs" onClick={() => handlePurchase(pack)} disabled={loading !== null}>
                                            {loading === pack.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Buy"}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Trust/FAQ Section */}
                    <div className="bg-muted/30 rounded-2xl p-5 md:p-6 border">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
                            <div className="space-y-1.5">
                                <div className="mx-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <h4 className="font-semibold text-sm">Secure Payment</h4>
                                <p className="text-xs text-muted-foreground">Encrypted and safe transactions.</p>
                            </div>
                            <div className="space-y-1.5">
                                <div className="mx-auto w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <Star className="h-5 w-5" />
                                </div>
                                <h4 className="font-semibold text-sm">Top Rated</h4>
                                <p className="text-xs text-muted-foreground">Loved by thousands of job seekers.</p>
                            </div>
                            <div className="space-y-1.5">
                                <div className="mx-auto w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <h4 className="font-semibold text-sm">Instant Access</h4>
                                <p className="text-xs text-muted-foreground">Start creating immediately.</p>
                            </div>
                        </div>

                        <div className="text-center space-y-3 border-t pt-5">
                            <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto mt-4">
                                <div className="space-y-1">
                                    <h4 className="font-medium text-sm">Is the Pro plan a subscription?</h4>
                                    <p className="text-xs text-muted-foreground">No! It's a one-time payment for lifetime access to all templates.</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-medium text-sm">Do credits expire?</h4>
                                    <p className="text-xs text-muted-foreground">No, your purchased AI credits never expire.</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-medium text-sm">Can I buy credits without Pro?</h4>
                                    <p className="text-xs text-muted-foreground">Yes, you can stay on the Free plan and just buy credit packs as needed.</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-medium text-sm">What payment methods do you accept?</h4>
                                    <p className="text-xs text-muted-foreground">We accept all major credit cards, UPI, and net banking (Mock for demo).</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Pricing;
