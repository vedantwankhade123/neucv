import { useState } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await sendPasswordResetEmail(auth, email);
            setIsSubmitted(true);
        } catch (err: any) {
            console.error('Error sending password reset email:', err);
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email address.');
            } else {
                setError('Failed to send reset email. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout illustration="/auth1.png">
                <div className="flex flex-col space-y-4 text-center items-center justify-center h-full">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                    </p>
                    <Button
                        variant="outline"
                        className="mt-4 w-full rounded-full"
                        onClick={() => setIsSubmitted(false)}
                    >
                        Try another email
                    </Button>
                    <Link
                        to="/login"
                        className="flex items-center text-sm text-muted-foreground hover:text-primary mt-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to login
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout illustration="/auth1.png">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
                <p className="text-sm text-muted-foreground">
                    No worries, we'll send you reset instructions.
                </p>
            </div>
            <div className="grid gap-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10 rounded-full bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all duration-200"
                                />
                            </div>
                        </div>
                        {error && (
                            <p className="text-sm text-red-500 text-center">{error}</p>
                        )}
                        <Button
                            disabled={isLoading}
                            className="w-full rounded-full h-11 font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                        >
                            {isLoading ? (
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                                'Send Reset Link'
                            )}
                        </Button>
                    </div>
                </form>
                <div className="text-center">
                    <Link
                        to="/login"
                        className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
