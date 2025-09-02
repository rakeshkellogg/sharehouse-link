import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const UsernameOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const handleUsernameChange = (value: string) => {
    // Only allow alphanumeric characters, underscores, and hyphens
    const sanitized = value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    setUsername(sanitized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (username.length < 3) {
      toast({
        title: "Username Too Short",
        description: "Username must be at least 3 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if username is available
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('username, user_id')
        .eq('username', username)
        .maybeSingle();
      
      if (checkError) {
        throw new Error('Failed to check username availability');
      }
      
      if (existingProfile && existingProfile.user_id !== user.id) {
        toast({
          title: "Username Taken",
          description: "This username is already taken. Please choose another one.",
          variant: "destructive",
        });
        return;
      }
      
      // Create or update the user's profile with the username
      const { error } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, username }, { onConflict: 'user_id' });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Username Set!",
        description: "Your username has been successfully set.",
      });
      
      navigate('/');
      
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to set username. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="bg-white/95 backdrop-blur-sm shadow-hero border-0">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-real-estate-neutral">
              Choose Your Username
            </CardTitle>
            <CardDescription className="text-base text-real-estate-neutral/70">
              Pick a unique username to complete your profile setup
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">@</span>
                  <Input
                    id="username"
                    type="text"
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className="pl-8"
                    required
                    minLength={3}
                    maxLength={30}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  3-30 characters. Only letters, numbers, underscores, and hyphens allowed.
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || username.length < 3}
              >
                {isSubmitting ? "Setting Up..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsernameOnboarding;