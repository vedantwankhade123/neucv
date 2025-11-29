import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { incrementUserCount } from '@/lib/stats-service';
import { signInWithGoogle, registerWithEmailAndPassword, auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';

const Signup = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [user, loading] = useAuthState(auth);

    useEffect(() => {
        if (user && !loading) {
            navigate('/dashboard');
        }
    }, [user, loading, navigate]);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!name || !email || !password) {
            setError('Please enter name, email, and password.');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password should be at least 6 characters.');
            setIsLoading(false);
            return;
        }

        try {
            const user = await registerWithEmailAndPassword(email, password);
            if (user) {
                await updateProfile(user, {
                    displayName: name
                });
                await incrementUserCount();
            }
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Signup error:', err);
            let message = 'Failed to create account. Please try again.';

            switch (err.code) {
                case 'auth/email-already-in-use':
                    message = 'An account with this email already exists. Please log in instead.';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address format.';
                    break;
                case 'auth/weak-password':
                    message = 'Password should be at least 6 characters.';
                    break;
                case 'auth/network-request-failed':
                    message = 'Network error. Please check your internet connection.';
                    break;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            await signInWithGoogle();
            // Note: We might want to increment user count for Google signups too, 
            // but it's harder to distinguish new vs returning users without checking DB.
            // For now, we'll leave it as is or could check if user creation time is recent.
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to sign in with Google:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout illustration="/auth2.png">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your details below to create your account
                </p>
            </div>
            <div className="grid gap-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    type="text"
                                    autoCapitalize="words"
                                    autoComplete="name"
                                    autoCorrect="off"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 rounded-full bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all duration-200"
                                />
                            </div>
                        </div>
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
                                    className="pl-10 rounded-full bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all duration-200"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    placeholder="••••••••"
                                    type="password"
                                    autoCapitalize="none"
                                    autoComplete="new-password"
                                    autoCorrect="off"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 rounded-full bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all duration-200"
                                />
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <Button disabled={isLoading} className="w-full rounded-full h-11 font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                            {isLoading ? (
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                                'Sign Up with Email'
                            )}
                        </Button>
                    </div>
                </form>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>
                <Button
                    variant="outline"
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full rounded-full h-11 font-medium border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-200 group"
                >
                    {isLoading ? (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                        <svg className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    Continue with Google
                </Button>
                <p className="px-8 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                        Sign In
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Signup;
