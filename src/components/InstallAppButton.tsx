import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function InstallAppButton() {
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Check if app is installed (standalone mode or navigator.standalone for iOS)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    setInstalled(isStandalone);

    const onBefore = (e: any) => { 
      e.preventDefault(); 
      setDeferred(e); 
    };
    const onInstalled = () => setInstalled(true);
    
    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled', onInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Don't show if already installed
  if (installed) return null;

  const handleInstallClick = async () => {
    if (deferred) {
      // Native install prompt available
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome !== 'dismissed') {
        setDeferred(null);
      }
    } else {
      // Show help dialog for browsers without native support
      setShowDialog(true);
    }
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isFirefox = userAgent.includes('firefox');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    const isIOS = /ipad|iphone|ipod/.test(userAgent);
    const isMac = userAgent.includes('mac');

    if (isIOS) {
      return {
        title: "Install on iOS",
        steps: [
          "1. Tap the Share button (square with arrow) in Safari",
          "2. Scroll down and tap 'Add to Home Screen'",
          "3. Tap 'Add' to install the app"
        ]
      };
    } else if (isSafari && isMac) {
      return {
        title: "Install on macOS Safari",
        steps: [
          "1. Click 'File' in the menu bar",
          "2. Select 'Add to Dock'",
          "3. The app will be added to your Dock"
        ]
      };
    } else if (isFirefox) {
      return {
        title: "Firefox Installation",
        steps: [
          "Firefox desktop doesn't support PWA installation",
          "On Android: Use the menu (⋮) and select 'Install'",
          "Consider using Chrome or Edge for desktop installation"
        ]
      };
    } else {
      return {
        title: "Install App",
        steps: [
          "1. Look for an install icon in your browser's address bar",
          "2. Or check your browser's menu for 'Install App' option",
          "3. Follow the prompts to install"
        ]
      };
    }
  };

  const instructions = getBrowserInstructions();

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <button
          className="rounded-full px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={handleInstallClick}
        >
          Install App
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{instructions.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              {instructions.steps.map((step, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  {step}
                </p>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>
        <Button 
          onClick={() => setShowDialog(false)}
          className="mt-4"
        >
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
}