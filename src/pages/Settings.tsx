import { useState } from 'react';
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
import { Database, HelpCircle, Upload, Download, Trash2, Github, Save } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AutoSaveToggle } from '../components/AutoSaveToggle';

import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getUserProfile, addCredits } from '@/lib/user-service';
import { Sparkles, CreditCard } from 'lucide-react';
import { useEffect } from 'react';

const Settings = () => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [user, loading] = useAuthState(auth);

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
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-transparent p-4 hidden md:flex items-center justify-between flex-shrink-0 no-print h-16 sticky top-0 z-10">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <div className="flex items-center gap-4">
          <UserNav />
        </div>
      </header>
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
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

          {/* AI Credits Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground ml-1">AI Credits</h2>
            <Card className={cardClasses}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI Usage & Credits
                </CardTitle>
                <CardDescription>Manage your credits for AI generation features.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available Credits</p>
                    <h3 className="text-3xl font-bold text-primary">{credits !== null ? credits : '...'}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Free Plan includes 5 initial credits.</p>
                    <p className="text-xs text-muted-foreground">1 Generation = 1 Credit</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1" onClick={() => handleBuyCredits(10, '$4.99')}>
                    <div className="flex items-center gap-2 w-full">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-semibold">Buy 10 Credits</span>
                      <span className="ml-auto text-sm text-muted-foreground">$4.99</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Perfect for a few resumes.</p>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1" onClick={() => handleBuyCredits(50, '$19.99')}>
                    <div className="flex items-center gap-2 w-full">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-semibold">Buy 50 Credits</span>
                      <span className="ml-auto text-sm text-muted-foreground">$19.99</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Best value for power users.</p>
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground italic">
                  * This is a demo payment system. No actual money will be charged.
                </p>
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
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://github.com/vedantwankhade123/biocv" target="_blank" rel="noopener noreferrer">
                    <Github className="h-5 w-5 text-muted-foreground" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
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
    </div>
  );
};

export default Settings;