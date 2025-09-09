import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ 
    onRegistered: () => {
      console.log('SW Registered');
    }, 
    onRegisterError: (error) => {
      console.log('SW registration error:', error);
    } 
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background shadow-lg border border-border rounded-full px-4 py-2 flex items-center gap-3">
      <span className="text-foreground text-sm">New version available.</span>
      <button
        onClick={() => updateServiceWorker(true).then(() => setNeedRefresh(false))}
        className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}