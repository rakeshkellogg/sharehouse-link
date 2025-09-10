import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BlockUserButtonProps {
  targetUserId: string;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
}

const BlockUserButton: React.FC<BlockUserButtonProps> = ({ 
  targetUserId, 
  triggerText, 
  triggerVariant = "outline" 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    checkBlockStatus();
  }, [user, targetUserId]);

  const checkBlockStatus = async () => {
    if (!user || user.id === targetUserId) {
      setIsCheckingStatus(false);
      return;
    }

    try {
      // Use normalized pair checking with the new schema
      const { data, error } = await supabase
        .from('user_blocks')
        .select('id')
        .eq('user_a', user.id < targetUserId ? user.id : targetUserId)
        .eq('user_b', user.id < targetUserId ? targetUserId : user.id)
        .is('removed_at', null)
        .maybeSingle();

      if (error) throw error;
      setIsBlocked(!!data);
    } catch (error) {
      console.error('Error checking block status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleBlock = async () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to block users.",
        variant: "destructive"
      });
      return;
    }

    if (user.id === targetUserId) {
      toast({
        title: "Invalid Action",
        description: "You cannot block yourself.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Insert with normalized pair (smaller ID first)
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          user_a: user.id < targetUserId ? user.id : targetUserId,
          user_b: user.id < targetUserId ? targetUserId : user.id,
          created_by: user.id,
          reason: 'User initiated block'
        });

      if (error) {
        console.error('Block insertion error:', error);
        throw error;
      }

      setIsBlocked(true);
      toast({
        title: "User Blocked",
        description: "You will no longer be able to send messages to each other.",
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Soft delete by setting removed_at timestamp
      const { error } = await supabase
        .from('user_blocks')
        .update({ removed_at: new Date().toISOString() })
        .eq('user_a', user.id < targetUserId ? user.id : targetUserId)
        .eq('user_b', user.id < targetUserId ? targetUserId : user.id)
        .is('removed_at', null);

      if (error) {
        console.error('Unblock update error:', error);
        throw error;
      }

      setIsBlocked(false);
      toast({
        title: "User Unblocked",
        description: "You can now send messages to each other again.",
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.id === targetUserId || isCheckingStatus) {
    return null;
  }

  const buttonText = triggerText || (isBlocked ? "Unblock User" : "Block User");

  if (isBlocked) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="secondary" size="sm" disabled={isLoading}>
            <ShieldOff className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will allow you and this user to send messages to each other again. 
              You can block them again at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock} disabled={isLoading}>
              {isLoading ? "Unblocking..." : "Unblock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={triggerVariant} size="sm" disabled={isLoading}>
          <Shield className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block User?</AlertDialogTitle>
          <AlertDialogDescription>
            This will prevent you and this user from sending messages to each other. 
            You can unblock them at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBlock} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
            {isLoading ? "Blocking..." : "Block User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BlockUserButton;