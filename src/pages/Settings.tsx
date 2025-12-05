import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { deleteAllResumes, getResumes } from '@/lib/resume-storage';
import { showError, showSuccess } from '@/utils/toast';
import { UserNav } from '@/components/UserNav';
import { Database, HelpCircle, Upload, Download, Trash2, Github, Save, Mic, Volume2, Globe, Timer, Share2, FileText, MessageCircle, Heart, Zap, ShieldAlert } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AutoSaveToggle } from '../components/AutoSaveToggle';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, addCredits, togglePersonalApiKeyPreference, deleteUserAccount } from '@/lib/user-service';
import { Sparkles, CreditCard } from 'lucide-react';
import { getAutoSaveSettings, updateInterviewSettings } from '@/lib/settings';
import { Key, QrCode } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { CreditHistoryDialog } from '@/components/CreditHistoryDialog';
import { CreditRulesDialog } from '@/components/CreditRulesDialog';
import { CreditTransaction } from '@/types/user';

const Settings = () => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  // Settings state
  const [interviewSettings, setInterviewSettings] = useState({
    interviewTTS: true,
    defaultLanguage: 'english',
    silenceDuration: 5000
  });

  useEffect(() => {
    const settings = getAutoSaveSettings();
    setInterviewSettings({
      interviewTTS: settings.interviewTTS,
      defaultLanguage: settings.defaultLanguage || 'english',
      silenceDuration: settings.silenceDuration || 5000
    });
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsApiKeySaved(true);
    }
  }, []);

  const [apiKey, setApiKey] = useState('');
  const [isApiKeySaved, setIsApiKeySaved] = useState(false);
  // Initialize from localStorage to prevent flickering
  const [usePersonalKey, setUsePersonalKey] = useState(() => {
    return localStorage.getItem('always_use_personal_key') === 'true';
  });
  const [credits, setCredits] = useState<number | null>(null);
  const [nextResetDate, setNextResetDate] = useState<string>('');
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('gemini_api_key', apiKey);
    setIsApiKeySaved(true);
    showSuccess("API Key saved successfully!");
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsApiKeySaved(false);
    showSuccess("API Key removed.");
  };

  const handleInterviewSettingChange = (key: string, value: any) => {
    setInterviewSettings(prev => ({ ...prev, [key]: value }));
    updateInterviewSettings({ [key]: value });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const userName = user?.displayName || 'Open User';
  const userEmail = user?.email || 'No email';

  useEffect(() => {
    if (user) {
      getUserProfile(user).then(profile => {
        setCredits(profile.credits);

        // If profile has a preference, use it and sync local storage
        if (profile.usePersonalApiKey !== undefined) {
          setUsePersonalKey(profile.usePersonalApiKey);
          localStorage.setItem('always_use_personal_key', String(profile.usePersonalApiKey));
        }

        // Calculate next reset date
        const lastReset = profile.lastCreditReset || profile.createdAt;
        const nextReset = new Date(lastReset + (30 * 24 * 60 * 60 * 1000));
        setNextResetDate(nextReset.toLocaleDateString());

        // Set history
        setCreditHistory(profile.creditHistory || []);
      });
    }
  }, [user]);

  const handleTogglePersonalKey = async (checked: boolean) => {
    if (!user) return;
    setUsePersonalKey(checked);
    localStorage.setItem('always_use_personal_key', String(checked));
    await togglePersonalApiKeyPreference(user.uid, checked);
    if (checked) {
      showSuccess("Now prioritizing your personal API key.");
    } else {
      showSuccess("Now using free credits first.");
    }
  };

  const handleBuyCredits = async (amount: number, cost: string) => {
    if (!user) return;
    showSuccess(`Processing payment of ${cost}...`);
    // Simulate payment delay
    setTimeout(async () => {
      await addCredits(user.uid, amount);
      setCredits(prev => (prev || 0) + amount);
      showSuccess(`Successfully purchased ${amount} credits!`);
    }, 1500);
  };

  const handleDeleteAll = () => {
    try {
      deleteAllResumes();
      showSuccess("All resumes have been deleted.");
    } catch (error) {
      showError("Failed to delete resumes.");
    }
    setIsAlertOpen(false);
  };

  const handleExportData = () => {
    try {
      const resumes = getResumes();
      const dataStr = JSON.stringify(resumes, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'neucv_resumes_backup.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess("Data exported successfully!");
    } catch (error) {
      showError("Failed to export data.");
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Invalid file content");
        }
        const resumes = JSON.parse(text);
        if (Array.isArray(resumes) && resumes.every(r => r.id && r.title)) {
          localStorage.setItem('resumes', JSON.stringify(resumes));
          showSuccess("Data imported successfully! The page will now refresh.");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          throw new Error("Invalid JSON format for resumes.");
        }
      } catch (error) {
        showError("Failed to import data. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const triggerImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => handleImportData(e as unknown as React.ChangeEvent<HTMLInputElement>);
    input.click();
  };

  // Using standard shadcn card classes
  const cardClasses = "shadow-sm";

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    try {
      // Clear local data
      deleteAllResumes();
      localStorage.removeItem('gemini_api_key');
      localStorage.removeItem('always_use_personal_key');
      const welcomeKey = `welcomeCreditsShown:${user.uid}`;
      localStorage.removeItem(welcomeKey);

      // Remove Firestore profile
      await deleteUserAccount(user.uid);

      // Remove auth user
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      showSuccess("Account deleted. We're signing you out.");
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 800);
    } catch (error: any) {
      console.error('Failed to delete account', error);
      showError(error?.message || "Failed to delete account. Please re-authenticate and try again.");
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteAccountOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <header className="bg-transparent p-4 hidden md:block flex-shrink-0 no-print h-16 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'NeuCV - AI Resume Builder',
                    text: 'Check out this amazing free AI Resume Builder!',
                    url: window.location.origin
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.origin);
                }
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Heart className="h-4 w-4 text-red-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Support the Project</h4>
                    <p className="text-xs text-muted-foreground">Your contributions help keep this project free!</p>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white p-3 rounded-lg border">
                      <img src="/QR CODE.jpg" alt="UPI QR Code" className="w-32 h-32 object-contain" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-semibold text-sm">Vedant Wankhade</p>
                      <p className="text-xs text-muted-foreground">UPI: 9175988560@kotak811</p>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-grow p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Profile Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground ml-1">Account</h2>
            <Card className={cardClasses}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                    <AvatarFallback className="text-2xl">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <h3 className="text-2xl font-semibold">{userName}</h3>
                    <p className="text-muted-foreground">{userEmail}</p>
                    <div className="pt-2">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                        Free Plan
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" disabled>Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Credits & Usage Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground ml-1">Credits & Usage</h2>
            <Card className={cardClasses}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                        <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Monthly Free Credits</h3>
                        <p className="text-sm text-muted-foreground">Resets on {nextResetDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{credits !== null ? credits : '-'}</div>
                      <p className="text-xs text-muted-foreground">credits remaining</p>
                      <div className="mt-2">
                        <CreditHistoryDialog transactions={creditHistory} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <span className="font-semibold text-base">Resume AI Task</span>
                        </div>
                        <div className="text-slate-400 text-xs">Generates summaries, skills, and improvements.</div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-bold text-lg">1 Credit</span>
                        <CreditRulesDialog mode="resume" trigger={
                          <Button variant="secondary" size="sm" className="h-7 text-xs">View Details</Button>
                        } />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="h-4 w-4 text-purple-400" />
                          <span className="font-semibold text-base">Interview Session</span>
                        </div>
                        <div className="text-slate-400 text-xs">Complete interview practice with AI feedback.</div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-bold text-lg">5 Credits</span>
                        <CreditRulesDialog mode="interview" trigger={
                          <Button variant="secondary" size="sm" className="h-7 text-xs">View Details</Button>
                        } />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Configuration Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground ml-1">AI Configuration</h2>
            <Card className={cardClasses}>
              <CardHeader className="pb-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                        <Key className="h-5 w-5 text-white" />
                      </div>
                      Google Gemini API Key
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="use-personal-key" className="text-sm font-medium cursor-pointer">
                        Use Key
                      </Label>
                      <Switch
                        id="use-personal-key"
                        checked={usePersonalKey}
                        onCheckedChange={handleTogglePersonalKey}
                      />
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    Add your own API key to unlock unlimited usage or when you run out of credits
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Key Input */}
                <div className="space-y-3">
                  <Label htmlFor="api-key" className="text-sm font-medium">Your API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="api-key"
                        type="password"
                        placeholder="AIza..."
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setIsApiKeySaved(false);
                        }}
                        className="font-mono text-sm pr-10"
                      />
                      {apiKey && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isApiKeySaved ? (
                            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleSaveApiKey}
                      disabled={!apiKey.trim() || isApiKeySaved}
                      className={isApiKeySaved ? "bg-green-600 hover:bg-green-600 min-w-[100px]" : "min-w-[100px]"}
                    >
                      {isApiKeySaved ? (
                        <>
                          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Saved
                        </>
                      ) : "Save Key"}
                    </Button>
                    {localStorage.getItem('gemini_api_key') && (
                      <Button variant="outline" onClick={handleClearApiKey} className="min-w-[80px]">
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Your key is encrypted and stored locally in your browser. It's never sent to our servers.</span>
                  </div>
                </div>

                <Separator />

                {/* Get API Key Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500 rounded-lg flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div>
                        <h4 className="text-sm font-semibold mb-1" style={{ color: '#1e3a8a' }}>
                          Don't have an API key yet?
                        </h4>
                        <p className="text-xs" style={{ color: '#1e3a8a' }}>
                          Get your free Google Gemini API key in less than 2 minutes
                        </p>
                      </div>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Get Free API Key
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <h5 className="text-sm font-semibold" style={{ color: '#581c87' }}>Resume AI</h5>
                    </div>
                    <ul className="text-xs space-y-1 ml-6 list-disc" style={{ color: '#581c87' }}>
                      <li>Generate summaries</li>
                      <li>Enhance descriptions</li>
                      <li>Suggest skills</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <h5 className="text-sm font-semibold" style={{ color: '#14532d' }}>Interview Coach</h5>
                    </div>
                    <ul className="text-xs space-y-1 ml-6 list-disc" style={{ color: '#14532d' }}>
                      <li>Practice interviews</li>
                      <li>Get AI feedback</li>
                      <li>Improve answers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interview Coach Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground ml-1">Interview Coach</h2>
            <Card className={cardClasses}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-muted-foreground" />
                  Voice & Interaction
                </CardTitle>
                <CardDescription>Configure how the AI interviewer interacts with you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Volume2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="interview-tts" className="text-base font-medium cursor-pointer">
                        AI Voice (Text-to-Speech)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Read interview questions aloud
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="interview-tts"
                    checked={interviewSettings.interviewTTS}
                    onCheckedChange={(checked) => handleInterviewSettingChange('interviewTTS', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Timer className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-0.5 w-full">
                      <Label htmlFor="silence-duration" className="text-base font-medium">
                        Auto-Stop Microphone (Silence)
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Stop recording after detecting silence for: <strong>{interviewSettings.silenceDuration / 1000}s</strong>
                      </p>
                      <Slider
                        id="silence-duration"
                        min={2000}
                        max={10000}
                        step={500}
                        value={[interviewSettings.silenceDuration]}
                        onValueChange={(val) => handleInterviewSettingChange('silenceDuration', val[0])}
                        className="w-full max-w-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="default-language" className="text-base font-medium">
                        Default Interview Language
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Set your preferred language for new interview sessions
                      </p>
                    </div>
                  </div>
                  <Select
                    value={interviewSettings.defaultLanguage}
                    onValueChange={(value) => handleInterviewSettingChange('defaultLanguage', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hinglish">Hinglish</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="marathi">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>



          {/* Contribute Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground ml-1">Support Development</h2>
            <Card className={cardClasses}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Contribute
                </CardTitle>
                <CardDescription>
                  This project is free and open source. If you find it useful, consider supporting the developer.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-6 items-center">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <img src="/QR CODE.jpg" alt="UPI QR Code" className="w-48 h-48 object-contain rounded-lg border-2 border-slate-100" />
                </div>
                <div className="space-y-4 text-center md:text-left">
                  <div>
                    <h4 className="font-semibold">Vedant Wankhade</h4>
                    <p className="text-sm text-muted-foreground">UPI ID: 9175988560@kotak811</p>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Your contributions help cover server costs and keep the project alive. Thank you!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Auto-Save Preferences Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground ml-1">Editor Preferences</h2>
            <Card className={cardClasses}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5 text-muted-foreground" />
                  Auto-Save Settings
                </CardTitle>
                <CardDescription>Control automatic saving for your documents while editing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AutoSaveToggle />
              </CardContent>
            </Card>
          </div>

          {/* Data Management Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground ml-1">Data & Storage</h2>
            <Card className={cardClasses}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  Data Management
                </CardTitle>
                <CardDescription>Control your local data. Export for backup or import from a previous session.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group" onClick={handleExportData}>
                    <div className="flex items-center justify-between mb-2">
                      <Download className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="font-medium">Export Data</h4>
                    <p className="text-sm text-muted-foreground">Save all resumes as a JSON file.</p>
                  </div>
                  <div className="p-4 border rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group" onClick={triggerImport}>
                    <div className="flex items-center justify-between mb-2">
                      <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="font-medium">Import Data</h4>
                    <p className="text-sm text-muted-foreground">Restore resumes from a backup.</p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-xl">
                    <div>
                      <h4 className="font-medium text-destructive">Danger Zone</h4>
                      <p className="text-sm text-muted-foreground">Permanently delete all local data.</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => setIsAlertOpen(true)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete All
                    </Button>
                  </div>
                  <div className="p-4 border border-destructive/30 bg-white rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-destructive">Delete account permanently</h4>
                        <p className="text-sm text-muted-foreground">Remove your account, profile, and local data. This cannot be undone.</p>
                      </div>
                    </div>
                    <Button variant="destructive" onClick={() => setIsDeleteAccountOpen(true)} disabled={isDeletingAccount}>
                      {isDeletingAccount ? "Deleting..." : "Delete Account"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground ml-1">About</h2>
            <Card className={cardClasses}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-muted p-3 rounded-full">
                    <HelpCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">NEUCV</h4>
                    <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </main >
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your resume data from this browser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, delete everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account, profile, and local data. You may need to re-authenticate to confirm this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAccount}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? "Deleting..." : "Yes, delete my account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};

export default Settings;