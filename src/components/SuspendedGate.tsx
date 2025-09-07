import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Mail } from 'lucide-react';

interface SuspendedGateProps {
  children: React.ReactNode;
}

const SuspendedGate: React.FC<SuspendedGateProps> = ({ children }) => {
  const { user, loading, isSuspended, suspensionLoading, signOut } = useAuth();

  // Show loading state
  if (loading || suspensionLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show suspension screen if user is suspended
  if (user && isSuspended) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Account Not Available
                </h1>
                <p className="text-muted-foreground">
                  Your account has been suspended. Please contact support for assistance.
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('mailto:support@lovable.dev', '_blank')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                
                <Button
                  variant="default"
                  className="w-full"
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render children normally
  return <>{children}</>;
};

export default SuspendedGate;