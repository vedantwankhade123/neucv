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
import { deleteAllResumes, getResumes } from '@/lib/resume-storage';
import { showError, showSuccess } from '@/utils/toast';
import { UserNav } from '@/components/UserNav';
import { Database, HelpCircle, Upload, Download, Trash2, Github, Save, Mic, Volume2, Globe, Timer } from 'lucide-react';
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
import { getUserProfile, addCredits } from '@/lib/user-service';
import { Sparkles, CreditCard } from 'lucide-react';
import { getAutoSaveSettings, updateInterviewSettings } from '@/lib/settings';
import { Key, Heart, QrCode } from 'lucide-react';
import { Input } from "@/components/ui/input";

const Settings = () => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [user, loading] = useAuthState(auth);

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
    if (savedKey) setApiKey(savedKey);
  }, []);

  const [apiKey, setApiKey] = useState('');

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    showSuccess("API Key saved successfully! Please refresh the page.");
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    showSuccess("API Key removed. Using default quota.");
    setTimeout(() => window.location.reload(), 1500);
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
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user).then(profile => setCredits(profile.credits));
    }
  }, [user]);

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

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <header className="bg-transparent p-4 hidden md:block flex-shrink-0 no-print h-16 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <div className="flex items-center gap-4">
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



          {/* AI Configuration Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground ml-1">AI Configuration</h2>
            <Card className={cardClasses}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  Bring Your Own Key (BYOK)
                </CardTitle>
                <CardDescription>
                  <strong>Required:</strong> Add your own Google Gemini API Key to use all AI features.
                  <br />
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Get a free key here
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Paste your Gemini API Key here"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button onClick={handleSaveApiKey}>Save Key</Button>
                  {localStorage.getItem('gemini_api_key') && (
                    <Button variant="outline" onClick={handleClearApiKey}>Clear</Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your key is stored locally in your browser and never sent to our servers.
                </p>
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

                <div className="pt-4 border-t">
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
    </div >
  );
};

export default Settings;