import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Zap, FileText, CreditCard } from "lucide-react";

export function PricingDetailsDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary font-medium rounded-full px-4 shadow-sm">
                    <Info className="h-4 w-4" />
                    Learn more about pricing
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Pricing & Credits Explained</DialogTitle>
                    <DialogDescription>
                        Everything you need to know about how our credit system and payments work.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Credit System Section */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            How Credits Work
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            We use a flexible credit system to power our AI features. You only pay for what you use.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg border">
                                <div className="font-medium text-sm mb-1">Resume AI Features</div>
                                <div className="text-2xl font-bold text-primary">1 Credit</div>
                                <div className="text-xs text-muted-foreground">per generation (Summary, Experience, etc.)</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border">
                                <div className="font-medium text-sm mb-1">Interview Analysis</div>
                                <div className="text-2xl font-bold text-primary">5 Credits</div>
                                <div className="text-xs text-muted-foreground">per full interview report</div>
                            </div>
                        </div>
                    </section>

                    {/* Plans Section */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Plans & Packs
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex gap-2">
                                <span className="font-bold min-w-[80px]">Free:</span>
                                <span className="text-muted-foreground">Get started with 10 free credits to try out the AI features.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold min-w-[80px]">Starter:</span>
                                <span className="text-muted-foreground">20 Credits + Premium Template. Perfect for a single job application.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold min-w-[80px]">Pro:</span>
                                <span className="text-muted-foreground">100 Credits + Unlimited Templates + Priority Support. Best value.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Payments Section */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-green-500" />
                            Secure Payments
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            We support all major payment methods including Credit/Debit Cards, UPI, and Net Banking via our secure payment partners.
                            Prices are inclusive of all taxes.
                        </p>
                    </section>

                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                        <strong>Note:</strong> Credits never expire for paid plans. Free credits are valid for 30 days.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
