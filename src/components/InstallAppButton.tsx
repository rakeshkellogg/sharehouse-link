import { useEffect, useState } from 'react';

export default function InstallAppButton() {
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(window.matchMedia('(display-mode: standalone)').matches);

  useEffect(() => {
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

  if (installed || !deferred) return null;

  return (
    <button
      className="rounded-full px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      onClick={async () => {
        deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome !== 'dismissed') {
          setDeferred(null);
        }
      }}
    >
      Install App
    </button>
  );
}